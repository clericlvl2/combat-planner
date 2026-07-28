<!--
  LibraryRow — one Library-page list row: type-color dot + name + a muted stat subtitle
  (HP/AC/PD/MD) + the trailing `⋮` menu (LibraryRowMenu, Edit/Delete only). No drag handle, no
  reorder, no search highlight (that's a combats-list-only feature today). Delete is gated behind
  the reused ConfirmDialog; confirming calls `onDelete`. Below the subtitle: a tag-chip row (each
  chip removable via the shared TagChip press-and-hold gesture) plus a trailing dashed "+Tags"
  pill (mirrors CombatantRow's tagTriggerClass convention) that opens a TagAssignmentDialog scoped
  to this entry. `onToggleTag` is the single closure funneling chip removal, dialog toggle, and
  dialog create-tag — all three are the same store.toggleTemplateTag(entry.id, name) operation.
-->
<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import type { CombatantTemplate } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import { typeColor } from './labels';
	import LibraryRowMenu from './LibraryRowMenu.svelte';
	import TagAssignmentDialog from './TagAssignmentDialog.svelte';
	import TagChip from './TagChip.svelte';

	let {
		entry,
		allTags = [],
		onEdit,
		onDelete,
		onToggleTag,
	}: {
		entry: CombatantTemplate;
		allTags?: string[];
		onEdit: (id: string) => void;
		onDelete: (id: string) => void;
		onToggleTag: (name: string) => void;
	} = $props();

	let deleteOpen = $state(false);
	let tagsOpen = $state(false);

	const menuLabel = $derived(m['a11y.libraryRowMenu']({ name: entry.name }));
	const deleteBody = $derived(m['dialogs.deleteLibraryEntry.body']({ name: entry.name }));
	const addTagsLabel = $derived(m['a11y.tags.add']({ name: entry.name }));
	const subtitle = $derived(
		m['library.row.subtitle']({
			maxHp: entry.maxHp,
			ac: entry.ac,
			pd: entry.pd,
			md: entry.md,
		}),
	);

	/** "+Tags" trigger — same dashed-pill affordance chip as CombatantRow's tagTriggerClass. */
	const tagTriggerClass =
		'inline-flex h-[22px] items-center gap-[5px] rounded-full border border-dashed border-border px-2.5 py-0.5 text-sm text-muted-foreground transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] hover:border-foreground hover:text-foreground';
</script>

<Card
	role="listitem"
	class="flex-col items-stretch gap-2 overflow-hidden rounded-xl border border-[var(--border)] p-3 ring-0"
>
	<div class="flex items-center gap-3">
		<span class="flex min-w-0 flex-1 items-center gap-3 p-1">
			<span class={['size-2 shrink-0 rounded-full', typeColor[entry.type]]}></span>
			<span class="flex min-w-0 flex-1 flex-col">
				<span class="truncate text-base font-semibold">{entry.name}</span>
				<span class="truncate text-sm text-muted-foreground">{subtitle}</span>
			</span>
		</span>

		<LibraryRowMenu
			{menuLabel}
			onEdit={() => onEdit(entry.id)}
			onDelete={() => (deleteOpen = true)}
		/>
	</div>

	<div class="flex flex-wrap items-center gap-1.5">
		{#each entry.tags as name (name)}
			<TagChip {name} removable onRemove={onToggleTag} />
		{/each}
		<button
			type="button"
			class={tagTriggerClass}
			aria-label={addTagsLabel}
			onclick={() => (tagsOpen = true)}
		>
			+ {m['library.tags.addShort']()}
		</button>
	</div>
</Card>

<ConfirmDialog
	bind:open={deleteOpen}
	title={m['dialogs.deleteLibraryEntry.title']()}
	body={deleteBody}
	confirmLabel={m['dialogs.deleteLibraryEntry.confirm']()}
	onConfirm={() => {
		onDelete(entry.id);
		deleteOpen = false;
	}}
/>

<TagAssignmentDialog
	bind:open={tagsOpen}
	{allTags}
	selected={entry.tags}
	onToggle={onToggleTag}
	onCreateTag={onToggleTag}
/>
