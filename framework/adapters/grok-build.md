# Adapter: Grok Build (xAI)

> Verified against public docs/coverage 2026-07-16 (launched May 2026; formats evolve — re-check
> https://docs.x.ai/build/overview before relying on this).

**What it is.** xAI's coding agent CLI (up to 8 parallel sub-agents, 256K context, headless mode, ACP).
Notable for KAIF: it **auto-reads the AGENTS.md family, `CLAUDE.md`, and the whole `.claude/` layout
(skills, rules, hooks) with zero configuration** — a Claude-Code-shaped KAIF deployment largely works
in Grok Build as-is.

## Wiring

1. **Context file:** native `AGENTS.md` (KAIF's universal fallback pointing at `AGENT_GUIDE.md` is
   enough); `CLAUDE.md` is also picked up automatically.
2. **Skills:** the SKILL.md open standard — project-level `.grok/skills/<name>/SKILL.md` or global
   `~/.grok/skills/`. Translation from KAIF's canonical `.claude/skills/` is a **verbatim copy**
   (same frontmatter, same body) — mechanized by `KAIF-CORE.mjs` (1.5+); it also reads
   `.claude/skills/` directly, so the copy is belt-and-braces.
3. Record `agent` in `.kaif/kaif.json`.

## Hooks (optional enforcement)

> ✅ Hook contract re-verified against https://docs.x.ai/build/features/hooks on **2026-08-07**.
> The earlier "plausible but UNVERIFIED" parity note is now settled — with one caveat that
> matters more than the parity itself.

**Native hooks.** Personal `~/.grok/hooks/*.json`, project `<project>/.grok/hooks/*.json`. Events
are a superset of Claude Code's: `SessionStart`, `SessionEnd`, `UserPromptSubmit`, `PreToolUse`,
`PostToolUse`, `PostToolUseFailure`, `PermissionDenied`, `Stop`, `StopFailure`, `Notification`,
`SubagentStart`, `SubagentStop`, `PreCompact`, `PostCompact`. stdin carries `hookEventName`,
`sessionId`, `cwd`, `workspaceRoot`; the process also gets `GROK_HOOK_EVENT`, `GROK_HOOK_NAME`,
`GROK_SESSION_ID`, `GROK_WORKSPACE_ROOT`. Default timeout **5 s**; timeouts, crashes and malformed
output all **fail open**.

**Parity confirmed:** the docs state that `.claude/settings.json` and `.cursor/hooks.json` are read
alongside the native files (including Cursor's camelCase event names). A Claude-Code-shaped KAIF
deployment therefore needs no Grok-specific hook config.

⚠️ **Caveat worth testing before you rely on it.** In the NATIVE contract `SessionStart`,
`UserPromptSubmit`, `PreCompact` and `Stop` are passive — "stdout is ignored"; only the blocking
`PreToolUse` reads JSON output (`decision`/`reason`). Whether Grok honours
`hookSpecificOutput.additionalContext` on the Claude-compatible path is not documented. So hooks
that only ACT (log, lint, notify) are safe here; hooks that INJECT context — like KAIF's optional
refresh-hooks module — may run and have their output dropped. If the refresh order never appears in
your session, that is the first thing to check.
