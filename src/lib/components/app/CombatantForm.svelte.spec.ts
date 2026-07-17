import { afterEach, expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-svelte';
import { m } from '$lib/i18n';
import CombatantForm from './CombatantForm.svelte';

// Component test (add-mode defaults, name-required validation, NumberField clamp,
// onSubmit shape). Add mode only — edit-mode prefill isn't part of this.
afterEach(() => {
	cleanup();
});

test('add mode renders real pre-filled defaults: empty name (placeholder shown), enemy type preselected, numeric fields pre-filled', async () => {
	const onSubmit = vi.fn();
	const screen = render(CombatantForm, { mode: 'add', open: true, onSubmit });

	await expect
		.element(screen.getByRole('dialog', { name: m['forms.combatant.add.title']() }))
		.toBeVisible();
	const nameInput = screen.getByLabelText(m['forms.field.name']());
	await expect.element(nameInput).toHaveValue('');
	await expect
		.element(nameInput)
		.toHaveAttribute('placeholder', m['forms.field.name.placeholder.enemy']());
	await expect
		.element(screen.getByRole('radio', { name: m['forms.type.enemy']() }))
		.toHaveAttribute('aria-checked', 'true');
	await expect.element(screen.getByLabelText(m['forms.field.maxHp']())).toHaveValue('10');
	await expect.element(screen.getByLabelText(m['forms.field.ac']())).toHaveValue('10');
	await expect.element(screen.getByLabelText(m['forms.field.pd']())).toHaveValue('10');
	await expect.element(screen.getByLabelText(m['forms.field.md']())).toHaveValue('10');
	await expect.element(screen.getByLabelText(m['forms.field.initBonus']())).toHaveValue('0');
	await expect.element(screen.getByLabelText(m['forms.field.note']())).toHaveValue('');
});

test('empty name does not block submit: type placeholder becomes the stored name', async () => {
	const onSubmit = vi.fn();
	const screen = render(CombatantForm, { mode: 'add', open: true, onSubmit });

	await screen.getByRole('button', { name: m['forms.action.add']() }).click();

	expect(onSubmit).toHaveBeenCalledTimes(1);
	expect(onSubmit).toHaveBeenCalledWith(
		expect.objectContaining({ name: m['forms.field.name.placeholder.enemy']() }),
	);
});

test('numeric fields clamp to their NumberField min/max on commit', async () => {
	const onSubmit = vi.fn();
	const screen = render(CombatantForm, { mode: 'add', open: true, onSubmit });

	const maxHpInput = screen.getByLabelText(m['forms.field.maxHp']());
	// Below RANGES.maxHp.min (1) but within the field's digit cap, so it isn't truncated pre-commit.
	await userEvent.fill(maxHpInput, '0');
	// Fire the commit handler directly (a single 'change') so the clamp/aria-invalid assertion below
	// observes the initial over-range commit, not a later no-op re-commit of the already-clamped
	// value that a subsequent native blur would otherwise trigger.
	maxHpInput.element().dispatchEvent(new Event('change', { bubbles: true }));

	await expect.element(maxHpInput).toHaveValue('1');
	await expect.element(maxHpInput).toHaveAttribute('aria-invalid', 'true');
	expect(onSubmit).not.toHaveBeenCalled();
});

test('onSubmit fires with the expected normalized shape', async () => {
	const onSubmit = vi.fn();
	const screen = render(CombatantForm, { mode: 'add', open: true, onSubmit });

	await userEvent.fill(screen.getByLabelText(m['forms.field.name']()), 'Ogre');
	await userEvent.fill(screen.getByLabelText(m['forms.field.maxHp']()), '40');
	await screen.getByRole('button', { name: m['forms.action.add']() }).click();

	expect(onSubmit).toHaveBeenCalledTimes(1);
	expect(onSubmit).toHaveBeenCalledWith({
		name: 'Ogre',
		type: 'enemy',
		initiativeBonus: 0,
		maxHp: 40,
		ac: 10,
		pd: 10,
		md: 10,
		note: '',
		initiative: null,
	});
});
