<p align="center">
  <img src="https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/assets/KAIF_2.2_GH_RELEASE_PAGE_LOGO.jpg" alt="KAIF 2.2 — Yolden KAIF" width="620">
</p>

> **Release date: 2026-08-08** · Minsk.

<a name="english"></a>
## English · [Русский](#русский)

**KAIF 2.2 — "Yolden KAIF."** A very large-scale version, the one that endows KAIF with the power of
an intelligent system that develops itself through a feedback loop. The ouroboros stands for the
closing of the loop and for completeness; the eye stands for KAIF now being under the observation of
the projects that use it — and those projects being under the observation of KAIF. Every cycle
closes, the metaphorical ones and the technical ones alike.

Built on 2.1 "Strong KAIF" and grown out of the field: four park updates with reports (NDim,
Unliminium, KLAS, KrinikCam) became five epics and twelve tasks. What KAIF is and how to use it —
the [README](https://github.com/MikalaiKryvusha/KAIF#english). This page is only the delta.

---

### ✨ What's new in 2.2

**1. The interactive contour — questions to the owner became a working channel, not a hope.** The
place of questions was a rule in 2.1; in 2.2 it is machinery. Interviews and drafts render as local
self-contained pages, decisions are recorded in one click, an unanswered question is a debt the agent
carries, and a `--notice` call delivers a *message* — it calls, but waits for no answer. A guard
(`questions-guard`) refuses to stay green while a live question has fewer than two parsable options:
a question a human cannot click is not a question.

**2. The feedback loop was closed both ways.** A field agent that spots a defect in the methodology
itself now has five prescribed steps instead of goodwill: prove the class, fix it locally, file the
signal upstream, mark the local remediation in the ticket, close the lesson at home. Field reports
became an obligation of the update ritual, `reports/` ships as a knowledge directory, and the
standing order is written down: bring KAIF methods that are *battle-tested in production*, and
recommend dropping what does not work.

**3. `REQUIREMENTS_FRAMEWORK.md` — the 14th key document.** Requirements are the earliest testing
there is. Ten quality criteria with ISO/IEC/IEEE 29148 anchors, EARS patterns, a grep-lintable
stop-dictionary of unverifiable words, and the fit-criterion formula (Scale · Meter · Target). Every
goal document — plan, epic, bug, idea — now opens with a **goal vector** and **acceptance criteria**;
a plan without them is speculation. A document-header norm and two linters keep the form honest.

**4. Fresh context stopped being a promise.** Rules read once at session start melt as the context
fills. So re-reading became a verifiable act: four triggers, a machine-readable witness marker, and
an acceptance quote in the chat — a marker without a quote is fraud of the same class as a false
`[TESTED]`. An optional **`refresh-hooks`** module ships for systems with lifecycle hooks (an order
to re-read after compaction, a marker-age timer, a soft STATUS guard), plus hook configs for other
agent systems taken from live vendor docs, and an **environment dossier** — the agent learns its own
machine from its own probes instead of remembering it.

**5. The `/go` kick, and eleven more tasks.** `/kaif-go` (alias `/go`) resumes started work without
an exchange of "shall I continue?" — it understands "дальше", "continue", "next". Alongside it:
the timestamp canon (a decision mark carries the date **and** the time), the `EPIC` naming
convention with a guard, a revision of `/code-revision` with an audit-report contract, "code before
cognition" as a principle (80 % determinism / 20 % AI), the test suite as an obligation of the work
that produced it, origin tracking as the install default, the restored definition of what KAIF *is*,
and KAIF's own **`AUTHOR_STYLOMETRY.md`** — the origin of the canon file name finally has the file.

**6. Guards, because a fix without a guard is a fix on credit.** New in the toolbox: a live-number
counters guard across 26 mirrors (prose counters go stale silently — this project paid for that class
twice), a unique-by-construction temp root for parallel runs, a mute-command guard for the sandbox
suites, a document-header linter, a stylometry snapshot generator with a privacy-by-default gate, and
a release chronicle statistics tool. The permanent sandbox polygon grew to **14 suites**.

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

**KAIF 2.2 — «Yolden KAIF».** Очень масштабная версия, наделяющая KAIF силой самостоятельно
развивающейся по циклу обратной связи умной системы. Уроборос символизирует замыкание цикла и
совершенство, глаз символизирует то, что KAIF теперь под наблюдением проектов, которые им
пользуются, а проекты, которые им пользуются, — под наблюдением KAIF. Все и метафорические, и
технические циклы замыкаются.

Версия выросла из поля: четыре обновления парка проектов с отчётами (NDim, Unliminium, KLAS,
KrinikCam) стали пятью эпиками и двенадцатью задачами поверх 2.1 «Strong KAIF». Чем KAIF является и
как им пользоваться — [README](https://github.com/MikalaiKryvusha/KAIF#russian). Эта страница —
только дельта.

---

### ✨ Что нового в 2.2

**1. Интерактивный контур — вопросы к владельцу стали каналом, а не надеждой.** В 2.1 место вопросов
было правилом; в 2.2 это машинерия. Интервью и черновики рендерятся локальными самодостаточными
страницами, решение фиксируется в один клик, неотвеченный вопрос становится долгом агента, а вызов
`--notice` доставляет *сообщение* — зовёт, но ответа не ждёт. Страж (`questions-guard`) не зеленеет,
пока у живого вопроса меньше двух разобранных вариантов: вопрос, который человеку нечем нажать, — не
вопрос.

**2. Петля обратной связи замкнута в обе стороны.** У полевого агента, заметившего дефект в самой
методологии, теперь пять предписанных шагов вместо доброй воли: докажи класс, почини локально, заведи
сигнал в исток, укажи в тикете локальную починку, замкни урок у себя. Полевой отчёт стал
обязательством ритуала обновления, `reports/` едет директорией знаний, а стоячее распоряжение
записано прямо в канон: приносить в KAIF методики, **проверенные боем в продакшене**, и рекомендовать
отказ от того, что не работает.

**3. `REQUIREMENTS_FRAMEWORK.md` — 14-й ключевой документ.** Требования — самое раннее тестирование
из существующих. Десять критериев качества с якорями в ISO/IEC/IEEE 29148, паттерны EARS,
греп-линтуемый стоп-словарь непроверяемых слов и формула критерия приёмки (Scale · Meter · Target).
Каждый целевой документ — план, эпик, баг, идея — открывается **вектором цели** и **критериями
приёмки**; план без них — спекуляция. Форму держат норма шапки-меты и два линтера.

**4. Свежий контекст перестал быть обещанием.** Правила, прочитанные один раз на старте сессии, тают
по мере заполнения контекста. Поэтому перечитывание стало проверяемым действием: четыре триггера,
машиночитаемый маркер-свидетельство и цитата-приёмка в чате — маркер без цитаты есть фрод того же
класса, что ложный `[TESTED]`. В поставке — опциональный модуль **`refresh-hooks`** для систем с
lifecycle-хуками (приказ перечитать после сжатия, таймер возраста маркера, мягкий страж STATUS),
хук-конфиги под остальные агентские системы, снятые с живых вендорских доков, и **досье окружения** —
агент знает свою машину из собственных проб, а не из памяти.

**5. Пинок `/go` — и ещё одиннадцать задач.** `/kaif-go` (алиас `/go`) возобновляет начатую работу без
обмена репликами «продолжать ли» — он понимает «дальше», «продолжай», «continue». Рядом с ним: канон
временных меток (метка решения несёт И дату, И время), конвенция имён `EPIC` со стражем, ревизия
`/code-revision` с контрактом аудит-отчёта, «код прежде когниции» принципом (80 % детерминизма /
20 % ИИ), test suite как обязательство работы, которая его породила, origin как дефолт установки,
восстановленное определение того, чем KAIF является, и собственная **`AUTHOR_STYLOMETRY.md`** — у
истока канон-имени наконец есть сам файл.

**6. Стражи — потому что фикс без стража есть фикс в кредит.** Новое в наборе: страж счётчиков по
26 зеркалам с живыми числами (проза протухает молча — этот класс проект оплатил дважды), уникальный по
построению временный корень прогона, страж немых команд полигона, линтер шапки документов, генератор
слепка стилометрии с приватностью по умолчанию и инструмент летописной статистики релиза. Постоянный
песочный полигон вырос до **14 сводов**.

---

### 📦 Установка

Положите [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) в корень проекта и
скажите агенту: *«Разверни KAIF из KAIF.md»*. Агент выполняет три шага бутстрапа, остальное делает
машинерия.

<sub>Установка по умолчанию привязана к origin. Развернуть без привязки к origin: добавьте
`--mode anonymous` к вызову загрузчика на третьем шаге.</sub>

### ⬆️ Обновление с 2.0 / 2.1

Попросите агента: `/kaif-update`. Обновление механическое и уважает каждую локальную правку; право
заменить файл есть только у совпавшего template-sha. Вердикт судьи стал обязательным чекпоинтом —
без него `update-verify` не зелёный.
