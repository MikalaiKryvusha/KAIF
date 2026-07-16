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
