import { Swords } from '@lucide/svelte';
import { createRawSnippet } from 'svelte';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import EmptyState from './EmptyState.svelte';

// component-inventory.md: shared "No combats yet" (combats.empty.*) / empty-roster leaf —
// optional icon, title, optional description, and a CTA slot rendered as-is (no CTA logic here).

test('renders title and, when given, description', async () => {
	const screen = render(EmptyState, { title: 'No combats yet', description: 'Add one to begin' });

	await expect.element(screen.getByText('No combats yet')).toBeInTheDocument();
	await expect.element(screen.getByText('Add one to begin')).toBeInTheDocument();
});

test('omits description when not given', async () => {
	const screen = render(EmptyState, { title: 'No combats yet' });

	expect(screen.container.textContent).not.toContain('Add one');
});

test('renders the optional icon', async () => {
	const screen = render(EmptyState, { title: 'No combats yet', icon: Swords });

	expect(screen.container.querySelector('svg')).not.toBeNull();
});

test('renders CTA slot content passed as children', async () => {
	const cta = createRawSnippet(() => ({
		render: () => '<button>Create your first combat</button>',
	}));
	const screen = render(EmptyState, { title: 'No combats yet', children: cta });

	await expect
		.element(screen.getByRole('button', { name: 'Create your first combat' }))
		.toBeInTheDocument();
});
