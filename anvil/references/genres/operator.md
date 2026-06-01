# Caller profile · human-operator

Caller profile reference. (Path is `genres/` for legacy reasons; the canonical term is caller profile.)

For SREs, platform engineers, on-call engineers, and humans operating production systems.

## CLI

- Help must make the safe path obvious.
- Default output can be table/text, but data commands should still offer JSON for scripts.
- Global `--quiet` and `--verbose` are useful when the existing stack supports them.
- Examples should show exit-code checks and piping when relevant.
- Avoid marketing adjectives in help.

## REST / gRPC

- Explicit error codes for automation.
- Health/readiness required on service-scope builds.
- Idempotency and pagination documented when applicable.
- Startup logs include version, environment, and listen address.

## Obligations

- Actionable errors.
- Request IDs.
- Cancellation/timeout documentation for long operations.
- No fake uptime, quota, or SLA claims.
