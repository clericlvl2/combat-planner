<script lang="ts">
	import { onMount } from 'svelte';
	import { seedDemoCombat } from '$lib/dev-seed';
	import { store } from '$lib/stores';
	import './layout.css';

	// TODO M-phase: this becomes the full AppShell — mounts NavSidebar/AppHeader, Toaster,
	// InstallBanner, ConfirmDialog singletons + the route outlet (Component Inventory §2/§3).
	// For M2 it just boots the store (hydrate-on-mount, ADR-002/003) and seeds the demo combat.
	let { children } = $props();

	onMount(async () => {
		await store.hydrate();
		seedDemoCombat();
	});
</script>

{@render children()}
