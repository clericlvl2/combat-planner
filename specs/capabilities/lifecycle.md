---
id: lifecycle
prefix: LIF
---

# Lifecycle — Setup / Active, Start, Clear, Restart

A combat has exactly two states: **Setup** and **Active**. No separate "Ended" state — a
finished fight returns to Setup via Clear or Restart, or automatically when the last combatant
is removed.

## LIF-1 — New combat starts in Setup

A newly created combat begins in `state: setup`. No active turn, no Advance control, round
counter and escalation die are hidden.

**AC:**
- On create, `state = setup`, `activeCombatantId = "none"`, `round` and escalation are not shown.

## LIF-2 — Setup behavior (no live sort)

While `state == setup` the DM adds/edits/removes combatants and rolls or sets initiative. The
list renders in add order and does **not** auto-sort — a roll or edit updates the displayed
value without moving the row. It snaps to sorted order on Start (see [[initiative]] INI-4).

**AC:**
- Rolling or editing a combatant's initiative while in Setup updates the value in place; the
  row does not move.
- `sortedCombatants` ([[initiative]] INI-4) is only applied while `state == active`; while
  `setup`, the roster renders in raw `combatants` (add) order.

## LIF-3 — Start (Setup → Active transition)

A single action that: (1) auto-rolls initiative (`d20 + bonus`) for every still-unrolled
combatant, (2) re-sorts, (3) sets `state = active`, (4) marks the top of sorted order as the
active turn, (5) reveals the Advance control, round counter (Round 1), and escalation die (0).
Not confirmation-gated.

**AC:**
- Start rolls every combatant still at `"-"`; already-set values are untouched.
- After Start: `state = active`, `round = 1`, `activeCombatantId` = top of sorted order,
  Advance/round/escalation become visible.
- Start pushes a **pre-Start snapshot** to the combat's undo history (unset initiatives, prior
  `state`, `round`, `activeCombatantId`) so Undo restores Setup exactly — see [[undo-redo]] UND-3.

## LIF-4 — Active state behavior

While `state == active`, turns advance ([[turns-rounds-escalation]]) and round/escalation track.
Combatants can still be added/edited/removed; a mid-combat add lands unrolled (`"-"`) at the
bottom of the list.

**AC:**
- Adding a combatant while Active appends it with `initiative = "-"` at the bottom; the active
  turn identity is unchanged.

## LIF-5 — Clear combat

Removes all combatants (and their HP logs, [[hp-log]] LOG-5) → empty Setup. Requires
confirmation. Reversible via the combat's Undo history (a roster snapshot is pushed).

**AC:**
- Clear empties the roster, resets `round → 1`, `escalation → 0`, `activeCombatantId = "none"`,
  `state → setup`.
- Clear always shows a confirmation dialog first.
- Clear is undoable: Undo restores the exact prior roster ([[undo-redo]] UND-3).

## LIF-6 — Restart

Keeps the roster; resets each combatant (initiative → `"-"`, current HP → Max HP, temp HP → 0,
conditions cleared, HP log emptied — [[hp-log]] LOG-5), round → 1, escalation → 0, combat back to
Setup. For re-running the same enemies, waves, or a TPK redo.

**AC:**
- Restart keeps every combatant record but resets initiative/HP/temp/conditions/HP-log per
  combatant; `round → 1`; escalation → 0; `state → setup`.
- Restart always shows a confirmation dialog first.
- Restart is undoable: Undo restores the pre-Restart roster snapshot exactly.

## LIF-7 — Remove-all-while-Active auto-reverts to Setup

If all combatants are removed one-by-one while Active (not via Clear), the combat silently
reverts to Setup: active pointer cleared, round/escalation hidden. No confirmation dialog (this
is a side effect of individual removals, each already covered by [[combatants]] removal rules,
not a dedicated destructive action).

**AC:**
- Removing the last/only combatant sets `activeCombatantId = "none"`; if the combat was
  `active`, it reverts to `setup` with no premature round increment.

## LIF-8 — State transition integrity

`state` transitions: `setup → active` only via Start (LIF-3); `active → setup` via Clear
(LIF-5), Restart (LIF-6), or removing all combatants (LIF-7). No other path changes `state`.

**AC:**
- No UI control other than Start, Clear, Restart, or removing the last combatant ever changes
  `state`.
