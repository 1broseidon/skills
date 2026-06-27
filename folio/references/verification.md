# Verification

Prove the artifact runs before handoff. Prefer commands the user can repeat.

## Matrix template

```text
check | command/evidence | result | notes
```

## Checks by host profile

### All profiles

| Check | How |
| --- | --- |
| Entry exists | `test -f <dir>/index.html` |
| Relative links | Open primary nav/links or `rg 'href="'` for off-tree paths |
| Ledger match | Compare ledger rows to `rg 'https?://'` in HTML/JS |
| Primary interaction | Click/type through main user path |
| Console | DevTools or automated smoke — no uncaught errors on primary path |

### local

| Check | How |
| --- | --- |
| Serves | Start a static server from the **site root** (not the artifact subdir) — `node <folio-skill>/scripts/serve.js <site-root>`, or a manual runtime; probe with `curl -sI http://127.0.0.1:<port>/`. See `references/local-server.md` for run modes, runtime probe order, reuse-before-spawn, and bind/port guidance. |
| fetch/data | If JS uses `fetch`, confirm load works via server — not `file://` (see host-profiles.md for why `file://` breaks relative fetches and module imports) |

### share (tunnel)

| Check | How |
| --- | --- |
| Local first | The artifact passes `local` verification before the tunnel opens — a tunnel to a broken server is a broken link |
| Public URL | Use the **observed** URL printed by `scripts/share.js`; never invent one |
| Reachable (optional) | When the sandbox allows egress, `curl -sI <url>/` returns 200 and one artifact path loads |
| Ephemeral noted | Handoff states the link is temporary (dies with the process), not a deploy |

### surge / gh-pages / cf-pages / cf-worker

| Check | How |
| --- | --- |
| HTTP 200 | `curl -sI <url>` |
| Primary interaction | Load published URL in browser |
| URL evidence | URL copied from publish CLI output |

### Mobile responsiveness

Check at 320px, 375px, 414px, 768px viewport widths:

```text
check | how | result
No horizontal scroll | scrollWidth === clientWidth at each width | pass/fail
Text readable | no text < 14px, no text overflow | pass/fail
Touch targets | buttons/links ≥ 44px height | pass/fail
Grids reflow | multi-column → single-column on mobile | pass/fail
```

Use `playwright-cli` or equivalent to set viewport and check `document.documentElement.scrollWidth > document.documentElement.clientWidth`.

### Favicon

Browsers auto-request `/favicon.ico` and log a 404 to console if missing. Include an inline favicon in every artifact:

```html
<link rel="icon" href="data:image/svg+xml,...">
```

Or include a `favicon.ico` / `favicon.svg` file in the bundle. A missing favicon fails `console-clean`.

### Per-kind interaction checks

| Kind | Check |
| --- | --- |
| slides | Keyboard ← → advances, slide counter updates |
| sheet | Column sort works, table scrolls horizontally on mobile |
| tool | Primary action produces output, copy/export works |
| dashboard | Filters respond, charts render with real dimensions |
| explainer | Progressive steps flow in order |
| doc | Anchor links resolve, print stylesheet hides chrome |
| landing | All links resolve to real URLs |

## Optional snippet execution

Running headless browser tests is repo-dependent. Never claim "tested in browser" without loading the page or running a smoke script.

Record blocked checks as `not run` with reason.

## Manifest derivation check

**Advisory gate** (`manifest-derivation`). Folio has no build step — stamps and `site.json` are kept in sync by the agent. This check flags drift between the two so it can be corrected before handoff or publish.

### What to check

The HTML stamp (slug, kind, bundle) must match the `site.json` entry for that artifact directory. Three fields:

| Field | Stamp source | site.json field |
|---|---|---|
| slug | `slug: <value>` in stamp comment | `artifacts[n].slug` |
| kind | `kind: <value>` in stamp comment | `artifacts[n].kind` |
| bundle | `bundle: <value>` in stamp comment | `artifacts[n].bundle` |

### Command pattern

```bash
# 1. Extract stamp fields from entry HTML
grep -oP '(?<=slug: )[^ ·]+' artifacts/<slug>/index.html     # stamp slug
grep -oP '(?<=kind: )[^ ·]+' artifacts/<slug>/index.html     # stamp kind
grep -oP '(?<=bundle: )[^ ·]+' artifacts/<slug>/index.html   # stamp bundle

# 2. Extract site.json fields for that artifact
jq '.artifacts[] | select(.slug == "<slug>") | {slug, kind, bundle}' .folio/site.json

# 3. Compare. Any mismatch = advisory drift.
```

### Interpreting results

- **Slug drift:** stamp was written before the slug was finalised, or was given a short working name. Update the stamp to match `site.json`.
- **Kind drift:** artifact kind changed after initial build. Update the stamp or the site.json entry to agree.
- **Bundle drift:** file structure changed (e.g. split single-file into multi-file). Reconcile both places.

### Advisory, not blocking

This gate is advisory. Slug drift does not break the artifact — the browser uses the directory path, not the stamp slug. However, `describe` and `audit` will surface the mismatch, and stale stamps confuse future agents reading the artifact. Fix before publish.

---

## Handoff minimum

Include at least: serve/open command, console result, mobile width result, publish curl (if applicable).
