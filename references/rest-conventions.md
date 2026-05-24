# REST conventions

Load on **service-scope** and **command-scope** rest builds.

## Handler layout

- One file per resource or namespace group
- Handlers: decode → validate → domain call → encode
- Errors through single `writeError(w, err)` using chosen ERR archetype

## Status codes

| Situation | Code |
| --- | --- |
| Validation | 400 + field paths |
| Auth | 401 |
| Forbidden | 403 |
| Missing | 404 |
| Conflict | 409 |
| Rate limited | 429 **only if implemented** |

## Middleware

Load MW-01 when auth/logging/request-id in scope.

## OpenAPI sync

Handler route registration is source of truth; OpenAPI emit in Step 6 must match.
