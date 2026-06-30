<!--
  This file is the narrative spine of FRAMEWORK.md.
  FRAMEWORK.md is GENERATED from this file by tools/build-framework.mjs:
  the {{EMBED:...}} and {{EMBED_SKILLS}} markers below are replaced with the
  actual template files from framework/. Do NOT edit FRAMEWORK.md by hand —
  edit this file (or the templates) and re-run the build tool.
-->
# KRINIKS — AI Agent Framework

### The self-extracting core · v{{VERSION}}

> **A context-resilient, autonomy-disciplined operating framework for AI coding agents.**
> Turn any AI coding agent (Claude or otherwise) into a disciplined, autonomous, context-resilient
> teammate on any software project.

> **Author:** Mikalai Kryvusha aka **KOT KRINIK** · Николай Кривуша aka Кот Криник
> **License:** MIT · **Repository:** https://github.com/MikalaiKryvusha/kriniks_ai_agent_framework
> 🇬🇧 English (primary) · 🇷🇺 Русский: see `FRAMEWORK.ru.md`

---

## 0. What this document is

This is a **self-extracting document**. It is, at once:

1. **A complete description** of the KRINIKS framework — its philosophy, structure, conventions, and skills.
2. **An installer.** Hand this single file to an AI agent and say *"unpack the KRINIKS framework into this
   project per FRAMEWORK.md"* — the agent reads it and writes out the entire structure (guidance docs,
   directory conventions, and slash-skills), customized to the project.

Everything the agent needs to recreate the framework is **inside this one document** — the templates are
embedded inline. You don't need anything else.

### The problem it solves

AI coding agents are powerful but suffer two chronic failures:

- **They forget.** Context is lost between sessions. Every new session starts from zero: re-discovering
  the architecture, the decisions, the half-finished work, the bug it was chasing yesterday.
- **They drift.** Left autonomous, an agent either stalls (over-engineering a misunderstood task) or
  oversteps (making brand/architecture decisions that weren't its to make).

KRINIKS fixes both by **externalizing the agent's working memory and discipline into the repository
itself** — as a small set of markdown files, directory conventions, and repeatable slash-skills. The
result: any fresh session resumes instantly with full context, works autonomously within clear bounds,
and accumulates knowledge instead of evaporating it.

It is not code. It is **process, captured as files an agent reads.** It works with any language, any
stack, any project.

---

## 1. How to use this document

### If you are a human (the project owner)

1. Download `FRAMEWORK.md` into the root of your project (or clone this repository alongside it).
2. Open your AI coding agent in the project and tell it:
   > *"Read FRAMEWORK.md and unpack the KRINIKS framework into this project."*
3. The agent will inspect your project, create the structure, and fill in the project-specific details
   (build command, architecture, etc.). It will **ask your preferred working language** (default English)
   and may ask a few owner-level questions (brand, license) via a short interview document — answer them.
4. From then on, drive your agent with the skills: `/resume` to start a session, `/pause` to wrap up,
   `/autoloop` (or `/dayloop` / `/nightloop`) to grind the backlog autonomously, and the rest as needed.

See **Part VIII — For the human: quick start** for the full walkthrough.

### If you are an AI agent

1. Read this entire document.
2. Follow **Part VII — Unpacking** step by step. Inspect the target project, then write out the structure
   from the templates embedded here, replacing every `<PLACEHOLDER>` with the project's real values.
3. Commit, and report to the human what you created and what still needs their input.

### 🌍 Localized deployment — the developer's working language

The framework's **sources are written in English** (the shared community language). But a team works best
reading its own project in its own language. So **deployment is localized**: when unpacking, the agent
**asks the owner for their preferred working language** (default: English) and writes the *deployed*
wrapper — the four guidance docs, the twelve skills, and the `plans/`/`bugs/`/`interviews/` documents — in
that language. The framework unpacks *from its English sources into the developer's chosen language*.

- **Localize:** all prose, headings, list items, table text, and each skill's `description:` field
  (including its trigger phrases — so the agent matches commands in the owner's language).
- **Keep canonical (never translate):** code, shell commands, file paths, URLs, identifiers, the skills'
  `name:` field (the `/command` ids like `resume`, `pause`), and the `Co-Authored-By` trailer.

> This repository is itself the living example: its public payload (`framework/`, `FRAMEWORK.md`) is
> English, while its own working wrapper is in **Russian** — the language its owner works in. Your
> deployment picks whatever language suits *you*.

### ⚠️ The fractal caveat — read this before unpacking

This framework is **dogfooded**: the repository you may be looking at (`kriniks_ai_agent_framework`)
*uses the framework on itself*. Its own root contains an `AGENT_GUIDE.md`, `STATUS.md`, `.claude/skills/`,
`plans/`, `bugs/`, and `interviews/` — but those describe **the development of the framework itself**, not
your project.

> **When unpacking into a user's project, derive everything from THIS document (`FRAMEWORK.md`) only.**
> Do NOT copy the framework repository's own root `AGENT_GUIDE.md` / `STATUS.md` / etc. — they are the
> framework's self-application and are about building the framework, not about your project. The embedded
> templates in this document are the canonical, generic source. (This is the resolution of the recursion:
> the self-extracting document is the single source of truth for deployment.)

---

## 2. Philosophy — why this framework exists

Four ideas hold the whole thing together:

**1. Externalized memory.** The agent's working state lives in files, not in the conversation. Four
documents carry it: `AGENT_GUIDE.md` (the canon — rules, map, commands), `STATUS.md` (the living state —
what's done, where we are, what's next), `PHILOSOPHY.md` (how to think), `BUG_FIXING_FRAMEWORK.md` (how to
debug). A new session reads these and is immediately productive. The agent **maintains them** as it works —
they are living documents, not write-once files.

**2. Knowledge that accumulates.** Bugs, decisions, and proposals don't vanish into chat history. Each
bug becomes a document in `bugs/` (symptom → forensics → root cause → fix). Each owner decision becomes an
`interviews/` document. Each agent idea becomes a `plans/ideas/` document. The repository becomes a
growing knowledge base about *how this project is built and why*.

**3. Bounded autonomy.** The agent is trusted to work alone for hours — but it knows exactly which
decisions are its own (anything cheap to reverse) and which belong to the human (brand, UX, architecture —
anything that shapes the product long-term). The latter are escalated through `interviews/`, not guessed.
The loop skills (`autoloop`/`dayloop`/`nightloop`) encode this: grind autonomously, escalate the
fateful, never go interactive when the human is away.

**4. Simplicity above cleverness.** The prime directive (`PHILOSOPHY.md`): if something is taking too
long, the task isn't hard — you misunderstood it and are over-complicating. Stuck = re-understand and
simplify, never escalate complexity. KISS + Occam's Razor, enforced by a hard 3-attempts rule before
switching from poking to research.

---

## 3. The structure at a glance

Unpacking the framework into a project produces this layout:

```
<project root>/
├── AGENT_GUIDE.md              # THE canon — read before every task (rules, map, commands, conventions)
├── PHILOSOPHY.md               # how the agent thinks: KISS + Occam (the simplicity principle)
├── BUG_FIXING_FRAMEWORK.md     # how the agent debugs: the fix→build→test loop, the 3-attempts rule
├── STATUS.md                   # the living state — updated after every significant task
│
├── plans/                      # strategy & knowledge
│   ├── master_plan.md          #   the roadmap and phases (where we're going)
│   ├── project_map.md          #   the architecture map (how it's built)
│   └── ideas/                  #   agent/human feature proposals — NN_*.md, DONE-tagged when shipped
│
├── bugs/                       # one NN_*.md per bug (symptom/repro/forensics/root cause/fix), DONE-tagged
├── interviews/                 # interview_NNN_*.md — A/B/C questions for the human on owner-level decisions
│
└── .claude/
    └── skills/                 # the repeatable rituals (slash-skills)
        ├── resume/SKILL.md         # start a session — read docs, pick the main thing, begin
        ├── pause/SKILL.md          # end a session — update STATUS/README, build, commit, push
        ├── autoloop/SKILL.md       # autonomous series over a task pool (self-restarting)
        ├── dayloop/SKILL.md        # continuous autonomous work while the human is busy
        ├── nightloop/SKILL.md      # autonomous work until a wake time / the human returns
        ├── refresh-context/SKILL.md# re-read docs, rebuild the backlog
        ├── check-backlog/SKILL.md  # revise the backlog, tag finished work DONE
        ├── report-bug/SKILL.md     # file a bug document
        ├── bug-research/SKILL.md   # deep investigation without coding (after 3 failed attempts)
        ├── propose-idea/SKILL.md   # propose a feature (needs human approval)
        ├── interview/SKILL.md      # ask the human owner-level questions
        └── release/SKILL.md        # ship a release to GitHub
```

Plus one wiring step: the agent's auto-loaded context file (`CLAUDE.md` for Claude Code, or `AGENTS.md`
for some agents) is pointed at `AGENT_GUIDE.md` so every session reads the canon.

> **Note on skills directory.** The skills above use the Claude Code convention
> (`.claude/skills/<name>/SKILL.md`, with YAML frontmatter `name` + `description`). For a different agent,
> place the same SKILL.md content wherever that agent discovers commands, or simply keep them as
> documents the human invokes by name — the *content* is what matters, not the path.

---

## 4. The four guidance documents

These four files are the agent's brain on disk. Each template below is generic: replace every
`<PLACEHOLDER>` with the project's real value during unpacking. `PHILOSOPHY.md` and
`BUG_FIXING_FRAMEWORK.md` are universal — copy them verbatim.

{{EMBED:framework/AGENT_GUIDE.md}}

{{EMBED:framework/PHILOSOPHY.md}}

{{EMBED:framework/BUG_FIXING_FRAMEWORK.md}}

{{EMBED:framework/STATUS.md}}

---

## 5. The knowledge directories

### `plans/` — strategy & knowledge

- **`master_plan.md`** — the project's roadmap: vision, principles, tech stack, the phased plan
  (Phase 0…N with milestones), and a decision log. This is "where we're going." Created by inspecting the
  project and interviewing the owner about vision.
- **`project_map.md`** — the architecture map: modules/components, what each is responsible for, the
  dependency rules between them, and the data-flow diagram. This is "how it's built." Kept in sync with
  the real code; a fresh session reads it to navigate.
- **`ideas/`** — feature proposals, one `NN_<name>.md` each (see `/propose-idea`). DONE-tagged when shipped.
- Reference docs (`master_plan.md`, `project_map.md`, `goal.md`, worklogs, `homework_*.md`) are **living
  references, not closable tasks** — never DONE-tagged.

### `bugs/` — one document per defect

Every bug — even a small one — gets a `bugs/NN_<name>.md` (see `/report-bug`): symptom, deterministic
repro, forensics, root cause/hypotheses, fix plan, links. While open, no `DONE` tag. When fixed and
verified, `git mv` it to `NN_DONE_<name>.md` and append a `## ✅ STATUS: DONE (date)` section. This is the
agent's own bug backlog — nothing is lost, and any bug can be picked up cold by a future session.

### `interviews/` — owner-level decisions

`interview_NNN_<topic>.md` (see `/interview`): closed A/B/C questions with a recommendation first,
answered by the human **directly in the document**. Used only for decisions the agent must not make alone
(UI/UX, serious technical forks, brand/vision/priorities). The async, document-based format keeps the
agent unblocked: it files the questions, pauses, and the human answers when convenient.

---

## 6. The skills

The skills are the framework's repeatable rituals — the verbs of working on a project. Each is a
`.claude/skills/<name>/SKILL.md` file with YAML frontmatter (`name`, `description`). The `description`
is what the agent matches against to trigger the skill; keep the trigger phrases (including the
owner's language) intact.

During unpacking, copy each skill verbatim, replacing the command placeholders
(`<BUILD_COMMAND>`, `<COMMIT_COMMAND>`, `<TEST_HARNESS>`) with the project's real commands.

| Skill | When | Purpose |
|-------|------|---------|
| `resume` | session start | Read the docs, pick the one main thing, announce, begin. |
| `pause` | session end | Update STATUS & README, build, commit, push, report. |
| `autoloop` | autonomy | Grind a pool of autonomous tasks in a self-restarting series. |
| `dayloop` | autonomy | Continuous autonomous work while the human is busy (no time stop). |
| `nightloop` | autonomy | Autonomous work until a wake time / the human returns. |
| `refresh-context` | hygiene | Re-read the master plan, map, and guidance; rebuild the backlog. |
| `check-backlog` | hygiene | Walk `bugs/`+`plans/`, tag finished work DONE, return the open list. |
| `report-bug` | knowledge | File a bug document by the canon. |
| `bug-research` | knowledge | Deep investigation without coding, after 3 failed fix attempts. |
| `propose-idea` | knowledge | Propose a feature/improvement for the human's approval. |
| `interview` | human | Ask the owner closed A/B/C questions on a fateful decision. |
| `release` | shipping | Publish a release to GitHub (with confirmation; never autonomously). |

{{EMBED_SKILLS}}

---

## 7. Conventions (cross-cutting rules)

These rules apply to all work and are referenced throughout the guidance docs and skills.

- **The DONE tag.** Closed `bugs/` and `plans/ideas/` files get `DONE` inserted after their number via
  `git mv` (`13_x.md` → `13_DONE_x.md`), plus an appended status section. The file listing alone then
  shows what's open vs. closed. Reference docs are never tagged. (Skill: `/check-backlog`.)
- **Commits.** `feat:` / `fix:` / `docs:` / `refactor:` / `ci:` + one line. End every message with a
  `Co-Authored-By:` trailer naming the agent. Commit small and often — progress is never lost to a crash
  or a context reset.
- **Git workflow.** A simple, effective default (used by this framework's own project): work only in
  `main`, no feature branches; to undo, use git history (`git revert`, `git checkout <hash> -- file`).
  Pick what fits and state it in `AGENT_GUIDE.md` so the agent doesn't improvise.
- **Comment the code.** Comment non-trivial blocks, modules, and important lines — what they do, why, and
  what they connect to. This is for traceability across context-losing sessions.
- **Narrate progress.** Write short natural-language updates in the chat so the human can glance in and
  follow along — even (especially) during autonomous loops.
- **Read fresh logs.** Always check the current time and the log's timestamp before reading — never act on
  stale logs.
- **Absolute dates.** Convert relative dates ("today", "yesterday") to absolute ones in any persisted
  document — a future session has no idea when "today" was.
- **Build your own harness.** Invest in tooling that lets the agent run, observe, and drive the software
  without a human, and verify objectively (not by eye). Every time you do something manually, ask whether
  it should become a one-step command — then add it and document it in `AGENT_GUIDE.md`.
- **Living docs.** Improve `AGENT_GUIDE.md` / `STATUS.md` whenever it would make future autonomous work
  more effective. The agent steers and tunes itself for the next session.

---

## 8. UNPACKING — step by step (for the AI agent)

> Goal: deploy the framework into the **current target project**, customized to it. Work in order, narrate
> in the chat. This is a one-time bootstrap; afterwards the project is driven by the skills.

**Step 0 — Confirm the target & read the fractal caveat (§1).** Make sure you are unpacking into the
human's project, NOT into the framework's own repository. Derive everything from THIS document only.

**Step 1 — Inspect the target project & choose the working language.** Before writing anything:
- Read the README, the package manifests / build files, and the directory tree.
- Determine: the project name, the build command, the test command / how to run it, the architecture
  (modules/components), the git remote, and the language(s) used.
- Skim `git log` to learn the recent state. Note what already exists vs. what's planned.
- **Ask the owner their preferred working language** for the project's docs (default: English). From here
  on, write **every wrapper document you create (Steps 3–6) in that language**, per *"Localized
  deployment"* in Part 1 — localize prose and each skill's `description:`; keep code, commands, paths, and
  the skills' `name:` ids canonical.

**Step 2 — Create the directories.**
```
plans/  plans/ideas/  bugs/  interviews/  .claude/skills/
```

**Step 3 — Write the four guidance documents** (from the templates in §4), replacing every `<PLACEHOLDER>`
with the project's real values discovered in Step 1:
- `PHILOSOPHY.md`, `BUG_FIXING_FRAMEWORK.md` — universal; write verbatim.
- `AGENT_GUIDE.md` — fill in identity, goal, architecture map, build command, test harness, git workflow,
  tools, code style. For owner-level unknowns (brand spelling, license), leave a clearly-marked `TODO` and
  raise them in Step 7.
- `STATUS.md` — seed it with the project's CURRENT real state (from Step 1): what's done, where we are,
  an autonomous backlog pool, and a "where to continue" checklist.

**Step 4 — Write the twelve skills** (from §6), one `.claude/skills/<name>/SKILL.md` each, verbatim except
the command placeholders (`<BUILD_COMMAND>`, `<COMMIT_COMMAND>`, `<TEST_HARNESS>`) which you replace with
the project's real commands. Keep the YAML frontmatter and the trigger phrases.

**Step 5 — Seed `plans/`.**
- `master_plan.md` — the roadmap. If the project has a goal/vision doc, distill it; otherwise draft a
  skeleton (vision, principles, phases) and flag it for the owner.
- `project_map.md` — the architecture map, from your Step 1 inspection.

**Step 6 — Wire the auto-loaded context file.** Create or update the file your agent reads automatically:
- Claude Code: `CLAUDE.md` (or `.claude/CLAUDE.md`). Some agents: `AGENTS.md`.
- Add a top section: *"Before every task, read `AGENT_GUIDE.md` and `STATUS.md`. Think by `PHILOSOPHY.md`.
  Debug by `BUG_FIXING_FRAMEWORK.md`. The skills in `.claude/skills/` are your rituals."* Don't duplicate
  the canon — point at it.

**Step 7 — Commit and report.**
- `git add -A && git commit -m "chore: deploy KRINIKS AI agent framework"` (with the Co-Authored-By trailer).
- Report to the human: the structure you created, which `TODO` placeholders still need their input, and
  offer to run `/interview` to close the owner-level questions (brand, license, vision, priorities).

After unpacking, the project is framework-wrapped. The human drives it with `/resume`, `/pause`, the loop
skills, and the rest.

---

## 9. For the human — quick start

**Install (once):**
1. Put `FRAMEWORK.md` in your project root (download it, or `git clone` this repo alongside).
2. In your agent, say: *"Read FRAMEWORK.md and unpack the KRINIKS framework into this project."*
3. Tell the agent your **preferred working language** (default English) and answer the few owner-level
   questions it raises (it files them as an interview document).

**Daily driving (the skills you'll actually type):**
- `/resume` — start of a work session: the agent reads the state and proposes the next move.
- `/pause` — end of a session: the agent records state, builds, commits, and pushes.
- `/autoloop` — *"work on your own over the backlog."* For when you step away.
- `/dayloop` — *"work continuously, I'm busy."* No time limit; stops when you write.
- `/nightloop` — *"work overnight."* Stops at a wake time or when you write.
- `/report-bug`, `/propose-idea`, `/interview`, `/release` — as the names suggest.

**What you'll get:** an agent that never starts from zero, that you can leave running for hours, that
escalates the decisions that are genuinely yours, and that leaves behind a repository documenting how and
why your project is built — readable by you and by the next agent session alike.

---

## 10. Placeholder reference

When unpacking, replace these throughout the guidance docs and skills:

| Placeholder | Meaning |
|-------------|---------|
| `<PROJECT_NAME>` / `<SHORT_NAME>` | The project's name / short name. |
| `<AUTHOR>` | The owner (name / handle). |
| `<REPO_URL>` / `<LOCAL_PATH>` | Git remote URL / local project folder. |
| `<LICENSE>` | The project's license. |
| `<BUILD_COMMAND>` | The exact command to build the project. |
| `<TEST_HARNESS>` | How the agent runs/observes/drives the software without a human. |
| `<COMMIT_COMMAND>` | The commit/push flow (a tool, or `git add -A && git commit … && git push`). |
| `<YOUR AGENT/MODEL>` | The Co-Authored-By identity for commits. |

For owner-level unknowns (brand spelling, license choice, target platforms, vision), don't guess — leave a
`TODO` and close it with `/interview`.

---

## License & author

MIT License — © 2026 **Mikalai Kryvusha (KOT KRINIK)** · Николай Кривуша aka Кот Криник.

You are free to use, copy, modify, and distribute this framework. Apply it to any project — including, as
this repository demonstrates, the framework's own project (the fractal principle: the framework is
organized and wrapped by itself).
