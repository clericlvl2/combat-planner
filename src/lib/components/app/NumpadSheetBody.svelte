<!--
  NumpadSheetBody — the entry display, digit pad, commit actions, and HP-log history for
  NumpadSheet, extracted so its local `$state` (`entry`, `historyOpen`) can be seeded once at
  mount. NumpadSheet remounts this component via `{#key open}` every time the sheet opens, so a
  fresh entry and a collapsed History section are structural rather than effect-driven (Phase 2,
  2026-07-28 plan).
-->
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Collapsible,
		CollapsibleContent,
		CollapsibleTrigger,
	} from '$lib/components/ui/collapsible';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import type { Combatant, HpLogEntry } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import { healthStatus } from '$lib/stores/domain/derive';
	import { healthTextColor } from './labels';

	let {
		combatant,
		onDamage,
		onRestore,
		onSetTempHp,
		onClose,
	}: {
		combatant: Combatant;
		onDamage: (id: string, n: number) => void;
		onRestore: (id: string, n: number) => void;
		onSetTempHp: (id: string, n: number) => void;
		onClose: () => void;
	} = $props();

	let entry = $state('');
	let historyOpen = $state(false);

	const empty = $derived(entry === '');
	const value = $derived(empty ? 0 : Number(entry));
	const history = $derived([...combatant.hpLog].reverse());
	const status = $derived(healthStatus(combatant));

	const actionLabel: Record<HpLogEntry['type'], () => string> = {
		damage: m['numpad.history.action.damage'],
		heal: m['numpad.history.action.heal'],
		setTemp: m['numpad.history.action.setTemp'],
		setMax: m['numpad.history.action.setMax'],
	};

	/** Damage = red, heal = green, setTemp = blue, setMax = neutral — matches the commit buttons. */
	const actionBadgeClass: Record<HpLogEntry['type'], string> = {
		damage: 'border-destructive/30 text-destructive',
		heal: 'border-health-full/30 text-health-full',
		setTemp: 'border-combat-blue/30 text-combat-blue',
		setMax: '',
	};

	/** Diff-value text color per entry type (HpLogEntryRow — colour-coded left column). */
	const actionDiffClass: Record<HpLogEntry['type'], string> = {
		damage: 'text-destructive',
		heal: 'text-health-full',
		setTemp: 'text-combat-blue',
		setMax: '',
	};

	const Backspace = chromeIcon.backspace;
	const ClearIcon = chromeIcon.clear;
	const Expand = chromeIcon.expand;

	function push(d: string) {
		if (entry.length >= 4) return; // ≤ 9999, covers the HP ranges
		entry += d;
	}
	function backspace() {
		entry = entry.slice(0, -1);
	}
	function clear() {
		entry = '';
	}

	function commit(fn: (id: string, n: number) => void) {
		if (empty) return;
		fn(combatant.id, value);
		onClose();
	}
</script>

<div class="flex flex-col gap-3">
	<!-- HpSummaryHeader: cur/max + temp buffer — cur HP is the distinctive value here -->
	<div class="flex items-baseline justify-between gap-2">
		<span class="truncate font-semibold">{combatant.name}</span>
		<span class="shrink-0 tabular-nums">
			<span class={['text-xl font-bold', healthTextColor[status]]}>{combatant.currentHp}</span>
			<span class="text-base text-muted-foreground">/{combatant.maxHp}</span>
			{#if combatant.tempHp > 0}
				<span class="ml-1 text-muted-foreground">
					{m['numpad.summary.temp']({ temp: combatant.tempHp })}
				</span>
			{/if}
		</span>
	</div>

	<!-- EntryDisplay -->
	<div
		class="flex h-10 items-center justify-end rounded-md border border-border bg-background px-3 text-lg font-semibold tabular-nums"
		aria-live="polite"
	>
		{entry || '0'}
	</div>

	<!-- CommitActions (rendered above the digit pad — component-inventory.md "Numpad sheet"; empty entry → disabled no-op).
	     Tint recipe: transparent fill + a tinted border + solid-color text (no bg fill) —
	     WCAG-AA verified against both --surface/--popover themes (see phase report); a
	     filled color-mix background drops below 4.5:1 for at least one of the three colors
	     in each theme with these token
	     hexes, so the border-only recipe is the AA-safe stand-in. -->
	<div class="grid grid-cols-3 gap-2">
		<Button
			variant="soft"
			size="action"
			style="--tc: var(--destructive)"
			class="text-xs font-bold"
			disabled={empty}
			onclick={() => commit(onDamage)}
		>
			{m['numpad.dealDamage']()}
		</Button>
		<Button
			variant="soft"
			size="action"
			style="--tc: var(--health-full)"
			class="text-xs font-bold"
			disabled={empty}
			onclick={() => commit(onRestore)}
		>
			{m['numpad.restoreHp']()}
		</Button>
		<Button
			variant="soft"
			size="action"
			style="--tc: var(--combat-blue)"
			class="text-xs font-bold"
			disabled={empty}
			onclick={() => commit(onSetTempHp)}
		>
			{m['numpad.setTempHp']()}
		</Button>
	</div>

	<!-- DigitPad -->
	<div class="grid grid-cols-3 gap-2">
		{#each ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as d (d)}
			<Button
				variant="outline"
				size="action"
				class="text-lg font-semibold"
				aria-label={m['a11y.numpad.digit']({ n: d })}
				onclick={() => push(d)}
			>
				{d}
			</Button>
		{/each}
		<Button
			variant="outline"
			size="action"
			class="bg-transparent dark:bg-transparent"
			aria-label={m['a11y.numpad.clear']()}
			onclick={clear}
		>
			<ClearIcon class="size-5" />
		</Button>
		<Button
			variant="outline"
			size="action"
			class="text-lg font-semibold"
			aria-label={m['a11y.numpad.digit']({ n: '0' })}
			onclick={() => push('0')}
		>
			0
		</Button>
		<Button
			variant="outline"
			size="action"
			class="bg-transparent dark:bg-transparent"
			aria-label={m['a11y.numpad.backspace']()}
			onclick={backspace}
		>
			<Backspace class="size-5" />
		</Button>
	</div>

	<!-- HpLogSection (read-only, newest first) -->
	<Collapsible bind:open={historyOpen} class="pt-2">
		<CollapsibleTrigger
			class="flex w-full items-center justify-between text-sm font-medium text-muted-foreground"
		>
			<span class="flex items-center gap-1.5">
				{m['numpad.history.title']()}
				{#if history.length > 0}
					<span class="text-muted-foreground"
						>{m['numpad.history.count']({ n: history.length })}</span
					>
				{/if}
			</span>
			<Expand
				class={[
					'size-4 shrink-0 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)]',
					historyOpen && 'rotate-180',
				]}
			/>
		</CollapsibleTrigger>
		<CollapsibleContent>
			{#if history.length === 0}
				<p class="py-2 text-sm text-muted-foreground">{m['numpad.history.empty']()}</p>
			{:else}
				<ScrollArea class="max-h-48">
					<ul class="flex flex-col gap-1.5 pt-2">
						{#each history as e, i (e.id ?? i)}
							<li class="flex items-center justify-between gap-2 text-sm text-muted-foreground">
								<span class="flex items-center gap-1.5">
									<Badge variant="outline" class={actionBadgeClass[e.type]}>
										{actionLabel[e.type]()}
									</Badge>
									<span class={['tabular-nums', actionDiffClass[e.type]]}>
										{e.delta > 0 ? `+${e.delta}` : e.delta}
									</span>
								</span>
								<span class="tabular-nums">
									{m['numpad.summary.hp']({ cur: e.currentHp, max: e.maxHp })}
									{#if e.tempHp > 0}· {m['numpad.summary.temp']({ temp: e.tempHp })}{/if}
									{#if e.round !== null}· {m['numpad.history.round']({ n: e.round })}{/if}
								</span>
							</li>
						{/each}
					</ul>
				</ScrollArea>
			{/if}
		</CollapsibleContent>
	</Collapsible>
</div>
