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
A combat with a blank/whitespace-only title renders a placeholder title instead of a blank row —
in practice this now only surfaces for a combat whose title went blank by some means other than
Create (e.g. edited to blank, CLS-3), since Create itself always persists a real title (CLS-2).
When there are no combats to show, an empty-state view renders in place of the list: an icon, a
short description, and a "New combat" call-to-action that creates one (same action as CLS-2). On
desktop, hovering anywhere over a combat row applies a whole-card hover highlight (see CLS-5 for
the matching whole-card click behavior and CLS-6 for the drag-handle carve-out). The row card's
corner radius matches the combatant card's radius ([[../reference/component-inventory]]).

**AC:**
- Every combat row displays title, description, and its color tag.
- A combat whose title is empty or whitespace-only shows the localized placeholder title
  ("Untitled combat") instead of a blank row (surfaces only for non-Create paths to blank —
  see CLS-2 for Create's default-title behavior).
- The row `⋮` menu exposes Edit and Delete. (The Export/share item is added when CLS-8 lands —
  [[import-export]].)
- When the combats list is empty, the empty-state view renders an icon, a description, and a
  "New combat" CTA (instead of a bare list or no content).
- On desktop, hovering anywhere over a combat row applies a whole-card hover highlight.

## CLS-2 — Create combat

Fields: Title, Description, Color tag (chosen from the preset swatch palette, rendered as a
single full-width stretched row of equal-width swatches — not a fixed-square wrapping grid). A
blank or whitespace-only Title is not stored as empty: it resolves to a localized default title
(paraglide key `combats.defaultTitle`, "New combat" — [[../reference/i18n-catalog]]), which is
persisted as the combat's stored title; a non-blank title is stored verbatim. This default-title
fallback applies to Create only — editing an existing combat to a blank title is unaffected
(CLS-3) and still surfaces the "Untitled combat" placeholder (CLS-1). New combat is added at the
**top** of the list. Creating past the 100-combat cap
([[../reference/limits]]) is blocked **silently**: nothing is created, the dialog stays open, and
no inline cap-error message is shown — amended: the prior cap-error banner and its
field-edit-clears-it behavior are both gone. The dialog is a centered `Dialog` on desktop
(≥1024px) and a bottom `Drawer` on mobile, sharing one form body
([[../reference/component-inventory]]). The create dialog's title reads "New combat" and its
primary button reads "Create"; the same dialog reused for editing (CLS-3) reads "Save" instead —
the button label is the only difference between create and edit mode. The dialog's Cancel button
renders inside the dialog panel's footer, alongside the primary button. Title/description
placeholders resolve from paraglide i18n keys. Color-tag swatch tiles are buttons that keep a
normal hover affordance; the currently-selected tile additionally carries a clear, persistent
selected indicator (a visible ring/outline) distinct from hover, since the color tag is a form
field whose current choice must stay visible.

**AC:**
- A newly created combat appears at the top of the list, in `state: setup` ([[lifecycle]] LIF-1).
- Creating a combat with a blank or whitespace-only title stores the localized default title
  (`combats.defaultTitle`, "New combat") as that combat's title, not an empty string; a non-blank
  title is stored verbatim.
- Creating a 101st combat is blocked silently: nothing is created, the dialog stays open, and no
  error message is shown.
- The form renders as a centered `Dialog` at ≥1024px and a bottom `Drawer` below it.
- The create dialog's title reads "New combat" and its primary button reads "Create"; the same
  dialog in edit mode (CLS-3) reads "Save".
- The Cancel button renders inside the dialog panel's footer, not outside the modal frame.
- Color-tag swatch tiles render as a single full-width stretched row of equal-width tiles, each
  keeping a normal hover affordance; the selected tile carries a persistent visible selected
  indicator distinct from hover; clicking a tile sets the color tag and moves the indicator.
- The title and description placeholders resolve from paraglide message keys, not hardcoded
  string literals.

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

The whole combat card is clickable/tappable to open that combat, **except** the drag handle
(CLS-6) and the `⋮` menu, which do not navigate. Navigating directly to a non-existent or stale
combat id (e.g. a deleted combat's old URL) shows a styled not-found state instead of a bare
error, with a visible, labelled control returning to the Combats list ([[platform]] PLT-10 owns
the separate, broader app-level error boundary for thrown errors; this is the expected
not-found case for a missing id, not a thrown error).

**AC:**
- Tapping/clicking anywhere on a combat card navigates to that combat, except taps on the drag
  handle or the `⋮` menu, which do not navigate.
- Navigating to `/combats/<nonexistent-id>` renders a not-found state including a visible,
  labelled control that navigates back to `/combats`.

## CLS-6 — Manual reorder

Drag to reorder; the new order persists (`listOrder`). Drag is initiated **only** from the
`lucide` grip-vertical handle — the grab/drag cursor affordance appears on the handle only, not
on the rest of the card (the rest of the card is reserved for the CLS-5 open-combat tap).

**AC:**
- Dragging a row to a new position updates the list order, and the order survives a reload.
- Drag-to-reorder starts only from the grip handle; the grab/drag cursor is present on the
  handle and not on the rest of the card.

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

A `SearchField` above the list filters visible rows by **title or description**, in real time,
case-insensitively, and highlights the matched substring in the rendered row. It is view-local
only: the query is never persisted (no store/domain write, ADR-002) and is lost on
navigation/reload. Shown only while the (unfiltered) list is non-empty; hidden entirely on the
empty-state screen (CLS-7/empty combats list) since there's nothing to search. The match
highlight (`<mark>`) has square corners — no rounded-corner styling.

**AC:**
- Typing in the search field filters the visible combat rows to those whose title or
  description contains the query (case-insensitive), with the matched substring highlighted in
  the rendered row; clearing the field restores the full list.
- The search match highlight has square corners (no rounded-corner class).
- The search field is not rendered when the combats list is empty.
- The typed query is never written to the store/Dexie and does not survive a reload.
