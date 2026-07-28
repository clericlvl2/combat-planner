<!--
  LibraryFilterPills — the /library "Flat Pills" tag filter. The more/less trigger is rendered
  inline within the pill row itself (no dedicated top bar), only when the tag count exceeds the
  quick-row size (> 6). Collapsed: the quick row is the first 6 tags alphabetically, plus any
  currently-selected tag outside that six appended after them (a selected filter is never invisible
  while collapsed) — rendered in a single horizontally-scrollable row (scrollbar hidden, edge fade
  masking the scrollable content). Expanded: every tag (alphabetical), wrapped. In both states the
  layout is a two-column grid (pill area + more/less trigger) so toggling never shifts the trigger's
  position. Selecting is OR semantics (no "match all"); toggling a pill updates `selected` and calls
  `onChange`. Pills are color-accented via `tagAccent` only while selected; unselected pills are
  neutral.
-->
<script lang="ts">
	import { m } from '$lib/i18n';
	import { tagAccent } from './labels';

	const QUICK_COUNT = 6;

	let {
		allTags,
		selected = [],
		onChange,
	}: { allTags: string[]; selected?: string[]; onChange: (names: string[]) => void } = $props();

	let expanded = $state(false);
	let fadeLeft = $state(false);
	let fadeRight = $state(false);

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
		onChange(next);
	}

	function updateFade(el: HTMLDivElement) {
		fadeLeft = el.scrollLeft > 0;
		fadeRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
	}

	function scrollGuard(el: HTMLDivElement) {
		visibleTags;
		updateFade(el);
		const observer = new ResizeObserver(() => updateFade(el));
		observer.observe(el);
		return () => observer.disconnect();
	}

	const fadeStyle = $derived(
		`mask-image: linear-gradient(to right, transparent 0, #000 ${fadeLeft ? '1rem' : '0px'}, #000 calc(100% - ${fadeRight ? '1rem' : '0px'}), transparent 100%)`,
	);
</script>

{#if allTags.length > 0}
	<div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-1.5">
		<div
			{@attach scrollGuard}
			onscroll={(e) => updateFade(e.currentTarget)}
			style={expanded ? undefined : fadeStyle}
			class={[
				'gap-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
				expanded ? 'flex flex-wrap' : 'flex flex-nowrap overflow-x-auto',
			]}
		>
			{#each visibleTags as name (name)}
				{@const isSelected = selected.includes(name)}
				<button
					type="button"
					aria-pressed={isSelected}
					style="--tc: {tagAccent(name)}"
					class={[
						'inline-flex h-8 shrink-0 items-center justify-center rounded-md border px-2.5 text-sm font-medium whitespace-nowrap',
						isSelected
							? 'border-[var(--tc)] bg-[color-mix(in_srgb,var(--tc)_18%,var(--popover))] text-[color-mix(in_srgb,var(--tc)_55%,var(--foreground))]'
							: 'border-border bg-transparent text-muted-foreground hover:bg-muted',
					]}
					onclick={() => toggle(name)}
				>
					{name}
				</button>
			{/each}
		</div>

		{#if allTags.length > QUICK_COUNT}
			<button
				type="button"
				class="inline-flex h-8 shrink-0 items-center justify-center px-2 text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-foreground"
				onclick={() => (expanded = !expanded)}
			>
				{expanded ? m['library.filter.less']() : m['library.filter.more']()}
			</button>
		{/if}
	</div>
{/if}
