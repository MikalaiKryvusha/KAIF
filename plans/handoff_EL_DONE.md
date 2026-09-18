# Handoff EL — эпик «Урок, повторившийся дважды, краснеет»

> **Создан:** 2026-09-18 09:20 +03:00 · **Кем:** агент (Claude Opus 5) в отдельном git worktree
> `D:\work\ai_sandbox\KAIF\.claude\worktrees\agent-a67ace9be2fd6ac0c`, ветка
> `worktree-agent-a67ace9be2fd6ac0c` от HEAD `df8110b`. **Не пушено, `gh` не вызывался.**
> **Родитель:** `plans/114` (шаги EL0–EL6 исполнены; EL7 — здесь, текстами).
> **Отчёт прогона:** `testcases/reports/2026-09-18_experience-lint.md` — вердикт **partial**.
> **ВНЕСЕНО интегратором 2026-09-18 10:22 +03:00 (сессия 66, Fable 5.1):** § 2 охота и сводная строка — обе копии судьи побайтно ✅ · § 3 запись 2.7 ✅ · § 4 девять пар ✅ (пара журнала истока покраснела ложно — реестр резал журнал на «половины» по ЦИТАТЕ якоря в прозе; починен реестр, не пара) · § 6 четыре числа README ✅ · § 7 строки `plans/100` ✅ · § 9 урок → EXP-0141 ✅ · § 8 черновик ответа #69 остаётся ЗДЕСЬ до релиза (отправка — №84/№92/№93).
> **Статус:** 🔧 готов к вставке 2026-09-18 09:20 +03:00 — после вставки удалить файл или пометить `DONE`.
> **Вовне:** ответ в issue #69 (черновик § 7) — после релиза 2.7 по правилу №84/№92/№93.
>
> Этот файл — ТОЛЬКО для интегратора: тексты ниже готовы к вставке в файлы, которые worktree править
> не имел права (`plans/100`, `STATUS.md`, `MASTER_PLAN.md`, обе копии `fable-judge/SKILL.md`,
> `tools/build-framework.mjs`, `tools/check-framework.mjs`, `README.md`, новая запись `EXPERIENCE.md`).

## 1. Что изменено в ветке — построчно

| Файл | Что | Проверка |
|---|---|---|
| `framework/tools/kaif-experience-lint.mjs` (**НОВЫЙ**, 533 строки) | tool-модуль поставки: семь правил как данные (`repeat` · `no-mechanization-field` · `trap-answered-subject` · `no-class` · `unlisted-class` · `class-ok-without-reason` · `dangling`), ключевые слова обоих языков (кириллица `\uXXXX`), `check [journal] [--baseline <file>]` · `--shrink <id> [--yes]` · `selftest`, `SKIPPED=3`, блок `@guard experience-lesson-repeat` | `node framework/tools/kaif-experience-lint.mjs selftest` → «68 cases, 7 rules × 2 languages» |
| `framework/skills/experience/SKILL.md` | формат записи + строка `class: <slug>`; абзац о списке классов шапки; НОВЫЙ пункт 5 — команда крайнего срока, две судьбы, `--shrink`, `SKIPPED=3` | `grep -n "class: <slug>" framework/skills/experience/SKILL.md` |
| `.claude/skills/experience/SKILL.md` | то же по-русски (`класс: <слаг>`, пункт 5 с обёрткой истока) | `grep -n "класс: <слаг>" .claude/skills/experience/SKILL.md` |
| `framework/EXPERIENCE.md` | `class:` в формате записи · абзац «The deadline is RUN, not remembered» · СПИСОК классов-заготовок из замера #69 (`<!-- classes: … -->` + таблица 11 строк) | `grep -c "class-ok\|<!-- classes:" framework/EXPERIENCE.md` |
| `EXPERIENCE.md` (журнал истока) | шапка: абзац крайнего срока · список 19 классов (`<!-- классы: … -->` + таблица) · 14 объявлений `<!-- class-ok: слаг — причина -->`; **все 136 записей получили строку `класс: <слаг>`** (скрипт по тегам, две спорные рукой); две починки полей — вклейка шапки в тело EXP-0121 и её поле механизации, висячий указатель EXP-0110 | `node tools/experience-lint.mjs` → **exit 0**, «136 entries · 136 classed · 19 classes · 32 mechanized · 14 class(es) declared» |
| `tools/experience-lint.mjs` | обёртка **40 строк** над модулем поставки (адрес журнала, базовая линия 83 id, `--write-baseline`; остальное — дочерним процессом с пробросом кода) | `node tools/experience-lint.mjs --selftest` → селфтест модуля |
| `framework/skills/end-chat-soft/SKILL.md` | НОВАЯ строка команды крайнего срока в шаге статуса (в EN-поставке её не было вовсе) | `grep -n "kaif-experience-lint.mjs check" framework/skills/end-chat-soft/SKILL.md` |
| `.claude/skills/end-chat-soft/SKILL.md` | прежняя строка обновлена по смыслу (поле класса · повтор класса красный · две судьбы) | `grep -n "class-ok" .claude/skills/end-chat-soft/SKILL.md` |
| `tools/sandbox/s28-experience-lint.mjs` (**НОВЫЙ**) | свод полигона, 30 ассертов: фикстуры модуля + РАЗВЁРНУТАЯ копия из `dist`; шов `KAIF_DIST` | `node tools/sandbox/s28-experience-lint.mjs` → «all 30 checks green» |
| `tools/sandbox-suite.mjs` | `s28` в списке `SUITES` + абзац шапки | `npm run test:core` → «all 27 suites green» |
| `framework/KAIF_REFERENCE.md` | строка `kaif-experience-lint.mjs` в перечне tool-модулей (ИСТОЧНИК; корневая копия пересобрана) | `grep -c kaif-experience-lint KAIF_REFERENCE.md` → 1 |
| `AGENT_GUIDE.md` · `PROJECT_STRUCTURE_EXTERNAL_MAP.md` · `PROJECT_ARCHITECTURE_INTERNAL_MAP.md` · `STATUS.md` | зеркала счётчиков с вывода сборки: блоки 181 → **182**, своды полигона 26 → **27**, имя модуля в трёх перечнях | `node tools/counters-guard.mjs` (остаток — только `README.md`, § 6) |
| `plans/114_…md` | шаги EL0–EL6 отмечены с моментами (прежние формулировки сохранены, наблюдения дописаны), `INTENT:` и три `FORK:` в EL0, секция «Решения … `[ИИ]`» — десять пунктов, статус и метрика | — |
| `testcases/reports/2026-09-18_experience-lint.md` (**НОВЫЙ**) | отчёт прогона, семь полей, строки `Hygiene:`/`Functional run:` раздельно | `node framework/tools/kaif-testrun-lint.mjs check` → 11 отчётов, 0 находок |
| `dist/*` | пересобрано (`node tools/build-framework.mjs`) | бандл **182 блока**, 797 модулей, `check-framework OK` |
| `plans/handoff_EL.md` | этот файл | — |

**Прогоны гигиены (все 2026-09-18):** `build-framework` 0 (09:11) · `npm run test:core` «all 27 suites
green» (09:06) · `s28` 30/30 и красный на ядре 2.6 «10 of 30» (09:00) · шесть мутантов оси, 0 невидимых
(09:01) · селфтест модуля 68/68 · `counters-guard` **4 расхождения — все в `README.md`** (09:08, § 6) ·
`kaif-guard-lint check` по трём своим файлам — 1 блок, 0 находок · `kaif-attribution-lint check` —
**new 0**, долг 45 · `doc-header-lint` — 6 находок, **все шесть чужие** (метки `plans/113`, `plans/63`,
`interviews/interview_032…`, поля `plans/handoff_FR.md`, опережающая метка `STATUS.md`) ·
`kaif-testrun-lint check` 0 · `kaif-scenario-lint check plans/114…` — **exit 3 SKIPPED** (сценарного
блока в плане нет: критерий живёт сценарием в `plans/100` п. 24 — «не судилось» ≠ «чисто»).

## 2. EL6 — охота `/fable-judge` (вставить в ОБЕ копии побайтно одинаково)

Файлы: `framework/skills/fable-judge/SKILL.md` и `.claude/skills/fable-judge/SKILL.md` (вендоренный
навык, обе копии английские и равны побайтно). Место — в KAIF-блоке 2.7, ПОСЛЕ последней охоты 2.7
(на HEAD `df8110b` это `**Resume word ignored (KAIF 2.7).**`; если охоты SF/FR уже вставлены — после них).

```markdown
   - **Lesson repeated without a mechanism (KAIF 2.7).** A journal entry about a FAILURE (`❌` or `❌→✅`) whose `class:` slug already carries another failure entry with no `mechanized:` — a second, a sixth, a seventeenth record of one class — is a finding of the skipped-deadline class: the journal has become the default sink and "two strikes → a mechanism, never a third reminder" was answered with more prose (`EXPERIENCE.md` header and `/experience` step 0; origin issue #69 — an audit of one field project's whole journal: 7 of 120 failure entries mechanized, 14 of 15 failure classes recurred AFTER their lesson was written, 4 after a guard was built, five lessons written 6–17 times in different words; a recurrence of closed #14, whose fix landed as prose and one origin-only tool). Two fates are legal and both are WRITTEN: `mechanized: <the tool>` in the entry, or the price of the WHOLE class re-checked and declared beside the class list — `<!-- class-ok: <slug> — <why it is not cheaply possible> -->`; a second `none-cheap:` inside one class is not a fate, and a declaration with no reason in words is itself the finding. Hunt also: an entry with no `class:` at all (recurrence cannot be counted for it, and a missing field reads as a clean journal); a `mechanized:` naming a command, script or path the project does not contain (a mechanization nobody can run is a claim — an ignored runtime path is not one); a class list that grew a synonym slug for a class that already exists (the same class in two words is the audit's "six to seventeen times" in machine form); a session close that reports the journal captured while the deadline command was never run. Re-run: `node .kaif/tools/kaif-experience-lint.mjs check` — the `repeat` line names the class and BOTH entries by id; `exit 3` (`SKIPPED`) means not one entry carries the field, which is a finding about the journal, never a green.
```

И в перечень охот 2.7 шапки (строка `:14` обеих копий, пункт `(7) the KAIF 2.7 hunts in the same
block — …`): после последнего имени (на HEAD — `**resume-word-ignored**`; если SF/FR вставлены — после
их имён) добавить `, **lesson-repeated-without-a-mechanism**`, а в скобки-формулы в конце перечисления
(после `· the first word of the owner's message is an order`) — `· a lesson repeated without a
mechanism is a lesson that failed as text`.

**Проверка после вставки:** `node tools/check-framework.mjs` (пары § 4) и
`diff framework/skills/fable-judge/SKILL.md .claude/skills/fable-judge/SKILL.md` → пусто.

## 3. Запись 2.7 сборщика — `TEMPLATE_NOTES_BY_VERSION['2.7']` (`tools/build-framework.mjs`, массив со строки 281)

Добавить ОДНОЙ строкой в конец массива `'2.7'`, в его собственном стиле (один литерал, апострофы
экранированы, кириллицы нет):

```js
    'A LESSON REPEATED TWICE GOES RED, AND THE CLASS IS THE UNIT OF COUNT (epic EL; origin issue #69 — an audit of one field project\'s whole experience journal: "7 of 120 failure entries mechanized (5.8 %), 14 of 15 failure classes recurred AFTER their lesson was written, 4 AFTER a guard was built, five lessons written 6–17 times in different words"; a recurrence of closed #14, whose fix landed as prose plus one origin-only tool). The rule "two strikes → a mechanism, never a third reminder" had a carrier for ONE entry — the Mechanization field — and none for the RECURRENCE: tags are free and overlap, so "the same class" was visible only to a human who read the journal end to end. (1) THE UNIT: an entry now carries `class: <slug>` on its own line under the heading (`/experience` step 2 and the EXPERIENCE.md template, which also ships a STARTER class list — the classes that audit had already measured — as a controlled, open list: a new class is added to the list in the same write). (2) THE DEADLINE AS A COMMAND: NEW optional tool module .kaif/tools/kaif-experience-lint.mjs (`check [journal] [--baseline <file>]` / `--shrink EXP-NNNN [journal] [--yes]` / `selftest`; rules as data, keywords per language, ids not assumed numeric) reddens on the SECOND failure entry (`❌` / `❌→✅`) of one class with no `mechanized:` and names the class and BOTH entries by id; it warns when `mechanized:` names a command or path the project does not contain (a path the project IGNORES is not dangling, and for a journal outside a project tree addresses are not checked at all — said aloud) and when a slug is outside the header list; `--shrink` collapses a MECHANIZED entry to its class line plus one pointer line (`Lesson → guard: … · full text: git log -p -S "<id>"`), showing by default and writing only with `--yes`; `SKIPPED=3` when not one entry carries `class:` — recurrence cannot be counted, and "not judged" never reads as "clean". (3) THE TWO FATES, both written: `mechanized: <the tool>` in the entry, or the price of the WHOLE class re-checked and declared beside the list — `<!-- class-ok: <slug> — <why it is not cheaply possible> -->`, an empty declaration being itself a finding and every declared class printed on the summary line (that list only shrinks). A second `none-cheap:` inside one class is therefore not an answer. The command belongs in the closing ritual: /end-chat-soft now runs it in both layers. /fable-judge hunts "lesson repeated without a mechanism".',
```

**Проверка:** `node tools/build-framework.mjs` → EXIT 0;
`grep -c "A LESSON REPEATED TWICE GOES RED" dist/KAIF-CORE-BUNDLE.md` → ≥ 1.

## 4. Пары `tools/check-framework.mjs` — вставить в `PAIRS` (массив со строки 418), после блока FR

```js
    // EL (2.7, origin issue #69): the class is the unit of recurrence in both layers, the module carries the
    // deadline and both fates, the closing ritual runs it, the journal template ships the starter class list,
    // and the judge hunts the repeated class.
    ['lesson repeat ↔ the shipped module carries the deadline and both fates',
      'framework/tools/kaif-experience-lint.mjs',
      ['@guard experience-lesson-repeat', 'name the guard in the entry', 'class-ok: ${k}',
       'recurrence of a class cannot be counted']],
    ['lesson repeat ↔ /experience carries the class field (payload)',
      'framework/skills/experience/SKILL.md',
      ['class: <slug>', 'the **unit of recurrence**', 'kaif-experience-lint.mjs check']],
    ['lesson repeat ↔ /experience carries the class field (wrapper)',
      '.claude/skills/experience/SKILL.md',
      ['класс: <слаг>', 'единица счёта повтора', 'tools/experience-lint.mjs']],
    ['lesson repeat ↔ the closing ritual runs the deadline (payload)',
      'framework/skills/end-chat-soft/SKILL.md',
      ['node .kaif/tools/kaif-experience-lint.mjs check', 'never by writing a third record']],
    ['lesson repeat ↔ the closing ritual runs the deadline (wrapper)',
      '.claude/skills/end-chat-soft/SKILL.md',
      ['node tools/experience-lint.mjs', 'третья запись судьбой не является']],
    ['lesson repeat ↔ the journal template ships the class field and the starter list',
      'framework/EXPERIENCE.md',
      ['class: <slug from the class list below', '<!-- classes: question-already-answered',
       'The deadline is RUN, not remembered']],
    ['lesson repeat ↔ the origin eats its own shipment through a wrapper',
      'tools/experience-lint.mjs',
      ['framework/tools/kaif-experience-lint.mjs', '--write-baseline']],
    ['lesson repeat ↔ the origin journal carries the classes and the declared prices',
      'EXPERIENCE.md',
      ['<!-- классы: escaping-layer', '<!-- class-ok: guard-not-proven-against-threat',
       'Крайний срок ПРОГОНЯЕТСЯ, а не вспоминается']],
    ['lesson repeat ↔ /fable-judge hunts the class repeated without a mechanism',
      'framework/skills/fable-judge/SKILL.md',
      ['**Lesson repeated without a mechanism (KAIF 2.7).**',
       'lesson-repeated-without-a-mechanism']],
```

⚠️ Токен `'class-ok: ${k}'` — ЛИТЕРАЛ из шаблонной строки модуля (там он внутри `` ` `` -строки);
если `missingTokens` этого файла спотыкается о `$`, режь токен до `class-ok: ` и `re-check the price`.
**Проверка:** `node tools/check-framework.mjs` → зелёный; мутация — убери любой токен из файла и
убедись, что пара краснеет поимённо.

## 5. `framework/KAIF_REFERENCE.md` — УЖЕ СДЕЛАНО в ветке

Строка `| kaif-experience-lint.mjs | …` вставлена в перечень tool-модулей ИСТОЧНИКА (после
`kaif-ranking-lint.mjs`), корневая копия пересобрана сборкой. Интегратору — ничего, кроме сверки:
`grep -c kaif-experience-lint KAIF_REFERENCE.md` → 1.

## 6. `README.md` — четыре числа (правка worktree запрещена)

`node tools/counters-guard.mjs` на этой ветке даёт РОВНО четыре расхождения, все в `README.md`:

| Зеркало | Сейчас | Обязано быть |
|---|---|---|
| README EN — строка счётчиков (`= 59 embedded files; N bundle blocks; 797 modules`) | 181 | **182** |
| README RU — строка счётчиков (`= 59 встроенных файлов; N блоков бандла; 797 модулей`) | 181 | **182** |
| README EN — `sandbox polygon (N suites)` | 26 | **27** |
| README RU — `полигон (N сводов)` | 26 | **27** |

Плюс по существу витрины (на усмотрение интегратора, счётчиками не стережётся): Таблица tool-модулей
README, если она перечисляет модули по именам, — добавить `kaif-experience-lint`.
**Проверка:** `node tools/counters-guard.mjs` → «counters OK — 50 зеркал».

## 7. Строки для `plans/100_EPIC_kaif_2.7.md`

**(а) Строка 18 таблицы разреза** — колонка статуса эпика EL: заменить `🔲 план — plans/114 (нулёвка EL0)` на

```
✅ **ЗАКРЫТ <момент>** — `plans/114`, шаги EL0–EL6 исполнены субагентом в worktree (ветка `worktree-agent-a67ace9be2fd6ac0c`, коммит <хеш>), EL7 — слияние и тексты `plans/handoff_EL.md`; проба ДО кода красная обоими плечами (страж истока зелёный на паре одного класса · модуля в поставке нет); модуль `kaif-experience-lint` (7 правил, селфтест 68), поле `class:` в обоих слоях, обёртка истока, свод `s28` (30/30), красный на ядре 2.6 «10 of 30» и шесть мутантов (0 невидимых); функциональный прогон по РЕАЛЬНОМУ журналу истока — 14 классов повтора и одно поле названы, каждому дана судьба, повторный прогон зелёный; на копиях двух полевых журналов — SKIPPED (328 записей без поля) и 120 записей о провалах, невидимых крайнему сроку; отчёт `testcases/reports/2026-09-18_experience-lint.md` (partial); критерий 24 ✅
```

**(б) Под критерием 24** (после строки «Проверка») — отметка:

```
   ✅ <момент> — EL0–EL6 (`plans/114`, субагент в worktree; коммит <хеш>): проба ДО кода красная (страж истока
   на фикстуре «два ❌ одного класса без `mechanized:`» — exit 0, «новых нарушений 0»; модуля в развёрнутой копии
   нет); модуль поставки `kaif-experience-lint` — семь правил как данные, селфтест 68 кейсов (7 × 2 языка),
   `@guard` четырьмя полями; поле `class:` в `/experience` обоих слоёв и в шаблоне журнала (плюс список
   классов-заготовок из замера #69); обёртка истока 40 строк, журнал истока размечен (136 из 136, 19 классов);
   строка команды в `/end-chat-soft` обоих слоёв (в циклах линтеров итерации нет вовсе — сказано вслух);
   свод `s28` 30/30, полигон 27 сводов, красный на ядре 2.6 «10 of 30», шесть мутантов оси — 0 невидимых;
   функциональный прогон по живому журналу: 15 находок → судьбы (14 объявленных цен класса с названным
   носителем или причиной) → 0 находок; уточнение сценария: судьба класса объявляется строкой
   `<!-- class-ok: <слаг> — <почему> -->`, потому что «две `none-cheap` одного класса тоже красный» и
   «повторный прогон зелёный» одновременно неисполнимы на реальном журнале (решение 2 `plans/114`).
   Остаток EL7: охота судьи в обеих копиях, девять пар `check-framework`, запись 2.7 сборщика, четыре числа
   `README.md`.
```

**(в) Метрика доставки версии** (абзац со счётом) — дописать в конец:

```
**<момент>: закрыто 16 из 25 (EL — критерий 24).**
```

## 8. Черновик ответа в issue #69 (EN; отправка ПОСЛЕ релиза 2.7 — №84/№92/№93)

```markdown
Confirmed, taken into 2.7 as epic EL, and your measurement was reproduced on the origin's own journal.

**What we checked before deciding.** Your two claims against the 2.6 shipment: (1) the rule lives as prose —
half true: `/experience` step 0 and the Mechanization field (`mechanized:` / `none-cheap:` / `subject-lesson`)
DO exist as a carrier, but only for ONE entry; nothing counted the RECURRENCE. (2) there is no linter in the
shipment — true: the guard built for #14 stayed in the origin's wrapper (`tools/experience-lint.mjs`) and never
shipped, which is exactly your "the fix did not land as a mechanism". We also measured the field: 5 deployments
on this machine, mechanization 1–19 % of entries, and the `class:` field in none of them except yours.

**What shipped in 2.7.**
- `class: <slug>` on its own line under the entry heading — the UNIT of recurrence. Your own form (EXP-0168)
  became the shipped one. The journal template ships a STARTER class list built from the classes your audit had
  already measured, as a controlled but OPEN list: a genuinely new class is added to the list in the same write.
- New optional tool module `.kaif/tools/kaif-experience-lint.mjs` (`check` / `--shrink <id> [--yes]` /
  `selftest`): the SECOND failure entry of one class with no `mechanized:` is a finding naming the class and
  BOTH entries by id; a `mechanized:` naming a command or path the project does not contain is a warning
  (a path the project ignores is not one, and for a journal read outside its project tree addresses are not
  checked at all — the linter says so); a slug outside the header list is a warning, never a refusal;
  `--shrink` collapses a MECHANIZED entry to one pointer line, showing by default and writing only with
  `--yes` (the text stays in the git history); `SKIPPED=3` when not one entry carries the field — "not judged"
  never reads as "clean".
- Two fates clear a red class, and both are WRITTEN: name the guard in the entry, or re-check the price ONCE
  for the whole class and declare it — `<!-- class-ok: <slug> — <why it is not cheaply possible> -->`. This is
  the one place where we did NOT follow our own first plan: we had written "two `none-cheap` in one class is
  also red", and on a real 136-entry journal that rule and "the re-run is green" cannot both hold — 33 entries
  carry `none-cheap` or `subject-lesson` honestly. So the answer moved up a level: an entry answers with a
  mechanism, a CLASS answers with a re-checked price in words. An empty declaration is itself a finding, and
  every declared class is printed on the summary line — that list only shrinks.
- The command is in the closing ritual (`/end-chat-soft`, both layers). Your project's loop skills have no
  iteration linters to attach it to — neither does ours — so the closing ritual is the only carrier, and we say
  that out loud rather than pretending otherwise.
- The origin now eats its own shipment: `tools/experience-lint.mjs` became a 35-line wrapper over the shipped
  module, and our own journal was marked (136 of 136 entries, 19 classes).
- `/fable-judge` hunts "lesson repeated without a mechanism".

**What the functional run found — in our journal, not in a fixture.** After marking, the deadline reddened on
14 classes and one field. Every one got a fate. Two of our own records were lying in place and were fixed there:
one entry had a copy of the journal header spliced into its body (since the day it was written — the very
escaping class that entry is about), and its mechanization field, written without a colon after the field name,
had been invisible to the machine for 12 days while the guard stayed green for the wrong reason; another named a
template that 2.7 retired. Running the module over COPIES of two field journals (yours and another project's,
sources untouched) also found four defects in the module itself: a numeric-only id skipped 13 of 328 entries in
a journal that writes `EXP-NEW-<slug>`; an ignored runtime path read as a dangling guard; guard addresses
reported "missing" for a journal outside its tree; and a declaration whose reason quoted `<...>` was dropped
silently. All four are fixed.

**One honest boundary.** Nothing here has been observed on a LIVE field deployment closing a chat on 2.7 with
the module deployed — no such deployment exists yet; every claim above rests on the origin's own journal, on
copies of two field journals, and on a fresh installation from `dist` in a sandbox. When you update, the first
`check` on your journal will very likely be red on several classes — that is the tool working, and the fate of
each class is a decision with a reason, not a third record.

Report of the run: `testcases/reports/2026-09-18_experience-lint.md` in the origin repository.
```

## 9. Черновик урока `EXPERIENCE.md` (вставить первым, номер — следующий свободный; НОВЫЙ формат с полем класса)

```markdown
### EXP-0NNN · 2026-09-18 · ❌→✅ · #mechanization #class-as-unit #journal #declared-exemption #field-forms #false-green #el
класс: rule-as-prose-without-carrier
**Ситуация:** эпик EL 2.7 (тикет #69, рецидив закрытого #14): правило «два ожога → механизм» имело носителя у ОДНОЙ записи (поле механизации) и НИ ОДНОГО — у повтора; «тот же класс» видел только человек, прочитавший журнал целиком. Свой журнал: 136 записей, 34 механизации, поля класса нет ни у одной.
**Что делали:** класс стал ЕДИНИЦЕЙ счёта (`класс: <слаг>` отдельной строкой) и уехал полем в поставку модулем `kaif-experience-lint`; разметка 136 записей — скриптом по таблице тег → класс (134 узнаны, 2 рукой); прогон по РЕАЛЬНОМУ журналу дал 14 красных классов, и тут выяснилось, что план требовал невозможного: «две `none-cheap` одного класса тоже красный» И «повторный прогон зелёный» — при 33 записях с честным `none-cheap`/«урок о предмете». Судьба разведена по УРОВНЯМ: запись отвечает `механизировано:`, КЛАСС — объявленной ценой `<!-- class-ok: слаг — причина -->` с причиной словами (пустое объявление красное, объявленные классы печатаются и только убывают).
**Итог:** ❌→✅ — модуль (7 правил, селфтест 68), свод `s28` 30/30, красный на 2.6 «10 of 30», шесть мутантов 0 невидимых; живой журнал зелёный после 14 объявлений и двух починок полей; прогон по копиям двух полевых журналов нашёл ЧЕТЫРЕ дефекта самого модуля.
**Урок:** (1) правило, у которого есть носитель для ЭКЗЕМПЛЯРА и нет для КЛАССА, не исполняется — механизируется не запись, а единица счёта; (2) когда план требует «краснеть на всём» и «быть зелёным», ответ не в выборе одной половины, а в РАЗНЫХ УРОВНЯХ ответа: экземпляр отвечает механизмом, класс — объявленной ценой с причиной в словах (пустое объявление — красное, иначе это выключатель); (3) зелёный страж может держаться на СЛУЧАЙНОМ совпадении: поле «механизации нет (…):» без двоеточия видел только потому, что в тело записи была вклеена шапка журнала со словом `механизировано:` — убрав повреждение, прогон обнажил дефект (родня EXP-0127); (4) машинерия, читающая тексты агентов поля, прогоняется по КОПИЯМ реальных журналов до слова «готово»: фикстура автора не знает форм `EXP-NEW-<слаг>`, путей из `.gitignore` и журнала вне дерева проекта (EXP-0133 повторно оплачен — четыре дефекта из четырёх найдены прогоном, не рассуждением); (5) селфтест, читающий чекаут, в котором запущен, доказывает чекаут: правилу подаётся синтетическое дерево.
**Repro:** `node framework/tools/kaif-experience-lint.mjs selftest` → «68 cases, 7 rules × 2 languages»; `node tools/experience-lint.mjs` → exit 0 со строкой «14 class(es) declared price-re-checked»; прогон по чужому журналу — действием: скопируй `EXPERIENCE.md` соседнего развёртывания в скретчпад, запусти `check` по копии и прочитай вывод против текста записей (исходник не трогай).
**Trigger:** механизируешь правило о ПОВТОРЕ → спроси, есть ли у повтора единица счёта, и механизируй её; строишь ось, судящую тексты агентов поля → прогон по копиям реальных документов до «готово»; пишешь селфтест модуля поставки → он не имеет права читать дерево, в котором запущен.
**Not for:** правил, у которых экземпляр и класс совпадают (одноразовый инвариант); журналов, где класс невозможно назвать слагом (там единица счёта — другая).
**Механизация:** механизировано: `node tools/experience-lint.mjs` (обёртка над `framework/tools/kaif-experience-lint.mjs`) + свод `tools/sandbox/s28-experience-lint.mjs` + строка в `/end-chat-soft` обоих слоёв + охота судьи «lesson repeated without a mechanism»; урок (5) — `subject-lesson` (правило письма селфтеста, машиной не ловится).
```

## 10. Что этот worktree НЕ сделал и почему

1. **Охота судьи, пары `check-framework`, запись 2.7 сборщика, строки `plans/100`, `STATUS.md`,
   `MASTER_PLAN.md`, новая запись `EXPERIENCE.md`, числа `README.md`** — файлы за интегратором по
   заданию; тексты выше готовы к вставке.
2. **Живое наблюдение «поле закрыло чат на 2.7 и получило красный/зелёный от развёрнутого модуля»** —
   полевых развёртываний на 2.7 не существует (все на 2.5/2.6), поднимать их эта работа не имела права.
   В отчёте прогона это названо строкой «не наблюдалось».
3. **`--shrink` НЕ применялся к живому журналу истока** — схлопывание записей меняет тексты уроков и
   есть решение владельца о его журнале; команда доказана на фикстурах и в своде, но не исполнялась над
   реальными записями.
4. **Разметка классов не «идеальна»** — таблица тег → класс даёт ошибочный класс как ложный ЗЕЛЁНЫЙ
   (две записи уходят в разные классы), не как ложный красный; уточняется по мере работы с записями,
   что сказано в шапке журнала и в отчёте.
5. **Пуш и `gh`** — не вызывались (правило worktree).
