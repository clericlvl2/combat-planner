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

{#if conditions.length}
	<div class="flex flex-wrap items-center gap-1">
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
							class="-mr-1 inline-flex items-center rounded-full transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground active:translate-y-px"
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
{/if}
