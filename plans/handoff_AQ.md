# Handoff AQ — эпик «Вопрос владельцу — после археологии» (`plans/115`, критерий 25 `plans/100`, issue #70)

> **Создан:** 2026-09-18 09:12 +03:00 · субагент Claude Opus 5 (1M context), git worktree
> `agent-a35ba6da0323858be`, ветка `worktree-agent-a35ba6da0323858be` (от `df8110b`).
> **Родитель:** `plans/115` (шаги AQ0–AQ6 исполнены; AQ7 — здесь, текстами) → `plans/100` критерий 25.
> **Статус:** 🟡 ждёт интегратора (вставка § 2–8 и слияние ветки после LP). **Не пушено, `gh` не вызывался.**
> **Вовне:** обе копии `fable-judge/SKILL.md` · `tools/build-framework.mjs` · `tools/check-framework.mjs` ·
> `plans/100` · `STATUS.md` · `MASTER_PLAN.md` · `EXPERIENCE.md` · `README.md` — файлы, которых эта ветка не
> имела права касаться; после вставки этот файл удаляется.
> **Слияние — ПОСЛЕ эпика LP** (оба трогают `framework/tools/contour/core.mjs` и `review.mjs`; `plans/100`
> § «Решения» 12). Конфликты — глазами: ось живёт отдельными функциями с одним вызовом из `preflight`
> и одной строкой в `checkForm`/`checkDoc`.
> **Отчёт прогона:** `testcases/reports/2026-09-18_question-archaeology.md` (вердикт `partial` — границы названы там же).
> **Этот файл удаляется** после того, как интегратор внёс всё ниже (как `plans/handoff_FR.md`).

## 1. Что изменено в ветке — построчно

| Файл | Что |
|---|---|
| `framework/tools/contour/core.mjs` | ось `archaeology`: константы `ARCHAEOLOGY_SINCE`/`_PATHS`/`_MIN_LETTERS`(+фолбэк)/`_MAX_WORDS`/`_STEM_FROM`/`_STEM_CUT`/`_STEM_MIN`, функции `headerDate`, `archaeologyWords`, `archaeologyGrep`, `archaeologyOf`, `archaeology`, `archaeologyProblems`; `finishQuestion` — новое поле `q.firstOptionLine`; `preflight` — вторая ось; `checkForm` — поле `archaeology`; две строки в шапке-контракте |
| `framework/tools/contour/texts.mjs` | `PARSER.createdLabels`, `PARSER.archaeologyStopWords` (данные; файл — объявленный носитель кириллицы, `check-framework:43`); `check.archaeology` и `check.archaeologyOld` — EN и RU |
| `framework/tools/contour/review.mjs` | `checkDoc` печатает строку оси (обе стороны: «аттестовано N из M» / «не судится — дата шапки …»); импорт `headerDate`, `ARCHAEOLOGY_PATHS`; **десять** новых ассертов селфтеста (73 проверки всего) |
| `framework/skills/interview/SKILL.md` | новый **шаг 3d** (пять пунктов: команда → чтение → аттестация → судьба найденного прошлого ответа → что делает дверь); указатели в шаге 1 (`:36`) и в шаге 3 (`:97`); вторая ось названа в шаге 3c |
| `.claude/skills/interview/SKILL.md` | то же по смыслу — **шаг 3г**; описание навыка (`description`) НЕ менялось (пины пакетов не двигались) |
| `framework/templates/_interactive-contour-spec.md` | статья §2 — абзац об оси (4 строки). **Шапка страницы переписана на ширину её таблицы** (7 строк → 3): у страницы ЖЁСТКИЙ бюджет `s22` (≤ 120 строк) и она стояла ровно на границе; бюджет теперь назван В САМОЙ странице. Итог — 119 строк |
| `framework/KAIF_REFERENCE.md` | описание двери `--check` и её второй оси (источник; корневая копия — генерат) |
| `tools/questions-guard.mjs` | ось **G11** (имя `G9` занято — см. § 9): строка в шапке, блок `@guard questions-guard-G11` четырьмя полями, `iv.arch` из ядра поставки, три вида нарушения с текстом на языке проекта, **четыре** мутации селфтеста (45 всего) |
| `tools/sandbox/s22-contour-shipped.mjs` | блок `s22 E` — **пять** ассертов + абзац (E) в шапке свода |
| `plans/115_…AQ….md` | шаги AQ0–AQ6 с метками и ПРЕЖНИМИ формулировками; `INTENT:`/два `FORK:`; маркер `questions-guard:allow` в заголовке (страж краснел на имени эпика) |
| `AGENT_GUIDE.md` (`:634`), `STATUS.md` (`:43`) | зеркало счётчика модулей 797 → **798** (строки назвал `counters-guard`; больше в этих файлах ничего не менялось) |
| `dist/*`, `KAIF_REFERENCE.md` | генераты пересборки (`node tools/build-framework.mjs`) |
| `testcases/reports/2026-09-18_question-archaeology.md` | отчёт прогона (семь полей, `kaif-testrun-lint check` → 0 находок) |

## 2. Охота `/fable-judge` (вставить в ОБЕ копии ПОБАЙТНО одинаково)

**Где:** блок guardrail-охот шага 4, после охоты `Resume word ignored (KAIF 2.7)` — `framework/skills/fable-judge/SKILL.md`
и `.claude/skills/fable-judge/SKILL.md` (вендорено дословно, оба слоя равны побайтно).

```markdown
   - **Question asked past its archaeology (KAIF 2.7).** A live question brought to the owner — a page raised, a document queued, a question asked pointedly in the chat — in a document dated on or after `2026-09-18` whose body carries no archaeology attestation between the question heading and its first option (`<!-- archaeology: grep -rniE "<the heading's words>" interviews/ GOAL.md MASTER_PLAN.md plans/ → N hits · read: <files|none> · prior: <none | "<the prior answer>" + address> -->`), or whose attestation says `N > 0` with `prior: none`, or whose `read:` names no file while `N > 0`, is a finding: a question to the owner is a CLAIM that the matter is not settled yet, and the claim was delivered unverified (`AGENT_GUIDE.md` → the place of questions; `/interview` step 3d; origin issue #70 — an audited field deployment brought one owner 13 questions his own prior answers, `GOAL.md` or a stand run had already settled, one of them 44 days after his answer; his words: "you are asking ME? did you look into GOAL.md, smart guy, before asking?" · "we have discussed this already. Search."). Hunt also: an attestation whose command was never run (no `N`, no `read:`, the form left as the template's placeholders); a found prior answer named in `prior:` while the question was still shown unchanged — the legal moves are dropping it and carrying the decision over (`--mark-implemented`) or reformulating it as "the prior answer was X; Y has changed"; a `n/a — <reason>` exception on a question that plainly has something to search for. Re-run: `node .kaif/tools/contour/review.mjs <doc> --check` (exit 3 names every unattested question and PRINTS the command), and where the deployment guards its questions, its own axis (the origin: `node tools/questions-guard.mjs`, G11). `N = 0` is NOT a finding — the axis promises the search happened, never that it found; a document dated before that day is never judged.
```

**И сводная строка `:14`** — в перечислении охот 2.7 (пункт (7) шапки, ОБЕ копии): после
`**resume-word-ignored**` дописать `, **question-asked-past-its-archaeology**`, а в скобочном перечне
смыслов после `· the first word of the owner's message is an order` — `· a question to the owner is a claim
that nothing has settled it yet, and the claim is searched before it is asked`.

**Проверка:** `diff framework/skills/fable-judge/SKILL.md .claude/skills/fable-judge/SKILL.md` → пусто;
`node tools/build-framework.mjs` → EXIT 0.

## 3. Запись 2.7 сборщика — `TEMPLATE_NOTES_BY_VERSION['2.7']` (`tools/build-framework.mjs`, массив со строки 281)

Одной строкой-литералом в конец массива `'2.7'` (после записи FR), в его же стиле (апострофы экранированы):

```js
    'A QUESTION TO THE OWNER IS ASKED AFTER THE ARCHAEOLOGY, NOT BEFORE IT (epic AQ; origin issue #70 — an audited field deployment brought one owner 13 questions that his own prior answers, `GOAL.md` or a stand run had already settled, one of them 44 days after his answer; his words: "you are asking ME? did you look into GOAL.md, smart guy, before asking?" · "you ask me questions without having looked at the history of decisions... we have discussed this already. Search."). A question to the owner is a CLAIM that the matter is not settled yet, and nothing verified it: the rule "do not ask what is already decided" stood twice in `/interview` as PROSE with no command, the form door (`--check`, 2.7 QL1) judged only the FORM of a question, and not one interview of five deployments on the author\'s disk carried a trace of a search (223 documents, measured 2026-09-18). Now the same door has a SECOND axis. A LIVE question of a document whose header date is on or after 2026-09-18 opens only WITH the attestation of the search that was actually run, standing between the heading and its FIRST option: `<!-- archaeology: grep -rniE "<the heading\'s words>" interviews/ GOAL.md MASTER_PLAN.md plans/ → N hits · read: <files | none> · prior: <none | "<the prior answer>" + address> -->`. Without it the pre-flight refuses with exit 3 and PRINTS the ready command built from the question\'s own heading (words of 4+ letters, 6+ searched by their stem, function words dropped) — so the fix is a copy-paste, not a lookup. `N > 0` with `prior: none` is refused too (the search FOUND and the prior answer is not named; legal: `prior: unrelated — <why>`), while `N = 0` is an honest attestation: the axis promises the agent SEARCHED and said with what, never that it found. Exempt: answered questions, documents with no questions, the declared `<!-- archaeology: n/a — <reason> -->` (a naming question, the taste class), and EVERY document dated before that day — the axis judges FORWARD, so the field\'s old interviews never turn red, and `--check` says which of the two it did (`archaeology: N of M live questions attested` / `archaeology: not judged — header date ... is before ...`). The header date is read from the `Created` line when the head has one, so an ANSWER date standing above it never ages an old document forward. `/interview` step 3d carries the five steps for the agent\'s hand (run the printed command · READ the hits, not the count · write the attestation · a prior answer found → drop the question and carry the decision over with `--mark-implemented`, or reformulate it as "the prior answer was X; Y has changed" · the door refuses what skipped this), and the judge hunts a question asked past its archaeology.',
```

**Проверка:** `node tools/build-framework.mjs` → EXIT 0; `grep -c "ASKED AFTER THE ARCHAEOLOGY" dist/KAIF-CORE-BUNDLE.md` → ≥ 1.

## 4. `POLICY_CHANGES_BY_VERSION['2.7']` — нужна, и вот почему именно такая

Дверь УЖЕСТОЧЕНА для существующих проектов (ещё один класс отказа `exit 3` у команды, которую они уже
зовут), но **вперёд по дате шапки** — и это обязано быть сказано, иначе поле прочитает обновление как
«все наши интервью теперь красные». Одной строкой в массив `'2.7'`:

```js
    'The form door of the owner-facing contour gained a SECOND axis (2.7, epic AQ; origin issue #70): a LIVE question of a document dated on or after 2026-09-18 is refused (exit 3) until it carries the attestation of the search for a prior answer — `<!-- archaeology: grep -rniE "<the heading\'s words>" interviews/ GOAL.md MASTER_PLAN.md plans/ → N hits · read: <files|none> · prior: <none | "<the prior answer>" + address> -->` between the question heading and its first option; the refusal PRINTS the ready command. Your existing interviews do NOT turn red: the axis judges forward by the header date, a document without a date is treated as old, answered questions are out of the axis, and `--check` says out loud when it judged nothing ("archaeology: not judged — header date ... is before ..."). New questions: run the printed command, READ the hits, write the line; `N = 0` is a legal attestation, `N > 0` with `prior: none` is not (name the prior answer, or write `prior: unrelated — <why>`); a question with nothing to search declares `<!-- archaeology: n/a — <reason> -->`. `/interview` step 3d is the five-step form.',
```

## 5. Пары `tools/check-framework.mjs` — вставить в `PAIRS` (массив со строки ~418), после блока FR

```js
    // AQ (2.7, origin issue #70): the archaeology axis lives in the shipped core, the door prints the command,
    // both layers of /interview carry the five steps, the contract page has the article, and the judge hunts it.
    ['archaeology ↔ the shipped core refuses a live question with no attestation and prints the grep',
      'framework/tools/contour/core.mjs',
      ['ARCHAEOLOGY_SINCE', 'no archaeology line', 'hits and `prior: none`', 'archaeology: n/a']],
    ['archaeology ↔ the door reports both answers of the axis (payload texts, both languages)',
      'framework/tools/contour/texts.mjs',
      ['live question(s) attested', 'not judged — header date', 'archaeologyStopWords']],
    ['archaeology ↔ /interview carries the five steps (payload)',
      'framework/skills/interview/SKILL.md',
      ['### Step 3d. Archaeology BEFORE the question', 'READ the hits', 'prior: unrelated']],
    ['archaeology ↔ /interview carries the five steps (wrapper)',
      '.claude/skills/interview/SKILL.md',
      ['### Шаг 3г. Археология ДО вопроса', 'ПРОЧИТАЙ попадания', 'prior: unrelated']],
    ['archaeology ↔ the contour contract page has the article',
      'framework/templates/_interactive-contour-spec.md',
      ['Second axis of the same door — ARCHAEOLOGY', 'is an honest attestation']],
    ['archaeology ↔ /fable-judge hunts a question asked past its archaeology',
      'framework/skills/fable-judge/SKILL.md',
      ['**Question asked past its archaeology (KAIF 2.7).**']],
```

Пар для истока (`tools/questions-guard.mjs` G11, `tools/sandbox/s22-*`) в этом файле не делаю: `PAIRS`
судит поставку и её зеркала, а страж и свод — обвязка. **Проверка:** `node tools/check-framework.mjs` →
зелёный; мутация — убери токен `no archaeology line` из `core.mjs` и убедись, что пара краснеет поимённо.

## 6. Строки для `plans/100_EPIC_kaif_2.7.md`

- **Строка 19 реестра эпиков** (колонка «Результат»): `✅ **AQ ЗАКРЫТ <момент>** (субагент, worktree
  `agent-a35ba6da0323858be`; ветка слита после LP): вторая ось двери `--check` — живой вопрос документа с
  датой шапки ≥ 2026-09-18 не открывается без аттестации поиска, отказ печатает готовую команду грепа;
  `N hits` > 0 при `prior: none` — тоже отказ; отвеченные вопросы, `n/a — причина` и документы старше
  порога — вне оси, и дверь говорит это вслух; шаг 3d/3г `/interview` обоих слоёв; ось G11
  `questions-guard`; статья §2 спецификации контура; `s22 E` пять ассертов, красные на ядре 2.6 и на двух
  мутантах; отчёт `testcases/reports/2026-09-18_question-archaeology.md`.`
- **Критерий 25** — дописать `✅ <момент>` с оговорками: «сценарий исполнен на КОПИЯХ реальных документов
  (интервью истока №033 с датой шапки сегодня; живое интервью соседнего развёртывания
  `interview_089`, заведённое 2026-09-18 08:33 — отказ с командой); показ страницы владельцу в прогоне не
  поднимался намеренно».
- **Строка метрики** (абзац § «Метрика», `:83`): `**<момент>: закрыто 16 из 25 (… AQ — критерий 25).**`
  — число «закрыто» проверь сам: если LP/EL закрыты раньше, знаменатель тот же, слагаемое другое.
- **§ «Решения» 12** (порядок остатка) — вычеркнуть AQ.

## 7. Черновик ответа в issue #70 (EN; отправка ПОСЛЕ релиза 2.7 — №84/№92/№93)

```markdown
Taken into 2.7 as its own epic (AQ), and the class is fixed where you pointed: at the door, not in the prose.

**What your ticket measured, re-measured here.** Confirmed against HEAD: the rule "don't ask what's already
decided" stood twice in `/interview` as prose with no command; the form door `--check` (2.7, your #56) judged
only the FORM of a question; the origin's own questions-guard had axes for place, showing, scenario, verdict and
vocabulary — none for prior answers. And not one interview of five deployments on this machine carried a trace of
a search: 223 documents, 0 attestations (measured 2026-09-18 08:18 +03:00) — including an interview the origin
wrote that same morning. Your ticket named a class, not an incident.

**What now ships (2.7).** The `--check` door has a SECOND axis. A LIVE question of a document dated on or after
2026-09-18 does not open without the attestation of the search that was actually run, standing between the
question heading and its first option:

    <!-- archaeology: grep -rniE "<the heading's words>" interviews/ GOAL.md MASTER_PLAN.md plans/ → N hits · read: <files | none> · prior: <none | "<the prior answer>" + address> -->

- No attestation → exit 3, nothing shown, nobody called — and the refusal PRINTS the ready command, built from
  the question's own heading (words of 4+ letters, 6+ searched by their stem so inflected languages still match,
  function words dropped). The fix is a copy-paste, not a lookup.
- `N > 0` with `prior: none` → exit 3 as well: the search FOUND something and the prior answer is not named.
  `prior: unrelated — <why>` is the legal answer to noise.
- `N = 0` is an HONEST attestation. The axis does not promise the search finds anything; it promises the agent
  searched and said with what. Your "one 44 days later" case is exactly what the `prior:` line catches.
- Your existing interviews never turn red: the axis judges FORWARD by the header date (from the `Created` line
  when there is one), a document with no date is treated as old, answered questions are out of the axis, and
  `--check` says out loud when it judged nothing: `archaeology: not judged — header date … is before …`.
- `/interview` step 3d is the five-step form for the agent's hand, including what to do with a found prior
  answer: drop the question and carry the decision over (`--mark-implemented`), or reformulate it as "the prior
  answer was X; Y has changed — confirm it or change it". Re-serving a settled question is the defect itself.
- `/fable-judge` hunts "a question asked past its archaeology"; a deployment that guards its own questions gets
  the same class as an axis of its guard (here: `questions-guard` G11).

**What we did NOT do, and why.** The door cannot tell whether the agent DROPPED a question after finding the
prior answer: `prior:` legally carries a reformulated question too ("the prior answer was X; Y changed"). That
half stays with the skill step and the judge hunt — machinery where machinery is possible, a rule where it is not.

**Measured on your own corpus** (copies, read-only): of your 90 interviews, 5 documents hold 15 live questions;
0 carry a search trace today; for 15 of 15 the generated command finds hits in OTHER interviews of your project,
and in 15 of 15 the question's own words stand inside the text of a non-empty prior answer. That last number is a
proxy — whether a hit IS the answer needs reading, which is precisely what the axis now requires before the
question reaches you. Your live `interview_089` (created 08:33 that morning, its own header saying "re-asking В6
from #088") is refused by the new door with the command printed.

Thank you — this one changed the shipped machinery, not the wording.
```

## 8. Черновик урока `EXPERIENCE.md` (вставить ПЕРВЫМ, номер — следующий свободный)

```markdown
### EXP-01NN · 2026-09-18 · ❌→✅ · #contour #door #claim-width #archaeology #owner-trust #stemming #stop-words #budget #naming-collision #aq #70
**Ситуация:** тикет #70 (аудит полевого развёртывания): владельцу принесли 13 вопросов, которые его прошлые ответы уже решили, один — через 44 дня. Правило «не спрашивай решённого» стояло в `/interview` дважды прозой; дверь `--check` судила только форму; ни одно из 223 интервью пяти развёртываний не несло следа поиска.
**Что делали:** вторая ось того же предполёта (ось — свойство ВОПРОСА, поэтому живёт там, где судится вопрос), аттестация HTML-комментарием перед вариантами, ГОТОВАЯ команда грепа в тексте отказа, порог вперёд по дате шапки, ось G11 стража истока на РАЗБОРЕ ЯДРА поставки (один парсер двум сторонам), статья спецификации, пять ассертов свода, красное — швом `KAIF_DIST` на ядре 2.6 и двумя мутантами на копии `dist`.
**Итог:** ✅ дверь отказывает и печатает команду; функциональный прогон на копиях реальных документов двух развёртываний: код 3 → команда → 844 попадания → прочитано → прошлый ответ найден → аттестация → код 0.
**Урок:** (1) правило «поищи, прежде чем спрашивать» становится исполнимым ровно тогда, когда отказ несёт ГОТОВУЮ КОМАНДУ, собранную из самого вопроса: «поищи в прошлых решениях» — работа, «вот команда, выполни и впиши» — движение; (2) машинная выборка слов из текста владельца обязана мериться НА ЖИВОМ КОРПУСЕ до того, как её объявят: первая редакция резала шестибуквенные слова до четырёх знаков и дала 895 попаданий, а стоп-словарь не знал служебных слов заголовка — обе правки нашёл функциональный прогон, не гигиена; (3) у страницы-контракта есть ЧИСЛОВОЙ бюджет в своде, и новая статья платит за свои строки сжатием старых — бюджет пишется В САМОЙ странице, иначе следующий автор узнаёт о нём от красного свода; (4) имя новой оси берётся ПРОБОЙ по коду, а не из плана: план говорил «G9», а `G9` и `G10` были заняты в HEAD — нулёвка дешевле переименования после слияния.
**Механизация:** механизировано: ось `archaeology` ядра поставки + `s22 E` + `questions-guard` G11 + охота судьи; уроки (2)–(4) — subject-lesson (правило рук).
```

Если эпик EL (`plans/114`, поле `class:`) слит раньше — добавь в запись поле `class:` по его форме.

## 9. Решения `[ИИ]`, оговорки и то, чего этот worktree НЕ сделал

1. **`[ИИ]` имя оси стража — `G11`, не `G9`** (план говорил G9): в HEAD `G9` — «ВНЕСЕНО, НО ОТКРЫТО»
   (2.7 QL2, issue #54), `G10` — селфтест мутациями. **Оговорка:** у ДРУГОГО инструмента,
   `tools/verify-contour.mjs`, есть своя ось с именем `G11` (о потерянных вариантах) — пространства имён
   разные, но если хочешь развести имена, переименование дешевле сделать до релиза (`grep -n "G11"
   tools/questions-guard.mjs tools/verify-contour.mjs`).
2. **`[ИИ]` носитель аттестации — HTML-комментарий** (не видимая строка и не поле шапки): `FORK:` в AQ0
   `plans/115` с ценой ошибки каждого варианта и тремя consulted (тикет #70 · G8 и слово владельца №106 ·
   §4 спецификации и `renderMd` I24 — комментарии со страницы срезаются, значит владелец кухню не видит).
3. **`[ИИ]` дата шапки — со строки `Created`**, при её отсутствии первая ISO-дата головы: у живого интервью
   истока №032 первая дата головы — дата ОТВЕТА (2026-09-18), а `Created` — 2026-09-13; иначе старый
   документ краснел бы (риск (а) плана). Ассерт селфтеста назван поимённо.
4. **`[ИИ]` четвёртый вид проблемы сверх плана — `malformed`**: аттестация без `→ N hits` или без `prior:`
   отказывается. Без этого любой `<!-- archaeology: искал -->` проходил бы дверь — fail-open.
5. **`[ИИ]` основа слова и стоп-словарь** (`ARCHAEOLOGY_STEM_MIN = 5`, +24 стоп-слова): найдено
   функциональным прогоном, числа в отчёте.
6. **`[ИИ]` номерованный инвариант `I46` в `/owner-reviews` НЕ заводился**: нумерация инвариантов живёт в
   обеих копиях того навыка (вне «Вовне» плана и вне списка интегратора), а §2 статьи уже несёт соседнюю
   дверь `--check` (#56) без номера. Если хочешь номер — заводи `I46` в обеих копиях `/owner-reviews` и
   сошлись на него из статьи.
7. **`[ИИ]` свод — `s22`, не новый**: обоснование в AQ0 (`plans/115`).
8. **НЕ сделано (за тобой):** охота судьи (§ 2), записи сборщика (§ 3–4), пары `check-framework` (§ 5),
   строки `plans/100` (§ 6), ответ #70 (§ 7), урок EXPERIENCE (§ 8), **строка счётчиков README**
   (`README.md:528` EN и `:1061` RU: `797 modules` / `797 модулей` → **798**; `counters-guard` держит
   ровно эти два расхождения), `STATUS.md`/`MASTER_PLAN.md` — сводка и §5.
9. **Долг стража, не мой:** `node tools/questions-guard.mjs` → одно нарушение «разнос не выполнен (I20):
   `interviews/interview_033…` Q1 → `plans/100`» — файл `plans/100` за тобой; закроется строкой § 6.
   Заголовок `plans/115` я пометил `<!-- questions-guard:allow … -->` (страж краснел на имени эпика).
10. **Эталон `verify-contour` НЕ переписывался и не упал:** `node tools/verify-contour.mjs --etalon-only` →
    70 зелёных, 0 красных (09:04). `--write-etalon` не звался.
11. **`[TESTED]`-маркер в шапке `core.mjs` (2026-09-05, «45 проверок») не переписывался** — он датирован и
    верен как наблюдение того дня; сегодняшнее число проверок (73) стоит в отчёте прогона. Если хочешь
    держать шапки свежими — это отдельное движение по всем трём модулям контура.
12. **Границы, которые нельзя закрывать словами:** дверь не судит, СНЯЛ ли агент вопрос после найденного
    прошлого ответа (различить «снял» и «переформулировал» машинно нельзя) — держат шаг 3d и охота судьи;
    показ страницы владельцу в прогоне не поднимался (генератор звался только `--check`/`--selftest`).
