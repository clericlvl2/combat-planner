import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LibraryRowMenu from './LibraryRowMenu.svelte';

// The row menu has exactly Edit and Delete — mirrors CombatRowMenu.

test('menu has exactly Edit and Delete, no other items', async () => {
	const screen = render(LibraryRowMenu, {
		menuLabel: 'Actions for Goblin',
		onEdit: vi.fn(),
		onDelete: vi.fn(),
	});

	await screen.getByRole('button', { name: 'Actions for Goblin' }).click();

	await expect.element(screen.getByRole('menuitem', { name: 'Edit' })).toBeVisible();
	await expect.element(screen.getByRole('menuitem', { name: 'Delete' })).toBeVisible();
	expect(document.body.querySelectorAll('[role="menuitem"]')).toHaveLength(2);
});

test('selecting Edit calls onEdit', async () => {
	const onEdit = vi.fn();
	const screen = render(LibraryRowMenu, {
		menuLabel: 'Actions for Goblin',
		onEdit,
		onDelete: vi.fn(),
	});

	await screen.getByRole('button', { name: 'Actions for Goblin' }).click();
	await screen.getByRole('menuitem', { name: 'Edit' }).click();

	expect(onEdit).toHaveBeenCalledOnce();
});

test('selecting Delete calls onDelete', async () => {
	const onDelete = vi.fn();
	const screen = render(LibraryRowMenu, {
		menuLabel: 'Actions for Goblin',
		onEdit: vi.fn(),
		onDelete,
	});

	await screen.getByRole('button', { name: 'Actions for Goblin' }).click();
	await screen.getByRole('menuitem', { name: 'Delete' }).click();

	expect(onDelete).toHaveBeenCalledOnce();
});
