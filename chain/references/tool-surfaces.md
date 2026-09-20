# Tool surfaces

The command surface of each chain tool, captured from its own `--help`. Everything here was read off a running binary, not from documentation or memory.

Captured 2026-09-19 against:

| Tool | Version | Home | Install instructions |
| --- | --- | --- | --- |
| ketch | `v0.17.2` | [ketch.run](https://ketch.run) | <https://ketch.run/#install> |
| cymbal | `v0.15.0` | [cymbal.sh](https://cymbal.sh) | <https://cymbal.sh/#install> |
| recoil | `58cbc4d` (2026-07-29) | [github.com/1broseidon/recoil](https://github.com/1broseidon/recoil) | <https://github.com/1broseidon/recoil#install> |
| brainfile | `0.20.0` | [brainfile.md](https://brainfile.md) | <https://brainfile.md/quick-start> |

Read install instructions from those pages rather than reproducing them here. Install methods change between releases, and a stale install command in a skill file is worse than none.

These tools move. Treat this file as a map, not a contract: if a flag does not behave as described, run `<tool> <command> --help` and trust that instead. A skill that cites a flag the binary no longer has is worse than one that cites nothing.

## ketch — research

Web search, scraping, library docs, and public code search. `--json` is a global flag.

| Command | What it does |
| --- | --- |
| `search` | Search the web and return results |
| `scrape` | Scrape URLs and extract clean markdown |
| `crawl` | Crawl a site and extract pages |
| `docs` | Search library documentation |
| `code` | Search code across open-source repositories |
| `extract` | Convert piped HTML to clean markdown |
| `tag` | Bookmark research sources for later sessions |
| `doctor` | Check the health of every backend, the browser, and the cache |
| `cache`, `config`, `browser` | Cache stats, configuration, browser for JS-rendered pages |
| `mcp` | Run ketch as an MCP server |

`ketch docs <query>`: `--library <id>` skips the resolve step, `--resolve` resolves a library name instead of searching, `--tokens` sets the Context7 token budget (default 4000), `-l/--limit` (default 5), `--minimal` for one tab-separated result per line, `--tag` to record results under a tag.

`ketch code <query>`: `-b/--backend` selects `grepapp`, `sourcegraph` or `github` (default `grepapp`), `--lang` filters by language, `--regex` treats the query as a regular expression, plus `-l/--limit`, `--minimal` and `--tag`.

The `--tag` flag on `search`, `docs` and `code` is the seam into later sessions — see `ketch tag`.

## cymbal — code navigation

Tree-sitter parsing into SQLite, built to be called by agents. Global flags: `-d/--db`, `--json`, `--no-federate`.

| Command | What it does |
| --- | --- |
| `index` | Index a directory for symbol discovery |
| `search` | Search symbols or text across indexed repos |
| `show` | Read source by symbol name or file path |
| `outline` | Show symbols defined in a file |
| `investigate` | Kind-adaptive investigation — returns the right context for what a symbol is |
| `context` | Bundled context: source, type references, callers, and imports |
| `impact` | Transitive caller analysis — what is impacted if this symbol changes |
| `trace` | Downward call trace — what does this symbol call? |
| `impls` | Find types that implement, conform to, or extend a symbol |
| `refs` | Find references to a symbol (best-effort) |
| `importers` | Find files that import a given file or package |
| `changed` | Diff-scoped impact — what is affected by your current changes |
| `diff` | Show git diff scoped to a symbol's definition |
| `structure` | Structural overview — entry points, hotspots, central packages |
| `ls` | File tree, indexed file names, repo list, or repo stats |
| `hook` | Agent-integration hooks (nudge, remind, notify, install) |

`cymbal changed` analyses unstaged working-tree changes by default; `--staged` uses the index against HEAD, and `--base <ref>` diffs the working tree against another ref:

```bash
cymbal changed                 # unstaged changes
cymbal changed --staged        # staged changes
cymbal changed --base main     # working tree vs main
```

Changed symbols are attributed by parsing the diffed blobs on both sides, so whole-symbol deletions are named rather than mis-attributed to a neighbour. References and impact are then queried from the working-tree index — the "what is affected now" question.

## recoil — memory

Local-first memory in SQLite with FTS search. Global flags: `-d/--db`, `--json`. Scope flags recur across commands: `--project <path>`, `--session <id>`, `--user`.

| Command | What it does |
| --- | --- |
| `wake` | Print bounded starter memory context |
| `search` | Search memories with SQLite FTS |
| `remember` | Remember useful project context with deterministic role inference |
| `decide` | Add a decision memory with a required claim key |
| `check` | Audit whether a remembered decision is still safe to act on |
| `supersede` | Create a new active memory that supersedes an old one |
| `handoff` | Close a session with structured next context for the next agent |
| `mine` | Import conservative project file memories |
| `claims` | List claim-key families in scope |
| `show`, `list`, `mark`, `forget` | Read one, list scope, update lifecycle, tombstone or purge |
| `setup`, `init`, `migrate`, `repair`, `backup`, `status` | Bootstrap and database maintenance |
| `instruct`, `instructions` | Print the agent contract and integration instructions |
| `export`, `profile`, `embed`, `eval` | Claim-family export, entity profiles, embedding sidecars, retrieval eval |
| `channel`, `relay`, `swarm`, `session-evidence`, `tray`, `hook`, `mcp` | Sharing, workspace health, integrations |

`recoil wake [query]`: `--limit` (default 8), `--max-chars` (default 1600), `--include-decisions` for a claim-keyed decision trail, `--current` / `--historical`, `--claim-key`, `--role`, `--agent`, `--before`, `--explain`, `--minimal`.

`recoil check [query-or-memory-id]`: `--claim-key` audits one family, `--claim-key-prefix` audits every family under a prefix (mutually exclusive with `--claim-key` and a query), `--limit` (default 8).

`recoil decide [text]`: `--claim-key` is the stable family for supersession. `--valid-until <date>` stores a date-bound decision as `predicate.kind=valid_until`. `--holds-while` is an advisory semantic predicate; `--stance` and `--subject` together enable contradiction detection. `--file -` reads from stdin.

`recoil handoff [summary]`: `--next-step`, `--decision`, `--constraint` and `--open-question` are all repeatable. `--claim-key` defaults to `handoff.latest`, and prior active handoffs in the family are superseded automatically unless `--no-supersede`. `--publish` / `--no-publish` control channel publishing.

`recoil instruct` prints the short agent contract. When a project already injects that contract, follow it rather than restating it.

## brainfile — task state

Markdown task board under `.brainfile/`, shared between humans and agents. Most commands take `-f/--file` and `--json`.

| Command | What it does |
| --- | --- |
| `init` | Initialize `.brainfile/brainfile.md` in the current directory |
| `add` | Add a new task |
| `list`, `show`, `search` | List tasks, show one in full, search active tasks and completed logs |
| `patch`, `move`, `subtask`, `note` | Partial update, change column, manage subtasks, append a timestamped note |
| `complete`, `archive`, `restore`, `delete`, `log` | Task lifecycle and completed-task logs |
| `brief` | Per-agent brief: what changed since this agent last checked in |
| `contract` | Task contracts: `pickup`, `deliver`, `validate`, `attach`, `graph`, `activate` |
| `plan`, `adr`, `template`, `schema` | Plan documents, ADR lifecycle, task templates, schemas |
| `lint`, `migrate`, `config`, `auth`, `hooks`, `tui`, `mcp` | Validation, v2 migration, config, external auth, agent hooks, board UI, MCP server |

`brainfile brief` requires `--agent <name>` — brief state is per-agent, which is what makes it usable by several agents at once. `--peek` reads without marking the brief as seen.

`brainfile add` takes `-t/--title` (required), `-d/--description`, `-c/--column` (default `todo`), `-p/--priority` (low, medium, high, critical), `--tags`, `--assignee`, `--due-date`, `--subtasks`, `--files`.

`brainfile contract pickup` claims a contract and outputs context for an agent; `deliver` marks it delivered; `validate` runs the contract's deliverables and commands and sets status to done or failed.
