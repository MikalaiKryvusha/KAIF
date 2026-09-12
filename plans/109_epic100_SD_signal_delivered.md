# План 109 — эпик SD «Сигнал доставлен»: исключение в строке ворот `AUTH:`, заведение = доставка, ось `check` о неотправленном тикете

> **Создан:** 2026-09-13 00:06 +03:00 (сессия 63 — нулёвка SD0 сразу после IW; канон N+1, №43).
> **Родитель:** `plans/100` (эпик SD — строка 12 таблицы эпиков; критерий приёмки версии 17); источник — issue #65
> (NDim `bugs/KAIF/15`, заведён и отправлен агентом NDim одним движением ≈ 2026-09-12 17:28 +03:00 по вопросу истока
> `SendMessage`; рецидив #37); слово владельца о классе (чат ≈ 17:10, дословно): «Оказывается, агент их не отправил, хотя
> я просил - это блять воспроизведения бага, что они не отправляют баги в ориджин!!!»; разбор — `researches/30` §2г;
> слово владельца о скоупе — №115.
> **Статус:** ✅ **ЗАКРЫТ 2026-09-13 02:16 +03:00** (сессия 63) — принят к исполнению 2026-09-13 00:06 +03:00; SD0 ✅ 00:06 ·
> SD1–SD4 ✅ 00:09 · SD5 ✅ 01:03 (функциональный прогон по реальным тикетам поля → `bugs/117`) · SD6 ✅ 02:16 (суд REFUTED
> → починки → повторный суд VERIFIED WITH CAVEATS → сверка VERIFIED); критерий 17 `plans/100` ✅.
> **Вовне:** поставка — ось `check` ядра `KAIF-CORE.mjs` («недоставленный сигнал»); `/report-bug` обоих слоёв (заведение и
> доставка — один шаг); `AGENT_GUIDE` обоих слоёв (исключение — в строке ворот `AUTH:` точки вызова fable-цикла); охота
> `/fable-judge`; записи 2.7 сборщика; черновик ответа #65.

## Вектор цели (Achieve)

**Боль** (#65; `researches/30` §2г). Канон обоих слоёв велит доставлять тикет о дефекте самого KAIF в origin «одним
движением» под стоячей авторизацией владельца KAIF — абзацем в разделе «Git-процесс» и шагом 4 `/report-bug`, — а агент
NDim, прочитавший оба, завёл #63/#64 в ≈ 16:58 «ждёт отправки» и отправил их в 17:19 только после второго слова владельца
«отправляй» (окно ≈ 40 минут и один прямой вопрос владельца). Его причина одной строкой: широкий, всегда включённый рефлекс
«подтверждай внешнее» побеждает узкое исключение, написанное прозой внутри длинного абзаца, — «проиграло на #37 и
проиграло снова». Машины нет: `check` ядра недоставленный сигнал при `tracking: origin` не видит (проба SD0: тикет
`NOT YET` на копии с `tracking: origin` → `check` exit 0, ни строки о тикете).

**Где хотим оказаться.** Исключение стоит В СТРОКЕ ворот `AUTH:` там, где агент встречает сами ворота, — в точке вызова
fable-цикла `AGENT_GUIDE` обоих слоёв, а не абзацем в другом разделе; `/report-bug` обоих слоёв не имеет отдельного шага
«доставь» — шаг «заведи» ЗАКАНЧИВАЕТСЯ командой `node .kaif/kaif-core.mjs report bugs/KAIF/NN_*.md`; `check` ядра на
`tracking: origin` называет каждый тикет `bugs/KAIF/` с `NOT YET` поимённо и печатает готовую команду доставки
(предупреждение, не отказ: долг агента не должен блокировать `update-verify` чужого дерева; на `anonymous` `NOT YET`
законно — молчит); `/fable-judge` охотится на «signal filed, not delivered».

**Метрика эпика:** критерий 17 `plans/100` закрыт **1 из 1** (2026-09-13 02:16 +03:00).

## Готово, когда (критерии приёмки — сценариями; якорь `plans/100` критерий 17)

1. **[SD — `check` называет неотправленный сигнал]**
   - Ситуация. Развёртывание с `tracking: origin`; агент завёл `bugs/KAIF/15_upstream_signal_waits.md` со строкой
     `**Delivered upstream:** NOT YET — awaiting the owner's "send"` и продолжил работу.
   - Действие. Агент (или ритуал закрытия) запускает `node .kaif/kaif-core.mjs check`.
   - Результат. Среди строк — `⚠ undelivered KAIF signal: bugs/KAIF/15_upstream_signal_waits.md — "Delivered upstream: NOT
     YET" on tracking: origin is a debt with an owner, not a resting state (origin issue #65): node .kaif/kaif-core.mjs
     report bugs/KAIF/15_upstream_signal_waits.md`; код 0 (предупреждение). После `report` (строка стала URL/`#NN`) —
     молчит; на `tracking: anonymous` — молчит.
   - Проверка. `s17`: тикет `NOT YET` на origin → строка с именем и командой; после доставки через подменный `gh` → молчит;
     на anonymous → молчит; на ядре 2.6 (`KAIF_DIST`) — первый ассерт красный (проба SD0: «check says nothing»).

1б. **[SD — ждущий тикет назван в любой форме, в которой его пишет поле]** — *добавлен 2026-09-13 01:05 +03:00 по находке
   функционального прогона на реальном состоянии (`bugs/117`): первая сборка оси судила только слова `NOT YET` и молчала
   на всех пятнадцати строках доставки, которые машина не читает (переведённое поле — форма, в которой накануне #65 были
   закоммичены ждущие тикеты; обещание; строки нет); сценарий 1 и его «Проверка» не менялись. По суду (01:45) в строке
   «Результат» подсказка доведена до фактического вывода («write only …», «with no issue URL or #NN») — «Проверка» та же.*
   - Ситуация. Развёртывание с `tracking: origin`; в `bugs/KAIF/08_translated_field.md` шапка `> **Сигнал в исток:** ждёт
     отправки` без строки `**Delivered upstream:**`; в `bugs/KAIF/09_promise_value.md` строка `**Delivered upstream:** ⏳
     отправляется этой же сессией`; рядом `bugs/KAIF/README.md` и доставленный тикет с адресом issue.
   - Действие. Агент запускает `node .kaif/kaif-core.mjs check`.
   - Результат. Для 08 и 09 — `⚠ KAIF signal with no readable delivery state: bugs/KAIF/<файл> — …; delivered → write only
     **Delivered upstream:** <issue URL or #NN>; not sent → write **Delivered upstream:** NOT YET — <why> with no issue URL
     or #NN and run node .kaif/kaif-core.mjs report bugs/KAIF/<файл>`; README и доставленный не названы; код 0; `report` на 09
     отказывает теми же словами «neither NOT YET nor a delivery».
   - Проверка. `s17` (четыре ассерта SD сверх сценария 1) зелёный; на первой сборке оси (`KAIF_DIST=<скретчпад>/dist-blacklist`)
     красные ровно «форма #65» и «обещание»; на 46 реальных тикетах четырёх развёртываний (копии в свежую установку) каждый
     молчащий несёт адрес issue.

1в. **[SD — одно чтение на две команды: «NOT YET рядом с адресом issue» называют обе]** — *добавлен 2026-09-13 01:45 +03:00
   по суду (REFUTED на формулировке «молчит только на адресе issue»: первая починка принимала за доставку ЛЮБОЙ адрес, и
   строка NOT YET с цитатой ссылки молчала вместе с `report`); сценарии 1 и 1б не менялись.*
   - Ситуация. Развёртывание с `tracking: origin`; в `bugs/KAIF/10_not_yet_with_address.md` строка `**Delivered upstream:**
     NOT YET — a recurrence of https://github.com/example-owner/example-kaif/issues/37`.
   - Действие. Агент запускает `node .kaif/kaif-core.mjs check`, затем `node .kaif/kaif-core.mjs report
     bugs/KAIF/10_not_yet_with_address.md`.
   - Результат. `check` — `⚠ KAIF signal with no readable delivery state: bugs/KAIF/10_not_yet_with_address.md — "…" says
     NOT YET and names an issue (https://github.com/example-owner/example-kaif/issues/37) at once; …`; `report` — отказ теми же
     словами и «nothing sent», `gh` не вызван; строка с одним лишь `NOT YET` по-прежнему уходит командой.
   - Проверка. `s17` ассерты «одно чтение, check» и «одно чтение, report» зелёные; на первой сборке оси и на ядре 2.6 — оба
     красные.

2. **[SD — заведение и доставка — один шаг; исключение в строке ворот]**
   - Ситуация. Агент полевого проекта нашёл дефект KAIF и открывает `/report-bug` (ветка фреймворка) и `AGENT_GUIDE`
     (точка вызова fable-цикла).
   - Действие. Читает шаг «заведи» и строку о принудительных артефактах `INTENT:`/`AUTH:`/…
   - Результат. Шаг заведения заканчивается командой `node .kaif/kaif-core.mjs report bugs/KAIF/NN_*.md` «в том же
     движении, до работы, в которой найден дефект»; отдельного шага «доставь» нет; строка о `AUTH:` несёт единственное
     исключение в самой себе: тикет о дефекте KAIF в origin фреймворка доставляется под стоячей авторизацией владельца
     KAIF без строки `AUTH:`, всё остальное наружу ждёт слова владельца; `/fable-judge` охотится на «Signal filed, not
     delivered (KAIF 2.7)».
   - Проверка. Пары `check-framework`: `AGENT_GUIDE` оба слоя (токены исключения + `kaif-core.mjs report`), `/report-bug`
     оба слоя (`File AND deliver` / «Заведение и доставка — ОДИН шаг» + команда), ядро (`undelivered KAIF signal` +
     `@guard undelivered-signal`), судья (обе копии побайтно).

3. **[судья эпика]** — лёгкий `/fable-judge` по критериям 1–2; на закрытии — нулёвка CB0 по `plans/95` (план готов) и
   веха в `plans/100` (строка 12, критерий 17 ✅ — закрыто 14 из 17).

## Шаги

- [x] **SD0 — нулёвка актуализации входов ✅ 2026-09-13 00:06 +03:00 (сессия 63).** Входы сверены против HEAD `3fc04a2`
      + рабочее дерево IW: `cmdCheck` `KAIF-CORE.mjs:2853–3008` (оси: манифест · схема маркера · `doc-budgets` `:2963` ·
      `resume-covers-core` `:2986` — образец блока `@guard` и предупреждения без отказа); `cmdReport` `:3061–3115` (контракт
      строки `Delivered upstream:` абзацем — регэксп `:3084`, `not yet` в любом регистре); `/report-bug` EN `:47–61` — шаги 3
      «File locally» и 4 «Deliver by tracking mode» РАЗДЕЛЬНЫ; RU `:29–49` — ветка прозой, команды доставки в тексте нет;
      `AGENT_GUIDE` EN `:332–336` — строка принудительных артефактов без исключения, исключение — абзацем в «Git process»
      `:589–594`; RU `:321–324` и `:610–615` — то же; `s17-report.mjs` — свод команды `report` с подменным `gh` (шов
      `KAIF_GH`), `check` на его копии не гонялся; охоты судьи `:46–61`. Соседи на диске: у KAGO четыре документа с `NOT YET`
      (`researches/30` §2а/§2г — известная картина); NDim `bugs/KAIF/15` — заведён и отправлен одним движением.
      **Проба ДО кода** (скретчпад `sd0-probe.mjs`, 2026-09-13 00:04 +03:00, копия из `dist` истока): `install` → маркер
      `tracking: origin` → тикет `bugs/KAIF/15_upstream_signal_waits.md` с `NOT YET` → `check` → **exit 0, «(no line about
      the ticket)» → ❌ RED**.
      `INTENT: code does <check не смотрит в bugs/KAIF/; /report-bug: заведение и доставка — два шага; исключение
      из ворот AUTH живёт абзацем в другом разделе>; the failing check/task expects <check называет тикет NOT YET на
      origin с командой · один шаг · исключение в строке ворот — plans/100 критерий 17>; the spec says <AGENT_GUIDE «Git
      process»: «file it and deliver it in the same motion»; #65: «ось check — единственный механизм» · «исключение В
      СТРОКЕ ворот» · «шаг 4 ДОСТАВЛЯЕТ готовой командой»; PHILOSOPHY → «Код прежде когниции»: правило, существующее только
      прозой, не удерживает поведение>` — сходятся; расхождение X/Y — ровно дыра тикета.
      `FORK: options <A предупреждение check (код 0) поимённо с командой | B отказ check (код 1) при NOT YET на origin |
      C отдельная команда `signals`> · price of error <A: агент может проигнорировать предупреждение (класс #22 — но
      строка с готовой командой исполняется сама, как показал полевой замер); B: чужое дерево с долгом агента не
      пройдёт update-verify — обновление заблокировано чужой недоставкой; C: ещё одна команда, которую никто не зовёт>
      · consulted <прецеденты осей check истока: doc-budgets и resume-covers-core — «a warning, never a failure» с
      названной причиной (локализованное дерево не блокируется); #65 (автор тикета просит ось check; о силе не говорит);
      AGENT_GUIDE → «Форма обязательства — команда, шаг или чекбокс» (issue #22: правило с командой исполнялось само)>
      → **DECIDED [AI]: A** — предупреждение с готовой командой в той же строке; сила отказа не покупает доставки (её
      совершает агент, а не ядро), а блокировка обновления чужим долгом — новый инцидент.
- [x] **SD1 — ось `check` «недоставленный сигнал» ✅ 2026-09-13 00:09 +03:00** (проба SD0 после фикса — «check names the
      undelivered signal with the ready command»). Прежняя формулировка: В `cmdCheck` после `resume-covers-core`: `tracking === 'origin'` и
      каталог `bugs/KAIF/` → каждый `*.md`, чей абзац `Delivered upstream:` (регэксп `cmdReport`) содержит `not yet`
      (любой регистр) → `⚠ undelivered KAIF signal: <путь> — … : node .kaif/kaif-core.mjs report <путь>`; блок `@guard
      undelivered-signal` четырьмя полями; anonymous/fork — молчит; файл без строки — не тикет, молчит.
- [x] **SD2 — `/report-bug` обоих слоёв ✅ 2026-09-13 00:09 +03:00.** Прежняя формулировка: EN: шаги 3 и 4 слиты в «3. File AND deliver — one step, one motion» (команда
      внутри шага заведения, «filing IS delivering»; строка о `check`); RU: в ветке фреймворка — предложение «Заведение и
      доставка — ОДИН шаг» с командой и осью `check`.
- [x] **SD3 — `AGENT_GUIDE` обоих слоёв: исключение в строке ворот ✅ 2026-09-13 00:09 +03:00** (первая сборка красная — пара
      «wrapper» не нашла `kaif-core.mjs report`: команда была перенесена на две строки; перенос убран). Прежняя формулировка: Строка принудительных артефактов точки вызова
      fable-цикла несёт единственное исключение ворот `AUTH:` в самой себе (EN «the one carve-out of the `AUTH:` gate», RU
      «единственное исключение из ворот `AUTH:`») с командой; абзац «Git-процесс» остаётся (второе место — законное
      зеркало, оба слоя).
- [x] **SD4 — судья, пары, записи ✅ 2026-09-13 00:09 +03:00.** Прежняя формулировка: Охота «Signal filed, not delivered (KAIF 2.7)» в обеих копиях; шесть пар
      `check-framework`; `TEMPLATE_NOTES['2.7']` + `POLICY_CHANGES['2.7']`; `KAIF_REFERENCE` (предложение об оси).
- [x] **SD5 — свод, функциональный прогон на реальном состоянии, отчёт ✅ 2026-09-13 01:03 +03:00.** Свод `s17` с четырьмя
      ассертами SD зелёный 00:09 (красный на 2.6 — первый ассерт). Мутанты 00:47 показали, что ассерты «молчит» на 2.6
      зелёные по построению (старое ядро молчит всегда) — оба доказаны красными на своих сломанных условиях. **Функциональный
      прогон 00:48** — 46 реальных файлов `bugs/KAIF/` четырёх полевых развёртываний скопированы в свежую установку из `dist`
      (соседи только читались), `check` пути пользователя, вывод прочитан построчно против текста каждого тикета: названы 6
      (`NOT YET`), молчали 40 — из них у 15 строка доставки не читается машиной: восемь с переведённым именем поля
      «Сигнал в исток:» (сегодня все с адресом issue; в этой форме накануне #65 были закоммичены ждущие тикеты — git
      того развёртывания `c68466b`), обещание «⏳ отправляется этой же сессией», «✅ this issue» без номера,
      `> **Delivery:** folded into…`, четыре старых без строки. **Находка — `bugs/117` (S2):** ось, судившая только слова
      NOT YET, молчала на всех пятнадцати.
      Починка до коммита (00:58): `deliveryState()` — одно чтение для `report` и `check`; ось — разрешающий список (молчит
      только на адресе issue или `#NN`), нечитаемое названо «no readable delivery state» с обеими законными формами; `/report-bug`
      обоих слоёв — имя поля машинное и дословное; три пары `check-framework`; записи 2.7; `KAIF_REFERENCE`. `s17` +4 ассерта
      (зелёный 00:58; на первой сборке оси — ровно два красных; на 2.6 — три); три мутанта блока — каждый ассерт «молчит»
      красный на своём условии (00:59); реальное состояние после починки (01:00): «46 files · NOT-YET named 6 · no readable
      delivery state 15 · silent 25», каждый молчащий — с адресом issue; полигон «all 26 suites green» (01:01 → 01:03). Отчёт
      прогона — `testcases/reports/2026-09-13_polygon-2.7-SD.md`.
- [x] **SD6 — закрытие ✅ 2026-09-13 02:16 +03:00.** Суд чистым контекстом без единого окна (≈ 01:19 → 01:37) — REFUTED на
      SD-1 (улика «любой URL») и SD-5 (черновик ответа #65), двенадцать каверз на оба эпика и оба бага; всё починено до
      коммита (`bugs/117` § «Решения» 6–7, «Решения» 6 ниже, отчёт прогона SD «Найдено»). Повторный суд (≈ 01:57 → 02:03) —
      VERIFIED WITH CAVEATS, три новые: форензика `bugs/116` (EXP-0126), улика `#NN` — любой `#цифры`, ассерт без кода
      возврата → починено; сверка (≈ 02:14 → 02:16) — VERIFIED. `plans/100` строка 12 и критерий 17 ✅ — **закрыто 14 из 17**;
      STATUS п. 0 → нулёвка CB0 (`plans/95`); MASTER_PLAN §5/§8; урок — EXP-0133; коммит.

## Верификация наблюдением

- Проба SD0 (скретчпад) после фикса — зелёная: «check names the undelivered signal with the ready command».
- `node tools/sandbox/s17-report.mjs` зелёный; `KAIF_DIST=<dist 2.6>` — ассерты SD «NOT YET», «форма #65», «обещание»
  красные; `KAIF_DIST=<скретчпад>/dist-blacklist` (первая сборка оси) — красные ровно «форма #65» и «обещание»; три мутанта
  блока (`sd-mutants.mjs`) — каждый ассерт «молчит» красный на своём сломанном условии.
- Функциональный прогон на реальном состоянии (`sd-real-state.mjs`): 46 тикетов четырёх полевых развёртываний, копии в свежую
  установку, вывод `check` прочитан построчно против текста тикета.
- `node tools/build-framework.mjs` (пары SD зелёные) · `counters-guard` · `npm run test:core`.

## Риски (ярусы Мёрфи)

- **(а) Предупреждение проигнорируют так же, как прозу.** Защита: строка несёт ГОТОВУЮ команду (форма обязательства — команда), и
  тот же тикет ловит охота судьи; сила отказа отвергнута в `FORK:`.
- **(б) Тикет доставлен рукой, строка не правлена** — читается долгом. Защита: `report` идемпотентен и сам пишет URL; строка
  предупреждения велит именно команду, а не правку руками.
- **(в) У истока `bugs/KAIF/` нет** — ось молчит по построению (оговорка истока: сигнал = документ в `bugs/`).

## Черновик ответа в #65 (отправка после релиза 2.7 — №84/№92/№93)

Shipped in KAIF 2.7 (epic SD). Your one-line cause — a broad, always-on reflex beats a narrow exception written as prose
inside a long paragraph — is the whole diagnosis, and all three of your proposals went in.

**1. The machine.** `node .kaif/kaif-core.mjs check` now names every numbered ticket in `bugs/KAIF/` whose delivery line
does not prove delivery while the deployment tracks the origin, together with the command that ends the debt:
`⚠ undelivered KAIF signal: bugs/KAIF/15_….md — "Delivered upstream: NOT YET" on tracking: origin is a debt with an owner,
not a resting state (origin issue #65): node .kaif/kaif-core.mjs report bugs/KAIF/15_….md`. It stays silent only when the
`**Delivered upstream:**` line names the issue — its URL or `#NN` — and does not say NOT YET; a missing, translated or
unreadable line, or NOT YET beside an issue, is named "no readable delivery state" with both legal forms. That second half
came from your own tickets: I ran the new check over copies of the real `bugs/KAIF/` of four deployments on this disk, and
the first build — which only looked for the words NOT YET — was silent on the form in which the two tickets behind #65
were first committed (the field name translated, «Сигнал в исток: ждёт отправки») and on a promise instead of an address.
The field name `**Delivered upstream:**` is now declared machine-read: it stays verbatim English in any project language,
the value carries either the issue or NOT YET, never both, and `report` and `check` read it with one function. A warning,
not a failure — the debt is the agent's, and an owner's edited tree must not fail its own update over it; on
`tracking: anonymous` the axis is silent. Before writing the code I fed the shipped core a NOT YET ticket on an
origin-tracked copy: exit 0 and not a word — your report, reproduced. On a copy of your `bugs/KAIF/` the 2.7 core names
twelve tickets: eight whose header field is translated (each needs a `**Delivered upstream:** <its issue URL>` line) and
four early ones with no delivery line at all (find each one's issue with `gh issue list --state all --search "<title>"`,
or send it if it never went) — and then it is silent.

**2. Filing IS delivering.** `/report-bug` (both layers) has no separate "deliver" step any more: the step that writes
`bugs/KAIF/NN_*.md` ends with `node .kaif/kaif-core.mjs report bugs/KAIF/NN_*.md`, ahead of the work that found the
defect. `/fable-judge` hunts "a signal filed, not delivered" — a ticket whose delivery line does not prove delivery at the
end of the work that filed it, or a close that says "awaiting the owner's word to send".

**3. The exception in the gate's own line.** In `AGENT_GUIDE` (both layers) the sentence that names the forced artifacts —
`INTENT:` / `AUTH:` / `TWINS:` / `PENDING:` — now carries the one carve-out of the `AUTH:` gate in itself: a ticket about a
defect of KAIF, filed to the framework's origin, goes under the KAIF owner's standing authorization in the same move as
filing and awaits no `AUTH:` line; everything else outward still waits for the owner's words. The git paragraph keeps its
copy; a pair check holds the two together.

Proof: suite `s17` on a deployed copy — NOT YET on origin → the line with the command; a translated field, a promise, and
NOT YET beside an issue → "no readable delivery state" (and `report` refuses the last); after `report` (a gh stand-in) →
silent; on anonymous → silent; red on the 2.6 core via `KAIF_DIST` and on the first, NOT-YET-only build. Thank you for
filing #65 in one move once asked — that run is the shape the canon now describes.

## Решения, принятые агентом без владельца

1. **[AI] Ось `check` — предупреждение, не отказ** (`FORK:` в SD0): как `doc-budgets` и `resume-covers-core`; отказ блокировал бы
   обновление чужого дерева долгом агента.
2. **[AI] Абзац «Git-процесс» не удалён, а продублирован строкой ворот:** исключение обязано стоять там, где встречают ворота
   (точка вызова fable-цикла), и там, где читают git-политику; два места — одно правило, пара стережётся `check-framework`.
3. **[AI] Ось — разрешающий список** (находка функционального прогона, `bugs/117`): `FORK: options <A only NOT YET, as first
   built | B allowlist — silent only on an issue URL or #NN, every other state named | C A + a warning for a missing line> ·
   price of error <A: the #65 form and promises stay invisible (real state: 1 form of 4); B: one-time warnings on legacy
   tickets delivered by hand without the machine line (real state: 15 in two deployments), each with a derivable fix; C: a
   promise value stays invisible> · consulted <Saltzer & Schroeder 1975, fail-safe defaults — «a design or implementation
   mistake in a mechanism that explicitly excludes access tends to fail by allowing access, a failure which may go unnoticed
   in normal use»; OWASP Input Validation Cheat Sheet — allowlist; 46 real field tickets>` → **B**.
4. **[AI] Имя поля — дословное английское, а не распознавание переводов** — список переводов хрупок; одно машинное имя —
   контракт того же рода, что `DONE`, `[TESTED]`, `kaif-fp:` (`bugs/117` § «Решения» 2–5: нечитаемое названо иначе, чем
   `NOT YET`; тикеты — только `NN_*.md`; разовые предупреждения на старых тикетах поля приняты без базовой линии).
5. **[AI] Сценарий 1б добавлен, сценарий 1 не тронут** — «Проверка» критерия не правится при исполнении (правило 7 сценарной
   формы); новая форма класса получила свой сценарий с пометкой, откуда он.
6. **[AI] По суду (≈ 01:37, REFUTED на SD-1 и SD-5, двенадцать каверз):** улика доставки — только issue (адрес `…/issues/N`
   или `#NN`), «NOT YET рядом с issue» — неоднозначное состояние, которое называют обе команды (`bugs/117` § «Решения» 6–7;
   сценарий 1в); черновик ответа #65 переписан — порядок предложений тикета и число тикетов второго развёртывания названы
   по наблюдению; висящий указатель «step 4» / «шаг доставки» в `AGENT_GUIDE` обоих слоёв и записях 2.7 заменён шагом
   заведения; охота судьи называет обе строки предупреждения; остальные каверзы — в отчёте прогона SD, «Найдено».
7. **[AI] По повторному суду (≈ 02:03, VERIFIED WITH CAVEATS):** `#NN` — улика только самим значением строки или сразу после
   слов origin/issue («see step #2 of the skill» не доставка; `bugs/117` § «Решения» 8; ассерт `s17`, красный на второй
   редакции); форензика `bugs/116` — утренний показ записан наблюдением EXP-0126, пятая причина «известный урок без механизма».

## Links

`plans/100` (критерий 17, строка 12) · issue #65 · issue #37 · `researches/30` §2г · `plans/84` (SG 2.5 — команда `report`) ·
`plans/108` (IW — образец) · `framework/installer/KAIF-CORE.mjs` (`cmdCheck`, `cmdReport`) · `tools/sandbox/s17-report.mjs` ·
`plans/95` (CB — следующий).
