# План 149 — Эпик 147 K1: перенос KIMI FORK UI/UX

> **Создан:** 2026-11-23
> **Родитель:** `plans/147` K1 · `researches/52` §3.1
> **Статус:** 🟡 запланировано; старт после K0 и актуализации
> **Вовне:** —

**Вектор цели:** **Achieve + Maintain.** Дать KIMI KRINIK показанные панели KIMI FORK, сохранив более новые исправления target и реальные runtime-действия.

**Якорь мета-плана:** «Header, Working, status pills, composer toolbar, permission/Goal/Swarm/secondary-model, context+quota rings и combined model picker».

## Критерии приёмки фазы

- Header/session info, Working и live status pills соответствуют событию/состоянию сессии.
- Composer содержит всю заказанную панель; узкий Second Side Bar не прячет model/effort и stop/send.
- Permission, Plan, Goal, Swarm, secondary model и combined picker работают end-to-end; 0 неработающих controls.
- Context ring не вызывает `/compact`; прежние quota unavailable, attention, retry и hardened steer остаются зелёными.

## Операционные шаги

- [ ] **K1.0 Нулёвка.** Перечитать K0 суд и актуальный diff; обновить inventory.
- [ ] **K1.1 Shared contracts.** Добавить только используемые permission/goal/swarm/status/secondary-model поля и bridge validation.
- [ ] **K1.2 Host/runtime.** Провести permission с first prompt/before turn, Goal create/control/status, Swarm, context counts и secondary-model config; без engine downgrade.
- [ ] **K1.3 Stores.** Хирургически добавить состояние/rollback/queue semantics, сохранив target steer, media, attention, UUID и retry.
- [ ] **K1.4 Header и Working.** Перенести компоненты и их источники данных, видимое имя бренда — KIMI KRINIK.
- [ ] **K1.5 Status pills.** Queued/Changed/Background Bash/Sub Agents на реальных counts и панелях; не копировать reference `includeAttached`, которого target SDK не имеет.
- [ ] **K1.6 Composer controls.** Встроить reference components в target InputArea: attachment слева, permission/Plan/Goal/Swarm/robot, справа rings/model+effort/settings/stop-send.
- [ ] **K1.7 Secondary model.** Поддержать выбор существующих models и очистку `[secondary_model]`; custom providers исключены.
- [ ] **K1.8 Responsive.** Перенести/адаптировать width observer и overflow; проверить RU-длину позже без изменения engine behavior.
- [ ] **K1.9 Tests/report/judge.** Component + host + store tests, typecheck и изолированный smoke; обновить K2 план.

## Верификация

Гигиена: каждый control вызывает ожидаемый store/bridge method, host получает правильные params, status отображается из событий. Функциональный прогон: реальный Extension Host открывает панели и выполняет безопасные mode/config actions; полный Second Side Bar путь остаётся K5.

## Риски

Потеря target fixes при копировании; Goal queue конфликтует со steer; robot превращается в account/custom-provider перенос. Лечение — surgical diff, inventory и явный excluded scope.
