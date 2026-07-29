import { expect, test } from '@playwright/test';

// Boot-flash regression (W-041, Phase 2 skeleton). This test exists to catch the specific
// symptom the whole plan is about: a hard blank-to-content cut, i.e. a real frame that renders
// nothing at all before the app takes over. Asserting "the page eventually shows content" would
// not catch that — the app always eventually renders. Instead this pins down the *first*
// painted frame specifically, by blocking every script so the page can never advance past it.
//
// If src/app.html's #boot-skeleton were removed, there would be nothing left to find here but
// the pre-paint theme script's background color: no bar, no bounding box, no chrome — the
// locator below would fail to resolve and the test would fail. That is how we know it can
// actually catch the regression, not just always pass.
test('the first painted frame shows app chrome, not a blank canvas', async ({ page }) => {
	// Abort every script so the page is frozen exactly where it lands after HTML/CSS parse and
	// before any hydration could run — the same DOM state as the true first painted frame with
	// `ssr: false` (nothing clears it until the root layout's onMount does).
	await page.route('**/*.js', (route) => route.abort());

	await page.goto('/', { waitUntil: 'commit' });

	const header = page.locator('#boot-skeleton > div').first();
	await expect(header).toBeVisible();

	const box = await header.boundingBox();
	expect(box).not.toBeNull();
	// A real chrome bar: pinned to the top, with real height — not a zero-size or offscreen node.
	expect(box?.y).toBe(0);
	expect(box?.height).toBeGreaterThan(20);
	expect(box?.width).toBeGreaterThan(100);
});
