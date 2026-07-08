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
- Load-bearing rules worth enforcing (keep the list short): `rebuild-after-edit` (`PostToolUse` on template
  edits → run the build), `status-before-pause` (`Stop`/pre-pause check that `STATUS.md` is fresh),
  `no-context-self-stop` (reinforce `bugs/02` — loops don't end on "context full"), `no-rename-on-deploy`
  (canonical filenames are law — `bugs/01`).
- Ship reference hooks under `.claude/` only where they add real safety; where a rule can't be hook-checked,
  fall back to reinforced prose in `AGENT_GUIDE.md`.

## Deploy checklist

- [x] `CLAUDE.md` → points at `AGENT_GUIDE.md`
- [x] skills in `.claude/skills/<name>/SKILL.md`
- [x] `AGENTS.md` fallback (optional alongside `CLAUDE.md`)
- [ ] (optional) enforcement: `.claude/settings.json` hooks for the load-bearing rules above
- [x] `.kaif/kaif.json` → `agent: "claude-code"`
