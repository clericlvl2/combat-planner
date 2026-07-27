<!--
  InstallBanner — the subtle, once-and-dismissible install hint (ADR-004). Mounted once by
  AppShell alongside NavSidebar (this shell's other always-mounted, conditionally-visible
  overlay). Stashes the `beforeinstallprompt` event (browsers only fire it once per navigation
  and expect `preventDefault()` up front if you want to replay it later) and renders in normal
  document flow, not fixed — the mobile FAB (combats-list/combat-screen `.bottom-safe`) owns the
  bottom of the viewport, so this banner sits above `<main>` instead of contesting it.
-->
<script module lang="ts">
	/** The subset of `beforeinstallprompt`'s event shape this banner needs — not in lib.dom, and
	 * `svelte:window`'s own typings (svelte/elements.d.ts) hard-code `onbeforeinstallprompt` to
	 * plain `Event` rather than deriving from `WindowEventMap`, so the handler below narrows via
	 * a cast instead of a `WindowEventMap` augmentation. */
	interface BeforeInstallPromptEvent extends Event {
		prompt(): Promise<void>;
		readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
	}
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { Settings } from '$lib/db/types';
	import { m } from '$lib/i18n';

	/** Narrow store surface this banner needs — lets tests pass a plain spy object. */
	export interface InstallBannerStore {
		settings: Pick<Settings, 'installHintDismissed'>;
		updateSettings(patch: Partial<Omit<Settings, 'id'>>): void;
	}

	let { store }: { store: InstallBannerStore } = $props();

	// Evaluated once at mount — client-only SPA (ADR-001), so `window` is always available here.
	// display-mode doesn't flip mid-session (a standalone launch stays standalone), so this
	// doesn't need to be reactive.
	const standalone = window.matchMedia('(display-mode: standalone)').matches;

	let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);

	function onBeforeInstallPrompt(e: Event) {
		// Chrome only offers a replay if the default is suppressed up front.
		e.preventDefault();
		deferredPrompt = e as BeforeInstallPromptEvent;
	}

	const visible = $derived(
		deferredPrompt !== null && !store.settings.installHintDismissed && !standalone,
	);

	async function onInstall() {
		const prompt = deferredPrompt;
		if (!prompt) return;
		// A stashed prompt event can only be consumed once — drop the reference immediately so the
		// banner never lingers pointed at a dead action, regardless of the user's choice.
		deferredPrompt = null;
		await prompt.prompt();
	}

	function onDismiss() {
		store.updateSettings({ installHintDismissed: true });
	}
</script>

<svelte:window onbeforeinstallprompt={onBeforeInstallPrompt} />

{#if visible}
	<div
		class="flex flex-wrap items-center gap-3 border-b border-border bg-secondary px-4 py-2 text-secondary-foreground"
	>
		<p class="min-w-0 flex-1 text-sm">{m['toasts.install.message']()}</p>
		<div class="flex items-center gap-2">
			<Button size="action" onclick={onInstall}>{m['toasts.install.action']()}</Button>
			<Button size="action" variant="ghost" onclick={onDismiss}>{m['toasts.install.dismiss']()}</Button>
		</div>
	</div>
{/if}
