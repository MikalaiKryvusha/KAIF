# Adapter: Windsurf (Cascade)

> Verify against current Windsurf docs — conventions evolve.

## Context file
`.windsurf/rules/` (rules directory; legacy single `.windsurfrules`). Cascade applies these as memory.
→ KAIF writes a rule pointing at `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`; also generates `AGENTS.md`.

## Commands / skills
Windsurf **Workflows**: `.windsurf/workflows/<name>.md` (invokable step-by-step procedures). Translate
each KAIF skill into a workflow (keep name+intent) — a strong fit for the loop/lifecycle skills.

## Notes / gotchas
- Workflows map cleanly to KAIF skills (both are named, step-by-step procedures).
- Keep rules concise (memory budget); link to the guidance docs.

## Deploy checklist
- [ ] `.windsurf/rules/kaif.md` → points at `AGENT_GUIDE.md`
- [ ] skills as `.windsurf/workflows/<name>.md`
- [ ] `AGENTS.md` fallback generated
- [ ] `.kaif/kaif.json` → `agent: "windsurf"`
