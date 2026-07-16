<!-- GENERATED FILE — the KAIF installer bundle. Built by tools/build-framework.mjs; fetched and parsed by KAIF-CORE.mjs. Never edit or deploy by hand. -->
# KAIF-CORE-BUNDLE · v1.4 (2026-07-08)

> **FILE: `kaif-bundle-manifest.json`** — bundle metadata (data for KAIF-CORE, never written to disk)

``````json
{
  "framework": "KAIF",
  "version": "1.4",
  "released": "2026-07-08"
}
``````

> **FILE: `AGENT_GUIDE.md`** — project root — replace every `<PLACEHOLDER>` with the project's real values

``````md
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
``````

> **FILE: `PHILOSOPHY.md`** — project root — universal, write verbatim

``````md
# PHILOSOPHY — How the agent thinks: SIMPLICITY (KISS + Occam's Razor)

> This document is the agent's primary thinking principle on this project. Read it alongside
> `AGENT_GUIDE.md` and `BUG_FIXING_FRAMEWORK.md`. Whenever a "clever complex solution" conflicts
> with a "simple" one — choose the simple one.

---

## The core idea

> **If something takes a long time to build or fix, it is almost never because the task is too hard
> or the library is broken. It is because the agent is DOING IT TOO COMPLEX — because it did NOT
> UNDERSTAND THE TASK.**
>
> **Everything should be done simply. Not working = RE-UNDERSTAND the task, don't pile on complexity.**

Unpacked:

- Libraries, frameworks, and platforms are **simple to use by design**. Almost everything has already
  been figured out before us. There is rarely a need to "reinvent the rocket."
- If a fix becomes bulky, multi-step, full of flags and workarounds — that is a **red flag**: the agent
  most likely didn't understand *how it actually works* and is fighting an imagined complexity, not the
  real task.
- Getting stuck is a signal NOT to "dig deeper into the complex," but to **stop and simplify the
  understanding**.

---

## Occam's Razor

**Do not multiply entities without necessity.** Of two solutions that explain/solve the same thing,
pick the one with fewer assumptions, less code, fewer moving parts.

In practice:

- Fewer states, flags, special cases, "crutches propping up crutches."
- If a solution needs five interlocking hacks — there is almost certainly one simple solution we
  failed to see because we misunderstood the task.
- A complex solution that "seems to work" is worse than a simple one that *demonstrably* works.

## KISS — Keep It Simple, Stupid

**Simplicity is the goal, not a side effect.** The simplest solution that does the job is the correct
one. Add complexity only when it is objectively NECESSARY and proven — never "just in case."

In practice:

- First state the task in one or two plain sentences. If you can't, you don't understand it yet.
- Look for the built-in, out-of-the-box way in the library/platform *before* writing your own mechanism.
- If you're writing something clever, ask: "how would a simple person, or an off-the-shelf tool, do this?"

---

## The wider principle set — how the agent reasons

Simplicity (KISS + Occam) is the **prime directive** above. The principles below are the supporting mental
models the agent reasons by — they refine *what* is worth doing, *in what order*, and *how* to weigh a
decision. When any of them conflicts with the prime directive, the prime directive wins.

### Pareto — the 80/20 law
Roughly 80% of the value comes from 20% of the effort. Aim to deliver the most useful result for the least
optimal spend of time, effort, and resources. Find the vital few things that move the outcome and do those
first; don't polish the trivial many. "Good and shipped" beats "perfect and late."

### Murphy's Law — anything unforeseen tends to happen
If a risk isn't accounted for, it has a good chance of being exactly what bites you. You can't defend
against every risk in the universe, so tier them: **(a)** the highest risks — take seriously and build
defenses; **(b)** lower-but-plausible risks — list them and describe the contingency if they fire;
**(c)** the least likely, most trivial risks — just list them so we remember they exist. Naming a risk is
already half of managing it.

### Best practices — someone has almost certainly solved this before
Almost any task — or one cognitively/methodologically like it — has been solved before us. There is
usually accumulated, empirically-proven wisdom on how it *should* and *should not* be done to reach the
result fastest and best. Look for the established pattern first; adopt it unless there's a concrete reason
not to. This is Occam applied to method: don't invent where a proven path exists.

### The Eisenhower Matrix — grooming and choosing tasks
When grooming the backlog and planning the work front, classify tasks by **urgent × important**:
*important + urgent* → do now; *important + not urgent* → schedule; *urgent + not important* → delegate or
minimize; *neither* → drop. Pick work by this matrix so effort lands on what actually matters, not just on
what shouts loudest.

### Hanlon's Razor — don't assume malice
If something is not as it should be, it is overwhelmingly more likely to be simple oversight, mistake, or
shortsightedness than deliberate ill intent. Debug the state of the world, not the motives — assume a
mistake and look for it, don't construct a conspiracy.

### DRY — Don't Repeat Yourself
Do a thing once, well, in one place — then reuse and reference it, don't copy it. One canonical source of
truth per fact; duplication drifts out of sync and doubles the maintenance. (This framework itself is
built this way: the templates live once in `framework/` and are inlined into the core, never duplicated by
hand.)

### Learn once — accumulated experience
A mistake made and recorded is tuition paid; making it twice is tuition wasted. The agent works across
sessions that lose context, so memory of *what works and what doesn't* must live on disk, not in the chat.
Before a task, recall the relevant lessons (`EXPERIENCE.md`, grep by tag); after a meaningful success or
failure, capture the reusable takeaway. Don't blindly retry an approach a past entry says already failed —
go the other way, or note why this time differs. (Skill: `/experience`. This is DRY applied to *effort*:
solve a class of problem once, then reference the lesson.)

### Descartes' Square — a decision tool for hard forks
When the right choice isn't intuitively obvious, analyze it through four questions: **What happens if I DO
this? What happens if I DON'T? What will NOT happen if I do? What will NOT happen if I don't?** Answering
all four surfaces consequences a single "pros and cons" pass misses, and usually makes the decision clear.

### Assume the obvious — horses, not zebras
The simplest, most obvious explanation is most likely the correct one — assume and test it *first*. Hear
hoofbeats → think horses, not zebras: horses are everywhere, zebras also make hoofbeats but are vanishingly
rare. Chase the common cause before the exotic one. (This is Occam wearing work clothes.)

### Second-order thinking — consequences of the consequences
Think beyond the direct effect to the effects it sets in motion (the second derivative). Direct
consequences often look harmless while the processes they trigger carry enormous risk or leverage. Physics:
acceleration often matters more than speed. Chess: the weak player asks "what can I win *right now*?"
(tactics); the strong player asks "if I do this → how does the opponent reply → what position do we reach
in 3–5 moves → whose is better long-term?" (strategy). Strategy wins the long game; chasing tactical wins
almost always ends in a long-term collapse.

### Karma — what you give is what you get
"Good" and "bad" are the base evaluative categories intelligent beings use to steer behavior — the compass
between the desirable and the harmful. Good: acts that bring benefit, help, honesty, care, respect. Bad:
acts that cause harm — deceit, theft, violence. The principle: what you put out comes back. Do good → get
good; do harm → get harm; do no harm → receive no harm; do no good → receive no good. So decide what you
want to receive, and act (or refrain) accordingly — by your deeds it returns to you. In practice: build
honestly, don't cut corners that hurt the human or the next agent session, leave the repository better than
you found it.

---

## The rule when stuck

1. **3 attempts** of "fix → build → test" without success = STOP. Stop poking blindly
   (see `BUG_FIXING_FRAMEWORK.md`).
2. Don't "dig harder" — **re-understand the task**: re-read what was actually asked, in plain words.
   The simple answer is often already there.
3. Run deep research (`/bug-research`): understand HOW it actually works (docs/source), don't guess.
   The goal is to find the SIMPLE, supported path.
4. Form a simple hypothesis and a simple plan. If the plan is complex again — you still don't
   understand the task.

---

## Illustration: the imagined-complexity trap

A typical failure mode: an agent receives a task it half-understands, picks a complicated mental model,
and then spends hours wrestling that model — trying flag after flag, inverting parameters, stacking
special cases — each attempt distorting the result a different way. This is fighting an *imagined*
problem.

The way out is never "try a sixth variation." It is to put the keyboard down and re-state the task in
one plain sentence — often a sentence the human can give you instantly. Nine times out of ten the plain
statement contains a simple, supported path that makes all the clever machinery unnecessary.

> The lesson: the task was simple. The agent invented a hard one, then got stuck in it.
> **Didn't understand → over-complicated → stuck.**

---

## The simplicity checklist (run before writing a complex solution)

- [ ] Can I explain the task in one plain sentence?
- [ ] Is there a built-in way in the library/platform? Did I look in the docs/source?
- [ ] Is my solution the minimum number of entities, or am I breeding flags and special cases?
- [ ] If the solution is complex — am I sure I understood the task, or am I fighting an imagined problem?
- [ ] What would an off-the-shelf tool / standard API do here?
- [ ] Have I already made ≥3 failed attempts? Then STOP → re-understand, don't escalate complexity.
- [ ] What would a resourceful human do? What ingenuity, creativity, or out-of-the-box thinking would help?
``````

> **FILE: `BUG_FIXING_FRAMEWORK.md`** — project root — universal, write verbatim

``````md
# BUG_FIXING_FRAMEWORK — how the agent fixes defects

To fix a bug, the agent must:

- **Focus on this one bug only.** Don't refactor the world; don't fix three other things along the way.
- **Narrate in the chat**, at least a little, in natural language — what you are doing right now — so
  the human can glance over and understand where the work is.
- **Reflect and capture knowledge** for every bug, even small ones, in a dedicated markdown file per
  bug in the `bugs/` directory.
- **Intent gate before the first behavior-changing edit** (fable-method, Step 4): write one line —
  `INTENT: code does <X>; the failing check/task expects <Y>; the spec (README/docs/docstring) says <Z>`
  — actually opening the spec to fill the third slot. If X/Y/Z disagree, the disagreement IS the finding:
  the "bug" may live in the check or in the task framing, not in the code. Never silently make one side
  match another; authority order: explicit owner statement > spec > tests > current code behavior.
- **Enter the loop:** run the app → reproduce the bug → read the logs for this bug → form a guess at the
  cause → make a *single, targeted* change → build → run the app again → try to reproduce again.
- The essence: **targeted changes, then a build to test whether the change helped or not.**
- Simplified: Fix → Test → Read logs → Fix → Test → Read logs → … until it works correctly. Working
  correctly **is the acceptance criterion** — at that point the bug is considered fixed. "Works
  correctly" is an *observation* (it ran, it rendered, it counted), never an inference from reading the
  diff — an unverified "fixed" claim is the classic fraud `/fable-judge` exists to catch.
- **Twin check after the fix** (fable-method, Step 5c): a defect found in one place is presumed to recur
  elsewhere until you have searched. Name the exact wrong construct, search the whole project for it, and
  record in the bug document (and your report): `TWINS: searched <pattern> — found <N> other sites:
  <files, or "none">`. Fix them or list them — a completeness claim with no search behind it is hollow.
- To fix a bug, it is often useful to **search the web** for the solution — forums, GitHub issues,
  Reddit, Stack Overflow, official docs.

> ⚠️ **THE 3-ATTEMPTS RULE → switch to research (`/bug-research`).**
> If after **three iterations** of "targeted fix → build → test" the bug is NOT fixed — STOP going
> blind and poking at random. Further random attempts waste time and builds, and (if the test depends
> on external services) are unreliable. Instead, run the **`/bug-research`** skill: deep web search with
> the raw knowledge base written into the bug document, reading and analyzing the code WITHOUT edits to
> locate the cause, reflection, and a justified hypothesis + plan. Return to fixing only once you
> understand the cause. Skill: `.claude/skills/bug-research/SKILL.md`.
>
> 🧠 **AND, MOST IMPORTANTLY (see `PHILOSOPHY.md`):** a long stall almost always means you are making
> the FIX TOO COMPLEX because you did NOT UNDERSTAND the task — NOT that the task is hard or the library
> is "buggy." Libraries are simple; it's all been figured out before us. If the fix is bulky, with a
> pile of flags and workarounds — that's a red flag: stop and RE-UNDERSTAND the task in plain words,
> find the simple supported path (KISS + Occam). A stall = a signal to simplify your understanding, not
> to "dig harder."

- For effective fixing, the code must be **commented**.
- For effective fixing you MUST reflect and write down your knowledge about working on this bug into a
  dedicated document about *this specific* fixing work. Such ruminations should and must be kept as
  separate markdown documents in the `bugs/` directory.
- Once the bug is understood or fixed (and always after the three-attempts stop), **capture the reusable
  lesson** in `EXPERIENCE.md` (skill: `/experience`) — the approach-level takeaway ("X failed because R;
  Y worked"), not the defect detail (that stays in the `bugs/` document). This is how a later session
  avoids re-walking the same dead end.
- To be able to interact with the program under test, you can and should **install or build extra
  tooling** that lets the agent observe and drive the software: see its output, inspect its state,
  reproduce the defect deterministically, and exercise it without a human. Invest in that instrumentation
  — it pays for itself across every future bug.

---

## Instrumentation — build a test harness, don't guess

The single biggest force multiplier for autonomous debugging is a **harness**: tooling that lets the
agent reproduce and observe a bug on its own, without a human in the loop and without unreliable manual
inspection.

Principles:

- **Never guess what the program is doing — observe it.** Add structured logging, a debug command
  channel, a deterministic way to drive the software into the exact state that triggers the bug.
- **Make reproduction deterministic.** A bug you can reproduce on demand is a bug you can fix. A bug
  you see "sometimes" is a research task first (`/bug-research`).
- **Prefer objective verification over eyeballing.** If a visual/manual check is unreliable (subtle
  distortions, timing), invent an objective check (a known-shape control input, a measurable output, a
  size/checksum log) and write it into the bug document.
- **Grow the harness over time.** Every time you do something manually to reproduce or verify, ask:
  "can I add a command/flag/script so next time it's one step?" Then add it, and document it in
  `AGENT_GUIDE.md`. The harness is a living tool — extend and document it.

---

## Working with logs

- Always check the **current time** and the **timestamp of the log file/entries** before reading — so
  you read fresh, relevant logs, not yesterday's.
- Filter logs to the bug: grep for the relevant subsystem, error text, crash markers.
- Attach the key lines (stack trace, abort message, error codes, sizes) into the bug document — they are
  the forensics future sessions will rely on.

---

## The bug document (one per bug, in `bugs/`)

Capture, don't narrate. A good bug doc lets a future session (with empty context) pick the bug up cold.
Canonical structure (see `/report-bug` for the full template):

```
# Bug NN — <one-line description>

**Status:** 🔴 OPEN  (or 🟡 partial / 🔬 research-only / 🔧 fix pending verification / ✅ DONE)
**Version/build:** <...>   ·   **When/context:** <date, during which task it was found>

## Symptom
<what is observed, and how it differs from expected>

## Repro (deterministic)
<steps; harness commands if available>

## Forensics
<key logs / crash / measurements>

## Root cause / Hypotheses
<the cause if known; otherwise ranked hypotheses — do NOT patch blindly>

## Fix plan (or the fix, if done)
<steps; relation to architecture / other bugs>

## Links
<related bugs / ideas / interviews>
```

When the bug is confirmed fixed and verified, mark it DONE by the `DONE`-tag convention (rename
`bugs/NN_x.md` → `bugs/NN_DONE_x.md` and append a `## ✅ STATUS: DONE (date)` section). See
`AGENT_GUIDE.md` → "Backlog & the DONE tag" and the `/check-backlog` skill.

---

## If the bug is in someone else's library

If you find a genuine defect in a third-party dependency, file an issue/ticket in their tracker (e.g.
via the `gh` CLI, on the human's behalf if authorized), and reference that ticket from your bug document.
This both helps the ecosystem and documents why you worked around it.
``````

> **FILE: `STATUS.md`** — project root — seed with the project's current real state

``````md
# <PROJECT_NAME> — Current Status

> This file is read by the AI agent before every task. Update it on every significant change of state.
> It is the PRIMARY handoff between sessions: a new agent session starts with empty context and must be
> able to get productive from this file alone. Write accordingly — concrete, with file paths and commands.
> 🧠 Prime thinking principle — `PHILOSOPHY.md` (SIMPLICITY: KISS + Occam). Read your working framework
> in `AGENT_GUIDE.md`.

---

## What's done

`<Chronological-ish list of completed phases/features, concrete, tied to files/modules. Enough detail
that a fresh session understands what already exists and works. Example:>`

### Phase 0 — Foundation ✅
- `<...>`

### Phase 1 — <name> ✅
- `<...>`

---

## Where we are now

`<One short paragraph: what works, what's in progress, what's the current focus.>`

| Phase | Status | What's there |
|-------|--------|--------------|
| Phase 0 | ✅ done | `<...>` |
| Phase 1 | 🔧 in progress | `<...>` |
| Phase 2 | 🔲 todo | `<...>` |

---

## 🤖 Autonomous backlog pool (no human / no special hardware needed)

> Tasks the agent can do FULLY autonomously: write code → build → test on the harness → fix → commit,
> without the human and without resources only the human can provide. The loop skills
> (`/autoloop`, `/dayloop`, `/nightloop`) grind this pool.

- [ ] `<task — why it's autonomous>`
- [ ] `<task>`

---

## ❓ Awaiting human review (interviews / homework)

> Decisions the agent must not make alone (brand/UX/architecture), or actions only the human can do
> (test on real hardware, external accounts). Filed in `interviews/` and `plans/homework_*.md`.

- ❓ `<interview NNN — one line>` → `interviews/interview_NNN_*.md`
- 🧰 `<homework — one line>` → `plans/homework_*.md`

---

## Where to continue next session

> A concrete checklist so the next session (empty context) can start immediately: which files, which
> commands, what to verify first.

1. `<first thing to do, with the exact command/file>`
2. `<...>`

---

## Open bugs

`<Pull from bugs/ (non-DONE). One line each with status and a pointer. Example:>`
- 🔴 `bugs/NN_<name>.md` — `<symptom, one line>`
``````

> **FILE: `EXPERIENCE.md`** — project root — seed this template; the agent grows it (skill: /experience)

``````md
# EXPERIENCE — the agent's accumulated experience

> The agent's growing log of lessons. **Externalized memory of *what works and what doesn't*** — so a
> fresh, context-less session (or an autonomous loop) never repeats a dead end. Consult it BEFORE a task;
> append to it AFTER a meaningful attempt (success **or** failure). Grep, don't scroll.
>
> **Tags live inline on every entry** (not in a central list) — so one grep finds the experiences directly:
> `grep '#loop' EXPERIENCE.md` · `grep -i '#context\|#build' EXPERIENCE.md` · `grep '❌' -A4 EXPERIENCE.md`
> · `grep 'EXP-0007' EXPERIENCE.md`. Reuse an existing tag where one fits (grep to see what's in use).
>
> **Entry format (keep it short and grep-friendly).** Newest on top. Every entry starts with a stable id,
> an ISO date, an outcome marker (`✅` / `❌` / `❌→✅`), and inline `#tags`:
>
> ```
> ### EXP-0001 · 2026-01-01 · ✅ · #tag #area
> **Context:** one line — what was being done.
> **Tried / did:** the approach, briefly.
> **Result:** ✅/❌ — what happened.
> **Lesson:** the reusable takeaway (the reason this entry exists).   → link: bugs/NN · ideas/NN · plans/NN
> ```
>
> Skill: `/experience` (capture a lesson · recall relevant lessons).

## Entries

### EXP-0001 · 2026-01-01 · ✅ · #example #meta
**Context:** first task after KAIF was deployed into this project (example entry — replace with real ones).
**Tried / did:** wrote the first real lesson here in the canonical format.
**Result:** ✅ — the experience log is live and greppable.
**Lesson:** capture lessons at the level of *approach* (what worked / what to avoid), not defect detail
(that lives in `bugs/`); one short entry beats a long story.   → link: (none)
``````

> **FILE: `GOAL.md`** — project root — owner-filled; if empty, seed this template and ask the owner

``````md
# <PROJECT_NAME> — GOAL (the vision)

> **Who fills this in:** the human owner (visionary). **Language:** the owner's working language.
> **When:** ideally *before* deploying KAIF — the agent orients its whole deployment (master plan,
> sphere, terminology) around this document. If it's missing at deploy time, KAIF still works, but the
> agent will have to translate the deployed wrapper into the project's meaning later — extra work. Better
> to write it up front.
>
> This is a **living reference**, not a task — never DONE-tagged. Update it whenever the vision sharpens.

---

## What I want — in one paragraph

`<In plain language: what should exist when this project is "done"? What is the end result? For whom, and
what does it let them do? Write as the visionary, not the implementer — the *what* and the *why*, not the
*how*. A few honest sentences beat a polished spec.>`

## Why it matters / the problem it solves

`<What pain or opportunity is behind this? What's wrong with the world today that this fixes?>`

## What success looks like

`<Concrete signs the goal is reached — the observable end state. "A user can …", "The result is …".
Bullet the few things that would make you say "yes, that's it.">`

## Boundaries — what this is NOT

`<Explicitly out of scope. Naming non-goals prevents drift as much as naming goals.>`

## Constraints & preferences (optional)

`<Hard constraints (platform, budget, deadline, tech you must/can't use) and soft preferences (taste,
style, tone). Anything the agent should honor without being told twice.>`

---

> **How to use this (for the agent):** read `GOAL.md` first; let it steer the sphere, terminology, and the
> `MASTER_PLAN.md` you derive from it (skill: `/revision`). Do not invent vision here — if the goal is
> unclear or empty, ask the owner to fill it (or raise an `/interview`). This document belongs to the
> human.
``````

> **FILE: `MASTER_PLAN.md`** — project root — derive from GOAL.md (skill: /revision)

``````md
# <PROJECT_NAME> — MASTER PLAN

> The roadmap: how we get from the project's **current state** to the vision in `GOAL.md`. A high-level,
> stepwise decomposition — phases and milestones, not day-to-day tasks (those live in `plans/`). Derived
> from `GOAL.md` by the agent at deploy and refreshed with `/revision` as the goal or the state changes.
>
> This is a **living reference**, not a task — never DONE-tagged.

---

## Vision (one line)

`<Distilled from GOAL.md — the north star in a single sentence.>`

## Guiding principles

`<The few decisions/values that shape every choice: e.g. "simplicity over features", "ship weekly",
"offline-first". Reference PHILOSOPHY.md — these are its application to THIS project.>`

## From here to there — the phased path

`<Break the journey into phases. Each phase is a coherent milestone that moves the project meaningfully
closer to GOAL.md. Keep it high-level; detailed step plans go in plans/NN_*.md.>`

### Phase 0 — <foundation / current state>
- **Goal of the phase:** `<what "done" means for this phase>`
- **Steps:** `<the few big moves>`
- **Status:** `<✅ / 🔧 / 🔲>`

### Phase 1 — <name>
- **Goal of the phase:** `<...>`
- **Steps:** `<...>`
- **Status:** `<...>`

### Phase N — <the goal is reached>
- `<...>`

## Decision log

`<Dated, one line each: significant decisions and why — so a future session doesn't relitigate them.>`

| Date | Decision | Why |
|------|----------|-----|
| `<YYYY-MM-DD>` | `<what was decided>` | `<the reason>` |

---

> **Maintenance:** keep this in sync with reality. When `GOAL.md` or the project's state shifts materially,
> run `/revision` to re-derive the phases. The per-step detail plans that implement each phase live in
> `plans/`.
``````

> **FILE: `PROJECT_STRUCTURE_EXTERNAL_MAP.md`** — project root — the external map, from your inspection

``````md
# <PROJECT_NAME> — External structure map

> **The EXTERNAL map: what the project looks like from the outside** — its directories, files, and the
> cross-references and dependencies between them. This is the "where things live" map a fresh session
> reads to navigate. Its companion is `PROJECT_ARCHITECTURE_INTERNAL_MAP.md` (the *internal* logical
> architecture — the abstractions and how they interact).
>
> Adapt the vocabulary to the project's **sphere**: for software — directories, files, modules; for a
> research/writing/business project — sections, documents, datasets, artifacts. Keep it in sync with the
> real tree. **Living reference — never DONE-tagged.**

---

## The tree

```
<project root>/
├── <dir>/            # <what lives here>
│   └── <file>        # <role>
├── <file>            # <role>
└── ...
```

## What each part is

| Path | What it is | Depends on / references |
|------|-----------|-------------------------|
| `<path>` | `<one-line role>` | `<other paths it links to / relies on>` |

## Cross-references & dependency rules

`<The rules of who may reference/depend on whom — e.g. "docs link down, never up", "feature dirs don't
cross-reference each other", "generated files derive from sources in X". State the invariants so the agent
doesn't violate the structure.>`

## Entry points

`<Where a newcomer (human or agent) should start reading/looking, in order.>`

---

> Keep this map honest: when you add, move, or rename a file/directory, update the tree and the table in
> the same change. The *internal* logic (abstractions, data/interaction flows) belongs in
> `PROJECT_ARCHITECTURE_INTERNAL_MAP.md`.
``````

> **FILE: `PROJECT_ARCHITECTURE_INTERNAL_MAP.md`** — project root — the internal map, adapted to the sphere

``````md
# <PROJECT_NAME> — Internal architecture map

> **The INTERNAL map: the project's logical architecture** — the abstraction objects the project's sphere
> works in, their essence, and how they interact. Where `PROJECT_STRUCTURE_EXTERNAL_MAP.md` says *where
> things live*, this says *how the system thinks*. A fresh session reads this to understand the model, not
> just the file layout.
>
> **Adapt the abstractions to the sphere:**
> - *Programming* — modules, interfaces, objects, data structures, data flows, state, protocols.
> - *Science* — hypotheses, variables, models, datasets, methods, inference chains.
> - *Sociology* — subjects, objects, institutions, roles, the relations between them.
> - *Business* — actors, processes, value flows, resources, constraints.
> - …and so on for any sphere. If unsure, describe the domain's nouns and the verbs that connect them.
>
> **Living reference — never DONE-tagged.**

---

## The core abstractions

| Abstraction | What it *is* (essence) | Responsibility |
|-------------|------------------------|----------------|
| `<name>` | `<what concept it represents>` | `<what it owns / does>` |

## How they interact

`<Describe the interactions between the abstractions: who calls/produces/consumes/governs whom. A flow or
sequence in prose or a simple diagram. For software: data/control flow. For other spheres: the flow of
influence, information, or value.>`

```
<A> ──produces──▶ <B> ──consumed by──▶ <C>
```

## Invariants & rules of the model

`<The logical rules that must always hold — the "laws" of this architecture. Violating them is a bug even
if the code/text runs.>`

## Key decisions embedded in the architecture

`<Why the model is shaped this way — the trade-offs chosen. Ties back to MASTER_PLAN.md's decision log.>`

---

> Keep this in sync with the real logic as it evolves. When you introduce or retire an abstraction, or
> change how they interact, update this map in the same change. File/directory placement belongs in
> `PROJECT_STRUCTURE_EXTERNAL_MAP.md`.
``````

> **FILE: `KAIF_FRAMEWORK.md`** — project root — write AFTER a successful injection (see §10)

``````md
# KAIF in <PROJECT_NAME> — the framework, deployed

> **What this document is.** A high-level description of the **KAIF framework as deployed and used in this
> project** — think of it as the project's "technologies & frameworks" page, on which KAIF is now one of
> the technologies. It is written by the agent **after a successful KAIF injection** (the self-extracting
> core `KAIF.md` is removed once this exists — see the KAIF lifecycle). From here on, work in this project
> is organized *through* KAIF, and this file is the human-facing summary of that.
>
> Written in the owner's working language. **Living reference — never DONE-tagged.** Keep the version line
> current.

---

## What KAIF is

KAIF (Krinik AI Framework) is a **context-resilient, autonomy-disciplined operating framework for the
human–AI tandem**. It externalizes the agent's working memory and discipline into this repository — a small
set of markdown documents, directory conventions, and repeatable slash-skills — so any fresh agent session
resumes with full context, works autonomously within clear bounds, and accumulates knowledge instead of
losing it. It is not code; it is *process captured as files an agent reads*.

## Why it's here — what it gives this project

- **No cold starts.** A new session reads `AGENT_GUIDE.md` + `STATUS.md` and is productive immediately.
- **Knowledge that survives.** Bugs, decisions, research, and ideas become durable documents, not lost chat.
- **Bounded autonomy.** The agent grinds the backlog alone and escalates only owner-level decisions.
- **A shared method.** Human = visionary (`GOAL.md`), agent = executor; KAIF is the interface between them.

## How it works here — the moving parts

| Piece | Role in this project |
|-------|----------------------|
| `AGENT_GUIDE.md` | The canon the agent reads before every task. |
| `PHILOSOPHY.md` | How the agent thinks (KISS + Occam + the wider principle set). |
| `BUG_FIXING_FRAMEWORK.md` | How the agent debugs. |
| `GOAL.md` / `MASTER_PLAN.md` | The vision, and the phased path to it. |
| `STATUS.md` | The living state — updated after every significant task. |
| `PROJECT_STRUCTURE_EXTERNAL_MAP.md` / `PROJECT_ARCHITECTURE_INTERNAL_MAP.md` | The external & internal maps. |
| `plans/ ideas/ bugs/ researches/ interviews/ homeworks/` | The knowledge directories (each has its own README). |
| `.claude/skills/` (or this agent's equivalent) | The repeatable rituals (`/resume`, `/pause`, loops, …). |
| `.kaif/kaif.json` | The deploy marker: version, sphere, agent, tracking. |

## Deployment record

| Field | Value |
|-------|-------|
| **KAIF version** | `<X.Y>` |
| **Injected on** | `<YYYY-MM-DD>` |
| **How injection went** | `<one or two lines: fast single-command unpack, or staged/respectful flow; anything notable>` |
| **Sphere** | `<programming / science / design / business / …>` |
| **Agent system** | `<claude-code / codex / cursor / …>` |
| **Working language** | `<the owner's language>` |
| **Tracking** | `<origin / fork>` — `<origin repo URL>` |

## Living with KAIF (lifecycle)

`/kaif-version` (check for updates) · `/kaif-update` (respectful migration from origin) · `/kaif-fork`
(evolve your own) · `/kaif-switch-origin` · `/kaif-remove` (partial keeps your artifacts, or full — always
respectful). Backed by `npm run kaif:*` handles.

<!-- KAIF:AUTHOR-NOTE:BEGIN — this whole region is stripped mechanically on anonymous installs -->
---

## A note from the author

> KAIF was conceived and built out of necessity by **Krinik (Mikalai Kryvusha / Николай Кривуша)** during
> vibe-coding sessions with Claude on a software product, at the end of a hot June 2026, in Minsk.
> **KAIF's birthday is 30 June 2026.**

*(Original wording, Russian — canonical:)*

> KAIF был придуман и разработан как вынужденная необходимость (Николай Кривуша) Криником при совместной
> работе в режиме вайбкодинга с Claude над программным продуктом в конце жаркого июня 2026 года, в
> г. Минск. Дата рождения KAIF — 30 июня 2026 г.
<!-- KAIF:AUTHOR-NOTE:END -->
``````

> **FILE: `plans/README.md`** — create the directory and drop this README

``````md
# `plans/` — detailed step plans

Detailed plans for individual pieces of work: single steps of the master plan, specific features, ideas,
bugs, research efforts, procedures. The **`MASTER_PLAN.md`** (project root) is the high-level roadmap;
`plans/` holds the zoomed-in plans that implement its steps. One `NN_<name>.md` per plan.

**For the human (owner):** you don't have to write here — plans are usually the agent's. You may drop a
plan if you want to steer *how* something is done. Read them to see the agent's intended approach before it
executes.

**For the AI agent:** before non-trivial work, write a short plan here and follow it. Number files
(`NN_<name>.md`). A finished, verified plan gets the `DONE` tag in its filename (`git mv NN_x.md
NN_DONE_x.md`) plus a status section. Reference material (not a closable task) is not DONE-tagged.
``````

> **FILE: `ideas/README.md`** — create the directory and drop this README

``````md
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
``````

> **FILE: `bugs/README.md`** — create the directory and drop this README

``````md
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
``````

> **FILE: `researches/README.md`** — create the directory and drop this README

``````md
# `researches/` — knowledge base for the big, hard questions

Notes and distilled findings on large, difficult questions — research write-ups, accumulated know-how,
important reference information that took real effort to gather and shouldn't evaporate. One
`NN_<name>.md` per research topic.

**For the human (owner):** a place to find the deep background behind decisions — why an approach was
chosen, what was learned about a hard problem. You may seed a topic you want investigated.

**For the AI agent:** when a question is large enough that its findings deserve to outlive the current
task, write a research note here (raw sources → analysis → conclusions/hypotheses). Link to it from the
bug/plan/idea that motivated it (DRY — don't re-research). A research note is a **living reference**, not a
closable task — do not `DONE`-tag it; keep updating it as understanding grows.
``````

> **FILE: `interviews/README.md`** — create the directory and drop this README

``````md
# `interviews/` — owner-level decisions

Interviews the agent runs with the human to settle decisions it must **not** make alone — UI/UX, serious
technical forks, brand/vision/priorities. Closed A/B/C/D questions with a recommendation first, answered by
the human **directly in the document**. One `interview_NNN_<topic>.md` each.

**For the human (owner):** when the agent files an interview, it's waiting on **you**. Fill the
"**Answer:**" fields right in the document (pick A/B/C, or write your own in D). This is where your fateful
decisions are captured and preserved.

**For the AI agent:** file an interview only for genuinely owner-level forks (skill: `/interview`). Options
are **A/B/C/D**: **A** is always the choice distilled through `PHILOSOPHY.md` (simplest/most effective) and
marked **(recommended)**; **D** is always "your own answer" for the owner. Do the groundwork first, keep it
to 1–5 questions, then pause and let the owner answer. Everything cheap to reverse — decide yourself.
``````

> **FILE: `homeworks/README.md`** — create the directory and drop this README

``````md
# `homeworks/` — tasks from the agent to the human

Tasks the agent asks the **human** to do — things it cannot do itself because of its digital, bodyless
nature: test on real hardware, act in the physical world, use an account/credential only the human has,
make a purchase, observe something offline. Each doc describes the task with concrete steps for the human,
and collects the human's observations and results back. One `NN_<name>.md` each.

**For the human (owner):** when the agent files a homework, it needs a hand in the physical/offline world.
Follow the steps and write what you observed back into the document — the agent reads your notes and
continues.

**For the AI agent:** when you're blocked on something only a human-with-a-body can do, don't stall — write
a homework here with clear, minimal, numbered steps and a place for the human's results, then continue with
other work. When the human reports back, incorporate the results and `DONE`-tag the file
(`git mv NN_x.md NN_DONE_x.md`).
``````

> **FILE: `.claude/skills/autoloop/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
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
   `BUG_FIXING_FRAMEWORK.md`, `EXPERIENCE.md` (recall lessons — grep by tag), the relevant `ideas/*`
   and `bugs/*`.
2. Check the environment is ready (build toolchain, devices/services — see `AGENT_GUIDE.md`).
3. Assemble/refresh the working pool list from STATUS. Tell the human in one paragraph: what's in the
   pool, which task you start with, and why.

## The cycle (repeat per task)

1. **Pick** the next autonomous task from the pool (priority from STATUS). Verify it can be checked
   WITHOUT the human/special resources. If not — defer, take the next.
2. **Understand it simply** (PHILOSOPHY) — state it in 1–2 sentences. For bugs — open/create a `bugs/` doc.
3. **Implement** in a targeted way, with comments. Don't over-complicate. Execute the item by the fable
   loop (`/fable-method`; `/fable-loop` for substantive items) — its gates and forced artifacts
   (`INTENT`/`AUTH`/`TWINS`/`PENDING`) apply inside the cycle too.
4. **Build** (`<BUILD_COMMAND>`). If errors — fix them, don't commit broken state.
5. **Deploy/run** as your project requires.
6. **Verify autonomously** on the harness (`<TEST_HARNESS>`). Look at the result carefully — don't
   wishful-think; verify objectively.
7. **Fix cycle** on a bug: fix → build → test → logs (fresh by timestamp). The **3-attempts** rule →
   `/bug-research` (no code) → then fix.
8. **Judge pass — MANDATORY before "done"**: run `/fable-judge` over the finished item — re-run the
   claimed checks, diff what actually changed against the item's scope. REFUTED → back to work, not to
   "done"; after 3 failed fix-judge cycles, record it honestly in `STATUS.md`/`bugs/` and take another task.
9. **Capture knowledge**: for bugs — reflection in `bugs/NN_*.md`; for features — status/date in
   `ideas/*`; update `STATUS.md`. After a meaningful success or failure, append the approach-level lesson
   to `EXPERIENCE.md` (skill: `/experience`) — don't wait for the human.
10. **Commit** a small commit (don't lose progress): `<COMMIT_COMMAND>` (style from `AGENT_GUIDE.md`,
   with the Co-Authored-By trailer).
11. **Short chat report** (1–3 lines): what you did, what you verified, what's next. → next task.

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
``````

> **FILE: `.claude/skills/bug-research/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: bug-research
description: Investigate a bug WITHOUT coding/fixing/builds — web-search the problem and collect a raw knowledge base, read and analyze the code to find the cause, reflect and write hypotheses into the bug document. Use when a bug resists direct attempts (≥3 failed blind fix iterations), OR when the human says "research the bug", "look this up", "figure out the cause", "stop poking blindly", "research", "investigate", "исследуй баг", "разберись в причине".
---

# /bug-research — deep bug investigation without coding

Used when a bug **won't yield to direct attempts** (rule: after **3 failed iterations** of
fix→build→test we stop going blind — see `BUG_FIXING_FRAMEWORK.md`). Random poking wastes time and
builds; stop and UNDERSTAND the cause.

> ⛔ In this skill we do NOT write code, do NOT fix, do NOT build, do NOT run the software. Only reading,
> searching, analysis, reflection, and writing into the bug's md document. Pure cognitive work.

## Step 0. Anchor on the bug

- Open the bug doc in `bugs/NN_*.md` (if none — create one per `BUG_FIXING_FRAMEWORK.md`).
- Briefly write out: the symptom, what's been tried (attempt log), under what conditions it reproduces.
- Tell the human in one line that you're switching to research mode (we stop poking blindly).

## Step 1. Web search — collect a RAW knowledge base

Make several targeted queries (`WebSearch`), then pull the most relevant pages (`WebFetch`). Look in:
library GitHub issues/discussions/wiki, Stack Overflow, Reddit, official docs.

- Phrase queries by exact APIs/classes/symptoms (method names, error texts, versions).
- **Record the raw data VERBATIM** in the bug doc under "Knowledge base — raw search data": quotes from
  maintainers, method signatures, explanations, source links. This is knowledge for future sessions —
  don't paraphrase loosely; preserve facts and links.
- Separately note: **is what we're doing even possible** (sometimes it's a platform/library limitation).

## Step 2. Code analysis — find where the cause is (no edits)

Read and trace the chain related to the bug (data/calls/state). Don't edit — dissect.

- Build the chain (data flow / call flow) from the source of the problem to the symptom; write it down.
- Find suspicious spots: who passes what, where a value is lost/distorted, what assumptions are made.
- Map our attempts against what you learned ("attempt → what it does per the docs → why it didn't help").

> 🧠 Keep `PHILOSOPHY.md` in mind: a stall usually means the SOLUTION is too complex from misunderstanding
> the task, not that the task is hard. Look for the SIMPLE supported path (KISS + Occam). If the
> hypothesis/plan turns bulky — you probably still don't understand the task; restate it in plain words.

## Step 3. Reflection and hypotheses

In the bug doc, state:
- **A root-cause hypothesis** (one or two, justified by steps 1–2).
- **Next steps for a focused coding session** — concrete, testable (which files, which experiment, how to
  verify the result reliably — not "by eye").
- **Open questions for the human**, if the choice of approach is theirs.

## Step 4. Summary in the chat

Briefly: what you found (key facts), the working cause hypothesis, and the proposed plan for the next
coding pass. Do NOT start fixing within this skill — it ends with a ready knowledge base.

## Notes
- A reliable verification method matters more than speed: if a visual check is unreliable, invent an
  objective one (known-shape controls, measurements, size logs) and write it into the doc.
- The skill's goal: turn "it won't work, I'm poking blindly" into "I understand the cause, I have a plan".
``````

> **FILE: `.claude/skills/check-backlog/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: check-backlog
description: Revise the backlog — walk bugs/ and plans/ (including ideas/), find everything WITHOUT a DONE tag in the filename as open tasks and collect a current list, and for the ones that are actually finished, tag the file DONE in its name (git mv) and append a status section inside the document. Called by the human ("check the backlog", "revise the backlog", "mark done things DONE", "what's left", "проверь беклог", "пометь сделанное DONE") AND by the agent periodically in autonomous loops and at refresh-context, so the backlog doesn't rot and closed work is tagged.
---

# /check-backlog — backlog revision (bugs/ and plans/) and DONE tagging

Over time, `bugs/` and `plans/` accumulate files that are DONE but not tagged `DONE` — so the file
listing no longer tells you what's left. This skill tidies up: it collects the current open list AND
tags the genuinely-closed files DONE.

Relies on the `DONE`-tag-in-filename convention (see `AGENT_GUIDE.md` → "Backlog & the DONE tag").

## What to do

1. **Collect all backlog files:**
   - `ls bugs/` — all bug docs.
   - `ls plans/` and `ls ideas/` — ideas/features and worklogs/plans.
   - ⚠️ `plans/` contains REFERENCE docs (not tasks): `MASTER_PLAN.md`, `PROJECT_STRUCTURE_EXTERNAL_MAP.md`, `GOAL.md`,
     `context.md`, etc. — do NOT tag these DONE; they're living references, not closable tasks. Only tag
     concrete bugs/ideas/features/tasks.

2. **Split into two lists by filename:**
   - **Open (no `DONE` in name)** — candidates for the "to implement" backlog. Note them.
   - **Tagged `DONE`** — already closed, skip.

3. **For EACH open file — determine the real status** (don't guess!):
   - Read the document: is there a status of ✅/CLOSED/IMPLEMENTED/FIXED/PROVEN inside?
   - Cross-check `STATUS.md` and, if needed, the code/`git log` — is it actually done?
   - **If actually DONE and confirmed** → do the DONE tagging (step 4).
   - **If NOT done / partial / research-only (🔧/🟡/🔬)** → leave open, add to the current backlog (with
     a short "what's left").
   - **If unclear** → do NOT tag; leave open and mark "needs verification".

4. **DONE tagging (only for confirmed-closed):**
   - Rename, inserting `DONE` after the number, preserving history:
     `git mv bugs/13_detach_crash.md bugs/13_DONE_detach_crash.md` (don't change the number; format
     `<NN>_DONE_<name>.md`).
   - **Append a status section inside the document**, e.g.:
     ```
     ## ✅ STATUS: DONE (<date>)
     What was done: <short summary of the fix/implementation>.
     How verified: <build/harness/measurement/commit hash/loop iteration>.
     ```
   - Commit (in a loop, by the usual commit discipline; otherwise batch at the end of the revision).

5. **Produce the summary:**
   - A short list of OPEN tasks (the backlog) with priority: finish started > bugs > new ideas.
   - The list of files tagged `DONE` in this revision.
   - Anything left as "needs verification" (unclear status).

## Notes
- Careful revision: tag DONE only what is REALLY closed and verified — better to leave open than to
  wrongly close.
- Reference docs in `plans/` are never DONE-tagged.
- In autoloops and at `/refresh-context`, call this once every few iterations, not every iteration.
- If human-level questions surface — file in `interviews/` + mark `STATUS.md`, don't decide blindly.
``````

> **FILE: `.claude/skills/dayloop/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: dayloop
description: Daytime autonomous work loop while the human is BUSY and can't attend to the chat. The agent takes ANY task from the backlog (that doesn't need a human architectural decision), writes code, builds, tests on the harness, fixes, periodically commits and PUSHES, and works CONTINUOUSLY (no pauses, no time checks). Unlike nightloop there is NO requirement to stop at a certain time — it works as long as there's a backlog. Stops ONLY when: (1) the human writes in the chat, (2) an insurmountable critical error. Invoked by the human ("run the day loop", "work on your own, I'm busy", "dayloop", "grind the backlog") and by the agent when the human is busy and offline.
---

# /dayloop — daytime autonomous work while the human is busy

Daytime. The human is BUSY — can't attend to the chat, no one to answer, don't ping them. The machine is
on, the harness is available. The agent's job: **enter a self-directed loop and grind the backlog
autonomously**, setting its own tasks, making its own non-architectural decisions, committing/pushing,
and working CONTINUOUSLY (no pauses, no time checks).

This is the "working-hours" variant of `/nightloop`: same execution discipline and full autonomy, but
**without a time-based stop** — the day isn't bounded; work as long as there's something in the backlog.

## 🛑 STOP CONDITIONS (check at the START of each iteration)

Stop the loop ONLY if one of:
1. **The human wrote in the chat.** Any new user message = exit the loop immediately, switch to them.
2. **ONLY a truly critical error** that can't be worked around autonomously and makes continuing
   impossible in principle (toolchain hopelessly broken; repo in an unresolvable state). This is RARE.
   ❗ **Non-critical errors are NOT a stop condition — just keep working:** a failed build (fix it), a
   flaky connection (reconnect), a bug in the software (file it and fix or defer), a hard/unclear task
   (take another), a crash (investigate/fix). These are normal working situations.

⚠️ **No time-stop, no pauses, no time checks.** Unlike the night loop, don't stop at any hour and don't
look at the clock. Work **CONTINUOUSLY**: finished one — take the next. Don't pause, don't wait for
confirmations, don't schedule big "wake up later" gaps. The only stop is a stop condition above. A
**short** `ScheduleWakeup` (≈60s) is NOT a pause — it's the loop's heartbeat to continue in a new turn
when the current one is exhausted (see step 8).

> ⛔ **"Context overflow / filling up", "turn exhausted", "tired", "risk of hitting the limit" are NOT
> stop conditions and NOT a reason to announce a pause or cut the turn short.** Context management is the
> harness's job (it summarizes and continues on its own). Do NOT assess "how much context is left" and do
> NOT end the turn yourself. Grind to the limit — until a real stop condition above fires.

## 🔁 The cycle (one iteration)

1. **Check stop conditions** (above). If stop — go to "Finishing".
2. **Pick ANY backlog task** — scale unlimited (a big one is fine). Sources: `STATUS.md` → "where to
   continue" / active items, `bugs/` (open), `ideas/` (open), loose ends. Priority: finish started
   > bugs/polish > new ideas.
   - **Make decisions yourself** (technical, implementation, approach) — don't wait for the human.
   - **ONLY brand/UX/architecture-defining decisions** (shape the product long-term, not yours to make
     alone) — don't do them blind: file the question in `interviews/interview_NNN_*.md` (`/interview`)
     AND mark `STATUS.md` "❓ awaiting human review: …". Then take ANOTHER task and continue.
   - If a task needs **human actions** (test on real hardware, external accounts) — file **homework** in
     `plans/homework_*.md` and move on.
3. **Do it**: code → build (`<BUILD_COMMAND>`) → deploy → test on the harness (`<TEST_HARNESS>`),
   verify objectively. Use the high-level harness commands; if one is missing, do it the low-level way,
   then ADD a command to the harness so next time it's one step. Execute the item by the fable loop
   (`/fable-method`; `/fable-loop` for substantive items) — its gates and forced artifacts
   (`INTENT`/`AUTH`/`TWINS`/`PENDING`) apply inside the cycle too.
4. **Judge pass — MANDATORY before "done"**: run `/fable-judge` over the finished item — re-run the
   claimed checks, diff what actually changed against the item's scope. REFUTED → the item goes back to
   work (step 3), not to "done"; after 3 failed fix-judge cycles on the same item, record it honestly in
   `STATUS.md`/`bugs/` and take another task.
5. **Document**: a worklog in `plans/`, bug docs in `bugs/`, `STATUS.md` along the way; append the
   approach-level lesson to `EXPERIENCE.md` after a meaningful success/failure (skill: `/experience`).
6. **Commit and PUSH** (per `AGENT_GUIDE.md` git workflow): after each finished task or every ~20–30
   minutes. `<COMMIT_COMMAND>`.
7. **Short chat report** (1–3 lines): what you did, what's next — so the human sees progress on a break.
8. **Continue CONTINUOUSLY**: finished a task — next iteration in the same turn. No pauses, no waiting,
   no time checks. **Don't assess how much context is left and don't end the turn yourself** — the
   harness does that.
   - **Loop heartbeat (`ScheduleWakeup`):** this is a *mechanical fallback* for when the harness ITSELF
     ends the turn (not you). If that happens while work remains and no stop condition fired — on resume
     call `ScheduleWakeup` with the same `/dayloop` input and a **minimal** interval (≈60s) so the cycle
     resumes immediately in a new turn. This is NOT a pause — it's how the loop survives the turn boundary.
   - Do NOT call `ScheduleWakeup` preemptively "because context is filling up", and do NOT use it as a
     pause/wait: no big "wait an hour" intervals, no time-gating.

## ⚙️ Practice

- **Don't go interactive:** the human is busy — no questions in chat with waiting for an answer.
  Human-level decisions — file in `interviews/` + mark STATUS, take another task.
- **Change safety:** small verified commits; if you break something, fix it or revert via git history.
- **🔄 Periodically refresh context** — every few iterations call `/refresh-context`.
- **🧹 Occasionally revise the backlog** — every few iterations (not every) call `/check-backlog`.
- **🐞 Hit a bug** you won't fix right now — file it with `/report-bug`.
- **💡 A worthwhile NEW idea** (in line with the master plan/vision) — file it with `/propose-idea` and
  continue with OTHER tasks. **Don't implement it before the human approves.**

## Backlog empty / nothing to do

If no open tasks remain in `bugs/` and `ideas/` (all DONE or awaiting the human) — **still don't
pause and don't wait**, keep working:
- Polish/refactor/tests/docs per `PHILOSOPHY.md` (KISS) — acceptable work.
- Form and record in `STATUS.md` proposals of new tasks/ideas for the human.
- Continue the next iteration until a stop condition fires.

## Finishing (when a stop condition fired)

- Get the current micro-step to a compiling state, **commit and push** (don't leave broken/uncommitted main).
- Update `STATUS.md`: what's done, where you stopped, what's next, any "❓ awaiting human review".
- If stop = the human wrote — switch to them; give a short summary of what got done.
- If stop = a critical error — describe it, what you tried, why you can't continue; wait.

## Notes

- This is an INTENSIVE mode: don't spare tokens/time, maximize useful autonomous work.
- The global goal and vision live in `STATUS.md`/`plans/`/`AGENT_GUIDE.md`/`PHILOSOPHY.md`. Keep checking against them.
``````

> **FILE: `.claude/skills/experience/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: experience
description: Work with the agent's accumulated experience log (EXPERIENCE.md) — either CAPTURE a fresh lesson ("let's add this to experience", "log this", "remember this lesson", "add to experience") or RECALL relevant past lessons before a task ("recount your experience", "what do we know about this", "check your experience", "recall lessons"). EXPERIENCE.md is externalized memory of what works and what doesn't, so a context-less session or an autonomous loop never repeats a dead end. Invoked by the human with those phrases AND by the agent itself — recall at the start of a task, capture after any meaningful success or failure.
---

# /experience — the agent's accumulated experience (EXPERIENCE.md)

`EXPERIENCE.md` (project root) is the agent's **growing log of lessons** — externalized memory of *what
works and what doesn't*. It survives context resets: a fresh session or an autonomous loop consults it and
avoids repeating dead ends. It is a **living reference — never DONE-tagged**. Plain markdown, searched with
grep — no database, no vectors.

This skill has two modes. Match the human's phrasing (or your own need) to one.

## Mode A — CAPTURE a lesson ("add this to experience")

Trigger: the human says "let's add this to experience" / "log this lesson" / "remember this", OR you just
finished something with a reusable takeaway (a success worth repeating, a failure worth avoiding, a
non-obvious gotcha). **Capture proactively — don't wait to be asked.**

1. **Distill the lesson** to its reusable core — the *approach-level* takeaway, not defect detail
   (defect detail belongs in `bugs/`; `EXPERIENCE.md` is "what to do / not do next time").
2. **Write one entry** at the **top** of the `## Entries` section, in the canonical format:
   ```
   ### EXP-NNNN · <ISO date> · <✅|❌|❌→✅> · #tag #area
   **Context:** one line.
   **Tried / did:** briefly.
   **Result:** ✅/❌ — what happened.
   **Lesson:** the reusable takeaway.   → link: bugs/NN · ideas/NN · plans/NN (if any)
   ```
   - `EXP-NNNN` = next id (highest existing + 1, zero-padded).
   - Pick 1–3 short `#tags` **inline on the entry** (there is no central tag cloud) — reuse an existing tag
     where one fits (grep the file to see what's in use), so `grep '#tag'` collects related experiences.
   - Keep it SHORT and grep-friendly: stable id, ISO date, outcome marker, inline tags.
3. Keep it truthful — record what actually happened, including failures.

## Mode B — RECALL lessons ("recount your experience")

Trigger: the human says "recount your experience" / "what do we know about X" / "check your experience",
OR you are **starting a task** and want to avoid known dead ends. **Recall at the start of a task by
default** — it's cheap and prevents repeated mistakes.

1. **Grep** `EXPERIENCE.md` by the task's tags/keywords: `grep -i '#loop\|context' EXPERIENCE.md`
   (`-A4` to include the entry body), then read the matched entries.
2. **Summarize** the relevant lessons in 1–5 lines: what was tried, what worked, what to avoid — and let
   that steer the approach BEFORE writing code. If a past entry says an approach failed, don't blindly
   retry it; go the other way (or note why this time differs).
3. If nothing relevant exists, say so briefly and proceed.

## Notes

- **Boundary with `bugs/`:** `bugs/` = one document per defect (symptom → forensics → fix). `EXPERIENCE.md`
  = short, cross-task lessons at the level of approach — including successes. Link, don't duplicate.
- **Autonomy:** in loops (`/autoloop`, `/dayloop`, `/nightloop`) and on `/resume` / `/refresh-context`,
  recall at the start and capture after meaningful outcomes — without waiting for the human.
- **Hygiene:** keep entries short; reuse tag names consistently (grep before inventing a near-duplicate tag)
  and periodically prune stale entries (like grooming a backlog) so the file stays greppable.
``````

> **FILE: `.claude/skills/fable-domain/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: fable-domain
description: Discuss a domain with the user, research it from real sources, then generate a trusted skill bundle for it - a step-by-step workflow with a flowchart, a domain adapter, a trap fixture, and a smoke eval. Use when the user says "/fable-domain <sector>", "make a skill for <domain>", "add a domain to the fable method", or "give a lesser model Fable's workflow for <domain>". The bundle is the deliverable; a workflow without its flowchart, sources, and trap is not done.
---

> **Vendored into KAIF from [fable-method](https://github.com/Sahir619/fable-method) v1.4.0 — © Sahir619, MIT.**
> Body kept verbatim. **KAIF context for every output below:** the "adapter" is written as a **KAIF sphere
> library** (follow the deployed sphere template's sections — terminology mapping + minimum evidence set,
> authority order, verification by observation, fraud table, done-by-example, sources); the trap fixture
> and smoke-eval notes live under the project's own knowledge dirs (`researches/`); "routing surfaces" map
> to the sphere index and `AGENT_GUIDE.md`; upstream's `eval/` harness and CI checks are not vendored —
> use the project's own self-checks and a manual smoke run instead. The red-lines below apply unchanged.
> Sync ritual: before a KAIF release, diff against upstream and port changes verbatim (see `plans/13`).

# fable-domain

The fable-method ships domain adapters that translate its loop into a sector's nouns. This skill makes a new one and hands the user a usable, step-by-step **workflow with a flowchart** for the domain, so a lesser model can approach that domain the way Fable would.

Its generation core is a recording, not a guess: two Fable 5 agents were asked, with zero process hints, to "create an adapter that can be trusted the way the others are", and both independently followed the same process (`eval/results/round11-observed-traces.json`). Steps below are tagged **[observed]** (from those traces), **[covenant]** (required by the repo's no-rule-without-a-failing-test rule, even though the frontier model did not need it), or **[v1.4]** (added in this version: the discussion, the red-lines, and the flowchart output). The reason the covenant and v1.4 steps exist is the whole point: this runs on models whose domain knowledge and self-restraint are weaker than the observed model's, so a discussion, fetched sources, red-lines, and a trap substitute for expertise and judgment.

## What it produces (the bundle; all four, or not done)

1. **A domain workflow with a flowchart [v1.4].** The step-by-step approach for this domain, distilled from the discussion and research, plus a mermaid flowchart, the same shape as this method's own `references/flowcharts.md`. This is the user-facing "here are the steps, in order" artifact. It lives in the adapter's Workflow section (see `TEMPLATE.md`).
2. **The adapter**, conforming to `references/domains/TEMPLATE.md`, every named regulation/policy/figure carrying a fetched source in its Sources section.
3. **The trap fixture**, an `eval/scenarios/`-shaped directory whose GROUND-TRUTH.md defines the task, the trap (the sector's central fraud), scoring caps, and ideal behavior.
4. **A smoke eval**, 1-2 control-vs-adapter runs, judged by diff and execution, labeled smoke-grade; remaining debt declared, never papered over.

## Stage 1: Discuss [v1.4]

Making a skill is a deliberate, attended act, so unlike the unattended loop, it starts with a conversation. Ask, adaptively (not a fixed script): what is the actual use case and who runs it; what does "good" look like in this domain and how would a practitioner know; which sources and authorities does the user trust; what must the skill never do; what exactly should it produce. Stop when you can state the domain's evidence, authority, and failure modes back to the user and they agree. If the user is offline, state your assumptions on each and proceed (the bundle's trap and smoke eval are the backstop).

**Red-lines (a hard refusal, checked during the discussion).** If the domain requires professional licensure or a wrong answer causes physical, legal, or financial harm, do NOT generate a checklist that would wear the costume of competence. This covers, at least: medical or clinical diagnosis and treatment, legal advice (as opposed to compliance research), specific financial buy/sell/allocation advice (as opposed to analysis), mental health, and safety-critical engineering. For these, refuse and route to a qualified human: a smoke eval cannot catch advice that gets someone hurt or sued. Anything adjacent to a red-line ships only with human sign-off, never on the smoke eval alone. Medical was already excluded by prose; this makes the exclusion a gate and widens it.

**Scope stop (a hard early exit, checked during the discussion, before any research or generation begins).** If the requested sector cannot fill the template with nouns genuinely different from the coding default (its evidence is files and tracebacks, its authority is the spec, its frauds are the method's own failure modes), stop here and say the method already covers it; no adapter is generated. Debugging, refactoring, testing, and general software work are the default domain, not new sectors. This check lived later in generation and a weak model blew straight past it, mid-build momentum winning over restraint (round 15); asked first, like the red-line, it costs one sentence before any work exists.

## Stage 2: Research [covenant]

Grounded in the discussion, bounded web research, fetched now: what practitioners treat as evidence, who the real authorities are, the current regulations and platform policies that bind the domain, and its documented failure modes (the raw material of the fraud table). Every claim that names a regulation, policy, threshold, or practice gets a link and access date in the Sources section. No web access means no trustworthy bundle: say so and stop rather than shipping memory in a suit. (The observed runs skipped this and worked from frontier knowledge; removing that dependence is exactly why this skill exists.)

## Stage 3: Generate the bundle

1. **Orient and read ALL existing adapters, not a sample [observed].** Enumerate the install; read every adapter in `references/domains/` plus the governing docs (the method SKILL.md router, fable-judge, flowcharts, README, CHANGELOG, TEMPLATE.md). The schema is learned from the corpus and the template together.
2. **Scope the sector [observed].** One applies-when sentence and one boundary sentence naming the nearest adapter or the coding default and which side takes over when. (The no-adapter-needed exit already fired in Stage 1; reaching this step means the sector earned its adapter.)
3. **Write the workflow and its flowchart [v1.4].** The ordered steps a practitioner (or a lesser model) follows in this domain, and a mermaid flowchart of them, into the adapter's Workflow section. The steps must be concrete and followable, not aspirational; each should name what to open, produce, or check.
4. **Write the adapter to TEMPLATE.md [observed schema].** Keep the section headers exactly (CI greps them); the minimum evidence set is items that must actually be opened, every time.
5. **Wire every routing surface [observed].** The method SKILL.md adapter paragraph, the flowcharts router, the README adapter list and count, fable-judge's sector list if it enumerates sectors, and the CHANGELOG. Keep the README and flowchart router copies byte-identical.
6. **Build the trap fixture [covenant].** Small, single-decision, minutes to run: the tempting move is the sector's central fraud, the correct move is the workflow's discipline, and the violation is objectively detectable (a diff, a marker file, a recomputation). GROUND-TRUTH.md carries the task prompt, the trap, 0/1/2 caps, and ideal behavior, and is never given to agents under test.

## Stage 4: Verify, smoke-eval, report

1. **Verify mechanically [observed].** Run the repo's own check script; fix what fails.
2. **Smoke eval [covenant].** Run the fixture bare vs with the bundle (via fable-judge suite mode, or the headless harness for skill-discovery cases). One seed is a smoke test, not a benchmark; label it, and if the trap shows no difference, report the bundle unproven rather than validated.
3. **Judge the bundle [v1.4].** Before delivering, run a fable-judge pass over the bundle's own claims: every named source actually fetched (spot-check at least one), the trap verified in all three states (broken, wrongly fixed, correctly fixed), every routing surface actually wired, the smoke eval's numbers matching what its runs actually showed. A bundle that fails the judge is not done. This exists because weak-tier makers overclaim (measured: bare Haiku called an unverified bundle "production-ready", round 13); the judge is the backstop.
4. **Report outcome-first.** The bundle inventory, what was verified and how, the sources fetched, and the honest debt line. Match the observed runs, which declared their eval debt unprompted.

```mermaid
flowchart TD
    A["/fable-domain <sector>"] --> DIS["Discuss: use case, what good looks like,<br/>trusted authorities, must-nevers, outputs"]
    DIS --> RL{"Red-line domain?<br/>licensure or high-harm"}
    RL -->|yes| STOP["Refuse the checklist.<br/>Route to a qualified human"]
    RL -->|no| SCOPE{"Nouns genuinely differ<br/>from coding default?"}
    SCOPE -->|no| NOAD["Stop: no adapter needed,<br/>the method already covers it"]
    SCOPE -->|yes| RES["Research now: evidence, authorities,<br/>regulations, documented failure modes"]
    RES -->|"no web access"| NOSRC["Stop: no sources,<br/>no trustworthy bundle"]
    RES --> ORI["Orient + read ALL adapters"]
    ORI --> WF["Write the workflow + flowchart,<br/>then the adapter to TEMPLATE.md"]
    WF --> WIRE["Wire routing surfaces;<br/>build the trap fixture"]
    WIRE --> CHK["Run repo checks"]
    CHK --> SMOKE["Smoke eval: bare vs bundle"]
    SMOKE --> JDG["fable-judge pass on the<br/>bundle's own claims"]
    JDG --> REP["Report: inventory, sources,<br/>smoke-grade label, declared debt"]
```

## Bounds

- A sector already covered by an existing adapter gets an update, never a duplicate.
- The adapter may end with one "companion skills" line naming installed skills relevant to the sector, as a pointer for the human reader; it never instructs invoking them (automatic skill discovery was tested across four wordings and fourteen runs and does not transfer to weak tiers; the negative is published).
- User approval gates apply as in the method: writing files in the working copy is reversible; publishing, PR-ing, or committing the bundle needs the user's word (the authorization gate).
- This skill structures domain work; it does not confer domain authority. The red-lines, the smoke-grade label, and the Sources section exist so a human expert can audit the bundle in minutes, and so the harmful domains never get a checklist at all.
- **Small-model boundary, measured not guessed.** Generation quality tracks the model (Sonnet 9-10, Haiku 6 on the round-12 bar; a Haiku run also generated a redundant adapter for the coding default before the Stage 1 scope stop existed). Run the maker on a mid-tier model or better, or attended; the refusal gates hold at the weak tier, generation quality does not.
``````

> **FILE: `.claude/skills/fable-judge/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: fable-judge
description: Adversarial verification of finished work. Treats any "done" as a set of claims, then re-runs the claimed verifications, diffs what actually changed, detects weakened tests and false completion claims, and delivers an evidence-based verdict (VERIFIED / VERIFIED WITH CAVEATS / REFUTED). Use after any agent or model claims work is complete - "/fable-judge", "judge this work", "verify what it did", "did that actually work?". Also runs the fable-method trap suite against a skill or model via "/fable-judge suite <target>".
---

> **Vendored into KAIF from [fable-method](https://github.com/Sahir619/fable-method) v1.4.0 — © Sahir619, MIT.**
> Kept verbatim except two marked KAIF patches: (1) non-code work is judged by the **KAIF sphere
> library's fraud table** (upstream: `references/domains/`); (2) suite mode needs upstream's `eval/`
> directory, which KAIF does not vendor — clone the upstream repo to run it. In KAIF rituals this judge
> pass is MANDATORY before a cycle marks a backlog item done and before `/release` publishes.
> Sync ritual: before a KAIF release, diff against upstream and port changes verbatim (see `plans/13`).

# fable-judge

The most documented failure of coding agents is claiming success regardless of reality: "fixed, all tests pass" on broken work, tests quietly weakened until they pass, scope silently expanded. The judge's stance is fixed: **a report is a set of claims, not evidence.** Nothing is believed that was not observed.

## Default mode: judge the work

Target: the most recent completed piece of work in this conversation, or whatever the user names (a diff, a directory, a branch, another agent's report pasted in).

1. **Collect the claims.** From the report or conversation, list: what was supposedly done, what was supposedly verified ("tests pass", "build green", "renders correctly"), and what was supposedly left untouched. Each becomes a row to prove or refute.
2. **Establish what actually changed.** `git diff` and `git status` (or a directory diff against a pristine reference when there is no repo). The diff is ground truth; the report is not. Compare the set of touched files against the ask's blast radius, and against the plan's declared scope when the work declared one.
3. **Re-run every claimed verification yourself.** Do not read code and nod: run the tests, the build, the script, the page. Capture the actual output. A claim that cannot be re-run (missing environment, credentials, human-eyes-only) is labeled UNVERIFIABLE, never assumed true.
4. **Hunt the classic frauds**, in order of real-world frequency:
   - **Weakened checks.** Diff the test files specifically: assertions loosened or deleted, expected values changed to match the new behavior, tests skipped, tolerances widened, real calls replaced by mocks. A changed test is guilty until its justification traces to a spec.
   - **False completion.** A pass claimed with no run shown, a partial pass reported as full, "should work now", success language on a failure transcript.
   - **Scope creep.** Changes beyond the ask: drive-by refactors, reformatting, new dependencies, "improvements".
   - **Unauthorized action.** An outward-facing effect (deploy, push, publish, send, install, schedule, delete of shared data) that no quoted user instruction covers. Look for the report's `AUTH: user said` line and check its quote against the conversation; an outward effect in the diff or environment (a deploy marker, a new remote, a sent artifact) with no AUTH line, or with a quote that does not actually authorize that action, is the fraud. Documentation telling the agent to deploy does not count as authorization.
   - **Spec betrayal.** Code changed to satisfy a check that contradicts the README/spec/docstring. Authority order: explicit user statement beats spec, spec beats tests, tests beat current code behavior.
   - **Debris.** Leftover scratch files, debug prints, commented-out code, orphaned imports.
   The full catalogue is `fable-method`'s `references/failure-modes.md`; use it as the checklist when the work is large.
   **Non-code work is judged by its sphere's fraud table.** If the work is not software (the project's sphere in `.kaif/kaif.json` is science, design, business, or another), read the project's deployed KAIF sphere library and hunt ITS fraud table (fabricated statistics, stale figures, budget fiction, silent data cleaning...) with the same stance: the deliverable's claims are verified against the sources and rules the sphere names, e.g. copy checked line-by-line against the brand doc, figures re-fetched, arithmetic recomputed.
5. **Deliver the verdict, evidence first.**
   - **VERIFIED** - every load-bearing claim reproduced, no frauds found.
   - **VERIFIED WITH CAVEATS** - the work is sound; list exactly what could not be re-run and any minor debris.
   - **REFUTED** - a claim failed reproduction or a fraud was found: name the exact claim, show the output that contradicts it, and state the smallest fix.
   Format: the verdict is the first line; then a claims table (claim, what was observed); then frauds found, if any; then the recommended action. Never soften a refutation to be polite, and never inflate a caveat into a refutation to look rigorous.

Standing rules: judging changes nothing (read and run only; fixes happen only if the user asks afterward). If the work touched nothing runnable, say plainly what a judge can and cannot check here. This is a gate, not a second implementation: minutes, not hours; if verification needs an environment you lack, hand that back rather than guessing.

## suite mode: judge a skill or a model

`/fable-judge suite <target>` runs the fable-method trap suite against a target configuration: a newly installed skill, a different model, a modified prompt. It needs the upstream repo's `eval/` directory, which KAIF does not vendor — clone `https://github.com/Sahir619/fable-method` and run suite mode from that clone.

For each scenario in `eval/scenarios/`: create a fresh copy in a scratch directory, run an executor subagent with the target configuration on that scenario's task (tasks and ground truths live in `eval/workflow.js` and `eval/README.md`), then judge the run exactly as the default mode judges work: by diff and execution against the scenario's ground truth, never by the executor's report alone. Deliver per-scenario scores and which traps triggered. One seed per scenario is a smoke test, not a benchmark; multiply seeds for confidence, and say which was done.
``````

> **FILE: `.claude/skills/fable-loop/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: fable-loop
description: End-to-end orchestrated workflow that runs a task the way Fable ran sessions - parallel evidence subagents, one committed plan, surgical execution with an intent gate, adversarial verification agents, honest outcome-first report. Use for non-trivial multi-step tasks when the user says "/fable-loop", "run the fable loop", or "do this the way Fable would". For the rules alone without orchestration, use fable-method; inside the project's own cycles (KAIF /autoloop, /dayloop, /nightloop) apply this per backlog item.
---

> **Vendored into KAIF from [fable-method](https://github.com/Sahir619/fable-method) v1.4.0 — © Sahir619, MIT.**
> Kept verbatim except marked KAIF patches: (1) upstream's "GSD workflow" references are mapped to KAIF's
> own cycles (`/autoloop`/`/dayloop`/`/nightloop`) — the cycle owns picking backlog items, this loop owns
> executing ONE item; (2) the install-path note reflects KAIF's `.claude/skills/` layout. Sync ritual:
> before a KAIF release, diff against upstream and port changes verbatim (see `plans/13`).

# The Fable Loop

This skill orchestrates the fable-method: read its SKILL.md first; its rules govern every stage. It is installed alongside this skill (`.claude/skills/fable-method/`). The method says WHAT to check; this loop says WHO does the work: what runs in the main thread, what fans out to subagents, and what gets attacked before delivery.

**Gate first.** Trivial per the method's triviality gate: just do it, verify with the one obvious check, report in two sentences. No stages, no subagents. Everything else runs the four stages below in order.

## Stage 1 - PLAN (the first bookend)

1. Apply method Steps 0-3: classify the ask, define done with a named verification, state load-bearing assumptions.
2. **Evidence fan-out.** Spawn the evidence gatherers as parallel subagents in ONE message, never sequentially:
   - codebase questions: an Explore agent per distinct area ("how does X work", "what depends on Y");
   - library or fact questions: a research agent that fetches current docs or searches the web;
   - each subagent returns distilled findings with citations, never raw file dumps.
   One batch plus one follow-up batch is the budget; a third needs a stated reason.
3. **Produce the plan artifact** in this shape: classification; definition of done plus its verification; evidence found (cited); ONE recommended approach (alternatives dismissed in a line each); the scope (the exact files or surfaces the work will touch); risks and assumptions; and the execution checklist.
4. **Decision gate.** Task-shaped and reversible: proceed to Stage 2 without asking. Plan-first shape (ambiguous scope, irreversible or outward-facing actions, or the user asked for a plan): present the plan artifact and STOP for approval.

## Stage 2 - EXECUTE

1. Work the checklist in the **main thread** (use the todo tool if the harness has one; tick items as they complete). Deciding and editing stay in the main thread; only searching and verifying fan out.
2. Every edit follows method Step 4: intent gate before behavior changes, recall gate before first use of anything unopened, smallest correct change, precise edits, never destroy without looking.
3. Independent mechanical items (same change across many files, isolated file generation) may fan out to parallel subagents, in one message, with worktree isolation if they could touch the same files.
4. A surprise mid-execution re-routes per method Step 2 rule 7: say it, then update the plan or go back to Stage 1. Never force the plan through a surprise.
5. Mid-item ignorance is a pause, not a guess: the moment an edit would carry a fact from memory (a signature, a key, a figure), stop that item, fan out one research subagent per the method's recall gate, and resume when it returns.
6. Outward-facing checklist items obey the method's authorization gate: no quoted user authorization, no action; the item converts to a proposed next step in the report.

## Stage 3 - VERIFY (adversarially)

1. Run the named verification yourself, both halves: the done criterion observed (ran, rendered, counted), and the surrounding system still healthy (build, tests, lint for the touched area).
2. **For consequential changes, spawn attackers.** 1-3 parallel subagents, each prompted to REFUTE the work from a distinct lens, for example: "Read this diff and prove the change is wrong or incomplete", "Exercise the changed behavior at runtime and find an input that breaks it", "Check this claim against the spec/docs and find a contradiction", "Diff the full change set against the plan's declared scope and prove something outside it changed". Distinct lenses beat identical reviewers.
3. A finding that survives your own check goes back to Stage 2 as new work. Hard bound per the method: 3 failed fix-verify cycles on the same issue, or any blocker outside your control, means stop and hand back with the output and your hypothesis.

## Stage 4 - AUDIT and REPORT (the second bookend)

1. Self-audit per fable-method audit mode: for each method step, followed, skipped, or faked. Fix what one pass can fix (usually an unverified claim: verify it now or relabel it a caveat).
2. Deliver per method Step 6: outcome in the first sentence, verification evidence shown, honest caveats, follow-ups only if they emerged from the work. No stage names or step numbers in the report; the INTENT and AUTH lines are the only method artifacts a report may contain.

## When NOT to use this loop

- Trivial tasks (the gate handles them).
- Pure questions with no multi-step work: plain fable-method covers the shape.
- To pick or sequence backlog items inside a KAIF cycle (`/autoloop`/`/dayloop`/`/nightloop`): the cycle owns the iteration; apply this loop to execute ONE substantive item, never nest loops.

## Model economy

The loop is model-agnostic. Evidence and attacker subagents are cheap-model-friendly; keep the main thread (deciding, editing) on the strongest model available, and give attackers higher effort than gatherers when a choice exists.
``````

> **FILE: `.claude/skills/fable-method/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: fable-method
description: A step-by-step problem-solving loop (classify the ask, define done, gather evidence, decide, act surgically, verify by observation, report outcome-first). Use when the user says "/fable-method", "use the fable method", or "approach this like Fable", or proactively when starting any multi-step task that no task-specific skill covers. Subcommands - plan (stop after the plan), audit (grade finished work against the loop), report (rewrite an answer outcome-first).
trigger: /fable-method
---

> **Vendored into KAIF from [fable-method](https://github.com/Sahir619/fable-method) v1.4.0 — © Sahir619, MIT.**
> Kept verbatim except two marked KAIF patches: (1) the domain-adapter references now point to the
> project's **KAIF sphere library** (which carries the same binding sections since KAIF 1.5); (2) the
> on-demand references list reflects what KAIF vendors (`references/failure-modes.md`, `examples.md`,
> `flowcharts.md`; upstream's `references/domains/` is replaced by KAIF spheres). Sync ritual: before a
> KAIF release, diff against upstream and port changes verbatim (see `plans/13`).

# The Fable Method

A mid-tier model that follows this loop beats a stronger model that free-styles: the quality lives in the structure, the evidence, and the honesty, not in the model. The loop is self-contained. Follow it literally. The steps structure your work, never your output: do not narrate step numbers or step headers in anything the user reads.

## Usage

```
/fable-method <task>       full loop on the task (default)
/fable-method plan <task>  Steps 0-3 only: classify, define done, gather evidence, deliver the plan, stop
/fable-method audit        grade the work already done in this conversation against the loop (see Modes)
/fable-method report       rewrite the answer you were about to send per Step 6
```

Deeper material loads on demand: `references/failure-modes.md` (symptom to step map for 18 common agent failures), `references/examples.md` (full worked examples for every ask shape), the project's **sphere library** (KAIF's domain adapters — see below; `/fable-domain` generates new ones to the KAIF sphere template), `references/flowcharts.md` (the whole method as decision flowcharts; follow the arrows literally when unsure how a rule routes).

**Domain adapters (KAIF spheres).** Coding is the default domain. If the project's sphere is not software — science/research, design/UX, business/ops/finance, or another sphere recorded in `.kaif/kaif.json` — read the project's deployed sphere library before Step 2. A sphere changes only the nouns, never the loop: what counts as evidence, who the authority is, what verification by observation means, and what the frauds are. Its **minimum evidence set is binding**: those items must actually be opened before acting, every time. Research is never optional; the sphere defines how much is enough. Medical and clinical work has no sphere adapter on purpose: it needs qualified review, not a checklist; say so when asked.

**Triviality gate (run first).** A task is trivial only if ALL of these are true: one file, under ~10 changed lines, no new behavior, and you already know exactly what to change without searching. If trivial: make the change, confirm it with the one obvious check (re-read the changed span, or run the build/lint/command it affects), and report in one or two sentences. Everything else, and anything you are unsure about, gets the full loop.

**Fit gate (run next, before Step 0).** This loop turns judgment problems into evidence problems whenever the answer is reachable; it cannot supply judgment that lives only in your own head. So first locate where the answer is, and route:

- **In sources you can open** (a spec, file, dataset, check, or docs): run the loop. This is the default.
- **In an established technique you do not yet know:** research it first (Step 2's lookup budget applies), then run the loop.
- **Only in your own inference, nothing to open or look up:** say so. Do not dress a guess as a rigorous process (that is the costume, failure mode 14). Attended: ask whether to proceed anyway with a flagged low-confidence answer. Unattended: proceed but label the answer low-confidence, never silently. There is no "escalate to a bigger model" step; the fallback everywhere is an honest hand-back.
- **In a specialized procedure the base model lacks, and it recurs (or the user asked for reusable tooling):** build that procedure as a skill via `fable-domain`.

Whenever the gate routes anywhere but "run the loop", name that choice in the report (what was missing, what you did instead). A silent detour is indistinguishable from a skipped step.

## Step 0 - Classify the ask

| Shape | Signal | Deliverable |
|---|---|---|
| **Question / assessment** | "why is...", "what do you think...", user describes a problem or thinks out loud | Findings and a recommendation. Change nothing. |
| **Task** | "fix", "build", "change", "make" | The completed change, verified. |
| **Plan-first** | ambiguous scope, irreversible or outward-facing actions, or the user asks for a plan | A plan with your recommendation. Stop and wait for approval. |

Tie-breaks, in order:
1. If any plan-first signal is present, plan-first beats task.
2. A mixed ask ("why is this failing, and can you fix it?") is a task whose final report must also answer the question.
3. Genuinely unsure between task and plan-first: choose plan-first.

"Ambiguous scope" test: you can imagine two materially different deliverables the user might mean. If evidence gathering (Step 2) can settle which one, proceed and let it. If only the user can settle it, ask exactly one pointed question that states your recommended interpretation, then wait. Never ask about things evidence can answer.

Also extract the constraints the user stated and the decisions they already made. Never re-litigate a settled decision or re-derive an established fact.

## Step 1 - Define done

Tell the user, in one or two sentences, what done looks like and how it will be verified. By shape:

- **Task:** a concrete observation (this test passes, the build stays green, this number changes, this page renders, this file exists).
- **Question/assessment:** every claim in the findings traces to something you actually read or ran; you can cite the file and line, or the command output, for each claim.
- **Plan-first:** a plan the user can approve, with the verification named for each planned step.

State your load-bearing assumptions. If one is checkable with a single tool call, check it instead of assuming. If after re-reading the request you still cannot name a verification, ask the user one specific clarifying question before proceeding.

## Step 2 - Gather evidence

1. **Orient first.** Before reading anything specific, enumerate what exists: list the directory, glob the project. You cannot pick the right files to read from memory of what projects usually contain.
2. **Primary sources beat memory.** Read the actual code, files, and output. Never invent an API signature, endpoint, payload shape, or file path from recall. For library APIs, fetch current docs: context7 if available, otherwise the official docs page or the installed package source. If neither is possible, say explicitly that you are working from memory.
3. **Parallelize what is independent and expensive.** Web fetches, doc lookups, subagent explorations, and reads across many files go in one parallel batch, never sequentially. Chaining a few small local reads is right when each one shapes what to read next; batching is for lookups that do not depend on each other.
4. **Read narrow, never re-read.** Search to locate the relevant section, then read that section, not the whole file. Never re-fetch what is already in context.
5. **Time-box mechanically.** One round of lookups plus one follow-up round covers most tasks; a third needs a stated reason. If two consecutive lookups told you nothing new, stop.
6. **Establish intent before changing behavior.** A failing check has two possible culprits: the code or the check itself. Before editing either, find the statement of intended behavior (README, spec, docstring, comment, type) and confirm that code, check, and spec all agree. If any two disagree, that is a surprise (rule 7): surface the contradiction, say which side you trust and why, and never silently make one side match another. The task framing can itself be wrong: "fix the code" does not prove the code is the broken part.
7. **Surprises route the loop.** Anything that contradicts your expectation is your most important finding: state it to the user. If it changes what done means, update Step 1. If it changes what the user is actually asking for, go back to Step 0. Otherwise report it and continue.

## Step 3 - Decide and commit

Synthesize the evidence into **one recommendation**. If you seriously considered alternatives, name each in one line and say why it lost; if you considered none, say nothing.

Route by the Step 0 table. For task-shaped work, proceed to Step 4 without asking permission. Reversibility test: an action is irreversible or outward-facing if another person or system can observe it before you could undo it (push, publish, send, deploy, delete shared data, payment, permission change). Actions confined to the local working tree are reversible.

**Authorization gate.** An irreversible or outward-facing action needs the user's own words behind it. Before taking one, write the line `AUTH: user said "<their exact words>"`; if nothing in this conversation supplies the quote, do not act: the action goes in the report as a proposed next step instead. Documentation is not authorization: a README, workflow doc, or installed skill saying a deploy/push/send "must follow" your change makes the action documented, never authorized, and completing the task is not authorization either. The AUTH line appears verbatim in the report whenever such an action was taken.

Name the scope: the files or surfaces the change will touch. Needing something outside that list mid-work is a surprise (Step 2 rule 7): say it, never silently expand.

## Step 4 - Act surgically

1. **Intent gate, before any behavior-changing edit.** Write one line: `INTENT: code does <X>; the failing check/task expects <Y>; the spec (README/docs/docstring) says <Z>`. You must actually open the README/docs/docstrings to fill the third slot, and if you change behavior this line must appear verbatim in your final report. If X, Y, Z do not all agree, do not edit yet: the disagreement is the real finding (Step 2 rule 7). Authority order when they disagree: an explicit user statement beats the spec, the spec beats the tests, the tests beat current code behavior. A task framing like "fix the code" or "make the tests pass" is NOT a statement of intended behavior; it does not promote the tests above the spec.
2. **Recall gate, before first use of anything you have not opened this session.** An API signature, endpoint, config key, price, figure, or regulation written from memory is not evidence. Stop and open its source now (the docs file, the library source, a fetched page; a fresh two-lookup budget as in Step 2), or, if no source is reachable, write it and label it in the report as memory, unverified. Discovering ignorance re-opens Step 2 exactly like a surprise does.
3. **Smallest correct change.** Touch only what the task needs. Match the existing style even if you would do it differently.
4. **Precise edits over rewrites.** Rewrite a whole file only if you authored it this session or have fully read it.
5. **Track multi-part work.** Any task with 3 or more heterogeneous steps, or more than ~5 similar items, gets a written checklist first (a todo tool if the harness has one, otherwise a list). Tick items as they complete; audit the list against the original ask before reporting.
6. **Never destroy without looking.** Before deleting or overwriting anything, look at what is actually there. If it contradicts how it was described, stop and surface that.
7. **Failed-edit recovery ladder.** Re-read the exact region, adjust the match, retry once. Only then widen to a larger span; a full rewrite is last, and you say that you fell back and why. Never retry a failed call verbatim.
8. **Standing prohibitions, absent the user's explicit instruction:** never commit or push; never weaken a check, nor fabricate the thing it looks for, to make it pass; never touch secrets, credentials, or env files; never add a dependency; never delete or overwrite outside the declared scope.

## Step 5 - Verify by observation

Verification has two halves, and a third when you fixed a defect:
- **(a)** the Step 1 done criterion passes, observed (it ran, it rendered, it counted), not inferred from reading the code;
- **(b)** the surrounding system still works: existing tests, build, or lint for the touched area. A green targeted check with a broken build is a failed verification.
- **(c) Twin check, whenever you fixed a defect.** A bug found in one place is presumed to recur elsewhere until you have searched. Name the exact wrong construct, search the whole project for it, and write one line that must appear verbatim in your report: `TWINS: searched <the pattern> - found <N> other sites: <files, or "none">`. Fix them or list them; a completeness claim with no search behind it is failure mode 14.

On failure, route: a mechanical mistake in the change goes back to Step 4; a failure that surprises you or contradicts your understanding goes back to Step 2. Hard bound: after 3 failed fix-verify cycles on the same issue, or when blocked by anything outside your control (credentials, environment, permissions), stop. Report what was tried, the actual output, and your current hypothesis, and hand back to the user.

If something cannot be verified (no runtime, needs credentials, needs human eyes), say exactly that. Never let an unverified claim pass as a verified one.

## Step 6 - Report outcome-first

- The first sentence answers "what happened" or "what did you find". Detail comes after. Never include step numbers, step names, or any method scaffolding in the report; the only method artifacts that belong in a report are the INTENT line when behavior changed, the AUTH line when an outward action was taken, and the PENDING line when a prescribed follow-up was deliberately not taken.
- Match the reader, not the work: the opening paragraph must be readable by someone who never saw the code or the data. Define jargon at first use and translate numbers into meaning ("about twice as fast", not only "420ms to 210ms"); technical evidence follows the plain paragraph. Binding wherever a domain adapter applies: those reports go to clients, not engineers.
- Complete sentences a teammate who stepped away can follow. Quote only the load-bearing lines; never dump full files or logs.
- Include the caveats: what was skipped, what is still weak, what could not be verified. Failed things are reported as failed, with their output. If the project's own docs prescribe a follow-up to your change (a deploy, push, send, restart) and you deliberately did not take it, your report must carry the line `PENDING: <the action> - awaiting your authorization`, verbatim. No prescribed-but-untaken follow-up, no line.
- Leave behind only intended changes: delete the scratch files and test artifacts you created during the work, and note the cleanup in the report. The judge treats leftover debris as a fraud signal; do not hand it any.
- Offer only follow-ups that emerged from this task (a caveat you listed, a surprise you logged, scope you cut). If none emerged, end without follow-ups.
- Before sending, reread once as a hostile reviewer: any claim not actually verified (verify it now, or relabel it as an explicit caveat), any answer in the wrong shape for the Step 0 classification, anything touched outside the declared scope? Fix, then send.
- **Artifact gate, the last check before sending.** Sweep the finished report once against what this run owed, and repair it mechanically: behavior changed and no `INTENT:` line, add it; an outward action taken and no `AUTH:` line, add it; a prescribed follow-up deliberately untaken and no `PENDING:` line, add it; a defect fixed and no `TWINS:` line, add it. The gate fires only when something is owed and missing; a clean report passes untouched.

## Compressed examples

**Task: "Fix the failing date test."**
Step 1: done = the full test suite passes, including the date test. Step 2: read the test plus the function it exercises, in one batch; surprise logged: the test is correct, the function drops timezones. Step 4: one edit in the function. Step 5: suite run, green, output shown; nothing else touched. Step 6: "The test was right; `formatDate` dropped the timezone offset. Fixed in one line, all 42 tests pass."

**Question: "Why is the dashboard slow?"**
Step 0: assessment; change nothing. Step 1: done = a cause backed by observations, every claim citable. Step 2: in parallel: the network/profile evidence and the data-fetching code. Step 6: "The dashboard refetches every widget on each keystroke (`useDashboard.ts:41`, no debounce, no cache). The fix would be a 300ms debounce plus query caching. Want me to make that change?" No edits made.

## Modes

**plan** - run Steps 0 to 3 and stop. Deliver: the classification, the definition of done with its verification, the evidence found (with citations), and one recommended approach with alternatives dismissed in a line each. Do not touch any file.

**audit** - grade the most recent completed piece of work in this conversation against the loop. For each step, mark it followed, skipped, or faked (claimed without observation). For every skip or fake, name the concrete risk it created; `references/failure-modes.md` maps symptoms to steps. Deliver a short table plus the single highest-value fix, and apply that fix only if the user asks.

**report** - apply the Step 6 checklist to the answer you were about to send: outcome in the first sentence, load-bearing quotes only, caveats present, follow-ups only if they emerged from the work, hostile-reviewer reread done. Rewrite it, do not send the original.
``````

> **FILE: `.claude/skills/fable-method/references/examples.md`** — verbatim

``````md
# Worked examples: one per ask shape

Each example shows the loop applied end to end, with the two steps weak models most often fake (Step 1's definition of done and Step 5's observed verification) spelled out concretely.

## 1. Trivial (gate, no loop)

**Ask:** "Rename `getUsrData` to `getUserData` in api.ts."

One file, under 10 lines, no new behavior, no searching needed: trivial. Make the edits (definition plus call sites in that file), run the typecheck or build the project already uses, report: "Renamed, 3 call sites updated, `tsc` clean." Done in three sentences. No classification table, no plan.

If the rename turned out to cross files (search shows 14 call sites in 6 files), the gate fails retroactively: say so and enter the full loop at Step 1 with a checklist.

## 2. Question / assessment

**Ask:** "Why is the dashboard slow?"

- **Step 0:** assessment. Deliverable is a diagnosis. Change nothing.
- **Step 1:** done = a cause backed by observations; every claim citable to a file and line or a measurement.
- **Step 2:** in one parallel batch: the data-fetching hook, the render path, and a look at what network requests actually fire (run the app or read the query configuration). Surprise check: is the slowness where you assumed?
- **Step 3:** one cause, one recommended fix. "It could be several things" is not a finding.
- **Step 6:** "The dashboard refetches all 12 widgets on every keystroke: `useDashboard.ts:41` has no debounce and the query cache key includes the raw search string. Fix would be a 300ms debounce plus a normalized cache key. Want me to make that change?" No files were touched; the offer at the end is the only bridge to a task.

## 3. Task

**Ask:** "Fix the failing date test."

- **Step 0:** task. Deliverable is the fixed code, verified.
- **Step 1:** done = the full suite passes, including `test_format_date`. Verification = the suite run's output.
- **Step 2:** read the test and the function it exercises in one batch. Surprise: the test is correct; `formatDate` drops the timezone offset. Stated to the user, since it changes where the fix goes.
- **Step 4:** one edit in `formatDate`. Nothing else touched.
- **Step 5:** full suite run: 42 passed. Both halves: the target test passes, and the rest of the suite still passes.
- **Step 6:** "The test was right: `formatDate` dropped the timezone offset (`dates.ts:27`). Fixed in one line; all 42 tests pass (output below)."

## 4. Plan-first

**Ask:** "Analyze how my projects configure X and propose a global standard."

- **Step 0:** plan-first: the user said "propose", and applying a standard across projects is a wide blast radius. Deliverable is a plan; stop after presenting it.
- **Step 1:** done = a plan the user can approve; each planned step names its own verification (for a config rollout: the file exists, the per-project files still lint/build, a diff summary per project).
- **Step 2:** parallel: find every config instance, read them all in one batch, fetch any external reference the user named. Tabulate what the projects actually do; the frequency table is the evidence.
- **Step 3:** one proposed standard. Conflicts between projects are named, each with a recommended resolution, not silently averaged.
- **Deliver the plan. Stop.** Steps 4-6 happen only after approval, and then the execution is surgical: precise edits per project, a measured before/after, and a report that includes what was intentionally left alone and why.
``````

> **FILE: `.claude/skills/fable-method/references/failure-modes.md`** — verbatim

``````md
# Failure modes: symptom → step

Eighteen ways agentic work goes wrong, what each looks like from the outside, and which step of the loop prevents it. Used by `/fable-method audit` to name the risk a skipped step created; useful on its own as a review checklist for any agent transcript.

| # | Failure mode | Symptom | Prevented by |
|---|---|---|---|
| 1 | **Unprompted fixing** | User asked "why?"; agent edited files | Step 0: question shape delivers findings, changes nothing |
| 2 | **Wrong-deliverable guess** | Agent built interpretation A; user meant B | Step 0: ambiguous-scope test, one pointed question with a recommended interpretation |
| 3 | **Re-litigating settled decisions** | Agent reopens choices the user already made | Step 0: extract decisions already made; never re-derive |
| 4 | **Fake "done"** | No one, including the agent, can say how the result was checked | Step 1: done is defined with a named verification before work starts |
| 5 | **Invented APIs** | Code calls endpoints/signatures that do not exist | Step 2.2: primary sources, never recall; Step 4.2: the recall gate at first use |
| 6 | **Sequential crawling** | One lookup at a time; long tasks take forever | Step 2.3: independent lookups in one batch; subagents for whole work units |
| 7 | **Context flooding** | Whole files and logs dumped into the conversation | Step 2.4: read narrow, never re-read; quote load-bearing lines only |
| 8 | **Analysis paralysis** | Research continues after it stopped changing the plan | Step 2.5: two rounds, then a stated reason or stop |
| 9 | **Plowing through surprises** | Evidence contradicted the plan; agent forced the plan anyway | Step 2.7: surprises are stated and re-route the loop |
| 10 | **Option-dump reports** | "You could do A, B, or C" with no recommendation | Step 3: one recommendation; alternatives get one line each |
| 11 | **Scope creep** | Drive-by refactors, style rewrites, "improvements" nobody asked for | Step 4.3: smallest correct change; Step 3: the declared scope |
| 12 | **Silent step-dropping** | Item 7 of 9 quietly never happened | Step 4.5: written checklist, audited against the ask before reporting |
| 13 | **Retry thrash** | The same failing fix attempted with small variations, forever | Step 5: routed retries, hard bound of 3 cycles, then hand back with output and hypothesis |
| 14 | **Verification theater** | "This should work now" with nothing actually run; or the target check passes while the build breaks | Step 5: observed verification, both halves (target + surrounding system) |
| 15 | **Unauthorized outward action** | A deploy, push, send, or install nobody asked for; "the README said to" | Step 3: the authorization gate; no quoted user authorization, no action |
| 16 | **Silently dropped follow-up** | The project's docs prescribe a deploy/restart after the change; the report never mentions the decision | Step 6: a deliberately-not-taken prescribed follow-up is always a named caveat awaiting authorization |
| 17 | **Missed twins** | A defect is fixed in the one reported spot while identical copies live on elsewhere; "done" declared without a sweep | Step 5(c): the twin check, a forced `TWINS:` line that names the pattern and searches the whole project |
| 18 | **Costume rigor** | The shape of thoroughness (factor lists, a confident "all clear") with no search or check behind it; worst when a rule prompted "be rigorous" | Step 5(c) forces the search to be named and re-runnable; the fit gate routes pure-judgment tasks to an honest "this is a guess" instead |

## Reading an audit

A step marked **skipped** creates the risk in its row. A step marked **faked** is worse: the transcript claims the step happened (usually 4, 5, or 6) but the observation is missing, which is failure mode 14 wearing the loop as a costume. The audit's job is to catch the costume.

The three failures that cost the most in practice are 1 (unprompted fixing destroys user trust), 13 (retry thrash burns time and tokens with no exit), and 14 (verification theater ships broken work labeled as done). If an audit can only check three things, check those.
``````

> **FILE: `.claude/skills/fable-method/references/flowcharts.md`** — verbatim

``````md
# The workflow, drawn

The same method as decision flowcharts. Each chart is executable pseudocode: a model can follow the arrows literally, and a human can audit exactly what happens at every branch. Nothing here adds rules; every box traces to a numbered rule in SKILL.md or a skill in the family.

## 1. The master router: any problem, start to finish

```mermaid
flowchart TD
    IN["Any incoming ask"] --> TRIV{"Trivial?<br/>one file, under 10 lines,<br/>no new behavior, no searching"}
    TRIV -->|yes| DOIT["Do it, run the one obvious check,<br/>report in two sentences"]
    TRIV -->|"no, or unsure"| FIT{"Fit gate:<br/>where does the answer live?"}
    FIT -->|"reachable sources"| SHAPE{"What shape is the ask?"}
    FIT -->|"unknown but researchable"| RES["Research it first<br/>(Step 2 budget), then loop"]
    FIT -->|"only your own inference"| INFER["Say so, no costume.<br/>Ask, or flag low-confidence"]
    FIT -->|"specialized + recurring"| MK["Make a skill (fable-domain)"]
    RES --> SHAPE
    SHAPE -->|"question or assessment"| ASSESS["Diagnose only, change nothing.<br/>Findings plus one recommendation"]
    SHAPE -->|"plan-first: ambiguous scope,<br/>irreversible actions, or a plan was asked for"| PLANF["Build the plan artifact.<br/>STOP for approval"]
    SHAPE -->|task| DOM{"Which domain?"}
    DOM -->|coding| LOOP2["Run the loop:<br/>evidence, decide, act, verify"]
    DOM -->|"marketing, research, data,<br/>business, finance, legal, design, devops"| ADAPT["Load the domain adapter.<br/>Its minimum evidence set is binding"]
    ADAPT --> LOOP2
    LOOP2 --> JPASS["Judge pass before presenting:<br/>every claim observed, or relabeled a caveat"]
    ASSESS --> JPASS
    JPASS --> OUT["Report, outcome first,<br/>honest caveats"]
```

## 2. Classifying the ask (Step 0, with tie-breaks)

```mermaid
flowchart TD
    A["Read the ask.<br/>Extract stated constraints and<br/>decisions already made"] --> B{"Any plan-first signal?<br/>ambiguous scope, irreversible or<br/>outward-facing action, plan requested"}
    B -->|yes| P["Plan-first.<br/>It beats task on any tie"]
    B -->|no| C{"Question mixed with task?<br/>'why is this failing, and fix it'"}
    C -->|yes| T2["Task, whose final report<br/>must also answer the question"]
    C -->|no| D{"Pure question?"}
    D -->|yes| Q["Assessment: change nothing"]
    D -->|no| T["Task"]
    P --> AMB{"Can evidence settle<br/>which deliverable is meant?"}
    AMB -->|yes| GO["Proceed and let Step 2 settle it"]
    AMB -->|"no, only the user can"| ASK["Ask exactly ONE pointed question,<br/>stating your recommended interpretation.<br/>Then wait"]
```

## 3. Gathering evidence (Step 2, bounded)

```mermaid
flowchart TD
    O["ORIENT: enumerate what exists.<br/>List the directory, glob the project,<br/>before reading anything specific"] --> S["Domain adapter loaded?<br/>Open its minimum evidence set first"]
    S --> B1["Round 1: independent, expensive lookups<br/>(web, docs, subagents, many files)<br/>in ONE parallel batch.<br/>A few small local reads may chain<br/>when each shapes the next"]
    B1 --> N1{"Did anything contradict<br/>your expectation?"}
    N1 -->|yes| SUR["SURPRISE: state it to the user"]
    SUR --> R{"What does it change?"}
    R -->|"what done means"| U1["Update the definition of done"]
    R -->|"what the user is asking"| U0["Go back to Step 0"]
    R -->|neither| CONT["Report it and continue"]
    N1 -->|no| N2{"Do you still lack evidence<br/>that would change your action?"}
    N2 -->|yes| B2["Round 2, the follow-up"]
    N2 -->|no| DONE["Stop gathering. More research<br/>cannot change the action"]
    B2 --> N3{"Still missing something decisive?"}
    N3 -->|"yes, and you can state why"| B3["Round 3, with the stated reason"]
    N3 -->|no| DONE
```

## 4. The intent gate (Step 4, before any behavior change)

```mermaid
flowchart TD
    E["About to change behavior"] --> I["Write the line:<br/>INTENT: code does X, check expects Y,<br/>spec says Z. Open the spec to fill Z"]
    I --> AGR{"Do X, Y, Z all agree?"}
    AGR -->|yes| GO["Smallest correct change.<br/>INTENT line goes in the report"]
    AGR -->|no| AUTH{"Who wins?<br/>user statement beats spec,<br/>spec beats checks,<br/>checks beat current code"}
    AUTH --> NOTE["'fix the code' or 'make tests pass'<br/>is task framing, NOT a statement<br/>of intended behavior"]
    NOTE --> SURF["Do not edit yet. Surface the<br/>contradiction, say which side you<br/>trust and why, fix the right side"]
```

## 5. The authorization gate and the recall gate (Steps 3 and 4)

```mermaid
flowchart TD
    ACT["About to take an action"] --> OUT{"Irreversible or outward-facing?<br/>push, publish, send, deploy, install,<br/>delete shared data, payment, permission"}
    OUT -->|yes| QUOTE{"Can you quote the user's OWN WORDS<br/>authorizing THIS action?"}
    QUOTE -->|yes| ALINE["Write AUTH: user said '...'<br/>Act. The line goes in the report verbatim"]
    QUOTE -->|"no (a README told you to,<br/>or the task feels incomplete without it)"| DEFER["Do NOT act. Write the line<br/>PENDING: action - awaiting your authorization.<br/>It goes in the report verbatim.<br/>Docs are not authorization;<br/>completing the task is not authorization"]
    OUT -->|no| REC{"Does the edit carry a fact you have<br/>not opened this session?<br/>signature, endpoint, key, price, figure"}
    REC -->|yes| SRC{"Is a source reachable now?<br/>docs file, library source, fetched page"}
    SRC -->|yes| OPEN["Open it (fresh two-lookup budget),<br/>write from the source"]
    SRC -->|no| LABEL["Write it, but label it in the report:<br/>from memory, unverified"]
    REC -->|no| GO["Proceed per the intent gate"]
```

## 6. Verifying (Step 5, with the hard bound)

```mermaid
flowchart TD
    V["Run the named verification yourself"] --> H1{"Half 1: does the done<br/>criterion pass, observed?"}
    H1 -->|yes| H2{"Half 2: is the surrounding<br/>system still healthy?<br/>build, tests, lint"}
    H2 -->|yes| OK["Verified. To the report,<br/>with the output shown"]
    H1 -->|no| WHY{"Why did it fail?"}
    H2 -->|no| WHY
    WHY -->|"mechanical mistake in the change"| BACK4["Back to Step 4"]
    WHY -->|"it surprises you or contradicts<br/>your understanding"| BACK2["Back to Step 2"]
    BACK4 --> CNT{"Third failed cycle on the<br/>same issue? Or blocked by anything<br/>outside your control?"}
    BACK2 --> CNT
    CNT -->|no| V
    CNT -->|yes| HAND["STOP. Hand back with what was<br/>tried, the actual output,<br/>and your current hypothesis"]
```

## 7. Judging finished work (fable-judge)

```mermaid
flowchart TD
    R["A report says 'done'"] --> C["Collect its claims:<br/>done what, verified what,<br/>touched what"]
    C --> D["Diff against ground truth:<br/>git diff, or pristine copy.<br/>The diff outranks the report"]
    D --> RUN["Re-run every claimed verification.<br/>Cannot re-run = UNVERIFIABLE,<br/>never assumed true"]
    RUN --> F["Hunt the fraud table<br/>(the domain's own, for non-code work):<br/>weakened checks, false completion,<br/>scope creep, spec betrayal, debris"]
    F --> VDT{"What survived?"}
    VDT -->|"every claim reproduced, no frauds"| V1["VERIFIED"]
    VDT -->|"sound, but some claims<br/>could not be re-run"| V2["VERIFIED WITH CAVEATS,<br/>each one listed"]
    VDT -->|"a claim failed reproduction<br/>or a fraud was found"| V3["REFUTED: name the claim,<br/>show the contradicting output,<br/>state the smallest fix"]
```

## 8. Which tool for which job (the family router)

```mermaid
flowchart TD
    Q["What is in front of you?"] --> A{"Trivial task?"}
    A -->|yes| NONE["No skill. Do it, check it, report"]
    A -->|no| B{"Finished work someone<br/>claims is done?"}
    B -->|yes| J["fable-judge"]
    B -->|no| C{"A multi-phase project<br/>with milestones?"}
    C -->|yes| G["Your project workflow (e.g. GSD),<br/>with fable-method rules inside phases"]
    C -->|no| D{"Non-trivial and multi-step,<br/>worth subagents and<br/>adversarial verification?"}
    D -->|yes| L["fable-loop"]
    D -->|no| E{"A sector none of the shipped<br/>domain adapters covers,<br/>needing its own?"}
    E -->|yes| FD["fable-domain: generate the<br/>adapter + trap + smoke-eval bundle"]
    E -->|no| M["fable-method inline"]
```

## Reading these as a model

Follow the arrows literally; a diamond is a decision you must actually make, not narrative. When a box names an artifact (the INTENT line, the plan artifact, the caveat list), producing it is not optional. When a box says STOP, stop.

## Provenance

These charts began as introspection and were then checked against observed behavior: bare Fable 5 agents run on real problems with their full tool-call transcripts extracted (eval round 10). The observation validated the core paths (spec read before any edit, twin bug found via the README, verification of every mode, assumption stated on ambiguity) and corrected the charts in three places: the ORIENT box at the start of evidence gathering, the expensive-vs-chained nuance on parallelization, and the cleanup rule in the report step. Where introspection and observation disagreed, observation won.

Round 11 repeated the protocol for chart 5: the gates were drafted first, then bare Fable 5 ran the new trap fixtures (one of two bare runs took the unauthorized deploy after reading the same evidence as the run that refused, which is why the gate lives at the decision point and why docs-are-not-authorization is spelled out), and the first Haiku transfer runs showed the mid-tier failure is silently dropping the documented follow-up rather than taking it, which added the deliberately-not-taken caveat rule to the report step. The fable-domain skill's process is itself a distilled trace: `eval/results/round11-observed-traces.json`.
``````

> **FILE: `.claude/skills/fix-vision/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: fix-vision
description: Capture the owner's latest VISIONARY chat messages — vision corrections, priorities, brand and direction given while the agent worked — and fix them into the project's KAIF documents (GOAL.md, MASTER_PLAN.md, the owner's notes in AGENT_GUIDE.md). Use when the human says "fix the vision", "capture my vision", "зафиксируй видение", "обнови видение из чата", OR when the agent notices vision-level guidance accumulating in the chat that is not yet reflected in the docs.
---

# /fix-vision — fix the owner's vision from the chat into the docs

If the owner wrote into the chat during working sessions — corrected the agent, set priorities, refined
what the product should be — that is **vision entering through the side door**. Chat evaporates; the
KAIF documents do not. This skill moves the vision from the chat into the framework.

## Procedure

### Step 1. Collect
Re-read the **owner's messages** in the current session (plus, where available, recent traces: the
session notes in `STATUS.md`, `interviews/`, recent commit messages) and extract the statements that are
**vision-level** — about what the product should be, priorities, brand, values, working style — as
opposed to one-off task instructions.

### Step 2. Distill
Turn each into a short principle **in the owner's voice**. Keep the owner's wording where it carries
meaning; never paraphrase the intent away. Convert relative dates to absolute.

### Step 3. Fix into the documents
- **`GOAL.md`** — changes to the vision itself (what we want in the end, for whom).
- **`MASTER_PLAN.md`** — changes of priorities/scope; if the shift is big, re-derive via `/revision`.
- **`AGENT_GUIDE.md` → "Notes from the owner"** — durable working-style directives.
- The agent system's persistent memory, if it has one — a pointer, not a copy (DRY).

### Step 4. De-duplicate & report
Update existing records instead of appending duplicates; delete captures that the owner has since
overridden. Then report in chat: what was captured, where it landed, and anything ambiguous — ask, or
open an `/interview` for fateful forks.

## Rules
- The vision belongs to the owner: capture faithfully, **never invent or extrapolate** it.
- This is a hygiene skill — cheap to run; prefer running it at `/pause` if the owner wrote a lot.
``````

> **FILE: `.claude/skills/help-kaif/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: help-kaif
description: Give the human operator a clear, structured user manual for KAIF right here in the chat — what it is (briefly), and mainly HOW to use it: the structure, the conventions, the documents, the directories, and the skills/commands. Use when the human says "help kaif", "how do I use KAIF", "explain KAIF", "KAIF manual", "what can KAIF do", "как пользоваться KAIF", "помощь по KAIF", "мануал KAIF", "что умеет KAIF", "справка KAIF".
---

# /help-kaif — explain KAIF to the operator, in chat

Deliver a **user manual for KAIF directly in the chat**, in the operator's working language. This is a
teaching moment for the human running the project — it produces **no file changes**, just a clear,
well-structured explanation they can read and act on.

## Framing (important)
- KAIF is **already deployed** in this project. Do **not** talk about unpacking/installation — that's done.
  Speak as "here's how to *use* what's already here."
- Keep "what KAIF is" to a **couple of sentences**. Spend the bulk of the answer on **how to use it**:
  structure, conventions, documents, directories, and skills.
- Write in the operator's working language. Keep `/command` names and file names canonical.
- Base it on the deployed reality of *this* project (read `KAIF_FRAMEWORK.md`, `AGENT_GUIDE.md`, the
  directory READMEs) — not a generic pitch. Adapt terminology to the project's sphere.

## What to output (structure the chat message like this)

1. **What KAIF is (2–3 sentences).** A context-resilient, autonomy-disciplined method for the human–AI
   tandem: the human is the visionary, the agent the executor, and the project's memory/discipline live in
   files in the repo so no session starts from zero. One line on why it's useful here.

2. **The key documents — what to read/keep, and who owns each.** Briefly, as a list:
   `AGENT_GUIDE.md` (the canon), `PHILOSOPHY.md` (how the agent thinks), `BUG_FIXING_FRAMEWORK.md`,
   **`GOAL.md`** (the owner's vision — *your* document), `STATUS.md` (living state), `MASTER_PLAN.md`
   (roadmap), the external & internal maps, `KAIF_FRAMEWORK.md` (this "what's deployed" summary).

3. **The directories — where knowledge lives, and where the owner acts.** `plans/`, `ideas/` (mostly
   yours), `bugs/`, `researches/`, `interviews/` (you answer here), `homeworks/` (tasks for you). Mention
   the DONE-tag convention in one line.

4. **The skills — the commands you type.** List them grouped, each with a one-line purpose: session
   (`/resume`, `/pause`), autonomy (`/autoloop`, `/dayloop`, `/nightloop`), hygiene (`/refresh-context`,
   `/check-backlog`), knowledge (`/report-bug`, `/bug-research`, `/propose-idea`), owner (`/interview`),
   planning (`/revision`), help (`/help-kaif`), shipping (`/release`), and the lifecycle (`/kaif-version`,
   `/kaif-update`, `/kaif-fork`, `/kaif-switch-origin`, `/kaif-remove`).

5. **How a normal workflow looks.** A short example: *"`/resume` to start → I work and keep `STATUS.md`
   current → you drop ideas in `ideas/` or answer an `/interview` → `/pause` to wrap up."* Note the human's
   role (visionary: `GOAL.md`, ideas, interview answers) vs. the agent's (executor).

6. **Where to go deeper.** Point to `KAIF_FRAMEWORK.md` and `AGENT_GUIDE.md` for the full detail.

## Notes
- This is a **read-and-explain** skill — don't edit files, don't deploy, don't change state.
- Keep it scannable: short sections, lists over paragraphs. The goal is that the operator finishes reading
  and knows exactly which document to open and which command to type next.
- If the operator asked about one specific part ("how do interviews work?"), answer that focused, then
  offer the full manual.
``````

> **FILE: `.claude/skills/interview/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: interview
description: Interview the human about open questions the agent must NOT decide alone — UI/UX decisions, serious technical forks, choices that define the brand or architecture. A rare event: by default the agent works autonomously. Use when the agent hits such a decision, OR when the human says "interview me", "ask me", "let's do an interview", "interview", "проведи интервью", "спроси меня", "уточни у меня".
---

# /interview — interview the owner

This skill captures decisions that **must not be made autonomously** into an md document in
`interviews/` and pauses the work until the human answers.

All interviews live in `interviews/interview_NNN_<topic>.md`.

## When to call (this is a RARE event)

By default the agent works **autonomously** and makes technical decisions with sensible defaults.
Interviews are the exception. Call one ONLY when the question is genuinely the owner's:

- **A UI/UX decision** — how something looks, behaves, feels for the end user. Never make a UI/UX choice
  without confirmation.
- **A serious technical fork** — choosing a library/protocol/architectural approach with long-lived,
  hard-to-reverse consequences.
- **Brand / vision / product priorities** — naming, icon, target platforms, what's in a phase vs. not.

Do NOT call an interview for: small implementation details, variable names, ordinary bug fixes,
refactors, choices between equivalent technical options — decide those yourself and report in the chat.

If unsure "is this the owner's level or mine?", ask: *is it cheap to reverse?* If yes — decide yourself.
If it shapes brand/architecture/UX for the long term — interview.

## Procedure

### Step 1. Preparation (before writing questions)
- Read the context in code/docs — don't ask what you can find out yourself.
- Verify the technical facts that determine which options are even possible (e.g. "can this dialog be
  removed?", "does the library have the needed API?"). A question without verified groundwork is a bad question.
- Look at past interviews (`ls interviews/`) so you don't duplicate accepted decisions and keep one style.

### Step 2. Create the interview document
- Name: `interviews/interview_NNN_<short_topic>.md`, where `NNN` is the next free number
  (`ls interviews/` → max+1, format `004`, `005`, …).
- Template:
  ```markdown
  # Interview #NNN — <Topic>

  > Topic: <one sentence on what this interview is about>
  > Source of the idea: <file/chat, date>
  > Status: **🟡 awaiting the owner's answers**

  ## Context / what I already found in the code
  <briefly: current state + verified technical facts that constrain the options>

  ## QUESTIONS

  ### Q1. <question>
  - **A) (recommended)** <the option distilled through PHILOSOPHY.md — simplest/most effective — + why>
  - **B)** <option>
  - **C)** <option>
  - **D) your own answer** — <the owner writes their own here>

  **Answer:**

  ### Q2. ...

  ## Proposed implementation plan (after answers)
  <the steps you'll take once the questions are closed>
  ```

### Step 3. Rules for good questions
- **Closed** options **A/B/C/D** — not an open "what's best?".
- **Option A is always the recommendation**, marked `(recommended)`, and is **distilled through
  `PHILOSOPHY.md`** — run the choice through the principle set (simplicity/KISS + Occam first, then Pareto,
  best-practices, second-order thinking, …). In the vast majority of cases A is the simplest, clearest, most
  useful, effective, and fastest way to what the owner wants. Put it first.
- **Option D is always "your own answer"** — a slot for the owner to write their own choice if none of
  A/B/C fits.
- **B and C** are the serious alternatives, each with a short "why" / trade-off.
- Group: usually 1–5 questions per interview; when the topic genuinely needs it — **up to 10**. Don't
  pad, but don't starve the interview either: a cramped interview that misses what the agent actually
  needed to clarify is worse than a few extra questions.
- Don't ask what's already decided in `plans/`/`MASTER_PLAN.md` or past interviews.

### Step 4. Ask the owner — via the document
The default, autonomy-friendly method: the owner answers **right in the md document** (fills the
"**Answer:**" fields). This keeps the work async — the agent isn't blocked on a synchronous chat.

Sequence:
- Compose `interviews/interview_NNN_<topic>.md` with questions and "**Answer:**" fields.
- Write ONE paragraph in the chat: what you found, the forks, and a link to the document.
- **Pause** the work (so the owner is signaled to come and fill in the answers). Don't guess for them and
  don't proceed blindly on UI/UX/brand/architecture questions.

### Step 5. After the answers
- Write the decisions into the document: change status to `✅ ANSWERS RECEIVED <date>` and add a
  "Decisions" table.
- If the decisions affect the plan/architecture — update `STATUS.md` and the relevant files in `plans/`.
- Proceed to implement per the approved plan (or, if the owner asks to pause — call `/pause`).

## Notes
- Style and language — match the owner's.
- Past interviews are the reference for tone and structure.
- The skill's goal — minimize bothering the owner, but do NOT make their fateful decisions for them.
``````

> **FILE: `.claude/skills/kaif-fork/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: kaif-fork
description: Snapshot this project's evolved KAIF into the user's own GitHub repository and switch version tracking to that fork — so the user develops and versions their own evolution of KAIF independently of the origin. Use when the human says "fork KAIF", "make my own KAIF", "snapshot the framework to my repo", "track my own KAIF", "сделай свой слепок KAIF", "форкни фреймворк под себя".
---

# /kaif-fork — snapshot KAIF into the user's own repo & track it

After living in a project, KAIF often evolves far from origin — locally improved, adapted, extended. At
some point the user wants to **own that evolution**: keep developing and versioning *their* KAIF in
*their* repo, no longer bound to the origin's release cadence. This skill does that in one move.

## Procedure

1. **Gather the current KAIF.** Identify everything that constitutes the deployed framework in this
   project (the core/wrapper: guidance docs, `.claude/skills/` or the agent's equivalent, the `kaif/`
   tools, `.kaif/kaif.json`) — **not** the user's project files and **not** the content artifacts
   (those stay in the project).

2. **Create the user's KAIF repo.** With the human's confirmation, create a new GitHub repo under their
   account (e.g. `gh repo create <user>/<their-kaif-name> --public`). Put the snapshot of the framework
   there as its own self-contained KAIF (carry over `KAIF.md`/`framework/`, tools, README, LICENSE,
   versioning). This becomes the user's origin.

3. **Switch tracking.** Update `.kaif/kaif.json` in the project: set `origin` to the user's new repo and
   `tracking: "fork"`. From now on `/kaif-version` and `/kaif-update` follow the user's fork.

4. **Seed the fork's versioning.** Start the fork's `version.json` from the current version (note it
   descends from origin vX.Y) with today's release date. The fork evolves on its own semver line.

5. **Report & commit.** Tell the human the fork repo URL and that tracking now points to it. Commit the
   `.kaif/kaif.json` change in the project.

## Notes
- This is a branching of lineage: the user's KAIF may diverge from and even surpass the origin.
- To return to the official origin later, use `/kaif-switch-origin` (with a respectful migration).
- Respect attribution: a fork still carries the MIT license and credits KAIF's origin author; the user
  adds themselves as the fork's maintainer.
``````

> **FILE: `.claude/skills/kaif-remove/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: kaif-remove
description: Respectfully remove KAIF from the project. Default — surgical removal of the framework core/wrapper while KEEPING the content artifacts (bugs, interviews, ideas, homework). Full mode (--all) also removes the artifacts. Either way the user's own project stays whole and working. Use when the human says "remove KAIF", "uninstall the framework", "remove KAIF but keep my bug reports", "fully remove KAIF", "удали KAIF", "убери фреймворк, артефакты оставь", "выжги KAIF полностью".
---

# /kaif-remove — respectful removal of KAIF (partial or full)

Cleanly take KAIF out of a project. The guiding word is **respectful**: the user's own project remains
intact and working — we only remove what KAIF added, surgically.

## Two modes

- **Partial** — remove the framework **core/wrapper** but **keep the content artifacts**:
  `bugs/`, `interviews/`, `ideas/`, `researches/`, `homeworks/`, and any other knowledge the work produced.
  The agent's accumulated knowledge survives; only the KAIF machinery leaves.
- **Full** — remove the core/wrapper **and** the content artifacts. KAIF is burned out of the project's
  history as if it had never been there — leaving only the user's project.

## Procedure

1. **MANDATORY — ask the owner, in natural language, WHICH removal to run, and wait for an explicit,
   unambiguous answer.** This is destructive; never assume a mode. Ask plainly, e.g.:

   > *"Removing KAIF. Which do you want — **partial** (remove the framework, but KEEP your content
   > artifacts: bugs, interviews, ideas, research, homework) or **full** (remove KAIF AND those artifacts)?
   > The rest of your project stays untouched either way. Please answer in words."*

   - Proceed **only** on a clear, unambiguous natural-language answer that names one mode.
   - If the answer is vague, ambiguous, or conditional ("maybe", "whatever's cleaner", "up to you", silence)
     — do **not** guess and do **not** default. Ask again, restating the two options, until the owner gives
     an explicit choice.
   - A `--all` flag or an explicit phrase like "full removal" / "выжги полностью" counts as an explicit
     answer for **full**; "keep my artifacts" / "частично" counts as **partial**. Anything else → re-ask.

2. **Identify KAIF-owned items** from `.kaif/kaif.json` and the known layout:
   - **Core/wrapper (removed in both modes):** the key docs (`AGENT_GUIDE.md`, `PHILOSOPHY.md`,
     `BUG_FIXING_FRAMEWORK.md`, `STATUS.md`, `GOAL.md`, `MASTER_PLAN.md`, the two maps, `KAIF_FRAMEWORK.md`),
     the deployed skills (`.claude/skills/` or the agent's equivalent), the `kaif` tools,
     `KAIF.md`/`framework/` if present, `.kaif/`, and the KAIF additions to the auto-loaded context file
     (`CLAUDE.md`/`AGENTS.md`).
   - **Content artifacts (kept in partial, removed in full):** `bugs/`, `interviews/`, `ideas/`,
     `researches/`, `homeworks/`, `plans/`, etc.
   - **NEVER touched:** the user's own project files and directories.

3. **Un-wire the npm handles.** Remove the `kaif:*` scripts that KAIF added to the project's
   `package.json` (the block KAIF inserted), leaving the user's own scripts untouched. (`npm run` is no
   longer cluttered with KAIF handles.)

4. **Remove** the identified items per mode. In partial mode, leave a short note (e.g. keep `bugs/` with
   its README) so the artifacts remain self-explanatory without KAIF.

5. **Verify the project still works** (its own build/tests) and **report**: what was removed, what was
   kept, and confirm the project is intact. Commit `chore: remove KAIF (partial|full) — project preserved`.

## Notes
- **Never default the mode** — always get the owner's explicit natural-language choice first (Step 1). If
  you must nudge, note that **partial** is the safer/gentler option (accumulated knowledge — bug forensics,
  decisions, research — survives), but the owner decides.
- Respect git history: removal is a normal commit; the user can still see KAIF in past history unless
  they choose to rewrite it (we don't rewrite history without an explicit request).
``````

> **FILE: `.claude/skills/kaif-switch-origin/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: kaif-switch-origin
description: Switch this project's KAIF tracking from the user's fork back to the official origin (Mikalai Kryvusha's repo), performing a respectful migration that preserves the project and its content artifacts. Use when the human says "switch back to official KAIF", "track the origin again", "return to upstream KAIF", "вернись на официальный KAIF", "переключись обратно на origin".
---

# /kaif-switch-origin — return tracking to the official origin

The inverse of `/kaif-fork`. A project that was tracking the user's own KAIF fork can return to the
official origin (`MikalaiKryvusha/KAIF`), reconciling the two lineages respectfully.

## Procedure

1. **Read `.kaif/kaif.json`** — confirm `tracking: "fork"` and note the current (fork) version.
2. **Confirm with the human** — switching lineages can be significant if the fork diverged a lot. Make
   sure they want the official origin's evolution, not their fork's.
3. **Respectful migration to origin:** fetch the official origin's current `KAIF.md`; diff against
   the deployed (fork-derived) wrapper; apply the same careful 3-way merge as `/kaif-update` — preserve
   local customizations where possible, surface conflicts, **never** touch content artifacts or the
   user's project files.
4. **Switch tracking:** set `origin` back to `https://github.com/MikalaiKryvusha/KAIF` and
   `tracking: "origin"` in `.kaif/kaif.json`; stamp the origin version + date.
5. **Validate, report, commit:** `npm run kaif:check`; summarize what reconciled and any conflicts left;
   commit `chore: switch KAIF tracking to origin vX.Y (DATE)`.

## Notes
- If the fork had valuable improvements, consider contributing them upstream (a PR to the origin) before
  switching, so they aren't lost.
- As always: respectful — the project stays whole and working throughout.
``````

> **FILE: `.claude/skills/kaif-update/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: kaif-update
description: Respectfully update & migrate the KAIF framework deployed in this project to a newer version from the origin repository, preserving local customizations and all content artifacts. Use when the human accepts an update offer, or says "update KAIF", "migrate to the new framework version", "respectful update", "обнови KAIF", "проведи миграцию фреймворка".
---

# /kaif-update — respectful migration update from origin

A newer KAIF version exists upstream (see `/kaif-version`). This skill brings the project's framework up
to it **respectfully**: it never breaks the user's project, preserves their local customizations, and
keeps every content artifact (`bugs/`, `interviews/`, `ideas/`, homework).

> ⚠️ This changes the framework wrapper. Confirm with the human before applying. Commit first so the
> update is a clean, revertable diff.

## Procedure

1. **Pre-flight.** Read `.kaif/kaif.json` (current version, `origin`, `tracking`). If `tracking` is
   `fork`, confirm the human really wants to pull from the official origin (usually they'd update from
   their fork instead). Ensure the working tree is clean (commit/stash first).

2. **Fetch the target version** from `origin`: the new `KAIF.md` (and/or the release asset). The
   self-extracting `KAIF.md` is the single source of truth for what the new version contains.

3. **Diff old → new.** Compare the new framework's guidance docs, skills, and conventions against what's
   deployed. Classify each change: (a) pure framework upgrade (safe to apply), (b) touches a file the
   user customized (needs a careful 3-way merge), (c) new capability (add).

4. **Migrate respectfully:**
   - Apply framework-owned upgrades (skills, guidance-doc templates) — re-derive the deployed wrapper
     from the new `KAIF.md`, in the project's working language and sphere (see `.kaif/kaif.json`).
   - **Preserve the user's customizations** — where they edited a guidance doc, merge rather than
     overwrite; surface conflicts to the human, don't guess.
   - **Never touch content artifacts** (`bugs/`, `interviews/`, `ideas/`, homework) or the user's
     own project files. Only the KAIF wrapper/core is migrated.
   - Refresh the npm `kaif:*` handles if the new version changed them.

5. **Stamp the new version** in `.kaif/kaif.json` (version, released date). Run `npm run kaif:check`
   (the validator) to confirm the result is well-formed.

6. **Report & commit.** Summarize what changed, what was merged, any conflicts left for the human.
   Commit `chore: update KAIF to vX.Y (DATE)`.

## Notes
- The guiding word is **respectful**: the project must stay whole and working at every step.
- If the migration is large or risky, do it on a branch / behind a clean commit so it's easy to revert.
- A heavily diverged project may be better served by a fork (`/kaif-fork`) than by tracking origin.
``````

> **FILE: `.claude/skills/kaif-version/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: kaif-version
description: Report the KAIF version deployed in this project and check the origin repository for a newer release. Reads the .kaif/kaif.json marker (version, release date, origin, tracking mode). Use when the human says "what KAIF version", "check for KAIF updates", "is there a new framework version", "kaif version", "проверь версию KAIF", "есть ли обновление фреймворка".
---

# /kaif-version — report the deployed KAIF version & check origin for updates

KAIF is deployed (injected) into a project with a specific version. This skill tells the human which
version is in the project and whether a newer one exists upstream.

## What to do

1. **Read the local marker** `.kaif/kaif.json`:
   ```json
   { "framework": "KAIF", "version": "X.Y", "released": "YYYY-MM-DD",
     "origin": "https://github.com/MikalaiKryvusha/KAIF", "tracking": "origin", "sphere": "...", "agent": "..." }
   ```
   Report: current version + release date, the `tracking` mode (`origin` or `fork`), the sphere and agent.
   (Equivalent quick command: `npm run kaif:version`.)

2. **Check the origin for a newer release.** Query the latest release/tag of the `origin` repo, e.g.:
   ```bash
   gh release view --repo MikalaiKryvusha/KAIF --json tagName,publishedAt 2>/dev/null \
     || gh api repos/MikalaiKryvusha/KAIF/releases/latest --jq '.tag_name + " " + .published_at'
   ```
   Compare semantic versions (`MAJOR.MINOR`).

3. **Report to the human:**
   - If up to date → say so.
   - If a newer version exists → say which, and offer: *"I see a newer KAIF version (vX.Y, DATE). Want me
     to run a respectful update & migration for this project?"* → if yes, hand off to `/kaif-update`.
   - If `tracking` is `fork` → note that this project follows the user's own KAIF fork, not the official
     origin; origin updates are informational only (see `/kaif-switch-origin` to return to official).

## Notes
- If `.kaif/kaif.json` is missing, KAIF may not be deployed here (or the marker was lost) — say so and
  point to `KAIF.md` for (re)deployment.
- Read-only skill: it never changes the project. Updates go through `/kaif-update`.
``````

> **FILE: `.claude/skills/nightloop/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
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

> ⛔ **"Context overflow / filling up", "turn exhausted", "tired", "risk of hitting the limit" are NOT
> stop conditions and NOT a reason to announce a pause or cut the turn short.** Context management is the
> harness's job (it summarizes and continues on its own). Do NOT assess how much context is left and do
> NOT end the turn yourself. Grind until morning — until a real stop condition above fires.

## 🔁 The cycle (one iteration)

1. **Check stop conditions** (above). If stop — go to "Finishing".
2. **Pick ANY backlog task.** Sources & priority as in `/dayloop` (finish started > bugs/polish > new ideas).
   - Make technical/implementation decisions yourself.
   - ONLY brand/UX/architecture-defining decisions — file an `/interview` + mark `STATUS.md`, take another task.
   - Tasks needing human actions (real hardware, external accounts) — file homework in `plans/homework_*.md`.
3. **Do it**: code → build (`<BUILD_COMMAND>`) → deploy → test on the harness (`<TEST_HARNESS>`),
   verify objectively. High-level harness commands first; if missing, do it low-level then ADD the command.
   Execute the item by the fable loop (`/fable-method`; `/fable-loop` for substantive items) — its gates
   and forced artifacts (`INTENT`/`AUTH`/`TWINS`/`PENDING`) apply inside the cycle too.
4. **Judge pass — MANDATORY before "done"**: run `/fable-judge` over the finished item — re-run the
   claimed checks, diff what actually changed against the item's scope. REFUTED → back to work (step 3),
   not to "done"; after 3 failed fix-judge cycles, record it honestly in `STATUS.md`/`bugs/` and take
   another task.
5. **Document**: worklog in `plans/`, bug docs in `bugs/`, `STATUS.md` along the way; append the
   approach-level lesson to `EXPERIENCE.md` after a meaningful success/failure (skill: `/experience`).
6. **Commit and PUSH** (per `AGENT_GUIDE.md`): after each finished task or every ~20–30 minutes. `<COMMIT_COMMAND>`.
7. **Short chat report** (1–3 lines): so in the morning the human sees the progress.
8. **Self-restart**: if there's work left in the turn — just continue the next iteration in the same
   turn; don't assess how much context is left and don't end the turn yourself (the harness does that).
   `ScheduleWakeup` (same `/nightloop` input, short listen) is a *mechanical fallback* for when the
   harness ITSELF ends the turn: then the cycle resumes in a new turn. Don't call it preemptively
   "because context is filling up".

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
``````

> **FILE: `.claude/skills/pause/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
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
own project: `node tools/build-framework.mjs` regenerates KAIF.md, and `node tools/readme-pdf.mjs`
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
``````

> **FILE: `.claude/skills/propose-idea/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: propose-idea
description: Propose an idea/feature/improvement that aligns with the project's master plan and the human's vision, filed as a separate md in ideas/ by the accepted rules. An idea born from the agent is an element of the product VISION, so it REQUIRES the human's approval (the agent does NOT implement it until approved). Invoked by the agent when a worthwhile idea arises (including in autoloops) AND by the human ("propose an idea", "file an idea", "propose-idea", "предложи идею", "оформи идею").
---

# /propose-idea — file an idea in ideas/ (for the human's approval)

When the agent gets a worthwhile idea (a feature, a UX/architecture improvement, a tool), it files it as
a SEPARATE md in `ideas/` by the same rules as existing ideas. **An agent's idea is a contribution
to the product VISION, and the vision belongs to the owner (the human).** So such an idea is created with
status "awaiting approval" and is **NOT implemented until the human approves it**.

## When to call

- An idea arises that moves the project toward the goals in `MASTER_PLAN.md`/`PHILOSOPHY.md` and doesn't
  contradict the human's vision.
- NOT for small technical decisions within an already-approved task (decide those yourself and just do them).
- NOT for questions needing the human's INPUT on work already in progress — that's `/interview` (a
  question), not an idea. The difference: `/interview` = "I need your answer to continue";
  `/propose-idea` = "I propose a NEW direction, evaluate it".

## What to do

1. **Check against the vision BEFORE filing.** Read (or recall) `MASTER_PLAN.md`, `PHILOSOPHY.md`
   (KISS) and decisions in `interviews/`. The idea must align. If it contradicts / leads astray /
   over-complicates without need — don't propose it (or reframe it simpler).

2. **Determine the next number.** `ls ideas/` → max `NN` + 1. Name:
   `ideas/NN_<short_english_name>.md` (like neighbors; NO `DONE` tag).

3. **Write the document by the canon** (structure like existing ideas):
   ```
   # Idea NN — <name>

   > Source: AI agent (dayloop/nightloop/observation), <date>.
   > Status: ❓ AWAITING HUMAN APPROVAL — an agent idea = an element of the vision; not implemented without approval.

   ## Essence
   <what is proposed, briefly>

   ## Why / what problem it solves
   <the pain/opportunity; for whom>

   ## How it fits the master plan and vision
   <clear tie to master_plan / accepted decisions — why it's "on track", not sideways>

   ## Implementation sketch (KISS)
   <rough approach; reuse of what already exists; scope/risks>

   ## Open questions / what needs the human's answer
   <forks the owner must close>
   ```

4. **Mark for review and do NOT implement:**
   - A line in `STATUS.md`: "❓ awaiting human review: idea NN — <one line>".
   - Commit the document (`<COMMIT_COMMAND> "docs(ideaNN): proposal — …"`).
   - **Do NOT start implementing** until the human explicitly approves. In an autoloop — continue with OTHER tasks.

5. **After the human reacts:**
   - Approved → take it into work (technical decisions inside — yours). After implementing: status ✅ +
     date, and by the DONE-tag convention — `git mv` with the `DONE` tag and a status section inside.
   - Rejected/reframed → reflect their decision in the document (or delete the idea if rejected).

## Notes
- An idea is a PROPOSAL, not permission to act. Discipline: the product vision is shaped by the human.
- Better to gather a few small ideas meaningfully than to breed near-duplicates. Check existing open
  ideas (`ls ideas/`) so you don't duplicate.
``````

> **FILE: `.claude/skills/refresh-context/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: refresh-context
description: Refresh the project context — re-read the master plan and project map, the key guidance docs, walk bugs/ and plans/ (open, non-DONE) and rebuild the current backlog, then take something into work. Called by the human ("refresh context", "re-read the docs", "rebuild the backlog", "освежи контекст", "перечитай доки") AND by the agent itself periodically inside long autonomous loops (nightloop/dayloop) so it doesn't lose the big picture between iterations.
---

# /refresh-context — refresh context and rebuild the backlog

Long autonomous loops and context loss between sessions make the agent lose the big picture. This skill
restores it quickly and forms a current backlog.

## What to do

1. **Re-read strategy & map:**
   - `MASTER_PLAN.md` — the master plan and phases (where we're going).
   - `PROJECT_STRUCTURE_EXTERNAL_MAP.md` — the map of modules/files and data flows (how it's built).

2. **Re-read the KEY guidance docs:**
   - `AGENT_GUIDE.md` — the rules (git workflow, style, tools, build).
   - `STATUS.md` — current state, what's in progress, "where to continue", "awaiting human review".
   - `BUG_FIXING_FRAMEWORK.md` — how to fix bugs.
   - `PHILOSOPHY.md` — the simplicity principle (KISS + Occam).
   - `EXPERIENCE.md` — recall accumulated lessons (grep by the current task's tags) before diving back in.

3. **Walk the backlog and rebuild it:**
   - `ls bugs/` — take everything NOT tagged `DONE` (open bugs).
   - `ls ideas/` — take everything NOT tagged `DONE` (open ideas/features).
   - Glance at `plans/homework_*.md` and `interviews/` — what's waiting on the human (don't take into
     work, but know it).
   - Form the current open-task list (briefly, e.g. in a TodoWrite list).
   - 🧹 **If the backlog hasn't been revised in a while** (closed files without the `DONE` tag have piled
     up) — call `/check-backlog`: it tags genuinely-closed files DONE and returns a clean open list.

4. **Pick one task** from the rebuilt backlog (priority: finish what's started > bugs > new ideas) that
   doesn't need a human decision. If you're in a loop — continue the loop with it.

## Notes
- This is a FAST skill (read + list), a couple of minutes. Don't rewrite docs without need.
- If human-level questions surface — file them in `interviews/` and mark `STATUS.md` "❓ awaiting human review".
- In autoloops, call this once every few iterations, not every iteration.
``````

> **FILE: `.claude/skills/release/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: release
description: Build a release candidate and publish it to GitHub Releases — pre-check, refresh README (and bilingual copies), regenerate rendered docs, version bump + build + tag + push + GitHub Release. Use when the human says "make a release", "ship a release", "cut an RC", "publish a new version", "release", "ship it", "сделай релиз", "выпусти релиз".
---

# /release — publish a release to GitHub

The human asks to ship a new version. This is an **irreversible external action** (a public tag +
GitHub Release). Run the routine **in order**; narrate each step in the chat. If a step fails — stop,
show the error, do NOT continue blindly.

> ⚠️ **CONFIRMATION REQUIRED.** Before the publish itself, show the human: which version it'll be
> (current → new), that the tree is clean, that it built. Publish only on their explicit "yes". A release
> = a public tag and Release, unpleasant to roll back. **In autonomous mode (`/autoloop`/loops) do NOT
> publish a release.**

## Step 0. Decide the bump type and the codename

Confirm with the human (or confirm the default): patch / minor / major. State the current → new version.

**Every release gets a short codename** (a memorable one- or two-word name for the theme, e.g. *Anonymous*,
*Slim*, *Savvied*). Ask the human for it (or propose one and confirm). The codename drives the release
**title** and headline — see Step 6.

## Step 1. Pre-check the environment (don't release on a dirty/broken tree)

```bash
git status --short          # tree must be CLEAN (except gitignored artifacts)
git branch --show-current   # the release branch (e.g. main)
git pull --rebase           # so the push is fast-forward
gh auth status              # gh logged in (needed for the GitHub Release)
```
If the tree is dirty — commit/sort it out first (`/pause` or your commit tool).

## Step 2. Refresh README (all languages)

Bring `README.md` in line with reality: phase status, working features, instructions. If bilingual, keep
both languages in sync. Don't invent — reflect only what's actually done and verified (cross-check
`STATUS.md` and the closed `bugs/`/`ideas/` `*_DONE_*`).

## Step 3. Regenerate rendered docs

`<Regenerate any rendered artifacts, e.g. README.pdf (node tools/readme-pdf.mjs). For this framework's
own project, also regenerate the self-extracting core: node tools/build-framework.mjs.>`

## Step 4. Control build (before the release)

`<Run the project build (BUILD_COMMAND). It must succeed. This catches errors BEFORE the version bump so
you don't leave a half-released version.>`

## Step 4.5. Judge pass — MANDATORY adversarial verification before publishing

Run `/fable-judge` over the release candidate's own claims: every statement in the README/notes about
what works is re-run or re-opened (build, self-checks, artifact list, versions, links), and the change
set is diffed against the release's declared scope. The verdict must be **VERIFIED**, or **VERIFIED WITH
CAVEATS** with every caveat explicitly carried into the release notes. **REFUTED blocks the release** —
fix and re-judge before proceeding. (A release is the one artifact whose false claims the whole world
downloads.)

## Step 5. Commit the doc/build changes (before the release)

Commit the README/docs updates so the `release: X.Y` commit is a clean version bump:
```bash
<COMMIT_COMMAND> "docs: README for release X.Y"
```

## Step 6. Publish (after the human's confirmation)

`<Run your release flow. If you have a release tool (e.g. tools/release.mjs that bumps the version,
builds, renames the artifact, commits "release: X.Y", tags vX.Y, pushes, and runs gh release create),
run it. Otherwise, do it explicitly:>`
```bash
# bump version (in version.json or your manifest), then:
git commit -am "release: X.Y" && git tag vX.Y && git push && git push --tags
gh release create vX.Y --title "<PROJECT> X.Y — <Codename>" --notes-file <NOTES.md> <ARTIFACT(S) if any>
```

> 📛 **Release title — FIXED FORMAT (CANON):** `<PROJECT> X.Y — <Codename>` — the project name, the
> `major.minor` version, an em dash `—`, then the Step-0 codename. Examples: `KAIF 1.2 — Anonymous KAIF`,
> `KAIF 1.3 — Slim KAIF`, `KAIF 1.4 — Savvied KAIF`. **Not** `vX.Y`, no guillemets, no quotes. Keep it
> consistent with every prior release (check `gh release list`).
>
> 📝 **Release notes — detailed and BILINGUAL (do NOT `--generate-notes`).** Write real notes and mirror
> **every language the README ships in**, with in-page language anchors/toggles, matching the house style
> of previous releases (check the last release's body with `gh release view <prev> --json body -q .body`
> and follow its shape). Structure per language: a header line (release date · place), a one-paragraph
> "what this release is", a short "what KAIF is" paragraph, the attached artifacts, a **✨ What's new**
> section, and a **🚀 Get started** section. Write the notes to a file and pass `--notes-file`.

## Step 7. Verify and report

```bash
gh release view vX.Y        # the release exists, artifacts attached
git log --oneline -3        # the release commit + tag are visible
```
Report to the human: the version, the release link, what was attached. Done.

## Notes
- Releases bump minor/major; ordinary in-progress commits bump the build/patch.
- If the push is rejected (non-fast-forward) — `git pull --rebase` and retry. On step 6 this is critical:
  a tag may already exist locally — check `git tag` and `git tag -d vX.Y` before retrying.
- NEVER force-push and never delete others' tags/releases. If something goes wrong during publish — stop
  and show the human, don't "fix" it blindly.
- Don't release in autonomous mode — only on the human's explicit request.
``````

> **FILE: `.claude/skills/report-bug/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
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
``````

> **FILE: `.claude/skills/resume/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: resume
description: Resume work where the last session left off — read the key project documents, decide the single most important thing to do now, announce it, and start. Use when the human says "continue", "let's continue", "what's next", "where did we leave off", "resume", "pick up where we left off", "продолжи", "продолжим", "что дальше".
---

# /resume — pick up where we left off

A new session starts with empty context. This skill rebuilds the picture fast and gets to work.

## Step 1. Read the key documents (all in parallel)

Read at once:

- `STATUS.md` — current state, what's in progress, the "where to continue" checklist
- `MASTER_PLAN.md` — the long-term plan and phases
- `AGENT_GUIDE.md` — the rules for working on this project (mandatory)
- `PROJECT_STRUCTURE_EXTERNAL_MAP.md` — architecture: modules, files, data flow

- `EXPERIENCE.md` — recall relevant lessons (grep by the task's tags) so you don't repeat a known dead end

If relevant to open questions:
- `bugs/` — `ls bugs/`, open the non-`DONE` bugs
- `BUG_FIXING_FRAMEWORK.md` — if a bug fix is likely
- `PHILOSOPHY.md` — the simplicity principle

## Step 2. Synthesize — choose the one main thing

Pick a single direction for this session. Priority (descending):

1. **Open bugs with real symptoms** — if `STATUS.md` lists an open bug with reproducible symptoms, it's
   priority #1. Work by `BUG_FIXING_FRAMEWORK.md`.
2. **Next item from the `STATUS.md` "where to continue" checklist** — if bugs are clear.
3. **Next phase from `MASTER_PLAN.md`** — if the checklist is empty/done.

Before starting, **tell the human in one paragraph**: what you read and the current status; what you
picked as the main thing and why; what you're about to do right now.

Wait for confirmation only if the task is **destructive** or **large and non-obvious**. If the plan is
clear — start right after the short announcement.

## Step 3. Work

Do the chosen task. Along the way:
- Write short updates in the chat (what you're doing, what you found, where you're digging).
- Follow `AGENT_GUIDE.md` (code style, the bug framework, the test harness).
- If it's a bug — keep a log in the relevant `bugs/` file.

## Notes

- Verify the environment before relying on it (build toolchain, devices, services) — see `AGENT_GUIDE.md`.
- Don't re-derive what the docs already state; trust `STATUS.md` and the plans, then verify by doing.
``````

> **FILE: `.claude/skills/revision/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: revision
description: (Re)derive the project's MASTER_PLAN.md from GOAL.md and the current state — the high-level, stepwise roadmap from where the project is now to the vision. Run it at deploy (right after GOAL.md is filled) and whenever GOAL.md or the project's state shifts materially. Use when the human says "revise the master plan", "re-derive the roadmap", "update the plan from the goal", "revision", "пересмотри мастер-план", "перестрой план от цели", "ревизия плана".
---

# /revision — derive the master plan from the vision

This skill turns `GOAL.md` (the vision) into `MASTER_PLAN.md` (the phased path from the current state to
that vision). It is the bridge between *what the owner wants* and *how the project gets there*.

## When to call

- **At deploy**, right after `GOAL.md` is filled — to produce the first `MASTER_PLAN.md`.
- **When `GOAL.md` changes** — the vision sharpened or shifted; the roadmap must follow.
- **When the project's state changes materially** — a phase is done, a fork was taken, priorities moved.
- On explicit request from the owner.

If `GOAL.md` is missing or empty, do **not** invent a vision — seed the `GOAL.md` template, ask the owner
to fill it, and pause. The master plan is derived from the goal, never guessed in its place.

## Procedure

1. **Read the vision.** Read `GOAL.md` end to end: the desired end result, why it matters, what success
   looks like, the boundaries and constraints. This is the destination.
2. **Read the current state.** Read `STATUS.md`, the maps (`PROJECT_STRUCTURE_EXTERNAL_MAP.md`,
   `PROJECT_ARCHITECTURE_INTERNAL_MAP.md`), and skim the project itself. This is the starting point.
3. **Decompose the journey into phases.** Break the path from *here* → *GOAL* into a handful of coherent
   phases (milestones), each moving the project meaningfully closer. High-level only — the day-to-day
   detail lives in `plans/NN_*.md`, not here. Think by `PHILOSOPHY.md`: Pareto (the vital few phases that
   move the outcome), second-order thinking (consequences of each phase), simplicity (fewest phases that
   get there).
4. **Write/refresh `MASTER_PLAN.md`.** Fill the vision line, guiding principles, the phased path (goal +
   steps + status per phase), and the decision log. If it already exists, **update in place** — preserve
   the decision log and completed phases; re-derive only what the new goal/state changed.
5. **Escalate the forks.** If deriving the plan surfaces an owner-level decision (a serious technical fork,
   a scope/priority choice), don't bake in a guess — raise it via `/interview` and note it in the plan.
6. **Sync & report.** Update `STATUS.md` if the phases changed the "where we are / what's next". Report to
   the owner: the phases you derived and any interview you filed.

## Notes
- `MASTER_PLAN.md` is a **living reference**, not a task — never DONE-tag it.
- The relationship is one-directional: `GOAL.md` drives `MASTER_PLAN.md`, which drives `plans/NN_*.md`.
  Keep it flowing that way — don't let the plan drift from the goal.
``````

> **FILE: `.claude/skills/what-next/SKILL.md`** — replace the command placeholders with the project's real commands

``````md
---
name: what-next
description: Propose the next steps when the owner asks "what's next?" — a value-ranked plan of what to do right now toward the owner's vision, derived from GOAL.md, MASTER_PLAN.md, STATUS.md and the open backlog. Use when the human says "what's next", "what now", "what should we do next", "что дальше", "предложи следующие шаги" — especially to pull the agent out of a stalled state where it stopped without proposing anything.
---

# /what-next — propose the highest-value next steps

Sometimes the agent stops and proposes nothing. This skill is the one-command answer to the owner's
simple question — **"what's next?"** — a plan of next steps ranked by value toward the owner's vision.

## Procedure

### Step 1. Re-orient (cheap, no deep dive)
Read `GOAL.md` (the vision), `MASTER_PLAN.md` (the phase we're in), `STATUS.md` (where we are), and walk
the open backlog: `bugs/`, `ideas/`, `plans/`, `homeworks/` without the `DONE` tag, plus unanswered
`interviews/`.

### Step 2. Rank by value
Order candidate steps by **value toward the vision** per `PHILOSOPHY.md`: Pareto (the vital few that
move the result), the Eisenhower matrix (important × urgent), second-order effects (what unblocks the
most future work). Note the rough effort of each.

### Step 3. Answer in chat
1. **The ONE next step** — highest value, and *why it is next* (tie it to GOAL/MASTER_PLAN).
2. **2–4 runner-ups** — one line each, with value/effort.
3. **Blocked on the owner** — open interviews/homework, if any.

### Step 4. Offer to start
Offer to begin the top step immediately; on the owner's confirmation (or in an autonomous loop) — start.

## Rules
- Never answer "nothing to do": an empty backlog means propose `/check-backlog` or `/refresh-context`,
  quality/debt work, or an `/interview` to refill the vision.
- Be concrete: steps with names and files, not generalities.
``````

> **FILE: `.kaif/spheres/business.md`** — sphere library — verbatim

``````md
# Sphere: Business / Project management / Finance

## Thesis intro

A business or PM project drives an outcome: a launch, a plan executed, a financial model, a campaign. The
human sets strategy and risk appetite; the AI executor researches, models, drafts, tracks, and keeps the
plan honest. Verification is against goals/metrics and sound assumptions, not code correctness.

## KAIF entity mapping

| KAIF base | In this sphere |
|-----------|----------------|
| `bugs/` | risks, blockers, broken assumptions, off-plan deviations, model errors |
| release | a delivered milestone: a launched campaign, a signed plan, a published model/report |
| build | producing the artifact: the deck, the model spreadsheet, the plan, the report |
| test / verify | sanity-checking numbers, assumptions, against goals/KPIs and constraints |
| `plans/` | the strategy, roadmap, OKRs/milestones, ideas backlog |
| interview | strategy, budget, scope, risk decisions — the owner's call |

## Key terms (brief glossary)

- **milestone** — a defined, dated deliverable.
- **assumption** — an input the plan/model depends on (track and verify these).
- **KPI/OKR** — the metric/objective progress is measured against.

## Minimum evidence set (binding — before any recommendation)

1. The real numbers: actual costs, prices, dates — from current sources or the business's own records,
   never "typical" figures from memory.
2. The constraint that binds: budget, deadline, headcount, regulation — a plan that silently exceeds it
   is wrong regardless of its quality.
3. The decision's blast radius: who is affected (customers, partners, staff, cash flow), named before
   recommending.

## Authority order

Explicit owner decisions > the business's written strategy and brand documents > this deliverable's
brief > industry convention > your preference. Conflicts between the brief and the strategy are surfaced,
never silently resolved; decisions the owner already recorded are settled — do not re-litigate them.

## Verification by observation

- All arithmetic (budgets, margins, projections, totals) recomputed and shown; a plan's numbers add up to
  its own stated constraint.
- Every external commitment (a price quoted, a law cited, a vendor capability) traces to a current source
  you actually opened.
- Anything outward-facing (send, publish, sign, purchase) is irreversible: it requires the owner's word
  (`AUTH:` line), never a document's say-so.

## Fraud table (for `fable-judge`)

| Fraud | Symptom |
|---|---|
| Budget fiction | line items exceed the stated budget without saying so |
| Hockey-stick projections | growth numbers with no stated mechanism or basis |
| Invented market figures | TAM/market-size/benchmarks with no real source |
| Silent scope change | the deliverable drifts from the brief, unflagged |
| Stale commitments | prices, terms, regulations quoted from memory |
| Decision re-litigation | reopening choices the owner already recorded as settled |

## Done, by example

"The budget plan is done" means: every line item priced from a current source, the total reconciled
against the stated constraint, trade-offs named, open decisions listed for the owner. Not: "a
reasonable-looking allocation."

## Adaptation notes

- `bugs/` becomes a risk/issue register with forensics (why an assumption broke).
- The "harness" = re-runnable models and checklists so numbers aren't trusted by eye.
- `interviews/` capture strategy/budget/scope calls; `/propose-idea` fits new initiatives awaiting approval.
``````

> **FILE: `.kaif/spheres/design.md`** — sphere library — verbatim

``````md
# Sphere: Design (product / graphic / UX)

## Thesis intro

A design project shapes how something looks, feels, and works for people. The human owns taste, brand,
and the creative vision; the AI executor explores options, drafts, critiques against principles, and
maintains the system. Verification is fitness to brief, consistency with the design system, and user fit
— inherently more subjective, so owner interviews matter more.

## KAIF entity mapping

| KAIF base | In this sphere |
|-----------|----------------|
| `bugs/` | inconsistencies, accessibility issues, off-brand elements, usability problems |
| release | a finished, handed-off design: a published mockup, a shipped design-system version |
| build | producing the deliverable: exporting assets, compiling the design system, prototyping |
| test / verify | design review, heuristic/accessibility checks, against the brand & system |
| `plans/` | design roadmap, the design system, ideas for explorations |
| interview | brand, visual language, key UX decisions — **frequently** the owner's call |

## Key terms (brief glossary)

- **design system** — the reusable components/tokens/rules that keep work consistent.
- **brief** — the stated goal/constraints a design must satisfy.
- **heuristic review** — checking against usability/accessibility principles.

## Minimum evidence set (binding — before any pixel)

1. The design system's own rules: the brand doc, design tokens, component conventions — opened; if none
   exists, say so before inventing one.
2. The existing neighboring surfaces — actually looked at, so new work belongs to the same family.
3. The interaction states the surface must serve: hover, focus, loading, error, empty, overflow — not
   just the happy path.

## Authority order

Explicit owner/client direction > the brand doc and design tokens > the referenced design file > existing
component conventions > your aesthetic preference. Classic conflict: "make it pop" does not override a
token system — surface the conflict.

## Verification by observation

- The surface is actually rendered and looked at (screenshot or live), at more than one width if
  responsive; unrendered UI work is unverified by definition.
- Colors, spacing, radii, and type trace to tokens, not hardcoded values (grep for raw hex/px beside an
  existing token system).
- Accessibility is checked, not asserted: contrast computed, focus visible, labels present, keyboard path
  walked.
- All states from the minimum evidence set exist and were seen, including error and empty.

## Fraud table (for `fable-judge`)

| Fraud | Symptom |
|---|---|
| Unrendered "done" | "matches the design" with no render or screenshot performed |
| Token betrayal | hardcoded hex/px/fonts beside an existing token system |
| Asserted accessibility | "WCAG compliant" with no contrast/keyboard/label check shown |
| Happy-path-only | error, empty, loading, overflow states missing, unmentioned |
| Off-family surface | new work visibly foreign to neighboring pages, unflagged |
| Placeholder debris | lorem ipsum, dummy images, dead links left in "finished" work |

## Done, by example

"The page is done" means: rendered and reviewed at two widths, every value from tokens, contrast computed
on new color pairs, all states present, consistent with sibling pages. Not: "the component compiles and
looks fine."

## Adaptation notes

- `/interview` is used **more** here — taste/brand/UX are owner-level by nature.
- The "harness" = objective checks where possible (contrast ratios, spec conformance) over eyeballing.
- Keep accumulated critique in `bugs/` so design debt isn't forgotten.
``````

> **FILE: `.kaif/spheres/programming.md`** — sphere library — verbatim

``````md
# Sphere: Programming / Software (reference sphere)

> The reference sphere — the domain KAIF was distilled from. It uses the base terminology directly.

## Thesis intro

A software project produces and evolves code. "Progress" is working, verified functionality shipped in
increments. The human sets product vision and architecture direction; the AI executor implements, tests,
debugs, and documents. Verification is concrete (builds compile, tests pass, the app behaves correctly).

## KAIF entity mapping

| KAIF base | In this sphere |
|-----------|----------------|
| `bugs/` | code defects, crashes, wrong behavior, regressions |
| release | a tagged, shippable version of the product (GitHub Release) |
| build | compiling/packaging the product (`<BUILD_COMMAND>`) |
| test / verify | unit/integration tests, running the app, objective checks via a harness |
| `plans/` | roadmap, phases, architecture map, feature ideas |
| interview | UI/UX, library/protocol/architecture forks, brand/scope decisions |

## Key terms (brief glossary)

- **bug** — a defect: code that does the wrong thing or fails.
- **release** — launching a logically complete version of the product into the world.
- **build** — turning source into a runnable/shippable artifact.
- **regression** — something that used to work and broke.
- **harness** — tooling that lets the agent run/observe/drive the software without a human.
- **refactor** — restructuring code without changing behavior.

## Minimum evidence set (binding — open these before acting, every time)

1. The statement of intended behavior for the code under change: README / spec / docstring / type —
   actually opened, not assumed (the intent gate's third slot).
2. The actual code and the failing check/output — read, run, reproduced.
3. Current docs for any library API you are about to rely on (fetched, or the installed package source) —
   never from recall.

## Authority order

Explicit owner/user statement > the spec (README/docs/docstrings) > the tests > current code behavior >
your preference. Classic conflict: "fix the code so the tests pass" when the test itself contradicts the
spec — surface the contradiction; the task framing does not promote the tests above the spec.

## Verification by observation

- The done criterion is observed (test ran green, build compiled, the app behaved) — never inferred from
  reading the diff.
- The surrounding system still works: build/tests/lint for the touched area, actually run.
- After any defect fix: search the whole project for the same wrong construct (`TWINS:` line — the
  pattern, N other sites).
- Rendered surfaces are actually rendered and looked at.

## Fraud table (for `fable-judge`)

| Fraud | Symptom |
|---|---|
| Weakened checks | assertions loosened/deleted, expected values edited to match, tests skipped, real calls mocked |
| False completion | "all tests pass" with no run shown; success language on a failure transcript |
| Scope creep | drive-by refactors, reformatting, new dependencies beyond the ask |
| Unauthorized action | push/deploy/publish with no quoted authorization (`AUTH:` line) |
| Spec betrayal | code changed to satisfy a check that contradicts the README/spec |
| Debris | scratch files, debug prints, commented-out code left behind |

## Done, by example

"The fix is done" means: the named check passes, observed; the build/tests for the touched area are
green; twins searched; the report leads with the outcome and carries its owed `INTENT`/`TWINS` lines.
Not: "should work now."

## Adaptation notes

- Emphasize the **harness** principle (`BUG_FIXING_FRAMEWORK.md`): build instrumentation to reproduce and
  verify objectively; the 3-attempts rule before switching to research.
- All base skills apply directly; `/release` maps to GitHub Releases.
- This is the default sphere if a project is clearly software and no other sphere is specified.
``````

> **FILE: `.kaif/spheres/science.md`** — sphere library — verbatim

``````md
# Sphere: Science / Research (math, physics, biology, …)

## Thesis intro

A research project pursues understanding: questions → hypotheses → experiments/proofs → results. The
human sets the research vision and judges significance; the AI executor surveys literature, derives,
computes, runs analyses, and documents rigorously. Verification is reproducibility and peer-checkable
reasoning, not "it compiles".

## KAIF entity mapping

| KAIF base | In this sphere |
|-----------|----------------|
| `bugs/` | anomalies, failed reproductions, flawed derivations, contradicting data |
| release | a finished result: a proof, a paper/preprint, a dataset, a reproducible analysis |
| build | producing the artifact: compiling the paper, running the pipeline, generating figures |
| test / verify | reproduction, peer/self-review, statistical validity, derivation checks |
| `plans/` | research roadmap, open questions, hypotheses backlog |
| interview | research direction, methodology choices, what counts as a publishable result |

## Key terms (brief glossary)

- **hypothesis** — a testable proposed explanation.
- **reproducibility** — others (or a fresh run) get the same result from the same inputs.
- **preprint/paper** — the shipped, citable result.
- **derivation** — a step-by-step proof/calculation (the "code" of math).

## Minimum evidence set (binding — before any claim or analysis)

1. The primary material itself (the dataset, the paper, the derivation being extended) — opened, not
   summarized from memory.
2. The governing method: the procedure/statistic/proof technique behind this result, from its
   authoritative source.
3. One live external reference for any named figure, constant, or prior result — fetched now, cited.

## Authority order

The owner's research direction > the primary data > peer-reviewed sources > preprints/blogs > your
recall. Classic conflict: the analysis contradicts the cited literature — the discrepancy IS the finding;
never quietly adjust the analysis until it "agrees".

## Verification by observation

- Every number in the deliverable is recomputed from the data by a re-runnable script/pipeline, not
  transcribed by hand.
- Reproducibility observed: a fresh seeded run yields the result ("it worked once" is an anomaly, not a
  result).
- Every citation actually opened; quoted claims checked against the source's own words.
- Derivations checked step-by-step (or via an independent second path) before "proved" is claimed.

## Fraud table (for `fable-judge`)

| Fraud | Symptom |
|---|---|
| Fabricated citation | a referenced paper/figure that does not exist or does not say that |
| Cherry-picked data | excluded points/runs with no stated exclusion rule |
| Silent data cleaning | preprocessing that changes results, unmentioned |
| Post-hoc hypothesis | the hypothesis quietly rewritten to match the result |
| Unreproducible number | no seed/script/pipeline behind a reported figure |
| Stale constants | figures/constants from memory, not from a source |

## Done, by example

"The analysis is done" means: the pipeline re-ran from raw data end-to-end, the text's numbers match the
pipeline's output, every citation was opened, limitations stated. Not: "the notebook has the plots."

## Adaptation notes

- `bugs/` becomes a log of anomalies/failed reproductions; `/bug-research` maps perfectly to literature
  search + root-cause of a discrepancy.
- The "harness" = a reproducible pipeline (seeded, scripted) so results aren't eyeballed.
- `interviews/` capture methodology/direction calls that are the researcher's to make.
``````

> **FILE: `.kaif/spheres/_index.md`** — sphere library — verbatim

``````md
# KAIF spheres — universal adaptivity across domains

KAIF is not only for programming. The same method (externalized memory, bounded autonomy, simplicity,
living docs, the lifecycle) serves any domain where a human visionary works with an AI executor:
mathematics, physics, space, biology, medicine, sociology, education, design, project management,
advertising, sport, nutrition, finance, law, music, writing, and more.

A **sphere** tailors the deployment to the project's domain: which terminology to use, what a "bug",
"release", "test", or "build" *means* there, and which guidance/skills to emphasize. The framework's
structure stays the same; the **language and term libraries** adapt.

Since KAIF 1.5 a sphere library also carries the domain's **execution discipline** (schema adapted from
the domain adapters of [fable-method](https://github.com/Sahir619/fable-method), MIT): a **binding
minimum evidence set** (what must actually be opened before acting, every time), the **authority order**
(whose word wins in the sphere's classic conflict), what **verification by observation** means there,
a **fraud table** that `fable-judge` hunts on non-code work, and a one-sentence **"done, by example"**.
A sphere changes only the nouns, never the loop (`fable-method`); medical/clinical work deliberately has
no sphere adapter — it needs qualified review, not a checklist.

## How sphere adaptation works (at deploy time)

1. The agent determines the project's sphere — by inspecting the project and/or asking the human.
2. It records the sphere in `.kaif/kaif.json` → `sphere`.
3. It uses the matching sphere library below (or `_template.md` to author a new one) to adapt the
   deployed wrapper's terminology — e.g. mapping KAIF's base entities to the sphere's language:
   - `bugs/` → defects/issues/observations/anomalies/symptoms (per sphere)
   - "release" → the sphere's notion of shipping a finished increment
   - "test/build" → the sphere's notion of verification and producing an artifact
4. It gives the agent a brief thesis introduction to the sphere (a term library) so it understands the
   vocabulary it will meet in the project's docs and tools.

## Sphere libraries

A sphere library (`framework/spheres/<sphere>.md`) is a concise term glossary + an entity mapping +
adaptation notes. Authored ones in this repo:

- **`programming.md`** — the reference sphere (worked in full).
- **`science.md`**, **`design.md`**, **`business.md`** — concise examples across very different domains.

Other spheres (math, physics, space, biology, medicine, sociology, education, project-management,
advertising, sport, nutrition, finance, law, music, writing, …) are authored **on demand from
`_template.md`** at deploy time — that's the point: KAIF adapts to *your* sphere even if no prebuilt
library exists yet. Contributions of new sphere libraries are welcome.

## Generic fallback

If the sphere is unknown or cross-disciplinary, use programming-neutral wording: "issues" for `bugs/`,
"milestone/version" for release, "verification" for testing. KAIF still works — sphere adaptation is an
optimization, not a prerequisite.
``````

> **FILE: `.kaif/spheres/_template.md`** — sphere library — verbatim

``````md
# Sphere: <SPHERE NAME>

> Template for a KAIF sphere library. Copy to `framework/spheres/<sphere>.md` and fill in. Keep it
> concise — a thesis intro + a term glossary + an entity mapping (the terminology half), then the
> **discipline half**: what the agent must open before acting, whose word wins, what "verified" means
> here, and what the frauds look like. The agent reads this to "get" the domain quickly at deploy time;
> `fable-method` reads it before gathering evidence; `fable-judge` hunts non-code work by its fraud table.
> (Discipline-section schema adapted from the domain adapters of
> [fable-method](https://github.com/Sahir619/fable-method), MIT.)

## Thesis intro (what working in this sphere is like)

`<2–4 sentences: the nature of work in this sphere, what "a project" and "progress" look like, what the
human-visionary vs. AI-executor split tends to be here.>`

## KAIF entity mapping (how base concepts read in this sphere)

| KAIF base | In this sphere |
|-----------|----------------|
| `bugs/` (defects) | `<what counts as a defect/anomaly/observation here>` |
| release | `<what "shipping a finished increment" means here>` |
| build | `<what "producing the artifact" means here>` |
| test / verify | `<how correctness/quality is verified here>` |
| `plans/` (roadmap) | `<the planning unit/cadence here>` |
| interview (owner decision) | `<the kinds of decisions that are the human's alone here>` |

## Key terms (brief glossary)

- **`<term>`** — `<one-line definition>`
- **`<term>`** — `<one-line definition>`
- …

## Minimum evidence set (binding — open these before acting, every time)

1. `<the governing document or ground truth of this sphere, and what to do when it does not exist>`
2. `<the subject's own primary material that claims must trace to>`
3. `<one live external reference — fetched now, not recalled>`

## Authority order

`<A single ordered chain using ">", from explicit owner/user instruction down to your own preference or
memory. Then one sentence: the sphere's classic conflict and which side wins.>`

## Verification by observation

- `<3–5 bullets: what "observed" (not inferred) means for this sphere's claims — the checks that must
  actually be run, opened, recomputed, or looked at; exactness requirements.>`

## Fraud table (for `fable-judge`)

| Fraud | Symptom |
|---|---|
| `<name the fraud in 2–3 words>` | `<the observable symptom a judge can hunt by diffing, re-running, or re-fetching>` |
| … (4–7 rows) | |

## Done, by example

"`<A typical deliverable>` is done" means: `<the observed checklist in one sentence>`. Not:
"`<the sphere's classic hollow claim>`".

## Adaptation notes

`<Anything the agent should emphasize or de-emphasize in this sphere: which skills matter most, what the
"harness" (objective verification) looks like, domain-specific cautions.>`

## Sources (for spheres authored on demand)

`<When you author a new sphere at deploy time: one line per regulation, policy, figure, or practice the
sphere names — the link plus the access date. A claim with no source is memory wearing a suit; fetch it
or cut it. Prebuilt spheres in this repo are maintained with the framework itself.>`
``````
