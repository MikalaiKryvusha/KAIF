# Krinik AI Framework (KAIF) — внешняя карта структуры

Внешняя структура *этого* репозитория: что представляет собой каждая часть, как собирается результат и какие
есть два слоя (полезная нагрузка против dogfooding-обвязки). Спутник — `PROJECT_ARCHITECTURE_INTERNAL_MAP.md`
(внутренняя логическая архитектура). Держите документ в синхроне с реальным деревом.

---

## Дерево файлов

```
KAIF/
│
│  ── FRONT DOOR ──
├── README.md                              # EN (primary) + RU
├── README.pdf                             # rendered README (generated; gitignored)
├── LICENSE                                # MIT
├── version.json                           # { name, major, minor, released, origin, build } → версия = major.minor
├── .gitignore
│
│  ── PAYLOAD (что разворачивается в пользовательские проекты) ──
├── KAIF.md                                # ⭐ GENERATED самораспаковывающееся ядро (EN; распаковывается в любой язык)
├── framework/
│   ├── _intro.md                          # повествовательный стержень KAIF.md ({{VERSION}}, {{EMBED:…}}, {{EMBED_SKILLS}})
│   ├── AGENT_GUIDE.md                      # шаблон руководящего документа (generic, <PLACEHOLDERS>)
│   ├── PHILOSOPHY.md BUG_FIXING_FRAMEWORK.md STATUS.md   # шаблоны руководящих документов
│   ├── GOAL.md MASTER_PLAN.md              # шаблоны ключевых документов
│   ├── PROJECT_STRUCTURE_EXTERNAL_MAP.md   # шаблон внешней карты
│   ├── PROJECT_ARCHITECTURE_INTERNAL_MAP.md# шаблон внутренней карты
│   ├── KAIF_FRAMEWORK.md                   # шаблон пост-инжекционного документа
│   ├── readmes/<dir>.md                    # 6 шаблонов README директорий
│   ├── skills/<name>/SKILL.md              # 18 шаблонов навыков (generic, плейсхолдеры команд)
│   ├── spheres/*                           # библиотеки терминов по сферам (+ _index, _template)
│   └── adapters/*                          # адаптеры под агентские системы (+ _index, _template)
│
│  ── TOOLS ──
├── tools/
│   ├── build-framework.mjs                 # framework/ → KAIF.md (+ самопроверка)
│   ├── check-framework.mjs                 # валидатор KAIF.md (npm test / kaif:check)
│   ├── readme-pdf.mjs                       # README.md → README.pdf
│   ├── commit.mjs                           # bump build, commit, push
│   └── kaif.mjs                             # ручки жизненного цикла (npm run kaif:*)
│
│  ── DOGFOODING WRAPPER (фреймворк, применённый к ЭТОМУ проекту) ──
├── KAIF_FRAMEWORK.md                       # «KAIF, развёрнутый здесь»
├── AGENT_GUIDE.md PHILOSOPHY.md BUG_FIXING_FRAMEWORK.md STATUS.md   # руководящие документы (RU)
├── EXPERIENCE.md                           # накопленный опыт агента (греп-дружелив; навык /experience)
├── GOAL.md                                 # видение (заполняет владелец)
├── MASTER_PLAN.md                          # пошаговый генплан от состояния к GOAL
├── PROJECT_STRUCTURE_EXTERNAL_MAP.md       # (этот файл)
├── PROJECT_ARCHITECTURE_INTERNAL_MAP.md    # внутренняя карта
├── CLAUDE.md                               # авто-загружаемый контекст → указывает на AGENT_GUIDE.md
├── .kaif/kaif.json                         # маркер развёртывания
├── .claude/skills/<name>/SKILL.md          # экземпляр навыков этого проекта (плейсхолдеры заполнены)
├── plans/       (README + NN_*.md + kaif_implementation_plan.md)   # пошаговые планы
├── ideas/       (README + NN_*.md)         # идеи/предложения (в т.ч. исторические 01–05)
├── bugs/        (README + NN_*.md)         # дефекты
├── researches/  (README + NN_*.md)         # конспекты исследований
├── interviews/  (README + interview_NNN_*.md)  # решения уровня владельца
└── homeworks/   (README + NN_*.md)         # задания человеку
```

---

## Сборка (поток данных)

```
framework/_intro.md    ──┐
framework/<KEY DOCS>.md   │
framework/readmes/*.md    │   tools/build-framework.mjs        tools/check-framework.mjs
framework/skills/**       ├──────────────────────────────▶  KAIF.md  ──валидатор──▶  ✅/❌
                          │   (подставляет {{VERSION}},        (сбалансированные
                        ──┘    встраивает FILE-блоки)           FILE-блоки, нет {{…}})

README.md  ──  tools/readme-pdf.mjs  ──▶  README.pdf
```

- `build-framework.mjs` оборачивает каждый встраиваемый шаблон в **ограждение из 6 обратных кавычек** и
  помечает `> **FILE: \`<dest>\`**`, чтобы распаковывающий агент точно знал, какой файл создать.
- Число встроенных `FILE:`-блоков считается динамически: ключевые доки + README директорий + навыки.
- Версия в документах и именах релизов — **две цифры** `major.minor`; дата релиза — в описании релиза.

---

## Два слоя (не путайте их)

1. **Полезная нагрузка** = `framework/` (исходник) → `KAIF.md` (сгенерировано). Именно это разворачивается на
   стороне.
2. **Обвязка** = корневые ключевые документы + `.claude/skills/` + `plans/`/`ideas/`/`bugs/`/`researches/`/
   `interviews/`/`homeworks/` + `CLAUDE.md`. Это фреймворк, применённый к *этому* проекту.

Универсальные файлы (`PHILOSOPHY.md`, `BUG_FIXING_FRAMEWORK.md`, навыки) зеркалят друг друга между слоями —
кроме заполненных плейсхолдеров команд в обвязке. **Разделение по языку:** полезная нагрузка — на
**английском**; обвязка — на **русском**. Редактируйте полезную нагрузку в `framework/`, держите содержимое
обвязки в синхроне и заново собирайте.

---

## Где что лежит (быстрый поиск)

| Хочу изменить… | Редактирую… | Затем… |
|------------------|-------|-------|
| Повествование/текст ядра | `framework/_intro.md` | `node tools/build-framework.mjs` |
| Шаблон ключевого документа | `framework/<DOC>.md` (+ корневая копия, если универсальный) | пересобрать |
| Шаблон README директории | `framework/readmes/<dir>.md` | пересобрать |
| Навык (как шаблон) | `framework/skills/<name>/SKILL.md` (+ копия `.claude/skills/<name>`) | пересобрать |
| Дорожную карту / решения | `MASTER_PLAN.md` | — |
| Видение | `GOAL.md` | (при смене — `/revision`) |
| Текущее состояние проекта | `STATUS.md` | — |
| README | `README.md` (и EN, и RU) | `node tools/readme-pdf.mjs` |
