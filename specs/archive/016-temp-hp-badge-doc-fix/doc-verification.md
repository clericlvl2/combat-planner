# Doc-Verification: 016-temp-hp-badge-doc-fix

| Item | Verdict | Evidence |
|------|---------|----------|
| `specs/CHANGELOG.md` gains a "016-temp-hp-badge-doc-fix" row | PASS | specs/CHANGELOG.md:25 — new row dated 2026-07-14 summarizing the doc-only CBT-2 correction, referencing `CombatantRow.svelte`, `component-inventory.md` Row 2, and closing B-012. |
| CBT-2 compact-row field list names the temp-HP badge | PASS | specs/capabilities/combatants.md:26 — "a temp-HP badge (shown whenever `tempHp > 0`, no expand needed)" inserted into the compact-row field list. |
| CBT-2 "expands to reveal ..." prose no longer mentions temp HP | PASS | specs/capabilities/combatants.md:29-30 — "Tapping the row expands it to reveal an editable note field and the condition picker." (temp HP removed from this sentence). |
| AC bullet amended so only the condition picker is expand-gated | PASS | specs/capabilities/combatants.md:36 — "The condition picker is visible only after expanding the row." replaces the old combined temp-HP+condition-picker bullet. |
| New AC bullet asserts temp-HP badge visible on compact row without expanding when `tempHp > 0` | PASS | specs/capabilities/combatants.md:37 — "The temp-HP badge is visible on the compact row without expanding whenever `tempHp > 0`." |
| Matches what verification.md (code pass) confirmed shipped | PASS | verification.md's evidence lines (combatants.md:25-26, 29-30, 36-37) correspond 1:1 to the current working-tree diff hunks — no drift between the code-pass verification and the actual committed prose. |
| No contradiction with `component-inventory.md` Row 2 or `CombatantRow.svelte` | PASS | component-inventory.md untouched (diff shows no changes to it); new CBT-2 wording ("badge ... no expand needed") matches its existing Row 2 description of an always-visible inline temp-HP badge. |

## Scope check
In-scope only. `git diff --name-only` shows exactly three modified files: `specs/CHANGELOG.md`, `specs/backlog.md`, `specs/capabilities/combatants.md`. No `src/**` edits, no `component-inventory.md` edit, no other CBT-N section touched. `specs/backlog.md` B-012 row flipped `idea` → `in-unit` with a pointer to this change unit — expected bookkeeping tied to opening the unit, not scope creep. No edits found outside the change unit's declared ownership.

## Other findings
None. CHANGELOG entry accurately summarizes the diff (doc-only, no code changes, correct backlog ID). No regressions or contradictions with other capabilities spotted.
