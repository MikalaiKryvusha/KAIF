<!-- GENERATED FILE — do not edit by hand. Built from framework/KAIF-SLIM.md by tools/build-framework.mjs. Edit the source and re-run the tool. -->
# KAIF — Slim · one file, no unpacking · v1.4

> **You are reading the whole framework.** This single file *is* KAIF in its Slim form. Unlike the full
> `KAIF.md` (a self-extracting installer that unpacks ~40 files), Slim KAIF is **not deployed** — you drop
> it in a project's root and just work by it. Nothing to unpack, nothing to generate, no tokens burned on a
> bootstrap. Perfect for small projects you want to run *the KAIF way* from day one, at minimal cost.
>
> **Author:** Mikalai Kryvusha aka **KOT KRINIK** · Николай Кривуша aka Кот Криник · **License:** MIT ·
> **Repo:** https://github.com/MikalaiKryvusha/KAIF · Written in English; work in whatever language you like.

---

## What KAIF is — in three lines

KAIF is a **context-resilient, autonomy-disciplined operating framework for the human–AI tandem**: the
human is the visionary, the agent is the executor. It externalizes the agent's working memory and
discipline into the repository — a few markdown files and simple conventions — so a fresh session resumes
with full context, works autonomously within clear bounds, and accumulates knowledge instead of losing it.
It is **not code**; it is *process captured as files an agent reads*.

## How to use Slim KAIF

- **Human:** put `KAIF-SLIM.md` in your project root. Write a short `GOAL.md` next to it (what you want, the
  end result, for whom) — that's your north star. Then tell your agent: *"Read KAIF-SLIM.md and work by
  it."* That's the whole setup.
- **AI agent:** read this file. From now on you operate by the discipline below. Your first act on any
  session is `resume` (see Rituals). You keep `STATUS.md` alive; you keep knowledge in durable documents;
  you escalate only owner-level decisions. Everything you need is on this page.

---

## Philosophy — the short version

The human–AI compact: **human = visionary + fairway-keeper; agent = executor.** Four mechanisms hold it
together:

1. **Externalized memory** — state lives in files (`STATUS.md`, `GOAL.md`, notes), not in the chat. A fresh
   session is instantly productive.
2. **Knowledge that accumulates** — bugs, decisions, research, and ideas become durable documents, not lost
   chat.
3. **Bounded autonomy** — the agent grinds alone on anything cheap to reverse and escalates only owner-level
   calls (brand, UX, architecture, scope).
4. **Simplicity above cleverness** — KISS + Occam. If something takes long, you *misunderstood the task* —
   you're fighting imagined complexity, not a hard problem. Stuck → re-state the task in one plain sentence
   and simplify; never pile on complexity.

## The one rule: keep `STATUS.md` alive

`STATUS.md` is the framework's heart — the living memory that survives context loss. Create it on your first
session if it's missing. After **every** significant change, update it so that a brand-new session becomes
productive from this one file: **what's done**, **where we are now**, **where to continue next**, and any
**open problems**. If you keep only one KAIF habit, keep this one.

## `GOAL.md` — the vision (owner-written)

`GOAL.md` is a short document the **owner** writes: what they want, the end result, for whom. It's the north
star for every decision. If it's missing, seed a small template and ask the owner to fill it. Orient your
work around it.

---

## Lightweight conventions

Slim keeps only the essentials. Add structure **only when the project needs it** (KISS — don't scaffold
empty folders up front):

- **Knowledge as documents.** When something durable appears, write it down where it belongs — create these
  directories on demand, not before:
  - `bugs/` — one `NN_<name>.md` per defect: symptom → forensics → root cause → fix.
  - `ideas/` — feature/improvement proposals (mostly owner-authored; the agent implements *after approval*).
  - `plans/` — detailed step plans for larger work.
  - `researches/` — durable notes for big, hard questions.
  Bigger projects graduate to the full KAIF (see below), which adds maps, interviews, homeworks, and more.
- **The DONE tag.** A closed `bugs/`/`ideas/`/`plans/` file gets `DONE` inserted after its number via
  `git mv` (`03_x.md` → `03_DONE_x.md`), plus a short closing status section. `GOAL.md`, `STATUS.md`, and
  `researches/` notes are living references — never tagged.
- **Commits.** `feat:` / `fix:` / `docs:` / `refactor:` / `ci:` + one line. Commit small and often — no
  progress is ever lost to a crash or a context reset.
- **Git workflow.** Simple default: work in `main`, no feature branches; undo via git history.
- **Comment your code, narrate progress, read fresh logs, use absolute dates,** and keep the living docs
  accurate as you work.

## Bug-fixing discipline

Fix in a tight loop: **fix → build → test → observe** — verify by real behavior, not by hope. After
**3 failed attempts** in a row, STOP poking blindly: **re-understand the task** (re-read what was actually
asked, in plain words), then research *how it actually works* (docs/source) before the next attempt. A
stall is a misunderstanding, not a hard problem. Capture stubborn bugs in `bugs/`.

---

## Rituals — how the agent works (behaviors, not commands)

Slim has no slash-skills to install — these are just how you behave when asked (in any language):

- **resume** (session start) — read `GOAL.md` + `STATUS.md` (+ the relevant notes), pick the single most
  important thing, announce it in one paragraph, and begin.
- **pause** (session end) — update `STATUS.md` (and README if user-facing), commit, and report what you did
  and what's next.
- **autonomous loop** — when the owner says "work on your own": take the top open item, do it end to end
  (write → build → test → fix), commit, update `STATUS.md`, take the next. Stop when the owner returns, a
  wake time hits, or a blocker needs them.
- **report-bug / propose-idea** — file a `bugs/` or `ideas/` document by the conventions above (a proposed
  idea needs the owner's approval before you build it).
- **interview** — when you hit an owner-level decision (brand, UX, architecture, scope), don't guess: ask
  the owner a few closed questions with a recommendation first.
- **what-next** — when asked "what's next?", propose the highest-value next steps toward the `GOAL.md`
  vision, ranked.

---

## Growing up — from Slim to full KAIF

Slim is deliberately minimal. When a project outgrows it — you want the phased `MASTER_PLAN.md`, the
external/internal architecture maps, `interviews/`, `homeworks/`, the installable slash-skills, spheres
(any domain), agent-system adapters, anonymous install, and the full deploy → update → fork → remove
lifecycle — graduate to the full framework: drop **`KAIF.md`** into the project and ask your agent to
*"unpack the KAIF framework."* It reads your existing `GOAL.md`, `STATUS.md`, and notes and builds the full
structure around them. Nothing you did under Slim is wasted.

Get both artifacts from the origin: https://github.com/MikalaiKryvusha/KAIF (`KAIF.md` — the full
self-extracting core; `KAIF-SLIM.md` — this file).

---

## License & author

MIT License — © 2026 **Mikalai Kryvusha (KOT KRINIK)** · Николай Кривуша aka Кот Криник.
Use, copy, modify, and distribute freely — on any project, including, as the origin repo shows, the
framework's own.
