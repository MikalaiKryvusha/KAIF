# Adapter: Cline

> ✅ Verified against the official Cline docs on 2026-07-03
> (https://docs.cline.bot/customization/skills · https://docs.cline.bot/features/cline-rules).
> Cline is the root of the fork chain Cline → Roo Code → Zoo Code.

## Context file
`.clinerules/` directory at the project root (all `.md`/`.txt` inside are combined; single `.clinerules`
file is legacy). `AGENTS.md` is auto-detected and toggleable in the Rules panel. Optional frontmatter
`paths:` (globs) scopes a rule to matching work.
→ KAIF writes `.clinerules/kaif.md` pointing at `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`;
generates `AGENTS.md`.

## Commands / skills
Cline has **Skills** (≥ 3.48) per the Agent Skills standard: `SKILL.md` (required frontmatter: `name` =
directory name, kebab-case; `description` ≤ 1024 chars) in `.cline/skills/`, `.clinerules/skills/` — and
**`.claude/skills/` is read directly** (Claude-compatible). Invoked as `/skill-name` or automatically.
(Legacy Workflows still exist but Skills are the current mechanism.)

**Mechanical translation from a KAIF skill:** none needed — deploy `.claude/skills/` as-is.

## Notes / gotchas
- Global skills (`~/.cline/skills/`) override same-named project skills — avoid name clashes.
- Keep SKILL.md under ~5k tokens (progressive loading).

## Deploy checklist
- [ ] `.clinerules/kaif.md` → points at `AGENT_GUIDE.md`
- [ ] `AGENTS.md` generated (auto-detected)
- [ ] `.claude/skills/` deployed (read natively by Cline)
- [ ] validate: skills visible == KAIF skill count
- [ ] `.kaif/kaif.json` → `agent: "cline"`
