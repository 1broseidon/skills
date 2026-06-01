# anvil reshape

Reshape keeps domain intent and caller commitments while improving a backend surface or structure. It is governed by risk class, not novelty.

---

## Modes

| Flag | What changes |
| --- | --- |
| *(default)* | Compatible surface reshape: command tree, handler layout, error envelope, contract artifacts |
| `--sweep` | Dead-code campaign: report first, delete only after approval |
| `--layout <family>` | Repo layout migration with `git mv` plan |
| `--slim <pkg>` | Shared/bucket package split or deletion plan |

---

## Flow

1. **Boundary inventory** — load [`../evidence.md`](../evidence.md). Identify target kind, shipped contracts, structure, and existing convention artifacts.
2. **Risk classification** — load [`../risk-classes.md`](../risk-classes.md). Every public change gets R0-R5.
3. **Contract ledger** — load [`../contract-ledger.md`](../contract-ledger.md). State preserved, added, deprecated, removed, or moved surfaces before editing.
4. **Obligation selection** — load [`../obligations.md`](../obligations.md). List what the boundary now owes callers.
5. **File plan** — exact modify/create/move/delete list. R4/R5 requires explicit approval unless already given.
6. **Implement** — narrow edits, existing stack, compatibility shims for public surfaces.
7. **Verification matrix** — load [`../verification.md`](../verification.md); run checks.
8. **Slop gates** — load [`../slop-test.md`](../slop-test.md) after verification; fix P0/P1.
9. **Record** — update stamps, `.anvil/log.json`, and convention artifacts.

---

## Preserve by default

- shipped flags and env var names
- route paths and methods
- RPC names, message field numbers, proto packages
- error codes and exit codes already documented
- package import paths and exported symbols
- log field keys that downstream analysis may consume
- config precedence used in production

If the user asked for a breaking change, still make the break loud in the ledger.

---

## Compatibility patterns

### Rename a CLI flag

```markdown
| Surface | Change | Risk | Compatibility | Artifact | Verification |
| --- | --- | --- | --- | --- | --- |
| `--project` | deprecate in favor of `--project-id` | R3 | both flags work until v2.0 | conventions.yaml | help + invocation smoke |
```

Implementation rules:
- old and new flag cannot both be set to conflicting values
- old flag appears as deprecated in help if framework supports it
- docs/conventions carry removal milestone

### Change an error envelope

Keep old fields during the transition:

```json
{
  "error": "not found",
  "code": "NOT_FOUND",
  "message": "invoice not found",
  "request_id": "..."
}
```

Then ledger the old field removal as a future R3/R4 event.

### Move packages

Use `git mv` when available. Update imports. Test after each logical move. Do not re-create + delete source trees.

---

## Structural modes

### `--layout`

Load [`../repo-layout.md`](../repo-layout.md). Write or update the layout rule in `anvil.md` before moving files:

```yaml
layout:
  family: feature-first
  rule: "New code under internal/<context>/. Cross-context through contract packages only."
```

Then emit a move plan:

```text
Move:
  internal/api/billing.go -> internal/billing/api.go
  internal/store/billing.go -> internal/billing/store.go
Update imports:
  cmd/payments/main.go
Delete:
  none until directories are empty
```

### `--sweep`

Load [`../dead-code.md`](../dead-code.md). Produce `.anvil/sweep-report.md` with safe / probably safe / needs human / false-positive buckets. Wait for approval before deletion.

### `--slim`

Load [`../shared-packages.md`](../shared-packages.md). Inventory exports and callers, group by capability, create named packages, migrate callers, then delete the bucket only after approval.

---

## Stamp

```go
// Anvil · target: cmd/search · kind: cli · scope: tool
// caller profile: script,agent · risk class: R1,R2 · contracts: conventions.yaml
// obligations: version,exit-codes,json,minimal,config
```

Structure-only changes record the stamp in `.anvil/log.json` and reports rather than arbitrary source files.
