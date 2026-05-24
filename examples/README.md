# Examples (human-only)

Do **not** auto-load from the agent. Worked fixtures for skill authors and people studying Anvil. They demonstrate the full flow for representative inputs.

All examples use **fictitious-but-plausible** tools across multiple languages. None refer to real repositories.

---

## Worked examples

| File | Tool (fictitious) | Language | Mode | Demonstrates |
| --- | --- | --- | --- | --- |
| [`audit-cli-source.md`](audit-cli-source.md) | `lattice` — import-graph query CLI | Rust (clap v4) | source audit | Verb-Surface, agent caller profile, flat layout, S07/S09 calls |
| [`audit-cli-binary.md`](audit-cli-binary.md) | `harbor` — artifact fetcher | Node (pkg-bundled) | binary-only study | Binary-only mode, BACKEND-01, ASYNC-01, agentic gate block |
| [`anvil-md-template.md`](anvil-md-template.md) | `harbor` + `payments` | Rust CLI + Python FastAPI | lock template | Two filled-in v0.3 `anvil.md` files |
| [`stress-v0.3-benchmark.md`](stress-v0.3-benchmark.md) | three stress fixtures | Python stdlib | benchmark note | v0.3 boundary/risk/contract/verification stress results |

## Planned fixtures

| Path | Kind | Demonstrates |
| --- | --- | --- |
| `build-cli.md` | cli | Full default flow, human-operator caller profile, Resource-Oriented |
| `build-rest-api.md` | rest | Service-scope build, ERR-02, openapi.yaml emit |
| `reshape-crud-to-action.md` | rest | reshape from CRUD-five to action-POSTs |
| `sweep-package.md` | structure | `--sweep` dead-code campaign |
| `slim-util-package.md` | structure | `--slim` bucket package |
| `layout-migration.md` | structure | layer-first → feature-first with git mv (covers S01 failure case) |
| `audit-grpc-source.md` | grpc | gRPC service audit, G-series gates, proto/handler drift |
| `audit-java-service.md` | rest | Java/Kotlin Spring layout, bounded-context layout family |

## How to read a worked example

Each example follows Anvil's flow steps and shows:
- Pre-flight findings block
- Caller profile, surface pattern, contract ledger, and obligations
- Actual output (punch list for audits, ledger + stamp for builds)
- Slop test results with gate citations

Use them to calibrate what a correct Anvil run looks like, and to spot agent output drifting toward slop.

## A note on fictitious targets

Tools used here (`lattice`, `harbor`, `payments`) are deliberate inventions chosen to be plausible — believable command names, flags, and config — so an LLM reading these examples picks up concrete patterns rather than abstract placeholders. None of them exist as packages; do not attempt to install them.

## Tests (future)

Planned fixture shape: input brief -> expected boundary inventory, contract ledger, convention artifacts, verification matrix, and slop-gate result.
