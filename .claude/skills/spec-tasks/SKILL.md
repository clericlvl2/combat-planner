---
name: spec-tasks
description: Turn an approved specs/changes/NNN-slug/change.md into tasks.md, with explicit per-phase file ownership and parallel-safe groupings. Use after the user has approved a change unit's draft. Do not use before change.md is approved, or to implement anything.
---

Generate `tasks.md` for one already-approved change unit. Do not implement anything and do not
edit `change.md` (if it needs changes, that's a new `/spec-new` round or a manual edit the user
drives, not this skill's job).

## Steps

1. Confirm the change unit is approved (ask the user if unclear — never assume).
2. Read `change.md` in full: the affected capability IDs, acceptance criteria, and out-of-scope
   list.
3. Identify the concrete files each piece of work touches. Use `Grep`/`Glob` against `src/` to
   find the actual files backing each affected capability (store, components, routes) — don't
   guess from the capability name alone.
4. Group the work into phases such that:
   - Each phase owns a disjoint file set from every other phase it's *not* marked parallel-safe
     with. Two phases touching the same file must never be marked parallel-safe.
   - Phases with a real ordering dependency (e.g. a store change before the component that reads
     it) are separate, sequential phases, not merged into one.
   - Keep phases small enough that one `implementer` agent run can finish one phase, including its
     own gate run, without touching out-of-scope files.
5. Write `specs/changes/NNN-slug/tasks.md` from `specs/templates/tasks.md`, one phase block per
   group, each ending with the standard `**Gate:** npm run gate must pass before this phase is
   reported done.` line.
6. Present the phase breakdown to the user (phase names + owned files + parallel groups) and stop.
   `/spec-run` executes it next, once they're happy with the split.
