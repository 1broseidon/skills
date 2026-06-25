# folio describe

Read one artifact's manifest entry and emit a human-readable summary. The consumer surface for the canonical manifest.

## When to use

- A human asks "what is this artifact?" or "what does X depend on?"
- An agent needs to know an artifact's kind, ledger, or provenance before acting on it
- Before remix or audit, to understand what you're working with

## Inputs

`folio describe <path|url|slug>`

- **Local path:** `describe ./artifacts/explainer-folio-loop/` — reads the stamp from the HTML and, if a `site.json` exists at the site root, reads the full manifest entry (ledger, provenance, publish state).
- **Slug:** `describe explainer-folio-loop` — resolves via `site.json` if a site root is in scope.
- **URL (per-artifact page):** `describe https://folio-samples.surge.sh/artifacts/explainer-folio-loop/` — fetches the page and parses the HTML stamp only. Per-artifact pages do **not** embed the site manifest; they carry only the stamp comment. Ledger, provenance, and publish state are `unknown` in this mode.
- **URL (site index):** `describe https://folio-samples.surge.sh/` — fetches the site index, which embeds the full manifest as an inline `<script>` block (`var site = { … }`). Full ledger and artifact list are available. This is the only URL mode that gives manifest-level data.

## Output

```text
Artifact: explainer-folio-loop
Kind: explainer
Bundle: multi-file
Title: The Folio Loop
Description: Step-by-step walkthrough of the 7-step artifact flow

Ledger:
  dep | kind | evidence | as
  (none — system fonts, no CDN, no fetch)

Provenance: original (no source)

Publish:
  URL: https://folio-samples.surge.sh/artifacts/explainer-folio-loop/
  Last published: 2026-06-24

Entry: index.html
```

## What describe reveals that scanning HTML doesn't

- The **ledger** as structured data (not a regex over `https?://`)
- **Provenance** — whether this artifact was remixed, and from what
- **Publish state** — URL and date, with evidence
- **Bundle type** — single-file vs multi-file

## Relationship to the manifest

`describe` is the read surface for `.folio/site.json`. The manifest is the engine; `describe` is the steering wheel. Without it, the manifest is metadata bloat.

For standalone artifacts (no site root), `describe` reads the HTML stamp and reports what it can — kind, slug, bundle, deps — and marks provenance and publish state as `unknown`.