# Bug 159 — активные release-трекеры противоречат retraction и текущим Kimi/VSIX контрактам

**Status:** 🔧 FIXING THIS SESSION — четыре семейства расхождений подтверждены скептиком
**Version/build:** KAIF 2.10 RC · **When/context:** 2026-11-23 16:34 +03:00
**Severity:** S2 — выпуск может опереться на отозванный суд, старые пороги или другой бинарник
**Fixing:** эта сессия, перед повторным RL

**Вектор цели:** **Maintain + Avoid.** Активный план, STATUS, README и ноты обязаны согласованно показывать открытые ворота и текущие значения, сохраняя исторические отчёты без переписывания.

**Fix accepted when:** критерий 18 и связанные counts не зеленеют при REOPENED bugs150; open count соответствует файлам и bugs152 имеет таблицу; активные Kimi тексты используют 70/75/80/90, старые 75/80/85 явно исторические; plans144 отделяет F3 0.9.1/416 от current RC 1.0.0/423+3+1.

## Инвентарь

1. `plans/136:337` criterion 18 ✅ против `plans/141:21` REOPENED и bugs150. Literal markers 19, effective 18; `STATUS:60` устаревшие 20/40 и «37–40 закрыты» при reopened 38.
2. `STATUS:139` 48 открытых; фактическая проба скептика 49 после bugs152. Строки bugs152 в таблице нет, roster prose тоже протухло.
3. Активный criterion 38 `plans/136:314` требует 75/80/85/92 вместо №167 70/75/80/90. Тот же активный хвост в KA9 plans143; release notes и README содержат исторические 75/80/85 без явной маркировки.
4. `plans/144:5` living status называет 0.9.1/416, тогда как STATUS и installed RC — 1.0.0/423+3+1. Исторический F3 отчёт остаётся неизменным.

## Root cause

Retraction и поздние bumps исправили одни зеркала, но не весь активный release contour; счётчики велись вручную.

## Fix plan

Исправить каждое активное место, сохранить исторические reports с датами. Обновить counts свежей пробой и добавить bugs152. После правок грепнуть все старые literals и прогнать counters/showcase/doc-header/attribution gates. Не закрывать bugs150–152 этой документной работой.

TWINS: перечислены в четырёх пунктах; generic 75/80/85/92 для других систем остаётся законным и не трогается.

## Decisions made without the owner

Заполняется при закрытии.

## Links

`plans/136` · `plans/141` · `plans/143` · `plans/144` · `bugs/150–152` · №162/167/175.

kaif-fp: release-tracker :: active-mirrors-contradict-retraction-and-current-contracts :: v2.10
