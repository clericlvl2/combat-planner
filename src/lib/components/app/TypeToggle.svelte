<!--
  TypeToggle — the combatant-type ToggleGroup (pc/ally/enemy), byte-identical between
  CombatantForm and LibraryEntryFormDialog before this component existed. Each type gets its own
  `--type-*` swatch color, mixed into the "on" background and used for the ring/border.
-->
<script lang="ts">
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group';
	import { type CombatantType, COMBATANT_TYPES } from '$lib/db/types';
	import { typeLabel } from './labels';

	let {
		value = $bindable(),
	}: {
		value: CombatantType;
	} = $props();
</script>

<ToggleGroup
	type="single"
	{value}
	onValueChange={(v) => v && (value = v as CombatantType)}
	class="w-full gap-2"
>
	{#each COMBATANT_TYPES as t (t)}
		<ToggleGroupItem
			value={t}
			style="--tc: var(--type-{t})"
			class="flex min-h-11 flex-1 items-center justify-start gap-1.5 !rounded-sm border border-border bg-secondary pl-3.5 text-muted-foreground data-[state=on]:border-[var(--tc)] data-[state=on]:bg-[color-mix(in_srgb,var(--tc)_14%,var(--secondary))] data-[state=on]:font-semibold data-[state=on]:text-foreground data-[state=on]:ring-1 data-[state=on]:ring-[var(--tc)]"
		>
			<span class="size-2 shrink-0 rounded-full bg-[var(--tc)]"></span>
			{typeLabel[t]()}
		</ToggleGroupItem>
	{/each}
</ToggleGroup>
