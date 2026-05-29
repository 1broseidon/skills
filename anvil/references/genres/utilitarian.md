# Caller profile · script

For developer tools, automation, CI jobs, and backend surfaces where predictable composition matters more than prose.

## CLI

- Consistent flag naming across commands (`--project`, not `--p` in one place and `--project-id` in another).
- stdout is parseable data; stderr is diagnostics.
- No default interactive prompts.
- JSON or another machine format for data-emitting commands.

## REST / gRPC

- Versioned paths/packages.
- Complete enough OpenAPI/proto to generate a client or stub.
- ERR-02/ERR-03-style structured errors when callers need branching.

## Obligations

- Deterministic output.
- Documented config precedence.
- Exit/status codes that let callers branch.
- Verification matrix includes at least one machine-output check.
