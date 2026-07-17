import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { SETTINGS_ID } from '$lib/db/types';
import { store } from '$lib/stores';

/**
 * Root load (client-only per ADR-007/ssr:false). Branches instead of always redirecting:
 * first launch (`!firstLaunchDone`) opens the seeded combat directly; subsequent launches land on
 * the Combats home list. `store.hydrate()` already runs `App.firstLaunch` (the seam this leans
 * on — no first-launch logic duplicated here); this load only needs to know, before hydrating,
 * whether the flag was still unset so it can tell the freshly-seeded combat apart from an
 * ordinary one. `+layout.svelte`'s `onMount` hydrate runs after client-side load functions
 * resolve, so this load awaits its own `store.hydrate()` rather than racing it. If seeding
 * unexpectedly yields no combat, this deterministically falls through to `/combats` rather than
 * a broken/empty combat page; a genuine `store.hydrate()`/Dexie failure is left to propagate so
 * the `+error.svelte` boundary can surface it.
 */
export const load = async () => {
	const priorSettings = await db.settings.get(SETTINGS_ID);
	const wasFirstLaunch = !priorSettings?.firstLaunchDone;

	if (!store.ready) {
		await store.hydrate();
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
