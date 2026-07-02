/**
 * Numeric clamps (Rules §7). Every committed value is forced into range — validation is
 * forgiving to keep live play fast (Rules §7 "clamp to their range on commit").
 */
import { NOTE_MAX_LENGTH, RANGES } from './constants';

/** Clamp to an inclusive [min, max]; NaN falls back to min, ±Infinity to the nearer bound. */
export function clamp(value: number, min: number, max: number): number {
	if (Number.isNaN(value)) return min;
	return Math.min(max, Math.max(min, Math.round(value)));
}

export const clampInitiativeBonus = (v: number): number =>
	clamp(v, RANGES.initiativeBonus.min, RANGES.initiativeBonus.max);

export const clampInitiative = (v: number): number =>
	clamp(v, RANGES.initiative.min, RANGES.initiative.max);

export const clampAc = (v: number): number => clamp(v, RANGES.ac.min, RANGES.ac.max);
export const clampPd = (v: number): number => clamp(v, RANGES.pd.min, RANGES.pd.max);
export const clampMd = (v: number): number => clamp(v, RANGES.md.min, RANGES.md.max);

export const clampMaxHp = (v: number): number => clamp(v, RANGES.maxHp.min, RANGES.maxHp.max);

/** Current HP floored at −maxHp (Rules §4), capped at the §7 max. */
export const clampCurrentHp = (v: number, maxHp: number): number =>
	clamp(v, -maxHp, RANGES.currentHp.max);

export const clampTempHp = (v: number): number => clamp(v, RANGES.tempHp.min, RANGES.tempHp.max);

export const clampRound = (v: number): number => clamp(v, RANGES.round.min, RANGES.round.max);

export const clampEscalation = (v: number): number =>
	clamp(v, RANGES.escalation.min, RANGES.escalation.max);

/** Notes are hard-capped during input (Rules §7); no rounding, just truncate. */
export const clampNote = (note: string): string =>
	note.length > NOTE_MAX_LENGTH ? note.slice(0, NOTE_MAX_LENGTH) : note;
