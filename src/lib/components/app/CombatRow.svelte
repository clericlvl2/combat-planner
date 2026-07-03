<!--
  CombatRow (Component Inventory §Combats list row, CLS-1/CLS-5) — one Combats-home list row:
  `ColorTagDot` + title + description, trailing `⋮` (`CombatRowMenu`, Edit/Delete only). Tapping
  the row body (outside the menu) emits `onOpen` — navigation is the page's job (CLS-5), not this
  component's. Delete is gated behind the reused `ConfirmDialog` (CLS-4); confirming calls
  `onDelete` — no Undo affordance is offered here (UND-2).
-->
<script lang="ts">
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
</script>

<Card class="flex-row items-center gap-2 overflow-hidden p-2">
	<button
		type="button"
		class="flex min-w-0 flex-1 items-center gap-2 rounded-md p-1 text-left hover:bg-muted"
		onclick={() => onOpen(combat.id)}
	>
		<ColorTagDot colorTag={combat.colorTag} />
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
