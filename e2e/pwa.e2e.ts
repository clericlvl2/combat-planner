import { expect, test } from '@playwright/test';

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

test('service worker registers and activates', async ({ page }) => {
	await page.goto('/');

	// Gate on the ready promise, never a timeout: it only resolves once an active worker exists,
	// which — for a workbox generateSW build — only happens after the install event's
	// precacheController.install() has settled, so activation implies precaching is done too.
	const hasActiveWorker = await page.evaluate(async () => {
		const registration = await navigator.serviceWorker.ready;
		return registration.active !== null;
	});

	expect(hasActiveWorker).toBe(true);
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
	// shell + navigateFallback exist for.
	await page.goto('/');
	await expect(page.locator('body')).toBeVisible();

	// A second, distinct in-scope route reached by a full (non-SPA) navigation, standing in for
	// "open a bookmarked/PWA-launched deep link while offline": /settings, not a /combats/<id>
	// route — see the report for why the two-segment combat detail route can't be asserted here.
	await page.goto('/settings');
	await expect(page.locator('body')).toBeVisible();
	await expect(page).toHaveURL(/\/settings\/?$/);

	await context.setOffline(false);
});
