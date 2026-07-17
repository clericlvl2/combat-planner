# specs/ — layout

What lives here now that behavior is owned by code + tests:

- **`adr/`** — architecture decision records. The "why" behind stack/tooling choices
  (ADR-001..013). See `adr/README.md` for the index.
- **`PRODUCT.md`** — what the app is, who it's for, goals and explicit non-goals. Stable,
  short.
- **`backlog.md`** — future work only. One table of `W-NNN` rows (state: inbox / ready /
  active / blocked); completed rows are deleted, `Work: W-NNN` commit trailers own history.
- **`reference/glossary-conditions.md`** — 13th Age domain rules (conditions, terms) not
  derivable from code.
- **`CHANGELOG.md`** — frozen: user-facing release history up to the code-SOT migration. No
  new per-task rows.

Everything else about current app behavior lives in the code itself and its tests — there is
no parallel prose description to keep in sync.

## Work loops

Two skills drive all work from `backlog.md`:

- **`/work-small`** — small, low-risk changes: inline sketch, approval, implement, gate,
  commit.
- **`/work-large`** — everything else: full plan file, phased execution, independent review,
  commit.
- **`/work-next`** — scheduler: resumes an `active` row or picks the next `ready` one and
  runs it through the loop named on that row.
