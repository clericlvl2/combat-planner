# Tasks: combats-home

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

Context from research: the combats-list domain (`createCombatInList`, `deleteCombat`,
`reorderCombats`, `firstLaunch`, `resetAll`) and their `CombatStore` methods already exist from
M2 — only `editCombat` (CLS-3) is missing. `App.firstLaunch` is already wired into
`store.hydrate()`, so CLS-7 is a pure routing rewrite, not new store logic. `ConfirmDialog`,
`dropdown-menu`, `alert-dialog`, `dialog`, and `card` primitives already exist and are reused.
No new i18n keys (out of scope) — consume the cataloged `combats.*` / `errors.combatCap` keys.

## Phase 1 — editCombat (domain + store)

**Owns:** `src/lib/stores/domain/app.ts`, `src/lib/stores/domain/app.spec.ts`,
`src/lib/stores/combat-store.svelte.ts`, `src/lib/stores/combat-store.svelte.spec.ts`
**Parallel-safe with:** Phase 2

- [ ] Add pure `editCombat(combats, id, patch)` to `app.ts` — patches `title`/`description`/
      `colorTag` (+ `updatedAt`) only, leaving `combatants`, `state`, and history untouched
      (CLS-3, acceptance: "updates title/description/color tag without touching its roster or
      `state`"). Trim strings via the same rules as `createCombat`.
- [ ] Add `CombatStore.editCombat(id, patch)` that applies the domain fn, swaps the row in
      `this.combats`, and persists via `persistCombat` (snapshot before handing to the pure fn,
      per the store-seam invariant).
- [ ] Unit-test the domain fn (patch subset, roster/state untouched) and the store method
      (persist called, no-op safe).

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — presentational leaf components

**Owns:** `src/lib/components/app/ColorTagDot.svelte`,
`src/lib/components/app/ColorSwatchPicker.svelte`, `src/lib/components/app/FAB.svelte`,
`src/lib/components/app/EmptyState.svelte` (plus each one's `.spec.ts`)
**Parallel-safe with:** Phase 1

- [ ] `ColorTagDot` — bespoke swatch dot driven by a `colorTag` prop, using the ADR-012
      token-driven swatch classes (8 tags).
- [ ] `ColorSwatchPicker` — selectable row of the 8 swatches, `bind:value` on a `ColorTag`.
- [ ] `FAB` — bottom-right thumb-zone button wrapper (Button primitive + Lucide icon + `onclick`),
      per Component Inventory §FAB (Combats home = create).
- [ ] `EmptyState` — shared empty-state leaf (icon/title/CTA slot) for the "No combats yet" case
      (`combats.empty.*`).
- [ ] Tests: render + prop/selection behavior for each leaf.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 3 — CombatFormDialog (create / edit)

**Owns:** `src/lib/components/app/CombatFormDialog.svelte`,
`src/lib/components/app/CombatFormDialog.svelte.spec.ts`
**Parallel-safe with:** Phase 4

- [ ] Dialog with Title / Description fields + `ColorSwatchPicker` (Phase 2), parent-controlled
      `open`, one component serving both create and edit modes (CLS-2, CLS-3).
- [ ] Create mode calls `store.createCombat` and surfaces `errors.combatCap` when it returns
      `null` (101st-combat block; no combat created).
- [ ] Edit mode is seeded from an existing combat and calls `store.editCombat` (Phase 1).
- [ ] Tests: create adds at top / cap message on null, edit pre-fills and patches only the three
      fields.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 4 — CombatRow + CombatRowMenu

**Owns:** `src/lib/components/app/CombatRow.svelte`,
`src/lib/components/app/CombatRow.svelte.spec.ts`,
`src/lib/components/app/CombatRowMenu.svelte`,
`src/lib/components/app/CombatRowMenu.svelte.spec.ts`
**Parallel-safe with:** Phase 3

- [ ] `CombatRow` — Card showing `ColorTagDot` (Phase 2) + title + description, trailing `⋮`
      (`CombatRowMenu`). Row tap (outside the menu) emits an `open` event → navigation happens in
      the page (CLS-1, CLS-5).
- [ ] `CombatRowMenu` — DropdownMenu with exactly Edit and Delete (no Export/share, no
      placeholder — CLS-1 acceptance). Emits `edit` / `delete` events.
- [ ] Delete flows through the existing `ConfirmDialog` (reused, not a new one) → confirm calls
      `store.deleteCombat`; verify the UI adds no Undo affordance (CLS-4, UND-2).
- [ ] Tests: menu has only Edit/Delete, delete is confirm-gated, row-body tap emits open.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 5 — CombatList (drag reorder)

**Owns:** `src/lib/components/app/CombatList.svelte`,
`src/lib/components/app/CombatList.svelte.spec.ts`
**Parallel-safe with:** none

- [ ] Vertical list of `CombatRow` (Phase 4) sorted by `listOrder`, wrapped with
      `svelte-dnd-action` (ADR-006) for manual drag reorder.
- [ ] On drop, call `store.reorderCombats(orderedIds)` so the new order persists (CLS-6
      acceptance: order survives a reload).
- [ ] Tests: rows render in `listOrder`, a finalize event calls `reorderCombats` with the new id
      order.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 6 — Combats-home routing + first-launch branch

**Owns:** `src/routes/combats/+page.svelte`, `src/routes/+page.ts`
**Parallel-safe with:** none

- [ ] Rewrite `src/routes/combats/+page.svelte` (currently an unconditional redirect stub) into
      the real home: `CombatList` (Phase 5) + create `FAB` + `EmptyState` + `CombatFormDialog`
      (Phase 3), wiring row-open navigation to `/combats/[id]` (CLS-1, CLS-2, CLS-5).
- [ ] Rewrite `src/routes/+page.ts` to branch instead of always redirecting: first launch
      (`!firstLaunchDone`, one seeded combat) → open that combat's page directly; subsequent
      launches → the Combats home list (CLS-7). Lean on the existing `store.hydrate` /
      `App.firstLaunch` seam; do not duplicate first-launch logic.
- [ ] Verify `resetAll` (Settings) still re-arms first-launch through the new routing (acceptance
      row) — no code change expected, confirm behavior.

**Gate:** `npm run gate` must pass before this phase is reported done.
