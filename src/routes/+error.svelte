<!--
  App-level error boundary (PLT-10) — catches a thrown error from any route `load` (incl. the
  `/` root load) or from `store.hydrate()`/Dexie access during `+layout.svelte`'s `onMount`.
  Renders inside `+layout.svelte`'s AppShell, so the chrome (header/nav) stays present; this
  file only supplies the outlet content, matching the EmptyState pattern already used on
  Combats home / the Combat screen (Component Inventory §Hierarchy).
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import EmptyState from '$lib/components/app/EmptyState.svelte';
	import { Button } from '$lib/components/ui/button';
	import { m } from '$lib/i18n';

	function reload() {
		location.reload();
	}
	function goToCombats() {
		goto('/combats');
	}
</script>

<h1 class="sr-only">{m['appError.title']()}</h1>

<!-- role="alert" + the live region announce the boundary as soon as SvelteKit populates
     page.error/page.status (the values that trigger this file being rendered at all) — a
     thrown `/` load or store.hydrate()/Dexie error lands here instead of the framework's
     unstyled default page. -->
<div role="alert" aria-live="assertive" data-error-status={page.status} class="contents">
	<EmptyState title={m['appError.title']()} description={m['appError.body']()}>
		<div class="flex w-full flex-col gap-2 lg:flex-row lg:justify-center">
			<Button size="lg" class="w-full lg:w-auto" aria-label={m['appError.reload']()} onclick={reload}>
				{m['appError.reload']()}
			</Button>
			<Button
				variant="outline"
				size="lg"
				class="w-full lg:w-auto"
				aria-label={m['appError.goToCombats']()}
				onclick={goToCombats}
			>
				{m['appError.goToCombats']()}
			</Button>
		</div>
	</EmptyState>
</div>
