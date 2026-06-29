<script lang="ts">
	import { page } from '$app/state';
	// TODO M-phase: Combat detail (UX §4 / Component Inventory §6–§10) — CombatHeader,
	// CombatantList, Start bar / FAB, NumpadSheet, forms. Setup ⇄ Active states.
	const id = $derived(page.params.id);
</script>

<h1>Combat {id}</h1>
