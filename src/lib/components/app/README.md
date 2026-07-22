# App components (`$lib/components/app`)

Bespoke + composed components, built on shadcn-svelte primitives in `../ui` (ADR-008). This is a
flat directory (no nested sub-folders) — every `.svelte` component is co-located with its
`.svelte.spec.ts` test. The map below lists only components that actually exist on disk;
prop/variant/state details are read from the components themselves.

```
AppShell.svelte            root layout host
AppHeader.svelte           tablet/desktop top bar (burger + icon-button modes)
NavSidebar.svelte          mobile swipe-in nav
ConfirmDialog.svelte       destructive-action confirm
CombatList.svelte          drag-reorderable combats list (ADR-006)
CombatRow.svelte           one combat row
CombatRowMenu.svelte       row ⋮ : edit/delete
CombatFormDialog.svelte    create/edit combat
ColorSwatchPicker.svelte   8-swatch picker (ADR-012)
ColorTagDot.svelte         token-driven swatch (ADR-012)
SearchField.svelte         real-time title filter, Combats-home only
CombatHeader.svelte        back/undo-redo/round/escalation/⋮ combat-screen header
FAB.svelte                 shared add/advance/create floating action button
EmptyState.svelte          shared empty-state + CTA
CombatantRow.svelte        combatant card, compact ⇄ expanded
CombatantForm.svelte       add/edit combatant
InitCell.svelte            roll/manual initiative
HealthBar.svelte           health + reverse/alarm bar
NumberField.svelte         clamping numeric field
NumpadSheet.svelte         HP entry sheet (damage/heal/set-temp + log)
ConditionPicker.svelte     condition toggles
ConditionIconList.svelte   first-few + "+K" overflow condition chips
controller.ts               non-visual combat-screen controller/wiring helper
labels.ts                   shared label/text helper
dialogFormChrome.ts          shared footer/action-button classes (CombatFormDialog/CombatantForm)
header-action.svelte.ts     shared header-action state helper
```

Centralize Lucide glyph names in `$lib/icons.ts` (ADR-011) so a later swap is one file.
