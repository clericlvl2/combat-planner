<!--
  Combat screen — reads the store's reactive
  combat + the derived VIEWS (sortedCombatants / showRoundAndEscalation / canAdvance / isActive),
  wraps them in $derived (ADR-002), and wires the thin components via an id-scoped controller.
  Setup ⇄ Active is gated by showRoundAndEscalation. The page owns the single shared NumpadSheet +
  add/edit forms, the Setup/Active floating controls (mobile-only FAB stack; desktop ≥1024px
  swaps both states' FABs for CombatHeader's icon-roundel pair — header-add/header-start in
  Setup, header-advance in Active), and the auto-scroll-on-advance behavior that
  scrolls the newly active row into view via the `data-active` marker CombatantRow's Card already
  carries; rows/header emit intent only.
-->
<script lang="ts">
    import {goto} from '$app/navigation';
    import {page} from '$app/state';
    import CombatantForm, {type CombatantFormValues} from '$lib/components/app/CombatantForm.svelte';
    import CombatantRow from '$lib/components/app/CombatantRow.svelte';
    import CombatHeader from '$lib/components/app/CombatHeader.svelte';
    import {makeController} from '$lib/components/app/controller';
    import FAB from '$lib/components/app/FAB.svelte';
    import NumpadSheet from '$lib/components/app/NumpadSheet.svelte';
    import {Button} from '$lib/components/ui/button';
    import {m} from '$lib/i18n';
    import {chromeIcon} from '$lib/icons';
    import {store} from '$lib/stores';
    import {canAdvance, isActive, showRoundAndEscalation, sortedCombatants} from '$lib/stores/domain/derive';

    const id = $derived(page.params.id ?? '');
    const combat = $derived(store.getCombat(id));
    const controller = $derived(makeController(store, id));

    const active = $derived(combat ? showRoundAndEscalation(combat) : false);
    // Setup: raw add-order, no live autosort (rolls/edits update the number, not the position).
    // Active: sorted order, so the turn pointer and re-sort logic apply live.
    const display = $derived(combat ? (active ? sortedCombatants(combat) : combat.combatants) : []);
    const canAdv = $derived(combat ? canAdvance(combat) : false);

    const Add = chromeIcon.add;
    const Advance = chromeIcon.advance;
    const Start = chromeIcon.start;

    // Auto-scroll-on-advance — scrolls the newly active row into view on every advance
    // (including the round-wrap advance); no store/controller intent, CombatantRow already marks
    // its Card `data-active`.
    let mainEl = $state<HTMLElement | null>(null);

    $effect(() => {
        if (!combat?.activeCombatantId) return;
        mainEl?.querySelector('[data-active="true"]')?.scrollIntoView({behavior: 'smooth', block: 'center'});
    });

    // page-owned shared surfaces
    let numpadId = $state<string | null>(null);
    let numpadOpen = $state(false);
    const numpadCombatant = $derived(
        combat && numpadId ? (combat.combatants.find((c) => c.id === numpadId) ?? null) : null,
    );

    function openNumpad(cid: string) {
        numpadId = cid;
        numpadOpen = true;
    }

    let addOpen = $state(false);
    let editOpen = $state(false);
    let editId = $state<string | null>(null);
    const editCombatant = $derived(
        combat && editId ? (combat.combatants.find((c) => c.id === editId) ?? null) : null,
    );

    function openEdit(cid: string) {
        editId = cid;
        editOpen = true;
    }

    // Browser Back closes the top-most open transient overlay (numpad, then edit, then
    // add) and stays on the combat page; only Back with no overlay open leaves the page. A
    // history entry is pushed while any overlay is open; a normal (non-Back) close consumes that
    // entry via history.back() so it never pollutes forward-history navigation.
    let overlayHistoryPushed = false;
    let poppedByBrowser = false;

    function closeTopOverlay() {
        if (numpadOpen) numpadOpen = false;
        else if (editOpen) editOpen = false;
        else if (addOpen) addOpen = false;
    }

    function handlePopState() {
        if (!overlayHistoryPushed) return;
        overlayHistoryPushed = false;
        poppedByBrowser = true;
        closeTopOverlay();
    }

    $effect(() => {
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    });

    $effect(() => {
        const overlayOpen = addOpen || editOpen || numpadOpen;
        if (overlayOpen && !overlayHistoryPushed) {
            history.pushState({overlay: true}, '');
            overlayHistoryPushed = true;
        } else if (!overlayOpen && overlayHistoryPushed && !poppedByBrowser) {
            overlayHistoryPushed = false;
            history.back();
        }
        poppedByBrowser = false;
    });

    function submitAdd(v: CombatantFormValues) {
        controller.addCombatant({
            name: v.name,
            type: v.type,
            initiativeBonus: v.initiativeBonus ?? undefined,
            initiative: v.initiative ?? undefined,
            maxHp: v.maxHp ?? undefined,
            ac: v.ac ?? undefined,
            pd: v.pd ?? undefined,
            md: v.md ?? undefined,
            note: v.note,
        });
    }

    function submitEdit(v: CombatantFormValues) {
        if (!editId) return;
        controller.edit(editId, {
            name: v.name,
            type: v.type,
            initiativeBonus: v.initiativeBonus ?? undefined,
            ac: v.ac ?? undefined,
            pd: v.pd ?? undefined,
            md: v.md ?? undefined,
            note: v.note,
            maxHp: v.maxHp ?? undefined,
            initiative: v.initiative ?? undefined,
        });
    }
</script>

{#if !store.ready}
    <p class="p-4 text-muted-foreground">…</p>
{:else if !combat}
    <div class="flex min-h-dvh flex-col items-center justify-center gap-3 p-4 text-center text-muted-foreground">
        <p class="text-lg font-semibold text-foreground">{m['combat.notFound.title']()}</p>
        <Button aria-label={m['combat.notFound.back']()} onclick={() => goto('/combats')}>
            {m['combat.notFound.back']()}
        </Button>
    </div>
{:else}
    <div class="mx-auto flex min-h-dvh w-full flex-col pb-56 lg:pb-8">
        <CombatHeader
                {combat}
                {controller}
                onAdd={() => (addOpen = true)}
                onStart={controller.start}
                onAdvance={controller.advance}
                canAdvance={canAdv}
        />

        <main
                bind:this={mainEl}
                class="content-container flex w-full flex-1 flex-col gap-2 p-3 {active ? 'pt-2' : ''}"
        >
            {#if display.length === 0}
                <div class="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
                    <p class="text-lg font-semibold text-foreground">{m['setup.empty.title']()}</p>
                </div>
            {:else}
                {#each display as c (c.id)}
                    <CombatantRow
                            combatant={c}
                            active={isActive(combat, c)}
                            combatActive={active}
                            {controller}
                            onOpenNumpad={openNumpad}
                            onEdit={openEdit}
                    />
                {/each}
            {/if}
        </main>

        {#if active}
            <!-- Active: Advance FAB (disabled at the r99 → r100 wrap) — mobile only;
                 desktop (≥1024px) swaps it for CombatHeader's header-advance icon roundel. -->
            <FAB
                    icon={Advance}
                    label={m['active.advance']()}
                    disabled={!canAdv}
                    onclick={controller.advance}
                    class="lg:hidden max-lg:focus-visible:ring-0 max-lg:focus-visible:border-transparent"
            />
        {:else}
            <!-- Setup: mobile FAB stack (Add always; Start once the roster isn't empty), matching
                 the desktop header-add/header-start pair in CombatHeader — Start FAB
                 borrows the existing chevron glyph (no dedicated play/start icon ships yet). -->
            <Button
                    class="fixed right-4 bottom-4 size-14 rounded-full shadow-lg lg:hidden max-lg:focus-visible:ring-0 max-lg:focus-visible:border-transparent"
                    aria-label={m['setup.addCombatant']()}
                    onclick={() => (addOpen = true)}
            >
                <Add class="size-5"/>
            </Button>
            {#if combat.combatants.length > 0}
                <!-- Start FAB reads as a primary action (default variant = bg-primary), not a
                     pale ghost/secondary roundel. Uses the play glyph (mirrors the desktop
                     header-start icon-roundel). -->
                <FAB
                        icon={Start}
                        label={m['setup.start']()}
                        onclick={controller.start}
                        class="bottom-24 lg:hidden max-lg:focus-visible:ring-0 max-lg:focus-visible:border-transparent"
                />
            {/if}
        {/if}
    </div>

    <NumpadSheet
            combatant={numpadCombatant}
            bind:open={numpadOpen}
            onDamage={controller.damage}
            onRestore={controller.restore}
            onSetTempHp={controller.setTempHp}
    />
    <CombatantForm mode="add" bind:open={addOpen} onSubmit={submitAdd}/>
    <CombatantForm mode="edit" combatant={editCombatant} bind:open={editOpen} onSubmit={submitEdit}/>
{/if}
