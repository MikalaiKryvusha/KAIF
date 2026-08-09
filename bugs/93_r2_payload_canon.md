# Bug 93 — отгружаемый слой канона расходится с корневым: механизация обещана без исполнителя, поставка противоречит сама себе, оплаченный урок и охват подметания остались в обвязке

**Status:** 🔬 ПРЕДПОЛОЖИТЕЛЬНЫЙ — не верифицирован, причина не установлена · скоуп **2.3**
**Version/build:** build 279 · **When/context:** круги ревью R1/R2 фазы R, 2026-08-09
**Fix accepted when (observable):** НЕ ОПРЕДЕЛЁН — критерий приёмки задаёт исполнитель после
установления причины (решение №70: разбор и лечение за Fable, не за автором документа)

Семейство `поставка-канон` — четыре вхождения об одном месте: границе между *обвязкой этого
репозитория* (`AGENT_GUIDE.md`, `tools/`, `bugs/`) и *полезной нагрузкой* (`framework/`, `dist/`,
копии навыков). Во всех четырёх наблюдалось, что корневой слой и отгружаемый говорят о механизации
разное: в корне правило названо поимённо или честно объявлено человеческим, а в поставке — то же
правило изъявительно объявлено механическим, либо оплаченный урок в поставку не поехал, либо
подметающий гейт охватывает только один каталог. Причина ни у одного вхождения не устанавливалась.

---

## 1. Поставочный AGENT_GUIDE обещает «guarded mechanically» и не называет исполнителя, а инструмент в поставку не едет

**Адрес:** `framework/AGENT_GUIDE.md:731`
Те же адреса: `dist/KAIF-CORE-BUNDLE.md:810`, `dist/KAIF-FULL.md:876`

**Заявлено.** `bugs/71` закрыт (коммит `4809202`) со словами «у правила либо исполнитель, либо
честное „механизации нет“». Корневой `AGENT_GUIDE.md:799` эту же фразу чинит поимённо:
«стережётся механически (`node tools/questions-guard.mjs`, ось «вопрос ОТПРАВЛЯЕТ в документ»)».

**Наблюдалось.** В отгружаемом слое та же строка стоит без исполнителя: «A reference INSTEAD of the
content is the defect, and it is guarded mechanically, because the owner had already said it many
times…». Названного инструмента в тексте нет; `questions-guard.mjs` в поставку не входит.

**Улика.**

```
$ grep -n "guarded mechanically" framework/AGENT_GUIDE.md dist/KAIF-CORE-BUNDLE.md dist/KAIF-FULL.md
framework/AGENT_GUIDE.md:719:was "guarded mechanically" — indicative, about a check that did not exist, and a weak session reads
framework/AGENT_GUIDE.md:731:A reference INSTEAD of the content is the defect, and it is guarded mechanically, because the owner
dist/KAIF-CORE-BUNDLE.md:798:… dist/KAIF-CORE-BUNDLE.md:810:A reference INSTEAD of the content is the defect, and it is guarded mechanically, because the owner
dist/KAIF-FULL.md:864:… dist/KAIF-FULL.md:876:A reference INSTEAD of the content is the defect, and it is guarded mechanically, because the owner

$ git ls-files | grep questions-guard
tools/questions-guard.baseline.json
tools/questions-guard.mjs
```

Отдельно наблюдалось, что строка `framework/AGENT_GUIDE.md:719` для СОСЕДНЕГО правила (I17, показ)
как раз разбирает эту опасность дословно: «An earlier wording of this line claimed the rule was
"guarded mechanically" — indicative, about a check that did not exist, and a weak session reads such
a sentence as a guarantee already met», — и там же называет единственную механическую половину.
Строка `:731` этой правки не получила.

**Кого касается.** Проект в поле, развернувший KAIF: читает отгружаемый гайд, верит, что правило
стережёт машина, и не заводит ни стража, ни человека-исполнителя. Корневой документ при этом честен
— расхождение видно только тому, кто держит оба слоя рядом.

**Замечено.** Круги ревью R1/R2 фазы R, 2026-08-09.

**Состояние на 2026-08-09.** Адреса на месте, наблюдаемое воспроизводится дословно после `4809202`
и шести блокеров дня (`300104b`, `6bf6445`, `2cb1c33`, `f65107f`, `2079536`).

---

## 2. Поставка в двух местах утверждает противоположное про I17

**Адрес:** `framework/skills/owner-reviews/SKILL.md:124`
Те же адреса: `.claude/skills/owner-reviews/SKILL.md:124` (RU-зеркало),
`dist/KAIF-CORE-BUNDLE.md:5093`, `dist/KAIF-FULL.md:5635`, `framework/AGENT_GUIDE.md:717`

**Заявлено.** Навык, едущий в поставку: «I17. A mechanical check on showing. … The rule holds
through an executable command in rituals, not through intent.» RU-зеркало: «Правило держится
исполнимой командой в ритуалах, не намерением.»

**Наблюдалось.** В `framework/AGENT_GUIDE.md:717` — того же бандла — записано обратное: «The
executor of this check is THE AGENT ITSELF at the moment of sending… **No machine can do it**: the
text being checked is your reply, it never lands on disk, and no repository tool can see it.»
Исполнимой команды грепа показа среди инструментов не найдено.

**Улика.**

```
$ grep -n "The rule holds through an executable command" framework/skills/owner-reviews/SKILL.md dist/KAIF-CORE-BUNDLE.md dist/KAIF-FULL.md
framework/skills/owner-reviews/SKILL.md:124
dist/KAIF-CORE-BUNDLE.md:5093
dist/KAIF-FULL.md:5635

$ grep -n "No machine can do it" framework/AGENT_GUIDE.md dist/KAIF-CORE-BUNDLE.md dist/KAIF-FULL.md
framework/AGENT_GUIDE.md:717
dist/KAIF-CORE-BUNDLE.md:796
dist/KAIF-FULL.md:862

$ grep -rn "double-click\|opens offline\|lies at" tools/ --include=*.mjs
EXIT=1   (ни одного совпадения)
```

**Кого касается.** Слабая сессия в развёрнутом проекте: изъявительное «правило держится исполнимой
командой» читается как уже исполненная гарантия, и показ владельцу снова подменяется ссылкой. Обе
формулировки едут в чужие проекты ОДНИМ бандлом, поэтому противоречие приезжает вместе.

**Замечено.** Круги ревью R1/R2 фазы R, 2026-08-09.

**Состояние на 2026-08-09.** Все пять адресов на месте, обе формулировки воспроизведены дословно
чтением; расхождение сохраняется после `4809202`.

---

## 3. Поставка отдаёт норму «новый документ намеренно роняет прогон», но не отдаёт оплаченный `bugs/69` урок про дешёвую половину в частом ритуале

**Адрес:** `framework/skills/owner-reviews/SKILL.md:466-472` (G7)
Те же адреса: `framework/skills/owner-reviews/SKILL.md:511-514` (QA4),
`framework/skills/owner-reviews/SKILL.md:527-529` (грабля 2)

**Заявлено.** G7: «An independent sign + a frozen etalon reviewed with eyes… a new document
intentionally fails the run until the etalon is re-reviewed». QA4 повторяет то же: «A frozen parse
etalon over the live documents, with an intentional failure on a new document until the etalon is
re-reviewed (G7)».

**Наблюдалось.** Урок, оплаченный `bugs/69` (намеренный красный сработал трижды за двое суток в
пустоту, потому что прогон не вызывался ниоткуда; красный бесполезен, пока приёмка не стоит в ЧАСТО
исполняемом ритуале, а для этого ей нужна дешёвая безбраузерная половина — `--etalon-only`), в
поставку не уехал вовсе: ни ссылки на `bugs/69`, ни упоминания дешёвой половины в `framework/` нет.
Ближайшая по смыслу грабля 2 (`:527-529`) говорит про принятие инструмента ритуалом вообще, но про
цену прогона и про безбраузерную половину не говорит.

**Улика.**

```
$ grep -rln "bugs/69" framework/
EXIT=1   (пусто)

$ grep -rn "etalon-only" framework/
(ни одного совпадения)

$ git log --oneline -5 -- framework/skills/owner-reviews/SKILL.md
e15dacf  05c4361  878489c  17891f5  bc5edd0
```

Коммит починки `73f158b` («fix(bugs/69): приёмка контура снова зелёная и ВСТАВЛЕНА В РИТУАЛЫ —
вызов стерегомый», тело: «Блок 9 браузера не требовал вовсе — вынесен функцией и получил режим
`--etalon-only`: 0,12 с, 35 проверок, без браузера») среди последних коммитов файла навыка
отсутствует — файла он не трогал.

**Кого касается.** Каждый развёрнутый проект, строящий контур по этому навыку: приёмка встанет в
редкий тяжёлый ритуал, и её намеренный красный никто не увидит — ровно то, что этот репозиторий уже
прожил.

**Замечено.** Круги ревью R1/R2 фазы R, 2026-08-09.

**Состояние на 2026-08-09.** Адреса на месте, тексты G7/QA4/грабли 2 прочитаны дословно; урок в
поставке по-прежнему отсутствует.

---

## 4. Запрет отменённой формулировки `✅ same path` подметает только `framework/**`

**Адрес:** `tools/check-framework.mjs:406` (комментарий об охвате — `:404-405`, единственный вызов
обхода — `:415`)
Те же адреса: `researches/19_epic_O_refresh_mechanisms_and_env_dossier.md`,
`reports/RELEASE_NOTES_2.2.md`

**Заявлено.** Комментарий над обходом: «the sweep walks the WHOLE payload (judge finding:
docs+readmes+skills alone left spheres/adapters/templates/installer unguarded — a future leak there
would ship silently)». Сама запрещённая строка внесена в `FORBIDDEN` с обоснованием: отменённый
третий исход, который сказал полевому владельцу, что инъекция контекста Grok Build подтверждена
(`bugs/72`).

**Наблюдалось.** Обход вызывается ровно один раз и только по одному каталогу:

```
$ grep -n "walkPayload" tools/check-framework.mjs
408:  const walkPayload = (dir) => {
411:      if (statS(join(ROOT, rel)).isDirectory()) { walkPayload(rel); continue; }
415:  walkPayload('framework');
```

Всё, что вне `framework/`, под запрет не подпадает. Наблюдение на живом дереве без единой мутации:
литеральная строка `✅ same path` присутствует сейчас в трёх местах `bugs/72`, а гейт зелёный.

**Улика.**

```
$ grep -rn "same path" --include=*.md .
./bugs/72_DONE_closure_caveats_and_pendings_without_fate.md:18: … Отменённая формулировка `✅ same path` внесена в FORBIDDEN …
./bugs/72_DONE_closure_caveats_and_pendings_without_fate.md:58: … несут «✅ same path
./bugs/72_DONE_closure_caveats_and_pendings_without_fate.md:59: ✅ same path», тогда как `plans/60` …
./bugs/72_DONE_closure_caveats_and_pendings_without_fate.md:91: … отменённая формулировка `✅ same path` внесена в FORBIDDEN.
./dist/KAIF-CORE-BUNDLE.md:7815: … ⚠️ same path, same gap | ⚠️ same path, same gap |
./framework/adapters/_index.md:53: … ⚠️ same path, same gap | ⚠️ same path, same gap |
./framework/hooks/README.md:60: … ⚠️ same path, same gap | ⚠️ same path, same gap |

$ node tools/check-framework.mjs
EXIT=0
✅ check-framework OK — 57 embedded files (14 docs + 7 readmes + 35 skills + 1 tools), fences balanced,
no stray markers · dist OK (bundle 161 blocks, sha256 fresh, notes name KAIF 2.2 — Yolden KAIF) ·
module map OK (691 modules / 140 md files, core pin ok)
```

Круг R2 замерял то же мутацией на копии: строки `| Grok Build | ✅ same path | ✅ same path |`,
вставленные в `researches/19` и в `reports/RELEASE_NOTES_2.2.md`, дали `check-framework` EXIT=0.

**Кого касается.** Витрина и релиз-ноты — то, что владелец поля читает первым. Через них можно
снова сказать «инъекция контекста подтверждена» при зелёном гейте — ровно вред, ради которого
формулировку отменяли.

**Замечено.** Круги ревью R1/R2 фазы R, 2026-08-09.

**Состояние на 2026-08-09.** Адрес на месте (номер строки `:406` указывает на первую строку кода
после комментария об охвате, сам комментарий — `:404-405`). Наблюдаемое воспроизводится и без
мутации: `✅ same path` живёт в `bugs/72`, `check-framework` даёт EXIT=0. Файлы `researches/19` и
`reports/RELEASE_NOTES_2.2.md` существуют; отменённой формулировки в них СЕЙЧАС нет — вхождение
говорит об охвате гейта, а не о живой утечке в них.
