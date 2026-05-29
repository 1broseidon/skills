# CLI conventions

Load on **tool-scope** and **command-scope** CLI builds. Framework-agnostic intent; framework-specific notes at the bottom.

---

## Package layout

```
cmd/<binary>/main.go        # thin: parse args, call cmd.Execute(), map error → exit code
cmd/<binary>/root.go        # rootCmd, persistent flags, PersistentPreRunE
cmd/<binary>/<verb>.go      # one file per top-level verb; init() wires flags
internal/cli/               # shared CLI plumbing if multiple binaries
```

Or the project's existing layout — pre-flight wins. Flat layout (`cmd/<binary>/*.go`) is fine for ≤15 verb files.

**`main()` must only:**
1. Call `cmd.Execute()` (or equivalent)
2. Map the returned error to an exit code
3. Exit

No business logic, no flag parsing, no I/O in `main()`.

---

## Command definition

- `Use` line: match macrostructure. Verb-Surface: `search <query>`. Verb-Noun: `invoice create <id>`. Resource-Oriented: `get <resource> [name]`.
- `Short` ≤ 80 chars — this is what appears in the root `--help` list.
- `Long` when the command's behavior needs explanation; always include ≥1 example.
- `RunE` (not `Run`) — return errors; let `main()` map to exit codes.
- `SilenceUsage: true` on every command (cobra default prints usage on every `RunE` error — hostile for scripting).
- `SilenceErrors: true` on the root command if you're printing errors yourself.

---

## Output formats

Every data-emitting command supports at minimum **text** and **json**. Agent caller profiles add **minimal** or another bounded-output mode.

| Format | Flag | When | Shape |
| --- | --- | --- | --- |
| text | (default) | Human TTY | Tables, labels, ANSI when TTY |
| json | `--json` | Scripts, agents | Stable JSON document or NDJSON stream |
| minimal | `--minimal` | Token-bounded agents | Tab-separated, one record per line, no labels |

Additional:
- `--max-chars N` — truncate output to N characters (0 = disabled). Required on any command that can return large results (search, list, inspect). Affects text and json equally.
- `--trim` — strip markdown formatting to plain text (only when command can return markdown content, e.g. scraped pages, formatted help).
- `--no-color` / `NO_COLOR=1` — disable ANSI regardless of TTY. Always honour both.

**Stream detection for ANSI:**

```go
if isatty.IsTerminal(os.Stdout.Fd()) && !noColor {
    // emit ANSI
}
```

Never check `os.Stderr` for the stdout color decision.

**NDJSON for streams:** when a command emits multiple records of the same shape (search results, list), `--json` emits one JSON object per line (NDJSON), not a JSON array. Arrays require buffering the entire result set; NDJSON lets the caller process line-by-line.

Exception: when the caller is known to want an array (e.g., a small bounded list like `config show`), a JSON object or array is fine.

---

## Stdin batch input

For agent/script caller profiles and flat-pipeline patterns, add `--stdin` on any command that accepts one or more positional args:

```
cymbal show Foo               # single
cymbal show Foo Bar Baz       # multi-arg
echo -e "Foo\nBar\nBaz" | cymbal show --stdin   # piped
```

Implementation: if `--stdin` is set and `args` is empty, read lines from `os.Stdin` and treat as the arg list.

Alternatively, accept a JSON array from stdin:

```
cat symbols.json | cymbal show --stdin-json
```

Pick one pattern per tool and be consistent across verbs.

---

## Flags

- **Long names primary.** Short single-letter flags only for the highest-frequency flags (`-h`, `-v`, `-o`, `-f`, `-q`). Don't burn a letter on a rarely used flag.
- **Consistent names across commands.** If one command uses `--project`, all commands that need that concept use `--project`. Never `--project-id` in one and `--project` in another.
- **Persistent flags** (on root): `--json`, `--max-chars`, `--no-color`, `--quiet`, `--verbose`, config path (`--config`), profile/context. Anything that should apply across every verb.
- **Local flags**: verb-specific only. `--limit` on search; `--depth` on crawl. Don't make them persistent unless they genuinely apply everywhere.
- **No positional argument ambiguity.** If a command takes both positional args and flags, the parser must not confuse them. Use `--` to separate.
- **Boolean flags** are `--flag` to enable, `--no-flag` to disable, never `--flag=true`/`--flag=false` as the primary UX.
- Never read secrets from flags. Env vars or secret-file paths only.

---

## Exit codes

Document every exit code. Minimum:

| Code | Meaning |
| --- | --- |
| 0 | Success |
| 1 | Generic / unclassified error |
| 2 | User input / validation error (bad flag, missing arg) |
| 3 | Not found (resource, symbol, URL) |
| 4 | Upstream / network / dependency error |
| 5 | Precondition / state error (already exists, locked, etc.) |
| 6 | Cancelled (SIGINT / timeout) |

Emit the map in `conventions.yaml` under `exit_codes`. Agent and script caller profiles require it.

**`main()` pattern:**

```go
func main() {
    if err := cmd.Execute(); err != nil {
        var exitErr *cli.ExitError
        if errors.As(err, &exitErr) {
            os.Exit(exitErr.Code)
        }
        os.Exit(1)
    }
}
```

---

## Streams

| Content | Channel |
| --- | --- |
| Data / results | stdout |
| Progress, warnings, diagnostics | stderr |
| Interactive prompts | stderr |
| Error messages | stderr |

Never write log lines or progress spinners to stdout. Stdout must be pipeable.

---

## Config precedence

Always CFG-01 unless brief signals otherwise:

```
flags  >  env vars  >  config file  >  defaults
```

- Env prefix matches binary name, screaming snake: `KETCH_`, `CYMBAL_`.
- Config file search order: `./config.yaml` → `$XDG_CONFIG_HOME/<tool>/config.yaml` → `~/.config/<tool>/config.yaml` → `/etc/<tool>/config.yaml`.
- List every env var and config file key in `--help` footer or `conventions.yaml`.
- Document precedence explicitly in `--help` (one sentence is enough).

---

## Cancellation

Every command that may run > 2 seconds must:

1. Accept a `context.Context` threaded from root.
2. Honour SIGINT → cancel the context.
3. Exit with code 6 on cancellation.
4. Not leave partial state without a note to stderr.

```go
ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
defer cancel()
```

---

## Shell completion

If shell completion is selected as a boundary obligation: generate completion scripts for bash, zsh, fish, PowerShell. Cobra/Click/Clap ship this automatically; wire it.

Completions are a wire commitment — once published, removing a flag or subcommand is a breaking change even for completion scripts. Validate against the live binary before publishing.

See [`completion.md`](completion.md) for the full protocol.

---

## Help shape

Root `--help`:

```
<tool> is a [one-sentence description].

Usage:
  <tool> [command] [flags]

Commands:
  verb-1      [≤80 chars]
  verb-2      [≤80 chars]
  …

Flags:
  --json           output as JSON
  --no-color       disable ANSI
  -q, --quiet      suppress non-essential output
  -h, --help       help for <tool>

Use "<tool> [command] --help" for more information about a command.
```

Leaf `--help`:

```
[Long description]

Examples:
  <tool> verb arg                  # basic case
  <tool> verb arg --flag           # with a flag
  echo "…" | <tool> verb --stdin  # piped (agentic)

Usage:
  <tool> verb [args] [flags]

Flags:
  [local flags]

Global Flags:
  [persistent flags]
```

Examples section appears **above** flags. Agents scan examples first; flags second.

---

## Version

`--version` (or `version` subcommand) prints:

```
<tool> v1.2.3 (commit abc1234, built 2026-05-22)
```

With `--json`:

```json
{"version":"1.2.3","commit":"abc1234","built":"2026-05-22T00:00:00Z"}
```

Populated from ldflags at build time. The binary must not carry a hardcoded version string.

```makefile
LDFLAGS=-ldflags "-X main.version=$(VERSION) -X main.commit=$(COMMIT) -X main.date=$(DATE)"
```

---

## Framework-specific notes

### Go / Cobra

- `SilenceUsage: true` on the root command. Without it, every `RunE` error prints the full usage — hostile for scripts and agents.
- `SilenceErrors: true` on root if your `main()` handles the error message.
- Use `PersistentPreRunE` (not `PersistentPreRun`) for setup that can fail (DB open, config load).
- `PersistentPostRun` (not `E`) for cleanup that shouldn't change exit code.
- `cobra.CheckErr(err)` is fine for main-scope but hides the exit code — prefer explicit `os.Exit`.
- `viper.BindPFlags(cmd.Flags())` binds persistent flags to env; call in `init()` after flag registration.
- Register completions with `cmd.RegisterFlagCompletionFunc` for flag-value auto-complete.

### Go / urfave/cli

- `ExitErrHandler` allows custom exit code mapping on the root app.
- `cli.HelpPrinter` can be overridden for custom formatting.

### Rust / Clap

- `#[command(arg_required_else_help = true)]` shows help instead of a blank-exit when no args given.
- `#[command(propagate_version = true)]` is idiomatic for `--version` propagation.
- Derive API is preferred over builder API for readability. Only drop to builder for dynamic subcommand generation.

### Python / Click

- `@click.pass_context` for commands that need the root context (config, verbose flag).
- `invoke_without_command=True` on group when the group itself has a default action.
- `standalone_mode=False` to handle errors in the caller instead of Click printing and exiting.

### Python / Typer

- Built on Click; same patterns apply.
- Type annotations drive flag types automatically. Be explicit for `Optional` fields (use `typer.Option(None)` not plain `= None`).

---

## conventions.yaml (tool-scope)

Emitted at the repo root on tool-scope CLI builds:

```yaml
tool: ledger
version_prefix: "v"
env_prefix: LEDGER_
config_paths:
  - "./config.yaml"
  - "$XDG_CONFIG_HOME/ledger/config.yaml"
  - "/etc/ledger/config.yaml"
exit_codes:
  0: success
  1: generic error
  2: validation / bad input
  3: not found
  4: upstream / network
  5: precondition / state
  6: cancelled
output_formats: [text, json]        # add minimal for agent/script callers
completion_shells: [bash, zsh, fish]
```
