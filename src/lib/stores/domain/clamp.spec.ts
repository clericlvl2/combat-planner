import { describe, expect, it } from 'vitest';
import {
	clamp,
	clampCurrentHp,
	clampDescription,
	clampEscalation,
	clampInitiative,
	clampMaxHp,
	clampName,
	clampNote,
	clampRound,
	clampTempHp,
	clampTitle,
} from './clamp';

// Numeric ranges — every committed value forced into range.
describe('clamp helpers', () => {
	it('clamps to inclusive bounds and rounds', () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(-3, 0, 10)).toBe(0);
		expect(clamp(99, 0, 10)).toBe(10);
		expect(clamp(2.6, 0, 10)).toBe(3);
	});

	it('falls back to min on non-finite input', () => {
		expect(clamp(Number.NaN, 1, 9)).toBe(1);
		expect(clamp(Number.POSITIVE_INFINITY, 1, 9)).toBe(9);
	});

	it('pins the field ranges', () => {
		expect(clampMaxHp(0)).toBe(1);
		expect(clampMaxHp(9999)).toBe(999);
		expect(clampInitiative(-500)).toBe(-9);
		expect(clampInitiative(5000)).toBe(99);
		expect(clampTempHp(-5)).toBe(0);
		expect(clampRound(0)).toBe(1);
		expect(clampRound(150)).toBe(99);
		expect(clampEscalation(9)).toBe(6);
	});

	it('floors current HP at −maxHp and caps at 999', () => {
		expect(clampCurrentHp(-50, 30)).toBe(-30);
		expect(clampCurrentHp(-10, 30)).toBe(-10);
		expect(clampCurrentHp(5000, 30)).toBe(999);
	});

	it('truncates a note to 250 chars', () => {
		expect(clampNote('x'.repeat(300))).toHaveLength(250);
		expect(clampNote('short')).toBe('short');
	});

	it('truncates a title to 60 chars', () => {
		expect(clampTitle('x'.repeat(100))).toHaveLength(60);
		expect(clampTitle('short')).toBe('short');
	});

	it('truncates a name to 40 chars', () => {
		expect(clampName('x'.repeat(100))).toHaveLength(40);
		expect(clampName('short')).toBe('short');
	});

	it('truncates a description to 200 chars', () => {
		expect(clampDescription('x'.repeat(300))).toHaveLength(200);
		expect(clampDescription('short')).toBe('short');
	});
});
