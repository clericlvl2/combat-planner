# Tasks: 016-temp-hp-badge-doc-fix

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

## Phase 1 — Correct CBT-2 temp-HP badge wording

**Owns:** `specs/capabilities/combatants.md`
**Parallel-safe with:** none

Amend CBT-2 only. Do not touch CBT-1 or CBT-3..8, `src/**`, or
`specs/reference/component-inventory.md` (used as source of truth, already correct).

- [ ] Add the temp-HP badge to CBT-2's compact-row field list, noted as shown whenever
      `tempHp > 0` (no expand needed), matching `component-inventory.md` Row 2 and
      `CombatantRow.svelte` Row 2.
- [ ] Amend the "expands to reveal ..." prose (line ~29) to drop temp HP; it must list only the
      editable note field and the condition picker.
- [ ] Amend the AC bullet "Temp HP and the condition picker are visible only after expanding the
      row" to reference only the condition picker (remove temp HP).
- [ ] Add an AC bullet asserting the temp-HP badge is visible on the compact row without
      expanding whenever `tempHp > 0`.
- [ ] Verify no wording contradicts `component-inventory.md` Row 2 or `CombatantRow.svelte`.

**Gate:** `npm run gate` must pass before this phase is reported done.
