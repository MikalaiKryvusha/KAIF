<p align="center">
  <img src="https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/assets/KAIF_2.2_GH_RELEASE_PAGE_LOGO.jpg" alt="KAIF 2.2 — Yolden KAIF" width="620">
</p>

> **Release date: 2026-08-08** · Minsk.

<a name="english"></a>
## English · [Русский](#русский)

**KAIF 2.2 — Yolden KAIF.** A very large-scale version, the one that endows KAIF with the power of
an intelligent system that develops itself through a feedback loop. The ouroboros stands for the
closing of the loop and for completeness. The eye stands for KAIF now being under the observation of
the projects that use it — and those projects being under the observation of KAIF. Every cycle
closes — the metaphorical ones and the technical ones alike.

The version grew out of the field: four park updates with reports (NDim, Unliminium, KLAS,
KrinikCam) became five epics and twelve tasks on top of 2.1 Strong KAIF. What KAIF is and how to
use it — the [README](https://github.com/MikalaiKryvusha/KAIF#english). This page is the delta only.

---

### ✨ What's new in 2.2

**1. The interactive contour — a question to the owner became a channel.** In 2.1 the place of
questions was a rule. In 2.2 it is machinery. Interviews and drafts render as local self-contained
pages, a decision is recorded in one click, and an unanswered question becomes a debt the agent
carries. A `--notice` call delivers a *message*: it calls, but waits for no answer. The guard refuses
to go green while a live question has fewer than two parsable options. A question a human cannot
click is not a question.

**2. The feedback loop closes both ways.** A field agent spots a defect in the methodology itself —
and now has five prescribed steps instead of goodwill: prove the class, fix it locally, file the
signal upstream, name the local remediation in the ticket, close the lesson at home. The field
report became an obligation of the update ritual. `reports/` ships as a knowledge directory. And the
standing order went into the canon itself: bring KAIF methods that are **battle-tested in
production**, and recommend dropping what does not work.

**3. `REQUIREMENTS_FRAMEWORK.md` — the 14th key document.** Requirements are the earliest testing
there is. Ten quality criteria anchored in ISO/IEC/IEEE 29148, the EARS patterns, a grep-lintable
stop-dictionary of unverifiable words, the fit-criterion formula (Scale · Meter · Target). Every goal
document — plan, epic, bug, idea — opens with a **goal vector** and **acceptance criteria**. A plan
without them is speculation. The form is held by the document-header norm and two linters.

**4. Fresh context stopped being a promise.** Rules read once at the start of a session melt as the
context fills. So re-reading became a verifiable act: four triggers, a machine-readable witness
marker, an acceptance quote in the chat. A marker without a quote is fraud of the same class as a
false `[TESTED]`. The delivery carries the optional **`refresh-hooks`** module for harnesses with
lifecycle hooks: an order to re-read after a compaction, a timer on the marker's age, a soft STATUS
guard. Next to it — hook configs for the other agent systems, read off live vendor documentation.
And the **environment dossier**: the agent learns its own machine from its own probes, not from
memory.

**5. The `/go` kick — and eleven more tasks.** `/kaif-go` resumes work already in flight with no
"shall I continue?" round trip. It understands «дальше», «продолжай», "continue". Alongside it: the
timestamp canon (a decision mark carries the date **and** the time), the `EPIC` naming convention
with its guard, a revision of `/code-revision` with an audit-report contract, "code before
cognition" as a principle (80 % determinism / 20 % AI), the test suite as an obligation of the work
that produced it, origin tracking as the install default, the restored definition of what KAIF *is*.
And KAIF's own **`AUTHOR_STYLOMETRY.md`**: the origin of the canon file name finally has the file.

**6. A fix without a guard is a fix on credit — and now that rule ships with a tool.** New in the
optional tool modules: **`kaif-requirements-lint`** runs the stop-dictionary over the requirement
sections of your plans, bugs and ideas. It advises, never blocks. The other guards written this
version belong to the origin's own machinery and are not part of your deployment — but their
verdict is: the permanent sandbox polygon that verifies the deploy and update machinery grew to
**14 suites**, and every new guard there is proven red on a broken version before its green is
trusted.

---

### 🎲 Interesting facts — what this version cost

Measured at **2026-08-08 23:41 +03:00** (`node tools/kaif-stats.mjs --since
"2026-08-07T00:00:00+03:00"`), counted from the moment the work actually started rather than from
the previous tag:

- **2.0 calendar days · 27.8 hours of active work** — 137 commits, 185 files created from nothing.
- **308 692 handwritten words** of prose ≈ 3.9 novels, at 11 115 words per active hour.
- **2 867 007 579 tokens** ≈ 17 919 novels read and written again; the models' own writing ≈ 87 novels.
- The same volume by human hands: **813–2 034 person-hours** — five engineers for 20–51 working days.
- Actually paid: **≈ $16.51** (a subscription share). The same work at public API prices: **$3 418**.

Three boundaries hold this block honest, and the full table lives in the
[README](https://github.com/MikalaiKryvusha/KAIF#85-interesting-facts--what-version-22-cost): the
money is not the owner's bill but an API-price estimate, the person-hours are an estimate with
visible rates, and the energy figure is somebody else's measurement of other models — Anthropic
publishes no watt-hours per token.

---

### 📦 Installation

Drop [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) into your project root and
tell your agent: *"Deploy KAIF from KAIF.md"*. The agent runs three bootstrap steps and the machinery
does the rest.

<sub>An installation is tracked to the origin by default. Deploying with no tie to the origin: add
`--mode anonymous` to the loader call in step 3.</sub>

### ⬆️ Updating from 2.0 / 2.1

Ask your agent for `/kaif-update`. The update is mechanical and respects every local change; the
right to replace a file belongs only to a matching template-sha. A judge verdict is now a mandatory
checkpoint — `update-verify` is not green without it.

---

<a name="русский"></a>
## Русский · [English](#english)

<p align="center">
  <img src="https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/assets/KAIF_2.2_GH_RELEASE_PAGE_LOGO.jpg" alt="KAIF 2.2 Yolden KAIF — уроборос с глазом в центре" width="620">
</p>

> **Дата релиза: 2026-08-08** · Минск.

**KAIF 2.2 — Yolden KAIF.** Очень масштабная версия, наделяющая KAIF силой умной системы,
самостоятельно развивающейся по циклу обратной связи. Уроборос символизирует замыкание цикла и
совершенство. Глаз символизирует то, что KAIF теперь под наблюдением проектов, которые им
пользуются, а проекты, которые им пользуются, — под наблюдением KAIF. Все циклы — и метафорические,
и технические — замыкаются.

Версия выросла из поля. Четыре обновления парка проектов с отчётами (NDim, Unliminium, KLAS,
KrinikCam) стали пятью эпиками и двенадцатью задачами поверх 2.1 Strong KAIF. Чем KAIF является и
как им пользоваться — [README](https://github.com/MikalaiKryvusha/KAIF#russian). Эта страница —
только дельта.

---

### ✨ Что нового в 2.2

**1. Интерактивный контур — вопрос к владельцу стал каналом.** В 2.1 место вопросов было правилом.
В 2.2 это машинерия. Интервью и черновики рендерятся локальными самодостаточными страницами, решение
фиксируется в один клик, а неотвеченный вопрос становится долгом агента. Вызов `--notice` доставляет
*сообщение*: зовёт, но ответа не ждёт. Страж не зеленеет, пока у живого вопроса меньше двух
разобранных вариантов. Вопрос, который человеку нечем нажать, — не вопрос.

**2. Петля обратной связи замкнута в обе стороны.** Полевой агент заметил дефект в самой
методологии — и у него теперь пять предписанных шагов вместо доброй воли: докажи класс, почини
локально, заведи сигнал в исток, укажи в тикете локальную починку, замкни урок у себя. Полевой отчёт
стал обязательством ритуала обновления. `reports/` едет директорией знаний. А стоячее распоряжение
записано прямо в канон: приносить методики, **проверенные боем в продакшене**, и рекомендовать отказ
от того, что не работает.

**3. `REQUIREMENTS_FRAMEWORK.md` — 14-й ключевой документ.** Требования являются самым ранним
тестированием из существующих. Десять критериев качества с якорями в ISO/IEC/IEEE 29148, паттерны
EARS, греп-линтуемый стоп-словарь непроверяемых слов, формула критерия приёмки (Scale · Meter ·
Target). Каждый целевой документ — план, эпик, баг, идея — открывается **вектором цели** и
**критериями приёмки**. План без них — спекуляция. Форму держат норма шапки-меты и два линтера.

**4. Свежий контекст перестал быть обещанием.** Правила, прочитанные один раз на старте сессии,
тают по мере заполнения контекста. Поэтому перечитывание стало проверяемым действием: четыре
триггера, машиночитаемый маркер-свидетельство, цитата-приёмка в чате. Маркер без цитаты — фрод того
же класса, что ложный `[TESTED]`. В поставке — опциональный модуль **`refresh-hooks`** для систем с
lifecycle-хуками: приказ перечитать после сжатия, таймер возраста маркера, мягкий страж STATUS.
Рядом — хук-конфиги под остальные агентские системы, снятые с живых вендорских доков. И **досье
окружения**: агент знает свою машину из собственных проб, а не из памяти.

**5. Пинок `/go` — и ещё одиннадцать задач.** `/kaif-go` возобновляет начатую работу без обмена
репликами «продолжать ли». Он понимает «дальше», «продолжай», «continue». Рядом с ним: канон
временных меток (метка решения несёт И дату, И время), конвенция имён `EPIC` со стражем, ревизия
`/code-revision` с контрактом аудит-отчёта, «код прежде когниции» принципом (80 % детерминизма /
20 % ИИ), test suite как обязательство работы, которая его породила, origin как дефолт установки,
восстановленное определение того, чем KAIF является. И собственная **`AUTHOR_STYLOMETRY.md`**:
у истока канон-имени наконец есть сам файл.

**6. Фикс без стража есть фикс в кредит — и теперь у этого правила есть инструмент.** Новое среди
опциональных tool-модулей: **`kaif-requirements-lint`** гоняет стоп-словарь по секциям требований
ваших планов, багов и идей. Он консультирует, а не блокирует. Остальные стражи, написанные в этой
версии, принадлежат машинерии истока и в ваше развёртывание не едут. Их вердикт другой: постоянный
песочный полигон, проверяющий машинерию установки и обновления, вырос до **14 сводов**, и каждый
новый страж там доказан красным на сломанной версии прежде, чем его зелёному поверили.

---

### 🎲 Интересные факты — во что обошлась эта версия

Замер на **2026-08-08 23:41 +03:00** (`node tools/kaif-stats.mjs --since
"2026-08-07T00:00:00+03:00"`), считано от момента, когда работа реально началась, а не от прошлого
тега:

- **2,0 календарных суток · 27,8 часа активной работы** — 137 коммитов, 185 файлов создано с нуля.
- **308 692 рукописных слова** прозы ≈ 3,9 романа, темп 11 115 слов в активный час.
- **2 867 007 579 токенов** ≈ 17 919 романов прочитано и написано заново; написано моделями ≈ 87 романов.
- Тот же объём руками человека: **813–2 034 человеко-часа** — пять инженеров на 20–51 рабочий день.
- Фактически оплачено: **≈ $16,51** (доля подписки). Та же работа по публичному API-прайсу: **$3 418**.

Блок держат три границы, а полная таблица живёт в
[README](https://github.com/MikalaiKryvusha/KAIF#85-интересные-факты--во-что-обошлась-версия-22).
Деньги — не счёт владельца, а оценка по API-прайсу. Человеко-часы — оценка с видимыми ставками.
Энергия — чужой замер других моделей, потому что Anthropic Вт·ч на токен не публикует.

---

### 📦 Установка

Положите [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) в корень проекта и
скажите агенту: *«Разверни KAIF из KAIF.md»*. Агент выполняет три шага бутстрапа, остальное делает
машинерия.

<sub>Установка по умолчанию привязана к origin. Развернуть без привязки к origin: добавьте
`--mode anonymous` к вызову загрузчика на третьем шаге.</sub>

### ⬆️ Обновление с 2.0 / 2.1

Попросите агента: `/kaif-update`. Обновление механическое и уважает каждую локальную правку. Право
заменить файл есть только у совпавшего template-sha. Вердикт судьи стал обязательным чекпоинтом —
без него `update-verify` не зелёный.
