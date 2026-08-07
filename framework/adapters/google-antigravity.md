# Adapter: Google Antigravity CLI

> ✅ Verified against https://antigravity.google/docs/hooks and Google's transition announcement on
> **2026-08-07**. Newer than the rest of this catalog and moving fast — re-check
> https://antigravity.google/docs before relying on the skills half.

> ⚠️ **Gemini CLI is gone.** Google announced the transition from Gemini CLI to Antigravity CLI;
> Gemini CLI and the Gemini Code Assist IDE extensions **stopped serving requests on 2026-06-18**.
> A project still wired to Gemini CLI has no working agent — this adapter is where it moves to.
> Antigravity CLI has been generally available since May 2026 and keeps Gemini CLI's Agent Skills,
> Hooks, Subagents and Extensions (the last now as Antigravity plugins).

**What it is.** Google's terminal coding agent, Go-based, multi-agent, with a plugin SDK
(Python/Go) that bundles tools, subagent logic, safety policies and lifecycle hooks into
self-contained modules. **Jules is a different product** — a GitHub-integrated cloud agent that
spins up its own VM — and is not covered by this adapter.

## Context file

`AGENTS.md` in the project root — KAIF's universal fallback pointing at `AGENT_GUIDE.md`,
`STATUS.md` and `PHILOSOPHY.md` is the safe wiring. Antigravity keeps a customization directory
at `.agents/` in the workspace (personal: `~/.gemini/config/`).

> ⚠️ Note the collision with the Agent Skills standard, which also uses `.agents/skills/`
> (OpenAI Codex deploys there). The paths do not conflict — different subtrees — but do not assume
> one system's `.agents/` layout describes the other's.

## Commands / skills

Agent Skills are documented as preserved from Gemini CLI, and extensions became Antigravity
plugins. **Not verified as of 2026-08-07:** the exact on-disk skill path and frontmatter. Until it
is read from the vendor doc, deploy KAIF's skills in the canonical `.claude/skills/` layout, point
`AGENTS.md` at the canon, and invoke rituals by name — do not machine-translate into a guessed
path.

## Hooks (optional enforcement) — verified

Config `hooks.json` in `.agents/` (workspace) or `~/.gemini/config/` (personal). Structure maps a
hook NAME to its event arrays: `{"<hook-name>": {"PreInvocation": [{"type": "command", "command":
"...", "timeout": 10}]}}`, with optional `enabled` (default true).

Events: `PreToolUse`, `PostToolUse`, `PreInvocation`, `PostInvocation`, `Stop`. stdin carries
`conversationId`, `workspacePaths`, `transcriptPath`, `artifactDirectoryPath`, `modelName`, plus
`stepIdx` (tool events) or `invocationNum` (invocation events). Default timeout 30 s.

Output by event: `PreToolUse` → `decision` (`allow`/`deny`/`ask`/`force_ask`/
`deny_unless_prior_grant`), `reason`, `permissionOverrides`. `PreInvocation`/`PostInvocation` →
`injectSteps` (an array of OBJECTS, each carrying one of `toolCall`, `userMessage`,
`ephemeralMessage`) and `terminationBehavior` (`force_continue`/`terminate`). `Stop` → `decision`,
`reason`.

⚠️ **No session-start and no context-compaction event exists** (the docs say per-session events
are expected later). Enforcement that must fire "after the context was lost" cannot be wired here;
`PreInvocation` is the substitute worth knowing about — it fires before **every model call**, so
per-turn rules land there and also cover turns a human never typed.

→ KAIF's optional refresh-hooks module ships a ready sample: `.kaif/hooks/sample-antigravity-hooks.json`
(the hourly timer via `PreInvocation` → `injectSteps`). The STATUS guard is deliberately not in it:
`Stop` uses the same `decision`/`reason` field names as the reference, but the accepted blocking
value is undocumented, and matching field names are not a matching contract.

## Deploy checklist

- [ ] `AGENTS.md` → points at `AGENT_GUIDE.md`
- [ ] skills kept in canonical `.claude/skills/` (no guessed translation until the path is verified)
- [ ] optional: `.agents/hooks.json` from `.kaif/hooks/sample-antigravity-hooks.json` — owner opt-in
- [ ] `.kaif/kaif.json` → `agent: "google-antigravity"`
- [ ] if migrating from Gemini CLI: confirm nothing still points at the retired CLI
