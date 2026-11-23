# Bug 157 — Kimi tool-hook envelope без agent identity смешивает main и subagent state

**Status:** 🔴 OPEN — подтверждено по installed/fork engine source и pure hook replay; требуется engine+KAIF граница
**Version/build:** KAIF 2.10 RC, official/fork Kimi 2.7.2 · **When/context:** 2026-11-23 16:34 +03:00
**Severity:** S2 — чужой test debt/knowledge/context state может быть записан в main
**Fixing:** эта сессия — сначала минимальный engine envelope contract и защитная адаптерная граница

**Вектор цели:** **Avoid + Maintain.** Событие субагента не должно менять main hook state; main без id остаётся рабочим, Claude `agent_id` не ломается.

**Fix accepted when:** реальный captured main/subagent hook stdin replay показывает: subagent Write/failure не меняет main context-window/knowledge/test-debt, main events меняют; stock unsupported envelope честно назван ограничением, а не ложной изоляцией.

## Forensics

- ExternalHooks service существует в каждом Agent scope и имеет `scopeContext.agentId`.
- Pre/PostToolUse stdin содержит tool/session facts, но не agent identity; Stop тоже требует отдельной проверки.
- Три KAIF guards полагаются только на `ev.agent_id`: context-window, knowledge-moment, test-after-code.
- Pure event без agent_id проходит все три как main и создаёт test debt.

## Root cause

Форма Claude envelope перенесена в Kimi fixtures, но Kimi engine не передаёт идентичность Agent scope. В main-wire поле agentId — отдельный смежный вопрос bugs/153, не решение hook envelope.

## Fix plan

В нашем engine добавлять non-main `agentId` в common hook payload; main оставить без поля для совместимости. В KAIF adapter зафиксировать stock limitation до такого engine. Добавить live captured-envelope probe и тесты трёх hooks. Не выдавать всех без id за субагентов — это отключило бы main.

TWINS: context-window:231, knowledge-moment:88, test-after-code:289, их synthetic agent_id fixtures и Stop payload; generated copies.

## Decisions made without the owner

Заполняется при закрытии.

## Links

`plans/143` · EXP-0178/0180 · `bugs/153` · `researches/50`.

kaif-fp: kimi-hook-identity :: subagent-tool-events-misclassified-as-main :: v2.10
