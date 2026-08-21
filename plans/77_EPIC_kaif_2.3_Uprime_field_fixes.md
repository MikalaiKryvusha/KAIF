# План 77 — ЭПИК U′ «Полевые точечные фиксы»: контуры, машинерия, канон поставки, заморозка пакетов

> **Создан:** 2026-08-21 01:22 +03:00 (исполнение сокращённого скоупа 2.3 — решение №77; план
> пишется нулёвкой на старте, канон N+1).
> **Родитель:** `ideas/24_kaif_2.3_scope.md` § «Сокращение скоупа» (состав U′) + `plans/73`
> (эпик U — U′ исполняет его подмножество: U1-фиксы · семейство 98 · заморозка из U5) + issues
> origin **#19 · #15 · #16 · #8 · #10 · #3 · #4 · #6 · #20** (тела issues — первоисточник).
> **Статус:** 🟢 В ИСПОЛНЕНИИ — нулёвка U′0 пройдена 2026-08-21 01:22 +03:00 (issues #3–#22
> открыты пробой; твин-чек класса #19 по истоку дал находку — артефактная ветка `review.mjs:624`
> теряет комментарий без статуса; вопросная ветка `:617` уже чиста) · U′1 закрыта 2026-08-21
> 01:32 +03:00 (контур 149/0, #19+#15) · U′2 закрыта 2026-08-21 02:42 +03:00 (семь пунктов
> машинерии: #16 сплайс · #8 переход маркера · #10 резолв/формы/libuv · 92.1 `--lang` ·
> §12.3 наследие T8 · 99.1–99.3 счётчики/канал · crash-журнал + `resume`; коммиты
> `7bb1753`/`7d9258c`/`555ac5e`, полигон «all 14 suites green») · U′3 закрыта 2026-08-21
> 02:59 +03:00 (канон поставки: #4 пункт owner-voice с исполняющим гейтом · #6 язык по
> аудитории в обоих слоях · #3 сфера названа будущим членом списка placeholders; черновики
> ответов — секцией ниже).
> **Вовне:** машинерия поставки (`framework/installer/`), контракт `/owner-reviews`, канон
> `/report-bug` — публичные контракты; ответы в issues — только `send-outbound` со словом
> владельца.

## Вектор цели (Achieve)

Живой парк на 2.2 получает дешёвые фиксы того, что уже укусило поле: контур перестаёт молча
терять слова владельца, сигналы агентов о дефектах KAIF перестают стоять в очереди к человеку,
машинерия обновления перестаёт терять состояние и переформатировать чужие файлы, заморозка
восьми языковых пакетов исполняется по слову владельца. Якорь — `ideas/24` § «Сокращение»,
состав эпика U′ поимённо.

## Готово, когда (критерии приёмки эпика)

1. **Девять issues (#19/#15/#16/#8/#10/#3/#4/#6/#20) закрыты фиксом** с черновиком ответа в
   этом плане (отправка — слово владельца); Meter: греп таблицы исходов в U′5.
2. **R2-вхождения, взятые в 2.3** (98.1/98.2 · 99.1–99.3 · часть 92–94 по списку `ideas/24`),
   несут исход `починено+страж` / `точечно с причиной` / `отклонено владельцем` — счёт в U′5.
3. **Каждый фикс машинерии — со сводом полигона, доказанным красным** на сломанной версии;
   `npm run test:core` зелёный на закрытии каждой фазы.
4. **Контур тронут → полный `node tools/verify-contour.mjs` в живом браузере зелёный** (канон
   AGENT_GUIDE), плюс новый страж-кейс «заполнен только комментарий → сохранён».
5. **Заморозка восьми пакетов исполнена по формуле №56** (версия · состояние · причина ·
   оживление по запросу сообщества) в README обеих половин и в поставке; оси стражей знают
   заморозку поимённо (92.2–92.5).
6. Оба слоя + пересборка; дерево зелёное целиком; лёгкий судья эпика (№48).

## Фазы

### U′0 — нулёвка: актуализация входов (№76) — ✅ пройдена 2026-08-21 01:22 +03:00

- [x] Issues #3–#22 открыты (проба `gh issue list` 00:25); HEAD `49c32c3`; эпик X закрыт —
      правило формы обязательства действует на все правки канона этого эпика.
- [x] Твин-чек класса #19 по истоку (BUG_FIXING: «закрывай класс, а не экземпляр»): вопросная
      ветка `tools/review.mjs:617` УЖЕ несёт `com.trim()` в условии записи; **артефактная ветка
      `:624` — `if(st)` — теряет комментарий без выбранного статуса** (вторая строка исполнимого
      контракта issue #19). Дельта плана: U′1 чинит артефактную ветку истока + контракт payload.

### U′1 — контуры: слова владельца не теряются, сигналы агентов не стоят в очереди (#19, #15) — ✅ закрыта 2026-08-21 01:32 +03:00

- [x] 1. **Исток, артефактная ветка:** `tools/review.mjs` collect() — `if(st)` → `if(st||ac)`;
      разбор класса комментарием на месте правки; «только замечание» гейт не открывает по
      построению (`checkApproval` пропускает лишь `approved`). Коммит `6c79254`.
- [x] 2. **Страж-кейс:** `verify-contour` блок 8в — обе половины класса ЖИВЫМ КЛИКОМ (артефакт:
      замечание в снимке + гейт закрыт; вопрос: третье состояние в снимке + разнос в md + вопрос
      остался открытым). Красный доказан мутацией `if(st)`: 147/2 → фикс → 149/0.
- [x] 3. **Payload-контракт `/owner-reviews`:** P7 расширен (нарисованное поле должно человеку
      своё содержимое · конфликт решает I10 · ТРИ состояния снимка, «отвергнуто-с-направлением» —
      сильнейшее, читается как СТОП · выбор из текста не выводится · общий комментарий ≠
      комментарий вопроса · страж проверяет ЗАКРЫТИЕ формы, не отрисовку) — оба слоя.
- [x] 4. **#15 «транспорт ≠ авторство»:** ветка фреймворка `/report-bug` — сигнал в origin
      автономно, с подписью агента-автора (стоячее правило владельца из issue #15, «это КАНОН» —
      в EN-payload пересказом по §9.11, дословные цитаты — в issue и обвязке); send-гейт
      `/owner-reviews` остаётся для чужих репозиториев и заявлений от имени владельца — обе оси
      названы в обоих навыках, оба слоя.
- [x] 5. Пересборка зелёная (162 блока · 701 модуль; валидатор поймал кириллицу в EN-payload —
      перефразировано по §9.11); полный `verify-contour` в живом браузере: **149 зелёных / 0**.
- **Гейт U′1:** ✅ [TESTED: 2026-08-21 · контур 149/0 в браузере; мутация 147/2; сборка+счётчики
  зелёные]

### U′2 — машинерия жизненного цикла (#8, #16, #10 + 99.* + `--lang` + crash-safety) — ✅ закрыта 2026-08-21 02:42 +03:00

- [x] 1. **#16:** проводка `kaif:*` сплайсит добавляемое в СОБСТВЕННЫЙ текст манифеста
      (`jsonTopLevel` + `splicePackageJson`; сплайс доказывает себя — парс результата минус
      добавленное == оригинал, иначе честный фолбэк с признанием пересериализации в логе);
      свод s01/S5a+S5b: инвариант «одна непрерывная вставка», компактные строки/CRLF/отсутствие
      финального перевода строки — байт-в-байт; красный доказан против до-фиксного dist (5
      красных). Коммит `7bb1753`.
- [x] 2. **#8:** явный `--mode standard` на легаси-ветке ПИШЕТ переход anonymous → origin в
      маркер с объявлением в логе; явный `--mode anonymous` против отслеживаемого маркера —
      отказ ДО первой записи; наследование без флага не тронуто (bug 11). Свод s04/S15+S15b+S15c
      по строкам репро issue; красный — 4 красных против до-фиксного dist. Коммит `7bb1753`.
- [x] 3. **#10:** голый `--source github.com/<o>/<r>` резолвится в `releases/latest/download`
      с объявлением (diff И update); отказ скачивания называет ожидаемые формы `--source`;
      libuv-аборт погашен КЛАССОМ: пост-сетевые отказы (fetchArtifact, sha256-mismatch, v1-die
      диффа, main-поток лоадера) идут через `dieSoft` — сентинел + естественный дренаж цикла
      вместо `process.exit` при живых хэндлах undici. Класс доказан живым пробоем (Node v24.15.0
      win32, как у репортёра): без фикса ассерция 5/5, `body.cancel()` НЕ лечит, `destroy()`
      диспетчера НЕ лечит, дренаж — 0/3 (~300 мс провисания); после фикса 404-путь — exit 1 без
      ассерций, happy-path на живом origin — exit 0 с честным диффом. Свод s09/D6 (красный —
      прогоном ядра и лоадера из `7bb1753`). Коммит `7d9258c`.
- [x] 4. **Валидация `--lang`** (92.1): `checkedLang` — слово-имя («Russian») → отказ с
      подсказкой кода; не-код → отказ со списком пакетов; настоящий ISO 639-1 код без пакета
      законен (English-first честная строка — дизайн); отравленный маркер прошлой эпохи ловится
      на всех трёх точках наследования с именем лечащего флага. Свод s09/D7 (красный — 4 против
      до-фиксного dist: Russian ставился молча по-английски). Коммит `7d9258c`.
- [x] 5. **Квитанция-момент §12.3** (KLAS п. 5): подтверждён ЗАКРЫТЫМ задачей T8 2.2 по
      построению — `localStamp()` пишет полный локальный ISO 8601 в `date`/`history.date`/
      `verifiedAt`, s03 стережёт формат регэкспом `ISO_MOMENT_RE` (S9:77, S9:82, S12:238);
      правок не потребовалось, наблюдение зафиксировано этим пунктом.
- [x] 6. **Счётчики финальной строки считают диск** (99.1: `translatedOnDisk` — сверка байтов
      диска с шаблоном этого прогона; 99.2: `logPackHonesty` под фильтром анонимности — «skill
      bodies» == «skills trigger-aliased») · **неизвестный канал лоадера — отказ** (99.3,
      зеркало cmdUpdate). Своды s04/S16+S16b (красный: bodies=35 при aliased=31, «8» при 6
      записанных) и s09/D6. Коммит `7d9258c`.
- [x] 7. **Crash-safety `update`** (KLAS п. 2): форма «журнал + `resume`» по факту чтения
      cmdUpdate (записи интерливлены с классификацией; атомарного мульти-свопа на Windows нет).
      `.kaif/update-journal.json` после бэкапа и ДО первой мутации (обе дороги: core-update и
      version-moving bootstrap), снимается последним актом; пока жив — update/bootstrap
      отказывают с именем `resume`; `resume` возвращает дерево побайтно, удаляет born-файлы,
      потребляет журнал. Reference §10.7 + новый §12.4 (зеркало команд; 701 → 702 модуля по
      четырём зеркалам счётчиков). Свод s02/S9-crash — краш НАТУРАЛЬНЫЙ (EISDIR посреди
      classifyAndApply, без тест-ручек в поставке); красный — 9 против до-фиксного dist.
      Коммит `555ac5e`.
- **Гейт U′2:** ✅ [TESTED: 2026-08-21 · каждый пункт — свод, красный доказан на сломанной
  версии (5+4+D6+4+2+9 красных, п. 5 — наследие T8); `npm run test:core` — «all 14 suites
  green»; `node tools/counters-guard.mjs` — «50 зеркал OK, 702 модуля»; контур не тронут —
  verify-contour фазе не нужен]

### U′3 — канон поставки (#4, #6, #3) — ✅ закрыта 2026-08-21 02:59 +03:00

- [x] 1. **#4:** пункт `owner-voice` в задании адаптации, стоит ДО `goal-plan` (первого
      owner-текста прохода): портрет ставится с ignore-решением ТЕМ ЖЕ шагом (публичный репо +
      цитатоносный портрет = публикация личного письма владельца), «портрета нет» фиксируется
      канонической английской строкой `no voice portrait` в AGENT_GUIDE проекта (класс маркеров
      `DONE`/`[TESTED]`). Чекпоинт ИСПОЛНЯЕТ гейт (доктрина bug 17/34): портрет на диске ИЛИ
      запись — иначе отказ. Наблюдалось: s01/S6 — отказ голой галочки, обе ветки контракта
      зелёные; Reference §7.2 несёт пункт.
- [x] 2. **#6:** секция Languages payload переписана: вопрос-роутер «does the OWNER read this?» +
      таблица аудиторий (мета-планы эпиков, `MASTER_PLAN`/`STATUS`, `interviews/`+`homeworks/`,
      README/ноты/чат — сторона владельца; разведка и executor-шаги — английский) + две границы
      (промоушен переписывает · разведка остаётся EN). Кириллическая цитата владельца поймана
      СОБСТВЕННЫМ валидатором (§9.11) и перефразирована переводом. Зеркало обвязки: корневой
      AGENT_GUIDE несёт тот же вопрос-роутер поверх послойного разреза истока. Наблюдалось:
      s01/S6 — три ассерта по развёрнутому AGENT_GUIDE.
- [x] 3. **#3:** строка слота в пункте `placeholders` называет БУДУЩЕГО члена охвата гейта —
      `.kaif/spheres/<sphere>.md — YOUR declared library joins this list the moment you run
      \`sphere <name>\`» (аннотация появляется, только пока сфера не объявлена И слот жив в
      библиотеках; на update-дороге сфера объявлена — аннотации нет по построению). Вариант 1
      issue («список полный») при честной оговорке: имя члена известно, момент вступления назван.
      Наблюдалось: s01/S6 — регэксп-ассерт по сгенерированному заданию.
- **Гейт U′3:** ✅ [TESTED: 2026-08-21 · красный доказан против до-фиксного dist (9 красных
  s01/S6: пункта нет, роутинг директорийный, аннотации нет); после пересборки — сборка чистая
  (§9.11 зелёный после перефраза), «all 14 suites green», counters 50 зеркал OK; фикстуры
  owner-voice добавлены в динамические циклы s04/S13 и s07/T8+T8b]

### U′4 — исток: слепок и релиз-ритуал (#20 + 98.1/98.2)

- [ ] 1. **#20:** довести начатое `790554c` — прогон `node tools/stylometry-snapshot.mjs` с
      разделом 0 зелёный, слепок `AUTHOR_STYLOMETRY.md` несёт шесть запретов владельца; красный
      на спане чинится по конфигу, не ослаблением приёмки.
- [ ] 2. **98.1:** шаг контрольной сборки `/release` называет РЕАЛЬНЫЕ команды; **98.2:**
      опубликованное тело релиза сверяется с файлом нот механически (страж, доказан красным).
- **Гейт U′4:** слепок пересобран зелёным; страж 98.2 красный на подмене тела.

### U′5 — заморозка восьми пакетов и закрытие эпика (№56/№57; 92.2–92.5)

- [ ] 1. Объявление заморозки по формуле №56 в README обеих половин + в поставке; пакеты
      остаются в бандле, НЕ удаляются.
- [ ] 2. Оси стражей: статус «frozen» поимённо; гейты видят перетасовку (92.3), выпотрошенную
      локализацию (92.4), потерю пакета (92.5); триггеры не голым счётом (92.2).
- [ ] 3. Таблица исходов: 9 issues × исход · взятые R2-вхождения × исход (критерии 1–2, счёт
      грепом); черновики ответов в issues — секцией сюда.
- [ ] 4. Замер лесов (не выросли — №75), лёгкий судья эпика, уроки в `EXPERIENCE.md`
      (с полем механизации), «Решения без владельца»; **детализация фазы W — нулёвкой W0**.
- **Гейт U′5 = критерии эпика 1–6 зелёные.**

## Риски

- **Топ-1: правки машинерии ломают живой парк на 2.2.** Лечение: каждый механизм — свод, красный
  на сломанной версии; песочные прогоны до боевых; `test:core` на закрытии фаз.
- **Топ-2: правка контура ломает страницу владельца.** Лечение: полный `verify-contour` в живом
  браузере (критерий 4) + новый страж-кейс; эталон пересматривается глазами.
- **Топ-3: crash-safety разрастётся.** Лечение: стоит последним пунктом U′2 с явным правом
  выноса решением владельца (прецедент — Топ-1 `plans/73`).
- **Топ-4: внешние ответы в issues.** Только `send-outbound` + слово владельца; черновики копятся
  в плане.

## Решения, принятые агентом без владельца

1. **U′ оформлен СВОИМ планом, а не правкой `plans/73`** — тот наследуется скоупом 2.4 целиком;
   двойное редактирование сделало бы его историю нечитаемой (append-only дух №55).
2. **Порядок фаз: контуры → машинерия → канон → исток → заморозка** — первым чинится то, что
   теряет слова владельца прямо сейчас (#19 — его штатный способ отвечать); заморозка последней,
   потому что трогает витрину, которую судят стражи, обновлённые предыдущими фазами.
3. **Твин #19 в истоке чинится в U′1 вместе с payload-контрактом** — класс закрывается разом по
   всем носителям (BUG_FIXING: инвентарь класса, не экземпляр).
4. **U′2 п. 7: форма crash-safety — журнал + `resume`, не staging + атомарный swap** — выбор,
   который план 73 явно делегировал чтению `cmdUpdate`: записи интерливлены с классификацией,
   а атомарного мульти-свопа файлов на Windows нет; `resume` восстанавливает из уже
   существующего pre-update бэкапа вместо второй копии дерева (Оккам).
5. **U′2 п. 4: «известный набор» кодов `--lang` = полный ISO 639-1**, не список пакетов —
   иначе отказ убил бы спроектированный честный путь «настоящий код без пакета → English-first
   с честной строкой» (дизайн `logPackHonesty`); отравленные маркеры прошлой эпохи ловятся на
   всех трёх точках наследования с именем лечащего флага.
6. **U′2 п. 3: `dieSoft` только для ПОСТ-сетевых отказов**, а не для всего `die` — жёсткий
   выход до сети безопасен и мгновенен; конверсия всего мира растила бы blast radius без
   выгоды. Осознанная узость: die внутри `parseBundle` после сетевого fetch (малформный бандл
   в `diff --source`) оставлен жёстким — экзотика, названа здесь, чтобы не считаться пропуском.
7. **99.3 исполнен зеркалом**: лоадер получил ДОСЛОВНО тот отказ, который `cmdUpdate` уже несёт
   (`unknown channel: … — known: release | main`) — одно поведение, две двери, ноль новых форм.

## Черновики ответов в issues (U′2; отправка — ТОЛЬКО `send-outbound` со словом владельца)

**→ issue #16 (проводка package.json):**

> Fixed for the upcoming 2.3 (Subjected KAIF). The wiring now SPLICES only what it adds into
> your package.json's own text — indentation, key order, compact one-line values and even a
> missing final newline survive byte-exact, and the log line keeps its promise of an additive
> edit. A shape the splicer cannot PROVE itself on (parsed result minus the additions must
> deep-equal the original) falls back to the full re-serialize and then says so out loud:
> `(file re-serialized — its shape was not splice-safe; whitespace-only diffs outside scripts
> are expected)` — your option 2, kept for the fallback only. Your expected check now lives in
> the permanent polygon: a hand-formatted manifest of exactly your field shape passes install
> with one contiguous insertion (suite s01/S5a–S5b, proven red against the pre-fix machinery).
> The git-hygiene collision framing named this defect better than any diff could — thank you.

**→ issue #8 (маркер vs --mode на легаси):**

> Fixed for the upcoming 2.3, both halves. (1) An EXPLICIT `--mode standard` on the legacy
> branch now WRITES the transition: the marker gets `tracking: origin` + the origin URL and the
> run logs `⟳ marker: tracking anonymous → origin (explicit --mode standard …)` — your
> six-line repro is a polygon suite now (s04/S15) and lands green with files and marker saying
> one thing. (2) The mirror contradiction — explicit `--mode anonymous` over a tracked marker —
> REFUSES before the first write and explains why (the origin-tied skills are already on disk;
> anonymity is a fresh-deployment choice). The implicit default still inherits the marker, so
> the bug-11 semantics you quoted are untouched (guarded by S15b). Your hand-edited marker will
> reconcile cleanly: the upstream fix writes the same values mechanically.

**→ issue #4 (портрет голоса не устанавливается):**

> Fixed for the upcoming 2.3 with your proposed shape, moved one slot earlier than you suggested:
> the new `owner-voice` adaptation item stands BEFORE `goal-plan` — the first owner-facing text
> of the pass — so the deadline your report names ("before the README exists") is met by
> construction, not by hope. Both details you flagged are in: the ignore decision travels in the
> SAME step (public repo + quote-bearing portrait = published private writing), and the "owner
> has none" branch records a canonical English line `no voice portrait` in the deployed
> AGENT_GUIDE so no future session re-asks. Your expected check became the checkpoint's own gate:
> `checkpoint owner-voice` REFUSES unless the portrait is on disk or the record exists — a bare
> tick attests neither (the same executing-checkpoint doctrine as `placeholders`).

**→ issue #6 (язык по директории):**

> Fixed for the upcoming 2.3 exactly along your proposal: the Languages section now routes by the
> question — does the OWNER read this? — with the audience table naming, on the owner's side,
> everything your report listed (epic meta-plans, `MASTER_PLAN.md`, `STATUS.md`, `interviews/`,
> READMEs, release notes, every chat report), and both boundaries verbatim in spirit: promotion
> rewrites, recon/executor detail stays English with its conclusions QUOTED into owner-language
> carriers. The three-lines-apart self-contradiction you caught (meta-plan as "where the owner
> sees the whole shape" vs `plans/` routed to English) is gone — the table row cites that very
> sentence. Your wholesale-rewritten local section will merge as a wording choice, as you
> predicted: the behaviour is now identical upstream.

**→ issue #3 (гейт шире списка пункта):**

> Fixed for the upcoming 2.3, your option 1: the `<BUILD_COMMAND>` row of the placeholders item
> now names the sphere library as exactly what it is — a member that JOINS the gate's scope the
> moment you run `sphere <name>` (at task-generation time the sphere is not yet declared, so the
> row names the future member instead of guessing a name). When the build command IS detectable,
> the machinery already fills the sphere cell like every other file, and no row appears at all.
> The residual risk your report named — a list that omits a member teaching sessions to distrust
> the task's other lists — is the sentence this fix was built from.

**→ issue #10 (полевой отчёт KAGO):**

> The two secondary observations are fixed for the upcoming 2.3: a bare
> `github.com/<owner>/<repo>` passed as `--source` now resolves to
> `<repo>/releases/latest/download` with the resolution announced in the log; a failed download
> names the EXPECTED `--source` forms instead of only the URL it invented; and the libuv
> assertion is gone — probed on the same Node v24 win32 pair you reported: the crash reproduced
> 5/5 before the fix (draining the response body alone does NOT clear it), 0/3 after switching
> post-network refusals to a soft failure that lets the event loop drain (~300 ms). The main
> course of your report — the preview naming the module per Δ and treating snapshot-adaptive
> modules as `kept`, per your `bugs/KAIF/04` — is scheduled for the 2.4 field epic. The praise
> section reached the bug-33 policy's author; those refusals now also guard `--channel` in the
> loader.

## Links

`ideas/24` § «Сокращение скоупа» (№77, состав) · `plans/73` (родитель-эпик U, остаток — 2.4) ·
issues origin #19 · #15 · #16 · #8 · #10 · #3 · #4 · #6 · #20 · `plans/76` (эпик X — правило
формы действует на правки канона здесь) · `bugs/92`–`94`, `98`, `99` (взятые семейства) ·
`MASTER_PLAN.md` §7 (№56/№57/№77/№78) · `plans/75` (фаза W — принимает заявления U′).
