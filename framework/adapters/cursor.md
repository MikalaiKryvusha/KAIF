# Adapter: Cursor

> Verify against current Cursor docs — conventions evolve.

## Context file
`.cursor/rules/*.mdc` (Project Rules; each rule has frontmatter for always-on vs. on-demand scope).
Cursor also reads `AGENTS.md`. (Legacy: `.cursorrules`.)
→ KAIF writes a `.cursor/rules/kaif.mdc` (always-on) pointing at `AGENT_GUIDE.md`, `STATUS.md`,
`PHILOSOPHY.md`; also generates `AGENTS.md`.

## Commands / skills
No exact slash-skill analog. Options: encode key skills as additional scoped rules, or keep them as named
docs in `kaif-skills/<name>.md` invoked by name. Keep skill content intact.

## Notes / gotchas
- Use rule scoping: KAIF's "read before every task" canon = an always-applied rule; situational skills =
  on-demand rules or named docs.

## Deploy checklist
- [ ] `.cursor/rules/kaif.mdc` (always-on) → points at `AGENT_GUIDE.md`
- [ ] skills as scoped rules or `kaif-skills/<name>.md`
- [ ] `AGENTS.md` fallback generated
- [ ] `.kaif/kaif.json` → `agent: "cursor"`
