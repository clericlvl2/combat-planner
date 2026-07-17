---
status: archived
backlog: —
---

# Change: condition-picker-colorized

## Why

Condition picker looks flat and grey. Unit 023's "soft `--primary` tint" landed invisible in
practice — `--primary` is neutral near-black chrome, so selected pills read as pale grey ≈
`bg-muted`. DM wants a picker that is actually colorful and readable: each condition pill carries
its own combatant-card color (the `--combat-*` hue already shown on card chips), and selecting a
pill amplifies that color the same way the combatant Type selector does (deeper fill + colored
border + 1px ring). Also: conditions currently render in an arbitrary fixed order in both the
picker and on the card — they should be alphabetical by localized label so a given condition sits
in a predictable spot.

## What changes

By capability-spec ID:

| ID | Change |
|----|--------|
| `CND-3` | amend: picker pills carry their per-condition combatant-card `--combat-*` hue at rest (tinted fill + tinted border + colored text), rounded 12px, no dot/icon; a selected pill amplifies to a deeper same-hue fill + solid colored border + 1px ring, mirroring the Type selector recipe. Replaces the unit-023 "soft `--primary` tint" description. |
| `CND-3` | amend: both the expanded-row picker AND the combatant-card condition chips render conditions ordered alphabetically by localized label (card chip visual style otherwise unchanged). |

## Acceptance criteria

- [ ] `CND-3` — In `ConditionPicker.svelte`, each toggle pill is styled with its condition's
  combatant-card hue via an inline `--tc` custom property sourced from a per-condition accent map
  (the same `--combat-*` hue that condition uses on the card).
- [ ] `CND-3` — Unselected pill: tinted fill (`color-mix` of `--tc` over the modal surface),
  `--tc`-tinted border, `--tc` text; corners rounded to 12px (`!rounded-[12px]`); no leading
  dot/icon (text label only).
- [ ] `CND-3` — Selected pill: deeper same-hue fill, solid `border-[var(--tc)]`, a 1px ring
  (`ring-1 ring-[var(--tc)]`), and mixed-`--tc` text. The selected-state utilities are applied on
  **both** the `data-[state=on]:` and `aria-pressed:` variant groups (bits-ui `type="multiple"`
  Toggle sets both attrs; the shared `toggleVariants` base sets `bg-muted` on both, so overriding
  only one leaves the other winning by cascade).
- [ ] `CND-3` — Selecting/deselecting a pill causes no row reflow or width shift: font-weight is
  constant across rest/hover/selected states (distinction carried by color/fill/ring only).
- [ ] `CND-3` — The picker lists the 12 conditions ordered alphabetically by their localized
  label, recomputed reactively so it re-sorts when the app language changes.
- [ ] `CND-3` — `ConditionIconList.svelte` (combatant-card condition chips) renders the
  combatant's conditions ordered alphabetically by localized label; the chip visual style (the
  existing `conditionColor` outline-badge look) is unchanged — only order changes.
- [ ] Gate stays green: `npm run gate` (lint + check + test:unit --run + build) passes.

## Out of scope

- Condition set, meanings, or apply/remove logic (`CND-1`, `CND-2`) — untouched.
- The Dialog-vs-Drawer split and the picker's open/close/trigger structure — untouched.
- The compact-row "+K" overflow behavior and its icon count — untouched.
- `specs/design/*.html`, `specs/design/tokens.css`, and any `--combat-*` hex values — read-only
  design truth; not edited.
- `messages/*.json` / Paraglide i18n — no new or changed message keys.
- Any component other than `ConditionPicker.svelte`, `ConditionIconList.svelte`, and the
  `labels.ts` accent map + sort helper they consume.
