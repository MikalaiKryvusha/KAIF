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
