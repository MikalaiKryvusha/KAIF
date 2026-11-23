# Bug 156 — параллельные Kimi Stop-хуки расходуют one-shot без доставки приказа

**Status:** 🔧 FIXED IN SOURCE — focused hygiene green; live Kimi acceptance and regenerated dist pending
**Version/build:** KAIF 2.10 RC, Kimi 2.7.2 · **When/context:** 2026-11-23 16:34 +03:00
**Severity:** S2 — написанный код остаётся незапущенным, а тестовый долг молча теряет последнее напоминание
**Fixing:** эта сессия

**Вектор цели:** **Maintain.** Каждая записанная one-shot Stop-отметка обязана соответствовать действительно доставленной причине; одновременные блоки собираются без бесконечного цикла.

**Fix accepted when:** при одновременном STATUS+testing debt continuation содержит обе причины; после исправления только STATUS следующий Stop с тем же test debt снова блокирует. Replay без долга молчит, farewell/StopFailure сохранены.

## Forensics

- Kimi вызывает Stop hooks через `Promise.all`, выбирает первый block в config order.
- `stop-status-guard` стоит раньше `test-after-code`; последний пишет `lastStop` независимо от выбора причины.
- Живой отчёт 2026-11-22 содержит STATUS continuation и уже записанный `lastStop`; файл запустился только после следующего слова владельца.
- Pure reproduction: первый test block создаёт lastStop, второй Stop `out:null`, хотя delivered reason выбран STATUS.

## Root cause

Несколько независимо состоянистых producers блоков исполняются параллельно, но consumer доставляет только одну причину. Producer не знает, что его one-shot не был показан.

## Fix plan

Для Kimi заменить параллельные Stop entries одним последовательным project multiplexer, собирающим все exit-2 reasons детерминированно. Обновить fragment/installer/s14/mutants и живую приёмку bugs/146. Сохранить one-continuation suppression engine, farewell, StopFailure и Claude behavior.

TWINS: `context-window` — поздний blocking Stop producer с собственным state; generated fragment копирует тот же порядок.

## Implementation — 2026-11-23

- Новый `framework/hooks/kimi-stop.mjs` последовательно запускает project handlers в прежнем config order: STATUS → farewell → testing → context-window. Всем передаётся тот же raw event; каждый exit-2 stderr попадает в один aggregated exit 2. Observation-only farewell выполняется ровно один раз на Stop.
- `kimi-config-fragment.toml`: четыре параллельных `Stop` entries заменены одним `kimi-stop.mjs` (timeout 40 = четыре прежних бюджета); отдельный `StopFailure` сохранён. Общее число записей fragment — 19. Installer менять не потребовалось: существующий `kimiSection` уже маршрутизирует новый entry, а `s14` подтвердил замену старых hand-merge entries.
- `test-after-code.mjs`: Claude сохраняет once-per-signature. Kimi повторяет нерешённый долг на следующем ОБЫЧНОМ Stop; подавление повторного Stop внутри continuation остаётся у Kimi engine (`stopHookContinuationUsed`, researches/50 §14).
- Claude `settings-fragment.json` и `context-window.mjs` этим исправлением не менялись.

## Verification — 2026-11-23

**Красный контроль до исправления:** `node tools/sandbox/probes/bugs156-kimi-stop-multiplexer.mjs` → exit 1. Legacy control подтверждён: доставлен только STATUS, хотя `lastStop` и window block уже записаны; `kimi-stop.mjs` отсутствует (1 BAD).

**Гигиена после исправления — зелёная:**
- `node framework/hooks/kimi-stop.mjs --selftest` → 3/3: все причины в порядке producers, identical event, farewell один раз, тихий replay.
- `node tools/sandbox/probes/kimi-stop-mutants.mjs` → control green; M1–M5 красные ровно на названных случаях (first-block · first-reason-only · skipped farewell · reversed order · swallowed exit 2).
- `node tools/sandbox/probes/bugs156-kimi-stop-multiplexer.mjs` → all as named: STATUS+testing+window доставлены вместе; после свежего STATUS testing+window снова блокируют; запуск кода гасит testing debt; replay без долга exit 0.
- `node framework/hooks/test-after-code.mjs --selftest` и `node tools/sandbox/probes/hc8-test-hook-mutant.mjs` → зелёные, включая все прежние Claude assertions/mutants.
- `node framework/hooks/stop-farewell-capture.mjs --selftest`, `node framework/hooks/kimi-hook.mjs --selftest`, `node tools/sandbox/probes/kimi-hook-mutants.mjs`, `node tools/sandbox/probes/bugs146-kimi-path-red.mjs` → зелёные. В bugs/146 прежние A–E не изменены; F добавляет новый wiring contract.
- Изолированная сборка во temp (`node "$T/tools/build-framework.mjs"`) → check-framework OK, 196 blocks; `KAIF_DIST="$T/dist" node tools/sandbox/s14-refresh-hooks.mjs` → все новые bugs/156 и wiring assertions зелёные, 19 записей через dispatcher. Общий итог s14 — 1 failure только потому, что чужой текущий `context-window.mjs --selftest` имеет 3 FAIL в случаях bugs/153 и bugs/154. Этот файл не редактировался; остальные assertions s14 зелёные. Repo `dist` не трогали, полный `test:core` не запускали.

**Функциональный прогон:** NONE — живой Kimi Stop continuation не запускался; требуется новая/reloaded Kimi-сессия с новой user-level проводкой.

**Replacement contract:** старые проверки не ослаблены. Вместо четырёх независимо молчащих/блокирующих entries s14 теперь требует ровно один Stop multiplexer, отдельный StopFailure и реальный сценарий с тремя одновременными причинами. Динамический KA2 entry count сохранён и наблюдал 19.

TWINS: searched `event = "Stop"` в TOML, direct Kimi producer commands, parallel producer launches и JSON Stop arrays — других живых Kimi source sites нет; найдены только старая generated копия в `dist/KAIF-CORE-BUNDLE.md` (намеренно не тронута), legacy hand-merge fixtures в `s14` (проверяют миграцию) и Claude `settings-fragment.json` (намеренно сохранён).
TWINS-MECH: один fan-out event с несколькими stateful handlers и consumer, доставляющим один результат; проверены формы repeated TOML entries, JSON hook arrays и parallel process launches.
AFTER-WORK: `lastStop` очищается только в памяти перед Kimi-решением; смерть до save оставляет прежнее disk state, смерть после save, но до aggregate delivery — прежний риск границы процесса. STATUS cooldown, context `said` и farewell memory не менялись; все завершённые exit-2 reasons собираются до выхода multiplexer.

## Decisions made without the owner

1. Порядок handlers — прежний config order; timeout aggregated entry — сумма четырёх прежних 10-секундных бюджетов.
2. Нерешённый testing debt повторяется на следующем обычном Kimi Stop, а не гасится навсегда первой доставкой: same-turn loop запрещает сам Kimi engine.

## Links

`bugs/146` · EXP-0221/0210/0181 · `plans/143`.

kaif-fp: kimi-stop-hooks :: parallel-block-reason-lost-but-suppression-recorded :: v2.10
