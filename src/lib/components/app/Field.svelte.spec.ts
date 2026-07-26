import { createRawSnippet } from 'svelte';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Field from './Field.svelte';

// The one true form-field wrapper — asserts the label/control pairing, the `form-field-group`
// class, and that `for` is optional (group labels with no single input to point at).

const childrenSnippet = createRawSnippet(() => ({
	render: () => '<input id="f-name" />',
}));

test('renders the label text and the control', async () => {
	const screen = render(Field, { label: 'Name', children: childrenSnippet });

	await expect.element(screen.getByText('Name')).toBeVisible();
	expect(document.querySelector('#f-name')).not.toBeNull();
});

test('wraps in a form-field-group container', async () => {
	render(Field, { label: 'Name', children: childrenSnippet });

	expect(document.querySelector('.form-field-group')).not.toBeNull();
});

test('associates the label with the control via `for` when passed', async () => {
	const screen = render(Field, { label: 'Name', for: 'f-name', children: childrenSnippet });

	await expect.element(screen.getByLabelText('Name')).toBeInTheDocument();
});

test('renders without a `for` attribute when omitted (group label)', async () => {
	render(Field, { label: 'Type', children: childrenSnippet });

	const label = document.querySelector('label');
	expect(label?.hasAttribute('for')).toBe(false);
});
