<!--
  LibraryEntryFormBody — LibraryEntryFormDialog's fields, tags, and footer, extracted so its local
  `$state` can be seeded once at mount from `entry` (edit) or blank/default (create).
  LibraryEntryFormDialog remounts this component via `{#key entry?.id ?? 'new'}` whenever the
  edited record's identity changes, so a background store mutation while the dialog is open can
  never clobber in-progress input (see Phase 2 of the 2026-07-28 Svelte code-style plan).
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { type CombatantTemplate, type CombatantType } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { normalizeTagName } from '$lib/stores/domain/library';
	import { NAME_MAX_LENGTH, NOTE_MAX_LENGTH, RANGES } from '$lib/stores/domain/constants';
	import Field from './Field.svelte';
	import type { LibraryEntryFormStore } from './LibraryEntryFormDialog.svelte';
	import NumberField from './NumberField.svelte';
	import ResponsiveModal from './ResponsiveModal.svelte';
	import TagAssignmentDialog from './TagAssignmentDialog.svelte';
	import TagChip from './TagChip.svelte';
	import TypeToggle from './TypeToggle.svelte';

	let {
		entry = null,
		open = $bindable(false),
		store,
		onCreateResult,
		allTags = [],
	}: {
		/** Present = edit mode (seeded from this template); absent/null = create mode. */
		entry?: CombatantTemplate | null;
		open?: boolean;
		store: LibraryEntryFormStore;
		onCreateResult: (created: CombatantTemplate | null) => void;
		/** Live derived union of every template's tags (never stored, ADR-002). */
		allTags?: string[];
	} = $props();

	// svelte-ignore state_referenced_locally -- seed once at mount; remount via {#key} re-seeds.
	let name = $state(entry?.name ?? '');
	// svelte-ignore state_referenced_locally -- seed once at mount; remount via {#key} re-seeds.
	let type = $state<CombatantType>(entry?.type ?? 'enemy');
	// svelte-ignore state_referenced_locally -- seed once at mount; remount via {#key} re-seeds.
	let initiativeBonus = $state<number | null>(entry ? entry.initiativeBonus : 0);
	// svelte-ignore state_referenced_locally -- seed once at mount; remount via {#key} re-seeds.
	let maxHp = $state<number | null>(entry ? entry.maxHp : 10);
	// svelte-ignore state_referenced_locally -- seed once at mount; remount via {#key} re-seeds.
	let ac = $state<number | null>(entry ? entry.ac : 10);
	// svelte-ignore state_referenced_locally -- seed once at mount; remount via {#key} re-seeds.
	let pd = $state<number | null>(entry ? entry.pd : 10);
	// svelte-ignore state_referenced_locally -- seed once at mount; remount via {#key} re-seeds.
	let md = $state<number | null>(entry ? entry.md : 10);
	// svelte-ignore state_referenced_locally -- seed once at mount; remount via {#key} re-seeds.
	let note = $state(entry?.note ?? '');
	// svelte-ignore state_referenced_locally -- seed once at mount; remount via {#key} re-seeds.
	let pendingTags = $state<string[]>(entry ? [...entry.tags] : []);
	let tagsOpen = $state(false);

	const combinedTags = $derived.by(() => {
		const seen = new Map<string, string>();
		for (const t of [...allTags, ...pendingTags]) {
			const key = t.toLowerCase();
			if (!seen.has(key)) seen.set(key, t);
		}
		return [...seen.values()].sort((a, b) =>
			a.localeCompare(b, undefined, { sensitivity: 'base' }),
		);
	});

	function togglePendingTag(name: string) {
		const lower = name.toLowerCase();
		pendingTags = pendingTags.some((t) => t.toLowerCase() === lower)
			? pendingTags.filter((t) => t.toLowerCase() !== lower)
			: [...pendingTags, name];
	}

	function createPendingTag(raw: string) {
		const canonical = normalizeTagName(raw, combinedTags);
		if (canonical === null) return;
		if (pendingTags.some((t) => t.toLowerCase() === canonical.toLowerCase())) return;
		pendingTags = [...pendingTags, canonical];
	}

	// Type-specific name placeholder; also substituted as the real stored name when the
	// name is left empty on save (mirrors CombatantForm's namePlaceholder/submit()).
	const namePlaceholder = $derived(
		type === 'pc'
			? m['forms.field.name.placeholder.pc']()
			: type === 'ally'
				? m['forms.field.name.placeholder.ally']()
				: m['forms.field.name.placeholder.enemy'](),
	);

	const formTitle = $derived(
		entry ? m['forms.library.edit.title']() : m['forms.library.create.title'](),
	);

	function submit() {
		const resolvedName = name.trim().length > 0 ? name : namePlaceholder;
		const fields = {
			name: resolvedName,
			type,
			initiativeBonus: initiativeBonus ?? undefined,
			maxHp: maxHp ?? undefined,
			ac: ac ?? undefined,
			pd: pd ?? undefined,
			md: md ?? undefined,
			note,
			tags: pendingTags,
		};

		if (entry) {
			store.editTemplate(entry.id, fields);
			close();
			return;
		}

		const created = store.addTemplate(fields);
		onCreateResult(created);
		if (!created) return;
		close();
	}

	/** Cancel and submit close by writing the bound prop, which bits-ui does not report through
	 *  `onOpenChange` — that only fires for dismissals it initiates itself. Both paths go through
	 *  here so every close re-seeds exactly once. */
	function close() {
		open = false;
		reseed();
	}

	/** The {#key} above only remounts on a change of record identity, and this component sits
	 *  outside the modal content bits-ui tears down on close — so reopening the same entry (or the
	 *  create form, whose key is the constant 'new') would otherwise show the last session's
	 *  abandoned input. Re-seed on close instead, which also covers Escape and swipe-to-dismiss. */
	function reseed() {
		name = entry?.name ?? '';
		type = entry?.type ?? 'enemy';
		initiativeBonus = entry ? entry.initiativeBonus : 0;
		maxHp = entry ? entry.maxHp : 10;
		ac = entry ? entry.ac : 10;
		pd = entry ? entry.pd : 10;
		md = entry ? entry.md : 10;
		note = entry?.note ?? '';
		pendingTags = entry ? [...entry.tags] : [];
		tagsOpen = false;
	}
</script>

{#snippet formFields()}
	<Field label={m['forms.field.name']()} for="lf-name">
		<Input
			id="lf-name"
			bind:value={name}
			maxlength={NAME_MAX_LENGTH}
			placeholder={namePlaceholder}
			size="action"
			class="border-[var(--border-strong)] text-[15px] md:text-[15px]"
		/>
	</Field>

	<Field label={m['forms.field.type']()}>
		<TypeToggle bind:value={type} />
	</Field>

	<div class="grid grid-cols-2 gap-2">
		<NumberField
			id="lf-maxhp"
			label={m['forms.field.maxHp']()}
			bind:value={maxHp}
			min={RANGES.maxHp.min}
			max={RANGES.maxHp.max}
		/>
		<NumberField
			id="lf-ac"
			label={m['forms.field.ac']()}
			bind:value={ac}
			min={RANGES.ac.min}
			max={RANGES.ac.max}
		/>
	</div>

	<div class="grid grid-cols-2 gap-2">
		<NumberField
			id="lf-pd"
			label={m['forms.field.pd']()}
			bind:value={pd}
			min={RANGES.pd.min}
			max={RANGES.pd.max}
		/>
		<NumberField
			id="lf-md"
			label={m['forms.field.md']()}
			bind:value={md}
			min={RANGES.md.min}
			max={RANGES.md.max}
		/>
	</div>

	<NumberField
		id="lf-initbonus"
		label={m['forms.field.initBonus']()}
		bind:value={initiativeBonus}
		min={RANGES.initiativeBonus.min}
		max={RANGES.initiativeBonus.max}
	/>

	<Field label={m['forms.field.note']()} for="lf-note">
		<Textarea
			id="lf-note"
			bind:value={note}
			maxlength={NOTE_MAX_LENGTH}
			placeholder={m['forms.field.note.placeholder']()}
			class="rounded-sm border-[var(--border-strong)] text-[15px] md:text-[15px]"
		/>
	</Field>

	<Field label={m['library.tags.field']()}>
		<div class="flex flex-wrap items-center gap-1.5">
			{#each pendingTags as tagName (tagName)}
				<TagChip name={tagName} removable onRemove={togglePendingTag} />
			{/each}
			<button
				type="button"
				class="inline-flex h-[22px] items-center gap-[5px] rounded-full border border-dashed border-border px-2.5 py-0.5 text-sm text-muted-foreground hover:border-foreground hover:text-foreground"
				onclick={() => (tagsOpen = true)}
			>
				{m['library.tags.editTrigger']()}
			</button>
		</div>
	</Field>
{/snippet}

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
		{@render formFields()}
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
				{entry ? m['forms.action.save']() : m['forms.action.create']()}
			</Button>
		</div>
	{/snippet}
</ResponsiveModal>

<TagAssignmentDialog
	bind:open={tagsOpen}
	allTags={combinedTags}
	selected={pendingTags}
	onToggle={togglePendingTag}
	onCreateTag={createPendingTag}
/>
