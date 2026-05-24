# Archetype index

Composable surface patterns. In v0.3 these are optional implementation aids, not the center of the flow. Use them after the boundary inventory, risk classification, contract ledger, and obligations are clear.

Archetypes are orthogonal to caller profile and surface pattern. Pick only the pieces the boundary actually needs.

## Errors (ERR)

| Code | Name | File |
| --- | --- | --- |
| ERR-01 | Code + message JSON | [`archetypes/err-01-code-message.md`](archetypes/err-01-code-message.md) |
| ERR-02 | Problem Details (RFC 7807) | [`archetypes/err-02-problem-details.md`](archetypes/err-02-problem-details.md) |
| ERR-03 | gRPC rich status + ErrorInfo | [`archetypes/err-03-grpc-rich.md`](archetypes/err-03-grpc-rich.md) |

## Config (CFG)

| Code | Name | File |
| --- | --- | --- |
| CFG-01 | flags → env → file → defaults | [`archetypes/cfg-01-standard-precedence.md`](archetypes/cfg-01-standard-precedence.md) |
| CFG-02 | env-only (12-factor) | `archetypes/cfg-02-env-only.md` |

## Health (HEALTH)

| Code | Name | File |
| --- | --- | --- |
| HEALTH-01 | Liveness + readiness split | [`archetypes/health-01-split.md`](archetypes/health-01-split.md) |
| HEALTH-02 | gRPC health + serving deps | `archetypes/health-02-grpc.md` |

## Middleware order (MW) — REST/gRPC

| Code | Name | File |
| --- | --- | --- |
| MW-01 | request-id → auth → log → handler | `archetypes/mw-01-standard.md` |

## Help (HELP) — CLI

| Code | Name | File |
| --- | --- | --- |
| HELP-01 | Examples section per leaf command | `archetypes/help-01-examples.md` |

## Backend (BACKEND)

| Code | Name | File |
| --- | --- | --- |
| BACKEND-01 | Pluggable backend with introspectable config | [`archetypes/backend-01-pluggable.md`](archetypes/backend-01-pluggable.md) |

## Async / long-running (ASYNC)

| Code | Name | File |
| --- | --- | --- |
| ASYNC-01 | Background + handle (id, status, stop) | [`archetypes/async-01-background-handle.md`](archetypes/async-01-background-handle.md) |

## Output (OUT) — CLI

| Code | Name | File |
| --- | --- | --- |
| OUT-01 | Text-default · `--json` · `--minimal` trio | `archetypes/out-01-format-trio.md` |

---

## Caller profile → archetype routing

Pick from the **prefer** column first; reach for alternates only when evidence or caller obligations require it.

### CLI

| Caller profile | Errors | Config | Help | Async | Backend | Output |
| --- | --- | --- | --- | --- | --- | --- |
| **agent** | ERR-01 + structured stderr | CFG-01 | HELP-01 (with pipe examples) | ASYNC-01 | BACKEND-01 (when plural) | OUT-01 trio |
| human-operator | ERR-01 | CFG-01 | HELP-01 | ASYNC-01 | BACKEND-01 (when ops needs it) | text + json |
| script | ERR-01 | CFG-01 | HELP-01 | — (rare) | — (rare) | text + json |
| sdk-client | ERR-01 friendly | CFG-01 | HELP-01 narrative | — | — | text default |
| internal-admin | ERR-01 | CFG-02 | HELP-01 dense | ASYNC-01 (for batch ops) | — | text + json |

### REST

| Caller profile | Errors | Config | Health | Middleware |
| --- | --- | --- | --- | --- |
| **agent** | ERR-02 | CFG-02 | HEALTH-01 | MW-01 |
| human-operator | ERR-02 | CFG-01 | HEALTH-01 | MW-01 |
| script | ERR-02 | CFG-01 | HEALTH-01 | MW-01 |
| sdk-client | ERR-02 friendly | CFG-01 | HEALTH-01 | MW-01 |
| internal-admin | ERR-01 / ERR-02 | CFG-02 | HEALTH-01 | MW-01 |

### gRPC

| Caller profile | Errors | Health | Async |
| --- | --- | --- | --- |
| **agent** | ERR-03 | HEALTH-02 | ASYNC-01 (LRO) |
| human-operator | ERR-03 | HEALTH-02 | ASYNC-01 |
| script | ERR-03 | HEALTH-02 | — |
| sdk-client | ERR-03 | HEALTH-02 | — |
| internal-admin | ERR-03 | HEALTH-02 | ASYNC-01 |

---

## Stub policy

Files marked as stubs (`cfg-02-env-only.md`, `health-02-grpc.md`, `mw-01-standard.md`, `help-01-examples.md`, `out-01-format-trio.md`) are accepted deferrals. When a build needs a stub archetype, use the index entry as the contract and let the caller-profile obligations plus the convention file provide the detail.
