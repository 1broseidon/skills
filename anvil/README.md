# Anvil

Anvil is a backend craft skill for AI coding agents. It helps agents build, audit, reshape, and study backend boundaries without drifting into generated-looking command trees, vague API contracts, bucket packages, or unverified behavior.

Anvil is language-agnostic and applies to:

- CLI tools
- REST services
- gRPC services
- importable package APIs
- backend repo structure

It is intentionally centered on contracts and evidence. The core workflow is:

```text
Boundary -> Risk Class -> Evidence Pack -> Contract Ledger -> Obligations -> Implementation Plan -> Verification Matrix
```

## What It Enforces

- **Boundary clarity:** one target per run, with the smallest useful scope
- **Contract honesty:** no invented SLAs, quotas, flags, routes, schemas, or defaults
- **Caller fit:** human operators, scripts, agents, SDK clients, and internal admins get different affordances
- **Operational obligations:** health, readiness, request IDs, shutdown, cancellation, versioning, and machine output when the boundary implies them
- **Structural discipline:** named layout families, dependency direction, no bucket packages, and explicit dead-code sweeps
- **Verification:** repeatable smoke commands, contract checks, tests, and slop gates

## Install

Install from the public GitHub repo with the `skills` CLI:

```bash
npx skills add 1broseidon/anvil
```

Or with telemetry disabled:

```bash
DISABLE_TELEMETRY=1 npx skills add 1broseidon/anvil
```

The `skills` CLI is documented at [skills.sh](https://skills.sh/docs/cli).

## Invoke

```text
anvil                         # build or change one backend target
anvil audit <target>           # read-only surface + structure audit
anvil reshape <target>         # compatible surface/structure reshape
anvil reshape <target> --sweep # dead-code report, then approved deletion
anvil study <source>           # extract backend DNA from source/help/OpenAPI/proto/binary
```

## Repository Layout

```text
.
├── SKILL.md                     # main skill entrypoint
├── references/                  # lazily loaded backend guidance
│   ├── evidence.md
│   ├── risk-classes.md
│   ├── contract-ledger.md
│   ├── obligations.md
│   ├── verification.md
│   ├── verbs/
│   └── ...
├── examples/                    # human-only examples and benchmark notes
├── ROADMAP.md
└── README.md
```

## Core References

- [evidence.md](references/evidence.md): evidence levels and safe inventory commands
- [risk-classes.md](references/risk-classes.md): R0-R5 public/structural change model
- [contract-ledger.md](references/contract-ledger.md): caller-visible change ledger
- [obligations.md](references/obligations.md): required guarantees by boundary kind
- [verification.md](references/verification.md): repeatable verification matrix
- [benchmark-rubric.md](references/benchmark-rubric.md): 1-5 scoring rubric for generated outputs

## Current Status

Version: `0.3.0`

The current release has been stress-tested with three fixtures:

- Agent-friendly markdown search CLI: `34/35`
- REST job service with OpenAPI: `33/35`
- Package/structure reshape: `33/35`

See [examples/stress-v0.3-benchmark.md](examples/stress-v0.3-benchmark.md) for the benchmark notes.

## Out Of Scope

Anvil does not design browser UI, choose databases, design ORM schemas, wire auth providers, write Kubernetes/Terraform, or perform broad cross-repo migrations. It can still help with the backend surface or structure around those systems.
