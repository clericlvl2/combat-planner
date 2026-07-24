<!--
  LibraryEntryFormDialog — Name/Type/Max HP/AC/PD/MD/Init Bonus/Note/Tags form for a library
  template, shared by create and edit. Mode is inferred from the optional `entry` prop (present =
  edit, absent/null = create), same convention as CombatFormDialog. The field set mirrors
  CombatantForm's (minus `initiative`, which is a combat-instance-only field templates never
  carry).
  Tags: local `pendingTags` (seeded from `entry.tags` on edit-open, `[]` on create-open) render as
  removable TagChips plus an "Edit tags" affordance opening a TagAssignmentDialog scoped to
  `pendingTags` — nothing persists until Save; `onToggle`/`onCreateTag` mutate `pendingTags`
  locally via the domain `normalizeTagName` against `allTags ∪ pendingTags`. This is a deliberate
  nested modal (Dialog-over-Dialog desktop, Drawer-over-Dialog mobile): the tag dialog's own
  Escape/backdrop dismisses only itself, focus returns to the "Edit tags" trigger (bits-ui's
  default focus-scope restore, since we never override it), and this form's state is untouched.
  Save-feedback contract: create submits call `onCreateResult(created)` and the dialog itself
  decides whether to close (created → close; null/cap → stays open, form content preserved). Edit
  submits stay silent (mirrors combat editing) and never call `onCreateResult`. This dialog is
  prop-driven and toast-agnostic — the toast itself is fired by the page-level callback.
-->
<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { Button } from '$lib/components/ui/button';
	import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '$lib/components/ui/drawer';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group';
	import { type CombatantTemplate, type CombatantType, COMBATANT_TYPES } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import type { CombatantTemplateInput } from '$lib/stores/domain/factories';
	import { type EditTemplatePatch, normalizeTagName } from '$lib/stores/domain/library';
	import { NAME_MAX_LENGTH, NOTE_MAX_LENGTH, RANGES } from '$lib/stores/domain/constants';
	import NumberField from './NumberField.svelte';
	import { typeLabel } from './labels';
	import TagAssignmentDialog from './TagAssignmentDialog.svelte';
	import TagChip from './TagChip.svelte';

	/** Narrow store surface this dialog needs — lets tests pass a plain spy object. */
	export interface LibraryEntryFormStore {
		addTemplate(input: CombatantTemplateInput): CombatantTemplate | null;
		editTemplate(id: string, patch: EditTemplatePatch): void;
	}

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

	let name = $state('');
	let type = $state<CombatantType>('enemy');
	let initiativeBonus = $state<number | null>(null);
	let maxHp = $state<number | null>(null);
	let ac = $state<number | null>(null);
	let pd = $state<number | null>(null);
	let md = $state<number | null>(null);
	let note = $state('');
	let pendingTags = $state<string[]>([]);
	let tagsOpen = $state(false);
	const isDesktop = new MediaQuery('(min-width: 1024px)');

	// (Re)initialize the form whenever it opens (prefill on edit, blank/default on create).
	$effect(() => {
		if (!open) return;
		if (entry) {
			name = entry.name;
			type = entry.type;
			initiativeBonus = entry.initiativeBonus;
			maxHp = entry.maxHp;
			ac = entry.ac;
			pd = entry.pd;
			md = entry.md;
			note = entry.note;
			pendingTags = [...entry.tags];
		} else {
			name = '';
			type = 'enemy';
			initiativeBonus = 0;
			maxHp = 10;
			ac = 10;
			pd = 10;
			md = 10;
			note = '';
			pendingTags = [];
		}
	});

	const combinedTags = $derived.by(() => {
		const seen = new Map<string, string>();
		for (const t of [...allTags, ...pendingTags]) {
			const key = t.toLowerCase();
			if (!seen.has(key)) seen.set(key, t);
		}
		return [...seen.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
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

	// Field label: uppercase, muted, small caps (matches CombatFormDialog/CombatantForm).
	const fieldLabelClass = 'text-xs font-normal uppercase tracking-wide text-muted-foreground';

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
			open = false;
			return;
		}

		const created = store.addTemplate(fields);
		onCreateResult(created);
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
		<div class="form-field-group">
			<Label for="lf-name" class={fieldLabelClass}>{m['forms.field.name']()}</Label>
			<Input
				id="lf-name"
				bind:value={name}
				maxlength={NAME_MAX_LENGTH}
				placeholder={namePlaceholder}
				size="action"
				class="border-[var(--border-strong)] text-[15px] md:text-[15px]"
			/>
		</div>

		<div class="form-field-group">
			<Label class={fieldLabelClass}>{m['forms.field.type']()}</Label>
			<ToggleGroup
				type="single"
				value={type}
				onValueChange={(v) => v && (type = v as CombatantType)}
				class="w-full gap-2"
			>
				{#each COMBATANT_TYPES as t (t)}
					<ToggleGroupItem
						value={t}
						style="--tc: var(--type-{t})"
						class="flex min-h-11 flex-1 items-center justify-start gap-1.5 !rounded-sm border border-border bg-secondary pl-3.5 text-muted-foreground data-[state=on]:border-[var(--tc)] data-[state=on]:bg-[color-mix(in_srgb,var(--tc)_14%,var(--secondary))] data-[state=on]:font-semibold data-[state=on]:text-foreground data-[state=on]:ring-1 data-[state=on]:ring-[var(--tc)]"
					>
						<span class="size-2 shrink-0 rounded-full bg-[var(--tc)]"></span>
						{typeLabel[t]()}
					</ToggleGroupItem>
				{/each}
			</ToggleGroup>
		</div>

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

		<div class="form-field-group">
			<Label for="lf-note" class={fieldLabelClass}>{m['forms.field.note']()}</Label>
			<Textarea
				id="lf-note"
				bind:value={note}
				maxlength={NOTE_MAX_LENGTH}
				placeholder={m['forms.field.note.placeholder']()}
				class="rounded-sm border-[var(--border-strong)] text-[15px] md:text-[15px]"
			/>
		</div>

		<div class="form-field-group">
			<Label class={fieldLabelClass}>{m['library.tags.field']()}</Label>
			<div class="flex flex-wrap items-center gap-1.5">
				{#each pendingTags as tagName (tagName)}
					<TagChip name={tagName} removable onRemove={togglePendingTag} class="touch-none" />
				{/each}
				<button
					type="button"
					class="inline-flex h-[22px] touch-none items-center gap-[5px] rounded-full border border-dashed border-border px-2.5 py-0.5 text-sm text-muted-foreground hover:border-foreground hover:text-foreground"
					onclick={() => (tagsOpen = true)}
				>
					{m['library.tags.editTrigger']()}
				</button>
			</div>
		</div>

		<DialogFooter class="mx-0 mb-0 flex-row justify-center gap-2 border-t-0 bg-transparent p-0 pt-1">
			<Button
				type="button"
				variant="outline"
				size="action"
				class="min-w-0 flex-1 shrink basis-0 touch-none border-[var(--border-strong)]"
				onclick={() => (open = false)}
			>
				{m['forms.action.cancel']()}
			</Button>
			<Button type="submit" size="action" class="min-w-0 flex-1 shrink basis-0 touch-none font-semibold">
				{entry ? m['forms.action.save']() : m['forms.action.create']()}
			</Button>
		</DialogFooter>
	</form>
{/snippet}

{#if isDesktop.current}
	<Dialog bind:open>
		<DialogContent
			class="flex max-h-[calc(100dvh-2rem)] flex-col rounded-lg border border-[var(--border-strong)] ring-0 sm:max-w-[400px]"
		>
			<DialogHeader>
				<DialogTitle class="text-lg font-semibold">{formTitle}</DialogTitle>
			</DialogHeader>

			<div class="-mx-3 min-h-0 flex-1 overflow-y-auto px-3">
				{@render formBody()}
			</div>
		</DialogContent>
	</Dialog>
{:else}
	<Drawer bind:open>
		<DrawerContent class="mx-auto flex max-h-[80vh] max-w-md flex-col">
			<DrawerHeader>
				<DrawerTitle class="text-lg font-semibold">{formTitle}</DrawerTitle>
			</DrawerHeader>

			<div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-safe">
				{@render formBody()}
			</div>
		</DrawerContent>
	</Drawer>
{/if}

<TagAssignmentDialog
	bind:open={tagsOpen}
	allTags={combinedTags}
	selected={pendingTags}
	onToggle={togglePendingTag}
	onCreateTag={createPendingTag}
/>
