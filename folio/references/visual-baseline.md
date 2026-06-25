# Visual baseline

Folio artifacts are static documents, not product UIs. They still need to look made, not generated. These rules are distilled from the Hallmark design discipline — the subset that applies to documents, tables, dashboards, and presentations rendered in a browser.

Folio is not a frontend design skill. It does not pick macrostructures, rotate themes, or run 58-gate slop tests. It enforces a visual floor: artifacts that open in a browser should be readable, themed from one seam, and free of the most recognizable AI tells.

---

## Token block — the one rule that makes theming work

Every color, font, spacing, radius, and shadow value in the artifact resolves through `var()`. No inline hex, no inline `oklch()`, no hardcoded `font-family` outside the `:root` block.

```css
:root {
  /* fonts */
  --font-display: …;
  --font-body: …;
  --font-mono: …;

  /* palette */
  --color-paper:   oklch(…);
  --color-paper-2: oklch(…);
  --color-rule:    oklch(…);
  --color-ink:     oklch(…);
  --color-ink-2:   oklch(…);
  --color-muted:   oklch(…);
  --color-accent:  oklch(…);

  /* scale */
  --space-1: 4px;
  --space-2: 8px;
  /* … 4pt increments … */

  /* shape */
  --radius-sm: 4px;
  --radius-md: 8px;
  --shadow-sm: …;
}
```

To re-skin the artifact: edit the token block. Nothing else changes.

Dark mode: add `[data-theme="dark"]` overrides for the palette tokens. Toggle with a `data-theme` attribute on `<html>`.

---

## Color — OKLCH, one accent, tinted neutrals

1. **OKLCH only.** Perceptually uniform, predictable lightness across tints. No `hsl()`, no `rgb()`, no raw hex outside the token block.
2. **One accent color.** It occupies ≤ 5% of any viewport. Everything else is neutral.
3. **No pure extremes.** No `#000`, no `#fff`. Tint paper and ink with a trace of chroma toward the palette's anchor hue.
4. **Tint the greys.** If the accent is warm, neutrals lean warm. A warm accent on cool greys looks wrong.
5. **Contrast.** Body text: ≥ 4.5:1 against paper. Large text (≥ 18.66px bold or 24px): ≥ 3:1.

---

## Typography — system stack by default, pairing when upgraded

**Default:** system font stack. No CDN, no fetch, no load delay.

```css
--font-display: ui-serif, Georgia, "Iowan Old Style", serif;
--font-body:    ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
--font-mono:    ui-monospace, "SF Mono", Menlo, Consolas, monospace;
```

**Upgrade:** if the user names a webfont or the artifact kind warrants it, ledger the font CDN and plug the family name into the token. One-token change; nothing else in the CSS moves.

**Rules that always apply:**

- **No italic headings.** Headings are roman (`font-style: normal`). Italic emphasis inside a heading (`Built to <em>think</em>`) is an AI tell. Carry emphasis with weight, accent color, or underline.
- **Measure.** Body text `max-width: 60–70ch`. Long lines are unreadable.
- **Size steps.** Use a ratio (major third 1.25, perfect fourth 1.333) not arbitrary increments.
- **Line height.** Tight for display (1.1–1.2), comfortable for body (1.5–1.65).
- **Weight contrast.** Weight 400 next to 600 is a default setting. Weight 400 next to 700+ reads as intentional.
- **Three faces maximum.** Display + body + optional mono. Four families is slop.

---

## Layout — break the template

- **No centered everything.** Give the layout a bias: left-aligned body, right-aligned aside, offset grid. Center-biased is a default, not a choice.
- **Spacing is a scale.** Use the 4pt tokens. If every gap is 24px, the page is a template. Mix steps within the same layout.
- **Grid: `minmax(0, 1fr)`** for responsive columns, never bare `1fr` (prevents image blowout).
- **`overflow-x: clip`** on `html` and `body`. Never `hidden` (breaks sticky and position).
- **Depth through weight, not shadow.** Heavier weight, larger size, and warmer hue create hierarchy better than drop shadows. If shadow, one level only.

---

## Named AI tells — do not emit these

These are the patterns every LLM reaches for by default. Seeing one is suspicious; two in the same artifact is confirmation.

| Tell | Fix |
| --- | --- |
| Purple-to-blue gradient hero | One solid accent. No gradient backgrounds. |
| Gradient headline (`background-clip: text`) | Solid ink. Emphasize with weight or accent color. |
| Three equal-width feature cards (icon above heading above body) | Vary column widths, mix heights, drop an icon, use negative space. |
| Full-viewport centered hero (`min-h: 100vh`) | Let the hero be content-height. Bias left or right. |
| Pure `#000` / `#fff` surfaces | Tint toward anchor hue. |
| Side-stripe card (thick colored left border) | Hairline border all around, or no border. |
| Inter / Roboto / Open Sans as the only font | Pair a display face with a body face. System stack is better than one overused font. |
| Card inside card | One containment layer. |
| Every section padded identically | Vary section spacing: generous top, tight bottom, or vice versa. |

---

## Per-kind visual guidance

| Kind | Visual priority | Skip |
| --- | --- | --- |
| **doc** | Readable measure, heading hierarchy, print-friendly CSS | Heavy interactivity, charts |
| **sheet** | Aligned columns, scannable rows, readable at small size | Visual flourishes |
| **dashboard** | KPI hierarchy (big numbers first), chart readability, filter controls | Long prose sections |
| **explainer** | Progressive reveal, clear step sequence, annotated visuals | Dense data tables |
| **slides** | One idea per slide, large type, minimal text, keyboard nav | Scrolling layouts |
| **tool** | Obvious primary action, clear input → output flow | Decorative sections |
| **landing** | Clear headline, one CTA, scannable structure | App-like interactivity |

---

## Verification addendum

After building, check:

- [ ] All color/font/spacing values resolve through `var()` — no inline values outside `:root`
- [ ] Contrast: ink on paper ≥ 4.5:1; accent on paper ≥ 3:1
- [ ] No italic headings
- [ ] `overflow-x: clip` on `html` and `body`
- [ ] Grids use `minmax(0, 1fr)`, not bare `1fr`
- [ ] Inline favicon present (prevents console 404)
- [ ] No horizontal scroll at 320px, 375px, 414px, 768px
- [ ] None of the named AI tells appear in the output
