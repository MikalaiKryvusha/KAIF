# Bug 90 — зеркала счётчиков: числа и перечни поставки, которые заявлены стерегомыми, а стража не имеют

**Status:** 🔬 ПРЕДПОЛОЖИТЕЛЬНЫЙ — не верифицирован, причина не установлена · скоуп **2.3**
**Version/build:** build 279 · **When/context:** круги ревью R1/R2 фазы R, 2026-08-09
**Fix accepted when (observable):** НЕ ОПРЕДЕЛЁН — критерий приёмки задаёт исполнитель после
установления причины (решение №70: разбор и лечение за Fable, не за автором документа)

Пять вхождений про одно и то же место: факт «сколько чего в поставке» (и «что именно в ней
названо») записан в репозитории многократно, а стерегутся не все копии. Часть копий числовые,
часть — поимённые перечни; часть стоит в документах, которые сами объявляют себя проверяемыми
машиной. Ни причина, ни план починки здесь не устанавливаются: ниже только адрес, заявление,
наблюдение и улика.

Общая проверка адресов выполнена read-only 2026-08-09 после закрытия шести блокеров (коммиты
`300104b`, `6bf6445`, `2cb1c33`, `f65107f`, `2079536`); мутационные пробы кругов НЕ
перезапускались — рабочее дерево при заведении документа не трогалось. Провенанс вхождений:
живая проверка и мутационные пробы кругов R1/R2 (метки проб `M3*`, `S*`, `T*` — из карточек
круга; поимённо круг в карточке не назван, поэтому во всех разделах стоит «круги R1/R2»).

---

## 1. Навык `/release` называет «десять классов» showcase-lint при живых 12, и counters-guard эту строку не судит

**Адрес:** `.claude/skills/release/SKILL.md:94` (фраза), контекст `:93–97` (перечень классов).
Единственный страж величины — `tools/counters-guard.mjs:141`.

**Заявлено.** `.claude/skills/release/SKILL.md:93–94`:

> **Витрину судит МАШИНА по правилам волны** (фаза Q, `plans/67`): `node tools/showcase-lint.mjs` —
> десять классов (описание собственного текста · оправдание числа · намёк на закулисье · отрицание
> при числе · калька · безличный залог в инструкции · внутренний ярлык в названии строки · вилка
> шире источника · внутренняя команда истока как доказательство · инструкция человеку, исполнимая только
> агентом) плюс три оси…

В скобках перечислено ровно десять классов.

**Наблюдалось.** Инструмент печатает 12 классов строки. На фикс-коммите `4aa16b3` было 10 —
значит число разошлось ПОСЛЕ объявления о закрытии. Зеркало величины в реестре
`counters-guard` привязано к формулировке AGENT_GUIDE (`re: /Страж ВИТРИНЫ[^|]*?(\d+) классов
волны/`, `file: 'AGENT_GUIDE.md'`) и файла навыка не касается.

**Улика.**

```
$ node tools/showcase-lint.mjs --classes
{"lineClasses":12,"axes":3,"ids":["META","EXCUSE","BACKSTAGE","DENIAL","ADDRESSEE","AUTHORSHIP","STRAY","TOOLPROOF","CALQUE","PASSIVE","RANGE","JARGON","HALVES","WRAP","NOTES-VS-README"]}

$ grep -n "десять классов\|showcase-lint\.mjs" .claude/skills/release/SKILL.md
93:**Витрину судит МАШИНА по правилам волны** (фаза Q, `plans/67`): `node tools/showcase-lint.mjs` —
94:десять классов (описание собственного текста · оправдание числа · намёк на закулисье · отрицание

$ grep -n "классов волны" tools/counters-guard.mjs
141:    re: /Страж ВИТРИНЫ[^|]*?(\d+) классов волны/, keys: ['showcaseClasses'] },
```

**Кого касается.** Последнее место перед публикацией описывает стража неверно: агент, идущий по
`/release`, считает витрину проверенной целиком по списку, в котором двух классов нет.

**Замечено.** Круги R1/R2 фазы R, живая проверка 2026-08-09.

**Состояние на 2026-08-09.** Адрес на месте, наблюдаемое воспроизводится: «десять классов» на
`SKILL.md:94`, живой вывод — `lineClasses: 12`. Зеркало `counters-guard.mjs:141` по-прежнему
указывает на `AGENT_GUIDE.md`.

---

## 2. Модуль hooks — поверхность, чьё расхождение баг объявил зеркалом: живой `framework/hooks/` не читает ни один страж

**Адрес:** `AGENT_GUIDE.md:378` (строка дерева `hooks/`).
**Также:** `PROJECT_STRUCTURE_EXTERNAL_MAP.md:44`, `framework/adapters/claude-code.md:33`.

**Заявлено.** `bugs/68` обещал реестровую строку «содержимое `framework/tools/` +
`framework/hooks/` ↔ их перечисления в картах». Адаптер поставки
(`framework/adapters/claude-code.md:33`) несёт числовое зеркало:

> **KAIF SHIPS one hook module, and Claude Code is its reference host: `.kaif/hooks/`
> (refresh-hooks, since 2.2).** Three hooks by the live vendor contract — an order to re-read
> after compaction, a marker-age timer per prompt, a soft `STATUS.md` guard once per session…

**Наблюдалось.** Живого каталога не читает ни один страж: ни счёта скриптов, ни имён, ни факта
наличия строки. Числовое зеркало «Three hooks» в адаптере поставки тоже не стережётся.
`tools/check-framework.mjs:516` считает ФАЙЛЫ `framework/hooks/` — но только ради суммы блоков
бандла, не против карт.

**Улика.** Мутации круга на копии: удаление строки `hooks/` из дерева `AGENT_GUIDE` (M3d),
`hooks/*` → `hooks-old/*` во внешней карте (M3e), «Three hooks» → «Seven hooks» в адаптере
(S7) — все `exit=0`. Read-only перепроверка сейчас:

```
$ grep -n "framework/hooks" AGENT_GUIDE.md
(пусто — реестровой строки нет)

$ grep -rn "framework/hooks" tools/*.mjs
tools/build-framework.mjs:320:    blocks.push(embedBundle(`framework/hooks/${h}`, `.kaif/hooks/${h}`,
tools/check-framework.mjs:361:    ['Grok Build injection caveat ↔ hooks module README', 'framework/hooks/README.md',
tools/check-framework.mjs:516:    // the optional refresh-hooks module (epic O, 2.2): every FILE in framework/hooks/ ships to

$ ls framework/hooks/
README.md
prompt-refresh-timer.mjs
sample-antigravity-hooks.json
sample-codex-hooks.json
sample-copilot-hooks.json
sample-cursor-hooks.json
session-start-refresh.mjs
settings-fragment.json
stop-status-guard.mjs
```

**Кого касается.** Модуль можно переименовать или нарастить — три карты и адаптер поставки
разойдутся с деревом при зелёных гейтах. Адаптер читает тот, кто разворачивает KAIF в чужом
проекте.

**Замечено.** Круги R1/R2 фазы R (пробы M3d, M3e, S7), 2026-08-09.

**Состояние на 2026-08-09.** Все три адреса на месте и совпадают построчно. Живых скриптов в
`framework/hooks/` три (`prompt-refresh-timer.mjs`, `session-start-refresh.mjs`,
`stop-status-guard.mjs`) — то есть «Three hooks» сегодня ПРАВДА; наблюдаемое здесь — отсутствие
стража, а не расхождение числа. Число «3 скрипта» повторено ещё в
`PROJECT_ARCHITECTURE_INTERNAL_MAP.md:32`, `PROJECT_STRUCTURE_EXTERNAL_MAP.md:44` и
`README.md:993`. Мутации не перезапускались (дерево не трогалось).

---

## 3. Поимённые ПЕРЕЧНИ (классы витрины, языковые пакеты, дерево документов поставки) не сверяются ни с чем, хотя их числа стерегутся

**Адрес:** `AGENT_GUIDE.md:668` (строка реестра стражей про showcase-lint).
**Также:** `framework/KAIF_REFERENCE.md:181`, `KAIF_REFERENCE.md:182`,
`framework/installer/_thin-intro.md` (дерево развёртывания), `tools/counters-guard.mjs:141`.

**Заявлено.** `AGENT_GUIDE.md:668`: «Страж ВИТРИНЫ … **12 классов волны владельца, каждый записан
формой, а не обобщением**» — и дальше идёт поимённый перечень.
`framework/KAIF_REFERENCE.md:181` / `KAIF_REFERENCE.md:182`: «Nine language packs (ru, es, pt, fr,
de, zh-Hans, ja, hi, ar)…». `framework/installer/_thin-intro.md` в разделе «What gets deployed (so
you know what "done" looks like)» несёт дерево из 14 имён документов.

**Наблюдалось.** Цифра классов — цитата инструмента и стережётся (`counters-guard.mjs:141`), а
ИМЕНА не сверяются ни с чем: в строке 668 названы 10 идентификаторов из 12 — нет `ADDRESSEE` и
`TOOLPROOF`. Состав языковых пакетов (какие именно девять) и дерево `_thin-intro` не судятся
вовсе.

**Улика.** Пересечение `showcase-lint --classes` (`ids`) со строкой `AGENT_GUIDE.md:668`:

```
$ node tools/showcase-lint.mjs --classes
{"lineClasses":12,"axes":3,"ids":["META","EXCUSE","BACKSTAGE","DENIAL","ADDRESSEE","AUTHORSHIP","STRAY","TOOLPROOF","CALQUE","PASSIVE","RANGE","JARGON","HALVES","WRAP","NOTES-VS-README"]}

$ grep -n "ADDRESSEE\|TOOLPROOF" AGENT_GUIDE.md .claude/skills/release/SKILL.md
(пусто)
```

В строке 668 названы: META · EXCUSE · BACKSTAGE · DENIAL · CALQUE · PASSIVE · JARGON · RANGE ·
AUTHORSHIP · STRAY. Не названы: ADDRESSEE, TOOLPROOF (классы строки), а также идентификаторы осей
HALVES, WRAP, NOTES-VS-README (оси описаны прозой, но не именами).

Мутации круга: S3 — «Nine language packs (ru, es, pt, fr…)» → «Six language packs (ru, es, pt)» →
`exit=0`; выброс `TESTING_FRAMEWORK.md` из дерева `_thin-intro` → `counters-guard`,
`check-framework`, `showcase-lint`, `doc-header-lint`, `sandbox-suite` — все `0`.

**Кого касается.** Класс, выпавший из перечня, перестаёт существовать для читателя канона;
`_thin-intro` — первое, что читает агент в чужом проекте, и пропажа документа из его списка не
видна ни одному гейту.

**Замечено.** Круги R1/R2 фазы R (проба S3 и проба на `_thin-intro`), 2026-08-09.

**Состояние на 2026-08-09.** `AGENT_GUIDE.md:668` на месте, «12 классов волны владельца, каждый
записан формой» и перечень из десяти имён воспроизводятся. `framework/KAIF_REFERENCE.md:181` и
`KAIF_REFERENCE.md:182` на месте дословно. **Адрес `framework/installer/_thin-intro.md:78-84`
сместился:** раздел «## 3. What gets deployed» стоит на `:77`, открытие блока — `:79`, имена
документов — `:81–84`, `KAIF_REFERENCE.md` в хвосте дерева на `:87–88`. Мутации не
перезапускались.

---

## 4. counters-guard заявляет сверку «со ВСЕМИ зеркалами разом», а зеркала живых чисел лежат вне реестра — включая половины строк, часть которых уже стережётся

**Адрес:** `tools/counters-guard.mjs:144–181` (массив `MIRRORS`; в карточке круга указан диапазон
`143–179`).
**Также (зеркала вне реестра):** `STATUS.md:99–101`, `STATUS.md:152`, `STATUS.md:156`,
`AGENT_GUIDE.md:14`, `AGENT_GUIDE.md:376`, `AGENT_GUIDE.md:424–425`, `AGENT_GUIDE.md:503`,
`PROJECT_STRUCTURE_EXTERNAL_MAP.md:42`, `README.md:486`, `README.md:1030`,
`framework/KAIF_REFERENCE.md:73`, `framework/installer/_thin-intro.md` (дерево).

**Заявлено.** Шапка инструмента, `tools/counters-guard.mjs:10`:

> Этот инструмент сверяет ЖИВЫЕ числа со ВСЕМИ зеркалами разом.

`STATUS.md:99–101`:

> Актуальная сборка — 14 ключевых документов / 7 README / **35 навыков** / 57 блоков FULL /
> **161 бандла** / **691 модуль** (цифры печатает сборка — не переписывай руками; стережёт
> `node tools/counters-guard.mjs`); полигон `npm run test:core` — **14 сводов, зелёный**, четыре
> преполёта.

**Наблюдалось.** Зеркало STATUS в реестре ловит четыре ключа (`skills`, `embedded`, `blocks`,
`modules`) паттерном
`/\*\*(\d+) навы[а-я]*\*\* \/ (\d+) блок[а-я]* FULL \/ \*\*(\d+) бандла\*\* \/ \*\*(\d+) модул[а-я]*\*\*/`
— то есть «14 ключевых документов» и «7 README» стоят ЛЕВЕЕ начала паттерна и вне его, «14 сводов»
той же строки — правее и тоже вне. Тот же обрез у строки `AGENT_GUIDE.md:424–425`. Вне реестра
также: «← 9 language packs» (`AGENT_GUIDE.md:376`), «# 9 языковых пакетов»
(`PROJECT_STRUCTURE_EXTERNAL_MAP.md:42`), «holds 14 documents + 7 READMEs + 35 skills + 1 unpacker
= 57 embedded files» (`README.md:486`) и русская половина (`README.md:1030`), «(14 сводов, 4
преполёта)» (`STATUS.md:152`), «витрина: 12 классов» (`STATUS.md:156`), «Fourteen key documents»
(`framework/KAIF_REFERENCE.md:73`), число классов ПРОПИСЬЮ «двенадцать классов строки»
(`AGENT_GUIDE.md:503`) — регэксп ищет цифру, — и «четырнадцать ключевых документов … семь README …
тридцать пять навыков» прописью в `AGENT_GUIDE.md:14`.

**Улика.** Мутации круга, по одной на свежих копиях: «← 9 language packs»→6 · «# 9 языковых
пакетов»→6 · «holds 14 documents + 7 READMEs»→13/6 · «(14 сводов, 4 преполёта)»→(9, 2) · «витрина:
12 классов»→5 · «14 ключевых документов / 7 README»→11/4 · «**14 сводов**»→13 · «двенадцать классов
строки»→«девять» · «Fourteen key documents»→«Twelve» — все GREEN, `exit 0`. Контрольная мутация в
той же строке STATUS «35 навыков»→«34» — КРАСНЫЙ.

Read-only перепроверка сейчас (реестр и живой прогон):

```
$ node tools/counters-guard.mjs
counters: 57 embedded (14 docs + 7 readmes + 35 skills + 1 tools) · bundle 161 blocks · 691 modules · polygon 14 suites
✅ counters OK — 50 зеркал сверены с живыми числами (в т.ч. ось навыков ПОИМЁННО: alt-тексты, SVG, пропись, строки Таблицы 3 обеих половин, ключи 9 языковых пакетов; ось документов: строки Таблицы 1 обеих половин + пропись)
```

Языковые зеркала в `MIRRORS` привязаны к `README.md` (`{ name: 'README EN — §8.2 языковые пакеты',
file: 'README.md', re: /(\d+) language packs/ }` и русский близнец) — файлов `AGENT_GUIDE.md`,
`PROJECT_STRUCTURE_EXTERNAL_MAP.md`, `framework/KAIF_REFERENCE.md` они не касаются.

**Кого касается.** Строка `STATUS` объявляет себя стерегомой ЦЕЛИКОМ и прямо приглашает не
перечитывать числа («цифры печатает сборка — не переписывай руками»); забытое зеркало зеленеет
молча. Это прародительский класс `bugs/09` / `bugs/49`, уже срабатывавший именно на STATUS.

**Замечено.** Круги R1/R2 фазы R (серия одиночных мутаций + контроль), 2026-08-09.

**Состояние на 2026-08-09.** **Адреса в STATUS сместились** — файл острижен коммитом `b9501d8`
(«STATUS острижен до сводки „сейчас“»). Указанные в карточке `STATUS.md:68`, `:112`, `:116` там
больше не стоят; живые адреса тех же строк: `:99–101` (строка счётчиков + «14 сводов»), `:152`
(«14 сводов, 4 преполёта»), `:156` («витрина: 12 классов»). Адрес самого реестра сместился на два
номера: `MIRRORS` начинается на `:144` и кончается на `:181`. Остальные адреса
(`AGENT_GUIDE.md:14`, `:376`, `:424–425`, `:503`; `PROJECT_STRUCTURE_EXTERNAL_MAP.md:42`;
`README.md:486`, `:1030`; `framework/KAIF_REFERENCE.md:73`) — на месте построчно. Живой прогон
зелёный, 50 зеркал. Мутации не перезапускались.

---

## 5. Проверка перечисления tool-модулей ищет имя по ВСЕМУ файлу — дрейф самого перечисления проходит зелёным

**Адрес:** `tools/counters-guard.mjs:418`.
**Также:** `AGENT_GUIDE.md:377`, `PROJECT_ARCHITECTURE_INTERNAL_MAP.md:31`.

**Заявлено.** Комментарий над проверкой (`tools/counters-guard.mjs:414–417`) и докстринг функции:

> Перечисления опциональных модулей поставки — по ИМЕНАМ… Имя ищется ЦЕЛЫМ токеном, а не
> вхождением: `kaif-requirements-linter` содержит `kaif-requirements-lint` подстрокой, и проверка
> `includes` зеленела бы на переименовании…
> Перечисление проверяется именами, а не длиной: карта, потерявшая один модуль из трёх, и карта,
> назвавшая три чужих, для счётчика одинаковы.

**Наблюдалось.** Проверка «имя названо» выполняется по тексту ВСЕГО файла, а не по строке
перечисления:

```js
const named = (n) => new RegExp(`(?<![\\w-])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`).test(text);
const missing = live.toolModules.filter((n) => !named(n));
```

`text` — содержимое всего файла. Имя `kaif-requirements-lint` встречается в `AGENT_GUIDE.md`
дважды и во внутренней карте дважды, поэтому пропажа модуля именно ИЗ ПЕРЕЧИСЛЕНИЯ зеленеет:
второе вхождение подтверждает «имя названо». Селфтест этого не ловит — он мутирует имя глобально
по файлу.

**Улика.** Мутации круга: M3a/M3b — переименование и пропажа модуля в строке дерева
`AGENT_GUIDE` → `exit 0`; T2 — переименование во внутренней карте → `exit 0`; контроль T3 —
внешняя карта (одно вхождение) → `exit 1`.

Read-only перепроверка распределения вхождений сейчас:

```
$ grep -cn "kaif-requirements-lint" AGENT_GUIDE.md PROJECT_ARCHITECTURE_INTERNAL_MAP.md PROJECT_STRUCTURE_EXTERNAL_MAP.md
AGENT_GUIDE.md:2
PROJECT_ARCHITECTURE_INTERNAL_MAP.md:2
PROJECT_STRUCTURE_EXTERNAL_MAP.md:1

$ grep -n "kaif-requirements-lint" AGENT_GUIDE.md PROJECT_ARCHITECTURE_INTERNAL_MAP.md
AGENT_GUIDE.md:377:│   ├── tools/                       ← optional tool modules → .kaif/tools/ (kaif-provenance · kaif-canon-li…
AGENT_GUIDE.md:658:| `node tools/doc-header-lint.mjs` | Линтер шапки-меты И блока требований документ…
PROJECT_ARCHITECTURE_INTERNAL_MAP.md:31:| **Опциональный tool-модуль** (`framework/tools/*` → `.kaif/tools/`) | Испо…
PROJECT_ARCHITECTURE_INTERNAL_MAP.md:65:| **Контур требований** | `REQUIREMENTS_FRAMEWORK.md` · блоки «Вектор …
```

То есть в обоих файлах, где мутация зеленела, второе вхождение имени лежит ВНЕ перечисления
(строка 658 — реестр стражей; строка 65 — контур требований); во внешней карте, где контроль
покраснел, вхождение ровно одно.

**Кого касается.** Дерево репозитория, которое читает каждый разворачивающий фреймворк, может
разойтись с поставкой, и страж подтвердит это зелёным.

**Замечено.** Круги R1/R2 фазы R (пробы M3a, M3b, T2, контроль T3), 2026-08-09.

**Состояние на 2026-08-09.** Адрес на месте построчно: `tools/counters-guard.mjs:418` — та самая
строка `const named = …`. `AGENT_GUIDE.md:377` и `PROJECT_ARCHITECTURE_INTERNAL_MAP.md:31` на
месте, распределение вхождений имени (2 / 2 / 1) сохранилось. Мутации не перезапускались.

## Триаж 2.3 (фаза S, 2026-08-14)

> Вердикты двухступенчатого триажа (механика на HEAD → скептик, дефолт REFUTED; сводная таблица — `reports/KAIF_AUDIT/2026-08-14_r2_triage_SUMMARY.md`).

| № | Вердикт | Тяжесть | Эпик | Улика триажа |
|---|---|---|---|---|
| 1 | CONFIRMED | substantial | T | release/SKILL.md:87 «десять классов» (10 имён), живой showcase-lint --classes даёт lineClasses:13 (ADDRESSEE, TOOLPROOF, NBSP в навыке отсутствуют); counters-guard.mjs:141 стережёт только AGENT_GUIDE.md. Коммит 88282d5 обновил AGENT_GUIDE:668 до 13, навык не тронут — расхождение расширилось 10↔13. Не дизайн: число подано как факт о страже релиза. |
| 2 | CONFIRMED | substantial | T | bugs/68:119-120 несёт [x] «внести в реестр пар строку framework/tools/+framework/hooks/ ↔ карты», но grep framework/hooks по AGENT_GUIDE даёт лишь дерево :378, пары нет; grep hook по counters-guard.mjs пуст; check-framework.mjs:516-520 считает файлы hooks лишь для суммы бандла. «Three hooks» (adapters/claude-code.md:32-33) сегодня истинно, но обещанный и «сданный» страж не существует — не дизайн, а неисполненное обещание. |
| 3 | CONFIRMED | substantial | T | AGENT_GUIDE.md:668 заявляет «13 классов, каждый записан формой», но перечислены 11 имён; grep ADDRESSEE·TOOLPROOF по AGENT_GUIDE и release/SKILL.md пуст — строка противоречит себе. counters-guard:141 сверяет только цифру; состав «Nine language packs» (KAIF_REFERENCE:181/182) и дерево _thin-intro:77-88 не судятся. 88282d5 добавил NBSP, но два класса не названы нигде в каноне. |
| 4 | CONFIRMED | substantial | T | counters-guard.mjs:10 «со ВСЕМИ зеркалами разом»; зеркало STATUS (:177-179) ловит 4 ключа, а «14 документов / 7 README» (STATUS:50) и «14 сводов» (:52) вне паттерна при живом приглашении «не переписывай руками» (:51). Довод «намеренный дизайн» (комментарий MIRRORS о переводе прописи в цифры) отклонён: цифровые зеркала STATUS тоже не стерегутся, а пропись AGENT_GUIDE:14 и :503 не сконвертирована и не стережётся. Пробы кругов зеленели. |
| 5 | CONFIRMED | substantial | T | counters-guard.mjs:418-420: named() тестирует text ВСЕГО файла, finding зовётся «перечисление tool-модулей» — то есть проверка позиционируется стражем перечисления. Второе вхождение kaif-requirements-lint вне перечисления (AGENT_GUIDE:658, внутр. карта :65) маскирует дрейф строк дерева обоих главных файлов (распределение 2/2/1 подтверждено). Пробы M3a/M3b/T2 exit 0, контроль T3 exit 1 — слепое пятно доказано мутацией. |
