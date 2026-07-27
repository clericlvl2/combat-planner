<!--
  CombatFormBody — the CombatFormDialog form fields + footer, extracted so its local `$state` can
  be seeded once at mount from `combat` (the record itself). CombatFormDialog remounts this
  component via `{#key combat?.id ?? 'new'}` whenever the edited record's identity changes, so a
  background store mutation while the dialog is open can never clobber in-progress input (see
  Phase 2 of the 2026-07-28 Svelte code-style plan).
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { type Combat, type ColorTag } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from '$lib/stores/domain/constants';
	import ColorSwatchPicker from './ColorSwatchPicker.svelte';
	import type { CombatFormStore } from './CombatFormDialog.svelte';
	import Field from './Field.svelte';
	import ResponsiveModal from './ResponsiveModal.svelte';

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

	// svelte-ignore state_referenced_locally -- seed once at mount; remount via {#key} re-seeds.
	let title = $state(combat?.title ?? '');
	// svelte-ignore state_referenced_locally -- seed once at mount; remount via {#key} re-seeds.
	let description = $state(combat?.description ?? '');
	// svelte-ignore state_referenced_locally -- seed once at mount; remount via {#key} re-seeds.
	let colorTag = $state<ColorTag>(combat?.colorTag ?? 'neutral');

	const formTitle = $derived(
		combat ? m['forms.combat.edit.title']() : m['forms.combat.create.title'](),
	);

	/** The {#key} above only remounts on a change of record identity, and this component sits
	 *  outside the modal content bits-ui tears down on close — so reopening the same record (or
	 *  the create form, whose key is the constant 'new') would otherwise show the last session's
	 *  abandoned input. Re-seed on close instead, which also covers Escape and swipe-to-dismiss. */
	function reseed() {
		title = combat?.title ?? '';
		description = combat?.description ?? '';
		colorTag = combat?.colorTag ?? 'neutral';
	}

	/** Cancel and submit close by writing the bound prop, which bits-ui does not report through
	 *  `onOpenChange` — that only fires for dismissals it initiates itself. Both paths go through
	 *  here so every close re-seeds exactly once. */
	function close() {
		open = false;
		reseed();
	}

	function submit() {
		if (combat) {
			store.editCombat(combat.id, { title, description, colorTag });
			close();
			return;
		}
		const resolvedTitle = title.trim() ? title : m['combats.defaultTitle']();
		const created = store.createCombat({ title: resolvedTitle, description, colorTag });
		if (!created) return;
		close();
	}
</script>

<ResponsiveModal
	bind:open
	title={formTitle}
	size="form"
	onSubmit={submit}
	onOpenChange={(v) => {
		if (!v) reseed();
	}}
>
	{#snippet children()}
		<Field label={m['forms.field.title']()} for="cf-title">
			<Input
				id="cf-title"
				bind:value={title}
				maxlength={TITLE_MAX_LENGTH}
				placeholder={m['forms.field.title.placeholder']()}
				size="action"
				class="border-[var(--border-strong)] text-[15px] md:text-[15px]"
			/>
		</Field>

		<Field label={m['forms.field.description']()} for="cf-description">
			<Textarea
				id="cf-description"
				bind:value={description}
				maxlength={DESCRIPTION_MAX_LENGTH}
				placeholder={m['forms.field.description.placeholder']()}
				class="rounded-sm border-[var(--border-strong)] text-[15px] md:text-[15px]"
			/>
		</Field>

		<Field label={m['forms.field.colorTag']()}>
			<ColorSwatchPicker bind:value={colorTag} />
		</Field>
	{/snippet}

	{#snippet footer()}
		<div class="flex justify-center gap-2">
			<Button
				type="button"
				variant="outline"
				size="action"
				class="min-w-0 flex-1 shrink basis-0 border-[var(--border-strong)]"
				onclick={close}
			>
				{m['forms.action.cancel']()}
			</Button>
			<Button type="submit" size="action" class="min-w-0 flex-1 shrink basis-0 font-semibold">
				{combat ? m['forms.action.save']() : m['forms.action.create']()}
			</Button>
		</div>
	{/snippet}
</ResponsiveModal>
