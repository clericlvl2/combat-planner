# Verification: 011-remove-jump-to-turn (doc pass)

| AC | Verdict | Evidence |
|----|---------|----------|
| TRE-2 prose: manual jump control removed, auto-scroll prose kept | PASS | specs/capabilities/turns-rounds-escalation.md:22-25 — "jump to turn" prose deleted, "Each Advance auto-scrolls the newly active combatant's row into view." kept |
| TRE-2 AC: "jump to turn" bullet removed, auto-scroll bullet kept | PASS | specs/capabilities/turns-rounds-escalation.md:33 (bullet "Advancing the turn scrolls the active combatant's row into view automatically." retained); jump-to-turn bullet deleted |
| TRE-2 auto-scroll backed by shipped code | PASS | src/routes/combats/[id]/+page.svelte:41-46 — `$effect` querying `[data-active="true"]` and calling `scrollIntoView` on advance |
| PLT-3 prose: Jump pill / header-jump removed, header-advance/Advance FAB kept | PASS | specs/capabilities/platform.md:44-53 — now reads "header-advance tonal roundel icon button" only, Jump/pill language removed; Advance FAB retained |
| PLT-3 AC bullet updated to drop Jump | PASS | specs/capabilities/platform.md:63-65 — bullet now says "header Advance roundel icon button", no Jump/pill mention |
| i18n-catalog: active.jumpToTurn / a11y.jumpToTurn rows removed | PASS | specs/reference/i18n-catalog.md:76 (active.jumpToTurn row deleted, only `active.advance` remains), :264 (a11y.jumpToTurn row deleted); code confirms no `jumpToTurn` key anywhere: `grep -ril "jumpToTurn" src messages` returns nothing |
| component-inventory: JumpToTurnButton / header-jump removed, header-advance retained | PASS | specs/reference/component-inventory.md:18-19 (surface list drops "JumpToTurnButton"), :44 (`header-advance tonal-circle icon button` only), :53-56 (JumpToTurnButton bullet replaced with auto-scroll note referencing TRE-2), :144 (table cell drops `header-jump`), :167-172 (Active header line drops header-jump), :193 (Button primitive row drops JumpToTurnButton/header-jump); code confirms `JumpToTurnButton.svelte` does not exist and `CombatHeader.svelte` has no `onJump`/`header-jump` (grep clean, only `header-advance` at CombatHeader.svelte:117) |
| CHANGELOG: one accurate row, not duplicated | PASS | specs/CHANGELOG.md new line "011-remove-jump-to-turn \| 2026-07-11 \| ..." — single row, correctly describes removal of JumpToTurnButton/jumpToActiveTurn/jump icon/i18n keys and the newly-wired auto-scroll; matches change.md's What-changes table (TRE-2, PLT-3) and shipped code |

## Scope check
In-scope-only. Doc diff touches exactly the five files named in the dispatch (turns-rounds-escalation.md, platform.md, i18n-catalog.md, component-inventory.md, CHANGELOG.md). No edits to other capability files, no restatement of unrelated requirements changed.

## Other findings
None. Docs neither over-claim (no leftover mention of Jump/header-jump/JumpToTurnButton anywhere in the four spec files) nor under-claim (auto-scroll-on-advance is described and cross-referenced consistently in TRE-2, platform.md's Active-header line, and component-inventory.md's advance-flow note). Code and docs agree in both directions.
