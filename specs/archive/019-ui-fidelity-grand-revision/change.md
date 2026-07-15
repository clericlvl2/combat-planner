---
status: archived
backlog: B-021
---

# Change: ui-fidelity-grand-revision

## Why

The create-combat modal is buggy and off-prototype, and the combatant card diverges from its
prototype (fonts, sizes, type-stripes). A 14-agent fidelity audit found the drift is pervasive —
every screen has token-level deviations, several real bugs, and the design source itself is stale
or incomplete in places. This unit reconciles the running app and the design prototypes so they
match, in **both** directions, in one mega change-unit (many phases). Promotes B-021 (unified
headers) and subsumes it into a full cross-screen fidelity pass.

**Governing reconciliation rule (settled with user):**
- CODE wrong vs prototype → fix **CODE** to match the prototype (fonts, weights, radii, gaps,
  tracking, stripe count, copy, behavior bugs).
- CODE deliberately a11y/enhancement-correct but the PROTOTYPE is stale/incomplete → fix the
  **PROTOTYPE** (and `specs/design/tokens.css`, `specs/reference/component-inventory.md`) to match
  the code. Never regress a11y/WCAG-AA or the 44px touch-min to chase mock pixels.

Design source (`specs/design/prototype.html`, `specs/design/card-prototype.html`,
`specs/design/tokens.css`, `specs/reference/component-inventory.md`) is therefore **in scope for
edits** in this unit — unusually, but by explicit decision.

## What changes

By capability-spec ID (and design-source targets):

| ID | Change |
|----|--------|
| `CBT-1` | amend: pc combatant renders exactly **one** type-stripe (code currently renders 2 via `typeStripeCount`); stale comment + `component-inventory.md` "pc=2" line corrected. |
| `CBT-2` | amend: combatant-card typography/spacing to prototype — name 15px/600/lh1.2, def-stats 13px/normal-weight, temp-HP badge 10px/600, condition-list + chip gaps, `+Condition`/`+Note` trigger weight/border, icon-button sizing; init-pill light-theme white override restored. |
| `CBT-3` | amend: combatant add/edit form — add-mode submit button reads **"Add"** (was always "Save"); NumberField value-cell font + footer layout to prototype. |
| `CBT-5` | amend: numeric-field (NumberField) value-cell + stepper fidelity within the form (presentation only; ranges untouched). |
| `CLS-1` | amend: combats-list row typography (title 15px/600, border token) + empty-state renders icon + description + prototype CTA copy (call site currently drops them). |
| `CLS-2` | amend: create-combat modal — title copy "New combat", primary button "Create" in create-mode, title/description placeholders, cap-error banner reset decoupled from the title field; modal styling + color-swatch tile to prototype. |
| `CLS-3` | amend: edit-combat modal inherits the corrected modal styling + "Save" primary label preserved for edit-mode. |
| `INI-2` | amend: init-cell / init-pill typography + light-theme background override to prototype. |
| `INI-3` | amend: init-pill value weight/size to prototype. |
| `HP-4` | amend: numpad HP-summary keeps the health-band-colored current-HP hierarchy (now drawn in prototype); numpad CommitActions raised to 44px touch-min + prototype bold/xs intent; HealthBar temp-HP track segment documented into the prototype. |
| `CND-3` | amend: condition-chip + trigger gaps/weights/border-token to prototype. |
| `TRE-3` | amend: round/escalation sub-bar radius `--radius`(10), corrected spacing rhythm to first card, tracking via new token. |
| `LIF-2` | amend: Setup "Start" control on desktop header rendered as the icon-roundel family member (play glyph) instead of a text pill; mobile Start-FAB uses the play glyph. |
| `SET-3` | amend: reset-all confirm copy corrected to match SET-3 (language/theme are KEPT); Settings language/reset rows gain visible labels + the "keeps language & theme" caveat. |
| `PLT-2` | amend: desktop icon-nav reachable from the open combat screen (CombatHeader gains the desktop nav row); `component-inventory.md` self-contradiction reconciled. |
| `PLT-5` | amend: touch-target reconciliation — prototype design-source updated to the 44px targets the code already enforces (icon-btns, digit pad, num-step, dialog inputs/buttons); the one genuine sub-min bug (numpad CommitActions 32px) fixed in code. |
| design-tokens | new: add a card radius step (`--radius-card:12px`) and a letter-spacing scale (`--tracking-*`) to `tokens.css`, wire into `layout.css @theme`, replace `rounded-[12px]` / `tracking-[0.04em]` literals. |
| design-icons | new: add a play/start glyph to `src/lib/icons.ts` (lucide `Play`/`PlayCircle`), consumed by LIF-2 controls. |
| design-source | reconcile: `prototype.html` + `card-prototype.html` + `component-inventory.md` updated per the governing rule (44px targets, temp-HP bar segment, def-stats `·` separators, HP-summary color hierarchy, WCAG border-tint recipes canonical, stale `header-jump` markup removed). |

## Acceptance criteria

Each bullet is independently verifiable by a fresh read-only agent from the diff.

**Combatant card (CBT-1 / CBT-2 / INI-2 / INI-3 / CND-3)**
- [ ] `labels.ts` `typeStripeCount` is `{ pc: 1, enemy: 1, ally: 1 }` and its comment no longer claims pc=2; `component-inventory.md`'s "Combatant card" section no longer states "pc=2".
- [ ] Combatant name renders at `--font-md` (15px), weight 600, line-height 1.2 (explicit classes on `CombatantRow.svelte`, not inherited defaults).
- [ ] Def-stats (AC/PD/MD) label row renders at `--font-sm` (13px); the stat values use the prototype's normal (`<b>`-default) weight, not `font-semibold`.
- [ ] Temp-HP badge text renders at 10px, weight 600.
- [ ] `+Condition` / `+Note` triggers render at prototype weight (normal, not `font-medium`) with a `--border`-token border color; condition-list gap = 6px; chip gaps are a single consistent value matching the prototype `.chip` recipe.
- [ ] Init-pill has a light-theme white-background override (`InitCell.svelte`) matching `[data-theme="light"] .chip.init-pill{background:#fff}`; init value weight/size match the prototype.

**Create/edit combat modal (CLS-1 / CLS-2 / CLS-3)**
- [ ] Create-mode dialog title resolves to "New combat"; create-mode primary button resolves to "Create"; edit-mode still resolves to "Save". (New i18n key(s) added to `messages/*.json` and paraglide regenerated, not hand-edited.)
- [ ] Title input has placeholder "e.g. Goblin Ambush"; description textarea has placeholder "Optional notes".
- [ ] The cap-error banner clears on any field edit, not only the title field.
- [ ] Modal styling matches prototype: backdrop 50% opacity, dialog width 400px, radius `--radius-lg` (14px), solid `--border-strong` border, field-label 11px with prototype tracking and no extra weight, field gap 5px, input radius `--radius-sm` (6px), input font 15px, cancel button uses the prototype outline recipe (not flat secondary), button radius 6px, primary weight 600. **Input/button HEIGHT stays 44px** (a11y — proto updated to match, per PLT-5).
- [ ] Color-swatch picker renders as prototype 30px square color tiles with letter + neutral-outline selected state (not the pill+small-dot with primary-tinted ring).

**Combats-list home (CLS-1)**
- [ ] Empty-state call site passes an `icon` and `description`; the CTA copy matches the prototype ("+ New combat"). Any missing i18n keys added + regenerated.
- [ ] Row title renders `--font-md` (15px) / weight 600; row border uses the `--border` token (not `ring-foreground/10`); search↔list gap = 8px; colorTag dot radius 7px; search icon 16px.

**Combatant form (CBT-3 / CBT-5)**
- [ ] Add-mode submit button resolves to "Add"; edit-mode to "Save".
- [ ] NumberField value cell renders at `--font-sm` (13px) and reads as one seamless surface (no dark `bg-input/30` tint leaking under the value cell).

**Numpad + HP (HP-4)**
- [ ] Numpad CommitActions buttons are ≥44px tall and carry the prototype bold/xs treatment.
- [ ] HP-summary current-HP retains its size + health-band color hierarchy AND the prototype markup is updated to illustrate it (design-source no longer shows the flat neutral line as the only variant).
- [ ] HealthBar temp-HP track segment is illustrated in the prototype sample states (design-source reconciled to the shipped behavior).

**Active-combat chrome (TRE-3 / LIF-2 / PLT-2)**
- [ ] Round/escalation sub-bar uses `--radius` (10px) and the corrected spacing rhythm (prototype `--space-2` to the first card, not the stacked 12px).
- [ ] Desktop header "Start" control renders as an icon-roundel (play glyph) in the header-add/advance family, not a text pill; mobile Start-FAB uses the play glyph. A play/start glyph exists in `src/lib/icons.ts`.
- [ ] On the desktop breakpoint, Settings/About/combats-list are reachable from an open combat screen (CombatHeader renders the desktop icon-nav row); `component-inventory.md` no longer self-contradicts on desktop-nav globality.

**Settings / About (SET-3)**
- [ ] `dialogs.resetAll.body` copy states combats are deleted and language/theme are kept (matches SET-3); the Settings data row surfaces the "keeps language & theme" caveat; language + reset rows have visible labels.
- [ ] Settings screen gap 8px; group radius `--radius` (10px); group heading tracking 0.06em. About container padding 24px, privacy border 3px, desktop max-width 640px.

**Design tokens (design-tokens / design-icons)**
- [ ] `tokens.css` defines a 12px card radius token and a `--tracking-*` letter-spacing scale, both wired through `layout.css`; `rounded-[12px]` and `tracking-[0.04em]` literals in `src/**` are replaced with the tokens.

**Design-source reconciliation (PLT-5 / design-source)**
- [ ] Prototype touch targets that the code enforces at 44px for a11y read 44px in `prototype.html` / `card-prototype.html` / `component-inventory.md` (not 32/38/40) — EXCEPT the numpad CommitActions, which the code raises to match (not the reverse).
- [ ] The stale `header-jump` markup is removed from `prototype.html` (feature removed in archived unit 011).
- [ ] The WCAG border-tint recipes (numpad/badges) are the canonical values shown in the prototype (no AA-failing filled tint remains as the drawn variant).

**Whole unit**
- [ ] `npm run gate` passes (lint, check, test:unit --run, build).

## Out of scope

- Any store / domain / logic / migration change (`constants.ts`, `factories.ts`, `derive.ts`,
  Dexie schema/upgrades) — this unit is presentation + design-source only. Numeric ranges, caps,
  and state-machine behavior are untouched.
- New product features beyond fidelity / a11y reconciliation.
- ConditionPicker pixel spec — no prototype artifact exists for the 12-preset grid; it stays
  prose-driven (already matches `component-inventory.md`).
- Vendored `src/lib/components/ui/*` shadcn primitive internals, except the minimal overrides
  needed to realize the acceptance criteria above (e.g. suppressing the NumberField value-cell
  tint).
- `NavSidebar` open-overlay width (`w-64`) — the prototype never renders the open overlay, so
  there is no design-truth to match; left as-is.
- i18n copy for locales other than the source strings' semantics — translations of any new keys
  follow the project's normal localization flow; this unit only guarantees the source (en) copy
  and key parity, not human-quality translations of new keys.
