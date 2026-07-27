<!--
  EscalationEditor — the manual escalation-die-entry NumberField + Save button inside
  CombatHeader's escalation popover. Owns its own `$state`, seeded once at mount from `esc`.
  CombatHeader remounts this component via `{#key escOpen}` every time the popover opens, so the
  entry always starts fresh from the current die value rather than an effect racing a background
  store mutation (Phase 2, 2026-07-28 plan).
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { m } from '$lib/i18n';
	import { RANGES } from '$lib/stores/domain/constants';
	import NumberField from './NumberField.svelte';

	let { esc, onSave }: { esc: number; onSave: (value: number) => void } = $props();

	// svelte-ignore state_referenced_locally -- seed once at mount; remount via {#key} re-seeds.
	let entry = $state<number | null>(esc);

	function save() {
		if (entry !== null) onSave(entry);
	}
</script>

<NumberField
	id="esc-edit"
	label={m['combat.escalation']()}
	bind:value={entry}
	min={RANGES.escalation.min}
	max={RANGES.escalation.max}
/>
<div class="flex justify-end">
	<Button size="action" class="w-full" onclick={save}>{m['forms.action.save']()}</Button>
</div>
