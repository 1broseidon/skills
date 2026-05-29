# ERR-02 · Problem Details (RFC 7807)

REST default for script, human-operator, and SDK-client caller profiles.

## Response

`Content-Type: application/problem+json`

```json
{
  "type": "https://api.example.com/errors/invoice-locked",
  "title": "Invoice is locked",
  "status": 409,
  "detail": "Invoice inv_123 cannot be sent while status is draft.",
  "code": "INVOICE_LOCKED",
  "instance": "/v1/invoices/inv_123"
}
```

## OpenAPI

Register schema in `components.schemas.ProblemDetails`. Reference on 4xx/5xx responses.

## Rules

- `type` URI stable per error class
- `code` constant for clients; `detail` may vary
- Never empty `title`
