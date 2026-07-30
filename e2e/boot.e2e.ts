import { expect, test } from '@playwright/test';

// Boot-shell regression (W-041 Phase 2, revised twice). Every assertion here runs with all scripts
// aborted, which freezes the page exactly where it lands after HTML/CSS parse and before any
// hydration — the same DOM state as the true first painted frame under `ssr: false`, since nothing
// clears the shell until the root layout's onMount does.
//
// Phase 2 originally shipped a `#boot-skeleton` overlay here. It was deleted after measurement:
// sampling its computed opacity every frame showed zero visible frames on cold boot at Fast 4G,
// Fast 3G and Slow 3G alike — `onMount` removed it 5-8ms *before* first paint every time, because
// it was styled entirely off `var()` tokens and so could not paint until the render-blocking app
// stylesheet had landed, by which point the parallel-loaded bundle had already run. The only window
// where it did paint was a warm F5 (~32ms skeleton, ~80ms real content), where showing it turned one
// visual change into two and *was* the reported flash. See the report's Phase 2 correction.
test.beforeEach(async ({ page }) => {
	await page.route('**/*.js', (route) => route.abort());
});

// What actually prevents the flash. Until the app stylesheet lands there is no `background` rule at
// all, so the browser paints its own default canvas — white — no matter what `data-theme` says. The
// inline theme script fixes that by also declaring `color-scheme` pre-paint, which is what makes the
// default canvas follow the theme.
//
// The invariant is not "the canvas is dark" — under a light theme white is correct — but that
// `color-scheme` is committed to the resolved theme rather than left at the browser default
// (`normal`). Dropping the declaration while keeping `data-theme` is exactly the regression, and it
// surfaces here as `normal`.
test('the first painted frame commits color-scheme to the resolved theme, not the browser default', async ({
	page,
}) => {
	await page.goto('/', { waitUntil: 'commit' });

	const root = page.locator('html');
	await expect(root).toHaveAttribute('data-theme', /^(dark|light)$/);

	const theme = await root.getAttribute('data-theme');
	await expect(root).toHaveCSS('color-scheme', String(theme));
});

// Nothing may paint app chrome before the app itself does. This is the guard against re-introducing
// a boot-shell overlay: any element that renders a fake header or card here is, by the measurements
// above, either invisible (and therefore pointless) or visible on warm F5 (and therefore the flash).
test('the boot shell paints no app chrome of its own', async ({ page }) => {
	await page.goto('/', { waitUntil: 'commit' });

	await expect(page.locator('#boot-skeleton')).toHaveCount(0);
	// The mount target is the only thing in <body> besides the failure screen, and with scripts
	// blocked it must be empty — nothing is allowed to pre-render chrome into it.
	const bodyText = await page.evaluate(() => document.body.innerText.trim());
	expect(bodyText).toBe('');
});

// The bounded failure screen must stay hidden until its timer fires. It is hidden by an inline
// `display: none` precisely because the `hidden` attribute would depend on Tailwind preflight's
// `[hidden]{display:none!important}` — a rule in the render-blocking stylesheet, i.e. exactly what
// is missing in the failure this element exists for. Aborting the stylesheet as well as the scripts
// is what pins that down.
test('the boot failure screen stays hidden with no stylesheet at all', async ({ page }) => {
	await page.route('**/*.css', (route) => route.abort());

	await page.goto('/', { waitUntil: 'commit' });

	await expect(page.locator('#boot-failed')).toHaveCSS('display', 'none');
	await expect(page.getByText("Couldn't load the app")).not.toBeVisible();
});
