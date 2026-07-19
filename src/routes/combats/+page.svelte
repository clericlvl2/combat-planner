<!--
  Combats home — the M3 real home: CombatList (Phase 5) + create
  FAB + EmptyState ("No combats yet") + CombatFormDialog (Phase 3) shared by create/edit. Row
  callbacks from CombatList (onOpen/onEdit/onDelete) drive navigation + this page's own dialog
  state; delete is confirm-gated inside CombatRowMenu (Phase 4), not here.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import CombatFormDialog from '$lib/components/app/CombatFormDialog.svelte';
	import CombatList from '$lib/components/app/CombatList.svelte';
	import EmptyState from '$lib/components/app/EmptyState.svelte';
	import FAB from '$lib/components/app/FAB.svelte';
	import { headerAction } from '$lib/components/app/header-action.svelte';
	import SearchField from '$lib/components/app/SearchField.svelte';
	import { Button } from '$lib/components/ui/button';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import { store } from '$lib/stores';

	const Add = chromeIcon.add;
	const EmptyIcon = chromeIcon.navCombats;

	let formOpen = $state(false);
	let editId = $state<string | null>(null);
	const editCombat = $derived(editId ? (store.getCombat(editId) ?? null) : null);

	// Real-time title-or-description filter, view-local only (never persisted, ADR-002).
	let query = $state('');
	const filteredCombats = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (q === '') return store.combats;
		return store.combats.filter(
			(c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
		);
	});

	function openCreate() {
		editId = null;
		formOpen = true;
	}
	function openEdit(id: string) {
		editId = id;
		formOpen = true;
	}
	function openCombat(id: string) {
		goto(`/combats/${id}`);
	}
	function deleteCombat(id: string) {
		store.deleteCombat(id);
	}

	// Desktop create control lives in AppHeader, not on this page — hand it a snippet via the
	// header-action seam while this route is mounted.
	$effect(() => {
		headerAction.set(createHeaderButton);
		return () => headerAction.set(null);
	});
</script>

{#snippet createHeaderButton()}
	<Button
		variant="ghost"
		size="chrome"
		aria-label={m['combats.create']()}
		title={m['combats.create']()}
		onclick={openCreate}
	>
		<Add class="size-5" />
	</Button>
{/snippet}

<h1 class="sr-only">{m['combats.title']()}</h1>

{#if !store.ready}
	<p class="p-4 text-muted-foreground">…</p>
{:else if store.combats.length === 0}
	<EmptyState
		icon={EmptyIcon}
		title={m['combats.empty.title']()}
		description={m['combats.empty.description']()}
	>
		<Button size="action" class="hidden lg:inline-flex" onclick={openCreate}>
			<Add class="size-5" />
			{m['combats.empty.cta']()}
		</Button>
	</EmptyState>
	<FAB icon={Add} label={m['combats.create']()} onclick={openCreate} class="lg:hidden" />
{:else}
	<div class="flex flex-col gap-2 pt-3 pb-24">
		<SearchField bind:value={query} />
		<CombatList
			combats={filteredCombats}
			{query}
			onOpen={openCombat}
			onEdit={openEdit}
			onDelete={deleteCombat}
			reorderCombats={(orderedIds) => store.reorderCombats(orderedIds)}
		/>
	</div>

	<FAB icon={Add} label={m['combats.create']()} onclick={openCreate} class="lg:hidden" />
{/if}

<CombatFormDialog combat={editCombat} bind:open={formOpen} {store} />
