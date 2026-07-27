# Bug 18 — Машинерия нарушает собственное правило ignore-first: `.kaif/install/` не в .gitignore

**Status:** 🔴 OPEN
**Version/build:** 1.6 · **When/context:** 2026-07-27, метасинтез (`researches/07`) — отчёт 05
(NDim), F4; воспроизведён автором отчёта на себе.

## Symptom

`cmdUpdate` создаёт `.kaif/install/` и кладёт туда `KAIF-CORE-BUNDLE.md` (425 708 байт), не
добавляя строку в `.gitignore`. `update-verify` каталог удаляет — но между `update` и
`update-verify` лежит вся ручная сшивка (часы), и любой `git add -A` в этом окне утаскивает 425 КБ
мусора в индекс/историю. У NDim это случилось: проверочный скрипт сделал `git add -A`, в индексе
оказались бандл и `KAIF_UPDATE_TASK.md`. При этом 1.6 сам вводит правило «сначала ignore, потом
инструмент» — инсталлятор его нарушает.

## Repro (deterministic)

После `node .kaif/kaif-core.mjs update`: `git check-ignore -v .kaif/install/KAIF-CORE-BUNDLE.md`
→ NOT IGNORED.

## Root cause

Транзиентность каталога обеспечена только самоочисткой в конце пути — окно между началом и концом
не рассматривалось; правило ignore-first вошло в канон 1.6 позже, чем писался инсталлятор, и на
сам инсталлятор не было применено.

## Fix plan

Дописывать `.kaif/install/` (и `KAIF_UPDATE_TASK.md`, `KAIF.md`, `KAIF-LOADER.mjs` — весь
TRANSIENT-набор) в `.gitignore` ДО скачивания; строка полезна и после очистки — обновления
повторяются (вариант отчёта 05). Альтернатива (временный каталог ОС) отклонена там же: строка в
.gitignore дешевле и долговечнее.

## Decisions made without the owner

—

## Links

`researches/07` §4 · отчёт 05 (F4) · AGENT_GUIDE «Неотменяемая git-гигиена» (правило, которое
нарушено).
