<!--
  SearchField (Component Inventory "Combats home", CLS-1) — Combats-home real-time title filter
  (prototype `.search-bar` recipe). This component only owns the input + its visual chrome; the
  filtering itself is a view-local `$derived` owned by `combats/+page.svelte` (ADR-002 — never
  persisted). Shown only while the combats list is non-empty (the page gates that, not here).
-->
<script lang="ts">
	import { m } from '$lib/i18n';

	let { value = $bindable('') }: { value?: string } = $props();
</script>

<div
	class="flex h-10 flex-none items-center gap-2 rounded-sm border border-[var(--border-strong)] bg-secondary px-3 text-sm text-[var(--text-faint)]"
>
	<span aria-hidden="true" class="text-[16px] leading-none">&#8981;</span>
	<input
		type="search"
		bind:value
		placeholder={m['combats.search.placeholder']()}
		aria-label={m['combats.search.placeholder']()}
		class="w-full bg-transparent text-foreground outline-none placeholder:text-[var(--text-faint)]"
	/>
</div>
