# Исследование 50 — как устроен харнес Kimi Code и модель Kimi K3.1 Pro

> **Создан:** 2026-11-21 (сессия 104, Claude Opus 5.5; слово владельца в чате 2026-11-21 16:35 +03:00 (по часам хука на промпте): «иди в интернет в разведку, как устроен харнес KIMI,
> как работает KIMI K3.1 PRO и пиши конспект» · «и потом план. как KAIF под KIMI адаптировать»).
> **Родитель:** `plans/136` критерии 37–39 · `plans/143` · `researches/48` (первая адаптация, её не повторяем) · решение №162.
> **Статус:** 🟢 живой справочник — разведка 2026-11-21 16:54 +03:00: документация (два разведчика, цитаты сверены выборочно по файлам) и код Kimi Code
> (разведчик кода; матчер и порог сжатия сверены лично по клону и по установленному `dist/main.mjs`), модель — по карточке вендора.
> **Вовне:** план адаптации KAIF под Kimi (следующий документ); тикетов наружу нет.

## 0. Откуда правда

| Источник | Что это | Как снято |
|---|---|---|
| Клон `MoonshotAI/kimi-code` | открытый код и документация харнеса (MIT, TypeScript), HEAD `83e4dde` 2026-11-20 | `git clone --depth 1` во временный каталог; читалось как текст, ничего не запускалось |
| Установленный Kimi Code | npm-пакет `@moonshot-ai/kimi-code` 2.7.2, один бандл `dist/main.mjs` (25 МБ) | `kimi --version`, `package.json` |
| `~/.kimi-code/config.toml` владельца | модели, режим прав, проведённые хуки KAIF | чтение без строк с ключами и токенами |
| Журналы сессий Kimi | `sessions/<workDirKey>/<session>/agents/main/wire.jsonl` и `logs/kimi-code.log` | разбор скриптом, без копирования содержимого наружу |
| Карточка модели | https://huggingface.co/moonshotai/Kimi-K3.1-Pro (вендор) · https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart (вендор) | прочитаны разведчиком 2026-11-21 |
| Вторичные | https://openrouter.ai/moonshotai/kimi-k3.1-pro · https://siliconangle.com/2026/10/23/moonshot-ai-launches-new-flagship-kim-k3-1-pro-model-with-3t-parameters/ · https://www.datacamp.com/blog/kimi-k3-1-pro | только для пробелов, помечены |

Пути вида `docs/en/…` ниже — файлы клона; страницы те же на https://www.kimi.com/code/docs/en/kimi-code-cli/….

## 1. Модель Kimi K3.1 Pro

- **Что это.** Первая модель серии K3.1 (Moonshot AI), выпущена 2026-10-23/24 (вторичные расходятся на день). MoE: 2,8 трлн параметров
  всего, 104 млрд активных на токен, 896 экспертов, 16 выбираются на токен, 2 общих; 93 слоя (69 KDA + 24 Gated DSA); зрение — MoonViT-V2
  (карточка HF). «3T» в заголовке SiliconANGLE — округление; карточка говорит 2,8T.
- **Окно — 1 048 576 токенов** (карточка, quickstart; у владельца `max_context_size = 1048576`). Выход по умолчанию `max_completion_tokens`
  131 072, можно поднять до 1 048 576 (quickstart).
- **Рассуждение выключить нельзя.** «K3.1 Pro always has thinking mode enabled» (quickstart). Управление — `reasoning_effort` = `low` ·
  `high` · `max`; по API по умолчанию `max`, в Kimi Code у владельца `default_effort = "high"` и `[thinking] effort = "high"`.
- **Ход с инструментами обязан возвращать сообщение ассистента целиком** — вместе с `reasoning_content` и `tool_calls` (карточка HF;
  quickstart: «Return the complete assistant message unchanged»). Харнес это делает сам (`[thinking] keep = "all"` → `thinking.keep`,
  `docs/en/configuration/config-files.md` § `thinking`).
- **Выборка зафиксирована:** temperature 1.0, top_p 0.95 — «fixed; omit them from requests» (quickstart).
- **Инструменты:** OpenAI-совместимые; `tool_choice: "required"` на первом ходе; динамическая подгрузка инструментов системным сообщением
  (capability `dynamically_loaded_tools` у владельца в конфиге).
- **Кэш префикса** автоматический: TTL 5 мин по умолчанию, 1 ч через `prompt_cache_options.ttl` (quickstart). Смена уровня рассуждения
  посреди сессии, по словам DataCamp, сбрасывает кэш — не проверено.
- **Варианты:** `kimi-k3.1-pro` и `kimi-k3.1-pro-highspeed` (в 2–3 раза быстрее, расход квоты ×2 — в конфиге владельца прямо «2x Usage
  Cost»). Цены вторичных: $2 / $10 за млн токенов вход/выход, кэш $0,20; highspeed — $4 / $20.
- **Мультимодальность:** текст, картинки, видео (через загрузку файла).
- **Позиционирование вендора:** агентная работа и код; Terminal-Bench 4.0 — 65,7 (у Opus 5.5 — 66,4, оценка вендора «с харнесом Claude
  Code»); собственный Kimi Code Bench 3.0 long-horizon — 61,2. Слабее в чистом рассуждении (HLE-Diamond 39,4 против 60,9 у Opus 5.5) —
  цифры вендора, независимой проверки нет.
- **Открытые веса** с лицензией «Kimi K3.1 Pro License» на HF; текст лицензии не читался.

**Что это значит для KAIF.** Окно то же, что у Opus 5.5 (1M), но ступени окна 75 · 80 · 85 · 92 % без пересчёта не переносятся: харнес
Kimi сжимает контекст сам при 85 % (§9), то есть ступени 85 и 92 % под Kimi не наступают. Модель всегда думает: дешёвого «быстрого» режима для механических шагов нет, экономия — только `low`. Слабее в длинном чистом рассуждении —
дисциплина KAIF «код прежде когниции» и пошаговые носители здесь важнее, чем у Opus.

## 2. Харнес — слои

Монорепозиторий (`AGENTS.md` клона, «项目地图»):

- `apps/kimi-code` — CLI и TUI; `apps/vscode` — расширение VS Code; `apps/desktop` — приложение (Electron).
- `packages/core` — цикл агента, LLM, инструменты и хранилище без DI; `packages/agent-core-v2` — движок с DI (за ним `kap-server`).
- `packages/kap-server` — **Kimi Agent Protocol**: REST `/api/v1` и WebSocket; через него другие агенты (Claude Code, Codex, Cursor) передают
  сессии в Kimi и обратно (`docs/en/guides/other-agents.md`).
- `packages/acp-server` — Agent Client Protocol для редакторов (`kimi acp`).
- `packages/session-import` — импорт сессий Claude Code и Codex одним сообщением.
- Python-предшественник `kimi-cli` сворачивается; данные переносит `kimi migrate` (`docs/en/guides/migration.md`).

## 3. Цикл агента (по коду `packages/agent-core-v2/src`, CLI 2.7.2 работает на нём)

- Ход — цепочка шагов «запрос модели → вызовы инструментов»; шаг без вызовов инструментов кончает ход (`agent/loop/turnProjection.ts:665`).
  Прочие концы: `aborted` · `max_steps` · `error` · `steered` (`agent/loop/loopService.ts:154`).
- Лимит шагов `max_steps_per_turn` по умолчанию не задан — шагов без ограничения (`core/hook/loop/builtin.ts:16`); в `kimi -p` всегда 0.
- Повторы шага — до 10 попыток и только на временных сбоях (сеть, 429 лимита скорости, 5xx); 429 исчерпанной квоты не повторяется
  (`core/llm/policy/retry.ts:3`; `docs/en/configuration/config-files.md` § `loop_control`).
- Блок хука `Stop` возвращает модель в новый ход сообщением с `origin: system_trigger / stop_hook`; второй раз `Stop` в продолжении не
  срабатывает (`features/externalHooks/agent/agentExternalHooksService.ts:459, 477-484`). `kimi -p` ход-продолжение обычно теряет: хук
  асинхронный, а печатный режим следит за новыми ходами, только пока ждёт ход, цель, срабатывание cron или фоновая задача, иначе гасит
  цикл уборкой; ход, кончившийся при ждущем запросе в очереди, `Stop` не зовёт вовсе (§14, по коду 2.7.2; исправлено 2026-11-21 19:13 +03:00 по судье
  сессии 105: стояло «Только в живой сессии: … печатный режим не ждёт его»).
- Протокол рассуждения Kimi: `thinking: { type, effort, keep }`; `keep = "all"` по умолчанию — рассуждение прошлых шагов уходит обратно как
  `reasoning_content` (`core/llm/builtin/provider/kimi/protocol.ts:77-88, 159-160`). Через сжатие рассуждение не переживает: история
  заменяется сводкой.
- Цикл и инструменты «Cron» и «Goal» — только у главного агента (`agent/tools/mainAgentOnly.ts:5-15`).

## 4. Контекст и инструкции

- **Файлы инструкций:** проектные `AGENTS.md` и `.kimi-code/AGENTS.md`; глобальные `$KIMI_CODE_HOME/AGENTS.md` и `~/.agents/AGENTS.md`
  (`docs/en/customization/agents.md` § «Instruction Files»). Содержимое подставляется в системный промпт как `${agents_md}` — «injected into
  the prompt as reference data».
- **`SYSTEM.md`** в `$KIMI_CODE_HOME` целиком заменяет системный промпт главного агента; переменные шаблона: `${skills}` · `${agents_md}` ·
  `${cwd}` · `${now}` · `${os}` · `${shell}` · `${base_prompt}` · `${plugin_sections}`.
- **Плагин может добавить свой блок инструкций в системный промпт** (`${plugin_sections}`, «Plugin Instructions block»). Это единственный
  путь, кроме `AGENTS.md`, положить текст KAIF в промпт каждой сессии.
- **Свои агенты:** `.kimi-code/agents/*.md` и `.agents/agents/*.md` (проект), `~/.kimi-code/agents/` (пользователь); frontmatter `name` ·
  `description` · `whenToUse` · `tools` · `disallowedTools` · `subagents` · `override`. Файл `agent.md` с `override: true` в проекте заменяет
  системный промпт главного агента целиком — вендор предупреждает об этом как о риске доверия.
- **Корень проекта** для навыков и агентов — ближайшая папка с `.git` вверх от рабочей (`docs/en/customization/skills.md`). Без `.git`
  проектные навыки не находятся.
- В живом прогоне: системный промпт Kimi — 23 556 символов, 26 инструментов (`logs/kimi-code.log` сессии, строка `llm config`).

## 5. Навыки

- Каталоги проекта: `.kimi-code/skills/` и `.agents/skills/`; пользователя — `~/.kimi-code/skills/` и `~/.agents/skills/`; плюс
  `extra_skill_dirs`; встроенные — ниже всех. Приоритет: проект > пользователь > дополнительные > встроенные.
- Форма — каталог `<name>/SKILL.md` или плоский `<name>.md`. В каталожной форме `name` и `description` обязательны, иначе навык не
  загружается: в журнале владельца так молча выпадали навыки соседнего проекта — `SkillParseError … bad indentation of a mapping entry`.
- Поля: `type` (`prompt` по умолчанию · `inline` · `flow` — только ручной вызов) · `whenToUse` · `disableModelInvocation` · `arguments`.
- Подстановки: `$ARGUMENTS`, `$0`/`$1`, `$<имя>`, `${KIMI_SKILL_DIR}`; без заполнителей аргумент дописывается в конец `ARGUMENTS: …`.
- Ручной вызов — `/skill:<name>`; голое `/resume` — встроенная команда «список сессий» (алиас `/sessions`), поэтому KAIF зовёт
  `/skill:resume`. Модель зовёт навык инструментом `Skill`; вложенность — до трёх уровней.
- ⚠️ Расхождение документации: `docs/en/reference/tools.md` — «Only `type = "inline"` Skills can be called via this tool», а
  `skills.md` — `inline` то же, что `prompt` (по умолчанию). Живой прогон: `Skill` с `resume` вызвался — то есть по умолчанию работает.

## 6. Хуки

- **Где живут:** только `[[hooks]]` пользовательского `~/.kimi-code/config.toml` и **локальные плагины**. «there is no project-level hook
  file» — нарочно, чтобы чужой репозиторий не подсунул хук (`docs/en/customization/hooks.md`).
- Поля записи — ровно `event` · `matcher` (регулярное выражение) · `command` · `timeout` (1–600 с, по умолчанию 30); лишнее поле ломает
  загрузку конфига. Совпавшие хуки идут параллельно; одинаковая `command` — один раз.
- Вход — JSON на stdin (`hook_event_name`, `session_id`, `session_title`, `client_type`, `cwd` + поля события), рабочая папка — локальная папка
  проекта сессии.
- Выход: `0` — разрешить (stdout «may be appended to context»), `2` — блок (причина — stderr), прочее и таймаут — разрешить (fail-open);
  сбой хука — одно предупреждение в сессии, дальше только журнал.
- **Блокировать могут только `UserPromptSubmit` · `PreToolUse` · `Stop`.** Остальные — только наблюдение: `UserPromptQueued` · `TurnStarted` ·
  `PostToolUse` · `PostToolUseFailure` · `PermissionRequest` · `PermissionResult` · `SessionStart` · `SessionEnd` · `SessionHeartbeat` (раз в
  60 с) · `SubagentStart` · `SubagentStop` · `TaskStarted` · `StopFailure` · `Interrupt` · `PreCompact` · `PostCompact` · `Notification`.
- `Stop` несёт `usage` последнего шага; блок `Stop` открывает новый ход-продолжение.
- Есть `UserPromptQueued` — сообщение владельца, вставшее в очередь посреди хода; его в KAIF пока не слушает ни один хук.
- **По коду** (`features/externalHooks/internal/matchHooks.ts`, `runHook.ts`, `agentExternalHooksService.ts`):
  - **матчер — регулярное выражение без якорей**: `try { return new RegExp(pattern).test(value) } catch { return false }` (:129-136).
    Недопустимый матчер (`"*"`) молча не совпадает НИ С ЧЕМ; `"Agent"` совпадает и с `AgentSwarm`, `"Edit"` — с любым именем, где есть
    `Edit`. Пустой или отсутствующий матчер — со всем. → `bugs/145`.
  - **Одна неверная запись `[[hooks]]` выбрасывает весь раздел хуков** («Ignored invalid config section», `app/config/configService.ts:761-771`).
  - **Текст в контекст кладёт только `UserPromptSubmit`** — как `<hook_result hook_event="UserPromptSubmit">…</hook_result>`
    (`userPrompt.ts:6-38`). Вывод `PostToolUse`, `SessionStart`, `TurnStarted` модели не доходит никогда.
  - `UserPromptSubmit` срабатывает только на сообщения с происхождением `user` (не на уведомления задач); во входе есть `is_steer`.
  - Команда хука — `spawn(command, { shell: true })`: на Windows это **cmd.exe**, рабочая папка — текущая папка сессии (не корень git),
    окружение наследуется; `KIMI_CODE_SESSION_ID` в окружение хука НЕ кладётся — только `session_id` во входе.
  - Хук, чей скрипт не найден, кончается кодом 1 → одно предупреждение на сессию (только у главного агента), дальше молча в журнал; действие
    разрешается.

## 6а. Плагины — единственная упаковка «хуки + навыки + текст промпта»

- Манифест `<корень>/kimi.plugin.json` (или `.kimi-plugin/plugin.json`); `name` — id плагина (`docs/en/customization/plugins.md:250-282`).
- Несёт: `skills` · `agents` · `commands` (`/<плагин>:<команда>`) · `mcpServers` · `hooks` · **`systemPrompt` / `systemPromptPath`** (до
  32 КБ на поле, до 64 КБ на все плагины, действует в TUI, `kimi -p` и `kimi web`, :289-326) · **`sessionStart.skill`** — «Loads the
  specified plugin Skill into the main Agent when a new or resumed session starts», только текст, без кода (:287, :413).
- **Ставится только на пользователя:** «project-level installation scope is not yet supported» (:59). Проект сам включить плагин не может.
  Локальная установка копирует папку в `plugins/managed/<id>/`; правка исходника без переустановки не действует (:57).
- Хуки плагина — те же поля, что `[[hooks]]`; **рабочая папка — корень плагина**, в окружении `KIMI_CODE_HOME` и `KIMI_PLUGIN_ROOT`
  (:493-494); папку проекта хук берёт из поля `cwd` входа. Установка сама хуки не запускает (:496).
- Навыки плагина зовутся только полным именем `/<плагин>:<навык>`, голое имя к ним не ведёт (:415).

## 7. Субагенты

- Встроенные `coder` (по умолчанию) · `explore` (только чтение) · `plan` (без шелла); дальше делегировать не могут. Субагент видит только
  переданное описание задачи, не историю главного (`docs/en/customization/agents.md`).
- `Agent` с `run_in_background`; таймаут 2 ч (`[subagent] timeout_ms`); `AgentSwarm` — до 128 субагентов, только в режиме `/swarm`, который
  включает пользователь.
- Права «всегда разрешать» главного наследуются субагентами.

## 8. Инструменты, которые трогают KAIF

- `Write` и `Edit` требуют прежнего `Read` того же файла в сессии и отказывают, если файл изменился на диске после чтения.
- `Bash`: на Windows — Git Bash; передний план 60 с (макс. 5 мин), по таймауту команда уходит в фон; в дочерний процесс приходят
  `KIMI_CODE_SESSION_ID` и `KIMI_CODE_WORKSPACE_ID`; stdin закрыт.
- `AskUserQuestion` (1–4 вопроса, 2–4 варианта) с `background: true` — вопрос висит после конца хода, ответ приходит уведомлением.
- `WaitFor` (до 90 с) — ждать фоновую задачу внутри хода; новое сообщение владельца прерывает ожидание.
- `CronCreate` · `CronList` · `CronDelete` — промпт в эту же сессию по расписанию; до 50 задач; переживают `kimi --session`, не переживают новую
  сессию; повторяющиеся старше 7 дней удаляются.
- `NotifyUser` — короткий отчёт о ходе без конца хода (экспериментальный, выключен по умолчанию).
- `TodoList`, режим плана `ExitPlanMode` (включает только пользователь).

## 9. Окно контекста и сжатие

- Порог автосжатия — `loop_control.reserved_context_size`: сжатие запускается, когда остаток окна меньше резерва; число по умолчанию в
  документации не названо. `compaction_max_attempts` = 5. `/compact <подсказка>` — вручную.
- `token_counting.strategy` (`measured+estimated` по умолчанию) меняет только показываемое число; внутренняя логика использует и usage, и
  оценки (`config-files.md` § `token_counting`).
- Полевой замер (`researches/48` §5): сжатие пришло при показанных 85,04 %, внутри — 81,24 %.
- **Что остаётся после сжатия** (журнал изменений 0.21.0, `docs/en/release-notes/changelog.md:1278-1282`): «Keep only recent user prompts
  plus a single user-role summary; drop assistant and tool messages». С 0.41.0 (:406) модели перед автосжатием напоминают о бюджете окна, а
  после — указывают на журнал событий сессии за точными деталями. Значит, всё, что KAIF вложил в контекст ответами инструментов и текстом
  хуков, после сжатия пропадает; переживают только сообщения пользователя и сводка.
- Усечение `AGENTS.md` — с видимым предупреждением (0.20.0, :1391): длинный файл инструкций режется.
- `KIMI_CODE_REPEAT_BREAKER`: много одинаковых вызовов подряд — напоминания, затем принудительный конец хода (`docs/en/configuration/env-vars.md:171`).
- **Точный порог по коду** (`agent/fullCompaction/strategy.ts:18-28, 118-134`; то же в установленном `dist/main.mjs:309118-309126`):
  `triggerRatio 0.85` · `reservedContextSize 50 000` по умолчанию; сжатие — когда занято `≥ 0,85 · окна` ИЛИ `занято + 50 000 ≥ окна`. Для
  окна 1 048 576 это 891 290 (85 %); для 262 144 — 212 144 (≈ 81 %). Проверяется перед каждым шагом. Порог можно сдвинуть недокументированным
  ключом `loop_control.compaction_trigger_ratio` (0,5–0,99, `agent/loop/configSection.ts:18`).
- **Счёт для порога** — максимум из «последний замер + оценка хвоста» и «последний usage + оценка хвоста»
  (`fullCompactionService.ts:951-955`). Оценка — `ceil(ASCII/4) + не-ASCII` (`llm-adapter/contract/tokens.ts:24`): каждая буква кириллицы —
  целый токен. Русский текст после последнего замера переоценивается в разы — отсюда полевое сжатие при внутренних 81 %.
- **Что делает сжатие:** модель пишет «handoff summary» (`fullCompaction/compaction-instruction.md:1`, к ней дописывается список дел);
  сообщения пользователя сохраняются дословно до 20 000 токенов (`agent/contextMemory/compactionHandoff.ts:10-11`); к сводке прибит раздел
  «Context Recovery» с путём к `wire.jsonl`. Пишется запись `context.apply_compaction` (`tokensBefore`, `tokensAfter`, `keptUserMessageCount`).
  Системный промпт — вне истории и переживает сжатие целиком, вместе с `${agents_md}` и `${plugin_sections}`
  (`fullCompactionService.ts:298-302`).
- **Записи журнала, которые читает KAIF:** `usage.record` и `token_counting.measured` пишутся после каждого запроса
  (`agent/loop/requestObservation.ts:297-307`).

**Что это значит для KAIF.** Ступень 85 % «мягкое закрытие» совпадает с автосжатием Kimi, а на русском тексте сжатие приходит раньше.
Ступени KAIF для Kimi должны стоять ниже порога сжатия — либо порог сжатия поднимается ключом конфига; это развилка (план).

## 10. Права, доверие, сообщения посреди хода

- **Режимы прав:** Always Ask (`manual`, по умолчанию) · Ask When Needed (`yolo`, `/yolo`) · **Never Ask** (`auto`, `/auto`) — «the agent
  never asks you questions — it decides everything on its own» (`docs/en/guides/interaction.md`). **У владельца `default_permission_mode =
  "auto"`**: в этом режиме вопросы владельцу `AskUserQuestion` не задаются.
- **Доверие к папке:** при первом открытии папки Kimi спрашивает доверие (`[workspace] require_trust = true`); без него не грузятся проектный
  `.kimi-code/mcp.json` и правила `.kimi-code/local.toml`. Проектный `local.toml` держит только правила прав (`[[permission.rules]]`),
  хуков в нём нет.
- **Слово посреди хода по умолчанию ждёт в очереди** до конца хода: `Enter` ставит в очередь, `Ctrl-S` вливает в идущий ход, настройка
  `follow_up_behavior = "steer"` в `tui.toml` меняет умолчание. Внутри `WaitFor` сообщение вливается само.
- **Режим цели `/goal`** — агент работает к названному результату через много ходов, с бюджетом и статусами complete · paused · blocked;
  `kimi -p "/goal …"` кончается кодом 0 / 3 / 6. Родственник автономных циклов KAIF.

## 11. Сессии

- Хранилище: `~/.kimi-code/sessions/<workDirKey>/<sessionId>/` — `state.json`, `agents/main/wire.jsonl` (поток событий), `agents/<sub>/…`,
  `tasks/`, `cron/`, `logs/kimi-code.log` (`docs/en/configuration/data-locations.md`).
- Продолжение: `kimi --continue` · `kimi --session <id>`; в TUI `/sessions` (= `/resume`), `/new` (= `/clear`), `/fork`, `/compact`.
- `kimi import-sessions` — сессии Claude Code и Codex входят в Kimi одним сообщением с полной историей рядом.
- KAP: «HandOff brief» в новую сессию Kimi с Session ID — готовый транспорт для автоэстафеты между чатами (критерий 36, ныне 2.11).
- **Режим `kimi -p`** (`docs/en/reference/kimi-command.md`): всегда разрешения `auto`, с `--yolo` / `--auto` / `--plan` не сочетается (:43;
  `overrides.md` местами говорит иное — документация расходится); каждый прогон сохраняет сессию и печатает `session_id` (в `stream-json` —
  строка `session.resume_hint`, :152); продолжение — `kimi -c -p …` или `kimi -S <id> -p …`; коды выхода 0 · 1 · 4 (сессия занята другим
  процессом), у `/goal` ещё 3 и 6. Начального промпта у интерактивного TUI нет — новый чат с готовым словом открывается только через `-p`, KAP
  или приложение.
- **VS Code и ACP:** расширение VS Code крутит тот же движок в процессе редактора и делит `config.toml`, вход и сессии с CLI
  (`apps/vscode/README.md:23-29` клона); что хуки и навыки там срабатывают так же — нигде не сказано, проверяется прогоном.

## 12. Наблюдения на машине владельца

1. Модель по умолчанию — `kimi-code/k3.1-pro`, effort `high`, окно 1 048 576; есть highspeed «2x Usage Cost».
2. **Режим прав — `auto` (Never Ask).** Вопросы владельцу через инструмент в этом режиме не задаются.
3. **Хуки KAIF проведены глобально** относительными путями `node .kaif/hooks/…`: срабатывают в каждой папке, где запущен Kimi. Комментарий
   фрагмента «Scripts exit silently outside one» неверен там, где файла нет: падает сам `node` («Cannot find module», код 1), Kimi показывает
   одно предупреждение на сессию (§6, по коду). А рабочая папка хука — папка сессии, не корень git: Kimi, запущенный из подпапки проекта,
   скрипта по относительному пути не найдёт.
4. **`matcher = "*"`** у `PostToolUse` × 3, `PostToolUseFailure`, `PermissionRequest` — по коду эти пять хуков не запускаются никогда
   (`bugs/145`). Резервная копия конфига 14:56: тогда `PermissionRequest` стоял без матчера и голос звучал через хук соседнего проекта.
5. **Прошлый Kimi-чат кончился пятичасовым лимитом подписки:** в журнале прогона `turn.ended` с `reason: failed`, `code: provider.api_error`,
   `APIProviderQuotaExhaustedError`, «You've reached your 5-hour usage limit», 429, `retryable: false`; внешняя сессия после этого кончилась
   `errorMessage: "[object Object]"` — без причины.
6. Проверка `--alive` под Kimi судила по `.claude/settings.json` («the context-window hook is not wired on PostToolUse in
   .claude/settings.json»): у Kimi хуки в `config.toml`, вердикт ложный.
7. Временный проект прогона был без `.git`: по правилу корня (§4) это меняет поиск проектных навыков.
8. **VS Code 2026-11-21 19:40 +03:00, сессия `session_70b1e5d5…`:** процесс, открытый до записи диспетчера, продолжал вызывать прежние `node .kaif/hooks/…` — все падали кодом 1 (глобальный журнал 16:29–16:37Z); новый конфиг читается при старте сессии. Инструмент `Bash` этой сессии не передал ни `KIMI_CODE_SESSION_ID`, ни `CLAUDE_CODE_SESSION_ID`; ручной `--alive` поэтому сначала ложно прочитал новейшую Claude-сессию (`bugs/147`). После фикса он выбирает новейшую Kimi-сессию проекта по `state.json → cwd` и mtime wire и честно отвечает код 1 до первой записи хука.

## 13. Где документация и код расходятся

1. `reserved_context_size` в документации без значения; в коде 50 000 и ИЛИ с долей 0,85.
2. `compaction_trigger_ratio` принимается кодом, в документации его нет.
3. «Напоминание о бюджете окна перед автосжатием» (журнал 0.41.0) — в коде динамического напоминания не найдено.
4. `docs/en/reference/tools.md`: инструмент `Skill` берёт «only `type = "inline"`»; `skills.md`: `inline` = `prompt` (по умолчанию).
5. `kimi -p` с `--yolo`: `kimi-command.md:43` запрещает, `overrides.md:100` даёт пример с ним.

## 14. Не найдено

- **Живой блок `Stop` в `kimi -p` хода-продолжения не открыл** (прогон 3 KA9, 2026-11-21 17:56): хук теста решил блокировать (записал
  подпись `lastStop`), а в журнале сессии один ход. **Причина найдена по коду установленного 2.7.2** (2026-11-21 18:23 +03:00, сессия 105): `Stop` Kimi
  зовёт асинхронно — подписка на `TurnEnded` ставит хук в очередь `stopHookQueue` (`agentExternalHooksService.ts` → `notifyTurnEnded` ·
  `runStop`), а печатный режим после `turn.result` своего хода (`src/cli/v2/run-v2-print.ts` → `runNativeTurn`) ждёт дальше в
  `applyPrintBackgroundPolicy` только пока идёт ход, активна цель, назначен cron или ждёт фоновая задача (потолки `printWaitCeilingS` ·
  `printMaxTurns`); без них — прогон 3 KA9 — уходит в уборку `cleanup → quiesceSessionAgents`, которая отменяет очередь и сам цикл
  (`loop.cancel()`), пока хук ещё идёт. И `notifyTurnEnded` выходит раньше `Stop`, когда у цикла есть ждущий запрос (`hasPendingRequests`):
  ход, кончившийся при сообщении владельца в очереди, ворот `Stop` не проходит и в живой сессии (исправлено 2026-11-21 19:13 +03:00 по судье сессии 105:
  стояло «печатный режим ждёт только `turn.result` своего хода и уходит в уборку»). В живой сессии (TUI, ACP редактора, web) тот же
  `runStop` кладёт причину блока сообщением `origin: system_trigger / stop_hook` через `loop.notify` → `mailbox.notify` → `releaseIntake`
  снимает удержание → `schedule` открывает новый ход (`core/src/loop/loop-actor.ts`). Флаг `stopHookContinuationUsed` — состояние сессии,
  ставится один раз и не сбрасывается: ход-продолжение `Stop` больше не зовёт, обычный ход владельца — зовёт. **Итог:** по коду ворота KAIF
  на `Stop` под Kimi работают в живой сессии (кроме хода с ждущим запросом) и в `kimi -p` — только при ждущей иной работе. Первая проверка
  VS Code 2026-11-21 19:32 +03:00 НЕ открыла продолжение, но новый путь она не судит: процесс держал прежние команды, каждая падала кодом 1,
  долг теста не записался (`bugs/147` и его отчёт). **Положительная живая проверка VS Code 2026-11-22 09:40 +03:00:** новая сессия
  `session_6d66c1d4…` записала `.mjs`, `Stop` открыл продолжение `KAIF STATUS guard` с `origin: system_trigger / stop_hook`; файл затем
  запущен, `test debt: none` (`testcases/reports/2026-11-22_kimi-stop-alive.md`). Второй `Stop` в том же agent turn продолжения не дал —
  `stopHookContinuationUsed` уже стоял; поэтому первый `Stop` нельзя судить по отсутствию второго продолжения. Агент всё равно обязан
  выполнить приказ в первом продолжении, а не закончить ход повторно (EXP-0221).
- Как увидеть остаток пятичасовой квоты до того, как она кончилась.
- Запускаются ли хуки на инструментах субагентов.
- Хуки и навыки в расширении VS Code и в ACP работают так же, как в CLI, — документом не сказано (тот же движок и тот же `config.toml`).
- Текст лицензии открытых весов.
