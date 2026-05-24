# Operability

Surface-level hooks that turn a deployed service from a black box into something an operator can observe, debug, and maintain. On **service-scope** builds these are **non-negotiable** obligations. On **tool-scope CLIs** the relevant subset applies.

---

## Logging

### Shape

Structured JSON logs. One entry per request/event at INFO; verbose detail at DEBUG behind a flag.

Every request log must include:

| Field | Type | Example |
| --- | --- | --- |
| `request_id` | string | `req_abc1234` |
| `method` (REST) / `rpc` (gRPC) | string | `POST /invoices` / `billing.Invoices/Create` |
| `status_code` (REST) / `grpc_code` (gRPC) | int/string | `201` / `OK` |
| `duration_ms` | float | `42.3` |
| `error_code` | string \| null | `INVOICE_LOCKED` |

Additional fields as relevant: `user_id`, `trace_id`, `span_id`, `bytes_in`, `bytes_out`.

### Cardinality discipline

Log field **values** must be bounded. Never log a per-request unique value as a **key** — Prometheus and most log backends index on key.

✓ `{"request_id": "req_abc"}` — value is unique, key is stable  
✗ `{"req_abc": "metadata"}` — key is unique → cardinality explosion

Same rule for **metric labels**: `status_code` as a label is bounded (200, 201, 400, 500); `request_id` as a label is unbounded — never do it.

### Log levels

| Level | When |
| --- | --- |
| ERROR | Unexpected failure; operator should investigate |
| WARN | Expected but notable; doesn't break anything now |
| INFO | Per-request summary (one line), service lifecycle events |
| DEBUG | Internal detail; off by default; enabled by flag/env |

No TRACE / VERBOSE levels in public surfaces — debug is the lowest callers should need.

### Sampling

In hot paths (>100 req/s), INFO logs must be sampled:

```go
// Log every Nth request at INFO; always log errors
if requestCount%100 == 0 || err != nil {
    slog.InfoContext(ctx, "request processed", attrs...)
}
```

Unsampled INFO logging on hot paths is a cardinality and storage sink.

### Framework guidance

**Go (`slog`):**
```go
slog.InfoContext(ctx, "request completed",
    "request_id", requestID,
    "method", r.Method+" "+r.URL.Path,
    "status_code", statusCode,
    "duration_ms", duration.Milliseconds(),
)
```

**Go (zap):**
```go
logger.Info("request completed",
    zap.String("request_id", requestID),
    zap.Int("status_code", statusCode),
    zap.Int64("duration_ms", duration.Milliseconds()),
)
```

Use `slog` for new Go services (≥ Go 1.21). Reach for zap only when benchmark-proven performance need exists.

---

## Request ID propagation

Every inbound request gets a request ID. It propagates through every downstream call.

**Source priority:**
1. `X-Request-ID` header if present (from upstream / LB / gateway)
2. Generate a new UUID / NanoID if absent

**Propagate:**
- Attach to context: `ctx = context.WithValue(ctx, requestIDKey, id)`
- Forward in all downstream HTTP calls: `outReq.Header.Set("X-Request-ID", id)`
- Forward in all gRPC calls: `metadata.AppendToOutgoingContext(ctx, "x-request-id", id)`
- Include in every log line (`request_id` field)
- Return in every response header: `w.Header().Set("X-Request-ID", id)`

**Why:** operators pasting a `request_id` from a user complaint should be able to grep the full distributed trace from one value. If the ID doesn't propagate, the trace breaks.

---

## Health endpoints

### REST (HEALTH-01: liveness + readiness split)

```
GET /healthz/live    → 200 OK {"status":"ok"}          # am I up?
GET /healthz/ready   → 200 OK or 503                   # am I ready to serve?
```

**Liveness** (`/live`): always returns 200 unless the process is in a death spiral. Kubernetes restarts if this fails. Must be very cheap (no DB calls).

**Readiness** (`/ready`): checks actual dependencies — DB can connect, cache is warm, background job ran recently. Returns 503 with detail when a dep is down.

```json
{
  "status": "degraded",
  "checks": [
    {"name": "postgres", "status": "ok", "latency_ms": 3},
    {"name": "redis", "status": "fail", "error": "connection timeout", "latency_ms": 5001}
  ]
}
```

**Never** put external health checks inside `/live`. A database outage should make the service *not-ready*, not *dead*. Kubernetes restarting your pod because Postgres is down is not a fix.

### gRPC (HEALTH-02)

Use `grpc.health.v1.Health/Check` from [grpc/health](https://github.com/grpc/grpc/blob/master/doc/health-checking.md):

```protobuf
import "grpc/health/v1/health.proto";
```

Register each service separately:

```go
healthServer.SetServingStatus("billing.Invoices", grpc_health_v1.HealthCheckResponse_SERVING)
healthServer.SetServingStatus("", grpc_health_v1.HealthCheckResponse_NOT_SERVING)  // root for liveness
```

Drain dependencies: when shutting down, set status to `NOT_SERVING` **before** stopping handlers so load balancers route away first.

---

## Graceful shutdown

Every server process must handle SIGTERM cleanly:

1. Stop accepting new connections (close the listener)
2. Drain in-flight requests with a deadline (typically 10–30s)
3. Flush logs / metrics / traces
4. Close DB connections
5. Exit 0

**Go:**

```go
ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
defer stop()

srv := &http.Server{Handler: mux}
go func() {
    <-ctx.Done()
    shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    srv.Shutdown(shutdownCtx)
}()
srv.ListenAndServe()
```

Document the shutdown timeout and any data that may be in-flight at SIGTERM. Kubernetes sends SIGTERM and waits `terminationGracePeriodSeconds` (default 30s) before SIGKILL.

**gRPC:**

```go
grpcServer.GracefulStop()  // drains in-flight RPCs before stopping
```

---

## Version endpoint

```
GET /version → 200 OK
{
  "version": "1.2.3",
  "commit": "abc1234",
  "built": "2026-05-22T00:00:00Z",
  "backend": "postgres"        // add backend identity when BACKEND-01 applies
}
```

Also exposed via gRPC reflection or a `GetServerInfo` RPC. OpenAPI `info.version` matches the deployed version. Operators use this to confirm a deploy landed.

---

## Metrics

**Only expose metrics you've implemented.** Do not invent histogram names without backing code.

Standard metrics for any HTTP service:

| Metric | Type | Labels |
| --- | --- | --- |
| `http_requests_total` | counter | `method`, `path_template`, `status_code` |
| `http_request_duration_seconds` | histogram | `method`, `path_template` |
| `http_requests_in_flight` | gauge | — |

For gRPC:

| Metric | Type | Labels |
| --- | --- | --- |
| `grpc_server_handled_total` | counter | `grpc_method`, `grpc_code` |
| `grpc_server_handling_seconds` | histogram | `grpc_method` |

**Path template, not path value.** Use `/invoices/{id}` not `/invoices/i_1234` as the label value. Raw path values → cardinality explosion.

**Expose at `/metrics` (Prometheus format) unless brief specifies otherwise.** Don't introduce custom metrics backends unless already present in the project.

---

## Tracing

If the project has a tracing dependency (OpenTelemetry, Jaeger, Zipkin), propagate trace context:

- Extract from `traceparent` header (W3C Trace Context) on inbound HTTP
- Inject into all outbound HTTP and gRPC calls
- Add `trace_id` and `span_id` to every log line

If no tracing dependency exists, do not add one unprompted — tracing infrastructure is a project-wide decision.

---

## Structured startup banner

Log at startup (INFO level):

```json
{
  "msg": "service starting",
  "version": "1.2.3",
  "commit": "abc1234",
  "listen": ":8080",
  "env": "production",
  "backend": "postgres"
}
```

No ASCII art. No banner boxes. One structured log line. Operators grep for `service starting` to confirm deployment.

---

## CLI operability

The following applies when a CLI has a `serve` / daemon subcommand:

- Health: add `--health-addr` flag; expose at least `/healthz/live`
- Graceful shutdown: honour SIGTERM, drain active requests
- Structured logs: same rules as services
- Metrics: optional, but expose `/metrics` if `--metrics-addr` flag is set

For standard one-shot CLIs (no daemon mode), the operability concern reduces to:
- Structured stderr on `--json`
- Exit codes (see `cli-conventions.md`)
- `--verbose` for debug-level output
- `--version` with build info

---

## Operability checklist (service-scope, non-negotiable)

- [ ] Structured JSON logs with `request_id`, `duration_ms`, `status_code` / `grpc_code`
- [ ] Request ID generated if absent; propagated to all downstream calls and response headers
- [ ] Log cardinality: per-request unique values never appear as keys or metric labels
- [ ] `/healthz/live` (cheap) and `/healthz/ready` (checks deps) — or gRPC health equivalents
- [ ] Readiness check names each dependency individually
- [ ] Graceful SIGTERM handler with drain timeout documented
- [ ] `/version` endpoint with semver + commit + build time
- [ ] Startup log line with version, listen address, env, backend
- [ ] Metrics at `/metrics` — only if brief mentions metrics
- [ ] Tracing propagation — only if project already has a tracing library
