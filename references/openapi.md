# OpenAPI emit (REST service-scope)

## When

Every **service-scope** REST build emits or merges `openapi.yaml` (path from pre-flight or default `openapi.yaml` at service root).

## Merge policy

| Pre-flight | Action |
| --- | --- |
| No existing file | Create fresh |
| Existing, user said replace | Replace paths for this service only |
| Existing, default | Patch: add/update only this service's paths; never delete unrelated paths silently |

## Required sections

- `openapi: 3.1.0` (or project's existing version)
- `info.title`, `info.version`
- `servers` from pre-flight or brief
- `paths` matching actual router registration
- `components.schemas` for request/response + **one** error schema (ERR archetype)
- `operationId` stable: `{Resource}_{verb}`

## Error schema (ERR-02)

```yaml
ProblemDetails:
  type: object
  required: [type, title, status]
  properties:
    type: { type: string, format: uri }
    title: { type: string }
    status: { type: integer }
    detail: { type: string }
    instance: { type: string }
    code: { type: string }
```

## Anti-slop

- No paths for unimplemented handlers
- No `example` with fake customer PII
- Document auth scheme only if middleware exists

## Export to `anvil.md`

When locked, copy OpenAPI path + error schema name into `## Exports`.
