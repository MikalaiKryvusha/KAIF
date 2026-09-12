# План 108 — эпик IW «Контур — окном и с живым черновиком»: порт из протухшего замка, самопроверка окна, готовая команда запуска

> **Создан:** 2026-09-12 23:43 +03:00 (сессия 63 — нулёвка IW0 сразу после закрытия CL; канон N+1, №43).
> **Родитель:** `plans/100` (эпик IW — строка 11 таблицы эпиков; критерий приёмки версии 16); источник — issue #64
> (NDim; слово владельца проекта в тикете дословно: «Второе - запускают интерактивный контур в основном браузере
> пользователя, а не в СТРОГО ВЫДЕЛЕННОМ ОТДЕЛЬНОМ ОКНЕ БРАУЗЕРА, как предписывают правила интерактивного контура!» ·
> цена: «закрывалсь страница, а я писал ответ прямо в этот момент»); разбор — `researches/30` §2г; слово владельца о
> скоупе — №115.
> **Статус:** ✅ **ЗАКРЫТ 2026-09-13 02:16 +03:00** (сессия 63) — принят к исполнению 2026-09-12 23:43 +03:00; IW0 ✅ 23:43 ·
> IW1 ✅ 23:49 · IW2 ✅ 23:52 · IW3 ✅ 23:51 · IW4 ✅ 23:53 · IW5 ✅ 23:55 · IW6 ✅ 02:16 (суд REFUTED → починки → повторный суд
> VERIFIED WITH CAVEATS → сверка VERIFIED); критерий 16 `plans/100` ✅; инцидент эпика — `bugs/116` (S1).
> **Вовне:** поставка — генератор контура `.kaif/tools/contour/review.mjs` (порт из протухшего замка · самопроверка окна
> `display-mode` · строка лога) и `texts.mjs`; `/owner-reviews` обоих слоёв (готовая команда запуска по агентским
> системам под I31); контракт `.kaif/INTERACTIVE_CONTOUR_SPEC.md` §5; `KAIF_REFERENCE`; охота `/fable-judge`; записи 2.7
> сборщика; черновик ответа #64.

## Вектор цели (Achieve)

**Боль** (#64 дословно; `researches/30` §2г). Инварианты I26 · I29 · I31 контура написаны верно и полно, и генератор их
исполняет — но между правилом и исполнением нет машины: агент NDim нарушил три подряд и не встретил ни одного красного.
(1) Запустил контур в переднем плане с `--timeout` → процесс умер по таймауту оболочки, окно закрылось вместе с ним
(I31). (2) Запустил второй раз → новый порт → новый web-origin → черновик первого окна невидим (I29 — канон предупреждает
дословно, и это не защита). (3) `Start-Process 'http://127.0.0.1:…'` → страница открылась ВКЛАДКОЙ в рабочем Chrome
владельца (I26). Цена — ответ на четыре вопроса, потерянный целиком. Отгружаемый генератор 2.6 несёт ту же слабость:
замок держится на живом pid (`process.kill(lock.pid, 0)` — умер → замок снят → `listen(0)` → новый порт), черновик в
`localStorage` привязан к origin, страница не знает, вкладка она или окно, а I31 в навыке — проза без команды.

**Где хотим оказаться.** Генератор при перезапуске того же документа ПРЕДПОЧИТАЕТ порт из замка умершего процесса:
свободен → тот же origin, черновик восстанавливается сам (без серверного хранения — Оккам); занят → свежий порт и
предупреждение поимённо, что черновик прежнего окна здесь невидим. Страница сама проверяет, окно она или вкладка
(`matchMedia('(display-mode: standalone)')` — правда снята с Chrome, ниже), во вкладке показывает владельцу жёлтую
полосу «это вкладка, черновик живёт только здесь, не закрывайте до записи» и сообщает серверу — строка в логе агента.
`/owner-reviews` обоих слоёв несёт под I31 ГОТОВУЮ команду запуска по агентским системам (фоновая, отслеживаемая),
а не абзац. Всё это доказано ассертами `s22` на развёрнутой копии и живым браузером `verify-contour` (вкладка →
полоса видна; окно `--app` → полосы нет). `/fable-judge` охотится на контур, поднятый мимо своего окна.

**Метрика эпика:** критерий 16 `plans/100` закрыт **1 из 1** (2026-09-13 02:16 +03:00).

## Готово, когда (критерии приёмки — сценариями; якорь `plans/100` критерий 16)

1. **[IW — тот же порт после смерти процесса]**
   - Ситуация. Контур показывал владельцу интервью на `http://127.0.0.1:59352/`; владелец набрал ответ в поле, не
     записал; процесс контура умер (таймаут оболочки, `kill`, падение чата); в `interviews/decisions/<док>.lock`
     остался замок с мёртвым pid и этим адресом.
   - Действие. Агент запускает `node .kaif/tools/contour/review.mjs interviews/<док>.md` снова.
   - Результат. Лог: `Port 59352 reused from the previous run (its process … is gone)` — тот же web-origin, черновик
     того окна восстанавливается при загрузке (I29/I12) — и `Page is up: http://127.0.0.1:59352/`; владелец видит
     «Подхвачен черновик: N полей восстановлено». Если порт занят чужим процессом — `Port 59352 of the previous run is
     taken … a draft written in the previous window is NOT visible here (I29) …` и свежий порт.
   - Проверка. `s22`: замок с мёртвым pid на свободном порту → «reused» + `Page is up` на том же порту; замок на занятом
     порту → «taken» + `NOT visible`; на ядре 2.6 (`KAIF_DIST`) — оба ассерта красные (проба IW0: «relaunch came up on:
     59353», без слова о черновике).

2. **[IW — страница знает, что она вкладка]**
   - Ситуация. Агент открыл адрес контура не окном `--app=`, а `Start-Process`/`open <url>` — страница легла вкладкой в
     рабочий браузер владельца.
   - Действие. Владелец смотрит на страницу; сервер контура пишет лог.
   - Результат. Над документом жёлтая полоса: «Эта страница открылась ВКЛАДКОЙ, а не окном контура — черновик живёт
     только в этой вкладке; не закрывайте её до записи. Агент предупреждён (I26)»; лог агента: `Window check: the page
     reports it is NOT in an app window (display-mode: browser) — a tab (I26) …`. В окне `--app=` полосы нет и строки нет.
   - Проверка. `verify-contour` headless-блок (страница открыта ВКЛАДКОЙ по построению — `Target.createTarget`) →
     `#tabnote` видима с текстом; QA2 `--visible` (окно `--app`) → `#tabnote` скрыта; `s22`: рендер несёт
     `display-mode: standalone`, `id="tabnote"` и `/tab`; правда детектора — проба IW0 (ниже).

3. **[IW — команда запуска готова, не пересказана]**
   - Ситуация. Агент проекта на Claude Code читает `/owner-reviews`, чтобы поднять страницу.
   - Действие. Копирует команду из таблицы под I31.
   - Результат. Таблица даёт по строке на систему: Claude Code — `Bash` с `run_in_background: true` и командой
     `node .kaif/tools/contour/review.mjs <док>`; харнесс с фоновыми задачами — его фоновый/отслеживаемый режим той же
     командой; голый шелл — `node … > .kaif/contour.log 2>&1 &` + опрос замка `interviews/decisions/<док>.lock` (исчез
     или его pid не работает = процесс завершился, исход — в логе; уточнено по суду 2026-09-13 — «Проверка» та же);
     строка-правило: `--timeout` — только автоматике (I9), человеку — никогда.
   - Проверка. Грепы `run_in_background` и `contour.log` в `/owner-reviews` обоих слоёв — пары `check-framework`;
     контракт §5 называет порт прежнего запуска и самопроверку окна (≤ 120 строк — ассерт `s22`); охота судьи «Contour
     raised outside its window (KAIF 2.7)» в обеих копиях.

4. **[судья эпика]** — лёгкий `/fable-judge` по критериям 1–3; на закрытии — нулёвка SD0 (`plans/109`, N+1), веха в
   `plans/100` (строка 11, критерий 16 ✅ — закрыто 13 из 17).

## Шаги

- [x] **IW0 — нулёвка актуализации входов ✅ 2026-09-12 23:43 +03:00 (сессия 63).** Входы сверены против HEAD `3fc04a2`:
      #64 по телу (`gh issue view`), документ NDim `bugs/KAIF/14` (читать, не править); генератор: `openWindow` `:770–787`
      (`--app=` со своим `--user-data-dir` — I26 машиной), `lockPath`/`checkLock` `:790–796` (`process.kill(lock.pid, 0)`
      → протухший замок УДАЛЯЕТСЯ), `serveContour` `:799` — `held` → «Already open … (I29)» `:826–830`, `server.listen(0)`
      `:952`, запись замка `:955`, `finish` снимает замок `:943`; черновик — `draftKey: 'owner-review:' + <док>` `:596`,
      `saveDraft`/`restoreDraft` `:667–674` (localStorage → origin → порт); страница — `#banner` (красная, аварийная)
      `:659`, самопроверка радиогрупп `:744–746`; `texts.mjs` `st` EN `:93–101` / RU `:174–182`; навык `/owner-reviews`
      I25–I31 EN `:172–192` / RU `:170–189`, T6 EN `:496` / RU `:488`; контракт §5 `:80–84` (118 строк из 120);
      `KAIF_REFERENCE:111`; `s22` — `runGen` через `execFileSync` (`--timeout 1` завершает прогон сам, DEF5), рендер
      `--no-serve` в `.kaif/.contour-tmp/`; `verify-contour` — headless-блок цепляет страницу ВКЛАДКОЙ
      (`Target.createTarget`, `:275–280`), QA2 `--visible` — окном `--app` `:1034–1039`.
      **Проба ДО кода 1 — замок и порт** (скретчпад `iw0-probe-lock.mjs`, 2026-09-12 23:42 +03:00, генератор истока на
      временном проекте): замок с pid 999999 на свободном порту 59352 → перезапуск `--no-open --silent --timeout 1` →
      **`Page is up: http://127.0.0.1:59353/`** (новый порт, ни слова о черновике); замок на ЗАНЯТОМ порту 59395 → порт
      59396, «warned about the draft: false» → **❌ RED**.
      **Проба ДО кода 2 — правда о детекторе окна** (скретчпад `iw0-probe-window.mjs`, 23:41 +03:00; Chrome
      `C:/Program Files/Google/Chrome/Application/chrome.exe`, одноразовый профиль, четыре режима, сигналы сняты через CDP
      `Runtime.evaluate`):
      | Режим | `display-mode: standalone` | `display-mode: browser` | `locationbar.visible` | `outerH − innerH` |
      |---|---|---|---|---|
      | A `--app=<url>` (окно контура) | **true** | false | true | 39 |
      | B `<url>` (вкладка) | **false** | true | true | 95 |
      | C `--headless=new --app=` | true | false | true | 39 |
      | D `--headless=new <url>` | false | true | true | 95 |
      Вывод: `matchMedia('(display-mode: standalone)')` различает окно и вкладку в обоих режимах (и в headless — значит
      `verify-contour` не сломается); `window.locationbar.visible` бесполезен (везде `true`); разность высот — прокси,
      зависящий от темы/ОС — не берём.
      `INTENT: code does <протухший замок удаляется и порт берётся заново; страница не знает, окно она или вкладка;
      I31 — абзац>; the failing check/task expects <тот же порт после смерти процесса или предупреждение · полоса и строка
      лога во вкладке · готовая команда — plans/100 критерий 16>; the spec says <I26 «never a tab», I29 «the port is part
      of the web origin», I31 «TRACKED background task»; #64: «замок должен пережить смерть процесса, а не сниматься ею» ·
      «скилл должен запускать контур правильно, а не советовать» · «черновик обязан пережить смену порта»>` — сходятся;
      расхождение X/Y и есть дыра тикета.
      `FORK: options <A порт из протухшего замка — тот же origin, черновик восстанавливается сам | B черновик на сервер
      по каждому изменению (`POST /draft`, файл под `interviews/decisions/`) | C фиксированный «якорный» порт контура>
      · price of error <потеря набранного ответа владельца — уже оплачено дважды за четыре дня> · consulted <тикет #64
      (три кандидата названы автором); I30 (фиксированный порт: живой старый сервер молча выигрывает гонку, `curl` 200 на
      устаревшей странице — оплачено полем); web-платформа: origin = схема+хост+порт (RFC 6454), localStorage
      привязан к origin — черновик переживает смену порта только вместе с портом; проверка на реальном Chrome — проба 1>`
      → **DECIDED [AI]: A** — меньше всего движущихся частей: ни серверного хранилища, ни нового формата, ни гонки
      старого сервера (порт берётся ТОЛЬКО если процесс замка мёртв и порт свободен; занят → свежий порт + предупреждение
      поимённо). B — второе хранилище черновика с собственной синхронизацией и утечкой текста владельца на диск в
      открытом виде; C отвергнут I30 прямо.
- [x] **IW1 — генератор: порт из протухшего замка ✅ 2026-09-12 23:49 +03:00** (проба IW0 после фикса — «same port reused;
      taken port → warning»; EPERM читается как «жив»). Прежняя формулировка: `checkLock` возвращает замок с флагом `stale` вместо удаления
      (EPERM = процесс жив); `serveContour`: живой замок → «Already open» как прежде; протухший → `listen(<порт замка>)`,
      на `EADDRINUSE` → `listen(0)` + строка «taken … NOT visible»; успех → строка «reused … restored on load»; замок
      перезаписывается живым pid. Лог — английский, как соседние строки процесса.
- [x] **IW2 — страница: самопроверка окна ✅ 2026-09-12 23:52 +03:00** (живой браузер: вкладка → полоса ×4, окно `--app` →
      скрыта). Прежняя формулировка: Элемент `#tabnote` (жёлтая полоса, не красный `#banner` — кнопки не
      выключает); скрипт: `!matchMedia('(display-mode: standalone)').matches` → показать полосу с текстом `TX.tabnote`
      (EN/RU в `texts.mjs`) и `POST /tab`; сервер на `/tab` пишет одну строку лога `Window check: … NOT in an app window
      (display-mode: browser) — a tab (I26) …` (один раз на страницу).
- [x] **IW3 — навык и контракт ✅ 2026-09-12 23:51 +03:00** (контракт ужат до трёх строк §5 — 120 по `wc`, 121 по счёту свода
      было красным). Прежняя формулировка: `/owner-reviews` обоих слоёв: под I31 — таблица готовых команд запуска по системам +
      строка о `--timeout`; T6 обоих слоёв — порт прежнего запуска. Контракт §5 — одна строка о порте прежнего запуска и
      самопроверке окна (≤ 120 строк). `KAIF_REFERENCE:111` — строка генератора.
- [x] **IW4 — своды и живой браузер ✅ 2026-09-12 23:53 +03:00** (`s22` +3, красные на 2.6; `verify-contour` 194/0 headless и
      4/0 visible). Прежняя формулировка: `s22`: три ассерта (замок на свободном порту → тот же порт + «reused»; замок на
      занятом → «taken» + «NOT visible»; рендер несёт `display-mode: standalone` · `id="tabnote"` · `'/tab'`), контракт
      ≤ 120 строк — прежний ассерт; `verify-contour`: headless-блок — `#tabnote` видима (вкладка по построению), QA2
      `--visible` — скрыта в окне `--app`. Красное — `KAIF_DIST` 2.6.
- [x] **IW5 — судья, пары, записи, сборка, полигон, отчёт прогона ✅ 2026-09-12 23:55 +03:00** (отчёт
      `testcases/reports/2026-09-12_polygon-2.7-IW.md`; полигон — строка 13 отчёта по завершении фонового прогона; судья — IW6).
      Прежняя формулировка: Охота «Contour raised outside its window (KAIF 2.7)»
      в обеих копиях `/fable-judge`; пары `check-framework` (навык оба слоя · генератор · контракт · судья);
      `TEMPLATE_NOTES['2.7']` + `POLICY_CHANGES['2.7']`; сборка → counters → полигон; отчёт прогона
      `testcases/reports/2026-09-12_polygon-2.7-IW.md` (две строки; функциональный прогон — живой браузер
      `verify-contour`: вкладка и окно, полоса ПРОЧИТАНА через CDP); черновик ответа #64 — ниже.
- [x] **IW6 — закрытие ✅ 2026-09-13 02:16 +03:00.** Судья чистым контекстом без единого окна (≈ 01:19 → 01:37) — по IW:
      IW-1 и IW-3 VERIFIED, IW-2 — серверная половина самопроверки не наблюдалась; каверзы IW — строка опроса замка могла
      висеть, черновик ответа #64 цитировал ненаблюдённую строку и называл свои ассерты «тремя строками приёмки один в
      один», вердикт отчёта называл снятую находку, форензика `bugs/116` без пятого показа. Починено до коммита: два ассерта
      `s22` серверной половины (красный — мутант бандла), строка опроса «исчез или pid не работает» в обоих слоях, ответ #64
      по наблюдению, отчёт IW, `bugs/116` (EXP-0126, причина 5). Повторный суд (≈ 02:03) — VERIFIED WITH CAVEATS, сверка
      каверз (≈ 02:16) — VERIFIED. `plans/100` строка 11 и критерий 16 ✅; эпики IW и SD закрыты одним коммитом — метрика
      версии «закрыто 14 из 17»; STATUS п. 0 → нулёвка CB0 (`plans/95`); MASTER_PLAN §5/§8; уроки — EXP-0132, EXP-0133.

## Верификация наблюдением

- Пробы IW0 (скретчпад) после фикса — зелёные: «same port reused; taken port → warning».
- `node tools/sandbox/s22-contour-shipped.mjs` зелёный; `KAIF_DIST=<dist 2.6>` — новые ассерты красные, свод доходит до
  вердикта. По суду (2026-09-13 ≈ 01:37: серверная половина самопроверки окна не наблюдалась — `verify-contour` глушит лог)
  дописаны два ассерта `s22` без браузера: клиент шлёт `POST /tab` → ровно одна строка `Window check:`, контрольный запуск без
  POST → ни одной; красный — мутант бандла с переименованной строкой лога (краснеет ровно этот ассерт).
- `node tools/verify-contour.mjs` (headless, живой браузер) — полоса вкладки видна; `node tools/verify-contour.mjs
  --visible` — в окне `--app` полосы нет; `--etalon-only` зелёный.
- `node tools/build-framework.mjs` (пары IW зелёные) · `counters-guard` · `npm run test:core`.

## Риски (ярусы Мёрфи)

- **(а) Порт прежнего запуска занят живым ЧУЖИМ сервером — и это старый контур, которого `process.kill(pid, 0)` не
  видит** (другой пользователь, EPERM). Защита: EPERM читается как «жив» → «Already open», порт не трогаем; только
  ESRCH — протухший.
- **(а) Порт занят чужим процессом** — свежий порт и предупреждение поимённо; черновик прежнего окна не трогаем и не
  обещаем.
- **(б) `display-mode` в чужом браузере** (Firefox/Safari без `--app`) — полоса покажется и там, где окно «просто
  отдельное», но не app: текст полосы говорит про черновик и «не закрывайте до записи» — это правда в любом окне;
  ложного красного нет, есть лишняя подсказка.
- **(б) Headless-блок `verify-contour` теперь всегда «вкладка»** — полоса видна в каждом прогоне; ассерт ожидает её
  явно, консоль остаётся чистой (полоса — не ошибка).
- **(в) Бюджет контракта** — 118 из 120 строк: правка одной строкой на месте, не абзацем.

## Черновик ответа в #64 (отправка после релиза 2.7 — №84/№92/№93)

Shipped in KAIF 2.7 (epic IW). You narrowed the finding correctly — the rules were right, and nothing stood between a
rule and the hand that typed the command — so what shipped is the machine, in the three places you named.

**1. The lock outlives the process.** `.kaif/tools/contour/review.mjs` no longer deletes a lock whose process is dead;
it reads the PORT out of it and comes up there first: `Port 59352 reused from the previous run (its process … is gone)
— same web origin, so a draft written in that window is restored on load (I29/I12)`. The owner sees "Draft picked up:
N field(s) restored". If that port is taken by something else, a fresh port follows AND the loss is named:
`Port 59352 of the previous run is taken by another process — … a draft written in the previous window is NOT
visible here (I29): open that window if it is still there, or copy the text from it`. Never a silent fresh port.
Before writing a line of code I fed the old generator a dead lock on a free port: it came up on the next port and
said nothing about the draft — exactly your second row.

**2. The page knows whether it is a tab.** Measured on Chrome in four modes (`--app`, a plain tab, both headless):
`matchMedia('(display-mode: standalone)')` is true only inside the `--app=` window; `locationbar.visible` is true
everywhere and useless. So the page checks it itself: in a tab it shows the owner a yellow note — "This page opened
as a TAB in a browser, not in the contour's own window — your draft lives in this tab only: do not close it until you
have saved. The agent has been told (I26)" — and POSTs once to the server, whose log says `Window check: the page
reports it is NOT in an app window (display-mode: browser) — it opened as a TAB … do not raise a second window, let
the owner finish there`. The red banner stays for real emergencies; the note is yellow and blocks nothing.

**3. The skill ships the launch, not the advice.** Under I31 in `/owner-reviews` (both layers) there is now a table —
one row per agent system — that the agent copies: Claude Code → the Bash tool with `run_in_background: true`; a
harness with tracked tasks → its facility; a plain shell → redirect to `.kaif/contour.log` and poll the lock file (gone,
or its pid no longer running — a killed process leaves the lock on purpose, so the next run gets its port).
`--timeout` is for automation only; the URL is never handed to `Start-Process` / `open` / `xdg-open`. The contract page
§5 names the previous port and the tab check; `/fable-judge` hunts "a contour raised outside its window".

**On your third candidate** (write the draft to the server): not taken, on purpose — a second store of the owner's text
with its own sync, on disk in the clear. The same-port relaunch restores the same `localStorage` with zero new parts.

Proof: suite `s22` on the deployed copy — dead lock on a free port → the same port + "reused"; dead lock on a taken
port → a fresh port + "taken … NOT visible here"; the rendered page carries the check; a client's `POST /tab` → exactly
one `Window check:` line in the log, and none without it; red on the 2.6 core via `KAIF_DIST` (the log line — on a
mutant with that line renamed). `verify-contour` in a live browser: the headless block attaches the page as a TAB by
construction (`Target.createTarget`) and reads the note shown — 4/4 (two themes × two widths); the visible `--app` run
reads it hidden. Against your acceptance list: (1) a relaunch after a dead process → the s22 "reused" and "taken"
asserts above; (2) a ready background, tracked launch command → the table under I31, held in both layers by a pair
check; (3) a second launch while the first process lives still answers "Already open … (I29)" — unchanged by this epic
and not re-proven here; (4) is yours.

Thank you — "the page was closing while I was typing" is the sentence that made the lock keep the port.

## Инцидент эпика — окна и голос у владельца из красных прогонов (`bugs/116`, S1)

Красное доказательство IW4 (прогон 11 отчёта, 23:54) гоняло `s22` против ядра 2.6; генератор 2.6 не знает `--check` и
`--mark-implemented` и на них показал владельцу тестовую страницу «fresh · Interview #052 — проба» с голосовым зовом — как и
красное доказательство CL в 22:57 и оба судьи (23:09, 00:09). Первая редакция «Найдено» отчёта приписала окна Unliminium и
видимым пробам — ошибка, исправлена. Судья IW дважды остановлен до завершения (второй раз — по слову владельца «Стоп все твои
работы!»). Починено до коммита: генератор из песочницы — только `env: quietEnv()`, преполёт полигона `@guard
sandbox-quiet-child`; старый генератор в тихом окружении — «NO WINDOW OPENED», звук не стартует; полигон «all 26 suites green».
Суд (2026-09-13 ≈ 01:37) нашёл пятый показ той же страницы — утром 09:34, сессия 59, записанный тогда же уроком EXP-0126 и
не вспомненный вечером: класс «свод гоняет генератор, отстающий от свода» был известен за тринадцать часов до ночи
(`bugs/116`, причина 5; корень поставки — `ideas/30` п. 15).

## Решения, принятые агентом без владельца

1. **[AI] Носитель живого черновика — ПОРТ прежнего запуска, не серверное хранилище** (`FORK:` в IW0): тот же origin
   возвращает `localStorage` без единой новой сущности; серверный черновик — второе хранилище с синхронизацией и текстом
   владельца на диске; фиксированный порт отвергнут I30.
2. **[AI] Детектор окна — `matchMedia('(display-mode: standalone)')`**, снят пробой с Chrome в четырёх режимах;
   `locationbar.visible` отвергнут наблюдением (везде `true`), разность высот — прокси от темы и ОС.
3. **[AI] Полоса вкладки — отдельный жёлтый элемент, не красный `#banner`:** вкладка — не авария (ответ уйдёт), это
   предупреждение о черновике и автозакрытии; кнопки не выключаются.
4. **[AI] Серверная половина самопроверки проверяется в `s22` клиентом без браузера, а не снятием глушителя лога в
   `verify-contour`** (по суду): свод уже поднимает генератор в тихом окружении, один `POST /tab` и контрольный запуск без
   него судят ровно строку лога, а живой браузер остаётся для полосы на странице — у каждой половины свой наблюдатель.
5. **[AI] Строка опроса замка — «исчез или его pid не работает»** (по суду): замок убитого процесса намеренно остаётся ради
   прежнего порта (решение 1), поэтому одно «исчез» подвешивало голый шелл ровно в сценарии #64.

## Links

`plans/100` (критерий 16, строка 11) · issue #64 · `researches/30` §2г · `plans/107` (CL — образец) · `plans/93` (IC —
генератор поставкой) · `framework/tools/contour/review.mjs` · `tools/sandbox/s22-contour-shipped.mjs` ·
`tools/verify-contour.mjs` · `plans/109` (SD — следующий, N+1).
