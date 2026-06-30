# Adapter: Cline

> Verify against current Cline docs — conventions evolve.

## Context file
`.clinerules/` (rules directory; a single `.clinerules` file also works). Cline also supports `AGENTS.md`.
→ KAIF writes a rule pointing at `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`; generates `AGENTS.md`.

## Commands / skills
Cline **Workflows** (invokable procedures) where available — translate each KAIF skill into one. Otherwise
keep skills as named docs in `kaif-skills/<name>.md` invoked by name. Skill content unchanged.

## Notes / gotchas
- Toggle rules per task where supported (always-on canon vs. situational skills).

## Deploy checklist
- [ ] `.clinerules/kaif.md` → points at `AGENT_GUIDE.md`
- [ ] skills as Cline Workflows or `kaif-skills/<name>.md`
- [ ] `AGENTS.md` fallback generated
- [ ] `.kaif/kaif.json` → `agent: "cline"`
