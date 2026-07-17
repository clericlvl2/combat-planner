# Product

Combat Planner is a local-only, offline-first initiative tracker for 13th Age tabletop combat.
It runs the DM's fight from Setup through Active — initiative, turns, rounds, escalation die,
HP/conditions — as a fast, one-handed phone/tablet tool at the table.

## Who it's for

A single Dungeon Master (or GM), running one combat at a time, on one device. Not a player-facing
tool, not a multi-device or multi-user tool.

## Goals

- Feel instant at the table: minimal taps, thumb-reachable controls, works one-handed in a dim
  room.
- Work fully offline as an installable PWA — no network dependency once installed.
- Keep all data local to the device (IndexedDB), with export/import as the only data-portability
  path.
- Support the real 13th Age combat loop end to end: roll/lock initiative, advance turns and
  rounds, track the escalation die, take damage/healing/temp HP, toggle conditions, undo/redo
  mistakes.
- Ship in the DM's own language (bundled locales) and in a theme that's readable in low light.

## Non-goals

- No backend, no server, no sync — nothing leaves the device except through explicit
  export/import.
- No telemetry or analytics of any kind.
- No multi-user or multi-device collaboration — one DM, one device, one session at a time.
- No player-facing screens or live-session sharing.
- No support for game systems other than 13th Age.
- No rules automation (attack resolution, damage rolls, monster AI) — this is a tracker, not a
  simulator.
