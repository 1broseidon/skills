# HEALTH-01 · Liveness + readiness split

```
GET /health/live   → 200 if process up
GET /health/ready  → 200 if deps ok, 503 otherwise
```

## Readiness checks

- DB ping with timeout
- Required env vars present
- Do not check optional third parties in live

## OpenAPI

Include both paths in emit. Tag: `Operations`.
