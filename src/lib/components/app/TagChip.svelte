<!--
  TagChip — a Badge-shaped, `--tc`-colorized tag chip (color hashed from the tag name via
  `tagAccent`, ConditionPicker's inline `--tc`/`color-mix` technique — not ConditionIconList's
  static class map, since the accent is a runtime value for an open vocabulary). When `removable`,
  a trailing ✕ is always visible: a pointer press-and-hold of 600ms on the whole chip removes it,
  animating a `--destructive`-tinted fill over that duration (cancels+reverts on release/leave/
  cancel before the timer fires); a plain tap does nothing but the started-then-reverted fill. The
  ✕ button's own keyboard activation (Enter/Space) removes immediately — the hold is a
  pointer-only accident guard, not an accessibility gate.
-->
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import { tagAccent } from './labels';

	const HOLD_MS = 600;

	let {
		name,
		removable = false,
		onRemove,
	}: { name: string; removable?: boolean; onRemove?: (name: string) => void } = $props();

	const CloseIcon = chromeIcon.close;

	let holding = $state(false);
	let holdTimer: ReturnType<typeof setTimeout> | null = null;

	function startHold() {
		if (!removable) return;
		holding = true;
		holdTimer = setTimeout(() => {
			holdTimer = null;
			holding = false;
			onRemove?.(name);
		}, HOLD_MS);
	}

	function cancelHold() {
		if (holdTimer !== null) {
			clearTimeout(holdTimer);
			holdTimer = null;
		}
		holding = false;
	}

	function onCloseClick(e: MouseEvent) {
		// Keyboard activation (Enter/Space) dispatches a click with detail === 0 — remove
		// immediately, bypassing the hold gesture (pointer-only accident guard, not an a11y gate).
		if (e.detail === 0) onRemove?.(name);
	}
</script>

<Badge
	variant="outline"
	style="--tc: {tagAccent(name)}"
	class={[
		'h-[22px] gap-1.5 border-[color-mix(in_srgb,var(--tc)_28%,var(--border))] bg-[color-mix(in_srgb,var(--tc)_9%,var(--popover))] px-2.5 text-sm font-normal text-[var(--tc)] transition-colors duration-[600ms]',
		holding && 'bg-[color-mix(in_srgb,var(--destructive)_55%,var(--popover))]',
	]}
	onpointerdown={startHold}
	onpointerup={cancelHold}
	onpointercancel={cancelHold}
	onpointerleave={cancelHold}
>
	{name}
	{#if removable}
		<button
			type="button"
			class="-mr-1 inline-flex items-center rounded-full hover:text-foreground"
			aria-label={m['a11y.tags.remove']({ name })}
			onclick={onCloseClick}
		>
			<CloseIcon class="size-3.5" />
		</button>
	{/if}
</Badge>
