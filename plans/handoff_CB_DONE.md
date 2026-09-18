# Handoff CB — эпик «Бюджет канона» (машинная половина)

> **Создан:** 2026-09-18 11:35 +03:00 · **Кем:** агент (Claude Opus 5) в отдельном git worktree
> `D:\work\ai_sandbox\KAIF\.claude\worktrees\agent-a6d80db2fc349adbd`, ветка
> `worktree-agent-a6d80db2fc349adbd` от HEAD `3d57c09` (worktree создан от `803ef45` и доведён
> `merge --ff-only`). **Не пушено, `gh` не вызывался, main и чужие worktree не тронуты.**
> **Родитель:** `plans/95` (шаги CB0–CB4, CB6 исполнены; CB5 — половина здесь, текстами).
> **Отчёт прогона:** `testcases/reports/2026-09-18_canon-budget.md` — вердикт **partial**
> (три названные границы: путь владельца не пройден · у истока гейт неисполним · первая половина
> критерия 3 — работа RL).
> **Статус:** ✅ ВНЕСЕНО 2026-09-18 12:46 +03:00 (сессия 67, интегратор — Claude Fable 5.1): §§ 2–5 вставлены скриптом
> с якорями «ровно один раз» (охота судьи — в обе копии побайтно; одна из восьми пар доказана красной на мутанте-копии);
> § 7 — `plans/100`; § 9 — урок EXP-0146 с числами, переисполненными интегратором (44/44 · 27 из 44 · мутанты 3·5·2·4·2);
> § 10.2 — заведена дверь истока `tools/budget-gate.mjs`; § 10.7 — к необъяснённому красному `s09` названа первая лошадь
> (параллельные прогоны интегратора в том же окне; отчёт прогона, дополнение); § 10.8 — четыре комментария ядра с
> именами полевых проектов заменены на «a field deployment» по правилу №90, владельцу сказано в чате. **Черновик
> ответа #71 (§ 8) остаётся здесь до релиза** (№84/№92/№93); его ПОСЛЕДНИЙ абзац протух — «the origin itself fails its own
> gate today on four core documents» неверно с 10:51 (стрижка `4b702bc`): дверь истока зелёная, 9 из 9 (проба 12:36) —
> **поправлен 2026-09-18 14:26 +03:00** (сессия 67, шаг RL3 заранее): абзац теперь называет четыре числа ревизии `3d57c09`,
> стрижку того же дня и нынешние «nine of nine» (дверь переснята в тот же ход: `9 documents … within budget`); перед
> отправкой число переснять ещё раз. Было: 🔧 готов к вставке 2026-09-18 11:35 +03:00.
> **Вовне:** ответ в issue #71 (черновик § 8) — после релиза 2.7 по правилу №84/№92/№93.
>
> Этот файл — ТОЛЬКО для интегратора: тексты ниже готовы к вставке в файлы, которые worktree править
> не имел права (`plans/100`, `STATUS.md`, `MASTER_PLAN.md`, обе копии `fable-judge/SKILL.md`,
> `tools/build-framework.mjs`, `tools/check-framework.mjs`, `README.md`, `AGENT_GUIDE.md` обоих слоёв,
> `EXPERIENCE.md`, `ideas/28`, `plans/89`, карты).

## 1. Что изменено в ветке — построчно

| Файл | Что | Проверка |
|---|---|---|
| `framework/installer/KAIF-CORE.mjs` | `DOC_BUDGETS` → `{ budget, overflowTo }` (адрес выноса ПО ДОКУМЕНТУ, `MOVE_OUT_ADDRESS` для восьми, летопись для `STATUS.md`) · НОВАЯ `ownLines(doc)` рядом с `moduleAudit()` (пара сигнатура+sha против `moduleShas`; три запасные ветки — `no-cut` · `translated` · `owner-seeded`) · предупреждение `own lines N of budget ~M (…)` + адрес · НОВЫЙ флаг `check --gate-budgets` (код 1 в КОНЦЕ `cmdCheck`) · ось смеси по ДОЛЕ токенов (`LANGUAGE_MIX_FOREIGN_SHARE = 0.35`, `stripCodeSpans`) · `logPackHonesty` → `packHonesty` + обёртка, `install` печатает пакет ПОСЛЕ успеха, строка-указатель `↳ WHAT TO REPORT:` · блок `@guard doc-budgets` переписан четырьмя полями | `node framework/tools/kaif-guard-lint.mjs check framework/installer/KAIF-CORE.mjs` → 5 блоков, 0 находок |
| `tools/sandbox/s16-doc-budgets.mjs` | свод эпика: **44 ассерта** (было 11) на развёрнутой копии `install --lang ru`; шапка переписана под новый охват | `node tools/sandbox/s16-doc-budgets.mjs` → «all 44 checks green»; `KAIF_DIST=<dist v2.6>` → «27 of 44 check(s) failed» |
| `tools/sandbox/s10-l4-audit-noise.mjs` | ОДИН ассерт `S5` переписан под новую формулировку предупреждения и усилен вторым числом (обоснование — в сообщении коммита) | `node tools/sandbox/s10-l4-audit-noise.mjs` → «all green» |
| `tools/sandbox-suite.mjs` | строка реестра `s16` в шапке описывает новый охват (сам список `SUITES` НЕ тронут — свод не новый) | `npm run test:core` → «all 27 suites green» |
| `framework/skills/end-chat-soft/SKILL.md` | НОВЫЙ шаг двери бюджета ПОСЛЕ стрижки бонсая: `node .kaif/kaif-core.mjs check --gate-budgets` в код-блоке + что значит код 1 | `grep -n "gate-budgets" framework/skills/end-chat-soft/SKILL.md` |
| `.claude/skills/end-chat-soft/SKILL.md` | то же по-русски + **вслух: у истока команда неисполнима по построению** (вывод пробы) и исполнимая замена истока (`wc -l` девяти документов против девяти чисел) | `grep -n "НЕИСПОЛНИМА" .claude/skills/end-chat-soft/SKILL.md` |
| `framework/KAIF_REFERENCE.md` | команда `check` — абзац CB (собственные строки, три ветки, адрес выноса, `--gate-budgets`, смесь по токенам); строка `STATUS.md` в таблице документов (корневая копия — ГЕНЕРАТ, пересобрана) | `grep -c "gate-budgets" KAIF_REFERENCE.md` → 2 |
| `plans/95_…md` | шаги CB0–CB6 с метками и ПРЕЖНИМИ формулировками, три `FORK:` в CB0, секция «Решения `[ИИ]`» пп. 2–11, риски (а)/(б)/(в) с исходом, «Верификация наблюдением» — плановая и исполненная | — |
| `testcases/reports/2026-09-18_canon-budget.md` (**НОВЫЙ**) | отчёт прогона, семь полей, 21 прогон, строки `Hygiene:`/`Functional run:` раздельно | `node framework/tools/kaif-testrun-lint.mjs check` → 15 отчётов, 0 находок |
| `dist/*` | пересобрано | 182 блока, 798 модулей — **числа НЕ изменились**, зеркала счётчиков править не нужно |
| `plans/handoff_CB.md` | этот файл | — |

**Судья прогона** (`/fable-judge`, субагент с чистым контекстом, 11:54) — **VERIFIED WITH CAVEATS**,
десять каверз, **все закрыты до коммита**; перечень и лечение — отчёт прогона § 5. Две были
несущими: `dist` не был пересобран после правки блока стража (полигон не стартовал гейтом свежести,
а отгружаемый `dist/KAIF-CORE.mjs` нёс старые числа стража) и центральный ассерт критерия 4 зеленел
на ядре 2.6, где `--gate-budgets` — незнакомый флаг и `check` отказывает ТЕМ ЖЕ кодом 1.

**Прогоны гигиены (все 2026-09-18, после починок):** `build-framework` EXIT 0 (11:57) ·
`npm run test:core` «all 27 suites green» (11:58, на пересобранном дереве) · `s16` 44/44 и на ядре 2.6
«27 of 44» (11:57) · **пять** мутантов предикатов на
копиях `dist` → 3 / 5 / 2 / 4 / 2, невидимых нет (11:57) · `counters-guard` **0 расхождений**, 50 зеркал
(12:00) · `sandbox-mute-guard` немых команд нет, 422 (после починки двух) · `questions-guard` 0 ·
`kaif-guard-lint check` по ядру — 5 блоков, 0 находок · `kaif-attribution-lint check` — **new 0**,
долг 45 · `kaif-testrun-lint check` — 0 · `experience-lint` — 0 · `requirements lint` — 0 ·
`doc-header-lint` — 3 находки, **все три чужие** (`plans/63`, `interviews/interview_032…`, метка STATUS) ·
`private-names-guard` — `⚪ списка .kaif/private-names.json нет` (у истока файла нет; имена соседей в
поставку, `dist/` и `reports/KAIF_AUDIT/` не писались — в плане и отчёте они псевдонимы `project A…F`).

## 2. Охота `/fable-judge` — НУЖНА, и вот почему именно эта (вставить в ОБЕ копии ПОБАЙТНО одинаково)

Файлы: `framework/skills/fable-judge/SKILL.md` и `.claude/skills/fable-judge/SKILL.md`. Место — в
KAIF-блоке 2.7, ПОСЛЕ последней охоты 2.7 (на HEAD `3d57c09` это
`**Lesson repeated without a mechanism (KAIF 2.7).**`).

**Зачем.** Гейт читает то число, которое лежит в таблице, — поэтому у него есть ровно один дешёвый
обход: поднять число. Это тот же класс, на который судья уже охотится в тестах («тихая подгонка теста
под новое поведение»), только над бюджетом, и ни одна машина этой ветки его не видит (сказано в `GAP`
стража). Вторая половина охоты — ритуал, доложивший стрижку, но не запускавший дверь.

```markdown
   - **Budget raised instead of content moved (KAIF 2.7).** A size budget of the re-read core that CHANGED in the same session a budget gate went from red to green — the number in `DOC_BUDGETS` (or in the project's own budget table) edited upward, `--gate-budgets` now exit 0, and nothing moved to the address the warning named — is the test-weakening class applied to the framework's own weight: the gate reads whatever number the table holds, so raising it is the one cheap way past a door whose printed cure is "move content OUT to <address>, rather than raise the budget" (origin issue #71 — the owner's own audit of one project: three core documents above budget, the warning printed for weeks and acted on once; `AGENT_GUIDE` → Document taxonomy, tier 1). The legal answer is a MOVE, and it is visible as one: closed history verbatim in `PROJECT_HISTORY.md`, a section in `researches/`, a house-rules file — the same lines, a different address. A budget genuinely wrong for a project is raised ONCE, with the owner's word quoted or `[AI]` signed beside the new number and the reason in words, never inside the session the gate refused. Hunt also: a closing that REPORTS the bonsai trim while `node .kaif/kaif-core.mjs check --gate-budgets` was never run (the trim is the work, the gate is the proof, and only the second one can fail); a session that answered a red gate by deleting content rather than moving it (the chronicle is append-only — lines leave `STATUS.md` alive or they do not leave); and "own lines" read as a licence — arrived canon is not counted BY THE MODULE, so a template module edited by one character counts whole and shrinking it is not a move either. Re-run: `node .kaif/kaif-core.mjs check --gate-budgets` before and after the claimed fix, and `git diff` the budget table: a green gate whose diff touches the numbers and not the documents is the finding.
```

И в перечень охот 2.7 шапки (строка `:14` обеих копий, пункт `(7) the KAIF 2.7 hunts in the same
block — …`): после последнего имени (на HEAD — `**lesson-repeated-without-a-mechanism**`) добавить
`, **budget-raised-instead-of-content-moved**`, а в скобки-формулы в конце перечисления (после
`· a lesson repeated without a mechanism is a lesson that failed as text`) —
`· a budget raised to make a gate green is the gate, not the document, being fixed`.

**Проверка после вставки:** `node tools/check-framework.mjs` (пары § 5) и
`diff framework/skills/fable-judge/SKILL.md .claude/skills/fable-judge/SKILL.md` → пусто.

## 3. Запись 2.7 сборщика — `TEMPLATE_NOTES_BY_VERSION['2.7']` (`tools/build-framework.mjs`, массив со строки 281)

Добавить ОДНОЙ строкой-литералом в конец массива `'2.7'`, в его собственном стиле (один литерал,
апострофы экранированы, кириллицы нет):

```js
    'THE SIZE BUDGET OF THE RE-READ CORE IS COUNTED IN THE LINES THE PROJECT ITSELF WROTE, AND THE WARNING SAYS WHERE THE OVERFLOW GOES (epic CB; origin issues #43/#45 — three field deployments were warned about canon they never wrote, one of them an `AGENT_GUIDE.md` of 1661 lines carrying 596 lines that arrived byte-equal to the template; and origin #71 — the owner\'s own audit of one project: "three core documents above budget, the warning printed for weeks and acted on once"). (1) OWN LINES: a disk module whose (signature, sha256) pair is in the deployment manifest\'s `moduleShas` ARRIVED and is not counted — the same machinery the module audit has compared since 2.0, reused rather than invented; what is left is yours, and that is the number judged. Three fallbacks name themselves in the line instead of going quiet: no module cut for the file, a file translated WHOLESALE (not one template signature survives, so a by-signature cut is impossible by construction — bugs/36), and an OWNER-SEEDED document (`STATUS.md`, `GOAL.md`, `MASTER_PLAN.md`, the external map) whose shipped skeleton the project wrote over; all three count every line as yours, and the sentence says which of the three it is. (2) THE ADDRESS: `DOC_BUDGETS` rows carry `{ budget, overflowTo }`, so the warning ends with where the overflow moves — the chronicle for `STATUS.md`, the chronicle + `researches/` + a house-rules file for the other eight — because a warning that says "too long" without saying "where to" cannot be executed. (3) THE DOOR: NEW flag `check --gate-budgets` exits 1 after every other axis has spoken, one `<document>: own lines N of budget M -> <address>` line each; the bare `check` keeps the warning and exit 0, so no update road fails on a long document, and an unknown flag still refuses (bug 33). /end-chat-soft runs the flag in both layers, AFTER the bonsai trim. (4) THE SAME EPIC judges the skill LANGUAGE MIX by the SHARE of foreign-script prose tokens against a named core constant instead of a single occurrence of a script: fenced blocks and inline code spans are not prose, a body with not one token in the owner\'s script stays ENGLISH with its old wording and old count, and a body that keeps the owner\'s script while at or above the threshold is a MIX named with its percentage — a fully English skill carrying two or three stray localized words used to be invisible to both counts, which is real state on the author\'s own tree and on a field deployment. (5) `install` now prints its success line BEFORE the incomplete-language-pack note, and that note carries WHAT TO REPORT — `bugs/KAIF/NN_*.md` plus the ready `report` command plus the origin tracker — together with the boundary said aloud: the incompleteness itself is BY DESIGN and is not a defect. /fable-judge hunts a budget raised instead of content moved.',
```

**Проверка:** `node tools/build-framework.mjs` → EXIT 0;
`grep -c "THE SIZE BUDGET OF THE RE-READ CORE" dist/KAIF-CORE-BUNDLE.md` → ≥ 1.

## 4. `POLICY_CHANGES_BY_VERSION['2.7']` — нужна, и вот почему именно такая

Поведение команды, которую поле уже зовёт, изменилось ЧЕТЫРЬМЯ способами, и три из них видны глазами
в выводе (текст предупреждения, новая строка о смеси, порядок строк `install`). Без записи поле
прочитает это как «после обновления check стал говорить другое — что сломалось». Одной строкой в
массив `'2.7'`:

```js
    'The `check` command changed what it SAYS and gained one flag (2.7, epic CB; origin issues #43/#45/#71). (a) The size-budget warning of the re-read core now counts the lines YOU wrote — modules byte-equal to the deployed template are subtracted — so a document that used to be named may go silent, and the line reads `own lines N of budget ~M (K lines on disk, ...)` and ends with the address its overflow moves to. If your file carries no module cut, was translated wholesale, or is owner-seeded (STATUS, GOAL, MASTER_PLAN, the external map), every line counts as yours and the line says which of the three it is. (b) NEW `check --gate-budgets`: the same numbers as a DOOR — exit 1, one `<document>: own lines N of budget M -> <address>` per overflow. It is opt-in: the bare `check`, `update-verify` and `verify-final` still exit 0 on a long document, so nothing in the update road starts failing. /end-chat-soft runs the flag after the bonsai trim; the cure is to MOVE content to the named address, never to raise the number. (c) The skill language-mix warning is now measured by the share of foreign-script prose tokens, code excluded, so a NEW second line can appear naming skills as a MIX with a percentage — most often a skill body that is English but carries two or three words in your language, which the old test could not see. It is honesty about the tree, a warning, never a failure. (d) `install --lang <pack>` prints its success line BEFORE the incomplete-pack note (the note used to open the run and read as a refusal), and the note now names what to report and what is by design.',
```

## 5. Пары `tools/check-framework.mjs` — вставить в `PAIRS` (массив со строки ~418), после блока EL

Токены однострочные, без `$` и апострофов; проверены грепом в ветке (числа вхождений — в § 1).

```js
    // CB (2.7, origin issues #43/#45/#71): the budget counts the project's own lines and names the address,
    // the flag makes it a door, the mix is judged by token share, the pack note follows the success line,
    // both layers of the closing ritual run the flag, and the Reference describes all of it.
    ['canon budget ↔ the shipped core counts OWN lines and names the address',
      'framework/installer/KAIF-CORE.mjs',
      ['function ownLines(doc)', 'arrived with KAIF and are not counted', 'MOVE_OUT_ADDRESS',
       'owner-seeded document whose shipped skeleton']],
    ['canon budget ↔ the shipped core turns the budget into a door',
      'framework/installer/KAIF-CORE.mjs',
      ['--gate-budgets', 'raising a budget is not the cure', '@guard doc-budgets']],
    ['canon budget ↔ the shipped core judges the language mix by token share',
      'framework/installer/KAIF-CORE.mjs',
      ['LANGUAGE_MIX_FOREIGN_SHARE', 'stripCodeSpans', 'skills are a MIX']],
    ['canon budget ↔ the pack note follows the success line and says what to report',
      'framework/installer/KAIF-CORE.mjs',
      ['function packHonesty', 'WHAT TO REPORT', 'is not a defect']],
    ['canon budget ↔ the closing ritual runs the door (payload)',
      'framework/skills/end-chat-soft/SKILL.md',
      ['node .kaif/kaif-core.mjs check --gate-budgets', 'Raising a budget is not the cure']],
    ['canon budget ↔ the closing ritual runs the door (wrapper)',
      '.claude/skills/end-chat-soft/SKILL.md',
      ['node .kaif/kaif-core.mjs check --gate-budgets', 'wc -l AGENT_GUIDE.md STATUS.md',
       'grep -n "budget:" framework/installer/KAIF-CORE.mjs']],
    ['canon budget ↔ the Reference describes the new check',
      'framework/KAIF_REFERENCE.md',
      ['own lines N of budget ~M', 'OWNER-SEEDED document whose shipped skeleton', '--gate-budgets']],
    ['canon budget ↔ /fable-judge hunts a budget raised instead of content moved',
      'framework/skills/fable-judge/SKILL.md',
      ['**Budget raised instead of content moved (KAIF 2.7).**',
       'budget-raised-instead-of-content-moved']],
```

Пар для обвязки истока (`tools/sandbox/s16-*`, `s10-*`) не делаю: `PAIRS` судит поставку и её зеркала,
своды — обвязка. **Проверка:** `node tools/check-framework.mjs` → зелёный; мутация — убери токен
`MOVE_OUT_ADDRESS` из ядра и убедись, что пара краснеет поимённо.

## 6. Зеркала счётчиков — НЕ ТРЕБУЮТСЯ

Сборка после всех правок: **182 блока бандла · 798 модулей · 59 встроенных файлов · 27 сводов
полигона** — все четыре числа те же, что на `3d57c09`. `node tools/counters-guard.mjs` на ветке →
**0 расхождений** (50 зеркал). Свод `s16` РАСШИРЕН, а не добавлен (решение `[ИИ]` 4 в `plans/95`),
поэтому счётчик полигона не сдвинулся и `README.md` править не нужно.

## 7. Строки для `plans/100_EPIC_kaif_2.7.md`

- **Строка 5 реестра эпиков** (колонка «Результат»): `✅ **CB ЗАКРЫТ <момент>** (субагент, worktree
  `agent-a6d80db2fc349adbd`): бюджет ядра перечитывания судится по СОБСТВЕННЫМ строкам проекта —
  модули, совпавшие с развёрнутым срезом манифеста по паре (сигнатура, sha), в счёт не входят, — и
  предупреждение несёт `own lines N of budget ~M` и АДРЕС ВЫНОСА по документу; три запасные ветки
  (среза нет · переведён целиком · owner-seeded) называют себя вслух; новый флаг `check --gate-budgets`
  — дверь ритуала закрытия (код 1, строка с адресом на каждый документ), голый `check` прежний;
  смесь языков — по доле токенов чужой письменности при именованной константе, код не проза; `install`
  печатает успех раньше границы языкового пакета, и та несёт указатель «что доложить»; шаг в
  `/end-chat-soft` обоих слоёв; свод `s16` 43 ассерта, на ядре 2.6 — 25 красных, пять мутантов
  предикатов 3/5/2/4/2; функциональный прогон по копиям двух полевых развёртываний (9 из 9 чисел
  сошлись, исходники не тронуты) вскрыл и починил ветку owner-seeded; отчёт
  `testcases/reports/2026-09-18_canon-budget.md` (**partial**).`
- **Критерий 10** — дописать `✅ <момент>` **с оговорками:** «критерии 1, 2 и 4 закрыты полностью;
  критерий 3 закрыт ВТОРОЙ половиной (порядок строк `install` и указатель) — первая половина (фраза
  `@fork` `OPTIONS · COST · RECON · DECIDED` на странице релиза) остаётся шагу RL, страницы релиза 2.7
  ещё нет; у ИСТОКА команда гейта неисполнима по построению (здесь исходник, а не развёртывание) —
  минута истока названа исполнимой заменой (`wc -l` девяти документов), обёртка гейта истока не
  заведена; путь владельца (обновление полевого проекта на 2.7 и его собственный `check`) не пройден —
  прогон шёл по КОПИЯМ реального состояния».
- **Строка метрики** (абзац § «Метрика», `:83`): `**<момент>: закрыто 24 из 25 (… CB — критерий 10;
  остался 12 — суд и релиз).**` — слагаемое проверь сам по отметкам.
- **§ «Решения» 12** (порядок остатка) — вычеркнуть CB.

## 8. Черновик ответа в issue #71 (EN; отправка ПОСЛЕ релиза 2.7 — №84/№92/№93)

```markdown
Thank you — this one measured us with our own ruler, and the ruler was wrong twice over. Taken into 2.7, and here is the cut, proposal by proposal.

**Proposal 3 — the core budget as a closing gate: TAKEN, and it came with a repair you did not ask for.**

Two things were broken, not one. The gate had no teeth — true, and that is what you reported. But the number it was printing was also wrong: `check` counted EVERY line of a document against its budget, including the lines that arrived with KAIF itself. A field deployment with a 1661-line `AGENT_GUIDE.md` was being told to shorten 596 lines of canon it never wrote, with no address for the part that was actually its own. A gate over a wrong number is worse than no gate, so 2.7 fixes the number first.

- **Own lines.** A disk module whose (signature, sha256) pair matches the deployment manifest's own `moduleShas` arrived; what is left is yours, and that is what the budget judges. This is not new machinery: it is the same comparison the module audit has run since 2.0, pointed at a second question. The warning now reads `own lines N of budget ~M (K lines on disk, J of them arrived with KAIF and are not counted)`.
- **The address.** Every budget row carries where its overflow goes — the chronicle for `STATUS.md`, the chronicle + `researches/` + a house-rules file for the rest — because "too long" with no "where to" is not an instruction anyone can execute.
- **The door.** `node .kaif/kaif-core.mjs check --gate-budgets` exits 1 with one `<document>: own lines N of budget M -> <address>` line per overflow, and `/end-chat-soft` runs it in both layers right after the bonsai trim. The bare `check` is unchanged — a warning, exit 0 — so `update-verify` never starts failing on a long document.
- **And the cheap way out is hunted.** The gate reads whatever number the table holds, so raising the number is the one move that turns it green without moving a line. `/fable-judge` now hunts exactly that: a budget edited upward in the same session a gate went from red to green, with nothing moved to the named address.

Three honest fallbacks say so in the line rather than going quiet: a deployment with no module cut, a file translated wholesale (not one template signature survives, so a by-signature comparison is impossible by construction), and an owner-seeded document whose shipped skeleton the project wrote over. That last branch exists because of your report too — indirectly. We tested the change against copies of real deployments, and it called `STATUS.md`, `GOAL.md` and `MASTER_PLAN.md` "translated wholesale" when nothing had been translated: those are documents a project writes itself. Same arithmetic, honest sentence, now split in two.

**Proposals 1-2 — the process-share line and the soft target: 2.8, and the reason is a dependency, not a doubt.** Your own text ties the share to "the `class:` field of ticket 12" — that field only exists as of 2.7 (epic EL, your #69), so nothing could have computed the share before this release. It also names `DELIVERY:` as the neighbour to stand beside, and `DELIVERY:` was removed from the framework in 2.7 by the owner's decision, so the line needs a new home (the closing report and the `/what-next` shelf are the candidates). Recorded as `ideas/30` item 17 with the three ratios, the paths and the per-project config it needs.

**Proposal 4 — the concentration rule: 2.8, same shape.** "Ten open bugs about one tool" needs a classification of "a bug about a tool", and the shipped framework has none — the project you audited has its own registry for it. Building that classification is the work; the rule on top of it is one paragraph. Recorded as `ideas/30` item 18.

**What we could not verify, and say so.** The gate was exercised on a fresh deployment and on copies of two real deployments' documents: of the nine budgeted documents in each, 3 and 4 were over budget and printed a number, and every one of those printed numbers was read back against `wc -l` and against that deployment's own manifest with no disagreement; the other six and five were silent on both sides, which is agreement between two silences and not the same evidence. The cross-check also re-implements the same algorithm, so it catches an assembly error and not an error of the algorithm itself. And none of it is the run that matters most: a project that updated itself to 2.7 and ran its own `check`. That one belongs to you and to the field, and it is what turns the guard's `ON-REAL-PATH` from `NOT YET` into a date. If your audited project runs it after updating, the output of `node .kaif/kaif-core.mjs check --gate-budgets` is exactly what we would like to see.

One number from our side, since you measured yours: on the day your ticket arrived the origin itself was over its own budgets on four core documents — `STATUS.md` 300 of 200, `MASTER_PLAN.md` 404 of 300, `TESTING_FRAMEWORK.md` 304 of 300, `AGENT_GUIDE.md` 1314 of 1200. They were trimmed to the named addresses the same day, and the origin's own door — `node tools/budget-gate.mjs`, a step of our closing ritual — now reads nine of nine within budget. That is the work your ticket created.
```

## 9. Черновик урока `EXPERIENCE.md` (вставить ПЕРВЫМ, номер — следующий свободный; НОВЫЙ формат со строкой класса)

### EXP-01NN · 2026-09-18 · ❌→✅ · #budget #own-lines #module-cut #real-state #functional-run #owner-seeded #threshold-from-measurement #gate-vs-warning #false-green #cb #71

```markdown
класс: sandbox-not-the-field
**Ситуация:** эпик CB 2.7 — бюджет документов ядра перечитывания начал считаться по СОБСТВЕННЫМ строкам проекта (модули, совпавшие с развёрнутым срезом манифеста, не в счёте), и у трёх веток появились РАЗНЫЕ фразы. Свод на развёрнутой копии: 40 ассертов зелёных, красное доказано на ядре 2.6 и на четырёх мутантах предикатов. Всё сходилось.
**Что делали:** прогнали новое ядро по КОПИЯМ реального состояния двух полевых развёртываний (файлы, названные их собственными манифестами, — по 243 файла; исходники только на чтение, sha сверены до и после). Числа сошлись 9 из 9 в каждом — а ФРАЗЫ нет: `STATUS.md`, `GOAL.md`, `MASTER_PLAN.md` и внешняя карта получили «translated wholesale», хотя ничего не переводилось. Это owner-seeded документы: проект пишет их сам и теряет сигнатуры шаблона в КАЖДОМ здоровом развёртывании. Одна ФОРМА (ни одна сигнатура не выжила) — две ПРИЧИНЫ. Ветка разделена по списку `OWNER_SEEDED`, который ядро и так знало; арифметика та же, фраза честная; +3 ассерта, +1 мутант. Тем же прогоном вскрылся второй ложный зелёный: центральный ассерт «предупреждения НЕТ» проверял отсутствие только НОВОЙ формулировки и на ядре 2.6 проходил, хотя там стоит ПРЕЖНЯЯ строка.
**Итог:** ❌→✅ — свод 43/43, на 2.6 25 красных, пять мутантов 3/5/2/4/2, полигон «all 27 suites green»; обе лжи исправлены ДО коммита.
**Урок:** (1) фикстура проверяет ЧИСЛА, реальное состояние проверяет ФРАЗЫ: синтетическая фикстура рождается под ту причину, которую автор задумал, поэтому вторая причина той же формы в ней не появится никогда — её приносит только реальное дерево; (2) новая ветка вывода, объясняющая ПОЧЕМУ, — это утверждение о мире, и оно обязано пройти реальное состояние, а не только свой ассерт; (3) ассерт «новой строки нет» на старой версии проходит по чужой причине — отрицательный ассерт судит ЛЮБУЮ форму, иначе он зелен там, где стоит прежняя (родня EXP-0127); (4) порог берётся из ИЗМЕРЕННОГО разрыва на реальном дереве (здесь 0,130 … 0,993 по 37 навыкам) и записывается вместе с замером, иначе следующая сессия не знает, можно ли его двигать.
**Repro:** `node tools/sandbox/s16-doc-budgets.mjs` → «all 43 checks green»; `KAIF_DIST=<копия dist 2.6> node tools/sandbox/s16-doc-budgets.mjs` → «25 of 43 check(s) failed»; функциональный прогон — `testcases/reports/2026-09-18_canon-budget.md` § 3 прогоны 10 и 13.
**Trigger:** добавляешь ветку вывода, которая ОБЪЯСНЯЕТ причину («переведено», «повреждено», «ваше по построению») → до коммита прогони по копии реального состояния двух-трёх соседей и прочитай ФРАЗЫ, не только коды; пишешь отрицательный ассерт под швом старой версии → судить любую форму сообщения, не только новую.
**Not for:** осей, у которых ветка одна; проектов без соседних развёртываний на диске — там границей становится строка «реального состояния не наблюдалось», а не молчание.
**Механизация:** механизировано: два ассерта ветки owner-seeded и мутант «ветка убрана» в `tools/sandbox/s16-doc-budgets.mjs` (урок 2) · усиленный отрицательный ассерт того же свода (урок 3) · поле `ON-REAL-PATH` блока `@guard doc-budgets` с названным содержанием прогона (урок 1); урок 4 — subject-lesson: «порог из замера» правилом не механизирован, кандидат — строка преполёта полигона о числовой константе без записанного замера рядом.
```

## 10. Что этот worktree НЕ сделал и почему

1. **Первая половина критерия 3 — фраза `@fork` (`OPTIONS · COST · RECON · DECIDED`) на странице
   релиза.** Это шаг RL (`plans/100` строка 7): `reports/RELEASE_NOTES_2.7.md` ещё не существует, и
   писать фразу некуда. Проверка критерия (`grep -c "OPTIONS · COST · RECON · DECIDED"
   reports/RELEASE_NOTES_2.7.md → ≥ 1`) исполняется на RL.
2. **Обёртка гейта для истока не заведена.** У истока команда `check --gate-budgets` НЕИСПОЛНИМА по
   построению (проба 11:07: без `--bundle` — `✖ neither … found — is KAIF deployed here?`, с
   `--bundle dist/KAIF-CORE-BUNDLE.md` — `✖ MISSING or empty: .kaif/…` и смерть задолго до блока
   бюджетов): здесь лежит ИСХОДНИК фреймворка, а не его развёртывание. В RU-копии `/end-chat-soft`
   это сказано вслух и названа исполнимая замена (`wc -l` девяти документов против девяти чисел
   `DOC_BUDGETS`; у истока каждая строка собственная). **Кандидат интегратору:** обёртка
   `tools/budget-gate.mjs` по образцу `tools/experience-lint.mjs` эпика EL — читает `DOC_BUDGETS` из
   `framework/installer/KAIF-CORE.mjs` как ЕДИНСТВЕННЫЙ источник чисел, считает `wc -l` (у истока
   собственных = всех), краснеет кодом 1. Цена ≈ 40 строк. Эта ветка её не заводила: `tools/` вне
   списка её файлов, и заводить инструмент мимо списка — тот самый `scope-crept-past-the-ask`.
3. **Стрижка документов истока под бюджет не делалась.** На 11:08 `wc -l` даёт четыре превышения:
   `AGENT_GUIDE.md` 1314/1200 · `STATUS.md` 300/200 · `MASTER_PLAN.md` 404/300 ·
   `TESTING_FRAMEWORK.md` 304/300. Все четыре — в списке «НЕ ТРОГАЕШЬ» этой ветки, и главная сессия
   стрижёт их параллельно. `framework/AGENT_GUIDE.md` (поставка) остался РОВНО на 1200 строках.
4. **`localizedAgainst` не тронут** — намеренно (`FORK 2` в `plans/95` CB0): это предохранитель
   ОБНОВЛЕНИЯ, решающий, можно ли затереть файл владельца английским шаблоном, и его ошибка в сторону
   «оставить файл владельца» — единственная безопасная (fail-safe defaults, уже процитированный в этом
   же ядре). Если владелец захочет порог и там — это отдельная задача с ценой «потерянный перевод».
5. **Путь владельца не пройден** — обновление полевого развёртывания на 2.7 и его собственный `check`
   не исполнялись; прогон шёл по КОПИЯМ. Поэтому вердикт отчёта `partial`, а поле `ON-REAL-PATH`
   блока `@guard doc-budgets` — `NOT YET`, с названным содержанием того, что БЫЛО наблюдено.
6. **`ideas/28`, карты, `plans/89` (критерий 9 ✅, строка 7), `STATUS.md`, `MASTER_PLAN.md`,
   `README.md`, `EXPERIENCE.md`** — не тронуты, они в списке интегратора; тексты для них — §§ 7, 9.
7. **Вхождений флейка `bugs/109` (нативный крах `status 3221226505`) в этой ветке не наблюдалось.**
   Но **ОДИН необъяснённый красный полигона был**, и он записан: прогон в 12:10 (сразу после коммита
   `8bbe858`, без пересборки) дал `✖ s09-l3-cli-safety.mjs FAILED (exit 1)` при зелёном гейте
   свежести `dist`; в одиночку (12:13) и полным полигоном следом (12:14) — зелёный. Причина НЕ
   установлена, вывод того прогона не сохранён, `s09` этой веткой не тронут. Это не `bugs/109`
   (там нативный код, здесь `exit 1`). Если повторится у интегратора — прогон `s09` с сохранением
   ПОЛНОГО вывода в файл и баг-док; отчёт прогона § 5.
8. **НАХОДКА НЕ ЭТОЙ ВЕТКИ, интегратору на решение: три имени полевого проекта живут в ПОСТАВКЕ и
   уже отгружены.** `grep -an "KPOT" framework/installer/KAIF-CORE.mjs` → строки `1495`, `1904`,
   `2437` (комментарии «KPOT F2», «bug 10 facet, KPOT», «field: KPOT caught the…»); столько же —
   `git show v2.6:dist/KAIF-CORE.mjs | grep -c KPOT` → **3**, то есть они уехали в релиз 2.6.
   Правка этой ветки их не добавляла (на `3d57c09` их ровно столько же). `private-names-guard`
   судить не может: `⚪ списка .kaif/private-names.json нет`. Решение — владельца: имя в поставке
   обратно не забирается, но следующая правка тех строк может заменить его на «a field project».
9. **Черновик урока `EXPERIENCE.md` (§ 9) написан ДО судьи** и его каверзы в текст не попали; если
   интегратор хочет, вторым уроком той же сессии просится класс `guard-not-proven-against-threat`:
   ассерт «дверь закрылась» по КОДУ ВОЗВРАТА зелен на версии, где двери нет, потому что отказ на
   незнакомый флаг несёт тот же код 1 — «код возврата не различает две причины, ассерт двери обязан
   называть саму дверь». Механизация у него уже есть — ассерт 44-го свода и мутант «гейт никогда не
   закрывается».
