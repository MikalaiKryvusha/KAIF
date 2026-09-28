# Разведка 2.9 — группа update: #113 · #114 · #115 · #120 · #130

> **Тикеты:** #113 · #114 · #115 · #120 · #130 (тела + все комментарии из `scratchpad/issues/<N>.md`; прочитаны
> 2026-09-28 17:15 UTC). **Сверено с HEAD** `52f688c` (`framework/` и `tools/` = `v2.8`); `dist/KAIF-CORE.mjs` побайтно
> равен `framework/installer/KAIF-CORE.mjs` (`cmp` → равны). Дайджест записан 2026-09-28 17:28 UTC.
> **Пробы** — только в `mktemp -d` (исток не тронут, `git status --short` пуст):
> - `P28a` = `/tmp/tmp.Wim5W0XrLN/p` — чистая установка 2.8 (`install --bundle dist/KAIF-CORE-BUNDLE.md --lang en`, все пять систем);
> - `P26→28` = `/tmp/tmp.Lwp70OK591/p` — установка 2.6 из `git show v2.6:dist/*` (`--agents claude-code,codex,cline,zoo-code`),
>   коммит, затем `update --source <копия dist 2.8>` (локальный источник, сеть не нужна);
> - `P28b` = третья чистая установка 2.8 (модули-линтеры, `.gitignore`).
> Везде в пробах ядро положено руками в `.kaif/kaif-core.mjs` (загрузчик не запускался).

---

### #113 — ворота бюджета печатают «no file yet: cp …» константой: исполнивший строку затирает заполненный HOUSE_RULES.md скелетом

- **Суть:** адрес выноса в `DOC_BUDGETS` — строковая константа с готовой командой `cp .kaif/_house-rules-template.md HOUSE_RULES.md`;
  она печатается на каждом закрытии проекта над бюджетом, даже когда `HOUSE_RULES.md` уже есть и заполнен. Слабая сессия, послушно
  исполнившая строку, заменит файл владельца пустым скелетом (near-miss в NDim Space: 241 строка).
- **Сверка с HEAD:**
  - «The source is a string constant, not a disk check» — **CONFIRMED.** `framework/installer/KAIF-CORE.mjs:140`
    `const MOVE_OUT_ADDRESS = 'HOUSE_RULES.md (no file yet: cp .kaif/_house-rules-template.md HOUSE_RULES.md) for local rules, routes and tools · the chronicle PROJECT_HISTORY.md · researches/';`
    и строка `STATUS.md` `:142` несёт ту же скобку (`HOUSE_RULES.md (no file yet: cp .kaif/_house-rules-template.md HOUSE_RULES.md) for standing rules and reference tables' },`).
    Номера строк тикета (`:140`, `:142`) совпадают с HEAD.
  - «in all three places that use the address» — **CONFIRMED**, три печатника: предупреждение `check` (`:222` и `:234`,
    `move content OUT to ${overflowTo}, rather than raise the budget`), прогноз задания обновления `closingGatesForecast`
    (`:268`, `the overflow moves to ${v.overflowTo}`), дверь `--gate-budgets` (`:3868`,
    `` console.error(`${v.pass ? '↳' : '✖'} ${v.doc}: own lines ${v.own} of budget ${v.budget} → ${v.overflowTo} — ${v.why}`); ``).
  - Репро тикета — **CONFIRMED пробой** (`P28a`: `cp .kaif/_house-rules-template.md HOUSE_RULES.md` + строка; 1300 строк в
    `AGENT_GUIDE.md`; `node .kaif/kaif-core.mjs check --gate-budgets`), дословно из ОДНОГО прогона:
    `ℹ entry cost: /resume reads 9 re-read core document(s) + HOUSE_RULES.md ~ 73k tokens — 7 % of a 1M-token model window`
    и тут же
    `↳ AGENT_GUIDE.md: own lines 1313 of budget 1200 → HOUSE_RULES.md (no file yet: cp .kaif/_house-rules-template.md HOUSE_RULES.md) for local rules, routes and tools · the chronicle PROJECT_HISTORY.md · researches/ — debt recorded in .kaif/budget-baseline.json (first gate of 2.8) — from the next closing it passes only while it shrinks`.
    Строка STATUS (+250 строк): `✖ STATUS.md: own lines 254 of budget 200 → the chronicle PROJECT_HISTORY.md (move closed history VERBATIM — the /end-chat-soft bonsai trim) · HOUSE_RULES.md (no file yet: cp .kaif/_house-rules-template.md HOUSE_RULES.md) for standing rules and reference tables`, rc=1.
    Ядро в том же прогоне ЗНАЕТ, что файл есть: `:3666` `const entryHouse = okOnDisk('HOUSE_RULES.md');` — предикат готов, не применён.
  - Канон «копия — один раз, при первом использовании» — **CONFIRMED**: `framework/templates/_house-rules-template.md:3`
    `> **How to use this file.** COPY it to the project root on first use —`; новость 2.8 `tools/build-framework.mjs:296`
    «`cp .kaif/_house-rules-template.md HOUSE_RULES.md` on first use»; комментарий ядра `:138` `command that creates it: the house-rules file is copied from the shipped skeleton on first use.`
  - «241 lines … created by this update» (поле NDim) — **NOT-VERIFIABLE-HERE** (дерева поля на диске нет).
- **Класс:** «печатная инструкция-константа, не сверенная с диском» — адрес выноса живёт ТЕКСТОМ таблицы (`:139`: `purpose: the origin's budget door (tools/budget-gate.mjs → readBudgets) and the build's ceiling guard read this table as TEXT.`), поэтому условие по диску в неё не встроить — его надо ставить на печати. Свод ЗАКРЕПИЛ дефект: `tools/sandbox/s16-doc-budgets.mjs:175`, `:185`, `:208` ассертят буквальное `(no file yet: cp …)`, мутант `tools/sandbox/probes/budget-mutants.mjs:165` — тоже; единственная фикстура с `HOUSE_RULES.md` (`s16:477`) проверяет только цену входа.
  `TWINS: searched "no file yet|none yet| cp \." в ядре + framework/tools + framework/hooks + tools/budget-gate.mjs — found 3:`
  две константы ядра (`:140`, `:142`) + исток сам печатает тот же текст своей дверью `tools/budget-gate.mjs:70`
  (`` lines.push(`✖ ${doc}: own lines ${n} of budget ${budget} → ${overflowTo}`) ``, `overflowTo` читается из текста ядра `:49–54`),
  а у истока `HOUSE_RULES.md` ЕСТЬ. Не близнецы: `framework/skills/refresh-context/SKILL.md:36` и `framework/skills/fix-vision/SKILL.md:29`
  («no file yet →» / «none yet →» — условие, которое агент проверяет сам), `framework/tools/kaif-attribution-lint.mjs:370` (условно по базе).
- **Кто платит сейчас:** полевые проекты над бюджетом — на КАЖДОМ закрытии (дверь) и на каждом обновлении (прогноз `closing-gates`);
  риск — данные владельца (git спасёт, только если файл закоммичен). **S2** (near-miss; исполнение на незакоммиченном файле — S1).
- **Форма починки:** снять скобку из констант, дописывать её ПРИ ПЕЧАТИ одной функцией (`moveOutAddress(row)` → скобка только при
  `!okOnDisk('HOUSE_RULES.md')`) во всех трёх печатниках ядра и в `tools/budget-gate.mjs`; `readBudgets` читает таблицу без скобки.
  Проверка: `s16` — новая фикстура «HOUSE_RULES.md есть → строки `⚠`/`↳`/`✖`/прогноз не несут `cp`», старые ассерты — только
  на «файла нет»; мутант «скобка безусловно» красный. **0,25 чата.**
- **Пересечения:** `ideas/31` прямых нет; смежно п. 26 (справочник знает каждую строку `check` — строка меняется); тикеты — нет
  (дедуп тикета: #108 про другое); открытые `bugs/` — нет.
- **Слова владельца:** нет.

### #114 — пункт `policy-changes` задания обновления выносит владельцу вопросом правила, которые KAIF уже решил и отгрузил

- **Суть:** пункт задания велит поставить КАЖДОЕ правило интервала перед владельцем и записать его выбор; владелец NDim трижды
  подряд (2.5, 2.7, 2.8) ответил «принять все» и велел завести улучшение: что KAIF поставляет с обновлением — принимается без
  вопросов. Предложение — пункт-информирование: влить, назвать правила в отчёте и в прощании, не спрашивать.
- **Сверка с HEAD:**
  - Текст пункта — **CONFIRMED** дословно: `framework/installer/KAIF-CORE.mjs:1488`
    `⚠ This interval CHANGES RULES of your previous version — these are the OWNER'S decisions, never merge them silently; put each in front of the owner and record the choice:`.
    Проба `P26→28`: `KAIF_UPDATE_TASK.md:7` несёт этот пункт с **19** правилами (13 `[2.7]` + 6 `[2.8]`). Происхождение правила —
    `:1376` `// Policy changes in the (from, to] interval (Reference §10.6): a rule change is OWNER territory` и
    `framework/KAIF_REFERENCE.md:420` `"decisions for the OWNER" section: a policy change is never merged silently as an ordinary diff.`
    Слово «OWNER» не различает владельца KAIF (автора правил — реестр `POLICY_CHANGES_BY_VERSION`, `tools/build-framework.mjs:418`; первая запись 2.8, `:421`, открывается
    `The field report of every update and install is SENT to KAIF without asking the owner (2.8, epic CH;`) и владельца проекта.
  - «every update ends in an interview the owner has to answer before `update-verify` can go green» — **PARTIAL.** Механически
    `update-verify` требует лишь галочку (`:2829` — `✖ checkpoint missing: ${tag}: ${id} done`), а `checkpoint policy-changes`
    НЕ исполняет никакого гейта: ветки `if (id === '…')` у `cmdCheckpoint` — `:4094` recheck · `:4135` placeholders · `:4144`
    project-name · `:4152` owner-voice · `:4165` stale-claims · `:4180` owner-voice-core · `:4198` closing-gates · `:4208`
    field-report · `:4230` judge; `policy-changes` нет. Проба `P26→28`: `node .kaif/kaif-core.mjs checkpoint policy-changes` →
    `✔ recorded: KAIF-UPDATE: policy-changes done` без всякого интервью. Интервью требует только проза пункта — и поле её
    исполняет (NDim — интервью №075/№093/№105) или обходит `[AI]`-решением (#118 Unliminium: «`[AI]` decision, not put to the owner
    one by one: the project owner is the KAIF owner»), а судья поля считает пропуск галочки «update is not finished» (#108, находка 2).
  - Пп. 2–3 предложения: «`/kaif-update` step (policy) and `/fable-judge`'s hunt follow» — **REFUTED как адрес**: шага о политике
    в навыках нет (`grep -n -i polic framework/skills/kaif-update/SKILL.md framework/skills/fable-judge/SKILL.md` → пусто);
    носители — только ядро `:1488` и `KAIF_REFERENCE.md` §10.6 (`:416–420`). Зато охота судьи уже противоречит пункту по духу:
    `framework/skills/fable-judge/SKILL.md:53` `- **Mechanic that asks the owner (KAIF 2.6).** A shipped mechanic, a skill step or an update-task item whose step sends the agent to the owner of the project for a parameter the mechanic can derive itself`.
  - Три интервью NDim и слова владельца на странице — **NOT-VERIFIABLE-HERE** (дерева поля нет; слова приняты по тикету).
- **Класс:** «поставленное решение KAIF переспрашивается у владельца проекта» — пункт задания различает «правило сменилось»
  (верно: тихо вливать нельзя) и «кто решает» (неверно: решил автор релиза). Прецедент того же класса уже починен в 2.8 для
  отчёта поля: `framework/skills/kaif-update/SKILL.md:101–102` `(the KAIF owner's standing authorization, origin issue #15;` /
  `no owner's approval is awaited)`.
  `TWINS: searched "in front of the owner|owner's word|owner's consent|opt-in" в пунктах задания (core :1488–1555), новостях (tools/build-framework.mjs) и framework/hooks — found 2 семьи:`
  (1) `policy-changes` (`:1488`); (2) opt-in модулей поставки — это #115 (10 мест поставки + 5 новостей, перечень там).
  Не близнецы (решение действительно владельца проекта): `withdrawn-phrases` — приказ, подписанный `[OWNER]`, идёт к владельцу
  (`:1098`); объявление архива «only on the owner's word»; вопрос о портрете при установке (`:1017`, факт знает только владелец).
- **Кто платит сейчас:** владелец лично — одно интервью на КАЖДОЕ обновление с правилами в интервале; шум агента и судьи.
  **S3** (заусенец, но у владельца лично и на каждом обновлении).
- **Форма починки:** текст пункта → «Правила, отгруженные автором KAIF с этим релизом: влей их, назови каждое строкой в полевом
  отчёте и в прощании; владельцу проекта — вопрос ТОЛЬКО при столкновении с его записанным `[OWNER]`-решением (адрес решения в
  вопросе)». §10.6 справочника — та же формула; сама смена — запись `policyChanges['2.9']`. Проверка: свод на задании
  2.7→2.9 — в пункте нет «put each in front of the owner», есть «name each in the field report»; охота судьи «правило влито
  МОЛЧА — не названо в отчёте». **0,25 чата.**
- **Пересечения:** `ideas/31` — нет; тикеты #108 (R1/W2 — интервал `policy-changes` считается от штампа, а не от содержимого —
  соседний дефект того же пункта), #118 (обход как `[AI]`), #115 (близнец класса), #78 (прецедент: отчёт — без спроса);
  открытые `bugs/97` §2 (смены правил 2.2 не попали в `policyChanges` — полнота того же реестра).
- **Слова владельца:** «принимаем, и заведи импрувмент в КАИФ - чтобы агенты больше такого не спрашивали у владельца. Что каиф
  с обновлением поставляет - то и принимают без вопросов» (NDim Space, 2026-09-26 14:01 +03:00, по тикету; «The owner of this
  project is the owner of KAIF»).

### #115 — установка и обновление не подключают поставленные хуки и модули: агент обязан спрашивать владельца

- **Суть:** тексты поставки велят подключать хуки только по явному слову владельца; линтер канона приезжает неподключённым
  (SKIPPED, exit 3), линтер атрибуции — без базы (exit 1 на унаследованном долге). Владелец Unliminium велел подключать всё
  поставленное автоматически. Предложение: install/update сами идемпотентно вливают фрагмент в `.claude/settings.json`,
  opt-out ключом в `.kaif/kaif.json`, модули с данными проекта подключает задание обновления.
- **Сверка с HEAD:**
  - `_readme` фрагмента — **CONFIRMED** дословно: `framework/hooks/settings-fragment.json:2`
    `This file is NEVER applied automatically: KAIF does not edit your settings.json — wiring the hooks is an explicit opt-in step done by the project owner (or by the agent with the owner's quoted consent).`
  - Новость 2.8 о пятом хуке — **CONFIRMED**: `tools/build-framework.mjs:309`
    ``the refresh-hooks module is opt-in — merge the `PreToolUse` entry of `.kaif/hooks/settings-fragment.json` into `.claude/settings.json` by your owner\'s word.``
  - `AGENT_GUIDE.md` «Context refresh» — **CONFIRMED**: `framework/AGENT_GUIDE.md:216` `by the owner's explicit opt-in; a deployment without hooks never reddens.`
  - Ядро не трогает настройки — **CONFIRMED**: `grep -n "settings\.json\|settings.local" framework/installer/KAIF-CORE.mjs` → пусто;
    проба `P28b` (чистая 2.8): в `.claude/` только `skills`, `ls .claude/settings*.json` → `No such file or directory`.
  - `kaif-canon-lint check` → SKIPPED exit 3 — **CONFIRMED** (`P28b`):
    `⊘ SKIPPED — .kaif/canon-lint-rules.json not found: canon lint is not configured, nothing was proven (optional module; seed it — see this file's header for the format). Exit code 3 keeps an unconfigured guard from reading as a passed one (bug 34).`, rc=3.
  - `kaif-attribution-lint` «156 NEW … no baseline yet» (exit 1), «the 2.8 closing gate stops on it» — **CONFIRMED по форме**
    (`P28b`: чистая установка — `✅ attribution-lint OK — 22 file(s) scanned, new 0`; одна строка «the owner's decision» в
    STATUS → `✖ attribution-lint: 1 NEW finding(s) in 22 file(s) · no baseline yet — adopt with --write-baseline`, rc=1);
    число 156 — поле, **NOT-VERIFIABLE-HERE**. Закрытие его запускает: `framework/skills/end-chat-soft/SKILL.md:63`.
  - «the `closing-gates` item already names `--write-baseline` — make it the default step» — **PARTIAL**: пункт `:1545` говорит
    лишь `record the inherited debt with the command the lint names`, а запись базы сейчас назначена ПЕРВОМУ ЗАКРЫТИЮ, не
    обновлению и не вопросом: `framework/skills/end-chat-soft/SKILL.md:69` ``record that debt ONCE — `node .kaif/tools/kaif-attribution-lint.mjs check --write-baseline` writes``.
  - Комментарий-поправка тикета (`kaif-provenance` с `aiMarks` → 255 ложных находок на упоминаниях метки в прозе) — отдельный
    дефект модуля; здесь не проверялся (**NOT-VERIFIABLE-HERE** на поле; на поставке — вне скоупа группы).
- **Класс:** тот же, что #114 — «поставленный модуль ждёт opt-in владельца»; вдобавок «модуль, приезжающий в состоянии
  не-вердикта (SKIPPED / без базы)». Прецедент, что ядро уже аддитивно правит JSON владельца: сращивание `kaif:*` в
  `package.json` (`:2488–2495`, issue #16; `:3271` `= kaif:* handles already wired — package.json untouched`) — ту же технику
  можно взять для `settings.json`. Слово владельца истока 2026-08-07 про носитель уже было за подключение:
  `interviews/interview_010_scope_after_epic_o.md:41–42` (см. «Слова владельца»).
  `TWINS: searched "opt-in|owner's consent|explicit owner|by your owner's word" в framework/ и tools/build-framework.mjs — found 15:`
  поставка — `framework/hooks/settings-fragment.json:2`, `framework/hooks/sample-codex-hooks.json:2`, `sample-cursor-hooks.json:2`,
  `sample-copilot-hooks.json:2`, `sample-antigravity-hooks.json:2`, `framework/hooks/README.md:30` (`## Opt-in — an explicit owner step`),
  `:32`, `:38`, `framework/AGENT_GUIDE.md:216`, `framework/KAIF_REFERENCE.md:609`; новости — `tools/build-framework.mjs:260`
  (контур: «the tooling is opt-in»), `:261`, `:309`, `:322` («hooks stay your opt-in»), `:599`.
  Модули в состоянии не-вердикта: `kaif-canon-lint` (нужны правила), `kaif-attribution-lint` и `kaif-experience-lint` (база),
  `kaif-provenance` (нужны `canonArtifacts`/`aiMarks`), `kaif-voice-lint` (нужен портрет).
- **Кто платит сейчас:** владелец лично — вопрос на каждом обновлении, приносящем хук/модуль; поле — хук «слово владельца посреди
  хода» не работает, пока не спросили; первое закрытие стопорится на унаследованном долге атрибуции. **S3.**
- **Форма починки:** (1) install/update вливают `settings-fragment.json` в `.claude/settings.json` (только при `claude-code`/`grok-build`
  в `agents`) аддитивно по пути скрипта, чужие записи не трогают, парс-ошибка/BOM → предупреждение и пропуск, строка лога на
  каждую запись, квитанция; opt-out `"hooks": "off"` в маркере (схема `check`). (2) Задание обновления делает `--write-baseline`
  шагом, а для `kaif-canon-lint` называет засев. (3) Тексты 15 мест — «подключено установкой, снимается словом владельца»; это
  смена правила → строка `policyChanges['2.9']`. Проверка: свод — «settings.json с чужим `PreToolUse` → своё сохранено, наши 5
  добавлены, повторный прогон — побайтно тот же файл; `"hooks":"off"` → побайтно нетронут; BOM → OK». **1,0 чата.**
- **Пересечения:** `ideas/31` п. 1 (девять мест «внешний JSON без снятия BOM» — вливание в `settings.json` станет десятым, если не
  снимать), п. 3 (N7 — `kaif-attribution-lint`), п. 21 (token-F1 `kaif-provenance`) и п. 22 (окно линтера атрибуции); тикеты #114
  (близнец класса), #118 (полевой отчёт Unliminium, R2 = этот тикет); открытые `bugs/121` (раздел «Opt-in» README — тот же текст;
  фикс в `main`, DONE ждёт наблюдения владельца), `bugs/118` №2/№3 (форма вывода хуков подстрокой, таблица README без стража —
  при автоподключении фрагмент становится исполняемой поставкой каждого проекта), `bugs/119`, `bugs/120`.
- **Слова владельца:** «все, что каиф приносит в поставке - подключить. И заведи импрувмент в КАИФ, чтобы агенты этого не
  спрашивали, как вот ты сейчас спросил, а сразу автоматом подключали» (Unliminium, 2026-09-26 13:51 +03:00, по тикету).
  Контекст истока: «это механизм проекта! Поэтому он подключается в settings.json для Claude, и в аналогичные хуки для другиех
  вгентских систем» (`interviews/interview_010_scope_after_epic_o.md:41–42`, 2026-08-07).

### #120 — обновление «keeps existing» указатели контекста агентов и молча теряет их дельту апстрима (правило `resume` 2.7)

- **Суть:** `CLAUDE.md`, `AGENTS.md`, `.clinerules/kaif.md`, `.roo/rules/kaif.md` пишутся только если их нет; обновление их
  не классифицирует, задание не называет, `update-verify` не сверяет. У KAGO копия Cline с 2026-09-18 без правила «resume».
- **Сверка с HEAD:**
  - «kept existing … on update» — **CONFIRMED**. `framework/installer/KAIF-CORE.mjs:809`
    `` if (okOnDisk(path) && !FORCE) { log(`= kept existing ${path}`); return false; } ``; указатели — `:827`, `:830`, `:831`, `:832`;
    путь обновления `:2332` `deployAgentSystems(skillFiles, refFiles); // writeIfNew semantics: new appear; existing kept (their canonical .claude source got classified above)`.
    Проба `P26→28` (лог `update`): `= kept existing .roo/rules/kaif.md` · `= kept existing .clinerules/kaif.md` ·
    `= kept existing CLAUDE.md` · `= kept existing AGENTS.md`.
  - Репро тикета (≤2.6 → ≥2.7, `grep -c "A message that opens with the word"` → 0, свежая установка → 1) — **CONFIRMED**:
    `P26→28` после обновления — CLAUDE.md 0 · AGENTS.md 0 · .clinerules/kaif.md 0 · .roo/rules/kaif.md 0; свежая 2.8 (`P28a`) —
    1 · 1 · 1 · **0**. `diff` свежей и обновлённой `.clinerules/kaif.md` воспроизводит дифф тикета побайтно (`4,5d3` + строка правила).
    `check` при этом зелёный: `✅ manifest satisfied: 103 files + 115 agent artifacts present (⚠ 69 drifted mirrors — see above)`.
  - «The update task has no item for any of them … names none of their upstream changes» — **PARTIAL.** Пункта нет, но в интервале,
    где правило пришло, прозой в `review-news` его назвали: `tools/build-framework.mjs:322` `(b) Your auto-loaded context file (CLAUDE.md / AGENTS.md / .clinerules) was written once at injection and is never edited by the machinery`
    (есть и в `git show v2.7:dist/KAIF-CORE-BUNDLE.md`) — «file» в единственном числе, `.roo/rules/kaif.md` не назван, ни пункта,
    ни галочки, ни проверки. В интервале 2.7→2.8 указатель не менялся — старый долг не видит никто.
  - «no install snapshot … the classifier has nothing to diff» — **REFUTED в механизме, CONFIRMED в эффекте.** Снимок ЕСТЬ:
    в манифесте 2.6 (`P26→28`, `git show HEAD:.kaif/deploy-manifest.json`) `shas` несёт все четыре указателя, и sha на диске
    равен записанному (`CLAUDE.md` `1adcc50531db` = `1adcc50531db`; `.roo/rules/kaif.md` `2a24ad9c5d7a` = `2a24ad9c5d7a`) —
    «нетронут» вычислим. Но его никто не читает, а обновление ПЕРЕСНИМАЕТ его с диска: `:2348`
    `for (const p of [...deployedPaths, ...agentPaths]) if (okOnDisk(p)) shas[p] = fileSha(p);`. Текст указателя — константа ядра
    (`:793` `const CONTEXT_POINTER =`), а не шаблон бандла: у него нет `templateShas`/`moduleShas`, диффу нечего сравнить.
    Комментарий шире кода: `:2329` `// agent-system artifacts: same classification via the copies' snapshots`.
  - «a Cline session in this project has not had the rule since 2026-09-18» — **NOT-VERIFIABLE-HERE**; смягчение по адаптерам:
    `framework/adapters/cline.md:9` `` `AGENTS.md` is auto-detected and toggleable in the Rules panel. `` и
    `framework/adapters/zoo-code.md:11` `` - `AGENTS.md` in the workspace root is supported **natively** and enabled by default ``
    (у KAGO `AGENTS.md` правило получил руками).
  - Сверх тикета: указатель Zoo Code правила не несёт даже на свежей установке — `:827`
    ``writeIfNew('.roo/rules/kaif.md', '# KAIF\n\nRead `AGENT_GUIDE.md` before every task; keep `STATUS.md` current. ' +`` (без
    правила и без списка канона); «already equal» в тикете — поэтому. `CONTEXT_POINTER` менялся ДВАЖДЫ (хэш тела по тегам:
    v2.0 `8355f43d` → v2.2…v2.6 `69bbabc5` → v2.7/v2.8 `345b5f28`): 2.2 добавила `REQUIREMENTS_FRAMEWORK.md`/`TESTING_FRAMEWORK.md`,
    2.7 — правило resume; развёртывания с 2.0 не получили и первую дельту.
  - Почему у KAGO песочница написала указатели заново («git-ignored files absent») — механизм #130 (Windows, `core.ignorecase=true`):
    вывод чтением, дерева KAGO нет.
- **Класс:** «файл, записанный `writeIfNew` без последующей классификации, — дельта апстрима теряется молча».
  `TWINS: searched "writeIfNew(" в ядре — found 10 вызовов:` (определение — `:808`) зеркала навыков `:820`, `:822`, `:826` — догоняются `resyncCopies`
  (`:2734`); `:2129`, `:2136`, `:3188` — добавление отсутствующего внутри классификации; без последующей сверки — ровно четыре
  указателя `:827`, `:830`, `:831`, `:832`. Родня по оси «`check` видит присутствие, не содержание» — `ideas/31` п. 5 (N9).
- **Кто платит сейчас:** полевые проекты с ≥2 агентскими системами — на каждом обновлении, где менялся указатель (уже дважды),
  тихо; вторичная система живёт на правилах входа прошлой версии. **S3** (смягчено нативным `AGENTS.md` у Cline/Zoo).
- **Форма починки:** на обновлении: указатель не в `kept` и `sha(disk) == старый shas[p]` → заменить новым текстом (лог
  `↻ replaced`); иначе — пункт `context-pointers` с дельтой (старый текст берётся из бандла прошлой версии, если вынести указатели
  в шаблоны бандла `framework/templates/_context-pointer*.md`; тогда `templateShas` и модульный дифф — даром). Указатель Zoo Code
  получает правило. `update-verify`: каждая строка-правило указателя есть в каждом указателе на диске (иначе красный с именем
  файла). Проверка: свод «2.6 → 2.9, нетронутые указатели → заменены, правленый → пункт; `grep -c` правила = 1 во всех». **0,5 чата.**
- **Пересечения:** #130 (та же пара файлов; объясняет «git-ignored» у KAGO); #72 (класс «дельта апстрима теряется молча», эпик
  UP 2.8 — `tools/build-framework.mjs:310` `THE UPDATE LOSES NOTHING SILENTLY (2.8, epic UP;`); `ideas/31` п. 5 (N9), п. 30
  (#76 R7 — зеркалирование локальных навыков); открытые `bugs/` — нет.
- **Слова владельца:** нет.

### #130 — неякорная строка `KAIF.md` в `.gitignore` прячет `.clinerules/kaif.md` (и `.roo/rules/kaif.md`) на регистронезависимом git

- **Суть:** ignore-first пишет корневые транзиенты без ведущего `/`; неякорный шаблон матчится на любой глубине, а с
  `core.ignorecase=true` (дефолт git for Windows) `KAIF.md` ловит `.clinerules/kaif.md`. Файл на диске есть, в git не попадает;
  клон падает на `check`. Комментарий: вторая жертва — `.roo/rules/kaif.md`.
- **Сверка с HEAD:**
  - Список без якоря — **CONFIRMED**: `framework/installer/KAIF-CORE.mjs:466`
    `const wanted = ['.kaif/install/', 'KAIF.md', 'KAIF-LOADER.mjs', TASK_FILE, UPDATE_TASK,`, `:467`
    `'KAIF_UPDATE_TASK.superseded.md', 'KAIF_ADAPTATION_TASK.superseded.md',` — шесть имён без `/` (`TASK_FILE` `:99` =
    `'KAIF_ADAPTATION_TASK.md'`); остальные записи содержат `/` в середине и якорны сами. Так с v2.0
    (`git show v2.0:dist/KAIF-CORE.mjs` → `const wanted = ['.kaif/install/', 'KAIF.md', 'KAIF-LOADER.mjs', TASK_FILE, UPDATE_TASK`).
  - Матч на регистронезависимом git — **CONFIRMED пробой** (git 2.43.0 — та же версия, что у тикета; `P28a`,
    `git config --local core.ignorecase true` во временном репо): `git check-ignore -v .clinerules/kaif.md .roo/rules/kaif.md KAIF.md` →
    `.gitignore:2:KAIF.md	.clinerules/kaif.md` · `.gitignore:2:KAIF.md	.roo/rules/kaif.md` · `.gitignore:2:KAIF.md	KAIF.md`;
    при `core.ignorecase false` — только `.gitignore:2:KAIF.md	KAIF.md`.
  - Клон падает на `check` — **CONFIRMED**: `git add -A && commit` при ignorecase=true → `git ls-files | grep -i "kaif.md$"` →
    только `.roo/commands/help-kaif.md`; `git clone` → `node .kaif/kaif-core.mjs check` → `✖ MISSING or empty: .roo/rules/kaif.md` ·
    `✖ MISSING or empty: .clinerules/kaif.md` · `✖ INCOMPLETE: 2 artifacts missing`, rc=1.
  - «Anchoring the root transients closes the class» — **CONFIRMED** (`/KAIF.md` при ignorecase=true → игнорится только корневой
    `KAIF.md`) — **но недостаточно**: ядро переписывает ручной якорь обратно. `:477–478`
    `const have = new Set(text.split(/\r?\n/).map((s) => s.trim()));` / `const add = wanted.filter((w) => !have.has(w) && !have.has(w.replace(/\/$/, '')));`
    — `/KAIF.md` ≠ `KAIF.md`, и строка дописывается В КОНЕЦ (`:480`). Проба `P28b`: `.gitignore` с `/KAIF.md` →
    `update-verify` (зовёт `ensureIgnoreFirst` первым, `:3073`) → `+ .gitignore: ignore-first for KAIF.md`, в файле `2:/KAIF.md` и
    `16:KAIF.md`. С отрицанием `!.clinerules/kaif.md` вместо строки `KAIF.md` — дописанный в конец `KAIF.md` перекрывает его:
    `.gitignore:17:KAIF.md	.clinerules/kaif.md`. Полевая починка тикета (оставить `KAIF.md`, отрицание ПОСЛЕ него) — единственная
    живучая локально.
  - Сверх тикета: неякорный шаблон бьёт и без ignorecase — `sub/KAIF.md` игнорится на регистрозависимом git
    (`.gitignore:1:KAIF.md	sub/KAIF.md`): любой проект с собственным `docs/KAIF.md` теряет его на любой ОС.
- **Класс:** «неякорный шаблон `.gitignore` для корневого транзиента» + «ignore-first сверяет строки буквально и дописывает в
  конец». Своды это не ловят: `tools/sandbox/s01-field-fixes.mjs:58–60`, `:197–198` проверяют наличие и идемпотентность строк, но
  ни разу — что развёрнутый артефакт НЕ игнорится.
  `TWINS: searched развёрнутые пути, чьё имя регистронезависимо равно одному из шести — found 3 + 1:` `.clinerules/kaif.md`,
  `.roo/rules/kaif.md` (пишет ядро), `.devin/rules/kaif.md` (пишет агент по `framework/adapters/windsurf.md:12`
  `` `.devin/rules/kaif.md` with `trigger: always_on`). ``) + любой проектный `*/KAIF.md` в подкаталоге (любая ОС).
  `.cursor/rules/kaif.mdc` не совпадает.
- **Кто платит сейчас:** полевые проекты на Windows с `cline`/`zoo-code` (и Windsurf по адаптеру) — каждый клон, каждое второе
  рабочее место и каждый чистый судья; ремонт руками откатывается ядром на следующем `update-verify`, если сделан якорем. **S2.**
- **Форма починки:** шесть корневых имён — с `/`; `ensureIgnoreFirst` считает `KAIF.md` и `/KAIF.md` одной записью и ПЕРЕПИСЫВАЕТ
  старую голую строку на месте (не дописывает); новая ось `check`: `git check-ignore --no-index --stdin` по путям манифеста и
  агентским артефактам → красный «deployed artifact is git-ignored by <rule>» (ловит любую будущую коллизию). Попутно — K-R11
  (LF в CRLF `.gitignore`) в той же функции. Проверка: свод с `-c core.ignorecase=true`, фикстура «старая голая строка +
  отрицания» → после install/update одна якорная строка, отрицания живы, `check-ignore` пуст. **0,5 чата.**
- **Пересечения:** `ideas/31` п. 5 (K-R11 — та же `ensureIgnoreFirst`); #120 (те же два файла); открытые `bugs/` — нет.
- **Слова владельца:** нет.

---

## Класс группы

Две семьи. **(1) Что машинерия пишет и печатает, не сверено с диском и не доезжает до читателя** — #113 (печатная команда-константа
при существующем файле), #120 (указатели `writeIfNew` без классификации; снимок `shas` есть, но не читается и переснимается
каждым обновлением), #130 (ignore-first прячет развёрнутые указатели и возвращает голую строку поверх ручного ремонта). Общее
лекарство — ось `check`/`update-verify` над РЕЗУЛЬТАТОМ на диске и в git (каждый развёртываемый путь не игнорится; каждый
указатель несёт строки-правила; печатный адрес зависит от диска), и своды на фикстурах «файл уже есть» / `core.ignorecase=true` /
«обновление с 2.6». Своды 2.8 ЗАКРЕПИЛИ #113 (`s16` ассертит буквальную скобку) и не ставили вопроса для #120/#130. **(2) Поставленное
KAIF переспрашивается у владельца проекта** — #114 (`policy-changes`, 19 правил вопросом на 2.6→2.8, галочка без гейта) и #115
(15 мест opt-in: 10 в поставке, 5 в новостях; модули в состоянии не-вердикта): два слова владельца KAIF в один день с одной формулой. Смена (2) сама —
смена правила, и ей нужна строка `policyChanges['2.9']` в новой, информирующей форме #114.

## Итоговая таблица

| Тикет | Вердикт сверки | Тяжесть | Цена | Кандидат-эпик (рабочее имя) |
|---|---|---|---|---|
| #113 | CONFIRMED (проба: скобка «no file yet: cp …» при существующем `HOUSE_RULES.md`, три печатника + `tools/budget-gate.mjs`) | S2 | 0,25 | UP2 «Записанное сверено с диском» |
| #114 | CONFIRMED текст пункта · PARTIAL «интервью до зелёного» (галочка без гейта) · REFUTED адреса навыков | S3 | 0,25 | SW «Поставленное — принято и подключено» |
| #115 | CONFIRMED (все три текста, exit 3 канона, exit 1 атрибуции без базы) · PARTIAL (`--write-baseline` уже шаг первого закрытия) | S3 | 1,0 | SW «Поставленное — принято и подключено» |
| #120 | CONFIRMED эффект (проба 2.6→2.8, дифф побайтно) · PARTIAL «задание не называет» (новость 2.7 прозой) · REFUTED «нет снимка» (есть, не читается) | S3 | 0,5 | UP2 «Записанное сверено с диском» |
| #130 | CONFIRMED (проба `core.ignorecase=true`, клон красный) + сверх: ядро откатывает ручной якорь; `sub/KAIF.md` на любой ОС | S2 | 0,5 | UP2 «Записанное сверено с диском» |

Итого группа: **2,5 чата** (UP2 — 1,25 · SW — 1,25).
