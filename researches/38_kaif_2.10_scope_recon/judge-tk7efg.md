# Лёгкий судья шагов TK7е · PT1 · TK7ж версии KAIF 2.10 — дайджест

> **Создан:** 2026-10-23 16:50 +03:00 · **Судья:** Claude Opus 5.5 (субагент сессии 94, `/fable-judge`, KAIF-блок) ·
> **Бриф:** `researches/38_kaif_2.10_scope_recon/JUDGE_TK7EFG_BRIEF.md` · **Коммиты:** `52d6d58` (TK7е + PT1), `f9125e5` (TK7ж) ·
> **Тишина:** только чтение в истоке (кроме этого файла); самопроверка контура и мутанты — через `quietEnv()` и строго по очереди;
> `npm run test:core`, `tools/verify-contour.mjs`, `--call` без `--dry-run`, `KAIF_DIST` — не запускались; субагентов нет; хук часов в
> `.claude/settings.json` не подключался. Записи сессий — только счётчики, метки времени и id задач, без текста.

## Вердикт: **REFUTED** (по трём пунктам; остальное VERIFIED или с оговорками)

| # | Охота | Вердикт | Коротко |
|---|---|---|---|
| 1 | Переисполнение | **CAVEAT** | самопроверка 168/168; дверь 7/7, а на `52d6d58~1` красный ровно случай (7); PT1 7/7; проба 14/14, её мутанты 8/8; мутанты контура в полном прогоне — 32 OK из 34, M11 и M33 — DIED (нативный крах `3221226505`, `bugs/109`), каждый при одном повторе краснеет ровно на своих случаях |
| 2 | Личность страницы (TK7е) | **REFUTED** (доказательство) | код верен: настоящую страницу видно живой, `/whoami` отдаёт только хеш. Но мутант J1 «настоящая страница отвечает на `/whoami` чужим id» поднимает ВТОРУЮ страницу поверх живой — а самопроверка (168/168) и дверь (7/7) остаются зелёными. `--close` отдаёт сырой `closeToken` постороннему и пишет «its own server ended it» |
| 3 | Замок голоса и речь (TK7е) | **VERIFIED WITH CAVEATS** | случай судит угрозу (замок на сутки вперёд) и допуск (M31 красный); весь список брифа — без цифр, латиницы, `undefined` и пустых фраз; оговорки: «½» → «один два», «Ⅻ» читается по буквам, «〇» и «𐄇» дают пустую фразу |
| 4 | Хук часов (PT1) | **CAVEAT** | контракт соблюдён (без `"allow"`, тишина без заполнителя, `old_string` не трогается); ось `s14` не ослаблена; правка, которая переносит в новый текст заполнитель, уже стоящий в файле, ставит туда время часов (`plans/142` целиком: 6 из 7 заменены, у седьмого пропала обратная косая); «слово владельца» в `plans/142` записано без цитаты |
| 5 | Проба замера (TK7ж) | **REFUTED** (класс не закрыт) | цифры воспроизведены (92; 5 · 5 · 0 · 0 · 6 · 1), независимый подсчёт по времени тоже даёт 92 и ни разу не расходится с пробой, ложного красного указанной формы нет. Но признак зова не учитывает кавычки: в живой записи сессии 90 прогон `--dry-run` по-прежнему засчитан зовом (`;` внутри текста зова); 6 из 22 синтетических форм классифицированы неверно |
| 6 | Ранний конец до срока | **REFUTED** (сессия 93) | метки 14:53:57 и 15:28:39 подтверждены; но в 15:54:45 ход НЕ кончился — это запись вызова инструмента, его результат (15:56:19) — отклонение и прерывание при вмешательстве владельца, записи `stop_hook_summary` между ними нет; закрытие — после «закрывай» в 16:07:17, позже продлённого срока. «Во всех трёх сессиях» ложно: верно для двух (90 · 91) |
| 7 | Шире наблюдения и стоячая ложь | **CAVEAT** | «21 → 46» исправлено на месте всюду; «слышен» — только со словом 14:51; хук у истока не подключён — правда; новые строки поставки — английские, без невидимых символов; маркеры называют отчёт. НОВАЯ стоячая ложь шага TK7ж — «ранний конец во всех трёх сессиях» (охота 6) — стоит в STATUS п. 0, `plans/137` TK7ж, отчёте TK7ж §5 п. 4 и сообщении `f9125e5` |

---

## Охота 1 — переисполнение: CAVEAT

**Самопроверка контура** (скретчпад `selftest-run.mjs`: `review.mjs --selftest` в `quietEnv({ KAIF_VOICE_TOOL: '' })`, в одиночку):

```
green lines: 168
start 2026-10-23T13:46:49.989Z · end 2026-10-23T13:47:14.402Z · exit 0
tail: ... | contour selftest green: 168 checks (pre-flight red on the "options as paragraphs" fixture, three faces, records, showing)
red lines: 0
node warnings: 0
```
Заявлено 168/168 — совпало; предупреждения Node о подписках SIGINT нет (мелочь TK7е подтверждена).

**Мутанты контура** — ОДИН полный прогон `node tools/sandbox/probes/tk7-contour-mutants.mjs`, 16:32:13 → 16:46:36 +03:00, `exit=1`,
в одиночку:
```
OK  control copy: 0 red line(s)
... (все прочие 31 мутант — OK, каждый ровно на своих адресатах)
BAD M11 the last answer ignores an unread notice: DIED (expected exactly «TK7b #163, mirror»)
    | status 3221226505 signal null
BAD M33 the capital sharp s not folded to SS: DIED (expected exactly «TK7e #165»)
    | status 3221226505 signal null
✖ 2 BAD
```
Новые M29–M33 и M25 с новой строкой поиска: M29 → ровно «TK7e #169»; M30 и M31 → ровно «TK7e: a fresh voice lock»; M32 → ровно «TK7e #165»;
M6 · M20 → свои прежние случаи + «TK7e #169»; M4 · M14 · M23 → + «TK7e #165»; M17 · M22 → + «TK7e: a fresh voice lock»; «не применилась» — ни одного.
Повтор DIED по правилу `bugs/109` — ОДИН раз каждый (скретчпад `one-mutant.mjs`: правка find/to дословно из пробы, копия, самопроверка в `quietEnv()`):
```
M11 · 2026-10-23T13:47:25.184Z → 2026-10-23T13:47:49.427Z · status 1 · finished true · red 1 (expected exactly ["TK7b #163, mirror"])
    x x TK7b #163, mirror: the last answer on the queue page does not end it while a notice on it is unread
M33 · 2026-10-23T13:47:49.497Z → 2026-10-23T13:48:13.868Z · status 1 · finished true · red 1 (expected exactly ["TK7e #165"])
    x x TK7e #165: «² ₂ ½ １２３ ① ٣ १२ 𝟓 Ⅻ» reach the Russian engine as number words, no digit of any script left; «ẞ» folds to
```
Оговорка: бриф требовал «ни одного DIED» — в полном прогоне их два (тот же нативный крах, что у главной сессии: M9 · M11 · M30). Адресация
доказана повторами, но полный прогон без DIED не наблюдался ни главной сессией, ни судьёй.

**Дверь** `tk7-one-page-door.mjs`, 16:48:23 → 16:48:34 +03:00:
```
(эта сборка)   OK (1) … OK (7) the own lock whose pid and port both went to strangers (an HTTP 404 server on the port) → the page rises (exit 2), no «Already open»
               ✅ the real door: …   exit=0
(52d6d58~1, git archive 52d6d58~1 framework/tools/contour | tar -x)
               OK (1)–(6) · BAD (7) the own lock whose pid and port both went to strangers (an HTTP 404 server on the port) → the page rises (exit 0), no «Already open»
               ✖ 1 BAD   exit=1
```
На прошлой сборке красным стал ровно случай (7) — то, что чинил TK7е. Заметка: на `52d6d58~1` в выводе «the page rises (exit 0)» — страница
судя по коду выхода, не поднялась (exit 0 — код «Already open», `EXIT_DECIDED`; вывод судьи, не наблюдение), формулировка строки BAD
собрана из шаблона; на итог не влияет.

**PT1:** `node tools/sandbox/probes/pt1-clock-now.mjs` → `OK (1)…(7)`, `✅ the clock hook answers by the PT1 contract…`, `exit=0`;
`node framework/hooks/clock-now.mjs --selftest` → `selftest: all ok`, `exit=0`.
**TK7ж:** `node tools/sandbox/probes/tk1-wait-call-scan.mjs --selftest` → 14 строк `ok`, `selftest: all ok`, `exit=0`;
`node tools/sandbox/probes/tk1-scan-mutants.mjs` → `OK control: 0 red` … `OK M7 queued_command prompt unread: 1 red — lacks «T4m»`,
`tk1 scan mutants: all 8 OK`, `exit=0`.

## Охота 2 — личность страницы (TK7е): REFUTED (доказательство не стережёт настоящий маршрут)

**Код — верен.** Настоящая страница (`serveContour`, `open:false, signal:false`, `quietEnv()`; скретчпад `realpage.mjs`):
```
real page A up: true
door for B sees A live (otherLivePage): true
/whoami body carries the raw token: false · carries pageIdOf(token): true
second door on A: outcome already-open · second page raised false
```
Сам `closeToken` через `/whoami` не уходит — только хеш `sha256('kaif-contour:'+token)`, первые 32 знака.

**Доказательство — нет.** Мутант судьи **J1**: в маршруте настоящей страницы `ok({ kaif: 'contour', id: pageIdOf(closeToken) })` →
`pageIdOf('not-this-page')` (правка применилась ровно один раз). Последствия наблюдены, затем то же прогнано самопроверкой и дверью:
```
== real page, J1 contour
real page A up: true
door for B sees A live (otherLivePage): false
/whoami body carries the raw token: false · carries pageIdOf(token): false
second door on A: outcome page closed without an answer · second page raised true
== selftest on J1 contour
green lines: 168 … exit 0 … red lines: 0
== door probe on J1 contour
✅ the real door: one page at a time, a live page is one that answers, …
```
Под J1 каждая живая настоящая страница выглядит посторонним портом: дверь своего документа поднимает ВТОРУЮ страницу поверх живой (ровно ту
беду, ради которой TK7г перешёл на порт), а дверь чужого документа не отказывает. Ни один случай этого не видит: фикстуры «живой страницы»
(`otherPage`, медленная страница) сами отвечают на `/whoami` правильным хешем, а случай (1) двери пишет замок без токена — тогда судит один
порт. Это охота «старые тесты зелены по неверной причине»: правка фикстур в `52d6d58` (сообщение коммита: «Фикстуры живой страницы получили
токен замка и ответ `/whoami`») увела все случаи живой страницы с настоящего маршрута. Маркер `[TESTED: … selftest «TK7e #169» + mutants M29 ·
M6 · M20]` у `pageListens` ничего не говорит о маршруте страницы.
**Самая малая починка:** случай самопроверки, который поднимает НАСТОЯЩУЮ страницу (`serveContour`) и проверяет, что вторая дверь своего документа
отвечает «Already open», а дверь чужого — отказом; адресат — мутант J1 (`pageIdOf(closeToken)` → чужой id).

**Посторонний на порту** (скретчпад `stranger-close.mjs` под `quietEnv()`; замок — живой pid постороннего процесса, токен `SECRET-TOKEN-123`):
```
(1) --close vs a 200-stranger: exit 0 · lock left false · stranger saw: ["POST /close?t=SECRET-TOKEN-123"]
    close log: live page: http://127.0.0.1:60934/ · … | closed interviews/x.md (port 60934, pid 37184) — its own server ended it (exit 2 for the waiting agent); …
(2) door vs a silent stranger on another document's lock: blocks true after 1513 ms
(3) door vs a 200-stranger: blocks false after 3 ms · stranger saw: ["GET /whoami"]
(4) --wait with a stranger's live pid in the lock, no page: ended within 3 s false (still waiting)
```
- (2) молчащий посторонний держит дверь — зазор назван в I48 обоих слоёв, контракте и ноте 2.10 (`a stranger that accepts the connection and
  never answers — a known gap`) — VERIFIED.
- (4) сторож ждёт вечно — назван («the waiter, `--close` and the window recovery still judge a lock by its pid (a known gap)») — VERIFIED.
- (1) **CAVEAT:** `--close` при постороннем отправляет СЫРОЙ `closeToken` в URL постороннему, получив 200, говорит «its own server ended it» и удаляет
  замок (память о порте черновика, I29, пропадает). Зазор «`--close` судит по pid» назван, но комментарий TK7е у `pageListens` говорит «the token
  itself never leaves the lock» — это верно только для `/whoami`. Средство уже есть: `pageListens(lock)` до `postLocal(…close?t=…)`.
- Ещё мелочь: посторонний, который ответил НЕ-HTTP баннером и держит соединение, по таймауту тоже станет «живой страницей» — тот же класс
  «принял и молчит», назван не дословно.

## Охота 3 — замок голоса и речь (TK7е): VERIFIED WITH CAVEATS

Замок: случай «TK7e: a fresh voice lock…» детерминирован (время передаётся аргументом `now`) и судит УГРОЗУ — читаемый замок на сутки вперёд
`dayAheadFree`, а не константу; допуск стерегут и «30 мс позже часов держит», и «1 с вперёд держит». Мутанты: M30 (снят предел будущего) и
M31 (допуск 0, баг EXP-0193) — оба краснеют ровно на этом случае (охота 1). `VOICE_LOCK_FUTURE_SLACK_MS = 5000` (`review.mjs:342`).

Речь (скретчпад `speech.mjs`, `speakable(…, { language: 'ru' })` в `quietEnv()`):
```
ok  · "²" → "два"                ok  · "½" → "один два"            ok  · "１２３" → "сто двадцать три"
ok  · "①" → "один"               ok  · "Ⅻ" → "Экс-ай-ай"            ok  · "٣" → "три"
ok  · "३" → "три"                ok  · "¾ часа" → "три четыре часа"  ok  · "٣٤٥" → "триста сорок пять"
ok  · "₀₁₂" → "двенадцать"       ok  · "1⁄2" → "один ⁄ два"
BAD EMPTY · "〇" → ""            BAD EMPTY · "𐄇" → ""
bad: 2 of 23
en pack (no spoken.number): "x² ½ ①"
```
Список брифа («²», «½», «１２３», «①», «Ⅻ», «٣», «३») — без сырых цифр, латиницы, `undefined` и пустой фразы: VERIFIED. Оговорки
(заявление «цифры любой письменности словами» шире): дроби читаются двумя числами («½» → «один два», «¾ часа» → «три четыре часа»); римские
— по буквам («Ⅻ» → «Экс-ай-ай»; в коде это названо, в плане/отчёте — нет); `〇` (U+3007) и эгейские числа сворачиваются в ПУСТУЮ фразу;
одиночная дробная черта `⁄` уходит в движок как есть; «₀₁₂» → «двенадцать» (нули слиплись). Английский пакет не трогает ничего — так и задумано.
Маркер `[TESTED]` речи TK7е — гигиена (самопроверка + мутанты): функциональный звонок 14:51 произносил фразу только с ASCII-цифрами, нелатинские
цифры живым голосом не проверялись — маркер этого и не заявляет.

## Охота 4 — хук часов (PT1): CAVEAT

Контракт (скретчпад `clock-fixtures.mjs`, хук запущен так, как его запускает Claude Code — JSON в stdin):
```
(a) Edit copy-through of literal placeholders → exit 0 · {"hookSpecificOutput":{"hookEventName":"PreToolUse","updatedInput":{"file_path":"plans/142.md","old_string":"`⟦NOW⟧` · `⟦NOW-ISO⟧` · `⟦DATE⟧` · `⟦TIME⟧` в `content`","new_string":"`2026-10-23 16:33 +03:00` · `2026-10-23T16:33:03+03:00` · `2026-10-23` · `16:33`
(b) Edit with escaped placeholders → exit 0 · {…"new_string":"`⟦NOW⟧` · `⟦NOW-ISO⟧` · `⟦DATE⟧` · `⟦TIME⟧` in `content`"}}}
(c) Write of plans/142 as is → exit 0 · placeholders in doc 7 · replaced by the clock 6
(d) double backslash → exit 0 · {…"content":"escape form: \\⟦NOW⟧"}}}
(e) Edit deleting a placeholder → exit 0 · (no output)
(f) MultiEdit, new_string not a string → exit 0 · {…"edits":[{"old_string":"x","new_string":null},null,{"old_string":"y","new_string":"2026-10-23"}]}}}
(g) NotebookEdit → exit 0 · (no output)
(h) UserPromptSubmit → exit 0 · {"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"clock-now · 2026-10-23 16:33 +03:00 (ISO …) — …
(i) BOM stdin → exit 0 · {…"content":"16:33"}}}
```
- На `UserPromptSubmit` — строка часов; на Write/Edit/MultiEdit заполнитель в `content`/`new_string`/`edits[].new_string` заменяется; ни в одном
  ответе нет `permissionDecision` (разрешение не обходится); запись без заполнителя — тишина; `old_string` не трогается — VERIFIED.
- **Не ломает ли хук правку с заполнителем в `old_string`:** сама правка проходит (`old_string` нетронут), но **(a)**: если агент правит строку,
  которая УЖЕ несёт заполнитель как текст (документ О заполнителях), и переносит его в `new_string` без изменений, хук молча ставит туда время
  часов. **(c)**: `Write` файла `plans/142` в том виде, как он лежит, — из 7 заполнителей 6 стали временем, а у седьмого (`\⟦NOW⟧`, строка 48)
  пропала обратная косая. Правило «обратная косая — буквально» в README модуля названо, но перенос уже стоящего заполнителя (правка рядом с ним)
  как опасность нигде не назван. У истока хук не подключён, а поставочные тексты (руководство, README модуля, сам хук) заполнителя буквально не
  содержат (`git grep -n "⟦"` → только `ideas/34`, `plans/136`, `plans/142`, `researches/40–41` и пробы) — поэтому это CAVEAT, а не REFUTED: в поле
  ударит по любому проекту, чей текст про хук содержит заполнитель буквально.
- Ось `s14` «снятие стерегут имена»: снятое утверждение `!frag.hooks?.PreToolUse` заменено именами снятых скриптов (во фрагменте и на диске)
  ПЛЮС новым утверждением «`PreToolUse` фрагмента — ровно одна группа `Write|Edit|MultiEdit` с одним `clock-now`» — любой другой хук под
  `PreToolUse` красен. Не ослаблено, обоснование в коммите верно — VERIFIED (сам `s14` судьёй не перезапускался).
- `updatedInput` без решения о разрешении живой сессией не наблюдался — честно `[NOT-TESTED]` в шапке хука, PT3 впереди.
- Авторство: `plans/142:41` «У истока хук не подключён в `.claude/settings.json` — слово владельца» — без цитаты и адреса (охота «решение агента
  в одежде слова владельца»). STATUS п. 0 говорит точнее: «подключается … только словом владельца».

## Охота 5 — проба замера (TK7ж): REFUTED (класс «зов» закрыт не целиком)

**Перемер своим счётом** (скретчпад `remeasure.mjs`: проба `--include-last` по каждой из 25 закрытых записей, запись идущей сессии
`c0c10f82…` исключена):
```
1e59e180 2026-10-18T00:51 exit 0 judged 11 wait 3 leave 0 stood 5
7244d6cb 2026-10-18T07:02 exit 0 judged 8 wait 0 leave 0 stood 5
c09b8ec7 2026-10-23T06:41 exit 0 judged 3 wait 0 leave 0 stood 0
665ff8a9 2026-10-23T08:26 exit 0 judged 1 wait 0 leave 0 stood 0
d41eda95 2026-10-23T10:59 exit 0 judged 10 wait 1 leave 0 stood 6
9523b701 2026-10-23T13:17 exit 0 judged 18 wait 0 leave 0 stood 1
TOTAL files 25 · {"judged":200,"wait":5,"leave":1,"stood":92}
```
92 и «5 · 5 · 0 · 0 · 6 · 1» (сессии 88–93), ожидания «3 · 0 · 0 · 0 · 1 · 0» — VERIFIED. (`leave 1` — запись `64bf8c26` от 2026-10-14,
вне 88–93; «вопросов-разрешений 0 везде» сказано про 88–93 — верно.)

**Ложный красный «уведомление посреди хода, последняя запись ассистента раньше»** — независимый счёт ПО ВРЕМЕНИ (скретчпад `indep.mjs`: задача
жива на конце хода, если первая запись с её `<task-id>` или строкой остановки помечена позже последней записи ассистента этого хода):
```
TOTAL by time: 92
report records after the last assistant record, inside the turn, by shape: {"queue-operation/enqueue":56}
turns where the probe rule and the time rule disagree: 0
```
Все 56 «поздних» отчётов — `queue-operation/enqueue`, ни одного `attachment/queued_command` после последней записи ассистента: ложного красного
этой формы в живых записях нет — VERIFIED. (Независимость частичная: запуск читается теми же структурными полями.)

**Зов.** Признак взят дословно из текста пробы (`CALL_SEGMENT`, `isCall`; скретчпад `iscall.mjs`):
```
DISAGREE want call    got no call · powershell & "node.exe" quoted
DISAGREE want call    got no call · quoted path with spaces
DISAGREE want call    got no call · timeout prefix
DISAGREE want call    got no call · call text holds the word --dry-run
DISAGREE want no call got call    · search door quoting --call
DISAGREE want call    got no call · node -e wrapper
disagreements: 6 of 22
```
(`& node …` · `.kaif/tools/contour/review.mjs` · `cd … &&` · `;` · `node.exe` · grep · sed · echo · `--dry-run` · сообщение коммита — верно.)
**На живых записях** (скретчпад `calls-live.mjs`; 12 команд с `--call` в 25 записях):
```
tool commands naming --call in 25 closed records: 12
  1 × dry-run → probe CALL · tool Bash
  2 × dry-run → probe no call · tool Bash
  1 × node-review-call:node → probe CALL · tool Bash
  2 × node-review-call:other-prefix → probe CALL · tool Bash
  2 × other → probe no call · tool Bash
  1 × reader:echo → probe no call · tool Bash
  2 × reader:grep → probe no call · tool Bash
  1 × reader:sed → probe no call · tool Bash
```
Тот самый `1 × dry-run → probe CALL`: запись `c09b8ec7` (сессия 90), `2026-10-23T05:58:37Z` — прогон `--call "…; …" --dry-run`: точка с запятой
ВНУТРИ кавычек текста зова режет команду, и кусок до `;` (без `--dry-run`) засчитан зовом. Заявление TK7ж «зов — исполняемый `node …review.mjs …
--call` без `--dry-run`; dry runs counted as calls — починено» (шапка пробы, отчёт TK7ж §5 п. 2, `HOUSE_RULES.md`) шире кода: классу «прогон
`--dry-run` засчитан зовом» и сейчас подвержена живая запись. На счёт это не влияет — копия пробы с разбором кавычек (скретчпад
`probe-quoteaware.mjs`, `selftest: all ok`) по всем 25 записям даёт те же числа ожиданий (расхождений не напечатано) — ход 05:58 не кончался «?».
**Самая малая починка:** снимать кавычки до разрезания на сегменты (`"…"` и `'…'` → заглушка) и проверять `--dry-run` вне текста зова; случай
самопроверки — `--call "a; b" --dry-run` → ожидание без зова; мутант — разрезание без снятия кавычек.

## Охота 6 — ранний конец до срока: REFUTED (сессия 93)

Сессия 93 (`9523b701`), записи постановки в очередь (UTC; местное = +3 ч), тексты не выносятся:
```
2026-10-23T11:53:57.122Z QUEUE-OP enqueue   (слово владельца о сроке — 14:53:57 местного: ✓)
2026-10-23T12:28:39.967Z QUEUE-OP enqueue   (продление — 15:28:39 местного: ✓)
2026-10-23T12:54:45.740Z assistant tool_use:Bash                    ← «ход кончился 15:54:45»
2026-10-23T12:55:41.946Z / 12:56:11.275Z / 12:56:18.423Z queue-operation enqueue
2026-10-23T12:56:19.549Z user tool_result   toolUseResult: "User rejected tool use"
2026-10-23T12:56:19.553Z user text          (запись прерывания по вызову инструмента)
2026-10-23T12:56:19.616Z user text,text,text  (новый ход — сообщения владельца)
```
Между 12:54:45 и 12:56:19 записи `stop_hook_summary` нет (`STOP-HOOK lastAssistant 2026-10-23T12:56:32.941Z` — уже следующий ход). Запись
15:54:45 — **вызов инструмента** (повтор свода `s22`), а не конец хода: агент работал, его вызов отклонён/прерван при вмешательстве владельца
в 15:56:19 — за ≈ 2 мин 20 с до продлённого срока (≈ 15:58:39). Закрытие сессии началось после слова владельца в 13:07:17Z = 16:07:17 местного,
ПОЗЖЕ срока. Строк `BOUNDARY:` в записи — 2 (12:35:26Z, 12:35:49Z). Итог: «ход кончился за ≈ 4 мин до продлённого срока» и «ранний конец во всех
трёх сессиях со сроком» — шире наблюдения: последняя запись ассистента принята за конец хода (та же подмена, что и в пробе). Для 93 раннего конца
агентом не наблюдается.

Сессии 90 и 91 (для полноты):
```
c09b8ec7: 06:12:37.114Z enqueue (срок +10 мин → ≈ 09:22:37 местного); 06:12:55Z чтение навыка /end-chat-soft; 06:13:10Z правка STATUS;
          assistant records naming BOUNDARY: 0
665ff8a9: 06:49:29.944Z enqueue · 06:50:42.341Z доставлено (+1 ч 30 мин → 11:19:29–11:20:42 местного); 08:18:53–08:19:14Z перенос STATUS;
          assistant records naming BOUNDARY: 1 · first 2026-10-23T08:26:58.751Z
```
90 — закрытие начато сразу после слова, ≈ 10 мин до срока, без `BOUNDARY:` — VERIFIED. 91 — перенос STATUS за ≈ 0,5–2 мин до срока
(36–109 с по краям окна доставки) — по существу совпадает с «51–82 с». То есть ранний конец есть в ДВУХ сессиях со сроком из трёх.
**Починка:** исправить на месте «во всех трёх» → «в двух из трёх (90 · 91); в 93 ход прерван владельцем в 15:56:19, закрытие после срока» —
STATUS п. 0, `plans/137` TK7ж, отчёт `2026-10-23_tk7g-scan-late-report.md` §3 п. 5 и §5 п. 4, поправкой в сообщении следующего коммита (`f9125e5`).

## Охота 7 — заявление шире наблюдения и стоячая ложь: CAVEAT

```
$ git grep -n "21 → 46\|21 -> 46\|21→46"        (вывод сокращён до адресов)
STATUS.md:48 … «21 → 46» исправлено на месте …
plans/137…:186 · :194 · :211   (211 — с поправкой «исправлено 2026-10-23 16:21 +03:00 шагом TK7ж …» в той же строке)
testcases/reports/2026-10-23_tk7e-scan-subagents.md:29 — с поправкой «**исправлено 2026-10-23 16:2…»
tools/sandbox/probes/tk1-wait-call-scan.mjs:23 — "(TK7e's "21 → 46" was half the truth: 92)"
researches/38…/judge-tk-epic.md, JUDGE_TK7EFG_BRIEF.md — цитаты находки
```
Сообщение `3c4d692` поправлено в теле `f9125e5` («Поправка к сообщению коммита 3c4d692…») — VERIFIED. Остаток: в отчёте TK7д §4 «Прочитано: два хода
сессии 92 — 08:58 и 09:16» без поправки (исправленная проба даёт 6) — CAVEAT.
- «Звонок слышен»: слово «да, слышу четко» · «а» привязано только к звонку 14:51:06 (`plans/137:137–139`; там же «звонок 12:11 ответа так и не
  получил»); в отчёте TK7г о 12:11 — «его ответ … не получен». Растяжки нет — VERIFIED. Звонок 14:51:06 и ответ владельца в записи — 11:51:06Z
  (вызов) → 11:51:23.923Z (ответное сообщение) — сходится.
- «У истока хук не подключён»: `grep -c "clock-now" .claude/settings.json` → `0`; `.claude/settings.local.json` → `0` — VERIFIED.
- Новые строки поставки (скретчпад `chars.mjs` по `git diff 52d6d58~1 52d6d58 -- framework/`): `added lines with Cyrillic: 0 · with invisible chars: 0` — VERIFIED.
- Маркеры: все четыре новых `[TESTED]`/`[NOT-TESTED]` в `framework/` и шапка пробы называют отчёт — VERIFIED; но маркер `pageListens` молчит о
  том, что настоящий маршрут не стережётся (охота 2).
- **Новая стоячая ложь шага TK7ж** — «ранний конец во всех трёх сессиях со сроком» (охота 6) и «dry runs … — починено» (охота 5): стоят в STATUS
  п. 0, `plans/137` TK7ж, отчёте TK7ж, сообщении `f9125e5`, шапке пробы, `HOUSE_RULES.md`.

## Что делать (наименьшие правки)

1. **Охота 2:** случай самопроверки на НАСТОЯЩЕЙ странице (вторая дверь своего документа — «Already open», чужого — отказ) + мутант J1 в
   `tk7-contour-mutants.mjs`; в `closeContour` перед `postLocal(…close?t=…)` спросить `pageListens(lock)` (токен не уходит постороннему, ложного
   «its own server ended it» нет) — или назвать утечку токена рядом с зазором `--close`.
2. **Охота 5:** разрезать команду на сегменты, сняв кавычки; случай `--call "a; b" --dry-run`; поправить шапку пробы, отчёт TK7ж и `HOUSE_RULES`.
3. **Охота 6:** исправить «во всех трёх» на месте (список мест выше); в пробе и в ручном разборе конец хода — `stop_hook_summary` или открытие
   следующего хода, а не последняя запись ассистента, если та — `tool_use` без результата.
4. **Охота 4:** в README модуля и строке канона назвать перенос: «заполнитель, уже стоящий в тексте, при правке рядом пиши с обратной косой —
   иначе хук поставит время»; цитата или адрес к «слову владельца» в `plans/142:41`.
5. **Охота 3:** дроби — словами дроби или «один на два»; пустая фраза после свёртки → фраза как написана (или «число»).

## Не переисполнено судьёй

`npm run test:core`, `tools/verify-contour.mjs`, `s14` (полный свод), живой звонок — запрещены брифом или не нужны для охот; функциональный
прогон хука часов живой сессией (PT3) — не делался никем.
