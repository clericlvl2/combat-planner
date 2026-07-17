# Verification: 022-settings-menu-form-polish

| AC | Verdict | Evidence |
|----|---------|----------|
| SET-2 (Select dropdown, System/Dark/Light, updateSettings, persists) | PASS | src/routes/settings/+page.svelte:83-93 renders `Select`/`SelectTrigger`/`SelectContent`/`SelectItem` (ToggleGroup import removed, line 10 diff); `themes` array = `['system','dark','light']` (line ~46); `onThemeChange` (unchanged, line ~50) calls `store.updateSettings({ theme: next as Theme })`; trigger shows `themeLabel[store.settings.theme]()` (line 84) |
| SET-5 (About row removed from Settings; /about still reachable via URL + nav) | PASS | src/routes/settings/+page.svelte: `<a href="/about">` row and `chromeIcon`/`ChevronIcon` import deleted (diff hunk removing lines ~118-124); `src/routes/about/+page.svelte` untouched (not in diff); nav destinations unchanged — `DesktopNav.svelte:18`, `AppHeader.svelte:25`, `NavSidebar.svelte:20` all still list `{ href: '/about', ... }` |
| CLS-2 (blank/whitespace title on Create → localized "New combat" default; non-blank stored verbatim) | PASS | new key `combats.defaultTitle` = "New combat" added to all 6 locale files (messages/en.json:18 and de/es/fr/ja/ru.json, one line each); src/lib/components/app/CombatFormDialog.svelte:72 — `const resolvedTitle = title.trim() ? title : m['combats.defaultTitle']();` then `store.createCombat({ title: resolvedTitle, ... })`, so non-blank `title` passes through unchanged and blank/whitespace resolves to the message fn; covered by two new tests in CombatFormDialog.svelte.spec.ts (blank and whitespace-only cases) asserting `createCombatFn` called with `title: m['combats.defaultTitle']()` |
| CLS-1 (Untitled-combat placeholder key/behavior unchanged) | PASS | no diff touches the placeholder key `combats.untitled` (still present, messages/en.json:17, value "Untitled combat" unchanged) or any combats-list row-rendering code; only the Create path in CombatFormDialog.svelte changed, not edit-to-blank or list rendering |
| PLT-2 focus (pointer/touch focus ring suppressed via :focus:not(:focus-visible); keyboard Tab keeps ring) | PASS | src/routes/layout.css:172-183 adds `input:focus:not(:focus-visible), select:focus:not(:focus-visible), textarea:focus:not(:focus-visible), [data-slot="input"]:focus:not(:focus-visible), [data-slot="select-trigger"]:focus:not(:focus-visible), [data-slot="textarea"]:focus:not(:focus-visible) { outline: none; box-shadow: none; }` — this only suppresses the ring when `:focus` matches but `:focus-visible` does not (i.e., pointer/touch focus); does not touch any `:focus-visible` rule, so keyboard-Tab ring is preserved everywhere it already existed |
| PLT-2 menus (CombatRowMenu, CombatantRow ⋮, CombatHeader ⋮ items ≥44px touch axis) | PASS | src/lib/components/ui/dropdown-menu/dropdown-menu-item.svelte:23 changed `py-1` → `px-2 py-1 min-h-11` (44px) on the shared `DropdownMenuItem` primitive; all three menus use this shared component and no other file — `CombatRowMenu.svelte:48,52`, `CombatantRow.svelte:148,152,157`, `CombatHeader.svelte:160,164,169,173,177` all render `<DropdownMenuItem>` with no per-instance height override, so the `min-h-11` applies uniformly |
| Gate passes (lint, check, unit tests, build) | PASS | `npm run gate` run locally: lint via biome reported `0 ERRORS 0 WARNINGS`; build completed (`✓ built in 6.92s`, adapter-static wrote `build`); full run showed no failing test/lint/check output |

## Scope check

In-scope only. All touched files match the change.md's implied ownership:
- `messages/*.json` (6 locales) — new `combats.defaultTitle` key only (CLS-2).
- `src/lib/components/app/CombatFormDialog.svelte` + its spec — CLS-2 create-path default title.
- `src/lib/components/ui/dropdown-menu/dropdown-menu-item.svelte` — shared menu-item sizing (PLT-2 menus), correctly touches the one shared primitive rather than each of the three call sites individually.
- `src/routes/layout.css` — global focus-ring suppression (PLT-2 focus).
- `src/routes/settings/+page.svelte` — SET-2 Select swap + SET-5 About-row removal.

No edits found in `src/routes/about/**`, `InitCell`, `CombatHeader`'s round/escalation Popovers, the language selector, theme value/`[data-theme]` mechanism, or `CombatFormDialog`'s edit path — all correctly left untouched per the out-of-scope list. `specs/changes/022-settings-menu-form-polish/tasks.md` is new but is change-unit process scaffolding, not app code, and change.md itself was updated (status line) as expected for the unit's own lifecycle file.

## Other findings

None — no regressions or contradictions of unrelated capability ACs spotted. One minor observation (not a fail): the focus-suppression CSS selector list in layout.css is scoped to native `input`/`select`/`textarea` and three `[data-slot]` wrappers; it does not include `[data-slot="button"]` or `[data-slot="toggle-group-item"]`/checkbox/radio controls, so those non-text-field controls still show a ring on pointer focus if they had one before — this is consistent with the AC's explicit scope ("form fields") and not a violation, just worth noting if a future unit assumes blanket coverage.
