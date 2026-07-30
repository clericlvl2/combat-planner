import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import type { PersistenceDb } from '$lib/db/persistence';
import type { Settings } from '$lib/db/types';
import { m } from '$lib/i18n';
import { CombatStore } from '$lib/stores/combat-store.svelte';
import InstallBanner from './InstallBanner.svelte';

// `beforeinstallprompt` cannot be fired on demand by the platform in this test environment (no
// real Chrome install-eligibility signal to trigger) — these specs dispatch a synthetic `Event`
// augmented with a stubbed `prompt()`, which covers the render-gating logic (event fired / not
// dismissed / not standalone), the install action's prompt() call + one-shot consumption, and the
// dismiss-persists contract. What they do NOT cover: that a real browser actually fires the event
// under real install-eligibility conditions, or the real `userChoice` resolution shape — that
// rests on the manual production pass (specs/reports/2026-07-27-pwa-restoration.md, phase 5).

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});

function fakeDb(): PersistenceDb {
	const settingsRows = new Map<string, Settings>();
	return {
		combats: {
			toArray: async () => [],
			put: async () => undefined,
			bulkPut: async () => undefined,
			delete: async () => undefined,
			clear: async () => undefined,
		},
		settings: {
			get: async (id) => settingsRows.get(id),
			put: async (s) => {
				settingsRows.set(s.id, structuredClone(s));
			},
		},
		libraryEntries: {
			toArray: async () => [],
			put: async () => undefined,
			delete: async () => undefined,
		},
	};
}

function mockStandalone(matches: boolean) {
	vi.spyOn(window, 'matchMedia').mockImplementation(
		(query) =>
			({
				matches: query === '(display-mode: standalone)' ? matches : false,
				media: query,
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn(),
			}) as unknown as MediaQueryList,
	);
}

/** Simulates the browser firing `beforeinstallprompt` with a stubbed, single-use `prompt()`. */
function fireInstallPrompt() {
	const promptFn = vi.fn().mockResolvedValue(undefined);
	const event = new Event('beforeinstallprompt', { cancelable: true });
	Object.assign(event, { prompt: promptFn });
	window.dispatchEvent(event);
	return { event, promptFn };
}

test('stays hidden until beforeinstallprompt fires', async () => {
	const store = new CombatStore(fakeDb());
	await store.hydrate();
	const screen = render(InstallBanner, { store });

	await expect
		.element(screen.getByRole('button', { name: m['toasts.install.action']() }))
		.not.toBeInTheDocument();
});

// W-041 Phase 1: the banner is gated on `store.ready`, so it cannot occupy layout during the
// pre-hydrate boot window (the desktop "black lines at the top of the screen" symptom — a banner
// strip painting against unhydrated settings, then vanishing). Every other spec here hydrates
// first, which makes `ready` true and would silently pass with the gate removed; this is the only
// case that actually exercises it.
test('stays hidden before hydrate even when beforeinstallprompt has fired, then appears once ready', async () => {
	mockStandalone(false);
	const store = new CombatStore(fakeDb());
	expect(store.ready).toBe(false);
	const screen = render(InstallBanner, { store });

	fireInstallPrompt();

	await expect
		.element(screen.getByRole('button', { name: m['toasts.install.action']() }))
		.not.toBeInTheDocument();

	// Same store, same stashed prompt — only `ready` changes, so the banner appearing here proves
	// the gate above was what suppressed it, not the event or the dismissed flag.
	await store.hydrate();

	await expect
		.element(screen.getByRole('button', { name: m['toasts.install.action']() }))
		.toBeVisible();
});

test('renders the install hint once beforeinstallprompt fires', async () => {
	const store = new CombatStore(fakeDb());
	await store.hydrate();
	const screen = render(InstallBanner, { store });

	const { event } = fireInstallPrompt();

	await expect.element(screen.getByText(m['toasts.install.message']())).toBeVisible();
	await expect
		.element(screen.getByRole('button', { name: m['toasts.install.action']() }))
		.toBeVisible();
	await expect
		.element(screen.getByRole('button', { name: m['toasts.install.dismiss']() }))
		.toBeVisible();
	expect(event.defaultPrevented).toBe(true);
});

test('never renders in standalone display mode, even after the event fires', async () => {
	mockStandalone(true);
	const store = new CombatStore(fakeDb());
	await store.hydrate();
	const screen = render(InstallBanner, { store });

	fireInstallPrompt();

	await expect
		.element(screen.getByRole('button', { name: m['toasts.install.action']() }))
		.not.toBeInTheDocument();
});

test('never renders once installHintDismissed is already true', async () => {
	mockStandalone(false);
	const store = new CombatStore(fakeDb());
	await store.hydrate();
	store.updateSettings({ installHintDismissed: true });
	const screen = render(InstallBanner, { store });

	fireInstallPrompt();

	await expect
		.element(screen.getByRole('button', { name: m['toasts.install.action']() }))
		.not.toBeInTheDocument();
});

test('dismiss persists installHintDismissed and hides the banner for good', async () => {
	const store = new CombatStore(fakeDb());
	await store.hydrate();
	const screen = render(InstallBanner, { store });
	fireInstallPrompt();

	await screen.getByRole('button', { name: m['toasts.install.dismiss']() }).click();

	expect(store.settings.installHintDismissed).toBe(true);
	await expect
		.element(screen.getByRole('button', { name: m['toasts.install.action']() }))
		.not.toBeInTheDocument();

	// Persisted, not just in-memory — a later mount over the same store must not show it again.
	cleanup();
	const screenAgain = render(InstallBanner, { store });
	fireInstallPrompt();
	await expect
		.element(screenAgain.getByRole('button', { name: m['toasts.install.action']() }))
		.not.toBeInTheDocument();
});

test('install calls prompt() on the stashed event and does not linger afterward', async () => {
	const store = new CombatStore(fakeDb());
	await store.hydrate();
	const screen = render(InstallBanner, { store });
	const { promptFn } = fireInstallPrompt();

	await screen.getByRole('button', { name: m['toasts.install.action']() }).click();

	expect(promptFn).toHaveBeenCalledOnce();
	await expect
		.element(screen.getByRole('button', { name: m['toasts.install.action']() }))
		.not.toBeInTheDocument();
});
