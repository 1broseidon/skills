# Middleware order

Default **MW-01** for REST and gRPC servers:

```
request-id → auth (if any) → logging → metrics → handler
```

## request-id

Accept incoming header or generate; attach to context and logs.

## Auth

Fail closed. 401 vs 403 distinction documented in errors.md.

## Logging

Start after auth so logs include principal when present.

## gRPC interceptors

Unary chain mirrors order. Stream: wrap `StreamServerInterceptor` for logging, not auth bypass.
