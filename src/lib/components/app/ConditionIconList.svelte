<!--
  ConditionIconList — compact-row condition tag chips (text only, no
  icons). All conditions render (no overflow chip — max is 12, the row wraps). Empty → nothing.
  When `removable` (row expanded only — gated by the caller), each chip gets a trailing `×` to
  drop that condition directly from the tag row.
-->
<script lang="ts">
	import { flip } from 'svelte/animate';
	import { scale } from 'svelte/transition';
	import { Badge } from '$lib/components/ui/badge';
	import type { Condition } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import { DUR, dur } from '$lib/motion';
	import { chipAccentClass, conditionAccent, conditionLabel, sortConditions } from './labels';

	let {
		conditions,
		removable = false,
		onRemove,
	}: { conditions: Condition[]; removable?: boolean; onRemove?: (c: Condition) => void } = $props();

	const CloseIcon = chromeIcon.close;

	const sorted = $derived(sortConditions(conditions));
</script>

<!--
  The container is always mounted, with no `{#if conditions.length}` guard, so the `{#each}` is a
  stable block: Svelte transitions are local by default and play only when their OWN enclosing
  block is created, so an `{#if}` gating the list would swallow the first chip's intro and the
  last chip's outro. `empty:hidden` keeps the "empty → nothing" contract instead — `display: none`
  drops the container out of the caller's `gap-1.5` flex row exactly as unmounting did, so an
  expanded row with no conditions gains no stray gap before its "+ Condition" trigger. During the
  last chip's outro the span is still in the DOM, so the container isn't `:empty` yet and stays
  visible for the animation. (`|global` was the other candidate and is worse: a global outro makes
  a destroyed ancestor wait for it, so removing a combatant would leave the row on screen fading
  its chips.)
-->
<div class="flex flex-wrap items-center gap-1 empty:hidden">
	{#each sorted as c (c)}
		<span
			class="inline-flex"
			animate:flip={{ duration: dur(DUR.base) }}
			in:scale={{ duration: dur(DUR.fast) }}
			out:scale={{ duration: dur(DUR.fast) }}
		>
			<Badge variant="outline" style="--tc: {conditionAccent[c]}" class={chipAccentClass}>
				{conditionLabel[c]()}
				{#if removable}
					<button
						type="button"
						class="-mr-1 inline-flex items-center rounded-full transition-[transform,color] duration-[var(--dur-base)] ease-[var(--ease-out)] hover:text-foreground active:translate-y-px"
						aria-label={m['forms.action.remove']()}
						onclick={() => onRemove?.(c)}
					>
						<CloseIcon class="size-3.5" />
					</button>
				{/if}
			</Badge>
		</span>
	{/each}
</div>
