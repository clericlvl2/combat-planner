<!--
  CombatantForm — add/edit a combatant in a Dialog. Name is
  optional: on add-with-no-data the numeric fields (Max HP/Init/AC/PD/MD) pre-fill as real editable
  values (10/0/10/10/10), and the Name field shows a type-specific placeholder ("Hero
  Name"/"Enemy"/"Ally") that becomes the combatant's real stored name if left empty on
  save. Numeric fields still clamp via NumberField. Edit mode prefills and adds the
  manual-initiative field (editCombatant). Emits a normalized values object; the parent
  routes it to addCombatant or editCombatant. Max-HP change ⇏ current HP (handled in the store).
-->
<script lang="ts">
    import {Button} from '$lib/components/ui/button';
    import {Input} from '$lib/components/ui/input';
    import {Textarea} from '$lib/components/ui/textarea';
    import {ToggleGroup, ToggleGroupItem} from '$lib/components/ui/toggle-group';
    import {
        type Combatant,
        type CombatantTemplate,
        type CombatantType,
        UNROLLED,
    } from '$lib/db/types';
    import {m} from '$lib/i18n';
    import {chromeIcon} from '$lib/icons';
    import {NAME_MAX_LENGTH, NOTE_MAX_LENGTH, RANGES} from '$lib/stores/domain/constants';
    import EmptyState from './EmptyState.svelte';
    import Field from './Field.svelte';
    import NumberField from './NumberField.svelte';
    import {typeColor} from './labels';
    import ResponsiveModal from './ResponsiveModal.svelte';
    import TypeToggle from './TypeToggle.svelte';

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

    let name = $state('');
    let type = $state<CombatantType>('enemy');
    let initiativeBonus = $state<number | null>(null);
    let maxHp = $state<number | null>(null);
    let ac = $state<number | null>(null);
    let pd = $state<number | null>(null);
    let md = $state<number | null>(null);
    let note = $state('');
    let initiative = $state<number | null>(null);

    // Add-from-library picker state (add mode only — gated by `templates !== undefined` in the
    // markup; never read in edit mode).
    let source = $state<'new' | 'library'>('new');
    let pickedTemplateId = $state<string | null>(null);
    let templateQuery = $state('');

    function resetAddDefaults() {
        name = '';
        type = 'enemy';
        initiativeBonus = 0;
        maxHp = 10;
        ac = 10;
        pd = 10;
        md = 10;
        note = '';
        initiative = null;
    }

    // (Re)initialize the form whenever it opens (prefill on edit, real pre-filled defaults on add —
    // 10 / 0 / 10 / 10 / 10, not placeholder-only hints).
    $effect(() => {
        if (!open) return;
        if (mode === 'edit' && combatant) {
            name = combatant.name;
            type = combatant.type;
            initiativeBonus = combatant.initiativeBonus;
            maxHp = combatant.maxHp;
            ac = combatant.ac;
            pd = combatant.pd;
            md = combatant.md;
            note = combatant.note;
            initiative = combatant.initiative === UNROLLED ? null : combatant.initiative;
        } else {
            resetAddDefaults();
        }
        source = 'new';
        pickedTemplateId = null;
        templateQuery = '';
    });

    // Sorted+filtered (name-only) template list for the embedded picker — same stable ordering as
    // the /library page: name (case-insensitive) → updatedAt desc → id.
    const filteredTemplates = $derived(
        (templates ?? [])
            .filter((t) => t.name.toLowerCase().includes(templateQuery.trim().toLowerCase()))
            .sort((a, b) => {
                const byName = a.name.localeCompare(b.name, undefined, {sensitivity: 'base'});
                if (byName !== 0) return byName;
                if (b.updatedAt !== a.updatedAt) return b.updatedAt - a.updatedAt;
                return a.id.localeCompare(b.id);
            }),
    );

    const pickedTemplate = $derived(
        pickedTemplateId ? ((templates ?? []).find((t) => t.id === pickedTemplateId) ?? null) : null,
    );

    function selectSource(next: 'new' | 'library') {
        if (next === source) return;
        source = next;
        if (next === 'new') {
            pickedTemplateId = null;
            resetAddDefaults();
        }
    }

    function pickTemplate(t: CombatantTemplate) {
        pickedTemplateId = t.id;
        name = t.name;
        type = t.type;
        initiativeBonus = t.initiativeBonus;
        maxHp = t.maxHp;
        ac = t.ac;
        pd = t.pd;
        md = t.md;
        note = t.note;
    }

    // Type-specific name placeholder; also substituted as the real stored name when the
    // name is left empty on save (see submit()).
    const namePlaceholder = $derived(
        type === 'pc'
            ? m['forms.field.name.placeholder.pc']()
            : type === 'ally'
                ? m['forms.field.name.placeholder.ally']()
                : m['forms.field.name.placeholder.enemy'](),
    );

    const formTitle = $derived(
        mode === 'add' ? m['forms.combatant.add.title']() : m['forms.combatant.edit.title'](),
    );

    function submit() {
        const resolvedName = name.trim().length > 0 ? name : namePlaceholder;
        onSubmit({name: resolvedName, type, initiativeBonus, maxHp, ac, pd, md, note, initiative});
        open = false;
    }
</script>

{#snippet formFields()}
            {#if mode === 'add' && templates !== undefined}
                <!-- Add-from-library tab — always rendered in add mode, even when the library is empty. -->
                <ToggleGroup
                        type="single"
                        value={source}
                        onValueChange={(v) => v && selectSource(v as 'new' | 'library')}
                        class="w-full gap-2"
                >
                    <ToggleGroupItem
                            value="new"
                            class="flex-1 !rounded-sm border border-border bg-secondary text-muted-foreground data-[state=on]:bg-primary data-[state=on]:font-semibold data-[state=on]:text-primary-foreground"
                    >
                        {m['library.picker.tab.new']()}
                    </ToggleGroupItem>
                    <ToggleGroupItem
                            value="library"
                            class="flex-1 !rounded-sm border border-border bg-secondary text-muted-foreground data-[state=on]:bg-primary data-[state=on]:font-semibold data-[state=on]:text-primary-foreground"
                    >
                        {m['library.picker.tab.library']()}
                    </ToggleGroupItem>
                </ToggleGroup>
            {/if}

            {#if source === 'library' && pickedTemplateId === null}
                {#if (templates ?? []).length === 0}
                    <EmptyState
                            icon={chromeIcon.navLibrary}
                            title={m['library.picker.empty.title']()}
                            description={m['library.picker.empty.description']()}
                    >
                        <Button type="button" size="action" onclick={() => onOpenLibrary?.()}>
                            {m['library.picker.empty.openLibrary']()}
                        </Button>
                    </EmptyState>
                {:else}
                    <!-- Name-only picker (tag search stays a /library-page-only feature). -->
                    <div class="flex h-10 flex-none items-center gap-2 rounded-sm border border-[var(--border-strong)] bg-secondary px-3 text-sm text-[var(--text-faint)]">
                        <span aria-hidden="true" class="text-[16px] leading-none">&#8981;</span>
                        <input
                                type="search"
                                bind:value={templateQuery}
                                placeholder={m['library.picker.search.placeholder']()}
                                aria-label={m['library.picker.search.placeholder']()}
                                class="w-full touch-pan-y bg-transparent text-foreground outline-none placeholder:text-[var(--text-faint)]"
                        />
                    </div>
                    <div class="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
                        {#each filteredTemplates as t (t.id)}
                            <button
                                    type="button"
                                    class="flex min-h-11 items-center gap-2 rounded-md border border-border px-3 py-2 text-left hover:bg-muted"
                                    onclick={() => pickTemplate(t)}
                            >
                                <span class={['size-2 shrink-0 rounded-full', typeColor[t.type]]}></span>
                                <span class="min-w-0 flex-1">
                                    <span class="block truncate text-sm font-medium">{t.name}</span>
                                    <span class="block truncate text-xs text-muted-foreground">
                                        {m['library.row.subtitle']({maxHp: t.maxHp, ac: t.ac, pd: t.pd, md: t.md})}
                                    </span>
                                </span>
                            </button>
                        {/each}
                    </div>
                {/if}
            {:else}
                {#if source === 'library' && pickedTemplate}
                    <div class="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                        <span class="min-w-0 flex-1 truncate">{m['library.picker.from']({name: pickedTemplate.name})}</span>
                        <button
                                type="button"
                                class="shrink-0 font-medium text-foreground underline-offset-2 hover:underline"
                                onclick={() => (pickedTemplateId = null)}
                        >
                            {m['library.picker.change']()}
                        </button>
                    </div>
                {/if}

                <!-- Name (optional — empty on save falls back to the type-specific placeholder as the real name) -->
                <Field label={m['forms.field.name']()} for="cf-name">
                    <Input id="cf-name" size="action" bind:value={name} maxlength={NAME_MAX_LENGTH} placeholder={namePlaceholder}/>
                </Field>

                <!-- Type -->
                <Field label={m['forms.field.type']()}>
                    <TypeToggle bind:value={type} />
                </Field>

                <div class="grid grid-cols-2 gap-2">
                    <NumberField
                            id="cf-maxhp"
                            label={m['forms.field.maxHp']()}
                            bind:value={maxHp}
                            min={RANGES.maxHp.min}
                            max={RANGES.maxHp.max}
                    />
                    <NumberField
                            id="cf-ac"
                            label={m['forms.field.ac']()}
                            bind:value={ac}
                            min={RANGES.ac.min}
                            max={RANGES.ac.max}
                    />
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <NumberField
                            id="cf-pd"
                            label={m['forms.field.pd']()}
                            bind:value={pd}
                            min={RANGES.pd.min}
                            max={RANGES.pd.max}
                    />
                    <NumberField
                            id="cf-md"
                            label={m['forms.field.md']()}
                            bind:value={md}
                            min={RANGES.md.min}
                            max={RANGES.md.max}
                    />
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <NumberField
                            id="cf-initbonus"
                            label={m['forms.field.initBonus']()}
                            bind:value={initiativeBonus}
                            min={RANGES.initiativeBonus.min}
                            max={RANGES.initiativeBonus.max}
                    />
                    <NumberField
                            id="cf-init"
                            label={m['forms.field.initValue']()}
                            bind:value={initiative}
                            min={RANGES.initiative.min}
                            max={RANGES.initiative.max}
                    />
                </div>

                <Field label={m['forms.field.note']()} for="cf-note">
                    <Textarea
                            id="cf-note"
                            bind:value={note}
                            maxlength={NOTE_MAX_LENGTH}
                            placeholder={m['forms.field.note.placeholder']()}
                    />
                </Field>
            {/if}
{/snippet}

<ResponsiveModal bind:open title={formTitle} size="form" onSubmit={submit}>
    {#snippet children()}
        {@render formFields()}
    {/snippet}

    {#snippet footer()}
        <div class="flex justify-center gap-2">
            <Button
                    type="button"
                    variant="outline"
                    size="action"
                    class="min-w-0 flex-1 shrink basis-0 border-[var(--border-strong)]"
                    onclick={() => (open = false)}
            >
                {m['forms.action.cancel']()}
            </Button>
            <Button
                    type="submit"
                    size="action"
                    class="min-w-0 flex-1 shrink basis-0"
                    disabled={mode === 'add' && source === 'library' && pickedTemplateId === null}
            >
                {mode === 'add' ? m['forms.action.add']() : m['forms.action.save']()}
            </Button>
        </div>
    {/snippet}
</ResponsiveModal>
