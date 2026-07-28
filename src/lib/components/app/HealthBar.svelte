<!--
  HealthBar — HP bar with the four health-status bands and the reverse/alarm
  `dead` bar (fills the opposite way as HP goes deeper negative, maxing at −maxHp). A second segment
  (`bg-combat-blue`) tails past the current-HP fill to show temp HP as a buffer. Status is never
  color-alone: a role=img a11y label carries name + band + cur/max.
-->
<script lang="ts">
	import type { Combatant, HpLogEntry } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { DUR, dur } from '$lib/motion';
	import { healthStatus } from '$lib/stores/domain/derive';
	import { healthColor, healthLabel } from './labels';

	let { combatant }: { combatant: Combatant } = $props();

	const status = $derived(healthStatus(combatant));

	// Transient direction flash — driven by `{#key}` remounting the overlay below plus a CSS-only
	// fade (see the style block), so there is no timer and no effect. Direction comes from the last
	// hpLog entry's own `type` rather than a diff against a remembered HP: the log already records
	// what happened, and a remembered baseline is exactly the `state_referenced_locally` bug this
	// replaces.
	//
	// `{@const}` compiles to a derived, so this function must be idempotent — its body re-runs
	// whenever the `combatant` prop changes identity, which the store's #mutate does on every edit
	// to this combatant, not just HP ones. Returning a fresh answer on a re-run would unmount the
	// flash span mid-animation. Keying the memo on the entry id makes repeat calls return the same
	// value. Entries logged before `id` existed have none, and degrade to no flash.
	let seenId: string | undefined;
	let seenDir: FlashDirection = null;
	let primed = false;

	type FlashDirection = 'damage' | 'heal' | null;

	function flashFor(entry: HpLogEntry | undefined): FlashDirection {
		// `primed` must gate the memo hit, not just the direction: a combatant starts with an empty
		// hpLog, so the first call passes `undefined` — and `undefined === seenId` would take the
		// memo path and leave `primed` false, swallowing that combatant's first real hit.
		if (primed && entry?.id === seenId) return seenDir;
		const first = !primed;
		primed = true;
		seenId = entry?.id;
		// Whatever the log already held at mount is not news — flashing it would fire on every
		// page load.
		seenDir =
			first || !entry
				? null
				: entry.type === 'damage'
					? 'damage'
					: entry.type === 'heal'
						? 'heal'
						: null;
		return seenDir;
	}

	const lastEntry = $derived(combatant.hpLog.at(-1));

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

<div class="flex h-2 w-full overflow-hidden rounded-full bg-muted" role="img" aria-label={label}>
	<div
		class={[
			'relative h-full shrink-0 transition-[width] duration-[var(--dur-base)] ease-[var(--ease-out)]',
			healthColor[status],
			status === 'dead' && 'ml-auto',
		]}
		style:width="{fill}%"
	>
		{#key lastEntry?.id ?? 'none'}
			{@const dir = flashFor(lastEntry)}
			{#if dir}
				<span
					aria-hidden="true"
					class={[
						'pointer-events-none absolute inset-0 animate-health-flash',
						dir === 'damage' ? 'bg-combat-red' : 'bg-combat-green',
					]}
					style:animation-duration="{dur(DUR.base)}ms"
				></span>
			{/if}
		{/key}
	</div>
	{#if tempFill > 0}
		<div
			class="h-full shrink-0 bg-combat-blue transition-[width] duration-[var(--dur-base)] ease-[var(--ease-out)]"
			style:width="{tempFill}%"
		></div>
	{/if}
</div>

<style>
	/* Direction flash — plays once per {#key} remount (see script); fades from the same opacity
	 * the old JS timer held for parity, duration set dynamically via style:animation-duration so
	 * it still respects reduced-motion (dur() collapses to 0ms). */
	@keyframes health-flash {
		from {
			opacity: 0.7;
		}
		to {
			opacity: 0;
		}
	}

	.animate-health-flash {
		animation-name: health-flash;
		animation-timing-function: var(--ease-out);
		animation-fill-mode: forwards;
	}
</style>
