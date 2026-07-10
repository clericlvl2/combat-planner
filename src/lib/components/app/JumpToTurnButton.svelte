<!--
  JumpToTurnButton (Component Inventory "FAB" / "Header (Combat screen)", TRE) — Active-only,
  mobile-only floating pill (prototype's `.jump-turn`; desktop ≥1024px uses CombatHeader's
  header-jump icon roundel instead, PLT-3) that scrolls the active-turn card into view. View
  navigation only: no turn/round/state mutation, no controller/store intent. Reuses the existing
  `active.jumpToTurn` / `a11y.jumpToTurn` i18n keys.
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { m } from '$lib/i18n';
	import { chromeIcon } from '$lib/icons';

	let { onclick }: { onclick: () => void } = $props();

	const Jump = chromeIcon.jump;
</script>

<Button
	type="button"
	variant="secondary"
	class="fixed bottom-4 left-1/2 min-h-11 -translate-x-1/2 rounded-full border border-border shadow-lg lg:hidden"
	aria-label={m['a11y.jumpToTurn']()}
	{onclick}
>
	<Jump class="size-4" />
	{m['active.jumpToTurn']()}
</Button>
