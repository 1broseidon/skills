# Risk classes

Backend work is governed by caller risk. Classify changes before editing.

## Classes

| Class | Name | Examples | Default action |
| --- | --- | --- | --- |
| **R0** | Additive internal | private helper, internal file split, tests, docs | edit + test |
| **R1** | Additive public | new flag, route, RPC, export, error code, log key | document in ledger + verify |
| **R2** | Compatible behavior change | same route, stricter validation, default timeout, new retry behavior | explain impact + verify old callers |
| **R3** | Deprecation | old flag remains, new flag added; old field marked deprecated | add milestone + compatibility path |
| **R4** | Breaking/removal | renamed route, deleted RPC, changed JSON type, removed export | stop for explicit approval |
| **R5** | Destructive structural | file/package deletion, repo move, dead-code sweep | written plan + approval + tests |

## Public surface checklist

Treat these as public if callers can observe them:

- CLI command names, positional args, flags, env vars, config paths, exit codes, stdout/stderr schema, log/event keys
- HTTP method/path, status code, headers, body fields, error envelope, pagination/idempotency semantics
- gRPC package/service/RPC/message/field numbers, status codes, error details, service config
- Package exports, module paths, public types, public error values, documented behavior
- Operational endpoints and metrics labels

## Deprecation ceremony

For R3 changes, include:

```text
old surface | new surface | introduced | removal target | compatibility behavior
```

Rules:
- Old spelling remains functional.
- Help/OpenAPI/proto/docs mark the old surface deprecated.
- Removal target is a version or date, not "soon".
- Logs warn only when useful; do not spam normal success paths.

## Breaking-change stop line

If the plan includes R4/R5 and the user has not already approved the exact file/surface list, stop and ask for confirmation. Do not "helpfully" remove a shipped contract.

## Risk downgrades

You may downgrade only with evidence:

- private helper proven unexported and unreferenced -> R0/R5 depending on deletion
- route existed only in tests and was never mounted -> R0
- generated code regenerated from unchanged proto -> R0

When uncertain, classify higher.
