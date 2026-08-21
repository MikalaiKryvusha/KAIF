<!--
  ⚠️ ЭТОТ ФАЙЛ — ТЕЛО СТРАНИЦЫ РЕЛИЗА, И В НЁМ АБЗАЦ ПИШЕТСЯ ОДНОЙ СТРОКОЙ.
  GitHub Releases сохраняет переводы строк (одиночный \n рендерится разрывом), поэтому врап
  «для читаемости в репозитории» превращается на публичной странице в рваный текст. Проверка
  перед публикацией: в файле не должно быть двух непустых строк подряд вне блоков кода и таблиц.
-->

> **Release date: 2026-08-21** · Minsk.

<a name="english"></a>
## English · [Русский](#русский)

**KAIF 2.3 — Subjected KAIF.** The version that was put on trial before it was allowed to ship. Everything 2.3 claims about itself was re-executed by an adversarial court — command by command, mutation by mutation — and the five defects the court found were fixed before this page went public. The name is the method: the framework is now subject to its own judgement, and to the field that files issues against it.

This version was born from the field: thirteen issues filed by agents of live projects became two epics. What KAIF is and how to use it — the [README](https://github.com/MikalaiKryvusha/KAIF#english). This page is what is new in this version.

---

### ✨ What's new in 2.3

**1. The canon speaks in commands now.** Four field issues hit the same point from different projects: a weak model executes a command, a numbered step or a checkbox — and skips prose, however wise. So the rule itself went into the canon: an obligation carries one of the three executable forms, prose stays as the rationale under it. `TESTING_FRAMEWORK.md` was rebuilt around a testing-activities chain — basis, design techniques, documentation, execution with statuses, defect form — and a `[TESTED]` mark on a feature is legal only next to a written set of cases. `REQUIREMENTS_FRAMEWORK.md` gained a writing checklist. A test-case template ships in the delivery.

**2. Lessons refuse to be prose.** A recorded lesson that later repeats is a lesson that failed as text. `/experience` now opens with the mechanization question — can this trap be removed, or guarded, instead of remembered? Every new record carries one of three outcomes, and the `experience-lint` guard holds the form: a trap-shaped lesson without a mechanization answer does not pass.

**3. The update survives being killed.** `update` writes a journal before its first mutation; a run killed midway no longer leaves a half-updated tree without traces, and the new `resume` command finishes what the dead run started. Alongside it in the lifecycle machinery: wiring `kaif:*` scripts splices the owner's `package.json` byte-exact instead of reserializing it; the anonymous→origin transition is an explicit written step; a bare `github.com/owner/repo` in `--source` resolves to release assets; `--lang Russian` gets a code hint instead of a silent English tree; the final install line counts what landed on the DISK, not what the plan promised.

**4. One error, not two, on Windows.** A failed network call used to be dressed in a libuv assertion on top of the real message. The class is closed: after the first network call the machinery never calls a hard exit — it sets the exit code and lets the loop drain. Reproduced 5/5 on a live machine, cured 0/3, and the lesson ships as a guard in the polygon.

**5. Eight language packs are frozen — and the freeze is pinned.** Only `ru` and `en` are maintained; the other eight are frozen with an explicit declaration — version, state, reason, revival on community request — carried by the README, the reference and the install line itself. The `lang-packs-guard` pins the frozen packs byte-exact, holds a volume floor on the live Russian pack and pins 35 English skill descriptions against silent rot.

**6. The court is now part of the release.** Before this page was published, a 47-claim registry of everything 2.3 says about itself went through re-execution: suites re-run, guards re-broken on copies, measures re-taken. Five findings survived the skeptic panel and were fixed pre-release — among them a private project name in delivery comments (now a commit gate refuses such a commit) and a snapshot tool that silently wrote real names when its alias map was missing (now it refuses to run without one). The scaffolding measure is printed honestly: +2 tools and +742 lines this version — the price of guards for field-paid classes; mass reduction is the mandate of the next one.

---

### 🎲 Interesting facts — what this version cost

The window: after the v2.2 release (2026-08-09) through 2026-08-21, numbers printed by `node tools/kaif-stats.mjs`.

- **68 commits · 11.6 calendar days** — 81,852 words of prose and 2,063 lines of code written into the repository.
- The models processed **601 million tokens** across 1,732 requests in 5 sessions.
- The same work by industry rates: **≈ 1,266 man-hours** — prose at a technical writer's pace, code at Capers Jones' rate.
- At Anthropic's public API prices this volume of work would cost **≈ $948**; the work ran on a Claude Max subscription.

---

### 📦 Installation

Drop [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) into your project root and tell your agent in your own words — the [README](https://github.com/MikalaiKryvusha/KAIF#-quick-start) carries the full quick start, the deployment modes and the language options.

Updating a deployed project: say *"update KAIF"* — the agent checks the origin, shows the delta and migrates respectfully, keeping your content. If the run dies midway, say *"resume the KAIF update"*.

---

<a name="русский"></a>
## Русский · [English](#english)

**KAIF 2.3 — Subjected KAIF.** Версия, которую судили до того, как выпустить. Всё, что 2.3 говорит о себе, переисполнено адверсарным судом — команда за командой, мутация за мутацией — и пять найденных судом дефектов починены до публикации этой страницы. Имя и есть метод: фреймворк теперь подсуден собственному суду — и полю, которое подаёт против него issues.

Версия родилась из поля: тринадцать issues от агентов живых проектов стали двумя эпиками. Что такое KAIF и как им пользоваться — [README](https://github.com/MikalaiKryvusha/KAIF#русский). Эта страница — что нового именно в этой версии.

---

### ✨ Что нового в 2.3

**1. Канон заговорил командами.** Четыре полевых issue из разных проектов били в одну точку: слабая модель исполняет команду, нумерованный шаг или чекбокс — а прозу, какой бы мудрой она ни была, пропускает. Поэтому в канон вошло само правило: обязательство несёт одну из трёх исполнимых форм, проза остаётся обоснованием под ней. `TESTING_FRAMEWORK.md` перестроен вокруг цепочки тестовых активностей — базис, техники проектирования, документация, исполнение со статусами, форма дефекта — и маркер `[TESTED]` на фиче легален только рядом с написанным набором кейсов. В `REQUIREMENTS_FRAMEWORK.md` появился чек-лист письма. Шаблон тест-кейсов входит в поставку.

**2. Уроки отказываются быть прозой.** Записанный урок, который потом повторился, — урок, проваленный как текст. `/experience` теперь открывается вопросом механизации: можно ли эту ловушку убрать или застеречь, а не запоминать? Каждая новая запись несёт один из трёх исходов, а страж `experience-lint` держит форму: урок в форме ловушки без ответа о механизации не проходит.

**3. Обновление переживает своё убийство.** `update` пишет журнал до первой мутации; прогон, убитый на середине, больше не оставляет полуобновлённого дерева без следов, а новая команда `resume` доводит начатое мёртвым прогоном. Рядом в машинерии жизненного цикла: проводка скриптов `kaif:*` сплайсит `package.json` владельца байт-в-байт вместо пересериализации; переход anonymous→origin — явный записываемый шаг; голый `github.com/owner/repo` в `--source` резолвится в релизные ассеты; `--lang Russian` получает подсказку кода вместо молчаливого английского дерева; финальная строка установки считает то, что легло на ДИСК, а не то, что обещал план.

**4. Одна ошибка, а не две, на Windows.** Упавший сетевой вызов раньше одевался в libuv-ассерцию поверх настоящего сообщения. Класс закрыт: после первого сетевого вызова машинерия не зовёт жёсткий выход — ставит код выхода и даёт циклу стечь. Воспроизведено 5/5 на живой машине, вылечено 0/3, и урок едет стражем в полигоне.

**5. Восемь языковых пакетов заморожены — и заморозка запинена.** Ведутся только `ru` и `en`; остальные восемь заморожены с явным объявлением — версия, состояние, причина, оживление по запросу сообщества — на README, в справочнике и в самой строке установки. Страж `lang-packs-guard` пинит замороженные пакеты побайтно, держит пол объёма живого русского пакета и 35 английских описаний навыков против тихого протухания.

**6. Суд стал частью релиза.** До публикации этой страницы реестр из 47 заявлений — всего, что 2.3 говорит о себе, — прошёл переисполнение: своды перегнаны, стражи переломаны на копиях, замеры сняты заново. Пять находок пережили панель скептиков и починены до релиза — среди них приватное имя проекта в комментариях поставки (теперь такой коммит останавливает гейт) и инструмент слепка, молча писавший настоящие имена без карты псевдонимов (теперь без карты он отказывается работать). Замер лесов напечатан честно: +2 инструмента и +742 строки за версию — цена стражей на оплаченные полем классы; сокращение массы — мандат следующей версии.

---

### 🎲 Интересные факты — чего стоила эта версия

Окно: после релиза v2.2 (2026-08-09) по 2026-08-21, числа печатает `node tools/kaif-stats.mjs`.

- **68 коммитов · 11,6 календарных суток** — 81 852 слова прозы и 2 063 строки кода написаны в репозиторий.
- Модели обработали **601 миллион токенов** за 1 732 запроса в 5 сессиях.
- Та же работа по отраслевым ставкам: **≈ 1 266 человеко-часов** — проза темпом технического писателя, код по ставке Кейперса Джонса.
- По публичным ценам API Anthropic этот объём работы стоил бы **≈ $948**; работа шла по подписке Claude Max.

---

### 📦 Установка

Положите [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) в корень проекта и скажите агенту своими словами — полный быстрый старт, режимы развёртывания и языковые опции несёт [README](https://github.com/MikalaiKryvusha/KAIF#-быстрый-старт).

Обновление развёрнутого проекта: скажите *«обнови KAIF»* — агент сверится с истоком, покажет дельту и мигрирует уважительно, сохранив ваше. Если прогон умер на середине — скажите *«продолжи обновление KAIF»*.
