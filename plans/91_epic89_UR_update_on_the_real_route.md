# План 91 — эпик UR «Обновление на реальном маршруте»: репетиция на bootstrap, заполнения плейсхолдеров, окно старых версий, доставка тикета, текст навыка обновления

> **Создан:** ≈ 2026-09-05 16:23 +03:00 (закрытие эпика OQ, канон N+1 — №43).
> **Родитель:** `plans/89` (эпик UR; якоря — критерии приёмки 4 «[UR — репетиция на bootstrap]»,
> 5 «[UR — заполнения]», 6 «[UR — старые строки версии]», 7 «[UR — доставка тикета]», 8 «[UR —
> текст навыка обновления]»; строка таблицы эпиков № 2).
> **Статус:** ✅ **ЭПИК UR ЗАКРЫТ 2026-09-05 17:46 +03:00** (сессия 55, лёгкий судья VERIFIED WITH
> CAVEATS, 0 REFUTED — таблица в § «Судья эпика»); вехи: UR0 16:53 · UR1–UR6 закрыты одним коммитом
> `882db80` (build 469) · UR7 17:46; запланирован ≈ 2026-09-05 16:23 +03:00; входы — `researches/26` §2/§3
> (заявления #42 ×3 · #48 · #44 · #40 · #41 сверены с HEAD 2.5), `ideas/28` пп. 17–21, 23, суд RL 2.5
> (своды E-H3/C-H3). **Вовне:** машинерия `framework/installer/KAIF-CORE.mjs` и `KAIF-LOADER.mjs`,
> навык `/kaif-update` обоих слоёв, новый свод полигона `s21`, пункты `POLICY_CHANGES_BY_VERSION['2.6']`
> / `TEMPLATE_NOTES_BY_VERSION['2.6']`, `KAIF_REFERENCE.md` §10; ответы в issues #40/#42/#44/#48 —
> после релиза 2.6 (№84/№92).

## Вектор цели (Achieve)

**Боль** (источники — `plans/89` «Боль» (в)/(г), `researches/26` §2, четыре проекта поля за сутки
после релиза 2.5): заглавная симметрия 2.5 — «репетиция связывает бой» — неисполнима на
bootstrap-маршруте, который канон рекомендует локализованным деревьям (`--rehearsal` знает только
`update`; загрузчик пишет ядро ДО отказа на неизвестном флаге — дерево остаётся version-skewed;
`diff --source` и `update` считают разные наборы кандидатов) — три проекта заплатили за это одним
днём (#42 ×3); файлы, отличающиеся от шаблона ТОЛЬКО заполнением плейсхолдеров, каждый интервал
идут в ручной мердж и депрекацию, а `update-verify` считает плейсхолдер-строки «обещанными» (#48
R2/R3); окно `stale-claims` шириной в одну версию прячет бейдж, отставший раньше, навсегда (#44);
`report` отвергает `not yet` в нижнем регистре и доставленный вручную тикет `#NN` одним сообщением
без формы (#40); текст `/kaif-update` называет bootstrap «опцией» там, где для дерева с якорными
парами под ядром < 2.5 он обязателен (#41 R1), не несёт baseline старого шаблона на bootstrap (#41
wish 3) и не говорит про `--source` для обоих прогонов и `core.longpaths` (#41 R9).

**Где хотим оказаться.** Репетиция доступна и связывает бой на ОБОИХ маршрутах; неизвестный флаг
отвергается загрузчиком до записи ядра; `diff --source` и `update` печатают одно число кандидатов;
заполнения плейсхолдеров персистятся, и «шаблон + заполнения» = нетронутый файл (механическая
замена и депрекация без рук); «upstream changed it» судится шаблон против шаблона; `stale-claims`
видит любую версию старше устанавливаемой; `report` принимает обе законные формы строки доставки и
называет их в отказе; `/kaif-update` обоих слоёв говорит четыре формулировки поля. Каждый фикс —
ассерт свода полигона, красный на ядре 2.5 (копия через шов `KAIF_DIST`, прецедент `s20`).

## Готово, когда (критерии приёмки — сценариями; якоря `plans/89` 4–8)

1. **[UR — репетиция на bootstrap]** (= `plans/89` критерий 4)
   - Ситуация. Локализованное развёртывание 2.5 (`--lang ru`) с распиской репетиции из песочной
     копии `<copy>/.kaif/last-update.json` (3 вердикта `frozen`/`merged`).
   - Действие. `node KAIF-LOADER.mjs --lang ru --rehearsal <copy>/.kaif/last-update.json`.
   - Результат. Лог печатает `rehearsal verdicts loaded from <copy>/… (3 file(s))`; после
     обновления файла `.kaif/update-rehearsal.json` на диске нет; на неизвестном флаге
     (`--rehearsa`) загрузчик отказывает ДО записи ядра — `.kaif/kaif-core.mjs` побайтно прежний;
     `diff --source` и `update` печатают одно и то же число кандидатов.
   - Проверка. `npm run test:core` → `all 21 suites green` — новый свод `s21-update-route.mjs` несёт
     по ассерту на каждый из четырёх пунктов и на ядре 2.5 (`KAIF_DIST=<копия HEAD до UR1>`)
     печатает `✖` по каждому.

2. **[UR — заполнения]** (= `plans/89` критерий 5)
   - Ситуация. Развёртывание 2.5, где `/autoloop` отличается от шаблона только заполнением
     `<BUILD_COMMAND>` = `npm run build` и `<TEST_HARNESS>` = `npm test`.
   - Действие. Обновление до сборки 2.6 (`node .kaif/kaif-core.mjs update --source <dist>`).
   - Результат. Задание НЕ содержит `/autoloop` в `merge-modules`; навык заменён механически с
     сохранёнными заполнениями (`grep -c "npm run build" .claude/skills/autoloop/SKILL.md` → `1`);
     депрекация такого файла выполнена машинерией; `update-verify` не печатает «promised upstream
     line not found» на плейсхолдер-строках; модуль, чей шаблон не менялся между версиями, не
     называется «upstream changed it».
   - Проверка. `npm run test:core` → `all 21 suites green` — ассерт свода `s21`
     `fills: /autoloop kept out of merge-modules`; на ядре 2.5 тот же ассерт печатает `✖`.

3. **[UR — старые строки версии]** (= `plans/89` критерий 6)
   - Ситуация. README проекта на 2.5 с бейджем `Framework-KAIF%202.2` в строке 22.
   - Действие. `node .kaif/kaif-core.mjs diff --source <релиз 2.6>`.
   - Результат. Пункт `stale-claims` задания называет `README.md:22` и версию `2.2`.
   - Проверка. `grep -c "README.md:22" KAIF_UPDATE_TASK.md` → `1` в своде `s21`; `grep -c "const gt
     = " framework/installer/KAIF-CORE.mjs` → `1` (дубли `:760`/`:891` сняты в одну функцию
     модульной области).

4. **[UR — доставка тикета]** (= `plans/89` критерий 7)
   - Ситуация. Тикет со строкой `**Delivered upstream:** not yet — awaiting delivery` (нижний
     регистр) и второй тикет со строкой `**Delivered upstream:** delivered by hand — origin #37`
     без URL.
   - Действие. `node .kaif/kaif-core.mjs report <тикет> --dry-run` на каждом.
   - Результат. Первый — dry-run проходит (не отказ); второй — `already delivered … #37`; отказ на
     нераспознанной строке называет обе законные формы и точную правку.
   - Проверка. `npm run test:core` → `all 21 suites green` — свод `s17-report.mjs` дополнен тремя
     ассертами (`not yet` в нижнем регистре · `#NN` = доставлено · отказ называет обе формы); на
     ядре 2.5 каждый печатает `✖`.

5. **[UR — текст навыка обновления]** (= `plans/89` критерий 8)
   - Ситуация. `framework/skills/kaif-update/SKILL.md` и `.claude/skills/kaif-update/SKILL.md` на
     HEAD после шага UR5.
   - Действие. `grep -c "bootstrap" framework/skills/kaif-update/SKILL.md` и греп четырёх
     формулировок: `MANDATORY`/`ОБЯЗАТЕЛЕН` для дерева с якорными парами под ядром < 2.5 · `cp` расписки
     песочницы в `.kaif/update-rehearsal.json` как штатный ход интервала из версии < 2.5 · ассеты
     скачать один раз и отдать `--source` обоим прогонам · `git config core.longpaths true` в
     рецепте песочницы на Windows.
   - Результат. Каждый греп → `≥ 1` в обоих слоях; задание bootstrap-маршрута несёт baseline
     старого шаблона (модуль, отсутствующий на диске, показывает `−`/`+`, а не одни `+`).
   - Проверка. Четыре грепа по обоим слоям; свод `s21` — ассерт baseline на bootstrap; своды E-H3
     (`language-arrivals` на bootstrap) и C-H3 (формула таймаута `report`) из суда RL 2.5 зелёные.

6. **[судья эпика]**
   - Ситуация. Шаги UR1–UR6 закрыты.
   - Действие. `/fable-judge` по заявлениям критериев 1–5 (переисполнение строк «Проверка»).
   - Результат. Вердикт VERIFIED или VERIFIED WITH CAVEATS без REFUTED; таблица вердиктов — в этом
     плане; план CB — `plans/92` (канон N+1).
   - Проверка. Секция «Судья эпика» ниже с цитатой вердикта; `ls plans/92_*` → 1 файл.

## Шаги

- [x] **UR0 — нулёвка актуализации входов (№76) — ✅ 2026-09-05 16:53 +03:00 (сессия 55).** Сверено
      против HEAD `cb42039` (ядро 2.5, build 467; после OQ2 якоря сдвинулись на одну строку): `--rehearsal`
      только у `update` (`COMMANDS` `:3306`; флаги `install` `:3305` — `--bundle --lang --mode --agents
      --baseline --force`) · `consumeRehearsal` только в `cmdUpdate` (`:1691`, тело `:1738`) · bootstrap
      зовёт `loadRehearsal` без consume (`:2315`) · `KAIF-LOADER.mjs:99–105` — passthrough фильтрует
      только `--channel/--source`, ядро записано в `.kaif/kaif-core.mjs` на `:90–92` ДО передачи руля ·
      фильтр `stale-claims` `:828` · `vnum`/`gt` дважды (`:759–760` в `newsInterval`, `:890–891` в
      `policyInterval`) · `cmdReport`: `lineRe` `:2792`, URL-примета `:2796`, `/NOT YET/` `:2798` · слоты
      манифеста: `persistValues(values)` `:1660` (update) и `:2461` (install), `detectValues` `:434` —
      восемь слотов идентичности, `<BUILD_COMMAND>`/`<TEST_HARNESS>` только при `scripts.build/test`, иначе
      слот остаётся литералом и заполняется рукой · `update-verify` «promised upstream line» `:2140` ·
      набор кандидатов `cmdDiff` `:3116–3128` против `classifyAndApply` `:1398`: разница ровно в
      `OWNER_SEEDED` (`MASTER_PLAN.md` — кандидат превью, не обновления: 16 vs 15 из #42) ·
      `mergeModules` `:1266` «carries local edits AND upstream changed it» судит `sha(newM) ≠
      oldE.sha256`, где ОБА заполнены значениями — дрейф при исцелении `<PROJECT_NAME>` командой
      `project-name` (#48 R3) · `/kaif-update` оба слоя побайтно равны (89 строк), шаги 2–3 без четырёх
      формулировок · номер свода — `s21` (якоря `plans/89` критериев 4–6 поправлены) · E-H3/C-H3 —
      `ideas/28` п. 7 (U6в: `language-arrivals` на bootstrap кодом доказан, сводом не наблюдён; C-H3:
      таймаут `gh auth status` → exit 2 «not ready», формула Reference «таймаут = exit 3» верна лишь
      для `issue create`). Тикеты #40/#41/#42/#44/#48 прочитаны целиком с комментариями (три
      подтверждения #42 — NDim/Unliminium/KUMM; поправка автора #44: `cmpVer` в поставке нет, есть
      дважды объявленный `gt`). Новый тикет **#50** (16:46 +03:00, поведение агента на развилках) —
      вне UR: зарегистрирован эпиком FK в `plans/89` по слову владельца в чате («берем его тоже в 2.6
      версию»). Проектные решения по каждому шагу — § «Решения» 1–7.
- [x] **UR1 — репетиция на bootstrap (критерий 1, #42 ×3) — ✅ 2026-09-05 (сессия 55).** `install`
      принимает `--rehearsal` (`COMMANDS`; тот же `loadRehearsal` + `consumeRehearsal` перед
      `clearUpdateJournal` bootstrap-ветки; свежая установка с флагом — отказ «нечего репетировать»);
      `KAIF-LOADER.mjs` валидирует флаги ДО скачивания по константе `INSTALL_FLAGS` (зеркало
      `COMMANDS.install.flags` без `--bundle`; пара стережётся гардом 10 `check-framework` — красный
      доказан мутацией копии загрузчика); один предикат `wholesaleCandidatePath` у `diff --source` и
      `classifyAndApply` (owner-документы — не кандидаты превью). Свод `s21` A1–A4 зелёные (41/41);
      на HEAD-сборке `cb42039` через `KAIF_DIST`/`KAIF_LOADER` красные A1 ×3, A2, A3 ×3 — ровно по
      предсказаниям; половина A4 «документ владельца не кандидат» на HEAD зелёная в фикстуре
      (каверза — см. § «Решения» 8).
- [x] **UR2 — заполнения плейсхолдеров (критерий 2, #48 R2/R3) — ✅ 2026-09-05 (сессия 55).**
      Заполнения ВЫВОДЯТСЯ с диска (`matchFills`/`deriveFills`/`unfill`: шаблон как паттерн, слот
      литеральный на диске — литерал паттерна, захват без `<`/`>`, помодульно, против СТАРЫХ текстов
      шаблона первым делом), кэш — `fills` манифеста; «нетронут по модулю заполнений» на уровне файла
      (`classifyAndApply`), модуля (`mergeModules`) и депрекации (`handleDeprecations`); замена
      несёт заполнения в новый шаблон; `update-verify` судит обещанные строки с учётом заполнений;
      модуль, равный новому заполненному шаблону, пункта не рождает (#48 R3); аудит `diff` без
      источника — тоже с учётом заполнений. Свод `s21` B1–B6 зелёные, на HEAD все шесть красные;
      сосед `s11` U1/U1s — граница «слот заполнен машинерией ↔ пункт placeholders» (решение 9).
      Первая редакция выучила мусор из литеральных слотов и сопоставляла только с новым шаблоном —
      поймано полигоном на первом прогоне (EXP-0112).
- [x] **UR3 — окно старых строк версии (критерий 3, #44) — ✅ 2026-09-05 (сессия 55).** `stale-claims`
      судит любой токен `\d+.\d+` строго старше устанавливаемой версии (`%20` → пробел; скобка после
      `]` — цель ссылки, не атрибуция; строка со версией старее заменяемой несёт `(asserts X.Y)`);
      `vnum`/`gt` — одно объявление модульной области; текст пункта — «an OLD version (older than
      <to>)». Свод `s21` C1/C2 зелёные, на HEAD красные (бейдж невидим; `gt` дважды); изъятия (цитата,
      датированная строка) — как прежде, шум не вырос (C1 третий ассерт).
- [x] **UR4 — доставка тикета (критерий 4, #40) — ✅ 2026-09-05 (сессия 55).** `report` читает
      контракт `Delivered upstream:` абзацем; `not yet` в любом регистре — недоставлено и побеждает;
      URL или `#NN` в абзаце — доставлено (идемпотентно); отказ называет обе законные формы и правку.
      `s17` +4 ассерта UR4 (+1 C-H3: зависший `gh auth status` → exit 2 «not ready», режим шима
      `hang-auth`); шов `KAIF_DIST` добавлен в `s17`; на HEAD четыре ассерта UR4 красные, C-H3 зелёный
      на обеих (правилась формула Reference, не код).
- [x] **UR5 — текст `/kaif-update` обоих слоёв + baseline на bootstrap (критерий 5, #41) — ✅
      2026-09-05 (сессия 55).** Четыре формулировки в шагах 2–3 (MANDATORY для якорных пар под ядром
      < 2.5 · `--rehearsal` на строке загрузчика и `cp` как эквивалент · `gh release download` один раз
      + `--source <dir>` обоим прогонам · `git config core.longpaths true`); копия обвязки побайтно
      равна поставке; на bootstrap с выжившим манифестом ядро подтягивает синтетический baseline СТАРОЙ
      версии ради текстов (`buildSyntheticBaseline(legacyOld, 'texts')`, `--baseline` — тот же
      переключатель) — дифф отсутствующего модуля несёт старый шаблон контекстом, не одни `+` (`s21` D1;
      на HEAD красный); E-H3 — `s21` D2 (`language-arrivals` на bootstrap, зелёный на обеих —
      покрытие); C-H3 — `s17`.
- [x] **UR6 — сборка, полигон 21, документы — ✅ 2026-09-05 (сессия 55).** `POLICY_CHANGES_BY_VERSION['2.6']`
      и `TEMPLATE_NOTES_BY_VERSION['2.6']` — по пункту про обновление (без «спросите владельца» — `s20`
      стережёт текст); `KAIF_REFERENCE` §10.1/§10.2/§10.3/§10.7/§10.8; внешняя и внутренняя карты
      (`s01–s21`); `sandbox-suite.mjs` — `s21` в `SUITES` и шапке; зеркала счётчика сводов 20 → 21
      (README EN/RU, STATUS ×2, AGENT_GUIDE) — `counters-guard` зелёный (50 зеркал); черновики ответов
      #40/#41/#42/#44/#48 — секцией ниже; `npm run test:core` → **`all 21 suites green`**;
      `doc-header-lint` 0 находок; урок — EXP-0112.
- [x] **UR7 — лёгкий судья эпика (критерий 6) — ✅ 2026-09-05 17:46 +03:00 (сессия 55).** Таблица
      вердиктов ниже (VERIFIED WITH CAVEATS, 0 REFUTED); следующий эпик по слову владельца — FK, не CB:
      `plans/92` написан по канону N+1; строка в `plans/89` «Веха».

## Верификация наблюдением

Каждый критерий — своей строкой «Проверка»; общий гейт — `node tools/build-framework.mjs` EXIT 0 и
`npm run test:core` `all 21 suites green`; каждый новый ассерт наблюдён КРАСНЫМ на копии ядра 2.5
через шов `KAIF_DIST` (прецедент `s20-delivery.mjs`); машинерия — только с `[TESTED]` по
`TESTING_FRAMEWORK.md`; полевой отчёт — после обновления любого соседнего развёртывания на 2.6
(критерий «Контур обновления, Verified in use ☑» в `SYSTEMS_REGISTRY.md`).

## Риски (ярусы Мёрфи)

- **(а) Загрузчик валидирует флаги по списку, которого у него нет до скачивания ядра.** Защита:
  список флагов `install` — константа загрузчика, сверяемая свод-ассертом с `COMMANDS` ядра (пара
  истина↔зеркало в реестре пар); расхождение краснит полигон.
- **(а) Персистенция заполнений меняет схему манифеста (v2).** Защита: поле опциональное, старый
  манифест без него читается как прежде (миграция при первом обновлении заполняет из диска только
  там, где `sha(template + fills)` совпал); свод на старом манифесте.
- **(б) Окно `stale-claims` «любая старше» шумит на версиях в примерах и истории.** Защита:
  существующий маркер оправдания (2.4, #19), замер на README полигона до включения; окно —
  константа.
- **(б) `/not yet/i` ловит прозу «not yet clear» в теле тикета.** Защита: примета только на строке
  `**Delivered upstream:**`, как и сейчас.
- **(в) Полевой отчёт по 2.6 придёт после релиза** — клетка Verified in use контура обновления
  переключается по нему, не по своду.

## Решения, принятые агентом без владельца

1. **UR2 — заполнения ВЫВОДЯТСЯ с диска, а не записываются чекпоинтом** (#48 wish 2 предлагал
   запись при `placeholders`): значение слота снимается сопоставлением «шаблон как регулярное
   выражение» — каждый незаполненный слот шаблона становится группой захвата одной строки, повтор
   того же слота — обратной ссылкой; доказательство «нетронут по модулю заполнений» — точное
   равенство `sha(unfill(диск, fills)) == sha старого шаблона`: ложноположительное невозможно по
   построению, ложноотрицательное — безопасная сторона (файл остаётся «диверджен», как в 2.5).
   Выведенные заполнения персистятся в манифест ключом `fills` как кэш; отсутствие ключа = вывести
   заново (старый манифест читается как прежде). Оккам: ни нового шага чекпоинта, ни вопроса агенту.
2. **UR2 — «upstream changed it» судится сначала равенством диска НОВОМУ заполненному шаблону**
   (диск == `fill(newM, fills)` → пункта нет — ровно случай #48 R3, где модуль идентичности уже
   нёс каноническое имя), а не «сырой шаблон против сырого шаблона»: сырых текстов старого шаблона
   манифест не хранит, а `project-name` исцеляет и `values` манифеста — старые значения не
   восстановить; граница названа в Reference §10.2 и здесь.
3. **UR1 — список флагов `install` ЖИВЁТ в загрузчике константой** (`INSTALL_FLAGS`): загрузчик
   обязан отказать ДО скачивания ядра, а ядра у него в этот момент нет; пара «константа загрузчика ↔
   `COMMANDS.install.flags` ядра (без `--bundle`, его подставляет сам загрузчик)» стережётся
   `check-framework` на каждой сборке (гард 10, красный доказан мутацией), а не полигоном.
4. **UR3 — окно `stale-claims` = любой токен `\d+.\d+` строго старше устанавливаемой версии** при
   прочих изъятиях как есть; примета смежности строится по НАЙДЕННОМУ токену, не по `fromVersion`;
   текст пункта — «assert an OLD version (older than <to>)».
5. **UR4 — контракт `Delivered upstream:` читается АБЗАЦЕМ** (строка плюс продолжения до пустой
   строки или следующего `**поля**`): перенос на 100 колонок (#40, тикет 16 поля) — законная
   форма, не отказ; `#NN` в абзаце = доставлено; отказ называет обе законные формы и правку.
6. **UR5 — baseline на bootstrap = синтетический baseline СТАРОЙ версии только ради ТЕКСТОВ**
   (`templateTexts`) поверх выжившего манифеста: модули и sha — из манифеста, старые тексты — из
   артефакта релиза; недоступность артефакта деградирует к рендеру 2.5 (одни `+`) и не блокирует;
   переключатель — тот же `--baseline <dir|url>`.
7. **C-H3 — правится ФОРМУЛА, не код:** таймаут `gh auth status` — честный «not ready» (exit 2:
   ничего не отправлено, дубля быть не может); «OUTCOME UNKNOWN, exit 3» — только для `issue
   create`; s17 получает ассерт на оба ответа.
8. **Каверза красного доказательства A4 (один предикат кандидатов) — записана, не спрятана.** Половина
   «документ владельца не кандидат превью» на HEAD-сборке зелёная: старое ядро в фикстуре (ru-развёртывание,
   MASTER_PLAN переведён целиком, входящий шаблон без кириллицы) не доходит до вердикта по
   `MASTER_PLAN.md` — три диагностических прогона с логом в копии HEAD-ядра показали печать ДО первого
   `continue` и тишину после при всех трёх условиях истинных; причина не найдена, время ограничено.
   Полевое «16 vs 15» (#42) не воспроизведено. Предикат `wholesaleCandidatePath` оставлен как
   DRY-правка (один набор тестов вместо двух фильтров) с зелёным ассертом-регрессией «наборы равны» на
   обеих сборках; судья эпика (UR7) читает это как каверзу критерия 1, не как REFUTED.
9. **Сосед `s11` U1 переписан, а не подогнан (EXP-0022):** его прежний T1b-контракт («пункт placeholders
   называет РЕАЛЬНЫЙ адрес слота — файл объявленной сферы») сужен новой семантикой заполнений — слот,
   заполненный рукой в каноне и навыках, машинерия заполняет и в объявленной сфере (пункта нет, потому
   что заполнять нечего); контракт T1b живёт в новом U1s, где слот не заполнен НИГДЕ. Решение
   агента: заполнить библиотеку сферы значением, которым владелец заполнил всё остальное, — ровно то,
   что велел бы пункт placeholders; выдуманных значений нет (только выведенные с диска).
10. **Шапка страницы контура — по слову владельца, класс «вкус».** `header { position: static }` и баннер
    к верху; слово 2026-09-05 ≈ 17:30 +03:00 со страницы интервью №024. `/owner-reviews` липкость не
    канонизировал — правится только инструмент истока; дефолт будущего генератора (эпик IC).

## Черновики ответов в issues origin (отправка — ПОСЛЕ релиза 2.6, по тикету, без вычитки; №84/№92/№93)

Форма — прецедент `plans/90` и слово владельца №92: итог первым, без внутренней кухни; тикет
закрывается тем же комментарием (№93), полевой отчёт — квитанцией (№94). Каждый текст — EN, как
сами тикеты. Числа сводов — из вывода полигона на момент отправки.

**#42 (improvement request, NDim + Unliminium + KUMM):**

> Fixed in KAIF 2.6. `--rehearsal <receipt>` is accepted by `install` now, so the bootstrap line the
> canon recommends for translated deployments takes the sandbox receipt directly:
> `node KAIF-LOADER.mjs --lang ru --rehearsal <copy>/.kaif/last-update.json`. The loader validates
> every flag BEFORE it downloads anything — an unknown flag is refused with nothing fetched and
> nothing written, so a tree can no longer be left with a new core under an old marker. The auto
> record `.kaif/update-rehearsal.json` is consumed on the bootstrap route as well. `diff --source`
> and `update` judge candidates by ONE predicate (owner-seeded documents such as `MASTER_PLAN.md` are
> excluded from both), so the rehearsal file and the receipt count the same files. Your `cp` route
> keeps working and is named in `/kaif-update` as the equivalent where the flag cannot be passed;
> the skill also carries "download the assets once, hand `--source <dir>` to both runs" and the
> Windows `core.longpaths` note. Guarded by polygon suite `s21` — red on the 2.5 core exactly as you
> reported (`unknown flag for install: --rehearsal`; the record surviving; 16 vs 15). Three
> confirmations in one day made this the second epic of 2.6 — thank you.

**#44 (bug, NDim):**

> Fixed in KAIF 2.6. `stale-claims` flags any version token strictly OLDER than the version being
> installed, not only the one being replaced; every existing exemption (`KAIF-VERSION-OK`,
> blockquotes, dated rows, parenthesized attributions, `PROJECT_HISTORY*`, template-identical
> files) stays exactly as it was, and a line stuck on an earlier version names it
> (`README.md:22 — … (asserts 2.2)`). Your own correction landed too: the two-part compare `gt`
> is one module-scope definition now. Polygon `s21` C1/C2 — red on 2.5 (the badge line invisible;
> `gt` declared twice).

**#40 (bug, KAGO):**

> Fixed in KAIF 2.6. `report` reads the `Delivered upstream:` contract as a PARAGRAPH (the line
> plus its wrapped continuations), accepts `not yet` in any case, treats a URL or `#NN` anywhere in
> it as delivered (idempotent — no duplicate issue), and a refusal names both legal forms and the
> exact edit. Polygon `s17` — red on 2.5 for all three shapes you listed.

**#48 (field report, KUMM) — квитанция + закрытие:**

> Thank you for the report — received and worked into KAIF 2.6. Wish 1 (#42) — fixed there. Wish 2
> (R2/R3) — fixed: hand-filled slots are DERIVED from the disk (no new checkpoint, nothing to
> record by hand) — a file equal to "template + fills" is untouched, replaced mechanically with the
> fills kept, retired mechanically when deprecated; `update-verify` judges promised lines with the
> fills folded in (no more "unmerged?" on `<BUILD_COMMAND>` lines); a module already equal to the
> incoming template is no longer "upstream changed it" (R3). Wish 3 — the flag route above; the
> `cp` route stays documented as the equivalent. Wish 4 (the language-pack pointer) and the `@fork`
> doc nit — epic CB of 2.6. Wish 5 (positive) — kept as is. Closing with this quittance.

**#41 (field report, KAGO) — квитанция + закрытие:**

> Thank you — worked into KAIF 2.6: wish 1 — `/kaif-update` says the bootstrap route is MANDATORY
> for a tree with anchored pairs under a deployed core older than 2.5; wish 2 — #40 fixed; wish 3 —
> the bootstrap task renders `−`/`+` from the OLD template texts (fetched from the previous
> release's own artifact; `--baseline <dir>` offline); wish 5 — `core.longpaths` in the sandbox
> recipe; wish 4 (`@fork` in the linter sentence, the language-mix heuristic) — epic CB; R8 (the
> body of #23) — epic HY, by the owner's word. Closing with this quittance.

## Судья эпика

**Лёгкий судья (№48/№88) — 2026-09-05 17:46 +03:00, сессия 55; судья и исполнитель — одна сессия
(названо как каверза формы). Метод — переисполнение строк «Проверка» критериев 1–5, не чтение
диффа. Вердикт: VERIFIED WITH CAVEATS, 0 REFUTED.**

| Критерий | Заявление | Переисполнено | Вердикт |
|---|---|---|---|
| 1 репетиция на bootstrap | `all 21 suites green`; `s21` по ассерту на четыре пункта, `✖` на ядре 2.5 | `npm run test:core` → `✅ sandbox suite: all 21 suites green` (лог `polygon-final.log`); `s21` 41/41; шов `KAIF_DIST`/`KAIF_LOADER` = копия `cb42039` → 20/41 `✖`: A1 ×3 · A2 · A3 ×3 красные | **VERIFIED WITH CAVEAT** — половина A4 «документ владельца не кандидат превью» зелёная на обеих сборках: старое ядро в фикстуре до вердикта по `MASTER_PLAN.md` не доходит, причина не найдена за три диагностических прогона (§ «Решения» 8); полевое 16 vs 15 не воспроизведено; предикат — DRY-правка с ассертом-регрессией «наборы равны» |
| 2 заполнения | ассерт `fills: /autoloop kept out of merge-modules` зелёный, `✖` на 2.5 | `s21` B1–B6 зелёные (лог признан «(2): <BUILD_COMMAND>, <TEST_HARNESS>»; `/autoloop` вне задания, `(fills kept)`; `/dayloop` retired; update-verify без «promised … <BUILD_COMMAND>»; `fills` в манифесте; модуль идентичности без пункта); на HEAD все шесть `✖` | **VERIFIED WITH CAVEATS** — (а) вывод заполнений из СТАРЫХ текстов требует артефакта предыдущего релиза (сеть или `--baseline`); без него учат только модули, не менявшиеся апстримом — безопасная сторона, но у проекта с изменившимися всеми носителями слота заполнения не выучатся до следующего интервала; (б) сосед `s11` U1 переписан под новую семантику, прежний контракт T1b сохранён в U1s (§ «Решения» 9); (в) первая редакция выучила мусор — поймано полигоном, не судьёй (EXP-0112) |
| 3 старые строки версии | `grep -c "README.md:22"` → 1; `const gt = ` один раз | `s21` C1: `README.md:22 — … (asserts 2.2)` в пункте, `README.md:23` назван, цитата/датированная — изъятия; `grep -c '^const gt = '` → 1, локальных 0; на HEAD C1/C2 `✖` | **VERIFIED WITH CAVEAT** — шум окна замерен только на фикстуре (четыре строки), не на живом README поля; попутно два правила, которых план не предвидел (`%20` → пробел; скобка после `]` — цель ссылки), оба оплачены полигоном, оба — про сам полевой бейдж #44 |
| 4 доставка тикета | `s17` +3 ассерта, `✖` на 2.5 | `s17` 32/32 зелёный; шов `KAIF_DIST` (добавлен этим эпиком) → 4/4 новых ассерта `✖` на HEAD; C-H3 зелёный на обеих (формула Reference) | **VERIFIED** — оговорка формы: `#NN` признаётся доставкой только при отсутствии `not yet` в абзаце («not yet — see #15» остаётся недоставленным) — записано в коде и Reference §10.7 |
| 5 текст `/kaif-update` + baseline | четыре грепа `≥ 1` в обоих слоях; baseline на bootstrap; E-H3/C-H3 | грепы: MANDATORY 3 · `update-rehearsal.json` (cp) 2 · `BOTH runs` 1 · `core.longpaths true` 1 — в обоих слоях, копии побайтно равны; `s21` D1 — контекст старого шаблона ≥ 5 строк, `+` ≤ 3 (на HEAD `✖`); D2 `language-arrivals` на bootstrap — зелёный на обеих (покрытие, как и предсказано); C-H3 — `s17` | **VERIFIED** |
| 6 судья | таблица здесь; `ls plans/92_*` → 1 | эта таблица; `plans/92_epic89_FK_confusion_is_a_research_trigger.md` написан 17:46 (эпик FK по слову владельца — вперёд CB) | **VERIFIED** |

**Охоты судьи по KAIF-блоку:** ослабленных проверок нет (ни один ассерт соседей не удалён — s11 U1
сужен с сохранением контракта в U1s и объяснением в коде и здесь); ложного `[TESTED]` нет (маркеры
на `matchFills`, `s21`, `s17` цитируют наблюдённые прогоны с числами); развилок без `FORK:` с
ценой — нет (проектные решения 1–10 записаны, владельца не касаются); строка доставки — `DELIVERY:
systems 9 · complete 86 % (31 of 36) · integrated 100 % (7 of 7) · holes 0 · contradictions 0 ·
bugs 23` (2026-09-05 17:46 +03:00, `npm run kaif:delivery`; не сдвинулась — контур обновления получил
свод, клетка «Verified in use» ждёт полевого обновления на 2.6); вопросов владельцу в очереди —
0 (интервью №024 отвечено 17:32). Каверзы формы: судья = исполнитель; полевой отчёт по 2.6 придёт
после релиза — до него `ON-REAL-PATH: NOT YET` у всех новых стражей.

## Links

`plans/89` (критерии 4–8, эпик UR) · `researches/26` §2/§3 (заявления, сверенные с HEAD 2.5) ·
`ideas/28` пп. 17–21, 23 · issues #40 #41 #42 #44 #48 · `plans/90` (OQ; шов `KAIF_DIST` в `s20`) ·
`bugs/97` (семейство U — поставка и обновление) · `framework/installer/KAIF-CORE.mjs` ·
`framework/installer/KAIF-LOADER.mjs` · `framework/skills/kaif-update/SKILL.md` ·
`tools/sandbox/s17-report.mjs` · `tools/sandbox/s18-update-symmetries.mjs`.
