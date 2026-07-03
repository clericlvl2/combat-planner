import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CombatRowMenu from './CombatRowMenu.svelte';

// CLS-1 acceptance: the row menu has exactly Edit and Delete — no Export/share item, no placeholder.

test('menu has exactly Edit and Delete, no Export/share or placeholder items', async () => {
	const screen = render(CombatRowMenu, {
		menuLabel: 'Actions for Goblin Ambush',
		onEdit: vi.fn(),
		onDelete: vi.fn(),
	});

	await screen.getByRole('button', { name: 'Actions for Goblin Ambush' }).click();

	await expect.element(screen.getByRole('menuitem', { name: 'Edit' })).toBeVisible();
	await expect.element(screen.getByRole('menuitem', { name: 'Delete' })).toBeVisible();
	expect(document.body.textContent).not.toContain('Export');
	expect(document.body.querySelectorAll('[role="menuitem"]')).toHaveLength(2);
});

test('selecting Edit calls onEdit', async () => {
	const onEdit = vi.fn();
	const screen = render(CombatRowMenu, {
		menuLabel: 'Actions for Goblin Ambush',
		onEdit,
		onDelete: vi.fn(),
	});

	await screen.getByRole('button', { name: 'Actions for Goblin Ambush' }).click();
	await screen.getByRole('menuitem', { name: 'Edit' }).click();

	expect(onEdit).toHaveBeenCalledOnce();
});

test('selecting Delete calls onDelete', async () => {
	const onDelete = vi.fn();
	const screen = render(CombatRowMenu, {
		menuLabel: 'Actions for Goblin Ambush',
		onEdit: vi.fn(),
		onDelete,
	});

	await screen.getByRole('button', { name: 'Actions for Goblin Ambush' }).click();
	await screen.getByRole('menuitem', { name: 'Delete' }).click();

	expect(onDelete).toHaveBeenCalledOnce();
});
