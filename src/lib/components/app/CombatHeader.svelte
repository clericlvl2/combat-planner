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
	import { tick } from 'svelte';
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
	import { escalationDie, showRoundAndEscalation } from '$lib/stores/domain/derive';
	import type { CombatController } from './controller';
	import DesktopNav from './DesktopNav.svelte';
	import EscalationEditor from './EscalationEditor.svelte';
	import RoundEditor from './RoundEditor.svelte';

	let {
		combat,
		controller,
		onAdd,
		addPending = false,
		onStart,
		onAdvance,
		canAdvance = false,
	}: {
		combat: Combat;
		controller: CombatController;
		onAdd: () => void;
		/** True while the caller's `onAdd` is loading the deferred CombatantForm chunk (W-054) —
		 *  surfaced as `aria-busy` on this header's own Add entry points. */
		addPending?: boolean;
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
	const Restart = chromeIcon.restart;
	const Erase = chromeIcon.erase;

	// round editor
	let roundOpen = $state(false);
	function saveRound(value: number) {
		controller.editRound(value);
		roundOpen = false;
	}

	// escalation editor — tap to open (round counter's editor uses the same pattern)
	let escAnchor = $state<HTMLElement | null>(null);
	let escOpen = $state(false);
	function saveEsc(value: number) {
		controller.setEscalation(value);
		escOpen = false;
	}

	// confirms — ConfirmDialog is lazy (W-054): CombatHeader is a page singleton (one instance
	// mounted per combat), so an instance-scoped holder is correct here (unlike CombatRow's
	// module-level holder, needed only because a row list mounts N simultaneous instances).
	// Clear and Restart share one loader/module since both route through the same component;
	// `.catch` clears the in-flight promise so a later menu-select retries, and never sets
	// `open` — the menu item stays usable.
	let clearOpen = $state(false);
	let restartOpen = $state(false);
	let confirmModule = $state<typeof import('./ConfirmDialog.svelte')>();
	let confirmPromise: Promise<boolean> | undefined;
	let confirmPending = $state(false);

	function loadConfirm(): Promise<boolean> {
		if (confirmModule) return Promise.resolve(true);
		if (confirmPromise) return confirmPromise;
		confirmPending = true;
		confirmPromise = import('./ConfirmDialog.svelte')
			.then((mod) => {
				confirmModule = mod;
				confirmPending = false;
				return true;
			})
			.catch(() => {
				confirmPromise = undefined;
				confirmPending = false;
				return false;
			});
		return confirmPromise;
	}

	async function requestClear() {
		if (await loadConfirm()) {
			await tick();
			clearOpen = true;
		}
	}

	async function requestRestart() {
		if (await loadConfirm()) {
			await tick();
			restartOpen = true;
		}
	}
</script>

<header class="flex h-13 shrink-0 items-center border-b border-border bg-card">
	<div class="content-container-wide flex w-full items-center gap-2">
		<Button
			href="/combats"
			variant="ghost"
			aria-label={m['a11y.back']()}
			class="-ml-2 flex min-h-11 min-w-0 max-w-full shrink items-center justify-start gap-1 px-2 text-lg font-semibold"
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
				size="chrome"
				class="hidden rounded-full bg-foreground/10 lg:inline-flex"
				aria-label={m['setup.addCombatant']()}
				aria-busy={addPending}
				title={m['setup.addCombatant']()}
				onclick={onAdd}
			>
				<Add class="size-5" />
			</Button>
			{#if combat.combatants.length > 0}
				<Button
					variant="ghost"
					size="chrome"
					class="hidden rounded-full bg-foreground/10 lg:inline-flex"
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
				size="chrome"
				class="hidden rounded-full bg-foreground/10 lg:inline-flex"
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
						size="chrome"
						class="shrink-0"
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
					<DropdownMenuItem aria-busy={addPending} onSelect={onAdd}>
						<Add class="size-4" />
						{m['combat.menu.add']()}
					</DropdownMenuItem>
					<DropdownMenuItem aria-busy={confirmPending} onSelect={requestRestart}>
						<Restart class="size-4" />
						{m['combat.menu.restart']()}
					</DropdownMenuItem>
				{/if}
				<DropdownMenuItem aria-busy={confirmPending} onSelect={requestClear}>
					<Erase class="size-4" />
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
			class="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5"
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
					{#key roundOpen}
						<RoundEditor round={combat.round} onSave={saveRound} />
					{/key}
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
					{#key escOpen}
						<EscalationEditor {esc} onSave={saveEsc} />
					{/key}
				</PopoverContent>
			</Popover>
		</div>
	</div>
{/if}

{#if confirmModule}
	{@const Confirm = confirmModule.default}
	<Confirm
		bind:open={clearOpen}
		title={m['dialogs.clearCombat.title']()}
		body={m['dialogs.clearCombat.body']()}
		confirmLabel={m['dialogs.clearCombat.confirm']()}
		onConfirm={() => {
			controller.clear();
			clearOpen = false;
		}}
	/>
	<Confirm
		bind:open={restartOpen}
		title={m['dialogs.restart.title']()}
		body={m['dialogs.restart.body']()}
		confirmLabel={m['dialogs.restart.confirm']()}
		onConfirm={() => {
			controller.restart();
			restartOpen = false;
		}}
	/>
{/if}
