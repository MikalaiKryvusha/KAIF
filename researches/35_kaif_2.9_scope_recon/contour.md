# Разведка 2.9 — группа contour: #123 · #124 · #125 · #126 · #127 · #128

> **Прочитано:** 2026-09-28 17:15 UTC (`date` → `Mon Sep 28 17:15:13 UTC 2026`), тикеты из `scratchpad/issues/<N>.md` (тело и все
> комментарии; у #127 и #128 по 2 комментария, учтены). **HEAD** `52f688c`; `framework/` и `tools/` равны `v2.8`.
> **Пробы:** копия `framework/` в `mktemp -d` (`/tmp/tmp.T8XP6f18bw`), импорт `core.mjs`/`review.mjs`/`texts.mjs` node-скриптами.
> Сервер не поднимался, браузер и звук не запускались. Импорт без побочных эффектов проверен: у `core.mjs`/`texts.mjs` на верхнем
> уровне только `const`/`function`; `review.mjs:2219` `if (import.meta.url === pathToFileURL(resolve(process.argv[1] || '')).href) main();`.
> Скрипты проб лежат в `scratchpad/recon/contour-probes/` (`p123*.mjs` … `p28.mjs`). `git status --short` в `/home/user/KAIF` после работы пуст.

## Класс группы: исток судит поставку в своей обвязке

У всех шести тикетов дыру поставки закрывает среда истока, а поле её видит.

| Тикет | Что прикрывает дыру у истока | Что видит поле |
|---|---|---|
| #126 | Рукописный `.gitignore` истока (`.gitignore:45`, `:17`) | Набор ignore-first поставки без этих строк |
| #124 | Страж `tools/questions-guard.mjs`, который живёт только в обвязке | Канон поставки говорит «guarded mechanically», а исполнителя в поставке нет |
| #128 | Приёмка `verify-contour` подаёт синтетический `pointerdown` без `click` | Настоящее нажатие не снимает выбор |
| #123, #127 | Селфтест-фикстуры написаны формами истока (одна строка, `- **A)**`) | Живой корпус с переносами строк и формой `- **A:**` |
| #125 | Сторож OW6 проверен на исчезнувшем замке | Замок, оставленный мёртвым сервером |

Исток сам платит по #123: 12 из 43 его страниц интервью показывают сырые `**`. По #128 он платит той же страницей.

---

### #123 — рендер контура построчный: `<p>` на каждую строку, жирный через перенос остаётся сырыми `**`, вариант с переносом отклоняет самопроверка

- **Суть:** `renderMd` выдаёт `<p>` на каждую строку источника, а `<li>` только на первую строку пункта. Жирный, перешедший
  через перенос, остаётся сырыми `**`. Законный вариант `- **A) (recommended)** **Title that wraps\n  onto the next line.**`
  отклоняется самопроверкой страницы (exit 3). В NDim отклонено 16 из 105 интервью.
- **Сверка с HEAD:**
  1. «`renderMd` pushes `'<p>' + inline(line) + '</p>'` for EVERY line and `<li>` for the first line of an item only» —
     **CONFIRMED**. Код: `framework/tools/contour/core.mjs:568` `if (line.trim()) out.push('<p>' + inline(escapeHtml(line)) + '</p>');`,
     `:566` `if (li) { if (!listOpen) { out.push('<ul>'); listOpen = true; } out.push('<li>' + inline(escapeHtml(li[1])) + '</li>'); continue; }`.
     С цитатой то же: `:563` — каждая строка `>` становится своим `<p>`. Проба `node p123.mjs`:
     ```
     IN : "a **b\nc** d"
     OUT: "<p>a **b</p>\n<p>c** d</p>"
     IN : "- **A)** text **bold across\n  the wrap** end"
     OUT: "<ul>\n<li><strong>A)</strong> text **bold across</li>\n</ul>\n<p>  the wrap** end</p>"
     IN : "> quoted line one\n> quoted line two"
     OUT: "<blockquote>\n<p>quoted line one</p>\n<p>quoted line two</p>\n</blockquote>"
     ```
  2. Законный вариант с переносом отклоняется — **CONFIRMED**. HTML варианта собирается через `renderMd(o.text)`
     (`framework/tools/contour/review.mjs:506`). Проверка — `:687`
     `const labelsOk = !(page.html.match(/<label class="opt[^"]*">[\s\S]*?<\/label>/g) || []).some((l) => l.includes('**'));`.
     Форму узаконивают спецификация `framework/templates/_interactive-contour-spec.md:14` («a parenthesised note after the letter
     is legal») и шаблон `framework/skills/interview/SKILL.md:63` `- **A) (recommended)** <the option distilled …>`.
     Проба `node p123b.mjs`: ru-проект в копии, два интервью — одно с переносом, другое без. Вызов `gateForOpen`:
     ```
     interviews/interview_001_wrap.md → ["PAGE SELF-CHECK FAILED (spec §2, exit 3): radio groups 1 for 1 question(s) with options; an option label carries raw markdown (**) — a broken page is never shown silently."]
       optA html: "<p><strong>A) (recommended)</strong> **Title that wraps</p>\n<p>  onto the next line.**</p>"
     interviews/interview_002_nowrap.md → null
     ```
  3. «16 refused» из 105 — **NOT-VERIFIABLE-HERE**: корпуса NDim на диске нет. Аналог на корпусе истока — проба `node p123c.mjs`
     по копии `interviews/`: `{ n: 43, refusedLabels: 0, refusedOther: 0, pagesWithRawBold: 12 }`. Отказов у истока нет (вопросы
     отвечены), но на 12 страницах владелец видит сырые `**`. Пример (`p123d.mjs`):
     `interview_005_kaif_2.1.md : 2 : <p>Рекомендация из  §10: **B (фиксы обновления — поле горит) → A (дисциплина</p>`.
     Страница истока строится тем же генератором: `tools/review.mjs:32` `export * from '../framework/tools/contour/review.mjs';`.
  4. Локальная починка NDim (+24 −9, селфтест 111) — **NOT-VERIFIABLE-HERE** (это поле).
- **Класс:** рендер и парсер контура режут текст по `\n`, а единица markdown — абзац. Самопроверка §4 судит результат рендера,
  поэтому построчный рендер превращает законную форму в отказ двери.
  `TWINS: searched "renderMd(" in framework/tools/contour/review.mjs — found 7:` `:500` (проза карточки), `:506` (варианты),
  `:524` (тело документа), `:531` (исходящие артефакты), `:571` (notice), `:586` (вычитка: абзац из `splitParagraphs` склеен, но
  рендер снова режет его по строкам), `:635` (очередь).
  Близнец в парсере: ответ владельца, перенесённый на вторую строку, читается только первой строкой — `core.mjs:279` `text = nl; break;`.
  Проба `node p123e.mjs` → `[{"line":4,"text":"B) — берём второй, но с условием: сначала","followUp":false}]`. На странице
  отвеченного вопроса (`review.mjs:507` `existing`) владелец видит обрубок.
- **Кто платит сейчас:** владелец лично — каждая страница с переносами строк рубится на куски, у истока таких 12 из 43. Полевые
  проекты — законная форма отклоняется, и дешёвое лечение агента переписывает источник владельца. **S2.**
- **Форма починки:** в `renderMd` — буферы абзаца, пункта списка и цитаты: строки склеиваются через `\n` до `inline()`, а заборы,
  таблицы, заголовки и `---` сбрасывают буферы. В `finishQuestion` текст ответа — все строки до пустой строки или метки.
  Проверка: фикстуры селфтеста (жирный через перенос в абзаце, в варианте с продолжением, в цитате; ответ в две строки) и мутант
  «буфер снят» — красный; прогон по копии корпуса истока: 12 → 0 страниц с `**`; эталон `tools/verify-contour.mjs` пересмотреть
  глазами. **≈ 0,5 чата.**
- **Пересечения:** `ideas/31` — прямых нет. #127 — тот же узел парсера и рендера, другой механизм. Открытые `bugs/` — нет.
- **Слова владельца:** нет.

### #124 — дверь контура пропускает вопрос, который отсылает владельца наружу («см. выше», «в разделе», «§3»)

- **Суть:** канон требует, чтобы предмет решения лежал внутри вопроса, но пре-флайт поставки такие вопросы не стережёт. Тикет
  предлагает третью ось двери: словарь ссылок назад и вбок из языкового пакета, exit 3, маркер `<!-- ref-ok: <reason> -->`.
  Обёртка проекта обходится прямым вызовом `review.mjs`.
- **Сверка с HEAD:**
  1. «The canon states the rule … but the shipped door does not guard it» — **CONFIRMED**. Поставочное руководство:
     `framework/AGENT_GUIDE.md:948` `A reference INSTEAD of the content is the defect, and it is guarded mechanically.`; `:931–932`
     «Exactly one mechanical half exists and it is named: questions to the owner are guarded by the questions-guard axis "a question
     that dispatches into a document".»
     Исполнитель этой оси есть только у истока (`tools/questions-guard.mjs`), в поставку он не едет.
     `grep -rn "questions-guard" framework/ | grep -v "questions-guard:no-scenario"` находит только упоминания в прозе:
     `AGENT_GUIDE.md:894/910/932`, `owner-reviews/SKILL.md:457` (роль, которую проект строит сам по C1), `interview/SKILL.md:130/147/224`,
     `fable-judge/SKILL.md:57/74`.
     Пре-флайт поставки знает две оси — `core.mjs:482–494` (варианты и археология). Проба `node p124.mjs`:
     ```
     см. выше           → preflight problems: 0
     see above          → preflight problems: 0
     goals in plans/    → preflight problems: 0
     ```
  2. Ось истока ловит класс тикета только частично — **PARTIAL**: `tools/questions-guard.mjs:355` `return SEND_VERB.test(l) && DOC_REF.test(l);`.
     Ей нужен адрес документа (`:352` `DOC_REF` = `plans|bugs|ideas|…/` или `` `x.md` ``). «Формула выше», «§3», «в шапке» без
     адреса проходят и у истока.
  3. «Russian pattern in use here for 6 weeks» и тест с мутантом в поле — **NOT-VERIFIABLE-HERE**.
- **Класс:** правило объявлено механизированным, а исполнителя у него нет. Это повтор `bugs/71_DONE_canon_rule_declared_mechanized_without_executor.md`,
  теперь уже в поставке: исполнитель живёт в обвязке истока, а поставочный канон обещает механику полю, где её нет. Исток сам
  записал этот урок: `framework/KAIF_REFERENCE.md:754–756` «An earlier wording claimed the rule was "guarded mechanically" —
  indicative, about a check that did not exist, and a weak session reads such a sentence as a guarantee already met (origin bug 71).»
  `TWINS: searched "guarded mechanically|guarded by the questions-guard" in framework/*.md — found 2 без исполнителя в поставке:`
  `AGENT_GUIDE.md:932`, `:948`. Не близнецы: честные формулировки «the origin guards …» (`AGENT_GUIDE.md:893`,
  `interview/SKILL.md:130,145,224`) и `REQUIREMENTS_FRAMEWORK.md:130`, у которого исполнитель (`kaif-requirements-lint`) едет.
- **Кто платит сейчас:** владелец лично — листает длинный документ в поисках «вон той формулы»; в NDim это его вторая поправка того
  же класса. Платят и полевые проекты, не построившие свой страж. **S3** (как в тикете); повтор класса bugs/71 добавляет цену доверия.
- **Форма починки:**
  - Третья ось `preflight`. Судит строки живого вопроса между заголовком и первым вариантом или полем ответа, кроме строк
    `Answer target`/`Origin` (у них законные адреса вроде `plans/24 §B8`) и HTML-комментариев.
  - Словарь — в `PARSER` языкового пакета: ru из тикета плюс en (`above`, `see §`, `in the section`). Ссылка вперёд законна;
    маркер `<!-- ref-ok: <reason> -->` с пустой причиной — нарушение. Ось судит вперёд по дате шапки, как археология.
  - `AGENT_GUIDE.md:932/948` должно называть поставочного исполнителя — дверь `review.mjs`.
  - Проверка: селфтест («см. выше» → 3; с маркером → 0; отвеченный → 0; «варианты ниже» → 0) и прогон по копии корпуса истока
    (0 ложных срабатываний).
  - **≈ 0,5 чата.**
- **Пересечения:** `ideas/31` п. 21 («хвосты интерактивного контура (№008 Q3)» — «страж содержания вопроса»,
  `interviews/interview_008_k5_contour_decisions.md:57–59`). #104 — соседняя ось самодостаточности (картинка). `bugs/84`
  (семейство «заявленное свойство против формы» в `questions-guard`/`verify-contour`) — косвенно.
- **Слова владельца:** «*Пиши прямо в вопросе то, что предлагаешь взять. Я не собираюсь скролить этот длинный документ и искать
  „вон ту формулу“*» (NDim, правило проекта с 2026-08-15; в тикете после «искать» перенос строки).

### #125 — сторож не узнаёт, что сервер страницы убит (замок остаётся); пилюля «сохранено на этом компьютере» закрывает заголовок

- **Суть:** (1) `--wait` считает контур живым, пока существует файл замка, а убитый сервер оставляет замок нарочно. Сторож не
  выходит с кодом 2 и не говорит «сервер умер — запусти `--queue --list`». (2) В окне 1100×900 длинная пилюля статуса под кнопкой
  перекрывает строку заголовка документа.
- **Сверка с HEAD:**
  1. «`waitForRecord` treats the contour as live while the LOCK FILE exists» — **CONFIRMED**. Код: `framework/tools/contour/review.mjs:1078`
     `const live = () => existsSync(lock) || (queueLock !== null && existsSync(queueLock));`. Pid не читается, хотя рядом его читает
     `checkLock`: `:1036` `try { process.kill(lock.pid, 0); return lock; }`, а мёртвому возвращается `{ ...lock, stale: true }` (`:1042`).
     Замок у убитого сервера остаётся нарочно (`:1037–1041`, I29). Проба `node p125b.mjs`: замок с pid завершённого процесса,
     `pollMs 200`, `graceMs 1500`:
     ```
     WAITER STILL WAITING after 6001 ms with a dead-pid lock → never ends by itself
     ```
     Контроль без замка — `waiter exited 2 after 1607 ms`. Спецификация обещает: `_interactive-contour-spec.md:76` «exit 0 on each
     recorded answer, 2 when the contour ended without one or none came up within a minute». Для мёртвого сервера обещание не держится.
  2. «it woke with exit 0 only when `--queue --list` picked the locally saved answer up» — **CONFIRMED по коду**. Сторож следит только
     за размером и mtime файла решения (`:1072` `const stamp = (f) => …`), а забранный ответ пишется `recordDecision`
     (`recordRecovered`, `:1455`). Цифра «120 s» — **NOT-VERIFIABLE-HERE**.
  3. Пилюля перекрывает заголовок — **CONFIRMED по коду** (геометрия); пиксели — **NOT-VERIFIABLE-HERE** (браузер запрещён).
     - `review.mjs:764` `header { position:static; … padding:10px 230px 10px 20px; …` — шапка оставляет кнопке 230 px.
     - `:802` `.fab { position:fixed; top:12px; right:16px; z-index:50; … max-width:60vw }` — колонка кнопки шириной до 60vw.
     - `:805` — у пилюли `#status` своего предела нет.
     - Длины строк пилюли (`node p125.mjs`): `ru serverGone=130 serverGoneLocal=149 savedLocally=111 left=106 stale=160 rewritten=105 …`.
     - Окно `:84` `const WINDOW_SIZE = '1100,900';` совпадает с тикетом.
- **Класс:**
  - (1) Два прибора живости одного замка: `checkLock` проверяет pid, сторож — файл. Сторож OW6 написан мимо уже существующего судьи
    живости. Зазор был назван ещё при OW6 и не попал в реестр 2.9: `plans/119_epic117_OW_owner_conversation_mid_work.md:175`
    «живость замка у нас — по pid,», `:176` «(Windows переиспользует PID)», `:177–178` «Кандидаты в OW10 (суд эпика) или
    реестр 2.9 — решает суд» (в источнике после «Кандидаты» перенос строки). `grep -n "pid\|alive\|живост" ideas/31_kaif_2.9_scope.md` → пусто. Сторож при этом хуже названного зазора: он не
    смотрит даже pid.
    `TWINS: searched "existsSync(lock|existsSync(queueLock|checkLock(" in review.mjs — found 1` проверку живости по файлу (`:1078`,
    обе ветки) против трёх с pid (`:1139`, `:1399`, `:1560`).
  - (2) Ширина колонки кнопки (60vw) и отступ шапки и баннера (230 px; 170 px на узком экране, `:806`; баннер — `:812`) — два
    независимых числа.
    `TWINS: searched long status() texts — found` в той же пилюле: `TX.left` (106 знаков ru — показывается после КАЖДОЙ частичной
    записи 2.8, самая частая), `TX.savedLocally`, `TX.err`, `TX.draft`, `TX.closeYourself`.
- **Кто платит сейчас:** агент — висит до чужого `--queue --list`; владелец — читает прикрытый заголовок. Полевые проекты платят
  при каждом падении сервера. Ответ не теряется. **S3.**
- **Форма починки:**
  - `live()` — через `checkLock`: `stale` означает «контур кончился». Строка «the page's server is gone — run `--queue --list` …»,
    exit 2. Фикстура селфтеста «замок с мёртвым pid → 2 в пределах окна» и мутант.
  - Пилюля: `max-width` равен зарезервированному отступу, либо отступ шапки растёт, пока пилюля видна. Проверка в `s22 D` headless:
    `getBoundingClientRect` пилюли и заголовка не пересекаются на `savedLocally` и `left`.
  - **≈ 0,5 чата** (0,25 + 0,25). Живость по `/alive?ping` (`plans/119:176`) — отдельный пункт, дороже.
- **Пересечения:**
  - `ideas/31` п. 31(а) («страница во вкладке при мёртвом сервере глазами владельца не наблюдена»): поле теперь наблюдало окно
    приложения при мёртвом сервере — пилюля видна, но закрывает заголовок.
  - Зазор `plans/119:175`, в реестр не попавший.
  - #128, комментарий 2 — строка пробуждения того же `waitForRecord`.
  - Открытые `bugs/` — нет (`bugs/125` — очередь, другой механизм).
- **Слова владельца:** нет.

### #126 — рендеры контура в `.kaif/.contour-tmp/` не входят в набор ignore-first; подметающий коммит их увозит

- **Суть:** `review.mjs <doc> --no-serve` пишет рендер в `.kaif/.contour-tmp/`. Ядро не вносит этот каталог в `.gitignore`, и
  следующий `git add -A` коммитит страницу (KAGO).
- **Сверка с HEAD:**
  1. «`grep -n "contour-tmp" .gitignore .kaif/kaif-core.mjs` → nothing» — **CONFIRMED** для ядра.
     `grep -c "contour-tmp" framework/installer/KAIF-CORE.mjs` → `0`. В наборе `framework/installer/KAIF-CORE.mjs:465–475`
     (`function ensureIgnoreFirst() {` … `:474` `'.kaif/contour-window/',`) такой строки нет.
     Путь задан в `framework/tools/contour/core.mjs:720` `export const TMP_DIR = '.kaif/.contour-tmp';`. Над ним, в `:719`, обещание
     `// ── Where the temporary renders of this contour live (ignored by git BEFORE the tool exists) ──`. Держит его только рукописный
     `.gitignore` истока: `.gitignore:45` `.kaif/.contour-tmp/` («2.6 epic IC»).
  2. `--no-serve` пишет рендер туда — **CONFIRMED**: `review.mjs:2206` `const outDir = tmpDirOf(root);` … `:2210` `console.log('Render written: ' + out);`.
  3. Коммит `A  .kaif/.contour-tmp/interview_032_…html` в KAGO — **NOT-VERIFIABLE-HERE**.
- **Сверх тикета — два близнеца того же механизма:**
  - На Windows `.contour-tmp` появляется не только от `--no-serve`: каждый голосовой зов пишет туда фразу. `review.mjs:196`
    `const dir = tmpDirOf(root);`, `:198` `const phraseFile = join(dir, 'call-phrase.txt');`. Значит, каталог есть у каждого
    Windows-развёртывания после первого показа с голосом, а все тикеты поля — с Windows 11.
  - Замки окон `<decisionsDir>/<doc>.lock` тоже вне набора ignore-first поставки. Путь — `review.mjs:1030`
    `const lockPath = (root, key) => join(decisionsAbs(root), key.replace(/\.[^.]+$/u, '') + '.lock');`; запись — `:1158`, внутри
    лежит `closeToken`. Исток прикрыл замки рукой: `.gitignore:17` `interviews/decisions/*.lock`. Замок убитого сервера остаётся
    нарочно (I29), так что подметающий коммит его увезёт. `decisionsDir` настраивается (`contour.decisionsDir`), поэтому строку
    придётся выводить из конфигурации (или класть `.gitignore` внутрь каталога решений).
- **Класс:** ignore-first — список, который в ядре ведут руками (`KAIF-CORE.mjs:466–475`), и новый путь поставочного инструмента
  в него не попадает. Исток этого не видит, потому что его `.gitignore` дописан руками.
  - Урок уже записан: EXP-0102 (`.kaif/guarded-loop.json`), `EXPERIENCE.md:1097` «новый файл состояния сессии рождается ВМЕСТЕ со
    строкой ignore-first в машинерии».
  - Тот же класс уже всплывал: суд 2.7 D-F1 — `KAIF-CORE.mjs:3071` ``lines (court of 2.7, D-F1: `.kaif/contour-window/` never reached .gitignore on 2.6 -> 2.7)``.
  - Урок записан, а стража нет. Repro урока (`grep <имя> framework/installer/KAIF-CORE.mjs .gitignore`) смотрит оба файла, и его
    зеленит `.gitignore` истока.
  - Своды этого не судят. `tools/sandbox/s22-contour-shipped.mjs:115` проверяет, что рендер лежит под `.kaif/.contour-tmp/`, но
    `git check-ignore` не вызывает; `tools/sandbox/s01-field-fixes.mjs:59` проверяет ignore-first только для `.kaif/install/` и заданий.
  - `TWINS: searched '.kaif/…' literals in framework/**/*.mjs + пути записи контура — found 2` непокрытых транзиента:
    `.kaif/.contour-tmp/` (рендер и `call-phrase.txt`) и `<decisionsDir>/*.lock`. Остальные литералы `.kaif/*` либо уже в наборе,
    либо это коммитимые по замыслу базовые линии и квитанции (`attribution-lint.baseline.json`, `budget-baseline.json`,
    `last-update.json`…). `framework/hooks/stop-status-guard.mjs:44` пишет в `tmpdir()` — не близнец.
- **Кто платит сейчас:** полевые проекты на каждом показе (на Windows — на каждом зове); мусор в истории, уборка отдельным коммитом.
  Для публичного репозитория в историю уходит рендер страницы с вопросами владельца. **S2.**
- **Форма починки:**
  - Добавить в `ensureIgnoreFirst` строки `.kaif/.contour-tmp/` и замков. `update-verify` уже переутверждает набор
    (`KAIF-CORE.mjs:3073` `ensureIgnoreFirst();`), так что поле получит строки на обновлении.
  - Страж сборки: каждый путь записи поставочного инструмента под `.kaif/` (список данными рядом с `TMP_DIR`/`WINDOW_PROFILE_DIR`)
    есть в наборе.
  - Свод s01/s22: после показа в развёртывании `git status --porcelain` пуст.
  - **≈ 0,25–0,5 чата.**
- **Пересечения:** `ideas/31` п. 5 («K-R11 (LF в CRLF `.gitignore`)» — тот же `ensureIgnoreFirst`). EXP-0102. Суд 2.7 D-F1.
  Открытые `bugs/` — нет.
- **Слова владельца:** нет.

### #127 — парсер контура не читает живой корпус проекта: форма `- **A:**`, английская метка дополнения, место дополнения, перезапись `decision.json`, комментарий вместо ответа

- **Суть:** Unliminium не может перейти на поставочный контур, и мешает парсер. Из 1941 варианта распознано 169, 47 интервью из 107
  не видны вовсе. В ru-документ пишется английская метка. Дополнение встаёт над строкой «внесено». `decision.json` заменяется между
  редакциями. HTML-комментарий засчитывается как ответ.
- **Сверка с HEAD (по пунктам тикета):**
  1. «The shipped parse knows `- **A)**` and a table row only» — **CONFIRMED**. `core.mjs:195`
     `export const OPTION_START_RE = new RegExp('^\\s*-\\s+\\*\\*([' + L + '])\\)', 'u');`. Проба `node p127a.mjs`:
     ```
     "A)"                 options: 2 | preflight: []
     "A:"                 options: 0 | preflight: ["В1: 0 option(s) in list form and no declared free field — the page would open without ra
     "A (рекомендую):"    options: 0 | preflight: ["В1: 0 option(s) in list form and no declared free field — the page would open without ra
     "A."                 options: 0 | preflight: ["В1: 0 option(s) in list form and no declared free field — the page would open without ra
     ```
     Заголовки: `### А1. x?` → `questions seen: 0`, `### Б1. x?` → 0, `### Вопрос 1. x?` → 0 (`texts.mjs:31` `questionPrefixes: 'Q|В',`).
     Это не ошибка реализации, а граница контракта: `_interactive-contour-spec.md:12` «**Options are recognised in exactly two forms**».
     Тикет — запрос на расширение. Числа корпуса (1941/169, 47 из 107) — **NOT-VERIFIABLE-HERE**.
  2. «The ru pack writes a follow-up as `'Answer (дополнение, ' + atHuman + '):'`» — **CONFIRMED**: `texts.mjs:199`
     `followUp: (atHuman) => 'Answer (дополнение, ' + atHuman + '):',`. Русскую метку парсер тоже понимает
     (`texts.mjs:33` `answerLabels: 'Answer|Ответ(?:\\s+владельца)?',`), так что перевод безопасен. Других английских слов в
     RU-словаре нет (скан строк 194–303).
  3. «The follow-up lands right under the answer line» — **CONFIRMED**: `core.mjs:653`
     `const insertAt = lastAns ? qStart + lastAns.line + 1 : qStart + q.body.length;`. Проба `node p127b.mjs` (ru): строка
     `**Answer (дополнение, 26 сентября 2026, 10:00 (+00:00)):** B) — передумал <!-- owner-review: … -->` встала ВЫШЕ строки
     `✅ Внесено: plans/12 шаг 3 (коммит abc123).` Комментарий к тому же вопросу уходит в конец блока (`core.mjs:643`
     `lines.splice(qStart + q.body.length, 0, '', …`) — две вставки одного блока попадают в разные места.
  4. «`decision.json` is replaced when the document was edited between two saves» — **CONFIRMED** по поведению, **PARTIAL** по
     заявленному противоречию. Проба `node p127b.mjs`: `same page 2nd save: answers [ 'В1', 'В2' ] records 2`, после правки
     документа — `after doc edit + save: answers [ 'В1' ] records 1 | archive files: 3`. Код: `core.mjs:680`
     `if (prev && payload.rev && prev.revAfter === payload.rev && (prev.kind || 'interview') === record.kind) {`. Строка таблицы
     спецификации говорит то же: `_interactive-contour-spec.md:42` «a new revision of the document starts a new decision». Спорит с
     ней только заголовок `:37` `## 3. Records — three files, derived names, never overwritten` — это уточнил комментарий 2 тикета.
     Противоречие внутри спецификации, код следует строке таблицы.
  5. «An HTML comment right under an empty … counts as an answer» — **CONFIRMED**. `core.mjs:279` `text = nl; break;` (комментарии
     не снимаются), `:307` `q.answered = docClosed || q.answers.some((a) => a.text); // rule 4`. Проба:
     `comment-under-empty-answer: answered = true answers = [{"line":4,"text":"<!-- probe comment -->","followUp":false}]`, и на самой
     строке метки `comment-on-answer-line: answered = true`. Итог: живой вопрос выпадает из пре-флайта (`core.mjs:485`
     `if (q.answered || q.freeField) continue;`). При этом показ снимает комментарии (`review.mjs:507` `a.text.replace(/<!--[\s\S]*?-->/g, '')`),
     а суждение «отвечен» — нет.
- **Класс:** парсер контура знает по одному написанию каждой формы и молча не видит остальные, а дверь ловит только полную потерю
  (меньше двух вариантов). `TWINS: searched регулярки форм в core.mjs/review.mjs + texts.mjs — found 5:`
  - `review.mjs:474` `const OPTION_LINE_RE = new RegExp('^\\s*-\\s+\\*\\*[' + PARSER.letters + ']\\)', 'u');` — копия
    `OPTION_START_RE` для прозы карточки. Если расширить одну регулярку без другой, строки вариантов останутся в прозе — вразрез с
    `core.mjs:252` «one parse for all».
  - `core.mjs:199` `OPTION_ROW_RE` шире списка: в таблице `| **A.** |` и `| **A** (note) |` законны, в списке — нет. Две формы
    говорят на разных словарях.
  - `core.mjs:193` `RECOMMEND_RE`: проба `node p28.mjs` → `"**Рекомендация агента:** A"  → recommended: null`. Это `ideas/31` п. 28,
    на 2.8 он всё ещё верен.
  - `texts.mjs:31` `questionPrefixes` — `А1`/`Б1`/`Вопрос N` не считаются вопросами. На показе это только заметка в шапке;
    `--check` называет их нераспознанными.
  - Потеря одного варианта проходит молча. Проба `node p127c.mjs` → `authored 3 letter lines → parsed options: A,B | preflight: []`.
    У истока ось «вариант ПОТЕРЯН» есть, но только для таблиц и только в обвязке: `tools/questions-guard.mjs:383`
    `authoredRows: (q.body || []).filter((l) => /^\s*\|\s*\*\*[A-ZА-Я](?:\s*\([^)]*\))?\*\*/u.test(l)).length,`.
- **Кто платит сейчас:** полевые проекты — переход на поставочный контур закрыт, обход один: переписывать документы владельца.
  Владелец лично — английское слово в русском документе на каждом дополнении и вариант, пропадающий молча. **S2** (п. 1 и потеря
  варианта), **S3** (п. 2–5).
- **Форма починки:**
  - (1) **Развилка контракта для владельца KAIF**, одно из двух:
    - расширить формы (`X)`, `X:`, `X.`, `X (note):`) одной регуляркой ядра, которую импортирует `review.mjs`;
    - оставить две формы и добавить ось «букв написано N, распознано M» для списка и таблицы, с печатью исправления.
  - (2) `texts.mjs:199` → `Ответ (дополнение, …):`.
  - (3) Дополнение вставлять в конец блока вопроса, как комментарий.
  - (4) Согласовать заголовок §3 спецификации со строкой таблицы (бюджет 120 строк, занято 119).
  - (5) Текст ответа считать без HTML-комментариев.
  - Проверка: фикстура 3 вопроса × 4 варианта формы `- **A:**` → 12 вариантов; ru-дополнение без английского слова и под строкой
    «Внесено»; вопрос только с комментарием остаётся живым; мутанты.
  - **≈ 1 чат** (+ ≈ 0,1 на `RECOMMEND_RE`, п. 28).
- **Пересечения:** `ideas/31` п. 28 (регулярка рекомендации — подтверждено пробой на HEAD). #123 (тот же узел). Тикет #115 поля
  (решение владельца подключить всё поставляемое). `bugs/84` (ось «вариант ПОТЕРЯН» истока — табличная, bugs/81).
- **Слова владельца:** нет. Решение владельца Unliminium от 2026-09-26 агент пересказал, дословной цитаты нет. Поправки тикета
  учтены: комментарий 1 — «the dedup searches ran with `--limit 5` per query»; комментарий 2 — фраза стоит в заголовке `:37`, а не
  в таблице.

### #128 — радио не снимается вторым кликом или тапом: `pointerdown` снимает, `click` того же нажатия ставит обратно (P3)

- **Суть:** страница берёт активацию на `pointerdown` с `preventDefault()` и сама переключает радио. `click` того же нажатия этим
  не отменяется, и родное радио снова ставит `checked = true`. Второй клик или тап выбор не снимает. Владелец нашёл это на первой
  живой странице 2.8 в двух проектах. Комментарий 2 добавляет: строка `--wait` называет только выбор, и дефект, записанный
  владельцем в текст и комментарии, агент пропустил.
- **Сверка с HEAD:**
  1. Обработчик — **CONFIRMED**: `review.mjs:841` `"document.addEventListener('pointerdown',function(e){…`, `:843` `" e.preventDefault();var was=inp.checked;",`,
     `:844` `" if(e.target===inp){inp.checked=!was}else if(!was){inp.checked=true}",`. Своего слушателя `click` у радио нет: `:927`
     делегирует только `savedoc`/`retry`, `:930`/`:931` — это `#save`/`#copybtn`.
  2. «`preventDefault()` on `pointerdown` does not cancel the `click` that the same press produces» — **CONFIRMED по коду**. По
     спецификации W3C Pointer Events (пересказ, не цитата) отмена `pointerdown` подавляет совместимые `mousedown`/`mouseup`, но не
     `click`. Наблюдение в браузере и последовательность `[true, true, true, true, true, true, true, true]` — **NOT-VERIFIABLE-HERE**
     (браузер запрещён правилом 2).
  3. Источник дефекта — сам канон: `framework/skills/owner-reviews/SKILL.md:393–394` «activation over on `pointerdown` with
     `preventDefault` — the native label duplicate ceases to exist by construction; a click on the FIELD toggles (the second click
     CLEARS)». «By construction» для `click` ложно. Зеркало обвязки — `.claude/skills/owner-reviews/SKILL.md:386`. Исток считал эту
     схему надёжнее, чем у доноров: `researches/17_contour_donor_lessons_ndim_klas_unliminium.md:39` «(у нас закрыт глубже —
     pointerdown, дубль-клик label невозможен)».
  4. Почему приёмка истока зелёная: `tools/verify-contour.mjs:339`
     `" function pd(el){el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true}))}",`, `:341`
     `" pd(rs[0]);out.push(!rs[0].checked);",`. Синтетический `pointerdown` идёт без `click` настоящего нажатия, и проверка `:350`
     `check('второй клик СНИМАЕТ выбор (P3, полевой баг пилота 008)', sel[1] === true);` проходит на половине события.
  5. Комментарий 2: «the `--wait` exit line names only the choices («Q2 = A»)» — **CONFIRMED**: `review.mjs:1091`
     `const answers = Object.entries(d.answers || {}).map(([q, a]) => q + ' = ' + (a.choice || (a.text ? 'text' : 'comment'))).join(', ');`.
     При выбранном варианте текст и комментарий не упоминаются вовсе, `d.comment` (комментарий к документу) не печатается.
     Близнец — лог сервера `:1264` с той же формулой.
- **Класс:** (а) проверка подаёт половину реального ввода — синтетическое событие вместо нажатия, так что приёмка судит обработчик,
  а не нажатие; (б) канон предписывает механизм с ложным «by construction»; (в) строка пробуждения сжимает слова владельца до буквы.
  `TWINS: searched "PointerEvent|Input.dispatchMouseEvent|dispatchTouchEvent" in tools/verify-contour.mjs, tools/sandbox/*.mjs — found 4`
  взаимодействия с радио, все — синтетический `pointerdown` без `click`: `verify-contour.mjs:235`, `:241`, `:339–345`, `:662`.
  Настоящих нажатий через CDP — 0. Для (в) — 2 места (`review.mjs:1091`, `:1264`).
- **Кто платит сейчас:** владелец лично — нашёл сам на первой живой странице, в двух проектах (NDim, KAGO); исток — той же
  страницей. **S1** по прецеденту истока: в `bugs/113` и `bugs/125` случай «владелец наступил сам» = S1 доверия; тикет ставит S2.
  Строка сторожа — **S2**: сообщение владельца о дефекте агент пропустил, нашёл его только судья.
- **Форма починки:**
  - Capture-слушатель `click` гасит клик, пришедший не позже 800 мс после взятого `pointerdown`; клик с клавиатуры (без
    `pointerdown`) остаётся родным.
  - P3 в обоих слоях `/owner-reviews`: вместо «by construction» назвать механизм.
  - Приёмка: настоящее нажатие через CDP `Input.dispatchMouseEvent` (pressed + released) и `Input.dispatchTouchEvent` в
    `verify-contour` и `s22 D`. Ожидаемая последовательность P3 `[true,false,true,true,false,true,false,true]`, на 2.8 — красная.
  - Сторож и лог печатают решение целиком: выбор, текст, комментарий, комментарий к документу.
  - **≈ 0,5 + 0,25 чата.**
- **Пересечения:** `ideas/31` — прямых нет (п. 11 «расширение охвата селфтестов» — косвенно). #125 — тот же узел `waitForRecord`.
  `bugs/84` (семейство «оси контура: заявленное свойство против того, что увидел прогон»; `verify-contour.mjs` — в его узле) —
  тот же класс.
- **Слова владельца:** NDim — «*Не снимаются радиокнопки повторным тапом - баг в КАИФ и у тебя*»; KAGO (комментарий 2) —
  «Не снимаются радиокнопки повторным тапом - баг в КАИФ и у тебя».

---

## Итоговая таблица

| Тикет | Вердикт сверки | Тяжесть | Цена | Кандидат-эпик (рабочее имя) |
|---|---|---|---|---|
| #123 | CONFIRMED (механизм и отказ самопроверки — пробой); 16/105 — NOT-VERIFIABLE-HERE; у истока 12/43 страниц с сырыми `**` | S2 | 0,5 | CR «Контур читает поле» |
| #124 | CONFIRMED (у двери нет оси; канон поставки обещает «guarded mechanically» — повтор bugs/71); ось истока — PARTIAL | S3 | 0,5 | CR (третья ось двери) |
| #125 | CONFIRMED (сторож — пробой; пилюля — по коду, пиксели NOT-VERIFIABLE-HERE); зазор plans/119:175 не в реестре | S3 | 0,5 | CP «Контур: нажатие и пробуждение» |
| #126 | CONFIRMED + 2 близнеца (`call-phrase.txt` на Windows, `<decisionsDir>/*.lock`) | S2 | 0,25–0,5 | IG «ignore-first из данных» |
| #127 | CONFIRMED пп. 1, 2, 3, 5; п. 4 — PARTIAL (заголовок против строки таблицы внутри спецификации); + близнец `ideas/31` п. 28 | S2 | 1,0 (+0,1) | CR «Контур читает поле» (п. 1 — развилка владельцу) |
| #128 | CONFIRMED по коду и канону (браузер — NOT-VERIFIABLE-HERE); + приёмка истока синтетическая; + строка сторожа | S1 (по прецеденту истока; тикет — S2) | 0,75 | CP «Контур: нажатие и пробуждение» |

Всего ≈ 3,5–3,85 чата: CR ≈ 2,1 · CP ≈ 1,25 · IG ≈ 0,25–0,5.
