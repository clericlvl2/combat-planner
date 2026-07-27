<!--
  HealthBar — HP bar with the four health-status bands and the reverse/alarm
  `dead` bar (fills the opposite way as HP goes deeper negative, maxing at −maxHp). A second segment
  (`bg-combat-blue`) tails past the current-HP fill to show temp HP as a buffer. Status is never
  color-alone: a role=img a11y label carries name + band + cur/max.
-->
<script lang="ts">
	import type { Combatant } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { DUR, dur } from '$lib/motion';
	import { healthStatus } from '$lib/stores/domain/derive';
	import { healthColor, healthLabel } from './labels';

	let { combatant }: { combatant: Combatant } = $props();

	const status = $derived(healthStatus(combatant));

	// Transient direction flash — derived from the component's own prop, never persisted, never
	// fed back to the store. `prevHp` is a plain (non-reactive) local so the effect can diff
	// against the last-seen value instead of re-triggering on every render.
	//
	// `flashColor` holds the *last* direction and is never reset to null — an idle color class at
	// `opacity-0` paints nothing, but keeping it applied means the fade-out has a color left to fade
	// from instead of going transparent the instant the timeout fires. `flashActive` is the only
	// thing that toggles, driving the opacity. The clear timeout and the overlay's own
	// `transition-opacity` below are deliberately paired to the same `DUR.base` duration so the
	// timeout can't fire before the fade-in finishes — if you change one, change the other.
	let prevHp = combatant.currentHp;
	let flashColor = $state<'damage' | 'heal' | null>(null);
	let flashActive = $state(false);
	let flashTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const hp = combatant.currentHp;
		if (hp === prevHp) return;
		// Direction is read before `prevHp` moves — order matters.
		flashColor = hp < prevHp ? 'damage' : 'heal';
		prevHp = hp;
		flashActive = true;
		clearTimeout(flashTimer);
		flashTimer = setTimeout(() => {
			flashActive = false;
		}, dur(DUR.base));
	});

	// Destroy-only teardown: reads nothing, so it never re-runs. The timer deliberately does NOT
	// hang off the effect above — the store deep-clones via $state.snapshot() on every write, so
	// `combatant` is a fresh object after any mutation and that effect re-runs constantly. A
	// cleanup tied to its re-run would cancel a live flash on an unrelated change (advance turn,
	// another combatant's edit) and leave the overlay stuck on, since the no-change branch
	// schedules no replacement.
	$effect(() => () => clearTimeout(flashTimer));
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
		style="width: {fill}%"
	>
		<span
			aria-hidden="true"
			class={[
				'pointer-events-none absolute inset-0 transition-opacity duration-[var(--dur-base)] ease-[var(--ease-out)]',
				flashColor === 'damage' && 'bg-combat-red',
				flashColor === 'heal' && 'bg-combat-green',
				flashActive ? 'opacity-70' : 'opacity-0',
			]}
		></span>
	</div>
	{#if tempFill > 0}
		<div
			class="h-full shrink-0 bg-combat-blue transition-[width] duration-[var(--dur-base)] ease-[var(--ease-out)]"
			style="width: {tempFill}%"
		></div>
	{/if}
</div>
