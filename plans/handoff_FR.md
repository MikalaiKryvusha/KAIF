# Handoff FR — эпик «Свободное место говорит, что свободно; конституция не теряет обязательств шаблона»

> **Создан:** 2026-09-18 01:20 +03:00 · **Кем:** агент в отдельном worktree
> `D:\work\ai_sandbox\KAIF\.claude\worktrees\agent-a32fb234cdaa81a5d`, ветка
> `worktree-agent-a32fb234cdaa81a5d` от HEAD `2b7e9e8`. **Не пушено, `gh` не вызывался.**
> **Родитель:** `plans/113` (шаги FR0–FR6 исполнены; FR5 и FR7 — здесь, текстами).
> **Отчёт прогона:** `testcases/reports/2026-09-18_constitution-keeps-obligations.md` — вердикт **partial**.
>
> Этот файл — ТОЛЬКО для интегратора: тексты ниже готовы к вставке в файлы, которые worktree править
> не имел права (`plans/100`, `STATUS.md`, `MASTER_PLAN.md`, `EXPERIENCE.md`, обе копии
> `fable-judge/SKILL.md`, `tools/build-framework.mjs`, `tools/check-framework.mjs`, `README.md`).
> После вставки — удалить этот файл или пометить тегом `DONE`.

## 1. Что изменено в ветке — построчно

| Файл | Что | Проверка |
|---|---|---|
| `framework/skills/team-deployment/references/team-constitution-template.md` | §2: п. 5 остался о блокере, хвост о простое заменён передачей «Finished with nothing next is not a blocker — rule 6»; НОВЫЙ п. 6 🔴 «A free seat asks for work» (условие выхода · кандидаты из `STATUS.md`/доски · слово владельца полевого проекта в переводе с русского); прежние 6–9 → 7–10. §4: «A row set to `🟢 free` carries the request in the SAME write». §9: 🔴 абзац «`TEAM_CONSTITUTION.md` is part of every seat's RE-READ CORE … name it in the refresh marker's `docs`» | `grep -n "A free seat asks for work" framework/skills/team-deployment/references/team-constitution-template.md` |
| `.claude/skills/team-deployment/references/team-constitution-template.md` | то же по-русски (обвязка) | `grep -n "Свободное место просит работу" .claude/skills/team-deployment/references/team-constitution-template.md` |
| `framework/skills/team-deployment/references/team-status-board-template.md` | состояние `🟢 free` несёт ЗАПРОС; НОВЫЙ п. 7 контракта `--free --asking "<candidates>"`; `audit-waiting` стал п. 8; строка поверхности команд | `grep -n -- "--free --asking" framework/skills/team-deployment/references/team-status-board-template.md` |
| `.claude/skills/team-deployment/references/team-status-board-template.md` | то же по-русски | `grep -n -- "--free --asking" .claude/skills/team-deployment/references/team-status-board-template.md` |
| `framework/skills/team-deployment/references/team-adopt.md` · `.claude/…/team-adopt.md` | «contract items 1–7» → «1–8» / «пункты контракта 1–7» → «1–8» | `grep -n "1–8" framework/skills/team-deployment/references/team-adopt.md` |
| `framework/skills/team-deployment/SKILL.md` | Operation 2 шаг 0 (adopt) — `check` в начале инвентаризации; Operation 3 шаг 1 — 🔴 `check` после генерации + маркер исключения; «paid-for field lessons» НОВЫЙ п. 8; «Done when» — строка о `check` | `grep -n "kaif-core.mjs check" framework/skills/team-deployment/SKILL.md` (3 попадания) |
| `.claude/skills/team-deployment/SKILL.md` | то же по-русски | `grep -n "kaif-core.mjs check" .claude/skills/team-deployment/SKILL.md` (3 попадания) |
| `framework/installer/KAIF-CORE.mjs` | НОВАЯ ось `cmdCheck` «constitution-keeps-obligations» + блок `@guard` четырьмя полями (после `undelivered-signal`, перед итоговым `log`) | `node framework/tools/kaif-guard-lint.mjs check framework/installer/KAIF-CORE.mjs` → 5 блоков, 0 находок |
| `tools/sandbox/s25-testrun-lint.mjs` | раздел «(4) ось „конституция сохранила обязательства шаблона" (FR)» — 7 ассертов + 2 фикстуры; шапка свода дополнена | `node tools/sandbox/s25-testrun-lint.mjs` → «all 45 checks green» |
| `plans/113_epic100_FR_free_seat_asks_for_work.md` | шаги отмечены с моментами; FR0 несёт `INTENT:` и три `FORK:`; секция «Решения … `[ИИ]`» — семь пунктов | — |
| `testcases/reports/2026-09-18_constitution-keeps-obligations.md` | отчёт прогона, семь полей, строки `Hygiene:`/`Functional run:` | `node framework/tools/kaif-testrun-lint.mjs check` → 8 отчётов, 0 находок |
| `dist/*` | пересобрано (`node tools/build-framework.mjs`) | бандл 180 блоков, 792 модуля — счётчики НЕ сдвинулись |
| `plans/handoff_FR.md` | этот файл | — |

**Прогоны гигиены (все 2026-09-18, 01:02 → 01:16 +03:00):** `build-framework` 0 · `npm run test:core`
«all 26 suites green» · `counters-guard` 0 (50 зеркал, полигон 26 сводов) · `doc-header-lint`
консультативно, 2 находки — **обе чужие** (`plans/63`, `interviews/interview_032…`, метки без
времени, пришли с HEAD `2b7e9e8`) · `kaif-attribution-lint check` **new 0**, долг 45 ·
`kaif-scenario-lint check plans/113_…md` **exit 3 SKIPPED** (в плане нет сценарного блока: критерий
живёт сценарием в `plans/100` п. 22 — «не судилось» ≠ «чисто») · `kaif-guard-lint` 0 ·
`kaif-testrun-lint check` 0.

## 2. FR5 — две охоты `/fable-judge` (вставить в ОБЕ копии побайтно одинаково)

Файлы: `framework/skills/fable-judge/SKILL.md` и `.claude/skills/fable-judge/SKILL.md`
(вендоренный навык, обе копии английские и равны побайтно). Место — в KAIF-блоке 2.7, сразу после
охоты `**Signal filed, not delivered (KAIF 2.7).**`.

```markdown
  - **Idle seat ended by the owner (KAIF 2.7).** In a deployed TEAM (more than one role window open), a seat that closed its task — committed, reported, and has no next assignment — and ended its turn WITHOUT one message to the Manager naming *what is done · what remains · which candidates it can take, by name from `STATUS.md` or the board* ("I am free, may I take X / Y / Z"), or whose board row went `🟢 free` carrying no request, is a finding: the constitution makes the announcement an obligation with an exit condition, not a courtesy, and an idle the OWNER had to end is the defect itself (`TEAM_CONSTITUTION.md` § 2 rule 6 and § 4; origin issue #68 — a field seat finished its half of a smoke, reported, and stopped while `STATUS.md` listed three tickets "claimed by nobody" and a second seat sat idle; the owner's word ended it). The failure state is silent and looks correct — a finished, committed, reported seat is indistinguishable from a working one, to itself — so hunt it in the RECORD, not in the mood: an owner's message of the "why are you idle / take a task" family with no free-announcement before it; a report that ends at "done" with no candidates named; a board row `free` with an empty request cell; a seat whose last outgoing message predates the owner's by more than one turn. Re-run: read the board and the seat's outgoing messages in order — the announcement either precedes the owner's word or it does not exist. A single session in the main copy is NOT in scope: the constitution binds only while more than one role window is open.
  - **Team seat refreshed without the constitution (KAIF 2.7).** In team mode, a refresh witness — `.kaif/refresh-marker.json` written at any trigger (hour · heavy task · compaction · ritual) — whose `docs` does not name `TEAM_CONSTITUTION.md`, or a re-read claimed in chat that quotes only the project's own core, is a finding: a document read once at launch and never again governs nothing, and the rules of PARALLEL work are exactly the ones a seat loses first (`TEAM_CONSTITUTION.md` § 9; origin issue #68 — a seat re-read the core hourly under a marker with a quote and never once re-read the document that governs parallel work). Hunt also: a briefing that says "read the constitution in full" with no refresh trigger naming it afterwards; a generated constitution whose obligations `node .kaif/kaif-core.mjs check` names as lost while the seat reports the canon refreshed. Re-run: `node -e "console.log(require('./.kaif/refresh-marker.json').docs.join('\n'))"` and `node .kaif/kaif-core.mjs check`; a deployment with no `TEAM_CONSTITUTION.md` is not a finding — the hunt is silent outside team mode.
```

И в перечень охот 2.7 шапки (строка 14 обеих копий, пункт `(7) the KAIF 2.7 hunts in the same
block — …`) добавить два имени и две сжатые формулы: после `**signal-filed-not-delivered**` →
`, **idle-seat-ended-by-the-owner**, **team-seat-refreshed-without-the-constitution**`, а в скобки
после `· filing a KAIF ticket IS delivering it` → `· a free seat asks for work before its turn ends
· the constitution is re-read like the core while the team is open`.

**Проверка после вставки:** `node tools/check-framework.mjs` (пары ниже) и
`diff framework/skills/fable-judge/SKILL.md .claude/skills/fable-judge/SKILL.md` → пусто.

## 3. Запись 2.7 сборщика — `TEMPLATE_NOTES_BY_VERSION['2.7']` (`tools/build-framework.mjs`, массив со строки 281)

Добавить ОДНОЙ строкой в конец массива `'2.7'` (после записи SD), в его собственном стиле — одна
строка-литерал, апострофы экранированы:

```js
    'A FREE SEAT ASKS FOR WORK, AND A GENERATED CONSTITUTION KEEPS EVERY OBLIGATION OF ITS TEMPLATE (epic FR; origin issue #68 — a field seat finished its half of a smoke, committed, reported to its neighbour and to the owner, and stopped, while `STATUS.md` named three tickets "claimed by nobody" and a second seat sat idle on the board; the owner ended the idling himself). Two halves of one defect. (1) THE OBLIGATION: "idle — report to the Manager" lived as a TRAILING CLAUSE of the rule about blockers, and the rule is inverted relative to its cost — a blocker is felt by the agent, availability only by the dispatcher. The constitution template now carries it as its own § 2 rule 6 with an exit condition: task closed and no next one → ONE message to the Manager before the turn ends, naming what is done, what remains and which candidates you can take, by name from `STATUS.md` or the board ("I am free, may I take X / Y / Z"); idling without it is an UNCLOSED task, idling the owner had to end is a defect. The board template says the same from its side: a row set to `🟢 free` carries the request in the SAME write, and the board tool contract gains `--free --asking "<candidates>"` (item 7; `audit-waiting` becomes item 8). § 9 puts `TEAM_CONSTITUTION.md` into every seat\'s RE-READ CORE while more than one role window is open — named in the refresh marker\'s `docs` at every trigger. (2) THE GATE: the obligation did not survive GENERATION — the field constitution kept 5 of the template\'s 9 § 2 rules and nothing noticed, because a shorter document looks like editorial tightening rather than loss. `check` now compares a `TEAM_CONSTITUTION.md` in the project root against the template that shipped with the skill (found in the deployed `.claude/.agents/.grok/.cline` skills): obligations are the bold anchors of § 2\'s numbered items plus the nine invariant `## N.` headings, headings matched by NUMBER (which survives translation) and rules by anchor — and when NOT ONE anchor matches, the document is translated, so the axis says so and counts instead ("cannot match translated anchors: 10 expected in §2, 5 found"), printing the template\'s own order so the loss has something to be restored from. Every loss is named: `⚠ TEAM_CONSTITUTION.md lost N obligation(s) of the template: §2 "A free seat asks for work." …`. A warning, never a failure — the constitution is the owner\'s document; a deliberate omission is DECLARED beside the item with `<!-- constitution-ok: <why> -->`, and a tree with no constitution or no template is silent. /team-deployment now runs `check` and READS its lines at operation 3 step 1, at the start of the adopt inventory, and in "Done when".',
```

**Проверка:** `node tools/build-framework.mjs` → EXIT 0; `grep -c "A FREE SEAT ASKS FOR WORK" dist/KAIF-CORE-BUNDLE.md` → ≥ 1.

## 4. Пары `tools/check-framework.mjs` — вставить в `PAIRS` (массив со строки 418), после блока SD

```js
    // FR (2.7, origin issue #68): the obligation is a RULE of its own in both layers, the board row carries the
    // request, the constitution is in the seat's re-read core, the core compares a generated constitution against
    // the template, and the judge hunts both halves (the idle seat, and the seat refreshed without the document).
    ['free seat ↔ the constitution template carries the rule with its exit condition (payload)',
      'framework/skills/team-deployment/references/team-constitution-template.md',
      ['**A free seat asks for work.**', 'ONE message to the Manager', 'idling that the owner had to end is a defect']],
    ['free seat ↔ the constitution template carries the rule with its exit condition (wrapper)',
      '.claude/skills/team-deployment/references/team-constitution-template.md',
      ['**Свободное место просит работу.**', 'ОДНО сообщение', 'простой, который пришлось прервать']],
    ['free seat ↔ the constitution template puts the board row and the re-read core in writing (payload)',
      'framework/skills/team-deployment/references/team-constitution-template.md',
      ['carries the request in the SAME write', 'is part of every seat\'s\nRE-READ CORE']],
    ['free seat ↔ the board row carries the request and the tool contract asks (payload)',
      'framework/skills/team-deployment/references/team-status-board-template.md',
      ['the row carries the REQUEST', '`--free --asking "<candidates>"`']],
    ['free seat ↔ the board row carries the request and the tool contract asks (wrapper)',
      '.claude/skills/team-deployment/references/team-status-board-template.md',
      ['строка несёт ЗАПРОС', '`--free --asking "<кандидаты>"`']],
    ['free seat ↔ /team-deployment runs check after generation (payload)',
      'framework/skills/team-deployment/SKILL.md',
      ['node .kaif/kaif-core.mjs check', 'A finished seat announces itself FREE, naming candidates']],
    ['free seat ↔ /team-deployment runs check after generation (wrapper)',
      '.claude/skills/team-deployment/SKILL.md',
      ['node .kaif/kaif-core.mjs check', 'Закончившее место объявляет себя СВОБОДНЫМ, называя кандидатов']],
    ['free seat ↔ the core compares a generated constitution against its template',
      'framework/installer/KAIF-CORE.mjs',
      ['@guard constitution-keeps-obligations', 'lost ${lost.length} obligation(s) of the template',
       'cannot match translated anchors']],
    ['free seat ↔ /fable-judge hunts the idle seat and the seat refreshed without the constitution',
      'framework/skills/fable-judge/SKILL.md',
      ['**Idle seat ended by the owner (KAIF 2.7).**',
       '**Team seat refreshed without the constitution (KAIF 2.7).**']],
```

⚠️ Пара с токеном `is part of every seat\'s\nRE-READ CORE` несёт ПЕРЕНОС СТРОКИ — сверь её против
`missingTokens`/`segmentsOf` этого файла (они судят по половинам); если перенос не переживает, режь
токен до `RE-READ CORE` и `name it in the refresh marker's`. **Проверка:** `node tools/check-framework.mjs`
→ зелёный; мутация — убери любой токен из файла и убедись, что пара краснеет поимённо.

## 5. `framework/KAIF_REFERENCE.md` — предложение (корневая копия ГЕНЕРИРУЕТСЯ, правь источник)

Строка 375 уже перечисляет оси `check`. Дописать после блока про «undelivered signal», в той же
скобке-перечислении:

```
· (since 2.7, epic FR — origin issue #68 — also the axis "constitution keeps the obligations of its
template": with a `TEAM_CONSTITUTION.md` in the root and the skill's template on disk, every bold
anchor of § 2's numbered items and every one of the nine `## N.` headings must survive generation —
headings matched by NUMBER, rules by anchor, and a document where not one anchor matches is
translated, so the axis counts and says so; losses are named one by one, a warning never a failure,
and `<!-- constitution-ok: <why> -->` beside the item is the declared exemption)
```

**Проверка:** `node tools/build-framework.mjs` (корневой `KAIF_REFERENCE.md` пересобирается) →
`grep -c "constitution keeps the obligations" KAIF_REFERENCE.md` → 1.

## 6. Черновик ответа в issue #68 (EN; отправка ПОСЛЕ релиза 2.7 — №84/№92/№93)

> Shipped in KAIF 2.7 (epic FR). All four of your proposals went in, and your one-line diagnosis —
> *"the obligation is inverted relative to its cost: the party that pays is the party not required to
> speak"* — is the reason the rule now stands on its own instead of riding on the blocker rule.
>
> **1. The obligation is a rule with an exit condition.** The constitution template's § 2 gains rule 6:
> *"**A free seat asks for work.** Task closed and no next one → ONE message to the Manager BEFORE the
> turn ends: what is done · what remains · which candidates you can take, named from `STATUS.md` / the
> board — 'I am free, may I take X / Y / Z'. Naming candidates is what makes it answerable: 'I am free'
> invites silence, a named list invites one word back. Idling without that message is an UNCLOSED task;
> idling that the owner had to end is a defect."* Rule 5 keeps the blocker and hands idling over in one
> clause ("Finished with nothing next is not a blocker — rule 6"), so nothing is carried by a trailing
> sentence any more. Your owner's words are quoted in the rule's justification, and the skill's
> "paid-for field lessons" gains an eighth entry naming the 17 % of a six-seat team spent in silence.
>
> **2. The generation gate exists, and it generalises past this rule** — the half you called the more
> valuable one. `node .kaif/kaif-core.mjs check` now compares a `TEAM_CONSTITUTION.md` in the project
> root against the template that shipped with the skill (looked up in the deployed skills of any of the
> supported agent systems). Obligations are the bold anchors of § 2's numbered items plus the nine
> invariant `## N.` headings. Headings are matched by their NUMBER, which survives translation; rules
> by their anchor — and when NOT ONE anchor matches, the document is a translation, so the axis says so
> instead of pretending and counts instead: `⚠ TEAM_CONSTITUTION.md cannot match translated anchors:
> 10 expected in §2, 5 found — 5 obligation(s) of the template are missing from the communication
> regimen`, followed by the template's own order so there is something to restore from. A loss in an
> English constitution is named one by one: `⚠ TEAM_CONSTITUTION.md lost 4 obligation(s) of the
> template: §2 "Do not interrupt the busy.", §2 "Never stay silent about a blocker.", §2 "Help
> respectfully.", §2 "No cacophony." — restore them, or declare the omission beside the item with
> `<!-- constitution-ok: <why> -->`. A warning, never a failure — the constitution is the owner's
> document and his edited tree must not fail its own check; a tree with no constitution, or no template
> beside it, is silent. `/team-deployment` now runs `check` and READS its lines at operation 3 step 1,
> at the start of the adopt inventory (where a named loss is a *bring-to-canon* candidate the owner has
> not been asked about yet), and in "Done when".
>
> Before writing any of it I fed the shipped 2.6 core exactly your shape — a fresh install plus a
> constitution generated from the template with rules 4–7 cut — and got exit 0 and not one word about
> the document: your report, reproduced. Then I ran the new axis over a copy of a real, live team's
> constitution from this machine (generated by `/team-deployment` on KAIF 2.4, nine § 2 rules intact,
> plus a section of its own numbered `## 0.`): `check` names exactly one loss — `§2 "A free seat asks
> for work."` — the 2.7 obligation a 2.4-era document cannot have, and stays silent about everything
> else, including the extra section. That is the axis doing precisely what you asked for.
>
> **3. The board speaks.** The `🟢 free` state is no longer "report readiness": *no assignment in hand
> → the row carries the REQUEST* — what is done and which candidates the seat asks for, in the SAME
> write that sets `free`, with the manager's side written as "read a QUEUE, not a poll". The board
> tool contract gains item 7 — `--free --asking "<candidates>"`, and a `--free` with nothing asked for
> is refused or at minimum named in `show` (`audit-waiting` moves to item 8).
>
> **4. The parallel-work document is in the re-read core.** § 9: while more than one role window is
> open, `TEAM_CONSTITUTION.md` is part of every seat's re-read core and is named in the refresh
> marker's `docs` at every trigger — with your own observation as its reason: a seat re-reading the
> canon hourly can spend a whole day of parallel work without once re-reading the document that governs
> parallel work.
>
> Two `/fable-judge` hunts close the behavioural half the machine cannot see: **Idle seat ended by the
> owner** (a turn that ends with no free-announcement, a `free` row with an empty request, or an
> owner's "why are you idle" with no announcement before it) and **Team seat refreshed without the
> constitution** (a refresh witness whose `docs` does not name it).
>
> One honest boundary: everything above is verified on the shipment — a deployed copy, the polygon, a
> copy of a real field constitution — and NOT on a live 2.7 team. Nobody has yet watched a seat say "I
> am free, may I take X / Y / Z" on its own. If your team updates, that observation is the one thing
> this epic still owes, and your report of it would close it.

## 7. Черновик урока `EXPERIENCE.md` (вставить первым, номер — следующий свободный)

```markdown
### EXP-0NNN · 2026-09-18 · ❌→✅ · #team #generation #guards #obligations #anchors #fail-open #fr
**Ситуация:** issue #68 — сгенерированная навыком конституция команды сохранила 5 правил §2 из 9, и
обязательство «свободен → доложи» исчезло вместе с тремя соседями; ни один гейт не сказал ни слова,
потому что более короткий документ выглядит как редакторское уплотнение, а не как потеря.
**Что делали:** ось `check` ядра сверяет сгенерированный документ с ШАБЛОНОМ, приехавшим в навыке:
якоря нумерованных пунктов §2 + девять заголовков `## N.`; заголовки — по НОМЕРУ (переживает
перевод), правила — по якорю, а при нуле совпадений документ объявляется переведённым и судится
СЧЁТОМ с честной фразой «cannot match translated anchors».
**Итог:** ❌→✅ — потерянное называется поимённо, код 0; `s25` 45/45, красный на 2.6 (8 ассертов),
шесть мутантов, функциональный прогон на копии конституции живого полевого развёртывания.
**Урок:** обязательство, ПОРОЖДЁННОЕ шаблоном, живёт ровно до первой генерации, если генерацию
никто не сверяет с источником: правило-хвост исчезает первым, а «стало короче» читается как работа
редактора. И второй, найденный мутантом: сверяя, СОХРАНЕНО ли обязательство, ищи его якорь ТАМ, ГДЕ
СТОЯТ ОБЯЗАТЕЛЬСТВА (среди пунктов секции), а не где угодно в тексте — иначе документ, который
ПЕРЕЧИСЛЯЕТ удалённые правила (приложение «что мы убрали», оглавление, сам маркер объявленного
исключения), читается целым, и проверка отказывает в сторону fail-open ровно там, где её просили
быть строгой.
**Repro:** свежая установка из `dist` + `TEAM_CONSTITUTION.md` из шаблона с вырезанными правилами
4–7 → `node .kaif/kaif-core.mjs check`: на 2.6 — exit 0 и тишина; на 2.7 — `⚠ … lost 4
obligation(s) of the template: §2 "…"`.
**Trigger:** пишешь гейт «сгенерированный документ сохранил обязательства источника» → (1) назови,
ЧТО такое обязательство, формой (якорь пункта, заголовок с номером), а не «смыслом»; (2) реши
отдельно, как ведёт себя гейт на ПЕРЕВЕДЁННОМ документе, и скажи это вслух в самом предупреждении;
(3) прогони мутанта «исключение игнорируется» — он и покажет, работает ли твоё сравнение через тот
механизм, про который ты думаешь.
**Not for:** документов, у которых источника-шаблона на диске нет (сверять не с чем — ось молчит), и
секций, чьи обязательства не выражены формой (сплошная проза).
**Механизация:** механизировано — `@guard constitution-keeps-obligations` в `cmdCheck`
`framework/installer/KAIF-CORE.mjs`; семь ассертов в `tools/sandbox/s25-testrun-lint.mjs` (раздел
«(4)»); красный доказан на ядре 2.6 швом `KAIF_DIST` и шестью мутантами блока.
```

## 8. Строки для `plans/100_EPIC_kaif_2.7.md`

**Строка 15 таблицы эпиков** — заменить хвост `| 0,5–0,75 | 🔲 план — `plans/113` (нулёвка FR0) |` на:

```
| 0,5–0,75 | ✅ **ЗАКРЫТ 2026-09-18 <момент> +03:00** — `plans/113`, отдельный worktree (проба ДО кода красная; ось `check` «constitution-keeps-obligations»; `s25` +7 ассертов, красные на ядре 2.6 и на шести мутантах; мутант нашёл fail-open первой сборки — якорь засчитывался где угодно в тексте; функциональный прогон на копии конституции живого полевого развёртывания; отчёт `testcases/reports/2026-09-18_constitution-keeps-obligations.md`, вердикт partial; критерий 22 ✅) |
```

**Критерий 22** — под сценарием добавить строку отметки (форма критериев 15–17):

```
    ✅ 2026-09-18 <момент> +03:00 — FR0–FR6 (`plans/113`): шаблон конституции §2 п. 6 · §4 · §9 и шаблон доски (`--free --asking`)
    в обоих слоях; ось `check` ядра называет потерянное обязательство ПОИМЁННО (предупреждение, код 0), переведённую конституцию
    судит СЧЁТОМ вслух, объявленное `<!-- constitution-ok: … -->` не называет; `s25` 45/45, на ядре 2.6 — 8 ассертов FR красные,
    шесть мутантов блока красят каждый свой ассерт; функциональный прогон на КОПИИ конституции живого полевого развёртывания —
    названа ровно одна потеря (новое правило 2.7), исходник поля не тронут. **Половина критерия о живом наблюдении** («место само
    отправило „свободен … могу взять X / Y / Z"») НЕ наблюдалась: живого командного развёртывания 2.7 нет — ждёт первого полевого
    отчёта (отчёт прогона, вердикт partial).
```

**Метрика версии** — строка 82: после записи о знаменателе 23 дописать
`**2026-09-18 <момент> +03:00: закрыто 15 из 23 (… FR — критерий 22).**`

⚠️ Момент подставь ФАКТИЧЕСКИЙ, снятый `date` в момент записи (EXP-0078: метки не выдумываются).

## 9. Что этот worktree НЕ сделал и почему

- **FR5 (охоты судьи)** — обе копии `fable-judge/SKILL.md` под запретом; тексты — §2 выше.
- **Записи 2.7 сборщика и пары `check-framework`** — `tools/build-framework.mjs` и
  `tools/check-framework.mjs` под запретом; тексты — §3 и §4.
- **`README.md`, `STATUS.md`, `MASTER_PLAN.md`, `EXPERIENCE.md`, `plans/100`** — под запретом;
  тексты — §7 и §8. Расхождений счётчиков НЕТ: новый свод не заводился (решение `[ИИ]` 3 в
  `plans/113`), полигон остался 26 сводов, `counters-guard` зелёный, README трогать не пришлось.
- **Судейский проход (`/fable-judge`)** — не запускался: охоты ещё не вставлены, и суд над работой
  эпика — шаг FR7 главной сессии.
- **Живое наблюдение «место само сказало „свободен"»** — не проводилось и не заявляется: живого
  командного развёртывания 2.7 на этой машине нет, а поднимать окна работе было запрещено.
- **`kaif-scenario-lint` по `plans/113`** — `exit 3 SKIPPED`: сценарного блока в плане нет по
  построению (критерий живёт сценарием в `plans/100`). Если хочешь зелёный, а не SKIPPED, —
  перенеси сценарий критерия 22 в раздел «Готово, когда» плана дословно.
