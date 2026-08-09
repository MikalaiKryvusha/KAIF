# Adapter: Claude Code (reference)

The reference adapter — KAIF's native wiring.

## Context file

`CLAUDE.md` at the repo root (also `.claude/CLAUDE.md`). Claude Code auto-loads it each session.
→ KAIF writes a short `CLAUDE.md` pointing at `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`,
`BUG_FIXING_FRAMEWORK.md`, and listing the skills.

## Commands / skills

`.claude/skills/<name>/SKILL.md`, each with YAML frontmatter (`name`, `description`). The `description`
triggers the skill; the human invokes it as `/<name>`.
→ KAIF writes every skill there verbatim (command placeholders filled with the project's real commands;
prose in the chosen working language).

## Notes / gotchas

- Skill `name:` is the `/command` id — keep it canonical (English). The `description` (incl. trigger
  phrases) is localized to the working language.
- `npm run kaif:*` handles (from `tools/kaif.mjs`) work regardless of agent system.

## Hooks (optional enforcement)

KAIF's discipline lives in prose, which a model can *choose* to ignore (root of `bugs/01`, `bugs/02`). Where
the host offers hooks, KAIF can make a **few load-bearing rules mechanical** — enforcement is **optional**
and additive; with no hooks everything still works on prose.
- Claude Code enforcement surface: **hooks in `.claude/settings.json`** (`PreToolUse`, `PostToolUse`,
  `Stop`, `SessionStart`, …) run shell commands the harness executes — not the model — so a rule becomes
  non-optional.
- **KAIF SHIPS one hook module, and Claude Code is its reference host: `.kaif/hooks/` (refresh-hooks,
  since 2.2).** Three hooks by the live vendor contract — an order to re-read after compaction, a
  marker-age timer per prompt, a soft `STATUS.md` guard once per session — plus
  `settings-fragment.json` to merge into your own `.claude/settings.json`. Wiring is the owner's
  explicit opt-in: the machinery never edits someone else's settings file. Module README:
  `.kaif/hooks/README.md`.
- Other load-bearing rules are worth enforcing but **do NOT ship** — write them yourself if you want
  them: `rebuild-after-edit` (`PostToolUse` on template edits → run the build), `no-context-self-stop`
  (reinforce `bugs/02` — loops don't end on "context full"), `no-rename-on-deploy` (canonical
  filenames are law — `bugs/01`).
- Where a rule can't be hook-checked, fall back to reinforced prose in `AGENT_GUIDE.md`. A deployment
  with no hooks at all does not go red: the markdown ritual is a complete contour by itself.

## Deploy checklist

- [x] `CLAUDE.md` → points at `AGENT_GUIDE.md`
- [x] skills in `.claude/skills/<name>/SKILL.md`
- [x] `AGENTS.md` fallback (optional alongside `CLAUDE.md`)
- [ ] (optional) enforcement: merge `.kaif/hooks/settings-fragment.json` into `.claude/settings.json`
- [x] `.kaif/kaif.json` → `agent: "claude-code"`
