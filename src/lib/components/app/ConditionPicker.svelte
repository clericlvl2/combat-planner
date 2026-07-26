<!--
  ConditionPicker — the 12 preset condition toggles, in a modal (Dialog)
  opened from the row's "Add condition" button. Text-only pills (no icons), sorted alphabetically by
  localized label (sortConditions). Each pill is colorized via an inline --tc from conditionAccent:
  at rest a light --tc tint over --popover with --tc border + text; selected = deeper --tc fill +
  solid --tc border + 1px --tc ring + mixed---tc text (mirrors the combatant Type selector).
  Membership only, unique, up to 12. One click = one toggle;
  the diff against the current set yields exactly one change, forwarded as add/remove intent (no
  business logic here).
-->
<script lang="ts">
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group';
	import { type Condition, CONDITIONS } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { conditionAccent, conditionLabel, modalToggleItemClass, sortConditions } from './labels';
	import ResponsiveModal from './ResponsiveModal.svelte';

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

	const sorted = $derived(sortConditions([...CONDITIONS]));
</script>

<ResponsiveModal bind:open title={m['conditions.add']()} size="compact">
	{#snippet children()}
		<ToggleGroup
			type="multiple"
			value={conditions}
			onValueChange={handle}
			variant="outline"
			class="flex flex-wrap justify-start gap-2"
		>
			{#each sorted as c (c)}
				<ToggleGroupItem
					value={c}
					aria-label={m['a11y.condition.toggle']({ condition: conditionLabel[c](), name })}
					style="--tc: {conditionAccent[c]}"
					class={modalToggleItemClass}
				>
					{conditionLabel[c]()}
				</ToggleGroupItem>
			{/each}
		</ToggleGroup>
	{/snippet}
</ResponsiveModal>
