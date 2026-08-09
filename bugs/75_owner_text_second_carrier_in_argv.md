# Bug 75 — поставка сама велит гнать текст владельца через argv: у команды `project-name` нет ни предупреждения, ни файлового варианта

**Status:** 🔴 OPEN
**Version/build:** build 237 · **When/context:** круг R1 фазы R (`plans/59` шаг 7), 2026-08-09
**Fix accepted when (observable):** `kaif-core project-name` с не-ASCII в argv либо отвергается,
либо предупреждает вслух, и у команды есть `--name-file <путь>`; свод полигона доказывает оба
поведения.

## Symptom

Фаза L5 завела **второй носитель владельческого текста в argv** — команду
`kaif-core project-name "<Canonical Name>"`. У соседа по классу (`checkpoint --verdict`) есть и
предупреждение, и файловый вариант `--verdict-file`; у `project-name` нет ни того, ни другого.

Искажённое значение здесь не просто теряется — оно **записывается**: в маркер развёртывания, в
карту подстановок `<PROJECT_NAME>`/`<SHORT_NAME>` манифеста и в снимки развёрнутых документов.
Каноническое имя проекта по определению есть текст ВЛАДЕЛЬЦА — сама справка команды это и говорит:
«the OWNER's form, e.g. "project C" — confirm it with the owner, never guess».

## Repro (deterministic)

```
node <скрипт с кириллическим именем В ТЕЛЕ файла> …
# → «✔ canonical project name recorded: Йолден КАИФ — future fills use it…», exit 0
# ни одного предупреждения; в маркере лежат байты d0 99 d0 be …
```

Контраст в том же файле:

```
grep -n "non-ASCII" framework/installer/KAIF-CORE.mjs
# :2134  ⚠ non-ASCII text in --verdict travels through the shell and can be silently mangled
#        on some profiles (PowerShell 5.1) — prefer --verdict-file: text travels through files
grep -n "'project-name':" framework/installer/KAIF-CORE.mjs
# :2301  flags: {}          ← файлового варианта не заведено
```

То есть механизм предупреждения в ядре **есть** — но только у чекпоинта.

## Forensics

- Адрес: `framework/installer/KAIF-CORE.mjs:2009` (валидация аргумента) и `:2301` (объявление
  команды без флагов).
- Правило канона обоих слоёв, `framework/AGENT_GUIDE.md:498` (зеркало `AGENT_GUIDE.md:529`):
  «TEXT TRAVELS THROUGH FILES, NEVER THROUGH COMMAND-LINE ARGUMENTS. Feeding a tool Cyrillic (or
  any non-ASCII), curly quotes, emoji, multi-line content, markdown, JSON? Write a UTF-8 file and
  pass the PATH.» Правило прямо связывает **АРГУМЕНТ**, а не документ (`AGENT_GUIDE.md:555`).
- Инвентарь позиционных команд: `grep -n "pos: 1" framework/installer/KAIF-CORE.mjs` → три —
  `checkpoint` (машинный id, есть `--verdict-file` и предупреждение), `sphere` (машинное имя,
  ASCII по конвенции), `project-name` (**текст владельца, без прикрытия**).
- Класс оплачен полем дважды: `bugs/46` (искажённое сообщение коммита), EXP-0034 (MSYS2
  конвертирует argv Windows-программ). Инструмент собственных коммитов уже носит страж не-ASCII в
  argv — поставка его не носит.

## Root cause

Правило «текст — через файлы» применили к инструментам ЭТОГО репозитория (`tools/commit.mjs`) и к
одной команде поставки (`checkpoint`), но не сделали его **свойством класса**: любая новая команда,
принимающая человеческий текст позиционным аргументом, рождается без прикрытия, потому что ни один
страж не спрашивает «этот аргумент — текст человека?».

Асимметрия цены довершает дело: команда отрабатывает зелёным, код возврата 0, файлы целы — испорчено
только то значение, которое потом увидит человек, и агент своего нарушения не видит вовсе.

## Fix plan

- [ ] Добавить `project-name` предупреждение о не-ASCII в argv (тот же текст, что у `checkpoint`)
      и флаг `--name-file <путь>`.
- [ ] Проверить остальные точки приёма человеческого текста в `KAIF-CORE.mjs` тем же вопросом и
      закрыть класс формой: общий помощник `readOwnerText(argvValue, fileFlag)`, через который
      проходит ЛЮБОЙ человеческий текст, — тогда следующая команда родится прикрытой.
- [ ] Свод полигона: не-ASCII в argv → предупреждение в выводе; `--name-file` → значение доезжает
      побайтно (сравнение хешей).
- [ ] Красная мутация: снять предупреждение — свод обязан краснеть.

## Decisions made without the owner

*Заполняется при закрытии.*

## Links

`bugs/39_DONE` (раздел TWINS — инвентарь класса был неполон: `project-name` в него не вошёл) ·
`bugs/46` · `AGENT_GUIDE.md` → «Гигиена документов и текста» · EXP-0034 · `plans/44` (фаза L5).
