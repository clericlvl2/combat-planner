import { afterEach, expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import { m } from '$lib/i18n';
import { createCombat } from '$lib/stores/domain/factories';
import CombatFormDialog from './CombatFormDialog.svelte';

// Component test (create adds at top / cap message on null, edit pre-fills and
// patches only title/description/colorTag).
afterEach(() => {
	cleanup();
});

test('create mode calls store.createCombat with the form values', async () => {
	const createCombatFn = vi.fn(() => createCombat({ title: 'Goblin ambush' }, 0, () => 'new'));
	const editCombatFn = vi.fn();
	const store = { createCombat: createCombatFn, editCombat: editCombatFn };
	const screen = render(CombatFormDialog, { open: true, store });

	await expect
		.element(screen.getByRole('dialog', { name: m['forms.combat.create.title']() }))
		.toBeVisible();

	await userEvent.fill(screen.getByLabelText(m['forms.field.title']()), 'Goblin ambush');
	await userEvent.fill(screen.getByLabelText(m['forms.field.description']()), 'At the bridge');
	await screen.getByRole('button', { name: m['forms.action.create']() }).click();

	expect(createCombatFn).toHaveBeenCalledTimes(1);
	expect(createCombatFn).toHaveBeenCalledWith({
		title: 'Goblin ambush',
		description: 'At the bridge',
		colorTag: 'neutral',
	});
	expect(editCombatFn).not.toHaveBeenCalled();
});

test('create mode with a blank title persists the localized default title', async () => {
	const createCombatFn = vi.fn(() => createCombat({ title: 'New combat' }, 0, () => 'new'));
	const editCombatFn = vi.fn();
	const store = { createCombat: createCombatFn, editCombat: editCombatFn };
	const screen = render(CombatFormDialog, { open: true, store });

	await screen.getByRole('button', { name: m['forms.action.create']() }).click();

	expect(createCombatFn).toHaveBeenCalledTimes(1);
	expect(createCombatFn).toHaveBeenCalledWith({
		title: m['combats.defaultTitle'](),
		description: '',
		colorTag: 'neutral',
	});
});

test('create mode with a whitespace-only title persists the localized default title', async () => {
	const createCombatFn = vi.fn(() => createCombat({ title: 'New combat' }, 0, () => 'new'));
	const editCombatFn = vi.fn();
	const store = { createCombat: createCombatFn, editCombat: editCombatFn };
	const screen = render(CombatFormDialog, { open: true, store });

	await userEvent.fill(screen.getByLabelText(m['forms.field.title']()), '   ');
	await screen.getByRole('button', { name: m['forms.action.create']() }).click();

	expect(createCombatFn).toHaveBeenCalledTimes(1);
	expect(createCombatFn).toHaveBeenCalledWith({
		title: m['combats.defaultTitle'](),
		description: '',
		colorTag: 'neutral',
	});
});

test('create mode blocks silently and keeps the dialog open when store returns null (cap hit)', async () => {
	const createCombatFn = vi.fn(() => null);
	const store = { createCombat: createCombatFn, editCombat: vi.fn() };
	const screen = render(CombatFormDialog, { open: true, store });

	await userEvent.fill(screen.getByLabelText(m['forms.field.title']()), 'One too many');
	await screen.getByRole('button', { name: m['forms.action.create']() }).click();

	// Cap enforcement is silent: no new combat, and the dialog stays open (no error text shown).
	expect(createCombatFn).toHaveBeenCalledTimes(1);
	await expect
		.element(screen.getByRole('dialog', { name: m['forms.combat.create.title']() }))
		.toBeVisible();
});

test('create mode starts blank again after an abandoned session', async () => {
	const store = { createCombat: vi.fn(), editCombat: vi.fn() };
	const screen = render(CombatFormDialog, { open: true, store });

	await userEvent.fill(screen.getByLabelText(m['forms.field.title']()), 'Abandoned draft');
	await screen.getByRole('button', { name: m['forms.action.cancel']() }).click();

	// The {#key} keys on `combat?.id ?? 'new'`, which is the constant 'new' here, and the body
	// lives outside the content bits-ui tears down — so nothing remounts. Re-seeding on close is
	// what keeps the next session blank.
	await screen.rerender({ open: true, store });
	await expect
		.element(screen.getByRole('dialog', { name: m['forms.combat.create.title']() }))
		.toBeVisible();

	await expect.element(screen.getByLabelText(m['forms.field.title']())).toHaveValue('');
	expect(store.createCombat).not.toHaveBeenCalled();
});

test('edit mode pre-fills from the existing combat', async () => {
	const combat = createCombat(
		{ title: 'Dragon lair', description: 'Final boss', colorTag: 'red' },
		0,
		() => 'existing',
	);
	const store = { createCombat: vi.fn(), editCombat: vi.fn() };
	const screen = render(CombatFormDialog, { open: true, combat, store });

	await expect
		.element(screen.getByRole('dialog', { name: m['forms.combat.edit.title']() }))
		.toBeVisible();
	await expect.element(screen.getByLabelText(m['forms.field.title']())).toHaveValue('Dragon lair');
	await expect
		.element(screen.getByLabelText(m['forms.field.description']()))
		.toHaveValue('Final boss');
	await expect
		.element(screen.getByRole('radio', { name: m['forms.colorTag.red']() }))
		.toHaveAttribute('aria-checked', 'true');
});

test('edit mode calls store.editCombat with only title/description/colorTag', async () => {
	const combat = createCombat(
		{ title: 'Dragon lair', description: 'Final boss', colorTag: 'red' },
		0,
		() => 'existing',
	);
	const editCombatFn = vi.fn();
	const createCombatFn = vi.fn();
	const store = { createCombat: createCombatFn, editCombat: editCombatFn };
	const screen = render(CombatFormDialog, { open: true, combat, store });

	await userEvent.fill(screen.getByLabelText(m['forms.field.title']()), 'Dragon lair, part 2');
	await screen.getByRole('button', { name: m['forms.action.save']() }).click();

	expect(editCombatFn).toHaveBeenCalledTimes(1);
	expect(editCombatFn).toHaveBeenCalledWith('existing', {
		title: 'Dragon lair, part 2',
		description: 'Final boss',
		colorTag: 'red',
	});
	expect(createCombatFn).not.toHaveBeenCalled();
});
