# scribe audit

Read only. No edits.

Audit is an evidence-backed judgment pass over one document (or one small doc set). It scores four axes — **accuracy, structure, prose, links** — against the code and against documentation best practice. It diagnoses; it does not fix. Use `scribe sync` to repair drift, or a default run to rewrite.

---

## Flow

1. **Source inventory** — load [`../source-evidence.md`](../source-evidence.md). Identify what the doc claims and what the code actually does. Capture the public surface relevant to the doc.
2. **Doc-type check** — load [`../doc-types.md`](../doc-types.md). Identify which type the doc is and whether it holds that mode or mixes modes.
3. **Audience check** — load [`../audience.md`](../audience.md). Identify the intended reader and whether the doc serves them consistently.
4. **Accuracy pass** — build the claim ledger. Flag every claim that disagrees with source or is unverified.
5. **Structure + prose pass** — load [`../structure.md`](../structure.md) and [`../prose.md`](../prose.md). Assess navigability, ordering, concision.
6. **Link + format pass** — load [`../links-and-format.md`](../links-and-format.md). Check dead links, broken anchors, code-fence and example hygiene.
7. **Slop gates** — load [`../slop-test.md`](../slop-test.md) at the end. Report only gates supported by evidence.

---

## Output shape

```markdown
# Scribe audit — <doc>

## Inventory

- Doc: `README.md`
- Type: README (orientation + routing)
- Audience: new user (inferred from quick-start framing)
- Subject: cli `search` (Go/cobra), 8 commands
- Tooling: GitHub-rendered Markdown

## Findings

### P0 — factually wrong / broken
- **U01 / phantom**: documents `--format`, removed in cmd/root.go L52.
- **RM02**: quick-start fails — `npm start` script not in package.json.

### P1 — drift / mode / missing
- **U02 / stale default**: "defaults to 30s"; config.go L18 = 60s.
- **RM05**: full flag reference inlined; belongs in a reference page.

### P2 — polish
- **U11**: three filler sentences in the intro.
- **U07**: one dead anchor (`#config`).

## Accuracy ledger

| Claim | Code reality | Status |
| --- | --- | --- |
| `--format` flag | absent (L52) | wrong |
| default 30s | 60s (L18) | wrong |
| `--json` flag | cmd/root.go L40 | correct |

## Axis scores (1–5)

- Accuracy: 2 (two wrong facts)
- Structure: 4
- Prose: 3
- Links: 3

## Recommended next actions

1. `scribe sync README.md` to fix the two drift items.
2. Move the flag table to `docs/reference/`.
3. Re-run quick-start from a clean checkout.
```

---

## Rules

- Do not edit during audit.
- Do not fabricate findings. Use "unknown" when evidence is missing (e.g. snippet not runnable here).
- Do not score accuracy as passing for claims you did not check against source.
- Do not recommend a full rewrite unless the doc is unsalvageable or the user asked.
- If source is unavailable, label the audit `surface-only` and score accuracy as unknown, not passing.
