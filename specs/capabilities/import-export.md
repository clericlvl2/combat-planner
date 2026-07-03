---
id: import-export
prefix: IMP
---

# Import / export — backup & portability

Schema-version compatibility mechanics (the migration transform itself) are an implementation
concern owned by `specs/adr/ADR-013.md` — this file owns only the import/export *behavior* that
depends on it (refusal on newer version, forward migration on older).

## IMP-1 — Export all

Produces a portable file of the full app data: every combat, Settings, and the data-version
marker. Includes each combatant's HP log ([[hp-log]] LOG-5) — a full backup keeps play history.

**AC:**
- The exported file contains every existing combat with its full roster and each combatant's
  HP log, plus Settings and the data-version marker.

## IMP-2 — Export single combat

Produces a portable file of one combat (shareable). The combatant HP logs **are** included (the
change history travels with the shared fight). The combat-level undo/redo history is **not**
exported (see [[undo-redo]] UND-6) — a fresh import starts with an empty stack.

**AC:**
- A single-combat export includes that combat's roster and every combatant's HP log.
- A single-combat export never includes the undo/redo stack.

## IMP-3 — Import all (merge)

Imported combats are added as new copies (following the same new-copy rule as IMP-4); local
Settings (language/theme) are **not** overwritten by an import-all. Blocked if it would exceed
the 100-combat cap ([[../reference/limits]]).

**AC:**
- After an import-all, prior local combats are untouched and the imported ones appear as
  additional (new-id) combats.
- Local language/theme settings are unchanged by an import-all, regardless of what the imported
  file's settings say.
- An import-all that would exceed 100 total combats is refused entirely (IMP-5).

## IMP-4 — Import single combat (always new copy)

A single-combat import always creates a **new copy**: new ids, a suffixed title. It never
overwrites an existing combat.

**AC:**
- Importing a single-combat file always results in an additional combat with a new id and a
  suffixed title, never replacing or merging into an existing one.

## IMP-5 — Import errors are fail-safe

Imports never apply partially. Three refusal cases, each leaving existing data completely
untouched:
- **Corrupt/unreadable file** → blocking error, nothing imported.
- **File from a newer data version** → refused with an "update the app" message.
- **Would exceed the 100-combat cap** ([[../reference/limits]]) → refused with a message.

An **older**-version file is instead migrated forward via the shared ADR-013 transform chain and
imported normally (not a fail-safe case).

**AC:**
- A corrupt file import leaves the app state byte-for-byte unchanged and shows a blocking error.
- A newer-data-version file import is refused with an "update the app" message; nothing is
  imported.
- An import that would push total combats past 100 is refused with a message; nothing is
  imported.
- An older-data-version file imports successfully after forward migration.
