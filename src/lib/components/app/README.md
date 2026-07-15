# App components (`$lib/components/app`)

Bespoke + composed components, built on shadcn-svelte primitives in `../ui` (ADR-008). This is a
flat directory (no nested sub-folders) — every `.svelte` component is co-located with its
`.svelte.spec.ts` test. The map below lists only components that actually exist on disk; full
prop/variant/state matrix and control placement live in
[`specs/reference/component-inventory.md`](../../../../specs/reference/component-inventory.md)
(cited per-row below by section).

```
AppShell.svelte            root layout host — component-inventory.md#hierarchy
AppHeader.svelte           tablet/desktop top bar (burger + icon-button modes) —
                            component-inventory.md#navigation-placement-per-breakpoint
NavSidebar.svelte          mobile swipe-in nav —
                            component-inventory.md#navigation-placement-per-breakpoint
ConfirmDialog.svelte       destructive-action confirm — component-inventory.md#hierarchy
CombatList.svelte          drag-reorderable combats list (ADR-006) —
                            component-inventory.md#combats-list-row
CombatRow.svelte           one combat row — component-inventory.md#combats-list-row
CombatRowMenu.svelte       row ⋮ : edit/delete — component-inventory.md#combats-list-row
CombatFormDialog.svelte    create/edit combat — capability CLS
ColorSwatchPicker.svelte   8-swatch picker (ADR-012) — capability CLS
ColorTagDot.svelte         token-driven swatch (ADR-012) —
                            component-inventory.md#combats-list-row
SearchField.svelte         real-time title filter, Combats-home only — capability CLS (CLS-9)
CombatHeader.svelte        back/undo-redo/round/escalation/⋮ combat-screen header —
                            component-inventory.md#header-combat-screen
FAB.svelte                 shared add/advance/create floating action button —
                            component-inventory.md#floating-action-button-fab-bottomright-thumb-zone
EmptyState.svelte          shared empty-state + CTA — component-inventory.md#hierarchy
CombatantRow.svelte        combatant card, compact ⇄ expanded —
                            component-inventory.md#combatant-card
CombatantForm.svelte       add/edit combatant — capability CBT
InitCell.svelte            roll/manual initiative — capability INI
HealthBar.svelte           health + reverse/alarm bar — capability HP
NumberField.svelte         clamping numeric field — specs/reference/limits.md
NumpadSheet.svelte         HP entry sheet (damage/heal/set-temp + log) —
                            component-inventory.md#numpad-sheet
ConditionPicker.svelte     condition toggles — capability CND
ConditionIconList.svelte   first-few + "+K" overflow condition chips —
                            component-inventory.md#combatant-card
controller.ts               non-visual combat-screen controller/wiring helper
labels.ts                   shared label/text helper
header-action.svelte.ts     shared header-action state helper
```

Centralize Lucide glyph names in `$lib/icons.ts` (ADR-011) so a later swap is one file; several
chrome glyphs are still flagged open in
[`specs/reference/component-inventory.md`](../../../../specs/reference/component-inventory.md)
("Glyph gaps").
