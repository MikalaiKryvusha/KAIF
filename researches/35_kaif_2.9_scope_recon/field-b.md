# Разведка field-b — полевые отчёты обновления до 2.8: #122 KAGO · #129 KPOT · #131 Game Of Dream

> **Цитаты:** дословные; где исходник переносит строку внутри цитаты, перенос заменён пробелом (так у KAGO, GoD и `researches/19`).
> **Прочитано:** 2026-09-28 17:15–17:29 UTC (`date`), тикеты целиком из `scratchpad/issues/{122,129,131}.md` (+ заголовки
> #109–#130 для сверки номеров). **HEAD** `52f688c`; `git diff --stat v2.8 HEAD -- framework/ tools/` → пусто; `git status` истока
> чист до и после (0 строк). Пробы — только в `mktemp -d` с копией `framework/` (ядро как `.kaif/kaif-core.mjs` во временном
> git-репо); ни одного запуска свода, полигона, контура, `KAIF_DIST`.

## Итог поля одной строкой на отчёт

- **KAGO (#122)** — механика 2.8 точна (песочница = бой пятый выпуск подряд, `--render` удешевил ручное слияние); вся цена — в
  ручной прозе агента (пять проходов судьи, четыре REFUTED — все о прозе). Пять дефектов KAIF заведены отдельно; ещё **семь
  трений живут только в отчёте**.
- **KPOT (#129)** — прыжок 2.1 → 2.8 (семь версий) прошёл; **ни одного отдельного тикета** — все 8 граблей только в отчёте (R3 —
  дубль #113 чужого проекта). Длина прыжка видна в хвостах: отставной `/end-chat` в STATUS, 39 политик одним мандатом, 236
  ложных «не найдено» у `update-verify`, заголовок молитвы на языке владельца валит проверку.
- **Game Of Dream (#131)** — прыжок 1.2 → 2.8 с ручного развёртывания без ядра и без git; канон заменён рендером 2.8. Один
  дефект заведён (#130); четыре грабли + одна мимоходная (литерал `<COMMIT_COMMAND>` → «local edits») — только в отчёте.

---

## #122 — KAGO 2.7 → 2.8: механика чиста, цена в прозе; заведены #109 #111 #112 #119 #120 (+ #126 в комментарии)

**Маршрут.** 2.7 → 2.8, bootstrap (загрузчик) с репетицией: песочница `git -c core.autocrlf=false archive` → `node KAIF-LOADER.mjs
--lang ru --source <a28> --baseline <a27>`, бой — та же строка + `--rehearsal <sandbox>/.kaif/last-update.json`. Windows 11 Pro
10.0.26200, Node v24.15.0, Git Bash + PowerShell 5.1, `core.autocrlf=true`; язык `ru` (8 документов владельца локализованы, навыки
английские); Claude Opus 5.5 (1M), VS Code, auto mode. Длительность: старт «≈ 1.6 h» после выпуска 08:56:23Z (≈ 10:32Z) → отчёт
13:05:02Z ≈ **2 ч 30 мин** (+ поправка 13:24Z). Счётчики: «`38 replaced, 23 modules merged in-place, 3 added, 59 kept`», задание
«`10 items, 2 files with module diffs`»; `AGENT_GUIDE.md` 1942 → 1884 (механика) → 1376 строк (11 модулей руками). Прыжок в одну
версию — хвостов длины нет.

**Пять заведённых дефектов KAGO** (§1 «Tickets»: «`bugs/KAIF/22` → #109 · `23` → #111 · `24` → #112 · `25` → #119 · `26` → #120»;
все пять несут автозахват «project KAGO») + #126 в комментарии.

| Код | Суть | Тикет | Сверка с HEAD | S | Класс (механизм KAIF) |
|---|---|---|---|---|---|
| R1 | Вид долга владельца красит ЗАКРЫТОЕ интервью «решения ждут внесения»: отрицание в строке статуса бьёт галку, слова закрытия нет | **#109** | **CONFIRMED** проба на копии `docStatus`: `"waiting" <= **Status:** ✅ **ЗАКРЫТО 2026-08-30 14:5x — ВОПРОС СНЯТ АГЕНТОМ, А НЕ ОТВЕЧЕН ВЛАДЕЛЬЦЕМ.**` · `"waiting" <= … ✅ CLOSED — withdrawn by the agent, not answered by the owner.` · `"closed" <= … ✅ CLOSED — withdrawn by the agent.`; `framework/tools/contour/core.mjs:179` `if (STATUS_NEGATION_RE.test(line)) return 'waiting';   // negation outranks the tick`; `texts.mjs:46` `statusClosed: '✅\|🟢\|STATUS:\\s*DONE\|ANSWERS\\s+RECEIVED\|ОТВЕЧЕНО'` — слов ЗАКРЫТО/CLOSED/СНЯТ нет. Честного выхода нет: `review.mjs:393` `if (q.answered) return { code: 1, line: T(cfg).impl.answeredNotWithdrawn(doc, qid) };` | S2 | Парсер статуса: приоритет отрицания над явным словом закрытия |
| R2 | `kaif-attribution-lint` читает git-игнорируемые корневые `*.md` (частный портрет голоса) и кладёт ТЕКСТ находок в базу, которую ритуал велит коммитить | **#111** | **CONFIRMED** `kaif-attribution-lint.mjs:308` `for (const n of readdirSync(root)) if (/\.md$/i.test(n) && !TRANSIENTS.has(n)) {` → файловый корень идёт в `take(r)` мимо `git ls-files` (`:126` `if (!st.isDirectory()) { take(r); continue; }`); `:339` `entries[f.key] = \`${f.file}:${f.line} ${f.text.slice(0, 100)}\``. Проба (репо, `.gitignore: PRIVATE.md`): `check --write-baseline` → `grep -c grandmother .kaif/attribution-lint.baseline.json` → `1` | S2 (промах S1 — приватное в публичный репо) | Корневой цикл в обход единого git-обходчика (класс #77); база хранит текст, а не отпечаток. Близнец-контраст: база `kaif-experience-lint` хранит только `ids` и пересечение с прежней (`kaif-experience-lint.mjs:361–368`) — правильная форма. TWINS: searched `readdirSync(root)` в `framework/**/*.mjs` — found 1 (сам этот цикл) |
| R3 + R8a | `check <path> --write-baseline` стирает весь долг вне пути, а сам путевой `check` советует «rewrite it»; третья одинаковая строка молча впитывается в долг | **#112** (+ поправка-комментарий на #112) | **CONFIRMED** проба: путевой `check STATUS.md` → `✅ attribution-lint OK — 1 file(s) scanned, new 0 · debt 1 (baseline …, 1 entry no longer found — rewrite it)`; `check STATUS.md --write-baseline` → `… 1 finding(s) recorded as debt (0 adopted as NEW on purpose, 1 pruned)` — из 2 записей осталась 1. R8a: `count 2 keys 1` → третья строка → `✅ attribution-lint OK — 1 file(s) scanned, new 0 · debt 3`, exit 0. Код: `:362` `writeBaseline(findings);` пишет только находки скоупа; `:369` `const prunable = baseline ? known.size - debt : 0;` | S2 | Храповик «только сжимается» не знает скоупа и кратности ключа; `framework/skills/end-chat-soft/SKILL.md:65–66` сам велит путевую форму («name that directory — `… check <dir>`») |
| R4 | `/experience` шлёт урок опасного действия в «`AGENT_GUIDE.md` → Tools», а таблица в 2.8 ушла в `HOUSE_RULES.md` | **#119** (+ второе вхождение комментарием) | **CONFIRMED** `framework/skills/experience/SKILL.md:32` `registry (\`AGENT_GUIDE.md\` → Tools) — where sessions look when they RUN it; the journal entry`; второе — `framework/BUG_FIXING_FRAMEWORK.md:130–131` «Then add it, and document it in `AGENT_GUIDE.md`». Гид: `AGENT_GUIDE.md:771` «house-rules file — `HOUSE_RULES.md` → "Tools of this project"» | S3 | Вынос раздела релизом без сверки указателей поставки на него. TWINS: searched `` `AGENT_GUIDE.md` → (Tools\|Test harness\|Environment dossier\|Push\|Notes from the human) `` — found 2 устаревших (выше); остальные 9 указывают на ПРАВИЛО, которое в гиде осталось (`refresh-context:35`, `TESTING_FRAMEWORK:264`, `_house-rules-template:45/53/96/101`, `fix-vision:34`, `KAIF_REFERENCE:864–894`) |
| R10 | Обновление «сохраняет» указатели контекста агентов (`.clinerules/kaif.md`, `CLAUDE.md`, `AGENTS.md`) и не называет их дельту — Cline тихо без правила `resume` 2.7 | **#120** | **CONFIRMED** `KAIF-CORE.mjs:809` `if (okOnDisk(path) && !FORCE) { log(\`= kept existing ${path}\`); return false; }` для всех четырёх (`:827–832`); в списке пунктов задания (17 id, `:1488–1540`) пункта про указатели нет | S3 | «Писать, если нет» без снимка шаблона; в песочнице (игнорируемых нет) — `+ wrote`, в бою — `= kept` |
| комм. | Контур пишет рендеры в `.kaif/.contour-tmp/`, а набора ignore-first этого пути нет | **#126** | **CONFIRMED** `framework/tools/contour/core.mjs:720` `export const TMP_DIR = '.kaif/.contour-tmp';`; в `KAIF-CORE.mjs:466–475` (`wanted`) его нет | S2 | Список ignore-first ведётся руками отдельно от путей, которые пишут модули (близнец #130) |
| R11 | `check` печатает «HOUSE_RULES.md (no file yet: cp …)», когда файл есть | не KAGO; тот же дефект — **#113** (заведён NDim) | **CONFIRMED** `KAIF-CORE.mjs:140` `const MOVE_OUT_ADDRESS = 'HOUSE_RULES.md (no file yet: cp .kaif/_house-rules-template.md HOUSE_RULES.md) for local rules, routes and tools · …'` и `:142` (STATUS) — константы | S2 (послушание строке затирает заполненный файл скелетом) | Совет двери — статическая строка без пробы диска. Три поля видели: NDim, KAGO, KPOT |
| **R9** | Скелет домашних правил велит писать файл на языке владельца «The owner reads this file», а в KAGO его читает только агент (всё перенесённое — из английского гида) | **ТОЛЬКО В ОТЧЁТЕ** | **CONFIRMED** `framework/templates/_house-rules-template.md:5–6` «The owner reads this file, so the / copy is written in the project's working language (`.kaif/kaif.json` → `language`), headings» | S3 | Язык файла назначен по читателю-предположению; правило «Languages» гида (аудитория решает язык) не применено к новому файлу 2.8 |
| **R12** | Поиск прошлого слова владельца (`review.mjs --search`) не читает записанные согласия (`.claude/settings.json` → `_kaif_hooks`), вопрос задан вслепую к записанному «убедись что опциональный модуль хуков подключен» | **ТОЛЬКО В ОТЧЁТЕ** (пожелание 7) | **CONFIRMED + шире**: `framework/tools/contour/core.mjs:325` `export const ARCHAEOLOGY_PATHS = 'interviews/ GOAL.md MASTER_PLAN.md plans/';` и обход только `*.md` (`:397`). Находка разведки: **в наборе нет `HOUSE_RULES.md`** — куда 2.8 сам переносит «The owner's standing rules» (`_house-rules-template.md:20`), нет `STATUS.md` и «Notes from the human» | S2 (вопрос мимо записанного слова — прямое раздражение владельца, ради которого дверь и строилась) | Две половины одного релиза разошлись: CK перенёс слово владельца в `HOUSE_RULES.md`, OW5 ищет по старому списку. TWINS: searched `interviews/ GOAL.md MASTER_PLAN.md plans/` — found 6: `contour/core.mjs:316,325`, `skills/interview/SKILL.md:205,209`, `KAIF_REFERENCE.md:123`, `skills/fable-judge/SKILL.md:74` |
| **R13** | Харнесс (Claude Code auto mode) отказывает агенту в правке `.claude/settings.json` как `[Self-Modification]`; `_readme` фрагмента и страница выпуска этого не знают. Плюс: первый вызов после сообщения владельца отказан хуком, хотя текстовый ответ уже стоял — лаг записи | **ТОЛЬКО В ОТЧЁТЕ** | **CONFIRMED** (текст): `framework/hooks/settings-fragment.json` `_readme` «…done by the project owner (or by the agent with the owner's quoted consent)»; `hooks/README.md:37–39` «Merge that object into `.claude/settings.json` … with the owner's consent recorded» — о запрете харнесса ни слова; текст выпуска `interviews/interview_042_…:155` «merge the new `PreToolUse` entry». Лаг — **CONFIRMED как заявленный GAP**: `framework/hooks/pretool-owner-word.mjs:31` «GAP: the transcript lags — one call may pass before the message is visible (the next call is gated), one reminder may repeat» / «right after an answer». Сам запрет харнесса — **NOT-VERIFIABLE-HERE** (другая машина и режим) | S3 | Документ подключения не называет, КТО физически может влить фрагмент при харнессе, охраняющем свои настройки. **Ограничение для #115** («подключай всё само»): в auto mode Claude Code агент этого не может |
| **R7 / пож. 6** | Ручной вынос модуля: «no other live reference» четыре раза ложно; 45 ссылок в пять раундов; две указывали на текст, который перенёс/переписал МЕХАНИЧЕСКИЙ проход 2.8 (`tools/questions-guard.mjs:70` → `.kaif/KAIF_REFERENCE.md` §17) | **ТОЛЬКО В ОТЧЁТЕ** | **CONFIRMED (отсутствие)**: 17 пунктов задания (`closing-gates · deprecations · language-arrivals · local-inventories · merge-diverged · merge-modules · mode-switch · owner-conventions · owner-voice-core · placeholders · policy-changes · project-name · review-news · sphere-sync · stale-claims · verdict-mismatch · withdrawn-phrases`) — ни один не перечисляет места проекта, цитирующие удалённый/перенесённый текст | S2 (≈ час+ и четыре прохода судьи) | Обновление знает удалённый текст (`−`-строки диффа), но не ищет его цитаты в проекте. Пересечение `ideas/31` п. 30 (#85) |
| **R8** | Правило-из-слова-владельца: две «дословные» цитаты взяты из исправленной копии агента; шаги агента под подписью `[OWNER]` без `[AI]` находили четыре прохода — «The rule-form conversion of owner text is where the agent's words slip in under the owner's name most easily.» | **ТОЛЬКО В ОТЧЁТЕ** | **PARTIAL**: источник правильно назван — `_house-rules-template.md:23–24` «the commit that recorded them verbatim first»; но у скелета правила нет места для пометки шагов агента: `:22–23` «Each rule is a strict rule in the agent's wording … with / ONE provenance line» + `:33` `[OWNER] <date and time> · <where the verbatim lives: commit <hash> · interview #NNN, QN · decision #NN>` — всё правило подписано владельцем | S2 (слова агента под именем владельца) | Скелет «правило, не цитата» (CK 2.8) без слота `[AI]`-шагов; `kaif-attribution-lint` доволен адресом коммита и шагов не различает (`ideas/31` п. 22 — того же модуля) |
| **пож. 5** | Объявленный архив (`archives.GOAL.md`) снимает дверь бюджета, но не цену входа: `/resume` читает `GOAL.md` целиком (2056 строк), крупнейший пункт входа в 186k токенов | **ТОЛЬКО В ОТЧЁТЕ** | **CONFIRMED** `framework/skills/resume/SKILL.md:26` «- `GOAL.md` — the owner's vision» (без условия архива); `KAIF-CORE.mjs:3665` `const entryCore = Object.keys(DOC_BUDGETS).filter((d) => okOnDisk(d));` — архив считается в цене входа, дайджест вместо него не читается | S3 | Архив объявлен для одной двери (бюджет), ритуал входа его не знает. `ideas/31` п. 24 |
| комм. | `npm run check` насчитал 101 `.mjs`, пока в корне лежал транзитный `KAIF-LOADER.mjs` | только в поправке | NOT-VERIFIABLE-HERE (гейт проекта); механизм — транзит в корне до `update-verify` (`KAIF-CORE.mjs:2766` удаляет его лишь там) | S3 | Транзит в корне виден гейтам проекта, ходящим по диску |
| комм. | Контур закрыт через 16 с собственным Stop-хуком KAGO (Windows 11 26200 без `wmic`) | не KAIF (`bugs/143` проекта) | **REFUTED как KAIF**: `grep -rn -i wmic framework/` → 0 строк | — | — |
| R5 R6 R8a-проза R12-вопрос | Ошибки агента (ложь в таблице стенда, съеденный `\t`, указатель кода, ложные заявления о полноте) | — | не KAIF | — | Уроки EXP-0297/0298/0299 проекта |

**Что в поле сработало (живьём).**
- Оракул рендера: «2.8's `diff --render` answered this project's 2.7 wish §4.2 exactly»; R14 «sandbox = live for the fifth release in a
  row; `--render` made the hand merge cheap».
- Привязка репетиции на bootstrap: «exit 0 · `rehearsal verdicts loaded … (3 file(s))` · nothing frozen · same counters».
- Архив владельца: «`check` now prints `GOAL.md: a declared archive of the owner (2056 lines — information, never a stop); its digest
  ЗАКАЗ.md carries the budget: 137 of ~300` — this answers origin #84».
- Чужая очередь (#100): «The first `--queue --list` after the #100 fix (which works — exit 0, `ℹ очередь у проекта своя …`)».
- Свёртка линтера опыта: «248 warnings under the 2.7 linter on this journal → one fold line for 246 + 2».
- `report` ×5: «#109 read back: 6092 bytes, Cyrillic intact, no BOM».
- Хук `pretool-owner-word` на реальном пути: «wired by the OWNER after the harness refused the agent's edit (R13); seen firing the same hour».
- Цена входа: «`~ 192k tokens — 19 %` after the mechanical pass → `~ 186k tokens` on the final tree».
- Итог автора: «The update itself was cheap and exact — the 2.8 machinery and its render oracle did what the release page promises.»;
  судья: «Every refutation landed on my claims about my own hand work (completeness, attribution, one sentence of a delivered ticket),
  never on the update's mechanics: the route, the counters, the verbatim moves, the gates held in every pass.»

**Слова владельца (дословно).** Приказ: «выполни обновление KAIF до 2.8». Мандат на тикеты (2026-08-30): «БАГИ В КАИФ ТОП ПРИОРИТЕТ
СРЕДИ ВСЕХ… НИКАКИХ ОДОБРЕНИЙ!». Контур: «давай сделаем … интерактивный контур, голос». Ответ в интервью 020: «Не понимаю проблемы
и вопроса. Нужно проще пояснить». Про хуки (2026-08-14): «убедись что опциональный модуль хуков подключен»; при подключении: «что
куда добавить нужно». Слово 08.09: «туши защитой бродкаст и парсек, и снятием защиты — поднимай назад». (Архив — выбор варианта A
интервью 017, текст варианта: «GOAL.md остаётся дословным архивом, append-only».)

**Пересечения.** `ideas/31` п. 22 (окно линтера авторства — тот же модуль, что #111/#112/R8), п. 24 (цена входа — пож. 5), п. 30
(#85 — текст вокруг указателя на вынесенный раздел — R7/пож. 6; #83 R1(а) — адрес без сверки — R8), п. 1 (хуки) — R13. Тикеты:
#115 (R13 — ограничение), #113 (R11), #126/#130 (ignore-first). `bugs/` истока: `bugs/111` (интервью 020 — тот же класс, до фикса),
`bugs/123` (R13 — лаг).

---

## #129 — KPOT 2.1 → 2.8: прыжок в семь версий прошёл; все грабли — только в отчёте

**Маршрут.** 2.1 → 2.8 «in one step (seven versions)», bootstrap тонким `KAIF.md` + загрузчик, репетиция на `git clone --no-hardlinks`
(не `git archive`, как велит `/kaif-update`), бой **без** `--rehearsal` (в списке NOT exercised: «`--rehearsal <receipt>` binding (the sandbox used its own clone, the live run was not bound to its receipt)»). Windows 11,
PowerShell 5.1 + Git Bash, `ru`, 5 систем агентов, `tracking: origin`; Claude Opus 5.5 (1M), Claude Code в VS Code. Длительность не
названа (отчёт 2026-09-27 10:27:57Z). Счётчики: «**31 replaced · 44 modules merged in place · 39 added · 28 kept · 6 adopted**»;
задание 15 пунктов, 20 модулей руками; механика `e7711f8` (119 файлов), руки `ddac62e` (138 файлов).

**Что сломалось именно из-за длины прыжка.** (1) отставной `/end-chat` (снят в 2.4) остался в STATUS как маршрут закрытия — у записи
отставки нет фраз поиска (R2); (2) строка версии «KAIF 2.1 «Strong KAIF»» в первом файле `/resume` (R1); (3) 39 изменений политик
2.2–2.8 приняты одним мандатом владельца («Policy changes 2.2–2.8 accepted by the owner's blanket word»); (4) `update-verify` — 236
«обещанных строк не найдено», все — переформатирование/перевод/заполнения (дополнение §6); (5) молитва и символ веры пришли НОВЫМИ
(в 2.1 их не было: `git show v2.1:framework/AGENT_GUIDE.md` — блока `KAIF:CREED` нет) → R7, R8; (6) дверь бюджета: STATUS 425/200 →
стрижка до 226 (211 строк в летопись, 0 потерь); (7) `sync` перезалил 175 зеркал.

| Код | Суть | Тикет | Сверка с HEAD | S | Класс |
|---|---|---|---|---|---|
| **R1** | `stale-claims` молчит на «`**The framework is KAIF 2.1 «Strong KAIF» and the OWNER-REVIEW CONTOUR is live**`» | **ТОЛЬКО В ОТЧЁТЕ** | **REFUTED для процитированной строки / NOT-VERIFIABLE-HERE для строки KPOT целиком.** Проба (ядро HEAD, `stale-claims --from 2.1 --to 2.8`): `· STATUS.md:3 — **The framework is KAIF 2.1 «Strong KAIF» and the OWNER-REVIEW CONTOUR is live**` — названа. Молчит та же фраза в двух формах: с датой вне скобок (`… is live** since 2026-08-02.`) — `KAIF-CORE.mjs:1318` правило датированной записи; и со словом новой версии в строке (`… (KAIF 2.8 update pending)`) — `:1296` `if (line.includes(toVersion)) continue;`. Какая из них была у KPOT на `STATUS.md:70`, отсюда не видно | S3 | Эвристики-глушители сканера (дата = журнал; новая версия в строке = история) бьют по строке-заявлению STATUS. Сосед по сканеру — #117 (скобки) |
| **R2** | Ничто не ищет в живых документах ОТСТАВЛЕННЫЕ навыки/команды: STATUS звал «the heavy closure is `/end-chat`» | **ТОЛЬКО В ОТЧЁТЕ** (пож. W1) | **CONFIRMED** `tools/build-framework.mjs:373–375` запись отставки `/end-chat` — `path`/`reason`/`successor`, без `since`/`search`; фразы есть только у DELIVERY — `:385` `since: '2.7', search: ['DELIVERY:', 'SYSTEMS_REGISTRY', 'delivery metric'] },`; пункт строится лишь из записей с `search` (`KAIF-CORE.mjs:1095–1096`) | S2 (ложный маршрут в документе входа следующей сессии) | Механизм CH 2.8 («снятие функции не оставляет текстов») включён данными только для одной из двух отставок. TWINS: searched записи `DEPRECATIONS` без `search` — found 1 of 2 (`/end-chat`); и карта переименований 2.7 (`build-framework.mjs:398–411`, `baton` → `handover`) — слово в документах владельца велено менять «BY HAND», поиска нет |
| R3 | «no file yet» при существующем `HOUSE_RULES.md` | дубль **#113** | **CONFIRMED** (см. #122 R11) | S2 | — |
| **R4** | `⚠ language mix: 3 of 37 skills are a MIX — … interview (100 % foreign), release (98 % foreign), resume (100 % foreign)` на английских по политике навыках | **ТОЛЬКО В ОТЧЁТЕ** | **PARTIAL**: так задумано — `KAIF-CORE.mjs:3605` `if (share >= LANGUAGE_MIX_FOREIGN_SHARE) mixed.push(\`${n} (${Math.round(share * 100)} % foreign)\`);` + комментарий «ONE (English body, three stray Cyrillic words) sits at 0.993 — … named as a mix by this one»; дефект — формулировка (`Math.round` печатает «100 %» при нескольких русских словах) и то, что русская ДОСЛОВНАЯ цитата владельца в английском навыке — законна по канону, а линтер её клеймит | S3 | Метрика языка не отличает цитату владельца от смешения. `ideas/31` п. 3 (линтеры под язык проекта) |
| **R5** | Фрагмент хуков в форме `command` + `args`; соседний проект пишет, что у Claude Code `args` нет | **ТОЛЬКО В ОТЧЁТЕ** | **REFUTED по свидетельству истока**: `researches/19_…:40–44` «`args` ПРИСУТСТВУЕТ → **exec-форма**»; исток сам подключён так (`.claude/settings.json`), и `pretool-owner-word.mjs:36–40` пишет ON-REAL-PATH сессий истока. Остаток — **NOT-VERIFIABLE-HERE**: с какой версии харнесса `args` принимается, фрагмент не называет | S3 | Документ фрагмента не называет минимальную версию харнесса |
| **R6** | `diff --source .kaif/install --render` отказывает: `✖ not found in source: .kaif\install\kaif-manifest.json` | **ТОЛЬКО В ОТЧЁТЕ** (W4) | **CONFIRMED** `framework/installer/KAIF-LOADER.mjs:30` `const ARTIFACTS = ['KAIF-CORE.mjs', 'KAIF-CORE-BUNDLE.md'];` — манифест читается в память (`:97`) и не пишется; ядро уходит в `:32` `CORE_DEST = '.kaif/kaif-core.mjs'`; `KAIF-CORE.mjs:1599` требует трёх артефактов в каталоге | S3 | Каталог установки — не «источник» по собственной форме ядра |
| **R7** | Задание сеет английский символ веры с `<AUTHOR>`, не зная готовой русской формулировки владельца из соседнего проекта | **ТОЛЬКО В ОТЧЁТЕ** (W6) | **CONFIRMED** (отсутствие): в ru-пакете нет русского символа веры/молитвы — `grep -rln "СТАРАЕМСЯ\|МОЛИТВА" framework/templates/` → 0; шаблон `AGENT_GUIDE.md:8` «render the creed in the owner's language; the owner may reword it» | S3 | Канон-текст владельца истока (`AGENT_GUIDE.md:7` корня — «ИБО МЫ СТАРАЕМСЯ…») не едет в пакет его языка; каждое ru-поле переводит заново (корень `bugs/110`) |
| **R8** (доп.) | `update-verify` валит обновление: `✖ a section of this release did not arrive: AGENT_GUIDE.md :: ## 🙏 THE PRAYER BEFORE WORK` — раздел стоит под «## 🙏 МОЛИТВА ПЕРЕД РАБОТОЙ» | **ТОЛЬКО В ОТЧЁТЕ** | **CONFIRMED** `KAIF-CORE.mjs:2890` `const onDiskSigs = new Set(splitModules(…).map((m) => m.signature));` — сверка по строке заголовка; якорный блок `<!-- KAIF:PRAYER:BEGIN -->` (`framework/AGENT_GUIDE.md:13`) не учитывается; обход — для «translated» файла (`:2893` ⚠), а гид KPOT английский | S3 (обход: английский заголовок над русским телом — канон велит молитву на языке владельца) | Адрес модуля = заголовок; у якорных блоков адрес надёжнее. Близнец: `KAIF:CREED` (без заголовка — не задет) |
| **§6** | 236 «promised upstream line not found» — все переформатированные абзацы, символ веры/молитва на русском, заполненные плейсхолдеры, канон KPOT | **ТОЛЬКО В ОТЧЁТЕ** | **CONFIRMED** `KAIF-CORE.mjs:2923` построчное `.includes(line.slice(2))` — перенос строк = «отсутствие»; предупреждение, не отказ (`:2929`) | S3 (шум, в котором тонет настоящая потеря) | Построчная сверка смысла; известный класс #79 |

**Что в поле сработало.** «The live changed-file set and the generated `KAIF_UPDATE_TASK.md` were **byte-identical** to the sandbox's
(`diff` of `git status --short` and of the task file: 0 lines)»; ratchet бюджета + стрижка «0 lost by a line-set check»; контур
«`.kaif/tools/contour/review.mjs --selftest` — 111 checks green», `--queue --list`, `--search`; `update-verify` поймал R8 (реальный
сигнал). Судья: «Every claim the update's judge item depends on reproduced: the version is recorded, nothing the owner wrote was lost,
the merges are real, the gates pass and no product code changed.»

**Слова владельца.** «обнови версию KAIF до 2.8, принимай все новинки, которые приносит КАИФ». Символ веры владельца (из ndim
`902796c6`): «ВЕРИТЬ В ПРОДУКТ И В ИДЕЮ НИКОЛАЯ…». Исключение R5 из `GOAL.md`: «по возможности».

**Пересечения.** #113 (R3), #117 (R1 — сосед по сканеру), #114 (39 политик одним мандатом — ещё одно поле за «не спрашивать»),
`bugs/110` (R7), `ideas/31` п. 3 (R4), п. 30 (#79 — §6), п. 1 (R5).

---

## #131 — Game Of Dream 1.2 → 2.8: ручное 1.x без ядра и git → рендер 2.8; заведён #130

**Маршрут.** 1.2 → 2.8 (история маркера «`1.2 → 2.8 (legacy-bootstrap)`»). Исходное: развёртывание 1.x руками агентом Zoo Code
(2026-07-03), ядра и манифеста нет, три канона пересказаны по-русски (~5 % шаблона), проект не под git. Путь: `git init` + базовый
коммит → ассеты v2.8 и v1.2 (`--baseline`) один раз → репетиция на копии `git archive` (дважды: вторая с `--agents
claude-code,codex,grok-build,cline,zoo-code`) → бой с `--rehearsal`. Windows 11 Pro 10.0.26200, Node v24.15.0, git 2.43.0.windows.1
(`core.ignorecase=true`; из автозахвата #130), `ru`, `i18n translated` (автозахват #130), 5 систем. Модель агента не названа.
Длительность не названа (#130 — 19:39:58Z, отчёт — 20:16:13Z, 2026-09-27). Счётчики: «`15 replaced, 28 modules merged in-place, 67
added, 21 kept`», задание «`14 items, 3 diverged files, 15 files with module diffs`».

**Что сломалось из-за длины прыжка.** (1) маркер 1.x сузил установку до одной системы (R2); (2) у пересказанного канона ни одного
общего заголовка — `baseFound 0 of 14 → frozen`, 42 модульных диффа в пересказ (R3), выход — заменить рендером; (3) у шести навыков
«local edits», единственная правка — незаполненный `<COMMIT_COMMAND>` 1.2 (мимоходом в §1 п. 5); (4) `stale-claims` 14 строк, STATUS
305 → 83, `goal.md` → `GOAL.md` руками.

| Код | Суть | Тикет | Сверка с HEAD | S | Класс |
|---|---|---|---|---|---|
| R1 | Неякорная строка `KAIF.md` в `.gitignore` на регистронезависимом git прячет `.clinerules/kaif.md` (и `.roo/rules/kaif.md`) — каждый клон краснит `check` | **#130** (+1 комментарием) | **CONFIRMED** `KAIF-CORE.mjs:466` `const wanted = ['.kaif/install/', 'KAIF.md', 'KAIF-LOADER.mjs', TASK_FILE, UPDATE_TASK,` — без `/`. Проба (`core.ignorecase true`): `.gitignore:1:KAIF.md	.clinerules/kaif.md` · `.gitignore:1:KAIF.md	.roo/rules/kaif.md` · `.gitignore:2:KAIF-LOADER.mjs	sub/KAIF-LOADER.mjs`; при `ignorecase false` — exit 1 (не игнор) | S2 | Корневые транзиты записаны без якоря. TWINS: searched неякорные имена в `wanted` — found 6: `KAIF.md`, `KAIF-LOADER.mjs`, `KAIF_ADAPTATION_TASK.md`, `KAIF_UPDATE_TASK.md`, два `*.superseded.md`; реальные жертвы — только у `KAIF.md` (два указателя). Семья функции `ensureIgnoreFirst`: #126, `ideas/31` п. 5 (K-R11, LF в CRLF) |
| **R2** | Маркер 1.x молча сужает установку до `zoo-code`, хотя на диске `.claude/skills/`; строка в логе есть, в задании нет | **ТОЛЬКО В ОТЧЁТЕ** | **CONFIRMED** `KAIF-CORE.mjs:3132` `if (inherited) AGENTS = inherited;` + `:3133` строка лога; сверки с каталогами агентов на диске нет, пункта задания нет (список 17 id) | S3 (лишняя репетиция) | Защита «не расширять молча» (bug 14) без встречной — «не сужать мимо диска» |
| **R3** | Для пересказанного pre-2.0 канона (`baseFound 0`) задание предлагает только «сливай руками» 42 диффа; путь «прими рендер, перенеси факты» не назван | **ТОЛЬКО В ОТЧЁТЕ** | **PARTIAL**: оракул назван — `KAIF-CORE.mjs:1489` «the oracle of that hand merge: `node .kaif/kaif-core.mjs diff --source <the receipt's source> --render <file>`»; маршрут замены при нуле общих заголовков — нет | S3 | Текст пункта не ветвится по вердикту `frozen`/`baseFound 0` |
| **R4** | Заполнение по умолчанию `<COMMIT_COMMAND>` = `git add -A && … && git push`: падает без remote и спорит с правилом «инструмент называет набор» | **ТОЛЬКО В ОТЧЁТЕ** | **CONFIRMED** `KAIF-CORE.mjs:644` `'<COMMIT_COMMAND>': 'git add -A && git commit -m "<msg>" && git push',` против `framework/AGENT_GUIDE.md:558–559` «a commit tool that stages everything (`git add -A`) AFTER your inspection makes the two different / sets. So the tool NAMES its set out loud before committing» | S2 (потенциал S1: `add -A` тащит в коммит всё, в т.ч. приватное) | Заготовка коммита в поставке против git-гигиены гида. TWINS: searched `<COMMIT_COMMAND>` и `git add -A` в `framework/skills/` — found 8: `autoloop:74`, `dayloop:71`, `nightloop:60`, `propose-idea:62`, `release:128`, `report-bug:220` + `end-chat-soft:113`, `end-chat-force:36` (= `ideas/31` п. 27) |
| **R5** | Строку версии внутри огороженного блока нельзя пометить `KAIF-VERSION-OK` — HTML-комментарий там виден буквально | **ТОЛЬКО В ОТЧЁТЕ** | **PARTIAL**: сканер принимает голый токен в любом месте строки — `KAIF-CORE.mjs:1310` `if (/KAIF-VERSION-OK/i.test(line) \|\| …) continue;`; проба: `├── KAIF_OLD.md # historical: the KAIF 1.1 plan (KAIF-VERSION-OK)` и `… — KAIF-VERSION-OK` — молчат, без токена — названа. Дефект — совет: `:4429` и пункт задания называют только форму `<!-- KAIF-VERSION-OK: reason -->` | S3 | Совет сканера уже, чем сканер |
| **мимоходом** | Шесть навыков 1.2 прочитаны как «local edits», единственная разница — незаполненный `<COMMIT_COMMAND>` | **ТОЛЬКО В ОТЧЁТЕ** (фраза §1 п. 5) | **CONFIRMED по коду / NOT-VERIFIABLE-HERE на дереве GoD**: у `<COMMIT_COMMAND>` есть значение по умолчанию (`:644`), поэтому рендер базы 1.2 несёт заполненную строку; `matchFills` оставляет литералом только слоты, ещё стоящие в шаблоне ПОСЛЕ значений (`:716` `const literalOnDisk = new Set(slots.filter((s) => disk.includes(s)));` — `slots` берутся из шаблона уже после значений) — литерал на диске не совпадает с заполненной базой → «diverged» | S3 | Слот со значением по умолчанию ≠ слот, заполненный руками; ручное 1.x оставило литерал. Близнец R4 (то же значение) |
| агент | Факты без замера; «клон длинных путей» — диагноз CRLF ложный (`git -c core.longpaths=true clone` не сохраняет настройку) | — | не KAIF: `/kaif-update:68` верно велит `git config core.longpaths true` в копии | — | EXP-0003 проекта |

**Что в поле сработало.** Репетиция с `--agents` и привязкой: «the live log equalled the rehearsal log except the rehearsal line
(`diff` of both logs minus that line: empty)»; рендер как замена замороженного канона (`diff --source <assets28> --render <file>`);
чистый клон: «Fresh clone of `b9213ae` (with `core.longpaths=true`): `git status` clean, `check` ✅ `manifest satisfied: 103 files +
152 agent artifacts present`»; цена входа «~ 74k tokens — 7 %»; `report` доставил #130; `kaif-testrun-lint` «`✅ testrun-lint OK — 1
report(s) under testcases/reports/, 0 findings`»; судья #1 (REFUTED) нашёл R1, которого живое дерево не показывало.

**Слова владельца.** «Пожалуйста, однови KAIF до 2.8, ДА на привнесение всех изменений, которые регламентирует КАИФ».

**Пересечения.** #130 (R1), #126 и `ideas/31` п. 5 (та же функция ignore-first), `ideas/31` п. 27 (R4 — точный близнец), #114
(мандат «ДА на привнесение всех изменений» — третье поле подряд отвечает на `policy-changes` заранее), `bugs/110` (символ веры —
«creed/prayer rendered from the origin's own Russian text»).

---

## Приём поля — наблюдения для открытых багов истока (три отчёта)

| Баг | Условие DONE | Наблюдение в отчётах |
|---|---|---|
| `bugs/110` | ru-развёртывание, обновившееся с «STRIVE», несёт «СТАРАЕМСЯ» | **Нет.** Оба ru-поля с новым символом веры обошли английский шаблон: KPOT — «the creed is the owner's OWN Russian wording (ndim commit 902796c6, byte-equal per the judge, claim 7)», процитировано лишь «ВЕРИТЬ В ПРОДУКТ И В ИДЕЮ НИКОЛАЯ…»; GoD — «creed/prayer rendered from the origin's own Russian text» (корень истока `AGENT_GUIDE.md:7` несёт «ИБО МЫ СТАРАЕМСЯ» — косвенно, слова в отчёте нет). KAGO символ веры не трогал. Вывод для класса: 2 из 2 ru-полей берут русский текст мимо шаблона → R7/W6 |
| `bugs/111` | вопрос владельцу через обновлённый `/interview` (сценарием), ответ выбором | **Нет.** Контр-пример ДО фикса: KAGO интервью 020 (2026-08-30), ответ владельца «Не понимаю проблемы и вопроса. Нужно проще пояснить», `choice: null` — тот же класс во втором проекте. KPOT: «a live contour page shown to the owner (next in this session)» — не исполнено |
| `bugs/113` | «Готово» без замечаний на вычитке/макете | **Нет.** KAGO: «the owner page's one-at-a-time saves and `--wait` (KAGO runs its own contour)» — не исполнено; позже первая живая страница закрыта через 16 с собственным хуком проекта |
| `bugs/114` | строка «renamed: … baton … → … handover …» и один заголовок (маршрут ≥ 2.6 → 2.7) | **Нет — и на этих маршрутах невозможно.** KAGO 2.7 → 2.8 не пересекает карту 2.7; у KPOT (2.1) и GoD (1.2) не было `/end-chat-soft`/`/end-chat-force` (родились в 2.4 — пришли новыми файлами), а `/code-revision` 2.1 имел «## Step 0 — scope and cadence», не старую половину пары (`git show v2.1:framework/skills/code-revision/SKILL.md`). Нужен маршрут с 2.4–2.6 с правленым шагом 1 |
| `bugs/116` | неделя без окна/звука тестовой страницы у владельца истока | **Нет** — условие истока, поле его не видит |
| `bugs/121` | проба из README модуля хуков в окне PowerShell владельца развёрнутого проекта | **Нет.** KAGO: владелец вставил блок в `.claude/settings.json` и перезапустил VS Code (не проба README); KPOT: «the refresh hooks by hand (timer, resume word, owner word)» и «all five scripts exit 0 on empty input and inject on realistic input» — руками агента |
| `bugs/123` | сообщение владельца посреди хода исполнено по правилу (0 вызовов до ответа; хук) | **Частично, не закрывает.** KAGO R13: «The first tool call after his next message was refused by the gate with his words — `PreToolUse:Bash hook error: … KAIF: the owner wrote while you were working (2026-09-26T13:01:45.307Z) and there is no TEXT answer after it yet` — although a text answer stood right before that call: the transcript lag the hook's own `GAP` names. The next call passed.» — хук жив в поле, текстовый ответ шёл раньше первого вызова, но то, что сообщение пришло посреди хода, говорит лишь сам хук (13:01:45Z ≈ через минуту после перезапуска VS Code), а отказ — ложный по лагу. KPOT, в списке NOT exercised: «the `PreToolUse` hook against a real mid-turn owner message» |
| `bugs/125` | очередь владельца ≥ 2 документов с возвратом на список | **Нет** (ни в одном отчёте живой очереди владельца нет) |
| критерии 2.8 №5/№6/№22 | «стоп» / «переключись на …» посреди хода; объяснение картинкой | **Нет.** KAGO прямо: NOT exercised «`.kaif/_explain-page-template.html`»; в KPOT и GoD — ни слова |

**Попутное полевое свидетельство для открытого тикета #114 (не бага истока):** все три владельца заранее ответили на пункт
`policy-changes` мандатом — «выполни обновление KAIF до 2.8» + «the first five `[AI]`, veto open» (KAGO), «принимай все новинки,
которые приносит КАИФ» (KPOT, 39 политик), «ДА на привнесение всех изменений, которые регламентирует КАИФ» (GoD).

---

## Класс поверх трёх отчётов

1. **Механика обновления — чиста; цена — ручная половина и проза агента.** 5 + 1 + 2 проходов судьи: ни одного опровержения
   маршрута, счётчиков, песочницы. Опровергнуто — «полнота» ссылок (KAGO R7, 45 мест), атрибуция (KAGO R8), непромеренные факты (GoD),
   устаревшие указатели вне модулей (KPOT F1/F2). Машинерия знает, что удаляет, но не ищет, кто на это ссылается (пож. 6 KAGO,
   W1 KPOT — одно и то же «найди в проекте имена и цитаты того, что релиз убрал/перенёс»).
2. **Новинка 2.8 `HOUSE_RULES.md` обжита с тремя заусенцами одного происхождения:** совет «no file yet» при существующем файле
   (#113, три поля), язык скелета по неверному читателю (R9), поиск прошлого слова владельца файл не читает (R12 + находка разведки).
   Плюс указатели поставки на старый дом таблицы инструментов (#119, два места).
3. **Длина прыжка множит шум, а не ломает механику:** 236 ложных «не найдено», 39 политик, 14 строк `stale-claims`, отставка четырёх
   версий назад без поиска фраз, маркер 1.x с неверными системами агентов, база с незаполненным слотом → «local edits».
4. **ignore-first — один список руками:** #130 (без якоря), #126 (нет `.contour-tmp`), K-R11 (`ideas/31` п. 5, LF в CRLF) — одна
   функция `ensureIgnoreFirst` (`KAIF-CORE.mjs:465–482`).

## Живёт ТОЛЬКО в отчётах (никто другой не разберёт)

KAGO: R9 · R12 (+ `HOUSE_RULES.md` вне поиска) · R13 · R7/пож. 6 · R8 · пож. 5. — KPOT: R1 · R2 · R4 · R5 · R6 · R7 · R8 · §6. —
GoD: R2 · R3 · R4 · R5 · литерал `<COMMIT_COMMAND>`. (R11 KAGO и R3 KPOT — это #113; R1 GoD — #130.)

## Таблица

| Тикет · находка | Вердикт сверки | S | Цена (чаты) | Кандидат-эпик (рабочее имя) |
|---|---|---|---|---|
| #122 R1 → #109 | CONFIRMED (проба) | S2 | 0,25 | SC «Сканеры и базы» |
| #122 R2 → #111 | CONFIRMED (проба) | S2 (промах S1) | 0,25 | SC «Сканеры и базы» — база по образцу experience-lint (отпечатки, git-список) |
| #122 R3/R8a → #112 | CONFIRMED (проба) | S2 | 0,25 | SC «Сканеры и базы» |
| #122 R4 → #119 (+ BUG_FIXING:130) | CONFIRMED | S3 | 0,25 | HR «Дом правил обжит» + страж указателей на вынесенные разделы |
| #122 R10 → #120 | CONFIRMED | S3 | 0,5 | UT «Обновление без хвостов» |
| #122 комм. → #126 | CONFIRMED | S2 | 0,25 (вместе с #130) | GI «ignore-first от путей модулей» |
| #122 R11 / #129 R3 → #113 | CONFIRMED | S2 | 0,25 | HR «Дом правил обжит» |
| #122 R9 (только отчёт) | CONFIRMED | S3 | ≤ 0,25 | HR |
| #122 R12 (только отчёт) + `HOUSE_RULES.md` вне поиска | CONFIRMED | S2 | 0,25–0,5 | HR / OW-хвост (одна константа + 5 текстов) |
| #122 R13 (только отчёт) | CONFIRMED текст · NOT-VERIFIABLE-HERE харнесс | S3 | 0,25 (решать вместе с #115) | HK «Кто подключает хуки» |
| #122 R7 / пож. 6 (только отчёт) | CONFIRMED (отсутствие пункта) | S2 | 0,75–1 | UT «Обновление без хвостов» — пункт «цитаты удалённого текста в проекте» |
| #122 R8 (только отчёт) | PARTIAL | S2 | 0,25 | HR (слот `[AI]`-шагов в скелете правила) |
| #122 пож. 5 (только отчёт) | CONFIRMED | S3 | 0,5 | CK-хвост «цена входа» (`ideas/31` п. 24) |
| #129 R1 (только отчёт) | REFUTED для цитаты · NOT-VERIFIABLE-HERE для строки KPOT; два глушителя найдены | S3 | 0,25 | SC «Сканеры и базы» |
| #129 R2 (только отчёт) | CONFIRMED | S2 | 0,25 (данные `search` для `/end-chat` и `baton`) | UT «Обновление без хвостов» |
| #129 R4 (только отчёт) | PARTIAL (замысел; формулировка) | S3 | ≤ 0,25 | SC |
| #129 R5 (только отчёт) | REFUTED (исток) · NOT-VERIFIABLE-HERE (версия харнесса) | S3 | ≤ 0,25 (строка в `_readme`) | HK |
| #129 R6 (только отчёт) | CONFIRMED | S3 | ≤ 0,25 | UT |
| #129 R7 (только отчёт) | CONFIRMED (отсутствие) | S3 | 0,25 | вместе с `bugs/110`: русский символ веры владельца — в ru-пакет |
| #129 R8 (только отчёт) | CONFIRMED | S3 | 0,25 | UT (якорный блок как адрес) |
| #129 §6 (только отчёт) | CONFIRMED | S3 | 0,5 | UT (сверка без переносов строк; `ideas/31` п. 30 #79) |
| #131 R1 → #130 | CONFIRMED (проба) | S2 | 0,25 (+0,5 `check` по закоммиченному дереву) | GI |
| #131 R2 (только отчёт) | CONFIRMED | S3 | ≤ 0,25 | UT |
| #131 R3 (только отчёт) | PARTIAL | S3 | ≤ 0,25 | UT |
| #131 R4 (только отчёт) | CONFIRMED (8 мест) | S2 | 0,25 (= `ideas/31` п. 27) | GT «Заготовки коммита под гигиену» |
| #131 R5 (только отчёт) | PARTIAL (сканер шире совета) | S3 | ≤ 0,25 | SC |
| #131 литерал `<COMMIT_COMMAND>` (только отчёт) | CONFIRMED по коду · NOT-VERIFIABLE-HERE на дереве | S3 | ≤ 0,25 | GT / UT |
