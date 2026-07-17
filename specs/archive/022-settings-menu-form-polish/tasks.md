# Tasks: 022-settings-menu-form-polish

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

All four phases below own strictly disjoint file sets and have no ordering dependency on each
other, so every phase is parallel-safe with every other. Each phase runs its own gate.

## Phase 1 — Settings theme Select + drop About row (SET-2, SET-5)

**Owns:** `src/routes/settings/+page.svelte`
**Parallel-safe with:** Phase 2, Phase 3, Phase 4

- [ ] SET-2: replace the three-button `ToggleGroup`/`ToggleGroupItem` theme control with a
      `Select` (`SelectTrigger` + `SelectContent` + `SelectItem`), matching the shape of the
      SET-1 language selector directly above it. Options unchanged: System / Dark / Light.
- [ ] Trigger shows the current theme (`store.settings.theme`); selecting an option still calls
      `store.updateSettings({ theme })`; drop the now-unused `ToggleGroup`/`ToggleGroupItem`
      imports.
- [ ] Reuse the existing `settings.theme.system` / `settings.theme.dark` / `settings.theme.light`
      message keys for the option labels (no new i18n keys — theme labels already exist).
- [ ] SET-5: remove the About `<a href="/about">` link row (and its now-unused `chromeIcon`
      chevron import if nothing else uses it). Do NOT touch the `/about` route/page — it stays
      reachable by URL and app nav (out of scope).
- [ ] Verify no dead imports remain (`get_file_problems` clean).

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — Blank-title create default (CLS-2)

**Owns:** `src/lib/components/app/CombatFormDialog.svelte`,
`src/lib/components/app/CombatFormDialog.svelte.spec.ts`,
`messages/en.json`, `messages/de.json`, `messages/es.json`, `messages/fr.json`,
`messages/ja.json`, `messages/ru.json`
**Parallel-safe with:** Phase 1, Phase 3, Phase 4

- [ ] Add one new paraglide message key ("New combat") to all six `messages/*.json` locale files
      (translated per locale, matching the existing 6-locale parity — see
      `specs/reference/i18n-catalog.md`). Do NOT hand-edit `src/lib/paraglide/*`; it is generated
      (regenerates on build / `npm run prepare`).
- [ ] In `CombatFormDialog.svelte` `submit()`, on the **create path only** (`combat == null`),
      when the entered `title` is blank/whitespace-only, pass the resolved localized default
      (`m['...new combat...']()`) as the title to `store.createCombat(...)` instead of the empty
      string. Non-blank titles pass through verbatim. Edit path unchanged (CLS-3 out of scope).
- [ ] Do NOT change the pure domain `createCombat` / `createCombatInList` signatures — the
      default title is resolved at the component seam (i18n lives in the component layer, not pure
      domain). CLS-1 placeholder key stays untouched.
- [ ] Extend `CombatFormDialog.svelte.spec.ts` to cover blank-title create → localized default
      persisted, and non-blank create → verbatim title.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 3 — Pointer-focus ring suppression (PLT-2 focus, PLT-5)

**Owns:** `src/routes/layout.css`
**Parallel-safe with:** Phase 1, Phase 2, Phase 4

- [ ] Add a global base rule (in `layout.css` `@layer base`) so form controls
      (`input`, `select`, `textarea`, and their `[data-slot]` wrappers as needed) suppress the
      focus ring/outline for pointer/touch focus via `:focus:not(:focus-visible)` (or equivalent)
      on ALL viewports, while keyboard `:focus-visible` (Tab) keeps the visible ring everywhere.
- [ ] PLT-5: do not remove the focus style outright — keyboard visible-focus a11y must be
      preserved; only pointer/touch focus (which never needs the ring) is suppressed. Verify the
      existing shared-token ring (`--ring`) still shows on `:focus-visible`.
- [ ] Keep the fix in the single global CSS owner; do NOT edit the shared
      `ui/input`/`ui/select`/`ui/textarea` component classes (those stay owned by no phase here —
      the base rule covers them centrally).

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 4 — Larger touch targets in the three ⋮ menus (PLT-2 menus)

**Owns:** `src/lib/components/ui/dropdown-menu/dropdown-menu-item.svelte`,
`src/lib/components/app/CombatRowMenu.svelte`,
`src/lib/components/app/CombatantRow.svelte`,
`src/lib/components/app/CombatHeader.svelte`
**Parallel-safe with:** Phase 1, Phase 2, Phase 3

- [ ] Make each item in the `CombatRowMenu`, `CombatantRow` `⋮`, and `CombatHeader` `⋮`
      `DropdownMenu`s measure ≥44px on the touch axis on all viewports (the shared
      `dropdown-menu-item.svelte` currently sets cramped `px-1.5 py-1`). Prefer bumping min-height
      / vertical padding on the shared item — verified only these three app components consume the
      `DropdownMenuItem`, so the change stays scoped to the ⋮ menus.
- [ ] Keep them as dropdowns — do NOT convert to bottom-drawers (explicitly out of scope, "larger
      only"). Do NOT touch the `InitCell` manual-init `Popover` or the `CombatHeader`
      round/escalation `Popover`s — those are Popovers, not `DropdownMenu`s (out of scope).
- [ ] If per-call-site tuning is needed, adjust the `class` on the `DropdownMenuItem`s within the
      three owned app components rather than any other shared UI file.

**Gate:** `npm run gate` must pass before this phase is reported done.
