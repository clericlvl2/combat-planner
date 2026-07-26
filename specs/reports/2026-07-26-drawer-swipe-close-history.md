# Investigation: bottom drawer won't close on swipe-down

**Status:** fix shipped (attempt 6, 2026-07-27) — repro confirmed on device, root cause isolated
to the browser's pan-claim on the scroll region; awaiting the blocking device pass. Folded into
W-032, no row of its own.
**Date:** 2026-07-26, updated 2026-07-27
**History:** four shipped attempts across W-021, W-029, W-030, W-031, a re-scoping in W-032, and
the scroll-region guard (attempt 6).

## Symptom (original user report, 2026-07-16)

> "there is some problem with drawer and down swipe in the drawer center, it little shifts and
> do nothing (not closing). same for all modals, cant reproduce controllably"

Three details in that sentence carried the whole diagnosis and are worth keeping:

- **"in the drawer center"** — the gesture starts on body content, not on the grabber bar.
- **"little shifts and do nothing"** — the drag *is* recognized; the sheet translates a few px,
  then rebounds. That is a drag that never crossed the dismiss threshold, not a dead listener.
- **"cant reproduce controllably"** — the outcome depends on what the thumb lands on, so it looks
  intermittent while being fully deterministic per element.

## Why this is hard to fix once and for all

Every attempt below is the same conflict in a different place: **on a touch device, one element
cannot both scroll and be a drag handle.** vaul implements swipe-to-close by tracking pointer
events on the drawer; the browser simultaneously offers native gestures on the same element —
pan-scroll on a scroll container, caret placement and text selection on an input, and so on. When
the browser decides the gesture is its own, it fires `pointercancel`, vaul loses the pointer
mid-drag, and the sheet snaps back to open. From the outside that is always the same symptom: a
small shift and a rebound.

So the fix is never "enable swipe-close." It is deciding, per element, which of the two gestures
wins — and every such decision trades away the other one.

## Approach history

### 1. W-021 (2026-07-16) — the grabber was never a handle · commit `8780f01`

**Found:** the grabber bar in `drawer-content.svelte` was a bare decorative `<div>`. vaul-svelte
ships a real `Drawer.Handle` primitive; the vendored shadcn wrapper had never used it. There was
nothing to drag by, so a center-of-drawer swipe fell through to the scrollable body, and vaul only
free-drags from non-scroll areas.

**Did:** swapped the dead `<div>` for `DrawerPrimitive.Handle`, keeping the same visual classes.
Left the body draggable — `handleOnly` was considered and deliberately rejected, so the drawer
would still close from a swipe anywhere, not just on the 100px bar.

**Still in place:** `drawer-content.svelte:28`. This one was a genuine bug and its fix has never
been reverted.

**Did not settle it**, because leaving the body draggable kept the body-vs-vaul contest alive —
which is what the next three attempts are all about.

### 2. W-029 (2026-07-23) — `touch-action: none` on Input/Textarea · commit `00ebf7e`

**Found:** dragging down starting on a text field never closed the drawer. Native form controls
run their own touch handling (caret, selection, scroll); the browser won the contest and fired
`pointercancel` mid-drag.

**Did:** `touch-none` on the base `Input` and `Textarea` — i.e. told the browser to stop
contesting any gesture on those elements.

**Cost, unnoticed at the time:** `touch-action: none` disables *all* browser gestures on the
element, pan-scrolling included. Drawers stopped scrolling when the drag started on a field.
Traded a closing bug for a scrolling bug.

### 3. W-030 (2026-07-24) — same treatment for buttons and pills · commit `d5f0a35`

**Found:** the identical mechanism was still live on non-input controls. vaul's `shouldDrag`
permitted the drag on them, but their default `touch-action` let the browser claim the vertical
gesture as a pan of the drawer's `overflow-y-auto` wrapper — `pointercancel`, snap back.
`CombatFormDialog` appeared unaffected only because its mobile drawer had no scroll wrapper;
`CombatantForm` and `LibraryEntryFormDialog` both did.

**Did:** `touch-none` on `ToggleGroupItem` in the ui primitive (every `ToggleGroup` in the app
lives inside a modal), and a class passthrough on `TagChip` so drawers could opt in while
`LibraryRow`'s list chips stayed page-scrollable. Library template-picker rows were deliberately
left alone — they are their own scroll container and must stay draggable to scroll.

**Cost:** extended W-029's scroll regression to more of the form surface.

### 4. W-031 (2026-07-26) — `pan-y` instead of `none` · commit `5cb87a0`

**Found:** W-029 and W-030 had fixed a real `pointercancel` race with a blunt instrument. The
correct axis-level answer is `touch-action: pan-y`: the browser keeps the **vertical pan**
(scrolling works) while the caret/selection gesture that actually stole the pointer is suppressed.
vaul's own `shouldDrag` already permits a close-drag only at `scrollTop === 0`, so the two no
longer contest the same gesture at the same moment.

**Did:** `touch-none` → `touch-pan-y` on Input/Textarea; dropped the override entirely from
`NumberField` steppers and `TagChip`, where the rationale never applied (a plain button has no
native caret or selection gesture to suppress).

**Noted but not taken:** `data-vaul-no-drag`, which vaul-svelte 1.0 supports
(`use-drawer-root.svelte.js:87`). It tells vaul "never start a drag here" rather than telling the
browser "don't contest this gesture" — the opposite side of the same trade, and the untried lever
if steppers still misbehave.

### 5. W-032 (2026-07-26) — policy moved into one component · commits `3ce022c`, `a269ebe`

Not a fix attempt; a re-scoping. W-031's rule sat on the **base** `Input`/`Textarea`, so every
input in the app — desktop included, where vaul does not exist — carried a policy only vaul needs.
`ResponsiveModal` now owns it, scoped to the drawer it marks:

```css
:global([data-responsive-modal='drawer'] :is(input, textarea)) { touch-action: pan-y; }
```

All six modals now render through that one component, so the gesture surface is finally defined in
one file (`ResponsiveModal.svelte:114-121`). Same policy, narrower blast radius — but a rewrite of
every drawer in the app that no device has yet touched.

### 6. W-032 device pass → scroll-region guard (2026-07-27)

**Repro confirmed** (2026-07-26, Android Chrome PWA, production `af22b06`): a slow swipe-down at
`scrollTop === 0` rebounds on everything inside the drawer body — plain content, text inputs,
steppers, chips — on the form drawers **and NumpadSheet**. The sharper signature that cracked it:
a **fast flick on the same spot closes**, and swipes starting on the footer buttons or the
grabber close. Mid-scroll scrolls correctly; backdrop/Cancel dismiss.

**Found:** the per-element framing of attempts 2–4 was one level too low. vaul-svelte ships
`[data-vaul-drawer] { touch-action: none }` on the drawer shell (which is why grabber and footer
swipes survive — no scroll container sits between them and the shell), but `ResponsiveModal`'s
`overflow-y-auto` region is a separate scroll container below it, and gesture arbitration for
touches inside it never consults the shell's rule. The browser may claim any vertical pan there;
at `scrollTop 0` a down-pan scrolls nothing but is claimed anyway (overscroll path) →
`pointercancel` → vaul, which registers no `pointercancel` handler, ends the drag through its
`onpointerout` fallback at the last known position → few-px shift, snap back. Fast flicks close
because `pointerup` beats the scroll-commit and `handleRelease` closes on `velocity > 0.4`
regardless of distance. NumpadSheet rebounds because its region overflows by a rounding hair —
enough to count as a claimable scroller. Upstream React vaul has the identical design (pointer
events only, no `touchmove` preventDefault, no `pointercancel` handling); not a port gap.

**Did:** scroll-state-aware directional `touch-action`, owned by `ResponsiveModal`: a
`drawerScrollGuard` action stamps scroll containers with `data-scroll-at-top`, and at top the
region gets `touch-action: pan-down`. Directional values name the *scroll* direction (`pan-down`
= finger moving up), so scroll-into-content stays native while the finger-down close swipe is
denied to the browser — vaul keeps the pointer and the drag crosses the threshold. The scrolled
state deliberately has no rule (vaul's `shouldDrag` already refuses close-drags there). The value
is Chromium-only (BCD: Chrome 55+; Safari/Firefox never) and sits behind `@supports`, so
non-Chromium keeps exactly the pre-fix behavior; the fleet is a single Android Chrome PWA.
`CombatantForm`'s template list — its own scroll container with the same defect one level
deeper — opts into the same action; per user decision (2026-07-26), swipe-down at list top closes
the drawer.

**Why not the lever named in attempt 4:** `data-vaul-no-drag` tells vaul to never start a drag —
on the body it would make swipe-close impossible and kill the working fast flick; backwards for
this repro. The three failed `touch-action` attempts were static and axis-level on leaf controls;
the conflict only splits cleanly per **pan direction × scroll position** on the **container**.

**Known residuals:** a `textarea` whose content overflows becomes its own scroller the guard does
not reach (rebound possible only there); vaul's `scrollLockTimeout` (100 ms) suppresses a
close-drag started right after a scroll ends — expected feel, not the defect. Fallback if the
device pass still rebounds at top: a non-passive `touchmove` guard in the same action, deciding
by ~3 px whether the gesture is a close-drag and `preventDefault()`ing the browser out — analysis
in `.claude/plans/2026-07-26-drawer-swipe-close-scroll-guard.md`.

## Current state (as of attempt 6; device pass pending)

| Element | Policy | Set by |
|---|---|---|
| Grabber bar | real `DrawerPrimitive.Handle` | W-021, `drawer-content.svelte:28` |
| `input` / `textarea` **inside a drawer** | `touch-action: pan-y` | W-032, `ResponsiveModal.svelte:120` |
| `input` / `textarea` elsewhere | browser default | W-032 removed the base-component rule |
| NumberField steppers, TagChip, ToggleGroupItem | browser default, no override | W-031 |
| Drawer body | draggable — `handleOnly` never enabled | W-021 |
| Scroll region | `overflow-y-auto`, close-drag allowed only at `scrollTop === 0` | vaul `shouldDrag` |
| Scroll region **at top** (all six drawers) | `data-scroll-at-top` → `touch-action: pan-down` (Chromium; `@supports`-gated) | attempt 6, `ResponsiveModal.svelte` |
| CombatantForm template list | same guard via exported `drawerScrollGuard` action | attempt 6 |

**One inconsistency worth a look:** `CombatantForm.svelte:214` — the library-picker search box is a
raw `<input>` with a hand-written `touch-pan-y` class, not a `ui/input`. It gets the right policy
twice over (its own class, plus `ResponsiveModal`'s descendant rule) so it is not a defect, but it
is the last hand-rolled copy of a policy that now lives in one place.

## Verification (required — none of this is covered by tests)

Unit tests cannot see any of it: no stylesheet loads in the vitest browser environment (verified
2026-07-26 — computed padding reads `0px` even for long-shipped classes), and gestures are not
simulated at all. Every claim above rests on device testing.

Per drawer — `ConditionPicker`, `TagAssignmentDialog`, `CombatFormDialog`, `CombatantForm`,
`LibraryEntryFormDialog`, `NumpadSheet`:

1. Swipe down **on the grabber bar** → closes.
2. Swipe down **on body content, with the body scrolled to top** → closes.
3. Swipe down **on body content, mid-scroll** → scrolls, does not close (correct per
   `shouldDrag`), and reaching the top then continuing does not leave the drawer stuck.
4. Swipe down **starting on a text input** → drawer scrolls; caret does not fight it.
5. Swipe down **starting on a number stepper or a tag chip** → whichever behavior you want, note
   which one you get; these carry no override today.
6. Backdrop tap and Cancel still dismiss.

2026-07-26 pass against `af22b06`: (1) ✓, (2) **failed** — the defect, (3) ✓, (4) **failed**,
(5) **failed** (rebound), (6) ✓; plus two sharper data points — a fast body flick closes, and
swipes from the footer buttons close. That pass produced attempt 6; the same matrix (plus the
template list and NumpadSheet cases) must be re-run against the guard build before W-032 closes.

## Files

- `src/lib/components/app/ResponsiveModal.svelte` — the only touch policy: input/textarea
  `pan-y`, the `drawerScrollGuard` action, and the at-top `pan-down` rule (attempt 6)
- `src/lib/components/app/CombatantForm.svelte` — template list opts into `drawerScrollGuard`
- `src/lib/components/ui/drawer/drawer-content.svelte:28` — the real handle
- `src/lib/components/app/CombatantForm.svelte:214` — last hand-rolled `touch-pan-y`
- `src/lib/components/ui/input/input.svelte:50,68`, `textarea.svelte:18` — rationale comments
  pointing at `ResponsiveModal`

## Sources

Original report and root-cause session: 2026-07-16 (`d3fe5a3e`). Trade-off analysis naming
`data-vaul-no-drag`: 2026-07-25 (`22d1d2f1`). Commits: `8780f01`, `00ebf7e`, `d5f0a35`, `5cb87a0`,
`3ce022c`, `a269ebe`.
