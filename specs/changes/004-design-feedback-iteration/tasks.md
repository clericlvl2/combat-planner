# Tasks: design-feedback-iteration

Generated from `change.md`. Each phase lists its owned files (no other phase may touch them) and
whether it can run in parallel with sibling phases in the same group.

**Partial breakdown — Phase 1 (reconciliation) only.** The later phases (prototype iteration,
final `component-inventory.md` reconcile to the converged prototype, `PLT-2/3/5` amendments) are
generated after Phase 1 lands and its bug-vs-redesign verdicts are recorded.

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
