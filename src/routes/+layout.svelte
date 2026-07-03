<script lang="ts">
	import { onMount } from 'svelte';
	import { store } from '$lib/stores';
	import './layout.css';

	// TODO M-phase: this becomes the full AppShell — mounts NavSidebar/AppHeader, Toaster,
	// InstallBanner, ConfirmDialog singletons + the route outlet
	// (specs/reference/component-inventory.md Hierarchy / Global chrome placement).
	// For now it just boots the store (hydrate-on-mount, ADR-002/003).
	let { children } = $props();

	onMount(async () => {
		await store.hydrate();
	});
</script>

{@render children()}
