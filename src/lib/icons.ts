/**
 * Centralized Lucide glyph map (ADR-011). One file so a later glyph swap is a single edit.
 * Two groups: combatant `type` and UI `chrome` (conditions are text-only tags, no icons — see
 * ConditionPicker/ConditionIconList).
 *
 * TODO M-phase (ADR-011): the chrome glyphs flagged in specs/reference/component-inventory.md
 * (Glyph gaps: edit/remove/duplicate/close/backspace/clear/expand) are pinned here pending their
 * formal addition to ADR-011.
 */
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Copy,
	Crosshair,
	Dices,
	EllipsisVertical,
	type Icon as LucideIcon,
	Pencil,
	Plus,
	Redo2,
	Share2,
	Shield,
	Skull,
	Trash2,
	Undo2,
	Upload,
	User,
	X,
} from '@lucide/svelte';
import type { CombatantType } from '$lib/db/types';

export type IconComponent = typeof LucideIcon;

/** Combatant type → glyph (firm, ADR-011). PC = person, enemy = skull, ally = shield. */
export const typeIcon: Record<CombatantType, IconComponent> = {
	pc: User,
	enemy: Skull,
	ally: Shield,
};

/** UI chrome glyphs (ADR-011 firm set + the §13-flagged gaps). */
export const chromeIcon = {
	back: ChevronLeft,
	undo: Undo2,
	redo: Redo2,
	advance: ChevronRight,
	overflow: EllipsisVertical,
	add: Plus,
	jump: Crosshair,
	import: Upload,
	export: Share2,
	roll: Dices,
	// §13 gaps (pending ADR-011):
	edit: Pencil,
	remove: Trash2,
	duplicate: Copy,
	close: X,
	expand: ChevronDown,
	backspace: ChevronLeft,
} satisfies Record<string, IconComponent>;
