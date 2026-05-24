# 02 · Action POSTs

## Shape

Resources hold state; **verbs** are explicit routes:

```
POST /v1/invoices/{id}/send
POST /v1/invoices/{id}/void
GET  /v1/invoices/{id}
```

Avoid fake REST (PUT for non-idempotent send).

## OpenAPI

- `operationId`: `Invoice_send`, stable across emits
- Document idempotency keys on mutating actions
- 409 for state conflicts with `current_state` in error body

## Errors

ERR-02 Problem Details; `type` URI per error class.

## When to use

Workflows, state machines, finance/ops APIs where CRUD-five misleads.
