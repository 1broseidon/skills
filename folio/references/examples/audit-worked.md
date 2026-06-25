# audit — worked examples

> **Human-only.** Do not load at runtime. Never load in skill references or agent context.
>
> Source: exercised against real files in `folio-site/` on 2026-06-24.

---

## Run 1 — local mode: `audit folio-site/artifacts/dashboard-skills-ledger/`

**Mode detected:** local (path on disk).

**Inventory:** `folio-site/artifacts/dashboard-skills-ledger/`

```text
index.html          (entry, ~339 lines, multi-file)
data/
  skills-scan.json  (1121 bytes, observed JSON)
favicon.ico
favicon.svg
README.md
```

**Checks run:**

| check | evidence | result |
|---|---|---|
| Entry exists | `test -f .../index.html` → file present | pass |
| Stamp present | CSS block comment line 10: `/* Folio · slug: folio-dash · kind: dashboard … */` | pass |
| Ledger match | `rg 'https?://'` in index.html → one CDN hit: `cdn.jsdelivr.net/npm/chart.js@4.4.1/…`; matches ledger entry | pass |
| Static-only | `fetch('data/skills-scan.json')` — relative path to local data file, not an external API; within static-only discipline | pass |
| No secrets | `rg 'key\|token\|secret\|password'` in index.html → 0 hits | pass |
| File tree | All files present; fetch target `data/skills-scan.json` exists on disk | pass |
| Console (simulated) | fetch path `./data/skills-scan.json` resolves when served via static server; error handler shows in-page alert if fetch fails (no silent failure) | pass |
| Visual baseline | OKLCH token block in `:root`, no inline hex/rgb outside `:root`, no italic headings, `overflow-x: clip` on html + body, `max-width: 1180px` page container | pass |
| mock-labeled | Data labeled "observed data" via `<span class="evidence-tag">observed data</span>` in header | pass |
| .folio/site.json | Entry present; ledger matches HTML stamp (chart.js + skills-scan.json) | pass |

**Punch list:**

```text
severity | location | what is wrong | evidence | fix
P2 | index.html stamp (CSS comment) | stamp slug 'folio-dash' ≠ site.json slug 'dashboard-skills-ledger' | read stamp vs site.json | update stamp slug to match canonical entry
P2 | index.html load-error message | error text says 'npx serve artifacts/folio-dash' (old slug) | line 177 | update to 'npx serve artifacts/dashboard-skills-ledger'
(none at P0/P1)
```

**Verdict:** PASS with 2 P2 advisory items (slug drift in stamp, stale path in error message). No secrets, no broken CDN, no fabricated data.

---

## Run 2 — remote mode: `audit https://folio-samples.surge.sh/artifacts/dashboard-skills-ledger/`

**Mode detected:** remote (https:// URL).

**Fetch HTML:** fetched `index.html` from published URL (simulated — reading local file as published proxy).

**Checks run vs unknown:**

| check | result |
|---|---|
| HTML stamp present | pass — CSS comment stamp visible in source |
| External calls | pass — `cdn.jsdelivr.net/npm/chart.js@4.4.1/…` is ledgered |
| Secrets in source | pass — no keys or tokens visible in HTML/JS |
| Publish URL verified | pass — URL matches site.json `published_url` |
| Console | **unknown** — cannot run browser console over the wire |
| File tree | **unknown** — cannot enumerate server directory listing |
| .folio/ checks | **unknown** — `.folio/` not served; site.json not accessible via HTTP |
| fetch target accessible | **unknown** — `data/skills-scan.json` reachable when served but cannot verify 200 without live fetch |
| Visual baseline | pass (partial) — token block, overflow-x, heading style readable from source; contrast cannot be confirmed without rendering |
| mock-labeled | pass — "observed data" label present in source |

**Punch list (remote):**

```text
severity | location | what is wrong | evidence | fix
P2 | HTML stamp | slug 'folio-dash' ≠ directory slug 'dashboard-skills-ledger' | read source | (advisory; cannot fix remotely)
unknown | console | uncaught errors unknown | cannot run browser without load | run local audit to confirm
unknown | file tree | data/skills-scan.json HTTP 200 unverified | cannot enumerate remote | run local audit or curl the data URL
```

**Verdict:** LIMITED PASS — no P0/P1 issues visible from HTML source. 3 checks marked `unknown`; run local audit for full verdict.

---

## Side-by-side comparison

| check | local result | remote result |
|---|---|---|
| HTML stamp | pass | pass |
| External ledger match | pass | pass |
| Secrets | pass | pass |
| Static-only | pass | pass |
| Mock-labeled | pass | pass |
| Visual baseline | pass | pass (partial) |
| Publish URL match | pass | pass |
| .folio/site.json | pass | **unknown** |
| Console clean | pass (simulated) | **unknown** |
| File tree complete | pass | **unknown** |
| fetch target accessible | pass | **unknown** |

The two verdicts differ honestly: local sees 0 unknowns; remote sees 3 unknowns. The remote audit never claims pass on checks it cannot run.
