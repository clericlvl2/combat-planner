<!--
  ColorTagDot (component-inventory.md, CLS-1, ADR-012) — bespoke swatch dot for a combat's `colorTag`.
  Renders one of the 8 token-driven `bg-combat-*` utilities (layout.css); status is never
  color-alone, so it carries a role=img a11y label naming the swatch. The optional `letter`
  (the combat's title initial) is a purely visual row-disambiguator per the approved template —
  aria-hidden, since the color name is already carried by the aria-label.
-->
<script lang="ts">
	import type { ColorTag } from '$lib/db/types';
	import { m } from '$lib/i18n';

	let {
		colorTag,
		letter,
		class: className,
	}: { colorTag: ColorTag; letter?: string; class?: string } = $props();

	/** ColorTag key -> `bg-combat-*` utility (tokens defined once in layout.css, ADR-012). */
	const colorTagBg: Record<ColorTag, string> = {
		neutral: 'bg-combat-neutral',
		red: 'bg-combat-red',
		orange: 'bg-combat-orange',
		amber: 'bg-combat-amber',
		green: 'bg-combat-green',
		teal: 'bg-combat-teal',
		blue: 'bg-combat-blue',
		violet: 'bg-combat-violet',
	};

	/** ColorTag key -> label message fn (bracket-indexing `m` with a runtime key isn't type-safe). */
	const colorTagLabel: Record<ColorTag, () => string> = {
		neutral: m['forms.colorTag.neutral'],
		red: m['forms.colorTag.red'],
		orange: m['forms.colorTag.orange'],
		amber: m['forms.colorTag.amber'],
		green: m['forms.colorTag.green'],
		teal: m['forms.colorTag.teal'],
		blue: m['forms.colorTag.blue'],
		violet: m['forms.colorTag.violet'],
	};
</script>

<span
	class={[
		'inline-flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-on-semantic',
		colorTagBg[colorTag],
		className,
	]}
	role="img"
	aria-label={m['a11y.colorTag']({ color: colorTagLabel[colorTag]() })}
>
	{#if letter}
		<span aria-hidden="true">{letter}</span>
	{/if}
</span>
