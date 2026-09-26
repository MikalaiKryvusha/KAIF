# Bug 124 — Проба переписала личность git репозитория: 31 коммит ушёл в origin под «probe <probe@example.invalid>»

**Status:** 🔧 фикс 2026-09-26 03:12 +03:00 — личность восстановлена, проба чинится, страж коммита стоит; история в origin — решение владельца (ниже)
**Severity:** S1 — задета достоверность авторства истории проекта (решение владельца №54: «по `git log` видно, кто что делал»);
31 коммит уже в origin.
**Version/build:** KAIF 2.8 (открыта), HEAD `193bff1`; агентская система — Claude Code (расширение VS Code), модель — Claude Opus 5.5.
**When/context:** сессия 74, ночной цикл; найдено повторным судом эпика UP (чистый экземпляр) ≈ 2026-09-26 02:55 +03:00 как находка ВНЕ
предмета суда.
**Fix accepted when (observable):**
- Ситуация. Проба или свод создаёт связанный worktree этого репозитория и коммитит в нём.
- Действие. Агент коммитит в самом репозитории через `node tools/commit.mjs`.
- Результат. Коммит подписан личностью владельца; тестовая личность до origin не доходит — коммит отказан до поднятия номера сборки.
- Проверка. `git var GIT_AUTHOR_IDENT` → «Mikalai Kryvusha <kotkrinik@yandex.ru>»; `node tools/sandbox/probes/commit-1d-leak-run.mjs` → ✅,
  а `git config --local --list | grep -c "^user\."` после неё → `0`; `node tools/commit.mjs --selftest` → ✅ (четыре случая преполёта 0).

## Symptom

`git log --format='%an' 7bc3266..HEAD` → `31 probe`: все коммиты с 2026-09-25 17:27 (9c85106) по 193bff1 подписаны автором и
коммиттером «probe <probe@example.invalid>» и запушены (`git reflog show refs/remotes/origin/main`). Последний коммит владельца — 7bc3266
(2026-09-25 16:46). Шапка сессии это показывала с самого начала («Git user: probe») — и никто её не прочитал как дефект.

## Repro (deterministic)

`node tools/sandbox/probes/commit-1d-leak-run.mjs` (редакция до фикса): `git worktree add --detach` этого репозитория, затем
`git config user.email probe@example.invalid; git config user.name probe` в worktree — связанный worktree делит `.git/config` с
репозиторием, и запись уходит в ОБЩИЙ конфиг. После пробы `git config --local user.name` в репозитории → `probe`.

## Forensics

- `git config --local --get user.name` → `probe`; `--get user.email` → `probe@example.invalid`; глобально — `Mikalai Kryvusha
  <kotkrinik@yandex.ru>` (память проекта: коммитить именно так).
- Проба `tools/sandbox/probes/commit-1d-leak-run.mjs:31` (редакция VO4, прогон 2026-09-25 17:07 +03:00 — первый «probe»-коммит 17:27).
- `tools/commit.mjs` автора не проверял вовсе (греп по `user.name`, `author`, `GIT_AUTHOR` → 0).

## Root cause

Класс: **тестовая обвязка пишет состояние в РЕАЛЬНЫЙ репозиторий через разделяемый ресурс**. Связанный worktree — не отдельный
репозиторий: конфиг общий; `git config` без `--worktree` пишет в `.git/config` основного дерева. Проба считала worktree песочницей.

## Fix

1. Подмена снята: `git config --local --unset user.name` · `--unset user.email` (личность — глобальная, владельца).
2. Проба 1d несёт личность в ОКРУЖЕНИИ своих вызовов (`GIT_AUTHOR_*` / `GIT_COMMITTER_*`), `git config` в worktree не пишет.
3. **Страж класса — преполёт 0 `tools/commit.mjs`:** коммит, который уйдёт в origin (без `--no-push`), не подписывается личностью
   зарезервированного домена (RFC 2606/6761: `.invalid` · `.example` · `.test` · `.localhost` · `example.com/org/net`); отказ — до
   поднятия номера сборки, с источником подмены (`git config --show-origin`) и командой снятия.

```
@guard commit-identity
THREAT:         a sandbox writes a test identity into the shared git config (a linked worktree, a script) and every later commit goes
                to origin under it — 31 commits did, unnoticed for nine hours
PROVED-AGAINST: `--selftest` — «probe <probe@example.invalid>», «sbx <sbx@test>», «x <x@example.com>» are test identities; the owner's
                and near-miss real domains («examples.com», «testing.io») are not; live — a local `user.email=probe@example.invalid`
                refused the commit (exit 1, version.json unchanged, 2026-09-26 03:00:57)
GAP:            a test identity with a REAL-looking domain passes; an identity that is real but not the owner's passes — the guard
                judges the test-domain class, not «is it the owner»
ON-REAL-PATH:   NOT YET — the path is the next time a sandbox leaks an identity
```

`TWINS: searched "config', 'user." · "git config user." · "worktree add" in tools/ — found 5 other identity writers (doc-header-lint
selftest, revert-guard selftest, probe commit-1c, s14, s29 W1): all in their OWN `git init` repositories (own config) — safe; one other
worktree creator (probe dist-fresh-on-clean-exports) writes no config — safe.`

## Решение владельца, которое нужно

31 коммит в origin подписан «probe». Три пути: переписать историю (force-push — только словом владельца, строка `AUTH:`); добавить
`.mailmap` (история не меняется, `git log` показывает владельца); оставить как есть с записью здесь. Вопрос — в интервью (очередь
владельца), агент историю не трогает.

## Decisions made without the owner

1. `[ИИ]` Снять локальную подмену, а не записать владельца локально: глобальная личность — его, локальная копия была бы второй парой.
2. `[ИИ]` Страж судит класс «тестовый домен», а не «личность = владелец»: второе потребовало бы зашить имя владельца в инструмент
   (личность — владельца, её не решает агент), и отказывало бы соавтору.
3. `[ИИ]` С `--no-push` страж молчит: так ходят пробы в песочнице; коммит в origin без `--no-push` — всегда под стражем.

## Links

`reports/KAIF_AUDIT/2026-09-26_up6b_fixes_judge_brief.md` (суд, нашедший дефект вне предмета) · `tools/commit.mjs` (преполёт 0) ·
`tools/sandbox/probes/commit-1d-leak-run.mjs` · память проекта «KAIF local public development».
