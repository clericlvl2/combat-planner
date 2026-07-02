---
categories:
  - "[[Prompts]]"
aliases:
  - Combat Planner Rules & Glossary
related:
  - "[[Combat Planner PRD]]"
  - "[[Combat Planner Data Model]]"
  - "[[Combat Planner UX & IA]]"
  - "[[Combat Planner Requirements Prompt]]"
---

# Combat Planner — 13th Age Rules & Glossary

> Domain reference for the app. Defines every game term the app touches, the exact numeric limits, and the small set of derived rules the app computes. The app does **not** automate combat — conditions and most rules are reminders the DM applies. See [[Combat Planner PRD]] for scope, [[Combat Planner Data Model]] for structure.

## 1. Core terms

- **Combat / encounter** — one fight. Has a lifecycle (§2), a combatant roster, a round counter, an escalation die, and an active-turn pointer.
- **Combatant** — a participant (PC, enemy/NPC, or ally). Same fields for all; the type only changes color.
- **Combatant type (PC / enemy / ally)** — a flag for visual distinction (color) only. Does not change fields, ordering, or behavior. One initiative list regardless of type. Optional on the add form, default **enemy**.
- **PC** — a player character (a player has the sheet; at the table the DM just tracks its turn/HP here). Visual-only type.
- **Ally** — a friendly NPC the DM runs at the table (DM-owned, no player sheet behind it; the DM tracks its HP). On the party's side like a PC, but DM-run. Purely a third color label — same fields and behavior as any combatant; introduces no new fields or mechanics.
- **Round** — one full cycle through all combatants. Starts at 1 on Start. Increments when the turn wraps from the last combatant back to the first. Hard-capped (range in §7).
- **Turn** — a single combatant acting. The "active turn" highlights whose turn it is. Exists only while the combat is **Active**.

## 2. Combat lifecycle, initiative & turns

### Lifecycle (two states: Setup → Active)

- **Setup (inactive):** the default state of a new combat. The DM adds/edits/removes combatants, rolls or sets initiative. The list does **not** auto-sort while in Setup — it shows add order, so rolling/editing a value updates the number without reshuffling rows underfoot; it snaps to sorted order on Start. There is **no active turn, no Advance control, and the round counter + escalation die are hidden.**
- **Start / Activate:** a single action that (1) auto-rolls initiative for every still-unrolled combatant (d20 + bonus), (2) re-sorts, (3) sets the combat **Active**, (4) marks the top of the order as the active turn, (5) reveals the Advance control, round counter (Round 1), and escalation die (0).
- **Active:** turns advance; round and escalation track. Combatants can still be added/edited/removed (mid-combat add lands unrolled at the bottom).
- **Returning to Setup / resetting** (no separate "Ended" state):
  - **Clear combat** — removes all combatants → empty Setup. Confirmation required; reversible via the combat's Undo history (a roster snapshot is kept).
  - **Restart** — keeps the roster, resets each combatant (initiative → `"-"`, current HP → Max HP, temp HP → 0, conditions cleared), round → 1, escalation die reset to 0, combat back to **Setup**. For re-running the same enemies, waves, or a TPK redo.
  - If **all combatants are removed** one-by-one while Active, the combat reverts to Setup (active pointer cleared, round/escalation hidden).

### Initiative

- **Initiative value** — a combatant's place in order. Unset = `"-"`.
- **Initiative bonus** — added to a d20 roll. Default 0 (range in §7).
- **Manual initiative** — DM sets a value directly (range in §7).
- **Per-combatant initiative control (the init cell):**
  - **Tap** = roll d20 + bonus for that one combatant (re-tap re-rolls).
  - **Long-press** = manual numeric entry (covers re-editing an existing value and negative values down to −9). Manual entry is also reachable from the combatant edit form as a discoverability backup.
  - **Active only:** the init cell is disabled (no tap-roll, no long-press) once the combat is Active — turn order is locked in for the fight. The only way to change an Active combatant's initiative is the manual-initiative field on the combatant edit form (and, for a new mid-combat add, the same field surfaced on the add form — see §7).
- **Start auto-roll** = rolls d20 + bonus for every combatant still at `"-"`. Already-set values are untouched.
- **Sort order** — initiative high → low. Tiebreak: (1) higher initiative bonus, (2) original add order. Combatants with `"-"` always sit at the bottom, in add order. **While Setup, the list does not auto-sort** — it renders in add order, and an initiative/bonus edit only updates the displayed value. **Once Active, the list re-sorts live** on any initiative or bonus change (a bonus edit re-sorts only when it changes a tie).

### Turns

- **Active-turn pointer** — bound to a combatant's identity, not a row position. Set to the top of the order on **Start**. A re-sort keeps it on the same combatant.
- **Advancing the turn** — moves to the next combatant in sorted order. Past the last → wraps to first, round +1, escalation die +1 (see §3). A plain advance within the same round never touches the escalation die. Dead combatants are **not** skipped. **At round 99 the advance is blocked** (cannot start round 100).
- **Removing the active combatant** — the pointer moves to the next combatant in order; if the removed one was last, it moves to the new last. This never triggers a premature round increment.

## 3. Escalation die (13th Age)

- A per-combat counter, **0–6**, stored as a single value. Visible only while the combat is Active.
- **Increments by 1 automatically only when Advance wraps the turn order into a new round** (last combatant → first, round +1). A plain turn advance within the same round never touches it.
- **DM override:** the DM may set it to any value 0–6 at any time via the header control; it then continues incrementing by 1 from that value on future round-wraps.
- **Fully decoupled from the round counter:** editing the round counter never touches escalation, and setting/advancing escalation never touches the round.
- Reset to **0** on Clear and on Restart.
- The app only tracks/displays it; it does not add it to any roll.

## 4. Hit points

- **Max HP** — full health. Required, must be positive (range in §7).
- **Current HP** — present health. New combatants start at Max HP. May go **negative**, floored at **−MaxHP** (silently clamped).
- **Temp HP** — a buffer set freely by the DM (range in §7).
  - **Set Temp HP replaces** the current value (entering 0 clears it).
  - Damage drains temp HP first, then current HP.
  - Healing restores **current HP only** (never temp).
- **HP numpad actions** (delta-based, plus the set action): **Deal Damage** (subtract; temp first, then current; clamps at −MaxHP), **Restore HP** (add to current; never reduces — see formula), **Set Temp HP** (replace the buffer). Backspace/clear available; committing an empty entry is a no-op.

### Heal formula

`currentHP = min(currentHP + n, max(MaxHP, currentHP))` — healing never reduces current HP, even if current HP currently exceeds Max HP (possible after lowering Max HP).

### HP change log (per-combatant history)

Every combatant keeps a **read-only HP change log** — a record the DM can review to see how that one combatant's HP changed over the fight (informational only; the DM reads it, never edits it). It logs the three HP numpad actions (Damage / Heal / Set temp HP) **plus** Max HP edits from the edit form, and is **distinct from the combat-level Undo/Redo** ([[Combat Planner Data Model]] §8). Full model — entry shape, what's logged, lifetime, and the undo interaction — in [[Combat Planner Data Model]] §9.

### Health status & bar (by current HP %)

Percentage = current HP ÷ Max HP. Temp HP is excluded. Max HP is always ≥ 1, so there is no divide-by-zero.

| Status | Range | Bar |
|--------|-------|-----|
| full | 100% (or above) | full bar — includes `currentHP > MaxHP` (>100%, possible after lowering Max HP), which reads as full |
| wounded | 50–99% | partial |
| bloodied | >0–49% (any positive HP below half) | low |
| dead | 0 or below | **reverse bar**: a distinct alarm color that fills in the opposite direction as HP goes deeper negative, maxing out at −MaxHP. "dead" is a visual label only; the combatant stays in turn order |

## 5. Defenses

13th Age uses three defenses, all integers. The app stores/displays them (in-row on the combatant card at all sizes); it does not roll against them.

- **AC** — Armor Class. Placeholder 10 (range in §7).
- **PD** — Physical Defense. Placeholder 10 (range in §7).
- **MD** — Mental Defense. Placeholder 10 (range in §7).

## 6. Conditions

12 preset conditions. In the app they are **pure visual labels** — no stat changes, no turn effects, no auto-expiry. Each is unique per combatant; a combatant may carry up to all 12 at once; removal is always manual. On the compact row, the first few icons show with a "+K" overflow chip; the full set is in the expanded row. (Rules meaning is the DM's to apply; summarized as reference.)

| Condition | 13th Age reminder (DM applies, app does not enforce) |
|-----------|------------------------------------------------------|
| charmed | treats an enemy as ally; limited actions |
| confused | can't use its best attacks; may act randomly |
| dazed | −4 to attacks |
| fear | −4 attacks & defenses; can't use some abilities |
| helpless | unconscious/out; attackers can crit on melee |
| hindered | can only move or act, not both |
| shocked | situational penalty (campaign/monster-specific) |
| stuck | can't move (no disengage/move) |
| stunned | can't take actions; −4 to defenses |
| vulnerable | attacks against it crit on a lower roll |
| weakened | −4 attacks & defenses; reduced damage |
| staggered | at or below half HP; some abilities trigger |

## 7. Combatant defaults & limits (single source of truth)

### Add-combatant form

| Field | Type | Required | Placeholder | Default |
|-------|------|----------|-------------|---------|
| Name | text | yes (trimmed; whitespace-only blocks submit) | "Namius Name" | — |
| Type | PC / enemy / ally | no | — | enemy |
| Initiative bonus | number | no | 0 | 0 |
| Max HP | number | yes | 10 | — |
| AC | number | yes | 10 | — |
| PD | number | yes | 10 | — |
| MD | number | yes | 10 | — |
| Text note | text | no | "Useful notes…" | "" |

> The same form (pre-filled) is reused to **edit** an existing combatant, plus a manual-initiative field as a backup entry point. When adding a combatant while the combat is already **Active**, the same manual-initiative field is also surfaced on the add form so the DM can hand-enter a known value for the latecomer (default behavior unchanged — left blank, it joins unrolled ("-") at the bottom, same as §5 F2). Changing Max HP does not auto-change current HP.

### Numeric limits & validation

Numeric fields **clamp to their range on commit** with a brief inline hint (validation is forgiving to keep live play fast). The note is hard-capped at 250 characters during input.

| Field | Min | Max |
|-------|-----|-----|
| Note length | — | 250 chars |
| Initiative bonus | −99 | 99 |
| Initiative value (manual) | −9 | 99 |
| AC | 0 | 99 |
| PD | 0 | 99 |
| MD | 0 | 99 |
| Max HP | 1 | 999 |
| Current HP | −MaxHP | 999 |
| Temp HP | 0 | 999 |
| Round counter | 1 | 99 |
| Escalation die | 0 | 6 |

### Hard caps

- **Combatants per combat: 30.** Adding the 31st is blocked with a message.
- **Total combats: 100.** Creating/importing past 100 is blocked with a message.

## 8. Duplicate behavior

- Name uses Windows-style suffix: "Goblin" → "Goblin 1" → "Goblin 2" … (skips suffixes already taken to avoid collisions).
- Duplicate resets: initiative → `"-"`, current HP → Max HP, temp HP → 0, conditions cleared, HP change log emptied.
- Duplicate copies: all stats (type, bonus, Max HP, AC/PD/MD) and the text note.
- Placed at the **bottom** of the list. Subject to the 30-combatant cap.
