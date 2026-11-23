# Эпик 147 — KIMI KRINIK 1.0.0: официальный Kimi engine + KIMI FORK UI/UX + KAIF controls

> **Создан:** 2026-11-23
> **Родитель:** `researches/52` · `plans/144` · решения и новые сообщения владельца в текущем чате
> **Статус:** 🟡 PLANNING ACCEPTED владельцем 2026-11-23 15:36 +03:00; research завершён, реализация не начата
> **Вовне:** публичный KIMI KRINIK 1.0.0 и его VSIX — только после живых гейтов и авторизации выпуска; после релиза README EN/RU/CH с upstream credits; переименование GitHub-репозитория отдельно
> **Наследники:** `plans/148`–`154` — по одному операционному плану на фазу, как прямо заказал владелец

**Вектор цели:** **Achieve + Maintain + Avoid.** Собрать отдельный KIMI KRINIK 1.0.0, в котором свежий официальный Kimi engine/harness сохраняется, а проверенные UI/UX и улучшения KIMI FORK переносятся без регрессий. Дать владельцу рабочие Auto Compact и AUTO STEER режимы, управление контекстным закрытием KAIF, трёхъязычный интерфейс и настраиваемые звуковые уведомления. Не возвращать auto-compaction в защищённом OFF-режиме, потерю follow-up, белые hover или чужой старый engine.

## Критерии приёмки эпика

1. **Official core сохранён.** Scale: engine base и diff. Meter: manifest + git diff против official `56145f849`. Target: база не старше 2.7.2; reference не заменяет engine.
2. **Перенесённый UI функционален.** Scale: каждый control показанных header/status/composer панелей. Meter: component/host tests и Second Side Bar. Target: 0 декоративных кнопок; attachment, permission, Plan, Goal, Swarm, secondary model, model+effort, settings и stop/send выполняют реальные действия.
3. **Status виден по живым данным.** Scale: Working, Queued, Changed, Background Bash, Sub Agents и session header. Meter: события активной сессии. Target: значения и переходы соответствуют runtime; статичных фиктивных счётчиков нет.
4. **Auto Compact ON = vanilla.** Scale: автоматические compaction и KAIF closure demands. Meter: engine live flip + hook selftest + живой Extension Host. Target: engine auto paths разрешены, KAIF context-window dormant.
5. **Auto Compact OFF защищён.** Scale: before/after/overflow compaction и closure hooks. Meter: live flip без новой сессии + wire. Target: новых auto compaction 0; KAIF monitoring/soft/force контур активен; уже идущий auto compaction отдельно отменён либо честно назван непокрытым до выпуска.
6. **Thresholds настраиваются.** Scale: четыре поля. Meter: manifest validation и projection в `.kaif/kaif.json`. Target: warn/cut/close/force принимают числа 0–100, defaults 70/75/80/90, остальные marker fields сохраняются; ошибка projection оставляет auto ON; UI и docs прямо не гарантируют иные значения.
7. **AUTO STEER переключает реальный путь.** Scale: running Enter. Meter: Second Side Bar accepted/race/rejected/media cases. Target: ON — immediate steer, new queue 0, race exactly once, rejected rollback text+media; OFF — vanilla queue.
8. **KAIF additions опциональны.** Scale: quota display, automatic steer, attention и KAIF closure controls. Meter: Settings UI + live toggles. Target: каждая опция меняет заявленное поведение и не создаёт второй расходящийся persisted authority.
9. **Интерфейс трёхъязычен.** Scale: visible UI strings и language rows. Meter: typed dictionary parity + live menu. Target: English default, 中文, Русский; выбор сразу rerender и сохраняется; отсутствующих RU keys 0, EN fallback полон.
10. **Тема принадлежит VS Code.** Scale: computed RGB. Meter: Second Side Bar + WebP. Target: body/root RGB = sidebar; tooltip/popup/menu используют тёмные VS Code tokens, text/arrow читаемы; владелец принимает снимок.
11. **Звук настраивается по событиям.** Scale: поддерживаемые attention/runtime events. Meter: отдельное sound modal + recorded audio calls. Target: у каждого перечисленного события выбираются звук и громкость; replay молчит, duplicate throttle сохранён, audio failure не ломает chat.
12. **VSIX самодостаточна и обратима.** Scale: isolated install/rollback. Meter: built VSIX вне checkout. Target: KIMI KRINIK запускается рядом с official и reference, projects/sessions сохраняются, official rollback работает.
13. **Независимый суд.** Meter: `/skill:fable-judge` повторяет claims и живой путь. Target: VERIFIED либо релиз не выполняется.
14. **После релиза — трёхъязычная витрина.** Scale: README. Meter: опубликованный рендер. Target: EN → RU → CH, WebP screenshots, ссылки/благодарности MoonshotAI Kimi Code и gxgleo67 KIMI FORK, явная основа и будущая rebase-политика.

## Фазы и порядок

### K0 — Baseline, контракты и красные проверки (`plans/148`)

Сохранить official engine; зафиксировать diff-инвентарь reference/target; написать red tests для shared/host/store путей и живых режимов; решить in-flight Auto Compact по наблюдению. **Первая:** иначе перенос UI смешает старые и новые поведения и лишит проверок.

### K1 — UI-конвергенция (`plans/149`)

Header, Working, status pills, composer toolbar, permission/Goal/Swarm/secondary-model, context+quota rings и combined model picker. **Вторая:** опирается на контракты K0; не меняет Auto Compact/Steer semantics до отдельной фазы.

### K2 — Behavior controls и extension settings (`plans/150`)

Auto Compact, KAIF thresholds/projection/dormant hook, AUTO STEER ON/OFF и остальные опции. **Третья:** реальные host/config пути и отказоустойчивость важнее косметики; живой запрет compaction проверяется до звукового и визуального polish.

### K3 — Локализация и VS Code theme (`plans/151`)

EN/ZH/RU catalog и перевод visible UI, language menu, tooltip/popover/theme tokens, computed RGB. **Четвёртая:** переводит уже собранный UI, чтобы не переводить дважды удалённые controls.

### K4 — Sound settings (`plans/152`)

Отдельное окно звуков, event inventory, sound/volume persistence, replay/throttle/fail-open. **Пятая:** использует окончательные события и локализацию предыдущих фаз.

### K5 — Живая приёмка, суд и выпуск 1.0.0 (`plans/153`)

Second Side Bar, quotas/unavailable, steer race, soft→force, computed colors/WebP, isolated VSIX/rollback, changesets, суд и авторизованный GitHub Release. **Шестая:** только после зелёных функциональных контуров; `bugs/150–152` закрываются строго по своим наблюдениям.

### K6 — После релиза: README EN/RU/CH (`plans/154`)

Трёхъязычная витрина и WebP-снимки, upstream credits/provenance. **Последняя и после релиза:** прямое слово владельца; не задерживает выпуск проверенной 1.0.0.

## Гейты всего эпика

- Каждая фаза оставляет отчёт `testcases/reports/`, разделяет гигиену и функциональный прогон и закрывается судом до следующей.
- Новый страж доказан красным на названной pre-change версии или мутанте; существующие steering/attention/quota проверки не ослабляются.
- Никакого wholesale-copy `InputArea`, stores или reference engine; каждый перенос имеет inventory старого и нового пути.
- Секреты, account/custom-provider stack и голосовой агентский контур вне scope без нового слова владельца.
- Реальный мир: накопленные VS Code profile, shared Kimi config/sessions и Second Side Bar владельца обязательны для финальной приёмки.
- GitHub rename, push, Release и любые внешние публикации выполняются только с отдельной `AUTH:`; этот план сам авторизацией не является.
- Все операционные планы написаны сразу по прямому заказу владельца; перед стартом каждой фазы её план актуализируется нулёвым шагом против текущего HEAD и предыдущих судов.

## Риски

1. Reference engine старше target — снижается запретом wholesale replacement и official-base check.
2. Goal/Swarm/permission затрагивают session state — снижается host/status tests и живой очередью.
3. Auto Compact ON/OFF имеет два независимых исполнителя (engine и KAIF hook) — снижается единым config authority и dormant-path тестами.
4. RU labels шире EN/ZH — responsive layout проверяется в узком Second Side Bar.
5. HDR искажает снимки — WebP создаётся напрямую из screen capture и читается обратно; computed RGB остаётся объективной уликой.
6. Большой объём фаз может сменить детали после судов — операционные планы актуализируются нулёвым шагом, мета-контракт и решения владельца сохраняются.

## Решения, принятые без владельца

- `[OWNER]` Основной рабочий корень — `D:/work/ai_sandbox/KIMI-KRINIK-VSCODE-EXTENSION`; там создан git-клон нашего форка и привязан origin (прямое слово владельца в текущем чате). Временный `scratchpad/kimi-krinik` использовался только для baseline до этого решения.
- `[ИИ]` Custom providers/multi-account не переносятся: Accounts был назван образцом sound modal, не новым заказом account stack.
- `[ИИ]` Порядок фаз K0→K6 предложен агентом и принят владельцем вместе с постановкой эпика; содержание и границы могут уточняться судами без молчаливой смены видения.
