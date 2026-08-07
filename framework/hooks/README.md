# .kaif/hooks — the optional refresh-hooks module

The context-refresh canon (AGENT_GUIDE.md → "Context refresh") is a **markdown ritual — complete
and self-sufficient on its own**: four triggers, the two-part witness (marker + acceptance
quote), the judge hunt. This module is the OPTIONAL second contour on top of it: on agent
systems that support lifecycle hooks, the same triggers become **mechanical injections** the
session cannot forget. A deployment without hooks is not degraded and never reddens for
lacking them.

## What ships here

| Script | Event (Claude Code) | Predicate (anti-noise) | Action |
|---|---|---|---|
| `session-start-refresh.mjs` | `SessionStart`, matcher `compact\|clear` | none — compaction is itself rare | injects the ORDER to re-read the re-read core + stamp the witness |
| `prompt-refresh-timer.mjs` | `UserPromptSubmit` | marker age > 60 min (`--minutes N` to override) | injects the refresh order; silent while the marker is fresh |
| `stop-status-guard.mjs` | `Stop` | session did work AND STATUS.md untouched > 3 h; **once per session** | soft block: update STATUS.md or say why nothing changed |

Design rules baked in (they are canon requirements, not preferences): every hook carries a
predicate and a cooldown; injections are ORDERS to re-read, never document bodies (the output
cap is 10 000 characters, and pasting docs would spend the context the refresh restores);
`Stop` is the only blocking hook, and even it fires at most once per session. A hook never
breaks the session: on any internal error it exits 0 silently.

## Opt-in — an explicit owner step

**KAIF never edits your `settings.json`.** Wiring hooks changes how your agent system behaves
on every prompt — that is the project owner's decision, exactly like `.gitattributes` or CI
config. To enable:

1. Open `.kaif/hooks/settings-fragment.json` — it carries the ready `hooks` object.
2. Merge that object into `.claude/settings.json` (shared with the team, committed) or
   `.claude/settings.local.json` (personal), with the owner's consent recorded where your
   project records decisions.
3. Reload the session (hook configs are read at session start). Smoke: run
   `node .kaif/hooks/prompt-refresh-timer.mjs` with no `.kaif/refresh-marker.json` present —
   it must print a JSON order; stamp a fresh marker — it must print nothing.

To disable: remove the entries from your settings file. The markdown ritual keeps working
either way.

## Other agent systems

The scripts speak the Claude Code hook contract (JSON on stdin → `hookSpecificOutput` /
`decision` JSON on stdout). Systems with their own hook formats (Cursor `.cursor/hooks.json`,
Codex `.codex/hooks.json`, Copilot agent hooks) can call the same scripts but need their own
config wiring — author it from this sample against the system's live docs. Systems without
hooks (Zoo Code among them) run the markdown ritual alone: that is the designed fallback, not
a gap.
