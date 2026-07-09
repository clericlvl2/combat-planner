<!--
  FAB (Component Inventory §7/§5) — shared bottom-right thumb-zone floating action button. The
  `action` prop's meaning (create / add / advance) is decided by the screen that wires it in
  (Combats home = create; Combat Setup = add; Combat Active = advance) — this component only
  renders the fixed-position circular Button + icon + a11y label, it carries no screen logic.
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { IconComponent } from '$lib/icons';
	import { cn } from '$lib/utils';

	let {
		icon,
		label,
		onclick,
		disabled = false,
		class: className,
	}: {
		icon: IconComponent;
		label: string;
		onclick: () => void;
		disabled?: boolean;
		class?: string;
	} = $props();

	const Icon = $derived(icon);
</script>

<Button
	class={cn('fixed right-4 bottom-4 size-14 rounded-full shadow-lg', className)}
	{disabled}
	aria-label={label}
	{onclick}
>
	<Icon class="size-6" />
</Button>
