---
categories:
  - "[[Prompts]]"
aliases:
  - Combat Planner Test Plan
  - Combat Planner Acceptance Matrix
  - Combat Planner Tests
related:
  - "[[Combat Planner Overview]]"
  - "[[Combat Planner PRD]]"
  - "[[Combat Planner Rules & Glossary]]"
  - "[[Combat Planner Data Model]]"
  - "[[Combat Planner UX & IA]]"
  - "[[Combat Planner Architecture]]"
  - "[[Combat Planner Component Inventory]]"
---


> **Archived — superseded by `specs/`.** Frozen for historical provenance; do not edit. Current
> source of truth: `specs/capabilities/`, `specs/reference/`, and `docs/adr/`. See
> `specs/README.md` for the process and `specs/reference/migration-traceability.md` for exactly
> where each fact in this document moved.


# Combat Planner — Test Plan & Acceptance Matrix

> The single owner of the **test strategy, the case inventory, and the requirement → test acceptance matrix**. Realizes [[Combat Planner Architecture]] ADR-009 (Vitest + @testing-library/svelte + Playwright). It says **what is tested at which layer and which requirement each test discharges** — not the tooling rationale, not the numbers under assertion, not the flows themselves. No test code, no framework config — case descriptions + assertions-in-prose only.

## 1. How to read this doc (owns vs points-to)

- **This doc owns:** the test layering, the unit/component/E2E case inventory, the requirement→test matrix, and the coverage/CI gate intent.
- **It points to, never restates:**
  - the **tooling choice + rationale** (Biome / Vitest / @testing-library/svelte / Playwright; purity → cheap unit tests) → [[Combat Planner Architecture]] ADR-009 (+ ADR-002, ADR-013).
  - the **numbers & formulas a test asserts against** (initiative sort/tiebreak + round-99 wrap → [[Combat Planner Rules & Glossary]] §2; escalation math → §3; HP/temp/heal + health thresholds + reverse bar → §4; numeric ranges + 30/100 caps → §7; duplicate suffixing → §8). Tests **assert against** these values; this doc never re-prints them.
  - the **transitions & invariants under test** (key operations → [[Combat Planner Data Model]] §7; undo/redo model → §8; hpLog append/pop → §9; import fail-safe + dataVersion gate → §10).
  - the **flows & states** exercised end-to-end (F1–F5 → [[Combat Planner UX & IA]] §5; state-coverage matrix → §6; a11y → §8).
  - the **requirements & acceptance criteria** each test traces to (epics/stories A–F → [[Combat Planner PRD]] §6).
  - the **component states** a component test must cover → [[Combat Planner Component Inventory]] (§3–§11 + §14 state coverage).
- **Assertion convention:** a case reads "*operation* → asserts *expected* (owner §)". The "(owner §)" is where the asserted value/rule lives; if that section changes, the test — and only the test — follows.

## 2. Test layers

Three layers, narrow waist on E2E (ADR-009). Each fact is asserted at exactly one layer; higher layers assume lower-layer guarantees and do **not** re-assert internal math.

| Layer | Tool (→ ADR-009) | Covers | Does **not** cover |
|---|---|---|---|
| **Unit** | Vitest | Pure store transitions (Data §7) and pure helpers — derived values `sortedCombatants` / `escalationDie` / `canAdvance` / `healthStatus` (Data §3/§4), and ADR-013 migration transforms. RNG (`d20`) injected/mocked for determinism. | DOM, rendering, gestures, real persistence round-trip, routing. |
| **Component** | @testing-library/svelte | One component in isolation: render per variant/prop, user interaction, emitted intent, and the WCAG-AA labels (states from [[Combat Planner Component Inventory]]). Store/Dexie stubbed. | Multi-screen flows, real IndexedDB, the service worker, cross-component orchestration. |
| **E2E** | Playwright | Flows F1–F5 (UX §5) on real IndexedDB across viewports, plus the offline guarantee, the PWA update toast/reload, and import fail-safe. | Internal transition/clamp/sort math (already pinned by unit) — E2E asserts observable outcomes, not formulas. |

## 3. Unit cases — store transitions + pure helpers (Vitest)

Targets the ADR-002 store seam (transitions are pure → cheap) and ADR-013 transforms. Each bullet = one operation under test → assertion (owner §).

### 3.1 Lifecycle
- **start** — Setup roster, mix of `"-"` and rolled → asserts every still-`"-"` gets `d20+bonus` (mocked RNG), re-sort, `state=active`, `round=1`, `activeCombatantId` = top of sorted order, `showRoundAndEscalation` flips true, and a **pre-Start snapshot** is pushed to undo (Data §7 `start`, §8).
- **advanceTurn** — next in sorted order; past last → wrap, `round+1` **and** escalation `+1`; a plain advance within the round changes neither (Data §7 `advanceTurn`). Boundary: advancing **within** round 99 still works; `canAdvance` is false only at the r99→r100 wrap (Data §3 `canAdvance`, Rules §2).
- **clearCombat** — roster emptied (+ their hpLogs), `state→setup`, escalation reset to 0, active `"none"`, roster snapshot pushed (Data §7 `clearCombat`).
- **restart** — roster kept; per combatant reset (init `"-"`, cur=max, temp 0, conditions cleared, hpLog emptied — Rules §2 / Data §7 `restart`); `round→1`; escalation reset to 0; `state→setup`; snapshot pushed.
- **remove-all-while-active** — removing the last combatant reverts `active → setup`, active `"none"`, no premature round bump (Data §6).

### 3.2 Sort + tiebreak
- `sortedCombatants` orders init high→low; tiebreak (1) higher bonus, (2) `addOrder`; `"-"` always at bottom in `addOrder` (Rules §2, PRD E3).
- A bonus edit re-sorts **only when it changes a tie** (Rules §2 / PRD E3) — assert a non-tie bonus edit leaves order untouched.

### 3.3 Escalation
- `escalationDie` = `clamp(escalation, 0, 6)`; stored, not derived (Rules §3).
- `advanceTurn` increments escalation by 1 only on the round-wrap branch; a same-round advance leaves it untouched (Rules §3 / Data §7 `advanceTurn`).
- `editRound` never touches escalation — fully decoupled in both directions (Rules §3 / Data §7 `editRound`).
- `setEscalation` sets the value directly (clamped 0–6); reset to 0 by `clearCombat`/`restart` (Rules §3, Data §6).

### 3.4 HP
- **dealDamage** — drains temp first, remainder off current, clamps at the Rules §7 floor (`−maxHp`) (Rules §4).
- **restoreHp** — heal formula `min(cur+n, max(maxHp, cur))`; never reduces, even when `cur > maxHp` (Rules §4).
- **setTempHp** — replaces buffer; `0` clears (Rules §4).
- **empty entry** — commit is a no-op (no state change, no log entry) (Rules §4 / UX §4c).
- **clamp** — current HP floored at `−maxHp` and capped per Rules §7 ranges.

### 3.5 Health-status banding
- `healthStatus` bands full / wounded / bloodied / dead at the Rules §4 thresholds; `cur > maxHp` (>100%) reads **full**; `≤0` reads **dead** with the reverse/alarm bar maxing at `−maxHp` (Rules §4 / Data §4).

### 3.6 Undo / redo
- Bounded at **10** — the 11th action drops the oldest (Data §8).
- A new action **clears the redo branch** (Data §8).
- **Clear/Restart** reversal restores the roster snapshot exactly (Data §8).
- **Advance** reversal steps the turn back — and unwinds a round/escalation **wrap** (Data §8) — so no separate "previous turn" control is needed.
- **Max-HP edit** is its **own discrete undo step**, separate from the other field edits saved in the same form submit (Data §7 `editCombatant`, §8).
- Each control disabled at its stack end (Data §8 / Component Inventory §8b IconButton `disabled`).

### 3.7 hpLog (append + undo interaction)
- Append on **Damage / Heal / Set temp HP / Set Max HP** only — not conditions/init/other edits (Data §9, Rules §4).
- Entry captures `type / delta / currentHp / tempHp / maxHp / round` at write time ("—" when in Setup) (Data §9).
- **Undo** of an HP action **pops** its matching entry; **Redo** re-adds it — log always mirrors real current HP (Data §8/§9).
- `addCombatant` / `duplicate` start empty; **restart** empties all logs; clear/remove discards with the combatant (Data §9).

### 3.8 Duplicate
- Windows-style suffixing, **skipping already-taken suffixes** (Rules §8).
- Resets init `"-"` / cur=max / temp 0 / conditions cleared / hpLog emptied; copies stats + note; appended at bottom; blocked at the 30 cap (Rules §8 / Data §6).

### 3.9 ADR-013 migration transforms
- Each step is a **pure function**; **Dexie `version().upgrade()` and the import path call the same transform** (one transform, two callers — ADR-013).
- An **older** `dataVersion` file is migrated forward through the chained transforms; a **newer** one is refused ("update the app") (Data §10 / ADR-013).
- An **additive, default-tolerant** field change needs **no** transform — assert read-time defaulting fills it (ADR-013).

## 4. Component cases (@testing-library/svelte)

One component, real render, stubbed store. States/variants per [[Combat Planner Component Inventory]]; a11y labels per [[Combat Planner UX & IA]] §8.

- **CombatantRow — compact ↔ expanded** (Collapsible): tap toggles; expanded reveals TempHpField · NoteField · ConditionPicker (chips removable); the `⋮` menu (Edit/Duplicate/Remove) is persistent in both states, not expanded-only; compact hides temp HP (Component Inventory §8). Asserts `aria` expand/collapse label + active-highlight on `isActive`.
- **NumpadSheet** (Component Inventory §9 / UX §4c): digit entry updates EntryDisplay; **Deal Damage / Restore HP / Set Temp HP** emit the right commit intent; **empty entry → CommitActions disabled (no-op)**; **History** toggle reveals the read-only hpLog list ("No HP changes yet" when empty), view-only (no undo control inside); dismiss (outside/Cancel) emits no commit.
- **Forms — clamp + name-required** (Component Inventory §10 / UX §8): NumberField clamps to the Rules §7 range on commit and shows the inline hint; name field blocks submit on empty/whitespace-only (Rules §7).
- **Condition toggle / overflow** (Component Inventory §8): ConditionPicker toggles membership (unique, up to 12); ConditionIconList shows first-few + the **"+K" overflow chip** with the plural a11y label (UX §4c, i18n `a11y.condition.overflow`).

## 5. E2E scenarios (Playwright)

Real IndexedDB; assert observable outcomes, not internal math. Viewport set: **mobile + desktop** primary; **tablet** spot-check on nav/header only (UX §7).

- **F1 — Run a fight** (UX §5): Setup → add combatants → roll/long-press init (no live sort — add order until Start) → **Start** (snaps to sorted order) → advance turns, numpad damage, toggle conditions → round wrap (escalation +1) → Clear/Restart. Run mobile **and** desktop.
- **F2 — Add mid-combat:** add during Active → lands `"-"` at bottom, active identity unchanged → set init → re-sort holds the active pointer (UX §5 / PRD E7).
- **F3 — Undo a mistake:** wrong damage → header **Undo ↶** restores HP (clamped to current Max HP); accidental remove → Undo restores combatant + turn pointer; **Redo ↷** re-applies (UX §5 / PRD F3).
- **F4 — Restart & re-run:** finish → **Restart** → roster kept, all reset to Setup → Start again (UX §5 / PRD E4).
- **F5 — Prep tablet → run phone:** export single combat → import on a fresh profile → **new copy** (suffixed, hpLog travels, undo stack stripped) (UX §5 / Data §10).
- **Offline guarantee:** with the network blocked, every feature still works; no screen requires connectivity (PRD A3 / NFR). Assert no runtime network calls fire (ADR-010).
- **PWA update toast / reload:** a waiting service worker surfaces the **"Update available — reload"** toast; reload activates the new version with **no data loss** (data in IndexedDB survives) (PRD A5 / ADR-004).
- **Import fail-safe** (Data §10): **corrupt** file → blocking error, nothing imported; **newer-version** file → refused with "update the app"; **over-cap** import (would exceed 100) → refused — existing data untouched in all three.

## 6. Acceptance matrix (requirement → covering test → layer)

Every PRD §6 story and every UX §5 flow maps to at least one covering test. `U`=unit (§3), `C`=component (§4), `E`=E2E (§5).

| Req | Covering test | Layer |
|---|---|---|
| **A1** responsive | F1 on mobile+desktop; tablet nav spot-check | E |
| **A2** persists across reload/update | PWA update/reload; Dexie persistence round-trip | E |
| **A3** offline | Offline guarantee | E |
| **A4** installable / dismissible hint | Install-hint shown-once + dismissal persists | E |
| **A5** update toast | PWA update toast/reload | E |
| **A6** language switch (offline, persists) | LanguageSwitcher commit + persisted reload | C, E |
| **A7** theme | ThemeSwitcher + persisted reload | C, E |
| **A8** one-handed / WCAG-AA | a11y labels (§4) + focus/target audit on F1 | C, E |
| **B1/B2** nav + FAB per breakpoint | Nav per viewport; FAB present mobile, header desktop | E |
| **C1–C5** combats CRUD + open | CombatFormDialog (create/edit, name-required); delete confirm; open row | C, E |
| **C6** reorder | drag-reorder persists (ADR-006) | E |
| **C7** first-launch auto-combat | firstLaunch transition; lands on Combat | U, E |
| **C8** export/import (merge / new copy / fail-safe) | migration transform (§3.9); Import fail-safe; F5 | U, E |
| **D1** compact/expanded row | CombatantRow toggle | C |
| **D2** add combatant (+ cap) | `addCombatant` (defaults, 30-cap); form clamp/name | U, C |
| **D3** edit (Max HP ⇏ current) | `editCombatant` (Max-HP discrete step) | U |
| **D4** HP numpad | dealDamage/restoreHp/setTempHp/no-op (§3.4); NumpadSheet | U, C |
| **D5/D6** negative HP + health bar | clamp + `healthStatus` banding + reverse bar (§3.4/§3.5) | U, C |
| **D7/D8** conditions add/remove | addCondition/removeCondition; ConditionPicker | U, C |
| **D9** note inline | NoteField (cap 250) | C |
| **D10** remove (+ active advances, undoable) | remove transition + active-pointer move; Undo (F3) | U, E |
| **D11** duplicate | duplicate suffix/reset/cap (§3.8) | U |
| **D12** HP change log | hpLog append/pop (§3.7); History section (§4) | U, C |
| **E0** Setup state | lifecycle pre-Start; state-coverage | U, E |
| **E1** roll/manual init | rollOne / setInitiative + re-sort | U, C |
| **E2** Start | `start` transition; F1 | U, E |
| **E3** sort + tiebreak | sort/tiebreak (§3.2) | U |
| **E4** Clear/Restart (confirm + undoable) | clear/restart (§3.1); Undo; F4 | U, E |
| **E5/E6** round counter + edit | editRound (never touches escalation) (§3.3) | U, C |
| **E7** whose turn (identity-bound) | F2 (re-sort keeps active) | U, E |
| **E8** advance + r99 wrap block | advanceTurn + `canAdvance` boundary (§3.1) | U |
| **E9** escalation track/set | escalation, round-wrap-only increment (§3.3) | U |
| **E10** remove active / remove all | active-pointer move + revert-to-setup (§3.1) | U |
| **F1 (PRD)** settings + reset-all | resetAll (keeps lang/theme, re-first-launch); DataActions | U, C |
| **F2 (PRD)** About page | AboutPage render | C |
| **Flow F1–F5 (UX §5)** | E2E scenarios §5 | E |

## 7. Coverage targets & CI gate

Per ADR-009 (purity → cheap unit coverage):

- **Store seam (transitions + derived helpers, Data §7/§3/§4) and ADR-013 transforms:** the priority surface — aim for **near-total** branch coverage (every lifecycle/HP/undo/sort/migration branch above has a case). These are pure, so the cost is low.
- **Component:** every component's enumerated states (Component Inventory §14) has at least one render/interaction assertion; a11y labels (UX §8) asserted on interactive components.
- **E2E:** F1–F5 + offline + PWA update + import fail-safe all green on mobile + desktop projects.
- **CI gate (ADR-009 toolchain):** Biome (lint+format) clean → Vitest (unit+component) green → Playwright (E2E) green. Merge blocks on any red or a drop below the store-seam coverage threshold.
- **Gap:** ADR-009 names the tools but sets **no explicit coverage percentage or CI-gate config** — the numeric threshold above is a proposal to ratify there, not a value this doc owns (flagged, §8).

## 8. Gaps (flagged, not filled)

- **No coverage number in ADR-009.** The store-seam threshold (§7) is unset upstream — ratify a concrete % in [[Combat Planner Architecture]] ADR-009 (this doc only proposes "near-total").
- **Viewport matrix unspecified.** UX §7 defines mobile/tablet/desktop behavior but no doc fixes the **Playwright project list / exact breakpoints**. §5 assumes mobile+desktop primary, tablet spot-check — confirm and pin in ADR-009.
- **Persistence round-trip ownership.** "Survives reload/update" (PRD A2, Data §10) is asserted at E2E here; whether an interrupted-write/transaction-integrity case (ADR-003) also needs a dedicated harness test is unstated — flag for the store-seam build.
- **a11y depth.** WCAG-AA is checked via per-component label assertions + manual focus/target review (§6 A8); whether an automated axe-style scan is in scope is not decided in ADR-009/UX §8 — flag.
- **Test-data fixtures / RNG seam.** Unit cases assume an injectable `d20` (ADR-002 store seam); the exact injection point isn't named in the Data/Architecture docs — confirm during the store-seam build (next doc).
