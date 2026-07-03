# Adapter: Windsurf (Cascade)

> ✅ Verified 2026-07-03: Windsurf/Cascade docs now live under the Devin/Cognition umbrella
> (https://docs.devin.ai/desktop/cascade/memories · https://docs.devin.ai/desktop/cascade/workflows).

## Context file
`.devin/rules/*.md` (preferred) or `.windsurf/rules/*.md` (legacy fallback); legacy single
`.windsurfrules` still read. `AGENTS.md` at the root is supported as an always-on rule (nested = scoped).
Workspace rules are limited to **12,000 characters per file** — keep them pointers, not copies.
Frontmatter `trigger:` = `always_on` | `model_decision` | `glob` | `manual` (+ `globs:`, `description`).
→ KAIF writes `AGENTS.md` pointing at `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md` (or a
`.devin/rules/kaif.md` with `trigger: always_on`).

## Commands / skills
Windsurf **Workflows**: `.windsurf/workflows/<name>.md`, invoked as `/name` in Cascade — **manual-only**
(never auto-invoked), limited to 12,000 characters each; workflows can call other workflows.

**Mechanical translation from a KAIF skill:** write `.windsurf/workflows/<name>.md`; drop the YAML
frontmatter (keep a first-line title + the body); trim if a skill exceeds the 12k-char cap (link to the
deployed guidance docs instead of inlining).

## Notes / gotchas
- Workflows map cleanly to KAIF skills (both are named, step-by-step procedures).
- The 12k char caps are hard — always point at the guidance docs rather than duplicating them.

## Deploy checklist
- [ ] `AGENTS.md` → points at `AGENT_GUIDE.md`
- [ ] every KAIF skill → `.windsurf/workflows/<name>.md` (≤12k chars)
- [ ] validate: workflow count == KAIF skill count
- [ ] `.kaif/kaif.json` → `agent: "windsurf"`
