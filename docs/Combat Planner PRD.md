---
categories:
  - "[[Prompts]]"
aliases:
  - Combat Planner PRD
  - Initiative Tracker PRD
related:
  - "[[Combat Planner Rules & Glossary]]"
  - "[[Combat Planner Data Model]]"
  - "[[Combat Planner UX & IA]]"
  - "[[Combat Planner Test Plan]]"
  - "[[Combat Planner Status & Roadmap]]"
  - "[[Combat Planner Requirements Prompt]]"
---

# Combat Planner — Product Requirements (PRD)

> Planning document. **No implementation details** (no framework, storage API, or library choices). Those are deferred to a later Architecture/ADR doc. This set: [[Combat Planner Rules & Glossary]] · [[Combat Planner Data Model]] · [[Combat Planner UX & IA]]. Source sketch: [[Combat Planner Requirements Prompt]].

## 1. Vision

A focused **combat planner / initiative tracker for 13th Age** that a Dungeon Master runs at the table on their own device to manage turn order, hit points, the escalation die, and conditions during an encounter. It is fast to operate one-handed on a phone, works fully offline, and never depends on a network or account.

## 2. Target user & context

- **Primary user:** a single DM running 13th Age combat live at the table.
- **Context of use:** real-time during play, often dim rooms, one-handed phone use, occasional tablet/desktop for prep. No internet assumed.
- **Single-user, single-device.** No collaboration, no players' devices, no sharing of a live session.

## 3. Goals / non-goals

**Goals**
- Manage one combat encounter at a time: combatants, initiative/turn order, HP, temp HP, escalation die, conditions, round counter.
- Be instantly usable offline; data survives reloads and app updates.
- Mobile-first, installable PWA, responsive to tablet/desktop.
- Localized in 6 languages.

**Non-goals (v1)**
- No multi-device sync, accounts, or cloud (see [[#9. Out of scope]]).
- No rules automation (no auto-damage from conditions, no attack rolls, no auto-skip).
- No support for other game systems (D&D 5e, Pathfinder, etc.).
- No monster/stat-block library (deferred to v2).
- No telemetry/analytics of any kind — fully private.

## 4. Resolved scope decisions

Single source of truth for the choices that shaped this PRD. Mechanics detail in [[Combat Planner Rules & Glossary]]; structure in [[Combat Planner Data Model]]; screens in [[Combat Planner UX & IA]].

| # | Area | Decision |
|---|------|----------|
| 1 | Data scope | Local-only, single device. On-device storage. No backend / accounts / sync. |
| 2 | Game system | **13th Age**, explicitly. Adds escalation die + temp HP to the sketch. |
| 3 | Escalation die | Stored value, 0–6; +1 only when Advance wraps into a new round (fully decoupled from the round counter); DM can set it directly at any time; resets to 0 on Clear/Restart; visible only while Active. → [[Combat Planner Rules & Glossary]] §3. |
| 4 | Temp HP | Additive buffer, set freely; damage drains temp before current; heal restores current only. → [[Combat Planner Rules & Glossary]] §4. |
| 5 | Combatant type | Three-value visual **flag** — PC / enemy / ally — color only (all share fields incl. HP); `ally` = DM-run friendly NPC; optional on add form, default enemy. → [[Combat Planner Rules & Glossary]] §1. |
| 6 | List ordering | One initiative-sorted list; type shown via color/icon, never reorders by side. |
| 7 | Combat lifecycle | Two states **Setup → Active**. **Start** auto-rolls unrolled, activates, marks top active, reveals Advance + round + escalation; turn pointer identity-tracked (re-sort keeps the same combatant active). → [[Combat Planner Rules & Glossary]] §2. |
| 7b | Resets | **Clear** → empty Setup; **Restart** keeps roster, resets init/HP/temp/conditions + round→1 → Setup; remove-all → Setup. → [[Combat Planner Rules & Glossary]] §2. |
| 7c | Initiative input | **Tap** init cell = roll d20+bonus; **long-press** = manual entry (also in edit form); Start auto-rolls the rest. → [[Combat Planner Rules & Glossary]] §2. |
| 7d | HP model | Current HP floored at −MaxHP (reverse alarm bar below 0); heal never reduces; temp HP **replace**-on-set, drains before current. Ranges → [[Combat Planner Rules & Glossary]] §4/§7. |
| 8 | Conditions | Pure visual labels. Manual removal, no auto-expire. Up to all 12 at once, unique per combatant. |
| 9 | Backup | Export/import all data + export/import a single combat (file-based). |
| 10 | Undo | **Global per-combat Undo/Redo history** (10-deep, header **Undo ↶ / Redo ↷**, not per-action toasts). Covers HP, add/remove/duplicate, conditions, initiative, edits, Start, Advance, round/escalation, **and Clear/Restart**. Clear/Restart also keep a confirm dialog; **Delete-combat and Reset-all are confirm-only** (outside one combat). Start is not gated. Full model in [[Combat Planner Data Model]] §8. |
| 11 | i18n | 6 languages, AI-translated for v1, bundled offline. Autodetect browser locale, English fallback, manual switcher. |
| 12 | Pages | Combats (home) → Combat; Settings; About. |
| 13 | Combats list | Preset swatch palette for color tag; manual drag reorder; new combats added at top. |
| 14 | HP numpad | Actions: Deal Damage / Restore HP / Set Temp HP. Delta-based, with backspace/clear. |
| 15 | Card density | Compact row (turn-critical info) → tap to expand for secondary fields/actions. |
| 16 | Theme | Dark + light, follow system, manual toggle. |
| 17 | Scale | **Hard caps: 30 combatants per combat, 100 combats**; adding/creating/importing beyond is blocked. → [[Combat Planner Rules & Glossary]] §7. |
| 18 | Onboarding | Empty-state hints only. First launch auto-creates an empty combat and opens it. |
| 19 | PWA | "Update available" toast; subtle install hint; offline is silent/default. |
| 20 | Accessibility | Practical WCAG 2.1 AA (contrast, ≥44px targets, focus, labels, scalable text). |
| 21 | Privacy | No telemetry/analytics. |
| 22 | Edit combatant | All core stats editable after creation via a form; changing Max HP does not auto-change current HP. |
| 23 | HP change log | **Read-only per-combatant HP change log** (distinct from the combat-level Undo/Redo of Decision 10): logs Damage / Heal / Set temp HP / Set Max HP, viewed from the HP numpad sheet, and travels with export/import (unlike the undo stack). Full model in [[Combat Planner Data Model]] §9. |

## 5. Personas

- **Dana the DM** — runs a weekly 13th Age game. Wants to spend combat looking at players, not fiddling with a tool. Tracks 4–8 monsters and 4–5 PCs per fight. Preps a few encounters before the session on a tablet, runs them on her phone at the table.

## 6. User stories & acceptance criteria

Stories are grouped by epic. Each has acceptance criteria (AC). Field limits, the add-combatant form, conditions, and health states live in [[Combat Planner Rules & Glossary]].

### Epic A — App shell & platform

- **A1.** As a DM I can use the app on mobile, tablet, and desktop in a web browser.
  - AC: Layout adapts per breakpoint (see [[Combat Planner UX & IA]]). No feature is desktop-only.
- **A2.** As a DM my data persists across page reloads and app updates.
  - AC: Reloading or updating the app preserves all combats, combatants, settings, and in-progress turn state.
- **A3.** As a DM I can use the app fully offline.
  - AC: With no network, all features work. No screen requires connectivity.
- **A4.** As a DM I can install the app as a PWA.
  - AC: App is installable; a subtle install hint appears when eligible, shown **once** and **dismissible** (dismissal persists so it does not reappear); runs standalone after install.
- **A5.** As a DM I am notified when an update is available.
  - AC: When a new version is cached, an "Update available — reload" toast appears; reloading applies it without data loss.
- **A6.** As a DM I can switch the app language.
  - AC: 6 languages (English, German, Spanish, French, Japanese, Russian). Default = browser locale, fallback English. Manual switcher in Settings. Switch applies immediately, persists, and works offline.
- **A7.** As a DM I can use dark or light theme.
  - AC: Follows system by default; manual toggle in Settings; choice persists. Color tags and health states are legible in both.
- **A8.** As a DM the app is operable one-handed on a phone.
  - AC: Primary actions reachable in the thumb zone; floating control buttons bottom-right on mobile. Practical WCAG 2.1 AA.

### Epic B — Navigation

- **B1.** As a DM I can navigate between Combats, Settings, and About.
  - AC: [Mobile] swipe right reveals a sidebar with nav links. [Tablet] header with burger menu. [Desktop] header with inline navigation.
- **B2.** As a DM [Mobile] I see floating control buttons in the bottom-right.
  - AC: Context-appropriate primary actions float bottom-right on mobile screens.

### Epic C — Combats list (home)

- **C1.** As a DM I see all combats as a vertical list; each row shows Title, Description, and a Color tag.
- **C2.** As a DM I can create a combat with Title, Description, Color tag.
  - AC: Color tag chosen from a preset swatch palette. New combat is added at the top of the list.
- **C3.** As a DM I can edit a combat's Title, Description, Color tag.
- **C4.** As a DM I can delete a combat.
  - AC: Requires a confirmation prompt; deletion is permanent (no undo).
- **C5.** As a DM I can open a combat by tapping its row.
- **C6.** As a DM I can manually reorder combats.
  - AC: Drag to reorder; order persists.
- **C7.** As a DM on first launch, an empty combat is created automatically and I land on its Combat page.
- **C8.** As a DM I can export/import all my combats, and export/import or share a single combat.
  - AC: Export produces a portable file. **Import-all merges** (imported combats added as new copies; local language/theme untouched). **Single-combat import always creates a new copy** (suffixed title; never overwrites). Imports are **fail-safe**: corrupt files, newer-version files, or imports exceeding the 100-combat cap are refused with a message and never partially applied. (See [[Combat Planner UX & IA]].)

### Epic D — Combatants

- **D1.** As a DM I see a vertical list of combatants. Each **compact row** shows: active-turn indicator, type color stripe(s), a persistent `⋮` menu (Edit/Duplicate/Remove), name, initiative ("-" if unset), current/max HP, health bar, AC/PD/MD (in-row at all sizes), and condition icons (first few + a "+K" overflow chip); the card background itself also reflects HP status. Tapping the row expands it to show temp HP, the note, and the condition picker (chips become removable). (Full field list in [[Combat Planner Data Model]].)
- **D2.** As a DM I can add a combatant with: Name (required), Type (PC/enemy/ally, optional, default enemy — visual only), Initiative bonus, Max HP, AC, PD, MD, Text note. (Form spec in [[Combat Planner Rules & Glossary]].)
  - AC: New combatant's current HP = Max HP; temp HP = 0; initiative = "-"; no conditions. Blocked at the 30-combatant cap.
- **D3.** As a DM I can fully edit an existing combatant's fields (name, type, init bonus, Max HP, AC, PD, MD, note) via a form.
  - AC: Changing Max HP does **not** auto-change current HP.
- **D4.** As a DM I can change current HP via a numpad panel.
  - AC: Tap HP → type digits → choose **Deal Damage** (red), **Restore HP** (green), or **Set Temp HP**. Damage drains temp HP first, then current, clamped at −MaxHP. Heal adds to current and never reduces it (`min(cur+n, max(maxHP, cur))`). Set Temp HP **replaces** the buffer (0 clears). Backspace/clear available; empty entry is a no-op.
- **D5.** As a DM current HP may go negative (down to −MaxHP); the combatant stays in turn order.
  - AC: "dead" (0 or below) is a visual label only.
- **D6.** As a DM I see a health bar reflecting health state (full / wounded / bloodied / dead). Below 0 it shows a reverse-direction alarm-colored bar growing toward −MaxHP (thresholds in [[Combat Planner Rules & Glossary]] §4).
- **D7.** As a DM I can apply conditions from the preset list of 12.
  - AC: Each condition unique per combatant; up to all 12 at once; shown as icons/tags.
- **D8.** As a DM I can remove conditions manually.
  - AC: Conditions never auto-expire.
- **D9.** As a DM I can add/edit/remove a combatant's text note inline.
- **D10.** As a DM I can remove a combatant.
  - AC: If the removed combatant is the active turn, the turn advances to the next combatant automatically. Removal is undoable via the combat's Undo history.
- **D11.** As a DM I can duplicate a combatant.
  - AC: Naming uses Windows-style suffix ("Goblin", "Goblin 1", "Goblin 2"…). Duplicate resets initiative to "-", current HP to max, **temp HP to 0**, clears conditions, copies the note, **starts with an empty HP change log**, and is placed at the bottom of the list.
- **D12.** As a DM I can review a combatant's **HP change history** to see how its HP evolved during the fight. This is a **read-only log**, separate from the combat-level Undo/Redo (the header ↶/↷ controls); it never undoes anything.
  - AC: Each combatant keeps a per-combatant log of its HP-changing events — **Damage, Heal, Set temp HP, and Max HP edits** (nothing else: not conditions, initiative, or other field edits).
  - AC: Each entry shows the **action name**, the **amount** changed, the **resulting** current/Max HP and temp HP, and the **round** it happened on ("—" if it happened in Setup). Newest first.
  - AC: The log is **viewed from the HP numpad sheet** (a History section/toggle); it does not appear on the compact row. Before any HP change it shows a quiet "No HP changes yet".
  - AC: The log is **unbounded within a fight**; a new or duplicated combatant starts empty; **Restart** empties all logs; clearing the combat or removing a combatant discards the log.
  - AC: **Undoing** an HP action via the header Undo removes that event's log entry (Redo re-adds it), so the log always matches the combatant's real current HP.
  - AC: The log is **persisted** and **travels with export/import** of a combat (unlike the undo/redo stack, which is stripped).

### Epic E — Lifecycle, initiative, turns & rounds

- **E0.** As a DM, a new combat starts in **Setup**: I add/edit combatants and set initiative; the list does **not** auto-sort while in Setup (it stays in add order so edits don't reshuffle rows), and snaps to sorted order on Start. There is no active turn, Advance, round, or escalation die yet.
- **E1.** As a DM I can roll a single combatant's initiative by **tapping** its init cell (d20 + bonus; re-tap re-rolls), or set it manually by **long-pressing** (numeric entry, also reachable from the edit form).
  - AC: While Active, the list re-sorts on commit; while Setup, the displayed value updates but the row doesn't move. Manual range −9..99.
- **E2.** As a DM I can **Start** the combat.
  - AC: Start auto-rolls initiative (d20 + bonus) for every still-unrolled combatant, re-sorts, sets the combat **Active**, marks the top of order as the active turn, and reveals the Advance control, round counter (Round 1), and escalation die (0).
- **E3.** As a DM the list is sorted by initiative high→low.
  - AC: Tiebreak: higher initiative bonus wins; if still tied, original add order. Combatants with "-" always sit at the bottom in add order. A bonus edit re-sorts only when it changes a tie.
- **E4.** As a DM I can **Clear** the combat (wipe roster → empty Setup) or **Restart** it (keep roster; reset initiative/HP/temp/conditions, round→1, escalation→0 → Setup).
  - AC: Both require confirmation; both are also reversible via the combat's Undo history (a snapshot is pushed).
- **E5.** As a DM I see a round counter and escalation die **only while the combat is Active**. Round range 1–99.
- **E6.** As a DM I can edit the round counter by tapping. This never touches the escalation die (fully decoupled).
- **E7.** As a DM I can see whose turn it is.
  - AC: Active is set to the top of order on Start. The indicator is bound to the combatant's identity, so a re-sort keeps it on the same combatant.
- **E8.** As a DM I can advance to the next combatant's turn.
  - AC: Advancing past the last combatant wraps to the first, increments the round, **and** increments the escalation die by 1 (clamped at 6). A plain advance within the same round changes neither. **Only the round-99 wrap is blocked** — advancing within round 99 still works; the block fires when the last combatant of round 99 would wrap to round 100.
  - AC: As the most-repeated live action, Advance is the **bottom-right floating button (thumb zone)** on mobile in the Active state (see [[Combat Planner UX & IA]] §4c, §9), satisfying the one-handed reach of A8/B2.
- **E9.** As a DM I can track the escalation die.
  - AC: Stored as a single value 0–6; increments by 1 only when Advance wraps into a new round; I can set it directly at any time (future round-wraps continue +1 from that value); it resets to 0 on Clear/Restart. Editing the round counter never affects it.
- **E10.** As a DM, removing the active combatant moves the turn to the next in order (or to the new last if it was last), without a premature round increment. Removing all combatants reverts the combat to Setup.

### Epic F — Settings & data

- **F1.** As a DM I can change language, theme, export/import all data, and reset all data in Settings.
  - AC: Reset-all requires confirmation; it clears combats but **keeps** language/theme, then re-runs first-launch (one empty combat).
- **F2.** As a DM I can read a short About/help page (what the app is, version, privacy note that data is local-only).

## 7. Non-functional requirements

- **Offline-first:** every feature works with no network; offline is the default assumption.
- **Persistence:** all state (combats, combatants, turn pointer, round, escalation, settings) persists locally across reloads and updates.
- **Performance & caps:** smooth interaction (no perceptible lag on HP edits, sort, turn advance) at the hard caps of **30 combatants per combat** and **100 combats**; adding beyond is blocked.
- **Responsive:** mobile-first; defined behavior at mobile / tablet / desktop breakpoints (see [[Combat Planner UX & IA]]).
- **Accessibility:** practical WCAG 2.1 AA — contrast in both themes, ≥44px touch targets, visible focus, semantic labels, scalable text.
- **Localization:** 6 languages bundled offline; no hardcoded user-facing strings.
- **Privacy:** no network calls for app function; no telemetry/analytics; all data stays on device.
- **Reliability:** an interrupted action (e.g., reload mid-combat) must not corrupt combat state.

## 8. Risks & mitigations

- **Data loss on storage clear** (local-only) → mitigated by export/import + share-single-combat; About page notes data is local.
- **Mis-taps during live play** → a 10-deep per-combat Undo/Redo history covering HP, removal, turns, and most edits; confirmations still gate clear/restart/delete/reset.
- **Machine-translation quality** → strings flagged for later human review; English fallback.

## 9. Out of scope (v1) / future

- Monster/combatant **library** (reusable stat blocks) — strong v2 candidate.
- Multi-device sync, accounts, cloud backup.
- Other game systems / configurable schemas.
- Rules automation (condition effects, attack rolls, auto-skip, auto-expiry).
- Sharing a live session across devices.

## 10. Open questions & status

Open design questions (e.g. the combat color-tag swatch palette), the resolved-round history, and project status live in **[[Combat Planner Status & Roadmap]]** — kept out of this PRD so the spec stays timeless.
