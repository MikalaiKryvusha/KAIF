# Adapter: <AGENT SYSTEM>

> Template for a KAIF adapter. Copy to `framework/adapters/<system>.md`. Verify every convention against
> the system's CURRENT official docs — these conventions change often.

## Context file (where it auto-loads project context)

`<the file/dir this system reads on each task, e.g. AGENTS.md / .cursor/rules/*.mdc / etc.>`

→ KAIF action: put `AGENT_GUIDE.md` (+ `STATUS.md`, `PHILOSOPHY.md`) here, or point this file at them.

## Commands / skills (where it discovers invokable rituals)

`<the system's mechanism: slash commands / prompt files / workflows / custom modes / none>`

→ KAIF action: translate each `framework/skills/<name>/SKILL.md` into this format, preserving name+intent.
If none: keep skills as `kaif-skills/<name>.md` and have the human invoke them by name.

## Notes / gotchas

`<auth, file-size limits, how rules are scoped (always-on vs. on-demand), anything KAIF must respect.>`

## Deploy checklist for this system

- [ ] context file written/pointed at `AGENT_GUIDE.md`
- [ ] skills translated into the system's command format (or kept as named docs)
- [ ] `AGENTS.md` fallback generated
- [ ] `.kaif/kaif.json` → `agent` set
