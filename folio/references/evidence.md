# Evidence

Folio starts with evidence about **inputs**, not about backend code. The goal is to know what data, APIs, design constraints, and existing files are real before generating HTML.

## Evidence levels

| Level | Meaning | Use in artifacts |
| --- | --- | --- |
| `observed` | You read the file, ran the command, or loaded the URL | Strongest. Wire it. Cite path or output. |
| `derived` | Inferred from structure (CSV has headers → column chart) | State it; do not overclaim precision |
| `stated` | User said it or an existing README claims it | Useful; verify before hard-coding behavior |
| `absent` | You searched and the backend/API/data is not there | Mock, defer, or cut the feature |

A dependency or endpoint that was never checked is not an evidence level. Resolve during inventory or mark `absent`.

## What to inventory

### New artifact

- User goal (one sentence)
- Inputs: files, pasted JSON, screenshots, URLs, copy
- Constraints: single-file vs folder, dark mode, mobile, no network
- Host profile: default `local`
- Existing project conventions: `folio.md`, `artifacts/` layout

### Existing artifact

```bash
find <path> -type f | head
rg -l '<script|<link|fetch\(|import ' <path>
rg 'https?://' <path>   # external deps
```

Record: entry HTML, asset tree, external URLs, last publish URL (if documented), console errors on load.

### Publish target

Only when publish is in scope:

```bash
which surge wrangler gh 2>/dev/null
test -f wrangler.toml && head wrangler.toml
git remote -v 2>/dev/null
```

Record: CLI availability, account/project hints, **do not assume** deploy succeeded until command output says so.

## Inventory block template

```text
Inventory:
· Target: artifacts/latency-hist (new)
· Inputs: runs.csv (observed, 840 rows, columns: ts, ms, region)
· Existing artifact: none
· Host: local
· External APIs: none requested

Preserve: none
Investigate: whether fetch to local CSV needs a static server (yes)
```
