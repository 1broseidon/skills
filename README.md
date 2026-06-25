# Skills

A collection of [Agent Skills](https://skills.sh) for AI coding agents, by [@1broseidon](https://github.com/1broseidon).

Each subdirectory is a self-contained skill with its own `SKILL.md` and references. Install one, several, or all of them with the [`skills`](https://skills.sh/docs/cli) CLI.

## Skills

| Skill | Version | What it does |
| --- | --- | --- |
| [anvil](anvil/) | `0.4.0` | Backend craft skill for language-agnostic CLIs, REST APIs, gRPC services, package APIs, and backend repo structure. Build, audit, reshape, or study backend surfaces with contract honesty and evidence-backed verification. |
| [scribe](scribe/) | `0.3.1` | Documentation craft skill for project docs that match the code and read well. Write, audit, sync, or extract READMEs, API references, tutorials, how-tos, explanations, and in-code docs — source-true and drift-aware. |
| [prompt-mechanics](prompt-mechanics/) | `0.1.0` | Prompt-engineering skill for system prompts, agent instructions, and other skills. Engineer prompts against how LLMs actually process text: name the mechanism behind every change and verify against it, not by feel. |
| [folio](folio/) | `0.2.4` | Static artifact craft skill for self-contained HTML/CSS/JS documents — docs, sheets, dashboards, explainers, slides, tools, and landing pages. Durable, shareable web deliverables, local-first; optional publish to Surge, GitHub Pages, or Cloudflare. Static-only, manifest-honest, visually grounded. |

## Install

List what's available in this repo:

```bash
npx skills add 1broseidon/skills --list
```

Install a single skill:

```bash
npx skills add 1broseidon/skills --skill scribe
```

Install several:

```bash
npx skills add 1broseidon/skills --skill anvil scribe prompt-mechanics
```

Install everything:

```bash
npx skills add 1broseidon/skills --all
```

The `skills` CLI is documented at [skills.sh/docs/cli](https://skills.sh/docs/cli).

## Layout

```text
.
├── anvil/             # backend craft skill
│   ├── SKILL.md
│   └── references/
├── scribe/            # documentation craft skill
│   ├── SKILL.md
│   └── references/
├── prompt-mechanics/  # prompt-engineering skill
│   ├── SKILL.md
│   └── references/
├── folio/             # static HTML artifact craft skill
│   ├── SKILL.md
│   └── references/
├── scripts/           # repo maintenance scripts
└── README.md
```

Each skill folder is independent — discovery finds every `SKILL.md` under the repo root. Per-skill detail lives in each skill's own README.

## Maintenance

The version column in the table above must match the `version:` field in each skill's `SKILL.md`. A script keeps them honest:

```bash
scripts/check-versions.sh        # report any drift (non-zero exit on mismatch)
scripts/check-versions.sh --fix  # rewrite the README rows to match SKILL.md
```

To run it automatically before every commit, install the hook once:

```bash
ln -sf ../../scripts/pre-commit .git/hooks/pre-commit
```

## Contributing

Issues and pull requests are welcome at [github.com/1broseidon/skills](https://github.com/1broseidon/skills).
