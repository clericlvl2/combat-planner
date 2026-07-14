---
status: archived
backlog: B-012
---

# Change: temp-hp-badge-doc-fix

## Why

Backlog B-012. `specs/capabilities/combatants.md` CBT-2 documents the temp-HP badge as
expand-only, but both the code (`CombatantRow.svelte` Row 2) and the binding design truth
(`specs/reference/component-inventory.md`: "an inline top-right temp-HP badge nested in the HP
block when temp HP is carried" on Row 2, the compact row) show the badge on the compact row,
always visible when `tempHp > 0`. The spec is the wrong side of a doc/code mismatch. Correct the
spec to match code + design truth. Temp HP is only *edited* via the NumpadSheet "Set Temp HP"
action — there is no expand-only temp-HP control at all.

## What changes

| ID | Change |
|----|--------|
| `CBT-2` | amend: document the temp-HP badge as part of the compact row (visible whenever `tempHp > 0`, no expand needed). Drop temp HP from the expand-only prose (line 29) and from the expand-only AC bullet; keep the condition picker as the only expand-gated item there. Add the compact temp-HP badge to the compact-row field list + its "visible without expanding" AC. |

## Acceptance criteria

- [ ] CBT-2's compact-row field list names the temp-HP badge (shown when `tempHp > 0`).
- [ ] CBT-2's "expands to reveal ..." prose no longer mentions temp HP; it lists only the
      editable note field and the condition picker.
- [ ] The AC bullet "Temp HP and the condition picker are visible only after expanding the row"
      is amended to reference only the condition picker (temp HP removed).
- [ ] An AC bullet asserts the temp-HP badge is visible on the compact row without expanding
      whenever `tempHp > 0`.
- [ ] No wording contradicts `component-inventory.md` Row 2 or `CombatantRow.svelte`.

## Out of scope

- No code changes — `CombatantRow.svelte` and all `src/**` are untouched; the code is already
  correct.
- `specs/reference/component-inventory.md` is not edited (already correct; used as the source of
  truth).
- No other CBT requirement (CBT-1, CBT-3..8) is touched.
- Temp-HP editing mechanics (NumpadSheet "Set Temp HP", [[hp]]) are out of scope — only the
  compact-row *display* wording is corrected.
