# Разведка field-b — полевые отчёты после выпуска 2.9: #155 KAGO 2.8 → 2.9 · #158 KrinikCam 2.1 → 2.9 (новая машина) · #149 KUIPS установка 2.9

> **Прочитано:** 2026-10-18 02:17–02:35 +0300 (`date`; временный каталог удалён в 02:35); тикеты целиком из `scratchpad/issues/{155,158,149}.md` (+ заголовки #151 и #154 для
> связей); локальные копии отчётов в `D:\work\ai_sandbox\{KAGO,KrinikCam,KUIPS}\reports\KAIF_UPDATES\` совпадают с телами тикетов (у KAGO
> копия уже несёт §6 «Addendum» — в тикете он комментарием 1). **HEAD** `250cf7a`; `git diff --stat v2.9 HEAD -- framework/` → пусто.
> **Цитаты:** дословные; где исходник переносит строку внутри цитаты, перенос заменён пробелом. **Пробы** — только во временном каталоге
> (`mktemp -d` → `/tmp/tmp.G1Go6K2dzm`, копия `git archive v2.9 framework`; удалён в конце); соседние деревья — только чтение (`git show`,
> `git log`, разбор файлов). Ни свода, ни полигона, ни контура, ни `KAIF_DIST`, ни сети.

## Итог одной строкой на отчёт

- **KAGO (#155)** — механика 2.9 точна шестой выпуск подряд (песочница = бой, оба задания побайтно равны); вся цена — один отказ харнесса
  на `wire-hooks` (заведён #154) и три мелочи только в отчёте: рецепт песочницы обещает "логи отличаются одной строкой", слово владельца в
  памяти агента не считается "записанным решением", слоты `/release`. Владелец сам снял запись хука и сам назвал правило 2.9 «БАГ КАИФ» (#156).
- **KrinikCam (#158)** — прыжок через восемь выпусков маршрутом старого ядра прошёл и проверился зелёным; все шесть граблей — только в отчёте
  (R3 уже #151 от KUMM). Два класса для любого проекта: **задание пишет ядро 2.1** (передача свежему ядру в 2.9 есть, но поздняя и неполная) и
  **фронтматтер навыков — не строгий YAML** (проба: на ru-развёртывании 37 из 37; в этой же сессии харнесс показал вместо описания H1 у двух
  навыков истока).
- **KUIPS (#149)** — свежая установка ru-пакета: 18 минут от пустого репозитория до `chore: deploy KAIF`, `check` 0 предупреждений; трение
  только бумажное — порядок "GOAL раньше установки" против "портрет раньше текста владельца", 7 слотов ритуалов видит лишь `check`, которого
  задание установки не просит, STATUS/MASTER_PLAN приходят английскими вопреки таблице языков. Ни одного отдельного тикета.

---

## #155 — KAGO 2.8 → 2.9: механика чиста; отказ `wire-hooks` оставил запись отставного хука на удалённый файл (#154)

**Маршрут.** bootstrap с репетицией: песочница `git -c core.autocrlf=false archive HEAD` → загрузчик `--lang ru --source <a29> --baseline
<a28>`, бой — та же строка + `--rehearsal`. Windows 11 Pro 10.0.26200, Node v24.15.0, `core.autocrlf=true`, ru, claude-code (+4 зеркала);
Claude Opus 5.5, VS Code, auto mode. Длительность по `git log` KAGO: механика `524ad59` 11:50:08 → руки `8c3598c` 11:59:51 → тикет 12:12
(09:12:32Z) → владелец снял запись хука `af812e4` 12:25:04 (+03:00). Счётчики: «`27 replaced, 3 modules merged in-place, 0 added, 74 kept`»;
цена входа «`~ 187k tokens — 19 % of a 1M-token model window`» (на 2.8 было ~186k — не снизилась).

| Грабля | Что случилось | Сверка с HEAD | Класс | Тикет? | S | Цена |
|---|---|---|---|---|---|---|
| **R1** | Обновление удалило `.kaif/hooks/pretool-owner-word.mjs`, а снять его запись из `.claude/settings.json` должен `wire-hooks` — харнесс отказал: «Permission for this action was denied by the Claude Code auto mode classifier. Reason: [Self-Modification].»; «the entry runs on every tool call» | **CONFIRMED** (код + проба). Удаление — в механическом проходе: `framework/installer/KAIF-CORE.mjs:1506` `unlinkSync(d.path);` (`handleDeprecations`, данные `tools/build-framework.mjs:411–414`, `since: '2.9', search: ['pretool-owner-word']`); снятие записи — позже, пунктом задания: `KAIF-CORE.mjs:4916` `const RETIRED_HOOKS = ['pretool-owner-word.mjs', 'stop-owner-answer.mjs'];`; `check` называет хвост: `KAIF-CORE.mjs:3848` `still runs ${hw.retired.length} hook(s) KAIF retired in 2.9:`. Проба (`/tmp/…/proj`): `echo '{}' \| node .kaif/hooks/pretool-owner-word.mjs` → `node:internal/modules/cjs/loader:1479` / `throw err;` · `exit=1` — дословно как в отчёте. Сам отказ харнесса — **NOT-VERIFIABLE-HERE**; наблюдение поперёк трёх отчётов: та же машина и модель, у KrinikCam `wire-hooks` прошёл («`4 of 4 KAIF hooks added; a new file` — the harness did NOT refuse the write»), у KUIPS тоже («"4 of 4 KAIF hooks added"») — отказали СНЯТИЮ записи из существующего файла, добавлению в новый — нет | Порядок отставки: артефакт удаляется раньше ссылки на него, а снятие ссылки — запись, которую харнесс вправе отклонить. TWINS: searched `RETIRED_HOOKS` / записи `DEPRECATIONS` с файлом, на который ссылается конфиг — found 2 (`pretool-owner-word.mjs`, `stop-owner-answer.mjs`); остальные две отставки (`/end-chat`, скелет реестра) — тексты, их ловит `withdrawn-phrases` | **#154** (KAGO 28) | S3 (ошибка на каждый вызов до команды владельца; платил **владелец лично** — одна команда) | 0,25 (решает разведчик #154) |
| **R2** (+) | Голая строка `KAIF.md` в `.gitignore` прятала `.clinerules/kaif.md` и `.roo/rules/kaif.md` с установки; 2.9 «rewrote the six transient lines as `/KAIF.md` … in place, and both files became visible». Побочно: «the sandbox made by `git archive` lacks every deployed file git ignored» — логи песочницы и боя разошлись в 4 местах | **CONFIRMED** фикс: `KAIF-CORE.mjs:522` `if (IGNORE_ROOT_TRANSIENTS.includes(s)) { lines[i] = '/' + s; anchored.push('/' + s); }`. **CONFIRMED** побочное: рецепт обещает обратное — `framework/skills/kaif-update/SKILL.md:67` `then read the same sha256-verified bytes and their logs differ by the rehearsal line alone;`, а сам KAIF велит прятать приватный портрет — `KAIF-CORE.mjs:1106` (пункт `owner-voice`) `add it to .gitignore in the SAME step` | Обещание рецепта не знает случая, который создаёт сам KAIF (игнорируемые развёрнутые файлы: приватный портрет, до 2.9 — указатели). TWINS: searched `rehearsal line alone\|byte for byte, up to line endings` в `framework/` — found 2: `kaif-update/SKILL.md:52`, `:67` | нет (пожелание §4.3) | S3 (шум сравнения, «a reader comparing logs needs to know why») | ≤ 0,1 |
| **R3** | Память агента (вне репо) хранит слово владельца из другого проекта «ответ — это конец хода»; правило 2.9 — «never end the turn just to answer»; правка памяти отклонена харнессом «[Instruction Poisoning]»; вопрос ушёл владельцу (выбрал A) | **CONFIRMED**: пункт задания знает только запись в репо — `KAIF-CORE.mjs:1649` `A question to the owner is legal ONLY where a rule collides with a decision he recorded himself (an [OWNER] line)`; при этом гид сам читает память как источник решений — `framework/AGENT_GUIDE.md:83` `5. Read MEMORY.md (if present)    # user profile, key decisions`. Правило — `AGENT_GUIDE.md:646` `never end the turn just to answer`. Отказ харнесса — NOT-VERIFIABLE-HERE | Адрес "записанного решения владельца" = только `[OWNER]`-строки репо; слово владельца ВНЕ репо (память агента, соседние развёртывания того же владельца) невидимо для пункта и для поиска. Близнец — KUIPS §3.2 (выбор владельца в соседнем KARTUN) | нет (пожелание §4.2) | S3 (вопрос владельцу — **владелец лично**) | 0,1 (одна строка пункта + строка гида; вместе с KUIPS §3.2 — 0,25) |
| R4 | Флейк селфтеста `watchdog` под параллельной батареей | не KAIF (`bugs/145` проекта, `automation-engine/lib/watchdog.mjs`) | — | — | — | — |
| **R5** | `check` называет `/release` шаги 2, 3, 6 «still the template's instruction slot»; оставлены сознательно | **CONFIRMED** (проба `probe-slots.mjs` правилом `slotAt()` ядра, `KAIF-CORE.mjs:3970–3986`, по шаблонам v2.9): `release :: Step 2 …` · `Step 3 …` · `Step 4 …` · `Step 6 …` — четыре слота `/release`; у KAGO шаг 4 не назван — заполнен проектом | Долг, не дефект. Пересечение **`ideas/32` п. 14**: слот шага 2 открывается ПОСРЕДИ строки, и правило `instructionSlotLines()` `update-verify` его не видит — проект, заполнивший его, получит ложное "not found" на следующем обновлении | нет | S4 | 0 (п. 14 — 0,1) |
| §1a | «#109 and #119 seen fixed» | **PARTIAL**: #119 — `/experience` исправлен (`framework/skills/experience/SKILL.md:32` `` registry (`HOUSE_RULES.md` → "Tools of this project") — where sessions look when they RUN it; the journal entry ``), второй случай открыт: `framework/BUG_FIXING_FRAMEWORK.md:130` `"can I add a command/flag/script so next time it's one step?" Then add it, and document it in` (= `ideas/32` "Остатки" п. 2). #109 — слово закрытия первым (`framework/tools/contour/core.mjs:191` ветка `STATUS_CLOSED_WORD_RE`); обратный случай — `ideas/32` "Остатки" п. 1 | — | #119 · #109 (открыты) | — | — |
| §1a | База авторства «19888 → 6553 bytes» · «fingerprints and counts only (#111: the 2.8 file held line text)» | **CONFIRMED**: `framework/tools/kaif-attribution-lint.mjs:340` `` // The baseline (2.9, epic PV): `entries` maps `file:sha16(line)` to the COUNT of findings with that key — a fingerprint and a number, ``; файл KAGO сейчас: `"EXPERIENCE.md:a2884e994a07f56d": 1` (только чтение) | — | #111 (закрыт 2.9) | — | — |

**Пожелания отчёта.** §4.1 «Retire a wired hook in the order the harness allows» → #154 (R1). §4.2 «contradicts the owner's word in your own memory
is a collision too — one question, never a silent rewrite» → R3. §4.3 «The sandbox recipe: say that a `git archive` copy lacks git-ignored
deployed files» → R2.

**Что в 2.9 сработало (дословно).** Бой = песочница: «`diff` of the two task files: empty» и «nothing frozen · same counters»; фикс #130 в
поле — R2 «KAIF, positive (#130 confirmed in the field)»; #109: «the false «interview 020 awaits application» line of 2.8 (#109) — gone»;
#111: «fingerprints and counts only»; #114: «taken; nothing was put to the owner as a question about them»; судья: «is sound: `.kaif/kaif.json`
changed only in version, release date, a bootstrap history entry and a build hash that matches the genuine v2.9 release». Контур: «`contour
selftest green: 138 checks`».

**Кто платит.** Владелец лично — одна команда `wire-hooks` (12:25, через 35 минут после механики) и один вопрос о памяти; раздражение
правилом 2.9 `framework/AGENT_GUIDE.md:643` `opening with its first words in «…»` (#156 — не моя группа). Остальное — шум агента.

**Слова владельца (дословно).** Приказ: «обнови КАИФ до 2.9». Из памяти агента (2026-09-26, другой проект): «ответ — это конец хода».
Комментарий 1, §6: «не нужно начинать с моих слов, это БАГ КАИФ, который меня бесит … Его задача - ОТВЕТИТЬ НЕЗАМЕДЛИТЕЛЬНО ВЛАДЕЛЬЦУ и
ПРОДОЛЖИТЬ РАБОТУ» (→ #156); выбор по R3 — «He chose A»; итог его `wire-hooks` — «1 entry of retired KAIF hooks removed».

**Пересечения.** #154 (R1), #156 (§6), #146 (правило «One tool call — one action» влито), `ideas/32` п. 12 (ключ `"hooks": {"off": …}` — сосед
R1), п. 14 (R5), п. 7 (KAGO пож. 5 — цена входа 187k не снизилась), "Остатки" п. 1–2 (#109, #119); `researches/35_…/field-b.md` KAGO R13 —
тот же отказ `[Self-Modification]` второй выпуск подряд на том же файле.

---

## #158 — KrinikCam 2.1 → 2.9: восемь выпусков маршрутом старого ядра, переезд macOS → Windows

**Маршрут.** core-update: свежий клон на новой машине (последний коммит `d33c055`, 2026-08-02, macOS) → `node .kaif/kaif-core.mjs update`
ядром **2.1** (прошлая сессия) → `wire-hooks` → ручные слияния → `update-verify`. Windows 11 Pro 10.0.26200, Node v24.15.0, Git Bash 5.2 +
PowerShell 5.1, `core.autocrlf=true`, `core.ignorecase=true`, `NoDefaultCurrentDirectoryInExePath=1`; ru, 5 систем; Claude Opus 5.5 + 3
разведчика + 3 исполнителя. Один коммит `048866d` 2026-10-17 21:19:49 +0300 `chore: KAIF 2.1 → 2.9 + разработка переехала на Windows-машину`.
Счётчики: «replaced 13 · mergedModules 16 · added 38 · kept 49 · 25 diverged (translated wholesale) · 7 module diffs»; 18 из 22 переведённых
навыков получили дельту руками. В дереве 2.1 якорных пар не было (`git show d33c055:AGENT_GUIDE.md | grep -c "KAIF:PRAYER\|KAIF:CREED"` → `0`),
значит обязательность bootstrap (`kaif-update/SKILL.md:35–36`) по букве не сработала.

| Грабля | Что случилось | Сверка с HEAD | Класс | Тикет? | S | Цена |
|---|---|---|---|---|---|---|
| **R1** | «The task was written by the 2.1 core: no `wire-hooks`, `lint-baselines`,» … «`policy-changes` still says «put each in front of the owner»»; «Cost: had to read 120 lines of news to find the items the task lacked.» | **CONFIRMED** задание старого ядра: `git show v2.1:framework/installer/KAIF-CORE.mjs` строка 492 — `put each in front of the owner and record the choice` (данные политик — из НОВОГО бандла, `policyInterval(meta, …)`, обёртка — старая). **PARTIAL** по последствиям: 2.9 передаёт свежему ядру почти всё — `checkpoint recheck` чинит ignore (`KAIF-CORE.mjs:4479` `ensureIgnoreFirst();`), называет ворота закрытия (с неподключёнными базами линтеров), отставленные фразы (`:4505` `ℹ withdrawn phrases — this task was written by the previous core, which had no withdrawn-phrases item;`), указатели, отказывает без `owner-voice-core` (`:4517`); `update-verify` требует отчёт поля (`:3037` `(mandatory since 2.2, decision #46 — this ${verb} was driven by an older core whose task did not list the item;`); `check` называет неподключённые хуки (`:3845`). **Не передано:** формулировка `policy-changes` старого ядра — прямо против правила 2.9 (`:1649`, #114). Совет "иди bootstrap, чтобы получить задание новой версии" живёт только в НОВОМ навыке (`framework/skills/kaif-update/SKILL.md:31` `` Route note: `update` runs the interval with your CURRENTLY DEPLOYED core (the fresh one is ``), а развёрнутый навык 2.1 (KrinikCam `d33c055:.claude/skills/kaif-update/SKILL.md`) ноты маршрута не несёт и шлёт к `верь машинерии и релиз-нотам origin` (`d33c055:.claude/skills/kaif-update/SKILL.md:9`); в странице выпуска слова `bootstrap` нет (`grep -c -i bootstrap reports/RELEASE_NOTES_2.9.md` → `0`), есть лишь `reports/RELEASE_NOTES_2.9.md:36` «on an update from 2.8 the 2.8 core writes the task, and the task carries no such list» | **Задание пишет не та версия, что ставится** (двухавторный маршрут). Передачи свежему ядру сделаны поштучно на пункт и срабатывают ПОЗДНО — на `checkpoint recheck`, когда агент уже прочёл задание; шапка задания не говорит "писано ядром X, передача — на recheck". TWINS: searched `previous core\|older core\|core older than` в `KAIF-CORE.mjs` — found 6 передач (`:3037`, `:4479`, `:4486`, `:4492–4497`, `:4505`, `:4517`); пунктов без передачи — формулировка `policy-changes` | нет | S3 (агент: 120 строк новостей); потенциал S2 — старая формулировка велит спрашивать владельца о том, что #114 запретил (**владелец лично**) | 0,5 (строка маршрута в странице выпуска для ядер старше N + баннер/дописка задания свежим ядром при первом вызове после подмены; проба на клоне 2.1, по образцу `probes/ut3-long-jump-route.mjs`) |
| судья (a) | «refuted (a) a live `/end-chat`» приказ в `AGENTS.md` — нашёл судья, не задание | **CONFIRMED** данные 2.9 знают фразу: `tools/build-framework.mjs:399` `since: '2.4', search: ['/end-chat'] },`; `AGENTS.md` не исключён из поиска (`KAIF-CORE.mjs:1200` `WITHDRAWN_SKIP` — только `.kaif/`, отчёты, летопись, `KAIF.md`, задания) — передача на `recheck` назвала бы место; KrinikCam отметил `recheck` «at the close». Последовательность — NOT-VERIFIABLE-HERE | Тот же класс R1: передача поздняя. Прецедент — KPOT R2 (#129, `researches/35_…/field-b.md`): тогда у `/end-chat` не было `search`, теперь есть | нет | S3 | (в R1) |
| **R2** (+) | Голая строка `KAIF.md` (старое ядро) на `core.ignorecase=true` спрятала два указателя; `check`: `✖ INCOMPLETE: 2 artifacts missing`; «Works as designed in 2.9 — reported as confirmation that the 2.9 detection is valuable on a machine change» | **CONFIRMED** как задумано: `KAIF-CORE.mjs:3777` `` — a clone would lose it; \`checkpoint recheck\` of an update task or the next \`update\` anchors the line to the root `` (в исходнике обратные кавычки внутри строки шаблона JS экранированы обратной косой — так и процитировано). Заусенец формулировки: итог `KAIF-CORE.mjs:3886` `` if (missing) die(`INCOMPLETE: ${missing} artifacts missing`); `` считает «missing» файлы, которые на диске есть, но игнорируются | Смена машины меняет регистрозависимость git — фикс #130 2.9 работает. Заусенец: одна итоговая строка для двух разных бед (нет файла / файл не поедет с клоном) | #130 (закрыт 2.9) | S3 | ≤ 0,1 (итог разделяет «missing» и «git-ignored») |
| **R3** | Дымовая строка README хуков «printed NOTHING: Git Bash `printf` turns `\\n` into a real newline inside the JSON string» | **PARTIAL**: симптом CONFIRMED, причина "Git Bash printf" — **REFUTED**. Строка `framework/hooks/README.md:73` `printf '{"prompt":"resume\\nplan the day"}'` (дальше — конвейер в `prompt-resume-word.mjs`). Проба 1 — строка README из ФАЙЛА (`sed -n 73,74p … > smoke.sh; bash smoke.sh`) в Git Bash: `printf` выдал `e   \   n   p` (`od -c`), хук напечатал приказ `/resume`, exit 0. Проба 2 — та же строка через инструмент Bash агента: `od -c` → `e  \n   p` (настоящий перевод строки), хук молчит. Проба 3 — строка PowerShell-блока (README:81) через инструмент PowerShell: вывод 1159 знаков, exit 0. Слой съедает инструмент агента, не оболочка — ровно как в #151 | Дымовые строки написаны для человеческой оболочки, а исполняет их агент через слой, снимающий один уровень экранирования (урок истока EXP-0121). TWINS: searched `printf .*\\\\` в `framework/**/*.md` — found 1 (README:73) | **#151** (KUMM) | S3 (минуты агента, ложное "хук сломан") | 0,1 (строка без обратной косой, как в #151) |
| **R4** | Пять старых интервью: статус посреди совмещённой шапки (`> **Кому:** … · **Статус:** ✅ ОТВЕЧЕНО …`) не читается; 4 «stale in the queue» хотя отвечены | **CONFIRMED** (проба `probe-status.mjs` на копии `framework/tools/contour/core.mjs`): совмещённая шапка `combined -> none` (документ ЖИВОЙ), отдельная строка `standalone -> closed`, англ. совмещённая `combinedEn -> none`. Причина: `framework/tools/contour/core.mjs:157` `const STATUS_LINE_RE = new RegExp('^\\s*>?\\s*\\*{0,2}(?:' + PARSER.statusLabels + ')\\s*:?\\*{0,2}\\s*(.*)$', 'imu');` — метка только В НАЧАЛЕ строки | Разбор шапки контура знает одну форму строки статуса. TWINS: searched `STATUS_LINE_RE` — found 3 потребителя (`core.mjs:175` `export function statusBlockAwaitsApplication(md) {`, `:185` `docStatus`, `:239` экспорт); та же семья форм — #127 заголовки вопросов (`ideas/32` "Остатки" п. 3) и #109 комм. (п. 1) | нет | S3 у KrinikCam (агент починил до показа); класс S2 — отвеченное стоит долгом в очереди владельца | 0,25 (сегмент `· **Статус:**` первой `>`-строки + фикстура) |
| **R5** | Смена машины: инструменты проекта с путями macOS, `adb` 1.0.32 из `C:\adb`, `gradlew.bat` отклонён `NoDefaultCurrentDirectoryInExePath=1`, `JAVA_HOME` на удалённый JDK; «but the environment dossier of 2.2 is exactly the place that would have warned» | **CONFIRMED** (отсутствие): досье стареет только по дате — `framework/templates/_house-rules-template.md:72` `> than four weeks are HYPOTHESES — re-probe before relying on them.**`, `framework/skills/refresh-context/SKILL.md:38` `` older than four weeks, or values still `— not probed ``; машины в досье нет. TWINS: searched `hostname\|new machine\|machine change\|another machine\|other machine` в `framework/` — found 0 | Факты машины записаны без ключа машины: досье с соседней машины, снятое неделю назад, читается свежим | нет (сам отчёт: «not a KAIF defect») | S3 здесь; класс S2 для любого переезда (агент верит чужому досье) | 0,25 (в строку "Taken" — `os.hostname()` + платформа; шаг 3 `/refresh-context` и `/resume` сравнивают; несовпадение → перепроба) |
| **R6** | «15 of 37 fail — `bad indentation of a mapping entry`»: plain-scalar `description:` несёт `: `; в Claude Code список навыков показал «the file body / the H1 instead of the description for `/fable-domain`, `/fable-loop`, `/derive-styleguide`» | **CONFIRMED** (проба `probe-yaml.cjs`, js-yaml 3.15.0 `safeLoad`, копия из `tools/node_modules` истока): `framework/skills` — 8 of 37; рендер ru-алиасов ядром (`probe-alias.cjs`, та же замена, что `KAIF-CORE.mjs:604` `` (_, d) => `${d.replace(/\s+$/, '')} Trigger aliases (${LANG}): ${triggers[skill]}`); ``) — **37 of 37**; поле (только чтение): KrinikCam **15 of 37** (число отчёта), KUIPS 37 of 37, KAGO 38 of 38; свой `.claude/skills` истока — 9 of 37. Ошибка в точке `: `: `… Trigger aliases (ru): «пауза», …` / `… NOT a blanket yes: it never …`. **Наблюдено в ЭТОЙ сессии:** харнесс выдал список навыков истока со строкой `dayloop: /dayloop — дневная автономная работа, пока владелец занят` и `nightloop: /nightloop — автономная работа до утра` — это H1 (`.claude/skills/dayloop/SKILL.md:6` `# /dayloop — дневная автономная работа, пока владелец занят`), не описание. Каким правилом харнесс роняет одни описания и щадит другие (`kaif-go`, `experience` тоже не строгий YAML, но показаны верно) — NOT-VERIFIABLE-HERE | Фронтматтер пишется plain-скаляром без строгой проверки, а ядро САМО вносит `: ` в каждое описание ru-пакета. TWINS: searched YAML/frontmatter-гейт в `tools/check-framework.mjs` и ядре — found 0 (`check-framework.mjs:56` фронтматтер только срезает) | нет | **S2** (описание — то, по чему харнесс выбирает навык; тихая потеря на каждом ru-развёртывании и у истока; платят полевые проекты на каждом сеансе) | 0,5 (кавычки/`>-` в сборке и в подстановке алиасов, страж строгого YAML в сборке и в `check`, переведённые навыки поля — предупреждением) |

**Пожелания отчёта.** R4 «Wish: the parser could read a `**Статус:**` field anywhere»; R6 «Wish: quote or `>-` every shipped description, and a
build-time strict-YAML gate.»; R5 — досье как сторож переезда; R1 — задание по новой версии.

**Что в 2.9 сработало (дословно).** Хуки: «`4 of 4 KAIF hooks added; a new file` — the harness did NOT refuse the write; hooks fired in this
very session (timer order on the next prompt)»; ignore-first: «`check` named the cure precisely (anchor to the root)»; «`✅ update-verify passed — the
update is complete and self-cleaned`»; #114: «All `policy-changes` lines 2.2–2.9 accepted without questions to the owner»; контур: «`contour
selftest green: 138 checks`»; голос: «голос слышу чётко». Сам прыжок через восемь выпусков старым ядром дошёл до зелёного `update-verify`.

**Кто платит.** Агент — 120 строк новостей (R1), ручные слияния 18 переведённых навыков, перепроба окружения. Владелец лично — второй приказ
«делать, что он предписывает» `[ИИ]` (гипотеза, не доказано: возможно, ответ на колебание агента между словами задания 2.1 «put each in front of
the owner» и правилом 2.9).

**Слова владельца (дословно).** «продолжи за прошлой сессией» … «разворачивать на этом компе проект KrinikCam и обновлять его KAIF до 2.9»;
«делать, что он предписывает»; «голос слышу чётко».

**Пересечения.** #151 (R3), #130 (R2), #114 (R1 — старая формулировка), `ideas/32` п. 13 (а) (GoD R2 — маршрут из старой версии), п. 11 (#79 —
шум `update-verify` длинного прыжка; здесь «9 expected `MODULE ABSENT` lines»), "Остатки" п. 1 и п. 3 (R4 — семья разбора шапки), `bugs/121`
(R3 — проба README, но исполнял агент, не владелец); прецедент KPOT 2.1 → 2.8 (#129): тогда 236 "not found" и `/end-chat` без `search` — оба
вылечены в 2.9, но длинный прыжок старым ядром всё ещё получает их лечение лишь на `recheck`.

---

## #149 — KUIPS установка 2.9 (ru, Windows 11): 18 минут до развёртывания, трение бумажное

**Маршрут.** Пустой репозиторий с `TASK.md` → `GOAL.md` из слов владельца (`b45511d` 22:03:57) → `KAIF.md` из ассета v2.9 → `node
KAIF-LOADER.mjs --lang ru` → код продукта (`7986f05` 22:10:32) → задание 11/11 → `chore: deploy KAIF` (`6fb22a9` 22:16:17 +0300). Отчёт
19:15:53Z. Claude Opus 5.5, VS Code; Git Bash + PowerShell 5.1.

| Грабля | Что случилось | Сверка с HEAD | Класс | Тикет? | S | Цена |
|---|---|---|---|---|---|---|
| **#1** | «`KAIF.md` §1 asks the owner to write `GOAL.md` first», а пункт `owner-voice` закрывается до любого текста владельца; «the install cannot be written by the portrait — the lint tool is not on disk yet»; после установки `check GOAL.md` → «"✖ written past the portrait — no load witness …"» | **CONFIRMED**: `framework/installer/_thin-intro.md:35` `` **`GOAL.md` — write it first if you can**: your one-paragraph vision (what you want, for whom). The `` (и `framework/_intro.md:407`); `KAIF-CORE.mjs:1106` `Either way this item closes BEFORE any owner-facing text (GOAL wording, README) is written.`; `framework/tools/kaif-voice-lint.mjs:400` `` export const NO_WITNESS = (portrait) => `written past the portrait — no load witness for ${portrait} (${VOICE_MARKER}) ``; изъятие — только для НЕТРОНУТОГО шаблона (`kaif-voice-lint.mjs:426–432`, `untouchedTemplate`), GOAL с блоками `[AI]` под него не подпадает | Правило порядка ("портрет раньше текста владельца"), чьё условие на маршруте установки выполнить нельзя: тексты до установки (GOAL, README) пишутся без линтера. TWINS: searched пункты установки с «BEFORE any owner-facing text» — found 1 (`:1106`); тот же случай — README, написанный до установки | нет | S3 | 0,1 (пункт `owner-voice` называет случай: "текст, старше установки — `load`, перепроверь блоки агента") |
| **#2** | 7 слотов ритуалов «surfaced only through `kaif-core check`, which the adaptation task does not ask» … «#141 covered the update route; the install route has the same gap.» | **CONFIRMED**: проба `probe-slots.mjs` — `total slots: 7` (end-chat-soft шаги 3, 4; end-chat-force 2; release 2, 3, 4, 6) — список отчёта точно; скан живёт только в `check` (`KAIF-CORE.mjs:3796` `function cmdCheck() {` … `:3970` `const RITUAL_SKILLS = ['end-chat-soft', 'end-chat-force', 'release'];`); пункт установки `KAIF-CORE.mjs:1118` `` items.push(['verify', 'Run `node .kaif/kaif-core.mjs verify-final` — it checks these checkpoints and self-cleans the installer. ``; `verify-final` — `:4861` `runFinalGates(TASK_FILE, 'KAIF-ADAPT', 'verify-final');` без `check`. На обновлении `check` запускает `checkpoint recheck` (`:4526` `spawnSync(process.execPath, [process.argv[1], 'check']`) | Фикс #141 лёг на маршрут обновления (через `recheck`), у задания установки нет пункта, который запускает `check`. Близнец #141 | нет (только отчёт) | S3 у KUIPS (агент сам запустил `check`); класс S2 — ритуал (`KAIF-CORE.mjs:3985` `or the ritual runs nothing at that step`) (#141: 18 дней красного свода) | 0,1–0,25 (`verify-final` печатает предупреждения слотов, или пункт `placeholders` их называет; фикстура) |
| **#3** | `kaif-voice-lint check` без `--genre` печатает «16 rule(s) … carry a genre label — without --genre every rule judges every text»; «the adaptation item and AGENT_GUIDE's fourth obligation show the command without `--genre`» | **PARTIAL**: сообщение — `framework/tools/kaif-voice-lint.mjs:537` `carry a genre label — without --genre every rule judges every text; name the text's genre:`. Сама четвёртая обязанность `--genre` показывает: `framework/AGENT_GUIDE.md:347` `` `node .kaif/tools/kaif-voice-lint.mjs check <file…> --genre <genre>` `` — тут отчёт **REFUTED**; без `--genre` — пункт `KAIF-CORE.mjs:1106`, маршрутизатор гида `AGENT_GUIDE.md:116` `AUTHOR_STYLOMETRY.md, check independently (node .kaif/tools/kaif-voice-lint.mjs check <file…> + a clean-instance`, `:140`, `:926`, `framework/templates/_owner-voice-template.md:124`, `framework/skills/fable-judge/SKILL.md:61` | Команда одного инструмента записана в нескольких местах разными формами. TWINS: searched `voice-lint[a-z.]* check` в `framework/` — found 10: с `--genre` 3 (`AGENT_GUIDE.md:347`, `owner-voice/SKILL.md:82`, `_owner-voice-template.md:113`; + справка инструмента `:68`), без — 6 | нет | S3 | ≤ 0,1 |
| **§3.1** | «`STATUS.md` and `MASTER_PLAN.md` arrive in English while AGENT_GUIDE's language table routes them to the owner's language»; агент переводит руками | **CONFIRMED**: таблица — `framework/AGENT_GUIDE.md:445` `` `GOAL.md` · `MASTER_PLAN.md` · `STATUS.md` · `KAIF_FRAMEWORK.md` `` (столбец "The owner reads it → owner's language"); ru-пакет `framework/templates/languages/ru/` — `GOAL.md`, `KAIF_FRAMEWORK.md`, шесть README, `skill-triggers.json` — STATUS и MASTER_PLAN нет; установка называет это замыслом — `KAIF-CORE.mjs:659` `is INCOMPLETE BY DESIGN (the framework is English-first)`; пункт перевода (только без пакета) — `KAIF-CORE.mjs:1109` `Translate the owner-facing docs (GOAL.md, KAIF_FRAMEWORK.md, the directory READMEs)` — тоже без STATUS/MASTER_PLAN | Таблица аудитории канона и списки пакета/пункта установки ведутся отдельно и разошлись. Близнец — #152 (перенос фактов в `HOUSE_RULES.md` на языковом пакете — ручной перевод, о котором задание молчит) | нет (сосед #152) | S3 (первое впечатление: русский проект открывает английский STATUS) | 0,25 (STATUS/MASTER_PLAN в ru-пакет — это скелеты, — или пункт установки называет их) |
| **§3.2** | Какой выпуск портрета берёт публичный репо — ответил прежний выбор владельца в соседнем проекте; «nothing in the item points at sibling deployments as a source» | **PARTIAL**: правило есть — `KAIF-CORE.mjs:1106` `a PUBLIC repository takes the public snapshot, the edition made for publication`; указателя, ГДЕ искать прежнее слово владельца (соседние развёртывания той же машины), нет. Поиск прошлого слова — только по репо (`framework/tools/contour/core.mjs:384` `export const ARCHAEOLOGY_PATHS = 'interviews/ GOAL.md MASTER_PLAN.md plans/'` — `HOUSE_RULES.md` в нём всё ещё нет, = `ideas/32` п. 7 KAGO R12, см. `researches/35_…/field-b.md` R12) | Слово владельца ВНЕ репозитория — близнец KAGO R3 | нет | S3 | (с KAGO R3) 0,25 |
| **§3.3** | «The `study` item asks to re-read nine core documents (~69k tokens per `check`) before the maps exist» | **CONFIRMED**: `KAIF-CORE.mjs:1091` пункт `study` — `Then re-read the nine re-read-core documents you deployed (AGENT_GUIDE.md → "Document taxonomy", tier 1) and stamp the refresh witness`; пункт `maps` — ПОСЛЕ него (`:1098`); гид — 1080 строк (`wc -l framework/AGENT_GUIDE.md` → `1080`) | Фикс #143/#145 2.9 поставил перечитывание (ради отметки таймера) до того, как карты и слоты заполнены: агент платит ~69k за чтение шаблонов. Перенос отметки к последнему пункту перед `verify` даёт то же молчание таймера на первом слове владельца | нет | S3 (токены агента) | ≤ 0,1 |

**Что в 2.9 сработало (дословно).** «"KAIF 2.9 deployed mechanically (lang ru · 7 owner docs templated · 37 skills trigger-aliased …)"»; блок
загрузчика «diffed against `KAIF/dist/KAIF.md` — identical»; хуки «`wire-hooks` → "4 of 4 KAIF hooks added"»; слоты (NT3, #141) — «after filling
them → 0 warnings»; свидетель таймера (#143/#145) — «refresh witness — `.kaif/refresh-marker.json` at 2026-10-16T22:11:15+03:00 with 9 docs».
По `git log` KUIPS: от первого коммита до `chore: deploy KAIF` — 12 мин 20 с (22:03:57 → 22:16:17 +0300); от старта по отчёту (21:58) — 18 минут.

**Кто платит.** Агент — ручной перевод двух документов, ~69k токенов, перепроверка GOAL; владелец — блоки `[AI]` в `GOAL.md` и
`MASTER_PLAN.md` ждут его приёмки (вердикт судьи).

**Слова владельца.** Нет дословных. («Публичный слепок» — пометка агента о выборе владельца в KARTUN 2026-10-14; авторство слов не проверено.)

**Пересечения.** #141 (#2 — маршрут установки), #152 (§3.1), `ideas/32` п. 2 LB (#3 — линтер голоса), п. 3 L10N (§3.1), п. 13 (б) и п. 14 (#2:
KUIPS заполнил слот шага 2 `/release`, открытый посреди строки, — на следующем обновлении `update-verify` даст ложное "not found"), п. 7 (цена входа).

---

## Класс поверх трёх отчётов

1. **Длинный прыжок = задание пишет ядро прошлой версии.** KrinikCam (2.1 → 2.9) — пятый полевой прыжок через несколько версий и ПЕРВЫЙ
   маршрутом старого ядра: KPOT 2.1 → 2.8 (#129), GoD 1.2 → 2.8 (#131), обезличенное 1.5 → 2.8 (#135), KUMM 2.7 → 2.9 (#153) шли bootstrap'ом
   (по `researches/35_…/field-b.md`, `ideas/32` и заголовку #153). KAGO выбрал маршрут по странице выпуска («release notes item 6») — значит,
   страница выпуска и есть место, где решают маршрут. Механика держит: бой зелёный, 236 "not found" KPOT ушли. Но задание — по 2.1: формулировка
   `policy-changes` против #114, пункты 2.2–2.9 приходят поштучными передачами свежего ядра на `checkpoint recheck` и `update-verify`, то есть
   ПОСЛЕ того, как агент прочёл задание и начал работу; судья нашёл `/end-chat` раньше передачи. Совет "на старом ядре иди bootstrap" есть
   только в новом `/kaif-update`, которого обновляющий до обновления не видит; страница выпуска его не несёт. Это класс для ЛЮБОГО проекта на
   ядре старше предыдущего выпуска. Форма: (а) строка в странице выпуска и в `KAIF.md` ("ядро старше X.Y — маршрут bootstrap"); (б) свежее ядро
   на первом же вызове после подмены дописывает к заданию шапку "писано ядром 2.1 — вот пункты этой версии" (одна функция вместо шести
   передач на `recheck`). Проверка — проба маршрута на клоне 2.1 (`probes/ut3-long-jump-route.mjs` как образец).
2. **Смена машины — то, чего KAIF не знает вовсе.** Ни одного упоминания машины (`hostname|new machine|…` → 0). Что из переезда macOS → Windows
   ловит 2.9: регистронезависимый git (#130 — сработало, «valuable on a machine change»). Чего не ловит: досье окружения со старой машины
   читается свежим (стареет только по дате); дымовые строки README исполняются агентом через слой, съедающий экранирование (#151); итог `check`
   зовёт игнорируемые файлы «missing». Для любого проекта: ключ досье — машина, а не только дата.
3. **Первое впечатление ru-проекта.** Механика — 12 минут и ноль предупреждений после заполнения слотов. Трение — от нестыковок канона с
   маршрутом установки: (а) порядок "GOAL первым" против "портрет до текста владельца"; (б) `check`, которого задание установки не просит,
   единственный видит 7 слотов ритуалов (#141 закрыт только на маршруте обновления); (в) таблица языков против состава ru-пакета; (г) 37 из 37
   описаний навыков ru-пакета — не строгий YAML (по вине подстановки алиасов `(ru): `). Пункт (г) — для каждого развёртывания с языковым
   пакетом и для самого истока.
4. **Слово владельца вне репозитория.** KAGO — в памяти агента («ответ — это конец хода»), KUIPS — в соседнем развёртывании (выбор портрета).
   Пункт `policy-changes` и поиск прошлого слова знают только `[OWNER]`-строки и `ARCHAEOLOGY_PATHS` репо; гид при этом сам велит читать
   `MEMORY.md` `key decisions`. Одна строка в пункте и в гиде: слово владельца в памяти агента или в соседнем проекте — тоже коллизия, один
   вопрос, никогда не тихая перезапись.
5. **Что стоило времени владельцу лично (все три отчёта):** одна команда `wire-hooks` (KAGO, отказ харнесса агенту); один вопрос о коллизии с
   памятью (KAGO); правило "открой ответ его словами", которое его «бесит» (#156); приёмка блоков `[AI]` GOAL/MASTER_PLAN (KUIPS); второй приказ
   «делать, что он предписывает» (KrinikCam, причина — гипотеза). Опасного для машины или данных — нет.

## Наблюдения для открытых багов истока

| Баг | Условие DONE | Наблюдение |
|---|---|---|
| `bugs/129` | первое полевое обновление 2.8 → 2.9, чья `recheck` назвала неподключённые хуки (или подключила их раньше — строки нет) | **В пользу DONE (вторая ветка):** KAGO 2.8 → 2.9 — «The four delivered hooks were already wired», а предупреждение `check` об отставном хуке до агента дошло (R1). Явно через `recheck` — не сказано |
| `bugs/121` | владелец развёрнутого проекта исполняет пробу README в СВОЁМ окне PowerShell и видит приказ | **Нет.** KrinikCam — «the four hook scripts by hand» агентом; провал POSIX-строки — слой инструмента агента (проба выше), PowerShell-строка через инструмент работает |
| `bugs/123` | первое поле на 2.9 | **Нет чистого наблюдения.** KAGO: слово владельца о самом правиле («не нужно начинать с моих слов») — это #156; исполнение ответа посреди хода не описано |
| `bugs/119` | событие из подкаталога на Windows без "no refresh witness" (#94) | **Нет.** KAGO NOT exercised «the refresh hooks from a subfolder (#94)» |
| `bugs/128` | "resume + вопрос" владельца — ответ без начала работы | **Нет** ни в одном из трёх |

## Таблица

| Тикет · находка | Вердикт сверки | S | Цена (чаты) | Кандидат-эпик (рабочее имя) |
|---|---|---|---|---|
| #155 R1 → #154 | CONFIRMED (код + проба exit 1) · отказ харнесса NOT-VERIFIABLE-HERE | S3 (владелец лично) | 0,25 | HR "Отставка хука в порядке харнесса" (у разведчика #154) |
| #155 R2 — рецепт песочницы | CONFIRMED (фикс #130 и ложное `differ by the rehearsal line alone`) | S3 | ≤ 0,1 | UO "Обновление старым ядром / рецепт" |
| #155 R3 — память агента | CONFIRMED (`[OWNER]` only vs `MEMORY.md` `key decisions`) | S3 (владелец лично) | 0,1 | OX "Слово владельца вне репо" |
| #155 R5 — слоты `/release` | CONFIRMED (4 слота, у KAGO 3) | S4 | 0 (п. 14 — 0,1) | — (`ideas/32` п. 14) |
| #155 §1a — #109/#119 «fixed» | PARTIAL (вторые случаи открыты) | — | — | `ideas/32` "Остатки" п. 1–2 |
| #158 R1 — задание ядра 2.1 | CONFIRMED · PARTIAL по последствиям (6 передач поздние; формулировка `policy-changes` не передана; маршрут не назван в странице выпуска) | S3 (потенциал S2) | 0,5 | UO "Обновление старым ядром" |
| #158 судья (a) — `/end-chat` в `AGENTS.md` | CONFIRMED (данные есть, передача поздняя) · порядок NOT-VERIFIABLE-HERE | S3 | (в R1) | UO |
| #158 R2 — ignore на новой машине | CONFIRMED как задумано · заусенец «missing» | S3 | ≤ 0,1 | MC "Смена машины" |
| #158 R3 → #151 | PARTIAL: симптом CONFIRMED (проба), "Git Bash printf" REFUTED (слой инструмента) | S3 | 0,1 | MC / хвост модуля хуков |
| #158 R4 — статус в совмещённой шапке | CONFIRMED (проба `combined -> none`) | S3 (класс S2) | 0,25 | CP-хвост "Формы шапки интервью" (с "Остатки" п. 1, 3) |
| #158 R5 — досье без машины | CONFIRMED (отсутствие, 0 мест) | S3 (класс S2) | 0,25 | MC "Смена машины" |
| #158 R6 — фронтматтер не строгий YAML | CONFIRMED (проба: 8/37 поставка, 37/37 ru-рендер, 15/37 KrinikCam, 37/37 KUIPS, 38/38 KAGO, 9/37 исток; H1 вместо описания у 2 навыков в этой сессии) · правило харнесса NOT-VERIFIABLE-HERE | **S2** | 0,5 | FM "Фронтматтер навыков — строгий YAML" |
| #149 #1 — GOAL до установки vs портрет | CONFIRMED | S3 | 0,1 | IF "Первое впечатление установки" |
| #149 #2 — слоты видит лишь `check` | CONFIRMED (проба: 7 слотов) | S3 (класс S2) | 0,1–0,25 | IF (близнец #141) |
| #149 #3 — `--genre` | PARTIAL (сама 4-я обязанность с `--genre`; 6 мест без) | S3 | ≤ 0,1 | IF / `ideas/32` п. 2 LB |
| #149 §3.1 — STATUS/MASTER_PLAN по-английски | CONFIRMED | S3 | 0,25 | IF / `ideas/32` п. 3 L10N (+ #152) |
| #149 §3.2 — слово владельца в соседнем проекте | PARTIAL (правило есть, источника нет) | S3 | (с #155 R3) | OX "Слово владельца вне репо" |
| #149 §3.3 — 69k на перечитывание до карт | CONFIRMED | S3 | ≤ 0,1 | IF |
