# CLI macrostructure · 11 · Verb-Surface

`<tool> <verb> [args] [flags]` with **no explicit noun layer**. The verb implies the subject because the tool's whole identity is the subject.

**Pattern:** `cymbal search foo`, `ketch scrape https://…`, `rg pattern`, `jq '.field'`, `fd <name>`. The subject ("symbols", "web pages", "lines of text", "JSON values") is the entire raison d'être of the tool, so naming it again at every call is noise.

Distinct from Verb-Noun Tree (`ledger invoice create`) — Verb-Surface keeps the noun *implicit*. Distinct from Resource-Oriented (`kubectl get pods`) — Resource-Oriented makes the noun the primary axis, with verbs as flags-on-noun.

## When to pick it

- The tool has **one dominant subject** that defines the binary.
- You expect agents and pipelines to invoke 100s of times per session — every saved level of depth pays.
- The verb count is reasonable (5–15). Beyond ~20, drift toward Resource-Oriented.
- All verbs operate on the same conceptual subject — no `<tool> users create` mixed with `<tool> search foo`.

**Avoid** when the tool spans multiple resource types with distinct lifecycles (then go Resource-Oriented), or when there's truly one action (then go Single-Shot).

## Caller-profile fit

| Caller profile | Verdict |
| --- | --- |
| **agent** | Strongly preferred. Shallow tree = fewer `--help` round-trips. |
| **script** | Good. Many classic UNIX tools fit. |
| human-operator | OK if the subject is operational state. |
| sdk-client | Weak. Public SDK-style surfaces usually want a richer noun layer for discoverability. |

## Skeleton

```
<tool>                       # root: short help, lists verbs
<tool> <verb-1> ARG...       # leaf verb
<tool> <verb-2> ARG...       # leaf verb
<tool> <verb-2> <sub>        # nested only when the verb fans into modes (e.g. `crawl status`, `crawl stop`)
<tool> config [show|set]     # introspection
<tool> completion <shell>    # cobra default
<tool> version               # cobra default
```

Two layers max for the leaf path. Three only when ASYNC-01 background pattern requires it (`<verb> status`, `<verb> stop`).

## Verb count discipline

The number of top-level verbs is the macrostructure's main risk. Anvil's gates:

- ≤5 verbs · ideal — `jq`, `rg`-class
- 6–10 verbs · normal — `ketch`-class
- 11–15 verbs · acceptable if grouped — `cymbal`-class (search, show, refs, impact, trace, impls, importers, outline, investigate, context, structure, ls, hook, diff, index)
- 16+ verbs · the tool wants Resource-Oriented; root help is unreadable

Anvil flags >15 verbs in audit. The fix is usually to introduce a noun layer (Resource-Oriented) or fold related verbs (`refs` + `impact` + `trace` → `<tool> graph --kind=refs|callers|callees`).

## Flag inheritance

- **Persistent (root):** `--json`, `--max-chars`, `--no-color`, `-q/--quiet`, `-v/--verbose`, config path. Anything that should apply across every verb.
- **Per-verb local:** verb-specific tuning.
- **No global feature toggles via flag.** Use env vars for stable toggles; flags drift between humans and scripts.

## Help shape

Root `--help`:

```
<tool> is a [one-line description].

Usage:
  <tool> [command]

Available Commands:
  verb-1      [one-line]
  verb-2      [one-line]
  ...

Flags:
  --json              output as JSON
  --max-chars int     truncate output to N chars (0 = disabled)
  --no-color          disable ANSI even on TTY
  -h, --help          help for <tool>
```

Leaf `--help` shows examples first, then flags. Include at least one pipeline example.

## Output format defaults

The agentic-friendly trio: **text · json · minimal**.

| Mode | Default? | Shape |
| --- | --- | --- |
| text | yes (TTY only) | human columns, ANSI if TTY |
| json | `--json` | NDJSON for streams, JSON document for scalars |
| minimal | `--minimal` | tab-separated, one record per line, no decoration |

Add `--trim` only if markdown is a return type (like `ketch scrape`).

## Default archetype pairing

- ERR · ERR-01 with structured stderr block on `--json`
- CFG · CFG-01 (flags > env > file > defaults), env prefix matches tool name
- HELP · HELP-01 examples per leaf
- BACKEND · BACKEND-01 if there are pluggable backends (search engines, code search providers, etc.)
- ASYNC · ASYNC-01 if any verb routinely runs >5s (`crawl`, `index`, `scrape <huge>`)

## Reference tools to study

- `jq` — single verb implicit (`jq '<filter>'`); flags only. Pure pipeline.
- `rg` (ripgrep) — single verb implicit (`rg <pattern>`); 80+ flags but no subcommands. Pipeline.
- `fd` — same shape as `rg` for filenames.
- `ketch` — 7 top-level verbs; pluggable backends; background ops.
- `cymbal` — 15 top-level verbs; pushes the limit; uses sub-verbs only for hook (`hook install`, `hook notify`).
- `gh` — Resource-Oriented (`gh pr create`), not Verb-Surface, but a useful contrast.

## Anti-patterns specific to this macro

| Tell | Why |
| --- | --- |
| **Verb explosion past 15** | Root `--help` becomes a wall; agents struggle to discover capabilities |
| **Inconsistent verb depth** | `<tool> search` (leaf) next to `<tool> server start` (nested) — pick a level |
| **Hidden modal flags** | `<tool> verb -x` does something completely different than `<tool> verb` — refactor to two verbs |
| **Implicit "run" verb at root** | `<tool> foo bar` interpreted as `<tool> run foo bar` — agents can't predict |
| **Mixed noun-verb at top** | `<tool> search` (verb) + `<tool> profiles` (noun, plural) — pick one |
