<!--
  NavSidebar (component-inventory.md "Hierarchy" / "Navigation placement per breakpoint", PLT-3) — the
  mobile/tablet nav overlay: links to Combats / Settings / About. Opened either by AppHeader's
  burger button (bound `open`, tablet's mode) or by swiping right from the left screen edge on
  touch devices (mobile's mode, PLT-3 AC "swiping right on mobile opens a sidebar containing
  links to Combats, Settings, and About"). Desktop relies on AppHeader's inline `.nav-desktop`
  icon row instead — this component still mounts there but is only reachable by an edge swipe.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { Sheet, SheetContent, SheetHeader, SheetTitle } from '$lib/components/ui/sheet';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const links = $derived([
		{ href: '/combats', label: m['nav.combats'](), icon: chromeIcon.navCombats },
		{ href: '/settings', label: m['nav.settings'](), icon: chromeIcon.navSettings },
		{ href: '/about', label: m['nav.about'](), icon: chromeIcon.navAbout },
	]);

	function isCurrent(href: string) {
		const path = page.url.pathname;
		if (href === '/combats') return path === '/' || path.startsWith('/combats');
		return path.startsWith(href);
	}

	// Swipe-right-from-left-edge gesture (PLT-3's mobile trigger). Touch-only — it never
	// interferes with mouse/pointer interaction on tablet/desktop, which rely on the burger
	// button or the inline nav-desktop icons instead.
	const EDGE_ZONE_PX = 24;
	const SWIPE_THRESHOLD_PX = 60;
	let startX: number | null = null;
	let startY: number | null = null;

	function onTouchStart(e: TouchEvent) {
		if (open) return;
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
		if (dx > SWIPE_THRESHOLD_PX && Math.abs(dy) < SWIPE_THRESHOLD_PX) {
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

<Sheet bind:open>
	<SheetContent side="left" class="w-64 gap-0 p-0">
		<SheetHeader class="border-b border-border">
			<SheetTitle class="text-lg font-semibold">{m['about.appName']()}</SheetTitle>
		</SheetHeader>
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
	</SheetContent>
</Sheet>
