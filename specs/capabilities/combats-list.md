---
id: combats-list
prefix: CLS
---

# Combats list — CRUD, reorder, color tags, first launch

Sources: `PRD` §4 (decisions 1, 13, 17 combat-cap clause, 18), §6 Epic C (C1–C7; C8 pointer) ·
`Data Model` §2 (`firstLaunchDone`), §3 (Combat entity: `id`, `title`, `description`,
`colorTag`, `listOrder`), §7 (`firstLaunch`, `createCombat`, `reorderCombats`, `deleteCombat`) ·
`UX & IA` §2 (Navigation), §3 (Combats home) · `Test Plan` §6 (C1–C7 rows).

Export/import of combats (single or all) is owned by [[import-export]], not here. The 8-swatch
color-tag palette values live in [[../reference/glossary-conditions]] (color tokens) — this file
owns only that a combat has one.

## CLS-1 — List display

Combats render as a vertical list; each row shows Title, Description, and a Color tag, plus a
per-row trailing `⋮` overflow menu (Edit / Export-share / Delete).

**AC:**
- Every combat row displays title, description, and its color tag.
- The row `⋮` menu exposes exactly Edit, Export/share, and Delete.

## CLS-2 — Create combat

Fields: Title, Description, Color tag (chosen from the preset swatch palette). New combat is
added at the **top** of the list. Blocked at the 100-combat cap ([[../reference/limits]]) with a
message.

**AC:**
- A newly created combat appears at the top of the list, in `state: setup` ([[lifecycle]] LIF-1).
- Creating a 101st combat is blocked with a message; nothing is created.

## CLS-3 — Edit combat

The same Title / Description / Color tag fields are editable on an existing combat via the same
form.

**AC:**
- Editing a combat updates its title/description/color tag without affecting its roster or state.

## CLS-4 — Delete combat

Requires a confirmation prompt. Deletion is **permanent** — not undoable (outside the per-combat
Undo scope, see [[undo-redo]] UND-2). Deletes the combat and everything owned by it
([[combatants]] CBT-8).

**AC:**
- Deleting a combat always shows a confirmation dialog first.
- Once confirmed, the combat and its combatants/undo-history/HP-logs are gone with no Undo path.

## CLS-5 — Open a combat

Tapping a row opens that combat.

**AC:**
- Tapping anywhere on a combat row (outside its `⋮` menu) navigates to that combat.

## CLS-6 — Manual reorder

Drag to reorder; the new order persists (`listOrder`).

**AC:**
- Dragging a row to a new position updates the list order, and the order survives a reload.

## CLS-7 — First launch

On first launch (`!firstLaunchDone`), one empty combat is auto-created and opened directly (its
own combat page, in Setup — [[lifecycle]] LIF-1); the flag is then set. Subsequent launches land
on the Combats home list.

**AC:**
- The very first time the app is opened, exactly one empty combat exists and its page is shown.
- Any later launch lands on the Combats home list, not a combat page.
- `resetAll` ([[settings]] SET-3) clears the flag so first-launch behavior re-runs once.

## CLS-8 — Export / import (pointer)

Export/import of a single combat or all combats is fully specified in [[import-export]]
(IMP-1..IMP-5), including the row `⋮` Export/share action and the Combats-home Import control.
