---
name: work-large
description: Run the large work loop for anything past the small-loop bar — architecture, schema, migrations, multi-file/multi-phase changes. Use when /work-next hands you a row marked Loop=large, /work-small escalates mid-flight, or the user directly asks for a plan-driven multi-file change. Do not use for a clearly-scoped ≤2-3-file fix — that's /work-small.
---

You run the LARGE loop end-to-end for one backlog row: research, author a plan file in-thread
with the user, get one approval, run it phase by phase via `phase-runner`, gate, get an
independent `taster-bee` pass, remediate, commit, clear the row. The unit runs in a worktree per
`work-next`'s canonical worktree-per-unit lifecycle.

## Steps

1. **Research + questions** — read the backlog row and relevant code. Resolve every ambiguity
   with the user before writing anything down. No plan = no "figure it out later."
2. **Author the plan file** — write the complete plan yourself, in-thread, together with the
   user, at `.claude/plans/YYYY-MM-DD-desc.md`. No separate planner agent. It must contain:
   acceptance criteria, explicit exclusions, phases with each phase's owned-files list, and the
   verification method. The artifact must be ready-to-execute on first write, not a draft to
   discuss. For each phase, record: outcome; owned files; required-read list (every file/section
   the runner must read, including read-only deps); read-LOC estimate; write-LOC estimate; shared
   invariant; verification; unknowns (must be none).

   **Phase sizing.** Size by cohesion first, then aggregate context cost. Each phase = one
   independently implementable + verifiable outcome. Record per phase: outcome; owned files;
   required-read list (every file/section runner must read, incl. read-only deps); read-LOC
   estimate; write-LOC estimate; shared invariant; verification; unknowns (must be none).

   Split when: required reading >~2,000 LOC, writes >~500 LOC, unresolved exploration remains, or
   parts independently verifiable through an already-stable interface.

   Keep together edits sharing one invariant: impl+tests, migration+its callers, rename+all
   references.

   Single file needing end-to-end read >~500 LOC = warning, not automatic split — isolate only if
   that brings phase total under budget.

   Genuinely indivisible oversized phase: flag it, then either feed runner a prepared research
   summary, dispatch with stronger model/effort override, or run manually.

   Thresholds provisional — on phase-runner overflow, record it (memory note) and tune the anchor.
3. **One explicit approval** — present the finished plan and stop. Wait for the user to say go.
   Never start phase execution in the same turn as presenting the plan.
4. **Record the base SHA** — capture `git rev-parse HEAD` before any phase starts. This is what
   the taster-bee diffs against later.
5. **Run phases** — dispatch each phase to a `phase-runner` agent, giving it: the plan path, the
   phase name, and that phase's owned-files list. Run file-disjoint phases in parallel (single
   message, multiple Agent calls); run everything else sequentially, waiting for each phase to
   finish before starting the next. The unit runs inside a worktree created per `work-next`'s
   canonical worktree-per-unit lifecycle.
6. **Check per phase** — after each phase, review its report. Per-phase checks are targeted and
   advisory only; the SINGLE full `npm run gate` runs on main, after all phases are integrated
   (not inside the worktree, not after every phase).
7. **Independent review** — dispatch a `taster-bee` agent against `base..HEAD` with the base SHA,
   the allowed paths, and the plan path (for its acceptance criteria) explicitly passed in.
8. **Remediate** — any FAIL inside the approved scope gets auto-remediated (dispatch the fix,
   don't ask). After every remediation, run a fresh `taster-bee` pass — don't declare done off a
   stale review. Do NOT auto-remediate: repeated identical failure, new scope, a destructive
   action, or an unresolved product choice — stop and ask instead.
9. **Commit** — one commit per phase, linear history, no merge commits, each carrying a
   `Work: W-NNN` trailer matching the backlog row's ID.
10. **Clear the row** — delete the row from `specs/backlog.md` once review is clean and gate is
    green.

## Stop conditions

Halt and ask the user rather than pushing through: the same failure repeating, scope growing
beyond the approved plan, anything destructive, or a product decision only the user can make.
