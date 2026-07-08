# CLAUDE.md — автоматически загружаемый контекст этого проекта

Этот репозиторий — **Krinik AI Framework (KAIF)**, и он **обёрнут самим фреймворком** (dogfooding).
Перед каждой задачей:

1. Прочитай **`AGENT_GUIDE.md`** — канон работы над этим проектом (учти фрактальную двухслойную
   структуру: *полезная нагрузка* `framework/` + сгенерированный `KAIF.md` vs. эта *обвязка для
   dogfooding*).
2. Прочитай **`STATUS.md`** — текущее состояние и где продолжить.
3. Мысли по **`PHILOSOPHY.md`** (KISS + Оккам). Отлаживай по **`BUG_FIXING_FRAMEWORK.md`**.
4. Сверься с **`EXPERIENCE.md`** (грепом по тегам задачи) — не повторяй известные тупики; допиши урок
   после значимого успеха/провала (навык `/experience`).

Ключевые документы в корне: `AGENT_GUIDE.md`, `PHILOSOPHY.md`, `BUG_FIXING_FRAMEWORK.md`, `STATUS.md`,
`EXPERIENCE.md`, `GOAL.md`, `MASTER_PLAN.md`, `PROJECT_STRUCTURE_EXTERNAL_MAP.md`,
`PROJECT_ARCHITECTURE_INTERNAL_MAP.md`, `KAIF_FRAMEWORK.md`. Директории знаний (в каждой свой README): `plans/`, `ideas/`, `bugs/`, `researches/`,
`interviews/`, `homeworks/`.

Твои повторяемые ритуалы живут в **`.claude/skills/`** (`/resume`, `/pause`, `/autoloop`, `/dayloop`,
`/nightloop`, `/refresh-context`, `/check-backlog`, `/experience`, `/report-bug`, `/bug-research`,
`/propose-idea`, `/interview`, `/revision`, `/fix-vision`, `/what-next`, `/help-kaif`, `/release` +
жизненный цикл `/kaif-*`).

⚠️ **Критическое правило:** самораспаковывающееся ядро `KAIF.md` **генерируется** — никогда не правь
его вручную. Правь `framework/_intro.md` или шаблоны `framework/*`, затем запусти
`node tools/build-framework.mjs`. При развёртывании фреймворка в *другой* проект выводи всё только из
`KAIF.md` — а не из файлов обвязки этого репозитория.
