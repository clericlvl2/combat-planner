<!--
  SearchField — real-time text filter input, originally the Combats-home title filter and now
  reused by /library's name(+tag) search. This component only owns the input + its visual chrome;
  the filtering itself is a view-local `$derived` owned by the caller's `+page.svelte` (ADR-002 —
  never persisted). Shown only while the underlying list is non-empty (the page gates that, not
  here). `placeholder`/`ariaLabel` default to the original combats copy so the combats caller
  (which passes neither) is unchanged.
-->
<script lang="ts">
	import { m } from '$lib/i18n';

	let {
		value = $bindable(''),
		placeholder = m['combats.search.placeholder'](),
		ariaLabel = m['combats.search.placeholder'](),
	}: { value?: string; placeholder?: string; ariaLabel?: string } = $props();
</script>

<div
	class="flex h-10 flex-none items-center gap-2 rounded-sm border border-[var(--border-strong)] bg-secondary px-3 text-sm text-[var(--text-faint)]"
>
	<span aria-hidden="true" class="text-[16px] leading-none">&#8981;</span>
	<input
		type="search"
		bind:value
		{placeholder}
		aria-label={ariaLabel}
		class="w-full bg-transparent text-foreground outline-none placeholder:text-[var(--text-faint)]"
	/>
</div>
