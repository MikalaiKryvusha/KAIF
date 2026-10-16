# Interview #046 — выпуск 2.9: витрина, логотип и ваше «да» на публикацию

> Topic: витрина версии 2.9 готова — README обеих половин, ноты релиза на двух языках, логотип из вашего арта с подписью версии.
> Здесь три коротких вопроса: принимаете ли витрину, принимаете ли логотип и публиковать ли релиз сразу после ответа.
> Source of the idea: `plans/134` — шаги RL2 (витрина) и RL3 (выпуск по вашему «да», №13).
> Status: ⏳ AWAITING ANSWERS
> Created 2026-10-16 17:17 +03:00 (сессия 86, Claude Opus 5.5).

## Context / what I already found

- README обеих половин и ноты написаны по вашему портрету голоса и проверены по нему: машинной проверкой (0 замечаний) и чтением
  отдельного агента, который не видел, как текст писался; замечания выправлены. Линтер витрины чист.
- README уже правлен в рабочей папке, но не опубликован: страница репозитория на GitHub до выпуска показывает 2.8. README агент открывает
  отдельной страницей рядом с этой; что и почему в нём поменялось по разделам — таблица ниже, ноты целиком — ниже, в разделе «Витрина целиком».
- Логотип: `assets/KAIF_2.9_GitHub_LOGO.webp` — ваш арт после апскейла: медный медальон, глаз в треугольнике над колбой, над ними весы,
  лавровый венок, кольцо уробороса; внизу подпись «KAIF 2.9 — Distilled KAIF». Агент открывает его отдельным окном.
- Суд версии пройден (128 заявлений, блокеров 0), находки из списка на починку исправлены, полигон зелёный. Условие 1 переписано вашими
  словами (№147); его замер — ваше первое сообщение посреди моей работы: напишите мне что угодно, пока я работаю, и я отвечу сразу.

## QUESTIONS

### Q1. Витрина 2.9 — README и ноты релиза — принимаете?

**Адресат ответа:** `plans/134` шаг RL2 · `MASTER_PLAN.md` §7.

**Происхождение:** в 2.8 вы приняли витрину как есть (интервью №042, Q1 = A); о витрине 2.9 ответа нет.

<!-- archaeology: search "витрина 2.9 публиковать" → 387 hits · read: interviews/interview_042_kaif_2.8_showcase_logo_publish.md (Q1 = A о витрине 2.8), plans/134 шаги RL2–RL3 · prior: unrelated — ответ 2.8 о своей версии; о витрине 2.9 ответа нет -->

- **A) (рекомендация `[ИИ]`)** Да — принимаю как есть.
  - Ситуация. README и ноты написаны и проверены; на GitHub README ещё говорит «2.8».
  - Действие. Вы отвечаете A.
  - Результат. На выпуске вы видите страницу релиза 2.9 с текстом этих нот и README со строкой «Version 2.9 — Distilled KAIF».
  - Проверка. `gh release view v2.9 --json body -q .body` начинается картинкой логотипа и строкой «Release date»; `grep -c "Distilled KAIF" README.md` ≥ 4.
- **B)** Правки — впишите, что поменять.
  - Ситуация. Та же.
  - Действие. Вы отвечаете B и пишете правку в комментарии.
  - Результат. Агент правит текст по портрету, проверяет его заново и показывает вам снова; выпуск ждёт.
  - Проверка. Строка с вашей правкой в `README.md` или `reports/RELEASE_NOTES_2.9.md` и новая страница вычитки.

**Answer:** A) <!-- owner-review: by Mikalai Kryvusha (KOT KRINIK) · 16 октября 2026, 17:23 (+03:00) -->

### Q2. Логотип 2.9 — принимаете?

<!-- questions-guard:no-scenario вопрос-вкус: логотип судит только владелец (класс «вкус»), сценарий вид не проверяет -->

**Адресат ответа:** `plans/134` шаг RL2 · `MASTER_PLAN.md` §7.

**Происхождение:** арт ваш (`assets/2.9_raw.png` и его апскейл); подпись добавил агент инструментом подписи, как в 2.8.

<!-- archaeology: search "логотип 2.9" → 92 hits · read: interviews/interview_042_kaif_2.8_showcase_logo_publish.md (Q2 = A о логотипе 2.8), plans/134 строка 43 · prior: unrelated — вердикта о собранном логотипе 2.9 нет -->

- **A)** Да — ставить в README и ноты.
- **B)** Правки — впишите: подпись, размер, кадр.

**Answer:** A) <!-- owner-review: by Mikalai Kryvusha (KOT KRINIK) · 16 октября 2026, 17:23 (+03:00) -->

### Q3. Публиковать релиз 2.9 сразу после ваших «да»?

**Адресат ответа:** `plans/134` шаг RL3 · `MASTER_PLAN.md` §7 (№13 — публикация только по вашему «да»).

**Происхождение:** в 2.8 вы ответили «публиковать сразу» (интервью №042, Q3 = A); «да» каждой версии даётся заново (№13).

<!-- archaeology: search "витрина 2.9 публиковать" → 387 hits · read: interviews/interview_042_kaif_2.8_showcase_logo_publish.md (Q3 = A), MASTER_PLAN §7 №13 · prior: unrelated — «да» на 2.9 не давалось -->

- **A) (рекомендация `[ИИ]`)** Да — публиковать сразу.
  - Ситуация. Витрина и логотип приняты.
  - Действие. Агент выпускает версию без повторного вопроса: версия 2.9 в сборке, тег, релиз с файлами, страница релиза глазами.
  - Результат. Вы видите на GitHub релиз «KAIF 2.9 — Distilled KAIF» с отметкой latest и README с новой версией; после этого агент отвечает
    в тикеты поля и закрывает те, что закрыла версия.
  - Проверка. `gh release view v2.9 --json name -q .name` печатает `KAIF 2.9 — Distilled KAIF`.
- **B)** Нет — спросить ещё раз перед публикацией.
  - Ситуация. Та же.
  - Действие. Вы отвечаете B.
  - Результат. Агент готовит всё к выпуску и перед публикацией задаёт один вопрос; релиз ждёт вашего слова.
  - Проверка. `gh release list` не показывает v2.9, пока вы не ответили.

**Answer:** A) <!-- owner-review: by Mikalai Kryvusha (KOT KRINIK) · 16 октября 2026, 17:23 (+03:00) -->

## Витрина целиком

**README: 1. Таблица решений**

Колонка «Переписать» отвечает «да», когда раздел получает новый текст, и «точечно», когда правится фраза или число.

| Раздел | Держится ли | Что лишнее или неверное | Переписать |
|---|---|---|---|
| Шапка | да | бейдж «2.8», логотип и подпись «2.8 — Noble KAIF»; «Здесь харнесс» (стр. 568) | точечно: 2.9, Distilled KAIF, новый медальон; «В KAIF харнесс» |
| 1.1 Основные положения | да | п. 3 строит мысль на «а не заперт» (З2); п. 5 — запятая перед тире | точечно |
| 1.2 Термины | да | — | нет |
| 1.3 Границы применения | да | — | нет |
| 2.1 Основные положения | нет | «10 КБ» и «339 КБ» устарели: сейчас `KAIF.md` — 15 353 байта, полное ядро — 716 551 байт; множитель «в 66 раз» не подтверждается ни одним замером | да: п. 1 и п. 3 по замеру, множитель снят |
| 2.2 Порядок установки | да | «вместо того чтобы спрашивать» (ШВ2); нет того, что установка теперь делает сама | точечно + новый п. 5 о том, что установка подключает и называет |
| 2.3 Офлайн-установка | да | — | нет |
| 3.1 Основные положения | да | «поэтому», «здесь» (ГЛ20) | точечно |
| 3.2 Ключевые документы | да | «какой KAIF здесь развёрнут» | точечно: «в проекте» |
| 3.3 Директории знаний | да | — | нет |
| 3.4 Механика | нет | п. 4 «Подключение — явный опт-ин владельца: машинерия не редактирует чужие `settings.json`» — в 2.9 неправда | да: п. 4 — подключает задание установки и обновления, отказ владельца — ключ в маркере |
| 4.1 и таблица 3 | да | `/resume` не говорит, что объём задаёт сообщение владельца; «ЗДЕСЬ» у `/pause`; две запятые перед тире | точечно |
| 5.1 Цикл сессии | да | — | нет |
| 5.2 Роли и интервью | да | нет короткого вопроса и страницы, которая делает то, чего ждёт рука владельца | точечно + новый п. 4 |
| 5.3 Автономные циклы | да | — | нет |
| 5.4 Дисциплина исполнения | да | нет правила «одна команда — одно действие» для git | точечно + одна фраза |
| 5.5 Гвардрейлы и провенанс | да | — | нет |
| 5.6 Свежий контекст | да | «Поэтому», «снова»; нет того, что напоминания работают из подпапки | точечно |
| 6.1 Основные положения | да | нет того, что обновление называет места и чинит указатели, а длинный прыжок судится честно | да: новый п. 4 |
| 6.2 Ручки · 6.3 Старые развёртывания | да | — | нет |
| 7.1 Сферы | да | — | нет |
| 7.2 Агентские системы | да | запятая перед тире | точечно |
| 7.3 Языки | да | — | нет |
| 8.1 Вехи | да | нет строки v2.9; «то есть» в строке v2.3 — летопись, не правится | да: строка v2.9 |
| 8.2 Структура репозитория | нет | «5 скриптов» — скриптов хуков четыре; из десяти модулей инструментов названы три | точечно |
| 8.3 Фрактальность · 8.4 Ограничения · Лицензия | да | — | нет |

**README: 2. Что в 2.9 нового для пользователя**

Новое описано там, где пользователь его встретит:
1. Установка сама подключает напоминания агенту и называет, какие файлы KAIF прячет `.gitignore` проекта; папку без git она тоже называет (§2.2).
2. Напоминания работают, когда агент ушёл в подпапку проекта (§5.6).
3. Обновление называет места проекта, которые опираются на убранное, и подтягивает указатели других агентских систем; прыжок через несколько версий
   обходится без сотен ложных «не найдено», правки проекта помечаются (§6.1).
4. Страница вопросов владельцу: повторное нажатие снимает выбор, абзацы не рвутся, в своём ответе работает перенос строки, вопрос — короткий (§5.2).
5. На вопрос под словом `resume` агент отвечает и работу сверх ответа не начинает (таблица 3).
6. Для git одна команда делает одно действие (§5.4).
7. Хук `pretool-owner-word.mjs`, который останавливал агента на сообщении владельца посреди хода, удалён из поставки (§3.4).
8. Правила новой версии принимаются вместе с версией, без вопросов владельцу (§6.1).

**Ноты релиза `reports/RELEASE_NOTES_2.9.md`:**

*[логотип 2.9 — открыт отдельным окном]*

> **Release date: 2026-10-16** · Minsk.

**English**

**KAIF 2.9 — Distilled KAIF.** Between 26 September and 16 October thirty-eight tickets reached the KAIF repository on GitHub (the origin), #108 to #146 (number #132 is a pull request), filed by the agents and owners of live projects. Six of them are field reports of the update to 2.8, and two are reports of installing a pre-release of 2.9. The tickets name what hurts where the owner touches KAIF with his own hands. A radio button on his question page did not clear on a second press, and the page broke his long documents into separate lines. On every update the agents asked him about rules he had already accepted in so many words. A short remark of his made the agent stop instead of answering and working on. A private file of his was read by a linter and its line went into a shared commit. In long jumps across several versions the update left hundreds of false "not found" and links to retired skills. 2.9 removes these obstacles. Two tickets deferred from 2.8, #87 and #94: #94 is closed by this version, #87 goes to 2.10 together with the tickets that the KAIF author left for the next version. Every ticket gets its answer on its page on GitHub.

What KAIF is and how to use it — the [README](https://github.com/MikalaiKryvusha/KAIF#english). This page covers what is new in this version.

---

**✨ What's new in 2.9**

**1. What KAIF delivers is wired and accepted at once.** The new command `node .kaif/kaif-core.mjs wire-hooks` merges `.kaif/hooks/settings-fragment.json` into `.claude/settings.json`: the owner's entries and their order stay, a script already wired is left alone, a repeat run changes nothing, and the file keeps its indent, line ends and the arrays written on one line. The install and update tasks carry the item `wire-hooks`, and the agent runs it without asking the owner. The owner opts out with `"hooks": "off"` in `.kaif/kaif.json`; `check` names a delivered hook that is not wired. The rule changes of a release are accepted with the version and named in the field report; a question is legal only where a rule collides with a decision the owner recorded himself. A decision-attribution lint that arrives without a baseline records the project's inherited debt once, without a question. The size budget's hint no longer overwrites a filled `HOUSE_RULES.md` with the empty skeleton. The lines KAIF writes into `.gitignore` are anchored to the project root: on a case-insensitive git the bare line `KAIF.md` hid `.clinerules/kaif.md` and `.roo/rules/kaif.md`.

**2. No hook stops the agent on the owner's word any more.** The hook `pretool-owner-word.mjs` of 2.8 refused the next tool call after a message the owner sent while the agent worked, and five short remarks of the owner became five stops. The hook is retired: the update removes its untouched copy, and `wire-hooks` removes the entries that run it. The rule for the owner's word mid-turn now says: unless the owner explicitly asks the agent to stop, the agent answers at once, as text and before its next tool call, then goes on with the work it was doing without stopping for the answer.

**3. The reminders work from a subfolder, and the first prompt after install is not interrupted.** After one `cd` into a subfolder the hourly timer answered the owner's next prompt with "no refresh witness found" while the marker in the project root was 12 minutes old, and the `STATUS.md` guard fell silent. The hooks now find the project root — the nearest folder above the agent's working folder that holds `.kaif/kaif.json` — and read the marker, `STATUS.md` and git there. The `study` item of the install task has the agent re-read the nine core documents and stamp the refresh marker, so the timer stays silent at the owner's first message.

**4. The install summary names what your `.gitignore` hides.** In one live project the project's own `tools/` line hid the 13 delivered modules under `.kaif/tools/`, and only a later `check` said so. The summary at the end of `install` names each deployed file that git would leave out of the first commit, with the rule that hides it and the cure. In a folder that is not a git repository yet the summary tells the agent to run `git init` and to commit the owner's own files first, exactly as they are.

**5. The owner's question page does what his hand expects, and a question is short.** A second press or tap on a chosen option clears it. A hard-wrapped paragraph is shown as one paragraph, and the owner's answer is the whole paragraph under the label. The own-answer field takes several lines, and each line of the answer is written into the document as its own line. A question that sends the owner elsewhere for its content ("see above", "§3") is refused by `--check` before any page opens. A document whose status opens with a closing word leaves the owner's queue. The options are read in five list forms and the table form, and a letter the page cannot read is named instead of vanishing. A question to the owner carries one fork and only what he chooses by: the options, their price and what he will see; the recon stands above the questions.

**6. The update leaves no tails.** The update task lists each place of the project's own texts that still builds on something retired — a link to a withdrawn skill, an order around a withdrawn hook — as `file:line «phrase»`, and `checkpoint recheck` lists the places left after the agent's edits. An untouched context pointer of another agent system (`AGENTS.md`, `CLAUDE.md`, the Cline and Zoo Code rules) is replaced with this release's text; a pointer the project edited is named with the one line it lacks. On a field jump 2.1 → 2.8 `update-verify` printed 236 false "promised upstream line not found"; on the same jump with this core it prints 45, and each of the 45 is a real difference — the project's own edits are shown as "stands on disk with local edits (line N)". The `check` entry of `.kaif/KAIF_REFERENCE.md` §10.7 names every line `check` prints, and the build of the origin refuses a line the reference does not know.

**7. The authorship linter keeps the owner's private text out of the commit.** `kaif-attribution-lint` reads only the root `*.md` files git sees, so a file git ignores, such as a private voice portrait, is never read. Its baseline `.kaif/attribution-lint.baseline.json` holds a fingerprint and a count per line, never the text; a 2.8 baseline reads as the same debt, and the next `--write-baseline` drops its text.

**8. The owner's message under the word `resume` sets the scope.** `/resume` reads what the owner wrote under the word: a question gets the answer, and the turn ends with the chosen next step offered, never taken; a task is done; only a bare `resume` starts the direction the skill chose. The order of the hook `prompt-resume-word.mjs` says the same.

**9. One tool call — one action for git.** An auto-mode permission classifier refused `git add`, `git commit` and `git push` joined into one command and passed each step alone. The Git workflow section of `AGENT_GUIDE.md` carries the rule: each git step is its own call, and a refused single action is told to the owner, never retried or bypassed. `/end-chat-soft`, `/end-chat-force` and `/release` name the steps one by one, and the default commit flow of a fresh install is the three steps.

**10. Smaller changes.** `kaif-voice-lint load --out <file>` writes the voice portrait into a file when the agent's client cuts long output; inside the project the file must be one git ignores. A root `AUTHOR_STYLOMETRY.md` that only points at a private voice core named in `.kaif/kaif.json` → `voicePortrait` is left alone by the update. `check` names a step of `/end-chat-soft`, `/end-chat-force` or `/release` that is still the template's instruction slot, so write your project's command there. The delivered tools drop a leading byte-order mark (BOM) of every JSON they read: on 2.8 `node .kaif/kaif-core.mjs version` crashed on a `.kaif/kaif.json` with one. The question page opens its window on Windows; on Linux no window is raised, and the tool prints the page's address.

**11. A court checked the version before the release.** Six judges — agents with clean contexts, one cluster of epics each — re-ran the checks behind 128 claims the version makes about itself: 105 were confirmed as written, 18 were weakened to what the evidence supports, 5 were refuted. No finding blocked the release. The findings the judges listed for fixing were fixed before the release, and six small findings moved to the next version. One refuted claim said that the agent answers a message the owner sends while it works before its second action after that message. Without the hook retired in this version, the agent did so for 7 of 16 messages; after this finding the owner set the rule of item 2.

---

**📦 Installation**

Drop [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) into your project root and tell your agent in your own words to deploy KAIF. The [README](https://github.com/MikalaiKryvusha/KAIF#2-installation) describes the full installation procedure, the deployment modes and the language options.

Updating a deployed project: say *"update KAIF"* — the agent checks the origin, shows the changes and updates the project, keeping your documents and edits. The update task wires the refresh hooks and removes the retired one by itself. If your own texts (`STATUS.md`, house rules, experience) tell the agent to end an answer with `⏩`, drop that rule. If your deployment carries a local fix of the hooks' project root, take the delivered hooks as they are. If your project edited or translated `/resume`, carry the three cases of its Step 2 into your copy by meaning. Deliver the field report of this update with `node .kaif/kaif-core.mjs report <file>`.

---

**Русский**

*[логотип 2.9 — открыт отдельным окном]*

**KAIF 2.9 — Distilled KAIF.** С 26 сентября по 16 октября в репозиторий KAIF на GitHub (исток) пришли 38 тикетов, с #108 по #146 (номер #132 занят пулл-реквестом). Их завели агенты и владельцы живых проектов, в которые развёрнут KAIF. Шесть тикетов — полевые отчёты об обновлении до 2.8, два — отчёты об установке предрелиза 2.9. Тикеты называют то, что мешает владельцу проекта там, где он трогает KAIF своими руками. Радиокнопка на странице вопросов не снималась повторным нажатием, и страница рассыпала длинные документы владельца на отдельные строки. На каждом обновлении агенты спрашивали владельца о правилах новой версии, хотя он уже сказал, что поставку KAIF принимает без вопросов. Короткая реплика владельца останавливала агента, и агент не отвечал и не работал дальше. Линтер авторства решений прочитал личный файл владельца, и строка из этого файла попала в коммит проекта. На длинных прыжках через несколько версий обновление оставляло сотни ложных строк «не найдено» и ссылки на снятые навыки. Версия 2.9 убирает эти помехи. Из 2.8 перенесены два тикета, #87 и #94: #94 закрывает эта версия, #87 уходит в 2.10 вместе с тикетами, которые автор KAIF оставил на следующую версию. Каждый тикет получает ответ на своей странице в GitHub.

Что такое KAIF и как им пользоваться — [README](https://github.com/MikalaiKryvusha/KAIF#russian). Эта страница — что нового в версии 2.9.

---

**✨ Что нового в 2.9**

**1. То, что поставил KAIF, подключено и принято сразу.** Новая команда `node .kaif/kaif-core.mjs wire-hooks` подключает хуки KAIF к Claude Code: она вливает `.kaif/hooks/settings-fragment.json` в `.claude/settings.json`. Записи владельца и их порядок остаются, уже подключённый скрипт не трогается, повторный запуск ничего не меняет, а файл сохраняет отступы, концы строк и массивы, записанные в одну строку. В заданиях установки и обновления стоит пункт `wire-hooks`, и агент исполняет его без вопроса владельцу. Владелец отказывается от хуков ключом `"hooks": "off"` в `.kaif/kaif.json`; `node .kaif/kaif-core.mjs check` называет поставленный хук, который не подключён. Правила новой версии принимаются вместе с версией и перечисляются в полевом отчёте; вопрос владельцу законен только там, где правило сталкивается с решением, которое он записал сам. Линтер авторства решений `kaif-attribution-lint`, который приехал без базовой линии, один раз записывает нарушения, которые уже были в проекте, без вопроса владельцу. Подсказка `check` о бюджете размера документов больше не затирает заполненный `HOUSE_RULES.md` пустым скелетом. Строки, которые KAIF пишет в `.gitignore`, привязаны к корню проекта: если git не различает регистр, строка `KAIF.md` без начального `/` прятала `.clinerules/kaif.md` и `.roo/rules/kaif.md`.

**2. Ни один хук больше не останавливает агента на слове владельца.** Хук `pretool-owner-word.mjs` из 2.8 блокировал следующий вызов инструмента после сообщения, которое владелец прислал посреди работы агента; в одном живом проекте пять коротких реплик владельца стали пятью остановками. Хук удалён из поставки: обновление удаляет его нетронутую копию, а `wire-hooks` убирает записи, которые его запускают. Правило о слове владельца посреди хода теперь говорит: если владелец явно не просит агента остановиться, агент отвечает незамедлительно, текстом и до следующего вызова инструмента, затем продолжает работу, которую делал, и не останавливается ради ответа.

**3. Напоминания работают из подпапки, и первое сообщение после установки не прерывается.** В одном живом проекте после одного `cd` в подпапку часовой хук-напоминание ответил на следующее сообщение владельца «свидетель освежения не найден», хотя маркеру освежения в корне проекта было 12 минут, а хук-страж `STATUS.md` замолчал. Теперь хуки находят корень проекта и читают маркер, `STATUS.md` и состояние git в корне. Корень — ближайшая папка над рабочей папкой агента, в которой лежит `.kaif/kaif.json`. Пункт `study` задания установки велит агенту перечитать девять документов ядра канона и поставить маркер освежения; тогда хук-напоминание молчит на первом сообщении владельца.

**4. Сводка установки называет, что прячет `.gitignore` проекта.** В одном живом проекте собственная строка проекта `tools/` спрятала 13 поставленных модулей в `.kaif/tools/`, и сказал об этом только поздний `check`. Сводка в конце установки называет каждый развёрнутый файл, который git оставил бы за бортом первого коммита, вместе с правилом, которое его прячет, и с лекарством. В папке, которая ещё не git-репозиторий, сводка велит агенту выполнить `git init` и закоммитить собственные файлы владельца как есть до коммита файлов KAIF.

**5. Страница вопросов ведёт себя так, как ждёт владелец, и вопрос владельцу короткий.** Повторное нажатие или касание выбранного варианта отменяет выбор. Абзац, разбитый переносами строк, показывается одним абзацем, а ответом владельца считается весь абзац под меткой ответа. Поле «свой ответ» принимает несколько строк, и каждая строка ответа ложится в документ отдельной строкой. Вопрос, который отправляет владельца за содержанием в другое место словами отсылки («см. выше», «§3»), проверка `review.mjs <документ> --check` отклоняет до того, как откроется страница. Документ, статус которого открывается словом закрытия (CLOSED, WITHDRAWN, MOVED и их русские формы), уходит из списка документов, ждущих ответа владельца. Варианты читаются в пяти формах списка и в форме таблицы, а букву, которую страница не прочла, страница показывает владельцу. Навык `/interview` требует: вопрос владельцу несёт одну развилку и только то, по чему владелец выбирает (варианты, их цену и то, что он увидит), а итоги разведки стоят над вопросами.

**6. Обновление находит места, которые опираются на снятое.** Задание обновления перечисляет каждое место собственных текстов проекта, которое ещё опирается на снятое (ссылку на снятый навык, правило, которое ссылается на снятый хук), в виде `файл:строка «фраза»`, а `node .kaif/kaif-core.mjs checkpoint recheck` перечисляет места, оставшиеся после правок агента. Нетронутый указатель контекста другой агентской системы (`AGENTS.md`, `CLAUDE.md`, правила Cline и Zoo Code) заменяется текстом этого выпуска; указатель, который проект правил, задание показывает вместе с одной строкой, которой ему не хватает. На полевом прыжке 2.1 → 2.8 ядро 2.8 печатало в `update-verify` 236 ложных строк «promised upstream line not found»; ядро 2.9 на этом прыжке печатает 45 строк, и каждая из 45 — настоящее расхождение: собственные правки проекта показаны строкой «stands on disk with local edits (line N)». Запись `check` в §10.7 `.kaif/KAIF_REFERENCE.md` описывает каждую строку, которую печатает `check`, и сборка истока падает на строке, которой нет в справочнике.

**7. Линтер авторства решений не уносит личный текст владельца в коммит.** `kaif-attribution-lint` читает только корневые `*.md`, которые видит git, и файл, который git игнорирует (например, личный портрет голоса), не читается. Базовая линия линтера `.kaif/attribution-lint.baseline.json` хранит для каждой строки отпечаток (хеш) и число повторов, текста в ней нет; базовая линия 2.8 читается как прежний набор нарушений, и следующий `--write-baseline` убирает из неё текст.

**8. Сообщение владельца под словом `resume` задаёт объём работы.** `/resume` читает, что владелец написал под словом `resume`: на вопрос агент отвечает и заканчивает ход, а выбранный следующий шаг предлагает и не берёт; задачу агент делает; только одно слово `resume` без текста запускает направление, которое выбрал навык. Хук `prompt-resume-word.mjs` приказывает агенту так же.

**9. Один вызов инструмента — одно действие для git.** Классификатор разрешений авторежима Claude Code блокировал `git add`, `git commit` и `git push`, склеенные в одну команду, и пропускал каждый шаг по отдельности. В разделе «Git-процесс» `AGENT_GUIDE.md` записано правило: каждый шаг git — отдельный вызов, а об отказе на одиночное действие агент говорит владельцу, не повторяет это действие и не обходит отказ. `/end-chat-soft`, `/end-chat-force` и `/release` ведут шаги git по одному на вызов, и коммит свежей установки по умолчанию идёт этими тремя шагами.

**10. Мелкие изменения.** `kaif-voice-lint load --out <файл>` пишет портрет голоса в файл, когда клиент агента обрезает длинный вывод; внутри проекта этот файл должен быть из тех, что игнорирует git. Корневой `AUTHOR_STYLOMETRY.md`, который только указывает на приватное ядро голоса, названное в `.kaif/kaif.json` → `voicePortrait`, обновление не трогает. `check` называет шаг `/end-chat-soft`, `/end-chat-force` или `/release`, в котором ещё стоит заготовка шаблона; впишите туда команду своего проекта. Инструменты поставки отбрасывают метку порядка байтов (BOM) в начале каждого JSON, который читают: на 2.8 `node .kaif/kaif-core.mjs version` падал на `.kaif/kaif.json` с такой меткой. Страница вопросов открывает окно на Windows; на Linux окно не поднимается, и инструмент печатает адрес страницы.

**11. Перед выпуском версию проверил суд.** Шесть судей-агентов с чистыми контекстами, по кластеру эпиков на каждого, заново прогнали проверки 128 заявлений, которые версия делает о себе: 105 подтверждены как написаны, 18 ослаблены до того, что подтверждают улики, 5 опровергнуты. Блокеров выпуска среди находок не было. Находки, которые судьи внесли в список на починку, исправлены до выпуска, шесть мелких находок перенесены в следующую версию. Одно опровергнутое заявление говорило, что агент отвечает на сообщение владельца посреди работы до своего второго действия после этого сообщения. Без хука, снятого в этой версии, так вышло на 7 сообщениях владельца из 16; после этой находки владелец задал правило из пункта 2.

---

**📦 Установка**

Положите [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) в корень проекта и скажите агенту своими словами развернуть KAIF. Полный порядок установки, режимы развёртывания и языковые опции описаны в [README](https://github.com/MikalaiKryvusha/KAIF#2-установка).

Обновление развёрнутого проекта: скажите *«обнови KAIF»* — агент сверится с истоком, покажет изменения и обновит проект, сохранив ваши документы и правки. Задание обновления само подключает хуки освежения и снимает хук `pretool-owner-word.mjs`. Если ваши собственные тексты (`STATUS.md`, `HOUSE_RULES.md`, `EXPERIENCE.md`) велят агенту заканчивать ответ строкой `⏩`, уберите это правило: хук, который читал эту строку, в поставку не вошёл. Если в развёртывании стоит локальная починка корня проекта в хуках, замените её поставленными хуками: они сами находят корень проекта (пункт 3). Если проект правил или переводил `/resume`, перенесите в свою копию три случая шага 2 навыка `/resume` по смыслу. Отправьте полевой отчёт этого обновления командой `node .kaif/kaif-core.mjs report <файл>`.

## Links

`plans/134` · `reports/RELEASE_NOTES_2.9.md` · `reports/2026-10-16_readme_2.9_review.md` · `interviews/interview_042_kaif_2.8_showcase_logo_publish.md`
