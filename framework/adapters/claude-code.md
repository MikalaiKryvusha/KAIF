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

## Deploy checklist

- [x] `CLAUDE.md` → points at `AGENT_GUIDE.md`
- [x] skills in `.claude/skills/<name>/SKILL.md`
- [x] `AGENTS.md` fallback (optional alongside `CLAUDE.md`)
- [x] `.kaif/kaif.json` → `agent: "claude-code"`
