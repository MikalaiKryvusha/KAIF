# `reports/` — the agent's reports on cognitively heavy work

When the agent has done cognitively dense work — analysis, synthesis, reconnaissance, an audit, a
field run — the distilled write-up lands here: for the agent's own future sessions, for other
agents working on the project, and for informing the owner about milestones. One `NN_<name>.md`
per report; evidence-first (numbers reproduced by commands, verbatim logs), terse.

**Subdirectories** (each is created together with its first report — empty directories don't live
in git):

- **`KAIF_UPDATES/`** — field reports on KAIF lifecycle runs. Every framework **update** and the
  initial **install** MUST finish with a short report here — terse, bullet-style, **strictly in
  English** (they address the KAIF developer, whatever the project's working language).
  Origin-tracked deployments also send them upstream; detached ones keep them local only.
- **`KAIF_AUDIT/`** — comprehensive audit reports by strong models (agentic codebase review),
  grouped one document per finding class/family, with rich accompanying meta (links, dates,
  document names) so that weaker models can later execute the fixes.

**For the human (owner):** browse here for milestone write-ups and field evidence; reports are
records, not opinions — every claim carries a command or a quote behind it.

**For the AI agent:** write a report after any cognitively heavy work whose conclusions should
outlive the session. KAIF lifecycle reports (update/install) are mandatory and strictly English.
Reports are records — never `DONE`-tagged, never rewritten (append corrections instead).
