# Config

Configuration is the first thing operators adjust and the last thing developers think about. Anvil's stance: **declare the full precedence chain, document every variable, never read secrets from flags.**

---

## CFG-01: Standard precedence (CLI default)

```
CLI flags  >  environment variables  >  config file  >  built-in defaults
```

State this in help text and in `conventions.yaml`. Operators adjust it in order; if a flag doesn't work, they try env; if env doesn't work, they try the config file.

### Implementation (Go / Cobra + Viper)

```go
func init() {
    rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file path")
    rootCmd.PersistentFlags().String("backend", "searxng", "search backend")
    viper.BindPFlag("backend", rootCmd.PersistentFlags().Lookup("backend"))
    viper.SetEnvPrefix("KETCH")
    viper.AutomaticEnv()
}

func initConfig() {
    if cfgFile != "" {
        viper.SetConfigFile(cfgFile)
    } else {
        // Search order: ./config.yaml → $XDG_CONFIG_HOME/ketch/config.yaml → ~/.config/ketch/config.yaml
        viper.AddConfigPath(".")
        viper.AddConfigPath(xdg.ConfigHome + "/ketch")
        viper.SetConfigName("config")
    }
    viper.ReadInConfig()  // silently ok if file absent
}
```

### Config file search order

Document and honour in this order:

1. Explicit path from `--config` flag
2. `./config.yaml` (local override — useful in CI)
3. `$XDG_CONFIG_HOME/<tool>/config.yaml` (Linux standard)
4. `~/.config/<tool>/config.yaml` (macOS fallback)
5. `/etc/<tool>/config.yaml` (system-wide, servers)

On Windows, replace XDG with `%APPDATA%\<Tool>\config.yaml`.

---

## CFG-02: Env-only (12-factor, service default)

For server processes, config comes entirely from environment variables. No config file. No flags (except `--port`, `--log-level` for convenience).

Rationale: containers don't carry config files; orchestrators inject env. Config files in containers are a deployment anti-pattern (they need volume mounts, ConfigMaps, Secrets — env is simpler).

```bash
LEDGER_DB_URL=postgres://…
LEDGER_LOG_LEVEL=info
LEDGER_HTTP_PORT=8080
LEDGER_ENV=production
```

Every environment variable must:
- Have a documented name in `anvil.md` or `conventions.yaml`
- Have a documented default (or be required — `required` must be validated at startup)
- Be listed in the deployment README

### Required vars — validate at startup

```go
func validateConfig(cfg *Config) error {
    var errs []string
    if cfg.DBUrl == "" {
        errs = append(errs, "LEDGER_DB_URL is required")
    }
    if cfg.HTTPPort == 0 {
        errs = append(errs, "LEDGER_HTTP_PORT is required")
    }
    if len(errs) > 0 {
        return fmt.Errorf("missing required config:\n%s", strings.Join(errs, "\n"))
    }
    return nil
}
```

Fail fast at startup with all missing vars listed at once, not one at a time. Operators running containers in a new environment shouldn't need to restart three times to find all missing config.

---

## Env prefix

**Single prefix per binary.** `KETCH_` everywhere, not `KETCH_` for some and `APP_` for others. The prefix makes grepping easy and avoids collisions in shell environments with many tools.

Convention: binary name, screaming snake, trailing underscore. `ledger` → `LEDGER_`. `billing-api` → `BILLING_API_`.

---

## Naming

Env var names mirror the config key hierarchy, separated by `_`:

| Config path | Env var |
| --- | --- |
| `backend` | `KETCH_BACKEND` |
| `database.url` | `LEDGER_DATABASE_URL` |
| `search.backend` | `KETCH_SEARCH_BACKEND` |
| `log.level` | `LEDGER_LOG_LEVEL` |

No camelCase in env vars. All caps, underscores only.

---

## Secrets

**Never read secrets from CLI flags.** Flags show up in `ps aux`, shell history, and process listings. Operators paste them in Slack.

Acceptable sources:
- Environment variable pointing to the **value** directly (`LEDGER_DB_PASSWORD=hunter2`)
- File path in an environment variable (`LEDGER_DB_PASSWORD_FILE=/run/secrets/db_password`) — read the file content at startup
- Secret manager (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager) — fetched at startup via client library

Document which strategy the service uses. Don't mix strategies.

**In help text, document the env var name, not the secret shape:**

```
LEDGER_DB_PASSWORD  Database password (required). Do not set via flag.
```

Never print the value in logs. Redact it explicitly:

```go
slog.Info("config loaded", "db_url", redactPassword(cfg.DBUrl))
```

---

## Pluggable backends in config

When using BACKEND-01:

```yaml
# config.yaml (CFG-01)
backend: searxng
searxng_url: http://172.16.0.10:8081
brave_api_key_env: KETCH_BRAVE_API_KEY  # env var name, not value
```

```bash
# env (CFG-02)
KETCH_BACKEND=brave
KETCH_BRAVE_API_KEY=bsa_live_xxx       # actual key in env
```

Backend-specific config keys are namespaced with the backend name. Never have a generic `api_key` that means different things per backend.

---

## Config introspection

For agent, script, and human-operator caller profiles, provide `config show`:

```
<tool> config
```

Returns the **effective config** — what the tool is actually using after resolving flags > env > file > defaults. JSON output always; no flags needed.

```json
{
  "config_path": "/Users/george/Library/Application Support/ketch/config.json",
  "backend": "searxng",
  "searxng_url": "http://172.16.30.90:8081",
  "available_backends": ["brave", "ddg", "searxng"]
}
```

Secrets are redacted: `"db_password": "***"`.

---

## Feature flags

Feature flags are **not** the same as config. Config changes behaviour for all users; feature flags change behaviour for a subset.

If the brief mentions feature flags:
- Keep them in a separate section of config or in a dedicated flags service
- Document whether flags can be changed at runtime (hot reload) or only at restart
- Any feature flag that has been fully-on for > 3 months with no opt-out is a candidate for removal (convert to permanent behaviour, delete the flag)

Feature flags left permanently disabled are dead code — sweep them.

---

## conventions.yaml config section

```yaml
config:
  precedence: [flags, env, file, defaults]
  env_prefix: KETCH_
  config_paths:
    - "./config.yaml"
    - "$XDG_CONFIG_HOME/ketch/config.yaml"
    - "~/.config/ketch/config.yaml"
    - "/etc/ketch/config.yaml"
  required_env: []          # list for CFG-02 services
  secrets_via: env          # env | file | vault
  vars:
    - name: KETCH_BACKEND
      default: searxng
      description: "Search backend (brave|ddg|searxng)"
    - name: KETCH_SEARXNG_URL
      default: "http://localhost:8081"
      description: "SearXNG instance URL"
    - name: KETCH_LIMIT
      default: "5"
      description: "Default result count"
```

---

## Anti-patterns

| Tell | Why |
| --- | --- |
| **Secrets via flag** | Leaks into `ps`, shell history, CI logs |
| **Mixed env prefixes** (`KETCH_` + `APP_`)** | Operators grep for one prefix; they miss config |
| **Undocumented env vars** | Operators don't know they exist until something breaks |
| **`CONFIG=./prod.yaml` as the only way to configure** | Breaks containerised deployments; env is the container interface |
| **Config file required when empty** | Tool fails to start if `~/.config/tool/config.yaml` doesn't exist — default should be silent |
| **Feature flag that's been off for > 3 months** | Dead code wrapped in a flag |
| **Generic `api_key` shared between backends** | Ambiguous; becomes wrong when the second backend arrives |
