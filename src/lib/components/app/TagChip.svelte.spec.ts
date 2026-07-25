import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import TagChip from './TagChip.svelte';

// The ✕ is always visible when removable; a single tap/click (or keyboard activation) removes the
// tag in one shot — there is no press-and-hold gesture.

afterEach(() => {
	cleanup();
});

test('renders the tag name, no ✕ when not removable', async () => {
	const screen = render(TagChip, { name: 'Boss' });

	await expect.element(screen.getByText('Boss')).toBeVisible();
	expect(screen.getByRole('button', { name: 'Remove tag Boss' }).query()).toBeNull();
});

test('removable chip always shows a trailing ✕ button', async () => {
	const screen = render(TagChip, { name: 'Boss', removable: true, onRemove: vi.fn() });

	await expect.element(screen.getByRole('button', { name: 'Remove tag Boss' })).toBeVisible();
});

test('a single click on the ✕ removes immediately', async () => {
	const onRemove = vi.fn();
	const screen = render(TagChip, { name: 'Boss', removable: true, onRemove });

	await screen.getByRole('button', { name: 'Remove tag Boss' }).click();

	expect(onRemove).toHaveBeenCalledExactlyOnceWith('Boss');
});

test('keyboard activation of the ✕ (click with detail 0) removes immediately', async () => {
	const onRemove = vi.fn();
	const screen = render(TagChip, { name: 'Boss', removable: true, onRemove });

	const closeButton = screen.getByRole('button', { name: 'Remove tag Boss' }).element();
	closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));

	expect(onRemove).toHaveBeenCalledExactlyOnceWith('Boss');
});
