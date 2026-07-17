import { Plus } from '@lucide/svelte';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FAB from './FAB.svelte';

// Shared bottom-right thumb-zone Button — icon + a11y label + onclick,
// disabled forwarded (e.g. the Active "advance" FAB at the round-wrap boundary).

test('renders an accessible button with the given label and fires onclick', async () => {
	const onclick = vi.fn();
	const screen = render(FAB, { icon: Plus, label: 'Create combat', onclick });

	const button = screen.getByRole('button', { name: 'Create combat' });
	await button.click();

	expect(onclick).toHaveBeenCalledOnce();
});

test('disabled forwards to the underlying Button', async () => {
	const onclick = vi.fn();
	const screen = render(FAB, { icon: Plus, label: 'Advance turn', onclick, disabled: true });

	await expect.element(screen.getByRole('button', { name: 'Advance turn' })).toBeDisabled();
});
