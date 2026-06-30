# Krinik AI Framework (KAIF) — карта проекта

Архитектура *этого* репозитория: что представляет собой каждая часть, как собирается результат и какие есть два
слоя (полезная нагрузка против dogfooding-обвязки). Держите этот документ в синхроне с реальным деревом.

---

## Дерево файлов

```
KAIF/
│
│  ── PAYLOAD (что разворачивается в пользовательские проекты) ──
├── framework/
│   ├── _intro.md                 # narrative spine of FRAMEWORK.md, with {{VERSION}}, {{EMBED:…}}, {{EMBED_SKILLS}}
│   ├── AGENT_GUIDE.md            # guidance-doc template (generic, <PLACEHOLDERS>)
│   ├── PHILOSOPHY.md             # guidance-doc template (universal)
│   ├── BUG_FIXING_FRAMEWORK.md   # guidance-doc template (universal)
│   ├── STATUS.md                 # guidance-doc template (generic)
│   └── skills/<name>/SKILL.md    # the 12 skill templates (generic, command placeholders)
│
├── FRAMEWORK.md                  # ⭐ GENERATED self-extracting core (English; unpacks into any language)
│
│  ── FRONT DOOR ──
├── README.md                     # EN (primary) + RU
├── README.pdf                    # rendered README (generated; gitignored)
├── LICENSE                       # MIT
├── goal.md                       # the original vision (intent source of truth)
├── version.json                  # { major, minor, build }
├── .gitignore
│
│  ── TOOLS ──
├── tools/
│   ├── build-framework.mjs       # framework/ → FRAMEWORK.md
│   ├── readme-pdf.mjs            # README.md → README.pdf
│   ├── commit.mjs               # bump build, commit, push
│   └── package.json             # dev deps (md-to-pdf for the PDF)
│
│  ── DOGFOODING WRAPPER (the framework applied to THIS project) ──
├── AGENT_GUIDE.md                # specialized for developing the framework
├── PHILOSOPHY.md                 # copy of framework/PHILOSOPHY.md (universal)
├── BUG_FIXING_FRAMEWORK.md       # copy of framework/BUG_FIXING_FRAMEWORK.md (universal)
├── STATUS.md                     # specialized: the framework project's live state
├── CLAUDE.md                     # auto-loaded; points the agent at AGENT_GUIDE.md
├── .claude/skills/<name>/SKILL.md# this project's skill instance (placeholders filled)
├── plans/
│   ├── master_plan.md            # this document's sibling: the roadmap
│   ├── project_map.md            # (this file)
│   └── ideas/                    # framework-improvement proposals
├── bugs/                         # defect/process reflections (one md each)
└── interviews/                   # owner-level decisions (interview_NNN_*.md)
```

---

## Сборка (поток данных)

```
framework/_intro.md  ──┐
framework/AGENT_GUIDE.md │
framework/PHILOSOPHY.md  │   tools/build-framework.mjs
framework/BUG_FIXING…md  ├──────────────────────────────▶  FRAMEWORK.md
framework/STATUS.md      │   (replaces {{VERSION}},          (self-extracting core,
framework/skills/**      │    {{EMBED:…}}, {{EMBED_SKILLS}})  16 embedded FILE: blocks)
                       ──┘

README.md  ──  tools/readme-pdf.mjs  ──▶  README.pdf
```

- `build-framework.mjs` оборачивает каждый встраиваемый шаблон в **ограждение из 6 обратных кавычек** (чтобы собственные
  3-кавычные блоки кода в шаблонах остались целыми) и помечает его `> **FILE: \`<dest>\`**`, чтобы распаковывающий агент
  точно знал, какой файл создать.
- Число встроенных блоков должно быть равно **16** = 4 руководящих документа + 12 навыков.

---

## Два слоя (не путайте их)

1. **Полезная нагрузка** = `framework/` (исходник) → `FRAMEWORK.md` (сгенерировано). Именно это разворачивается на стороне.
2. **Обвязка** = корневые `AGENT_GUIDE.md`/`STATUS.md`/`PHILOSOPHY.md`/`BUG_FIXING_FRAMEWORK.md` +
   `.claude/skills/` + `plans/`/`bugs/`/`interviews/` + `CLAUDE.md`. Это фреймворк, применённый к
   *этому* проекту.

Универсальные файлы (`PHILOSOPHY.md`, `BUG_FIXING_FRAMEWORK.md`, навыки) зеркалят друг друга между
слоями — за исключением того, что в обвязке заполнены плейсхолдеры команд. **Разделение по языку:** полезная нагрузка —
на **английском** (сообщество); обвязка — на **русском** (рабочий язык владельца). Поэтому корневые универсальные
файлы — это русские переводы шаблонов из `framework/`. Редактируйте полезную нагрузку в `framework/`, держите
*содержимое* корневой обвязки в синхроне и заново запускайте сборку.

---

## Где что лежит (быстрый поиск)

| Хочу изменить… | Редактирую… | Затем… |
|------------------|-------|-------|
| Повествование/текст ядра | `framework/_intro.md` | `node tools/build-framework.mjs` |
| Шаблон руководящего документа | `framework/<DOC>.md` (+ корневая копия, если универсальный) | пересобрать |
| Навык (как шаблон) | `framework/skills/<name>/SKILL.md` (+ копия `.claude/skills/<name>`) | пересобрать |
| Дорожную карту / решения | `plans/master_plan.md` | — |
| Текущее состояние проекта | `STATUS.md` | — |
| README | `README.md` (и EN, и RU) | `node tools/readme-pdf.mjs` |
