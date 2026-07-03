---
id: settings
prefix: SET
---

# Settings — language, theme, reset, About

Export all / Import all controls live here in the UI but their behavior is fully owned by
[[import-export]] (IMP-1, IMP-3). PWA install/update and offline behavior are owned by
[[platform]], not here, even though they're both "app-wide."

## SET-1 — Language

6 bundled languages (English, German, Spanish, French, Japanese, Russian — mechanism:
`specs/adr/ADR-005.md`). Default = autodetected browser locale, fallback English. Manual switcher
in Settings. Switching applies immediately, persists, and works offline.

**AC:**
- On first run with no prior choice, the UI language matches the browser locale if it's one of
  the 6, otherwise English.
- Switching language in Settings changes all visible strings immediately, without a reload.
- The chosen language persists across reloads and survives Reset-all — see SET-3 (Reset-all keeps
  language/theme).

## SET-2 — Theme

Dark and light themes, following system preference by default; manual toggle in Settings; choice
persists. Color tags and health states remain legible in both themes.

**AC:**
- With no manual choice, the theme follows the OS/browser color-scheme preference.
- Toggling the theme in Settings persists across reloads.

## SET-3 — Reset all

Clears all combats. **Keeps** language and theme. Re-runs first-launch behavior (one empty
combat auto-created, see [[combats-list]] CLS-7). Requires confirmation; not undoable (see
[[undo-redo]] UND-2).

**AC:**
- Reset-all always shows a confirmation dialog first.
- After confirming, every combat is gone, language/theme are unchanged, and exactly one empty
  combat exists per the first-launch flow.

## SET-4 — Data actions (pointer)

Export all and Import all in Settings → Data invoke the behavior specified in [[import-export]]
IMP-1 and IMP-3.

## SET-5 — About page

A short static page: what the app is, its version, and a privacy note that data is local-only.

**AC:**
- The About page states the app's purpose, shows a version string, and states that data never
  leaves the device.
