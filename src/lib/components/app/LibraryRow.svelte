<!--
  LibraryRow — one Library-page list row: type-color dot + name + a muted stat subtitle
  (HP/AC/PD/MD) + the trailing `⋮` menu (LibraryRowMenu, Edit/Delete only). No drag handle, no
  reorder, no search highlight (that's a combats-list-only feature today). Delete is gated behind
  the reused ConfirmDialog; confirming calls `onDelete`.
  P5 note: a tag-chip row + a "+Tags" trigger land below the subtitle in a later phase — this
  row's markup is a plain vertical stack (dot+name+subtitle, then menu) precisely so a chip row
  can be appended below without restructuring anything above it.
-->
<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import type { CombatantTemplate } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import { typeColor } from './labels';
	import LibraryRowMenu from './LibraryRowMenu.svelte';

	let {
		entry,
		onEdit,
		onDelete,
	}: {
		entry: CombatantTemplate;
		onEdit: (id: string) => void;
		onDelete: (id: string) => void;
	} = $props();

	let deleteOpen = $state(false);

	const menuLabel = $derived(m['a11y.libraryRowMenu']({ name: entry.name }));
	const deleteBody = $derived(m['dialogs.deleteLibraryEntry.body']({ name: entry.name }));
	const subtitle = $derived(
		m['library.row.subtitle']({
			maxHp: entry.maxHp,
			ac: entry.ac,
			pd: entry.pd,
			md: entry.md,
		}),
	);
</script>

<Card
	class="flex-row items-center gap-3 overflow-hidden rounded-xl border border-[var(--border)] p-3 ring-0"
>
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
