<!--
  ResponsiveModal — the app-level composition layer over ui/dialog and ui/drawer. Every adaptive
  modal in the app renders through this instead of hand-rolling its own
  `isDesktop ? Dialog : Drawer` pair. It owns, in one place: the breakpoint split, a scroll region
  that always exists (killing the desktop off-viewport defect), a footer that is sticky by
  construction (outside the scroll region, never nested inside it), the optional `<form>` wrapper
  needed for `type="submit"` footers, the two size tokens, the fixed chrome (border/radius/title
  type/safe-area padding), and the drawer-only touch policy (text-input pan axis + the at-top
  scroll-region guard; vaul's own gesture layer needs both, desktop dialogs neither). See
  specs/adr/ADR-014.md and the W-032 plan.
-->
<script lang="ts" module>
	/** Marks a drawer scroll container with `data-scroll-at-top` so the touch policy in the style
	 *  block below can hand the at-top down-swipe to vaul instead of the browser. Exported only
	 *  for call sites that own an extra scroll container inside a drawer (CombatantFormBody's
	 *  template list); the policy itself stays in this file. */
	export function drawerScrollGuard(node: HTMLElement) {
		const sync = () =>
			node.setAttribute('data-scroll-at-top', node.scrollTop < 1 ? 'true' : 'false');
		sync();
		node.addEventListener('scroll', sync, { passive: true });
		return () => node.removeEventListener('scroll', sync);
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '$lib/components/ui/drawer';
	import { cn } from '$lib/utils.js';

	/** The only sizing control — no raw `max-w`/class passthrough on purpose (see plan §Invariants 5). */
	const SIZE_CLASS = {
		form: { desktop: 'sm:max-w-[400px]', mobile: 'max-w-md' },
		compact: { desktop: 'sm:max-w-sm', mobile: 'max-w-sm' },
	} as const;

	let {
		open = $bindable(false),
		title,
		hideTitle = false,
		size = 'form',
		onSubmit,
		onOpenChange,
		children,
		footer,
	}: {
		open?: boolean;
		/** Required (ADR-014): omitting it left bits-ui with no `DialogTitle`/`DrawerTitle`, so
		 *  `aria-labelledby` pointed at nothing and the dialog opened with no accessible name. */
		title: string;
		/** Hides the header visually while keeping the DialogTitle/DrawerTitle in the a11y tree —
		 *  the accessible-name invariant (ADR-014) holds, only the visible chrome goes away. For
		 *  surfaces whose body already names itself (NumpadSheet's summary row). */
		hideTitle?: boolean;
		size?: 'form' | 'compact';
		/** Present -> body + footer are wrapped in a single `<form>` so `type="submit"` footer
		 *  buttons share it with the fields, even though the footer sits outside the scroller. */
		onSubmit?: () => void;
		/** Fires on every open/close, including the dismissals that never touch caller code —
		 *  Escape, backdrop click, vaul's swipe-down. Callers that keep form state alive across
		 *  closes re-seed from here; `bind:open` alone cannot see who closed the modal. */
		onOpenChange?: (open: boolean) => void;
		children: Snippet;
		footer?: Snippet;
	} = $props();

	const isDesktop = new MediaQuery('(min-width: 1024px)');
</script>

{#snippet shell(isDrawer = false)}
	<!-- `overflow-y-auto` makes overflow-x compute to `auto` too, so this box clips on both axes.
	     The negative-margin/padding pairs give focus rings and selected-state rings (`ring-2
	     ring-offset-2` = 4px outside the element box) room to draw inside the clip rect without
	     changing the region's outer geometry — `px-3` horizontally, `py-1` vertically. Drop either
	     and rings on edge-adjacent controls get cut (W-032). `drawerScrollGuard` only makes sense
	     on the drawer branch — the desktop Dialog never consults `data-scroll-at-top`. -->
	<div
		{@attach isDrawer ? drawerScrollGuard : () => {}}
		class="-mx-3 -my-1 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-1"
	>
		{@render children()}
	</div>
	{#if footer}
		{@render footer()}
	{/if}
{/snippet}

{#snippet wrapper(isDrawer = false)}
	{#if onSubmit}
		<form
			class="flex min-h-0 flex-1 flex-col gap-3"
			onsubmit={(e) => {
				e.preventDefault();
				onSubmit();
			}}
		>
			{@render shell(isDrawer)}
		</form>
	{:else}
		<div class="flex min-h-0 flex-1 flex-col gap-3">
			{@render shell(isDrawer)}
		</div>
	{/if}
{/snippet}

{#if isDesktop.current}
	<Dialog bind:open {onOpenChange}>
		<DialogContent
			class={cn(
				'flex max-h-[calc(100dvh-2rem)] flex-col rounded-lg border border-[var(--border-strong)] ring-0',
				SIZE_CLASS[size].desktop,
			)}
		>
			<DialogHeader class={hideTitle ? 'sr-only' : undefined}>
				<DialogTitle class="text-lg font-semibold">{title}</DialogTitle>
			</DialogHeader>

			{@render wrapper()}
		</DialogContent>
	</Dialog>
{:else}
	<!-- `repositionInputs={false}`: vaul lifts the sheet itself when a field takes focus, on top of
	     the browser already shrinking the layout viewport for the on-screen keyboard. The two
	     adjustments stack, pushing the header off the top of the screen and leaving a tall blank
	     band under the content (seen on the tag drawer). The browser's own handling is enough. -->
	<Drawer bind:open {onOpenChange} repositionInputs={false}>
		<DrawerContent
			data-responsive-modal="drawer"
			class={cn('mx-auto flex max-h-[80dvh] flex-col', SIZE_CLASS[size].mobile)}
		>
			<DrawerHeader class={hideTitle ? 'sr-only' : undefined}>
				<DrawerTitle class="text-lg font-semibold">{title}</DrawerTitle>
			</DrawerHeader>

			<div class={cn('flex min-h-0 flex-1 flex-col px-4 pb-safe', hideTitle && 'pt-4')}>
				{@render wrapper(true)}
			</div>
		</DrawerContent>
	</Drawer>
{/if}

<style>
	/* vaul's drag-to-close gesture on the drawer shell competes with vertical text-input
	   scrolling/selection unless inputs opt out of the horizontal axis. Scoped to the drawer only
	   — desktop dialogs never go through vaul, so this policy has no business on the base
	   Input/Textarea components (see plan §Invariants 7 / W-029 / W-031). */
	:global([data-responsive-modal='drawer'] :is(input, textarea)) {
		touch-action: pan-y;
	}

	/* The scroll region is a scroll container BELOW the vaul shell, so the shell's own
	   `touch-action: none` never enters gesture arbitration for touches inside it: the browser
	   claims the vertical pan, and at scrollTop 0 a down-swipe scrolls nothing yet still gets
	   claimed (overscroll) — pointercancel kills vaul's close-drag mid-flight, the sheet snaps
	   back. Directional values name the SCROLL direction (`pan-down` = finger moving up), so at
	   top the browser keeps scroll-into-content and nothing else; the close swipe stays with
	   vaul. Chromium-only value behind @supports — non-Chromium keeps browser-default arbitration
	   (today's behavior). Scrolled state deliberately has no rule: vaul's shouldDrag already
	   refuses close-drags there. See the swipe-close report in specs/reports/. */
	@supports (touch-action: pan-down) {
		:global([data-responsive-modal='drawer'] [data-scroll-at-top='true']) {
			touch-action: pan-down;
		}
	}
</style>
