<!--
  LibraryList — vertical list of `LibraryRow`. No drag handle, no reorder (the library has no
  `listOrder`; this component owns the stable derived ordering itself, mirroring CombatList's
  own internal sort). Filters `entries` by `query` against the name only (case-insensitive) —
  a later phase upgrades this to a combined name+tag search plus tag-pill filtering on the same
  `$derived`, so this filter is kept isolated and easy to extend. Sorted by name (case-insensitive)
  ascending, then `updatedAt` descending, then `id` — the stable secondary/tertiary ordering keeps
  same-name duplicates from swapping positions between renders.
-->
<script lang="ts">
	import type { CombatantTemplate } from '$lib/db/types';
	import LibraryRow from './LibraryRow.svelte';

	let {
		entries,
		query = '',
		onEdit,
		onDelete,
	}: {
		entries: CombatantTemplate[];
		query?: string;
		onEdit: (id: string) => void;
		onDelete: (id: string) => void;
	} = $props();

	const filteredSorted = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const filtered = q === '' ? entries : entries.filter((e) => e.name.toLowerCase().includes(q));
		return [...filtered].sort((a, b) => {
			const nameCompare = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
			if (nameCompare !== 0) return nameCompare;
			if (a.updatedAt !== b.updatedAt) return b.updatedAt - a.updatedAt;
			return a.id.localeCompare(b.id);
		});
	});
</script>

<div class="flex flex-col gap-2" role="list">
	{#each filteredSorted as entry (entry.id)}
		<LibraryRow {entry} {onEdit} {onDelete} />
	{/each}
</div>
