<!--
  AppShell (component-inventory.md "Hierarchy") — composes NavSidebar/AppHeader by breakpoint around
  the route outlet. Mounted once by the root +layout.svelte. The Combat screen (`/combats/[id]`)
  ships its own full CombatHeader (back/title/overflow — component-inventory.md "Header") as page
  content, so this shell skips the generic AppHeader there to avoid stacking two header bars;
  NavSidebar (and its swipe-right gesture) stays mounted on every route.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import AppHeader from './AppHeader.svelte';
	import NavSidebar from './NavSidebar.svelte';

	let { children }: { children: Snippet } = $props();

	let navOpen = $state(false);

	// The Combat screen (unit E scope) renders its own CombatHeader; every other route uses
	// this shared chrome bar.
	const routeHasOwnHeader = $derived(page.route.id === '/combats/[id]');
</script>

<div class="flex min-h-dvh flex-col bg-background text-foreground">
	{#if !routeHasOwnHeader}
		<AppHeader onOpenNav={() => (navOpen = true)} />
	{/if}
	<NavSidebar bind:open={navOpen} />
	<main class="flex flex-1 flex-col">
		{#if routeHasOwnHeader}
			{@render children()}
		{:else}
			<div class="content-container flex w-full flex-1 flex-col">
				{@render children()}
			</div>
		{/if}
	</main>
</div>
