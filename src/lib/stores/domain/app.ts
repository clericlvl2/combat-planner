/**
 * Combats-list level operations (Data Model §7) — pure functions over the combats array / settings.
 * These live outside the per-combat undo history (Data §8: delete-combat / reset-all are
 * confirm-gated, not undoable). The reactive seam wires confirmation + persistence (M2+).
 */
import { type Combat, MAX_COMBATS, type Settings } from '../../db/types';
import { type CombatInput, createCombat } from './factories';
import { genId as defaultGenId, type IdGen } from './id';

export interface CreateCombatResult {
	combats: Combat[];
	/** The created combat, or null when blocked by the 100-combat cap (Rules §7). */
	created: Combat | null;
}

/** New combats are inserted at the TOP of the list (lowest listOrder); blocked past 100 (Rules §7). */
export function createCombatInList(
	combats: Combat[],
	input: CombatInput = {},
	genId: IdGen = defaultGenId,
): CreateCombatResult {
	if (combats.length >= MAX_COMBATS) return { combats, created: null };
	const topOrder = combats.reduce((min, c) => Math.min(min, c.listOrder), 0) - 1;
	const created = createCombat(input, topOrder, genId);
	return { combats: [created, ...combats], created };
}

/** Delete a combat (and its history). Not undoable (Data §8). */
export function deleteCombat(combats: Combat[], id: string): Combat[] {
	return combats.filter((c) => c.id !== id);
}

/** Re-assign listOrder from a dragged id order (Data §7 reorderCombats). */
export function reorderCombats(combats: Combat[], orderedIds: string[]): Combat[] {
	const rank = new Map(orderedIds.map((id, i) => [id, i]));
	return combats.map((c) => ({ ...c, listOrder: rank.get(c.id) ?? c.listOrder }));
}

export interface ResetAllResult {
	combats: Combat[];
	settings: Settings;
}

/** Clear all combats; keep language/theme; re-arm first-launch (Data §7 resetAll). */
export function resetAll(settings: Settings): ResetAllResult {
	return {
		combats: [],
		settings: { ...settings, firstLaunchDone: false },
	};
}

export interface FirstLaunchResult {
	combats: Combat[];
	settings: Settings;
	/** The auto-created combat to open, or null if first-launch already ran (Data §7 firstLaunch). */
	opened: Combat | null;
}

/** If first-launch hasn't run, auto-create one empty combat and set the flag (Data §7 firstLaunch). */
export function firstLaunch(
	combats: Combat[],
	settings: Settings,
	genId: IdGen = defaultGenId,
): FirstLaunchResult {
	if (settings.firstLaunchDone) return { combats, settings, opened: null };
	const { combats: withNew, created } = createCombatInList(combats, {}, genId);
	return {
		combats: withNew,
		settings: { ...settings, firstLaunchDone: true },
		opened: created,
	};
}
