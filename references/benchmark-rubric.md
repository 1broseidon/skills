# Benchmark rubric

Use this to compare outputs produced with Anvil. Score each axis 1-5.

| Axis | 1 | 3 | 5 |
| --- | --- | --- | --- |
| **Boundary fit** | Wrong target or mixes scopes | Mostly right target, some spillover | Exact target, one clear boundary |
| **Contract honesty** | Invents facts or breaks public surface | Documents most public changes | Ledger is complete, no fabricated guarantees, compatibility shims are smoked |
| **Caller ergonomics** | Human/script/agent needs ignored | Basic help/errors/output present | Caller profile clearly shapes flags, output, errors |
| **Obligations** | Runtime/contract obligations missing | Major obligations present | All implied obligations met or explicitly deferred with residual risk |
| **Structure** | Bucket packages, import drift, mixed layout | Acceptable but under-explained | Layout/package boundaries named and coherent |
| **Verification** | No runnable checks | Tests or smoke checks only | Matrix covers contract, runtime, structure, and limits |
| **Slop resistance** | Generic `run`, anonymous errors, fake quotas | Some slop avoided | Anvil anti-patterns actively prevented |

## Output format

```markdown
| Axis | Score | Evidence |
| --- | ---: | --- |
| Boundary fit | 5 | One tool-scope CLI under `cmd/search` |
| Contract honesty | 4 | Ledger complete; exit-code smoke not run |
...

Overall: 31 / 35
Top issue: missing OpenAPI/router drift check
Best signal: contract ledger drove implementation choices
```

## Benchmark prompts

Good stress prompts:

- "Build an agent-friendly CLI that searches local markdown notes and emits JSON."
- "Build a small REST job service with create/status/cancel and OpenAPI."
- "Reshape this bucket package into named capabilities without breaking imports."
- "Audit this installed CLI from `--help` only."

Avoid prompts that require domain modeling, database schema design, auth provider wiring, or frontend UI; those test other skills.
