# Bug 99 — установщик и загрузчик печатают НАМЕРЕНИЕ вместо записанного, а непонятую опцию проглатывают молча

**Status:** 🔬 ПРЕДПОЛОЖИТЕЛЬНЫЙ — не верифицирован, причина не установлена · скоуп **2.3**
**Version/build:** build 279 · **When/context:** круги ревью R1/R2 фазы R, 2026-08-09
**Fix accepted when (observable):** НЕ ОПРЕДЕЛЁН — критерий приёмки задаёт исполнитель после
установления причины (решение №70: разбор и лечение за Fable, не за автором документа)

Три вхождения из CLI-контура развёртывания: два счётчика в первых строках, которые владелец
читает после установки, и одна опция загрузчика. Общее — не совпадение того, что печатается, с
тем, что оказалось на диске (вхождения 1–2), и молчание там, где просьба не понята (вхождение 3).
Причина ни у одного не установлена; ниже только адрес, заявленное, наблюдаемое и улика.

Все три адреса открыты и перепроверены 2026-08-09 на HEAD `2079536` (после шести сегодняшних
блокеров). Прогоны сделаны из свежих песочниц вне репозитория, копией `dist/KAIF-CORE.mjs` +
`dist/KAIF-CORE-BUNDLE.md`; рабочее дерево не менялось.

---

## 1. Счётчик `translated` в итоговой строке установки — размер языкового пакета в бандле, а не число записанных файлов

**Адрес:** `framework/installer/KAIF-CORE.mjs:334` — `return { deploy: out, translated: overrides.size };`
Печать этого числа: `framework/installer/KAIF-CORE.mjs:1983` (в build 279 адрес был `:1944` —
строка сместилась, содержимое то же). Зеркало поставки: `dist/KAIF-CORE.mjs:334` (побайтно).

**Заявлено.** Итоговая строка читается как отчёт о записанном:
`✅ KAIF X.Y deployed mechanically (lang ru · N owner docs templated · … )`.

**Наблюдалось.** `translated` берётся как `overrides.size` — число членов языкового пакета В
БАНДЛЕ. Между этим числом и диском стоят `writeIfNew` (`:454`) и ветка `OWNER_SEEDED` (`:86`,
`:1094`): существующий владельческий файл не перезаписывается. При установке поверх готовых
`GOAL.md` и `KAIF_FRAMEWORK.md` лог называет 8, шаблон получают 6. Ассертов на этот счётчик в
`tools/` нет: `grep -rn "owner docs templated" tools/` — пусто.

**Улика.** Две установки в песочницы (`b99a` — чистая, `b99b` — с заранее положенными
владельческими `GOAL.md` и `KAIF_FRAMEWORK.md`):

```
$ node KAIF-CORE.mjs install --lang ru --mode anonymous --bundle KAIF-CORE-BUNDLE.md
# b99a (чисто):
✅ KAIF 2.2 deployed mechanically (lang ru · 8 owner docs templated · 31 skills trigger-aliased, mode anonymous, agents claude-code,codex,grok-build,cline,zoo-code).
$ node -e "...(GOAL.md match /[Ѐ-ӿ]/g).length"
cyrillic chars in clean-install GOAL.md: 1353

# b99b (GOAL.md и KAIF_FRAMEWORK.md положены заранее):
= kept existing GOAL.md
= kept existing KAIF_FRAMEWORK.md
✅ KAIF 2.2 deployed mechanically (lang ru · 8 owner docs templated · 31 skills trigger-aliased, mode anonymous, agents claude-code,codex,grok-build,cline,zoo-code).
$ cat GOAL.md
# OWNER GOAL

This is the owner. Not a template.
$ cat KAIF_FRAMEWORK.md
# OWNER FRAMEWORK

Owner text.
```

**Кого касается.** Владельца, ставящего KAIF поверх уже начатого проекта: строка называет объём
локализации, которого на диске нет. Класс тот же, что закрывал `bugs/65` (счётчик судит план, а
не диск), и живёт он в соседнем поле той же строки лога.

**Замечено.** Круг R2 фазы R, 2026-08-09.

**Состояние на 2026-08-09.** Адрес на месте, наблюдаемое воспроизводится дословно. Соседний
счётчик той же строки — `aliased` — с `bugs/65` читает диск (`countAliasedOnDisk`, `:290`);
`translated` — нет.

---

## 2. `logPackHonesty` печатает «all 35 skill bodies» строкой выше счётчика, который в том же прогоне говорит «31 skills trigger-aliased»

**Адрес:** `framework/installer/KAIF-CORE.mjs:356` — `const skills = deploy.filter((f) => skillName(f.path)).length;`
и печать на `:357`. Зеркало поставки: `dist/KAIF-CORE.mjs:356` (побайтно). Вторая строка того же
прогона — `framework/installer/KAIF-CORE.mjs:1983` (в build 279 — `:1944`). Документ о закрытии
класса: `bugs/65_DONE_assert_judges_proxy_not_claimed_property.md`.

**Заявлено.** `bugs/65` помечен `✅ DONE — все четыре вхождения закрыты`, вхождение №1 в его
таблице: «счётчик равен числу навыков **в бандле** (план)» → «столько навыков **на диске** несут
алиасную строку». Комментарий в коде (`:281`): «The "N skills trigger-aliased" summary counts what
is ON DISK, never what was planned».

**Наблюдалось.** `logPackHonesty` считает по `deploy` — списку НАМЕРЕНИЯ: `deploy` формируется до
фильтра анонимности, `isSkippedAnon` применяется ниже, на записи (`:855`, `:1245`, `:1785`,
`:1794`). Один прогон печатает 35 и 31 подряд. Стража нет: `grep -rn "skill bodies" tools/` даёт
единственное совпадение — `tools/sandbox/s11-l5-remaining.mjs:277`, и оно проверяет лишь наличие
подстроки `skill bodies` в выводе, не число.

**Улика.** Тот же прогон, что в вхождении 1 (песочница `b99a`), строки 1 и 149 вывода:

```
$ node KAIF-CORE.mjs install --lang ru --mode anonymous --bundle KAIF-CORE-BUNDLE.md
1:⟳ language pack "ru" is INCOMPLETE BY DESIGN (the framework is English-first): it localizes 8 owner doc(s). Arriving in ENGLISH and needing manual transfer if you want them localized: .kaif/KAIF_REFERENCE.md, … reports/README.md + all 35 skill bodies (their trigger aliases ARE localized).
149:✅ KAIF 2.2 deployed mechanically (lang ru · 8 owner docs templated · 31 skills trigger-aliased, mode anonymous, agents claude-code,codex,grok-build,cline,zoo-code).

$ ls .claude/skills | wc -l
31
```

```
$ grep -rn "skill bodies" tools/
tools/sandbox/s11-l5-remaining.mjs:277:ok(r.out.includes('AGENT_GUIDE.md') && /skill bodies/.test(r.out),
```

**Кого касается.** Владельца анонимного развёртывания: первая честная строка установки называет
неверный объём ручной работы по локализации. И принимающего `bugs/65`: документ о закрытии класса
объявляет закрытым то, что в соседней строке того же лога живо.

**Замечено.** Круг R1 (класс), круг R2 (это вхождение), 2026-08-09.

**Состояние на 2026-08-09.** Адрес на месте, наблюдаемое воспроизводится дословно: 35 и 31 в одном
прогоне, 31 каталог на диске.

---

## 3. Неизвестное имя канала молча подменяется на `release` — загрузчик не сообщает, что просьбу не понял

**Адрес:** `framework/installer/KAIF-LOADER.mjs:35` —
`const SOURCE = val('--source') || SOURCES[(val('--channel') || 'release').toLowerCase()] || SOURCES.release;`
Та же строка едет в поставке: `KAIF.md:107` (побайтно совпадает).

**Заявлено.** `KAIF.md:60-63` разделяет каналы по смыслу и учит агента их различать; шапка
загрузчика (`KAIF.md:83-86`) объявляет ровно два имени: `--channel release` (по умолчанию,
опубликованный релиз) и `--channel main` (dist/ ветки main, для разработки).

**Наблюдалось.** Любое имя вне словаря `SOURCES` тихо подставляет `release`. Единственная
печатаемая строка называет URL, но не говорит, что канал не распознан.

**Улика.** Свежая песочница `b99c`, копия `framework/installer/KAIF-LOADER.mjs`:

```
$ node KAIF-LOADER.mjs --channel stable --lang ru
KAIF-LOADER: fetching installer from https://github.com/MikalaiKryvusha/KAIF/releases/latest/download
+ .kaif/kaif-core.mjs (110743 bytes, sha256 ok)
+ .kaif\install\KAIF-CORE-BUNDLE.md (573635 bytes, sha256 ok)
KAIF-LOADER: machinery 2.1 verified — handing over to KAIF-CORE
+ .gitignore: ignore-first for .kaif/install/, KAIF.md, KAIF-LOADER.mjs, …
+ wrote AGENT_GUIDE.md
…
```

Про `stable` — ни слова.

**Кого касается.** Того, кто промахнулся мимо имени канала: он получает 2.1 из `releases/latest`
вместо 2.2 из `main`, и единственный признак — легко пропускаемая строка `machinery 2.1
verified` в середине вывода.

**Замечено.** Круг R2 фазы R, 2026-08-09.

**Состояние на 2026-08-09.** Адрес на месте, наблюдаемое воспроизводится дословно; версия в строке
`machinery … verified` — 2.1, как и в исходной находке.
