# Adapter: GitHub Copilot

> ✅ Verified against the official docs on 2026-07-03
> (https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions ·
> https://code.visualstudio.com/docs/copilot/customization/prompt-files).

## Context file
`AGENTS.md` is supported natively (root = primary; nested = subtree-scoped; works in VS Code and the
Copilot cloud/coding agent). Also `.github/copilot-instructions.md` (repo-wide, keep ≤ "2 pages") and
path-scoped `.github/instructions/*.instructions.md` (frontmatter `applyTo:` globs).
→ KAIF writes `AGENTS.md` pointing at `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`, plus a short
`.github/copilot-instructions.md` with the same pointer.

## Commands / skills
Prompt files: `.github/prompts/<name>.prompt.md` (VS Code / Visual Studio / JetBrains; invoked as
`/name` in chat). Frontmatter (all optional): `description`, `name`, `argument-hint`, `agent`, `model`,
`tools`.

**Mechanical translation from a KAIF skill:** write `.github/prompts/<name>.prompt.md`; keep
`description:` verbatim, copy the body unchanged (`name` optional — defaults to the filename).

## Notes / gotchas
- Always-on instructions must stay short; defer detail to the linked guidance docs.
- Prompt files are IDE-side (not github.com chat) — the `AGENTS.md` + guidance docs still carry the
  discipline for the cloud agent.

## Deploy checklist
- [ ] `AGENTS.md` → points at `AGENT_GUIDE.md`
- [ ] `.github/copilot-instructions.md` → short pointer
- [ ] every KAIF skill → `.github/prompts/<name>.prompt.md`
- [ ] validate: prompt-file count == KAIF skill count
- [ ] `.kaif/kaif.json` → `agent: "github-copilot"`
