# Backlog

Single structured queue for tasks with no home in an active change unit yet. A task lives in
exactly one place per state: **idea → this file · active → `specs/changes/NNN-slug/` · done →
changelog row + archived unit**.

## Milestones

| Milestone | Slice | Product value | Status |
|---|---|---|---|
| **M1** | Store seam (ADR-002) + Dexie persist (ADR-003) + migration transforms (ADR-013), test-first. | Core state machine + durable data; nothing real without it. | done |
| **M2** | Combat screen vertical slice — Setup→Active, combatant row (compact/expanded), init tap/long-press, HP numpad, Advance, conditions. | The heartbeat (95% of play). End of M2 = dogfoodable: one hardcoded combat, no polish/i18n/PWA. | code-complete |
| **M3** | Combats home — CRUD, drag reorder, first-launch, undo/redo wired. | Multi-encounter prep. | next |
| **M4** | PWA shell (ADR-004) — offline precache, install hint, update toast. | Delivers "installable offline"; real app on the phone, not a localhost tab. | — |
| **M5** | Settings + About + i18n wiring (Paraglide ADR-005; strings already cataloged). | Settings/About + 6 languages. | — |
| **M6** | a11y + theming polish (WCAG-AA, dark/light, focus, ≥44px) + full Test Plan pass + CI gate. | Ship quality; one-handed / dim-room promises verified. | — |
| **Ship v1** | Deploy static SPA on Vercel (ADR-007), PWA installable. | — | — |

Milestone = roadmap grain; backlog row = task grain; a row may name its milestone in the task
text.

| ID | Task | Area | Size | Status | Unit |
|----|------|------|------|--------|------|
| B-001 | M2 component tests — acceptance-matrix component-layer rows (Test caveat) | TEST | M | done | `specs/changes/001-m2-component-tests-and-dogfood/` |
| B-002 | Live-browser dogfood of round 13 — 2–3 real fights, log friction (★ Dogfood gate) | TEST | M | done | `specs/changes/001-m2-component-tests-and-dogfood/` |
| B-003 | Pin store-seam unit-coverage % in ADR-009 (test-plan gap) | TEST | S | idea | — |
| B-004 | Pin Playwright viewport matrix / breakpoints for PLT-2/PLT-3 (test-plan gap) | PLT | S | idea | — |
| B-005 | Decide persistence round-trip / interrupted-write harness for PLT-7 (test-plan gap) | PLT | S | idea | — |
| B-006 | Decide automated axe-style a11y scan for PLT-5 (test-plan gap) | PLT | S | idea | — |
| B-007 | Name the injectable d20 / RNG seam (test-plan gap) | INFRA | S | idea | — |
| B-008 | Visual design: screen pass — prototype app screens/states (pre-build gap) | DESIGN | M | done | `specs/archive/003-ui-design-prototype/` |
| B-009 | Desktop layout — revisit before M6 (pre-build gap) | DESIGN | M | done | `specs/archive/003-ui-design-prototype/` |
| B-010 | Monster / encounter library (v2 backlog #1) | CBT | L | v2 | — |
| B-011 | Saved party template — candidate v1.5 (v2 backlog #2) | CBT | M | v2 | — |
| B-012 | CombatantRow temp-HP badge always visible; `combatants.md` CBT-2 says only after expand — doc/code mismatch, fix one (found in 001 Phase 1) | CBT | S | idea | — |
| B-013 | NumberField digit-cap makes max-overflow clamp unreachable via keyboard entry — decide if intended or needs a paste/programmatic-set test path (found in 001 Phase 2) | TEST | S | idea | — |
| B-014 | Parallel implementer builds race on shared `.svelte-kit` output dir during `/spec-run` fan-out — self-resolves on retry but wastes agent time; consider per-phase build isolation (found in 001 Phase 6/7) | INFRA | S | idea | — |
| B-015 | `/spec-close` has no commit step — unit 001 archived with everything left uncommitted in the working tree; add an explicit commit stage (what/when/message convention) to the close lifecycle. Resolved by the 2026-07-03 SDD restructure (spec-close commit stage). | INFRA | S | done | — |
| B-016 | `src/**` code comments cite dead pre-migration doc sections (`UX §`, `Component Inventory §`, `Data Model §` — archive deleted 2026-07-03) — repoint to capability IDs or drop (found in SDD restructure sweep) | INFRA | S | idea | — |
| B-017 | Visual design: design tokens — bake approved prototype look into `src/routes/layout.css` (real WCAG-AA token set, replaces STUB). Split from B-008; belongs to design-chain unit C. | DESIGN | M | done | `specs/archive/005-design-tokens/` |
| B-018 | Disable combatant toggle — disabled combatant skipped by turn advance, card renders pale (opacity ~80%) | CBT | S | idea | — |
| B-019 | App-data export/import — all-combats + single-combat, fail-safe import, shared transforms (flow F5). Deferred past v1: unbundled from M5, descoped from the prototype + Settings Data in unit 004 (round 2); `import-export.md` / CLS-8 / CLS-1 to reconcile at close-out. | IMP | L | v2 | — |
| B-020 | Task spec scoping — refactoring/rn units hit 150k+ tokens; doc guidance to keep specs/changes/NNN chunks ≤120k so agents don't overflow. Affects implementer dispatch & cost. | INFRA | M | idea | — |
| B-021 | App headers unified — Combat, Combats List, Settings screens use inconsistent header styles/spacing; standardize layout & visuals per design-system. | DESIGN | M | idea | — |
| B-022 | Remove "Jump to Turn" button — Combat screen initiative/turn model doesn't use it; dead UI. | CBT | S | idea | — |
| B-023 | Smooth animations — interactive aspects (tap, expand, damage entry, condition toggle, etc.) lack motion; add consistent transition library. | DESIGN | L | idea | — |
| B-024 | First-launch UX — app opening experience: onboarding flow, hints, tutorial or zero-state guidance. Brainstorm before spec. | DESIGN | M | idea | — |
| B-025 | Update credentials — About screen credits/attribution needs current team/sources. | SET | S | idea | — |
| B-026 | Routing edge cases — fix undefined URL states, missing param guards, back-button crashes (collect examples first). | INFRA | S | done | `specs/archive/010-route-error-boundary/` |

**Fields**

- **ID**: `B-001`… stable, never reused.
- **Area**: capability prefix (`HP`, `PLT`…) or `TEST` / `DESIGN` / `INFRA`.
- **Size**: S / M / L.
- **Status**: `idea` (needs shaping) · `ready` (could be drafted now) · `in-unit` (promoted;
  Unit column links `specs/changes/NNN-slug/`) · `done` · `v2` (deferred past v1).
- **Unit**: link once promoted, else `—`.

**Non-goals** (not tasks, listed so nobody re-adds them as backlog rows): multi-device
sync/cloud, rules automation, other game systems, live-session sharing — deliberate product
non-goals (see git history for the original requirements doc).
