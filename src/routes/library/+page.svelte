<!--
  Library home — the combatant-template management screen: EmptyState ("No templates yet") when
  the library is empty, otherwise a name+tag SearchField + the Flat-Pills tag filter +
  LibraryList (which owns its own stable filter+sort). A mobile FAB and a desktop header "+" (via
  the shared `headerAction` singleton, mirroring combats/+page.svelte's pattern) both open the
  create dialog. Delete is confirm-gated inside LibraryRow (LibraryRowMenu), not here.
  `allTags` is a derived union (never stored, ADR-002) over `store.libraryEntries`; `selected` (the
  tag-pill filter) is intersected against it before use so a tag that died by losing its last
  entry can't keep silently narrowing the list.
  Create/edit is handled by LibraryEntryFormDialog: create submits fire a success/cap-reached
  toast via its `onCreateResult` callback (dialog owns open/close; the page owns the toast);
  edit submits stay silent.
-->
<script lang="ts">
	import EmptyState from '$lib/components/app/EmptyState.svelte';
	import FAB from '$lib/components/app/FAB.svelte';
	import { headerAction } from '$lib/components/app/header-action.svelte';
	import LibraryEntryFormDialog from '$lib/components/app/LibraryEntryFormDialog.svelte';
	import LibraryFilterPills from '$lib/components/app/LibraryFilterPills.svelte';
	import LibraryList from '$lib/components/app/LibraryList.svelte';
	import SearchField from '$lib/components/app/SearchField.svelte';
	import { Button } from '$lib/components/ui/button';
	import { toast } from '$lib/components/ui/sonner';
	import { MAX_LIBRARY_ENTRIES, type CombatantTemplate } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import { store } from '$lib/stores';
	import type { CombatantTemplateInput } from '$lib/stores/domain/factories';
	import { allTagNames, type EditTemplatePatch } from '$lib/stores/domain/library';

	const Add = chromeIcon.add;
	const EmptyIcon = chromeIcon.navLibrary;

	// Opened from the FAB/header "+" (create) and each row's edit action (edit, seeded below).
	let createOpen = $state(false);
	let editEntry = $state<CombatantTemplate | null>(null);

	// Real-time name+tag filter, view-local only (never persisted, ADR-002). LibraryList owns the
	// actual filter+sort derivation from `entries`/`query`/`selected`.
	let query = $state('');

	// Derived union, never stored (ADR-002). Stale selections (a tag that lost its last entry)
	// are pruned by intersecting against this before use.
	const allTags = $derived(allTagNames(store.libraryEntries));

	let rawSelected = $state<string[]>([]);
	const selected = $derived(rawSelected.filter((name) => allTags.includes(name)));

	function onFilterChange(names: string[]) {
		rawSelected = names;
	}

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
	function onToggleTag(templateId: string, name: string) {
		store.toggleTemplateTag(templateId, name);
	}

	// Narrow store surface LibraryEntryFormDialog needs (test-double-friendly, same pattern as
	// CombatFormDialog's CombatFormStore).
	const libraryFormStore = {
		addTemplate: (input: CombatantTemplateInput) => store.addTemplate(input),
		editTemplate: (id: string, patch: EditTemplatePatch) => store.editTemplate(id, patch),
	};

	function onCreateResult(created: CombatantTemplate | null) {
		if (created) {
			toast.success(m['toasts.library.saved']());
		} else {
			toast.error(m['toasts.library.capReached']({ max: MAX_LIBRARY_ENTRIES }));
		}
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
		<SearchField
			bind:value={query}
			placeholder={m['library.search.placeholder']()}
			ariaLabel={m['library.search.placeholder']()}
		/>
		<LibraryFilterPills {allTags} {selected} onChange={onFilterChange} />
		<LibraryList
			entries={store.libraryEntries}
			{query}
			{selected}
			{allTags}
			onEdit={openEdit}
			onDelete={deleteEntry}
			{onToggleTag}
		/>
	</div>

	<FAB icon={Add} label={m['library.create']()} onclick={openCreate} class="lg:hidden" />
{/if}

<LibraryEntryFormDialog
	bind:open={createOpen}
	entry={editEntry}
	store={libraryFormStore}
	{onCreateResult}
	{allTags}
/>
