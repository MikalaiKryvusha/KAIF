# Subagent brief — <TASK IN ONE LINE>

> **How to use this file.** COPY its five parts into the task you hand a subagent (or into a brief file the task names) and fill every
> `<PLACEHOLDER>`; never fill this template in place. The rule that asks for it is `AGENT_GUIDE.md` → "Task execution discipline":
> a subagent starts with an EMPTY context and knows only what the brief says — the brief is the whole of its world. Where the subagent
> hook is wired (`.kaif/hooks/subagent-preamble.mjs`), it puts the canon reading and three bounds (no subagents of its own, no commit,
> no push) in front of the task by itself; the five parts below stay the main agent's job.

## 1. Task context

<The goal in one or two sentences and why it matters now; what is already known and RULED OUT (so the subagent does not re-walk it);
the files, documents and commands worth reading first — by path, not retyped.>

## 2. Bounds

<What the subagent may and may not touch: read-only or which files it may write; no commit, no push, no outward action; no windows,
no sound, no owner-facing page; the silence rules of this machine; how long it may run. A bound the brief does not state does not
exist for the subagent.>

## 3. Role

<Who it is for this task — scout (find and report), builder (change named files), judge (refute the claim: the default verdict on
doubt is REFUTED), reviewer of a text — and what it must NOT be: a judge never fixes, a scout never decides.>

## 4. Report

<The exact shape of the answer: where it is written (a file path, or the last message), its length, its sections; every claim with the
command and its output verbatim or the line it quotes; what it could NOT check, said as such. The first line quotes one canon line that
bears on the task.>

## 5. The main agent's duty after

- Subagents alive now — before this launch: <N>; after it: <N + 1>; the project owner's budget: <the number from the project's house
  rules, or "not set">. Over the budget → wait for one to return, or do the task yourself.
- The report is a FINDING until verified (`BUG_FIXING_FRAMEWORK.md` → "A finding is not a finding until verified"): re-run what it
  claims before it moves any work, and never relay its result to the owner as a fact you observed.
