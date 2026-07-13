---
status: archived
backlog: B-013
---

# Change: numberfield-input-fixes

## Why

`NumberField` (the labeled numeric stepper used for initiative and all combatant stat fields)
is broken on mobile and visually buggy on desktop. Root cause is the inner `<Input type="number">`:

- **Desktop:** browsers paint native up/down spinner arrows on top of the centered value, on top
  of the custom `−`/`+` stepper buttons — duplicate, overlapping controls. No spinner-reset CSS
  exists anywhere in `src/`.
- **Mobile:** `inputmode="numeric"` renders a digits-only soft keyboard with **no minus key**, so
  the negative-capable fields `initiativeBonus` (−99..99) and `initiative` (−9..99) cannot be
  typed at all — only nudged via the `−` stepper.
- **Fragile entry:** `type="number"` returns `el.value === ''` for any intermediate-invalid state
  (a lone `-`, `1e`, `1.`), so `capDigits` silently no-ops and `commit`'s `Number('')` misfires.

Research (context7) confirmed **no shadcn-svelte or bits-ui Number Field / stepper primitive
exists** — a hand-rolled `NumberField` is the correct and only path. Fix stays within the existing
`.numfield` design (bordered stepper shell, `−` / value / `+`), no redesign. Also promotes
backlog **B-013** (digit-cap vs clamp reachability) and closes the long-standing missing-aria-label
gap on the stepper buttons.

## What changes

| ID | Change |
|----|--------|
| `INI-*` (initiative entry via NumberField) | amend: manual initiative / init-bonus entry works on mobile (minus typeable) and desktop (no spinner overlap); no requirement text change, behavior fix only |
| `CBT-*` (combatant stat fields via NumberField) | amend: Max HP / AC / PD / MD / Init Bonus / Initiative entry robust across mobile & desktop; behavior fix only |
| `SET`/i18n catalog | new: two message keys (Decrease / Increase) added across all 6 bundled locales for stepper `aria-label`s |

Single component file changes: `src/lib/components/app/NumberField.svelte`. Plus `messages/*.json`
(6 locales) + Paraglide regen. Design-truth files unchanged (behavior/a11y fix within existing look).

## Acceptance criteria

- [ ] The inner value `<Input>` in `NumberField.svelte` is `type="text"` (not `type="number"`) — no
  native browser spinner arrows can render, eliminating the desktop overlap with the `−`/`+` buttons.
- [ ] The value input uses an `inputmode`/keyboard hint that exposes a minus key on mobile for the
  negative-capable fields (e.g. `inputmode="text"` or `"tel"`), so `-` is typeable; a leading `-`
  followed by digits is accepted and committed as a negative number.
- [ ] Typed entry is sanitized on `oninput` via regex to the allowed character set (digits and a
  single leading `-`); intermediate-invalid states no longer blank the field or break commit.
- [ ] Commit-time `clamp(n, min, max)` behavior is preserved: out-of-range committed values snap to
  range and the inline clamp hint (`errors.clamp`) shows, exactly as today.
- [ ] Negative entry is bounded correctly: `initiativeBonus` accepts −99..99 and `initiative`
  accepts −9..99 by keyboard; values outside range clamp on commit.
- [ ] **B-013:** the digit-cap is retained for typed input, AND a paste / programmatic-set path is
  added that bypasses the cap so an overflowing value can reach `clamp` — with a unit test that
  drives that path and asserts the clamp fires (closes B-013's "clamp unreachable" gap).
- [ ] The `−` and `+` stepper buttons carry `aria-label`s sourced from two new i18n message keys
  (Decrease / Increase), present in all 6 locale files (`de/en/es/fr/ja/ru`), Paraglide regenerated.
- [ ] `getByLabelText(fieldLabel)` still resolves to the value input alone (stepper aria-labels do
  not collide with the field label) — existing component tests stay green.
- [ ] The bordered stepper-shell visual (`.numfield` recipe: `−` / centered value / `+`, 44px touch
  targets) is unchanged; `errors.clamp` hint placement unchanged.
- [ ] `npm run gate` passes (lint, check, unit tests --run, build).

## Out of scope

- `NumpadSheet.svelte` (the HP digit-pad) — it deliberately avoids the OS keyboard and is unaffected
  by the `type="number"` issues. Not touched.
- The shadcn `Input` primitive (`src/lib/components/ui/input/input.svelte`) — not modified; only
  `NumberField`'s usage of it changes.
- No redesign of the `.numfield` look, no new props on `NumberField`'s public API, no changes to
  `RANGES`/domain constants or `clamp`.
- No changes to call sites (`InitCell`, `CombatHeader`, `CombatantForm`) beyond what a `type` swap
  transparently requires — their `NumberField` usage stays as-is.
