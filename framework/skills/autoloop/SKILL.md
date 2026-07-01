---
name: autoloop
description: Run the agent in a LONG autonomous series over a pool of AUTONOMOUS tasks (tasks that need no human and no special resources). The agent picks a task from the pool, writes code, builds, tests on the harness, fixes, commits, and takes the next one. Invoked by the human ("run the autonomous loop", "work on your own", "autopilot", "autoloop", "grind the backlog", "work while I step away", "работай сам", "автопилот", "погриндь беклог") AND by the agent on its own initiative when there is an autonomous backlog, no active interactive task, and the environment is ready (the agent enters the mode and self-restarts after each task).
---

# /autoloop — long autonomous work over a task pool

The human steps away / doesn't want to intervene. The agent's job: **enter a self-directed loop and
grind the pool of AUTONOMOUS tasks** one by one, until the pool is empty or a blocker appears. Between
tasks — short chat reports so the human can glance in and see progress.

## 🔁 Self-invoke and self-restart (the agent starts itself)

The agent may and SHOULD invoke this skill **on its own initiative** (via the Skill tool), without
waiting for an explicit command, when ALL conditions hold:
- there are open tasks in the AUTONOMOUS pool (`STATUS.md` → "🤖 Autonomous backlog pool");
- there is no active interactive task/question from the human right now (they stepped away / granted autonomy);
- the environment is ready (build works; any needed devices/services are available).

Moreover, **the loop self-restarts**: having finished one task (commit + short report), the agent
proceeds to the next iteration of this same skill — **immediately invokes `/autoloop` again** and takes
the next task, without waiting for a command. So the series runs long and continuously. Stop ONLY by the
conditions in "When to STOP" below.

> ⛔ **ANTI-PATTERN (don't do this):** finish a task and "ask the human: continue or stop?" when the
> pool STILL has a task. That violates the skill. "Long session", "late", "lots of context", "risk of a
> limit", "tired" — are NOT stop conditions. If the pool has an autonomous task — invoke `/autoloop`
> yourself and continue. Stop EXCLUSIVELY by the list below. Context and limits are the harness's
> concern, not a reason to break the autonomous series.

> Don't abuse it: self-invocation is for the autonomous pool. If the human gave a specific interactive
> task — do that, don't run off into a loop. If they explicitly said "stop / enough / pause" — stop.

> 🧠 Work by `PHILOSOPHY.md` (SIMPLE, KISS, Occam) and `BUG_FIXING_FRAMEWORK.md` (3 attempts → stop →
> `/bug-research`). Comment your code. Narrate in the chat what you're doing.

## The autonomy boundary (hard limit)

Some tasks need the human (their hands, eyes, accounts, decisions on UX/brand/architecture) or special
resources the agent can't access right now. **Do NOT take those tasks — defer them, take another.** Keep
the boundary explicit in `STATUS.md`'s autonomous pool: list only tasks verifiable WITHOUT the human and
without those resources.

## Step 0. Setup (once at the start)

1. Read: `STATUS.md` (the "🤖 Autonomous backlog pool" section), `PHILOSOPHY.md`, `AGENT_GUIDE.md`,
   `BUG_FIXING_FRAMEWORK.md`, the relevant `ideas/*` and `bugs/*`.
2. Check the environment is ready (build toolchain, devices/services — see `AGENT_GUIDE.md`).
3. Assemble/refresh the working pool list from STATUS. Tell the human in one paragraph: what's in the
   pool, which task you start with, and why.

## The cycle (repeat per task)

1. **Pick** the next autonomous task from the pool (priority from STATUS). Verify it can be checked
   WITHOUT the human/special resources. If not — defer, take the next.
2. **Understand it simply** (PHILOSOPHY) — state it in 1–2 sentences. For bugs — open/create a `bugs/` doc.
3. **Implement** in a targeted way, with comments. Don't over-complicate.
4. **Build** (`<BUILD_COMMAND>`). If errors — fix them, don't commit broken state.
5. **Deploy/run** as your project requires.
6. **Verify autonomously** on the harness (`<TEST_HARNESS>`). Look at the result carefully — don't
   wishful-think; verify objectively.
7. **Fix cycle** on a bug: fix → build → test → logs (fresh by timestamp). The **3-attempts** rule →
   `/bug-research` (no code) → then fix.
8. **Capture knowledge**: for bugs — reflection in `bugs/NN_*.md`; for features — status/date in
   `ideas/*`; update `STATUS.md`.
9. **Commit** a small commit (don't lose progress): `<COMMIT_COMMAND>` (style from `AGENT_GUIDE.md`,
   with the Co-Authored-By trailer).
10. **Short chat report** (1–3 lines): what you did, what you verified, what's next. → next task.

## Self-pacing (so the loop runs LONG)

- Go task after task without stopping for confirmations (unless a task is destructive).
- If you're waiting on a background operation (a long build) — continue when ready; don't ping the human.
- If you need to "continue on a timer", use the harness's loop mechanism (`ScheduleWakeup`/`/loop`) with
  a reasonable interval, passing this same skill back so the cycle resumes.

## When to STOP the loop (and report to the human)

- The autonomous pool is exhausted (everything left needs the human/resources).
- A serious UI/UX/brand/architecture fork the agent must NOT decide alone → file an `/interview` and pause.
- Something destructive/irreversible (a release, a deletion, a force-push) — don't do it alone, ask.

At the end of the loop — a summary: what got done across the series (list of commits), what was deferred
and why, what to propose next. The commits along the way guarantee no progress is lost.

## Notes

- Do NOT publish releases, do NOT force-push, do NOT delete others' work — that's outside autonomy.
- Keep the tree clean before committing; generated artifacts are gitignored.
- Read only FRESH logs (verify by timestamp).
