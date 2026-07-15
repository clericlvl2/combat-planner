import { describe, expect, it } from 'vitest';
import type { Combat, Combatant } from '../../db/types';
import {
	canAdvance,
	escalationDie,
	healthPercent,
	healthStatus,
	showRoundAndEscalation,
	sortedCombatants,
} from './derive';
import { createCombat, createCombatant } from './factories';

let seq = 0;
const id = () => `c${seq++}`;

function combatant(over: Partial<Combatant>, addOrder: number): Combatant {
	return { ...createCombatant({ name: 'X', maxHp: 100 }, addOrder, id), ...over };
}

function combat(combatants: Combatant[], over: Partial<Combat> = {}): Combat {
	return { ...createCombat({}, 0, id), combatants, ...over };
}

describe('sortedCombatants (INI-4)', () => {
	it('orders rolled high→low, tiebreak by bonus then addOrder; "-" at bottom by addOrder', () => {
		const a = combatant({ initiative: 20, initiativeBonus: 1 }, 0);
		const b = combatant({ initiative: 20, initiativeBonus: 3 }, 1); // tie → higher bonus first
		const c = combatant({ initiative: 25 }, 2);
		const d = combatant({ initiative: '-' }, 3); // unrolled → bottom
		const e = combatant({ initiative: '-' }, 4);
		const order = sortedCombatants(combat([a, b, c, d, e])).map((x) => x.id);
		expect(order).toEqual([c.id, b.id, a.id, d.id, e.id]);
	});

	it('breaks an exact tie (same init + bonus) by addOrder', () => {
		const a = combatant({ initiative: 15, initiativeBonus: 0 }, 5);
		const b = combatant({ initiative: 15, initiativeBonus: 0 }, 2);
		expect(sortedCombatants(combat([a, b])).map((x) => x.id)).toEqual([b.id, a.id]);
	});
});

describe('escalationDie (TRE-6)', () => {
	it('reads the stored value, clamped 0..6, independent of round', () => {
		expect(escalationDie(combat([], { round: 1, escalation: 0 }))).toBe(0);
		expect(escalationDie(combat([], { round: 20, escalation: 3 }))).toBe(3);
		expect(escalationDie(combat([], { round: 1, escalation: 6 }))).toBe(6);
	});

	it('clamps an out-of-range stored value', () => {
		expect(escalationDie(combat([], { escalation: 9 }))).toBe(6);
		expect(escalationDie(combat([], { escalation: -3 }))).toBe(0);
	});
});

describe('healthStatus (HP-4)', () => {
	const c = (cur: number, max = 100) => combatant({ currentHp: cur, maxHp: max }, 0);
	it('bands full / wounded / bloodied / dead', () => {
		expect(healthStatus(c(100))).toBe('full');
		expect(healthStatus(c(50))).toBe('wounded');
		expect(healthStatus(c(99))).toBe('wounded');
		expect(healthStatus(c(49))).toBe('bloodied');
		expect(healthStatus(c(1))).toBe('bloodied');
		expect(healthStatus(c(0))).toBe('dead');
		expect(healthStatus(c(-30))).toBe('dead');
	});

	it('currentHp > maxHp (>100%) reads full', () => {
		expect(healthStatus(c(150, 100))).toBe('full');
		expect(healthPercent(c(150, 100))).toBeCloseTo(1.5);
	});
});

describe('showRoundAndEscalation / canAdvance (TRE-5, TRE-3)', () => {
	it('round + escalation visible only while Active', () => {
		expect(showRoundAndEscalation(combat([], { state: 'setup' }))).toBe(false);
		expect(showRoundAndEscalation(combat([], { state: 'active' }))).toBe(true);
	});

	it('canAdvance: false in setup / empty; true while active', () => {
		const a = combatant({ initiative: 10 }, 0);
		expect(canAdvance(combat([a], { state: 'setup' }))).toBe(false);
		expect(canAdvance(combat([], { state: 'active' }))).toBe(false);
		expect(canAdvance(combat([a], { state: 'active', activeCombatantId: a.id }))).toBe(true);
	});

	it('blocks ONLY the round-99 → 100 wrap; advancing within round 99 still works', () => {
		const a = combatant({ initiative: 20 }, 0);
		const b = combatant({ initiative: 10 }, 1);
		// active on the last in order at round 99 → blocked (would wrap to 100)
		const onLast = combat([a, b], { state: 'active', round: 99, activeCombatantId: b.id });
		expect(canAdvance(onLast)).toBe(false);
		// active on the first at round 99 → still advances within the round
		const withinR99 = combat([a, b], { state: 'active', round: 99, activeCombatantId: a.id });
		expect(canAdvance(withinR99)).toBe(true);
	});
});
