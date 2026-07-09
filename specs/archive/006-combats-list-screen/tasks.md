# Tasks: combats-list-screen

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

## Phase 1 — AppShell + per-breakpoint nav

**Owns:** `src/routes/+layout.svelte`, `src/lib/components/app/AppShell.svelte` (new),
`src/lib/components/app/NavSidebar.svelte` (new), `src/lib/components/app/AppHeader.svelte`
(new), and matching new `*.svelte.spec.ts` files for the three new components.

**Parallel-safe with:** Phase 2, Phase 3, Phase 4, Phase 5

- [ ] Build `NavSidebar` (mobile, swipe-right reveal) with links to Combats / Settings / About,
      per `specs/reference/component-inventory.md` §Hierarchy and the approved
      `specs/design/prototype.html` chrome.
- [ ] Build `AppHeader` covering both tablet (burger → Sheet) and desktop (`.nav-desktop`,
      3 icon buttons) modes per the same reference.
- [ ] Build `AppShell` that composes NavSidebar/AppHeader by breakpoint and renders the route
      outlet (`{@render children()}`), replacing the bare passthrough in `+layout.svelte`.
- [ ] Wire `+layout.svelte` to mount `AppShell` around `{@render children()}`, keeping the
      existing `store.hydrate()` boot-on-mount behavior unchanged.
- [ ] All colors/spacing/type from `src/routes/layout.css` tokens; visible focus, ≥44px targets,
      no color-alone signifiers (PLT-5) on every nav control.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — CombatList family restyle

**Owns:** `src/lib/components/app/CombatList.svelte`, `src/lib/components/app/CombatRow.svelte`,
`src/lib/components/app/ColorTagDot.svelte`, `src/lib/components/app/CombatRowMenu.svelte`,
`src/lib/components/app/EmptyState.svelte`, and their existing `*.svelte.spec.ts` files.

**Parallel-safe with:** Phase 1, Phase 3, Phase 4, Phase 5

- [ ] Restyle CombatList / CombatRow / ColorTagDot / CombatRowMenu / EmptyState to the approved
      template (CLS-1), tokens only, no hard-coded colors.
- [ ] Restyle the drag-reorder handle/affordance on CombatRow to the template (CLS-6) —
      styling/visual only, no change to `svelte-dnd-action` wiring or reorder mechanics.
- [ ] PLT-5: visible focus, ≥44px touch targets, no color-alone (type/tag keep label/icon
      pairing) on every restyled row/control.
- [ ] Existing CombatList/CombatRow/ColorTagDot/CombatRowMenu/EmptyState spec files still pass
      unchanged (no behavior assertions altered).

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 3 — CombatFormDialog restyle

**Owns:** `src/lib/components/app/CombatFormDialog.svelte`,
`src/lib/components/app/CombatFormDialog.svelte.spec.ts`

**Parallel-safe with:** Phase 1, Phase 2, Phase 4, Phase 5

- [ ] Restyle the CombatFormDialog overlay (create + edit, CLS-2/CLS-3) to the approved template,
      tokens only.
- [ ] PLT-5 holds: visible focus, ≥44px targets, no color-alone.
- [ ] Existing CombatFormDialog spec still passes unchanged (no behavior/validation change).

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 4 — ConfirmDialog restyle

**Owns:** `src/lib/components/app/ConfirmDialog.svelte`, and a new
`src/lib/components/app/ConfirmDialog.svelte.spec.ts` if none exists yet (check first — do not
duplicate/overwrite an existing one).

**Parallel-safe with:** Phase 1, Phase 2, Phase 3, Phase 5

- [ ] Restyle the delete ConfirmDialog (CLS-4) to the approved template, tokens only.
- [ ] PLT-5 holds: visible focus, ≥44px targets, no color-alone.
- [ ] No behavior change — confirm/cancel callbacks and gating unchanged.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 5 — Settings + About routes restyle

**Owns:** `src/routes/settings/+page.svelte`, `src/routes/about/+page.svelte`

**Parallel-safe with:** Phase 1, Phase 2, Phase 3, Phase 4

- [ ] Restyle Settings route (language/theme/data groups) to the approved template (SET-*),
      tokens only — no change to settings behavior (language switch, theme switch, export/
      import/reset actions).
- [ ] Restyle About route to the approved template — no content/copy change beyond what the
      template's layout requires.
- [ ] PLT-5 holds: visible focus, ≥44px targets, no color-alone.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 6 — Combats home layout integration

**Owns:** `src/routes/combats/+page.svelte`

**Parallel-safe with:** none (depends on Phase 1's AppShell existing, and reads the Phase 2/3
restyled child components — run after Phases 1-5 land)

- [ ] Apply responsive mobile/desktop layout (PLT-2/PLT-3) to the Combats home page now that
      AppShell/NavSidebar/AppHeader own the nav chrome — remove the ad-hoc `mx-auto max-w-md`
      wrapper if the template's layout now handles it, keep FAB placement correct per breakpoint.
- [ ] Verify populated + empty states render correctly inside the new AppShell in both mobile
      and desktop, both dark and light themes.
- [ ] No behavior/mechanics change — existing combats-home tests (if any) still pass unchanged.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 7 — Desktop create affordance (verification FAIL fix)

Fixes the `spec-verifier` FAIL on AC 1: `specs/design/prototype.html:446-460` requires the create
control to differ per breakpoint — desktop shows a header `.icon-btn.create-desktop` "+" button
and hides the FAB; mobile shows only the FAB and hides the desktop CTA/empty-state button. Shipped
Phase 1/6 code has neither the desktop header button nor any responsive hiding.

**Owns:** `src/lib/components/app/AppHeader.svelte`, `src/lib/components/app/FAB.svelte`,
`src/routes/combats/+page.svelte`, `src/lib/components/app/header-action.svelte.ts` (new)

**Parallel-safe with:** none (last phase, sequential after Phase 6)

- [ ] Add a small singleton rune-backed module `header-action.svelte.ts` exporting a
      `headerAction` object holding an optional `Snippet` (get/set), so a route can hand `AppHeader`
      a page-specific action without `AppShell` having to thread props through every route.
- [ ] `AppHeader.svelte`: read `headerAction.current` and render it (desktop-only, `hidden lg:flex`
      wrapper) in the header bar near `.nav-desktop`, matching the prototype's `.icon-btn
      create-desktop` placement/sizing (`min-h-11 min-w-11` like the existing nav icon buttons).
- [ ] `FAB.svelte`: accept an optional `class` prop (merged via existing `cn`/class-merge
      convention) so a consumer can add responsive classes — do not hard-code any desktop-hide
      rule inside `FAB.svelte` itself (it's shared with the future Combat-Active advance-turn FAB,
      which the prototype explicitly leaves untouched).
- [ ] `src/routes/combats/+page.svelte`: on mount, set `headerAction.current` to a `+` button
      snippet (create action, same `openCreate` handler, `m['combats.create']()` label) styled
      like `AppHeader`'s existing nav icon buttons; clear it on unmount (`$effect` cleanup).
- [ ] Populated-list FAB: add `lg:hidden` so it disappears on desktop (header button takes over).
- [ ] Empty-state CTA button: switch to `hidden lg:flex` (desktop-only) instead of always-visible;
      add a `FAB` (mobile-only, `lg:hidden`) next to it so the empty state also has a create
      affordance on mobile, matching the prototype's mobile/desktop split.
- [ ] No mechanics change — `openCreate`/`store` wiring stays identical, only the render/visibility
      condition changes.

**Gate:** `npm run gate` must pass before this phase is reported done.
