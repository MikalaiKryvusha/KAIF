# Bug 152 — наш Kimi VS Code extension остаётся на Starting Kimi Code…

**Status:** 🔴 OPEN — исходный зависший путь в другом проекте ещё не воспроизведён; первый живой запуск нашего пакета в KAIF успешен
**Version/build:** `mikalai-kryvusha.kimi-code-kaif` 1.0.0, Kimi engine 2.7.2, VS Code 1.123.0, Windows 11 · **When/context:** 2026-11-23 14:50 +03:00, живая приёмка `plans/144` F4
**Severity:** S2 — запуск рабочего чата блокируется и требует повторного запуска/диагностики
**Fixing:** эта сессия, до локализации и остальных UI-правок

**Вектор цели:** **Avoid + Maintain.** Наш extension обязан выходить из состояния запуска в рабочий chat либо показывать конкретную ошибку; одновременно установленные официальный Kimi и сторонний Kimi Fork не должны мешать определить, какой пакет реально запущен.

**Fix accepted when (observable):**

1. Scale: исход запуска нашего `kimiKaif.webview` в проекте, где был сообщён зависший запуск. Meter: живой Extension Host, output channel `Kimi Code` и снимок окна. Target: начальные bridge-вызовы завершаются, отображается chat либо конкретная ошибка; бесконечного `Starting Kimi Code…` нет.
2. Scale: повторяемость исправления. Meter: regression-проверка против названной сломанной версии и повторный живой запуск из собранной VSIX. Target: проверка красная до фикса и зелёная после; запуск успешен в обоих открытых проектах владельца.

## Symptom

Предыдущая сессия передала зависший экран `KIMI Starting Kimi Code…` в другом проекте владельца. Этот экран соответствует ветке `type === "loading"` в `ConfigErrorScreen.tsx`; она не содержит ни ошибки, ни кнопки retry.

В начале этой сессии активная вкладка `KIMI FORK` визуально выглядела как наш fork, но свежие журналы и manifest показали, что это `gxgleo.kimicode-vscode-fork@0.9.23` (`kimifork.webview`). Наш пакет был установлен, но ещё не активирован. Поэтому прошлый симптом нельзя приписывать нашему коду только по названию вкладки.

## Repro (deterministic стенд в работе)

1. В VS Code владельца с одновременно установленными `moonshot-ai.kimi-code`, `gxgleo.kimicode-vscode-fork` и нашим пакетом открыть `View: Show Kimi Code (KAIF fork)`.
2. Прочитать activation event именно `onView:kimiKaif.webview` и наш output channel по версии 1.0.0.
3. Повторить в окне другого проекта, где первоначально наблюдался запуск.
4. Если появится `Starting Kimi Code…`, в тот же момент снять Extension Host log, наш output log, developer console и последний незавершённый bridge request.

Первый проход в KAIF зависание не воспроизвёл.

## Охота за шагами — 2026-11-23 14:48–14:54 +03:00

| # | Вариант (ось: значение) | Исход |
|---|---|---|
| 1 | Точка входа: sidebar, проект KAIF | Активация 1.0.0 в 14:48:56; все начальные bridge calls `ok=true`, начальный экран отрисован, зависания нет |
| 2 | Проект: второй накопленный проект владельца, sidebar | Активация 1.0.0 в 14:53:26; все начальные bridge calls `ok=true`, начальный экран отрисован, зависания нет |
| 3 | Точка входа: `kimiKaif.openInTab`, второй проект | В 14:54:16 повторён полный начальный набор bridge calls, все `ok=true`; editor webview отрисован, зависания нет |

Снимки третьего входа: `testcases/reports/2026-11-23_kimi-kaif-second-project-open.webp`, `testcases/reports/2026-11-23_kimi-kaif-editor-tab.webp`. Исходный зависший экран не воспроизведён ни на одном из трёх путей; код запуска не менялся, баг остаётся OPEN до рецидива с конкретным незавершённым вызовом или исключением.

## Forensics

- `code --list-extensions --show-versions`: наш пакет `mikalai-kryvusha.kimi-code-kaif@1.0.0` установлен рядом с официальным `moonshot-ai.kimi-code@0.9.0` и сторонним `gxgleo.kimicode-vscode-fork@0.9.23`.
- `window2/exthost/exthost.log:26`: в 14:34:40 активирован `gxgleo...` событием `onView:kimifork.webview`.
- `window2/exthost/exthost.log:27`: только в 14:48:56 активирован наш пакет событием `onView:kimiKaif.webview`.
- Наш `8-Kimi Code.log`: `Kimi Code 1.0.0 activating` → `activated`; `checkWorkspace`, `getExtensionConfig`, `getSlashCommands`, `checkLoginStatus`, `getModels`, `getKimiSessions` и `getManagedUsage` — все `ok=true`.
- WebP-снимки: `testcases/reports/2026-11-23_kimi-current-screen.webp` (вкладка стороннего fork), `testcases/reports/2026-11-23_kimi-kaif-first-open.webp` (наш sidebar после активации).
- В текущих журналах нет ни одной строки `Starting Kimi Code…`: это React loading state, а не текст output log. Нужен снимок UI в момент рецидива.

## Root cause / Hypotheses

Причина исходного зависания пока не установлена. Подтверждённый дефект наблюдения — перепутаны три разных extension; это не доказывает дефект запуска нашего пакета.

Гипотезы проверяются только после рецидива: незавершённый bridge request, runtime/config error, не дошедший до error state, либо зависание относилось к другому extension. Выбирать между ними до логов запрещено.

## Fix plan

1. Активировать наш `kimiKaif.webview` во втором проекте и снять тот же набор свидетельств.
2. При рецидиве сопоставить время экрана с последним bridge request и console exception; внести один точечный фикс в реальный блокирующий путь.
3. Добавить regression-проверку, которая краснеет на исходной версии; прогнать affected tests, typecheck и VSIX startup.
4. Если рецидив не воспроизводится минимум на трёх разных входах, оставить баг открытым с честной охотой за шагами, а не объявлять исправленным по одному успешному запуску.

## Decisions made without the owner

Пока нет; заполняется при закрытии.

## Links

`plans/144` F4 · `plans/146` · `testcases/reports/2026-11-23_epic144-f3-quotas-steer-background.md` · `ConfigErrorScreen.tsx` loading branch.

kaif-fp: Kimi VS Code startup :: loading state never resolves :: v2.10
