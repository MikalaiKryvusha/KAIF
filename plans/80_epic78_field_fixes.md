# План 80 — эпик FP «Поле 2.3»: четыре точечных фикса по отчётам NDim/KAGO

> **Создан:** 2026-08-28 01:36 +03:00. **Родитель:** `plans/78` (эпик FP; якорь — критерий
> приёмки 5). **Статус:** ✅ ЭПИК FP ЗАКРЫТ 2026-08-28 01:48 +03:00 — четыре фикса отгружены,
> каждый доказан ОБОИМИ ответами (красный на мутации до-фиксового поведения · зелёный на фиксе);
> полигон 14 сводов зелёный. **Поправка суда RL 2026-08-28 (находка H15, канон T8):** фактический
> момент закрытия — 01:5x, ПОСЛЕ шага FP5; метка «01:48» выше записана до финального шага и
> оставлена как история (append-only, №55). **Вовне:** черновики ответов в issues origin #23/#24 (секция ниже) —
> отправка ПОСЛЕ релиза 2.4 (№80); перед отправкой — сверка время-чувствительных форм (EXP-0093).

## Вектор цели (Achieve)

Боль — четыре грабли, оплаченные полевыми обновлениями до 2.3 (отчёты NDim и KAGO, оба в
`reports/KAIF_UPDATES/`): (а) `update` пишет LF в CRLF-дерево и транзиентно краснит локальные
побайтные стражи потребителя (тикет KAGO 06); (б) шаг 4 `/report-bug` сформулирован как
«автономная публикация без человека» и дважды отвергнут классификатором безопасности агентской
системы (NDim R1); (в) законно-старые упоминания версий переподсвечиваются stale-claims на каждом
интервале навсегда (NDim R2); (г) строка merge не называет, КАКОЙ модуль оставлен владельцу —
ответ требовал песочницы (пожелание KAGO). Где хотим оказаться: все четыре закрыты в машинерии и
навыке, каждый — с красной фикстурой.

## Готово, когда (критерии приёмки)

1. **CRLF:** `update`, переписывая СУЩЕСТВУЮЩИЙ файл (merge и replace), сохраняет доминирующую
   конвенцию концов строк файла; новые файлы остаются LF. *Meter:* свод полигона: CRLF-файл после
   merge остаётся CRLF, красный доказан на до-фиксовом поведении.
2. **Классификатор:** шаг 4 `/report-bug` обоих слоёв сформулирован вокруг СТОЯЧЕЙ авторизации
   владельца KAIF (issue #15), без «without human participation»; транспорт ≠ авторство сохранён.
   *Meter:* греп старой формулы пуст; новая называет цитируемую авторизацию.
3. **Маркер оправдания:** строка с `KAIF-VERSION-OK` (на самой строке или строкой выше) не
   попадает в stale-claims; текст задания называет маркер. *Meter:* фикстура свода: помеченная
   строка молчит, непомеченная (контроль) — в хитах.
4. **Сигнатуры:** строка `merged N module(s) into X` называет оставленные модули по сигнатурам.
   *Meter:* ассерт свода на лог.
5. Пересборка + `npm run test:core` зелёные; правки тестовых файлов — с обоснованием в коммите.

## Шаги

- [x] **FP1.** ✅ 2026-08-28 01:4x +03:00 (twin: алиасы вшиваются в память до записи — класс
      перезаписи существующих равен двум местам). Хелпер `writeMatchingEol` в `KAIF-CORE.mjs` +
      два места записи классификации (replace, merge).
- [x] **FP2.** ✅ 2026-08-28 01:4x +03:00. Строка merge называет сигнатуры оставленных модулей
      (`kept for you: …`).
- [x] **FP3.** ✅ 2026-08-28 01:4x +03:00. `scanStaleClaims`: пропуск строки с маркером
      `KAIF-VERSION-OK` (своя или предыдущая строка); подсказка о маркере — в тексте пункта задания.
- [x] **FP4.** ✅ 2026-08-28 01:4x +03:00. Переформулировка шага 4 `/report-bug` (payload +
      обвязка): стоячая авторизация владельца KAIF цитатой, «дай пермишен-слою спросить и
      дождись»; императив «без участия человека» изъят.
- [x] **FP5.** ✅ 2026-08-28 01:5x +03:00. Фикстуры: s02 (FP1 CRLF+контроль LF, FP2 сигнатуры на
      конфликте S6 с новым апстрим-модулем [3]) · s04/S14c (FP3 маркер + контроль, что скан не
      ослеп); каждая доказана красным мутацией до-фиксового поведения на копии ядра; полигон
      целиком зелёный; черновики #23/#24 — ниже; веха в `plans/78`.

## Черновики ответов в полевые issues (отправка после релиза 2.4, №80)

**#23 (KAGO, отчёт 2.2→2.3).** Thank you for the cleanest mechanical pass on record — and for
ticket 06. Both asks ship in v2.4: (1) `update` now preserves the dominant line-ending convention
of every file it rewrites (merge and replace alike; new files stay LF) — your prayer-guard class
can no longer redden on a green pass; proven red-then-green in the polygon. (2) The merge lines
now NAME the kept modules by signature (`kept for you: <heading>`), so the answer no longer
requires a sandbox. The 2.2 rake you re-met on the old core (§2.2) is confirmed fixed on the 2.3+
core, as the route note predicted.

**#24 (NDim Space, отчёт 2.2→2.3).** Thank you — especially for the honest R1 evidence. All three
land in v2.4: (1) R1 — step 4 of `/report-bug` is reworded around the owner's STANDING
authorization (issue #15) instead of the imperative "without human participation": delivery now
explicitly exercises a pre-given human decision and tells the agent to let the permission layer
ask and wait — the prompt and the authorization compose. Your stricter-than-canon local copy can
adopt the new text as-is. (2) R2 — a permanent justification marker ships:
`<!-- KAIF-VERSION-OK: reason -->` on the hit line or the line above silences the stale-claims
scan forever, and the task text names it — your two justified lines stop re-flagging and the
counter can converge to zero. (3) R3 noted with its honest boundary (local `--source`, network
path not exercised) — recorded as partial verification of #10, not full.

## Решения, принятые агентом без владельца

1. Имя маркера — каноническая английская строка `KAIF-VERSION-OK` (класс `[TESTED]`/`DONE`),
   форма — HTML-комментарий с причиной: `<!-- KAIF-VERSION-OK: причина -->`; NDim предлагал
   русское `ВЕРСИЯ-ОК` — канонические маркеры KAIF англоязычны независимо от языка проекта.
2. Сигнатуры в merge-строке — только для ОСТАВЛЕННЫХ модулей (ровно её просил KAGO); влитые
   остаются счётом.

## Links

`plans/78` (критерий 5) · `reports/KAIF_UPDATES/KAGO_KAIF_2.3_UPDATE_REPORT.md` ·
`reports/KAIF_UPDATES/NDIM_SPACE_KAIF_2.3_UPDATE_REPORT.md` · тикет `d:\work\ai_sandbox\KAGO\bugs\KAIF\06_…` ·
issues origin #23/#24 · issue #15 (стоячая авторизация доставки).
