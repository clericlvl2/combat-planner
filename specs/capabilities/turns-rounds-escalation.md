---
id: turns-rounds-escalation
prefix: TRE
---

# Turns, rounds & escalation die

Sources: `PRD` §4 (decision 3), §6 Epic E (E5–E9) · `Rules & Glossary` §2 (Turns), §3
(Escalation die) · `Data Model` §3 (`round`, `escalation`, `activeCombatantId`, `canAdvance`), §7
(`advanceTurn`, `editRound`, `setEscalation`) · `UX & IA` §4c (Turn/round/escalation) ·
`Test Plan` §3.1 (advanceTurn), §3.3 (Escalation), §6 (E5–E9 rows).

## TRE-1 — Active-turn pointer

The active-turn pointer is bound to a combatant's **identity**, not a row position. It is set to
the top of sorted order on Start ([[lifecycle]] LIF-3). A re-sort (e.g. from an initiative edit)
keeps the pointer on the same combatant.

**AC:**
- `activeCombatantId` always names a combatant id (or `"none"` while Setup), never a row index.
- Re-sorting the list never changes which combatant is marked active.

## TRE-2 — Advancing the turn

Moves to the next combatant in sorted order. Past the last combatant, it wraps to the first,
increments the round by 1, **and** increments the escalation die by 1 (clamped at 6). A plain
advance within the same round changes neither round nor escalation. Dead combatants (0 HP or
below) are **not** skipped. Advance is the primary Active-state action — placed as a bottom-right
floating button in the thumb zone on mobile (placement detail: [[../reference/component-inventory]]).

**AC:**
- Advancing to a non-last combatant changes only `activeCombatantId`.
- Advancing past the last combatant wraps `activeCombatantId` to the first, `round += 1`, and
  escalation `+= 1` (capped at 6) in the same step.
- A dead combatant (HP ≤ 0) still receives its turn in sorted order.

## TRE-3 — Round-99 wrap block

`canAdvance = state == active && combatants.length > 0 && !(round == 99 && active is the last
combatant in sorted order)`. Only the round-99 → round-100 **wrap** is blocked — advancing
*within* round 99 (combatant 1 → 2 → …) still works. The Advance control is disabled exactly at
that boundary.

**AC:**
- Advancing within round 99 (not from the last combatant) succeeds normally.
- Advancing from the last combatant of round 99 is blocked; the Advance control shows disabled.

## TRE-4 — Removing the active combatant

Removing the active combatant moves the pointer to the next combatant in order; if the removed
one was last, it moves to the new last. This never triggers a premature round increment. Full
removal mechanics owned by [[combatants]] CBT-8.

**AC:**
- Removing the active combatant advances the pointer without incrementing `round` or escalation.

## TRE-5 — Round counter

Visible only while `state == active` (`showRoundAndEscalation`, [[lifecycle]] LIF-1/LIF-3).
Range 1–99 (see [[../reference/limits]]). Editable by tapping the counter; editing it never
touches the escalation die (fully decoupled — TRE-6).

**AC:**
- The round counter is hidden entirely while Setup.
- Tapping the round counter opens numeric entry (1–99, clamped); committing updates `round` only.

## TRE-6 — Escalation die

A per-combat counter, 0–6, stored as a single value, visible only while Active. Increments by 1
automatically only when Advance wraps the turn order into a new round (TRE-2); a plain advance
never touches it. The DM may set it to any value 0–6 directly at any time via the header
control; future round-wraps continue +1 from that value. Fully decoupled from the round counter
in both directions. Resets to 0 on Clear ([[lifecycle]] LIF-5) and Restart ([[lifecycle]] LIF-6).
The app only tracks/displays it — it does not add it to any roll.

**AC:**
- Escalation is hidden entirely while Setup.
- Escalation increments by exactly 1 only on a round-wrap Advance; a same-round Advance leaves
  it unchanged.
- The DM can set escalation directly to any value 0–6 at any time; a subsequent round-wrap
  increments from that new value.
- Editing the round counter never changes escalation, and setting/advancing escalation never
  changes the round.
- Escalation resets to 0 on Clear and on Restart.
