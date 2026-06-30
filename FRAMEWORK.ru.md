<!-- RUSSIAN TRANSLATION of FRAMEWORK.md (the English source of truth). Regenerate/re-sync when FRAMEWORK.md changes. -->
# KAIF — фреймворк для AI-агентов

### Самораспаковывающееся ядро · v1.0

> **Контекстно-устойчивый, дисциплинированно-автономный операционный фреймворк для AI-агентов, пишущих код.**
> Превратите любого AI-агента, пишущего код (Claude или любого другого), в дисциплинированного, автономного,
> устойчивого к потере контекста напарника на любом программном проекте.

> **Автор:** Mikalai Kryvusha aka **KOT KRINIK** · Николай Кривуша aka Кот Криник
> **Лицензия:** MIT · **Репозиторий:** https://github.com/MikalaiKryvusha/KAIF
> 🇷🇺 Русская версия · 🇬🇧 English original: `FRAMEWORK.md`

---

## 0. Что представляет собой этот документ

Это **самораспаковывающийся документ**. Он одновременно:

1. **Полное описание** фреймворка KAIF — его философии, структуры, соглашений и навыков.
2. **Установщик.** Передайте этот единственный файл AI-агенту и скажите: *«распакуй фреймворк KAIF в этот
   проект согласно FRAMEWORK.md»* — агент прочитает его и выпишет всю структуру (руководящие документы,
   соглашения о каталогах и slash-навыки), адаптировав её под проект.

Всё, что нужно агенту для воссоздания фреймворка, находится **внутри этого одного документа** — шаблоны
встроены прямо в текст. Больше ничего не требуется.

### Какую проблему он решает

AI-агенты, пишущие код, мощны, но страдают от двух хронических недугов:

- **Они забывают.** Контекст теряется между сессиями. Каждая новая сессия начинается с нуля: заново
  открывает архитектуру, решения, недоделанную работу, баг, за которым гонялась вчера.
- **Их уводит в сторону.** Предоставленный сам себе, агент либо буксует (переусложняя неправильно понятую
  задачу), либо превышает полномочия (принимая решения о бренде/архитектуре, которые не ему было принимать).

KAIF лечит и то, и другое, **вынося рабочую память и дисциплину агента в сам репозиторий** — в виде
небольшого набора markdown-файлов, соглашений о каталогах и повторяемых slash-навыков. Результат: любая
свежая сессия мгновенно возобновляет работу с полным контекстом, работает автономно в чётких границах
и накапливает знания вместо того, чтобы их испарять.

Это не код. Это **процесс, зафиксированный в виде файлов, которые читает агент.** Он работает с любым
языком, любым стеком, любым проектом.

---

## 1. Как пользоваться этим документом

### Если вы человек (владелец проекта)

1. Скачайте `FRAMEWORK.md` в корень своего проекта (или клонируйте этот репозиторий рядом с ним).
2. Откройте своего AI-агента в проекте и скажите ему:
   > *«Прочитай FRAMEWORK.md и распакуй фреймворк KAIF в этот проект.»*
3. Агент изучит ваш проект, создаст структуру и заполнит специфичные для проекта детали (команду сборки,
   архитектуру и т. д.). Он **спросит ваш предпочитаемый рабочий язык** (по умолчанию английский) и может
   задать несколько вопросов уровня владельца (бренд, лицензия) через короткий документ-интервью — ответьте
   на них.
4. С этого момента управляйте своим агентом через навыки: `/resume` — начать сессию, `/pause` — завершить,
   `/autoloop` (или `/dayloop` / `/nightloop`) — автономно перемалывать беклог, и остальные по мере надобности.

См. **Часть VIII — Для человека: быстрый старт** для полного разбора.

### Если вы AI-агент

1. Прочитайте этот документ целиком.
2. Следуйте **Части VII — Распаковка** шаг за шагом. Изучите целевой проект, затем выпишите структуру
   из встроенных здесь шаблонов, заменив каждый `<PLACEHOLDER>` реальными значениями проекта.
3. Закоммитьте и доложите человеку, что вы создали и что ещё требует его участия.

### 🌍 Локализованное развёртывание — рабочий язык разработчика

**Исходники фреймворка написаны на английском** (общем языке сообщества). Но команда работает лучше всего,
читая свой проект на своём языке. Поэтому **развёртывание локализуется**: при распаковке агент **спрашивает
у владельца предпочитаемый рабочий язык** (по умолчанию: английский) и пишет *развёрнутую* обвязку — четыре
руководящих документа, двенадцать навыков и документы `plans/`/`bugs/`/`interviews/` — на этом языке.
Фреймворк распаковывается *из своих английских исходников на выбранный разработчиком язык*.

- **Локализуйте:** всю прозу, заголовки, пункты списков, текст таблиц и поле `description:` каждого навыка
  (включая его фразы-триггеры — чтобы агент сопоставлял команды на языке владельца).
- **Оставьте каноническим (никогда не переводите):** код, shell-команды, пути к файлам, URL, идентификаторы,
  поле `name:` навыков (идентификаторы команд `/command`, такие как `resume`, `pause`) и трейлер `Co-Authored-By`.

> Этот репозиторий — сам по себе живой пример: его публичная полезная нагрузка (`framework/`, `FRAMEWORK.md`)
> на английском, тогда как его собственная рабочая обвязка — на **русском**, языке, на котором работает его
> владелец. Ваше развёртывание выбирает тот язык, который подходит *вам*.

### ⚠️ Фрактальная оговорка — прочтите это перед распаковкой

Этот фреймворк применяется на самом себе (**dogfooding**): репозиторий, на который вы, возможно, сейчас
смотрите (`KAIF`), *использует фреймворк на самом себе*. В его собственном корне есть
`AGENT_GUIDE.md`, `STATUS.md`, `.claude/skills/`, `plans/`, `bugs/` и `interviews/` — но они описывают
**разработку самого фреймворка**, а не ваш проект.

> **При распаковке в проект пользователя выводите всё ТОЛЬКО из ЭТОГО документа (`FRAMEWORK.md`).**
> НЕ копируйте собственные корневые `AGENT_GUIDE.md` / `STATUS.md` / и т. д. репозитория фреймворка — это
> самоприменение фреймворка, и речь в них идёт о построении фреймворка, а не о вашем проекте. Встроенные
> в этот документ шаблоны — канонический, обобщённый источник. (В этом и состоит разрешение рекурсии:
> самораспаковывающийся документ — единственный источник истины для развёртывания.)

---

## 2. Философия — зачем существует этот фреймворк

Всё держится на четырёх идеях:

**1. Вынесенная память.** Рабочее состояние агента живёт в файлах, а не в диалоге. Его несут четыре
документа: `AGENT_GUIDE.md` (канон — правила, карта, команды), `STATUS.md` (живое состояние —
что сделано, где мы находимся, что дальше), `PHILOSOPHY.md` (как думать), `BUG_FIXING_FRAMEWORK.md` (как
отлаживать). Новая сессия читает их и сразу становится продуктивной. Агент **поддерживает их** по ходу
работы — это живые документы, а не файлы, записанные единожды.

**2. Знание, которое накапливается.** Баги, решения и предложения не растворяются в истории чата. Каждый
баг становится документом в `bugs/` (симптом → форензика → первопричина → исправление). Каждое решение
владельца становится документом в `interviews/`. Каждая идея агента становится документом в `plans/ideas/`.
Репозиторий превращается в растущую базу знаний о том, *как и почему построен этот проект*.

**3. Ограниченная автономия.** Агенту доверяют работать в одиночку часами — но он точно знает, какие
решения его собственные (всё, что дёшево откатить), а какие принадлежат человеку (бренд, UX, архитектура —
всё, что определяет продукт надолго). Последние эскалируются через `interviews/`, а не угадываются.
Навыки циклов (`autoloop`/`dayloop`/`nightloop`) это кодируют: перемалывай автономно, эскалируй
судьбоносное, никогда не уходи в интерактив, когда человека нет рядом.

**4. Простота превыше изобретательности.** Главная директива (`PHILOSOPHY.md`): если что-то занимает
слишком много времени — задача не трудная, ты неправильно её понял и переусложняешь. Застрял = заново
понять и упростить, никогда не наращивать сложность. KISS + бритва Оккама, подкреплённые жёстким правилом
3 попыток перед переходом от тыканья к исследованию.

---

## 3. Структура с высоты птичьего полёта

Распаковка фреймворка в проект порождает такую раскладку:

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

Плюс один шаг по связыванию: автозагружаемый контекстный файл агента (`CLAUDE.md` для Claude Code или `AGENTS.md`
для некоторых агентов) указывается на `AGENT_GUIDE.md`, чтобы каждая сессия читала канон.

> **Замечание о каталоге навыков.** Навыки выше используют соглашение Claude Code
> (`.claude/skills/<name>/SKILL.md`, с YAML-фронтматтером `name` + `description`). Для другого агента
> разместите то же содержимое SKILL.md там, где этот агент находит команды, или просто держите их как
> документы, которые человек вызывает по имени — важно *содержание*, а не путь.

---

## 4. Четыре руководящих документа

Эти четыре файла — мозг агента на диске. Каждый шаблон ниже обобщён: при распаковке заменяйте каждый
`<PLACEHOLDER>` реальным значением проекта. `PHILOSOPHY.md` и
`BUG_FIXING_FRAMEWORK.md` универсальны — копируйте их дословно.

> **FILE: `AGENT_GUIDE.md`** — корень проекта — замените каждый `<PLACEHOLDER>` реальными значениями проекта

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
2. git status                     # what changed, what's uncommitted
3. git log --oneline -5           # where we are in history
4. Read MEMORY.md (if present)    # user profile, key decisions
5. Read the relevant plan         # plans/<feature>.md, if the task touches a specific feature
6. Run the build (if touching code)   # <BUILD_COMMAND>
7. Use the test harness           # <TEST_HARNESS> — drive/observe the software without a human
8. Comment the code               # comment blocks, classes, modules, important lines
9. Reflect on bugs in bugs/       # one md per bug; follow BUG_FIXING_FRAMEWORK.md
10. Periodically re-read the key guidance docs:
    - PHILOSOPHY.md   ← the simplicity principle; if stuck, go here first
    - AGENT_GUIDE.md
    - STATUS.md
    - BUG_FIXING_FRAMEWORK.md
    Edit them when it would make future autonomous work more effective. The agent operates across
    sessions that lose context — these docs must let a fresh session get productive from empty context.
11. Narrate in the chat, at least a little, in natural language — what you're doing right now — so the
    human can glance over and follow along.
12. Documents from the human (ideas, bugs, features): read them, fix typos, minimally restructure into a
    clean structured format for AI consumption. After implementing from such a document, write the
    status and the implementation date back into it.
```

→ **`STATUS.md`** is the master state file. Update it after every significant task.

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
them. Keep this in sync with plans/project_map.md (the detailed map). Example:>`

```
<module-a>      ← entry point / app
<module-b>      ← <responsibility>
<module-c>      ← <responsibility>
```

**RULE:** `<state the key architectural invariant, e.g. "feature modules don't depend on each other">`.

Full file map and data flows live in `plans/project_map.md`.

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
plans/ideas/07_dev_menu.md      →  plans/ideas/07_DONE_dev_menu.md
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
human's vision — file it as an md in `plans/ideas/` with status "❓ awaiting human approval." An
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


> **FILE: `PHILOSOPHY.md`** — корень проекта — универсальный, пишите дословно

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


> **FILE: `BUG_FIXING_FRAMEWORK.md`** — корень проекта — универсальный, пишите дословно

``````md
# BUG_FIXING_FRAMEWORK — how the agent fixes defects

To fix a bug, the agent must:

- **Focus on this one bug only.** Don't refactor the world; don't fix three other things along the way.
- **Narrate in the chat**, at least a little, in natural language — what you are doing right now — so
  the human can glance over and understand where the work is.
- **Reflect and capture knowledge** for every bug, even small ones, in a dedicated markdown file per
  bug in the `bugs/` directory.
- **Enter the loop:** run the app → reproduce the bug → read the logs for this bug → form a guess at the
  cause → make a *single, targeted* change → build → run the app again → try to reproduce again.
- The essence: **targeted changes, then a build to test whether the change helped or not.**
- Simplified: Fix → Test → Read logs → Fix → Test → Read logs → … until it works correctly. Working
  correctly **is the acceptance criterion** — at that point the bug is considered fixed.
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


> **FILE: `STATUS.md`** — корень проекта — заполните текущим реальным состоянием проекта

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


---

## 5. Каталоги знаний

### `plans/` — стратегия и знание

- **`master_plan.md`** — дорожная карта проекта: видение, принципы, технологический стек, поэтапный план
  (Фаза 0…N с вехами) и журнал решений. Это «куда мы идём». Создаётся путём изучения проекта и интервью с
  владельцем о видении.
- **`project_map.md`** — карта архитектуры: модули/компоненты, за что каждый отвечает, правила
  зависимостей между ними и диаграмма потоков данных. Это «как оно построено». Поддерживается в
  синхроне с реальным кодом; свежая сессия читает её для навигации.
- **`ideas/`** — предложения функций, по одному `NN_<name>.md` на каждую (см. `/propose-idea`). Помечаются тегом DONE по выпуску.
- Справочные документы (`master_plan.md`, `project_map.md`, `goal.md`, рабочие журналы, `homework_*.md`) —
  **живые справочники, а не закрываемые задачи** — тегом DONE никогда не помечаются.

### `bugs/` — один документ на дефект

Каждый баг — даже маленький — получает `bugs/NN_<name>.md` (см. `/report-bug`): симптом, детерминированное
воспроизведение, форензика, первопричина/гипотезы, план исправления, ссылки. Пока баг открыт — тега `DONE`
нет. Когда исправлен и проверен — `git mv` его в `NN_DONE_<name>.md` и допишите раздел `## ✅ STATUS: DONE (date)`. Это
собственный беклог багов агента — ничего не теряется, и любой баг может быть подхвачен будущей сессией с нуля.

### `interviews/` — решения уровня владельца

`interview_NNN_<topic>.md` (см. `/interview`): закрытые вопросы A/B/C с рекомендацией в начале, на которые
человек отвечает **прямо в документе**. Используется только для решений, которые агент не должен принимать
сам (UI/UX, серьёзные технические развилки, бренд/видение/приоритеты). Асинхронный, основанный на
документах формат держит агента незаблокированным: он заводит вопросы, ставит работу на паузу, а человек
отвечает, когда ему удобно.

---

## 6. Навыки

Навыки — это повторяемые ритуалы фреймворка, глаголы работы над проектом. Каждый — это
файл `.claude/skills/<name>/SKILL.md` с YAML-фронтматтером (`name`, `description`). Поле `description` —
это то, с чем агент сопоставляет ввод для запуска навыка; сохраняйте фразы-триггеры (включая язык
владельца) нетронутыми.

При распаковке копируйте каждый навык дословно, заменяя плейсхолдеры команд
(`<BUILD_COMMAND>`, `<COMMIT_COMMAND>`, `<TEST_HARNESS>`) реальными командами проекта.

| Навык | Когда | Назначение |
|-------|------|---------|
| `resume` | начало сессии | Прочитать документы, выбрать одно главное дело, объявить, начать. |
| `pause` | конец сессии | Обновить STATUS и README, собрать, закоммитить, запушить, доложить. |
| `autoloop` | автономия | Перемалывать пул автономных задач в самоперезапускающейся серии. |
| `dayloop` | автономия | Непрерывная автономная работа, пока человек занят (без остановки по времени). |
| `nightloop` | автономия | Автономная работа до времени пробуждения / возвращения человека. |
| `refresh-context` | гигиена | Перечитать мастер-план, карту и руководства; пересобрать беклог. |
| `check-backlog` | гигиена | Пройти по `bugs/`+`plans/`, пометить завершённое тегом DONE, вернуть открытый список. |
| `report-bug` | знание | Завести документ бага по канону. |
| `bug-research` | знание | Глубокое исследование без написания кода, после 3 неудачных попыток исправления. |
| `propose-idea` | знание | Предложить функцию/улучшение на одобрение человека. |
| `interview` | человек | Задать владельцу закрытые вопросы A/B/C по судьбоносному решению. |
| `release` | выпуск | Опубликовать релиз на GitHub (с подтверждением; никогда автономно). |

### `.claude/skills/resume/SKILL.md`

> **FILE: `.claude/skills/resume/SKILL.md`** — замените плейсхолдеры команд (`<BUILD_COMMAND>`/`<COMMIT_COMMAND>`/`<TEST_HARNESS>`) реальными командами проекта

``````md
---
name: resume
description: Возобновить работу с того места, где остановилась прошлая сессия — прочитать ключевые документы проекта, определить единственное самое важное дело прямо сейчас, объявить его и начать. Используйте, когда человек говорит «continue», «let's continue», «what's next», «where did we leave off», «resume», «pick up where we left off», «продолжи», «продолжим», «что дальше».
---

# /resume — pick up where we left off

A new session starts with empty context. This skill rebuilds the picture fast and gets to work.

## Step 1. Read the key documents (all in parallel)

Read at once:

- `STATUS.md` — current state, what's in progress, the "where to continue" checklist
- `plans/master_plan.md` — the long-term plan and phases
- `AGENT_GUIDE.md` — the rules for working on this project (mandatory)
- `plans/project_map.md` — architecture: modules, files, data flow

If relevant to open questions:
- `bugs/` — `ls bugs/`, open the non-`DONE` bugs
- `BUG_FIXING_FRAMEWORK.md` — if a bug fix is likely
- `PHILOSOPHY.md` — the simplicity principle

## Step 2. Synthesize — choose the one main thing

Pick a single direction for this session. Priority (descending):

1. **Open bugs with real symptoms** — if `STATUS.md` lists an open bug with reproducible symptoms, it's
   priority #1. Work by `BUG_FIXING_FRAMEWORK.md`.
2. **Next item from the `STATUS.md` "where to continue" checklist** — if bugs are clear.
3. **Next phase from `master_plan.md`** — if the checklist is empty/done.

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

### `.claude/skills/pause/SKILL.md`

> **FILE: `.claude/skills/pause/SKILL.md`** — замените плейсхолдеры команд (`<BUILD_COMMAND>`/`<COMMIT_COMMAND>`/`<TEST_HARNESS>`) реальными командами проекта

``````md
---
name: pause
description: Завершить рабочую сессию (пауза) — записать статус и планы на следующую сессию в STATUS.md, обновить README, (пере)собрать проект, закоммитить и запушить. Используйте, когда человек говорит «let's pause», «wrap up», «save progress», «commit and push», «end the session», «сделаем паузу», «заверши сессию», «зафиксируй статус».
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
own project: `node tools/build-framework.mjs` regenerates FRAMEWORK.md, and `node tools/readme-pdf.mjs`
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

### `.claude/skills/autoloop/SKILL.md`

> **FILE: `.claude/skills/autoloop/SKILL.md`** — замените плейсхолдеры команд (`<BUILD_COMMAND>`/`<COMMIT_COMMAND>`/`<TEST_HARNESS>`) реальными командами проекта

``````md
---
name: autoloop
description: Запустить агента в ДЛИННОЙ автономной серии по пулу АВТОНОМНЫХ задач (задач, не требующих человека и особых ресурсов). Агент берёт задачу из пула, пишет код, собирает, тестирует на стенде, исправляет, коммитит и берёт следующую. Вызывается человеком («run the autonomous loop», «work on your own», «autopilot», «autoloop», «grind the backlog», «work while I step away», «работай сам», «автопилот», «погриндь беклог») И агентом по собственной инициативе, когда есть автономный беклог, нет активной интерактивной задачи и окружение готово (агент входит в режим и сам перезапускается после каждой задачи).
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
   `BUG_FIXING_FRAMEWORK.md`, the relevant `plans/ideas/*` and `bugs/*`.
2. Check the environment is ready (build toolchain, devices/services — see `AGENT_GUIDE.md`).
3. Assemble/refresh the working pool list from STATUS. Tell the human in one paragraph: what's in the
   pool, which task you start with, and why.

## The cycle (repeat per task)

1. **Pick** the next autonomous task from the pool (priority from STATUS). Verify it can be checked
   WITHOUT the human/special resources. If not — defer, take the next.
2. **Understand it simply** (PHILOSOPHY) — state it in 1–2 sentences. For bugs — open/create a `bugs/` doc.
3. **Implement** in a targeted way, with comments. Don't over-complicate.
4. **Build** (`<BUILD_COMMAND>`). If errors — fix them, don't commit broken state.
5. **Deploy/run** as your project requires.
6. **Verify autonomously** on the harness (`<TEST_HARNESS>`). Look at the result carefully — don't
   wishful-think; verify objectively.
7. **Fix cycle** on a bug: fix → build → test → logs (fresh by timestamp). The **3-attempts** rule →
   `/bug-research` (no code) → then fix.
8. **Capture knowledge**: for bugs — reflection in `bugs/NN_*.md`; for features — status/date in
   `plans/ideas/*`; update `STATUS.md`.
9. **Commit** a small commit (don't lose progress): `<COMMIT_COMMAND>` (style from `AGENT_GUIDE.md`,
   with the Co-Authored-By trailer).
10. **Short chat report** (1–3 lines): what you did, what you verified, what's next. → next task.

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

### `.claude/skills/dayloop/SKILL.md`

> **FILE: `.claude/skills/dayloop/SKILL.md`** — замените плейсхолдеры команд (`<BUILD_COMMAND>`/`<COMMIT_COMMAND>`/`<TEST_HARNESS>`) реальными командами проекта

``````md
---
name: dayloop
description: Дневной цикл автономной работы, пока человек ЗАНЯТ и не может уделять внимание чату. Агент берёт ЛЮБУЮ задачу из беклога (не требующую архитектурного решения человека), пишет код, собирает, тестирует на стенде, исправляет, периодически коммитит и ПУШИТ и работает НЕПРЕРЫВНО (без пауз, без проверок времени). В отличие от nightloop, НЕТ требования останавливаться в определённое время — он работает, пока есть беклог. Останавливается ТОЛЬКО когда: (1) человек написал в чат, (2) непреодолимая критическая ошибка. Вызывается человеком («run the day loop», «work on your own, I'm busy», «dayloop», «grind the backlog») и агентом, когда человек занят и не на связи.
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
when the current one is exhausted (see step 7).

## 🔁 The cycle (one iteration)

1. **Check stop conditions** (above). If stop — go to "Finishing".
2. **Pick ANY backlog task** — scale unlimited (a big one is fine). Sources: `STATUS.md` → "where to
   continue" / active items, `bugs/` (open), `plans/ideas/` (open), loose ends. Priority: finish started
   > bugs/polish > new ideas.
   - **Make decisions yourself** (technical, implementation, approach) — don't wait for the human.
   - **ONLY brand/UX/architecture-defining decisions** (shape the product long-term, not yours to make
     alone) — don't do them blind: file the question in `interviews/interview_NNN_*.md` (`/interview`)
     AND mark `STATUS.md` "❓ awaiting human review: …". Then take ANOTHER task and continue.
   - If a task needs **human actions** (test on real hardware, external accounts) — file **homework** in
     `plans/homework_*.md` and move on.
3. **Do it**: code → build (`<BUILD_COMMAND>`) → deploy → test on the harness (`<TEST_HARNESS>`),
   verify objectively. Use the high-level harness commands; if one is missing, do it the low-level way,
   then ADD a command to the harness so next time it's one step.
4. **Document**: a worklog in `plans/`, bug docs in `bugs/`, `STATUS.md` along the way.
5. **Commit and PUSH** (per `AGENT_GUIDE.md` git workflow): after each finished task or every ~20–30
   minutes. `<COMMIT_COMMAND>`.
6. **Short chat report** (1–3 lines): what you did, what's next — so the human sees progress on a break.
7. **Continue CONTINUOUSLY**: finished a task — next iteration in the same turn. No pauses, no waiting,
   no time checks.
   - **Loop heartbeat (`ScheduleWakeup`):** when the current TURN is exhausted (context filled / turn
     naturally ended) but work remains and no stop condition fired — call `ScheduleWakeup` with the same
     `/dayloop` input and a **minimal** interval (≈60s) so the cycle resumes immediately in a new turn.
     This is NOT a pause — it's how the loop survives the turn boundary and keeps grinding.
   - Do NOT use `ScheduleWakeup` as a pause/wait: no big "wait an hour" intervals, no time-gating.

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

If no open tasks remain in `bugs/` and `plans/ideas/` (all DONE or awaiting the human) — **still don't
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

### `.claude/skills/nightloop/SKILL.md`

> **FILE: `.claude/skills/nightloop/SKILL.md`** — замените плейсхолдеры команд (`<BUILD_COMMAND>`/`<COMMIT_COMMAND>`/`<TEST_HARNESS>`) реальными командами проекта

``````md
---
name: nightloop
description: Ночной цикл автономной работы, пока человек СПИТ и не может отвечать в чат. Агент берёт ЛЮБУЮ задачу из беклога (не требующую архитектурного решения человека), пишет код, собирает, тестирует на стенде, исправляет, периодически коммитит и ПУШИТ и сам перезапускает цикл. Останавливается ТОЛЬКО когда: (1) наступило время пробуждения, (2) человек написал в чат, (3) непреодолимая критическая ошибка. Вызывается человеком («run the night loop», «work overnight», «nightloop», «work until morning») и агентом, когда человек ложится спать.
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

## 🔁 The cycle (one iteration)

1. **Check stop conditions** (above). If stop — go to "Finishing".
2. **Pick ANY backlog task.** Sources & priority as in `/dayloop` (finish started > bugs/polish > new ideas).
   - Make technical/implementation decisions yourself.
   - ONLY brand/UX/architecture-defining decisions — file an `/interview` + mark `STATUS.md`, take another task.
   - Tasks needing human actions (real hardware, external accounts) — file homework in `plans/homework_*.md`.
3. **Do it**: code → build (`<BUILD_COMMAND>`) → deploy → test on the harness (`<TEST_HARNESS>`),
   verify objectively. High-level harness commands first; if missing, do it low-level then ADD the command.
4. **Document**: worklog in `plans/`, bug docs in `bugs/`, `STATUS.md` along the way.
5. **Commit and PUSH** (per `AGENT_GUIDE.md`): after each finished task or every ~20–30 minutes. `<COMMIT_COMMAND>`.
6. **Short chat report** (1–3 lines): so in the morning the human sees the progress.
7. **Self-restart**: call `ScheduleWakeup` with a short listen and the same `/nightloop` input, so the
   cycle continues in the next iteration if the current turn is exhausted. If there's work left in the
   turn — just continue the next iteration in the same turn.

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

### `.claude/skills/refresh-context/SKILL.md`

> **FILE: `.claude/skills/refresh-context/SKILL.md`** — замените плейсхолдеры команд (`<BUILD_COMMAND>`/`<COMMIT_COMMAND>`/`<TEST_HARNESS>`) реальными командами проекта

``````md
---
name: refresh-context
description: Освежить контекст проекта — перечитать мастер-план и карту проекта, ключевые руководящие документы, пройти по bugs/ и plans/ (открытые, без тега DONE) и пересобрать текущий беклог, затем взять что-то в работу. Вызывается человеком («refresh context», «re-read the docs», «rebuild the backlog», «освежи контекст», «перечитай доки») И самим агентом периодически внутри длинных автономных циклов (nightloop/dayloop), чтобы он не терял общую картину между итерациями.
---

# /refresh-context — refresh context and rebuild the backlog

Long autonomous loops and context loss between sessions make the agent lose the big picture. This skill
restores it quickly and forms a current backlog.

## What to do

1. **Re-read strategy & map:**
   - `plans/master_plan.md` — the master plan and phases (where we're going).
   - `plans/project_map.md` — the map of modules/files and data flows (how it's built).

2. **Re-read the KEY guidance docs:**
   - `AGENT_GUIDE.md` — the rules (git workflow, style, tools, build).
   - `STATUS.md` — current state, what's in progress, "where to continue", "awaiting human review".
   - `BUG_FIXING_FRAMEWORK.md` — how to fix bugs.
   - `PHILOSOPHY.md` — the simplicity principle (KISS + Occam).

3. **Walk the backlog and rebuild it:**
   - `ls bugs/` — take everything NOT tagged `DONE` (open bugs).
   - `ls plans/ideas/` — take everything NOT tagged `DONE` (open ideas/features).
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

### `.claude/skills/check-backlog/SKILL.md`

> **FILE: `.claude/skills/check-backlog/SKILL.md`** — замените плейсхолдеры команд (`<BUILD_COMMAND>`/`<COMMIT_COMMAND>`/`<TEST_HARNESS>`) реальными командами проекта

``````md
---
name: check-backlog
description: Ревизия беклога — пройти по bugs/ и plans/ (включая plans/ideas/), найти всё БЕЗ тега DONE в имени файла как открытые задачи и собрать текущий список, а те, что действительно завершены, пометить тегом DONE в имени (git mv) и дописать раздел статуса внутри документа. Вызывается человеком («check the backlog», «revise the backlog», «mark done things DONE», «what's left», «проверь беклог», «пометь сделанное DONE») И агентом периодически в автономных циклах и при refresh-context, чтобы беклог не загнивал и закрытая работа была помечена.
---

# /check-backlog — backlog revision (bugs/ and plans/) and DONE tagging

Over time, `bugs/` and `plans/` accumulate files that are DONE but not tagged `DONE` — so the file
listing no longer tells you what's left. This skill tidies up: it collects the current open list AND
tags the genuinely-closed files DONE.

Relies on the `DONE`-tag-in-filename convention (see `AGENT_GUIDE.md` → "Backlog & the DONE tag").

## What to do

1. **Collect all backlog files:**
   - `ls bugs/` — all bug docs.
   - `ls plans/` and `ls plans/ideas/` — ideas/features and worklogs/plans.
   - ⚠️ `plans/` contains REFERENCE docs (not tasks): `master_plan.md`, `project_map.md`, `goal.md`,
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

### `.claude/skills/report-bug/SKILL.md`

> **FILE: `.claude/skills/report-bug/SKILL.md`** — замените плейсхолдеры команд (`<BUILD_COMMAND>`/`<COMMIT_COMMAND>`/`<TEST_HARNESS>`) реальными командами проекта

``````md
---
name: report-bug
description: Завести документ бага в bugs/ по правилам проекта, когда агент натыкается на дефект во время разработки/тестирования (падение, неверное поведение, регрессия, дефект библиотеки). Агент ведёт СВОЙ беклог багов — один md на каждый замеченный баг, по канону существующих документов в bugs/. Вызывается агентом, когда он находит баг (в том числе внутри автоциклов), И человеком («file a bug», «report this bug», «report-bug», «write this bug down», «заведи баг», «зарепорти баг»).
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

### `.claude/skills/bug-research/SKILL.md`

> **FILE: `.claude/skills/bug-research/SKILL.md`** — замените плейсхолдеры команд (`<BUILD_COMMAND>`/`<COMMIT_COMMAND>`/`<TEST_HARNESS>`) реальными командами проекта

``````md
---
name: bug-research
description: Исследовать баг БЕЗ написания кода/исправлений/сборок — поискать проблему в вебе и собрать сырую базу знаний, прочитать и проанализировать код, чтобы найти причину, поразмышлять и записать гипотезы в документ бага. Используйте, когда баг сопротивляется прямым попыткам (≥3 неудачных слепых итераций исправления), ИЛИ когда человек говорит «research the bug», «look this up», «figure out the cause», «stop poking blindly», «research», «investigate», «исследуй баг», «разберись в причине».
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

### `.claude/skills/propose-idea/SKILL.md`

> **FILE: `.claude/skills/propose-idea/SKILL.md`** — замените плейсхолдеры команд (`<BUILD_COMMAND>`/`<COMMIT_COMMAND>`/`<TEST_HARNESS>`) реальными командами проекта

``````md
---
name: propose-idea
description: Предложить идею/функцию/улучшение, согласующееся с мастер-планом проекта и видением человека, оформив её отдельным md в plans/ideas/ по принятым правилам. Идея, родившаяся у агента, — элемент ВИДЕНИЯ продукта, поэтому она ТРЕБУЕТ одобрения человека (агент НЕ реализует её до одобрения). Вызывается агентом, когда возникает стоящая идея (в том числе в автоциклах), И человеком («propose an idea», «file an idea», «propose-idea», «предложи идею», «оформи идею»).
---

# /propose-idea — file an idea in plans/ideas/ (for the human's approval)

When the agent gets a worthwhile idea (a feature, a UX/architecture improvement, a tool), it files it as
a SEPARATE md in `plans/ideas/` by the same rules as existing ideas. **An agent's idea is a contribution
to the product VISION, and the vision belongs to the owner (the human).** So such an idea is created with
status "awaiting approval" and is **NOT implemented until the human approves it**.

## When to call

- An idea arises that moves the project toward the goals in `master_plan.md`/`PHILOSOPHY.md` and doesn't
  contradict the human's vision.
- NOT for small technical decisions within an already-approved task (decide those yourself and just do them).
- NOT for questions needing the human's INPUT on work already in progress — that's `/interview` (a
  question), not an idea. The difference: `/interview` = "I need your answer to continue";
  `/propose-idea` = "I propose a NEW direction, evaluate it".

## What to do

1. **Check against the vision BEFORE filing.** Read (or recall) `plans/master_plan.md`, `PHILOSOPHY.md`
   (KISS) and decisions in `interviews/`. The idea must align. If it contradicts / leads astray /
   over-complicates without need — don't propose it (or reframe it simpler).

2. **Determine the next number.** `ls plans/ideas/` → max `NN` + 1. Name:
   `plans/ideas/NN_<short_english_name>.md` (like neighbors; NO `DONE` tag).

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
  ideas (`ls plans/ideas/`) so you don't duplicate.
``````

### `.claude/skills/interview/SKILL.md`

> **FILE: `.claude/skills/interview/SKILL.md`** — замените плейсхолдеры команд (`<BUILD_COMMAND>`/`<COMMIT_COMMAND>`/`<TEST_HARNESS>`) реальными командами проекта

``````md
---
name: interview
description: Провести интервью с человеком по открытым вопросам, которые агент НЕ должен решать сам — решения по UI/UX, серьёзные технические развилки, выборы, определяющие бренд или архитектуру. Редкое событие: по умолчанию агент работает автономно. Используйте, когда агент упирается в такое решение, ИЛИ когда человек говорит «interview me», «ask me», «let's do an interview», «interview», «проведи интервью», «спроси меня», «уточни у меня».
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
  - **A) (recommended)** <option + why>
  - **B)** <option>
  - **C)** <option, if any>

  **Answer:**

  ### Q2. ...

  ## Proposed implementation plan (after answers)
  <the steps you'll take once the questions are closed>
  ```

### Step 3. Rules for good questions
- **Closed** A/B/C options — not open "what's best?".
- **Recommendation first**, marked `(recommended)` — the owner always has a fast default.
- Each option with a short "why" / trade-off.
- Group: 1–5 questions per interview, no more.
- Don't ask what's already decided in `plans/` or past interviews.

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

### `.claude/skills/release/SKILL.md`

> **FILE: `.claude/skills/release/SKILL.md`** — замените плейсхолдеры команд (`<BUILD_COMMAND>`/`<COMMIT_COMMAND>`/`<TEST_HARNESS>`) реальными командами проекта

``````md
---
name: release
description: Собрать релиз-кандидат и опубликовать его в GitHub Releases — предпроверка, обновление README (и двуязычных копий), регенерация отрендеренных документов, поднятие версии + сборка + тег + пуш + GitHub Release. Используйте, когда человек говорит «make a release», «ship a release», «cut an RC», «publish a new version», «release», «ship it», «сделай релиз», «выпусти релиз».
---

# /release — publish a release to GitHub

The human asks to ship a new version. This is an **irreversible external action** (a public tag +
GitHub Release). Run the routine **in order**; narrate each step in the chat. If a step fails — stop,
show the error, do NOT continue blindly.

> ⚠️ **CONFIRMATION REQUIRED.** Before the publish itself, show the human: which version it'll be
> (current → new), that the tree is clean, that it built. Publish only on their explicit "yes". A release
> = a public tag and Release, unpleasant to roll back. **In autonomous mode (`/autoloop`/loops) do NOT
> publish a release.**

## Step 0. Decide the bump type

Confirm with the human (or confirm the default): patch / minor / major. State the current → new version.

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
`STATUS.md` and the closed `bugs/`/`plans/ideas/` `*_DONE_*`).

## Step 3. Regenerate rendered docs

`<Regenerate any rendered artifacts, e.g. README.pdf (node tools/readme-pdf.mjs). For this framework's
own project, also regenerate the self-extracting core: node tools/build-framework.mjs.>`

## Step 4. Control build (before the release)

`<Run the project build (BUILD_COMMAND). It must succeed. This catches errors BEFORE the version bump so
you don't leave a half-released version.>`

## Step 5. Commit the doc/build changes (before the release)

Commit the README/docs updates so the `release: X.Y` commit is a clean version bump:
```bash
<COMMIT_COMMAND> "docs: README for release X.Y"
```

## Step 6. Publish (after the human's confirmation)

`<Run your release flow. If you have a release tool (e.g. tools/release.mjs that bumps the version,
builds, renames the artifact, commits "release: X.Y", tags vX.Y, pushes, and runs gh release create with
auto-notes), run it. Otherwise, do it explicitly:>`
```bash
# bump version (in version.json or your manifest), then:
git commit -am "release: X.Y" && git tag vX.Y && git push && git push --tags
gh release create vX.Y --title "vX.Y" --generate-notes <ARTIFACT(S) if any>
```

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


---

## 7. Соглашения (сквозные правила)

Эти правила применяются ко всей работе и упоминаются по всему тексту руководящих документов и навыков.

- **Тег DONE.** Закрытые файлы `bugs/` и `plans/ideas/` получают `DONE`, вставленное после их номера через
  `git mv` (`13_x.md` → `13_DONE_x.md`), плюс дописанный раздел статуса. Одного листинга файлов тогда
  достаточно, чтобы видеть, что открыто, а что закрыто. Справочные документы тегом не помечаются. (Навык: `/check-backlog`.)
- **Коммиты.** `feat:` / `fix:` / `docs:` / `refactor:` / `ci:` + одна строка. Завершайте каждое сообщение
  трейлером `Co-Authored-By:` с именем агента. Коммитьте мелко и часто — прогресс никогда не теряется при
  падении или сбросе контекста.
- **Git-процесс.** Простой, эффективный вариант по умолчанию (используется собственным проектом этого
  фреймворка): работать только в `main`, без feature-веток; для отката использовать историю git
  (`git revert`, `git checkout <hash> -- file`). Выберите то, что подходит, и зафиксируйте это в
  `AGENT_GUIDE.md`, чтобы агент не импровизировал.
- **Комментируйте код.** Комментируйте нетривиальные блоки, модули и важные строки — что они делают, зачем
  и с чем связаны. Это ради прослеживаемости через сессии, теряющие контекст.
- **Озвучивайте прогресс.** Пишите короткие заметки на естественном языке в чат, чтобы человек мог
  заглянуть и следить за ходом — даже (особенно) во время автономных циклов.
- **Читайте свежие логи.** Всегда сверяйтесь с текущим временем и временной меткой лога перед чтением —
  никогда не действуйте по устаревшим логам.
- **Абсолютные даты.** Преобразуйте относительные даты («сегодня», «вчера») в абсолютные в любом
  сохраняемом документе — будущая сессия понятия не имеет, когда было «сегодня».
- **Стройте собственный стенд.** Вкладывайтесь в инструментарий, который позволяет агенту запускать,
  наблюдать и управлять программой без человека и проверять объективно (а не на глаз). Каждый раз, делая
  что-то вручную, спрашивайте, не должно ли это стать командой в один шаг — затем добавьте её и задокументируйте в `AGENT_GUIDE.md`.
- **Живые документы.** Улучшайте `AGENT_GUIDE.md` / `STATUS.md` всякий раз, когда это сделает будущую
  автономную работу эффективнее. Агент направляет и настраивает себя для следующей сессии.

---

## 8. РАСПАКОВКА — шаг за шагом (для AI-агента)

> Цель: развернуть фреймворк в **текущий целевой проект**, адаптировав его под него. Работайте по порядку,
> озвучивайте в чате. Это разовый бутстрап; после него проектом управляют навыки.

**Шаг 0 — Подтвердите цель и прочтите фрактальную оговорку (§1).** Убедитесь, что распаковываете в проект
человека, а НЕ в собственный репозиторий фреймворка. Выводите всё только из ЭТОГО документа.

**Шаг 1 — Изучите целевой проект и выберите рабочий язык.** Прежде чем что-либо писать:
- Прочитайте README, манифесты пакетов / файлы сборки и дерево каталогов.
- Определите: имя проекта, команду сборки, команду тестирования / как его запустить, архитектуру
  (модули/компоненты), git-remote и используемые языки.
- Бегло просмотрите `git log`, чтобы узнать недавнее состояние. Отметьте, что уже есть, а что планируется.
- **Спросите у владельца предпочитаемый рабочий язык** для документов проекта (по умолчанию: английский).
  Дальше пишите **каждый создаваемый вами документ обвязки (Шаги 3–6) на этом языке**, согласно
  *«Локализованному развёртыванию»* из Части 1 — локализуйте прозу и поле `description:` каждого навыка;
  оставляйте каноническими код, команды, пути и идентификаторы `name:` навыков.

**Шаг 2 — Создайте каталоги.**
```
plans/  plans/ideas/  bugs/  interviews/  .claude/skills/
```

**Шаг 3 — Напишите четыре руководящих документа** (из шаблонов в §4), заменяя каждый `<PLACEHOLDER>`
реальными значениями проекта, обнаруженными на Шаге 1:
- `PHILOSOPHY.md`, `BUG_FIXING_FRAMEWORK.md` — универсальны; пишите дословно.
- `AGENT_GUIDE.md` — заполните идентичность, цель, карту архитектуры, команду сборки, тестовый стенд,
  git-процесс, инструменты, стиль кода. Для неизвестных уровня владельца (написание бренда, лицензия)
  оставьте чётко помеченный `TODO` и поднимите их на Шаге 7.
- `STATUS.md` — заполните ТЕКУЩИМ реальным состоянием проекта (с Шага 1): что сделано, где мы находимся,
  пул автономного беклога и чек-лист «где продолжить».

**Шаг 4 — Напишите двенадцать навыков** (из §6), по одному файлу `.claude/skills/<name>/SKILL.md` на каждый,
дословно, кроме плейсхолдеров команд (`<BUILD_COMMAND>`, `<COMMIT_COMMAND>`, `<TEST_HARNESS>`), которые
заменяете реальными командами проекта. Сохраняйте YAML-фронтматтер и фразы-триггеры.

**Шаг 5 — Заполните `plans/`.**
- `master_plan.md` — дорожная карта. Если у проекта есть документ цели/видения, перегоните его; иначе
  набросайте скелет (видение, принципы, фазы) и пометьте его для владельца.
- `project_map.md` — карта архитектуры, по итогам изучения на Шаге 1.

**Шаг 6 — Подключите автозагружаемый контекстный файл.** Создайте или обновите файл, который ваш агент
читает автоматически:
- Claude Code: `CLAUDE.md` (или `.claude/CLAUDE.md`). Некоторые агенты: `AGENTS.md`.
- Добавьте верхнюю секцию: *«Перед каждой задачей читай `AGENT_GUIDE.md` и `STATUS.md`. Думай по `PHILOSOPHY.md`.
  Отлаживай по `BUG_FIXING_FRAMEWORK.md`. Навыки в `.claude/skills/` — твои ритуалы.»* Не дублируйте
  канон — указывайте на него.

**Шаг 7 — Закоммитьте и доложите.**
- `git add -A && git commit -m "chore: deploy KAIF AI agent framework"` (с трейлером Co-Authored-By).
- Доложите человеку: созданную вами структуру, какие плейсхолдеры `TODO` ещё требуют его участия, и
  предложите запустить `/interview`, чтобы закрыть вопросы уровня владельца (бренд, лицензия, видение, приоритеты).

После распаковки проект обёрнут фреймворком. Человек управляет им через `/resume`, `/pause`, навыки циклов
и остальные.

---

## 9. Для человека — быстрый старт

**Установка (однократно):**
1. Положите `FRAMEWORK.md` в корень своего проекта (скачайте его или `git clone` этого репозитория рядом).
2. В своём агенте скажите: *«Прочитай FRAMEWORK.md и распакуй фреймворк KAIF в этот проект.»*
3. Сообщите агенту ваш **предпочитаемый рабочий язык** (по умолчанию английский) и ответьте на несколько
   вопросов уровня владельца, которые он поднимет (он оформит их как документ-интервью).

**Повседневное управление (навыки, которые вы реально будете набирать):**
- `/resume` — начало рабочей сессии: агент читает состояние и предлагает следующий шаг.
- `/pause` — конец сессии: агент записывает состояние, собирает, коммитит и пушит.
- `/autoloop` — *«работай сам по беклогу».* Для случая, когда вы отходите.
- `/dayloop` — *«работай непрерывно, я занят».* Без лимита по времени; останавливается, когда вы напишете.
- `/nightloop` — *«работай ночью».* Останавливается во время пробуждения или когда вы напишете.
- `/report-bug`, `/propose-idea`, `/interview`, `/release` — как подсказывают названия.

**Что вы получите:** агента, который никогда не начинает с нуля, которого можно оставить работать часами,
который эскалирует решения, действительно принадлежащие вам, и который оставляет после себя репозиторий,
документирующий, как и почему построен ваш проект — читаемый и вами, и следующей сессией агента в равной мере.

---

## 10. Справочник плейсхолдеров

При распаковке заменяйте их по всему тексту руководящих документов и навыков:

| Плейсхолдер | Значение |
|-------------|---------|
| `<PROJECT_NAME>` / `<SHORT_NAME>` | Имя проекта / короткое имя. |
| `<AUTHOR>` | Владелец (имя / ник). |
| `<REPO_URL>` / `<LOCAL_PATH>` | URL git-remote / локальная папка проекта. |
| `<LICENSE>` | Лицензия проекта. |
| `<BUILD_COMMAND>` | Точная команда сборки проекта. |
| `<TEST_HARNESS>` | Как агент запускает/наблюдает/управляет программой без человека. |
| `<COMMIT_COMMAND>` | Поток коммита/пуша (инструмент или `git add -A && git commit … && git push`). |
| `<YOUR AGENT/MODEL>` | Идентичность Co-Authored-By для коммитов. |

Для неизвестных уровня владельца (написание бренда, выбор лицензии, целевые платформы, видение) не
угадывайте — оставьте `TODO` и закройте его через `/interview`.

---

## Лицензия и автор

Лицензия MIT — © 2026 **Mikalai Kryvusha (KOT KRINIK)** · Николай Кривуша aka Кот Криник.

Вы вправе использовать, копировать, изменять и распространять этот фреймворк. Применяйте его к любому
проекту — включая, как демонстрирует этот репозиторий, собственный проект фреймворка (фрактальный принцип:
фреймворк организован и обёрнут самим собой).
