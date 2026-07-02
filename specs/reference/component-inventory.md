# Reference: Component inventory

Sources: `Component Inventory` §1–§14 (full catalog).

The reusable-UI-component catalog: hierarchy, variant/prop matrix, and the
component → shadcn-svelte primitive → glyph mapping. Capability files point here for control
placement/visibility and card layout; this file never restates behavior/mechanics (owned by the
relevant capability file) or the glyph-name map (`docs/adr/ADR-011.md`).

Global states (app-wide, not repeated per row): **loading is N/A** everywhere — all reads are
synchronous-feeling local IndexedDB, no fetch spinner anywhere. **focus** is the global WCAG-AA
visible-focus requirement ([[platform]] PLT-5). **error** surfaces only in forms (validation
clamp) and import (fail-safe dialog).

## Hierarchy

```
AppShell
├── NavSidebar (mobile) / AppHeader (tablet·desktop)
├── Toaster · InstallBanner            ← global chrome
├── ConfirmDialog                       ← global, summoned by destructive actions
└── <route outlet>
    ├── Combats (home)
    │   ├── CombatList → CombatRow → { ColorTagDot, CombatRowMenu }
    │   ├── FAB(create) · ImportControl
    │   ├── EmptyState
    │   └── CombatFormDialog → { NumberField·n/a, ColorSwatchPicker }   (create/edit)
    ├── Combat
    │   ├── CombatHeader → { IconButton×back/undo/redo, RoundCounterControl,
    │   │                    EscalationDieControl, CombatOverflowMenu }
    │   ├── CombatantList → CombatantRow
    │   │     ├─ compact:  TypeStripe · CombatantRowMenu (persistent `⋮`) · InitCell ·
    │   │     │            HpCell · HealthBar · DefenseStats · ConditionIconList
    │   │     └─ expanded: + TempHpField · NoteField · ConditionPicker (chips removable)
    │   ├── StartBar (Setup) · FAB(add/advance) · JumpToTurnButton (Active)
    │   ├── EmptyState
    │   ├── NumpadSheet → { HpSummaryHeader, EntryDisplay, DigitPad,
    │   │                   CommitActions, HpLogSection → HpLogEntryRow }
    │   └── CombatantFormDialog → { NumberField, TypeSelect, NoteField, InitEntry }
    ├── Settings → { SettingsGroup, LanguageSwitcher, ThemeSwitcher, DataActions }
    └── About → AboutPage
```

Shared/reused leaves: **FAB**, **IconButton**, **EmptyState**, **NumberField**, **NoteField**,
**ConfirmDialog**, **DropdownMenu**-based menus.

## Navigation placement per breakpoint

- **Mobile:** `NavSidebar` — swipe-right reveals a sidebar with links (Combats/Settings/About).
- **Tablet:** `AppHeader` in burger mode — header with a burger menu that opens a Sheet.
- **Desktop:** `AppHeader` in inline mode — header with inline nav links.

## Combatant row — compact vs. expanded

| Prop | Values | Drives |
|---|---|---|
| type | PC · enemy · ally | TypeStripe color + stripe count |
| active | bool | active-turn highlight |
| healthState | full · wounded · bloodied · dead | HealthBar fill/alarm + card background tint |
| display | compact · expanded | which children render |

**Compact row** shows: active-turn indicator, TypeStripe, persistent `⋮` menu
(Edit/Duplicate/Remove), name, InitCell, HpCell + HealthBar, DefenseStats (AC/PD/MD, in-row at
all sizes), ConditionIconList (first few + "+K" overflow chip).

**Expanded row** additionally shows: TempHpField, NoteField, ConditionPicker (12-preset toggle,
applied chips gain a removable ×).

TypeStripe is a deliberate color-alone exception, compensated by an `aria-label` naming the type
([[platform]] PLT-5).

## Floating action button (FAB) — bottom-right thumb zone

Shared component, `action` prop switches meaning by screen/state:

| Screen / state | FAB action |
|---|---|
| Combats home | create |
| Combat — Setup | add (combatant) |
| Combat — Active | advance (disabled at the round-99→100 wrap) |

## Numpad sheet

Bottom sheet (Drawer) on mobile, positioned Dialog panel on desktop. Opened from `HpCell`.
Contains: `HpSummaryHeader` (cur/max + temp, shown before entry), `EntryDisplay`, `DigitPad`
(0–9 + backspace/clear, ≥44px targets), `CommitActions` (Deal Damage / Restore HP / Set Temp HP),
`HpLogSection` (collapsible, newest-first, "No HP changes yet" when empty) → `HpLogEntryRow`.

## Header (Combat screen)

One bar across Setup and Active. `IconButton`s: back, undo, redo (undo/redo disabled at their
respective stack ends). `RoundCounterControl` and `EscalationDieControl` are **Active only**.
`CombatOverflowMenu` (`⋮`): Setup → {Clear}; Active → {Add combatant, Restart, Clear}.

## Global chrome placement

`UpdateToast` (via `Toaster`) renders bottom-center, lifted above the FAB/thumb zone.
`InstallBanner` renders as a slim, dismissible top banner. Neither ever overlaps the FAB or the
Setup `StartBar` ([[platform]] PLT-4).

## Combats list row

`CombatRow`: color tag (`ColorTagDot`), title, description, trailing `⋮` (`CombatRowMenu`: Edit /
Export-share / Delete). Drag handle for reorder (svelte-dnd-action).

## shadcn-svelte primitive coverage (reverse index)

| Primitive | Used by |
|---|---|
| Button | IconButton, FAB, StartBar, JumpToTurnButton, DigitPad, CommitActions, DataActions, NavLink, EmptyState CTA, ImportControl |
| Dialog | CombatFormDialog, CombatantFormDialog, NumpadSheet (desktop) |
| AlertDialog | ConfirmDialog |
| Sidebar | NavSidebar |
| Sheet | AppHeader burger |
| Drawer | NumpadSheet (mobile) |
| DropdownMenu | CombatRowMenu, CombatOverflowMenu, CombatantRowMenu |
| Select | TypeSelect, LanguageSwitcher |
| RadioGroup / ToggleGroup | ColorSwatchPicker, ConditionPicker, ThemeSwitcher |
| Input | NumberField (+ form fields) |
| Textarea | NoteField |
| Label / Form | CombatFormDialog, CombatantFormDialog, NumberField |
| Card | CombatRow, CombatantRow, SettingsGroup |
| Badge | ConditionIconList ("+K" chip, removable × when expanded) |
| Collapsible | CombatantRow (compact↔expanded), HpLogSection |
| Progress | HealthBar |
| Popover | RoundCounterControl, EscalationDieControl, InitEntry |
| Sonner (toast) | Toaster / UpdateToast |
| ScrollArea | HpLogSection |
| Separator | SettingsGroup |
| Tooltip | (a11y labels — optional reinforcement, deferred to build) |
| bespoke (no primitive) | AppShell, ColorTagDot, TypeStripe, HealthBar fill, DefenseStats, EntryDisplay, DigitPad grid, HpSummaryHeader, HpLogEntryRow, InstallBanner, AboutPage |

## Glyph gaps (not yet in ADR-011)

Flagged, not invented — glyph names are `docs/adr/ADR-011.md`'s to own: menu/burger, edit,
delete/remove, duplicate, close/dismiss, backspace, clear, expand/collapse chevron, drag handle,
settings/about nav icons, theme (system/dark/light), language/globe, reset-all.
