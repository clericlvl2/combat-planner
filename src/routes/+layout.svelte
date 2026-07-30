<script lang="ts">
	import { onMount } from 'svelte';
	import AppShell from '$lib/components/app/AppShell.svelte';
	import { applyTheme } from '$lib/theme';
	import { store } from '$lib/stores';
	import { m, setLocale } from '$lib/i18n';
	import { needRefresh, updateServiceWorker } from '$lib/pwa/register';
	import './layout.css';

	// TODO M-phase: AppShell still needs the ConfirmDialog global singleton — out of unit 006
	// Phase 1's scope (AppShell + per-breakpoint nav only). The Toaster singleton is mounted
	// below (W-003 Phase 3); InstallBanner is mounted inside AppShell.
	let { children } = $props();

	// Lazy-mounted after first paint (W-041 Phase 5) — sonner's JS chunk plus `sonner.css` are the
	// only layout-exclusive boot bytes (ResponsiveModal already pulls in bits-ui/vaul on every
	// route via CombatFormDialog, so those aren't deferrable here). Safe because `svelte-sonner`'s
	// `toastState` (toast-state.svelte.js) is a module-level singleton independent of `<Toaster>`'s
	// lifetime: `create()`/`addToast()` push straight into `$state([])` on that singleton, so a
	// toast fired before this component mounts is simply queued and renders the moment it does.
	// The update-available toast below (`$effect` on `$needRefresh`) dynamically imports `toast`
	// itself rather than relying on this variable, so it never races the assignment below.
	let Toaster = $state<typeof import('$lib/components/ui/sonner').Toaster>();

	onMount(async () => {
		// Boot-shell teardown (src/app.html) — must be the *first* statement, before the `await`
		// below, and specifically before anything that can throw or suspend: reaching this line is
		// the app's only proof-of-life, and clearing the timer is what cancels the bounded failure
		// screen. Left until after the `await`, a slow IndexedDB round-trip on a weak device could
		// let the 15s timer fire over a perfectly healthy boot.
		clearTimeout(
			(window as unknown as { __cpBootTimer?: ReturnType<typeof setTimeout> }).__cpBootTimer,
		);
		document.getElementById('boot-failed')?.remove();

		// Fire-and-forget, independent of the hydrate await below — the sonner chunk has no
		// dependency on Dexie and no toast can fire before `window.load` (Phase 4), so there is no
		// urgency; this just keeps it off the critical boot path.
		import('$lib/components/ui/sonner').then(({ Toaster: loaded }) => {
			Toaster = loaded;
		});

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
			import('$lib/components/ui/sonner').then(({ toast }) => {
				toast(m['toasts.update.message'](), {
					duration: Number.POSITIVE_INFINITY,
					action: {
						label: m['toasts.update.action'](),
						onClick: () => updateServiceWorker(true),
					},
				});
			});
		}
	});
</script>

<!--
  Keying the subtree on the active locale forces every `m[...]()` call-site to re-render
  when the language changes (Settings calls `setLocale(..., { reload: false })`), without a full
  page reload — Paraglide's `getLocale()`/`m[...]()` aren't themselves reactive to Svelte, so this
  keyed block is the reactive seam that makes the switch apply instantly. Keyed directly on
  `store.settings.language`, not gated on `store.ready`: the store's initial value is now seeded
  from Paraglide's own localStorage mirror (`createBootSettings`, boot-settings.ts), so it already
  agrees with the persisted locale hydrate loads — hydrate no longer flips this key, so the
  `AppShell` subtree survives boot instead of being torn down and recreated the instant it
  resolves. Only a real user-initiated switch (Settings) remounts the tree afterward.
-->
{#key store.settings.language}
	<AppShell>
		{@render children()}
	</AppShell>
{/key}

{#if Toaster}
	<Toaster theme={store.settings.theme} />
{/if}
