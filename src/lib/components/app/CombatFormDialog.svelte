<!--
  CombatFormDialog — Title/Description/Color-tag form for a
  combat, shared by create and edit. Mode is inferred from the optional `combat` prop (present =
  edit, absent = create), same convention as CombatantForm's explicit mode but collapsed to one
  signal since combats-list has no third state. Calls the store directly (createCombat / editCombat)
  rather than bubbling an onSubmit, per tasks.md Phase 3 — parents pass in the store (or a
  test-double implementing the same two methods).

  This shell only owns identity (`combat`/`open`/`store`) and remounts CombatFormBody via
  `{#key combat?.id ?? 'new'}` — the form's local state lives entirely in the body so seeding it
  from `combat` is a plain `$state` initializer, never an effect (Phase 2, 2026-07-28 plan).
-->
<script lang="ts">
	import { type Combat } from '$lib/db/types';
	import type { CombatInput, EditCombatPatch } from '$lib/stores/domain';
	import CombatFormBody from './CombatFormBody.svelte';

	/** Narrow store surface this dialog needs — lets tests pass a plain spy object. */
	export interface CombatFormStore {
		createCombat(input: CombatInput): Combat | null;
		editCombat(id: string, patch: EditCombatPatch): void;
	}

	let {
		combat = null,
		open = $bindable(false),
		store,
	}: {
		/** Present = edit mode (seeded from this combat); absent/null = create mode. */
		combat?: Combat | null;
		open?: boolean;
		store: CombatFormStore;
	} = $props();
</script>

{#key combat?.id ?? 'new'}
	<CombatFormBody bind:open {combat} {store} />
{/key}
