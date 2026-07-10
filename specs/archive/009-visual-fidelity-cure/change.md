---
status: archived
backlog: —
---

# Change: visual-fidelity-cure

## Why

Units 006/007 shipped the Combat and Combats-list screens but a live-render audit on 2026-07-10
(8 read-only probes + Playwright screenshots) found the visual output drifts from the locked
`specs/design/prototype.html` target. Verdict: **patch, not rebuild** — architecture, domain
logic, and color tokens are sound; the damage is a small set of global-layer misses and
CSS-number drift, plus a verification pipeline that never renders a pixel. Root causes:

- **Theme boot bug (#1):** theme class is toggled inside `settings/+page.svelte`, so a full
  reload on any other route drops back to light — the single worst regression.
- Typography scale (`--font-*`) is defined but never wired into Tailwind's `text-*` tokens, so
  every `text-*` call site renders stock Tailwind sizes.
- shadcn overlays use Tailwind stock shadows, not the design `--shadow-*` vars.
- Combatant card, screen chrome, numpad, and combats list drift from the prototype recipe
  (radius, stripes, active-turn dot, health-bar track, temp-HP badge, def-stat weight, desktop
  header controls, FAB styling, untitled-combat placeholder).
- No `SearchField` exists (prototype shows one with real title filtering).

Design source of truth: `specs/design/prototype.html` (authoritative for ALL values incl. light
palette) and `specs/design/card-prototype.html` (authoritative for card STRUCTURE only — its
light-theme `--health-*`/`--combat-*` hexes are wrong; they reuse dark values).

Full plan: `.claude/plans/2026-07-10-heal-visual-fidelity-006-007.md` (pre-approved).

## What changes

| ID | Change |
|----|--------|
| `SET-*` | amend: theme is resolved+applied at app root (`+layout.svelte`/new `src/lib/theme.ts`), not inside the Settings page; `theme-color` meta updates dynamically; Settings only writes the setting |
| `PLT-3` | amend: desktop Active header — Advance/Jump become header icon buttons on desktop; the Advance FAB and Jump pill are `lg:hidden`. Spec text corrected to match prototype |
| `PLT-5` | apply: numpad commit-tint buttons contrast-corrected against prototype light AND dark values; focus/targets preserved |
| `CBT-*` | restyle combatant card to `card-prototype.html` recipe: 12px radius, `--border` token, 6px type stripes (PC = 2 stripes with gap), active-turn `▶` dot, 24px init chip w/ 44px hit area, visible 8px health-bar track, temp-HP badge offset, bold def-stat values |
| `TRE-*` | restyle CombatHeader Round/Escalation bar to label/value pairs; desktop header advance/jump roundels |
| `HP-*` | restyle NumpadSheet commit tints + History collapsible header |
| `CLS-*` | untitled combat renders placeholder title (new i18n key); row card radius `--radius`; create aria-label "New combat"; **new `SearchField` with real title filtering** (view-local `$derived`, never stored) shown only when list non-empty |
| (typography) | wire `--font-*` scale into Tailwind `--text-*` tokens app-wide; fix `text-[10px]`/`text-[11px]` escapes |
| (shadows) | alias `--shadow-sm`/`--shadow-md` to design shadow vars for shadcn overlays |
| (doc-source) | `card-prototype.html` light-theme `--health-*`/`--combat-*` hexes corrected to `prototype.html` values (separate commit); `spec-planner.md` + `CLAUDE.md` design-truth rules |

## Acceptance criteria

Visual ACs are **element-bound** (name the concrete element/token/value), never "matches the
prototype" alone.

- [ ] **Theme persists on reload from any route.** Set Dark in Settings, navigate to `/combats`
      and to a combat, full reload — `document.documentElement` keeps the `dark` class and the UI
      stays dark everywhere. Same for Light. (`SET-*`)
- [ ] `theme-color` meta reflects the active theme (not the hardcoded `#18181b`). (`SET-*`)
- [ ] Tailwind `text-xs/sm/base/lg/xl` resolve to the design scale (11/13/15/18/22px); no
      `text-[10px]`/`text-[11px]` arbitrary escapes remain in `CombatantRow`/`ColorTagDot`.
- [ ] shadcn overlays (popover/select/dropdown) render the design `--shadow-md`, not Tailwind
      stock.
- [ ] Combatant card renders to the `card-prototype.html` recipe: 12px radius, token border,
      6px stripes (PC shows two distinct stripes with a visible gap), leading active-turn `▶` dot
      on the active row, 24px-tall init chip (with a ≥44px touch target), visible 8px health-bar
      track under the fill, offset non-overlapping temp-HP badge, bold def-stat values with muted
      labels. Holds compact + expanded, dark + light.
- [ ] Desktop (≥1024px) Active header shows Advance/Jump roundel icon buttons; the Advance FAB
      and Jump pill are hidden at that breakpoint; both remain on mobile. Round/Escalation render
      as uppercase-label + tabular-value pairs. (`PLT-3`, `TRE-*`)
- [ ] Setup Start FAB reads as a primary action (not a pale ghost roundel). (`LIF-*`)
- [ ] NumpadSheet commit buttons (Deal Damage / Restore HP / Set Temp HP) meet WCAG-AA contrast
      in BOTH light and dark; History is a collapsible header + chevron. (`HP-*`, `PLT-5`)
- [ ] Combats list: an untitled combat shows a placeholder title (new i18n key) instead of a
      blank row; row card radius uses `--radius`; create control aria-label is "New combat".
      (`CLS-*`)
- [ ] A `SearchField` component filters the combats list by title in real time (view-local
      `$derived`, never persisted); it is shown only when the list is non-empty. New i18n key for
      its placeholder. CLS spec, `component-inventory.md`, and `i18n-catalog.md` updated. (`CLS-*`)
- [ ] `card-prototype.html` light-theme `--health-*`/`--combat-*` hexes corrected to
      `prototype.html` values (doc-source fix).
- [ ] No game-mechanics/data change (LIF/INI/TRE/HP/LOG/CND/CBT/UND logic verifies identical;
      existing tests pass unchanged). `npm run gate` stays green after every phase.

## Out of scope

- Undo/redo, HP log logic, import/export, PWA/service-worker, conditions logic — untouched.
- No store/domain changes (search filter is a view-local `$derived` only).
- `src/lib/components/ui/*` (shadcn generated) — not edited except where a variant prop already
  exists; overrides live at call sites.
- No new tests beyond what the gate requires. No screenshot/visual-regression tooling.
- First-launch "auto-create empty combat" behavior stays — only the placeholder rendering changes.
