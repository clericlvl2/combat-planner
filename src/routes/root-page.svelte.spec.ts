import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

const goto = vi.fn();
vi.mock('$app/navigation', () => ({ goto }));

let resolveHydrate: (() => void) | undefined;
const consumeFirstLaunchCombatId = vi.fn(() => 'seeded-combat-id');
const store = {
	hydrateError: null as Error | null,
	consumeFirstLaunchCombatId,
	hydrate: vi.fn(
		() =>
			new Promise<void>((resolve) => {
				resolveHydrate = resolve;
			}),
	),
};
vi.mock('$lib/stores', () => ({ store }));

vi.mock('$lib/components/app/CombatsHome.svelte', () => ({
	default: class {},
}));

// Regression test for the consume-once `firstLaunchCombatId` leak: if `/` is navigated away from
// while `hydrate()` is still in flight, the component unmounts and the `cancelled` guard fires,
// but the signal must still be consumed — otherwise it is left stranded on the store and a later,
// unrelated visit to `/` in the same session would wrongly redirect using the stale id.
test('consumes the first-launch signal even when the component unmounts before hydrate resolves', async () => {
	const screen = render((await import('./+page.svelte')).default);

	await screen.unmount();
	resolveHydrate?.();
	await Promise.resolve();
	await Promise.resolve();

	expect(consumeFirstLaunchCombatId).toHaveBeenCalledTimes(1);
	expect(goto).not.toHaveBeenCalled();
});
