# Разведка 2.9 — группа tools: #109 #110 #111 #112 #116 #117 #119 #87 #94

> Тикеты прочитаны целиком (тело + все комментарии) из `scratchpad/issues/<N>.md` — 2026-09-28 17:15 UTC.
> Сверка — HEAD `52f688c`; `git diff --stat v2.8 HEAD -- framework/ tools/` → пусто (поставка и инструменты = тег v2.8);
> `dist/KAIF-CORE.mjs` побайтно равен `framework/installer/KAIF-CORE.mjs` (`cmp` → равны), поэтому номера строк ядра в тикетах
> совпадают с источником. Клон истока мелкий (`git rev-parse --is-shallow-repository` → `true`, 50 коммитов) — датировать по git
> появление файлов нельзя.
> Пробы — только в копиях в `scratchpad/p<N>.*` (там и лежат, для перепроверки); OS-temp не тронут: у проб с temp `TMPDIR` указывал
> в скретчпад, `ls /tmp | grep -c '^kaif-'` → `0`. В `/home/user/KAIF` ничего не изменено (`git status --porcelain` → пусто).
> Цитаты: « / » внутри цитаты — перенос строки файла; многоточие в цитату кода не ставлю — обрезаю только хвост строки.

---

### #110 — песочницы и тела `report --dry-run` не убираются: ≈ 62 ГБ в OS-temp за три дня, диск владельца заполнен

- **Суть:** в `%LOCALAPPDATA%\Temp` машины владельца ≈ 62 ГБ каталогов `kaif-*` за 2026-09-24…26 (≈ 20 ГБ в день). Два источника:
  (1) `tempRoot()` оставляет корень красного и прерванного прогона без предела хранения; (2) ядро `report --dry-run` (и выход
  OUTCOME UNKNOWN) оставляет `kaif-report-*` на каждый вызов.
- **Сверка с HEAD:**
  - Обещание канона — **CONFIRMED** дословно: `tools/lib/temp-root.mjs:18` `//   • зелёный прогон убирает свой корень — мусор в temp не копится;`
    и `:19` `//   • КРАСНЫЙ прогон корень ОСТАВЛЯЕТ и печатает путь — улика лежит там, где она нужна;`. Предела хранения нет:
    `:61-68` — уборка только в `process.on('exit', …)` при `code === 0`, иначе `ℹ️  временный корень оставлен для разбора`.
  - «any suite run through `tempRoot()` that ends red, or is killed before its cleanup (an agent's
    background-task limit, a timeout, Ctrl+C), leaves its root» — **CONFIRMED** пробой на копии `temp-root.mjs` (`TMPDIR` = скретчпад):
    `green exit=0 left=0` · `red exit=1 left=1` · `sigterm exit=143 left=2` · `sigint exit=130 left=3`. Node не шлёт `exit` на
    SIGTERM/SIGINT без обработчика; на Windows TerminateProcess не ловится вообще — прерванный прогон уборку не проходит никогда.
  - «a selftest that proves a guard red by design leaves one on every run» — **CONFIRMED, механизм уточнён: это
    пробы-мутанты истока.** Они гоняют свод на мутированном dist и ЖДУТ красного, а stderr ребёнка глотают:
    `tools/sandbox/probes/budget-mutants.mjs:245` `try { out = execFileSync(process.execPath, [SUITE], { cwd: REPO, env: { ...process.env, KAIF_DIST: dist }, stdio: 'pipe', maxBuffer: 1 << 26 }).toString(); }`
    (так же `sc-mutants.mjs:109`, `voice-mutants.mjs:138`, `hooks-mutants.mjs:114`, `fold-mutants.mjs:52`, `ch1-report-mutants.mjs:53`,
    `up-mutants.mjs` — наборы `s21`/`s27`/`s18`). Проба: родитель зовёт красного ребёнка через `execFileSync(..., {stdio:'pipe'})` →
    `child stderr swallowed: "ℹ️  временный корень оставлен для разбора: …/kaif-sbx-probe-QFNz55"`, `mutant-style exit=0 left=4`.
    Арифметика сходится с таблицей тикета: мутантов (строк `{ name:`) — budget 27, voice 18, hooks 12, sc 19, up 20 (из них s21 ×16,
    s27 ×3, s18 ×1); `kaif-sbx-hooks` 72 = 12 × 6 прогонов, `kaif-sbx-budgets` 464 ≈ 27 × 17, `kaif-sbx-voicelint` 245 ≈ 18 × 13.6,
    `kaif-sbx-scanners` 168 ≈ 19 × 8.8, `kaif-sbx-update-route` 106 ≈ 16 × 6.6. Сами пробы свой `mkdtemp`-корень убирают
    (`budget-mutants.mjs:258` `rmSync(root, …)`), корень ребёнка — нет: он создан ребёнком в общем temp.
  - «Every `report --dry-run` (and every OUTCOME UNKNOWN exit) leaves a `kaif-report-*` directory» — **CONFIRMED** пробой копии ядра в проекте `tracking: origin`: три вызова
    `report bugs/KAIF/01_probe.md --dry-run` → `left: kaif-report-CDO3CX kaif-report-FoQOBq kaif-report-SWOxfz`.
    `framework/installer/KAIF-CORE.mjs:3984` `const bodyDir = mkdtempSync(join(tmpdir(), 'kaif-report-'));   // unique by construction (bugs/59)`;
    `:3988` — ветка dry-run `return` без `cleanup()` («the body is kept there for inspection»); OUTCOME UNKNOWN (`process.exit(3)`) — тоже без.
  - **Сверх тикета — откуда 436 `kaif-report-*` на машине, где поле `report` зовёт редко:** зелёный свод истока `s17` сам
    льёт их в НАСТОЯЩИЙ temp: 5 вызовов `--dry-run` (`tools/sandbox/s17-report.mjs:125`, `:169`, `:172`, `:176`, `:179`) + 1 OUTCOME
    UNKNOWN (`:158`) на прогон, а `run` передаёт ребёнку `process.env` без перенаправления temp (`s17-report.mjs:46`
    `const e = { ...process.env, KAIF_GH: SHIM, GH_SHIM_LOG: CALLS, ...env };`). 436 ÷ 6 ≈ 73 прогона `s17` (полигон +
    `ch1-report-mutants` ×4). `tools/lib/sandbox-run.mjs` тоже не задаёт `TMPDIR`/`TEMP` (греп `TMPDIR\|TEMP` → 0). То есть утечка
    ядра поставки идёт даже из ЗЕЛЁНЫХ прогонов полигона.
  - «437 of them are on disk» против строки таблицы `436 MB   436  kaif` — **PARTIAL**: сам тикет расходится на единицу.
  - Размеры, возраст, «58 new `kaif-*` entries appeared within two hours of the observation», «free space on C fell from 22.0 GB to 18.8 GB within one hour»,
    «an agent's sweep of the shared temp was refused by the agent system's safety layer» —
    **NOT-VERIFIABLE-HERE** (Windows владельца). Косвенно: в этой сессии слой безопасности Claude Code отказал мне в `rm` с глобом
    после `cd` (вывод инструмента: "Dangerous rm operation detected") — чистку нельзя поручать агенту, она обязана жить в коде инструмента.
  - `kaif-judge` (1031 MB) и `kaif-court` (341 MB): `grep -rn "kaif-judge\|kaif-court"` по репозиторию → 0 — это каталоги,
    заведённые агентами/судьями вручную; хозяина в коде нет.
- **Класс:** "temp — хранилище только на запись" (в тикете: «together they make temp a write-only store»): правило "красный корень — улика" без предела хранения + уборка только на пути
  нормального выхода + красный ПО ЗАМЫСЛУ (мутанты) идёт через тот же путь "улики" + дети полигона живут в общем temp.
  Историческая заметка: до `bugs/59` имена были фиксированными и корень перезаписывался (≤ 13 каталогов); `mkdtemp` (форма bugs/59)
  убрал коллизию, но превратил "перезапись" в "накопление" — ограничитель исчез вместе с фиксированным именем.
  TWINS: searched `mkdtemp|tmpdir|os\.tmpdir` по `framework/` (кроме `.md`) — found 4 файла: `KAIF-CORE.mjs:3984` (этот тикет);
  `hooks/stop-status-guard.mjs:44` + `:65` — файл кулдауна `kaif-status-guard-<session>` на КАЖДУЮ сессию, не удаляется никогда
  (байты ничтожны, класс тот же); `tools/contour/review.mjs:1618` — селфтест убирает корень только в конце (`:2047`, не в `finally`:
  исключение посреди → `kaif-contour-*` остаётся); `tools/kaif-attribution-lint.mjs:424` — в `try/finally`, чисто.
  По `tools/` истока: 30 вызовов `tempRoot(` в сводах `s01…s29` и стражах + ≈ 45 прямых `mkdtempSync`; без уборки —
  `tools/build-logo-title.mjs:200` `` const scratch = join(tmpdir(), `kaif-logo-${process.pid}`); `` (нет `rmSync(scratch`);
  мутант-пробы — уборка без `finally` (исключение посреди → и свой корень остаётся).
- **Кто платит сейчас:** владелец лично (машина, на которой живёт исток; сервер стриминга там же) — **S1**. Поле — копейки
  (`kaif-report-*` по КБ на dry-run, файл кулдауна на сессию): ≈ 61 ГБ из 62 даёт инструментарий ИСТОКА (`tools/`, не поставка;
  `grep -c "kaif-sbx\|tempRoot" dist/KAIF-CORE.mjs` → 0).
- **Форма починки:** (1) мутант-пробы и `KAIF_DIST`-красные доказательства передают своду ЯВНЫЙ путь внутри своего корня
  (`tempRoot(name, explicit)` уже отдаёт такой корень вызывающему) — "красный по замыслу" не попадает в общий temp; (2) `tempRoot`:
  обработчики SIGINT/SIGTERM/SIGHUP убирают корень (у прерванного прогона вердикта нет — уликой он не является) + уборка своего
  префикса при входе (старше 24 ч; это единственная защита от TerminateProcess); (3) дети полигона получают `TMPDIR/TEMP/TMP` =
  `<корень>/tmp`; (4) ядро: тело dry-run — один фиксированный путь на проект, перезаписываемый; (5) страж полигона: после зелёного
  прогона в OS-temp нет новых `kaif-*` → иначе красный; мутант "уборка убрана" доказывает стража. Цена ≈ 0,5 чата
  (исток + одна строка ядра + страж + свод s17/s14 на `TMPDIR`).
- **Пересечения:** `ideas/31` — прямого пункта нет (ближе всего п. 11 «Расширение охвата селфтестов» и п. 29 — пробы выпуска как модули:
  их надо сразу строить по новой форме); `bugs/116` (открыт, 🔧) — тот же канал "прогоны `KAIF_DIST`/судьи в песочнице достают
  мир владельца"; `bugs/59` DONE — родитель формы; #94 — файл кулдауна того же хука `stop-status-guard.mjs`.
- **Слова владельца:** «что-то заняло опять много места на дистке C».

### #109 — закрытый статус с пояснением "не отвечен владельцем" читается открытым, и вид долга 2.8 красит его «решения ждут внесения»

- **Суть:** строка статуса `✅ **ЗАКРЫТО 2026-08-30 14:5x — ВОПРОС СНЯТ АГЕНТОМ, А НЕ ОТВЕЧЕН ВЛАДЕЛЬЦЕМ.**` читается `waiting`: отрицание
  проверяется раньше отметки, а явного слова закрытия в словаре нет. `--queue --list` выводит документ первой красной строкой
  долга; `/resume` и `/what-next` ставят этот долг выше плана.
- **Сверка с HEAD:**
  - Порядок проверок — **CONFIRMED**: `framework/tools/contour/core.mjs:179` `if (STATUS_NEGATION_RE.test(line)) return 'waiting';   // negation outranks the tick`.
  - Словарь — **CONFIRMED**: `framework/tools/contour/texts.mjs:46` `statusClosed: '✅|🟢|STATUS:\\s*DONE|ANSWERS\\s+RECEIVED|ОТВЕЧЕНО',` — ни
    `CLOSED`, ни `ЗАКРЫТ`, ни `WITHDRAWN`/`СНЯТ`; `:49` `statusNegation` содержит `(?<!\\p{L})не\\s*отвечен` и `\\bnot\\b[^.]{0,40}\\banswer`.
  - Репро тикета — **CONFIRMED** побайтно на копии контура: `"waiting" ← **Status:** ✅ **ЗАКРЫТО 2026-08-30 14:5x — ВОПРОС СНЯТ АГЕНТОМ, А НЕ ОТВЕЧЕН ВЛАДЕЛЬЦЕМ.**` ·
    `"waiting" ← **Status:** ✅ CLOSED 2026-08-30 — the question was withdrawn by the agent, not answered by the owner.` · `"closed" ← **Status:** ✅ CLOSED 2026-08-30 — withdrawn by the agent.`
    Сверх тикета: `"waiting" ← **Status:** ✅ ЗАКРЫТО 2026-08-30 — снят, пока не нужен.` (ловит `пока не`), `"waiting" ← ✅ CLOSED — no action needed yet.`
    (ловит `no … yet`); без галочки `"none" ← **Status:** CLOSED 2026-08-30` — слово закрытия само по себе не закрывает вовсе.
  - Шаг 3 репро (`--queue --list`) — **CONFIRMED**: `🔴 РЕШЕНИЯ ВЛАДЕЛЬЦА ЖДУТ ВНЕСЕНИЯ — 1: все вопросы отвечены, статус не закрыт. …`
    `interviews/interview_020_probe.md — отвечено 29 дн. назад`; соседний документ без "не отвечен" в строке — в долг не попал.
  - `--mark-withdrawn` отказывает на отвеченном вопросе — **CONFIRMED**: `texts.mjs:172` `answeredNotWithdrawn: (doc, q) => doc + ' ' + q + ' is ANSWERED by the owner — only an open question is withdrawn; nothing recorded',`.
  - `/resume` и `/what-next` ставят долг первым — **CONFIRMED**: `framework/skills/resume/SKILL.md:70` `0. **The owner's debt** — his decisions awaiting application (the first section of the queue command of step 1b) and the bugs`;
    `framework/skills/what-next/SKILL.md:52` `` (the first section of `node .kaif/tools/contour/review.mjs --queue --list`, named with their age, no date cutoff) and the bugs he ``.
- **Класс:** контур судит закрытость по регуляркам без приоритета явного слова закрытия; «negation outranks the tick» (bugs/70)
  применено ко всей строке, включая пояснение ПОСЛЕ закрытия. **Вторая грань того же механизма (сверх тикета, страшнее):** закрытый
  документ с таким пояснением и ПУСТЫМ ответом уходит в очередь ВЛАДЕЛЬЦА. Проба (свежая дата в статусе):
  `⛔ interviews/interview_022_empty.md — ждёт 1 дн. · НИ РАЗУ НЕ ПОКАЗАН — владелец не знает, что этот вопрос существует` +
  `🔴 ГЕЙТ (I42): ни разу не показанных — 1.` — гейт требует поднять страницу (со зовом) по снятому вопросу, а его совет «закрой его
  статусом» неисполним: статус уже закрыт. Со старой датой — строка `! протух в очереди (29 дн. > 14): … закрой статусом …`.
  TWINS: searched `docStatus(` по `framework/` и `tools/` — found 3 потребителя: `review.mjs:318` (очередь владельца), `core.mjs:205`
  (правило 4 разбора вопросов), и исток `tools/questions-guard.mjs:364` через шим `tools/lib/review-core.mjs:15` (`export * from '../../framework/tools/contour/core.mjs';`).
  Скан интервью истока тем же `docStatus` → `ticked/closed-looking but waiting: 0` — у истока случаев нет.
- **Кто платит сейчас:** полевые проекты на каждом `/resume` и `/what-next` (ложная строка №1 → либо "внесение" решения, которого
  владелец не принимал, либо привычка пропускать красное); в грани "пустой ответ" — владелец лично (страница и зов по снятому
  вопросу). **S2** (грань "пустой ответ" — S1 по доверию, если сработает).
- **Форма починки:** явное слово закрытия в голове значения статуса (`✅?\s*\*{0,2}(CLOSED|ЗАКРЫТ\p{L}*|WITHDRAWN|СНЯТ\p{L}*)`) выше
  отрицания; «negation outranks the tick» остаётся для голой галочки; словари RU+EN в `texts.mjs`; селфтест-фикстуры по языку
  (три строки тикета + "пока не нужен" + пустой ответ), кейс `s22`, мутант "порядок вернули". Цена ≈ 0,25 чата.
- **Пересечения:** `ideas/31` п. 28 (регулярки генератора контура не читают полевые формы — та же семья `texts.mjs` PARSER);
  `bugs/84` (оси вопросов контура); `bugs/70` DONE (источник правила отрицания); #86 (вид долга 2.8, который сделал ошибку громкой).
- **Слова владельца:** «Не понимаю проблемы и вопроса. Нужно проще пояснить» (его ответ в интервью, процитирован тикетом).

### #111 — `kaif-attribution-lint` читает git-игнорируемые корневые `*.md` с диска, а `--write-baseline` копирует их строки в коммитуемый файл

- **Суть:** корневые `*.md` скоупа по умолчанию берутся `readdirSync`, а не из `git ls-files`; игнорируемый приватный файл
  (портрет владельца) сканируется, и текст находки уходит в `.kaif/attribution-lint.baseline.json`, который закрытие велит закоммитить.
- **Сверка с HEAD:**
  - Цикл по диску — **CONFIRMED**: `framework/tools/kaif-attribution-lint.mjs:308` `    for (const n of readdirSync(root)) if (/\.md$/i.test(n) && !TRANSIENTS.has(n)) {`
    и `:309` `      const t = kaifWalk([join(root, n)]);   // a file root: taken when it is a file, NAMED when it is a broken link` — у
    `kaifWalk` файл-корень берётся без фильтра git (`:126` `if (!st.isDirectory()) { take(r); continue; }`).
  - Текст строки в базлайне — **CONFIRMED**: `:339` `` for (const f of findings) entries[f.key] = `${f.file}:${f.line} ${f.text.slice(0, 100)}`; ``;
    значения `entries` нигде не читаются (проверка берёт только ключи: `:352`/`:353`) — текст не нужен машине.
  - Репро — **CONFIRMED** побайтно: `baseline written: out.json — 1 finding(s) recorded as debt …` и в файле
    `"PRIVATE.md:ca9a68192423980a": "PRIVATE.md:3 The owner decided to keep the secret recipe of his grandmother in this file."`;
    `git check-ignore PRIVATE.md` → `PRIVATE.md`. Контроль: тот же игнорируемый файл в `plans/` в базлайн не попал (`grep -c "plans/PRIVATE" out2.json` → `0`) —
    дыра только у корня.
  - Обещание релиза — **CONFIRMED**: `reports/RELEASE_NOTES_2.8.md:38` «The core and the six tool modules that walk the file tree read the files that `git ls-files` lists»;
    приказ закрытия — `framework/skills/end-chat-soft/SKILL.md:69-70` («record that debt ONCE — `node .kaif/tools/kaif-attribution-lint.mjs check --write-baseline` writes / `.kaif/attribution-lint.baseline.json`; commit it.»).
  - Полевые числа (393 против 392 файлов, `AUTHOR_STYLOMETRY.md` KAGO) — **NOT-VERIFIABLE-HERE**.
- **Класс:** "единый git-зрячий обходчик" 2.8 применён к каталогам, а ручная перечисляющая петля осталась на корне; плюс
  "артефакт для коммита хранит содержимое, а не отпечаток". TWINS: searched `readdirSync(` по `framework/tools/*.mjs` вне блока
  KAIF-WALK — found 2: `kaif-attribution-lint.mjs:308` (этот) и `kaif-testrun-lint.mjs:308` (каталог отчётов; игнорируемые отчёты
  читаются, но ничего коммитуемого не пишется — не утечка); searched `kaifWalk([` — ядро (`KAIF-CORE.mjs:1270`, `:2682`) и пять
  модулей идут через `.`/каталоги — чисто. Базлайн `kaif-experience-lint` хранит только id (`kaif-experience-lint.mjs:368` `ids: kept`) — не близнец.
- **Кто платит сейчас:** полевые проекты с приватным игнорируемым корневым `*.md` на первом закрытии после 2.8 (near-miss:
  у KAGO находок в портрете сегодня 0). **S2** (near-miss S1 — приватность в публичном репозитории).
- **Форма починки:** корневые `*.md` — из того же `git ls-files --cached --others --exclude-standard` (без git — как сейчас); базлайн
  хранит ключ (файл + хеш), без текста. Фикстура `s24`: игнорируемый корневой файл → не сканируется, в базлайне нет. Вместе с #112 —
  ≈ 0,5 чата.
- **Пересечения:** #112 (тот же базлайн); `ideas/31` п. 22 (окно линтера атрибуции), п. 3 N7, п. 30 (#83 R1(а), #89); #77 CLOSED
  (исток того же класса — обходчик); открытых `bugs/` истока на этот модуль нет.
- **Слова владельца:** нет.

### #112 — `check <path> --write-baseline` стирает весь долг вне `<path>`; одинаковые строки делят ключ и новая копия уходит в долг

- **Суть:** запись базлайна из суженного скоупа пишет находки скоупа как ВЕСЬ базлайн — долг вне скоупа исчезает, а сама суженная
  проверка советует «rewrite it». Комментарий добавил вторую дыру: третья одинаковая строка поглощается долгом (exit 0).
- **Сверка с HEAD:**
  - Запись из скоупа — **CONFIRMED**: `kaif-attribution-lint.mjs:362` `    writeBaseline(findings);` при `:355-356` «Adoption writes the whole
    picture once. After that the baseline ONLY SHRINKS: a rewrite that would / launder a NEW finding into debt is refused».
    Проба (plans + ideas, по находке в каждом): суженная проверка → `✅ attribution-lint OK — 1 file(s) scanned, new 0 · debt 1 (baseline bl.json, 1 entry no longer found — rewrite it)`;
    `check plans --write-baseline` → `… 1 finding(s) recorded as debt (0 adopted as NEW on purpose, 1 pruned)`, `entries left: 1`;
    полный `check` по урезанному → `✖ attribution-lint: 1 NEW finding(s) in 2 file(s) · debt 1`, exit 1.
  - Подсказка «rewrite it» считается по всему базлайну — **CONFIRMED**: `:369` `  const prunable = baseline ? known.size - debt : 0;`.
  - Комментарий: «fixing one of two identical lines cannot be told from fixing both» снят автором — снятие верно (ключ без счёта,
    но `debt` считает находки, не ключи). Новая дыра — **CONFIRMED**: `count 2 keys 1`, затем третья строка →
    `✅ attribution-lint OK — 1 file(s) scanned, new 0 · debt 3 (baseline bl.json)`, `exit=0`. Механизм: ключ `:332`
    `` key: `${r}:${sha16(x.text)}` `` и проверка множеством `:353` `const fresh = findings.filter((f) => !known.has(f.key));`.
- **Класс:** храповик "только убывает" (в коде: «ONLY SHRINKS») проверяется по множеству ключей и по тому, что ВИДЕЛ этот прогон, а не по тому, что лежит
  в скоупе базлайна. TWINS: searched `--write-baseline` по `framework/tools/*.mjs` — found 2 модуля: attribution (этот) и
  experience-lint (`:364` `const kept = prev ? ids.filter((id) => prev.has(id)) : ids;` — по всему журналу, скоупа путей нет — не близнец).
- **Кто платит сейчас:** полевые проекты на закрытии (навык сам называет суженную форму: `end-chat-soft/SKILL.md:66`
  `` that directory — `node .kaif/tools/kaif-attribution-lint.mjs check <dir>` ``); агент под красным гейтом в одном флаге от стирания
  долга. **S2** (честный зелёный).
- **Форма починки:** с явными путями `--write-baseline` сливает (удаляет только ключи файлов внутри скоупа) или отказывает; «rewrite it»
  — только по ключам скоупа; ключ = (файл, текст) + счётчик вхождений, рост счётчика = NEW. Фикстуры `s24` на обе дыры + мутант.
  Цена — в паре с #111 (≈ 0,5 чата на двоих).
- **Пересечения:** #111; `ideas/31` п. 22 и п. 30 (#83 R1(а)); `/end-chat-soft` (строки 62-71).
- **Слова владельца:** нет.

### #116 — после замены `owner-voice-core` линтер голоса читает §8 локальной жанровой оболочки, а не слепка (SKIPPED, exit 3)

- **Суть:** пункт обновления велит держать локальную часть (жанровую оболочку) НАД слепком; у оболочки свой §8; линтер берёт
  ПЕРВЫЙ §8, и если его таблица старой формы — SKIPPED, а 21 стоп-правило слепка не читается.
- **Сверка с HEAD:**
  - Первый §8 — **CONFIRMED**: `framework/tools/kaif-voice-lint.mjs:242` `    if (Object.values(KEYWORDS).some((k) => k.section.test(m[1])) || SECTION_NUMBER.test(m[1])) { start = i; break; }`.
  - Текст пункта обновления — **CONFIRMED**: `framework/installer/KAIF-CORE.mjs:1477` «(2) Keep ONLY your local part — the lines ABOVE the snapshot
    (a project preamble; a genre shell, re-derived over the new snapshot by /owner-voice)».
  - Репро — **CONFIRMED** на копии: оболочка со старой таблицей §8 + слепок истока (`AUTHOR_STYLOMETRY.md` целиком) → `⚠ … a table in §8
    (line 9) lacks the pattern/hint columns — its header: Правило линтера · Паттерн (ripgrep) · Комментарий` и `⚠ voice-lint SKIPPED — …`,
    `exit=3`; тот же текст против одного слепка → `✖ voice-lint: 4 finding(s) … (21 stop rule(s) · 0 positive(s))`, `exit=1`.
  - **Сверх тикета — ложный ЗЕЛЁНЫЙ:** оболочка с ПРАВИЛЬНОЙ таблицей §8 (одно правило, текст не задевает) над тем же слепком →
    `✅ voice-lint OK — 0 findings in 1 file(s), 3 line(s) against AUTHOR_STYLOMETRY.md §8 (1 stop rule(s) · 0 positive(s))`, `exit=0`
    — 21 правило слепка молча не применено, ни одного предупреждения. Хуже SKIPPED из тикета.
  - «The release already pins the snapshot's first line and sha in the bundle meta» — **CONFIRMED**: `KAIF-CORE.mjs:1462` (`pin.sha256`, `pin.head`); на развёртывании мета лежит в
    `.kaif/install/KAIF-CORE-BUNDLE.md` (`:4192` `parseBundle('.kaif/install/KAIF-CORE-BUNDLE.md', true)`) — линтеру есть откуда взять
    первую строку слепка. Линтер про слепок не знает (`grep -n -i "snapshot" framework/tools/kaif-voice-lint.mjs` — только комментарии, не код разбора).
  - `/owner-voice`, на который ссылается пункт («a genre shell, re-derived over the new snapshot by /owner-voice»), о жанровой оболочке и её §8 молчит:
    `grep -n -i "shell\|оболочк" framework/skills/owner-voice/SKILL.md framework/templates/_owner-voice-template.md` → 0 — **PARTIAL** к «Say it in the task item».
  - Полевой локальный патч (комментарий: все §8 сливаются, `64 cases`, до/после) — **NOT-VERIFIABLE-HERE** (файл поля).
- **Класс:** "первое совпадение побеждает" у раздела, который по новой форме файла встречается дважды (оболочка + слепок);
  форма файла сменилась в 2.8 (#103), читатель — нет. TWINS: searched `break; }` у поиска заголовка в `kaif-voice-lint.mjs` — found 1
  (`:242`); `load` читает разделы по списку и оба слоя (тикет: «a bare `load` printed both writing parts») — не близнец;
  `KAIF-CORE.mjs:1455` `lines.indexOf(pin.head)` — первое вхождение первой строки слепка (близнец в потенции, если оболочка повторит
  ту же строку-голову; не проверял).
- **Кто платит сейчас:** полевые проекты с жанровой оболочкой после обновления до 2.8 (машинная половина проверки голоса выключена
  или, в грани "годный §8 оболочки", молча урезана); владелец читает текст, прошедший "зелёную" проверку не по его портрету.
  **S2**.
- **Форма починки:** линтер читает §8 слепка всегда (голова из меты бандла, иначе — все §8 файла), §8 оболочки — в добавку, если таблица
  годна, иначе называет и пропускает; в сводке — сколько правил из какого слоя. Фикстуры селфтеста: "старая оболочка + слепок" →
  21 правило, "годная оболочка + слепок" → 1 + 21. Строка в `ownerVoiceInstruction` и в `/owner-voice` о номерах разделов оболочки.
  Цена ≈ 0,25–0,5 чата.
- **Пересечения:** `ideas/31` п. 3 (Q-R5 — `kaif-voice-lint`, путь портрета в строке OK); `bugs/91` (открыт — генератор публичного слепка);
  #103 CLOSED (сама замена).
- **Слова владельца:** нет.

### #117 — `stale-claims` молчит над «**KAIF** (версия 2.7)»: скобка после имени срезается как атрибуция

- **Суть:** скан срезает все скобки прозы до суждения о паре "имя — версия"; скобка с СЛОВОМ версии сразу после имени — это
  заявление о текущей версии, а не история.
- **Сверка с HEAD:**
  - Срез — **CONFIRMED**: `framework/installer/KAIF-CORE.mjs:1327` `      let judged = isProse ? scan.replace(/(?<!\])\([^)]*\)/g, '') : scan;`
    (с обоснованием в `:1320-1322` — «(KAIF 1.6)» как история).
  - Репро — **CONFIRMED** на копии ядра, `stale-claims --from 2.7 --to 2.8` над файлом с семью формами: названы только
    `AGENTS.md:9 — Этот проект обёрнут фреймворком KAIF версии 2.7.` и `AGENTS.md:11 — This project runs KAIF 2.7.`; молчат
    «**KAIF** (версия 2.7)», «KAIF (version 2.7)», «KAIF (v2.7)»; `Правило X (KAIF 2.6) пришло давно.` молчит верно.
  - Слово версии между именем и числом без скобок ловится — **CONFIRMED**: `:1225` `PAIR_VERSION_WORDS` содержит `'версия', 'версии'`,
    и строка 9 пробы названа.
  - «The core's own `AGENTS.md` template (`CONTEXT_POINTER`) carries no version» — **CONFIRMED** косвенно: `grep -rn -E "KAIF[*_\`]*\s*\((version|версия|v)\s*[0-9<{]" framework/` → 0.
  - Комментарий (13 строк на экспорте `395e80f`, а не 6) — счёт поля, **NOT-VERIFIABLE-HERE**; суть тикета не меняет.
- **Класс:** правило-исключение "скобка = атрибуция" шире своего основания (атрибуция всегда вида "(KAIF x.y)" без слова версии).
  TWINS: searched `\(\[^)\]\*\)/g` по `framework/` — found 2, оба в том же скане: `:1327` (этот) и `:1318` (дата внутри скобок — по
  #75 намеренно). В обвязке истока — 1 строка той же формы: `ideas/05_DONE_structured_KAIF.md:1` «# Идея 05 — Структурированный KAIF (версия 1.1)»
  — история; фикс обязан оставить маркер `KAIF-VERSION-OK` рабочим для таких заголовков.
- **Кто платит сейчас:** полевые проекты на каждом обновлении («the gap bites a line a project or an agent writes in the most natural form» — строка переживает
  версии); **S3**.
- **Форма починки:** до среза сохранить скобку, открывающуюся словом версии сразу после имени (`\bKAIF\b[*_\`]*\s*\((?:version|версия|вер\.|v)\s*\d+\.\d+`
  + слова версии десяти языков поставки — из `PAIR_VERSION_WORDS`), и судить её как пару. Фикстуры в `s29`/`s10`: три формы названы на
  2.7 → 2.8, «(KAIF 2.6)» молчит; мутант. Цена ≈ 0,25 чата.
- **Пересечения:** `ideas/31` п. 30 (#76 R9 — сверка строки версии записи с `kaif.json`); #75 CLOSED (дата в строке — соседний механизм).
- **Слова владельца:** нет.

### #119 — `/experience` шлёт урок об опасном действии в «`AGENT_GUIDE.md` → Tools», а таблица в 2.8 переехала в `HOUSE_RULES.md`

- **Суть:** эпик CK перенёс таблицу инструментов в домашние правила, а указатель навыка опыта остался; комментарий добавил второй
  случай в `BUG_FIXING_FRAMEWORK.md`.
- **Сверка с HEAD:**
  - Навык — **CONFIRMED**: `framework/skills/experience/SKILL.md:31-32` «directory, a reset, a force-push) also lives IN THE ROW OF THAT ACTION in the project's tool /
    registry (`AGENT_GUIDE.md` → Tools) — where sessions look when they RUN it»; руководство — `framework/AGENT_GUIDE.md:770-771`
    «The project's automation tools (build, commit, release, codegen, graphics…) are one table in the / house-rules file — `HOUSE_RULES.md` → "Tools of this project"»; в шаблоне
    домашних правил — `framework/templates/_house-rules-template.md:98` `## 6. Tools of this project`.
  - Второй случай (комментарий 1) — **CONFIRMED**: `framework/BUG_FIXING_FRAMEWORK.md:130-131` «Then add it, and document it in /
    `AGENT_GUIDE.md`. The harness is a living tool — extend and document it.», а `AGENT_GUIDE.md:530-531` шлёт строку стенда в
    `HOUSE_RULES.md` → "Stands, environments and devices".
  - Комментарий 2 (атрибуция находки) — поправка авторства, к коду отношения нет.
- **Класс:** перенос модуля без переноса указателей в него («pointer-into-a-moved-module»); гард сборки проверяет существование
  заголовка, а заголовок «Tools» ОСТАЛСЯ — пустым указателем, поэтому существованием его не поймать. TWINS: searched
  `AGENT_GUIDE.*(Tools|Test harness|Environment dossier|Push|Stands|Routes)` и `tools table|tool registry` по `framework/` — found 3
  живых: `experience/SKILL.md:32`, `BUG_FIXING_FRAMEWORK.md:130-131` и **новый** `framework/skills/code-revision/SKILL.md:53-54` «the project's
  own guards (the / tools table of `AGENT_GUIDE.md`)». Остальные попадания верны (правило живёт в руководстве, строки — в домашних
  правилах: `refresh-context/SKILL.md:35`, `TESTING_FRAMEWORK.md:264`, шаблон домашних правил `:45`/`:53`/`:101`). Обвязка истока —
  тот же близнец: `.claude/skills/experience/SKILL.md:32` «(`AGENT_GUIDE.md` → Инструменты)», а `AGENT_GUIDE.md:847-849` истока шлёт
  таблицу в `HOUSE_RULES.md` → §1.
- **Кто платит сейчас:** полевые проекты молча (урок об опасной команде ложится туда, где его не читают при запуске); **S3**.
- **Форма починки:** три указателя поставки + один обвязки → `HOUSE_RULES.md` → "Tools of this project" / "Stands, environments and devices";
  гард сборки: реестр "вынесенный раздел → фразы-указатели" (данными), греп по текстам поставки и обвязки, красный на совпадение.
  Цена ≈ 0,25 чата.
- **Пересечения:** `ideas/31` п. 26 (справочник знает строки `check` — тот же класс "указатель отстал от переезда"), п. 30 (#85 —
  печать текста вокруг указателя на вынесенный раздел), п. 17 (навыки поставки — прочитать исполнителем).
- **Слова владельца:** нет.

### #87 — красный от аппарата, а не от субъекта, в каноне тестирования классом не назван (что нового после 2026-09-24)

- **Суть (разбор уже был):** `researches/32` §2в — CONFIRMED; `ideas/31` п. 2 «Красный от аппарата», ≈ 0,25 чата.
- **Что нового в комментариях после 2026-09-24:** один комментарий, 2026-09-26 08:58 — это ОТВЕТ ИСТОКА («Not in KAIF 2.8 — Noble KAIF; in the list of the next version»), нового от поля нет; тело тикета не менялось.
- **Изменил ли 2.8 заявления:** нет. `grep -ci 'false red\|apparatus\|ложн.* красн'` → 0 в `TESTING_FRAMEWORK.md`, `AGENT_GUIDE.md`,
  `BUG_FIXING_FRAMEWORK.md`, `skills/fable-judge/SKILL.md`; принцип 4 на месте: `framework/TESTING_FRAMEWORK.md:17` `4. **Defects cluster.** Most bugs live in a few narrow modules — where one was found, hunt for more`.
  **Новое для цены — место в каноне снова ноль:** посылка `ideas/31` п. 2 «после лёгкого канона 2.8 (в `TESTING_FRAMEWORK` появится
  место)» не сбылась в числах. Канон похудел (300 → 270 строк), но 2.8 ввёл потолок шаблона `tools/check-framework.mjs:218`
  `const TEMPLATE_RESERVE_PCT = 10;` и `:230` (текст отказа `above its ceiling ${ceiling} (budget ${budget} less the ${TEMPLATE_RESERVE_PCT} % reserve)`): потолок `TESTING_FRAMEWORK.md` = 270,
  файл — 270 строк; `AGENT_GUIDE.md` 1080/1080. Свободно только `BUG_FIXING_FRAMEWORK.md` 225/270 (45 строк) и навык судьи (бюджета
  строк у навыков нет). Каждая строка класса в `TESTING_FRAMEWORK` снова требует выноса тем же ходом (+ ≈ 0,1 чата) — либо шаг
  «закрепи контекст прогона до вердикта» живёт в `BUG_FIXING_FRAMEWORK` (баг рождается из красного), а в тестовом каноне
  — одна строка-указатель вместо принципа 4.
  Обвязка истока: по моему грепу `ложн\S* красн|false red` вне `framework/` — 47 строк в 30 файлах (разведка 32: `28 строк «ложный красный» в 9 файлах`;
  её паттерн не записан — рост побайтно не сравним). Близнец в этой же группе: #110 — "красный по замыслу" мутантов, прочитанный
  механикой как улика.
- **Кто платит / тяжесть / пересечения:** без изменений против разведки 32 — поле (часы, потраченные на ремонт целого субъекта), **S2**;
  `ideas/31` п. 2.
- **Слова владельца:** «ты по всем пунктам уверен, что именно харнес KAIF это обязан?» · «чтобы мы понимали, что не баги в наших тулзах
  автоматизации находим, а баги в приложении».

### #94 — хук-таймер ищет свидетеля освежения по `cwd` события, а не по корню (что нового после 2026-09-24)

- **Суть (разбор уже был):** `researches/32` §2г — CONFIRMED; `ideas/31` п. 1 «Хуки знают корень проекта», ≈ 0,5 чата (вместе с остатками
  ревизии хуков).
- **Что нового в комментариях после 2026-09-24:** (1) 2026-09-26 08:58 — ответ истока, нового нет. (2) **2026-09-26 13:58 — второе
  развёртывание, KAST на KAIF 2.8, Windows 11 + Claude Code:** воспроизвёл («After one `cd` into `assets/logo` the timer answered the owner's
  next prompt with "no refresh witness found this session" while `.kaif/refresh-marker.json` in the root was 12 min old») и **починил
  локально** другой формой, чем выбрала разведка: «`projectRoot(cwd)` = `$CLAUDE_PROJECT_DIR` when it holds `.kaif/`, else the nearest
  ancestor of `cwd` with `.kaif/kaif.json`, else `cwd`» — в обоих хуках, с пометкой «`LOCAL FIX (KAST bugs/KAIF/02)`». Что это меняет:
  класс подтверждён на второй ОС и второй версии (2.7 macOS → 2.8 Windows); у поля теперь локальное расхождение в двух поставочных
  файлах — следующий `/kaif-update` покажет их как изменённые модули, и починка 2.9 обязана назвать в новостях "ваш LOCAL FIX заменяется"
  (иначе ручной мердж двух форм корня). Разведочная форма `new URL('../..', import.meta.url)` верна в обоих слоях: исток зовёт хуки из
  `framework/hooks/` (`.claude/settings.json:22` `"args": ["${CLAUDE_PROJECT_DIR}/framework/hooks/prompt-refresh-timer.mjs"],`), поле — из
  `.kaif/hooks/`; `../..` = корень в обоих.
- **Изменил ли 2.8 заявления:** нет. `prompt-refresh-timer.mjs:60` `let cwd = process.cwd();`, `:65` `if (input.cwd) cwd = String(input.cwd);`,
  `:68` `const markerPath = join(cwd, MARKER);`; `stop-status-guard.mjs:37` `if (input.cwd) cwd = String(input.cwd);`, `:47`
  `const statusPath = join(cwd, STATUS_FILE);`. Проба на копиях HEAD: маркер 23 мин, `cwd` = подкаталог → приказ со словами «no refresh witness found this session»; `cwd` = корень → пусто; страж STATUS: корень → `{"decision":"block",…}`, подкаталог → пусто. Относительный путь в тексте трёх
  приказов на месте (`prompt-refresh-timer.mjs:85`, `prompt-resume-word.mjs:116`, `session-start-refresh.mjs:67`); `s14` по-прежнему кормит
  только корень (`tools/sandbox/s14-refresh-hooks.mjs:105` `cwd: S`). Новое в 2.8: пятый хук `pretool-owner-word.mjs` берёт абсолютный
  `transcript_path`, `cwd` не читает — не задет; все пять хуков теперь снимают BOM со stdin (`stop-status-guard.mjs:36` и др.).
- **Кто платит / тяжесть:** поле на каждом промпте после `cd` (два проекта, две ОС), страж STATUS молчит — **S2**, без изменений.
- **Пересечения:** `ideas/31` п. 1; `bugs/119` №1/№2, `bugs/118`, `bugs/120` (открыты); #110 — у `stop-status-guard.mjs:44` ещё и файл кулдауна
  на каждую сессию в OS-temp (не убирается).
- **Слова владельца:** нет.

---

## Итог

| тикет | вердикт сверки | тяжесть | цена | кандидат-эпик (рабочее имя) |
|---|---|---|---|---|
| #110 | CONFIRMED (+ механизм: мутант-пробы глотают "корень оставлен"; зелёный `s17` льёт `kaif-report-*` в настоящий temp); ≈ 61 из 62 ГБ — инструменты истока | S1 | 0,5 | Чистый temp (исток `tempRoot` + мутанты + `TMPDIR` детей + dry-run ядра + страж) |
| #109 | CONFIRMED (+ грань: снятый вопрос с пустым ответом уходит владельцу на страницу) | S2 | 0,25 | Статус читается честно (контур) |
| #111 | CONFIRMED | S2 (near-miss S1) | 0,5 вместе с #112 | Базлайн атрибуции |
| #112 | CONFIRMED (обе дыры; снятая автором фраза снята верно) | S2 | в паре с #111 | Базлайн атрибуции |
| #116 | CONFIRMED (+ ложный ЗЕЛЁНЫЙ при годном §8 оболочки) | S2 | 0,25–0,5 | Портрет: оболочка + слепок |
| #117 | CONFIRMED | S3 | 0,25 | Сканеры поставки: форма языка (вместе с `ideas/31` п. 3) |
| #119 | CONFIRMED (+ третий близнец `code-revision/SKILL.md:54` и близнец обвязки) | S3 | 0,25 | Указатели в вынесенное (вместе с `ideas/31` п. 26) |
| #87 | без изменений; нового от поля нет; место в `TESTING_FRAMEWORK` снова 0 (потолок 270/270) | S2 | 0,25 (+0,1 на вынос) | Красный от аппарата (`ideas/31` п. 2) |
| #94 | без изменений; новое — второе поле (KAST, 2.8, Windows) с LOCAL FIX другой формы | S2 | 0,5 (п. 1 целиком) | Хуки знают корень (`ideas/31` п. 1) |

Сумма группы ≈ 3 чата (без двойного счёта #111/#112).
