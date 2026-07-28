<script lang="ts">
	import { onMount } from 'svelte';
	import AppShell from '$lib/components/app/AppShell.svelte';
	import { applyTheme } from '$lib/theme';
	import { store } from '$lib/stores';
	import { Toaster, toast } from '$lib/components/ui/sonner';
	import { m, setLocale } from '$lib/i18n';
	import { needRefresh, updateServiceWorker } from '$lib/pwa/register';
	import './layout.css';

	// TODO M-phase: AppShell still needs the ConfirmDialog global singleton — out of unit 006
	// Phase 1's scope (AppShell + per-breakpoint nav only). The Toaster singleton is mounted
	// below (W-003 Phase 3); InstallBanner is mounted inside AppShell.
	let { children } = $props();

	onMount(async () => {
		// `store.hydrate()` never rejects — a failure sets `store.hydrateError`, which `AppShell`
		// renders on every route (deep links never run `+page.ts`'s `load`, so this is the only
		// boundary they get). Once hydrate settles, push the persisted locale (Dexie) into
		// Paraglide's own runtime (localStorage) — the two owners are otherwise only reconciled
		// when the Settings select fires, so a fresh device/reload would show English until a
		// Settings visit.
		await store.hydrate();
		setLocale(store.settings.language, { reload: false });
	});

	// Theme-boot fix: resolve+apply the theme at the app root (not the Settings page) so
	// it stays correct across every route and a full reload. Reactive on `store.settings.theme`.
	$effect(() => {
		const cleanup = applyTheme(store.settings.theme);
		return cleanup;
	});

	// Update-available toast (ADR-004, registerType: 'prompt'). `$needRefresh` is the
	// plugin's own Svelte store, so this effect only reruns when the store's value actually
	// flips (false -> true, once per waiting worker) — not on every unrelated re-render, and
	// deliberately kept outside the `{#key store.settings.language}` subtree below so a
	// language switch can never re-fire it. Non-expiring (`duration: Infinity`): the user
	// must be able to act whenever they notice it.
	$effect(() => {
		if ($needRefresh) {
			toast(m['toasts.update.message'](), {
				duration: Number.POSITIVE_INFINITY,
				action: {
					label: m['toasts.update.action'](),
					onClick: () => updateServiceWorker(true),
				},
			});
		}
	});
</script>

<!--
  Keying the subtree on the active locale forces every `m[...]()` call-site to re-render
  when the language changes (Settings calls `setLocale(..., { reload: false })`), without a full
  page reload — Paraglide's `getLocale()`/`m[...]()` aren't themselves reactive to Svelte, so this
  keyed block is the reactive seam that makes the switch apply instantly. Gated on `store.ready`:
  while booting, the key is the constant `false`, so hydrate flipping `store.settings.language`
  from the `createSettings()` default to the persisted locale does not itself remount every page.
  Once `ready` is true the key tracks `store.settings.language` directly, so only a real
  user-initiated switch (Settings) remounts the tree afterward.
-->
{#key store.ready && store.settings.language}
	<AppShell>
		{@render children()}
	</AppShell>
{/key}

<Toaster theme={store.settings.theme} />
