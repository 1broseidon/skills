# Code docs vs prose docs

In-code API documentation (docstrings, doc comments) and standalone prose documentation (Markdown pages, docs sites) are **separate concerns**. They have different audiences, locations, lifecycles, and tooling. Treating them as one — duplicating a tutorial into a docstring, or scattering reference facts across both — creates drift and wastes effort. This file decides which layer owns which fact.

## The two layers

| | In-code docs | Prose docs |
| --- | --- | --- |
| **Lives in** | Source files (docstrings, `///`, `/** */`, `#`) | Markdown, docs site |
| **Read at** | The call site, in an IDE, hover tooltips | A browser, before/while coding |
| **Audience** | The integrator who already found the symbol | Everyone, including those who haven't |
| **Lifecycle** | Versioned with the code, reviewed in the same PR | Often separate; drifts more easily |
| **Generated into** | API docs (godoc, rustdoc, JSDoc, Sphinx autodoc) | Hand-authored pages |
| **Owns** | Per-symbol contract: params, returns, errors, side effects | Concepts, tasks, tutorials, the why, the map |

## What each layer owns

**In-code docs own the symbol contract.** For a function, type, or endpoint handler: what it does, its parameters and their meaning, what it returns, what it raises, side effects, and constraints. This is the fact closest to the code and must travel with it.

**Prose docs own everything that spans symbols.** Tutorials, how-tos, conceptual explanation, architecture, and the navigational map. Prose docs reference the API but don't reproduce every signature — they link to the generated API reference instead.

## The ownership rule

Each fact has **one canonical home**:

- A function's parameter list → its docstring (and the generated reference derived from it).
- "How to combine these three functions to do X" → a how-to page.
- "Why the API is shaped this way" → an explanation page.

Don't write the parameter meaning in both the docstring and a hand-maintained Markdown reference — the Markdown copy will go stale. If you need a prose reference page, generate it from the docstrings rather than retyping them.

## In-code doc conventions by language

Follow the language's native convention; generators depend on it:

| Language | Convention | Notes |
| --- | --- | --- |
| Go | godoc: comment starts with the symbol name | `// Parse reads...` |
| Rust | rustdoc: `///` with Markdown, `# Examples` sections | Doctests run in CI |
| Python | PEP 257 docstrings; Google/NumPy/reST style | Pick one style per project |
| JS/TS | JSDoc/TSDoc `/** */` with `@param`/`@returns` | Types often come from TS signatures |
| Java | Javadoc `/** */` with `@param`/`@return`/`@throws` | |

## Rules for in-code docs

- **Explain what isn't obvious from the name.** `// SetName sets the name` is noise. Document constraints, side effects, errors, units, and nullability.
- **Match the signature exactly.** Documented params and returns agree with the code (slop gate CD02). This is the most common docstring drift.
- **Document errors and side effects.** Callers need to know what to handle and what mutates.
- **Don't inline tutorials.** A docstring is not the place for a multi-step walkthrough. A short example, yes; a tutorial, link to it.
- **Follow the native style** so doc generators and IDEs render it correctly (slop gate CD05).
- **Keep it current.** A docstring that contradicts its signature is worse than none. Update it in the same change that changes the signature.

## Rules for prose docs referencing code

- **Link to the generated API reference** rather than retyping signatures that will drift.
- **Quote source sparingly and cite it** — a short, real snippet with a file reference, not a paraphrase that can rot.
- **Let the docstring be the source of truth** for per-symbol contracts; prose docs teach how to use them together.

## When the user says "document the code"

Clarify which layer:

> *In-code docs (docstrings on the symbols) or a prose reference/guide? They're different deliverables.*

If both are wanted, do them as separate passes with the ownership rule above — docstrings for per-symbol contracts, prose for the concepts and tasks that span them — and generate the prose API reference from the docstrings where the toolchain supports it.
