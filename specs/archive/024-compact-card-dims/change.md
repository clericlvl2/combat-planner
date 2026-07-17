---
status: archived
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
| Card chip height (init pill, condition chips, `+ Condition`/`+ Note` triggers) | 24px (`h-6`) | 22px | `CombatantRow.svelte` / `InitCell.svelte` / `ConditionIconList.svelte` |
| Mobile touch rows (chevron/`⋮` buttons, HP row) | 44px (`size-11` / `min-h-11`) | 40px (`size-10` / `min-h-10`) | `CombatantRow.svelte` |

**Mobile 40px (user decision, 2026-07-17, second scope change):** after inspecting the shipped
result (~144px mobile vs ~116px desktop), the user ordered the card's mobile touch rows reduced
44px → 40px. This amends PLT-2's 44px floor for the combatant card's interactive rows: 40px
still clears WCAG 2.2 AA target-size (2.5.8, 24px minimum); 44px was the stricter
WCAG 2.1 AAA / Apple HIG tier. Desktop saves ~25px per card, mobile ~18px. Expected result
≈ 110px desktop / ~136px mobile collapsed.

## What changes

By capability-spec ID:

| ID | Change |
|----|--------|
| `CBT-2` | amend: compact-dim values for the card (pad 10 / HP 16 / desktop controls 28 / desktop HP-row ≤32 / chips 22); field set, row order, and all existing ACs unchanged |
| `PLT-2` | amend: combatant-card interactive rows (chevron, `⋮`, HP row) measure 40px on the touch axis below `lg` — explicit card-scoped exception to the ≥44px floor (user decision 2026-07-17; still ≥ WCAG 2.2 AA 24px target minimum). All other surfaces keep the 44px floor |

Reference/design-source files updated alongside: `specs/design/tokens.css` (`--card-pad`,
`--hp-size`), `specs/reference/component-inventory.md` (card-dim prose + the
`--card-pad`/`--hp-size` "synced to shipped" exception note — values change).

**Prototype divergence (user decision, 2026-07-17, mid-run):** the prototypes'
non-tokenized literals (`.chip` height 24px, `.icon-btn` 32px in `card-prototype.html` /
`prototype.html`) are deliberately left as-is — prototypes stay shifted from code on these
dims. The token-driven `--card-pad`/`--hp-size` deltas still flow into the prototypes via the
shared `tokens.css` import (single-source-of-truth, accepted). The original Phase 3
(prototype literal edits) was cancelled before dispatch.

## Acceptance criteria

- [ ] `specs/design/tokens.css`: `--card-pad: 10px` and `--hp-size: 16px`; no other token value
      changes in the diff.
- [ ] `CombatantRow.svelte`: chevron and `⋮` buttons render 40px on mobile (`size-10`)
      and 28px at `lg` (`lg:size-7` or equivalent); the two remain the same size as each other
      (CBT-2 AC intact).
- [ ] `CombatantRow.svelte`: the unified HP tap row renders 40px (`min-h-10`) below `lg` and
      ≤32px tall at `lg`; it remains a single unified target opening the numpad
      ([[hp]] HP-4 ACs intact).
- [ ] Card chips (init pill, condition chips, `+ Condition`/`+ Note` triggers) render 22px tall
      in the app. The init pill keeps fixed width / pointer cursor / no `min-height`
      ([[initiative]] INI-2 ACs intact).
- [ ] Card row structure and field set are unchanged: same 4 rows in the same order, every
      CBT-2-listed field still visible collapsed; no field moves between rows.
- [ ] Card interactive rows (chevron, `⋮`, HP row) measure exactly 40px on the touch axis below
      `lg` — the amended PLT-2 card exception; no card target shrinks below 40px.
- [ ] `specs/design/card-prototype.html` and `specs/design/prototype.html` have **no diff** —
      their literal chip/icon dims stay 24px/32px (deliberate divergence, see "What changes").
- [ ] `npm run gate` passes.

## Out of scope

- Any layout restructure from the other sandbox options (V2–V8): row merges, bottom-edge health
  strip, HP-in-bar, single-line mode, condition dots, chevron removal.
- Shrinking mobile touch controls below 40px, and any invisible hit-area technique.
- The 44px floor anywhere outside the combatant card (headers, forms, menus, combats home).
- HealthBar track height (stays 8px), expanded-state content (Textarea, pickers), temp-HP badge
  dims (`--badge-width` unchanged).
- Any behavior change: expand/collapse, numpad, initiative roll/lock, conditions, menus.
- Other screens/components: `CombatantForm`, `CombatRow` (combats home), headers, settings.
- i18n, tests beyond what the gate already runs, new tokens.
- `specs/design/card-prototype.html` / `specs/design/prototype.html` — no edits at all
  (prototype literal dims deliberately stay diverged from code; user decision mid-run).
