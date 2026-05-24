# Boundary obligations

Obligations are required guarantees implied by a backend boundary, not optional polish.

## CLI obligations

Always consider:

- root help and leaf help
- `--version` or `version`
- exit-code table for tool-scope builds
- stdout for data, stderr for diagnostics/progress
- config precedence and env prefix
- no interactive prompt on the default path
- no ANSI escapes when stdout is not a TTY; honor `NO_COLOR`

For script/agent callers:

- machine output (`--json`, `--format json`, or equivalent)
- stable JSON keys and deterministic ordering where reasonable
- bounded output (`--limit`, `--max-chars`, `--minimal`, pagination, or filters)
- config introspection (`config`, `config --json`, or documented equivalent)
- non-zero exit codes for validation/upstream/cancelled classes

For long-running work:

- timeout or cancellation surface
- progress on stderr only
- background mode returns a handle if backgrounding exists

## REST obligations

Always consider:

- OpenAPI sync with mounted routes
- stable error envelope
- request ID propagation into errors/logs
- health and readiness where deployable
- graceful shutdown
- version endpoint or build info if service is independently deployed

Conditional:

- pagination for list endpoints that can exceed one page
- idempotency for retried creates, payment operations, and job creation endpoints by default. If a toy or in-memory service defers it, record the deferral in the contract ledger and residual risk.
- `202` responses include `Location` or `status_url`
- auth assumptions documented at the boundary
- rate-limit headers only with implemented limiter

## gRPC obligations

Always consider:

- proto sync with registered server
- package options (`go_package`, `java_package`, etc. as relevant)
- health service
- reflection for operator/agent introspection unless intentionally disabled
- status-code map
- rich error details when callers need structured recovery
- cancellation for long unary/streaming calls

Conditional:

- long-running operation shape for work that outlives a request
- retry policy for retryable transient failures
- HTTP annotations only when transcoding is in scope

## Package API obligations

Always consider:

- explicit export list
- examples/tests for public exports
- semver/deprecation behavior
- dependency direction (shared packages never import features)
- generated-code boundary if codegen is involved

Conditional:

- compatibility shim for renamed public symbols
- downstream compile sample if external consumers are likely

## Structure obligations

Always consider:

- named layout family and rule
- import direction
- bucket-package policy
- dead-code evidence before deletion
- `git mv` plan for moves
- tests after moves/deletions

## Deferral

If an obligation is not satisfied, label it:

```text
Deferred: shell completion, because the binary does not currently ship completions and user asked only for one subcommand.
```

Do not silently skip an obligation that the boundary implies.
