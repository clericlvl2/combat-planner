---
status: approved
backlog: —
---

# Change: compact-card-dims

## Why

The combatant card is taller than its content needs — ~136px desktop / ~148px mobile collapsed,
driven by two 44px interactive rows — so few combatants fit on screen mid-fight. A design
sandbox compared 8 compact layouts against the shipped baseline; the user picked **V1 "tuned
dims"**: keep the shipped 4-row layout and field set exactly as is, shrink dimensions only.
Lowest-risk compaction: no layout restructure, no spec-behavior change.

Target dims (V1):

| Dim | Now | Target | Where owned |
|-----|-----|--------|-------------|
| Card padding `--card-pad` | 12px | 10px | `specs/design/tokens.css` |
| HP figure `--hp-size` | 18px | 16px | `specs/design/tokens.css` |
| Desktop icon buttons (chevron, `⋮`) | 32px (`lg:size-8`) | 28px (`lg:size-7`) | `CombatantRow.svelte` |
| HP-row min-height, desktop | 44px (`min-h-11`) | ≤32px | `CombatantRow.svelte` |
| Card chip height (init pill, condition chips, `+ Condition`/`+ Note` triggers) | 24px (`h-6`) | 22px | `CombatantRow.svelte` / `InitCell.svelte` / `ConditionIconList.svelte`, `.chip` recipe in `card-prototype.html` |

Mobile keeps today's 44px visible touch rows (PLT-2 floor; adjacent chevron/`⋮` make invisible
hit-area expansion overlap-prone) — mobile saves only the padding/font/chip deltas (~10px);
desktop saves ~25px per card. Expected result ≈ 110px desktop / ~138px mobile collapsed.

## What changes

By capability-spec ID:

| ID | Change |
|----|--------|
| `CBT-2` | amend: compact-dim values for the card (pad 10 / HP 16 / desktop controls 28 / desktop HP-row ≤32 / chips 22); field set, row order, and all existing ACs unchanged |
| `PLT-2` | no requirement change — ≥44px touch targets on mobile explicitly preserved (desktop-only shrink for interactive rows) |

Reference/design-source files updated alongside: `specs/design/tokens.css` (`--card-pad`,
`--hp-size`), `specs/design/card-prototype.html` + `specs/design/prototype.html` (non-tokenized
literals: `.chip` height, `.icon-btn` size), `specs/reference/component-inventory.md` (card-dim
prose + the `--card-pad`/`--hp-size` "synced to shipped" exception note — values change, note
may now collapse since prototype and app re-converge).

## Acceptance criteria

- [ ] `specs/design/tokens.css`: `--card-pad: 10px` and `--hp-size: 16px`; no other token value
      changes in the diff.
- [ ] `CombatantRow.svelte`: chevron and `⋮` buttons render 44px on mobile (`size-11` retained)
      and 28px at `lg` (`lg:size-7` or equivalent); the two remain the same size as each other
      (CBT-2 AC intact).
- [ ] `CombatantRow.svelte`: the unified HP tap row keeps `min-h-11` (44px) below `lg` and
      renders ≤32px tall at `lg`; it remains a single unified target opening the numpad
      ([[hp]] HP-4 ACs intact).
- [ ] Card chips (init pill, condition chips, `+ Condition`/`+ Note` triggers) render 22px tall
      in the app; the `.chip` recipe in `specs/design/card-prototype.html` matches (24 → 22).
      The init pill keeps fixed width / pointer cursor / no `min-height` ([[initiative]] INI-2
      ACs intact).
- [ ] Card row structure and field set are unchanged: same 4 rows in the same order, every
      CBT-2-listed field still visible collapsed; no field moves between rows.
- [ ] Every interactive card target still measures ≥44px on the touch axis below `lg`
      (chevron, `⋮`, HP row, init-pill hit wrapper) — PLT-2 AC intact.
- [ ] `specs/design/prototype.html` and `card-prototype.html` still render the card with the new
      dims (token import carries `--card-pad`/`--hp-size`; literal chip/icon dims updated in
      both prototypes' CSS).
- [ ] `npm run gate` passes.

## Out of scope

- Any layout restructure from the other sandbox options (V2–V8): row merges, bottom-edge health
  strip, HP-in-bar, single-line mode, condition dots, chevron removal.
- Shrinking mobile visible touch controls below 44px (no invisible hit-area technique).
- HealthBar track height (stays 8px), expanded-state content (Textarea, pickers), temp-HP badge
  dims (`--badge-width` unchanged).
- Any behavior change: expand/collapse, numpad, initiative roll/lock, conditions, menus.
- Other screens/components: `CombatantForm`, `CombatRow` (combats home), headers, settings.
- i18n, tests beyond what the gate already runs, new tokens.
