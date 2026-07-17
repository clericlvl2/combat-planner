<!--
  CombatFormDialog — Title/Description/Color-tag form for a
  combat, shared by create and edit. Mode is inferred from the optional `combat` prop (present =
  edit, absent = create), same convention as CombatantForm's explicit mode but collapsed to one
  signal since combats-list has no third state. Calls the store directly (createCombat / editCombat)
  rather than bubbling an onSubmit, per tasks.md Phase 3 — parents pass in the store (or a
  test-double implementing the same two methods).
-->
<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { Button } from '$lib/components/ui/button';
	import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '$lib/components/ui/drawer';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { type Combat, type ColorTag } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import type { CombatInput, EditCombatPatch } from '$lib/stores/domain';
	import ColorSwatchPicker from './ColorSwatchPicker.svelte';

	/** Narrow store surface this dialog needs — lets tests pass a plain spy object. */
	export interface CombatFormStore {
		createCombat(input: CombatInput): Combat | null;
		editCombat(id: string, patch: EditCombatPatch): void;
	}

	let {
		combat = null,
		open = $bindable(false),
		store,
	}: {
		/** Present = edit mode (seeded from this combat); absent/null = create mode. */
		combat?: Combat | null;
		open?: boolean;
		store: CombatFormStore;
	} = $props();

	let title = $state('');
	let description = $state('');
	let colorTag = $state<ColorTag>('neutral');
	const isDesktop = new MediaQuery('(min-width: 1024px)');

	// Field label: uppercase, muted, small caps, normal weight (no font-medium).
	const fieldLabelClass = 'text-xs font-normal uppercase tracking-wide text-muted-foreground';

	const formTitle = $derived(
		combat ? m['forms.combat.edit.title']() : m['forms.combat.create.title'](),
	);

	// (Re)initialize the form whenever it opens (prefill on edit, blank defaults on create).
	$effect(() => {
		if (!open) return;
		if (combat) {
			title = combat.title;
			description = combat.description;
			colorTag = combat.colorTag;
		} else {
			title = '';
			description = '';
			colorTag = 'neutral';
		}
	});

	function submit() {
		if (combat) {
			store.editCombat(combat.id, { title, description, colorTag });
			open = false;
			return;
		}
		const resolvedTitle = title.trim() ? title : m['combats.defaultTitle']();
		const created = store.createCombat({ title: resolvedTitle, description, colorTag });
		if (!created) return;
		open = false;
	}
</script>

{#snippet formBody()}
	<form
		class="flex flex-col gap-3"
		onsubmit={(e) => {
			e.preventDefault();
			submit();
		}}
	>
		<div class="flex flex-col gap-[5px]">
			<Label for="cf-title" class={fieldLabelClass}>{m['forms.field.title']()}</Label>
			<Input
				id="cf-title"
				bind:value={title}
				placeholder={m['forms.field.title.placeholder']()}
				class="h-11 rounded-sm border-[var(--border-strong)] text-[15px] md:text-[15px]"
			/>
		</div>

		<div class="flex flex-col gap-[5px]">
			<Label for="cf-description" class={fieldLabelClass}>{m['forms.field.description']()}</Label>
			<Textarea
				id="cf-description"
				bind:value={description}
				placeholder={m['forms.field.description.placeholder']()}
				class="rounded-sm border-[var(--border-strong)] text-[15px] md:text-[15px]"
			/>
		</div>

		<div class="flex flex-col gap-[5px]">
			<Label class={fieldLabelClass}>{m['forms.field.colorTag']()}</Label>
			<ColorSwatchPicker bind:value={colorTag} />
		</div>

		<DialogFooter class="mx-0 mb-0 flex-row justify-center gap-2 border-t-0 bg-transparent p-0 pt-1">
			<Button
				type="button"
				variant="outline"
				size="lg"
				class="h-11 min-w-0 flex-1 shrink basis-0 rounded-sm border-[var(--border-strong)]"
				onclick={() => (open = false)}
			>
				{m['forms.action.cancel']()}
			</Button>
			<Button
				type="submit"
				size="lg"
				class="h-11 min-w-0 flex-1 shrink basis-0 rounded-sm font-semibold"
			>
				{combat ? m['forms.action.save']() : m['forms.action.create']()}
			</Button>
		</DialogFooter>
	</form>
{/snippet}

{#if isDesktop.current}
	<Dialog bind:open>
		<DialogContent
			class="rounded-lg border border-[var(--border-strong)] ring-0 sm:max-w-[400px]"
		>
			<DialogHeader>
				<DialogTitle class="text-lg font-semibold">{formTitle}</DialogTitle>
			</DialogHeader>

			{@render formBody()}
		</DialogContent>
	</Dialog>
{:else}
	<Drawer bind:open>
		<DrawerContent class="mx-auto max-w-md">
			<DrawerHeader>
				<DrawerTitle class="text-lg font-semibold">{formTitle}</DrawerTitle>
			</DrawerHeader>

			<div class="px-4 pb-4">
				{@render formBody()}
			</div>
		</DrawerContent>
	</Drawer>
{/if}
