# `bugs/` — defects, difficulties, breakages

One document per defect: symptom, deterministic repro, forensics, root cause / hypotheses, fix history,
status. The agent's own durable bug backlog — nothing is lost, and any bug can be picked up cold by a
future session. One `NN_<name>.md` per bug.

**For the human (owner):** you may file a bug here in plain words (what's wrong, how to reproduce); the
agent will structure it. Browse this directory to see known defects and their status.

**For the AI agent:** when you hit a defect during work/testing, file it here by the canon (skill:
`/report-bug`; method: `BUG_FIXING_FRAMEWORK.md`) — even small ones. While open, no `DONE` tag. When fixed
**and verified**, `git mv NN_x.md NN_DONE_x.md` and append a `## ✅ STATUS: DONE (date)` section. After 3
failed blind fix attempts, stop and switch to research (`/bug-research`).

**The `bugs/KAIF/` subdirectory** — defects and improvement requests about the KAIF **framework
itself**, not this project. When a failure traces to a gap in KAIF (a rule that misled, a missing
guardrail, machinery that broke), file it there by the same bug canon — **strictly in English**
(these documents address the KAIF developer). Deduplicate before filing: search `bugs/KAIF/`
first; origin-tracked deployments also search the origin issue tracker and send confirmed signals
upstream, detached ones keep everything local.
