# Adapter: Cursor

> ✅ Verified against the official Cursor docs on 2026-07-03
> (https://cursor.com/docs/context/skills · https://cursor.com/docs/context/rules).

## Context file
`AGENTS.md` in the project root — confirmed native (nested ones scope to subtrees). Plus
`.cursor/rules/*.mdc` Project Rules (frontmatter: `description`, `globs`, `alwaysApply`; keep each
under 500 lines). Legacy `.cursorrules` still recognized.
→ KAIF writes `AGENTS.md` pointing at `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`; optionally a
`.cursor/rules/kaif.mdc` (`alwaysApply: true`) with the same pointer.

## Commands / skills
Cursor supports **Agent Skills / SKILL.md** (agentskills.io standard): project locations
`.cursor/skills/` and `.agents/skills/`; required frontmatter `name` (= folder name) + `description`.
**Legacy compatibility: Cursor reads `.claude/skills/` directly** — KAIF's skills work **as-is, zero
translation**. Old `.cursor/commands/*.md` are legacy, folded into skills.

**Mechanical translation from a KAIF skill:** none needed — deploy `.claude/skills/` and Cursor picks
them up. (For purism, copying to `.cursor/skills/` is equivalent.)

## Notes / gotchas
- Invocation: `/skill-name` in Agent chat, or automatic matching on `description`.
- Don't duplicate the canon between `AGENTS.md` and an always-on rule — pick one, point at the docs.

## Deploy checklist
- [ ] `AGENTS.md` → points at `AGENT_GUIDE.md`
- [ ] `.claude/skills/` deployed (read natively by Cursor)
- [ ] validate: skills visible in the `/` menu == KAIF skill count
- [ ] `.kaif/kaif.json` → `agent: "cursor"`
