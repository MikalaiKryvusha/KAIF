# Дайджест лёгкого судьи — шаг TK7б версии KAIF 2.10 (находки судьи TK7: страница очереди · замок · `--timeout` · WAV · речь · замок голоса)

> Канон (`AGENT_GUIDE.md`, раздел о пятом обязательстве): «**KAIF добавляет пятое обязательство — к шагу 7 (доложи): ЗАЯВЛЕНИЕ НЕ ШИРЕ
> НАБЛЮДЕНИЯ, КОТОРОЕ ЗА НИМ СТОИТ.**»

**Что судилось:** HEAD `be4432c` (`fix(версия KAIF 2.10, эпик TK, шаг TK7б …`). Он отвечает на дайджест `judge-tk7.md`.
**Бриф:** `JUDGE_TK7B_BRIEF.md` (в этой папке). **Судья:** Claude Opus 5.5, лёгкий судья, 2026-10-23.
**Режим:** в истоке только чтение. Единственный созданный файл — этот. Коммитов нет, `git config`/`checkout`/`stash` не трогал.
Самопроверка контура и мои пробы шли в `quietEnv()` (из окружения убраны `KAIF_BROWSER` и `KAIF_DIST`), скриптами-файлами в скретчпаде
`C:\Users\krinik\AppData\Local\Temp\claude\d--work-ai-sandbox-KAIF\665ff8a9-7161-4a32-a692-c75f64fb7131\scratchpad\j7b\`
(`run.mjs`, `selftest.mjs`, `cases.mjs`, `h2.mjs`, `h3.mjs`, `h4.mjs`, `h4b.mjs`, `h4c.mjs`, `h5.mjs`, `h6.mjs`, `h8.mjs`, `pt0count.mjs`; логи `*.log`
лежат рядом). Чтобы позвать неэкспортированные `docRev`/`lockPath`/`tmpDirOf`, я взял копию контура в `j7b/c/`: к её концу дописана одна строка
`export { … }`, остальной код не тронут. Звук не играл, окна не поднимались, `signalCall()` я не вызывал. Не запускались `npm run test:core`,
`verify-contour`, `--play`. Мутанты прогнаны один раз, в одиночку. `git status` после всех прогонов: кроме прежних `assets/*.png` изменены
`ideas/33`, `plans/137`, `plans/142` и отчёт, а также неотслеживаемый `tools/sandbox/probes/pt1-clock-now.mjs`. Это работа параллельной
главной сессии, а не моя, и сужу я только коммит `be4432c`.

## Общий вердикт: **VERIFIED WITH CAVEATS** — две охоты REFUTED на пограничных путях

Заявленные проверки переисполнены и сошлись:
- самопроверка — 159/159 за 20 с;
- мутанты — 17/17, каждый краснит ровно свои случаи, контроль даёт 0;
- дверь на этой сборке — 5/5, на HEAD~1 — BAD ровно (4) и (5);
- страница очереди теперь закрыта классом в обе стороны;
- WAV не бросает исключений;
- счёт PT0 сошёлся.

Но правка находки 5 (`--timeout`) внесла **регрессию гарантии I48**: `<doc> --list --timeout N` снова поднимает страницу владельца с окном на
таймере (на TK7 эта команда отказывала). Новое правило тысяч в речи склеивает номер тикета с соседним числом. Оба случая — дефекты нового кода
на редких путях, а не ложь отчёта. Остаток класса «pid как доказательство жизни» живёт в пути того же документа (I29) и в замке голоса.

| # | Охота | Вердикт |
|---|---|---|
| 1 | Переисполнение: самопроверка, мутанты, дверь (эта сборка / HEAD~1) | **CAVEAT** (всё сошлось; «девять новых случаев TK7b» — на деле восемь) |
| 2 | Страница очереди (находки 1–2) | **VERIFIED** |
| 3 | Замок страницы (находка 4) | **CAVEAT** (класс остался в пути того же документа) |
| 4 | `--timeout` (находка 5) | **REFUTED** (регрессия: `<doc> --list --timeout N` — окно на таймере) |
| 5 | WAV и речь (находки 3, 6) | **REFUTED** по речи (склейка «#165 100%»); WAV — VERIFIED |
| 6 | Замок голоса | **CAVEAT** |
| 7 | Ослабленная проверка | **VERIFIED** |
| 8 | Заявление шире наблюдения и поставка | **CAVEAT** |
| — | PT0: «48 из 84» | **VERIFIED** (счёт) |

---

## Охота 1 — переисполнение: CAVEAT (числа сошлись, кроме одного счёта)

**Самопроверка** (`node j7b/run.mjs`-подобный `selftest.mjs` → `review.mjs --selftest` в `quietEnv({ KAIF_VOICE_TOOL: '' })`):
```
cases 159 · green 159 · red 0 · TK7b cases 8
contour selftest green: 159 checks (pre-flight red on the "options as paragraphs" fixture, three faces, records, showing)
exit 0 secs 20.0
```
**Сравнение по именам случаев** (`cases.mjs`: самопроверка HEAD~1 из `git archive HEAD~1 framework/tools/contour` против HEAD):
```
…\prev\framework\tools\contour: exit 0, 151 cases, red 0, 15.9 s
…\KAIF\framework\tools\contour: exit 0, 159 cases, red 0, 20.0 s
HEAD~1 cases missing in HEAD (exact name): 0
HEAD cases new: 8
```
Добавлено ровно 8 случаев «TK7b», ни один не снят: 151 + 8 = 159. Отчёт `2026-10-23_tk7b-judge-findings.md` (§4 и §5 п. 5) называет
«**девять** новых случаев «TK7b»», а перечисляет восемь. Число неверно на единицу. Мелочь, но это заявление шире наблюдения.

**Мутанты** (`node tools/sandbox/probes/tk7-contour-mutants.mjs`, в одиночку, `real 6m9.585s`, код 0):
```
OK  control copy: 0 red line(s)
OK  M1 another live page does not refuse: 2 red line(s) (expected exactly «TK7 #169: a live page» · «TK7b #169: a lock caught half-written»)
OK  M2 … 1 red · M3 … 1 red · M4 … 2 red · M5 … 2 red · M6 … M17 — по 1 red line, каждая — названный адресат
✅ each TK7 and TK7b change is red on its own selftest case only; the control copy is silent; the Russian call has no «вычитки»
```
Шапка пробы обещает «≈ 1–2 min», а прогон занял 6 мин 10 с. Шапка устарела.

**Дверь** (`node tools/sandbox/probes/tk7-one-page-door.mjs`, затем то же с каталогом `git archive HEAD~1 framework/tools/contour`):
```
== this build
OK  (1) … (5) — ✅ the real door: one page at a time, a live page is one that answers, …          exit 0
== HEAD~1
OK  (1) … OK (2) … OK (3) …
BAD (4) a live pid whose address does not answer (a reused pid) → the page rises (exit 3), the other lock stays
BAD (5) --queue --list --timeout 5 → exit 3, not refused
✖ 2 BAD                                                                                              exit 1
```
Заявление «HEAD~1 — BAD ровно (4) и (5)» подтверждено.

## Охота 2 — страница очереди: VERIFIED

**По коду.** В `serveContour` страница очереди решает жить или умереть только в двух местах, и оба теперь считают по `forOwner()`:
- ветка «прочитано» — `restQ`;
- ветка ответа — `rest` + `restN`.

Третьи места `pendingDocs` о жизни не решают:
- `pulseRev` отдаёт ревизию на пульс;
- `/d/` — пропуск к документу; `ownerDocs ⊆ pendingDocs`, так что видимое всегда пропускается;
- вахта тишины смотрит только на `lastAlive`.

Сообщения считаются тем же `pendingNotices(root)`, которым страница их рисует (`buildIndexPage(root, forOwner(), pendingNotices(root))`).

**Наблюдение** (`h2.mjs`: `serveContour({batch:true}, {open:false, signal:false})`, пульс 200 мс, `/decide`, пауза 3,2 с после шага):
```
[Q1 one notice, nothing else]  read n1 -> ended={"outcome":"notice read","exitCode":0}
[Q2 two notices]  read n1 -> ended=null | read n2 -> ended={"outcome":"notice read","exitCode":0}
[Q3 interview(1) + notice: answer, then read]  answer -> ended=null | read -> ended={"outcome":"notice read","exitCode":0}
   log: … Documents left in the queue: 0, unread notices: 1 — the page STAYS open …
[Q4 interview(1) + notice: read, then answer]  read -> ended=null | answer -> ended={"outcome":"decision recorded","exitCode":0}
[Q5 interview(1) + OLD hidden interview, no notice: answer] -> ended={"outcome":"decision recorded","exitCode":0}
[Q6 OLD hidden interview + notice: read] -> ended={"outcome":"notice read","exitCode":0}
[Q7 two interviews(1): answer a, answer b]  a -> ended=null | b -> ended={"outcome":"decision recorded","exitCode":0}
[Q8 notice whose file is deleted while the page lives + interview(1): answer] -> ended={"outcome":"decision recorded","exitCode":0}
[Q9 notice page, no client] -> {"outcome":"page closed without an answer","exitCode":2} after 1.3 s
```
Страница без интервью и с непрочитанным сообщением после «прочитано» у последнего кончается кодом 0 (Q1, Q2). Старое скрытое интервью её не
держит (Q5, Q6). Зеркало #163 закрыто в обе стороны (Q3, Q4). Пути «страница не кончится никогда» не нашлось. Страница без клиента
кончается вахтой тишины (Q9). При живом окне без дел владелец закрывает окно, и маяк `/closed` с телом `index` кончает контур.

## Охота 3 — замок страницы: CAVEAT

`h3.mjs` (`serveContour` с `open:false, signal:false`; посторонний процесс — мой дочерний `node -e setTimeout`; «чужое приложение» —
мой `http`-сервер, который на всё отвечает 200):
```
L2 other lock: live stranger pid, a FOREIGN app answers at its port -> no page, {"outcome":"other-open",…,"exitCode":3} in 0.07 s
L3 other lock without url, live pid -> PAGE ROSE in 0.06 s
L4 other lock broken for good -> PAGE ROSE in 0.25 s      ·  L4 broken lock still on disk: true
L5a other lock without pid, address answers -> no page, … (interviews/interview_020_o.md, pid undefined) …
L5b other lock without pid, address dead -> PAGE ROSE in 0.06 s
L6 other lock: live pid, unroutable address -> PAGE ROSE in 1.55 s
L9 three other locks: live pid, unroutable addresses -> PAGE ROSE in 4.56 s
L1 OWN document: kept lock, pid reused by a stranger, dead port -> no page, {"outcome":"already-open","url":"http://127.0.0.1:1/","exitCode":0}
   | Already open by this contour: http://127.0.0.1:1/ (pid 20264) — not raising a second window (I29).
L8 OWN document live at http://127.0.0.1:61492/, its lock half-written -> second raise: A SECOND PAGE ROSE at http://127.0.0.1:61493/
L7a --close (no force) -> exit 4 | … pid 20264 was NOT killed …
L7b --close --force -> exit 0 · the stranger (our dummy) alive after: false | … the process was killed by pid (forced; …: ECONNREFUSED)
```

Что сходится с заявлениями:
- **Чужой замок.** Находка 4 закрыта: замок, который навсегда битый, никого не держит и не удаляется (L4, задержка 0,2 с). Живой pid без
  ответа не блокирует (L6). Недоступный адрес стоит 1,5 с на каждый такой замок — проверка последовательная (L9).
- **Замок без `url`** никого не держит (L3). Такие замки контур не пишет: `writeLock` пишет файл только после `listen`.
- **Чужое приложение на порту** при переиспользованном pid блокирует (L2). Это двойное совпадение, и именно это решение `[ИИ]` записано
  («любой HTTP-ответ»).
- **Гонка «в одно мгновение»** названа в I48 (`/owner-reviews` обоих слоёв) и в контракте §5. В ноте 2.10 её нет.

Зазоры класса, наблюдённые:
1. **L1 — тот же документ.** Его замок, сохранённый по I29, с pid, который занял посторонний процесс, по-прежнему проверяется только по pid
   (`checkLock`). Итог — «Already open … not raising a second window» с **кодом 0**: окна нет, страницы нет, агенту сказано, что она есть.
   До TK7 было так же (судья TK7 это отметил). Но текст I48 теперь звучит общим правилом: «a page is live only when it answers at its lock's
   address (a reused pid is no page …)». Для того же документа это неправда. Цепочка «→ `--close` код 4 → `--force` убьёт постороннего»
   (L7b) жива на этом пути.
2. **L8 — тот же документ.** `checkLock` по-прежнему **удаляет** нечитаемый замок своего ключа. Полузаписанный замок живой страницы при
   повторном показе того же документа даёт вторую страницу того же документа. Комментарий TK7б честно ограничен словами «a lock of ANOTHER
   page», но класс «не удалять то, что сервер может писать» закрыт только для чужих страниц.
3. **Мелочь.** Отказ печатает `pid undefined`, если в замке нет pid (L5a).

## Охота 4 — `--timeout`: REFUTED (регрессия гарантии I48)

`h4.mjs` — настоящий CLI генератора истока во временном проекте, `quietEnv` (PATH пуст, поэтому `cmd.exe` и браузер не находятся и окно
подняться не может), `--silent`:
```
— doors without a window, --timeout 5:
[--queue --list --timeout 5] -> exit 2 …        (h4b, с интервью в очереди: exit 0, строка очереди)
[--call probe --dry-run --timeout 5] -> exit 0 | CALL (dry run, no sound): owner, probe
[… --close --timeout 5] -> exit 0 · [… --enqueue …] -> exit 0 · [--mark-shown … --timeout 5] -> exit 0 · [--search probe --timeout 5] -> exit 0
[… --check --timeout 5] -> exit 0 · [… --no-serve --timeout 5] -> exit 0
[--wait … --timeout 5] -> exit null (killed SIGTERM at 3000 ms — it RAN)
[--selftest --timeout 5] -> exit null (killed SIGTERM at 2500 ms — it RAN)   (печатал свои случаи)
— doors with a window, --timeout 5 (expect exit 3):
[<doc> --timeout 5 --silent] · [--queue --timeout 5 --silent] · [notes/n.md --notice …] · [<doc> --proofread …] · [<doc> --mockup …] -> exit 3 | ✖ --timeout raises the owner's window on a timer — refused …
— values:  "0" -> null · "abc" -> null (timer NaN — нет таймера) · "-5" -> null · "1e3" -> REFUSED · "0x10" -> REFUSED (Number → 16 s)
```
Двери без окна проходят, двери с окном отказывают, а `--timeout 0` законен. Отказ совпадает с тем, будет ли таймер: `Number(v) > 0` и в
`timeoutRefusal`, и в `opts.timeoutMs`. Это сходится.

**Обход.** В `NO_WINDOW_FLAGS` стоит `--list`, но `main()` уводит `--list` к списку только вместе с `--queue`
(`if (args.includes('--queue') && args.includes('--list'))`). Иначе вызов падает в `mainShow` и показывает страницу:
```
[interviews/interview_010_x.md --list --timeout 2 --silent] exit 2 2.2 s
  Page is up: http://127.0.0.1:61587/ (Interview)
  NO WINDOW OPENED — open it yourself: … (no browser found on this machine; …)
  Window: none
  Shown recorded (I40): 1 doc(s) → interviews/decisions/shown.json
  Outcome: tolerated SILENCE exhausted (--timeout, automation only; not a deadline for thinking) — ending.
[notes/n.md --notice --list --timeout 1 --silent] -> exit 2 1.3 s | Page is up … (Notice) ¦ … Window: none ¦ Shown recorded (I40) …
```
Без пустого PATH здесь поднялось бы окно владельца, и его закрыл бы таймер. **Это регрессия TK7б**: на TK7 те же аргументы отказывали.
`h4c.mjs` прогоняет `timeoutRefusal` обеих сборок:
```
interviews/x.md --list --timeout 5               TK7: refused · TK7b: passes
notes/n.md --notice --list --timeout 5           TK7: refused · TK7b: passes
interviews/x.md --proofread --list --timeout 5   TK7: refused · TK7b: passes
--queue --list --timeout 5                       TK7: refused · TK7b: passes
interviews/x.md --timeout 5                      TK7: refused · TK7b: refused
```
Опровергнуты три заявления:
- I48: «a page raised in the owner's WINDOW never runs on a timer»;
- нота: «refuses `--timeout` on a page with a window (a door without a window … pass)»;
- коммит: «--timeout отказывает только у показа».

Путь редкий: `--list` без `--queue` никто не пишет нарочно. Но это ровно класс «флаг, который дверь не знает, молча меняет поведение»
(баг 33). Случай самопроверки «TK7b: --timeout …» проверяет `--queue --list`, а `<doc> --list` не проверяет.

## Охота 5 — WAV и речь: REFUTED по речи · WAV — VERIFIED

**WAV** (`h5.mjs`: срезы 0…60 байт, 12 намеренных порч — размер `fmt ` 0/8/0xFFFFFFFF, `data` 1/0xFFFFFFFF, нет `fmt `, RIFX, стерео,
8 бит, float, `data` раньше `fmt `, обрезанный `fmt ` перед `data` — и 200 случайных порч заголовка):
```
pcmOfWav: buffers 273 · threw 0 · returned a voice 26 · a voice with <2 bytes 0
valid -> 4410 bytes @22050 · cut 44 -> null · cut 45 -> null · cut 46 -> voice 2
```
Исключений ноль, а пустой `data` голосом не считается. Срез на 46 байтах — голос из одного отсчёта. Он склеится в «тишина · писки», но это
и правда «голос», и I36 тут не нужен.

**Речь** (`speakable`, русский пакет; дословно, выборка из 20 фраз):
```
   "Загрузка 1%, 2%, 5%, 11%, 21%, 22%, 2,5%, 100%" -> "Загрузка один процент, два процента, пять процентов, одиннадцать процентов, двадцать один процент, двадцать два процента, два пять процента, сто процентов"
   "Цена 1 000 000 рублей или 1000000, или 999999" -> "Цена один миллион рублей или один миллион, или девятьсот девяносто девять тысяч девятьсот девяносто девять"
   "café naïve résumé Zürich" -> "кафе наиве ресуме Зурич"
   "год 2026 100 дней" -> "год две тысячи двадцать шесть сто дней"
   "в 15 100 человек" -> "в пятнадцать тысяч сто человек"
   "Интервью #010 100 вопросов" -> "Интервью десять тысяч сто вопросов"
   "Тикет #165 100%" -> "Тикет сто шестьдесят пять тысяч сто процентов"
   "1,000,000 и 1.000.000" -> "один ноль ноль и один ноль ноль"
   "1 000 000 000 и 2 500 000" -> "один ноль ноль ноль ноль ноль ноль ноль ноль ноль и два миллиона пятьсот тысяч"
   "KAIFа хватит" -> "Кей-эй-ай-эф а хватит"
!! LATIN "Ångström и Øresund, Łódź" -> "Ангстром и øресунд, łодз"
!! LATIN "Mötley Crüe — straße" -> "Мотлеи Круе — страßе"
!! LATIN "ﬁle ligature" / "Ⅻ глава" / "ＡＢＣ полноширинные" -> «ﬁ», «ⅻ», «ａｂｃ» проходят
   "x² и ½" -> "кс ² и ½"
```
Что починено:
- проценты согласуются с числом, включая 2,5;
- «1 000 000» читается как миллион;
- `é ï ü` больше не доходят до движка;
- `undefined` и `NaN` не появились ни разу.

**Дефект нового правила тысяч.** Бриф спрашивал о нём прямо. `#` и `№` заменяются пробелом ДО слияния групп, поэтому номер из 1–3 цифр
сливается со следующим трёхзначным числом:
- «#010 100» → «десять тысяч сто»;
- «#165 100%» → «сто шестьдесят пять тысяч сто процентов».

Номера `#NNN` — обычная часть фраз звонка. Это неверное число в голосе, и внёс его TK7б. «2026 100» не склеивается: лишняя четвёртая цифра
спасает. «15 100» склеивается, но это законная запись тысяч.

Остатки, о которых заявления не говорят:
- буквы без разложения NFD (`ø ł ß`) — латиница в движке. Заявление «no letter with a diacritic» шире наблюдения: случай проверяет только `é ï ü`;
- «1,000,000» и «1.000.000» читаются «один ноль ноль»;
- десятичная часть теряется («2,5» → «два пять»);
- «KAIFа» отрывает окончание.

## Охота 6 — замок голоса: CAVEAT

По коду `signalCall` замок отдаётся на каждом пути:
- тихие часы — выход ДО `whenVoiceFree`, замок не берётся;
- SAPI код 3 без писков → `done()`; код 3 с писками → `play` → `done`;
- ошибка запуска → `play` или `done()`;
- macOS: `say` exit/error → `done`;
- Linux → `done()`;
- инструмент с `--out` → `play`; без `--out` → писки → `richVoice` → `done` или `systemVoice` → `done`;
- `embedded` → `richVoice(true)` → `done` или `systemVoice` → `done`.

Двойного вызова на ENOENT нет: `h6.mjs` в `quietEnv` даёт `events: ["error ENOENT"]` (только `error`, `exit` не приходит). Повторный
`release` безвреден — он идемпотентен.

`h5.mjs` — функции замка; мой `then()` ничего не играет:
```
V1 empty (half-written) lock of a live caller: voiceBusy -> null
V1b whenVoiceFree on it: took the voice at once = true · the lock now names us = true
V2 live caller, lock 181 s old: voiceBusy -> null · at 179 s -> true
V3 live caller, fresh lock: waiting = true  ·  V3b caller gone: took = true  ·  V3c released -> lock gone = true
V4 two calls in one process: first took = true, second waits = true  ·  V4b after first release: second took = true
```
Повисший звонок держит других не дольше 180 с (V2). Зазоры:
1. **V1 — тот же класс, что находка 4.** Замок между `openSync('wx')` и записью пуст. Ждущий читает его как «никого» (`readJsonOr` → `null`),
   удаляет `rmSync` и берёт голос: два звука разом. Окно — микросекунды. Но в `otherLivePage` эту самую ошибку TK7б и чинил перечитыванием,
   а в новом замке голоса повторил её.
2. **По коду, не наблюдалось.** Страница кончается через `process.exit` после ответа, а её дочерний `powershell` ещё играет. Pid замка
   умер, и следующий звонок звучит поверх. Нужно, чтобы владелец ответил быстрее, чем длится звонок (около 9 с), и агент сразу позвал снова.
3. **По коду.** Худшая цепочка запасных путей длиннее 180 с: рендер `--out` 60 с → писки → `--play` инструмента 60 с → рендер SAPI 60 с →
   игра. Для живого случая «инструмент повис» выходит ≈ 135 с — в пределах. Комментарий «each under VOICE_TIMEOUT_MS» про сумму молчит.

## Охота 7 — ослабленная проверка: VERIFIED

Из HEAD~1 не пропал ни один случай, новых восемь (охота 1). Изменения в старых местах:
- **«TK7 #169: a live page».** Мёртвый порт 1 заменён слушающим сервером. Обоснование верно: мёртвый порт при живом pid — это ровно
  переиспользованный pid, и он теперь судится отдельно (7c) с ожиданием «не блокирует». Требования «код 3, нет страницы, нет замка» на месте;
  `includes(otherUrl)` равносилен прежней регулярке.
- **«TK7 #165: the Russian engine».** Сравнение `sp.percent` → `sp.percent('80')`, потому что пакет теперь даёт функцию.
- **M2.** Предикат «таймер законен» (`if (true ||`) тот же.
- **M1 и M4.** Получили второго адресата, ни один не снят (мутанты: ровно 2 красных).
- **Пин близнецов.** `export async function otherLivePage(` — функция стала асинхронной; добавлены пины замка голоса и списка дверей.

7c/8b/8c ускорены закрытием по токену и параллельным прогоном, но судят то же самое:
- 7c проверяет `existsSync(BRK) && existsSync(OLK)` до закрытия;
- 8b берёт исход `e`, дождавшись `SERVER_DEATH_MS + 3000`, и только потом закрывает;
- 8c снимает `endedAtCheck`/`logAtCheck` ДО своего закрытия;
- у каждого свой корень (EXP-0191);
- M6, M8, M10 и M11 краснят ровно их.

## Охота 8 — заявление шире наблюдения и поставка: CAVEAT

`h8.mjs` — строки, добавленные коммитом:
```
framework/tools/contour/review.mjs: added lines 220 · Cyrillic lines 0 · invisible/control lines 0 · literal No-sign 0 · lines with an escaped Cyrillic letter 1
   escaped Cyrillic: // TK7\u0431 (judge TK7, hunt 5): thousands written with spaces (\u00ab1 000 000\u00bb) are ONE number; …
framework/tools/contour/texts.mjs: added lines 18 · Cyrillic lines 6 · invisible/control lines 0 · literal No-sign 0
```
Новые строки `review.mjs` написаны по-английски: без кириллицы, без невидимых символов, `№` нет. Кириллица есть только в `texts.mjs`.
В одном комментарии метка спрятана escape-последовательностью (`TK7\u0431` = «TK7б»), хотя отчёт пишет «в коде и пробах метка — `TK7b`». Это
косметика.

«Звонок слышен» как факт не звучит нигде: `grep -rni "heard whole|слышен целиком|звонок слышен" framework/ tools/build-framework.mjs` —
пусто. Заголовок ноты — «AND THE CALL AS ONE SOUND», «on Windows» добавлено. `bugs/134` остаётся «fix pending verification». В отчёте:
«слух владельца … НЕ проверено», вердикт «partial».

Шире наблюдения:
- нота, I48 и коммит о `--timeout` — опровергнуты (охота 4);
- I48 «a reused pid is no page» — для того же документа неверно (охота 3, L1);
- «звонки проекта не звучат разом» / «a call waits while another call of the project is sounding» — держится функциями, с зазорами V1 и
  выходом страницы (охота 6);
- отчёт §2: «проверено с реальным состоянием, снятым с реального». На деле замки синтетические: созданы пробой во временном проекте, с поля
  их не снимали. Это прокси, и назвать его следовало так;
- «девять новых случаев» против восьми (охота 1); «≈ 1–2 min» в шапке пробы мутантов против 6 мин.

## PT0 (б)–(в): «48 из 84 заданий субагентов поля открываются преамбулой»: VERIFIED

Свой счётчик `pt0count.mjs`, написан независимо от скрипта главной сессии. Каталог записей того развёртывания я нашёл по файлу хука
преамбулы в его `.kaif/hooks/`. Печатаются только числа:
```
{"subagentTranscripts":84,"firstUserStartsWithMarker":48,"markerMidFirst":0,"noUserMessage":0,"filesWithMarkerAnywhere":48,
 "mainTranscripts":23,"agentCallsInMain":59,"agentCallPromptStartsWithMarker":1,"agentCallPromptMarkerMid":0}
```
84 и 48 сошлись, в середине метки нет ни разу. Сверх заявления: в главных записях из 59 вызовов `Agent` метку в исходном `prompt` несёт один.
Значит, метку в задание субагента вписывал хук, то есть переписанный вход дошёл до инструмента. Хук поля отвечает только
`{hookSpecificOutput:{hookEventName,updatedInput}}`, без `permissionDecision` (строка 94 хука). Наблюдение «updatedInput без решения
применяется для Agent» подкреплено.

---

## Что починить до релиза 2.10 (предложение судьи, не решение)

1. **Охота 4 (регрессия).** `timeoutRefusal` должен считать `--list` дверью без окна только вместе с `--queue`. Лучше выводить «будет ли
   показ» из той же развилки, что и `main()`. Нужны случай `<doc> --list --timeout 5` → код 3 и мутант.
2. **Охота 5.** Слияние групп тысяч не должно цеплять число после `#`/`№`: сливать до замены `#` или запретить слияние после него. Нужен
   случай «#165 100%» → «сто шестьдесят пять сто процентов».
3. **Охота 6.** Нечитаемый замок голоса — «занят» на одно перечитывание, как в `otherLivePage`.
4. **Кандидаты в 2.11** (класс, известный до TK7):
   - `checkLock` своего ключа: живость по ответу адреса, а не по pid (L1 — «Already open» с кодом 0 при пустом экране);
   - не удалять нечитаемый свой замок (L8 — две страницы одного документа);
   - сузить I48 «a reused pid is no page» до чужих страниц, пока это не сделано.
5. **Мелочи:**
   - «девять» → «восемь» в отчёте; шапка пробы мутантов — ≈ 6 мин;
   - отказ без pid печатает `pid undefined`;
   - `ø ł ß`, «1,000,000», десятичная часть;
   - метка в комментарии без `\u0431`;
   - отчёт §2 — назвать замки синтетическими (прокси).
