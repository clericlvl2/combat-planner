<!--
  LibraryFilterPills — the /library "Flat Pills" tag filter. A fixed top bar (more/less text
  trigger, always right-aligned, always in the same place) sits above the pill row. Collapsed: the
  quick row is the first 6 tags alphabetically, plus any currently-selected tag outside that six
  appended after them (a selected filter is never invisible while collapsed) — rendered in a
  single horizontally-scrollable row. Expanded: every tag (alphabetical), wrapped. Selecting is OR
  semantics (no "match all"); toggling a pill updates `selected` and calls `onChange`. Pills are
  color-accented via `tagAccent` (border+fill when selected, never color alone).
-->
<script lang="ts">
	import { m } from '$lib/i18n';
	import { tagAccent } from './labels';

	const QUICK_COUNT = 6;

	let {
		allTags,
		selected = $bindable([]),
		onChange,
	}: { allTags: string[]; selected?: string[]; onChange: (names: string[]) => void } = $props();

	let expanded = $state(false);

	const quickTags = $derived.by(() => {
		const quick = allTags.slice(0, QUICK_COUNT);
		const overflowSelected = allTags
			.slice(QUICK_COUNT)
			.filter((name) => selected.includes(name));
		return [...quick, ...overflowSelected];
	});

	const visibleTags = $derived(expanded ? allTags : quickTags);

	function toggle(name: string) {
		const next = selected.includes(name)
			? selected.filter((n) => n !== name)
			: [...selected, name];
		selected = next;
		onChange(next);
	}
</script>

{#if allTags.length > 0}
	<div class="flex flex-col gap-1.5">
		<div class="flex items-center justify-end">
			<button
				type="button"
				class="text-sm font-medium text-muted-foreground hover:text-foreground"
				onclick={() => (expanded = !expanded)}
			>
				{expanded ? m['library.filter.less']() : m['library.filter.more']()}
			</button>
		</div>

		<div class={['flex gap-1.5', expanded ? 'flex-wrap' : 'flex-nowrap overflow-x-auto']}>
			{#each visibleTags as name (name)}
				{@const isSelected = selected.includes(name)}
				<button
					type="button"
					aria-pressed={isSelected}
					style="--tc: {tagAccent(name)}"
					class={[
						'inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full border px-3 text-sm font-medium whitespace-nowrap',
						'border-[color-mix(in_srgb,var(--tc)_28%,var(--border))] bg-[color-mix(in_srgb,var(--tc)_9%,var(--popover))] text-[var(--tc)]',
						isSelected &&
							'border-[var(--tc)] bg-[color-mix(in_srgb,var(--tc)_18%,var(--popover))] text-[color-mix(in_srgb,var(--tc)_55%,var(--foreground))]',
					]}
					onclick={() => toggle(name)}
				>
					{name}
				</button>
			{/each}
		</div>
	</div>
{/if}
