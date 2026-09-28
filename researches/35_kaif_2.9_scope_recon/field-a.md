# Разведка field-a — полевые отчёты обновления 2.7 → 2.8: #108 KAST · #118 Unliminium (+4 комментария) · #121 NDim Space

> **Прочитано:** 2026-09-28 17:15–17:28 UTC (20:15–20:28 +03:00), все три отчёта и все 4 комментария #118 — целиком.
> **HEAD** `52f688c`; `framework/installer/KAIF-CORE.mjs` sha256 `d424900c5f5f…10cd` — равен пину поля (все три отчёта называют
> `d424900c…`), номера строк поля (`:140`, `:142`, `:1206`, `:1327`) совпадают с HEAD. Сверено с HEAD, не с памятью.
> **Пробы** — только в `mktemp -d` (`/tmp/tmp.heGNuWPWBu`, удалён после разведки): `dist/` скопирован в `rel/`, чистый git-репозиторий, `node rel/KAIF-CORE.mjs
> install --bundle rel/KAIF-CORE-BUNDLE.md --lang ru` → `✅ KAIF 2.8 deployed mechanically (lang ru · 8 owner docs templated · 37 skills
> trigger-aliased, …)`, ядро скопировано в `.kaif/kaif-core.mjs` руками (это делает загрузчик). Копии модулей контура и voice-lint — там же.
> Окон, звука, свода, `KAIF_DIST` — не было. В `/home/user/KAIF` ничего не менялось.

Условные обозначения: **ТОЛЬКО В ОТЧЁТЕ** — дефект не заведён отдельным тикетом #109–#131 (его никто, кроме этой разведки, не разберёт);
**ТИКЕТ #N** — заведён отдельно (разбирает группа того тикета, здесь — только быстрая сверка).

---

## #108 — KAST, 2.7 → 2.8, `core-update` с репетицией; развёрнут утром из дерева истока до выпуска

### Маршрут

- **Версии:** 2.7 → 2.8. Особенность — развёрнут «the same morning from the KAIF source tree at HEAD `83400e6` (2.8 content before the
  release, stamped `2.7`)».
- **Путь:** `core-update` (`node .kaif/kaif-core.mjs update --source D:\Android\kaif-2.8-assets`), сандбокс-репетиция, живой прогон с
  `--rehearsal`; одна папка ассетов на оба прогона.
- **ОС:** прямо не названа; Windows следует из путей `D:\Android\…` и из «a Git Bash/msys crash dump» (`grep.exe.stackdump`) в вердикте судьи.
- **Язык:** ru (`language ru`, `canonArtifacts []`); **модель агента:** не названа.
- **Длительность:** живой прогон 13:36:32 +03:00, судья «2026-09-26 13:38-13:45 +03:00», тикет создан 10:47:18Z (= 13:47 +03:00). Обновление
  на момент отправки НЕ закончено: судья — «policy-changes, judge and field-report are NOT yet recorded».

### Дефекты и трение

1. **R1 — `policy-changes` называет НОВЫМИ шесть правил, которые дерево уже несёт** (развёртывание из предрелизной сборки).
   **ТОЛЬКО В ОТЧЁТЕ** (#114 прямо называет его соседом, не дублем: «read #108: its R1/W2 is a sibling — `policy-changes` lists as new six rules the deployment already had — not this proposal»).
   **Сверка: PARTIAL.** Интервал правил считается только по номеру: `framework/installer/KAIF-CORE.mjs:1482` `  const policy =
   policyInterval(meta, fromVersion);` — без признака предрелиза. В 2.8 (#107, коммит `365d163`, ПОСЛЕ `83400e6`) предрелиз учтён только для
   НОВОСТЕЙ: `:1556` `  const news = newsInterval(meta, fromVersion, prerelease && prerelease.of);`, пункт `:1555` говорит «The notes of
   ${prerelease.of} below describe changes that most likely arrived with that build», а пункт правил `:1488` по-прежнему печатает «This
   interval CHANGES RULES of your previous version — these are the OWNER'S decisions, never merge them silently; put each in front of the
   owner and record the choice:». У самого KAST поле `prerelease` не могло появиться: `git show 83400e6:framework/installer/KAIF-CORE.mjs |
   grep -c prereleaseOrigin` → `0`. **Тяжесть:** S3 (один ложный вопрос владельцу). **Класс:** K1 _задание обновления спрашивает уже
   решённое_ — половина #107 не дошла до `policyInterval`.
2. **R2 + находка 5 судьи — навыки циклов держат КОПИЮ машинного факта, заполненную при развёртывании; кэш `fills` в манифесте возвращает её.**
   **ТОЛЬКО В ОТЧЁТЕ.** **Сверка: CONFIRMED.** `framework/skills/autoloop/SKILL.md:62` ``4. **Build** (`<BUILD_COMMAND>`). If errors — fix
   them, don't commit broken state.`` и `:64` ``6. **Verify autonomously** on the harness (`<TEST_HARNESS>`). Look at the result carefully —
   don't``; то же в `dayloop:58`, `nightloop:48`. Кэш побеждает свежий вывод: `KAIF-CORE.mjs:752` `  const fills = { ...(cached || {}) };`,
   `:761` `…if (!(s in fills)) fills[s] = v;` — рендер шаблона (`diff --render`, замена файла) подставит старое значение из
   `.kaif/deploy-manifest.json`. `TWINS: searched <[A-Z_]{4,}> in framework/skills/*/SKILL.md — found 12 machine-fact slots (+5 <PROJECT>): <BUILD_COMMAND>/<TEST_HARNESS> в
   autoloop, dayloop, nightloop; <COMMIT_COMMAND> в autoloop:74, dayloop:71, nightloop:60, report-bug:220, release:128, propose-idea:62` (×5
   зеркал; поле насчитало «15 files» = 3 канона + 12 зеркал). 2.8 унёс такие факты в `HOUSE_RULES.md` (скелет: `## 3. Stands, environments and
   devices`, `## 6. Tools of this project`), но слоты в навыках остались. **Тяжесть:** S3 (ручная правка 15 файлов; латентный откат пути adb).
   **Класс:** K2 _копия машинного факта вне HOUSE_RULES_.
3. **R3 — факт машины в руководстве стал ложью в тот же день.** Поле само: «No framework change needed». **Сверка: REFUTED как дефект KAIF** —
   лечение уже в 2.8 (скелет HOUSE_RULES `## 4. Environment dossier — the facts of the machine`). S3.
4. **Судья, «Informational» — указатели руководства называют английские заголовки скелета, а у проекта они русские** («The AGENT_GUIDE
   pointers "Tools of this project" / "Stands" name the template headings (.kaif/_house-rules-template.md §6/§3).»; следующей фразой судья
   называет русские заголовки §6 и §3 проекта). **ТОЛЬКО В ОТЧЁТЕ.** **Сверка: CONFIRMED** — `TWINS: searched 'HOUSE_RULES.md` → "…"' и
   'STATUS.md` → "…"' — found 8: AGENT_GUIDE:223, :764, :771; refresh-context:36; autoloop:16; fable-judge:68; kaif-go:23, :28`. S3.
   **Класс:** K5 _поставка адресует раздел проектного документа по английскому заголовку шаблона_ (близнецы — #118 п. 9, #121 п. 10).
5. Прочее, не KAIF: находка 1 (неназванная ручная правка), 2 (чекпойнт `policy-changes` не записан, а черновик говорил «all eight task
   items») — ошибки агента; 3 (`⚠ undelivered KAIF field report`) — по замыслу; 4 (`grep.exe.stackdump`) — окружение msys. Первый `check`
   «`8 mirror copies lag the canon`» — по замыслу (`KAIF-CORE.mjs:3565` «normal until re-sync»).

### Что в поле сработало (2.8 живьём)

- Репетиция = бой: «`cmp` over the 11 changed files | 10 byte-identical; `.kaif/kaif.json` differs only in `history[0].date` (13:36:32 vs 13:36:01)».
- `stale-claims` пунктом-чекпойнтом: «"scan ran clean (executed by the checkpoint itself)"».
- Прогноз `closing-gates` поймал двери до закрытия: «experience-lint STOPS (2 × `no-mechanization-field`), attribution-lint STOPS (3 NEW)» →
  «`0 findings` · `new 0` · open».
- Ядро голоса не потребовало действия — судья: «The portrait already is the 2.8 snapshot, so no owner-voice-core item was due.»

### Приём поля (открытые баги истока)

`bugs/110` — нет · `bugs/111` — нет (вопрос владельцу ещё не задан: «his choice is recorded when he answers») · `bugs/113` — нет · `bugs/114` —
нет · `bugs/116` — нет · `bugs/121` — нет («hooks module (not wired)») · `bugs/123` — нет · `bugs/125` — нет («the owner's contour page (no
interviews in this project yet)») · критерии 5/6/22 — нет.

### Слова владельца проекта

Нет (новых слов в отчёте нет; в вердикте судьи — только цитата из журнала решений проекта «берем тот мобильный клиент, который активно
развивают», прежняя).

---

## #118 — Unliminium, 2.7 → 2.8, bootstrap с репетицией, перевод целиком, пять исполнителей слияния

### Маршрут

- **Версии:** 2.7 (2026-09-18) → 2.8 (2026-09-26). **Путь:** «`bootstrap` (thin `KAIF.md` v2.8), the live pass bound to a sandbox receipt
  with `--rehearsal`»; превью `diff --source` ядром 2.7.
- **ОС:** «Windows 11 Pro 10.0.26200, Node v24.15.0». **Язык:** ru, «canon fully localized to Russian, `i18n: translated`».
- **Модель:** «one session (Claude Opus 5.5) + five parallel merge executors (subagents, one brief, per-file diffs)».
- **Длительность:** заявлено «≈ 13:33 … ≈ 14:40 +03:00», поправлено комментарием 1 на «≈ 13:33 … 14:36 (commit `95ec2eb`; the second judge
  pass and its corrections followed until the push)»; хвост — предложение `/kaif-update` вписано в 15:34, хук сработал живьём в 16:06 +03:00.
  Итого ≈ 1 ч + два судьи + хвосты до ~16:10.
- **Масштаб:** «`63 module(s) await your merge` in 20 files»; коммиты `395e80f` (30 файлов) и `ae2b6b6` («42 files changed, 1711
  insertions(+), 464 deletions(-)»).

### Дефекты и трение

1. **R1 (S2) — после замены ядра голоса `kaif-voice-lint check` читает §8 оболочки, а не слепка.** **ТИКЕТ #116.** **Сверка: CONFIRMED**
   пробой: портрет (оболочка §8 без столбцов + слепок §8 со строкой `stop`) → `⚠ AUTHOR_STYLOMETRY.md: a table in §8 (line 5) lacks the
   pattern/hint columns — its header: регистр · пример` и `voice-lint SKIPPED … (exit 3)`; причина —
   `framework/tools/kaif-voice-lint.mjs:242` `    if (Object.values(KEYWORDS).some((k) => k.section.test(m[1])) ||
   SECTION_NUMBER.test(m[1])) { start = i; break; }` (первый §8 побеждает). S2. Класс: K7.
2. **R2 (S3) — поставка заставляет агента спрашивать, подключать ли то, что KAIF поставляет.** **ТИКЕТ #115.** **Сверка: CONFIRMED** —
   `framework/hooks/settings-fragment.json:2` «wiring the hooks is an explicit opt-in step done by the project owner (or by the agent with the
   owner's quoted consent).». S3. Пересечение: открытый `bugs/121` (док опт-ина хуков).
3. **R3 (S3) — `stale-claims` молчит на «**KAIF** (версия 2.7)».** **ТИКЕТ #117.** **Сверка: CONFIRMED** пробой: строка `- **KAIF** (версия
   2.7) — развёрнут.` в STATUS копии → `stale-claims 2.7 → 2.8: 1 line(s) assert an older version` — её в списке нет; цитата поля верна:
   `KAIF-CORE.mjs:1327` `      let judged = isProse ? scan.replace(/(?<!\])\([^)]*\)/g, '') : scan;`. S3. Класс: K8.
4. **R4 (S3) — классификатор агентской системы отказал исполнителю записать предложение «no owner's approval is awaited» в навык.**
   **ТОЛЬКО В ОТЧЁТЕ.** **Сверка: NOT-VERIFIABLE-HERE** (классификатор Claude Code auto mode — не воспроизводим в контейнере). Текст поставки
   CONFIRMED: `framework/skills/kaif-update/SKILL.md:102` `   no owner's approval is awaited). **Re-measure before a public correction:** …`
   — и он УЖЕ несёт источник строкой выше (`:101` «the KAIF owner's standing authorization, origin issue #15;»), так что пожелание 4 поля
   («carry their source inline») как лекарство — не доказано. `TWINS: searched "standing authorization" in framework/*.md — found 7:
   AGENT_GUIDE ×2, kaif-update, report-bug, fable-judge, KAIF_REFERENCE, readmes/reports.md:17 («No owner's approval is awaited»)`. Судьба:
   предложение вписано в 15:34 по ответу владельца «Вписать (рекомендую)» (комментарий 1). S3. Класс: K13 _постоянное разрешение в тексте
   инструкции выглядит для классификатора как инъекция_.
5. **R5 (S3) — дверь с памятью, запущенная посреди обновления, чтобы посмотреть бюджеты, записала базу 2.8 до слияния.** **ТОЛЬКО В ОТЧЁТЕ**
   (близнец #121 R6). **Сверка: CONFIRMED** пробой: `node .kaif/kaif-core.mjs check --gate-budgets` на свежем развёртывании → `✅ manifest
   satisfied: 103 files + 152 agent artifacts present`, EXIT=0, и `git status --short` → `?? .kaif/budget-baseline.json` (`"docs": {}`).
   Пункт задания обещает обратное: `KAIF-CORE.mjs:1545` «(measured read-only — nothing was written)» и называет дверью именно эту команду
   (`:260` ``  const door = '`node .kaif/kaif-core.mjs check --gate-budgets`';``); запись — `:3866` `    if (!existsSync(BUDGET_BASELINE) ||
   readFileSync(BUDGET_BASELINE, 'utf8') !== body) writeFileSync(BUDGET_BASELINE, body);`. Близнец: `help` не помечает `check` знаком ⚠
   («Commands (⚠ = mutates the tree)») — строка `check` в `COMMANDS` (`:4466`) без `mutating: true`. Флага `--dry-run` у двери нет. S3
   (наблюдено) → S2, если не поймано (первое закрытие стоит). Класс: K3 _дверь с памятью под видом замера_.
6. **R6 («S4») — автоматическая запись репетиции ядра 2.7 переживает прогон загрузчика с явной квитанцией.** **ТОЛЬКО В ОТЧЁТЕ** (поле:
   «Same as wish 5 of the 2.7 report»). **Сверка: CONFIRMED** чтением: `KAIF-CORE.mjs:2447` `  const path = explicit || REHEARSAL;`
   (при `--rehearsal` путь по умолчанию не читается вовсе) и `:2475` `function consumeRehearsal(r) { if (r && !r.explicit) { try {
   unlinkSync(r.path); } catch { /* already gone */ } } }`. А новость 2.8 обещает: `tools/build-framework.mjs:310` «it also removes a
   rehearsal record the 2.7 core wrote» — верно только без `--rehearsal`, то есть НЕ на рецепте, который советует сам `/kaif-update`. S3
   (файл git-игнорируется). Класс: K4 _новость шире кода; одноразовая запись убирается только по пути, которым её прочли_.
7. **Комментарий 1 — поставочный навык ссылается на план истока: `.claude/skills/fable-judge/SKILL.md:10 → plans/16`** (нашёл `refs:lint`
   проекта). **ТОЛЬКО В ОТЧЁТЕ.** **Сверка: CONFIRMED** — `framework/skills/fable-judge/SKILL.md:10` ``> hunts** block in step 4 (added in
   KAIF 1.6 — weak-model guardrails, `plans/16`); (4) the``. `TWINS: searched plans/[0-9]+ in framework/skills — found 4 more: plans/13 в
   fable-domain:13, fable-judge:17, fable-loop:10, fable-method:14` (у проекта со своим `plans/13` они молча ведут в чужой план — хуже, чем
   битая ссылка). S3. Класс: K10 _вендоренный текст несёт номера документов истока_.
8. **Комментарий 2 (и тот же текст — комментарий 1 к #115) — `kaif-provenance check` на переведённом развёртывании видит только английские
   пары; с объявленными `aiMarks` — 255 ложных открытых меток на упоминаниях метки в прозе.** **ТОЛЬКО В ОТЧЁТЕ** (своего тикета нет).
   **Сверка: CONFIRMED** двумя пробами. (а) Установка `--lang ru` не пишет `aiMarks` (`grep -c aiMarks .kaif/kaif.json` → `0`; в ядре
   `aiMarks` не встречается ни разу), и незакрытая `[ИИ]` в `ideas/01_x.md` → `✅ provenance check OK — pairs intact in 247 file(s)
   (canonArtifacts declared empty — no canon yet; only mark hygiene was checked)`, EXIT=0 — ложный зелёный той же формы, что «pairs intact
   in 696 file(s)» поля. (б) Подпись решения `[AI]`, написанная по правилу 2.7 (`framework/AGENT_GUIDE.md:978` «the agent's — `[AI]`»)
   прозой: `- [AI] выбран вариант Б — проще.` → `✖ plans/01_x.md:5 — [AI] never closed` / `✖ provenance check FAILED: 1 issue(s)`, EXIT=1.
   Канон знает о столкновении только скрытым HTML-комментарием `framework/AGENT_GUIDE.md:980` ``  <!-- keep every `[…]` tag inside a
   one-line code span: the provenance parser reads spans per line -->`` — видимого правила _подпись — в код-спане_ нет
   (`TWINS: searched -i "code span" in AGENT_GUIDE, skills, house-rules template — found 1: только этот комментарий`). S3 (модуль разжалован
   полем в «advisor rather than a gate»). Класс: K6 _страж, чей словарь задаётся необязательным ключом маркера, молча зеленеет_ + _один
   токен — две конвенции_ (пара происхождения `[AI]…[/AI]` и подпись авторства `[AI]`).
9. **Судья, находка 5 (косметика) — отказ хука и навык судьи цитируют английский заголовок «The owner's word mid-turn», а в русском
   руководстве он «Слово владельца посреди хода».** **ТОЛЬКО В ОТЧЁТЕ.** **Сверка: CONFIRMED** — `framework/hooks/pretool-owner-word.mjs:97`
   `(AGENT_GUIDE → «The owner\'s word mid-turn»;`; `TWINS: searched AGENT_GUIDE.md → "…" in framework/hooks/*.mjs — found 4 more:
   prompt-resume-word.mjs:102 ("The owner's word mid-turn"), :111 ("A leading skill word is an order"), prompt-refresh-timer.mjs:85,
   session-start-refresh.mjs:66 ("Context refresh")`. На переведённом развёртывании адрес ведёт в никуда. S3. Класс: K5.
10. **Судья, находка 6 — команда коммита `git add -A` рядом с правилом гигиены.** В поле строка проектная (AGENT_GUIDE:731), но близнец в
    поставке: `framework/skills/end-chat-soft/SKILL.md:113` `` pushes), run it. Otherwise: git add -A && git commit -m "..." && git push.>` ``
    (и `end-chat-force:36`) против `framework/AGENT_GUIDE.md:558` «a commit tool that stages everything (`git add -A`) AFTER your inspection
    makes the two different». **Уже в реестре: `ideas/31` п. 27**; то же назвали #126, #131. **Сверка: CONFIRMED.** S3.
11. **Комментарии 3–4 — хук слова владельца сработал живьём, но ответ так и не стал текстом: 108 вызовов.** **ТОЛЬКО В ОТЧЁТЕ** (полевое
    наблюдение к `bugs/123`). **Сверка: CONFIRMED как известный GAP стража** — `framework/hooks/pretool-owner-word.mjs:8` «the tool call is
    BLOCKED (exit 2) ONCE»; строка `GAP:` — `:34` `//                 written between calls may still land as reasoning — the order
    makes the final text of the turn carry it; a`. Поле показало, что один отказ этого не обеспечил. S2 (владелец не получил ответа ~15 мин). Класс: K12 _ответ между
    вызовами не доходит до чата_ — рецидив `bugs/123`; кандидат — `ideas/31` п. 4 (Stop-хук над последним ответом).
12. Не KAIF / проектное: «Goal/Architecture skip» и счёт модулей (ошибка счёта агента); `BOUNDARY:` переведён (слияние проекта); две метки
    «записано» без пробы часов (агент; класс `ideas/31` п. 23/25); «policy-changes checked off without an owner prompt» — у чекпойнта
    `policy-changes` нет обработчика в `cmdCheckpoint` (`grep "=== 'policy-changes'"` → пусто), он только аттестуется — снимется #114.
    Нарезка задания на файлы «30-line splitter» — трение поля, как дефект не названо.

### Что в поле сработало (2.8 живьём)

- Загрузчик и репетиция: «`cmp` equal to `framework/installer/KAIF-LOADER.mjs` at `v2.8`»; «`rehearsal verdicts loaded … (20 file(s))`, the
  same counters; `verdict-mismatch` items: 0».
- Ядро голоса заменой с проверкой байтов: «`checkpoint owner-voice-core` → `the snapshot part … equals the release snapshot byte for byte (sha
  f922c8043d52)`».
- Зов: «`--call "test call" --dry-run` → `CALL · main (dry run, no sound): Николай, это мейн. Test call`».
- Долг владельца первым: «`--queue --list` (reads the home queue as "the project keeps its own queue" and names two answered decisions first:
  18 and 17 days)».
- Свёртка журнала опыта: «`120 failure entries … predate the first classed entry` — the 2.8 fold, one line instead of 120».
- Линтеры 2.8: «row 1 not closing the owner's debt → `owner-debt-not-first`»; «"not reproduced" with 3 hunt variants → OK; with 2 →
  `hunt-too-short`».
- Пятый хук живьём без перезапуска клиента: «Claude Code picked the hook up from `.claude/settings.json` without a restart, and it fired live
  in the same session at 2026-09-26 16:06 +03:00» — «the next tool call was refused at 13:07:17Z with his exact words».
- Доставка `report` ×3 (#115–#117) и `stale-claims` → «`0 line(s)`».

### Приём поля (открытые баги истока)

- `bugs/110` — нет. Ближайшее: «The anchored owner blocks of AGENT_GUIDE (creed, prayer, vibe) are byte-identical before and after (md5)» —
  обновление символ веры не тронуло, слова блока не процитированы.
- `bugs/111` — нет (через `/interview` вопросов не было). Вопросы шли ЧАТОМ: «the agent asked in the chat (a four-line scenario, two options)»
  — ответ свободным текстом; второй — «on the owner's answer «Вписать (рекомендую)» ("write it in") to a chat question» — выбор, но не через
  навык интервью.
- `bugs/113` — нет («the shipped page generator (the home page stays — the owner's standing rule allows a working home twin beside the shipped one)»).
- `bugs/114` — нет (интервал 2.7 → 2.8 переименований не несёт: `RENAMES_BY_VERSION` в `tools/build-framework.mjs` имеет только ключ `'2.7'`).
- `bugs/116` — нет.
- `bugs/121` — нет (смоук хука — синтетические транскрипты агента, не README-проба в PowerShell владельца).
- `bugs/123` — **есть наблюдение, КРАСНОЕ (рецидив, не DONE):** комментарий 3 — «the owner wrote mid-turn at 13:06:48Z;» · «the next tool call
  was refused at 13:07:17Z with his exact words;» · «the call after it passed at 13:07:25Z.» · «The first recorded text about the owner's word came
  at 13:21:36Z, 108 tool calls later. That is the origin bug 123 class the hook guards against. One refusal did not bring the answer into the
  chat»; комментарий 4 сузил: «there is no text block between 13:06:48Z and 13:11:01Z, and that the thinking blocks in that window have empty
  content. Where the answer the agent believed it had written went cannot be seen.» Мера DONE `bugs/123` — «вызовов до первого ответа 0» — не выполнена.
- `bugs/125` — нет.
- Критерий 5 («стоп») — нет (содержание слова владельца в 13:06:48Z не названо). Критерий 6 («переключись») — нет. Критерий 22 — нет:
  «`.kaif/_explain-page-template.html` (nothing to explain yet)».

### Слова владельца проекта (дословно)

- «выполни обновление KAIF до 2.8»
- «все, что каиф приносит в поставке - подключить. И заведи импрувмент в КАИФ, чтобы агенты этого не спрашивали, как вот ты сейчас спросил,
  а сразу автоматом подключали» (2026-09-26 13:51 +03:00)
- «Вписать (рекомендую)» (выбор варианта в чате, 15:34 +03:00)
- Слово владельца KAIF из #103, процитированное судьёй: «всем проектам, работающим по KAIF - при одновлении на 2.8 нужно будет и обновить
  ядно на новое, не мержем, а заменой!»

---

## #121 — NDim Space, 2.7 → 2.8, bootstrap с репетицией, восьмой интервал подряд, три судьи

### Маршрут

- **Версии:** 2.7 → 2.8; «**Eighth consecutive interval on this deployment** (1.6 → 2.0 → 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.7 → 2.8)».
- **Путь:** «bootstrap (thin KAIF.md → KAIF-LOADER.mjs), sandbox rehearsal bound by `--rehearsal`, ONE downloaded release folder handed to both
  runs as `--source`».
- **ОС:** «Windows 11 Pro 10.0.26200 · **Node:** v24.15.0». **Язык:** «i18n: translated (Russian owner docs and most skill bodies), lang ru,
  tracking origin, 5 agent systems».
- **Модель:** «the project's agent (Claude Code — Opus 5.5, 1M context)» + три субагента слияния + три судьи.
- **Длительность:** «started 13:33 +03:00»; судья 3 — «~14:50 +03:00»; тикет создан 11:49:43Z. ≈ 1 ч 20 мин.
- **Масштаб:** «**Manual merge — 49 modules into 17 translated files**»; AGENT_GUIDE «2722 → 2522».

### Дефекты и трение

1. **R1 (S2, near-miss) — дверь бюджета печатает `cp`, который затёр бы заполненный `HOUSE_RULES.md`.** **ТИКЕТ #113** (его видели и #129).
   **Сверка: CONFIRMED** — `KAIF-CORE.mjs:140` `const MOVE_OUT_ADDRESS = 'HOUSE_RULES.md (no file yet: cp .kaif/_house-rules-template.md
   HOUSE_RULES.md) for local rules, routes and tools · the chronicle PROJECT_HISTORY.md · researches/';`; проба: при существующем
   `HOUSE_RULES.md` `check` печатает `HOUSE_RULES.md (no file yet: cp .kaif/_house-rules-template.md HOUSE_RULES.md)`. S2.
2. **R2 (S3) — `policy-changes` спрашивает владельца о правилах, которые KAIF уже отгрузил.** **ТИКЕТ #114.** **Сверка: CONFIRMED**
   (`KAIF-CORE.mjs:1488`, цитата в #108 п. 1). **Подпункт ТОЛЬКО В ОТЧЁТЕ — противоречие внутри одного задания:** «`policy-changes` puts the
   field-report rule to the owner, while the `field-report` item says "no owner's approval is awaited"». **CONFIRMED:** первое правило
   списка 2.8 — `tools/build-framework.mjs:421` «The field report of every update and install is SENT to KAIF without asking the owner», а
   хвост пункта `field-report` — `KAIF-CORE.mjs:996` «the KAIF owner's standing authorization, origin issues #15 and #78: no owner's approval is
   awaited». Задание просит спросить владельца, можно ли не спрашивать владельца. S3. Класс: K1.
3. **R3 (S3) — очередь поставки читает ЗАКРЫТЫЕ статусы проекта как открытые («перенесено», «СНЯТО»).** **ТОЛЬКО В ОТЧЁТЕ** (поле: «sibling
   of #109»; #109 — про отрицание «не отвечен», другой словарь). **Сверка: CONFIRMED** пробой `docStatus` на копии `core.mjs`:
   `"none" ← ➡️ перенесено 2026-09-25 в интервью №096` · `"none" ← ⛔ СНЯТО 2026-08-28 решением №058` · `"none" ← ⛔ WITHDRAWN 2026-08-28 by
   decision 058` · `"closed" ← ✅ ЗАКРЫТО 2026-08-28`; «none» = живой (`framework/tools/contour/core.mjs:177` `…// no status line — the
   document is LIVE`, возврат `:182` `  return 'none';`). Словарь закрытия — только эмодзи и «ОТВЕЧЕНО»: `framework/tools/contour/texts.mjs:46`
   `  statusClosed: '✅|🟢|STATUS:\\s*DONE|ANSWERS\\s+RECEIVED|ОТВЕЧЕНО',` — даже английского `WITHDRAWN` нет, хотя сам контур пишет
   «withdrawn»/«снят» (`texts.mjs:170`, `:283`). Предложенная в #109 починка (`✅?\s*\*{0,2}(CLOSED|ЗАКРЫТ\p{L}*|WITHDRAWN|СНЯТ\p{L}*)`) закроет СНЯТО, но
   не «перенесено». Цена в поле: «`🔴 ГЕЙТ (I42): ни разу не показанных — 2`», «протух в очереди (29 дн. > 14)». S3 сейчас → S2 после
   перехода проекта на поставочный контур («after the planned switch to the shipped contour it would»). Класс: K9.
4. **R4 (S3) — проверка _заменой, не слиянием_ не уживается с инструментом штампа, которого сама же называет.** **ТОЛЬКО В ОТЧЁТЕ.**
   **Сверка: CONFIRMED** — хеш берётся от первой строки слепка до КОНЦА файла: `KAIF-CORE.mjs:1449` `  return at < 0 ? null :
   lines.slice(at).join('\n');`, а инструкция `:1477` велит «a project tool that stamps its own blocks INTO the portrait runs after this
   checkpoint». После штампа `portraitSync` (`:1461`) не узнаёт свой слепок → повторный прогон того же выпуска (и следующий выпуск с тем же
   ядром голоса 2.2) снова выдаст пункт замены; на маршруте передачи `checkpoint recheck` ОТКАЖЕТ (`:4122`). Способа объявить блок штампа нет.
   S3. Класс: K7 _побайтная проверка "до конца файла" против законного соседа_.
5. **R5 (S3) — команда скачивания портрета предполагает POSIX `curl`.** **ТОЛЬКО В ОТЧЁТЕ.** **Сверка: CONFIRMED** — `KAIF-CORE.mjs:1477`
   «(1) Fetch the release file: \`curl -fsSL ${ownerVoice.url} -o ${PORTRAIT_FILE}.release\`». `TWINS: searched "curl " in framework
   (*.md, *.mjs, без языковых пакетов) — found 1: только это место`. Поведение PowerShell 5.1 (`curl` = `Invoke-WebRequest`) —
   NOT-VERIFIABLE-HERE (Linux). S3. Класс: K7 (хвосты VO).
6. **R6 (S3) — первая дверь храповика должна быть ПОСЛЕДНИМ шагом обновления, и об этом нигде не сказано.** **ТОЛЬКО В ОТЧЁТЕ** (близнец
   #118 R5). **Сверка: CONFIRMED** пробой: STATUS 224 своих строки → `check --gate-budgets` → `↳ STATUS.md: own lines 224 of budget 200 … —
   debt recorded in .kaif/budget-baseline.json (first gate of 2.8) — from the next closing it passes only while it shrinks`; +3 строки → `✖
   STATUS.md: own lines 227 of budget 200 … — grew 224 → 227 since the last closing`, EXIT=1. Пункт `closing-gates` (`:1545`) не говорит
   _запусти дверь после последней правки канона_. S3 → S2 (остановленное закрытие). Класс: K3.
7. **R7 (S3) — база линтера атрибуции хранит строки дословно, и проектный страж запретных слов краснеет на ней.** **ТОЛЬКО В ОТЧЁТЕ.**
   **Сверка: CONFIRMED** — `framework/tools/kaif-attribution-lint.mjs:339` ``  for (const f of findings) entries[f.key] = `${f.file}:${f.line}
   ${f.text.slice(0, 100)}`;`` (100 символов текста в коммитуемый файл). Тот же механизм — у #111 (строки git-игнорируемых `*.md` в базе:
   корень читается мимо git — `:308` `    for (const n of readdirSync(root)) if (/\.md$/i.test(n) && !TRANSIENTS.has(n)) {`); поле
   подтверждает #111 и само: «736 vs 737 files — the live tree has one git-ignored file more». S3. Класс: K11.
8. **§1 п. 10 + судья 1, находка 5 — маркер `KAIF-VERSION-OK` строкой ВЫШЕ разрезал дословную цитату владельца в комментарии кода.**
   **ТОЛЬКО В ОТЧЁТЕ.** **Сверка: CONFIRMED** (вариант _строкой выше_ предлагает сама поставка) — `KAIF-CORE.mjs:4429` «a correct line takes
   <!-- KAIF-VERSION-OK: reason --> on it or on the line above», код — `:1310`. Для кода (комментарии с переносом) строка выше —
   вставка новой строки в чужой текст. S3. Класс: K8.
9. **Судья 1, находка 2 — `stale-claims` принял версию ядра голоса «2.2» рядом со словом KAIF за заявление о версии KAIF.** **ТОЛЬКО В
   ОТЧЁТЕ.** **Сверка: CONFIRMED класс** (точная строка STATUS:26 в отчёте не дана целиком — сама строка NOT-VERIFIABLE-HERE): проба `-
   Портрет голоса: слепок ядра 2.2 от KAIF заменил ядро 1.2.` → `· STATUS.md:84 — - Портрет голоса: слепок ядра 2.2 от KAIF заменил ядро 1.2.
   (asserts 1.2)`. Это N3 разведки 2.8 (`researches/32` §2д: «stale-claims принимает версию ПРОДУКТА рядом со словом KAIF») — в 2.8 не
   закрыт: `isPair` (`KAIF-CORE.mjs:1238–1245`) берёт любую версию в 16 символах от слова KAIF. S3. Класс: K8.
10. **Судья 1, находка 8 — `PARKED:` адресован в `STATUS.md` → "Where to continue", а у проекта такого раздела нет.** **ТОЛЬКО В ОТЧЁТЕ.**
    **Сверка: CONFIRMED** — `framework/AGENT_GUIDE.md:643` ``   line; "switch to Y" → first a `PARKED:` line (where the task stands, how to
    resume) at the top of `STATUS.md` → "Where to``; раздел есть только в скелете (`framework/STATUS.md:69` `## Where to continue next
    session`). Близнецы — K5 (#108 п. 4, #118 п. 9). S3.
11. По замыслу / проектное: зеркала отстали после поздней правки (судья 3 — `check` сам назвал «4 mirrors drifted»); `PROJECT_HISTORY.md` в
    `SKIP_FILES` (`:1206`) — по замыслу; ложные строки слияния в BUG_FIXING/STATUS/EXPERIENCE, `.private/`, «203 → 200» — ошибки агента,
    пойманные судьями; `npm run guards` exit 1 — проектный страж. Строка цены входа «~ 223k tokens — 22 %» — справка, `ideas/31` п. 24.

### Что в поле сработало (2.8 живьём)

- Рецепт _одна папка на оба прогона_: «`diff sandbox-run.log live-run.log` → **exactly one line** (the rehearsal line)» · «**Sixth consecutive
  interval where the rehearsal predicted the battle, and the first with a one-line log difference** — the 2.7 judge's recipe fix (one folder for
  both runs) works».
- Лёгкий канон: «TESTING_FRAMEWORK own lines (the core's `ownLines`): 584 → **299 of budget 300**».
- Ядро голоса 2.2: «`kaif-voice-lint check` now runs "21 stop rule(s)" instead of `SKIPPED`» (слепок без оболочки над ним — #116 не задет).
- Хук: «unanswered mid-turn owner message → exit 2 quoting the Cyrillic text; answered → 0; a subagent's call → 0».
- Чужая очередь не тронута: «`ℹ очередь у проекта своя … никогда не пишется`».
- Прогноз закрытия и поиск: «the `closing-gates` forecast named the attribution STOP before any closing met it; `--search` found the owner's
  three prior answers in one command»; «the 277 unclassed old entries fold into one line as 2.8 promised».
- Храповик как задуман (судья 2): «`check --gate-budgets` → exit 1 "stood still at 2522 since the last closing", which is the ratchet working
  as designed».

### Приём поля (открытые баги истока)

- `bugs/110` — нет (символ веры в отчёте не упомянут; у проекта свой инструмент штампа: «`node tools/stamp-creed.mjs --check` 20 documents»).
- `bugs/111` — **частично:** вопрос через интервью, ответ ВЫБОРОМ за 3 минуты — «The other five went to him as one question (interview №105);
  he answered on the page under three minutes after it was raised (lock `startedAt` 13:58:51, answer 14:01:36 +03:00): A, with the comment
  quoted in R2»; судья 1: «`decision.json`: `choice А`». Сценарная форма вопроса в отчёте не показана, страница — своя проектная. Решать
  главной сессии; слова о непонимании нет.
- `bugs/113` — нет («the project still runs its own page»).
- `bugs/114` — нет (интервал 2.7 → 2.8 без переименований).
- `bugs/116` — нет.
- `bugs/121` — нет: «Smoke through `cmd /c "node … < file"`» — агентом, через cmd, не проба README владельцем в его PowerShell.
- `bugs/123` — нет: «**NOT exercised:** the fifth hook inside a live Claude Code `PreToolUse` event (first real mid-turn message is its
  functional check)».
- `bugs/125` — нет («the shipped contour's page, `--wait` and the partial save (the project still runs its own page; switch planned)»).
- Критерии 5/6 — нет; критерий 22 — нет: в списке «**NOT exercised:**» стоит «the explain-page template».

### Слова владельца проекта (дословно)

- «*принимаем, и заведи импрувмент в КАИФ - чтобы агенты больше такого не спрашивали у владельца. Что каиф с обновлением поставляет - то и
  принимают без вопросов*» (страница, 2026-09-26 14:01 +03:00, интервью №105, В1 = А)
- Прежнее решение, поднятое судьёй как долг: интервью №093, В2 = Б «*Перейти сейчас, на этой неделе*» (2026-09-18 19:24).
- Приказ в чате «*выполни обновление KAIF до 2.8*» — судья: не проверяемо («The chat is not available to this judge»).

---

## Сводно: классы механизмов KAIF (класс, а не инцидент — EXP-0115)

| Класс | Механизм | Вхождения в трёх отчётах | Близнецы на HEAD |
|---|---|---|---|
| K1 | `policy-changes` — вопрос владельцу о решённом | #108 R1 (предрелиз) · #121 R2 (+ противоречие с `field-report`) · #118 чекпойнт без вопроса | `:1482`/`:1488`; предрелиз учтён только в новостях (`:1556`) |
| K2 | Слот развёртывания = копия машинного факта | #108 R2 + судья 5 | 12 слотов в 6 навыках ×5 зеркал; кэш `fills` побеждает (`:752`) |
| K3 | Дверь с памятью под видом замера | #118 R5 · #121 R6 | `:1545` «read-only» ↔ `:3866` пишет; `check` без ⚠ в `help` |
| K4 | Новость шире кода (запись репетиции) | #118 R6 | `build-framework.mjs:310` ↔ `:2447`/`:2475` |
| K5 | Адрес по английскому заголовку шаблона в переведённом/проектном документе | #108 судья · #118 судья 5 · #121 судья 8 | 5 сообщений в 4 хуках + 8 указателей в каноне/навыках |
| K6 | Словарь стража из необязательного ключа; один токен — две конвенции | #118 комм. 2 (= #115 комм. 1) | `aiMarks` не сеется; `[AI]`-подпись ↔ `[AI]…[/AI]` |
| K7 | Проверки ядра голоса (первый §8; хеш до конца файла; `curl`) | #118 R1 (#116) · #121 R4, R5 | `voice-lint:242`, `KAIF-CORE:1449`, `:1477` |
| K8 | Точность `stale-claims` | #118 R3 (#117) · #121 судья 2 · #121 п. 10 | скобка `:1327`; `isPair :1244`; «line above» `:4429` |
| K9 | Словарь закрытого статуса очереди | #121 R3 (+ #109) | `texts.mjs:46` |
| K10 | Номера документов истока в вендоренных навыках | #118 комм. 1 | `plans/16` ×1, `plans/13` ×4 |
| K11 | Машинная база хранит строки дословно / мимо git | #121 R7 (+ #111, #112) | `attribution-lint:339`, `:308` |
| K12 | Ответ посреди хода не доходит до чата | #118 комм. 3–4 | GAP стража `pretool-owner-word.mjs`; `bugs/123` |
| K13 | Классификатор агентской системы против текста постоянного разрешения | #118 R4 | NOT-VERIFIABLE-HERE |

## Приём поля — сводка для главной сессии

| Ожидание истока | #108 KAST | #118 Unliminium | #121 NDim | Итог |
|---|---|---|---|---|
| `bugs/110` (СТАРАЕМСЯ после обновления ru) | нет | нет (блоки веры побайтно не тронуты) | нет | ждёт дальше |
| `bugs/111` (вопрос сценарием через `/interview`, ответ выбором) | нет | нет (чат, не навык) | частично: №105, ответ А за 3 мин; сценарий не показан | решать главной сессии |
| `bugs/113` (Готово без замечаний) | нет | нет | нет | ждёт |
| `bugs/114` (строка renamed … baton → … handover) | нет | нет | нет | недостижимо на 2.7 → 2.8 (переименования только в `'2.7'`) |
| `bugs/116` (неделя без окна/звука) | нет | нет | нет | ждёт |
| `bugs/121` (проба README в PowerShell владельца) | нет | нет | нет (cmd, агентом) | ждёт |
| `bugs/123` (0 вызовов до ответа) | нет | **КРАСНОЕ**: 108 вызовов до текста | нет (не наблюдено) | рецидив в поле |
| `bugs/125` (очередь ≥2, возврат на список) | нет | нет | нет | ждёт |
| критерии 5/6/22 | нет | нет | нет | ждут |

## Итоговая таблица

| Тикет · пункт | Вердикт сверки | Тяжесть | Цена (чатов) | Кандидат-эпик (рабочее имя) |
|---|---|---|---|---|
| #108 R1 — `policy-changes` при предрелизе | PARTIAL | S3 | 0 сверх #114 (строка «probably in place» у правил) | UP-2 _Обновление не спрашивает решённого_ (с #114) |
| #108 R2 + судья 5 — слоты `<BUILD_COMMAND>`/`<TEST_HARNESS>` | CONFIRMED | S3 | 0,5 (указатель на HOUSE_RULES, снятие слотов, кэш `fills`, свод s21) | UP-2 |
| #108 R3 — факт машины в руководстве | REFUTED (лечит 2.8) | — | 0 | — |
| #108 судья · #118 п. 9 · #121 п. 10 — английские заголовки | CONFIRMED | S3 | 0,5 (якоря/номера вместо заголовков + страж сборки) | L10N _Переведённое развёртывание: адреса и метки_ |
| #118 R1 = #116 | CONFIRMED | S2 | (группа #116) | VO-2 _Хвосты ядра голоса_ |
| #118 R2 = #115 | CONFIRMED | S3 | (группа #115) | UP-2 |
| #118 R3 = #117 | CONFIRMED | S3 | (группа #117) | SC-2 _Точность скана заявлений_ |
| #118 R4 — классификатор | NOT-VERIFIABLE-HERE (текст — CONFIRMED) | S3 | 0,25 разведка или ничего | — |
| #118 R5 · #121 R6 — дверь бюджета пишет посреди обновления | CONFIRMED | S3 → S2 | 0,25 (`--dry-run` или замер в пункте, строка _дверь — последней_, ⚠ в `help`; свод) | UP-2 |
| #118 R6 — запись репетиции 2.7 | CONFIRMED | S3 | 0,1 (удалять и авто-запись при явной квитанции + строка лога) | UP-2 |
| #118 комм. 1 — `plans/16`/`plans/13` в навыках fable | CONFIRMED | S3 | 0,1 (+ страж сборки на `plans/NN` в поставке) | Мелкое (`ideas/31` п. 5) |
| #118 комм. 2 — `kaif-provenance` на переводе | CONFIRMED | S3 | 0,5 (сеять `aiMarks` по языку, строка _читались только английские пары_, подпись vs пара) | L10N |
| #118 комм. 3–4 — ответ посреди хода не дошёл | CONFIRMED (GAP) | S2 | 0,5 разведка (Stop-хук, `ideas/31` п. 4) | OW-3 _Ответ владельцу текстом_ |
| #118 судья 6 — `git add -A` | CONFIRMED | S3 | уже `ideas/31` п. 27 | Мелкое |
| #121 R1 = #113 | CONFIRMED | S2 | (группа #113) | UP-2 |
| #121 R2 = #114 (+ противоречие `field-report`) | CONFIRMED | S3 | (группа #114) | UP-2 |
| #121 R3 — «перенесено»/«СНЯТО» открыты | CONFIRMED | S3 → S2 | 0,25 вместе с #109 | QV _Словарь закрытого статуса_ |
| #121 R4 — штамп против хеша слепка | CONFIRMED | S3 | 0,25 (объявленные блоки штампа вне хеша) | VO-2 |
| #121 R5 — `curl -fsSL` | CONFIRMED (PS 5.1 — NOT-VERIFIABLE-HERE) | S3 | 0,1 (`node -e` fetch) | VO-2 |
| #121 R7 — база атрибуции хранит текст | CONFIRMED | S3 | 0,1 вместе с #111/#112 | Линтер атрибуции (#111/#112) |
| #121 п. 8 — маркер строкой выше режет цитату | CONFIRMED | S3 | 0,1 (для скриптов — только на самой строке) | SC-2 |
| #121 п. 9 — версия ядра голоса за KAIF | CONFIRMED (класс) | S3 | 0,25 (N3 с 2.7) | SC-2 |

Итого по тому, что живёт ТОЛЬКО в отчётах: ≈ 2,5–3 чата, крупнейшие — UP-2 (≈ 1 с #113/#114/#115) и L10N (≈ 1).
