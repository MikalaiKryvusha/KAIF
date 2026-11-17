> «**a report is a set of claims, not evidence.** Nothing is believed that was not observed.» — `.claude/skills/fable-judge/SKILL.md`, строка 21

# Лёгкий судья закрытия сессии 99 — UB0 · UB3 · UB6 (е) · правки по судье эпика HC · переезд голоса

> **Создан:** 2026-11-17 10:12 +03:00 (сессия 100, субагент-судья `/fable-judge`, Claude Opus 5.5) · **Бриф:** `researches/38_kaif_2.10_scope_recon/JUDGE_S99_CLOSE_BRIEF.md`
> · **Судимое:** `6797e60` · `2305738` · `d2f2127` · **Статус:** отчёт судьи — находки до проверки главным (бриф, ч. 5).
> **Вовне:** —

**Общий вердикт: REFUTED (узко).** Переисполнение зелёное и красное там, где заявлено (s14 · s04 S14d · строки README · голос). Опровергнуты
три пункта: правило HC2 после находки 3 судит неверно и заглушает настоящие заявления, которые прежнее ядро называло (охота 3); маркер
UB6 (е) на строке выше глушит НАСТОЯЩЕЕ место снятой фразы (охота 4); полигон 28/28 15:09–15:21 и прогоны UB3 · UB6 (е) не имеют отчёта прогона,
а `plans/139` не знает, что UB3 и UB6 (е) сделаны (охота 5).

**Стенд (одинаков для всех прогонов ниже):** Windows 11, Git Bash и Windows PowerShell 5.1 инструментов агента; сборка `dist` у HEAD
(`2cdda5d`, судимые коммиты ниже неё); `distFreshness` — `fresh: true, fingerprint matches (216 input files)` в 10:02–10:08; в 10:11 —
`fresh: false` (главная сессия правит `framework/tools/contour/{core,review,texts}.mjs`, не закоммичено — это не судимое; s29 шёл на `dist`
коммита). Пересборку `node tools/build-framework.mjs` классификатор режима отклонил («Destructive or Unwanted Actions») — её заменяет отпечаток
источника выше. Временный каталог судьи — `F:\Temp\judge-s99-close-1104` (удалён в конце).

| # | Охота | Вердикт | Коротко |
|---|---|---|---|
| 1 | Переисполнение 5 и 6 | VERIFIED WITH CAVEATS | s14 зелёный; s04 зелёный; на `dist` 3210c3c красен ровно S14d/UB6 (е); строки README исполнены в Bash и PowerShell — приказ печатается, третья молчит. Оговорка: s14 зелен и на СТАРЫХ строках (`\\n`) — класс #151 механизмом не стережётся |
| 2 | Находка 1 (справочник) | VERIFIED WITH CAVEATS | Старая фраза — только в двух записях судей (цитаты истории); новая — в четырёх слоях и равна коду; оговорка: `git@` в URL со схемой не снимается — справочник этого не называет |
| 3 | Находка 3 (HC2) | **REFUTED** | 4 формы настоящего заявления («(версия 2.7 «Audited KAIF»)», «(version 2.7, deployed …)», «(version 2.7 or later)», «(версия 2.7 → 2.8)») молчат на HEAD и назывались на `594db46`; класс находки 3 жив: «Голос **KAIF** (версия 2.9)» назван |
| 4 | UB6 (е) — дыра маркера | **REFUTED** | Копия свода: три живых места (под записью с маркером, под строкой таблицы с маркером, под журналом с `KAIF-VERSION-OK`) молчат; названо только контрольное |
| 5 | Шире наблюдения и стоячая ложь | **REFUTED (узко)** | Полигон 15:09–15:21 — ни в одном отчёте (четыре полигона того же дня — строками отчётов); UB3 · UB6 (е) — без отчёта; `plans/139`: UB3 и UB6 `[ ]`, статус «далее UB1–UB8». UB0 (а) — адреса верны на 3210c3c, сдвинуты +6 тем же коммитом |
| 6 | Голос `d2f2127` | VERIFIED WITH CAVEATS | Рендер по новым путям без звука: exit 0, `KAIF_VOICE_RENDER, voice eugene`, wav 1 430 706 байт; `F:\KLAS` отсутствует; на слух не проверено (бриф) |

## Охота 1 — переисполнение заявлений 5 и 6

Запуск сводов — по одному, как их запускает `tools/sandbox-suite.mjs` (своды сами дают генератору контура `quietEnv()`), из окружения
вычеркнуты `KAIF_VOICE*`; лаунчер `run-quiet.mjs` в каталоге scratchpad судьи.

```
$ node run-quiet.mjs tools/sandbox/s14-refresh-hooks.mjs
[run-quiet] distFreshness: {"fresh":true,"reason":"fingerprint matches (216 input files)"}
…
✅ s14 проба README [sh] строка 1: приказ таймера (маркера нет)
✅ s14 проба README [sh] строка 2: приказ исполнить /resume
✅ s14 проба README [sh] строка 3: тишина
✅ s14 проба README [powershell] строка 1: приказ таймера (маркера нет)
✅ s14 проба README [powershell] строка 2: приказ исполнить /resume
…
✅ песочница refresh-hooks зелёная (деплой с модулем и без · хуков по живому контракту — 10 · снятые хуки сняты с проводки)
[run-quiet] suite=tools/sandbox/s14-refresh-hooks.mjs KAIF_DIST=(repo dist) exit=0 signal=null start=2026-11-17T07:02:59.518Z end=2026-11-17T07:03:18.195Z
```

```
$ node run-quiet.mjs tools/sandbox/s04-anon-legacy.mjs
[run-quiet] distFreshness: {"fresh":true,"reason":"fingerprint matches (216 input files)"}
✅ S13 bugs/130 (№157): после самоочистки обезличенного развёртывания ни один файл не несёт токенов имени автора KAIF
…
✅ S14d/UT1: после правки агента `checkpoint recheck` называет оставшееся место (одно), убранного нет
✅ S14d/UB6 (е): записи снятия с маркером KAIF-WITHDRAWN-OK (на строке или строкой выше) и KAIF-VERSION-OK — не места; место без маркера осталось одно
…
✅ все песочницы 5.5 зелёные
[run-quiet] suite=tools/sandbox/s04-anon-legacy.mjs KAIF_DIST=(repo dist) exit=0 signal=null start=2026-11-17T07:05:01.615Z end=2026-11-17T07:05:26.504Z
```

Красное на прежней сборке — копия `git archive 3210c3c dist | tar -x -C F:/Temp/judge-s99-close-1104/old` (в её ядре `KAIF-(WITHDRAWN|VERSION)-OK` — 0 вхождений, в нынешнем — 1):

```
$ node run-quiet.mjs tools/sandbox/s04-anon-legacy.mjs F:/Temp/judge-s99-close-1104/old/dist
❌ S14d/UB6 (е): записи снятия с маркером KAIF-WITHDRAWN-OK (на строке или строкой выше) и KAIF-VERSION-OK — не места; место без маркера осталось одно — en)
❌ ПРОВАЛОВ: 1
[run-quiet] suite=tools/sandbox/s04-anon-legacy.mjs KAIF_DIST=F:/Temp/judge-s99-close-1104/old/dist exit=1 signal=null start=2026-11-17T07:05:42.940Z end=2026-11-17T07:06:10.809Z
$ diff <(имена ✅/❌ прогона на HEAD) <(имена прогона на 3210c3c)   # ❌ приравнен к ✅
66c66
< ✅ все песочницы 5.5 зелёные
---
> ✅ ПРОВАЛОВ: 1
```

Набор случаев совпадает, красный — ровно новый случай: «на прежнем `dist` красен ровно он» — подтверждено.

Строки README (`framework/hooks/README.md:79–90`) — исполнены судьёй ИНСТРУМЕНТАМИ агента, дословно, во временном проекте с копией
`framework/hooks/*.mjs` в `.kaif/hooks/` и без `.kaif/refresh-marker.json`:

```
$ cd /f/Temp/judge-s99-close-1104/proj      # Bash-инструмент (Git Bash)
[sh-1]  node .kaif/hooks/prompt-refresh-timer.mjs < /dev/null
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"KAIF context refresh (timer: no refresh witness found this session, interval 60 min). …
[sh-2]  printf '{"prompt":"resume plan the day"}' | node .kaif/hooks/prompt-resume-word.mjs
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"KAIF: the owner's message OPENS with the word \"resume\" — that is an ORDER, not a topic …
[sh-3]  printf '{"prompt":"plan the day"}' | node .kaif/hooks/prompt-resume-word.mjs
<end sh-3, exit=0>
PS> Set-Location F:\Temp\judge-s99-close-1104\proj   # PowerShell-инструмент (5.1)
[ps-1] {"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"KAIF context refresh (timer: no refresh witness found this session, interval 60 min). Before starting on this prompt: re-
[ps-2] {"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"KAIF: the owner's message OPENS with the word \"resume\" — that is an ORDER, not a topic …
[ps-3] <ps-3 length=0>
```

**Оговорка (s14 не отличает починку от старых строк).** s14 пишет каждую строку README в файл и запускает файл (`s14-refresh-hooks.mjs:481–491`),
минуя слой инструмента агента, а запрета обратной косой в строках пробы в своде нет (`grep -nE "обратн|backslash" s14` — пусто). Старые строки
(до `6797e60`), записанные в файл и запущенные так же, печатают приказ:

```
$ cat old-readme-line.sh
printf '{"prompt":"resume\\nplan the day"}' | node .kaif/hooks/prompt-resume-word.mjs
[old sh line from a FILE, as s14 runs it]
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"KAIF: the owner's message OPENS with the word \"resume\" — that is an ORDER, no
[old ps line from a FILE, as s14 runs it]
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"KAIF: the owner's message OPENS with the word \"resume\" — that is an ORDER, no
```

То есть «s14 зелёный» — правда, но о UB3 он ничего не доказывает: вернувшаяся в README обратная косая останется зелёной. Класс «слой инструмента
съедает одну косую» повторяется (память владельца, EXP-0121; #151) — механизма нет, только текст README. Наименьшая починка: в s14 — ассерт
«в строках пробы README нет `\`» рядом с проверкой stdin (`s14-refresh-hooks.mjs:465`).

## Охота 2 — находка 1 (справочник поставки)

```
$ git grep -n "stripped in every mode"
researches/38_kaif_2.10_scope_recon/judge-hc-epic.md:15:| 1 | ❌ стоячая ложь `framework/KAIF_REFERENCE.md:510` «the login inside the remote URL is stripped in every mode» | ПОДТВЕРЖДЕНО: …
researches/38_kaif_2.10_scope_recon/judge-s98-close.md:27:   поставки `KAIF-CORE.mjs:698` («stripped in every mode»), STATUS п. 0 (д) («логин в адресе репозитория снят»). …
$ git grep -n "WITH A SCHEME is stripped"
KAIF_REFERENCE.md:511:into the deploy manifest too; the login inside a remote URL WITH A SCHEME is stripped at fresh discovery, in
dist/KAIF-CORE-BUNDLE.md:3672:…
dist/KAIF-FULL.md:3243:…
framework/KAIF_REFERENCE.md:510:into the deploy manifest too; the login inside a remote URL WITH A SCHEME is stripped at fresh discovery, in
```

Старая фраза осталась только в двух записях судей — это цитаты истории, не стоячая ложь. Корень `KAIF_REFERENCE.md:506–516` побайтно равен
источнику `framework/KAIF_REFERENCE.md:505–515`. Код (`framework/installer/KAIF-CORE.mjs`, = `dist/KAIF-CORE.mjs`, `cmp` — равны):

```
686 // `https://login:token@host/x.git` → `https://host/x.git`; an scp-form `git@host:x.git` has no scheme and is left as it is
687 // `ssh://git@host/…` keeps its `git@` — the transport's user, part of the address, not a person (light judge, session 98)
688 const stripUrlUserinfo = (url) => String(url || '').replace(/^([a-z][a-z0-9+.-]*:\/\/)(?!git@)[^@/\s]+@/i, '$1');
702     '<REPO_URL>': stripUrlUserinfo(sh('git remote get-url origin')) || null,
724 const stableValues = () => {
725   const v = { ...detectValues(), ...snapshotValues() };      // замороженный манифест побеждает свежее обнаружение
```

Та же строка 688 дословно, над формами адреса (`strip-url.mjs` судьи):

```
https://jdoe:tok@github.com/x/y.git  →  https://github.com/x/y.git
ssh://jdoe@host/x.git  →  ssh://host/x.git
ssh://git@github.com/x/y.git  →  ssh://git@github.com/x/y.git
https://git@github.com/x/y.git  →  https://git@github.com/x/y.git
git@github.com:x/y.git  →  git@github.com:x/y.git
jdoe@host:x/y.git  →  jdoe@host:x/y.git
```

Новая фраза справочника совпадает с кодом: URL со схемой — логин снят при свежем обнаружении в любом режиме (`detectValues` от `ANON` не зависит),
scp-форма остаётся, замороженное значение побеждает (`stableValues`: `...snapshotValues()` после `...detectValues()`). **Оговорка:** логин
`git` в URL со схемой не снимается (`(?!git@)`, и для `https://` тоже) — справочник говорит «the login inside a remote URL WITH A SCHEME is stripped»
без этого исключения. Пересборка не переисполнена (отклонена классификатором) — равенство `dist` источнику держится на отпечатке `distFreshness`.

## Охота 3 — находка 3 (правило HC2 скобки с версией) — REFUTED

Харнесс судьи `hc2-harness.mjs` вырезает из файла ядра ДОСЛОВНОЕ тело `scanStaleClaims` и гоняет его по строкам прозы (заглушен только обход
файлов); обновление 2.7 → 2.10. Достоверность харнесса — по трём известным случаям: A1 (C15 s29) назван, A2 (находка 3) молчит на HEAD и назван
на `594db46` (как сказал судья HC), A3 (атрибуция) молчит.

```
$ node hc2-harness.mjs dist/KAIF-CORE.mjs
ok    A1 HC2 base form: named=true expected=true | Этот проект обёрнут фреймворком **KAIF** (версия 2.7). Рабочий язык — русский.
ok    A2 judge HC finding 3 (another core): named=false expected=false | Работаем на **KAIF** (версия 2.9 ядра голоса) с портретом.
ok    A3 attribution: named=false expected=false | The rule X stays (KAIF 2.6).
WRONG B1 claim + codename in the paren: named=false expected=true | Этот проект обёрнут фреймворком **KAIF** (версия 2.7 «Audited KAIF»).
WRONG B2 claim + comma note: named=false expected=true | This project is wrapped in **KAIF** (version 2.7, deployed by the agent).
WRONG B3 claim + "and later": named=false expected=true | Runs on **KAIF** (version 2.7 or later).
WRONG B4 colon form: named=false expected=true | Этот проект обёрнут фреймворком **KAIF** (версия: 2.7).
WRONG B5 Russian abbreviation: named=false expected=true | Этот проект обёрнут фреймворком **KAIF** (вер. 2.7).
WRONG B6 range of two versions: named=false expected=true | Этот проект обёрнут фреймворком **KAIF** (версия 2.7 → 2.8).
WRONG C1 version of a project tool named kaif-*: named=true expected=false | Таблицы собирает `tools/kaif-sheet.mjs` (v1.2).
WRONG C2 version of a KAIF-named module of the project: named=true expected=false | The KAIF voice module (v1.0) reads the portrait.
WRONG C3 the voice core named without the word "core": named=true expected=false | Голос **KAIF** (версия 2.9) звучит мягче.
$ node hc2-harness.mjs F:/Temp/judge-s99-close-1104/core-594db46.mjs     # git show 594db46:framework/installer/KAIF-CORE.mjs
ok    A1 …  ·  WRONG A2 … named=true  ·  ok A3 …
ok    B1 claim + codename in the paren: named=true expected=true
ok    B2 claim + comma note: named=true expected=true
ok    B3 claim + "and later": named=true expected=true
WRONG B4 colon form: named=false  ·  WRONG B5 Russian abbreviation: named=false
ok    B6 range of two versions: named=true expected=true
WRONG C1 … named=true  ·  WRONG C2 … named=true  ·  WRONG C3 … named=true
```

**Улика:** правка `6797e60` (`[^)]*\)` → `\s*\)` в `KAIF-CORE.mjs:1501`) обменяла один ложный крик на четыре пропуска НАСТОЯЩИХ заявлений: B1 · B2 · B3 · B6
назывались прежним ядром и молчат теперь — это ровно вред #117 («**KAIF** (версия 2.7)» молчал два обновления подряд), вернувшийся для скобки
с хвостом. Класс находки 3 (версия ЧУЖОГО — голосового — ядра при имени KAIF) жив: C3 «Голос **KAIF** (версия 2.9)» назван. Правило различает
не «чьё», а «есть ли хвост» — починен случай, не класс. B4 (двоеточие) и B5 («вер.») не ловились и прежде. В s29 C15 нет ни одной фикстуры
заявления с хвостом в скобке — пропуск сводом не виден. Свод сам по себе честен: s29 зелёный на HEAD, C15 красен на `dist` 3210c3c:

```
$ node run-quiet.mjs tools/sandbox/s29-scanners.mjs
✅ C15 (HC2, #117): «**KAIF** (версия 2.7)», «KAIF (version 2.7)» и «KAIF (v2.7)» названы — скобка со словом версии и есть заявление; «(KAIF 2.6)» — атрибуция, молчит
✅ s29: all green
[run-quiet] … exit=0 … start=2026-11-17T07:11:25.490Z end=2026-11-17T07:11:49.794Z
$ node run-quiet.mjs tools/sandbox/s29-scanners.mjs F:/Temp/judge-s99-close-1104/old/dist
❌ C15 (HC2, #117): … —     · AGENTS_NOTE.md:3 — Этот проект обёрнут фреймворком **KAIF** (версия 2.7). Рабочий язык — русский. (asserts 2.7 …
❌ s29: 1 red
[run-quiet] … exit=1 … start=2026-11-17T07:12:07.859Z end=2026-11-17T07:12:27.364Z
```

Наименьшая починка — решение главного, судья не чинит; направление: судить содержимое скобки после слова версии (хвост из имени ДРУГОЙ вещи —
«ядра голоса», «модуля …» — молчит; хвост из кодового имени, даты, «or later», второй версии — заявление) и добавить B1 · B2 · B6 и C3 фикстурами в C15.

## Охота 4 — UB6 (е): маркер строкой выше глушит настоящее место — REFUTED

Код (`KAIF-CORE.mjs:1252`): `if (/KAIF-(WITHDRAWN|VERSION)-OK/i.test(line) || (i > 0 && !/^\s*\|/.test(line) && /KAIF-(WITHDRAWN|VERSION)-OK/i.test(lines[i - 1]))) return;`
— маркер любой строки выше (и маркер НА строке записи, и маркер строки таблицы) снимает следующую строку, что бы в ней ни стояло. Проба: КОПИЯ
`s04` в `F:\Temp\judge-s99-close-1104\repo\tools\sandbox\` (`make-probe4.mjs` судьи), после ассерта UB6 (е) — та же фикстура S14d с живыми
местами ПОД записями с маркером и контрольным местом под строкой без маркера; `KAIF_DIST` — `dist` истока (только чтение).

```
JUDGE-PROBE-FILE>>>
FIXTURE-RETIRED-PHRASE-EXTRA is another tool.
- 2026-11-07: we stopped calling FIXTURE-RETIRED-PHRASE. <!-- KAIF-WITHDRAWN-OK: a record -->
- Call wire-hooks by hand after every pull.
| 2026-11-07 | wire-hooks retired <!-- KAIF-WITHDRAWN-OK: row --> |
Run FIXTURE-RETIRED-PHRASE before each release.
- KAIF 2.6 deployed <!-- KAIF-VERSION-OK: journal -->
Call wire-hooks by hand after every pull.
Plain line.
Call wire-hooks by hand after every pull (control: no marker above).
<<<
JUDGE-PROBE-OUT>>>ℹ withdrawn phrases (2.9 → 9.9) — places left now: The machinery found 1 place(s) (the records — the chronicle, reports of past updates — and lines the delivered templates carry verbatim are not places):
    · plans/fixture_plan.md:9 «wire-hooks»<<<
[run-quiet] suite=F:/Temp/judge-s99-close-1104/repo/tools/sandbox/s04-anon-legacy.mjs KAIF_DIST=d:/work/ai_sandbox/KAIF/dist exit=0 signal=null start=2026-11-17T07:07:38.106Z end=2026-11-17T07:08:00.446Z
```

**Улика:** живые приказы снятых фраз в строках 3, 5 и 7 молчат — названа только контрольная строка 9. Цена — ровно та, что в брифе: у
владельца поля, чей журнал несёт маркеры (поле уже ставит `KAIF-VERSION-OK` на журнал, `plans/139` UB6 (е)), живая фраза снятого правила
сразу под записью не попадёт в «places left now», и `recheck` скажет меньше мест, чем есть. Вторая несостыковка — со своим же близнецом:
`stale-claims` (`KAIF-CORE.mjs:1478–1479`, SC4 F5) проверяет, что строка ВЫШЕ — не строка таблицы («its marker excuses itself, never the row
below it»), а `withdrawnPlaces` проверяет текущую строку — маркер строки таблицы снимает следующую НЕ-строку (строка 5 пробы); комментарий
кода говорит «the line above a row is another row», код делает другое. Фикстура S14d зелёная, потому что её живое место (строка 2) стоит
ВЫШЕ записей с маркерами. Наименьшая починка — маркер строкой выше засчитывать, только когда строка выше — сам маркер без текста
(`^\s*<!-- KAIF-(WITHDRAWN|VERSION)-OK…-->\s*$`), и строку 5 пробы — в S14d.

## Охота 5 — шире наблюдения и стоячая ложь — REFUTED (узко)

```
$ ls testcases/reports/ | grep 2026-11-07
2026-11-07_bug136-s22-waits-under-load.md · 2026-11-07_hc1-voice-lint-every-s8.md · 2026-11-07_hc2-stale-claims-version-paren.md ·
2026-11-07_hc4-anon-owner-name.md · 2026-11-07_hc9-entry-cost-whole-entry.md · 2026-11-07_polygon-lock.md · 2026-11-07_voice-soft-kumm-settings.md
$ grep -lnE "15:21|15:09" testcases/reports/2026-11-07_*.md ; grep -nE "UB6|UB3|README" testcases/reports/2026-11-07_*.md
(пусто)
$ grep -nE "28/28|all 28 suites" testcases/reports/2026-11-07_*.md
2026-11-07_bug136-s22-waits-under-load.md:28:| 6 | 2026-11-07 14:27:01 → 14:38:56 +03:00 | `npm run test:core` … | 0 · `all 28 suites green` (полигон 1 из 3 критерия) |
2026-11-07_bug136-s22-waits-under-load.md:30:| 8 | 2026-11-07 14:42:03 → 14:54:05 +03:00 | `npm run test:core` (с близнецами) | 0 · `all 28 suites green` (полигон 2 из 3 критерия) |
2026-11-07_hc1-voice-lint-every-s8.md:32:| 7 | 2026-11-07 13:01:57 → 13:11:57 +03:00 | `npm run test:core` (в одиночку, после пересборки) | 0 · `all 28 suites green` |
2026-11-07_hc2-stale-claims-version-paren.md:33:| 8 | 2026-11-07 13:55:45 → 14:08:05 +03:00 | `npm run test:core` (в одиночку) | 0 · `all 28 suites green` |
```

- **Полигон 28/28 15:09–15:21 — без отчёта прогона** (охота «tested without a run report»). Четыре полигона того же дня — строками отчётов с
  командой и моментом; этот — только в сообщении `6797e60` и `STATUS.md:30` · `:66` («три полигона подряд зелёные (14:27 · 14:42 · 15:09)»), а
  отчёт `bugs/136` кончается на двух. Переисполнить нельзя (полигон гоняет главный) — UNVERIFIABLE и без артефакта.
- **UB3 и UB6 (е) — без отчёта прогона:** «обе строки исполнены инструментами агента» и «s04 S14d красный на прежнем dist» нигде не записаны
  командой и моментом (судья переисполнил — правда, см. охоту 1, но заявление шло без отчёта).
- **`plans/139` не знает о сделанном:** статус — «UB0 ✅ …; далее UB1–UB8»; UB3 (`:53`) и UB6 (`:64`, пункт (е) `:80`) — `[ ]` без строки
  исполнения, тогда как `6797e60` и `STATUS.md` п. 0 говорят «UB3 — … приказ печатается», «UB6 (е) — … зелёный». План — единственный
  адрес шага; следующая сессия по нему сделает UB3 и UB6 (е) заново.
- **UB0 (а) — исполнено, но устарело тем же коммитом.** На `3210c3c`: `RETIRED_HOOKS` `:4960`, `wireHooksItem` `:5039`, `DEPRECATIONS` →
  `tools/build-framework.mjs:450`, `end-chat-soft/SKILL.md:116`, `end-chat-force/SKILL.md:38` — все верны. На HEAD ядро — `:4966` и `:5045`
  (+6 строк UB6 (е) того же `6797e60`). Оговорка, не ложь: строка говорит «сверены с HEAD (`3210c3c`…)».
- **UB0 (в) — чтение, а не прогон:** нулевой итог опирается на дайджест (`field-b.md:27` «Маршрут. bootstrap с репетицией», `:141`); сам отчёт
  KAGO (#155) судья не открывал — не проверено.
- **Находки 2 · 5 · 6 — текстом есть:** `bugs/130:3` «регрессионный ассерт, зелёный и до HC4»; `bugs/136:4` и отчёт `:52` — «в четырёх»
  (`git grep -nE "0 в пяти|в пяти прогонах"` — пусто во всём дереве); `plans/140` HC6 (на `6797e60`, `:127–130`) — «закрываемы 17 · 26 · 27 · 28 · 31 · 33».
- Мелочь: строка UB6 (е) в ядре (`KAIF-CORE.mjs:1251`) несёт `[NOT-TESTED]`, хотя её стережёт S14d — метка занижает, не завышает.

## Охота 6 — голос `d2f2127`

Флага «рендер без звука» у `say.mjs` нет, но он передаёт флаги `voice-soft.mjs`, а звук там — только `--play` (`voice-soft.mjs:238`); `--out <wav>`
рендерит в файл. `KAIF_VOICE_LOGGED=1` — чтобы журнал фраз не записал новый файл в `voice/` истока (`logPhrase`, `voice-soft.mjs:101–109`).

```
$ for p in F:/krinik_tts/venv/Scripts/python.exe F:/krinik_tts/voice-say.mjs F:/krinik_tts/voice F:/krinik_tts/models/v5_ru.pt F:/KLAS …
EXISTS /f/krinik_tts/venv/Scripts/python.exe
EXISTS /f/krinik_tts/voice-say.mjs
EXISTS /f/krinik_tts/voice
EXISTS /f/krinik_tts/models/v5_ru.pt
MISSING /f/KLAS
$ KAIF_VOICE_LOGGED=1 node tools/say.mjs --file "voice/2026-11-07_14-59-01_окно-контекста-восемьдесят-процентов.txt" --out F:/Temp/judge-s99-close-1104/voice.wav
voice-soft: F:\Temp\judge-s99-close-1104\voice.wav (KAIF_VOICE_RENDER, voice eugene)
exit=0
-rw-r--r-- 1 krinik 197121 1430706 Nov 17 10:09 /f/Temp/judge-s99-close-1104/voice.wav
$ ls -t voice/ | head -1
2026-11-17_09-51-30_svodka-versii-2-10.txt        # нового файла журнала нет
```

Рендер шёл основным движком (`KAIF_VOICE_RENDER` — Python машины `F:\krinik_tts\venv` + `tools/voice/soft_say.py`), не запасным — новые пути
живые. Оговорки: на слух не проверено (бриф: не играть); запасной движок `KAIF_VOICE_BASE_TOOL` (`F:\krinik_tts\voice-say.mjs`) отдельно
не прогонялся; комментарий `tools/voice/soft_say.py:6` по-прежнему зовёт интерпретатор «the KLAS venv Python» (слово, не путь).

## Что НЕ проверено

- Полигон `npm run test:core` и `tools/verify-contour.mjs` — запрещены брифом; заявление 7 (полигон 15:09–15:21) — UNVERIFIABLE.
- Пересборка `node tools/build-framework.mjs` и пустота `git status --short dist` после неё — вызов отклонён классификатором режима; вместо неё —
  `distFreshness` (`fresh: true`, 216 входных файлов) в 10:02–10:08.
- Отчёт KAGO (#155) за UB0 (в) — не открыт; голос на слух; запасной движок голоса.
- Свод s04 S13 до HC4 (заявление «регрессионный, зелёный и до HC4») — не переисполнен на сборке до HC4, проверен только текст.

## Порядок на машине

Удалено судьёй в конце: `F:\Temp\judge-s99-close-1104` (копии `dist` 3210c3c, ядра 594db46, свода-пробы, временный проект хуков, wav) и корни
красных прогонов `F:\Temp\kaif-sbx-anon-legacy-SM0k0v` · `F:\Temp\kaif-sbx-scanners-lQxgiy`. Скрипты судьи (`run-quiet.mjs`, `hc2-harness.mjs`,
`make-probe4.mjs`, `strip-url.mjs`) и логи прогонов — в scratchpad сессии, не в истоке.
