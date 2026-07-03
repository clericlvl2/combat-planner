import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ConditionPicker from './ConditionPicker.svelte';

// CND-2: toggling a preset condition on fires onAdd, toggling an applied one off fires onRemove,
// and applied chips render distinctly (data-state) from unapplied presets (ADR-009 component layer).

test('toggling an unapplied preset fires onAdd with that condition', async () => {
	const onAdd = vi.fn();
	const onRemove = vi.fn();
	const screen = render(ConditionPicker, {
		open: true,
		conditions: [],
		name: 'Ogre',
		onAdd,
		onRemove,
	});

	const charmed = screen.getByRole('button', { name: 'Toggle Charmed on Ogre' });
	await charmed.click();

	expect(onAdd).toHaveBeenCalledExactlyOnceWith('charmed');
	expect(onRemove).not.toHaveBeenCalled();
});

test('toggling an applied preset off fires onRemove with that condition', async () => {
	const onAdd = vi.fn();
	const onRemove = vi.fn();
	const screen = render(ConditionPicker, {
		open: true,
		conditions: ['charmed'],
		name: 'Ogre',
		onAdd,
		onRemove,
	});

	const charmed = screen.getByRole('button', { name: 'Toggle Charmed on Ogre' });
	await charmed.click();

	expect(onRemove).toHaveBeenCalledExactlyOnceWith('charmed');
	expect(onAdd).not.toHaveBeenCalled();
});

test('applied chips render distinctly (pressed) from unapplied presets', async () => {
	const screen = render(ConditionPicker, {
		open: true,
		conditions: ['charmed'],
		name: 'Ogre',
		onAdd: vi.fn(),
		onRemove: vi.fn(),
	});

	const charmed = screen.getByRole('button', { name: 'Toggle Charmed on Ogre' });
	const confused = screen.getByRole('button', { name: 'Toggle Confused on Ogre' });

	await expect.element(charmed).toHaveAttribute('data-state', 'on');
	await expect.element(charmed).toHaveAttribute('aria-pressed', 'true');
	await expect.element(confused).toHaveAttribute('data-state', 'off');
	await expect.element(confused).toHaveAttribute('aria-pressed', 'false');
});
