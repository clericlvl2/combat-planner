import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { ColorTag } from '$lib/db/types';
import ColorSwatchPicker from './ColorSwatchPicker.svelte';

// ADR-012: all 8 swatches render as a single-select toggle row; picking one reports the new
// ColorTag via bind:value (onValueChange -> $bindable), and the current value is marked pressed.

test('renders all 8 swatches, one per ColorTag', async () => {
	const screen = render(ColorSwatchPicker, { value: 'neutral' });

	for (const label of ['Neutral', 'Red', 'Orange', 'Amber', 'Green', 'Teal', 'Blue', 'Violet']) {
		await expect.element(screen.getByRole('radio', { name: label })).toBeInTheDocument();
	}
});

test('the current value swatch is marked pressed (data-state=on)', async () => {
	const screen = render(ColorSwatchPicker, { value: 'teal' });

	const teal = screen.getByRole('radio', { name: 'Teal' });
	const red = screen.getByRole('radio', { name: 'Red' });
	await expect.element(teal).toHaveAttribute('data-state', 'on');
	await expect.element(red).toHaveAttribute('data-state', 'off');
});

test('clicking a swatch updates the bindable value', async () => {
	let value: ColorTag = 'neutral';
	const screen = render(ColorSwatchPicker, {
		get value() {
			return value;
		},
		set value(v) {
			value = v;
		},
	});

	await screen.getByRole('radio', { name: 'Amber' }).click();

	expect(value).toBe('amber');
});
