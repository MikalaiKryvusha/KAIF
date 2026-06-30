# Adapter: Roo Code

> Verify against current Roo Code docs — conventions evolve. (The owner's list says "Zoo Code" — this is
> Roo Code, the community fork of Cline.)

## Context file
`.roo/rules/` (rules directory, applied to all modes; `.roo/rules-<mode>/` for mode-specific rules).
→ KAIF writes a rule pointing at `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`; generates `AGENTS.md`.

## Commands / skills
Roo **Custom Modes** (`.roomodes`) — define modes whose role/instructions encode KAIF skills, or keep
skills as named docs in `kaif-skills/<name>.md`. Skill content unchanged.

## Notes / gotchas
- Roo's per-mode rule dirs are useful: e.g. a "debug" mode carrying `BUG_FIXING_FRAMEWORK.md`'s discipline.

## Deploy checklist
- [ ] `.roo/rules/kaif.md` → points at `AGENT_GUIDE.md`
- [ ] skills as custom modes or `kaif-skills/<name>.md`
- [ ] `AGENTS.md` fallback generated
- [ ] `.kaif/kaif.json` → `agent: "roo-code"`
