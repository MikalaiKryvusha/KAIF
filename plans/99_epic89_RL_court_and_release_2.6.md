# План 99 — эпик RL «Суд и релиз 2.6»: суд одним кругом, витрина одним именем, публикация по слову владельца, ответы в поле после релиза

> **Создан:** 2026-09-06 10:56 +03:00 (сессия 57; канон N+1 — №43: план последнего эпика на закрытии HY).
> **Родитель:** `plans/89` (эпик RL — строка 10 таблицы, критерии приёмки 12 «[RL — суд, витрина, релиз]» и 2 «[OQ — строка
> доставки]» 🟡 до бампа); прецедент формы — `plans/87` (RL 2.5: RL0–RL6, суд №88 — четыре судьи-субагента по кластерам +
> панель скептиков, реестр суда в `reports/KAIF_AUDIT/`); навык `/release` (шаги 0–7, гейт 6.9 — страница глазами);
> слова владельца: №96 (имя — окончательное слово ближе к релизу, рабочее Mindful KAIF), №13 (релиз — по явному «да»),
> №84/№92/№93 (ответы в issues — после релиза, по тикету, без вычитки, закрытие агентом), №97 (охота судьи «механика
> с вопросом к владельцу»), №28 (релиз без кодового имени нейтральным заголовком — легален).
> **Статус:** ✅ **ЭПИК RL ЗАКРЫТ 2026-09-06 12:51 +03:00** (сессия 57, один чат) — релиз v2.6 опубликован 2026-09-06 12:46 +03:00 по слову владельца (интервью №030 Q1 = A); суд — реестр 77 = 66·10·1, 0 блокеров; критерии версии — 15 из 15. Было: 🔲 запланирован — старт с RL0 после закрытия HY; ДВА слова владельца внутри эпика: имя версии
> (RL4, один вопрос страницей контура — сценарием, языком заказчика) и «да» на публикацию (RL5, №13).
> **Вовне:** тег `v2.6` + GitHub Release с ассетами (`latest` → 2.6) — по слову владельца в моменте; ответы в issues
> #40–#53 после релиза (№84/№92, стоячая авторизация №93 — закрытие тикетов агентом; полевые отчёты — квитанция и
> закрытие одним движением, №94); README EN/RU, ноты 2.6 EN/RU, логотип с подписью версии, README.pdf, story-card.

## Вектор цели (Achieve)

**Боль.** Версия 2.6 собрана семью эпиками за два дня (OQ · UR · FK · IC · WN · RW · VB) плюс HY; каждый судился
лёгким судьёй по №48/№88, полного суда всего скоупа не было; витрина ещё 2.5; имя версии — рабочее; четырнадцать
открытых issues поля ждут ответов «починено, приедет 2.6»; проекты-потребители ждут обновления с правилом реального
мира, голосом беседы, контуром поставкой и обновлением на реальном маршруте.

**Где хотим оказаться.** Один круг суда по всему скоупу 2.6 с 0 REFUTED-блокеров (найденное починено и пересужено);
README EN/RU и ноты 2.6 называют версию одним именем — по окончательному слову владельца — и числами сборки; логотип
подписан версией; `v2.6` опубликован по слову владельца, страница релиза прочитана глазами, `release-body-guard` зелёный;
критерии `plans/89` — 15 из 15; ответы в четырнадцать issues отправлены по тикету и тикеты закрыты; эстафета 2.7 —
`ideas/29` с нулёвкой на открытии.

## Готово, когда (критерии приёмки — сценариями; якоря `plans/89` критерии 12 и 2)

1. **[RL — суд одним кругом]**
   - Ситуация. Восемь эпиков 2.6 закрыты, каждый со своим лёгким судьёй; заявления живут в § «Судья эпика» планов 90–98.
   - Действие. Оркестратор собирает реестр заявлений (по строке на заявление: команда переисполнения · ожидаемое), делит
     на кластеры A–F, четыре судьи-субагента с чистыми контекстами переисполняют кластеры, панель скептиков из двух линз
     опровергает каждую находку (вердикт по умолчанию — «не дефект»).
   - Результат. Владелец видит в `reports/KAIF_AUDIT/2026-09-06_rl_court_2.6_registry.md` таблицу заявлений с исходами
     (VERIFIED / CAVEAT / REFUTED) и таблицу находок с судьбой; выжившие находки починены и пересужены; блокеров 0;
     сводные числа посчитаны скриптом по строкам (EXP-0107).
   - Проверка. `grep -c "REFUTED" reports/KAIF_AUDIT/2026-09-06_rl_court_2.6_registry.md` → число из сводки, блокеров —
     `0`; `npm run test:core` → `all 23 suites green`; охоты судьи 2.6 — шесть — применены (греп имён охот в реестре).
2. **[RL — витрина одним именем]**
   - Ситуация. `version.json` 2.5; README EN/RU и ноты говорят «2.5 — Experienced KAIF»; логотип подписан 2.5.
   - Действие. Агент задаёт владельцу ОДИН вопрос страницей контура — имя версии (рабочее Mindful KAIF; варианты
     сценариями, языком заказчика — без кодов эпиков, №106) — и по ответу собирает витрину.
   - Результат. Владелец видит README (обе половины) с версией `KAIF 2.6 — <имя>` без кавычек, таблицу вех 8.1 с
     новой строкой, числа сборки из вывода инструментов, ноты `reports/RELEASE_NOTES_2.6.md` EN+RU зеркально, логотип
     с подписью версии (`build-team-logo --title`), story-card, README.pdf перегенерирован.
   - Проверка. `node tools/counters-guard.mjs` OK; `node tools/showcase-lint.mjs` OK (симметрия половин, якоря
     README в нотах); `node tools/private-names-guard.mjs` OK (ноты 2.6 — в зонах); `node tools/build-team-logo.mjs
     --check` OK; `grep -c "«[A-Za-z][^»]*KAIF»" README.md reports/RELEASE_NOTES_2.6.md` → `0`.
3. **[RL — публикация по слову]**
   - Ситуация. Витрина собрана, суд закрыт, `version.json` ещё 2.5.
   - Действие. Владелец говорит «да» на публикацию (одной строкой в чате или страницей); агент исполняет `/release`
     шаги 5–7: бамп `version.json` 2.5 → 2.6, сборка, `npm run test:core`, коммит, тег `v2.6`, `gh release create`
     с ассетами из `dist/`, страница прочитана глазами (гейт 6.9).
   - Результат. Владелец видит `https://github.com/MikalaiKryvusha/KAIF/releases/tag/v2.6` с заголовком `KAIF 2.6 —
     <имя>`, телом из нот и ассетами; `latest` указывает на 2.6; `KAIF.md` в main — 2.6.
   - Проверка. `gh release view v2.6`; `node tools/release-body-guard.mjs --tag v2.6` ✅; `node tools/kaif-stats.mjs`;
     критерий 2 `plans/89` ✅ — интервальный ассерт задания обновления 2.5 → 2.6 (свод `s20`/`s21` на реальном интервале);
     строка `DELIVERY:` закрытия — `критерии приёмки 2.6 закрыты 15 из 15`.
4. **[RL — ответы в поле]**
   - Ситуация. Релиз опубликован; четырнадцать issues #40–#53 открыты; черновики ответов — в планах эпиков (`plans/91`
     § «Черновики ответов», `plans/92`–`98`).
   - Действие. Агент отправляет ответ по каждому тикету (`gh issue comment`) со ссылкой на релиз и закрывает тикеты
     (стоячая авторизация №93; полевые отчёты — квитанция + закрытие, №94); без вычитки владельцем (№92).
   - Результат. Владелец видит 0 открытых issues в origin; каждый ответ — результатом, без внутренней кухни и без кодов
     эпиков (голос беседы, №106).
   - Проверка. `gh issue list --repo MikalaiKryvusha/KAIF --state open` → пусто; `gh issue view <N> --comments` по
     выборке — ответ ссылается на `v2.6`.
5. **[судья релиза]** — `/fable-judge` на RC (шаг 4.5 `/release`) и после публикации (шаг 7); закрытие версии в
   `plans/89` (15 из 15), STATUS, летопись (`/end-chat-soft`), эстафета 2.7 — `ideas/29`.

## Шаги

- [x] **RL0 — нулёвка входов (№76) — ≈ 2026-09-06 11:00 +03:00.** Вопрос имени версии поднят ПЕРВЫМ действием эпика (интервью №029, страница контура 10:59–11:00; G8 тихий, эталон контура пересмотрен глазами — 1 / 4 / 4, 62 / 0); реестр заявлений — по § «Судья эпика» восьми планов (90–98) и критериям `plans/89`, кластеры A (OQ+UR) · B (FK+WN) · C (IC) · D (RW+VB+HY, второй угол) · F (оркестратор); черновики ответов — `plans/91` § «Черновики ответов» (#40 #42 #44 #46 #47), `plans/92` (#50), `plans/93` (#51), `plans/94` (#53), `plans/96` (#52), квитанции — #41 #43 #45 #48 #49; витрина — 8 упоминаний 2.5 в README (бейджи ×2, логотип ×2, строка версии ×2, вехи ×2), `version.json` 2.5 build 508, логотип — `build-team-logo --title`, ноты — черновик 2.6 EN/RU в скретчпаде (плейсхолдеры имени и суда). `FORK: options <четыре судьи-субагента по кластерам без workflows | workflows по №79> · price of error <суд, не покрывающий восемь эпиков за чат> · consulted <прецедент №88 (2.5) · №77 «проси, выдам» — не просил>` — без workflows, второй угол на RW/VB/HY вместо повтора лёгких судей. Замысел шага был: Заявления восьми эпиков — таблицей реестра суда (по строке: план · заявление ·
      команда переисполнения · ожидаемое); черновики ответов по тринадцати issues — где лежат (плана нет для #41/#43/#45/#48
      — квитанции); имя версии — вопрос владельцу (RL4) поднимается ПЕРВЫМ действием эпика (вопросы владельцу — приоритет
      №1), суд идёт параллельно; текущее состояние витрины (`grep -n "2\.5" README.md | wc -l`, таблица 8.1, логотип
      `assets/`); `FORK:` по форме суда (четыре субагента по кластерам без workflows — прецедент №88 | workflows по №79) —
      без workflows, если владелец не выдаст (№77: «проси, выдам»).
- [x] **RL1 — суд одним кругом (критерий 1) — 2026-09-06 11:17 +03:00.** Реестр `reports/KAIF_AUDIT/2026-09-06_rl_court_2.6_registry.md`: **77 строк = 66 CONFIRMED · 10 WEAKENED · 1 REFUTED** (A 20 = 16·4·0 · B 19 = 17·2·0 · C 11 = 8·2·1 · D 27 = 25·2·0; счёт скриптом по строкам), четыре вердикта VERIFIED WITH CAVEATS; единственное REFUTED — C7 (закрытие критерия 14 цитировало греп → 1 при реальном 0) — починено по замыслу критерия (строка запуска генератора в `/owner-reviews` обоих слоёв, греп → 1 / 1) и число поправлено честно; 17 находок судей — все механические, переисполнены оркестратором и починены до коммита (шесть правил на фикстуре #53 + точное множество в селфтесте · критерий 13 текстом по факту гарда 5d · критерий 16 «рядом с гейтами» · раннер полигона со справкой · литералы `plans/90`/`91`/`93`/`98` · живая строка `DELIVERY:` · три комментария ядра · черновик ответа #52 языком заказчика); каверзы версии — критерий 2 🟡 до бампа (RL5), браузерный QA двух лиц контура, свободный вариант интервью без сценария, метка «2.5 deployed» до бампа; сборка 177 / 784, полигон на дереве суда `all 23 suites green`, на починенном — `all 23 suites green`. Замысел шага был: Реестр заявлений → кластеры A–F → четыре судьи-субагента (read-only,
      чистые контексты) → панель скептиков (две линзы) → починка выживших → пересуд; сводка скриптом по строкам;
      реестр в `reports/KAIF_AUDIT/2026-09-06_rl_court_2.6_registry.md` (псевдонимы проектов, №90).
- [x] **RL2 — витрина (критерий 2) — 2026-09-06 12:07 +03:00.** README обеих половин скриптом (бейджи 2.6 ×2 · логотип ×2 · строки версии с датой · вехи 8.1 — строка v2.6 после v2.5; осталось ровно 2 «2.5» — строки вехи); ноты `reports/RELEASE_NOTES_2.6.md` — 10 пунктов EN и 10 RU зеркально, абзацы одной строкой, живые якоря README, пункт 10 — числа суда из реестра (77 / 66 / 10 / 1 / 17), псевдонимов доноров и кодов эпиков 0; логотип `assets/KAIF_2.6_GitHub_LOGO.{png,webp}` (`--check` ✅, холст 6311×4847 как у 2.5; показан владельцу страницей отсмотра макета до коммита — `bugs/107`); README.pdf перегенерирован после правок линта (3,5 МБ, «Mindful KAIF» ×4); линты: showcase (4 замечания починены — калька «едет поставкой» ×2, закулисье «на самом деле», неразрывный пробел «40 сессий / 48 дней») · counters · private-names (ноты 2.6 в зонах) · estimates · doc-header — зелёные; судья RC — VERIFIED WITH CAVEATS (одно опровергнутое — адресат ответа №029 «ноты 2.6» без цитаты интервью → адресат снят, страж вопросов зелёный). Каверза: карточка для соцсетей (`build-story-card`) — инструмент 2.2, ищет «Таблицу 6», которой в README нет с 2.3 (последняя карточка — 21 августа); в релиз не входит — кандидат в `ideas/29`. Замысел шага был: README EN/RU: версия, таблица вех 8.1, числа из сборки, ссылки; ноты 2.6 EN+RU
      (симметрично, якоря README сняты с живой страницы — EXP-0108; правило @fork фразой линтера — из CB → в 2.7,
      здесь только если дёшево); логотип `build-team-logo.mjs --title "KAIF 2.6 — <имя>"` (после RL4); story-card;
      `readme-pdf`; линты витрины.
- [x] **RL3 — черновики ответов в issues #40–#53 — 2026-09-06 11:21 +03:00.** Четырнадцать текстов (EN, как тикеты) сведены ниже из планов 90–94/96 и квитанций; поправлены по решению №105 (пункты, уехавшие с CB в 2.7, названы отложенными словом владельца) и по находке суда D-F3 (#52 — языком результата); отправка — после публикации, по тикету, `<release link>` — в момент отправки. Замысел шага был: Свести из планов эпиков в § «Черновики ответов» этого плана
      (языком результата, без кодов эпиков и внутренней кухни — №92/№106); квитанции для полевых отчётов.
- [x] **RL4 — имя версии (слово владельца №96) — 2026-09-06 11:59 +03:00.** Интервью №029 (первое действие эпика, 10:59) → Q1 = A 11:57: **Mindful KAIF** (№107); заголовок релиза `KAIF 2.6 — Mindful KAIF`; имя разнесено: README обеих половин (бейджи, логотип, строка версии, таблица вех 8.1 — скриптом), `reports/RELEASE_NOTES_2.6.md` (EN+RU зеркально, одной строкой на абзац), логотип `assets/KAIF_2.6_GitHub_LOGO.{png,webp}` (`build-team-logo --title`, `--check` ✅), `version.json` — на бампе RL5. Замысел шага был: Один вопрос страницей контура: варианты имён на «M» (Mindful KAIF —
      рабочее; ещё два кандидата) сценариями «что вы увидите в заголовке релиза и README»; ответ — в `MASTER_PLAN` §7,
      `version.json` (codename), витрина. Заголовок без кавычек (канон идентичности).
- [x] **RL5 — публикация (критерий 3, слово владельца №13) — 2026-09-06 12:46 +03:00.** Публикация — по ответу интервью №030, Q2 = A (12:42, «Да — публиковать сейчас»). Слово владельца — интервью №030 Q1 = A; бамп 2.5 → 2.6 (`version.json` · `.kaif/kaif.json` · `KAIF_FRAMEWORK.md`), сборка с нотами 2.6, полигон на бампе — `all 23 suites green` (интервальный ассерт задания обновления 2.5 → 2.6 — критерий 2 ✅), стражи зелёные, коммит `release: 2.6`, тег `v2.6`, `gh release create` с заголовком `KAIF 2.6 — Mindful KAIF`, телом из нот и шестью ассетами; `release-body-guard --tag v2.6` ✅; **ассеты перевыложены 2026-09-06 13:34 +03:00** с починкой контура (`bugs/113`; слово владельца: «выложить сейчас, на этом выпуск 2.6 и будет закончен»; бандл на релизе побайтно равен `dist/`); страница релиза — https://github.com/MikalaiKryvusha/KAIF/releases/tag/v2.6; `latest` → 2.6. Замысел шага был: Слово владельца — интервью №030: раунд 1 (интервью №030, Q1 = C, 12:36) — четыре вопроса («Заставка нарисована? Релиз ноутсы написаны? README обновлен под новую версию? Все доделано по 2.6…»), отвечены раундом 2 (Q2) живыми ссылками; публикация — по ответу Q2. `/release` шаги 0–7: предпроверка · README · PDF ·
      контрольная сборка · judge-проход RC · коммит · «да» владельца · бамп версии · тег · `gh release create` с ассетами ·
      гейт 6.9 (страница глазами) · `release-body-guard` · `kaif-stats`.
- [x] **RL6 — ответы в поле и закрытие версии (критерии 4, 5) — 2026-09-06 12:51 +03:00.** 14 ответов отправлены по тикетам (`gh issue comment`, стоячая авторизация №93; полевые отчёты — квитанцией, №94), тикеты закрыты, открытых issues origin — 0; `plans/89` критерии 2 и 12 ✅ — 15 из 15; MASTER_PLAN §5 веха 2.6 ✅; `ideas/28` — реестр 2.6 закрыт, `ideas/29` — эстафета 2.7 (открывается словом владельца). Замысел шага был: Отправка ответов и закрытие тринадцати issues (№93/№94);
      `plans/89` критерии 2 и 12 ✅ — 15 из 15; `ideas/28` — закрытие реестра 2.6; `ideas/29` — эстафета 2.7; STATUS;
      `/end-chat-soft` с летописью.

## Верификация наблюдением

`npm run test:core` зелёный на RC и на опубликованной сборке · реестр суда с 0 блокеров · `counters-guard` · `showcase-lint`
· `private-names-guard` · `release-body-guard --tag v2.6` · `gh release view v2.6` · `gh issue list --state open` → пусто ·
`doc-header-lint` 0 · `verify-contour --etalon-only` (после RL4 — новый живой документ → `--write-etalon` глазами).

## Риски (ярусы Мёрфи)

- **(а) Суд без workflows не покрывает восемь эпиков за один чат.** Защита: реестр заявлений — только заявления судей
  эпиков (уже переисполненные однажды) + каверзы; кластеры по подсистемам; просить workflows точечно (№77).
- **(а) Имя версии задерживает витрину.** Защита: RL4 — первое действие эпика; витрина собирается с рабочим именем и
  перенабирается по слову (логотип — последним).
- **(б) Интервальный ассерт задания обновления 2.5 → 2.6 (критерий 2) падает на реальном интервале.** Защита: свод
  на реальном релизе 2.5 (`git show v2.5:dist/*`) до бампа; каверза IC «синтетический старый релиз» закрывается здесь.
- **(б) Ответы в issues с кодами эпиков.** Защита: черновики — языком результата; ось G8 не судит issues — судья RL
  читает каждый черновик глазами (охота «owner text in agent vocabulary»).
- **(в) Флейк полигона `bugs/109`.** Защита: `run-fail-N.log`; повтор прогона — не «зелёный по памяти».

## Решения, принятые агентом без владельца

1. (при написании плана) Порядок внутри эпика: вопрос имени — первым (приоритет №1), суд параллельно; публикация —
   только после «да».
2. Правка `@fork` во фразе нот (часть CB, → 2.7) в 2.6 не делается; ноты 2.6 называют линтер той фразой, что и он сам,
   без нового правила.

## Черновики ответов в полевые issues (RL3; отправка — ПОСЛЕ релиза, по тикету, без вычитки — №84/№92; закрытие тем же комментарием — №93; полевые отчёты — квитанцией — №94; проекты не называются — №90; язык — EN, как тикеты; `<release link>` — в момент отправки)

**#40 (bug):**

> Fixed in KAIF 2.6 (<release link>). `report` reads the `Delivered upstream:` contract as a PARAGRAPH (the line plus its wrapped continuations), accepts `not yet` in any case, treats a URL or `#NN` anywhere in it as delivered (idempotent — no duplicate issue), and a refusal names both legal forms and the exact edit. Guarded by the polygon (suite `s17`) — red on the 2.5 core for all three shapes you listed. Closing with this comment.

**#42 (improvement request, three projects in one day):**

> Fixed in KAIF 2.6 (<release link>). `--rehearsal <receipt>` is accepted by `install` now, so the bootstrap line the canon recommends for translated deployments takes the sandbox receipt directly: `node KAIF-LOADER.mjs --lang ru --rehearsal <copy>/.kaif/last-update.json`. The loader validates every flag BEFORE it downloads anything — an unknown flag is refused with nothing fetched and nothing written, so a tree can no longer be left with a new core under an old marker. The auto record `.kaif/update-rehearsal.json` is consumed on the bootstrap route as well. `diff --source` and `update` judge candidates by ONE predicate, so the rehearsal file and the receipt count the same files. Your `cp` route keeps working and is named in `/kaif-update` as the equivalent where the flag cannot be passed; the skill also carries "download the assets once, hand `--source <dir>` to both runs" and the Windows `core.longpaths` note. Guarded by polygon suite `s21` — red on the 2.5 core exactly as you reported. Three confirmations in one day made this the second epic of 2.6 — thank you. Closing with this comment.

**#44 (bug):**

> Fixed in KAIF 2.6 (<release link>). `stale-claims` flags any version token strictly OLDER than the version being installed, not only the one being replaced; every existing exemption stays exactly as it was, and a line stuck on an earlier version names it (`README.md:22 — … (asserts 2.2)`). Your own correction landed too: the two-part compare `gt` is one module-scope definition now. Polygon `s21` C1/C2 — red on 2.5. Closing with this comment.

**#46 (improvement request):**

> Shipped in KAIF 2.6 (<release link>) — not as a widening of the scalar but as the field explanation made canon: the delivery line is now a DERIVED VECTOR. `DELIVERY: systems N · complete A → B % (k of n) · integrated C % (c of d) · holes … · contradictions … · bugs …; moved by: … | blocker: … | owed questions: …` — printed by the new non-mutating command `node .kaif/kaif-core.mjs delivery` (`--json`, `--system <name>`) from `SYSTEMS_REGISTRY.md`. The registry ships as a skeleton (`.kaif/_systems-registry-template.md`): one row per logically separate system, four completeness parts as checkboxes — Specified · Accepted · Implemented · Verified in use — with the percentage always printed with its fraction, and needs declared as «feeds from»; integration = the share of declared needs closed by an implemented system. Holes, contradictions and bugs are counted from the open `bugs/*.md` by a new `Kind: hole | contradiction | bug` header line (no line = bug). The metric is DERIVED: the agent drafts the registry from GOAL.md, MASTER_PLAN.md and both maps and prints the vector from the draft at once; the owner approves the list as vision when ready. Nobody is sent to ask «what to measure» any more — the 2.5 wording is gone from every carrier, and the update task tells a deployment that opened such an interview to close it and build the registry instead. On the ticket's three points: (1) yes, N components — fixed at six; (2) the line keeps its shape, every component that moved gets its own arrow, a zero delta on all of them still needs a named blocker; (3) the guidance sentence turned out unnecessary — the axes differ by construction. Thank you: the shape is the one explained in the field, taken verbatim. Closing with this comment.

**#47 (bug):**

> Fixed in KAIF 2.6 (<release link>): the contour now records the third fact — SHOWN. `/owner-reviews` gains invariants I40–I43: the fact of showing is written at the moment the document is in front of the owner (a map next to the decisions, transport named: page · batch · chat); the queue prints the age of waiting and of the last showing and puts never-shown documents FIRST; the queue command has an EXIT CONDITION — a waiting document the owner has never seen stops the ritual until it is raised or the reason is written (`/resume` step 1b; both closing ceremonies and the four loops carry an `owed questions: N (oldest M d, never shown K)` slot in the delivery line). The same day's other word — questions to the owner as a scenario of what the owner will see — is canon too: `/interview` step 3a applies the four-line scenario to every question and every option, and the judge hunts a question without one. Your local fix (the shown map, the age line, the exit code) is the donor of this contract; the update does not replace your tool — the contract matches it by meaning. Thank you for the verbatim words; they are now the reason line of the rule. Closing with this comment.

**#50 (improvement request):**

> Taken into KAIF 2.6 by the owner's word (<release link>). The canon now says what your ticket asked: an owner's proposal that confuses the agent is a proposal not yet understood — never a wrong one. Order is the owner's: web search for what he most likely meant → a measurement over his own data → a question in `interviews/`. A message saying "your proposal breaks X / cannot / impossible" is not sendable without a `Recon:` block (query · found · measurement); rolling back work the owner asked for because a guard went red is a fork in `interviews/` with the guard's output quoted, never a report line; the owner's term enters the rule as the worked example. `/interview` carries the pre-flight, `/fable-judge` hunts "confusion delivered as verdict", the origin's question guard has the axis with your incident as its red fixture. Thank you — three instances in one day made it an epic of its own. Closing with this comment.

**#51 (bug):**

> Taken into KAIF 2.6 by the owner's word (<release link>). The contour no longer gets rebuilt per project: the update brings a one-page executable spec (`.kaif/INTERACTIVE_CONTOUR_SPEC.md` — question/option form, decision and shown records, pre-flight, keep-alive, the "radiogroups = questions" self-check) and a shipped generator (`.kaif/tools/contour/`) with three faces — interview, proofreading, mockup review — reading the project's parameters from `.kaif/kaif.json`, never asking the owner. Its self-test goes red on exactly your case: options typed as paragraphs open a page without radio buttons — the pre-flight now refuses to open it and prints the form to fix. `/owner-reviews` says "run it" (`node .kaif/tools/contour/review.mjs <doc>`), not "build it". The origin itself runs the shipped generator. Thank you — the fourth ticket of this class made the machinery ship. Closing with this comment.

**#52 (improvement request):**

> Taken into KAIF 2.6 (<release link>) — as a class of agent behaviour, not as one more smoke of one project. The agent may no longer say "done" about anything already live until it has verified on the owner's REAL world — with the owner's accumulated sessions, the owner's data, along the owner's own path. Before the word "done" it names how that world differs from its clean stand, and every item ends in one of two outcomes only: verified on the real world, or verified with real state taken from the real world. "Not verified there" is not an outcome any more — it is a stop that names what it waits for. The rule stands in the testing canon of both layers, as an obligation of the fable loop, and as a judge hunt on "done" without it; it arrives with the 2.6 update. Your project's own mechanisms (the returning-user pass, the boot shield, the visible-not-attached check) stay yours — the canon says WHAT must be verified on the real world, not how. Thank you: the class was named by the owner from your incident. Closing with this comment.

**#53 (bug):**

> Taken into KAIF 2.6 by the owner's word (<release link>). The rule "the newest pain is not a priority claim" already stood in `/what-next` as prose — and prose does not rank. In 2.6 the answer has a FORM: it opens with `METRIC:` (the delivery vector) and `MAIN PHASE:` read from the documents; every step carries `moves:`/`closes:`; the owner's words of the last 48 hours that are not yet in GOAL/MASTER_PLAN sit on a separate shelf ("not ranked by the metric", pointer `/fix-vision`); the tech-debt line with numbers is mandatory. A shipped lint (`.kaif/tools/kaif-ranking-lint.mjs`) goes red on exactly your case — the messenger MVP on line 1 with no metric — and `/fable-judge` hunts "recency ranked over metric". Applied to itself: this epic was NOT put first because it was fresh. Closing with this comment.

**#49 (bug — the creed):**

> Fixed in KAIF 2.6 (<release link>). The English carrier of the creed said "WE KEEP TRYING"; the owner's word is "we strive, and whoever strives arrives at success" — the shipped template now carries STRIVE, and a build guard forbids the old verb from returning (`check-framework` reddens on a template with "KEEP TRYING"). A ru deployment that recites the creed from the English template gets the right verb with the 2.6 update; a deployment that translated it locally keeps its own text (localized modules are not overwritten) — re-read the block once after the update. Thank you for the 57-day count: it is what made the class visible. Closing with this comment.

**#41 (field report) — квитанция + закрытие:**

> Thank you — worked into KAIF 2.6 (<release link>): wish 1 — `/kaif-update` says the bootstrap route is MANDATORY for a tree with anchored pairs under a deployed core older than 2.5; wish 2 — #40 fixed; wish 3 — the bootstrap task renders `−`/`+` from the OLD template texts (fetched from the previous release's own artifact; `--baseline <dir>` offline); wish 5 — `core.longpaths` in the sandbox recipe; R8 — the body of #23 is restored (it was double-encoded on the way in; decoded back, no BOM); wish 4 (`@fork` in the linter sentence, the language-mix heuristic) — deferred to 2.7 by the owner's scope cut. Closing with this quittance.

**#43 (field report) — квитанция + закрытие:**

> Thank you — received and worked into KAIF 2.6 (<release link>). Your two separately filed signals (#42, #44) are fixed there; the update-on-the-real-route epic was built on your bootstrap pass. R5 (the `merged` verdict stitching English sections into a half-translated canon file) — deferred to 2.7 by the owner's scope cut: the boundary of "merged" on a mixed file needs its own recon (Cyrillic share per module, not per file). Closing with this quittance.

**#45 (field report) — квитанция + закрытие:**

> Thank you — received and worked into KAIF 2.6 (<release link>). Three versions in one hop on the bootstrap route is exactly the path 2.6 hardens (#42 fixed; the loader refuses unknown flags before downloading; fills derived from disk; stale claims of any age named with file and line); #49 (the creed) is fixed in the shipped template; wish 4 (the "this module came from a field project — if it is yours, you now have a pair" hint in the update news) — deferred to 2.7 by the owner's scope cut. Closing with this quittance.

**#48 (field report) — квитанция + закрытие:**

> Thank you for the report — received and worked into KAIF 2.6 (<release link>). Wish 1 (#42) — fixed there. Wish 2 (R2/R3) — fixed: hand-filled slots are DERIVED from the disk (no new checkpoint, nothing to record by hand) — a file equal to "template + fills" is untouched, replaced mechanically with the fills kept, retired mechanically when deprecated; `update-verify` judges promised lines with the fills folded in (no more "unmerged?" on `<BUILD_COMMAND>` lines); a module already equal to the incoming template is no longer "upstream changed it" (R3). Wish 3 — the flag route above; the `cp` route stays documented as the equivalent. Wish 4 (the language-pack pointer) and the `@fork` doc nit — deferred to 2.7 by the owner's scope cut. Wish 5 (positive) — kept as is. Closing with this quittance.

## Links

`plans/89` (критерии 2, 12; строка 10) · `plans/87` (прецедент RL 2.5) · `.claude/skills/release/SKILL.md` ·
`reports/KAIF_AUDIT/2026-09-04_rl_court_2.5_registry.md` (форма реестра) · `ideas/28` · `ideas/29` · `plans/98`
(предыдущий эпик) · `MASTER_PLAN.md` §7 №13 · №28 · №84 · №92 · №93 · №94 · №96 · №97.
