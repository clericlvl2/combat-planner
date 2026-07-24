<!--
  TagAssignmentDialog — the shared tag-assignment surface, entry-agnostic (it doesn't know or
  care whether it's assigning tags to an already-saved template or a pending, not-yet-submitted
  one). Desktop (MediaQuery('(min-width: 1024px)')) renders a Dialog, mobile a Drawer — same split
  as ConditionPicker. A new-tag text input is pinned at the top (submits via onCreateTag, trimmed,
  empty ignored); every tag in the live `allTags` union renders below as a ToggleGroupItem-style
  chip colorized via tagAccent, mirroring ConditionPicker's selected/unselected styling exactly.
  Toggling off a tag's last remaining assignment makes it vanish from this list immediately —
  accepted behavior under the derived tag model (no snapshot-on-open special-casing).
-->
<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '$lib/components/ui/drawer';
	import { Input } from '$lib/components/ui/input';
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group';
	import { m } from '$lib/i18n';
	import { tagAccent } from './labels';

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

	const isDesktop = new MediaQuery('(min-width: 1024px)');

	let newTag = $state('');

	function submitNewTag(e: Event) {
		e.preventDefault();
		const trimmed = newTag.trim();
		if (trimmed.length === 0) return;
		onCreateTag(trimmed);
		newTag = '';
	}

	function handle(next: string[]) {
		for (const name of next) if (!selected.includes(name)) onToggle(name);
		for (const name of selected) if (!next.includes(name)) onToggle(name);
	}
</script>

{#snippet body()}
	<form class="flex flex-col gap-3" onsubmit={submitNewTag}>
		<Input
			bind:value={newTag}
			maxlength={30}
			placeholder={m['library.tags.newTag.placeholder']()}
			size="action"
			class="border-[var(--border-strong)] text-[15px] md:text-[15px]"
		/>
	</form>

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
				class="!rounded-[12px] h-10 px-4 text-sm font-medium bg-[color-mix(in_srgb,var(--tc)_9%,var(--popover))] border-[color-mix(in_srgb,var(--tc)_28%,var(--border))] text-[var(--tc)] hover:bg-[color-mix(in_srgb,var(--tc)_15%,var(--popover))] data-[state=on]:bg-[color-mix(in_srgb,var(--tc)_18%,var(--popover))] data-[state=on]:border-[var(--tc)] data-[state=on]:ring-1 data-[state=on]:ring-[var(--tc)] data-[state=on]:text-[color-mix(in_srgb,var(--tc)_55%,var(--foreground))] aria-pressed:bg-[color-mix(in_srgb,var(--tc)_18%,var(--popover))] aria-pressed:border-[var(--tc)] aria-pressed:ring-1 aria-pressed:ring-[var(--tc)] aria-pressed:text-[color-mix(in_srgb,var(--tc)_55%,var(--foreground))]"
			>
				{name}
			</ToggleGroupItem>
		{/each}
	</ToggleGroup>
{/snippet}

{#if isDesktop.current}
	<Dialog bind:open>
		<DialogContent class="max-w-sm">
			<DialogHeader>
				<DialogTitle>{m['library.tags.assign.title']()}</DialogTitle>
			</DialogHeader>

			{@render body()}
		</DialogContent>
	</Dialog>
{:else}
	<Drawer bind:open>
		<DrawerContent class="mx-auto max-w-sm">
			<DrawerHeader>
				<DrawerTitle>{m['library.tags.assign.title']()}</DrawerTitle>
			</DrawerHeader>

			<div class="px-4 pb-safe">
				{@render body()}
			</div>
		</DrawerContent>
	</Drawer>
{/if}
