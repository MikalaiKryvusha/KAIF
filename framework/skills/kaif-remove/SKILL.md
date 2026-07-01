---
name: kaif-remove
description: Respectfully remove KAIF from the project. Default — surgical removal of the framework core/wrapper while KEEPING the content artifacts (bugs, interviews, ideas, homework). Full mode (--all) also removes the artifacts. Either way the user's own project stays whole and working. Use when the human says "remove KAIF", "uninstall the framework", "remove KAIF but keep my bug reports", "fully remove KAIF", "удали KAIF", "убери фреймворк, артефакты оставь", "выжги KAIF полностью".
---

# /kaif-remove — respectful removal of KAIF (partial or full)

Cleanly take KAIF out of a project. The guiding word is **respectful**: the user's own project remains
intact and working — we only remove what KAIF added, surgically.

## Two modes

- **Partial (default)** — remove the framework **core/wrapper** but **keep the content artifacts**:
  `bugs/`, `interviews/`, `plans/ideas/`, homework, and any other knowledge the work produced. The
  agent's accumulated knowledge survives; only the KAIF machinery leaves.
- **Full (`--all` / "полностью")** — remove the core/wrapper **and** the content artifacts. KAIF is
  burned out of the project's history as if it had never been there — leaving only the user's project.

## Procedure

1. **Confirm the mode** with the human (partial vs full) and that they want removal. This is
   destructive-ish — confirm explicitly.

2. **Identify KAIF-owned items** from `.kaif/kaif.json` and the known layout:
   - **Core/wrapper (removed in both modes):** the guidance docs (`AGENT_GUIDE.md`, `PHILOSOPHY.md`,
     `BUG_FIXING_FRAMEWORK.md`, `STATUS.md`), the deployed skills (`.claude/skills/` or the agent's
     equivalent), the `kaif/` tools, `KAIF.md`/`framework/` if present, `.kaif/`, and the KAIF
     additions to the auto-loaded context file (`CLAUDE.md`/`AGENTS.md`).
   - **Content artifacts (kept in partial, removed in full):** `bugs/`, `interviews/`, `plans/ideas/`,
     `plans/homework_*`, etc.
   - **NEVER touched:** the user's own project files and directories.

3. **Un-wire the npm handles.** Remove the `kaif:*` scripts that KAIF added to the project's
   `package.json` (the block KAIF inserted), leaving the user's own scripts untouched. (`npm run` is no
   longer cluttered with KAIF handles.)

4. **Remove** the identified items per mode. In partial mode, leave a short note (e.g. keep `bugs/` with
   its README) so the artifacts remain self-explanatory without KAIF.

5. **Verify the project still works** (its own build/tests) and **report**: what was removed, what was
   kept, and confirm the project is intact. Commit `chore: remove KAIF (partial|full) — project preserved`.

## Notes
- Default to **partial** unless the human explicitly asks for full — losing accumulated knowledge
  (bug forensics, decisions) is rarely what they want.
- Respect git history: removal is a normal commit; the user can still see KAIF in past history unless
  they choose to rewrite it (we don't rewrite history without an explicit request).
