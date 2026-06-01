# Caller profile · internal-admin

Caller profile reference. (Path is `genres/` for legacy reasons; the canonical term is caller profile.)

For staff tools, support backends, and permission-dense maintenance surfaces.

## CLI

- Require explicit `--env`, `--tenant`, or equivalent on destructive verbs.
- Use confirmation flags (`--confirm`, `--yes`) for delete/purge, not interactive prompts on unattended paths.
- Log/audit actor, tenant, action, and target when the tool changes state.

## REST / gRPC

- Separate admin namespace when public and admin APIs share a service.
- Auth assumptions must be explicit in OpenAPI/proto/docs.
- Stack traces are allowed only behind authentication and only when the service already follows that convention.

## Obligations

- Audit logs for state-changing operations.
- Strong request IDs.
- Danger flags on destructive actions.
- Contract ledger must call out any behavior that is unsafe for public callers.
