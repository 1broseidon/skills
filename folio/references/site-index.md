# Site index

Folio artifacts live under one site root and publish as one domain. The site index is the browseable entry point.

## Structure

```text
site-root/
  index.html          # site index — lists all artifacts, grouped by kind
  artifacts/
    <slug>/
      index.html      # the artifact
      ...
  .folio/
    site.json         # site manifest: domain + artifact registry
```

## Site manifest (`.folio/site.json`)

```json
{
  "site": "folio-samples",
  "domain": "folio-samples.surge.sh",
  "published_url": null,
  "last_published": null,
  "artifacts": [
    {
      "slug": "explainer-folio-loop",
      "kind": "explainer",
      "path": "/artifacts/explainer-folio-loop/",
      "title": "The Folio Loop",
      "description": "Step-by-step walkthrough of the 7-step artifact flow",
      "last_published": null
    }
  ]
}
```

The index page embeds this data inline (not fetched — static-only rule). The site index reads it and renders artifacts grouped by kind.

## Slug convention

Two patterns, both valid:

| Pattern | When | Examples |
| --- | --- | --- |
| `<kind>-<descriptor>` | Kind is part of the identity | `explainer-folio-loop`, `doc-release-notes`, `slides-intro` |
| `<descriptor>` alone | Kind is obvious or user named it | `chart-297`, `custom-tool`, `latency-hist` |

The kind always lives in the folio stamp and the site manifest. The index groups by kind even when the slug doesn't carry it.

## Index page

The index is itself a folio artifact (`kind: landing`). It:

- Embeds the site manifest inline (JSON in a `<script type="application/json">` block)
- Groups artifacts by kind, showing kind label + count
- Lists each artifact as: title, description, slug
- Links to each artifact at its relative path (`/artifacts/<slug>/`)
- Carries a **filter box**: type to narrow by title, description, or slug; empty kind groups collapse; `/` focuses the box, `Esc` clears it
- Follows the visual baseline (token block, no italic headings, mobile-safe)
- Includes a light/dark toggle

## Regenerating the index

The index **derives** from `.folio/site.json` — never hand-edit the embedded JSON. Regenerate it with the bundled generator (zero npm deps, Node stdlib only):

```bash
node <folio-skill>/scripts/gen-index.js <site-root>
```

The launcher `scripts/serve.js` runs this automatically on every local launch, so the index/search page stays current while you serve. To regenerate without serving, run the generator directly. It reads `<site-root>/.folio/site.json` and writes `<site-root>/index.html`. It is idempotent. Run it:

- After adding, removing, or renaming an artifact
- After editing any artifact's `title`, `description`, `kind`, or ledger in `site.json`
- As a fixed step in every publish (see `references/verbs/publish.md`)

This retires the manual-sync drift class: the filter and the list both read the same embedded data, which the generator guarantees matches `site.json`.

## Standalone artifacts (no site root)

A single artifact can exist without a site root — just a folder with `index.html`. The HTML stamp is the only manifest. This is the default for one-off requests.

### Standalone-to-site upgrade

When a second artifact appears, the skill upgrades:

1. Create site root structure: `site-root/index.html`, `site-root/artifacts/`, `site-root/.folio/`
2. Move existing artifact(s) into `site-root/artifacts/<slug>/`
3. Write `.folio/site.json` by reading the stamps from each artifact's HTML
4. Generate the site index: `node <folio-skill>/scripts/gen-index.js <site-root>`

No rework — the artifacts themselves don't change; they just gain a parent.

## When a new artifact is added to an existing site

1. Build the artifact at `site-root/artifacts/<slug>/index.html`
2. Add an entry to `.folio/site.json` `artifacts` array (including the per-artifact ledger)
3. Regenerate the index: `node <folio-skill>/scripts/gen-index.js <site-root>` (derivation rule — no triple-write)
4. Re-publish the whole site root (see `verbs/publish.md`)

The index updates automatically because it derives from the manifest via the generator.

## Domain naming

`<name>.surge.sh` where `<name>` is either:
- User-chosen: `george-folio`, `my-team-demos`
- Auto-generated: `folio-<random-4>` if user doesn't care

One domain per site. The skill remembers it in `.folio/site.json` so subsequent publishes go to the same place.

## Why not one subdomain per artifact

- Subdomain sprawl — surge accounts hit limits
- No browseable index — visitors can't discover all your artifacts
- No shared navigation between related artifacts
- Harder to share ("here's my folio site" vs "here are 7 URLs")