# Errors

One public error envelope per target. Map internal errors at the boundary. Never leak stack traces, internal package paths, or raw DB errors to callers.

---

## Principles

1. **Actionable** — name what failed, where, and what to do next. "Bad request" is not actionable. "Field `amount` must be positive; got -5" is.
2. **Stable codes** — the machine-readable code (`INVOICE_LOCKED`, `NOT_FOUND`) never changes between releases. The human-readable message may evolve; the code must not.
3. **Field paths** — validation errors point to the exact field: `body.items[2].amount`.
4. **No leakage** — stack traces, SQL queries, internal package names go to structured logs, not to the response.
5. **Consistent shape** — every error from this service looks the same. Callers don't parse error strings; they branch on codes.
6. **Retryability declared** — for each error class, is it safe to retry? Document it.

---

## CLI errors

### Standard error output

```
Error: <actionable message>
  hint: <one-line suggestion>
```

Human-readable. Goes to stderr. Ends with a non-zero exit (see `cli-conventions.md` § Exit codes).

With `--json` (agent/script caller profile):

```json
{"error":{"code":"VALIDATION","message":"flag --limit must be ≥1; got 0","field":"limit"}}
```

Written to stderr. Stdout stays clean.

### Exit code mapping

| Class | Code | Example |
| --- | --- | --- |
| User / validation | 2 | bad flag value, missing required arg |
| Not found | 3 | symbol not in index, URL 404 |
| Upstream | 4 | search backend unreachable |
| Precondition | 5 | index not built, context cancelled before start |
| Cancelled | 6 | SIGINT mid-operation |

---

## REST — ERR-01: Code + message

Simple envelope. Good for internal-admin and utilitarian surfaces where callers are controlled.

```json
{
  "error": {
    "code": "INVOICE_LOCKED",
    "message": "Invoice i_1234 is locked for processing and cannot be modified.",
    "request_id": "req_abc123"
  }
}
```

Status codes:

| HTTP | When |
| --- | --- |
| 400 | Validation errors (add `fields` array — see below) |
| 401 | Not authenticated |
| 403 | Authenticated but not authorised |
| 404 | Resource not found |
| 409 | Conflict (already exists, locked, state mismatch) |
| 422 | Semantic validation failure (structurally valid request, domain rules reject it) |
| 429 | Rate limited (only if actually implemented — see anti-patterns) |
| 500 | Internal error (hide detail) |
| 502/503 | Upstream dependency failure |

Validation errors must include field paths:

```json
{
  "error": {
    "code": "VALIDATION",
    "message": "Request validation failed.",
    "request_id": "req_abc123",
    "fields": [
      {"field": "body.items[2].amount", "code": "MUST_BE_POSITIVE", "message": "Amount must be > 0; got -5.00"}
    ]
  }
}
```

### ERR-02: Problem Details (RFC 7807)

Standard HTTP API envelope. Good for operator and productized surfaces; understood by many client libraries.

```json
{
  "type": "https://errors.ledger.example/invoice-locked",
  "title": "Invoice locked",
  "status": 409,
  "detail": "Invoice i_1234 is locked for processing. Unlock it first.",
  "instance": "/invoices/i_1234",
  "request_id": "req_abc123",
  "extensions": {
    "locked_by": "migration-job-7",
    "locked_since": "2026-05-22T04:12:00Z"
  }
}
```

- `type` is a stable URI — a docs URL or an `urn:`. Agents use it for branching.
- `title` is human-readable; may change across versions.
- `detail` is human-readable and instance-specific.
- `extensions` holds domain-specific extra fields; document each one.

Content-Type header: `Content-Type: application/problem+json`.

Validation errors:

```json
{
  "type": "https://errors.ledger.example/validation",
  "title": "Validation failed",
  "status": 400,
  "request_id": "req_abc123",
  "errors": [
    {"pointer": "/items/2/amount", "code": "MUST_BE_POSITIVE", "detail": "Amount must be > 0; got -5.00"}
  ]
}
```

`pointer` follows JSON Pointer (RFC 6901): `/items/2/amount`.

---

## gRPC — ERR-03: Rich status + ErrorInfo

Use `google.rpc.Status` with typed detail messages from `google.rpc.error_details.proto`. Stable machine-readable codes via `google.rpc.ErrorInfo`.

```protobuf
import "google/rpc/status.proto";
import "google/rpc/error_details.proto";
```

Status code mapping:

| gRPC Code | When |
| --- | --- |
| `OK` | Success |
| `INVALID_ARGUMENT` | Caller's request is wrong |
| `NOT_FOUND` | Resource doesn't exist |
| `ALREADY_EXISTS` | Conflict |
| `PERMISSION_DENIED` | Authorisation failure |
| `UNAUTHENTICATED` | Missing/invalid credentials |
| `RESOURCE_EXHAUSTED` | Rate limited or quota |
| `FAILED_PRECONDITION` | State mismatch (invoice locked) |
| `ABORTED` | Optimistic concurrency failure |
| `UNAVAILABLE` | Transient; retry with backoff |
| `INTERNAL` | Unexpected; hide detail |
| `DEADLINE_EXCEEDED` | Deadline hit |
| `CANCELLED` | Caller cancelled |

**Never use `NOT_FOUND` and `INVALID_ARGUMENT` interchangeably.** `INVALID_ARGUMENT` means the request is structurally wrong. `NOT_FOUND` means the request was valid but the resource doesn't exist.

**Rich error detail (Go):**

```go
import "google.golang.org/grpc/status"
import "google.golang.org/genproto/googleapis/rpc/errdetails"

func invoiceLocked(id string) error {
    st, _ := status.New(codes.FailedPrecondition, "invoice locked").
        WithDetails(&errdetails.ErrorInfo{
            Reason: "INVOICE_LOCKED",
            Domain: "billing.ledger.example",
            Metadata: map[string]string{"invoice_id": id},
        })
    return st.Err()
}
```

**Retryability** — document for each code:

| Code | Retry? | Notes |
| --- | --- | --- |
| `UNAVAILABLE` | Yes, with exponential backoff + jitter | Cap at 3–5 attempts |
| `DEADLINE_EXCEEDED` | Maybe — only if the original deadline permits | Check remaining deadline first |
| `RESOURCE_EXHAUSTED` | Yes, after `Retry-After` or backoff | |
| `INTERNAL` | No — may cause duplicate side effects | Log and alert instead |
| `FAILED_PRECONDITION` | No until state changes | |
| `INVALID_ARGUMENT` | No | Fix the request |
| `NOT_FOUND` | No | |

---

## Internal error mapping

At the boundary between internal and external error representations, map explicitly:

### Go example

```go
func mapError(err error) *apiError {
    var notFound *store.NotFoundError
    var locked *domain.LockedError
    var validation *domain.ValidationError

    switch {
    case errors.As(err, &notFound):
        return &apiError{Code: "NOT_FOUND", Status: 404,
            Message: fmt.Sprintf("%s not found", notFound.Resource)}
    case errors.As(err, &locked):
        return &apiError{Code: "INVOICE_LOCKED", Status: 409,
            Message: "Invoice is locked for processing."}
    case errors.As(err, &validation):
        return &apiError{Code: "VALIDATION", Status: 400,
            Message: "Validation failed", Fields: validation.Fields}
    default:
        slog.Error("unhandled error", "err", err)  // full detail to logs
        return &apiError{Code: "INTERNAL", Status: 500,
            Message: "An internal error occurred."}  // hide from caller
    }
}
```

Never return `err.Error()` to external callers for unhandled errors. It leaks internal paths, type names, SQL, and stack frames.

---

## Error code registry

Maintain a canonical list of error codes for the service. In `conventions.yaml` (CLI) or `anvil.md` (service):

```yaml
error_codes:
  - code: NOT_FOUND
    http_status: 404
    grpc_code: NOT_FOUND
    retryable: false
  - code: INVOICE_LOCKED
    http_status: 409
    grpc_code: FAILED_PRECONDITION
    retryable: false
    description: "Invoice is locked by a processing job."
  - code: VALIDATION
    http_status: 400
    grpc_code: INVALID_ARGUMENT
    retryable: false
  - code: UPSTREAM_UNAVAILABLE
    http_status: 503
    grpc_code: UNAVAILABLE
    retryable: true
    retry_policy: "exponential backoff, max 3 attempts"
```

Once published, codes are **wire commitments**. Add new codes; never rename existing ones. Renaming is a breaking change even if the HTTP status doesn't change.

---

## Anti-patterns

| Tell | Why |
| --- | --- |
| **`{"error":"something went wrong"}`** | Non-actionable; code is unstable (changes with message rewording) |
| **Multiple error shapes from the same service** | Callers can't write a single handler |
| **Leaking stack traces in production** | Security and stability; ops reads logs not responses |
| **`400` for everything that isn't `200`** | Conflates client errors with server errors; operators can't script |
| **`500` for not-found** | Misleads monitoring; not-found is a client error |
| **`429` without implementation** | Invented rate limit (gate U05) |
| **Error messages that change between releases** | Message is OK to change; the `code` field is the stable contract |
| **gRPC `INTERNAL` for business logic errors** | `INTERNAL` means "unexpected"; business logic errors have specific codes |

See `anti-patterns.md` for gate numbers.
