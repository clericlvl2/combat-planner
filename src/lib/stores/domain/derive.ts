/**
 * Derived values (see TRE-5, HP-4) — never stored, always computed. Pure functions over state.
 * The reactive seam wraps these in `$derived` (ADR-002); tests assert them directly (see
 * specs/reference/acceptance-matrix.md).
 */
import { type Combat, type Combatant, UNROLLED } from '../../db/types';
import { clampEscalation } from './clamp';

export type HealthStatus = 'full' | 'wounded' | 'bloodied' | 'dead';

/** currentHp / maxHp (temp excluded; maxHp ≥ 1 so never divides by zero). May exceed 1. */
export const healthPercent = (c: Combatant): number => c.currentHp / c.maxHp;

/** Health band (HP-4). cur ≤ 0 → dead; cur > maxHp (>100%) reads full. */
export function healthStatus(c: Combatant): HealthStatus {
	if (c.currentHp <= 0) return 'dead';
	const pct = healthPercent(c);
	if (pct >= 1) return 'full';
	if (pct >= 0.5) return 'wounded';
	return 'bloodied';
}

/** Stored escalation value (TRE-6), clamped 0..6. Fully decoupled from round. */
export function escalationDie(combat: Combat): number {
	return clampEscalation(combat.escalation);
}

/** Round + escalation are visible only while Active (TRE-5). */
export const showRoundAndEscalation = (combat: Combat): boolean => combat.state === 'active';

export const isActive = (combat: Combat, c: Combatant): boolean =>
	combat.activeCombatantId === c.id;

/**
 * Initiative order (INI-4): rolled high→low, tiebreak (1) higher bonus (2) addOrder;
 * unrolled ("-") always at the bottom in addOrder. Pure, stable.
 */
export function sortedCombatants(combat: Combat): Combatant[] {
	const rolled: Combatant[] = [];
	const unrolled: Combatant[] = [];
	for (const c of combat.combatants) {
		(c.initiative === UNROLLED ? unrolled : rolled).push(c);
	}
	rolled.sort((a, b) => {
		if (a.initiative !== b.initiative) return (b.initiative as number) - (a.initiative as number);
		if (a.initiativeBonus !== b.initiativeBonus) return b.initiativeBonus - a.initiativeBonus;
		return a.addOrder - b.addOrder;
	});
	unrolled.sort((a, b) => a.addOrder - b.addOrder);
	return [...rolled, ...unrolled];
}

/**
 * canAdvance (TRE-3): Active, non-empty, and NOT the round-99 → round-100 wrap. Advancing
 * within round 99 (not yet on the last combatant) still works.
 */
export function canAdvance(combat: Combat): boolean {
	if (combat.state !== 'active' || combat.combatants.length === 0) return false;
	const sorted = sortedCombatants(combat);
	const idx = sorted.findIndex((c) => c.id === combat.activeCombatantId);
	const onLast = idx === sorted.length - 1;
	return !(combat.round >= 99 && onLast);
}
