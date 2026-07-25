<!--
  TagChip — a Badge-shaped, `--tc`-colorized tag chip (color hashed from the tag name via
  `tagAccent`) using the shared `chipAccentClass` card-chip formula. When `removable`, a trailing
  ✕ is always visible; tapping/clicking it (or activating it via keyboard) removes the tag in one
  tap — no hold gesture, no confirm/undo (decision 3).
-->
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import { chipAccentClass, tagAccent } from './labels';

	let {
		name,
		removable = false,
		onRemove,
		class: className,
	}: {
		name: string;
		removable?: boolean;
		onRemove?: (name: string) => void;
		/** Extra chip classes. Drawer call sites pass `touch-none` so a swipe started on a chip
		    reaches vaul instead of being claimed as a scroll pan; list call sites leave it off so
		    the page still scrolls when dragged from a chip. */
		class?: string;
	} = $props();

	const CloseIcon = chromeIcon.close;
</script>

<Badge variant="outline" style="--tc: {tagAccent(name)}" class={[chipAccentClass, className]}>
	{name}
	{#if removable}
		<button
			type="button"
			class="-mr-1 inline-flex items-center rounded-full hover:text-foreground"
			aria-label={m['a11y.tags.remove']({ name })}
			onclick={() => onRemove?.(name)}
		>
			<CloseIcon class="size-3.5" />
		</button>
	{/if}
</Badge>
