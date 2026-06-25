# Manifest ledger

The manifest ledger is Folio's contract artifact. Build it **before** writing HTML.

## Columns

```text
dep | kind | evidence | in artifact as
```

## Kind values

| Kind | Examples |
| --- | --- |
| `script` | CDN JS, inline script block |
| `style` | CDN CSS, Google Fonts stylesheet |
| `font` | Font files or font CDN |
| `image` | Remote or local images |
| `data` | CSV, JSON, GeoJSON on disk or embedded inline |
| `mock` | Stand-in data when real data is absent |
| `publish-target` | surge domain, gh-pages branch, CF project |

## Rules

1. **Every external URL** (script, style, font, img) gets a row.
2. **`data` files** must exist on disk or be generated in the same run with path cited.
3. **`mock` data** must be labeled as mock/sample in the artifact UI and README.
4. **`publish-target`** rows appear only for publish runs; URL filled after command output.

## Static-only (v0.2)

External API calls (`fetch()` to live endpoints, WebSocket, XHR) are **out of scope**. Folio artifacts are static documents. Data comes from:

- Embedded inline (JSON object in a `<script>`, CSV in a template literal)
- Local file loaded via `fetch('./data/…')` (requires static server — document in README)
- Generated at build time by the agent and written to disk

There is no `api` kind in the v0.2 ledger. If the user's request implies a live API, offer embedded/mock data instead — or hand the backend boundary to anvil.

## Example

```text
dep | kind | evidence | in artifact as
d3@7 cdn.jsdelivr | script | stated | index.html L12
chart.js@4.4.1 cdn.jsdelivr | script | stated | index.html L8
runs.csv | data | observed | ./data/runs.csv, loaded via fetch('./data/runs.csv')
metrics.json | mock | derived | ./data/metrics.json, labeled "Sample data" in UI
folio-dash.surge.sh | publish-target | observed | surge CLI output 2026-06-24
```

## Canonical site manifest

`.folio/site.json` is the **single source of truth**. Stamps, the index, and audit all **derive** from it — never hand-write kind/deps in three places.

```json
{
  "site": "latency-site",
  "domain": "latency-site.surge.sh",
  "published_url": null,
  "last_published": null,
  "artifacts": [
    {
      "slug": "explainer-latency-loop",
      "kind": "explainer",
      "bundle": "multi-file",
      "path": "/artifacts/explainer-latency-loop/",
      "entry": "index.html",
      "title": "Latency Explained",
      "description": "How p99 latency works",
      "ledger": [
        { "dep": "d3@7 cdn.jsdelivr", "kind": "script", "evidence": "stated", "as": "index.html L12" },
        { "dep": "runs.csv", "kind": "data", "evidence": "observed", "as": "./data/runs.csv" }
      ],
      "source": null,
      "published_url": null,
      "last_published": null
    }
  ]
}
```

### Per-artifact fields

| Field | Type | Purpose |
| --- | --- | --- |
| `slug` | string | Directory name under `artifacts/` |
| `kind` | enum | One of doc, sheet, dashboard, explainer, slides, tool, landing |
| `bundle` | enum | `single-file` or `multi-file` |
| `path` | string | Root-relative path from site root |
| `entry` | string | Entry HTML filename (usually `index.html`) |
| `title` | string | Display title in index and handoff |
| `description` | string | One-line summary for index |
| `ledger` | array | Per-artifact manifest ledger rows (deps, kind, evidence, as) |
| `source` | object\|null | **Provenance**: `{ "slug": "...", "site": "...", "url": "..." }` if remixed; null if original |
| `published_url` | string\|null | Full URL after publish (evidence from CLI output) |
| `last_published` | ISO date\|null | Last successful deploy date |

### Derivation rule

The HTML stamp and the index inline JSON are **derived** from `site.json`, not authored independently. When the manifest updates, regenerate the stamp and index. This eliminates triple-write drift.

### Standalone artifacts (no site)

A single artifact with no site root has no `site.json`. It is still a valid folio artifact — the stamp in its HTML is the only manifest. When a second artifact appears, the skill creates a site root, writes `site.json` from the existing stamps, and the standalone artifacts become entries. See `site-index.md` § Standalone-to-site upgrade.
