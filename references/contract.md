# Output contract & scope

Load at handoff.

## Handoff contract

Every Anvil handoff should answer:

- **Boundary:** one target, kind, scope, and caller profile
- **Contract ledger:** public surfaces preserved, added, changed, deprecated, removed, or moved
- **Obligations:** what the boundary now guarantees, and anything intentionally deferred
- **Verification:** commands/evidence run, result, and checks not run
- **Residual risk:** unresolved P2s, missing evidence, or approvals still needed

## Scope rules

- One target per run in monorepos unless the user explicitly names multiple targets.
- Use semantic backend names: `RESOURCE_NOT_FOUND`, `/v1/invoices`, `internal/retry`; avoid `err1`, `/api/data`, `internal/util`.
- Do not implement business rules, billing logic, auth providers, DB schema design, Kubernetes/Terraform, or frontend UI as part of Anvil unless the user separately asks.
- If domain work is requested, apply Anvil only to the backend surface/structure that domain work touches.

## Required backend behavior

- **Errors:** one public envelope per service/binary; map internal errors at boundaries; never leak stack traces/module paths unless explicitly allowed for an authenticated internal-admin surface.
- **Config:** document precedence and env vars in `conventions.yaml`, `anvil.md`, OpenAPI/proto/docs, or help.
- **CLI:** stdout for data, stderr for diagnostics/progress; no prompts on default unattended paths; stable machine output when promised.
- **REST:** OpenAPI matches handlers; error schemas stable; request IDs propagate into errors/logs.
- **gRPC:** proto is source of truth; status-code map is documented; health/reflection/cancellation are intentional.
- **Package:** public exports are deliberate; deprecations have milestones; shared packages do not import feature packages.
- **Structure:** layout family is named; bucket packages are flagged; dead-code deletions require approval.

## Stamp

Use a stamp where it helps future audits. Prefer comments in entrypoint/contract files, not random internals.

```go
// Anvil · target: <path> · kind: cli|rest|grpc|package|structure · boundary: <scope>
// callers: <profiles> · pattern: <surface-pattern|none> · risk: <R-classes>
// contracts: <artifact-list> · obligations: <short-list>
```

For structure-scope, the durable record lives in `.anvil/log.json`, `anvil.md`, and `.anvil/*report.md`.

## Artifacts

| Scope | Artifact |
| --- | --- |
| Tool-scope CLI | `conventions.yaml` |
| REST service | `openapi.yaml` or existing OpenAPI file |
| gRPC service | `api/<service>.proto` or existing proto |
| Package API | export/API table in docs or `anvil.md` |
| Structure-scope | `.anvil/sweep-report.md`, layout rule in `anvil.md` |

When `anvil.md` exists, it is the locked convention file. Refresh it instead of creating competing records.
