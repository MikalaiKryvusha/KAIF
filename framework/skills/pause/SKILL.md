---
name: pause
description: End a work session (pause) — record status and next-session plans in STATUS.md, refresh README, (re)build the project, commit and push. Use when the human says "let's pause", "wrap up", "save progress", "commit and push", "end the session", "сделаем паузу", "заверши сессию", "зафиксируй статус".
---

# /pause — end the work session

The human is pausing. Run the wrap-up routine **in order**. Narrate each step briefly in the chat.
Don't skip steps. If a step fails — stop, tell the human, don't continue blindly.

## Step 1. Record status & plans in STATUS.md

Update `STATUS.md`:
- **What was done this session** — concrete, tied to bugs/features and files.
- **Current position** — what works, what's in progress, where we are.
- **Plans for next session** — a clear "where to continue" checklist (commands, files, what to verify
  first). Remember: the next agent session starts with empty context — write so it can jump straight in.
- Convert relative dates to absolute (find today's date from context / `date`).

Reconcile with the active bug docs in `bugs/` and reflect their status.

## Step 2. Refresh README

Bring `README.md` in line with reality: phase status, working features, instructions. If the README is
bilingual, keep both languages in sync. Don't invent — reflect only what is actually done and verified.

## Step 3. (Re)build / regenerate artifacts

`<Run the project build and any artifact regeneration (e.g. a rendered README.pdf). For this framework's
own project: `node tools/build-framework.mjs` regenerates FRAMEWORK.md, and `node tools/readme-pdf.mjs`
regenerates README.pdf.>` If a build fails, stop and show the errors — don't commit broken state.

## Step 4. Commit and push

`<Use your commit tool/flow. If you have one (e.g. tools/commit.mjs that bumps build, adds, commits,
pushes), run it. Otherwise: git add -A && git commit -m "..." && git push.>`

Message style (from `AGENT_GUIDE.md`): `feat:` / `fix:` / `docs:` / `refactor:` / `ci:` + one line.
End the message with:
```
Co-Authored-By: <YOUR AGENT/MODEL> <noreply@anthropic.com>
```

## Step 5. Report

Briefly report to the human: what was recorded, what was built, the commit hash, what was pushed, and
one line — the main plan for next session. That's the pause.

## Notes

- If a push is rejected (non-fast-forward) — `git pull --rebase`, retry the push, then tell the human
  about the divergence.
- Generated artifacts that are gitignored (e.g. README.pdf, build outputs) won't be committed — that's fine.
