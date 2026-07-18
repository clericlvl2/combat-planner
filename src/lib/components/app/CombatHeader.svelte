<!--
  CombatHeader — the one top bar across Setup and
  Active: back · chrome-title (combat.title) · desktop-only tonal roundel icon buttons (Setup:
  header-add/header-start; Active: header-advance) — mobile uses the FAB stack in
  +page.svelte instead · overflow ⋮ menu (Undo ↶ / Redo ↷ at top, each disabled at its
  stack end; Setup → Clear; Active → Add, Restart, Clear) · the shared DesktopNav
  (Combats/Settings/About) renders last, as its own visually distinct section after every
  page-control button. Active renders a RoundEscBar sub-bar (uppercase label /
  tabular-value pairs) below the header chrome, still tap-to-edit via the same popovers as before
  the restyle. Restart / Clear route through ConfirmDialog (undoable via the stack). Reads the
  combat; emits intent via the controller + the page-owned add form.
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger,
	} from '$lib/components/ui/dropdown-menu';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import type { Combat } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import { RANGES } from '$lib/stores/domain/constants';
	import { escalationDie, showRoundAndEscalation } from '$lib/stores/domain/derive';
	import type { CombatController } from './controller';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import DesktopNav from './DesktopNav.svelte';
	import NumberField from './NumberField.svelte';

	let {
		combat,
		controller,
		onAdd,
		onStart,
		onAdvance,
		canAdvance = false,
	}: {
		combat: Combat;
		controller: CombatController;
		onAdd: () => void;
		onStart: () => void;
		onAdvance?: () => void;
		canAdvance?: boolean;
	} = $props();

	const isActive = $derived(showRoundAndEscalation(combat));
	const canUndo = $derived(combat.undoStack.length > 0);
	const canRedo = $derived(combat.redoStack.length > 0);
	const esc = $derived(escalationDie(combat));

	const Back = chromeIcon.back;
	const Undo = chromeIcon.undo;
	const Redo = chromeIcon.redo;
	const Overflow = chromeIcon.overflow;
	const Add = chromeIcon.add;
	const Advance = chromeIcon.advance;
	const Start = chromeIcon.start;

	// round editor
	let roundOpen = $state(false);
	let roundEntry = $state<number | null>(null);
	$effect(() => {
		if (roundOpen) roundEntry = combat.round;
	});
	function saveRound() {
		if (roundEntry !== null) controller.editRound(roundEntry);
		roundOpen = false;
	}

	// escalation editor — tap to open (round counter's editor uses the same pattern)
	let escAnchor = $state<HTMLElement | null>(null);
	let escOpen = $state(false);
	let escEntry = $state<number | null>(null);
	$effect(() => {
		if (escOpen) escEntry = esc;
	});
	function saveEsc() {
		if (escEntry !== null) controller.setEscalation(escEntry);
		escOpen = false;
	}

	// confirms
	let clearOpen = $state(false);
	let restartOpen = $state(false);
</script>

<header class="flex h-13 shrink-0 items-center border-b border-border bg-card">
	<div class="content-container-wide flex w-full items-center gap-2">
		<Button
			href="/combats"
			variant="ghost"
			aria-label={m['a11y.back']()}
			class="-ml-2 flex min-h-11 min-w-0 max-w-full items-center justify-start gap-1 px-2 text-lg font-semibold"
		>
			<Back class="size-5 shrink-0" />
			<span class="min-w-0 truncate">{combat.title}</span>
		</Button>

		<div class="min-w-0 flex-1"></div>

		{#if !isActive}
			<!-- Setup — desktop-only header pair (mobile uses the FAB stack in +page.svelte instead).
			     Add is always available; Start only once the roster isn't empty. -->
			<Button
				variant="ghost"
				size="icon"
				class="hidden size-11 rounded-full bg-foreground/10 lg:inline-flex lg:size-8"
				aria-label={m['setup.addCombatant']()}
				title={m['setup.addCombatant']()}
				onclick={onAdd}
			>
				<Add class="size-5" />
			</Button>
			{#if combat.combatants.length > 0}
				<Button
					variant="ghost"
					size="icon"
					class="hidden size-11 rounded-full bg-foreground/10 lg:inline-flex lg:size-8"
					aria-label={m['setup.start']()}
					title={m['setup.start']()}
					onclick={onStart}
				>
					<Start class="size-5" />
				</Button>
			{/if}
		{:else}
			<!-- Active — desktop-only header-advance tonal roundel (mirrors the Setup
			     header-add/header-start pattern above); mobile keeps the Advance FAB. -->
			<Button
				variant="ghost"
				size="icon"
				class="hidden size-11 rounded-full bg-foreground/10 lg:inline-flex lg:size-8"
				disabled={!canAdvance}
				aria-label={m['active.advance']()}
				title={m['active.advance']()}
				onclick={onAdvance}
			>
				<Advance class="size-5" />
			</Button>
		{/if}

		<!-- Overflow menu -->
		<DropdownMenu>
			<DropdownMenuTrigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="ghost"
						size="icon"
						class="size-11 shrink-0 lg:size-8"
						aria-label={m['a11y.combatRowMenu']({ title: combat.title })}
					>
						<Overflow class="size-5" />
					</Button>
				{/snippet}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" class="w-56">
				<DropdownMenuItem disabled={!canUndo} onSelect={controller.undo}>
					<Undo class="size-4" />
					{m['combat.undo']()}
				</DropdownMenuItem>
				<DropdownMenuItem disabled={!canRedo} onSelect={controller.redo}>
					<Redo class="size-4" />
					{m['combat.redo']()}
				</DropdownMenuItem>
				{#if isActive}
					<DropdownMenuItem onSelect={onAdd}>
						<Add class="size-4" />
						{m['combat.menu.add']()}
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={() => (restartOpen = true)}>
						{m['combat.menu.restart']()}
					</DropdownMenuItem>
				{/if}
				<DropdownMenuItem onSelect={() => (clearOpen = true)}>
					{m['combat.menu.clear']()}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>

		<DesktopNav />
	</div>
</header>

{#if isActive}
	<!-- Round / Escalation-die sub-bar (component-inventory "Header (Combat screen)") — replaces
	     the old header-center pills; still tap-to-edit via the same popovers. Wrapped in the
	     shared content-container so it aligns with the capped body on desktop instead of going
	     full-bleed like the header bar above it. -->
	<div class="content-container mt-3 w-full">
		<div
			class="flex items-center justify-between rounded-[var(--radius)] border border-border bg-card px-3 py-2.5"
		>
			<Popover bind:open={roundOpen}>
				<PopoverTrigger
					class="flex cursor-pointer items-baseline gap-1.5 rounded-md hover:bg-muted"
					aria-label={m['a11y.editRound']()}
				>
					<span class="text-xs font-normal tracking-wide text-muted-foreground uppercase">
						{m['combat.round.label']()}
					</span>
					<span class="text-base font-semibold tabular-nums">{combat.round}</span>
				</PopoverTrigger>
				<PopoverContent class="w-48">
					<NumberField
						id="round-edit"
						label={m['combat.round']({ n: combat.round })}
						bind:value={roundEntry}
						min={RANGES.round.min}
						max={RANGES.round.max}
					/>
					<div class="flex justify-end">
						<Button size="lg" class="w-full" onclick={saveRound}>{m['forms.action.save']()}</Button>
					</div>
				</PopoverContent>
			</Popover>

			<!-- Escalation die (0–6) — tap to open the manual entry popover -->
			<Popover bind:open={escOpen}>
				<button
					bind:this={escAnchor}
					type="button"
					class="flex cursor-pointer items-baseline gap-1.5 rounded-md hover:bg-muted"
					aria-label={m['a11y.escalation']({ n: esc })}
					aria-haspopup="dialog"
					onclick={() => (escOpen = true)}
				>
					<span class="text-xs font-normal tracking-wide text-muted-foreground uppercase">
						{m['combat.escalation']()}
					</span>
					<span class="text-base font-semibold tabular-nums">{esc}</span>
				</button>
				<PopoverContent customAnchor={escAnchor} class="w-48">
					<NumberField
						id="esc-edit"
						label={m['combat.escalation']()}
						bind:value={escEntry}
						min={RANGES.escalation.min}
						max={RANGES.escalation.max}
					/>
					<div class="flex justify-end">
						<Button size="lg" class="w-full" onclick={saveEsc}>{m['forms.action.save']()}</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	</div>
{/if}

<ConfirmDialog
	bind:open={clearOpen}
	title={m['dialogs.clearCombat.title']()}
	body={m['dialogs.clearCombat.body']()}
	confirmLabel={m['dialogs.clearCombat.confirm']()}
	onConfirm={() => {
		controller.clear();
		clearOpen = false;
	}}
/>
<ConfirmDialog
	bind:open={restartOpen}
	title={m['dialogs.restart.title']()}
	body={m['dialogs.restart.body']()}
	confirmLabel={m['dialogs.restart.confirm']()}
	onConfirm={() => {
		controller.restart();
		restartOpen = false;
	}}
/>
