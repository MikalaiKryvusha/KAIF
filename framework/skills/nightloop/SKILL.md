---
name: nightloop
description: Nighttime autonomous work loop while the human is ASLEEP and can't answer the chat. The agent takes ANY backlog task (not needing a human architectural decision), writes code, builds, tests on the harness, fixes, periodically commits and PUSHES, and self-restarts the loop. Stops ONLY when: (1) a wake time has arrived, (2) the human writes in the chat, (3) an insurmountable critical error. Invoked by the human ("run the night loop", "work overnight", "nightloop", "work until morning") and by the agent when the human goes to sleep.
---

# /nightloop — autonomous work until morning

Night. The human is ASLEEP — no interaction, no one to ask. The machine is on, the harness is available.
The agent's job: **enter a self-directed loop and grind the backlog until morning**, setting itself
not-too-hard tasks, committing/pushing, and self-restarting the loop.

This is the night variant of `/autoloop`: same execution discipline, but with **hard stop conditions on
time and on the human appearing**, and **self-restart via `ScheduleWakeup`**.

## 🛑 STOP CONDITIONS (check at the START of each iteration)

Stop the loop ONLY if one of:
1. **It is ≥ the wake time** (default 09:00 local; set it when starting the loop). ⏰ Check the time
   (`date "+%H:%M"`) PERIODICALLY — don't miss the wake hour. The human comes online in the morning.
2. **The human wrote in the chat.** Any new user message = exit, switch to them. The loop interrupts immediately.
3. **ONLY a truly critical error** that can't be worked around autonomously and makes continuing
   impossible in principle. RARE.
   ❗ **Non-critical errors are NOT a stop condition — just keep working:** failed build (fix), flaky
   connection (reconnect), software bug (file & fix or defer), hard task (take an easier one), crash
   (investigate/fix). Working situations, not reasons to stop.

Until one fires — don't stop, don't wait for confirmations, work.

## 🔁 The cycle (one iteration)

1. **Check stop conditions** (above). If stop — go to "Finishing".
2. **Pick ANY backlog task.** Sources & priority as in `/dayloop` (finish started > bugs/polish > new ideas).
   - Make technical/implementation decisions yourself.
   - ONLY brand/UX/architecture-defining decisions — file an `/interview` + mark `STATUS.md`, take another task.
   - Tasks needing human actions (real hardware, external accounts) — file homework in `plans/homework_*.md`.
3. **Do it**: code → build (`<BUILD_COMMAND>`) → deploy → test on the harness (`<TEST_HARNESS>`),
   verify objectively. High-level harness commands first; if missing, do it low-level then ADD the command.
4. **Document**: worklog in `plans/`, bug docs in `bugs/`, `STATUS.md` along the way.
5. **Commit and PUSH** (per `AGENT_GUIDE.md`): after each finished task or every ~20–30 minutes. `<COMMIT_COMMAND>`.
6. **Short chat report** (1–3 lines): so in the morning the human sees the progress.
7. **Self-restart**: call `ScheduleWakeup` with a short listen and the same `/nightloop` input, so the
   cycle continues in the next iteration if the current turn is exhausted. If there's work left in the
   turn — just continue the next iteration in the same turn.

## ⚙️ Practice

- **Don't go interactive:** no questions to the human with waiting — they're asleep. Human-level
  decisions (UX/brand/architecture) — defer with a note, don't decide alone.
- **Change safety:** small verified commits; if you break something, fix it or revert via git history.
- **⏰ Watch the time** (`date "+%H:%M"`) so you don't miss the wake hour (stop condition).
- **🔄 Periodically refresh context** — every few iterations call `/refresh-context`.
- **🧹 Occasionally revise the backlog** — every few iterations call `/check-backlog`.
- **🐞 Hit a bug** you won't fix now — file it with `/report-bug`.
- **💡 A worthwhile NEW idea** — file it with `/propose-idea` and continue with OTHER tasks. **Don't
  implement before the human approves.**

## Finishing (when a stop condition fired)

- Get the current micro-step compiling, **commit and push** (don't leave broken/uncommitted main).
- Update `STATUS.md`: what got done overnight, where you stopped, what's next, any "awaiting human review".
- If stop = wake time or the human wrote — write a short summary of the night in the chat.
- If stop = a critical error — describe it, what you tried, why you can't continue; wait.

## Notes

- This is an INTENSIVE mode: don't spare tokens/time, maximize useful autonomous work overnight.
- The global goal and vision live in `STATUS.md`/`plans/`/`AGENT_GUIDE.md`/`PHILOSOPHY.md`. Keep checking against them.
