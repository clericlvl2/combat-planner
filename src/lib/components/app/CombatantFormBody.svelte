<!--
  CombatantFormBody — CombatantForm's fields, add-from-library picker, and footer, extracted so
  its local `$state` can be seeded once at mount from `combatant` (edit) or the add-mode defaults.
  CombatantForm remounts this component via `{#key combatant?.id ?? 'new'}` whenever the edited
  record's identity changes, so a background store mutation while the dialog is open can never
  clobber in-progress input (see Phase 2 of the 2026-07-28 Svelte code-style plan).
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group';
	import {
		type Combatant,
		type CombatantTemplate,
		type CombatantType,
		UNROLLED,
	} from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import { NAME_MAX_LENGTH, NOTE_MAX_LENGTH, RANGES } from '$lib/stores/domain/constants';
	import type { CombatantFormValues } from './CombatantForm.svelte';
	import EmptyState from './EmptyState.svelte';
	import Field from './Field.svelte';
	import NumberField from './NumberField.svelte';
	import { typeColor } from './labels';
	import ResponsiveModal, { drawerScrollGuard } from './ResponsiveModal.svelte';
	import SearchField from './SearchField.svelte';
	import TypeToggle from './TypeToggle.svelte';

	let {
		mode,
		combatant = null,
		open = $bindable(false),
		onSubmit,
		templates,
		onOpenLibrary,
	}: {
		mode: 'add' | 'edit';
		combatant?: Combatant | null;
		open?: boolean;
		onSubmit: (values: CombatantFormValues) => void;
		// `undefined` (prop not passed, as in edit mode) means "library feature not wired here";
		// an array (possibly empty) enables the add-mode "New"/"From library" tab.
		templates?: CombatantTemplate[];
		onOpenLibrary?: () => void;
	} = $props();

	// svelte-ignore state_referenced_locally -- seed once at mount; remount via {#key} re-seeds.
	const editSeed = mode === 'edit' ? combatant : null;

	let name = $state(editSeed?.name ?? '');
	let type = $state<CombatantType>(editSeed?.type ?? 'enemy');
	let initiativeBonus = $state<number | null>(editSeed ? editSeed.initiativeBonus : 0);
	let maxHp = $state<number | null>(editSeed ? editSeed.maxHp : 10);
	let ac = $state<number | null>(editSeed ? editSeed.ac : 10);
	let pd = $state<number | null>(editSeed ? editSeed.pd : 10);
	let md = $state<number | null>(editSeed ? editSeed.md : 10);
	let note = $state(editSeed?.note ?? '');
	let initiative = $state<number | null>(
		editSeed ? (editSeed.initiative === UNROLLED ? null : editSeed.initiative) : null,
	);

	// Add-from-library picker state (add mode only — gated by `templates !== undefined` in the
	// markup; never read in edit mode).
	let source = $state<'new' | 'library'>('new');
	let pickedTemplateId = $state<string | null>(null);
	let templateQuery = $state('');

	function resetAddDefaults() {
		name = '';
		type = 'enemy';
		initiativeBonus = 0;
		maxHp = 10;
		ac = 10;
		pd = 10;
		md = 10;
		note = '';
		initiative = null;
	}

	// Sorted+filtered (name-only) template list for the embedded picker — same stable ordering as
	// the /library page: name (case-insensitive) → updatedAt desc → id.
	const filteredTemplates = $derived(
		(templates ?? [])
			.filter((t) => t.name.toLowerCase().includes(templateQuery.trim().toLowerCase()))
			.sort((a, b) => {
				const byName = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
				if (byName !== 0) return byName;
				if (b.updatedAt !== a.updatedAt) return b.updatedAt - a.updatedAt;
				return a.id.localeCompare(b.id);
			}),
	);

	const pickedTemplate = $derived(
		pickedTemplateId ? ((templates ?? []).find((t) => t.id === pickedTemplateId) ?? null) : null,
	);

	function selectSource(next: 'new' | 'library') {
		if (next === source) return;
		source = next;
		if (next === 'new') {
			pickedTemplateId = null;
			resetAddDefaults();
		}
	}

	function pickTemplate(t: CombatantTemplate) {
		pickedTemplateId = t.id;
		name = t.name;
		type = t.type;
		initiativeBonus = t.initiativeBonus;
		maxHp = t.maxHp;
		ac = t.ac;
		pd = t.pd;
		md = t.md;
		note = t.note;
	}

	// Type-specific name placeholder; also substituted as the real stored name when the
	// name is left empty on save (see submit()).
	const namePlaceholder = $derived(
		type === 'pc'
			? m['forms.field.name.placeholder.pc']()
			: type === 'ally'
				? m['forms.field.name.placeholder.ally']()
				: m['forms.field.name.placeholder.enemy'](),
	);

	const formTitle = $derived(
		mode === 'add' ? m['forms.combatant.add.title']() : m['forms.combatant.edit.title'](),
	);

	function submit() {
		const resolvedName = name.trim().length > 0 ? name : namePlaceholder;
		onSubmit({ name: resolvedName, type, initiativeBonus, maxHp, ac, pd, md, note, initiative });
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
	 *  outside the modal content bits-ui tears down on close — so reopening the same combatant
	 *  (or the add form, whose key is the constant 'new') would otherwise show the last session's
	 *  abandoned input. Re-seed on close instead, which also covers Escape and swipe-to-dismiss. */
	function reseed() {
		// Deliberately the live prop, not the mount-time `editSeed`: reopening should show what
		// the record holds now, not what it held when the dialog was first mounted.
		const current = mode === 'edit' ? combatant : null;
		if (current) {
			name = current.name;
			type = current.type;
			initiativeBonus = current.initiativeBonus;
			maxHp = current.maxHp;
			ac = current.ac;
			pd = current.pd;
			md = current.md;
			note = current.note;
			initiative = current.initiative === UNROLLED ? null : current.initiative;
		} else {
			resetAddDefaults();
		}
		source = 'new';
		pickedTemplateId = null;
		templateQuery = '';
	}
</script>

{#snippet formFields()}
	{#if mode === 'add' && templates !== undefined}
		<!-- Add-from-library tab — always rendered in add mode, even when the library is empty. -->
		<ToggleGroup
			type="single"
			value={source}
			onValueChange={(v) => v && selectSource(v as 'new' | 'library')}
			class="w-full gap-2"
		>
			<ToggleGroupItem
				value="new"
				class="flex-1 !rounded-sm border border-border bg-secondary text-muted-foreground data-[state=on]:bg-primary data-[state=on]:font-semibold data-[state=on]:text-primary-foreground"
			>
				{m['library.picker.tab.new']()}
			</ToggleGroupItem>
			<ToggleGroupItem
				value="library"
				class="flex-1 !rounded-sm border border-border bg-secondary text-muted-foreground data-[state=on]:bg-primary data-[state=on]:font-semibold data-[state=on]:text-primary-foreground"
			>
				{m['library.picker.tab.library']()}
			</ToggleGroupItem>
		</ToggleGroup>
	{/if}

	{#if source === 'library' && pickedTemplateId === null}
		{#if (templates ?? []).length === 0}
			<EmptyState
				icon={chromeIcon.navLibrary}
				title={m['library.picker.empty.title']()}
				description={m['library.picker.empty.description']()}
			>
				<Button type="button" size="action" onclick={() => onOpenLibrary?.()}>
					{m['library.picker.empty.openLibrary']()}
				</Button>
			</EmptyState>
		{:else}
			<!-- Name-only picker (tag search stays a /library-page-only feature). -->
			<SearchField
				bind:value={templateQuery}
				placeholder={m['library.picker.search.placeholder']()}
				ariaLabel={m['library.picker.search.placeholder']()}
			/>
			<!-- Own scroll container inside the drawer — needs the same at-top swipe-close
                         guard as ResponsiveModal's scroll region (see its style block). -->
			<div {@attach drawerScrollGuard} class="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
				{#each filteredTemplates as t (t.id)}
					<button
						type="button"
						class="flex min-h-11 items-center gap-2 rounded-md border border-border px-3 py-2 text-left hover:bg-muted"
						onclick={() => pickTemplate(t)}
					>
						<span class={['size-2 shrink-0 rounded-full', typeColor[t.type]]}></span>
						<span class="min-w-0 flex-1">
							<span class="block truncate text-sm font-medium">{t.name}</span>
							<span class="block truncate text-xs text-muted-foreground">
								{m['library.row.subtitle']({ maxHp: t.maxHp, ac: t.ac, pd: t.pd, md: t.md })}
							</span>
						</span>
					</button>
				{/each}
			</div>
		{/if}
	{:else}
		{#if source === 'library' && pickedTemplate}
			<div class="flex items-center justify-between gap-2 text-sm text-muted-foreground">
				<span class="min-w-0 flex-1 truncate"
					>{m['library.picker.from']({ name: pickedTemplate.name })}</span
				>
				<button
					type="button"
					class="shrink-0 font-medium text-foreground underline-offset-2 hover:underline"
					onclick={() => (pickedTemplateId = null)}
				>
					{m['library.picker.change']()}
				</button>
			</div>
		{/if}

		<!-- Name (optional — empty on save falls back to the type-specific placeholder as the real name) -->
		<Field label={m['forms.field.name']()} for="cf-name">
			<Input
				id="cf-name"
				size="action"
				bind:value={name}
				maxlength={NAME_MAX_LENGTH}
				placeholder={namePlaceholder}
			/>
		</Field>

		<!-- Type -->
		<Field label={m['forms.field.type']()}>
			<TypeToggle bind:value={type} />
		</Field>

		<div class="grid grid-cols-2 gap-2">
			<NumberField
				id="cf-maxhp"
				label={m['forms.field.maxHp']()}
				bind:value={maxHp}
				min={RANGES.maxHp.min}
				max={RANGES.maxHp.max}
			/>
			<NumberField
				id="cf-ac"
				label={m['forms.field.ac']()}
				bind:value={ac}
				min={RANGES.ac.min}
				max={RANGES.ac.max}
			/>
		</div>

		<div class="grid grid-cols-2 gap-2">
			<NumberField
				id="cf-pd"
				label={m['forms.field.pd']()}
				bind:value={pd}
				min={RANGES.pd.min}
				max={RANGES.pd.max}
			/>
			<NumberField
				id="cf-md"
				label={m['forms.field.md']()}
				bind:value={md}
				min={RANGES.md.min}
				max={RANGES.md.max}
			/>
		</div>

		<div class="grid grid-cols-2 gap-2">
			<NumberField
				id="cf-initbonus"
				label={m['forms.field.initBonus']()}
				bind:value={initiativeBonus}
				min={RANGES.initiativeBonus.min}
				max={RANGES.initiativeBonus.max}
			/>
			<NumberField
				id="cf-init"
				label={m['forms.field.initValue']()}
				bind:value={initiative}
				min={RANGES.initiative.min}
				max={RANGES.initiative.max}
			/>
		</div>

		<Field label={m['forms.field.note']()} for="cf-note">
			<Textarea
				id="cf-note"
				bind:value={note}
				maxlength={NOTE_MAX_LENGTH}
				placeholder={m['forms.field.note.placeholder']()}
			/>
		</Field>
	{/if}
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
			<Button
				type="submit"
				size="action"
				class="min-w-0 flex-1 shrink basis-0"
				disabled={mode === 'add' && source === 'library' && pickedTemplateId === null}
			>
				{mode === 'add' ? m['forms.action.add']() : m['forms.action.save']()}
			</Button>
		</div>
	{/snippet}
</ResponsiveModal>
