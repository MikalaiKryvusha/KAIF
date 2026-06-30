# Adapter: GitHub Copilot

> Verify against current Copilot docs — conventions evolve.

## Context file
`.github/copilot-instructions.md` (repo-wide custom instructions, auto-applied in VS Code / GitHub).
→ KAIF writes it pointing at `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`, and summarizing the workflow.

## Commands / skills
Prompt files: `.github/prompts/<name>.prompt.md` (reusable task prompts) where supported. Translate each
KAIF skill into a prompt file (keep name+intent); otherwise keep skills as named docs invoked in chat.

## Notes / gotchas
- Custom instructions are always-on context — keep them short; defer detail to the linked guidance docs.
- Prompt-file availability varies by Copilot surface; fall back to named docs where unsupported.

## Deploy checklist
- [ ] `.github/copilot-instructions.md` → points at `AGENT_GUIDE.md`
- [ ] skills as `.github/prompts/<name>.prompt.md` (or named docs)
- [ ] `AGENTS.md` fallback generated
- [ ] `.kaif/kaif.json` → `agent: "github-copilot"`
