/**
 * Centralized Lucide glyph map (ADR-011). One file so a later glyph swap is a single edit.
 * Two groups: combatant `type` and UI `chrome` (conditions are text-only tags, no icons — see
 * ConditionPicker/ConditionIconList).
 *
 * TODO M-phase (ADR-011): the chrome glyphs still open (Glyph gaps: clear) are pinned here
 * pending their formal addition to ADR-011. `menu` /
 * `navCombats` / `navSettings` / `navAbout` (unit 006 Phase 1, AppHeader/NavSidebar) fill the
 * "menu/burger, settings/about nav icons" gap — Combats keeps its crossed-swords glyph.
 */
import {
	Ban,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Copy,
	Dices,
	EllipsisVertical,
	Info,
	type Icon as LucideIcon,
	Menu,
	Pencil,
	Play,
	Plus,
	Redo2,
	Search,
	Settings,
	Share2,
	Shield,
	Skull,
	Swords,
	Trash2,
	TriangleAlert,
	Undo2,
	Upload,
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

/** UI chrome glyphs (ADR-011 firm set + the still-open glyph gaps). */
export const chromeIcon = {
	back: ChevronLeft,
	undo: Undo2,
	redo: Redo2,
	advance: ChevronRight,
	overflow: EllipsisVertical,
	add: Plus,
	import: Upload,
	export: Share2,
	roll: Dices,
	// Open glyph gaps (pending ADR-011):
	edit: Pencil,
	remove: Trash2,
	duplicate: Copy,
	disable: Ban,
	close: X,
	expand: ChevronDown,
	backspace: ChevronLeft,
	menu: Menu,
	navCombats: Swords,
	navSettings: Settings,
	navAbout: Info,
	start: Play,
	search: Search,
	alert: TriangleAlert,
	roster: Users,
} satisfies Record<string, IconComponent>;
