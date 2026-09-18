<!--
  ⚠️ ЭТОТ ФАЙЛ — ТЕЛО СТРАНИЦЫ РЕЛИЗА, И В НЁМ АБЗАЦ ПИШЕТСЯ ОДНОЙ СТРОКОЙ.
  GitHub Releases сохраняет переводы строк (одиночный \n рендерится разрывом), поэтому врап
  «для читаемости в репозитории» превращается на публичной странице в рваный текст. Проверка
  перед публикацией: в файле не должно быть двух непустых строк подряд вне блоков кода и таблиц.

-->

<p align="center">
  <img src="https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/assets/KAIF_2.7_GitHub_LOGO.webp" alt="KAIF 2.7 Audited KAIF" width="620">
</p>

> **Release date: 2026-09-18** · Minsk.

<a name="english"></a>
## English · [Русский](#русский)

**KAIF 2.7 — Audited KAIF.** Eighteen tickets reached the origin after 2.6 — #54 to #71, from the agents and owners of live projects; three of them, #69 to #71, came from one audit of a live project. Most of them describe a place where the agent's record could not be trusted: a decision of the agent written down as the owner's word, a question asked when the answer already existed, a run reported as "tested" with no report behind it, a falsehood corrected in the chat and left standing in the tracker, one lesson written up to seventeen times in different words. 2.7 makes each of those records checkable: who said it, what was searched, what was run, where it was corrected, which class it repeats.

What KAIF is and how to use it — the [README](https://github.com/MikalaiKryvusha/KAIF#english). This page is what is new in this version.

---

### ✨ What's new in 2.7

**1. The owner's word is a quote, the agent's word is signed.** A comment "the owner's decision: wait" stood in live code while the owner's real word in that fork was "do as you see fit" — and because of that comment a run waited 119 seconds while the owner's machine died. Every recorded decision now carries its author: `[OWNER] "<verbatim>" · date` or the interview address for the owner, `[AI]` for the agent. "Do as you see fit" is a mandate and is recorded as `[AI] by mandate — "<his words>"`; only `[OWNER]` decisions are not to be revisited. The new optional module `kaif-attribution-lint` counts as debt every reference to the owner's will with no verbatim quote and no interview address within two lines of it, against a baseline that only shrinks; provenance marks `[AI]…[/AI]` are now legal in any draft the agent brings to the owner. The form a fork takes in code is unchanged since 2.5: `@fork <name>` with four fields — OPTIONS · COST · RECON · DECIDED — and `kaif-guard-lint` reddens on a missing one.

**2. A question to the owner lives to the end and is asked after the archaeology.** `--check <doc>` checks the form of a question page without a page, a sound or a call, and names every heading that looks like a question and is not in the question form — numbered or lettered. A decision that went into the work is recorded as a fourth fact — implemented — and the queue stops showing a document whose every open question is implemented. The owner's page shows live questions first and folds everything answered into one archive below; "read, no remarks" is a legal outcome, and the Save button floats at the top right. A live question now opens only with an attestation of the search that was run through the owner's prior answers, `GOAL.md`, the plan and the interviews: without it the pre-flight refuses and prints the ready search command built from the question's own heading. The rule judges documents dated from 2026-09-18 on; older interviews never turn red. One audited deployment had brought its owner 13 questions that his prior answers, `GOAL.md` or a stand run had already settled, one of them 44 days after the answer.

**3. "Test" means a functional run, and a claim is never wider than its observation.** A test is a run on the real product by the user's path whose result is read; lint, unit tests, self-tests, mutants and guards are hygiene — mandatory, and never called testing. Every executed run leaves a report in `testcases/reports/<date>_<work>.md` with seven fields, and `Hygiene:` and `Functional run:` stand on two separate lines; the new optional module `kaif-testrun-lint` reddens a `pass` verdict whose functional-run line says `NONE` or is missing. Every statement about the state of the world names what observed it: "the server answers 200" is said as that, and "the page is open on your screen" is said only after a screenshot.

**4. The owner's text is written by his voice portrait.** The agent loads the owner's portrait into its working context before the first word (`kaif-voice-lint load`), writes by it, then checks the text by the same portrait twice: with the command `kaif-voice-lint check` and by a separate agent that did not see how the text was written. Then it fixes the text, and only then shows it. `check` refuses a text written before the portrait was loaded or more than an hour after the last load.

**5. The owner's page keeps his answer.** The contour window comes back on the port of the previous run, so the draft the owner was typing is restored; a page opened as a tab warns that its draft lives only in that tab. A live page is closed from outside only by `review.mjs <doc> --close`, which prints the port, the process and the window title and refuses while the owner typed less than three minutes ago or a draft is unsaved. The answer survives the death of the page's server: in the contour window it is kept in the window's own browser profile inside the project and picked up by the next queue run; in a tab the page shows the answer text to copy. Verified on Edge under Windows; Chrome, macOS and Linux are not verified. An unknown flag refuses before any page opens.

**6. A falsehood is corrected where it stands.** The minute a past statement of the agent turns out false, the agent stops, lists every place it was published, corrects or retracts it in each, reads the correction back and names it in the reply. The class has a name — a standing falsehood — and both closing rituals ask for it by name: `Standing falsehood: none` or the list of places. The sphere libraries gained the slot "outward channel → retraction command"; the programming library fills it for nine channels.

**7. A ticket about a defect of KAIF is delivered in the same move as it is filed.** Such a ticket goes to the origin with no `AUTH:` line; that is the one exception to the authorization gate, and it now stands in the gate's own line. The filing step of `/report-bug` ends with the `report` command. `check` names every ticket whose delivery line does not prove a delivery: `NOT YET`, a promise instead of an address, a translated field name, or no line at all.

**8. A free seat asks for work, and a generated team constitution keeps every obligation of its template.** A seat that finished its task and has no next one sends one message to the manager before its turn ends — done, left, candidates it can take. `check` compares `TEAM_CONSTITUTION.md` with the template that shipped with the skill and names every lost obligation; a translated constitution cannot be matched by anchors, so `check` counts its obligations instead.

**9. A lesson repeated twice goes red.** A journal entry carries `class: <slug>`, and the new optional module `kaif-experience-lint` reddens the second failure entry of one class with no mechanism named, citing both entries. The class has two written fates: a guard named in the entry, or the price of the whole class declared once beside the class list in the journal header. `/end-chat-soft` runs `kaif-experience-lint check`. Entries written before 2.7, with no `class:`, are outside the field rules, so the first 2.7 lesson does not stop the closing ritual on the journal's history.

**10. The size budget of the re-read core counts the lines the project wrote.** Modules that arrived byte-equal to the template are not counted; the warning names where the overflow goes — the chronicle for `STATUS.md`, the chronicle, `researches/` or a house-rules file for the other eight. With the flag `--gate-budgets` the command `check` exits with an error while a document is over budget, and `/end-chat-soft` runs it after the bonsai trim. A skill counts as mixed by the share of foreign-script words in its prose; code does not count.

**11. `resume` as the first word is an order, and the hand-off is called a handover.** If a message opens with `resume`, the agent runs `/resume` in full first and only then takes the task written under it; the optional refresh-hooks module gained a fourth script, `prompt-resume-word.mjs`, that injects the order. The word `baton` is gone from the delivery — the industry calls it a handover. On update a renamed heading replaces the old one and is never duplicated, from 2.7 on: the update from 2.6 is run by your deployed 2.6 core, which does not read the rename map, so a section you edited under a renamed heading arrives twice — see the update notes below.

**12. Removed and rewritten.** Delivery accounting is removed by the owner's word: the `delivery` command, `SYSTEMS_REGISTRY.md`, the `DELIVERY:` line of the closing rituals. The skill `/code-revision` was rewritten by the model that executes it and then run on a real zone of code; its Step 0 is now "baseline, scope, budget, and the ground before the hunt".

**13. The court sat before this page went out.** A registry of 138 claims this version makes about itself was re-executed by six judges with clean contexts, one cluster each: 116 confirmed as written, 17 weakened to what the evidence supports, 5 refuted. Five findings were release blockers, and all five were fixed before the release: two paths of the update from 2.6, a question form the check did not see, a journal rule that judged a field's whole history, and a page that promised to keep an answer it could not keep.

---

### 📦 Installation

Drop [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) into your project root and tell your agent in your own words — the [README](https://github.com/MikalaiKryvusha/KAIF#2-installation) carries the full installation procedure, the deployment modes and the language options.

Updating a deployed project: say *"update KAIF"* — the agent checks the origin, shows the delta and migrates respectfully, keeping your documents and edits. The update task names five things to do by hand: add the fourth hook entry to your settings if you wired the refresh-hooks module, and re-run the hook smoke block of your own shell; add the one-line `resume` rule to your auto-loaded context file; replace the word `baton` in your own documents if they carry it; re-read your local copy of `/code-revision`, if you keep one, against its new Step 0 and Step 1; and if you had edited `/end-chat-soft` Step 1, `/end-chat-force` Step 1 or `/code-revision` Step 0, move your edit into the new section and delete the old one — the update from 2.6 leaves both. The four new lint modules arrive as optional files under `.kaif/tools/`; the systems-registry skeleton is retired.

---

<a name="русский"></a>
## Русский · [English](#english)

<p align="center">
  <img src="https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/assets/KAIF_2.7_GitHub_LOGO.webp" alt="KAIF 2.7 Audited KAIF — медальон команды из восьми ролей в кольце уробороса" width="620">
</p>

**KAIF 2.7 — Audited KAIF.** После 2.6 в исток пришли восемнадцать тикетов, с #54 по #71. Их принесли агенты и владельцы живых проектов; три из них, с #69 по #71, дал аудит одного проекта. Большинство этих тикетов — места, где записи агента нельзя верить. Решение агента записано словом владельца; вопрос задан, когда ответ уже был; прогон доложен «протестировано» без отчёта; ложь исправлена в чате и осталась стоять в трекере; один урок записан до семнадцати раз разными словами. 2.7 делает каждую такую запись проверяемой: кто сказал, что искали, что прогнали, где поправили, какой класс повторился.

Что такое KAIF и как им пользоваться — [README](https://github.com/MikalaiKryvusha/KAIF#russian). Эта страница — что нового именно в этой версии.

---

### ✨ Что нового в 2.7

**1. Слово владельца цитируется, слово агента подписывается.** В боевом коде стоял комментарий «решение владельца: ждать». Слово владельца в той развилке было другим: «давай как ты считаешь». Из-за этого комментария прогон ждал 119 секунд, пока машина владельца умирала. Теперь у каждого записанного решения есть автор. У владельца это `[OWNER] «дословно» · дата` или адрес интервью, у агента — `[AI]`. «Давай как ты считаешь» — это мандат, и записывается он как `[AI] по мандату — «слова владельца»`. «Не пересматривать» есть только у решений `[OWNER]`. Новый опциональный модуль `kaif-attribution-lint` считает долгом каждую ссылку на волю владельца без дословной цитаты и без адреса интервью в двух строках от неё; базовая линия этого долга только убывает. Пометки провенанса `[AI]…[/AI]` теперь законны в любом черновике, который агент несёт владельцу. Форма развилки в коде та же, что с 2.5: `@fork <имя>` с четырьмя полями: OPTIONS · COST · RECON · DECIDED. Нет одного поля — `kaif-guard-lint` краснеет.

**2. Вопрос владельцу живёт до конца и задаётся после археологии.** `--check <док>` проверяет форму страницы вопросов, и страница при этом не открывается, звука и зова нет. Команда называет каждый заголовок, который похож на вопрос, но оформлен не как вопрос: с номером или с буквой. Решение, которое ушло в работу, записывается четвёртым фактом — «внесено». Документ, у которого все открытые вопросы внесены, очередь больше не показывает. Страница владельца показывает живые вопросы первыми и сворачивает всё отвеченное в один архив ниже. «Прочитано, замечаний нет» — законный исход. Кнопка «Сохранить» плавает справа сверху. Живой вопрос теперь открывается только с аттестацией поиска по прошлым ответам владельца, `GOAL.md`, плану и интервью. Аттестации нет — предполёт отказывает и печатает готовую команду поиска, собранную из заголовка самого вопроса. Правило судит документы, датированные с 18.09.2026; старые интервью не краснеют. Один проект, проверенный аудитом, принёс своему владельцу 13 вопросов, которые его прежние ответы, `GOAL.md` или прогон на стенде уже решили. Один из них пришёл через 44 дня после ответа.

**3. «Тест» — это функциональный прогон, и заявление не шире наблюдения за ним.** Тест — это прогон по реальному продукту путём пользователя, и результат этого прогона прочитан. Линтер, юнит-тесты, селфтесты, мутанты и стражи — гигиена. Гигиена обязательна, и тестированием она не называется. Каждый исполненный прогон оставляет отчёт `testcases/reports/<дата>_<работа>.md` из семи полей. `Гигиена:` и `Функциональный прогон:` стоят в нём двумя отдельными строками. Новый опциональный модуль `kaif-testrun-lint` краснеет на вердикте `pass`, когда строка функционального прогона говорит `NONE` или её нет. Каждое утверждение о состоянии мира называет, чем оно наблюдалось. «Сервер отвечает 200» так и говорится; «страница открыта у вас на экране» говорится только после снимка экрана.

**4. Текст владельца пишется по портрету его голоса.** Агент загружает портрет владельца в свой рабочий контекст до первого слова: `kaif-voice-lint load`. Пишет по нему, потом дважды проверяет текст по тому же портрету: командой `kaif-voice-lint check` и чтением отдельного агента, который не видел, как текст писался. Затем правит, и только тогда текст показывается владельцу. `check` отказывает тексту, написанному до загрузки портрета или позже часа после последней загрузки.

**5. Страница владельца сохраняет его ответ.** Окно контура встаёт на порт прошлого прогона. Черновик, который владелец печатал, поэтому восстанавливается. Страница, открытая вкладкой, предупреждает: черновик живёт только в этой вкладке. Живую страницу снаружи закрывает только `review.mjs <док> --close`. Команда печатает порт, процесс и заголовок окна. Владелец печатал меньше трёх минут назад или черновик не сохранён — команда отказывает. Ответ переживает смерть сервера страницы. В окне контура он лежит в собственном профиле браузера этого окна, внутри проекта, и следующий прогон очереди его подбирает; во вкладке страница показывает текст ответа, чтобы его скопировать. Проверено на Edge под Windows; в Chrome, macOS и Linux не проверено. Незнакомый флаг отказывает до того, как откроется страница.

**6. Ложь исправляется там, где оставлена.** Прошлое утверждение агента оказалось ложным — агент останавливается. Он перечисляет каждое место, где это утверждение опубликовано, правит или отзывает его в каждом, читает поправку обратно и называет её в ответе. У класса есть имя: стоячая ложь. Оба ритуала закрытия спрашивают о ней по имени: `Стоячая ложь: нет` или список мест. Библиотеки сфер получили слот «канал наружу → команда отзыва»; в библиотеке программирования он заполнен для девяти каналов.

**7. Тикет о дефекте KAIF доставляется тем же движением, что заведён.** Такой тикет уходит в исток без строки `AUTH:`; это единственное исключение из гейта авторизации, и теперь оно записано в строке самого гейта. Шаг заведения в `/report-bug` заканчивается командой `report`. `check` называет каждый тикет, у которого строка доставки доставку не доказывает. Такая строка — `NOT YET`, обещание вместо адреса или переведённое имя поля; бывает, что строки нет вовсе.

**8. Свободное место просит работу, и сгенерированная конституция команды хранит каждое обязательство шаблона.** Место закрыло задачу, и следующей нет. Тогда до конца хода оно шлёт менеджеру одно сообщение: сделано, осталось, какие кандидаты может взять. `check` сверяет `TEAM_CONSTITUTION.md` с шаблоном, который приехал с навыком, и называет каждое потерянное обязательство. Переведённую конституцию по якорям сопоставить нельзя, поэтому `check` её обязательства считает.

**9. Урок, повторившийся дважды, краснеет.** Запись журнала опыта несёт `class: <слаг>`. Новый опциональный модуль `kaif-experience-lint` краснеет на второй записи о провале одного класса без названного механизма. Обе записи он называет по номеру. У класса две записанные судьбы: страж, названный в записи, или цена всего класса, объявленная один раз рядом со списком классов в шапке журнала. `/end-chat-soft` запускает `kaif-experience-lint check`. Записи, написанные до 2.7, без `class:`, правила полей не судят, поэтому первый урок 2.7 не останавливает ритуал закрытия на истории журнала.

**10. Бюджет ядра перечитывания считается по строкам, которые написал сам проект.** Модули, приехавшие побайтно равными шаблону, в счёт не идут. Предупреждение называет, куда выносить лишнее: для `STATUS.md` это летопись, для остальных восьми — летопись, `researches/` или файл домашних правил. С флагом `--gate-budgets` команда `check` при превышении бюджета завершается ошибкой, и `/end-chat-soft` запускает её после стрижки бонсая. Навык считается смешанным по доле слов чужой письменности в его прозе; код в счёт не идёт.

**11. `resume` первым словом — приказ, и передача дел называется по-отраслевому.** Если сообщение открывается словом `resume`, агент сначала исполняет `/resume` целиком и только потом берёт задачу ниже. Опциональный модуль refresh-hooks получил четвёртый скрипт, `prompt-resume-word.mjs`: он впрыскивает этот приказ. Слова `baton` в английской поставке больше нет: там это handover, а в русской — «эстафета», как в триггерах навыка. Переименованный заголовок при обновлении заменяет старый и не дублируется, начиная с 2.7. Обновление с 2.6 исполняет ваше ядро 2.6, а оно карту переименований не читает. Раздел, который вы правили под переименованным заголовком, поэтому придёт дважды; что сделать, сказано ниже, в обновлении.

**12. Убрано и переписано.** Учёт доставки убран словом владельца: команда `delivery`, `SYSTEMS_REGISTRY.md`, строка `DELIVERY:` в ритуалах закрытия. Навык `/code-revision` переписан моделью, которая его исполняет, и затем прогнан на реальной зоне кода. Его шаг 0 теперь называется «базовая линия, скоуп, бюджет и почва до охоты».

**13. Суд заседал до выхода этой страницы.** Реестр из 138 заявлений, которые версия делает о себе, переисполнили шесть судей с чистыми контекстами, по кластеру на каждого: 116 подтверждены как написаны, 17 ослаблены до того, что держат улики, 5 опровергнуты. Пять находок были блокерами релиза, и все пять починены до выхода версии: два пути обновления с 2.6, форма вопроса, которую не видела проверка, правило журнала, которое судило всю его историю, и страница, которая обещала сохранить ответ и не могла.

---

### 📦 Установка

Положите [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) в корень проекта и скажите агенту своими словами — полный порядок установки, режимы развёртывания и языковые опции несёт [README](https://github.com/MikalaiKryvusha/KAIF#2-установка).

Обновление развёрнутого проекта: скажите *«обнови KAIF»* — агент сверится с истоком, покажет дельту и мигрирует уважительно, сохранив ваши документы и правки. Задание обновления называет пять вещей, которые вы сделаете руками. Добавьте четвёртую запись хука в свои настройки, если подключали модуль refresh-hooks, и перепрогоните проверку хуков блоком своей оболочки. Добавьте строку о слове `resume` в автозагружаемый файл контекста. Замените слово «батон» в своих `STATUS.md` и летописи, если оно там есть. Перечитайте свою локальную копию `/code-revision`, если держите её, против новых шагов 0 и 1. Если вы правили шаг 1 в `/end-chat-soft` или `/end-chat-force` либо шаг 0 в `/code-revision`, перенесите правку в новый раздел и удалите старый: обновление с 2.6 оставит оба. Четыре новых линт-модуля приезжают опциональными файлами в `.kaif/tools/`; скелет реестра систем снимается.
