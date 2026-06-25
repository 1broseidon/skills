# folio.md convention artifact

Opt-in project conventions. Create when the user says "lock folio defaults", "give me folio.md", or the project already ships a site root with multiple artifacts.

## Suggested sections

```markdown
# Folio conventions

## Site root
- Location: `folio-site/`
- Index: auto-generated, reads `.folio/site.json` inline
- Slug pattern: `<kind>-<descriptor>` (e.g., `explainer-folio-loop`)

## Host
- Default profile: local
- Publish profile: surge
- Domain: `myteam-folio.surge.sh` (recorded in `.folio/site.json`)

## CDN allowlist
- d3@7 (jsdelivr)
- chart.js@4 (cdnjs)

## Stamps
- HTML comment stamp required on every artifact's index.html

## Agent handoff
- Write `.folio/site.json` at site root
- One domain hosts all artifacts as paths
```

Once `folio.md` exists, read it during inventory. House defaults override skill defaults.

## .folio/site.json

Machine-readable site manifest at the site root. Records domain and artifact registry. The site index embeds it inline. See `site-index.md` for the full schema.

Do not require `folio.md` for a one-off artifact.