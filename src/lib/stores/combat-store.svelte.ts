/**
 * The store seam (ADR-002): the single owner of reactive AppData and the ONLY writer to Dexie
 * (ADR-003). Holds `$state`, delegates all logic to the pure domain (./domain), and persists on
 * every mutation + hydrates on boot. No UI, no derived rendering — derived VIEWS are pure helpers
 * in ./domain/derive, wrapped in `$derived` by components in M2+.
 */
import { db } from '../db';
import {
	loadAppData,
	type PersistenceDb,
	persistCombat,
	persistCombats,
	persistSettings,
	removeCombatRow,
} from '../db/persistence';
import type { Combat, Condition, Settings } from '../db/types';
import * as App from './domain/app';
import { type CombatantInput, type CombatInput, createSettings } from './domain/factories';
import type { D20Roll, IdGen } from './domain/id';
import * as T from './domain/transitions';
import { redo as undoRedo, undo as undoUndo } from './domain/undo';

export class CombatStore {
	readonly #db: PersistenceDb;

	settings = $state<Settings>(createSettings());
	combats = $state<Combat[]>([]);
	/** False until the first hydrate resolves; gates the UI boot (M2+). */
	ready = $state(false);

	constructor(database: PersistenceDb = db) {
		this.#db = database;
	}

	getCombat(id: string): Combat | undefined {
		return this.combats.find((c) => c.id === id);
	}

	/** Boot: load + normalize/migrate from Dexie, then run first-launch. */
	async hydrate(genId?: IdGen): Promise<void> {
		const data = await loadAppData(this.#db);
		const { combats, settings, opened } = App.firstLaunch(data.combats, data.settings, genId);
		this.combats = combats;
		this.settings = settings;
		this.ready = true;
		if (opened) {
			// First launch mutated state — persist the new combat + flag.
			await Promise.all([persistCombat(this.#db, opened), persistSettings(this.#db, settings)]);
		}
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
}

/** App-wide singleton store (the live Dexie instance). Tests construct their own with a fake db. */
export const store = new CombatStore();
