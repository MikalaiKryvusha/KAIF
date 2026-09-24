# Bug 117 — Ось «недоставленный сигнал» судила только слова NOT YET: переведённое имя поля, обещание вместо адреса, пропущенная строка и «NOT YET рядом с адресом» проходили молча

**Status:** ✅ DONE 2026-09-25 01:39 +03:00 — критерий закрытия наблюдён в поле четырежды (раздел «STATUS: DONE» ниже). Прежде: 🔧 FIX PENDING VERIFICATION — найдено функциональным прогоном на реальном состоянии 2026-09-13 00:48 +03:00 (сессия 63, эпик SD до коммита), починено 00:58, по суду уточнено 01:41: ось `check` — разрешающий список (нумерованный тикет молчит только когда строка `**Delivered upstream:**` называет issue — адрес `…/issues/N` или `#NN` — и не говорит NOT YET), всё прочее названо со следующим шагом; «NOT YET рядом с issue» — неоднозначно, и его называют обе команды; `report` и `check` читают строку одной функцией `deliveryState()`; `/report-bug` обоих слоёв говорит, что имя поля читает машина и оно остаётся дословным по-английски, а значение несёт либо issue, либо NOT YET. DONE — после первого полевого `check` на обновлённом до 2.7 развёртывании с `tracking: origin`: ждущий или нечитаемый тикет назван строкой с командой, доставленный молчит.
**Severity:** S2 — потерян бы был сигнал в исток, ради которого эпик SD существует (класс #37/#65): форма, в которой агент поля закоммитил недоставленные тикеты накануне #65, для первой сборки оси была невидима. Железо, данные и доверие владельца не пострадали — дефект пойман до коммита.
**Version/build:** рабочее дерево 2.7 поверх `3fc04a2` (эпик SD, незакоммичен); `framework/installer/KAIF-CORE.mjs` — `cmdCheck` (ось `undelivered-signal`), `cmdReport`; шаблоны A/B `framework/skills/report-bug/SKILL.md` (с 2.5 — поле без слова о языке).
**When/context:** 2026-09-13 00:48 +03:00, сессия 63 — функциональный прогон эпика SD по реальным тикетам четырёх полевых развёртываний на диске владельца (копии в свежую установку; соседи только читались), до суда и коммита; уточнение — по суду ≈ 01:37.
**Fix accepted when (observable):**
- Ситуация. Развёртывание с `tracking: origin`; в `bugs/KAIF/08_translated_field.md` шапка `> **Сигнал в исток:** ждёт отправки`, строки `**Delivered upstream:**` нет; в `09_promise_value.md` строка `**Delivered upstream:** ⏳ отправляется этой же сессией`; в `10_not_yet_with_address.md` — `**Delivered upstream:** NOT YET — a recurrence of https://github.com/…/issues/37`.
- Действие. Агент запускает `node .kaif/kaif-core.mjs check`, затем `node .kaif/kaif-core.mjs report bugs/KAIF/10_not_yet_with_address.md`.
- Результат. Для каждого из трёх — строка `⚠ KAIF signal with no readable delivery state: bugs/KAIF/<файл> — …` с обеими законными формами и командой; для 10 — «says NOT YET and names an issue … at once»; код 0; `bugs/KAIF/README.md` и доставленный тикет не названы; `report` на 10 отказывает теми же словами, «nothing sent», `gh` не вызван.
- Проверка. `node tools/sandbox/s17-report.mjs` → «✅ s17 report: all green» (одиннадцать ассертов SD); `KAIF_DIST=<первая сборка оси>` → ровно пять красных: «форма #65», «обещание вместо адреса», «одно чтение, check», «одно чтение, report», «#2 в тексте обещания».

## Symptom

Первая сборка оси (`s17` зелёный, проба SD0 зелёная) судила только слова `not yet` в абзаце `**Delivered upstream:**`. Прогон по 46 реальным тикетам поля показал: у 15 из них строка доставки не читается машиной, а первая сборка молчала на всех пятнадцати.

| Форма строки доставки в реальном тикете | Пример (дословно) | Первая сборка оси | Сколько в поле |
|---|---|---|---|
| `NOT YET` в строке | `**Delivered upstream:** NOT YET — awaiting the owner's word (outward action).` | названа | 6 |
| Имя поля переведено на язык проекта, машинной строки нет | `> **Сигнал в исток:** https://github.com/…/issues/65 (шаблон B — усиление …` | молчала | 8 |
| Доставка обещана или заявлена словами, без номера issue | `**Delivered upstream:** ⏳ отправляется этой же сессией, по стоячей авторизации владельца KAIF` · `**Delivered upstream:** ✅ this issue — sent 2026-08-30 immediately on filing` | молчала | 2 |
| Строки о доставке нет вовсе или она названа иначе | тикеты 2.3/2.4 без поля · `> **Delivery:** tracking \`origin\` — folded into the 2.3 field update report` | молчала | 5 |

Сегодня все восемь тикетов с переведённым полем несут адрес issue, то есть доставлены; «ждущей» эту форму делает история: накануне #65 агент того развёртывания закоммитил два тикета с полем шапки «Сигнал в исток: ждёт отправки» и ждал второго слова владельца (git того развёртывания, коммит `c68466b` 2026-09-12 16:57, строки «**Сигнал в исток:** ждёт отправки» ×2). Первая сборка оси промолчала бы ровно на них. Та же форма невидима и для `report` (отказ «not a KAIF ticket»), поэтому такой тикет нельзя было и доставить командой.

Суд (≈ 01:37) нашёл пятую форму, которой в поле пока нет, но которую чтение пропускало: строка NOT YET, цитирующая адрес («NOT YET — a recurrence of https://…/issues/37»). Прежний `report` (2.6) отдавал победу ЛЮБОМУ адресу — «already delivered», тикет нельзя было отправить; первая сборка оси называла её как NOT YET — «run report»; после первой починки ось молчала вместе с `report`.

## Repro (deterministic)

`SD_DIST=<скретчпад>/dist-blacklist node <скретчпад>/sd-real-state.mjs` (первая сборка оси, сохранена до починки; прогон 2026-09-13 01:03 +03:00): 46 файлов `bugs/KAIF/` четырёх развёртываний копируются в свежую установку из этой сборки, `tracking: origin`, `check` → «TOTAL: 46 files · NOT-YET named 6 · no readable delivery state 0 · silent 40»; из сорока молчащих 15 без машинно-читаемого состояния доставки (сверка с прогоном на починенном ядре). Сводом: `KAIF_DIST=<скретчпад>/dist-blacklist node tools/sandbox/s17-report.mjs` → «❌ s17/SD (форма #65) …», «❌ s17/SD: обещание вместо адреса …», «❌ s17/SD (одно чтение, check) …», «❌ s17/SD (одно чтение, report) …», «4 failure(s)» (прогон 2026-09-13 01:51 +03:00).

## Forensics

- Прогон по реальному состоянию, первая сборка (лог скретчпада `sd-real-state.log`, 00:48): field-1 — 18 файлов, названо 6; field-2 — 15 файлов, названо 0, у двенадцати нет строки `**Delivered upstream:**`; field-3 — 11, названо 0 (все с адресами); field-4 — 2, названо 0 (оба с адресами). Имена развёртываний в документе обезличены (№90).
- После починки (логи `sd-real-state-v2.log` 01:00 и `sd-real-state-v3.log` 01:42 — строки вердиктов совпали): 46 файлов · `NOT YET` названо 6 · «no readable delivery state» 15 · молчат 25 — у каждого молчащего в строке стоит адрес `…/issues/N`, ни в одном нет «not yet» (прочитано построчно; судья перечитал все 46 строк независимо).
- Судья извлёк `deliveryState` первой починки и вычислил его без запуска команд (`scratchpad/judge/ds-eval.mjs`): «NOT YET — a recurrence of https://…/issues/37» → delivered; «⏳ sending; draft at https://example.com/draft» → delivered. Любой URL был уликой доставки — причина второй редакции.
- Комментарий `cmdReport` 2.6 утверждал «`not yet` … wins»; код отдавал победу адресу (`already = URL || (!notYet && #NN)`). Вторая редакция делает «оба сразу» неоднозначным состоянием, а комментарий новой функции называет все пять состояний.

## Root cause

Ось была построена запрещающим списком: «назови, если видишь `not yet`». Такой механизм отказывает молча — всё, чего нет в списке, проходит как «в порядке». Принцип fail-safe defaults (Saltzer & Schroeder, 1975; https://www.cs.virginia.edu/~evans/cs551/saltzer/), дословно: «a design or implementation mistake in a mechanism that explicitly excludes access tends to fail by allowing access, a failure which may go unnoticed in normal use»; OWASP Input Validation Cheat Sheet: «Allowlist validation involves defining exactly what IS authorized, and by definition, everything else is not authorized». Первая починка ввела разрешающий список, но улику взяла шире наблюдения — «любой URL», и противоположные слова в одной строке («NOT YET» и адрес) решались в пользу доставки. Проба SD0 и свод `s17` написаны по шаблону истока (английское поле), поэтому стенд агента не нёс ни одной формы, которую пишут агенты локализованных развёртываний, — ровно класс «стенд ≠ реальный мир» (`TESTING_FRAMEWORK.md`). Вторая причина — в шаблоне: `/report-bug` с 2.5 не говорил, что имя поля читает машина, и агент ru-развёртывания перевёл его вместе с текстом тикета.

## Fix

1. `framework/installer/KAIF-CORE.mjs` — функция `deliveryState(text)`: одно чтение абзаца для `report` и `check`. Улика доставки — issue: адрес `…/issues/N`, или `#NN` самим значением строки либо сразу после слов origin/issue (повторный суд ≈ 02:03: вторая редакция принимала любой `#цифры` — «⏳ sending this session — see step #2 of the skill» читался доставленным). Состояния: доставлен (issue, без «not yet») · не доставлен («not yet» без issue) · неоднозначно (оба сразу) · нечитаемо · строки нет. `cmdReport` переведён на неё; «оба сразу» теперь отказ с обеими формами и «nothing sent», адрес, который не issue, доставкой больше не считается; все 31 прежний ассерт `s17` зелёные.
2. Ось `check` — разрешающий список: тикеты — только `bugs/KAIF/NN_*.md`; `NOT YET` → прежняя строка с командой; пропущенная, нечитаемая или неоднозначная строка → `⚠ KAIF signal with no readable delivery state: … delivered → write only … not sent → write … with no issue URL or #NN and run node .kaif/kaif-core.mjs report …`. Имя «undelivered» машина не произносит там, где доставку не видела (пятое обязательство — заявление не шире наблюдения).
3. `/report-bug` обоих слоёв: имя поля `**Delivered upstream:**` читает машина — остаётся дословным по-английски, жирным, отдельной строкой на любом языке проекта; значение может быть на языке проекта и несёт ЛИБО адрес issue или `#NN`, ЛИБО слова `NOT YET` — никогда оба; охота судьи «Signal filed, not delivered» называет обе строки предупреждения.
4. Записи 2.7 (`TEMPLATE_NOTES`, `POLICY_CHANGES` — что делать с такими тикетами после обновления: доставленный вручную или вложенный в полевой отчёт — вписать номер, найденный `gh issue list … --search`; неотправленный — `NOT YET` и команда), `KAIF_REFERENCE`, три новые пары `check-framework`.
5. Страж — `s17`: семь новых ассертов (переведённое поле · обещание · README и доставленный молчат · `report` на обещании · «NOT YET + адрес issue»: `check` называет · `report` отказывает, `gh` не зван · «#2» в тексте обещания — не номер issue); красный — первая сборка оси (пять ассертов), ядро 2.6 (шесть), вторая редакция с любым `#цифры` (ровно ассерт «#2»); три мутанта блока — каждый ассерт «молчит» краснеет на своём сломанном условии (`sd-mutants-v6.log`). Первая редакция ассерта «одно чтение» судила `check` через переменную — преполёт немой команды (`bugs/61`) покраснил полигон, ассерт разделён на два.

`TWINS: searched regex literals reading a bold labeled field (\*\*<Label>:\*\*) in framework/installer/KAIF-CORE.mjs and framework/tools/**/*.mjs — found 2 labels: "Delivered upstream" (3 sites, all in this core — this bug; the state is now read by one function, the other sites only rewrite the line) and "Answer" (1 site, a selftest fixture of the contour, whose parser reads answer labels from a configurable alternation PARSER.answerLabels — not this class); kaif-fp: has no machine reader in shipped code.`

## Решения, принятые агентом без владельца

1. **[AI] Разрешающий список вместо запрещающего** — `FORK: options <A only NOT YET (as built) | B allowlist — silent only on an issue with no NOT YET, every other state named | C A + a warning for a missing line only> · price of error <A: the form of the undelivered tickets committed before #65 and promises stay invisible (real state: 15 lines unreadable, all silent); B: one-time warnings on legacy tickets delivered by hand without the machine line (real state: 15 in two deployments), each with a derivable fix; C: a promise value ("⏳ being sent") stays invisible> · consulted <Saltzer & Schroeder 1975 fail-safe defaults; OWASP Input Validation Cheat Sheet (allowlist); the real-state run over 46 field tickets>` → **B**.
2. **[AI] Поле остаётся английским, а не распознаётся на языках проекта** — список переводов на девять языков хрупок и растёт с каждым агентом; одно дословное имя поля — контракт того же рода, что `DONE`, `[TESTED]` и `kaif-fp:`.
3. **[AI] Нечитаемый тикет называется другими словами, чем `NOT YET`** («no readable delivery state», не «undelivered») — машина не видела, что тикет не доставлен; она видела, что не может этого прочитать.
4. **[AI] Тикеты — только `NN_*.md`** — по имени, которое задаёт навык; README и заметки в каталоге не судятся.
5. **[AI] Разовые предупреждения на старых тикетах поля приняты, а не заглушены базовой линией** — каждое несёт выводимую починку без вопроса к владельцу (№97), а тикет, прочитанный машиной, — меньше энтропии, а не больше (№75).
6. **[AI] «NOT YET рядом с issue» — неоднозначно, а не «побеждает одно из двух»** (по суду): победа адреса прячет недоставленный тикет и запрещает его отправить, победа NOT YET отправляет доставленный второй раз; отказ обеих команд стоит агенту одной правки строки и не стоит ни молчания, ни дубля. Цена — строка «NOT YET — рецидив #37» теперь переписывается (связанный issue уходит в тело).
7. **[AI] Улика — только issue, а не любой адрес** (по суду): «draft at https://…» не доставка; в поле все 25 доставленных строк несут `…/issues/N`, и ни одна не сменила вердикт.
8. **[AI] `#NN` — улика только самим значением строки или после слов origin/issue** (по повторному суду): так пишут все известные ручные формы («origin #37», «origin **#37**», «#37»); номер на языке проекта («в истоке #37») не распознаётся и получает имя — отказ в сторону безопасности, который стоит агенту одной правки.

## ✅ STATUS: DONE (2026-09-25 01:39 +03:00, сессия 72, эпик CK 2.8 — первая правка ядра 2.8, как решено в STATUS п. 2)

Гигиена: свод `s17` (`tools/sandbox/s17-report.mjs`) в полигоне и суд версии 2.7 (без изменений с 2.7); в ядре 2.8 блок `@guard undelivered-signal` получил
`ON-REAL-PATH` с полевыми наблюдениями вместо `NOT YET`; сборка и полигон 2.8 зелёные.
Функциональный прогон: поле — первый собственный `check` после обновления до 2.7 на четырёх развёртываниях с `tracking: origin`
(отчёты #76, #79, #83, #93; цитаты — `researches/32` §2д): NDim — «2.7's `check` named **13** tickets with no readable delivery
state … After: **0** signal warnings»; KUMM — ось молчит, у всех четырёх тикетов URL; KAGO — «First field `check` after the update
named 9 of this deployment's 18 tickets. **3 were delivered and unreadable**»; QA_Engineer — ось нашла `bugs/KAIF/07`, «filed locally
2026-09-16 and never sent — sent as #90». Ждущий или нечитаемый тикет назван строкой, доставленный молчит — ровно «Fix accepted when».

## Links

`plans/109` (эпик SD, критерий 17) · issue #65 · issue #37 · `bugs/116` (та же сессия) · `testcases/reports/2026-09-13_polygon-2.7-SD.md` · `TESTING_FRAMEWORK.md` → «Стенд агента ≠ реальный мир владельца» · `researches/30` §2г.
