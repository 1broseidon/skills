# 03 · Action RPCs

## Shape

Entity messages + imperative RPCs:

```protobuf
rpc ApproveInvoice(ApproveInvoiceRequest) returns (Invoice);
rpc VoidInvoice(VoidInvoiceRequest) returns (Invoice);
```

Do not mirror REST path strings in RPC names (`PostInvoicesApprove`).

## Idempotency

`ApproveInvoice` accepts `idempotency_key` when effect is financial or external.

## When to use

Workflows where CRUD service (02) would split business meaning across ambiguous `Update`.
