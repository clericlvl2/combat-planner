<!--
  ResponsiveModal — the app-level composition layer over ui/dialog and ui/drawer. Every adaptive
  modal in the app renders through this instead of hand-rolling its own
  `isDesktop ? Dialog : Drawer` pair. It owns, in one place: the breakpoint split, a scroll region
  that always exists (killing the desktop off-viewport defect), a footer that is sticky by
  construction (outside the scroll region, never nested inside it), the optional `<form>` wrapper
  needed for `type="submit"` footers, the two size tokens, the fixed chrome (border/radius/title
  type/safe-area padding), and the drawer-only touch policy for text inputs (vaul's own gesture
  layer needs it; desktop dialogs do not). See specs/adr/ADR-014.md and the W-032 plan.
-->
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
		size = 'form',
		onSubmit,
		children,
		footer,
	}: {
		open?: boolean;
		/** Omitted renders no header (NumpadSheet). */
		title?: string;
		size?: 'form' | 'compact';
		/** Present -> body + footer are wrapped in a single `<form>` so `type="submit"` footer
		 *  buttons share it with the fields, even though the footer sits outside the scroller. */
		onSubmit?: () => void;
		children: Snippet;
		footer?: Snippet;
	} = $props();

	const isDesktop = new MediaQuery('(min-width: 1024px)');
</script>

{#snippet shell()}
	<div class="-mx-3 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3">
		{@render children()}
	</div>
	{#if footer}
		{@render footer()}
	{/if}
{/snippet}

{#snippet wrapper()}
	{#if onSubmit}
		<form
			class="flex min-h-0 flex-1 flex-col gap-3"
			onsubmit={(e) => {
				e.preventDefault();
				onSubmit();
			}}
		>
			{@render shell()}
		</form>
	{:else}
		<div class="flex min-h-0 flex-1 flex-col gap-3">
			{@render shell()}
		</div>
	{/if}
{/snippet}

{#if isDesktop.current}
	<Dialog bind:open>
		<DialogContent
			class={cn(
				'flex max-h-[calc(100dvh-2rem)] flex-col rounded-lg border border-[var(--border-strong)] ring-0',
				SIZE_CLASS[size].desktop,
			)}
		>
			{#if title}
				<DialogHeader>
					<DialogTitle class="text-lg font-semibold">{title}</DialogTitle>
				</DialogHeader>
			{/if}

			{@render wrapper()}
		</DialogContent>
	</Dialog>
{:else}
	<Drawer bind:open>
		<DrawerContent
			data-responsive-modal="drawer"
			class={cn('mx-auto flex max-h-[80vh] flex-col', SIZE_CLASS[size].mobile)}
		>
			{#if title}
				<DrawerHeader>
					<DrawerTitle class="text-lg font-semibold">{title}</DrawerTitle>
				</DrawerHeader>
			{/if}

			<div class="flex min-h-0 flex-1 flex-col px-4 pb-safe">
				{@render wrapper()}
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
</style>
