<!--
  DesktopNav — the single
  shared desktop-only icon-nav row (Combats / Settings / About, current destination marked
  `.is-current`-equivalent via `aria-current`), consumed by both AppHeader and CombatHeader so the
  markup exists in exactly one place (unit-019 follow-up: the two headers used to duplicate this
  row). Rendered as a visually distinct trailing section (border-l divider) after each header's own
  page-control buttons, never interleaved with them.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';

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
</script>

<nav
	class="hidden shrink-0 items-center gap-1 border-l border-border pl-2 lg:flex"
	aria-label={m['nav.primary']()}
>
	{#each links as link (link.href)}
		{@const current = isCurrent(link.href)}
		{@const Icon = link.icon}
		<Button
			href={link.href}
			variant="ghost"
			size="touch"
			class={[current && 'bg-secondary text-secondary-foreground']}
			aria-label={link.label}
			aria-current={current ? 'page' : undefined}
			title={link.label}
		>
			<Icon class="size-5" />
		</Button>
	{/each}
</nav>
