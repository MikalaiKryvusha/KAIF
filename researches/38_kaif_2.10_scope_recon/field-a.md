# Разведка 2.10 — группа field-a: полевые отчёты #148 · #153

> **Отчёты:** #148 (Unliminium, KAIF 2.8 → 2.9) · #153 (KUMM, KAIF 2.7 → 2.9) — тела и все комментарии из
> `scratchpad/issues/<N>.md`. Прочитаны 2026-10-18 02:17 +0300 (момент пробой `date`). Дайджест записан 2026-10-18 02:29 +0300.
> **Сверено с HEAD** `250cf7a`; `git diff --stat v2.9 HEAD -- framework/` → пусто, сверка с HEAD = сверка с выпущенной 2.9.
> **Локальные копии отчётов** (только чтение): `D:\work\ai_sandbox\KUMM\reports\KAIF_UPDATES\KUMM_KAIF_2.9_UPDATE_REPORT.md` и
> `D:\work\unliminiumProject\reports\KAIF_UPDATES\2026-10-16_KAIF_2.9_UPDATE_REPORT.md` — `diff` с телами тикетов: отличаются только
> строкой «Delivered upstream» и (KUMM) абзацем «After delivery», который в тикете ушёл комментарием 1; локальный абзац подробнее —
> он называет обе подсказки `update-verify` дословно (использовано в R7 KUMM ниже).
> **Пробы** — только в `mktemp -d` = `/tmp/tmp.f6OF4Vf2Fz` (`git archive v2.9 framework tools dist | tar -x`); каталог удалён в конце.
> Деревья поля (`D:\work\unliminiumProject`, `D:\work\ai_sandbox\KUMM`, `KAGO`, `KUIPS`, `KrinikCam`) — только `grep`/`sed`, без записи.
> Исток не тронут мной (изменения `MASTER_PLAN.md` · `STATUS.md` · `shown.json` · `plans/136` в `git status` — главной сессии).

---

## 0. Главное одной страницей

1. **Класс, который повторяется в ОБОИХ отчётах и не заведён ни одним тикетом:** `checkpoint recheck` называет „местами,
   которые остались“ строки, ЗАПИСЫВАЮЩИЕ снятие, — те самые, которым пункт задания велит «stays as it is». Unliminium R4
   (13 → 17: счёт РАСТЁТ от честных записей), KUMM R2 (8 → 8 на каждом будущем интервале). Проба: даже строка с
   `KAIF-VERSION-OK` в журнале решений названа местом. В `ideas/32` этого нет, в `bugs/` нет. KUMM прямо: «No separate ticket».
2. **Первое поле на 2.9 провалило первую половину правила „ответь сразу, ТЕКСТОМ“** (Unliminium R6): ответ лёг размышлением,
   текст — через 7,5 минуты и 47 вызовов. Условие DONE `bugs/123` истока — «после первого поля на 2.9»; это поле пришло с
   провалом. Хуки сняты словом владельца KAIF (#144) — починка только через развилку владельца. Это единственная грабля
   обоих отчётов, которая стоила времени владельцу лично (не считая одной минуты законного вопроса R0).
3. **Слоты и заполнения — одна семья из трёх граблей KUMM** (R5 · R6 · R7): заполнение подставляется лексически в фразу
   справочника, которая называет слоты (#150; второе поле на диске — KAGO, та же строка 308), один кэш `fills` на все файлы даёт
   ложную «local edits» на строке соавтора, слот посреди строки (``**RULE:** `<…``) даёт ложное «not found». Два последних —
   уже в `ideas/32` п. 13(б) и п. 14; полевое наблюдение п. 14 — первое.
4. **Что сработало в обоих:** маршрут bootstrap + `--rehearsal` + локальный `--source` (песочница предсказала живой проход,
   0 расхождений вердиктов); `policy-changes` „принято с версией“ (вопрос только на коллизии с `[OWNER]`); базовая линия линтера
   авторства в формате отпечатков; судья чистого контекста поймал в обоих то, чего не видел исполнитель (первый проход —
   REFUTED в обоих, после правок — VERIFIED / VERIFIED WITH CAVEATS).

---

## #148 — Unliminium: обновление 2.8 → 2.9 (bootstrap + `--rehearsal`, перевод целиком, Windows 11)

**Суть:** обновление прошло механически (19 replaced · 83 kept, 0 расхождений вердиктов), 18 модулей влиты руками в 10
переведённых файлах, один законный вопрос владельцу (R0). Грабли поставки — контур (R1, R2), `stale-claims` (R3), „места
остались“ (R4); грабли поведения — одно-действие-на-вызов нарушено через минуты (R5) и ответ на слово владельца лёг
размышлением (R6, судья REFUTED).

### Таблица граблей

| # | что случилось | сверка с HEAD | класс | тикет? | тяжесть | цена |
|---|---|---|---|---|---|---|
| R0 | правило 2.9 „ответь и работай дальше“ столкнулось с `[OWNER]`-строкой проекта; один вопрос, ответ за минуту | **CONFIRMED** (пункт задания разрешает вопрос ровно на коллизии) | не дефект — политика сработала | — | — | 0 |
| R1 | дверь контура `--check` отказала живому интервью на русском сравнительном «выше» | **CONFIRMED пробой** | ru-словарь двери знает одну форму сравнения | #147 (`bugs/KAIF/26`) | S3 здесь · S2 для проекта на поставочной странице | 0,25 (вместе с R2) |
| R2 | очередь показывает „ждут“ 11 документов со статусом `↪️ СВЁРНУТО в интервью #N` | **CONFIRMED пробой** (механизм); число 11 — NOT-VERIFIABLE-HERE | словарь закрывающих слов статуса без „свёрнуто“ и `↪` | +1 на #109 (комм. 3) | S3 | в 0,25 R1 |
| R3 | `stale-claims` не назвал `AGENTS.md:3` «(версия 2.8)» и английскую строку README «framework, version 2.8» | **CONFIRMED пробой** | срез скобок как „атрибуции“ + окно пары 16 знаков | +1 на #117 (комм. 3) | S3 | 0,25 (LB, `ideas/32` п. 2) |
| R4 | `recheck` после правок назвал 17 мест вместо 13 — все записи о снятии | **CONFIRMED пробой** | у сканера снятого нет объявляемого исключения | **нет** (пожелание 4) — повтор в #153 R2 | S3 ×2 поля | 0,25 |
| R5 | `git add -A && git status --short && git diff --cached --stat` через минуты после вливания правила „один вызов — одно действие“ | **CONFIRMED** (правило — проза, хука нет) · «the release says so» — **PARTIAL** | правило о форме вызова без машинной половины | #146 закрыт: «the optional hook did not ship» | S3 | 0,25 + слово владельца |
| R6 | слово владельца посреди хода: ответ лёг `thinking`, первый ТЕКСТ — финальное сообщение через 7,5 мин | правило **CONFIRMED** дословно; числа транскрипта — NOT-VERIFIABLE-HERE | правило „ответь ТЕКСТОМ“ без носителя после снятия хуков | замер на #144; `bugs/123` истока | **S2** (класс `bugs/123` — S1) | развилка владельца |

### Улики и форма починки по граблям

**R0.** Ядро: `framework/installer/KAIF-CORE.mjs:1649` — `A question to the owner is legal ONLY where a rule collides with a decision he recorded himself (an [OWNER] line)`.
Отчёт: «(not a defect; the policy worked)», «Cost: one minute.» (`148.md:62`, `:65`). Вывод для 2.10: ничего не менять.

**R1.** `framework/tools/contour/texts.mjs:40` — правило ru: `выше(?!\\p{L})(?!\\s*,?\\s*(?:чем(?!\\p{L})|[\\d~≈<>]|на\\s+\\d|в\\s+\\d))`
(сравнение узнаётся только по тому, что СЛЕДУЕТ за словом: «чем», число, „на N“, „в N“ — тикет называет «чем» и число, на деле
окно чуть шире; по сути CONFIRMED). Проба `p1.mjs` (импорт `PARSER` из копии, `new RegExp(PARSER.refBack, 'iu')`), дословно:
```
REF  "Чем выше ум, тем правильнее произносится"
REF  "Берсерк бьёт героя с самой высокой атакой, у вора она выше."
ok   "нагрузка выше 80%"
ok   "B выше, чем A"
REF  "формула выше"
REF  "как указано выше"
```
Строки взяты из интервью поля (`D:\work\unliminiumProject\interviews\interview_133_short_questions_round2.md:118`, `:321`).
- **Класс:** ru-пакет двери различает „выше-ссылку“ и „выше-сравнение“ только по правому контексту. `TWINS: searched „выше|above“ в
  framework/tools/contour/texts.mjs — found 1: :40` (английское `above(?!\\p{L})(?!\\s*(?:than…` — та же форма, но в английском
  „the higher …, the …“ не даёт «above», близнеца по поведению нет).
- **Кто платит:** проект на поставочной странице — владельцу отказано в живом интервью до показа; Unliminium — нет (своя страница).
- **Форма починки:** „чем … выше“ в той же клаузе слева и «выше» в конце клаузы после именной группы — сравнение; «формула выше»,
  «как указано выше», «в таблице выше» — по-прежнему ссылка. Проверка: кейсы `review.mjs --selftest` (оба поля + четыре прежних).
- Разбирает главный разведчик #147; здесь — только сверка грабли отчёта. Отчёт: «an owner's live interview refused elsewhere» (`148.md:70`).

**R2.** `framework/tools/contour/texts.mjs:57` — `statusClosedWord: '^\\s*(?:[✅⛔➡🟢]\\uFE0F?\\s*)?\\*{0,2}\\s*(?:CLOSED|WITHDRAWN|MOVED|ЗАКРЫТ[ОАЫ]?|СНЯТ[ОАЫ]?|ПЕРЕНЕС[ЕЁ]Н[ОАЫ]?)(?!\\p{L})',`
— список в отчёте совпадает дословно. Потребитель: `framework/tools/contour/core.mjs:191` —
`if (STATUS_CLOSED_WORD_RE.test(line)) return waitsUnnegated(line) || STATUS_PENDING_RE.test(line) ? 'waiting' : 'closed';`. Та же проба:
```
open    "↪️ СВЁРНУТО в интервью #123"
closed  "✅ ЗАКРЫТО"
closed  "➡ ПЕРЕНЕСЕНО"
open    "↪ FOLDED into #5"
```
На диске поля 24 документа `interviews/` + `homeworks/` несут строку статуса с `↪` (`grep`, только чтение); „11 ждут“ — счёт очереди
поля, без прогона `review.mjs` на копии — NOT-VERIFIABLE-HERE. Отчёт: «The project's own queue shows 1.» (`148.md:73`).
- **Класс:** закрывающие слова статуса — закрытый список; „свёрнуто в …“ — русская форма MOVED. `TWINS: searched „MOVED|ПЕРЕНЕС“ в
  framework/tools/contour/ — found 1: texts.mjs:57` (английского FOLDED тоже нет — проба выше).
- **Форма починки:** `↪` в класс эмодзи, `СВЁРНУТ[ОАЫ]?` и `FOLDED` в слова. Проверка: кейс селфтеста очереди. Пересечение: `ideas/32`
  раздел „Остатки тикетов, найденные черновиками ответов после выпуска 2.9“ п. 1 (#109, обратный случай 🟡 «отвечено») — один проход по `docStatus()`.

**R3.** Механизм — `framework/installer/KAIF-CORE.mjs:1469` `let judged = isProse ? scan.replace(/(?<!\])\([^)]*\)/g, '') : scan;`
(скобки в прозе вырезаются как „атрибуция“) и окно пары `:1383` `` pairCache.set(v, { fwd: new RegExp(`^([^\\n]{0,16}?)${e}(?!\\d|\\.\\d)`), ``
(между словом KAIF и версией не больше 16 знаков). Проба (дерево в `$T/sc`, `git init`, ядро 2.9, `stale-claims --from 2.8 --to 2.9`):
файлы `AGENTS.md` с `Этот проект обёрнут **KAIF** (версия 2.8).`, `README.md` с `Built with the **[KAIF](https://github.com/MikalaiKryvusha/KAIF)** framework, version 2.8.` и
контролем `Построен на **KAIF 2.8**.` (входы пробы, не цитаты тикета) → вывод дословно:
```
  · README.md:3 — Построен на **KAIF 2.8**.
stale-claims 2.8 → 2.9: 1 line(s) assert an older version (read-only; a correct line takes <!-- KAIF-VERSION-OK: reason --> on it or on the line above — in a table row, inside the row)
```
Обе формы поля молчат. Вторая проба объясняет, почему русский близнец README:363 был назван, а английский — нет: в русском
`…/KAIF)** версии 2.8` слово KAIF ИЗ АДРЕСА ссылки стоит в 16 знаках от версии, в английском `…/KAIF)** framework, version 2.8` —
дальше. Вывод второй пробы (три строки README: русская с адресом истока, английская, русская с адресом `https://example.org/kaif-home`), дословно:
```
  · README.md:1 — **[KAIF](https://github.com/MikalaiKryvusha/KAIF)** версии 2.8. Целостность
  · README.md:3 — **[KAIF](https://example.org/kaif-home)** версии 2.8. Целостность
stale-claims 2.8 → 2.9: 2 line(s) assert an older version (read-only; a correct line takes <!-- KAIF-VERSION-OK: reason --> on it or on the line above — in a table row, inside the row)
``` Поле уже исправило обе строки (`README.md:363`, `:773`,
`AGENTS.md:3` теперь «2.9»).
- **Класс:** окно „имя → версия“ мерится знаками, а не словами; ссылка markdown и скобка выпадают. Близнецы — сам #117 и `ideas/32` п. 2.
- **Форма починки:** в эпике LB (`ideas/32` п. 2): скобка сразу после имени фреймворка — заявление, не атрибуция; окно пары —
  по словам после снятия цели ссылки `](…)`. Проверка: свод `s` stale-claims + обе строки поля фикстурой.

**R4 (= KUMM R2).** `framework/installer/KAIF-CORE.mjs:1240` — пункт задания говорит: `a line that RECORDS the withdrawal itself (a history note, a lesson, \"the X line is no more\") stays as it is.`
Но счёт мест (`:1200`) исключает только пути: `const WITHDRAWN_SKIP = /^(\.kaif\/|reports\/KAIF_UPDATES\/|PROJECT_HISTORY\.md$|KAIF\.md$|KAIF_(UPDATE|ADAPTATION)_TASK(\.superseded)?\.md$)/;`
и дословные строки поставки (`:1229` `if (hit.length && !upstream.has(line.trim())) {`) — никакого маркера на строке. `EXPERIENCE.md`
(«a lesson» из самого пункта), `MASTER_PLAN.md`, `KAIF_FRAMEWORK.md`, `bugs/`, `interviews/` — ходятся. Проба (`$T/wd`: ядро 2.9,
бандл v2.9 в `.kaif/install/`, `kaif.json` с историей 2.8 → 2.9, задание с пунктом `withdrawn-phrases`; в `MASTER_PLAN.md` строка 3 —
строка журнала решений `| 2026-10-16 | The hook pretool-owner-word was retired by the owner (record) <!-- KAIF-VERSION-OK: record --> |` С МАРКЕРОМ,
строка 5 — живая `We still run pretool-owner-word on every call.`; `node .kaif/kaif-core.mjs checkpoint recheck`), дословно:
```
ℹ withdrawn phrases (2.8 → 2.9) — places left now: The machinery found 2 place(s) (the records — the chronicle, reports of past updates — and lines the delivered templates carry verbatim are not places):
    · MASTER_PLAN.md:3 «pretool-owner-word»
    · MASTER_PLAN.md:5 «pretool-owner-word»
```
Запись и живое место неразличимы. Свидетель TESTED у функции мерил «none in a record» в смысле путей (`:1199` `//  0 · 0 · 11 places, none in a record; report testcases/reports/2026-10-16_ut1-withdrawn-places.md]`),
а не строк-записей, которые пункт велит оставить. Отчёт: «The agent must re-read 17 lines to find 0 live ones.» (`148.md:79`).
- **Класс:** „сканер, чей пункт признаёт законную судьбу "оставить", без машиночитаемого объявления этой судьбы — не сходится к нулю,
  и счёт растёт от честных записей“. `TWINS: searched объявляемые исключения (-ok: / -OK) по framework/installer + framework/tools —
  found 5 маркеров у других сканеров: class-ok (8 вхождений) · ref-ok (6) · KAIF-VERSION-OK (6) · constitution-ok (4) · attribution-ok (4);
  у withdrawn-phrases — 0` (он единственный из сканеров задания без объявления).
- **Кто платит:** каждое поле на каждом обновлении, где в интервале есть снятое (в 2.9 — четыре записи `deprecations` с фразами + перенос
  2.8): перечитать 8–17 строк, ≈ 5 мин на интервал (KUMM) — и навсегда, потому что записи не уходят. Шум агента + стимул не записывать.
- **Форма починки (KISS):** чтить маркер на строке или строке выше по образцу `KAIF-VERSION-OK` (`<!-- KAIF-WITHDRAWN-OK: record -->` или
  общий маркер записи) и сказать о нём в тексте пункта и в строке `recheck`. Вторая опция KUMM (пропуск закрытых интервью по `docStatus()` и
  таблиц журналов решений) — дороже и связывает ядро с контуром; не брать без нужды. Проверка: свод `s04` S14d — строка с маркером молчит,
  та же без маркера названа; мутант „маркер не читается“ красный.
- **Пересечения:** `ideas/32` — нет; тикетов — нет; `bugs/` — нет (`bugs/129` про `recheck`, но о проглоченных предупреждениях `check`).

**R5.** Правило: `framework/AGENT_GUIDE.md:564` — ``- **One tool call — one action.** `git add`, `git commit`, `git push` — each its own tool call, never chained with `&&` or `;`:``;
в `framework/hooks/` — нет хука `PreToolUse` (`ls framework/hooks/` → `README.md prompt-refresh-timer.mjs prompt-resume-word.mjs sample-*.json session-start-refresh.mjs settings-fragment.json stop-status-guard.mjs`).
«the release says so» — **PARTIAL**: заметки выпуска (`reports/RELEASE_NOTES_2.9.md:42`) о страже молчат, говорит ответ в тикет:
`reports/release_2.9/DISPOSITIONS.md:46` `the optional hook did not ship`. Отчёт: «nothing machine-held flagged it» (`148.md:83`).
Номер записи транскрипта #1670 — NOT-VERIFIABLE-HERE (JSONL сессии не читался).
- **Класс:** правило о ФОРМЕ собственного вызова агента — только проза; нарушено в той же сессии, где влито (близнец по механизму — R6
  этого же отчёта: правило о КАНАЛЕ ответа, тоже проза). `TWINS: searched "git add -A &&|&& git commit|&& git push" по framework/ — found 0`
  (цепочек в поставке нет; не-цепочкой `git add -A` стоит в трёх местах: `framework/skills/end-chat-force/SKILL.md:36`,
  `framework/skills/end-chat-soft/SKILL.md:113` — ``Otherwise: git add -A, then git commit -m "...", then git push — each its own tool call, never chained`` —
  и заполнение по умолчанию `KAIF-CORE.mjs:695` ``'<COMMIT_COMMAND>': 'git add -A, then git commit -m "<msg>", then git push — each its own tool call',``;
  критерий 15 `plans/136` (`grep -rn "git add -A" framework/skills/` → 0) сейчас даёт 2).
- **Кто платит:** пока никто — классификатор цепочку пропустил. S3.
- **Форма починки:** опциональный `PreToolUse`, отклоняющий цепочку `git add|commit|push` с `&&`/`;`, снимаемый как прочие хуки. ⚠ Это
  ОТКАЗЫВАЮЩИЙ хук — после #144 (снятие останавливающих хуков) и при #137 «только словом владельца» брать только словом владельца KAIF.
  Цена 0,25 (модуль по образцу refresh-hooks + свод).

**R6.** Правило: `framework/AGENT_GUIDE.md:643` — `2. **Answer it AT ONCE — your next output, before any further tool call — by its kind, AS TEXT, opening with its first words in «…»:**`.
Машинной половины нет по слову владельца KAIF: `framework/AGENT_GUIDE.md:650` `no hook stops the work on his other words (2.9 retired the two that did — #144).`
Исток ждал именно этого замера: `bugs/123_owner_message_mid_turn_not_read_as_command.md:3` — `DONE — после первого поля на 2.9`; и решение
№147 владельца KAIF (`ideas/32_kaif_2.10_scope.md:143–145`, цитата там идёт через перенос строк): «ответить незамедлительно на вопрос пользователя». Записи поля есть
(`D:\work\unliminiumProject\bugs\220_owner_question_mid_turn_never_answered_on_screen.md`, EXP-0217 в их `EXPERIENCE.md:115`,
`tools/probes/midturn-answer.mjs`); числа (#1509 `thinking`, #1991 первый `text`, 47 вызовов) — NOT-VERIFIABLE-HERE (транскрипт не читался).
Отчёт: «Caught by the clean-context judge, not by the agent.» (`148.md:89`), «Cost: the text answer came 7.5 minutes late» (`:90`),
«(on 2026-10-05 it was observed not to reach him)» (`:91`) — второй удар в одном проекте (EXP-0202 → EXP-0217).
- **Класс:** ответ между вызовами модель пишет в канал размышления; правило требует канал текста, носителя нет (хуки сняты №144).
  Близнецы: `bugs/123` истока (S1), закрытый #138, R5 этого отчёта (проза о собственной форме вывода).
- **Кто платит:** владелец лично — его слово 7,5 мин без ответа на экране; затем ещё вопрос ему в закрывающем сообщении („видел ли“).
- **Форма починки:** не кодом. Нужна развилка владельцу KAIF: (а) принять, что „сразу текстом“ на Claude Code не держится, и сузить правило
  до „финальное сообщение повторяет ответ“ (эта половина в поле удержалась); (б) искать машинную половину, которая не останавливает работу
  (единственный такой канал сейчас — собственное напоминание харнесса посреди хода, и отчёт пишет: «it did not help», `148.md:170`);
  (в) оставить правило и копить замеры. `bugs/123` не закрывать DONE по этому полю. Цена: вопрос 0,25; дальше — по выбору.
- **Пересечение с `plans/136`:** критерий 3 TK (#156) снимает с правила `opening with its first words in «…»` — та же строка `AGENT_GUIDE.md:643`.

### Сверка хроники (#148 §1) — сводно

- Ассеты: `sha256` ядра `e3d627b1…` и бандла `ce089603…` — **CONFIRMED** (`sha256sum` копий `dist/` v2.9: `e3d627b1e2b3`, `ce0896038085`).
- Загрузчик из тонкого `KAIF.md` = `framework/installer/KAIF-LOADER.mjs` v2.9 — **CONFIRMED** (`awk` между шестью обратными кавычками → `149 9386`, `cmp` → `IDENTICAL`).
- Строки вывода `rehearsal verdicts loaded`, `pre-update backup`, `deprecated artifact(s) kept`, `of retired KAIF hooks removed`, `KAIF hooks added`,
  `skills are English`, `budget door`, `never the text` (линтер авторства), `agent artifacts present` — **CONFIRMED** (есть в ядре/линтерах v2.9);
  счётчики их дерева (19 · 0 · 0 · 83; 102 бэкапа; 12 пунктов) — NOT-VERIFIABLE-HERE.
- Снятие автоматической записи репетиции 2.7 → 2.8 — **CONFIRMED**: `KAIF-CORE.mjs:2666` `` log(`- removed ${REHEARSAL} — the automatic rehearsal record; this update applied the receipt you named (${r.path})`) ``.
- Снятые хуки 2.9 — **CONFIRMED** мета бандла v2.9: `DEP 2.9 ["pretool-owner-word"]`, `DEP 2.9 ["stop-owner-answer","⏩"]`.
- `AGENT_GUIDE.md` 1198 строк при бюджете 1200 — **CONFIRMED** (`wc -l` дерева поля → 1198; `KAIF-CORE.mjs:157` `'AGENT_GUIDE.md': { budget: 1200,`).
  ⚠ Наблюдение (не грабля отчёта): переведённое целиком руководство Unliminium стоит на 2 строки от потолка — любая новая строка
  шаблона руководства в 2.10 даст этому полю ворота бюджета на первом закрытии.
- Локальная правка `kaif-voice-lint.mjs` под открытый #116 — трёхсторонний `git merge-file` на каждом обновлении: цена открытого #116 для
  поля, пока он не закрыт (`ideas/32` п. 2).

### Что в 2.9 сработало хорошо (#148)

«(not a defect; the policy worked)» · «Cost: one minute.» (R0, `148.md:62`, `:65`) — пункт `policy-changes` 2.9;
«the same counters, 0 verdict mismatches» (`:32`) — репетиция; «The harness (auto mode) did not refuse the write.» (`:36`) — `wire-hooks` снял
запись снятого хука; итог `stale-claims` → `0 line(s)`, линтер авторства `new 0 · debt 150`, тикеты поля 19, 22, 23, 24 → DONE (origin #115,
#127, #138, #141 закрыты в 2.9).

### Слова владельца (#148)

- Приказ сессии, дословно: «выполни resume / обнови kaif до 2.9» (`148.md:14`).
- Строка `[OWNER]` проекта 2026-10-05 23:13: «исправь хук так, что нужно ответить и остановиться, если пользователь спросил» (`148.md:63`).
- Его выбор (метка варианта написана агентом): «Ответить и работать дальше (Recommended)» ≈ 20:02 +03:00 (`148.md:65`).

---

## #153 — KUMM: обновление 2.7 → 2.9 (два выпуска одним прыжком, bootstrap + `--rehearsal`, ru-пакет, Windows 11)

**Суть:** проход механический, репетиция предсказала живой (счётчики, файл задания побайтно), фиксы 2.8 #72/#73 и якорение
`/KAIF.md` 2.9 (#130) подтверждены в поле. Главная грабля — сторона исполнителя (свой сторож обновления ослеплён первой правкой,
R1). Со стороны поставки — мелочи: записи снятого (R2 = #148 R4), рецепт дыма хуков (R3), перенос 2.8 = перевод (R4), заполнение,
указывающее в перенесённый раздел (R5), заполнения в справочнике (R6), две ложные подсказки `update-verify` (R7, комментарий 1).

### Таблица граблей

| # | что случилось | сверка с HEAD | класс | тикет? | тяжесть | цена |
|---|---|---|---|---|---|---|
| R1 | свой `tools/kaif-update-sweep.mjs`: ложное срабатывание на многострочном слоте, первая правка ослепила сторож — поймал судья мутантом | не поставка | исполнитель (TESTING гейт 5 — сработал судья) | нет — и не нужен | S2 исполнителю (≈ 35 мин) | 0 |
| R2 | `recheck` перечисляет 8 записей о снятии 2.7 на каждом интервале | **CONFIRMED пробой** (см. #148 R4) | у сканера снятого нет объявляемого исключения | **нет** — «No separate ticket» | S3 | в 0,25 #148 R4 |
| R3 | дым README хуков, строка `printf '…\\n…'`, молчит через слой инструмента агента | **CONFIRMED пробой** (и воспроизведено на машине истока) | рецепт с `\\` для исполнителя-агента | #151 (`bugs/KAIF/11`) | S3 | 0,25 |
| R4 | перенос таблиц 2.8 в `HOUSE_RULES.md` на ru-пакете — ручной перевод 44 строк, задание молчит | **CONFIRMED** | заметка миграции не знает языка развёртывания | #152 (`bugs/KAIF/12`) | S3 (судья нашёл перевёрнутую логику сторожа — потенциально S2) | 0,25 (L10N `ideas/32` п. 3) |
| R5 | заполнение `<TEST_HARNESS>` указывает в раздел, который 2.8 перенёс; править нельзя — в четырёх файлах | **CONFIRMED** (по устройству вывода заполнений) | слот копирует машинный факт в N мест | нет (наблюдение) | S3 | в `ideas/32` п. 13(б) (≈ 0,5) |
| R6 | ядро подставило заполнения проекта во фразу `.kaif/KAIF_REFERENCE.md`, объясняющую слоты | **CONFIRMED** (код + второе поле KAGO) | лексическая подстановка без исключения | #150 (`bugs/KAIF/10`) | S3 | 0,25 |
| R5a | правка НОВОЙ строки шаблона неотличима от потери — откатили комментарий `/release` шаг 6 | **CONFIRMED** (строка новая в 2.9) | „правка ≈ потеря“ у сторожа поля; у ядра — подсказка «local edits» | нет (наблюдение) | — | 0 |
| R7 | `update-verify`: две подсказки на законных заполнениях — слот `**RULE:**` «not found», строка соавтора «local edits» | **CONFIRMED пробой** (RULE) · **CONFIRMED** чтением манифеста (соавтор) | слот посреди строки; один кэш `fills` на все файлы | нет; в `ideas/32` п. 14 и п. 13(б) | S3 (шум) | в п. 14 (0,25 с близнецами) |

### Улики и форма починки по граблям

**R1.** Отчёт: «**my first fix of it blinded the guard to real losses**» (`153.md:21`). Поставки не касается; механизм поля — собственный сторож
„бандл против диска“ с 2.7 (их EXP-0117, `tools/kaif-update-sweep.mjs`), аналог поставки — «module audit» `update-verify` 2.8 (комментарий 1:
`module audit: 62 files match their deployed cut; 46 modules differ, 10 template modules absent, 483 modules are yours`). Урок — в пользу
судьи: ослабленный сторож нашёл НЕЗАВИСИМЫЙ судья мутантом. Действий в 2.10 нет.

**R2.** Механизм и проба — #148 R4. Отчёт: «The task's own rule says such lines "stay as they are", but nothing lets a project declare it»
(`153.md:86`), «Cost ≈ 5 minutes per interval. No separate ticket: the same class is R4 of» (`:88`). Дополнительная деталь KUMM: 4 из 13
мест — зеркала навыков, которые лечит `sync`, то есть список называет и производные копии.

**R3.** `framework/hooks/README.md:73` — `printf '{"prompt":"resume\\nplan the day"}' | node .kaif/hooks/prompt-resume-word.mjs`. Проба (`$T/hk`, хуки v2.9
в `.kaif/hooks/`, скрипт-файл записан инструментом записи без слоя оболочки), дословно:
```
[A] README line 73 verbatim, from a script file (no tool layer between):
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"KAIF: the o
 rc=0
[B] the same line with one backslash eaten (what a tool layer delivers):
 rc=0
[C] backslash-free probe from the ticket's wish:
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"KAIF: the o
 rc=0
```
**Воспроизведено на машине истока непреднамеренно:** первая версия пробы, записанная через heredoc `<<'EOF'` инструментом Bash этой
сессии, уже несла один обратный слеш — `od -c` строки файла: `r   e   s   u   m   e   \   n   p   l   a` — и [A] промолчал так же,
как у KUMM. Замер слоя: `printf '%s\n' 'x\\y' | od -c` → `x   \   y`, `printf '%s\n' 'x\|y' | od -c` → `x   \   |   y` (съедается
только удвоенный слеш). Исток знает класс: свой EXP-0121 (`EXPERIENCE.md:82`, `class-ok: escaping-layer`).
- **Класс:** рецепт для исполнителя-агента содержит `\\`. `TWINS: searched двойной обратный слеш в *.md поставки (framework/) — found 1:
  framework/hooks/README.md:73`; `printf '` в коде поставки — 0. Одиночные `\|` (`framework/EXPERIENCE.md:8`, `framework/skills/experience/SKILL.md:91`)
  слой не трогает — не близнецы.
- **Пересечения:** `bugs/121` истока (тот же дым «не исполняется на оболочке владельца» — 🔧, лечили блоками по оболочкам); `ideas/32` — нет.
- **Форма починки:** строка POSIX-блока без обратного слеша (JSON собирает `node`, как в пожелании) + страж сборки „в *.md поставки нет `\\`
  внутри код-блоков-рецептов“. Проверка: `check-framework` новый страж, красный на нынешней строке 73. 0,25 (с текстом „если вторая строка
  молчит…“ в `:89`, который сейчас велит проверять JSON, но не называет слой агента).

**R4.** Скелет: `framework/templates/_house-rules-template.md:6` — ``> copy is written in the project's working language (`.kaif/kaif.json` → `language`), headings``.
Новость 2.8: `tools/build-framework.mjs:319` — ``move your tables and recipe into `HOUSE_RULES.md` (no file yet → `cp .kaif/_house-rules-template.md HOUSE_RULES.md`), leave the pointer line,``
(о языке ни слова; «A guide translated wholesale does the same by hand.» — о переведённом целиком руководстве, не о ru-пакете). Пункт
`language-arrivals` судит только НОВЫЕ файлы выпуска: `KAIF-CORE.mjs:1693` `` items.push(['language-arrivals', `This deployment's language is ${LANG}, and these NEW files of the release arrived in ENGLISH: ``.
Отчёт: «An independent judge found one rendered row whose Russian inverted a guard's logic» (`153.md:105`), «Cost ≈ 25 minutes.» (`:113`).
- **Класс:** перенос между файлами разного языка не назван переводом. Близнец в `ideas/32` п. 3 (L10N: KAGO R9 «язык скелета домашних
  правил по неверному читателю»; 8 указателей канона на английские заголовки, которых в переводе нет) — KUMM решил это английским именем
  раздела в скобках.
- **Форма починки:** одна фраза в заметку миграции 2.8 и в пункт задания „на развёртывании с языком ≠ en перенос — перевод строк в язык
  `HOUSE_RULES.md`; команды, пути, цитаты — дословно“ + английские имена разделов якорями в скелете. Проверка: свод на ru-развёртывании
  2.7 → 2.9 — пункт называет перевод. 0,25 в эпике L10N.

**R5.** Устройство: `KAIF-CORE.mjs` комментарий к выводу заполнений — `// group; a repeated slot → a back-reference to its first capture), then judge "untouched modulo` и
`// negative lands on the safe side (the file stays "diverged", as in 2.5). The derived map is cached` — правка заполнения в одном из четырёх
файлов делает остальные „разошедшимися“. Отчёт: «Changing the fill means changing it in all four files that carry it, or the next update
stops recognizing it» (`153.md:118`). Пересечение: `ideas/32` п. 13(б) — `<BUILD_COMMAND>` · `<TEST_HARNESS>` копируют машинный факт в
12 мест, лечение — указатель на `HOUSE_RULES.md`. Это третье поле для п. 13(б).

**R6.** Фраза: `framework/KAIF_REFERENCE.md:308` — ``adaptation task filled into slots the machinery could not fill (`<BUILD_COMMAND>`, `<TEST_HARNESS>`,``.
Подстановка лексическая по всему не-`.mjs` тексту: `KAIF-CORE.mjs:728` `if (v) out = out.split(ph).join(v);` и при замене
нетронутого файла `:2332` `const want = f.path.endsWith('.mjs') ? content : withFills(content);`. На диске (только чтение) —
`D:\work\ai_sandbox\KUMM\.kaif\KAIF_REFERENCE.md:308`: «(`node --check kumm.mjs`, `node kumm.mjs check --json / .\Deploy-ModPack.ps1 -Verify -PackDir <pack>; full table in AGENT_GUIDE.md "Test harness"`,»
и ВТОРОЕ поле — `D:\work\ai_sandbox\KAGO\.kaif\KAIF_REFERENCE.md:308` (2.9): «(`npm run check`, `npm run gpu:info`,». KUIPS, KrinikCam, Unliminium
— фраза нетронута (их слоты не заполнены выводом). Отчёт: «Harmless here, wrong in principle» (`153.md:133`).
- **Класс:** подстановка заполнений не знает „упоминания слота как слота“. `TWINS: searched код-спаны PLACEHOLDERS (`<BUILD_COMMAND>` …
  `<OWNER_LANGUAGE>`) в объяснительных текстах поставки (KAIF_REFERENCE, templates, readmes, hooks/README, *_FRAMEWORK.md, skills
  kaif-update/help-kaif/kaif-version) — found 1: framework/KAIF_REFERENCE.md:308`; прочие вхождения — настоящие слоты навыков/шаблонов.
  Тот же путь подставляет и при каждом проходе по поставке (`:2297` `let content = f.path.endsWith('.mjs') ? f.content : fillPlaceholders(f.content, values, unresolved);`),
  то есть и при установке, если `<BUILD_COMMAND>` выведен из `package.json`.
- **Пересечение с `plans/136`:** критерий 12 UB (#150) — проверка «строка справочника о слотах содержит `<BUILD_COMMAND>` после обновления» совпадает с формой выше.
- **Форма починки:** переписать фразу справочника без литералов слотов (имена без угловых скобок или ссылкой на таблицу `_intro.md`) +
  страж сборки „KAIF_REFERENCE.md не несёт литералов PLACEHOLDERS“. Проверка: свод s21 — заполнения выведены, строка 308 после замены
  нетронута. 0,25. Разбирает главный разведчик #150.

**R5a.** `git show v2.8:framework/skills/release/SKILL.md` → `136:# bump version (in version.json or your manifest), then:`; HEAD →
`framework/skills/release/SKILL.md:136` `# bump version (in version.json or your manifest), then — ONE tool call per line, never chained (AGENT_GUIDE.md → Git workflow):`
— строка действительно новая в 2.9. Отчёт: «upstream line is indistinguishable, for the sweep, from a lost one» (`153.md:168`). Ядро ту же
двусмысленность решает подсказкой «stands on disk with local edits» (`KAIF-CORE.mjs:3138`) — для поставки это не грабля.

**R7 (комментарий 1 + локальная копия отчёта).** Подсказки дословно (локальная копия): `promised upstream line not found on disk … AGENT_GUIDE.md :: **RULE:**`
и `promised upstream line stands on disk with local edits … Co-Authored-By: Claude <noreply@anthropic.com>`. Комментарий: «Two advisories, both this
project's filled slots: the Architecture `**RULE:**` slot carries our invariant, and the `Co-Authored-By` line carries the model name.» (`153.md:241`).
- (а) Слот посреди строки: шаблон `framework/AGENT_GUIDE.md:509` ``**RULE:** `<state the key architectural invariant, e.g. "feature modules don't depend on each other">`.``;
  правило слота `KAIF-CORE.mjs:3324` `` if (!open && t.startsWith('`<') && (t.endsWith('>`') || t.indexOf('`', 1) < 0)) open = true; `` — строка
  начинается с `**RULE:**`. Проба `slots.mjs` (функция `instructionSlotLines` вырезана из копии ядра и вызвана на шаблоне): `recognized as an instruction slot: false`.
  TWINS: searched слот `` `< `` не в начале строки в `framework/AGENT_GUIDE.md`, `framework/skills/*/SKILL.md`, `framework/templates/*.md` — found 3 в
  сливаемых файлах: `framework/AGENT_GUIDE.md:509` · `framework/AGENT_GUIDE.md:1064` (``- `<add language/framework-specific rules here>` ``) ·
  `framework/skills/release/SKILL.md:103` (последний — уже в `ideas/32` п. 14); строки таблиц `_owner-voice-template.md` — скелет, не сливается. Заметки выпуска 2.9 п. 6 говорят о прыжке 2.1 → 2.8: «каждая из 45 — настоящее расхождение» — на этом поле
  ложное «not found» осталось, то есть класс п. 14 жив и в `update-verify`, не только в `check`.
- (б) Строка соавтора: кэш `D:\work\ai_sandbox\KUMM\.kaif\deploy-manifest.json:4135` `"<YOUR AGENT/MODEL>": "Claude",`, а на диске
  `AGENT_GUIDE.md:656` «Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>»; обещанная строка сверяется с заполнением из
  кэша (`KAIF-CORE.mjs:3129` `const promised = line.slice(2), filled = fillPlaceholders(promised, fills, new Set());`) — одно значение слота на все
  файлы. Это `ideas/32` п. 13(б) («кэш `fills` побеждает правку владельца»), новая форма.
- **Форма починки:** (а) — п. 14: слот открывается и посреди строки (после `**…:**` или маркера списка); (б) — в п. 13(б). Шум, S3.

### Наблюдение без грабли (#153): маршрут

Отчёт: «the `update` route would run the interval with the deployed 2.7 core» (`153.md:34`) — **CONFIRMED**:
`framework/skills/kaif-update/SKILL.md:31` ``Route note: `update` runs the interval with your CURRENTLY DEPLOYED core (the fresh one is`` и
`KAIF-CORE.mjs:4480` ``// The hand-over of the closing-gates forecast (2.8, epic CK, step CK5.6): `update` writes its task with the core that was``.
Оба отчёта выбрали bootstrap. Ядро уже несёт три „передачи“ в `recheck` ради маршрута `update` старым ядром (прогноз ворот, withdrawn,
ignore-first, `:4480–4510`). Вопрос на 2.10 (не грабля): не сделать ли bootstrap единственным маршрутом обновления — Оккам.

### Сверка хроники (#153 §1) — сводно

- Ассеты: размеры `KAIF-CORE.mjs` 428 432 B, `KAIF-CORE-BUNDLE.md` 1 953 491 B, `KAIF.md` 15 353 B и пины — **CONFIRMED** (`wc -c` копий `dist/` v2.9:
  `428432`, `1953491`, `15353`). Загрузчик «9 386 B, 149 lines» — **CONFIRMED** (`149 9386`, `IDENTICAL`).
- Якорение `/KAIF.md` (#130) — **CONFIRMED**: `KAIF-CORE.mjs:485` ``// SW5 (2.9, origin issues #130 · #126, ideas/31 p. 5): the ROOT transients are ANCHORED (`/KAIF.md`) — an unanchored `KAIF.md` matched``.
- Ось `check` незаполненных слотов ритуала (7 слотов с 2.2) — **CONFIRMED**: `KAIF-CORE.mjs:3985` `is still the template's instruction slot`.
- Отказ `--write-baseline` без `--adopt-new` — **CONFIRMED**: `framework/tools/kaif-attribution-lint.mjs:396` `// launder a NEW finding into debt is refused — growth is an explicit, printed act (--adopt-new).`
- Свёртка истории линтера опыта — **CONFIRMED**: `framework/tools/kaif-experience-lint.mjs:291` `predate`…`the first classed entry`.
- Grok читает `.claude/settings.json`, у Cline и Zoo Code хуков нет — **CONFIRMED**: `framework/hooks/README.md:117`, `:120`, `:121`.
- Правила интервала: 6 × [2.8] + 3 × [2.9] — **CONFIRMED** мета бандла v2.9 (`policyChanges`: `2.8 1…6`, `2.9 1…3`, тексты совпадают по смыслу с §5 отчёта).
- Счётчики их дерева (49 · 12 · 2 · 51; 100 бэкапов; 11 пунктов; 175 зеркал; 152 артефакта) — NOT-VERIFIABLE-HERE.

### Что в 2.9 сработало хорошо (#153)

- «None from the framework's side that cost a merge or lost a line» (`153.md:17`)
- «the 2.8 fixes of our own tickets #72 and #73 worked in the field» (`153.md:18`)
- «it un-hid two pointer files of this tree» (`153.md:20`, якорение #130)
- «the sandbox predicted the live pass for the third interval in a row on this deployment» (`153.md:158`)
- `--write-baseline` «refused to adopt them without `--adopt-new` (good)» (`153.md:44`) и «it made the executor ground six lines instead of hiding them» (`153.md:161`)
- «the refresh-timer hook wired into the new `.claude/settings.json` FIRED in this very» … сессии (`153.md:179`)
- комментарий 1: `✅ update-verify passed — the update is complete and self-cleaned` (`153.md:241`)

### Слова владельца (#153)

Нет. Владелец упомянут только пересказом агента («in KUMM since 2026-09-18 by his word», `153.md:186`) — дословных его слов в тикете нет.
Времени владельца отчёт не стоил: вопросов не было, очередь — «no owner debt» (`153.md:48`).

---

## Классы, общие для обоих отчётов

| класс | #148 | #153 | вердикт | статус в истоке |
|---|---|---|---|---|
| записи о снятии считаются „местами“ `recheck` | R4 (13 → 17) | R2 (8 → 8) | CONFIRMED пробой | **не заведён нигде** — кандидат в 2.10 |
| судья чистого контекста ловит то, чего не видит исполнитель | REFUTED → VERIFIED (3 прохода) | REFUTED → VERIFIED WITH CAVEATS (2 прохода) | сработало | держать обязательным |
| bootstrap + `--rehearsal` + локальный `--source` предсказывает живой проход | 0 mismatches | 0 mismatches, 3-й интервал подряд | сработало | вопрос: оставить ли маршрут `update` |
| `policy-changes` „принято с версией“ | один законный вопрос | ни одного | сработало | — |
| ru-развёртывание платит за английскую исходную форму поставки | R1, R2 (словарь контура) | R4 (перенос = перевод) | CONFIRMED, разные механизмы | `ideas/32` п. 3 L10N (частично) |
| правило о собственной форме вызова/вывода агента — только проза | R5 (цепочка git), R6 (канал ответа) | R3 (рецепт против слоя экранирования) | CONFIRMED, механизмы разные; общее — харнесс, а не репозиторий | R6 — развилка владельца; R3 — 0,25 |

**Что стоило времени владельцу лично (оба отчёта):** только #148 — R0 (минута, законный вопрос) и R6 (его слово посреди хода 7,5 мин без
текстового ответа + вопрос ему в закрывающем сообщении, видел ли он ответ). #153 — ничего.

---

## Итоговая таблица

Колонка эпика сверена с `plans/136_EPIC_kaif_2.10.md` (появился на диске во время разведки, ≈ 02:26 +03:00): номер критерия — если грабля
им уже покрыта; „НЕ покрыто“ — если ни один критерий её не называет (критерий 15 UB велит «по строке на подтверждённую разведкой граблю»).

| тикет · грабля | вердикт сверки | тяжесть | цена | кандидат-эпик (рабочее имя) |
|---|---|---|---|---|
| #148 R0 — вопрос на коллизии с `[OWNER]` | CONFIRMED (политика сработала) | — | 0 | — |
| #148 R1 → #147 — ru «выше»-сравнение | CONFIRMED пробой | S3 (S2 на поставочной странице) | 0,25 вместе с R2 | TK п. 5 — покрыто |
| #148 R2 → #109 (комм. 3) — статус «↪️ СВЁРНУТО» | CONFIRMED пробой (число 11 — NOT-VERIFIABLE-HERE) | S3 | в 0,25 выше | TK п. 7 — НЕ покрыто (п. 7 — обратный случай 🟡 «отвечено»; „свёрнуто“ дописать туда же) |
| #148 R3 → #117 (комм. 3) — скобка и ссылка в `stale-claims` | CONFIRMED пробой | S3 | 0,25 | HC п. 16 — скобка покрыта; форма „`](…)** framework, version N`“ НЕ покрыта |
| #148 R4 + #153 R2 — записи снятого как „места“ | CONFIRMED пробой, два поля | S3 (каждое обновление, навсегда) | 0,25 | UB п. 15 — НЕ покрыто строкой; рабочее имя WR „Записи снятого — не места“ |
| #148 R5 → #146 — цепочка git без стража | CONFIRMED · «release says so» PARTIAL | S3 | 0,25 + слово владельца | НЕ покрыто (хук — только словом владельца, №144/#137) |
| #148 R6 → #144 / `bugs/123` — ответ лёг размышлением | правило CONFIRMED; числа — NOT-VERIFIABLE-HERE | S2 (класс S1) | 0,25 вопрос владельцу; починка — по выбору | TK п. 3 трогает ту же строку; замер — НЕ покрыт (развилка владельца) |
| #153 R1 — сторож поля ослеплён (исполнитель) | не поставка | S2 исполнителю | 0 | — |
| #153 R3 → #151 — `\\` в дыме хуков | CONFIRMED пробой + воспроизведено в истоке | S3 | 0,25 | UB п. 13 — покрыто |
| #153 R4 → #152 — перенос 2.8 = перевод | CONFIRMED | S3 (S2 потенциально) | 0,25 | UB п. 14 — покрыто |
| #153 R5 — заполнение в перенесённый раздел | CONFIRMED | S3 | ≈ 0,5 (`ideas/32` п. 13(б)) | НЕ покрыто (`ideas/32` п. 13(б) в `plans/136` не взят) |
| #153 R6 → #150 — заполнения в справочнике | CONFIRMED + второе поле (KAGO) | S3 | 0,25 | UB п. 12 — покрыто |
| #153 R5a — правка новой строки ≈ потеря | CONFIRMED (строка новая в 2.9) | — | 0 | — |
| #153 R7 (комм. 1) — слот посреди строки и кэш соавтора в `update-verify` | CONFIRMED пробой + чтение манифеста | S3 (шум) | 0,25 с тремя близнецами (`ideas/32` п. 14) | НЕ покрыто (`ideas/32` пп. 13(б), 14 не взяты) |
| #153 — маршрут `update` старым ядром | CONFIRMED (наблюдение) | — | вопрос | вне эпиков — Оккам-вопрос владельцу |
| #148 — руководство на 1198 из 1200 | CONFIRMED (наблюдение) | — | 0 | помнить в UB: новая строка шаблона руководства → ворота бюджета у Unliminium |

