> «5. **Ложный `[TESTED]`** — маркер без реально проведённой проверки — это фрод; `/fable-judge` охотится на него как на любое ложное заявление о завершении.» — `TESTING_FRAMEWORK.md`

# Лёгкий судья — работа сессий 94–95 версии KAIF 2.10 (коммиты `540b31f` · `b9b0357`, база `f9125e5`)

> **Создан:** 2026-10-30 17:13 +03:00 (проба `date`), субагент-судья сессии 95 (Claude Opus 5.5) · **Бриф:** `JUDGE_S95_BRIEF.md` плюс поправка главного агента: суд идёт по коммитам, `build-framework` не запускается, переисполнение — на копиях коммита.
> **Чтение канона:** STATUS (шапка и п. 0), TESTING_FRAMEWORK (правила маркеров, отчёт прогона), REQUIREMENTS_FRAMEWORK (сценарная форма, правило 6), строки №140 · №144 · №153 · №154 `MASTER_PLAN.md`. **Тринадцать документов преамбулы целиком я НЕ прочёл**: это 1,37 МБ, из них 714 КБ — `EXPERIENCE.md`. Говорю об этом прямо, чтобы не было ложного «прочитал».
> **Стенд:** Windows 11, Node v24.15.0. Срез коммита — `git archive b9b0357 dist tools framework .claude package.json version.json` в скретчпад (`…/scratchpad/j95/exp`). Контур, хуки и пробы гонялись только оттуда. Контур — в `quietEnv({ KAIF_VOICE_TOOL: '' })`, строго по очереди. Ни окон, ни звука, ни зова не было. На исходники ничего не писалось.

## Таблица охот

| # | Охота | Вердикт | Коротко |
|---|---|---|---|
| 1 | Переисполнение | **VERIFIED WITH CAVEATS** | Всё, что разрешено, переисполнено и сошлось. Не запускались: сборка (запрещена поправкой) и полигон. Последняя строка `s14` устарела: «5 хуков». |
| 2 | Ослабленные тесты | **REFUTED** (PT1) · VERIFIED (`s14`) | Приёмка PT1 перестала проверять, что `old_string` с заполнителем остаётся нетронутым. Мутант, который заполняет `old_string`, проходит новую приёмку зелёным и красен на приёмке `f9125e5`. |
| 3 | Хук часов, перенос | **REFUTED** | Если Edit переносит заполнитель с обратной косой, хук молча стирает косую. Это реальная строка `plans/142:50` у истока, где хук подключён. При Write «как есть» происходит то же самое (это прежняя находка (c), а `plans/137` называет её закрытой). Перенос двумя правками или в новый файл всё ещё заполняется часами. Если в одной правке слово заполнителя перенесено и добавлено ещё раз, новое остаётся буквальным. |
| 4 | Контур | **REFUTED** (узко) · 7h VERIFIED | `--close` всё же отдаёт токен постороннему на порту, если тот принял соединение и молчит на `/whoami`. Дверь настоящей страницы 7h проверена диагностикой: обе половины держатся именно на `/whoami`. |
| 5 | Разрез №153 | **REFUTED** (правило 6) · остальное VERIFIED | Линтер сценариев самого проекта: находок было 13, стало 16. Критерий 31 — «no-command», критерии 28 и 30 — «no-concrete-value». Слово владельца записано дословно, #177 записан честно, сумма часов 13–19 сходится. |
| 6 | Стоячая ложь | **VERIFIED WITH CAVEATS** | Маркер `[TESTED]` хука часов за 2026-10-30 не называет отчёт (правило 3). Строки «полигон 28/28» из коммита в отчёте нет. Строка STATUS о полигоне — всё ещё сессии 85. |

## Охота 1 — переисполнение: VERIFIED WITH CAVEATS

```
$ node runq.mjs framework/tools/contour/review.mjs --selftest     (срез b9b0357, quietEnv, 17:09:39 → 17:10:04)
  v TK7e #165: «² ₂ ½ …» reach the Russian engine as number words …
contour selftest green: 172 checks (pre-flight red on the "options as paragraphs" fixture, three faces, records, showing)
[exit 0]        строк «  x » — 0

$ node tools/sandbox/probes/tk7z-tk9-contour-mutants.mjs           (срез, 17:10:04 → 17:11:46)
OK  J1: exit 1 · red 1 — TK7z #169: a REAL page answers /whoami with its own lock's id — another docume
OK  CL: exit 1 · red 1 — TK7z #169: --close against a stranger on the page's port sends no token, keeps
OK  MS: exit 1 · red 1 — TK9 #178: the real CLI — «<doc> --mark-shown chat» and «--mark-shown --transpo
OK  MF: exit 1 · red 2 — TK9 #178: --mark-shown takes the named file … | TK9 #178: the real CLI — …
✅ every mutant is red on exactly its named case

$ node hooks/clock-now.mjs --selftest            (копия b9b0357)  → 10 × ok, selftest: all ok, exit 0
$ node probes/pt1-clock-now.mjs hooks/clock-now.mjs  → ✅ … exit 0 (8 случаев)
$ node probes/pt1-clock-now.mjs hooks/clock-old.mjs  (хук f9125e5) → BAD (3b) … write 2026-10-30 17:06 +03:00 here, at 17:06 · ✖ 1 BAD
$ мутант «перенесённое слово не хранится» (fill без keep) --selftest → FAIL ×3 (два случая carried и «carried only: silence»), приёмка → BAD (3b)
$ node framework/hooks/subagent-preamble.mjs --selftest → 2 × ok, all ok, exit 0
$ node tools/sandbox/probes/pt2-subagent-preamble.mjs framework/hooks/subagent-preamble.mjs → (1)…(10) ok, pt2 acceptance: all ok, exit 0

$ node tools/sandbox/s14-refresh-hooks.mjs       (срез, вместе с .claude)
… ✅ s14 PT1 · PT2: PreToolUse фрагмента — группа Write|Edit|MultiEdit с clock-now и группа Agent|Task с subagent-preamble, иного нет
… ✅ s14 ось пар settings-fragment.json: … (7 пар)
✅ песочница refresh-hooks зелёная (деплой с модулем и без · 5 хуков по живому контракту · снятые хуки сняты с проводки)
exit 0 · строк ✅ — 150
```

Первый прогон `s14` упал (ENOENT `.claude/skills/resume/SKILL.md`). Виноват мой срез: в нём не было `.claude`. С ним прогон зелёный.

Оговорки:
- `node tools/build-framework.mjs` и проверку «дифф `dist/` пуст» я **не выполнял**: их запрещает поправка, рабочее дерево ушло вперёд (`dist/*` изменён главным агентом). Полный полигон тоже **не переисполнен**: он запрещён брифом.
- В итоговой строке `s14` по-прежнему стоит «5 хуков по живому контракту», хотя развёрнутых скриптов теперь шесть.
- Живую пробу хука часов в сессии истока (отчёт, прогон 4, 16:30) судья повторить не может. Это **не проверено**.

## Охота 2 — ослабленные тесты: PT1 REFUTED · `s14` VERIFIED

`s14`. Числа 6 → 7 пар и 2 → 3 группы `PreToolUse` сходятся с фрагментом. Утверждение о составе `PreToolUse` теперь судит весь список групп по порядку (`[['Write|Edit|MultiEdit', ['clock-now.mjs']], ['Agent|Task', ['subagent-preamble.mjs']]]`), то есть стало строже. Добавлены приёмка PT2 и самопроверка развёрнутого хука преамбулы. Ослабления нет.

PT1. Прежний случай (3) был `old_string: ph('NOW') + ' old'` и проверял `u3.old_string === e.old_string`. Значит, он стерёг контракт «`old_string` не трогается, даже если в нём стоит заполнитель». Новый (3) взял `old_string: 'old text'`, без заполнителя. Новый (3b) проверяет только `new_string`. В итоге ось потеряна. Скретчпад, `mkmut.mjs`: мутант дописывает в `rewrite` заполнение `old_string` часами без набора перенесённых слов.

```
== new probe mut-old              → ✅ … (зелёная)          == old probe (f9125e5) mut-old       → BAD (3) Edit: new_string filled, old_string and the other fields untouched
== selftest mut-old               → selftest: all ok
== new probe mut-old-plain        → ✅ … (зелёная)          == old probe (f9125e5) mut-old-plain → BAD (3) …
== selftest mut-old-plain         → FAIL carried only: silence   (ловит лишь косвенно, через «тишину»)
```

Вывод: переписанная приёмка проходит на хуке, который ломает каждую правку с заполнителем в `old_string` (такая правка больше не совпадёт с файлом). Что сделать: вернуть в (3b) `u3b.old_string === eb.old_string` или отдельный случай.

## Охота 3 — хук часов, формы переноса: REFUTED

Скретчпад `h3.mjs`. Хук из копии `b9b0357` запускается так же, как его запускает Claude Code: JSON подаётся в stdin. Ниже заполнитель записан как «[NOW]», а белые скобки опущены, чтобы этот файл не тронул подключённый хук.

```
(a) Edit carry NOW + add new NOW → exit 0 · (no output)                       — новый «Created: [NOW]» остался буквальным
(b1) Edit cut → exit 0 · (no output)
(b2) Edit paste → exit 0 · "## end\npara about 2026-10-30 17:06 +03:00"      — перенос двумя правками: заполнен
(c) MultiEdit move → exit 0 · ["A","B 2026-10-30"]                             — перенос внутри MultiEdit между правками: заполнен
(d) Write new file (copy of a doc about placeholders) → "write 2026-10-30 17:06 +03:00 where a moment goes"
(e) Write as-is, file holds bare + escaped → "stamp [NOW] · [NOW] — literal"  — у второго, экранированного, пропала обратная косая
(f) Edit carries backslash form → "[NOW] — literal!"                           — old_string «\[NOW] — literal», косая стёрта
(g) Write relative path, hook cwd = project → (no output)
(g2) Write relative path, hook cwd = elsewhere → "about 2026-10-30 17:06 +03:00!" — input.cwd хук не читает
(h) Edit replace_all → "stamp 17:06" · (i) old_string с заполнителем → old_string нетронут
```

- **(f) и (e) — та самая порча молча.** `carriedWords` пропускает экранированные вхождения (`if (!m[1])`), а `fill` любое экранированное отдаёт без косой. Поэтому правка, которая только переносит `\` + заполнитель, переписывает документ. Пример у истока: `git grep -F` по `b9b0357` находит `plans/142_epic136_PT_truth_at_the_input.md:50` («`\[NOW]` — буквально» в белых скобках). Хук у истока подключён (№154), так что любая правка этой строки превратит её в неверное правило «`[NOW]` — буквально». Прежний судья в находке (c) писал: «у седьмого (`\[NOW]`, строка 48) пропала обратная косая». `plans/137` TK7з называет охоту 4 закрытой, но эта половина не починена, и не названа как остаток.
- (b2), (c), (d): перенос за пределы одного `old_string` (вырезать и вставить, MultiEdit между правками, копия в новый файл) по-прежнему ставит время. Это тот же класс, что находка (a) прежнего судьи. Рекомендацию 4 прежнего судьи («назвать перенос в README модуля и строке канона») не исполнили: абзац хука часов в `framework/hooks/README.md` (строки 131–139 у `b9b0357`) не говорит ни о правиле переноса, ни о том, что оно действует только в пределах одной правки и судит по слову, а не по вхождению.
- (a): правило работает по слову. Новый заполнитель того же слова рядом с перенесённым не заполняется, и в документе остаётся буквальный заполнитель вместо момента.
- (g2): `readOld` читает `file_path` относительно cwd процесса хука, а `input.cwd` не учитывает. Claude Code передаёт абсолютный путь, поэтому вред низкий.

## Охота 4 — контур: REFUTED (узко) · случай 7h VERIFIED

Скретчпад `h4.mjs`: копия контура `b9b0357`, у которой экспортирован один `lockPath`. Запуск в quietEnv.

```
backslash       {"doc":"interviews/q.md"}
absolute inside {"doc":"interviews/q.md"}
directory       {"refusal":"\"interviews\" is not an existing file of this project — nothing recorded …"}
dir trailing /  {"refusal": …}
case variant    {"doc":"Interviews/Q.md"}
dot-dot inside  {"doc":"interviews/q.md"}
value "chat" + positional {"refusal":"\"chat\" is not an existing file …"}
symlink->file   {"refusal":"\"interviews/link.md\" is not an existing file …"}
junction->outside dir {"doc":"outlink/secret.md"}
close tokenless lock vs 200-stranger → exit 0 · lock kept false · stranger saw ["POST /close?t="] · closed interviews/a.md … — its own server ended it (exit 2 for the waiting agent) …
close vs silent stranger → exit 4 · lock kept true · token reached stranger true · stranger got ["GET /whoami HTTP/1.0","POST /close?t=SECRET-SILENT HTTP/1.1"]
[exit 0]
```

- **REFUTED: «постороннему токен не шлёт».** `pageListens` при молчании дольше `LIVENESS_TIMEOUT_MS` (1500 мс) возвращает `true` («still live»). Поэтому `--close` считает молчащего постороннего своей страницей и отправляет ему `POST /close?t=SECRET-SILENT`. Этот пробел комментарий TK7e называет для двери, а для `--close` и в заявлении TK7z он не назван. Вред низкий: токен закрывает только ту страницу, которой на порту нет. Но заявление коммита в такой форме ложно.
- Замок без `closeToken` (до 2.7): `isPage = !lock.closeToken || …` даёт `true`. Посторонний, который на всё отвечает 200, «закрывает» страницу: выход 0, замок удалён, строка «its own server ended it» ложна. Токен не утекает, но здесь осталась прежняя оговорка судьи (подмена, удаление замка) для старых замков. CAVEAT.
- `markShownTarget`: обратная косая, абсолютный путь внутри проекта и `..` внутри проекта приводятся к нормальному виду. Каталог получает отказ. Симлинк на файл проекта получает отказ (`lstat`): это строже нужного, вреда нет. Junction на каталог ВНЕ проекта принимается (`outlink/secret.md`), потому что `lstat` проверяет только последнее звено. Ключ другого регистра (`Interviews/Q.md`) записывается отдельным ключом. Обе последние находки мелкие, вред — лишний ключ в `shown.json`.
- **Случай 7h: «other-open» действительно пришёл от `/whoami` настоящей страницы** (скретчпад `h4b.mjs`: диагностическая строка после 7h, копия контура, quietEnv):

```
mode none · exit 0
DIAG 7h urlR=http://127.0.0.1:64197/ eR2={"outcome":"other-open","url":"http://127.0.0.1:64197/","exitCode":3} eR3={"outcome":"already-open","url":"http://127.0.0.1:64197/",…}
  slogR2=["Another page is open: http://127.0.0.1:64197/ (interviews/interview_real.md, pid 10660) — …"]
mode J1 · exit 1
DIAG 7h … eR2={"outcome":"page closed without an answer","exitCode":2} eR3={"outcome":"page closed without an answer","exitCode":2}
  slogR2=["Page is up: http://127.0.0.1:53610/ (Interview #008)", …]
  x TK7z #169: a REAL page answers /whoami with its own lock's id — …
```

Отказ указывает на URL страницы REAL. Под J1 краснеют обе половины, каждая сама по себе. До 7h замок `interview_other` уже снят (`rmSync(OLK)` в 7e). Оговорка: утверждение 7h не привязывает «other-open» к URL REAL (случай 7 привязывает). Ложный зелёный стал бы возможен, только если перед 7h появится чужой живой замок.

## Охота 5 — разрез №153: REFUTED (правило 6) · остальное VERIFIED

```
$ node exp/framework/tools/kaif-scenario-lint.mjs check p136-before.md   (plans/136 у 540b31f~1)
✖ scenario-lint: 13 finding(s) in 20 scenario(s) …
$ node exp/framework/tools/kaif-scenario-lint.mjs check p136.md          (plans/136 у 540b31f)
✖ p136.md:144 — no-concrete-value …   (критерий 30)
✖ p136.md:186 — no-concrete-value …   (критерий 28)
✖ p136.md:192 — no-command: the Check line has no runnable command or query with its expected output   (критерий 31)
✖ scenario-lint: 16 finding(s) in 24 scenario(s) — a criterion that is not in form is not a check
```

- В строках «Проверка» критериев 28–31 перечислены виды проверок («`--selftest` хука и мутант…; свод `s14`; живая сессия», «Форма механизма — нулёвкой MM0», «Свод на фикстуре…»). Ни команды, ни ожидаемого вывода в них нет. Это противоречит `REQUIREMENTS_FRAMEWORK.md` правилу 6: «“Проверка” — исполнимая команда или запрос с ожидаемым выходом», и строке «пустая “Проверка” у агента — дефект». Строку к критерию 20 (№153) это касается тоже. Смягчающее обстоятельство: хуков 28 и 29 ещё нет, их файлы пока не назвать. Но тогда «Проверка» должна сказать, что она отложена до нулёвки, и назвать будущую команду.
- Слово владельца: `MASTER_PLAN.md` №153 приводит «твой план ок» дословно, как ответ на `researches/42` §4. В таблице §4 для #175 · #176 прямо написано «стоп держится». Значит, критерий 28 (отказ остановки) показан владельцу, слово его покрывает. №144 по записи касается хуков, которые останавливают **на слове владельца**, а не любой остановки, так что противоречия нет. Отмечу только: тот же §4 ставит «вопрос владельцу (хуки остановки сняты №144)» к #182, но не к #175. Это неровность изложения, а не превышение слова.
- #177 записан честно. В §4 он стоял условно («если владелец пересмотрит “не про каиф” (#110)», где #110 — тикет, а §3 называет слово №140). В `plans/136` «Решения владельца» п. 8 написано «не взят: в предложении стоял условно, против слова №140». Сумма строк §4 к 2.10: минимум 1+0,5+0+4+3+2+1+0,5+1 = 13, максимум 1,5+1+0+6+4+3+1+1+1,5 = 19. Сходится с «≈ 13–19 ч».

## Охота 6 — шире наблюдения и стоячая ложь: VERIFIED WITH CAVEATS

- Маркер `[TESTED]` в `framework/hooks/clock-now.mjs`: прогоны названы (PT3 — с адресом отчёта; 2026-10-30 16:30 — живая сессия; самопроверка 10/10; PT1 8/8; мутант на трёх случаях). Я переисполнил 10/10, 8/8 и мутант на трёх случаях: всё сошлось (охота 1). Но половина за 2026-10-30 **не несёт адреса отчёта** `testcases/reports/2026-10-30_tk7z-tk9-contour-clock.md`, а `TESTING_FRAMEWORK.md` правило 3 этого требует. Есть и вторая проблема: маркер утверждает «a carried placeholder stayed literal», а охота 3 (f)/(e) показывает, что перенос с обратной косой не сохраняется. Заявление шире наблюдения.
- Отчёт сессии 95: строки «полигон 28/28» из сообщения коммита `b9b0357` в нём **нет**. Прогон 10 — «27/28, красный `s22`». Прогон 11 — только `s22`, самопроверка и мутанты. Полного зелёного полигона в отчёте нет, логи — во временном скретчпаде. Сам полигон я не переисполнял, поэтому 28/28 остаётся заявлением без следа в истоке.
- STATUS (дерево совпадает с `b9b0357`, файл не изменён): п. 0 говорит «Дальше: полигон → локальные коммиты → судья по брифу → пуш», а коммиты уже есть. Строка 30 «полигон … 28 сводов, зелёный (≈ 2026-10-16 …, сессия 85)» прогона сессии 95 не знает. «закрыто 6 из 31» с разрезом сходится.
- `plans/137` TK7з: «(2) хук часов не трогает заполнитель, который правка лишь переносит». Это шире наблюдения: см. охоту 3.

## Что НЕ проверено

Сборка и чистота `dist/` (запрещено поправкой). Полный полигон, `verify-contour`, `review.mjs --call` (запрещены). Живые сессии Claude Code PT3 и прогона 4 (судья их повторить не может). Остальные файлы коммита (`s22`, `tk1-*`, `wh5-*`, канон `framework/AGENT_GUIDE.md`, шаблон брифа) по существу не судились, только по охотам выше.

## Улики

Скретчпад судьи: `D:\Temp\claude\d--work-ai-sandbox-KAIF\b2ee31ce-8ab2-4f2f-a6a1-ea46f2958dde\scratchpad\j95\` — `h3.mjs`, `h4.mjs`, `h4b.mjs`, `mkmut.mjs`, `runq.mjs`, `s14b.log`, `selftest.log`, `mut.log`, срез `exp/`. Всё временное.
