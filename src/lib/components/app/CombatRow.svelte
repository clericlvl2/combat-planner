<!--
  CombatRow (Component Inventory §Combats list row, CLS-1/CLS-5/CLS-6) — one Combats-home list
  row: a leading drag-handle affordance (decorative only — `svelte-dnd-action`'s zone on
  `CombatList` is what actually makes the whole row draggable, unchanged here), `ColorTagDot`
  (with the title initial, a row disambiguator) + title + description, trailing `⋮`
  (`CombatRowMenu`, Edit/Delete only). Tapping the row body (outside the menu) emits `onOpen` —
  navigation is the page's job (CLS-5), not this component's. Delete is gated behind the reused
  `ConfirmDialog` (CLS-4); confirming calls `onDelete` — no Undo affordance is offered here
  (UND-2).
-->
<script lang="ts">
	import { GripVertical } from '@lucide/svelte';
	import { Card } from '$lib/components/ui/card';
	import type { Combat } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import ColorTagDot from './ColorTagDot.svelte';
	import CombatRowMenu from './CombatRowMenu.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';

	let {
		combat,
		onOpen,
		onEdit,
		onDelete,
	}: {
		combat: Combat;
		onOpen: (id: string) => void;
		onEdit: (id: string) => void;
		onDelete: (id: string) => void;
	} = $props();

	let deleteOpen = $state(false);

	const menuLabel = $derived(m['a11y.combatRowMenu']({ title: combat.title }));
	const deleteBody = $derived(m['dialogs.deleteCombat.body']({ title: combat.title }));
	const titleInitial = $derived(combat.title.trim().charAt(0).toUpperCase() || '?');
</script>

<Card class="flex-row items-center gap-3 overflow-hidden p-3">
	<GripVertical class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
	<button
		type="button"
		class="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-md p-1 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
		onclick={() => onOpen(combat.id)}
	>
		<ColorTagDot colorTag={combat.colorTag} letter={titleInitial} />
		<span class="flex min-w-0 flex-1 flex-col">
			<span class="truncate font-medium">{combat.title}</span>
			{#if combat.description}
				<span class="truncate text-sm text-muted-foreground">{combat.description}</span>
			{/if}
		</span>
	</button>

	<CombatRowMenu
		{menuLabel}
		onEdit={() => onEdit(combat.id)}
		onDelete={() => (deleteOpen = true)}
	/>
</Card>

<ConfirmDialog
	bind:open={deleteOpen}
	title={m['dialogs.deleteCombat.title']()}
	body={deleteBody}
	confirmLabel={m['dialogs.deleteCombat.confirm']()}
	onConfirm={() => {
		onDelete(combat.id);
		deleteOpen = false;
	}}
/>
