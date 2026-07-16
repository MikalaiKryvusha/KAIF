# <PROJECT_NAME> — AI Agent Guide

This file is read by the AI agent before every task. It is the **canon** of the project: the rules,
the map, the commands, the conventions. Keep it accurate — a fresh agent session with empty context
relies entirely on this document to get to work.

> 🧠 **PRIME PRINCIPLE — SIMPLICITY (read `PHILOSOPHY.md`).** If something is taking a long time, it is
> NOT a hard task and NOT a library bug — the agent is DOING IT TOO COMPLEX because it did NOT UNDERSTAND
> THE TASK. Everything should be simple (KISS + Occam). Stuck → re-understand the task, find the
> built-in simple path, do NOT escalate complexity. A stall = "simplify your understanding," not "dig harder."

> 🤖 **AUTONOMOUS MODE.** When the human has stepped away / granted autonomy and there is no active
> interactive task, and `STATUS.md` has an open autonomous backlog — the agent SHOULD, on its own
> initiative, enter the appropriate loop skill (`/autoloop`, `/dayloop`, or `/nightloop`) and grind the
> backlog, committing progress and self-restarting after each task. Stop only on the skill's stop
> conditions. Do not enter a loop if the human just gave a specific interactive task.

---

## Before every task — checklist

```
1. Read STATUS.md                 # current state: what's done, where we are, what's next
2. Recall experience              # grep EXPERIENCE.md by the task's tags — don't repeat known dead ends (skill: /experience)
3. git status                     # what changed, what's uncommitted
4. git log --oneline -5           # where we are in history
5. Read MEMORY.md (if present)    # user profile, key decisions
6. Load ONLY the relevant slice   # use the Context router below — read the required minimum + task-type docs, not everything
7. Execute by the fable loop      # /fable-method: gates + forced artifacts (INTENT/AUTH/TWINS/PENDING); /fable-loop to orchestrate; /fable-judge before claiming done
8. Read the relevant plan         # plans/<feature>.md, if the task touches a specific feature
9. Check the map & blast radius   # before editing code: PROJECT_ARCHITECTURE_INTERNAL_MAP.md — who is affected; update the map if relations change
10. Run the build (if touching code)   # <BUILD_COMMAND>
11. Use the test harness          # <TEST_HARNESS> — drive/observe the software without a human
12. Comment the code              # comment blocks, classes, modules, important lines
13. Reflect on bugs in bugs/      # one md per bug; follow BUG_FIXING_FRAMEWORK.md
14. Capture experience            # after a meaningful success/failure, append a lesson to EXPERIENCE.md (skill: /experience)
15. Periodically re-read the key guidance docs:
    - PHILOSOPHY.md   ← the simplicity principle; if stuck, go here first
    - AGENT_GUIDE.md
    - STATUS.md
    - BUG_FIXING_FRAMEWORK.md
    Edit them when it would make future autonomous work more effective. The agent operates across
    sessions that lose context — these docs must let a fresh session get productive from empty context.
16. Narrate in the chat, at least a little, in natural language — what you're doing right now — so the
    human can glance over and follow along.
17. Documents from the human (ideas, bugs, features): read them, fix typos, minimally restructure into a
    clean structured format for AI consumption. After implementing from such a document, write the
    status and the implementation date back into it.
```

→ **`STATUS.md`** is the master state file. Update it after every significant task.

### Context router (progressive loading) — read only the slice you need

Don't read every document "just in case" — that fills the context you're trying to protect. Read the
**required minimum** always, then only the documents for the task type; fetch more on demand.

| Task type          | Read (minimum on top of the required minimum)                         |
|--------------------|-----------------------------------------------------------------------|
| **Required minimum (always)** | `STATUS.md` · `PHILOSOPHY.md` (the principle set) · this router · `EXPERIENCE.md` (grep by tag) |
| Bug                | `BUG_FIXING_FRAMEWORK.md` · `bugs/<this>` · the map (blast radius)     |
| Feature / idea     | `ideas/<this>` · `MASTER_PLAN.md` · the relevant `plans/<this>`        |
| Refactor / edit    | `AGENT_GUIDE.md` · the two maps (blast radius)                         |
| Planning           | `MASTER_PLAN.md` · `GOAL.md` · open backlog                            |

Sections in these documents are anchored — address a slice (`DOC.md#anchor`) rather than re-reading the
whole file. The required minimum is **not** subject to laziness: `PHILOSOPHY.md` always applies.

### Task execution discipline — the fable loop

Any non-trivial task is executed by the **fable-method** loop (`.claude/skills/fable-method/`): classify
the ask → define done → gather evidence → decide → act surgically → verify by observation → report
outcome-first, with its gates and **forced artifacts** (`INTENT:` / `AUTH:` / `TWINS:` / `PENDING:`
lines at decision points — rules at decision points, not rules in lists, are what weak sessions actually
follow). Orchestrated work (parallel evidence fan-out, adversarial verifiers) uses `/fable-loop` — inside
the autonomous cycles, per backlog item. Whenever work is claimed complete (yours or another agent's),
run a **`/fable-judge`** pass before presenting it as done — mandatory in the loops and in `/release`.
These three skills are vendored verbatim from [fable-method](https://github.com/Sahir619/fable-method)
(Sahir619, MIT) — see their headers for the sync ritual; the project's sphere library plays the role of
their domain adapters.

### Experience log — `EXPERIENCE.md`

`EXPERIENCE.md` is the agent's growing, grep-friendly log of lessons (externalized memory of what works and
what doesn't). **Recall** relevant entries before a task (grep by tag); **capture** a short lesson after any
meaningful success or failure — in loops, do both without waiting for the human. Skill: `/experience`.
Boundary: `bugs/` = one doc per defect; `EXPERIENCE.md` = short cross-task, approach-level lessons (incl.
successes). Living reference — never DONE-tagged.

---

## Project identity (CANON — use these, don't invent)

| Field | Value |
|-------|-------|
| **Name / brand** | `<PROJECT_NAME>` |
| **Short name** | `<SHORT_NAME>` |
| **GitHub repository** | `<REPO_URL>` |
| **Local project folder** | `<LOCAL_PATH>` |
| **Author / owner** | `<AUTHOR>` |
| **License** | `<LICENSE>` |

> Keep one canonical spelling for names/paths/URLs and use it everywhere. If you find an old/renamed
> identifier in historical docs, normalize it to the canonical value above.

---

## Goal of the project

`<ONE-PARAGRAPH STATEMENT OF WHAT THIS PROJECT IS AND FOR WHOM. Keep it short and concrete.>`

---

## Architecture — the map

`<HIGH-LEVEL MODULE/COMPONENT MAP. The directory layout, the modules, and the dependency rules between
them. Keep this in sync with PROJECT_STRUCTURE_EXTERNAL_MAP.md (the detailed map). Example:>`

```
<module-a>      ← entry point / app
<module-b>      ← <responsibility>
<module-c>      ← <responsibility>
```

**RULE:** `<state the key architectural invariant, e.g. "feature modules don't depend on each other">`.

Full file map and data flows live in `PROJECT_STRUCTURE_EXTERNAL_MAP.md`.

---

## Build

```bash
<BUILD_COMMAND>
```

`<Note any environment gotchas: required toolchain version, env vars (e.g. JAVA_HOME), how to check
for errors only, how to do a headless vs. interactive build.>`

---

## Test harness (how the agent observes & drives the software)

`<Describe the tooling the agent uses to run, observe, and drive the software WITHOUT a human — the
single most important investment for autonomous work. For a GUI app: a UI-automation/inspection tool.
For a server: a request runner + log tail. For a CLI: scripted invocations + golden outputs. Always
prefer deterministic reproduction and objective verification over eyeballing. Grow this tooling over
time and document new commands here.>`

| Command | What it does |
|---------|--------------|
| `<cmd>` | `<...>` |

> Full harness guide: `<path to your harness/automation guide, if any>`.

---

## Git workflow

`<State your branching policy. A simple, effective default — used by this framework's own project —
is: work ONLY in `main`, no feature branches; commit incrementally and often; to undo, use git history
(git revert / git checkout <hash> -- file), not branches. Pick what fits your project and state it here
so the agent doesn't improvise.>`

> Reconciliation with the fable-method **authorization gate**: this deployed guide IS the owner's
> standing authorization for routine commits/pushes per the policy above. Everything beyond it —
> releases, deploys, external sends/publishes, force-pushes, deletions of shared data — still requires
> the owner's quoted words (an `AUTH:` line).

## Commits

Style: `feat:`, `fix:`, `docs:`, `refactor:`, `ci:` + one line of what was done.
End every commit message with the co-author trailer:

```
Co-Authored-By: <YOUR AGENT/MODEL> <noreply@anthropic.com>
```

`<If you use a commit/version tool (e.g. tools/commit.mjs that bumps a build number, commits, pushes),
document it here.>`

## Push / GitHub authentication

`<Document how pushing and GitHub operations are authenticated in this environment (e.g. `gh auth
setup-git` to use the gh token as a git credential helper), and the recovery steps if a push fails
(non-fast-forward → git pull --rebase → retry).>`

---

## Tools

`<Table of the project's automation tools (build, commit, release, codegen, graphics, etc.). Keep it
current — when you add or extend a tool, add a row here.>`

| Command | What it does |
|---------|--------------|
| `<cmd>` | `<...>` |

---

## Backlog & the DONE tag

So that the file listing alone tells you what's open vs. closed — **insert the word `DONE` into the
filename after the number when a file's task is completed and verified:**

```
bugs/04_modal.md                →  bugs/04_DONE_modal.md
ideas/07_dev_menu.md      →  ideas/07_DONE_dev_menu.md
```

**Rule (do this every time you work with bug/idea files):**
- Finished a bug/idea and it is CONFIRMED closed (status ✅, verified) — rename immediately, inserting
  `DONE` after the number: `git mv <NN>_<name>.md <NN>_DONE_<name>.md`.
- A file in progress / partial / research-only — do NOT mark `DONE` (🔧/🟡/🔬 = not done yet).
- Use `git mv` (preserves history). Don't change the number.
- Reference docs in `plans/` (master_plan, project_map, etc.) are NOT tasks — never tag them DONE.

**Backlog revision skill — `/check-backlog`:** walks `bugs/` and `plans/`, collects everything without a
`DONE` tag as the open backlog, and tags genuinely-closed files DONE (with a status section appended).

**Bug reporting skill — `/report-bug`:** hit a defect during dev/test — file a dedicated md in `bugs/`
by the canon, per `BUG_FIXING_FRAMEWORK.md`. The agent keeps its own bug backlog — one doc per defect,
nothing lost.

**Idea proposal skill — `/propose-idea`:** had a worthwhile idea that fits the master plan and the
human's vision — file it as an md in `ideas/` with status "❓ awaiting human approval." An
agent's idea is a contribution to the product VISION → implement ONLY after the human approves.

---

## Decisions the agent must NOT make alone — interviews

Before a significant new feature, and whenever a brand/UX/architecture fork appears, conduct an
**interview** with the human using the `/interview` skill: closed A/B/C questions, recommendation first,
answered by the human directly in `interviews/interview_NNN_<topic>.md`. Never make UI/UX/brand/
architecture decisions without confirmation. Everything else — decide yourself with sensible defaults
and report in the chat.

Rule of thumb: *is it cheap to reverse?* If yes — decide yourself. If it shapes brand/architecture/UX
for the long term — interview.

Task-level ambiguity (which of two deliverables did the human mean *right now*) is NOT an interview:
per fable-method Step 0, ask exactly **one pointed question** in the chat that states your recommended
interpretation. Interviews are for vision-level forks that outlive the task.

---

## Code style

`<Project-specific code style. A universal baseline:>`
- Comment all non-trivial blocks and modules — what the code does and why, and what it connects to.
  This is for transparency, traceability, and future maintainability across context-losing sessions.
- No magic numbers — named constants with clear names.
- Prefer the platform/library's idiomatic, built-in way over a hand-rolled mechanism.
- `<add language/framework-specific rules here>`

---

## Notes from the human

`<Free-form, high-signal guidance from the project owner — the kind of thing that doesn't fit a
category but matters. Examples this framework was distilled from:>`
- Always check the current time and the log file's time before reading logs — read fresh logs, not stale ones.
- Work autonomously without interactive questions. If you need information from the human, write an
  interview document and pause the session (so the human is signaled to come answer), rather than blocking.
- If you find bugs in third-party libraries, file tickets for them via `gh` on the human's behalf.
- Actively test what you build, using whatever tooling lets you drive the software effectively.
- Periodically re-read and, where useful, improve your own guidance docs so a fresh session can be
  effective despite context loss. Steer and tune yourself toward maximum effectiveness and autonomy
  toward the stated goal.
