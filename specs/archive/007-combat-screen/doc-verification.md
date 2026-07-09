# Doc-verification: 007-combat-screen

| Doc claim | Verdict | Evidence |
|----|---------|----------|
| CHANGELOG row 007 well-formed, matches shipped scope | PASS | specs/CHANGELOG.md:16 — matches verification.md 8/8 PASS content (restyle, JumpToTurnButton new, note read-only fix, health-band tint removal); no overclaim |
| combatants.md CBT-2: note renders read-only under card in both collapsed+expanded when set | PASS | src/lib/components/app/CombatantRow.svelte:215 `{#if !open && combatant.note !== ''}` renders read-only `<p>` when collapsed; expanded Textarea (unchanged, pre-existing) shows/edits same note — matches doc's "both states" claim |
| combatants.md CBT-2: card background no longer tints by healthStatus, HealthBar fill is sole signal | PASS | `cardBgClass` identifier fully absent from src/ (search returned zero hits outside verification.md); HealthBar.svelte:39 `healthColor[status]` fill class is the only status-driven class left |
| hp.md HP-4: same tint-removal claim, band width + aria-label as non-color signal | PASS | HealthBar.svelte fill width driven by percentage (unchanged), `role="img"`/aria-label unchanged per verification.md AC row 3; consistent with code-pass PASS on "HealthBar shows 4 bands... token-driven" |
| component-inventory.md: unit E now shipped (framing update from "not yet" to shipped) | PASS | matches verification.md scope check listing CombatHeader/CombatantForm/CombatantRow/NumpadSheet/JumpToTurnButton as the edited/new files for 007 |
| component-inventory.md: JumpToTurnButton ships, Active-only, scrolls active row into view | PASS | src/routes/combats/[id]/+page.svelte:124-137 — `<JumpToTurnButton onclick={jumpToActiveTurn} />` sits inside the Active-branch `{#if}` (before `{:else}` Setup branch at line 137); JumpToTurnButton.svelte itself is a plain Button with no active-only guard internally, so the Active-only gating lives correctly in the caller, matching the doc's claim |
| component-inventory.md: CombatantRow.svelte ships the card, no separate HP-block/type-stripe components extracted | PASS | grep confirms only CombatantRow.svelte edited among card-family files; no new HpCell/TypeStripe component files found |
| component-inventory.md note-line entry: collapsed read-only `<p>`, expanded existing inline Textarea, same note | PASS | CombatantRow.svelte:73 `showNoteEditor = combatant.note !== '' || noteEditing` (expanded-state condition, pre-existing) and :215 collapsed read-only branch — doc's two-state description matches both code paths exactly |

## Contradiction check against verification.md (code-pass)
No contradictions found. Doc edits are consistent with all 8 code-pass AC rows, in particular:
- Code-pass row 6 ("Note line renders read-only... collapsed AND expanded") ↔ combatants.md/component-inventory.md note-line wording — consistent.
- Code-pass "Other findings" note on `cardBgClass` removal being an intentional, in-file-documented, non-mechanics change ↔ hp.md/combatants.md/component-inventory.md tint-removal wording — consistent, no doc overreach beyond what code-pass flagged.

## Scope check
Doc diff touches exactly the four declared files (combatants.md, hp.md, component-inventory.md, CHANGELOG.md). No edits to other capability files, ADRs, or design/prototype sources found in the diff.

## Other findings
None beyond the above. No stale cross-references introduced (checked `[[hp]]`/`[[../reference/component-inventory]]` links added in hp.md/combatants.md resolve to real anchors HP-4 and the Card section respectively).
