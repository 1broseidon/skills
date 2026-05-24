# 07 · Minimal Surface

## Shape

```
GET  /health/live
GET  /health/ready
GET  /version
POST /v1/events/ingest   # single business route
```

## When to use

Sidecars, webhooks receivers, single-purpose workers with HTTP admin port.

## OpenAPI

Small file is a feature — every path must be implemented. No placeholder paths.

## gRPC analogue

See `grpc-macrostructures/06-minimal.md`.
