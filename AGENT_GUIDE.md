# KAIF — руководство для AI-агента

Этот файл AI-агент читает перед каждой задачей. Это **канон** работы над **этим проектом**
— над самим Krinik AI Framework (KAIF).

> 🧠 **ГЛАВНЫЙ ПРИНЦИП — ПРОСТОТА (читай `PHILOSOPHY.md`).** Если что-то занимает много времени — это не
> сложная задача и не баг инструментов: ты ДЕЛАЕШЬ СЛИШКОМ СЛОЖНО, потому что не ПОНЯЛ задачу. KISS +
> бритва Оккама. Застрял → переосмысли и упрости, никогда не наращивай сложность.

> ♻️ **ЭТОТ ПРОЕКТ ФРАКТАЛЕН — читай внимательно.** Этот репозиторий *является фреймворком* И *обёрнут
> фреймворком* (он применяет себя к себе, dogfooding). Поэтому здесь два слоя, и путать их нельзя:
>
> 1. **Полезная нагрузка** — то, что фреймворк разворачивает в других проектах:
>    - `framework/` — канонические универсальные шаблоны (девять ключевых документов, шесть README директорий, двадцать один навык и скрипт-распаковщик).
>    - `KAIF.md` — **самораспаковывающееся ядро**, СГЕНЕРИРОВАННОЕ из `framework/` инструментом
>      `tools/build-framework.mjs`. Это единственный источник истины для развёртывания.
> 2. **Обвязка для dogfooding** — фреймворк, применённый к *этому* проекту (то, что ты читаешь, чтобы работать здесь):
>    - этот `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`, `BUG_FIXING_FRAMEWORK.md`,
>      `.claude/skills/`, `plans/`, `bugs/`, `interviews/`.
>
> ⚠️ **Когда кто-то разворачивает фреймворк в СВОЁМ проекте, он использует только `KAIF.md` — а НЕ
> файлы обвязки этого репозитория.** Не давай обвязке протечь в полезную нагрузку. Если ты улучшаешь навык
> или руководящий документ *как шаблон* — правь его в `framework/` и пересобирай; если ты улучшаешь то, как
> ведётся *этот проект* — правь корневую обвязку. Обычно нужно, чтобы оба слоя двигались вместе — держи их
> согласованными.

---

## Перед каждой задачей — чек-лист

```
1. Read STATUS.md                 # current state of the framework project
2. Recall EXPERIENCE.md           # grep by task tags — don't repeat known dead ends (skill: /experience)
3. git status                     # what changed, what's uncommitted
4. git log --oneline -5           # where we are in history
5. Load only the relevant slice   # use the Context router below — read the required minimum + task-type docs
6. Read the relevant plan         # MASTER_PLAN.md, PROJECT_STRUCTURE_EXTERNAL_MAP.md
7. If you changed any template or the narrative → REBUILD: node tools/build-framework.mjs
8. Comment your code/tools; keep docs accurate
9. For bugs/process reflections → bugs/ (follow BUG_FIXING_FRAMEWORK.md)
10. Capture EXPERIENCE.md          # after a meaningful success/failure, append the lesson (skill: /experience)
11. Periodically re-read PHILOSOPHY.md / AGENT_GUIDE.md / STATUS.md and improve them
12. Narrate in the chat what you're doing
```

→ **`STATUS.md`** — главный файл состояния. Обновляй его после каждой значимой задачи.

### Контекст-роутер (ленивая загрузка) — читай только нужный срез

Не читай всё «на всякий случай» — так забивается тот самый контекст, который бережём. Всегда читай
**обязательный минимум**, затем — документы под тип задачи; остальное дочитывай по необходимости.

| Тип задачи | Читать (сверх обязательного минимума) |
|---|---|
| **Обязательный минимум (всегда)** | `STATUS.md` · `PHILOSOPHY.md` · этот роутер · `EXPERIENCE.md` (грепом по тегам) |
| Правка шаблона (payload) | `AGENT_GUIDE.md` (слои) · инвариант пересборки · релевантный `framework/*` |
| Баг | `BUG_FIXING_FRAMEWORK.md` · `bugs/<этот>` · карта (blast radius) |
| Идея/фича | `ideas/<эта>` · `MASTER_PLAN.md` · релевантный `plans/<этот>` |
| Развёртывание/распаковка | `KAIF.md` §8 · манифест распаковщика |

### Опыт — `EXPERIENCE.md`

Растущий греп-дружелюбный журнал уроков (вынесенная память о том, что работает, а что нет). **Вспоминай**
релевантные записи перед задачей (грепом по тегам); **фиксируй** короткий урок после значимого успеха/провала
— в циклах делай и то, и другое без напоминаний. Навык `/experience`. Граница: `bugs/` = по документу на
дефект; `EXPERIENCE.md` = короткие межзадачные уроки уровня подхода (включая успехи). Тегом `DONE` не
помечается. Перед правкой кода — сверься с `PROJECT_ARCHITECTURE_INTERNAL_MAP.md` и оцени blast radius.

---

## Идентичность проекта (КАНОН)

| Поле | Значение |
|-------|-------|
| **Название / бренд** | **Krinik AI Framework (KAIF)** · рус. «Криник АИ Фреймворк (КАИФ)» |
| **Репозиторий GitHub** | https://github.com/MikalaiKryvusha/KAIF |
| **Локальная папка проекта** | `d:\work\ai_sandbox\KAIF` (Windows; с 2026-07-16, ранее — macOS `/Users/kryvusha/ai_sandbox/kriniks_ai_agent_framework`) |
| **Автор / владелец** | Mikalai Kryvusha aka **KOT KRINIK** · Николай Кривуша aka Кот Криник |
| **Лицензия** | MIT |
| **Языки** | Английский (основной) + русский (переводная копия) |

---

## Цель проекта

Дистиллировать рабочий фреймворк для AI-агента, родившийся в совместной работе Криника и Claude, в **универсальный,
самораспаковывающийся фреймворк**, который любой разработчик может встроить в любой программный проект,
чтобы превратить своего AI-агента для кодинга в дисциплинированного, автономного, устойчивого к потере
контекста напарника. Главный артефакт — `KAIF.md`: один документ, который одновременно описывает
фреймворк и распаковывает его. Полное видение: `GOAL.md`.

---

## Архитектура — карта репозитория

```
KAIF/
├── KAIF.md                          ← ⭐ GENERATED self-extracting core (EN; unpacks into any language)
├── README.md / README.pdf           ← EN (primary) + RU front door (+ rendered copy, gitignored)
├── LICENSE                          ← MIT
├── version.json                     ← { major, minor, released, origin, build } — version = major.minor
│
│  ── KEY DOCS (root; dogfooding wrapper = the framework applied to THIS project) ──
├── KAIF_FRAMEWORK.md                ← high-level "KAIF, deployed here" (post-injection doc)
├── AGENT_GUIDE.md  PHILOSOPHY.md  BUG_FIXING_FRAMEWORK.md  STATUS.md
├── GOAL.md                          ← the vision (owner-filled)
├── MASTER_PLAN.md                   ← the phased roadmap from state → GOAL
├── PROJECT_STRUCTURE_EXTERNAL_MAP.md   ← external map (dirs/files/links)
├── PROJECT_ARCHITECTURE_INTERNAL_MAP.md ← internal map (abstractions & interactions)
│
│  ── KNOWLEDGE DIRECTORIES (each has its own README.md) ──
├── plans/  ideas/  bugs/  researches/  interviews/  homeworks/
├── .claude/skills/                  ← this project's own skill instance (placeholders filled)
├── .kaif/kaif.json  CLAUDE.md       ← deploy marker · auto-loaded context → AGENT_GUIDE.md
│
│  ── THE PAYLOAD (canonical universal templates → generate KAIF.md) ──
├── framework/
│   ├── _intro.md                    ← narrative spine of KAIF.md (with {{EMBED}} markers)
│   ├── AGENT_GUIDE.md PHILOSOPHY.md BUG_FIXING_FRAMEWORK.md STATUS.md GOAL.md MASTER_PLAN.md
│   ├── PROJECT_STRUCTURE_EXTERNAL_MAP.md  PROJECT_ARCHITECTURE_INTERNAL_MAP.md  KAIF_FRAMEWORK.md
│   ├── readmes/<dir>.md             ← the six directory-README templates
│   ├── skills/<name>/SKILL.md       ← the 21 skill templates
│   ├── kaif-unpack.mjs              ← the mechanical unpacker (embedded into KAIF.md as a FILE: block)
│   ├── spheres/  adapters/          ← sphere term libraries · agent-system adapters (Zoo Code = priority #1)
│
└── tools/  (build-framework.mjs · check-framework.mjs · readme-pdf.mjs · commit.mjs · kaif.mjs)
```

**ПРАВИЛО:** `framework/` — источник истины для полезной нагрузки; `KAIF.md` генерируется из него.

**Языки — две аудитории, два языка:**
- **Публичная полезная нагрузка** (`framework/`, `KAIF.md`) — **единственный** источник, на
  **английском** (язык сообщества). Многоязычность — при распаковке: агент разворачивает ядро в
  запрошенный язык (отдельных переводов ядра не держим). Русская половина README — для читателей-людей.
- **Локальная обвязка для dogfooding** (этот `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`,
  `BUG_FIXING_FRAMEWORK.md`, `GOAL.md`, `MASTER_PLAN.md`, карты, `KAIF_FRAMEWORK.md`, `CLAUDE.md`,
  `.claude/skills/`, `plans/`, `ideas/`, `bugs/`, `researches/`, `interviews/`, `homeworks/`) ведётся на
  **русском** — рабочем языке владельца. Корневые универсальные файлы —
  русские переводы шаблонов из `framework/` (с заполненными плейсхолдерами). Держи их *содержание*
  синхронным с английской полезной нагрузкой, даже если язык у них разный.

Подробная карта: `PROJECT_STRUCTURE_EXTERNAL_MAP.md`.

---

## Сборка (регенерация артефактов)

```bash
node tools/build-framework.mjs     # regenerate KAIF.md from framework/_intro.md + framework/*
node tools/readme-pdf.mjs          # regenerate README.pdf from README.md
```

> **Никогда не правь `KAIF.md` вручную.** Правь `framework/_intro.md` (повествование) или шаблоны
> `framework/*`, затем заново запусти `build-framework.mjs`. Сборка и есть «тест»: она должна пройти
> успешно, а встроенные блоки — оставаться сбалансированными.

## «Тестирование» этого проекта

Здесь нет runtime-приложения. Верификация = (1) `build-framework.mjs` отрабатывает чисто; (2) встроенные
блоки `FILE:` в `KAIF.md` сбалансированы и полны (динамический подсчёт: 9 ключевых документов + 6 README + 21 навык + 1 распаковщик = 37); (3) ссылки на
файлы/навыки/пути в документах разрешаются; (4) английский и русский README остаются синхронными; (5) PDF
рендерится.

---

## Git-процесс

Работаем только в `main`, без feature-веток (простой дефолт, который рекомендует этот фреймворк).
Коммить инкрементально и часто. Чтобы откатить — используй историю git (`git revert`,
`git checkout <hash> -- file`).

## Коммиты

Стиль: `feat:` / `fix:` / `docs:` / `refactor:` / `ci:` + одна строка. Каждое сообщение завершай строкой:
```
Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
```
`node tools/commit.mjs "<msg>"` инкрементирует `version.json.build`, коммитит и пушит.

## Push / аутентификация в GitHub

Remote по HTTPS. `gh` аутентифицирован (аккаунт `MikalaiKryvusha`). Если прямой `git push` падает с
`could not read Username` в неинтерактивной оболочке, один раз выполни `gh auth setup-git` (регистрирует
`gh` как git credential helper). При `non-fast-forward` — `git pull --rebase`, затем повтори.

---

## Инструменты

| Команда | Что делает |
|---------|--------------|
| `node tools/build-framework.mjs` | Регенерирует `KAIF.md` из `framework/`. |
| `node tools/readme-pdf.mjs` | Рендерит `README.md` → `README.pdf` (нужен `md-to-pdf`; `npm i` в `tools/`). |
| `node tools/commit.mjs "<msg>"` | Инкрементирует номер сборки, коммитит, пушит. |

---

## Беклог и тег DONE

В закрытые файлы `bugs/` и `ideas/` после их номера вставляется `DONE` (`git mv 03_x.md
03_DONE_x.md`) плюс добавляется секция статуса. Справочные документы в `plans/` тегом не помечаются.
Навыки: `/check-backlog` (ревизия), `/report-bug` (завести дефект/проблему процесса), `/propose-idea`
(предложить улучшение фреймворка — нужно одобрение владельца).

---

## Решения, которые агент НЕ должен принимать в одиночку — интервью

Видение продукта принадлежит владельцу. Бренд, объём, форма фреймворка, что относится к v1, а что — позже:
всё это проходит через `/interview` (`interviews/interview_NNN_*.md`), а не через автономные догадки. Всё,
что дёшево откатить, — решай сам и докладывай.

---

## Стиль кода и документации

- Проза этого фреймворка и есть его продукт — держи её ясной, конкретной и согласованной. Английский —
  основной; русская копия зеркалит его.
- Комментируй инструменты (`tools/*.mjs`) — что делает каждый блок и зачем.
- Меняя шаблон, помни про два слоя (полезная нагрузка vs. обвязка) и про шаг пересборки.
- Никаких магических значений в инструментах — только именованные константы.

---

## Заметки от владельца

- Фреймворк должен оставаться **универсальным** — абстрагируйся от исходного проекта и от автора. Исходный
  проект — лишь исток и может приводиться как пример, но фреймворк применим к любому проекту.
- Сохраняй реальное свойство **самораспаковки**: всё необходимое для развёртывания должно жить внутри
  `KAIF.md`.
- Поддерживай **два языка**: английский (основной) и русский (переводная копия). Держи их синхронными.
- Этот проект обёрнут сам собой — но развёртывание в пользовательские проекты управляется ТОЛЬКО
  `KAIF.md`.
