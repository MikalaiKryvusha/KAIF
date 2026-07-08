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

## Hooks (optional enforcement)

KAIF's discipline lives in prose, which a model can *choose* to ignore (root of `bugs/01`, `bugs/02`). Where
the host offers hooks, KAIF can make a **few load-bearing rules mechanical** — enforcement is **optional**
and additive; with no hooks everything still works on prose.
- Zoo Code (ex-Roo Code) enforcement surfaces: **command validation / allow-&-deny lists** for terminal
  commands, and **auto-approve** gates in settings — use them to block unsafe shell actions and to require
  a rebuild/status step, rather than trusting the model to remember.
- Load-bearing rules worth enforcing (keep the list short): `rebuild-after-edit` (re-generate the core after
  editing a template), `no-context-self-stop` (don't end an autonomous loop on "context full" — `bugs/02`),
  `status-before-pause` (update `STATUS.md` before finishing), `no-rename-on-deploy` (canonical filenames
  are law — `bugs/01`).
- Where a rule can't be hook-enforced on this host, fall back to reinforced prose in `.roo/rules/kaif.md`.

## Deploy checklist
- [ ] `AGENTS.md` → points at `AGENT_GUIDE.md` (native pickup)
- [ ] `.roo/rules/kaif.md` → names the key docs
- [ ] every KAIF skill → `.roo/commands/<name>.md` (frontmatter: `description` only)
- [ ] validate: command count on disk == KAIF skill count (no silent skips)
- [ ] (optional) enforcement: allow/deny lists + auto-approve gates for the load-bearing rules above
- [ ] `.kaif/kaif.json` → `agent: "zoo-code"`
