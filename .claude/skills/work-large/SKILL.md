---
name: work-large
description: Run the large work loop for anything past the small-loop bar — architecture, schema, migrations, multi-file/multi-phase changes. Use when /work-next hands you a row marked Loop=large, /work-small escalates mid-flight, or the user directly asks for a plan-driven multi-file change. Do not use for a clearly-scoped ≤2-3-file fix — that's /work-small.
---

You run the LARGE loop end-to-end for one backlog row: research, author a plan file in-thread
with the user, get one approval, run it phase by phase via `phase-runner`, gate, get an
independent `reviewer` pass, remediate, commit, clear the row.

## Steps

1. **Research + questions** — read the backlog row and relevant code. Resolve every ambiguity
   with the user before writing anything down. No plan = no "figure it out later."
2. **Author the plan file** — write the complete plan yourself, in-thread, together with the
   user, at `.claude/plans/YYYY-MM-DD-desc.md`. No separate planner agent. It must contain:
   acceptance criteria, explicit exclusions, phases with each phase's owned-files list, and the
   verification method. The artifact must be ready-to-execute on first write, not a draft to
   discuss.
3. **One explicit approval** — present the finished plan and stop. Wait for the user to say go.
   Never start phase execution in the same turn as presenting the plan.
4. **Record the base SHA** — capture `git rev-parse HEAD` before any phase starts. This is what
   the reviewer diffs against later.
5. **Run phases** — dispatch each phase to a `phase-runner` agent, giving it: the plan path, the
   phase name, and that phase's owned-files list. Run file-disjoint phases in parallel (single
   message, multiple Agent calls); run everything else sequentially, waiting for each phase to
   finish before starting the next.
6. **Check per phase** — after each phase, review its report. A targeted check per phase is
   enough; run the ONE full `npm run gate` after all phases are integrated, not after every
   phase.
7. **Independent review** — dispatch a `reviewer` agent against `base..HEAD` with the base SHA,
   the allowed paths, and the plan path (for its acceptance criteria) explicitly passed in.
8. **Remediate** — any FAIL inside the approved scope gets auto-remediated (dispatch the fix,
   don't ask). After every remediation, run a fresh `reviewer` pass — don't declare done off a
   stale review. Do NOT auto-remediate: repeated identical failure, new scope, a destructive
   action, or an unresolved product choice — stop and ask instead.
9. **Commit** — one commit per phase, linear history, no merge commits, each carrying a
   `Work: W-NNN` trailer matching the backlog row's ID.
10. **Clear the row** — delete the row from `specs/backlog.md` once review is clean and gate is
    green.

## Stop conditions

Halt and ask the user rather than pushing through: the same failure repeating, scope growing
beyond the approved plan, anything destructive, or a product decision only the user can make.
