<!--
  CombatFormDialog (Component Inventory §5, CLS-2/CLS-3) — Title/Description/Color-tag form for a
  combat, shared by create and edit. Mode is inferred from the optional `combat` prop (present =
  edit, absent = create), same convention as CombatantForm's explicit mode but collapsed to one
  signal since combats-list has no third state. Calls the store directly (createCombat / editCombat)
  rather than bubbling an onSubmit, per tasks.md Phase 3 — parents pass in the store (or a
  test-double implementing the same two methods).
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { type Combat, type ColorTag, MAX_COMBATS } from '$lib/db/types';
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
	let capBlocked = $state(false);

	// (Re)initialize the form whenever it opens (prefill on edit, blank defaults on create).
	$effect(() => {
		if (!open) return;
		capBlocked = false;
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
		const created = store.createCombat({ title, description, colorTag });
		if (!created) {
			capBlocked = true;
			return;
		}
		open = false;
	}
</script>

<Dialog bind:open>
	<DialogContent class="max-w-lg sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>
				{combat ? m['forms.combat.edit.title']() : m['forms.combat.create.title']()}
			</DialogTitle>
		</DialogHeader>

		<form
			class="flex flex-col gap-3"
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<div class="flex flex-col gap-1">
				<Label for="cf-title">{m['forms.field.title']()}</Label>
				<Input id="cf-title" bind:value={title} oninput={() => (capBlocked = false)} />
			</div>

			<div class="flex flex-col gap-1">
				<Label for="cf-description">{m['forms.field.description']()}</Label>
				<Textarea id="cf-description" bind:value={description} />
			</div>

			<div class="flex flex-col gap-1">
				<Label>{m['forms.field.colorTag']()}</Label>
				<ColorSwatchPicker bind:value={colorTag} />
			</div>

			<p class={['min-h-4 text-xs text-destructive', !capBlocked && 'invisible']}>
				{m['errors.combatCap']({ max: MAX_COMBATS })}
			</p>

			<DialogFooter>
				<Button type="button" variant="ghost" class="w-full" onclick={() => (open = false)}>
					{m['forms.action.cancel']()}
				</Button>
				<Button type="submit" size="lg" class="w-full">{m['forms.action.save']()}</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
