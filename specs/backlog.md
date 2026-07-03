# Backlog

Single structured queue for tasks with no home in an active change unit yet. A task lives in
exactly one place per state: **idea → this file · active → `specs/changes/NNN-slug/` · done →
changelog row + archived unit**.

| ID | Task | Area | Size | Status | Unit |
|----|------|------|------|--------|------|
| B-001 | M2 component tests — acceptance-matrix component-layer rows (Test caveat) | TEST | M | done | `specs/changes/001-m2-component-tests-and-dogfood/` |
| B-002 | Live-browser dogfood of round 13 — 2–3 real fights, log friction (★ Dogfood gate) | TEST | M | done | `specs/changes/001-m2-component-tests-and-dogfood/` |
| B-003 | Pin store-seam unit-coverage % in ADR-009 (test-plan gap) | TEST | S | idea | — |
| B-004 | Pin Playwright viewport matrix / breakpoints for PLT-2/PLT-3 (test-plan gap) | PLT | S | idea | — |
| B-005 | Decide persistence round-trip / interrupted-write harness for PLT-7 (test-plan gap) | PLT | S | idea | — |
| B-006 | Decide automated axe-style a11y scan for PLT-5 (test-plan gap) | PLT | S | idea | — |
| B-007 | Name the injectable d20 / RNG seam (test-plan gap) | INFRA | S | idea | — |
| B-008 | Visual design: token + screen pass (pre-build gap) | DESIGN | M | idea | — |
| B-009 | Desktop layout — revisit before M6 (pre-build gap) | DESIGN | M | idea | — |
| B-010 | Monster / encounter library (v2 backlog #1) | CBT | L | v2 | — |
| B-011 | Saved party template — candidate v1.5 (v2 backlog #2) | CBT | M | v2 | — |
| B-012 | CombatantRow temp-HP badge always visible; `combatants.md` CBT-2 says only after expand — doc/code mismatch, fix one (found in 001 Phase 1) | CBT | S | idea | — |
| B-013 | NumberField digit-cap makes max-overflow clamp unreachable via keyboard entry — decide if intended or needs a paste/programmatic-set test path (found in 001 Phase 2) | TEST | S | idea | — |
| B-014 | Parallel implementer builds race on shared `.svelte-kit` output dir during `/spec-run` fan-out — self-resolves on retry but wastes agent time; consider per-phase build isolation (found in 001 Phase 6/7) | INFRA | S | idea | — |
| B-015 | `/spec-close` has no commit step — unit 001 archived with everything left uncommitted in the working tree; add an explicit commit stage (what/when/message convention) to the close lifecycle | INFRA | S | idea | — |

**Fields**

- **ID**: `B-001`… stable, never reused.
- **Area**: capability prefix (`HP`, `PLT`…) or `TEST` / `DESIGN` / `INFRA`.
- **Size**: S / M / L.
- **Status**: `idea` (needs shaping) · `ready` (could be drafted now) · `in-unit` (promoted;
  Unit column links `specs/changes/NNN-slug/`) · `done` · `v2` (deferred past v1).
- **Unit**: link once promoted, else `—`.

**Non-goals** (not tasks, listed so nobody re-adds them as backlog rows): multi-device
sync/cloud, rules automation, other game systems, live-session sharing — deliberate non-goals
per archived PRD §9.
