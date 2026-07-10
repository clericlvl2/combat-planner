<!--
  InitCell (Component Inventory §8b, Rules §2) — initiative value or "-". Tap = roll d20+bonus;
  long-press = manual entry (Popover). Re-sort is the parent's job via sortedCombatants. Emits
  roll / setInitiative intent only.
-->
<script lang="ts" module>
	export const LONG_PRESS_MS = 450;
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Popover, PopoverContent } from '$lib/components/ui/popover';
	import { type Combatant, UNROLLED } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { RANGES } from '$lib/stores/domain/constants';
	import { cn } from '$lib/utils';
	import NumberField from './NumberField.svelte';

	let {
		combatant,
		onRoll,
		onSetInitiative,
		editable = true,
		class: className,
	}: {
		combatant: Combatant;
		onRoll: (id: string) => void;
		onSetInitiative: (id: string, value: number) => void;
		editable?: boolean;
		class?: string;
	} = $props();

	let anchor = $state<HTMLElement | null>(null);
	let open = $state(false);
	let entry = $state<number | null>(null);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let longPressed = false;

	const display = $derived(combatant.initiative === UNROLLED ? '-' : String(combatant.initiative));

	function openManual() {
		entry = combatant.initiative === UNROLLED ? 0 : (combatant.initiative as number);
		open = true;
	}

	function down() {
		longPressed = false;
		timer = setTimeout(() => {
			longPressed = true;
			openManual();
		}, LONG_PRESS_MS);
	}
	function cancelTimer() {
		clearTimeout(timer);
	}
	function tap() {
		if (longPressed) return; // long-press already opened manual entry
		onRoll(combatant.id);
	}

	function save() {
		if (entry !== null) onSetInitiative(combatant.id, entry);
		open = false;
	}
</script>

<Popover bind:open>
	<Button
		bind:ref={anchor}
		variant="ghost"
		class={cn('h-auto min-h-11 min-w-11 rounded-full p-1.5', className)}
		disabled={!editable}
		aria-label={m['a11y.initCell.roll']({ name: combatant.name })}
		aria-haspopup="dialog"
		onpointerdown={down}
		onpointerup={cancelTimer}
		onpointerleave={cancelTimer}
		onpointercancel={cancelTimer}
		onclick={tap}
	>
		<span
			class="inline-flex h-6 items-center gap-1 rounded-full border border-border bg-secondary px-2.5 text-sm text-muted-foreground tabular-nums"
		>
			Init
			<span class="font-semibold text-foreground">{display}</span>
		</span>
	</Button>

	<PopoverContent customAnchor={anchor} class="w-56" aria-label={m['a11y.initCell.manual']({ name: combatant.name })}>
		<NumberField
			id="init-{combatant.id}"
			label={m['forms.field.initValue']()}
			bind:value={entry}
			min={RANGES.initiative.min}
			max={RANGES.initiative.max}
		/>
		<Button size="sm" class="mt-2 w-full" onclick={save}>{m['forms.action.save']()}</Button>
	</PopoverContent>
</Popover>
