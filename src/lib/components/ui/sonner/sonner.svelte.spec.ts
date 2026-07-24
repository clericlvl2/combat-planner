import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Toaster, toast } from './index';

// Toast/snackbar primitive (svelte-sonner) mounted once at the app root — this spec confirms
// the wrapper mounts cleanly and a manually-triggered toast renders into the DOM.

test('mounts without error', async () => {
	const screen = render(Toaster, { theme: 'light' });

	expect(screen.container).toBeInTheDocument();
});

test('a manually-triggered toast renders into the DOM', async () => {
	const screen = render(Toaster, { theme: 'light' });

	toast('test');

	await expect.element(screen.getByText('test')).toBeInTheDocument();
});
