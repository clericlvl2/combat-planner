<!--
  CombatList — vertical list of `CombatRow`, sorted by
  `listOrder`, wrapped with `svelte-dnd-action`'s `dragHandleZone` (ADR-006) so drag-to-reorder
  only initiates from each row's `GripVertical` handle (marked with the paired `dragHandle`
  action in `CombatRow`), not the whole card. On drop (finalize) the new order is handed to
  `reorderCombats` so it persists via the store → Dexie ("drag to reorder; order survives
  reload"). Row callbacks and the active search query are passed straight through from this
  component's own props up to the page.
-->
<script lang="ts">
	import { dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import type { Combat } from '$lib/db/types';
	import CombatRow from './CombatRow.svelte';

	let {
		combats,
		query = '',
		onOpen,
		onEdit,
		onDelete,
		reorderCombats,
	}: {
		combats: Combat[];
		query?: string;
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
	use:dragHandleZone={{ items, flipDurationMs: 200 }}
	onconsider={handleConsider}
	onfinalize={handleFinalize}
>
	{#each items as combat (combat.id)}
		<CombatRow {combat} {query} {onOpen} {onEdit} {onDelete} />
	{/each}
</div>
