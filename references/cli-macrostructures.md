# CLI macrostructures

**Pick one before writing commands.** Then load **only** `cli-macrostructures/<slug>.md`.

## Diversification

Must differ from last 3 entries for this `target` in `.anvil/log.json`. Default away from **Generic-Root-Run**.

## Index (v0.3 — surface patterns)

| # | Name | Slug | One line |
| --- | --- | --- | --- |
| 01 | Verb-Noun Tree | `01-verb-noun` | `tool resource verb` — `ledger invoice create` |
| 02 | Resource-Oriented | `02-resource-oriented` | Nouns first — `kubectl`-style `get`, `describe`, `delete` |
| 03 | Flat Pipeline | `03-flat-pipeline` | stdin/stdout contract, few subcommands |
| 04 | Config-First | `04-config-first` | Subcommands mirror config file sections |
| 05 | Context Switcher | `05-context-switcher` | Global `--profile` / `--context` drives all verbs |
| 06 | Single Shot | `06-single-shot` | One main action, flags only, no subcommand tree |
| 07 | Plugin Host | `07-plugin-host` | Core + `tool plugin <name>` dispatch |
| 08 | Workspace + Task | `08-workspace-task` | Monorepo selector then task verbs |
| 09 | Generic-Root-Run | `09-generic-root-run` | **Discouraged default** — only when brief demands |
| 10 | Operator Shell | `10-operator-shell` | Long-running `serve` + maintenance subcommands |
| 11 | Verb-Surface | `11-verb-surface` | Single layer of verbs with implicit subject — `cymbal`, `ketch`, `rg`, `jq` |

**Deep files drafted:** 01, 02, 03, 11. **Stubs:** add 04–10 as needed.

## Caller profile → surface-pattern preference

| Caller profile | Prefer | Avoid |
| --- | --- | --- |
| **agent** | 11-verb-surface · 03-flat-pipeline · 02-resource-oriented | 09-generic-root-run · 05-context-switcher (with global state) · deep verb-noun > 3 levels |
| human-operator | 02-resource-oriented · 03-flat-pipeline · 10-operator-shell | 09-generic-root-run |
| script | 01-verb-noun · 03-flat-pipeline · 11-verb-surface | 09-generic-root-run |
| sdk-client | 02-resource-oriented · 01-verb-noun | 11-verb-surface (too terse), 09-generic-root-run |
| internal-admin | 02-resource-oriented · 04-config-first · 08-workspace-task | 06-single-shot |

## Archetype pairing

Each macro file suggests default **ERR**, **CFG**, **HELP** codes from [`archetype-index.md`](archetype-index.md). Verb-Surface additionally pairs with BACKEND-01 (when plural backends) and ASYNC-01 (when long ops).
