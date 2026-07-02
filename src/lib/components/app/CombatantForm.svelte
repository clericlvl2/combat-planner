<!--
  CombatantForm (Component Inventory §10, Rules §7) — add/edit a combatant in a Dialog. Name is
  required (whitespace-only blocks submit); numeric fields clamp via NumberField and default to the
  Rules §7 placeholders when left blank (the factory/store fills them). Edit mode prefills and adds
  the manual-initiative field (Data §7 editCombatant). Emits a normalized values object; the parent
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
		/** Active combats surface a manual-initiative field on add too (Data §7 mid-combat add). */
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
	let touched = $state(false);

	// (Re)initialize the form whenever it opens (prefill on edit, blank defaults on add).
	$effect(() => {
		if (!open) return;
		touched = false;
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
			initiativeBonus = null;
			maxHp = null;
			ac = null;
			pd = null;
			md = null;
			note = '';
			initiative = null;
		}
	});

	const nameValid = $derived(name.trim().length > 0);

	function submit() {
		touched = true;
		if (!nameValid) return;
		onSubmit({ name, type, initiativeBonus, maxHp, ac, pd, md, note, initiative });
		open = false;
	}
</script>

<Dialog bind:open>
	<DialogContent class="max-w-lg sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>
				{mode === 'add' ? m['forms.combatant.add.title']() : m['forms.combatant.edit.title']()}
			</DialogTitle>
		</DialogHeader>

		<form
			class="flex flex-col gap-3"
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<!-- Name (required) -->
			<div class="flex flex-col gap-1">
				<Label for="cf-name">{m['forms.field.name']()}</Label>
				<Input
					id="cf-name"
					bind:value={name}
					placeholder={m['forms.field.name.placeholder']()}
					required
					aria-invalid={touched && !nameValid}
					oninput={() => (touched = true)}
				/>
				<p class={['min-h-4 text-xs text-destructive', !(touched && !nameValid) && 'invisible']}>
					{m['errors.nameRequired']()}
				</p>
			</div>

			<!-- Type -->
			<div class="flex flex-col gap-1">
				<Label>{m['forms.field.type']()}</Label>
				<ToggleGroup
					type="single"
					value={type}
					onValueChange={(v) => v && (type = v as CombatantType)}
					variant="outline"
					class="justify-start"
				>
					{#each COMBATANT_TYPES as t (t)}
						<ToggleGroupItem value={t} class="px-3">{typeLabel[t]()}</ToggleGroupItem>
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
					placeholder="10"
				/>
				<NumberField
					id="cf-initbonus"
					label={m['forms.field.initBonus']()}
					bind:value={initiativeBonus}
					min={RANGES.initiativeBonus.min}
					max={RANGES.initiativeBonus.max}
					placeholder="0"
				/>
				<NumberField
					id="cf-ac"
					label={m['forms.field.ac']()}
					bind:value={ac}
					min={RANGES.ac.min}
					max={RANGES.ac.max}
					placeholder="10"
				/>
				<NumberField
					id="cf-pd"
					label={m['forms.field.pd']()}
					bind:value={pd}
					min={RANGES.pd.min}
					max={RANGES.pd.max}
					placeholder="10"
				/>
				<NumberField
					id="cf-md"
					label={m['forms.field.md']()}
					bind:value={md}
					min={RANGES.md.min}
					max={RANGES.md.max}
					placeholder="10"
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

			<div class="flex flex-col gap-1">
				<Label for="cf-note">{m['forms.field.note']()}</Label>
				<Textarea
					id="cf-note"
					bind:value={note}
					maxlength={NOTE_MAX_LENGTH}
					placeholder={m['forms.field.note.placeholder']()}
				/>
			</div>

			<DialogFooter>
				<Button type="button" variant="ghost" class="w-full" onclick={() => (open = false)}>
					{m['forms.action.cancel']()}
				</Button>
				<Button type="submit" size="lg" class="w-full">{m['forms.action.save']()}</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
