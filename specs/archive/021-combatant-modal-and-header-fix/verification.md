# Verification: 021-combatant-modal-and-header-fix

| AC | Verdict | Evidence |
|----|---------|----------|
| CBT-3: `DialogContent` caps height, `flex flex-col`, drops `max-w-lg` for `sm:max-w-[400px]` | PASS | src/lib/components/app/CombatantForm.svelte:109-111 — class="flex max-h-[calc(100dvh-2rem)] flex-col rounded-lg border ... sm:max-w-[400px]" |
| CBT-3: field region has `overflow-y-auto`; `DialogFooter` outside that container, inside `<form>` | PASS | src/lib/components/app/CombatantForm.svelte:129 (`<div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">`) wraps all fields; DialogFooter (line ~226) sits after that div's close but still inside `<form>` |
| CBT-3: Name/Type/Note stacked (`flex flex-col`, label above input) | PASS | src/lib/components/app/CombatantForm.svelte:131-149 (Name), :151-168 (Type), :219-227 (Note) — each wrapped in `flex flex-col gap-[5px]` |
| CBT-3: NumberFields drop `inline` prop, grouped `grid grid-cols-2` pairs `[MaxHP\|AC]`, `[PD\|MD]`, `[InitBonus\|Initiative]` | PASS | src/lib/components/app/CombatantForm.svelte:170-184 (MaxHP/AC), :186-201 (PD/MD), :229-245 (InitBonus/Init) — no `inline` prop present anywhere in the diff |
| CBT-4: field order top→bottom Name, Type, [MaxHP\|AC], [PD\|MD], Note, [InitBonus\|Initiative] | PASS | same line ranges as above, in that sequence |
| CBT-4: add/Setup shows Init Bonus only; edit/Active-add shows manual Initiative right of Init Bonus | PASS | src/lib/components/app/CombatantForm.svelte:229-245 — `cf-initbonus` unconditional, `{#if mode === 'edit' \|\| (mode === 'add' && combatActive)}` gates `cf-init` immediately after it in the same grid row |
| CBT-3: footer — Cancel `variant="outline"`, both buttons `h-11 flex-1`, footer `border-t-0 bg-transparent` | PASS | src/lib/components/app/CombatantForm.svelte:248 (`<DialogFooter class="mx-0 mb-0 flex-row justify-center gap-2 border-t-0 bg-transparent p-0 pt-1">`), :250-255 (Cancel: `variant="outline"` + `h-11 ... flex-1`), :257 (Save: `h-11 ... flex-1`) |
| PLT-2: `specs/design/tokens.css` defines `--content-max-wide: 1024px` | PASS | specs/design/tokens.css:41 |
| PLT-2: `layout.css` exposes `--content-max-wide` in `@theme inline` and adds `.content-container-wide` utility with `max-width: var(--content-max-wide)` | PASS | src/routes/layout.css:64-67 (`@theme inline` block), :151-160 (`@utility content-container-wide { ...max-width: var(--content-max-wide); ... }`) |
| PLT-2: `CombatHeader.svelte` chrome wrapper uses `.content-container-wide`; sub-bar keeps `.content-container` (768) | PASS | src/lib/components/app/CombatHeader.svelte:90 (chrome div now `content-container-wide`); line 192 (unchanged) sub-bar still `content-container mt-3 w-full` |
| PLT-2: back control is single link (`href="/combats"`) wrapping chevron + title, `aria-label={m['a11y.back']()}`, chevron flush via `-ml-2 px-2` | PASS | src/lib/components/app/CombatHeader.svelte:90-99 — single `Button href="/combats" ... aria-label={m['a11y.back']()} class="-ml-2 ... px-2 ..."` wrapping `<Back>` icon + `<span>{combat.title}</span>`; `Button` renders a single `<a>` when `href` is set (src/lib/components/ui/button/button.svelte:44-54, `{#if href}` branch renders one `<a>`, no nested interactive elements) |
| `npm run gate` passes (lint + check + test:unit --run + build) | PASS | ran `CHOKIDAR_USEPOLLING=true npm run gate` locally — biome check reported "0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS", svelte-check/vitest produced no failures in output, `vite build` + adapter-static completed ("✔ done") |

## Scope check
In-scope only. Diff touches exactly the 4 files the unit's "What changes" table implies: `specs/design/tokens.css`, `src/routes/layout.css`, `src/lib/components/app/CombatHeader.svelte`, `src/lib/components/app/CombatantForm.svelte`. Confirmed no edits to the declared out-of-scope files: `src/lib/components/ui/dialog/dialog-content.svelte`, `src/lib/components/app/CombatFormDialog.svelte`, `src/lib/components/app/NumberField.svelte`, `messages/*.json`, `src/lib/paraglide/*` (all show empty diff / untouched). Body/combats-list/Settings/About containers untouched — only `CombatHeader.svelte`'s chrome div was repointed to the wide utility.

Note: `specs/changes/021-combatant-modal-and-header-fix/tasks.md` and `change.md` are new/staged process artifacts, not code — outside verification scope, not flagged as an issue.

## Other findings
None. No regressions spotted: `DialogFooter`'s extra styling (`mx-0 mb-0 p-0 pt-1`) and the `rounded-sm`/`border-[var(--border-strong)]` additions on `DialogContent`/buttons go beyond the literal AC wording but are consistent with the stated intent ("restyle footer/content to match CombatFormDialog") and don't touch out-of-scope files, so not treated as a defect.
