<!--
  CombatRow — one Combats-home list row: the
  whole `Card` is the open target and the whole-card hover surface; a leading
  drag-handle (`chromeIcon.drag`, marked with svelte-dnd-action's `dragHandle` — ADR-006) and
  the trailing `⋮` (`CombatRowMenu`, Edit/Delete only) are both excluded from the open target via
  `data-no-open` + a `closest()` guard in the card's click handler. Title/description render the
  active search query highlighted via `<mark>` segments. Delete is gated behind the reused
  `ConfirmDialog`; confirming calls `onDelete` — no Undo affordance is offered here.
-->
<script module lang="ts">
	// Module-level (not per-instance): `NavSidebar`'s holder is fine as an instance field because
	// it is a singleton, but a 30-row combat list would otherwise fire 30 imports. One holder + one
	// in-flight promise per lazy module, shared by every `CombatRow` instance, so N rows still cost
	// one fetch. Both loaders clear their in-flight promise on rejection so a later click retries,
	// and never assign the module on failure — the caller sees `false` and leaves `open` alone.
	let confirmModule = $state<typeof import('./ConfirmDialog.svelte')>();
	let confirmPromise: Promise<boolean> | undefined;

	function loadConfirm(): Promise<boolean> {
		if (confirmModule) return Promise.resolve(true);
		if (confirmPromise) return confirmPromise;
		confirmPromise = import('./ConfirmDialog.svelte')
			.then((mod) => {
				confirmModule = mod;
				return true;
			})
			.catch(() => {
				confirmPromise = undefined;
				return false;
			});
		return confirmPromise;
	}

	let menuModule = $state<typeof import('./CombatRowMenu.svelte')>();
	let menuPromise: Promise<boolean> | undefined;

	function loadMenu(): Promise<boolean> {
		if (menuModule) return Promise.resolve(true);
		if (menuPromise) return menuPromise;
		menuPromise = import('./CombatRowMenu.svelte')
			.then((mod) => {
				menuModule = mod;
				return true;
			})
			.catch(() => {
				menuPromise = undefined;
				return false;
			});
		return menuPromise;
	}
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import { dragHandle } from 'svelte-dnd-action';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import type { Combat } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import ColorTagDot from './ColorTagDot.svelte';

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
	let menuOpen = $state(false);
	let menuPending = $state(false);

	const Grip = chromeIcon.drag;
	const Overflow = chromeIcon.overflow;

	// Delete is gated behind the confirm dialog's module resolving; on failure `loadConfirm`
	// resolves `false` and nothing opens, so the menu item stays usable for a retry.
	async function handleDeleteRequest() {
		if (await loadConfirm()) {
			await tick();
			deleteOpen = true;
		}
	}

	// Warm-on-intent for the row-menu chunk: fire-and-forget, called from pointerenter/focusin/
	// touchstart on the placeholder trigger below. `loadMenu` is idempotent against `menuModule`
	// itself, so calling it again from `activateMenu` never double-fetches.
	function warmMenu() {
		if (menuModule || menuPending) return;
		menuPending = true;
		loadMenu().finally(() => {
			menuPending = false;
		});
	}

	async function activateMenu() {
		menuPending = true;
		const ok = await loadMenu();
		menuPending = false;
		if (ok) {
			await tick();
			menuOpen = true;
		}
	}

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
	class="flex-row items-center gap-3 overflow-hidden rounded-xl border border-[var(--border)] p-3 ring-0 cursor-pointer transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
	onclick={handleCardClick}
	onkeydown={handleCardKeydown}
>
	<span use:dragHandle data-no-open aria-label={gripLabel} class="flex shrink-0 items-center">
		<Grip class="size-4 text-muted-foreground" aria-hidden="true" />
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
		{#if menuModule}
			{@const Menu = menuModule.default}
			<Menu
				{menuLabel}
				bind:open={menuOpen}
				onEdit={() => onEdit(combat.id)}
				onDelete={handleDeleteRequest}
			/>
		{:else}
			<Button
				variant="ghost"
				size="chrome"
				aria-label={menuLabel}
				aria-busy={menuPending}
				onpointerenter={warmMenu}
				onfocusin={warmMenu}
				ontouchstart={warmMenu}
				onclick={activateMenu}
			>
				<Overflow class="size-4" />
			</Button>
		{/if}
	</span>
</Card>

{#if confirmModule}
	{@const Confirm = confirmModule.default}
	<Confirm
		bind:open={deleteOpen}
		title={m['dialogs.deleteCombat.title']()}
		body={deleteBody}
		confirmLabel={m['dialogs.deleteCombat.confirm']()}
		onConfirm={() => {
			onDelete(combat.id);
			deleteOpen = false;
		}}
	/>
{/if}
