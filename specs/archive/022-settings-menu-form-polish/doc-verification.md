# Doc-sync verification: 022-settings-menu-form-polish

| Item | Verdict | Evidence |
|------|---------|----------|
| SET-2 wording (Select dropdown, matches SET-1 shape, System/Dark/Light, shows current theme) | PASS | specs/capabilities/settings.md diff: prose + new AC bullet "The theme control renders as a `Select` dropdown ... matching the language selector's shape". Matches code: src/routes/settings/+page.svelte uses `Select`/`SelectTrigger`/`SelectContent`/`SelectItem` for both language (lines ~62-71) and theme (lines ~83-93); `themeLabel` shows System/Dark/Light; no `ToggleGroup` import remains in this file (grep confirmed `ToggleGroup` only appears in ColorSwatchPicker/ConditionPicker/CombatantForm — unrelated components). |
| SET-5 wording (About row removed, /about + nav unchanged) | PASS | specs/capabilities/settings.md diff adds "The Settings screen itself does not link to it ... but the page is still reachable by direct URL (`/about`) and remains a destination in the app nav (PLT-3)". Matches code: settings/+page.svelte top comment states "The About link row is intentionally not rendered here (SET-5)"; no `<a href="/about">` in the file; nav components (DesktopNav.svelte, AppHeader.svelte, NavSidebar.svelte) untouched per verification.md and confirmed no diff to those files. |
| CLS-2 wording (blank/whitespace title → localized default `combats.defaultTitle`, Create only, non-blank verbatim) | PASS | specs/capabilities/combats-list.md diff adds this exact behavior to prose + AC. Matches code: src/lib/components/app/CombatFormDialog.svelte:72 `const resolvedTitle = title.trim() ? title : m['combats.defaultTitle']();`; key present in all 6 messages/*.json files (e.g. messages/en.json:18 `"combats.defaultTitle": "New combat"`) and compiled into src/lib/paraglide/messages/combats_defaulttitle1.js. |
| CLS-1 wording adjustment (placeholder unchanged, now only surfaces for non-Create blank) | PASS | specs/capabilities/combats-list.md diff correctly narrows scope of the placeholder claim without changing the placeholder key/value itself (`combats.untitled` untouched, confirmed no diff touches it). Consistent with the fact that CombatFormDialog.svelte's Create path is the only code changed; edit-to-blank path (CLS-3) untouched. |
| PLT-2 focus-suppression wording | PASS | specs/capabilities/platform.md diff adds paragraph + AC bullet describing `:focus:not(:focus-visible)` suppression on native input/select/textarea and shadcn wrapper slots, keyboard Tab ring preserved. Matches code: src/routes/layout.css:174-179 has exactly this selector list scoped to `:focus:not(:focus-visible)`, targeting input/select/textarea + `[data-slot="input"]`/`[data-slot="select-trigger"]`/`[data-slot="textarea"]`. No `:focus-visible` rule touched (ring preserved). |
| PLT-2 menu-item sizing wording (CombatRowMenu, CombatantRow, CombatHeader ⋮ items ≥44px) | PASS | specs/capabilities/platform.md diff adds AC bullet "Each item in the CombatRowMenu, CombatantRow ⋮, and CombatHeader ⋮ dropdown menus measures ≥44px on the touch axis," attributing it to "a shared DropdownMenuItem sizing, not a per-menu override." Matches code: src/lib/components/ui/dropdown-menu/dropdown-menu-item.svelte class list includes `min-h-11` (44px) alongside `px-2 py-1`; this is the single shared primitive used by all three call sites (per verification.md's confirmed grep of the three consumer files). |
| PLT-5 note (keyboard-focus preserved, only pointer/touch suppressed) | PASS | specs/capabilities/platform.md PLT-5 diff adds "keyboard focus still shows a ring everywhere; only pointer/touch focus (which never needs the ring) is hidden" — directly consistent with the `:focus:not(:focus-visible)` mechanism (suppresses only when `:focus-visible` does NOT match, i.e., never suppresses genuine keyboard-focus-visible state). |
| i18n-catalog gains `combats.defaultTitle` | PASS | specs/reference/i18n-catalog.md diff adds row `| \`combats.defaultTitle\` | New combat |` right after `combats.untitled`, matching the shipped en.json value exactly. |
| CHANGELOG row for 022 | PASS | specs/CHANGELOG.md diff adds one row dated 2026-07-17 summarizing all five fixes (SET-2, SET-5, CLS-1/CLS-2, PLT-2, PLT-5) accurately and consistently with the capability-file wording above; states "`npm run gate` green" consistent with verification.md's gate-pass row. |

## Scope check

Doc diff touches exactly: specs/capabilities/settings.md, specs/capabilities/combats-list.md,
specs/capabilities/platform.md, specs/reference/i18n-catalog.md, specs/CHANGELOG.md — all
declared owner files for the amended capabilities (SET-2/SET-5, CLS-1/CLS-2, PLT-2/PLT-5) plus
the i18n catalog for the one new key and the changelog. No edits found to unrelated capability
files (combatants.md, hp.md, conditions.md, etc.), no edits to component-inventory.md or
limits.md (correctly left alone since neither ID amended touches those facts). Nothing
overreaches beyond what verification.md confirmed shipped in code.

## Other findings

None. Doc wording is conservative and traceable line-for-line to the shipped diff; no
contradictions with unrelated capability ACs spotted (spot-checked PLT-3 nav destinations and
CLS-3/CLS-1 boundary — both correctly left unchanged in the doc diff).
