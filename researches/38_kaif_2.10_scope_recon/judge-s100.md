> «Красный прогон — заявление о ВЕЩИ, и зарабатывается оно так же, как зелёное» — `TESTING_FRAMEWORK.md` § «Красное — тоже заявление».

# Лёгкий судья сессии 100 — правило скобки HC2 · маркер UB6 (е) · пробы находок 7 и 8 · счёт 14 из 35 · стоячая ложь

**Создан:** 2026-11-17 10:58 +03:00 (проба часов в начале 10:46:24) · **Судья:** Claude Opus 5.5, `/fable-judge`, только чтение в истоке
(кроме этого файла) · **Предмет:** коммиты `2cdda5d` · `d024b4c` · `e34fd93` и незакоммиченное рабочее дерево (`git status` на 10:46).

**Общий вердикт: REFUTED (узко).** Три починки по судье закрытия сессии 99 (г) воспроизведены: красны на прежних сборках ровно новыми
случаями, зелёны на этой. Пробы (б) и счёт 14 из 35 воспроизведены. Опровергнуто другое. Правило скобки HC2 по-прежнему чинит случай, а не класс:
правка сессии 100 добавила ложные находки того самого класса, ради которого существует находка 3 судьи HC (версия чужого ядра при слове KAIF),
и молчит на настоящих заявлениях соседней формы. Строка-маркер UB6 (е) узнаётся у́же, чем говорит её собственное правило.
Заявления «класс скобки починен» (`STATUS.md` п. 0, EXP-0208) стоят ложью.

| # | Охота | Вердикт | Коротко |
|---|---|---|---|
| 1 | Правило скобки HC2 | **REFUTED** | Харнесс на НАСТОЯЩЕМ ядре (`install` + `stale-claims --from 2.9 --to 2.10`), 30 строк. Правка починила 3 из них (K15 · K16 · K20) и сделала ложными 4, которые на `d024b4c` молчали: «Работаем на **KAIF** (версия 2.9, ядро голоса)», «Runs on KAIF (version 2.9 — the voice core)», «Голос **KAIF** (версия 2.9, Silero)», «The KAIF rule (release 2.6; origin issue #52)». Молчат по-прежнему «(версия 2.7 и выше)» (английское «and» правило знает, русское «и» — нет), скобка на две строки «(version 2.7⏎or later)», «(version 2.7+)», «(версия: 2.7)» и «(вер. 2.7)» (B4 · B5 прошлого судьи нигде не названы открытыми) |
| 2 | Маркер UB6 (е) | **REFUTED (узко)** | Три места прошлого судьи (P10 · P11, журнал) теперь названы — подтверждено. Но правило «прощает только маркер ОДИН на строке» распознаёт одинокий маркер у́же, чем сказано: `[^>]*-->` не принимает `>` в причине — у «<!-- KAIF-WITHDRAWN-OK: wire-hooks -> refresh-hooks … -->» запись под ним снова названа местом (на `d024b4c` молчала). Так же с маркером пунктом списка или в цитате (P4 · P5). Отдельный `KAIF-VERSION-OK` (маркер другого сканера) строкой выше или на самой строке глушит живое место (P8 · P9). Так было и до правки, правило называет это законом — оговорка |
| 3 | Пробы (б) и (в) | VERIFIED WITH CAVEATS | (б) переисполнена: контроль 0 · M1 1 · M2 2, адресаты названы до прогона, M2 доказывает, что русская метка таблицы читается. (в) не переисполнена: пути 14 развёртываний не названы. Оговорки: SKIP 3 — свойство КЛОНА, а не развёртывания; девять документов ядра проба поимённо не сверяет |
| 4 | Счёт 14 из 35 | VERIFIED | Команда строки «Метрика версии» печатает `14`. Это 8 прежних (3–8, 24, 25) и 6 новых (17 · 26 · 27 · 33; 28 · 31 «С ОГОВОРКОЙ») — ровно список судьи эпика HC (`judge-hc-epic.md:25`); 16 открыт |
| 5 | Шире наблюдения и стоячая ложь | **REFUTED (узко)** | Полигоны 10:26:24 и 10:45:15 (`all 28 suites green`) и verify-contour 243/0 (10:28:28) — по логам главного в скретчпаде. Стоят ложью: «правило скобки HC2 классом» (`STATUS.md` п. 0) и EXP-0208 «починил по ПРИЗНАКУ» — признак не различает (охота 1). Вердикт `2026-11-17_judge-s99-close-fixes.md` §7 говорит «полигон … строками ниже, когда исполнены», а строка 5 той же таблицы полигон уже несёт. Отчёт `…hc-judge-findings-7-8.md` ставит `pass` при «Находка 7 функционально — NONE» |

## Охота 1 — правило скобки HC2 — REFUTED

Харнесс судьи `hc2-cases.mjs` (скретчпад судьи, удалён) кладёт в настоящее развёртывание по одной строке на файл. Развёртывание —
`install` ядром из `dist`. Затем исполняет `stale-claims --from 2.9 --to 2.10`. Ядро «now» — снимок `dist/KAIF-CORE.mjs` рабочего дерева
(его ханки равны ханкам `framework/installer/KAIF-CORE.mjs`: `diff` двух `git diff … | grep '^[+-][^+-]'` → `SAME-HUNKS`). Ядро «old» —
`git archive d024b4c dist`. Ожидание стоит в харнессе до прогона: K — заявление о версии KAIF (должно быть названо), A — атрибуция или
версия чужого предмета (должна молчать).

```
$ node hc2-cases.mjs now now        # 10:51:33
WRONG K01 plus suffix: named=false expected=true | Needs KAIF (version 2.7+).
WRONG K02 .x suffix: named=false expected=true | This project runs on KAIF (version 2.7.x).
WRONG K03 ru "and above": named=false expected=true | Этот проект работает на **KAIF** (версия 2.7 и выше).
WRONG K04 bold codename: named=false expected=true | This project runs on KAIF (version 2.7 **Audited KAIF**).
WRONG K05 two-line paren, version ends line 1: named=false expected=true | This project is wrapped in KAIF (version 2.7 ⏎ or later) and follows its canon.
WRONG K06 colon form (prior B4): named=false expected=true | This project is wrapped in KAIF (version: 2.7).
WRONG K07 ru abbreviation (prior B5): named=false expected=true | Этот проект обёрнут фреймворком **KAIF** (вер. 2.7).
WRONG K08 word after number: installed: named=false expected=true | This project runs on KAIF (version 2.7 installed by the agent).
WRONG K09 ru word after number: сейчас: named=false expected=true | Мы работаем на **KAIF** (версия 2.7 сейчас).
ok    K10 release word: named=true expected=true | This project runs on KAIF (release 2.7).
WRONG K11 >= sign: named=false expected=true | This project runs on KAIF (version >= 2.7).
WRONG K12 slash pair: named=false expected=true | This project runs on KAIF (version 2.7/2.8).
WRONG K13 plural versions: named=false expected=true | This project runs on KAIF (versions 2.7 and 2.8).
WRONG K14 nested paren: named=false expected=true | This project runs on KAIF (version 2.7 (Audited)).
ok    K15 semicolon tail: named=true expected=true | This project runs on KAIF (version 2.7; deployed by the agent).
ok    K16 two-line paren, comma tail: named=true expected=true | This project is wrapped in KAIF (version 2.7, ⏎ deployed by the agent) and follows its canon.
ok    K17 table cell: named=true expected=true | | Framework | KAIF (version 2.7) |
WRONG K18 ru версию accusative: named=false expected=true | Агент поставил **KAIF** (версию 2.7) в этот проект.
ok    K19 v-space: named=true expected=true | This project runs on KAIF (v 2.7).
ok    K20 control C15b codename: named=true expected=true | **KAIF** (версия 2.7 «Audited KAIF») ведёт этот проект.
WRONG A01 attribution: release + origin tail: named=true expected=false | The KAIF rule (release 2.6; origin issue #52) stays.
ok    A02 ru attribution: версия + решение: named=false expected=false | Правило KAIF о вопросах (версия 2.6, решение №97) действует.
WRONG A03 voice core, comma tail (finding-3 twin): named=true expected=false | Работаем на **KAIF** (версия 2.9, ядро голоса) с портретом.
WRONG A04 voice core, dash tail: named=true expected=false | Runs on KAIF (version 2.9 — the voice core) here.
ok    A05 control: voice core word after (C15b): named=false expected=false | Runs on KAIF (version 2.9 of the voice core) here.
ok    A06 control: attribution opens with name: named=false expected=false | The rule X stays (KAIF 2.6).
WRONG A07 voice of KAIF (prior C3): named=true expected=false | Голос **KAIF** (версия 2.9) звучит мягче.
WRONG A08 module of the project (prior C2): named=true expected=false | The KAIF voice module (v1.0) reads the portrait.
WRONG A09 voice of KAIF, comma tail: named=true expected=false | Голос **KAIF** (версия 2.9, Silero) звучит мягче.
ok    A10 own tool, comma tail: named=false expected=false | The KAIF exporter (version 1.2, our own tool) builds the sheet.
[now] exit=0 wrong=20 of 30
stale-claims 2.9 → 2.10: 12 line(s) assert an older version (read-only; …)

$ node hc2-cases.mjs old/dist old   # 10:51:41, dist d024b4c
… K15 · K16 · K20 — WRONG (named=false); A01 · A03 · A04 · A09 — ok (named=false); остальные строки — как выше
[old] exit=0 wrong=19 of 30
stale-claims 2.9 → 2.10: 5 line(s) assert an older version
```

Контроль харнесса: K20 (форма C15b) и A05 (чужое ядро C15b) ведут себя так же, как в своде, где у `s29` C15b зелёный. A06 — атрибуция C15.

**Улика.** Правка поменяла одни ошибки на другие: +3 верных (K15 · K16 · K20) и +4 ложных (A01 · A03 · A04 · A09). A03 — та же версия
голосового ядра, что и в находке 3 судьи HC («(версия 2.9 ядра голоса)»), только через запятую. На `d024b4c` она молчала, теперь названа.
Признак «слово сразу за числом» не различает чужое и своё. Чужой предмет стоит за запятой или тире: K15/A03 и K16/A04 устроены одинаково, а
ответ должен быть противоположным. Две пропущенные формы — одного класса с починенными, и это ясно видно:
- K03 «(версия 2.7 и выше)» — русский близнец «or later». Правило знает `or\b|and\b|или`, но не знает «и».
- K05 — скобка на две строки, где версия кончает первую строку. Её прямо называл бриф. Запятая в конце первой строки (K16) спасает заявление,
  конец строки — нет: в предпросмотре нет `$`.

B4 «(версия: 2.7)» и B5 «(вер. 2.7)» прошлый судья назвал «не ловились и прежде». Ни `plans/140` HC2 («ОТКРЫТО: …»), ни отчёт сессии 100
их не называют: они выпали из списка открытого. В своде C15b ровно один негатив (A05), поэтому расширение правила сводом не стережётся. На полевых
клонах новое правило не гонялось — отчёт `2026-11-17_judge-s99-close-fixes.md` §4 говорит это честно.

**Наименьшая починка — решение главного.** Направление такое. В предпросмотр добавить `и(?!\p{L})`, `\+` и конец строки (`$`, для
скобки на две строки). Чужой предмет судить по хвосту целиком: хвост, который называет другое ядро или модуль, молчит. Признак «слово сразу
за числом» этого не делает. В `s29` C15b положить негативы A03 · A04 · A09 · A01 и позитивы K03 · K05 · K01. B4 · B5 вернуть в «ОТКРЫТО»
HC2. Нельзя исключить, что формы K08 · K09 и A07 · A08 текстом не различимы; тогда это нужно объявить словами в `plans/140`.

## Охота 2 — маркер UB6 (е) — REFUTED (узко)

Свод переисполнен (по одному; `KAIF_DIST` — только на копии `git archive d024b4c dist`):

```
$ node tools/sandbox/s04-anon-legacy.mjs                  # 10:53:50 → 10:54:12, exit 0
✅ S14d/UB6 (е) судья: строку ниже прощает только ОТДЕЛЬНАЯ строка-маркер — живые места под записью, под строкой таблицы и под журналом с маркером названы (3)
✅ все песочницы 5.5 зелёные                                # 86 ✅ · 0 ❌
$ KAIF_DIST=<git archive d024b4c dist> node tools/sandbox/s04-anon-legacy.mjs   # → 10:54:31, exit 1
❌ S14d/UB6 (е) судья: строку ниже прощает только ОТДЕЛЬНАЯ строка-маркер — … названы (3) — en)
❌ ПРОВАЛОВ: 1
```

Предикат исключения харнесс `ub6e-pred.mjs` берёт ДОСЛОВНО из файла ядра: строку `if (…KAIF-(WITHDRAWN|VERSION)-OK…) return;` внутри
`withdrawnPlaces`. Затем судит им пары строк. Ожидание стоит в харнессе до прогона.

```
$ node ub6e-pred.mjs now/KAIF-CORE.mjs
predicate: /KAIF-(WITHDRAWN|VERSION)-OK/i.test(line) || (i > 0 && /^\s*<!--\s*KAIF-(?:WITHDRAWN|VERSION)-OK\b[^>]*-->\s*$/i.test(lines[i - 1]))
WRONG P1 marker alone, arrow "->" in reason, record below: excused=false expected=true
WRONG P2 marker alone, ">" in reason, record below: excused=false expected=true
ok    P3 marker alone, indented, record below: excused=true expected=true
WRONG P4 marker alone as a list item, record below: excused=false expected=true
WRONG P5 marker alone in a blockquote line, record below: excused=false expected=true
WRONG P6 two-line HTML comment marker, record below: excused=false expected=true
ok    P7 marker alone, no reason: excused=true expected=true
WRONG P8 standalone VERSION-OK (for the version) above a LIVE instruction: excused=true expected=false
WRONG P9 VERSION-OK ON a live instruction line: excused=true expected=false
ok    P10 row with marker, live row below: excused=false expected=false
ok    P11 record ending with marker, live line below: excused=false expected=false
ok    P13 marker alone uppercase-less "kaif-withdrawn-ok": excused=true expected=true
wrong=7 of 12
$ node ub6e-pred.mjs old/dist/KAIF-CORE.mjs          # d024b4c
… P1 · P2 · P4 · P5 — ok; P6 · P8 · P9 · P11 — WRONG
wrong=4 of 12
```

**Улика.** Правка закрыла P11 (живое место под записью с маркером — находка прошлого судьи) и при этом открыла P1 · P2 · P4 · P5. Это законные
записи под одиноким маркером, которые снова названы местами. Ровно такой рост счёта на честных записях и чинит UB6 (е) (#148 · #153:
13 → 17). P1 прямо противоречит заявленному правилу («the marker ALONE»): одинокий маркер с `->` в причине не узнан. Причина — `[^>]*-->`.
Задание само велит писать `<!-- KAIF-WITHDRAWN-OK: <why> -->`, а причину пишет агент поля. В истоке маркера с `>` в причине нет
(`git grep` пусто), поэтому цена пока теоретическая. P4 · P5 — вопрос решения: считать ли строкой-маркером `- <!-- … -->` и `> <!-- … -->`.
P8 · P9 были и до правки. Маркер версии (`stale-claims` велит ставить его над «верной по замыслу» строкой с версией, а не только на журнал)
глушит снятую фразу на той же или следующей строке. Это оговорка, а не опровержение: так написан закон в задании.
**Наименьшая починка:** `[^>]*-->` → `.*?-->`, P1 положить в S14d. P4 · P5 — решить и назвать. Близнец в `stale-claims` (`KAIF-CORE.mjs:1474`,
маркер на конце строки выше прощает следующую) назван в отчёте и в `plans/139` и не тронут. Это оговорка, долг назван.

## Охота 3 — пробы (б) и (в) — VERIFIED WITH CAVEATS

```
$ node tools/sandbox/probes/hcf7-owner-words-mutants.mjs   # 10:49 → 10:51:06, exit 0
OK  control: red 0 (named 0)
OK  M1 English words only: red 1 (named 1)
OK  M2 no neutral filter: red 2 (named 2)
✅ every mutant red exactly on its named cases, control green
```

Зелёный по неверной причине исключён самой пробой: если бы русская метка «Автор / владелец» не читалась, `ownerFromIdentityTable` вернул бы
`null`, а русский случай был бы зелёным при любом фильтре. M2 краснит его, значит, метка читается. Фильтр закреплён якорями (`^…$`),
поэтому «the project owner (anonymous)» или ««владелец проекта»» в кавычках снова станут именем. Это оговорка: установщик пишет ровно
`the project owner` (`ANON_OWNER_WORDS`, `KAIF-CORE.mjs:742`).

Пробу (в) `hc9-field-entry-cost.mjs` судья не переисполнял. Пути 14 развёртываний не названы ни в отчёте, ни в `HOUSE_RULES.md` (проба
печатает только порядковые номера). Чтение кода нашло три способа позеленеть по неверной причине:
1. **SKIP 3 — свойство клона.** `git clone` не несёт файлов, которые спрятала строка `.gitignore`. `check` в клоне печатает
   `✖ MISSING …` → `✖ INCOMPLETE` (`KAIF-CORE.mjs` ≈ 3825–3831) и до строки цены не доходит. В самих развёртываниях эти файлы на диске есть.
   Комментарий пробы называет это «the deployment's state, not criterion 31». На деле это метод стенда. Копия рабочего дерева
   (вместо клона) была дешёвым стендом, и 3 из 14 остались не наблюдены по критерию 31. Отчёт §5 говорит «клон их теряет», но вердикт — `pass`.
2. **Девять документов ядра не сверены поимённо.** `missing = onDisk.filter((n) => !CORE.has(n) && …)`: строка цены печатает их числом
   («reads N re-read core document(s)»), а проба это число с числом девяти на диске не сравнивает. Заявление «каждый документ шага 1 в
   счёте» шире наблюдения ровно на ядро.
3. **Тот же оракул.** Документы шага 1 проба выводит регуляркой `^- (?:\*\*[^`]*)?`NAME.md``, почти той же, что у ядра
   (`^\s*- `NAME.md``). Пункт в другой форме (нумерованный, ссылкой) пропустят оба, и проба будет зелёной. В поставочном
   `framework/skills/resume/SKILL.md` такой формы нет, поэтому сейчас это не дефект.

## Охота 4 — счёт 14 из 35 — VERIFIED

```
$ grep -cE "^ *[0-9]+\. \*\*.*✅ закрыт" plans/136_EPIC_kaif_2.10.md
14
$ grep -nE "^ *[0-9]+\. \*\*.*✅ закрыт" plans/136_EPIC_kaif_2.10.md | cut -c1-…
65: 3. … ✅ закрыт ≈ 2026-10-18 02:50 · 70: 4. · 75: 5. · 80: 6. · 85: 7. · 90: 8. (сессии 88–89) · 165: 24. · 170: 25. (судья PT)
139: 33. · 237: 17. · 242: 26. · 248: 27. ✅ закрыт 2026-11-17 10:04 — судья эпика HC (`judge-hc-epic.md`)
250: 28. · 259: 31. ✅ закрыт 2026-11-17 10:04 — судья эпика HC, С ОГОВОРКОЙ
```

Основание — `judge-hc-epic.md:25`: «17 · 26 · 27 · 33 — можно закрыть; 28 и 31 — можно, с оговорками». 35 заголовков критериев на месте.
Шаблон считает только заголовки (строка «Метрика версии» сама не считается, проверено: 14 — без неё). Проза шапки («Закрыто 14 из 35») и
`STATUS.md` п. 0 с ней сходятся.

## Охота 5 — шире наблюдения и стоячая ложь — REFUTED (узко)

Переисполнено и прочитано (полигон и `verify-contour` по брифу не запускались, прочитаны логи главного в общем скретчпаде сессии):

```
$ node tools/sandbox/s29-scanners.mjs                       # 10:54:12 → 10:54:44, exit 0 — ✅ C15b … · ✅ s29: all green (36 ✅ · 0 ❌)
$ KAIF_DIST=<git archive d024b4c dist> node tools/sandbox/s29-scanners.mjs   # → 10:54:55, exit 1 — ❌ C15b … · ❌ s29: 1 red
$ node tools/sandbox/s14-refresh-hooks.mjs                  # 10:55:30 → 10:55:42, exit 0 — ✅ s14 проба README (UB3, #151): ни одна строка пробы не несёт обратной косой …
$ KAIF_DIST=<git archive 3210c3c dist> node tools/sandbox/s14-refresh-hooks.mjs   # → 10:55:53, exit 1
❌ s14 проба README (UB3, #151): … — printf '{"prompt":"resume\\nplan the day"}' | n…
❌ ПРОВАЛОВ: 1
polygon1.log (mtime 10:26:24): ✅ sandbox suite: all 28 suites green
polygon2.log (mtime 10:45:15): ✅ sandbox suite: all 28 suites green
vc.log       (mtime 10:28:28): ИТОГ QA-прогона: 243 зелёных, 0 красных
$ node framework/tools/kaif-testrun-lint.mjs check   → ✅ testrun-lint OK — 146 report(s) under testcases/reports/, 0 findings
$ node framework/tools/kaif-experience-lint.mjs check → 82 finding(s), столько же на `git show HEAD:EXPERIENCE.md` — EXP-0208 новых не добавляет
```

Заявления (г) и (д) подтверждены. Оговорка: `dist` пересобран в 10:47:23, после второго полигона. Ханки ядра равны ханкам истока
(`KAIF-CORE.mjs` истока не менялся с 10:28:07), так что полигон судил то же ядро.

Стоячая ложь (исправить на месте):
- `STATUS.md` п. 0: «коммит закрытия — правило скобки HC2 классом (`s29` C15b)». По охоте 1 класс не починен: A03 — новая ложная находка
  класса находки 3, K03 · K05 — пропуски.
- `EXPERIENCE.md` EXP-0208: «починил по ПРИЗНАКУ, а не по случаю: чужую версию выдаёт СЛОВО сразу за числом». Признак не различает
  (K15/A03, K16/A04). «Механизация: … свод краснеет на сужении» — на расширении (ложных) свод не краснеет: в C15b один негатив.
- `plans/140` HC2: «класс скобки — сессия 100». Механика описана верно, слово «класс» — нет. Из «ОТКРЫТО» выпали B4 · B5 прошлого судьи.
- `testcases/reports/2026-11-17_judge-s99-close-fixes.md` §7: «полигон и функциональный прогон HC2 на клонах полей — строками ниже, когда
  исполнены». Строка 5 таблицы §3 полигон уже несёт (10:35:14 → 10:45:15, 28/28). Вердикт отстал от собственной таблицы.
- `testcases/reports/2026-11-17_hc-judge-findings-7-8.md` §7: `pass`, хотя §4 «Находка 7 функционально … — NONE». По канону NONE честен, а `pass`
  над ним — нет (охота «tested on hygiene alone»). Линтер этого не видит, потому что строка функционального прогона непуста за счёт находки 8.

Шире брифа (наблюдение, не в вердикте): пока судья работал, главный в 10:49:02 правил документ владельца
`ideas/auto_relay_windows_guide.md` (закоммичен «дословно», `e34fd93`). В его шаблон `HANDOVER.md` внутри блока кода дописан маркер
`<!-- questions-guard:allow … -->`. Текст владельца меняется ради гарда. Альтернатива — гард, который не судит блоки кода.

## Что НЕ проверено

- Проба (в) на 14 развёртываниях: пути не названы. Печатает ли настоящий `check` строку цены в трёх «INCOMPLETE»-развёртываниях на их
  собственном диске — не наблюдено.
- Правило скобки на полевых клонах (`hc2-field-stale-diff.mjs`). Сколько ложных мест вида A03 · A04 даст поле — неизвестно.
- Маркер UB6 (е) в полевых журналах: пишет ли поле `>` в причине и маркер пунктом списка — не наблюдено.
- Функциональный прогон находки 7 (живой зов на обезличенном переведённом развёртывании) — не поднимался (тишина брифа).
- Полигон и `verify-contour` — по логам главного, не переисполнены (запрет брифа).

## Порядок и инцидент судьи

Временное судьи: `…/scratchpad/j100/` (харнессы, снимки `dist`, логи) и три корня красных прогонов сводов `F:\Temp\kaif-sbx-{anon-legacy,
scanners,hooks}-*`. Всё удалено в этом же ходе. `D:\Temp` не тронут. **Инцидент:** первый прогон пробы (б) судья направил в
`<скретчпад>/hcf7.log` в корне общего скретчпада сессии и этим ПЕРЕЗАПИСАЛ лог главного, на который ссылается
`2026-11-17_hc-judge-findings-7-8.md` §6. Сейчас там вывод судьи (10:51:06: контроль 0 · M1 1 · M2 2, исход тот же). Исходный лог главного
утрачен. Строку §6 отчёта нужно поправить: «hcf7.log перезаписан судьёй s100; вывод того же исхода — в judge-s100.md, охота 3».
