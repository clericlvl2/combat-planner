---
categories:
  - "[[Prompts]]"
aliases:
  - Combat Planner Component Inventory
  - Combat Planner Components
  - Combat Planner Component Catalog
related:
  - "[[Combat Planner Overview]]"
  - "[[Combat Planner PRD]]"
  - "[[Combat Planner Rules & Glossary]]"
  - "[[Combat Planner Data Model]]"
  - "[[Combat Planner UX & IA]]"
  - "[[Combat Planner Architecture]]"
  - "[[Combat Planner i18n Message Catalog]]"
---

# Combat Planner — Component Inventory

> The reusable-UI-component catalog: every component each screen/region needs, its hierarchy, its variant/prop matrix, and the **component → shadcn-svelte primitive → Lucide glyph** mapping. Implementation-layer (pairs with [[Combat Planner Architecture]]). **No** control placement (that's [[Combat Planner UX & IA]] §9), behavior/mechanics ([[Combat Planner Rules & Glossary]] / [[Combat Planner Data Model]]), the icon-name map ([[Combat Planner Architecture]] ADR-011), or colors/tokens (ADR-008 / ADR-012) — only pointers to them.

## 1. How to read this doc

- **This doc owns:** the component list, the parent/child hierarchy, the prop/variant matrix, and which primitive + which glyph each component is built from.
- **It points to, never restates:**
  - control location / visibility / trigger → [[Combat Planner UX & IA]] §9.
  - numeric limits & validation → [[Combat Planner Rules & Glossary]] §7.
  - behavior / mechanics / state transitions → [[Combat Planner Rules & Glossary]] / [[Combat Planner Data Model]] §7.
  - the **glyph-name** map (type / chrome / 12 conditions) → [[Combat Planner Architecture]] ADR-011. Glyph cells below reference *which group* in ADR-011, not the names.
  - shadcn-svelte primitive set & Tailwind tokens → [[Combat Planner Architecture]] ADR-008; color-tag swatches → ADR-012.
- **"Builds on"** = the shadcn-svelte primitive(s) (ADR-008) the component composes, or **bespoke** if none fits.
- **Global states (stated once, not repeated per row):** **loading is N/A** app-wide — all reads are synchronous-feeling local IndexedDB (ADR-003), there is no fetch spinner anywhere. **focus** is the global WCAG-AA visible-focus requirement (UX §8) — only component-specific focus notes appear below. **error** surfaces only in forms (validation clamp, Rules §7) and import (fail-safe dialog, Data §10).

## 2. Component hierarchy

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

Shared/reused leaves: **FAB**, **IconButton**, **EmptyState**, **NumberField**, **NoteField**, **ConfirmDialog**, **DropdownMenu**-based menus.

## 3. Global shell & chrome

Mounted once by `AppShell` (SvelteKit root layout, ADR-001); host for the route outlet, nav, and the toast/banner/dialog singletons.

| Component | Purpose | Builds on · glyphs | Props / variants | States |
|---|---|---|---|---|
| AppShell | Root layout; mounts nav, chrome singletons, route outlet | bespoke (Kit layout) | breakpoint ∈ {mobile, tablet, desktop} | default |
| Toaster | Host for transient toasts; renders the **"Update — reload"** toast bottom-center (placement → UX §8) | shadcn **Sonner** | — | default · empty (no toast) |
| UpdateToast | The single SW-update message; action reloads (behavior → ADR-004) | Sonner item · bespoke action | — | default (only when SW waiting) |
| InstallBanner | Slim dismissible top install hint; once + dismissal persisted (`installHintDismissed`, Data §2; behavior ADR-004) | bespoke + **Button** · close glyph **(gap §14)** | — | default · dismissed (hidden) |
| ConfirmDialog | Destructive-action confirm — delete combat, clear, restart, reset-all (the set → UX §8) | shadcn **AlertDialog** | `action` ∈ {delete, clear, restart, resetAll} (copy varies) | default · error N/A |

## 4. Navigation

Destinations are fixed: Combats / Settings / About (UX §2). Placement per breakpoint → UX §9 / §2.

| Component | Purpose | Builds on · glyphs | Props / variants | States |
|---|---|---|---|---|
| NavSidebar | Mobile swipe-in nav | shadcn **Sidebar** (built-in mobile-sheet behavior) → NavLink | open \| closed | default · open · closed |
| AppHeader | Tablet/desktop top bar; burger (tablet) collapses to Sheet, inline links (desktop) | bespoke + **Button** · burger/menu glyph **(gap §14)** | mode ∈ {burger, inline} | default |
| NavLink | One nav destination row/link + active route marker | **Button** (ghost) · per-destination glyphs **(settings/about gaps §14)** | active (current route) | default · active · focus |

## 5. Combats (home)

The combats list + its create/edit/import surface (UX §3). Row actions live in a per-row `⋮` (placement/visibility → UX §9).

| Component | Purpose | Builds on · glyphs | Props / variants | States |
|---|---|---|---|---|
| CombatList | Vertical, drag-reorderable list of combats (reorder via ADR-006) | bespoke + **svelte-dnd-action** → CombatRow | — | default · empty |
| CombatRow | One combat: color tag, title, description, `⋮`; opens the combat on tap | bespoke + **Card** + dnd handle · drag-handle glyph **(gap §14)** | colorTag (8 keys → ADR-012); dragging | default · dragging · focus |
| ColorTagDot | Swatch reflecting a combat's `colorTag` (reinforces title, never color-alone → ADR-012) | bespoke (token-driven, ADR-012) — not a glyph | colorTag ∈ 8 keys (default Neutral) | default |
| CombatRowMenu | The row `⋮`: Edit · Export-share · Delete (Delete → ConfirmDialog) | shadcn **DropdownMenu** · overflow + export glyphs → ADR-011; edit/delete glyphs **(gap §14)** | — | default |
| FAB(create) | Create-combat trigger (blocked at 100 → Rules §7); see shared **FAB** (§7) | (shared) · add glyph → ADR-011 | disabled at cap | default · disabled |
| ImportControl | Single-combat import → new copy; fail-safe (Data §10) | **Button** + hidden file input · import glyph → ADR-011 | — | default · error (refused import → ConfirmDialog/toast) |
| EmptyState | "Create your first combat" hint + CTA (only when all deleted; never first-launch — UX §3) | bespoke + **Button** | message + CTA label (reused, §7) | default |
| CombatFormDialog | Create/edit-combat form: Title, Description, Color tag | shadcn **Dialog** + **Form** + **Input** + **Textarea** + **Label** → ColorSwatchPicker | mode ∈ {create, edit} | default · error (name required → UX §8) |
| ColorSwatchPicker | Pick one of the 8 preset swatches (palette → ADR-012) | shadcn **RadioGroup** / ToggleGroup (token swatches) | selected key ∈ 8 | default · focus |

## 6. Combat — header (both states)

One bar across Setup and Active; round/escalation appear **Active only** (visibility → UX §9, Data §3 `showRoundAndEscalation`).

| Component | Purpose | Builds on · glyphs | Props / variants | States |
|---|---|---|---|---|
| CombatHeader | Top-bar container; lays out back · undo/redo · round · escalation · `⋮` | bespoke | state ∈ {setup, active} (gates round/escalation) | default |
| IconButton | Generic icon-only action button — back, undo, redo | **Button** (ghost, size=icon) · back/undo/redo glyphs → ADR-011 chrome | `action`; disabled (undo/redo at its stack end → Data §8) | default · disabled · focus |
| RoundCounterControl | Show round; tap → numeric edit (1–99 → Rules §7); never touches escalation (fully decoupled — Rules §3). **Active only** | bespoke + **Popover**/Dialog + NumberField | — | default · editing · disabled N/A |
| EscalationDieControl | Show escalation 0–6; tap → set directly (Rules §3, no auto/override concept). **Active only** | bespoke + **Popover** | — | default · editing |
| CombatOverflowMenu | Header `⋮`: **Setup** → {Clear}; **Active** → {Add combatant, Restart, Clear} (items/placement → UX §9) | shadcn **DropdownMenu** · overflow + add glyphs → ADR-011 | state ∈ {setup, active} (drives item set) | default |

## 7. Combat — Setup & Active bodies

The combatant list is shared by both states (sorted by initiative, Rules §2); the floating controls differ. Placement/visibility of every control → UX §9.

| Component | Purpose | Builds on · glyphs | Props / variants | States |
|---|---|---|---|---|
| CombatantList | Vertical roster; **Active** = live-sorted by initiative; **Setup** = add order, no live sort (Rules §2); auto-scrolls active row into view (Active) | bespoke → CombatantRow | state ∈ {setup, active} | default · empty |
| FAB | Floating bottom-right action (shared): **add** (Setup), **advance** (Active), **create** (Combats) | **Button** (rounded, size=icon) · add / advance glyphs → ADR-011 chrome | `action` ∈ {add, advance, create}; disabled (advance at r99→r100 wrap → Rules §2 / Data §3 `canAdvance`) | default · disabled |
| StartBar | Full-width pinned bar; one-tap Start (transition → Rules §2). Hidden when roster empty (visibility → UX §9) | bespoke + **Button** | — | default · hidden (empty roster) |
| JumpToTurnButton | On-demand float to scroll the active row back into view (appears only when it's off-screen → UX §9) | **Button** · jump glyph → ADR-011 chrome | — | default · hidden (active row visible) |
| EmptyState | "Add your first combatant" (empty Setup roster — UX §4a/§6); reused from §5 | bespoke + **Button** | message + CTA label | default |

## 8. Combatant row

The densest component (UX §4c). One row per combatant, toggling **compact ↔ expanded** on tap (Collapsible). Child of CombatantList.

### 8a. Row variant / prop matrix

| Prop | Values | Drives | Source of truth |
|---|---|---|---|
| type | PC · enemy · ally | TypeStripe color + stripe count (visual only) | Rules §1, UX §4c; colors ADR-008/012 |
| active | bool | active-turn highlight | Data §3 `activeCombatantId` |
| healthState | full · wounded · bloodied · dead | HealthBar fill + alarm/reverse bar; also drives the card background tint (UX §4c) | Rules §4 (thresholds + reverse bar) |
| display | compact · expanded | which children render | UX §4c |

### 8b. Sub-components

| Component | Purpose | Builds on · glyphs | Props / variants | States |
|---|---|---|---|---|
| CombatantRow | The row container; compact↔expanded toggle; card background tints by HP status (UX §4c); hosts all cells below | bespoke + **Collapsible** + **Card** | type · active · healthState · display (matrix above) | default · active · dead · expanded · focus |
| TypeStripe | Leading-edge color stripe(s) — count + color are the signal (deliberate color-alone exception → UX §4c/§8) | bespoke (token-driven, no primitive) | type ∈ {PC (2, green), enemy (1, red), ally (1, blue)} | default. *a11y:* `aria-label` on the stripe container names the type |
| CombatantRowMenu | Persistent compact-row `⋮`: Edit · Duplicate · Remove (Remove destructive); visible collapsed or expanded (replaces the old expanded-only RowActions row) | shadcn **DropdownMenu** · overflow/edit/duplicate/remove glyphs — gaps §13 | — | default |
| InitCell | Initiative value or "-"; tap = roll, long-press = manual (behavior → Rules §2) | bespoke + **Button** → InitEntry | value \| "-" (unrolled) | default · unrolled · editing. *a11y:* distinguish roll vs manual (UX §8) |
| InitEntry | Long-press manual entry (range → Rules §7); no sign toggle — native minus-key entry | shadcn **Popover** + NumberField | — | default · focus |
| HpCell | current/max HP display; tap opens the numpad (→ §9) | bespoke + **Button** | — | default · focus |
| HealthBar | HP bar incl. the **reverse/alarm** dead bar (thresholds → Rules §4; alarm tokens → ADR-008) | bespoke + **Progress** (or custom fill) | healthState ∈ 4 | default · dead (reverse). *a11y:* status not color-alone, label backup (UX §8) |
| DefenseStats | AC / PD / MD shown in-row at all sizes (read-only; values → Rules §5/§7) | bespoke | — | default |
| ConditionIconList | Compact: first few condition icons + a **"+K" overflow chip**; expanded: each chip gains a removable **×** (UX §4c) | bespoke + **Badge** (chip) · condition glyphs → ADR-011; close glyph → ADR-011 chrome | conditions set; overflow count K; removable (open state) | default · empty (no conditions) |
| ConditionPicker | Expanded: the 12 preset condition toggles (toggle membership → Data §7; set 0..12 → Data §5) | shadcn **ToggleGroup** (multi) · condition glyphs → ADR-011 | selected ⊆ 12 | default · focus |
| TempHpField | Expanded: shows temp HP (the buffer; not on the compact row — UX §4c). Set via numpad (Rules §4) | bespoke | — | default |
| NoteField | Expanded: inline note edit or "add note" (≤250 → Rules §7); reused in the form | shadcn **Textarea** | empty ("add note") \| filled | default · empty · error (over cap → UX §8) |

## 9. Numpad sheet (HP)

Bottom sheet on mobile, positioned panel/modal on desktop (UX §7). Opened from `HpCell`. Commit behavior → Rules §4 / Data §7; the **HP log is read-only** and distinct from Undo (Data §9).

| Component | Purpose | Builds on · glyphs | Props / variants | States |
|---|---|---|---|---|
| NumpadSheet | The container; renders summary, entry, pad, commits, history; dismiss with no-op (UX §4c) | shadcn **Drawer** (mobile bottom-sheet) / **Dialog** (desktop panel) | breakpoint variant | default |
| HpSummaryHeader | Shows cur/max + temp at top (so the DM sees the buffer before committing — UX §4c) | bespoke | — | default |
| EntryDisplay | Running entry readout | bespoke | empty \| has-digits | default · empty (commit = no-op) |
| DigitPad | 0–9 grid + backspace + clear (≥44px targets) | bespoke grid + **Button** · backspace/clear glyphs **(gap §14)** | — | default. *a11y:* labeled numpad keys (UX §8) |
| CommitActions | **Deal Damage** · **Restore HP** · **Set Temp HP** (semantics → Rules §4; colors → ADR-008) | **Button** (variant: destructive=damage, etc.) | — | default · disabled (empty entry → no-op) |
| HpLogSection | Collapsible **History** of this combatant's HP log, newest first; read-only (model → Data §9) | shadcn **Collapsible** + **ScrollArea** → HpLogEntryRow · expand/collapse glyph **(gap §14)** | open \| closed | default · empty ("No HP changes yet") |
| HpLogEntryRow | One log line: type · amount · cur/max + temp · round ("—" if Setup) (shape → Data §9) | bespoke | type ∈ {Damage, Heal, Set temp HP, Set Max HP} | default |

## 10. Forms & shared fields

The add/edit-combatant form (fields, defaults, limits → Rules §7). The same form, pre-filled, edits an existing combatant and adds a manual-initiative field (Rules §7 / Data §7 `editCombatant`).

| Component | Purpose | Builds on · glyphs | Props / variants | States |
|---|---|---|---|---|
| CombatantFormDialog | Add/edit a combatant; all fields + limits → Rules §7 | shadcn **Dialog** + **Form** + **Label** → NumberField, TypeSelect, NoteField, InitEntry | mode ∈ {add, edit} (edit adds manual-init field) | default · error (name required / clamp hints → UX §8) |
| TypeSelect | PC / enemy / ally selector (default enemy → Rules §7) | shadcn **Select** / RadioGroup | value ∈ {PC, enemy, ally} | default · focus |
| NumberField | Numeric input with native `min`/`max` attrs + clamp-on-commit + inline hint (ranges → Rules §7); reused for HP/AC/PD/MD/bonus/init/round | shadcn **Input** + **Label** | `field` (sets range) | default · error (clamp hint) · focus |
| NoteField | Note editor ≤250 (reused in expanded row, §8) | shadcn **Textarea** | empty \| filled | default · empty · error (over cap) |

## 11. Settings & About

Grouped vertical settings list (UX §9 Settings) and the static About page.

| Component | Purpose | Builds on · glyphs | Props / variants | States |
|---|---|---|---|---|
| SettingsGroup | A labeled settings section — Appearance · Data · About | bespoke + **Card** + **Separator** | group label | default |
| LanguageSwitcher | Pick UI language (6 bundled → ADR-005) | shadcn **Select** · globe glyph **(gap §14)** | value ∈ {en,de,es,fr,ja,ru} | default · focus |
| ThemeSwitcher | system / dark / light (Data §2) | shadcn **RadioGroup** / ToggleGroup · theme glyphs **(gap §14)** | value ∈ {system, dark, light} | default · focus |
| DataActions | Export all · Import all · **Reset all** (Reset → ConfirmDialog; semantics → Data §10) | **Button** · export/import glyphs → ADR-011; reset glyph **(gap §14)** | — | default · error (failed import → fail-safe, Data §10) |
| AboutPage | Static: what the app is, version, privacy note (UX §1) | bespoke | — | default |

## 12. shadcn-svelte primitive coverage (reverse index)

Which ADR-008 primitives the catalog draws on, and the components that use each. New components should reach for an existing primitive before going bespoke.

| Primitive (ADR-008) | Used by |
|---|---|
| Button | IconButton, FAB, StartBar, JumpToTurnButton, DigitPad, CommitActions, DataActions, NavLink, EmptyState CTA, ImportControl |
| Dialog | CombatFormDialog, CombatantFormDialog, NumpadSheet (desktop) |
| AlertDialog | ConfirmDialog |
| Sidebar (app nav) | NavSidebar |
| Sheet (side panel) | AppHeader burger |
| Drawer (bottom sheet) | NumpadSheet (mobile) |
| DropdownMenu | CombatRowMenu, CombatOverflowMenu, CombatantRowMenu |
| Select | TypeSelect, LanguageSwitcher |
| RadioGroup / ToggleGroup | ColorSwatchPicker, ConditionPicker, ThemeSwitcher |
| Input | NumberField (+ form fields) |
| Textarea | NoteField |
| Label / Form | CombatFormDialog, CombatantFormDialog, NumberField |
| Card | CombatRow, CombatantRow, SettingsGroup |
| Badge | ConditionIconList (+K chip, removable × when expanded) |
| Collapsible | CombatantRow (compact↔expanded), HpLogSection |
| Progress | HealthBar |
| Popover | RoundCounterControl, EscalationDieControl, InitEntry |
| Sonner (toast) | Toaster / UpdateToast |
| ScrollArea | HpLogSection |
| Separator | SettingsGroup |
| Tooltip | (a11y labels — optional reinforcement, deferred to build) |
| bespoke (no primitive) | AppShell, ColorTagDot, TypeStripe, HealthBar fill, DefenseStats, EntryDisplay, DigitPad grid, HpSummaryHeader, HpLogEntryRow, InstallBanner, AboutPage |

## 13. Glyph gaps — flagged for ADR-011

ADR-011's firm **chrome** map covers: back, undo, redo, advance, overflow, add, jump-to-turn, import, export/share (plus type ×3 and the 12 conditions). The components above also need these chrome glyphs, which are **not yet in ADR-011** — flagged here, not invented (glyph names are ADR-011's to own):

- **menu / burger** — AppHeader (tablet).
- **edit** — CombatRowMenu, CombatantRowMenu.
- **delete / remove** — CombatRowMenu, CombatantRowMenu.
- **duplicate** — CombatantRowMenu.
- **close / dismiss** — InstallBanner, ConditionIconList (removable chip ×).
- **backspace** and **clear** — DigitPad / EntryDisplay.
- **expand / collapse chevron** — HpLogSection (History toggle), and possibly CombatantRow.
- **drag handle** — CombatRow (reorder, ADR-006).
- **settings · about** — NavLink destinations.
- **theme** (system/dark/light) — ThemeSwitcher.
- **language / globe** — LanguageSwitcher.
- **reset-all** — DataActions.

→ Resolve by extending the **chrome** group in [[Combat Planner Architecture]] ADR-011 (and its `icons.ts` map) during the UI build; non-blocking, like the condition-glyph tuning noted there.

## 14. State coverage

Per-component states above tie back to the real states in [[Combat Planner UX & IA]] §4 and the §6 coverage table:

- **empty** — CombatList (all deleted → EmptyState), CombatantList (empty Setup → EmptyState), ConditionIconList (no conditions), HpLogSection ("No HP changes yet"), NoteField ("add note"), EntryDisplay (no digits → commit is a no-op).
- **disabled** — IconButton (undo/redo at stack end, Data §8), FAB (advance at the r99→r100 wrap, Data §3 `canAdvance`), CommitActions / create FAB (no-op / at cap).
- **active highlight** — CombatantRow (`active`), NavLink (current route).
- **dead / alarm** — HealthBar reverse bar (Rules §4).
- **error** — only forms (name required, clamp hints → UX §8) and import (fail-safe → Data §10 / ConfirmDialog).
- **loading** — **N/A** everywhere (local IndexedDB, no fetch UI — §1).
- **focus** — global WCAG-AA visible focus on all interactive components (UX §8); component-specific focus notes are inline above.
