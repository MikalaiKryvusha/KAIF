<p align="center">
  <img src="KAIF.jpg" alt="KAIF — Krinik AI Framework" width="640">
</p>

<a id="english"></a>

# KAIF — Krinik AI Framework

<p align="center">
  <a href="#english"><img src="https://img.shields.io/badge/English-2C7BE5?style=for-the-badge" alt="English"></a>
  &nbsp;
  <a href="#russian"><img src="https://img.shields.io/badge/Русский-C0392B?style=for-the-badge" alt="Русский"></a>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-FF1A8C.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.5-FF1A8C.svg)](https://github.com/MikalaiKryvusha/KAIF/releases)
[![Thin install](https://img.shields.io/badge/Install-Thin%20(machinery%20does%20it)-3DDC84.svg)](KAIF.md)
[![Tested](https://img.shields.io/badge/Discipline-Tested%20KAIF-FFB300.svg)](#tested-en)
[![For AI agents](https://img.shields.io/badge/For-AI%20coding%20agents-7F52FF.svg)](KAIF.md)
[![Languages](https://img.shields.io/badge/Owner%20docs-10%20languages-blue.svg)](#lang-en)

**KAIF — Krinik AI Framework — a context-resilient, fundamental strategic-operational methodological framework for AI agents: resilience to context loss and discipline of autonomy.**
Drop it into any cognitive project — in any domain — to turn your AI agent (Claude or any other) into a
disciplined, autonomous teammate that never starts from zero. The human stays the visionary; the agent
executes. KAIF is the methodology binding them — with a full lifecycle: deploy → update → fork → remove.

> 📦 The entry point is one small file: **[`KAIF.md`](KAIF.md)** (~170 lines). It fetches the **installer
> machinery** from this repository, and the machinery deploys everything mechanically — your agent's only
> cognitive work is understanding *your* project.
> ✈️ Fully offline? Every release also attaches **`KAIF-FULL.md`** — the classic self-contained core.

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
   You (human)                          Your AI agent                 The machinery
   ───────────                          ─────────────                ─────────────
1. Drop KAIF.md into your repo
2. "Unpack the KAIF framework"  ─▶  3 bootstrap steps            ─▶  fetches itself from origin
                                     (Node check · write the         (sha256-verified), deploys
                                     loader verbatim · run it)       EVERYTHING mechanically
                                                                  ─▶  leaves ONE short adaptation
                                    ◀─  understands YOUR project      task for the agent
3. /resume · /pause · /autoloop ···  ─▶  works like a disciplined, autonomous teammate
```

**New in 1.5:** the deploy is *thin*. The agent reads ~10 KB instead of ~220 KB (×23 less), and its
cognitive writing shrinks ×66 — the machinery unpacks the docs, generates the skills for **five agent
systems at once**, localizes the owner-facing docs, wires everything, validates itself, and self-cleans.
Field-certified end-to-end on a 12-billion-parameter local model.

<a id="tested-en"></a>

## Tested KAIF — nothing raw is trusted

1.5's codename discipline: **raw generated content is never trusted.** Everything non-trivial the agent
creates is born marked **`[NOT-TESTED]`** in its comment; only verification *by observation* (it ran, it
rendered, it counted) flips it to **`[TESTED: date · how]`**. A false `[TESTED]` is a fraud the judge
hunts. The canon lives in a new key document, **`TESTING_FRAMEWORK.md`** — the seven classic testing
principles (defects exist · exhaustive testing is impossible · test early · defects cluster · the
pesticide paradox · context matters · a bug-free product that misses the user's goal is worthless),
written for an AI agent and universal across domains: code, documents, analyses, anything.

## The fable execution loop — discipline at decision points

KAIF 1.5 vendors the **[fable-method](https://github.com/Sahir619/fable-method)** family (© Sahir619,
MIT) verbatim — four skills that script how a task is *executed*: **/fable-method** (classify → define
done → evidence → decide → act surgically → verify by observation → report outcome-first, with forced
artifacts `INTENT:`/`AUTH:`/`TWINS:`/`PENDING:` at decision points), **/fable-loop** (orchestration with
adversarial verifiers), **/fable-judge** (adversarial verification of any "done" claim — **mandatory** in
KAIF's autonomous loops and before every release), and **/fable-domain** (generates new domain workflow
bundles). KAIF's spheres carry each domain's binding evidence sets, authority orders, and fraud tables.

## Quick start (for the human)

1. **Get the entry point.** Download **[`KAIF.md`](KAIF.md)** into your project's root — or clone this
   repo alongside:
   ```bash
   git clone https://github.com/MikalaiKryvusha/KAIF.git
   ```
   You'll need the **network** during install (the machinery is fetched from this repo, sha256-verified)
   and **Node.js ≥ 18**. No network? Use `KAIF-FULL.md` from the [releases](https://github.com/MikalaiKryvusha/KAIF/releases).

2. **Write `GOAL.md` first — recommended, but optional.** A short document *you* write: what you want,
   what the end result should be, for whom. If it's there at deploy time, the agent orients the whole
   deployment (sphere, terminology, `MASTER_PLAN.md`) around it. You can add it later — the agent will
   seed a template — but writing it up front saves rework.

3. **Ask your agent to unpack it.** Two optional parameters:
   - **Working language** (default English) — owner-facing docs come out in your language;
     agent-internal docs stay English (LLMs read it best). Ten languages ship prebuilt:
     en, ru, zh-Hans, es, hi, ar, pt, fr, de, ja.
   - **Install mode** — standard (default) or **anonymous**: deploys with no origin tracking and no
     author references, *by design* (mechanically stripped and grep-verified).

   The shortest form works:
   > *"Read KAIF.md and unpack the KAIF framework into this project."*

   …and the explicit form:
   > *"Read KAIF.md and unpack the KAIF framework into this project. Working language: Russian.
   > Install mode: anonymous."*

   Skills are generated for **five agent systems at once** — Claude Code, OpenAI Codex, Grok Build,
   Cline, Zoo Code — plus a universal `AGENTS.md`, so the project isn't tied to one tool.

   > 🔐 Cautious harnesses (e.g. Claude Code's auto mode) may ask permission before running the loader —
   > that's the download-and-execute pattern being flagged, as it should be. Approve it once.

4. **Any model strength works.** The machinery does the structure; your agent's only cognitive job is the
   short `KAIF_ADAPTATION_TASK.md` (study the project, fill the maps, derive the plan) with a forced
   checkpoint command per item — **field-certified on a local 12 B model end-to-end**.

5. **Drive it with skills:** `/resume` · `/pause` · `/autoloop` · `/dayloop` · `/nightloop` ·
   `/report-bug` · `/propose-idea` · `/interview` · `/fable-method` · `/fable-judge` · `/what-next` ·
   `/help-kaif` · `/release`.

## Updating a deployed project

Since 1.5 updates are **mechanical and respectful**: `npm run kaif:update` (or
`node .kaif/kaif-core.mjs update`) fetches the latest machinery, replaces only the framework files you
never touched (content snapshots tell it which), adds the new ones, **never enters your content**
(`GOAL.md`, `STATUS.md`, the knowledge directories), and leaves a short `KAIF_UPDATE_TASK.md` for the
genuinely diverged places. A pre-1.5 project updates by simply dropping the fresh thin `KAIF.md` on top
and asking for an update — the installer detects the existing deployment and preserves everything.
Field-tested on a real 1.4 project: the owner's content survived byte-for-byte.

<a id="lang-en"></a>

## Your language, your project

The framework's sources are English (the community language). On deploy the machinery **localizes the
owner-facing documents** (`GOAL.md`, `KAIF_FRAMEWORK.md`, the directory READMEs) from prebuilt packs —
ten languages: **en, ru, zh-Hans, es, hi, ar, pt, fr, de, ja** — and appends **trigger aliases in your
language** to every skill, so the agent catches your commands («сделай релиз», «haz un release», …)
while the skills themselves stay English. Agent-internal docs stay English by design. Other languages
degrade honestly: English + a translation item in the adaptation task.

## What gets unpacked

```
your-project/
│
│  ── KEY DOCUMENTS ──
├── AGENT_GUIDE.md                        # THE canon — read before every task
├── PHILOSOPHY.md                         # how the agent thinks: KISS + Occam + the principle set
├── BUG_FIXING_FRAMEWORK.md               # how the agent debugs: intent gate, fix→build→test, twin check
├── TESTING_FRAMEWORK.md                  # how the agent tests everything: 7 principles + [NOT-TESTED]/[TESTED]
├── GOAL.md                               # the vision — you fill this in (localized template)
├── STATUS.md · EXPERIENCE.md             # the living state · the grep-friendly log of lessons
├── MASTER_PLAN.md                        # the phased roadmap from current state → GOAL
├── PROJECT_STRUCTURE_EXTERNAL_MAP.md     # external map: dirs/files/links
├── PROJECT_ARCHITECTURE_INTERNAL_MAP.md  # internal map: abstractions & how they interact
├── KAIF_FRAMEWORK.md                     # "KAIF, deployed here" — written after injection (localized)
│
│  ── KNOWLEDGE DIRECTORIES (each with its own localized README) ──
├── plans/ ideas/ bugs/ researches/ interviews/ homeworks/
│
│  ── SKILLS FOR FIVE AGENT SYSTEMS + UNIVERSAL FALLBACK ──
├── .claude/skills/   .agents/skills/   .grok/skills/   .cline/skills/   .roo/commands/
├── AGENTS.md · CLAUDE.md · .clinerules/ · .roo/rules/   # auto-context pointers
│
└── .kaif/                                # kaif.json marker · kaif-core.mjs (backs kaif:*) · spheres/
```

## The documents & directories — who writes what

**Key documents (project root):**

| Document | What it's for | Who writes / maintains it |
|----------|---------------|---------------------------|
| `AGENT_GUIDE.md` | The canon — rules, map, commands, conventions | Machinery deploys; agent adapts; you rarely touch it |
| `PHILOSOPHY.md` | How the agent thinks (KISS + Occam + the principle set) | Universal — deployed verbatim |
| `BUG_FIXING_FRAMEWORK.md` | How the agent debugs (intent gate, 3 attempts, twin check) | Universal — deployed verbatim |
| `TESTING_FRAMEWORK.md` | How the agent tests everything it creates | Universal — deployed verbatim |
| **`GOAL.md`** | The vision: what you want in the end | **You (owner)** — the one doc you should fill |
| `STATUS.md` | The living state — what's done, where we are, next | Agent maintains after every task |
| `EXPERIENCE.md` | The agent's grep-friendly log of lessons | Agent grows it on its own (`/experience`) |
| `MASTER_PLAN.md` | The phased roadmap from state → GOAL | Agent derives from `GOAL.md` (`/revision`) |
| The two maps | External layout · internal abstractions | Agent maintains |
| `KAIF_FRAMEWORK.md` | "KAIF, deployed here" (like a tech-stack page) | Agent writes after injection |

**Knowledge directories** — same conventions as before: `plans/` (agent's step plans), `ideas/` (mostly
yours; agent implements *after your approval*), `bugs/` (one doc per defect), `researches/` (the big hard
questions), `interviews/` (owner-level decisions — you answer right in the document), `homeworks/` (tasks
only a human can do). Closed `bugs/`/`ideas/`/`plans/`/`homeworks/` files get the `DONE` tag in the
filename; `GOAL`, `MASTER_PLAN`, the maps and `researches/` are living references — never tagged.

## The skills

Twenty-six repeatable rituals — the verbs of working on a project:

| Skill | Purpose |
|-------|---------|
| `/resume` · `/pause` | Start / end a session (read docs, pick the main thing · update STATUS, commit, push). |
| `/autoloop` · `/dayloop` · `/nightloop` | Autonomous loops: grind the backlog; each item ends with a **mandatory judge pass**. |
| `/refresh-context` · `/check-backlog` | Re-read the plan & maps; tag finished work `DONE`. |
| `/experience` | Capture a lesson into `EXPERIENCE.md`, or recall lessons before a task. |
| `/report-bug` · `/bug-research` | File a bug by the canon · deep investigation after 3 failed fixes. |
| `/propose-idea` · `/interview` | Propose a feature for your approval · ask you A/B/C/D on a fateful decision. |
| `/revision` · `/fix-vision` · `/what-next` | Re-derive the plan from GOAL · capture your chat vision into docs · propose next steps. |
| `/help-kaif` | Explain KAIF to you in chat — a structured user manual. |
| `/release` | Publish a release (with your confirmation and a mandatory judge pass; never autonomously). |
| **`/fable-method`** | The execution loop: classify → define done → evidence → act → verify → report. *(vendored from [fable-method](https://github.com/Sahir619/fable-method), MIT)* |
| **`/fable-loop`** | Orchestrated run: parallel evidence, surgical execution, adversarial verifiers. |
| **`/fable-judge`** | Adversarial verification of any "done" claim: VERIFIED / CAVEATS / REFUTED. |
| **`/fable-domain`** | Generate a trusted domain-workflow bundle (adapter + trap + smoke eval). |
| `/kaif-version` · `/kaif-update` · `/kaif-fork` · `/kaif-switch-origin` · `/kaif-remove` | The lifecycle: check origin · mechanical respectful update · fork your own line · switch back · respectful removal (asks partial vs full). |

## Lifecycle, any domain, any agent

- **A lifecycle, not a one-shot install.** Versioned (`vX.Y`), recorded in `.kaif/kaif.json`, updated
  **mechanically** from origin (content snapshots protect your customizations), forkable, switchable,
  respectfully removable. Backed by real `npm run kaif:*` handles.
- **Any domain, not just code.** A *sphere* (programming, science, design, business, …) ships to
  `.kaif/spheres/` with the domain's terminology **and its execution discipline**: the binding minimum
  evidence set, the authority order, what "verified by observation" means there, and the fraud table the
  judge hunts on non-code work.
- **Any agent, not just Claude.** Skills are generated for five systems at once (Claude Code, Codex,
  Grok Build, Cline, Zoo Code) + the universal `AGENTS.md`; Cursor/Copilot/Windsurf ride the fallback.
- **Anonymous install — by design.** *"Install mode: anonymous"* deploys fully with no origin tracking
  and no author references: origin-tied skills skipped, the author's note stripped mechanically, and a
  final grep-gate refuses to finish if any identity leak remains.

### The `npm run kaif:*` handles

| Command | What it does |
|---------|--------------|
| `npm run kaif:version` | Show the deployed KAIF version (from `.kaif/kaif.json`). |
| `npm run kaif:check` | Validate the deployment against its manifest — works even after self-clean. |
| `npm run kaif:update` | **Mechanical respectful update** from origin (see above). |

Forking, switching origin, and removal are driven by their skills (`/kaif-fork`, `/kaif-switch-origin`,
`/kaif-remove`) — ask your agent.

## Four ideas hold it together

1. **Externalized memory** — the agent's state lives in files, not the chat. A fresh session is instantly productive.
2. **Knowledge that accumulates** — bugs, decisions, research, and proposals become durable documents, not lost chat.
3. **Bounded autonomy** — the agent decides what's cheap to reverse; it escalates brand/UX/architecture via interviews.
4. **Nothing raw is trusted** — execution runs the fable loop, everything created carries a test-status marker, and a judge re-runs the claims. *(Simplicity still rules: KISS + Occam.)*

## For AI agents

If you are an AI agent: read **[`KAIF.md`](KAIF.md)** — it is short. Your entire bootstrap is three steps
with forced checkpoints (§2): check Node, write the loader verbatim, run it. The machinery does the rest
and leaves you `KAIF_ADAPTATION_TASK.md` — the only cognitive work. Never bypass the checksum gate.

## This repository is fractal (dogfooding)

This repo *is* the framework **and** is *wrapped by* the framework — it uses itself. Its root holds a real
`AGENT_GUIDE.md`, `STATUS.md`, `.claude/skills/`, `plans/`, `ideas/`, `bugs/`, `interviews/` describing the
development *of the framework itself*.

> ⚠️ **When you deploy the framework into your project, start from `KAIF.md` only** — not from this repo's
> own wrapper files (they're about building the framework, not your project). Everything a deployment
> needs is fetched by the machinery from `dist/`, which is **generated** from `framework/` by
> `node tools/build-framework.mjs` — never hand-edit the generated artifacts.

## Repository layout

```
KAIF.md                          ⭐ the THIN entry point (~170 lines; bootstrap + embedded loader), generated
framework/                       the canonical universal templates (the payload)
  installer/                     KAIF-CORE.mjs (the machinery) · KAIF-LOADER.mjs · the thin core's narrative
  templates/languages/           10 language packs (owner-facing docs + skill trigger aliases)
  skills/ spheres/ adapters/     26 skill templates · sphere libraries · agent-system adapters
dist/                            generated distribution: KAIF.md · KAIF-CORE.mjs · KAIF-CORE-BUNDLE.md
                                 · kaif-manifest.json (sha256) · KAIF-FULL.md (offline fallback)
tools/                           build-framework.mjs · check-framework.mjs · readme-pdf.mjs · commit.mjs
README.md / README.pdf           this front door (EN+RU) and its rendered copy
GOAL.md  MASTER_PLAN.md  …        the dogfooding wrapper (the framework applied to itself)
```

## License

[MIT](LICENSE) — © 2026 **Mikalai Kryvusha** aka **KOT KRINIK** · Николай Кривуша aka Кот Криник.
The execution-discipline skills (`fable-*`) are vendored from
[fable-method](https://github.com/Sahir619/fable-method) © Sahir619, MIT.

Use it, copy it, modify it, ship it — including, as this repo shows, on the framework's own project.

---
---

<a id="russian"></a>

# КАИФ — Криник АИ Фреймворк

[![License: MIT](https://img.shields.io/badge/License-MIT-FF1A8C.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.5-FF1A8C.svg)](https://github.com/MikalaiKryvusha/KAIF/releases)
[![Тонкая установка](https://img.shields.io/badge/Установка-Тонкая%20(машинерией)-3DDC84.svg)](KAIF.md)
[![Tested](https://img.shields.io/badge/Дисциплина-Tested%20KAIF-FFB300.svg)](#tested-ru)
[![Для ИИ-агентов](https://img.shields.io/badge/Для-ИИ--агентов-7F52FF.svg)](KAIF.md)
[![Языки](https://img.shields.io/badge/Owner--доки-10%20языков-blue.svg)](#lang-ru)

**КАИФ — Криник АИ Фреймворк — контекстоустойчивый фундаментальный стратегическо-операционный методологический фреймворк для ИИ-агентов: устойчивость к потере контекста и дисциплина автономности.**
Положите его в любой когнитивный проект — в любой сфере — и ваш ИИ-агент (Claude или любой другой) превратится в
дисциплинированного автономного напарника, который никогда не начинает с нуля. Человек остаётся
визионером, агент — исполнителем; KAIF — методология, их связывающая, с полным жизненным циклом:
развёртывание → обновление → форк → удаление.

> 📦 Точка входа — один маленький файл: **[`KAIF.md`](KAIF.md)** (~170 строк). Он подтягивает
> **машинерию-инсталлятор** из этого репозитория, и та разворачивает всё механически — когнитивная работа
> вашего агента сводится к пониманию *вашего* проекта.
> ✈️ Совсем без сети? К каждому релизу приложен **`KAIF-FULL.md`** — классическое самодостаточное ядро.

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
   Вы (человек)                        Ваш ИИ-агент                  Машинерия
   ────────────                        ────────────                  ─────────
1. Кладёте KAIF.md в репозиторий
2. «Распакуй фреймворк KAIF»    ─▶  3 шага бутстрапа            ─▶  скачивает себя из origin
                                     (проверка Node · загрузчик      (проверка sha256), разворачивает
                                     дословно · запуск)              ВСЁ механически
                                                                 ─▶  оставляет агенту ОДНО короткое
                                   ◀─  понимает ВАШ проект           задание адаптации
3. /resume · /pause · /autoloop ···  ─▶ работает как дисциплинированный автономный напарник
```

**Новое в 1.5:** установка *тонкая*. Агент читает ~10 КБ вместо ~220 КБ (в 23 раза меньше), а его
когнитивное письмо сжимается в 66 раз — машинерия распаковывает документы, генерирует навыки сразу для
**пяти агентских систем**, локализует owner-документы, делает весь wiring, самопроверяется и
самоочищается. Полевая сертификация — насквозь на локальной модели в 12 миллиардов параметров.

<a id="tested-ru"></a>

## Tested KAIF — сырому доверия нет

Дисциплина, давшая имя релизу 1.5: **сырому сгенерированному контенту доверять нельзя.** Всё
нетривиальное, что агент создаёт, рождается с маркером **`[NOT-TESTED]`** в комментарии; только проверка
*наблюдением* (запустилось, отрисовалось, посчиталось) переводит его в **`[TESTED: дата · как]`**. Ложный
`[TESTED]` — фрод, на который охотится судья. Канон — в новом ключевом документе
**`TESTING_FRAMEWORK.md`**: семь классических принципов тестирования (дефекты есть всегда ·
исчерпывающее тестирование невозможно · тестируй рано · дефекты кучкуются · парадокс пестицида ·
контекст решает · безошибочный продукт мимо цели пользователя бесполезен), написанные для ИИ-агента и
универсальные по сферам: код, документы, анализы — что угодно.

## Fable-цикл исполнения — дисциплина на точках решения

KAIF 1.5 вендорит семейство **[fable-method](https://github.com/Sahir619/fable-method)** (© Sahir619,
MIT) дословно — четыре навыка, задающие, как *исполняется* задача: **/fable-method** (классифицируй →
определи «готово» → свидетельства → решай → действуй хирургически → проверь наблюдением → доложи
результатом-вперёд, с принудительными артефактами `INTENT:`/`AUTH:`/`TWINS:`/`PENDING:` на точках
решения), **/fable-loop** (оркестровка с адверсарными верификаторами), **/fable-judge** (адверсарная
проверка любого «готово» — **обязательна** в автономных циклах KAIF и перед каждым релизом) и
**/fable-domain** (генерирует доменные workflow-бандлы). Сферы KAIF несут обязательные наборы
свидетельств, порядки авторитетов и таблицы фродов своих доменов.

## Быстрый старт (для человека)

1. **Возьмите точку входа.** Скачайте **[`KAIF.md`](KAIF.md)** в корень проекта — или склонируйте этот
   репозиторий рядом:
   ```bash
   git clone https://github.com/MikalaiKryvusha/KAIF.git
   ```
   На время установки нужны **сеть** (машинерия скачивается из этого репозитория с проверкой sha256) и
   **Node.js ≥ 18**. Сети нет? Возьмите `KAIF-FULL.md` из [релизов](https://github.com/MikalaiKryvusha/KAIF/releases).

2. **Сначала оформите `GOAL.md` — желательно, но не обязательно.** Короткий документ, который пишете
   *вы*: что вы хотите, что должно получиться и для кого. Если он есть при развёртывании, агент
   ориентирует на него сферу, терминологию и `MASTER_PLAN.md`. Можно добавить позже — агент создаст
   шаблон, — но заранее выгоднее.

3. **Попросите агента распаковать.** Два необязательных параметра:
   - **Рабочий язык** (по умолчанию английский) — owner-документы выйдут на вашем языке;
     внутренние документы агента остаются английскими (LLM читают его лучше всего). Десять языков
     предсобраны: en, ru, zh-Hans, es, hi, ar, pt, fr, de, ja.
   - **Режим установки** — обычный (по умолчанию) или **анонимный**: без трекинга origin и упоминаний
     автора, *by design* (вычищается механически и проверяется грепом).

   Работает короткая форма:
   > *«Прочитай KAIF.md и распакуй фреймворк KAIF в этот проект».*

   …и явная:
   > *«Прочитай KAIF.md и распакуй фреймворк KAIF в этот проект. Рабочий язык: русский.
   > Режим установки: анонимный».*

   Навыки генерируются сразу для **пяти агентских систем** — Claude Code, OpenAI Codex, Grok Build,
   Cline, Zoo Code — плюс универсальный `AGENTS.md`: проект не привязан к одному инструменту.

   > 🔐 Осторожные харнессы (например, auto-режим Claude Code) могут спросить разрешение на запуск
   > загрузчика — это срабатывает защита от паттерна «скачай и выполни», как и должна. Разрешите один раз.

4. **Сила модели больше не важна для структуры.** Машинерия делает всё механическое; когнитивная работа
   агента — короткое `KAIF_ADAPTATION_TASK.md` (изучить проект, заполнить карты, вывести план) с
   принудительной чекпоинт-командой на каждый пункт — **полевая сертификация: локальная модель 12B
   проходит путь насквозь**.

5. **Управляйте навыками:** `/resume` · `/pause` · `/autoloop` · `/dayloop` · `/nightloop` ·
   `/report-bug` · `/propose-idea` · `/interview` · `/fable-method` · `/fable-judge` · `/what-next` ·
   `/help-kaif` · `/release`.

## Обновление развёрнутого проекта

С 1.5 обновления **механические и уважительные**: `npm run kaif:update` (или
`node .kaif/kaif-core.mjs update`) скачивает свежую машинерию, заменяет только те файлы фреймворка,
которые вы не трогали (это знают снапшоты содержимого), добавляет новые, **никогда не заходит в ваш
контент** (`GOAL.md`, `STATUS.md`, директории знаний) и оставляет короткое `KAIF_UPDATE_TASK.md` по
реально разошедшимся местам. Проект на до-1.5 обновляется просто: положите свежий тонкий `KAIF.md`
поверх и попросите обновить — инсталлятор сам увидит существующее развёртывание и всё сохранит.
Полевой тест на реальном 1.4-проекте: контент владельца пережил обновление байт в байт.

<a id="lang-ru"></a>

## Ваш язык — ваш проект

Исходники фреймворка — английские (язык сообщества). При развёртывании машинерия **локализует
owner-документы** (`GOAL.md`, `KAIF_FRAMEWORK.md`, README директорий) из предсобранных пакетов — десять
языков: **en, ru, zh-Hans, es, hi, ar, pt, fr, de, ja** — и дописывает каждому навыку **триггер-алиасы
на вашем языке**, чтобы агент ловил ваши команды («сделай релиз», «продолжи»…), при этом сами навыки
остаются английскими. Внутренние документы агента — английские by design. Прочие языки деградируют
честно: английский + пункт перевода в задании адаптации.

## Что разворачивается

```
ваш-проект/
│
│  ── КЛЮЧЕВЫЕ ДОКУМЕНТЫ ──
├── AGENT_GUIDE.md                        # КАНОН — читать перед каждой задачей
├── PHILOSOPHY.md                         # как агент мыслит: KISS + Оккам + набор принципов
├── BUG_FIXING_FRAMEWORK.md               # как агент чинит: intent gate, фикс→сборка→тест, twin check
├── TESTING_FRAMEWORK.md                  # как агент тестирует всё: 7 принципов + [NOT-TESTED]/[TESTED]
├── GOAL.md                               # видение — заполняете вы (локализованный шаблон)
├── STATUS.md · EXPERIENCE.md             # живое состояние · греп-дружелюбный журнал уроков
├── MASTER_PLAN.md                        # пошаговый генплан от состояния → к GOAL
├── PROJECT_STRUCTURE_EXTERNAL_MAP.md     # внешняя карта: директории/файлы/связи
├── PROJECT_ARCHITECTURE_INTERNAL_MAP.md  # внутренняя карта: абстракции и взаимодействия
├── KAIF_FRAMEWORK.md                     # «KAIF, развёрнутый здесь» — после инжекции (локализован)
│
│  ── ДИРЕКТОРИИ ЗНАНИЙ (в каждой — локализованный README) ──
├── plans/ ideas/ bugs/ researches/ interviews/ homeworks/
│
│  ── НАВЫКИ ДЛЯ ПЯТИ АГЕНТСКИХ СИСТЕМ + УНИВЕРСАЛЬНЫЙ ФОЛБЭК ──
├── .claude/skills/   .agents/skills/   .grok/skills/   .cline/skills/   .roo/commands/
├── AGENTS.md · CLAUDE.md · .clinerules/ · .roo/rules/   # указатели авто-контекста
│
└── .kaif/                                # маркер kaif.json · kaif-core.mjs (движок kaif:*) · spheres/
```

## Документы и директории — кто что пишет

**Ключевые документы (корень проекта):**

| Документ | Для чего | Кто пишет / ведёт |
|----------|----------|-------------------|
| `AGENT_GUIDE.md` | Канон — правила, карта, команды, соглашения | Машинерия разворачивает; агент адаптирует; вы почти не трогаете |
| `PHILOSOPHY.md` | Как агент мыслит (KISS + Оккам + принципы) | Универсальный — дословно |
| `BUG_FIXING_FRAMEWORK.md` | Как агент чинит баги | Универсальный — дословно |
| `TESTING_FRAMEWORK.md` | Как агент тестирует всё созданное | Универсальный — дословно |
| **`GOAL.md`** | Видение: чего вы хотите в итоге | **Вы (владелец)** — единственный документ, который стоит заполнить |
| `STATUS.md` | Живое состояние — что сделано, где мы, что дальше | Агент ведёт после каждой задачи |
| `EXPERIENCE.md` | Журнал уроков агента (что работает/нет) | Агент растит сам (`/experience`) |
| `MASTER_PLAN.md` | Генплан от состояния → к GOAL | Агент выводит из `GOAL.md` (`/revision`) |
| Две карты | Внешняя структура · внутренние абстракции | Агент ведёт |
| `KAIF_FRAMEWORK.md` | «KAIF, развёрнутый здесь» | Агент пишет после инжекции |

**Директории знаний** — соглашения прежние: `plans/` (пошаговые планы агента), `ideas/` (в основном
ваши; агент реализует *после вашего одобрения*), `bugs/` (по документу на дефект), `researches/`
(масштабные трудные вопросы), `interviews/` (решения владельца — отвечаете прямо в документе),
`homeworks/` (задания, которые может сделать только человек). Закрытые файлы `bugs/`/`ideas/`/`plans/`/
`homeworks/` получают тег `DONE` в имени; `GOAL`, `MASTER_PLAN`, карты и `researches/` — живые
справочники, тегом не помечаются.

## Навыки

Двадцать шесть повторяемых ритуалов — глаголы работы над проектом:

| Навык | Назначение |
|-------|------------|
| `/resume` · `/pause` | Начать / завершить сессию (прочитать доки, выбрать главное · обновить STATUS, закоммитить). |
| `/autoloop` · `/dayloop` · `/nightloop` | Автономные циклы: гриндить беклог; каждый пункт завершается **обязательным judge-проходом**. |
| `/refresh-context` · `/check-backlog` | Перечитать план и карты; пометить сделанное `DONE`. |
| `/experience` | Зафиксировать урок в `EXPERIENCE.md` или вспомнить уроки перед задачей. |
| `/report-bug` · `/bug-research` | Завести баг по канону · глубокое исследование после 3 неудачных фиксов. |
| `/propose-idea` · `/interview` | Предложить фичу на ваше одобрение · задать вам A/B/C/D по судьбоносной развилке. |
| `/revision` · `/fix-vision` · `/what-next` | Перевывести план из GOAL · зафиксировать ваше видение из чата · предложить следующие шаги. |
| `/help-kaif` | Рассказать вам про KAIF в чате — структурный мануал. |
| `/release` | Выпустить релиз (с вашим подтверждением и обязательным judge-проходом; никогда автономно). |
| **`/fable-method`** | Цикл исполнения: классифицируй → «готово» → свидетельства → действуй → проверь → доложи. *(вендорено из [fable-method](https://github.com/Sahir619/fable-method), MIT)* |
| **`/fable-loop`** | Оркестрованный прогон: параллельные свидетельства, хирургическое исполнение, адверсарные верификаторы. |
| **`/fable-judge`** | Адверсарная проверка любого «готово»: VERIFIED / CAVEATS / REFUTED. |
| **`/fable-domain`** | Сгенерировать доверенный доменный workflow-бандл (адаптер + ловушка + smoke-eval). |
| `/kaif-version` · `/kaif-update` · `/kaif-fork` · `/kaif-switch-origin` · `/kaif-remove` | Жизненный цикл: версия и обновления · механический уважительный update · форк своей линии · возврат на origin · уважительное удаление (спросит: частично или полностью). |

## Жизненный цикл, любая сфера, любой агент

- **Жизненный цикл, а не разовая установка.** Версионируется (`vX.Y`), фиксируется в `.kaif/kaif.json`,
  обновляется **механически** из origin (снапшоты содержимого берегут ваши кастомизации), форкается,
  переключается, уважительно удаляется. Через реальные «ручки» `npm run kaif:*`.
- **Любая сфера, не только код.** *Сфера* (программирование, наука, дизайн, бизнес, …) разворачивается в
  `.kaif/spheres/` с терминологией домена **и его дисциплиной исполнения**: обязательный минимум
  свидетельств, порядок авторитетов, что значит «проверено наблюдением», и таблица фродов, по которой
  судья судит некодовые работы.
- **Любой агент, не только Claude.** Навыки генерируются сразу для пяти систем (Claude Code, Codex,
  Grok Build, Cline, Zoo Code) + универсальный `AGENTS.md`; Cursor/Copilot/Windsurf едут на фолбэке.
- **Анонимная установка — by design.** *«Режим установки: анонимный»* разворачивает полноценно, без
  трекинга origin и упоминаний автора: origin-навыки пропускаются, заметка автора вырезается
  механически, а финальный греп-гейт откажется завершать установку при любой утечке.

### «Ручки» `npm run kaif:*`

| Команда | Что делает |
|---------|------------|
| `npm run kaif:version` | Показать развёрнутую версию KAIF (из `.kaif/kaif.json`). |
| `npm run kaif:check` | Проверить развёртывание по манифесту — работает и после самоочистки. |
| `npm run kaif:update` | **Механическое уважительное обновление** из origin (см. выше). |

Форк, смена origin и удаление управляются своими навыками (`/kaif-fork`, `/kaif-switch-origin`,
`/kaif-remove`) — попросите агента.

## Четыре идеи, на которых всё держится

1. **Вынесенная память** — состояние агента живёт в файлах, а не в чате. Новая сессия продуктивна сразу.
2. **Накопление знаний** — баги, решения, исследования и идеи становятся долговечными документами.
3. **Ограниченная автономность** — агент сам решает то, что легко откатить; бренд/UX/архитектуру выносит на интервью.
4. **Сырому доверия нет** — исполнение идёт по fable-циклу, всё созданное несёт маркер тест-статуса, а судья перепрогоняет заявления. *(Простота по-прежнему правит: KISS + Оккам.)*

## Для ИИ-агентов

Если вы — ИИ-агент: прочитайте **[`KAIF.md`](KAIF.md)** — он короткий. Весь ваш бутстрап — три шага с
принудительными чекпоинтами (§2): проверить Node, записать загрузчик дословно, запустить. Остальное
сделает машинерия и оставит вам `KAIF_ADAPTATION_TASK.md` — единственную когнитивную работу. Никогда не
обходите проверку контрольных сумм.

## Этот репозиторий фрактален (самообвязка)

Этот репозиторий *является* фреймворком **и** *обвязан* фреймворком — он использует сам себя. В его корне лежат
настоящие `AGENT_GUIDE.md`, `STATUS.md`, `.claude/skills/`, `plans/`, `ideas/`, `bugs/`, `interviews/`,
описывающие разработку *самого фреймворка*.

> ⚠️ **Разворачивая фреймворк в свой проект, начинайте ТОЛЬКО с `KAIF.md`** — а не с обвязочных файлов
> этого репозитория (они про разработку фреймворка, а не вашего проекта). Всё нужное для развёртывания
> машинерия берёт из `dist/`, который **генерируется** из `framework/` командой
> `node tools/build-framework.mjs` — никогда не правьте сгенерированные артефакты руками.

## Структура репозитория

```
KAIF.md                          ⭐ ТОНКАЯ точка входа (~170 строк; бутстрап + встроенный загрузчик), генерируется
framework/                       канонические универсальные шаблоны (полезная нагрузка)
  installer/                     KAIF-CORE.mjs (машинерия) · KAIF-LOADER.mjs · повествование тонкого ядра
  templates/languages/           10 языковых пакетов (owner-доки + триггер-алиасы навыков)
  skills/ spheres/ adapters/     26 шаблонов навыков · библиотеки сфер · адаптеры агентских систем
dist/                            сгенерированная раздача: KAIF.md · KAIF-CORE.mjs · KAIF-CORE-BUNDLE.md
                                 · kaif-manifest.json (sha256) · KAIF-FULL.md (оффлайн-фолбэк)
tools/                           build-framework.mjs · check-framework.mjs · readme-pdf.mjs · commit.mjs
README.md / README.pdf           этот «парадный вход» (EN+RU) и его рендер-копия
GOAL.md  MASTER_PLAN.md  …        обвязка-самообёртка (фреймворк, применённый к себе)
```

## Лицензия

[MIT](LICENSE) — © 2026 **Mikalai Kryvusha** aka **KOT KRINIK** · Николай Кривуша aka Кот Криник.
Навыки дисциплины исполнения (`fable-*`) вендорены из
[fable-method](https://github.com/Sahir619/fable-method) © Sahir619, MIT.

Используйте, копируйте, изменяйте, распространяйте — в том числе, как показывает этот репозиторий, на
проекте самого фреймворка.
