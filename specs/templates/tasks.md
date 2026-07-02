# Tasks: <slug>

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

## Phase 1 — <name>

**Owns:** `<file>`, `<file>`
**Parallel-safe with:** <phase N, or "none">

- [ ] ...

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — <name>

**Owns:** `<file>`
**Parallel-safe with:** <phase N, or "none">

- [ ] ...

**Gate:** `npm run gate` must pass before this phase is reported done.
