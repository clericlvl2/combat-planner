---
status: archived
backlog: —
---

# Change: combatant-modal-and-header-fix

## Why

Dogfooding unit 020 surfaced two combat-screen defects — the Add/Edit combatant modal overflowing
the mobile viewport, and the combat header's 768 cap/back-link mismatch. This unit was closed
against that original two-fix scope, then **reopened**: continued live dogfooding against the
running app kept surfacing adjacent friction (mobile modals not being real bottom sheets, cramped
form fields, missing cursor affordances, a stripe-heavy combatant card, noisy validation copy,
inconsistent container gutters) and the unit grew into an app-wide modal/header/card/control
polish pass. This rewrite of `change.md` describes the full shipped scope, not just the original
two fixes. Fix spec: `.claude/plans/2026-07-16-fix-combatant-modal-and-header.md` (original scope
only — the expanded scope was driven by follow-on dogfooding, not a second plan file).

## What changes

By capability-spec ID:

| ID | Change |
|----|--------|
| `PLT-2` | amend: `AppHeader`/`CombatHeader` chrome padding reworked (drop `px-3`, use `.content-container-wide`/back-link spacer); shared `.content-container`/`.content-container-wide` gutter 16px→12px; body page gutters made vertical-only; `Drawer`'s decorative handle replaced by the real `DrawerPrimitive.Handle`; `Button` base gains `cursor-pointer` app-wide; mobile FABs suppress `focus-visible` ring |
| `CBT-3` | amend: `CombatantForm` splits into a mobile bottom-`Drawer` / desktop `Dialog` (via `MediaQuery`); fields stacked with 2-across `NumberField` grid pairs; new field order (Note moved last); scroll-region gutter; redesigned Type pill selector; shared `NumberField` re-sized to 40px with a red-ring-only invalid state and `lg:`-gated focus rings |
| `CBT-4` | amend: edit-form field order confirmed (`[Init Bonus \| Initiative]` row before Note is now `... [PD\|MD], [Init Bonus\|Initiative], Note` — Note is last, not the Init row) |
| `INI` | amendment: the manual Initiative field is no longer gated by `combatActive` — it now renders unconditionally on both add and edit, including add-in-Setup, contradicting INI-3's "add form surfaces manual Initiative only while Active" statement |
| `CBT-2` | amend: `CombatantRow`'s type-color stripe block removed; replaced by a small leading color dot immediately before the combatant name |
| `CLS` | amend: `CombatFormDialog` converted to the same mobile-`Drawer`/desktop-`Dialog` split; cap-block validation is now silent (no inline cap-error message); `CombatRow` card radius changed to `rounded-card`; `ColorSwatchPicker` swatches redesigned to a single stretched equal-width row; combats-list page gutter made top-only |
| `CND` | amend: `ConditionPicker` converted to the same mobile-`Drawer`/desktop-`Dialog` split |
| `SET` | amend: Settings and About page gutters made vertical-only |
| `PLT-12` | amend: the catch-all not-found page gutter made vertical-only |

## Acceptance criteria

### Headers & container gutters (`PLT-2`)

- [ ] `src/lib/components/app/AppHeader.svelte`'s header no longer carries `px-3`; its chrome
  wrapper is `content-container-wide`; the burger button carries `-ml-3`.
- [ ] `src/lib/components/app/CombatHeader.svelte`'s header no longer carries `px-3`; the back
  link no longer carries `flex-1`, carries `max-w-full`, and is followed by a new
  `<div class="min-w-0 flex-1">` spacer; the Round + Escalation popover/button triggers carry
  `cursor-pointer`; the sub-bar still uses `.content-container` (768).
- [ ] `src/routes/layout.css`: both `.content-container` and `.content-container-wide` have
  `padding-inline: var(--space-3)` (not `--space-4`).

### Body page gutters (`SET` / `CLS` / `PLT-12`)

- [ ] `src/routes/combats/+page.svelte` uses `pt-3` (not `p-3`), keeping `pb-24` (`CLS`).
- [ ] `src/routes/settings/+page.svelte` uses `py-3` (not `p-3`) (`SET`).
- [ ] `src/routes/about/+page.svelte` uses `py-6` (not `p-6`) (`SET`).
- [ ] `src/routes/[...catchall]/+page.svelte` uses `py-4` (not `p-4`) (`PLT-12`).
- [ ] `src/lib/components/app/CombatRow.svelte`'s card radius is `rounded-card` (not
  `rounded-[var(--radius)]`) (`CLS`).

### Cursor affordance (`PLT-2`)

- [ ] `src/lib/components/ui/button/button.svelte`'s base class includes `cursor-pointer`.

### Mobile drawers (`CBT-3` / `CLS` / `CND`)

- [ ] `src/lib/components/app/CombatantForm.svelte`, `src/lib/components/app/CombatFormDialog.svelte`,
  and `src/lib/components/app/ConditionPicker.svelte` each construct a
  `new MediaQuery('(min-width: 1024px)')` and render a centered `Dialog` at ≥1024px or a bottom
  `Drawer` below it, sharing one `{#snippet}` body; `CombatantForm` and `CombatFormDialog` each
  added a `formTitle` `$derived` for their (mode-dependent) title, while `ConditionPicker` keeps
  its static title inlined in both the Dialog and Drawer title slots.
- [ ] `src/lib/components/ui/drawer/drawer-content.svelte` renders `DrawerPrimitive.Handle`
  instead of a decorative grabber `<div>`.

### Combatant form internals (`CBT-3` / `CBT-4` / `INI`)

- [ ] In `CombatantForm.svelte`, fields are stacked (label above control); numeric `NumberField`s
  are grouped into `grid grid-cols-2` pairs; the form uses `gap-3`, the scroll region `gap-2.5`,
  and the pair grids `gap-2`.
- [ ] Field order top→bottom is: Name, Type, `[Max HP | AC]`, `[PD | MD]`,
  `[Init Bonus | Initiative]`, Note — Note renders last.
- [ ] The manual Initiative `NumberField` (`id="cf-init"`) renders in both add and edit mode
  unconditionally — the prior `{#if mode === 'edit' || (mode === 'add' && combatActive)}` guard
  and the `combatActive` prop are both removed from `CombatantForm.svelte`. This is flagged as an
  amendment against `INI-3` (manual entry is now available on add even before the combat is
  Active).
- [ ] The scroll region carries `-mx-3 px-3`.
- [ ] The Type `ToggleGroup` no longer sets `variant="outline"`; each `ToggleGroupItem` renders a
  leading `size-2 rounded-full bg-[var(--tc)]` dot, `!rounded-sm`, `border border-border
  bg-secondary`, `style="--tc: var(--type-{t})"`, and a selected state of
  `data-[state=on]:bg-[color-mix(in_srgb,var(--tc)_14%,var(--secondary))] border-[var(--tc)]
  ring-1 ring-[var(--tc)] text-foreground`.
- [ ] The dialog/drawer footer's own classes are unchanged from before this unit — it was only
  relocated into the shared snippet, not restyled.

### Shared `NumberField` control (`CBT-3`, HP-adjacent)

- [ ] `src/lib/components/app/NumberField.svelte`'s stepper buttons are `min-h-10 w-10` (was
  `min-h-11 w-11`) and the value `Input` is `min-h-10` (was `min-h-11`).
- [ ] The inline clamp-hint `<p>` is removed; a clamped/invalid value shows only a destructive
  ring on the shell (`clamped && 'border-destructive ring-3 ring-destructive/50'`) plus
  `aria-invalid` on the `Input`.
- [ ] Focus rings are gated behind `lg:` (`lg:focus-within:*` on the shell, `lg:focus-visible:*`
  on the steppers); the destructive/`aria-invalid` ring classes are not gated behind `lg:`.
- [ ] Stepper buttons carry `active:bg-muted active:text-foreground transition-colors`.

### Validation red-only (`CBT-3` / `CLS`)

- [ ] `CombatFormDialog.svelte` no longer renders a cap-error `<p>`, no longer runs an `$effect`
  clearing it on field edit, and no longer imports `MAX_COMBATS` or holds `capBlocked` state; when
  the combat cap is hit, `createCombat` returns `null`, the dialog stays open, and nothing is
  added — with no error message shown.
- [ ] `src/lib/components/ui/input/input.svelte`'s focus rings are gated behind `lg:`; its
  `aria-invalid` ring classes are not gated.

### Color swatches (`CLS`)

- [ ] `src/lib/components/app/ColorSwatchPicker.svelte`'s swatch container is `w-full`, and each
  `ToggleGroupItem` is `h-9 flex-1` (not `size-[30px]` in a `flex-wrap` grid) — a single
  stretched, equal-width, non-wrapping row.

### Combatant card (`CBT-2`)

- [ ] `src/lib/components/app/CombatantRow.svelte` no longer renders a type-color stripe block;
  a `size-2 rounded-full` type-color dot (`aria-hidden`, using the existing `typeColor` map)
  renders immediately before the combatant name instead.

### FAB focus (`PLT-2`)

- [ ] In `src/routes/combats/[id]/+page.svelte`, the 3 mobile FAB buttons carry
  `max-lg:focus-visible:ring-0 max-lg:focus-visible:border-transparent` (no focus ring below
  1024px; desktop focus ring is unaffected).

### Cleanup

- [ ] The unused `combatActive` prop is removed from `CombatantForm.svelte` and its call-site
  argument from `src/routes/combats/[id]/+page.svelte`.
- [ ] The dead `typeStripeCount` export is removed from `src/lib/labels.ts` (or equivalent
  labels module).
- [ ] The orphaned i18n keys `a11y.typeBadge`, `errors.clamp`, and `errors.combatCap` are removed
  from all 6 `messages/*.json` files and Paraglide is regenerated.

## Out of scope

- `src/lib/components/ui/dialog/dialog-content.svelte` — the shadcn base is untouched; the
  desktop/mobile split is built on top of it and `Drawer`, not by editing the base component.
- `ConfirmDialog.svelte` / `AlertDialog` — not converted to a Drawer; stays a centered dialog on
  all breakpoints.
- `NumberField`'s latent `onchange`+`onblur` double-commit quirk (the red ring can flicker off on
  blur) — known, not fixed in this unit.
- `specs/reference/i18n-catalog.md` — still lists the removed `a11y.typeBadge`/`errors.clamp`/
  `errors.combatCap` keys; reconciling that table is a doc-sync task at close, not a code AC here.
- No new i18n keys were added in this unit.
- Bottom-sheet conversion of anything not listed above (e.g. the header, the About/Settings
  screens) — only `CombatantForm`, `CombatFormDialog`, and `ConditionPicker` gained the
  Drawer/Dialog split.
