# Reference: Component inventory

The reusable-UI-component catalog: hierarchy, variant/prop matrix, and the
component → shadcn-svelte primitive → glyph mapping. Capability files point here for control
placement/visibility and card layout; this file never restates behavior/mechanics (owned by the
relevant capability file) or the glyph-name map (`specs/adr/ADR-011.md`).

Global states (app-wide, not repeated per row): **loading is N/A** everywhere — all reads are
synchronous-feeling local IndexedDB, no fetch spinner anywhere. **focus** is the global WCAG-AA
visible-focus requirement ([[../capabilities/platform]] PLT-5). **error** surfaces only in forms
(validation clamp).

**Target vs. shipped, this doc.** This file describes the design *target* locked in by the
converged prototype (`specs/design/prototype.html`, plus `specs/design/card-prototype.html` for
the combatant-card shape) — the living spec units **D** (006 combats-list) / **E** (007 combat)
port from. Where the target still diverges from what shipped M2 `src/` code renders today, that
gap is flagged inline instead of silently restated as already-true.

## Hierarchy

```
AppShell
├── NavSidebar (mobile) / AppHeader (tablet·desktop)
├── Toaster · InstallBanner            ← global chrome
├── ConfirmDialog                       ← global, summoned by destructive actions
└── <route outlet>
    ├── Combats (home)
    │   ├── SearchBar (static name+desc placeholder; first child of the populated list — no
    │   │     matching src component yet, real filtering is unit D)
    │   ├── CombatList → CombatRow → { ColorTagDot (renders the combat title's first letter;
    │   │     dot fill is still the picked color), CombatRowMenu }
    │   ├── Create control: header "+" icon button (desktop, replaces the desktop FAB) ·
    │   │     FAB(create) (mobile)
    │   ├── EmptyState (desktop keeps the centered "+ New Combat" button; mobile drops it —
    │   │     FAB alone)
    │   └── CombatFormDialog → { NumberField·n/a, ColorSwatchPicker }   (create/edit)
    ├── Combat
    │   ├── CombatHeader → { IconButton×back, chrome-title,
    │   │       Setup: header-add "+" icon button + header-start hold-to-start icon button
    │   │             (desktop) / two FABs — Add + Start (mobile, see "FAB" below),
    │   │       Active: header-advance/header-jump tonal-circle icon buttons (desktop only) +
    │   │             RoundEscBar sub-bar rendered below the header chrome (both breakpoints),
    │   │       CombatOverflowMenu(`⋮`, trailing) → { Undo, Redo (top, disabled at stack ends),
    │   │       Setup: +Clear · Active: +Add combatant/Restart/Clear } }
    │   ├── CombatantList → CombatantCard (see "Combatant card" below)
    │   ├── Setup: two floating controls (mobile) — Add-Combatant FAB (bottom-right) + a
    │   │     hold-to-start Start FAB (right-edge, stacked above the Add FAB); desktop swaps
    │   │     both for header-add/header-start icon buttons (see CombatHeader above). Active:
    │   │     FAB(advance, chevron `›` glyph, `aria-label="Advance turn"`) (mobile) /
    │   │     header-advance icon button (desktop). JumpToTurnButton (Active, TRE — not yet in
    │   │     the M2 slice, targeted by unit 007). Cross-reference
    │   │     [[../capabilities/lifecycle]] for the hold-to-start gesture itself.
    │   ├── EmptyState
    │   ├── NumpadSheet → { HpSummaryHeader, EntryDisplay, CommitActions, DigitPad,
    │   │                   HpLogSection → HpLogEntryRow }
    │   └── CombatantForm → { NumberField (Max HP / Init Bonus / AC / PD / MD — every instance
    │         follows Decrease → value → Increase button order, incl. AC/PD/MD), Type
    │         (ToggleGroup, equal-width segments, not a Select), NoteField, Initiative
    │         (NumberField — edit mode or mid-combat add only; no roll/lock control, rolling
    │         stays on the card's Init pill). Add-mode header chrome matches the Setup two-FAB /
    │         header-add+header-start pattern; edit-mode header chrome matches the Active header
    │         (header-advance/header-jump icon buttons + RoundEscBar). }
    ├── Settings → { SettingsGroup, LanguageSwitcher, ThemeSwitcher, DataActions (Reset-all
    │     only — export/import rows dropped, see [[../capabilities/settings]] SET-3) }
    └── About → AboutPage
```

Shared/reused leaves: **FAB**, **IconButton**, **EmptyState**, **NumberField**, **NoteField**,
**ConfirmDialog**, **DropdownMenu**-based menus.

## Navigation placement per breakpoint

- **Mobile:** `NavSidebar` — swipe-right reveals a sidebar with links (Combats/Settings/About).
- **Tablet:** `AppHeader` in burger mode — header with a burger menu that opens a Sheet.
- **Desktop:** `AppHeader` in icon-button mode — `.nav-desktop` renders three icon buttons (⚔
  Combats / ⚙ Settings / ⓘ About), each carrying both `aria-label` and `title`; the current
  destination gets `.is-current` styling. Applies globally, on every screen's header — not just
  Combats home.

## Combatant card

Replaces the earlier dense-row description; the shape below is locked in
`card-prototype.html` (the living sandbox spec unit E ports from) and ported into
`prototype.html`. No matching `src/` component ships this card yet — flagged as unit **E**
(007) work throughout.

| Prop | Values | Drives |
|---|---|---|
| type | PC · enemy · ally | TypeStripe color + stripe count |
| active | bool | active-turn highlight (leading dot on the current-turn card) |
| healthState | full · wounded · bloodied · dead | HealthBar fill/alarm (health-band card-bg tint
  removed in the R4 restyle — the fill colour change alone is the signal) |
| open (expand state) | collapsed · expanded | which triggers/affordances render |

Card layout, leading → trailing:

- **TypeStripe** — leading edge, color + `aria-label` naming the type (kept from the compact-row
  era; stripe count pc=2, enemy/ally=1).
- **Row 1** — name + expand chevron (`.chevron-btn`, a CSS-drawn rotating corner, not a glyph
  font character) + a trailing per-card `⋮` overflow menu (Edit/Duplicate/Remove).
- **Row 2** — big HP (`.hp-big`, current/max, tabular figures) inside a fixed-width `.hp-block`
  wrapper (so the health bar's start position never shifts with HP digit count), an inline
  top-right temp-HP badge nested in the HP block when temp HP is carried, and a 4-band health
  bar (`flex:1 1 auto`) that stretches to fill the remaining card width.
- **Row 3** — AC/PD/MD defense stats + an Init pill (`Init N` once set, `Init –` while unset).
- **Condition chips** — filled, full 13th-Age condition name (no icons, no 2-letter codes),
  colour-coded per condition on a shared `.chip` base (round/pill shape). This file states
  *what* renders — full-name filled chips per condition, one colour token each — not the
  `color-mix()` recipe, which is prototype/CSS implementation detail owned by
  `card-prototype.html`.
- **Note line** — renders read-only under the card whenever a note is set, in *both* the
  collapsed and expanded state. **Prototype-only divergence from shipped
  `CombatantRow.svelte`,** which currently only shows the note editor/text when the row is
  expanded — unit E must decide whether to widen shipped behavior to match or keep the gap;
  this file describes the *target*, not what ships today.

**Collapsed vs. expanded:** AC/PD/MD, the Init pill, and the full condition-chip list stay
visible in both states. Collapsing only hides the per-chip `×` (remove) affordance and the
"+ Condition" / "+ Note" triggers.

TypeStripe (and the Combats-home `ColorTagDot`'s colour fill) are the deliberate color-alone
exceptions, each compensated by a non-color signal — see
[[../capabilities/platform]] PLT-5.

## Floating action button (FAB) — bottom-right thumb zone

Shared component, `action` prop switches meaning by screen/state. Combat — Setup shows **two**
floating controls on mobile (desktop swaps both for header icon buttons, see "Header" below):
an Add-Combatant FAB (bottom-right) and a hold-to-start Start FAB (right-edge, stacked directly
above the Add FAB). Cross-reference [[../capabilities/lifecycle]] for the hold-to-start gesture
itself — that capability-level behavior is LIF's job, not this file's.

| Screen / state | FAB action (mobile) | Desktop equivalent |
|---|---|---|
| Combats home | create | header "+" icon button |
| Combat — Setup | Add Combatant (bottom-right) + hold-to-start Start (right-edge, above Add) | header-add "+" + header-start icon buttons |
| Combat — Active | advance (chevron `›` glyph; disabled at the round wrap boundary — [[../capabilities/turns-rounds-escalation]] TRE-3) | header-advance icon button (+ header-jump for jump-to-turn) |

## Numpad sheet

Bottom sheet (Drawer) on mobile, positioned Dialog panel on desktop. Opened from `HpCell`.
Contains, in DOM order: `HpSummaryHeader` (cur/max + temp, shown before entry), `EntryDisplay`
(bordered field), `CommitActions` (Deal Damage / Restore HP / Set Temp HP — rendered *above* the
digit pad, tonal button recipe per action), `DigitPad` (0–9 bordered digit buttons + ghost
borderless Backspace/Clear glyph buttons, ≥44px targets), `HpLogSection` — labeled "History"
(collapsible, newest-first, "No HP changes yet" when empty) → `HpLogEntryRow` (a colour-coded
action chip + signed diff value in the left column, the old→new value transition in the right
column, unaccented).

## Header (Combat screen)

**Setup:** back (leading) · chrome-title · `header-add`("+")/`header-start`(hold-to-start) icon
buttons (desktop) — mobile drops these two for the Setup two-FAB stack instead — ·
`CombatOverflowMenu`(`⋮`, trailing).

**Active:** back (leading) · chrome-title · `header-advance`/`header-jump` tonal-circle icon
buttons (desktop only; mobile uses the advance FAB + a "Jump to turn" pill instead) ·
`CombatOverflowMenu`(`⋮`, trailing). Round and escalation-die values render as a `RoundEscBar`
sub-bar below the header chrome (both breakpoints), not inline in a header center slot.

Undo/Redo are **not** separate header icons on either screen state — they're the top two
`CombatOverflowMenu` items (disabled at their respective stack ends), followed by
Setup → {Clear}; Active → {Add combatant, Restart, Clear}.

## Global chrome placement

`UpdateToast` (via `Toaster`) renders bottom-center, lifted above the FAB/thumb zone.
`InstallBanner` renders as a slim, dismissible top banner. Neither ever overlaps a FAB — Setup
now floats two (Add + Start) instead of the earlier bottom bar — ([[../capabilities/platform]]
PLT-4).

## Combats list row

`CombatRow`: color tag (`ColorTagDot`, renders the title's first letter; fill = picked color),
title, description, trailing `⋮` (`CombatRowMenu`: Edit / Delete). Drag handle for reorder
(svelte-dnd-action). Desktop populated list renders as a single column, not a grid.

## shadcn-svelte primitive coverage (reverse index)

| Primitive | Used by |
|---|---|
| Button | IconButton, FAB, JumpToTurnButton, DigitPad, CommitActions, DataActions, NavLink, EmptyState CTA, chevron expand button, tonal-circle header icon buttons (header-add/header-start/header-advance/header-jump), ghost digit buttons (Backspace/Clear) |
| Dialog | CombatFormDialog, CombatantForm, NumpadSheet (desktop) |
| AlertDialog | ConfirmDialog |
| Sidebar | NavSidebar |
| Sheet | AppHeader burger |
| Drawer | NumpadSheet (mobile) |
| DropdownMenu | CombatRowMenu, CombatOverflowMenu, CombatantCard's per-card `⋮` menu |
| Select | LanguageSwitcher |
| RadioGroup / ToggleGroup | ColorSwatchPicker, ConditionPicker, ThemeSwitcher, Type toggle (CombatantForm, equal-width segments) |
| Input | NumberField (+ form fields) |
| Textarea | NoteField |
| Label / Form | CombatFormDialog, CombatantForm, NumberField |
| Card | CombatRow, CombatantCard, SettingsGroup |
| Badge | condition chips (full-name, filled, colour-coded; all render, removable × when expanded) |
| Collapsible | CombatantCard (collapsed↔expanded), HpLogSection |
| Progress | HealthBar |
| Popover | RoundCounterControl, EscalationDieControl, InitCell (manual-entry, long-press) |
| Sonner (toast) | Toaster / UpdateToast |
| ScrollArea | HpLogSection |
| Separator | SettingsGroup |
| Tooltip | (a11y labels — optional reinforcement, deferred to build) |
| bespoke (no primitive) | AppShell, ColorTagDot, TypeStripe, HealthBar fill, DefenseStats, EntryDisplay, HpSummaryHeader, HpLogEntryRow, InstallBanner, AboutPage, SearchBar |

`HpCell`/`TypeStripe` (compact-row era) had no matching `src/` file (inlined in
`CombatantRow.svelte`); the card restyle carries the same note forward for the card's HP block
and type stripe until unit E ships dedicated components.

## Glyph gaps (not yet in ADR-011)

Flagged, not invented — glyph names are `specs/adr/ADR-011.md`'s to own: menu/burger, edit,
delete/remove, duplicate, close/dismiss, backspace (ghost `‹`), clear (ghost `×`),
expand/collapse chevron (CSS-drawn rotating corner, not a glyph character), drag handle,
settings/about nav icons, theme (system/dark/light), language/globe, reset-all, advance-turn
chevron (`›`).
