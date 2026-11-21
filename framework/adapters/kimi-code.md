# Adapter: Kimi Code

> Verified against the official Kimi Code docs on 2026-11-21:
> https://www.kimi.com/code/docs/en/kimi-code-cli/customization/agents.html
> https://www.kimi.com/code/docs/en/kimi-code-cli/customization/skills.html
> https://www.kimi.com/code/docs/en/kimi-code-cli/customization/hooks.html
> https://www.kimi.com/code/docs/en/kimi-code-cli/customization/plugins.html

## Context file

`AGENTS.md` at the project root is native project instruction input. Kimi also supports
`.kimi-code/AGENTS.md`; KAIF needs no second copy.
→ KAIF's generated `AGENTS.md` points at `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`,
`REQUIREMENTS_FRAMEWORK.md`, `TESTING_FRAMEWORK.md`, and `BUG_FIXING_FRAMEWORK.md`.

## Commands / skills

Project skills live in `.kimi-code/skills/<name>/SKILL.md` (Kimi-specific) or
`.agents/skills/<name>/SKILL.md` (cross-tool). KAIF uses the Kimi-specific path so a multi-system
installation can carry Kimi's adapted text next to Codex's verbatim `.agents/skills/` copy without
one overwriting the other.

The mechanical transformation from each canonical `.claude/skills/<name>/SKILL.md`:

1. Keep `name` and `description` (both required by Kimi). Write description as a folded YAML block
   (`description: >-` plus an indented body): plain KAIF descriptions can contain `: `, and the
   localized `Trigger aliases (<lang>): …` tail adds another. A plain scalar would be invalid YAML.
2. Remove the legacy `trigger:` field; Kimi documents `description` and optional `whenToUse` instead.
3. Write invocations as `/skill:<name>`, not bare `/<name>`.
4. Write bundled resource references through `${KIMI_SKILL_DIR}`; copy `references/` beside `SKILL.md`.
5. Point canonical skill-path references at `.kimi-code/skills/` and context references at `AGENTS.md`.

The installer, `sync`, `check`, and `update-verify` all apply the same transformation. Edit canonical
skills in `.claude/skills/`, then run `node .kaif/kaif-core.mjs sync`; do not fork the Kimi copies.

## Notes / gotchas

- Kimi discovers both directory-form and flat-form skills; KAIF uses directory form because its
  fable/code-review/team skills carry references.
- Manual invocation is `/skill:<name>`. Automatic invocation uses `description` / `whenToUse`.
- `${KIMI_SKILL_DIR}` is the current skill directory; `$ARGUMENTS` and positional arguments are native.
- Kimi's unprefixed `/resume` is a product session-history command, not KAIF's skill. Use
  `/skill:resume` for the KAIF entry ritual.
- Project instructions and skills may require a new session or `/reload` after installation.
- **Call the owner by voice BEFORE a blocking question, or start the voice command with
  `Bash(run_in_background=true)` first.** For a structured question use `AskUserQuestion` with
  `background=true` when work can continue; it returns a task id immediately and delivers the answer
  later. Never plan to speak only after entering the question/approval wait. Official contract:
  https://www.kimi.com/code/docs/en/kimi-code-cli/reference/tools.html
- Custom agents and plugins are supported but are not required for a project-level KAIF deployment.

## Hooks (optional enforcement)

Kimi hooks live in the user-level `~/.kimi-code/config.toml` or an enabled plugin manifest, not in a
project-level settings file. KAIF therefore does not auto-write global Kimi configuration and does not
claim that its Claude-shaped `.claude/settings.json` fragment works in Kimi. The markdown rituals remain
the complete baseline; a Kimi hook/plugin wiring can be added separately after a live contract test.

## Voice before a permission wait

`kimi-permission-call.mjs` handles Kimi's `PermissionRequest`: it writes the localized phrase to the
project's voice log and starts a file-based voice tool detached, before Kimi waits for approval. It
honours the contour's quiet hours and never blocks the permission flow.

Merge `.kaif/hooks/kimi-config-fragment.toml` into the user-level `~/.kimi-code/config.toml` and start
a new session (or reload). By default the hook uses the shipped `voice-soft.mjs`. For a machine's
Silero + Glass installation, set `KAIF_VOICE_FILE_TOOL` to a JSON command prefix whose `{file}` slot
receives the UTF-8 phrase path:

```json
["<pythonw.exe>", "-I", "<say.py>", "--file", "{file}"]
```

The selected `say.py` must accept `--file` and produce/play the whole configured sound. Machine paths
stay in the environment, never in the KAIF template. Verify without sound using the hook's `--selftest`
and a `PermissionRequest` event with `--dry-run`; then check the voice engine's own output and exit code.

## Deploy checklist

- [ ] `AGENTS.md` points at `AGENT_GUIDE.md` and the current-state/canon documents
- [ ] every KAIF skill is in `.kimi-code/skills/<name>/SKILL.md` with its references
- [ ] every Kimi frontmatter parses as YAML and carries `name` + folded `description`
- [ ] invocations use `/skill:<name>` and resource links use `${KIMI_SKILL_DIR}`
- [ ] `node .kaif/kaif-core.mjs check` and `sync` are green
- [ ] `.kaif/kaif.json` → `agents` includes `"kimi-code"`
