import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CatchallPage from './+page.svelte';

// Root catch-all — renders a styled not-found state (route.notFound.*), distinct from
// combat.notFound.*, with a visible and aria-labelled Back-to-Combats control.

test('renders the page-not-found title and a labelled Back-to-Combats control', async () => {
	const screen = render(CatchallPage);

	await expect.element(screen.getByText('Page not found')).toBeInTheDocument();
	await expect.element(screen.getByRole('button', { name: 'Back to Combats' })).toBeInTheDocument();
});
