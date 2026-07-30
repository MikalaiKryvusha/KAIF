# Bug 29 — анонимная самоочистка удаляет ядро, а с ним всю механику 2.0 (check/sync/diff/adopt-current)

**Status:** 🟠 OPEN
**Version/build:** 2.0 · **When/context:** 2026-07-31, отчёт `KAIF_2.0_UPDATE_REPORT.md` (дефект 5).

## Symptom

`selfCleanArtifacts` при `anonymous` удаляет `.kaif/kaif-core.mjs` («The core carries the origin
URL»). Сразу после успешного апдейта в проекте нет ни `check`, ни `sync`, ни `diff`, ни
`adopt-current` — ровно тех инструментов, которые 2.0 добавила. Полевой агент проверял 96 копий
зеркал СВОИМ скриптом, потому что штатной команды на диске не было; дрейф зеркал между релизами
чинить нечем.

## Root cause

Анонимности противоречит не файл, а две константы (`ORIGIN`, `SOURCES`) и origin-зависимые
команды. В этом же релизе для манифеста принято противоположное — правильное — решение
(«carries no origin at all … SURVIVES»); аргумент дословно применим к ядру.

## Fix plan (план 23, Фаза B4; из отчёта)

Оставлять **анонимизированное ядро**: `ORIGIN`/`SOURCES` вырезаны, `update`/`fork`/`switch-origin`
отвечают «unavailable on an anonymous install»; `check`/`sync`/`diff`/`adopt-current`/`checkpoint`
живут. Гейт анонимности (греп-скан ликов) обязан остаться зелёным на оставленном ядре — страж в
s04. Красным до фикса: после анонимного verify-final команда `sync` недоступна.

## Decisions made without the owner

*Заполнится при закрытии.*

## Links

`KAIF_2.0_UPDATE_REPORT.md` §3.5 · bugs/13 (анонимный путь второсортен — предыдущее поколение
класса) · `plans/23`.
