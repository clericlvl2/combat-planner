import { expect, type Page, test } from '@playwright/test';

// PWA E2E (ADR-004, W-033). `vite preview` serves a real, non-mocked service worker —
// `devOptions.enabled: false` in vite.config.ts only suppresses it in dev and unit tests — so
// registration, precaching, and offline serving are all genuinely exercised here.
//
// `beforeinstallprompt` cannot be fired on demand in Playwright, so the InstallBanner's real
// install-eligibility is out of scope for this spec — it rests on the manual device pass
// (specs/reports/2026-07-27-pwa-restoration.md).

test('manifest link is present and the manifest lists PNG icons', async ({ page }) => {
	await page.goto('/');

	const manifestLink = page.locator('link[rel="manifest"]');
	await expect(manifestLink).toHaveCount(1);
	const href = await manifestLink.getAttribute('href');
	expect(href).toBeTruthy();

	const manifest = await page.evaluate(async (manifestHref) => {
		const res = await fetch(manifestHref as string);
		return res.json();
	}, href);

	const pngIcons = manifest.icons.filter((icon: { type: string }) => icon.type === 'image/png');
	expect(pngIcons.length).toBeGreaterThan(0);
});

// Gate on the ready promise, never a timeout: it only resolves once an active worker exists,
// which — for a workbox generateSW build — only happens after the install event's
// precacheController.install() has settled, so activation implies precaching is done too.
// Returns the active worker's script URL so callers can assert the *path* it registered at.
async function activeWorkerScriptUrl(page: Page): Promise<string | null> {
	return page.evaluate(async () => {
		const registration = await navigator.serviceWorker.ready;
		return registration.active?.scriptURL ?? null;
	});
}

test('service worker registers and activates', async ({ page }) => {
	await page.goto('/');

	const scriptUrl = await activeWorkerScriptUrl(page);

	expect(scriptUrl).not.toBeNull();
	// Absolute, root-anchored — not merely "some worker registered" (W-035).
	expect(new URL(scriptUrl as string).pathname).toBe('/sw.js');
});

test('service worker registers when the app is entered directly at a two-segment route', async ({
	page,
}) => {
	// The regression W-035 fixed: a relative './sw.js' resolves against the *document* URL, so
	// entering at depth 0 ('/') worked while '/combats/<id>' — the app's primary screen, and the
	// URL a restored tab, bookmark or PWA launch actually lands on — asked for '/combats/sw.js'.
	// Depth is the whole bug, so no seeded combat is needed: any two-segment in-scope path is
	// served the SPA shell, and the root layout registers before the route ever resolves.
	await page.goto('/combats/00000000-0000-0000-0000-000000000000');

	const scriptUrl = await activeWorkerScriptUrl(page);

	expect(scriptUrl).not.toBeNull();
	expect(new URL(scriptUrl as string).pathname).toBe('/sw.js');
});

test('offline: a root reload and a full navigation to a deep route both serve the app shell', async ({
	page,
	context,
}) => {
	await page.goto('/');
	await expect(page).toHaveURL(/\/combats\/[^/]+\/?$/);

	// Activation implies the precache install step has already settled (see the previous test),
	// so once this resolves the shell is guaranteed to be in the cache.
	await page.evaluate(() => navigator.serviceWorker.ready);

	await context.setOffline(true);

	// Root reload — a fresh, un-controlled navigation to "/" — the base case the precached
	// shell + navigateFallback exist for. Asserting the client-side redirect landed, not merely
	// that <body> is visible: a shell that was served but never hydrated has a visible body too,
	// which is the exact failure this test exists to catch (W-035). Only the hydrated client
	// router can turn "/" into a combat URL. The destination is the list, not the detail route the
	// first-launch assertion above lands on: a combat already exists by now, so "/" resolves to
	// /combats rather than auto-creating and jumping into one.
	await page.goto('/');
	await expect(page).toHaveURL(/\/combats\/?$/);

	// A second, distinct in-scope route reached by a full (non-SPA) navigation, standing in for
	// "open a bookmarked/PWA-launched deep link while offline": /settings, not a /combats/<id>
	// route — see the report for why the two-segment combat detail route can't be asserted here.
	await page.goto('/settings');
	await expect(page).toHaveURL(/\/settings\/?$/);
	// The precached shell ships an empty <body> — every element on the page is client-rendered — so
	// the route's own heading existing at all proves the shell booted rather than just arriving.
	// Matched by role and text rather than visibility: this h1 is deliberately sr-only (clipped,
	// not aria-hidden), so it is in the accessibility tree but would fail `toBeVisible`.
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Settings');

	await context.setOffline(false);
});
