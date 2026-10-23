# Разведка 41 — PT0: контракт хуков Claude Code для хука часов и преамбулы субагенту

> **Создан:** 2026-10-23 (сессия 90, Claude Opus 5.5; шаг PT0 `plans/142`; сбор — субагент `claude-code-guide` по письменному брифу,
> единственный в ходе, `HOUSE_RULES.md` §7).
> **Родитель:** `plans/142` (PT0) · `ideas/34` · `ideas/35` · тикеты #170 · #172 · #166.
> **Статус:** ✅ собрано ≈ 2026-10-23 09:16 +03:00 — цитаты сняты WebFetch (текст обработан моделью, байт-в-байт не гарантирован: сверить
> дословно до того, как фраза ляжет в код или канон); два пункта — NOT IN DOCS, снимаются пробой в песочнице (PT1).
> **Вовне:** —

## Вектор цели (Achieve)

Форма двух хуков эпика PT решается документацией вендора, а не памятью и не полевым прототипом: какие поля, какое решение о разрешении,
какой matcher.

## Готово, когда

Каждый вопрос брифа имеет адрес и цитату или отметку NOT IN DOCS; итог — строка `FORK:` для PT1/PT2 ниже.

## Находки (адреса — code.claude.com/docs/en/…)

1. **`updatedInput`** — `hooks#pretooluse-decision-control`: «Modifies the tool's input parameters before execution. Replaces the entire
   input object, so include unchanged fields alongside modified ones. … Combine with "allow" to auto-approve, or "ask" to show the modified
   input to the user. For "defer", ignored». Единственный пример — в паре с `"allow"`.
2. **`permissionDecision`** — там же: «"allow" skips the permission prompt …; "deny" prevents the tool call; "ask" prompts the user to
   confirm; "defer" … requires non-interactive mode»; правила deny/ask настроек судятся всегда (`permissions#extend-permissions-with-hooks`).
   **NOT IN DOCS:** обязателен ли `permissionDecision` при `updatedInput` и сохраняется ли обычный запрос без решения. `hooks-guide`: «if you
   exit 0 from a PreToolUse hook, the tool call still goes through the normal permission flow, because exit 0 doesn't approve it» — о голом
   выходе 0, не о JSON с `updatedInput`.
3. **Субагент** — `tools-reference`: инструмент `Agent`; `sub-agents`: «In version 2.1.63, the Task tool was renamed to Agent» (алиас `Task` —
   только для правил разрешений, для matcher хуков NOT IN DOCS); поле задания — `prompt` (`hooks#per-tool-tool_input-fields`). Альтернатива:
   `SubagentStart` — `hookSpecificOutput.additionalContext`, «Context only … No blocking or decision control», «at the start of the
   conversation, before the first prompt».
4. **Поля записи** — Write: `file_path` · `content`; Edit: `file_path` · `old_string` · `new_string` · `replace_all`. **MultiEdit — NOT IN
   DOCS** (нет ни в разделе полей, ни в таблице инструментов): сверять со сборкой на машине.
5. **`additionalContext`** — у `PreToolUse` «String added to Claude's context alongside the tool result» — приходит ПОСЛЕ вызова, не до
   него; у `UserPromptSubmit` — внутри `hookSpecificOutput`, на верхнем уровне молча игнорируется.
6. **Правка настроек посреди сессии** — `hooks-guide`: «the file watcher normally picks up hook changes automatically» (совпадает с полевой
   поправкой #166).
7. **Коды выхода** — 0 успех · 2 блок (для `PreToolUse` — вызов заблокирован, `allow` в JSON не спасает) · прочее — неблокирующая ошибка;
   совпавшие хуки события идут ПАРАЛЛЕЛЬНО, правила слияния двух `updatedInput` — NOT IN DOCS.

## PT0 (б) — полевые реализации на диске владельца (только чтение; 2026-10-23 10:10 +03:00, сессия 91)

Найдены в ОДНОМ полевом развёртывании (поиск `find d:/work -maxdepth 6` по обоим именам; план говорил «двух» — второго нет):
`tools/hooks/clock-now.mjs` (142 строки, selftest 15 случаев, `[TESTED]` полем 2026-10-21) и `.kaif/hooks/subagent-canon-preamble.mjs` (98 строк,
`[NOT-TESTED]` в шапке); оба подключены в `.claude/settings.json` поля (`PreToolUse` matcher `Agent|Task` · `Write|Edit|MultiEdit`; часы — ещё и
`UserPromptSubmit`).

1. **`updatedInput` БЕЗ `permissionDecision` применяется — наблюдено на реальном пути (для `Agent`).** Преамбула поля отвечает только
   `{hookSpecificOutput: {hookEventName, updatedInput}}`. Журнал хука поля — 50 срабатываний (2026-10-18 → 2026-10-23); записи сессий поля
   (`~/.claude/projects/<поле>/…/subagents/*.jsonl`, только счёт, без цитат — скрипт `preamble-scan.mjs` скретчпада сессии 91): из 84 заданий
   субагентов 48 ОТКРЫВАЮТСЯ меткой преамбулы, ни одно не несёт её в середине. Это закрывает NOT IN DOCS п. 2 для `Agent`: переписанный вход
   доходит до инструмента без решения. Остальные 36 — по датам, вероятно, до проводки (не проверялось). Для `Write`/`Edit` наблюдения нет: часы
   поля отвечают `"allow"`; сохраняется ли запрос записи без решения — по-прежнему проба PT1.
2. **Хук часов поля — образец формы, но не решения:** заполнители `⟦NOW⟧` · `⟦NOW-ISO⟧` · `⟦DATE⟧` · `⟦TIME⟧`; поля `Write.content` · `Edit.new_string` ·
   `MultiEdit.edits[].new_string`; `old_string` не трогается; экранирование обратной косой; без заполнителя — ни `updatedInput`, ни решения.
   Берём всё, КРОМЕ `permissionDecision: "allow"` (поле само записало его в `GAP:` как «выбор владельца, открыт»). Строка часов — на русском
   внутри кода: в поставке — из языкового пакета.
3. **Преамбула поля** — список читается из шага 1 `/resume` (регулярка по EN-заголовкам `## Step 1.` / `## Step 1b` — у русской обвязки заголовки
   «Шаг 1» — в поставке искать по обоим языкам или по маркеру); журнал — в `artifacts/hooks/` (у поставки — `.kaif/`); запрет вложенных
   субагентов — есть; «цитата канона первой строкой отчёта» — есть.

## PT0 (в) — входы плана против HEAD `44cdde3` (2026-10-23 ≈ 10:12 +03:00, сессия 91)

- `framework/hooks/settings-fragment.json` — три события (`SessionStart` · `UserPromptSubmit` · `Stop`), `PreToolUse` нет (ушло с
  `pretool-owner-word` — WH 2.9). PT1 добавляет `PreToolUse` (matcher записи) и второй хук в `UserPromptSubmit`.
- Свод `s14` стережёт ровно это отсутствие: ассерт «s14 WH» — `!frag.hooks?.PreToolUse` рядом с именами снятых хуков, и таблица
  `EVENT_CONTRACT` фрагмента — `['SessionStart', 'Stop', 'UserPromptSubmit']`. PT1 обязан переписать оба С ОБОСНОВАНИЕМ в коммите: снятие
  стерегут имена снятых скриптов, а не имя события (событие возвращается с другим хуком, который ничего не останавливает — №144 соблюдён).
- `wire-hooks` (`KAIF-CORE.mjs` ≈ 4900): фрагмент мержится аддитивно по скрипту (`HOOK_SCRIPT_RE` — любой `…/hooks/<имя>.mjs`), `RETIRED_HOOKS`
  — два имени; новые скрипты подхватываются без правки машинерии, если лежат в `.kaif/hooks/` (полевой `tools/hooks/` — не наш путь).

## Что это значит для эпика PT

- `FORK: options <updatedInput + "allow" (как в поле) | updatedInput без решения | updatedInput + "ask"> · price of error <"allow" молча
  одобряет каждую запись в проекте без авторежима — обход запроса разрешения | без решения — поведение не описано | "ask" — лишний запрос на
  каждую запись с меткой> · consulted <researches/41 (hooks#pretooluse-decision-control, permissions)>` → **без решения**, исход проверяется
  пробой PT1 в песочнице (запрос записи остаётся); `"allow"` не берётся никогда. Хук часов: matcher `Write|Edit` (MultiEdit — после сверки),
  выход 0, ошибка хука не блокирует (запись уходит с буквальным заполнителем — сеть: страж будущих меток 2.11 и проза канона).
- Строка часов через `additionalContext` у `PreToolUse` приходит после записи — для текущей метки бесполезна; полезна у `UserPromptSubmit`.
- Преамбула субагенту: кандидат проще поля — `SubagentStart` + `additionalContext` (ничего не переписывает, без решения о разрешении); второй
  кандидат — `PreToolUse` matcher `Agent`, `updatedInput.prompt` с полным входом. Выбор — в PT2 строкой `FORK:` (сверить, видит ли
  `SubagentStart` текст как обязательство до первой работы субагента).
- Один переписывающий хук на инструмент: два параллельных `updatedInput` без правила слияния.

## Links

`plans/142` · `ideas/34` · `ideas/35` · сырые выгрузки разведчика — в каталоге `tool-results` сессии 90 (локально, не в репозитории)
