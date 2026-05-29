# scribe sync

Sync reconciles an existing document against the current code. The code is the source of truth; where the doc disagrees, the doc is drift. Sync finds every mismatch, fixes the claims, preserves what's still accurate, and reports what it changed. It is surgical — it does not rewrite a doc that's merely imperfect, only what's wrong or missing.

---

## Flow

1. **Source inventory** — load [`../source-evidence.md`](../source-evidence.md). Capture the current public surface: flags, routes, signatures, defaults, config keys, exit codes.
2. **Claim extraction** — read the doc and list every factual claim it makes (flags, defaults, signatures, behavior, versions, examples).
3. **Drift detection** — load [`../drift-ledger.md`](../drift-ledger.md). Compare each claim to source. Classify: phantom, stale default, stale signature, missing surface, behavior change, broken example, dead link, version mismatch.
4. **Doc-type guard** — load [`../doc-types.md`](../doc-types.md). Confirm which type you're in. Changelogs and migration guides describe history intentionally — don't "fix" past-tense facts that are correct for their version.
5. **Reconcile** — fix phantom/stale facts (P0/P1), add observed missing surface, correct broken examples. Preserve accurate prose and structure.
6. **Truth-check** — load [`../verification.md`](../verification.md). Re-verify every fixed claim. Run/compile examples where the toolchain allows.
7. **Slop gates** — load [`../slop-test.md`](../slop-test.md). Fix P0/P1.
8. **Report** — emit the drift ledger and a one-line summary.

---

## Preserve by default

Sync is reconciliation, not rewrite. Keep:

- accurate prose and structure
- the doc's voice and house style (`scribe.md` if present)
- intentional historical statements in changelogs/migration guides
- author choices about depth and ordering, unless they caused the drift

Only change what is wrong, missing, or broken. If you find a structural or prose problem beyond drift, note it for a follow-up `scribe audit` or default run rather than silently rewriting.

---

## Drift fixes

| Drift | Fix |
| --- | --- |
| Phantom (surface removed) | Delete the claim; note removal if the doc is versioned |
| Stale default | Correct to the real value; cite source |
| Stale signature | Update to current signature; flag new/changed params |
| Missing surface | Add it — only what's public and observed |
| Behavior change | Describe current behavior; note when it changed if versioned |
| Broken example | Update and re-run/compile; if not runnable here, static-check and flag |
| Dead link | Repoint to the moved target or remove |
| Version mismatch | Correct against the manifest; flag if no manifest evidence |

---

## Output

```markdown
# Scribe sync — <doc>

## Drift reconciled

| Doc claim | Code reality | Drift type | Fix | Verification |
| --- | --- | --- | --- | --- |
| `--format` | removed cmd/root.go L52 | phantom | deleted | `search --help` |
| "defaults to 30s" | config.go L18 = 60s | stale default | → 60s | grep config.go |
| (undocumented) `--json` | cmd/root.go L40 | missing surface | added row | `search --help` |
| curl example | endpoint now /v2 | broken example | updated + ran | executed |

## Verification

| Check | Result |
| --- | --- |
| Flags vs --help | pass |
| Examples run | pass (curl), not run (websocket — no server) |
| Links | pass |

Fixed 3 (1 phantom, 1 stale default, 1 broken example). Added 1 missing flag.
Left flagged: "Postgres 14+" — no manifest evidence, needs owner confirmation.
```

---

## Rules

- Don't invent surface to fill perceived gaps — add only observed facts.
- Don't rewrite history in changelogs/migration guides.
- Don't claim an example works if you didn't run or compile it.
- Persist to `.scribe/drift.md` when the user wants a durable record.
