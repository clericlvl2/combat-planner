# Tasks: design-feedback-iteration

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

**Partial breakdown — Phase 1 (reconciliation) only.** The later phases (prototype iteration,
final `component-inventory.md` reconcile to the converged prototype, `PLT-2/3/5` amendments) are
generated after Phase 1 lands and its bug-vs-redesign verdicts are recorded.

**Feedback rounds** are logged in [`feedback-log.md`](./feedback-log.md) — per-round verbatim
feedback, item classification, decisions, prototype-realization notes, and the doc/code deferral
mapping (component-inventory / PLT / CLS + units D/E). That log is the **source** for the final
reconcile phase; do not reconstruct the changes from the converged prototype alone.

**Precedence when sources disagree** (from `change.md`): explicit prior decisions > shipped M2
code > stale docs/prototype.

## Phase 1 — Reconciliation: 3-way diff + classify + fix stale-doc bugs

**Owns:** `specs/reference/component-inventory.md`, `specs/design/prototype.html`
**Reads (not owned):** `src/lib/components/app/FAB.svelte`, `src/routes/combats/+page.svelte`,
`src/routes/combats/[id]/+page.svelte`, `src/lib/components/app/CombatantForm.svelte`,
`src/lib/components/app/CombatHeader.svelte`, `src/lib/stores/domain/undo.ts`,
`src/lib/components/app/CombatantRow.svelte`, `src/lib/components/app/InitCell.svelte`
**Parallel-safe with:** none

### Step 1 — Read-only 3-way diff per contested element (code ↔ inventory ↔ prototype)

- [x] FAB button(s) — code `src/lib/components/app/FAB.svelte` (+ usages in
      `src/routes/combats/+page.svelte`, `src/routes/combats/[id]/+page.svelte`)
- [x] "+ Combatant" button — code `src/routes/combats/[id]/+page.svelte`,
      `src/lib/components/app/CombatantForm.svelte`
- [x] undo/redo placement — code `src/lib/components/app/CombatHeader.svelte`,
      `src/lib/stores/domain/undo.ts`
- [x] combatant-card layout (hp / init / statuses / notes) — code
      `src/lib/components/app/CombatantRow.svelte`, `src/lib/components/app/InitCell.svelte`
      (note: inventory lists `HpCell`/`HealthBar`/`TypeStripe`/`NumpadSheet` etc. with **no
      matching src component** — flag each as drift and diff against what M2 actually ships)

### Step 2 — Classify + record verdict inline (bug vs redesign)

Fill each verdict below: **(a) STALE-DOC BUG** (doc/prototype disagrees with shipped M2 code) or
**(b) DELIBERATE REDESIGN** (intentional new target for the M-phase).

- [x] FAB — verdict: `(a) STALE-DOC BUG`  · note: doc/prototype showed a floating FAB
      ("Add combatant") in Combat — Setup. Shipped `CombatHeader.svelte`/`+page.svelte` has **no
      FAB in Setup** — a persistent full-width "Add Combatant" bar is pinned at the bottom
      instead, and "Start combat" moves inline into the header once the roster isn't empty.
      FAB(create) on Combats-home and FAB(advance) on Combat — Active were already correct.
- [x] "+ Combatant" — verdict: `(a) STALE-DOC BUG`  · note: `CombatantFormDialog` fields drifted
      from shipped `CombatantForm.svelte`: Type is a segmented `ToggleGroup`, not a `Select`
      ("TypeSelect"); there is **no roll/lock "InitEntry" control in the form at all** — rolling
      only happens at the roster row's `InitCell`. Setup-mode add instead has an "Init Bonus"
      numeric field; only edit mode / mid-combat add appends a trailing plain-numeric
      Initiative field (no roll/lock UI there either).
- [x] undo/redo — verdict: `(a) STALE-DOC BUG`  · note: doc/prototype showed Undo/Redo as
      standalone always-visible header icon buttons next to Back. Shipped `CombatHeader.svelte`
      nests them as the **first two items inside the `⋮` CombatOverflowMenu** instead (disabled
      at their stack ends); the header itself only has Back + a center slot (round/esc pills or
      the Setup "Start combat" button) + the `⋮` trigger.
- [x] combatant card (hp/init/statuses/notes) — verdict: `(a) STALE-DOC BUG`  · note: multiple
      sub-drifts vs. shipped `CombatantRow.svelte`/`InitCell.svelte`: (1) row order was wrong
      (doc had the `⋮` menu before name, InitCell before HpCell) — actual order is
      TypeStripe → HpCell → name → HealthBar/DefenseStats/conditions → InitCell (trailing) → `⋮`
      menu (trailing-most); (2) `ConditionIconList` has **no "+K" overflow** — all conditions
      render and the row wraps (confirmed by the component's own code comment); (3) the expanded
      row has **no TempHpField** — temp HP is only set via NumpadSheet's "Set Temp HP", not an
      expanded-row control; (4) TypeStripe/HealthBar are color + `aria-label`/card-bg-tint only
      in shipped code (no visible "PC/Enemy/Ally" text chip, no visible "Full/Wounded/Bloodied/
      Dead" band word) — `component-inventory.md` already said this correctly, so this specific
      sub-item was a **stale-PROTOTYPE-only** bug (prototype contradicted its own reference doc);
      (5) TypeStripe's stripe-count (pc=2, enemy/ally=1) was already correctly documented but the
      prototype only ever rendered 1 stripe — fixed. `HpCell`/`TypeStripe` genuinely have no
      matching `src/` file (inlined in `CombatantRow.svelte`) — flagged, wording reconciled;
      `HealthBar.svelte` and `NumpadSheet.svelte` **do** exist as real shipped files, so the
      task's "no matching component" note only fully applies to HpCell/TypeStripe.
- [x] For every **(b) DELIBERATE REDESIGN**: user accepts or rejects. Accepted → record "code
      deferred to units D/E; doc updates to the new target". Rejected → downgrade to (a).
      **N/A this round** — no element classified (b): change.md's explicit framing (this is the
      known doc-sync-miss from the M2 first-touch rework, precedence "shipped M2 code > stale
      docs/prototype") plus corroborating shipped-code doc-comments (CombatantRow/HealthBar/
      ConditionIconList already state the color+aria-label-only / no-overflow-chip behavior the
      doc/prototype contradicted) made all four contested elements resolve cleanly as (a).
      `StartBar` and `JumpToTurnButton` naming was **left untouched** elsewhere in the doc
      (hierarchy Button-primitive row, Active-screen JumpToTurn button) since
      `turns-rounds-escalation.md` (TRE) still specs jump-to-turn as a real, not-yet-built
      requirement, and unit 007's own change.md already targets `StartBar`/`JumpToTurnButton` as
      a future restyle target — that's this unit's read, not a call I can make unilaterally; left
      for a later phase/unit to reconcile if it disagrees.

### Step 3 — Fix stale-doc bugs to shipped-code truth

- [x] For every **(a)** element, correct **both** `component-inventory.md` **and**
      `prototype.html` to match shipped M2 code (incl. the no-matching-component inventory entries
      reconciled to what M2 actually renders).
- [ ] Leave **(b)-accepted** redesign targets as the new intended state; do **not** back them out
      to code (their code change lands in units D/E). — N/A, no (b) items this round.

### Step 4 — Independent doc-pass verify

- [x] **Main-thread step (not the implementer):** dispatch a fresh read-only agent to check
      `component-inventory.md` against shipped M2 code — the guard the first-touch rework skipped.
      Record PASS or the findings; re-fix and re-verify until PASS.
      **PASS** (independent Explore agent, code-first, did not consult tasks.md verdicts): doc
      matches shipped code on all four contested elements. Non-blocking cosmetic notes only —
      reverse-index "StartBar" naming (owned by unit 007) and Active advance being an inline
      `Button` vs the unused shared `FAB.svelte` (behaviorally identical).

**Scope guard:** presentation / control-placement / per-state wording only — **no mechanics or
data change**; reference edits limited to `component-inventory.md`; no `src/` edits in this phase.

**Gate:** `npm run gate` must pass before this phase is reported done.

## Phase 2 — Final reconcile: component-inventory.md + PLT-2/3/5 to the converged prototype

**Source of truth for this phase:** `specs/changes/004-design-feedback-iteration/feedback-log.md`
Reconcile ledger, rows `inv`, `PLT-2`, `PLT-3`, `PLT-5` — read the full ledger row (it links back
to every round R1–R6 item), not just this summary. Do not re-derive from `prototype.html` alone;
the ledger is the durable record of *why* each change is owed.

**Owns:** `specs/reference/component-inventory.md`, `specs/capabilities/platform.md`
**Reads (not owned):** `specs/design/prototype.html`, `specs/design/card-prototype.html`,
`specs/changes/004-design-feedback-iteration/feedback-log.md`
**Parallel-safe with:** none (Phase 1 must be merged first; this phase supersedes some of its
same-file content)

**Out of scope (explicit):** no `src/` edits, no `prototype.html`/`card-prototype.html` edits, no
edits to `specs/capabilities/lifecycle.md` (LIF), `conditions.md` (CND), `combats-list.md` (CLS),
`settings.md` (SET), `import-export.md` (IMP), `hp.md` (HP), or `hp-log.md` (LOG) — those ledger
rows are owed to code units D (006) / E (007) and get doc-synced at *their* close, not here.

### Step 1 — Rewrite `component-inventory.md` to the converged prototype

Work through the ledger's `inv` row change-by-change (R1–R6, all superseded/locked states
already resolved in the row's own text — R4 supersedes R3's card style, R4 item 14 supersedes R3
item 9's FAB position). Target state, by section of the current file:

- [x] **Hierarchy tree + Navigation placement per breakpoint** — nav becomes icon buttons on
      desktop (`.nav-desktop`: ⚔/⚙/ⓘ, `aria-label`+`title` each, `.is-current` state), applied
      globally to every screen's header, not just Combats home; mobile burger unchanged. Drop
      `ImportControl` from the Combats-home hierarchy line entirely (R2).
- [x] **Combats home** — add a static search field (name+desc placeholder) as first child of the
      populated list. `ColorTagDot` renders the combat title's first letter (not a color-name
      string); the dot's fill is still the picked color; colour itself stays aria-label-only
      (PLT-5, see Step 2) — the initial is the disambiguator, not a colour signifier. Drop the
      "RED"/"ORANGE" tag-name text row under the title. Create control: header "+" icon button on
      desktop (replaces the desktop FAB), FAB stays on mobile. Desktop populated list: 1 column,
      not a 2-col grid. EmptyState CTA: desktop keeps the centered "+ New Combat" button, mobile
      drops it (FAB alone). Remove `ImportControl` and any import-fail-safe dialog entry (R2).
- [x] **Combatant row → combatant card** — replace the "compact vs. expanded" dense-row
      description with the card layout locked in R3/R4/R5, reading `card-prototype.html` as the
      canonical shape (this file is docs-only; the sandbox HTML is the living spec unit E ports
      from):
      - Row 1: name + expand chevron (CSS-drawn rotating corner, not a glyph) + trailing
        per-card `⋮` overflow menu.
      - Row 2: big HP (cur/max, tabular) + inline top-right temp-HP badge nested in the HP block
        + a 4-band health bar that stretches to fill remaining card width (bar start position
        decoupled from HP digit count via a fixed-width HP block).
      - Row 3: AC/PD/MD defense stats + an Init pill (`Init N` when set, `Init –` when unset).
      - Condition chips: filled, full 13th-Age condition name, no icons, no 2-letter codes,
        colour-coded per condition (this file states *what* — full-name filled chips, not the
        `color-mix` recipe, which is prototype/CSS implementation detail).
      - Note line: renders read-only under the card whenever a note is set (collapsed or
        expanded) — flag this explicitly as a **prototype-only divergence from shipped
        `CombatantRow.svelte`**, which only shows the note editor when the row is expanded. Keep
        Phase 1's existing framing that this file describes the current *target*, and note the
        shipped-vs-target gap inline the same way Phase 1 did for other elements.
      - Collapsed state keeps AC/PD/MD, Init pill, and the full condition list always visible;
        only the chip `×` (remove) affordance and the "+Condition"/"+Note" triggers hide when
        collapsed.
      - Keep the existing TypeStripe (leading edge, color + `aria-label`) and stripe-count note.
- [x] **FAB section (Combat — Setup)** — supersede the Phase 1 "(a) STALE-DOC BUG" correction
      ("no FAB, persistent Add-Combatant bar instead") with the new target: Setup shows **two**
      floating controls — an Add-Combatant FAB (bottom-right) and a hold-to-start Start FAB
      (right-edge, stacked above the Add FAB). Cross-reference `[[../capabilities/lifecycle]]`
      for the hold-to-start gesture itself (that capability-level description is LIF's job, not
      this file's — leave `lifecycle.md` untouched per this phase's out-of-scope list, but the
      inventory's *control-placement* line must reflect the two-FAB layout).
- [x] **Header (Combat screen)** — Active header's center-slot round/escalation pills become a
      `round-esc-bar` sub-bar rendered below the header chrome (not inline in the header center
      slot). Active's advance-turn control becomes a chevron-glyph FAB (`›`, `aria-label="Advance
      turn"`) instead of the previous glyph. Desktop Active additionally gets tonal-circle icon
      buttons for advance/jump-to-turn in the header itself (R5).
- [x] **Numpad sheet** — update `CommitActions`/`EntryDisplay`/`DigitPad`/`HpLogSection`
      description to match the R6 redesign: commit actions render *above* the digit pad (not
      below), entry-display and digits are bordered/sized per the shipped-code fidelity pass,
      digit-pad backspace/clear use ghost (borderless) glyph buttons, and `HpLogSection` is
      relabeled "History" with each entry showing a colour-coded action chip + signed diff value
      (left column) alongside the old→new value transition (right column, unaccented).
- [x] **CombatantForm** — Type toggle-group renders as equal-width segments (not
      variable-width). Every `NumberField` instance (Max HP, Init Bonus, AC, PD, MD, Initiative)
      follows Decrease → value → Increase button order, including AC/PD/MD which previously had
      no decrease control. Add-mode header chrome matches the Setup two-FAB pattern; edit-mode
      header chrome matches the Active header (advance/jump icon buttons + round-esc-bar).
- [x] **Settings** — drop `DataActions`' export/import rows from the hierarchy; keep only
      Reset-all. Drop the import fail-safe dialog reference entirely (R2).
- [x] **Global chrome placement** — no content change expected; re-read after the above edits to
      confirm the FAB/thumb-zone language still matches (Setup now has two FABs, not a bottom
      bar).
- [x] **shadcn-svelte primitive coverage (reverse index)** — remove `ImportControl` from the
      `Button` row; add/confirm entries for any new bespoke pieces introduced by the card
      restyle (chevron button, tonal-circle icon buttons, ghost digit buttons) under "bespoke (no
      primitive)" if they don't map to an existing shadcn primitive.
- [x] **Glyph gaps** — add any new glyphs introduced by the converged prototype not already
      listed (chevron corner-rotate, ghost backspace/clear) if not already covered by the
      existing "expand/collapse chevron" / "backspace" / "clear" entries.

### Step 2 — Amend `platform.md` PLT-2, PLT-3, PLT-5

- [x] **PLT-2 (Responsive, one-handed mobile)** — add: on desktop, the Combat screen is a single
      centered column (extrapolated, no split-pane), not a distinct desktop layout; the mobile
      card composition carries over unchanged, just re-centered. Cite
      `[[../reference/component-inventory]]` for the card shape itself (no restating layout
      detail here, per this file's own "exact control placement... see inventory" convention).
- [x] **PLT-3 (Navigation per breakpoint)** — update desktop nav description: inline nav links
      become icon buttons (⚔/⚙/ⓘ) with `aria-label`+`title`, `.is-current` state styling: still
      exposes the same three destinations, wording changes from "inline navigation" to "inline
      icon-button navigation". Add: the create action follows the same per-breakpoint split as
      nav (header "+" icon button on desktop, FAB on mobile) wherever a create-FAB previously
      existed — except Combat — Active's advance-turn FAB, which is a distinct action and stays
      untouched on both breakpoints. Add: Combat screen chrome — Setup header is back + title +
      `⋮` with two FABs (Add + hold-to-start Start); Active header is back + title + `⋮` plus a
      `round-esc-bar` sub-bar below the header.
- [x] **PLT-5 (Accessibility)** — confirm-only, no wording change expected: the ledger's PLT-5
      row is a note that the title-initial `ColorTagDot` colour stays aria-label-only, which
      already matches this requirement's existing "never conveyed by color alone" language. If a
      close read finds the existing AC bullets don't already cover the `ColorTagDot` case
      explicitly, add one clause naming it alongside the TypeStripe exception-list — otherwise
      leave PLT-5 unchanged and record "no change needed" in the phase report.

### Step 3 — Independent doc-pass verify

- [x] **Main-thread step (not the implementer):** dispatch a fresh read-only agent to check
      `component-inventory.md` and `platform.md` PLT-2/3/5 against the converged
      `specs/design/prototype.html` + `specs/design/card-prototype.html` **and** the feedback-log
      Reconcile ledger (`inv`, `PLT-2`, `PLT-3`, `PLT-5` rows) — the agent must not have written
      Step 1/2 itself. Record PASS or findings; re-fix and re-verify until PASS.

**Scope guard:** presentation / control-placement / per-state wording only — **no mechanics or
data change**, no capability files outside `platform.md`, no `src/` edits, no prototype HTML
edits.

**Gate:** `npm run gate` must pass before this phase is reported done.
