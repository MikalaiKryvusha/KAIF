# Лёгкий судья — шаг HC3 и преполёт 1e (коммит `5213790`, не отправлен), сессия 88

**Вердикт: REFUTED — узко, по двум пунктам (2б и 6б); механика (гард 5w, преполёт 1e, пробы, числа) — VERIFIED WITH CAVEATS.**

Судил `5213790` (`git log --oneline -1` → `5213790 fix(версия KAIF 2.10, эпик HC, шаг HC3 — …)`; `origin/main` = `2bc9465`, то есть не
отправлен). Тишину соблюдал: в истоке только чтение, запускал три разрешённые пробы. Собственные пробы судьи лежат в
`…\scratchpad\recon\jprobe\` (`j1e.mjs` работает на клоне во временном каталоге и удаляет его; остальные — чистое чтение / чистый regex).
Дерево после суда: `git status --short` → ` M STATUS.md` (это правит главная сессия) и прежние `?? assets/*`.

## Таблица заявлений

| # | Заявление | Что увидел | Вердикт |
|---|---|---|---|
| 1 | HC3 ✅; «EXP-0170 mechanized» (доказано `--selftest` + проба в клоне) | Три пробы переисполнены и зелёные. Функционального прогона по агенту поля нет — отчёт сам ставит «partial», а план пишет ✅ | CAVEAT |
| 2 | Близнецы: указателей, которых не видят 5s и 5w, нет | Точных близнецов нет. Две пограничные строки (в обоих слоях). 5w — три фиксированные фразы: 8 из 8 вариаций одним словом проходят молча | CAVEAT |
| 2б | «указатели идут за строками, которые 2.8 перенесла» | Правило харнесса в BUG_FIXING теперь шлёт в «Tools of this project», а руководство, скелет и справочник кладут команды харнесса в «Stands, environments and devices» | **REFUTED** |
| 3 | 1e: ложного красного нет; стоит до первого побочного эффекта | Стоит до бампа (доказано кодом и наблюдением). Ложный красный — только на бинарнике без CR в HEAD (сконструирован; в дереве таких 0 из 39). Есть ложные зелёные: каталог в `--only`, кириллическое имя в режиме подметания, путь с `\` | CAVEAT |
| 4 | Нота 2.10 не шире поведения; обход F2b назван | Нота с поведением сходится; обход назван (HC3б), детекцию F2b не ослабил. Нота наследует пункт 2б; `/resume` указывает на гид частично | CAVEAT |
| 5 | Поправки к сообщению `2bc9465` | Всё уехало тем коммитом, «2 из 20» верно. Но про bugs/109 `2bc9465` своё девятое вхождение НАЗВАЛО | CAVEAT (мелкое) |
| 6 | Числа: STATUS п. 0 · plans/136 · MASTER_PLAN — «закрыто 2 из 20» | Совпадают (критерии 3 и 4) | VERIFIED |
| 6б | Стоячая ложь в статусах планов | `plans/140`: «⏳ НЕ НАЧАТ … старт — нулёвка HC0» при HC3 ✅ и пустом HC0 | **REFUTED** |

---

## Охота 1 — заявление шире наблюдения — CAVEAT

Переисполнено:

```
$ node tools/sandbox/probes/hc3-moved-pointers-red.mjs        (9,4 с, EXIT=0)
OK  guard 5w — control copy: 0 line(s) «5w:»
OK  guard 5w — the v2.9 texts: 4 line(s) «5w:» (expected 4, one per file)
    - 5w: framework/BUG_FIXING_FRAMEWORK.md:130 … · skills/autoloop/SKILL.md:49 … · skills/code-revision/SKILL.md:54 … · skills/resume/SKILL.md:101 …
✅ guard 5w is red on the v2.9 texts exactly where named; the control copy is silent

$ node tools/sandbox/probes/commit-1e-eol-run.mjs             (15,9 с, EXIT=0)
OK  CRLF over LF: exit 1, the line names PHILOSOPHY.md: true
OK  CRLF over LF: HEAD and version.json unchanged
OK  control (LF): preflight 1e silent (exit 1)
✅ preflight 1e stops a CRLF-over-LF file before any side effect and is silent on LF

$ node tools/commit.mjs --selftest                            (EXIT=0)
✅ commit --selftest: гейт неожиданного файла краснеет …
# мутант судьи (копия в scratchpad, eolFlipped → false):
✖ selftest commit-gate: 1e: рабочая копия с CRLF при LF в HEAD — стоп (EXP-0170)
❌ commit --selftest: 1 провалов (bugs/79)                    (EXIT=1)
```

Сборку и полигон не гонял (запрет брифа). Сверил их следы в scratchpad:
- `build4.log` — `✅ check-framework OK — 59 embedded files`;
- `polygon5.log` (03:24:31) — `✅ sandbox suite: all 28 suites green`;
- `dist-a.sha` = `dist-b.sha` = `sha256sum dist/*` закоммиченного дерева — совпали побайтно;
- CR-скан 29 файлов коммита (`jcr.mjs`): `29 file(s) of HEAD scanned · with any CR: 0`.

**Что доказано.** Гард 5w красный ровно на четырёх текстах v2.9 и молчит на контроле. Предикат 1e не вакуумный: мутант краснеет. В клоне
CRLF поверх LF при `--only` даёт отказ, HEAD и `version.json` целы.

**Чего НЕТ.**
1. **Функционального прогона HC3 нет.** Отчёт `testcases/reports/2026-10-18_hc3-moved-pointers.md` §4: «Функциональный прогон: NONE»,
   §7: «partial — гигиена пройдена; функционального прогона по агенту поля нет». В `plans/140` и STATUS при этом стоит голое «HC3 ✅», без
   этой оговорки. Приёмка самого шага («красный ровно по 4 названным, зелёный после») выполнена, и критерий 16 закрытым не назван. Поэтому
   это оговорка, а не опровержение.
2. **Контроль пробы 1e не доказывает, что прогон дошёл до 1e.** Проба проверяет только отсутствие строки «стали CRLF»; прогон, павший
   раньше 1e, тоже дал бы OK. Мой прогон того же контроля (`j1e.mjs`, случай A) показал, что прогон всё-таки дошёл:
   `— коммит несёт 2 файл(ов) (--only)` → `коммит остановлен преполётом 1d: …` (в клоне нет `.kaif/private-names.json`, срабатывает
   fail-closed), `exit=1`, build остался 773. То есть «тишина на LF» правдива, но держится на моём наблюдении, а не на утверждении пробы.
3. **«Строка Repro стала гейтом коммита» (EXP-0170) шире гейта.** Repro идёт по `git status --short`, то есть видит и новые `??`. Гейт
   новые файлы пропускает по построению — selftest: `'1e: новый файл (HEAD не знает) — молчит'`. Ложные зелёные — в охоте 3.
4. **Режим подметания (без `--only`) пробой не покрыт** — она гоняет только `--only`. Я покрыл его сам: случаи B и C охоты 3 зелёные.

## Охота 2 — близнецы — CAVEAT · 2б — **REFUTED**

`grep -rn "AGENT_GUIDE.md" framework/ --include=*.md` без `templates/languages/` дал 202 строки. Окно ±1 строки со словами вынесенных фактов
и без `HOUSE_RULES` в окне (`jtwins.mjs`) дал 45 строк. Разобрал по одной. Точных указателей на перенесённые строки не осталось. Пограничных
строк две — обе вне 5s и 5w, обе в двух слоях:

- `framework/skills/resume/SKILL.md:96` — «Follow `AGENT_GUIDE.md` (code style, the bug framework, the test harness).» (RU:
  `.claude/skills/resume/SKILL.md:97` «тестовый стенд»). Это за четыре строки до строки 101, которую HC3 починил. Справочник
  `framework/KAIF_REFERENCE.md` § Test harness: «The harness COMMANDS moved to the house-rules file ("Stands, environments and devices")
  … The principle … stays in the guide». Если читать как «принцип харнесса», строка законна; если как «команды харнесса», это близнец.
- `framework/skills/refresh-context/SKILL.md:18` — «`AGENT_GUIDE.md` — the rules (git workflow, style, tools, build).» (RU: `:18`
  «инструменты»). Список перечитывания называет гид источником «tools», а от раздела Tools в гиде осталась одна строка-указатель;
  `HOUSE_RULES.md` в списке нет (он есть только в шаге 3, досье).

Почему остались: 5w — это ровно три фразы четырёх строк v2.9. Разведка (`update-tools.md`, «Форма починки») рекомендовала форму класса:
«`AGENT_GUIDE.md` в окне ±1 строки со словами вынесенных фактов … если рядом нет `HOUSE_RULES.md`». Сделана форма инцидента. Регулярки
гардов (скопированы дословно) против вариаций одним словом (`j5w-forms.mjs`):

```
RED    5s=false 5w=true  v2.9 BUG_FIXING (named)      | quiet  … record it in              | quiet … tools listed in
RED    5s=false 5w=true  v2.9 code-revision (named)   | quiet  … document the command in   | quiet … stands — see (word not in list)
RED    5s=false 5w=true  v2.9 autoloop (named)        | quiet  … add its row to the guide  | quiet … hyphen instead of em dash
                                                      | quiet  … tool table of (singular)  | quiet … see without backticks
quiet  live: refresh-context:18   ·   quiet  live: resume:96
```

Сообщение коммита честно говорит «в трёх формах фразы», ложного заявления о классе там нет. Но это та же слабость, которую разведка
поставила в вину 5s («страж ищет по одной форме фразы»), только теперь форм три.

**2б — REFUTED: новая починка указывает не в тот раздел.** `framework/BUG_FIXING_FRAMEWORK.md:129–131`: «**Grow the harness over time.** … add
a command/flag/script … Then add it, and write its row into `HOUSE_RULES.md` → "Tools of this project". The harness is a living tool». Канон
поставки кладёт команды харнесса в другой раздел:
- `framework/AGENT_GUIDE.md:529–531` — «Grow this tooling over time; each command, stand and device gets its row in the house-rules file —
  `HOUSE_RULES.md` → "Stands, environments and devices"»;
- `framework/templates/_house-rules-template.md:43` (§3) — «The commands of the test harness live here, one row each»;
- справочник: «The harness COMMANDS moved to … "Stands, environments and devices" in KAIF 2.8».

Значит, одно и то же действие («нарасти харнесс, добавь команду») получило два дома. Заявление в заголовке («указатели идут за строками,
которые 2.8 перенесла») для этой строки опровергается справочником: 2.8 перенесла команды харнесса в Stands, а не в Tools. Нота 2.10
повторяет это полю. RU-зеркало истока (`BUG_FIXING_FRAMEWORK.md` → «§1 «Инструменты истока»») верно: у истока раздела Stands нет, и пробы
живут в §1.
**Наименьшая правка:** `framework/BUG_FIXING_FRAMEWORK.md:130–131` → «write its row into `HOUSE_RULES.md` → "Stands, environments and
devices" (an automation tool of the project — "Tools of this project")»; ноту 2.10 привести к тому же. 5w не задет. Пересобрать.

## Охота 3 — преполёт 1e — CAVEAT

**Место — VERIFIED.** Порядок в `tools/commit.mjs`: revert-guard (только чтение) → 1b (195–214) → **1e (216–233)** → 0 (235–263) → бамп
`version.json` (265–271). Наблюдение: случай B — отказ на 1e, `build in version.json=773` (не тронут); проба истока — «HEAD and
version.json unchanged».

**Ложный красный.** Предикат атрибуты `.gitattributes` не читает. Случаи судьи на клоне (`j1e.mjs`):

```
[B sweep flip+deleted]  exit=1 · 1e-line=true · names GOAL.md=false     ← удалённый файл не назван: ложного красного нет
[C sweep deleted only]  exit=1 · 1e-line=false                          ← только удаление: 1e молчит (стоп дальше, на 1d)
[F binary --only]       exit=1 · 1e-line=true   (x.bin: HEAD 00 01 02 03 00 04 → 00 0D 0A 01 02 03 00 04)   ← ЛОЖНЫЙ КРАСНЫЙ на бинарнике
[H index after git add] PHILOSOPHY.md has CR in index=false · dist/KAIF-FULL.md has CR in index=true
```

Бинарники в дереве (`jbin.mjs`): `tracked: 1331 · binary (NUL): 39 · binary without any CR byte: 0`. У каждого отслеживаемого бинарника в
HEAD уже есть байт 0x0D, поэтому случай F сегодня недостижим: только новый крошечный бинарник без 0x0D, а потом его правка. Риск ничтожный,
но «ложного красного нет» доказано не формой, а составом дерева.

Случай H уточняет обоснование. Для текстовых файлов `eol=lf` сам нормализует CRLF при `git add`: в истории CR не было бы и без 1e. 1e
стережёт рабочее дерево, а через сборку — `dist/**` (`-text`: туда CR доходит). Сама EXP-0170 это и говорит («в историю ушёл LF»). Гейт
полезен, но его ценность — рабочее дерево и `dist/`, а не история.

**Ложные зелёные** — файл с CRLF проходит 1e:

```
[D --only directory]          --only framework/skills/autoloop          → 1e-line=false  (readFileSync(каталог) → EISDIR → continue)
[E prep] git diff --name-only HEAD → "\"\\320\\267\\320\\260…\\260.md\""  (core.quotePath: кириллица в кавычках и октетах)
[E1 sweep non-ASCII name]     заметка.md, без --only                    → 1e-line=false  (путь не читается → continue)
[E2 --only non-ASCII name]    --only заметка.md                         → 1e-line=true   (контроль: путь как дан — пойман)
[G --only backslash path]     --only framework\skills\autoloop\SKILL.md → 1e-line=false  (git show HEAD:a\b → «нет в HEAD»)
```

Плюс новые файлы (`--with-new`) — это видно по коду и selftest. Наименьшие правки, по желанию:
- `git diff --name-only -z HEAD`;
- каталог в `--only` раскрыть или отказать;
- `p.replace(/\\/g,'/')` для `git show`;
- в EXP-0170 честно написать, что гейт уже Repro.

## Охота 4 — нота 2.10 о HC3 — CAVEAT

- Нота (`tools/build-framework.mjs:300`) с поведением сходится. «the harness rule … now writes a new tool's row into `HOUSE_RULES.md` →
  "Tools of this project"» — так и написано. «`/code-revision`, `/autoloop` and `/resume` point at the house-rules tables» — строки 54/49/101
  так и говорят. «the build refuses the old forms» — `tools/build-framework.mjs:798` зовёт `check-framework.mjs`, и 5w там стоит.
- Обход **назван**: `plans/140` HC3б — «Сессия 88 сняла имя файла из ноты (обход); честная форма — судить секцию пункта
  `merge-diverged`, а не весь текст». Улики:
  - `polygon4.log:496` `❌ F2b (bugs/32): wholesale-файл без дельты шаблона не числится в merge-diverged`;
  - `s08.log:10` `✅ F2b …` после снятия имени;
  - сам случай — `tools/sandbox/s08-l2-faces.mjs:170` `ok(!taskA.includes('BUG_FIXING_FRAMEWORK.md'), …)`.
- **Дефекта обход не прячет.** Детекция F2b не ослаблена: настоящий пункт merge-diverged несёт имя файла и покрасит случай как прежде.
  Цена обхода — скрытое ограничение («ноты не называют этот файл»), до HC3б.
- Оговорки:
  - (а) нота несёт пункт 2б («Tools» вместо «Stands») полю;
  - (б) «`/resume` points at the house-rules tables, not the guide» верно лишь частично: `resume:96` всё ещё «Follow `AGENT_GUIDE.md`
    (… the test harness)»;
  - (в) «MIGRATION — agent work: none, unless your own texts repeat one of these pointers» не говорит о строках, которые агент поля мог
    вписать в гид по старому правилу v2.8–2.9 («document it in `AGENT_GUIDE.md`»). Свидетельств из поля нет (`field-a/b.md` молчат) —
    риск теоретический.

## Охота 5 — поправки к сообщению `2bc9465` — CAVEAT (мелкое)

`git show --stat 2bc9465`: все пять названных вещей уехали тем коммитом:
- `researches/39_agent_memory_hook_recon.md | 78 +++`;
- `PROJECT_HISTORY.md | 41 +++`, `STATUS.md | 43 +--`, `MASTER_PLAN.md | 14 +--`;
- `JUDGE_TK_BRIEF.md | 45 +++`;
- `owner-talk.md | 8 +-` — пометки `<!-- questions-guard:allow … -->` / `verdict-ok`;
- `bugs/109_… | 6 ++` — «ДЕВЯТОЕ вхождение».

Проверки:
- **Стрижка дословная** (`jbonsai.mjs`):
  - `STATUS.md: removed 30 … carried verbatim 27 · not carried 3`;
  - `MASTER_PLAN.md: removed 11 … carried verbatim 7 · not carried 4`.
  Все семь «не перенесённых» — строки, переписанные на месте: их наследники есть в `2bc9465:STATUS.md:46,51,195` и
  `2bc9465:MASTER_PLAN.md:119,298,300`. VERIFIED.
- «15 источников»: `grep -c "](http"` → 15 строк, уникальных URL — 14. Мелочь.
- «закрыто 1 из 20» → «верно 2 из 20» — правда: `2bc9465:plans/136…:8` уже «закрыто 2 из 20 (критерии 3 ✅ … и 4 ✅ …)»;
  `2bc9465:MASTER_PLAN.md:295` «закрыто 0 из 19» исправлено в HEAD.
- **Неточность самой поправки:** «оно их не назвало» неверно для bugs/109. Сообщение `2bc9465` прямо говорит: «s22 красный нативным крахом
  `node` 3221226505 (bugs/109, девятое вхождение)». Не названа была только правка документа бага.

## Охота 6 — числа — VERIFIED · 6б — **REFUTED**

- `HEAD:plans/136…:8` — «закрыто 2 из 20 (критерии 3 ✅ ≈ 02:50 и 4 ✅ ≈ 02:57; 1 · 2 · 20 — 🔧 …)».
- `HEAD:MASTER_PLAN.md:295` — «закрыто 2 из 20 (критерии 3 · 4; исправлено 2026-10-18 03:20 +03:00: стояло «0 из 19»)».
- `HEAD:STATUS.md` п. 0 — «TK1 ✅ (крит. 3) · TK4 ✅ (крит. 4) · TK2/TK2б/TK3 🔧 (крит. 1 · 2 · 20 …) · … · HC3 ✅ (#119, гард 5w)».
  Числа «2 из 20» в п. 0 нет, но состав совпадает. HC3 закрытием критерия 16 нигде не назван (там ещё #116 · #117 · `bugs/130`) — верно.

**6б — REFUTED: стоячая ложь в статусе плана.** `HEAD:plans/140_epic136_HC_honest_checks.md:6`: «**Статус:** ⏳ НЕ НАЧАТ — четвёртый
эпик версии KAIF 2.10; старт — нулёвка HC0.» А в том же файле `:30` стоит «- [x] **HC3** — ✅ ≈ 2026-10-18 03:10», `:35` добавлен HC3б,
`:24` «- [ ] **HC0 — нулёвка.**». Тот же класс суд TK поймал в `plans/137`, и этот же коммит его там исправил («plans/137 — статус «в
работе»»). Здесь он повторён. Попутно: строка HC3 сохранила старое намерение «Гард 5s видит и форму «задокументируй…»», хотя сделан новый
гард 5w.
**Наименьшая правка:** `plans/140:6` → «🔄 В РАБОТЕ с 2026-10-18 03:10 +03:00 (сессия 88): HC3 ✅ (вне порядка, до HC0), HC3б открыт;
HC0–HC2, HC4–HC5 — не начаты»; в строке HC3 «Гард 5s видит» заменить на «гард 5w видит».

## Мелкий мусор (не вердиктный)

- `tools/commit.mjs:211` — две инструкции `console.error(…);    console.error(…)` склеены в одну строку. Это необъявленная правка кода
  гейта 1b (в диффе: `-` две строки, `+` одна). Поведение то же, но это та самая «правка, которую не намеревался» из правила `git diff
  --stat`.
- Совет 1e «верни LF (`node -e` скриптом-файлом: …)» называет `node -e` с обратными слешами — ловушку EXP-0121. Лучше написать «скриптом-
  файлом», без `node -e`.
- Отчёт HC3, «Следы»: назван `polygon4.log` (красный, остановленный прогон), а `polygon5.log` (зелёный прогон строки 5) не назван. Строка 3
  говорит об одном красном s08, а `polygon4.log:1501` — «7 of 28 suites FAILED». Шесть остальных — следствие остановки, и с «остановлен
  после красного» это сходится, но вслух не сказано.

## Рекомендуемое действие

До отправки — две строки текста (2б и 6б) и пересборка. Оговорки 1–5 — в HC3б или в `ideas/33`:
- 5w перевести в форму класса (окно ±1 + слово вынесенных фактов);
- `resume:96` и `refresh-context:18` в обоих слоях — назвать рядом `HOUSE_RULES.md`;
- 1e — `-z`, каталоги, обратные слеши, новые файлы (или сузить заявление в EXP-0170);
- поправить склейку на `commit.mjs:211`.
