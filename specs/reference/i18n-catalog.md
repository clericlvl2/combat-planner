# Reference: i18n message catalog (English source)

The English source message-key namespace tree and copy. Mechanism, 6 locales, source-then-translate
workflow: `specs/adr/ADR-005.md`. Term meanings (conditions, health statuses):
[[glossary-conditions]]. Numeric values behind cap/clamp copy: [[limits]] (injected as
variables, never hardcoded here). Key form: dot-namespaced (`combats.empty.cta`); `{var}` =
interpolation; `{n, plural, …}` = ICU plural.

## Namespace tree

```
nav.*          top-level destinations
combats.*      Combats home — list, create/import, row menu, empty
combat.*       Combat header (both states) — back, round, escalation, undo/redo, ⋮
setup.*        Setup body — add, start, empty
active.*       Active body — advance
numpad.*       HP numpad sheet — commits, pad, summary, history
conditions.*   the 12 condition display labels + overflow chip
health.*       the 4 health-status labels (label backup for the bar)
forms.*        add/edit combatant + create/edit combat fields, types, swatches, actions
settings.*     Settings groups + controls + language/theme options
about.*        About page copy
dialogs.*      destructive-action confirm dialogs
toasts.*       SW update toast + install banner + import feedback
errors.*       validation / clamp / cap / import-failsafe messages
a11y.*         accessible labels for controls
```

## nav.*

| Key | English |
|---|---|
| `nav.combats` | Combats |
| `nav.settings` | Settings |
| `nav.about` | About |
| `nav.open` | Open navigation |
| `nav.primary` | Primary navigation |

## combats.* — home

| Key | English |
|---|---|
| `combats.title` | Combats |
| `combats.create` | New combat |
| `combats.import` | Import combat |
| `combats.row.menu.edit` | Edit |
| `combats.row.menu.export` | Export / share |
| `combats.row.menu.delete` | Delete |
| `combats.empty.title` | No combats yet |
| `combats.empty.cta` | Create your first combat |
| `combats.untitled` | Untitled combat |
| `combats.search.placeholder` | Search combats… |

## combat.* — header (both states)

| Key | English | Shape |
|---|---|---|
| `combat.round` | Round {n} | `{n}` = round number; full accessible name (popover trigger `aria-label`) |
| `combat.round.label` | Round | visual label half of the RoundEscBar label/value pair (value = `combat.round`'s `{n}` alone) |
| `combat.escalation` | Escalation die | label |
| `combat.undo` | Undo | |
| `combat.redo` | Redo | |
| `combat.menu.add` | Add combatant | header `⋮` (Active) |
| `combat.menu.restart` | Restart | |
| `combat.menu.clear` | Clear combat | |

## setup.* / active.*

| Key | English |
|---|---|
| `setup.addCombatant` | Combatant |
| `setup.start` | Start Combat |
| `setup.empty.title` | No combatants yet |
| `setup.empty.cta` | Add your first combatant |
| `active.advance` | Next turn |

## numpad.* — HP numpad sheet

| Key | English | Shape |
|---|---|---|
| `numpad.dealDamage` | Deal Damage | |
| `numpad.restoreHp` | Restore HP | |
| `numpad.setTempHp` | Set Temp HP | |
| `numpad.backspace` | Backspace | |
| `numpad.clear` | Clear | |
| `numpad.cancel` | Cancel | |
| `numpad.summary.hp` | {cur} / {max} HP | `{cur}`,`{max}` |
| `numpad.summary.temp` | +{temp} temp HP | `{temp}`; hidden when 0 |
| `numpad.history.title` | History | |
| `numpad.history.empty` | No HP changes yet | |
| `numpad.history.action.damage` | Damage | |
| `numpad.history.action.heal` | Heal | |
| `numpad.history.action.setTemp` | Set temp HP | |
| `numpad.history.action.setMax` | Set Max HP | |
| `numpad.history.round` | Round {n} | `{n}`; Setup entries show "—" |

## conditions.* — 12 labels + overflow

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
| `conditions.overflow` | +{n} | `{n}` = hidden-condition count |
| `conditions.addShort` | Condition | short row-trigger label |

## health.* — status labels

| Key | English |
|---|---|
| `health.full` | Full |
| `health.wounded` | Wounded |
| `health.bloodied` | Bloodied |
| `health.dead` | Dead |

## forms.* — combatant + combat forms

Field ranges/defaults: [[limits]].

| Key | English |
|---|---|
| `forms.combatant.add.title` | Add combatant |
| `forms.combatant.edit.title` | Edit combatant |
| `forms.field.name` | Name |
| `forms.field.name.placeholder` | Namius Name |
| `forms.field.type` | Type |
| `forms.type.pc` | PC |
| `forms.type.enemy` | Enemy |
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
| `forms.note.addShort` | Note |
| `forms.combat.create.title` | Create combat |
| `forms.combat.edit.title` | Edit combat |
| `forms.field.title` | Title |
| `forms.field.description` | Description |
| `forms.field.colorTag` | Color tag |
| `forms.colorTag.neutral` | Neutral |
| `forms.colorTag.red` | Red |
| `forms.colorTag.orange` | Orange |
| `forms.colorTag.amber` | Amber |
| `forms.colorTag.green` | Green |
| `forms.colorTag.teal` | Teal |
| `forms.colorTag.blue` | Blue |
| `forms.colorTag.violet` | Violet |
| `forms.action.save` | Save |
| `forms.action.cancel` | Cancel |
| `forms.action.duplicate` | Duplicate |
| `forms.action.remove` | Remove |
| `forms.action.edit` | Edit |

`conditions.addShort` / `forms.note.addShort` are en.json-only additive short labels
(2026-07-02 first-touch rework); the full-sentence keys (`conditions.add`, `forms.note.add`) are unchanged.
Only *renamed* keys (e.g. `forms.type.monster` → `forms.type.enemy`) require an immediate
translated value in all 6 locales.

## settings.*

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
| `settings.language.en` | English |
| `settings.language.de` | Deutsch |
| `settings.language.es` | Español |
| `settings.language.fr` | Français |
| `settings.language.ja` | 日本語 |
| `settings.language.ru` | Русский |

Language option labels are endonyms and stay identical across all locale files.

## about.*

| Key | English | Shape |
|---|---|---|
| `about.title` | About | |
| `about.appName` | Combat Planner | |
| `about.description` | Combat Planner is an offline initiative tracker for 13th Age. Run one encounter at a time — turn order, hit points, the escalation die, and conditions — entirely on this device. | first-draft, review-pending |
| `about.privacy` | Your data never leaves this device. No accounts, no servers, no tracking. | first-draft, review-pending |
| `about.version` | Version {version} | `{version}` |

## dialogs.* — destructive-action confirms

| Key | English | Shape |
|---|---|---|
| `dialogs.cancel` | Cancel | shared |
| `dialogs.deleteCombat.title` | Delete this combat? | |
| `dialogs.deleteCombat.body` | This permanently deletes "{title}". It can't be undone. | `{title}` |
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

## toasts.* — update, install, import

| Key | English | Shape |
|---|---|---|
| `toasts.update.message` | A new version is available. | |
| `toasts.update.action` | Reload | |
| `toasts.install.message` | Install Combat Planner for offline use. | |
| `toasts.install.action` | Install | |
| `toasts.install.dismiss` | Dismiss | |
| `toasts.import.success` | Imported "{title}". | `{title}` |
| `toasts.importAll.success` | {n, plural, one {# combat} other {# combats}} imported. | ICU plural |

## errors.* — validation, caps, import fail-safe

All numeric bounds injected from [[limits]], never written as literals here.

| Key | English | Shape |
|---|---|---|
| `errors.nameRequired` | Name is required. | |
| `errors.clamp` | Clamped to {min}–{max}. | `{min}`,`{max}` |
| `errors.noteTooLong` | Notes are capped at {max} characters. | `{max}` |
| `errors.combatantCap` | This combat is full ({max} combatants max). | `{max}` |
| `errors.combatCap` | You've reached the limit of {max} combats. | `{max}` |
| `errors.roundCap` | Round {max} is the last round. | `{max}` |
| `errors.import.corrupt` | This file isn't a valid combat export. | |
| `errors.import.newerVersion` | This file was made by a newer version of the app. Update the app to import it. | |
| `errors.import.overCap` | Importing this would exceed the {max}-combat limit. | `{max}` |

## a11y.* — accessible control labels

| Key | English | Shape |
|---|---|---|
| `a11y.back` | Back to combats | |
| `a11y.undo` | Undo | |
| `a11y.redo` | Redo | |
| `a11y.start` | Start combat | |
| `a11y.advance` | Advance to next turn | |
| `a11y.editRound` | Edit round | |
| `a11y.escalation` | Escalation die, currently {n} | `{n}` = 0–6 |
| `a11y.initCell.roll` | Roll initiative for {name} | `{name}` |
| `a11y.initCell.manual` | Set initiative for {name} manually | `{name}` |
| `a11y.numpad.digit` | Digit {n} | `{n}` = 0–9 |
| `a11y.numpad.backspace` | Backspace | |
| `a11y.numpad.clear` | Clear entry | |
| `a11y.condition.toggle` | Toggle {condition} on {name} | `{condition}`, `{name}` |
| `a11y.condition.overflow` | {n, plural, one {# more condition} other {# more conditions}} | ICU plural |
| `a11y.rowExpand` | Expand {name} | `{name}` |
| `a11y.rowCollapse` | Collapse {name} | `{name}` |
| `a11y.typeBadge` | {type} | type label backs the color |
| `a11y.healthStatus` | {name}: {status}, {cur} of {max} HP | label backup for the bar |
| `a11y.colorTag` | Color tag: {color} | tag not color-alone |
| `a11y.combatRowMenu` | Actions for {title} | combat row `⋮` |
| `a11y.reorder` | Reorder {title} | drag handle |
| `a11y.numField.decrease` | Decrease | NumberField `−` stepper button |
| `a11y.numField.increase` | Increase | NumberField `+` stepper button |

## Open gaps (flagged, not filled)

- **Combat-form placeholders.** [[limits]] gives combatant-form placeholders but the combat
  create/edit form (Title/Description) has none specified. Add `forms.field.title.placeholder` /
  `forms.field.description.placeholder` once decided.
- **About copy.** `about.description` / `about.privacy` are first-draft English, review-pending.
- **Import-progress copy.** If a per-item import label beyond `toasts.import.success` is needed,
  it lands in `toasts.import.*` once specced.
