<script lang="ts">
	import { onMount } from 'svelte';
	import AppShell from '$lib/components/app/AppShell.svelte';
	import { applyTheme } from '$lib/theme';
	import { store } from '$lib/stores';
	import './layout.css';

	// TODO M-phase: AppShell still needs the Toaster / InstallBanner / ConfirmDialog global
	// singletons (specs/reference/component-inventory.md Hierarchy / Global chrome placement) —
	// out of unit 006 Phase 1's scope (AppShell + per-breakpoint nav only).
	let { children } = $props();

	onMount(async () => {
		await store.hydrate();
	});

	// SET-2/theme-boot fix: resolve+apply the theme at the app root (not the Settings page) so
	// it stays correct across every route and a full reload. Reactive on `store.settings.theme`.
	$effect(() => {
		const cleanup = applyTheme(store.settings.theme);
		return cleanup;
	});
</script>

<!--
  SET-1: keying the subtree on the active locale forces every `m[...]()` call-site to re-render
  when the language changes (Settings calls `setLocale(..., { reload: false })`), without a full
  page reload — Paraglide's `getLocale()`/`m[...]()` aren't themselves reactive to Svelte, so this
  keyed block is the reactive seam that makes the switch apply instantly.
-->
{#key store.settings.language}
	<AppShell>
		{@render children()}
	</AppShell>
{/key}
