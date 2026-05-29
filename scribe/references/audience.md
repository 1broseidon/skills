# Audience

The audience decides everything downstream: vocabulary, assumed knowledge, depth, what to show, and what to leave out. A doc written for "everyone" serves no one. Name the primary reader, write for them, and route the others elsewhere.

## Reader profiles

| Profile | Goal | Assume they know | Optimize for | Cut |
| --- | --- | --- | --- | --- |
| **new user** | First success; decide if this fits | Nothing about this project | One happy path, plain words, fast win | Edge cases, internals, exhaustive options |
| **integrator** | Wire it into their system correctly | The language/protocol fluently | Exact signatures, defaults, errors, edge cases | Basics, hand-holding, motivation |
| **contributor** | Change the code safely | How to read source | Architecture, build/test, conventions, file map | Usage basics, marketing |
| **operator** | Run, deploy, recover | Production systems | Commands, signals, failure modes, recovery | Theory, API internals |
| **decision-maker** | Decide whether/what to adopt | The problem domain | Trade-offs, constraints, comparisons, conclusion first | Implementation detail, step lists |

## How profile shapes the doc

**Vocabulary.** New users get plain language and defined terms. Integrators get precise technical terms used without apology. Decision-makers get outcomes, not mechanisms.

**Assumed knowledge.** State your assumption explicitly in prerequisites. The fastest way to lose a new user is to assume domain knowledge; the fastest way to insult an integrator is to explain what a variable is.

**Depth.** New users want the shallowest path that works. Integrators want the floor under every claim. Match it.

**Entry point.** Decision-makers read the conclusion first, then maybe the rationale. Operators scan for the command. New users read top to bottom. Order the doc for how the reader actually reads.

## Profile → doc-type affinity

Not a hard mapping, but a strong pull:

- **new user** → tutorial, README quick-start
- **integrator** → reference, how-to
- **contributor** → architecture, contributing guide, explanation
- **operator** → runbook, how-to (deploy/configure)
- **decision-maker** → explanation, README "why", architecture overview

## Multiple audiences

A doc can serve one audience well or several poorly. When a page must reach more than one:

- Pick a **primary** audience and write the body for them.
- Route the others with a short signpost: *"Operators: see the [runbook](...). Contributors: see [architecture](...)."*
- Never blend so that the new user hits unexplained internals or the integrator wades through basics.

When in doubt, ask once:

> *Who is the primary reader — new user, integrator, contributor, operator, or decision-maker?*

Then write for that one, and link the rest.
