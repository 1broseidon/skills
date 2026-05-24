# REST API macrostructures

**Pick one** before routing. Then load **only** `api-macrostructures/<slug>.md`.

Emit **`openapi.yaml`** on every **service-scope** build ([`openapi.md`](openapi.md)).

## Diversification

Differ from last 3 REST runs for this `target`. Default away from **CRUD-Five**.

## Index (v1)

| # | Name | Slug | One line |
| --- | --- | --- | --- |
| 01 | CRUD-Five | `01-crud-five` | **Discouraged default** — `/resources` + id subroutes |
| 02 | Action POSTs | `02-action-posts` | Resources + `/actions/verb` or verb subpaths |
| 03 | Namespace Versioned | `03-namespace-versioned` | `/v1/{domain}/{resource}` clear boundaries |
| 04 | RPC-Shaped HTTP | `04-rpc-shaped` | POST `/Service.Method` when gateway legacy exists |
| 05 | Facade | `05-facade` | Thin edge over upstream; maps errors at boundary |
| 06 | Webhook Ingress | `06-webhook-ingress` | Inbound callbacks + verification + health |
| 07 | Minimal Surface | `07-minimal` | Health + metadata + one business route |
| 08 | Document-Centric | `08-document-centric` | Large payloads, PATCH semantics, ETags |

**Deep files (drafted):** 02, 03, 07.
