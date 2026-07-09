<script lang="ts">
	import { onMount } from 'svelte';
	import AppShell from '$lib/components/app/AppShell.svelte';
	import { store } from '$lib/stores';
	import './layout.css';

	// TODO M-phase: AppShell still needs the Toaster / InstallBanner / ConfirmDialog global
	// singletons (specs/reference/component-inventory.md Hierarchy / Global chrome placement) —
	// out of unit 006 Phase 1's scope (AppShell + per-breakpoint nav only).
	let { children } = $props();

	onMount(async () => {
		await store.hydrate();
	});
</script>

<AppShell>
	{@render children()}
</AppShell>
