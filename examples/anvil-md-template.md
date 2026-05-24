# anvil.md template — worked examples

Two filled-in `anvil.md` examples showing the current v0.3 convention shape:

1. **`harbor`** — Rust CLI, flat layout, agent/script callers
2. **`payments`** — Python FastAPI REST service, layer-first, SDK/script callers

See [`../references/anvil-md.md`](../references/anvil-md.md) for the canonical format.

---

## 1. harbor CLI

```yaml
# Anvil · locked backend conventions
# Generated: anvil default . (2026-05-24)

target:
  kind: cli
  path: .
  boundary: tool
  binary: harbor

caller_profiles:
  - script
  - agent

surface_pattern:
  name: Verb-Surface
  locked: true

risk_policy:
  default_public_change: R1
  breaking_changes_require_approval: true
  destructive_changes_require_approval: true

contracts:
  artifacts:
    - conventions.yaml
  public_surfaces:
    - surface: "CLI command fetch"
      compatibility: stable
    - surface: "CLI flag --json"
      compatibility: stable machine output
    - surface: "CLI flag --backend"
      compatibility: stable spelling; backend-specific flags scoped

obligations:
  cli:
    version: true
    stdout_data_only: true
    no_prompt_default_path: true
    no_ansi_when_piped: true
    config_introspection: true
    output_formats: [text, json, minimal]
  agent:
    stable_json_keys: true
    bounded_output: [--limit, --max-chars]
    available_backends_in_config: true

config:
  env_prefix: HARBOR_
  precedence: [flags, env, file, defaults]
  config_paths:
    - "./harbor.toml"
    - "$XDG_CONFIG_HOME/harbor/config.toml"
    - "/etc/harbor/config.toml"
  secrets_via: env

errors:
  envelope: ERR-01
  codes:
    - code: VALIDATION
      exit_code: 2
      retryable: false
    - code: NOT_FOUND
      exit_code: 3
      retryable: false
    - code: UPSTREAM_UNAVAILABLE
      exit_code: 4
      retryable: true
      retry_policy: "exponential backoff, 3 attempts, 250ms base"
    - code: CANCELLED
      exit_code: 6
      retryable: false

exit_codes:
  0: success
  1: generic error
  2: validation / bad input
  3: not found
  4: upstream / network
  6: cancelled

layout:
  family: flat
  rule: "Single binary crate. Split into named capability modules only when one concern grows."
  forbidden:
    - "src/util.rs — no bucket modules"

shared_packages: []

verification:
  required:
    - "`harbor --help`"
    - "`harbor --version`"
    - "`NO_COLOR=1 harbor --help | cat`"
    - "`harbor fetch demo --json | jq type`"
    - "`cargo test`"

provenance:
  source: author defined
  generated: "2026-05-24"
  anvil_version: "0.3.0"
```

---

## 2. payments REST service

```yaml
# Anvil · locked backend conventions
# Generated: anvil default services/payments (2026-05-24)

target:
  kind: rest
  path: services/payments
  boundary: service

caller_profiles:
  - script
  - sdk-client

surface_pattern:
  name: Namespace Versioned
  locked: true

risk_policy:
  default_public_change: R1
  breaking_changes_require_approval: true
  destructive_changes_require_approval: true

contracts:
  artifacts:
    - openapi.yaml
  public_surfaces:
    - surface: "POST /v1/charges"
      compatibility: stable
    - surface: "GET /v1/charges/{id}"
      compatibility: stable
    - surface: "ProblemDetails"
      compatibility: stable error envelope

obligations:
  rest:
    openapi_sync: true
    request_id: true
    health: [/healthz, /readyz]
    graceful_shutdown: true
    error_envelope: ERR-02
    idempotency_for_creates: true

config:
  env_prefix: PAYMENTS_
  precedence: [env, defaults]
  secrets_via: env

errors:
  envelope: ERR-02
  type_base_uri: "https://errors.payments.example"
  codes:
    - code: PAYMENT_DECLINED
      type_suffix: payment-declined
      http_status: 402
      retryable: false
    - code: IDEMPOTENCY_CONFLICT
      type_suffix: idempotency-conflict
      http_status: 409
      retryable: false
    - code: VALIDATION
      type_suffix: validation
      http_status: 400
      retryable: false
    - code: UPSTREAM_UNAVAILABLE
      type_suffix: upstream-unavailable
      http_status: 503
      retryable: true

log_fields:
  - request_id
  - method
  - status_code
  - duration_ms
  - error_code

layout:
  family: layer-first
  rule: "New code lives under app/<layer>/; imports flow api -> services -> repositories -> models."
  forbidden:
    - "app/utils/ — no bucket packages"
    - "app/common/ — no bucket packages"

shared_packages:
  - name: idempotency
    path: app/lib/idempotency
    purpose: "Idempotency-Key middleware and storage adapter."
    callers: [app/api, app/workers]

verification:
  required:
    - "`python -m pytest`"
    - "OpenAPI route sync"
    - "ProblemDetails contract test"
    - "request-id propagation test"

provenance:
  source: author defined
  generated: "2026-05-24"
  anvil_version: "0.3.0"
```
