---
id: hp-log
prefix: LOG
---

# HP change log — per-combatant read-only history

Sources: `PRD` §4 (decision 23), §6 Epic D (D12) · `Rules & Glossary` §4 (HP change log
subsection) · `Data Model` §9 (full model), §7 (append points), §8 (undo interaction), §10
(persistence/export) · `UX & IA` §4c (HP change log paragraph), §8 · `Test Plan` §3.7, §6 (D12
row).

Distinct from the combat-level Undo/Redo ([[undo-redo]]): this is a **read-only**, per-combatant
record the DM reviews, never edits or reverses directly.

## LOG-1 — What's logged & entry shape

Logs exactly three HP numpad actions (Damage, Heal, Set temp HP — [[hp]] HP-3) plus Max HP edits
from the combatant edit form ([[hp]] HP-5). Nothing else — not conditions, initiative, or any
other field edit. Each entry stores: `type` (Damage / Heal / Set temp HP / Set Max HP), `delta`
(the signed change applied), resulting `currentHp`, `tempHp`, `maxHp`, and the `round` it
happened on (`"—"` if it occurred in Setup). Entries are stored at write time, not recomputed
later.

**AC:**
- A condition change, initiative change, or edit to name/AC/PD/MD/note never appends a log entry.
- Each of Damage / Heal / Set temp HP / Set Max HP appends exactly one entry with the fields
  above, captured at the moment of the event.
- An entry created while the combat is in Setup shows `"—"` for round.

## LOG-2 — Ordering & display

Entries are appended in chronological order during play; the log is viewed newest-first from a
**History** section/toggle inside the HP numpad sheet ([[hp]] HP-6) — it does not appear on the
compact combatant row. Before any HP change, it shows a quiet "No HP changes yet".

**AC:**
- The History view lists entries newest-first.
- An empty log shows the "No HP changes yet" placeholder instead of an empty list.
- The log is not rendered anywhere on the compact row.

## LOG-3 — Lifetime

Unbounded within a fight — every qualifying event is kept. `addCombatant` and duplicate start
with an empty log. Restart ([[lifecycle]] LIF-6) empties every combatant's log. Clear combat
([[lifecycle]] LIF-5) or removing a combatant discards the log with the combatant.

**AC:**
- A newly added or duplicated combatant has an empty log.
- Restart empties every remaining combatant's log without removing the combatants.
- Removing a combatant (or clearing the whole combat) discards its log permanently.

## LOG-4 — Undo/redo interaction

Undoing an HP action (Damage / Heal / Set temp HP / Set Max HP) via the header Undo removes that
event's log entry; Redo re-adds it. This keeps the log truthful — it always mirrors the
combatant's real current HP, with no phantom events.

**AC:**
- Undoing a logged HP action removes exactly the matching log entry (the most recent one from
  that action).
- Redoing that action re-adds the same entry.

## LOG-5 — Persistence & portability

The log is persisted locally and **travels with export/import** of a combat — both "export all"
and "export single combat" — unlike the combat-level undo/redo stack, which is always stripped
on export and starts empty on import (see [[undo-redo]] UND-6, [[import-export]] IMP-3).

**AC:**
- Exporting a single combat or all combats includes every combatant's HP log.
- Importing a combat (single or all) restores the HP log as exported; the undo/redo stack is
  never included either way.
