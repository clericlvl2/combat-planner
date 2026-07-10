# Tasks: visual-fidelity-cure

Generated from `change.md` + `.claude/plans/2026-07-10-heal-visual-fidelity-006-007.md`.

**Hard rules (from the plan — apply to every phase):**

- One visual surface = one implementer. Never split one screen/component's styling across
  parallel agents. Phases run **strictly sequential A → B → C → D** — none are parallel-safe.
- Every implementer touching UI MUST read `specs/design/prototype.html` (authoritative for ALL
  values incl. light palette) and `specs/design/card-prototype.html` (authoritative for card
  STRUCTURE only — its light-theme `--health-*`/`--combat-*` hexes are WRONG, they reuse dark
  values) before writing code.
- Store seam: call `$state.snapshot()` before passing runes state to pure/Dexie (constitution).
- `npm run gate` after every phase; never weaken a gate step.

## Phase A — Global killers (theme boot, font-scale, shadows)

**Owns:** `src/routes/+layout.svelte`, `src/routes/settings/+page.svelte`, `src/routes/layout.css`,
`src/app.html`, `src/lib/theme.ts` (new), `src/lib/components/app/CombatantRow.svelte`,
`src/lib/components/app/ColorTagDot.svelte`
**Parallel-safe with:** none

- [ ] A1 — Theme applied at root: in `+layout.svelte`, on mount and reactively resolve
      `store.settings.theme` (`dark`/`light`/`system` + `prefers-color-scheme` listener for
      `system`) and toggle the `dark` class on `document.documentElement`. Extract resolve/apply
      into new `src/lib/theme.ts` (single owner). Drop the private `$effect` theme-toggling block
      in `settings/+page.svelte` (~lines 49–65) — page only writes the setting. Update
      `theme-color` meta dynamically (currently hardcoded `#18181b` in `src/app.html:6`).
- [ ] A2 — Wire typography scale in `layout.css` `@theme inline`: `--text-xs: var(--font-xs)`
      (11), `--text-sm: var(--font-sm)` (13), `--text-base: var(--font-md)` (15),
      `--text-lg: var(--font-lg)` (18), `--text-xl: var(--font-xl)` (22). Fix the two escapes:
      `CombatantRow.svelte` `text-[10px]` and `ColorTagDot.svelte` `text-[11px]` → `text-xs`.
      Do NOT remap Tailwind's numeric spacing scale (shadcn depends on it).
- [ ] A3 — Shadows: alias `--shadow-sm`/`--shadow-md` in `@theme inline` to the existing
      `layout.css` shadow vars so shadcn overlays render the design shadow.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase B — Combatant card recipe

**Owns:** `src/lib/components/app/CombatantRow.svelte`,
`src/lib/components/app/HealthBar.svelte`, `src/lib/components/app/InitCell.svelte`
**Parallel-safe with:** none (depends on Phase A tokens)

All against `card-prototype.html` CSS recipe (structure) + `prototype.html` values:

- [ ] B1 — Card radius 12px (not `rounded-xl`/18px); border via `--border` token, not
      `ring-foreground/10`.
- [ ] B2 — Type stripes 6px wide each; PC = 2 distinct stripes with a visible gap (not one merged
      slab), enemy/ally = 1 stripe.
- [ ] B3 — Active-turn `▶` dot (`.active-dot`, `var(--ring)`, 14px) leading Row 1 — currently
      missing.
- [ ] B4 — `InitCell`: visual chip 24px tall matching the shared chip family, keeping the 44px
      touch target via padding/pseudo-element hit area (not visual size).
- [ ] B5 — `HealthBar`: visible 8px track (`--surface-3`, `border-radius:999px`) under the fill.
- [ ] B6 — Temp-HP badge offset per recipe (`top:-6px`, floating right of HP text, not
      overlapping).
- [ ] B7 — Def-stat values bold (`AC **10**`), labels muted.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase C — Screen chrome + SearchField

**Owns:** `src/lib/components/app/CombatHeader.svelte`,
`src/lib/components/app/JumpToTurnButton.svelte`, `src/lib/components/app/NumpadSheet.svelte`,
`src/lib/components/app/FAB.svelte`, `src/lib/components/app/CombatRow.svelte`,
`src/routes/combats/+page.svelte`, `src/routes/combats/[id]/+page.svelte`,
`src/lib/components/app/SearchField.svelte` (new), `messages/*.json`,
`specs/capabilities/combats-list.md`, `specs/reference/component-inventory.md`,
`specs/reference/i18n-catalog.md`
**Parallel-safe with:** none (depends on Phase A/B)

- [ ] C1 — `CombatHeader`: desktop Active header gets `header-advance`/`header-jump` tonal
      roundel icon buttons (mirror the Setup `header-add`/`header-start` pattern); Round/Escalation
      bar restyled to label/value pairs (uppercase 11px label + 15px/600 tabular value).
- [ ] C2 — `combats/[id]/+page.svelte` + `JumpToTurnButton`: Advance FAB and Jump pill get
      `lg:hidden`; remove the stale "intentional" comment.
- [ ] C3 — Start FAB in Setup: primary styling per prototype `.fab--start` (not a pale ghost
      roundel).
- [ ] C4 — `NumpadSheet`: commit tint buttons (Deal Damage/Restore HP/Set Temp HP)
      contrast-corrected per prototype tint recipes — verify against prototype.html light AND dark
      values; History section as collapsible header + chevron.
- [ ] C5 — Combats list: untitled combat renders placeholder title (new i18n key, e.g.
      `combats.untitled` → "Untitled combat") instead of a blank row; row card radius `--radius`
      (10px); FAB/create aria-label aligned to prototype ("New combat").
- [ ] C6 — `SearchField` (new) per prototype `.search-bar` recipe; wired in
      `combats/+page.svelte`; filter = local `$derived` on title (never stored — ADR-002); shown
      only when list non-empty; new i18n placeholder key. Spec side: add a CLS search requirement
      to `combats-list.md`, row in `component-inventory.md`, key in `i18n-catalog.md`.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase D — Doc corrections (docs last)

**Owns:** `specs/README.md`, `specs/templates/change.md`, `.claude/agents/spec-planner.md`,
`CLAUDE.md`, `specs/capabilities/platform.md`, `specs/reference/component-inventory.md`,
`specs/design/prototype.html` (stale collapsed-note CSS comment),
`specs/design/card-prototype.html` (light-theme hex fix)
**Parallel-safe with:** none (docs describe what shipped in A/B/C)

- [ ] D4 — `spec-planner.md`: rule — one visual surface = one implementer; never split a single
      screen/component's styling across parallel phases.
- [ ] D5 — `CLAUDE.md`: standing rule — any UI-touching task loads `specs/design/*.html` +
      `component-inventory.md` as binding design truth.
- [ ] D6 — Doc corrections: `platform.md` PLT-3 (desktop swap per decision);
      `component-inventory.md` stale rows reconciled after Phase C; `prototype.html` stale
      collapsed-note CSS comment fixed (note visible when collapsed is the converged truth);
      `card-prototype.html` light-theme `--health-*`/`--combat-*` hexes corrected to
      `prototype.html` values (design-source fix — flagged for a separate commit at close).

**Gate:** `npm run gate` must pass before this phase is reported done.
