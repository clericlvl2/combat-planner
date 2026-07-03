<!--
  CombatList (Component Inventory §Combats home, CLS-6) — vertical list of `CombatRow`, sorted by
  `listOrder`, wrapped with `svelte-dnd-action` (ADR-006) for manual touch/pointer/keyboard drag
  reorder. On drop (finalize) the new order is handed to `reorderCombats` so it persists via the
  store → Dexie ("drag to reorder; order survives reload"). Row callbacks are passed straight
  through from this component's own props up to the page (CLS-1, CLS-5).
-->
<script lang="ts">
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import type { Combat } from '$lib/db/types';
	import CombatRow from './CombatRow.svelte';

	let {
		combats,
		onOpen,
		onEdit,
		onDelete,
		reorderCombats,
	}: {
		combats: Combat[];
		onOpen: (id: string) => void;
		onEdit: (id: string) => void;
		onDelete: (id: string) => void;
		reorderCombats: (orderedIds: string[]) => void;
	} = $props();

	let items = $state<Combat[]>([]);

	$effect(() => {
		items = [...combats].sort((a, b) => a.listOrder - b.listOrder);
	});

	function handleConsider(e: CustomEvent<DndEvent<Combat>>) {
		items = e.detail.items;
	}

	function handleFinalize(e: CustomEvent<DndEvent<Combat>>) {
		items = e.detail.items;
		reorderCombats(items.map((combat) => combat.id));
	}
</script>

<div
	class="flex flex-col gap-2"
	role="list"
	use:dndzone={{ items, flipDurationMs: 200 }}
	onconsider={handleConsider}
	onfinalize={handleFinalize}
>
	{#each items as combat (combat.id)}
		<CombatRow {combat} {onOpen} {onEdit} {onDelete} />
	{/each}
</div>
