# Bug 94 — поставка учит гнать текст владельца через argv: контракт, инструкции и спецификация CLI не знают про файловую дверь

**Status:** 🔬 ПРЕДПОЛОЖИТЕЛЬНЫЙ — не верифицирован, причина не установлена · скоуп **2.3**
**Version/build:** build 279 · **When/context:** круги ревью R1/R2 фазы R, 2026-08-09
**Fix accepted when (observable):** НЕ ОПРЕДЕЛЁН — критерий приёмки задаёт исполнитель после
установления причины (решение №70: разбор и лечение за Fable, не за автором документа)

Четыре вхождения об одном предмете: **человеческий текст (не-ASCII) в аргументах командной
строки** в том, что KAIF отгружает наружу. Канон поставки запрещает эту форму словами, а
контракты, инструкции и спецификация CLI той же поставки её предписывают либо пропускают молча.
`bugs/75` закрыт как «класс закрыт ФОРМОЙ: у человеческого текста появилась одна дверь», — круги
R1/R2 наблюдали места, до которых эта дверь не дотянулась. Ничего из перечисленного не
диагностировано и не чинено: ниже только адреса, заявленное и наблюдаемое.

---

## 1. Контракт `<COMMIT_COMMAND>` предписывает слот `-m "<msg>"` — форму, которую тот же отгружаемый AGENT_GUIDE запрещает

**Адрес:** `framework/_intro.md:439` (строка таблицы плейсхолдеров, раздел «11. Placeholder
reference»).
Другие адреса того же вхождения: `framework/installer/KAIF-CORE.mjs:389` (дефолт, засеваемый
установщиком), `framework/AGENT_GUIDE.md:514` (запрет, абзац 512–516).

**Заявлено.** `bugs/75_DONE_owner_text_second_carrier_in_argv.md`, шапка: «класс закрыт ФОРМОЙ: у
человеческого текста появилась одна дверь `readOwnerText`, через которую проходят обе команды, и
следующая родится прикрытой». `framework/AGENT_GUIDE.md:512-514` — правило поставки дословно:
«**TEXT TRAVELS THROUGH FILES, NEVER THROUGH COMMAND-LINE ARGUMENTS.** … No `python -c "…text…"`,
no `-m "…"`, no `echo "…" > file` with non-ASCII».

**Наблюдалось.** `framework/_intro.md:439` требует контрактом сохранить литеральный слот `<msg>`
именно в argv-форме: «**Contract:** the filled value MUST keep a literal `<msg>` slot marking where
the message goes (e.g. `git add -A && git commit -m "<msg>" && git push`)». `KAIF-CORE.mjs:389`
сеет ровно эту строку как дефолт: `'<COMMIT_COMMAND>': 'git add -A && git commit -m "<msg>" && git
push'`. Файлового носителя сообщения в поставке нет: грепы по `commit -F`, `--message-file`,
`msg-file` внутри `framework/` дают ноль. Единственная реализация файловой двери живёт в обвязке
этого репозитория — `tools/commit.mjs:219,231,233` (`git commit -F "${tmpMsg}"`, комментарий:
«Сообщение идёт через `git commit -F <файл>` — текст вообще не попадает в argv/шелл») и там же
argv-режим с не-ASCII отвергается (`tools/commit.mjs:109-114`).

**Улика.**

```
$ grep -rn -- "--message-file\|commit -F\|commit --file" framework/
(пусто)

$ grep -rl '<COMMIT_COMMAND>' framework/ | wc -l
8

$ grep -n -- 'commit -F' tools/commit.mjs
219:// Сообщение идёт через `git commit -F <файл>` — текст вообще не попадает в argv/шелл
233:  run(`git commit -F "${tmpMsg}"`);
```

**Кого касается.** Класс, оплаченный полем дважды (`bugs/46`, EXP-0034), уезжает в каждое
развёртывание: поставка запрещает форму на 514-й строке AGENT_GUIDE и предписывает её контрактом на
439-й строке `_intro.md`, не называя альтернативы. Развёрнутый агент читает и то и другое.

**Замечено.** Круг R2 фазы R, 2026-08-09.

**Состояние на 2026-08-09.** Все три адреса на месте, текст воспроизводится дословно; шесть
сегодняшних блокеров (300104b, 6bf6445, 2cb1c33, f65107f, 2079536) этих строк не касались. Одно
расхождение с формулировкой находки: она говорила о «35 развёрнутых файлах», — в источнике
`framework/` плейсхолдер `<COMMIT_COMMAND>` литерально несут **8 файлов** (число развёрнутых
экземпляров при живой установке не проверялось).

---

## 2. `--name-file` не назван ни в одной инструкции поставки: задание установки, задание обновления и текст отказа учат argv-форме

**Адрес:** `framework/installer/KAIF-CORE.mjs:569` (пункт задания установки про `project-name`).
Другие адреса того же вхождения: `KAIF-CORE.mjs:754` (тот же пункт в задании обновления),
`KAIF-CORE.mjs:2139` (usage/die команды), `KAIF-CORE.mjs:2210` (текст отказа чекпоинта
`project-name`), `KAIF_ADAPTATION_TASK.md` (генерируемый файл живой установки, строка 15).
Все номера строк в `KAIF-CORE.mjs` сместились относительно записи находки (было 2171 и 2100) —
файл менялся в двух из шести сегодняшних коммитов.

**Заявлено.** `bugs/75` закрыт формой: «у человеческого текста появилась одна дверь». Usage-строка
сама объявляет контракт — `KAIF-CORE.mjs:2139`: `usage: kaif-core project-name "<Canonical Name>" |
--name-file <path>   (the OWNER's form … non-ASCII belongs in a file)`.

**Наблюдалось.** Все три места, где агенту предлагается записать каноническое имя, называют только
argv-форму:

* `:569` — «record it: \`node .kaif/kaif-core.mjs project-name "<Name>"\`»;
* `:754` — «record it: \`node .kaif/kaif-core.mjs project-name "<Name>"\`»;
* `:2210` — «confirm the canonical name with the owner and record it first: node
  .kaif/kaif-core.mjs project-name "<Canonical Name>"».

Ни одно из них не упоминает `--name-file`. Сосед по классу `--verdict-file` при этом присутствует и
в документах, и в тексте чекпоинта judge. Дверь `--name-file` живёт только в usage — то есть агент
увидит её, лишь ошибившись вызовом.

**Улика.**

```
$ grep -rn "name-file" framework/ AGENT_GUIDE.md KAIF_REFERENCE.md KAIF.md
framework/installer/KAIF-CORE.mjs:2138:    args[1] && !args[1].startsWith('--') ? args[1] : null, val('--name-file'), 'name');
framework/installer/KAIF-CORE.mjs:2139:  if (!name) die('usage: kaif-core project-name "<Canonical Name>" | --name-file <path>   …');
framework/installer/KAIF-CORE.mjs:2408:  'project-name':  { … flags: { '--name-file': true }, pos: 1 },

$ grep -rln 'verdict-file' --include=*.md .
./bugs/39_DONE_verdict_text_through_cli_argument.md
./bugs/75_DONE_owner_text_second_carrier_in_argv.md
./plans/28_EPIC_kaif_2.2_L_update_field_fixes.md
./plans/36_epic28_L_phase1_triage.md
./plans/42_epic28_L3_cli_safety_and_green_lies.md
./PROJECT_HISTORY.md
./reports/KAIF_UPDATES/KrinikCam_KAIF_2.1_UPDATE_REPORT.md
./reports/KAIF_UPDATES/Unliminium_KAIF_2.1_UPDATE_REPORT.md
./researches/15_kaif_2.2_scope_metasynthesis.md
```

Круг R2 дополнительно наблюдал живую установку: сгенерированный `KAIF_ADAPTATION_TASK.md:15` несёт
argv-форму без файлового варианта.

**Кого касается.** Владельца с не-ASCII названием проекта: единственная названная дорога — argv,
то есть ровно тот вход, ради которого дверь строилась. Отказ на `:2210` агент читает как инструкцию
и исполняет дословно.

**Замечено.** Круг R2 фазы R, 2026-08-09.

**Состояние на 2026-08-09.** Три адреса в `KAIF-CORE.mjs` на месте (со сдвинутыми номерами строк),
текст воспроизводится. `KAIF_ADAPTATION_TASK.md` в этом репозитории отсутствует — он генерируется
при развёртывании; строка 15 живой установки при заведении не перепроверялась, генератор её пункта
— `KAIF-CORE.mjs:569`. Список документов с `verdict-file` — девять, как и записано, но все девять
относятся к рабочему слою этого репозитория (bugs/plans/reports/researches/history), ни один не
входит в поставку `framework/`; это расхождение с формулировкой находки не разбиралось.

---

## 3. Единственная спецификация CLI знает измерение «мутирует дерево», но не знает «этот аргумент — текст человека»

**Адрес:** `framework/installer/KAIF-CORE.mjs:2396` — `const COMMANDS = { … }` (в записи находки
было 2362).
Другой адрес того же вхождения: `KAIF-CORE.mjs:2122` — `function readOwnerText(inline, filePath,
what)` (было 2083).

**Заявлено.** Комментарий над таблицей, `KAIF-CORE.mjs:2393-2395`: «ONE spec drives the dispatcher,
the argv validation and the help text. Flags map to "takes a value?"; `pos` is the number of allowed
positional arguments after the command. MUTATING commands are marked — a bare run and unknown input
never reach them.» `bugs/75` закрыт словами «следующая родится прикрытой». Комментарий у самой
двери, `:2116-2117`: «Every human-text input goes through this door, so the NEXT such command is
covered on the day it is written instead of on the day someone remembers the rule.»

**Наблюдалось.** У записей `COMMANDS` есть поля `fn`, `desc`, `flags`, `pos` и `mutating`;
измерения «принимает текст владельца» среди них нет. `readOwnerText` не вызывается диспетчером — он
вызывается вручную ровно из двух мест: `:2137` (`cmdProjectName`) и `:2240` (`cmdCheckpoint`, для
`--verdict`). Команда, добавленная в `COMMANDS` с позиционным аргументом, никак не связывается с
дверью.

**Улика (мутация, круг R2).** В полную копию репозитория инъецирована команда `owner-tagline` с
позиционным текстом владельца, зарегистрированная в `COMMANDS` без обращения к `readOwnerText`.
Прогон `build`, `check-framework` и полигонного `s09` — все `exit=0`, ни один гейт не сработал; в
маркер развёртывания записано «Свобода — это осознанная необходимость».

**Кого касается.** Третья команда с владельческим текстом в argv родится без предупреждения —
искажённые байты снова уедут в маркер, карту подстановок и снимки развёрнутых документов, как в
`bugs/75`.

**Замечено.** Круг R2 фазы R, 2026-08-09.

**Состояние на 2026-08-09.** Адреса на месте (номера строк сдвинулись на ~+30). Форма `COMMANDS`
неизменна: `mutating` есть, измерения владельческого текста нет; `readOwnerText` по-прежнему
вызывается из двух мест. Мутация круга R2 при заведении документа не переигрывалась (рабочее дерево
не трогалось).

---

## 4. Команда `sphere <name>` принимает не-ASCII в argv молча

**Адрес:** `framework/installer/KAIF-CORE.mjs:2094` — `function cmdSphere()` (в записи находки было
2056).

**Заявлено.** Верификация `bugs/75` выдала команде VERIFIED по чтению: «Классификация `sphere` как
машинного имени подтверждена его использованием как ключа файла».

**Наблюдалось.** Тело функции целиком:

```js
function cmdSphere() {
  const name = args[1];
  if (!name || name.startsWith('--')) die('usage: kaif-core sphere <name>   (e.g. sphere programming)');
  if (!okOnDisk(KAIF_JSON)) die('no .kaif/kaif.json — KAIF is not deployed here');
  const j = readJson(KAIF_JSON);
  j.sphere = name;
  writeFileSync(KAIF_JSON, JSON.stringify(j, null, 2) + '\n');
  log(`✔ sphere recorded: ${name}`);
}
```

Ни проверки не-ASCII, ни обращения к `readOwnerText`. В `COMMANDS:2407` у команды `sphere` пустой
`flags: {}` и `pos: 1` — файлового варианта нет. Использованием как ключ файла классификация
подтверждается; исполнителем конвенции — нет.

**Улика.**

```
$ node .kaif/kaif-core.mjs sphere "медицина"
✔ sphere recorded: медицина
(code=0, в .kaif/kaif.json кириллица, ноль предупреждений)
```

**Кого касается.** Из трёх позиционных команд, принимающих имя, третья закрыта конвенцией без
стража; развёртывания с не-ASCII названием сферы записывают её в маркер без единого сигнала.

**Замечено.** Круг R2 фазы R, 2026-08-09.

**Состояние на 2026-08-09.** Адрес на месте, код воспроизводится дословно. Прогон улики при
заведении документа не повторялся — команда мутирует `.kaif/kaif.json`, а рабочее дерево трогать
запрещено.
