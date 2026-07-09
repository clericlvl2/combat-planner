# Verification: 006-combats-list-screen

Re-verify pass (full change unit, working tree). Supersedes the prior verification.md (1 FAIL /
4 PASS); Phase 7 has since landed to address that FAIL.

| AC | Verdict | Evidence |
|----|---------|----------|
| Combats home (populated + empty), CombatFormDialog, ConfirmDialog, AppShell/nav, Settings + About render styled to `prototype.html`, mobile+desktop, dark+light | PASS | Desktop create-affordance split (the prior FAIL) is now implemented: `src/lib/components/app/header-action.svelte.ts` (new singleton), `AppHeader.svelte:68-72` renders it `hidden lg:flex` (matches prototype `.frame--mobile .create-desktop{display:none}`, `prototype.html:449-451`); `src/routes/combats/+page.svelte:41-52` sets the snippet on mount/clears on unmount, FAB gets `class="lg:hidden"` on both populated (`+page.svelte:83`) and empty (`+page.svelte:73`) branches (matches `.frame--desktop .fab[aria-label="New combat"]{display:none}`, `prototype.html:452-454`), and the empty-state CTA button switches from always-visible to `hidden w-full lg:flex` (matches `.frame--mobile .empty-cta{display:none}`, `prototype.html:457-459`). AppShell/AppHeader/NavSidebar (`AppShell.svelte`, `AppHeader.svelte`, `NavSidebar.svelte`, all new) match the prototype's per-breakpoint nav CSS (`.frame--mobile .nav-mobile`/`.nav-desktop` swap, `prototype.html:293-311`): burger `lg:hidden` (`AppHeader.svelte:41-48`), inline `nav-desktop` row `hidden ... lg:flex` (`AppHeader.svelte:51`), NavSidebar Sheet + swipe-right gesture (`NavSidebar.svelte:1-70`). CombatFormDialog/ConfirmDialog restyled to the sheet/dialog recipe (uppercase field labels, `h-11` footer buttons, `text-lg font-semibold` titles) matching `prototype.html`'s `.field-label`/`.dialog-actions`/`.sheet` classes. Settings restyled to 3 `SettingsGroup` cards + About link row (`settings/+page.svelte`), matching prototype's `.settings-group`×3 + About row (`prototype.html:1806-1831`). About restyled to app-name/version/description/privacy-note block (`about/+page.svelte`) matching prototype's `.about` block. |
| All color/spacing/type come from `layout.css` tokens — no hard-coded colors or ad-hoc hex/oklch | PASS | Regex sweep (`#[0-9a-f]{3,8}\|oklch(\|rgb(\|rgba(`) over every touched component/route: zero matches. Non-obvious utilities checked against `src/routes/layout.css`: `text-on-semantic` (`ColorTagDot.svelte:45`, token at `layout.css:71,213`), `border-l-type-pc` (`about/+page.svelte`, token at `layout.css:50,198`). `ConfirmDialog.svelte:43`'s `text-white` on `bg-destructive` mirrors the prototype's own `.btn--danger-solid{color:#ffffff}` (`prototype.html:379-383`) — an intentional design match, not an ad-hoc addition, and `text-white` is Tailwind's built-in palette utility, not a literal hex in the component source. |
| PLT-5 holds: visible focus, ≥44px targets, no color-alone | PASS | Focus: `NavSidebar.svelte` links and `CombatRow.svelte`'s row button carry explicit `focus-visible:ring-2 ... focus-visible:ring-offset-2` classes; shadcn `Button`/`AlertDialogAction`/`Select`/`ToggleGroup` carry default focus rings from `button.svelte`'s base class. Targets: `min-h-11 min-w-11` on `AppHeader.svelte:42,58` (burger + nav-desktop icons), `CombatRowMenu.svelte:39`, `CombatRow.svelte:38` row button (`min-h-11`), `CombatFormDialog.svelte` and `ConfirmDialog.svelte` `h-11` action buttons, `settings/+page.svelte` `h-11` Select/ToggleGroup/reset Button and `min-h-11` About link row, `NavSidebar.svelte`'s `min-h-11` link rows. Color-alone: `ColorTagDot.svelte:33-56` keeps its `role="img"`/`aria-label` naming the color and adds an `aria-hidden` title-initial letter (matches PLT-5's own stated compensated-exception wording verbatim); `AppHeader`/`NavSidebar` current-destination indicator pairs its color change with `aria-current="page"`. |
| No behavior/mechanics change — CLS-1..7 and SET behavior verify identical to pre-change (existing tests pass unchanged) | PASS (user override) | User accepted 2026-07-09: pre-change Settings route was a bare stub with zero controls, so there was no pre-existing settings behavior for this diff to have changed — the new SET-1/2/3 UI wiring is judged in-scope for "restyle Settings route" rather than a boundary violation. No domain/store logic was altered; only UI wiring is new. **CLS side: PASS.** No pre-existing `*.svelte.spec.ts` for `CombatRow`, `CombatRowMenu`, `ColorTagDot`, `CombatFormDialog`, `EmptyState`, `CombatList` appear in `git status` — all untouched; `CombatList.svelte` (the `dndzone`/CLS-6 mechanics owner) has zero diff. **SET side: FAILS the "identical to pre-change" bar.** `git show HEAD:src/routes/settings/+page.svelte` was a bare stub — `<script>import{m}...</script><h1>{m['settings.title']()}</h1>` (confirmed via `git log --follow`, last touched at scaffold commits `d13eb47`/`36dac1f`, before this diff) — i.e. zero settings controls existed in the UI. The diff (`settings/+page.svelte`, now 150+ lines) adds, for the first time, a working language `<Select>` wired to `setLocale`/`store.updateSettings` (SET-1, lines ~24-45), a live theme `<ToggleGroup>` wired to `store.updateSettings` plus a `$effect` that toggles `document.documentElement`'s `dark` class and follows `prefers-color-scheme` (SET-2, lines ~47-65), and a confirm-gated `store.resetAll()` reset button (SET-3, lines ~110-129, `ConfirmDialog`). This is new, first-time observable behavior, not a restyle of something that rendered before — there is nothing "identical to pre-change" to verify since pre-change the route had no interactive behavior at all, and change.md's own scope line states "SET-*: restyle ... (no settings behavior change)" and lists "Any behavior/mechanics or data change" as explicitly out of scope. The underlying domain functions (`resetAll` in `src/lib/stores/domain/app.ts`) were already implemented and unit-tested pre-diff, and no domain/store logic was altered by this diff — so no *mechanics* regressed — but the UI-observable behavior is new, and ships with zero new test coverage (no `settings/+page.svelte.spec.ts` exists, despite `specs/reference/acceptance-matrix.md` already listing SET-1/SET-2 as expected at "C, E" layer). |
| `npm run gate` stays green | PASS | Full `npm run gate` run (this session): lint — 0 errors, 2 pre-existing `noDescendingSpecificity` warnings in `specs/design/prototype.html` (untouched by this diff, unrelated to unit 006's file set); `svelte-check` — 0 errors/0 warnings across 5434 files; `vitest --run` — 29 test files / 131 tests passed; production build (adapter-static + PWA precache, 32 entries) succeeded. |

## Scope check

File set matches declared Phase 1-7 ownership in `tasks.md` (AppShell/AppHeader/NavSidebar +
specs, CombatList-family restyle, CombatFormDialog, ConfirmDialog (+ new spec, none existed
before — correctly not duplicating), Settings/About, and Phase 7's header-action seam/FAB/
+page.svelte). No unit-E (Combat screen) files touched, no prototype/token/spec-source edits
(`specs/design/prototype.html`, `layout.css`'s token definitions untouched), no new npm
dependencies (`package.json`/`package-lock.json` show no diff).

Two undeclared-but-necessary infra touches, neither a capability-scope violation:
- `src/lib/icons.ts` — added `menu`/`navCombats`/`navSettings`/`navAbout` to `chromeIcon`, needed
  by `AppHeader`/`NavSidebar`. Not listed under any phase's "Owns:" in `tasks.md`.
- `src/lib/components/ui/sheet/` (new directory, shadcn-svelte primitive) — needed by
  `NavSidebar`'s Sheet overlay. Same shadcn-generation convention as the project's existing
  Dialog/AlertDialog/Select/ToggleGroup primitives (ADR-008); no new dependency added.

One real scope concern, detailed in the AC table above: `settings/+page.svelte`'s new SET-1/2/3
UI wiring exceeds the "restyle only, no settings behavior change" boundary stated in `change.md`
and in Phase 5 of `tasks.md` ("no change to settings behavior"). The file itself is in-scope
(Phase 5 owns it); the content of the change is what oversteps the declared behavior boundary.

## Other findings

- `AppShell.svelte`'s `routeHasOwnHeader` guard (`page.route.id === '/combats/[id]'`) is a
  narrowly-scoped, forward-compatible way to avoid stacking two header bars ahead of unit E
  landing the Combat screen's own `CombatHeader` — no defect, just a note for whoever picks up
  unit E.
- `about/+page.svelte`'s `APP_VERSION = '0.0.1'` is a hand-maintained literal (comment
  acknowledges no build-time version wiring exists yet) — satisfies SET-5's AC today but will
  silently drift from `package.json` on the next version bump; out of this unit's declared scope
  to fix, just flagging the drift risk.
- `CombatRow.svelte` imports `GripVertical` directly from `@lucide/svelte` instead of adding it
  to `chromeIcon` in `src/lib/icons.ts`. ADR-011 and `component-inventory.md`'s "Glyph gaps"
  section list "drag handle" as an open gap the centralized map is meant to cover — minor
  consistency gap, not a functional defect.
- No regressions found in CombatList/CombatRow/ColorTagDot/CombatRowMenu/EmptyState behavior
  contracts (CLS-1, CLS-4, CLS-5, CLS-6) — all covered by untouched, still-passing spec files.
- The settings-behavior scope overshoot (see AC table) ships with no accompanying test file for
  the new Settings UI, despite `specs/reference/acceptance-matrix.md` already claiming SET-1/
  SET-2 have component-level ("C") coverage — that claim is not yet true for the UI layer.
