# Bug 129 — Отметка `checkpoint recheck` глотала предупреждения `check`: «check ran green» над шестью неподключёнными хуками

**Status:** 🔧 фикс 2026-10-14 11:07 +03:00 (сессия 79, тем же движением, что заведён) — `recheck` печатает оба потока `check`; страж — случай
`s01` S9 «отметка recheck называет поставленные, но не подключённые хуки» и мутант W9 пробы `hooks-mutants.mjs`; функциональный прогон пути
поля — проба `tools/sandbox/probes/sw-field-route.mjs`. DONE — после первого полевого обновления 2.8 → 2.9, чья отметка `recheck` назвала
неподключённые хуки (или подключила их раньше — тогда строки нет и спрашивать не о чем).
**Severity:** S2 — потерян сигнал: на маршруте старого ядра последнее слово свежего ядра о неподключённых хуках не доходило до агента.
**Version/build:** KAIF 2.9 до фикса (`41c6c7d`); строка печати stdout-only — с 1.x, проявилась с 2.9 (SW2: `check` называет неподключённый хук).
**When/context:** сессия 79, 2026-10-14 10:56 +03:00 — судья эпика SW (`plans/130` SW6, J-SW2), первый прогон пробы пути поля.
**Fixing:** эта сессия, тем же движением, что заведён.
**Fix accepted when (observable):**
- Ситуация. Развёртывание KAIF 2.8 с Claude Code обновлено до 2.9 ядром 2.8; задание старого ядра пункта `wire-hooks` не несёт, хуки не подключены.
- Действие. Агент ставит отметку `node .kaif/kaif-core.mjs checkpoint recheck`.
- Результат. В выводе отметки рядом с «check ran green» стоит строка «⚠ 6 delivered hook(s) not wired … run `node .kaif/kaif-core.mjs wire-hooks`».
- Проверка. `node tools/sandbox/s01-field-fixes.mjs` → «✅ S9 SW2: отметка recheck называет поставленные, но не подключённые хуки»;
  `node tools/sandbox/probes/sw-field-route.mjs` → строки «`checkpoint recheck` before wiring names the delivered hooks that are not wired» — OK.

## Symptom

На маршруте обновления 2.8 → 2.9, который проводит ядро 2.8 (маршрут по умолчанию, EXP-0157), задание пишет уходящее ядро — пункта
`wire-hooks` в нём нет. Свежее ядро говорит о неподключённых хуках в двух местах: строка правил 2.9 в задании и предупреждение `check`.
Отметка `recheck` — шаг задания ЛЮБОЙ версии, его исполняет уже свежее ядро — запускала `check` и печатала: «✔ check ran green (executed by
the checkpoint itself)». О шести неподключённых хуках — ни строки, хотя тот же `check`, запущенный руками, их называет.

## Repro (deterministic)

`KAIF_DIST=<dist сборки 41c6c7d> node tools/sandbox/probes/sw-field-route.mjs` → «BAD fixture: `checkpoint recheck` before wiring names the
delivered hooks that are not wired — exit 0» (и так у каждого из пяти клонов живых развёртываний — прогон 6 отчёта).

## Forensics

```
recheck said: + .gitignore: ignore-first for .kaif/.contour-tmp/, interviews/decisions/*.lock | ✅ manifest satisfied: 104 files + 2 agent
artifacts present | ✔ check ran green (executed by the checkpoint itself) | ✔ recorded: KAIF-UPDATE: recheck done
```
Тот же каталог, `node .kaif/kaif-core.mjs check` → `⚠ 6 delivered hook(s) not wired in .claude/settings.json: …` (stderr, выход 0).

## Root cause

`INTENT: code does` — при выходе 0 печатает только stdout дочернего `check` (`execFileSync(…, { stdio: 'pipe' })` возвращает stdout, stderr
отбрасывается); `the failing check expects` — отметка называет неподключённые хуки; `the spec says` — комментарий в самой отметке «surface
check's warnings too» и `plans/130` SW2: «`check` называет поставленный, но не подключённый хук». Расходится код. `check` пишет все свои
предупреждения через `console.error` — значит, отметка теряла и предупреждения бюджета, и остальные `⚠` того же канала.

## Fix

`framework/installer/KAIF-CORE.mjs`, отметка `recheck`: `spawnSync` вместо `execFileSync`; stdout → stdout, stderr → stderr, выход ≠ 0 —
отказ, как прежде. TWINS: searched `execFileSync(process.execPath, [ … 'check'])` и любые вызовы `check` дочерним процессом в
`framework/` — found 0 other sites (линт закрытия в той же машинерии берёт оба потока через `spawnSync`).

Страж: случай `s01` S9 SW2 (задание обновления несёт пункт `recheck`; копии `s14` несут задание установки — там отметки нет) — красный на
мутанте W9 пробы `hooks-mutants.mjs` (возвращает форму «только stdout») и на сборке v2.8 — и на `41c6c7d` (единственный красный свода;
прогон 18 отчёта, 2026-10-14 12:06:45 → 12:07:05 +03:00 — до него это заявление стояло без наблюдения).

## Decisions made without the owner

1. `[ИИ]` Отметка печатает оба потока как есть, без пересказа: предупреждения `check` — его слова, отметка их не фильтрует.
2. `[ИИ]` Отдельной передачи `wire-hooks` в отметку (по образцу `closing-gates`) не добавлено: на маршруте старого ядра агенту об этом
   говорят строка правил 2.9 в задании и теперь — `check` внутри отметки; третий носитель того же — пара, за которой надо следить.

## Links

`plans/130` SW6 (J-SW2) · `plans/126` критерий 12 · EXP-0157 · отчёт `testcases/reports/2026-10-14_sw-field-route.md`.
