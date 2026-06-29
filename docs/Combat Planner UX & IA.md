---
categories:
  - "[[Prompts]]"
aliases:
  - Combat Planner UX & IA
related:
  - "[[Combat Planner PRD]]"
  - "[[Combat Planner Rules & Glossary]]"
  - "[[Combat Planner Data Model]]"
  - "[[Combat Planner Component Inventory]]"
  - "[[Combat Planner i18n Message Catalog]]"
  - "[[Combat Planner Test Plan]]"
  - "[[Combat Planner Requirements Prompt]]"
---

# Combat Planner — UX & Information Architecture

> Page map, navigation, screen states, key flows, responsive behavior, and empty/undo/error states. **No visual design or component-library choices** — layout intent only. Pairs with [[Combat Planner PRD]] (stories), [[Combat Planner Rules & Glossary]] (rules), [[Combat Planner Data Model]] (state).

## 1. Page map

```
App
├── Combats (home)
│   └── Combat (detail)   ← Setup or Active state
├── Settings
└── About
```

- **Combats** — list of all combats; create/edit/delete/reorder; entry point to a Combat.
- **Combat** — the tracker. Two states: **Setup** (build the encounter) and **Active** (run turns).
- **Settings** — language, theme, export/import all, reset all.
- **About** — what the app is, version, privacy note (data is local-only).

## 2. Navigation

| Breakpoint | Nav pattern |
|-----------|-------------|
| Mobile | Swipe right reveals a sidebar with nav links. Floating control buttons bottom-right for the screen's primary actions. |
| Tablet | Header with burger menu. |
| Desktop | Header with inline navigation links. |

Nav destinations: Combats, Settings, About. **Non-first launch lands on Combats home.** First launch auto-creates an empty combat (Setup) and opens it.

## 3. Screen: Combats (home)

- Vertical list; each row: color tag, title, description, and a **per-row overflow `⋮`** at the trailing edge. Tap a row → opens that Combat.
- **Row `⋮` menu** = the single-combat actions: **Edit**, **Export / share**, **Delete**. (Avoids swipe-gesture clashes with the swipe-right nav and works identically on touch + desktop.)
- Drag to reorder; new combats inserted at top.
- **Create combat** → create form; **blocked at 100 combats** with a message.
- **Import combat** (single combat) → **always imported as a new copy** (new id, suffixed title; never overwrites), the counterpart to row `⋮` **Export / share**; fail-safe (corrupt / newer-version / over-cap refused, nothing partial). Import-**all** lives in Settings → Data.
- Create/edit form fields: Title, Description, Color tag (preset swatch palette).
- Delete combat (from the row `⋮`) → confirmation dialog (permanent, not undoable — it's outside the per-combat Undo history).
- **Empty state:** never truly empty after first launch. If all are deleted, show a hint + "Create your first combat".

## 4. Screen: Combat

### 4a. Setup state (combat inactive)

- Build the encounter: **Add combatant**, edit, remove, duplicate, set/roll initiative. List auto-sorts live by initiative.
- **No** active-turn highlight, **no** Advance, **no** round counter, **no** escalation die.
- Layout intent: **Add combatant** is a bottom-right FAB (repeated while building); **Start** is a **full-width bar pinned to the bottom edge** with the Add FAB floating just above it, **hidden while the roster is empty** (only the "Add your first combatant" hint shows). Controls / containers / visibility per state: §9.

### 4b. Start (the transition)

One tap: auto-rolls initiative for every still-unrolled combatant (d20 + bonus) → re-sorts → combat becomes **Active** → top of order highlighted as active → Advance, round counter (Round 1), and escalation die (0) appear.

### 4c. Active state (running)

**Advance turn = the primary Active action, a bottom-right FAB** — in the thumb zone, since it is the most-repeated control in live play (the header holds the low-frequency round/escalation/undo controls). Only the round-99 → round-100 wrap is blocked (advancing within round 99 still works); at that point the FAB is disabled. (Full control / container / visibility matrix: §9.)

**Combatant list:** vertical, sorted by initiative (Rules §2). Active combatant visibly highlighted. Each **Advance auto-scrolls the active combatant into view**; if the DM scrolls away so the active row is off-screen, an **on-demand floating "jump to turn" button** appears to scroll back to it.

**Combatant row — compact (default):** active indicator · type color/icon · name · initiative · current/max HP · health bar · **AC/PD/MD in-row (all sizes)** · condition icons (first few + "+K" overflow). Tapping HP opens the **numpad panel**.

**Combatant row — expanded (on tap):** adds temp HP · text note (inline edit, ≤250) or "add note" · condition picker (12 presets, toggle) · duplicate · remove · edit (full form).

**Type color/icon (visual only).** Each of the three combatant types gets its own distinct color + icon so the DM can eyeball who's who at a glance; it never changes fields, ordering, or behavior:
- **PC** — player character — **blue + person icon**.
- **monster** — enemy (default) — **red + enemy icon**.
- **ally** — DM-run friendly NPC (DM tracks its HP) — **green + shield icon**.

These three colors must meet WCAG AA contrast in **both** themes and must never be conveyed by color alone — the icon is the real signal (color is reinforcement). The type carries no side/grouping semantics; it is purely this visual tag.

### Initiative interactions (Setup and Active)

- **Tap** the init cell → roll d20 + bonus for that one (re-tap re-rolls).
- **Long-press** the init cell → manual numeric entry with a +/− sign toggle (re-edit existing value; negatives down to −99). Also available as a field in the edit form (discoverability backup).
- List re-sorts on commit.

### Numpad panel (HP)

- Opens from tapping a combatant's HP.
- **Shows the combatant's current HP / Max HP and temp HP at the top** of the sheet, so the DM can see the buffer being drained (temp HP is not on the compact row) before committing.
- Digit pad + backspace/clear; a running entry display.
- Three commit actions: **Deal Damage** (red), **Restore HP** (green), **Set Temp HP**.
- Behavior follows the HP rules in [[Combat Planner Rules & Glossary]] §4 (damage drains temp first, heal never reduces, set temp replaces). Empty entry = no-op. Closes on commit; the change is pushed to the combat's **Undo history** (no toast — recover via the header Undo ↶).
- **HP change log (read-only):** a **History** section/toggle in the sheet reveals this combatant's per-combatant HP change log — newest first, each line showing the action (Damage / Heal / Set temp HP / Set Max HP), the amount, the resulting cur/max + temp, and the round ("—" if it happened in Setup). It is **view-only** (no editing, no undo here — that's the header Undo ↶); the digits/commit actions stay the primary content and the History list is scrollable within the sheet. Empty state: a quiet "No HP changes yet". *(This passive per-combatant log is separate from the combat-level Undo/Redo; see [[Combat Planner Data Model]] §9.)*
- **Dismiss without committing:** tap outside the panel or a **Cancel** control → closes with no change and no toast (abandons any partial entry).

### Turn, round & escalation (Active)

- **Advance:** highlights next in order; wrap → round +1, escalation recompute; only the round-99 wrap is blocked (advancing within round 99 still works).
- **Edit round:** tap the counter → 1–99 → escalation recompute (unless overridden).
- **Override escalation:** tap the die → set/reset 0–6 or return to auto.
- **Restart:** keep roster, reset init/HP/temp/conditions, round→1, override cleared → back to Setup. Confirmation; **undoable** via the header Undo (a roster snapshot is pushed).
- **Clear combat:** wipe all combatants → empty Setup. Confirmation; **undoable** via the header Undo (a roster snapshot is pushed).
- **Remove active combatant:** turn moves to next in order (or new last if it was last); no premature round increment. Removing all → reverts to Setup.

## 5. Key flows (★ = decision point / guard)

**F1 — Run a fight:** open combat (Setup) → add combatants → roll some by tap / set some by long-press (live sort) → **Start** ★ (auto-rolls the rest, activates, top = active, round 1) → advance turns, deal damage via numpad, toggle conditions → wrap rounds (escalation climbs) → **Clear** or **Restart** when done.

**F2 — Add mid-combat:** add during Active → appears "-" at bottom, active unchanged → set its initiative → re-sort → active stays same identity.

**F3 — Fix a mistake:** wrong damage → tap header **Undo ↶** → HP restored (clamped to current Max HP). Accidental remove → **Undo ↶** → combatant + turn pointer restored. Over-undid? **Redo ↷**. The history is per-combat, 10 deep, and covers HP, removal, turns, conditions, edits, and even Clear/Restart.

**F4 — Re-run the same enemies:** finish fight → **Restart** ★ → roster kept, all reset to Setup → Start again.

**F5 — Prep on tablet, run on phone:** build combat on tablet → export single combat → open file on phone → **import as new copy** → run. ★ Over-cap / corrupt / newer-version import is refused with a message.

## 6. State coverage (per screen)

| State | Combats | Combat |
|-------|---------|--------|
| Empty | hint + create CTA | Setup: "Add your first combatant" |
| Setup | — | roster + init, Start button, no round/escalation/Advance |
| Active | — | sorted list, active highlight, round + escalation + Advance |
| First launch | — | auto-created empty combat (Setup), opened directly |
| Subsequent launch | landed here | — |
| Cap reached | create blocked (100) | add blocked (30) |
| Destructive confirm | delete combat (not undoable) | Restart, Clear combat (confirm + undoable) |
| Undo affordance | — | header Undo ↶ / Redo ↷ (per-combat, 10 deep) |
| Offline | full function (silent) | full function (silent) |
| Update available | toast: "Update — reload" | same |

## 7. Responsive behavior

- **Mobile-first.** Single-column. Floating bottom-right controls. Sidebar via swipe. Numpad as a bottom sheet within thumb reach. AC/PD/MD shown compactly in-row.
- **Tablet.** More horizontal room for the in-row stats + expanded rows; header + burger.
- **Desktop.** Header with inline nav; roomy rows; numpad as a positioned panel/modal.
- Touch targets ≥44px in all modes; layout reflows without hiding any feature.

## 8. Feedback, errors, accessibility

- **Confirmations:** delete combat, clear combat, restart, reset all.
- **Undo / Redo:** a per-combat history (last 10 reversible actions) via header **Undo ↶ / Redo ↷** buttons (no toasts); Delete-combat and Reset-all are confirm-only (outside one combat). Full model: [[Combat Planner Data Model]] §8.
- **HP change log (≠ Undo):** a separate, **read-only per-combatant** record of HP-changing events, viewed from the **History** section of the HP numpad sheet (§4c). Full model: [[Combat Planner Data Model]] §9.
- **Toast/hint placement:** the **"update available — reload"** toast appears **bottom-center** (lifted above the FAB / thumb zone); the **install hint** is a slim dismissible **top banner** (kept clear of the bottom controls). Toasts never overlap the FAB or Start bar.
- **Validation:** numeric fields **clamp** to the limits in [[Combat Planner Rules & Glossary]] §7 on commit with a brief inline hint; name is required (whitespace-only blocks submit); note hard-capped at 250 chars on input.
- **Caps:** adding a 31st combatant or a 101st combat is blocked with a message; import refused if it would exceed 100.
- **Import feedback:** show what's being imported; single-combat = new copy; **fail-safe** — corrupt/newer-version/over-cap refused, nothing partially applied, existing data untouched.
- **PWA:** subtle install hint when the platform reports installability (once, dismissible, dismissal persisted); "update available" toast; offline is silent (no nag).
- **Accessibility:** WCAG 2.1 AA basics — contrast in both themes (incl. the reverse/alarm HP bar), visible focus, semantic labels (numpad keys, condition toggles, init cell roll vs manual, turn/Start/Undo/Redo controls, row `⋮` menus), scalable text, color tags/health states not conveyed by color alone (icon/label backup).

## 9. Control surface map

Single source of truth for **which control exists, where it lives, when it's visible, and how it's triggered**. Containers: **header** (top bar), **FAB** (floating action button, bottom-right), **bottom bar** (full-width pinned), **`⋮`** (overflow menu), **row** / **expanded row**, **sheet/panel** (numpad), **toast/banner**.

### Combats (home)
| Control | Container | Visible when | Trigger |
|---|---|---|---|
| Create combat | FAB (mobile) / header (tablet-desktop) | always (blocked at 100) | tap |
| Import combat (single, → new copy) | secondary action: header/inline (desktop-tablet) · near Create / nav (mobile) | always (refused if over-cap / corrupt / newer-version) | tap → file picker |
| Open a combat | row | always | tap row |
| Reorder combats | row | always | drag |
| Edit / Export-share / Delete a combat | row **`⋮`** | always | tap `⋮` → item (Delete → confirm) |
| "Create your first combat" | center hint | all deleted | tap |

### Combat — header (both states)
| Control | Container | Visible when | Trigger |
|---|---|---|---|
| Back to Combats | header `←` (top-left) | always on a Combat | tap |
| Undo ↶ / Redo ↷ | header | always; each disabled at its stack end | tap |
| Round counter (edit) | header | **Active only** | tap |
| Escalation die (override/reset) | header | **Active only** | tap |
| Overflow `⋮` | header | always | tap → menu |
| ↳ `⋮` items — **Setup** | `⋮` | roster non-empty | **Clear** |
| ↳ `⋮` items — **Active** | `⋮` | Active | **Add combatant**, **Restart**, **Clear** |

### Combat — Setup body
| Control | Container | Visible when | Trigger |
|---|---|---|---|
| Add combatant | **FAB** | Setup | tap |
| Start | **bottom bar** (FAB floats above it) | Setup, roster non-empty (hidden if empty) | tap |
| Roll / set initiative | row init cell | always | tap / long-press |
| Expand a combatant | row | always | tap row |
| "Add your first combatant" | center hint | empty roster | tap (→ Add) |

### Combat — Active body
| Control | Container | Visible when | Trigger |
|---|---|---|---|
| Advance turn | **FAB** (bottom-right, thumb zone) | Active (disabled at the r99 → r100 wrap) | tap |
| Add combatant | header **`⋮`** (the Active FAB is Advance, not Add) | Active | tap `⋮` → Add |
| Jump to active turn | floating button (above the Advance FAB) | Active **and** active row off-screen | tap (also auto-scroll on Advance) |
| HP edit | row HP cell | always | tap → numpad |
| Expand a combatant | row | always | tap row |

### Combatant — expanded row (both states)
| Control | Trigger |
|---|---|
| Temp HP · note (≤250) · condition picker (12) · duplicate · remove · edit (full form) | tap each |

### Numpad sheet (HP)
| Control | Trigger |
|---|---|
| Digits · backspace · clear | tap |
| Deal Damage · Restore HP · Set Temp HP | tap (commits → Undo history) |
| **HP change log** (read-only history; "No HP changes yet" when empty) | tap **History** toggle to expand/collapse |
| Cancel (no commit) | tap outside / Cancel |

### Settings
Grouped vertical list:
- **Appearance** — language switcher, theme (system / dark / light).
- **Data** — Export all, Import all, **Reset all** (→ confirm; not undoable).
- **About** — link to the About page.

### Global / chrome
| Surface | Placement |
|---|---|
| Nav (Combats / Settings / About) | mobile: swipe-right sidebar · tablet: burger · desktop: inline header |
| "Update available — reload" toast | bottom-center, lifted above FAB/thumb zone |
| Install hint | slim dismissible top banner (once; dismissal persisted) |

### Responsive notes
Control placement per breakpoint follows §7 Responsive behavior. Control-specific note: on desktop **no FAB is needed**, but the same control set stays reachable from header/inline; no control is hidden at any breakpoint.
