# ERR-03 · gRPC rich status

Use `google.rpc.Status` with `google.rpc.ErrorInfo`:

```text
reason: INVOICE_LOCKED
domain: ledger.example.com
metadata: invoice_id=inv_123
```

Map domain errors in interceptors or per-handler helpers — not string contains on `err.Error()`.

Document reason constants in proto comments or `anvil.md`.
