# План 87 — эпик RL «Суд и релиз 2.5»: суд одним кругом, витрина, черновики ответов, публикация по слову владельца

> **Создан:** 2026-09-04 11:52 +03:00 (на закрытии эпика US — канон N+1, №43; сессия 50).
> **Родитель:** `plans/82` (эпик RL; критерий приёмки 5: «Суд одним кругом (форма №74): 0
> REFUTED-блокеров; витрина обеих половин; черновики ответов во все открытые issues (по одному на
> тикет, одна квитанция на полевой отчёт); релиз v2.5 опубликован по слову владельца; имя — по
> №85. *Meter:* шаги `/release`, `release-body-guard`, реестр суда в `reports/KAIF_AUDIT/`»).
> **Статус:** 🔲 написан; старт — нулёвка RL0 в следующем чате после закрытия US7.
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
витрина, публикация; `MASTER_PLAN` §8).

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
5. Открытое после релиза: `bugs/100` (P1 причина — лечение «H1 вне счёта wholesale» + свод «две
   папки») и флейк s07 (`STATUS` п. 1.2) — в `ideas/28` или первым пунктом 2.6.

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
- [ ] **RL1. Суд одним кругом** (форма №74): `/fable-judge` над версией — по критерию 1–4 плана 82
      пробами (свод полигона 18/18 · греп носителей CN · `kaif-core report` на фикстуре · s18),
      находки → реестр; REFUTED-блокер → фикс до релиза (без нового эпика — лестница тяжести S2).
- [ ] **RL2. Витрина.** README EN/RU: строка 2.5 в истории версий, числа из сборки; релиз-ноты
      `reports/RELEASE_NOTES_2.5.md` из нот сборщика; `README.pdf` перегенерирован (первый экран —
      владельцу, у агента нет рендерера); `counters-guard` · `doc-header-lint` · `release-body-guard`.
- [ ] **RL3. Черновики ответов** во все открытые issues + квитанции отчётам (критерий 3);
      показать владельцу страницей контура (`node tools/review.mjs`), не отправлять.
      ◐ 2026-09-04 ≈12:00 +03:00 (сессия 50): черновики для двенадцати тикетов #27–#38 в
      секции ниже (#23/#24 — `plans/80`; какие из них ещё открыты — сверить `gh issue list` в
      RL3, STATUS называл «10 открытых»); осталось: квитанции 13 отчётам (одна форма + список) и
      страница контура для владельца.
- [ ] **RL4. Имя версии** — вопрос владельцу (№85: решить ближе к релизу); варианты — три, с
      обоснованием от содержания 2.5 (симметрии обновления · точки решения · команда в поле).
- [ ] **RL5. Релиз по слову владельца** — `/release` (предпроверка · версия · сборка · тег · пуш ·
      GitHub Release); после — `send-outbound` ответов по тикетам, тоже по слову (№13).
- [ ] **RL6. Закрытие 2.5:** `plans/82` критерии 5–8 ✅, `MASTER_PLAN` §8 (8 из 8), `STATUS`,
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
differ by exactly one surviving heading right at the ceiling — `bugs/100` at the origin); the
cure itself is scheduled for 2.6, the protection ships now. (2) R1b, END without BEGIN: an
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

## Links

`plans/82` (критерии 5–8, ряд 5) · `plans/80` (черновики #23/#24) · `plans/83`–`86` (решения без
владельца) · `researches/24` §3 · `ideas/28` · `reports/KAIF_AUDIT/2026-08-28_rl_court_registry.md`
· `bugs/100` · `.claude/skills/release`, `fable-judge`.
