# anvil audit

Read only. No edits.

Audit is an evidence-backed judgment pass over one backend boundary. It covers both **surface contracts** and **structure**, but only to the depth supported by the target.

---

## Flow

1. **Boundary inventory** — load [`../evidence.md`](../evidence.md). Capture target kind, public contracts, runtime obligations, structure signals, and existing convention artifacts.
2. **Risk scan** — load [`../risk-classes.md`](../risk-classes.md). Identify shipped surfaces where current behavior is risky, undocumented, or drifting.
3. **Contract ledger diagnosis** — load [`../contract-ledger.md`](../contract-ledger.md). Record public surfaces that are preserved, undocumented, missing from artifacts, or candidates for deprecation.
4. **Obligation check** — load [`../obligations.md`](../obligations.md) for tool/service/package/structure obligations.
5. **Verification matrix** — load [`../verification.md`](../verification.md). List commands run, evidence inspected, and checks not run.
6. **Slop gates** — load [`../slop-test.md`](../slop-test.md) at the end. Report only gates supported by evidence.

For structure-heavy audits, also load:

- [`../repo-layout.md`](../repo-layout.md)
- [`../shared-packages.md`](../shared-packages.md) when shared/bucket packages exist
- [`../dead-code.md`](../dead-code.md) when unused/deprecated/deletion signals appear

---

## Output shape

```markdown
# Anvil audit — <target>

## Boundary inventory

- Target: `cmd/search` (cli, Go/cobra)
- Caller profile: script + agent (inferred from `--json`, `--minimal`, README)
- Public contracts observed: commands, flags, env vars, output formats
- Structure observed: flat CLI package + `internal/index`, no bucket package
- Convention artifacts: no `conventions.yaml`, no `anvil.md`

## Findings

### P0 — user-facing wrong / unsafe

*(none)*

### P1 — contract drift / caller risk

- **C15 / R1 missing artifact**: no `conventions.yaml` for a tool-scope CLI with documented exit codes and machine output.
- **A07 / R2 behavior risk**: requested backend silently falls back to default backend when unavailable.

### P2 — hygiene / structure

- **S09**: two anonymous TODOs in `internal/backends.go`; add owner+condition or remove.

## Contract ledger

| Surface | Change needed | Risk | Compatibility | Artifact | Verification |
| --- | --- | --- | --- | --- | --- |
| CLI exit codes | document | R1 | additive | conventions.yaml | invalid-input smoke |
| backend fallback | change or document | R2 | behavior visible to callers | conventions.yaml | unavailable-backend smoke |

## Obligation gaps

- Agent caller: config introspection present.
- Agent caller: output budget controls present.
- Tool-scope: exit-code table missing.

## Verification matrix

| Check | Command / evidence | Result | Notes |
| --- | --- | --- | --- |
| Help tree | `search --help`, `search query --help` | pass | observed |
| NO_COLOR | `NO_COLOR=1 search --help \| cat` | pass | no ANSI |
| Dead code | `staticcheck` | not run | audit stayed source/light |

## Slop gates

Universal: U16
CLI: C15
Agentic: A07
Structural: S09

## Recommended next actions

1. Add `conventions.yaml`.
2. Make backend fallback loud or opt-in.
3. Resolve anonymous TODOs.
```

---

## Rules

- Do not edit files during audit.
- Do not fabricate findings. Use "unknown" when evidence is missing.
- Do not call a public package export "dead" only because no in-repo caller exists.
- Do not recommend full rewrites unless the user asked or the boundary is unsalvageable.
- If source is unavailable, label the audit `surface-only`.
