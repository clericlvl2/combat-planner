<!--
  CombatantRow (Component Inventory §8, UX §4c) — one roster card, compact ↔ expanded via
  Collapsible. Card shape ported from `specs/design/card-prototype.html` (locked in
  `component-inventory.md`'s "Combatant card" section): leading TypeStripe(s) (pc=2 green,
  ally=1 blue, enemy=1 red — color-only, `aria-label` compensates) · Row 1 name + expand chevron +
  trailing `⋮` overflow menu · Row 2 big HP (+ temp-HP badge) inside a fixed-width block, and a
  health bar filling the remaining width · Row 3 AC/PD/MD + Init pill · Row 4 condition chips
  (read-only, all shown, wraps) · Row 5 note. When expanded, Row 4 also gets two tag-styled
  triggers appended: "+ Condition" (always, opens the ConditionPicker modal) and "+ Note" (hidden
  once the note is non-empty — has a note → no button, just the inline textarea; collapsing while
  still empty resets it back to the chip on next expand), and each condition chip grows a
  removable `×`. A read-only note line renders under the card whenever a note is set and the row
  is collapsed (the inline textarea already covers the expanded case). Trailing: init cell
  (disabled while combat is active — initiative then only edits via CombatantForm) · persistent
  `⋮` actions menu (edit / duplicate / remove, visible collapsed or expanded). Active-turn
  highlight when `active` (health-band card-bg tint removed per the R4 restyle — the health bar's
  fill colour change alone is the signal). Reads the combatant; emits intent via the controller +
  the page-owned numpad/edit dialogs (no business logic here).
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger,
	} from '$lib/components/ui/dropdown-menu';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { Combatant } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import { NOTE_MAX_LENGTH } from '$lib/stores/domain/constants';
	import type { CombatController } from './controller';
	import ConditionIconList from './ConditionIconList.svelte';
	import ConditionPicker from './ConditionPicker.svelte';
	import HealthBar from './HealthBar.svelte';
	import InitCell from './InitCell.svelte';
	import { typeColor, typeLabel, typeStripeCount } from './labels';

	let {
		combatant,
		active = false,
		combatActive = false,
		controller,
		onOpenNumpad,
		onEdit,
	}: {
		combatant: Combatant;
		active?: boolean;
		combatActive?: boolean;
		controller: CombatController;
		onOpenNumpad: (id: string) => void;
		onEdit: (id: string) => void;
	} = $props();

	let open = $state(false);
	let noteEditing = $state(false);
	let noteEl = $state<HTMLTextAreaElement | null>(null);
	let conditionsOpen = $state(false);

	const toggleLabel = $derived(
		open
			? m['a11y.rowCollapse']({ name: combatant.name })
			: m['a11y.rowExpand']({ name: combatant.name }),
	);
	const hpLabel = $derived(
		m['numpad.summary.hp']({ cur: combatant.currentHp, max: combatant.maxHp }),
	);
	const menuLabel = $derived(m['a11y.combatRowMenu']({ title: combatant.name }));
	const showNoteEditor = $derived(combatant.note !== '' || noteEditing);

	// Type stripe(s) at the card's leading edge — color-only signal, aria-label compensates.
	const stripes = $derived(Array.from({ length: typeStripeCount[combatant.type] }));
	const stripeLabel = $derived(m['a11y.typeBadge']({ type: typeLabel[combatant.type]() }));

	$effect(() => {
		if (noteEditing) noteEl?.focus();
	});

	// Collapsing without having typed a note resets to just the chip on next expand.
	$effect(() => {
		if (!open) noteEditing = false;
	});

	function commitNote(e: Event) {
		controller.edit(combatant.id, { note: (e.currentTarget as HTMLTextAreaElement).value });
	}

	const Chevron = chromeIcon.expand;
	const Overflow = chromeIcon.overflow;
	const Edit = chromeIcon.edit;
	const Duplicate = chromeIcon.duplicate;
	const Remove = chromeIcon.remove;

	/** "+ Condition" / "+ Note" triggers — same chip box as the condition tags (Badge), just
	 *  dashed to read as an affordance rather than a value (UX §4c). */
	const tagTriggerClass =
		'inline-flex h-6 items-center gap-1 rounded-full border border-dashed border-muted-foreground/50 px-2.5 py-0.5 text-sm font-medium text-muted-foreground hover:border-foreground hover:text-foreground';

	/** Def-stat value styling (Row 3) — bold + full-color against the muted label text. */
	const statClass = 'font-semibold text-foreground tabular-nums';
</script>

<Card
	class={[
		'overflow-hidden rounded-[12px] border-[length:var(--card-border)] border-border p-0 ring-0',
		active && 'border-ring ring-2 ring-ring',
	]}
	data-active={active}
>
	<div class="flex items-stretch">
		<div class="flex shrink-0 gap-1" aria-label={stripeLabel}>
			{#each stripes as _, i (i)}
				<span class={['w-1.5', typeColor[combatant.type]]}></span>
			{/each}
		</div>

		<div class="min-w-0 flex-1 p-[var(--card-pad)]">
			<Collapsible bind:open>
				<div class="flex flex-col gap-[var(--card-gap)]">
					<!-- Row 1: active-turn dot + name + expand chevron + overflow menu -->
					<div class="flex items-center gap-2">
						{#if active}
							<span class="shrink-0 text-[14px] leading-none text-ring" aria-hidden="true">▶</span>
						{/if}
						<CollapsibleTrigger
							class="flex min-w-0 flex-1 items-center gap-1.5 text-left"
							aria-label={toggleLabel}
						>
							<span class="truncate font-medium">{combatant.name}</span>
							<Chevron
								class={[
									'size-4 shrink-0 text-muted-foreground transition-transform',
									open && 'rotate-180',
								]}
							/>
						</CollapsibleTrigger>

						<DropdownMenu>
							<DropdownMenuTrigger>
								{#snippet child({ props })}
									<Button {...props} variant="ghost" size="icon" aria-label={menuLabel}>
										<Overflow class="size-4" />
									</Button>
								{/snippet}
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onSelect={() => onEdit(combatant.id)}>
									<Edit class="size-4" />
									{m['forms.action.edit']()}
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={() => controller.duplicate(combatant.id)}>
									<Duplicate class="size-4" />
									{m['forms.action.duplicate']()}
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem variant="destructive" onSelect={() => controller.remove(combatant.id)}>
									<Remove class="size-4" />
									{m['forms.action.remove']()}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<!-- Row 2: big HP (+ temp-HP badge), fixed-width, + health bar filling the rest -->
					<div class="flex items-center gap-3">
						<button
							type="button"
							class="relative flex w-24 shrink-0 items-center gap-1 rounded-md px-1 py-1 tabular-nums hover:bg-muted"
							aria-label={hpLabel}
							onclick={() => onOpenNumpad(combatant.id)}
						>
							<span class="relative text-[length:var(--hp-size)] leading-none font-semibold">
								{combatant.currentHp}/{combatant.maxHp}
								{#if combatant.tempHp > 0}
									<span
										class="absolute -top-1.5 -right-5 inline-flex h-4 w-[var(--badge-width)] shrink-0 items-center justify-center rounded-full bg-combat-blue text-xs leading-none font-medium text-white"
									>
										{combatant.tempHp}
									</span>
								{/if}
							</span>
						</button>
						<div class="min-w-0 flex-1">
							<HealthBar {combatant} />
						</div>
					</div>

					<!-- Row 3: AC/PD/MD + Init pill -->
					<div class="flex items-center gap-3">
						<span class="flex-1 text-xs text-muted-foreground">
							AC <b class={statClass}>{combatant.ac}</b> ·
							PD <b class={statClass}>{combatant.pd}</b> ·
							MD <b class={statClass}>{combatant.md}</b>
						</span>
						<InitCell
							{combatant}
							onRoll={controller.roll}
							onSetInitiative={controller.setInitiative}
							editable={!combatActive}
						/>
					</div>

					<!-- Row 4: condition chips (always) + expand-only triggers -->
					<div class="flex flex-wrap items-center gap-1">
						<ConditionIconList
							conditions={combatant.conditions}
							removable={open}
							onRemove={(c) => controller.removeCondition(combatant.id, c)}
						/>
						{#if open}
							<button type="button" class={tagTriggerClass} onclick={() => (conditionsOpen = true)}>
								+ {m['conditions.addShort']()}
							</button>
							{#if !showNoteEditor}
								<button type="button" class={tagTriggerClass} onclick={() => (noteEditing = true)}>
									+ {m['forms.note.addShort']()}
								</button>
							{/if}
						{/if}
					</div>

					<!-- Row 5: read-only note line — collapsed only (expanded keeps the inline editor below,
					     which already renders the note's text whenever it's set). -->
					{#if !open && combatant.note !== ''}
						<p class="text-sm text-muted-foreground italic">{combatant.note}</p>
					{/if}
				</div>

				<CollapsibleContent class="flex flex-col gap-2 pt-3">
					{#if showNoteEditor}
						<Textarea
							id="note-{combatant.id}"
							bind:ref={noteEl}
							value={combatant.note}
							maxlength={NOTE_MAX_LENGTH}
							placeholder={m['forms.note.add']()}
							onchange={commitNote}
						/>
					{/if}
				</CollapsibleContent>
			</Collapsible>

			<ConditionPicker
				bind:open={conditionsOpen}
				conditions={combatant.conditions}
				name={combatant.name}
				onAdd={(c) => controller.addCondition(combatant.id, c)}
				onRemove={(c) => controller.removeCondition(combatant.id, c)}
			/>
		</div>
	</div>
</Card>
