# Bug 92 — поставка языков: пакет можно выключить словом, выпотрошить, обкорнать и потерять целиком, а гейты остаются зелёными

**Status:** 🔬 ПРЕДПОЛОЖИТЕЛЬНЫЙ — не верифицирован, причина не установлена · скоуп **2.3**
**Version/build:** build 279 · **When/context:** круги ревью R1/R2 фазы R, 2026-08-09
**Fix accepted when (observable):** НЕ ОПРЕДЕЛЁН — критерий приёмки задаёт исполнитель после
установления причины (решение №70: разбор и лечение за Fable, не за автором документа)

Пять вхождений об одном контуре — девять языковых пакетов в `framework/templates/languages/` и три
машины вокруг них: приём `--lang` в установщике, ось §5f `check-framework` и ось языковых пакетов
`counters-guard`. Круги наблюдали, что каждая из этих машин рапортует о покрытии, которого в её коде
не видно: пакет выключается неверным кодом языка, его файл подменяется заглушкой, файл пропадает из
одного пакета из девяти, пакет исчезает целиком — и ни один прогон не краснеет. Причина ни по одному
вхождению не устанавливалась; ниже — только адрес, заявление и наблюдение.

## 1. `--lang <code>` нигде не определён; язык, названный словом, молча выключает языковой пакет и печатает ложное «no bundled template for this language yet»

**Адрес:** `KAIF.md:54` (`node KAIF-LOADER.mjs --lang <code>`).
Также: `KAIF.md:82` · `framework/installer/KAIF-CORE.mjs:53` · `:352` · `:574`.
Поставочная копия `dist/KAIF-CORE.mjs` несёт те же строки под теми же номерами (53, 352, 574).

**Заявлено.** §2 шаг 3 велит подставить параметры владельца в `--lang <code>`; что такое `<code>`,
`KAIF.md` не говорит ни разу (греп по `639|ISO` по файлу пуст). При этом §1 (`KAIF.md:24`) предлагает
владельцу сказать словами: *«Working language: Russian.»*

**Наблюдалось.** `let LANG = (val('--lang') || 'en').toLowerCase();` — валидации нет. Не найдя
каталог пакета, машинерия не предупреждает (`if (!hasPack) return;` — «the task's `language` item
owns the honesty»), разворачивает всё по-английски, пишет в маркер `"language": "russian"` и печатает
задание с текстом об отсутствующем шаблоне.

**Улика.** Два прогона из одной копии `dist`:
`--lang ru` → «8 owner docs templated», пункта `language` в задании нет.
`--lang Russian` → «lang russian», в маркере `"russian"`, в задании: «Translate … no bundled
template for this language yet» — при живом пакете `ru` из девяти файлов.

**Кого касается.** Главный сценарий проекта: неанглоязычный владелец получает полностью английское
развёртывание без предупреждения плюс указание руками перевести уже переведённые документы.
Бессмысленный код языка остаётся записанным в маркер.

**Замечено.** Круг R2, 2026-08-09.

**Состояние на 2026-08-09.** Все пять адресов на месте, текст строк совпадает дословно; греп по
`639|ISO` в `KAIF.md` по-прежнему пуст; никакого списка допустимых кодов рядом с `LANG` в
`KAIF-CORE.mjs` не найдено. Шесть закрытых сегодня блокеров этих строк не касались (`f65107f` правил
`KAIF-CORE.mjs`, но в другом месте — требование полевого отчёта).

## 2. §5f выводит `skill-triggers.json` из-под доктрины пар: EN-описание навыка переписывается целиком, алиасы всех девяти пакетов остаются протухшими

**Адрес:** `tools/check-framework.mjs:456` —
`if (r === 'skill-triggers.json') continue;   // машинерия алиасов, не локализация шаблона`.
Также: `tools/counters-guard.mjs:386-405` (`checkLanguagePacks`) · `framework/installer/KAIF-CORE.mjs:357`.

**Заявлено.** Шапка §5f (`tools/check-framework.mjs:430`) объявляет её «реестром пар
истина↔зеркало, применённым к языковым пакетам». Установщик говорит владельцу: «all N skill bodies
(their trigger aliases ARE localized)». `counters-guard` печатает в итоговой строке «ключи 9 языковых
пакетов».

**Наблюдалось.** §5f вычёркивает файл по имени до всякой сверки. `checkLanguagePacks` берёт из файла
только `Object.keys(...)` и через `rosterDiff` сверяет НАБОР ИМЁН навыков. ЗНАЧЕНИЯ — сами
локализованные триггерные фразы — не пинуются и не сверяются ни с чем. При этом инструменты
ссылаются друг на друга как на покрывающих этот файл (комментарий в `counters-guard.mjs:375`:
«…значит по именам их не сверял никто»).

**Улика.** На копии переписано `description` навыка `what-next` со сменой всех триггерных фраз,
алиасы `ru` оставлены прежними → `check-framework` и `counters-guard` оба `exit 0`.

**Кого касается.** Владелец-неанглофон говорит «что дальше», попадает в навык с уже другим
поведением, а новые триггеры ему недоступны. Ошибка тихая и множится на девять языков.

**Замечено.** Круг R2, 2026-08-09.

**Состояние на 2026-08-09.** Все три адреса на месте дословно; строка 456 не изменилась,
`checkLanguagePacks` по-прежнему читает только `Object.keys`.

## 3. Пакетная асимметрия невидима: `check-framework` судит каждый файл в одиночку и ни разу не сравнивает СОСТАВЫ девяти пакетов между собой

**Адрес:** `tools/check-framework.mjs:469-479` (цикл по `destLangs`, строки текста ошибки 474 и 476).

**Заявлено.** `inLangs.length` в тексте ошибки («sync its N pack file(s)», «re-sync its localization
in N pack(s) [<список>]») читается как учёт того, сколько пакетов несут файл. `README.md:991`
заявляет однородность: «`templates/languages/` 9 языковых пакетов».

**Наблюдалось.** `inLangs` используется ТОЛЬКО как число и список внутри текста ошибки; `dest`
попадает в `destLangs`, если его несёт хоть один пакет. Пакет, потерявший файл, который есть у
восьми соседей, для оси неотличим от полного.

**Улика.** Читаны строки 464–479. Мутация: удалён `framework/templates/languages/ru/bugs/README.md`,
проза приведена к новым числам → `check-framework` `exit 0`, `counters-guard` `exit 0`.

**Кого касается.** Русскоязычный владелец получает пять русских README и один английский. В 2.3 по
решениям №56/№57 восемь пакетов замораживают — то есть ровно перетасовка состава.

**Замечено.** Круг R2, 2026-08-09.

**Состояние на 2026-08-09.** Адрес на месте; `framework/templates/languages/ru/bugs/README.md` в
рабочем дереве присутствует (22 строки), пакет `ru` полон — девять файлов. Каталогов пакетов девять:
`ar de es fr hi ja pt ru zh-Hans`. `README.md:991` несёт заявленную строку дословно.

## 4. §5f пинует sha только EN-стороны — содержимое пакетного файла не читается ни разу; выпотрошенная локализация проходит зелёной

**Адрес:** `tools/check-framework.mjs:473-476` (`const sha = normSha5f(srcAbs);` и обе `errors.push`).
Также: `tools/check-framework.mjs:438`.

**Заявлено.** Заголовок секции (`:438`): «Пер-файловые пары без порогов — вырожденных N не существует
(EXP-0019)»; текст ошибки обещает контроль синхронности локализации («re-sync its localization in N
pack(s)»).

**Наблюдалось.** `normSha5f` (`:444`) применяется только к `srcAbs` — EN-истоку. Файл
`languages/<lang>/<dest>` участвует лишь ИМЕНЕМ (как ключ `destLangs`). Пин доказывает, что EN не
менялся с момента, когда кто-то ЗАЯВИЛ синхронизацию, и ничего — о содержимом зеркала.

**Улика.** `ru/plans/README.md` (перевод) заменён на одну строку `# plans` → «✅ check-framework OK —
57 embedded files … module map OK», `exit 0`.

**Кого касается.** Заглушка или обрезанный хвост в одном из девяти пакетов закрывается
«сознательным передвижением пина»; владелец получает документ-огрызок, а релизные гейты
подтверждают готовность.

**Замечено.** Круг R2, 2026-08-09.

**Состояние на 2026-08-09.** Адреса на месте, строки совпадают; `framework/templates/languages/ru/plans/README.md`
в дереве цел — 25 строк перевода (мутация круга была на копии и в дерево не попадала).

## 5. Ось языковых пакетов задаёт охват НАЙДЕННЫМ, а не ДОЛЖНЫМ: пропажа пакета выпадает из проверки, страж печатает ✅ с уменьшенным числом

**Адрес:** `tools/counters-guard.mjs:382` —
`const langs = readdirSync(root).filter((l) => existsSync(join(root, l, TRIGGERS_FILE)));`
Также: `tools/counters-guard.mjs:454` (итоговая строка `✅ counters OK … ключи ${langs} языковых пакетов`).

**Заявлено.** Комментарий над осью объявляет её починкой прокси-проблемы; итоговая строка утверждает
охват «ключи 9 языковых пакетов».

**Наблюдалось.** Охват выводится из найденного на диске. Единственный порог красноты —
`if (!langs.length)` («ни одного skill-triggers.json — страж ослеп»). «9» в отчёте — интерполяция
`${langs}`, то есть числа найденного, а не должного.

**Улика.** Удаление `hi/` и `ar/skill-triggers.json` на копии → «✅ counters OK … ключи 7 языковых
пакетов», `exit 0`; `check-framework` тоже `0`. Контроль (переименование ключа в `ru`) →
«✖ языковой пакет ru: строка без навыка».

**Кого касается.** Два языка теряют машинерию алиасов, а страж рапортует зелёным и тихо меняет цифру
собственного отчёта о покрытии.

**Замечено.** Круг R2, 2026-08-09.

**Состояние на 2026-08-09.** Оба адреса на месте дословно; в дереве девять каталогов пакетов, у
каждого есть `skill-triggers.json` — то есть страж сейчас печатает «9», и это число ничем, кроме
содержимого каталога, не задано.

## Триаж 2.3 (фаза S, 2026-08-14)

> Вердикты двухступенчатого триажа (механика на HEAD → скептик, дефолт REFUTED; сводная таблица — `reports/KAIF_AUDIT/2026-08-14_r2_triage_SUMMARY.md`).

| № | Вердикт | Тяжесть | Эпик | Улика триажа |
|---|---|---|---|---|
| 1 | CONFIRMED | substantial | U | KAIF-CORE.mjs:53 `let LANG = (val('--lang') ·· 'en').toLowerCase();` — no allowed-code list anywhere in the file; :352 `if (!hasPack) return;` silently skips the honesty line for an unmatched code; :574 emits 'no bundled template for this language yet' — factually false for --lang Russian while pack ru exists. KAIF.md:54/:82 never define <code> (grep 639·ISO empty) while KAIF.md:24 tells the owner to say the language as a WORD ('Working language: Russian.'). Not design: the logPackHonesty/language-item mechanism (KAIF-CORE.mjs:337-358) is honesty for genuinely absent packs, not mis-coded ones. Plan 70 itself lists 'валидация --lang' in Epic U scope (plans/70:81) — the project already treats this as a field fix owed to live projects. Severity substantial, not blocker: deployment completes (in English), no data loss, recoverable by re-run; epic U per family default and per plans/70:81 naming this exact fix. |
| 2 | CONFIRMED | substantial | U | check-framework.mjs:456 excludes skill-triggers.json from §5f by name (mechanically forced — srcOf() at :445 would demand a nonexistent EN counterpart file); counters-guard.mjs:386-388 reads only Object.keys and rosterDiff — localized trigger-phrase VALUES are compared to nothing by any tool; no pin registry exists for EN skill descriptions, so a full rewrite of a skill's EN triggers leaves all 9 packs' aliases stale with both guards exit 0 (R2 mutation on what-next). This is the same truth↔mirror staleness class the project itself judged bug-worthy for docs (bugs/44 → §5f pin registry, header :430-438) — the skill-alias mirror is the one pair class knowingly left with no staleness guard while KAIF-CORE.mjs:357 assures the owner '(their trigger aliases ARE localized)'. Epic U per family default: pack parity work (plans/70:81, freeze task №56/№57) owns the pack machinery. |
| 3 | CONFIRMED | substantial | U | check-framework.mjs:446-458 builds destLangs as a UNION (a dest enters if ANY one pack carries it, :457-458); :469-476 uses inLangs only inside error prose; :478 orphan check fires only when NO pack carries the file — no comparison of pack compositions exists. A pack missing a file its 8 siblings carry passes §5f green. Mitigations checked and found insufficient: deploy-time logPackHonesty (KAIF-CORE.mjs:341-358) would list the lost doc among English arrivals but labels the accident 'INCOMPLETE BY DESIGN' — certifying a loss as intent; number-mirror tripwires resolve, per the project's own doctrine (numbers in prose are QUOTES of tool output), by syncing prose to the new number without ever naming the asymmetry. Directly exposed by the 2.3 freeze reshuffle (№56/№57, plans/70:81). Epic U per family default. |
| 4 | CONFIRMED | substantial | U | check-framework.mjs:473 `const sha = normSha5f(srcAbs);` — the hash is taken ONLY of the EN source; the pack file participates solely as a destLangs key (name), its content is never opened by §5f or any other gate (verified: no other reader of languages/* content in tools/). The section header :430-438 declares a 'реестр пар истина↔зеркало' and the error text :476 promises 're-sync its localization' — yet a pack file replaced by a one-line stub passes check-framework green (R2 mutation). Not a legitimate compromise: translations cannot be diffed against EN, but the pin doctrine's own 'conscious edit' mechanism (pinning the pack-side sha too, or minimal integrity floors) is applicable and absent — a pair registry that never reads the mirror side cannot detect a destroyed mirror. Epic U per family default (pack parity machinery). |
| 5 | CONFIRMED | substantial | U | Narrowed but real. Partially refuted arm: whole-pack deletion is NOT silent on HEAD — counters-guard MIRRORS :173-176 compare README's 'N language packs'/'N языковых пакетов' prose against live.langs (directory count, :90-91), and git -L dates them to 5b76e9d 2026-08-08, BEFORE R2, so the R2 'delete hi/ → exit 0' evidence could only hold with prose adjusted too; found-based counting itself is authored design (comment :450-451, dated 504a33f 2026-08-08, tied to freeze decisions №56/№57). Surviving defect at the named address: :382's filter `.filter((l) => existsSync(join(root, l, TRIGGERS_FILE)))` SILENTLY drops a pack dir that lost only skill-triggers.json — live.langs stays 9 (mirrors green), the axis loops 8, prints '✅ … ключи 8 языковых пакетов', exit 0, no dirs↔triggers cross-check anywhere; a language loses its whole alias machinery with green gates while the installer still prints 'trigger aliases ARE localized' (KAIF-CORE.mjs:357). No design statement covers the silent skip (only the count shift). Epic U per family default. |
