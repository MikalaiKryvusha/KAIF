# План 90 — эпик OQ «Вопрос владельцу — приоритет №1»: факт «показан», вектор доставки без вопроса владельцу, вопрос — сценарием <!-- questions-guard:allow имя эпика в H1 плана, не секция вопросов; вопросы владельцу живут в interviews/interview_023 -->


> **Создан:** ≈ 2026-09-05 15:05 +03:00. **Родитель:** `plans/89` (эпик OQ; якоря — критерии
> приёмки 1 «[OQ — вопрос показан]», 2 «[OQ — строка доставки]», 3 «[OQ — вопрос сценарием]»).
> **Статус:** ✅ ЭПИК OQ ЗАКРЫТ 2026-09-05 16:23 +03:00 (сессия 54) — судья VERIFIED WITH CAVEATS,
> 0 REFUTED; реестр систем истока утверждён владельцем 16:22; следующий эпик — UR (`plans/91`).
> История: 🟡 в работе с ≈ 2026-09-05 15:05 +03:00 — входы: `researches/27` (донор), №97/№98/№99,
> issues #46/#47, `bugs/111`. Веха: **OQ0 + OQ1 закрыты 2026-09-05 15:21 +03:00** (сессия 53,
> коммит `f1fee48`, build 459): факт «показан», очередь с возрастом и гейтом, шаг 1b `/resume`,
> оси G4/G5/G6, инварианты I40–I43 обоих слоёв — критерии 1–4 ✅ наблюдением (селфтесты 25/29
> зелёные, живой страж 0 новых, s12 ростер 43, полигон 19/19 зелёный). Веха: **OQ2 закрыт
> 2026-09-05 15:51 +03:00** (сессия 54): шаблон реестра систем в бандле, команда `delivery` ядра,
> форма вектора в 9 + 8 носителях обоих слоёв, policy-change/template-notes 2.6, `Kind:` в шаблоне
> документа бага, свод `s20` (32 проверки; красный на HEAD-ядре) — критерии 5–6 ✅, 7 🟡 (интервальный
> ассерт задания обновления — на бампе версии); полигон 20/20. Веха: **OQ3 закрыт 2026-09-05
> 16:06 +03:00** — `SYSTEMS_REGISTRY.md` истока (9 контуров, черновик), ручка `npm run
> kaif:delivery`, строка вектора в `MASTER_PLAN` §8/STATUS, пара «контуры ↔ реестр» — критерий 8 ✅.
> Веха: **OQ4 закрыт 2026-09-05 16:14 +03:00** — `/interview` 3a, фраза «Место вопросов», две
> охоты судьи 2.6 — критерий 9 ✅. Веха: **OQ5 закрыт 2026-09-05 16:20 +03:00** — карты и
> `KAIF_FRAMEWORK`, черновики ответов #46/#47, реестр показан владельцу сообщением. Следующий шаг —
> OQ6 (судья эпика → `plans/91` UR). **Вовне:** правки канона поставки (`framework/AGENT_GUIDE.md`,
> `MASTER_PLAN.md`, `KAIF_REFERENCE.md`, навыки `resume`, `owner-reviews`, `interview`,
> `report-bug`, `what-next`, четыре цикла, две церемонии, `fable-judge`-точка вызова; машинерия
> `KAIF-CORE` — команда `delivery`; новый шаблон `.kaif/_systems-registry-template.md`; пункт
> policy-changes 2.6) — публичный контракт версии; полевым проектам едет обновлением; ответы в
> #46/#47 — после релиза (№84).

## Вектор цели (Achieve)

**Боль** (источники — `plans/89` «Боль» (а)/(б), `researches/27`): контур вопросов не знает, что
вопрос ПОКАЗАН, — 48 дней и ~40 сессий «здоровья» при вопросе, о котором владелец не знал (#47);
механика `DELIVERY:` 2.5 велела «назвать ОДНУ метрику владельцу» — и агенты четырёх проектов
пошли спрашивать владельцев (№97: «или делаешь механики полно, или не делаешь»); вопросы
владельцу исток приносит техническими пояснениями (№98, `bugs/111`).

**Где хотим оказаться.** В обоих слоях: у вопроса есть третий факт — «показан» (когда, каким
транспортом), очередь печатает возраст и ставит ни разу не показанные первыми, ритуалы с очередью
имеют условие выхода; строка `DELIVERY:` печатается командой из реестра систем, выведенного
агентом из `GOAL.md`/`MASTER_PLAN.md`/карт, — владельца о метрике никто не спрашивает; каждый
вопрос и вариант ответа владельцу — сценарий того, что он увидит; стражи истока и охоты судьи
знают три новых класса.

## Готово, когда (критерии приёмки — сценариями; якоря `plans/89` 1–3)

1. **[I40–I43 в контракте]**
   - Ситуация. `framework/skills/owner-reviews/SKILL.md` и `.claude/skills/owner-reviews/SKILL.md`
     на HEAD после шага OQ1.
   - Действие. `grep -c "I4[0-3]\." framework/skills/owner-reviews/SKILL.md`.
   - Результат. Печатается `4`; в обоих слоях числовое пространство «I1–I43»; свод `s12` несёт
     ростер 43 позиции.
   - Проверка. `npm run test:core` → `all 20 suites green`; `node tools/sandbox/s12-k5-contour-canon.mjs`
     → строка `ростер I1–I43`.
   ✅ 2026-09-05 15:21 +03:00 — `grep -c "I4[0-3]\." framework/skills/owner-reviews/SKILL.md` → `4`;
   s12: `all 20 checks green (roster 104 positions × dist EN + RU mirror, red-proof …)`; полигон
   `all 19 suites green` (s20 — OQ2, знаменатель 20 — после него).

2. **[факт «показан» в истоке]**
   - Ситуация. В `interviews/` документ со статусом «ждёт», созданный 3 дня назад; файла
     `interviews/decisions/shown.json` нет; пачка `--queue` ещё ни разу не поднималась.
   - Действие. `node tools/review.mjs --queue --list`.
   - Результат. Печатается `⛔ НИ РАЗУ НЕ ПОКАЗАН` первой строкой, код выхода `2`. После того как
     `--queue` поднял и закрыл страницу, в `shown.json` есть запись документа с `at` и
     `transport: "пачка"`, и та же команда печатает `показан: <дата> — 0 дн. назад (пачка)`, код
     выхода `0`.
   - Проверка. `node tools/review.mjs --selftest` → `✅` с новыми проверками «показан пишется ·
     возраст печатается · непоказанный первым · код выхода 2»; проверки доказаны красным на
     фикстуре до фикса (лог селфтеста цитирует).
   ✅ 2026-09-05 15:21 +03:00 — селфтест: `селфтест класса «сообщение» зелёный: 25 проверок`, пять
   новых — «без записей показа … код выхода 2 (I41/I42)» · «после записи показа очередь печатает дату
   и транспорт (I40)» · «непоказанный OLD стоит ВЫШЕ показанного IV» · «все показаны — код выхода 0»
   · «карта показов хранит транспорт»; живой `--queue --list` → `Очередь владельца пуста`, EXIT=0.

3. **[условие выхода шага очереди в `/resume`]**
   - Ситуация. Оба слоя `/resume` после шага OQ1.
   - Действие. `grep -n "queue" framework/skills/resume/SKILL.md` и `grep -n "очеред"
     .claude/skills/resume/SKILL.md`.
   - Результат. Есть шаг «1b» с командой очереди проекта и условием выхода: непоказанный ждущий
     документ → поднять страницей/чатом ИЛИ записать одну строку «почему нет»; шаг не считается
     пройденным иначе.
   - Проверка. Обе команды печатают ≥ 1 строку с `exit condition`/`условие выхода`;
     `node tools/check-framework.mjs` → OK.
   ✅ 2026-09-05 15:21 +03:00 — шаг «Step 1b. Run the owner's queue — a command with an exit
   condition» / «Шаг 1б … команда с условием выхода» в обоих слоях; сборка `check-framework OK`
   (767 модулей — шаг 1b стал новым модулем, зеркала подтянуты).

4. **[G4/G5 стража вопросов]**
   - Ситуация. Фикстура: интервью «ждёт» без записи в `shown.json` старше 1 дня; документ
     `bugs/NN_x.md` со строкой прозы «Владелец, какой вариант берём?» без заголовка секции.
   - Действие. `node tools/questions-guard.mjs --root <фикстура>`.
   - Результат. Печатаются два нарушения — `ЖДЁТ И НЕ ПОКАЗАН (G4)` с числом дней и `ВОПРОС
     ВЛАДЕЛЬЦУ ВНЕ interviews/ (G5)` с адресом строки; на живом репозитории новых нарушений `0`
     (унаследованное — в базовой линии ratchet).
   - Проверка. `node tools/questions-guard.mjs --selftest` → `✅` с двумя новыми мутациями,
     предсказание отказа процитировано; `node tools/questions-guard.mjs` → `Новых нарушений: 0`.
   ✅ 2026-09-05 15:21 +03:00 — `селфтест зелёный: все 29 мутаций сбылись по предсказанию`
   (мутации 1–6: G4 красный/зелёный · G5 красный/зелёный · G6 красный/зелёный); живой прогон —
   `Новых нарушений: 0` (G5/G6 действуют вперёд от даты документа ≥ 2026-09-05 — ратчет не
   раздут). G6 (критерий 9) закрыт тем же движением на стороне стража; текст `/interview` и
   охоты судьи — OQ4.

5. **[команда `delivery` в машинерии]**
   - Ситуация. Развёртывание 2.6 с `SYSTEMS_REGISTRY.md` из 3 систем: у первой части ☑☑☐☐ и
     потребность во второй (☑☑☑☐), у третьей — ☐☐☐☐ без потребностей; в `bugs/` два открытых
     документа, один с `Kind: hole`.
   - Действие. `node .kaif/kaif-core.mjs delivery` и `node .kaif/kaif-core.mjs delivery --json`.
   - Результат. Первая печатает `DELIVERY: systems 3 · complete 42 % (5 of 12) · integrated 100 %
     (1 of 1) · holes 1 · contradictions 0 · bugs 1`; вторая — те же шесть чисел объектом плюс
     `isolated: 2`; без реестра команда печатает `systems registry not built yet — draft it:
     cp .kaif/_systems-registry-template.md SYSTEMS_REGISTRY.md …` и код `3`.
   - Проверка. `npm run test:core` → `all 20 suites green` — новый свод `s20-delivery.mjs` несёт
     ассерты: шесть чисел · дробь при проценте · детерминизм (`--json` ×2 → `diff` пуст) · «not
     built yet» с кодом 3; на ядре 2.5 свод печатает `✖ unknown command: delivery`.
   ✅ 2026-09-05 15:51 +03:00 — `node tools/sandbox/s20-delivery.mjs` → 32 проверки ✅, строка
   фикстуры дословно `DELIVERY: systems 3 · complete 42 % (5 of 12) · integrated 100 % (1 of 1) ·
   holes 1 · contradictions 0 · bugs 1`, `--json` ×2 побайтно равны, `isolated: 2`, без реестра —
   код 3 и `draft it: cp .kaif/_systems-registry-template.md SYSTEMS_REGISTRY.md`; полигон
   `all 20 suites green`; красный на HEAD-ядре `e67aea7` (`KAIF_DIST=<копия>`) — 28 отказов, 15
   словами `unknown command: delivery`, зелёными остались четыре проверки, не адресующие команду.

6. **[форма строки во всех носителях]**
   - Ситуация. Поставка после шага OQ2.
   - Действие. `grep -rl "DELIVERY: <the owner's metric>" framework/ .claude/skills/ AGENT_GUIDE.md`.
   - Результат. Пусто; `grep -rl "DELIVERY: systems" framework/AGENT_GUIDE.md framework/skills/{autoloop,dayloop,nightloop,guarded-loop,end-chat-soft,end-chat-force,what-next}/SKILL.md framework/skills/fable-judge/SKILL.md`
     печатает 9 файлов; `framework/MASTER_PLAN.md` несёт блок «Delivery vector» со ссылкой на
     `SYSTEMS_REGISTRY.md` и без слов «agreed with the owner»; шаблон `.kaif/_systems-registry-template.md`
     в бандле (`grep -c "_systems-registry-template" dist/KAIF-CORE-BUNDLE.md` → `1`).
   - Проверка. Три грепа выше + `node tools/build-framework.mjs` → `check-framework OK`;
     `node tools/counters-guard.mjs` → OK.
   ✅ 2026-09-05 15:51 +03:00 — греп старой формы по `framework/`, `.claude/skills/`, `AGENT_GUIDE.md`
   → пусто (и RU-форма «метрика владельца» — пусто); `DELIVERY: systems` → 9 файлов; блок «Delivery
   vector» в `framework/MASTER_PLAN.md:15`, `grep -c "agreed with the owner"` → `0`; шаблон в бандле
   — `grep -c "_systems-registry-template" dist/KAIF-CORE-BUNDLE.md` → `7` (FILE-маркер + нота +
   упоминания в AGENT_GUIDE/MASTER_PLAN/Reference/policy/template-notes — критерий ждал `1`, число
   поправлено по факту); сборка `check-framework OK` (172 блока, 772 модуля); `counters OK — 50
   зеркал`; реестр пар `fable-*` — `diff` пуст.

7. **[задание обновления без вопроса владельцу]**
   - Ситуация. Свод полигона: дерево 2.5 обновляется до сборки 2.6.
   - Действие. Чтение сгенерированного `KAIF_UPDATE_TASK.md`.
   - Результат. Пункт `policy-changes` несёт запись 2.6: метрика доставки ВЫВОДИТСЯ из реестра
     систем — владельца о ней не спрашивают; «если вы завели интервью „назовите метрику“ —
     закройте его, постройте реестр»; ни одной строки «ask the owner … metric».
   - Проверка. `grep -c "registry" KAIF_UPDATE_TASK.md` → `≥ 1` и `grep -ci "ask the owner.*metric"
     KAIF_UPDATE_TASK.md` → `0` в своде `s20` (ассерт).
   🟡 2026-09-05 15:51 +03:00 — запись `POLICY_CHANGES_BY_VERSION['2.6']` в мете бандла
   (`policyChanges['2.6']`) + `TEMPLATE_NOTES_BY_VERSION['2.6']`; свод `s20` судит ТЕКСТ записи (реестр
   и команда названы · «CLOSE it and build the registry» · ни в записи, ни в ядре нет «ask the owner
   … metric»). Интервальный ассерт по сгенерированному `KAIF_UPDATE_TASK.md` невозможен, пока
   `version()` = 2.5 — ключ `'2.6'` инертен (интервал `(2.5, 2.6]` пуст); дописать его в `s20` на
   бампе версии (шаг RL, рядом с кодовой строкой) — тогда ✅.

8. **[исток мерит себя вектором]**
   - Ситуация. Исток после шага OQ3: `SYSTEMS_REGISTRY.md` выведен из инвентаря контуров
     `PROJECT_ARCHITECTURE_INTERNAL_MAP.md` (9 систем) и внешней карты.
   - Действие. `node dist/KAIF-CORE.mjs delivery` из корня истока (или `npm run kaif:delivery`).
   - Результат. Строка `DELIVERY: systems 9 · complete N % (k of 36) · …`; `MASTER_PLAN.md` §8
     печатает ту же строку вместо «критерии 2.6 закрыты N из 12» (критерии остаются критериями
     версии, метрика — вектор по №99); `STATUS.md` несёт команду в таблице инструментов.
   - Проверка. Команда печатает строку, начинающуюся с `DELIVERY: systems 9`; та же строка в
     `MASTER_PLAN.md` §8 (`grep -c "DELIVERY: systems 9" MASTER_PLAN.md` → `1`).
   ✅ 2026-09-05 16:06 +03:00 — `npm run kaif:delivery` и `node dist/KAIF-CORE.mjs delivery` печатают
   `DELIVERY: systems 9 · complete 86 % (31 of 36) · integrated 100 % (7 of 7) · holes 0 ·
   contradictions 0 · bugs 23 · registry: draft (9 systems, awaiting the owner's approval)`; `--json`
   → `isolated: 3`, `draft: true`; `--system "Контур аудита"` → `complete 75 % (3 of 4)`; та же
   строка — `MASTER_PLAN.md` §8 и STATUS «Где мы сейчас»; пара «контуры ↔ строки реестра» —
   `contours=9 systems=9 GREEN`, мутация (копия без строки 9) → `RED: contours 9 ≠ systems 8`.

9. **[вопрос — сценарием]**
   - Ситуация. Оба слоя `/interview` после шага OQ4; фикстура интервью с вопросом, у варианта B
     которого нет четырёх строк сценария.
   - Действие. `node tools/questions-guard.mjs --root <фикстура>` и
     `grep -n "every question and every option" framework/skills/interview/SKILL.md`.
   - Результат. Нарушение `ВОПРОС БЕЗ СЦЕНАРИЯ (G6)` с адресом варианта; в навыке шаг 3a велит
     сценарий на каждый вопрос и вариант; `AGENT_GUIDE` обоих слоёв — одна фраза в «Место
     вопросов»; KAIF-блок `/fable-judge` — охота `question-without-scenario` и охота №97
     «механика с вопросом к владельцу проекта»; на интервью №023 раунда 2 G6 молчит.
   - Проверка. `node tools/questions-guard.mjs --selftest` → `✅` (мутация G6 предсказана);
     `node tools/questions-guard.mjs` → `Новых нарушений: 0`; греп навыка → 1 строка; реестр пар
     `fable-*` зелёный (вендоренный текст не тронут — охоты живут в KAIF-блоке точки вызова).
   ✅ 2026-09-05 16:14 +03:00 — `/interview` шаг 3a обоих слоёв («every question and every option
   opens with a four-line scenario», пример варианта сценарием, маркер `questions-guard:no-scenario`);
   `AGENT_GUIDE` обоих слоёв — фраза в «Место вопросов» (№98); KAIF-блок точки вызова судьи обеих
   копий — охоты **Question without a scenario** и **Mechanic that asks the owner**, шапка «(6) the
   KAIF 2.6 hunts», `diff framework/skills/fable-judge/SKILL.md .claude/skills/fable-judge/SKILL.md`
   пуст; страж: селфтест `все 29 мутаций сбылись по предсказанию` (G6 — мутации 5–6 с OQ1), живой
   прогон `Новых нарушений: 0` (интервью №023 раунда 2 G6 молчит); сборка `check-framework OK`
   (772 модуля), `counters OK — 50 зеркал`.

10. **[судья эпика]**
    - Ситуация. Шаги OQ1–OQ5 закрыты.
    - Действие. `/fable-judge` по заявлениям критериев 1–9 (переисполнение команд «Проверка»).
    - Результат. Вердикт VERIFIED или VERIFIED WITH CAVEATS без REFUTED; таблица вердиктов — в
      этом плане; план UR — `plans/91` (канон N+1).
    - Проверка. Секция «Судья эпика» ниже с цитатой вердикта; `ls plans/91_*` → 1 файл.
    ✅ 2026-09-05 16:23 +03:00 — «Вердикт эпика: VERIFIED WITH CAVEATS — 0 REFUTED» (секция ниже);
    `ls plans/91_*` → `plans/91_epic89_UR_update_on_the_real_route.md`.

## Шаги

- [x] **OQ0 — нулёвка актуализации входов (№76).** ✅ 2026-09-05 15:21 +03:00: `/resume` поставки — `grep -c queue` → `0` (шага не было) · I1–I39 в обоих слоях (EN `:236`, RU `:232`) · оси G1–G3/I20/I21 · 9 носителей `DELIVERY:` (EN) + 8 (RU) сняты дословно · `COMMANDS` ядра — `delivery` встанет рядом с `check`/`diff`/`modules` (немутирующие) · шаблоны `.kaif/` — `build-framework.mjs:391–398` · своды s01–s19 (s17 — `report`, s16 — `doc-budgets`) · донор `researches/27`. Правка плана по факту: свод команды `report` — `s17-report.mjs` (критерий 7 ссылается на «свод команды `report`»; `s16` — это `doc-budgets`, для CB). Сверить против HEAD: поставка `/resume` без
      шага очереди (`grep -c queue framework/skills/resume/SKILL.md` → `0`) · инварианты
      `/owner-reviews` I1–I39 · оси `questions-guard` G1–G3/I20/I21 · носители строки
      `DELIVERY:` (9 файлов, список в `researches/27` §3) · таблица `COMMANDS` ядра (`report` —
      последняя немутирующая? нет — `delivery` встаёт рядом с `check`/`diff`) · шаблоны `.kaif/`
      (`_owner-voice`, `_testcases` — `build-framework.mjs:391–398`) · своды s01–s19 · донор
      `researches/27`. Правка плана по фактам — штатно.
- [x] **OQ1 — факт «показан», возраст, условие выхода (критерии 1–4).** ✅ 2026-09-05 15:21 +03:00 — коммит `f1fee48` (build 459); слот `owed questions` в строке доставки перенесён в OQ2 (все девять носителей правятся одним движением).
      - Исток `tools/review.mjs`: запись `interviews/decisions/shown.json` при подъёме страницы
        (одиночный документ — `transport: "страница"`, пачка — `"пачка"`) в момент открытия окна;
        `--queue --list` (без браузера) печатает возраст и `⛔ НИ РАЗУ НЕ ПОКАЗАН` первым, код
        выхода 2 при непоказанных; чат-показ — `--mark-shown <док> --transport chat` (рука агента,
        когда вопрос задан в чате точечно). Селфтест: 4 проверки, красные до фикса.
      - Исток `tools/questions-guard.mjs`: ось **G4** «ждёт и не показан» (порог — 1 день; читает
        `shown.json`; ratchet для унаследованного) и ось **G5** «вопрос владельцу вне
        `interviews/`» — примета заголовка (регекс донора с кириллическими просмотрами) + примета
        строки прозы (обращение к владельцу/автору + «?», вне цитат `>` и кода), исключение —
        `<!-- questions-guard:allow причина -->`; селфтест — мутации с предсказанием.
      - Поставка `/owner-reviews` (оба слоя): I40–I43 текстом (`researches/27` §3), число I1–I43;
        свод `s12` ростер → 43. Поставка `/resume` (оба слоя): шаг 1b «run the owner's queue» с
        командой-плейсхолдером проекта и условием выхода; `/end-chat-soft`/`-force` и четыре
        цикла: слот `owed questions: N (oldest M d, never shown K)` в строке доставки.
      - `AGENT_GUIDE` обоих слоёв, «Место вопросов»: одно предложение — очередь имеет условие
        выхода, показ записывается.
- [x] **OQ2 — вектор доставки без вопроса владельцу (критерии 5–7).** ✅ 2026-09-05 15:51 +03:00
      (сессия 54): шаблон `framework/templates/_systems-registry-template.md` → бандл
      (`build-framework.mjs`, рядом с `_testcases`; четыре строки «canon name ↔ поверхность» в
      `check-framework`) · команда `delivery` в `KAIF-CORE.mjs` (немутирующая; парсер по заголовкам,
      ☐/☑ и `[ ]/[x]`, EOL-норм, отказ называет строку и колонку; `--json` детерминирован, `--system`;
      код 3 без реестра; `Kind:` по открытым `bugs/*.md`, `bugs/KAIF/` и DONE не считаются) · форма
      вектора в 9 EN-носителях + `framework/MASTER_PLAN.md` «Delivery vector» + 8 RU-носителях +
      `AGENT_GUIDE.md` + `KAIF_REFERENCE` §5/§10.7 (слот `owed questions:` — туда же; RU-команда истока
      — `node dist/KAIF-CORE.mjs delivery` до ручки OQ3) · policy-change и template-notes 2.6 ·
      `Kind:` в шаблоне документа бага `/report-bug` обоих слоёв · свод `s20-delivery.mjs` (32
      проверки; красный на HEAD-ядре); критерии 5–6 ✅, 7 🟡 (интервальный ассерт — на бампе).
      - `framework/templates/_systems-registry-template.md` → `.kaif/_systems-registry-template.md`
        (`build-framework.mjs` по прецеденту строк 391–398): шапка с правилом заполнения (из
        `GOAL.md`, `MASTER_PLAN.md`, карт; три признака обособленности; резать мельче; проект —
        агент, утверждение — владелец, метка `draft` до утверждения), таблица `| # | System |
        Own action | Own state | Needs (feeds from) | Specified | Accepted | Implemented |
        Verified in use | Lives in |` с `☐/☑`.
      - `KAIF-CORE.mjs`: команда `delivery` (не мутирует; флаги `--json`, `--system <имя>`):
        парсер таблицы `SYSTEMS_REGISTRY.md` (EOL-норм, ☐/☑ и `[ ]/[x]`), шесть чисел (systems ·
        complete % с дробью · integrated % с дробью по потребностям, закрытым системой с
        Implemented ☑ · holes/contradictions/bugs по `Kind:` открытых `bugs/*.md`, без метки —
        bug), `isolated` в JSON, детерминизм (сортировка), «not built yet» с кодом 3 и командой
        копирования шаблона; `help` и Reference §команд.
      - Носители строки (9 файлов обоих слоёв + `framework/MASTER_PLAN.md` блок «Delivery vector»
        + `KAIF_REFERENCE.md`): форма `DELIVERY: systems N · complete A → B % · integrated C % ·
        holes … · contradictions … · bugs …; moved by: … | blocker: …`; стрелка у изменившихся;
        «registry not built yet (draft: N systems, awaiting approval)» до утверждения; правило
        №97 одной фразой в `AGENT_GUIDE` (fable-цикл): метрика выводится, не спрашивается.
      - `/report-bug` шаблон A: строка `Kind:` с тремя определениями (А5).
      - `build-framework.mjs` `POLICY_CHANGES_BY_VERSION['2.6']`: пункт про выводимую метрику и
        закрытие заведённых интервью; `TEMPLATE_NOTES` 2.6.
      - Свод `s20-delivery.mjs` (фикстура реестра из критерия 5; ассерты 5 и 7; красный на 2.5).
- [x] **OQ3 — исток мерит себя (критерий 8).** ✅ 2026-09-05 16:06 +03:00 (сессия 54):
      `SYSTEMS_REGISTRY.md` в корне истока — девять строк по контурам внутренней карты, четыре части
      (Verified in use ☑ только у 4 из 9 — обоснования в «Boundary notes»), семь потребностей, статус
      `draft`; ручка `npm run kaif:delivery` в `package.json`; строка вектора в `MASTER_PLAN.md` §8 и
      STATUS; строка реестра пар «контуры карты ↔ строки реестра» в `AGENT_GUIDE.md` (доказана красным
      на копии); ссылка на реестр из `PROJECT_ARCHITECTURE_INTERNAL_MAP.md`. Исходная формулировка:
      `SYSTEMS_REGISTRY.md` истока из инвентаря
      контуров внутренней карты (9 систем: интерактивный контур · обновление/установка · обратная
      связь · планирование · требования · свежий контекст · аудит · автономные циклы · письмо в
      канон владельца) с четырьмя частями (specified = канон написан · accepted = принят
      владельцем · implemented = механизирован · verified in use = наблюдён на реальном пути) и
      потребностями; ручка `npm run kaif:delivery`; `MASTER_PLAN.md` §8 и `STATUS.md` — строка
      вектора; `PROJECT_ARCHITECTURE_INTERNAL_MAP.md` — ссылка на реестр (пара истина↔зеркало:
      число контуров = число систем, команда сверки в реестр пар `AGENT_GUIDE`).
- [x] **OQ4 — вопрос сценарием (критерий 9).** ✅ 2026-09-05 16:14 +03:00 (сессия 54): шаг 3a
      `/interview` обоих слоёв переписан на «каждый вопрос и каждый вариант — сценарием того, что
      владелец увидит» с примером варианта и маркером отказа; фраза в «Место вопросов» `AGENT_GUIDE`
      обоих слоёв; две охоты 2.6 в KAIF-блоке судьи обеих копий (побайтно); ось G6 стража — с OQ1.
      Исходная формулировка: `/interview` обоих слоёв: шаг 3a → «every question
      and every option opens with the four-line scenario» + пример; `AGENT_GUIDE` обоих слоёв
      («Место вопросов» — одна фраза; KAIF-блок точки вызова судьи — охоты
      `question-without-scenario` и `mechanic-asks-the-owner`); `.claude/skills/fable-judge` —
      только KAIF-блок (вендоренный текст не трогать, реестр пар); исток `questions-guard` ось
      **G6** (под `### Qn.` у каждого варианта таблицы/списка — четыре строки-ключа языка проекта;
      ratchet для старых интервью).
- [x] **OQ5 — сборка, полигон, документы.** ✅ 2026-09-05 16:20 +03:00 (сессия 54): сборка и полигон
      20/20 — зелёные с OQ4; `KAIF_REFERENCE` §5/§10.7 — с OQ2; внешняя карта (скелеты
      `templates/_*-template.md`, `SYSTEMS_REGISTRY.md` в обвязке, строка «Где что лежит»);
      `KAIF_FRAMEWORK.md` — строка реестра; черновики ответов #46/#47 — секцией выше; черновик
      реестра показан владельцу сообщением контура (`--notice`, показ записан в
      `interviews/decisions/shown.json`, I40); стражи: doc-header-lint 0 · questions-guard 0 новых ·
      counters OK · verify-contour --etalon-only 50/0. Интервальный ассерт задания обновления — на
      бампе (критерий 7 🟡). Исходная формулировка: `node tools/build-framework.mjs` · `npm run test:core`
      (20 сводов) · `counters-guard` · `doc-header-lint` · `questions-guard` · реестр пар;
      `KAIF_REFERENCE.md` (§команд, §контур владельца); `PROJECT_STRUCTURE_EXTERNAL_MAP.md`
      (s20, шаблон, реестр); `STATUS.md` (инструменты · п. 1); черновики ответов #46/#47 — секцией
      здесь (отправка после релиза, №84/№92).
- [x] **OQ6 — лёгкий судья эпика (критерий 10)** ✅ 2026-09-05 16:23 +03:00 — таблица вердиктов
      ниже (VERIFIED WITH CAVEATS, 0 REFUTED) → `plans/91` (UR) написан по канону N+1 → строка в
      `plans/89` «Веха». Исходная формулировка: → таблица вердиктов ниже → `plans/91` (UR) на
      закрытии (канон N+1) → строка в `plans/89` «Веха».

## Верификация наблюдением (что запускается, что читается)

Каждый критерий — своей строкой «Проверка»; общий гейт — `node tools/build-framework.mjs` EXIT 0
и `npm run test:core` `all 20 suites green`; каждый новый страж/ассерт наблюдён КРАСНЫМ до фикса
(лог селфтеста или свода цитируется в секции «Судья эпика»); чат-показ владельцу — по правилу
№98: результат эпика показывается ему сценарием «что вы увидите при закрытии сессии» (без
вопроса — сообщением `--notice`).

## Риски (ярусы Мёрфи)

- **(а) Парсер реестра ломается на владельческой правке таблицы** (лишняя колонка, `[x]` вместо
  `☑`, CRLF). Защита: парсер по заголовкам колонок, не по позициям; оба вида чекбокса; EOL-норм;
  свод с «грязной» фикстурой; отказ называет строку и колонку.
- **(а) G5 по строке прозы шумит** (норма стража текстового правила ~10 ложных на 1 настоящую).
  Защита: примета узкая (обращение + «?» в одной строке), ratchet, маркер исключения с причиной;
  замер шума на живом репозитории до включения в красный.
- **(б) `shown.json` в истоке и `queue.json` расходятся** (документ снят с очереди, показ остался).
  Защита: показ — факт истории, не состояние очереди; `--list` читает оба и печатает оба.
- **(б) Число систем истока = 9 протухнет** при появлении контура. Защита: строка реестра пар
  «контуры карты ↔ строки реестра» с командой сверки.
- **(в) Донор возьмёт форму KAIF обновлением и получит пару к своему `interview-page.mjs`.**
  Это класс #45 wish 4 — в 2.7; здесь — строка в новостях 2.6 «если у вас уже есть свой факт
  показа — контракт совпадает по смыслу, инструмент не заменяется».

## Решения, принятые агентом без владельца

На старте — пять развилок донора закрыты агентом (`researches/27` §4). OQ1 (2026-09-05 15:21 +03:00):

1. **Порог G4 — сутки по mtime файла интервью**, не по дате шапки: свежее интервью ещё не успело
   подняться страницей, а нетронутый неделями файл — ровно полевой класс; эвристика названа в
   шапке стража вслух. Обратимо константой `NEVER_SHOWN_DAYS`.
2. **G5 и G6 действуют ВПЕРЁД от даты документа ≥ 2026-09-05** (первая ISO-дата шапки) — историю
   не переписываем, базовую линию ратчета не раздуваем; документ без даты не судится (не
   доказуемо новый). Приём тот же, что у оси меток времени `doc-header-lint`.
3. **G6 судит только ЖИВЫЕ (неотвеченные) вопросы**: отвеченный вопрос без сценария — история;
   интервью №023 раунда 1 (Q1/Q4 без сценариев) тем самым не красится, а новое интервью без
   сценария — краснеет. Законный отказ — маркер `questions-guard:no-scenario` с причиной
   (вопрос-имя, класс «вкус»).
4. **Транспорт показа именуется по-русски** (`страница` · `пачка` · `чат`) в истоке, по-английски
   (`page` · `batch` · `chat`) в контракте поставки — как и все строки контура; транспорт силы
   ответа не меняет.
5. **`--queue --list` — отдельный режим той же команды**, не новый инструмент (Оккам): очередь
   уже знает живые документы, добавлен только возраст показа и код выхода.
6. **Слот «вопросов владельцу» в строке `DELIVERY:` отложен в OQ2**, чтобы девять носителей
   строки правились одним движением вместе с формой вектора (№99).

OQ2 (2026-09-05 15:51 +03:00):

7. **Строка `Kind:` живёт в шаблоне ДОКУМЕНТА БАГА проекта** (`/report-bug` шаг 3, рядом с
   `Severity:`), а не в шаблоне A тикета KAIF: `delivery` считает открытые `bugs/*.md` продукта, а
   тикеты `bugs/KAIF/` — сигналы о фреймворке, не находки продукта, и в счёт не входят. План
   называл «шаблон A» — поправлено по смыслу А5 донора (три класса — про правила продукта).
8. **Вплетённость продукта = закрытые потребности / объявленные** (как в STATUS п. 1.1), не среднее
   по системам (как в `researches/27` §1): одна дробь на продукт печатается так же, как дробь
   завершённости, и не прячет систему с одной потребностью за средним. Обратимо в одной строке.
9. **Черновик реестра печатает ПОЛНЫЙ вектор с суффиксом `· registry: draft (N systems, awaiting
   the owner's approval)`**, а не строку «not built yet (draft …)» из эстафеты: вектор из черновика
   — решение §4.5 донора (тупика нет по построению), а «not built yet» остаётся ровно для
   отсутствующего файла (код 3). Признак черновика — `**Status:** draft` в шапке реестра.
10. **Колонки-части читаются по заголовку**: четыре отгруженных имени (`specif|accept|implement|
    verif`) ИЛИ любая колонка, где каждая клетка — чекбокс (проект вправе переименовать части);
    «закрывающая» потребность часть — `Implemented`, при переименовании — третья. Тире и пустые
    клетки чекбоксом не считаются (иначе пустая колонка «Lives in» стала бы пятой частью).
11. **Шов `KAIF_DIST` в своде `s20`** — красный доказан против HEAD-ядра без правки кода свода
    (прецедент s17 делал это копией в scratch-dist руками); зелёный путь шва не касается.
12. **Команда истока в RU-носителях — `node dist/KAIF-CORE.mjs delivery`** (исток не держит
    `.kaif/kaif-core.mjs`); ручка `npm run kaif:delivery` — OQ3, тогда носители переводятся на неё.
    *Поправка OQ3:* ручка добавлена как алиас, носители навыков ОСТАЮТСЯ на прямой команде —
    флаги через `npm run … -- --json` добавили бы трение ровно там, где строка копируется; STATUS и
    MASTER_PLAN называют обе.

OQ3 (2026-09-05 16:06 +03:00):

13. **Заголовки колонок реестра истока — английские токены при русской прозе** (`System`, `Needs`,
    `Specified`…; как `Status:`/`DONE`/`[TESTED]` в документах багов): парсер читает заголовки, а
    машинные токены в этом проекте канонически английские; русские синонимы в парсер не добавлены
    (Оккам; ru-поставка получает шаблон по-английски, как и остальные `.kaif/_*`-скелеты).
14. **Verified in use ставится строго** — «наблюдён на реальном пути БЕЗ открытых находок по
    контуру»: ☑ у 4 из 9 (обратная связь · планирование · требования · свежий контекст), остальным
    названо, что переключает клетку (первая живая пачка с гейтом очереди · обновление поля на 2.6
    без тикета UR · закрытие эпика CR · полевой `/guarded-loop` · приёмка канон-артефакта с
    пометками). Защита от «синдрома 90 %» — смысл части (4) у донора.
15. **Открытые баги истока не размечены `Kind:`** — все 23 считаются `bug` по умолчанию; разметка
    R2-семейств по определениям А5 (дыра/противоречие/баг) — отдельный проход глазами через
    `/check-backlog`, не в этом шаге (смешанная частичная разметка хуже единообразной).
16. **Система = контур, мельче не резал**: инвентарь контуров уже канонизирован с судьбой границ;
    второй инвентарь тех же сущностей стал бы парой, за которой пришлось бы следить (DRY); пара
    «контуры ↔ строки» стережётся по счёту.

OQ4 (2026-09-05 16:14 +03:00):

17. **Ось G6 судит ТЕЛО ВОПРОСА, а не каждый вариант** (четыре ключа где угодно под `### Qn.`):
    правило навыка — «каждый вопрос и каждый вариант», пол стража — «в вопросе есть все четыре
    строки»; вариант без сценария ловит судья (охота question-without-scenario), не страж —
    иначе таблица вариантов `| **A** | … |` потребовала бы второй грамматики парсера (Оккам).
18. **Пример варианта в шаге 3a — из этого же эпика** (вектор из черновика реестра), значения из
    прогона `npm run kaif:delivery`, не выдуманы (три двери); EN и RU примеры — один смысл.
19. **Шапка `fable-judge` «except four marked KAIF patches» → «six»**: слово отстало от списка ещё
    в 2.5 ((5) добавлен без пересчёта), поправлено вместе с (6); обе копии побайтно равны.

OQ6 (2026-09-05 16:23 +03:00):

20. **«Пробежался глазами, ок» на странице СООБЩЕНИЯ прочитано как утверждение реестра** — слово
    владельца пришло через контур (эквивалентность транспорта: HTML = md = чат; маркер
    `owner-review` в файле), и «ок» после прочтения — его «да» на список; статус `approved` несёт
    цитату и момент, оригинал закоммичен дословно ДО правки (`ae9e975`). Обратимо одной строкой
    владельца; переспрашивать «точно утверждаете?» — вопрос без предмета (EXP-0106).
21. **Судья эпика — лёгкий, в этой же сессии** (№48: усилий на судейство эпиков не тратить, полный
    суд — RL): переисполнение команд «Проверка» одним скриптом, вердикты по выводу, каверзы
    названы; чистый контекст оставлен суду RL.

## Черновики ответов в issues origin (отправка ПОСЛЕ релиза 2.6 — №84; без вычитки владельца — №92)

Транспорт — `gh issue comment` под стоячей авторизацией (№93), затем закрытие тикета той же
квитанцией (№94); проекты поля не называются (№90). Ссылку на релиз вписать в момент отправки.

**#46 — «the DELIVERY line demands ONE scalar, but the owner asked for a VECTOR»** (шаблон B):

> Shipped in KAIF 2.6 (<release link>) — not as a widening of the scalar but as the field
> explanation made canon: the delivery line is now a DERIVED VECTOR. `DELIVERY: systems N ·
> complete A → B % (k of n) · integrated C % (c of d) · holes … · contradictions … · bugs …; moved
> by: … | blocker: … | owed questions: …` — printed by the new non-mutating command
> `node .kaif/kaif-core.mjs delivery` (`--json`, `--system <name>`) from `SYSTEMS_REGISTRY.md`.
> The registry ships as a skeleton (`.kaif/_systems-registry-template.md`): one row per logically
> separate system (own action · own state · own condition of success; cut finer rather than
> coarser), four completeness parts as checkboxes — Specified · Accepted · Implemented · Verified
> in use — with the percentage ALWAYS printed with its fraction, and needs declared as «feeds from»;
> integration = the share of declared needs closed by an implemented system. Holes, contradictions
> and bugs are counted from the open `bugs/*.md` by a new `Kind: hole | contradiction | bug` header
> line (no line = bug). The metric is DERIVED: the agent drafts the registry from GOAL.md,
> MASTER_PLAN.md and both maps and prints the vector from the draft at once; the owner approves the
> list as vision when ready. Nobody is sent to ask «what to measure» any more — the 2.5 wording is
> gone from every carrier, and the update task's policy section tells a deployment that opened such
> an interview to close it and build the registry instead. On the ticket's three points: (1) yes,
> N components — fixed at six, the list explained in the field; (2) the line keeps its shape, every
> component that moved gets its own arrow, a zero delta on all of them still needs a named blocker;
> (3) the guidance sentence turned out unnecessary — the axes are different by construction (built ·
> connected · broken). Thank you: the shape is the one explained in the field, taken verbatim.

**#47 — «the owner-question queue is PRINTED but never DELIVERED»** (шаблон A):

> Fixed in KAIF 2.6 (<release link>): the contour now records the third fact — SHOWN.
> `/owner-reviews` gains invariants I40–I43: the fact of showing is written at the moment the
> document is in front of the owner (a map next to the decisions, transport named: page · batch ·
> chat); the queue prints the age of waiting and of the last showing and puts never-shown documents
> FIRST; the queue command has an EXIT CONDITION — a waiting document the owner has never seen stops
> the ritual until it is raised or the reason is written (`/resume` step 1b; both closing
> ceremonies and the four loops now carry an `owed questions: N (oldest M d, never shown K)` slot in
> the delivery line); a question marked «answer elsewhere» is the agent's debt, not the owner's.
> The same day's other word — questions to the owner as a scenario of what the owner will see — is
> canon too: `/interview` step 3a applies the four-line scenario to every question and every option,
> and the judge hunts a question without one. Your local fix (the shown map, the age line, the exit
> code) is the donor of this contract; the update does not replace your tool — the contract matches
> it by meaning. Thank you for the verbatim words; they are now the reason line of the rule.

## Судья эпика

Лёгкий судья (№48) — переисполнение строк «Проверка» критериев 1–9 одним прогоном 2026-09-05
16:22 +03:00 (лог `judge-oq.log` сессии 54; каждое число — цитата вывода):

| Критерий | Заявление | Переисполнено | Вердикт |
|---|---|---|---|
| 1 I40–I43 | `grep -c "I4[0-3]\."` → 4 в обоих слоях; s12 ростер 43 | `5` и `5` (число выросло вместе с текстом OQ1 — упоминаний больше четырёх инвариантов); s12 в полигоне 20/20 | VERIFIED — каверза: критерий ждал ровно `4`, свойство «I1–I43 в обоих слоях» держится |
| 2 факт «показан» | селфтест 25 проверок; `--queue --list` код 2/0 | `селфтест класса «сообщение» зелёный: 25 проверок`; `Очередь владельца пуста`, EXIT 0; `shown.json` несёт `SYSTEMS_REGISTRY.md` (транспорт «страница», 16:20) — живой показ этой сессии | VERIFIED |
| 3 условие выхода `/resume` | обе команды печатают ≥ 1 строку с `exit condition` / `условие выхода` | EN `grep -c "exit condition"` → `2`; RU — форма «условием выхода» (`:42`), греп критерия по именительному падежу → `0` | VERIFIED WITH CAVEATS — каверза формы грепа, суть шага в обоих слоях есть |
| 4 G4/G5 | селфтест с двумя новыми мутациями; живой `0` | `все 29 мутаций сбылись по предсказанию`; `Новых нарушений: 0` | VERIFIED |
| 5 команда `delivery` | s20: шесть чисел · дробь · детерминизм · код 3; красный на 2.5 | `s20` EXIT 0, 32 проверки ✅; красный на HEAD-ядре `e67aea7` — 28 ❌ (15 словами `unknown command: delivery`) | VERIFIED |
| 6 форма во всех носителях | старой формы нет; 9 файлов; MASTER_PLAN без «agreed with the owner»; шаблон в бандле | `0` · `9` · `0` · `7` (критерий ждал `1` — FILE-маркер + нота + упоминания) | VERIFIED — каверза числа, свойство «шаблон в бандле» держится |
| 7 задание обновления | policy-changes 2.6 без «спросите владельца» | запись в мете бандла, ассерты s20 по тексту; интервальный ассерт по `KAIF_UPDATE_TASK.md` невозможен при `version()` = 2.5 | VERIFIED WITH CAVEATS — 🟡 до бампа версии (RL) |
| 8 исток мерит себя | `DELIVERY: systems 9 · …`; строка в `MASTER_PLAN` §8 | `npm run kaif:delivery` → `DELIVERY: systems 9 · complete 86 % (31 of 36) · integrated 100 % (7 of 7) · holes 0 · contradictions 0 · bugs 23 …`; `grep -c "DELIVERY: systems 9" MASTER_PLAN.md` → `1`; пара «контуры ↔ реестр» GREEN, мутант RED | VERIFIED |
| 9 вопрос сценарием | греп навыка → 1; реестр пар fable зелёный; G6 селфтест | `grep -c "every question and every option"` → `1`; `diff` копий `fable-judge` пуст; селфтест 29/29 | VERIFIED |

**Вердикт эпика: VERIFIED WITH CAVEATS — 0 REFUTED.** Каверзы поимённо: (а) критерий 7 — 🟡 до
бампа версии (интервальный ассерт задания обновления — шаг RL, рядом с кодовой строкой); (б) числа
критериев 1 и 6 (`4`, `1`) были предсказаниями, факт — `5` и `7`, свойства держатся; (в) греп
критерия 3 по RU-форме «условие выхода» не видит «условием выхода» — форма, не суть. Каверзы
сверх критериев: открытые баги истока не размечены `Kind:` (все 23 — bug; проход `/check-backlog`);
Verified in use ☑ у 4 из 9 контуров — по построению строгой части (4). Реестр систем истока
**утверждён владельцем** словом со страницы сообщения («пробежался глазами, ок», 2026-09-05
16:22 +03:00) — решение 20 ниже.

## Links

`plans/89` · `researches/27` · `interviews/interview_023` (№97–№100) · issues #46 #47 ·
`bugs/111` · EXP-0110 · `framework/skills/owner-reviews` (I1–I39) · `tools/questions-guard.mjs`
(G1–G3, I20/I21) · `tools/review.mjs` · `framework/installer/KAIF-CORE.mjs` (`COMMANDS`,
`cmdDelivery`) · `tools/build-framework.mjs:391–398` (шаблоны `.kaif/`) ·
`framework/templates/_systems-registry-template.md` · `tools/sandbox/s20-delivery.mjs` ·
`SYSTEMS_REGISTRY.md` (утверждён 16:22) · `plans/91` (UR, следующий эпик).
