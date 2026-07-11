---
status: archived
backlog: B-022
---

# Change: remove-jump-to-turn

## Why

B-022 — remove the "jump to turn" control from the Combat — Active screen. It duplicates the
auto-scroll that Advance already performs (TRE-2 auto-scrolls the newly active row into view on
every advance), so the manual jump control earns no keep in the turn model. Removing it trims the
Active chrome (mobile Jump pill + desktop `header-jump` roundel), the `jumpToActiveTurn` handler,
the `jump` icon, and the two now-dead i18n keys.

Note: the control is currently wired and functional (not literally dead code) — this is a
deliberate product removal, not a dead-code sweep.

Scope resolution: the app's only scroll-to-active-row code lives inside the `jumpToActiveTurn`
handler being removed. TRE-2 already specifies auto-scroll-on-advance, but that was **never
implemented**. This unit therefore removes the manual control **and** wires the auto-scroll into
the advance flow (advancing scrolls the newly active row into view), making TRE-2 honest — the DM
keeps automatic scroll-to-active without the redundant button.

## What changes

By capability-spec ID:

| ID | Change |
|----|--------|
| `TRE-2` | amend: drop the on-demand "jump to turn" control (prose + its AC bullet). Keep the auto-scroll-on-advance requirement/AC — and implement it in the advance flow (it was spec'd but never coded; the removed manual handler held the only scroll code). |
| `PLT-3` | amend: remove the Jump pill / `header-jump` roundel from the Active per-breakpoint control placement (prose + AC). Advance FAB / `header-advance` roundel stay. |

Reference docs re-synced at close (not capability IDs): `component-inventory.md` (Active header
chrome, Button-family row), `i18n-catalog.md` (drops `active.jumpToTurn`, `a11y.jumpToTurn`).

## Acceptance criteria

- [ ] `src/lib/components/app/JumpToTurnButton.svelte` is deleted, and its entry is removed from
      `src/lib/components/app/README.md`.
- [ ] `CombatHeader.svelte` no longer renders the `header-jump` roundel and no longer declares an
      `onJump` prop; the `header-advance` roundel and its handler remain intact.
- [ ] `src/routes/combats/[id]/+page.svelte` no longer imports/renders `JumpToTurnButton`, no
      longer defines `jumpToActiveTurn`, and no longer passes `onJump` to `CombatHeader`.
- [ ] Advancing the turn scrolls the newly active row (`[data-active="true"]`) into view — the
      auto-scroll is now wired into the advance flow (replacing the removed manual handler), so
      TRE-2's auto-scroll AC is backed by code.
- [ ] `jump: Crosshair` is removed from `src/lib/icons.ts`; the `Crosshair` import is removed too
      if it has no other consumer.
- [ ] `active.jumpToTurn` and `a11y.jumpToTurn` are removed from all six `messages/*.json`
      locales, and Paraglide is regenerated (no generated `jumpToTurn` message functions remain).
- [ ] `TRE-2` and `PLT-3` are amended per the table above; no other capability requirement is
      altered.
- [ ] `npm run gate` passes.

## Out of scope

- The Advance control (FAB + `header-advance` roundel), round counter, escalation die, and
  round-99 wrap block — untouched.
- Any icon in `icons.ts` other than the `jump`/`Crosshair` entry.
- B-021 (header unification) and any other Active-header restyling.
