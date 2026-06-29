---
categories:
  - "[[Prompts]]"
aliases:
  - Combat Planner i18n Message Catalog
  - Combat Planner Messages
  - Combat Planner Strings
  - Combat Planner Message Keys
related:
  - "[[Combat Planner Overview]]"
  - "[[Combat Planner PRD]]"
  - "[[Combat Planner Rules & Glossary]]"
  - "[[Combat Planner Data Model]]"
  - "[[Combat Planner UX & IA]]"
  - "[[Combat Planner Architecture]]"
  - "[[Combat Planner Component Inventory]]"
---

# Combat Planner — i18n Message Catalog (English source)

> The single owner of the **English source message catalog**: the message-key namespace tree, the English copy for every key, and the interpolation / ICU shape. English is the source language ([[Combat Planner Architecture]] ADR-005); translated locales are not kept here.

## 1. How to read this doc

- **This doc owns:** the key tree, the English source string for each key, and each key's interpolation / pluralization shape.
- **It points to, never restates:**
  - i18n mechanism, the 6 locales, source-then-translate workflow → [[Combat Planner Architecture]] ADR-005.
  - **where** each string appears + the a11y-label requirement → [[Combat Planner UX & IA]] §8 / §9.
  - term **meanings** (the 12 conditions, health statuses) → [[Combat Planner Rules & Glossary]] §6 / §4.
  - **numeric values** behind cap/clamp copy → [[Combat Planner Rules & Glossary]] §7 (injected as variables, never hardcoded here).
  - **which component** renders a string → [[Combat Planner Component Inventory]].
  - field **semantics** behind form labels → [[Combat Planner Data Model]] §7 / [[Combat Planner Rules & Glossary]] §7.
- **Key form:** dot-namespaced (`combats.empty.cta`). `{var}` = interpolation; `{n, plural, …}` = ICU plural. Variable names are stable across locales; only the surrounding copy translates.
- **No literal numbers in copy.** Cap/clamp strings carry `{min}` / `{max}` / `{max}` placeholders fed from [[Combat Planner Rules & Glossary]] §7 — change a limit there, the message follows.

## 2. Namespace tree

```
nav.*          top-level destinations
combats.*      Combats home — list, create/import, row menu, empty
combat.*       Combat header (both states) — back, round, escalation, undo/redo, ⋮
setup.*        Setup body — add, start, empty
active.*       Active body — advance, jump-to-turn
numpad.*       HP numpad sheet — commits, pad, summary, history
conditions.*   the 12 condition display labels + overflow chip
health.*       the 4 health-status labels (label backup for the bar)
forms.*        add/edit combatant + create/edit combat fields, types, swatches, actions
settings.*     Settings groups + controls + language/theme options
about.*        About page copy
dialogs.*      destructive-action confirm dialogs
toasts.*       SW update toast + install banner + import feedback
errors.*       validation / clamp / cap / import-failsafe messages
a11y.*         accessible labels for controls (UX §8)
```

## 3. nav.*

| Key | English |
|---|---|
| `nav.combats` | Combats |
| `nav.settings` | Settings |
| `nav.about` | About |

## 4. combats.* — home

Strings on the Combats list + create/import surface ([[Combat Planner UX & IA]] §3; components → [[Combat Planner Component Inventory]] §5).

| Key | English |
|---|---|
| `combats.title` | Combats |
| `combats.create` | Create combat |
| `combats.import` | Import combat |
| `combats.row.menu.edit` | Edit |
| `combats.row.menu.export` | Export / share |
| `combats.row.menu.delete` | Delete |
| `combats.empty.title` | No combats yet |
| `combats.empty.cta` | Create your first combat |

## 5. combat.* — header (both states)

Header chrome; round/escalation render Active-only ([[Combat Planner UX & IA]] §9; [[Combat Planner Component Inventory]] §6).

| Key | English | Shape |
|---|---|---|
| `combat.round` | Round {n} | `{n}` = round number |
| `combat.escalation` | Escalation die | label |
| `combat.escalation.auto` | Auto | reset-to-auto choice (Rules §3) |
| `combat.undo` | Undo | |
| `combat.redo` | Redo | |
| `combat.menu.add` | Add combatant | header `⋮` (Active) |
| `combat.menu.restart` | Restart | |
| `combat.menu.clear` | Clear combat | |

## 6. setup.* — Setup body

| Key | English |
|---|---|
| `setup.addCombatant` | Add combatant |
| `setup.start` | Start |
| `setup.empty.title` | No combatants yet |
| `setup.empty.cta` | Add your first combatant |

## 7. active.* — Active body

| Key | English |
|---|---|
| `active.advance` | Next turn |
| `active.jumpToTurn` | Jump to turn |

## 8. numpad.* — HP numpad sheet

Commit semantics → [[Combat Planner Rules & Glossary]] §4; the History list is read-only and distinct from Undo → [[Combat Planner Data Model]] §9. Components → [[Combat Planner Component Inventory]] §9.

| Key | English | Shape |
|---|---|---|
| `numpad.dealDamage` | Deal Damage | |
| `numpad.restoreHp` | Restore HP | |
| `numpad.setTempHp` | Set Temp HP | |
| `numpad.backspace` | Backspace | |
| `numpad.clear` | Clear | |
| `numpad.cancel` | Cancel | |
| `numpad.summary.hp` | {cur} / {max} HP | `{cur}`,`{max}` current/max HP |
| `numpad.summary.temp` | +{temp} temp HP | `{temp}` buffer; hidden when 0 |
| `numpad.history.title` | History | |
| `numpad.history.empty` | No HP changes yet | |
| `numpad.history.action.damage` | Damage | log action label; meaning → Rules §4 |
| `numpad.history.action.heal` | Heal | |
| `numpad.history.action.setTemp` | Set temp HP | |
| `numpad.history.action.setMax` | Set Max HP | |
| `numpad.history.round` | Round {n} | `{n}`; Setup entries show "—" (glyph, no string) |

## 9. conditions.* — the 12 labels + overflow

Display label is owned here; the **meaning** of each condition → [[Combat Planner Rules & Glossary]] §6. The compact-row first-few-plus-overflow behavior → [[Combat Planner UX & IA]] §4c.

| Key | English |
|---|---|
| `conditions.charmed` | Charmed |
| `conditions.confused` | Confused |
| `conditions.dazed` | Dazed |
| `conditions.fear` | Fear |
| `conditions.helpless` | Helpless |
| `conditions.hindered` | Hindered |
| `conditions.shocked` | Shocked |
| `conditions.stuck` | Stuck |
| `conditions.stunned` | Stunned |
| `conditions.vulnerable` | Vulnerable |
| `conditions.weakened` | Weakened |
| `conditions.staggered` | Staggered |
| `conditions.overflow` | +{n} | `{n}` = hidden-condition count (the "+K" chip) |

## 10. health.* — status labels

Label backup so health is never conveyed by color alone ([[Combat Planner UX & IA]] §8); the % **thresholds** and the reverse/alarm bar → [[Combat Planner Rules & Glossary]] §4.

| Key | English |
|---|---|
| `health.full` | Full |
| `health.wounded` | Wounded |
| `health.bloodied` | Bloodied |
| `health.dead` | Dead |

## 11. forms.* — combatant + combat forms

Fields, defaults, types, and the ranges behind them → [[Combat Planner Rules & Glossary]] §7; field semantics → [[Combat Planner Data Model]] §7. Components → [[Combat Planner Component Inventory]] §10. Placeholders below mirror the Rules §7 form table.

### Combatant form

| Key | English |
|---|---|
| `forms.combatant.add.title` | Add combatant |
| `forms.combatant.edit.title` | Edit combatant |
| `forms.field.name` | Name |
| `forms.field.name.placeholder` | Namius Name |
| `forms.field.type` | Type |
| `forms.type.pc` | PC |
| `forms.type.monster` | Monster |
| `forms.type.ally` | Ally |
| `forms.field.initBonus` | Initiative bonus |
| `forms.field.initValue` | Initiative |
| `forms.field.maxHp` | Max HP |
| `forms.field.ac` | AC |
| `forms.field.pd` | PD |
| `forms.field.md` | MD |
| `forms.field.tempHp` | Temp HP |
| `forms.field.note` | Note |
| `forms.field.note.placeholder` | Useful notes… |
| `forms.note.add` | Add note |

### Combat form

| Key | English |
|---|---|
| `forms.combat.create.title` | Create combat |
| `forms.combat.edit.title` | Edit combat |
| `forms.field.title` | Title |
| `forms.field.description` | Description |
| `forms.field.colorTag` | Color tag |

### Color-tag swatch labels

Display label owned here; the 8-swatch palette + keys → [[Combat Planner Architecture]] ADR-012.

| Key | English |
|---|---|
| `forms.colorTag.neutral` | Neutral |
| `forms.colorTag.red` | Red |
| `forms.colorTag.orange` | Orange |
| `forms.colorTag.amber` | Amber |
| `forms.colorTag.green` | Green |
| `forms.colorTag.teal` | Teal |
| `forms.colorTag.blue` | Blue |
| `forms.colorTag.violet` | Violet |

### Shared form actions

| Key | English |
|---|---|
| `forms.action.save` | Save |
| `forms.action.cancel` | Cancel |
| `forms.action.duplicate` | Duplicate |
| `forms.action.remove` | Remove |
| `forms.action.edit` | Edit |

## 12. settings.*

Groups + controls → [[Combat Planner UX & IA]] §9 (Settings); components → [[Combat Planner Component Inventory]] §11.

| Key | English |
|---|---|
| `settings.title` | Settings |
| `settings.group.appearance` | Appearance |
| `settings.group.data` | Data |
| `settings.group.about` | About |
| `settings.language` | Language |
| `settings.theme` | Theme |
| `settings.theme.system` | System |
| `settings.theme.dark` | Dark |
| `settings.theme.light` | Light |
| `settings.data.exportAll` | Export all |
| `settings.data.importAll` | Import all |
| `settings.data.resetAll` | Reset all |

**Language option labels** — endonyms; they stay identical across all locale files (a German user still sees "Français" for French). The 6 locales themselves → ADR-005.

| Key | English |
|---|---|
| `settings.language.en` | English |
| `settings.language.de` | Deutsch |
| `settings.language.es` | Español |
| `settings.language.fr` | Français |
| `settings.language.ja` | 日本語 |
| `settings.language.ru` | Русский |

## 13. about.*

First-draft English; full copy is reviewable per the ADR-005 translate-then-human-review workflow.

| Key | English | Shape |
|---|---|---|
| `about.title` | About |
| `about.appName` | Combat Planner |
| `about.description` | Combat Planner is an offline initiative tracker for 13th Age. Run one encounter at a time — turn order, hit points, the escalation die, and conditions — entirely on this device. |
| `about.privacy` | Your data never leaves this device. No accounts, no servers, no tracking. |
| `about.version` | Version {version} | `{version}` = build version string |

## 14. dialogs.* — destructive-action confirms

The confirm set (delete combat · clear · restart · reset-all) → [[Combat Planner UX & IA]] §8; rendered by `ConfirmDialog` → [[Combat Planner Component Inventory]] §3. Reversibility wording reflects the model in [[Combat Planner Data Model]] §8 (clear/restart undoable; delete/reset-all not).

| Key | English | Shape |
|---|---|---|
| `dialogs.cancel` | Cancel | shared |
| `dialogs.deleteCombat.title` | Delete this combat? | |
| `dialogs.deleteCombat.body` | This permanently deletes “{title}”. It can't be undone. | `{title}` |
| `dialogs.deleteCombat.confirm` | Delete | |
| `dialogs.clearCombat.title` | Clear all combatants? | |
| `dialogs.clearCombat.body` | This removes every combatant from this combat. You can undo it. | |
| `dialogs.clearCombat.confirm` | Clear | |
| `dialogs.restart.title` | Restart combat? | |
| `dialogs.restart.body` | Keeps the roster but resets initiative, HP, temp HP, conditions, and the round. You can undo it. | |
| `dialogs.restart.confirm` | Restart | |
| `dialogs.resetAll.title` | Reset everything? | |
| `dialogs.resetAll.body` | This permanently deletes all combats and settings on this device. It can't be undone. | |
| `dialogs.resetAll.confirm` | Reset all | |

## 15. toasts.* — update, install, import

Placement (update toast bottom-center, install banner top) → [[Combat Planner UX & IA]] §8; behavior → [[Combat Planner Architecture]] ADR-004; components → [[Combat Planner Component Inventory]] §3.

| Key | English | Shape |
|---|---|---|
| `toasts.update.message` | A new version is available. | |
| `toasts.update.action` | Reload | |
| `toasts.install.message` | Install Combat Planner for offline use. | |
| `toasts.install.action` | Install | |
| `toasts.install.dismiss` | Dismiss | |
| `toasts.import.success` | Imported “{title}”. | `{title}` (single-combat copy) |
| `toasts.importAll.success` | {n, plural, one {# combat} other {# combats}} imported. | ICU plural |

## 16. errors.* — validation, caps, import fail-safe

All numeric bounds are **injected from [[Combat Planner Rules & Glossary]] §7**, never written as literals here. Surfaces (inline clamp hint, cap block, fail-safe import) → [[Combat Planner UX & IA]] §8; import fail-safe model → [[Combat Planner Data Model]] §10.

| Key | English | Shape |
|---|---|---|
| `errors.nameRequired` | Name is required. | |
| `errors.clamp` | Clamped to {min}–{max}. | `{min}`,`{max}` ← Rules §7 |
| `errors.noteTooLong` | Notes are capped at {max} characters. | `{max}` ← Rules §7 |
| `errors.combatantCap` | This combat is full ({max} combatants max). | `{max}` ← Rules §7 |
| `errors.combatCap` | You've reached the limit of {max} combats. | `{max}` ← Rules §7 |
| `errors.roundCap` | Round {max} is the last round. | `{max}` ← Rules §7 (advance disabled at the cap) |
| `errors.import.corrupt` | This file isn't a valid combat export. | |
| `errors.import.newerVersion` | This file was made by a newer version of the app. Update the app to import it. | |
| `errors.import.overCap` | Importing this would exceed the {max}-combat limit. | `{max}` ← Rules §7 |

## 17. a11y.* — accessible control labels

The label **requirement** (numpad keys, condition toggles, roll-vs-manual init, turn/Start/Undo/Redo, row `⋮`, status not color-alone) → [[Combat Planner UX & IA]] §8; the controls themselves → §9. Strings owned here.

| Key | English | Shape |
|---|---|---|
| `a11y.back` | Back to combats | |
| `a11y.undo` | Undo | |
| `a11y.redo` | Redo | |
| `a11y.start` | Start combat | |
| `a11y.advance` | Advance to next turn | |
| `a11y.jumpToTurn` | Jump to the active turn | |
| `a11y.editRound` | Edit round | |
| `a11y.escalation` | Escalation die, currently {n} | `{n}` = 0–6 |
| `a11y.initCell.roll` | Roll initiative for {name} | `{name}` |
| `a11y.initCell.manual` | Set initiative for {name} manually | `{name}` |
| `a11y.numpad.digit` | Digit {n} | `{n}` = 0–9 |
| `a11y.numpad.backspace` | Backspace | |
| `a11y.numpad.clear` | Clear entry | |
| `a11y.condition.toggle` | Toggle {condition} on {name} | `{condition}` (label from §9), `{name}` |
| `a11y.condition.overflow` | {n, plural, one {# more condition} other {# more conditions}} | ICU plural; reads the "+K" chip |
| `a11y.rowExpand` | Expand {name} | `{name}` |
| `a11y.rowCollapse` | Collapse {name} | `{name}` |
| `a11y.typeBadge` | {type} | type label backs the color (UX §4c/§8) |
| `a11y.healthStatus` | {name}: {status}, {cur} of {max} HP | label backup for the bar |
| `a11y.colorTag` | Color tag: {color} | tag not color-alone |
| `a11y.combatRowMenu` | Actions for {title} | the combat row `⋮` |
| `a11y.reorder` | Reorder {title} | drag handle (ADR-006) |

## 18. Interpolation & ICU summary

All keys carrying a variable or plural, gathered for the translator (copy translates; variable names and plural categories do not):

| Key | Variables | ICU |
|---|---|---|
| `combat.round` · `numpad.history.round` | `{n}` | — |
| `a11y.escalation` | `{n}` | — |
| `numpad.summary.hp` | `{cur}`, `{max}` | — |
| `numpad.summary.temp` | `{temp}` | — |
| `conditions.overflow` | `{n}` | — (literal "+{n}") |
| `about.version` | `{version}` | — |
| `dialogs.deleteCombat.body` · `toasts.import.success` | `{title}` | — |
| `errors.clamp` | `{min}`, `{max}` | — (← Rules §7) |
| `errors.noteTooLong` · `errors.combatantCap` · `errors.combatCap` · `errors.roundCap` · `errors.import.overCap` | `{max}` | — (← Rules §7) |
| `a11y.initCell.roll` · `a11y.initCell.manual` · `a11y.rowExpand` · `a11y.rowCollapse` | `{name}` | — |
| `a11y.condition.toggle` | `{condition}`, `{name}` | — |
| `a11y.healthStatus` | `{name}`, `{status}`, `{cur}`, `{max}` | — |
| `a11y.colorTag` | `{color}` | — |
| `a11y.combatRowMenu` · `a11y.reorder` | `{title}` | — |
| `a11y.numpad.digit` | `{n}` | — |
| `toasts.importAll.success` | `{n}` | **plural** (one / other) |
| `a11y.condition.overflow` | `{n}` | **plural** (one / other) |

## 19. Open gaps (flagged, not filled)

- **Combat-form placeholders.** [[Combat Planner Rules & Glossary]] §7 gives combatant-form placeholders but the **combat** create/edit form (Title / Description) has none specified in UX/Rules. Add `forms.field.title.placeholder` / `forms.field.description.placeholder` here once UX decides them.
- **About copy.** `about.description` / `about.privacy` are first-draft English — [[Combat Planner UX & IA]] §1 names the sections (what-it-is, version, privacy) but not the exact wording; treat as review-pending (ADR-005 workflow).
- **Import-progress copy.** UX §8 says import "shows what's being imported"; if that needs a per-item label beyond `toasts.import.success`, it lands in `toasts.import.*` once UX specs the surface.
