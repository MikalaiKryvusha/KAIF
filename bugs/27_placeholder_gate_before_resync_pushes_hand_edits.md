# Bug 27 — гейт плейсхолдеров стоит ДО re-sync зеркал: правка в каноне не может пройти проверку

**Status:** 🟠 OPEN
**Version/build:** 2.0 · **When/context:** 2026-07-31, отчёт `KAIF_2.0_UPDATE_REPORT.md` (дефект 2).

## Symptom

Агент исправил плейсхолдер в каноне (`.claude/skills/end-chat/SKILL.md` чист) → `update-verify`
красный четырьмя строками про ЗЕРКАЛА (`.agents/ .grok/ .cline/ .roo/`). Механический шаг, который
всё чинит (`resyncCopies`), стоит ПОСЛЕ гейта и до него не доходит. Самый прямой путь для агента —
править зеркала руками, ровно то, что канон запрещает (bug 05: «no copy is ever edited by hand»);
правильный ход (`sync`) в тексте ошибки не назван.

## Repro (deterministic)

Из отчёта: канон чист (`grep` пуст) → `update-verify` → `✖ placeholder <YOUR AGENT/MODEL> still in
.agents/…` ×4 → FAILED. Свод: правка канона + грязные зеркала → update-verify обязан пройти
(отресинкав сам) либо назвать `sync` в ошибке.

## Root cause

`runFinalGates`: `scanPlaceholders()` → … → `die()` → и только потом `resyncCopies()`.

## Fix plan (план 23, Фаза B3; из отчёта)

Перенести `resyncCopies()` ПЕРЕД блоком гейтов (шаг механический и идемпотентный — ничего не решает
за агента); минимум — дописать в ошибку: «канон уже исправлен → `node .kaif/kaif-core.mjs sync` и
повтори». Страж красным до фикса.

## Decisions made without the owner

*Заполнится при закрытии.*

## Links

`KAIF_2.0_UPDATE_REPORT.md` §3.2 · bugs/05 (зеркала не правятся руками) · `plans/23`.
