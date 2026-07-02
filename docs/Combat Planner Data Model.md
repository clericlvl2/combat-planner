---
categories:
  - "[[Prompts]]"
aliases:
  - Combat Planner Data Model
related:
  - "[[Combat Planner PRD]]"
  - "[[Combat Planner Rules & Glossary]]"
  - "[[Combat Planner UX & IA]]"
  - "[[Combat Planner Test Plan]]"
  - "[[Combat Planner Requirements Prompt]]"
---

# Combat Planner — Data Model (conceptual)

> **Conceptual** model only — entities, fields, relationships, derived values, persistence semantics. No storage technology, schema syntax, or types-as-code. Limits/defaults come from [[Combat Planner Rules & Glossary]]; behavior from [[Combat Planner PRD]].

## 1. Entities overview

```
AppData
 ├── Settings (1)
 └── Combat (0..100)        ← hard cap 100
      └── Combatant (0..30)  ← hard cap 30
           ├── conditions: set of Condition (0..12)
           └── hpLog: list of HpLogEntry (unbounded within a fight)
```

All data is local to one device. No user/account entity.

## 2. Settings (singleton)

| Field | Meaning | Notes |
|-------|---------|-------|
| language | active UI language | one of: en, de, es, fr, ja, ru. Default = autodetected browser locale, fallback en. |
| theme | dark / light / system | default system |
| firstLaunchDone | first-launch flag | drives first-launch auto-create (§7); `resetAll` sets it back to false to re-trigger |
| installHintDismissed | PWA install-hint dismissed flag | the subtle install hint shows once; once dismissed this persists so it does not reappear |
| (data version) | schema/version marker | for safe import + future migrations |

## 3. Combat

| Field | Meaning | Notes |
|-------|---------|-------|
| id | stable identifier | |
| title | combat name | from create/edit form |
| description | short description | |
| colorTag | color label | one of the preset swatch palette |
| listOrder | manual position in combats list | new combats inserted at top; drag updates this |
| **state** | **setup \| active** | new combats start in `setup`; Start → `active`; Clear/Restart/remove-all → `setup` |
| combatants | the combatant roster | see below; 0..30 |
| round | current round counter | meaningful/visible only while `active` (range in Rules §7) |
| escalation | escalation die value, 0–6 | stored directly (no derivation); +1 only when Advance wraps into a new round; fully decoupled from `round` in both directions; reset to 0 on Clear/Restart |
| activeCombatantId | identity of active turn, or "none" | bound to a Combatant id, not a position; "none" while `setup` |
| undoStack / redoStack | bounded action history | per-combat; each holds ≤10 reversible-action entries (§8); persisted; a new action clears redoStack |
| createdAt / updatedAt | timestamps | useful for import/debug |

**Derived (not stored):**
- **escalationDie** = `clamp(escalation, 0, 6)`. Only shown while `active`.
- **sortedCombatants** = combatants ordered per the initiative sort rule (see [[Combat Planner Rules & Glossary]] §2). **Only applied while `active`** — while `setup`, the roster is rendered in raw `combatants` (add) order; no live sort.
- **canAdvance** = `state == active && combatants.length > 0 && !(round == 99 && active is the last combatant in sorted order)`. Only the round-99 → round-100 **wrap** is blocked; advancing *within* round 99 (combatant 1 → 2 → …) still works.
- **showRoundAndEscalation** = `state == active`.

## 4. Combatant

| Field | Meaning | Notes |
|-------|---------|-------|
| id | stable identifier | turn pointer & undo reference it |
| name | display name | required; trimmed; duplicate suffixing per Rules §8 |
| type | PC \| enemy \| ally | optional input, default enemy; **visual only** (color) — all three share the same fields and behavior; `ally` = DM-run friendly NPC (DM tracks its HP) |
| addOrder | original insertion index | tiebreaker + "-" ordering |
| initiative | number or "-" | "-" = unrolled; sits at bottom (range in Rules §7) |
| initiativeBonus | number | default 0; used by roll (range in Rules §7) |
| maxHp | number | must be positive (range in Rules §7) |
| currentHp | number | starts = maxHp; floored at −maxHp (range in Rules §7) |
| tempHp | number | replace-on-set; damage drains first (range in Rules §7) |
| ac / pd / md | numbers | ranges in Rules §7 |
| note | text | "" if none (length limit in Rules §7) |
| conditions | set of Condition | 0..12, each unique |
| hpLog | ordered list of HpLogEntry | per-combatant **read-only HP change history** (§9); chronological; empty for a new/duplicated combatant; unbounded within a fight; **distinct from the Combat-level undo/redo stack** (§8) |

**Derived (not stored):**
- **healthPercent** = `currentHp / maxHp` (temp excluded; maxHp ≥ 1 so never divides by zero). May exceed 100% when `currentHp > maxHp` (possible after lowering Max HP, which never auto-changes current HP).
- **healthStatus** = full / wounded / bloodied / dead (thresholds + reverse-bar in Rules §4). `currentHp > maxHp` (>100%) reads as **full**.
- **isActive** = `combat.activeCombatantId == this.id`.

## 5. Condition (enumeration)

Fixed set of 12 (no custom conditions in v1): `charmed, confused, dazed, fear, helpless, hindered, shocked, stuck, stunned, vulnerable, weakened, staggered`. Stored as membership only — no per-condition duration, stacks, or value. Meanings in [[Combat Planner Rules & Glossary]] §6.

## 6. Relationships & integrity rules

- A Combatant belongs to exactly one Combat. Deleting a Combat deletes its Combatants.
- `activeCombatantId` must reference an existing Combatant or be "none".
  - Removing the active Combatant → move to the next in sorted order; if it was last, move to the new last; never increment the round.
  - Removing the last/only Combatant → active = "none"; if the combat was `active`, it reverts to `setup`.
- `state` transitions: `setup → active` only via Start; `active → setup` via Clear, Restart, or removing all combatants.
- `escalation` reset to 0 on Clear and Restart.
- Duplicating a Combatant creates a new id, appends to the list (new `addOrder`), applies the reset/copy rules (Rules §8), **starts with an empty hpLog** (its HP resets to max, so prior history is meaningless), and is blocked if it would exceed 30.

## 7. Key operations (state transitions)

| Operation | Effect |
|-----------|--------|
| firstLaunch | if `!firstLaunchDone`: auto-create one empty Combat (`setup`), open it, set flag |
| launch (subsequent) | open Combats home |
| createCombat | new Combat at top of list, `state=setup`, round 1 (hidden), no active turn; blocked if 100 combats exist |
| addCombatant | currentHp = maxHp; tempHp 0; initiative "-"; no conditions; **empty hpLog**; appended; blocked if 30 exist |
| editCombatant | update fields (incl. optional manual initiative); a **maxHp change** does not touch currentHp but is recorded as **its own discrete undoable step** (separate undo entry from the other field changes in the same save) and **appends a "Set Max HP" hpLog entry** (§9); re-sort if a tie/initiative changes |
| rollOne(c) | initiative = d20 + bonus; re-sort (tap on init cell) |
| setInitiative(c, v) | manual value (−9..99); re-sorts only while `active` (long-press / edit form) |
| **start** | roll all unrolled; re-sort; `state=active`; round=1; activeCombatantId = top (no confirmation). Undoable: **pushes a pre-Start snapshot** to the undo history (§8) — which combatants were unrolled (`"-"`), prior `state`, `round`, and `activeCombatantId` — so Undo restores Setup exactly. Also reversible by Restart |
| dealDamage(n) | drain tempHp by n; remainder subtracted from currentHp; clamp at −maxHp; **appends a "Damage" hpLog entry** (§9) |
| restoreHp(n) | currentHp = min(currentHp + n, max(maxHp, currentHp)); **appends a "Heal" hpLog entry** (§9) |
| setTempHp(n) | tempHp = n (replace; 0 clears); **appends a "Set temp HP" hpLog entry** (§9) |
| addCondition / removeCondition | toggle membership; no auto-expiry |
| advanceTurn | next in sorted order; wrap → round+1 **and** escalation+1 (clamped 0–6); a plain advance within the round touches neither escalation nor round; **only the round-99 wrap is blocked** (advancing within round 99 still works) |
| editRound(v) | set round (1–99); never touches escalation |
| setEscalation(v) | set `escalation` directly (clamped 0–6); future round-wraps continue +1 from this value |
| **restart** | keep roster; per combatant: initiative "-", currentHp=maxHp, tempHp 0, conditions cleared, **hpLog emptied**; round→1; escalation→0; `state=setup`; active "none"; **confirm**; pushes a roster snapshot to undo history (undoable) |
| clearCombat | remove all combatants (**and their hpLogs**); round→1; active "none"; escalation→0; `state=setup`; **confirm**; pushes a roster snapshot to undo history (undoable) |
| undo / redo | pop the per-combat history stack to reverse / re-apply the last action (§8); each disabled at its end. Undoing/redoing an HP action (damage/heal/set-temp/Set Max HP) also **removes / re-adds its hpLog entry** (§9) so the log mirrors current state |
| deleteCombat | remove Combat (and its history); **confirm**, not undoable |
| reorderCombats | update listOrder from drag |
| resetAll | clear all Combats; keep Settings language/theme; set `firstLaunchDone=false` so firstLaunch re-runs (one empty Combat, opened); **confirm** |

## 8. Undo model (per-combat history stack)

Each Combat owns a bounded **undo history** — a stack of the **last 10 reversible actions** — plus a matching **redo** stack. Two header controls, **Undo (↶)** and **Redo (↷)**, walk the history; each is disabled at its end of the stack.

- **Scope — on the stack:** HP change (damage / heal / set temp), **Max HP edit** (a discrete step, separate from other field edits in the same save — see editCombatant in §7), add / remove / duplicate combatant, condition add/remove, initiative roll/set, other combatant field edit (name/type/bonus/AC/PD/MD/note), **Start**, **Advance turn**, round edit, escalation set, **Clear combat**, and **Restart**. Each entry stores what's needed to reverse the step: a **prior value** for simple edits; a **roster snapshot** for Clear/Restart; a **pre-Start snapshot** (unset initiatives + prior `state`/`round`/`activeCombatantId`) for Start; and the prior turn pointer + round + escalation for **Advance** (so an undo steps the turn — and any round/escalation wrap — back).
- **Off the stack (confirm-gated, not undoable):** **Delete-combat** and **Reset-all** — they live outside a single combat (Combats list / Settings), so the per-combat Undo can't reach them.
- **HP-change reversal** (Damage / Heal / Set temp HP / **Set Max HP**) restores prior currentHp, tempHp, and (for a Max HP edit) maxHp; restored currentHp is **clamped to the current maxHp** (in case maxHp changed since). It also **pops the matching hpLog entry** (§9) — Redo re-adds it — so the read-only HP log always mirrors the combatant's real current state. Because a Max HP edit is its own undo step, undoing it pops exactly its "Set Max HP" log entry and leaves the rest of that save's field changes to their own undo entry.

> **Two separate histories — do not conflate.** This **Undo/Redo stack** is *action recovery*: a Combat-level, 10-deep, two-way control to take back the last action. The **hpLog** (§9) is a *read-only per-combatant change log* the DM views to see how one combatant's HP evolved. Different scope (one combat vs one combatant), different storage, different purpose. They only touch here: undoing an HP action keeps the log truthful by removing that event.
- **Advance** is undoable here (steps the turn — and a round/escalation wrap — back), so there is no separate "previous turn" control.
- **Clear / Restart** still fire a **confirmation dialog** (cheap insurance against an accidental roster wipe) **and** are undoable as a safety net.
- **Lifetime:** the stack is **per-combat**, **persisted** (survives reload/update), and discarded when the Combat is deleted. Performing a new action clears the redo stack. The stack is bounded to 10 — the oldest entry is dropped past the cap.

## 9. HP change log (per-combatant history)

Each Combatant owns an **`hpLog`** — an ordered, **read-only** record of its HP-changing events, so the DM can review how that one combatant's HP evolved during the fight. It is **viewed only**, never edited directly. (This is **not** the Combat-level Undo/Redo stack of §8 — see the call-out there. The undo stack recovers actions across the whole combat; the hpLog is a passive per-combatant change log.)

**HpLogEntry shape (stored):**

| Field | Meaning |
|-------|---------|
| type | the event, by natural name: **Damage**, **Heal**, **Set temp HP**, or **Set Max HP** |
| delta | the signed change applied (e.g. `−12` damage, `+5` heal; for Set temp HP the change to the buffer; for Set Max HP the change to maxHp) |
| currentHp | resulting current HP after the event |
| tempHp | resulting temp HP after the event |
| maxHp | resulting Max HP after the event (so a Set-Max-HP entry reads naturally and the cur/max denominator is always shown correctly) |
| round | the live **round number** when it happened, or **"—"** if it occurred while the combat was in Setup |

- **Scope — logged events:** the three numpad HP actions (**Damage / Heal / Set temp HP**) **and** **Max HP edits** made via the edit form. **Not logged:** condition changes, initiative, or any other field edit (name/AC/PD/MD/note) — this is an HP log, not a general activity feed.
- **Order:** chronological (append-only during play); the view shows newest first.
- **Bounding:** **unbounded within a fight** — every qualifying event is kept; growth is bounded only by fight length and is reset between fights (below).
- **Lifetime (per-combatant, per-fight):**
  - **addCombatant** and **duplicate** → start with an **empty** log.
  - **Restart** → every combatant's log is **emptied** (HP resets to max, so old history would be inconsistent).
  - **Clear combat** / **remove combatant** → the log goes away with the combatant.
- **Interaction with Undo (§8):** undoing an HP action **removes** its hpLog entry; Redo **re-adds** it. The log therefore always reflects the combatant's actual current HP — no phantom events.
- **Derivation:** entries are stored, not derived; the running cur/max/temp are captured at write time (not recomputed) so the log is a faithful point-in-time record.

## 10. Persistence & portability

- **Persistence:** all `AppData` (incl. combat `state`, round, escalation, active pointer, and each combatant's `hpLog`) saved locally; survives reload and app update; an interrupted write must not corrupt existing combats.
- **Schema versioning:** `dataVersion` is bumped on any shape-incompatible change (ADR-013). **v2** (first-touch rework round) renamed combatant `type: 'monster'` → `'enemy'` and replaced the `escalationOverride: number | "none"` sentinel with a plain stored `escalation: number`; both are handled by a forward migration so existing local data upgrades transparently.
- **Export all** → portable file of the full `AppData` (combats + settings + data version). Includes each combatant's `hpLog` (a full backup keeps play history).
- **Export single combat** → portable file of one Combat (shareable). The combatant **`hpLog` IS included** (the change history travels with the shared fight). The Combat-level **undo/redo history is still NOT exported** (a fresh copy starts with an empty stack); likewise on any import. *(Deliberate split: hpLog = shareable play-history; undo stack = throwaway action-recovery.)*
- **Import all** → **merge**: imported combats added via the import-as-new-copy rule; local Settings (language/theme) are **not** overwritten. Blocked if it would exceed the 100-combat cap.
- **Import single combat** → **always import as a new copy** (new ids, suffixed title); never overwrites.
- **Import errors — fail safe, never partial:**
  - corrupt/unreadable file → blocking error, nothing imported;
  - file from a newer data version → refuse with "update the app";
  - would exceed the 100-combat cap → refuse with a message.
  Existing data is never touched on a failed import.
- **Reset all** → clears Combats, **keeps** language/theme, re-runs first-launch (one empty combat). Confirmation required.
