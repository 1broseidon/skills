# 03 · Namespace Versioned

## Shape

```
/v1/billing/invoices
/v1/billing/invoices/{id}
/v1/identity/users
```

Version in path (or gateway prefix + path). Domain namespaces prevent flat `/api` clutter.

## OpenAPI

- `servers` lists environments
- Tags mirror namespaces (`billing`, `identity`)
- Breaking changes → `/v2`, never silent path moves

## When to use

Multi-team monoliths, public APIs with long-lived clients.

## Health

`/health/live`, `/health/ready` **outside** versioned business namespace or under `/v1/meta/health` — pick one, document in `anvil.md`.
