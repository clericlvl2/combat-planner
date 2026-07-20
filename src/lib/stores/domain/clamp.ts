/**
 * Numeric clamps. Every committed value is forced into range —
 * validation is forgiving to keep live play fast ("clamp to their range on commit").
 */
import {
	DESCRIPTION_MAX_LENGTH,
	NAME_MAX_LENGTH,
	NOTE_MAX_LENGTH,
	RANGES,
	TITLE_MAX_LENGTH,
} from './constants';

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

/** Current HP floored at −maxHp, capped at the max. */
export const clampCurrentHp = (v: number, maxHp: number): number =>
	clamp(v, -maxHp, RANGES.currentHp.max);

export const clampTempHp = (v: number): number => clamp(v, RANGES.tempHp.min, RANGES.tempHp.max);

export const clampRound = (v: number): number => clamp(v, RANGES.round.min, RANGES.round.max);

export const clampEscalation = (v: number): number =>
	clamp(v, RANGES.escalation.min, RANGES.escalation.max);

/** Notes are hard-capped during input; no rounding, just truncate. */
export const clampNote = (note: string): string =>
	note.length > NOTE_MAX_LENGTH ? note.slice(0, NOTE_MAX_LENGTH) : note;

/** Combat titles are hard-capped during input; no rounding, just truncate. */
export const clampTitle = (title: string): string =>
	title.length > TITLE_MAX_LENGTH ? title.slice(0, TITLE_MAX_LENGTH) : title;

/** Combatant names are hard-capped during input; no rounding, just truncate. */
export const clampName = (name: string): string =>
	name.length > NAME_MAX_LENGTH ? name.slice(0, NAME_MAX_LENGTH) : name;

/** Combat descriptions are hard-capped during input; no rounding, just truncate. */
export const clampDescription = (description: string): string =>
	description.length > DESCRIPTION_MAX_LENGTH
		? description.slice(0, DESCRIPTION_MAX_LENGTH)
		: description;
