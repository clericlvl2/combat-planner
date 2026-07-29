#!/usr/bin/env node
// Boot-flash measurement rig (W-041). Reproduces the methodology behind
// specs/reports/2026-07-29-boot-flash.md's baseline table so before/after numbers are
// comparable: headless Chromium 1440x900, dark color scheme, CPU throttled 4x, network "Fast
// 3G" via CDP, PerformanceObserver (buffered) for first-paint/FCP/LCP/CLS. Diagnostic tool
// only — not part of `npm run gate`.
//
// Measures four scenarios against the real adapter-static `build/` output (served by
// scripts/serve-build.mjs, not `vite preview` — see that script's header comment for why):
//   - Cold `/`      — fresh profile, empty IndexedDB, no service worker.
//   - F5 on `/`     — service worker warm, IndexedDB seeded.
//   - F5 on `/combats`
//   - F5 on `/combats/<seeded id>`
//
// "Blank window" in the report's table is the time from navigation start to the first painted
// pixel — by definition nothing paints before the browser's own `first-paint` entry, so it is
// reported here as that value rather than independently re-derived. An earlier version of this
// script tried to corroborate it by polling `page.screenshot()` concurrently with the
// navigation and diffing frame bytes (the technique needed because CDP's screencast stops
// delivering frames across a reload); that added a second, noisier measurement of the same
// instant without changing the number, so it was dropped in favour of the Performance API,
// which is both simpler and authoritative here.

import { chromium } from 'playwright';
import { createServer } from './serve-build.mjs';

const PORT = 4310;
const BASE_URL = `http://localhost:${PORT}`;

const VIEWPORT = { width: 1440, height: 900 };
const CPU_THROTTLE_RATE = 4;
// Fast 3G: 1.6 Mbps down / 750 Kbps up / 150ms RTT.
const NETWORK_CONDITIONS = {
	offline: false,
	downloadThroughput: (1.6 * 1000 * 1000) / 8,
	uploadThroughput: (750 * 1000) / 8,
	latency: 150,
};

/** Registers PerformanceObservers on every document the page loads (survives reloads). */
async function installMetricsCollector(page) {
	await page.addInitScript(() => {
		window.__bootMetrics = { firstPaint: null, fcp: null, lcp: null, cls: 0 };
		try {
			new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (entry.name === 'first-paint') window.__bootMetrics.firstPaint = entry.startTime;
					if (entry.name === 'first-contentful-paint') window.__bootMetrics.fcp = entry.startTime;
				}
			}).observe({ type: 'paint', buffered: true });
			new PerformanceObserver((list) => {
				const entries = list.getEntries();
				const last = entries[entries.length - 1];
				if (last) window.__bootMetrics.lcp = last.startTime;
			}).observe({ type: 'largest-contentful-paint', buffered: true });
			new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (!entry.hadRecentInput) window.__bootMetrics.cls += entry.value;
				}
			}).observe({ type: 'layout-shift', buffered: true });
		} catch {
			// Older engines without one of these observer types — leave the metric null/0.
		}
	});
}

async function applyThrottling(page) {
	const client = await page.context().newCDPSession(page);
	await client.send('Network.enable');
	await client.send('Network.emulateNetworkConditions', NETWORK_CONDITIONS);
	await client.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE_RATE });
	return client;
}

async function readMetrics(page) {
	// Buffered observers already have every entry queued; a short wait covers any observer
	// callback still in flight (LCP/CLS can keep reporting for a beat after `load`).
	await page.waitForTimeout(300);
	return page.evaluate(() => window.__bootMetrics);
}

async function measureScenario(page, label, navigate, settle) {
	await navigate();
	await (settle ? settle(page) : page.waitForTimeout(500));
	const metrics = await readMetrics(page);
	return {
		label,
		firstPaint: metrics.firstPaint,
		fcp: metrics.fcp,
		lcp: metrics.lcp,
		cls: metrics.cls,
	};
}

function fmt(ms) {
	return ms === null || ms === undefined ? 'n/a' : `${Math.round(ms)} ms`;
}

async function main() {
	const server = createServer();
	await new Promise((resolve) => server.listen(PORT, resolve));

	const browser = await chromium.launch({ headless: true });
	const results = [];

	try {
		// --- Cold `/`: fresh context, no seeded IndexedDB, no service worker yet. ---
		{
			const context = await browser.newContext({ viewport: VIEWPORT, colorScheme: 'dark' });
			const page = await context.newPage();
			await installMetricsCollector(page);
			await applyThrottling(page);

			const result = await measureScenario(
				page,
				'Cold `/` (no SW, empty IndexedDB)',
				() => page.goto(`${BASE_URL}/`, { waitUntil: 'load' }),
				// Cold `/` renders CombatsHome, then the first-launch redirect (a client-side
				// navigation, not a new document) lands on the seeded combat — wait for that URL
				// rather than a fixed delay, capped well above the report's measured 4264ms FCP.
				(p) => p.waitForURL(/\/combats\/[^/]+\/?$/, { timeout: 15000 }),
			);
			results.push(result);
			await context.close();
		}

		// --- Warm scenarios: one context, seeded by a real, unthrottled first launch. ---
		{
			const context = await browser.newContext({ viewport: VIEWPORT, colorScheme: 'dark' });
			const page = await context.newPage();
			await installMetricsCollector(page);

			// Seed: normal-speed first launch so the service worker installs and IndexedDB gets
			// its auto-created combat, matching what a real returning user's browser looks like —
			// otherwise "F5" scenarios would be measuring a cold profile's first paint instead.
			await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
			await page.waitForFunction(() => navigator.serviceWorker.ready.then(() => true));
			await page.waitForLoadState('networkidle');
			const seededUrl = new URL(page.url());
			const seededCombatId = seededUrl.pathname.split('/').filter(Boolean)[1];
			if (!seededCombatId) {
				throw new Error(
					`Expected first launch to land on /combats/<id>, got ${seededUrl.pathname}`,
				);
			}

			await applyThrottling(page);

			results.push(
				await measureScenario(page, 'F5 on `/` (SW warm)', () =>
					page.goto(`${BASE_URL}/`, { waitUntil: 'load' }),
				),
			);
			results.push(
				await measureScenario(page, 'F5 on `/combats`', () =>
					page.goto(`${BASE_URL}/combats`, { waitUntil: 'load' }),
				),
			);
			results.push(
				await measureScenario(page, 'F5 on `/combats/<id>`', () =>
					page.goto(`${BASE_URL}/combats/${seededCombatId}`, { waitUntil: 'load' }),
				),
			);

			await context.close();
		}
	} finally {
		await browser.close();
		server.close();
	}

	console.log('\n| Scenario | first-paint | FCP | LCP | CLS | blank window |');
	console.log('|---|---:|---:|---:|---:|---:|');
	for (const r of results) {
		// Blank window == first-paint; see the header comment for why it is not measured
		// independently.
		console.log(
			`| ${r.label} | ${fmt(r.firstPaint)} | ${fmt(r.fcp)} | ${fmt(r.lcp)} | ${(r.cls ?? 0).toFixed(3)} | ${fmt(r.firstPaint)} |`,
		);
	}
	console.log();
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
