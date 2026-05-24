# Caller profile · agent

For CLIs and services **designed to be called by AI agents, scripts, and other programs** as much as by humans. The 2025–2026 genre that didn't exist when most CLI conventions were written. Examples to study: `gh`, `jq`, `rg`, `cymbal`, `ketch`, `op` (1Password), `aws --output json`.

The defining inversion: **the machine is the primary user; the human is the rarer one.** Every design pick is graded on "does an LLM / shell pipeline get the right answer in one call?" before "does it look nice to a human reading help?"

## Hard rules

### Output

- **`--json` (or `-o json`) is a first-class flag, not a feature.** Available on every subcommand that emits data. Schema is stable across releases — agents memorise field names.
- **Default to NDJSON / JSON-Lines for streaming results**, not pretty-printed arrays. One result per line, parseable line-by-line.
- **One stream per channel.** Results to stdout. Logs/progress to stderr. Never mix.
- **TTY detection sets *defaults*, not capabilities.** ANSI colour ON when stdout is a TTY; OFF when piped — without the user passing a flag. Provide `--no-color` and respect `NO_COLOR=1` (the [no-color.org](https://no-color.org/) convention).
- **Token-bounded output is built in.** Every command that can emit long content carries `--max-chars`, `--minimal` (one result per line, tab-separated), and (when markdown is in play) `--trim`. The defaults pick reasonable budgets, not "everything".
- **Deterministic ordering.** When the surface enumerates results, the order is documented and stable (alphabetical, score-descending, mtime-descending — name it). Agents diff outputs across runs.
- **No emojis or unicode decoration in default output.** Optional under a `--pretty` flag; never on by default.

### Input

- **Batch over loop.** Accept multiple targets in one invocation (`cymbal show Foo Bar Baz`) instead of forcing the agent to call N times. Add `--stdin` to read newline-separated inputs from a pipe.
- **JSON in for structured callers.** When a subcommand takes complex input, accept `--input-file -` reading a JSON document from stdin. Documented in help.
- **No interactive prompts.** No `(y/N)` confirmation that blocks unattended runs. Destructive operations require `--yes` (or `--force`) instead. Honour `CI=1` / `NONINTERACTIVE=1` as forced non-interactive even if a TTY is attached.
- **Tab completion still matters** — agents use it indirectly via shell tools, and humans still drive the CLI sometimes. Generate completions, but don't make completion errors fatal.

### Exit codes

- **Granular.** At minimum: `0` success · `1` generic user error · `2` validation error · `3` not found · `4` upstream / network · `5` precondition / state · `6` cancelled · `64–78` `sysexits.h` codes for traditional fits.
- **Documented in help footer or `conventions.yaml`.** Agents script against exit codes; opaque `1` for everything is hostile.
- **No `2` for "command not found in cobra"** — let cobra's default be the user error, but redirect distinct failure classes to distinct codes inside `RunE`.

### Introspection

- **`<tool> config`** (or `<tool> config show`) returns the **effective config as JSON**: every flag's resolved value, every env var that was read, every backend / plugin / dynamic option discovered at runtime. `ketch config` is the reference shape. Both humans and agents use this to debug "wait, what's it actually using right now?"
- **`<tool> version --json`** carries semver + commit + build time. OpenAPI / proto `info.version` matches.
- **Available subcommands / plugins are listable.** If the tool supports pluggable backends or external commands, `<tool> backends list` (or equivalent) emits them. Agents discover capability surface from the tool itself, not from a website.

### Schemas

- **Stable wire format.** Once an emit shape is shipped, fields are never renamed and never deleted in the same major version — only deprecated then removed at the next major. Additions are backward-compatible (new fields the parser ignores).
- **Document the schema.** If `--json` returns shapes the agent has to learn, a `<tool> schema <command>` subcommand (or a JSON Schema file shipped alongside the binary) makes those shapes explicit. Optional but a strong signal of agentic intent.
- **Avoid polymorphic emits unless deliberate.** A command that returns different shapes based on input kind (à la `cymbal investigate`) is allowed *if* the kind is reported in a top-level field (`"kind": "function" | "type" | "package"`) so the agent can branch. Otherwise agents get fragile.

### Failure surface

- **Structured stderr for errors when `--json` is on**: `{"error":{"code":"NOT_FOUND","message":"symbol not specified","details":{...}}}`. One line, parseable.
- **Actionable text errors when not `--json`**: name the offending arg, suggest the fix. *"unknown flag --max-char (did you mean --max-chars?)"*.
- **Cancellation honoured.** SIGINT / SIGTERM trigger a clean exit with code `6`; in-flight network calls are cancelled, partial output is not silently truncated as if successful.

### Help

- **Help text is part of the contract.** Defaults shown in `<tool> <cmd> --help` must match actual defaults in code. Drift fails slop gate A05.
- **Examples are real invocations.** Never invented. Each leaf command shows ≥1 example that copies-and-pastes cleanly. Pipeline examples included (`<tool> search foo | jq '.[] | .file'`).
- **List every flag, no surprises.** No hidden flags. No "agentic mode" turned on by env var without a help mention.

## Soft rules

- **Quiet success.** Successful operations may emit nothing to stdout (UNIX-y). Agents check exit codes; humans check "did anything go wrong" prompts. The exception: data-emitting commands obviously emit data on success.
- **Idempotency where reasonable.** `<tool> resource set foo --to bar` is preferable to `<tool> resource create foo` + `<tool> resource update foo` when the brief doesn't distinguish.
- **Cardinality discipline in logs.** Log field values must be bounded — never log a per-request unique value as a *key*. Per-user IDs in metric labels = cardinality explosion. Bound the cardinality of every label/field.
- **No telemetry beacons by default.** If the tool phones home, it's opt-in with a documented endpoint, behind a flag and an env var. Agents running in sandboxes will block egress and your tool must not hang.

## Surface-pattern preferences

The agent caller profile pairs best with these CLI patterns:

- **11-verb-surface** — single layer of verbs with implicit subject. `cymbal search`, `ketch scrape`. Fewest hops for the agent.
- **03-flat-pipeline** — `stdin → tool → stdout` composition. `rg`, `jq`.
- **02-resource-oriented** — when the surface area is genuinely bigger (`kubectl`, `gh`). Still keep verbs explicit.

Avoid for agent callers:

- **09-generic-root-run** — banned. The agent wants verbs.
- **05-context-switcher** with global state — bad for stateless agent calls. Profiles must be a flag, not a persistent setting.
- Deep verb-noun trees over 3 levels — every level is another `--help` round-trip for the agent.

## Archetype preferences

| Axis | Pick | Why |
| --- | --- | --- |
| Errors | **ERR-03 (gRPC rich) for services · ERR-01 + structured stderr for CLIs** | Agents need machine-readable error codes |
| Config | **CFG-02 (env-only / 12-factor)** for services · **CFG-01 (flags > env > file > defaults)** for CLIs | Predictable from outside |
| Health | **HEALTH-02 (gRPC + deps)** for services | Agents check readiness before calling |
| Help | **HELP-01 (examples per leaf)** | Examples are the agent's training data |
| Backend | **BACKEND-01 (pluggable + introspectable)** when applicable | `ketch -b brave` style; `config` lists `available_backends` |
| Async | **ASYNC-01 (background + handle)** for ops > 5s | `<tool> op --background → id`, `<tool> op status <id>` |

See [`../archetype-index.md`](../archetype-index.md) for caller-profile routing tables.

## Contract defaults

Default contracts: machine output, config introspection, stable error codes, no silent backend fallback, explicit exit-code table.

## Slop overrides

- The "friendly empty state" allowance from `operator` does **not** carry over. Empty results are `[]` (json) or zero lines (text), not *"No results found — try a different query!"*.
- ANSI on TTY is allowed; ANSI on non-TTY without `--color always` fails slop gate **A02**.
- `NO_COLOR=1` must be respected. Failing this fails slop gate **A02**.

## Quick smoke list

Before stamping an agent-caller build, verify:

- [ ] `--json` available on every data-emitting command, schema documented
- [ ] `--max-chars` and `--minimal` on long-emit commands
- [ ] Multi-arg or `--stdin` batch input
- [ ] `<tool> config` returns effective state as JSON
- [ ] Exit codes documented, distinct per failure class
- [ ] No interactive prompts on the default path
- [ ] `NO_COLOR` honoured; TTY detection works on stdout, not stderr
- [ ] At least one piped example per leaf in help
- [ ] `<tool> --version --json` works
