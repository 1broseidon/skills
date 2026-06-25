# remix — worked example

Human-only. Documents a real local remix run against `folio-samples`, following `verbs/remix.md` step by step.

## Source

```text
folio-site/artifacts/doc-changelog-v023/index.html
  kind: doc
  bundle: single-file
  ledger: [] (no external deps)
  title: "Folio v0.2.x changelog"
```

The source is a backward-looking changelog — a release table, the load-bearing ideas, and a note about its own promotion.

## Flow (as run)

### 1. Inventory source

Local path — `folio-site/artifacts/doc-changelog-v023/`. No URL, no CORS concern.

### 2. Read source manifest

`folio describe doc-changelog-v023` (simulated):

```text
Artifact: doc-changelog-v023
Kind: doc
Bundle: single-file
Title: Folio v0.2.x changelog
Ledger: (none)
Provenance: original (no source)
```

Inherited: kind=doc, structure (h1 + lede + table section + list section + "this artifact" section), token block, light/dark toggle.

### 3. Copy to new slug

```bash
cp -r folio-site/artifacts/doc-changelog-v023 folio-site/artifacts/doc-changelog-v024-remix
```

Source preserved; new slug chosen to carry the remix intent in the name.

### 4. Rebuild ledger

Source ledger was empty; remix adds no new deps. Ledger stays `[]`.

### 5. Record provenance

`site.json` entry for the remix:

```json
{
  "slug": "doc-changelog-v024-remix",
  "kind": "doc",
  "bundle": "single-file",
  "path": "/artifacts/doc-changelog-v024-remix/",
  "title": "Folio roadmap — what's next",
  "description": "A remix of the v0.2.x changelog, repurposed to look forward — open questions and principles to hold",
  "ledger": [],
  "source": { "slug": "doc-changelog-v023", "site": "folio-samples", "url": "https://folio-samples.surge.sh/artifacts/doc-changelog-v023/" },
  "published_url": null,
  "last_published": null
}
```

The `source` field is the provenance record. It is not null — the remix has a known origin.

### 6. State diff

```text
Preserve: token block, layout, doc structure (h1 + lede + table + list + note), light/dark toggle, print CSS
Change:   title, lede intent (backward → forward), table content (releases → open questions), list content (ideas → principles), "this artifact" note
```

Risk label: **remix-safe** (data/content swap only, no new deps, mock labels intact, no publish URL reuse).

### 7. Follow artifact flow

Stamp updated to new slug. Content swapped. Gates run:

```text
opens-locally:   pass (file://, console clean)
console-clean:   pass
ledger-complete: pass (empty ledger, no external deps)
no-secrets:      pass
static-only:     pass
visual-baseline: pass (inherited token block, no italic headings, overflow-x clip)
manifest-derivation: pass (stamp slug = site.json slug, kind matches)
```

### 8. Handoff

```text
Source:      folio-site/artifacts/doc-changelog-v023/
Remix:       folio-site/artifacts/doc-changelog-v024-remix/
Provenance:  source.slug = doc-changelog-v023, source.site = folio-samples
Risk label:  remix-safe
```

## What this proves

- **Local remix is lossless.** Full file access, complete ledger, clean provenance — no CORS, no partial fork.
- **Provenance is recorded, not implied.** The `source` field in `site.json` is the durable record; `describe` reads it; `audit` checks it.
- **The remix inherits structure, not just files.** The token block, layout, and doc shape carried over unchanged; only content moved. That's the point — "make another one like this" without rebuilding from scratch.

## What this does NOT prove

- Remote-URL remix (CORS blocks subresources in the agent environment — documented limitation, not run here).
- Cross-account remix (out of scope).
- Remix that adds a new external dep (would be `ledger add` risk label, not `remix-safe` — not exercised here).