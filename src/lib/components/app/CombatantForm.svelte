<!--
  CombatantForm — add/edit a combatant in a Dialog. Name is
  optional: on add-with-no-data the numeric fields (Max HP/Init/AC/PD/MD) pre-fill as real editable
  values (10/0/10/10/10), and the Name field shows a type-specific placeholder ("Hero
  Name"/"Enemy"/"Ally") that becomes the combatant's real stored name if left empty on
  save. Numeric fields still clamp via NumberField. Edit mode prefills and adds the
  manual-initiative field (editCombatant). Emits a normalized values object; the parent
  routes it to addCombatant or editCombatant. Max-HP change ⇏ current HP (handled in the store).

  This shell only owns identity (`mode`/`combatant`/`open`) and remounts CombatantFormBody via
  `{#key combatant?.id ?? 'new'}` — all form/picker state lives entirely in the body so seeding it
  from `combatant` is a plain `$state` initializer, never an effect (Phase 2, 2026-07-28 plan).
-->
<script lang="ts">
    import type {Combatant, CombatantTemplate, CombatantType} from '$lib/db/types';
    import CombatantFormBody from './CombatantFormBody.svelte';

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
        open = $bindable(false),
        onSubmit,
        templates,
        onOpenLibrary,
    }: {
        mode: 'add' | 'edit';
        combatant?: Combatant | null;
        open?: boolean;
        onSubmit: (values: CombatantFormValues) => void;
        // `undefined` (prop not passed, as in edit mode) means "library feature not wired here";
        // an array (possibly empty) enables the add-mode "New"/"From library" tab.
        templates?: CombatantTemplate[];
        onOpenLibrary?: () => void;
    } = $props();
</script>

{#key combatant?.id ?? 'new'}
    <CombatantFormBody bind:open {mode} {combatant} {onSubmit} {templates} {onOpenLibrary} />
{/key}
