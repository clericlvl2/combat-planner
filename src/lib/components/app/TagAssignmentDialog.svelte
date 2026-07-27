<!--
  TagAssignmentDialog — the shared tag-assignment surface, entry-agnostic (it doesn't know or
  care whether it's assigning tags to an already-saved template or a pending, not-yet-submitted
  one). Desktop (MediaQuery('(min-width: 1024px)')) renders a Dialog, mobile a Drawer — same split
  as ConditionPicker. A new-tag text input is pinned at the top (submits via onCreateTag, trimmed,
  empty ignored); every tag in the live `allTags` union renders below as a ToggleGroupItem-style
  chip colorized via tagAccent, mirroring ConditionPicker's selected/unselected styling exactly.
  Toggling off a tag's last remaining assignment makes it vanish from this list immediately —
  accepted behavior under the derived tag model (no snapshot-on-open special-casing).

  The new-tag input's local state lives in TagAssignmentBody, remounted via `{#key open}` every
  time the dialog opens — reset-on-open rather than reset-on-close so the field does not visibly
  blank out during vaul's exit animation (Phase 2, 2026-07-28 plan).
-->
<script lang="ts">
	import { m } from '$lib/i18n';
	import ResponsiveModal from './ResponsiveModal.svelte';
	import TagAssignmentBody from './TagAssignmentBody.svelte';

	let {
		open = $bindable(false),
		allTags,
		selected,
		onToggle,
		onCreateTag,
	}: {
		open?: boolean;
		allTags: string[];
		selected: string[];
		onToggle: (name: string) => void;
		onCreateTag: (name: string) => void;
	} = $props();
</script>

<ResponsiveModal bind:open title={m['library.tags.assign.title']()} size="compact">
	{#snippet children()}
		{#key open}
			<TagAssignmentBody {allTags} {selected} {onToggle} {onCreateTag} />
		{/key}
	{/snippet}
</ResponsiveModal>
