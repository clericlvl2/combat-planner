import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import { createCombat } from '$lib/stores/domain/factories';
import CombatList from './CombatList.svelte';

// Component test for CLS-6: rows render sorted by listOrder, and a finalize (drop) event hands
// the new id order to reorderCombats so it persists (order survives reload).

afterEach(() => {
	cleanup();
});

function fixtureCombats() {
	const first = createCombat({ title: 'First' }, 0, () => 'a');
	const second = createCombat({ title: 'Second' }, 1, () => 'b');
	const third = createCombat({ title: 'Third' }, 2, () => 'c');
	return [first, second, third];
}

test('renders rows sorted by listOrder', async () => {
	const [first, second, third] = fixtureCombats();
	// Pass them in out of order — the component must sort by listOrder, not prop order.
	const screen = render(CombatList, {
		combats: [third, first, second],
		onOpen: vi.fn(),
		onEdit: vi.fn(),
		onDelete: vi.fn(),
		reorderCombats: vi.fn(),
	});

	const list = screen.getByRole('list').element();
	const titles = Array.from(list.querySelectorAll('.font-medium'))
		.map((el) => el.textContent?.trim())
		.filter((text): text is string => Boolean(text));

	expect(titles).toEqual(['First', 'Second', 'Third']);
});

test('a finalize event calls reorderCombats with the new id order', async () => {
	const [first, second, third] = fixtureCombats();
	const reorderCombats = vi.fn();
	const screen = render(CombatList, {
		combats: [first, second, third],
		onOpen: vi.fn(),
		onEdit: vi.fn(),
		onDelete: vi.fn(),
		reorderCombats,
	});

	const list = screen.getByRole('list').element();
	list.dispatchEvent(
		new CustomEvent('finalize', {
			detail: {
				items: [second, third, first],
				info: { trigger: 'droppedIntoZone', id: first.id, source: 'pointer' },
			},
		}),
	);

	expect(reorderCombats).toHaveBeenCalledExactlyOnceWith([second.id, third.id, first.id]);
});
