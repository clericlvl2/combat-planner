import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import TagChip from './TagChip.svelte';

// The ✕ is always visible when removable; keyboard activation removes immediately, a pointer
// press shorter than the 600ms hold does nothing, and a completed hold calls onRemove.

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

test('renders the tag name, no ✕ when not removable', async () => {
	const screen = render(TagChip, { name: 'Boss' });

	await expect.element(screen.getByText('Boss')).toBeVisible();
	expect(screen.getByRole('button', { name: 'Remove tag Boss' }).query()).toBeNull();
});

test('removable chip always shows a trailing ✕ button', async () => {
	const screen = render(TagChip, { name: 'Boss', removable: true, onRemove: vi.fn() });

	await expect.element(screen.getByRole('button', { name: 'Remove tag Boss' })).toBeVisible();
});

test('keyboard activation of the ✕ (click with detail 0) removes immediately', async () => {
	const onRemove = vi.fn();
	const screen = render(TagChip, { name: 'Boss', removable: true, onRemove });

	const closeButton = screen.getByRole('button', { name: 'Remove tag Boss' }).element();
	closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));

	expect(onRemove).toHaveBeenCalledExactlyOnceWith('Boss');
});

test('a plain mouse click on the ✕ (detail 1) does not remove', async () => {
	const onRemove = vi.fn();
	const screen = render(TagChip, { name: 'Boss', removable: true, onRemove });

	const closeButton = screen.getByRole('button', { name: 'Remove tag Boss' }).element();
	closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));

	expect(onRemove).not.toHaveBeenCalled();
});

test('a pointer hold shorter than 600ms does not remove', async () => {
	vi.useFakeTimers();
	const onRemove = vi.fn();
	const screen = render(TagChip, { name: 'Boss', removable: true, onRemove });

	const chip = screen.getByText('Boss').element().closest('[data-slot="badge"]') as HTMLElement;
	chip.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
	vi.advanceTimersByTime(400);
	chip.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
	vi.advanceTimersByTime(600);

	expect(onRemove).not.toHaveBeenCalled();
});

test('a completed 600ms hold calls onRemove', async () => {
	vi.useFakeTimers();
	const onRemove = vi.fn();
	const screen = render(TagChip, { name: 'Boss', removable: true, onRemove });

	const chip = screen.getByText('Boss').element().closest('[data-slot="badge"]') as HTMLElement;
	chip.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
	vi.advanceTimersByTime(600);

	expect(onRemove).toHaveBeenCalledExactlyOnceWith('Boss');
});

test('pointerleave before the hold completes cancels it', async () => {
	vi.useFakeTimers();
	const onRemove = vi.fn();
	const screen = render(TagChip, { name: 'Boss', removable: true, onRemove });

	const chip = screen.getByText('Boss').element().closest('[data-slot="badge"]') as HTMLElement;
	chip.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
	vi.advanceTimersByTime(400);
	chip.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
	vi.advanceTimersByTime(600);

	expect(onRemove).not.toHaveBeenCalled();
});
