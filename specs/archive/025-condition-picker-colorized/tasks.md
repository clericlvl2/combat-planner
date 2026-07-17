# Tasks: 025-condition-picker-colorized

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

Sequencing: Phase 1 is the shared dependency (accent map + sort helper in `labels.ts`) that both
component phases import — it must land first. Phases 2 and 3 touch disjoint files and may run in
parallel once Phase 1 exists.

Verified facts (binding for implementers):
- Modal SURFACE token = `var(--popover)` — both `dialog-content.svelte` and `drawer-content.svelte`
  paint `bg-popover text-popover-foreground`. Use `var(--popover)` everywhere the recipe says SURFACE.
- The shared `toggleVariants` base in `src/lib/components/ui/toggle/toggle.svelte` sets `bg-muted`
  on BOTH `aria-pressed:` and `data-[state=on]:`. Selected utilities MUST be applied on BOTH
  variant prefixes or the un-overridden one wins by cascade (the unit-023 follow-up bug).
- `ConditionPicker.svelte` pills are already text-only (no dot/icon span exists to remove).
- `conditionColor` hues (confirm accent matches): charmed=violet, confused=amber, dazed=teal,
  fear=red, helpless=neutral, hindered=orange, shocked=blue, stuck=orange, stunned=teal,
  vulnerable=red, weakened=red, staggered=neutral.

## Phase 1 — labels.ts: accent map + sort helper

**Owns:** `src/lib/components/app/labels.ts`
**Parallel-safe with:** none (Phases 2 and 3 depend on this)

- [ ] Add `export const conditionAccent: Record<Condition, string>` mapping each condition to its
  raw `--combat-*` CSS var, matching the hue that condition already uses in the existing
  `conditionColor` map (same file, just above): charmed→`var(--combat-violet)`,
  confused→`var(--combat-amber)`, dazed→`var(--combat-teal)`, fear→`var(--combat-red)`,
  helpless→`var(--combat-neutral)`, hindered→`var(--combat-orange)`, shocked→`var(--combat-blue)`,
  stuck→`var(--combat-orange)`, stunned→`var(--combat-teal)`, vulnerable→`var(--combat-red)`,
  weakened→`var(--combat-red)`, staggered→`var(--combat-neutral)`.
- [ ] Add `export function sortConditions(cs: Condition[]): Condition[]` returning a NEW array
  (do not mutate the input) sorted by the localized `conditionLabel[c]()` via `localeCompare`.
  Called at render by both consumers so it stays locale-reactive.
- [ ] Do not alter `conditionColor`, `conditionLabel`, or any other export in the file.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — ConditionPicker: colorized per-condition pills

**Owns:** `src/lib/components/app/ConditionPicker.svelte`
**Parallel-safe with:** Phase 3

- [ ] Import `conditionAccent` and `sortConditions` from `./labels` (alongside existing
  `conditionLabel`).
- [ ] Replace the `{#each CONDITIONS as c (c)}` iteration with a `$derived` sorted list, e.g.
  `const sorted = $derived(sortConditions(CONDITIONS))`, iterating `sorted` so it re-sorts on
  locale change. Do not change `type="multiple"`, `value`, `onValueChange`, or the
  Dialog/Drawer/snippet structure.
- [ ] On each `ToggleGroupItem`, add `style="--tc: {conditionAccent[c]}"`.
- [ ] Replace the current pill class (`!rounded-full min-h-11 px-3 …primary…`) with the Option-2
  colorized recipe (SURFACE = `var(--popover)`), keeping font-weight constant across states so
  there is no reflow on select:
  - geometry: `!rounded-[12px] min-h-11 px-4 text-sm font-medium`
  - rest fill/border/text: `bg-[color-mix(in_srgb,var(--tc)_9%,var(--popover))]`,
    `border-[color-mix(in_srgb,var(--tc)_28%,var(--border))]`, `text-[var(--tc)]`
  - hover: `hover:bg-[color-mix(in_srgb,var(--tc)_15%,var(--popover))]`
  - selected — apply EACH utility on BOTH `data-[state=on]:` AND `aria-pressed:` prefixes:
    fill `color-mix(in_srgb,var(--tc)_18%,var(--popover))`, `border-[var(--tc)]`,
    `ring-1 ring-[var(--tc)]`, text `color-mix(in_srgb,var(--tc)_55%,var(--foreground))`.
- [ ] Keep the pill text label only (no leading dot/icon — none exists today). Leave the
  `aria-label` binding unchanged.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 3 — ConditionIconList: alphabetical chip order

**Owns:** `src/lib/components/app/ConditionIconList.svelte`
**Parallel-safe with:** Phase 2

- [ ] Import `sortConditions` from `./labels` (alongside existing `conditionColor`,
  `conditionLabel`).
- [ ] Iterate `sortConditions(conditions)` instead of the raw `conditions` array in the
  `{#each … as c (c)}` block (wrap in a `$derived` if needed for reactivity).
- [ ] Do NOT change the chip visual style — the `conditionColor[c]` outline `Badge`, sizing,
  `removable` `×` button, and empty-state guard stay exactly as-is. Order is the only change.

**Gate:** `npm run gate` must pass before this phase is reported done.
