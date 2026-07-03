---
id: hp
prefix: HP
---

# HP — damage, heal, temp HP, health bands, numpad

## HP-1 — Max HP, current HP, temp HP

Max HP is full health; required, must be positive (range: [[../reference/limits]]). Current HP
starts equal to Max HP and may go negative, floored at `-MaxHP`. Temp HP is a buffer set freely
by the DM (range: [[../reference/limits]]); **Set Temp HP replaces** the current value (entering
0 clears it); damage drains temp HP first, then current HP; healing restores current HP only,
never temp.

**AC:**
- A new combatant's `currentHp = maxHp`, `tempHp = 0`.
- Current HP is clamped no lower than `-maxHp`.
- Setting temp HP replaces the prior buffer value; setting it to 0 clears it.

## HP-2 — Heal formula

`currentHp = min(currentHp + n, max(maxHp, currentHp))` — healing never reduces current HP, even
when current HP already exceeds Max HP (possible after lowering Max HP, HP-5).

**AC:**
- Healing by `n` never results in a lower `currentHp` than before the heal.
- If `currentHp > maxHp` already, healing does not clamp it down to `maxHp`.

## HP-3 — HP numpad actions

Three delta-based commit actions, entered via a digit pad with backspace/clear: **Deal Damage**
(subtracts; drains temp HP first, then current HP, clamped at `-maxHp`), **Restore HP** (adds to
current per the heal formula, HP-2), **Set Temp HP** (replaces the buffer, HP-1). Committing an
empty entry is a no-op (no state change, no log entry).

**AC:**
- Dealing damage `n` drains `tempHp` before touching `currentHp`; the remainder after temp is
  exhausted subtracts from `currentHp`, clamped at `-maxHp`.
- Committing Deal Damage / Restore HP / Set Temp HP with an empty entry changes nothing.
- Each successful commit appends an entry to the combatant's HP log ([[hp-log]] LOG-1) and is
  pushed to the combat's undo history ([[undo-redo]] UND-1).

## HP-4 — Health status & bar

Percentage = current HP ÷ Max HP (temp HP excluded; Max HP ≥ 1, so never divides by zero).

| Status | Range | Bar |
|--------|-------|-----|
| full | 100% or above | full bar (`currentHp > maxHp` also reads full) |
| wounded | 50–99% | partial |
| bloodied | >0–49% | low |
| dead | 0 or below | reverse bar, alarm color, fills opposite direction as HP goes more negative, maxing at `-maxHp`; visual label only — the combatant stays in turn order |

The combatant card's background tints to match `healthStatus`, reusing the same tokens as the
health bar: normal at full/wounded, a bloodied tint below 50%. At 0 HP or below the tint
**differs by type**: a neutral/muted "out" tint for enemy/ally, but a distinct dead tint for a PC.
The active-turn highlight ring composes on top of this background regardless of HP state.

**AC:**
- `healthStatus` bands exactly per the table above; `currentHp > maxHp` reads `full`.
- At `currentHp <= 0` the bar renders in reverse-fill alarm styling instead of the normal bar,
  scaling toward `-maxHp`.
- "Dead" never removes the combatant from turn order or skips its turn ([[turns-rounds-escalation]] TRE-2).
- The card background tint follows `healthStatus`; at `currentHp <= 0` a PC gets the distinct dead
  tint while enemy/ally get the neutral/muted tint, and the active-turn ring still renders on top.

## HP-5 — Editing Max HP does not touch current HP

Changing Max HP via the combatant edit form never auto-changes current HP. A Max HP edit is
recorded as its **own discrete undoable step**, separate from any other field changes saved in
the same form submit, and appends a "Set Max HP" entry to the combatant's HP log.

**AC:**
- Changing Max HP alone leaves `currentHp` numerically unchanged (it may now read as a different
  percentage/band per HP-4).
- Saving a form that changes Max HP *and* other fields together produces two separate undo
  entries: one for the Max HP change, one for the rest ([[undo-redo]] UND-4).
- A Max HP edit appends a "Set Max HP" HP-log entry ([[hp-log]] LOG-1).

## HP-6 — Numpad panel behavior

Opens by tapping a combatant's HP. Shows current HP / Max HP and temp HP at the top before any
entry, so the DM sees the buffer being drained. Dismissing without committing (tap outside, or
Cancel) closes with no change and no toast, abandoning any partial entry.

**AC:**
- The panel displays cur/max HP and temp HP before any digit is entered.
- Dismissing without pressing a commit action makes no state change.
