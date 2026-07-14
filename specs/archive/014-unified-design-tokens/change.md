---
status: archived
backlog: B-027
---

# Change: unified-design-tokens

## Why

Token audit (2026-07-14) found three loosely-bridged token layers all hand-maintained in
`src/routes/layout.css`: raw prototype hex (`:root`/`.dark`), shadcn semantic aliases, and the
Tailwind `@theme inline` utility layer. Colors are wired cleanly, but non-color scales drift
silently: `--space-*` and `--font-*` are defined-but-partly-unwired, and the card component
dimensions (`--card-pad`, `--hp-size`, `--badge-width`, `--touch-min`) live **only** in
`specs/design/card-prototype.html` — hand-copied into component markup. The prototype is the
declared source of truth, yet every value is manually re-typed into `layout.css` (already caused
a shipped WCAG-ratio error). Theming is also structurally binary: `:root`=light default +
`.dark` override + `applyIsDark(boolean)` cannot express a third theme, and additional themes are
a known upcoming task.

Establish one shared `specs/design/tokens.css` that both prototypes **and** the app `@import`
(true single-source, no copy), and move theming from the `.dark` class to a `[data-theme]`
attribute so N themes become add-a-block with zero code churn. (Promotes backlog **B-027**.)

## What changes

By capability-spec ID (add rows as needed):

| ID | Change |
|----|--------|
| Design-truth rule / `component-inventory` | new: `specs/design/tokens.css` is the SSOT for all design tokens (colors + spacing + font + radius + component dims), `@import`ed by `prototype.html`, `card-prototype.html`, and `src/routes/layout.css`. No token value duplicated anywhere else. |
| `SET-2` | amend: theme applied via `document.documentElement[data-theme]` attribute instead of the `.dark` class toggle; `applyTheme` sets the attribute, `system` still resolves to dark/light. No new user-facing theme added — mechanism only. |
| `PLT-5` | amend (preserve): AA contrast unchanged — token hexes relocated verbatim, both themes re-verified AA from actual hex. |

## Acceptance criteria

- [ ] `specs/design/tokens.css` exists and holds every raw design token — the 8 combat swatches,
      3 type colors, 4 health bands, neutral chrome, `--space-*`, `--font-*`, radius scale, and
      component dims (`--card-pad`, `--card-gap`, `--card-border`, `--hp-size`, `--badge-width`,
      `--touch-min`) — with values verbatim from the prototypes.
      Exception: `--card-pad` and `--hp-size` were set to 12px / 18px to match the shipped
      CombatantRow render rather than the prototype's prior 14px / 19px — an authorized one-time
      reversal of the prototype-as-source rule for these two dims only; the prototype design
      source was updated to match (base rule otherwise unchanged).
- [ ] `prototype.html`, `card-prototype.html`, and `src/routes/layout.css` each `@import`
      `tokens.css`; no raw color hex or scale literal for a shared token remains inline in any of
      the three.
- [ ] Themes are keyed by `[data-theme="light"]` / `[data-theme="dark"]` (with `:root` holding
      theme-independent tokens). No `.theme-light`/`.theme-dark` classes and no `.dark`-class
      palette block remain.
- [ ] `@custom-variant dark` is remapped to `[data-theme="dark"]`; every existing `dark:` utility
      still resolves (shadcn primitives + `NumpadSheet`/`ConfirmDialog` render identically to
      before in dark theme).
- [ ] `theme.ts` sets `document.documentElement.dataset.theme` (no `classList.toggle('dark')`);
      `theme === 'system'` resolves to dark/light then sets the attribute; the `theme-color` meta
      still updates on theme change.
- [ ] Spacing is wired through Tailwind `--spacing-*` so `p-4`/`gap-2` resolve to `--space-*`
      values; the shipping card component references `var(--card-pad)`/`var(--hp-size)`/etc rather
      than literal px for those dims.
- [ ] `--radius-md` / `--radius-xl` reconciled — added to `tokens.css` (become prototype-backed)
      or dropped from the app; no app-invented token absent from the prototype remains.
- [ ] All 8 combat swatches, 3 type colors, and 4 health bands resolve to the same computed hex
      in both themes as before this change (no visual regression).
- [ ] Contrast is unchanged versus the shipped pre-relocation values (verbatim relocation — no
      regression). WCAG-AA was recomputed from actual hex during implementation; the pre-existing
      light-theme AA gaps it surfaced (`--text-faint`; `--health-wounded`/`--health-bloodied`;
      combat swatches `blue`/`orange`/`green`/`neutral`/`teal` — all rendered as small normal text
      in SearchField, NumpadSheet HP-log, and condition chips) are documented and deferred to
      backlog B-028, not fixed in this relocation-only unit.
- [ ] `npm run gate` passes (lint + check + test:unit + build).

## Out of scope

- Adding any actual **new** theme (sepia / high-contrast / custom) — this unit only lands the
  mechanism that makes them cheap. Followup.
- Migrating the existing `dark:` utility spots (`NumpadSheet`, `ConfirmDialog`, shadcn primitives)
  to pure semantic tokens — tracked as a separate followup; here they keep working via the
  remapped `dark:` variant.
- Changing any token **value**/hex — this is relocation + rewire only; values stay verbatim
  (aside from the WCAG re-verification, which must confirm existing values, not restyle them)
  (sole documented exception: `--card-pad` 14→12px and `--hp-size` 19→18px, synced to shipped
  code per explicit user decision).
- Fixing the pre-existing light-theme WCAG-AA gaps surfaced during this unit (`--text-faint`,
  `--health-wounded`/`--health-bloodied`, and 5 combat swatches used as small text) — deferred to
  backlog **B-028** as a dedicated design/contrast pass; this unit changes no values.
- Settings theme-picker UI changes beyond what the `data-theme` switch strictly requires; no new
  theme option surfaced in the UI.
- Any non-design-token application logic.
