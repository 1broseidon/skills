# folio remix

Fork an existing artifact (local path preferred) and modify it while preserving manifest honesty and recording source lineage.

## Use when

- User wants a variant ("same dashboard but for Q2 data")
- Starting from a prior artifact in the same site
- Iterating without destroying the original

## Flow

1. **Inventory source** — local path preferred. If a URL is given, fetch HTML only (subresources may fail CORS — note `not run` for full tree mirror; remote remix is a documented limitation, not a marquee feature).
2. **Read source manifest** — run `folio describe` on the source to get its kind, ledger, and provenance. The remix inherits the kind and structure.
3. **Copy** to new slug: `artifacts/<new-slug>/` — do not overwrite source unless asked.
4. **Rebuild ledger** from source + new inputs. Mark inherited deps as `observed` from source files.
5. **Record provenance** — set `source` in the new artifact's `site.json` entry: `{ "slug": "<source-slug>", "site": "<site-name>", "url": "<full-url-if-published>" }`. Null only if the source is unknown.
6. **State diff** — what changes vs preserved:
   ```text
   Preserve: layout, chart types, CSS tokens
   Change: data file, title, color accent
   ```
7. Follow normal **artifact flow** from picks onward.
8. Handoff with both source and new paths, and the provenance link.

## Risk labels

| Change | Label |
| --- | --- |
| Data swap only | remix-safe |
| New external script | ledger add |
| Removed mock label | P0 — fix before handoff |
| Publish URL reuse | forbidden — new URL or explicit teardown |
| Provenance not recorded | P1 — fix before handoff |

## Limitations

- **Remote-URL remix is partial.** CORS blocks subresources in the agent environment; the fork may miss CSS/JS/data files. Document this in the handoff.
- **No cross-account remix.** The source must be readable by the agent (local path or public URL). Private or auth-gated sources are out of scope.
- **Prefer local remix.** When the source is in the same site, the remix is lossless: full file access, complete ledger, clean provenance.

## Worked example

A real local remix run is documented in `references/examples/remix-worked.md` (human-only). It forks `doc-changelog-v023` into `doc-changelog-v024-remix`, preserves structure, swaps content, and records provenance — the `remix-safe` path end to end.
