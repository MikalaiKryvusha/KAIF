# План 150 — Эпик 147 K2: Auto Compact, AUTO STEER и настройки поведения

> **Создан:** 2026-11-23
> **Родитель:** `plans/147` K2 · `researches/52` §3.3–3.4
> **Статус:** 🟡 запланировано; старт после K1 и актуализации
> **Вовне:** —

**Вектор цели:** **Achieve + Avoid.** Дать пользователю настоящие переключатели vanilla/KAIF поведения без двух расходящихся источников конфигурации и без незащищённого OFF.

**Якорь мета-плана:** «Auto Compact, KAIF thresholds/projection/dormant hook, AUTO STEER ON/OFF и остальные опции».

## Критерии приёмки фазы

- Auto Compact live flip действует без reload/new session; ON разрешает vanilla auto paths и гасит KAIF context-window demands, OFF запрещает новые auto paths и восстанавливает closure контур.
- Thresholds 0–100 с defaults 70/75/80/90 сохраняются, проецируются до OFF и не затирают остальной marker; ошибка оставляет auto ON.
- AUTO STEER ON сохраняет accepted/race/rejected/media guarantees; OFF создаёт vanilla queue.
- Quota, steer, attention и closure options видны в settings и управляют реальным поведением; multi-view sync и write failure rollback работают.

## Операционные шаги

- [ ] **K2.0 Нулёвка.** Прочитать K1 суд, текущий engine config API и hook wiring.
- [ ] **K2.1 Auto Compact bridge.** Добавить narrow SetAutoCompact + initial getConfig + loopControl config-section subscription/dispose.
- [ ] **K2.2 Toolbar state.** Switch с pending/disable, подтверждением после persistence и rollback+visible error; engine config остаётся единственным authority.
- [ ] **K2.3 KAIF dormant ON.** Kimi context-window события молчат при `auto_compact != false`; diagnostics отличают dormant от not running; stale state не воскресает.
- [ ] **K2.4 Threshold settings.** Четыре manifest fields number 0–100, defaults 70/75/80/90 и явная негарантия других значений.
- [ ] **K2.5 Safe projection.** Найти project marker от session workDir, atomic merge, сохранить tokens/unknown fields; thresholds до `autoCompact=false`, fail-safe при ошибке.
- [ ] **K2.6 In-flight policy.** Реализовать/проверить отмену только auto operation либо оставить именованный release blocker; manual compaction не отменять случайно.
- [ ] **K2.7 AUTO STEER.** Добавить persisted extension option default ON; ON — hardened steerNow, OFF — existing enqueue с исходным text/media.
- [ ] **K2.8 Feature options.** Quota polling/render, attention и остальные KAIF additions получают named switches без изменения vanilla engine defaults.
- [ ] **K2.9 Tests/report/judge.** Engine live flip, hook mutants, bridge fail-safe, store race/queue и multi-view cases; обновить K3 план.

## Верификация

Гигиена: config persistence/deep merge, validation, failure ordering, ON/OFF store paths. Функциональный прогон: live session меняет режим без нового session id; wire подтверждает compaction/closure semantics. Полный soft→force путь остаётся K5.

## Риски

OFF без KAIF marker; in-flight compaction; глобальное отключение всех hooks вместо context-window; stale UI после внешнего config edit. Лечение — fail-safe, узкий dormant path и subscription.
