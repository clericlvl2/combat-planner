<!--
  CombatRow — one Combats-home list row: the
  whole `Card` is the open target and the whole-card hover surface; a leading
  drag-handle (`GripVertical`, marked with svelte-dnd-action's `dragHandle` — ADR-006) and
  the trailing `⋮` (`CombatRowMenu`, Edit/Delete only) are both excluded from the open target via
  `data-no-open` + a `closest()` guard in the card's click handler. Title/description render the
  active search query highlighted via `<mark>` segments. Delete is gated behind the reused
  `ConfirmDialog`; confirming calls `onDelete` — no Undo affordance is offered here.
-->
<script lang="ts">
	import { dragHandle } from 'svelte-dnd-action';
	import { GripVertical } from '@lucide/svelte';
	import { Card } from '$lib/components/ui/card';
	import type { Combat } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import ColorTagDot from './ColorTagDot.svelte';
	import CombatRowMenu from './CombatRowMenu.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';

	let {
		combat,
		query = '',
		onOpen,
		onEdit,
		onDelete,
	}: {
		combat: Combat;
		query?: string;
		onOpen: (id: string) => void;
		onEdit: (id: string) => void;
		onDelete: (id: string) => void;
	} = $props();

	let deleteOpen = $state(false);

	const menuLabel = $derived(m['a11y.combatRowMenu']({ title: combat.title }));
	const gripLabel = $derived(m['a11y.reorder']({ title: combat.title }));
	const deleteBody = $derived(m['dialogs.deleteCombat.body']({ title: combat.title }));
	const titleInitial = $derived(combat.title.trim().charAt(0).toUpperCase() || '?');
	// An untitled combat renders a placeholder instead of a blank row.
	const displayTitle = $derived(combat.title.trim() || m['combats.untitled']());

	// Split text into matched/unmatched segments so the template can highlight all
	// case-insensitive occurrences of the active search query.
	function highlightParts(text: string, needle: string): { text: string; match: boolean }[] {
		const trimmed = needle.trim();
		if (!trimmed) return [{ text, match: false }];
		const lowerText = text.toLowerCase();
		const lowerNeedle = trimmed.toLowerCase();
		const parts: { text: string; match: boolean }[] = [];
		let cursor = 0;
		let idx = lowerText.indexOf(lowerNeedle, cursor);
		if (idx === -1) return [{ text, match: false }];
		while (idx !== -1) {
			if (idx > cursor) parts.push({ text: text.slice(cursor, idx), match: false });
			parts.push({ text: text.slice(idx, idx + trimmed.length), match: true });
			cursor = idx + trimmed.length;
			idx = lowerText.indexOf(lowerNeedle, cursor);
		}
		if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
		return parts;
	}

	const titleParts = $derived(highlightParts(displayTitle, query));
	const descriptionParts = $derived(
		combat.description ? highlightParts(combat.description, query) : [],
	);

	// The whole card opens the combat; the drag handle and the `⋮` menu opt out via
	// `data-no-open` since their click targets can be nested deep inside icons/portals.
	function handleCardClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.closest('[data-no-open]')) return;
		onOpen(combat.id);
	}

	// Only react to keydown originating on the card itself (not bubbled from the focused grip or
	// menu button, which handle their own Enter/Space activation).
	function handleCardKeydown(event: KeyboardEvent) {
		if (event.target !== event.currentTarget) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onOpen(combat.id);
		}
	}
</script>

<Card
	role="button"
	tabindex={0}
	aria-label={displayTitle}
	class="flex-row items-center gap-3 overflow-hidden rounded-xl border border-[var(--border)] p-3 ring-0 cursor-pointer hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
	onclick={handleCardClick}
	onkeydown={handleCardKeydown}
>
	<span use:dragHandle data-no-open aria-label={gripLabel} class="flex shrink-0 items-center">
		<GripVertical class="size-4 text-muted-foreground" aria-hidden="true" />
	</span>
	<span class="flex min-w-0 flex-1 items-center gap-3 p-1">
		<ColorTagDot colorTag={combat.colorTag} letter={titleInitial} />
		<span class="flex min-w-0 flex-1 flex-col">
			<span class="truncate text-base font-semibold">
				{#each titleParts as part, i (i)}
					{#if part.match}<mark class="bg-primary/25 text-inherit">{part.text}</mark
						>{:else}{part.text}{/if}
				{/each}
			</span>
			{#if combat.description}
				<span class="truncate text-sm text-muted-foreground">
					{#each descriptionParts as part, i (i)}
						{#if part.match}<mark class="bg-primary/25 text-inherit">{part.text}</mark
							>{:else}{part.text}{/if}
					{/each}
				</span>
			{/if}
		</span>
	</span>

	<span data-no-open>
		<CombatRowMenu
			{menuLabel}
			onEdit={() => onEdit(combat.id)}
			onDelete={() => (deleteOpen = true)}
		/>
	</span>
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
