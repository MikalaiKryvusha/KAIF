# Interview #042 — выпуск 2.8: витрина, логотип и ваше «да» на публикацию

> Topic: витрина версии 2.8 готова — ноты релиза на двух языках и новые строки README; логотип собран из вашего арта с подписью версии.
> Здесь три вопроса: принимаете ли витрину, принимаете ли логотип и публиковать ли релиз сразу после вашего короткого наблюдения.
> Source of the idea: `plans/125` — шаги RL3 (витрина) и RL4 (выпуск по вашему «да», №13).
> Status: ⏳ ЖДЁТ ОТВЕТА.
> Created 2026-09-26 11:03 +03:00 (сессия 75, Claude Opus 5.5).

## Context / what I already found

- Витрина написана по вашему портрету голоса и проверена по нему дважды: машинной проверкой (0 замечаний) и чтением отдельного агента, который
  не видел, как текст писался (119 замечаний — выправлены по существу). Линтер витрины чист. Полный текст нот — ниже, в разделе «Витрина целиком».
- README до выпуска не меняется: иначе страница репозитория на GitHub показала бы «2.8» и логотип, которого там ещё нет. Новые строки README
  (бейджи версии, логотип, строка версии с датой, строка таблицы вех) — ниже, в том же разделе; при выпуске агент ставит их одним коммитом.
- Логотип: `assets/KAIF_2.8_GitHub_LOGO.webp` (и `.png`) — ваш арт после апскейла, медный медальон: глаз в треугольнике, лавровый венок,
  кольцо уробороса; внизу подпись «KAIF 2.8 — Noble KAIF». Агент открывает его отдельным окном рядом с этой страницей.
- Всё остальное к выпуску готово: суд версии пройден, все 12 находок починены, повторный суд их подтвердил; ваш тикет #107 внесён целиком
  (№137); ответы в 36 тикетов поля написаны и ждут публикации после релиза. Остаётся ваше короткое наблюдение (№135): «стоп» и
  «переключись» посреди работы агента и взгляд на макет объяснения картинкой.

## QUESTIONS

### Q1. Витрина 2.8 — ноты релиза и новые строки README — принимаете?

**Адресат ответа:** `plans/125` шаг RL3 · `reports/RELEASE_NOTES_2.8.md` · `reports/release_2.8/README_2.8.patch`.

**Происхождение:** в 2.6 витрину вы приняли на странице выпуска (интервью №030), в 2.7 — сказали «выпускай релиз, показывать не нужно» (№123).

<!-- archaeology: search "показыва" → 64 hits · read: interviews/interview_030_kaif_2.6_publish.md (Q1 — «сначала хочу посмотреть README и ноты» вариантом B), MASTER_PLAN §7 №123 (2.7 — «выпускай релиз, показывать не нужно») · prior: unrelated — оба ответа о своих версиях; о витрине 2.8 ответа нет -->

- **A) (рекомендация `[ИИ]`)** Да — принимаю как есть.
  - Ситуация. Ноты и строки README написаны и проверены; README в репозитории ещё говорит «2.7».
  - Действие. Вы отвечаете A.
  - Результат. На выпуске вы видите страницу релиза 2.8 с текстом этих нот и README со строкой «Version 2.8 — Noble KAIF» и новой строкой вех.
  - Проверка. `gh release view v2.8 --json body -q .body` начинается картинкой логотипа и строкой «Release date»; `grep -c "Noble KAIF" README.md` ≥ 4.
- **B)** Правки — впишите, что поменять.
  - Ситуация. Та же.
  - Действие. Вы отвечаете B и пишете правку в комментарии.
  - Результат. Агент правит текст по портрету, проверяет его заново и показывает вам снова; выпуск ждёт.
  - Проверка. Строка с вашей правкой в `reports/RELEASE_NOTES_2.8.md` и новая страница вычитки.

### Q2. Логотип 2.8 — принимаете?

<!-- questions-guard:no-scenario вопрос-вкус: логотип судит только владелец (класс «вкус»), сценарий вид не проверяет -->

**Адресат ответа:** `plans/125` шаг RL3 · `assets/KAIF_2.8_GitHub_LOGO.webp`.

**Происхождение:** арт — ваш (вы прислали апскейл и сказали «вот апскейл вариант бери в работу, делай вебп»); подпись добавил агент.

<!-- archaeology: search "логот" → 82 hits · read: interviews/interview_003_readme_visual_face.md (логотип 1.x), MASTER_PLAN §7 (логотипы прежних версий) и чат сессии 75 («вот апскейл вариант бери в работу, делай вебп») · prior: unrelated — вердикта о собранном логотипе 2.8 с подписью нет -->

- **A)** Да — ставить в README и ноты.
- **B)** Правки — впишите: подпись, размер, кадр.

### Q3. Публиковать релиз 2.8 сразу после вашего наблюдения?

**Адресат ответа:** `plans/125` шаг RL4 · `MASTER_PLAN.md` §7 (№13 — публикация только по вашему «да»).

**Происхождение:** в 2.6 вы дали «да» отдельным вопросом (интервью №030), в 2.7 — словом в чате (№123).

<!-- archaeology: search "публикова" → 91 hits · read: interviews/interview_030_kaif_2.6_publish.md (Q2 = A «Да — публиковать сейчас»), MASTER_PLAN §7 №123 · prior: unrelated — «да» каждой версии даётся заново (№13) -->

- **A) (рекомендация `[ИИ]`)** Да — публиковать сразу, как вы пройдёте наблюдение и примете витрину.
  - Ситуация. Витрина и логотип приняты; вы один раз написали «стоп» и «переключись» посреди работы агента и посмотрели макет.
  - Действие. Агент выпускает версию без повторного вопроса: сборка с номером 2.8, тег, релиз с шестью файлами, страница релиза глазами.
  - Результат. Вы видите на GitHub релиз «KAIF 2.8 — Noble KAIF», отметку latest на нём и README с новой версией; после этого агент отвечает в
    тикеты поля и закрывает их.
  - Проверка. `gh release view v2.8 --json name -q .name` печатает `KAIF 2.8 — Noble KAIF`.
- **B)** Нет — спросить ещё раз перед публикацией.
  - Ситуация. Та же.
  - Действие. Вы отвечаете B.
  - Результат. Агент готовит всё к выпуску и перед публикацией задаёт один вопрос; релиз ждёт вашего слова.
  - Проверка. `gh release list` не показывает v2.8, пока вы не ответили.

## Витрина целиком

**Новые строки README (обе половины, ставятся при выпуске):**

- бейдж: `Version-2.8`
- логотип: `assets/KAIF_2.8_GitHub_LOGO.webp` — подпись: «KAIF 2.8 Noble KAIF — a copper medallion: the eye in a triangle inside a laurel wreath, ringed by the ouroboros»
- строка версии: Version 2.8 — Noble KAIF · 2026-09-26
- строка вех:

| v2.8 | Noble KAIF | 2026-09-26 | KAIF becomes lighter and hears the owner: the agent answers the owner's word while it works and keeps working, the owner's answered decisions come before the plan, the owner's question page saves answers one at a time, the update loses nothing silently, the scanners see the project as git sees it, the canon keeps every rule and hands the stories behind its rules to the reference `KAIF_REFERENCE.md`, and a tester's bug report gets a required shape, with "not reproduced" written only after a hunt of at least three variants. |
- бейдж: `Версия-2.8`
- логотип: `assets/KAIF_2.8_GitHub_LOGO.webp` — подпись: «KAIF 2.8 Noble KAIF — медный медальон: глаз в треугольнике внутри лаврового венка, в кольце уробороса»
- строка версии: Версия 2.8 — Noble KAIF · 26.09.2026
- строка вех:

| v2.8 | Noble KAIF | 26.09.2026 | KAIF становится легче и слышит владельца: агент отвечает на слово владельца, пока работает, и работает дальше; отвеченные решения владельца идут раньше плана; страница вопросов владельца записывает ответы по одному; обновление ничего не теряет молча; сканеры видят проект так, как его видит git; канон держит каждое правило, истории правил переехали в пояснительную записку `KAIF_REFERENCE.md`; баг-репорт тестировщика получил обязательную форму, и «не воспроизвелось» пишется только после охоты за шагами. |

**Ноты релиза `reports/RELEASE_NOTES_2.8.md`:**

*[логотип 2.8 — открыт отдельным окном]*

> **Release date: 2026-09-26** · Minsk.


**English**

**KAIF 2.8 — Noble KAIF.** Between 18 and 25 September thirty-five tickets reached the KAIF repository (the origin), #72 to #106, filed by the agents and owners of live projects. Four of them are field reports: an agent's account of how an update of KAIF went in its project, here the update to 2.7. The tickets describe two things. First, the agent did not hear the owner exactly when he spoke or was needed while it worked: a decision the owner had already answered waited eleven days while planned work went on, a request for him to do something by hand stayed in a chat he was not reading, and with three windows of one project open he could not tell which one was calling him. Second, KAIF had grown heavy and in places kept quiet about its own failures: `AGENT_GUIDE.md` stood at its size budget of 1,200 lines, the budget gate stopped the closing ritual in the projects that updated to 2.7, the update silently dropped sections and modules that should have arrived, and the scan for stale version claims printed "no lines found" over a file tree it could not read. 2.8 makes KAIF lighter and teaches it to hear the owner. Two tickets, #87 and #94, were deferred to the next version. Ticket #107, a report of an install from the unreleased 2.8 that arrived on the release day, is answered by this version too. Every ticket gets its answer on its ticket page.

What KAIF is and how to use it — the [README](https://github.com/MikalaiKryvusha/KAIF#english). This page covers what is new in this version.

---

**✨ What's new in 2.8**

**1. The agent answers the owner's word while it works, and keeps working.** A message the owner types while the agent works reaches the agent in the middle of its work, and the agent system marks it as the user's message. The agent answers before its next tool call, according to what the message is. A question gets the answer. On "stop", the agent stops at once and says in one line where the work stands. On "switch to …", it first records at the top of `STATUS.md` where it left the task, and only then switches. The new optional hook `pretool-owner-word.mjs` (Claude Code, event `PreToolUse`) refuses a tool call after such a message while the transcript holds no text answer to it, and quotes the owner's words. The refusal comes once per message; if the agent was making several calls at that moment, they are refused together. On the origin the owner wrote eight messages while the agent worked; the hook refused a call after six of them, none of them twice, and the next call went through within half a minute.

**2. The owner's debt comes first.** `review.mjs --queue --list` names first the owner's decisions that the agent has not yet applied, with the age of each answer. The reply of `/what-next` carries the line "Owner debt:", and the first step of its plan closes one such debt; `/resume` puts the debt above the plan.

**3. The owner's question page saves answers one at a time.** The owner's question page (the interactive contour) is a local HTML page where the owner answers the questions of a document. It stays open while the document has an unanswered question: after each save it shows "Saved. Questions left: N", and the answered question folds into the archive. The agent is woken by a separate waiter, `review.mjs --wait <doc>`: it exits with code 0 on every recorded answer and with code 2 when the page closed without one or never came up within a minute. A page left open on an old revision of the document never writes into the rewritten document: the typed text stays on the page next to the button "Open the new revision". The whole page is shown at 1.7 times the browser's base size and the Save button at 1.5, so the owner reads the page without zooming.

**4. A call names the calling session, and before every question the agent looks for a prior answer.** When the work cannot go on without the owner's action or answer, the agent calls him: `review.mjs --call "<what is needed>"` plays a sound, prints a console line and speaks. When one project is open in several workspaces, each call names its session: "<owner>, this is <session>". Before any question to the owner, in the chat as well, the agent runs `review.mjs --search "<the question>"`. The search needs no shell and no locale, and it finds the words starting with a capital Cyrillic letter that Git Bash's `grep -i` missed.

**5. The agent explains a comparison, a timeline or branching outcomes to the owner with a picture.** The new template `.kaif/_explain-page-template.html` shows two frames side by side, a timeline with the user's action marked and a tree of outcomes where colour shows the verdict. The caption under the picture is the four-line scenario: Situation · Action · Result · Check. The page works offline: no request leaves the machine.

**6. The update loses nothing silently.** A section you renamed in advance to the heading the release declares receives the changes from the origin. A module the previous update proposed to merge, and nobody merged, is proposed again. `node .kaif/kaif-core.mjs update-verify` checks on disk every section that appeared in the release and names the one that never arrived. `node .kaif/kaif-core.mjs diff --source <source> --render <file>` prints a file the way the install from that source writes it, in your language and with your filled-in values; it is the reference for a manual merge. When you run the update 2.7 → 2.8 with the `update` command, your deployed 2.7 core runs it, so of all this only `update-verify` applies now and the rest works from your next update. Through the loader (`KAIF-LOADER.mjs`, which step 2 of `/kaif-update` recommends) the 2.8 core runs the update, and all of it applies. An install from a build between two releases, such as a clone of the origin's main, records in `.kaif/kaif.json` which build it came from and which version it pre-releases, and the update to that version says so in its task.

**7. The scanners see the project as git sees it.** The core and the six tool modules that walk the file tree read the files that `git ls-files` lists, and a nested repository does not count as your project: in one field project twenty nested worktree copies had used up the whole limit of the scan and hidden the real README. A broken link is skipped and named in the output. If the walk could not read a directory, the scan says that it did not see the whole tree. A version claim is judged as a pair of the framework's name and a version number, as in "KAIF 2.7", and a dated version line of the deployment record (`KAIF_FRAMEWORK.md`) is judged in all ten languages of the delivery. The new command `node .kaif/kaif-core.mjs stale-claims` repeats the scan and changes no file.

**8. The field report is delivered right after it is written, and a withdrawn feature leaves no text about it behind.** The field report of an update carries the line `**Delivered upstream:** NOT YET`, and the agent delivers it with `node .kaif/kaif-core.mjs report <file>` right after writing it; `check` names a 2.8 field report that was not sent. When the update is run by the deployed 2.7 core, the report item comes from that core, and the checkpoint of the fresh core prints the delivery command. When a version withdraws a feature, the withdrawal names the phrases to search for; the update task lists every place found and what to do with it, and the agent withdraws a question to the owner that the withdrawal made moot with `review.mjs --mark-withdrawn`.

**9. The canon is lighter, and the owner's standing instruction is written as a rule.** Every rule of the canon stands under its heading as a step, a command or a checkbox. The tickets, stories and quotes the rules grew from moved to the new section §17 "Why the canon says so" of `KAIF_REFERENCE.md`; the agent reads the entry there before changing or dropping a rule. `AGENT_GUIDE.md` went from 1,200 lines to 1,080 lines and `TESTING_FRAMEWORK.md` from 300 to 270, and the inventory of rules, commands and guarded lines found nothing lost. An owner's standing instruction enters the guide or `HOUSE_RULES.md` (the project's house-rules file) as a strict rule with one line naming where the owner's own words live. The new template `.kaif/_house-rules-template.md` starts that file; the stands, tools, environment dossier and recipes move there from the guide. Before a task in a part of the project where work was already done, the agent cites its own earlier work or writes "no own work found".

**10. The price of entering a chat is printed, and the budget gate has a legitimate way out.** `node .kaif/kaif-core.mjs check` prints how much `/resume` reads, in thousands of tokens and as a share of a 1M-token model window, and the farewell of `/end-chat-soft` passes that line to the owner. `check --gate-budgets` works as a ratchet over `.kaif/budget-baseline.json`: the first run of a version records the debt above budget and passes, and after that a document above budget passes while its own lines shrink. A verbatim document the owner declared his archive is checked by its hash. A canon translated wholesale gets a budget with headroom. The experience journal used to print 88 warnings on every closing; now its old entries without a class fold into one line. The update task names in advance the gates at which the first closing will stop.

**11. The owner's voice portrait knows its genres and replaces the previous snapshot on update.** A row of the table in §8 of the portrait (`AUTHOR_STYLOMETRY.md`) whose hint starts with a genre label, for example `[document]`, checks only texts of that genre (`kaif-voice-lint check --genre <genre>`). `load` without flags prints the writing sections with their price in tokens, and `--all` prints the whole portrait. With this update the public snapshot of the owner's voice core version 2.2 replaces a portrait derived from it: your local part stays above the first line of the snapshot, the snapshot follows byte for byte, and the checkpoint refuses a merge.

**12. A tester's bug report has a required shape, and "not reproduced" is written only after a hunt.** The report has four sections — description, steps to reproduce, expected result and actual result — and the lines build, environment and evidence; the steps are the user's path in the product. When a defect does not reproduce, the tester varies the conditions over named axes: data and state, position, timing and races, entry point, a fresh or an accumulated account, stage or production, network. "Not reproduced" is written only after at least three variants were tried, each a table row with its outcome. `kaif-testrun-lint.mjs bug <report>` checks one report, and `bug --keywords` prints the headings and labels the linter accepts in each language.

**13. Smaller fixes.** The seven lint modules with exports stay silent when a project tool imports them. A queue file that is not shaped like the queue of `review.mjs` is read as "the project keeps its own queue", and nothing is written into it. A template fill whose value contains `<` and `>`, such as `-PackDir <pack>`, is now derived by the machinery. The rehearsal copy of an update is exported without line-ending conversion. The lines the closing rituals owe the owner are written in the owner's language. The agent takes every timestamp from the system clock in the call that writes it. The voice check names a file byte-equal to what the install wrote as an untouched template. The install task says that the skill copies of the other agent systems re-sync by themselves, and which edition of the owner's portrait a public repository takes.

**14. A court checked the version before the release.** Five judges — agents with clean contexts, one cluster of epics each — re-ran the checks behind 112 claims the version makes about itself: 90 were confirmed as written, 21 were weakened to what the evidence supports, 1 was refuted. No finding blocked the release. The refuted claim and the twelve findings on the list to fix were fixed before the release.

---

**📦 Installation**

Drop [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) into your project root and tell your agent in your own words to deploy KAIF. The [README](https://github.com/MikalaiKryvusha/KAIF#2-installation) describes the full installation procedure, the deployment modes and the language options.

Updating a deployed project: say *"update KAIF"* — the agent checks the origin, shows the changes and updates the project, keeping your documents and edits. The update task names what to do by hand. If you wired the refresh-hooks module, merge the new `PreToolUse` entry of `.kaif/hooks/settings-fragment.json` into `.claude/settings.json`. Move the filled-in project facts of `AGENT_GUIDE.md` — stands, tools, the environment dossier, recipes — into `HOUSE_RULES.md`, and leave a line in the guide that points there. Replace a voice portrait derived from the public snapshot when the task names the item `owner-voice-core`. Merge every section that `update-verify` names. Deliver the field report of this update with `node .kaif/kaif-core.mjs report <file>`.

---


**Русский**

*[логотип 2.8 — открыт отдельным окном]*

**KAIF 2.8 — Noble KAIF.** С 18 по 25 сентября в репозиторий KAIF (исток) пришли тридцать пять тикетов, с #72 по #106. Их завели агенты и владельцы живых проектов. Четыре из них — полевые отчёты: так агент проекта описывает, как прошло у него обновление KAIF; в этих четырёх отчётах — обновление до 2.7. Тикеты говорят о двух вещах. Первая: агент не слышал владельца именно тогда, когда тот говорил или был нужен, пока агент работал. Решение, на которое владелец уже ответил, одиннадцать дней ждало внесения, пока шла плановая работа; просьба сделать что-то руками осталась в чате, который владелец не читал; при трёх открытых окнах одного проекта владелец не мог понять, какое из них его зовёт. Вторая: KAIF стал тяжёлым и местами молчал о своих сбоях. `AGENT_GUIDE.md` упёрся в свой бюджет в 1200 строк; гейт бюджета останавливал ритуал закрытия у проектов, обновившихся до 2.7; обновление молча теряло разделы и модули, которые должны были доехать; скан устаревших заявлений о версии печатал «строк не найдено» по дереву файлов, которое не смог прочитать. 2.8 делает KAIF легче и учит его слышать владельца. Два тикета, #87 и #94, перенесены в следующую версию. Тикет #107, отчёт об установке невыпущенной 2.8, пришёл в день выпуска и тоже закрыт этой версией. Каждый тикет получает ответ на своей странице.

Что такое KAIF и как им пользоваться — [README](https://github.com/MikalaiKryvusha/KAIF#russian). Эта страница — что нового именно в этой версии.

---

**✨ Что нового в 2.8**

**1. Агент отвечает на слово владельца, пока работает, и работает дальше.** Сообщение, которое владелец печатает, пока агент работает, приходит к агенту посреди работы, и агентская система помечает его как сообщение пользователя. Агент отвечает до следующего вызова инструмента, по тому, что в сообщении. На вопрос он даёт ответ. На «стоп» сразу останавливается и одной строкой говорит, где стоит работа. На «переключись на …» сначала записывает наверху `STATUS.md`, где оставил задачу, и только потом переключается. Новый опциональный хук `pretool-owner-word.mjs` (Claude Code, событие `PreToolUse`) отказывает вызову инструмента после такого сообщения, пока в стенограмме нет текстового ответа на него, и цитирует слова владельца. Отказ приходит один раз на сообщение; если агент в этот момент делал несколько вызовов сразу, отказ получают все они вместе. В истоке владелец написал посреди работы агента восемь сообщений; после шести из них хук отказал вызову, ни после одного — дважды, и следующий вызов прошёл меньше чем через полминуты.

**2. Долг перед владельцем — первым.** `review.mjs --queue --list` первым разделом перечисляет решения владельца, которые агент ещё не внёс в работу, с возрастом каждого ответа. В ответе `/what-next` есть строка «Долг перед владельцем:», и первый шаг его плана закрывает один такой долг; `/resume` ставит долг выше плана.

**3. Страница вопросов записывает ответы по одному.** Страница вопросов владельца (интерактивный контур) — локальная HTML-страница, где владелец отвечает на вопросы документа. Она остаётся открытой, пока в документе есть неотвеченный вопрос: после каждой записи пишет «Записано. Осталось вопросов: N», а отвеченный вопрос сворачивается в архив. Агента будит отдельный сторож, `review.mjs --wait <док>`: он выходит с кодом 0 на каждой записи ответа и с кодом 2, если страница закрылась без записи или так и не открылась за минуту. Страница, открытая на старой редакции документа, в переписанный документ не пишет: набранный текст остаётся на странице рядом с кнопкой «Открыть новую редакцию». Вся страница выводится в 1,7 раза крупнее базового размера браузера, кнопка «Записать» — в 1,5 раза, и владелец читает страницу без увеличения.

**4. Зов называет сессию, и перед каждым вопросом агент ищет прошлый ответ.** Когда работа не может идти дальше без действия или ответа владельца, агент его зовёт: `review.mjs --call "<что нужно>"` играет звук, печатает строку в консоли и произносит фразу голосом. Если один проект открыт в нескольких рабочих окнах, каждый зов называет свою сессию: «<владелец>, это <сессия>». Перед любым вопросом владельцу, в том числе в чате, агент запускает `review.mjs --search "<вопрос>"`. Поиску не нужны ни шелл, ни локаль, и он находит слова с заглавной кириллической буквы, которые пропускал `grep -i` в Git Bash.

**5. Сравнение, порядок событий и развилку исходов агент объясняет владельцу картинкой.** Новый шаблон `.kaif/_explain-page-template.html` показывает два кадра рядом, ленту времени с отмеченным действием пользователя и дерево исходов, где цвет показывает вердикт. Подпись под картинкой — сценарий из четырёх строк: Ситуация · Действие · Результат · Проверка. Страница работает без сети: ни один запрос не уходит с машины.

**6. Обновление ничего не теряет молча.** Раздел, который вы заранее переименовали в заголовок, объявленный релизом, получает изменения из истока. Модуль, который прошлое обновление предложило влить и никто не влил, предлагается вновь. `node .kaif/kaif-core.mjs update-verify` проверяет на диске каждый раздел, который появился в релизе, и называет тот, который не доехал. `node .kaif/kaif-core.mjs diff --source <источник> --render <файл>` печатает файл так, как его пишет установка из этого источника, на вашем языке и с вашими заполнениями; по нему ведётся ручное слияние. Обновление 2.7 → 2.8 командой `update` исполняет ваше развёрнутое ядро 2.7, и из всего этого сейчас работает только `update-verify`, остальное — с вашего следующего обновления. Через загрузчик (`KAIF-LOADER.mjs`, его советует шаг 2 навыка `/kaif-update`) обновление исполняет ядро 2.8, и работает всё. Установка из сборки между двумя релизами, например из клона main истока, записывает в `.kaif/kaif.json`, из какой сборки ставили и предрелиз какой версии это был; обновление до этой версии называет это в задании.

**7. Сканеры видят проект так, как его видит git.** Ядро и шесть модулей-инструментов, которые обходят дерево файлов, читают файлы из списка `git ls-files`, и вложенный репозиторий вашим проектом не считается: в одном полевом проекте двадцать вложенных копий worktree съедали весь лимит скана и прятали настоящий README. Битую ссылку обход пропускает и называет в выводе. Если обход не смог прочитать каталог, скан говорит, что видел не всё дерево. Заявление о версии проверяется парой «имя фреймворка — номер версии», как в «KAIF 2.7», а датированная строка о версии в записи о развёртывании (`KAIF_FRAMEWORK.md`) — на всех десяти языках поставки. Новая команда `node .kaif/kaif-core.mjs stale-claims` повторяет скан и ничего не меняет в файлах.

**8. Полевой отчёт доставляется сразу, как написан, и снятая возможность не оставляет после себя текстов.** Полевой отчёт обновления несёт строку `**Delivered upstream:** NOT YET`, и агент доставляет его командой `node .kaif/kaif-core.mjs report <файл>` сразу, как написал; `check` называет отчёт 2.8, который не отправлен. Когда обновление исполняет развёрнутое ядро 2.7, пункт отчёта пишет это ядро, а команду доставки печатает контрольная точка свежего ядра. Когда версия снимает возможность, снятие называет фразы для поиска; задание обновления перечисляет каждое найденное место и что с ним сделать, а вопрос владельцу, который снятие сделало беспредметным, агент отзывает командой `review.mjs --mark-withdrawn`.

**9. Канон стал легче, и постоянное поручение владельца записывается правилом.** Каждое правило канона стоит под своим заголовком шагом, командой или чекбоксом. Тикеты, истории и цитаты, из которых выросли правила, переехали в новый раздел §17 «Почему канон так говорит» документа `KAIF_REFERENCE.md`; агент читает запись там, прежде чем менять или снимать правило. `AGENT_GUIDE.md` сократился с 1200 до 1080 строк, `TESTING_FRAMEWORK.md` — с 300 до 270, и сверка правил, команд и охраняемых строк не нашла ни одной потери. Постоянное поручение владельца входит в руководство или в `HOUSE_RULES.md` (файл домашних правил проекта) строгим правилом с одной строкой о том, где лежат дословные слова владельца. Новый шаблон `.kaif/_house-rules-template.md` заводит этот файл; из руководства туда переезжают стенды, инструменты, досье окружения и рецепты. Перед задачей в той части проекта, где уже шла работа, агент цитирует свои наработки или пишет «наработок нет».

**10. Цена входа в чат напечатана, и у гейта бюджета есть законный выход.** `node .kaif/kaif-core.mjs check` печатает, сколько читает `/resume`: в тысячах токенов и долей окна модели в 1 млн токенов; в прощании `/end-chat-soft` агент передаёт эту строку владельцу. `check --gate-budgets` работает храповиком над `.kaif/budget-baseline.json`: первый прогон версии записывает долг сверх бюджета, и проверка проходит; дальше документ сверх бюджета проходит, пока его собственные строки убывают. Дословный документ, который владелец объявил своим архивом, проверяется по хешу. Канон, переведённый целиком, получает бюджет с запасом. Журнал опыта печатал 88 предупреждений на каждом закрытии; теперь его старые записи без класса сворачиваются в одну строку. Задание обновления заранее называет гейты, на которых остановится первое закрытие.

**11. Портрет голоса владельца знает свои жанры и при обновлении заменяет прежний слепок.** Строка таблицы §8 портрета (`AUTHOR_STYLOMETRY.md`), подсказка которой начинается меткой жанра, например `[документ]`, проверяет только тексты этого жанра (`kaif-voice-lint check --genre <жанр>`). `load` без флагов печатает разделы для письма с их ценой в токенах, `--all` — портрет целиком. При этом обновлении публичный слепок ядра голоса владельца версии 2.2 заменяет портрет, выведенный из него: ваша локальная часть стоит выше первой строки слепка, слепок идёт за ней байт в байт, и контрольная точка отказывает слиянию.

**12. Баг-репорт тестировщика получил обязательную форму, и «не воспроизвелось» пишется только после охоты за шагами.** В отчёте четыре раздела — описание, шаги воспроизведения, ожидаемый результат и фактический результат — и строки сборки, окружения и улик; шаги — путь пользователя в продукте. Если дефект не воспроизвёлся, тестировщик перебирает условия по названным осям: данные и состояние, позиция, время и гонки, точка входа, свежая или накопленная учётная запись, стенд или прод, сеть. «Не воспроизвелось» пишется не раньше, чем испробованы три варианта, и каждый вариант — строка таблицы со своим исходом. `kaif-testrun-lint.mjs bug <отчёт>` проверяет один отчёт, а `bug --keywords` печатает заголовки и метки, которые линтер принимает на каждом языке.

**13. Мелкие починки.** Семь модулей-линтеров с экспортами молчат, когда их импортирует инструмент проекта. Файл очереди, который не похож на очередь `review.mjs`, читается как «у проекта своя очередь», и в него ничего не пишется. Заполнение шаблона, в значении которого есть знаки `<` и `>`, например `-PackDir <pack>`, машина теперь выводит сама. Репетиционная копия обновления выгружается без перевода концов строк. Обязательные строки ритуалов закрытия пишутся владельцу на его языке. Каждую метку времени агент берёт из системных часов в вызове, который делает запись. Проверка голоса называет файл, побайтно равный записанному установкой, нетронутым шаблоном. Задание установки говорит, что копии навыков для других агентских систем синхронизируются сами, и какую редакцию портрета владельца ставить в публичный репозиторий.

**14. Перед выпуском версию проверил суд.** Пять судей-агентов с чистыми контекстами, по кластеру эпиков на каждого, заново прогнали проверки 112 заявлений, которые версия делает о себе: 90 подтверждены как написаны, 21 ослаблено до того, что подтверждают улики, 1 опровергнуто. Блокеров выпуска среди находок не было. Опровергнутое заявление и двенадцать находок из списка к починке исправлены до выхода версии.

---

**📦 Установка**

Положите [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) в корень проекта и скажите агенту своими словами развернуть KAIF. Полный порядок установки, режимы развёртывания и языковые опции описаны в [README](https://github.com/MikalaiKryvusha/KAIF#2-установка).

Обновление развёрнутого проекта: скажите *«обнови KAIF»* — агент сверится с истоком, покажет изменения и обновит проект, сохранив ваши документы и правки. Задание обновления называет, что сделать руками. Если вы подключали модуль refresh-hooks, влейте новую запись `PreToolUse` из `.kaif/hooks/settings-fragment.json` в `.claude/settings.json`. Перенесите заполненные факты проекта из `AGENT_GUIDE.md` — стенды, инструменты, досье окружения, рецепты — в `HOUSE_RULES.md` и оставьте в руководстве строку, которая туда указывает. Замените портрет голоса, выведенный из публичного слепка, когда задание называет пункт `owner-voice-core`. Влейте каждый раздел, который назовёт `update-verify`. Доставьте полевой отчёт этого обновления командой `node .kaif/kaif-core.mjs report <файл>`.

## Links

`plans/125_epic117_RL_court_and_release_2.8.md` · `reports/RELEASE_NOTES_2.8.md` · `reports/release_2.8/README_2.8.patch` · `interviews/interview_030_kaif_2.6_publish.md`
