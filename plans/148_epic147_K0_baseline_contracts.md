# План 148 — Эпик 147 K0: baseline, контракты и красные проверки

> **Создан:** 2026-11-23
> **Родитель:** `plans/147` K0 · `researches/52`
> **Статус:** 🟡 готов к исполнению; актуализация против HEAD обязательна первым шагом
> **Вовне:** —

**Вектор цели:** **Maintain + Avoid.** До переноса UI зафиксировать official engine и написать проверки, которые краснеют на отсутствующих контрактах и возвращённых дефектах.

**Якорь мета-плана:** «Baseline, контракты и красные проверки… иначе перенос UI смешает старые и новые поведения и лишит проверок».

## Критерии приёмки фазы

- Official base `56145f849` и pinned reference `4298cb7f` записаны; diff не заменяет engine.
- Каждый заказанный control имеет строку inventory: UI → store → bridge → host → SDK/status → test.
- Red tests существуют для permission/Goal/Swarm/secondary model, language, Auto Compact live flip/dormant hook, AUTO STEER OFF, sound settings и theme tokens.
- Baseline affected tests/typecheck исполнены; исходные Windows failures названы отдельно.
- In-flight Auto Compact либо получает red test и решение, либо блокер выпуска записан явно.

## Операционные шаги

- [ ] **K0.00 Развернуть KAIF 2.10 до работы над extension.** В новом корне `D:/work/ai_sandbox/KIMI-KRINIK-VSCODE-EXTENSION` применить локальную сборку KAIF 2.10 из истока, подключить Kimi hooks/skills и проверить живой `/skill:resume`; не использовать опубликованную 2.9. Только после этого начинать K0.0.
- [ ] **K0.0 Актуализировать входы.** Сверить target HEAD, `researches/52`, прежние F2/F3 отчёты и рабочий diff; прочитать изменённый `pnpm-lock.yaml`.
- [ ] **K0.1 Зафиксировать official/reference inventory.** Список файлов и поведения каждого контура; отметить already present / surgical port / excluded.
- [ ] **K0.2 Прогнать baseline.** `pnpm --filter kimi-code-kaif typecheck` и affected extension tests; исходные failures сравнить с pristine только при необходимости.
- [ ] **K0.3 Написать shared/host red tests.** Permission mode, Goal objective/control, Swarm, secondary-model projection, raw context/status и language `en/zh/ru`.
- [ ] **K0.4 Написать behavior red tests.** Live `setConfig({loopControl:{autoCompact}})`, before/after/overflow, dormant KAIF ON, thresholds write-before-OFF, projection failure fail-safe.
- [ ] **K0.5 Написать webview red tests.** Toolbar actions, AUTO STEER ON/OFF, rollback, language default/switch, sound modal persistence, tooltip tokens.
- [ ] **K0.6 Проверить in-flight compaction.** Управляемо начать auto operation и выключить setting; записать наблюдение и не обещать cancellation без зелёного фикса.
- [ ] **K0.7 Отчёт и суд.** Создать семипольный run report; `/skill:fable-judge`; обновить K1 план по находкам.

## Верификация

Гигиена: названные red/green tests, typecheck, official-base guard. Функциональный прогон: только реально запущенные config/engine probes; остальное `NONE`, фаза не выдаёт себя за живую приёмку.

## Риски

Устаревший план после соседних правок; ложный red, не доходящий до нужного пути; случайное ослабление прежних steer/quota assertions. Лечение — named addressees и чтение фактического вывода.
