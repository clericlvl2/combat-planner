<!--
  HealthBar (Component Inventory §8b) — HP bar with the four Rules §4 bands and the reverse/alarm
  `dead` bar (fills the opposite way as HP goes deeper negative, maxing at −maxHp). A second segment
  (`bg-combat-blue`) tails past the current-HP fill to show temp HP as a buffer. Status is never
  color-alone: a role=img a11y label carries name + band + cur/max (UX §8).
-->
<script lang="ts">
	import type { Combatant } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { healthStatus } from '$lib/stores/domain/derive';
	import { healthColor, healthLabel } from './labels';

	let { combatant }: { combatant: Combatant } = $props();

	const status = $derived(healthStatus(combatant));
	// When carrying temp HP, scale both segments against (maxHp + tempHp) so they sum to
	// ≤100% inside the overflow-hidden track instead of the temp segment getting clipped.
	const denom = $derived(combatant.maxHp + (status === 'dead' ? 0 : combatant.tempHp));
	const fill = $derived(
		status === 'dead'
			? Math.min(Math.abs(combatant.currentHp) / combatant.maxHp, 1) * 100
			: Math.min(Math.max(combatant.currentHp / denom, 0), 1) * 100,
	);
	const tempFill = $derived(
		status === 'dead' ? 0 : Math.min(Math.max(combatant.tempHp / denom, 0), 1) * 100,
	);
	const label = $derived(
		m['a11y.healthStatus']({
			name: combatant.name,
			status: healthLabel[status](),
			cur: combatant.currentHp,
			max: combatant.maxHp,
		}),
	);
</script>

<div class="flex h-1.5 w-full overflow-hidden rounded-full bg-muted" role="img" aria-label={label}>
	<div
		class={['h-full shrink-0 transition-all', healthColor[status], status === 'dead' && 'ml-auto']}
		style="width: {fill}%"
	></div>
	{#if tempFill > 0}
		<div class="h-full shrink-0 bg-combat-blue transition-all" style="width: {tempFill}%"></div>
	{/if}
</div>
