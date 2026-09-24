# Отчёт прогона — эпик CK 2.8, K17 шага CK5.8: стрижка STATUS повторяет линт авторства

**Создан:** 2026-09-25 02:06 +03:00 · **Прогон вёл:** Claude Opus 5.5 (1M context), сессия 72 · **Версия/сборка:** HEAD `fde8910` + рабочее дерево шага

## 1. Работа

K17 шага CK5.8 `plans/118`: «стрижка STATUS повторяет линт атрибуции». Базис — строка K17 `researches/32` §2д («стрижка пишет
строки-указатели, а `attribution-lint` по умолчанию не видит каталоги проекта», CONFIRMED) и её первоисточник — комментарий полевого
отчёта #79 (прочитан через `gh api repos/MikalaiKryvusha/KAIF/issues/comments/5734232445`), вторая заметка дословно: «The trim added
one new `kaif-attribution-lint` finding. The pointer lines of a trim are new prose. […] Suggestion: the trim paragraph of
`/end-chat-soft` could say "re-run the attribution lint after the trim: the pointers are new text". One more catch: the lint's
default scope (`DEFAULT_DIRS` plus root `*.md`) does not include `games/`, so the new dossier was read only when named explicitly».

Сделано: абзац стрижки навыка `/end-chat-soft` в поставке (`framework/skills/end-chat-soft/SKILL.md`) и в обвязке
(`.claude/skills/end-chat-soft/SKILL.md`) — после стрижки и до двери бюджета прогнать линт авторства (в поставке —
`node .kaif/tools/kaif-attribution-lint.mjs check`, там, где модуль развёрнут; у истока — «ещё раз», первый прогон стоит выше);
директорию, куда стрижка вынесла текст, вне охвата по умолчанию — назвать явно (`check <dir>`). Свод `s16` — раздел (8), два ассерта
по развёрнутому навыку.

## 2. Контур

Исток KAIF, Windows 11, Git Bash, Node v24; развёрнутая копия из `dist` во временном корне свода (`install --lang ru`, навыки
приезжают английскими); шов `KAIF_DIST` — `dist` тега v2.7. Функциональный путь — закрытие сессии полевого развёртывания после
обновления до 2.8; до выпуска не наблюдаем.

## 3. Прогоны

| # | Момент | Команда | Исход |
|---|---|---|---|
| 1 | 2026-09-25 02:02:40 → 02:02:47 +03:00 | `node tools/build-framework.mjs` → `node tools/sandbox/s16-doc-budgets.mjs` | код 0 и 0; «all 70 checks green» — оба ассерта K17 зелёные |
| 2 | 2026-09-25 02:02:47 → 02:02:53 +03:00 | `KAIF_DIST=<скретчпад>/dist-v27 node tools/sandbox/s16-doc-budgets.mjs` | код 1, «25 of 70 check(s) failed» — оба ассерта K17 красные (навык 2.7 о линте после стрижки молчит) |
| 3 | 2026-09-25, после 02:02:53 | `node tools/canon-inventory.mjs --diff v2.7 --with framework/KAIF_REFERENCE.md --declared plans/118_epic117_CK_light_canon_budget_exits.md` | код 0; «moved-out 0 · lost 0» |
| 4 | 2026-09-25 02:03:06 → 02:06:06 +03:00 | `npm run test:core` (в одиночку) | код 0, «all 27 suites green» |

## 4. Проверки

Гигиена: свод `s16` 70 из 70 (ассерты K17 судят РАЗВЁРНУТЫЙ навык между заголовками стрижки и двери, а не исходник); на ядре 2.7
оба красные; инвентарь обязательств канона — `lost 0`; сборка; полигон.
Функциональный прогон: NONE — первое закрытие полевого развёртывания после обновления до 2.8 ещё не прошло.

## 5. Найдено

- Шаблон поставки `/end-chat-soft` не называл линт авторства вовсе — ни до, ни после стрижки (у истока он назван до стрижки).
  Поставке добавлен ровно прогон после стрижки с оговоркой «где модуль развёрнут»: модуль опциональный.
- Дефектов продукта — ноль.

## 6. Следы

Логи — скретчпад сессии: `build11.log`, `s16i.log`, `s16-v27g.log`, `inv-k17.log`, `poly12.log`.

## 7. Вердикт

**partial** — правило доказано на развёрнутой копии и красным на 2.7; функциональный прогон — после выпуска 2.8.
