# План 152 — Эпик 147 K4: отдельное окно звуковых настроек

> **Создан:** 2026-11-23
> **Родитель:** `plans/147` K4 · слово владельца о sound settings
> **Статус:** 🟡 запланировано; старт после K3 и актуализации
> **Вовне:** —

**Вектор цели:** **Achieve + Maintain + Avoid.** Позволить пользователю видеть события Kimi harness, назначать каждому звук и громкость, не ломая chat при audio failure и не озвучивая replay.

**Якорь мета-плана:** «Отдельное окно звуков, event inventory, sound/volume persistence, replay/throttle/fail-open».

## Критерии приёмки фазы

- В меню шестерёнки есть Sound settings; отдельное modal window визуально следует образцу Accounts, но не переносит accounts.
- Event inventory содержит только реально достижимые события и человекочитаемое «когда происходит».
- Для каждого события сохраняются enable/sound/volume; preview слушается с выбранной громкостью.
- Новые approval/question/error и другие включённые события вызывают назначенный звук; replay 0, throttle работает, audio failure fail-open.

## Операционные шаги

- [ ] **K4.0 Нулёвка.** Прочитать K3 суд, текущий attention handler и реальный event stream.
- [ ] **K4.1 Event inventory.** Перечислить поддерживаемые события с источником в коде и observable trigger; не выдумывать события ради полного списка.
- [ ] **K4.2 Settings schema.** Определить versioned persisted map event→enabled/sound/volume, defaults совместимы с текущим attention behavior и volume bounds.
- [ ] **K4.3 Host/client persistence.** Добавить узкий bridge/config path с validation, broadcast и rollback; secrets не нужны.
- [ ] **K4.4 Sound modal.** Отдельное окно с event rows, description, sound selector, volume control, enable и preview; RU/ZH/EN strings включены.
- [ ] **K4.5 Menu entry.** Добавить Sound settings в шестерёнку и корректный focus/close path.
- [ ] **K4.6 Runtime dispatch.** Существующий attention contour читает настройки, выбирает звук/громкость и не дублирует replay/stale events.
- [ ] **K4.7 Fail-open.** rejected audio/play promise и unavailable asset не прерывают chat; ошибка видна в diagnostics без спама.
- [ ] **K4.8 Tests/report/judge.** Schema/bridge/modal/dispatch/replay/volume tests, затем живой звук по слову владельца; обновить K5 план.

## Верификация

Гигиена: persistence, bounds, event mapping, throttle/replay и recorded volume. Функциональный прогон: пользователь открывает modal, меняет звук/громкость, делает preview и вызывает безопасное реальное событие; прослушивание фиксирует владелец.

## Риски

Невозможность автоматически судить тембр; слишком широкий event list; autoplay restrictions. Лечение — preview и приёмка владельцем, только observed events, явный user gesture для preview.
