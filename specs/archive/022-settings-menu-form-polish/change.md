---
status: archived
backlog: —
---

# Change: settings-menu-form-polish

## Why

Five dogfood-surfaced UI polish fixes bundled together: (1) mobile taps on form fields leave a
lingering focus ring that reads as a stuck outline; (2) a combat created without a name persists
a blank title, which reads as broken rather than defaulted; (3) the Settings theme control is a
three-button ToggleGroup while language right beside it is a clean dropdown — inconsistent;
(4) the About link clutters the Settings screen; (5) the `⋮` context menus have cramped,
hard-to-hit items on touch.

## What changes

By capability-spec ID:

| ID | Change |
|----|--------|
| `SET-2` | amend: the theme selector is rendered as a `Select` dropdown (same component/shape as the SET-1 language selector), replacing the three-button `ToggleGroup`. Options unchanged (System / Dark / Light), `store.updateSettings({ theme })` behavior unchanged. |
| `SET-5` | amend: the About link row is removed from the Settings screen. The `/about` route and page are **unchanged** and still reachable by direct URL and by the app nav (PLT-3 destinations unchanged). |
| `CLS-2` | amend: creating a combat whose title is blank/whitespace-only persists a **localized default title** (a new paraglide key, "New combat") as the stored title instead of an empty string. Applies to Create only. |
| `CLS-1` | amend (note): because created combats now carry a real title, the "Untitled combat" placeholder now only surfaces for combats whose title is empty by other means (e.g. edited-to-blank). The placeholder itself and its key are unchanged. |
| `PLT-2` | amend: (a) form fields suppress their focus ring for touch/pointer focus (`:focus:not(:focus-visible)`) while keyboard-`Tab` focus keeps the visible ring on all viewports; (b) the three `⋮` context menus (`CombatRowMenu`, `CombatantRow`, `CombatHeader`) get larger, ≥44px-tall menu items on all viewports. |
| `PLT-5` | amend (note): visible-focus a11y is preserved — keyboard focus still shows a ring everywhere; only pointer/touch focus (which never needs the ring) is suppressed. |

## Acceptance criteria

- [ ] `SET-2`: The Settings theme control renders as a `Select` dropdown (`SelectTrigger` +
      `SelectContent` + `SelectItem`), not a `ToggleGroup`; it offers System / Dark / Light,
      shows the current theme in the trigger, and selecting an option calls
      `store.updateSettings({ theme })` (choice persists across reload).
- [ ] `SET-5`: The Settings screen no longer renders an About link/row. Navigating directly to
      `/about` still renders the About page unchanged, and About remains a nav destination
      (PLT-3).
- [ ] `CLS-2`: Creating a combat with the title field left blank (or whitespace-only) results in
      a stored combat whose title is the localized "New combat" string (resolved from a paraglide
      message key, not a hardcoded literal), visible as the row title without relying on the
      placeholder. Creating with a non-blank title stores that title verbatim.
- [ ] `CLS-1`: The "Untitled combat" placeholder key is unchanged and still renders for a combat
      whose stored title is empty/whitespace (e.g. an existing combat or one edited to blank).
- [ ] `PLT-2` (focus): On a form field, pointer/touch focus shows no focus ring, while focusing
      the same field via keyboard `Tab` shows the visible focus ring — on both mobile and desktop
      viewports. Implemented via `:focus:not(:focus-visible)` (or equivalent), not by removing
      the focus style outright.
- [ ] `PLT-2` (menus): Each item in the `CombatRowMenu`, `CombatantRow` `⋮`, and `CombatHeader`
      `⋮` dropdown menus measures ≥44px on the touch axis.
- [ ] The gate (`npm run gate`) passes: lint, check, unit tests, build.

## Out of scope

- The `/about` route and page content — removed only from the Settings screen, otherwise untouched.
- Converting the `⋮` context menus into mobile bottom-drawers — explicitly **not** done; they
  stay dropdowns, only larger. (User chose "larger only, no drawer".)
- The `InitCell` manual-init `Popover` and the `CombatHeader` round/escalation `Popover`s — these
  are popovers, not the `⋮` `DropdownMenu`s, and are not touched.
- The language selector (SET-1) — already a dropdown, unchanged.
- Theme options/values and the `[data-theme]` application mechanism (SET-2) — only the control's
  presentation changes, not the set of themes or how they apply.
- Editing an existing combat to a blank title (CLS-3) — the default-title fallback is applied on
  Create only; edit-to-blank behavior is unchanged.
- Any store/domain/persistence signature change beyond the CLS-2 create-path default title.
