---
id: combatants
prefix: CBT
---

# Combatants — fields, add/edit/duplicate/remove, caps

Sources: `PRD` §4 (decisions 5, 15, 17 cap clause, 22), §6 Epic D (D1, D2, D3, D9, D10, D11) ·
`Rules & Glossary` §1 (Core terms), §7 (add-combatant form, hard caps), §8 (Duplicate behavior) ·
`Data Model` §4 (Combatant entity), §6 (relationships/integrity), §7 (`addCombatant`,
`editCombatant`, duplicate) · `UX & IA` §4c (compact/expanded row) · `Test Plan` §3.8, §6 (D1–D3,
D9–D11 rows).

Field ranges/defaults for the add/edit form: [[../reference/limits]]. Card layout/placement
(compact vs. expanded, cell order): [[../reference/component-inventory]].

## CBT-1 — Combatant type (visual flag only)

Three-value flag — **PC / enemy / ally** — color only. All three share the same fields and
behavior; the type never changes ordering or mechanics. `ally` = a DM-run friendly NPC (no
player sheet, DM tracks its HP). Optional on the add form; default `enemy`.

**AC:**
- Changing a combatant's type never changes its fields, sort position, or any computed value —
  only its display color/stripe.
- A combatant added without specifying type defaults to `enemy`.

## CBT-2 — Combatant card fields

Compact row shows: active-turn indicator, type color stripe(s), a persistent `⋮` menu
(Edit/Duplicate/Remove), name, initiative (`"-"` if unset), current/max HP, health bar, AC/PD/MD
(in-row at all sizes), and condition icons (first few + overflow, [[conditions]] CND-3). The
card background reflects HP status ([[hp]] HP-4). Tapping the row expands it to reveal temp HP,
the note, and the condition picker.

**AC:**
- All fields listed above are visible on the compact row without expanding.
- Temp HP and the note are visible only after expanding the row.

## CBT-3 — Add combatant

Add form fields: Name (required, trimmed; whitespace-only blocks submit), Type (optional,
default enemy), Initiative bonus, Max HP, AC, PD, MD, Text note. Field defaults/placeholders/
ranges: [[../reference/limits]]. Adding is blocked at the 30-combatant cap
([[../reference/limits]]).

**AC:**
- Submitting the add form with an empty or whitespace-only name is rejected.
- A newly added combatant has `currentHp = maxHp`, `tempHp = 0`, `initiative = "-"`, and no
  conditions.
- Adding a 31st combatant to a combat is blocked with a message; nothing is added.

## CBT-4 — Edit combatant

The same form, pre-filled, edits an existing combatant's name/type/init-bonus/Max HP/AC/PD/MD/
note, plus a manual-initiative field ([[initiative]] INI-2/INI-3). Changing Max HP does not
auto-change current HP — full nuance (discrete undo step, HP-log entry) owned by [[hp]] HP-5.

**AC:**
- Every field on the add form is also editable via the edit form on an existing combatant.
- Saving an edit that changes Max HP leaves `currentHp` numerically unchanged.

## CBT-5 — Note

A free-text note, inline-editable, capped at 250 characters during input (see
[[../reference/limits]]). Empty by default.

**AC:**
- The note field rejects/truncates input beyond 250 characters as it's typed.
- The note can be added, edited, or cleared at any time without affecting other fields.

## CBT-6 — Remove combatant

Removing a combatant is undoable via the combat's Undo history ([[undo-redo]] UND-1). If the
removed combatant is the active turn, the turn advances automatically to the next combatant
(full mechanics: [[turns-rounds-escalation]] TRE-4). Removing the last combatant reverts the
combat to Setup ([[lifecycle]] LIF-7).

**AC:**
- Removing any combatant pushes one entry to the undo stack; Undo restores it exactly (identity,
  fields, conditions, HP log).

## CBT-7 — Duplicate combatant

Naming uses Windows-style suffixing: "Goblin" → "Goblin 1" → "Goblin 2" …, skipping suffixes
already taken to avoid collisions. The duplicate resets initiative to `"-"`, current HP to Max
HP, temp HP to 0, clears conditions, starts with an **empty** HP change log ([[hp-log]] LOG-3),
and copies all stats (type, bonus, Max HP, AC/PD/MD) and the note. Placed at the bottom of the
list; blocked if it would exceed the 30-combatant cap.

**AC:**
- Duplicating "Goblin" when "Goblin" and "Goblin 1" exist produces "Goblin 2" (skips taken
  suffixes).
- The duplicate has `initiative = "-"`, `currentHp = maxHp`, `tempHp = 0`, no conditions, an
  empty HP log, and the same type/bonus/Max HP/AC/PD/MD/note as the source.
- The duplicate is appended at the bottom of the list; duplicating at the 30-cap is blocked.

## CBT-8 — Ownership integrity

A combatant belongs to exactly one combat. Deleting a combat deletes all its combatants (and
their HP logs).

**AC:**
- No combatant record outlives its owning combat.
