<!--
  AppHeader (Component Inventory §Hierarchy / §Navigation placement per breakpoint, PLT-3) — the
  app-wide chrome bar mounted by AppShell above every non-Combat route outlet (the Combat screen
  ships its own CombatHeader — back/title/overflow — and AppShell skips this bar there, see
  AppShell's routeHasOwnHeader guard). Below the desktop breakpoint it renders a burger button
  that opens NavSidebar (tablet's "burger → Sheet" mode, the same overlay NavSidebar's own
  swipe-right gesture opens on mobile); at the desktop breakpoint it swaps in `.nav-desktop`'s
  inline three icon buttons (Combats / Settings / About), the current destination marked
  `.is-current` (PLT-3 AC). Page-specific header actions (e.g. Combats home's desktop "+" create
  button, PLT-3) are each route's own concern, not this shared chrome's.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
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

<header class="flex h-13 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
	<Button
		variant="ghost"
		size="icon"
		class="min-h-11 min-w-11 lg:hidden"
		aria-label={m['nav.open']()}
		onclick={onOpenNav}
	>
		<Menu class="size-5" />
	</Button>

	<span class="min-w-0 flex-1 truncate text-lg font-semibold">{title}</span>

	<nav class="hidden items-center gap-1 lg:flex" aria-label={m['nav.primary']()}>
		{#each links as link (link.href)}
			{@const current = isCurrent(link.href)}
			{@const Icon = link.icon}
			<Button
				href={link.href}
				variant="ghost"
				size="icon"
				class={['min-h-11 min-w-11', current && 'bg-secondary text-secondary-foreground']}
				aria-label={link.label}
				aria-current={current ? 'page' : undefined}
				title={link.label}
			>
				<Icon class="size-5" />
			</Button>
		{/each}
	</nav>

	{#if headerAction.current}
		<div class="hidden lg:flex">
			{@render headerAction.current()}
		</div>
	{/if}
</header>
