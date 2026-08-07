# `plans/` — detailed step plans

Detailed plans for individual pieces of work: single steps of the master plan, specific features, ideas,
bugs, research efforts, procedures. The **`MASTER_PLAN.md`** (project root) is the high-level roadmap;
`plans/` holds the zoomed-in plans that implement its steps. One `NN_<name>.md` per plan.

**For the human (owner):** you don't have to write here — plans are usually the agent's. You may drop a
plan if you want to steer *how* something is done. Read them to see the agent's intended approach before it
executes.

**For the AI agent:** before non-trivial work, write a short plan here and follow it. Every plan
OPENS with its goal vector + acceptance criteria — written by `REQUIREMENTS_FRAMEWORK.md`; they may
change as the work teaches. Right after the H1 comes the lintable header meta — **Created:** ·
**Parent:** · **Status:** (with milestones) · **Outbound:** (`AGENT_GUIDE.md` → Document header
meta). Number files (`NN_<name>.md`). A finished, verified plan gets the `DONE` tag in its filename (`git mv NN_x.md
NN_DONE_x.md`) plus a status section. Reference material (not a closable task) is not DONE-tagged.
