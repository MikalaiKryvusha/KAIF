<!--
  ⚠️ ЭТОТ ФАЙЛ — ТЕЛО СТРАНИЦЫ РЕЛИЗА, И В НЁМ АБЗАЦ ПИШЕТСЯ ОДНОЙ СТРОКОЙ.
  GitHub Releases сохраняет переводы строк (одиночный \n рендерится разрывом), поэтому врап
  «для читаемости в репозитории» превращается на публичной странице в рваный текст. Проверка
  перед публикацией: в файле не должно быть двух непустых строк подряд вне блоков кода и таблиц.

-->

<p align="center">
  <img src="https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/assets/KAIF_2.6_GitHub_LOGO.webp" alt="KAIF 2.6 Mindful KAIF" width="620">
</p>

> **Release date: 2026-09-06** · Minsk.

<a name="english"></a>
## English · [Русский](#русский)

**KAIF 2.6 — Mindful KAIF.** Nine tickets from four live projects arrived within a day of the 2.5 release, and the owner of the origin added four more words of his own during the two days this version took. Every one of them was about the same thing: the agent was working correctly on its own terms and wrong on the owner's — a question printed but never shown, a metric invented and then asked back, a "done" said about a clean stand while the owner's world was already broken, a proposal declared impossible instead of looked up, a fresh remark ranked above the plan, an answer written in the agent's codes. 2.6 turns each of those into a rule with a carrier: a fact the machinery records, a guard that goes red, a hunt the judge runs, a form the question must take.

What KAIF is and how to use it — the [README](https://github.com/MikalaiKryvusha/KAIF#english). This page is what is new in this version.

---

### ✨ What's new in 2.6

**1. A question to the owner is priority number one — and "shown" is now a fact.** The interactive contour records not only that a question exists and was answered, but that it was SHOWN — when and through which transport. The queue prints the age of every waiting document and puts the never-shown ones first, and the session rituals stop on them: a question the owner has never seen cannot be reported as "waiting" any longer (a field project had one printed by ~40 sessions over 48 days and shown by none). Every question and every answer option opens with a four-line scenario of what the owner will SEE — Situation · Action · Result · Check — in the customer's language; the technical explanation goes under it, never instead of it; the origin's questions guard reddens on a live question without the four lines.

**2. The delivery vector is derived, never asked.** The 2.5 delivery line sent the agents of four freshly updated projects to their owners to learn what to measure. In 2.6 the metric is a VECTOR the machinery derives from an optional registry of the product's logically separate systems (`SYSTEMS_REGISTRY.md`, drafted by the agent from the goal, the plan and both maps; the owner approves the list as vision): `node .kaif/kaif-core.mjs delivery` prints systems · complete % · integrated % · holes · contradictions · bugs, and every session close opens with that line. A mechanic that sends the agent to the project owner for a parameter it could derive is now a judge finding: such a mechanic is incomplete and does not ship.

**3. Update on the real route.** The rehearsal-binds-the-battle symmetry now reaches the bootstrap route that localized projects actually take: `install` accepts `--rehearsal <receipt>`, the loader refuses an unknown flag before it downloads anything, and `diff --source` and `update` see one and the same set of candidates. Skill fills the owner made (`<BUILD_COMMAND>`, `<TEST_HARNESS>`) are derived from disk and kept — a filled skill is no longer offered as a hand-merge every interval; stale version claims older than one version are named with their file and line; a KAIF ticket's delivery line is recognized in both legal forms and a refusal says exactly what to fix.

**4. Confusion is a research trigger, not a verdict.** An owner's proposal that seems to break the agent's model, rule or test is a proposal not yet understood. The order is the owner's: a web search for what he most likely meant → a measurement over his own data → a question in `interviews/` — and a message saying "your proposal breaks X" is not sendable without a `Recon:` block (query · found · measurement) next to it. The judge hunts a verdict delivered without recon; the origin's questions guard reddens on it.

**5. The interactive contour ships.** Four projects rebuilt the owner-review contour from prose and broke it on their own edge cases — the last one opened without radio buttons because the options were typed as paragraphs. 2.6 ships a one-page executable contract (`.kaif/INTERACTIVE_CONTOUR_SPEC.md`) and a generator of three faces — interview · proofreading · mockup review (`.kaif/tools/contour/`) — with a pre-flight that refuses to open a page whose question the owner could not answer, a self-test, and the shown fact from item 1 recorded on every page. `/owner-reviews` now says "run it", not "build it"; the origin runs its own delivery.

**6. A fresh word of the owner is not a top priority by itself.** A remark dropped in passing is recorded — the backlog, `/fix-vision` — and never ranked by its date. `/what-next` answers in a fixed form: the delivery metric and the main phase first, a step table where every row says what it moves or closes, a shelf "fresh owner words — not ranked by the metric", and a tech-debt line; a shipped lint reddens the draft that breaks the form, and the judge hunts recency ranked over metric.

**7. "Done" about production comes after the real world.** The agent verifies on a clean stand it built from nothing — a fresh browser, a clean checkout, a new user — and the owner's world is accumulated: an old session, a saved profile, his own edits, the cache of the previous build. Before the word "done" about anything already live, the report carries the difference line — accumulated · data and machine · path — and each item ends only in "verified on the real world" or "verified with real state taken from it"; "not verified there" is a stop that names what it waits for, never an outcome. The rule stands in the testing canon of both layers, as the third obligation of the fable loop, and as a judge hunt.

**8. The voice of the conversation is the customer's language.** The scenario form alone did not protect: an epic code typed into the Action line kept the form green — and the owner answered "your codes mean nothing to me". In option labels and scenario lines every named thing is now what the owner will see or get after it; codes, plan addresses, tool names and flags live only in the Check line and in a technical note under the scenario. The origin guards the class mechanically (epic codes read from the live meta-plan tables as data); the judge hunts owner text in agent vocabulary.

**9. Hygiene by the owner's word.** The delivery no longer names the projects it learned from — even under pseudonyms; the four places where a rule's meaning rests on the contrast of two independent projects are marked as kept sources, and a guard reddens on any other. The release pages of 2.2–2.4 point at live README anchors again, the double-encoded body of a field report was restored, and the repository carries the harness topics for search.

**10. The court sat before this page went out.** A registry of 77 claims this version makes about itself was re-executed by four judges with clean contexts, one cluster each: 66 confirmed as written, 10 weakened to what the evidence supports, one refuted — a closure line that quoted a grep count the file never had. Seventeen findings, all of them mechanical (a count, a line number, a literal against the tool's output), were fixed and re-executed before the release: the refuted claim by shipping the line the criterion promised, five plan literals by the numbers the tools print, the polygon runner by a help flag that no longer starts the whole run.

---

### 📦 Installation

Drop [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) into your project root and tell your agent in your own words — the [README](https://github.com/MikalaiKryvusha/KAIF#2-installation) carries the full installation procedure, the deployment modes and the language options.

Updating a deployed project: say *"update KAIF"* — the agent checks the origin, shows the delta and migrates respectfully, keeping your content. Four behaviours of the update changed in this version and the update task names each of them; the contour generator, the systems-registry skeleton and the two new lint modules arrive as optional files under `.kaif/`; nothing in this version asks the project owner for a parameter the framework derives.

---

<a name="русский"></a>
## Русский · [English](#english)

<p align="center">
  <img src="https://raw.githubusercontent.com/MikalaiKryvusha/KAIF/main/assets/KAIF_2.6_GitHub_LOGO.webp" alt="KAIF 2.6 Mindful KAIF — медальон команды из восьми ролей в кольце уробороса" width="620">
</p>

**KAIF 2.6 — Mindful KAIF.** Девять тикетов от четырёх живых проектов пришли за сутки после релиза 2.5, и владелец истока добавил четыре собственных слова за те два дня, что заняла версия. Все они об одном: агент работал правильно по своим меркам и неправильно по меркам владельца — вопрос напечатан, но не показан; метрика придумана и переспрошена у владельца; «готово» сказано о чистом стенде, когда мир владельца уже сломан; предложение объявлено невозможным вместо того, чтобы его поискать; свежая реплика поставлена выше плана; ответ написан кодами агента. 2.6 превращает каждое в правило с носителем: факт, который записывает машинерия, страж, который краснеет, охота судьи, форма, которую обязан принять вопрос.

Что такое KAIF и как им пользоваться — [README](https://github.com/MikalaiKryvusha/KAIF#russian). Эта страница — что нового именно в этой версии.

---

### ✨ Что нового в 2.6

**1. Вопрос владельцу — приоритет номер один, и «показан» теперь факт.** Интерактивный контур записывает не только, что вопрос есть и что он отвечен, но и что он ПОКАЗАН — когда и каким транспортом. Очередь печатает возраст каждого ждущего документа и ставит ни разу не показанные первыми, а ритуалы сессии на них останавливаются: вопрос, которого владелец никогда не видел, больше нельзя доложить как «ждёт» (в одном полевом проекте вопрос печатали ~40 сессий за 48 дней и не показали ни разу). Каждый вопрос и каждый вариант ответа открывается четырёхстрочным сценарием того, что владелец УВИДИТ — Ситуация · Действие · Результат · Проверка — на языке заказчика; техническое пояснение стоит под ним, никогда вместо него; страж вопросов истока краснеет на живом вопросе без четырёх строк.

**2. Вектор доставки выводится, а не спрашивается.** Строка доставки 2.5 отправила агентов четырёх обновившихся проектов спрашивать владельцев, чем мерить. В 2.6 метрика — ВЕКТОР, который машинерия выводит из опционального реестра логически обособленных систем продукта (`SYSTEMS_REGISTRY.md`; черновик составляет агент из цели, плана и обеих карт, владелец утверждает список как видение): `node .kaif/kaif-core.mjs delivery` печатает systems · complete % · integrated % · holes · contradictions · bugs, и каждое закрытие сессии открывается этой строкой. Механика, которая отправляет агента к владельцу проекта за параметром, который она может вывести сама, — теперь находка судьи: такая механика неполна и не отгружается.

**3. Обновление на реальном маршруте.** Симметрия «репетиция связывает бой» дошла до bootstrap-маршрута, которым идут локализованные проекты: `install` принимает `--rehearsal <расписка>`, загрузчик отказывает на неизвестном флаге до того, как что-либо скачал, а `diff --source` и `update` видят один и тот же набор кандидатов. Заполнения навыков, сделанные владельцем (`<BUILD_COMMAND>`, `<TEST_HARNESS>`), выводятся с диска и сохраняются — заполненный навык больше не предлагается к ручному мерджу каждый интервал; протухшие упоминания версии старше одной версии называются с файлом и строкой; строка доставки тикета о KAIF распознаётся в обеих законных формах, а отказ говорит, что именно поправить.

**4. Смущение — знак разведки, а не приговор.** Предложение владельца, которое как будто ломает модель, правило или тест агента, — предложение, ещё не понятое. Порядок — владельца: поиск в интернете того, что он скорее всего имел в виду → замер по его собственным данным → вопрос в `interviews/`; сообщение «ваше предложение ломает X» без блока `Разведка:` (запрос · нашёл · замер) рядом не отправляется. Судья охотится на вердикт без разведки; страж вопросов истока краснеет на нём.

**5. Интерактивный контур входит в поставку.** Четыре проекта строили контур согласований по прозе заново и ломали его на своих краевых случаях — последний открылся без радиокнопок, потому что варианты были набраны абзацами. 2.6 везёт одностраничный исполнимый контракт (`.kaif/INTERACTIVE_CONTOUR_SPEC.md`) и генератор трёх лиц — интервью · вычитка · отсмотр макетов (`.kaif/tools/contour/`) — с предполётом, который отказывается открывать страницу с вопросом, на который владелец не сможет ответить, селфтестом и фактом показа из пункта 1 на каждой странице. `/owner-reviews` теперь говорит «запусти», а не «построй»; исток ест свою поставку.

**6. Свежее слово владельца само по себе — не топ приоритета.** Реплика, брошенная мимоходом, записывается — беклог, `/fix-vision` — и никогда не ранжируется датой. `/what-next` отвечает фиксированной формой: метрика доставки и главная фаза первыми, таблица шагов, где каждая строка говорит, что двигает или закрывает, полка «свежие слова владельца — не ранжированы метрикой» и строка техдолга; отгружаемый линт краснит черновик, ломающий форму, а судья охотится на свежесть выше метрики.

**7. «Готово» о продакшене — после реального мира.** Агент проверяет на чистом стенде, который построил из ничего — свежий браузер, чистый чекаут, новый пользователь, — а мир владельца накоплен: старая сессия, сохранённый профиль, его собственные правки, кеш прошлой сборки. Перед словом «готово» о чём угодно, что уже в бою, отчёт несёт строку разности — накоплено · данные и техника · путь — и у каждого пункта только два исхода: «проверено на реальном» или «проверено с реальным состоянием, снятым с реального»; «не проверял» — стоп, который называет, чего ждёт, а не исход. Правило стоит в каноне тестирования обоих слоёв, третьим обязательством fable-цикла и охотой судьи.

**8. Голос беседы — язык заказчика.** Сценарная форма сама по себе не защищала: код эпика, вписанный в строку «Действие», оставлял форму зелёной — а владелец отвечал «твои коды мне ничего не говорят». В подписях вариантов и строках сценария каждая названная вещь теперь — то, что владелец увидит или получит после неё; коды, адреса планов, имена инструментов и флаги живут только в строке «Проверка» и в техническом примечании под сценарием. Исток стережёт класс механически (коды эпиков читаются из таблиц живых мета-планов как данные); судья охотится на текст владельцу словарём агента.

**9. Гигиена по слову владельца.** Поставка больше не называет проекты, у которых училась, — даже под псевдонимами; четыре места, где смысл правила держится на контрасте двух независимых проектов, помечены как сохранённые источники, а страж краснеет на любом другом. Страницы релизов 2.2–2.4 снова ведут на живые якоря README, двоекодированное тело полевого отчёта восстановлено, а у репозитория появились темы харнесса для поиска.

**10. Суд заседал до выхода этой страницы.** Реестр из 77 заявлений, которые версия делает о себе, переисполнен четырьмя судьями с чистыми контекстами, по кластеру на каждого: 66 подтверждены как написаны, 10 ослаблены до того, что держат улики, одно опровергнуто — строка закрытия цитировала счёт грепа, которого в файле никогда не было. Семнадцать находок, все механические (счёт, номер строки, литерал против вывода инструмента), починены и переисполнены до релиза: опровергнутое — поставкой строки, которую обещал критерий, пять литералов планов — числами, которые печатают инструменты, раннер полигона — флагом справки, который больше не запускает весь прогон.

---

### 📦 Установка

Положите [`KAIF.md`](https://github.com/MikalaiKryvusha/KAIF/blob/main/KAIF.md) в корень проекта и скажите агенту своими словами — полный порядок установки, режимы развёртывания и языковые опции несёт [README](https://github.com/MikalaiKryvusha/KAIF#2-установка).

Обновление развёрнутого проекта: скажите *«обнови KAIF»* — агент сверится с истоком, покажет дельту и мигрирует уважительно, сохранив ваше. Четыре поведения обновления в этой версии изменились, и задание обновления называет каждое; генератор контура, скелет реестра систем и два новых линт-модуля приезжают опциональными файлами в `.kaif/`; ничто в этой версии не спрашивает у владельца проекта параметр, который фреймворк выводит сам.
