<!--
  CombatantForm (component-inventory.md, limits.md) — add/edit a combatant in a Dialog. Name is
  optional: on add-with-no-data the numeric fields (Max HP/Init/AC/PD/MD) pre-fill as real editable
  values (10/0/10/10/10 — CBT-3b), and the Name field shows a type-specific placeholder ("Hero
  Name"/"Enemy"/"Ally" — CBT-3c) that becomes the combatant's real stored name if left empty on
  save. Numeric fields still clamp via NumberField. Edit mode prefills and adds the
  manual-initiative field (CBT-4 editCombatant). Emits a normalized values object; the parent
  routes it to addCombatant or editCombatant. Max-HP change ⇏ current HP (handled in the store).
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group';
	import { type Combatant, type CombatantType, COMBATANT_TYPES, UNROLLED } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { NOTE_MAX_LENGTH, RANGES } from '$lib/stores/domain/constants';
	import NumberField from './NumberField.svelte';
	import { typeLabel } from './labels';

	export interface CombatantFormValues {
		name: string;
		type: CombatantType;
		initiativeBonus: number | null;
		maxHp: number | null;
		ac: number | null;
		pd: number | null;
		md: number | null;
		note: string;
		initiative: number | null;
	}

	let {
		mode,
		combatant = null,
		combatActive = false,
		open = $bindable(false),
		onSubmit,
	}: {
		mode: 'add' | 'edit';
		combatant?: Combatant | null;
		/** Active combats surface a manual-initiative field on add too (INI-3 mid-combat add). */
		combatActive?: boolean;
		open?: boolean;
		onSubmit: (values: CombatantFormValues) => void;
	} = $props();

	let name = $state('');
	let type = $state<CombatantType>('enemy');
	let initiativeBonus = $state<number | null>(null);
	let maxHp = $state<number | null>(null);
	let ac = $state<number | null>(null);
	let pd = $state<number | null>(null);
	let md = $state<number | null>(null);
	let note = $state('');
	let initiative = $state<number | null>(null);

	// (Re)initialize the form whenever it opens (prefill on edit, real pre-filled defaults on add —
	// CBT-3b: 10 / 0 / 10 / 10 / 10, not placeholder-only hints).
	$effect(() => {
		if (!open) return;
		if (mode === 'edit' && combatant) {
			name = combatant.name;
			type = combatant.type;
			initiativeBonus = combatant.initiativeBonus;
			maxHp = combatant.maxHp;
			ac = combatant.ac;
			pd = combatant.pd;
			md = combatant.md;
			note = combatant.note;
			initiative = combatant.initiative === UNROLLED ? null : combatant.initiative;
		} else {
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
	});

	// CBT-3c: type-specific name placeholder; also substituted as the real stored name when the
	// name is left empty on save (see submit()).
	const namePlaceholder = $derived(
		type === 'pc'
			? m['forms.field.name.placeholder.pc']()
			: type === 'ally'
				? m['forms.field.name.placeholder.ally']()
				: m['forms.field.name.placeholder.enemy'](),
	);

	// Prototype .field-label recipe (specs/design/prototype.html) — uppercase, muted, small caps.
	// Mirrors NumberField.svelte's own field-label styling for a consistent look across the form.
	const fieldLabelClass = 'text-xs font-medium uppercase tracking-wide text-muted-foreground';

	function submit() {
		const resolvedName = name.trim().length > 0 ? name : namePlaceholder;
		onSubmit({ name: resolvedName, type, initiativeBonus, maxHp, ac, pd, md, note, initiative });
		open = false;
	}
</script>

<Dialog bind:open>
	<DialogContent
		class="flex max-h-[calc(100dvh-2rem)] flex-col rounded-lg border border-[var(--border-strong)] ring-0 sm:max-w-[400px]"
	>
		<DialogHeader>
			<DialogTitle class="text-lg font-semibold">
				{mode === 'add' ? m['forms.combatant.add.title']() : m['forms.combatant.edit.title']()}
			</DialogTitle>
		</DialogHeader>

		<form
			class="flex min-h-0 flex-1 flex-col gap-4"
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
				<!-- Name (optional — empty on save falls back to the type-specific placeholder as the real name) -->
				<div class="flex flex-col gap-[5px]">
					<Label for="cf-name" class={fieldLabelClass}>{m['forms.field.name']()}</Label>
					<Input id="cf-name" class="min-h-11" bind:value={name} placeholder={namePlaceholder} />
				</div>

				<!-- Type -->
				<div class="flex flex-col gap-[5px]">
					<Label class={fieldLabelClass}>{m['forms.field.type']()}</Label>
					<ToggleGroup
						type="single"
						value={type}
						onValueChange={(v) => v && (type = v as CombatantType)}
						variant="outline"
						class="w-full"
					>
						{#each COMBATANT_TYPES as t (t)}
							<ToggleGroupItem
								value={t}
								class="min-h-11 flex-1 text-muted-foreground data-[state=on]:bg-primary data-[state=on]:font-semibold data-[state=on]:text-primary-foreground"
							>
								{typeLabel[t]()}
							</ToggleGroupItem>
						{/each}
					</ToggleGroup>
				</div>

				<div class="grid grid-cols-2 gap-3">
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

				<div class="grid grid-cols-2 gap-3">
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

				<div class="flex flex-col gap-[5px]">
					<Label for="cf-note" class={fieldLabelClass}>{m['forms.field.note']()}</Label>
					<Textarea
						id="cf-note"
						bind:value={note}
						maxlength={NOTE_MAX_LENGTH}
						placeholder={m['forms.field.note.placeholder']()}
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<NumberField
						id="cf-initbonus"
						label={m['forms.field.initBonus']()}
						bind:value={initiativeBonus}
						min={RANGES.initiativeBonus.min}
						max={RANGES.initiativeBonus.max}
					/>
					{#if mode === 'edit' || (mode === 'add' && combatActive)}
						<NumberField
							id="cf-init"
							label={m['forms.field.initValue']()}
							bind:value={initiative}
							min={RANGES.initiative.min}
							max={RANGES.initiative.max}
						/>
					{/if}
				</div>
			</div>

			<DialogFooter class="mx-0 mb-0 flex-row justify-center gap-2 border-t-0 bg-transparent p-0 pt-1">
				<Button
					type="button"
					variant="outline"
					class="h-11 min-w-0 flex-1 shrink basis-0 rounded-sm border-[var(--border-strong)]"
					onclick={() => (open = false)}
				>
					{m['forms.action.cancel']()}
				</Button>
				<Button type="submit" size="lg" class="h-11 min-w-0 flex-1 shrink basis-0 rounded-sm">
					{mode === 'add' ? m['forms.action.add']() : m['forms.action.save']()}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
