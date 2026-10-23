# Дайджест лёгкого судьи — шаг TK7в версии KAIF 2.10 (оговорки судьи TK7б: свой замок · замок голоса · речь · проба замера)

> Канон (`AGENT_GUIDE.md`, раздел о пятом обязательстве): «**ЗАЯВЛЕНИЕ НЕ ШИРЕ НАБЛЮДЕНИЯ, КОТОРОЕ ЗА НИМ СТОИТ.**»

**Что судилось:** коммит `efb4614` (`fix(версия KAIF 2.10, эпик TK, шаг TK7в …`). Он отвечает на дайджест `judge-tk7b.md`.
**Бриф:** `JUDGE_TK7C_BRIEF.md` (в этой папке). **Судья:** Claude Opus 5.5, лёгкий судья, 2026-10-23.

**Режим.** В истоке я только читал. Этот файл — единственный, который я создал. Коммитов не делал, `git config`/`checkout`/`stash` не трогал.
После всех прогонов `git status` показывает только прежние неотслеживаемые `assets/*.png` и бриф, HEAD = `efb4614`.

Всё запускалось в `quietEnv()` (из окружения дополнительно убраны `KAIF_BROWSER` и `KAIF_DIST`), скриптами-файлами в скретчпаде
`C:\Users\krinik\AppData\Local\Temp\claude\d--work-ai-sandbox-KAIF\d41eda95-0cec-4279-803a-6b8f9f95539b\scratchpad\j7c\`:
`run.mjs`, `cases.mjs`, `h2.mjs`, `h3.mjs`, `h4.mjs`, `h4b.mjs`, `h7.mjs`, `t91.mjs`, `t91b.mjs`, `tall*.mjs`. Логи `*.log` лежат там же.

Чтобы позвать неэкспортированные `lockPath`/`tmpDirOf`/`profileDir`, я сделал копию контура в `j7c/c/` и дописал к её концу одну строку
`export { … }`. `cmp` подтвердил, что остальное совпадает с истоком байт в байт.

Чего не было:
- звук не играл, окна не поднимались;
- `signalCall()` не вызывался;
- `serveContour` шёл только с `open:false, signal:false`;
- `recoverFromWindow` звался без протухших замков, поэтому браузер не ищется и не запускается;
- не запускались `npm run test:core`, `verify-contour`, `--play`, `--call` без `--dry-run`.

Мутанты прогнаны один раз, в одиночку.

## Общий вердикт: **VERIFIED WITH CAVEATS** — заявленные проверки сошлись; две охоты REFUTED на пограничных путях

Что переисполнено и сошлось:
- самопроверка — 163/163, ровно четыре новых случая «TK7c», ни один прежний не снят;
- мутанты — 24/24, каждый краснит ровно свои случаи, контроль даёт 0;
- дверь — 6/6 на этой сборке, на прошлой BAD ровно (6);
- проба замера — `--selftest` all ok, без строки остановки ровно 1 FAIL;
- замер записи сессии 91: до починки 1, после — 0.

Где правка шире наблюдения:
1. **Свой замок.** Живая страница, которая не ответила за 1,5 с, теперь считается мёртвой. Поверх неё встаёт ВТОРАЯ страница того же
   документа и перезаписывает её замок. На прошлой сборке здесь был ответ «Already open».
2. **Восстановление из окна.** `recoverFromWindow` идёт перед каждым показом и по-прежнему **удаляет** нечитаемый замок ЧУЖОЙ страницы.
   Это опровергает «another page's [unreadable lock] never deleted» в I48, в контракте и в ноте.
3. **Свёртка латиницы — список, а не класс.** `ħ ŧ ƀ ð ﬁ ĳ` доходят до движка. Нота обещает «letters with a stroke or a ligature too».
4. **Проба замера** не видит фоновых субагентов.

| # | Охота | Вердикт |
|---|---|---|
| 1 | Переисполнение | **VERIFIED** |
| 2 | Свой замок (оговорка 1) | **REFUTED** на пограничном пути (медленная живая страница → вторая страница того же документа); плюс зазоры близнецов |
| 3 | Замок голоса (оговорка 2) | **VERIFIED** (мелочь: штамп из будущего держит голос, у ожидания нет потолка) |
| 4 | Речь (оговорка 3) | **CAVEAT** — названные в брифе формы сошлись, склейки соседних чисел нет; свёртка — перечень, `ħ ð ﬁ ĳ ŧ ƀ` проходят латиницей |
| 5 | Проба замера (TK6) | **CAVEAT** — починка верна, ноль сессии 91 наблюдён на реальном случае; но судимый ход один, а фоновые Agent пробе не видны |
| 6 | Ослабленная проверка | **VERIFIED** |
| 7 | Заявление шире наблюдения и поставка | **REFUTED** по одному пункту («never deleted» — S4); остальное CAVEAT |

---

## Охота 1 — переисполнение: VERIFIED

**Самопроверка.** `cases.mjs` гоняет `review.mjs --selftest` прошлой сборки (`git archive efb4614~1 framework/tools/contour`) и этой:
```
…/prev/framework/tools/contour: exit 0, 159 cases, red 0, 20.0 s
…\KAIF\framework\tools\contour: exit 0, 163 cases, red 0, 20.6 s
  contour selftest green: 163 checks (…)
prev cases missing in HEAD: 0
HEAD cases new: 4
  + TK7c #169: the own lock of a live pid that does not answer at its address (a reused pid) is no page — the page rises, no «Already open» (I29, I48)
  + TK7c #169: the own lock caught half-written is read again — its live page still says «Already open», no second window (I29)
  + TK7c: an unreadable voice lock holds the voice while fresh and is not deleted; a stale one is taken over (I48)
  + TK7c #165: «ø ł ß æ» reach the Russian engine folded, «1,000,000» and «1.000.000» are one million each
```

**Мутанты.** `node run.mjs tools/sandbox/probes/tk7-contour-mutants.mjs`, в одиночку, `real 8m53.993s`, код 0:
```
OK  control copy: 0 red line(s)
OK  M4 Latin reaches the engine: 3 red line(s) (expected exactly «TK7 #165: the Russian engine» · «TK7b #165: …» · «TK7c #165»)
OK  M6 liveness by pid only: 1 red line(s) (expected exactly «TK7b #169: a live pid that does not answer»)
OK  M14 diacritics reach the engine: 2 red line(s) (expected exactly «TK7b #165: …» · «TK7c #165»)
OK  M20 the own lock by pid only: 1 red line(s) (expected exactly «TK7c #169: the own lock of a live pid»)
OK  M21 the own half-written lock not read again: 1 red line(s) …   OK  M22 an unreadable voice lock is free: 1 red line(s) …
OK  M23 no folding of ø ł ß æ: 1 red line(s) …                      OK  M24 comma and dot thousands by groups: 1 red line(s) …
✅ each TK7, TK7b and TK7c change is red on its own selftest case only; the control copy is silent; the Russian call has no «вычитки»
```
Остальные M1–M19 тоже OK, каждый ровно на своих адресатах; полный лог — `j7c/mutants.log`.

Попутно о самом заявлении. По отчёту (прогоны 3, 5, 5а) главная сессия ни разу не прогнала все 24 мутанта на итоговом файле пробы за один
раз: M14 проверялся отдельной копией. Мой прогон и есть первый полный прогон 24/24. Заявление теперь подкреплено, но тогда оно было
составлено из частей. Это мелочь.

**Дверь.** `tk7-one-page-door.mjs` на этой сборке и на `efb4614~1`:
```
== this build
OK  (1) … OK (2) … OK (3) … OK (4) …
OK  (6) the own lock of a live pid whose address does not answer → the page rises (exit 2), no «Already open»
OK  (5) --queue --list --timeout 5 → exit 0, not refused
✅ the real door: …                                                  [run] exit 0
== prev (efb4614~1)
OK  (1) … (4) · OK (5)
BAD (6) the own lock of a live pid whose address does not answer → the page rises (exit 0), no «Already open»
✖ 1 BAD                                                              [run] exit 1
```
Заявление «на прошлой — BAD ровно (6)» подтверждено.

**Проба замера.** `tk1-wait-call-scan.mjs --selftest`: «selftest: all ok» (7 строк ok, в том числе «lacks «T4s»»). Копия пробы без строки 88
(`Successfully stopped task`) даёт `FAIL lacks «T4s»` и `selftest: 1 FAIL`, код 1. Замер записи сессии 91 с `--include-last`:
- нынешняя проба — `turns judged: 1` · `… had not reported: 0`;
- проба `efb4614~1` — `ENDED-WITH-LIVE-BACKGROUND (1)` · `… had not reported: 1`.

## Охота 2 — свой замок: REFUTED на пограничном пути

`h2.mjs` (контур — копия `j7c/c`, `serveContour` с `open:false, signal:false`; «живая медленная страница» — мой `http`-сервер с задержкой
ответа; «посторонний» — мой дочерний `node -e setTimeout`):
```
S1  own LIVE page at http://127.0.0.1:51601/ answering after 2.5 s -> PAGE ROSE at http://127.0.0.1:50228/ in 1.75 s · the lock then: url http://127.0.0.1:50228/ pid 29536
   | Port 51601 of the previous run is taken by another process — a fresh port follows; a draft written in the previous window is NOT visible here (I29) …
S1b own LIVE page answering after 1.0 s -> {"outcome":"already-open",…,"exitCode":0} in 1.05 s
S2  own lock: live stranger pid 31904, free port 50233 -> PAGE ROSE at http://127.0.0.1:50233/ in 0.23 s
   | Port 50233 reused from the previous run (its process 31904 is gone) — same web origin, so a draft … is restored on load (I29/I12).
   port kept: true
S3  --close (no force) on a reused-pid own lock -> exit 4
   | live page: http://127.0.0.1:50236/ · port 50236 · pid 31904 · title "?" — compare with the window …
   | the page … did not accept the close request (ECONNREFUSED) — pid 31904 was NOT killed …
S3b --close --force -> exit 0 · the stranger alive after: false
   | closed … — the process was killed by pid (forced; the page did not answer: ECONNREFUSED) …
S4  recoverFromWindow (profile exists): another page's half-written lock still on disk: false · reused-pid lock picked for recovery: false · result {"recovered":[],"drafts":[]}
```
Тот же `h2.mjs` на `efb4614~1` (`h2-prev.log`): S1 → `already-open` за 0,06 с, S2 → `already-open`, `port kept: false`.

Что сходится с заявлениями:
- **Переиспользованный pid.** Страница поднимается, и порт для черновика (I29) правда сохраняется (S2: тот же порт). «Already open» без
  страницы закрыт.
- **Полузаписанный свой замок** перечитывается: случай 7f и мутант M21.

Что опровергнуто или осталось:
1. **REFUTED — вторая страница поверх живой (S1).** Бриф спрашивал прямо, и ответ — да. Живая страница того же документа, не ответившая за
   `LIVENESS_TIMEOUT_MS` = 1,5 с (занятый цикл событий, машина под полигоном), объявляется упавшей. Новая страница пробует её порт, получает
   `EADDRINUSE`, встаёт на свежем порту и **перезаписывает замок живой страницы** (lock then: url новой страницы). Механизм виден по коду:
   - пульс первой страницы перепишет замок обратно (`writeLock` на каждом `/alive`), и замок начнёт «мигать» между двумя страницами;
   - та, что кончится первой, удалит общий замок (`rmSync` при выходе), и вторая останется без замка.

   Лог при этом неверен: «taken by another process … NOT visible here». На прошлой сборке здесь было «Already open». То есть правка обменяла
   одну ложь («Already open» без страницы) на вторую страницу того же документа, а этот обмен нигде не назван. I48, контракт и нота говорят
   «a page is live when it ANSWERS» без срока и без последствия. Путь редкий, но это ровно класс #169 «два окна разом».
2. **Расхождение двери и `--close` (S3).** Дверь считает такой замок пустым и поднимает страницу. `--close` без `--force` называет его
   «live page … pid 31904» и отказывает кодом 4, хотя должен сказать «nothing to close». `--force` убивает постороннего. Контракт называет
   только «`--wait` и `--close --force`». Отказ `--close` без силы — третье проявление, о нём не сказано. В I48 обоих слоёв `/owner-reviews`
   и в ноте 2.10 зазора нет вовсе: там стоит общее правило «a page is live only when it answers».
3. **Третье место живости по pid — `recoverFromWindow` (S4).** Этот путь запускается перед каждым показом, `--queue` и `--check`, если
   существует профиль окна проекта, то есть на любой полевой машине, где окно хоть раз открывалось. Он зовёт синхронный `checkLock` по
   ВСЕМ замкам, и отсюда два следствия:
   - (а) замок с переиспользованным pid считается живым, и ответ, сохранённый в окне, пока сервера не было, не подбирается (S4: «picked
     for recovery: false»);
   - (б) **нечитаемый замок чужой страницы удаляется** (S4: «still on disk: false»). Это происходит ДО `otherLivePage`, поэтому на поле
     правка TK7б «перечитай, никогда не удаляй» (M7) обходится: полузаписанный замок живой страницы B стёрт, и вторая страница встаёт.

   Окно гонки — микросекунды записи пульса, но заявление «never deleted» опровергнуто наблюдением (см. охоту 7).
4. **Мелочь.** После S2 лог говорит «its process 31904 is gone», а процесс жив: он посторонний. Строку стоит развести на «gone» и «a reused
   pid».

## Охота 3 — замок голоса: VERIFIED

`h3.mjs` — только `voiceBusy`/`whenVoiceFree`; мой `then` ничего не играет:
```
V1 broken file, fresh: BUSY(unreadable) · at 179 s: BUSY(unreadable) · at 181 s: free
V1b the same file 181 s old: whenVoiceFree took over = true · the lock now names us = true
V2 empty file, fresh: BUSY(unreadable) · at 181 s: free
V2b a waiter on the fresh empty file: still waiting = true · file kept = true
V2c after the file turns 181 s old: the waiter took = true
V3 broken file stamped +1 day: now BUSY(unreadable) · +23 h BUSY(unreadable) · +1 day +181 s free
V3b a waiter on it after 0.3 s: still waiting = true
V4 readable lock, live pid, at = +1 day: now BUSY (pre-TK7c rule, unchanged) · V4b gone pid: free
V6 body «null»: BUSY(unreadable) · V6b body «{}»: free
```
Битый файл навсегда держит голос ровно 3 × `VOICE_TIMEOUT_MS` = 180 с, затем его перехватывают (V1, V1b). Пустой файл упавшего процесса
между `wx` и записью ведёт себя так же: ждущий ждёт, файл не удаляется, через 180 с голос взят (V2–V2c). Зазор V1 судьи TK7б закрыт.

Остатки, не в заявлении:
- **Штамп из будущего (V3).** Файл с часами из будущего держит голос до штампа + 180 с. У `whenVoiceFree` нет своего потолка, поэтому
  `--call` (процесс ждёт таймером) может висеть сколько угодно. Читаемый замок с будущим `at` и живым pid держал так же и до TK7в (V4).
- **Гонка двух процессов по коду** (не наблюдалась, в одном процессе V5 — 1 из 2). При перехвате протухшего замка путь
  `voiceBusy → rmSync → take` не атомарен: ждущий B может удалить свежий замок A, взятый между его проверкой и `rmSync`. Окно — микросекунды.

## Охота 4 — речь: CAVEAT

`h4.mjs` — `speakable` на русском пакете, 43 фразы (лог — `j7c/h4.log`); дословная выборка:
```
"ø в начале: øresund" -> "о в начале: оресунд"        "Øresund и ØRESUND" -> "Оресунд и Оресунд"
"середина: Søren, Łódź" -> "середина: Сорен, Лодз"     "ŁÓDŹ капсом" -> "Эл-оу-ди-зед капсом"
"Straße STRASSE" -> "Страссе Страссе"                  "æble Æble ÆRØ" -> "аебле Аебле Аеро"
"Đorđe đak" -> "Дорде дак"   "þorn Þing" -> "торн Тинг"   "ıstanbul Istanbul" -> "истанбул Истанбул"   "œuvre" -> "оеувре"
"1,000,000" -> "один миллион"   "1.000.000" -> "один миллион"   "12,345,678" -> "двенадцать миллионов триста сорок пять тысяч шестьсот семьдесят восемь"
"1,000" -> "один ноль"   "1,5" -> "один пять"   "2.10" -> "два десять"   "v2.10.100" -> "в два десять сто"   "3,000.50" -> "три ноль пятьдесят"
"2026-10-23" -> "две тысячи двадцать шесть - десять - двадцать три"   "11:20" -> "одиннадцать: двадцать"
"1,2,3" -> "один два три"   "10,000,000,5" -> "десять ноль ноль пять"   "#165 1,000,000" -> "сто шестьдесят пять один миллион"
"Тикет #165 100%" -> "Тикет сто шестьдесят пять сто процентов"   "1,000,000,000" -> "один ноль ноль ноль ноль ноль ноль ноль ноль ноль"
```
Ни в одной из этих фраз нет латиницы, цифр, `undefined` или `NaN`.

Правило запятых и точек не склеивает соседние числа: «1,2,3», «10,000,000,5», «#165 1,000,000» дают раздельные числа. Склейка «#165 100%»
по-прежнему починена.

Остатки:
- **Свёртка — перечень из 14 букв, а не класс** (`h4b.mjs`):
  ```
  !! LATIN "ħħ" "Ħamrun ħobż (Maltese)" -> "ħамрун ħобз ( Малтесе )"
  !! LATIN "ŧƶƀǥɨʉ" "ŧ ƶ ƀ ǥ ɨ ʉ" -> "ŧ ƶ ƀ ǥ ɨ ʉ"
  !! LATIN "ðð" "Hafnarfjörður Ðorri" -> "Хафнарфджорðур ðорри"
  !! LATIN "ﬁﬂ" "ﬁnal ﬂow" -> "ﬁнал ﬂов"     !! LATIN "ĳĳ" "Ĳssel ĳs" -> "ĳссел ĳс"     !! LATIN "ŀŀ" "Ŀ ŀ" -> "ŀ ŀ"
  ```
  Нота обещает: «Latin transliterated (diacritics folded, and letters with a stroke or a ligature too)». Для `ħ ŧ ƀ ƶ` (буквы с чертой) и
  `ﬁ ﬂ ĳ` (лигатуры) это неверно, а `ð` — сестра свёрнутой `þ`. Класс закрыл бы NFKD (он берёт `ﬁ ĳ ŀ ǆ` и полноширинные) плюс последний
  проход, который снимает любую оставшуюся латиницу, а не дописанная таблица.
- «1,000,000,000» читается по цифрам: потолок `ruNumber` на миллиарде, правило запятых тут ни при чём (с пробелами было так же).
- Одна группа («1,000» → «один ноль», «100,000» → «сто ноль»), смешанные разделители («3,000.50») и «0,000,001» → «один» читаются неверно.
  Решение `[ИИ]` «одна группа — десятичная» записано в plans/137, но слух этих форм никто не проверял.

## Охота 5 — проба замера (TK6): CAVEAT

Счёт по записи сессии 91 (`t91.mjs`, `t91b.mjs`; печатаются только числа и id задач):
```
bash bg launched 8 · with a <task-id> notification 7 · stopped 1
  baucyrk3i launch#545 notif#- stop#687          (остальные семь — с уведомлением)
agentIds 1: a54915a65d5fdf6af at#1484 notif#1662,1667,1670
assistant stop_reason counts: {"tool_use":548,"end_turn":2}
end_turn #1966 · live background at that moment: 0 · end_turn #1967 · live background at that moment: 0
```
По всем 24 записям проекта статусы в `<task-notification>` такие: `<status>completed</status>` — 1288, `<status>failed</status>` — 39,
`killed` — 0. Оба вида несут `<task-id>`, и проба их видит.

Что верно:
- **Остановку считать отчётом правильно.** Критерий 20 — «ход кончился, пока агент ждёт фоновую задачу». Остановленную задачу агент не
  ждёт, даже если её процесс-потомок где-то дожил: проба судит ожидание агента, а не процессы.
- **Ноль сессии 91 — наблюдение реального случая.** Агент остановил задачу `baucyrk3i` (запись #687). Ход кончился ровно один раз, в конце
  записи (`end_turn` #1966/1967), и в этот момент ни одной живой фоновой задачи не было, включая фонового субагента. Независимый счёт по
  `stop_reason` сходится с пробой.

Где заявление шире:
1. **Судимый ход один.** Вся сессия 91 — один ход: открывающая запись `promptSource:sdk` одна, а 56 `queue-operation` в ход не делятся.
   Поэтому «критерий 20 по автономному прогону со сроком наблюдён: 0 ходов» — это ноль на одном конце хода. Plans/137 это честно пишет
   («вся сессия 91 — ОДИН ход»), но строка STATUS «замер критерия 20 по сессии 91 — 0» звучит шире.
2. **Не видимый пробе конец, точнее начало: фоновый субагент.** Проба знает запуск только по «running in background with ID» (Bash).
   Запуск `Agent` с `run_in_background` («Async agent launched … agentId: …») ей не виден, а именно так сессии зовут судью. Счёт `tall5.mjs`
   по 24 записям проекта:
   ```
   {"agentLaunchTurns":32,"turnsEndedWithOpenAgent":29,"ofThemNotFlaggedByProbe":26,"turnsWithMonitor":6}
   ```
   Здесь 26 ходов кончились при неотчитавшемся фоновом субагенте, и проба не назвала ни одного. Сколько из них — нарушение критерия 20, а
   сколько законное ожидание владельца, решает читатель. Но «перечисли все способы конца» (EXP-0192) применено только к концам, а не к
   видам запуска. Урок EXP-0192 стоит дополнить так: у фоновой задачи несколько видов не только конца, но и начала.
3. Смерть сессии записи не оставляет: такая задача для пробы живая. Это верно, ход и правда кончился при ней.

## Охота 6 — ослабленная проверка: VERIFIED

- **M4 и M14 получили второго адресата «TK7c #165».** Новый случай кормит движок латиницей, и под M4 (`if (false)`) он законно красен.
  Под M14 обоснование коммита неполно. Правка мутанта превращает `const w = w0.normalize('NFD')…` в `const w = w0, unused = …`, и цепочка
  `.replace(LATIN_FOLD_RE, …)` уходит в `unused` вместе с NFD. Значит, M14 гасит и NFD, и свёртку, а не только «ó ź». Краснеть случаю TK7c
  это законно, предикат TK7b прежний, ослабления нет.
- **M6** переписан на `if (await pageAnswers(lock)) return lock;` → `return lock;` в `otherLivePage`. Предикат прежний («живость только по
  pid» для чужой страницы). Свой ключ стережёт M20. Мутант по-прежнему краснит ровно «TK7b #169: a live pid that does not answer».
- **Прежние случаи не тронуты:** 159 имён прошлой сборки все есть в этой (охота 1).
- **T4s** стережёт заявленное: без строки остановки красен ровно он (`FAIL lacks «T4s»`), T1–T5 и счёт «turns judged: 5» те же.
  Ограничение синтетики: запуск T4s — голый `tool_result` без `tool_use`, как и у T4. Для пробы это неважно.

## Охота 7 — заявление шире наблюдения и поставка: REFUTED по одному пункту

**Добавленные строки** (`h7.mjs` по `git diff efb4614~1 efb4614`):
```
framework/tools/contour/review.mjs: added 70 · Cyrillic 0 · invisible 0 · non-ASCII Latin 6 · escaped Cyrillic 0
tools/sandbox/probes/tk1-wait-call-scan.mjs: added 5 · Cyrillic 0 · invisible 0
tools/sandbox/probes/tk7-contour-mutants.mjs: added 19 · Cyrillic 1 (прежняя итоговая строка с «вычитки», только переписана) · invisible 0
tools/sandbox/probes/tk7-one-page-door.mjs: added 10 · Cyrillic 0 · invisible 0
```
Новые строки контура написаны по-английски, невидимых символов и escape-кириллицы (`\u04xx`) нет. Литералы `ø ł ß æ œ đ þ ı` законны:
гард 5d (`tools/check-framework.mjs`, `CYR = /[А-Яа-яЁё]/`) судит только кириллицу. `dist/KAIF-CORE-BUNDLE.md` несёт новый код (6 вхождений
`LATIN_FOLD|liveOwnLock`).

**«Звонок слышен» как факт не звучит нигде.** Отчёт: «звук не играл (критерий 23 — его слово)», вердикт «partial». Замки поля названы
синтетикой («замки синтетические по форме полевых»). Оговорка прошлого судьи учтена.

**Маркеры `[TESTED]`** у `liveOwnLock` и `voiceBusy` называют отчёт `2026-10-23_tk7c-judge-caveats.md`. У правок `speakable` (`LATIN_FOLD`,
правило запятых) маркера нет, как не было у TK7/TK7б. У нового случая T4s в шапке пробы маркера тоже нет: там остался `[TESTED: 2026-10-18 …]`.
Это мелочь.

Шире наблюдения:
- **REFUTED** — «an unreadable lock is read again, another page's never deleted» (I48 `/owner-reviews` обоих слоёв, контракт §5, нота
  «the lock of another page never deleted»). `recoverFromWindow` удаляет нечитаемый замок чужой страницы (S4), а запускается он перед каждым
  показом на машине с профилем окна. До TK7в было так же, но TK7в переписал эту строку заново, и она по-прежнему шире кода.
- **CAVEAT** — «a page is live only when it answers at its lock's address — another document's and its own (a reused pid is no page: no
  refusal, no "Already open")». Это верно для двери. `--close` (и без `--force`), `--wait` и `recoverFromWindow` судят по pid. Контракт
  называет только `--wait` и `--close --force`. В I48 обоих слоёв и в ноте зазора нет. Цена «answers» (1,5 с — и вторая страница поверх
  медленной живой, охота 2) не названа нигде.
- **CAVEAT** — нота «letters with a stroke or a ligature too» шире перечня (охота 4).
- **CAVEAT** — «24 мутанта — каждый ровно на своих случаях» в момент коммита стояло на двух частичных прогонах (отчёт, прогоны 5 и 5а).
  Мой полный прогон его подтвердил.
- **CAVEAT** — STATUS «замер критерия 20 по сессии 91 — 0»: судимый ход один, фоновые субагенты пробе не видны (охота 5).

---

## Что починить (предложение судьи, не решение)

1. **Охота 2, S1.** Своему ключу нельзя без ответа становиться поверх. Если pid жив, а адрес молчит, проверить, держит ли кто-то порт
   замка. `EADDRINUSE` на `stalePort` при живом pid замка — это «Already open (the page does not answer)», а не свежий порт с перезаписью
   чужого замка. Нужны случай «живая страница отвечает через 2,5 с → нет второй страницы» и мутант.
2. **Охота 2, S4.** `recoverFromWindow` не должен удалять чужие замки. Ему нужно чтение без удаления (как `lockState` сторожа) и живость
   по ответу адреса. Случай: профиль есть, полузаписанный замок другой страницы → файл остаётся.
3. **Охота 2, S3.** `closeContour` должен судить своим `liveOwnLock`: замок с переиспользованным pid → «nothing to close (stale)», код 0,
   `--force` никого не убивает. Иначе назвать зазор в I48 обоих слоёв и в ноте, а не только в контракте.
4. **Охота 4.** Вместо таблицы: NFKD плюс замыкающий проход по остаточной `\p{Script=Latin}` вне ASCII. Случай на `ħ ð ﬁ ĳ ŧ`.
5. **Охота 5.** Проба должна считать запуском и «Async agent launched … agentId: (\w+)». Нужен случай синтетики. В EXP-0192 — «виды начала
   тоже».
6. **Мелочи:**
   - «its process N is gone» при переиспользованном pid;
   - потолок ожидания `whenVoiceFree` при штампе из будущего;
   - маркер `[TESTED]` для T4s и `speakable`.
