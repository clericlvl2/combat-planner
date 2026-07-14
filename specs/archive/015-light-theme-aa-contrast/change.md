---
status: archived
backlog: B-028
---

# Change: light-theme-aa-contrast

## Why

Unit 014 recomputed WCAG-AA from actual token hex and surfaced pre-existing sub-4.5:1
normal-text pairs that predate PLT-5's "both themes meet AA" claim. Because 014 was a
relocation-only pass, those gaps were documented and deferred to backlog **B-028** rather than
fixed. This unit is that dedicated contrast pass: adjust the offending token hexes in the SSOT
`specs/design/tokens.css` (hue-preserving, minimal luminance shift) so every one clears AA for
normal text, then restore PLT-5 to an unqualified "both themes meet AA" and clear the deferral.

Failing pairs (from unit 014 / PLT-5):

- `--text-faint` — **both themes** (rendered as small text in SearchField placeholder/labels).
- Light theme `--health-wounded`, `--health-bloodied` (NumpadSheet HP-log diffs/badges).
- Light theme combat swatches `--combat-blue`, `--combat-orange`, `--combat-green`,
  `--combat-neutral`, `--combat-teal` (small swatch-colored title/label text; condition chips).

## What changes

By capability-spec ID (add rows as needed):

| ID | Change |
|----|--------|
| `PLT-5` | amend: fix the deferred light-theme + `--text-faint` (both-theme) AA gaps; delete the "Known exception … deferred to backlog B-028" paragraph and restore the unqualified "both themes meet AA contrast" claim. |
| Design-truth (`specs/design/tokens.css`) | value change: darken (light) / lighten (dark) exactly the listed foreground tokens to reach ≥4.5:1 as normal text against their rendered backgrounds, keeping each in its existing hue family. No other token value touched. |

## Acceptance criteria

Each foreground below, **recomputed from actual hex** (WCAG 2.1 relative-luminance formula),
reaches **≥4.5:1** (normal text) against the specified background(s):

- [ ] `--text-faint` **dark** (`[data-theme="dark"]`) ≥4.5:1 against `--surface` (`#171b21`) and
      `--surface-2` (`#1f242c`).
- [ ] `--text-faint` **light** (`[data-theme="light"]`) ≥4.5:1 against `--surface` (`#ffffff`)
      and `--surface-2` (`#f0f2f5`).
- [ ] Light `--health-wounded` and `--health-bloodied` each ≥4.5:1 against `--surface`
      (`#ffffff`) and `--surface-2` (`#f0f2f5`) — the NumpadSheet HP-log surfaces.
- [ ] Light `--combat-blue`, `--combat-orange`, `--combat-green`, `--combat-neutral`,
      `--combat-teal` each ≥4.5:1 against `--surface` (`#ffffff`) and `--surface-2` (`#f0f2f5`).
- [ ] Every changed value stays in its original hue family (hue shift is incidental to a
      luminance change, not a recolor); the 8 light combat swatches remain mutually
      distinguishable per ADR-012.
- [ ] No token value in `specs/design/tokens.css` other than the ones listed above is changed
      (dark health bands, dark swatches, `--combat-red`/`--combat-amber`/`--combat-violet` light,
      type colors, neutral chrome, spacing/type/radius/dims all byte-identical to before).
- [ ] No inline color hex for these tokens is reintroduced into `prototype.html`,
      `card-prototype.html`, or `src/routes/layout.css` — they still resolve via `@import` of
      `tokens.css` (unit 014 SSOT invariant preserved).
- [ ] `specs/capabilities/platform.md` PLT-5: the B-028 "Known exception" paragraph is removed
      and the contrast bullet reads as an unqualified both-themes-AA guarantee.
- [ ] `npm run gate` passes (lint + check + test:unit + build).

## Out of scope

- Any token value **not** in the failing set above — including dark-theme health bands, dark
  combat swatches, light `--combat-red`/`--combat-amber`/`--combat-violet`, the three type
  colors, and all neutral-chrome / spacing / type / radius / component-dim tokens. They already
  pass or are not in B-028's scope; leave verbatim.
- Component markup, layout, and Tailwind wiring — this is a token-value change only; no `.svelte`
  or `layout.css` structural edits, no new tokens.
- The theming mechanism (`[data-theme]`, `theme.ts`) — untouched.
- Redesigning the palette or ADR-012's swatch set — hues stay; only luminance moves to clear AA.
