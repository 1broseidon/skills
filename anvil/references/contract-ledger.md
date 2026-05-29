# Contract ledger

The contract ledger is Anvil's backend-native preview. It makes caller-visible changes impossible to hide.

## Format

Use this table before edits and update it after implementation if reality changes:

```markdown
| Surface | Change | Risk | Compatibility | Artifact | Verification |
| --- | --- | --- | --- | --- | --- |
| CLI `search --json` | preserve | R0 | same flag and schema | conventions.yaml | `search test --json \| jq type` |
| CLI `--minimal` | add | R1 | additive output mode | conventions.yaml | smoke command |
| HTTP `POST /v1/jobs` | add | R1 | additive route | openapi.yaml | route list + contract test |
| `pkg.Parser.Parse` | deprecate | R3 | old symbol remains until v2 | anvil.md | package tests |
```

If the change is structure-only:

```markdown
| Surface | Change | Risk | Compatibility | Artifact | Verification |
| --- | --- | --- | --- | --- | --- |
| `internal/util` | split into `retry` + `email` | R5 | internal imports updated | .anvil/sweep-report.md | tests + import graph |
```

## Change verbs

Use a small vocabulary:

- **preserve**: explicitly unchanged
- **add**: new public surface
- **change**: same public surface, different behavior
- **deprecate**: old remains, new preferred
- **remove**: old gone
- **move**: file/package location changes
- **document**: convention artifact only

## Compatibility field

Be concrete:

- "additive; old callers unaffected"
- "old flag remains; warning in help only"
- "same JSON fields; adds optional `trace_id`"
- "breaking; requires user approval"
- "internal only; module import path unchanged"

## Artifact field

Name the durable record:

- `conventions.yaml`
- `openapi.yaml`
- `api/<service>/v1/*.proto`
- `anvil.md`
- `.anvil/sweep-report.md`
- package docs / README table
- "none; source only" only when the surface is private

## Verification field

Use repeatable checks, not vibes. Examples:

- `tool --help`
- `tool sub --help`
- `tool bad-input; echo $?`
- `tool data --json | jq type`
- router list vs OpenAPI
- proto compile / server registration search
- `go test ./...`, `cargo test`, `npm test`
- import graph or dead-code detector
