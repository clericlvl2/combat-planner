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

  `replaceState: true` is required: `goto` defaults to push, but the behaviour being replaced (a
  `redirect()` thrown from the initial `load`) ran with SvelteKit's boot-time `replace_state: true`.
  Without it, Back from the seeded combat would land on `/` instead of leaving the app.

  Not re-throwing `hydrateError`: `AppShell` owns the hydrate-failure UI for every route and
  replaces this component's children outright when it is set, so there is nothing useful to render
  here in that case.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import CombatsHome from '$lib/components/app/CombatsHome.svelte';
	import { store } from '$lib/stores';

	let showHome = $state(false);

	onMount(() => {
		let cancelled = false;

		(async () => {
			await store.hydrate();
			if (cancelled) return;
			if (store.hydrateError) return;

			const seededId = store.consumeFirstLaunchCombatId();
			if (seededId) {
				await goto(`/combats/${seededId}`, { replaceState: true });
				return;
			}

			// First-launch seeding yielded no combat (unexpected, but not an error), or first
			// launch already ran: degrade to the Combats home deterministically.
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
