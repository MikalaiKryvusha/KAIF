# Исследование 52 — KIMI KRINIK: конвергенция официального движка и KIMI FORK UI/UX

> **Создан:** 2026-11-23
> **Родитель:** слово владельца в текущем чате · `researches/51` · `plans/144` · `plans/146`
> **Статус:** разведка исходников и живого VS Code выполнена 2026-11-23 15:36 +03:00; код нового эпика ещё не изменён
> **Вовне:** после релиза 1.0.0 — README EN/RU/CH со ссылками и благодарностями официальному Kimi Code и KIMI FORK; переименование GitHub-репозитория требует отдельного исполнения

## 1. Требования владельца

Дословные носители решений — сообщения текущего чата:

- «нащ форк в табе пусть называется KIMI KRINIK».
- «Английский отсается языком по дефолту»; блок LANGUAGE / 语言 в меню шестерёнки получает English, 中文 и Русский.
- Нижняя панель KIMI FORK переносится целиком, включая вложения, YOLO, Plan, Goal, Swarm, subagent model, кольца квот/контекста, модель+усилие, настройки и stop/send.
- Верхняя панель сессии, Working…, Queued / Changed / Background Bash / Sub Agents переносятся из KIMI FORK.
- Auto Compact: ON = vanilla; OFF = полный запрет автоматического compaction и работа KAIF context-window/closure. Четыре поля 0–100, defaults 70/75/80/90; иные значения не гарантируются.
- AUTO STEER: ON = обычный Enter во время running turn сразу отправляет steer; OFF = vanilla queue.
- Звуки: отдельное окно из меню шестерёнки; перечень событий harness, назначаемый звук и громкость каждого события. Голос агентов остаётся вне extension.
- Архитектурная граница: «Важное ЯДРО ЛОГИКИ И ФУНКЦИОНАЛА ХАРНЕСА KIMI — берём от Оригинального экстеншена KIMI»; UI/UX и улучшения — из KIMI FORK.
- README после релиза 1.0.0: EN → RU → CH, WebP-скриншоты, благодарности обоим источникам и явная provenance/rebase-строка.
- Основной живой путь владельца — Second Side Bar. Скриншоты Windows HDR сохраняются в WebP, JPEG только если WebP недоступен.

Открытых развилок видения для продолжения кода нет. Переименование репозитория — вопрос владельца, а не исполненное действие; оно возможно, но ждёт отдельного приказа.

## 2. Внешняя правда и индустриальные источники

1. Официальный Kimi Code — база движка и harness: https://github.com/MoonshotAI/kimi-code. Наш target стоит на official 2.7.2, upstream SHA `56145f849`; не откатывать его до старого reference engine 2.2.0.
2. KIMI FORK — источник UI/UX и модулей: https://github.com/gxgleo67/kimi-code-vscode-fork, pinned `4298cb7f0cbe25afc147bd7b2aaca8ae39b71390`, Apache-2.0. Локальный снимок — `scratchpad/kimi-reference`.
3. VS Code Webview API: https://code.visualstudio.com/api/extension-guides/webview. Webview получает классы `vscode-light/dark/high-contrast`, а theme colors доступны как CSS variables `var(--vscode-...)`.
4. VS Code Theme Color Reference: https://code.visualstudio.com/api/references/theme-color. Для всплывающих поверхностей существуют `menu.*` и `editorHoverWidget.*`; фон sidebar — `sideBar.background`.
5. Существующая заявка upstream об auto-compaction: https://github.com/MoonshotAI/kimi-code/issues/4299. Разведка `researches/51` §5 подтверждает необходимость отдельного выключателя всех auto paths, а не threshold 0.99 или observation-only PreCompact.

Антипаттерны, которые эпик не повторяет: wholesale-copy старого reference InputArea/store поверх новых исправлений target; декоративные кнопки без host/SDK пути; второй persisted источник истины для Auto Compact; click-to-compact на context ring; молчаливый custom-provider/multi-account перенос; объявление исправления `bugs/152` по успешному запуску без рецидива.

## 3. Локальная разведка target и reference

Основной рабочий target — `D:/work/ai_sandbox/KIMI-KRINIK-VSCODE-EXTENSION`, создан по прямому слову владельца как git-клон `https://github.com/MikalaiKryvusha/kimi-code.git`, branch `kaif/no-auto-compaction`, origin уже привязан. До этого базовая разведка и пробная установка зависимостей выполнялись во временном `scratchpad/kimi-krinik`, commit `3e9798fee`; Node 24.15.0 / pnpm 10.33.0. Основной каталог добавляется в текущую Kimi-сессию через `/add-dir`, потому что Bash-tool первоначально ограничен корнем KAIF.

### 3.1. UI-контуры

- Нужная нижняя панель — не `BottomToolbar.tsx`, а row `reference/.../inputarea/InputArea.tsx:455–504`.
- Target уже имеет functional attachment, Plan, model/effort (раздельно), quota rings, settings и stop/send. Нельзя заменять весь InputArea: target содержит более новые React Query file search, model refresh, attention, retry/rollback и hardened quota handling.
- YOLO требует shared permission type, SetPermissionMode, stream params, runtime method/status и reverse legacy mapping. Engine support уже есть в `packages/node-sdk/src/session.ts`.
- Goal и Swarm поддержаны SDK/core. Goal требует objective на первом prompt, control/status и очередь busy goal; Swarm — host control и status. Нельзя переписать существующие steer/attention/retry пути wholesale.
- Robot — `SubagentModelDialog`, редактирование `[secondary_model]`; custom-provider section в минимальный перенос не входит.
- ModelPicker/ModelPickerDialog объединяют model+effort; target store уже содержит нужные update/select методы.
- Context ring требует `context_tokens/max_context_tokens` в StatusUpdate/event adapter; click-to-compact из reference исключён решением владельца.
- Header/status pills/Working имеют реальные host/store источники и переносятся вместе с ними; conditional Background Bash / Sub Agents не копируются как статичный текст.

### 3.2. Локализация

Reference имеет `webview-ui/src/i18n/{index,en,zh}.ts`, typed `TranslationKey`, interpolation и reactive `useT`; default `language: "en"`. Меню — `ActionMenu.tsx:234–253`. В reference 488 translation calls в 40 component files: копирование словарей без замены hardcoded target strings не даст полной локализации. Для KIMI KRINIK добавляется `ru.ts: Record<TranslationKey,string>`, а EN остаётся полной fallback- и default-группой. Namespace настроек target — `kimi`, не `kimifork`.

### 3.3. Auto Compact и KAIF thresholds

- Engine уже имеет `[loop_control] auto_compact`, default ON; guards закрывают before/after/overflow при false, manual compaction остаётся отдельным путём.
- `harness.setConfig({loopControl:{autoCompact}})` делает deep merge и сохраняет user config; активная сессия читает config при следующем решении compaction, reload не нужен.
- ON недостаточно для vanilla, пока KAIF hook продолжает блокировать работу. Kimi-ветка `framework/hooks/context-window.mjs` обязана быть dormant при `auto_compact != false`; OFF восстанавливает текущий контур.
- Четыре VS Code settings проецируются в существующий `.kaif/kaif.json → contextWindow`, сохраняя прочие поля и `tokens`. Запись thresholds идёт ДО выключения auto compact; ошибка записи оставляет auto ON. Некорректный JSON не перезаписывается.
- В non-KAIF проекте OFF нельзя называть защищённым closure-режимом. In-flight auto compaction требует отдельной проверки: до доказательства cancellation контракт формулируется как запрет новых auto operations.

### 3.4. Auto Steer

Target `chat.store.ts` уже направляет running Enter в hardened `steerNow`; `ok:false` запускает exactly-once idle fallback, rejected Promise возвращает text/media. Новый toggle лишь выбирает между этим путём и существующим `enqueue`; он не должен вернуть потерю media, рекурсию или изменить старые queue entries. Default ON соответствует уже принятому поведению форка.

### 3.5. Theme и живой стенд

Белый hover доказан снимком `testcases/reports/2026-11-23_kimi-krinik-secondary-sidebar.webp`: shared tooltip использует `bg-foreground text-background`, а dark foreground почти белый. Класс закрывается VS Code `editorHoverWidget` tokens; popover/dropdown класс — `menu` tokens. Body/root уже используют `var(--vscode-sideBar-background, var(--vscode-editor-background))`; до новых overrides нужны computed RGB.

`bugs/152`: сначала активный KIMI FORK оказался `gxgleo`, не нашим пакетом. Наш 1.0.0 затем трижды успешно запущен: sidebar KAIF, sidebar второго проекта, editor tab. Все initial bridge calls `ok=true`; зависание не воспроизведено, код не менялся, баг остаётся OPEN.

## 4. Следствия для эпика

1. Перенос идёт связанными контурами поверх target, не заменой target reference-версией.
2. Сначала shared contracts + host/runtime + red tests, затем webview components; каждый видимый control имеет реальный путь.
3. Engine auto_compact остаётся единственным persisted authority; VS Code switch синхронизируется через config events и откатывается при ошибке записи.
4. Локализация доводится до всего показанного UI, не только до новых кнопок; typed dictionaries обязаны иметь одинаковый key set.
5. Звуковое окно строится на существующем attention/event contour; replay history молчит, громкость и звук настраиваются по событию, ошибка звука не ломает chat.
6. Живая приёмка выполняется в Second Side Bar: оба toggles, гонка steer, queue fallback, квоты, computed RGB, hover/popup и WebP-снимки.
7. Репозиторий не переименовывается и релиз не публикуется без отдельного авторизованного действия; README после релиза сохраняет EN → RU → CH и upstream credits.

## 5. Открытые технические ограничения (не вопросы владельцу)

- In-flight Auto Compact cancellation проверяется тестом; запрещено обещать его до наблюдения.
- Reference custom providers, multi-account и auth facade user-info не входят без отдельного слова; Accounts служит только образцом sound modal.
- `includeAttached` background tasks и atomic config-section facade отсутствуют в target SDK; использовать существующий API либо отдельно обоснованный минимальный adapter.
- Только defaults 70/75/80/90 гарантируются; hook сейчас трактует 0 как unset, поэтому поле допускает ввод 0, но не обещает рабочий режим с ним.
