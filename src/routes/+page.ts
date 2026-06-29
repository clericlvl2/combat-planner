import { redirect } from '@sveltejs/kit';

// TODO M1: first-launch — if !firstLaunchDone, auto-create one empty combat (setup) and
// open it directly (Data Model §7 `firstLaunch`, UX §2). Subsequent launches land on
// Combats home. Until the store/db seam exists, always redirect to Combats home.
export const load = () => {
	redirect(307, '/combats');
};
