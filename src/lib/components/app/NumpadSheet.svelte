<!--
  NumpadSheet (component-inventory.md "Numpad sheet", HP-6) — bottom-sheet HP editor opened from a row's HP cell.
  Summary header (cur/max + temp so the buffer is visible) · entry display · digit pad · the three
  commit actions (Deal Damage / Restore HP / Set Temp HP) · a read-only History of this combatant's
  hpLog (newest first). Empty entry → commits disabled (no-op). Commit closes the sheet; the change
  rides the combat's Undo history (no toast). History is view-only — no undo control here (LOG).
  Emits commit intent only; all HP math + log append live in the store/domain.
-->
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible';
	import { Drawer, DrawerContent } from '$lib/components/ui/drawer';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import type { Combatant, HpLogEntry } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';
	import { healthStatus } from '$lib/stores/domain/derive';
	import { healthTextColor } from './labels';

	let {
		combatant,
		open = $bindable(false),
		onDamage,
		onRestore,
		onSetTempHp,
	}: {
		combatant: Combatant | null;
		open?: boolean;
		onDamage: (id: string, n: number) => void;
		onRestore: (id: string, n: number) => void;
		onSetTempHp: (id: string, n: number) => void;
	} = $props();

	let entry = $state('');
	let historyOpen = $state(false);

	// Fresh entry on each open (abandons any partial entry — HP-6 dismiss-with-no-op).
	$effect(() => {
		if (open) entry = '';
	});

	const empty = $derived(entry === '');
	const value = $derived(empty ? 0 : Number(entry));
	const history = $derived(combatant ? [...combatant.hpLog].reverse() : []);
	const status = $derived(combatant ? healthStatus(combatant) : 'full');

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
	const ClearIcon = chromeIcon.close;
	const Expand = chromeIcon.expand;

	function push(d: string) {
		if (entry.length >= 4) return; // ≤ 9999, covers the HP ranges in specs/reference/limits.md
		entry += d;
	}
	function backspace() {
		entry = entry.slice(0, -1);
	}
	function clear() {
		entry = '';
	}

	function commit(fn: (id: string, n: number) => void) {
		if (!combatant || empty) return;
		fn(combatant.id, value);
		open = false;
	}
</script>

<Drawer bind:open>
	<DrawerContent class="mx-auto max-w-md">
		{#if combatant}
			<div class="flex flex-col gap-3 p-4">
				<!-- HpSummaryHeader: cur/max + temp buffer (HP-1) — cur HP is the distinctive value here -->
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
				     filled color-mix background per the prototype's literal `.btn--*-tint` recipe drops
				     below 4.5:1 for at least one of the three colors in each theme with these token
				     hexes, so the border-only recipe is the AA-safe stand-in. -->
				<div class="grid grid-cols-3 gap-2">
					<Button
						variant="outline"
						class="h-11 text-xs font-bold border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10 dark:border-destructive/30 dark:bg-transparent dark:hover:bg-destructive/10"
						disabled={empty}
						onclick={() => commit(onDamage)}
					>
						{m['numpad.dealDamage']()}
					</Button>
					<Button
						variant="outline"
						class="h-11 text-xs font-bold border-health-full/30 bg-transparent text-health-full hover:bg-health-full/10 dark:border-health-full/30 dark:bg-transparent dark:hover:bg-health-full/10"
						disabled={empty}
						onclick={() => commit(onRestore)}
					>
						{m['numpad.restoreHp']()}
					</Button>
					<Button
						variant="outline"
						class="h-11 text-xs font-bold border-combat-blue/30 bg-transparent text-combat-blue hover:bg-combat-blue/10 dark:border-combat-blue/30 dark:bg-transparent dark:hover:bg-combat-blue/10"
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
							class="h-11 text-lg font-semibold"
							aria-label={m['a11y.numpad.digit']({ n: d })}
							onclick={() => push(d)}
						>
							{d}
						</Button>
					{/each}
					<Button
						variant="ghost"
						class="h-11"
						aria-label={m['a11y.numpad.clear']()}
						onclick={clear}
					>
						<ClearIcon class="size-5" />
					</Button>
					<Button
						variant="outline"
						class="h-11 text-lg font-semibold"
						aria-label={m['a11y.numpad.digit']({ n: '0' })}
						onclick={() => push('0')}
					>
						0
					</Button>
					<Button
						variant="ghost"
						class="h-11"
						aria-label={m['a11y.numpad.backspace']()}
						onclick={backspace}
					>
						<Backspace class="size-5" />
					</Button>
				</div>

				<!-- HpLogSection (read-only, newest first) -->
				<Collapsible bind:open={historyOpen} class="border-t border-border pt-2">
					<CollapsibleTrigger
						class="flex w-full items-center justify-between text-sm font-medium text-muted-foreground"
					>
						<span class="flex items-center gap-1.5">
							{m['numpad.history.title']()}
							{#if history.length > 0}
								<span class="text-muted-foreground">{m['numpad.history.count']({ n: history.length })}</span>
							{/if}
						</span>
						<Expand class={['size-4 shrink-0 transition-transform', historyOpen && 'rotate-180']} />
					</CollapsibleTrigger>
					<CollapsibleContent>
						{#if history.length === 0}
							<p class="py-2 text-sm text-muted-foreground">{m['numpad.history.empty']()}</p>
						{:else}
							<ScrollArea class="max-h-48">
								<ul class="flex flex-col gap-1.5 pt-2">
									{#each history as e, i (i)}
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
		{/if}
	</DrawerContent>
</Drawer>
