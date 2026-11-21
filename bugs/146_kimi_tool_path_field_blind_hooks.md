# Bug 146 — Kimi: хуки KAIF не видят файл записи — Kimi называет его `path`, а не `file_path`

**Status:** 🔧 fix in the tree (2026-11-21 17:50 +03:00); half of the DONE condition observed LIVE 2026-11-21 17:57 +03:00 — a real `kimi -p` (run 3 of KA9)
wrote `src/app.mjs` and `.kaif/test-debt.json` holds it; the stop asking for the run — not observed (the Stop block of `kimi -p` opened no
continuation turn, `researches/50` §14); DONE — after that half is seen (a TUI session) · **Severity:** S2 (потерян прогон: проверка «написал код — запусти его» под Kimi молча не работала) ·
**Version/build:** KAIF 2.10 WIP `8ef671e`, Kimi Code CLI 2.7.2 · **When/context:** 2026-11-21 17:50 +03:00, живой прогон KA9 (сессия 104)
**Fixing:** эта сессия.

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

## Decisions made without the owner

_(заполняется при закрытии)_

## Links

`bugs/145` · `researches/50` §8 · `plans/143` KA9 · `testcases/reports/2026-11-21_ki-ka1-ka3-kimi-hooks-and-window.md`.
