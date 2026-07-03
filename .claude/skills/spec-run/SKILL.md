---
name: spec-run
description: Orchestrate implementer agents through a change unit's tasks.md, one phase (or parallel-safe group) at a time, halting on any gate failure. Use after tasks.md exists and the user is ready to build. Do not use to write code directly yourself — this skill only dispatches implementer agents.
---

Drive `specs/changes/NNN-slug/tasks.md` to completion via `implementer` agents. You orchestrate;
you do not implement phases yourself.

## Steps

1. Read `tasks.md` in full. Build the phase execution order from the parallel-safe annotations:
   phases marked parallel-safe with each other run together; everything else runs in the order
   listed.
2. For each phase (or parallel-safe group), dispatch one `implementer` agent per phase via the
   Agent tool, subagent_type `implementer`. Give each agent: the change unit path, its phase
   number/name, and its owned-files list verbatim from `tasks.md` — the agent's own contract
   forbids touching anything outside that list, so an incomplete file list here is a bug in this
   dispatch, not the agent's fault.
3. Run a parallel-safe group's agents together (single message, multiple Agent calls); run
   sequential phases one at a time, waiting for each to finish before starting the next.
4. After each phase (or group) finishes, check its report. If any phase reports a red gate:
   **halt** — do not start the next phase or group. Report the failure to the user with the
   failing phase's full report and wait for direction; do not attempt to silently patch it
   yourself unless the user asks you to.
5. If all phases finish with a green gate, run `npm run gate` once more at the change-unit level
   (some cross-phase interactions only surface once everything's merged) before declaring the
   change unit implemented.
6. Report a summary to the user: phases completed, overall gate status, any deviations any
   implementer reported. State clearly that `/spec-verify` is the next step, not this skill.
