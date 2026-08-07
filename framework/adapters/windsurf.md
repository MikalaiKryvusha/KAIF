# Adapter: Windsurf (Cascade)

> ✅ Verified 2026-07-03: Windsurf/Cascade docs now live under the Devin/Cognition umbrella
> (https://docs.devin.ai/desktop/cascade/memories · https://docs.devin.ai/desktop/cascade/workflows).

## Context file
`.devin/rules/*.md` (preferred) or `.windsurf/rules/*.md` (legacy fallback); legacy single
`.windsurfrules` still read. `AGENTS.md` at the root is supported as an always-on rule (nested = scoped).
Workspace rules are limited to **12,000 characters per file** — keep them pointers, not copies.
Frontmatter `trigger:` = `always_on` | `model_decision` | `glob` | `manual` (+ `globs:`, `description`).
→ KAIF writes `AGENTS.md` pointing at `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md` (or a
`.devin/rules/kaif.md` with `trigger: always_on`).

## Commands / skills
Windsurf **Workflows**: `.windsurf/workflows/<name>.md`, invoked as `/name` in Cascade — **manual-only**
(never auto-invoked), limited to 12,000 characters each; workflows can call other workflows.

**Mechanical translation from a KAIF skill:** write `.windsurf/workflows/<name>.md`; drop the YAML
frontmatter (keep a first-line title + the body); trim if a skill exceeds the 12k-char cap (link to the
deployed guidance docs instead of inlining).

## Notes / gotchas
- Workflows map cleanly to KAIF skills (both are named, step-by-step procedures).
- The 12k char caps are hard — always point at the guidance docs rather than duplicating them.

## Deploy checklist
- [ ] `AGENTS.md` → points at `AGENT_GUIDE.md`
- [ ] every KAIF skill → `.windsurf/workflows/<name>.md` (≤12k chars)
- [ ] validate: workflow count == KAIF skill count
- [ ] `.kaif/kaif.json` → `agent: "windsurf"`

## Hooks (optional enforcement)

> ✅ Hook contract verified against https://docs.devin.ai/desktop/cascade/hooks on **2026-08-07**
> (the `docs.windsurf.com` path now redirects there — the product sits under the Devin umbrella).

Config `hooks.json` at three merged levels: system (`/etc/windsurf/hooks.json`,
`/Library/Application Support/Windsurf/hooks.json`, `C:\ProgramData\Windsurf\hooks.json`), user
(`~/.codeium/windsurf/hooks.json`; JetBrains: `~/.codeium/hooks.json`) and workspace
(`.windsurf/hooks.json`). Entries carry `command`, optional `powershell` (the only surveyed system
with a first-class Windows override), `show_output`, `working_directory`. Execution order is
system → user → workspace.

Events (snake_case): `pre_read_code`, `pre_write_code`, `pre_run_command`, `pre_mcp_tool_use`,
`pre_user_prompt`, `post_read_code`, `post_write_code`, `post_run_command`, `post_mcp_tool_use`,
`post_cascade_response`, `post_cascade_response_with_transcript`, `post_setup_worktree`. stdin
carries `agent_action_name`, `trajectory_id`, `execution_id`, `timestamp`, `model_name`,
`tool_info`.

⚠️ **No session-start and no compaction event, and hooks cannot inject context at all** — they
communicate only through exit codes (0 proceeds, 2 blocks a pre-hook). Cascade hooks are therefore
good for guardrails, logging and validation, and cannot carry context-refresh style enforcement.
For that class of rule, Windsurf runs the markdown ritual — which is complete on its own.
