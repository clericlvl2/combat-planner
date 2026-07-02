---
id: conditions
prefix: CND
---

# Conditions — the 12 preset visual labels

Sources: `PRD` §4 (decision 8), §6 Epic D (D7, D8) · `Rules & Glossary` §6 (Conditions table) ·
`Data Model` §5 (Condition enumeration), §7 (`addCondition`/`removeCondition`) · `UX & IA` §4c ·
`Test Plan` §4 (component case), §6 (D7, D8 rows).

Condition meanings (the 12-row 13th Age reminder table) live in
[[../reference/glossary-conditions]] — this file owns only the app's behavior toward them, not
their in-fiction meaning.

## CND-1 — Fixed set, pure visual labels

Exactly 12 preset conditions (list: [[../reference/glossary-conditions]]). In the app they are
**pure visual labels** — no stat changes, no turn effects, no auto-expiry. The DM applies their
meaning manually; the app only tracks membership.

**AC:**
- No condition ever changes a combatant's HP, AC/PD/MD, initiative, or turn order automatically.
- No condition ever expires on its own — removal is always a manual DM action.

## CND-2 — Apply / remove

Each condition is unique per combatant (no stacking); a combatant may carry up to all 12 at
once. Toggling membership adds or removes it.

**AC:**
- Applying an already-applied condition to a combatant has no additional effect (still just
  "applied").
- A combatant can have anywhere from 0 to all 12 conditions simultaneously.
- Removing a condition is a direct, immediate, manual action.

## CND-3 — Display: compact overflow, expanded picker

On the compact combatant row, the first few condition icons show, plus a "+K" overflow chip for
the rest. On the expanded row, the full set is shown via a 12-preset toggle picker, and each
applied condition's chip gains a removable **×**.

**AC:**
- The compact row never shows more than a fixed number of condition icons before collapsing the
  remainder into a "+K" chip.
- Expanding a row reveals all of the combatant's conditions with a removable control on each.
- The condition picker in the expanded row exposes all 12 presets as togglable.
