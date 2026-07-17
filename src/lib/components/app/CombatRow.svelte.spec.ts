import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createCombat } from '$lib/stores/domain/factories';
import CombatRow from './CombatRow.svelte';

// Row shows title/description/color tag, row-body tap emits open, and delete
// is confirm-gated through the reused ConfirmDialog (no Undo affordance is offered here).

function fixtureCombat() {
	return createCombat({ title: 'Goblin ambush', description: 'At the bridge', colorTag: 'red' });
}

test('renders title, description, and the color tag dot', async () => {
	const combat = fixtureCombat();
	const screen = render(CombatRow, {
		combat,
		onOpen: vi.fn(),
		onEdit: vi.fn(),
		onDelete: vi.fn(),
	});

	await expect.element(screen.getByText('Goblin ambush')).toBeVisible();
	await expect.element(screen.getByText('At the bridge')).toBeVisible();
	await expect.element(screen.getByRole('img', { name: 'Color tag: Red' })).toBeInTheDocument();
});

test('tapping the row body (outside the menu) calls onOpen with the combat id', async () => {
	const combat = fixtureCombat();
	const onOpen = vi.fn();
	const screen = render(CombatRow, { combat, onOpen, onEdit: vi.fn(), onDelete: vi.fn() });

	await screen.getByText('Goblin ambush').click();

	expect(onOpen).toHaveBeenCalledExactlyOnceWith(combat.id);
});

test('Edit menu item calls onEdit with the combat id, without opening the row', async () => {
	const combat = fixtureCombat();
	const onOpen = vi.fn();
	const onEdit = vi.fn();
	const screen = render(CombatRow, { combat, onOpen, onEdit, onDelete: vi.fn() });

	await screen.getByRole('button', { name: `Actions for ${combat.title}` }).click();
	await screen.getByRole('menuitem', { name: 'Edit' }).click();

	expect(onEdit).toHaveBeenCalledExactlyOnceWith(combat.id);
	expect(onOpen).not.toHaveBeenCalled();
});

test('Delete menu item opens a confirm dialog; onDelete only fires after confirming', async () => {
	const combat = fixtureCombat();
	const onDelete = vi.fn();
	const screen = render(CombatRow, { combat, onOpen: vi.fn(), onEdit: vi.fn(), onDelete });

	await screen.getByRole('button', { name: `Actions for ${combat.title}` }).click();
	await screen.getByRole('menuitem', { name: 'Delete' }).click();

	await expect
		.element(screen.getByRole('alertdialog', { name: 'Delete this combat?' }))
		.toBeVisible();
	expect(onDelete).not.toHaveBeenCalled();

	await screen.getByRole('button', { name: 'Delete' }).click();

	expect(onDelete).toHaveBeenCalledExactlyOnceWith(combat.id);
});

test('cancelling the confirm dialog does not call onDelete', async () => {
	const combat = fixtureCombat();
	const onDelete = vi.fn();
	const screen = render(CombatRow, { combat, onOpen: vi.fn(), onEdit: vi.fn(), onDelete });

	await screen.getByRole('button', { name: `Actions for ${combat.title}` }).click();
	await screen.getByRole('menuitem', { name: 'Delete' }).click();
	await screen.getByRole('button', { name: 'Cancel' }).click();

	expect(onDelete).not.toHaveBeenCalled();
});
