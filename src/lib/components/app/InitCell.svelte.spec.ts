import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Combatant } from '$lib/db/types';
import { createCombatant } from '$lib/stores/domain/factories';
import InitCell, { LONG_PRESS_MS } from './InitCell.svelte';

// INI-2: tap fires onRoll; long-press opens manual entry and Save fires onSetInitiative with the
// typed value; the cell is non-interactive (disabled trigger) when editable is false.
function makeCombatant(): Combatant {
	return createCombatant({ name: 'Ogre', maxHp: 40 }, 0, () => 'ogre');
}

describe('InitCell (INI-2)', () => {
	it('tapping the trigger fires onRoll with the combatant id', async () => {
		const onRoll = vi.fn();
		const onSetInitiative = vi.fn();
		const screen = render(InitCell, {
			combatant: makeCombatant(),
			onRoll,
			onSetInitiative,
		});

		await userEvent.click(screen.getByRole('button', { name: 'Roll initiative for Ogre' }));

		expect(onRoll).toHaveBeenCalledExactlyOnceWith('ogre');
		expect(onSetInitiative).not.toHaveBeenCalled();
	});

	it('long-pressing opens manual entry, and Save fires onSetInitiative with the typed value', async () => {
		const onRoll = vi.fn();
		const onSetInitiative = vi.fn();
		const screen = render(InitCell, {
			combatant: makeCombatant(),
			onRoll,
			onSetInitiative,
		});

		const trigger = screen.getByRole('button', { name: 'Roll initiative for Ogre' });
		trigger.element().dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		await new Promise((resolve) => setTimeout(resolve, LONG_PRESS_MS + 100));

		const entry = screen.getByLabelText('Initiative', { exact: true });
		await expect.element(entry).toBeVisible();

		await userEvent.fill(entry, '15');
		await userEvent.click(screen.getByRole('button', { name: 'Save' }));

		expect(onSetInitiative).toHaveBeenCalledExactlyOnceWith('ogre', 15);
		expect(onRoll).not.toHaveBeenCalled();
	});

	it('is non-interactive when editable is false', async () => {
		const onRoll = vi.fn();
		const onSetInitiative = vi.fn();
		const screen = render(InitCell, {
			combatant: makeCombatant(),
			onRoll,
			onSetInitiative,
			editable: false,
		});

		const trigger = screen.getByRole('button', { name: 'Roll initiative for Ogre' });
		await expect.element(trigger).toBeDisabled();

		expect(onRoll).not.toHaveBeenCalled();
		expect(onSetInitiative).not.toHaveBeenCalled();
	});
});
