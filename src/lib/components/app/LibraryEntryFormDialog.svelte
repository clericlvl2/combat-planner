<!--
  LibraryEntryFormDialog — Name/Type/Max HP/AC/PD/MD/Init Bonus/Note/Tags form for a library
  template, shared by create and edit. Mode is inferred from the optional `entry` prop (present =
  edit, absent/null = create), same convention as CombatFormDialog. The field set mirrors
  CombatantForm's (minus `initiative`, which is a combat-instance-only field templates never
  carry).
  Tags: local `pendingTags` (seeded from `entry.tags` on mount, `[]` on create) render as
  removable TagChips plus an "Edit tags" affordance opening a TagAssignmentDialog scoped to
  `pendingTags` — nothing persists until Save; `onToggle`/`onCreateTag` mutate `pendingTags`
  locally via the domain `normalizeTagName` against `allTags ∪ pendingTags`. This is a deliberate
  nested modal (Dialog-over-Dialog desktop, Drawer-over-Dialog mobile): the tag dialog's own
  Escape/backdrop dismisses only itself, focus returns to the "Edit tags" trigger (bits-ui's
  default focus-scope restore, since we never override it), and this form's state is untouched.
  Save-feedback contract: create submits call `onCreateResult(created)` and the dialog itself
  decides whether to close (created → close; null/cap → stays open, form content preserved). Edit
  submits stay silent (mirrors combat editing) and never call `onCreateResult`. This dialog is
  prop-driven and toast-agnostic — the toast itself is fired by the page-level callback.

  This shell only owns identity (`entry`/`open`/`store`/`allTags`/`onCreateResult`) and remounts
  LibraryEntryFormBody via `{#key entry?.id ?? 'new'}` — all form/tag state lives entirely in the
  body so seeding it from `entry` is a plain `$state` initializer, never an effect (Phase 2,
  2026-07-28 plan).
-->
<script lang="ts">
	import { type CombatantTemplate } from '$lib/db/types';
	import type { CombatantTemplateInput } from '$lib/stores/domain/factories';
	import { type EditTemplatePatch } from '$lib/stores/domain/library';
	import LibraryEntryFormBody from './LibraryEntryFormBody.svelte';

	/** Narrow store surface this dialog needs — lets tests pass a plain spy object. */
	export interface LibraryEntryFormStore {
		addTemplate(input: CombatantTemplateInput): CombatantTemplate | null;
		editTemplate(id: string, patch: EditTemplatePatch): void;
	}

	let {
		entry = null,
		open = $bindable(false),
		store,
		onCreateResult,
		allTags = [],
	}: {
		/** Present = edit mode (seeded from this template); absent/null = create mode. */
		entry?: CombatantTemplate | null;
		open?: boolean;
		store: LibraryEntryFormStore;
		onCreateResult: (created: CombatantTemplate | null) => void;
		/** Live derived union of every template's tags (never stored, ADR-002). */
		allTags?: string[];
	} = $props();
</script>

{#key entry?.id ?? 'new'}
	<LibraryEntryFormBody bind:open {entry} {store} {onCreateResult} {allTags} />
{/key}
