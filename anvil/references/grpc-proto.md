# Protobuf emit (gRPC service-scope)

## When

Every **service-scope** gRPC build emits or merges `api/<service>/v1/*.proto` per pre-flight layout.

## File skeleton

```protobuf
syntax = "proto3";
package ledger.v1;
option go_package = "…"; // match project

service LedgerService {
  // RPCs from chosen macrostructure
}
```

## Messages

- Request messages: explicit fields, no JSON blob strings unless brief requires
- `string id` → document format in comments
- Pagination: `page_size` + `page_token` on List*
- Timestamps: `google.protobuf.Timestamp`

## Errors

Document in proto README block and `anvil.md`:

- Standard codes per [`errors.md`](errors.md)
- Optional `google.rpc.ErrorDetails` extension message in same package

## Buf

If `buf.yaml` exists: respect `breaking` rules; run `buf lint` if user asks — do not auto-run in default flow unless CI already does.

## Anti-slop

- No RPC stubs "for later" in minimal macro
- Field numbers never reused
- `reserved` when deleting fields

## Export

Service-scope handoff includes proto path list in preview and stamp.
