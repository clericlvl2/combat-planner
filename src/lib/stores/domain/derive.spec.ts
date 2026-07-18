import { describe, expect, it } from 'vitest';
import type { Combat, Combatant } from '../../db/types';
import {
	canAdvance,
	escalationDie,
	healthPercent,
	healthStatus,
	nextEnabledTurn,
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

describe('sortedCombatants', () => {
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

describe('escalationDie', () => {
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

describe('healthStatus', () => {
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

describe('showRoundAndEscalation / canAdvance', () => {
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

describe('nextEnabledTurn', () => {
	it('returns the plain next combatant, unwrapped, when it is enabled', () => {
		const a = combatant({ initiative: 20 }, 0);
		const b = combatant({ initiative: 10 }, 1);
		const next = nextEnabledTurn(combat([a, b], { activeCombatantId: a.id }));
		expect(next).toEqual({ id: b.id, wrapped: false });
	});

	it('skips disabled combatants and reports wrapped when it passes the end', () => {
		const a = combatant({ initiative: 20 }, 0);
		const b = combatant({ initiative: 15, disabled: true }, 1);
		const c = combatant({ initiative: 10 }, 2);
		const next = nextEnabledTurn(combat([a, b, c], { activeCombatantId: a.id }));
		expect(next).toEqual({ id: c.id, wrapped: false });

		const wrapped = nextEnabledTurn(combat([a, b, c], { activeCombatantId: c.id }));
		expect(wrapped).toEqual({ id: a.id, wrapped: true });
	});

	it('returns null when every combatant is disabled', () => {
		const a = combatant({ initiative: 20, disabled: true }, 0);
		const b = combatant({ initiative: 10, disabled: true }, 1);
		expect(nextEnabledTurn(combat([a, b], { activeCombatantId: a.id }))).toBeNull();
	});
});

describe('canAdvance — disabled interplay', () => {
	it('false when zero combatants are enabled', () => {
		const a = combatant({ initiative: 20, disabled: true }, 0);
		const b = combatant({ initiative: 10, disabled: true }, 1);
		expect(canAdvance(combat([a, b], { state: 'active', activeCombatantId: a.id }))).toBe(false);
	});

	it('true when a disabled combatant must be skipped to reach the next enabled one', () => {
		const a = combatant({ initiative: 20 }, 0);
		const b = combatant({ initiative: 15, disabled: true }, 1);
		const c = combatant({ initiative: 10 }, 2);
		expect(canAdvance(combat([a, b, c], { state: 'active', activeCombatantId: a.id }))).toBe(true);
	});

	it('the round-99 wrap block still holds when a wrap is reached by skipping disabled', () => {
		const a = combatant({ initiative: 20, disabled: true }, 0);
		const b = combatant({ initiative: 10 }, 1);
		// a is disabled, so the only enabled next-turn candidate is b wrapping back to itself.
		const r99 = combat([a, b], { state: 'active', round: 99, activeCombatantId: b.id });
		expect(canAdvance(r99)).toBe(false);
	});
});
