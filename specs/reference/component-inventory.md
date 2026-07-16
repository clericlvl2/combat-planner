# Reference: Component inventory

The reusable-UI-component catalog: hierarchy, variant/prop matrix, and the
component → shadcn-svelte primitive → glyph mapping. Capability files point here for control
placement/visibility and card layout; this file never restates behavior/mechanics (owned by the
relevant capability file) or the glyph-name map (`specs/adr/ADR-011.md`).

Global states (app-wide, not repeated per row): **loading is N/A** everywhere — all reads are
synchronous-feeling local IndexedDB, no fetch spinner anywhere. **focus** is the global WCAG-AA
visible-focus requirement ([[../capabilities/platform]] PLT-5). **error** surfaces only in forms
(validation clamp).

**Token source of truth.** All raw design tokens (colors, `--space-*`, `--font-*`, radius scale,
and the component dims `--card-pad`/`--card-gap`/`--card-border`/`--hp-size`/`--badge-width`/
`--touch-min`/`--content-max`) live in one place, `specs/design/tokens.css`, `@import`ed verbatim
by `prototype.html`, `card-prototype.html`, and `src/routes/layout.css` — no value is re-typed in
any of the three. One documented exception: `--card-pad` and `--hp-size` were synced to the
shipped `CombatantRow` render (12px / 18px) rather than the prototype's prior 14px / 19px value;
the prototype design source was updated to match. Theming is keyed by a `[data-theme="light"|
"dark"]` attribute (see [[../capabilities/settings]] SET-2), not per-theme classes.

**Desktop content container ([[../capabilities/platform]] PLT-2).** `--content-max: 768px`
(narrowed from an initial 1024px after unit-020 dogfooding) caps a shared `.content-container`
utility (`src/routes/layout.css`'s `@utility content-container`, consuming the token via `@theme`)
that every routed screen's body and header inner-content sit inside, centered with gutters on
wider viewports — `AppShell.svelte`'s `<main>` wrapper, `AppHeader.svelte`, and the Round/
Escalation sub-bar in `CombatHeader.svelte` all apply it, so card columns and sub-bar content
stop spanning the full viewport past 768px. The `content-container` utility also carries
horizontal `padding-inline` gutter so header/body content never touches the viewport's
left/right edges at cap width — that gutter is `--space-3` (12px), narrowed from the initial
16px this unit (021). `prototype.html`'s `--desktop-w: 768px` frame canvas dimension is
the design-canvas analogue of this same width.

Unit 021 (dogfooding follow-up) added a second, wider token: `--content-max-wide: 1024px`, caps a
`.content-container-wide` utility (`layout.css`'s `@utility content-container-wide`), consumed
only by `CombatHeader.svelte`'s own chrome wrapper (back link, title, `⋮` menu, Setup/Active
header controls) — the one container in the app that caps at 1024 instead of 768. Everything
else (body content, cards, the Round/Escalation sub-bar, every other screen's header) keeps the
768 `.content-container` cap.

**Target vs. shipped, this doc.** This file describes the design *target* locked in by the
converged prototype (`specs/design/prototype.html`, plus `specs/design/card-prototype.html` for
the combatant-card shape). Unit **D** (006 combats-list) shipped and ported its surfaces
(AppShell/AppHeader/NavSidebar chrome, CombatList family, CombatFormDialog, ConfirmDialog,
Settings, About); unit **E** (007 combat screen) has now shipped and ported the Combat-screen
surfaces (CombatHeader, CombatantCard/CombatantRow, NumpadSheet, CombatantForm) — where the
target still diverges from what shipped `src/` code renders today, that gap is flagged inline
instead of silently restated as already-true.

## Hierarchy

```
AppShell
├── NavSidebar (mobile) / AppHeader (tablet·desktop) — AppShell skips its own AppHeader on the
│     Combat route (own-header guard); CombatHeader renders the same shared `DesktopNav.svelte`
│     component there instead, as its own trailing section after CombatHeader's own page
│     controls (see "Navigation placement per breakpoint" below)
├── Toaster · InstallBanner            ← global chrome
├── ConfirmDialog                       ← global, summoned by destructive actions
└── <route outlet>
    ├── Combats (home)
    │   ├── SearchField (real-time title-**or**-description filter with matched-substring
    │   │     highlight, view-local only — shipped unit F (009), extended unit 020; first child of
    │   │     the populated list, hidden on the empty-state screen — [[../capabilities/combats-list]] CLS-9)
    │   ├── CombatList → CombatRow → { ColorTagDot (renders the combat title's first letter;
    │   │     dot fill is still the picked color), CombatRowMenu } — the whole `CombatRow` card is
    │   │     both the hover surface (CLS-1) and the open target (CLS-5); only the drag handle and
    │   │     `CombatRowMenu` opt out of the open-click and are the sole drag-initiation point
    │   │     (CLS-6)
    │   ├── Create control: header "+" icon button (desktop, replaces the desktop FAB) ·
    │   │     FAB(create) (mobile)
    │   ├── EmptyState (desktop keeps the centered "+ New Combat" button; mobile drops it —
    │   │     FAB alone)
    │   └── CombatFormDialog → { NumberField·n/a, ColorSwatchPicker (single full-width
    │         stretched row of equal-width swatches, `h-9 flex-1` each — unit 021, was a
    │         fixed-square wrapping grid) } — renders as a centered Dialog at ≥1024px / bottom
    │         Drawer below it (unit 021, `MediaQuery` split — [[../capabilities/combats-list]]
    │         CLS-2)   (create/edit)
    ├── Combat
    │   ├── CombatHeader → { IconButton×back, chrome-title,
    │   │       desktop-only `.nav-desktop` icon-nav row (Combats/Settings/About — mirrors
    │   │             AppHeader's own; PLT-2, since AppShell skips its shared AppHeader here),
    │   │       Setup: header-add "+" icon button + header-start hold-to-start icon button
    │   │             (desktop) / two FABs — Add + Start (mobile, see "FAB" below),
    │   │       Active: header-advance tonal-circle icon button (desktop only) +
    │   │             RoundEscBar sub-bar rendered below the header chrome (both breakpoints),
    │   │       CombatOverflowMenu(`⋮`, trailing) → { Undo, Redo (top, disabled at stack ends),
    │   │       Setup: +Clear · Active: +Add combatant/Restart/Clear } }
    │   ├── CombatantList → CombatantCard (see "Combatant card" below)
    │   ├── Setup: two floating controls (mobile) — Add-Combatant FAB (bottom-right) + a
    │   │     hold-to-start Start FAB (right-edge, stacked above the Add FAB); desktop swaps
    │   │     both for header-add/header-start icon buttons (see CombatHeader above). Active:
    │   │     FAB(advance, chevron `›` glyph, `aria-label="Advance turn"`) (mobile) /
    │   │     header-advance icon button (desktop). Advancing auto-scrolls the active-turn row
    │   │     into view (wired into the advance flow, [[../capabilities/turns-rounds-escalation]]
    │   │     TRE-2). Cross-reference [[../capabilities/lifecycle]] for the hold-to-start
    │   │     gesture itself.
    │   ├── EmptyState
    │   ├── NumpadSheet → { HpSummaryHeader, EntryDisplay, CommitActions, DigitPad,
    │   │                   HpLogSection → HpLogEntryRow }
    │   └── CombatantForm → { NumberField (Max HP / AC / PD / MD / Init Bonus / Initiative —
    │         every instance follows Decrease → value → Increase button order, incl. AC/PD/MD;
    │         the Initiative field now renders unconditionally in both add and edit mode, unit
    │         021 — no more `combatActive` gating), Type (ToggleGroup, equal-width per-type-
    │         colored pills — each item shows a leading `size-2 rounded-full` color dot and a
    │         same-color tint/ring when selected, unit 021; not a neutral segmented fill, not a
    │         Select), NoteField (renders last, after the Init Bonus/Initiative pair, unit 021) }.
    │         Add-mode header chrome matches the Setup two-FAB / header-add+header-start pattern;
    │         edit-mode header chrome matches the Active header (header-advance icon button +
    │         RoundEscBar). The form renders as a centered Dialog at ≥1024px and a bottom Drawer
    │         below it (unit 021, `MediaQuery`, sharing one form-body snippet —
    │         [[../capabilities/combatants]] CBT-3/CBT-4). Dialog layout: Name/Type stack (label
    │         above control); Max HP/AC/PD/MD/Init Bonus/Initiative render as 2-across
    │         `NumberField` pairs; Note is the last field. The desktop `DialogContent` caps
    │         height (`max-h-[calc(100dvh-2rem)]`, column flex) so only the field region scrolls
    │         (`overflow-y-auto`); the footer matches `CombatFormDialog` styling (Cancel
    │         `variant="outline"`, buttons `h-11 flex-1`) and stays outside the scroll region but
    │         inside the form. }
    ├── Settings → three inline `<section>` groups (Language / Appearance / Data) plus a
    │     headingless About link row, authored directly in `settings/+page.svelte` — no
    │     dedicated SettingsGroup/LanguageSwitcher/ThemeSwitcher/DataActions leaf components
    │     ship (Data group is Reset-all only — export/import rows dropped, see
    │     [[../capabilities/settings]] SET-3)
    └── About → a single inline block in `about/+page.svelte` (app name/version/description/
          privacy note) — no dedicated AboutPage component ships
```

Shared/reused leaves: **FAB**, **IconButton**, **EmptyState**, **NumberField**, **NoteField**,
**ConfirmDialog**, **DropdownMenu**-based menus.

## Navigation placement per breakpoint

- **Mobile:** `NavSidebar` — swipe-right reveals a sidebar with links (Combats/Settings/About).
- **Tablet:** `AppHeader` in burger mode — header with a burger menu that opens a Sheet.
- **Desktop:** a single shared `DesktopNav.svelte` component renders three icon buttons (⚔
  Combats / ⚙ Settings / ⓘ About), each carrying both `aria-label` and `title`; the current
  destination gets an `aria-current="page"`-paired highlight. Applies globally, on every screen's
  header — not just Combats home. `AppHeader.svelte` and `CombatHeader.svelte` both consume
  `DesktopNav` directly (no duplicated markup, unit-020 follow-up on the earlier two-component
  duplication); on the Combat screen, `AppShell` skips its own AppHeader (own-header guard) and
  `CombatHeader` mounts `DesktopNav` itself, so the row is present everywhere, just mounted by two
  different header components (PLT-3).
- **Control-then-nav sectioning (PLT-3).** In both `AppHeader` and `CombatHeader`, every
  page-control button (Combats-home's "+" create button; Setup's header-add/header-start; Active's
  header-advance; the `⋮` overflow menu) renders **before** `DesktopNav` in DOM/visual order.
  `DesktopNav` itself carries a `border-left` divider (`border-l border-border pl-2` in the
  shipped component; the `.frame--desktop .nav-desktop` rule in `prototype.html`) so it always
  reads as its own trailing section, never interleaved with the page controls.

## Combatant card

Replaces the earlier dense-row description; the shape below is locked in
`card-prototype.html` (the living sandbox spec unit E ports from) and ported into
`prototype.html`. Ships as `CombatantRow.svelte` (unit **E**, 007). Card dims (`--card-pad`,
`--card-gap`, `--card-border`, `--hp-size`, `--badge-width`) are tokens sourced from
`specs/design/tokens.css` (see "Token source of truth" above), referenced by `CombatantRow`
as `var(--card-pad)` etc. rather than literal px.

| Prop | Values | Drives |
|---|---|---|
| type | PC · enemy · ally | leading color dot (`aria-hidden`, decorative) before the name —
  unit 021, replaces the earlier type-color stripe |
| active | bool | active-turn highlight (leading dot on the current-turn card) |
| healthState | full · wounded · bloodied · dead | HealthBar fill/alarm — the card background no
  longer tints by health status (removed in the unit-007 restyle); the fill colour change, band
  width, and the bar's `aria-label` are the signal ([[../capabilities/hp]] HP-4) |
| open (expand state) | collapsed · expanded | which triggers/affordances render |

Card layout, leading → trailing:

- **Type dot** — a `size-2 rounded-full` color dot (`aria-hidden`, purely decorative) immediately
  before the name, using the same `typeColor` map as before (unit 021 — replaces the earlier
  type-color stripe block and the now-deleted `typeStripeCount` export;
  [[../capabilities/platform]] PLT-5).
- **Row 1** — the type dot, then name (grows, `flex:1 1 auto`) + a trailing controls cluster holding the expand
  chevron (`.chevron-btn`, a CSS-drawn rotating corner, not a glyph font character) immediately
  next to the per-card `⋮` overflow menu (Edit/Duplicate/Remove) — the chevron is **not** adjacent
  to the name; it sits in that trailing cluster (CBT-2).
- **Row 2** — big HP (`.hp-big`, current/max, tabular figures) inside a fixed-width `.hp-block`
  wrapper (so the health bar's start position never shifts with HP digit count), an inline
  top-right temp-HP badge nested in the HP block when temp HP is carried, and a 4-band health
  bar (`flex:1 1 auto`) that stretches to fill the remaining card width. The HP number and the
  health bar are **one unified interactive target**, no gap between the two as separate
  clickable regions — a single rounded hover/press area (no dead space between them) that opens
  the HP numpad, with a pointer cursor on desktop ([[../capabilities/hp]] HP-4).
- **Row 3** — AC/PD/MD defense stats + an Init pill (`Init N` once set, `Init –` while unset).
  The pill's hover affordance is confined to the pill control itself (no oversized surrounding
  hover box), and the control is sized to the prototype's 24px chip dimension, not the 44px
  touch-target default ([[../capabilities/initiative]] INI-2 — the wrapping `Button` still meets
  the ≥44px hit-area requirement even though the visible pill it contains is smaller). The pill
  has a **fixed width** (72px) so a 1-digit and a 2-digit value render identically wide, a
  **pointer cursor**, and **no `min-height`** on the wrapping control.
- **Condition chips** — filled, full 13th-Age condition name (no icons, no 2-letter codes),
  colour-coded per condition on a shared `.chip` base (round/pill shape). This file states
  *what* renders — full-name filled chips per condition, one colour token each — not the
  `color-mix()` recipe, which is prototype/CSS implementation detail owned by
  `card-prototype.html`.
- **Note line** — renders read-only under the card whenever a note is set, in *both* the
  collapsed and expanded state (`CombatantRow.svelte` ships this; the collapsed state renders a
  read-only `<p>`, the expanded state's existing inline `Textarea` continues to show/edit the
  same note).

**Collapsed vs. expanded:** AC/PD/MD, the Init pill, and the full condition-chip list stay
visible in both states. Collapsing only hides the per-chip `×` (remove) affordance and the
"+ Condition" / "+ Note" triggers.

The type dot (decorative, no label) and the Combats-home `ColorTagDot`'s colour fill are the
color-alone cases flagged by [[../capabilities/platform]] PLT-5 (unit 021 — the type dot carries
no compensating label since type is a cosmetic flag only, CBT-1; the `ColorTagDot` pairs its
color with the title-initial letter).

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
| Combat — Active | advance (chevron `›` glyph; disabled at the round wrap boundary — [[../capabilities/turns-rounds-escalation]] TRE-3) | header-advance icon button |

## Numpad sheet

Bottom sheet (Drawer) on mobile, a centered modal Dialog on desktop (≥1024px — HP-6). Opened by
tapping either the current-HP number or the health bar on the combatant card (both are numpad
triggers, [[../capabilities/hp]] HP-4). Contains, in DOM order: `HpSummaryHeader` (cur/max + temp, shown before entry), `EntryDisplay`
(bordered field), `CommitActions` (Deal Damage / Restore HP / Set Temp HP — rendered *above* the
digit pad; a border+colored-text recipe per action, not the prototype's literal filled
color-mix tint — the filled tint fails WCAG-AA with the shipped token hexes, so all three commit
buttons use the border+colored-text recipe instead, which meets AA in both themes — see
[[../capabilities/hp]] HP-3, [[../capabilities/platform]] PLT-5), `DigitPad` (0–9 bordered digit
buttons + ghost borderless Backspace/Clear glyph buttons, ≥44px targets), `HpLogSection` —
labeled "History" behind a collapsible header with a rotating chevron affordance (collapsed by
default, newest-first when expanded, "No HP changes yet" when empty) → `HpLogEntryRow` (a
colour-coded action chip + signed diff value in the left column, the old→new value transition in
the right column, unaccented).

## Mobile form Drawer/Dialog split (unit 021)

`CombatantForm`, `CombatFormDialog`, and `ConditionPicker` each construct their own
`new MediaQuery('(min-width: 1024px)')` and render a centered Dialog at ≥1024px or a bottom
Drawer below it, sharing one `{#snippet}` body — the same pattern the Numpad sheet already used
(HP-6). `drawer-content.svelte` renders the real `DrawerPrimitive.Handle` (not a decorative
`<div>` grabber), so every mobile Drawer — Numpad, CombatantForm, CombatFormDialog,
ConditionPicker — gets a working swipe-to-close gesture. The shared `Button` primitive's base
class carries `cursor-pointer` app-wide (unit 021).

## Header (Combat screen)

**Setup:** back (leading) · chrome-title · `header-add`("+")/`header-start`(hold-to-start) icon
buttons (desktop) — mobile drops these two for the Setup two-FAB stack instead — ·
`CombatOverflowMenu`(`⋮`, trailing).

**Active:** back (leading) · chrome-title · `header-advance` tonal-circle icon button (desktop
only; mobile uses the advance FAB instead) · `CombatOverflowMenu`(`⋮`, trailing). Round and
escalation-die values render as a `RoundEscBar` sub-bar below the header chrome (both
breakpoints), not inline in a header center slot. Advancing auto-scrolls the newly active row
into view on both breakpoints ([[../capabilities/turns-rounds-escalation]] TRE-2).

The back link's leading chevron sits flush to the content edge (unit 021) — its wrapper carries
`max-w-full` (not `flex-1`), and a `<div class="min-w-0 flex-1">` spacer separates it from the
trailing controls, rather than the link itself stretching to fill the row. Below 1024px, all
three mobile FABs (Advance/Add/Start) suppress their `focus-visible` ring
(`max-lg:focus-visible:ring-0 max-lg:focus-visible:border-transparent`, unit 021); the desktop
focus ring is unaffected.

Undo/Redo are **not** separate header icons on either screen state — they're the top two
`CombatOverflowMenu` items (disabled at their respective stack ends), followed by
Setup → {Clear}; Active → {Add combatant, Restart, Clear}.

## Global chrome placement

`UpdateToast` (via `Toaster`) renders bottom-center, lifted above the FAB/thumb zone.
`InstallBanner` renders as a slim, dismissible top banner. Neither ever overlaps a FAB — Setup
now floats two (Add + Start) instead of the earlier bottom bar — ([[../capabilities/platform]]
PLT-4).

## Combats list row

`CombatRow`: card corner radius is `rounded-card`, matching the combatant card (unit 021 — was
`rounded-[var(--radius)]`). Leading drag handle (`GripVertical`, reorder via svelte-dnd-action,
wired as the drag-handle so drag can **only** start there — CLS-6), color tag (`ColorTagDot`, renders the
title's first letter; fill = picked color), title, description, trailing `⋮` (`CombatRowMenu`:
Edit / Delete). The whole `Card` is both the whole-card hover surface (CLS-1) and the
click-to-open target (CLS-5); the drag handle and the `⋮` menu are excluded from the open-click
(both carry `data-no-open`, guarded by a `closest()` check in the card's click handler) so they
don't also navigate. The active search query is highlighted (`<mark>`) in both the title and the
description wherever it matches, case-insensitively (CLS-9). Desktop populated list renders as a
single column, not a grid.

## shadcn-svelte primitive coverage (reverse index)

| Primitive | Used by |
|---|---|
| Button | IconButton, FAB, DigitPad, CommitActions, DataActions, NavLink, EmptyState CTA, chevron expand button, tonal-circle header icon buttons (header-add/header-start/header-advance), ghost digit buttons (Backspace/Clear) |
| Dialog | CombatFormDialog (desktop), CombatantForm (desktop), NumpadSheet (desktop), ConditionPicker (desktop, unit 021) |
| AlertDialog | ConfirmDialog |
| Sidebar | NavSidebar |
| Sheet | AppHeader burger |
| Drawer | NumpadSheet (mobile), CombatantForm (mobile, unit 021), CombatFormDialog (mobile, unit 021), ConditionPicker (mobile, unit 021) |
| DropdownMenu | CombatRowMenu, CombatOverflowMenu, CombatantCard's per-card `⋮` menu |
| Select | inline language `<Select>` in `settings/+page.svelte` (no dedicated LanguageSwitcher component) |
| RadioGroup / ToggleGroup | ColorSwatchPicker, ConditionPicker, inline theme `<ToggleGroup>` in `settings/+page.svelte` (no dedicated ThemeSwitcher component), Type toggle (CombatantForm, equal-width per-type-colored pills, unit 021) |
| Input | NumberField (+ form fields) |
| Textarea | NoteField |
| Label / Form | CombatFormDialog, CombatantForm, NumberField |
| Card | CombatRow, CombatantCard |
| Badge | condition chips (full-name, filled, colour-coded; all render, removable × when expanded) |
| Collapsible | CombatantCard (collapsed↔expanded), HpLogSection |
| Progress | HealthBar |
| Popover | RoundCounterControl, EscalationDieControl, InitCell (manual-entry, long-press) |
| Sonner (toast) | Toaster / UpdateToast |
| ScrollArea | HpLogSection |
| Tooltip | (a11y labels — optional reinforcement, deferred to build) |
| bespoke (no primitive) | AppShell, ColorTagDot, HealthBar fill, DefenseStats, EntryDisplay, HpSummaryHeader, HpLogEntryRow, InstallBanner, `about/+page.svelte` (inline, no AboutPage component), SearchField |

`HpCell`/`TypeStripe` (compact-row era) had no matching `src/` file (inlined in
`CombatantRow.svelte`); unit E's card restyle (007) shipped without extracting dedicated
components for the card's HP block or type stripe — both stayed inlined in `CombatantRow.svelte`
until unit 021 removed the stripe block entirely, replacing it with a decorative type-color dot
(also inlined, no dedicated component).

## Glyph gaps (not yet in ADR-011)

Flagged, not invented — glyph names are `specs/adr/ADR-011.md`'s to own: menu/burger, edit,
delete/remove, duplicate, close/dismiss, backspace (ghost `‹`), clear (ghost `×`),
expand/collapse chevron (CSS-drawn rotating corner, not a glyph character), drag handle,
settings/about nav icons, theme (system/dark/light), language/globe, reset-all, advance-turn
chevron (`›`).
