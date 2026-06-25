# Slop test

Run after building, before handoff. Fix P0/P1; list P2 with reason.

## Universal gates (binary)

| Gate | P0 if fail |
| --- | --- |
| `opens-locally` | Entry does not load |
| `console-clean` | Uncaught error on primary path |
| `ledger-complete` | Undocumented external URL or data file |
| `no-secrets` | Key/token in source |
| `mock-labeled` | Fake data presented as live |
| `static-only` | `fetch()` to external API, WebSocket, or XHR to live endpoint |
| `visual-baseline` | Inline colors outside `:root`, italic headings, no token block |
| `publish-ready` | Publish claimed but URL not evidenced |

## Kind-specific smells

| Kind | P1 smell |
| --- | --- |
| doc | Broken anchor or missing section referenced in TOC |
| sheet | Columns misaligned or table overflows viewport without scroll |
| dashboard | Metrics with no data source row in ledger |
| explainer | Steps out of sequence or diagram renders empty |
| slides | Keyboard nav (← →) does not advance slides |
| tool | Primary action does nothing |
| landing | CTA href `#` or `javascript:void(0)` without reason |

## Visual smells (P1)

| Smell | Why it fails |
| --- | --- |
| Purple-to-blue gradient hero | AI tell #1 |
| Gradient headline (`background-clip: text`) | AI tell #2 |
| Three equal feature cards (icon · heading · body) | Template grid |
| Italic headings | AI tell |
| Pure `#000` / `#fff` surfaces | Flat, synthetic |
| Inline hex/rgb scattered outside `:root` | Breaks theme seam |

## Structural smells (P2)

- Inline styles duplicated 20+ times instead of variables/classes
- 500KB single-file with unused CDN libs
- `file://` fetch failure not documented
- Accessibility: no `<title>`, images without `alt` on informative imgs
- Every section padded identically (template spacing)

## Fix loop

Gate fails → fix cause → re-run that check → confirm pass. Do not hand off with P0.
