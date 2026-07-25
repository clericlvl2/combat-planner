<!--
  NavSidebar — the
  mobile/tablet nav overlay: links to Combats / Settings / About. Opened either by AppHeader's
  burger button (bound `open`, tablet's mode) or by swiping right from the left screen edge on
  touch devices (mobile's mode: swiping right on mobile opens a sidebar containing
  links to Combats, Settings, and About). Desktop relies on AppHeader's inline `.nav-desktop`
  icon row instead — this component still mounts there but is only reachable by an edge swipe.
  Vaul Drawer (direction="left"), transform-animated — same primitive as the bottom sheets,
  which also gets swipe-left-to-close for free.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '$lib/components/ui/drawer';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const links = $derived([
		{ href: '/combats', label: m['nav.combats'](), icon: chromeIcon.navCombats },
		{ href: '/library', label: m['nav.library'](), icon: chromeIcon.navLibrary },
		{ href: '/settings', label: m['nav.settings'](), icon: chromeIcon.navSettings },
		{ href: '/about', label: m['nav.about'](), icon: chromeIcon.navAbout },
	]);

	function isCurrent(href: string) {
		const path = page.url.pathname;
		if (href === '/combats') return path === '/' || path.startsWith('/combats');
		return path.startsWith(href);
	}

	// Swipe-right-from-left-edge gesture (the mobile nav trigger). Touch-only — it never
	// interferes with mouse/pointer interaction on tablet/desktop, which rely on the burger
	// button or the inline nav-desktop icons instead.
	// EDGE_ZONE_PX is 80, not the visually-narrower 24 you'd expect: Android gesture navigation
	// reserves a ~24-48dp back-gesture exclusion strip along the screen edge and swallows any
	// touch that starts inside it before the page ever sees a touchstart. 80px keeps the gesture
	// edge-anchored while landing outside that strip on every Android OEM variant.
	const EDGE_ZONE_PX = 80;
	const SWIPE_THRESHOLD_PX = 60;
	let startX: number | null = null;
	let startY: number | null = null;

	function onTouchStart(e: TouchEvent) {
		if (open) return;
		// A horizontal drag starting inside an open overlay (drawer/dialog) should not also pull
		// the nav in from underneath it.
		if ((e.target as Element | null)?.closest?.('[data-vaul-drawer],[role="dialog"]')) return;
		const touch = e.touches[0];
		if (!touch || touch.clientX > EDGE_ZONE_PX) {
			startX = null;
			startY = null;
			return;
		}
		startX = touch.clientX;
		startY = touch.clientY;
	}

	function onTouchMove(e: TouchEvent) {
		if (startX === null || startY === null) return;
		const touch = e.touches[0];
		if (!touch) return;
		const dx = touch.clientX - startX;
		const dy = touch.clientY - startY;
		// Horizontal dominance, not just a small-enough dy: the widened edge zone must not steal
		// vertical list scrolling that happens to drift slightly sideways.
		if (dx > SWIPE_THRESHOLD_PX && dx > Math.abs(dy) * 2) {
			open = true;
			startX = null;
			startY = null;
		}
	}

	function onTouchEnd() {
		startX = null;
		startY = null;
	}
</script>

<svelte:window ontouchstart={onTouchStart} ontouchmove={onTouchMove} ontouchend={onTouchEnd} />

<Drawer bind:open direction="left" shouldScaleBackground={false}>
	<DrawerContent class="!w-64 gap-0 p-0 !rounded-none [&>[data-vaul-handle]]:!hidden">
		<DrawerHeader class="border-b border-border">
			<DrawerTitle class="text-lg font-semibold">{m['about.appName']()}</DrawerTitle>
		</DrawerHeader>
		<DrawerClose>
			{#snippet child({ props })}
				{@const CloseIcon = chromeIcon.close}
				<Button variant="ghost" size="icon" class="absolute top-3 right-3" {...props}>
					<CloseIcon class="size-4" />
					<span class="sr-only">{m['a11y.close']()}</span>
				</Button>
			{/snippet}
		</DrawerClose>
		<nav class="flex flex-col gap-1 p-2" aria-label={m['nav.primary']()}>
			{#each links as link (link.href)}
				{@const current = isCurrent(link.href)}
				{@const Icon = link.icon}
				<a
					href={link.href}
					class={[
						'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
						current ? 'bg-secondary text-secondary-foreground' : 'text-foreground hover:bg-muted',
					]}
					aria-current={current ? 'page' : undefined}
					onclick={() => (open = false)}
				>
					<Icon class="size-5" aria-hidden="true" />
					{link.label}
				</a>
			{/each}
		</nav>
	</DrawerContent>
</Drawer>
