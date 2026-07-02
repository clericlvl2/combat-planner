<!--
  CombatantRow (Component Inventory §8, UX §4c) — one roster row, compact ↔ expanded via Collapsible.
  Leading edge: type color stripe(s) (pc=2 green, ally=1 blue, enemy=1 red — color-only, `aria-label`
  compensates). Compact: HP cell (opens numpad) · name (toggles expand) · health bar + band ·
  AC/PD/MD (fixed width) · condition tags (read-only, all shown, wraps). When expanded, that same
  tag row also gets two tag-styled triggers appended: "+ Condition" (always, opens the
  ConditionPicker modal) and "+ Note" (hidden once the note is non-empty — has a note → no button,
  just the inline textarea; collapsing while still empty resets it back to the chip on next
  expand), and each condition chip grows a removable `×`. Trailing: init cell (disabled while combat
  is active — initiative then only edits via CombatantForm) · persistent `⋮` actions menu (edit /
  duplicate / remove, visible collapsed or expanded). Card background reflects HP status (bloodied /
  dead, type-aware); active-turn highlight when `active`. Reads the combatant; emits intent via the
  controller + the page-owned numpad/edit dialogs (no business logic here).
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
	import { healthStatus } from '$lib/stores/domain/derive';
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

	// Card bg by HP status (Rules §4): 100–50% → normal; <50% → bloodied tint; ≤0 → dead tint,
	// split by type (enemy/ally read as a neutral "down", PC reads as the alarm dead tint).
	const status = $derived(healthStatus(combatant));
	const cardBgClass = $derived.by(() => {
		if (status === 'dead') {
			return combatant.type === 'pc'
				? 'bg-health-dead/10'
				: 'bg-combat-neutral/10 text-muted-foreground';
		}
		if (status === 'bloodied') return 'bg-health-bloodied/10';
		return '';
	});

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

	/** "+ Condition" / "+ Note" triggers — same h-4/px-1.5/py-0.5/text-[10px] box as the condition
	 *  tags (Badge), just dashed to read as an affordance rather than a value (UX §4c). */
	const tagTriggerClass =
		'inline-flex h-4 items-center gap-1 rounded-4xl border border-dashed border-muted-foreground/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:border-foreground hover:text-foreground';
</script>

<Card class={['overflow-hidden p-0', cardBgClass, active && 'ring-2 ring-primary']} data-active={active}>
	<div class="flex items-stretch">
		<div class="flex shrink-0" aria-label={stripeLabel}>
			{#each stripes as _, i (i)}
				<span class={['w-1.5', typeColor[combatant.type]]}></span>
			{/each}
		</div>

		<div class="min-w-0 flex-1 p-2">
			<Collapsible bind:open>
				<div class="flex items-center gap-2">
					<button
						type="button"
						class="flex w-24 shrink-0 flex-col items-center gap-0 self-start rounded-md px-2 py-1 tabular-nums hover:bg-muted"
						aria-label={hpLabel}
						onclick={() => onOpenNumpad(combatant.id)}
					>
						<span class="text-[9px] leading-none font-normal text-muted-foreground">HP</span>
						<span class="flex items-center gap-1 text-lg leading-none font-semibold">
							{combatant.currentHp}/{combatant.maxHp}
							{#if combatant.tempHp > 0}
								<span
									class="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-combat-blue text-[10px] leading-none font-medium text-white"
								>
									{combatant.tempHp}
								</span>
							{/if}
						</span>
					</button>

					<div class="flex min-w-0 flex-1 flex-col gap-1">
						<CollapsibleTrigger class="flex items-center gap-1.5 text-left" aria-label={toggleLabel}>
							<span class="truncate font-medium">{combatant.name}</span>
							<Chevron class={['ml-auto size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180']} />
						</CollapsibleTrigger>
						<HealthBar {combatant} />
						<div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
							<span class="shrink-0 tabular-nums">AC {combatant.ac} · PD {combatant.pd} · MD {combatant.md}</span>
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
						</div>
					</div>

					<InitCell
						{combatant}
						onRoll={controller.roll}
						onSetInitiative={controller.setInitiative}
						editable={!combatActive}
						class="text-xs text-muted-foreground"
					/>

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

					<ConditionPicker
						bind:open={conditionsOpen}
						conditions={combatant.conditions}
						name={combatant.name}
						onAdd={(c) => controller.addCondition(combatant.id, c)}
						onRemove={(c) => controller.removeCondition(combatant.id, c)}
					/>
				</CollapsibleContent>
			</Collapsible>
		</div>
	</div>
</Card>
