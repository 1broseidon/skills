# 01 · Unary Service

## Shape

```protobuf
service LedgerService {
  rpc CreateEntry(CreateEntryRequest) returns (Entry);
  rpc GetEntry(GetEntryRequest) returns (Entry);
  rpc ListEntries(ListEntriesRequest) returns (ListEntriesResponse);
}
```

Streaming only if brief requires export tail or log follow.

## Proto layout

- `api/ledger/v1/ledger.proto`
- Common messages in `common.proto` when shared across services
- `ListEntriesResponse` uses `repeated` + `next_page_token`

## Status mapping

| Condition | Code |
| --- | --- |
| Bad field | `INVALID_ARGUMENT` + details |
| Missing | `NOT_FOUND` |
| State conflict | `FAILED_PRECONDITION` |
| Upstream | `UNAVAILABLE` with retry hint in details |

## Defaults

ERR-03 rich status. HEALTH-02. Enable reflection in dev only — document in stamp.
