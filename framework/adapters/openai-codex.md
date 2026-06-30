# Adapter: OpenAI Codex

> Verify against current Codex docs — conventions evolve.

## Context file
`AGENTS.md` at the repo root (Codex reads `AGENTS.md` for project instructions; nested `AGENTS.md` scope
to subtrees).
→ KAIF writes `AGENTS.md` pointing at `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`,
`BUG_FIXING_FRAMEWORK.md`, and summarizing the workflow + skills.

## Commands / skills
No slash-skill mechanism equivalent to Claude Code. Keep KAIF skills as named docs in
`kaif-skills/<name>.md` (or a section in `AGENTS.md`) and instruct the human to invoke them by name
("run the resume skill"). The skill *content* is unchanged.

## Notes / gotchas
- `AGENTS.md` is becoming a cross-tool standard — this adapter doubles as the universal fallback.
- Keep instructions concise and high-signal; point at the guidance docs rather than duplicating them.

## Deploy checklist
- [ ] `AGENTS.md` → points at `AGENT_GUIDE.md` + workflow + skills list
- [ ] skills kept as `kaif-skills/<name>.md` (invoked by name)
- [ ] `.kaif/kaif.json` → `agent: "openai-codex"`
