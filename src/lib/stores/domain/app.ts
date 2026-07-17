/**
 * Combats-list level operations — pure functions over the combats array / settings.
 * These live outside the per-combat undo history: delete-combat / reset-all are
 * confirm-gated, not undoable. The reactive seam wires confirmation + persistence (M2+).
 */
import { type ColorTag, type Combat, MAX_COMBATS, type Settings } from '../../db/types';
import { type CombatInput, createCombat } from './factories';
import { genId as defaultGenId, type IdGen } from './id';

export interface CreateCombatResult {
	combats: Combat[];
	/** The created combat, or null when blocked by the 100-combat cap. */
	created: Combat | null;
}

/** New combats are inserted at the TOP of the list (lowest listOrder); blocked past 100. */
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

/** Delete a combat (and its history). Not undoable. */
export function deleteCombat(combats: Combat[], id: string): Combat[] {
	return combats.filter((c) => c.id !== id);
}

export interface EditCombatPatch {
	title?: string;
	description?: string;
	colorTag?: ColorTag;
}

/** Patch title/description/colorTag on an existing combat; roster/state/history untouched. */
export function editCombat(combats: Combat[], id: string, patch: EditCombatPatch): Combat[] {
	const idx = combats.findIndex((c) => c.id === id);
	if (idx === -1) return combats;
	const current = combats[idx];
	const next: Combat = {
		...current,
		title: patch.title !== undefined ? patch.title.trim() : current.title,
		description: patch.description !== undefined ? patch.description.trim() : current.description,
		colorTag: patch.colorTag ?? current.colorTag,
		updatedAt: Date.now(),
	};
	const out = combats.slice();
	out[idx] = next;
	return out;
}

/** Re-assign listOrder from a dragged id order. */
export function reorderCombats(combats: Combat[], orderedIds: string[]): Combat[] {
	const rank = new Map(orderedIds.map((id, i) => [id, i]));
	return combats.map((c) => ({ ...c, listOrder: rank.get(c.id) ?? c.listOrder }));
}

export interface ResetAllResult {
	combats: Combat[];
	settings: Settings;
}

/** Clear all combats; keep language/theme; re-arm first-launch. */
export function resetAll(settings: Settings): ResetAllResult {
	return {
		combats: [],
		settings: { ...settings, firstLaunchDone: false },
	};
}

export interface FirstLaunchResult {
	combats: Combat[];
	settings: Settings;
	/** The auto-created combat to open, or null if first-launch already ran. */
	opened: Combat | null;
}

/** If first-launch hasn't run, auto-create one empty combat and set the flag. */
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
