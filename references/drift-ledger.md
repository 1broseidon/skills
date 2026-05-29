# Drift ledger

The drift ledger is scribe's reconciliation record. When a doc and the code disagree, the code is the source of truth and the doc is drift. The ledger makes every mismatch — and every fix — visible. It is the heart of `scribe sync`.

## What counts as drift

| Drift type | Example |
| --- | --- |
| **Phantom** | Doc describes a flag/route/param/symbol that no longer exists |
| **Stale default** | Doc states a default the code has changed |
| **Stale signature** | Documented function/endpoint shape differs from source |
| **Missing surface** | Code added a public flag/route/symbol the doc never covered |
| **Behavior change** | Same surface, different documented behavior than code now does |
| **Broken example** | Snippet that no longer runs against current code |
| **Dead link** | Internal reference to a moved/renamed/removed target |
| **Version mismatch** | Doc claims support that the manifest contradicts |

## Format

```text
| Doc claim | Code reality | Drift type | Fix | Verification |
| --- | --- | --- | --- | --- |
```

Examples:

```markdown
| `--format` flag | removed in cmd/root.go L52 | phantom | delete from doc | `search --help` |
| "defaults to 30s" | config.go L18 = 60s | stale default | correct to 60s | grep config.go |
| `Parse(s string)` | now `Parse(s string, opts ...Opt)` | stale signature | update + note opts | go doc |
| (undocumented) `--json` | cmd/root.go L40 | missing surface | add reference row | `search --help` |
| curl example | endpoint moved to /v2 | broken example | update path, re-run | execute snippet |
```

## Fix discipline

- **Phantom and stale facts:** correct or delete. These are lies; fix them first (P0/P1).
- **Missing surface:** add it, but only what's public and observed.
- **Behavior change:** describe the current behavior; if the doc set is versioned, note when it changed.
- **Don't rewrite history.** A changelog or migration guide records the old reality intentionally — verify which doc type you're in before "fixing" a past-tense statement. Reference and how-to docs describe current code; changelogs describe the diff.

## When to keep the old fact

Some docs legitimately describe prior versions:

- Changelogs / release notes — past entries stay.
- Migration guides — "previously X, now Y" is the whole point.
- Versioned docs sites — each version describes its own code.

In those cases, drift is only when the *current-version* section disagrees with current code, or when a historical entry was wrong even at the time.

## Output

End a sync with the ledger and a one-line summary:

```markdown
## Drift reconciled

| Doc claim | Code reality | Drift type | Fix | Verification |
| --- | --- | --- | --- | --- |
| ... | ... | ... | ... | ... |

Fixed 4 (2 phantom, 1 stale default, 1 broken example). Added 1 missing flag.
Left flagged: Postgres version claim (no manifest evidence) — needs owner confirmation.
```

Persist to `.scribe/drift.md` when the user wants a durable record or the sync spans multiple sessions.
