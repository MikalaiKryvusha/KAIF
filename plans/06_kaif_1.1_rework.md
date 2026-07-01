# План 06 — Переработка KAIF до версии 1.1 («Структурированный KAIF»)

> Статус: **🔧 в работе**. Источник требований: `plans/ideas/05_structured_KAIF.md` (21 пункт).
> Принцип работы — `PHILOSOPHY.md` (KISS + Оккам). Канон — `AGENT_GUIDE.md`.

## Суть

Переработать KAIF `1.0` → `1.1`: перейти на семвер `x.y`, переименовать ядро в `KAIF.md`, ввести новую
структуру ключевых документов и директорий, разбить распаковку на строгие этапы (в т.ч. для слабых
ИИ-систем), расширить `PHILOSOPHY.md` и интервью, добавить навык `/revision`, ужесточить `/kaif-remove`,
переработать README.

## Фрактальная дисциплина (два слоя — движем оба)

Каждое изменение затрагивает до двух слоёв (см. `AGENT_GUIDE.md`):

1. **Полезная нагрузка** — `framework/*` (EN-шаблоны) → `KAIF.md` (генерируется `tools/build-framework.mjs`).
   Это то, что разворачивается в чужие проекты.
2. **Обвязка для dogfooding** — корневые `AGENT_GUIDE.md`/`STATUS.md`/… + `.claude/skills/` + `plans/` и т.д.
   (RU). Это KAIF, применённый к самому себе.

Правило: правим шаблон в `framework/`, применяем то же к корневой обвязке, затем **пересобираем**
(`node tools/build-framework.mjs`) и проверяем (`npm test`).

## Принятые решения (defaults; дёшево откатить через git)

- **Директории верхнего уровня** (обвязка + шаблон деплоя): `plans/`, `ideas/`, `bugs/`, `researches/`,
  `interviews/`, `homeworks/`. `ideas/` **выносится из** `plans/ideas/` в корень (промоушен). `plans/`
  остаётся для пошаговых детальных планов (как этот файл).
- **DONE-тег** теперь применяется к `bugs/`, `ideas/`, `researches/` (закрываемые), не к справочным
  документам (`MASTER_PLAN.md`, карты, `GOAL.md`) и не к `plans/` справкам.
- **`version.json`**: убираем поле `patch`; версия в коде = `${major}.${minor}`. Поля `released`,
  `origin`, `build` (внутренний счётчик, не отображается) сохраняем.
- **`.SKILLS`** в требовании 12 = навыки Claude в `.claude/skills/`; «трансляция» = адаптеры (§13 ядра).

---

## Фазы работ

### Фаза 1 — Версионирование `x.y`, бамп до 1.1 (треб. 1, 20)
- `version.json`: удалить `patch`, поднять `minor` → 1, `released` = дата релиза 1.1 (проставить при
  релизе), `build` сбросить/оставить.
- `tools/build-framework.mjs` `version()` → `${major}.${minor}`.
- `tools/commit.mjs`: чинит баг — сейчас перезаписывает `version.json`, теряя поля; писать полный объект,
  без `patch`.
- `tools/kaif.mjs` `ver()` → `x.y`; тексты.
- `.kaif/kaif.json`: `version` → `"1.1"`; синхронизировать формат в §11 ядра (пример JSON).
- README (EN+RU): бейдж версии `1.1`; формулировка стемпа версии `vX.Y (дата в описании релиза)`.
- `framework/_intro.md`: строка версии/`released`; §11 (убрать `.PATCH`).

### Фаза 2 — Ядро `FRAMEWORK.md` → `KAIF.md` (треб. 6)
- `git mv FRAMEWORK.md KAIF.md`.
- `tools/build-framework.mjs` — выход `KAIF.md`; `tools/check-framework.mjs` — путь `KAIF.md`.
- Все ссылки: README (EN+RU), `_intro.md`, `AGENT_GUIDE.md` (корень+шаблон), `CLAUDE.md`, `project_map`
  (→ external map), `kaif.mjs`, `package.json` скрипты, навыки (упоминания `KAIF.md`).
- `.gitignore` (если упоминается).

### Фаза 3 — Расширение `PHILOSOPHY.md` (треб. 17)
Добавить 10 принципов (Парето, Мерфи, Best practices, Эйзенхауэр, Хэнлон, DRY, Квадрат Декарта,
Предполагай очевидное, Second Order Thinking, Карма). Оформить как единый связный раздел, сохранив ядро
KISS + Оккам как «прайм-директиву». Правим `framework/PHILOSOPHY.md` (EN) и корневой `PHILOSOPHY.md` (RU).

### Фаза 4 — Новая структура ключевых документов и директорий (треб. 3, 4, 14, 16)
Шаблоны (`framework/`) + обвязка (корень):
- Новые шаблоны `framework/`: `GOAL.md`, `MASTER_PLAN.md`, `PROJECT_STRUCTURE_EXTERNAL_MAP.md`,
  `PROJECT_ARCHITECTURE_INTERNAL_MAP.md`, `KAIF_FRAMEWORK.md`, и README-шаблоны для директорий
  (`framework/dir-readmes/<dir>.md` или встроенные в ядро).
- Обвязка: `git mv goal.md GOAL.md`; `git mv plans/master_plan.md MASTER_PLAN.md`;
  `git mv plans/project_map.md PROJECT_STRUCTURE_EXTERNAL_MAP.md`; создать
  `PROJECT_ARCHITECTURE_INTERNAL_MAP.md`, `KAIF_FRAMEWORK.md`.
- `git mv plans/ideas/ ideas/`; создать `researches/`, `homeworks/`.
- `README.md` в каждой директории (`plans`, `ideas`, `bugs`, `researches`, `interviews`, `homeworks`) —
  суть + правила для владельца и для ИИ-агента.
- Обновить ссылки в `AGENT_GUIDE.md`, `STATUS.md`, `CLAUDE.md`, навыках (пути `plans/ideas/` → `ideas/`,
  `master_plan` → `MASTER_PLAN`, `project_map` → external map, `goal.md` → `GOAL.md`).

### Фаза 5 — Ядро: короткая шапка + этапная распаковка + `KAIF_FRAMEWORK.md` (треб. 7, 8, 9, 10, 11)
- `framework/_intro.md`: сократить «шапку» (не дублировать README), быстро вводить агента в режим
  распаковки.
- Переписать §8 «Unpacking» на строгие этапы: (1) сырая распаковка структуры без чтения проекта;
  (2) поэтапное изучение проекта + ведение `KAIF_DEPLOYMENT_PLAN.md`; (3) поэтапная адаптация.
- Ввести Respectful flow для слабых ИИ-систем (атомарные шаги, возможно много чатов) + быстрый путь для
  сильных (одна команда). Примеры сильных/слабых систем.
- Пост-инжекция: удалить `KAIF.md`, создать `KAIF_FRAMEWORK.md` (+ «Описание от автора», треб. 11).
- Обновить §3 «структура» под новую раскладку, §5 «директории», §10 «плейсхолдеры».

### Фаза 6 — Навыки (треб. 2, 18, 19)
- Новый навык `/revision` (шаблон `framework/skills/revision/` + `.claude/skills/revision/`): из `GOAL.md`
  + текущего состояния → (пере)разработка `MASTER_PLAN.md`.
- `/interview` (шаблон + обвязка): варианты A/B/C/D; A = дистилляция через `PHILOSOPHY.md` + «(Рекомендовано)»;
  D = свой вариант владельца.
- `/kaif-remove` (шаблон + обвязка): обязательный явный NL-вопрос о типе удаления, явный однозначный ответ
  до запуска.
- Обновить `_intro.md` таблицу навыков и `README` (навыков станет 18).

### Фаза 7 — README overhaul (треб. 5, 9, 12, 13, 15)
- Секция с таблицами по каждой директории и ключевому документу (кто пишет/создаёт/отвечает).
- Сильные vs слабые ИИ-системы + Respectful flow (пользовательская инструкция).
- Команда-инициатор: язык владельца + целевая ИИ-система.
- `GOAL.md` в QUICK START (что/зачем/как/куда; можно позже, но лучше заранее).
- Убрать флаги-эмодзи, кроме 🇬🇧; прочие языки — текстом.
- EN + RU половины синхронно.

### Фаза 8 — Инструменты, пересборка, PDF
- Обновить `build-framework.mjs`/`check-framework.mjs` под новые встраиваемые шаблоны и число навыков
  (динамический подсчёт уже есть — проверить порядок и включение новых доков/README).
- `node tools/build-framework.mjs` (собрать + самопроверка); `npm test`.
- `node tools/readme-pdf.mjs` (регенерация PDF).
- Обновить `PROJECT_STRUCTURE_EXTERNAL_MAP.md` (число блоков, дерево).

### Фаза 9 — Финал
- Обновить `STATUS.md`; `KAIF_FRAMEWORK.md` (для этого репо).
- Пометить идею 05 и этот план по факту завершения.
- Коммиты инкрементально по фазам; релиз 1.1 через `/release` (с подтверждением владельца).

## Верификация (по `AGENT_GUIDE.md`)
1. `node tools/build-framework.mjs` проходит чисто; самопроверка ОК.
2. Встроенные `FILE:`-блоки сбалансированы и полны (динамический подсчёт).
3. Ссылки на файлы/навыки/пути разрешаются; нет `FRAMEWORK.md`/`goal.md`/`master_plan.md`/`project_map.md`
   «висячих» упоминаний.
4. EN и RU README синхронны; PDF рендерится.
5. Нет флагов-эмодзи, кроме 🇬🇧.
