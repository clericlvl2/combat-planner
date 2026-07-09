---
name: spec-tasks
description: Turn an approved specs/changes/NNN-slug/change.md into tasks.md, with explicit per-phase file ownership and parallel-safe groupings. Use after the user has approved a change unit's draft. Do not use before change.md is approved, or to implement anything.
---

Generate `tasks.md` for one already-approved change unit. Do not implement anything and do not
edit `change.md` (if it needs changes, that's a new `/spec-new` round or a manual edit the user
drives, not this skill's job).

## Steps

1. Confirm the change unit is approved: read `change.md`'s frontmatter and require
   `status: approved`. If it's still `draft` (or anything else), stop and tell the user to
   approve it first — do not proceed on a chat assurance alone.
2. Dispatch one `spec-planner` agent via the Agent tool, giving it the change unit path. It
   reads `change.md` itself, finds the concrete files behind each affected capability, groups the
   work into phases with explicit file ownership and parallel-safe groupings, and writes
   `specs/changes/NNN-slug/tasks.md` from `specs/templates/tasks.md`.
3. Once it reports `tasks.md written: yes`, flip `change.md`'s frontmatter to
   `status: in-progress`.
4. Relay the agent's phase breakdown to the user (phase names + owned files + parallel groups)
   and stop. `/spec-run` executes it next, once they're happy with the split.
