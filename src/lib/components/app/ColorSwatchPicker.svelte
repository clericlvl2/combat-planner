<!--
  ColorSwatchPicker (component-inventory.md, CLS-2, ADR-012) — selectable row of the 8 preset color-tag
  swatches, used by CombatFormDialog (create/edit). Single-select `ToggleGroup` (same pattern as
  CombatantForm's type toggle); each item wraps a `ColorTagDot` so the selected swatch is never
  color-alone (an a11y label + selected outline both carry the state).
-->
<script lang="ts">
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group';
	import { COLOR_TAGS, type ColorTag } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import ColorTagDot from './ColorTagDot.svelte';

	let { value = $bindable('neutral') }: { value?: ColorTag } = $props();

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

	/** ColorTag key -> tile letter (prototype .swatch recipe) — fixed to the key, not the localized
	 * label, so locales whose color names collide on first letter (e.g. "green"/"violet") never
	 * render duplicate letters. The color name itself is still carried by the aria-label. */
	const colorTagLetter: Record<ColorTag, string> = {
		neutral: 'N',
		red: 'R',
		orange: 'O',
		amber: 'A',
		green: 'G',
		teal: 'T',
		blue: 'B',
		violet: 'V',
	};

	function handle(next: string) {
		if (next) value = next as ColorTag;
	}
</script>

<ToggleGroup
	type="single"
	value={value satisfies string}
	onValueChange={handle}
	spacing={2}
	class="w-full"
>
	{#each COLOR_TAGS as tag (tag)}
		<ToggleGroupItem
			value={tag}
			aria-label={colorTagLabel[tag]()}
			class="h-9 flex-1 min-w-0 cursor-pointer rounded-md border-0 bg-transparent p-0 transition-opacity hover:bg-transparent hover:opacity-80 data-[state=on]:bg-transparent data-[state=on]:opacity-100 data-[state=on]:ring-2 data-[state=on]:ring-offset-2 data-[state=on]:ring-offset-background data-[state=on]:ring-foreground"
		>
			<ColorTagDot colorTag={tag} letter={colorTagLetter[tag]} class="size-full" />
		</ToggleGroupItem>
	{/each}
</ToggleGroup>
