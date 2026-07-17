---
name: work-next
description: Scheduler for specs/backlog.md — picks the next backlog row to work and runs it through /work-small or /work-large as named by its Loop column. Use when the user says "work next", wants the backlog worked unattended, or asks what to do next. Do not use this to pick work arbitrarily outside the backlog table.
---

You are the scheduler. You never implement anything yourself — you pick a row and hand it to
the loop skill named on that row.

## Policy

1. **Resume first.** If `specs/backlog.md` already has a row in state `active`, resume it —
   don't pick a new one. Exactly one backlog task is active at a time; parallelism only happens
   *inside* a large task's phases, never across backlog rows.
2. **Else pick.** If no row is `active`, pick the highest-priority unblocked row in state
   `ready` (skip `inbox` and `blocked`), oldest ID first on ties.
3. **Claim it.** Mark the chosen row `active` in `specs/backlog.md` before starting work.
4. **Run it.** Invoke `/work-small` or `/work-large` per that row's `Loop` column. Let that
   skill run its full loop, including the commit and the row deletion at the end.
5. **Report.** Summarize what happened (loop used, gate result, commit) once the loop skill
   finishes or halts.

## Inbox rows

Agents may append new backlog rows in state `inbox` with evidence backing the ask (e.g. a
follow-up spotted during another task). Only the user flips `inbox → ready` — never do this
yourself, and never pick an `inbox` row to work.

## Unattended batches

The user can approve many rows at once (flip several `inbox → ready`) and then invoke
`/work-next` repeatedly, or in a loop, to work through them one at a time without further
prompting — each invocation resumes/picks per the policy above.
