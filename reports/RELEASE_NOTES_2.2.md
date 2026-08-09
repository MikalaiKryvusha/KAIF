<!--
  ⚠️ ЭТОТ ФАЙЛ — ТЕЛО СТРАНИЦЫ РЕЛИЗА, И В НЁМ АБЗАЦ ПИШЕТСЯ ОДНОЙ СТРОКОЙ.
  GitHub Releases сохраняет переводы строк (одиночный \n рендерится разрывом), поэтому врап
  «для читаемости в репозитории» превращается на публичной странице в рваный текст: союз или
  предлог остаётся висеть на отдельной строке. README этим не страдает — там одиночный перенос
  склеивается в пробел. Проверка перед публикацией: в файле не должно быть двух непустых строк
  подряд вне блоков кода и таблиц.
-->
<p align="center">
  <img src="https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/assets/KAIF_2.2_GitHub_LOGO_v2.webp" alt="KAIF 2.2 Yolden KAIF" width="620">
</p>

> **Release date: 2026-08-08** · Minsk.

<a name="english"></a>
## English · [Русский](#русский)

**KAIF 2.2 — Yolden KAIF.** A very large-scale version, the one that endows KAIF with the power of an intelligent system that develops itself through a feedback loop. The ouroboros stands for the closing of the loop and for completeness. The eye stands for KAIF now being under the observation of the projects that use it — and those projects being under the observation of KAIF. Every cycle closes — the metaphorical ones and the technical ones alike.

The version grew out of the field: four updates of real projects, each with a field report, became five epics and twelve tasks on top of 2.1 Strong KAIF. What KAIF is and how to use it — the [README](https://github.com/MikalaiKryvusha/KAIF#english). This page is the delta only.

---

### ✨ What's new in 2.2

**1. The interactive contour — a question to the owner became a channel.** In 2.1 the place of questions was a rule. In 2.2 it is machinery. Interviews and drafts render as local self-contained pages, a decision is recorded in one click, and an unanswered question becomes a debt the agent carries. A `--notice` call delivers a *message*: it calls, but waits for no answer. The guard refuses to go green while a live question has fewer than two parsable options. A question a human cannot click is not a question.

**2. The feedback loop closes both ways.** A field agent spots a defect in the methodology itself — and now has five prescribed steps to take instead of relying on goodwill: prove the class, fix it locally, file the signal upstream, name the local remediation in the ticket, close the lesson at home. The field report became an obligation of the update ritual. `reports/` ships as a knowledge directory. And the standing order went into the canon itself: bring KAIF methods that are **battle-tested in production**, and recommend dropping what does not work.

**3. `REQUIREMENTS_FRAMEWORK.md` — the 14th key document.** Requirements are the earliest testing there is. Ten quality criteria anchored in ISO/IEC/IEEE 29148, the EARS patterns, a grep-lintable stop-dictionary of unverifiable words, the fit-criterion formula (Scale · Meter · Target). Every goal document — plan, epic, bug, idea — opens with a **goal vector** and **acceptance criteria**. A plan without them is speculation. The form is held by the document-header norm and two linters.

**4. Fresh context stopped being a promise.** Rules read once at the start of a session melt as the context fills. So re-reading became a verifiable act: four triggers, a machine-readable witness marker, an acceptance quote in the chat. A marker without a quote is fraud of the same class as a false `[TESTED]`. The delivery carries the optional **`refresh-hooks`** module for harnesses with lifecycle hooks: an order to re-read after a compaction, a timer on the marker's age, a soft STATUS guard. Next to it — hook configs for the other agent systems, read off live vendor documentation. And the **environment dossier**: the agent learns its own machine from its own probes.

**5. The `/go` kick — and eleven more tasks.** `/kaif-go` is the slash-command form of saying "carry on": a simple way to continue the work in the current chat. It understands «дальше», «продолжай», "continue". Alongside it: the timestamp canon (a decision mark carries the date **and** the time), the `EPIC` naming convention with its guard, a revision of `/code-revision` with an audit-report contract, "code before cognition" as a principle (80 % determinism / 20 % AI), the test suite as an obligation of the work that produced it, origin tracking as the install default, the restored definition of what KAIF *is*. And KAIF's own **`AUTHOR_STYLOMETRY.md`**: the origin of the canon file name finally has the file.

**6. A fix without a guard is a fix on credit — and now that rule ships with a tool.** New in the optional tool modules: **`kaif-requirements-lint`** runs the stop-dictionary over the requirement sections of your plans, bugs and ideas. It advises. The other guards written this version belong to the origin's own machinery and are not part of your deployment — but their verdict is: the permanent sandbox polygon that verifies the deploy and update machinery grew to **14 suites**, and every new guard there is proven red on a broken version before its green is trusted.

---

### 🎲 Interesting facts — what this version cost

The window is two days: from 2026-08-07 at 00:00 +03:00 to 2026-08-09 at 00:46 +03:00.

- **2.0 calendar days · 29 hours of active work** — 141 commits, 190 files created from nothing.
- **316,764 handwritten words** of prose ≈ 3.9 novels, at 10,936 words per active hour; the knowledge directories hold **2,149,895 characters** — 3.7 more novels of accompanying documentation.
- **3,011,949,062 tokens** ≈ 17,919 novels read and written again; the models' own writing ≈ 87 novels.
- The same volume by human hands: **5,517 person-hours** — five engineers for 138 working days.
- Paid by subscription: **≈ $16.89** for two days of a Claude Max plan. At Anthropic's public API prices the same volume of work would cost **$3,509**.

The full table lives in the [README](https://github.com/MikalaiKryvusha/KAIF#85-interesting-facts).

---

### 📦 Installation

Drop [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) into your project root and tell your agent:

> *"Deploy KAIF from KAIF.md"*

The agent runs three bootstrap steps and the machinery does the rest.

<sub>An installation is tracked to the origin by default. Want no tie to the origin — tell the agent: *"Deploy KAIF from KAIF.md in anonymous mode"*.</sub>

### ⬆️ Updating from 2.0 / 2.1

Ask your agent for `/kaif-update`. The update is mechanical and respects every local change; the right to replace a file belongs only to a matching template-sha. A judge verdict is now a mandatory checkpoint — `update-verify` is not green without it.

---

<a name="русский"></a>
## Русский · [English](#english)

<p align="center">
  <img src="https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/assets/KAIF_2.2_GitHub_LOGO_v2.webp" alt="KAIF 2.2 Yolden KAIF — уроборос с глазом в центре" width="620">
</p>

> **Дата релиза: 08.08.2026** · Минск.

**KAIF 2.2 — Yolden KAIF.** Очень масштабная версия, наделяющая KAIF силой умной системы, самостоятельно развивающейся по циклу обратной связи. Уроборос символизирует замыкание цикла и совершенство. Глаз символизирует то, что KAIF теперь под наблюдением проектов, которые им пользуются, а проекты, которые им пользуются, — под наблюдением KAIF. Все циклы — и метафорические, и технические — замыкаются.

Версия выросла из поля. Четыре обновления реальных проектов, каждое с полевым отчётом, стали пятью эпиками и двенадцатью задачами поверх 2.1 Strong KAIF. Чем KAIF является и как им пользоваться — [README](https://github.com/MikalaiKryvusha/KAIF#russian). Эта страница — только дельта.

---

### ✨ Что нового в 2.2

**1. Вопросы к владельцу теперь живут в одном месте.** В 2.1 это было правилом на бумаге, в 2.2 — работающей машинерией. Интервью и черновики открываются локальной страницей в браузере, ответ отмечается одним кликом, а неотвеченный вопрос агент держит за собой как долг. Рядом появился второй режим — сообщение: агент зовёт, но ответа не ждёт. Страж не даёт зелёного, пока у живого вопроса меньше двух вариантов ответа: иначе владельцу не на что нажать.

**2. Сигнал из поля доходит до истока.** Агент заметил изъян в самой методологии — теперь у него есть пять шагов вместо доброй воли: доказать, что это не единичный случай, починить у себя, отправить сигнал в исток, указать в тикете свою починку и записать урок. Полевой отчёт стал обязательной частью обновления. В поставке появилась директория `reports/`. А в канон записано прямое поручение: приносить в KAIF то, что проверено боем в продакшене, и вслух говорить о том, что не работает.

**3. Появился четырнадцатый ключевой документ — `REQUIREMENTS_FRAMEWORK.md`.** Требования — это самое раннее тестирование, какое бывает. В документе десять критериев качества с опорой на ISO/IEC/IEEE 29148, шаблоны формулировок EARS, словарь слов, по которым требование становится непроверяемым, и формула критерия приёмки: что мерим, чем мерим, какое число считаем достигнутым. Любой план, эпик, баг и идея теперь открываются вектором цели и критериями приёмки. Без них план остаётся спекуляцией.

**4. Свежий контекст перестал быть обещанием.** Правила, прочитанные один раз на старте сессии, тают по мере того, как контекст заполняется. Поэтому перечитывание стало действием, которое можно проверить: четыре повода перечитать, машиночитаемая отметка о том, что это сделано, и цитата в чате из перечитанного. Отметка без цитаты — такой же обман, как ложный `[TESTED]`. Для харнессов с хуками в поставку добавлен модуль `refresh-hooks`: он приказывает перечитать канон после сжатия контекста, следит за возрастом отметки и мягко напоминает про `STATUS.md`. Рядом лежат образцы хук-конфигов для других агентских систем, снятые с живой документации вендоров. И ещё агент теперь знает свою машину по собственным пробам, а не по памяти: для этого в канон добавлено досье окружения.

**5. Появилась команда `/go` — и ещё одиннадцать задач.** `/kaif-go` — это слеш-команда «продолжай»: простой способ продолжить работу в текущем чате. Она понимает и «дальше», и «продолжай», и «continue». Рядом с ней: канон меток времени, где решение помечается и датой, и временем; конвенция имён эпиков со стражем; переработанный `/code-revision` с описанным форматом аудит-отчёта; принцип «код прежде когниции» — 80 % работы делает детерминированный код, 20 % остаётся уму; test suite как часть той же работы, которая его породила; привязка к origin по умолчанию при установке; вернувшееся определение того, чем KAIF является. И собственная `AUTHOR_STYLOMETRY.md`: у истока канон-имени наконец появился сам файл.

**6. Фикс без стража — это фикс в кредит, и теперь у правила есть инструмент.** Среди опциональных модулей поставки появился `kaif-requirements-lint`: он проходит по секциям требований в ваших планах, багах и идеях и показывает непроверяемые формулировки. Он советует, решение остаётся за вами. Остальные стражи, написанные в этой версии, работают в самом истоке и в ваше развёртывание не попадают. Про них важно другое: песочный полигон, который проверяет установку и обновление, вырос до **14 сводов**, и каждый новый страж там сначала показывают на сломанной версии — и только потом верят его зелёному.

---

### 🎲 Интересные факты — во что обошлась эта версия

Окно — двое суток: с 00:00 07.08.2026 до 00:46 09.08.2026.

- **2,0 календарных суток · 29 часов активной работы** — 141 коммит, 190 файлов создано с нуля.
- **316,764 рукописных слова** прозы ≈ 3,9 романа, темп 10,936 слов в активный час; в директориях знания лежит **2,149,895 символов** — ещё 3,7 романа сопроводительной документации.
- **3,011,949,062 токена** ≈ 17,919 романов прочитано и написано заново; написано моделями ≈ 87 романов.
- Тот же объём руками людей: **5,517 человеко-часов** — пять инженеров на 138 рабочих дней.
- Заплачено по подписке: **≈ $16,89** за двое суток плана Claude Max. По публичному прайсу API Anthropic такой же объём работы стоил бы **$3,509**.

Полная таблица — в [README](https://github.com/MikalaiKryvusha/KAIF#85-интересные-факты).

---

### 📦 Установка

Положите [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) в корень проекта и скажите агенту:

> *«Разверни KAIF из KAIF.md»*

Агент выполняет три шага бутстрапа, остальное делает машинерия.

<sub>Установка по умолчанию привязана к origin. Нужно без привязки к origin — скажите агенту: *«Разверни KAIF из KAIF.md в анонимном режиме»*.</sub>

### ⬆️ Обновление с 2.0 / 2.1

Попросите агента: `/kaif-update`. Обновление механическое и уважает каждую локальную правку. Право заменить файл есть только у совпавшего template-sha. Вердикт судьи стал обязательным чекпоинтом — без него `update-verify` не зелёный.
