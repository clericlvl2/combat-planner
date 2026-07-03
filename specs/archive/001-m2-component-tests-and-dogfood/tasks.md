# Tasks: m2-component-tests-and-dogfood

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

**Test tool note:** `change.md`'s AC text says "Vitest + @testing-library/svelte" (matching
ADR-009's prose), but the codebase actually wires `vitest-browser-svelte` (real Chromium via
`@vitest/browser-playwright`, see `vite.config.ts`'s `client` project and
`src/smoke.svelte.spec.ts`) — `@testing-library/svelte` isn't even a dependency. ADR-009 is stale
on this point; every phase below uses `vitest-browser-svelte`, which is what the AC's actual,
verifiable outcome (a passing component test file) depends on regardless of the doc wording.

**Convention:** colocated `<Component>.svelte.spec.ts`, matching
`combat-store.svelte.spec.ts`/`smoke.svelte.spec.ts`. `CombatantRow` and `CombatHeader` take a
`controller: CombatController` prop — per `controller.ts`'s own doc comment, drive it with a
plain `vi.fn()`-spy object, never a real `CombatStore`/Dexie.

**Dogfood phase is out of this file.** The change unit's other two ACs (DM dogfood attestation +
friction → backlog rows + `B-001`/`B-002` flipped to `done`) aren't implementer work — no agent
can play a live fight. `/spec-run` dispatches every phase in this file to an `implementer` agent;
once Phases 1–7 land green, the main thread handles the dogfood step directly (prompts the DM,
records the attestation, writes any friction as new backlog rows, flips `B-001`/`B-002`) before
`/spec-verify` runs — not as a `tasks.md` phase.

## Phase 1 — CombatantRow component test

**Owns:** `src/lib/components/app/CombatantRow.svelte.spec.ts`
**Parallel-safe with:** Phase 2, 3, 4, 5, 6, 7

- [ ] Cover `CBT-2`: compact↔expanded toggle via the `Collapsible` trigger — expanded state
      reveals `TempHpField`/`NoteField`/`ConditionPicker` trigger, collapsing an still-empty note
      resets it

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — CombatantForm component test

**Owns:** `src/lib/components/app/CombatantForm.svelte.spec.ts`
**Parallel-safe with:** Phase 1, 3, 4, 5, 6, 7

- [ ] Cover `CBT-3`: add-mode defaults, name-required validation blocks submit, numeric fields
      clamp to their `NumberField` min/max, `onSubmit` fires with the expected shape

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 3 — HealthBar component test

**Owns:** `src/lib/components/app/HealthBar.svelte.spec.ts`
**Parallel-safe with:** Phase 1, 2, 4, 5, 6, 7

- [ ] Cover `HP-1`, `HP-4`: fill/temp-fill percentages at full/wounded/bloodied/dead
      `healthStatus` bands, clamp behavior at `-maxHp`, reverse/alarm styling at the dead band

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 4 — NumpadSheet component test

**Owns:** `src/lib/components/app/NumpadSheet.svelte.spec.ts`
**Parallel-safe with:** Phase 1, 2, 3, 5, 6, 7

- [ ] Cover `HP-3`: digit entry → `onDamage`/`onRestore`/`onSetTempHp` fire with the entered
      number on each commit action; empty-entry commit is a no-op (no callback fires)

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 5 — ConditionPicker component test

**Owns:** `src/lib/components/app/ConditionPicker.svelte.spec.ts`
**Parallel-safe with:** Phase 1, 2, 3, 4, 6, 7

- [ ] Cover `CND-2`: toggling a preset condition on fires `onAdd`, toggling an applied one off
      fires `onRemove`, applied chips render distinctly from unapplied presets

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 6 — InitCell component test

**Owns:** `src/lib/components/app/InitCell.svelte.spec.ts`
**Parallel-safe with:** Phase 1, 2, 3, 4, 5, 7

- [ ] Cover `INI-2`: roll trigger fires `onRoll`, manual entry fires `onSetInitiative` with the
      typed value, cell is non-interactive when `editable` is false

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 7 — CombatHeader component test

**Owns:** `src/lib/components/app/CombatHeader.svelte.spec.ts`
**Parallel-safe with:** Phase 1, 2, 3, 4, 5, 6

- [ ] Cover `TRE-5`: `RoundCounterControl` edit fires `controller.editRound` only (never
      `setEscalation`); undo/redo `IconButton`s disable at empty stack ends per `combat` props

**Gate:** `npm run gate` must pass before this phase is reported done.
