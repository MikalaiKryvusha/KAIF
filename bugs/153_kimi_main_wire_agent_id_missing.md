# Bug 153 — Kimi main-wire без agentId отключает замер окна и wire-driven closure

**Status:** 🔧 FIXING THIS SESSION — подтверждено скептиком на живой сессии
**Version/build:** KAIF 2.10 RC, текущий Kimi VS Code/fork wire · **When/context:** 2026-11-23 16:34 +03:00, `/code-revision`
**Severity:** S1 — молча исчезает защита от переполнения и требование закрытия
**Fixing:** эта сессия, до повторного RL

**Вектор цели:** **Maintain + Avoid.** Основной `agents/main/wire.jsonl` обязан давать свежий замер независимо от наличия необязательного `agentId`; явные non-main записи остаются исключёнными.

**Fix accepted when:** selftest содержит обе реальные формы main-wire (с `agentId: main` и без поля), а живой `--measure` текущей сессии печатает tokens и возвращает 0/1 по порогу, не 2. Explicit non-main record не принимается.

## Symptom

`node framework/hooks/context-window.mjs --measure` вернул код 2 «no Kimi wire» в длинной сессии, хотя wire существует и содержит свежие `usage.record`/`token_counting.measured`.

## Forensics

- `context-window.mjs:141`: `if (r.agentId !== 'main') continue;`.
- Текущая сессия: 184/184 соответствующие записи без `agentId`; свежая пара — `usage.record` и `token_counting.measured tokens=638552`.
- Прежняя принятая сессия bugs/149: 468/468 записей с `agentId: main`; fixtures моделировали только старую форму.
- In-memory вызов фактического `lastKimiContext`: null; добавление `agentId:main` к той же записи возвращает `used=638552`.

## Root cause

Путь уже ограничен файлом `agents/main/wire.jsonl`, но код дополнительно требует поле, которого в новой клиентской форме нет. Отсутствие поля ошибочно приравнено к non-main.

## Fix plan

Принимать отсутствующий `agentId` только в main-wire; отклонять явное отличное значение. Добавить real-shape selftest/s14 и mutant; прогнать живой `--measure`. Не менять token formula, thresholds, compaction invalidation, Stop.usage и owner-word closure.

## Repro

`KIMI_CODE_SESSION_ID=session_8d356b2f-12dd-40d4-8b8d-42daad929364 node framework/hooks/context-window.mjs --measure` до фикса → код 2 при свежих записях.

TWINS: searched `agentId !== 'main'` — runtime `context-window.mjs:141`, generated bundle и старые fixtures; других runtime фильтров этой формы нет.

## Decisions made without the owner

Заполняется при закрытии.

## Links

`bugs/144` · `bugs/149` · `bugs/150` · EXP-0220/0216/0198 · `plans/144`.

kaif-fp: Kimi main-wire context measurement :: missing agentId makes usage records invisible :: v2.10

## Evidence — 2026-11-23 17:53 +03:00

- RED до правки: `KIMI_CODE_SESSION_ID=session_8d356b2f-12dd-40d4-8b8d-42daad929364 node framework/hooks/context-window.mjs --measure` → exit 2, `nothing to measure`, хотя wire существовал.
- RED на новых selftests до правки: `node framework/hooks/context-window.mjs --selftest` → exit 1, `selftest: 3 FAIL`; среди них `Kimi main-wire shapes (bugs/153)`.
- GREEN после правки: та же команда → exit 0, `selftest: all ok`; старая форма `agentId:"main"`, новая форма без поля, explicit non-main и compaction без поля проверены.
- GREEN `node tools/sandbox/probes/kimi-window-mutants.mjs` → exit 0; K8 возвращает обязательный `agentId` и краснит ровно случай bugs/153.
- LIVE после финальной правки: `KIMI_CODE_SESSION_ID=session_8d356b2f-12dd-40d4-8b8d-42daad929364 node framework/hooks/context-window.mjs --measure` → exit 1 по порогу 80 %, напечатано `76 % full (679730 of 891289 tokens)`, compaction point `891289 of 1048576`, session by session id. Это ожидаемый «too early», не отсутствие замера.
- `s14` и `dist` этой сессией не запускались и не менялись.
