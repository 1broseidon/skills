# 06 · Minimal Health + One

## Shape

```protobuf
service IngestService {
  rpc IngestEvent(IngestEventRequest) returns (IngestEventResponse);
}
```

Plus standard gRPC health. Optional `grpc.reflection.v1` in non-prod.

## Proto

Keep one business RPC message pair focused. No speculative RPCs "for later."

## Operability

Document deadline defaults in service README and `anvil.md` — unary ingest should bound wait.
