# App components (`$lib/components/app`)

Bespoke + composed components, built on shadcn-svelte primitives in `../ui` (ADR-008).
**Skeleton decision:** the folder map below is the source of truth; concrete `.svelte`
files are created per-component during the M-phase UI build (one file per component,
co-located with its tests). No empty stub files are committed yet — they would be
dead, unchecked code. Full prop/variant/state matrix → **Combat Planner Component
Inventory**; control placement → **UX & IA §9**.

```
shell/
  AppShell.svelte            root layout host (Inventory §3)
  Toaster.svelte             Sonner host; UpdateToast (§3)
  UpdateToast.svelte         SW "Update — reload" (ADR-004)
  InstallBanner.svelte       dismissible top install hint (§3)
  ConfirmDialog.svelte       destructive-action confirm (§3)
nav/
  NavSidebar.svelte          mobile swipe-in nav (§4)
  AppHeader.svelte           tablet/desktop top bar (§4)
  NavLink.svelte             one destination + active marker (§4)
combats/
  CombatList.svelte          drag-reorderable list (ADR-006, §5)
  CombatRow.svelte           one combat row (§5)
  ColorTagDot.svelte         token-driven swatch (ADR-012, §5)
  CombatRowMenu.svelte       row ⋮ : edit/export/delete (§5)
  ImportControl.svelte       single-combat import → new copy (§5)
  EmptyState.svelte          shared empty/CTA (§5/§7)
  CombatFormDialog.svelte    create/edit combat (§5)
  ColorSwatchPicker.svelte   8-swatch picker (§5)
combat/
  CombatHeader.svelte        back/undo/redo/round/escalation/⋮ (§6)
  IconButton.svelte          shared icon button (§6)
  RoundCounterControl.svelte round edit, Active-only (§6)
  EscalationDieControl.svelte escalation override, Active-only (§6)
  CombatOverflowMenu.svelte  header ⋮ item set by state (§6)
  CombatantList.svelte       live-sorted roster (§7)
  FAB.svelte                 shared add/advance/create (§7)
  StartBar.svelte            pinned Start bar, Setup (§7)
  JumpToTurnButton.svelte    scroll active row into view (§7)
combatant/
  CombatantRow.svelte        compact ⇄ expanded (§8)
  TypeBadge.svelte           type color+icon (§8)
  InitCell.svelte            roll/manual initiative (§8)
  InitEntry.svelte           manual ± entry popover (§8)
  HpCell.svelte              cur/max, opens numpad (§8)
  HealthBar.svelte           health + reverse/alarm bar (§8)
  DefenseStats.svelte        AC/PD/MD in-row (§8)
  ConditionIconList.svelte   first-few + "+K" overflow (§8)
  ConditionPicker.svelte     12 condition toggles (§8)
  TempHpField.svelte         temp HP, expanded (§8)
  NoteField.svelte           inline note ≤250 (§8/§10)
  RowActions.svelte          duplicate/remove/edit (§8)
numpad/
  NumpadSheet.svelte         HP sheet container (§9)
  HpSummaryHeader.svelte     cur/max + temp (§9)
  EntryDisplay.svelte        running entry readout (§9)
  DigitPad.svelte            0–9 + backspace/clear (§9)
  CommitActions.svelte       damage/heal/set-temp (§9)
  HpLogSection.svelte        read-only History (Data §9, §9)
  HpLogEntryRow.svelte       one log line (§9)
forms/
  CombatantFormDialog.svelte add/edit combatant (§10)
  TypeSelect.svelte          pc/monster/ally (§10)
  NumberField.svelte         clamping numeric field (§10)
settings/
  SettingsGroup.svelte       labeled section (§11)
  LanguageSwitcher.svelte    6 locales (ADR-005, §11)
  ThemeSwitcher.svelte       system/dark/light (§11)
  DataActions.svelte         export/import/reset all (§11)
  AboutPage.svelte           static About (§11)
```

Centralize Lucide glyph names in `$lib/icons.ts` (ADR-011) so a later swap is one file;
several chrome glyphs are still flagged open in Component Inventory §13.
