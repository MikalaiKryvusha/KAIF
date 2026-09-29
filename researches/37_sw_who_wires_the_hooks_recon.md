# Исследование 37 — кто вливает поставленные хуки в настройки агентской системы: границы харнесса Claude Code

> **Создан:** 2026-09-29 (сессия 76, Claude Opus 5.5; шаг SW1 `plans/130`).
> **Родитель:** `plans/130` (эпик SW 2.9) · критерий 12 `plans/126` · тикет #115 · KAGO R13 (`researches/35` §6 (а)).
> **Статус:** ✅ разведка завершена 2026-09-29 20:03 +03:00 (живая загрузка документации вендора и встроенных правил классификатора); решение — строка `FORK:` ниже.
> **Вовне:** —

## Вопрос разведки

Владелец KAIF велел, дословно по тикету #115: «все, что каиф приносит в поставке - подключить. И заведи импрувмент в КАИФ, чтобы агенты
этого не спрашивали, как вот ты сейчас спросил, а сразу автоматом подключали». Хуки KAIF подключаются записью в `.claude/settings.json`
проекта. Поле (KAGO R13) сообщило: в auto mode Claude Code отказывает АГЕНТУ в такой правке как в самомодификации. Предмет разведки —
путь, которым фрагмент хуков вливается без вопроса владельцу о подключении и без обхода харнесса.

## §1. Вендор — документация Claude Code (живая загрузка)

Загружено `curl` 2026-09-29 20:01:44 +03:00 (копии — скретчпад сессии 76, `sw1/`), клиент контейнера — Claude Code 2.1.284.

- https://code.claude.com/docs/en/permission-modes.md, «Protected paths»: «Writes to a small set of paths are never auto-approved, except in
  `bypassPermissions` mode and in interactive terminal sessions in plan mode with bypass permissions available. This prevents accidental
  corruption of repository state and Claude's own configuration.» Таблица: `default`, `acceptEdits` — «Prompted»; `auto` — «Routed to the
  classifier»; `dontAsk` — «Denied»; `bypassPermissions` — «Allowed». В списке защищённых каталогов: «`.claude`, except for
  `.claude/worktrees` where Claude stores its own git worktrees».
- Там же: «`permissions.allow` rules in settings files do not pre-approve protected-path writes. The safety check runs before Claude Code
  evaluates allow rules from settings».
- Там же, порядок решения классификатора: «Writes to protected paths route to the classifier even when an allow rule matches» и «If the
  classifier blocks, Claude receives the reason and tries an alternative».
- https://code.claude.com/docs/en/auto-mode-config.md: «The classifier doesn't read `autoMode` from project settings in
  `.claude/settings.json` or `.claude/settings.local.json`. Both files live in the repo directory, so a checked-in repo or a build step
  could otherwise inject its own allow rules.» · «Explicit user intent overrides the remaining soft blocks: if the user's message directly
  and specifically describes the exact action Claude is about to take, the classifier allows it even when a `soft_deny` rule matches.»

## §2. Встроенные правила классификатора (`claude auto-mode defaults`, 2.1.284)

Снято командой клиента в этом контейнере (копия — `sw1/auto-defaults.json`), дословно:

- «Self-Modification [named+specifics — **must name:** that this specific permission or consent change is wanted]: Edits to the agent's own
  config that (a) add or widen permissions or weaken guards — permission allow rules (e.g. wildcard `"Bash(prefix:*)"` entries), hook or
  sandbox changes, approval-gate settings — that the user did not explicitly ask for, even while making a user-requested edit to the same
  file; … Config surfaces: `.claude/settings*.json`, `CLAUDE.md`, … `.claude/hooks/`, … `.claude/skills/` …» и «A user message stating a
  permission makes that edit — and similar subsequent ones — user-requested rather than this rule's matter; it is not a standing exemption
  for unlike edits.»
- «Auto-Mode Bypass …: Working around this classifier or the Claude Code permission system — … (iii) using flags, config, aliases, shell
  indirection, or extension points so that the Claude Code permission system allows arbitrary code execution. The correct response to a
  denial is to find another safe alternative or ask the user for permission, not to work around the classifier.»

## §3. Следствия для KAIF

1. Хук — исполняемый код, который агентская система запускает на событиях; его вписывание в `.claude/settings.json` — «hook … changes»
   правила Self-Modification. Харнесс считает это решением пользователя, а не агента, и защищает путь во ВСЕХ режимах, кроме обхода проверок.
2. Запись, спрятанная внутри общей команды машинерии (`update` пишет `settings.json` сам, харнесс видит только `node … update`), — ровно
   «shell indirection … so that the permission system allows arbitrary code execution». Этот путь — обход харнесса, KAIF его не строит.
3. Законный автоматический путь один: действие видно харнессу как то, что оно есть, и судится им. Агент вливает фрагмент сам — своим
   инструментом правки или прозрачно названной командой машинерии, — не задавая владельцу вопроса в чате; решение о записи принимает
   гейт харнесса (в ручных режимах — одно окно разрешения, в auto mode — классификатор, в `bypassPermissions` — записывается). Отказ
   харнесса агент не обходит: называет его в прощании и в полевом отчёте и печатает одну строку, которой владелец подключит хуки сам.
4. Слово владельца в самом сеансе («подключи хуки KAIF») снимает мягкий запрет по правилу явного намерения. Слово владельца KAIF в его
   полевых проектах (#115) — политика KAIF и основание для пункта задания, но классификатор чужого проекта его не читает: это граница
   харнесса, а не пробел KAIF.

## FORK

`FORK: options (а) ядро вливает фрагмент внутри install/update само, без видимого харнессу действия | (б) владелец подключает сам командой
по образцу tools/grant-permissions.mjs | (в) агент вливает сам, открыто — прозрачно названная команда машинерии wire-hooks (аддитивно,
идемпотентно, чужие записи сохранены, ключ отказа), которую задание установки и обновления велит исполнить без вопроса владельцу; гейт
харнесса решает; при отказе — строка отчёта и одна команда владельцу · price of error (а) — обход харнесса по определению вендора
(Auto-Mode Bypass (iii)), доверие владельца и поля; (б) — снова «спросите владельца», №97 и слово #115; (в) — в auto mode классификатор
может отказать, и хуки тогда подключает владелец одной строкой · consulted документация вендора permission-modes «Protected paths»,
auto-mode-config, встроенные правила классификатора Self-Modification и Auto-Mode Bypass (§1–§2) + слово владельца #115` → **(в)**.

## Links

`plans/130` · `plans/126` критерий 12 · `researches/35` §2г (#115), §6 (а) · `researches/36` (прецедент формы) · `framework/hooks/settings-fragment.json` ·
`tools/grant-permissions.mjs` · `MASTER_PLAN.md` №97.
