# Дайджест судьи — шаги TK6а и TK5 версии KAIF 2.10 (лёгкий судья, сессия 89)

> **Судья:** Claude Opus 5.5 (сабагент `/fable-judge`, бриф `JUDGE_TK5_BRIEF.md`), 2026-10-18 09:21–09:35 +03:00.
> **Предмет:** коммиты `0c470be` (TK6а) и `67252b3` (TK5); заявления — `plans/136` (критерии 5–8 ✅, «6 из 20», решения `[ИИ]` 7–8, новая
> «Проверка» критерия 8), `plans/137` (TK5, TK6а), отчёты `testcases/reports/2026-10-18_tk6a-judge-caveats.md` и `…_tk5-questions-page.md`.
> **Тишина:** в истоке только читал; единственный созданный файл — этот. Скрипты судьи —
> `C:\Users\krinik\AppData\Local\Temp\claude\d--work-ai-sandbox-KAIF\7244d6cb-87e8-455f-a471-a7e1a6ca1a85\scratchpad\judge-tk5\` (дальше `<J>`);
> самопроверка и `--check` — только через `quietEnv()` из `tools/lib/sandbox-run.mjs`, на копиях `git archive`. `npm run test:core`,
> `tools/verify-contour.mjs`, `tools/review.mjs` не запускал; окон, звука, `KAIF_DIST` не было. Интервью развёртываний — только счётчики.
> Замечено, не моё: `git status` показывает `M EXPERIENCE.md` (+17 строк, файл записан 09:20:41 — до первой команды судьи 09:21:04;
> это главная сессия).

## Общий вердикт: **REFUTED — по одному пункту (охота 4)**; остальное VERIFIED / VERIFIED WITH CAVEATS

Все заявленные проверки воспроизводятся: самопроверка 142/142, мутанты M1–M4 краснеют каждый ровно на своём случае, пробы TK1/TK4 — как
заявлено, замер длины совпадает с дайджестом до знака (33 · 31 417 · 952 · 28 · 2322), чтец статуса сдвинул ровно названные документы,
счётчик «6 из 20» одинаков везде. **Опровергнуто одно:** у двери «выше» записанный остаток уже реального. В решении `[ИИ]` 8, в `plans/137`
TK5 и в отчёте TK5 §5 сказано: остаток — только «в шапке сайта» и английское «above», «v2.9 так же». На деле новый белый список пропускает
русские отсылки назад, которым v2.9 отказывала: 15 из 24 русских форм, придуманных судьёй; на копиях полей — около 8 настоящих отсылок
среди 69 снятых строк вопросов (снятых сравнений — около 60). В том числе пропускается «выше в документе»: этот пример стоит в самом
`plans/137` (строка 117) как часть белого списка. Обмен для владельца выгодный, но проверку ослабили шире тикета #147, и это нигде не
названо. **Малая починка:** дописать формы в `refBack` (ниже) или назвать остаток там, где он записан, — решение 8, `plans/137` TK5,
отчёт TK5 §5, строка реестра 2.11.

| # | Охота | Вердикт |
|---|---|---|
| 1 | Критерии 5–8: самопроверка + мутанты | **VERIFIED** |
| 2 | Переписанная «Проверка» критерия 8, безопасность фрейма | **VERIFIED WITH CAVEATS** |
| 3 | Регрессии чтеца статуса v2.9 → HEAD | **VERIFIED** |
| 4 | Дверь «выше»: настоящие отсылки и сравнения | **REFUTED** (остаток шире записанного; регресс без имени) |
| 5 | Длина вопроса: 750, код выхода, 952/28 | **VERIFIED WITH CAVEATS** |
| 6 | TK6а: гард 5v, §17 и ноты, пара «manager stop», зов `/release` | **VERIFIED WITH CAVEATS** |
| 7 | Стоячая ложь: «N из 20» | **VERIFIED** |
| 8 | Кириллица в теле EN-поставки | **VERIFIED** |

---

## Охота 1 — критерии 5–8 ✅: **VERIFIED**

Самопроверка контура HEAD (копия `git archive HEAD`, `quietEnv`):

```
$ node <J>/selftest.mjs        # 2026-10-18 09:22:51 → 09:23:00
  v TK5 #147: «чем выше …», «она выше.», «выше рыночной», «выше списка» stay silent; «формула выше», «в таблице выше», «выше указанный», «указанная выше» refuse
  v TK5 #142: a live question over 750 characters is named; a short one and an answered long one are silent; the door does not refuse it
  v CP #109/#121 R3: СНЯТО · перенесено · ЗАКРЫТО with a negation after it · WITHDRAWN — the document is closed, not in the owner queue
  v TK5 #109: 9 waiting heads wait and 7 closed, folded or merged lines close (a closed line carries its history; 🟠 «answers received» is no waiting mark)
  v TK5 #136: an html artifact is a page in a frame with no scripts and no same-origin, its source one click below, the hash over the raw bytes; markdown still renders
exit 0 · v 142 · x 0
contour selftest green: 142 checks (pre-flight red on the "options as paragraphs" fixture, three faces, records, showing)
```

Мутанты (проба сама зовёт самопроверку через `quietEnv`):

```
$ node tools/sandbox/probes/tk5-contour-mutants.mjs     # 09:21:04 → 09:21:51, exit 0
OK  control copy: 0 red line(s)
OK  M1 «выше» the 2.9 way: 1 red line(s) (expected exactly «TK5 #147»)
OK  M2 no leading waiting mark: 1 red line(s) (expected exactly «TK5 #109»)
OK  M3 length never named: 1 red line(s) (expected exactly «TK5 #142»)
OK  M4 html as markdown: 1 red line(s) (expected exactly «TK5 #136»)
✅ each TK5 change is red on its own selftest case only; the control copy is silent
```

Адресаты названы до прогона, в заголовке пробы; неприменившаяся правка считается BAD — адресность мутаций соблюдена. Критерий 5 я
проверил и по его «Действию» (`--check` на фикстурах судьи, v2.9 против HEAD, `quietEnv`):

```
$ node <J>/crit5-check.mjs
v2.9 · fixture a · exit 3 ·   В1: the question sends the owner OUTSIDE itself for its own content — «Чем выше риск, тем реже бросок. Медве
HEAD · fixture a · exit 0 · (no reference refusal)
HEAD · fixture b · exit 3 ·   В1: the question sends the owner OUTSIDE itself …          # + «Формула — см. выше.»
HEAD · fixture c · exit 0 · (no reference refusal)                                       # + «Как говорилось выше, берём B.» (охота 4)
```

Критерий 7, форма «закрытая со „не отвечено“», — старый случай `CP #109/#121 R3` (выше, зелёный). Строки «Проверка» 5–8 исполнены в
своём буквальном объёме. Широта функционального прогона — см. охоты 2 и 4.

## Охота 2 — переписанная «Проверка» критерия 8 и фрейм: **VERIFIED WITH CAVEATS**

- **Переписывание обосновано.** Ещё до кода тикет и план требовали «переключатель „исходник“» (`plans/137` TK5, исходная запись). Вид
  исходника — `<pre>` экранированным текстом, то есть `&lt;html` на странице неизбежен. Старая строка «нет `&lt;html`» противоречила
  самой заказанной форме. Обоснование стоит в коммите `67252b3` и в `plans/136`. **Оговорка формулировки:** «`srcdoc` *по определению*
  несёт HTML экранированным» — неправда. В значении атрибута в кавычках экранировать обязательно только `&` и `"`. Старая строка
  невыполнима из-за `<details><pre>`, а не по определению `srcdoc`.
- **Не слабее по смыслу.** Новая строка строже старой в главном: `srcdoc` после снятия экранирования побайтно равен файлу, хеш берётся по
  сырым байтам, абзаца `<p>&lt;` нет, сырого `<script` в теле нет, M4 «html как markdown» краснеет ровно этим случаем (охота 1). Снятие
  экранирования в случае (`&quot;` → `&lt;` → `&gt;` → `&amp;` последним) точно обращает `escapeHtml` ядра
  (`core.mjs:654`: `& < > "`).
- **Фрейм безопасен.** `review.mjs:553` — `<iframe class="artframe" sandbox="" referrerpolicy="no-referrer" srcdoc="…">`. Пустой
  `sandbox` без токенов: скриптов, same-origin, форм, всплывающих окон и навигации верхнего окна нет. CSP у страницы нет
  (`grep -n -i "Content-Security-Policy\|frame-src\|http-equiv" framework/tools/contour/review.mjs` → пусто), так что наследовать
  нечего. Остаточный риск мелкий: внешние картинки и стили из тела фрейм всё равно загрузит. Это исходящий артефакт самого агента.
- **Оговорка о ширине:** отрисовку в браузере не наблюдал никто. `grep -n -i "artframe\|format: html\|srcdoc" tools/verify-contour.mjs` →
  пусто, то есть заявленные «239/0» артефакт html не открывали. Отчёт TK5 честно ставит вердикт `partial`. Но ✅ критерия 8 («Страница
  показывает отрисованный HTML») держится на проверке строки, а не на наблюдении экрана.
- **Близнецы дайджеста выпали без записи:** HTML-макет на лице макета (`owner-talk.md`, #136, TWINS, +0,25 чата) и `format: text`/Slack
  (PARTIAL). Их нет ни в TK5 ✅, ни в остатке решения 8.

## Охота 3 — чтец статуса v2.9 → HEAD: **VERIFIED**

```
$ node <J>/status-all.mjs        # docStatus() из git archive v2.9 и HEAD, все interviews/*.md на диске
deployment #6 (26 docs): {"closed -> waiting":1}
deployment #13 (136 docs): {"none -> closed":23,"waiting -> closed":1}
documents 477 · transitions {"closed -> waiting":1,"none -> closed":23,"waiting -> closed":1}
```

Исток (48 документов) — 0 сдвигов. Все 24 сдвига в `closed` — головы «↪️ СВЁРНУТО …» (прочитаны поимённо в консоли, в дайджест не
перенесены). Единственный `closed → waiting` — та самая названная голова «🟡 РЕАЛИЗАЦИЯ …». Других закрытых, ставших открытыми, нет.
Разбивка по ведущему знаку:

```
$ node <J>/status-lead.mjs
✅+answered-word       {"closed->closed":270}
✅                     {"closed->closed":90}
↪                     {"none->closed":23,"waiting->closed":1}
🟠+answered-word      {"none->none":3}
🟠                    {"none->none":2}
🟡+answered-word      {"waiting->waiting":1}
🟡                    {"waiting->waiting":2,"closed->waiting":1}
🟢+answered-word      {"closed->closed":4}
(no line)             {"none->none":72}
```

Все сдвиги идут в задуманную сторону. 🟠 не стал ожиданием — 5 документов остались вне очереди, как и в v2.9. Замечание без вердикта:
живого «🟡 отвечено», которое v2.9 читала бы закрытым, на диске нет (единственное такое уже было `waiting`). Обратный случай #109 доказан
только фикстурой самопроверки.

## Охота 4 — дверь «выше»: **REFUTED** (остаток шире записанного)

Формы, придуманные судьёй (регулярка `PARSER.refBack` из `git archive` v2.9 и HEAD, флаг `iu`, как в `core.mjs:563`):

```
$ node <J>/refback-forms.mjs
v2.9 HEAD  — reference forms (expected REF):
  REF REF Берём приведённую выше таблицу?        REF REF Формула — см. раздел выше.     REF REF Выберите из списка выше.
  REF REF Подставьте значение в формуле выше.    REF REF Варианты перечислены выше.     REF REF Описанная выше схема — берём?
  REF REF Как сказано выше, берём B.             REF REF См. выше.                       REF REF Из таблицы 2 выше берём строку 3?
  REF --- Как говорилось выше, берём B.          REF --- Смотри выше: три варианта.     REF --- Как я писал выше, B дешевле.
  REF --- Выше в документе есть формула — какую берём?                                  REF --- Выше — три варианта; какой?
  REF --- В ответе выше я привёл цифры — согласны?                                      REF --- На картинке выше — макет; так?
  REF --- Код выше — оставить?                   REF --- По ссылке выше — договор; подписываем?
  REF --- В п. 3 выше — срок; ок?                REF --- Как обсуждали выше, берём A?   REF --- Как упоминалось выше, B лучше.
  REF --- Вариант A выше — берём?                REF --- Расчёт выше даёт 12 — верно?   REF --- Цифры выше — верны?
  REF REF The table above — do we take it?       REF REF As discussed above, B wins.    REF REF See above.
v2.9 HEAD  — comparisons (expected ---):
  REF --- Чем выше риск, тем дороже страховка — берём?   REF --- У вора атака выше.   REF --- Цена выше рыночной — берём?
  REF --- Не выше уровня героя.   REF --- 20 и выше — редкость.   REF --- Атака на 10 выше — берём?   REF --- Тем выше вероятность успеха.
  REF REF Вариант выше по цене, но надёжнее — берём?   REF REF Вариант 2 выше по цене — берём?   REF REF Текст выше нормы по длине — режем?
  REF REF Вопрос выше моей компетенции — решайте.      REF REF Строка выше по приоритету — так?   REF REF Цена выше указанной в договоре — платим?
  REF REF Порог выше названного вами — ок?   REF REF Пример выше среднего по качеству.   REF REF Список выше лимита в 20 пунктов — режем?
  REF REF Is a price above the market rate acceptable?   REF REF Risk above average — ok?   REF REF Should the logo sit above the title?
  --- --- Load above 80% takes B.
references passing: v2.9 0/27 · HEAD 15/27
comparisons refused: v2.9 19/20 · HEAD 12/20
```

(Вывод переложен в колонки для краткости; каждая строка — дословная пара «v2.9 HEAD» скрипта.)

Шов поставки — как заявлено:

```
$ node <J>/refback-field.mjs
dirs with documents 14 · documents 477
referenceProblems: refusals v2.9 23 · HEAD 0 · lifted 23 · new 0
raw sweep (every line with «выше», any date, answered too): lines 566 · refused by v2.9 and lifted by HEAD 357 · refused only by HEAD 1
$ node <J>/refback-stems.mjs
stem lines with «выше» (any date, answered too): 143 · refused by v2.9, lifted by HEAD 88 · refused only by HEAD 0
```

Что это значит:

- **Заявление «23 → 0, новых 0, снятые — все сравнения» верно**, но только в нынешнем объёме двери: живые вопросы в документах с датой не
  раньше `REFERENCES_SINCE`. В более широком объёме — все основы вопросов на диске, любой даты, отвеченные тоже — снято 69 уникальных
  строк. Глазами (в консоли) из них около 60 — сравнения, около 8 — **настоящие отсылки назад** формами из списка выше: скобочное
  «(выше)», «(п. N выше)», «блок „…“ выше», «замер выше», «по правилу выше», «ответил выше», «разбор — выше, в ВN». Это те формы, которые
  агенты полей пишут на деле. Следующий живой вопрос с такой формой дверь теперь пропустит.
- **Записанный остаток неверен.** Решение `[ИИ]` 8: «„в шапке сайта“ и английское пространственное „above“ — остаток двери». Отчёт TK5
  §5: «Остаток двери, не обещанный пунктом (v2.9 так же)». Сверх этого, без имени, появилась новая дыра: 15 из 24 русских ссылочных
  форм судьи отказывались в v2.9 и проходят в HEAD. Пример «выше в документе» назван в `plans/137:117` частью белого списка, а не
  реализован (словари `owner-talk-probes/cases.json` его тоже не несут). Класс — ослабленная проверка и заявление шире наблюдения.
- **Сравнениям всё ещё отказывает** форма «существительное + выше + мерило»: «вариант (2) выше по цене», «текст выше нормы», «вопрос
  выше компетенции», «цена выше указанной». В HEAD отказ получают 9 из 16 русских сравнений судьи. В полях такой формы нет (новых отказов 0), так что
  это остаток, а не регресс. Его тоже стоит назвать.
- **Английская ветка** не тронута — сказано честно. «above the market rate», «above average», «above the title» отказываются, как в
  v2.9. В решение 8 записано только пространственное «above»: сравнение «above average/the market rate» — тот же остаток, без имени.

**Малая починка** (любой из двух путей; оба — без новой машинерии):
(а) дописать в `refBack` скобочное `\(\s*выше\s*\)` и `выше\s*\)`; существительное с буквенным или числовым id (`(?:вариант|блок|пункт|п\.|В)\s*[\p{L}\d]+\s+выше`);
прошедшие формы глаголов (`говорил|писал|обсуждал|упоминал|разбирал|ответил`) и «смотри» перед «выше»; «выше\s+в\s+(?:документе|тексте)»;
«выше» в начале фразы перед `—`/`:`; существительные `ответ|отчёт|блок|врезк|ссылк|расч|замер|цифр|числ|картин|код|правил`. Проверить на
`<J>/refback-forms.mjs` и `refback-stems.mjs` (новых отказов сравнениям 0). Или (б) назвать этот остаток в решении 8, в `plans/137` TK5,
в отчёте TK5 §5 и строкой реестра 2.11 — `corrected:` по месту.

## Охота 5 — длина вопроса: **VERIFIED WITH CAVEATS**

- **Откуда 750.** Тикет #142, предложение 2: «A question's visible text (heading to answer field, comments removed) of the order of 750
  characters»; там же «HOUSE_RULES.md → п. 15 — the owner's standing rule: … ~750 visible characters» (`gh issue view 142 --repo
  MikalaiKryvusha/KAIF --json title,body,comments`). Дайджест `owner-talk.md:171` пишет «28 из 33 выше домашней нормы владельца этого же
  проекта (~750)». В коде — одна константа `core.mjs:594 export const QUESTION_CHARS_BUDGET = 750;`, других `750` в контуре нет.
  Решение 8 подписано `[ИИ]`, пересматривается словом владельца. Чисто.
- **Замер совпал с дайджестом до знака; код выхода не меняется** (копия полевого интервью #142 во временном корне; `--check` в `quietEnv`):

```
$ node <J>/length.mjs <полевое интервью #142>
budget constant 750 · live questions 33 · total 31417 · per question 952 · over budget 28 · max 2322
lengthWarnings(md) default budget → 28
== v2.9 · field copy · exit 0 · length warnings 0
== v2.9 · control doc · exit 0 · length warnings 0
== HEAD · field copy · exit 0 · length warnings 28
   first: ВНИМАНИЕ: в <id> 2322 знаков — больше бюджета 750; длинные вопросы владельца утомляют (origin #142): сожми до того, по чему он выбирает, или раздели развилку; страница всё равно откроется.
== HEAD · control doc · exit 0 · length warnings 0
```

  Дайджест: `OPEN questions 33 · total 31417 · per question 952 · over 750: 28` и `max 2322` — совпало.
- **Оговорки:**
  (1) Предупреждение печатает только `checkDoc()` (`review.mjs:1693`). Путь показа (`review.mjs <doc>` без `--check`) его не печатает.
  Заголовок критерия 6 «Перед показом» держится на том, что агент сначала зовёт `--check`. По «Действию» критерия это так.
  (2) Пункт 4 тикета («flags a question whose options are variants of more than one decision») и дайджест (`owner-talk.md:159` —
  «предупреждение … о смешанных развилках — в списке 2.10 (№146)») в TK5 не сделаны и в остаток не записаны.

## Охота 6 — TK6а: **VERIFIED WITH CAVEATS**

```
$ node tools/sandbox/probes/tk1-opening-red.mjs          # 09:21:51 → 09:22:01, exit 0
OK  guard 5v — control copy: 0 line(s) «5v:»
OK  guard 5v — the v2.9 guide and builder notes: 2 line(s) «5v:» (expected 2: the guide's rule, the 2.9 note)
OK  guard 5v — the judge's 5 rephrasings in framework/PHILOSOPHY.md: 5 line(s) «5v:» (expected 5)
$ node tools/sandbox/probes/tk4-manager-stop-red.mjs     # 09:22:01 → 09:22:09, exit 0
OK  «manager stop» pairs — control copy: 0 line(s)
OK  «manager stop» pairs — the v2.9 templates and guide: 6 line(s) (expected 6)
    - bundle lint (bugs/38): pair "manager stop ↔ the guide names the exception where it signs the author (wrapper)" broken — AGENT_GUIDE.md does not carry "исключение — стоп и закрытие от Менеджера"
$ node <J>/checkfw.mjs        # tools/check-framework.mjs на копии отслеживаемого дерева
exit 0
✅ check-framework OK — 59 embedded files (14 docs + 7 readmes + 37 skills + 1 tools), … dist OK (bundle 184 blocks, sha256 fresh, …)
```

- **Гард 5v** краснеет на пяти перефразировках, молчит на дереве (контроль — копия дерева; `check-framework` на копии — exit 0).
- **§17 и ноты.** §17 называет класс, а не формы: «says nothing about the opening, neither a prescription nor a ban, and the build refuses a
  shipped line that brings the prescription back — in its 2.9 wording or in the rephrasings the 2.10 judge tried against the guard». Звучит
  не запретом. Перечень форм остался только в комментарии `tools/check-framework.mjs:1033` (обвязка, не поставка). Цитата владельца
  сверена с тикетом #156: «не говорите, с чего ИИ агенту начинать, пусть он сам решает» (`gh issue view 156 … --json body,comments`). Старый
  обрывок — ноль попаданий: `git grep -n -i -E "do not start with my words|makes me furious" -- framework tools dist AGENT_GUIDE.md .claude` → пусто.
  Проверка критерия 3 (`grep -rniE "first words|opening it with|открыв ответ" framework/ AGENT_GUIDE.md .claude/skills/`) → пусто.
- **Пара обвязки «manager stop»** на месте: `AGENT_GUIDE.md:700` «… (исключение — стоп и закрытие от Менеджера …»; в поставке —
  `framework/AGENT_GUIDE.md:642`.
- **Зов `/release` обоих слоёв** согласуется с правилом руководства. Поставка: `framework/skills/release/SKILL.md` — «the turn's last call is
  `node .kaif/tools/contour/review.mjs --call "<what you need>"`, then the text», и то же в `framework/AGENT_GUIDE.md` → «Decisions the
  agent must NOT make alone» (строки 872–875). Обвязка: `tools/review.mjs --call` в `.claude/skills/release/SKILL.md` и в `AGENT_GUIDE.md` →
  «Решения, которые агент НЕ должен…» (строки 936–937). Пути различаются по слою, как и должны.
- **Оговорка (известный предел гарда-регулярки, заявлению не противоречит):** шесть новых перефразировок судьи проходят мимо 5v
  (`node <J>/g5v.mjs`): «Put the owner's words first in the reply.», «Begin by quoting the owner.», «Echo his words before answering.»,
  «Your first line repeats the owner's words.», «Open your answer by quoting what the owner wrote.», «Start your reply with the owner's
  quote.» — все `pass`. §17 теперь обещает ровно «2.9 wording or the rephrasings the 2.10 judge tried», так что это не ложь, а граница.
  Русский корневой `AGENT_GUIDE.md` (обвязка) гард не сканирует.
- `npm run test:core 28/28` по правилам тишины не перезапускал (UNVERIFIABLE). Лог главной сессии подтверждает время:
  `polygon1.log` 08:54:12 и `polygon2.log` 09:17:40 — «✅ sandbox suite: all 28 suites green»; `verify-contour2.log` 09:11:06 —
  «ИТОГ QA-прогона: 239 зелёных, 0 красных».

## Охота 7 — «N из 20»: **VERIFIED**

```
$ git grep -n -E "[0-9]+ из (19|20)\b" -- ':!PROJECT_HISTORY.md'
MASTER_PLAN.md:295: … мета-план `plans/136` — закрыто 6 из 20 (критерии 3 · 4 · 5 · 6 · 7 · 8; исправлено 2026-10-18 09:11 +03:00: стояло «2 из 20»; …
STATUS.md:42: … `plans/136` — закрыто 6 из 20 (исправлено 2026-10-18 09:11 +03:00: стояло «2 из 20») …
STATUS.md:49: … критерии 5–8 ✅ (6 из 20);
plans/136_EPIC_kaif_2.10.md:8: … закрыто 6 из 20 (критерии 3 ✅ … и 4 ✅ …; 5 · 6 · 7 · 8 ✅ 2026-10-18 09:11 +03:00, …
```

Строка 295 стоит в `MASTER_PLAN.md` § «8. Следующий шаг». Число одно везде. Множество {3, 4, 5, 6, 7, 8} = 6. Критерии 1 · 2 · 20 — 🔧,
не засчитаны. Каждая поправка записана по месту: «исправлено …: стояло …». Число верно по буквальному тексту критериев. Охота 4 ✅
критерия 5 не снимает: его «Результат» и «Проверка» исполнены. Но регресс двери — долг до судьи эпика TK6.

## Охота 8 — кириллица в теле EN-поставки: **VERIFIED**

```
$ node <J>/cyr.mjs        # добавленные строки git diff -U0 1efd9b7 67252b3 -- framework/tools/contour/
framework/tools/contour/core.mjs · added 32 · with Cyrillic 0
framework/tools/contour/review.mjs · added 50 · with Cyrillic 0
framework/tools/contour/texts.mjs · added 27 · with Cyrillic 19
HEAD framework/tools/contour/core.mjs · lines with Cyrillic: 0
HEAD framework/tools/contour/review.mjs · lines with Cyrillic: 0
```

`core.mjs` и `review.mjs`, которые судит гард 5d, кириллицы не несут: строки самопроверки — `\u…`-escape, комментарии — английские.
Кириллица `texts.mjs` законна: файл назван носителем данных (`tools/check-framework.mjs:47` — `'tools/contour/texts.mjs', // the RU
dictionary of the shipped contour …`). Его новые комментарии — английская проза с русскими примерами в «ёлочках», как и прежние
комментарии этого файла. Сборка на копии дерева — exit 0 (охота 6).

---

## Прочие охоты-гвардрейлы (коротко)

- **Правка проверок без обоснования** — нет: оба коммита несут блок «Обоснование правки проб/проверок».
- **Решение агента под видом слова владельца** — нет: решения 7–8 подписаны `[ИИ]`; 750 названо «нормой полевого владельца» со ссылкой на
  тикет.
- **Отчёты прогонов** — есть оба, с командами и моментами. Вердикт `partial` честен. Строки отзыва опыта (EXPERIENCE id) в отчётах нет —
  мелкая оговорка (EXP-0169 назван только в шапке пробы).

## Рекомендация

1. До судьи эпика (TK6) закрыть охоту 4 путём (а) или (б); при (б) — `corrected:` в решении 8, `plans/137` TK5, отчёте TK5 §5.
2. Записать в реестр 2.11 выпавших близнецов: HTML-макет на лице макета, `format: text`/Slack, предупреждение о смешанных развилках (#142
   п. 4), форму «существительное + выше + мерило», английское «above average».
3. В формулировке обоснования критерия 8 «по определению» заменить на «из-за вида исходника под фреймом».
