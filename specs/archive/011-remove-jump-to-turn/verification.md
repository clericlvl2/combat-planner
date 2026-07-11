# Verification: 011-remove-jump-to-turn

| AC | Verdict | Evidence |
|----|---------|----------|
| `JumpToTurnButton.svelte` deleted + README entry removed | PASS | `git status` shows `D src/lib/components/app/JumpToTurnButton.svelte`; `src/lib/components/app/README.md` diff drops the `JumpToTurnButton.svelte    scroll active row into view (§7)` line |
| `CombatHeader.svelte` drops `header-jump` roundel + `onJump` prop, keeps `header-advance` | PASS | `src/lib/components/app/CombatHeader.svelte` diff removes the `onJump` prop, `Jump` icon const, and the second `<Button>`/roundel block (former lines ~130-139); the `header-advance` `<Button onclick={onAdvance}>` block (lines ~117-131) is untouched |
| `+page.svelte` no longer imports/renders `JumpToTurnButton`, no `jumpToActiveTurn`, no `onJump` passed | PASS | `src/routes/combats/[id]/+page.svelte` diff removes the `import JumpToTurnButton …` line, the `function jumpToActiveTurn()` def, the `onJump={jumpToActiveTurn}` prop, and the `<JumpToTurnButton onclick={jumpToActiveTurn}/>` render |
| Advancing scrolls newly active row (`[data-active="true"]`) into view — auto-scroll wired into advance flow | PASS | `src/routes/combats/[id]/+page.svelte:39-43` — `$effect(() => { if (!combat?.activeCombatantId) return; mainEl?.querySelector('[data-active="true"]')?.scrollIntoView(...) })`, reactive on `combat.activeCombatantId` so it fires on every advance (including round-wrap) with no manual trigger needed |
| `jump: Crosshair` removed from `icons.ts`; `Crosshair` import removed | PASS | `src/lib/icons.ts` diff drops `Crosshair` from the `@lucide/svelte` import list and drops the `jump: Crosshair` entry from `chromeIcon`; confirmed no other `Crosshair`/`jump` reference remains in current file text |
| `active.jumpToTurn` / `a11y.jumpToTurn` removed from all six `messages/*.json`; Paraglide regenerated | PASS | `git diff` on `messages/{de,en,es,fr,ja,ru}.json` each drop both keys; `grep -rl "jumpToTurn" src/lib/paraglide` returns no matches (generated tree re-synced, no stale `jumpToTurn` message functions) |
| `TRE-2` and `PLT-3` amended per the What-changes table; no other requirement altered | PASS | `specs/capabilities/turns-rounds-escalation.md` TRE-2 prose drops the on-demand jump-button sentence and its AC bullet, keeps "Each Advance auto-scrolls the newly active combatant's row into view." + matching AC bullet unchanged; `specs/capabilities/platform.md` PLT-3 prose/AC drop `header-jump`/Jump-pill mentions, keep `header-advance` untouched; `git diff` on both files shows no other section touched |
| `npm run gate` passes | PASS | full `npm run gate` run (lint+check+test:unit+build) completed with `0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS` (Biome) and a clean production build (adapter-static "Wrote site to build ✔ done"); no test failures in output |

## Scope check

In-scope only. Touched files: `src/lib/components/app/CombatHeader.svelte`,
`src/lib/components/app/JumpToTurnButton.svelte` (deleted), `src/lib/components/app/README.md`,
`src/lib/icons.ts`, `src/routes/combats/[id]/+page.svelte`, all six `messages/*.json`,
`specs/capabilities/turns-rounds-escalation.md`, `specs/capabilities/platform.md`,
`specs/reference/component-inventory.md`, `specs/reference/i18n-catalog.md`,
`specs/CHANGELOG.md`, `specs/backlog.md` — all consistent with the change unit's declared scope
(component/route/icon/i18n files + the two amended capability specs + the two reference docs +
changelog/backlog housekeeping). The Advance FAB, `header-advance` roundel, round counter,
escalation die, and round-99 wrap block in `+page.svelte`/`CombatHeader.svelte` are confirmed
untouched by diff inspection. No other icon in `icons.ts` besides `jump`/`Crosshair` was removed.
No B-021 header-restyling changes present.

## Other findings

None. No regressions spotted: the auto-scroll effect is correctly scoped to
`combat.activeCombatantId` changes (not a general re-render trigger), and `mainEl` binding
(`bind:this={mainEl}` on `<main>`) was already present pre-change (only the trigger mechanism
changed from manual click to reactive effect).
