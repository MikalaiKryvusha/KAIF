# Bug 100 — канон-реестры: строка реестра перечисляет оси инструмента поимённо и одну из них не называет

**Status:** 🔬 ПРЕДПОЛОЖИТЕЛЬНЫЙ — не верифицирован, причина не установлена · скоуп **2.3**
**Version/build:** build 279 · **When/context:** круги ревью R1/R2 фазы R, 2026-08-09
**Fix accepted when (observable):** НЕ ОПРЕДЕЛЁН — критерий приёмки задаёт исполнитель после
установления причины (решение №70: разбор и лечение за Fable, не за автором документа)

Семейство про КАНОН-РЕЕСТРЫ — места, где документ обвязки перечисляет содержимое инструмента
поимённо и тем самым заявляет исчерпывающий список. Одно вхождение: строка таблицы «Инструменты»
в `AGENT_GUIDE.md`, описывающая `doc-header-lint`, называет оси конструкцией «Плюс ось …», а ось
«закрытие против тела» в перечислении не наблюдалась. Причина НЕ устанавливалась, план починки не
предлагается — ниже только адрес, заявление, наблюдение и улика.

---

## 1. Канонический реестр перечисляет оси `doc-header-lint` поимённо и называет четыре: оси «закрытие против тела» в строке нет

**Адрес:** `AGENT_GUIDE.md:658` — строка таблицы «Инструменты», ячейка
`` | `node tools/doc-header-lint.mjs` | Линтер шапки-меты И блока требований документов знаний … | ``.
Другой адрес того же вхождения: `tools/doc-header-lint.mjs:438` — `function lintClosureVsBody(…)`.

**Заявлено.** Строка реестра описывает инструмент исчерпывающе: после базового описания шапки и
блока требований она перечисляет оси одна за другой конструкцией «Плюс ось …», каждая с адресом
породившего её документа (`задача T2`, `задача T8`, `` `bugs/78` ``, `` `bugs/72` ``). Форма
перечисления читается как полный список того, что инструмент стережёт.

**Наблюдалось.** В строке 658 четыре вхождения «Плюс ось»: ось ИМЁН `plans/` (T2) · ось МЕТОК
ВРЕМЕНИ (T8) · ось ПРАВДИВОСТИ метки (`bugs/78`) · ось **PENDING без СУДЬБЫ** (`bugs/72`). Оси
«закрытие против тела» среди них нет. Подстрока `bugs/76` — адрес документа, породившего эту ось, —
в `AGENT_GUIDE.md` не встречается НИ РАЗУ (0 совпадений на весь файл); подстроки `ClosureVsBody`
в файле тоже нет. При этом в самом инструменте функция существует (`tools/doc-header-lint.mjs:438`)
и вызывается из пяти мест прохода (строки 543, 554, 564, 574, 584), то есть ось живая. Соседние
фиксы той же волны (`bugs/72`, `bugs/78`) свои оси в эту же строку вписали.

**Улика.**

```
$ node -e "const l=require('fs').readFileSync('AGENT_GUIDE.md','utf8').split(/\r?\n/)[657];
           console.log('axes named:', (l.match(/Плюс ось/g)||[]).length);
           console.log('bugs/76 on line 658:', /bugs\/76/.test(l));"
axes named: 4
bugs/76 on line 658: false

$ grep -c "bugs/76" AGENT_GUIDE.md
0
(grep exit: 1)

$ grep -n "^function lint" tools/doc-header-lint.mjs
129:function lintFull(relPath, lines, findings) {
145:function lintBugs(relPath, lines, findings) {
157:function lintGoalVector(dir, relPath, lines, findings) {
179:function lintPlanNaming(root, findings) {
267:function lintStamps(relPath, lines, findings) {
402:function lintStampTruth(root, relPath, lines, findings, baseline, debt) {
438:function lintClosureVsBody(relPath, lines, findings) {
480:function lintPendingFate(relPath, lines, findings) {
498:function lintInterview(relPath, lines, findings) {
505:function lintRoot(relPath, lines, findings) {
604:function lintDecisionNumbers(root, findings) {

$ grep -n "lintClosureVsBody(" tools/doc-header-lint.mjs
438:function lintClosureVsBody(relPath, lines, findings) {
543:    lintClosureVsBody(rel, stampLines, findings);
554:    lintClosureVsBody(rel, lines, findings);
564:    lintClosureVsBody(rel, lines, findings);
574:    lintClosureVsBody(rel, lines, findings);
584:    lintClosureVsBody(f, lines, findings);
```

**Кого касается.** Сессию, которая узнаёт о стражах из канона обвязки, а не из исходника
инструмента: о стороже, сверяющем заявление о закрытии с телом документа, из `AGENT_GUIDE.md` она
не узнает. Находка такого стража («документ объявляет себя ЗАКРЫТЫМ, а в теле N невыполненных
пунктов `- [ ]`») приходит от оси, которой в реестре нет, и рискует быть прочитанной как шум.
Затрагивает также всех, кто ищет по `bugs/76` в канон-слое: адрес там не находится, хотя ось
из этого документа исполняется.

**Замечено.** Круг ревью R2 фазы R, 2026-08-09.

**Состояние на 2026-08-09.** Адрес на месте, наблюдаемое воспроизводится дословно: строка 658
`AGENT_GUIDE.md` — та самая ячейка `doc-header-lint`, «Плюс ось» в ней ровно 4, `bugs/76` в файле
0 совпадений; `lintClosureVsBody` в `tools/doc-header-lint.mjs:438` на месте и вызывается.
Шесть блокеров, закрытых сегодня (300104b, 6bf6445, 2cb1c33, f65107f, 2079536), вхождение не
затронули.

## Триаж 2.3 (фаза S, 2026-08-14)

> Вердикты двухступенчатого триажа (механика на HEAD → скептик, дефолт REFUTED; сводная таблица — `reports/KAIF_AUDIT/2026-08-14_r2_triage_SUMMARY.md`).

| № | Вердикт | Тяжесть | Эпик | Улика триажа |
|---|---|---|---|---|
| 1 | CONFIRMED | hygiene | T | AGENT_GUIDE.md:657 (сдвиг с 658): строка doc-header-lint содержит ровно 4 «Плюс ось» (T2, T8, bugs/78, bugs/72), оси «закрытие против тела» нет; grep bugs/76 / ClosureVsBody / «против тела» / перифраз по всему файлу — 0 совпадений, т.е. ось не описана в каноне нигде. Ось живая: tools/doc-header-lint.mjs:438 function lintClosureVsBody с CLOSED_CLAIM_RE, вызывается из 5 мест (543, 554, 564, 574, 584). Паттерн строки — поимённое перечисление каждой оси с адресом истока (соседние bugs/72 и bugs/78 вписаны), так что пропуск — не намеренный дизайн; коммита, вписавшего ось после R2, нет. |
