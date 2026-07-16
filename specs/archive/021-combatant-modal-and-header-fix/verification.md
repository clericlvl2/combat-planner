# Verification: 021-combatant-modal-and-header-fix

| AC | Verdict | Evidence |
|----|---------|----------|
| AppHeader `px-3` dropped, `.content-container-wide`, `-ml-3` | PASS | src/lib/components/app/AppHeader.svelte: header no `px-3`, wrapper `content-container-wide`, burger button `-ml-3` |
| CombatHeader `px-3` dropped, back-link no `flex-1`/has `max-w-full`/spacer div, cursor-pointer on Round/Esc triggers, sub-bar `.content-container` | PASS | src/lib/components/app/CombatHeader.svelte: header no `px-3`; back link `max-w-full` (no `flex-1`); `<div class="min-w-0 flex-1">` spacer added; both popover/button triggers gained `cursor-pointer`; sub-bar unchanged `.content-container` |
| `layout.css` gutters `--space-3` | PASS | src/routes/layout.css: both `.content-container` and `.content-container-wide` `padding-inline: var(--space-3)` |
| combats `+page.svelte` `pt-3`/`pb-24` | PASS | src/routes/combats/+page.svelte: `pt-3 pb-24` |
| settings `+page.svelte` `py-3` | PASS | src/routes/settings/+page.svelte: `py-3` |
| about `+page.svelte` `py-6` | PASS | src/routes/about/+page.svelte: `py-6` |
| catchall `+page.svelte` `py-4` | PASS | src/routes/[...catchall]/+page.svelte: `py-4` |
| CombatRow `rounded-card` | PASS | src/lib/components/app/CombatRow.svelte: `rounded-card` (was `rounded-[var(--radius)]`) |
| Button base `cursor-pointer` | PASS | src/lib/components/ui/button/button.svelte: base tv string includes `cursor-pointer` |
| Mobile drawers: MediaQuery + Dialog/Drawer split, `formTitle` derived (CombatantForm/CombatFormDialog), ConditionPicker static inline title | PASS | CombatantForm.svelte: `new MediaQuery('(min-width: 1024px)')`, `{#if isDesktop.current} Dialog {:else} Drawer {/if}`, shared `{#snippet formBody()}`, `formTitle = $derived(...)` used in both DialogTitle/DrawerTitle. CombatFormDialog.svelte: identical pattern, `formTitle = $derived(combat ? ... : ...)`. ConditionPicker.svelte: same Dialog/Drawer split with shared `{#snippet toggles()}`, but title is inlined `{m['conditions.add']()}` in both `DialogTitle`/`DrawerTitle` slots — no derived var declared. Matches expected amendment exactly. |
| `drawer-content.svelte` renders `DrawerPrimitive.Handle` | PASS | src/lib/components/ui/drawer/drawer-content.svelte: decorative `<div>` grabber replaced with `<DrawerPrimitive.Handle class="..."/>` |
| CombatantForm: stacked fields, NumberField 2-col pairs, `gap-3`/scroll `gap-2.5`/pair `gap-2` | PASS | src/lib/components/app/CombatantForm.svelte formBody: form `gap-3`, scroll region `gap-2.5`, three `grid grid-cols-2 gap-2` pairs (maxhp/ac, pd/md, initbonus/init) |
| Field order Name, Type, [MaxHP\|AC], [PD\|MD], [InitBonus\|Init], Note last | PASS | src/lib/components/app/CombatantForm.svelte formBody: Name → Type → maxhp/ac grid → pd/md grid → initbonus/init grid → Note textarea (last) |
| `cf-init` unconditional, `combatActive` prop + guard removed | PASS | src/lib/components/app/CombatantForm.svelte: prop `combatActive` removed from destructured props/type; `cf-init` NumberField renders unconditionally in the initbonus/init grid pair (no `{#if}` guard); call-site `src/routes/combats/[id]/+page.svelte` drops `combatActive={active}` arg from add-mode `<CombatantForm>` |
| Scroll region `-mx-3 px-3` | PASS | CombatantForm.svelte: `<div class="-mx-3 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3">` |
| Type ToggleGroup: no `variant="outline"`, dot + `!rounded-sm` + border/bg-secondary + `--tc` style + selected state | PASS | CombatantForm.svelte: ToggleGroup drops `variant="outline"`; each item has `style="--tc: var(--type-{t})"`, `<span class="size-2 shrink-0 rounded-full bg-[var(--tc)]">`, `!rounded-sm`, `border border-border bg-secondary`, `data-[state=on]:bg-[color-mix(in_srgb,var(--tc)_14%,var(--secondary))] data-[state=on]:border-[var(--tc)] data-[state=on]:ring-1 data-[state=on]:ring-[var(--tc)] data-[state=on]:text-foreground` |
| Dialog/Drawer footer classes unchanged, only relocated | PASS | CombatantForm.svelte `DialogFooter` class string (`mx-0 mb-0 flex-row justify-center gap-2 border-t-0 bg-transparent p-0 pt-1`) is byte-identical to pre-change footer, now inside shared snippet |
| NumberField steppers `min-h-10 w-10`, Input `min-h-10` | PASS | src/lib/components/app/NumberField.svelte: `stepBtnClass` `min-h-10 w-10`; value `Input` class `min-h-10` |
| Inline clamp-hint `<p>` removed; destructive ring on shell + `aria-invalid` on Input | PASS | NumberField.svelte: trailing `<p>...{m['errors.clamp']...}</p>` block deleted; shell div class array gains `clamped && 'border-destructive ring-3 ring-destructive/50'`; `aria-invalid` still present on Input (unchanged, not shown in diff since pre-existing) |
| Focus rings gated `lg:`, destructive/aria-invalid not gated | PASS | NumberField.svelte: shell `lg:focus-within:border-ring lg:focus-within:ring-3 lg:focus-within:ring-ring/50`; steppers `lg:focus-visible:ring-3 lg:focus-visible:ring-ring/50`; destructive ring class unconditioned by `lg:` |
| Steppers `active:bg-muted active:text-foreground transition-colors` | PASS | NumberField.svelte `stepBtnClass` includes `active:bg-muted active:text-foreground transition-colors` |
| CombatFormDialog: no cap-error `<p>`, no clearing `$effect`, no `MAX_COMBATS` import/`capBlocked` state; `createCombat` null → stays open silently | PASS | src/lib/components/app/CombatFormDialog.svelte: `MAX_COMBATS` import removed from db/types import; `capBlocked` state removed; the field-edit-clears-cap `$effect` block deleted; cap-error `<p>` removed from markup; `submit()` now `if (!created) return;` (dialog stays open, no message) |
| `input.svelte` focus rings gated `lg:`, aria-invalid not gated | PASS | src/lib/components/ui/input/input.svelte: both file/text variants — `lg:focus-visible:border-ring lg:focus-visible:ring-ring/50` and `lg:focus-visible:ring-3`; `aria-invalid:ring-3` / `aria-invalid:border-destructive` remain ungated |
| ColorSwatchPicker container `w-full`, items `h-9 flex-1` | PASS | src/lib/components/app/ColorSwatchPicker.svelte: ToggleGroup class `w-full` (was `flex-wrap justify-start`); ToggleGroupItem class `h-9 flex-1 min-w-0 ...` (was `size-[30px] min-w-0 ...`) |
| CombatantRow: stripe block removed, `size-2 rounded-full` dot before name | PASS | src/lib/components/app/CombatantRow.svelte: leading `<div class="flex shrink-0 gap-1">` stripe block and `stripes`/`stripeLabel` derived removed; `<span class="size-2 shrink-0 rounded-full" class:list=typeColor aria-hidden="true">` inserted immediately before the name `<span>` |
| FAB `max-lg:focus-visible:ring-0 max-lg:focus-visible:border-transparent` on 3 mobile FABs | PASS | src/routes/combats/[id]/+page.svelte: all 3 `<Button class="fixed ... lg:hidden max-lg:focus-visible:ring-0 max-lg:focus-visible:border-transparent">` (Advance, Add, Start) |
| `combatActive` prop removed from CombatantForm + call-site | PASS | (see above) prop type/destructure removed in CombatantForm.svelte; `combatActive={active}` arg removed from add-mode call in +page.svelte |
| `typeStripeCount` removed from labels.ts | PASS | src/lib/components/app/labels.ts: `typeStripeCount` export deleted; `typeColor`/`typeLabel` remain; CombatantRow.svelte import trimmed to `typeColor` only |
| Orphaned i18n keys removed from all 6 locales + Paraglide regenerated | PASS | `a11y.typeBadge`, `errors.clamp`, `errors.combatCap` removed from messages/en.json, de.json, es.json, fr.json, ja.json, ru.json (grep confirms all 3 keys gone from each of the 6 files); src/lib/paraglide untouched in working tree per repo convention (generated, regenerated via build, not diffed) |

## Scope check

In-scope only. Modified files beyond `change.md`'s explicit file list are exactly the 3 co-located
spec files (`CombatFormDialog.svelte.spec.ts`, `CombatantForm.svelte.spec.ts`,
`NumberField.svelte.spec.ts`), which change.md's process implicitly covers (tests updated for the
behavior changes) and which the task description flagged as expected companions. No edits found in
`src/lib/components/ui/dialog/dialog-content.svelte`, `ConfirmDialog.svelte`/`AlertDialog`, or
`src/lib/paraglide/*` (all out-of-scope per change.md and confirmed absent from `git status`).

## Other findings

None. The `INI` amendment (manual Initiative now unconditional on add) is consistent with the
diff — the `{#if mode === 'edit' || (mode === 'add' && combatActive)}` guard and `combatActive`
prop are both gone, matching the change.md's flagged contradiction of INI-3 (documented as an
intentional amendment, not a bug). No unrelated regressions spotted in the reviewed files.

## Verdict

PASS — 27/27 AC bullets pass with concrete diff evidence; scope respected (declared files + 3
co-located spec.ts only).
