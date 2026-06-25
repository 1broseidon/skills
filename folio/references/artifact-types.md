# Artifact types

Pick **one** artifact kind per run. Kind drives structure, visual priority, verification depth, and what to skip.

## Kind table

| Kind | Reader gets | Typical shape | Skip |
| --- | --- | --- | --- |
| **doc** | A readable document with structure | sections, headings, prose, code blocks, tables, print-friendly CSS | Heavy interactivity, charts, live data |
| **sheet** | Tabular data to scan, sort, or filter | table with column headers, optional summary row, inline sparklines or badges | Visual flourishes, narrative prose |
| **dashboard** | Metrics at a glance with controls | KPI cards, charts (via ledgered CDN lib), filters, status indicators | Long prose, full CRUD |
| **explainer** | A concept walkthrough or data story | annotated diagrams, progressive reveal, step sequence, scroll narrative | Dense data tables, raw dumps |
| **slides** | A linear presentation | one-idea-per-slide, large type, keyboard nav (← →), minimal text | Scrolling layouts, interactive widgets |
| **tool** | One task accomplished | form → result, clipboard export, file download | Accounts, persistence, multi-step wizards |
| **landing** | Orientation and navigation | headline, feature summary, CTA links, footer | App-like interactivity, backend logic |

## Bundle choice

| Kind | Default bundle | When single-file |
| --- | --- | --- |
| doc (short), tool (small) | `single-file` | Always if < ~200 lines total |
| sheet, dashboard, explainer | `multi-file` | Only if user demands one file |
| slides, landing | `multi-file` | Rare |

## Audience (secondary pick)

| Audience | Optimize for |
| --- | --- |
| **human demo** | Clarity, readable type, obvious primary action |
| **teammate handoff** | README with open instructions, named data files |
| **agent handoff** | Manifest ledger, `.folio/site.json` if project uses it |
| **public visitor** | Security gates, no secrets, publish profile verified |

State in picks: `audience=human demo` (default) unless the user says otherwise.

## Migration from v0.1 kinds

Artifacts stamped with v0.1 kinds still work. Map on read:

| v0.1 kind | v0.2 kind |
| --- | --- |
| report | doc |
| visualization | explainer (or dashboard if metrics-focused) |
| demo | explainer |
| prototype | tool |
| playground | tool |
| dashboard | dashboard (unchanged) |
| tool | tool (unchanged) |
| landing | landing (unchanged) |
