import { redirect } from '@sveltejs/kit';
import { store } from '$lib/stores';

/**
 * Root load (client-only per ADR-007/ssr:false). Branches instead of always redirecting:
 * first launch (`!firstLaunchDone`) opens the seeded combat directly; subsequent launches land on
 * the Combats home list. `store.hydrate()` already runs `App.firstLaunch` (the seam this leans
 * on — no first-launch logic duplicated here); this load only needs to know, before hydrating,
 * whether the flag was still unset so it can tell the freshly-seeded combat apart from an
 * ordinary one. It reads that via `store.peekFirstLaunch()` (normalize/migrate path, ADR-003/013)
 * rather than a raw Dexie read. `+layout.svelte`'s `onMount` also calls `store.hydrate()`; the
 * store memoizes the in-flight promise so the two callers share one Dexie read rather than
 * racing/duplicating it. If seeding unexpectedly yields no combat, this deterministically falls
 * through to `/combats` rather than a broken/empty combat page. `store.hydrate()` itself never
 * rejects (a failure sets `store.hydrateError` instead — see the store), and this load
 * deliberately does not re-throw it: `AppShell` owns the hydrate-failure UI for every route.
 * Throwing here would render `+error.svelte` *inside* that same AppShell, whose error branch
 * short-circuits `children()` — so the boundary's output would never be seen, and the two would
 * disagree about which one is showing.
 */
export const load = async () => {
	const wasFirstLaunch = await store.peekFirstLaunch();

	await store.hydrate();
	if (store.hydrateError) {
		// AppShell renders the failure; redirecting into a route that cannot load data would only
		// swap one broken screen for another.
		return;
	}

	if (wasFirstLaunch) {
		const seededCombat = store.combats.length > 0 ? store.combats[0] : undefined;
		if (seededCombat) {
			redirect(307, `/combats/${seededCombat.id}`);
		}
		// First-launch seeding yielded no combat (unexpected, but not an error): degrade to the
		// Combats home deterministically instead of falling through to a broken/empty page.
	}
	redirect(307, '/combats');
};
