<!--
  FAB (component-inventory.md "Floating action button (FAB)") — shared bottom-right thumb-zone floating action button. The
  `action` prop's meaning (create / add / advance) is decided by the screen that wires it in
  (Combats home = create; Combat Setup = add; Combat Active = advance) — this component only
  renders the fixed-position circular Button + icon + a11y label, it carries no screen logic.
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { IconComponent } from '$lib/icons';

	let {
		icon,
		label,
		onclick,
		disabled = false,
		class: className,
		'aria-busy': ariaBusy,
	}: {
		icon: IconComponent;
		label: string;
		onclick: () => void;
		disabled?: boolean;
		class?: string;
		'aria-busy'?: boolean;
	} = $props();

	const Icon = $derived(icon);
</script>

<Button
	size="fab"
	class={['fixed right-4 bottom-safe shadow-lg', className]}
	{disabled}
	aria-label={label}
	aria-busy={ariaBusy}
	{onclick}
>
	<Icon class="size-6" />
</Button>
