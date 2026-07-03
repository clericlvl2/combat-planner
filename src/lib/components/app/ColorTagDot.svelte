<!--
  ColorTagDot (Component Inventory §5, ADR-012) — bespoke swatch dot for a combat's `colorTag`.
  Renders one of the 8 token-driven `bg-combat-*` utilities (layout.css); status is never
  color-alone, so it carries a role=img a11y label naming the swatch.
-->
<script lang="ts">
	import type { ColorTag } from '$lib/db/types';
	import { m } from '$lib/i18n';

	let { colorTag, class: className }: { colorTag: ColorTag; class?: string } = $props();

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
	class={['inline-block size-3 shrink-0 rounded-full', colorTagBg[colorTag], className]}
	role="img"
	aria-label={m['a11y.colorTag']({ color: colorTagLabel[colorTag]() })}
></span>
