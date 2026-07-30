<!--
  Root `/` (W-041, boot-flash fix). Renders CombatsHome directly instead of blocking first paint
  on a `+page.ts` `load` that awaited Dexie twice before redirecting — that was the 2160ms cold-open
  cause. The first-launch decision (open the seeded combat vs. show the list) now happens here in
  `onMount`, after the app chrome has already painted, using `store.hydrate()`'s own memoized
  in-flight promise (shared with `+layout.svelte`'s own hydrate call — no duplicate Dexie read).

  `showHome` stays false until that decision resolves, so the full combats list never paints for
  an instant before the redirect to the seeded combat fires (a new flash Phase 3 would otherwise
  introduce, since `hydrate()` flips `ready` before its own promise settles). `cancelled` guards the
  orphaned continuation: if the user has already navigated away by the time `hydrate()` resolves,
  the redirect must not fire and yank them back.

  The seeded combat id arrives as `hydrate()`'s resolved value rather than from store state, so it
  reaches only the caller whose own boot produced it — see `hydrate()`'s doc comment for why a
  shared field stranded it on routes that never read it. Nothing has to be cleared here, and an
  early return below simply discards a local.

  `replaceState: true` is required: `goto` defaults to push, but the behaviour being replaced (a
  `redirect()` thrown from the initial `load`) ran with SvelteKit's boot-time `replace_state: true`.
  Without it, Back from the seeded combat would land on `/` instead of leaving the app.

  Not re-throwing `hydrateError`: `AppShell` owns the hydrate-failure UI for every route and
  replaces this component's children outright when it is set, so there is nothing useful to render
  here in that case.

  If the seeded-combat redirect itself fails (a rejected `goto`, e.g. a navigation error or an
  interrupted transition), the `return` never runs, so the code falls through to the same
  deterministic `showHome = true` degrade used when no combat was seeded — never leaving the user
  stranded on the `…` placeholder.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import CombatsHome from '$lib/components/app/CombatsHome.svelte';
	import { store } from '$lib/stores';

	// Seeded from `store.ready`, not a bare `false`: this component remounts on every in-app
	// navigation back to `/`, and once the store is already hydrated there is no decision left to
	// wait for — `hydrate()` resolves `null` on the fast path, but only after a microtask, so a
	// `false` start rendered the `…` placeholder for a frame on every such return. On the true
	// first boot `ready` is still false here, which is the one case the placeholder is for.
	let showHome = $state(store.ready);

	onMount(() => {
		let cancelled = false;

		(async () => {
			const seededId = await store.hydrate();
			if (cancelled) return;
			if (store.hydrateError) return;

			if (seededId) {
				try {
					await goto(`/combats/${seededId}`, { replaceState: true });
					return;
				} catch {
					// Redirect to the seeded combat failed: fall through to the same
					// deterministic degrade as "no combat seeded" rather than stalling
					// forever on the `…` placeholder.
				}
			}

			if (cancelled) return;

			// First-launch seeding yielded no combat (unexpected, but not an error), first
			// launch already ran, or the redirect to the seeded combat failed: degrade to
			// the Combats home deterministically rather than stalling on the placeholder.
			showHome = true;
		})();

		return () => {
			cancelled = true;
		};
	});
</script>

{#if showHome}
	<CombatsHome />
{:else}
	<p class="p-4 text-muted-foreground">…</p>
{/if}
