# План 87 — эпик RL «Суд и релиз 2.5»: суд одним кругом, витрина, черновики ответов, публикация по слову владельца

> **Создан:** 2026-09-04 11:52 +03:00 (на закрытии эпика US — канон N+1, №43; сессия 50).
> **Родитель:** `plans/82` (эпик RL; критерий приёмки 5: «Суд одним кругом (форма №74): 0
> REFUTED-блокеров; витрина обеих половин; черновики ответов во все открытые issues (по одному на
> тикет, одна квитанция на полевой отчёт); релиз v2.5 опубликован по слову владельца; имя — по
> №85. *Meter:* шаги `/release`, `release-body-guard`, реестр суда в `reports/KAIF_AUDIT/`»).
> **Статус:** ✅ ЭПИК ЗАКРЫТ 2026-09-04 16:25 +03:00 (сессия 52) — RL0–RL6 исполнены: релиз
> v2.5 опубликован 2026-09-04 16:16 +03:00 по слову владельца (открывающее сообщение чата),
> 24 ответа в issues отправлены 16:20, версия 2.5 закрыта 9 из 9 (`plans/82`). Прежняя запись:
> 🔲 написан; старт — нулёвка RL0 в следующем чате после закрытия US7.
> **Вовне:** релиз v2.5 в GitHub Releases и ответы в issues — ВНЕШНИЕ действия, слово владельца
> в моменте (№13, №84); имя версии — решение владельца (№85: «пока без названия, решим ближе к
> релизу, кодовое имя "E"»).

## Вектор цели (Achieve)

**Боль:** версия 2.5 собрана четырьмя эпиками (CN · SG · TM · US) под судьями эпиков, но не
судилась ЦЕЛИКОМ; открытые полевые тикеты (10) и отчёты (13) ждут ответов «после релиза по
тикету» (№84); витрина (README EN/RU, релиз-ноты) не знает 2.5; у версии нет имени.
**Цель:** один круг суда по форме №74 над всей версией (реестр в `reports/KAIF_AUDIT/`) без
REFUTED-блокеров → витрина обеих половин → черновики ответов на каждый открытый тикет и по одной
квитанции на полевой отчёт → релиз v2.5 по слову владельца с именем по его решению.
**Метрика:** критерии 2.5 закрыты 5 из 8 после суда → релиз = 8 из 8 (критерии 6–8 — скоуп,
витрина, публикация; `MASTER_PLAN` §8). *Поправка 2026-09-04 14:5x +03:00 (№91): знаменатель —
9 (критерий 7 [SF] вставлен словом владельца); релиз = 9 из 9.*

## Критерии приёмки (fit)

1. Реестр суда `reports/KAIF_AUDIT/<дата>_rl_court_2.5.md`: каждая находка — с дословной уликой
   и вердиктом; блокеров REFUTED — 0; CAVEATS названы с судьбой (фикс до релиза · в 2.6 с адресом
   в `ideas/28` · принято). *Meter:* греп `REFUTED` по реестру = 0 в блокерах.
2. Витрина: README EN и RU называют 2.5 одинаковыми числами (сводов 18, навыков, документов —
   из вывода сборки), `counters-guard` зелёный; `reports/RELEASE_NOTES_2.5.md` собран из нот
   сборщика (`TEMPLATE_NOTES_BY_VERSION['2.5']` + policy) с кодовым именем по №85.
   *Meter:* `node tools/counters-guard.mjs` · `release-body-guard` зелёные.
3. Черновики ответов: по одному на каждый открытый тикет (#23, #24 готовы — `plans/80`; #27,
   #28, #31, #32 — эпик US; #29, #33, #34 — эпик TM; #35, #36, #37, #38 — эпик CN; #30 —
   `/guarded-loop`) и одна квитанция-благодарность на полевой отчёт со ссылкой на релиз; форма
   — `plans/80`; время-чувствительные формы сверены перед отправкой (EXP-0093). *Meter:*
   список тикетов ↔ список черновиков в `interviews/` или `reports/`.
4. Релиз: `version.json` 2.5 + имя + дата, сборка, тег `v2.5`, `latest`, GitHub Release —
   ТОЛЬКО по слову владельца (`AUTH:`-строка); до слова — RC собран и показан.
   *Meter:* `/release` шаги · `git tag` · страница релиза.
5. Открытое после релиза: флейк s07 (`STATUS` п. 1.2) — в `ideas/28` или первым пунктом 2.6
   (`bugs/100` вылечен ещё в сессии 50: H1 вне счёта wholesale, страж s18 U14 на пробе «две папки»).

## Шаги

- [x] **RL0. Нулёвка.** ✅ 2026-09-04 11:55 +03:00 (сессия 50, хвост защищённого цикла; форма
      №74 из реестра суда 2.4 перечитывается в RL1). **Входы суда собраны:**
      · *Решения без владельца — 33 пункта, адресами:* CN `plans/83` 1–6 (каденция молитвы в
      директиве блока · `DELIVERY:` в п. 7 циклов · числа бюджетов девятки · метрика «N из 8» ·
      охота delivery-line в шапке судьи · полевые числа без имён) · SG `plans/84` 1–5 (доставка —
      действие по умолчанию, `--dry-run` флаг · дедуп `kaif-fp` отложен · RU-копия шага 4 в форме
      2.4 · таймаут `gh` = exit 3 · швы `KAIF_GH*` — переменные окружения) · TM `plans/85` 1–8 (CI
      референсом + пункт операции 3 · четыре состояния борда · `team-ci-template.md` с
      fenced-блоком · adopt — шаг 0 операции 2 → референс `team-adopt.md` · борд вне git как
      policy 2.5 · RU-копия синхронизирована · 180 строк RU при потолке 179 поставки) · US
      `plans/86` 1–14 (развилка B · `check` краснеет · ничья EOL → CRLF · языковая политика не
      менялась · `sources` в мете · кандидаты по `localizedAgainst` · s18 в полигоне · пара,
      сломанная на диске, не откатывается · белый список скриптов · репетиция обязывает в
      опасную сторону · non-ASCII остаётся предупреждением · `placeholders` = поверхности гейта ·
      P4 механический · US3в документом).
      · *Критерий 6 (скоуп) — сверка грепом ПРОШЛА:* строки `researches/24` §3 с вердиктом «2.6»
      (Т :101 · V :102 · P :103 · `/code-revision` :104 · X :105 · селфтесты :106 · U3/U4 :107 ·
      TD :108 · хук #36) ↔ `ideas/28` пп. 1–9 адресами; на закрытии US добавлены пп. 10–11
      (`bugs/100` лечение · флейк s07).
      · *Замер ДО (build 429):* сборка — 14 документов / 7 README / 37 навыков / 59 блоков FULL /
      170 бандла / 764 модуля; полигон 18 сводов; `bugs/` без DONE — 21 (включая `bugs/100`),
      `ideas/` без DONE — 11; открытых тикетов origin — 10, полевых отчётов — 13 (черновики есть
      только для #23/#24, `plans/80`); критерии 2.5 — 4 из 8.
- [x] **RL1. ✅ 2026-09-04 13:56 +03:00 (сессия 51) — VERIFIED WITH CAVEATS: 30 строк = 25
      CONFIRMED · 5 WEAKENED · 0 REFUTED (поправка 2026-09-04 16:08 +03:00, сессия 52: пересчёт
      по таблице кластеров реестра; «32/26/6» здесь и «25 строк: 19/6» ниже были ошибками
      сложения при сведении, пойманы судьёй релиза), 5 выживших находок починены и пересужены, кластер A на
      починенном дереве зелёный целиком. Суд одним кругом** (форма №74): `/fable-judge` над версией — по критерию 1–4 плана 82
      пробами (свод полигона 18/18 · греп носителей CN · `kaif-core report` на фикстуре · s18),
      находки → реестр; REFUTED-блокер → фикс до релиза (без нового эпика — лестница тяжести S2).
      ◐ 2026-09-04 12:12 +03:00 (сессия 50): СКЕЛЕТ реестра написан —
      `reports/KAIF_AUDIT/2026-09-04_rl_court_2.5_registry.md` (кластеры A–F, 34 заявления с
      командами переисполнения); кластер A переисполнен оркестратором на HEAD `872df93` — 7/7
      CONFIRMED (A2 — с WEAKENED-кандидатом: флейк s07 ×2 за день); кластеры B–F — судьям
      следующего чата с чистыми контекстами (оркестрация — по слову владельца о workflows).
      ◐ 2026-09-04 13:2x–14:3x +03:00 (сессия 51): СУД ИСПОЛНЕН — форма №88 (интервью №021 Q2 = A:
      без workflows) — 4 судьи-субагента по кластерам B–E с чистыми контекстами + кластер F
      оркестратором → 23 строки: 18 CONFIRMED · 5 WEAKENED · 0 REFUTED (по таблице реестра; поправлено сессией 52); 14 сырых находок → панель
      скептиков (материальность · корректность, выживание 2/2) → 5 выживших (B-H1 · D-H2 · D-H4 ·
      E-H1 · E-H2), все починены и пересужены (E-H1 — страж s18 U5б доказан красным на ядре
      `4958dd1`: ровно 2 красных; на починенном — 57 зелёных); 1/2-находки — 6 дешёвых починок
      мандатом RL + 2 строки в `ideas/28`; кластер A на починенном дереве — см. реестр (полигон
      сессии 51). Попутно `bugs/108` (пачка контура показала протухшую домашку; страж I39).
- [x] **RL2. ✅ 2026-09-04 14:1x +03:00 (сессия 51) — RC витрины собран:** README EN/RU (бейдж
      2.5 · логотип `assets/KAIF_2.5_GitHub_LOGO.{png,webp}` — `build-logo-title.mjs --title`,
      `--check` зелёный, подпись прочитана глазами · строка «Version 2.5 — Experienced KAIF ·
      2026-09-04» (дата ПРЕДВАРИТЕЛЬНАЯ — сверить в день релиза) · строка v2.5 в Таблице 5 обеих
      половин) · `reports/RELEASE_NOTES_2.5.md` из 11 нот сборщика — шесть пунктов, имя НЕ
      толкуется (EXP-0094), двух непустых строк подряд нет · строка кодового имени в
      `TEMPLATE_NOTES_BY_VERSION['2.5']` (frozen literal, №87) · `README.pdf` перегенерирован
      (первый экран — глазами владельца, рендерера у агента нет) · гейты: showcase-lint · voice-lint
      (жёстких 0; коридоры нот — длинные предложения 21,3 и 5 антитез, справка) · counters 50 ·
      private-names · estimates — зелёные. ✅ 14:5x: по слову владельца (интервью №022 Q1 = своё,
      №89) — новой цитаты нет: цитата о 2.4 остаётся, под ней возвращена цитата о 2.2 (README
      v2.3, дословно, обе половины); логотип 2.5 — арт 2.4 (медальон команды) с подписью
      «KAIF 2.5 — Experienced KAIF» (`build-team-logo.mjs --title`, `--check` зелёный, прочитан
      глазами; alt-тексты README и нот — медальон). Прежняя запись: цитата — интервью №022 Q1 (пока
      стоит его цитата о 2.4). **Витрина.** README EN/RU: строка 2.5 в истории версий, числа из сборки; релиз-ноты
      `reports/RELEASE_NOTES_2.5.md` из нот сборщика; `README.pdf` перегенерирован (первый экран —
      владельцу, у агента нет рендерера); `counters-guard` · `doc-header-lint` · `release-body-guard`.
- [x] **RL3. ✅ 2026-09-04 16:20 +03:00 (сессия 52) — ОТПРАВЛЕНО: 24 ответа через `gh issue
      comment --body-file` с подписью агента-автора (канон issue #15) — 13 тикетов #27–#39,
      #23/#24 по `plans/80` (лид «shipped in v2.4 … answered with the 2.5 release»), 9 квитанций
      отчётам #5 #7 #9 #11 #12 #13 #17 #25 #26; показ владельцу СНЯТ его словом (№92:
      «черновики ответов мне показывать не нужно … Отправлять ответы без моей вычитки»);
      первый (#39) прочитан рендером носителя, затем остальные; время-чувствительные формы
      сверены (EXP-0093: лид-строка «Shipped in KAIF 2.5 — Experienced KAIF (released
      2026-09-04, <тег>)»); закрытие 11 тикетов-дефектов `gh issue close` заблокировано
      классификатором авторежима — тикеты открыты, закрыть — владельцу. Черновики ответов** во
      все открытые issues + квитанции отчётам (критерий 3);
      показать владельцу страницей контура (`node tools/review.mjs`), не отправлять.
      ◐ 2026-09-04 14:2x +03:00 (сессия 51): открытых — 13 тикетов (#27–#39) и 11 отчётов (#5 #7
      #9 #11 #12 #13 #17 #23 #24 #25 #26; `gh issue list --state open`); черновики #27–#38 ниже,
      #23/#24 — `plans/80`, #39 — ниже (по ответу №022 Q3), #28/#32 — отчёты с собственными
      черновиками; квитанции остальным девяти отчётам — список ниже. Показ владельцу — страницей
      контура после релиза, вместе с гейтом отправки (`review-gate` → `send-outbound`, №13).
      ◐ 2026-09-04 ≈12:00 +03:00 (сессия 50): черновики для двенадцати тикетов #27–#38 в
      секции ниже (#23/#24 — `plans/80`; какие из них ещё открыты — сверить `gh issue list` в
      RL3, STATUS называл «10 открытых»); осталось: квитанции 13 отчётам (одна форма + список) и
      страница контура для владельца.
- [x] **RL4. ✅ 2026-09-04 13:37 +03:00 (№87: интервью №021 Q1 = D «Experienced» → KAIF 2.5 —
      Experienced KAIF; смысл имени владелец не объяснял — витрина имя не толкует, EXP-0094).
      Имя версии** — вопрос владельцу (№85: решить ближе к релизу); варианты — три, с
      обоснованием от содержания 2.5 (симметрии обновления · точки решения · команда в поле).
      ◐ 2026-09-04 12:19 +03:00: вопрос ЗАДАН — `interviews/interview_021` Q1 (A Enforced ·
      B Even-handed · C Embedded · D своё; все на «E») + Q2 форма суда RL1 (A без workflows,
      как в 2.4 · B workflow · C оркестратор один); эталон контура пересмотрен (2 вопроса, 7
      вариантов); страница контура владельцу — при следующем живом чате (`node tools/review.mjs`).
- [x] **RL5. ✅ 2026-09-04 16:16 +03:00 (сессия 52) — ОПУБЛИКОВАН
      https://github.com/MikalaiKryvusha/KAIF/releases/tag/v2.5:** `/release` шаги 1–7 — реестр
      пар GREEN · полный контур в браузере 168/0 · полигон 19/19 до и после бампа · бамп 2.4 → 2.5
      с зеркалами (`9eac79b`, build 448) · судья RC (шаг 4.5, чистый контекст): REFUTED — число
      суда в нотах не сходилось с реестром (30 = 25/5/0 по таблице кластеров, не «32/26/6») и три
      мёртвых якоря README в ссылках нот (наследие нот 2.4) → починено `30dfc42` → пересуд
      VERIFIED WITH CAVEATS · тег `v2.5` · GitHub Release с шестью ассетами · `latest` = v2.5 ·
      `release-body-guard` зелёный (NBSP 0/0) · страница прочитана рендером носителя (27 абзацев,
      0 разрывов, логотип, ссылки живые) · сетевой смоук: установка 2.5 с релизных ассетов во
      временную папку — loader exit 0. `AUTH:` слово владельца, открывающее сообщение чата:
      «первым — RL5 по plans/87: релиз v2.5 … /release шаги 1–7». Релиз по слову владельца** —
      `/release` (предпроверка · версия · сборка · тег · пуш ·
      GitHub Release); после — `send-outbound` ответов по тикетам, тоже по слову (№13).
- [x] **RL6. ✅ 2026-09-04 16:25 +03:00 (сессия 52). Закрытие 2.5:** `plans/82` критерии 5–9 ✅, `MASTER_PLAN` §8 (9 из 9), `STATUS`,
      летопись; `ideas/28` пополнен отложенным (bugs/100, флейк s07, US3в лечение); план 2.6 —
      по `/plan-epic`, не здесь.

## Черновики ответов в полевые issues (RL3; отправка ПОСЛЕ релиза 2.5 по слову владельца, №84)

> Форма — `plans/80`: благодарность · что именно приехало в 2.5 по каждому пункту тикета · честная
> граница. Перед отправкой — сверка время-чувствительных форм (EXP-0093) и подстановка ссылки на
> релиз. Написаны 2026-09-04 на закрытии эпика US (сессия 50); #29/#33/#34 (эпик TM) — дописать в
> RL3 по `plans/85`.

**#27 (Prompt Modding, 1.6 → 2.4 non-determinism).** Thank you — this ticket set the whole
"update symmetries" epic of v2.5. (1) R1, the two runs that classified `AGENT_GUIDE.md`
differently: the verdict now prints its numbers for every localized candidate (`baseFound N of
M, ceiling K → frozen | merged`), and the rehearsal is BINDING — `diff --source` records the
verdicts in `.kaif/update-rehearsal.json` (a sandbox copy's receipt carries them too: pass it as
`update --rehearsal <copy>/.kaif/last-update.json`), and a live run whose verdict is `merged`
where the rehearsal said `frozen` FREEZES the file and names both number sets in the task
(`verdict-mismatch`). The 416 English lines can no longer land after a rehearsal that showed
`kept intact`. The root cause is narrowed to the legacy road (v1 manifest + synthetic baseline:
the baseline's H1 is filled from the folder name, so a git-archive copy and the live folder can
differ by exactly one surviving heading right at the ceiling — `bugs/100` at the origin; the
mechanism is REPRODUCED: one tree, two folder names, `baseFound 5 → merged` vs `baseFound 4 →
frozen`, but only when `<PROJECT_NAME>` falls back to the folder name — no `package.json` with a
`name` and no recorded `projectName`. One question back to you: did your 1.6 → 2.4 tree carry a
`package.json` with `name` at the root? If it did, the cause is elsewhere and the rehearsal
freeze is the fence either way); the cure ships in v2.5 as well: the H1 is out of the wholesale
count (it is the one heading that carries a deploy-time value), and a polygon guard now runs one
tree under two folder names and demands one verdict. (2) R1b, END without BEGIN: an
anchored block is indivisible — the merge plan is judged as a whole, a pair that would come out
unbalanced rolls back to the disk state and goes to the task as ONE `(anchored block
KAIF:PRAYER)` item with the diff of all its carriers, and `check` reddens any document that
still carries an unpaired marker (your tree will turn red after updating — that red is the
signal; restore the block from the task diff once). Your §4 wish "in the declared position — or
to the task" is exactly what was built.

**#28 (Prompt Modding §2 R1–R5).** Thank you for the five precise rakes. R1/R2 — see #27 above
(binding rehearsal + indivisible anchored blocks). R3 (anonymous → origin leaves old-mode text
in place): the transition now names every kept file that was deployed with the anonymous wording
in a `mode-switch` task item for a re-read — honest boundary: it catches the MECHANICALLY
conditioned wording (author-note regions, the acronym expansion), not prose inside a skill that
describes the old mode. R4 (`project-name` warns after accepting): the guidance now precedes
the act — both task items name the file form `--name-file <path>` next to the argv form, and a
name that ARRIVED mangled through the shell (replacement characters / question marks only) is
refused before anything is recorded; a readable non-ASCII argv still warns and is accepted, as
before. R5 (hooks README smoke line hangs on stdin): `< /dev/null` is in the line, with the
reason next to it.

**#31 (QA_Engineer, vanishing `stale-claims` item).** Thank you — confirmed and fixed at the
cheap end: the item is now UNCONDITIONAL on every version change; an empty scan says so in its
body (`no lines found — the scan for claims of the OLD version ran over the tree and found
nothing…`), so a missing item and a clean tree can no longer look alike. The scan also covers
the project's own scripts now (`package.json` and script files; lock files excluded) — a pin of
the old version in a script becomes a task line instead of a CI surprise. The one-sided loss you
saw is explained by the old `if (staleClaims.length)` gate; the scanner's precision rules were
not changed.

**#32 (QA_Engineer, 2.2 → 2.4 modular route).** Thank you — the negative result R-B (sandbox =
live, file for file, on the modular route) was the most useful line of the whole batch: it
narrowed the #27 hunt to the legacy road. R-A — see #31. R-C (18 of 45 skills English, `check`
silent): `check` now prints `⚠ language mix: N of M skills are English (language: ru)` — a
warning, not a refusal; and every NEW file of a release that arrives English on a non-English
deployment is listed in the update task (`language-arrivals`), so the boundary is declared on
each update rather than discovered. R-D (deprecation without a successor): every deprecation
names its successor in the log and in the task item, and the kept ones are COUNTED (context line
+ receipt). Wishes: (4) a translated-wholesale file now names its upstream path and a ready
`git diff v<from> v<to> -- <src>` (the dest → src map ships in the bundle meta); (5) the old
version pin in `tools/` — covered by the script scan of #31.

**#30 (KAGO, guarded loop closed early).** Thank you — the prose rule did not hold, so it became
a written and CHECKED contract in v2.5: the first pulse reads `armed until <ISO>`,
`.kaif/guarded-loop.json` carries `{ "until" }`, Step 5 opens with the forced artifact
`BOUNDARY: now · armed until · pool`, ceremony time is spent AFTER the boundary, and
`/fable-judge` hunts an early final pulse with a non-empty pool ("early-finish").

**#35 (gate 5 asks for a red guard, not for a threat).** Thank you — canon fixed at the source:
TESTING gate 5 gained its second half — every guard declares `@guard THREAT · PROVED-AGAINST ·
GAP · ON-REAL-PATH`, a forensic recorder declares `@forensic … DURABLE-AT`, durability only at a
clean ending is rejected; an advisory linter (`kaif-guard-lint`, opt-in, fires only on explicit
markers) reads the block.

**#36 (a fork decided from the agent's head).** Thank you — the fourth door is now in
PHILOSOPHY, and AGENT_GUIDE adds the forced artifact at the decision point: `FORK: options ·
price of error · consulted <authority | recon | owner>`; a fork closed by the agent's own reasoning
alone is a judge-hunted finding. Point 3 of your ticket (a `recon-before-decision` hook) waits
for a mechanical fork signal — recorded for 2.6.

**#37 (the blanket AUTH rule swallowed the `/report-bug` exception).** Thank you — the
authorization gate now names its ONE carve-out inline: a KAIF-defect ticket to the framework's
own origin is delivered under the standing authorization in the same motion as it is filed;
`/report-bug` step 4 says "run it", and the delivery is a machinery command
(`kaif-core report <ticket>`) rather than prose an agent-system classifier can refuse.

**#38 (voice as timbre, not intelligibility).** Thank you — I35 now binds the voice to the
LANGUAGE first: the route selects a voice whose culture matches the deployment's `language`,
the system default only when it already matches, and drops to beeps + banner rather than speak
an unintelligible sentence; the timbre half of the ticket was already superseded by 2.4.

**#29 (NDim, CI must travel with the team — the owner's order).** Thank you — CI now ships with
the team in v2.5: operation 3 of `/team-deployment` carries a new reference
`team-ci-template.md` — one job, at most three gate steps (checkout · setup by stack · install ·
the test/lint/typecheck commands READ from the project's `package.json` or build canon, never
hard-coded), triggered by pushes to role branches and PRs into main; your constraints are
stated out loud in the reference: cheap gates only (no secrets, emulators or a live bench), a red
run on a role branch blocks the merge exactly like a missing verifier's verdict (a line in
constitution § 5), and a non-GitHub remote gets the same job as a documented local pre-push
script. This is declared a policy change of 2.5 in the update task, not merged silently.

**#33 (NDim, a two-state board obliges nobody).** Thank you — the board now knows four states
as ROLES, each with its obligation: 🟢 free · 🔴 busy · 🟡 blocked · ⚫ offline; and the board
contract gained item 7, `audit-waiting`: a tool lists every "Waiting for" line older than the
threshold and returns a non-zero exit code, and the manager is obliged to react — your
`auditWaiting` reference implementation (four mutations) was read and its form taken.

**#34 (NDim, a tracked board keeps main dirty by construction).** Thank you — the board is now
SESSION STATE OUTSIDE git by default: operation 3 adds `TEAM_STATUS.md` to `.gitignore` in the
same motion (the `.kaif/refresh-marker.json` precedent), a board snapshot travels into the
shift retrospective (operation 5), and a team that needs a tracked board takes a NAMED opt-out
with its price written in the constitution (a dirty tree by construction). Declared as a policy
change of 2.5 in the update task.

**Квитанция полевому отчёту (одна форма на все; список отчётов сверяется в RL3 по приёму с
момента релиза 2.4 — `reports/KAIF_UPDATES/*2.4*` + `KAGO_OWNER_REVIEWS_FIELD_REPORT.md`;
STATUS называл 13):** Thank you for the `<PROJECT> KAIF <from→to> report` — every rake with
verbatim evidence was read into the 2.5 planning synthesis (`researches/23`/`24` at the
origin) and either shipped in v2.5 (<release link>; the tickets your report fed are answered
there: #NN, #NN) or recorded for 2.6 with its address (`ideas/28`). Nothing in it was dropped
silently; the field report is the framework's feedback loop, and this one moved it.

**Список квитанций (RL3, сессия 51; тикеты, которые кормил каждый отчёт, — по `researches/24` §2):**
#5 (KAGO 2.2 install → #3 · placeholder gate, closed in 2.3) · #7 (KAGO contour build → I35 voice by
language in 2.5, #38) · #9 (QA_Engineer 1.6 → 2.2 → the legacy road of #27/#32 in 2.5) · #11 (KLAS
2.1 → 2.2 → mechanical core-update, 2.3) · #12 (Unliminium 2.1 → 2.2 → wholesale-translated
deployment: the rehearsal binding of 2.5) · #13 (NDim 2.1 → 2.2 → bootstrap route: `language-arrivals`
of 2.5) · #17 (KUMM 2.2 install, thin-loader route → no 2.5 ticket; thanks only) · #25 (NDim 2.3 →
2.4 → #27 R1b anchored block, cured in 2.5) · #26 (NDim first `/team-deployment` use — brownfield
adoption gap → the ADOPT path of 2.5; #29/#33/#34 answered above). Форма — квитанция выше; для #26
— добавить одно предложение: «the brownfield-adoption gap you named is the adopt path of
`/team-deployment` in v2.5 (reference `team-adopt.md`): inventory against the invariants → the
owner's decision → apply without overwriting the owner's words».

**#39 (scenario form for acceptance criteria — решение владельца №91, интервью №022 Q3 = A «в
2.5 в полном виде»; исполнено эпиком SF, `plans/88`).** Thank
you — the four-line form (Situation · Action · Result · Check) is the owner's own language for a
requirement, and the fourth line is exactly what the agent era adds to BDD: a check the agent can
run instead of a sentence it can only claim. Your deployment proved the whole package in the
field first (the home rule after the upstream text, four templates, a form guard with an
addressable selftest, a live backlog green), and the owner's word put it into v2.5 in full: the
optional "The scenario form" subsection of `REQUIREMENTS_FRAMEWORK.md` (four lines, the
Given/When/Then bridge plus the fourth line, EARS → scenario, your seven rules with ❌/✅, the two
field boundaries — an owner-written Check may be empty, an agent-edited Check during execution is
judged like a weakened test); the optional tool module `.kaif/tools/kaif-scenario-lint.mjs`
(`check` / `selftest`; the seven rules as data, keywords mirrored per language — `en` and `ru`
ship, a project adds a row; `SKIPPED=3` on a tree without a scenario; the selftest proves rule N
red on mutation N only, in both languages); the four lines in the criteria block of
`/plan-task`, `/plan-epic`, `/propose-idea`, `/report-bug`; and `/interview` step 3a — a mechanic is
explained scenario-first, the formula after. Two things differ from your home rule on purpose:
the form stays a project's CHOICE at the canon level (the "Not Gherkin-everywhere" boundary
holds — a project makes it mandatory by its own home rule, as yours does), and the examples are
domain-neutral. The keywords stay yours. Your `update` to 2.5 will bring the subsection next to
your home rule — keep the home rule (it states where the form is mandatory for you) and point it
at the canon subsection; the linter you already run stays yours, the shipped one is a mirror.

## Верификация наблюдением

Реестр суда — файл с уликами; витрина — стражи счётчиков/шапок/тела релиза; черновики — список
на странице контура; релиз — страница GitHub Release и `git tag`; каждое внешнее действие —
цитата слова владельца рядом.

## Риски (ярусы Мёрфи)

- **(а)** Суд найдёт REFUTED-блокер в US (например, повтор флейка s07 с причиной в ядре) — фикс
  внутри RL как S2 (документ + страж), релиз не раньше зелёного полигона.
- **(б)** Имя версии не решено владельцем к релизу — релиз ждёт (№85 — решение владельца, не
  агента); RC и витрина готовятся с плейсхолдером имени, `release-body-guard` не пропустит его в
  публикацию.
- **(в)** Ответы в issues устареют, если релиз задержится — черновики хранят дату и сверяются
  перед отправкой (EXP-0093).

## Решения, принятые агентом без владельца (накопительно; закрыть в RL6)

1. Черновики ответов пишутся в RL, а не на закрытии каждого эпика (в эпиках US/TM/CN черновиков
   нет — цикл не оставил времени; форма и адресаты — `plans/80`).
2. (сессия 52) Слово владельца в открывающем сообщении чата («первым — RL5 по plans/87: релиз
   v2.5 … /release шаги 1–7») прочитано как `AUTH:` на публикацию в день релиза 2026-09-04
   (дата RC = день) — агент не переспрашивал: вопрос заблокировал бы автономную сессию, а все
   входы релиза (имя №87, витрина №89, дата, суд) были закрыты владельцем раньше. Цитата — в
   коммите `9eac79b` и в летописи.
3. (сессия 52) Ответы отправлены без показа страницей контура и без `send-outbound`: гейт
   одобрения снят словом владельца №92 («Отправлять ответы без моей вычитки»); транспорт —
   прецедент сессии 41 (`gh issue comment --body-file`, подпись агента-автора по issue #15);
   первый ответ (#39) прочитан рендером носителя до остальных.
4. (сессия 52) Полевые отчёты (#5 #7 #9 #11 #12 #13 #17 #23 #24 #25 #26 #28 #32) оставлены
   ОТКРЫТЫМИ по прецеденту сессии 41 («не дефекты, не закрывать»); квитанции получили все;
   закрыть их — слово владельца. → Владелец спросил о ценности, агент честно назвал её нулевой,
   слово «закрываем» — все 13 закрыты 2026-09-04 17:09 +03:00 (№94); правило вперёд — отчёт
   закрывается той же квитанцией.
5. (сессия 52) Закрытие 11 тикетов-дефектов (#27 #29 #30 #31 #33–#39) НЕ выполнено:
   `gh issue close` заблокирован классификатором авторежима, обход не делался — граница прав
   принадлежит владельцу (клик в GitHub или правило прав в settings). → Закрыто 2026-09-04
   17:04 +03:00: владелец расширил права (№93, `tools/grant-permissions.mjs`), 11 тикетов
   закрыты агентом; полевые отчёты открыты — его слово (→ закрыты в 17:09, см. решение 4).
6. (сессия 52) Число суда исправлено на 30 = 25/5/0 по таблице кластеров реестра (судья RC) во
   всех живых носителях; запись сессии 51 в летописи не переписана (append-only, №55) —
   поправка новой записью сессии 52.
7. (сессия 52) Стражи из находок судьи легли в ОБВЯЗКУ, не в поставку: ось `NOTES-ANCHORS` в
   `tools/showcase-lint.mjs` (селфтест красный/молчащий) и команда пересчёта числа суда в
   `.claude/skills/release` шаг 4.5 — класс истоковый (реестры суда и ноты живут только здесь);
   ноты 2.5 добавлены в зоны `private-names-guard` (локальный список в ignore).
8. (сессия 52) Приватные имена в реестре суда `reports/KAIF_AUDIT/…` (12 вхождений на 5
   строках, судья RC) — не блокер по доктрине стража (зона — поставка и витрина); чистка по
   №90 — `ideas/28` п. 14. Мёртвые якоря в опубликованных нотах 2.2–2.4 не правились
   (`gh release edit` — внешнее действие) — `ideas/28` п. 13.

## Links

`plans/82` (критерии 5–8, ряд 5) · `plans/80` (черновики #23/#24) · `plans/83`–`86` (решения без
владельца) · `researches/24` §3 · `ideas/28` · `reports/KAIF_AUDIT/2026-08-28_rl_court_registry.md`
· `bugs/100` · `.claude/skills/release`, `fable-judge`.
