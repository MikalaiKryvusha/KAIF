# Исследование 51 — запрет auto-compaction в Kimi Code и закрытие чата до предела окна

> **Создан:** 2026-11-23 00:34 +03:00, сессия Kimi `session_4dfd62c8-c940-48cd-bf57-840364c96e7a`.
> **Родитель:** `bugs/150_DONE_kimi_closure_order_not_latched.md` (рецидив, баг переоткрывается) · `researches/50` §§6, 9, 11, 14 · решения №161, №164, №166 и новые решения владельца 2026-11-23.
> **Статус:** разведка прочитана по открытому исходному коду `MoonshotAI/kimi-code`, официальной документации хуков, живому wire и смежным issues; код не менялся.
> **Вовне:** ничего не отправлено. Существующая заявка upstream — https://github.com/MoonshotAI/kimi-code/issues/4299.

## 1. Слово владельца — требование

Дословно:

- «ОТКЛЮЧАЕМ ЭТО НАХУЙ!! У НАС ЭТО ЗАПРЕЩЕНО! У НАС ДЕЛАЕТСЯ ИЛИ МЯГКОЕ ЗАКРЫТИЕ ЧАТА ПО СООТВЕТСТВЮЩЕМУ НАВЫКУ, ИЛИ ФОРС ЗАКРЫТИЕ, ЕСЛИ ДОЛЖНО ВОЗИМСЯ С МОГЯКИМ ЗАКТРЫТИЕМ!!!!»
- «твой экстеншен - опен соурс. Если нужно, делаем форк, в нём отключаем это и ставим НАШ ФОРК в мой VS CODE»
- Ранее в том же инциденте: «снизить все четыре ступени на 5 процентных пунктов: 70 / 75 / 80 / 90 % вот так».

Следствие: прежнее решение №164 D1 «собственный порог Kimi не трогаем» пересмотрено. Требуемое поведение KAIF — не отложенное автосжатие, а его отсутствие на автоматических путях; предел окна обрабатывается мягким или форс-закрытием. Форк и установка собранного из него расширения разрешены владельцем.

## 2. Что произошло в живой сессии

Источник: `C:/Users/krinik/.kimi-code/sessions/wd_kaif_75e6656bac87/session_4dfd62c8-c940-48cd-bf57-840364c96e7a/agents/main/wire.jsonl`.

1. Wire 1977: `token_counting.measured = 778194`; точка compaction по конфигурации — 891289. Это 87 % ранней шкалы KAIF.
2. Wire 1979–1982: два обычных `Read` отклонены, причина требует `/skill:end-chat-soft`. Этот кусок исправления bugs/150 действительно сработал.
3. Wire 1990: вызван `Skill(end-chat-soft)`. В текущей реализации это записывает `st.closing`, после чего инструменты закрытия разрешены.
4. Wire 2165: доставлена ступень 92 % на 820897/891289. Но это был одноразовый `pending`, не постоянный force-latch: существующий `st.closing = soft` делал `demand = required && !st.closing` ложным.
5. Wire 2365: по прямому слову владельца вызван `Skill(end-chat-force)`. После входа `st.closing = force` снова разрешил все инструменты без машинного ограничения их числа, назначения или оставшегося бюджета.
6. Wire 2375–2465: работа продолжилась; измеренное окно выросло 880019 → 890426. Последний замер был доступен хуку, но отказов уже не было.
7. Wire 2474: `context.apply_compaction`, `tokensBefore = 1258482`, `tokensAfter = 46780`, `compactedCount = 592`. Коммит `8d8fbe8` был создан и запушен до сжатия, но требование «не доходить до compaction» нарушено.

Снимок владельца с **84,9 % Context** согласуется с последним измерением: 890426 / 1048576 ≈ 84,94 %. Расхождения шкал здесь нет. `tokensBefore` больше, потому что движок считает не только последний provider measurement.

## 3. Корневая причина в KAIF

### 3.1. Latch охраняет вход в закрытие, но не его завершение

`framework/hooks/context-window.mjs`:

```js
if (required && closing) { st.closing = closing.kind; delete st.pending; }
const demand = required && !st.closing ? closureDemand(required, used, win, cw) : '';
```

После одного вызова закрывающего навыка `st.closing` непустой. Поэтому любые следующие обычные инструменты проходят, пока новый человеческий промпт не удалит `st.closing`. Текст «after entering it, finish the closure and take no new task» — только проза; машинный контур её не обеспечивает.

### 3.2. Soft-entry подавляет эскалацию в force

Проверка не сравнивает `st.closing` с текущим `required`. Состояние `soft` удовлетворяет условие «какое-то закрытие уже начато», даже когда измерение требует `force`. Поэтому живая ступень 92 % не стала постоянным требованием `/skill:end-chat-force`.

### 3.3. Счётчик Kimi шире последнего `token_counting.measured`

В `fullCompactionService.ts` движок берет максимум из полного estimated request и usage-anchored значения:

```ts
const estimated = this.requestTokens(messages);
const usageAnchored = this.usageAnchoredRequestTokens(messages);
return usageAnchored === undefined ? estimated : Math.max(estimated, usageAnchored);
```

Usage-anchored путь добавляет к последнему usage оценку всех сообщений после него. Полный request включает system prompt и tools. Поэтому `tokensBefore = 1258482` не противоречит UI 84,9 % и последнему measured 890426. Это отдельный риск запаздывания KAIF, но НЕ оправдание данного рецидива: measured уже был 890426, а latch разрешал работу.

Оценка текста в `llm-adapter/contract/tokens.ts`:

```ts
return Math.ceil(counts.ascii / 4) + counts.nonAscii;
```

Кириллица и другие не-ASCII символы оцениваются по символу на токен. Наш сторож обязан учитывать оценённый хвост или оставлять резерв, а не считать последний provider measurement полным внутренним счётчиком.

## 4. Что подтвердил открытый код Kimi Code

### 4.1. Расширение использует общий движок

Официальный `apps/vscode/README.md`:

> “The extension runs the Kimi Code Node SDK in the VS Code Extension Host.”

> “they share `config.toml`, MCP configuration, login state, and sessions.”

Источник: https://github.com/MoonshotAI/kimi-code/blob/main/apps/vscode/README.md

`CONTRIBUTING.md` называет `apps/vscode` расширением, `packages/node-sdk` публичным SDK и `packages/agent-core-v2` движком. Источник: https://github.com/MoonshotAI/kimi-code/blob/main/CONTRIBUTING.md

Вывод: правка только webview или процента в панели не отключит compaction. Общий путь живет в `packages/agent-core-v2/src/agent/fullCompaction/`.

### 4.2. Автоматических путей несколько

`strategy.ts`:

```ts
return (
  usedSize >= this.maxSize * this.config.triggerRatio ||
  this.shouldUseReservedContext(usedSize)
);
```

Источник: https://github.com/MoonshotAI/kimi-code/blob/main/packages/agent-core-v2/src/agent/fullCompaction/strategy.ts

`fullCompactionService.ts` вызывает auto-compaction:

- в `beforeStep()` через `checkAutoCompaction()`;
- в `afterStep()`, когда `checkAfterStep` истинно;
- в `recoverFromContextOverflow()` после ошибки переполнения.

Источник: https://github.com/MoonshotAI/kimi-code/blob/main/packages/agent-core-v2/src/agent/fullCompaction/fullCompactionService.ts

Поэтому выключатель обязан закрывать и пороговые проверки, и overflow recovery. Запрет только `beforeStep()` оставит два обходных пути.

### 4.3. Существующий конфиг не умеет отключать compaction

`loop/configSection.ts`:

```ts
reservedContextSize: z.number().int().min(0).optional(),
compactionTriggerRatio: z.number().min(0.5).max(0.99).optional(),
```

Источник: https://github.com/MoonshotAI/kimi-code/blob/main/packages/agent-core-v2/src/agent/loop/configSection.ts

`reserved_context_size = 0` отключает только одну ветку OR. `compaction_trigger_ratio = 0.99` лишь переносит порог. Значение 1.0 схема не принимает. Даже 0.99 не отключает overflow recovery.

### 4.4. Хук не может отменить PreCompact

Официальная документация:

> “Only **blockable events** (`PreToolUse`, `Stop`, `UserPromptSubmit`) have return values that affect the main flow.”

> “`PreCompact` … Triggered before context compaction begins; return values are completely ignored”

Источник: https://github.com/MoonshotAI/kimi-code/blob/main/docs/en/customization/hooks.md

В `agentExternalHooksService.ts` PreCompact запускается через observation-only `runner.trigger`; ветки вето нет. Источник: https://github.com/MoonshotAI/kimi-code/blob/main/packages/agent-core-v2/src/features/externalHooks/agent/agentExternalHooksService.ts

Вывод: обещание «отключим compaction хуком» технически невозможно на текущем контракте. Хук может закрывать работу заранее и блокировать введенный текст `/compact`, но не может запретить движку автоматический PreCompact.

### 4.5. UI показывает долю полного окна

`apps/vscode/src/runtime/event-adapter.ts` передает `sdkEvent.contextUsage`; запасной путь делит `contextTokens / maxContextTokens`. Источник: https://github.com/MoonshotAI/kimi-code/blob/main/apps/vscode/src/runtime/event-adapter.ts

Поэтому 84,9 % на снимке — доля 1048576, а KAIF 99,9 % — доля ранней точки 891289. Для владельца в сообщениях следует показывать обе шкалы там, где возможна путаница.

## 5. Сырая база знаний — существующие заявки и индустрия

### Kimi Code #4299 — OPEN, комментариев нет

https://github.com/MoonshotAI/kimi-code/issues/4299

> “reserved_context_size = 0 does NOT disable it; the ratio trigger … fires independently.”

> “At 0.99 the only remaining path is the overflow-recovery compaction … which no config reaches.”

> “Hooks cannot block it: PreCompact is observation-only.”

Предложение заявки: `auto_compact = false` под `[loop_control]`, охватывающее все автоматические пути; ручной `/compact` сохранить. Наше требование строже в части продукта владельца: KAIF не использует compaction как замену закрытию.

### Qwen Code #12597 — OPEN, подробная инженерная трассировка

https://github.com/QwenLM/qwen-code/issues/12597

В обсуждении названы три разных места: дешевый auto gate, hard-tier rescue и reactive overflow recovery. Дословно из комментария с проверкой кода:

> “No value in (0, 1] removes the auto tier or the hard tier.”

Предлагаемый индустриальный паттерн: отдельный boolean `context.autoCompaction.enabled`, по умолчанию true; явные гейты на каждом автоматическом пути; ручная команда отделена; документированная цена — при переполнении провайдер вернет ошибку, если reactive recovery тоже отключен.

### Claude Code #42149 — CLOSED по неактивности, не как реализованное

https://github.com/anthropics/claude-code/issues/42149

> “The only available setting is `autoCompactWindow` … controls *when* compaction triggers but not *whether* it triggers.”

Антипаттерн: считать максимальный threshold выключателем.

### OpenAI Codex #11716 — CLOSED как дубликат #4106

https://github.com/openai/codex/issues/11716

> “keeping auto-compaction enabled by default is reasonable—but advanced users should have an explicit opt-out switch and clear documentation of the tradeoffs.”

Общий индустриальный вывод: явный opt-out, значение по умолчанию не меняет поведение остальных пользователей, ручной и автоматический запуск разводятся, overflow semantics документируются.

## 6. Что должно быть исправлено в каждом слое

### Агент

- Никогда не вызывать `/compact` как способ продолжить текущий чат.
- После `/skill:end-chat-soft` не начинать новую работу; после `/skill:end-chat-force` выполнять только короткую эстафету, сохранение, разрешенные commit/push и прощание.
- На force не запускать сборку, полигон, суд или новую диагностику. Их долг записывается в STATUS.
- При сообщении о PreCompact считать инцидент уже случившимся: не «повторить закрытие», а зафиксировать дефект и восстановить эстафету.

### Хук KAIF

- Пороги Kimi: 70 / 75 / 80 / 90 % от compaction point, как решил владелец.
- `required = force` обязан превосходить `st.closing = soft`; требуется повторный вход в `end-chat-force`.
- Сам вызов closing skill не должен открывать неограниченную обычную работу. Нужен узкий набор операций эстафеты и повторный force-отказ за ее пределами; отдельный тест должен воспроизводить текущий живой путь soft → force → десятки обычных вызовов → compaction.
- PreCompact — аварийный observation и постоянный маркер нарушения, но не veto: платформа veto не поддерживает.
- Нельзя сбрасывать запрет compaction как «успешное PostCompact»: для KAIF это зафиксированный сбой, даже если движок продолжил сессию.

### Форк Kimi Code / движок

- Добавить явный `[loop_control] auto_compact = false` (имя совпадает с существующей заявкой #4299).
- Значение по умолчанию — true, чтобы upstream-поведение не менялось для остальных.
- При false не запускать threshold auto-compaction ни перед, ни после шага.
- При false не запускать `recoverFromContextOverflow()` как compaction; вернуть понятную ошибку предела окна вместо молчаливой сводки.
- Не подменять отключение локальным усечением истории: это та же потеря контекста другим способом.
- Ручной `/compact` в форке можно оставить для общего upstream-контракта, но KAIF обязан блокировать его как рабочий путь; отдельное правило владельца о полном удалении ручной команды не требуется для запрета AUTO-compaction.
- VS Code ставится из сборки того же форка, чтобы `agent-core-v2` в Extension Host содержал выключатель. Изменение одного webview недостаточно.

## 7. Рекомендуемая форма решения

Два независимых рубежа, оба обязательны:

1. **KAIF закрывает чат раньше:** исправленный latch + 70/75/80/90 % + дисциплина агента. Это основной пользовательский путь.
2. **Форк запрещает автосжатие:** `auto_compact = false` закрывает все автоматические пути. Это последний рубеж на случай ошибки агента или хука.

Цена второго рубежа: если оба закрытия не выполнены и окно исчерпано, Kimi покажет ошибку контекста вместо автосжатия. Это соответствует слову владельца: потерянный ход с сохраненным verbatim wire предпочтительнее незаметной подмены истории сводкой.

Отклоненные варианты:

- `compaction_trigger_ratio = 0.99` — не отключение, оставляет overflow recovery.
- Только PreCompact hook — return values игнорируются.
- Только более ранние проценты — уменьшают вероятность, но не запрещают событие.
- Только правка VS Code UI — движок останется прежним.
- Молчаливая обрезка tool output/истории — воспроизводит потерю контекста под другим именем.

## 8. Открытые технические вопросы для фазы реализации

Это не вопросы видения владельцу; решаются кодом и прогоном форка:

- Точная сборка и установка VSIX на Windows с сохранением официального расширения как пути отката.
- Какие поля SDK status доступны hook-наблюдателю для оценки внутреннего estimated count; если недоступны — отдельный консервативный meter на wire.
- Как сделать разрешенный набор инструментов force-закрытия узким, не заблокировав STATUS/FAREWELL и разрешенный git commit/push.
- Обновление форка вслед за upstream: pinned base SHA, минимальный diff, повторяемый скрипт сборки и тест одного и того же выключателя на каждом обновлении.

## 9. Дополнение — существующий форк с квотами (слово владельца 2026-11-23)

Владелец передал https://github.com/gxgleo67/kimi-code-vscode-fork и написал: «и там уже есть одного человека форм с большим числом наворотов - можно от него форк делать, чтобы ещё мне окна пятичасовые показывало в экстеншене.»

Проверено по README, коммитам и исходникам:

- Репозиторий — извлеченная самостоятельная копия (`isFork = false`), не git-fork монорепозитория Moonshot; расширение и необходимые внутренние пакеты сохранены.
- `apps/vscode/package.json`: версия расширения 0.9.23, лицензия Apache-2.0.
- Последний push — 2026-10-16; README называет синхронизацию с официальным CLI 2.2.0 / PR #4230. У владельца установлен Kimi Code 2.7.2. Целиком брать эту базу сейчас = откатить движок на пять недель и несколько минорных версий.
- Пятичасовые окна подтверждены кодом, не только README: `apps/vscode/shared/managed-usage.ts` описывает `limit5h`, `limit7d`, `monthTotal`, `monthCode`, reset timestamps и выбор 7-day/monthly secondary window.
- `apps/vscode/webview-ui/src/components/UsageStatusBar.tsx` опрашивает managed usage раз в 60 секунд, рисует внешнее кольцо 5h и внутреннее 7d/monthly, показывает проценты и countdown в tooltip.
- Дополнительно есть мультиаккаунты и custom providers. Они увеличивают blast radius и не нужны для выполнения конкретной просьбы «показывало окна пятичасовые»; переносить их без отдельной надобности не следует.
- Его `ContextRing` по клику отправляет `/compact`. В нашей сборке этот жест нельзя переносить без изменения: он противоречит правилу закрытия KAIF.

Источники:

- https://github.com/gxgleo67/kimi-code-vscode-fork
- https://github.com/gxgleo67/kimi-code-vscode-fork/blob/main/apps/vscode/shared/managed-usage.ts
- https://github.com/gxgleo67/kimi-code-vscode-fork/blob/main/apps/vscode/webview-ui/src/components/UsageStatusBar.tsx
- https://github.com/gxgleo67/kimi-code-vscode-fork/commits/main

Решение по архитектуре: база нашего форка — свежий `MoonshotAI/kimi-code`; из `gxgleo67` переносится только квотный контур 5h + 7d/monthly с его тестами и атрибуцией Apache-2.0. Это сохраняет свежие исправления движка и дает запрошенные окна. Прямой fork-of-fork технически недоступен как штатная связь, потому что исходный репозиторий сам не является git-fork upstream.

## 10. Выбор базы нашего форка

Владельцу были показаны три варианта: свежий официальный + модули, gxgleo67 + выключатель, обновление gxgleo67. Выбран **«Официальный + модули»**. Это решение владельца, не рекомендация агента, принятая за него.

Дополнительная проверка прямого патча gxgleo67 показала его техническую возможность: `loop/configSection.ts` и три пути в `fullCompactionService.ts` совпадают по смыслу с upstream. Но выбранный маршрут сохраняет свежий движок; сторонний репозиторий служит источником модулей и тестов.

## 11. Follow-up во время работы Kimi — автоматический steer

Владелец добавил требование дословно: «чтобы каждый раз, когда я пишу фолоуап в чат, пока KIMI думает - чтобы оно не ставилось в очередь, с сразу отправлялось как инжект в чат … Insert now чтобы автоматически срабатывал по отправке любого фолоу апа, пока КИМИ думает».

Официальная документация подтверждает существование нужного механизма:

- Kimi Code 2.7.0 changelog: “Add a Follow-up behavior setting under `/settings`; choose Steer to make Enter steer your message into the running turn instead of queueing it.” https://www.kimi.com/code/docs/en/kimi-code-cli/changelog.html
- Interaction guide: “Enter: queue the message; pick Steer under /settings → Follow-up behavior to inject it into the running turn instead; Ctrl-S: inject …” https://www.kimi.com/code/docs/en/kimi-code-cli/guides/interaction.html
- `tui.toml`: `follow_up_behavior = "queue" | "steer"`. https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/config-files.html

В официальном VS Code extension уже есть полный host path: `chat.handler.ts` → `steerChat` → `runtime.steer(params.content)` → `session.steer()` → `SteerInput` event. Источник: https://github.com/MoonshotAI/kimi-code/blob/main/apps/vscode/src/handlers/chat.handler.ts

Очередь возникает в webview `chat.store.ts`: при `isStreaming` `sendMessage()` вызывает `get().enqueue(content, currentModel)`. Источник: https://github.com/MoonshotAI/kimi-code/blob/main/apps/vscode/webview-ui/src/stores/chat.store.ts

В gxgleo67 уже есть ручной `steerNow(text)` для Ctrl/Cmd+Enter. Он вызывает `bridge.steerChat(content)`, при успехе очищает media draft, при `ok: false` (гонка завершения хода) использует обычный send; host echo `SteerInput` создает inline bubble. Источник: https://github.com/gxgleo67/kimi-code-vscode-fork/blob/main/apps/vscode/webview-ui/src/stores/chat.store.ts

Следствие для нашего форка: обычный Enter во время `isStreaming` должен автоматически идти по этому же существующему steer path, без специальной клавиши. Нужны отдельные проверки:

- один и несколько follow-up доходят в исходном порядке;
- queue length остается 0;
- `SteerInput` появляется до terminal event текущего хода;
- при гонке завершения сообщение отправляется как новый ход ровно один раз, без рекурсивного steer↔send fallback;
- ошибка steer видна и текст не исчезает молча;
- media ContentPart сохраняются;
- stopping/compacting не выдаются за обычный running turn; auto-compaction у нас вообще запрещено;
- очередь, накопленная до обновления, не смешивается задним числом с новыми steer-сообщениями.

У Claude Code поведение зависит от клиента: CLI docs описывает queue, desktop docs разрешает redirect correction без остановки. Это не меняет требование владельца и не требуется для реализации, потому что у Kimi уже есть native steer. Источники: https://docs.anthropic.com/en/docs/claude-code/interactive-mode и https://docs.anthropic.com/en/docs/claude-code/desktop

Владелец отдельно сообщил о живом дефекте границы: follow-up иногда не отправляется, исчезает из поля ввода и сопровождается верхним диалогом ошибки. Заведён `bugs/151_kimi_followup_steer_race_loses_input.md`. Reference `steerNow` подтверждает риск по коду: `catch` делает toast без rollback composer, а fallback `sendMessage(text)` теряет собранные media. Автоматический steer принимается только вместе с red repro и исправлением этих путей, а не с переносом их в наш форк.

## 12. Тёмный фон нашего extension — цвет темы VS Code

Владелец добавил: «цвет фона экстеншена нашего нужно изменить на темный цвет темной темы VS COde - он не такой тёмный, как КИМИ, а суть более серый». На приложенном снимке цель — фон боковой панели VS Code слева; официальный Kimi webview справа темнее.

В официальном `apps/vscode/webview-ui/src/styles/index.css` причина видна прямо: `.dark` задает `--background: oklch(0.141 0.005 285.823)`, а `body` применяет `background-color: var(--background)` и `@apply bg-background`. Сторонний форк наследует ту же базовую схему. Источники: https://github.com/MoonshotAI/kimi-code/blob/main/apps/vscode/webview-ui/src/styles/index.css и https://github.com/gxgleo67/kimi-code-vscode-fork/blob/main/apps/vscode/webview-ui/src/styles/index.css

Для нашего форка основной фон body/root должен читать `var(--vscode-sideBar-background)` с `var(--vscode-editor-background)` fallback, а не фиксированный oklch. Нельзя молча назначить тот же цвет всем card/popover/input: это сотрет границы поверхностей. Приёмка — computed RGB пустого webview равен RGB sidebar в теме владельца, снимок с различимыми карточками/полями/текстом и визуальное одобрение владельца.

## 13. План

Мета-план: `plans/144_EPIC_kimi_no_auto_compaction.md`; ближайшая фаза — `plans/145_epic144_rnd_fork_and_disable_switch.md`. Автоматический steer, квоты и VS Code theme background включены в F3 нашего форка, их R&D-карты — в F1.
