# Caller profile · sdk-client

For public APIs, SDK consumers, and customer-facing developer surfaces.

## CLI

- One-line help strings explain the outcome.
- Guided examples are useful, but examples must be real invocations.
- stderr/log split and documented exit codes still apply.

## REST

- Problem Details or another stable public error envelope.
- Stable `operationId` values.
- Public error types documented in OpenAPI.
- Deprecated fields/routes include removal dates or versions.

## gRPC / package APIs

- Proto/package names are part of the public contract.
- Field numbers and exported symbol names are durable.
- Compatibility shims beat sudden removals.

## Obligations

- Contract artifact suitable for client generation.
- Version/deprecation policy.
- Error-code map.
- Examples/tests for public entrypoints.
