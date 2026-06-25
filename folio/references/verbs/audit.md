# folio audit

Read-only. Do not edit files unless the user explicitly asks to fix findings afterward.

## Goal

Produce a severity-labeled punch list for one artifact path or published URL. Name what each mode can and cannot verify — never silently return a thinner verdict that looks like a full one.

## Modes

- **Local mode** (path): full audit — manifest, ledger, console, static-only, visual baseline, file tree.
- **Remote mode** (URL): limited audit — fetch HTML, parse embedded manifest or stamp, check external calls, secrets, broken links, publish integrity. Cannot run console, cannot read `.folio/`, cannot see the file tree. Mark these checks `unknown`, not `pass`.

## Steps

1. **Detect mode** — path on disk → local; `http(s)://` → remote.
2. **Inventory** the tree (local) or fetch URL (remote). See `evidence.md`.
3. **Build manifest ledger** from source — compare to `.folio/site.json` (local) or the embedded index JSON / HTML stamp (remote).
4. **Run verification** checks possible in this environment. In remote mode, mark console and file-tree checks `unknown`.
5. **Emit findings** — do not hand-wave. Name the mode at the top of the output.

## Output format

```text
severity | location | what is wrong | evidence | fix
P0 | app.js L44 | fetch to /api/users, no mock | api absent in repo | mock JSON or remove
P1 | index.html | script cdn not in ledger | unpkg.com/... L8 | add ledger row or remove
P2 | index.html | missing <title> | viewed source | add descriptive title
```

## Severity

| Level | Meaning |
| --- | --- |
| P0 | Broken runtime, secret leak, or fabricated live data |
| P1 | Manifest dishonesty, publish URL unverified, primary path fails |
| P2 | Quality, a11y, slop smells |

## Status for unverified checks

Use `unknown` when the environment cannot load a browser, run publish CLI, or (in remote mode) read `.folio/` or the file tree — not `pass`. A remote audit that silently returns `pass` on checks it can't run is a correctness violation.

## Capability matrix

Which checks each mode can produce a real pass/fail verdict on vs. which must be `unknown`.

| check | local | remote |
| --- | --- | --- |
| HTML stamp present | pass/fail | pass/fail |
| External calls ledgered | pass/fail | pass/fail |
| Secrets in source | pass/fail | pass/fail |
| Static-only (no external API fetch) | pass/fail | pass/fail |
| Mock-labeled | pass/fail | pass/fail |
| Visual baseline (token block, headings) | pass/fail | pass/fail (partial — no render) |
| Publish URL matches site.json | pass/fail | pass/fail |
| `.folio/site.json` entry correct | pass/fail | **unknown** |
| Console clean (no uncaught errors) | pass/fail | **unknown** |
| File tree complete | pass/fail | **unknown** |
| fetch target accessible (data files) | pass/fail | **unknown** |
| Broken links | pass/fail | pass/fail (external links only) |
