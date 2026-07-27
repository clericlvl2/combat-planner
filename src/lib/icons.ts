/**
 * Centralized Lucide glyph map (ADR-011). One file so a later glyph swap is a single edit.
 * Two groups: combatant `type` and UI `chrome` (conditions are text-only tags, no icons — see
 * ConditionPicker/ConditionIconList).
 */
import {
	BookPlus,
	ChevronDown,
	ChevronLeft,
	ChevronsRight,
	CircleAlert,
	Copy,
	Delete,
	EllipsisVertical,
	EyeOff,
	GripHorizontal,
	Info,
	LibraryBig,
	type Icon as LucideIcon,
	PanelLeft,
	Pencil,
	Play,
	Plus,
	Redo,
	Search,
	Settings,
	Shield,
	Skull,
	Swords,
	Trash2,
	Undo,
	User,
	Users,
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

/** UI chrome glyphs (ADR-011 firm set). */
export const chromeIcon = {
	back: ChevronLeft,
	undo: Undo,
	redo: Redo,
	advance: ChevronsRight,
	overflow: EllipsisVertical,
	add: Plus,
	edit: Pencil,
	remove: Trash2,
	duplicate: Copy,
	disable: EyeOff,
	close: X,
	clear: X,
	expand: ChevronDown,
	backspace: Delete,
	menu: PanelLeft,
	navCombats: Swords,
	navSettings: Settings,
	navAbout: Info,
	navLibrary: LibraryBig,
	saveToLibrary: BookPlus,
	drag: GripHorizontal,
	start: Play,
	search: Search,
	alert: CircleAlert,
	roster: Users,
} satisfies Record<string, IconComponent>;
