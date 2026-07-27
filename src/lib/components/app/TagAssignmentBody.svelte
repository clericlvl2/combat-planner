<!--
  TagAssignmentBody — TagAssignmentDialog's new-tag form and tag-toggle list, extracted so the
  new-tag input's local `$state` can be seeded once at mount. TagAssignmentDialog remounts this
  component via `{#key open}` every time the dialog opens, so the field always starts blank rather
  than an effect racing a background store mutation (Phase 2, 2026-07-28 plan).
-->
<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group';
	import { m } from '$lib/i18n';
	import { TAG_NAME_MAX_LENGTH } from '$lib/stores/domain/constants';
	import { modalToggleItemClass, tagAccent } from './labels';

	let {
		allTags,
		selected,
		onToggle,
		onCreateTag,
	}: {
		allTags: string[];
		selected: string[];
		onToggle: (name: string) => void;
		onCreateTag: (name: string) => void;
	} = $props();

	let newTag = $state('');

	function submitNewTag(e: Event) {
		e.preventDefault();
		const trimmed = newTag.trim();
		if (trimmed.length === 0) return;
		// Idempotent "ensure assigned": a name already selected is a no-op (never removes it) —
		// clear the input and bail before onCreateTag, which on LibraryRow is the toggle itself.
		if (selected.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
			newTag = '';
			return;
		}
		onCreateTag(trimmed);
		newTag = '';
	}

	// Snapshot `selected` once up front: onToggle's callers mutate the live prop as a side effect
	// of the first loop, so diffing the second loop against the same live `selected` reference
	// would iterate a collection its own side effects already changed.
	function handle(next: string[]) {
		const before = [...selected];
		for (const name of next) if (!before.includes(name)) onToggle(name);
		for (const name of before) if (!next.includes(name)) onToggle(name);
	}
</script>

<form class="flex flex-col gap-3" onsubmit={submitNewTag}>
	<Input
		bind:value={newTag}
		maxlength={TAG_NAME_MAX_LENGTH}
		placeholder={m['library.tags.newTag.placeholder']()}
		size="action"
		class="border-[var(--border-strong)] text-[15px] md:text-[15px]"
	/>
</form>

{#if allTags.length === 0}
	<p class="pt-3 text-sm text-muted-foreground">{m['library.tags.empty']()}</p>
{:else}
	<ToggleGroup
		type="multiple"
		value={selected}
		onValueChange={handle}
		variant="outline"
		class="flex flex-wrap justify-start gap-2 pt-3"
	>
		{#each allTags as name (name)}
			<ToggleGroupItem
				value={name}
				aria-label={name}
				style="--tc: {tagAccent(name)}"
				class={modalToggleItemClass}
			>
				{name}
			</ToggleGroupItem>
		{/each}
	</ToggleGroup>
{/if}
