---
name: spec-new
description: Scaffold a new change unit (specs/changes/NNN-slug/) from the templates and interview the user for Why, affected capability IDs, acceptance criteria, and out-of-scope. Use when the user wants to start a new feature/fix through the spec-driven workflow. Stops at draft — never implements.
---

Scaffold one new change unit and stop at `draft` for user approval. Do not write any code and do
not create `tasks.md` — that's `/spec-tasks`, after this draft is approved.

## Steps

1. Ask the user (if not already given): what slug (kebab-case, short), and — most importantly —
   the Why. Do not invent the Why; if it's not clear from context, ask. Check `specs/backlog.md`
   for a matching row; if this unit promotes one, record its `B-xxx` in `change.md`'s Why and flip
   that backlog row to `in-unit` with the Unit column linking `specs/changes/NNN-slug/`.
2. Read `specs/README.md` capability table to figure out which capability-spec ID prefixes this
   touches. Skim the relevant `specs/capabilities/*.md` files to check whether this is a new
   requirement or an amendment to an existing one — get this right, it drives `tasks.md` later.
3. Determine the next `NNN` by listing `specs/changes/` and `specs/archive/` and taking the
   highest existing number + 1 (zero-padded to 3 digits).
4. Create `specs/changes/NNN-slug/change.md` from `specs/templates/change.md`, filled in:
   - **Frontmatter** — `status: draft`; `backlog:` set to the `B-xxx` row from step 1 if this
     unit promotes one, else `—`.
   - **Why** — from step 1, in the user's own words where possible.
   - **What changes** — one row per affected ID, worded as "new requirement" or "amend: <what>".
   - **Acceptance criteria** — ask the user for these if not given; each bullet must be something
     a fresh read-only agent could verify from a diff alone (concrete, observable, no "should feel
     right" language).
   - **Out of scope** — ask explicitly: "what should this NOT touch?" Do not leave this section
     empty; if truly nothing is out of scope, say so explicitly rather than omitting the section.
5. Do not create `tasks.md` yet.
6. Present the filled `change.md` to the user and stop. State clearly: this is a draft
   (`status: draft`), nothing is approved or implemented yet, and once they approve it they (or
   this skill, if they ask in the same turn) should flip frontmatter to `status: approved` —
   `/spec-tasks` runs next and requires that flip.
