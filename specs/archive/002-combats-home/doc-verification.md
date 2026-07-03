# Doc-Verification: 002-combats-home

Doc-syncer pass: closing spec edits (working tree vs HEAD a252df5) across
`specs/capabilities/combats-list.md`, `specs/reference/component-inventory.md`,
`specs/CHANGELOG.md`. Checked against `change.md` + `verification.md` (shipped reality).

| Item | Verdict | Evidence |
|------|---------|----------|
| CLS-1 reflects shipped `⋮` menu = Edit + Delete only | PASS | combats-list.md:14-15 body "Edit / Delete; the Export/share item is pending under CLS-8"; AC:19-20 "exposes Edit and Delete." Matches verification.md row 2 (`CombatRowMenu.svelte:41-49` edit+delete only) |
| CLS-1 does NOT claim Export/share shipped | PASS | combats-list.md:19-20 explicitly defers Export/share to "when CLS-8 lands"; no assertion it ships now |
| CLS-2 create/top/100-cap accurate | PASS | combats-list.md:22-30 unchanged, matches verification.md rows 3-4 (top insert, `state:setup`, cap block) |
| CLS-3 editCombat noted | PASS | combats-list.md:32-38 CLS-3 present (edit title/desc/color, no roster/state change); `editCombat` domain fn + `CombatStore.editCombat` called out in CHANGELOG.md:11. Matches verification.md row 5 |
| CLS-4 confirm-gated permanent cascade delete, no undo | PASS | combats-list.md:40-48 unchanged, accurate to verification.md row 6 |
| CLS-5 tap-to-open navigation | PASS | combats-list.md:50-55, matches verification.md row 7 |
| CLS-6 drag reorder persists listOrder | PASS | combats-list.md:57-62, matches verification.md row 8 |
| CLS-7 first-launch routing branch | PASS | combats-list.md:64-73 unchanged, matches verification.md rows 9-11 |
| CLS-8 pointer NOT deleted | PASS | combats-list.md:75-78 CLS-8 pointer to [[import-export]] IMP-1..5 intact; new CLS-1 AC cross-links back to it |
| component-inventory "Combats list row" reconciled same way | PASS | component-inventory.md:100-102 `CombatRowMenu`: "Edit / Delete; the Export-share item is pending under [[../capabilities/combats-list]] CLS-8"; no claim it ships |
| Exactly one CHANGELOG row for 002-combats-home, factually accurate | PASS | CHANGELOG.md:11 single row; lists CLS-1..7, color-tag rows, 100-cap block, `editCombat`, confirm cascade delete (no undo), tap-open, drag reorder `listOrder`, first-launch branch, Export/share deferred to CLS-8/M5 — all corroborated by verification.md 12-PASS reality |
| No doc edit overstates coverage / contradicts shipped code | PASS | Every edit narrows-not-inflates; Export/share consistently marked pending across all three files |

## Scope check
In-scope. Doc-syncer touched exactly the three declared files. No source/spec file outside the
doc set was modified. combats-list.md changes are confined to CLS-1 (body + AC bullet 2);
CLS-2..8 bodies untouched. component-inventory.md change confined to the "Combats list row"
entry. CHANGELOG.md adds one row, no other lines altered.

## Other findings
- CHANGELOG row dated 2026-07-04 (current date); consistent with the close.
- Doc-syncer correctly translated verification.md's "owner-spec divergence" note into a green
  spec: rather than leave CLS-1 falsely claiming Export/share, it reworded CLS-1 to match shipped
  Edit+Delete while preserving the CLS-8 forward pointer — accurate, no false claims added.
- No contradictions with unrelated capabilities (undo-redo UND-2, import-export IMP-*) spotted;
  cross-links resolve to existing IDs.
