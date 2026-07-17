<!--
  AppHeader — the
  app-wide chrome bar mounted by AppShell above every non-Combat route outlet (the Combat screen
  ships its own CombatHeader — back/title/overflow — and AppShell skips this bar there, see
  AppShell's routeHasOwnHeader guard). Below the desktop breakpoint it renders a burger button
  that opens NavSidebar (tablet's "burger → Sheet" mode, the same overlay NavSidebar's own
  swipe-right gesture opens on mobile); at the desktop breakpoint it renders the shared DesktopNav
  component after any page-specific header action, as a visually distinct trailing section.
  Page-specific header actions (e.g. Combats home's desktop "+" create button) are each
  route's own concern, not this shared chrome's, and render before the nav group.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import DesktopNav from './DesktopNav.svelte';
	import { headerAction } from './header-action.svelte';

	let { onOpenNav }: { onOpenNav: () => void } = $props();

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

	const title = $derived(links.find((link) => isCurrent(link.href))?.label ?? m['nav.combats']());

	const Menu = chromeIcon.menu;
</script>

<header class="flex h-13 shrink-0 items-center border-b border-border bg-card">
	<div class="content-container-wide flex w-full items-center gap-2">
		<Button
			variant="ghost"
			size="icon"
			class="-ml-3 min-h-11 min-w-11 lg:hidden"
			aria-label={m['nav.open']()}
			onclick={onOpenNav}
		>
			<Menu class="size-5" />
		</Button>

		<span class="min-w-0 flex-1 truncate text-lg font-semibold">{title}</span>

		{#if headerAction.current}
			<div class="hidden lg:flex">
				{@render headerAction.current()}
			</div>
		{/if}

		<DesktopNav />
	</div>
</header>
