# Bug 28 — слоты новых навыков вне канонического списка PLACEHOLDERS + в update-задании нет пункта placeholders

**Status:** 🟠 OPEN
**Version/build:** 2.0 · **When/context:** 2026-07-31, отчёт `KAIF_2.0_UPDATE_REPORT.md` (дефект 3).

## Symptom

Новый `/end-chat` приезжает со строкой `Co-Authored-By: <YOUR AGENT/MODEL> <YOUR AGENT'S noreply
EMAIL>`: первый слот в списке `PLACEHOLDERS` (гейт ловит), второй — НЕТ (гейт слеп). Заполнив
только первый, агент оставил бы литерал в пяти копиях при зелёном `update-verify`. Плюс:
`writeUpdateTask` не имеет пункта `placeholders` (в `writeAdaptationTask` есть) — о новых слотах
апдейт узнаёт только падением финального гейта, после «я всё сделал».

## Repro (deterministic)

Греп `<YOUR AGENT'S noreply EMAIL>` по шаблонам → есть; по `PLACEHOLDERS` ядра → нет. Свод:
апдейт, добавляющий навык со слотом, обязан нести пункт `placeholders` в задании; гейт обязан
краснеть на ОБОИХ слотах.

## Root cause

Слот введён навыком 2.0 мимо канонического списка; `classifyAndApply` собирает `unresolved` и
выбрасывает его на update-пути.

## Fix plan (план 23, Фаза B3; из отчёта)

(а) Свести слоты к каноническому списку (`<YOUR AGENT/MODEL>` + отдельный `<AGENT_EMAIL>` — или
существующий слот добавить в PLACEHOLDERS); (б) `writeUpdateTask`: пункт `placeholders` при
непустом `unresolved`. TWINS: греп всех `<…>`-слотов шаблонов против списка PLACEHOLDERS —
инвентарь в этот документ при фиксе. Стражи красными до фикса.

## Decisions made without the owner

*Заполнится при закрытии.*

## Links

`KAIF_2.0_UPDATE_REPORT.md` §3.3 · `plans/23`.
