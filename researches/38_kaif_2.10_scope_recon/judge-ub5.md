# Судья шага UB5 версии KAIF 2.10 — закрытие и коммит по умолчанию ставят набор по именам

> **Создан:** 2026-11-17 · **Родитель:** plans/139 UB5 · **Статус:** 🔴 REFUTED — 3 (заявления 4 · 6 · 7), PARTIAL — 2 (1 · 5),
> VERIFIED — 3 (2 · 3 · 8); находок — 8; повторный суд — REFUTED 1 (R1) · PARTIAL 4 (R2–R5), находок 7; находки обоих судов исполнены
> главным агентом (разделы «Исполнение находок…»; 7-я повторного — `bugs/139`) · **Вовне:** —
>
> Судья: Claude Opus 5.5, субагент главной сессии 102, только чтение (кроме этого файла); прогоны 2026-11-17 20:09:56 → 20:24:54 +03:00
> (`date` в тех же вызовах). HEAD `3057175`, работа UB5 — незакоммиченное рабочее дерево. Дерево во время суда МЕНЯЛОСЬ вне UB5 (главный
> агент: `MASTER_PLAN.md` 20:17:54, `plans/136`, `interviews/interview_049…`, `researches/45`, новые `interviews/decisions/*049*`); файлы UB5
> за время суда не менялись — вердикты относятся к ним. Полевые развёртывания владельца только читались: git-клоны `--no-hardlinks` с
> `GIT_OPTIONAL_LOCKS=0` во временном каталоге `F:/Temp/kaif-judge-ub5-gcRl` (убран в конце); имена развёртываний заменены номерами
> (порядок `readdirSync` каталога `D:\work\ai_sandbox`, исток исключён).

«Агент проверяет свою работу на чистом, только что созданном стенде … Мир владельца НАКОПЛЕН: … его собственные правки в развёрнутом
дереве … — там ломается, а все приборы агента были зелены по построению (№104).» — `TESTING_FRAMEWORK.md`, строки 242–245.

## Заявление 1 — три места поставки и `dist` ставят набор по именам — **PARTIAL**

Подтверждено: все три названных места несут новую форму, сборка из этих источников даёт тот же `dist`.

```
$ git diff 3057175 -- framework/skills/end-chat-soft/SKILL.md framework/skills/end-chat-force/SKILL.md | grep "^[-+]"
-pushes), run it. Otherwise: git add -A, then git commit -m "...", then git push — each its own tool call, never chained
+pushes), run it. Otherwise: git add each file of the set you checked with git diff --stat, by name (never -A), then git commit -m "...",
+then git push — each its own tool call, never chained
   (то же — во втором навыке)
$ grep -rn "git add -A" framework/skills/ framework/installer/KAIF-CORE.mjs
framework/installer/KAIF-CORE.mjs:480:// they hit the tree, so a `git add -A` during the manual-merge window between update and      ← комментарий, не инструкция
$ grep -c "git add -A, then" dist/* KAIF.md       → 1 только в dist/KAIF-CORE-BUNDLE.md:113 — это сама нота сборщика (цитата остатка)
$ grep -c "git add each file of the set you checked with git diff --stat, by name (never -A)" dist/*
dist/KAIF-CORE-BUNDLE.md:3   dist/KAIF-CORE.mjs:1   dist/KAIF-FULL.md:3
```

Сборка на КОПИИ дерева (`F:/Temp/kaif-judge-ub5-gcRl/tree`, `node tools/build-framework.mjs`, exit 0): `KAIF-CORE.mjs`, `KAIF-FULL.md`,
`KAIF.md`, `kaif-module-map.json` — байт в байт как в `dist/` истока; `KAIF-CORE-BUNDLE.md` и `kaif-manifest.json` отличаются только
блоком `sectionsNew` (у копии нет тега: `"prev": null` против `"prev": "v2.9"`) и его sha.

Опровергнуто в общей части «ни один навык поставки не велит ставить всё»: `framework/skills/release/SKILL.md:139` — `git commit -am "release: X.Y"`
в шаге 6 «Publish (after the human's confirmation)» — ставит в индекс КАЖДУЮ изменённую отслеживаемую правку; шаг ждёт подтверждения
владельца, то есть ровно то окно, когда он правит дерево. Гард 5y этой формы не видит (заявление 2, находка 4). Граница `bugs/79` сознательно
не трогала отслеживаемые правки — но там их стерёг `revert-guard` истока; в поле его нет, а правило шага UB5 — «проверяемый набор и есть
отгружаемый» (`plans/139:72–74`). См. находку 5; ещё — находка 6 о смысле новой формы.

## Заявление 2 — гард 5y: молчит на дереве, красный ровно на четырёх текстах `3057175` — **VERIFIED**

```
$ node tools/sandbox/probes/ub5-sweep-red.mjs          # 20:15:06 → 20:15:12 (≈ 6 с, не ≈ 20)
OK  guard 5y — control copy: 0 line(s) «5y:»
OK  guard 5y — the four files of 3057175: 4 line(s) «5y:» (expected 4: the core default, two closing skills, the slot's example)
    - 5y: framework/skills/end-chat-force/SKILL.md:42 tells the agent to stage everything («git add -A») — stage the checked set by name (never -A)
    - 5y: framework/skills/end-chat-soft/SKILL.md:125 tells the agent to stage everything («git add -A») — stage the checked set by name (never -A)
    - 5y: framework/_intro.md:441 tells the agent to stage everything («git add -A») — stage the checked set by name (never -A)
    - 5y: framework/installer/KAIF-CORE.mjs:708 — the default <COMMIT_COMMAND> stages everything; stage by name
✅ guard 5y: silent on this tree, red exactly on the four pre-UB5 texts
exit 0
$ ls -d /f/Temp/kaif-ub5-* | wc -l     → 0 (проба убрала свои копии)
```

Заявление в своей узкой формулировке верно. Охота «слишком узкий гард» — находка 4: на копии дерева шесть правдоподобных форм
(одна из них — дословно стиль, которым полевой агент заполнил свои навыки закрытия) проходят 5y молча.

## Заявление 3 — `s01` «S9 #146» и «S9 UB5»: зелёные на этой сборке, красны ровно двое на `dist` `3057175` — **VERIFIED**

```
$ git archive 3057175 dist | tar -x -C F:/Temp/kaif-judge-ub5-gcRl/old
$ node tools/sandbox/s01-field-fixes.mjs F:/Temp/kaif-judge-ub5-gcRl/s01root-new          # 20:15:32 → 20:15:44, exit 0
✅ S9 #146: поставка не склеивает git-шаги — бандл, ядро и 37 развёрнутых навыков; /autoloop несёт три шага по умолчанию
✅ S9 UB5: ни один из 37 навыков свежей установки не велит подметающий «git add -A» — набор ставится по именам
✅ все песочницы зелёные                                                                     (86 строк ✅)
$ KAIF_DIST=F:/Temp/kaif-judge-ub5-gcRl/old/dist node tools/sandbox/s01-field-fixes.mjs F:/Temp/kaif-judge-ub5-gcRl/s01root-old   # 20:15:44 → 20:15:57, exit 1
❌ S9 #146: поставка не склеивает git-шаги — бандл, ядро и 37 развёрнутых навыков; /autoloop несёт три шага по умолчанию — hits  | skills 37
❌ S9 UB5: ни один из 37 навыков свежей установки не велит подметающий «git add -A» — набор ставится по именам — autoloop:75, dayloop:72, end-chat-force:42, end-chat-soft:125, nightloop:61, propose-idea:62, release:130, report-bug:220
❌ ПРОВАЛОВ: 2                                                                               (83 ✅ + 2 ❌ = 85 случаев; на новой — 85 + сводка)
```

## Заявление 4 — смена текста слота не ломает поле: `update` → `update-verify` / `recheck` без ложного «not found» — **REFUTED**

**Улика заявления не доходит до места, где живёт «not found».** Строку «⚠ promised upstream line not found on disk» печатает только
`runFinalGates` команды `update-verify` (`framework/installer/KAIF-CORE.mjs:3178`, вызов — `:3395`); `checkpoint recheck` запускает только
`check` (`:4582`, `spawnSync(... 'check')`). Проба `sw-field-route` зовёт `install` · `update` · `check` · `checkpoint recheck` · `wire-hooks`
(`tools/sandbox/probes/sw-field-route.mjs:108 · 150 · 165 · 178 · 198 · 244 · 272 · 275`), `update-verify` — ни разу, слот навыков закрытия не
заполняет (`grep -n "update-verify\|fill" … sw-field-route.mjs` — пусто). Её «not found — 0» — ноль по построению. Повтор числа:

```
$ node tools/sandbox/probes/sw-field-route.mjs ; KAIF_DIST=…/old/dist node tools/sandbox/probes/sw-field-route.mjs   # 20:22:04 → 20:22:11
OK 42 · 42 ; BAD 0 · 0 ; «not found» 0 · 0 ; вывод двух сборок совпадает (без времени и имён каталогов); exit 0 · 0
```

**Наблюдение с заполненным слотом — дифференциал на клонах поля.** Скрипт `route.mjs` (текст — в приложении): каждый субъект обновляется
ДВАЖДЫ с одной стартовой копии — этой сборкой и сборкой `3057175`, обе помечены 2.10, `--baseline` — `dist` тега v2.9; `update` — развёрнутым
ядром (полевой маршрут), затем `update-verify` и `check` свежим ядром; агентского слияния нет — сравниваются строки о навыках закрытия.
Субъекты: фикстура v2.9 из тега со слотом, заполненным своей строкой проекта; фикстура сборки `3057175` (дельта — только слот); git-клоны ВСЕХ
восьми полевых развёртываний v2.9 (все восемь заполнили слот навыков закрытия своим текстом — опрос ниже).

```
$ node F:/Temp/kaif-judge-ub5-gcRl/route.mjs                       # 20:18:35 → 20:19:25 (фикстуры, поля #1 #3 #6), exit 0
$ PICK=8,10,11,12,13 node F:/Temp/kaif-judge-ub5-gcRl/route.mjs    # 20:20:23 → 20:21:23 (фикстуры, поля #8 #10 #11 #12 #13), exit 0
=== fixture29: NEW vs OLD
  [NEW] … «not found» total 0, of them in the closing skills 0
  [OLD] … «not found» total 0, of them in the closing skills 0
=== fixturePre: NEW vs —
  [NEW] … «not found» total 0, of them in the closing skills 0
=== field1:  [NEW] «not found» total 2, in the closing skills 1 · [OLD] total 1, in the closing skills 0
  [NEW] NOT FOUND: ⚠ promised upstream line not found on disk (unmerged?): .claude/skills/end-chat-soft/SKILL.md :: Co-Authored-By: Claude Opus 5.5 <YOUR AGENT'S noreply EMAIL>
=== field3:  [NEW] total 5, in the closing skills 1 · [OLD] total 4, in the closing skills 0
  [NEW] NOT FOUND: ⚠ promised upstream line not found on disk (unmerged?): .claude/skills/end-chat-soft/SKILL.md :: Co-Authored-By: <YOUR AGENT/MODEL> <YOUR AGENT'S noreply EMAIL>
=== field6:  [NEW] total 1, in the closing skills 1 · [OLD] total 0, in the closing skills 0      (та же строка)
=== field8:  [NEW] total 1, in the closing skills 1 · [OLD] total 0, in the closing skills 0      (та же строка)
=== field10: [NEW] total 3, in the closing skills 1 · [OLD] total 2, in the closing skills 0      («Co-Authored-By: Claude Opus 5.5 <YOUR AGENT'S noreply EMAIL>»)
=== field11: [NEW] total 4, in the closing skills 1 · [OLD] total 3, in the closing skills 0      (то же)
=== field12: [NEW] total 8, in the closing skills 1 · [OLD] total 7, in the closing skills 0      («… Claude Opus 5.5 (1M context) <YOUR AGENT'S noreply EMAIL>»)
=== field13: [NEW] total 8, in the closing skills 0 · [OLD] total 8, in the closing skills 0
closing-skill lines only with NEW (каждое из восьми полей):
     + update: ↻ merged 2 module(s) into .claude/skills/end-chat-force/SKILL.md (kept for you: ## Step 2. Commit and push)
     + update: ↻ merged 2 module(s) into .claude/skills/end-chat-soft/SKILL.md (kept for you: ### Step 4. Commit and push (judge first))
[field #N] the source deployment untouched: true      (все восемь: HEAD, git status, файлы KAIF и навыки закрытия по sha)
```

Повтор `update-verify` на копии поля #8 — сводка того же предупреждения:

```
⚠ promised upstream line not found on disk (unmerged?): .claude/skills/end-chat-soft/SKILL.md :: Co-Authored-By: <YOUR AGENT/MODEL> <YOUR AGENT'S noreply EMAIL>
⚠ 1 upstream line(s) from the module diffs are absent on disk — merge them or state why in the judge verdict
```

На диске клонов строка ЗАПОЛНЕНА личностью агента (`Co-Authored-By: Claude Opus 5.5 <почта>`, `Claude Fable 5.1 <почта>` …), в `fills`
манифеста развёртывания — `<BUILD_COMMAND>, <TEST_HARNESS>` (у #1 ещё `<YOUR AGENT/MODEL>`), почты нет — обещанная строка требует вставить
заглушку обратно. Ложное «not found». Механизм: UB5 меняет модуль «Step 4. Commit and push (judge first)» (`end-chat-soft:119`, строка соавтора —
`:132`); у поля, заполнившего слот, этот модуль «kept for you» и уходит в «Module diffs (your version → the new template)» — все строки
модуля, где диск расходится с шаблоном, становятся «+»; строки самого слота `instructionSlotLines()` честно пропускает (их «not found» нет
ни на одном клоне), а соседнюю строку со слотом-заглушкой личности — нет. Сборка `3057175` этот модуль не меняет — строки нет. Итог: 7 из 8
полевых развёртываний v2.9 получают от этой сборки одно ложное «not found», которого сборка до UB5 не даёт; фикстуры (строка соавтора не
заполнена) — 0 по построению. Это тот же класс, что EXP-0184 («строка … со слотом `<AUTHOR>`: обещанная заполнена, блок шаблона — нет»),
о котором предупреждала сама строка плана (`plans/139:75–77`).

Не проверено: маршрут развёртываний v2.8 (шесть на диске) и переведённых (три) — в эту пробу не входили; поведение агента при слиянии —
моделировалось отсутствием слияния (слияние, сохраняющее свою строку соавтора, строку всё равно не даст).

## Заявление 5 — нота сборщика 2.10 честно называет остаток — **PARTIAL**

Подтверждено: список навыков ноты (`/autoloop` · `/dayloop` · `/nightloop` · `/release` · `/report-bug` · `/propose-idea`) — ровно те, что
несут `<COMMIT_COMMAND>`:

```
$ grep -rln "<COMMIT_COMMAND>" framework/ | sort
framework/_intro.md
framework/installer/KAIF-CORE.mjs
framework/skills/autoloop/SKILL.md  framework/skills/dayloop/SKILL.md  framework/skills/nightloop/SKILL.md
framework/skills/propose-idea/SKILL.md  framework/skills/release/SKILL.md  framework/skills/report-bug/SKILL.md
```

Механизм «замороженного значения» наблюдён: `stableValues()` = `{ ...detectValues(), ...snapshotValues() }` (`KAIF-CORE.mjs:726–727`) —
снимок манифеста побеждает; после `update` этой сборкой на обеих фикстурах и семи клонах из восьми все шесть навыков циклов несут `git add -A`
(`[NEW] «git add -A» left in deployed skills after the update: autoloop:75 · dayloop:72 · nightloop:61 · propose-idea:62 · release:130 · report-bug:220`),
у клона #8 — `nightloop:79` (и его собственный навык `pause:33`).

Опровергнуто «честно называет остаток» — остаток поля шире ноты. Опрос шестнадцати развёртываний (только чтение `.kaif/deploy-manifest.json`
и `.claude/skills/*/SKILL.md`, `F:/Temp/kaif-judge-ub5-gcRl/survey.mjs`, `survey2.mjs`):

```
manifest COMMIT_COMMAND: git add -A && git commit -m "<msg>" && git push                         — 11 из 16
manifest COMMIT_COMMAND: git add -A, then git commit -m "<msg>", then git push — each its own …  —  5 из 16
навыки циклов с «git add -A»: у 15 из 16 — все шесть, у #8 — только nightloop
навыки закрытия, ЗАПОЛНЕННЫЕ своим текстом с «git add -A»: #1 (оба, «`git add -A`, then `git commit -m "..."` — separate tool calls»),
  #7 (оба), #8 (end-chat-force), #14 (оба) — 4 развёртывания
```

Нота цитирует только форму «git add -A, then …» (у 5 из 16) — агент, ищущий её в своих навыках, у 11 из 16 не найдёт ничего, там
`git add -A && …`; нота не называет навыки закрытия, чей слот поле заполнило собственным подметающим текстом (обновление сохраняет его как
«kept for you», `update-verify` о нём молчит — слот), и не называет, что у каждого поля с заполненным слотом (8 из 8 v2.9) модули коммита
обоих навыков закрытия уходят в ручное слияние.

## Заявление 6 — отчёт прогона `testcases/reports/2026-11-17_ub5-no-sweeping-stage.md` правдив — **REFUTED**

Подтверждено: линтер принимает форму; числа прогонов 1–4 повторены (выше); сборка 838 (`version.json:8`).

```
$ node framework/tools/kaif-testrun-lint.mjs check
✅ testrun-lint OK — 148 report(s) under testcases/reports/, 0 findings
```

Опровергнуто:
- Строка «РЕАЛЬНЫЙ МИР» (§2): «развёртывание, заполнившее слот коммита прежним значением (`git add -A, then …`), — проверено с реальным
  состоянием: фикстура пробы ставит v2.8 из тега тем же ядром, что поле». Значение фикстуры v2.8 — склейка
  (`git show v2.8:framework/installer/KAIF-CORE.mjs | grep -n "'<COMMIT_COMMAND>':"` → `644: … 'git add -A && git commit -m "<msg>" && git push'`),
  слот навыков закрытия в фикстуре НЕ заполнен (проба его не трогает).
- Там же: «клоны живых развёртываний — не гонялись (на диске нет развёртываний v2.8 под эту пробу)» — на диске шесть развёртываний v2.8
  (проба принимает любой клон v2.8, `sw-field-route.mjs:121–140`) и восемь v2.9 — главный маршрут поля на 2.10; все восемь заполнили слот.
- §4: «прочитаны `checkpoint recheck` и `check` — зелёные, ни одного ложного «not found» по навыкам закрытия» — ни одна из двух команд «not found»
  не печатает (заявление 4); на клонах `update-verify` даёт ложное «not found» 7 из 8. Вердикт `pass` без функционального прогона того места,
  о котором он говорит.

## Заявление 7 — строки `plans/139` (UB5 ✅), `STATUS.md` п. 0 (4), `HOUSE_RULES.md` §1 не шире наблюдения — **REFUTED**

- `plans/139:68–71` — `[x] UB5 — ✅ …; маршрут поля sw-field-route обеими сборками — 42 OK, «not found» — 0; остаток — замороженное значение
  слота старых развёртываний — нота сборщика 2.10` — при том, что тот же пункт (`:74–77`) ставит условие: «смена текста слота трогает поля,
  заполнившие слот своей командой (`update-verify` — ложное «not found» …) — правку доказывать прогоном на git-клоне поля ДО коммита
  (EXP-0184 …)». Прогона на клоне нет, «not found — 0» — от команд, которые его не печатают; на клонах — 7 из 8 ложных; остаток шире ноты.
- `STATUS.md:79–80` — «UB5 ✅ (сессия 101 — набор по именам в трёх местах, гард 5y, …)» — та же отметка «готово» до условия плана.
- `HOUSE_RULES.md:65` — «гард 5y сборки — инструкция подметающего `git add -A` в навыках поставки …» — гард ловит три формы (находка 4), не
  «инструкцию» вообще; «≈ 20 с» — измерено ≈ 6 с (мелочь).

## Заявление 8 — изменённые тесты оправданы и не зелены по чужой причине — **VERIFIED**

`tools/sandbox/s01-field-fixes.mjs:464–481`: скан склейки `CHAIN = /&&\s*git\s+(push|commit|tag)\b/` по бандлу, ядру и 37 развёрнутым
навыкам (`hits.length === 0`) — не тронут; заменено только ожидание текста `/autoloop` (старая форма → новая, обе — три шага без `&&`).
Красный «S9 #146» на `3057175` — от текста (`hits  |` пусто), не от склейки — так и должно быть: значение по умолчанию сменилось.
Склейку по-прежнему стережёт `hits`:

```
$ node -e "const C=/&&\s*git\s+(push|commit|tag)\b/;console.log(C.test('git add a.md b.md && git commit -m \"<msg>\" && git push'), C.test('git add each file ..., then git commit -m \"<msg>\", then git push'))"
true false
```

Ослабления нет. Оговорка: «S9 UB5» (`s01:482`) делит с 5y ту же узкую примету `SWEEP` — его зелёный не шире гарда (находка 4).

## Находки

1. **Ложное «not found» у полей с заполненным слотом — 7 из 8 v2.9** (`framework/skills/end-chat-soft/SKILL.md:119–132` — модуль, который UB5
   меняет, и строка соавтора в нём; проверка — `framework/installer/KAIF-CORE.mjs:3166–3179`). Улика — дифференциал заявления 4: этой сборкой
   `update-verify` называет `Co-Authored-By: <YOUR AGENT/MODEL> <YOUR AGENT'S noreply EMAIL>` (или полузаполненную форму) «not found» на 7 клонах,
   сборкой `3057175` — ни на одном; на диске строка заполнена. Предупреждение, не отказ: «merge them or state why in the judge verdict»;
   вставка заглушки обратно была бы хуже. Класс EXP-0184 повторён: фикстура не несёт заполненной личности агента.
2. **Улика C4 не дотягивается до места** (`tools/sandbox/probes/sw-field-route.mjs:150–275`): проба не зовёт `update-verify` и не заполняет
   слот; «not found — 0» — ноль по построению. Охота «tested on hygiene alone» / «claim wider than the observation».
3. **«РЕАЛЬНЫЙ МИР» отчёта ложен в трёх местах** (`testcases/reports/2026-11-17_ub5-no-sweeping-stage.md` §2 и §4): значение фикстуры v2.8 —
   `git add -A && …` (ядро v2.8:644), слот фикстуры не заполнен, «на диске нет развёртываний v2.8» — их шесть (и восемь v2.9).
4. **Гард 5y и «S9 UB5» узки** (`tools/check-framework.mjs:1002`, `tools/sandbox/s01-field-fixes.mjs:482`). Копия дерева, шесть форм вписаны в
   `framework/skills/autoloop/SKILL.md` (`F:/Temp/kaif-judge-ub5-gcRl/guardcopy.mjs`, 20:15:59 → 20:16:04):
   ```
   control: exit 0, 5y lines 0, error-ish lines 0
   mutant (6 forms in framework/skills/autoloop/SKILL.md): exit 0, 5y lines 0
   lines new against the control:            ← пусто
   ```
   Формы: «Commit: `git add -A`, then `git commit -m "<msg>"`, then `git push`» (стиль, которым поле #1 заполнило СВОИ навыки закрытия) ·
   перенос строки «… with git add -A,» / «then git commit …» (сама новая форма в этих навыках стоит на двух строках) · блок bash
   `git add -A` / `git commit` отдельными строками (стиль шага 6 `/release`) · «Otherwise: `git add -A`, then …» · `git add --all, then …` ·
   `git commit -am`. Проверка регэкспом отдельно (`forms.mjs`): из 15 подметающих форм ловит 3 — две до-UB5-формы и `&&`.
5. **`/release` шаг 6: `git commit -am "release: X.Y"`** (`framework/skills/release/SKILL.md:132–139`) — подметание отслеживаемых правок в
   шаге, который ждёт подтверждения владельца; не названо шагом UB5, не видно гарду 5y (форма 6 находки 4).
6. **Новая форма слота исключает новые файлы** (`framework/skills/end-chat-soft/SKILL.md:125`, `end-chat-force/SKILL.md:42`, значение
   `KAIF-CORE.mjs:710`, пример `_intro.md:441`): «git add each file of the set you checked with git diff --stat» — но `git diff --stat` не
   показывает неотслеживаемые файлы:
   ```
   (временный репозиторий F:/Temp/kaif-judge-ub5-gcRl/gd: tracked.md изменён, session-report.md — новый)
   --- git diff --stat:
    tracked.md | 1 +
    1 file changed, 1 insertion(+)
   --- git status --short:
    M tracked.md
   ?? session-report.md
   ```
   Агент, исполняющий строку буквально, не поставит ни одного нового файла своей сессии (отчёт, разведку, новую пробу) — закрытие уедет без
   них. Кроме того, проверка стоит ДО постановки, а канон поставки просит проверять набор, «который РЕАЛЬНО УЕДЕТ» (`framework/AGENT_GUIDE.md:553`
   «`git diff --stat` before every commit — of the set that is ACTUALLY LEAVING»); сами навыки закрытия `git diff --stat` нигде не велят
   (`grep -n "diff --stat" framework/skills/end-chat-*/SKILL.md` — только строка слота). Пример лучшей формы есть в поле (#3): «`git add <the
   declared set>`, then `git diff --cached --stat`, then `git commit …`».
7. **Нота сборщика сужает остаток** (`tools/build-framework.mjs:323`): цитирует «git add -A, then …» (5 из 16 манифестов), а у 11 из 16 —
   `git add -A && git commit -m "<msg>" && git push`; не называет 4 развёртывания, чьи навыки закрытия заполнены собственным `git add -A`, и
   ручное слияние модулей коммита обоих навыков закрытия у 8 из 8 полей v2.9 с заполненным слотом.
8. **Отметка «готово» раньше условия своего плана** (`plans/139:68–71` против `:74–77`, `STATUS.md:79–80`, `HOUSE_RULES.md:65`): «✅» стоит,
   прогона на git-клоне поля до коммита нет; строка правил описывает гард шире его трёх форм. Охоты «done without the real world», «standing
   falsehood» (если закоммитить так).

**Не проверено:** маршрут v2.8 → 2.10 (шесть развёртываний) и переведённых развёртываний (три) с заполненным слотом; поведение живого
агента при слиянии модуля «kept for you»; что ложное «not found» делает с итоговым вердиктом судьи поля (только предупреждение — по тексту
ядра); полный полигон не гонялся (по брифу).

Уборка: `F:/Temp/kaif-judge-ub5-gcRl` (копия дерева, сборка на копии, старый `dist`, корни `s01`, клоны полей, логи, скрипты) и маркер
`F:/Temp/.kaif-judge-ub5-path-1051` удалены в конце суда; пробы `ub5-sweep-red` и `sw-field-route` свои каталоги убрали сами
(`ls -d /f/Temp/kaif-ub5-* /f/Temp/kaif-sw-field-*` → пусто). Файлы `*.tmp` и `cv_debug.log` в `F:/Temp` с метками 20:19–20:23 — не мои
(расширения браузера, копятся с утра), не тронуты.

## Приложение — `route.mjs` (дифференциал заявления 4, как прогнан; каталог убран)

```js
// judge UB5 (session 102): does the slot change of UB5 give a FILLED-slot deployment a false «not found» on update → update-verify → check?
// Differential: every subject is updated twice from the same starting copy — by THIS build and by the build 3057175 (before UB5), both
// labelled 2.10 — and the lines naming the closing skills are compared. Field deployments are only READ (git clone + carried files).
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, cpSync, readdirSync, rmSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';

const REPO = 'D:/work/ai_sandbox/KAIF';
const J = 'F:/Temp/kaif-judge-ub5-gcRl';
const ROOT = join(J, 'route'); rmSync(ROOT, { recursive: true, force: true }); mkdirSync(ROOT, { recursive: true });
const FIELD_BASE = 'D:/work/ai_sandbox';
const FIELD_PICK = (process.env.PICK || '1,3,6').split(',').map(Number);
const sha = (b) => createHash('sha256').update(b).digest('hex');
const ENV = { ...process.env, KAIF_VOICE_TOOL: '', GIT_OPTIONAL_LOCKS: '0',
  GIT_AUTHOR_NAME: 'kaif-judge', GIT_AUTHOR_EMAIL: 'judge@localhost', GIT_COMMITTER_NAME: 'kaif-judge', GIT_COMMITTER_EMAIL: 'judge@localhost' };
delete ENV.KAIF_VOICE;
const git = (cwd, ...a) => { const r = spawnSync('git', a, { cwd, env: ENV, encoding: 'utf8', maxBuffer: 1 << 26 }); return { code: r.status, out: (r.stdout || '').trim() }; };
const core = (cwd, args) => { const r = spawnSync(process.execPath, [join(cwd, '.kaif', 'kaif-core.mjs'), ...args], { cwd, env: ENV, encoding: 'utf8', timeout: 600000, maxBuffer: 1 << 26 }); return { code: r.status, all: (r.stdout || '') + (r.stderr || '') }; };
const read = (p) => { try { return readFileSync(p); } catch { return null; } };

// ---- artifacts
const DIST_FILES = ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs', 'KAIF-FULL.md', 'KAIF.md', 'kaif-manifest.json', 'kaif-module-map.json'];
const V29 = join(ROOT, 'v2.9'); mkdirSync(V29);
for (const f of DIST_FILES) writeFileSync(join(V29, f), execFileSync('git', ['show', 'v2.9:dist/' + f], { cwd: REPO, maxBuffer: 1 << 27 }));
const PRE = join(J, 'old', 'dist');            // dist of 3057175 (git archive)
const META_RE = /(^> \*\*FILE: `kaif-bundle-manifest\.json`\*\*[^\n]*\n\n`{6}\w*\n)([\s\S]*?)(\n`{6})/m;
function labelled(dist, name, ver) {
  const S = join(ROOT, name); mkdirSync(S);
  const b = readFileSync(join(dist, 'KAIF-CORE-BUNDLE.md'), 'utf8'); const m = b.match(META_RE); const meta = JSON.parse(m[2]); meta.version = ver;
  writeFileSync(join(S, 'KAIF-CORE-BUNDLE.md'), b.replace(META_RE, (_, a, __, c) => a + JSON.stringify(meta, null, 2) + c));
  copyFileSync(join(dist, 'KAIF-CORE.mjs'), join(S, 'KAIF-CORE.mjs'));
  const man = JSON.parse(readFileSync(join(dist, 'kaif-manifest.json'), 'utf8')); man.version = ver;
  for (const f of ['KAIF-CORE-BUNDLE.md', 'KAIF-CORE.mjs']) man.sha256[f] = sha(readFileSync(join(S, f)));
  writeFileSync(join(S, 'kaif-manifest.json'), JSON.stringify(man, null, 2) + '\n');
  return S;
}
const SRC = { NEW: labelled(join(REPO, 'dist'), 'src-new', '2.10'), OLD: labelled(PRE, 'src-pre', '2.10') };

// ---- the project's own fill of the closing skills' commit slot
const FILL = 'This project commits with its own tool: `node tools/commit.mjs "<msg>"` — it prints the set, stages it by name, commits and pushes (AGENT_GUIDE.md → Git workflow).';
function fillSlot(P) {
  const done = [];
  for (const n of ['end-chat-soft', 'end-chat-force']) {
    const f = join(P, '.claude', 'skills', n, 'SKILL.md'); const crlf = /\r\n/.test(readFileSync(f, 'utf8'));
    const L = readFileSync(f, 'utf8').replace(/\r\n/g, '\n').split('\n');
    const s = L.findIndex((l) => l.trim().startsWith('`<Use your commit tool/flow')); if (s < 0) { done.push(n + ': no slot'); continue; }
    let e = s; while (e < L.length && !L[e].trim().endsWith('>`')) e++;
    L.splice(s, e - s + 1, FILL); writeFileSync(f, L.join(crlf ? '\r\n' : '\n')); done.push(`${n}: slot lines ${s + 1}–${e + 1} replaced`);
  }
  return done.join(' · ');
}
function fixture(name, dist) {
  const P = join(ROOT, 'base-' + name); mkdirSync(P); git(P, 'init', '-q');
  writeFileSync(join(P, 'README.md'), '# An owner project\n'); mkdirSync(join(P, 'tools')); writeFileSync(join(P, 'tools', 'commit.mjs'), 'process.exit(0);\n');
  mkdirSync(join(P, '.kaif', 'install'), { recursive: true });
  copyFileSync(join(dist, 'KAIF-CORE-BUNDLE.md'), join(P, '.kaif', 'install', 'KAIF-CORE-BUNDLE.md'));
  copyFileSync(join(dist, 'KAIF-CORE.mjs'), join(P, '.kaif', 'kaif-core.mjs'));
  const r = core(P, ['install', '--agents', 'claude-code']);
  console.log(`[${name}] install exit ${r.code}; ${fillSlot(P)}`);
  git(P, 'add', '-A'); console.log(`[${name}] commit exit ${git(P, 'commit', '-qm', 'owner project with its own commit flow').code}`);
  return P;
}
const CARRY = ['.claude/settings.json', '.claude/settings.local.json', '.kaif/kaif-core.mjs', '.kaif/install/KAIF-CORE-BUNDLE.md', '.kaif/kaif.json', '.kaif/deploy-manifest.json', '.kaif/last-update.json'];
const fieldDirs = readdirSync(FIELD_BASE).filter((d) => existsSync(join(FIELD_BASE, d, '.kaif', 'kaif.json')) && d !== 'KAIF');
const stateOf = (dep) => JSON.stringify({ head: git(dep, 'rev-parse', 'HEAD').out, st: git(dep, 'status', '--porcelain').out, f: CARRY.map((f) => { const b = read(join(dep, f)); return b ? sha(b) : '-'; }), s: ['end-chat-soft', 'end-chat-force'].map((n) => sha(read(join(dep, '.claude/skills', n, 'SKILL.md')) || '')) });
function fieldClone(k) {
  const dep = join(FIELD_BASE, fieldDirs[k - 1]); const P = join(ROOT, 'base-field' + k);
  const c = git(ROOT, 'clone', '-q', '--no-hardlinks', dep, P);
  let carried = 0;
  for (const f of CARRY) { const b = read(join(dep, f)); if (!b) continue; const h = read(join(P, f)); if (h && sha(h) === sha(b)) continue; mkdirSync(dirname(join(P, f)), { recursive: true }); writeFileSync(join(P, f), b); carried++; }
  // the closing skills as they stand on the owner's disk (a fill not yet committed is still his deployment)
  for (const n of ['end-chat-soft', 'end-chat-force']) { const b = read(join(dep, '.claude/skills', n, 'SKILL.md')); if (b) writeFileSync(join(P, '.claude/skills', n, 'SKILL.md'), b); }
  console.log(`[field #${k}] clone exit ${c.code}; carried ${carried} file(s) from disk; marker ${JSON.parse(readFileSync(join(P, '.kaif/kaif.json'), 'utf8')).version}`);
  return { P, dep };
}

const norm = (s, P) => s.split(P.replace(/\//g, '\\')).join('<P>').split(P).join('<P>').replace(/\b[0-9a-f]{12,64}\b/g, '<sha>').replace(/\d{4}-\d\d-\d\dT[\d:.]+Z?/g, '<t>');
const CLOSING = /end-chat-(soft|force)/;
function walk(label, base, srcName, baseline) {
  const P = join(ROOT, `${label}-${srcName}`); cpSync(base, P, { recursive: true });
  const u = core(P, ['update', '--source', SRC[srcName], '--baseline', baseline]);
  const task = (read(join(P, 'KAIF_UPDATE_TASK.md')) || '').toString();
  const v = core(P, ['update-verify']);
  const c = core(P, ['check']);
  const lines = (txt) => norm(txt, P).split(/\r?\n/).filter((l) => CLOSING.test(l)).map((l) => l.trim());
  const notFound = norm(v.all, P).split(/\r?\n/).filter((l) => /not found on disk/.test(l));
  // the + lines of the task's module diff in the closing skills' module carrying the commit slot
  const plus = []; let cur = null, inD = false;
  for (const l of task.split('\n')) { const h = l.match(/^### (.+)$/); if (h) { cur = h[1].trim(); continue; } if (l.startsWith('```')) { inD = l === '```diff'; continue; } if (inD && cur && CLOSING.test(cur) && /^[+-] /.test(l) && /commit|git add|git push|Workflow|Git workflow/i.test(l)) plus.push(`${cur.replace(/^\.claude\/skills\//, '')} ${l.slice(0, 150)}`); }
  const sweeps = [];
  const sk = join(P, '.claude', 'skills');
  for (const n of readdirSync(sk)) { const f = join(sk, n, 'SKILL.md'); if (!existsSync(f)) continue; readFileSync(f, 'utf8').split(/\r?\n/).forEach((l, i) => { const m = l.match(/git add -A[^,.;]{0,24}/); if (m) sweeps.push(`${n}:${i + 1} «${m[0].replace(/"[^"]*"/g, '"…"')}»`); }); }
  const diverged = /merge-diverged\*\*[^\n]*end-chat-soft/.test(task) ? 'end-chat-soft listed in merge-diverged' : 'end-chat-soft NOT in merge-diverged';
  return { label, srcName, u: u.code, v: v.code, c: c.code, uTail: norm(u.all, P).split(/\r?\n/).filter(Boolean).slice(-2).join(' | ').slice(0, 300),
    closing: [...lines(u.all).map((l) => 'update: ' + l), ...lines(v.all).map((l) => 'verify: ' + l), ...lines(c.all).map((l) => 'check: ' + l)],
    notFound, notFoundClosing: notFound.filter((l) => CLOSING.test(l)), plus, sweeps, diverged };
}
function report(a, b) {
  console.log(`\n=== ${a.label}: ${a.srcName} vs ${b ? b.srcName : '—'}`);
  for (const r of [a, b].filter(Boolean)) {
    console.log(`  [${r.srcName}] update ${r.u} · update-verify ${r.v} · check ${r.c} · «not found» total ${r.notFound.length}, of them in the closing skills ${r.notFoundClosing.length} · ${r.diverged}`);
    console.log(`  [${r.srcName}] update tail: ${r.uTail}`);
    for (const l of r.plus) console.log(`  [${r.srcName}] task diff: ${l}`);
    for (const l of r.notFoundClosing) console.log(`  [${r.srcName}] NOT FOUND: ${l.slice(0, 220)}`);
    console.log(`  [${r.srcName}] «git add -A» left in deployed skills after the update: ${r.sweeps.length ? r.sweeps.join(' · ') : 'none'}`);
  }
  if (b) {
    const A = new Set(a.closing), B = new Set(b.closing);
    const onlyA = a.closing.filter((l) => !B.has(l)), onlyB = b.closing.filter((l) => !A.has(l));
    console.log(`  closing-skill lines only with ${a.srcName}: ${onlyA.length}`); for (const l of onlyA) console.log('     + ' + l.slice(0, 240));
    console.log(`  closing-skill lines only with ${b.srcName}: ${onlyB.length}`); for (const l of onlyB) console.log('     - ' + l.slice(0, 240));
  }
}

const t0 = new Date().toISOString();
const f29 = fixture('fixture29', V29);
report(walk('fixture29', f29, 'NEW', V29), walk('fixture29', f29, 'OLD', V29));
const fpre = fixture('fixturePre', PRE);
report(walk('fixturePre', fpre, 'NEW', PRE));
for (const k of FIELD_PICK) {
  const { P, dep } = fieldClone(k); const s0 = stateOf(dep);
  const ver = JSON.parse(readFileSync(join(P, '.kaif/kaif.json'), 'utf8')).version;
  const baseline = ver === '2.9' ? V29 : null;
  if (!baseline) { console.log(`[field #${k}] marker ${ver} — skipped (this run updates only 2.9 deployments)`); continue; }
  report(walk('field' + k, P, 'NEW', baseline), walk('field' + k, P, 'OLD', baseline));
  console.log(`[field #${k}] the source deployment untouched: ${stateOf(dep) === s0}`);
}
console.log(`\nrun ${t0} → ${new Date().toISOString()}`);
```

Предпосылка скрипта: `git archive 3057175 dist | tar -x -C F:/Temp/kaif-judge-ub5-gcRl/old`. Печать скрипта может нести имя развёртывания в
строках `task diff:` (текст его собственного навыка) — в этот отчёт такие строки не перенесены.

## Исполнение находок — главный агент сессии 102 (2026-11-17 ≈ 20:30–20:55 +03:00)

Находки переисполнены до правок: находка 1 — копией `route.mjs` этого отчёта на полях #6 и #8 (20:31:43 → 20:32:09: по одному «not found»
строки соавтора с этой сборкой, 0 со сборкой `3057175`); находка 6 — по `git diff --stat` (неотслеживаемых не печатает); находка 5 — чтением
шага 6 `/release` обоих слоёв. Всё ниже — прогонами, журнал и команды — `testcases/reports/2026-11-17_ub5-no-sweeping-stage.md` §3.

1. Ложное «not found» строки с заглушкой — ядро (`update-verify`, проверка обещанных строк): строка, в которой после записанных `fills`
   осталась каноническая заглушка, сверяется образцом по строкам диска (заглушка — непустой отрезок одной строки; строка короче 8 знаков
   своего текста — как прежде). `s21` B9 — зелёный на этой сборке, красный ровно B9 на ядре `3057175`; контроль B9 — невлитая строка апстрима
   в том же модуле по-прежнему «not found». Поля: копия `route.mjs` на восьми — 0 в навыках закрытия; постоянная проба
   `tools/sandbox/probes/ub5-field-filled-slot.mjs` — 0 BAD, на копии `dist` без образца — 7 BAD (поля #1–#7). **Эта форма образца
   опровергнута повторным судом (R1, находки 1–2)** — исполнение ниже, в разделе «Исполнение находок повторного суда».
2. Улика C4 — заменена пробой полей выше (она зовёт `update-verify` и судит заполненный слот).
3. Строка «РЕАЛЬНЫЙ МИР» отчёта прогона — переписана, прежний текст процитирован там же.
4. Гард 5y — форма в одном месте `tools/lib/sweep-stage.mjs` (её читает и `s01`): в навыке — любой подметающий стейдж без отрицания на
   строке, в документации слота — формы приказа; `probes/ub5-sweep-red.mjs`: контроль 0 · пять файлов `3057175` — 5 · девять приказов (среди
   них стиль поля #1, строка bash-блока, перенос, `--all`, `.`, `commit -a`/`-am`, `;`) — 9, четыре законные строки — 0 · документация — 1.
   **Форма отрицания опровергнута повторным судом (находка 3)** — исполнение ниже.
5. `/release` шаг 6 обоих слоёв — `git add` по именам и `git diff --cached --stat` перед `git commit -m`; мутант A гарда называет
   `release/SKILL.md:139`.
6. Формулировка — «git add each file you mean to ship, by name (never -A; git status --short lists the new ones too), check the staged set
   with git diff --cached --stat» (навыки закрытия, значение по умолчанию, пример слота). **Дыра переноса — находка 6 повторного суда;
   формулировка заменена «путями»** — ниже.
7. Нота сборщика 2.10 — переписана: замороженное значение — склейка трёх git-шагов или «git add -A, then …», строка коммита, которую агент
   вписал в навыки закрытия, ручное слияние модуля коммита и шага 6 `/release`, починка `update-verify`; чисел поля, не перемеренных
   главным агентом, в ноте нет.
8. Строки `plans/139` UB5, `STATUS.md` п. 0 (4) и `HOUSE_RULES.md` §1 — переписаны не шире наблюдения, прежний текст процитирован.

Не исполнено: маршрут v2.8 → эта сборка и переведённые развёртывания (как и у судьи) — названы в отчёте прогона.

## Повторный суд (сессия 102, 2026-11-17 21:03:32 → 21:19:58 +03:00)

«The rule is only executable if the set you inspect is the set that ships» — `framework/AGENT_GUIDE.md:555–556`.

Судья: Claude Opus 5.5, субагент главной сессии 102, только чтение (кроме этого раздела); HEAD `3057175`, исправления — незакоммиченное
дерево (файлы исправлений за время суда не менялись; этот файл до дописывания — 435 строк, 20:57:52). Временное — только
`F:/Temp/kaif-rejudge-ub5-Dw2c` и папка, которую оставила красная проба (`F:/Temp/kaif-ub5-field-f8VIul`); обе убраны в конце. Старый `dist` —
`git archive 3057175 dist | tar -x`. Полевые развёртывания — только через git-клоны пробы; имена — номерами пробы. Скрипты судьи (`breadth.mjs`,
`hide.mjs`, `forms.mjs`, `slot.mjs`, `release-info.mjs`, `rel3.mjs`, `autoloop75.mjs`) лежали в этом временном каталоге и удалены вместе с ним;
ниже — что каждый делал и что напечатал.

**Итог:** REFUTED — 1 (R1) · PARTIAL — 4 (R2 · R3 · R4 · R5) · VERIFIED — 0; находок повторного суда — 7.

### R1 — образец заглушки в `update-verify`: ложное «not found» снято, невлитую строку не прячет — **REFUTED**

Первая половина подтверждена:

```
$ node tools/sandbox/s21-update-route.mjs <tmp>/s21new ; KAIF_DIST=<tmp>/old/dist node tools/sandbox/s21-update-route.mjs <tmp>/s21old   # 21:06:00 → 21:07:24
exit new 0   (94 ✅)
exit old 1
❌ B9 (судья UB5): update-verify не зовёт вернуть заглушки строки соавтора — на диске она заполнена — ⚠ promised upstream line not found on disk (unmerged?): .claude/skills/end-chat-soft/SKILL.md :: Co-Authored-By: <YOUR AGENT/MODEL> <YOUR AGENT'S noreply EMAIL> | …
❌ s21: 1 red
$ node tools/sandbox/probes/ub5-field-filled-slot.mjs                                  # 21:09:35 → 21:10:50, exit 0
✅ no false «not found» in the closing skills on any subject        (2 фикстуры + 8 развёртываний; «the source untouched» — у всех восьми)
$ KAIF_DIST=<копия dist, из ядра вырезана ровно одна строка «if (pattern && linesOf.get(curFile).some((l) => pattern.test(l))) continue;»> node …/ub5-field-filled-slot.mjs   # 21:10:50 → 21:11:51, exit 1
BAD  deployment #1 … #7: «not found» in the closing skills — 1 (this build) · 0 (3057175)      (#8 — OK)
❌ 7 BAD
```

Сверх заявленного: на развёртывании #1 образец снял ещё одно ложное «not found» — `AGENT_GUIDE.md` `| **License** | \`<LICENSE>\` |`
(на диске клона ровно одна строка под образец, это заполненная строка License, заглушки в ней нет).

Ширина образцов на шаблонах (`breadth.mjs` — копия `placeholderPattern` ядра дословно, по всем строкам бандла с заглушкой):

```
files 192; lines with a placeholder 60; judged as a pattern 59; below the literal threshold 1
patterns matching ANOTHER line of the SAME file: 0
patterns whose literal holds no word of 3+ letters: 0
```

На самих шаблонах образцы узки. Но образец не привязан к строке (`^…$` нет) и `\S.*?` проглатывает ЛЮБОЙ текст на месте заглушки — а
обещанная строка сверяется со всеми строками файла, не модуля. Вторая половина опровергнута на фикстуре с настоящим ядром (`hide.mjs`:
установка этой сборкой; слот коммита `end-chat-soft` заполнен своей строкой, строка соавтора — «Co-Authored-By: Test Model 1.0
<noreply@example.com>»; источник 9.9 = этот бандл + две строки в модуль «Step 4»: контроль без заглушки и НОВАЯ строка «Sign every tag as
<YOUR AGENT/MODEL> after the judge passes.»; ядро источника — это или `3057175`; `--baseline` — этот `dist`):

```
$ node hide.mjs <repo>/dist <tmp>/old/dist <tmp>/hide                    # 21:11:20 → 21:11:30 (H0–H3), ONLY=H4 … 21:11:51 → 21:11:55
[H0 · NEW core]  …not found… :: UPSTREAM ADDITION 9.9 — a placeholder-free line …   ·   …not found… :: Sign every tag as <YOUR AGENT/MODEL> after the judge passes.
[H2 · NEW core]  (строка соавтора удалена с диска, другой строки соавтора нет) — …not found… :: Co-Authored-By: <YOUR AGENT/MODEL> <YOUR AGENT'S noreply EMAIL>   (и две строки выше)
[H1 · NEW core]  (строка соавтора удалена с диска; строка слота поля: «… — it appends the trailer Co-Authored-By: Test Model 1.0 <noreply@example.com> by itself.»)
   promised upstream line not found on disk (unmerged?): … :: UPSTREAM ADDITION 9.9 — a placeholder-free line of the commit module.
   promised upstream line not found on disk (unmerged?): … :: Sign every tag as <YOUR AGENT/MODEL> after the judge passes.
                                                   ← строки соавтора НЕТ: её закрыл образец «Co-Authored-By: \S.*? \S.*?» по ЧУЖОЙ строке
[H1 · OLD core]  … те же две + …not found… :: Co-Authored-By: <YOUR AGENT/MODEL> <YOUR AGENT'S noreply EMAIL>
[H4 · NEW core]  (новой строки на диске нет; есть своя «Sign every tag as Test Model 1.0 only when the owner says so, never after the judge passes.»)
   promised upstream line not found on disk (unmerged?): … :: UPSTREAM ADDITION 9.9 — a placeholder-free line of the commit module.
                                                   ← новая строка молчит: смысл перевёрнут ВНУТРИ проглоченного отрезка
[H4 · OLD core]
   promised upstream line stands on disk with local edits (line 125, 82% of its words): … :: Sign every tag as <YOUR AGENT/MODEL> after the judge passes.
```

H0 и H2 — невлитая строка с заглушкой по-прежнему «not found», когда другой строки под образец нет. H1 — по-настоящему отсутствующая строка
спрятана другой строкой того же файла. H4 — ядро `3057175` давало метку «stands on disk with local edits», ровно ту, что велит «read each: an
edit that drops meaning (a removed «not») is merged by hand» (`KAIF-CORE.mjs:3196 · 3203`), — образец ставит `continue` до этой метки (`:3191`) и молчит.
Улика заявления «не прячет» до этой ветки не доходит: контроль B9 — строка без заглушки (`s21-update-route.mjs:243`), образец для неё не строится.
Наименьшая починка: образец — на всю сплющенную строку (`^…$`), отрезок заглушки — ограничен (без знаков конца предложения и запятой, с
пределом длины); при совпадении не по самой строке — метка «edited», не молчание; случаи H1 и H4 — в `s21` рядом с B9.

### R2 — гард 5y и `tools/lib/sweep-stage.mjs` — **PARTIAL**

Заявленные числа повторены:

```
$ node tools/sandbox/probes/ub5-sweep-red.mjs                    # 21:14:31 → 21:14:44, exit 0
OK  guard 5y — control copy: 0 line(s) «5y:» (expected 0)
OK  guard 5y — mutant A, the five files of 3057175: 5 line(s) (expected 5, one per file)          (… release/SKILL.md:139 среди них)
OK  guard 5y — mutant B, 9 orders + 4 legal lines in framework/skills/autoloop/SKILL.md: 9 line(s) (expected 9)
OK  guard 5y — mutant C, an example order + a sentence about the defect in framework/_intro.md: 1 line(s) (expected 1)
✅ guard 5y: silent on this tree, red exactly on the named texts and forms
```

Охота (`forms.mjs` — `sweepInSkill` / `sweepInDoc` из `tools/lib/sweep-stage.mjs` прямым импортом), 21:14:21:

```
MISSED  skill  If the project has no commit tool: `git add -A`, then `git commit -m "<msg>"`, then `git push`.
MISSED  skill  If there is no commit tool, run git add -A, then git commit -m "<msg>", then git push.
MISSED  skill  If you do not have a tool, git add -A then commit and push.
MISSED  skill  No tool here — git add -A, then git commit, then git push.
MISSED  skill  Otherwise: git add ., then git commit -m "<msg>", then git push.
MISSED  skill  Otherwise: `git add -u`, then `git commit -m "<msg>"`, then `git push`.
MISSED  skill  git add --update          MISSED  skill  git commit --all -m "release: X.Y"     MISSED  skill  git commit -m "release: X.Y" -a
MISSED  skill  git add :/                MISSED  skill  git add *                              MISSED  skill  git stage -A
FLAGGED skill  Hunt a sweeping `git add -A` after the check — the classic second route.
FLAGGED skill  If the record shows `git add -A` after the diff check, that is the finding.
FLAGGED skill  A sweeping `git add -A` carried two owner files into origin (bugs/79).
FLAGGED skill  `git add -A` is never used here — stage each file by name.
MISSED  doc    (e.g. `git add -A` and then `git commit -m "<msg>"` and `git push`)
MISSED  doc    (e.g. git add -A, git commit -m "<msg>", git push — each its own tool call)
orders missed 14 of 14; legal prose flagged 4 of 4
```

Самое правдоподобное поле — первая строка: так агент заполняет собственное «If you have one … Otherwise:» слота. Отрицание — любое
`no`/`not`/`don't` в 30 знаках ДО приказа (`sweep-stage.mjs:15`). Так же молчит НАСТОЯЩАЯ строка поставки `3057175` (находка 4). Ложные
срабатывания в навыке — пока латентны (на дереве 0), но строка охоты `/fable-judge` о классе `bugs/79` покраснит сборку.

### R3 — формулировка «by name … git diff --cached --stat» — **PARTIAL**

Исполнима как написана; удалённый файл — без дыры; переименование `mv` — дыра (временный репозиторий, git 2.43.0.windows.1):

```
--- git status --short:
 D gone.md
 M keep.md
 D old-name.md
?? new-name.md
?? report.md
--- git add keep.md gone.md report.md new-name.md ; git diff --cached --stat:
 gone.md     | 1 -          ← удаление по имени ставится
 keep.md     | 1 +
 new-name.md | 1 +
 report.md   | 1 +
--- status after:
D  gone.md · M  keep.md · A  new-name.md ·  D old-name.md · A  report.md     ← старый путь не поставлен; проверка в индексе его не показывает
```

Строка называет «new ones», но не удалённые и не старый путь переименования; `git diff --cached --stat` показывает только `A new-name.md`
— коммит уедет с дублем. Слот навыков закрытия (`slot.mjs` — `instructionSlotLines()` ядра дословно, текст сверен с `KAIF-CORE.mjs:3376`):

```
framework/skills/end-chat-force/SKILL.md: slot lines 4; of them the commit slot 4 · headings or fences swallowed by a slot: 0
framework/skills/end-chat-soft/SKILL.md: slot lines 10; of them the commit slot 4 · headings or fences swallowed by a slot: 1 — ### Step 4. Commit and push (judge first)
  115 `<Run the project build … · 116 · 117 regenerates README.pdf.>` If a build fails, … · 119 ### Step 4. … · 121 Run a `/fable-judge` pass … · 122 precedes every push). Then: · 124–127 слот коммита
```

Слот коммита открывается на 124 и закрывается на 127 — как ждёт ядро; вложенных обратных кавычек нет. Но слот шага 3 (`:115–117`) не
закрывается (строка 117 кончается «state.», не «>\`») и глотает заголовок шага 4 и правило «судья перед пушем» (`:119–122`) — так же в
`v2.9` и `3057175` (находка 7; не UB5). `/release` шаг 6: `git add <…>` — шаблон, агент подставляет имена; исполнимо.

### R4 — проба `ub5-field-filled-slot.mjs` — **PARTIAL**

Подтверждено: источники только читаются (8 × «the source untouched»), печать — номера и пути шаблона (строка соавтора на BAD — с
вымаранной личностью: «Co-Authored-By: …<YOUR AGENT'S noreply EMAIL>»), на OK своя папка убрана (после зелёного прогона `ls -d
/f/Temp/kaif-ub5-*` пусто), на BAD оставлена с предупреждением (`kept for the analysis (holds clones of the owner's projects — delete after):
F:\Temp\kaif-ub5-field-f8VIul` — удалена судьёй). Вердикт BAD по навыкам закрытия честен.

Опровергнуто объяснение справки INFO «its new lines stand «not found» by construction» (`ub5-field-filled-slot.mjs:15–16 · 122–123`).
`release-info.mjs` + `rel3.mjs` по клонам пробы, ядро этой сборки подставлено в копию (21:12:52 → 21:13:16):

```
#5 · #6 · #7 · #8: release «not found/edited» 3 — git add <each file …> · git diff --cached --stat … · git commit -m "release: X.Y"   (на диске — git commit -am: честное слияние)
#3: release step 6 — слот заполнен своим текстом (opener нет), свой блок из пяти строк git, git commit -am нет
⚠ promised upstream line not found on disk (unmerged?): .claude/skills/release/SKILL.md :: # bump version (in version.json or your manifest), then —
⚠ promised upstream line not found on disk (unmerged?): .claude/skills/release/SKILL.md :: git add <each file of the release, by name: the version file
⚠ promised upstream line not found on disk (unmerged?): .claude/skills/release/SKILL.md :: git diff --cached --stat    # the staged set IS the set that
⚠ promised upstream line stands on disk with local edits (line 132, 100% of its words): … :: git commit -m "release: X.Y"
⚠ promised upstream line stands on disk with local edits (line 212, 100% of its words): … :: git tag vX.Y
⚠ promised upstream line not found on disk (unmerged?): .claude/skills/release/SKILL.md :: git push --tags
⚠ promised upstream line not found on disk (unmerged?): .claude/skills/release/SKILL.md :: gh release create vX.Y --title "<PROJECT> X.Y — <Codename>
in the 3057175 bundle: true :: # bump version … · git tag vX.Y · git push --tags · gh release create …     (не новые строки)
```

На #3 три из пяти «not found» («# bump version …», «git push --tags», «gh release create …») — строки, НЕ менявшиеся с `3057175`: модуль,
переписанный полем, уходит в «Module diffs», и его неизменные строки становятся обещанными — класс находки 1 первого суда; его вызвала
правка шага 6 самого UB5. Сборка `3057175` на #3 даёт 0.

### R5 — тексты не шире наблюдения — **PARTIAL**

Подтверждено: `HOUSE_RULES.md` §1 (≈ 12 с — измерено 13; ≈ 70 с — 75; числа 0 · 5 · 9 · 1 и 7 BAD повторены); `plans/139` UB5 — числа
повторены, оговорки v2.8 и переведённых стоят; нота сборщика 2.10 (`tools/build-framework.mjs:323`) — чисел поля нет, формы замороженного
значения названы обе; `STATUS.md` п. 0 сессии 102 — числа повторены (полигон не гонялся по брифу; `{{T}}` — не находка); `s01` (21:16:44 →
21:17:10): на этой сборке 86 ✅, exit 0; на `dist` `3057175` — exit 1, ровно «S9 #146» и «S9 UB5»; `s21` — ровно B9 (R1); `dist/KAIF-CORE.mjs`
байт в байт `framework/installer/KAIF-CORE.mjs`; `git commit -am` в бандле — только в цитате ноты.

Опровергнуто:
- `testcases/reports/2026-11-17_ub5-no-sweeping-stage.md:66` — «невлитая строка апстрима по-прежнему «not found» | pass | `s21` B9 контроль»
  и тот же довод в разделе исполнения выше (`:418`, «контроль B9 — невлитая строка апстрима … по-прежнему «not found»») — контроль без
  заглушки до ветки образца не доходит; H1 и H4 — ветка образца прячет.
- `:49` («справка — у пяти полей `/release` 0→2…5 (шаг 6 придёт на слияние)») и `:76` («ложные BAD на пяти полях из-за честно изменённого шага 6
  `/release`») — на #3 три из пяти — неизменные строки шаблона (R4).
- `EXPERIENCE.md:106` — «Починено классом в ядре» — починено подмножество класса (заполненная заглушка); механизм «переписанный модуль →
  все его разошедшиеся строки обещаны» на #3 дал три ложных «not found» в `/release` этой же сборкой.
- Обоснование правки тестов для коммита (ещё не написано): «S9 UB5» сменил примету `SWEEP` на `sweepInSkill` — на `3057175` он больше не
  называет `autoloop:75` (первый суд его называл, `:71` выше) — обоснование обязано это сказать (находка 4).

### Находки повторного суда

1. **Образец заглушки прячет невлитую строку** (`framework/installer/KAIF-CORE.mjs:3163–3169` — образец без `^…$`, `\S.*?` без предела;
   `:3189–3191` — `continue` до метки «edited» `:3196 · 3203`). Улика — H1 (строка соавтора удалена, её закрыла строка слота поля с
   «Co-Authored-By: …»; ядро `3057175` — «not found») и H4 (своя строка с «never» внутри проглоченного отрезка; ядро `3057175` — «stands on disk
   with local edits (line 125, 82% of its words)», эта сборка — молчит).
2. **Улика «не прячет» не проходит через новую ветку** (`tools/sandbox/s21-update-route.mjs:243`, контроль B9 без заглушки); на ней же стоят
   отчёт (`testcases/reports/2026-11-17_ub5-no-sweeping-stage.md:66`) и раздел исполнения (`researches/38_kaif_2.10_scope_recon/judge-ub5.md:418`).
   Нужен случай: невлитая строка С заглушкой при чужой строке под образец (H1) и перевёрнутый смысл в отрезке (H4).
3. **Гард 5y пропускает 14 из 14 форм** (`tools/lib/sweep-stage.mjs:14–15`): условное «If the project has no commit tool: `git add -A`, then …»
   (окно отрицания 30 знаков), `git add .,` (взгляд вперёд без запятой), `git add -u`/`--update`, `git commit --all`, `git commit -m … -a`,
   `git add :/`, `git add *`, `git stage -A`, две формы документации; 4 из 4 законных фраз в навыке — красные (латентно).
4. **«S9 UB5» потерял настоящую строку поставки** (`tools/sandbox/s01-field-fixes.mjs:485` · `sweep-stage.mjs:15`): на свежей установке
   `3057175` `.claude/skills/autoloop/SKILL.md:75` — «10. **Commit** a small commit (don't lose progress): \`git add -A, then …\`» —
   `autoloop75.mjs`: `line 75 carries SWEEP: true · sweepInSkill (an order?): false`; та же фраза со склейкой `&&` — тоже `false`. Прогон
   `s01` на `3057175` (21:16:44 → 21:17:10): «S9 UB5 … — dayloop:72, end-chat-force:42, end-chat-soft:125, nightloop:61, propose-idea:62,
   release:130, release:139, report-bug:220» — `autoloop:75` нет (у первого суда — был первым). Это строка `<COMMIT_COMMAND>` шага 10 —
   именно та, что заморожена в навыках циклов поля.
5. **`/release` шаг 6 даёт полю #3 три ложных «not found» неизменных строк** (класс находки 1 первого суда; вызван правкой шага 6 UB5):
   «# bump version …», «git push --tags», «gh release create …»; проба считает это справкой INFO с неверным объяснением
   (`tools/sandbox/probes/ub5-field-filled-slot.mjs:15–16 · 122–123`), отчёт — «честно изменённым» (`:49 · :76`), `EXPERIENCE.md:106` —
   «починено классом».
6. **Формулировка не называет удалённые пути и старый путь переименования** (`framework/skills/end-chat-soft/SKILL.md:125–126`,
   `end-chat-force/SKILL.md:42–43`, `KAIF-CORE.mjs:711`, `_intro.md:441`): после `mv` постановка по именам новых файлов оставляет ` D old-name.md`
   вне индекса, `git diff --cached --stat` его не показывает — коммит уезжает с дублем.
7. **(Не UB5, с v2.9.) Слот шага 3 `/end-chat-soft` не закрывается** (`framework/skills/end-chat-soft/SKILL.md:115–117`): `instructionSlotLines()`
   считает слотом заголовок шага 4 и правило «судья перед пушем» (`:119 · :121–122`) — `update-verify` никогда не назовёт их невлитыми.

**Не проверено:** полный полигон (по брифу); пересборка `dist` из источников на копии (сверено только ядро байт в байт и наличие формулировки
в бандле); маршрут v2.8 и переведённые развёртывания; копия `route.mjs` на восьми полях (п. 1 исполнения) — вместо неё прогнана постоянная
проба (тот же маршрут); живой агент на слиянии; текст коммита и его обоснование правки тестов — ещё не написаны.

Уборка: `rm -rf /f/Temp/kaif-rejudge-ub5-Dw2c /f/Temp/kaif-ub5-field-f8VIul` в 21:19:03; `ls -d /f/Temp/kaif-rejudge-ub5-* /f/Temp/kaif-ub5-*
/f/Temp/kaif-sbx-*` → «No such file or directory» ×3; остались `kaif-status-guard-1f495f33-…` и `kaif-verify-ub5-0MMb` — не мои, не тронуты.
В `F:/Temp` за окно суда появились и не мои: `context-budget-*.json`, `*.tmp`, каталог `Temp` (21:18:40) — не тронуты.

## Исполнение находок повторного суда — главный агент сессии 102 (2026-11-17 ≈ 21:23–21:35 +03:00)

Находка 1 переисполнена до правки — копией образца на семи строках (якорная форма: соавтор поля, лицензия — совпадают; строка слота,
поминающая соавтора, и оба перевёрнутых варианта — нет). Команды и журнал — `testcases/reports/2026-11-17_ub5-no-sweeping-stage.md` §3, 11–17.

1. Образец заглушки — на ВСЮ сплющенную строку диска (`^…$`), место заглушки — значение до шести слов без запятой, точки с запятой и
   отрицания (`PLACEHOLDER_MAX_WORDS`, `VALUE_WORD` в ядре); шире — прежняя дорога («local edits» / «not found»). Поля: 0 BAD, мутант — 7.
2. Улика «не прячет» доведена до новой ветки: `s21` B9h1 (удалённый соавтор рядом со строкой слота, которая его поминает — «not found»),
   B9h4 (вариант с «, never» на месте заглушки — назван), B9h0 (новая строка с заглушкой, которой нет, — «not found»); B9h1 и B9h4 красны ровно
   на копии `dist` с первой формой образца, B9 — ровно на ядре `3057175`.
3. Гард 5y — `SWEEP` с `-u` · `--update` · `.` перед запятой и двоеточием · `git commit --all` и `-a` после сообщения; законно только отрицание
   вплотную перед командой («never `git add -A`»); проба — 14 приказов (все формы повторного суда) — 14, четыре законные строки — 0. Законные
   фразы о подметании в навыке в иной форме по-прежнему краснеют — в навыке подметание называется только формой «never `git add -A`»
   (`tools/lib/sweep-stage.mjs`, шапка).
4. `S9 UB5` на `dist` `3057175` снова называет `autoloop:75` первым (прогон 14).
5. `/release` шаг 6: перечень строк шаблона у поля, переписавшего шаг, — законный перечень слияния, не класс находки 1; справка пробы, отчёт,
   EXP-0211 и нота сборщика говорят это (нота: «keep your flow, take the by-name staging, and say so in the judge verdict»).
6. Формулировка — пути: «git add each path you mean to ship by name — new, changed, deleted, and both names of a move (git status --short lists
   them; never -A) — check the staged set with git diff --cached --stat» (навыки закрытия, значение по умолчанию, пример слота, `/release`).
7. Не UB5 — `bugs/139` (S2) с адресом починки: следующий шаг эпика UB вместе с `ideas/32` п. 14 и гардом на все слоты поставки.
