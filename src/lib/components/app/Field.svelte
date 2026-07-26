<!--
  Field — the one true form-field wrapper: label + control, stacked in a `form-field-group`. Owns
  the field-label styling (uppercase, muted, small caps, `font-medium`) that CombatantForm,
  LibraryEntryFormDialog, CombatFormDialog, and NumberField each used to redeclare on their own —
  and had drifted between `font-medium`/`font-normal` before this component existed. `for` is
  optional: some labels (Type toggle, color tag, tags) describe a group rather than a single
  input with an id to point at.
-->
<script lang="ts" module>
	export const fieldLabelClass = 'text-xs font-medium uppercase tracking-wide text-muted-foreground';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Label } from '$lib/components/ui/label';

	let {
		label,
		for: htmlFor,
		children,
	}: {
		label: string;
		for?: string;
		children: Snippet;
	} = $props();
</script>

<div class="form-field-group">
	<Label for={htmlFor} class={fieldLabelClass}>{label}</Label>
	{@render children()}
</div>
