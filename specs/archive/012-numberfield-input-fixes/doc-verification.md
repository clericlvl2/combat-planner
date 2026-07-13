# Doc Verification: 012-numberfield-input-fixes

| Claim | Verdict | Evidence |
|----|---------|----------|
| i18n-catalog.md adds `a11y.numField.decrease` row, text "Decrease" | PASS | specs/reference/i18n-catalog.md:280 (added row); matches `messages/en.json:183` (`"a11y.numField.decrease": "Decrease"`); matches code usage `NumberField.svelte:101` per verification.md |
| i18n-catalog.md adds `a11y.numField.increase` row, text "Increase" | PASS | specs/reference/i18n-catalog.md:281 (added row); matches `messages/en.json:184` (`"a11y.numField.increase": "Increase"`); matches code usage `NumberField.svelte:127` per verification.md |
| Leaving `specs/capabilities/initiative.md` unchanged is correct | PASS | `grep` for `type=.number`, `NumberField`, `spinner`, `aria-label` in initiative.md returns no hits — file makes no claims about the input's HTML type/keyboard mode, so the `type="text"`/`inputmode="text"` fix does not contradict it |
| Leaving `specs/capabilities/combatants.md` unchanged is correct | PASS | same grep returns no hits in combatants.md — no stale `type="number"` or spinner-behavior claims to contradict |
| Leaving `specs/reference/component-inventory.md` unchanged is correct | PASS | grep shows only structural/placement mentions of NumberField (lines 39, 60, 63, 76, 203, 205) and unrelated `aria-label` mentions elsewhere (FAB, HP bar, TypeStripe, Settings) — none assert NumberField's input `type`, `inputmode`, or the previous absence of stepper aria-labels, so no contradiction with the shipped fix |

## Scope check

Doc diff touches only `specs/reference/i18n-catalog.md`, matching the doc-syncer's declared edit.
No capability files or component-inventory.md were touched, consistent with them not needing
correction (verified above).

## Other findings

None.
