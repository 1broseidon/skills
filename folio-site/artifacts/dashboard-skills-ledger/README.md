# folio-dash

A dashboard over the local skills repo — **real observed data**, no fabricated backend. This is the artifact that shows folio's value where it actually bites: a dashboard that would naively call `/api/metrics`, but the absent API is cut and replaced with an observed JSON file generated from a real scan of the repo.

## Open locally

```bash
npx --yes serve artifacts/folio-dash
# or
python3 -m http.server --directory artifacts/folio-dash 8080
```

A static server is **required** — the dashboard uses `fetch('data/skills-scan.json')`, which browsers block under `file://`. If you open it directly, the page shows a load error with this instruction.

## Manifest ledger

```
dep | kind | evidence | in artifact as
chart.js@4.4.1 (cdn.jsdelivr) | script | stated | index.html <script src>, pinned version path
skills-scan.json | data | observed | ./data/skills-scan.json (generated from repo scan 2026-06-24)
/api/metrics | api | absent | omitted — static JSON instead
folio-dash.surge.sh | publish-target | observed | surge CLI output (see handoff)
```

## Why this artifact exists

The design kit (`folio-kit`) had an empty ledger — zero deps. That's the easy case. This dashboard has a **non-empty ledger with an absent row**, which is where the discipline earns its keep:

- A naive agent dashboard calls `fetch('/api/metrics')` against a backend that doesn't exist, ships a broken page, and claims "live data."
- Folio's rule: `api` with evidence `absent` → add a `mock`/`data` row or remove the feature. So the metrics come from a real scan of the repo on disk, frozen as JSON. The page says "observed data," not "live."
- The one external script (Chart.js) is ledgered with a pinned version URL, and the SRI integrity hash was **not** fabricated — pinning the version path is the honest guarantee.

## Data freshness

Static snapshot from `2026-06-24`. Not live. To refresh, re-run the scan:

```bash
for s in anvil folio scribe prompt-mechanics; do
  echo "=== $s ==="
  grep -m1 '^version:' "$s/SKILL.md"
  wc -l < "$s/SKILL.md"
  find "$s/references" -name '*.md' | wc -l
  find "$s" -type f -name '*.md' -exec cat {} + | wc -l
done
```

## Theme seam

`<html data-theme="light|dark">` swaps the token block. Charts re-render on theme change by reading CSS variables.