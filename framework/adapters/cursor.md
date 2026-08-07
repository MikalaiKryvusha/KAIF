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

## Hooks (optional enforcement)

> ✅ Hook contract verified against https://cursor.com/docs/hooks on **2026-08-07**.

`hooks.json` at project (`<root>/.cursor/hooks.json`), user (`~/.cursor/hooks.json`), enterprise and
team levels; schema `{"version": 1, "hooks": {"<event>": [{command, type, timeout, loop_limit,
failClosed, matcher}]}}`. Events include `sessionStart`, `sessionEnd`, `beforeSubmitPrompt`,
`preCompact`, `stop`, `preToolUse`/`postToolUse`, `beforeShellExecution`, `afterFileEdit`,
`workspaceOpen`. Exit 0 = success (JSON read), exit 2 = block, anything else fails **open** unless
the entry sets `"failClosed": true`.

**What can inject context into the agent — and what cannot.** `sessionStart` returns
`{"env": {...}, "additional_context": "..."}` and is the one place an agent-facing injection lands.
`beforeSubmitPrompt` returns only `{"continue", "user_message"}` — it blocks a prompt or messages
the HUMAN. `preCompact` is observational ("cannot block or modify compaction"). `stop` returns
`followup_message`, which Cursor AUTO-SUBMITS as the next prompt. Plan enforcement around that
shape rather than assuming the Claude Code contract.

**Handy:** hooks get `CLAUDE_PROJECT_DIR` as an explicit compatibility alias next to
`CURSOR_PROJECT_DIR`, so `${CLAUDE_PROJECT_DIR}`-style paths carry over unchanged.
