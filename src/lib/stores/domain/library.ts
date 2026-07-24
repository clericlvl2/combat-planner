/**
 * Combatant-library level operations — pure functions over the library entries array.
 * Templates are not part of any combat's undo history (same non-undoable status as `Settings`,
 * ADR-002). Tags are plain strings on each template; the derived tag union is never stored.
 */
import { type Combatant, type CombatantTemplate, MAX_LIBRARY_ENTRIES } from '../../db/types';
import {
	clampAc,
	clampInitiativeBonus,
	clampMaxHp,
	clampMd,
	clampName,
	clampNote,
	clampPd,
	clampTagName,
} from './clamp';
import { type CombatantTemplateInput, createCombatantTemplate } from './factories';
import { genId as defaultGenId, type IdGen } from './id';

export interface AddTemplateResult {
	list: CombatantTemplate[];
	/** The created template, or null when blocked by the 1000-entry cap. */
	created: CombatantTemplate | null;
}

/** New templates are appended; blocked past `MAX_LIBRARY_ENTRIES`. */
export function addTemplateToList(
	list: CombatantTemplate[],
	input: CombatantTemplateInput,
	genId: IdGen = defaultGenId,
	now: () => number = Date.now,
): AddTemplateResult {
	if (list.length >= MAX_LIBRARY_ENTRIES) return { list, created: null };
	const created = createCombatantTemplate(input, genId, now);
	return { list: [...list, created], created };
}

export interface EditTemplatePatch {
	name?: string;
	type?: CombatantTemplate['type'];
	initiativeBonus?: number;
	maxHp?: number;
	ac?: number;
	pd?: number;
	md?: number;
	note?: string;
	tags?: string[];
}

/** Patch fields on an existing template, re-clamping any changed numeric field. */
export function editTemplateInList(
	list: CombatantTemplate[],
	id: string,
	patch: EditTemplatePatch,
	now: () => number = Date.now,
): CombatantTemplate[] {
	const idx = list.findIndex((t) => t.id === id);
	if (idx === -1) return list;
	const current = list[idx];
	const next: CombatantTemplate = {
		...current,
		name: patch.name !== undefined ? clampName(patch.name.trim()) : current.name,
		type: patch.type ?? current.type,
		initiativeBonus:
			patch.initiativeBonus !== undefined
				? clampInitiativeBonus(patch.initiativeBonus)
				: current.initiativeBonus,
		maxHp: patch.maxHp !== undefined ? clampMaxHp(patch.maxHp) : current.maxHp,
		ac: patch.ac !== undefined ? clampAc(patch.ac) : current.ac,
		pd: patch.pd !== undefined ? clampPd(patch.pd) : current.pd,
		md: patch.md !== undefined ? clampMd(patch.md) : current.md,
		note: patch.note !== undefined ? clampNote(patch.note) : current.note,
		tags: patch.tags ?? current.tags,
		updatedAt: now(),
	};
	const out = list.slice();
	out[idx] = next;
	return out;
}

/** Delete a template. Not undoable (templates carry no history). */
export function removeTemplateFromList(list: CombatantTemplate[], id: string): CombatantTemplate[] {
	return list.filter((t) => t.id !== id);
}

/**
 * Map a live combatant's field values onto a template-creation input — omits every
 * combat-instance field (`currentHp`/`tempHp`/`conditions`/`hpLog`/`disabled`/`addOrder`/
 * `initiative`); a freshly saved template always starts untagged.
 */
export function templateInputFromCombatant(combatant: Combatant): CombatantTemplateInput {
	return {
		name: combatant.name,
		type: combatant.type,
		initiativeBonus: combatant.initiativeBonus,
		maxHp: combatant.maxHp,
		ac: combatant.ac,
		pd: combatant.pd,
		md: combatant.md,
		note: combatant.note,
		tags: [],
	};
}

/**
 * Canonicalize a raw tag-name input: trim, reject empty (`null`), clamp to
 * `TAG_NAME_MAX_LENGTH`, and case-insensitively dedupe against `existingTags` — a case-insensitive
 * match reuses the existing entry's exact casing instead of creating a variant.
 */
export function normalizeTagName(raw: string, existingTags: string[]): string | null {
	const trimmed = raw.trim();
	if (trimmed.length === 0) return null;
	const clamped = clampTagName(trimmed);
	const existing = existingTags.find((t) => t.toLowerCase() === clamped.toLowerCase());
	return existing ?? clamped;
}

/**
 * Toggle a tag on one template: removes it if present (case-insensitive match), else adds the
 * canonicalized form (reusing existing casing across the whole list); bumps that template's
 * `updatedAt`.
 */
export function toggleTemplateTag(
	list: CombatantTemplate[],
	templateId: string,
	name: string,
	now: () => number = Date.now,
): CombatantTemplate[] {
	const idx = list.findIndex((t) => t.id === templateId);
	if (idx === -1) return list;
	const current = list[idx];
	const lower = name.toLowerCase();
	const hasTag = current.tags.some((t) => t.toLowerCase() === lower);
	const canonical = normalizeTagName(name, allTagNames(list));
	if (canonical === null && !hasTag) return list;
	const tags = hasTag
		? current.tags.filter((t) => t.toLowerCase() !== lower)
		: [...current.tags, canonical as string];
	const next: CombatantTemplate = { ...current, tags, updatedAt: now() };
	const out = list.slice();
	out[idx] = next;
	return out;
}

/**
 * Derived union of every template's tags, deduped case-insensitively and sorted alphabetically
 * (case-insensitive). Never stored (ADR-002) — callers recompute from `libraryEntries` each time.
 */
export function allTagNames(list: CombatantTemplate[]): string[] {
	const seen = new Map<string, string>();
	for (const template of list) {
		for (const tag of template.tags) {
			const key = tag.toLowerCase();
			if (!seen.has(key)) seen.set(key, tag);
		}
	}
	return [...seen.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}
