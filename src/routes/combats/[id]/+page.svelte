<!--
  Combat screen (UX §4, Component Inventory §6–§10) — the M2 vertical slice. Reads the store's
  reactive combat + the derived VIEWS (sortedCombatants / showRoundAndEscalation / canAdvance /
  isActive), wraps them in $derived (ADR-002), and wires the thin components via an id-scoped
  controller. Setup ⇄ Active is gated by showRoundAndEscalation. The page owns the single shared
  NumpadSheet + add/edit forms; rows/header emit intent only.

  TODO M3 (UX §3 / Component Inventory §5): the Combats home + routing/import replace the boot
  seed; this screen stays the /combats/[id] target.
-->
<script lang="ts">
	import { page } from '$app/state';
	import CombatantForm, { type CombatantFormValues } from '$lib/components/app/CombatantForm.svelte';
	import CombatantRow from '$lib/components/app/CombatantRow.svelte';
	import CombatHeader from '$lib/components/app/CombatHeader.svelte';
	import { makeController } from '$lib/components/app/controller';
	import NumpadSheet from '$lib/components/app/NumpadSheet.svelte';
	import { Button } from '$lib/components/ui/button';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import { store } from '$lib/stores';
	import { canAdvance, isActive, showRoundAndEscalation, sortedCombatants } from '$lib/stores/domain/derive';

	const id = $derived(page.params.id ?? '');
	const combat = $derived(store.getCombat(id));
	const controller = $derived(makeController(store, id));

	const active = $derived(combat ? showRoundAndEscalation(combat) : false);
	// Setup: raw add-order, no live autosort (rolls/edits update the number, not the position).
	// Active: sorted order, so the turn pointer and re-sort logic apply live.
	const display = $derived(combat ? (active ? sortedCombatants(combat) : combat.combatants) : []);
	const canAdv = $derived(combat ? canAdvance(combat) : false);

	const Add = chromeIcon.add;
	const Advance = chromeIcon.advance;

	// page-owned shared surfaces
	let numpadId = $state<string | null>(null);
	let numpadOpen = $state(false);
	const numpadCombatant = $derived(
		combat && numpadId ? (combat.combatants.find((c) => c.id === numpadId) ?? null) : null,
	);
	function openNumpad(cid: string) {
		numpadId = cid;
		numpadOpen = true;
	}

	let addOpen = $state(false);
	let editOpen = $state(false);
	let editId = $state<string | null>(null);
	const editCombatant = $derived(
		combat && editId ? (combat.combatants.find((c) => c.id === editId) ?? null) : null,
	);
	function openEdit(cid: string) {
		editId = cid;
		editOpen = true;
	}

	function submitAdd(v: CombatantFormValues) {
		controller.addCombatant({
			name: v.name,
			type: v.type,
			initiativeBonus: v.initiativeBonus ?? undefined,
			initiative: v.initiative ?? undefined,
			maxHp: v.maxHp ?? undefined,
			ac: v.ac ?? undefined,
			pd: v.pd ?? undefined,
			md: v.md ?? undefined,
			note: v.note,
		});
	}
	function submitEdit(v: CombatantFormValues) {
		if (!editId) return;
		controller.edit(editId, {
			name: v.name,
			type: v.type,
			initiativeBonus: v.initiativeBonus ?? undefined,
			ac: v.ac ?? undefined,
			pd: v.pd ?? undefined,
			md: v.md ?? undefined,
			note: v.note,
			maxHp: v.maxHp ?? undefined,
			initiative: v.initiative ?? undefined,
		});
	}
</script>

{#if !store.ready}
	<p class="p-4 text-muted-foreground">…</p>
{:else if !combat}
	<p class="p-4 text-muted-foreground">Combat not found.</p>
{:else}
	<div class="mx-auto flex min-h-dvh max-w-md flex-col pb-28">
		<CombatHeader {combat} {controller} onAdd={() => (addOpen = true)} onStart={controller.start} />

		<main class="flex flex-1 flex-col gap-2 p-2">
			{#if display.length === 0}
				<div class="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
					<p class="font-medium">{m['setup.empty.title']()}</p>
				</div>
			{:else}
				{#each display as c (c.id)}
					<CombatantRow
						combatant={c}
						active={isActive(combat, c)}
						combatActive={active}
						{controller}
						onOpenNumpad={openNumpad}
						onEdit={openEdit}
					/>
				{/each}
			{/if}
		</main>

		{#if active}
			<!-- Active: Advance FAB (disabled at the r99 → r100 wrap) -->
			<Button
				class="fixed right-4 bottom-4 size-14 rounded-full shadow-lg"
				disabled={!canAdv}
				aria-label={m['active.advance']()}
				onclick={controller.advance}
			>
				<Advance class="size-6" />
			</Button>
		{:else}
			<!-- Setup: persistent Add Combatant bar (Start lives in the header once the roster isn't empty) -->
			<div class="fixed inset-x-0 bottom-0 mx-auto flex max-w-md gap-2 border-t bg-background p-2">
				<Button variant="secondary" class="h-12 flex-1 text-base" onclick={() => (addOpen = true)}>
					<Add class="size-5" />
					{m['setup.addCombatant']()}
				</Button>
			</div>
		{/if}
	</div>

	<NumpadSheet
		combatant={numpadCombatant}
		bind:open={numpadOpen}
		onDamage={controller.damage}
		onRestore={controller.restore}
		onSetTempHp={controller.setTempHp}
	/>
	<CombatantForm mode="add" combatActive={active} bind:open={addOpen} onSubmit={submitAdd} />
	<CombatantForm mode="edit" combatant={editCombatant} bind:open={editOpen} onSubmit={submitEdit} />
{/if}
