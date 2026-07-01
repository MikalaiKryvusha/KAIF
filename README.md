# KAIF — Krinik AI Framework

<p align="center">
  <a href="#kaif--krinik-ai-framework"><img src="https://img.shields.io/badge/English-2C7BE5?style=for-the-badge" alt="English"></a>
  &nbsp;
  <a href="#kaif--фреймворк-для-ии-агента-на-русском"><img src="https://img.shields.io/badge/Русский-C0392B?style=for-the-badge" alt="Русский"></a>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-FF1A8C.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.1-FF1A8C.svg)](https://github.com/MikalaiKryvusha/KAIF/releases)
[![Self-extracting](https://img.shields.io/badge/Core-Self--extracting-3DDC84.svg)](KAIF.md)
[![For AI agents](https://img.shields.io/badge/For-AI%20coding%20agents-7F52FF.svg)](KAIF.md)
[![Languages](https://img.shields.io/badge/Docs-EN%20%7C%20RU-blue.svg)](#kaif--фреймворк-для-ии-агента-на-русском)

**A context-resilient, fundamental methodology — an autonomy-disciplined operating framework for AI agents.**
Drop it into any cognitive project — in any domain — to turn your AI agent (Claude or any other) into a
disciplined, autonomous teammate that never starts from zero. The human stays the visionary; the agent
executes. KAIF is the methodology binding them — with a full lifecycle: deploy → update → fork → remove.

> 🇬🇧 English (primary) below · [Русская версия ниже](#kaif--фреймворк-для-ии-агента-на-русском)
> 📦 The whole framework is one file: **[`KAIF.md`](KAIF.md)** — a self-extracting core.

---

## Why

AI coding agents are powerful but suffer two chronic failures:

- **They forget.** Context is lost between sessions. Every new session re-discovers the architecture, the
  decisions, the half-finished work, the bug it was chasing yesterday.
- **They drift.** Left autonomous, an agent either stalls (over-engineering a misunderstood task) or
  oversteps (making brand/architecture decisions that weren't its to make).

**KAIF** fixes both by **externalizing the agent's working memory and discipline into the repository
itself** — a small set of markdown files, directory conventions, and repeatable slash-skills. The result:
any fresh session resumes instantly with full context, works autonomously within clear bounds, and
accumulates knowledge instead of evaporating it.

It is **not code** — it is *process, captured as files an agent reads*. It works with any language, any
stack, any project. It was distilled from the real working method that emerged as Krinik and Claude built
software together — a standalone by-product of that collaboration, generalized for everyone.

## How it works

```
   You (human)                         Your AI agent
   ───────────                         ─────────────
1. Drop KAIF.md into your repo
2. "Unpack the KAIF framework"  ─▶  reads KAIF.md, inspects your project,
                                        writes out the structure, customizes it
3. /resume · /pause · /autoloop ···  ─▶ works like a disciplined, autonomous teammate
```

## Your language, your project

The framework's sources are English (the community language), but **on deploy the agent asks your
preferred working language and writes your project's working docs and skills in it** — unpacking from the
English sources into whatever language suits your team. Code, commands, and `/command` names stay
canonical; the prose speaks your language. *(This repo is the example: an English payload with a Russian
working wrapper.)*

## Quick start (for the human)

1. **Get the framework.** Download **[`KAIF.md`](KAIF.md)** into your project's root — or clone this repo
   alongside your project:
   ```bash
   git clone https://github.com/MikalaiKryvusha/KAIF.git
   ```
2. **Ask your agent to unpack it.** The initiator command names two parameters — your **working language**
   (so the agent knows which language to unpack the English sources into) and your **target agent system**
   (so it knows how to translate the skills). Both have defaults; state them to be explicit:
   > *"Read KAIF.md and unpack the KAIF framework into this project. Working language: English. Agent
   > system: Claude Code."*

   The agent inspects your project, creates the structure, fills in the project-specific details, and may
   ask a few owner-level questions (brand, license) via a short interview document — answer them.
3. **Mind your AI system's power (see below).** Strong model with a large context → one-command unpack.
   Small-context / local model → ask for the **respectful staged flow**.
4. **Write `GOAL.md` first if you can (see below).**
5. **Drive it with skills:** `/resume` · `/pause` · `/autoloop` · `/dayloop` · `/nightloop` ·
   `/report-bug` · `/propose-idea` · `/interview` · `/revision` · `/release`.

### Strong vs. small-context AI systems

Unpacking a whole framework *and* studying a whole project at once is a heavy task. Match the approach to
your agent's cognitive power and context window:

- **Strong model, large context** — e.g. Claude Opus/Sonnet, GPT-class, Gemini with a large window (cloud
  models with big context). You can **unpack in one command**, as above.
- **Weak / small-context model** — e.g. local models on gaming GPUs with limited VRAM, or any short-context
  model. A single big unpack command is **risky and will likely fail** (it runs out of context). Instead
  ask the agent to use KAIF's **respectful staged flow**: atomic steps that each need only a little in
  context — processing one embedded file at a time, persisting progress to disk, possibly across several
  messages or even **several separate chats**. Just say: *"Unpack KAIF using the respectful staged flow for
  a small-context model."* The method is documented inside `KAIF.md` (§8).

### `GOAL.md` — your vision, worth writing first

`GOAL.md` is a short document *you* write: **what you want, what the end result should be, for whom.** It's
the north star the agent orients the whole deployment around — the sphere, the terminology, and the
`MASTER_PLAN.md` it derives from it. **It's not mandatory** — you can add it later — but then the agent has
to re-translate the already-deployed framework into your project's meaning (extra work). **Better to write
it up front.** How: create `GOAL.md` in your project root with a few honest sentences of vision (a template
is generated for you if it's missing); the agent reads it on deploy and builds your roadmap from it.

## What gets unpacked

```
your-project/
│  ── KEY DOCUMENTS ──
├── AGENT_GUIDE.md                        # THE canon — read before every task
├── PHILOSOPHY.md                         # how the agent thinks: KISS + Occam + the principle set
├── BUG_FIXING_FRAMEWORK.md               # how the agent debugs: fix→build→test, the 3-attempts rule
├── GOAL.md                               # the vision — you fill this in
├── STATUS.md                             # the living state — updated after every significant task
├── MASTER_PLAN.md                        # the phased roadmap from current state → GOAL
├── PROJECT_STRUCTURE_EXTERNAL_MAP.md     # external map: dirs/files/links
├── PROJECT_ARCHITECTURE_INTERNAL_MAP.md  # internal map: abstractions & how they interact
├── KAIF_FRAMEWORK.md                     # "KAIF, deployed here" — written after injection
│  ── KNOWLEDGE DIRECTORIES (each with its own README) ──
├── plans/  ideas/  bugs/  researches/  interviews/  homeworks/
└── .claude/skills/                       # the 18 repeatable rituals (below)
```

## The documents & directories — who writes what

The heart of KAIF is a small set of documents and directories with clear conventions: which the **agent**
maintains, which **you (the owner)** author, and which the agent creates for **you to answer in**.

**Key documents (project root):**

| Document | What it's for | Who writes / maintains it |
|----------|---------------|---------------------------|
| `AGENT_GUIDE.md` | The canon — rules, map, commands, conventions | Agent (from the template); you rarely touch it |
| `PHILOSOPHY.md` | How the agent thinks (KISS + Occam + the principle set) | Universal — agent copies verbatim |
| `BUG_FIXING_FRAMEWORK.md` | How the agent debugs | Universal — agent copies verbatim |
| **`GOAL.md`** | The vision: what you want in the end | **You (owner)** — the one doc you should fill |
| `STATUS.md` | The living state — what's done, where we are, next | Agent maintains after every task |
| `MASTER_PLAN.md` | The phased roadmap from state → GOAL | Agent derives from `GOAL.md` (`/revision`) |
| `PROJECT_STRUCTURE_EXTERNAL_MAP.md` | External map: dirs/files/links | Agent maintains |
| `PROJECT_ARCHITECTURE_INTERNAL_MAP.md` | Internal map: abstractions & interactions | Agent maintains |
| `KAIF_FRAMEWORK.md` | "KAIF, deployed here" (like a tech-stack page) | Agent writes after injection |

**Knowledge directories (each has a `README.md` explaining its rules):**

| Directory | What lives there | Who writes / where you answer |
|-----------|------------------|-------------------------------|
| `plans/` | Detailed step plans implementing the roadmap | Agent (you may drop a plan to steer) |
| `ideas/` | Feature/improvement proposals | **Mostly you**; the agent tidies & implements *after your approval* |
| `bugs/` | One doc per defect (symptom → forensics → fix) | Agent (you may seed a bug in plain words) |
| `researches/` | Notes on the big, hard questions | Agent (you may request a topic) |
| `interviews/` | Owner-level decisions, A/B/C/D questions | Agent asks; **you answer right in the document** |
| `homeworks/` | Tasks only a human can do (physical/offline) | Agent asks; **you do them & write results back** |

> **DONE tag.** Closed `bugs/`, `ideas/`, `plans/`, `homeworks/` files get `DONE` inserted after their
> number (`13_x.md` → `13_DONE_x.md`). `GOAL.md`, `MASTER_PLAN.md`, the maps, and `researches/` notes are
> living references — never tagged.

## The skills

Eighteen repeatable rituals — the verbs of working on a project:

| Skill | Purpose |
|-------|---------|
| `/resume` | Start a session — read the docs, pick the one main thing, begin. |
| `/pause` | End a session — update STATUS & README, build, commit, push. |
| `/autoloop` | Grind a pool of autonomous tasks in a self-restarting series. |
| `/dayloop` | Continuous autonomous work while you're busy (no time stop). |
| `/nightloop` | Autonomous work until a wake time / you return. |
| `/refresh-context` | Re-read the plan, maps & guidance; rebuild the backlog. |
| `/check-backlog` | Tag finished work `DONE`; return the open list. |
| `/report-bug` | File a bug document by the canon. |
| `/bug-research` | Deep investigation (no coding) after 3 failed fix attempts. |
| `/propose-idea` | Propose a feature for your approval. |
| `/interview` | Ask you closed A/B/C/D questions on a fateful decision. |
| `/revision` | (Re)derive `MASTER_PLAN.md` from `GOAL.md` and the current state. |
| `/release` | Publish a release to GitHub (with confirmation; never autonomously). |
| `/kaif-version` · `/kaif-update` | Report the deployed version; respectfully update & migrate from origin. |
| `/kaif-fork` · `/kaif-switch-origin` | Snapshot KAIF to your own repo; or switch tracking back to origin. |
| `/kaif-remove` | Respectfully remove KAIF — it **asks you** partial (keep artifacts) or full; your project stays intact. |

## Lifecycle, any domain, any agent

- **A lifecycle, not a one-shot install.** KAIF is versioned (two-digit `vX.Y`, the release date in the
  release notes), recorded in `.kaif/kaif.json`. It can **update & migrate** from origin respectfully,
  **fork** into your own repo to evolve independently, switch back, and be **respectfully removed** —
  keeping your bug reports, interviews, ideas, and research, or fully, leaving your own project untouched.
  Backed by `npm run kaif:*` handles.
- **Any domain, not just code.** A *sphere* (programming, science, design, business, …) tailors the
  terminology at deploy time via per-sphere term libraries — so KAIF fits research, design, PM, finance,
  writing, and more.
- **Any agent, not just Claude.** Adapters wire KAIF into each system's conventions (Claude Code, OpenAI
  Codex, GitHub Copilot, Cursor, Windsurf, Cline, Roo Code, …), always with a universal `AGENTS.md` fallback.

## Four ideas hold it together

1. **Externalized memory** — the agent's state lives in files, not the chat. A fresh session is instantly productive.
2. **Knowledge that accumulates** — bugs, decisions, research, and proposals become durable documents, not lost chat.
3. **Bounded autonomy** — the agent decides what's cheap to reverse; it escalates brand/UX/architecture via interviews.
4. **Simplicity above cleverness** — a stall means you misunderstood the task, not that it's hard. KISS + Occam.

## For AI agents

If you are an AI agent: read **[`KAIF.md`](KAIF.md)** end to end, then follow its *"Unpacking — step by
step"* section (§8) — choosing the fast path or the respectful staged flow per your context window.
Everything you need is inside that one document.

## This repository is fractal (dogfooding)

This repo *is* the framework **and** is *wrapped by* the framework — it uses itself. Its root holds a real
`AGENT_GUIDE.md`, `STATUS.md`, `.claude/skills/`, `plans/`, `ideas/`, `bugs/`, `interviews/` describing the
development *of the framework itself*.

> ⚠️ **When you deploy the framework into your project, derive everything from `KAIF.md` only** — not from
> this repo's own wrapper files (they're about building the framework, not your project). `KAIF.md` is the
> single source of truth for deployment. It is **generated** from `framework/` by
> `node tools/build-framework.mjs` — never hand-edit it.

## Repository layout

```
KAIF.md                          ⭐ the self-extracting core (English; unpacks into any language), generated
framework/                       the canonical universal templates (the payload)
tools/                           build-framework.mjs · check-framework.mjs · readme-pdf.mjs · commit.mjs · kaif.mjs
README.md / README.pdf           this front door (EN+RU) and its rendered copy
GOAL.md  MASTER_PLAN.md  …        the dogfooding wrapper (the framework applied to itself)
```

## License

[MIT](LICENSE) — © 2026 **Mikalai Kryvusha** aka **KOT KRINIK** · Николай Кривуша aka Кот Криник.

Use it, copy it, modify it, ship it — including, as this repo shows, on the framework's own project.

---
---

# KAIF — Фреймворк для ИИ-агента (на русском)

[![License: MIT](https://img.shields.io/badge/License-MIT-FF1A8C.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.1-FF1A8C.svg)](https://github.com/MikalaiKryvusha/KAIF/releases)
[![Самораспаковывающийся](https://img.shields.io/badge/Ядро-Самораспаковывающееся-3DDC84.svg)](KAIF.md)

**KAIF — фундаментальная методология и фреймворк работы для ИИ-агентов: устойчивость к потере контекста и дисциплина автономности.**
Положите его в любой когнитивный проект — в любой сфере — и ваш ИИ-агент (Claude или любой другой) превратится в
дисциплинированного автономного напарника, который никогда не начинает с нуля. Человек остаётся
визионером, агент — исполнителем; KAIF — методология, их связывающая, с полным жизненным циклом:
развёртывание → обновление → форк → удаление.

> 📦 Весь фреймворк — это один файл: **[`KAIF.md`](KAIF.md)** (на английском) — самораспаковывающееся
> ядро. При распаковке агент развернёт его на нужном вам языке; отдельной русской версии ядра не требуется.

---

## Зачем

ИИ-агенты-программисты мощны, но страдают двумя хроническими бедами:

- **Они забывают.** Контекст теряется между сессиями. Каждая новая сессия заново выясняет архитектуру,
  принятые решения, недоделанную работу, баг, который ловили вчера.
- **Их «уводит».** Будучи автономным, агент либо застревает (переусложняя неверно понятую задачу), либо
  превышает полномочия (принимая решения о бренде/архитектуре, которые принимать был не вправе).

**KAIF** лечит и то и другое, **вынося рабочую память и дисциплину агента в сам репозиторий** — в виде
небольшого набора markdown-файлов, соглашений о директориях и повторяемых /слеш-навыков. Итог: любая
новая сессия мгновенно включается в работу с полным контекстом, работает автономно в чётких границах и
накапливает знания, а не испаряет их.

Это **не код** — это *процесс, зафиксированный как файлы, которые читает агент*. Он работает с любым
языком, любым стеком, любым проектом. Фреймворк выделен («дистиллирован») из реального метода работы,
сложившегося у Криника в паре с Claude в совместной разработке софта, — самостоятельный побочный продукт
этого сотрудничества, обобщённый для всех.

## Как это работает

```
   Вы (человек)                         Ваш ИИ-агент
   ────────────                         ────────────
1. Кладёте KAIF.md в свой репозиторий
2. «Распакуй фреймворк KAIF»        ─▶  читает KAIF.md, изучает проект,
                                         разворачивает структуру, настраивает её
3. /resume · /pause · /autoloop ···  ─▶ работает как дисциплинированный автономный напарник
```

## Ваш язык — ваш проект

Исходники фреймворка — на английском (язык сообщества), но **при распаковке агент спрашивает ваш
предпочитаемый рабочий язык и пишет рабочие документы и навыки вашего проекта на нём** — разворачивая из
английских исходников в язык, удобный вашей команде. Код, команды и имена `/команд` остаются
каноническими; на ваш язык переводится текст. *(Этот репозиторий — пример: английская полезная нагрузка и
русская рабочая обвязка.)*

## Быстрый старт (для человека)

1. **Возьмите фреймворк.** Скачайте **[`KAIF.md`](KAIF.md)** в корень своего проекта — или склонируйте
   этот репозиторий рядом:
   ```bash
   git clone https://github.com/MikalaiKryvusha/KAIF.git
   ```
2. **Попросите агента распаковать.** Команда-инициатор называет два параметра — ваш **рабочий язык** (чтобы
   агент понимал, в какой язык распаковывать английские исходники) и вашу **целевую ИИ-агентскую систему**
   (чтобы понимал, как транслировать навыки). У обоих есть дефолты; укажите их явно:
   > *«Прочитай KAIF.md и распакуй фреймворк KAIF в этот проект. Рабочий язык: русский. Агентская система:
   > Claude Code.»*

   Агент изучит проект, создаст структуру, заполнит специфику проекта и может задать несколько вопросов
   уровня владельца (бренд, лицензия) через короткий документ-интервью — ответьте на них.
3. **Учтите мощность вашей ИИ-системы (см. ниже).** Сильная модель с большим контекстом → распаковка одной
   командой. Слабая/локальная модель с малым контекстом → попросите **уважительный поэтапный флоу**.
4. **По возможности сначала оформите `GOAL.md` (см. ниже).**
5. **Управляйте навыками:** `/resume` · `/pause` · `/autoloop` · `/dayloop` · `/nightloop` · `/report-bug`
   · `/propose-idea` · `/interview` · `/revision` · `/release`.

### Сильные и слабые (малоконтекстные) ИИ-системы

Распаковать целый фреймворк *и* изучить целый проект за один раз — тяжёлая задача. Подбирайте подход под
когнитивную мощность и контекстное окно вашего агента:

- **Сильная модель, большой контекст** — например, Claude Opus/Sonnet, модели уровня GPT, Gemini с большим
  окном (облачные модели с большим контекстом). Можно **распаковывать одной командой**, как выше.
- **Слабая / малоконтекстная модель** — например, локальные модели на геймерских видеокартах с малой VRAM
  или любая короткоконтекстная модель. Одна большая команда распаковки **рискованна и, скорее всего,
  провалится** (не хватит контекста). Вместо этого попросите агента использовать **уважительный поэтапный
  флоу** KAIF: атомарные шаги, каждому нужно держать в контексте лишь немного — обрабатывая по одному
  встроенному файлу за раз, сохраняя прогресс на диск, возможно, за несколько сообщений или даже **несколько
  отдельных чатов**. Просто скажите: *«Распакуй KAIF уважительным поэтапным флоу для малоконтекстной
  модели.»* Метод описан внутри `KAIF.md` (§8).

### `GOAL.md` — ваше видение, лучше оформить заранее

`GOAL.md` — короткий документ, который пишете *вы*: **что вы хотите, что должно получиться в итоге и для
кого.** Это путеводная звезда, вокруг которой агент выстраивает всё развёртывание — сферу, терминологию и
`MASTER_PLAN.md`, который из него выводится. **Он не обязателен** — можно добавить позже, — но тогда агенту
придётся заново транслировать уже развёрнутый фреймворк в смысл вашего проекта (лишняя работа). **Лучше
оформить заранее.** Как: создайте `GOAL.md` в корне проекта с несколькими честными предложениями о видении
(если его нет — агент создаст шаблон); агент прочитает его при развёртывании и построит из него ваш
генплан.

## Что распаковывается

```
ваш-проект/
│  ── КЛЮЧЕВЫЕ ДОКУМЕНТЫ ──
├── AGENT_GUIDE.md                        # КАНОН — читать перед каждой задачей
├── PHILOSOPHY.md                         # как агент мыслит: KISS + Оккам + набор принципов
├── BUG_FIXING_FRAMEWORK.md               # как агент чинит баги: цикл фикс→сборка→тест, правило 3 попыток
├── GOAL.md                               # видение — заполняете вы
├── STATUS.md                             # живое состояние — обновляется после каждой значимой задачи
├── MASTER_PLAN.md                        # пошаговый генплан от состояния → к GOAL
├── PROJECT_STRUCTURE_EXTERNAL_MAP.md     # внешняя карта: директории/файлы/связи
├── PROJECT_ARCHITECTURE_INTERNAL_MAP.md  # внутренняя карта: абстракции и их взаимодействия
├── KAIF_FRAMEWORK.md                     # «KAIF, развёрнутый здесь» — пишется после инжекции
│  ── ДИРЕКТОРИИ ЗНАНИЙ (в каждой свой README) ──
├── plans/  ideas/  bugs/  researches/  interviews/  homeworks/
└── .claude/skills/                       # 18 повторяемых ритуалов (ниже)
```

## Документы и директории — кто что пишет

Сердце KAIF — небольшой набор документов и директорий с ясными договорённостями: что ведёт **агент**, что
пишете **вы (владелец)**, а что агент создаёт для **ваших ответов**.

**Ключевые документы (корень проекта):**

| Документ | Для чего | Кто пишет / ведёт |
|----------|----------|-------------------|
| `AGENT_GUIDE.md` | Канон — правила, карта, команды, соглашения | Агент (из шаблона); вы почти не трогаете |
| `PHILOSOPHY.md` | Как агент мыслит (KISS + Оккам + набор принципов) | Универсальный — агент копирует дословно |
| `BUG_FIXING_FRAMEWORK.md` | Как агент чинит баги | Универсальный — агент копирует дословно |
| **`GOAL.md`** | Видение: чего вы хотите в итоге | **Вы (владелец)** — единственный документ, который стоит заполнить |
| `STATUS.md` | Живое состояние — что сделано, где мы, что дальше | Агент ведёт после каждой задачи |
| `MASTER_PLAN.md` | Пошаговый генплан от состояния → к GOAL | Агент выводит из `GOAL.md` (`/revision`) |
| `PROJECT_STRUCTURE_EXTERNAL_MAP.md` | Внешняя карта: директории/файлы/связи | Агент ведёт |
| `PROJECT_ARCHITECTURE_INTERNAL_MAP.md` | Внутренняя карта: абстракции и взаимодействия | Агент ведёт |
| `KAIF_FRAMEWORK.md` | «KAIF, развёрнутый здесь» (как страница технологий) | Агент пишет после инжекции |

**Директории знаний (в каждой свой `README.md` с правилами):**

| Директория | Что там лежит | Кто пишет / где вы отвечаете |
|------------|---------------|------------------------------|
| `plans/` | Детальные пошаговые планы под генплан | Агент (вы можете положить план, чтобы направить) |
| `ideas/` | Идеи и предложения по улучшению | **В основном вы**; агент причёсывает и реализует *после вашего одобрения* |
| `bugs/` | По документу на дефект (симптом → форензика → фикс) | Агент (вы можете завести баг простыми словами) |
| `researches/` | Конспекты по масштабным трудным вопросам | Агент (вы можете обозначить тему) |
| `interviews/` | Решения уровня владельца, вопросы A/B/C/D | Агент спрашивает; **вы отвечаете прямо в документе** |
| `homeworks/` | Задания, которые может сделать только человек (физика/офлайн) | Агент просит; **вы выполняете и вписываете результаты** |

> **Тег DONE.** В закрытые файлы `bugs/`, `ideas/`, `plans/`, `homeworks/` после номера вставляется `DONE`
> (`13_x.md` → `13_DONE_x.md`). `GOAL.md`, `MASTER_PLAN.md`, карты и конспекты `researches/` — живые
> справочники, тегом не помечаются.

## Навыки

Восемнадцать повторяемых ритуалов — глаголы работы над проектом:

| Навык | Назначение |
|-------|------------|
| `/resume` | Начать сессию — прочитать доки, выбрать главное, приступить. |
| `/pause` | Завершить сессию — обновить STATUS и README, собрать, закоммитить, запушить. |
| `/autoloop` | Грайндить пул автономных задач серией с самоперезапуском. |
| `/dayloop` | Непрерывная автономная работа, пока вы заняты (без стопа по времени). |
| `/nightloop` | Автономная работа до времени пробуждения / вашего возвращения. |
| `/refresh-context` | Перечитать план, карты и руководства; пересобрать беклог. |
| `/check-backlog` | Пометить сделанное `DONE`; вернуть список открытого. |
| `/report-bug` | Завести баг-документ по канону. |
| `/bug-research` | Глубокое исследование (без кода) после 3 неудачных попыток фикса. |
| `/propose-idea` | Предложить фичу на ваше одобрение. |
| `/interview` | Задать вам закрытые вопросы A/B/C/D по судьбоносному решению. |
| `/revision` | (Пере)разработать `MASTER_PLAN.md` из `GOAL.md` и текущего состояния. |
| `/release` | Выпустить релиз в GitHub (с подтверждением; никогда автономно). |
| `/kaif-version` · `/kaif-update` | Показать версию; уважительно обновиться и мигрировать из origin. |
| `/kaif-fork` · `/kaif-switch-origin` | Слепок KAIF в свой репозиторий; или переключиться обратно на origin. |
| `/kaif-remove` | Уважительно удалить KAIF — **спрашивает вас**: частично (с сохранением артефактов) или полностью. |

## Жизненный цикл, любая сфера, любой агент

- **Жизненный цикл, а не разовая установка.** KAIF версионируется (две цифры `vX.Y`, дата релиза — в
  описании релиза) и фиксируется в `.kaif/kaif.json`. Он умеет **уважительно обновляться и мигрировать** из
  origin, делать **форк** в ваш репозиторий для независимой эволюции, переключаться обратно и **уважительно
  удаляться** — с сохранением ваших баг-репортов, интервью, идей и исследований, или полностью, не трогая
  ваш проект. Через «ручки» `npm run kaif:*`.
- **Любая сфера, не только код.** *Сфера* (программирование, наука, дизайн, бизнес, …) настраивает
  терминологию при развёртывании через библиотеки терминов — KAIF подходит для исследований, дизайна,
  проджект-менеджмента, финансов, писательства и прочего.
- **Любой агент, не только Claude.** Адаптеры подключают KAIF к соглашениям каждой системы (Claude Code,
  OpenAI Codex, GitHub Copilot, Cursor, Windsurf, Cline, Roo Code, …), всегда с запасным `AGENTS.md`.

## Четыре идеи, на которых всё держится

1. **Вынесенная память** — состояние агента живёт в файлах, а не в чате. Новая сессия продуктивна сразу.
2. **Накопление знаний** — баги, решения, исследования и идеи становятся долговечными документами, а не теряются в чате.
3. **Ограниченная автономность** — агент сам решает то, что легко откатить; бренд/UX/архитектуру выносит на интервью.
4. **Простота важнее «умности»** — затык значит, что вы не поняли задачу, а не что она сложна. KISS + Оккам.

## Для ИИ-агентов

Если вы — ИИ-агент: прочитайте **[`KAIF.md`](KAIF.md)** целиком, затем следуйте разделу *«Распаковка — по
шагам»* (§8), выбрав быстрый путь или уважительный поэтапный флоу под своё контекстное окно. Всё нужное —
внутри этого одного документа.

## Этот репозиторий фрактален (самообвязка)

Этот репозиторий *является* фреймворком **и** *обвязан* фреймворком — он использует сам себя. В его корне лежат
настоящие `AGENT_GUIDE.md`, `STATUS.md`, `.claude/skills/`, `plans/`, `ideas/`, `bugs/`, `interviews/`,
описывающие разработку *самого фреймворка*.

> ⚠️ **Разворачивая фреймворк в свой проект, берите всё ТОЛЬКО из `KAIF.md`** — а не из собственных
> обвязочных файлов этого репозитория (они про разработку фреймворка, а не вашего проекта). `KAIF.md` —
> единственный источник истины для развёртывания. Он **генерируется** из `framework/` командой
> `node tools/build-framework.mjs` — никогда не правьте его руками.

## Структура репозитория

```
KAIF.md                          ⭐ самораспаковывающееся ядро (английский; распаковывается в любой язык)
framework/                       канонические универсальные шаблоны (полезная нагрузка)
tools/                           build-framework.mjs · check-framework.mjs · readme-pdf.mjs · commit.mjs · kaif.mjs
README.md / README.pdf           этот «парадный вход» (EN+RU) и его рендер-копия
GOAL.md  MASTER_PLAN.md  …        обвязка-самообёртка (фреймворк, применённый к себе)
```

## Лицензия

[MIT](LICENSE) — © 2026 **Mikalai Kryvusha** aka **KOT KRINIK** · Николай Кривуша aka Кот Криник.

Используйте, копируйте, изменяйте, распространяйте — в том числе, как показывает этот репозиторий, на
проекте самого фреймворка.
