import { describe, expect, it } from 'vitest';
import { MAX_LIBRARY_ENTRIES } from '../../db/types';
import { createCombatantTemplate } from './factories';
import {
	addTemplateToList,
	allTagNames,
	editTemplateInList,
	normalizeTagName,
	removeTemplateFromList,
	templateInputFromCombatant,
	toggleTemplateTag,
} from './library';

let seq = 0;
const id = () => `k${seq++}`;

describe('addTemplateToList', () => {
	it('appends a new template with defaults + injected id/timestamp', () => {
		const { list, created } = addTemplateToList([], { name: 'Goblin' }, id, () => 1000);
		expect(created).not.toBeNull();
		expect(list).toEqual([created]);
		expect(created?.name).toBe('Goblin');
		expect(created?.tags).toEqual([]);
		expect(created?.createdAt).toBe(1000);
		expect(created?.updatedAt).toBe(1000);
	});

	it('allows the 999th → 1000th entry (at the cap boundary)', () => {
		const full = Array.from({ length: MAX_LIBRARY_ENTRIES - 1 }, (_, i) =>
			createCombatantTemplate({ name: `t${i}` }, () => `t${i}`),
		);
		const { list, created } = addTemplateToList(full, { name: 'Last' }, id);
		expect(created).not.toBeNull();
		expect(list).toHaveLength(MAX_LIBRARY_ENTRIES);
	});

	it('blocks creation at the 1000-entry cap', () => {
		const full = Array.from({ length: MAX_LIBRARY_ENTRIES }, (_, i) =>
			createCombatantTemplate({ name: `t${i}` }, () => `t${i}`),
		);
		const { list, created } = addTemplateToList(full, { name: 'Overflow' }, id);
		expect(created).toBeNull();
		expect(list).toBe(full);
	});
});

describe('editTemplateInList', () => {
	it('patches fields and re-clamps changed numerics, bumping updatedAt', () => {
		const original = createCombatantTemplate(
			{ name: 'Orc', maxHp: 20 },
			() => 'a',
			() => 1,
		);
		const out = editTemplateInList(
			[original],
			'a',
			{ maxHp: 9999, note: 'x'.repeat(1000) },
			() => 2,
		);
		const edited = out.find((t) => t.id === 'a');
		expect(edited?.maxHp).toBeLessThan(9999);
		expect(edited?.note.length).toBeLessThan(1000);
		expect(edited?.updatedAt).toBe(2);
	});

	it('leaves unpatched fields untouched', () => {
		const original = createCombatantTemplate({ name: 'Keep', ac: 15 }, () => 'a');
		const out = editTemplateInList([original], 'a', { pd: 12 });
		const edited = out.find((t) => t.id === 'a');
		expect(edited?.name).toBe('Keep');
		expect(edited?.ac).toBe(15);
		expect(edited?.pd).toBe(12);
	});

	it('is a no-op for an unknown id', () => {
		const list = [createCombatantTemplate({ name: 'A' }, () => 'a')];
		const out = editTemplateInList(list, 'missing', { name: 'B' });
		expect(out).toBe(list);
	});
});

describe('removeTemplateFromList', () => {
	it('removes by id', () => {
		const a = createCombatantTemplate({ name: 'A' }, () => 'a');
		const b = createCombatantTemplate({ name: 'B' }, () => 'b');
		expect(removeTemplateFromList([a, b], 'a')).toEqual([b]);
	});
});

describe('templateInputFromCombatant', () => {
	it('maps field values and starts untagged, omitting combat-instance fields', () => {
		const combatant = {
			id: 'c1',
			name: 'Ogre',
			type: 'enemy' as const,
			addOrder: 0,
			initiative: '-' as const,
			initiativeBonus: 3,
			maxHp: 40,
			currentHp: 10,
			tempHp: 5,
			ac: 16,
			pd: 12,
			md: 10,
			note: 'Big',
			conditions: ['dazed' as const],
			hpLog: [],
			disabled: true,
		};
		const input = templateInputFromCombatant(combatant);
		expect(input).toEqual({
			name: 'Ogre',
			type: 'enemy',
			initiativeBonus: 3,
			maxHp: 40,
			ac: 16,
			pd: 12,
			md: 10,
			note: 'Big',
			tags: [],
		});
	});
});

describe('normalizeTagName', () => {
	it('trims and returns null for empty input', () => {
		expect(normalizeTagName('   ', [])).toBeNull();
	});

	it('clamps to TAG_NAME_MAX_LENGTH', () => {
		const out = normalizeTagName('x'.repeat(50), []);
		expect(out?.length).toBe(30);
	});

	it('case-insensitively reuses existing casing on a match', () => {
		expect(normalizeTagName('undead', ['Undead'])).toBe('Undead');
		expect(normalizeTagName('UNDEAD', ['Undead'])).toBe('Undead');
	});

	it('returns the clamped/trimmed form when no existing tag matches', () => {
		expect(normalizeTagName('  Boss  ', ['Undead'])).toBe('Boss');
	});
});

describe('toggleTemplateTag', () => {
	it('adds a tag not yet present, bumping updatedAt', () => {
		const t = createCombatantTemplate(
			{ name: 'A' },
			() => 'a',
			() => 1,
		);
		const out = toggleTemplateTag([t], 'a', 'Undead', () => 2);
		expect(out[0].tags).toEqual(['Undead']);
		expect(out[0].updatedAt).toBe(2);
	});

	it('removes a tag already present, case-insensitively', () => {
		const t = { ...createCombatantTemplate({ name: 'A' }, () => 'a'), tags: ['Undead'] };
		const out = toggleTemplateTag([t], 'a', 'undead', () => 5);
		expect(out[0].tags).toEqual([]);
		expect(out[0].updatedAt).toBe(5);
	});

	it('reuses existing casing from elsewhere in the list when adding', () => {
		const a = { ...createCombatantTemplate({ name: 'A' }, () => 'a'), tags: ['Undead'] };
		const b = createCombatantTemplate({ name: 'B' }, () => 'b');
		const out = toggleTemplateTag([a, b], 'b', 'UNDEAD');
		expect(out.find((t) => t.id === 'b')?.tags).toEqual(['Undead']);
	});

	it('is a no-op for an unknown id', () => {
		const list = [createCombatantTemplate({ name: 'A' }, () => 'a')];
		const out = toggleTemplateTag(list, 'missing', 'Undead');
		expect(out).toBe(list);
	});
});

describe('allTagNames', () => {
	it('dedupes case-insensitively and sorts alphabetically (case-insensitive)', () => {
		const a = { ...createCombatantTemplate({ name: 'A' }, () => 'a'), tags: ['zeta', 'Undead'] };
		const b = { ...createCombatantTemplate({ name: 'B' }, () => 'b'), tags: ['undead', 'Alpha'] };
		expect(allTagNames([a, b])).toEqual(['Alpha', 'Undead', 'zeta']);
	});

	it('returns an empty array for an empty list', () => {
		expect(allTagNames([])).toEqual([]);
	});
});
