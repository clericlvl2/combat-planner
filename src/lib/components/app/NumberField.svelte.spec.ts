import { afterEach, expect, test } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import { m } from '$lib/i18n';
import NumberField from './NumberField.svelte';

// Component test for the B-013 fix: the digit-cap applied to typed entry must not make an
// overflowing pasted/programmatic value unreachable by commit-time clamp().
afterEach(() => {
	cleanup();
});

test('paste bypasses the digit cap so an over-cap value still reaches clamp on commit', async () => {
	const screen = render(NumberField, {
		id: 'test-field',
		label: 'Test Field',
		value: null,
		min: -9,
		max: 99,
	});

	const input = screen.getByLabelText('Test Field').element() as HTMLInputElement;

	// Simulate a real OS paste: a synthetic 'paste' ClipboardEvent carrying a 5-digit value, which
	// is well over the field's digitCap (2, from max=99) and out of its -9..99 range.
	const dataTransfer = new DataTransfer();
	dataTransfer.setData('text', '12345');
	input.dispatchEvent(
		new ClipboardEvent('paste', { clipboardData: dataTransfer, bubbles: true, cancelable: true }),
	);

	// The paste handler must not truncate the pasted value down to the digit cap.
	expect(input.value).toBe('12345');

	// Commit fires on blur/change — clamp() should snap the overflowing value into range.
	input.dispatchEvent(new Event('change', { bubbles: true }));

	await expect.element(input).toHaveValue('99');
	await expect.element(screen.getByText(m['errors.clamp']({ min: -9, max: 99 }))).toBeVisible();
});

test('getByLabelText(fieldLabel) resolves to the value input alone, not the stepper buttons', async () => {
	const screen = render(NumberField, {
		id: 'test-field-2',
		label: 'Another Field',
		value: 5,
		min: 0,
		max: 10,
	});

	const labeled = screen.getByLabelText('Another Field');
	await expect.element(labeled).toBeVisible();

	const el = labeled.element();
	expect(el.tagName).toBe('INPUT');
});
