import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { m } from '$lib/i18n';

// Isolated in its own file (not NavSidebar.svelte.spec.ts) so the top-level `vi.mock` calls below
// — hoisted above every import in this module, including NavSidebar's own — are the only mocks in
// play.
//
// `nav-drawer-loader` (not `$lib/components/ui/drawer` directly) is the mock target: mocking the
// drawer module itself with a rejecting factory crashes vitest-browser's mock-resolution RPC (a
// toolchain limitation, confirmed by direct reproduction — the factory result is awaited eagerly
// during mock resolution, and a reject/throw there becomes an unhandled rejection in
// `resolveManualMock`/`resolveFactoryModule` before the test even runs). Mocking the loader
// module instead is unaffected: its factory returns a plain function reference synchronously, and
// nothing rejects until that function is actually called at runtime by `loadDrawer`.
const { loadDrawerChunk } = vi.hoisted(() => ({
	loadDrawerChunk: vi.fn(() => Promise.reject(new Error('chunk load failed'))),
}));
vi.mock('./nav-drawer-loader', () => ({ loadDrawerChunk }));

const { toast } = vi.hoisted(() => ({ toast: vi.fn() }));
vi.mock('$lib/components/ui/sonner', () => ({ toast }));

// A failed chunk fetch for the Drawer must not leave `open = true` with nothing mounted and no
// signal to the user (W-049). The Drawer chunk itself never renders on failure either way (the
// `{#if drawerModule}` block stays closed), so the observable proof this test needs is the toast
// that only fires from `loadDrawer`'s `.catch` — without it, a failed fetch is silent.
test('a failed drawer chunk fetch surfaces a toast instead of failing silently', async () => {
	const NavSidebar = (await import('./NavSidebar.svelte')).default;
	render(NavSidebar, { open: true });

	await vi.waitFor(() => expect(toast).toHaveBeenCalledWith(m['toasts.nav.loadFailed']()));
});
