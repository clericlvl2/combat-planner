<!--
  FAB (component-inventory.md "Floating action button (FAB)") — shared bottom-right thumb-zone floating action button. The
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
	size="fab"
	class={cn('fixed right-4 bottom-[calc(1rem_+_env(safe-area-inset-bottom))] shadow-lg', className)}
	{disabled}
	aria-label={label}
	{onclick}
>
	<Icon class="size-6" />
</Button>
