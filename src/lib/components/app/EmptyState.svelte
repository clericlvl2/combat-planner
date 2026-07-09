<!--
  EmptyState (Component Inventory §5/§7) — shared empty-state leaf: optional icon, title,
  optional description, and a CTA slot (e.g. Combats home's "Create your first combat" Button).
  Reused for the "No combats yet" (combats.empty.*) and the Combat-screen empty roster cases.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { IconComponent } from '$lib/icons';

	let {
		icon,
		title,
		description,
		children,
	}: {
		icon?: IconComponent;
		title: string;
		description?: string;
		children?: Snippet;
	} = $props();

	const Icon = $derived(icon);
</script>

<div class="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
	{#if Icon}
		<Icon class="size-10 text-muted-foreground opacity-50" />
	{/if}
	<p class="text-lg font-semibold">{title}</p>
	{#if description}
		<p class="text-sm text-muted-foreground">{description}</p>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</div>
