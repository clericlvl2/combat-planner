# Reference: Component inventory

The reusable-UI-component catalog: hierarchy, variant/prop matrix, and the
component → shadcn-svelte primitive → glyph mapping. Capability files point here for control
placement/visibility and card layout; this file never restates behavior/mechanics (owned by the
relevant capability file) or the glyph-name map (`specs/adr/ADR-011.md`).

Global states (app-wide, not repeated per row): **loading is N/A** everywhere — all reads are
synchronous-feeling local IndexedDB, no fetch spinner anywhere. **focus** is the global WCAG-AA
visible-focus requirement ([[../capabilities/platform]] PLT-5). **error** surfaces only in forms (validation
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
    │   ├── CombatHeader → { IconButton×back, RoundCounterControl, EscalationDieControl,
    │   │                    CombatOverflowMenu → { Undo, Redo (top, disabled at stack ends),
    │   │                    Setup: +Clear · Active: +Add combatant/Restart/Clear } }
    │   ├── CombatantList → CombatantRow
    │   │     ├─ compact:  TypeStripe (leading edge) · HpCell (opens numpad) · name (toggles
    │   │     │            expand) · HealthBar · DefenseStats · ConditionIconList (all render,
    │   │     │            no overflow chip) · InitCell (trailing; disabled while Active) ·
    │   │     │            persistent `⋮` menu (Edit/Duplicate/Remove, trailing-most)
    │   │     └─ expanded: + "+ Condition" tag-trigger → ConditionPicker (chips removable ×) ·
    │   │                  "+ Note" tag-trigger → inline note editor (hidden once note is set)
    │   ├── Setup: persistent "Add Combatant" bar (no FAB) — Start moves into CombatHeader once
    │   │     the roster isn't empty. Active: FAB(advance). JumpToTurnButton (Active, TRE —
    │   │     not yet in the M2 slice, targeted by unit 007)
    │   ├── EmptyState
    │   ├── NumpadSheet → { HpSummaryHeader, EntryDisplay, DigitPad,
    │   │                   CommitActions, HpLogSection → HpLogEntryRow }
    │   └── CombatantForm → { NumberField (Max HP / Init Bonus / AC / PD / MD), Type
    │         (ToggleGroup, not a Select), NoteField, Initiative (NumberField — edit mode or
    │         mid-combat add only; no roll/lock control, rolling stays on the row's InitCell) }
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

**Compact row** shows, in order (leading → trailing): TypeStripe, HpCell (opens the numpad;
shows a temp-HP badge inline when carried), name (toggles expand) + active-turn indicator,
HealthBar, DefenseStats (AC/PD/MD, in-row at all sizes), ConditionIconList (**all** conditions
render — no "+K" overflow, the row wraps instead), InitCell (disabled while the combat is
Active), persistent `⋮` menu (Edit/Duplicate/Remove, trailing-most).

**Expanded row** additionally shows two tag-styled triggers appended to the condition row: "+
Condition" (always, opens the ConditionPicker modal — preset toggle set,
[[../capabilities/conditions]] CND-1, applied chips gain a removable ×) and "+ Note" (hidden
once the note is non-empty, otherwise reveals an inline note editor). There is no separate
temp-HP field in the expanded row — temp HP is only set via NumpadSheet's "Set Temp HP" action.

TypeStripe is a deliberate color-alone exception, compensated by an `aria-label` naming the type
([[../capabilities/platform]] PLT-5).

## Floating action button (FAB) — bottom-right thumb zone

Shared component, `action` prop switches meaning by screen/state. Combat — Setup does **not**
use the FAB at all (shipped M2 code): it shows a persistent full-width "Add Combatant" bar
pinned at the bottom instead, and Start moves inline into `CombatHeader` once the roster isn't
empty.

| Screen / state | FAB action |
|---|---|
| Combats home | create |
| Combat — Setup | — (no FAB; persistent "Add Combatant" bar instead, see above) |
| Combat — Active | advance (disabled at the round wrap boundary — [[../capabilities/turns-rounds-escalation]] TRE-3) |

## Numpad sheet

Bottom sheet (Drawer) on mobile, positioned Dialog panel on desktop. Opened from `HpCell`.
Contains: `HpSummaryHeader` (cur/max + temp, shown before entry), `EntryDisplay`, `DigitPad`
(0–9 + backspace/clear, ≥44px targets), `CommitActions` (Deal Damage / Restore HP / Set Temp HP),
`HpLogSection` (collapsible, newest-first, "No HP changes yet" when empty) → `HpLogEntryRow`.

## Header (Combat screen)

One bar across Setup and Active: back (leading) · center slot · `CombatOverflowMenu` (`⋮`,
trailing). Center slot is **Active only** (`RoundCounterControl` + `EscalationDieControl`); in
Setup it holds nothing until the roster isn't empty, then a "Start combat" button appears there.
Undo/Redo are **not** separate header icons — they're the top two `CombatOverflowMenu` items
(disabled at their respective stack ends), followed by Setup → {Clear}; Active → {Add
combatant, Restart, Clear}.

## Global chrome placement

`UpdateToast` (via `Toaster`) renders bottom-center, lifted above the FAB/thumb zone.
`InstallBanner` renders as a slim, dismissible top banner. Neither ever overlaps the FAB or
Setup's persistent "Add Combatant" bar ([[../capabilities/platform]] PLT-4).

## Combats list row

`CombatRow`: color tag (`ColorTagDot`), title, description, trailing `⋮` (`CombatRowMenu`: Edit /
Delete; the Export-share item is pending under [[../capabilities/combats-list]] CLS-8). Drag
handle for reorder (svelte-dnd-action).

## shadcn-svelte primitive coverage (reverse index)

| Primitive | Used by |
|---|---|
| Button | IconButton, FAB, StartBar, JumpToTurnButton, DigitPad, CommitActions, DataActions, NavLink, EmptyState CTA, ImportControl |
| Dialog | CombatFormDialog, CombatantForm, NumpadSheet (desktop) |
| AlertDialog | ConfirmDialog |
| Sidebar | NavSidebar |
| Sheet | AppHeader burger |
| Drawer | NumpadSheet (mobile) |
| DropdownMenu | CombatRowMenu, CombatOverflowMenu, CombatantRowMenu |
| Select | LanguageSwitcher |
| RadioGroup / ToggleGroup | ColorSwatchPicker, ConditionPicker, ThemeSwitcher, Type toggle (CombatantForm) |
| Input | NumberField (+ form fields) |
| Textarea | NoteField |
| Label / Form | CombatFormDialog, CombatantForm, NumberField |
| Card | CombatRow, CombatantRow, SettingsGroup |
| Badge | ConditionIconList (all conditions render, removable × when expanded) |
| Collapsible | CombatantRow (compact↔expanded), HpLogSection |
| Progress | HealthBar |
| Popover | RoundCounterControl, EscalationDieControl, InitCell (manual-entry, long-press) |
| Sonner (toast) | Toaster / UpdateToast |
| ScrollArea | HpLogSection |
| Separator | SettingsGroup |
| Tooltip | (a11y labels — optional reinforcement, deferred to build) |
| bespoke (no primitive) | AppShell, ColorTagDot, TypeStripe, HealthBar fill, DefenseStats, EntryDisplay, DigitPad grid, HpSummaryHeader, HpLogEntryRow, InstallBanner, AboutPage |

## Glyph gaps (not yet in ADR-011)

Flagged, not invented — glyph names are `specs/adr/ADR-011.md`'s to own: menu/burger, edit,
delete/remove, duplicate, close/dismiss, backspace, clear, expand/collapse chevron, drag handle,
settings/about nav icons, theme (system/dark/light), language/globe, reset-all.
