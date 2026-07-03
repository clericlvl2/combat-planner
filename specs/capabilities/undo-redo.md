---
id: undo-redo
prefix: UND
---

# Undo / Redo — per-combat action history

A **global, per-combat** 10-deep history, exposed as header **Undo ↶ / Redo ↷** controls — not
per-action toasts.

## UND-1 — Scope: what's on the stack

Reversible via the header controls: HP change (damage / heal / set temp — [[hp]] HP-3), a Max HP
edit as its own discrete step ([[hp]] HP-5), add / remove / duplicate combatant
([[combatants]]), condition add/remove ([[conditions]]), initiative roll/set ([[initiative]]),
any other combatant field edit (name / type / bonus / AC / PD / MD / note), Start
([[lifecycle]] LIF-3), Advance turn ([[turns-rounds-escalation]] TRE-2), round edit, escalation
set ([[turns-rounds-escalation]] TRE-5/TRE-6), Clear combat ([[lifecycle]] LIF-5), and Restart
([[lifecycle]] LIF-6).

**AC:**
- Every action in the list above pushes exactly one entry to the undo stack when performed.

## UND-2 — Off the stack (confirm-only, never undoable)

**Delete-combat** and **Reset-all** live outside a single combat's scope (Combats list /
Settings) — the per-combat Undo can never reach them. They are confirm-gated only.

**AC:**
- Deleting a combat or performing Reset-all is never reversible via Undo, from any state.

## UND-3 — Snapshot-based reversal

Clear, Restart, and Start each push a full **snapshot** rather than a diff: a roster snapshot
for Clear/Restart; a **pre-Start snapshot** (which combatants were unrolled, prior `state`,
`round`, `activeCombatantId`) for Start. Undoing restores the snapshot exactly.

**AC:**
- Undoing a Clear or Restart restores the exact combatant roster as it was immediately before.
- Undoing a Start restores Setup exactly: unrolled combatants return to `"-"`, `state` reverts,
  and the round/escalation/active-pointer revert to their pre-Start values.

## UND-4 — Simple-edit reversal

A simple field edit's undo entry stores the prior value and restores it directly. A Max HP edit
is its own discrete entry, separate from any other field changes saved in the same form submit
([[hp]] HP-5) — undoing it pops exactly the Max HP change and leaves sibling field changes to
their own entry.

**AC:**
- Undoing a non-HP field edit (name/type/bonus/AC/PD/MD/note) restores exactly the prior value
  of that field, leaving other fields untouched.
- Undoing a Max HP edit restores the prior Max HP only, independent of any other field edited in
  the same save.

## UND-5 — Advance reversal

Undoing an Advance steps the turn back to the previous combatant, and if that Advance had
wrapped into a new round, unwinds the round increment and escalation increment together. There
is no separate "previous turn" control — Advance's undo entry is sufficient.

**AC:**
- Undoing a plain (non-wrap) Advance restores the previous active combatant only.
- Undoing a wrap Advance restores the previous active combatant, decrements `round` by 1, and
  decrements escalation by 1.

## UND-6 — Stack mechanics

Bounded to the **last 10** reversible actions; the oldest entry is dropped past the cap. A new
action clears the redo stack. Each of Undo/Redo is disabled at its respective end of the stack.
The stack is **per-combat**, persisted (survives reload/update), and discarded when the combat
is deleted. It is **not** included in export (see [[import-export]] IMP-3, [[hp-log]] LOG-5 for
the contrasting hpLog behavior).

**AC:**
- Performing an 11th reversible action drops the oldest entry from the stack.
- Performing any new action after an Undo clears the redo stack.
- Undo is disabled when the stack is empty; Redo is disabled when there is nothing to redo.
- Deleting a combat discards its undo/redo stack; exporting a combat never includes it.

## UND-7 — HP-change reversal detail

Reversing an HP change (Damage / Heal / Set temp HP / Set Max HP) restores prior `currentHp`,
`tempHp`, and (for a Max HP edit) `maxHp`; the restored `currentHp` is clamped to the *current*
`maxHp` in case it changed since. It also pops the matching HP-log entry (Redo re-adds it) — see
[[hp-log]] LOG-4.

**AC:**
- Undoing an HP change clamps the restored `currentHp` to the combatant's current `maxHp`, even
  if `maxHp` has since changed.
