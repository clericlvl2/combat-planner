---
id: combatants
prefix: CBT
---

# Combatants — fields, add/edit/duplicate/remove, caps

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

Compact row shows: active-turn indicator, type color stripe, name, initiative (`"-"` if unset),
current/max HP, health bar, a temp-HP badge (shown whenever `tempHp > 0`, no expand needed),
AC/PD/MD (in-row at all sizes), condition icons (first few + overflow, [[conditions]] CND-3),
and the note (read-only) whenever one is set. The health bar's fill color is the sole HP-status
visual signal — the card background no longer tints by `healthStatus` ([[hp]] HP-4). Tapping the
row expands it to reveal an editable note field and the condition picker.

The trailing controls cluster holds the expand/collapse chevron immediately next to the
persistent `⋮` menu (Edit/Duplicate/Remove) — not beside the name/title — and the two render at
the same size. The card container carries no internal gap rule between its rows. On mobile, the
card's `⋮` overflow trigger is a ≥44px touch target.

**AC:**
- All fields listed above are visible on the compact row without expanding.
- The note renders read-only under the card in both the collapsed and expanded state whenever
  one is set.
- The condition picker is visible only after expanding the row.
- The temp-HP badge is visible on the compact row without expanding whenever `tempHp > 0`.
- The expand/collapse chevron sits in the trailing controls cluster next to the `⋮` menu, and
  the two render at the same size.
- On mobile, the card's `⋮` overflow trigger is a ≥44px touch target.

## CBT-3 — Add combatant

Add form fields: Name (**optional**, trimmed), Type (optional, default enemy), Initiative bonus,
Max HP, AC, PD, MD, Text note. Field defaults/placeholders/ranges: [[../reference/limits]].
Adding is blocked at the 30-combatant cap ([[../reference/limits]]). The form's submit button
reads "Add" in add mode, distinguishing it from the "Save" label the same form shows in edit
mode ([[combatants]] CBT-4).

The Name field's placeholder is type-specific — "Hero Name" for PC, "Enemy" for Enemy, "Ally"
for Ally. If the name is left empty (or whitespace-only) on submit, that type placeholder
becomes the combatant's **real stored name** — an empty name is never rejected. Max HP,
Initiative bonus, AC, PD, and MD are pre-filled with real, editable default values (Max HP 10,
Init 0, AC/PD/MD 10) — not placeholder-styled hints; the DM can accept or overwrite them.

The modal is laid out as an inline label-left grid: every field (Name, Type, Max HP, Init, AC,
PD, MD, Note) is one row with an uppercase label in a fixed ~6rem left column and its control
filling the remaining width; numeric steppers span the full control width. There is no separate
multi-column AC/PD/MD grid and no distinct mobile-stacking rule — the same label-left grid
applies at every breakpoint. The Cancel button renders inside the dialog panel's footer.
Name/note placeholders resolve from paraglide i18n keys.

**AC:**
- Submitting the add form with an empty or whitespace-only name is **accepted**; the combatant's
  stored name becomes the type-specific placeholder ("Hero Name" for PC, "Enemy" for Enemy,
  "Ally" for Ally).
- A newly added combatant has `currentHp = maxHp`, `tempHp = 0`, `initiative = "-"`, and no
  conditions.
- Adding a 31st combatant to a combat is blocked with a message; nothing is added.
- The add form's submit button reads "Add"; the same form in edit mode reads "Save".
- On open with no data, Max HP/Init/AC/PD/MD read 10/0/10/10/10 as real editable values, not
  placeholder text.
- The modal renders as an inline label-left grid (uppercase label in a fixed ~6rem left column,
  control filling the rest; numeric steppers full-width) at every breakpoint — no multi-column
  AC/PD/MD grid.
- The Cancel button renders inside the dialog panel's footer, not outside the modal frame.
- The name/note/other free-text placeholders resolve from paraglide message keys, not hardcoded
  literals.

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
list; blocked if it would exceed the 30-combatant cap ([[../reference/limits]]).

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
