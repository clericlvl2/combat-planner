# Backlog

Single structured queue for tasks with no home in an active change unit yet. A task lives in
exactly one place per state: **idea → this file · active → `specs/changes/NNN-slug/` · done →
changelog row + archived unit**.

| ID | Task | Area | Size | Status | Unit |
|----|------|------|------|--------|------|
| B-001 | M2 component tests — acceptance-matrix component-layer rows (Test caveat) | TEST | M | ready | — |
| B-002 | Live-browser dogfood of round 13 — 2–3 real fights, log friction (★ Dogfood gate) | TEST | M | ready | — |
| B-003 | Pin store-seam unit-coverage % in ADR-009 (test-plan gap) | TEST | S | idea | — |
| B-004 | Pin Playwright viewport matrix / breakpoints for PLT-2/PLT-3 (test-plan gap) | PLT | S | idea | — |
| B-005 | Decide persistence round-trip / interrupted-write harness for PLT-7 (test-plan gap) | PLT | S | idea | — |
| B-006 | Decide automated axe-style a11y scan for PLT-5 (test-plan gap) | PLT | S | idea | — |
| B-007 | Name the injectable d20 / RNG seam (test-plan gap) | INFRA | S | idea | — |
| B-008 | Visual design: token + screen pass (pre-build gap) | DESIGN | M | idea | — |
| B-009 | Desktop layout — revisit before M6 (pre-build gap) | DESIGN | M | idea | — |
| B-010 | Monster / encounter library (v2 backlog #1) | CBT | L | v2 | — |
| B-011 | Saved party template — candidate v1.5 (v2 backlog #2) | CBT | M | v2 | — |

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
