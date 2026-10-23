# Дайджест лёгкого судьи — шаг TK7 версии KAIF 2.10 (одна страница · живая очередь · звонок одним звуком)

**Судимо:** HEAD `329f860` (`fix(версия KAIF 2.10, эпик TK, шаг TK7 …`), не запушен · **Бриф:** `JUDGE_TK7_BRIEF.md` (эта папка) ·
**Судья:** Claude Opus 5.5, лёгкий судья, 2026-10-23 · **Режим:** в истоке только чтение (единственный созданный файл — этот); самопроверка
контура и все мои пробы — через `quietEnv()` скриптами-файлами в скретчпаде
`C:\Users\krinik\AppData\Local\Temp\claude\d--work-ai-sandbox-KAIF\c09b8ec7-6bc0-450e-9cf3-8877f85a3ef3\scratchpad\j\`
(`selftest.mjs`, `run.mjs`, `h2.mjs`, `h3.mjs`, `h4b.mjs`, `h5.mjs`, `h6.mjs`, `h8.mjs`); звук не играл, окон не было, `npm run test:core`,
`verify-contour`, `--play` не запускались. `git status` после всех прогонов — только прежние неотслеживаемые `assets/*.png`.

## Общий вердикт: **VERIFIED WITH CAVEATS**

Заявленные проверки критериев 21–22 переисполнены и сошлись: самопроверка 151/151, мутанты 5/5 (каждый краснит ровно свой случай), дверь на
этой сборке зелёная, на v2.9 красна ровно (1) и (3). Ложных заявлений нет: «звук не играл» и «слух владельца — не проверено» стоят честно,
критерий 23 не помечен ✅. Но новый код, который держит страницу очереди открытой, имеет подтверждённый пограничный дефект (охота 4 — REFUTED:
это новая находка, а не ложное заявление). Есть ещё зазоры класса в звонке, замке и `--timeout` — они ниже.

| # | Охота | Вердикт |
|---|---|---|
| 1 | Критерии 21–22: самопроверка, мутанты, дверь (эта сборка / v2.9) | **VERIFIED** |
| 2 | Обход отказа «одна страница» | **CAVEAT** |
| 3 | `--timeout` | **CAVEAT** |
| 4 | Страница очереди (#163) | **REFUTED** (пограничный путь — дефект нового кода) |
| 5 | Звонок (#165): `speakable`, WAV, деградации `signalCall` | **CAVEAT** |
| 6 | Ослабленная проверка | **VERIFIED** |
| 7 | Заявление шире наблюдения | **CAVEAT** (мелкий) |
| 8 | Поставка: символы, язык комментариев, `№`, нота | **VERIFIED** |

---

## Охота 1 — критерии 21–22: VERIFIED

**Самопроверка** (`node selftest.mjs` → `review.mjs --selftest` в `quietEnv({ KAIF_VOICE_TOOL: '' })`):
```
exit 0 secs 16
  v call door --dry-run: the phrase, what the engine would get and the sound's composition printed, no sound; one workspace — no session named (OW4, #95; TK7 #165)
  v TK7 #169: a live page of another document refuses this one — exit 3 «Another page is open … close it first», no page, no lock (I48)
  v TK7 #169, control: a lock of another document whose process is GONE does not block — the page rises (I48)
  v TK7 #169: --timeout on the owner's window refuses; with --no-open (automation), without a timeout and with --check it is legal (I48, I9)
  v TK7 #163: a notice read on the queue page records and the page STAYS while an interview on it has open questions; the showing names both documents
  v TK7 #165: the Russian engine gets no Latin and no digits — …
  v TK7 #165, control: a pack without spoken data (English) leaves the words as written
  v TK7 #165: the call is ONE file — 1000 ms of silence, three beeps at full level, the pause, then the voice already rendered
  v TK7 #165: a stereo voice is not glued in; …
contour selftest green: 151 checks (…)
```
**Мутанты** (`node tools/sandbox/probes/tk7-contour-mutants.mjs`):
```
OK  the Russian call says «ждёт ваших ответов», never «вычитки»: …
OK  control copy: 0 red line(s)
OK  M1 another live page does not refuse: 1 red line(s) (expected exactly «TK7 #169: a live page»)
OK  M2 --timeout on the window legal: 1 red line(s) (expected exactly «TK7 #169: --timeout»)
OK  M3 a notice read ends the queue page: 1 red line(s) (expected exactly «TK7 #163»)
OK  M4 Latin reaches the engine: 1 red line(s) (expected exactly «TK7 #165: the Russian engine»)
OK  M5 no lead silence: 2 red line(s) (expected exactly «TK7 #165: the call is ONE file» · «TK7 #165: a stereo voice»)
✅ each TK7 change is red on its own selftest case only; the control copy is silent; the Russian call has no «вычитки»
exit 0
```
**Дверь, эта сборка** (`node tools/sandbox/probes/tk7-one-page-door.mjs`):
```
OK  (1) live page of another document → exit 3, «Another page is open: http://127.0.0.1:1/ (interviews/interview_902_other.md, pid 31764) — one page at a time …», locks interview_902_other.lock
OK  (2) a lock of a process that is gone → the page rises (exit 2, «Outcome: the page has been silent longer than 0.015 min (two strikes) — ending t»)
OK  (3) --timeout on a page with a window → exit 3, refused before any page
exit HEAD 0
```
**Дверь, v2.9** (`git archive v2.9 framework/tools/contour | tar -x -C <scratch>/v29`; та же проба с этим каталогом; перед запуском
проверено, что v2.9 поднимает окно через `cmd.exe`/`powershell.exe` по PATH, которого в `quietEnv` нет; `KAIF_BROWSER` не задан):
```
BAD (1) live page of another document → exit 2, «…», locks interview_902_other.lock
OK  (2) a lock of a process that is gone → the page rises (…)
BAD (3) --timeout on a page with a window → exit 2, refused before any page
✖ 2 BAD
```
Заявление «v2.9 — BAD ровно (1) и (3)» подтверждено.

## Охота 2 — обход отказа: CAVEAT

Проба `h2.mjs` (функция `otherLivePage` напрямую и `serveContour` с `open:false, signal:false`):
```
A2 live other lock -> "interviews/interview_902.md"
A3 own key excluded (only own live lock present) -> null
A4 lock WITHOUT pid -> null
A5 pid 4 (System, other user) kill(4,0)=EPERM; otherLivePage pid -> 4
A6 broken JSON (half-written lock of a LIVE page) -> null
A6b broken lock file still on disk after the check -> false
A7 dead pid -> null
A7b dead lock kept on disk -> true
A8 live _queue lock vs doc page -> "_queue"
A10 live doc lock vs queue page -> "interviews/interview_903.md"
B1 interview -> outcome=other-open exit=3 pageUp=false | Another page is open: …
B2 queue (--queue) -> outcome=other-open exit=3 pageUp=false | …
B3 --notice -> outcome=other-open exit=3 pageUp=false | …
B4 --proofread -> outcome=other-open exit=3 pageUp=false | …
B5 --mockup -> outcome=other-open exit=3 pageUp=false | …
B6 same doc, own live lock (I29) -> outcome=already-open exit=0 pageUp=false | Already open by this contour: http://127.0.0.1:3/ …
B7 different doc with SAME basename as a live lock -> outcome=already-open exit=0 pageUp=false | Already open by this contour: http://127.0.0.1:4/ …
C1 two documents raised in the same tick -> A up=true, B up=true, B refused=false, locks now: interview_901_a.lock,interview_902_b.lock
```
Сходится: все грани (`--queue`, `--notice`, `--proofread`, `--mockup`) и страница очереди против страницы документа отказывают; законный путь
«тот же документ → Already open» (I29) не сломан (B6); мёртвый замок не мешает и остаётся на диске (A7, A7b); чужой пользователь (EPERM)
блокирует (A5) — так и задумано.

Зазоры:
1. **Гонка (C1):** два документа, поднятые в одно мгновение, встают оба — замок пишется только при `listen`. Полевой автор назвал этот зазор
   (#165, последний комментарий), он записан в `bugs/133` («Fix plan»). Но в I48, в контракте §5 и в ноте его нет: правило звучит как
   абсолютное.
2. **Битый JSON (A6/A6b):** `otherLivePage` → `checkLock` **удаляет** нечитаемый замок ДРУГОЙ страницы. До TK7 `checkLock` трогал только
   свой ключ. Живая страница переписывает замок на каждом пульсе (`writeFileSync` — запись не атомарная). Если чтение попадёт в момент
   записи, вторая страница сотрёт замок живой первой и поднимется рядом с ней. Окно маленькое, но поведение расходится с правилом
   `waitForRecord`: «a waiter must never delete what the server may be writing».
3. **Без `pid` (A4):** такой замок не блокирует, хотя `waitForRecord` считает его живым («no pid counts as live»). Две разные трактовки
   одного файла.
4. **Повторное использование PID (ВЫВОД ПО КОДУ, на поле не наблюдалось):** замок упавшей страницы по I29 хранится намеренно. Если его `pid`
   займёт посторонний живой процесс (на Windows PID переиспользуются), до TK7 блокировался только тот же документ, а теперь — все страницы
   проекта. Подсказка в отказе ведёт к `--close`. Без `--force` тот отвечает «pid NOT killed» с кодом 4, а с `--force` убьёт ПОСТОРОННИЙ
   процесс. Проверять жизнь лучше запросом `/alive` по `url` замка, а не по pid.
5. B7 (одинаковое `basename` в разных папках → чужой документ «Already open») появилось до TK7 (ключ I29), в TK7 его не трогали — отмечаю
   для полноты.
6. Подсказка при живой странице очереди печатает `node .kaif/tools/contour/review.mjs _queue --close` вместо канонического `--queue --close`.
   Работает случайно: `basename('_queue')`.

## Охота 3 — `--timeout`: CAVEAT

Проба `h3.mjs` (настоящий CLI во временном проекте, `quietEnv`):
```
[… --timeout 5] -> exit 3 | ✖ --timeout raises the owner's window on a timer — refused before any page, sound or call (…)
[… --timeout 0] -> exit 3 | ✖ --timeout raises the owner's window on a timer — …
[… --silent --timeout 5] -> exit 3 | ✖ …
[… --no-open --timeout 1 --silent] -> exit 2 | Page is up: http://127.0.0.1:52518/ (Interview #901 — probe)
[… --no-serve --timeout 5] -> exit 0 | Render written: …\.kaif\.contour-tmp\interview_901_probe.html
[… --check --timeout 5] -> exit 0 | check: interviews/interview_901_probe.md — blocks 1, recognised 1: Q1
[--queue --list --timeout 5] -> exit 3 | ✖ --timeout raises the owner's window on a timer — …
[--queue --timeout 5] -> exit 3 | ✖ …
[--call probe text --dry-run --timeout 5] -> exit 3 | ✖ --timeout raises the owner's window on a timer — …
[--wait interviews/interview_901_probe.md --timeout 5] -> exit 3 | ✖ …
[--selftest --timeout 5] -> exit 3 | ✖ …
[interviews/interview_901_probe.md --close --timeout 5] -> exit 3 | ✖ …
```
Окно на таймере отказывает — верно; с `--no-open`, `--no-serve` и `--check` всё законно. Но отказ шире заявленного «на странице с окном».
`--queue --list`, `--call --dry-run`, `--wait`, `--selftest` и `--close` с `--timeout` окна не поднимают, а получают код 3 со строкой
«raises the owner's window», и это неправда. `--timeout 0` контракт сам называет значением по умолчанию («Patience is infinite by default
(`--timeout 0`)»), а он тоже отказывает. Сломанной автоматики нет: `grep -rn -- "--timeout" tools/ framework/ .claude/` находит только
`s22-contour-shipped.mjs` (`--no-open --silent --timeout 1` — законно), пробы TK7 и текст канона.

## Охота 4 — страница очереди (#163): REFUTED (пограничный путь)

Подтверждено:
- Окно сообщения после «прочитано» закрывается, а список остаётся. Карточка на странице очереди открывается отдельным окном
  (`href="/d/…" target="_blank"`), после сохранения клиент вызывает `window.close()` у этого окна. Сервер жив — случай самопроверки «TK7 #163»
  и мутант M3.
- Факт показа при `open:false` не пишется (`if (open) { … queueShownDocs … recordShown }`). Это совпадает с 2.9 и с I40 («в момент открытого
  окна»). Сам вызов `queueShownDocs` в `serveContour` наблюдением не проверен: путь `open:true` в песочнице недостижим, а случай проверяет
  чистую функцию.

**Дефект 1 — страница ждёт вопросов, которых на ней нет** (`h2.mjs`, блок D). В очереди одно сообщение, в `interviews/` лежит старое интервью
(> 14 дней, I39) с открытым вопросом. Страница его не показывает:
```
D0 pendingDocs=["interviews/interview_950_old.md:1"] ownerDocs(page)=[]
D1 notice read on a queue page whose ONLY visible item was that notice -> HTTP 200, ended after 5 s=false, cards on the page now=0
    log: Recorded: notice read (notes/n.md, by owner). Documents with questions left: 1, unread notices: 0 — the page STAYS open, the contour waits (#163).
D2 after the window closed -> {"outcome":"page closed without an answer","exit":2}
```
Причина: `restQ = pendingDocs(root)…` считает ВСЕ ждущие документы, в том числе скрытые как старые, а не то, что показано (`forOwner()` =
`ownerDocs`). Комментарий кода обещает «while any document **on it**». В итоге страница пустая (0 карточек), агенту сказано «the page STAYS
open», и контур кончается только закрытием окна — с ложным исходом «page closed without an answer», хотя сообщение прочитано. Тот же
`pendingDocs` стоит и в прежней ветке ответа (`rest`), но в ветку «прочитано» его перенёс TK7.

**Дефект 2 — зеркало #163, класс не закрыт** (`h4b.mjs`): на странице очереди интервью с одним вопросом и непрочитанное сообщение. Владелец
отвечает на последний вопрос:
```
M1 answer to the LAST question on the queue page with an UNREAD notice on it -> HTTP 200 {"ok":true,…,"more":0,…,"left":0,…
   pending notices after: ["notes/n.md"] · contour ended within 5 s: {"outcome":"decision recorded","exit":0}
   log: Outcome: decision recorded (interviews/interview_960_probe.md: Q1 = A, by owner) — ending the contour (I8).
```
Контур кончается, а непрочитанное сообщение остаётся на странице, у которой умер сервер. Это тот же класс «владелец остался на мёртвой
странице» (#163), только порядок действий обратный. Формулировка критерия 22 («после последнего — код 0») это допускает, но правка закрыла
инцидент, а не класс (память владельца: «Fix the class, not the incident»).

Пути «вопросы есть, а окна нет — страница не кончится НИКОГДА» не нашлось: без клиента её гасит вахта тишины («two strikes»; в D2 —
закрытием окна).

## Охота 5 — звонок (#165): CAVEAT

**`speakable` на 20 фразах** (`h5.mjs`, русский пакет; дословно, выборка):
```
"Николай, это dev2. Интервью #010 ждёт ваших ответов." -> "Николай, это дев два. Интервью десять ждёт ваших ответов."
"KAIF 2.10 готов к релизу 2026-10-23 в 08:43" -> "Кей-эй-ай-эф два десять готов к релизу две тысячи двадцать шесть - десять - двадцать три в восемь: сорок три"
"Загрузка 80%, затем 1% и 2%" -> "Загрузка восемьдесят процентов, затем один процентов и два процентов"
"Тикет #165 и №169 закрыты" -> "Тикет сто шестьдесят пять и сто шестьдесят девять закрыты"
"KAIFа хватит; API и UI готовы" -> "Кей-эй-ай-эф а хватит; эй пи ай и ю ай готовы"
"Цена 1 000 000 рублей или 1000000, или 999999" -> "Цена один ноль ноль рублей или один ноль ноль ноль ноль ноль ноль, или девятьсот девяносто девять тысяч девятьсот девяносто девять"
"café naïve résumé Zürich" -> "каф é на ï ве р é сум é Зед ü рич"   !! LATIN:é,ï,é,é,ü
"Отчёт: TESTED — 151/151; гейт 5h" -> "Отчёт: Тестед — сто пятьдесят один / сто пятьдесят один; гейт пять х"
"" -> ""   ·   "Hello, World? Yes!" -> "Хелло, Ворлд? Иес!"
ru phrases with flags: 1
en "Owner, KAIF: interview #010 waits." -> "Owner, KAIF: interview 010 waits."
ru-only-#-diff-in-en: only #/№ changed = true,true
```
В основном работает: `undefined` нет, пунктуация цела, в английском пакете меняется только `#`/`№`. Зазоры:
- латиница с диакритикой проходит в движок (`é ï ü`), а слово рвётся на части с побуквенным «Зед»;
- кириллическое окончание после латиницы отрывается пробелом («Кей-эй-ай-эф а»);
- падеж при процентах не согласован («один процентов»);
- число с пробелами-разделителями читается неверно («1 000 000» → «один ноль ноль»);
- десятичная или версионная точка пропадает («2.10» → «два десять», «4.6» → «четыре шесть»).
Для фраз звонка (имя, проект, заголовок) это редкие случаи, но заявление «в движке нет латиницы» не абсолютно.

**WAV** (дословно):
```
WAV header {"riff":"RIFF","riffSize":163442,"total":163450,"fmt":1,"ch":1,"rate":22050,"byteRate":44100,"align":2,"bits":16,"dataSize":163406} riffSize==total-8: true dataSize==total-44: true byteRate==rate*2: true
pcmOfWav: pcm16 mono -> true | stereo -> null | float32 (tag 3) -> null | 8-bit -> null | EXTENSIBLE 16-bit mono (tag 0xFFFE) -> null
pcmOfWav with odd LIST chunk before data -> pcm bytes 163406 expected 163406
pcmOfWav data size 0 -> pcm bytes 0 | data size 0xFFFFFFFF -> pcm bytes 163406
truncated to 20 bytes -> THROWS ERR_OUT_OF_RANGE
truncated to 30 bytes -> THROWS ERR_OUT_OF_RANGE
truncated to 44 bytes -> {"pcm":{"type":"Buffer","data":[]},"rate":22050}
```
Заголовок верный; стерео, float и 8 бит не склеиваются (EXTENSIBLE тоже — уходит в запасной путь).
- **`pcmOfWav` бросает `RangeError`** на файле, обрезанном внутри блока `fmt `. Вызывается она без `try` внутри обработчика `exit` дочернего
  процесса (`signalCall`: `pcmOfWav(readFileSync(voiceFile))` и `pcmOfWav(readFileSync(toolFile))`). В `review.mjs` нет обработчика
  `uncaughtException` (grep — 0), поэтому исключение роняет процесс сервера страницы. Это нарушает I32 («the signal never drops the
  contour»). Нужен голосовой инструмент, который завершился с кодом 0 и оставил обрезанный WAV (например, при переполненном диске). Вывод
  по коду, процесс не роняли: звук запускать нельзя.
- Если в WAV `data size 0`, у `v` пустой `pcm`, а `v` истинно. Тогда играют одни писки без голоса и без строки I36 в журнале.

**Деградации `signalCall`** (по коду, звук НЕ запускался):
- SAPI вернул код 3 (нет голоса этой культуры) → строка I35 + файл «тишина · писки» — владелец слышит писки;
- PowerShell не найден → строка I36 + `play` → снова ошибка → «the call sound could not be played … the banner did the call (I36)»;
- инструмент не знает `--out` или пишет не 16 бит / не моно → строка «#165», потом файл писков, потом `--play` инструмента — ожидание синтеза
  после писков возвращается для таких инструментов (это названо в журнале и в `callShape`);
- **новое:** писки теперь ждут конца рендера голоса. Если рендер повиснет, на 60 с (`VOICE_TIMEOUT_MS`) `exit` придёт с `code === null`,
  писки сыграют через минуту, а строки в журнале не будет;
- macOS и Linux — прежний путь (звонок терминала, потом голос). Нота и I33 не говорят, что «один файл» — только на Windows.

**Рендер на настоящих движках** (`node tools/tk7-call-render.mjs`, без `--play`):
```
OK  speakable (ru): Кей-эй-ай-эф: интервиев десять ваиц; Вулкан анд Блендер два десять, лоад восемьдесят процентов
OK  system voice → 22050 Hz, 8.90 s of voice, glued
OK   rich tool (eugene) with --out → 48000 Hz, 5.22 s of voice — glued into ONE file
OK  call file: 1.00 s of silence, beep peak -1.3 dBFS, total 8.88 s (voice 5.22 s)
exit 0
```
Совпадает с отчётом, строка (5). Пробный зов в истоке (`--call "KAIF: интервью #010 ждёт" --dry-run`, `quietEnv`):
`spoken: Криник, Кей-эй-ай-эф: интервью десять ждёт` · `sound: ONE file: 1.0 s silence · beeps 880/660/990 Hz … · 2.0 s pause · the system voice, rendered before playing`.

## Охота 6 — ослабленная проверка: VERIFIED

`h6.mjs` — самопроверка HEAD~1 (`git archive HEAD~1`) против HEAD, оба в `quietEnv`:
```
HEAD~1: exit 0, 143 cases | contour selftest green: 143 checks (…)
HEAD  : exit 0, 151 cases | contour selftest green: 151 checks (…)
cases of HEAD~1 missing (by exact name) in HEAD: 1
  - call door --dry-run: the phrase and the banner line printed, no sound; one workspace — no session named (OW4, #95)
cases new in HEAD: 9
  + call door --dry-run: the phrase, what the engine would get and the sound's composition printed, … (OW4, #95; TK7 #165)
  + … восемь случаев TK7 …
```
Пропал только прежний случай «call door --dry-run», и он переименован с усилением: `dl[0]` проверяется тем же выражением, к нему добавлены
проверки двух новых строк (`spoken:`, `sound:`). Длину вывода «1 → 3» диктует новый вывод — обоснование верное. Порог «≥ 1 с» взят из
поля: в #165, комментарий 1, дословно «the file now opens with 1 s of silence (… the beeps were cut at 0.6 s)». Пары таблицы близнецов
в `check-framework.mjs` изменены только счётом инвариантов (`I1–I47` → `I1–I48`) и шестью новыми парами, ослабления нет.
`check-framework` в `quietEnv`: `✅ check-framework OK — 59 embedded files …` (гард 5f пропущен: в `quietEnv` нет `git`, к TK7 это не
относится).

## Охота 7 — заявление шире наблюдения: CAVEAT (мелкий)

Честно:
- в отчёте «звук в прогонах не играл», «услышан ли звонок целиком — слово владельца … НЕ проверено», вердикт «partial»;
- `bugs/134`: «DONE — после слова владельца, что звонок слышен целиком (класс «вкус»; звук в прогонах не играл)»;
- `bugs/132` и `bugs/133` — «🔧 fix pending verification»;
- в `plans/136` критерии 21–23 не помечены ✅ (файл в коммите не менялся), в STATUS «TK7 сделан» стоит рядом с «критерий 23 — слово
  владельца».

Шире наблюдения:
- **Заголовок ноты 2.10** (`tools/build-framework.mjs`, уходит в развёртывания) — «ONE PAGE AND ONE VOICE AT A TIME, **AND A CALL HEARD
  WHOLE**». Это результат, который подтвердит только слух владельца. Текст под заголовком точен, сам заголовок — нет.
- «One voice at a time» (I48, нота) обеспечено только через одну страницу. Дверь `--call` (`callDoor → signalCall`) замок не проверяет,
  поэтому `--call` при живой странице или два `--call` из двух сессий дают два голоса разом.
- Критерий 23 требует фразу «ждёт **твоих** ответов», поставлено «ждёт **ваших** ответов». Отклонение записано решением `[ИИ]` №3 в
  `plans/137` («пересматривается его словом»), это не скрыто, но критерий как написан не исполнен буквально.

## Охота 8 — поставка: VERIFIED

`h8.mjs` — символы строк, добавленных коммитом в `framework/tools/contour/*.mjs`:
```
framework/tools/contour/review.mjs: added lines 285 · Cyrillic lines 0 · control/invisible 0 · literal № 0
   non-ASCII: — U+2014×48  · U+00B7×20  ≈ U+2248×2  − U+2212×2  » U+00BB×4  « U+00AB×4  ✖ U+2716×1  § U+00A7×1  … U+2026×1
framework/tools/contour/texts.mjs: added lines 47 · Cyrillic lines 21 · control/invisible 0 · literal № 0
review.mjs @HEAD: literal № count = 0 · escape \u2116 count = 2 · Cyrillic chars = 0
```
Новые комментарии `review.mjs` написаны по-английски, кириллица — только в `texts.mjs`; невидимых и управляющих символов нет; `№` — escape
`\u2116`. Нота по пунктам верна: отказ кодом 3 и мёртвый замок; отказ `--timeout` у окна (на деле отказ шире — охота 3); страница очереди
на «прочитано»; показ по каждому документу; один звук с `--out` и `KAIF_VOICE_BEEPS=embedded`; слова русского пакета; «ждёт ваших
ответов». Не сказано, что «один файл» — только на Windows (охота 5).

---

## Что починить до релиза 2.10 (предложение судьи, не решение)

1. **Охота 4, дефект 1:** считать `restQ` (и `rest` ветки ответа) по показанному, то есть `forOwner()` / `ownerDocs(root, { includeStale })`,
   а не по `pendingDocs`. Нужен случай самопроверки со старым скрытым интервью и мутант.
2. **Охота 4, дефект 2:** в ветке ответа на странице очереди держать страницу, пока на ней есть непрочитанное сообщение (`pendingNotices`).
   Это закроет класс #163, а не один инцидент.
3. **`pcmOfWav`:** проверять границы буфера (или `try`) и в обработчиках `exit` считать пустой `pcm` отсутствием голоса (строка I36).
4. **`otherLivePage`:** не удалять чужой нечитаемый замок (считать его живым, как `waitForRecord`), проверять жизнь запросом `/alive` по
   `url` замка, а не по pid, и назвать гонку «в одну секунду» в I48 / контракте.
5. **`timeoutRefusal`:** отказывать только при показе страницы (а не при `--list`, `--call`, `--wait`, `--close`, `--selftest`) и пропускать
   `--timeout 0`.
6. Мелочи: заголовок ноты без «HEARD WHOLE» как факта; диакритика в `translit`; согласование «процент/процента/процентов».
