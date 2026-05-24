# Archetype · BACKEND-01 · Pluggable backend

For CLIs and services where a core capability (search, code search, docs, storage, queue, transport) has multiple interchangeable implementations the user can swap. Reference: `ketch -b brave|ddg|searxng`, `aws --endpoint-url`, `op --account`, `terraform` providers, `kubectl --context`.

## When to pick it

- The same verb (`search`, `read`, `write`, `dispatch`) is implemented by ≥2 providers and the user shouldn't have to learn a different tool for each.
- Providers differ in cost, capability, or availability — the user wants a default with override.
- A given provider may be unavailable in some environments (network policies, missing creds) and the tool should fail-over cleanly.

## Skeleton

### CLI

```
<tool> verb ARG -b <backend-name>      # explicit
<tool> verb ARG                        # uses default backend
<tool> config                          # JSON: lists current backend + available_backends
<tool> backends list                   # optional: machine-readable list
```

### Service (REST / gRPC)

The backend axis becomes either:
- a configured choice at deploy time (env var like `STORAGE_BACKEND=s3|gcs|local`), or
- a request-level header (`X-Backend: …`) — only when callers legitimately need to address specific backends.

Prefer deploy-time configuration. Request-level backend selection leaks implementation into the contract.

## Flag and env shape

| Surface | Convention |
| --- | --- |
| CLI flag | `--backend <name>` (long) · `-b <name>` (short, only when high-frequency) |
| Env var | `<TOOL>_BACKEND=<name>` |
| Config file | `backend: <name>` at top level, or `backends.<verb>: <name>` for per-verb defaults |

Precedence follows CFG-01 (flags > env > file > defaults).

## Introspection contract

The tool **must** expose what backends exist. The canonical shape:

```json
{
  "backend": "searxng",
  "available_backends": ["brave", "ddg", "searxng"],
  "<verb>_backend": "sourcegraph",
  "available_<verb>_backends": ["sourcegraph", "github"]
}
```

Agents read this once to discover the surface. Human operators read it to debug "why is it routing to X?"

When a verb has its own backend axis (e.g. `ketch code` uses `sourcegraph|github`, separate from the web-search backend), namespace it: `code_backend`, `available_code_backends`.

## Backend-specific flags

When a backend requires unique config (a URL, an API key path, a region), namespace the flag with the backend name:

```
ketch search foo -b searxng --searxng-url http://…
ketch search foo -b brave --brave-api-key-env BRAVE_KEY
```

Never use one generic `--url` that means different things per backend.

## Failure surface

| Failure | Behaviour |
| --- | --- |
| Backend unreachable | Exit 4 (upstream). Error names the backend explicitly. |
| Backend not in `available_backends` | Exit 2 (validation). Help message lists valid choices. |
| Default backend unavailable, alternates exist | Do **not** silently fail over. Exit with code 4 + "set `-b <other>` to use an alternate." Silent fallback hides cost / latency / capability differences. |
| All backends unavailable | Exit 4. List each tried with its error. |

If the user explicitly opts in to fallback (`--backend-fallback` flag), the tool may try alternates in declared order, emitting one warning per attempt to stderr.

## REST / gRPC variant

For services with pluggable storage / queue / transport at deploy time:

- Document the backend choice in `/healthz` and `/version`. Don't surface it inside business endpoints unless callers must address it.
- `OpenAPI info.x-anvil-backend`: name the backend currently configured. Ops sees it; client SDKs ignore it.
- For gRPC, add `<service>.GetServerInfo() returns (ServerInfo)` returning `{backend: …, available: […]}`. Don't shoehorn it into every method.

## Conventions artifact

In `conventions.yaml` (CLI):

```yaml
backends:
  default: searxng
  available:
    - name: brave
      requires_env: BRAVE_API_KEY
      flags: [--brave-endpoint]
    - name: ddg
      requires_env: []
    - name: searxng
      requires_env: []
      flags: [--searxng-url]
```

In `anvil.md` for the project, name the chosen backend axis and its contract.

## Anti-patterns

| Tell | Why |
| --- | --- |
| **Hardcoded default no override** | Tool claims to support multiple backends but only the default actually works |
| **Silent fail-over** | Tool tries alternate backends without telling the user; cost / latency drifts invisibly |
| **Backend in URL of every request** | Backend axis leaked into HTTP paths or proto namespaces; clients couple to implementation |
| **Inconsistent flag naming per backend** | `--brave-key` and `--searxng_url` (mixed cases / hyphens / underscores) |
| **`config` omits available_backends** | Agents can't discover capability — they have to read the README every time |

## Slop gates

- **A06** Backend axis present but `config` doesn't list `available_backends` → fail
- **A07** Silent fail-over on unavailable backend → fail
- **U11** Backend-specific flag bleeds into a different backend's invocation → fail

## Studied examples

- **ketch** — exemplary. Six backends across three verbs (web search, code search, docs). `ketch config` lists everything. Backend-specific flags are namespaced (`--searxng-url`, `--sourcegraph-url`).
- **aws** — pattern at scale. `aws s3 ls --endpoint-url https://…` for backend override; `aws configure` for default.
- **op** (1Password) — accounts as backend axis. `op --account work` switches realms.
