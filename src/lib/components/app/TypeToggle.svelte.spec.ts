import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { CombatantType } from '$lib/db/types';
import TypeToggle from './TypeToggle.svelte';

// The combatant-type ToggleGroup shared by CombatantForm and LibraryEntryFormDialog — single
// select over pc/ally/enemy, current value marked pressed, picks reported via bind:value.

test('renders one option per CombatantType', async () => {
	const screen = render(TypeToggle, { value: 'enemy' });

	for (const label of ['Player', 'Ally', 'Enemy']) {
		await expect.element(screen.getByRole('radio', { name: label })).toBeInTheDocument();
	}
});

test('the current value option is marked pressed (data-state=on)', async () => {
	const screen = render(TypeToggle, { value: 'ally' });

	const ally = screen.getByRole('radio', { name: 'Ally' });
	const enemy = screen.getByRole('radio', { name: 'Enemy' });
	await expect.element(ally).toHaveAttribute('data-state', 'on');
	await expect.element(enemy).toHaveAttribute('data-state', 'off');
});

test('clicking an option updates the bindable value', async () => {
	let value: CombatantType = 'enemy';
	const screen = render(TypeToggle, {
		get value() {
			return value;
		},
		set value(v) {
			value = v;
		},
	});

	await screen.getByRole('radio', { name: 'Player' }).click();

	expect(value).toBe('pc');
});
