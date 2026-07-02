# Reference: Numeric limits & form defaults

Sources: `Rules & Glossary` §7 (Combatant defaults & limits).

Single source of truth for every numeric range, default, and hard cap the app enforces.
Capability files point here rather than repeating values — see [[../capabilities/combatants]],
[[../capabilities/hp]], [[../capabilities/initiative]], [[../capabilities/turns-rounds-escalation]],
[[../capabilities/combats-list]], [[../capabilities/import-export]].

## Add-combatant form

| Field | Type | Required | Placeholder | Default |
|-------|------|----------|-------------|---------|
| Name | text | yes (trimmed; whitespace-only blocks submit) | "Namius Name" | — |
| Type | PC / enemy / ally | no | — | enemy |
| Initiative bonus | number | no | 0 | 0 |
| Max HP | number | yes | 10 | — |
| AC | number | yes | 10 | — |
| PD | number | yes | 10 | — |
| MD | number | yes | 10 | — |
| Text note | text | no | "Useful notes…" | "" |

The same form (pre-filled) is reused to edit an existing combatant, plus a manual-initiative
field as a backup entry point; the manual-initiative field is also surfaced on the add form when
adding while the combat is Active. Changing Max HP does not auto-change current HP
([[../capabilities/hp]] HP-5).

## Numeric ranges (clamp-on-commit)

Numeric fields clamp to their range on commit with a brief inline hint (validation is forgiving
to keep live play fast). The note is hard-capped at 250 characters during input (not clamped —
input beyond the cap is blocked/truncated).

| Field | Min | Max |
|-------|-----|-----|
| Note length | — | 250 chars |
| Initiative bonus | −99 | 99 |
| Initiative value (manual) | −9 | 99 |
| AC | 0 | 99 |
| PD | 0 | 99 |
| MD | 0 | 99 |
| Max HP | 1 | 999 |
| Current HP | −MaxHP | 999 |
| Temp HP | 0 | 999 |
| Round counter | 1 | 99 |
| Escalation die | 0 | 6 |

## Hard caps

- **Combatants per combat: 30.** Adding the 31st is blocked with a message
  ([[../capabilities/combatants]] CBT-3, CBT-7).
- **Total combats: 100.** Creating/importing past 100 is blocked with a message
  ([[../capabilities/combats-list]] CLS-2, [[../capabilities/import-export]] IMP-3/IMP-5).
