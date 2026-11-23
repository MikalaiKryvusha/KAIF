# Bug 155 — общий context-window tmp при параллельных Kimi events превращает refusal в allow

**Status:** 🔧 FIXING THIS SESSION — deterministic race и engine ordering подтверждены; живой ENOENT не утверждается
**Version/build:** KAIF 2.10 RC · **When/context:** 2026-11-23 16:34 +03:00
**Severity:** S1 — обязательный closure gate может молча fail-open
**Fixing:** эта сессия

**Вектор цели:** **Avoid.** Overlapping PostToolUse/PreToolUse не должны терять state или превращать уже вычисленный soft/force refusal в exit 0.

**Fix accepted when:** синхронизированный concurrency probe повторно запускает overlap и получает exit 2 для каждого ordinary PreToolUse выше порога, валидный JSON и ни одного silent allow; single-event semantics сохранены.

## Forensics

- Kimi PostToolUse использует fire-and-forget, следующий PreToolUse awaited; общей очереди между процессами нет.
- `context-window.mjs:704`: общий `context-window.json.tmp`, write→rename; второй rename при interleaving получает ENOENT.
- Outer catch выходит 0 до печати уже вычисленного refusal. In-memory reproduction: второй rename ENOENT.
- Тот же fixed-tmp construction есть в Claude-ветке и соседних hooks; exploitability каждого проверяется отдельно.

## Root cause

Read-modify-write не сериализован между процессами, а fixed temporary name общий. Persistence failure происходит до выдачи block и поглощается общим fail-open catch.

## Fix plan

Сериализовать state transaction на проект и/или использовать unique tmp + lock с таймаутом; denial обязан выдаваться даже при persistence failure. Добавить deterministic overlap probe и мутант. Не менять observation-only PostToolUse, retention, thresholds и intentional unrelated fail-open errors.

TWINS: searched fixed `.tmp` write/rename — `context-window.mjs:704,742`, `test-after-code.mjs:196`, `stop-farewell-capture.mjs:271–272`, generated copies; инвентарь не равен доказанному дефекту в каждом месте.

## Decisions made without the owner

Заполняется при закрытии.

## Links

`bugs/150` · EXP-0222/0220/0216 · Kimi externalHooks dispatch source.

kaif-fp: Kimi context-window state :: shared tmp fail-open under overlapping events :: v2.10

## Evidence — 2026-11-23 17:53 +03:00

- RED до правки: `node tools/sandbox/probes/bugs155-context-window-overlap.mjs` → exit 1; оба writer дошли до rename, ordinary PreToolUse получил exit 0/stderr empty, forced rename failure тоже дал exit 0.
- RED на неизменённом HEAD после финальной версии пробы: `node tools/sandbox/probes/bugs155-context-window-overlap.mjs --rev HEAD` → exit 1; `second writer ... true`, PreToolUse exit 0 и forced persistence exit 0. State JSON оставался валидным, retention и unrelated fail-open сохранялись.
- GREEN после правки: `node tools/sandbox/probes/bugs155-context-window-overlap.mjs` → exit 0. Lock сериализует writers (`second writer ... false`), PostToolUse observation-only exit 0/stdout empty, PreToolUse soft denial exit 2; forced rename failure тоже exit 2 с тем же denial. State — валидный JSON, после 25 дополнительных sessions остаётся ровно 20; forced unrelated internal error сохраняет exit 0/stderr empty.
- GREEN `node framework/hooks/context-window.mjs --selftest` → exit 0: PostCompact reset, pending delivery и обычные closure cases не изменились.
- Реализация: project state lock через atomic `mkdir`, stale/timeout fallback без записи, pid-unique temp, persistence отделён от выдачи computed refusal. Claude fixed-temp twin в этом же файле переведён на unique temp; `test-after-code.mjs` и `stop-farewell-capture.mjs` найдены twin-поиском, но не изменены — их overlap здесь не исследовался.
- Живой overlapping Kimi event не запускался; доказан детерминированный direct-hook event path на копиях source/HEAD.
