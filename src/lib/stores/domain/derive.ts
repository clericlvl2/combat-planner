/**
 * Derived values — never stored, always computed. Pure functions over state.
 * The reactive seam wraps these in `$derived` (ADR-002); tests assert them directly.
 */
import { type Combat, type Combatant, UNROLLED } from '../../db/types';
import { clampEscalation } from './clamp';

export type HealthStatus = 'full' | 'wounded' | 'bloodied' | 'dead';

/** currentHp / maxHp (temp excluded; maxHp ≥ 1 so never divides by zero). May exceed 1. */
export const healthPercent = (c: Combatant): number => c.currentHp / c.maxHp;

/** Health band. cur ≤ 0 → dead; cur > maxHp (>100%) reads full. */
export function healthStatus(c: Combatant): HealthStatus {
	if (c.currentHp <= 0) return 'dead';
	const pct = healthPercent(c);
	if (pct >= 1) return 'full';
	if (pct >= 0.5) return 'wounded';
	return 'bloodied';
}

/** Stored escalation value, clamped 0..6. Fully decoupled from round. */
export function escalationDie(combat: Combat): number {
	return clampEscalation(combat.escalation);
}

/** Round + escalation are visible only while Active. */
export const showRoundAndEscalation = (combat: Combat): boolean => combat.state === 'active';

export const isActive = (combat: Combat, c: Combatant): boolean =>
	combat.activeCombatantId === c.id;

/**
 * Initiative order: rolled high→low, tiebreak (1) higher bonus (2) addOrder;
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

export interface NextTurn {
	id: string;
	wrapped: boolean;
}

/**
 * Next ENABLED combatant after the active one in initiative order, wrapping to the top.
 * `wrapped` = the scan passed the end of the order (→ round + escalation bump).
 * null when no combatant is enabled.
 */
export function nextEnabledTurn(combat: Combat): NextTurn | null {
	const sorted = sortedCombatants(combat);
	const n = sorted.length;
	if (n === 0) return null;
	const idx = sorted.findIndex((c) => c.id === combat.activeCombatantId);
	let wrapped = false;
	let i = idx;
	for (let step = 0; step < n; step += 1) {
		i += 1;
		if (i >= n) {
			i = 0;
			wrapped = true;
		}
		if (!sorted[i].disabled) return { id: sorted[i].id, wrapped };
	}
	return null; // all disabled
}

/**
 * canAdvance: Active, non-empty, at least one enabled combatant, and NOT the round-99 →
 * round-100 wrap. Advancing within round 99 (not yet on the last enabled combatant) still works.
 */
export function canAdvance(combat: Combat): boolean {
	if (combat.state !== 'active' || combat.combatants.length === 0) return false;
	const next = nextEnabledTurn(combat);
	if (!next) return false; // all disabled
	return !(combat.round >= 99 && next.wrapped); // r99→100 wrap block
}
