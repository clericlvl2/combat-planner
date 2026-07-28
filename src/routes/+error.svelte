<!--
  App-level error boundary — catches a thrown error from any route `load`, and nothing else.
  Hydrate failures deliberately do not come here: `store.hydrate()` never rejects (it sets
  `store.hydrateError` instead), and `AppShell` reads that flag to render the `apperror.*` UI
  inline on every route, including the deep links that skip `/`'s load entirely. That split is
  load-bearing rather than incidental — this file renders as AppShell's `children()`, and
  AppShell's error branch short-circuits `children()`, so anything shown here while
  `store.hydrateError` is set would never reach the screen.
  Renders inside `+layout.svelte`'s AppShell, so the chrome (header/nav) stays present;
  this file only supplies the outlet content, matching the EmptyState pattern already used on
  Combats home / the Combat screen.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import EmptyState from '$lib/components/app/EmptyState.svelte';
	import { Button } from '$lib/components/ui/button';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';

	const Alert = chromeIcon.alert;

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
     thrown `/` load error (including a re-thrown `store.hydrateError`) lands here instead of
     the framework's unstyled default page. -->
<div role="alert" aria-live="assertive" data-error-status={page.status} class="contents">
	<EmptyState
		icon={Alert}
		iconClass="text-health-bloodied"
		title={m['appError.title']()}
		description={m['appError.body']()}
	>
		<div class="flex w-full flex-col gap-2 lg:flex-row lg:justify-center">
			<Button size="action" class="w-full lg:w-auto" aria-label={m['appError.reload']()} onclick={reload}>
				{m['appError.reload']()}
			</Button>
			<Button
				variant="outline"
				size="action"
				class="w-full lg:w-auto"
				aria-label={m['appError.goToCombats']()}
				onclick={goToCombats}
			>
				{m['appError.goToCombats']()}
			</Button>
		</div>
	</EmptyState>
</div>
