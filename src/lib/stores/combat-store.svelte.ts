/**
 * The store seam (ADR-002): the single owner of reactive AppData and the ONLY writer to Dexie
 * (ADR-003). Holds `$state`, delegates all logic to the pure domain (./domain), and persists on
 * every mutation + hydrates on boot. No UI, no derived rendering — derived VIEWS are pure helpers
 * in ./domain/derive, wrapped in `$derived` by components in M2+.
 */
import { db } from '../db';
import {
	loadAppData,
	loadLibraryEntries,
	type PersistenceDb,
	persistCombat,
	persistCombats,
	persistLibraryEntry,
	persistSettings,
	removeCombatRow,
	removeLibraryEntryRow,
} from '../db/persistence';
import type { Combat, CombatantTemplate, Condition, Settings } from '../db/types';
import { SETTINGS_ID } from '../db/types';
import * as App from './domain/app';
import {
	type CombatantInput,
	type CombatantTemplateInput,
	type CombatInput,
	createSettings,
} from './domain/factories';
import type { D20Roll, IdGen } from './domain/id';
import * as Library from './domain/library';
import * as T from './domain/transitions';
import { redo as undoRedo, undo as undoUndo } from './domain/undo';

export class CombatStore {
	readonly #db: PersistenceDb;

	settings = $state<Settings>(createSettings());
	combats = $state<Combat[]>([]);
	/** The combatant library — no tag state; the tag list is derived at consumers (ADR-002). */
	libraryEntries = $state<CombatantTemplate[]>([]);
	/** False until the first hydrate resolves; gates the UI boot (M2+). */
	ready = $state(false);
	/**
	 * Set when a hydrate attempt fails (e.g. Dexie unavailable). `hydrate()` never rejects out of
	 * this field — it is the seam `AppShell` reads to render the `apperror.*` UI on ANY route,
	 * including deep links that never run `+page.ts`'s `load` (only `/` does).
	 */
	hydrateError = $state<Error | null>(null);
	/** In-flight hydrate promise, memoized so concurrent callers (`+page.ts`'s `load` and
	 *  `+layout.svelte`'s `onMount`) share one Dexie read instead of hydrating twice. Cleared once
	 *  settled (success or failure) so a later call — e.g. a user-triggered retry after a failure —
	 *  starts a fresh attempt rather than latching onto a dead promise. */
	#hydrating: Promise<void> | null = null;

	constructor(database: PersistenceDb = db) {
		this.#db = database;
	}

	getCombat(id: string): Combat | undefined {
		return this.combats.find((c) => c.id === id);
	}

	/**
	 * Boot: load + normalize/migrate from Dexie, then run first-launch. Safe under concurrent
	 * callers (memoized) and never rejects — a failure sets `hydrateError` instead, so an `await`
	 * from `onMount` cannot produce an uncaught rejection. Callers that need the failure to
	 * propagate (the `/` root `load`) should check `hydrateError` after awaiting and throw it
	 * themselves.
	 */
	async hydrate(genId?: IdGen): Promise<void> {
		if (this.ready) return;
		if (this.#hydrating) return this.#hydrating;
		this.#hydrating = this.#doHydrate(genId).finally(() => {
			this.#hydrating = null;
		});
		return this.#hydrating;
	}

	async #doHydrate(genId?: IdGen): Promise<void> {
		try {
			const [data, libraryEntries] = await Promise.all([
				loadAppData(this.#db),
				loadLibraryEntries(this.#db),
			]);
			const { combats, settings, opened } = App.firstLaunch(data.combats, data.settings, genId);
			this.combats = combats;
			this.settings = settings;
			this.libraryEntries = libraryEntries;
			this.hydrateError = null;
			this.ready = true;
			if (opened) {
				// First launch mutated state — persist the new combat + flag.
				await Promise.all([persistCombat(this.#db, opened), persistSettings(this.#db, settings)]);
			}
		} catch (err) {
			this.hydrateError = err instanceof Error ? err : new Error(String(err));
		}
	}

	/**
	 * Whether first-launch has NOT run yet, read via the same normalize path as `hydrate()`
	 * (ADR-003/013) without a second full load: once `ready`, this answers from live state; before
	 * that it reads only the settings row (no combats/library fetch) and normalizes it the same
	 * way `normalizeSettings` would.
	 */
	async peekFirstLaunch(): Promise<boolean> {
		if (this.ready) return !this.settings.firstLaunchDone;
		const raw = await this.#db.settings.get(SETTINGS_ID);
		return !createSettings(raw ?? {}).firstLaunchDone;
	}

	// ── per-combat mutation core ──────────────────────────────────────────────

	/** Apply a pure combat transition, swap the row in state, and persist it (single writer). */
	#mutate(combatId: string, fn: (c: Combat) => Combat): void {
		const idx = this.combats.findIndex((c) => c.id === combatId);
		if (idx === -1) return;
		// Detach a plain snapshot before handing state to the pure domain — Svelte's `$state`
		// proxies are not structured-cloneable (undo.ts) nor IndexedDB-serializable (ADR-003).
		const current = $state.snapshot(this.combats[idx]) as Combat;
		const next = fn(current);
		if (next === current) return; // no-op transition, skip the write
		this.combats[idx] = next;
		// TODO M-phase (ADR-003): debounce/batch writes per action burst.
		void persistCombat(this.#db, next);
	}

	// HP
	dealDamage = (combatId: string, id: string, n: number): void =>
		this.#mutate(combatId, (c) => T.dealDamage(c, id, n));
	restoreHp = (combatId: string, id: string, n: number): void =>
		this.#mutate(combatId, (c) => T.restoreHp(c, id, n));
	setTempHp = (combatId: string, id: string, n: number): void =>
		this.#mutate(combatId, (c) => T.setTempHp(c, id, n));

	// Roster
	addCombatant = (combatId: string, input: CombatantInput, genId?: IdGen): void =>
		this.#mutate(combatId, (c) => T.addCombatant(c, input, genId));
	removeCombatant = (combatId: string, id: string): void =>
		this.#mutate(combatId, (c) => T.removeCombatant(c, id));
	duplicateCombatant = (combatId: string, id: string, genId?: IdGen): void =>
		this.#mutate(combatId, (c) => T.duplicateCombatant(c, id, genId));
	toggleDisabled = (combatId: string, id: string): void =>
		this.#mutate(combatId, (c) => T.toggleDisabled(c, id));

	// Fields
	editCombatant = (
		combatId: string,
		id: string,
		patch: T.CombatantFieldPatch & { maxHp?: number },
	): void => this.#mutate(combatId, (c) => T.editCombatant(c, id, patch));
	addCondition = (combatId: string, id: string, condition: Condition): void =>
		this.#mutate(combatId, (c) => T.addCondition(c, id, condition));
	removeCondition = (combatId: string, id: string, condition: Condition): void =>
		this.#mutate(combatId, (c) => T.removeCondition(c, id, condition));
	rollOne = (combatId: string, id: string, roll?: D20Roll): void =>
		this.#mutate(combatId, (c) => T.rollOne(c, id, roll));
	setInitiative = (combatId: string, id: string, value: number): void =>
		this.#mutate(combatId, (c) => T.setInitiative(c, id, value));

	// Lifecycle
	start = (combatId: string, roll?: D20Roll): void =>
		this.#mutate(combatId, (c) => T.start(c, roll));
	advanceTurn = (combatId: string): void => this.#mutate(combatId, T.advanceTurn);
	editRound = (combatId: string, value: number): void =>
		this.#mutate(combatId, (c) => T.editRound(c, value));
	setEscalation = (combatId: string, value: number): void =>
		this.#mutate(combatId, (c) => T.setEscalation(c, value));
	clearCombat = (combatId: string): void => this.#mutate(combatId, T.clearCombat);
	restart = (combatId: string): void => this.#mutate(combatId, T.restart);

	// Undo/redo
	undo = (combatId: string): void => this.#mutate(combatId, undoUndo);
	redo = (combatId: string): void => this.#mutate(combatId, undoRedo);

	// ── combats-list level ───────────────────────────────────────────────────

	/** Create a combat at the top of the list; returns it (or null at the 100-cap). */
	createCombat(input: CombatInput = {}, genId?: IdGen): Combat | null {
		const { combats, created } = App.createCombatInList(this.combats, input, genId);
		if (!created) return null;
		this.combats = combats;
		void persistCombat(this.#db, created);
		return created;
	}

	/** Patch title/description/colorTag on an existing combat; no-op if the id is unknown. */
	editCombat(id: string, patch: App.EditCombatPatch): void {
		const snapshot = $state.snapshot(this.combats) as Combat[];
		const edited = App.editCombat(snapshot, id, patch);
		if (edited === snapshot) return; // unknown id — no-op
		this.combats = edited;
		const next = edited.find((c) => c.id === id);
		if (next) void persistCombat(this.#db, next);
	}

	/** Delete a combat (confirm-gated upstream; not undoable). */
	deleteCombat(id: string): void {
		this.combats = App.deleteCombat(this.combats, id);
		void removeCombatRow(this.#db, id);
	}

	reorderCombats(orderedIds: string[]): void {
		const reordered = App.reorderCombats($state.snapshot(this.combats) as Combat[], orderedIds);
		this.combats = reordered;
		void persistCombats(this.#db, reordered);
	}

	updateSettings(patch: Partial<Omit<Settings, 'id'>>): void {
		const next = { ...($state.snapshot(this.settings) as Settings), ...patch };
		this.settings = next;
		void persistSettings(this.#db, next);
	}

	// ── library ──────────────────────────────────────────────────────────────

	/** Create a template; returns it (or null at the `MAX_LIBRARY_ENTRIES` cap). Not undoable. */
	addTemplate(input: CombatantTemplateInput, genId?: IdGen): CombatantTemplate | null {
		const { list, created } = Library.addTemplateToList(
			$state.snapshot(this.libraryEntries) as CombatantTemplate[],
			$state.snapshot(input) as CombatantTemplateInput,
			genId,
		);
		if (!created) return null;
		this.libraryEntries = list;
		void persistLibraryEntry(this.#db, created);
		return created;
	}

	/** Patch fields on an existing template; no-op if the id is unknown. */
	editTemplate(id: string, patch: Library.EditTemplatePatch): void {
		const snapshot = $state.snapshot(this.libraryEntries) as CombatantTemplate[];
		const edited = Library.editTemplateInList(
			snapshot,
			id,
			$state.snapshot(patch) as Library.EditTemplatePatch,
		);
		if (edited === snapshot) return; // unknown id — no-op
		this.libraryEntries = edited;
		const next = edited.find((t) => t.id === id);
		if (next) void persistLibraryEntry(this.#db, next);
	}

	/** Delete a template (confirm-gated upstream; not undoable). */
	removeTemplate(id: string): void {
		const snapshot = $state.snapshot(this.libraryEntries) as CombatantTemplate[];
		this.libraryEntries = Library.removeTemplateFromList(snapshot, id);
		void removeLibraryEntryRow(this.#db, id);
	}

	/**
	 * Copy a live combatant's field values into a new (untagged) template; returns it (or null
	 * at the cap). No-op-returning-null if the combat/combatant id is unknown.
	 */
	createTemplateFromCombatant(combatId: string, combatantId: string): CombatantTemplate | null {
		const combatant = this.getCombat(combatId)?.combatants.find((c) => c.id === combatantId);
		if (!combatant) return null;
		return this.addTemplate(Library.templateInputFromCombatant($state.snapshot(combatant)));
	}

	/** Add/remove a tag on one template (case-insensitive canonicalization); no-op on unknown id. */
	toggleTemplateTag(templateId: string, name: string): void {
		const snapshot = $state.snapshot(this.libraryEntries) as CombatantTemplate[];
		const toggled = Library.toggleTemplateTag(snapshot, templateId, name);
		if (toggled === snapshot) return; // unknown id — no-op
		this.libraryEntries = toggled;
		const next = toggled.find((t) => t.id === templateId);
		if (next) void persistLibraryEntry(this.#db, next);
	}
}

/** App-wide singleton store (the live Dexie instance). Tests construct their own with a fake db. */
export const store = new CombatStore();
