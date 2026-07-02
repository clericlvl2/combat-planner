<script lang="ts">
	import { goto } from '$app/navigation';
	import { m } from '$lib/i18n';
	import { store } from '$lib/stores';

	// TODO M3 (UX §3 / Component Inventory §5): the real Combats home —
	// CombatList → CombatRow, FAB(create), ImportControl, EmptyState, CombatFormDialog.
	// M2 has no home: once the store is ready, jump straight to the (seeded) combat.
	$effect(() => {
		if (store.ready && store.combats[0]) {
			goto(`/combats/${store.combats[0].id}`, { replaceState: true });
		}
	});
</script>

<h1 class="sr-only">{m['combats.title']()}</h1>
