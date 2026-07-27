<!--
  RoundEditor — the manual round-entry NumberField + Save button inside CombatHeader's round
  popover. Owns its own `$state`, seeded once at mount from `round`. CombatHeader remounts this
  component via `{#key roundOpen}` every time the popover opens, so the entry always starts fresh
  from the current round rather than an effect racing a background store mutation (Phase 2,
  2026-07-28 plan).
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { m } from '$lib/i18n';
	import { RANGES } from '$lib/stores/domain/constants';
	import NumberField from './NumberField.svelte';

	let { round, onSave }: { round: number; onSave: (value: number) => void } = $props();

	// svelte-ignore state_referenced_locally -- seed once at mount; remount via {#key} re-seeds.
	let entry = $state<number | null>(round);

	function save() {
		if (entry !== null) onSave(entry);
	}
</script>

<NumberField
	id="round-edit"
	label={m['combat.round']({ n: round })}
	bind:value={entry}
	min={RANGES.round.min}
	max={RANGES.round.max}
/>
<div class="flex justify-end">
	<Button size="action" class="w-full" onclick={save}>{m['forms.action.save']()}</Button>
</div>
