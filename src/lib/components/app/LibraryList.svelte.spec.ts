import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render } from 'vitest-browser-svelte';
import { createCombatantTemplate } from '$lib/stores/domain/factories';
import LibraryList from './LibraryList.svelte';

// Component test: entries are name-filtered (case-insensitive) and sorted by
// name (case-insensitive) -> updatedAt desc -> id, a stable order that keeps same-name
// duplicates from swapping positions between renders.

afterEach(() => {
	cleanup();
});

function names(screen: ReturnType<typeof render>) {
	const list = screen.getByRole('list').element();
	return Array.from(list.querySelectorAll('.font-semibold'))
		.map((el) => el.textContent?.trim())
		.filter((text): text is string => Boolean(text));
}

function subtitles(screen: ReturnType<typeof render>) {
	const list = screen.getByRole('list').element();
	return Array.from(list.querySelectorAll('.text-muted-foreground'))
		.map((el) => el.textContent?.trim())
		.filter((text): text is string => Boolean(text));
}

test('renders entries sorted by name, case-insensitive', async () => {
	const goblin = createCombatantTemplate({ name: 'goblin' }, () => 'a', () => 1);
	const ancientDragon = createCombatantTemplate({ name: 'Ancient Dragon' }, () => 'b', () => 1);
	const zombie = createCombatantTemplate({ name: 'Zombie' }, () => 'c', () => 1);

	const screen = render(LibraryList, {
		entries: [zombie, goblin, ancientDragon],
		onEdit: vi.fn(),
		onDelete: vi.fn(),
	});

	expect(names(screen)).toEqual(['Ancient Dragon', 'goblin', 'Zombie']);
});

test('same-name duplicates order by updatedAt descending (stable, regardless of prop order)', async () => {
	// maxHp differs only so the two same-named rows are distinguishable by subtitle in assertions.
	const older = createCombatantTemplate(
		{ name: 'Goblin', maxHp: 7 },
		() => 'older',
		() => 100,
	);
	const newer = createCombatantTemplate(
		{ name: 'Goblin', maxHp: 9 },
		() => 'newer',
		() => 200,
	);

	// Pass in prop order [older, newer] — the component must still put newer (higher updatedAt) first.
	const screen = render(LibraryList, {
		entries: [older, newer],
		onEdit: vi.fn(),
		onDelete: vi.fn(),
	});

	expect(subtitles(screen)).toEqual(['HP 9 · AC 10 · PD 10 · MD 10', 'HP 7 · AC 10 · PD 10 · MD 10']);
});

test('when updatedAt ties, orders by id (stable tiebreaker)', async () => {
	const b = createCombatantTemplate(
		{ name: 'Goblin', maxHp: 7 },
		() => 'b-id',
		() => 100,
	);
	const a = createCombatantTemplate(
		{ name: 'Goblin', maxHp: 9 },
		() => 'a-id',
		() => 100,
	);

	const screen = render(LibraryList, {
		entries: [b, a],
		onEdit: vi.fn(),
		onDelete: vi.fn(),
	});

	expect(subtitles(screen)).toEqual(['HP 9 · AC 10 · PD 10 · MD 10', 'HP 7 · AC 10 · PD 10 · MD 10']);
});

test('filters entries by name, case-insensitively', async () => {
	const goblin = createCombatantTemplate({ name: 'Goblin' }, () => 'a', () => 1);
	const zombie = createCombatantTemplate({ name: 'Zombie' }, () => 'b', () => 1);

	const screen = render(LibraryList, {
		entries: [goblin, zombie],
		query: 'gob',
		onEdit: vi.fn(),
		onDelete: vi.fn(),
	});

	expect(names(screen)).toEqual(['Goblin']);
});
