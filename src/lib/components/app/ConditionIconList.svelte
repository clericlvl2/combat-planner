<!--
  ConditionIconList (Component Inventory §8b) — compact-row condition tag chips (text only, no
  icons). All conditions render (no overflow chip — max is 12, the row wraps). Empty → nothing.
  When `removable` (row expanded only — gated by the caller), each chip gets a trailing `×` to
  drop that condition directly from the tag row.
-->
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Condition } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import { conditionColor, conditionLabel } from './labels';

	let {
		conditions,
		removable = false,
		onRemove,
	}: { conditions: Condition[]; removable?: boolean; onRemove?: (c: Condition) => void } = $props();

	const CloseIcon = chromeIcon.close;
</script>

{#if conditions.length}
	<div class="flex flex-wrap items-center gap-1">
		{#each conditions as c (c)}
			<Badge variant="outline" class={['h-4 gap-1 px-1.5 text-[10px]', conditionColor[c]]}>
				{conditionLabel[c]()}
				{#if removable}
					<button
						type="button"
						class="-mr-0.5 inline-flex items-center rounded-full hover:text-foreground"
						aria-label={m['forms.action.remove']()}
						onclick={() => onRemove?.(c)}
					>
						<CloseIcon class="size-3" />
					</button>
				{/if}
			</Badge>
		{/each}
	</div>
{/if}
