# folio-kit

A self-contained design kit — tokens, type, and components that theme from one seam. Built as a Folio artifact.

## Open locally

```bash
npx --yes serve artifacts/folio-kit
# or
python3 -m http.server --directory artifacts/folio-kit 8080
```

Then open the printed localhost URL.

## Manifest ledger

```
dep | kind | evidence | in artifact as
(none — system fonts, no CDN, no fetch, no API)
folio-kit.surge.sh | publish-target | observed | surge CLI output 2026-06-24, HTTP 200 verified
1782280619142-folio-kit.surge.sh | publish-target | observed | surge live-preview URL (ephemeral revision)
```

- **Bundle:** single-file (`index.html`)
- **Deps:** none. System font stack via CSS custom properties; no `<script src>`, no `fetch`, no external API.
- **Theme seam:** `<html data-theme="light|dark">` swaps the `:root` / `[data-theme]` token block. Preference persisted to `localStorage`, falling back to `prefers-color-scheme`.

## Theming

All color, type, spacing, radius, and shadow values resolve through `var(--token)`. To re-skin, edit the token block at the top of `index.html` (the `:root` and `[data-theme="dark"]` rules). No inline OKLCH/hex elsewhere.

## Verification

- Serves via static server; entry loads, console clean.
- Mobile-safe at 320 / 375 / 414 / 768px (`overflow-x: clip`, `minmax(0, 1fr)` grids).
- AA contrast on ink/paper and accent/paper in both themes.
- Toggle persists theme across reloads.