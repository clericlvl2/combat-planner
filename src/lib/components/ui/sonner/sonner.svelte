<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'svelte-sonner';

	let { theme = 'system', ...restProps }: SonnerProps = $props();
</script>

<!--
	Typed toasts (success/error/warning/info) with stock svelte-sonner icons via richColors.
	Each type's --*-bg/--*-border/--*-text triple is derived from tokens.css swatches
	color-mixed over the popover surface (bg/border) and the popover foreground (text), so
	both themes resolve automatically through the raw `--combat-*`/`--health-dead`/`--popover`
	custom properties. Text uses 80% swatch + 20% foreground to clear WCAG AA (>= 4.5:1) on
	the 14%-tinted background in both themes. The per-toast `action` link is styled as an
	inline text link (no filled button).

	Enter motion override: a keyframe animation (not a transition), because svelte-sonner
	flips `data-mounted` in onMount, which Svelte 5 flushes before first paint — a transition
	would have no painted start value to interpolate from. Fill-mode is deliberately omitted
	so the animation doesn't permanently pin transform/opacity once it ends, leaving sonner's
	own exit/stacking transforms in control. Reduced-motion disables the animation entirely.
-->
<Sonner
	{theme}
	richColors
	class="toaster group"
	style="--normal-bg: var(--popover); --normal-text: var(--popover-foreground); --normal-border: var(--border);
		--success-bg: color-mix(in srgb, var(--combat-green) 14%, var(--popover));
		--success-border: color-mix(in srgb, var(--combat-green) 40%, var(--popover));
		--success-text: color-mix(in srgb, var(--combat-green) 80%, var(--popover-foreground));
		--error-bg: color-mix(in srgb, var(--health-dead) 14%, var(--popover));
		--error-border: color-mix(in srgb, var(--health-dead) 40%, var(--popover));
		--error-text: color-mix(in srgb, var(--health-dead) 80%, var(--popover-foreground));
		--warning-bg: color-mix(in srgb, var(--combat-amber) 14%, var(--popover));
		--warning-border: color-mix(in srgb, var(--combat-amber) 40%, var(--popover));
		--warning-text: color-mix(in srgb, var(--combat-amber) 80%, var(--popover-foreground));
		--info-bg: color-mix(in srgb, var(--combat-blue) 14%, var(--popover));
		--info-border: color-mix(in srgb, var(--combat-blue) 40%, var(--popover));
		--info-text: color-mix(in srgb, var(--combat-blue) 80%, var(--popover-foreground));"
	toastOptions={{
		classes: {
			actionButton:
				'!bg-transparent !text-current !px-0 !h-auto !font-medium underline underline-offset-2 hover:!opacity-80',
		},
	}}
	{...restProps}
/>

<style>
	:global(.toaster [data-sonner-toast]) {
		animation: toast-in 420ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	@keyframes -global-toast-in {
		from {
			opacity: 0;
			transform: translateY(140%);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.toaster [data-sonner-toast]) {
			animation: none;
		}
	}
</style>
