/* ---------------------------------------------------------------------------
 * Combat Planner — JS-side mirror of the motion scale (src/lib/styles/tokens.css).
 * Svelte's `transition:`/`animate:` directives take numeric milliseconds, not a
 * CSS custom property, so the `--dur-*` values are restated here as numbers.
 * Keep DUR in sync with tokens.css by hand — there is no build-time bridge.
 *
 * Reduced motion is honoured twice on purpose: CSS-driven motion by the global
 * `prefers-reduced-motion` block in src/routes/layout.css, and JS-driven motion
 * (Svelte transition:/animate:) here, because a media query cannot reach a
 * Svelte directive's duration option.
 * ------------------------------------------------------------------------- */

import { MediaQuery } from 'svelte/reactivity';

/** Mirrors --dur-fast / --dur-base / --dur-slow in src/lib/styles/tokens.css. */
export const DUR = { fast: 120, base: 200, slow: 320 } as const;

/** Reactive `prefers-reduced-motion: reduce` signal, mirroring the shipped
 *  `MediaQuery` idiom in ResponsiveModal.svelte. */
export const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

/** Zeroes a Svelte transition/animate duration when reduced motion is active. */
export function dur(ms: number): number {
	return reducedMotion.current ? 0 : ms;
}
