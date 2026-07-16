# Tasks: 021-combatant-modal-and-header-fix

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

Part I (Phase 1) and Part II (Phase 2) touch fully disjoint file sets and are independent — they
may run in parallel.

## Phase 1 — Combatant modal: fit mobile + inner scroll (Part I)

**Owns:** `src/lib/components/app/CombatantForm.svelte`, `src/lib/components/app/CombatantForm.svelte.spec.ts`
**Parallel-safe with:** Phase 2

- [ ] `DialogContent` caps height and flexes as a column so only the middle scrolls — class
  includes `max-h-[calc(100dvh-2rem)]` and `flex flex-col`; drop `max-w-lg` in favor of
  `sm:max-w-[400px]` (`CBT-3`).
- [ ] Wrap the field region in a scroll container carrying `overflow-y-auto`; `DialogFooter` sits
  **outside** that scroll container but still inside `<form>` (`CBT-3`).
- [ ] Convert Name, Type, and Note to stacked fields (label above input, `flex flex-col`), not the
  old label-left grid (`CBT-3`).
- [ ] Drop the `inline` prop from every NumberField call site (NumberField internals untouched);
  group NumberFields into `grid grid-cols-2` pairs: `[Max HP | AC]`, `[PD | MD]`, and a final
  `[Init Bonus | Initiative]` row — each visible NumberField shows its value (no 3-across squeeze)
  (`CBT-3`).
- [ ] Field order top→bottom: Name, Type, `[Max HP | AC]`, `[PD | MD]`, Note,
  `[Init Bonus | Initiative]` — Init Bonus is the last stat field (`CBT-4`).
- [ ] In add / Setup mode the final row shows Init Bonus only; in edit mode and Active-add
  (`combatActive`) the manual Initiative field appears as the super-last field (right of Init Bonus)
  (`CBT-4`).
- [ ] Footer adopts `CombatFormDialog` styling — Cancel `variant="outline"`, both buttons
  `h-11 flex-1`, footer border/background flattened (`border-t-0 bg-transparent`); Cancel stays
  inside the dialog footer (`CBT-3`).
- [ ] Update `CombatantForm.svelte.spec.ts` only as needed to match the new stacked/reordered
  markup (no new tests added).

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — Header: 1024 desktop cap + merged flush back link (Part II)

**Owns:** `specs/design/tokens.css`, `src/routes/layout.css`, `src/lib/components/app/CombatHeader.svelte`, `src/lib/components/app/CombatHeader.svelte.spec.ts`
**Parallel-safe with:** Phase 1

- [ ] `specs/design/tokens.css` defines `--content-max-wide: 1024px` alongside `--content-max`
  (`PLT-2`).
- [ ] `src/routes/layout.css` exposes `--content-max-wide` in `@theme inline` and adds a
  `content-container-wide` utility whose `max-width` is `var(--content-max-wide)` (`PLT-2`).
- [ ] `CombatHeader.svelte`'s chrome wrapper uses `.content-container-wide`; the Round/Escalation
  sub-bar keeps `.content-container` (768) (`PLT-2`).
- [ ] Replace the separate back Button + title `<span>` with a single back link (`href="/combats"`)
  wrapping the chevron icon + the combat title, `aria-label` = `m['a11y.back']()`, chevron pulled
  flush to the content edge via `-ml-2 px-2` (`PLT-2`).
- [ ] Update `CombatHeader.svelte.spec.ts` only as needed to match the merged back-link markup
  (no new tests added).

**Gate:** `npm run gate` must pass before this phase is reported done.
