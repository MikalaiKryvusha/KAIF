# `ideas/` — feature & improvement proposals

Detailed ideas of *what* to build — usually a narrow slice of the project, described well enough for the
agent to implement from. Most often authored by the **human**, but the agent proposes ideas too. One
`NN_<name>.md` per idea.

**For the human (owner):** this is your main authoring directory. Drop an idea here describing what you
want; the agent will tidy it into a clean structured form and implement from it. An idea is a piece of
product **vision** — the agent implements it only after you approve.

**For the AI agent:** read owner ideas, fix typos, restructure minimally for clarity, then implement. When
*you* have a worthwhile idea, file it here with status "❓ awaiting owner approval" (skill: `/propose-idea`)
and do **not** implement until approved. After implementing an idea, write the status and date back into
its file and `DONE`-tag it (`git mv NN_x.md NN_DONE_x.md`).
