---
id: initiative
prefix: INI
---

# Initiative — roll, manual entry, lock, sort, tiebreak

## INI-1 — Initiative value & bonus

Initiative value is a number or unset (`"-"`). Initiative bonus defaults to 0 and is added to a
`d20` roll. Ranges: see [[../reference/limits]] (initiative bonus, initiative value).

**AC:**
- A newly added combatant has `initiative = "-"` and `initiativeBonus = 0` unless set otherwise
  on the add form.

## INI-2 — Roll vs. manual entry (the init cell)

**Tap** the init cell rolls `d20 + bonus` for that one combatant (re-tap re-rolls). **Long-press**
opens manual numeric entry (also reachable from the combatant edit form as a discoverability
backup). Manual range: see [[../reference/limits]].

The init cell's hover affordance is scoped to the inner control only — no oversized surrounding
hover box. The cell has a **fixed width** so 1-digit and 2-digit values render the same width, a
**pointer cursor**, and **no `min-height`**.

**AC:**
- Tapping an init cell rolls and displays a new `d20 + bonus` value; tapping again re-rolls.
- Long-pressing an init cell opens a numeric entry field pre-filled with the current value;
  committing sets it directly.
- The manual-entry field is also present on the combatant edit form.
- The init cell's hover highlight is confined to the inner control; the cell has a fixed width
  (1- and 2-digit values render identically wide), a pointer cursor, and no `min-height`.

## INI-3 — Active-only lock

Once `state == active`, the init cell is disabled — no tap-roll, no long-press; turn order is
locked in for the fight. The only way to change an Active combatant's initiative is the
manual-initiative field on the edit form. The same manual-initiative field is always present on
the add form too, regardless of whether the combat is Setup or Active — amended: it used to be
gated to add-while-Active only, so the DM could hand-enter a value for a latecomer; it now also
appears when adding during Setup. Left blank, it joins unrolled at the bottom (see [[lifecycle]]
LIF-4).

**AC:**
- While Active, tapping or long-pressing the init cell has no effect.
- While Active, the edit form's manual-initiative field is the only control that changes a
  combatant's initiative.
- The add form's manual-initiative field is present regardless of combat state (Setup or
  Active).

## INI-4 — Sort order & tiebreak

Sort key: initiative high → low. Tiebreak: (1) higher initiative bonus wins, (2) original add
order. Combatants with `"-"` always sit at the bottom, in add order. **While Setup**, the list
does not auto-sort (see [[lifecycle]] LIF-2) — an initiative/bonus edit only updates the
displayed value. **Once Active**, the list re-sorts live on any initiative or bonus change; a
bonus edit re-sorts only when it changes a tie.

**AC:**
- `sortedCombatants` orders by initiative descending; ties break by higher `initiativeBonus`,
  then by `addOrder`; unset (`"-"`) combatants sort last, in `addOrder`.
- While Active, an initiative change re-sorts the list immediately.
- While Active, a bonus edit that does not change a tie leaves the displayed order unchanged.

## INI-5 — Start auto-rolls the rest

Start ([[lifecycle]] LIF-3) rolls `d20 + bonus` for every combatant still at `"-"`;
already-rolled values are untouched. This requirement exists for cross-reference only — the
transition itself is owned by LIF-3.
