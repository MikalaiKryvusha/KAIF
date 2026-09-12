# План 107 — эпик CL «Заявление не шире наблюдения»: слово «тест» определено, две строки отчёта, доклад называет границу наблюдения

> **Создан:** 2026-09-12 22:47 +03:00 (сессия 63 — нулёвка CL0 по слову владельца №115: «краткий план, а детально планируем
> и делаем - в новом чате, этот чат закрывай»; канон N+1, №43).
> **Родитель:** `plans/100` (эпик CL — строка 10 таблицы эпиков; критерий приёмки версии 15); источники — issue #63
> (NDim, слово владельца проекта в тикете дословно: «или ты тупой, и утверждаешь ТО ЧТО ТЫ СУКА НЕ ПРОВЕРИЛ») и issue #62
> (NDim; слово владельца-QA в тикете дословно: «всякий раз, когда я говорю ТЕСТ, ТЕСТИРОВАНИЕ — я имею в виду ручное
> функциональное тестирование … любой код является НЕ ДОПУСТИМЫМ ДО ПРОДА — `[NOT-TESTED]`, пока по нему не прошли
> руками функциональное тестирование»), содержание #62 задано словом владельца №116 (`MASTER_PLAN` §7, дословно); разбор —
> `researches/30` §2в–§2г.
> **Статус:** ✅ **ЗАКРЫТ ≈ 2026-09-12 23:25 +03:00** (сессия 63 — один чат: CL0 ✅ 22:47 · CL1–CL2 ✅ ≈ 22:52 · CL3 ✅ 23:17 ·
> CL4 ✅ ≈ 22:53 · CL5 ✅ 23:08 · судья REFUTED на двух заявлениях, починки до коммита · CL6 ✅). Принят к исполнению
> 2026-09-12 22:47 +03:00.
> **Вовне:** поставка — раздел «What the word "test" means» в `TESTING_FRAMEWORK` обоих слоёв + правило маркера 2 + две
> строки в шаблоне отчёта `.kaif/_testrun-report-template.md` + правило `pass-without-functional-run` в
> `kaif-testrun-lint` + пятое обязательство KAIF в точке вызова fable-цикла `AGENT_GUIDE` обоих слоёв («заявление не
> шире наблюдения») + честная строка генератора контура при подъёме окна + две охоты `/fable-judge` + две строки в
> статусе закрытия бага `/report-bug` обоих слоёв; записи 2.7 сборщика; черновики ответов #62 и #63.

## Вектор цели (Achieve)

**Боль** (`researches/30` §2в–§2г; тикеты дословно). (1) **#62.** Канон не определяет слово «тест»: правило маркера 2
переключает `[TESTED]` наблюдением «запустилось, посчиталось» — юнит-тест запустился и посчитал, маркер переключён
законно; семь гейтов «Green tests ≠ working» — все о машине, гейт 6 «прод как пользователь» стоит ПОСЛЕ деплоя; линтер
отчёта прогона 2.7 судит семь полей и удовлетворён отчётом из одних юнитов с вердиктом `pass`. Владелец-QA пересчитал
«25 закрыты, все протестированы» по своему определению: функциональный прогон был у **3 из 25**. Слово владельца №116
уточняет содержание: «тест руками» ≠ руки человека — это функциональный проход по РЕАЛЬНОМУ продукту (стейдж/прод)
путём пользователя по сценариям, которые агент САМ выводит из функционала модуля/фичи/починенного бага, и исполняет
через машинерию, которую САМ себе пишет: нажимать кнопки, читать строки, смотреть на экран, читать логи — как QA руками.
(2) **#63.** Канон требует наблюдения для ТЕСТОВ и ничего — для УТВЕРЖДЕНИЙ в докладе: агент проверил `curl` → 200 и
доложил «страница открыта, ждёт вас три часа»; снимок экрана показал, что окна браузера нет вовсе. Класс — подмена
субъекта проверки: проверено дешёвое (сервер отвечает), заявлено ненаблюдавшееся (страница перед глазами владельца).
Наш собственный генератор контура печатает `Window: edge --app` по коду возврата `cmd /c start` — та же ширина
заявления. Один класс с двух сторон: в #62 слово канона значит для агента МЕНЬШЕ, чем читает владелец; в #63 слово
доклада значит БОЛЬШЕ, чем наблюдал агент.

**Где хотим оказаться.** `TESTING_FRAMEWORK` обоих слоёв определяет слово: тест = функциональный прогон по реальному
продукту путём пользователя по сценариям из функционала, исполняемый агентом через его же машинерию, которая ЧИТАЕТ
результат (экран · строки · логи), а не только возвращает код; юнит · линтер · селфтест · мутант — гигиена разработчика,
обязательна, тестом не называется и маркер не переключает; `[NOT-TESTED]` в продакшен не допускается. Отчёт прогона несёт
в «Проверках» ДВЕ раздельные строки — `Hygiene:` и `Functional run:` (`Гигиена:` / `Функциональный прогон:`), слово `NONE`
законно и значит «починено, не протестировано» — и так говорится; линтер краснеет на `pass` без второй строки или с `NONE`
(вердикт тогда — `partial`). `AGENT_GUIDE` обоих слоёв несёт пятое обязательство KAIF в точке вызова fable-цикла (шаг 7,
доклад): **заявление не шире наблюдения** — каждое утверждение о состоянии мира называет, ЧЕМ оно наблюдалось; прокси
говорится вслух; состояние экрана человека утверждается только после снимка экрана, иначе — «я сделал X; проверьте,
видите ли вы Y». Генератор контура печатает при подъёме окна честную строку (лаунчер вернул 0 — окно на экране владельца
этой строкой не проверено). `/fable-judge` охотится на обе шкуры класса: «tested» на одной гигиене и заявление шире
прогона. Статус закрытия бага несёт те же две строки.

**Метрика эпика:** критерий 15 `plans/100` (два сценария — 15а #63, 15б #62) закрыт **1 из 1** (≈ 2026-09-12 23:25 +03:00).

## Готово, когда (критерии приёмки — сценариями; якорь `plans/100` критерий 15)

1. **[CL — слово «тест» и две строки отчёта]** (#62; №116)
   - Ситуация. Развёртывание KAIF 2.7; серия починок закрыла 25 багов; у всех — юнит зелёный, селфтест зелёный, мутант
     красный; функциональный прогон по реальному продукту путём пользователя был у 3.
   - Действие. Агент пишет отчёт прогона по шаблону `.kaif/_testrun-report-template.md`, в «Проверках» заполняет строку
     `Hygiene:` и ставит `Functional run: NONE`, а в «Вердикте» пишет `pass`; запускает
     `node .kaif/tools/kaif-testrun-lint.mjs check`.
   - Результат. Линтер печатает `✖ … — pass-without-functional-run: Verdict says pass while Checks carries no Functional
     run line (or NONE) …` и выходит кодом 1; с `Functional run:` строкой, называющей что прогнано, на каком контуре и что
     ПРОЧИТАНО (экран · строки · логи), — код 0; с `NONE` и вердиктом `partial` — код 0. Канон обоих слоёв говорит: тест =
     функциональный прогон по реальному продукту путём пользователя по сценариям из функционала через машинерию агента,
     которая читает результат; гигиена маркер не переключает; `[NOT-TESTED]` в продакшен не допускается; статус закрытия
     бага несёт две строки.
   - Проверка. `node framework/tools/kaif-testrun-lint.mjs selftest` → «8 rules × 2 languages», мутации
     `pass-without-functional-run` (строки нет · `NONE`) красные ровно этим правилом, `partial` + `NONE` — чисто; свод
     `s25` на свежем `dist` зелёный, на ядре 2.6 (`KAIF_DIST`) — красный по этому правилу; грепы `Functional run` /
     `Функциональный прогон` в `framework/TESTING_FRAMEWORK.md`, корневом, шаблоне отчёта и `/report-bug` обоих слоёв —
     пары `check-framework`; охота судьи «Tested on hygiene alone (KAIF 2.7)» в обеих копиях `/fable-judge`.

2. **[CL — заявление не шире наблюдения]** (#63)
   - Ситуация. Агент поднял страницу контура и знает только, что сервер отвечает 200 на `127.0.0.1`; окна браузера на
     экране владельца он не видел.
   - Действие. Агент докладывает владельцу и поднимает страницу генератором `node .kaif/tools/contour/review.mjs <док>`.
   - Результат. Доклад называет границу: «сервер отвечает; открылось ли окно у вас — не проверял, проверьте, видите ли
     страницу» — а не «страница открыта, ждёт вас»; лог генератора печатает `Window: edge --app — the launcher returned 0;
     whether a window is on the owner's screen this line does not verify (a screenshot does)`; канон обоих слоёв несёт
     правило пятым обязательством KAIF (шаг 7) с таблицей «сегодня → как надо» и особым случаем экрана человека; `/fable-judge`
     охотится на «Claim wider than the observation (KAIF 2.7)».
   - Проверка. Грепы `A claim is never wider than the observation` / «Заявление не шире наблюдения» в `AGENT_GUIDE` обоих
     слоёв и `this line does not verify` в `framework/tools/contour/review.mjs` — пары `check-framework`; ассерт `s22` на
     развёрнутой копии генератора (фраза приехала); охота в обеих копиях судьи (побайтно равны — реестр пар).

3. **[судья эпика]** — лёгкий `/fable-judge` по критериям 1–2; на закрытии — нулёвка IW0 (`plans/108`, N+1), веха в
   `plans/100` (строка 10, критерий 15 ✅ — закрыто 12 из 17).

## Шаги

- [x] **CL0 — нулёвка актуализации входов ✅ 2026-09-12 22:47 +03:00 (сессия 63).** Входы сверены против HEAD `396f70c`:
      тикеты #62/#63 прочитаны по телам (`gh issue view`), документ NDim `bugs/KAIF/12` и его локальная починка
      (`TESTING_FRAMEWORK.md` NDim `:146–190`, `:262`) — читать, не править; `framework/TESTING_FRAMEWORK.md`: правило
      маркера 2 `:79–81` («it ran, it rendered, it counted»), «manual walk-through» — один раз в `:133` элементом списка,
      гейт 6 `:197` — после деплоя; `kaif-testrun-lint.mjs` — семь правил как данные `:86–101`, `KEYWORDS` по языкам
      `:56–59`, селфтест «31 cases, 7 rules × 2 languages» (ассерт `/7 rules × 2 languages/` в `s25:51` — сдвинется на 8);
      шаблон отчёта `:33–40` — «Проверки» одной таблицей; `_testcases-template.md` §4 — кейсы без машинерии прохода;
      `/report-bug` обоих слоёв шаг 5 — «STATUS: DONE (что сделано / как проверено)» без двух строк; `framework/AGENT_GUIDE.md`
      `:357–393` — четыре обязательства KAIF в точке вызова, корневой `:349–388`; «Showing is an action» `:938`, «Показ — это
      действие» `:1010`; генератор `review.mjs:957` `log('Window: ' + openWindow(url, log))` — `openWindow` возвращает
      имя лаунчера по `status === 0` команды `cmd /c start` (`:771–786`), честной оговорки о ширине нет (есть только у
      `CALL:` `:118` — «an exit code does not prove a human heard it» — образец); KAIF-блок охот судьи `:46–60` — 15 охот,
      обе копии побайтно равны; `check-framework` пары TR/VC `:458–471` — образец; записи 2.7 сборщика `:281–288` и
      `:359–366`; `KAIF_REFERENCE.md:509` — строка модуля («seven fields»); `s25` — тело для расширения; `s22:78–81` — асcерты
      на лог генератора (`Window:` никто не судит — blast radius нулевой; `verify-contour` строку `Window:` не проверяет).
      **Проба ДО кода** (скретчпад `cl0-probe.mjs`, 2026-09-12 22:46 +03:00): синтетический отчёт «Проверки — юнит ·
      селфтест · мутант, Вердикт `pass — all 25 closed, all tested`» → `check` → **exit 0, «OK — 1 report(s) … 0
      findings»**; собственный отчёт истока `testcases/reports/2026-09-12_polygon-2.7-HO.md` — строки `Functional run` /
      `Функциональный прогон` нет, `check` → exit 0. Класс открыт и у истока: три отчёта 2.7 — прогоны машинерии, ни один не
      называет функциональный прогон отдельной строкой (`grep -c "Functional run\|Функциональный прогон" testcases/reports/*`
      → 0 · 0 · 0).
      `INTENT: code does <линтер судит семь полей и слово вердикта; `pass` при одних юнитах — законен; генератор печатает
      `Window: edge --app` по коду возврата лаунчера>; the failing check/task expects <`pass` без строки функционального
      прогона — красный поимённо; доклад и лог называют границу наблюдения — plans/100 критерий 15>; the spec says <№116:
      «ИИ агент пишет себе тестовые сценарии исходя из функционала … пишет себе машинерию … в реальном продукте … нажимать
      кнопки, читать строки, смотреть на эран, читать логи»; #62: «two lines, never summed»; #63: «an assertion is never
      wider than the observation behind it»>` — три стороны сходятся; расхождение X/Y — ровно дыра тикетов.
      `FORK: options <A имя второй строки «Functional run» (владелец №116: проход по продукту машинерией агента) | B «Manual
      run» (буква тикета #62) | C «Walk-through»> · price of error <слово поставки, которое каждый проект прочтёт по-своему
      — «manual» вернёт спор «руками человека?», который №116 только что снял> · consulted <слово владельца №116 дословно;
      ISTQB glossary: «manual testing — testing performed by a human», «functional testing — testing performed to evaluate
      whether a component or system satisfies functional requirements», «test automation — the use of software to perform
      or support test activities» — прогон машинерией по функциональным сценариям есть functional testing, automated;
      слово «manual» в ISTQB означает именно руки человека>` → **DECIDED [AI]: A** — `Functional run` / «Функциональный
      прогон»; в каноне названо, что тикет звал это «manual» и что владелец имел в виду (проход как QA руками — через
      машинерию агента). B отвергнут авторитетом области и словом владельца; C — не термин.
- [x] **CL1 — канон `TESTING_FRAMEWORK` обоих слоёв ✅ 2026-09-12 ≈ 22:52 +03:00** (раздел «What the word "test" means» /
      «Что значит слово «тест»» перед цепочкой активностей; правило маркера 2; п. 1, 2, 4 раздела отчёта; ужато до бюджета
      300 — § «Решения» 5). Прежняя формулировка шага: Новый раздел «What the word "test" means — a functional run on the
      real product, by the user's path» сразу после семи принципов (перед цепочкой активностей — определение слова
      предшествует работе им): определение; три обязанности агента (вывести сценарии из функционала модуля/фичи/бага →
      написать машинерию прохода → прогнать на стейдже/проде путём пользователя и ПРОЧИТАТЬ результат: экран · строки ·
      логи); гигиена названа поимённо (юнит · линтер · селфтест · мутант) — обязательна, тестом не зовётся, маркер не
      переключает; граница «машинерия, вернувшая только код, — инструмент, не тест»; `[NOT-TESTED]` в продакшен не
      допускается; владелец — не тестировщик по умолчанию (агент проходит путь сам, глаз владельца — класс «вкус»); слово
      владельца дословно (RU) / переводом (EN). Правило маркера 2 — одно предложение («Observation means a functional run …
      hygiene does not flip the marker»). Раздел отчёта, п. 2: «Проверки» открываются двумя строками; п. 4: линтер краснеет
      на `pass` без второй. «Как стыкуется»: восемь правил линтера. RU-зеркало — от смысла.
- [x] **CL2 — шаблоны и `/report-bug` ✅ 2026-09-12 ≈ 22:52 +03:00.** Прежняя формулировка: `_testrun-report-template.md` §4 — две строки над таблицей (`Hygiene:` ·
      `Functional run:` с подсказкой «what was walked · on which contour · what was READ — or the word NONE»);
      `_testcases-template.md` §4 — примечание: у каждого кейса названа машинерия, которая проходит его на реальном продукте,
      и что она ЧИТАЕТ; `/report-bug` обоих слоёв шаг 5 — `STATUS: DONE` несёт те же две строки, `NONE` = «починено, не
      протестировано».
- [x] **CL3 — правило линтера `pass-without-functional-run` + селфтест + `s25` ✅ 2026-09-12 23:17 +03:00** (селфтест 45
      кейсов; `s25` «all 32 checks green», на ядре 2.6 красный; каверза судьи — `\s*` после двоеточия глотал перевод строки
      → `[^\S\n]*`, `NONE` судится первым словом; отчёт прогона, прогоны 2, 14, 15). Прежняя формулировка: Правило данными: вердикт `pass` И
      (строки `Functional run:`/`Функциональный прогон:` в «Проверках» нет ИЛИ её значение `NONE`/«нет»/«—»/пусто) →
      находка с именем поля; ключевые слова строки — в `KEYWORDS`-таблице по языкам. Селфтест: мутации «строки нет» и
      «NONE» → ровно это правило (EN + RU); `partial` + `NONE` → 0; чистый отчёт получает строку `Functional run:` с
      содержанием (иначе он покраснел бы сам — EXP-0127: селфтест на точный исход). `s25`: два отчёта в «плохой» каталог
      (7 → 9 находок в 8 отчётах), «8 rules × 2 languages», красный на ядре 2.6 — ассерт ловит отсутствие правила
      (доходит до вердикта, не падает — `existsSync` уже стоит).
- [x] **CL4 — `AGENT_GUIDE` обоих слоёв + генератор контура ✅ 2026-09-12 ≈ 22:53 +03:00** (`s22` +1 ассерт — зелёный на
      2.7, красный на 2.6). Прежняя формулировка: Пятое обязательство KAIF в точке вызова fable-цикла (шаг 7,
      доклад): «A CLAIM IS NEVER WIDER THAN THE OBSERVATION BEHIND IT» — каждое утверждение о состоянии мира называет, ЧЕМ
      наблюдалось; прокси — вслух; таблица «сегодня → как надо» из тикета (страница · прод · доставка · `✅` прибора);
      особый случай — экран человека только после снимка экрана, иначе «я сделал X; проверьте, видите ли Y»; строка в
      «Showing is an action» / «Показ — это действие»: показ, о котором доложено шире, чем наблюдалось, — тот же класс.
      Генератор: `review.mjs:957` печатает `Window: <launcher> — the launcher returned 0; whether a window is on the owner's
      screen this line does not verify (a screenshot does)`; ассерт `s22` — фраза приехала в развёрнутую копию.
- [x] **CL5 — судья, пары, записи, сборка, полигон, отчёт прогона ✅ 2026-09-12 23:08 +03:00** (десять пар; записи 2.7;
      `KAIF_REFERENCE`; counters 792; полигон «all 26 suites green» со второго прогона — первый красный `s16` по бюджету;
      отчёт `testcases/reports/2026-09-12_polygon-2.7-CL.md`; черновики ответов — ниже). Прежняя формулировка: Две охоты в KAIF-блоке `/fable-judge` обеих копий
      (побайтно); пары `check-framework` (TESTING оба слоя · шаблон · `/report-bug` оба слоя · судья ×2 · AGENT_GUIDE оба
      слоя · генератор); `TEMPLATE_NOTES['2.7']` + `POLICY_CHANGES['2.7']` — по записи на эпик; `KAIF_REFERENCE.md:509` —
      восемь правил и две строки; `node tools/build-framework.mjs` → `counters-guard` → `npm run test:core`; отчёт прогона
      `testcases/reports/2026-09-12_polygon-2.7-CL.md` — ПЕРВЫЙ отчёт истока с двумя строками (функциональный прогон истока
      = развёрнутая копия из `dist` под `s25`/`s22`: линтер и генератор запущены КАК ПОЛЬЗОВАТЕЛЬ поставки, вывод прочитан);
      черновики ответов #62/#63 — ниже.
- [x] **CL6 — закрытие ✅ ≈ 2026-09-12 23:25 +03:00.** Лёгкий судья (субагент с чистым контекстом; переисполнил 12 заявлений
      + четыре собственные обманные фикстуры + полигон своим прогоном) — **REFUTED** на двух: (1) регэксп строки `Functional
      run:` — `\s*` после двоеточия под флагом `u` глотал перевод строки: голая метка / плейсхолдер шаблона НАД заполненной
      таблицей под `pass` проходили зелёными → `[^\S\n]*`, `NONE` — целым значением или с пунктуацией после («None of the
      flows failed…» — содержание), семь кейсов селфтеста (47), фикстура `s25` (32; на 2.6 «8 of 33»); (2) строка «стражи
      закрытия» моего отчёта прогона ссылалась на запись, которой не было, — исходы вписаны из вывода, обещания удалены
      (класс самого эпика). Каверзы: четыре строки «Функциональный прогон:» истока называют стенд (свежая установка, не живое
      развёртывание); кавычки в правиле маркера 2 EN; нулевой запас бюджета EN (§ «Решения» 5). Повторный суд трёх команд —
      см. отчёт прогона. `plans/100` строка 10 и критерий 15 ✅, метрика «закрыто 12 из 17»; STATUS п. 0 → IW0
      (`plans/108`); MASTER_PLAN §5/§8; урок EXP-0131; коммит. Прежняя формулировка: лёгкий судья по критериям 1–2;
      каверзы — до коммита; вехи в `plans/100`; STATUS/MASTER_PLAN; урок; коммит.

## Верификация наблюдением

- `node framework/tools/kaif-testrun-lint.mjs selftest` → «8 rules × 2 languages», обе мутации нового правила красные им
  одним; проба CL0 (скретчпад) после фикса — зелёная «the class is guarded (rule named)».
- `node tools/sandbox/s25-testrun-lint.mjs` зелёный; `KAIF_DIST=<git show v2.6:dist/…> node tools/sandbox/s25-testrun-lint.mjs`
  — красный, доходит до вердикта, новое правило среди красных.
- `node tools/build-framework.mjs` (пары CL зелёные) · `node tools/counters-guard.mjs` · `npm run test:core` «all 26 suites
  green» (новых сводов нет — расширены `s25` и `s22`).
- Отчёт прогона эпика с двумя строками; `kaif-testrun-lint check` — OK на четырёх отчётах истока (три старых без строки
  ЗАКОННЫ: правило судит только `pass` без строки… — **нет**: у трёх старых отчётов вердикт `pass` и строки нет → они
  покраснеют. Решение — ниже, § «Решения» 3).

## Риски (ярусы Мёрфи)

- **(а) Правило краснит старые отчёты истока** (три отчёта 2.7 с `pass` без строки) и отчёты поля, написанные по форме TR.
  Защита: правило действует на отчёты с датой ≥ даты правила? — нет, дата в имени — не дата правила; честнее: три отчёта
  истока ДОПИСЫВАЮТСЯ двумя строками по фактам своих прогонов (в них функциональный прогон развёрнутой копии БЫЛ — своды
  устанавливают поставку и читают вывод `check`/страницы), а поле получает запись 2.7: «отчёты по форме TR без второй строки
  покраснеют — допишите строку по фактам, `NONE`, если прогона не было, и тогда вердикт `partial`». Правило — не ретро-суд, а
  форма вперёд; линтер консультирует (exit 1 — находка, не отказ старта).
- **(а) Слово `Functional run` прочтут как «любой прогон машинерии»** — свод полигона тоже «функциональный». Защита: канон
  называет три признака (реальный продукт · путь пользователя · результат ПРОЧИТАН машинерией), и линтер требует содержания
  строки, а судья — соответствия трём признакам.
- **(б) Честная строка генератора ломает эталон `verify-contour`** — проверено CL0: `Window:` не судится ни эталоном, ни
  `s22`; прогон `verify-contour --etalon-only` в закрытии подтвердит.
- **(в) Пятое обязательство удлиняет точку вызова fable-цикла** (бюджет `AGENT_GUIDE`) — `check` предупреждает о
  превышении бюджета, не отказывает; текст держится в 12 строках.

## Черновики ответов (отправка после релиза 2.7 — №84/№92/№93)

### #62

Shipped in KAIF 2.7 (epic CL). You measured the loophole exactly, and the owner of the origin sharpened the definition the
same evening — so what shipped is a little different from what the ticket asked, in one word.

**The word.** `TESTING_FRAMEWORK.md` now opens its testing chapter with a section "What the word "test" means": a test is a
**functional run on the REAL product** (stage or production), **by the user's path**, whose result is **READ**. Three duties,
all the agent's — derive the scenarios from the functionality under test (the module, the feature, the fixed bug); write the
machinery that walks them (a browser driver, a CLI session, a log reader); run it as the user would and read what it shows:
the screen, the lines, the logs. Lint, unit tests, self-tests, mutation proofs and guards are the developer's **hygiene**:
still mandatory (gate 5 stays — nothing is demoted), never called "testing", never flipping the marker — rule 2 of the marker
contract now says so in one sentence. Machinery that returns only an exit code is an instrument, not a test. `[NOT-TESTED]`
is inadmissible to production. Your three boundaries are in: hygiene not demoted; an instrument launched by hand is still an
instrument until its frames are read; the owner is not the tester by default.

**Why "Functional run" and not "Manual run".** The origin's owner — the same QA whose words you quoted — stated what "by hand"
means for an AI agent: it is not a human's hands; it is the agent writing itself the scenarios and the machinery and walking
the real product with it, "doing to the product, through machinery, what a real QA would do by hand". In ISTQB vocabulary
"manual" means a human executes; what he described is functional testing, automated. So the second line is named by what it
is, and the canon says the ticket's word beside it.

**The two lines.** The run report's Checks now open with `Hygiene:` and `Functional run:` (what was walked · on which contour
· what was READ — or the word `NONE`, which means *fixed, not tested*, and that is what the chat says). The shipped template
carries them; the test-case template asks every case to name its machinery and what it reads; a bug's closing `STATUS: DONE`
carries the same two lines. `kaif-testrun-lint` gained the rule `pass-without-functional-run`: a Verdict `pass` whose Checks
carry no functional-run line, or say `NONE`, reddens by name — hygiene alone is `partial`. Proven both ways: the linter's
selftest (39 cases, 8 rules × 2 languages; "NONE under pass" red, "NONE under partial" clean), suite `s25` green on 2.7 and
red on the 2.6 core, and — before writing a line of code — a probe that fed the OLD linter a hygiene-only report with "pass —
all 25 closed, all tested": exit 0, zero findings. The origin's own three 2.7 run reports failed the new rule too; they now
carry the two lines by the facts of their runs. `/fable-judge` hunts "tested on hygiene alone".

**One thing for your tree.** A report you wrote by the 2.7 form before this update will redden if its Verdict says `pass`: add
the two lines by the facts of that run, and write `partial` where there was no functional run. Your local section stays
yours; the origin's wording is in the update task.

Thank you — "25 tested was 3" was the measurement the canon could not make about itself.

### #63

Shipped in KAIF 2.7 (epic CL) — together with #62, because they turned out to be two skins of one class: there the canon's
word meant less than the owner read; here the report's word meant more than the agent observed.

**The rule.** `AGENT_GUIDE.md` (both layers) carries a fifth KAIF obligation at the fable loop's step 7 (report): **a claim is
never wider than the observation behind it.** Every statement about the state of the world names WHAT observed it; a proxy is
said aloud. Your table went in as the rule's own examples — "the server answers 200; whether a window opened on your screen I
did not check — do you see it?", "deploy 0, smoke 24/24; behaviour for real people — not checked", "written and signalled;
delivery is confirmed only by your word". The special case is stated separately, as you asked: the state of the HUMAN'S SCREEN
is asserted only after looking at the screen — until the screenshot, the only legal form is "I did X; please check whether you
see Y". "Showing is an action" says the same in one sentence.

**The instrument's disclaimer, lifted into the shipped generator.** The contour generator (`.kaif/tools/contour/review.mjs`)
now prints the boundary at every window it raises: `Window: edge --app — the launcher returned 0; whether a window is on the
owner's screen this line does not verify (a screenshot does)`. Suite `s22` asserts the phrase on the deployed copy — green on
2.7, red on the 2.6 core.

**The judge.** `/fable-judge` gained the hunt "claim wider than the observation": for every claim, find the observation named
for it and compare their widths; a proxy not said aloud is the finding.

Thank you — the sentence "the page is live, waiting for you for three hours" is now the canon's example of what not to say.

## Решения, принятые агентом без владельца

1. **[AI] Имя второй строки — `Functional run` / «Функциональный прогон», не `Manual run`** (`FORK:` в CL0): слово владельца
   №116 говорит о проходе по продукту машинерией агента, а `manual` в словаре ISTQB означает руки человека — букву тикета
   владелец сам уточнил.
2. **[AI] Одно новое правило линтера, не три.** Тикет предлагал «краснеть на `pass` без ручного прогона»; строка `Hygiene:`
   отдельно не линтуется (её отсутствие — не фрод, фрод — сложить две в одну); требование «строка называет, что ПРОЧИТАНО»
   — за судьёй, не за регэкспом (Оккам: регэксп на «экран/строки/логи» краснел бы на честных формулировках).
3. **[AI] Три отчёта истока 2.7 (TR · VC · HO) дописываются строками по фактам своих прогонов**, а не исключаются из
   правила: у каждого функциональный прогон развёрнутой копии БЫЛ (своды ставят поставку из `dist` и читают вывод), строки
   не было, потому что формы не было. Дописать — честнее, чем завести маркер-исключение.
4. **[AI] Раздел определения стоит ПЕРЕД цепочкой активностей**, а не в контракте маркеров: слово определяется до того, как
   им работают; правило маркера 2 получает одно предложение со ссылкой.
5. **[AI] Бюджет ядра: EN-поставка ужата ровно до 300 строк, RU-обвязка оставлена на 304.** Первый полигон покраснел
   `s16` («317 lines against its budget of ~300»); по канону превышение лечится ужатием, не подъёмом бюджета — EN-раздел
   переписан три раза (317 → 304 → 301 → 300) без потери ни одного из трёх признаков теста и трёх границ тикета. RU-копия
   несёт слова владельца ДОСЛОВНО (№116 и слово из тикета), и четыре строки сверх бюджета куплены ими; у истока
   механической проверки бюджета обвязки нет (`.kaif/kaif-core.mjs` не развёрнут), правило — предупреждение, не отказ.
   Судья назвал нулевой запас EN каверзой: следующая строка в этом документе у любого проекта даст предупреждение — повод
   ВЫНОСИТЬ при следующей правке (кандидат — блок `@guard` гейта 5 в `researches/`), не поднимать число.
6. **[AI] Дефект регэкспа (каверза судьи REFUTED 1) закрыт без документа бага:** класс «`\s*` под флагом `u` глотает
   перевод строки» пойман до коммита, страж — шесть кейсов селфтеста и фикстура `s25`; по лестнице тяжести это S2 (потерян
   час судьи) со стражем, но инцидент не пережил сессии и адреса у него нет — запись в отчёте прогона и урок в `EXPERIENCE`.

## Links

`plans/100` (критерий 15, строка 10) · issues #62 #63 · `researches/30` §2в–§2г, §3 · `plans/104` (TR — форма отчёта и
линтер) · `plans/106` (HO — образец нулёвки и пробы) · `framework/tools/kaif-testrun-lint.mjs` · `tools/sandbox/s25-testrun-lint.mjs`
· `framework/tools/contour/review.mjs` · `plans/108` (IW — следующий, N+1).
