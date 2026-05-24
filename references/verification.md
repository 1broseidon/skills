# Verification matrix

Verification is a first-class Anvil output. Every non-trivial build or reshape should end with a matrix the user can rerun.

## Matrix format

```markdown
| Check | Command / evidence | Result | Notes |
| --- | --- | --- | --- |
| Help smoke | `tool --help` | pass | root + leaf help observed |
| JSON clean | `tool search test --json \| jq type` | pass | stdout only |
| Tests | `go test ./...` | pass | 42 packages |
```

If a command cannot run, say why:

```markdown
| Binary smoke | `tool --help` | not run | binary not built in this workspace |
```

## CLI checks

Minimum for tool-scope:

```bash
<tool> --help
<tool> --version || <tool> version
NO_COLOR=1 <tool> --help | cat
```

When machine output exists:

```bash
<tool> <data-command> --json | jq type
<tool> <data-command> --minimal 2>/dev/null | head
```

When errors are changed:

```bash
<tool> <bad-input>; echo "exit:$?"
<tool> <bad-input> --json 1>/tmp/out 2>/tmp/err; echo "exit:$?"
```

Expected:
- diagnostics on stderr
- stdout parseable when machine output is requested
- distinct exit codes when documented

## REST checks

Use whatever the project supports:

- route listing command/framework output
- OpenAPI generation/diff
- handler tests
- request/response smoke via local server
- contract tests for error envelope and request ID

Expected:
- mounted routes match OpenAPI
- documented status codes match handlers
- no internal stack/module path in response body
- `202` has polling location/status when used

## gRPC checks

Use project-local tools:

- proto compile / buf lint
- server registration search
- grpcurl against local server if available
- handler tests for status codes and rich error details

Expected:
- proto services match registered services
- health/reflection behavior intentional
- status codes map consistently

## Package checks

- package tests
- downstream sample compile when available
- export list diff
- dependency direction/import cycle check
- compatibility-shim smoke for deprecated public exports. In languages with multiple import forms, test the forms callers plausibly use (for example Python `import pkg.old` and `from pkg.old import Symbol`).

Expected:
- public exports documented or intentionally internal
- no feature imports from shared packages
- deprecations retain compatibility shims

## Structure checks

After layout moves or sweeps:

- language test suite
- import graph / cycle detector
- dead-code detector rerun
- generated code unchanged unless intentionally regenerated

Do not treat a green test suite as proof of no contract break. It is one row in the matrix.
