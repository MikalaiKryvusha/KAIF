# Adapter: Zoo Code ⭐ priority #1

> ✅ Verified against the official Zoo Code docs on 2026-07-03
> (https://docs.zoocode.dev/features/slash-commands · https://docs.zoocode.dev/features/custom-instructions).
> **Zoo Code** (https://zoocode.dev · github.com/Zoo-Code-Org/Zoo-Code) is the community successor of the
> archived Roo Code (fork chain: Cline → Roo Code → Zoo Code, April 2026). It keeps Roo Code's paths and
> settings verbatim (`.roo/`, `roo-cline.*`), so this adapter covers Roo Code installs too.
> This is the **owner's priority target system** — deployment into it must be exact.

## Context file
- `AGENTS.md` in the workspace root is supported **natively** and enabled by default (`AGENT.md`
  fallback; disable via `roo-cline.useAgentRules: false`) — KAIF's universal fallback is first-class here.
- Rules directories (read recursively, alphabetically): `.roo/rules/` (all modes),
  `.roo/rules-{modeSlug}/` (mode-specific). File-based fallbacks: `.roorules`, `.roorules-{modeSlug}`.
- Load order: global mode rules (`~/.roo/rules-{modeSlug}/`) → workspace mode rules → `AGENTS.md` →
  global general rules → workspace `.roo/rules/`.
→ KAIF writes `AGENTS.md` pointing at `AGENT_GUIDE.md`, plus `.roo/rules/kaif.md` naming the key docs
(`AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`, `BUG_FIXING_FRAMEWORK.md`).

## Commands / skills
Custom slash commands: one markdown file per command in `.roo/commands/` (project; global
`~/.roo/commands/`). **The filename is the command name** (`resume.md` → `/resume`; lowercased,
spaces→dashes). YAML frontmatter fields (all optional): `description` (shown in the command menu),
`argument-hint`, `mode` (mode slug to switch to). `.md` only. Project commands override global ones;
built-in commands cannot be overridden.

**Mechanical translation from a KAIF skill** (`.claude/skills/<name>/SKILL.md`):
1. Write `.roo/commands/<name>.md`.
2. Drop the `name:` frontmatter field (the filename carries it); keep `description:` verbatim.
3. Copy the skill body unchanged.

## Notes / gotchas
- Do NOT use Custom Modes (`.roomodes`) for skills — slash commands are the correct home; modes are for
  personas, not rituals.
- The built-in `/init` generates mode-specific `AGENTS.md` files under `.roo/rules-*` — don't fight it.
- Frequent host for **local LLMs** (Ollama/LM Studio backends): small default context windows silently
  truncate — always deploy via the mechanical unpacker + staged flow, never a one-shot unpack.

## Deploy checklist
- [ ] `AGENTS.md` → points at `AGENT_GUIDE.md` (native pickup)
- [ ] `.roo/rules/kaif.md` → names the key docs
- [ ] every KAIF skill → `.roo/commands/<name>.md` (frontmatter: `description` only)
- [ ] validate: command count on disk == KAIF skill count (no silent skips)
- [ ] `.kaif/kaif.json` → `agent: "zoo-code"`
