import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import ConfirmDialog from './ConfirmDialog.svelte';

// Destructive confirm gate. Restyle-only change (Phase 4) — covers the behavior contract
// so the visual pass can't silently break the confirm/cancel callbacks or the gating itself.

afterEach(() => {
	cleanup();
});

test('renders the title/body and calls onConfirm when the confirm action is clicked', async () => {
	const onConfirm = vi.fn();
	const screen = render(ConfirmDialog, {
		open: true,
		title: 'Delete combat?',
		body: '"Goblin Ambush" will be permanently removed.',
		confirmLabel: 'Delete',
		onConfirm,
	});

	await expect.element(screen.getByRole('alertdialog', { name: 'Delete combat?' })).toBeVisible();
	await expect
		.element(screen.getByText('"Goblin Ambush" will be permanently removed.'))
		.toBeVisible();

	await screen.getByRole('button', { name: 'Delete' }).click();

	expect(onConfirm).toHaveBeenCalledOnce();
});

test('does not call onConfirm when cancel is clicked', async () => {
	const onConfirm = vi.fn();
	const screen = render(ConfirmDialog, {
		open: true,
		title: 'Delete combat?',
		body: 'This cannot be undone.',
		confirmLabel: 'Delete',
		onConfirm,
	});

	await screen.getByRole('button', { name: 'Cancel' }).click();

	expect(onConfirm).not.toHaveBeenCalled();
});
