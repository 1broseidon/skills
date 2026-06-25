# describe — worked examples

> **Human-only.** Do not load at runtime. Never load in skill references or agent context.
>
> Source: exercised against real files in `folio-site/` on 2026-06-24.

---

## Run 1 — local mode: `describe folio-site/artifacts/dashboard-skills-ledger/`

**Step 1 — Read HTML stamp.**

The stamp is embedded as a CSS block comment at the top of `index.html` (not an HTML comment — this is a multi-file artifact whose stamp lives inside the `<style>` block):

```text
/* Folio · slug: folio-dash · kind: dashboard · bundle: multi-file · host: local→surge
   deps: chart.js@4 (cdn.jsdelivr, pinned) · data: skills-scan.json (observed)
   data source: real scan of /home/george/Projects/skills on 2026-06-24
   backend: absent — replaced by static observed JSON (no /api/metrics)
   Hallmark: locked OKLCH tokens · roman headings · mobile-safe · AA contrast */
```

**Step 2 — Read site.json entry.**

```json
{
  "slug": "dashboard-skills-ledger",
  "kind": "dashboard",
  "bundle": "multi-file",
  "path": "/artifacts/dashboard-skills-ledger/",
  "entry": "index.html",
  "title": "Skills Ledger",
  "description": "Dashboard over the skills repo with real observed data",
  "ledger": [
    { "dep": "chart.js@4.4.1 cdn.jsdelivr", "kind": "script", "evidence": "stated",   "as": "index.html script tag, pinned version path" },
    { "dep": "skills-scan.json",             "kind": "data",   "evidence": "observed", "as": "./data/skills-scan.json, loaded via fetch('./data/skills-scan.json')" }
  ],
  "source": null,
  "published_url": "https://folio-samples.surge.sh/artifacts/dashboard-skills-ledger/",
  "last_published": "2026-06-24"
}
```

**Step 3 — Emit describe output block.**

```text
Artifact: dashboard-skills-ledger
Kind: dashboard
Bundle: multi-file
Title: Skills Ledger
Description: Dashboard over the skills repo with real observed data

Ledger:
  dep                    | kind   | evidence | as
  chart.js@4.4.1         | script | stated   | index.html <script> tag (cdn.jsdelivr, pinned path)
  skills-scan.json       | data   | observed | ./data/skills-scan.json, fetch('./data/skills-scan.json')

Provenance: original (source: null)

Publish:
  URL: https://folio-samples.surge.sh/artifacts/dashboard-skills-ledger/
  Last published: 2026-06-24

Entry: index.html
```

**Findings:** The stamp slug (`folio-dash`) does not match the site.json slug (`dashboard-skills-ledger`). This is advisory drift surfaced by the manifest-derivation check. The site.json is authoritative; the stamp was set before the slug was finalised.

---

## Run 2 — URL mode: `describe https://folio-samples.surge.sh/artifacts/explainer-folio-loop/`

**Step 1 — Check whether the per-artifact page embeds the site manifest.**

Verified by reading `folio-site/artifacts/explainer-folio-loop/index.html`: it does **not** contain an inline `<script>` block with the site manifest. The manifest JSON lives only in `folio-site/index.html` (the site index), where it appears as:

```js
var site = { "site": "folio-samples", "domain": "folio-samples.surge.sh", "artifacts": [...] };
```

Per-artifact pages carry only the HTML stamp (first line comment or CSS block comment). URL mode against a per-artifact page therefore resolves to stamp-only.

**Step 2 — HTML stamp (line 1 of the file).**

```html
<!-- Folio · slug: folio-explainer · kind: explainer · bundle: single-file · host: surge -->
```

**Step 3 — Emit describe output (stamp-only, remote).**

```text
Artifact: explainer-folio-loop   (from URL path; canonical slug from site.json)
  ⚠ Stamp slug mismatch: stamp says 'folio-explainer', directory is 'explainer-folio-loop'
Kind: explainer          (from stamp)
Bundle: single-file      (from stamp)
Title: unknown           (not available without site manifest)
Description: unknown     (not available without site manifest)

Ledger:
  unknown — per-artifact page does not embed the manifest; ledger only available from
  site index URL (https://folio-samples.surge.sh) or local site.json.

Provenance: unknown      (stamp does not carry provenance)

Publish:
  URL: https://folio-samples.surge.sh/artifacts/explainer-folio-loop/
  Last published: unknown (not available from stamp)

Entry: index.html
```

**Key finding:** `describe.md` claimed URL mode "parses the embedded manifest from the index's inline `<script>` block." That is only true for the site index URL (`https://folio-samples.surge.sh`), not for per-artifact URLs. `describe.md` has been corrected. See Task 4.
