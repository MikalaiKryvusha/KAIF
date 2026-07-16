<!--
  This file is the narrative spine of KAIF.md.
  KAIF.md is GENERATED from this file by tools/build-framework.mjs:
  the {{EMBED:...}} and {{EMBED_SKILLS}} markers below are replaced with the
  actual template files from framework/. Do NOT edit KAIF.md by hand —
  edit this file (or the templates) and re-run the build tool.
-->
# KAIF — Krinik AI Framework · the self-extracting core · v{{VERSION}}

> **You are reading an installer.** This document describes the KAIF framework **and** unpacks it into a
> project. If you are an AI agent asked to *"unpack KAIF"* — your job is in **§8**. Read this document,
> then follow §8 stage by stage. Everything needed is embedded here; you need nothing else.
>
> **Author:** Mikalai Kryvusha aka **KOT KRINIK** · Николай Кривуша aka Кот Криник · **License:** MIT ·
> **Repo:** https://github.com/MikalaiKryvusha/KAIF
> 🇬🇧 English — the single source · unpacks into any working language you ask for (see §1).

---

## 0. What KAIF is — in three lines

KAIF is a **context-resilient, autonomy-disciplined operating framework for the human–AI tandem**: the
human is the visionary, the agent is the executor, and KAIF is the interface between them. It externalizes
the agent's working memory and discipline into the repository — a small set of markdown documents,
directory conventions, and repeatable slash-skills — so a fresh session resumes with full context, works
autonomously within clear bounds, and accumulates knowledge instead of losing it. It is **not code**; it is
*process captured as files an agent reads*. (The full pitch for humans lives in `README.md` — this
document stays lean so it doesn't crowd the agent's attention during unpacking.)

It fits **any domain** (§13 Spheres), runs on **any agent system** (§14 Adapters), and has a full
**lifecycle** (§12): deploy → update from origin → fork → respectfully remove.

---

## 1. How to use this document

### If you are the human (owner)
Put `KAIF.md` in your project root and tell your agent: *"Read KAIF.md and unpack the KAIF framework into
this project."* See **§9** for the full quick start (including choosing your language and agent system, and
why `GOAL.md` is worth writing first).

### If you are an AI agent
1. Read this document.
2. Go to **§8 — Unpacking** and follow it **stage by stage**. Pick the **fast path** (strong model, large
   context) or the **respectful staged flow** (small-context / local model) — §8 tells you how to choose.
3. Commit, and report to the human what you created and what still needs their input.

### The initiator command — language, agent system & install mode
When the human triggers unpacking, three parameters shape the deployment. If the first two aren't
stated, **ask**; the third defaults silently to *standard*:

- **Working language** (default: English) — the natural language the docs and skills are written in. KAIF's
  sources are English; on deploy you translate the *deployed wrapper* into this language.
- **Target agent system** (default: Claude Code) — which agent will run the project (Claude Code,
  Zoo Code, Codex, Copilot, Cursor, Windsurf, Cline, …). This decides where context lives and how the
  skills are translated into that system's format (see §14 Adapters).
- **Install mode** (default: standard) — `standard` (tracks the KAIF origin for updates) or
  **`anonymous`** (unbinds and forgets the origin and the author — see "Anonymous install" in §8).

> A complete initiator command looks like: *"Read KAIF.md and unpack KAIF into this project. Working
> language: Russian. Agent system: Zoo Code."* — add *"Install mode: anonymous."* for an anonymous
> install.

### Localized deployment — what to translate and what to keep
- **Localize:** all prose, headings, list/table text, and each skill's `description:` field (including its
  trigger phrases — so the agent matches commands in the owner's language).
- **Keep canonical (never translate):** code, shell commands, file paths, URLs, identifiers, the skills'
  `name:` field (the `/command` ids), and the `Co-Authored-By` trailer.

### ⚠️ The fractal caveat — read before unpacking
KAIF is **dogfooded**: the KAIF repository *uses the framework on itself*. Its own root holds an
`AGENT_GUIDE.md`, `STATUS.md`, `.claude/skills/`, `plans/`, etc. — but those describe **building the
framework**, not your project. **When unpacking into a user's project, derive everything from THIS document
only.** The embedded templates below are the canonical, generic source.

---

## 2. Philosophy — the short version

The human–AI compact: **human = visionary + fairway-keeper; agent = executor.** Four mechanisms hold it
together: **externalized memory** (state lives in files, not chat), **knowledge that accumulates** (bugs,
decisions, research, ideas become durable documents), **bounded autonomy** (the agent grinds alone and
escalates only owner-level decisions), and **simplicity above cleverness** (KISS + Occam: a stall means you
misunderstood the task, not that it's hard). The full treatment — including the wider principle set
(Pareto, Murphy, Eisenhower, DRY, second-order thinking, and more) — is embedded as `PHILOSOPHY.md` in §4.

---

## 3. The structure it unpacks

Unpacking produces this layout (all wrapper docs written in the owner's language):

```
<project root>/
│  ── KEY DOCUMENTS (root) ──
├── AGENT_GUIDE.md                       # THE canon — read before every task
├── PHILOSOPHY.md                        # how the agent thinks (KISS + Occam + the principle set)
├── BUG_FIXING_FRAMEWORK.md              # how the agent debugs
├── TESTING_FRAMEWORK.md                 # how the agent tests everything it creates ([NOT-TESTED]/[TESTED] markers)
├── GOAL.md                              # the vision — owner-filled (what we want in the end)
├── STATUS.md                            # the living state — updated after every significant task
├── EXPERIENCE.md                        # the agent's growing log of lessons (grep-friendly; skill: /experience)
├── MASTER_PLAN.md                       # the phased roadmap from current state → GOAL
├── PROJECT_STRUCTURE_EXTERNAL_MAP.md    # external map: dirs/files/links
├── PROJECT_ARCHITECTURE_INTERNAL_MAP.md # internal map: abstractions & how they interact
├── KAIF_FRAMEWORK.md                    # written AFTER injection: "KAIF, deployed here" (see §8/§10)
│
│  ── KNOWLEDGE DIRECTORIES (each gets its own README.md) ──
├── plans/         # detailed step plans (implementing MASTER_PLAN steps)
├── ideas/         # feature/improvement proposals (mostly owner-authored)
├── bugs/          # one doc per defect (symptom → forensics → root cause → fix)
├── researches/    # knowledge base for the big, hard questions
├── interviews/    # A/B/C/D questions for the owner on owner-level decisions
├── homeworks/     # tasks from the agent to the human (things only a human can do)
│
│  ── WIRING ──
├── .kaif/kaif.json     # deploy marker: version · released · origin · tracking · sphere · agent
├── package.json        # KAIF adds kaif:* handles here (respectfully; removed on uninstall)
├── .claude/skills/     # the repeatable rituals (slash-skills) — 22 in all (or the agent's equivalent)
└── kaif-unpack.mjs     # the mechanical unpacker (transient: deleted after injection, with KAIF.md)
```

Plus: the auto-loaded context file (`CLAUDE.md` for Claude Code, `AGENTS.md` for others — §14) points at
`AGENT_GUIDE.md`; and `KAIF.md` itself is **removed after a successful injection** (§10), replaced by
`KAIF_FRAMEWORK.md`.

> **Skills directory note.** The skills use the Claude Code convention
> (`.claude/skills/<name>/SKILL.md`, YAML frontmatter `name` + `description`). For another agent, place the
> same content where that agent discovers commands (§14) — the *content* matters, not the path.

---

## 4. The key documents

The agent's brain on disk. Each template below is generic: replace every `<PLACEHOLDER>` with the project's
real value during unpacking. `PHILOSOPHY.md`, `BUG_FIXING_FRAMEWORK.md`, and `TESTING_FRAMEWORK.md` (the
testing canon: seven principles + the `[NOT-TESTED]`/`[TESTED: …]` trust markers on everything the agent
generates) are universal — copy verbatim.
`GOAL.md` is **owner-filled** (if empty, seed the template and ask the owner). `MASTER_PLAN.md` and the two
maps are authored from your inspection of the project. `KAIF_FRAMEWORK.md` is written **after** injection
(§10). `EXPERIENCE.md` starts as the seed template below and **grows on its own** — the agent appends a
lesson after every meaningful success or failure and consults it (grep by tag) before starting a task, so
experience survives context resets. It is a **living reference — never DONE-tagged.**

{{EMBED:framework/AGENT_GUIDE.md}}

{{EMBED:framework/PHILOSOPHY.md}}

{{EMBED:framework/BUG_FIXING_FRAMEWORK.md}}

{{EMBED:framework/TESTING_FRAMEWORK.md}}

{{EMBED:framework/GOAL.md}}

{{EMBED:framework/STATUS.md}}

{{EMBED:framework/EXPERIENCE.md}}

{{EMBED:framework/MASTER_PLAN.md}}

{{EMBED:framework/PROJECT_STRUCTURE_EXTERNAL_MAP.md}}

{{EMBED:framework/PROJECT_ARCHITECTURE_INTERNAL_MAP.md}}

{{EMBED:framework/KAIF_FRAMEWORK.md}}

---

## 5. The knowledge directories

Six directories accumulate the project's knowledge. **Each gets a short `README.md`** (embedded below)
stating its purpose and the conventions for both the owner and the agent. Create the directory and drop its
README during unpacking.

- **`plans/`** — detailed step plans implementing `MASTER_PLAN.md`'s phases. `NN_<name>.md`; DONE-tagged when closed.
- **`ideas/`** — feature/improvement proposals, mostly owner-authored. `NN_<name>.md`; DONE-tagged when shipped.
- **`bugs/`** — one `NN_<name>.md` per defect; DONE-tagged when fixed & verified.
- **`researches/`** — durable research notes for large, hard questions. Living references — not DONE-tagged.
- **`interviews/`** — `interview_NNN_<topic>.md`: owner-level decisions, A/B/C/D with a recommendation first.
- **`homeworks/`** — `NN_<name>.md`: tasks the agent hands to the human (physical/offline/account-only work).

{{EMBED:framework/readmes/plans.md}}

{{EMBED:framework/readmes/ideas.md}}

{{EMBED:framework/readmes/bugs.md}}

{{EMBED:framework/readmes/researches.md}}

{{EMBED:framework/readmes/interviews.md}}

{{EMBED:framework/readmes/homeworks.md}}

---

## 6. The skills

The framework's repeatable rituals — the verbs of working on a project. Each is a
`.claude/skills/<name>/SKILL.md` with YAML frontmatter (`name`, `description`); the `description` is what
the agent matches to trigger the skill — keep the trigger phrases (in the owner's language) intact. During
unpacking, copy each verbatim, replacing the command placeholders (`<BUILD_COMMAND>`, `<COMMIT_COMMAND>`,
`<TEST_HARNESS>`) with the project's real commands.

| Skill | When | Purpose |
|-------|------|---------|
| `resume` | session start | Read the docs, pick the one main thing, announce, begin. |
| `pause` | session end | Update STATUS & README, build, commit, push, report. |
| `autoloop` | autonomy | Grind a pool of autonomous tasks in a self-restarting series. |
| `dayloop` | autonomy | Continuous autonomous work while the human is busy (no time stop). |
| `nightloop` | autonomy | Autonomous work until a wake time / the human returns. |
| `refresh-context` | hygiene | Re-read the master plan, maps, and guidance; rebuild the backlog. |
| `check-backlog` | hygiene | Walk the knowledge dirs, tag finished work DONE, return the open list. |
| `experience` | knowledge | Capture a lesson into `EXPERIENCE.md`, or recall relevant lessons before a task. |
| `report-bug` | knowledge | File a bug document by the canon. |
| `bug-research` | knowledge | Deep investigation without coding, after 3 failed fix attempts. |
| `propose-idea` | knowledge | Propose a feature/improvement for the human's approval. |
| `interview` | human | Ask the owner closed A/B/C/D questions on a fateful decision. |
| `revision` | planning | (Re)derive `MASTER_PLAN.md` from `GOAL.md` and the current state. |
| `fix-vision` | human | Capture the owner's latest visionary chat messages into the KAIF docs. |
| `what-next` | planning | "What's next?" — propose the highest-value next steps toward the vision. |
| `help-kaif` | help | Explain KAIF to the operator in chat — a structured user manual (how to use it). |
| `release` | shipping | Publish a release to GitHub (with confirmation; never autonomously). |
| `kaif-version` | lifecycle | Report the deployed KAIF version; check origin for a newer release. |
| `kaif-update` | lifecycle | Respectful migration update from origin, preserving customizations & artifacts. |
| `kaif-fork` | lifecycle | Snapshot KAIF into the user's own repo and track it. |
| `kaif-switch-origin` | lifecycle | Return tracking to the official origin (respectful migration). |
| `kaif-remove` | lifecycle | Respectfully remove KAIF — partial (keep artifacts) or full; **always asks the owner which**. |

{{EMBED_SKILLS}}

---

## 7. Conventions (cross-cutting rules)

- **The DONE tag.** Closed `bugs/`, `ideas/`, `plans/`, and `homeworks/` files get `DONE` inserted after
  their number via `git mv` (`13_x.md` → `13_DONE_x.md`), plus an appended status section. `GOAL.md`,
  `MASTER_PLAN.md`, the maps, and `researches/` notes are **living references** — never DONE-tagged. (Skill:
  `/check-backlog`.)
- **Commits.** `feat:` / `fix:` / `docs:` / `refactor:` / `ci:` + one line, ending with a `Co-Authored-By:`
  trailer naming the agent. Commit small and often — progress is never lost to a crash or context reset.
- **Git workflow.** Simple default (this framework's own): work only in `main`, no feature branches; undo
  via git history. State the chosen policy in `AGENT_GUIDE.md`.
- **Comment the code; narrate progress; read fresh logs; use absolute dates; build your own harness;** keep
  the living docs (`AGENT_GUIDE.md`/`STATUS.md`/the maps) accurate as you work.

---

## 8. UNPACKING — step by step (for the AI agent)

> Goal: deploy KAIF into the **current target project**, customized to it. Narrate in the chat as you go.
> This is a one-time bootstrap; afterward the project is driven by the skills.

### Choose your path — strong model vs. small context

**Read this first.** Unpacking a whole framework *and* studying a whole project at once is heavy. Which
path you take depends on your context window:

- **Fast path — strong model, large context** (e.g. Claude Opus/Sonnet, GPT-class, Gemini with large
  context — cloud models with big windows). You can hold KAIF + the project at once. Do all stages below in
  one session.
- **Respectful staged flow — small context** (e.g. local models on gaming GPUs with limited VRAM, or any
  short-context model). Doing it in one shot is **risky and will likely fail** — you'll drown in context.
  Instead run the stages as **atomic steps**, each needing only a little in context at once — possibly
  across several messages, or even **several separate chats**. Never load the whole document and the whole
  project together. Process **one embedded `FILE:` block at a time**; between steps, persist progress to
  disk (Stage 2 uses a running file, `KAIF_DEPLOYMENT_PLAN.md`) so a later step — or a fresh chat — resumes
  from where you left off. Good news: with Node.js available, Stage 1 collapses to **one command** via the
  embedded unpacker script (§8) — small context stops being a correctness risk for the structure.

Both paths run the **same stages**; they differ only in how much you attempt per step.

### Stage 0 — Confirm the target & parameters
Confirm you are unpacking into the **human's project**, not the KAIF repo (§1 fractal caveat). Confirm the
**working language** and **target agent system** (ask if not given — §1). Note the project's likely
**sphere** (§13) — you'll confirm it in Stage 2.

### Stage 1 — Raw structure, MECHANICALLY (NO project context needed)
Writing out the skeleton is **not creative work — it is mechanical extraction**. Every file's exact
canonical path and exact content are already embedded in this document as `FILE:` blocks. Do not
paraphrase, do not rename, do not skip. **THE `FILE:` LABEL IS LAW**: the file is created at *exactly*
that path with *exactly* that content — a "sensible" name you invent is a deployment defect.

**Preferred path — the unpacker script (any model strength; requires Node.js).** Right below is a
`FILE: kaif-unpack.mjs` block. Write that ONE small file to disk verbatim, then run:

```bash
node kaif-unpack.mjs KAIF.md                    # extracts EVERY FILE: block to its exact path
node kaif-unpack.mjs KAIF.md --check            # validates: non-zero exit = incomplete
node kaif-unpack.mjs KAIF.md --agent zoo-code   # + translate all skills to .roo/commands/ (Zoo/Roo Code)
node kaif-unpack.mjs KAIF.md --anonymous        # anonymous install: skips the origin-tied skills
```

The script never touches existing non-empty files, prints what it wrote, and validates the full manifest
at the end. This makes Stage 1 deterministic even for the smallest local model — the model's only job is
to copy one block and run one command.

{{EMBED:framework/kaif-unpack.mjs}}

**Fallback path — manual (no Node.js available).** Process the embedded blocks **one `FILE:` block at a
time**: create the file at the exact labelled path, copy the content verbatim, commit, move to the next.
On the small-context path stop for the session whenever needed — the skeleton is valid on its own.

### Stage 1.5 — VALIDATE (mandatory, both paths)
The manifest = **every `FILE:` label in this document** (see also the §3 tree). Compare the disk against
it: every path must exist and be non-empty. Anything missing or empty → create it now, then validate
again — **repeat until 100%**, only then proceed. With Node: `node kaif-unpack.mjs KAIF.md --check` until
exit code 0. Without Node: list the `FILE:` labels, check each path off one by one. A deployment that
skips validation is not a deployment — it's a guess.

### Stage 2 — Study the project & build `KAIF_DEPLOYMENT_PLAN.md`
Now study the target project **gradually**, writing what you learn into a temporary key file,
**`KAIF_DEPLOYMENT_PLAN.md`** (create it in the project root). This file is your running deployment
notebook — append to it as you learn, so you never need the whole project in context at once.
⚠️ This plan is a **strict step-by-step contract, not loose recommendations**: every step you write into
it MUST be executed and validated, and whatever validation finds unfinished MUST be finished. Check
steps off in the file as you complete them.
Record, incrementally:
- **What the project is:** name, purpose, README summary, build command, test/run command, git remote.
- **Its sphere** (§13) and the terminology to adapt (what "bug", "release", "build", "test" mean here).
- **Its architecture:** the modules/components (for the external & internal maps).
- **For each KAIF module/doc:** how best to adapt it to this project — the concrete values that will replace
  each `<PLACEHOLDER>`, the sphere wording, any owner-level unknowns to raise via `/interview`.
- If `GOAL.md` already exists and is filled — read it and orient the whole plan around its vision.

On the small-context path, Stage 2 can span many atomic steps (or chats): read one part of the project,
append findings to `KAIF_DEPLOYMENT_PLAN.md`, stop; resume later. The plan file is the hand-off.

### Stage 3 — Adapt the raw modules to the project
Using `KAIF_DEPLOYMENT_PLAN.md` as the source of truth, go back through the Stage-1 skeleton and **adapt it**,
one file at a time:
- Fill every `<PLACEHOLDER>` in `AGENT_GUIDE.md`, `STATUS.md`, the maps, and the skills with real values.
- Seed `MASTER_PLAN.md` from `GOAL.md` (skill: `/revision`); if `GOAL.md` is empty, seed its template and
  ask the owner to fill it (note that a later `/revision` will then re-derive the master plan).
- Apply the sphere wording (§13) and the agent-system adapter (§14); generate the universal `AGENTS.md`
  fallback pointing at `AGENT_GUIDE.md`.
- Wire the lifecycle: write `.kaif/kaif.json` (version, released, `origin`, `tracking: "origin"`, `sphere`,
  `agent`); respectfully add the `kaif:*` handles to `package.json` (create it if absent), backed by a small
  `kaif` tool, without disturbing existing scripts.
- Point the auto-loaded context file (`CLAUDE.md`/`AGENTS.md`) at `AGENT_GUIDE.md` — don't duplicate the
  canon, reference it.

### Stage 4 — Finish injection: remove `KAIF.md`, write `KAIF_FRAMEWORK.md`, commit
Once the structure is deployed and adapted:
- **Write `KAIF_FRAMEWORK.md`** (from the template in §4) — the high-level "KAIF, deployed here" document:
  what KAIF is, why it's here, how it works in this project, and the deployment record (version, date, how
  injection went, sphere, agent, language, tracking). Include the author's note at its end.
- **Remove the self-extracting core `KAIF.md`** — its job is done; from now the project is described by
  `KAIF_FRAMEWORK.md` and driven by the skills. Delete `KAIF_DEPLOYMENT_PLAN.md` too, or archive it under
  `researches/` if it holds useful findings.
- **Commit** `chore: deploy KAIF` (with the Co-Authored-By trailer) and **report** to the human: the
  structure created; the language/sphere/agent chosen; which `TODO`s still need input; and offer
  `/interview` to close owner-level questions, and `/revision` if `GOAL.md` was just filled.

After unpacking, the project is framework-wrapped: drive it with `/resume`, `/pause`, the loop skills, and
the rest.

### Anonymous install — unbind and forget the origin & the author
If the initiator command says **install mode: anonymous**, KAIF deploys fully — same structure, same
skills, same discipline — but severed from its origin. Apply, on top of the normal stages:

- **Scrub the author.** The deployed wrapper must contain **no mention of KAIF's author**: no names, no
  nicknames, no links to the author's GitHub or repositories. Do not expand the KAIF acronym; call the
  framework simply "KAIF, an operating framework for AI agents". Do not include the author's note in
  `KAIF_FRAMEWORK.md` (Stage 4).
- **Sever the origin.** `.kaif/kaif.json` gets `"tracking": "anonymous"` and **no `origin` field**. Do
  not deploy the origin-tied lifecycle skills — `kaif-update`, `kaif-switch-origin`, `kaif-fork` (the
  unpacker's `--anonymous` flag skips them mechanically); `kaif-version` reports the local version only.
  Skip the `kaif:update` / `kaif:fork` / `kaif:switch-origin` npm handles likewise.
- **Validate anonymity** at Stage 1.5/4: search the deployed files for the author's name, nicknames, and
  origin URL — the result must be empty. After a successful anonymous injection it must be impossible to
  establish the author's identity from the deployed project.

The owner's project, the owner's rules: anonymity is a first-class, respectful install mode — not a
degraded one.

---

## 9. For the human — quick start

**Install (once):**
1. Put `KAIF.md` in your project root (download it, or `git clone` this repo alongside).
2. In your agent, say: *"Read KAIF.md and unpack the KAIF framework into this project."* Tell it your
   **working language** (default English) and **agent system** (default Claude Code; Zoo Code is
   first-class). If your agent is a **small-context / local model**, ask it to use the **respectful
   staged flow** (§8) — don't attempt a one-shot unpack, it will likely run out of context. With Node.js
   installed, the structure lands **mechanically** via the embedded unpacker script (§8) — the agent's
   strength stops mattering for correctness.
3. Optionally add *"Install mode: anonymous"* — KAIF then deploys with the origin and author scrubbed
   (see §8).
4. Answer the few owner-level questions it raises (it files them as an interview document).

**`GOAL.md` — write it first if you can.** `GOAL.md` is your one-paragraph vision: *what you want, what the
end result is, for whom.* If it exists at deploy time, the agent orients the whole deployment — sphere,
terminology, and `MASTER_PLAN.md` — around it. It's not mandatory: you can add it later, but then the agent
has to re-translate the already-deployed wrapper into the project's meaning (extra work). Better to write it
up front. A template is created for you if it's missing.

**Daily driving:** `/resume` (start) · `/pause` (wrap up) · `/autoloop` · `/dayloop` · `/nightloop`
(autonomous work) · `/report-bug` · `/propose-idea` · `/interview` · `/revision` · `/fix-vision` ·
`/what-next` · `/help-kaif` · `/release`.

---

## 10. After injection — the core is removed

KAIF's install is **self-cleaning**. When Stage 4 completes, the self-extracting core `KAIF.md` is
**deleted** and replaced by `KAIF_FRAMEWORK.md` — a project-level document (like a README listing the
project's technologies and frameworks, on which KAIF is now one of them). From then on, work is organized
*through* KAIF via the skills, and `KAIF_FRAMEWORK.md` is the human-facing summary of that. (The framework's
own repository is the one exception — it keeps `KAIF.md`, because that file *is* its product.)

---

## 11. Placeholder reference

Replace these throughout the guidance docs and skills during unpacking:

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
| `<OWNER_LANGUAGE>` | The owner's working language (the AGENT_GUIDE language-policy note). |

For owner-level unknowns (brand spelling, license, target platforms, vision), don't guess — leave a `TODO`
and close it with `/interview`.

---

## 12. Versioning & the KAIF lifecycle

**Version stamp.** KAIF versions are **two-digit semver — `MAJOR.MINOR`** (e.g. `1.1`). The release *name*
carries only these two digits; the **release date lives in the release description**, not the name. Any KAIF
document that states the current version writes only `MAJOR.MINOR`. On deploy the agent writes
`.kaif/kaif.json`:

```json
{ "framework": "KAIF", "version": "{{VERSION}}", "released": "{{RELEASED}}",
  "origin": "https://github.com/MikalaiKryvusha/KAIF", "tracking": "origin",
  "sphere": "programming", "agent": "claude-code" }
```

`tracking` is `"origin"` (default), `"fork"` (after `/kaif-fork`), or `"anonymous"` (anonymous install —
then the `origin` field is omitted entirely and the origin-tied skills are not deployed; see §8).

**npm handles.** On deploy, KAIF respectfully adds `kaif:*` scripts to `package.json` (creating one if
absent), backed by a small `kaif` tool, without disturbing existing scripts: `kaif:version`, `kaif:check`,
`kaif:update`, `kaif:fork`, `kaif:switch-origin`, `kaif:remove`, `kaif:remove-all`. Removal removes them.

**Lifecycle skills:**
- **`/kaif-version`** — report the deployed version; check `origin` for a newer release.
- **`/kaif-update`** — **respectful migration update** from origin, preserving local customizations and all
  content artifacts, never breaking the project.
- **`/kaif-fork`** — snapshot this project's evolved KAIF into the user's **own** repo and track it.
- **`/kaif-switch-origin`** — return tracking to the official origin (respectful migration).
- **`/kaif-remove`** — **respectful removal**: the agent first **asks the owner, in natural language, which
  removal to run** — *partial* (keep the content artifacts: bugs, interviews, ideas, research, homework) or
  *full* (remove them too) — and proceeds only on an explicit, unambiguous answer. Either way the user's own
  project stays whole.

Origin = the canonical KAIF (`MikalaiKryvusha/KAIF`), its "DNA." Track it, or fork and evolve your own —
KAIF supports both, and switching between them, always respectfully.

## 13. Spheres — adapting to any domain

KAIF is not only for programming. At deploy, the agent determines the project's **sphere** (inspect + ask),
records it in `.kaif/kaif.json`, and adapts the deployed wrapper's terminology to that domain — what
`bugs/`, "release", "build", "test", and the *internal map's* abstractions *mean* there — using a **sphere
library** (a term glossary + entity mapping + a brief intro to the domain). The repo ships a reference
sphere (`programming`) plus examples (`science`, `design`, `business`) and a `_template` for authoring any
other on demand. Unknown sphere → neutral wording, still works. Catalog: `framework/spheres/`.

## 14. Adapters — running on any agent system

KAIF's substance is **agent-agnostic**; only the *wiring* differs per system — (1) where the agent reads
project context, and (2) where it discovers commands/skills. At deploy, the agent determines the target
system, records it in `.kaif/kaif.json`, and uses the matching **adapter** to place `AGENT_GUIDE.md` and
translate the skills into that system's format — always generating a universal `AGENTS.md` fallback pointing
at `AGENT_GUIDE.md`. Skill translation is **mechanical, not creative** (verified 2026-07-03): the ecosystem
has converged on `AGENTS.md` for auto-context (native in Zoo Code, Codex, Copilot, Cursor, Cline, …) and on
the Agent Skills standard (`SKILL.md`) for commands — Cursor, Cline and OpenCode even read `.claude/skills/`
as-is. Reference: **Claude Code** (`CLAUDE.md` + `.claude/skills/`). Priority system #1: **Zoo Code**
(successor of Roo Code; `.roo/commands/<name>.md`, translated mechanically by the unpacker's
`--agent zoo-code` flag — §8); then **OpenAI Codex, GitHub Copilot, Cursor, Windsurf, Cline**; others via
the `AGENTS.md` fallback or authored from `_template`. Catalog: `framework/adapters/`.

**Optional enforcement (hooks).** KAIF's discipline lives in prose, which a weak — or even a strong — model
can *choose* to ignore (the root of `bugs/01` and `bugs/02`). Where the host offers hooks (Claude Code
`settings.json` hooks; Zoo Code allow/deny + auto-approve gates), an adapter can make a **few load-bearing
rules mechanical** — e.g. rebuild-after-editing-a-template, don't-self-stop-a-loop-on-context,
update-STATUS-before-pause, don't-rename-canonical-files. Enforcement is **optional and additive**: with no
hooks, everything still runs on prose. Keep the enforced set short; details per host in `framework/adapters/`.

---

## License & author

MIT License — © 2026 **Mikalai Kryvusha (KOT KRINIK)** · Николай Кривуша aka Кот Криник.

Use, copy, modify, and distribute freely — apply it to any project, including, as this repository shows, the
framework's own (the fractal principle: the framework is organized and wrapped by itself).
