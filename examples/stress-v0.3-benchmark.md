# Stress benchmark: Anvil v0.3

Human-only benchmark note. Do not auto-load during normal Anvil runs.

Date: 2026-05-24

The goal was to test whether the v0.3 flow steers agents toward backend-native artifacts: boundary inventory, risk classes, contract ledger, obligations, implementation plan, and verification matrix.

## Fixtures

| Fixture | Path | Result |
| --- | --- | --- |
| Agent-friendly CLI | `/tmp/anvil-stress-agentic-cli` | 34 / 35 |
| REST job service | `/tmp/anvil-stress-rest-jobs` | 33 / 35 |
| Package/structure reshape | `/tmp/anvil-stress-package-structure` | 33 / 35 |

## What worked

- Agents produced durable contract artifacts instead of only code: `conventions.yaml`, `openapi.yaml`, `anvil.md`, `.anvil/*` reports.
- Boundary thinking stayed tight. Each stress build stayed in its assigned target directory.
- Verification improved code quality. The CLI had JSON/error smoke checks; the REST service had OpenAPI route sync and HTTP smoke; the package reshape had import-boundary checks.
- The package reshape test caught a real compatibility edge before handoff.

## Gaps found

- REST job creation deferred idempotency. Anvil now states job creation endpoints should treat idempotency as applicable by default unless consciously deferred with residual risk.
- Package reshapes need stronger compatibility smoke for old import forms, not just named capability tests.
- Shell completion was deferred in the CLI fixture. This is acceptable for a tiny stdlib stress build, but larger CLI builds should make completion an explicit obligation decision.

## Reference updates made after benchmark

- [`../references/obligations.md`](../references/obligations.md): job creation now calls out idempotency by default.
- [`../references/verification.md`](../references/verification.md): package checks now require compatibility-shim smoke across plausible old import forms.
- [`../references/benchmark-rubric.md`](../references/benchmark-rubric.md): top scores now require smoked compatibility shims and explicit residual-risk deferrals.

## Repeat benchmark prompts

1. Build an agent-friendly CLI that searches local markdown notes and emits JSON.
2. Build a REST job service with create/status/cancel, OpenAPI, health, and problem details.
3. Reshape a bad bucket package into named capability packages while preserving old imports.
