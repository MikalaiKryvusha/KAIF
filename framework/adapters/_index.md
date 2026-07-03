# KAIF adapters — running KAIF on any agent system

KAIF's substance is **agent-agnostic**: the guidance docs, conventions, and the *content* of the skills
work with any capable AI coding agent. Only the **wiring** differs per system — two things:

1. **The auto-loaded context file** — where the agent reads project context on each task. KAIF points it
   at `AGENT_GUIDE.md` (+ `STATUS.md`, `PHILOSOPHY.md`).
2. **The commands/skills mechanism** — where the agent discovers invokable rituals. KAIF's skills are
   `.claude/skills/<name>/SKILL.md` for Claude Code; other systems use rules/instructions/workflows, or
   the skills are kept as named docs the human invokes by name.

At deploy time the agent determines the **target system** (inspect the repo / ask the human), records it
in `.kaif/kaif.json` → `agent`, and **translates the agent-dependent modules into that system's format**
using the matching adapter below (or `_template.md` for one not yet covered). A universal `AGENTS.md`
pointing at `AGENT_GUIDE.md` is always generated as a cross-tool fallback.

## Mapping matrix (verify against each tool's current docs)

| System | Context file convention | Commands / skills convention |
|--------|-------------------------|------------------------------|
| **Zoo Code** ⭐ (priority #1; ex-Roo Code) | `.roo/rules/` + **`AGENTS.md` (native)** | `.roo/commands/<name>.md` (slash commands) |
| **Claude Code** (reference) | `CLAUDE.md` | `.claude/skills/<name>/SKILL.md` (slash skills) |
| **OpenAI Codex** | `AGENTS.md` (native) | `.agents/skills/<name>/SKILL.md` (Agent Skills standard) |
| **GitHub Copilot** | `.github/copilot-instructions.md` + `AGENTS.md` | `.github/prompts/*.prompt.md` (prompt files) |
| **Cursor** | `.cursor/rules/*.mdc` + `AGENTS.md` | `.cursor/skills/`, `.agents/skills/` — **reads `.claude/skills/` as-is** |
| **Windsurf/Cascade** | `.devin/rules/` (legacy `.windsurf/rules/`) + `AGENTS.md` | `.windsurf/workflows/*` (manual `/name`) |
| **Cline** | `.clinerules/` + `AGENTS.md` | Skills (≥3.48): `.cline/skills/`, also reads `.claude/skills/` |
| Roo Code (archived) | = Zoo Code (byte-compatible) | = Zoo Code |
| Devin · OpenCode · Aider · Junie | `AGENTS.md` fallback | Skills standard (Devin/OpenCode) or named docs |

> Priority for first-class adapters (per the owner): **Zoo Code first**, then OpenAI Codex → GitHub
> Copilot → Cursor → Windsurf → Cline, then Devin, OpenCode, Aider, Junie. Conventions evolve fast — an
> adapter must be checked against the system's current documentation before relying on it (verified set:
> 2026-07-03, see `researches/01_agent_skill_formats.md` in the KAIF repo).

## Adapter method (how to author/apply one)

1. Read the target system's docs: how does it load project context? how does it discover commands/modes?
2. Place KAIF's `AGENT_GUIDE.md`/`STATUS.md`/`PHILOSOPHY.md` so the system reads them automatically (via
   its context-file convention, or by pointing its context file at them).
3. Translate each skill's *content* into the system's command/rule/workflow format, keeping the skill's
   name and intent. If the system has no command mechanism, keep skills as `kaif-skills/<name>.md` and
   instruct the human to invoke them by name.
4. Generate `AGENTS.md` (fallback) pointing at `AGENT_GUIDE.md`.
5. Record `agent` in `.kaif/kaif.json`.

Authored adapters in this repo: `claude-code.md` (reference), plus the priority systems. Others are
authored on demand from `_template.md`.
