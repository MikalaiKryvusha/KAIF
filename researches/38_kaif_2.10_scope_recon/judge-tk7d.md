# Дайджест лёгкого судьи — шаг TK7г версии KAIF 2.10 (оговорки судьи TK7в: живость по порту · битый замок · зазоры по pid · голос · речь)

> Канон (`AGENT_GUIDE.md`, раздел о пятом обязательстве): «**ЗАЯВЛЕНИЕ НЕ ШИРЕ НАБЛЮДЕНИЯ, КОТОРОЕ ЗА НИМ СТОИТ.**»

**Что судилось:** коммит `e787c28` (`fix(версия KAIF 2.10, эпик TK, шаг TK7г …`). Он отвечает на дайджест `judge-tk7c.md`.
**Бриф:** `JUDGE_TK7D_BRIEF.md` (в этой папке). **Судья:** Claude Opus 5.5, лёгкий судья, 2026-10-23.

**Режим.** В истоке я только читал. Этот файл — единственный, который я создал. Коммитов не делал, `git config`/`checkout`/`stash` не трогал.
Пока я работал, параллельная сессия закоммитила `3c4d692` (шаг TK7д, 14:49:16, уже после конца моего прогона мутантов в 14:48:04) и правит
рабочее дерево (`STATUS.md`, `framework/hooks/*`, `tools/build-framework.mjs` и др.). Эти правки не мои. Контур и пробы с `e787c28` не
менялись:
```
$ git diff --stat e787c28 HEAD -- framework/tools/contour tools/sandbox/probes/tk7-contour-mutants.mjs tools/sandbox/probes/tk7-one-page-door.mjs tools/lib/sandbox-run.mjs
(пусто)
contour-worktree-clean
review-same-as-e787c28
```
Значит, всё ниже судит контур ровно `e787c28`.

Всё запускалось в `quietEnv({ KAIF_VOICE_TOOL: '' })`, из окружения дополнительно убраны `KAIF_BROWSER` и `KAIF_DIST`. Скрипты-файлы
лежат в скретчпаде `C:\Users\krinik\AppData\Local\Temp\claude\d--work-ai-sandbox-KAIF\9523b701-9d86-4157-b5bd-287a998c0030\scratchpad\j7d\`:
`run.mjs`, `selftest3.mjs`, `h2.mjs`, `h3.mjs`, `h3b.mjs`, `h5.mjs`, `h6.mjs`, `h8.mjs`, `m0run.mjs`. Логи `*.log` лежат там же.
Прошлая сборка — `git archive e787c28~1 framework/tools/contour` в `j7d/prev/`.

Чего не было:
- звук не играл, окна не поднимались;
- `signalCall()` не вызывался;
- `serveContour` шёл только с `open:false, signal:false`;
- `recoverFromWindow` звался без протухших замков (только битые), поэтому браузер не ищется и не запускается;
- не запускались `npm run test:core`, `verify-contour`, `--play`, `--call`.

Мутанты прогнаны один раз, в одиночку. Самопроверка и мои пробы шли только до или после них, по одной.

## Общий вердикт: **VERIFIED WITH CAVEATS** — заявленные проверки сошлись; одна охота REFUTED на пограничном пути

Что переисполнено и сошлось:
- самопроверка — 165/165 три раза подряд;
- мутанты — 28/28 **одним полным прогоном**, каждый краснит ровно свои случаи, контроль даёт 0;
- дверь — 6/6 на этой сборке;
- медленная живая страница больше не накрывается второй, даже при цикле событий, занятом 8 с;
- битый замок чужой страницы не удаляет ни один путь.

Где правка шире наблюдения:
1. **Класс «номер процесса достался другой программе» переехал на порт, и этот зазор не назван.** Допустим, pid замка переиспользован, а
   порт замка слушает ЛЮБАЯ посторонняя программа. Тогда свой замок даёт «Already open» без страницы, а замок чужого документа — отказ
   кодом 3. На прошлой сборке страница вставала. Фраза I48 «a reused pid is no page: no refusal, no "Already open"» на этом пути неверна.
2. **Охрана самого урока EXP-0193 мигает.** Мутант «допуск 0» (ровно ошибка, найденная в сессии) самопроверка поймала один раз из трёх.
3. **Речь:** латиница закрыта классом. Но числа не из ASCII («² ₂ ½ ¾ １２３ ① ٣») доходят до движка сырыми.
4. **Мелочи:**
   - заголовок коммита «замок голоса из будущего не держит» шире кода: читаемый замок с `at` из будущего и живым pid держит голос сутки;
   - дверь CLI не отличает эту сборку от прошлой;
   - битые замки теперь живут дольше и держат ждущего.

| # | Охота | Вердикт |
|---|---|---|
| 1 | Переисполнение | **VERIFIED** (мелочь: дверь 6/6 и на `e787c28~1` — она не свидетель TK7г) |
| 2 | Живость по порту | **REFUTED** на пограничном пути (переиспользованный pid + порт у посторонней программы); медленная живая страница — VERIFIED |
| 3 | Битый замок | **VERIFIED** (оговорка: битые замки живут до двери своего документа, битый `_queue.lock` держит ждущего) |
| 4 | Зазоры по pid названы | **VERIFIED** (мелочь: замок голоса судится по pid и в список не входит — он не замок страницы) |
| 5 | Замок голоса | **CAVEAT** — числа брифа сошлись; охрана EXP-0193 ловит регресс 1 из 3; читаемый замок из будущего держит |
| 6 | Речь | **CAVEAT** — латиница классом закрыта; числа вне ASCII сырые; «ẞ» выброшена, а не свёрнута |
| 7 | Ослабленная проверка | **VERIFIED** |
| 8 | Заявление шире наблюдения | **CAVEAT** — «слышен» как факт нигде; M14 исправлена везде; шире кода — I48 (охота 2), заголовок коммита (охота 5), строка «Реального мира» отчёта |

---

## Охота 1 — переисполнение: VERIFIED

**Самопроверка** (`selftest3.mjs`: HEAD три раза подряд, затем прошлая сборка):
```
HEAD#1: exit 0, ok 165, red 0, 20.6 s
  contour selftest green: 165 checks (pre-flight red on the "options as paragraphs" fixture, three faces, records, showing)
HEAD#2: exit 0, ok 165, red 0, 20.7 s
HEAD#3: exit 0, ok 165, red 0, 20.6 s
prev: exit 0, ok 163, red 0, 20.7 s
prev cases missing in HEAD: 1
  - TK7c: an unreadable voice lock holds the voice while fresh and is not deleted; a stale one is taken over (I48)
HEAD cases new or renamed: 3
  + TK7d #169: a live page slow to answer is live — its port accepts: own lock «Already open», another document's refuses, no second page (I29, I48)
  + TK7d #169: the window recovery does not delete a half-written lock of another page (I48)
  + TK7c: an unreadable voice lock holds the voice while fresh and is not deleted; a stale one is taken over, a future-dated one holds no one (I48)
```
«Пропавший» случай — тот же голосовой TK7c, переименованный. Его предикат по диффу только усилен: `&& futureFree`. Новых случаев два, ни
один прежний не снят.

**Мутанты.** `node tools/sandbox/probes/tk7-contour-mutants.mjs` в одиночку, `real 10m24.244s`, `exit 0`:
```
OK  control copy: 0 red line(s)
OK  M1 another live page does not refuse: 3 red line(s) (expected exactly «TK7 #169: a live page» · «TK7b #169: a lock caught half-written» · «TK7d #169: a live page slow to answer»)
OK  M14 diacritics reach the engine: 2 red line(s) (expected exactly «TK7b #165: the Russian engine gets no letter» · «TK7c #165»)
OK  M23 no folding of ø ł ß æ: 1 red line(s) (expected exactly «TK7c #165»)
OK  M25 a live page must answer HTTP again (the TK7b /ping): 1 red line(s) (expected exactly «TK7d #169: a live page slow to answer»)
OK  M26 every reader deletes a broken lock: 1 red line(s) (expected exactly «TK7d #169: the window recovery»)
OK  M27 a future-dated voice lock holds: 1 red line(s) (expected exactly «TK7c: an unreadable voice lock»)
OK  M28 the Latin residue reaches the engine: 1 red line(s) (expected exactly «TK7c #165»)
✅ each TK7, TK7b, TK7c and TK7d change is red on its own selftest case only; the control copy is silent; the Russian call has no «вычитки»
```
Остальные M2–M13, M15–M22 и M24 тоже OK, каждый ровно на своих адресатах. Нет ни одного «DIED» и ни одного «the edit did not apply».
Полный лог — `j7d/mutants.log`.

Отчёт честно пишет «25 полным прогоном (4) и 3 перепрогоном (4а)». Мой прогон — первый полный прогон всех 28 за один заход, и заявление
теперь подкреплено целиком.

**Дверь.** `tk7-one-page-door.mjs` на этой сборке и на `e787c28~1`:
```
== this build
OK  (1) … OK  (2) … OK  (3) … OK  (4) … OK  (6) the own lock of a live pid whose address does not answer → the page rises (exit 2), no «Already open»
OK  (5) --queue --list --timeout 5 → exit 0, not refused
✅ the real door: …                                                        [run] exit 0
== prev (e787c28~1)
OK  (1) … OK  (2) … OK  (3) … OK  (4) … OK  (6) … OK  (5) …
✅ the real door: …                                                        [run] exit 0
```
Шаг TK7г пробу двери не менял, и случаев TK7г в ней нет, поэтому на прошлой сборке она тоже зелёная. Строка «дверь CLI 6/6» в коммите
правдива, но **TK7г она не свидетельствует**. В отчёте «РЕАЛЬНЫЙ МИР: … путь — дверь контура CLI — проверено на реальном CLI (прогон 4)»
стоит неверный номер: прогон 4 — мутанты, дверь — прогон 5. И на реальном CLI ни медленная страница, ни битый замок не проверялись. Это
мелочь.

`verify-contour 239/0` и `полигон 28/28` по правилам брифа не переисполнялись: **UNVERIFIABLE** здесь.

## Охота 2 — живость по порту: REFUTED на пограничном пути

`h2.mjs`, контур этой сборки, затем прошлой (`h2-prev.log`). «Посторонний» — мой дочерний `node -e setTimeout`. «Посторонняя программа на
порту» — голый TCP-слушатель `net.createServer((c) => c.destroy())`, без HTTP, без страницы.
```
== HEAD
R0 refuse latency: closed · ECONNREFUSED 2 ms · … · port1 · ECONNREFUSED 0 ms · … · closed · ECONNREFUSED 0 ms
P1 own lock: stranger pid 39664, port 53458 held by a non-page listener -> {"outcome":"already-open","exitCode":0} in 0.01 s (no page)
   | Already open by this contour: http://127.0.0.1:53458/ (pid 39664) — not raising a second window (I29).
P2 other lock: stranger pid, port held by a non-page listener -> {"outcome":"other-open","exitCode":3} in 0.00 s (no page)
   | Another page is open: http://127.0.0.1:53458/ (interviews/interview_902_other.md, pid 39664) — one page at a time (I48): close it first …
P2b --close (no force) on it -> exit 4
P3 control own lock: stranger pid, port 53461 free -> {"outcome":"page closed without an answer","exitCode":2} in 1.25 s Page is up: http://127.0.0.1:53461/
   | Port 53461 reused from the previous run (its process 39664 is gone) — same web origin, …
P4 own lock of a live page with a BLOCKED loop (8 s busy) -> {"outcome":"already-open","exitCode":0} in 0.00 s (no page)
P4b other lock of the same blocked page -> {"outcome":"other-open","exitCode":3} in 0.00 s (no page)
== prev
P1 own lock: stranger pid 24288, port 53477 held by a non-page listener -> {"outcome":"page closed without an answer","exitCode":2} in 1.25 s Page is up: http://127.0.0.1:53479/
P2 other lock: stranger pid, port held by a non-page listener -> {"outcome":"page closed without an answer","exitCode":2} in 1.23 s Page is up: http://127.0.0.1:53482/
P4 own lock of a live page with a BLOCKED loop (8 s busy) -> {"outcome":"page closed without an answer","exitCode":2} in 2.74 s Page is up: http://127.0.0.1:53492/
   | Port 53490 of the previous run is taken by another process — a fresh port follows; …
P4b other lock of the same blocked page -> {"outcome":"page closed without an answer","exitCode":2} in 2.76 s Page is up: http://127.0.0.1:53496/
```

Что сходится с заявлением:
- **Медленная живая страница — живая (P4, P4b).** Цикл событий живой страницы занят 8 с. Свой замок отвечает «Already open», чужой даёт
  отказ кодом 3, обе проверки — за 0,00 с. На прошлой сборке здесь вставала вторая страница поверх живой. REFUTED охоты 2 судьи TK7в закрыт.
- **Сколько ждёт соединение.** Закрытый порт на петле отказывает за 0–2 мс (R0, девять попыток, порт 1 тоже). Потолок
  `LIVENESS_TIMEOUT_MS` = 1,5 с по коду считается живостью (`sock.setTimeout(…, () => end(true))`). Ошибка в эту сторону стоит лишнего
  отказа, а не второй страницы, и это направление выбрано осознанно и названо в комментарии к `pageListens`.

Что опровергнуто:
1. **REFUTED — класс переехал на порт (P1, P2).** Бриф спрашивал именно это. Pid сбойнувшей страницы достался постороннему, а её порт
   (эфемерный, 49152–65535 на Windows) занят любой другой программой. Тогда `pageListens` получает `connect` и объявляет страницу живой:
   - свой ключ даёт «Already open … not raising a second window» **без страницы** — ровно ложь #169, которую чинили TK7в и TK7г;
   - чужой ключ даёт отказ «Another page is open … close it first», а закрывать нечего (P2b: `--close` отказывает кодом 4).

   На прошлой сборке HTTP `/ping` к не-HTTP слушателю падал, и страница вставала (P1, P2 prev). Путь требует двух совпадений, pid и порт,
   поэтому он реже прежнего. Но он **нигде не назван**: I48 обоих слоёв, контракт §5 и нота говорят «a reused pid is no page: no refusal,
   no "Already open"» без оговорки, а комментарий кода — «a crashed page's port refuses at once». Против HTTP-говорящего постороннего не
   спасал и прежний `/ping`. Отличить «свою» страницу помог бы её токен: замок несёт `closeToken`, страница могла бы отвечать на запрос с
   ним. Тогда пришлось бы снова решать, как ждать медленную страницу.
2. **Мелочь, не починено с TK7в (п. 4 судьи TK7в).** В P3 лог говорит «its process 39664 is gone», а процесс жив: он посторонний.

## Охота 3 — битый замок: VERIFIED (с оговоркой)

Все вызовы и удаления по коду (`grep -n "checkLock(\|rmSync(.*[Ll]ock" review.mjs`):
```
1366:  const lock = checkLock(root, key, { removeBroken: true }); // the own key only: …            ← liveOwnLock (дверь своего документа)
1778:  const lock = checkLock(root, key);                                                         ← closeContour
1942:  … lock: checkLock(root, f.replace(/\.lock$/u, '')) })).filter((x) => x.lock && x.lock.stale) ← recoverFromWindow
1707:      if (!keepLock) rmSync(lockPath(root, lockKey), { force: true });                        ← finish: свой ключ страницы
1809 · 1816:  rmSync(lockPath(root, key) …)                                                        ← close после закрытия (замок прочитан)
1916 · 1923:  rmSync(lockPath(root, key) …)                                                        ← recoverOne: только протухший (прочитан, pid ушёл)
```
`otherLivePage` читает своим `readLock` и не удаляет ничего. Битый файл удаляется только в `checkLock` и только при `removeBroken`. Этот
флаг передаёт один вызов — дверь своего документа.

`h3.mjs` (профиль окна создан, протухших замков нет):
```
== HEAD
B1 recoverFromWindow: own kept true · other kept true · queue kept true · {"recovered":[],"drafts":[]}
B2 --close on a broken own lock -> exit 0 · file kept true · no live page for interviews/interview_901_probe.md — nothing to close (no lock)
B4 door over a broken own lock -> "page closed without an answer" · own lock while up: pid 6504 (this page) · other broken kept true
== prev
B1 recoverFromWindow: own kept false · other kept false · queue kept false · {"recovered":[],"drafts":[]}
B2 --close on a broken own lock -> exit 0 · file kept false · …
B4 … · other broken kept false
```
- Восстановление из окна больше не удаляет ни чужой, ни свой битый замок (B1). На прошлой сборке удаляло все. REFUTED охоты 4 судьи TK7в
  закрыт.
- Свой битый замок **не остаётся навсегда**: дверь своего документа его заменяет, и пока страница жива, замок называет эту страницу (B4).
- `--close` битый свой замок не трогает и говорит «(no lock)». Файл при этом есть, но вывод безвреден.

Оговорка, в заявлении её нет. Битые замки теперь живут до двери СВОЕГО документа, а сторож судит нечитаемый замок живым (CP6, так задумано).
Поэтому битый `_queue.lock` держит ждущего любого документа без конца (`h3b.mjs`):
```
== HEAD  B3 waiter on interviews/interview_901_probe.md with only a broken _queue.lock -> still waiting after 6.0 s
== prev  B3 waiter on interviews/interview_901_probe.md with only a broken _queue.lock -> still waiting after 6.0 s
         B3c control, no lock at all -> 2 after 1.1 s
```
Поведение сторожа прежнее. Новое другое: на полевой машине с профилем окна такой файл прежде стирался первым же показом любого документа,
а теперь лежит до показа очереди. Комментарий `otherLivePage` «a broken file, it blocks no one and stays» шире: сторожа он держит. Путь
редкий (замок обрывается посреди записи пульса).

## Охота 4 — зазоры по pid названы: VERIFIED (с мелочью)

`grep -n "process\.kill(" framework/tools/contour/*.mjs`:
```
review.mjs:335:  try { process.kill(l.pid, 0); } catch (e) { if (e.code !== 'EPERM') return null; }        ← voiceBusy (замок голоса)
review.mjs:1309:  try { process.kill(lock.pid, 0); return lock; }                                      ← checkLock: --close · восстановление (дверь — ещё и pageListens)
review.mjs:1339:    if (lock.pid) { try { process.kill(lock.pid, 0); } catch (e) { if (e.code !== 'EPERM') continue; } } ← otherLivePage: только отсев ушедших
review.mjs:1426:    try { process.kill(held.pid, 0); return 'live'; } …                                 ← сторож (--wait), lockState
review.mjs:1814:    try { process.kill(lock.pid); } …                                                   ← --close --force
```
Список I48 обоих слоёв, контракта и ноты — «the waiter, `--close` and the window recovery still judge a lock by its pid» — совпадает с
кодом для замков страниц: 1426 — сторож, 1309 через 1778 — `--close`, 1814 — `--close --force`, 1309 через 1942 — восстановление. В
`otherLivePage` (1339) pid только отсеивает ушедших, живость дальше судит порт. Список не шире кода. Уже он на одно место — замок голоса
(335), но это не замок страницы. Его pid ограничен потолком 180 с от `at`, если `at` не из будущего (охота 5). Мелочь.

Зазор по порту (охота 2) в этот список не входит и нигде не назван.

## Охота 5 — замок голоса: CAVEAT

`h5.mjs` — только `voiceBusy`/`whenVoiceFree`, мой `then` ничего не играет:
```
V1 empty, mtime +4 s: now+0s: BUSY(unreadable) · now+100s: BUSY(unreadable) · now+183s: BUSY(unreadable) · now+184.5s: free
V2 empty, mtime +6 s: now+0s: free
V2b empty, mtime +10 s: now+0s: free · now+5s: free · now+6s: BUSY(unreadable)
V3 waiter on a +10 s empty file: took = true · the lock named us = true · released = true
V4 empty, mtime now: now+0s: BUSY(unreadable) · now+179s: BUSY(unreadable) · now+180.5s: free
V5 empty, mtime +30 ms: now+0s: BUSY(unreadable)
V6 readable, live pid, at +1 day: now+0s: BUSY(pid 27664) · now+3600s: BUSY(pid 27664) · now+86581s: free
V6b readable, live pid, at +10 s: now+0s: BUSY(pid 27664)
```
На прошлой сборке: `V2 … +6 s: BUSY(unreadable)`, `V2b … +10 s: BUSY …`, `V3 … took = false`.

Ответы на вопросы брифа:
- **+4 с** (внутри допуска) держит голос 180 с от штампа, то есть ≈ 184 с от «сейчас» (V1).
- **+10 с** не держит, и ждущий сразу берёт голос (V2b, V3). У ожидания из будущего потолок теперь есть.
- **Пустой файл упавшего процесса** держит ровно до потолка 180 с (V4).
- **Свежий файл со штампом на 30 мс вперёд** (сама гонка EXP-0193) держит (V5).

Оговорки:
1. **Охрана EXP-0193 мигает.** Я сделал копию контура в `j7d/m0/` с одной правкой `VOICE_LOCK_FUTURE_SLACK_MS = 0` (ровно регресс,
   найденный в сессии, `age >= 0`) и прогнал самопроверку трижды, в одиночку (`m0run.mjs`):
   ```
   run 1: exit 1 · SELFTEST RED: 1 of 165 · x TK7c: an unreadable voice lock holds the voice while fresh and is not deleted; a stale one is taken over, a future-dat
   run 2: exit 0 · contour selftest green: 165 checks
   run 3: exit 0 · contour selftest green: 165 checks
   ```
   Угрозу случай ловит только тогда, когда ФС случайно ставит `mtime` впереди `Date.now()`. EXP-0193 пишет «Механизация: механизировано: …
   случай … с файлом, записанным перед проверкой», и это шире наблюдения: 1 из 3. При этом у `voiceBusy(root, now)` есть параметр `now`, и
   детерминированный случай (`now = mtime − 30 мс` → BUSY) пишется одной строкой. Мутанта на допуск в пробе нет.
2. **Случай «из будущего» судит угрозу, а не константу допуска.** Это хорошо: штамп +30 мин, `10 * VOICE_LOCK_STALE_MS`, M27 красен
   детерминированно. Привязка к `VOICE_LOCK_STALE_MS` — мелочь в духе EXP-0190: число угрозы лучше брать из поля, например «часы сбиты на
   минуты». Границу допуска (+4 с держит, +6 с нет) не судит ни один случай.
3. **Читаемый замок из будущего держит (V6).** Живой pid и `at` на сутки вперёд держат голос сутки. Это правило до TK7в, его не меняли, и
   план с отчётом честно сужают правку до «времени файла». Но заголовок коммита «замок голоса из будущего не держит» шире кода.

## Охота 6 — речь: CAVEAT

`h6.mjs` — `speakable` на русском пакете, 45 фраз (`j7d/h6.log`), дословно:
```
ok "ﬁnal ﬂow и ĳs" -> "финал флов и иджс"          ok "ﬁ в начале, середина ofﬁce" -> "фи в начале, середина оффисе"
ok "ĲSSEL капсом" -> "Иджссел капсом"              ok "øresund ØRESUND" -> "оресунд Оресунд"      ok "łódź ŁÓDŹ" -> "лодз Эл-оу-ди-зед"
ok "Straße STRASSE ẞ" -> "Страссе Страссе"         ok "æble ÆRØ œuvre ŒUVRE" -> "аебле Аеро оеувре Оеувре"
ok "Đorđe ĐAK" -> "Дорде Ди-эй-кей"                ok "þorn ÞING" -> "торн Тинг"   ok "ıstanbul" -> "истанбул"
ok "Ħamrun ĦAMRUN" -> "Хамрун Хамрун"              ok "ŧ Ŧ" -> "т Ти"   ok "Hafnarfjörður ÐORRI" -> "Хафнарфджордур Ди-оу-ар-ар-ай"
ok "ɛvent" -> "вент"   !! EMPTY "ʃʒɐ" -> ""   !! EMPTY "ɛɛɛ" -> ""   ok "проверка ɛɛɛ звонка" -> "проверка звонка"
ok "глава Ⅻ" -> "глава Экс-ай-ай"   ok "Ⅳ век" -> "Ай-ви век"   ok "ⅷ" -> "виии"   ok "ǆ" -> "дз"   ok "ŉ" -> "н"   ok "ſ" -> "с"
ok "ＡＢＣ капсом" -> "Эй-би-си капсом"            ok "ｗｏｒｄ" -> "ворд"   ok "Azərbaycan" -> "Азрбаикан"   !! EMPTY "ƒ" -> ""   !! EMPTY "ĸ" -> ""
!! NUM "x² + y² = 3" -> "кс ² + и ² = три"         !! NUM "площадь 5 м²" -> "площадь пять м²"   !! NUM "½ часа" -> "½ часа"   !! NUM "¾" -> "¾"
!! NUM "номер １２３" -> "номер １２３"               !! NUM "H₂O" -> "Эйч ₂ Оу"   !! NUM "①②③" -> "①②③"   !! NUM "٣" -> "٣"   !! NUM "१२" -> "१२"
!! NUM "ｖ２．１０" -> "в ２．１０"                    ok "Ⓐ" -> "Ⓐ"
```

Что верно:
- **Латиница закрыта классом.** Ни в одной из 45 фраз в выходе нет `\p{Script=Latin}`, ASCII-цифр, `undefined` или `NaN`. Лигатуры
  `ﬁ ﬂ ĳ Ĳ ǆ` расщепляет NFKD, буквы с чертой `ħ ŧ ð ƀ ŋ` сворачиваются, капсом, в начале и в середине слова. Полноширинная латиница и
  римские `Ⅻ Ⅳ ⅷ` (Script=Latin) через NFKD становятся ASCII. Остаток вроде `ɛ ə ƒ ĸ` выброшен, как и обещает нота («any other non-ASCII
  Latin letter dropped»). Оговорка 3 судьи TK7в («перечень, а не класс») закрыта.

Где шире:
1. **Числа вне ASCII сырые.** NFKD стоит только внутри замены латинских слов. Надстрочные и подстрочные `² ₂`, дроби `½ ¾`, полноширинные
   `１２３`, обведённые `①`, арабско-индийские `٣` и деванагари `१२` — это Script=Common или чужое письмо, они доходят до движка как
   написаны. Случаи самопроверки проверяют `/\d/u`, а это только ASCII-цифры, поэтому их не видят. Нота обещает «numbers as words». Как
   прочтёт их русский движок, я не проверял (звук запрещён): UNVERIFIABLE. TK7г числа не заявлял, но класс «движок получает слова языка»
   здесь открыт. Лечится тем же NFKD всей фразы до правил чисел, но тогда `½` станет «1⁄2», и ему нужно своё правило.
2. **«ẞ» выброшена, а не свёрнута.** «Straße STRASSE ẞ» → «Страссе Страссе». Заглавная `ẞ` (U+1E9E) NFKD не раскладывается, в
   `LATIN_FOLD` её нет, и она падает в остаток. Свойство «свёрнуто, а не выброшено», которое судят равенства случая TK7c, держится только на
   перечне.
3. **Слово целиком из невыразимых букв исчезает молча.** «ʃʒɐ», «ƒ», «ĸ» дают пустую фразу. Внутри фразы звонка выпадает слово («проверка
   ɛɛɛ звонка» → «проверка звонка»). Для звонка, где проект и документ названы словами, это приемлемо, но нигде не сказано.

## Охота 7 — ослабленная проверка: VERIFIED

- **M1, третий адресат «TK7d #169: a live page slow to answer».** Вторая половина нового случая (`eG2.exitCode === EXIT_PREFLIGHT`) ждёт
  отказа от живой чужой страницы, а M1 (`const other = null;`) этот отказ гасит. Краснеть здесь законно. Прежние два адресата на месте.
- **M14** теперь `const w = w0, unused = w0.normalize('NFKD')`: вся цепочка (NFKD, свёртка, сброс) уходит в `unused`, и слово остаётся
  сырым. Адресаты прежние, оба красны. Фраза «TK7b его больше не видит» отозвана прогоном, это верно.
- **M23.** Строка поиска стала `.replace(LATIN_FOLD_RE, (c) => LATIN_FOLD[c])`: прежняя заканчивалась на `;`, теперь за свёрткой идёт
  сброс. Предикат прежний, мутант красен. Без двух новых равенств сброс остатка сделал бы M23 зелёным. Отчёт это нашёл и закрыл, и это
  правильно.
- **M6, M20, M22.** Новые строки поиска — механический перенос имён (`pageAnswers` → `pageListens`, условие допуска). Предикаты прежние.
- **M25–M28 краснят угрозу:**
  - M25 возвращает HTTP-запрос с ожиданием данных и «тайм-аут — мёртв», то есть само правило TK7б;
  - M26 удаляет битый замок у каждого читателя;
  - M27 снимает нижнюю границу (штамп +30 мин);
  - M28 снимает сброс (`ɛvent` остаётся латиницей).

  Каждый красен ровно на своём случае (охота 1).
- Мелочь формулировки: отчёт и коммит пишут M27 среди «перенесённых», хотя M27 впервые появился в этом коммите.
- Не хватает мутанта на допуск `VOICE_LOCK_FUTURE_SLACK_MS = 0`: случай против него мигает (охота 5).

## Охота 8 — заявление шире наблюдения и стоячая ложь: CAVEAT

**Добавленные строки** (`h8.mjs` по `git diff e787c28~1 e787c28`):
```
framework/tools/contour/review.mjs: added 65 · Cyrillic 0 · invisible 0 · escaped Cyrillic 0 · non-ASCII chars: þÞıħĦŧŦðÐƀƚŋŊ—«ﬁ»·ĳ→×–øŁóźßÆɛéü
tools/sandbox/probes/tk7-contour-mutants.mjs: added 19 · Cyrillic 1 · invisible 0 · escaped Cyrillic 0 · …
framework/skills/owner-reviews/SKILL.md: added 3 · Cyrillic 0 · invisible 0 · …
framework/templates/_interactive-contour-spec.md: added 1 · Cyrillic 0 · invisible 0 · …
tools/build-framework.mjs: added 1 · Cyrillic 0 · invisible 0 · …
```
- Новые строки контура написаны по-английски, без невидимых символов и без escape-кириллицы.
- Литералы `ø ł ß ħ ŧ ð ﬁ ĳ ɛ` законны: гард 5d (`tools/check-framework.mjs:35`, `CYR = /[А-Яа-яЁё]/`) судит только кириллицу. Единственная
  кириллица в пробе (не в поставке) — прежняя итоговая строка с «вычитки».
- `dist/KAIF-CORE-BUNDLE.md` несёт новый код: 13 строк с `pageListens|LATIN_LEFT_RE|VOICE_LOCK_FUTURE_SLACK_MS|removeBroken`.

**«Звонок слышен» как факт не звучит нигде.** Коммит пишет «звонок при владельце сыгран 12:11», STATUS — «слышал ли он целиком, ответа НЕТ
(критерий 23)», отчёт — «его ответ, слышен ли он целиком, НЕ получен», вердикт «partial».

**M14.** `git grep` по смыслу («больше не видит|перестал… ловить|no longer sees|no longer catches») по `*.md` и `*.mjs` вне `dist` находит
одно место — отчёт TK7г, строка 53, где запись процитирована как опровергнутая. Коммит говорит то же. Исправлено везде.

**Маркеры `[TESTED]`.** У `pageListens` маркер называет отчёт `testcases/reports/2026-10-23_tk7d-judge-tk7c-caveats.md` и заодно покрывает
`removeBroken` (M26). У допуска `voiceBusy` и у NFKD со сбросом в `speakable` маркера TK7г нет: там стоит маркер TK7в, о будущем он
молчит. У `speakable` маркера нет с TK7. Мелочь.

Шире наблюдения:
- **REFUTED (см. охоту 2)** — «a reused pid is no page: no refusal, no "Already open"». Так написано в I48 обоих слоёв, контракте §5 и ноте.
  Неверно, когда порт занят посторонней программой.
- **CAVEAT** — заголовок коммита «замок голоса из будущего не держит». Читаемый замок держит (V6).
- **CAVEAT** — EXP-0193 «механизировано». Против регресса случай ловит 1 из 3 (охота 5).
- **CAVEAT** — строка «Реального мира» отчёта «путь — дверь контура CLI — проверено на реальном CLI (прогон 4)». Номер прогона неверен, а
  дверь TK7г не судит (охота 1).
- **CAVEAT** — комментарий `otherLivePage` «a broken file, it blocks no one». Сторожа он держит (охота 3).

---

## Что починить (предложение судьи, не решение)

1. **Охота 2.** Живость своей страницы судить не только портом: страница отвечает на запрос с `closeToken` своего замка. Порт без
   правильного ответа значит «порт занят посторонним», а не «Already open». Ожидание медленной страницы при этом оставить: соединение
   принято — ждать ответа дольше, а не объявлять мёртвой. Как минимум назвать зазор «pid и порт оба достались посторонним» в I48 обоих
   слоёв, контракте и ноте. Нужен случай «посторонний TCP-слушатель на порту замка» и мутант.
2. **Охота 5.** Детерминированный случай `voiceBusy(root, mtime − 30)` → BUSY и мутант «допуск 0». Поправить строку «Механизация»
   EXP-0193.
3. **Охота 6.** NFKD (или своя таблица) для чисел вне ASCII до правил чисел; в случаях — `/\p{N}/u` вместо `/\d/u`; `ẞ` в `LATIN_FOLD`.
4. **Мелочи:**
   - заголовок «из будущего» сузить до «времени файла» или дать потолок читаемому `at` из будущего;
   - «its process N is gone» при переиспользованном pid;
   - в отчёте номер прогона двери;
   - M27 — «новый», а не «перенесённый»;
   - маркеры `[TESTED]` у допуска голоса и у `speakable`;
   - комментарий «blocks no one» поправить на «держит сторожа до двери своего документа».
