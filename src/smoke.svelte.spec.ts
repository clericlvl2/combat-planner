import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import About from './routes/about/+page.svelte';

// Smoke test for the component layer (@testing-library-style via vitest-browser-svelte,
// ADR-009). Real per-component state/a11y cases land in the components' own test files.
test('About page renders its localized heading', async () => {
	const screen = render(About);
	await expect.element(screen.getByRole('heading', { name: 'About' })).toBeVisible();
});
