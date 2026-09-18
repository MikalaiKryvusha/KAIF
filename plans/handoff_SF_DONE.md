# Передача эпика SF «Ложь исправляется там, где оставлена» — интегратору

> **Создан:** 2026-09-18 01:12 +03:00 · **Родитель:** `plans/112_epic100_SF_standing_falsehood.md` (критерий приёмки версии
> 21 `plans/100`; источник — issue #67). **Статус:** ✅ **DONE** — SF0–SF2, SF4, SF5 исполнены в отдельном git worktree (сессия 65);
> SF3, пары, запись 2.7, урок EXP-0137 и критерий 21 ✅ — **внесены интегратором (сессия 66) 08:34–08:38 +03:00**; зеркала счётчиков
> сошлись пересборкой после слияния (797 модулей, `counters-guard` 50/50); судья интеграции ≈ 08:52 — VERIFIED WITH CAVEATS.
> Открыт только §4 — черновик ответа #67 (после релиза). Прежний статус: SF3, пары, записи 2.7, три зеркала счётчика и SF6 — за интегратором. **Вовне:** ничего не отправлено — ни пуша,
> ни комментария в issue.
>
> **Ветка:** `worktree-agent-a513d874b5bf458e2` (worktree `D:\work\ai_sandbox\KAIF\.claude\worktrees\agent-a513d874b5bf458e2`),
> отведена от HEAD `2b7e9e8`.

## 0. Что изменено в ветке (построчно)

| Файл | Что | Проверить |
|---|---|---|
| `framework/AGENT_GUIDE.md` `:425–453` | Шестое обязательство KAIF в точке вызова fable-цикла — "A FALSEHOOD IS CORRECTED WHERE IT STANDS": слово владельца проекта rendered from Russian, пять нумерованных шагов с командой `git grep -n "<the phrase>"`, имя класса **standing falsehood**, граница (гипотеза · append-only журнал) | `grep -n "A FALSEHOOD IS CORRECTED WHERE IT STANDS" framework/AGENT_GUIDE.md` → одна строка |
| `AGENT_GUIDE.md` `:419–448` | То же по-русски — «ЛОЖЬ ИСПРАВЛЯЕТСЯ ТАМ, ГДЕ ОСТАВЛЕНА», слово владельца дословно | `grep -n "ЛОЖЬ ИСПРАВЛЯЕТСЯ ТАМ, ГДЕ ОСТАВЛЕНА" AGENT_GUIDE.md` |
| `AGENT_GUIDE.md` `:632` | Зеркало счётчика модулей 792 → 794 (две новые секции сфер) | `node tools/counters-guard.mjs` — строка AGENT_GUIDE больше не красная |
| `framework/skills/end-chat-soft/SKILL.md` `:82–92` | Шаг 5: вопрос по имени + дословная строка `Standing falsehood: none` | `grep -n "Standing falsehood: none" framework/skills/end-chat-soft/SKILL.md` |
| `.claude/skills/end-chat-soft/SKILL.md` `:96–106` | То же по-русски: `Стоячая ложь: нет` | `grep -n "Стоячая ложь: нет" .claude/skills/end-chat-soft/SKILL.md` |
| `framework/skills/end-chat-force/SKILL.md` `:21–25` | Шаг 1: строка стоячей лжи одной фразой рядом со строкой долга церемоний | `grep -n "The standing falsehood line" framework/skills/end-chat-force/SKILL.md` |
| `.claude/skills/end-chat-force/SKILL.md` `:21–26` | То же по-русски | `grep -n "Строка стоячей лжи" .claude/skills/end-chat-force/SKILL.md` |
| `framework/spheres/_template.md` `:49–61` | Новый слот «Outward write channels → retraction command» с таблицей и правилом «канал без известной команды называется вслух» | `grep -n "Outward write channels" framework/spheres/_template.md` |
| `framework/spheres/programming.md` `:59–74` | Тот же слот, заполненный: девять каналов, команды сверены с `--help` установленного `gh 2.95.0` | `grep -n "gh issue comment <N> --edit-last" framework/spheres/programming.md` |
| `framework/spheres/_index.md` `:16–17` | Слот добавлен в перечень слотов библиотеки сферы | `grep -n "outward write channels" framework/spheres/_index.md` |
| `bugs/70_DONE_owner_queue_zero_can_be_false_green.md` `:47–59` | **Функциональный прогон SF5:** поправка реальной стоячей лжи истока на её месте | `sed -n '43,60p' bugs/70_DONE_owner_queue_zero_can_be_false_green.md` |
| `testcases/reports/2026-09-18_standing-falsehood.md` | Отчёт прогона, семь полей, две строки `Гигиена:` / `Функциональный прогон:`, вердикт **partial** | `node framework/tools/kaif-testrun-lint.mjs check` → «8 report(s), 0 findings» |
| `plans/112_epic100_SF_standing_falsehood.md` | Шаги SF0–SF2, SF4, SF5 отмечены с моментами и прежними формулировками; SF0 несёт `INTENT:`/`FORK:`; восемь решений `[AI]` | чтением |
| `plans/handoff_SF.md` | этот файл | — |
| `dist/*` | Пересобрано `node tools/build-framework.mjs` (генерат, руками не правился) | `node tools/build-framework.mjs && git diff --stat dist/` → пусто |
| `version.json` | `build` 553 → 554 — поднят самим `tools/commit.mjs` (внутренний счётчик коммитов, не версия); при слиянии — тривиальный конфликт счётчика | `git show f4ee197 --stat -- version.json` |

**Файлы, к которым исполнитель НЕ прикасался по заданию:** `plans/100`, `STATUS.md`, `MASTER_PLAN.md`, `EXPERIENCE.md`,
обе копии `fable-judge/SKILL.md`, `tools/build-framework.mjs`, `tools/check-framework.mjs`, `README.md`.

## 1. SF3 — готовый текст охоты для KAIF-блока судьи (ОБЕ копии побайтно)

Вставить последней строкой блока охот 2.7 — после `- **Signal filed, not delivered (KAIF 2.7).** …`
(`framework/skills/fable-judge/SKILL.md:64`), тем же движением в `.claude/skills/fable-judge/SKILL.md` (копии сверяются
`diff`-строкой реестра пар):

```
   - **Standing falsehood (KAIF 2.7).** A statement the session itself later contradicted — in the chat, in its own notes, in a report — that still stands where it was published: a tracker comment, a page, a chat-ops message, a project document, a status line, a plan, a run report. The agent's internal state is corrected and the artifact the team reads is false, which is the same fraud as an unbacked `[TESTED]`, only aged (`AGENT_GUIDE.md` → the fable loop's sixth KAIF obligation: stop → enumerate every place → correct or retract in each → read back → `corrected: <where>` in the reply; origin issue #67 — the project owner's word, rendered from Russian: "the agent leaves a lie and forgets to correct the lie where it left it, once it has found out that something in the past was a lie", said after he pointed at his own ticket a second time). Hunt also: a session close or a run report carrying a correction in the record with no `Standing falsehood:` line at all (the closing rituals ask for it by name); an answer of `none` beside a place the report itself says could not be corrected; a correction written only into the agent's notes or only into a NEW document while the original stands unchanged; "I will fix it at the end of the task" as a recorded plan. Re-run: `git grep -n "<the false phrase>"` over the repository and the retraction command of every outward channel the sphere library names (`framework/spheres/<sphere>.md` → "Outward write channels → retraction command") — a hit with no correction beside it is the finding; a draft marked as a hypothesis and an append-only journal entry whose newer entry names the one it corrects are NOT findings.
```

И сводную строку шапки — `framework/skills/fable-judge/SKILL.md:14` (та же правка в копии): в перечне 2.7 после
`**signal-filed-not-delivered**` добавить `, **standing-falsehood**`, а в скобочном перечне смыслов после
`· filing a KAIF ticket IS delivering it` — `· a falsehood is corrected where it stands, not in the chat`.

**Проверить:** `diff framework/skills/fable-judge/SKILL.md .claude/skills/fable-judge/SKILL.md` → пусто;
`grep -c "Standing falsehood (KAIF 2.7)" framework/skills/fable-judge/SKILL.md .claude/skills/fable-judge/SKILL.md` → по 1;
`node <скретчпад>/sf0-probe.mjs` (лежит в скретчпаде исполнителя; переписывается за минуту) → ось 2 зелёная.

## 2. Готовая запись для `TEMPLATE_NOTES_BY_VERSION['2.7']` (`tools/build-framework.mjs`, блок `:281–292`)

Добавить одиннадцатой записью, после записи эпика SD (стиль соседних — заглавное правило, тикет и слово владельца,
затем места):

```
    'A FALSEHOOD IS CORRECTED WHERE IT STANDS, NOT IN THE CHAT (epic SF; origin issue #67 — the project owner\'s word, rendered from Russian: "the agent leaves a lie and forgets to correct the lie where it left it, once it has found out that something in the past was a lie", said the moment he caught the live case: an agent closed a ticket with the comment "the model does not write it, so there is nothing to trim", learned the real mechanism from him an hour later, agreed IN THE CHAT, wrote the correction into its own notes — and the false comment stayed in the tracker under his name until he came back a second time). The canon demanded observation at a claim\'s BIRTH (the fifth obligation, issue #63) and nothing at its refutation. Four places, one rule: (1) AGENT_GUIDE (both layers) gains a SIXTH KAIF obligation at the fable loop\'s steps 4 and 7 — the trigger is an EVENT, not a step: the minute a past statement of yours is identified as false, five steps run BEFORE the work continues — stop the current task · enumerate every place it was published (`git grep -n "<the phrase>"` for the repository, the outward channels by the sphere library\'s command, plus STATUS and the run reports) · correct or retract in EACH (an edit where the artifact is ours, a "correction: …" comment where the channel only appends, a deletion where the channel allows one; a channel whose retraction command you do not know is said aloud) · read it back · name it in the reply as `corrected: <where>`; the class has a name, a STANDING FALSEHOOD, and the boundary excludes a draft marked as a hypothesis and an append-only journal entry whose new entry names the one it corrects; (2) /end-chat-soft (both layers) asks for it BY NAME in the farewell report — `Standing falsehood: none` or the statement with the places it was corrected in — and a place that could not be corrected is named with its missing retraction command instead of an answer of "none"; (3) /end-chat-force carries the same line as one phrase beside the ceremonies-debt line: force mode may skip a ceremony, never a lie left standing under the owner\'s name; (4) the sphere libraries gain the slot "Outward write channels → retraction command" (`_template.md`, filled in `programming.md` with nine channels: the repository\'s own files, a pushed commit message, an issue/PR comment of yours and someone else\'s, an issue/PR body, a published release note, a wiki page, a chat-ops message, the owner\'s contour page) so step 3 is executable rather than imagined. /fable-judge hunts "a standing falsehood".',
```

**Проверить:** `node tools/build-framework.mjs` → EXIT 0; затем
`grep -c "A FALSEHOOD IS CORRECTED WHERE IT STANDS, NOT IN THE CHAT" dist/KAIF-CORE-BUNDLE.md` → не 0 (запись доехала в
мета-блок бандла: `templateNotesByVersion` живёт там, в `dist/kaif-manifest.json` его нет — проверено 2026-09-18 01:13
+03:00). Записей 2.7 сейчас **десять**; после твоей — одиннадцать.

## 3. Готовые пары для `PAIRS` (`tools/check-framework.mjs`, блок `:418`)

Формат — `['метка', 'файл', ['строка-улика', …]]`; улики ПОЛНЫЕ и уникальные (короткая примета зеленеет на чужой строке).
Ставить после блока SD, с комментарием-шапкой семейства:

```js
    // SF (2.7, origin issue #67): the retraction procedure stands in the canon of BOTH layers, the closing rituals ask
    // for the class by name, the sphere libraries name a retraction command per outward channel, and the judge hunts a
    // claim the session itself refuted and left standing.
    ['falsehood ↔ AGENT_GUIDE carries the sixth obligation with its command (payload)', 'framework/AGENT_GUIDE.md',
      ['A FALSEHOOD IS CORRECTED WHERE IT STANDS', 'a **standing falsehood**', 'git grep -n "<the phrase>"']],
    ['falsehood ↔ AGENT_GUIDE carries the sixth obligation with its command (wrapper)', 'AGENT_GUIDE.md',
      ['ЛОЖЬ ИСПРАВЛЯЕТСЯ ТАМ, ГДЕ ОСТАВЛЕНА', '**стоячая ложь**', 'git grep -n "<фраза>"']],
    ['falsehood ↔ /end-chat-soft asks for the class by name (payload)', 'framework/skills/end-chat-soft/SKILL.md',
      ['`Standing falsehood: none`', 'which statement of this session']],
    ['falsehood ↔ /end-chat-soft asks for the class by name (wrapper)', '.claude/skills/end-chat-soft/SKILL.md',
      ['`Стоячая ложь: нет`', 'какое утверждение этой сессии']],
    ['falsehood ↔ /end-chat-force keeps the line in force mode (payload)', 'framework/skills/end-chat-force/SKILL.md',
      ['The standing falsehood line', 'Standing falsehood: none']],
    ['falsehood ↔ /end-chat-force keeps the line in force mode (wrapper)', '.claude/skills/end-chat-force/SKILL.md',
      ['Строка стоячей лжи', 'Стоячая ложь: нет']],
    ['falsehood ↔ the sphere template carries the retraction slot', 'framework/spheres/_template.md',
      ['## Outward write channels → retraction command']],
    ['falsehood ↔ the reference sphere fills the retraction slot with commands', 'framework/spheres/programming.md',
      ['## Outward write channels → retraction command', 'gh issue comment <N> --edit-last --body-file <file>']],
    ['falsehood ↔ /fable-judge hunts a standing falsehood', 'framework/skills/fable-judge/SKILL.md',
      ['**Standing falsehood (KAIF 2.7).**']],
```

**Проверить:** `node tools/build-framework.mjs` (внутри гоняется `check-framework`) → EXIT 0; красное доказательство пары
— временно убери строку-улику в копии файла и убедись, что сборка называет пару поимённо.

## 4. Черновик ответа в #67 (EN; отправка — после релиза 2.7, как №84/№92/№93)

> Shipped in KAIF 2.7 (epic SF). All four of your proposals went in, in the shape you proposed them, and your diagnosis —
> "correct your mistakes" is exactly the prose shape that weak models drop — decided where the rule lives.
>
> **1. The canon step with a command.** `AGENT_GUIDE.md` (both layers) gains a sixth KAIF obligation at the call point of
> the execution loop, immediately after the fifth ("a claim is never wider than the observation", issue #63). The trigger
> is an EVENT, not a step: the minute a past statement of yours is identified as false, five steps run BEFORE the work
> continues — stop the current task; enumerate every place it was published (`git grep -n "<the phrase>"` for the
> repository, the outward channels by the command your sphere library names, plus `STATUS.md` and the run reports);
> correct or retract in EACH place; read it back; name it in the reply as `corrected: <where>`. Your two tickets compose
> exactly as you said: #63 bounds a claim at its birth, this one bounds how long a born falsehood survives once it is
> known — so it stands next to it rather than in a corrections section of its own. That placement is not taste: the same
> repository has measured twice (#37, #65) that a narrow rule written away from the rule it continues loses to a broad,
> always-on reflex.
>
> **2. The named class.** It is called a **standing falsehood**, in those words, and both closing rituals ask for it by
> name: `/end-chat-soft` step 5 now answers `Standing falsehood: none` or names the statement with the places it was
> corrected in, and `/end-chat-force` carries the same line as one phrase beside its ceremonies-debt line — force mode
> may skip a ceremony, never a lie left standing under the owner's name. A place that could not be corrected is named
> with its missing retraction command instead of an answer of `none`. The boundary is the one you drew, plus one case
> your ticket did not need: a draft marked as a hypothesis is not a standing falsehood, and neither is an append-only
> journal entry — there the correction IS a new entry, but that entry names the one it corrects.
>
> **3. The judge check.** `/fable-judge` hunts "a standing falsehood": a statement the session itself later contradicted
> that still stands where it was published; a session close or a run report carrying a correction in the record with no
> `Standing falsehood:` line; a correction written only into the agent's notes while the original stands. Its re-run is
> your step (b): grep the phrase over the repository and use the retraction command of every outward channel the sphere
> library names.
>
> **4. The sphere hook.** `framework/spheres/_template.md` gains the slot "Outward write channels → retraction command",
> and the reference sphere `programming.md` fills it with nine channels — the repository's own files, a pushed commit
> message (immutable: the correction is the next commit naming the old hash), an issue or PR comment of yours
> (`gh issue comment <N> --edit-last --body-file <file>`), someone else's comment (a reply in the SAME thread beginning
> `correction: …`, because a correction in another thread never reaches this thread's reader), an issue or PR body, a
> published release note, a wiki page, a chat-ops message, and the owner's contour page. Every command there was checked
> against the installed `gh` rather than recalled. A channel with no known retraction command is written down as such, so
> the agent says it aloud instead of passing over it in silence — step (c) executable, as you asked.
>
> Proof that the rule is not decoration: before writing a line I ran a probe over twelve canon, ritual, judge and sphere
> files for `retract / falsehood / standing falsehood` — zero hits, and none of the 32 judge hunts reached the retroactive
> case; your report, reproduced. Then I ran the new procedure against a real standing falsehood of this repository:
> `bugs/70_DONE_…:45` claimed "both halves are proven by fixtures (reddens / stays silent)"; an audit refuted half of it
> on 2026-08-14, and the sentence had stood unchanged for 35 days. I re-executed the refutation (the mutation the audit
> described still leaves the self-test green — 41 of 41 mutations "as predicted"), wrote the correction under the claim
> itself, read it back, and re-ran the grep. Your local section and this canon section reconcile the way you wrote they
> should: keep your project's channel commands, and let the procedure and the class name come from the canon.
>
> Thank you for the second half of the ticket in particular — naming the class is what let the closing rituals ask for it.

## 5. Черновик урока для `EXPERIENCE.md` (вставить первым, над EXP-0134)

```
### EXP-0135 · 2026-09-18 · ❌→✅ · #standing-falsehood #retraction #canon-placement #obligation-form #event-trigger #functional-run #real-state #spheres #judge #sf
**Ситуация:** эпик SF 2.7 (`plans/112`, #67): канон обоих слоёв нормировал РОЖДЕНИЕ заявления (пятое обязательство, #63) и молчал о пережитом опровержении — правда приходит посреди другой задачи, агент соглашается в чате, правит свои заметки и идёт дальше, а утверждение стоит там, где опубликовано. Проба ДО кода: греп двенадцати файлов канона, ритуалов закрытия, судьи и сфер на `retract / falsehood / стоячая ложь` → 0 попаданий; 32 охоты судьи прочитаны — ретроактивный случай не достаёт ни одна.
**Что делали:** шестое обязательство KAIF вплотную к пятому (а не отдельным разделом в «Гигиене» — узкое правило вдали от правила, которое оно продолжает, дважды проигрывало широкому рефлексу, #37/#65); пять нумерованных шагов с командой в шаге 2; имя класса «стоячая ложь» и строка `Standing falsehood: none` / «Стоячая ложь: нет» в `/end-chat-soft` и `/end-chat-force` обоих слоёв; слот «Outward write channels → retraction command» в `_template` сфер и девять каналов в `programming` с командами, сверенными с `--help` установленного `gh`. Функциональный прогон — не на фикстуре: грепом по `bugs/` найдено РЕАЛЬНОЕ утверждение истока, опровергнутое 2026-08-14 и стоявшее 35 дней (`bugs/70_DONE:45`), опровержение ПЕРЕИСПОЛНЕНО мутацией (селфтест остался зелёным — фикстуры половины (б) нет), поправка вписана под самим утверждением, прочитана обратно, греп повторён.
**Итог:** ❌→✅ — процедура, имя класса и команды отзыва стоят в обоих слоях; одна реальная стоячая ложь истока исправлена на своём месте; вердикт отчёта прогона — `partial` (охота судьи и пары — за интегратором, и так сказано).
**Урок:** (1) обязательство, чей триггер — СОБЫТИЕ, а не шаг цикла, всё равно крепится к точке, где агент встречает РОДСТВЕННОЕ правило: рядом с «заявление не шире наблюдения» живёт «то же заявление после опровержения», и читаются они одним взглядом; (2) у класса, который просит владелец, берут ЕГО имя («стоячая ложь» — из тикета): по имени спрашивает ритуал, по имени охотится судья, и имя переживает переписывание правила; (3) правило «исправь в каждом месте» исполнимо ровно настолько, насколько названа команда КАЖДОГО канала — слот сферы превращает шаг из воображаемого в исполнимый, а канал без команды называется вслух, а не проходится молча; (4) функциональный прогон правила о лжи ищется грепом по СОБСТВЕННЫМ закрытым документам: опровержения лежат в `bugs/` и в аудитах, и там же лежит ответ на вопрос «стоит ли ложь до сих пор»; (5) опровержение, найденное в старом документе, переисполняется ДО того, как на него сошлются в поправке, — иначе поправка сама становится заявлением шире наблюдения.
**Repro:** `node tools/build-framework.mjs` → EXIT 0; `grep -n "A FALSEHOOD IS CORRECTED WHERE IT STANDS" framework/AGENT_GUIDE.md` и `grep -n "ЛОЖЬ ИСПРАВЛЯЕТСЯ ТАМ, ГДЕ ОСТАВЛЕНА" AGENT_GUIDE.md` → по одной строке; `grep -n "Standing falsehood: none" framework/skills/end-chat-*/SKILL.md`; действием — скопируй `tools/questions-guard.mjs`, верни скоуп `if (iv.waiting) for (const q of empty)` и запусти `--selftest`: exit 0 на мутанте = фикстуры половины (б) нет (`bugs/70` поправка, `bugs/84` вхождение 2).
**Trigger:** узнал, что твоё прошлое утверждение ложно (слово владельца, замер, поздний прогон) → пять шагов ДО продолжения работы, и `git grep -n "<фраза>"` первым; пишешь правило о том, что делать в МИНУТУ события → крепи его к родственному правилу, а не в тематический раздел; ссылаешься на чужое старое опровержение → переисполни его прежде, чем писать поправку.
**Not for:** черновиков с пометкой гипотезы и append-only журналов (там поправка — новая запись, называющая старую); заявлений, которые НЕ опровергнуты, а просто устарели по числу — их стережёт `counters-guard`, а не процедура.
**Механизация:** механизировано частично: строка ритуала закрытия обоих слоёв (чекбокс прощального отчёта) + слот сфер + девять пар `check-framework` держат НОСИТЕЛИ правила; охота судьи «Standing falsehood (KAIF 2.7)» судит исполнение. Самого класса машина не видит: «утверждение, которое сессия сама позже опровергла» не имеет лексической приметы — страж угадывал бы и красил честные поправки (решение [AI] 2 `plans/112`).
```

## 6. Предложенные строки для `plans/100` и `framework/KAIF_REFERENCE.md`

**Строка 14 таблицы эпиков** (`plans/100:557`) — заменить хвост `| 0,5 | 🔲 план — plans/112 (нулёвка SF0) |` на:

```
| 0,5 | 🔧 SF0–SF2, SF4, SF5 ✅ 2026-09-18 01:10 +03:00 (ветка worktree-agent-a513d874b5bf458e2) — `plans/112`; открыто: SF3 (охота судьи), пары, записи 2.7, три зеркала счётчика, SF6 |
```

**Критерий 21** (`plans/100:484–497`) — строку «Проверка» НЕ править (правило 7 сценарной формы); отметить ✅ можно только
после SF3 и пар: сегодня из шести пунктов «Проверки» закрыты четыре (грепы раздела, шага ритуала, строки сфер), два
(охота судьи, пары `check-framework`) — за интегратором → **внесены сессией 66, критерий 21 ✅ 08:38 +03:00**. Знаменатель версии не меняется.

**`framework/KAIF_REFERENCE.md:136`** (описание `/end-chat-soft` + `/end-chat-force`) — предложение исполнителя, решение
за интегратором → **взято сессией 66** (фраза стоит в `framework/KAIF_REFERENCE.md`, корневая копия пересобрана); эпик не отгружает ни команды, ни модуля, поэтому справочник устройства можно было оставить как есть. Если
берёшь — одна вставка в скобку описания:

```
(since 2.7, epic SF — origin issue #67 — the farewell report answers `Standing falsehood: none` or names the statement and the places it was corrected in; the force closure carries the same line as one phrase)
```

## 7. Что осталось интегратору — чек-лист

- [x] **SF3** — охота судьи в ОБЕ копии (§ 1) + сводная строка `:14`; `diff` копий → пусто. ✅ сессия 66, 08:34 +03:00
- [x] **Пары** `check-framework` (§ 3) — девять строк; сборка зелёная. ✅ 08:35
- [x] **Запись 2.7** в `TEMPLATE_NOTES_BY_VERSION` (§ 2); записей 2.7 стало 13 (не 11: RS и FR добавились рядом). ✅ 08:35
- [x] **Три зеркала счётчика модулей 792 → 794** — сошлись сами при слиянии и пересборке (797 модулей, `counters-guard` 50/50 в сессии 65/66): `README.md` (обе половины, строки `:527` и `:1059`) и `STATUS.md:43`;
      `node tools/counters-guard.mjs` → зелёный. *(Число живое: после охоты судьи и записей пересобери и возьми число из
      вывода сборки, а не отсюда.)*
- [x] **Урок** EXP-0135 в `EXPERIENCE.md` (§ 5) — внесён как **EXP-0137** (номера 0135/0136 заняты RS и CR). ✅ 08:36
- [x] **`plans/100`** строка 14 и критерий 21 ✅ 08:38; `STATUS.md` п. 0 поправлен; `MASTER_PLAN` §5 — строкой сессии 66.
- [x] **Судья эпика** (`/fable-judge`) — без окон; ≈ 08:52 VERIFIED WITH CAVEATS (каверзы поправлены на месте); отчёт прогона дополнен (файл
      `testcases/reports/2026-09-18_standing-falsehood.md`, поле 7 — вердикт сегодня `partial` именно из-за незакрытых SF3
      и пар).
- [x] **Слияние ветки** `worktree-agent-a513d874b5bf458e2` — слита сессией 65 (`bb60dcb`); `plans/handoff_SF.md` → `plans/handoff_SF_DONE.md`
      (передача хранится с тегом DONE, а не удаляется: в ней черновик ответа #67).
- [ ] **Черновик ответа #67** (§ 4) — отправка только после релиза 2.7 и только словом владельца. (единственный открытый пункт)

## 8. Открытый долг, найденный по дороге (НЕ этим эпиком)

Функциональный прогон переисполнил опровержение `bugs/84` вхождения 2 и подтвердил, что долг жив: у половины (б)
`tools/questions-guard.mjs` (ось скоупится собственным свойством вопроса, а не `iv.waiting`) **нет фикстуры** — мутант
проходит `--selftest` зелёным. Баг уже заведён (`bugs/84`, статус 🔬, скоуп 2.3), новый не заводился. Фикстура, которой
не хватает: интервью БЕЗ строки статуса с неотвеченным вопросом и потерянными вариантами.

## Links

`plans/112` · `plans/100` критерий 21 и строка 14 · `researches/30` §2е · issue #67 · issue #63 (родня класса) ·
`plans/109` (SD — образец исполненного эпика) · `testcases/reports/2026-09-18_standing-falsehood.md` ·
`bugs/70_DONE_owner_queue_zero_can_be_false_green.md` · `bugs/84` вхождение 2
