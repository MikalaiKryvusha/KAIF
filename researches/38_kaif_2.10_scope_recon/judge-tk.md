# Судья (лёгкий) — шаги TK1–TK4 версии KAIF 2.10, коммит `2bc9465` (исток KAIF, сессия 88)

**Судил:** `/fable-judge`, KAIF-блок, по брифу `researches/38_kaif_2.10_scope_recon/JUDGE_TK_BRIEF.md` · 2026-10-18 ≈ 03:15 +03:00.
**Предмет:** только `git show 2bc9465`. Правки главной сессии в рабочем дереве поверх коммита (BUG_FIXING обоих слоёв, autoloop,
code-revision, resume) я не судил. Поэтому валидатор прогнан на чистой копии дерева `2bc9465`, а не на рабочем дереве.
**Тишина соблюдена:** в истоке только чтение. Запускались три пробы истока и мои помощники в скретчпаде (`recon/jtk-*.mjs`, каталоги — во
временном каталоге ОС, после прогона удалены). `test:core`, `verify-contour`, сборку, `KAIF_DIST` не запускал. Цитат из транскрипта в
дайджесте нет, только счётчики и метки времени.

## Общий вердикт: **VERIFIED WITH CAVEATS**

Каждое заявление, которое я переисполнил, совпало с выводом. Вердикт REFUTED по пункту не вынесен. Есть одна находка против слова владельца:
она в обвязке истока, а не в поставке (охота 2). Ещё есть несколько мест, где текст шире стража или проверки.

---

## Охота 1. «Критерий 3 ✅», «критерий 4 ✅» — переисполнение строк «Проверка» — **VERIFIED** (с оговоркой о природе проверок)

**Критерий 3.** Его строка «Проверка» дословно:
```
$ grep -rniE "first words|opening it with|открыв ответ" framework/ AGENT_GUIDE.md .claude/skills/
(пусто) · exit=0
$ git grep -niE "first words|opening it with|открыв ответ" 2bc9465 -- framework/ AGENT_GUIDE.md .claude/skills/
(пусто)
```
Ожидалось «только записи истории §17 и журнала», получено 0 строк. Это подмножество ожидаемого.
Гард 5v доказан красным на текстах v2.9:
```
$ node tools/sandbox/probes/tk1-opening-red.mjs
OK  guard 5v — control copy: 0 line(s) «5v:»
OK  guard 5v — the v2.9 guide and builder notes: 2 line(s) «5v:» (expected 2: the guide's rule, the 2.9 note)
    - 5v: framework/AGENT_GUIDE.md:643 prescribes how the answer to the owner opens (#156) — drop the clause, do not invert it
    - 5v: tools/build-framework.mjs:295 prescribes how the answer to the owner opens (#156) — drop the clause, do not invert it
✅ guard 5v is red on the v2.9 texts exactly where named; the control copy is silent
```

**Критерий 4.**
```
$ node tools/sandbox/probes/tk4-manager-stop-red.mjs
OK  «manager stop» pairs — control copy: 0 line(s)
OK  «manager stop» pairs — the v2.9 templates and guide: 5 line(s) (expected 5)
✅ the «manager stop» pairs are red on the v2.9 texts exactly where named; the control copy is silent
```
Пробы копируют рабочее дерево, а оно сейчас шире коммита. Поэтому валидатор прогнан ещё раз на чистой копии `2bc9465`
(мой `recon/jtk-check-at-commit.mjs`, файлы взяты через `git show 2bc9465:<f>`):
```
rev 2bc9465 · files 1275 · check-framework exit 0
5v lines: 0
manager stop lines: 0
error-ish lines (✖|❌|ERROR|broken): 0
✅ check-framework OK — 59 embedded files … dist OK (bundle 184 blocks, sha256 fresh, notes name KAIF 2.9 — Distilled KAIF) …
```
Слова «сборка отказывает без строки» проверены по коду: `check-framework.mjs:1425` пишет `errors.push(…pair … broken…)`, а сборщик
вызывает его через `execSync` (`build-framework.mjs:797`).
Заявление «полигон 28/28 после TK2–TK4» я не перепрогонял (запрещено брифом). Проверил чтением лога главной сессии `scratchpad/polygon3.log`:
`2026-10-18 02:57:59` → `✅ sandbox suite: all 28 suites green` · `exit=0` · `03:04:45`. Прогон `polygon2.log` дал
«8 of 28 suites FAILED». Это прогон над CRLF-бандлом, который, по сообщению коммита, был остановлен и повторён, и это сходится.

**Оговорка.** Обе строки «Проверка» проверяют только текст: строка стоит или не стоит. Поведенческая часть «Результата» (работник
закрывается тем же ходом; ответ без заготовки в живом ходу) ничем не наблюдалась. Отчёты честно ставят вердикт `partial`. Значит, ✅ в
`plans/136` означает «Проверка, как она написана, пройдена», а не «поведение подтверждено».

## Охота 2. Слово владельца в #156: ни предписания, ни запрета начала ответа — **CAVEAT** (поставка чиста; в обвязке две живые строки против его слова)

Слово владельца (#156, дословно): «Не давайте этого указания "начинай со слов владельца" - просто не упоминайте этой инструкции. И не
говорите в инструкции "не начинай со слов владельца" - не говорите, с чего ИИ агенту начинать, пусть он сам решает».

**Поставка — VERIFIED.** Искал шире «first words»: формы open/start/begin/lead/quote… with his/the owner's, русские «первыми словами», «с
его слов», «открывай», «начинай», немецкие и испанские формы.
```
$ git grep -niE "(open|opens|opening|start|…|begin…)( it| the answer| …)? with (the|his|its|a quote|quot|the owner)|first words|quote (his|the owner)|…" 2bc9465 -- framework/ tools/build-framework.mjs
→ ни одной строки об ответе владельцу (совпадения — «OPENS with its goal vector», «opens with the word `resume`», «quote the owner's word
  for that meaning» в /release и т. п.; ни одно не говорит, чем открывается ответ на слово владельца)
$ git grep -niE "первыми словами|первых слов|ёлочк|открыв ответ|начинай|…|first words|primeras palabras|premiers mots|ersten Worte" 2bc9465 -- framework/ tools/build-framework.mjs
(пусто)
```
Пункт 2 правила в поставке теперь: «**Answer it AT ONCE — your next output, before any further tool call — by its kind, AS TEXT:**». Это
дословно предложение тикета, на месте снятого ничего не поставлено. Охоты судьи на начало ответа нет. Гард живёт в сборке, а не в каноне
(комментарий 5v: «The owner asked that the instruction be dropped, not inverted, so this lives in the build»). Это сходится с его словом.

**Справочник §17 и нота 2.10 — законны, но с оговоркой о формулировке.** §17 — запись истории: «by his request the rule says nothing about
the opening, neither a prescription nor a ban». Нота 2.10 №1 — миграция: «if your own texts … prescribe how your answer to the owner
opens, delete that line». Это не предписание и не запрет агенту, а след и задание удалить чужую копию указания. Миграция нужна на деле:
собственный EXPERIENCE истока такую копию несёт (ниже). Оговорка: обе записи цитируют владельца обрывком «do not start with my words»,
и полевой агент читает его ровно как запрет, который владелец просил не писать. Чище перевести вторую половину его слова: «его задача —
ответить незамедлительно и продолжить работу».

**Обвязка истока — две живые строки против его слова (находка):**
```
$ git grep -nIiE "его словами|его первыми|…|открывается его" 2bc9465 -- . ':!PROJECT_HISTORY.md' ':!researches/' …
STATUS.md:51:   НЕ открывается его словами (#156: «это БАГ КАИФ, который меня бесит»). …
EXPERIENCE.md:355:**Trigger:** владелец пишет посреди хода → ответ отдельным сообщением (без вызова), открытым его первыми словами; …
```
- `STATUS.md:51`, абзац «Как говорить с владельцем (оплачено этой сессией)»: «ответ на его слово НЕ открывается его словами». Это
  инструкция следующему чату, и она дословно та обратная форма, которую он просил не говорить. Строка стояла до коммита, коммит её
  переписал вместе с соседним текстом и сохранил.
- `EXPERIENCE.md:355`, поле **Trigger** записи EXP-0174 (это то поле, по которому агент решает, когда применять урок): «ответ … открытым
  его первыми словами». Миграцию ноты 2.10 («experience … delete that line») исток к себе не применил. Строку «Механизация» под ней
  поправили, а Trigger остался прежним.
- Строку `STATUS.md:64` («обычным ответом без предписанного начала (исправлено … стояло «…»)») считаю законной: это запись исправления
  по канону «стоит ложь».

Ни одна из двух строк не в поставке, поэтому критерий 3 они не валят. Но это канон, который агент истока читает на `/resume`.
Поправка: STATUS:51 — удалить фразу; Trigger EXP-0174 — «ответ сразу текстом, работа дальше в том же ходу».

## Охота 3. Бюджет руководства — **VERIFIED** (строк 0; байты выросли)

```
$ wc -l framework/AGENT_GUIDE.md                      → 1080
$ git show v2.9:framework/AGENT_GUIDE.md | wc -l      → 1080
$ git show 2bc9465:framework/AGENT_GUIDE.md | wc -l   → 1080
$ wc -c: v2.9 86157 → 2bc9465 86738 (+581 байт, +0,67 %)
payload line 67 length: v2.9=103 now=372 chars
```
Прирост строк 0, как требует ограничение `plans/136` («чистый прирост строк руководства за версию — 0; проверка — `wc -l`»). Но держится он
тем, что строка 67 («Работа до названного времени») выросла с 103 до 372 знаков. Для бюджета, который считается строками, этого
достаточно, и строк длиннее 500 знаков в шаблоне и до этого было несколько. Однако цена чтения выросла. Корневое руководство (обвязка)
выросло на 3 строки (1185 → 1188), ограничение его не касается.

## Охота 4. Близнецы правила конца хода (#140/#157) — **CAVEAT**

Три места ожидания из дайджеста разведки коммит не тронул (fable-method, fable-loop, release в диффе отсутствуют):
```
framework/skills/fable-method/SKILL.md:127  … `PENDING: <the action> - awaiting your authorization`, verbatim.
framework/skills/fable-loop/SKILL.md:36     6. Outward-facing checklist items obey the method's authorization gate: … converts to a proposed next step in the report.
framework/skills/release/SKILL.md:12        > ⚠️ **CONFIRMATION REQUIRED.** Before the publish itself, show the human: …   (и :130 «Publish (after the human's confirmation)»)
```
- **Названы:** все три перечислены в `plans/137`, раздел «Что принёс дайджест», TK2. Для fable-method и fable-loop там есть причина: «оба
  вендорены — носитель только в точке вызова руководства». Для `/release` (свой навык KAIF, не вендорен) причины нет и ничего не сделано.
- **Строки `TWINS:` у класса TK2 нет.** В коммите и отчётах есть только `TWINS:` у TK2б (`grep "when ready|когда будет готово"`). Её я
  перепроверил: кроме уже правленого `/autoloop`, ни одного места с «ожидание фоновой задачи кончает ход» в `framework/skills` и
  `.claude/skills` нет.
- **Строки `FORK:` о носителе нет, хотя план её требовал.** `plans/137` TK2: «`FORK:` формы носителя … кандидаты — строка в шаге «доложи»
  fable-цикла KAIF-обязательств · строка в навыках `/interview` и `/owner-reviews` · охота судьи». В коммите `FORK:` встречается только в
  `researches/39` (шаг MM1). Носитель встал в тот же раздел руководства («Решения, которые агент НЕ должен принимать в одиночку»), где
  стояло правило зова 2.8. А риск (а) того же плана говорит: KAGO прочитал правило и не позвал, значит носитель должен стоять в точке
  решения, а не в разделе далеко от неё. Критерии 1–2 честно не закрыты («ждут замера»), поэтому это не опровержение. Но ровно здесь
  замер может выйти красным.
- Проба TK3 по живому транскрипту сессии 88 (без `--quote`) совпала с заявлением:
  `turns judged: 7 · wait without a call: 3 · permission question for own work: 0 · ended while a background task … had not reported: 2`.
  Случай `bugs/131` назван: ход 2026-10-17T23:26:00Z, `ENDED-WITH-LIVE-BACKGROUND (1)`. Все судимые ходы были до правки. Последний ход,
  открытый 23:44Z, проба не судит. Самопроверка: `--selftest` → 6 строк `ok` и `selftest: all ok`. Это 6/6, как заявлено.

## Охота 5. Правка строки «Проверка» критерия 4 — **CAVEAT** (обоснована, но не строго строже)

Было: «Свод на шаблон конституции команды и правило «Слово владельца посреди хода» п. 1 **обоих слоёв** — строка о ведущей сессии стоит и
стережётся». Стало: три пары таблицы близнецов. Это шаблон конституции поставки и обвязки плюс п. 1 руководства **только поставки**:
```
check-framework.mjs:1224  ['manager stop ↔ … (payload)',  framework/…/team-constitution-template.md …]
check-framework.mjs:1227  ['manager stop ↔ … (wrapper)',  .claude/…/team-constitution-template.md, ['Одно исключение — стоп и закрытие от Менеджера', …]]
check-framework.mjs:1230  ['manager stop ↔ the guide names the exception … (payload)', framework/AGENT_GUIDE.md …]
```
- Сильнее: проверка судит каждую сборку и доказана мутантом с адресатами, названными до прогона (контроль 0, v2.9 — 5). Тот же класс «строка
  стоит» в шаблонах этой таблицей уже стережётся, так что выбор последователен.
- Слабее: п. 1 корневого `AGENT_GUIDE.md` («исключение — стоп и закрытие от Менеджера развёрнутой команды: правило 9 …») не стережётся
  ничем. Старая строка требовала «обоих слоёв», новая это молча сузила. Обоснование в коммите («страж сборки строже свода») верно по
  частоте, но не по охвату. Доставку в поле (шаблон → бандл → развёрнутый проект) по-прежнему держат общие проверки бандла
  (`sha256 fresh`), а не эта пара.
- Сверх строки «Проверка»: тикет #137 и шаг TK4 плана шире сделанного. План: «сообщение ведущей сессии работнику — слово владельца,
  переданное по конституции». Владелец в тикете: «если ты main написал им - это почти равно моему слову владельца» · «тебя они должны
  слушаться». Внесено только исключение «стоп и закрытие». Для критерия 4 («закрывайся сейчас») этого хватает, но сужение не записано
  решением `[ИИ]` и не вынесено в реестр следующей версии.
- Мелкое: сверка ядра (`KAIF-CORE.mjs` около 4190, «constitution-keeps-obligations») сравнивает только жирные заголовки правил § 2.
  Сгенерированная конституция поля без нового исключения в правиле 9 в `check` не всплывёт. Держит пункт 1 руководства (модуль, его
  обновление перепишет) и миграционная нота. Поведение от этого не страдает, но сказать об этом стоит.

## Охота 6. Пары реестра и концы строк — **VERIFIED**

```
$ diff <(git show 2bc9465:framework/skills/fable-judge/SKILL.md) <(git show 2bc9465:.claude/skills/fable-judge/SKILL.md) → IDENTICAL (committed)
$ cmp framework/skills/fable-judge/SKILL.md .claude/skills/fable-judge/SKILL.md → byte-identical
$ git ls-files --eol -- <19 правленых/новых файлов> → все «i/lf w/lf attr/text=auto eol=lf»
$ (все файлы коммита) git show 2bc9465:<f> | tr -cd '\r' | wc -c → 0 у каждого
$ file framework/skills/fable-judge/SKILL.md …/autoloop/SKILL.md (оба слоя) framework/AGENT_GUIDE.md AGENT_GUIDE.md
  → «Unicode text, UTF-8 text, with very long lines (…)» — без «CRLF line terminators»
```

## Охота 7. Ноты сборщика доезжают дословно — **VERIFIED** для 2.9 · **CAVEAT** для 2.10 и §17

- **Нота 2.9** теперь: «"The owner's word mid-turn" now says: answer at once as text, then WORK ON in the same turn …». Это дословно
  предложение тикета. Ни одна нота сборщика больше не обещает начало ответа (5v зелёный на всём `build-framework.mjs`, `grep` по «first
  words|words quoted|opening» в нотах пуст). Новая редакция в бандле есть: `git grep -c "now says: answer at once as text, then WORK ON"
  2bc9465 -- dist/` → `dist/KAIF-CORE-BUNDLE.md:2`. Нота 2.10 пока инертна: `version.json` всё ещё 2.9, build 772.
- **Ноты 2.10 №2 и №3** («whose step it is», «does not stand still while it waits») совпадают с поведением: строки руководства, `/autoloop`
  без «continue when ready», охоты судьи «Leave asked for own work» и расширенная «Early finish» на месте.
- **Нота 2.10 №4:** заголовок «THE MANAGER'S STOP **REACHES** EVERY SEAT OF A TEAM» шире поведения. Правка решает, исполнить ли стоп, а не
  доставку сообщения. Тело ноты точное.
- **Справочник §17** говорит «the build refuses a shipped line that brings the prescription back», а гард 5v — регулярка ровно одного
  семейства фраз. Мой стенд `recon/jtk-5v-regex.mjs` (регулярка скопирована дословно со строки 1016) дал: v2.9-пункт и v2.9-нота →
  `RED`. Пять перефразировок молчат: «start the answer with the owner's first words», «begin your reply with his words», «quote the
  owner's first words at the top», «lead the answer with the owner's words», «open the answer with his words». Запись справочника шире
  стража. Честнее «refuses the removed clause in its 2.9 wording», либо расширить регулярку на start|begin|lead|quote.

## Мелкие «стоит ложь» в записях коммита

- `plans/137` строка 6: «**Статус:** ⏳ НЕ НАЧАТ — первый эпик 2.10; старт — нулёвка TK0», хотя TK0–TK4 отмечены `[x]`.
- В сообщении коммита написано «plans/136 (… «закрыто 1 из 20» …)», а в `plans/136` стоит «закрыто 2 из 20». Заголовок коммита «шаги
  TK1–TK3», а тело включает TK4. Сообщение уже не поменять, след исправления можно оставить в следующем коммите.
- Там же «HOUSE_RULES §1 — строки двух проб», а внесено три строки (tk1-opening-red · tk1-wait-call-scan · tk4-manager-stop-red). Это
  преуменьшение, не ложь.

## Что предлагаю главной сессии (по убыванию цены)

1. `STATUS.md:51` — удалить «ответ на его слово НЕ открывается его словами». `EXPERIENCE.md:355` (Trigger EXP-0174) — «ответ сразу
   текстом, работа дальше в том же ходу». Это слово владельца в #156.
2. Строка `FORK:` о носителе TK2 и строка `TWINS:` класса TK2. `/release` (подтверждение публикации) нужно либо закрыть зовом, либо
   назвать с причиной.
3. Справочник §17 сузить до того, что держит 5v, или расширить регулярку. Заголовок ноты 2.10 №4 — «IS OBEYED», а не «REACHES».
4. Добавить пару близнецов на п. 1 корневого руководства (RU), иначе строка «Проверка» критерия 4 молча уже прежней. Записать решением
   `[ИИ]` сужение #137 до «стоп и закрытие» (остальные приказы ведущей — в реестр 2.11).
5. Статус `plans/137` → «🔧 В РАБОТЕ: TK0–TK4 внесены, TK5–TK6 впереди».
