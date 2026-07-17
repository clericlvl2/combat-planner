# Reference: Condition glossary & color-tag palette

## Core terms

- **Combat / encounter** — one fight. Has a lifecycle, a combatant roster, a round counter, an
  escalation die, and an active-turn pointer.
- **Combatant** — a participant (PC, enemy, or ally). Same fields for all; type only changes
  color.
- **PC** — a player character; the DM tracks its turn/HP here, the player has the sheet.
- **Ally** — a friendly NPC the DM runs at the table (DM-owned, no player sheet). Same fields and
  behavior as any combatant; a third color label only.
- **Round** — one full cycle through all combatants.
- **Turn** — a single combatant acting; exists only while the combat is Active.
- **AC / PD / MD** — Armor Class, Physical Defense, Mental Defense: the three defense stats
  tracked per combatant.
- **Escalation die** — the shared die that climbs as the fight goes on, added to PC attacks.
- **Initiative** — the per-combatant turn-order value, rolled or set manually and lockable.
- **Temp HP** — a damage buffer absorbed before current HP; tracked separately from max HP.

## The 12 conditions

Pure visual labels in the app — no stat changes, no turn effects, no auto-expiry. Meaning is
the DM's to apply; summarized here as domain reference only.

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

Icon mapping (Lucide glyph per condition): charmed `heart`, confused `shuffle`, dazed `star`,
fear `ghost`, helpless `bed`, hindered `link`, shocked `zap`, stuck `anchor`, stunned `tornado`,
vulnerable `shield-off`, weakened `trending-down`, staggered `activity`. Glyph choices are
non-blocking and may be tuned for recognizability during UI build (`specs/adr/ADR-011.md`).

## Combat color-tag palette (8 swatches)

Used for a combat's `colorTag`. Each swatch is a CSS theme variable with a light and dark value
(`specs/adr/ADR-012.md`); `colorTag` stores the swatch key, not a hex, so re-theming never
touches stored data. Separate from the three locked combatant-type colors (PC green, enemy red,
ally blue — `specs/adr/ADR-008.md`), which live on combatant rows, not combat rows.

| Key | Swatch |
|-----|--------|
| neutral | Slate (default) |
| red | Red |
| orange | Orange |
| amber | Amber |
| green | Emerald |
| teal | Teal |
| blue | Sky |
| violet | Violet |
