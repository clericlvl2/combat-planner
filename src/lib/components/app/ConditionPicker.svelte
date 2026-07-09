<!--
  ConditionPicker (Component Inventory §8b) — the 12 preset condition toggles, in a modal (Dialog)
  opened from the row's "Add condition" button. Text-only pills (no icons): unselected = outline,
  selected = filled primary. Membership only, unique, up to 12 (Data §5/§7). One click = one toggle;
  the diff against the current set yields exactly one change, forwarded as add/remove intent (no
  business logic here).
-->
<script lang="ts">
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group';
	import { type Condition, CONDITIONS } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { conditionLabel } from './labels';

	let {
		open = $bindable(false),
		conditions,
		name,
		onAdd,
		onRemove,
	}: {
		open?: boolean;
		conditions: Condition[];
		name: string;
		onAdd: (c: Condition) => void;
		onRemove: (c: Condition) => void;
	} = $props();

	function handle(next: string[]) {
		const set = next as Condition[];
		for (const c of set) if (!conditions.includes(c)) onAdd(c);
		for (const c of conditions) if (!set.includes(c)) onRemove(c);
	}
</script>

<Dialog bind:open>
	<DialogContent class="max-w-sm">
		<DialogHeader>
			<DialogTitle>{m['conditions.add']()}</DialogTitle>
		</DialogHeader>

		<ToggleGroup
			type="multiple"
			value={conditions}
			onValueChange={handle}
			variant="outline"
			class="flex flex-wrap justify-start gap-1.5"
		>
			{#each CONDITIONS as c (c)}
				<ToggleGroupItem
					value={c}
					aria-label={m['a11y.condition.toggle']({ condition: conditionLabel[c](), name })}
					class="!rounded-full min-h-11 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
				>
					{conditionLabel[c]()}
				</ToggleGroupItem>
			{/each}
		</ToggleGroup>
	</DialogContent>
</Dialog>
