<!--
  ConditionPicker (component-inventory.md, CND-3) — the 12 preset condition toggles, in a modal (Dialog)
  opened from the row's "Add condition" button. Text-only pills (no icons), sorted alphabetically by
  localized label (sortConditions). Each pill is colorized via an inline --tc from conditionAccent:
  at rest a light --tc tint over --popover with --tc border + text; selected = deeper --tc fill +
  solid --tc border + 1px --tc ring + mixed---tc text (mirrors the combatant Type selector, CND-3).
  Membership only, unique, up to 12 (CND-2). One click = one toggle;
  the diff against the current set yields exactly one change, forwarded as add/remove intent (no
  business logic here).
-->
<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '$lib/components/ui/drawer';
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group';
	import { type Condition, CONDITIONS } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { conditionAccent, conditionLabel, sortConditions } from './labels';

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

	const isDesktop = new MediaQuery('(min-width: 1024px)');

	function handle(next: string[]) {
		const set = next as Condition[];
		for (const c of set) if (!conditions.includes(c)) onAdd(c);
		for (const c of conditions) if (!set.includes(c)) onRemove(c);
	}

	const sorted = $derived(sortConditions([...CONDITIONS]));
</script>

{#snippet toggles()}
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
				class="!rounded-[12px] h-10 px-4 text-sm font-medium bg-[color-mix(in_srgb,var(--tc)_9%,var(--popover))] border-[color-mix(in_srgb,var(--tc)_28%,var(--border))] text-[var(--tc)] hover:bg-[color-mix(in_srgb,var(--tc)_15%,var(--popover))] data-[state=on]:bg-[color-mix(in_srgb,var(--tc)_18%,var(--popover))] data-[state=on]:border-[var(--tc)] data-[state=on]:ring-1 data-[state=on]:ring-[var(--tc)] data-[state=on]:text-[color-mix(in_srgb,var(--tc)_55%,var(--foreground))] aria-pressed:bg-[color-mix(in_srgb,var(--tc)_18%,var(--popover))] aria-pressed:border-[var(--tc)] aria-pressed:ring-1 aria-pressed:ring-[var(--tc)] aria-pressed:text-[color-mix(in_srgb,var(--tc)_55%,var(--foreground))]"
			>
				{conditionLabel[c]()}
			</ToggleGroupItem>
		{/each}
	</ToggleGroup>
{/snippet}

{#if isDesktop.current}
	<Dialog bind:open>
		<DialogContent class="max-w-sm">
			<DialogHeader>
				<DialogTitle>{m['conditions.add']()}</DialogTitle>
			</DialogHeader>

			{@render toggles()}
		</DialogContent>
	</Dialog>
{:else}
	<Drawer bind:open>
		<DrawerContent class="mx-auto max-w-sm">
			<DrawerHeader>
				<DrawerTitle>{m['conditions.add']()}</DrawerTitle>
			</DrawerHeader>

			<div class="px-4 pb-4">
				{@render toggles()}
			</div>
		</DrawerContent>
	</Drawer>
{/if}
