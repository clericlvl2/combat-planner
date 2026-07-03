import { afterEach, expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import { m } from '$lib/i18n';
import CombatantForm from './CombatantForm.svelte';

// Component test for CBT-3 (add-mode defaults, name-required validation, NumberField clamp,
// onSubmit shape). Add mode only — edit-mode prefill isn't part of this AC.
afterEach(() => {
	cleanup();
});

test('add mode renders blank defaults: empty name, enemy type preselected, no numeric prefill', async () => {
	const onSubmit = vi.fn();
	const screen = render(CombatantForm, { mode: 'add', open: true, onSubmit });

	await expect
		.element(screen.getByRole('dialog', { name: m['forms.combatant.add.title']() }))
		.toBeVisible();
	await expect.element(screen.getByLabelText(m['forms.field.name']())).toHaveValue('');
	await expect
		.element(screen.getByRole('radio', { name: m['forms.type.enemy']() }))
		.toHaveAttribute('aria-checked', 'true');
	await expect.element(screen.getByLabelText(m['forms.field.maxHp']())).toHaveValue(null);
	await expect.element(screen.getByLabelText(m['forms.field.ac']())).toHaveValue(null);
	await expect.element(screen.getByLabelText(m['forms.field.pd']())).toHaveValue(null);
	await expect.element(screen.getByLabelText(m['forms.field.md']())).toHaveValue(null);
	await expect.element(screen.getByLabelText(m['forms.field.initBonus']())).toHaveValue(null);
	await expect.element(screen.getByLabelText(m['forms.field.note']())).toHaveValue('');
});

test('name-required validation blocks submit', async () => {
	const onSubmit = vi.fn();
	const screen = render(CombatantForm, { mode: 'add', open: true, onSubmit });

	await screen.getByRole('button', { name: m['forms.action.save']() }).click();

	expect(onSubmit).not.toHaveBeenCalled();
	await expect.element(screen.getByText(m['errors.nameRequired']())).toBeVisible();
});

test('numeric fields clamp to their NumberField min/max on commit', async () => {
	const onSubmit = vi.fn();
	const screen = render(CombatantForm, { mode: 'add', open: true, onSubmit });

	const maxHpInput = screen.getByLabelText(m['forms.field.maxHp']());
	// Below RANGES.maxHp.min (1) but within the field's digit cap, so it isn't truncated pre-commit.
	await userEvent.fill(maxHpInput, '0');
	// Move focus off the field to fire the blur/change commit handler.
	await screen.getByLabelText(m['forms.field.name']()).click();

	await expect.element(maxHpInput).toHaveValue(1);
	await expect.element(screen.getByText(m['errors.clamp']({ min: 1, max: 999 }))).toBeVisible();
	expect(onSubmit).not.toHaveBeenCalled();
});

test('onSubmit fires with the expected normalized shape', async () => {
	const onSubmit = vi.fn();
	const screen = render(CombatantForm, { mode: 'add', open: true, onSubmit });

	await userEvent.fill(screen.getByLabelText(m['forms.field.name']()), 'Ogre');
	await userEvent.fill(screen.getByLabelText(m['forms.field.maxHp']()), '40');
	await screen.getByRole('button', { name: m['forms.action.save']() }).click();

	expect(onSubmit).toHaveBeenCalledTimes(1);
	expect(onSubmit).toHaveBeenCalledWith({
		name: 'Ogre',
		type: 'enemy',
		initiativeBonus: null,
		maxHp: 40,
		ac: null,
		pd: null,
		md: null,
		note: '',
		initiative: null,
	});
});
