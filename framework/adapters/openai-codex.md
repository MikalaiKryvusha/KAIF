# Adapter: OpenAI Codex

> ✅ Verified against the official Codex docs on 2026-07-03
> (https://developers.openai.com/codex/skills · https://developers.openai.com/codex/guides/agents-md).

## Context file
`AGENTS.md` — native and primary: global `~/.codex/AGENTS.md`, then a walk from the git repo root down
to cwd (all found files concatenate; closer = higher priority; combined cap 32 KiB by default).
→ KAIF writes `AGENTS.md` pointing at `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`,
`BUG_FIXING_FRAMEWORK.md`, and summarizing the workflow + skills.

## Commands / skills
Codex has **native skills** following the Agent Skills open standard (agentskills.io): a directory per
skill with `SKILL.md` (frontmatter `name` + `description` — both **required**) under **`.agents/skills/`**
(project) or `~/.agents/skills/` (user). Legacy `~/.codex/prompts/*.md` custom prompts are deprecated.

**Mechanical translation from a KAIF skill:** copy `.claude/skills/<name>/` → `.agents/skills/<name>/`
unchanged (KAIF skills already carry `name` + `description`).

## Notes / gotchas
- Invocation: `/skills` picker, `$skill-name` inline, or implicit matching on `description`.
- Keep `AGENTS.md` concise — the 32 KiB combined cap is real; point at the guidance docs, don't inline them.

## Deploy checklist
- [ ] `AGENTS.md` → points at `AGENT_GUIDE.md` + workflow + skills list
- [ ] every KAIF skill → `.agents/skills/<name>/SKILL.md` (copied as-is)
- [ ] validate: skill count on disk == KAIF skill count
- [ ] `.kaif/kaif.json` → `agent: "openai-codex"`

## Hooks (optional enforcement)

> ✅ Hook contract verified against the official Codex hooks doc on **2026-08-07**.

**The closest analog to Claude Code of any surveyed system.** `<repo>/.codex/hooks.json` or
`~/.codex/hooks.json` (inline `[hooks]` tables in `config.toml` also work); the nesting is
identical to Claude Code's — event → matcher group → `"hooks"` handlers. Events: `SessionStart`,
`SessionEnd`, `SubagentStart`, `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PreCompact`,
`PostCompact`, `UserPromptSubmit`, `SubagentStop`, `Stop`. `SessionStart` matches on `source` with
values `startup`, `resume`, `clear`, `compact`.

stdin uses the same snake_case fields (`session_id`, `transcript_path`, `cwd`, `hook_event_name`,
`model`, `permission_mode`). Context injection uses the **same field names**:
`{"hookSpecificOutput": {"additionalContext": "..."}}` — plain stdout also counts as developer
context. Handler fields: `type`, `command` (one string, no `args` array), `timeout` (default 600 s),
`statusMessage`, `additionalContextLimit` (default 2500 tokens), `commandWindows`.

→ Claude-Code-shaped hook scripts run here **unchanged**; only the config file differs. Not
verified: the output shape of `Stop` (the docs describe blocking via exit 2 + stderr).
