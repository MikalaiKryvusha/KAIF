# Krinik AI Framework (KAIF) — внешняя карта структуры

Внешняя структура *этого* репозитория: что представляет собой каждая часть, как собирается результат и какие
есть два слоя (полезная нагрузка против dogfooding-обвязки). Спутник — `PROJECT_ARCHITECTURE_INTERNAL_MAP.md`
(внутренняя логическая архитектура). Держите документ в синхроне с реальным деревом.

> Числовые счётчики (документы/навыки/блоки/модули) в этом документе НЕ дублируются прозой — их печатает
> сама сборка (`node tools/build-framework.mjs`); класс «протухший счётчик» закрыт в `bugs/09`.

---

## Дерево файлов

```
KAIF/
│
│  ── FRONT DOOR ──
├── README.md                              # EN (primary) + RU
├── README.pdf                             # rendered README (generated, но КОММИТИТСЯ — решение владельца)
├── assets/                                # СГЕНЕРИРОВАННЫЕ схемы README (3 × light/dark × EN/RU), из build-diagrams.mjs
│                                          # + промо-материалы владельца (постеры, обложки) — коммитятся,
│                                          # но ПОТРЕБИТЕЛЯМ НЕ ПОСТАВЛЯЮТСЯ (слово владельца 2026-08-09):
│                                          # поставку задаёт framework/ → KAIF.md + dist/, и assets/ в неё
│                                          # не входит по построению — встраиваются только ключевые доки,
│                                          # README директорий, навыки и распаковщик (счёт стережёт check-framework)
├── LICENSE                                # MIT
├── version.json                           # { name, major, minor, codename, released, origin, build } → версия = major.minor
├── .gitignore
│
│  ── PAYLOAD (что разворачивается в пользовательские проекты) ──
├── KAIF.md                                # ⭐ GENERATED ТОНКАЯ точка входа (бутстрап + встроенный загрузчик)
├── framework/
│   ├── _intro.md                          # повествовательный стержень полного ядра ({{VERSION}}, {{SKILL_COUNT}}, {{EMBED:…}}, {{EMBED_SKILLS}})
│   ├── AGENT_GUIDE.md PHILOSOPHY.md BUG_FIXING_FRAMEWORK.md TESTING_FRAMEWORK.md REQUIREMENTS_FRAMEWORK.md   # шаблоны руководящих документов
│   ├── STATUS.md PROJECT_HISTORY.md EXPERIENCE.md GOAL.md MASTER_PLAN.md           # шаблоны состояния/летописи/опыта/видения/плана
│   ├── PROJECT_STRUCTURE_EXTERNAL_MAP.md PROJECT_ARCHITECTURE_INTERNAL_MAP.md      # шаблоны карт
│   ├── KAIF_FRAMEWORK.md                  # шаблон пост-инжекционного документа
│   ├── KAIF_REFERENCE.md                  # пояснительная записка (14-й ключевой документ; dest → .kaif/)
│   ├── readmes/<dir>.md                   # 7 шаблонов README директорий
│   ├── skills/<name>/SKILL.md             # шаблоны навыков (число печатает сборка; generic, плейсхолдеры команд)
│   ├── installer/                         # KAIF-CORE.mjs (машинерия установки/обновления) · KAIF-LOADER.mjs · _thin-intro.md
│   ├── templates/languages/<lang>/        # 9 языковых пакетов: owner-доки + skill-triggers.json (алиасы)
│   ├── tools/*.mjs                        # опциональные модули поставки (kaif-provenance, kaif-canon-lint, kaif-requirements-lint, kaif-guard-lint → .kaif/tools/)
│   ├── hooks/*                            # опциональный модуль refresh-hooks → .kaif/hooks/ (3 скрипта + образец конфига + README; эпик O)
│   ├── kaif-unpack.mjs                    # механический распаковщик (встраивается FILE:-блоком)
│   ├── module-classes.json                # ручные оверрайды классов модулей (классы иначе вычисляются)
│   ├── spheres/*                          # библиотеки терминов по сферам (+ _index, _template)
│   └── adapters/*                         # адаптеры под агентские системы (+ _index, _template; Zoo Code — приоритет №1)
│
│  ── DIST (генерируется сборкой; артефакты релиза) ──
├── dist/
│   ├── KAIF.md                            # тонкая точка входа (копия корневой)
│   ├── KAIF-CORE.mjs                      # машинерия (загружается загрузчиком; живёт как .kaif/kaif-core.mjs)
│   ├── KAIF-CORE-BUNDLE.md                # ПОЛНЫЙ комплект поставки FILE:-блоками + мета-блок
│   ├── kaif-manifest.json                 # версия · codename · sha256-пины · роли ассетов
│   ├── KAIF-FULL.md                       # оффлайн-фолбэк (классическое полное ядро; подмножество)
│   └── kaif-module-map.json               # карта модулей: сигнатурные якоря · классы · sha (эпик №1 2.0)
│
│  ── TOOLS ──
├── tools/
│   ├── build-framework.mjs                # framework/ → KAIF.md + dist/ (в конце сам исполняет check-framework)
│   ├── check-framework.mjs                # валидатор (блоки/маркеры/стражи/карта модулей пересплитом/пин ядро==сборка)
│   ├── module-map-lib.mjs                 # одна резка/классификация модулей на сборщик и валидатор
│   ├── sandbox-suite.mjs                  # ПОСТОЯННЫЙ полигон (npm run test:core): гоняет tools/sandbox/s01–s14
│   ├── sandbox/s01…s15*.mjs               # своды полигона (установки/update/расписки/anon-легаси/provenance/canon-lint/перевод/лица L2/CLI L3)
│   ├── build-diagrams.mjs                 # → assets/*.svg (схемы README; гейт ширины текста; счётчик SKILLS вычисляется)
│   ├── readme-pdf.mjs                     # README.md → README.pdf
│   ├── commit.mjs                         # bump build, commit, push
│   └── kaif.mjs                           # ручки жизненного цикла (npm run kaif:*)
│
│  ── DOGFOODING WRAPPER (фреймворк, применённый к ЭТОМУ проекту) ──
├── KAIF_FRAMEWORK.md                      # «KAIF, развёрнутый здесь» (+ исключения истока)
├── KAIF_REFERENCE.md                      # ⭐ СГЕНЕРИРОВАННАЯ копия framework/KAIF_REFERENCE.md (страж в check; правь источник)
├── AGENT_GUIDE.md PHILOSOPHY.md BUG_FIXING_FRAMEWORK.md TESTING_FRAMEWORK.md REQUIREMENTS_FRAMEWORK.md STATUS.md   # руководящие документы (RU)
├── PROJECT_HISTORY.md                     # летопись (append-only; вне /resume — археология по потребности; 2.1 эпик H)
├── EXPERIENCE.md                          # накопленный опыт агента (греп-дружелюбен; навык /experience)
├── GOAL.md                                # видение (заполняет владелец)
├── MASTER_PLAN.md                         # пошаговый генплан от состояния к GOAL (+ журнал решений владельца)
├── PROJECT_STRUCTURE_EXTERNAL_MAP.md      # (этот файл)
├── PROJECT_ARCHITECTURE_INTERNAL_MAP.md   # внутренняя карта
├── CLAUDE.md                              # авто-загружаемый контекст → указывает на AGENT_GUIDE.md
├── .kaif/kaif.json                        # маркер развёртывания (схема — Reference §12.1)
├── .claude/skills/<name>/SKILL.md         # экземпляр навыков этого проекта (плейсхолдеры заполнены)
├── plans/       (README + NN_*.md)        # пошаговые планы
├── ideas/       (README + NN_*.md)        # идеи/предложения
├── bugs/        (README + NN_*.md)        # дефекты (закрытые — с тегом DONE в имени)
├── researches/  (README + NN_*.md)        # конспекты исследований
├── interviews/  (README + interview_NNN_*.md)  # решения уровня владельца
├── homeworks/   (README + NN_*.md)        # задания человеку
└── reports/     (README + NN_*.md)        # отчёты агента (KAIF_UPDATES/ · KAIF_AUDIT/)
```

---

## Сборка (поток данных)

```
framework/_intro.md ──┐
framework/<KEY DOCS>  │                        ┌─▶ KAIF.md (корень, тонкий) и dist/KAIF.md
framework/readmes/*   │  tools/build-framework │─▶ dist/KAIF-CORE.mjs      (из framework/installer/)
framework/skills/**   ├──────────────────────▶─┤─▶ dist/KAIF-CORE-BUNDLE.md (весь комплект FILE:-блоками)
framework/installer/* │      .mjs              │─▶ dist/kaif-manifest.json  (sha256-пины + роли ассетов)
framework/tools/*     │                        │─▶ dist/KAIF-FULL.md        (оффлайн-фолбэк)
framework/templates/**│                        └─▶ dist/kaif-module-map.json (сигнатурные якоря/классы/sha)
                    ──┘                                     │
                                 (сборка в конце САМА исполняет tools/check-framework.mjs:
                                  блоки сбалансированы · нет {{маркеров}} · стражи нотации/бренда ·
                                  карта модулей пересплитом · пин сплиттера ядро==сборка · sha свежи)

npm run test:core  →  tools/sandbox-suite.mjs  →  s01–s15 в OS-temp  →  проверки полигона (число печатает прогон)
tools/build-diagrams.mjs  ──▶  assets/*.svg  ──▶  README.md (через <picture>)
README.md  ──  tools/readme-pdf.mjs  ──▶  README.pdf
```

- `build-framework.mjs` оборачивает каждый встраиваемый шаблон в **ограждение из 6 обратных кавычек** и
  помечает `> **FILE: \`<dest>\`**`, чтобы распаковывающий агент точно знал, какой файл создать.
- Число встроенных `FILE:`-блоков считается динамически: ключевые доки + README директорий + навыки +
  распаковщик; актуальные цифры — в выводе сборки.
- Версия в документах и именах релизов — **две цифры** `major.minor`; кодовое имя — в `version.json`;
  дата релиза — в описании релиза.

---

## Два слоя (не путайте их)

1. **Полезная нагрузка** = `framework/` (исходник) → корневой `KAIF.md` + `dist/` (сгенерировано). Именно
   это разворачивается на стороне.
2. **Обвязка** = корневые ключевые документы + `.claude/skills/` + `plans/`/`ideas/`/`bugs/`/`researches/`/
   `interviews/`/`homeworks/`/`reports/` + `CLAUDE.md` + `.kaif/kaif.json`. Это фреймворк, применённый к *этому* проекту.

Универсальные файлы (`PHILOSOPHY.md`, `BUG_FIXING_FRAMEWORK.md`, `TESTING_FRAMEWORK.md`,
`REQUIREMENTS_FRAMEWORK.md`, навыки) зеркалят
друг друга между слоями — кроме заполненных плейсхолдеров команд в обвязке; lifecycle- и fable-навыки в
обвязке — вендоренные EN-копии со staleness-шапками (языковая политика 1.6: agent-facing — EN).
**Разделение по языку:** полезная нагрузка — на **английском**; обвязка — на **русском**. Редактируйте
полезную нагрузку в `framework/`, держите содержимое обвязки в синхроне и заново собирайте.

---

## Где что лежит (быстрый поиск)

| Хочу изменить… | Редактирую… | Затем… |
|------------------|-------|-------|
| Повествование/текст ядра | `framework/_intro.md` | `node tools/build-framework.mjs` |
| Шаблон ключевого документа | `framework/<DOC>.md` (+ корневая копия, если универсальный) | пересобрать |
| Пояснительную записку | `framework/KAIF_REFERENCE.md` | пересобрать |
| Машинерию установки/обновления | `framework/installer/KAIF-CORE.mjs` | пересобрать + `npm run test:core` |
| Опциональный tool-модуль | `framework/tools/*.mjs` | пересобрать + `npm run test:core` (s05/s06) |
| Хук освежения контекста | `framework/hooks/*` | пересобрать + `npm run test:core` (s14) |
| Языковой пакет | `framework/templates/languages/<lang>/` | пересобрать |
| Шаблон README директории | `framework/readmes/<dir>.md` | пересобрать |
| Навык (как шаблон) | `framework/skills/<name>/SKILL.md` (+ копия `.claude/skills/<name>`) | пересобрать |
| Дорожную карту / решения | `MASTER_PLAN.md` | — |
| Видение | `GOAL.md` | (при смене — `/revision`) |
| Текущее состояние проекта | `STATUS.md` | — |
| README | `README.md` (и EN, и RU) | `node tools/readme-pdf.mjs` |
| Схемы README | `tools/build-diagrams.mjs` (НЕ сами SVG) | `node tools/build-diagrams.mjs` + PDF |
