---
name: report-bug
description: File a bug document in bugs/ by the project's rules, when the agent hits a defect during development/testing (a crash, wrong behavior, regression, library defect). The agent keeps its OWN bug backlog — one md per noticed bug, by the canon of the existing bugs/ docs. Invoked by the agent when it finds a bug (including inside autoloops) AND by the human ("file a bug", "report this bug", "report-bug", "write this bug down", "заведи баг", "зарепорти баг").
---

# /report-bug — file a bug document in bugs/ (the agent keeps its own bug backlog)

Whenever the agent writes code, tests it, and **hits a bug** (crash, wrong behavior, artifact,
regression, library defect), it files a SEPARATE md document in `bugs/` by the same rules as the
existing bug docs. This way the agent accumulates a bug backlog for itself — nothing is lost, and any bug
can be returned to (or handed to `/bug-research`).

> Project rule (`AGENT_GUIDE.md`): "for every bug, even small ones — reflect and capture knowledge in a
> dedicated md in `bugs/`." This skill automates exactly that.

## When to call

- The agent saw a defect during dev/test that it is NOT fixing right now (or is fixing, but wants to
  capture the forensics/postmortem).
- A bug needs to be deferred (take another task) without losing it.
- The human asks to file a bug.
- NOT for a "stuck-from-misunderstanding" stall (that's `PHILOSOPHY.md`) and not instead of fixing a trivial typo.

## What to do

1. **Determine the next number.** `ls bugs/` → max two-digit `NN` + 1. Filename:
   `bugs/NN_<short_english_name>.md` (snake_case, like its neighbors; NO `DONE` tag — the bug is open).

2. **Gather facts BEFORE writing** (don't invent — a bug doc is valuable for its facts):
   - Symptom: what exactly is observed (and how it differs from expected).
   - Repro: deterministic steps. Where possible — via the harness, so the bug reproduces without the human.
   - Forensics: logs / crash file / measurements — attach the key lines (stack, abort message, error
     codes, sizes).
   - Build/version, environment, mode.

3. **Write the document by the canon** (structure like the existing bug docs):
   ```
   # Bug NN — <one-line description>

   **Status:** 🔴 OPEN   (or 🟡 partial / 🔬 research-only / 🔧 fix pending verification)
   **Version/build:** <build>   ·   **When/context:** <date, during which task it was found>

   ## Symptom
   <what is observed>

   ## Repro (deterministic)
   <steps; harness commands if available>

   ## Forensics
   <key logs / crash / measurements>

   ## Root cause / Hypotheses
   <the cause if clear; otherwise ranked hypotheses — do NOT patch blindly>

   ## Fix plan (or the fix, if done)
   <steps; relation to architecture / other bugs>

   ## Links
   <related bugs / ideas / interviews>
   ```
   Follow `BUG_FIXING_FRAMEWORK.md`. If the bug is in a third-party library, file a ticket for them (e.g.
   via `gh`) and reference it from the doc.

4. **Record in the backlog/process:**
   - If important/blocking — a short line in `STATUS.md`.
   - Commit (in autoloops, by the usual discipline): `<COMMIT_COMMAND> "docs(bugNN): …"`.

5. **Lifecycle:** while open — file WITHOUT `DONE`. When CONFIRMED closed (fixed and verified) — rename
   `git mv bugs/NN_x.md bugs/NN_DONE_x.md` and append a `## ✅ STATUS: DONE (date)` section (what was
   done / how verified). Backlog revision — the `/check-backlog` skill.

## Notes
- Better to file a bug and leave it open than to lose it. Factual accuracy beats prose.
- If a bug resists (≥3 blind fix attempts) — switch to `/bug-research` (investigation without code) on the same doc.
