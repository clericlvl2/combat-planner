<!--
  AppShell (component-inventory.md "Hierarchy") — composes NavSidebar/AppHeader by breakpoint around
  the route outlet. Mounted once by the root +layout.svelte. The Combat screen (`/combats/[id]`)
  ships its own full CombatHeader (back/title/overflow — component-inventory.md "Header") as page
  content, so this shell skips the generic AppHeader there to avoid stacking two header bars;
  NavSidebar (and its swipe-right gesture) stays mounted on every route. InstallBanner (ADR-004)
  is this shell's other always-mounted, conditionally-visible singleton — the install hint.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { chromeIcon } from '$lib/icons';
	import { m } from '$lib/i18n';
	import { store } from '$lib/stores';
	import AppHeader from './AppHeader.svelte';
	import EmptyState from './EmptyState.svelte';
	import InstallBanner from './InstallBanner.svelte';
	import NavSidebar from './NavSidebar.svelte';

	let { children }: { children: Snippet } = $props();

	const Alert = chromeIcon.alert;

	function reload() {
		location.reload();
	}

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
	<InstallBanner {store} />
	<main class="flex flex-1 flex-col">
		{#if store.hydrateError}
			<!-- `store.hydrate()` never rejects (see combat-store.svelte.ts), so a Dexie failure
			     never reaches `+error.svelte` — and could not be shown by it anyway, since that
			     file renders as this component's `children()`, which this branch replaces. This is
			     the single owner of the hydrate-failure UI, on every route, instead of leaving the
			     route's own `!store.ready` placeholder up forever. -->
			<div role="alert" aria-live="assertive" class="flex flex-1 flex-col">
				<EmptyState
					icon={Alert}
					iconClass="text-health-bloodied"
					title={m['appError.title']()}
					description={m['appError.body']()}
				>
					<div class="flex w-full flex-col gap-2 lg:flex-row lg:justify-center">
						<Button
							size="action"
							class="w-full lg:w-auto"
							aria-label={m['appError.reload']()}
							onclick={reload}
						>
							{m['appError.reload']()}
						</Button>
					</div>
				</EmptyState>
			</div>
		{:else if routeHasOwnHeader}
			{@render children()}
		{:else}
			<div class="content-container flex w-full flex-1 flex-col">
				{@render children()}
			</div>
		{/if}
	</main>
</div>
