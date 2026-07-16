# Adapter: Grok Build (xAI)

> Verified against public docs/coverage 2026-07-16 (launched May 2026; formats evolve — re-check
> https://docs.x.ai/build/overview before relying on this).

**What it is.** xAI's coding agent CLI (up to 8 parallel sub-agents, 256K context, headless mode, ACP).
Notable for KAIF: it **auto-reads the AGENTS.md family, `CLAUDE.md`, and the whole `.claude/` layout
(skills, rules, hooks) with zero configuration** — a Claude-Code-shaped KAIF deployment largely works
in Grok Build as-is.

## Wiring

1. **Context file:** native `AGENTS.md` (KAIF's universal fallback pointing at `AGENT_GUIDE.md` is
   enough); `CLAUDE.md` is also picked up automatically.
2. **Skills:** the SKILL.md open standard — project-level `.grok/skills/<name>/SKILL.md` or global
   `~/.grok/skills/`. Translation from KAIF's canonical `.claude/skills/` is a **verbatim copy**
   (same frontmatter, same body) — mechanized by `KAIF-CORE.mjs` (1.5+); it also reads
   `.claude/skills/` directly, so the copy is belt-and-braces.
3. Record `agent` in `.kaif/kaif.json`.

## Hooks (optional enforcement)

Grok Build advertises hook support in the `.claude/`-compatible layout; treat parity with Claude Code
hooks as plausible but UNVERIFIED — test before relying on enforcement there.
