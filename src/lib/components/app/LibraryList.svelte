<!--
  LibraryList — vertical list of `LibraryRow`. No drag handle, no reorder (the library has no
  `listOrder`; this component owns the stable derived ordering itself, mirroring CombatList's
  own internal sort). Filters `entries` by two ANDed conditions: (a) `query` matches the name OR
  any of the entry's tags (case-insensitive substring), (b) if `selected` (tag-pill filter) is
  non-empty, the entry must carry at least one of those tags (OR within the selection). Sorted by
  name (case-insensitive) ascending, then `updatedAt` descending, then `id` — the stable
  secondary/tertiary ordering keeps same-name duplicates from swapping positions between renders.
-->
<script lang="ts">
	import type { CombatantTemplate } from '$lib/db/types';
	import LibraryRow from './LibraryRow.svelte';

	let {
		entries,
		query = '',
		selected = [],
		onEdit,
		onDelete,
		onToggleTag,
		allTags = [],
	}: {
		entries: CombatantTemplate[];
		query?: string;
		selected?: string[];
		onEdit: (id: string) => void;
		onDelete: (id: string) => void;
		onToggleTag: (templateId: string, name: string) => void;
		allTags?: string[];
	} = $props();

	const filteredSorted = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const matchesQuery = (e: CombatantTemplate) =>
			q === '' ||
			e.name.toLowerCase().includes(q) ||
			e.tags.some((tag) => tag.toLowerCase().includes(q));
		const matchesSelection = (e: CombatantTemplate) =>
			selected.length === 0 || e.tags.some((tag) => selected.includes(tag));
		const filtered = entries.filter((e) => matchesQuery(e) && matchesSelection(e));
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
		<LibraryRow
			{entry}
			{allTags}
			{onEdit}
			{onDelete}
			onToggleTag={(name) => onToggleTag(entry.id, name)}
		/>
	{/each}
</div>
