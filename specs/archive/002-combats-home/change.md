---
status: archived
backlog: —
---

# Change: combats-home

## Why

M2 shipped the combat screen vertical slice with a hardcoded single combat and no home — the
`/combats` route is a stub that immediately redirects to `store.combats[0]`. M3 (per
`specs/backlog.md` Milestones table) is the multi-encounter prep slice: a real Combats home
(list, create, edit, delete, reorder) plus first-launch routing that actually branches instead
of always redirecting. This is the next milestone in the roadmap, not a promoted backlog row.

## What changes

| ID | Change |
|----|--------|
| `CLS-1` | new requirement — combat list rendering (title/description/color tag + `⋮` menu: Edit/Delete) |
| `CLS-2` | new requirement — create combat (Title/Description/Color tag form, new at top, 100-cap message) |
| `CLS-3` | new requirement — edit combat (same form fields on an existing combat); adds a domain `editCombat` fn + `CombatStore.editCombat` method (none exists today — only per-combatant field edits exist) |
| `CLS-4` | new requirement — delete combat (confirm dialog, permanent, cascades to combatants/undo-history/HP-logs) |
| `CLS-5` | new requirement — open a combat (tap row navigates) |
| `CLS-6` | new requirement — manual drag reorder (svelte-dnd-action per ADR-006), persists `listOrder` |
| `CLS-7` | amend — wire the existing `App.firstLaunch` domain logic into routing. Today `src/routes/+page.ts` unconditionally redirects to `/combats`, and `src/routes/combats/+page.svelte` unconditionally redirects to `store.combats[0]` on every launch (M2 stub, "no home"). Needs to branch: first launch → open the seeded combat directly; subsequent launches → render the Combats home list. |

`CLS-8` (export/import row action) stays a pointer to `[[import-export]]` — not touched here.

## Acceptance criteria

- [ ] `/combats` renders a vertical list of combat rows, each showing title, description, and
      color tag.
- [ ] Each row has a trailing `⋮` menu with exactly Edit and Delete (no Export/share item or
      placeholder in this unit).
- [ ] Creating a combat (Title/Description/Color tag form) adds it at the top of the list, in
      `state: setup`.
- [ ] Attempting to create a 101st combat is blocked with the `errors.combatCap` message; no
      combat is created.
- [ ] Editing a combat via the row's Edit menu updates title/description/color tag without
      touching its roster or `state`.
- [ ] Deleting a combat always shows a confirmation dialog first; confirming removes the combat
      and its combatants/undo-redo stack/HP-logs with no Undo path (per `[[undo-redo]]` UND-2 —
      already true at the domain layer, verify the UI doesn't add one).
- [ ] Tapping a row (outside its `⋮` menu) navigates to `/combats/[id]`.
- [ ] Dragging a row to a new position updates list order, and the order survives a reload.
- [ ] On first launch (`!firstLaunchDone`), exactly one empty combat is auto-created and its page
      opens directly; the flag is then set.
- [ ] Any subsequent launch lands on the Combats home list, not a combat page.
- [ ] `resetAll` (Settings) clears the flag so first-launch behavior re-runs once (verify existing
      behavior still holds through the new routing).
- [ ] `npm run gate` passes.

## Out of scope

- `CLS-8` / export, import, and the Combats-home Import control — owned by `[[import-export]]`,
  scheduled for M5.
- PWA shell, offline precache, install/update UI — M4.
- Settings/About/i18n locale switching — already shipped or owned by M5; this unit only consumes
  already-cataloged `combats.*` i18n keys, it does not add new ones.
- a11y/theming polish pass beyond what's needed to reuse existing shadcn-svelte components — M6.
- Any change to per-combatant screen (`/combats/[id]`), HP, initiative, turns/rounds, conditions,
  or undo/redo *mechanics* — all already shipped in M2; this unit only adds the combat-level
  (not combatant-level) CRUD/list surface.
