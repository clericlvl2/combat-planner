/**
 * The store seam (ADR-002): the single owner of reactive AppData and the ONLY writer to Dexie
 * (ADR-003). Holds `$state`, delegates all logic to the pure domain (./domain), and persists on
 * every mutation + hydrates on boot. No UI, no derived rendering — derived VIEWS are pure helpers
 * in ./domain/derive, wrapped in `$derived` by components in M2+.
 */
import { db } from '../db';
import {
	type DbLoader,
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
import { DATA_VERSION, SETTINGS_ID } from '../db/types';
import { createBootSettings } from './boot-settings';
import * as App from './domain/app';
import type { CombatantInput, CombatantTemplateInput, CombatInput } from './domain/factories';
import type { D20Roll, IdGen } from './domain/id';
import * as Library from './domain/library';
import * as T from './domain/transitions';
import { redo as undoRedo, undo as undoUndo } from './domain/undo';

export class CombatStore {
	#loadDb: DbLoader;
	/** Memoized handle from `#loadDb`, cleared on rejection so a later hydrate retry re-attempts
	 *  the load instead of latching onto a dead promise. */
	#dbPromise: Promise<PersistenceDb> | null = null;
	/** FIFO write chain — every persist op enqueues onto this so writes drain in strict submission
	 *  order regardless of when their underlying db handle resolves (W-044). */
	#writes: Promise<unknown> = Promise.resolve();

	/** Seeded from the boot-time localStorage mirrors (Phase 1, boot-flash fix) so this initial
	 *  value already agrees with what `app.html`'s pre-paint script and the persisted locale show,
	 *  instead of flashing English/`system` for the hydrate window. */
	settings = $state.raw<Settings>(createBootSettings());
	combats = $state.raw<Combat[]>([]);
	/** The combatant library — no tag state; the tag list is derived at consumers (ADR-002). */
	libraryEntries = $state.raw<CombatantTemplate[]>([]);
	/** False until the first hydrate resolves; gates the UI boot (M2+). */
	ready = $state(false);
	/**
	 * Set when a hydrate attempt fails (e.g. Dexie unavailable). `hydrate()` never rejects out of
	 * this field — it is the seam `AppShell` reads to render the `apperror.*` UI on ANY route,
	 * including deep links that never run `+page.ts`'s `load` (only `/` does).
	 */
	hydrateError = $state<Error | null>(null);
	/** In-flight hydrate promise, memoized so concurrent callers (`/`'s root page and
	 *  `+layout.svelte`'s `onMount`) share one Dexie read instead of hydrating twice. Cleared once
	 *  settled (success or failure) so a later call — e.g. a user-triggered retry after a failure —
	 *  starts a fresh attempt rather than latching onto a dead promise. */
	#hydrating: Promise<string | null> | null = null;

	constructor(database: PersistenceDb | DbLoader = db) {
		// `PersistenceDb` is an object with three object properties and can never satisfy
		// `typeof === 'function'`, so this discriminator is sound for every call site.
		this.#loadDb = typeof database === 'function' ? database : () => Promise.resolve(database);
	}

	getCombat(id: string): Combat | undefined {
		return this.combats.find((c) => c.id === id);
	}

	/** Memoize the db handle per instance; the memo self-clears on rejection so a later hydrate
	 *  retry (e.g. after an offline chunk-load failure) gets a fresh attempt. */
	#resolveDb(): Promise<PersistenceDb> {
		if (!this.#dbPromise) {
			this.#dbPromise = this.#loadDb().catch((err) => {
				this.#dbPromise = null;
				throw err;
			});
		}
		return this.#dbPromise;
	}

	/** Queue one Dexie write. Returns the op's own promise; the chain survives its failure. */
	#enqueue(op: (db: PersistenceDb) => Promise<unknown>): Promise<unknown> {
		const next = this.#writes.then(() => {
			// A hydrate that failed leaves state at boot defaults — dropping the op is what stops
			// this write landing on top of a persisted row (W-052's lesson, applied to writes).
			if (this.hydrateError) return;
			return this.#resolveDb().then(op);
		});
		this.#writes = next.catch(() => {});
		return next;
	}

	/**
	 * Boot: load + normalize/migrate from Dexie, then run first-launch. Safe under concurrent
	 * callers (memoized) and never rejects — a failure sets `hydrateError` instead, so an `await`
	 * from `onMount` cannot produce an uncaught rejection. Callers that need the failure to
	 * propagate should check `hydrateError` after awaiting and throw it themselves.
	 *
	 * Resolves to the id of the combat this hydrate's first-launch run auto-created, or `null` when
	 * first-launch had already run, unexpectedly yielded no combat, or the hydrate failed. `/`'s
	 * root page uses it to make its first-launch redirect decision post-hydrate (W-041, boot-flash
	 * fix) instead of duplicating `App.firstLaunch`'s own pre-hydrate peek.
	 *
	 * The seeded id is a return value rather than store state deliberately. It is valid only for
	 * the boot that produced it, and `hydrate()` is called from `+layout.svelte` on EVERY route —
	 * so as a shared field it would be produced on routes that never read it (a first launch
	 * entered at `/settings`, say) and left stranded, then wrongly picked up by the first later
	 * visit to `/` in the same session. As a return value it reaches exactly the caller whose boot
	 * produced it, and the `ready` no-op below returns `null` to every call after.
	 */
	async hydrate(genId?: IdGen): Promise<string | null> {
		if (this.ready) return null;
		if (this.#hydrating) return this.#hydrating;
		this.#hydrating = this.#doHydrate(genId).finally(() => {
			this.#hydrating = null;
		});
		return this.#hydrating;
	}

	async #doHydrate(genId?: IdGen): Promise<string | null> {
		try {
			const db = await this.#resolveDb();
			const [data, libraryEntries, rawSettings] = await Promise.all([
				loadAppData(db),
				loadLibraryEntries(db),
				// `loadAppData`'s normalized result always reads `DATA_VERSION` (migrate() stamps
				// it), so the ORIGINAL stored version has to be read separately to detect a
				// forward migration and write the bumped version back (ADR-013). This is a second
				// read of the same single row `loadAppData` reads internally, kept deliberately:
				// it is one indexed get on one tiny row, issued in the same Promise.all, and the
				// alternative is widening loadAppData's return type across every call site.
				db.settings.get(SETTINGS_ID),
			]);
			const migratedForward = (rawSettings?.dataVersion ?? 1) < DATA_VERSION;
			const { combats, settings, opened } = App.firstLaunch(data.combats, data.settings, genId);
			this.combats = combats;
			this.settings = settings;
			this.libraryEntries = libraryEntries;
			this.hydrateError = null;
			this.ready = true;
			if (opened) {
				// First launch mutated state — persist the new combat + flag. These share the same
				// write chain as user-triggered writes (W-044) so a write enqueued while this
				// hydrate was in flight cannot land ahead of it and get clobbered.
				await Promise.all([
					this.#enqueue((d) => persistCombat(d, opened)),
					this.#enqueue((d) => persistSettings(d, settings)),
				]);
			} else if (migratedForward) {
				// A forward migration ran but first-launch didn't — nothing else would ever
				// persist the bumped `dataVersion`, so the same migration would re-run every boot.
				await Promise.all([
					this.#enqueue((d) => persistSettings(d, settings)),
					this.#enqueue((d) => persistCombats(d, combats)),
				]);
			}
			return opened?.id ?? null;
		} catch (err) {
			this.hydrateError = err instanceof Error ? err : new Error(String(err));
			return null;
		}
	}

	// ── per-combat mutation core ──────────────────────────────────────────────

	/** Apply a pure combat transition, swap the row in state, and persist it (single writer). */
	#mutate(combatId: string, fn: (c: Combat) => Combat): void {
		const idx = this.combats.findIndex((c) => c.id === combatId);
		if (idx === -1) return;
		const current = this.combats[idx];
		const next = fn(current);
		if (next === current) return; // no-op transition, skip the write
		this.combats = this.combats.with(idx, next);
		// TODO M-phase (ADR-003): debounce/batch writes per action burst.
		void this.#enqueue((db) => persistCombat(db, next));
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
		void this.#enqueue((db) => persistCombat(db, created));
		return created;
	}

	/** Patch title/description/colorTag on an existing combat; no-op if the id is unknown. */
	editCombat(id: string, patch: App.EditCombatPatch): void {
		const snapshot = this.combats;
		const edited = App.editCombat(snapshot, id, patch);
		if (edited === snapshot) return; // unknown id — no-op
		this.combats = edited;
		const next = edited.find((c) => c.id === id);
		if (next) void this.#enqueue((db) => persistCombat(db, next));
	}

	/** Delete a combat (confirm-gated upstream; not undoable). */
	deleteCombat(id: string): void {
		this.combats = App.deleteCombat(this.combats, id);
		void this.#enqueue((db) => removeCombatRow(db, id));
	}

	reorderCombats(orderedIds: string[]): void {
		const reordered = App.reorderCombats(this.combats, orderedIds);
		this.combats = reordered;
		void this.#enqueue((db) => persistCombats(db, reordered));
	}

	/**
	 * `this.settings` starts as `createBootSettings()`'s localStorage-seeded defaults (see the
	 * `settings` field doc) until `hydrate()` resolves — a pre-ready call would spread the patch
	 * over those defaults and persist `firstLaunchDone: false` and a stale `dataVersion` over the
	 * real Dexie row (W-052). Queue the write behind `hydrate()` so it applies to the
	 * actually-hydrated settings instead of discarding the caller's intent; every current call
	 * site (`InstallBanner`, the settings route) already gates its UI on `store.ready` and never
	 * reads `store.settings` synchronously right after calling this, so resolving asynchronously
	 * here is safe. `hydrate()` never rejects — a failed attempt sets `hydrateError` and leaves
	 * `ready` false, so the continuation re-checks `ready` and drops the write rather than
	 * applying the patch over the still-unhydrated boot defaults.
	 */
	updateSettings(patch: Partial<Omit<Settings, 'id'>>): void {
		if (!this.ready) {
			void this.hydrate().then(() => {
				if (this.ready) this.#applySettingsPatch(patch);
			});
			return;
		}
		this.#applySettingsPatch(patch);
	}

	#applySettingsPatch(patch: Partial<Omit<Settings, 'id'>>): void {
		const next = { ...this.settings, ...patch };
		this.settings = next;
		void this.#enqueue((db) => persistSettings(db, next));
	}

	// ── library ──────────────────────────────────────────────────────────────

	/** Create a template; returns it (or null at the `MAX_LIBRARY_ENTRIES` cap). Not undoable. */
	addTemplate(input: CombatantTemplateInput, genId?: IdGen): CombatantTemplate | null {
		const { list, created } = Library.addTemplateToList(
			this.libraryEntries,
			// `input` is caller-supplied and may still be a component's live `$state` proxy — detach
			// it before it reaches persistence (ADR-003).
			$state.snapshot(input) as CombatantTemplateInput,
			genId,
		);
		if (!created) return null;
		this.libraryEntries = list;
		void this.#enqueue((db) => persistLibraryEntry(db, created));
		return created;
	}

	/** Patch fields on an existing template; no-op if the id is unknown. */
	editTemplate(id: string, patch: Library.EditTemplatePatch): void {
		const snapshot = this.libraryEntries;
		const edited = Library.editTemplateInList(
			snapshot,
			id,
			// `patch` is caller-supplied and may still be a component's live `$state` proxy — detach
			// it before it reaches persistence (ADR-003).
			$state.snapshot(patch) as Library.EditTemplatePatch,
		);
		if (edited === snapshot) return; // unknown id — no-op
		this.libraryEntries = edited;
		const next = edited.find((t) => t.id === id);
		if (next) void this.#enqueue((db) => persistLibraryEntry(db, next));
	}

	/** Delete a template (confirm-gated upstream; not undoable). */
	removeTemplate(id: string): void {
		this.libraryEntries = Library.removeTemplateFromList(this.libraryEntries, id);
		void this.#enqueue((db) => removeLibraryEntryRow(db, id));
	}

	/**
	 * Copy a live combatant's field values into a new (untagged) template; returns it (or null
	 * at the cap). No-op-returning-null if the combat/combatant id is unknown.
	 */
	createTemplateFromCombatant(combatId: string, combatantId: string): CombatantTemplate | null {
		const combatant = this.getCombat(combatId)?.combatants.find((c) => c.id === combatantId);
		if (!combatant) return null;
		return this.addTemplate(Library.templateInputFromCombatant(combatant));
	}

	/** Add/remove a tag on one template (case-insensitive canonicalization); no-op on unknown id. */
	toggleTemplateTag(templateId: string, name: string): void {
		const snapshot = this.libraryEntries;
		const toggled = Library.toggleTemplateTag(snapshot, templateId, name);
		if (toggled === snapshot) return; // unknown id — no-op
		this.libraryEntries = toggled;
		const next = toggled.find((t) => t.id === templateId);
		if (next) void this.#enqueue((db) => persistLibraryEntry(db, next));
	}
}

/** App-wide singleton store (the live Dexie instance). Tests construct their own with a fake db. */
export const store = new CombatStore();
