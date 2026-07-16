---
status: archived
backlog: —
---

# Change: combatant-modal-and-header-fix

## Why

Dogfooding unit 020 surfaced two combat-screen defects. (1) The Add/Edit combatant modal
(`CombatantForm`) overflows the mobile viewport — the shadcn `DialogContent` base has no
max-height and no inner scroll, and the inline label-left grid is too tall, so on iPhone SE the
title clips above and the footer clips below, and the 3-across NumberField row squeezes the AC/PD/MD
values out of view. (2) The combat header caps at 768 on desktop and has a mobile baseline mismatch
— the 44px back icon-button centers its glyph ~12px inside the content edge, so the chevron doesn't
line up with the card stripe below it. Fix spec: `.claude/plans/2026-07-16-fix-combatant-modal-and-header.md`.

## What changes

By capability-spec ID:

| ID | Change |
|----|--------|
| `CBT-3` | amend: replace the add-form's inline label-left grid with stacked labels + 2-across NumberField pairs; cap `DialogContent` height and scroll only the field region; restyle the footer to match `CombatFormDialog` (Cancel `variant="outline"`, buttons `h-11 flex-1`), Cancel still inside the dialog footer |
| `CBT-4` | amend: edit-form field order — Init Bonus is the last stat field; the manual Initiative field is super-last, shown only in edit / Active-add modes |
| `PLT-2` | amend: the Combat header chrome caps at **1024px** (new `--content-max-wide` token + `.content-container-wide` utility); body content, the Round/Escalation sub-bar, and the cards stay at 768; the back chevron + title merge into a single flush back link |

## Acceptance criteria

Part I — `CombatantForm.svelte`:

- [ ] `DialogContent` caps height and flexes as a column so only the middle scrolls — class
  includes `max-h-[calc(100dvh-2rem)]` and `flex flex-col`; `max-w-lg` is dropped in favor of
  `sm:max-w-[400px]` (`CBT-3`).
- [ ] The field region is wrapped in a scroll container carrying `overflow-y-auto`; the
  `DialogFooter` sits **outside** that scroll container but still inside `<form>` (`CBT-3`).
- [ ] Name, Type, and Note render as stacked fields (label above input, `flex flex-col`), not the
  old label-left grid (`CBT-3`).
- [ ] NumberFields render without the `inline` prop, grouped into `grid grid-cols-2` pairs:
  `[Max HP | AC]`, `[PD | MD]`, and a final `[Init Bonus | Initiative]` row; each visible
  NumberField shows its numeric value (no 3-across squeeze) (`CBT-3`).
- [ ] Field order top→bottom is: Name, Type, `[Max HP | AC]`, `[PD | MD]`, Note,
  `[Init Bonus | Initiative]`. Init Bonus is the last stat field (`CBT-4`).
- [ ] In add / Setup mode the final row shows Init Bonus only; in edit mode and Active-add
  (`combatActive`) the manual Initiative field appears as the super-last field (right of Init Bonus)
  (`CBT-4`).
- [ ] The footer adopts `CombatFormDialog` styling — Cancel is `variant="outline"`, both buttons are
  `h-11 flex-1`, footer border/background flattened (`border-t-0 bg-transparent`) (`CBT-3`).

Part II — header width + back link:

- [ ] `specs/design/tokens.css` defines `--content-max-wide: 1024px` alongside `--content-max` (`PLT-2`).
- [ ] `src/routes/layout.css` exposes `--content-max-wide` in `@theme inline` and adds a
  `content-container-wide` utility whose `max-width` is `var(--content-max-wide)` (`PLT-2`).
- [ ] `CombatHeader.svelte`'s chrome wrapper uses `.content-container-wide`; the Round/Escalation
  sub-bar keeps `.content-container` (768) (`PLT-2`).
- [ ] The back control is a single link (`href="/combats"`) wrapping the chevron icon + the combat
  title, with `aria-label` = `m['a11y.back']()`; the chevron is pulled flush to the content edge via
  `-ml-2 px-2` (`PLT-2`).
- [ ] `npm run gate` passes (lint + check + test:unit --run + build), including any spec touch-ups
  needed to match the new markup.

## Out of scope

- `src/lib/components/ui/dialog/dialog-content.svelte` — the shadcn base is untouched; all changes
  are targeted overrides on `CombatantForm`'s `DialogContent`.
- `src/lib/components/app/CombatFormDialog.svelte` — the "nice" modal is reference only, not edited.
- `src/lib/components/app/NumberField.svelte` internals — its non-inline stacked mode is already
  correct; only the `inline` prop usage at call sites changes.
- Body / combats-list / Settings / About width caps — they stay at 768; only the combat header
  chrome widens to 1024.
- Bottom-sheet conversion — the app keeps the centered Dialog; the prototype's mobile sheet is not
  adopted.
- Paraglide message files (`messages/*.json`, `src/lib/paraglide/*`) — no new i18n keys.
