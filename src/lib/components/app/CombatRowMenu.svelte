<!--
  CombatRowMenu — CombatRow's trailing `⋮` menu.
  Exactly Edit and Delete — no Export/share item, no placeholder. Emits intent only; the confirm-gating for Delete lives in
  CombatRow, not here.
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger,
	} from '$lib/components/ui/dropdown-menu';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';

	let {
		menuLabel,
		onEdit,
		onDelete,
	}: {
		menuLabel: string;
		onEdit: () => void;
		onDelete: () => void;
	} = $props();

	const Overflow = chromeIcon.overflow;
	const Edit = chromeIcon.edit;
	const Remove = chromeIcon.remove;
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="ghost"
				size="chrome"
				aria-label={menuLabel}
			>
				<Overflow class="size-4" />
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent align="end">
		<DropdownMenuItem onSelect={onEdit}>
			<Edit class="size-4" />
			{m['combats.row.menu.edit']()}
		</DropdownMenuItem>
		<DropdownMenuItem variant="destructive" onSelect={onDelete}>
			<Remove class="size-4" />
			{m['combats.row.menu.delete']()}
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
