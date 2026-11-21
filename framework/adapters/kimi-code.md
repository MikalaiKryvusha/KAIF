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
project-level settings file, and a hook command runs from the session folder. Wire them with
`node .kaif/kaif-core.mjs wire-hooks --kimi` (the install and update tasks name it when Kimi Code is set up for the
user): one dispatcher, `<Kimi home>/kaif/kimi-hook.mjs`, runs each KAIF project's own hook scripts — from any subfolder,
silent in folders without KAIF — so one wiring serves every KAIF project of the machine. The run backs the config up,
validates the result with `kimi doctor config` and rewrites only the lines between its two marker lines. Then `/reload` or
start a new session. The fragment `.kaif/hooks/kimi-config-fragment.toml` is the table it wires, with these adaptations:

- **Matchers are unanchored regular expressions.** An invalid one — `"*"`, Claude Code's spelling of «every
  tool» — matches NOTHING, silently, and `kimi doctor config` stays green. An entry for every tool carries no
  matcher; a named tool is anchored (`^Agent$`, `^(Write|Edit)$`). One entry with a key other than `event` ·
  `matcher` · `command` · `timeout` drops the whole hooks section.
- Only `UserPromptSubmit` text reaches the model; a `PreToolUse` or `Stop` block carries its reason into the
  context; every other event is observation-only. `SessionStart` and `PostCompact` leave a pending refresh
  mark for the next prompt.
- `Stop` blocks through exit 2 + stderr; this covers STATUS, test debt and context-window closure levels.
  Kimi runs `Stop` asynchronously after the turn ends; in a session that stays alive (the TUI, an editor over
  ACP, `kimi web`) the block opens a continuation turn. **`kimi -p` usually drops it:** print mode follows further
  turns only while a turn, a goal, a cron fire or a background task is pending, otherwise it exits and cancels the
  loop before the Stop hook returns. And Kimi skips `Stop` for a turn that ends with a queued request (an owner's
  message waiting in the queue). Kimi Code 2.7.2 source; run work that relies on the Stop gates in a live session.
- **The window steps count against Kimi's own compaction point**, not the whole window: Kimi compacts the context
  by itself once used ≥ `compaction_trigger_ratio` (default 0.85) of the window or used + `reserved_context_size`
  (default 50 000) ≥ the window, both under `[loop_control]` of its config. The KAIF steps (75 · 80 · 85 · 92 %
  by default) are taken of that point, so the cut and the soft closure come before the compaction; Kimi's trigger
  is never changed. A step found on an observation-only event waits and goes out on the next prompt or as a
  one-time block of the next tool call (the agent repeats that call).
- Kimi usage is `inputOther + inputCacheRead + inputCacheCreation`; the model's `max_context_size` comes
  from Kimi's config, with `.kaif/kaif.json` → `contextWindow.tokens` as the explicit override.
- **The owner's word during a turn:** Kimi queues a message typed while the agent works until the turn ends.
  KAIF answers the owner at once, so set `follow_up_behavior = "steer"` in the user-level
  `~/.kimi-code/tui.toml` (validate with `kimi doctor tui`) — the message then joins the running turn.
- **Never Ask mode** runs tool calls without asking; it does not hand vision-level decisions to the agent — those
  go to `interviews/` through the KAIF contour (the line rides in `AGENTS.md`).
- Kimi documents no `updatedInput`. A placeholder write is refused with the clock fix; an Agent launch
  without the KAIF preamble is returned to the main agent with the full prompt to retry.
- `PostToolUse` knowledge findings queue to the next `UserPromptSubmit`; the farewell hook reads Kimi's
  `agents/main/wire.jsonl` and writes the same project handoff file.

The markdown rituals remain the complete baseline. Do not copy `.claude/settings.json` into Kimi.

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

The selected `say.py` must accept `--file` and produce/play the whole configured sound. Set the prefix
through the environment or the deployment's `.kaif/kaif.json` → `contour.voiceFileTool` array; never in
the KAIF template. Verify without sound using the hook's `--selftest`
and a `PermissionRequest` event with `--dry-run`; then check the voice engine's own output and exit code.

## Deploy checklist

- [ ] `AGENTS.md` points at `AGENT_GUIDE.md` and the current-state/canon documents
- [ ] every KAIF skill is in `.kimi-code/skills/<name>/SKILL.md` with its references
- [ ] every Kimi frontmatter parses as YAML and carries `name` + folded `description`
- [ ] invocations use `/skill:<name>` and resource links use `${KIMI_SKILL_DIR}`
- [ ] `node .kaif/kaif-core.mjs check` and `sync` are green
- [ ] `.kaif/kaif.json` → `agents` includes `"kimi-code"`
