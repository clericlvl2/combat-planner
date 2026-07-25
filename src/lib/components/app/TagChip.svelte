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
		/** Extra chip classes. No `touch-action` override needed (W-029/W-031): a chip has no
		    native caret/selection gesture, so vaul's shouldDrag already treats a drag started on
		    one like plain drawer content. */
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
