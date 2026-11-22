# Bug 146 — Kimi: хуки KAIF не видят файл записи — Kimi называет его `path`, а не `file_path`

**Status:** ✅ DONE 2026-11-22 09:53 +03:00 — в новой Kimi VS Code сессии `session_6d66c1d4…` запись `.mjs` создала долг, `Stop` открыл продолжение (`system_trigger / stop_hook`), файл запущен, `test debt: none`; отчёт `testcases/reports/2026-11-22_kimi-stop-alive.md` · **Severity:** S2 (потерян прогон: проверка «написал код — запусти его» под Kimi молча не работала) ·
**Version/build:** KAIF 2.10 WIP `8ef671e` + фикс; приёмка на `1c2001c`, Kimi Code VS Code 0.9.0 · **When/context:** дефект 2026-11-21 17:50 +03:00, живой прогон KA9 (сессия 104); закрытие 2026-11-22 09:53 +03:00
**Fixing:** исполнено и проверено живьём.

## Goal vector / done when

**Type:** Achieve. Хуки KAIF читают файл записи Kimi так же, как записи Claude Code.
**Fix accepted when:** `node tools/sandbox/probes/bugs146-kimi-path-red.mjs` — A–E как названо (красно на `8ef671e` в B и D); живой Kimi:
запись `src/app.mjs` → долг теста → `Stop` открывает ход-продолжение.

## Symptom

Живой `kimi -p` (2026-11-21 17:42, свежий проект KAIF под Kimi): агент записал `src/app.mjs` («Wrote 18 bytes»), а `.kaif/test-debt.json`
остался пустым — ход кончился без просьбы прогнать код.

## Repro / forensics

Запись `tool.call` живого журнала Kimi: `"name":"Write","args":{"path":"src/app.mjs","content":"console.log('ok');"}` — путь в поле
`path`, относительный от папки сессии (`docs/en/reference/tools.md` клона: «`Write` accepts `path`, `content`»). Хук
`framework/hooks/test-after-code.mjs:160` брал `file_path || notebook_path` → под Kimi пусто → не долг. `clock-now.mjs` без `file_path`
не узнавал markdown: заполнитель в код-спане (по правилу — буква) отказывался как в коде.

## Root cause

Форма входа инструмента перенесена из Claude Code — тот же класс, что `bugs/145` (синтаксис матчера).

## Fix

Оба хука при пустом `file_path` берут `path`, разрешив его от `cwd` события. Самопроверка `test-after-code` — случай Kimi `Write {path}`;
проба `tools/sandbox/probes/bugs146-kimi-path-red.mjs` — A/B долг (эта сборка / `8ef671e`), C/D код-спан в markdown, E простой заполнитель.
Остаток: под Kimi `clock-now` пишет подсказку об ASCII-форме в stdout `PreToolUse`, который модель Kimi не видит — названо, не чинилось.

TWINS: searched `tool_input.*file_path` и `\.file_path` в `framework/hooks/` — found 2 hooks reading the file name (`test-after-code`,
`clock-now`); `knowledge-moment` и `subagent-preamble` пути не читают (`prompt`, общий текст входа).

## ✅ STATUS: DONE (2026-11-22 09:53 +03:00)

Гигиена: `bugs146-kimi-path-red` A–E зелёные, контроль `8ef671e` красный в B и D.
Функциональный прогон: новая Kimi VS Code сессия `session_6d66c1d4…`; запись `.mjs` → долг → `Stop` с `origin: system_trigger / stop_hook` в 09:40 → запуск в продолжении → `test debt: none`.
[TESTED: 2026-11-22 · `testcases/reports/2026-11-22_kimi-stop-alive.md`]

Уточнение по простою: агент ошибочно завершил ход второй раз вместо запуска файла в продолжении 09:40. Второй `Stop` в том же agent turn не открывает ещё одно продолжение по контракту Kimi; это не оправдание простоя и не отменяет первую успешную приёмку. Урок — EXP-0221.

## Decisions made without the owner

- none.

## Links

`bugs/145` · `researches/50` §8 · `plans/143` KA9 · `testcases/reports/2026-11-21_ki-ka1-ka3-kimi-hooks-and-window.md`.
