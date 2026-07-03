import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ColorTagDot from './ColorTagDot.svelte';

// ADR-012: one of the 8 token-driven bg-combat-* swatches renders per colorTag, with an a11y
// label naming the swatch (status is never color-alone).

test('renders the bg-combat-* utility matching colorTag, with a naming a11y label', async () => {
	const screen = render(ColorTagDot, { colorTag: 'violet' });

	const dot = screen.getByRole('img').element() as HTMLElement;
	expect(dot.className).toContain('bg-combat-violet');
	expect(dot.getAttribute('aria-label')).toBe('Color tag: Violet');
});

test('renders the neutral (default) swatch', async () => {
	const screen = render(ColorTagDot, { colorTag: 'neutral' });

	const dot = screen.getByRole('img').element() as HTMLElement;
	expect(dot.className).toContain('bg-combat-neutral');
	expect(dot.getAttribute('aria-label')).toBe('Color tag: Neutral');
});
