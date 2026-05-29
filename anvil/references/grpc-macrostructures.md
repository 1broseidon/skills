# gRPC macrostructures

**Pick one** before defining services. Then load **only** `grpc-macrostructures/<slug>.md`.

Emit **`.proto` skeleton** on every **service-scope** build ([`grpc-proto.md`](grpc-proto.md)).

## Diversification

Differ from last 3 gRPC runs for this `target`.

## Index (v1)

| # | Name | Slug | One line |
| --- | --- | --- | --- |
| 01 | Unary Service | `01-unary-service` | Mostly unary RPCs; streaming only when brief requires |
| 02 | Resource CRUD | `02-resource-crud` | `Create/Get/List/Update/Delete` per entity |
| 03 | Action RPCs | `03-action-rpcs` | `RunJob`, `Cancel`, `Approve` on entities |
| 04 | Facade Service | `04-facade` | Translates upstream; stable outward contract |
| 05 | Streaming Export | `05-streaming-export` | Server-stream for logs/metrics/export |
| 06 | Minimal Health + One | `06-minimal` | Health + one business RPC + reflection |
| 07 | Event Ingest | `07-event-ingest` | Ingest + ack pattern |

**Deep files (drafted):** 01, 03, 06.
