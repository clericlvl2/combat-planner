# Combat Planner — Documentation

Source of truth for what Combat Planner does now lives in [`specs/`](../specs/README.md)
(capability-sliced requirements + acceptance criteria) and [`docs/adr/`](adr/README.md) (the 13
locked stack decisions). This directory otherwise holds the live project dashboard and the
frozen predecessor docs, kept for provenance.

## Start here

- **[specs/README.md](../specs/README.md)** — the process manual: capability files, change-unit
  lifecycle, agent roles, gates.
- **[docs/adr/README.md](adr/README.md)** — stack decisions (ADR-001..013).
- **[Status & Roadmap](Combat%20Planner%20Status%20%26%20Roadmap.md)** — the one live doc here:
  build status, changelog, roadmap.

## Archive

`docs/archive/` holds the original discipline-sliced docs (PRD, Rules & Glossary, Data Model,
UX & IA, Component Inventory, Architecture, i18n Message Catalog, Test Plan, Overview,
Requirements Prompt), each frozen with a superseded banner. They are never edited; every fact in
them has a mapped new home in `specs/`, tracked in
[`specs/reference/migration-traceability.md`](../specs/reference/migration-traceability.md).
