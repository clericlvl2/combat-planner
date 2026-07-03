<!--
  Combats home (UX §3, Component Inventory §5) — the M3 real home: CombatList (Phase 5) + create
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
	import { Button } from '$lib/components/ui/button';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import { store } from '$lib/stores';

	const Add = chromeIcon.add;

	let formOpen = $state(false);
	let editId = $state<string | null>(null);
	const editCombat = $derived(editId ? (store.getCombat(editId) ?? null) : null);

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
</script>

<h1 class="sr-only">{m['combats.title']()}</h1>

{#if !store.ready}
	<p class="p-4 text-muted-foreground">…</p>
{:else if store.combats.length === 0}
	<EmptyState title={m['combats.empty.title']()}>
		<Button size="lg" class="w-full" onclick={openCreate}>
			<Add class="size-5" />
			{m['combats.empty.cta']()}
		</Button>
	</EmptyState>
{:else}
	<div class="mx-auto max-w-md p-2 pb-24">
		<CombatList
			combats={store.combats}
			onOpen={openCombat}
			onEdit={openEdit}
			onDelete={deleteCombat}
			reorderCombats={(orderedIds) => store.reorderCombats(orderedIds)}
		/>
	</div>

	<FAB icon={Add} label={m['combats.create']()} onclick={openCreate} />
{/if}

<CombatFormDialog combat={editCombat} bind:open={formOpen} {store} />
