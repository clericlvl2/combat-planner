<!--
  NumpadSheet — HP editor opened from a row's HP cell.
  Renders as a bottom Drawer on mobile and a centered modal Dialog on desktop (≥1024px), switched
  via the `svelte/reactivity` MediaQuery.
  Summary header (cur/max + temp so the buffer is visible) · entry display · digit pad · the three
  commit actions (Damage / Heal / Temp HP) · a read-only History of this combatant's
  hpLog (newest first). Empty entry → commits disabled (no-op). Commit closes the sheet; the change
  rides the combat's Undo history (no toast). History is view-only — no undo control here.
  Emits commit intent only; all HP math + log append live in the store/domain.

  The entry field and the History section's open/closed state live in NumpadSheetBody, remounted
  via `{#key open}` every time the sheet opens — a fresh entry and a collapsed History are
  structural rather than effect-driven (Phase 2, 2026-07-28 plan).
-->
<script lang="ts">
	import type { Combatant } from '$lib/db/types';
	import { m } from '$lib/i18n';
	import NumpadSheetBody from './NumpadSheetBody.svelte';
	import ResponsiveModal from './ResponsiveModal.svelte';

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

	// Accessible dialog name (ADR-014): NumpadSheet has no visible header text of its own — the
	// combatant's name in the summary row is the closest thing to a title. Never empty: a stale id
	// can null `combatant` while `open` stays true, and an empty title is an unnamed dialog.
	const title = $derived(
		m['numpad.title']({ name: combatant ? combatant.name : m['setup.addCombatant']() }),
	);
</script>

<ResponsiveModal bind:open {title} hideTitle size="form">
	{#snippet children()}
		{#if combatant}
			{#key open}
				<NumpadSheetBody
					{combatant}
					{onDamage}
					{onRestore}
					{onSetTempHp}
					onClose={() => (open = false)}
				/>
			{/key}
		{/if}
	{/snippet}
</ResponsiveModal>
