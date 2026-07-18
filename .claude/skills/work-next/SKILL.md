---
name: work-next
description: Scheduler for specs/backlog.md — picks the next backlog row to work and runs it through /work-small or /work-large as named by its Loop column. Use when the user says "work next", wants the backlog worked unattended, or asks what to do next. Do not use this to pick work arbitrarily outside the backlog table.
---

You are the scheduler. You never implement anything yourself — you pick a row and hand it to
the loop skill named on that row.

## Policy

1. **Resume first, per worktree.** Each active unit runs in its own worktree. If
   `specs/backlog.md` has row(s) in state `active`, resume the corresponding worktree(s) —
   don't reclaim them. **Multiple units may run in parallel**, one worktree each; parallelism
   also still happens *inside* a large unit's phases. Never rebase a worktree onto, or
   fast-forward into, a `main` whose last gate was red/ungated, and never start a new unit
   against an ungated main.
2. **Else pick.** If no row is `active` (or capacity remains for another parallel unit), pick
   the highest-priority unblocked row in state `ready` (skip `inbox` and `blocked`), oldest ID
   first on ties.
3. **Claim it.** Mark the chosen row `active` in `specs/backlog.md` **on main** and commit that
   claim immediately (`chore: claim W-NNN`) — see Backlog-mutation rule below.
4. **Run it.** Invoke `/work-small` or `/work-large` per that row's `Loop` column. Both loops run
   the unit through the canonical worktree-per-unit lifecycle below. Let that skill run its full
   loop, including the commit(s) and the row deletion at the end.
5. **Report.** Summarize what happened (loop used, gate result, commit) once the loop skill
   finishes or halts.

## Canonical worktree-per-unit lifecycle

One backlog row = one worktree. `/work-small` and `/work-large` both follow this lifecycle;
they reference it by name here rather than repeating it.

1. **Claim** — mark the row `active` in `specs/backlog.md` on main **and commit it immediately**
   (`chore: claim W-NNN`). Backlog edits (claim, row deletion, inbox follow-ups) happen **only on
   main and are committed at once** — never as an uncommitted working change and never on a
   worktree branch (an uncommitted claim would be wiped by another unit's rollback; a
   worktree-branch backlog edit would make `--ff-only` refuse against a dirty main).
2. **`EnterWorktree(name=<W-NNN-slug>)`** — session switches into `.claude/worktrees/<slug>` on
   `worktree-<slug>`, based on local HEAD (which already includes the committed claim).
3. **Prep** — `npx paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide`
   then `npm run prepare`, so in-worktree checks are honest.
4. **Run the loop in the worktree** — research, plan/sketch, the approval gate, implement, and
   per-phase **targeted** checks (advisory). Commit per phase (large) or once (small) on the
   worktree branch, each with the `Work: W-NNN` trailer.
5. **`ExitWorktree(action:keep)`** — session returns to the main checkout.
6. **Integrate linear** — rebase the worktree branch onto main *from inside the worktree*:
   `git -C .claude/worktrees/<slug> rebase main` (git refuses to rebase a branch that's checked
   out in another worktree, so this can't be run from the main checkout against the branch name).
   Then, on main, capture `pre=$(git rev-parse HEAD)` and `git merge --ff-only worktree-<slug>`.
   No merge commit.
7. **Authoritative full gate on main** — `npm run gate`. Green → done. Red → `git reset --hard
   $pre` (undo the FF; captured SHA, not `ORIG_HEAD`, which any intervening main op retargets)
   and re-enter the worktree via **`EnterWorktree(path=.claude/worktrees/<slug>)`** (re-creating
   by `name` is forbidden and would make a fresh tree) to fix.
8. **Clean up** — `git worktree remove --force .claude/worktrees/<slug>` (`--force` because the
   generated ignored files `src/lib/paraglide/`, `.svelte-kit/` are present) + delete the branch,
   then delete the backlog row on main (committed).

**Guard (parallel-unit hazard):** never rebase a worktree onto, or fast-forward into, a `main`
whose last gate was red/ungated; never start the next unit against an ungated main. "Unit done"
≡ full gate green on main. Enforce this in the skill, not by habit.

**Worktree caveats:** never run the full `npm run gate` inside a worktree (biome false-green +
missing generated deps); in-worktree checks are advisory only; in-worktree vitest needs
`CHOKIDAR_USEPOLLING=true` (sibling worktrees exhaust the inotify budget); never use WebStorm MCP
inside a worktree (it is bound to the main checkout and will read/write the wrong tree).

**Backlog-mutation rule:** claims, row deletions, and inbox follow-ups are edited **only on
main** and **committed immediately** — never left as an uncommitted working change, and never
made on a worktree branch.

## Inbox rows

Agents may append new backlog rows in state `inbox` with evidence backing the ask (e.g. a
follow-up spotted during another task). Only the user flips `inbox → ready` — never do this
yourself, and never pick an `inbox` row to work.

## Unattended batches

The user can approve many rows at once (flip several `inbox → ready`) and then invoke
`/work-next` repeatedly, or in a loop, to work through them one at a time without further
prompting — each invocation resumes/picks per the policy above.
