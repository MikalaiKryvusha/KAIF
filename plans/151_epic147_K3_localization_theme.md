# План 151 — Эпик 147 K3: EN/ZH/RU локализация и VS Code theme

> **Создан:** 2026-11-23
> **Родитель:** `plans/147` K3 · `researches/52` §3.2 и §3.5
> **Статус:** 🟡 запланировано; старт после K2 и актуализации
> **Вовне:** —

**Вектор цели:** **Achieve + Maintain.** Дать переключаемый English/中文/Русский интерфейс и тёмные VS Code-совместимые всплывающие поверхности без расхождения словарей и цветов.

**Якорь мета-плана:** «EN/ZH/RU catalog и перевод visible UI, language menu, tooltip/popover/theme tokens, computed RGB».

## Критерии приёмки фазы

- English default; меню шестерёнки содержит English, 中文, Русский с галочкой и сохранением выбора.
- Typed RU catalog покрывает каждый TranslationKey; visible UI нового и существующего chat не остаётся случайно английским.
- Переключение языка сразу rerender, включая stores/non-component strings и countdown; English fallback полон.
- Tooltip/arrow и все popover/menu surfaces используют VS Code tokens; computed body/root RGB = sidebar, снимок WebP предложен владельцу.

## Операционные шаги

- [ ] **K3.0 Нулёвка.** Составить inventory hardcoded strings после финального UI/K2.
- [ ] **K3.1 Config plumbing.** `kimi.language` default en, enum en/zh/ru, shared config, SetLanguage validation/host/client и broadcast.
- [ ] **K3.2 Reference i18n base.** Перенести translator/interpolation/useT/t и EN/ZH dictionaries без комментариев, запрещённых target lint.
- [ ] **K3.3 Русский catalog.** Написать `ru.ts: Record<TranslationKey,string>` от смысла интерфейса; сохранить термины Kimi/Goal/Swarm/Auto Compact/AUTO STEER.
- [ ] **K3.4 Language menu.** Встроить показанный блок в target ActionMenu; выбор сохраняется и отмечается галочкой.
- [ ] **K3.5 Перевести visible UI.** Header, composer, settings, dialogs, errors, status, tooltips, stores и managed countdown; не переводить user/model-generated content.
- [ ] **K3.6 Dictionary guards.** Runtime key-set equality, interpolation, fallback и default tests; missing keys = red.
- [ ] **K3.7 Tooltip class.** Заменить inverse foreground/background на `editorHoverWidget` tokens, включая arrow.
- [ ] **K3.8 Popover class.** Перевести shared popover/menu/dropdown/select/command surfaces на `menu`/editorWidget tokens без правки каждого consumer.
- [ ] **K3.9 Live colors.** Прочитать computed RGB body/root/sidebar/hover/popup; снять HDR WebP до/после, не добавлять лишний background override без измерения.
- [ ] **K3.10 Tests/report/judge.** i18n/component/theme checks + живой Second Side Bar render; обновить K4 план.

## Верификация

Гигиена: typed key parity, language bridge, component rerender и CSS token assertions. Функциональный прогон: пользователь меняет язык в меню и видит переведённый UI; hover/popup открыты и прочитаны на WebP, RGB измерены.

## Риски

Частичная локализация при скопированных словарях; слишком длинные RU labels; белый native title отличается от Radix tooltip. Лечение — inventory, responsive tests и раздельное название носителя hover.
