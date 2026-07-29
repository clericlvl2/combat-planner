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
	default: () => {},
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

// Regression test for the seeded-combat redirect failure: if `goto` rejects (a navigation
// error, an interrupted transition, etc.), the `…` placeholder must not be left up forever —
// the component should fall through to the same degrade path used when no combat was seeded.
test('degrades to the Combats home when the seeded-combat redirect fails', async () => {
	goto.mockRejectedValueOnce(new Error('navigation failed'));

	const screen = render((await import('./+page.svelte')).default);

	await expect.element(screen.getByText('…')).toBeInTheDocument();

	resolveHydrate?.();
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();

	await expect.element(screen.getByText('…')).not.toBeInTheDocument();
});
