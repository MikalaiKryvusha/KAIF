# kriniks_ai_agent_framework — руководство для AI-агента

Этот файл AI-агент читает перед каждой задачей. Это **канон** работы над **этим проектом**
— над самим KRINIKS AI Agent Framework.

> 🧠 **ГЛАВНЫЙ ПРИНЦИП — ПРОСТОТА (читай `PHILOSOPHY.md`).** Если что-то занимает много времени — это не
> сложная задача и не баг инструментов: ты ДЕЛАЕШЬ СЛИШКОМ СЛОЖНО, потому что не ПОНЯЛ задачу. KISS +
> бритва Оккама. Застрял → переосмысли и упрости, никогда не наращивай сложность.

> ♻️ **ЭТОТ ПРОЕКТ ФРАКТАЛЕН — читай внимательно.** Этот репозиторий *является фреймворком* И *обёрнут
> фреймворком* (он применяет себя к себе, dogfooding). Поэтому здесь два слоя, и путать их нельзя:
>
> 1. **Полезная нагрузка** — то, что фреймворк разворачивает в других проектах:
>    - `framework/` — канонические универсальные шаблоны (четыре руководящих документа + двенадцать навыков).
>    - `FRAMEWORK.md` — **самораспаковывающееся ядро**, СГЕНЕРИРОВАННОЕ из `framework/` инструментом
>      `tools/build-framework.mjs`. Это единственный источник истины для развёртывания.
> 2. **Обвязка для dogfooding** — фреймворк, применённый к *этому* проекту (то, что ты читаешь, чтобы работать здесь):
>    - этот `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`, `BUG_FIXING_FRAMEWORK.md`,
>      `.claude/skills/`, `plans/`, `bugs/`, `interviews/`.
>
> ⚠️ **Когда кто-то разворачивает фреймворк в СВОЁМ проекте, он использует только `FRAMEWORK.md` — а НЕ
> файлы обвязки этого репозитория.** Не давай обвязке протечь в полезную нагрузку. Если ты улучшаешь навык
> или руководящий документ *как шаблон* — правь его в `framework/` и пересобирай; если ты улучшаешь то, как
> ведётся *этот проект* — правь корневую обвязку. Обычно нужно, чтобы оба слоя двигались вместе — держи их
> согласованными.

---

## Перед каждой задачей — чек-лист

```
1. Read STATUS.md                 # current state of the framework project
2. git status                     # what changed, what's uncommitted
3. git log --oneline -5           # where we are in history
4. Read the relevant plan         # plans/master_plan.md, plans/project_map.md
5. If you changed any template or the narrative → REBUILD: node tools/build-framework.mjs
6. Comment your code/tools; keep docs accurate
7. For bugs/process reflections → bugs/ (follow BUG_FIXING_FRAMEWORK.md)
8. Periodically re-read PHILOSOPHY.md / AGENT_GUIDE.md / STATUS.md and improve them
9. Narrate in the chat what you're doing
```

→ **`STATUS.md`** — главный файл состояния. Обновляй его после каждой значимой задачи.

---

## Идентичность проекта (КАНОН)

| Поле | Значение |
|-------|-------|
| **Название / бренд** | KRINIKS AI Agent Framework (`kriniks_ai_agent_framework`) |
| **Репозиторий GitHub** | https://github.com/MikalaiKryvusha/kriniks_ai_agent_framework |
| **Локальная папка проекта** | `/Users/kryvusha/ai_sandbox/kriniks_ai_agent_framework` |
| **Автор / владелец** | Mikalai Kryvusha aka **KOT KRINIK** · Николай Кривуша aka Кот Криник |
| **Лицензия** | MIT |
| **Языки** | Английский (основной) + русский (переводная копия) |

---

## Цель проекта

Дистиллировать рабочий фреймворк для AI-агента, родившийся в совместной работе Криника и Claude, в **универсальный,
самораспаковывающийся фреймворк**, который любой разработчик может встроить в любой программный проект,
чтобы превратить своего AI-агента для кодинга в дисциплинированного, автономного, устойчивого к потере
контекста напарника. Главный артефакт — `FRAMEWORK.md`: один документ, который одновременно описывает
фреймворк и распаковывает его. Полное видение: `goal.md`.

---

## Архитектура — карта репозитория

```
kriniks_ai_agent_framework/
├── FRAMEWORK.md              ← ⭐ GENERATED self-extracting core (do NOT hand-edit)
├── FRAMEWORK.ru.md           ← Russian translation of the core
├── README.md                 ← EN (primary) + RU, the front door
├── README.pdf                ← rendered README (generated, gitignored)
├── LICENSE                   ← MIT
├── goal.md                   ← the original vision (source of truth for intent)
├── version.json              ← { major, minor, build }
│
├── framework/                ← THE PAYLOAD (canonical universal templates)
│   ├── _intro.md             ←   narrative spine of FRAMEWORK.md (with {{EMBED}} markers)
│   ├── AGENT_GUIDE.md        ←   guidance-doc templates (generic, placeholders)
│   ├── PHILOSOPHY.md
│   ├── BUG_FIXING_FRAMEWORK.md
│   ├── STATUS.md
│   └── skills/<name>/SKILL.md ←  the twelve skill templates
│
├── tools/
│   ├── build-framework.mjs   ←   assembles FRAMEWORK.md from framework/
│   ├── readme-pdf.mjs        ←   renders README.md → README.pdf
│   └── commit.mjs            ←   bump build, commit, push
│
└── (dogfooding wrapper — the framework applied to this project)
    ├── AGENT_GUIDE.md  PHILOSOPHY.md  BUG_FIXING_FRAMEWORK.md  STATUS.md
    ├── .claude/skills/        ←   this project's own skill instance (placeholders filled)
    ├── plans/  (master_plan.md, project_map.md, ideas/)
    ├── bugs/   interviews/
    └── CLAUDE.md              ←   points the agent at this guide
```

**ПРАВИЛО:** `framework/` — источник истины для полезной нагрузки; `FRAMEWORK.md` генерируется из него.

**Языки — две аудитории, два языка:**
- **Публичная полезная нагрузка** (`framework/`, `FRAMEWORK.md`) — на **английском** (язык сообщества),
  с `FRAMEWORK.ru.md` и русской половиной README как русской копией.
- **Локальная обвязка для dogfooding** (этот `AGENT_GUIDE.md`, `STATUS.md`, `PHILOSOPHY.md`,
  `BUG_FIXING_FRAMEWORK.md`, `CLAUDE.md`, `.claude/skills/`, `plans/`, `bugs/`, `interviews/` и любые
  `plans/homework_*.md`) ведётся на **русском** — рабочем языке владельца. Корневые универсальные файлы —
  русские переводы шаблонов из `framework/` (с заполненными плейсхолдерами). Держи их *содержание*
  синхронным с английской полезной нагрузкой, даже если язык у них разный.

Подробная карта: `plans/project_map.md`.

---

## Сборка (регенерация артефактов)

```bash
node tools/build-framework.mjs     # regenerate FRAMEWORK.md from framework/_intro.md + framework/*
node tools/readme-pdf.mjs          # regenerate README.pdf from README.md
```

> **Никогда не правь `FRAMEWORK.md` вручную.** Правь `framework/_intro.md` (повествование) или шаблоны
> `framework/*`, затем заново запусти `build-framework.mjs`. Сборка и есть «тест»: она должна пройти
> успешно, а встроенные блоки — оставаться сбалансированными.

## «Тестирование» этого проекта

Здесь нет runtime-приложения. Верификация = (1) `build-framework.mjs` отрабатывает чисто; (2) встроенные
блоки `FILE:` в `FRAMEWORK.md` сбалансированы и полны (4 документа + 12 навыков = 16); (3) ссылки на
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
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
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
| `node tools/build-framework.mjs` | Регенерирует `FRAMEWORK.md` из `framework/`. |
| `node tools/readme-pdf.mjs` | Рендерит `README.md` → `README.pdf` (нужен `md-to-pdf`; `npm i` в `tools/`). |
| `node tools/commit.mjs "<msg>"` | Инкрементирует номер сборки, коммитит, пушит. |

---

## Беклог и тег DONE

В закрытые файлы `bugs/` и `plans/ideas/` после их номера вставляется `DONE` (`git mv 03_x.md
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
  `FRAMEWORK.md`.
- Поддерживай **два языка**: английский (основной) и русский (переводная копия). Держи их синхронными.
- Этот проект обёрнут сам собой — но развёртывание в пользовательские проекты управляется ТОЛЬКО
  `FRAMEWORK.md`.
