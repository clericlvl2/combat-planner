# Verification: 002-combats-home

Pass: code-diff verification against `change.md` acceptance criteria (working tree vs HEAD a252df5).

| AC | Verdict | Evidence |
|----|---------|----------|
| `/combats` renders vertical list of rows w/ title, description, color tag | PASS | `src/routes/combats/+page.svelte:56` renders `CombatList`; `CombatList.svelte:43-52` maps rows; `CombatRow.svelte:40-46` shows `ColorTagDot` + title + description (desc conditional) |
| Each row trailing `⋮` menu has exactly Edit + Delete (no Export/placeholder) | PASS (vs change.md scope) | `CombatRowMenu.svelte:41-49` — only `combats.row.menu.edit` + `.delete` items; no export item. See Other findings re owner-spec CLS-1. |
| Creating a combat adds it at top of list, in `state: setup` | PASS | `app.ts:23-25` inserts at head with `topOrder-1`; `factories.ts:90` `state: 'setup'`; `CombatFormDialog.svelte:63` calls `store.createCombat` |
| 101st combat blocked with `errors.combatCap`; nothing created | PASS | `app.ts:22` returns `created:null` at `>= MAX_COMBATS(=100)`; `combat-store:120` returns null; `CombatFormDialog.svelte:64-66,102-104` sets `capBlocked`, shows `errors.combatCap` |
| Edit updates title/description/color tag without touching roster or state | PASS | `app.ts:38-51` `editCombat` spreads `current`, changes only title/description/colorTag/updatedAt; test `app.spec.ts:59` asserts roster/state untouched |
| Delete always confirm-gated; cascades combatants/undo/HP-logs; no Undo path | PASS | `CombatRow.svelte:56-65` `ConfirmDialog` gate → `onDelete`; `combat-store:137-140` `deleteCombat` → `removeCombatRow`; combatants/undoStack/hpLog are inline fields on the Combat row (persistence.ts:6), removed with it; no Undo affordance in UI |
| Tapping a row (outside `⋮`) navigates to `/combats/[id]` | PASS | `CombatRow.svelte:35-47` body button → `onOpen`; `+page.svelte:openCombat` `goto('/combats/${id}')` |
| Dragging a row updates order; survives reload | PASS | `CombatList.svelte:46-40` `dndzone` finalize → `reorderCombats`; `combat-store:142-146` `App.reorderCombats` + `persistCombats` to Dexie |
| First launch: one empty combat auto-created, its page opens, flag set | PASS | `+page.ts:16-24` reads `firstLaunchDone` pre-hydrate, hydrate runs `App.firstLaunch` (`combat-store:43`), redirects to seeded combat; `app.ts:88-92` creates one combat + sets flag |
| Subsequent launch lands on Combats home list | PASS | `+page.ts:25` falls through to `redirect(307,'/combats')` when not first launch |
| `resetAll` clears flag so first-launch re-runs once (existing behavior holds) | PASS | `combat-store:149-158` `resetAll` re-arms via `App.firstLaunch([], settings)`; unchanged by this diff; new `+page.ts` reads the flag fresh each load so re-armed launch is detected |
| `npm run gate` passes | PASS | Ran full gate: biome clean (68 files), svelte-check 0 errors, 123/123 unit tests pass, build + PWA succeed, exit 0 |

## Scope check

In-scope. Declared out-of-scope areas untouched:
- No import/export code, no Combats-home Import control (CLS-8) — `CombatRowMenu` has no export item.
- `messages/*.json` NOT modified (git status) — confirms "consumes already-cataloged `combats.*` keys, adds none".
- `/combats/[id]` per-combatant screen, HP/initiative/turns/conditions/undo mechanics untouched.
- Settings/About untouched.

Edits outside the two amended files (`+page.ts`, `combats/+page.svelte`) all support declared IDs:
`combat-store.svelte.ts` + `domain/app.ts` add `editCombat` (CLS-3, explicitly promised in change.md "What changes"); new `src/lib/components/app/*` are the CLS-1..6 list/form/FAB surface; `dev-seed.ts` deletion + `+layout.svelte` seed removal retire the M2 stub that CLS-7 replaces. No edit lands outside the change's stated surface.

## Other findings

- Owner-spec divergence (intentional, flagged for close): `specs/capabilities/combats-list.md` CLS-1 AC bullet 2 requires the row `⋮` menu to expose "exactly Edit, **Export/share**, and Delete". This change implements Edit + Delete only, deliberately deferring Export/share to CLS-8/M5 (change.md narrows the AC and lists it out of scope). Verifying against change.md's own ACs = PASS, but the capability owner file's CLS-1 will not be fully green until CLS-8 lands. Not a regression; a scoping note for `/spec-close`.
- Dead-but-harmless: i18n key `combats.row.menu.export` (en.json:11) exists and is unused this unit — pre-existing catalog entry, reserved for CLS-8.
- No regressions spotted against unrelated capabilities; full unit suite (123 tests) green.
