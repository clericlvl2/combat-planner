---
id: combats-list
prefix: CLS
---

# Combats list — CRUD, reorder, color tags, first launch

Export/import of combats (single or all) is owned by [[import-export]], not here. The 8-swatch
color-tag palette values live in [[../reference/glossary-conditions]] (color tokens) — this file
owns only that a combat has one.

## CLS-1 — List display

Combats render as a vertical list; each row shows Title, Description, and a Color tag, plus a
per-row trailing `⋮` overflow menu (Edit / Delete; the Export/share item is pending under CLS-8).
A combat with a blank/whitespace-only title renders a placeholder title instead of a blank row.

**AC:**
- Every combat row displays title, description, and its color tag.
- A combat whose title is empty or whitespace-only shows the localized placeholder title
  ("Untitled combat") instead of a blank row.
- The row `⋮` menu exposes Edit and Delete. (The Export/share item is added when CLS-8 lands —
  [[import-export]].)

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

Tapping a row opens that combat. Navigating directly to a non-existent or stale combat id (e.g.
a deleted combat's old URL) shows a styled not-found state instead of a bare error, with a
visible, labelled control returning to the Combats list ([[platform]] PLT-10 owns the separate,
broader app-level error boundary for thrown errors; this is the expected not-found case for a
missing id, not a thrown error).

**AC:**
- Tapping anywhere on a combat row (outside its `⋮` menu) navigates to that combat.
- Navigating to `/combats/<nonexistent-id>` renders a not-found state including a visible,
  labelled control that navigates back to `/combats`.

## CLS-6 — Manual reorder

Drag to reorder; the new order persists (`listOrder`).

**AC:**
- Dragging a row to a new position updates the list order, and the order survives a reload.

## CLS-7 — First launch

On first launch (`!firstLaunchDone`), one empty combat is auto-created and opened directly (its
own combat page, in Setup — [[lifecycle]] LIF-1); the flag is then set. Subsequent launches land
on the Combats home list. If first-launch seeding yields no combat (the seed produces an empty
list), the app lands on `/combats` instead — a deterministic fallback, not a thrown error;
normal first-launch behavior (one seeded combat opened directly) is unaffected.

**AC:**
- The very first time the app is opened, exactly one empty combat exists and its page is shown.
- Any later launch lands on the Combats home list, not a combat page.
- `resetAll` ([[settings]] SET-3) clears the flag so first-launch behavior re-runs once.
- If first-launch seeding yields no combat, the app lands on `/combats` without throwing an
  unhandled error.

## CLS-8 — Export / import (pointer)

Export/import of a single combat or all combats is fully specified in [[import-export]]
(IMP-1..IMP-5), including the row `⋮` Export/share action and the Combats-home Import control.

## CLS-9 — Search

A `SearchField` above the list filters visible rows by title, in real time, case-insensitively.
It is view-local only: the query is never persisted (no store/domain write, ADR-002) and is lost
on navigation/reload. Shown only while the (unfiltered) list is non-empty; hidden entirely on the
empty-state screen (CLS-7/empty combats list) since there's nothing to search.

**AC:**
- Typing in the search field filters the visible combat rows to those whose title contains the
  query (case-insensitive); clearing the field restores the full list.
- The search field is not rendered when the combats list is empty.
- The typed query is never written to the store/Dexie and does not survive a reload.
