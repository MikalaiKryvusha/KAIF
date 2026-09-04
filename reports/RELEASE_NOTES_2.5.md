<!--
  ⚠️ ЭТОТ ФАЙЛ — ТЕЛО СТРАНИЦЫ РЕЛИЗА, И В НЁМ АБЗАЦ ПИШЕТСЯ ОДНОЙ СТРОКОЙ.
  GitHub Releases сохраняет переводы строк (одиночный \n рендерится разрывом), поэтому врап
  «для читаемости в репозитории» превращается на публичной странице в рваный текст. Проверка
  перед публикацией: в файле не должно быть двух непустых строк подряд вне блоков кода и таблиц.

-->

<p align="center">
  <img src="https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/assets/KAIF_2.5_GitHub_LOGO.webp" alt="KAIF 2.5 Experienced KAIF" width="620">
</p>

> **Release date: 2026-09-04** · Minsk.

<a name="english"></a>
## English · [Русский](#русский)

**KAIF 2.5 — Experienced KAIF.** Thirteen tickets from the agents of live projects — three of them marked TOP by their owner — became the scope of this version. Each of them was a rule that existed in the canon as prose and did not hold at the moment of decision. 2.5 gives those rules a carrier at the decision point: a forced line, a machinery command, a guard that goes red, a task item the update writes for you.

What KAIF is and how to use it — the [README](https://github.com/MikalaiKryvusha/KAIF#english). This page is what is new in this version.

---

### ✨ What's new in 2.5

**1. Rules live where the decision is made.** Five carriers landed in the documents and skills of both layers. A ticket about a defect of KAIF itself is delivered under the framework owner's standing authorization and never waits for an `AUTH:` line — the exception now stands inside the authorization gate, where the agent reads it before every task. An engineering fork (two or more options and a non-zero price of error) is not the agent's to decide alone: the philosophy gained its fourth door — recon of the domain's authorities or the owner — and the guide gained the forced line `FORK: options · price of error · consulted`, which the judge hunts. Gate 5 of testing gained its second half: every guard declares `@guard THREAT · PROVED-AGAINST · GAP · ON-REAL-PATH`, a recorder declares `@forensic … DURABLE-AT`, and an optional linter reads the block. The guarded loop writes its boundary (`armed until <ISO>`) and opens its closing step with `BOUNDARY:` — the judge hunts an early finish. The review contour binds its voice to the deployment's language first and drops to beeps rather than speak an unintelligible sentence.

**2. Delivery is counted, incidents are sized, the core has a budget.** Every session close and every loop iteration now opens with `DELIVERY: <metric> X → Y; moved by … | blocker …` — the ONE acceptance metric named in the master plan; `/what-next` ranks by it first. Defects get a severity ladder: S1 harmed hardware, data or trust → the full package; S2 cost a run or an hour → a document and a guard, no epic; S3 → one line in the experience journal, no document. The nine re-read documents carry line budgets that `check` warns above, and the prayer cadence is an owner setting.

**3. Delivering a KAIF ticket is a machinery command.** `node .kaif/kaif-core.mjs report <ticket>` creates the origin issue through `gh` under the standing authorization, appends the authorship trailer and writes the issue URL into the ticket. Refusals are named (anonymous tracking · no `gh` · not a ticket · `gh` refused), a timeout is "outcome unknown" rather than a refusal, `--dry-run` calls nothing. `/report-bug` step 4 now says "run it" — the prose procedure an agent system's classifier used to refuse is gone.

**4. The team in the field.** Two live teams returned their gaps to `/team-deployment`. A team that already exists is ADOPTED through a new reference, never overwritten by the templates. The status board knows four states as roles — free · busy · blocked · offline — and its tool contract gained `audit-waiting`: a blocked row whose addressee is not working is an alarm. The board lives OUTSIDE git by default (ignore-first; a snapshot travels to the retrospective; a tracked board is a named opt-out with its price in the constitution). CI ships with the team: one job, three cheap gates read from the project's own commands, a red run on a role branch blocks the merge, a non-GitHub remote gets the same job as a pre-push script. A third archetype covers a lab with one physical singleton under test.

**5. Update symmetries.** An anchored block — the creed, the prayer — arrives whole or goes to the update task as one item with the diff of all its carriers; an END without its BEGIN can no longer land, and `check` reddens a document that carries an unpaired marker. The verdict on every localized candidate prints with its numbers, `diff --source` records them as a rehearsal, and a live run whose verdict differs freezes the file instead of merging it. The `stale-claims` item is written on every version change — an empty scan says so — and now scans the project's own scripts. New English files on a non-English deployment are listed by name; every retired skill names its successor; a wholesale-translated file names its upstream path with a ready `git diff` command; `project-name` refuses a name the shell mangled. The cause of the field's non-deterministic verdict was reproduced under two folder names and cured.

**6. A requirement in the owner's language — the scenario form.** An acceptance criterion can now be written as four lines: Situation · Action · Result · Check. The first three are Given / When / Then of classic BDD; the fourth is the runnable command or query with its expected output — the machine signal without which "done" stays the agent's word. Seven rules keep the form honest (one action, a result observable from outside, concrete values, no implementation words, third person, a runnable Check, and a Check that is never quietly edited during execution); an owner may leave the Check line empty and the agent fills it. The four lines stand in the criteria block of `/plan-task` and are named in `/plan-epic`, `/propose-idea` and `/report-bug`, `/interview` explains a mechanic scenario-first, and the optional `kaif-scenario-lint` module guards the form where a scenario is started — never demanding one. The form came from the field: an owner who is not a programmer wrote it for his own project first.

**7. The court sat before this page went out.** A registry of 30 claims this version makes about itself was re-executed by four judges with clean contexts and a panel of two skeptics: 25 confirmed as written, 5 weakened to what the evidence supports, none refuted — and the five defects the panel let through were fixed and re-judged the same hour, one of them with a new guard proven red first.

---

### 📦 Installation

Drop [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) into your project root and tell your agent in your own words — the [README](https://github.com/MikalaiKryvusha/KAIF#2-installation) carries the full installation procedure, the deployment modes and the language options.

Updating a deployed project: say *"update KAIF"* — the agent checks the origin, shows the delta and migrates respectfully, keeping your content. Four behaviours of the update changed in this version; the update task names each of them, and a tree the previous merge left with an unpaired block turns red on purpose — restore the block from the task diff once. If the run dies midway, say *"resume the KAIF update"*.

---

<a name="русский"></a>
## Русский · [English](#english)

<p align="center">
  <img src="https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/assets/KAIF_2.5_GitHub_LOGO.webp" alt="KAIF 2.5 Experienced KAIF — медальон команды из восьми ролей в кольце уробороса" width="620">
</p>

**KAIF 2.5 — Experienced KAIF.** Тринадцать тикетов от агентов живых проектов — три из них владелец пометил как TOP — стали скоупом этой версии. Каждый тикет — правило, которое стояло в каноне прозой и не держалось в момент решения. 2.5 даёт таким правилам носитель в точке решения: принудительную строку, команду машинерии, стража, который краснеет, пункт задания, который обновление пишет за вас.

Что такое KAIF и как им пользоваться — [README](https://github.com/MikalaiKryvusha/KAIF#russian). Эта страница — что нового именно в этой версии.

---

### ✨ Что нового в 2.5

**1. Правила живут там, где принимается решение.** Пять носителей легли в документы и навыки обоих слоёв. Тикет о дефекте самого KAIF доставляется под стоячей авторизацией владельца фреймворка и не ждёт строки `AUTH:` — исключение теперь стоит внутри гейта авторизации, где агент читает его перед каждой задачей. Инженерная развилка (два и больше варианта при ненулевой цене ошибки) — не собственность агента: философия получила четвёртую дверь — разведку авторитетов области или слово владельца, — а руководство получило принудительную строку `FORK: options · price of error · consulted`, на которую охотится судья. Гейт 5 тестирования получил вторую половину: каждый страж объявляет `@guard THREAT · PROVED-AGAINST · GAP · ON-REAL-PATH`, самописец — `@forensic … DURABLE-AT`, а опциональный линтер читает этот блок. Защищённый цикл записывает свою границу (`armed until <ISO>`) и открывает шаг закрытия строкой `BOUNDARY:` — судья охотится на ранний финиш. Контур согласований привязывает голос сначала к языку развёртывания и падает на писки, а не произносит неразборчивую фразу.

**2. Доставка считается, инциденты имеют размер, у ядра есть бюджет.** Каждое закрытие сессии и каждая итерация цикла открываются строкой `DELIVERY: <метрика> X → Y; moved by … | blocker …` — ОДНОЙ метрикой приёмки, названной в мастер-плане; `/what-next` ранжирует по ней первой. У дефектов появилась лестница тяжести: S1 — пострадали железо, данные или доверие → полный пакет; S2 — потерян прогон или час → документ и страж, без эпика; S3 → одна строка в журнале опыта, без документа. Девять перечитываемых документов несут бюджеты в строках, о превышении которых предупреждает `check`, а каденция молитвы — настройка владельца.

**3. Доставка тикета о KAIF — команда машинерии.** `node .kaif/kaif-core.mjs report <тикет>` создаёт issue в истоке через `gh` под стоячей авторизацией, добавляет трейлер авторства и вписывает URL issue в тикет. Отказы названы (анонимная привязка · нет `gh` · не тикет · `gh` отказал), таймаут — «исход неизвестен», а не отказ, `--dry-run` ничего не зовёт. Шаг 4 навыка `/report-bug` теперь говорит «запусти» — прозаической процедуры, которую классификатор агентской системы отвергал, больше нет.

**4. Команда в поле.** Две живые команды вернули навыку `/team-deployment` свои пробелы. Уже существующая команда ПРИНИМАЕТСЯ через новый референс, а не перезаписывается шаблонами. Доска статусов знает четыре состояния как роли — свободен · занят · заблокирован · офлайн, — а контракт её инструмента получил `audit-waiting`: заблокированная строка, адресат которой не работает, — тревога. Доска по умолчанию живёт ВНЕ git (ignore-first; снимок едет в ретроспективу; отслеживаемая доска — названный опт-аут с ценой в конституции). CI едет вместе с командой: один job, три дешёвых гейта, прочитанных из команд самого проекта, красный прогон на ветке роли блокирует слияние, не-GitHub remote получает тот же job как pre-push-скрипт. Третий архетип — лаборатория с одним физическим синглтоном под тестом.

**5. Симметрии обновления.** Якорный блок — символ веры, молитва — приезжает целиком или уходит в задание обновления одним пунктом с диффом всех его носителей; END без своего BEGIN приземлиться больше не может, а `check` краснит документ с непарным маркером. Вердикт по каждому локализованному кандидату печатается с числами, `diff --source` записывает их как репетицию, и боевой прогон с другим вердиктом замораживает файл, а не сливает его. Пункт `stale-claims` пишется при каждой смене версии — пустой скан говорит об этом — и теперь сканирует собственные скрипты проекта. Новые английские файлы на неанглийском развёртывании перечислены поимённо; каждый снятый навык называет преемника; целиком переведённый файл называет свой путь в истоке с готовой командой `git diff`; `project-name` отвергает имя, искажённое шеллом. Причина полевого недетерминированного вердикта воспроизведена на двух именах папки и вылечена.

**6. Требование на языке владельца — сценарная форма.** Критерий приёмки теперь можно записать четырьмя строками: Ситуация · Действие · Результат · Проверка. Три первые — Given / When / Then классического BDD; четвёртая — исполнимая команда или запрос с ожидаемым выходом, тот машинный сигнал, без которого «готово» остаётся словом агента. Семь правил держат форму честной (одно действие, результат, наблюдаемый снаружи, конкретные значения, без слов реализации, третье лицо, исполнимая «Проверка» — и «Проверка», которую никто тихо не правит по ходу исполнения); владелец может оставить строку «Проверка» пустой, и агент её заполняет. Четыре строки стоят в блоке критериев навыка `/plan-task` и названы в `/plan-epic`, `/propose-idea` и `/report-bug`, `/interview` объясняет механику сначала сценарием, а опциональный модуль `kaif-scenario-lint` стережёт форму там, где сценарий начат, — и никогда его не требует. Форма пришла из поля: владелец, который не программист, сначала написал её для собственного проекта.

**7. Суд заседал до выхода этой страницы.** Реестр из 30 заявлений, которые версия делает о себе, переисполнен четырьмя судьями с чистыми контекстами и панелью из двух скептиков: 25 подтверждены как написаны, 5 ослаблены до того, что подтверждают улики, ни одно не опровергнуто — а пять дефектов, которые панель пропустила, починены и пересужены тем же часом, один из них — с новым стражем, доказанным красным до фикса.

---

### 📦 Установка

Положите [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) в корень проекта и скажите агенту своими словами — полный порядок установки, режимы развёртывания и языковые опции несёт [README](https://github.com/MikalaiKryvusha/KAIF#2-установка).

Обновление развёрнутого проекта: скажите *«обнови KAIF»* — агент сверится с истоком, покажет дельту и мигрирует уважительно, сохранив ваше. Четыре поведения обновления в этой версии изменились; задание обновления называет каждое, а дерево, в котором прошлое слияние оставило непарный блок, краснеет намеренно — восстановите блок из диффа задания один раз. Если прогон умер на середине — скажите *«продолжи обновление KAIF»*.
