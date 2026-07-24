<!--
  Library home — the combatant-template management screen: EmptyState ("No templates yet") when
  the library is empty, otherwise a name-only SearchField + LibraryList (which owns its own
  stable filter+sort). A mobile FAB and a desktop header "+" (via the shared `headerAction`
  singleton, mirroring combats/+page.svelte's pattern) both open the create dialog. Delete is
  confirm-gated inside LibraryRow (LibraryRowMenu), not here.
  P4b note: the create/edit form dialog (LibraryEntryFormDialog) and its save-feedback toasts are
  a sibling phase's scope — see the placeholder comment near the bottom of this file for the
  exact mount point and the `createOpen`/`editEntry` state this phase leaves in place for it.
-->
<script lang="ts">
	import EmptyState from '$lib/components/app/EmptyState.svelte';
	import FAB from '$lib/components/app/FAB.svelte';
	import { headerAction } from '$lib/components/app/header-action.svelte';
	import LibraryList from '$lib/components/app/LibraryList.svelte';
	import SearchField from '$lib/components/app/SearchField.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { CombatantTemplate } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import { store } from '$lib/stores';

	const Add = chromeIcon.add;
	const EmptyIcon = chromeIcon.navLibrary;

	// P4b owns opening/mounting the create/edit form dialog; this phase only declares the
	// page-level state it will bind to and sets it from the FAB/header "+"/row-edit call sites.
	let createOpen = $state(false);
	let editEntry = $state<CombatantTemplate | null>(null);

	// Real-time name filter, view-local only (never persisted, ADR-002). LibraryList owns the
	// actual filter+sort derivation from `entries`/`query`.
	let query = $state('');

	function openCreate() {
		editEntry = null;
		createOpen = true;
	}
	function openEdit(id: string) {
		editEntry = store.libraryEntries.find((e) => e.id === id) ?? null;
		createOpen = true;
	}
	function deleteEntry(id: string) {
		store.removeTemplate(id);
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
		aria-label={m['library.create']()}
		title={m['library.create']()}
		onclick={openCreate}
	>
		<Add class="size-5" />
	</Button>
{/snippet}

<h1 class="sr-only">{m['library.title']()}</h1>

{#if !store.ready}
	<p class="p-4 text-muted-foreground">…</p>
{:else if store.libraryEntries.length === 0}
	<EmptyState
		icon={EmptyIcon}
		title={m['library.empty.title']()}
		description={m['library.empty.description']()}
	>
		<Button size="action" class="hidden lg:inline-flex" onclick={openCreate}>
			<Add class="size-5" />
			{m['library.create']()}
		</Button>
	</EmptyState>
	<FAB icon={Add} label={m['library.create']()} onclick={openCreate} class="lg:hidden" />
{:else}
	<div class="flex flex-col gap-2 pt-3 pb-24">
		<SearchField bind:value={query} />
		<LibraryList entries={store.libraryEntries} {query} onEdit={openEdit} onDelete={deleteEntry} />
	</div>

	<FAB icon={Add} label={m['library.create']()} onclick={openCreate} class="lg:hidden" />
{/if}

<!-- P4b: mount <LibraryEntryFormDialog bind:open={createOpen} {editEntry} .../> + onCreateResult toasts here -->
