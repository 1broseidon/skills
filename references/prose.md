# Prose

Good documentation prose is invisible: the reader gets the fact or the model and moves on, never noticing the writing. Bad prose makes the reader work — re-reading sentences, decoding hedges, wading through filler. The rule under all the others: **every sentence must change what the reader knows or does. If it doesn't, cut it.**

## When prose, when terse

Match the form to the reader's task:

| Reader task | Form |
| --- | --- |
| Understand a concept or model | Prose paragraphs |
| Follow a procedure | Numbered steps |
| Look up a value | Table |
| Choose among options | Table or bulleted list |
| Copy a command | Code block + expected output |
| Scan for their case | Table (symptom → fix) |

Prose earns its place in explanation and the "why" parts of READMEs and architecture docs. Reference and how-to lean terse. Writing prose where a table belongs is as much a failure as the reverse.

## Voice

- **Active, present tense.** "The parser returns an error" not "An error will be returned by the parser."
- **Second person for instructions.** "Run the command", "You'll see…". Direct and clear.
- **Indicative for facts.** "The cache holds 1000 entries" — state it, don't soften it, when it's observed.
- **Confident where evidence is strong; honest where it's weak.** Observed facts get plain statements. Derived behavior gets honest hedging ("retries transient errors") — but never hedge-for-hedging's-sake.

## Concision

Cut these on sight:

- **Filler openers:** "It is worth noting that", "It should be mentioned", "Basically", "Essentially".
- **Throat-clearing:** "In order to" → "to". "Due to the fact that" → "because". "At this point in time" → "now".
- **Empty intensifiers:** "very", "really", "quite", "actually".
- **False ease:** "simply", "just", "easy", "obviously", "of course" — they shame the stuck reader and hide complexity.
- **Marketing adjectives in technical docs:** "blazing-fast", "powerful", "seamless", "robust". Show the number or behavior; drop the adjective.

Prefer the short word and the short sentence. One idea per sentence. If a sentence has two clauses joined by "and", consider two sentences.

## Clarity

- **Front-load.** First sentence of every section/paragraph answers its question. Detail follows.
- **Concrete over abstract.** "Returns the first 50 results" beats "returns a bounded subset".
- **Define before use.** Introduce a term, then use it. Don't make the reader hold an undefined word.
- **Parallel structure.** List items share grammatical shape. Steps start with verbs. Headings are consistent.
- **Name the thing.** "The `--json` flag" not "this option". Specificity is navigability.

## Honesty in prose

- Don't state derived behavior as a hard guarantee (slop gate U17).
- Don't describe roadmap as present.
- Don't smooth over a known limitation to make the prose flow — name it.
- A clear "this doesn't handle X yet" builds more trust than silence that the reader later discovers.

## Quick test

Read each paragraph and ask: *what does the reader now know or do that they didn't before?* If the answer is "nothing", cut it. If it's "I'm not sure", rewrite it.
