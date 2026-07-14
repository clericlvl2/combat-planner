# Verification: 016-temp-hp-badge-doc-fix

| AC | Verdict | Evidence |
|----|---------|----------|
| CBT-2's compact-row field list names the temp-HP badge (shown when `tempHp > 0`) | PASS | specs/capabilities/combatants.md:25-26 — "a temp-HP badge (shown whenever `tempHp > 0`, no expand needed)" added to compact-row field list |
| CBT-2's "expands to reveal ..." prose no longer mentions temp HP; lists only the editable note field and the condition picker | PASS | specs/capabilities/combatants.md:29-30 — "Tapping the row expands it to reveal an editable note field and the condition picker." (temp HP removed) |
| The AC bullet "Temp HP and the condition picker are visible only after expanding the row" is amended to reference only the condition picker | PASS | specs/capabilities/combatants.md:36 — "The condition picker is visible only after expanding the row." |
| An AC bullet asserts the temp-HP badge is visible on the compact row without expanding whenever `tempHp > 0` | PASS | specs/capabilities/combatants.md:37 — "The temp-HP badge is visible on the compact row without expanding whenever `tempHp > 0`." |
| No wording contradicts `component-inventory.md` Row 2 or `CombatantRow.svelte` | PASS | specs/reference/component-inventory.md:121-123 describes "an inline top-right temp-HP badge nested in the HP block when temp HP is carried" on the compact Row 2 — matches new CBT-2 wording; no contradiction found |

## Scope check
In-scope only. `git diff --name-only` shows only `specs/backlog.md` and `specs/capabilities/combatants.md` modified. No `src/**` edits, no `component-inventory.md` edits, no other CBT-N section touched (CBT-3 section boundary confirmed unchanged directly after CBT-2). `specs/backlog.md` B-012 row correctly updated from `idea` to `in-unit` with a pointer to this change unit, which is expected bookkeeping, not scope creep.

## Other findings
None. The doc change is a pure prose fix consistent with the stated code/design truth; no regressions or contradictions to other capabilities spotted.
