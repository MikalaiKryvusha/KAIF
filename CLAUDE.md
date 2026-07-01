# CLAUDE.md — автоматически загружаемый контекст этого проекта

Этот репозиторий — **Krinik AI Framework (KAIF)**, и он **обёрнут самим фреймворком** (dogfooding).
Перед каждой задачей:

1. Прочитай **`AGENT_GUIDE.md`** — канон работы над этим проектом (учти фрактальную двухслойную
   структуру: *полезная нагрузка* `framework/` + сгенерированный `KAIF.md` vs. эта *обвязка для
   dogfooding*).
2. Прочитай **`STATUS.md`** — текущее состояние и где продолжить.
3. Мысли по **`PHILOSOPHY.md`** (KISS + Оккам). Отлаживай по **`BUG_FIXING_FRAMEWORK.md`**.

Твои повторяемые ритуалы живут в **`.claude/skills/`** (`/resume`, `/pause`, `/autoloop`, `/dayloop`,
`/nightloop`, `/refresh-context`, `/check-backlog`, `/report-bug`, `/bug-research`, `/propose-idea`,
`/interview`, `/release`).

⚠️ **Критическое правило:** самораспаковывающееся ядро `KAIF.md` **генерируется** — никогда не правь
его вручную. Правь `framework/_intro.md` или шаблоны `framework/*`, затем запусти
`node tools/build-framework.mjs`. При развёртывании фреймворка в *другой* проект выводи всё только из
`KAIF.md` — а не из файлов обвязки этого репозитория.
