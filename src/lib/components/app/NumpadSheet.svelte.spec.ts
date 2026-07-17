import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import type { Combatant } from '$lib/db/types';
import { createCombatant } from '$lib/stores/domain/factories';
import NumpadSheet from './NumpadSheet.svelte';

// Digit entry -> commit action callbacks fire with the entered number; empty entry is a no-op.
function makeCombatant(): Combatant {
	return createCombatant({ name: 'Ogre', maxHp: 40 }, 0, () => 'ogre');
}

describe('NumpadSheet', () => {
	it('fires onDamage with the entered number on Deal Damage', async () => {
		const onDamage = vi.fn();
		const onRestore = vi.fn();
		const onSetTempHp = vi.fn();
		const screen = render(NumpadSheet, {
			combatant: makeCombatant(),
			open: true,
			onDamage,
			onRestore,
			onSetTempHp,
		});

		await userEvent.click(screen.getByRole('button', { name: 'Digit 5' }));
		await userEvent.click(screen.getByRole('button', { name: 'Digit 3' }));
		await userEvent.click(screen.getByRole('button', { name: 'Deal Damage' }));

		expect(onDamage).toHaveBeenCalledExactlyOnceWith('ogre', 53);
		expect(onRestore).not.toHaveBeenCalled();
		expect(onSetTempHp).not.toHaveBeenCalled();
	});

	it('fires onRestore with the entered number on Restore HP', async () => {
		const onDamage = vi.fn();
		const onRestore = vi.fn();
		const onSetTempHp = vi.fn();
		const screen = render(NumpadSheet, {
			combatant: makeCombatant(),
			open: true,
			onDamage,
			onRestore,
			onSetTempHp,
		});

		await userEvent.click(screen.getByRole('button', { name: 'Digit 7' }));
		await userEvent.click(screen.getByRole('button', { name: 'Restore HP' }));

		expect(onRestore).toHaveBeenCalledExactlyOnceWith('ogre', 7);
		expect(onDamage).not.toHaveBeenCalled();
		expect(onSetTempHp).not.toHaveBeenCalled();
	});

	it('fires onSetTempHp with the entered number on Set Temp HP', async () => {
		const onDamage = vi.fn();
		const onRestore = vi.fn();
		const onSetTempHp = vi.fn();
		const screen = render(NumpadSheet, {
			combatant: makeCombatant(),
			open: true,
			onDamage,
			onRestore,
			onSetTempHp,
		});

		await userEvent.click(screen.getByRole('button', { name: 'Digit 1' }));
		await userEvent.click(screen.getByRole('button', { name: 'Digit 0' }));
		await userEvent.click(screen.getByRole('button', { name: 'Set Temp HP' }));

		expect(onSetTempHp).toHaveBeenCalledExactlyOnceWith('ogre', 10);
		expect(onDamage).not.toHaveBeenCalled();
		expect(onRestore).not.toHaveBeenCalled();
	});

	it('is a no-op on all three commit actions when the entry is empty', async () => {
		const onDamage = vi.fn();
		const onRestore = vi.fn();
		const onSetTempHp = vi.fn();
		const screen = render(NumpadSheet, {
			combatant: makeCombatant(),
			open: true,
			onDamage,
			onRestore,
			onSetTempHp,
		});

		const dealDamage = screen.getByRole('button', { name: 'Deal Damage' });
		const restoreHp = screen.getByRole('button', { name: 'Restore HP' });
		const setTempHp = screen.getByRole('button', { name: 'Set Temp HP' });

		await expect.element(dealDamage).toBeDisabled();
		await expect.element(restoreHp).toBeDisabled();
		await expect.element(setTempHp).toBeDisabled();

		expect(onDamage).not.toHaveBeenCalled();
		expect(onRestore).not.toHaveBeenCalled();
		expect(onSetTempHp).not.toHaveBeenCalled();
	});
});
