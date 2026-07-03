---
categories:
  - "[[Prompts]]"
aliases:
  - Initiative tracker
---


> **Archived — superseded by `specs/`.** Frozen for historical provenance; do not edit. Current
> source of truth: `specs/capabilities/`, `specs/reference/`, and `docs/adr/`. See
> `specs/README.md` for the process and `specs/reference/migration-traceability.md` for exactly
> where each fact in this document moved.

Here is prompt / requirements / claude md content for my initiative tracker app

---

## What This App Is

A combat planner for tabletop RPGs (d20 systems). Used by a Dungeon Master at the table to manage turn order, hit points, and conditions during combat encounters.

### App overview

- Combats list page
	- Create combat
	- Delete combat
- Combat page
	- Add combatant
	- Remove combatant
- Combatant card
	- Update hp
	- Update condition

### App basic requirements

- Multi language: English, German, Spanish, French, Japan, Russian
- Mobile-first
- Installable as a PWA
- Works offline

## User Stories

### App

- As a DM I can use Combat Planner app on mobile, tablet and desktop using web browser
- As a DM I am sure that my Combat Planner app data persists across page reloads
- As a DM I can use Combat Planner app offline
- As a DM I can use Combat Planner app as PWA
- [Mobile] As a DM I can swipe to the right to see sidebar
- [Tablet] As a DM I can see header with burger menu
- [Desktop] As a DM I can see header with navigation
- As a DM I can see navigations links to different pages of the app in sidebar for [Mobile] or header for [Desktop]
- [Mobile] As a DM I see floating control buttons in bottom right

### Combats list (main page)

- As a DM I can see combats as a vertical list, where each row has following
	- Title
	- Description
	- Color tag
- As a DM I can create new combat with following parameters
	- Title
	- Description
	- Color tag
- As a DM I can edit combat parameters such as
	- Title
	- Description
	- Color tag
- As a DM I can remove existing combat
- As a DM I can enter the combat on touch
- As a DM on entering app first time first combat created automatically and I see combat page

### Combat page

#### Combatants

- As a DM I can see a vertical list of combatants, where each row has following (see [[#Combatant fields min max]])
	- Name
	- Initiative. For new combatants equals "-" sign
	- Current HP. For new combatants equals to Max HP
	- Max HP
	- Health bar
	- AC
	- PD
	- MD
	- Text note (if any)
	- Text note button (if no text note)
	- Condition button
	- Duplicate button
	- Remove button
- As a DM, I can add a combatant with a following parameters (see [[#Add combatant form settings]] and [[#Combatant fields min max]])
	- Name.
	- Initiative bonus
	- Max HP (Hit Points)
	- AC (Armor Class)
	- PD (Physical Defence)
	- MD (Mental Defence)
	- Text note
- As a DM, I can change combatant current HP (heal or damage) in following manner
	- Example 1. Target takes 17 damage. I touch HP on that target row, I press 1 and 7 on a numpad-like panel and then press red button Deal Damage
	- Example 2. Target is healed by 5 hp. I touch HP on that target row, I press 5 and then press green button Restore HP
- As a DM I can set current HP below 0.
- As a DM I can see a visual HP bar reflecting health state [[#Health Status (by current HP %)]]
- As a DM, I can apply conditions to a combatant using preset list (see [[#Conditions]])
	- Each condition is unique per combatant
	- A combatant can have up to all 12 conditions at once.
- As a DM, I can remove conditions on a combatant. Conditions never auto-expire; removal is always manual.
- As a DM, I can add, edit or remove text note on a combatant. Notes are edited inline on the combatant card.
- As a DM, I can remove a combatant. If the removed combatant is the active turn, turn advances to the next combatant automatically.
- As a DM, I can duplicate a combatant. Naming follows Windows-style suffix — "Goblin", "Goblin 1", "Goblin 2", etc. Duplicate state: initiative reset to "-", HP reset to max, conditions cleared, note copied. Placed at the bottom of the list.

#### Combatants initiative and turns

- As a DM, I can manually set a combatant's initiative individually by tapping the card initiative button with "-" value
- As a DM, I can roll initiative for all unrolled combatants at once. Formula: d20 + initiative bonus. List re-sorts immediately after rolling.
- As a DM, I can see all combatants sorted by initiative from highest to lowest. Tiebreaker: higher initiative bonus wins; if still tied, original add order. Combatants with no initiative ("-") always appear at the bottom in original add order.
- As a DM, I can clear the entire combat to start fresh. Requires a confirmation prompt.
- As a DM, I can see current combat round counter (1, 2, 3, 4, ...). Counter is hidden until at least one combatant is added, then always shows starting at Round 1.
- As a DM, I can edit combat round counter manually by tapping
- As a DM, I can see which combatant's turn at the moment
- As a DM, I can move turn to next combatant
- As a DM, when it's last combatant turn and I advance to the next turn, the turn goes to first combatant and round counter increments (1 -> 2, 2 -> 3, ...)

## Constraints

### Add combatant form settings

- Name.
	- Type: text
	- Required
	- Placeholder: "Namius Name"
- Initiative bonus
	- Type: number
	- Not Required
	- Placeholder: 0
	- Default: 0
- Max HP (Hit Points)
	- Type: number
	- Required
	- Placeholder 10
- AC (Armor Class)
	- Type: number
	- Required
	- Placeholder 10
- PD (Physical Defence)
	- Type: number
	- Required
	- Placeholder 10
- MD (Mental Defence)
	- Type: number
	- Required
	- Placeholder 10
- Text note
	- Type: text
	- Not Required
	- Placeholder: "Useful notes..."
	- Default: ""

### Combatant fields min max

- Notes length: up to 250 characters
- Initiative bonus: from -99 to 99
- Initiative value (manual): from -99 to 999
- AC limits: from 0 to 99
- MD limits: from 0 to 99
- PD limits: from 0 to 99
- HP limits: -999 to 999
- Combat round counter limits: from 1 to 99

## Other params

### Health Status (by current HP %)

- full — 100%
- wounded — 50–99%
- bloodied — 1–49%
- dead — 0 or below (visual label only; combatant stays in turn order)

### Conditions

- charmed
- confused
- dazed
- fear
- helpless
- hindered
- shocked
- stuck
- stunned
- vulnerable
- weakened
- staggered
