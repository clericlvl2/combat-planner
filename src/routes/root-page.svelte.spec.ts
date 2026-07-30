import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

const goto = vi.fn();
vi.mock('$app/navigation', () => ({ goto }));

let resolveHydrate: ((id: string | null) => void) | undefined;
const store = {
	hydrateError: null as Error | null,
	hydrate: vi.fn(
		() =>
			new Promise<string | null>((resolve) => {
				resolveHydrate = resolve;
			}),
	),
};
vi.mock('$lib/stores', () => ({ store }));

vi.mock('$lib/components/app/CombatsHome.svelte', () => ({
	default: () => {},
}));

beforeEach(() => {
	goto.mockClear();
	store.hydrate.mockClear();
	store.hydrateError = null;
	resolveHydrate = undefined;
});

// The `cancelled` guard: if `/` is navigated away from while `hydrate()` is still in flight, the
// orphaned continuation must not fire the seeded-combat redirect and yank the user back.
test('does not redirect when the component unmounts before hydrate resolves', async () => {
	const screen = render((await import('./+page.svelte')).default);

	await screen.unmount();
	resolveHydrate?.('seeded-combat-id');
	await Promise.resolve();
	await Promise.resolve();

	expect(goto).not.toHaveBeenCalled();
});

// The happy path: a first-launch boot redirects into the combat `hydrate()` seeded, replacing the
// history entry (`goto` defaults to push; Back from the seeded combat must leave the app, not land
// back on `/`).
test('redirects to the seeded combat with replaceState on a first-launch boot', async () => {
	render((await import('./+page.svelte')).default);

	resolveHydrate?.('seeded-combat-id');
	await Promise.resolve();
	await Promise.resolve();

	expect(goto).toHaveBeenCalledWith('/combats/seeded-combat-id', { replaceState: true });
});

// Regression test for the seeded-combat redirect failure: if `goto` rejects (a navigation
// error, an interrupted transition, etc.), the `…` placeholder must not be left up forever —
// the component should fall through to the same degrade path used when no combat was seeded.
test('degrades to the Combats home when the seeded-combat redirect fails', async () => {
	goto.mockRejectedValueOnce(new Error('navigation failed'));

	const screen = render((await import('./+page.svelte')).default);

	await expect.element(screen.getByText('…')).toBeInTheDocument();

	resolveHydrate?.('seeded-combat-id');
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();
	await Promise.resolve();

	await expect.element(screen.getByText('…')).not.toBeInTheDocument();
});
