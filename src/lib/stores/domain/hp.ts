/**
 * Pure HP math + the matching read-only hpLog entry. Each helper returns a
 * NEW combatant (currentHp/tempHp/maxHp updated, log entry appended) — transitions wrap these with
 * undo. `round` is the live round, or null in Setup (rendered "—").
 *
 * `delta` records the change *applied* ("−12 damage, +5 heal; for Set temp HP the change
 * to the buffer; for Set Max HP the change to maxHp"); the resulting cur/temp/max are captured at
 * write time so the log is a faithful point-in-time record.
 */
import type { Combatant, HpLogEntry } from '../../db/types';
import { clampCurrentHp, clampMaxHp, clampTempHp } from './clamp';

function entry(
	type: HpLogEntry['type'],
	delta: number,
	c: Combatant,
	round: number | null,
): HpLogEntry {
	return { type, delta, currentHp: c.currentHp, tempHp: c.tempHp, maxHp: c.maxHp, round };
}

function withEntry(c: Combatant, e: HpLogEntry): Combatant {
	return { ...c, hpLog: [...c.hpLog, e] };
}

/** Damage drains temp first, remainder off current, floored at −maxHp. */
export function applyDamage(c: Combatant, n: number, round: number | null): Combatant {
	const absorbed = Math.min(c.tempHp, n);
	const tempHp = c.tempHp - absorbed;
	const currentHp = clampCurrentHp(c.currentHp - (n - absorbed), c.maxHp);
	const next: Combatant = { ...c, tempHp, currentHp };
	return withEntry(next, entry('damage', -n, next, round));
}

/** Heal: currentHp = min(cur + n, max(maxHp, cur)); never reduces, never touches temp. */
export function applyHeal(c: Combatant, n: number, round: number | null): Combatant {
	const currentHp = Math.min(c.currentHp + n, Math.max(c.maxHp, c.currentHp));
	const next: Combatant = { ...c, currentHp };
	return withEntry(next, entry('heal', n, next, round));
}

/** Set temp HP replaces the buffer (0 clears); current untouched. */
export function applySetTemp(c: Combatant, n: number, round: number | null): Combatant {
	const tempHp = clampTempHp(n);
	const next: Combatant = { ...c, tempHp };
	return withEntry(next, entry('setTemp', tempHp - c.tempHp, next, round));
}

/** Max HP edit: does NOT auto-change currentHp. */
export function applySetMax(c: Combatant, n: number, round: number | null): Combatant {
	const maxHp = clampMaxHp(n);
	const next: Combatant = { ...c, maxHp };
	return withEntry(next, entry('setMax', maxHp - c.maxHp, next, round));
}
