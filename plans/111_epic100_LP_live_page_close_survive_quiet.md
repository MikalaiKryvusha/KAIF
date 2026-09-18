# План 111 — эпик LP «Живая страница: закрыть можно только проверенной командой · ответ переживает смерть сервера · тестовая страница не зовёт»

> **Создан:** 2026-09-18 ≈ 00:40 +03:00 (сессия 65, Fable 5.1 — по слову владельца №120; исполняется после RS и CR,
> `plans/100` § «Решения» 9).
> **Родитель:** `plans/100` (эпик LP — строка 13; критерии приёмки версии 18–20). Источники: issue #66 (Unliminium,
> 2026-09-13 00:06 +03:00; слово владельца проекта дословно в тикете: «закрылся контур и я не дал на него ответы, а я
> ПИСАЛ В ЭТОТ МОМЕНТ»; разбор — `researches/30` §2д) · интервью №032 Q2 = D ([OWNER] чат 2026-09-13 ≈ 10:49 +03:00,
> дословно: «никакого выбора, никакого "сохранить" Все внешне для юзера работает так, как и работало! JS сам пишет файл
> на компьютер в папку проекта!»; устройство — `researches/31` §4, пробы §3/§3а) · `ideas/30` п. 15 (корень `bugs/116`;
> в 2.7 — решение `[ИИ]` сессии 65 под словом №118). Место в версии — №118 (интервью №032 Q1 = A).
> **Статус:** ✅ закрыт 2026-09-18 10:08 +03:00 (сессия 66, Fable 5.1): LP0 08:46 · LP1–LP4 ≈ 08:52–09:07 · LP5 09:16 (живой прогон №2) ·
> суд эпика ≈ 09:40 — VERIFIED WITH CAVEATS, два блокера и три дефекта кода → починки 09:47–10:04 → живой прогон №3 10:05 ·
> критерии 18–20 `plans/100` ✅. Прежний статус — «план написан; старт — нулёвка LP0 (после CR)».
> **Вовне:** поставка — генератор контура `framework/tools/contour/review.mjs` + `core.mjs`, спецификация
> `.kaif/INTERACTIVE_CONTOUR_SPEC.md`, `/owner-reviews` обоих слоёв (новые инварианты), `AGENT_GUIDE` обоих слоёв («Показ
> — это действие»), ignore-first набор машинерии, `sandbox-suite` истока, охота судьи, черновик ответа #66.

## Вектор цели (Achieve)

**Боль.** (а) Агент может закрыть страницу, в которой владелец пишет ответ, — по слову соседней сессии, без проверки: ни
команды закрытия, ни правила, кто и после какой проверки вправе гасить окно силой; заголовок окна с именем проекта (2.6)
и черновик на прежнем порте (2.7 IW) уже в поставке — третьей защиты нет ни у поставки, ни у шести инструментов на диске
(`researches/30` §2д). (б) Если сервер страницы погас, ответ не записывается никуда — страница показывает красную полосу и
«скопировать текст» (`researches/31` §1); слово владельца: всё внешне работает как работало, а файл на компьютер пишет
сам JS. (в) Старый генератор на незнакомый флаг поднимает страницу и зовёт владельца голосом; полигон на несвежем `dist`
стартует (`bugs/116`, EXP-0126/EXP-0132 — класс механизирован у истока тихим окружением, а в поставке корень остался).

**Где хотим оказаться.** Критерии 18–20 `plans/100`: живую страницу владельца закрывает только команда, которая печатает
порт · PID · заголовок и отказывает при свежем вводе или незаписанном черновике (слово соседа — не улика); ответ
переживает смерть сервера — профиль окна в папке проекта, запись на каждый ввод, безоконный забор агентом при следующем
взгляде на очередь, без единого диалога у владельца; генератор отвергает незнакомый флаг до страницы, полигон отказывает
на несвежем `dist`.

**Метрика эпика:** критерии 18–20 `plans/100` закрыты **0 из 3**.

## Готово, когда (критерии приёмки)

Сценарии — дословно критерии **18, 19, 20** `plans/100` (один факт в одном месте); нулёвка LP0 вправе уточнить строки
«Результат»/«Проверка» под HEAD дня с обоснованием в этом плане.

## Шаги

- [x] **LP0 — нулёвка актуализации входов ✅ 2026-09-18 08:46 +03:00 (сессия 66, Fable 5.1; HEAD `bc3673d`).** Входы сверены:
      `review.mjs` 1360 строк — константы `:52–79` (`ALIVE_INTERVAL_MS` 15 с, `SILENCE_THRESHOLD_MS` 180 с, коды `EXIT_DECIDED 0 ·
      EXIT_CLOSED 2 · EXIT_INTERRUPTED 130 · EXIT_PREFLIGHT 3`), замок `lockPath`/`checkLock` `:800–815` (`{pid,url,startedAt}`,
      `stale` при мёртвом pid — IW), `/alive` `:867–870` (только `lastAlive`), запись замка при `listening` `:994`, `openWindow`
      `:780–798` (`cmd /c start msedge --app=… --window-size=…` — БЕЗ профиля: окно живёт в профиле владельца по умолчанию),
      JS страницы `:660–760` (`saveDraft`/`restoreDraft` в `localStorage` под `DK`; `doSave` → `fetch('/decide')`, `.catch` → только
      кольцо спасения; `pulse` → баннер «сервер недоступен» + кольцо), `main()` `:1255–1360` (`usage()` → код 1; флаги не
      валидируются — незнакомый флаг МОЛЧА проходит к показу); `core.mjs` `recordDecision` `:394–458` (`by`, `prov`-комментарий,
      три записи); `texts.mjs` `st`/`wb` обоих языков (`:62`, `:93`, `:144`, `:175`); спецификация — §2 предполёт, §3 записи, §4
      страница, §5 процесс, §7 лица и флаги; `/owner-reviews` — I29–I31 (`:184–192` EN, `:181–190` RU), последний инвариант I45
      (`:311`); `AGENT_GUIDE` «Показ — это действие» (`:1109` RU, `:1022` EN); `s22` — `runGen` с `quietEnv()`, замок мёртвого pid
      на свободном/занятом порту (`:118–133`), клиент `POST /tab`; `sandbox-suite.mjs` — преполёты (temp-root · тавтологии · немые
      команды · маркеры · `@guard sandbox-quiet-child` `:225`), гейта свежести `dist` НЕТ (`grep "dist is stale\|sourceTree"` → 0 в
      сюите и сборщике); `build-framework.mjs` — манифест `:556–568` (`sha256` двух артефактов, `assets`); `ensureIgnoreFirst`
      `KAIF-CORE.mjs:300–316`; ядро и загрузчик на незнакомый флаг — ОТКАЗ кодом 1 (`die`, правило bugs/33: `KAIF-CORE.mjs:3634`,
      `KAIF-LOADER.mjs:58`); пробы `probes/contour-answer-survives/` (Edge по абсолютному пути `C:/Program Files (x86)/…/msedge.exe`
      — есть; `/c/Program Files/Google/Chrome/…/chrome.exe` — есть; три флага против входа в учётку — EXP-0134; CDP через
      `DevToolsActivePort` — образец `visible.mjs`); `researches/31` §4 — устройство принято словом владельца Q2 = D (профиль в
      проекте · запись на каждый ввод · безоконный забор на протухшем замке); `verify-contour --etalon-only` — 70 зелёных.
      `INTENT: code does <генератор: замок без момента ввода, окно в профиле владельца по умолчанию, ответ при мёртвом сервере —
      только кольцо «скопируйте», незнакомый флаг проходит к показу; полигон стартует на несвежем dist>; the failing check/task
      expects <критерии 18–20: --close с отказом при свежем вводе, профиль в папке проекта + запись на ввод + забор, отказ на
      незнакомый флаг ДО страницы, отказ полигона на несвежем dist>; the spec says <#66 «закрылся контур, а я ПИСАЛ В ЭТОТ МОМЕНТ»
      · Q2 = D «JS сам пишет файл на компьютер в папку проекта» · bugs/116 корень в поставке · спецификация §5 «one document — one
      window» без правила закрытия>` — сходятся.
      **Пробы ДО кода (скретчпад `lp0-probe.mjs`, тихое окружение, копия текущего `dist`, 08:44 +03:00):** (1) `--close <док>` на
      генераторе HEAD → страница ПОДНЯТА («Page is up», `CALL: … Страница открыта», голос — «engine not installed»), код 2 по
      вахте тишины — флаг молча проигнорирован, в реальном окружении это окно и зов у владельца ❌; (2) `--wat` → то же ❌; (3)
      порядок `--close <док>` / `<док> --close` — одинаково ❌; (4) гейта свежести `dist` нет — грепом (см. выше) ❌; (5) смерть
      сервера после ввода: по коду — черновик остаётся в `localStorage` профиля владельца ПО УМОЛЧАНИЮ (IW восстановит на том же
      порту), нажатое «Записать» при мёртвом сервере — только кольцо «скопируйте текст» (`:721`), в папке проекта — ничего;
      забора агентом нет ❌ (класс #66 — по чтению кода и пробам `researches/31` §3, 66 из 66 знаков побайтно).
      `FORK: options <порог тишины закрытия: 180 с (= DEF6, порог вахты тишины) | 60 с | 300 с> · price of error <короче —
      закроем печатающего владельца (#66 ровно это); длиннее — агент ждёт лишние минуты, окно живёт> · consulted <DEF6 «3 min
      (background tabs throttle)» — тот же порог, которым страница сама считается мёртвой; тикет #66; параметр contour.closeQuietMs
      в kaif.json — переопределение владельцем>` → **DECIDED [ИИ]: 180 с, параметр `contour.closeQuietMs`.**
      `FORK: options <код отказа на незнакомый флаг: 2 (как в критерии 20) | 1 (как ядро и загрузчик, bugs/33) | 64 EX_USAGE> ·
      price of error <2 совпадает с EXIT_CLOSED «страница закрыта без ответа» той же команды — вызывающий по коду не отличит отказ
      от закрытия> · consulted <KAIF-CORE.mjs:3634 и KAIF-LOADER.mjs:58 — отказ через die() кодом 1; sysexits(3) EX_USAGE=64 —
      конвенция BSD, в KAIF не используется>` → **DECIDED [ИИ]: код 1, как ядро; строка «Проверка» критерия 20 уточнена «код 2» →
      «код 1» с этим обоснованием (правило 7 сценарной формы — правка «Проверки» с обоснованием).**
      `FORK: options <место профиля окна: <проект>/.kaif/contour-window/ (слово владельца Q2 = D — «в папку проекта») | OS temp |
      профиль владельца по умолчанию (как сейчас)> · consulted <интервью №032 Q2 = D дословно; researches/31 §4 п. 1; EXP-0134 —
      новый профиль Edge входит в учётку ОС без трёх флагов>` → **DECIDED: `.kaif/contour-window/` (ignore-first), три флага,
      проверка `account_info` после запуска.** Забор — headless-запуск того же профиля на том же порту при протухшем замке,
      ТОЛЬКО когда каталог профиля существует (в песочнице его нет → поведение сводов не меняется, браузер не поднимается);
      очередь-пачка (`_queue`) — без забора (черновик пачки живёт под ключом заголовка), названо вслух.
      Прежняя формулировка: **LP0 — нулёвка актуализации входов.** Сверить против HEAD: `framework/tools/contour/review.mjs` (пульс `/alive`,
      `ALIVE_INTERVAL_MS`, форма замка, `saveDraft`/`restoreDraft`, предпочтение порта из протухшего замка — IW, строка
      `Window: …`), `core.mjs` (`projectName`, пути), `framework/templates/_interactive-contour-spec.md` (статьи §2–§4),
      `/owner-reviews` обоих слоёв (I14 · I26 · I29 · I31 · I40–I44), `AGENT_GUIDE` обоих слоёв («Показ — это действие»),
      `tools/sandbox/s22-contour-shipped.mjs`, `tools/verify-contour.mjs` (эталон), `tools/sandbox-suite.mjs` (преполёты,
      `quietEnv()`), пробы `tools/sandbox/probes/contour-answer-survives/` (`headless.mjs`, `visible.mjs`, `signin.mjs`),
      `researches/31` §4 (устройство), ignore-first набор в `KAIF-CORE.mjs`, EXP-0126 / EXP-0132 / EXP-0134, `bugs/116`.
      **Пробы ДО кода (тихое окружение, копия из `dist`):** (1) `review.mjs --close <док>` на генераторе HEAD → незнакомый
      флаг: что печатает и поднимает ли страницу (в `quietEnv()` — без окна и звука); (2) сервер убит через 0,5 с после
      ввода → ответ утерян; (3) `sandbox-suite` с подменённым sha бандла → стартует. Все три ожидаются RED. `INTENT:` и
      `FORK:` (порог тишины закрытия · место профиля · способ забора) — в этот пункт.
- [x] **LP1 — пульс и замок ✅ 2026-09-18 ≈ 08:52 +03:00** (`review.mjs`: `/alive?i=<мс с последнего ввода>&d=<полей черновика>&s=<записано>`, замок несёт `pid · url · startedAt (снят ОДИН раз) · doc · title · lastInputAt · draftFields · saved` и переписывается каждым пульсом; первое нажатие после паузы пульсирует в течение секунды — дыра, найденная живым прогоном 09:10; спецификация §4). Прежняя формулировка: **LP1 — пульс и замок.** Страница шлёт в `/alive` момент последнего ввода и флаг «черновик записан»; сервер держит их в
      замке рядом с портом и PID (`lastInputAt`, `draftSaved`); статья спецификации.
- [x] **LP2 — `--close <док>` ✅ 2026-09-18 ≈ 08:55 +03:00** (`closeContour`: порт · pid · заголовок → отказ кодом 4 при вводе моложе порога, при странице моложе порога (правило добавлено после живого прогона 09:10) и при незаписанном черновике; `--force` только с `--owner-word`, цитата в лог; замок сохраняется при незаписанном черновике; `process.exitCode`, не `exit()` — конвейер stdout на Windows асинхронный; /owner-reviews I46 обоих слоёв, спецификация §5 и §7, «Показ — это действие» обоих слоёв). Прежняя формулировка: **LP2 — `--close <док>`.** Печатает порт · PID · заголовок окна («сверь с тем, на что жалуются»); отказывает кодом 4 с
      фразой «last input N s ago — the owner is typing; not closed», пока `now − lastInputAt < CLOSE_QUIET_MS` (значение —
      `FORK:` LP0, кандидат 180 с) или черновик не записан; иначе гасит процесс по PID замка и печатает «closed <док>»;
      `--force` — только с `--owner-word "<цитата>"` (цитата печатается в лог); статья спецификации; строка `/owner-reviews`
      обоих слоёв (новый инвариант: «a live owner page is closed only by `--close`; a neighbour session's word is not
      evidence — check the port and the PID») и «Показ — это действие» обоих слоёв.
- [x] **LP3 — ответ переживает смерть сервера ✅ 2026-09-18 ≈ 09:00 +03:00** (профиль `.kaif/contour-window/` в ignore-first ядра и `.gitignore` истока, три флага, проверка `account_info` с тремя попытками; страница: «Записать» при мёртвом сервере → `localStorage` `__submitted`, строка «сохранён на этом компьютере», кнопка погашена, кольцо спасения — только без localStorage; забор `recoverFromWindow` при `--queue --list` / `--check` / показе: только при существующем профиле, только протухший замок, headless по абсолютному пути на том же порту, запись `recovered: true` + комментарий провенанса «забран с компьютера владельца», замок снимается; пауза 6 с перед убийством headless — чтобы очистка ключей дошла до диска; `_queue` — без забора, вслух; /owner-reviews I47, спецификация §3/§4; `tools/lib/cdp-mini.mjs` для сводов). Прежняя формулировка: **LP3 — ответ переживает смерть сервера (устройство `researches/31` §4 по слову Q2 = D).** Окно поднимается на
      профиле `<проект>/.kaif/contour-window/` (строка в ignore-first наборе машинерии ДО первого запуска) с флагами
      `--disable-features=msImplicitSignin,msEdgeSyncConsent,msEdgeFirstSyncOnFirstRun` и проверкой `account_info` в
      `Preferences` после запуска (строка лога); страница пишет ответ в IndexedDB на каждый ввод; при погасшем сервере —
      фраза «сервер недоступен — ответ сохранён на этом компьютере» (без диалогов); забор: `--queue --list`, показ и
      `--check` при протухшем замке поднимают сервер на том же порте безоконно (`--headless=new`, тот же профиль), страница
      отдаёт сохранённое, ответ вносится в документ и три записи, агенту печатается «answer recovered from the owner's
      machine», владельцу — строка «ответ забран с вашего компьютера»; Chrome/macOS/Linux — не обещать: названы
      непроверенными в README генератора и отчёте прогона.
- [x] **LP4 — тестовая страница не зовёт ✅ 2026-09-18 ≈ 09:03 +03:00** (генератор: `KNOWN_FLAGS`, незнакомый флаг → «✖ unknown flag» и код 1 ДО страницы, звука и зова — код как у ядра и загрузчика, bugs/33; полигон: `tools/lib/source-tree-sha.mjs` — один отпечаток `framework/**` + сборщик + `module-map-lib` + `version.json`, сборщик пишет его в `kaif-manifest.json` → `sourceTree`, `sandbox-suite` перед первым сводом отказывает «dist is stale — rebuild» (шов `KAIF_DIST` — исключение по построению), `@guard sandbox-dist-fresh` при функции, `--selftest`; наблюдено красным на реальном дереве: файл-проба под `framework/` без пересборки → отказ до первого свода, файл убран → зелёный). Прежняя формулировка: **LP4 — тестовая страница не зовёт.** Генератор: незнакомый флаг → usage и код 2 ДО сервера, окна и зова (правило
      `bugs/33` ядра — теперь и у генератора); `sandbox-suite`: перед списком сводов — sha `dist/KAIF-CORE-BUNDLE.md` против
      сборки из `framework/` (дешёвая половина — `build-framework.mjs --hash` или хэш дерева `framework/` в манифесте `dist`;
      выбор — `FORK:` LP0) → отказ «dist is stale — rebuild: node tools/build-framework.mjs» без единого свода; блок `@guard
      sandbox-dist-fresh`.
- [x] **LP5 — своды, красные и живой прогон ✅ 2026-09-18 09:16 +03:00** (`s22` раздел D — 20 ассертов: незнакомый флаг · `--close` без замка · отказ при вводе 2 с · отказ у страницы моложе порога · отказ при незаписанном черновике · `--force` без слова · закрытие · настоящий генератор с пульсом · headless-страница на профиле проекта: ввод → сервер убит → «Записать» → локальная запись → штатное закрытие → `--queue --list` забрал, `recovered: true`, текст побайтно; на 2.6 (`KAIF_DIST` из `git show v2.6`) — 9 ассертов D красные; мутанты на копиях `dist`: «порог 0» (до параметра сводов) — ровно два ассерта о печатающем владельце; `verify-contour` headless — 198 зелёных, QA7 переписан под новое поведение (кольца нет, локальная запись); **живой прогон на пути владельца** — объявленное окно Edge «KAIF (проба LP)» на профиле проекта, реальный лаунчер, `--close` страницы моложе порога → отказ, `--force --owner-word` → закрыто; второе окно: ввод настоящими событиями (`Input.insertText`), `--close` → отказ «last input 1 s ago», сервер убит, «Записать» → «сохранён на этом компьютере», штатное закрытие, `--queue --list` → «answer recovered from the owner's machine», `decision.json` с `recovered: true`, текст побайтно, `account_info: no`; четыре снимка экрана прочитаны; отчёт `testcases/reports/2026-09-18_contour-close-survive.md`). Прежняя формулировка: **LP5 — своды, красные и живой прогон.** `s22`: отказ при свежем вводе · закрытие при старом · порт/PID/заголовок ·
      сервер убит → безоконный забор → побайтно · незнакомый флаг → код 2 без `Page is up`/`CALL:`; красные на `KAIF_DIST`
      2.6 и на мутантах (предикат тишины сломан; забор отключён); `verify-contour` в живом браузере, эталон пересмотрен
      глазами (`--write-etalon`); **функциональный прогон на пути владельца** — видимое окно Edge, объявленное в чате до
      запуска, ввод настоящими событиями, окно убито силой, ответ забран, снимок экрана прочитан; отчёт прогона
      `testcases/reports/<дата>_contour-close-survive.md` с двумя строками.
- [x] **LP6 ✅ 2026-09-18 10:08 +03:00** (черновик ответа ниже — переписан под окончательное устройство; интервью №032 Q2 → `--mark-implemented` записано в `interviews/decisions/implemented.json`; запись `TEMPLATE_NOTES['2.7']` и `POLICY_CHANGES` сборщика; фраза `KAIF_REFERENCE`). Прежняя формулировка: **LP6 — черновик ответа #66; интервью №032 Q2 → `node tools/review.mjs --mark-implemented <док> Q2 --where
      <коммит>`;** записи 2.7 сборщика (`TEMPLATE_NOTES` — новая команда и профиль в ignore; `POLICY_CHANGES` — незнакомый
      флаг генератора теперь отказ, забор ответа с машины владельца); `KAIF_REFERENCE`.
- [x] **LP7 ✅ 2026-09-18 10:08 +03:00** (судья эпика субагентом без окон и звука ≈ 09:25–09:40 — VERIFIED WITH CAVEATS: Б1 критерий 20 «код 2» → переписан с прежней формулировкой, Б2 эталон QA7 и I11 навыка обоих слоёв → новый контракт, Н1–Н18 — по месту; три дефекта кода, найденные судьёй: убийство pid из файла → закрытие просит сам сервер; ответ только в `localStorage` → IndexedDB первым; забор при открытом окне → откладывается; всё переисполнено: `s22` 75 ✅, мутанты 2 · 6 · 4 ❌, `verify-contour` 198/0, полигон 26/26, живой прогон №3). Прежняя формулировка: **LP7 — закрытие.** Судья без окон (в промпт судьи — правила тишины: без окон и звука, без `KAIF_DIST` старых
      генераторов — EXP-0132); `plans/100` строка 13 и критерии 18–20; STATUS п. 0; MASTER_PLAN §5; урок в `EXPERIENCE.md`;
      коммит.

## Верификация наблюдением

| Утверждение | Артефакт | Где живёт |
|---|---|---|
| закрытие отказывает при свежем вводе и печатает порт/PID/заголовок | ассерты `s22` | `tools/sandbox/s22-contour-shipped.mjs` |
| ответ переживает смерть сервера | ассерт `s22` «убит → забран побайтно» + проба `contour-answer-survives` | тот же свод · `tools/sandbox/probes/` |
| незнакомый флаг — отказ до страницы; несвежий `dist` — отказ до сводов | ассерт `s22` + преполёт `@guard sandbox-dist-fresh` | `tools/sandbox-suite.mjs` |
| 2.6 не имеет ни команды, ни забора, ни отказа | красные на `KAIF_DIST` 2.6 | отчёт прогона |
| путь владельца в видимом окне | отчёт прогона, строка `Functional run:` со снимком | `testcases/reports/<дата>_contour-close-survive.md` |

## Риски (ярусы Мёрфи)

- **(а) Профиль в папке проекта уезжает в git** — строка ignore ДО инструмента (правило «сначала ignore, потом инструмент»);
  проверка `git status` после первого запуска в своде.
- **(а) Новый профиль Edge входит в учётку Windows** — EXP-0134: три флага + проверка `account_info` после запуска; красный
  свода на профиле с `account_info`.
- **(б) Безоконный забор при живом окне владельца** — два процесса на одном профиле; `researches/31` §4 называет это
  непроверенным. Протухший замок значит, что мёртв СЕРВЕР, а не окно (прежняя строка говорила «окно мертво» — поправлено по
  суду эпика, Н5): окно владельца при мёртвом сервере как раз открыто — в нём он и нажимает «Записать». Поэтому забор смотрит
  ещё и на профиль: пока его держит браузер (Windows — занятый `lockfile`, POSIX — `SingletonLock`), забор ОТКЛАДЫВАЕТСЯ со
  строкой «recovery deferred: a browser still holds the project profile» — второй браузер на занятом профиле отдал бы свою
  страницу в окно владельца (наблюдено в своде: headless-страница ушла в уже открытый процесс). Забор идёт после закрытия окна.
- **(б) Порог тишины закрытия слишком короткий/длинный** — `FORK:` LP0 с ценой ошибки в обе стороны; значение — параметр
  `contour` в `.kaif/kaif.json`.
- **(в) Chrome и macOS/Linux** — не обещать; строка «не проверено» в README генератора и отчёте.

## Черновик ответа в issue #66 (EN; отправка ПОСЛЕ релиза 2.7 — №84/№92/№93)

> Shipped in KAIF 2.7 (epic LP). Your ticket had two halves — the page that was closed while your owner was typing, and the
> window whose title never named the project. The second half shipped earlier (2.6 puts the project name into the title and
> the header; 2.7 IW brings the server up on the previous run's port so the draft is restored). This release closes the first
> half, and goes one step further because the origin's owner asked for it in his own words.
>
> **1. A live owner page is closed only by a command that checks it.** `node .kaif/tools/contour/review.mjs <doc> --close`
> reads the lock — port · pid · window title · the page's last input · draft state — prints them ("compare with the window you
> were told about before touching it") and REFUSES with exit 4 while the last input is younger than the quiet threshold
> (180 s; `contour.closeQuietMs`), while the page itself is younger than that (the owner may be reading it), or while a draft is
> unsaved. When it does close, it asks the page's OWN server to end (a token from the lock) — a pid read from a file is never
> killed without `--force`, because by then it may belong to another process. `--force` exists, and it needs `--owner-word
> "<the owner's words, verbatim>"` — the quote goes into the log as an audit trail (the machine cannot tell whose words they are). A
> neighbour session's word is not evidence: that sentence now stands in `/owner-reviews` (I46), in the one-page contract (§5)
> and in AGENT_GUIDE next to "Showing is an action" — "un-showing is a checked action". The page tells the server about typing
> at once: the pulse carries ms-since-input, draft fields and the saved flag, and the first keystroke after a pause pulses
> within a second.
>
> The honest part: my first build of this was wrong in exactly your direction, and the functional run on the owner's real
> path caught it. The lock learned of typing only at the next 15-second pulse, so `--close` three seconds after the first
> keystroke found "no input" and closed the page — your incident, reproduced by the fix for it. Two changes came out of that
> run: the keystroke pulse above, and the rule that a page younger than the threshold is never closed without the owner's word.
>
> **2. The answer survives the server.** The origin's owner answered the design question in one line: "no choice, no 'save
> as' — everything works for the user as it did; JS itself writes the file to the computer, into the project folder." So the
> app window now runs on its own browser profile inside the project (`.kaif/contour-window/`, put into `.gitignore` by the
> machinery before the first window; three flags keep a new Edge profile from signing into the OS account, and the generator
> checks `account_info` after launch). Save with the server gone stores the answer there — IndexedDB is the primary carrier (measured: on disk
> half a second after the write even when the browser is then killed; `localStorage` needs about six, so it keeps a copy and
> the typed draft) — and the page says "saved on this computer, the agent will pick it up" — no dialog, no "copy the text"
> ring. At the next `--queue --list`, `--check` or show the generator sees the stale lock, waits until no browser holds the
> profile (your owner's window may still be open), starts a headless run of the same profile on the same port (the origin is host:port),
> reads the answer back and records it as the owner's decision with `recovered: true`; the provenance comment in the document
> says so. A draft that was never saved is named, kept, and restored when the page reopens.
>
> **3. A test page never calls the owner.** An unknown flag now refuses BEFORE any page, sound or call (exit 1) — on 2.6
> `--close` fell through to the show and called the owner by voice; and at the origin the polygon refuses to run against a
> dist older than its sources.
>
> Verified: the polygon suite drives the real shipped page headless on a project profile (type → kill the server → Save →
> recovery deferred while the browser lives → the browser killed HARD → recovery "from indexedDB" → the text byte-equal); red on the 2.6 generator and on two mutants (the typing refusal removed,
> the page-age refusal removed — each reddens exactly its asserts); and a functional run in a VISIBLE Edge window on the
> origin owner's machine, announced to him beforehand, with four screenshots read. Boundaries, said plainly: Edge on Windows
> is what was observed; Chrome, macOS and Linux take the same flags and are NOT verified; a queue page (several documents in
> one window) keeps its draft but is not picked up headless yet — the log says so.

## Решения, принятые агентом без владельца

1. `[ИИ]` Порог тишины `--close` — 180 с, параметр `contour.closeQuietMs` (`FORK:` LP0 — конверт DEF6).
2. `[ИИ]` Код отказа на незнакомый флаг — 1, как ядро и загрузчик (bugs/33), а не 2 из первой редакции критерия 20: код 2
   у той же команды значит «страница закрыта без ответа»; строка «Проверка» критерия уточнена с этим обоснованием.
3. `[ИИ]` **Пересмотрено по суду эпика (Н4) 2026-09-18 ≈ 09:45 +03:00: носитель ответа — IndexedDB профиля проекта
   (`kaif-contour`/`kv`), `localStorage` держит копию и черновик.**
   `FORK: options <IndexedDB | localStorage | оба, IndexedDB первым> · price of error <ответ владельца потерян, если браузер
   умирает в первые секунды после «Записать» — ровно тот случай, ради которого эпик> · consulted <разведдок `researches/31` §4
   — устройство называло IndexedDB; замер этой сессии на Edge/Windows: жёсткое убийство через 0,5 с после записи — IndexedDB
   читается обратно, localStorage теряется до ≈ 6 с (Chromium сбрасывает его пачками ≈ 5 с — проба 2026-09-13 прогон 1 и прогон
   5 отчёта)>`. Выбрано «оба, IndexedDB — основной носитель» («первым» — по долговечности и по приоритету при заборе; по порядку ВЫЗОВА в коде сначала идёт синхронная запись копии в `localStorage` — уточнение судьи сессии, К5): свод теперь убивает браузер ЖЁСТКО и забирает ответ «from indexedDB».
   Прежняя редакция решения (опровергнута замером): Носитель локальной записи — `localStorage` профиля проекта, а не IndexedDB из `researches/31` §4: страница уже
   хранит там черновик (I12), обе записи читаются одним headless-проходом; слово владельца «JS сам пишет файл на компьютер в
   папку проекта» исполняется местом профиля, а не видом хранилища.
4. `[ИИ]` Забор — только при существующем профиле проекта, протухшем замке И свободном профиле (пока профиль держит браузер — отложен, Н5 суда); очередь-пачка без забора (названо в логе и в
   черновике ответа); headless убивается через 6 с после забора, чтобы очистка ключей дошла до диска (иначе ответ записался
   бы дважды) — число из пробы 2026-09-13 (убийство через 1,5 с теряло запись).
5. `[ИИ]` После живого прогона 09:10 добавлены два правила, которых в плане не было: пульс сразу после ввода и отказ
   закрывать страницу МОЛОЖЕ порога — без них `--close` закрыл печатающего владельца через 3 с после первого нажатия.
6. `[ИИ]` Гейт свежести `dist` — отпечаток исходников в `kaif-manifest.json` (`sourceTree`) одной функцией на обе стороны
   (`tools/lib/source-tree-sha.mjs`), а не `build-framework.mjs --hash`: одно определение «исходников», селфтест рядом, шов
   `KAIF_DIST` — исключение по построению.
7. `[ИИ]` Блок QA7 `tools/verify-contour.mjs` переписан под новое поведение (кольца спасения нет, ответ записан локально,
   кнопка погашена) — прежние ожидания стерегли поведение 2.6, заменённое словом владельца Q2 = D; обоснование — в коммите.
8. `[ИИ]` Одностраничный контракт удержан в 120 строках переразбивкой шести блоков на более широкие строки — содержание
   не тронуто, число в ассерте `s22` не поднято.
9. `[ИИ]` Строка в поставочном `AGENT_GUIDE` — одна (бюджет 1200 исчерпан): длинная форма правила живёт в `/owner-reviews`
   I46 и в контракте §5; вынос из гида — работа эпика CB.
10. `[ИИ]` Живой прогон шёл с `--silent` (без голосового зова): предмет эпика — закрытие и сохранение, зов не менялся;
    окно объявлено в чате до каждого запуска, пробный документ жил во временном развёртывании, очередь истока не тронута.

## Links

`plans/100` строка 13, критерии 18–20 · `researches/30` §2д · `researches/31` · `interviews/interview_032` · issue #66 ·
`bugs/116` · `plans/108` (IW — порт из протухшего замка) · `plans/102` (QL — `--check`, свёртка) · EXP-0126 / EXP-0132 /
EXP-0134 · `testcases/reports/2026-09-13_probe-contour-answer-survives-kill.md`.
