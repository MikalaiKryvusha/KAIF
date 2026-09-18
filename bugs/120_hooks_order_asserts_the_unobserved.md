# Bug 120 — Впрыснутый приказ утверждает агенту ненаблюдённое: «the context was just compacted» на старте сессии и «this session changed the tree» без наблюдения сессии (2 вхождения)

**Status:** 🔴 OPEN — найдено ревизией кода 2026-09-18 09:14 +03:00 (прогон 2 `/code-revision`, зона `framework/hooks/`);
правок в зоне НЕ делалось, фикс — отдельной задачей.
**Severity:** S2 — механический контур канона подаёт агенту как ФАКТ то, чего не наблюдал, и тем же
неверным словом приказывает проштамповать машинную улику (`trigger: "compaction"`), которую потом читают
судья и соседний хук. Железо и данные не пострадали; класс поимённо оплачен каноном
(claim-wider-than-the-observation, `framework/skills/fable-judge/SKILL.md:61`).
**Version/build:** KAIF 2.7 (открыта), HEAD `df8110b`, build 557. Носители:
`framework/hooks/session-start-refresh.mjs:59` (+ дефолт `:51`), `framework/hooks/stop-status-guard.mjs:66`
(+ наблюдение `:55`).
**When/context:** 2026-09-18 08:31 → 09:14 +03:00, отдельный worktree `agent-a3e6a3faf66ceda0c`, шаг CR5
плана `plans/63`.
**Fix accepted when (observable):**
- Ситуация. Событие `SessionStart` с `source: "startup"`, с `source: "resume"` и БЕЗ поля `source`;
  отдельно — git-дерево, где последний коммит и грязь старше сессии на 72 ч, `STATUS.md` не тронут 72 ч, а
  сессия под тестом не изменила ничего.
- Действие. Подать события хуку `session-start-refresh.mjs`; подать `Stop` с новым `session_id` хуку
  `stop-status-guard.mjs`.
- Результат. Для `startup`/`resume`/без-`source` приказ НЕ содержит ни `The context was just compacted`,
  ни `"trigger": "compaction"` (а несёт нейтральное «(re)started» и `trigger "session-start"`), при
  неизменных выводах для `compact` и `clear`. Страж STATUS печатает либо тишину, либо причину БЕЗ
  подстроки `this session changed the tree` (например «the worktree has uncommitted changes … while
  STATUS.md was last touched ~N h ago»), сохраняя подстроку `STATUS.md`.
- Проверка. `node tools/sandbox/s14-refresh-hooks.mjs` → зелёный и несёт три новых ассерта (`startup`,
  `resume`, событие без `source`) плюс ассерт на фикстуре «грязь старше сессии»; ассерты `s14:88`,
  `:96-97`, `:159-160` остаются зелёными.

## Symptom

1. **`session-start-refresh.mjs:59`** — `const trigger = source === 'clear' ? 'ritual:/clear' : 'compaction';`
   Домен `source` в Claude Code — четыре значения (`startup`, `resume`, `clear`, `compact`); код перечисляет
   ОДНО и сваливает всё прочее в «сжатие». При `startup`/`resume`/событии без поля (дефолт `:51`) в контекст
   впрыскивается «The context was just compacted: what this session now remembers of the canon is a
   retelling, not the canon» и приказ штамповать `trigger: "compaction"`. Референс-проводка защищена
   матчером `compact|clear`, НО модуль везёт два образца БЕЗ матчера — `sample-cursor-hooks.json` и
   `sample-copilot-hooks.json`, — и README помечает их `✅` в колонке «Canon after compaction»; на этих
   системах ложь приходит на КАЖДОМ старте сессии.
2. **`stop-status-guard.mjs:66`** — причина утверждает «this session changed the tree», а наблюдение под
   ней одно: `git status --porcelain` (`:55`), то есть СОСТОЯНИЕ дерева. Спецификация требовала обратного:
   `plans/57` критерий 1 — «работа В СЕССИИ И STATUS старше 3 ч», `researches/19:339` — то же. На дереве с
   трёхдневной грязью каждая новая сессия получает утверждение о работе, которой не было.

Полные карточки восьми полей — `reports/KAIF_AUDIT/2026-09-18_hooks_order-asserts-the-unobserved.md`
(F7 Attend · F8 Track).

## Repro (deterministic)

Класс-условие: любой проект, где машинерия впрыскивает агенту утверждение о факте, а под ним лежит прокси
(значение по умолчанию, состояние на диске), и прокси не назван вслух.

1. `node <копия>/session-start-refresh.mjs` со stdin `{"hook_event_name":"SessionStart","source":"startup"}`
   → приказ содержит `The context was just compacted` и `"trigger": "compaction"`. То же для `"resume"` и
   для события без поля `source`. Контроль: `"compact"` → «compacted»/«compaction»; `"clear"` →
   «cleared»/«ritual:/clear».
2. Git-фикстура: коммит с датой 72 ч назад, `STATUS.md` и грязный файл с mtime 72 ч назад, новый
   `session_id` → `stop-status-guard.mjs` печатает
   `{"decision":"block","reason":"KAIF STATUS guard (fires once per session): this session changed the
   tree, but STATUS.md was last touched ~72 h ago. …"}`.

## Forensics

- Прогон исполнителя 2026-09-18 09:02: `compact` → «was just compacted» + `"trigger": "compaction"`;
  `clear` → «was just cleared» + `"trigger": "ritual:/clear"`; **`startup` → «was just compacted» +
  `"trigger": "compaction"`; `resume` → то же**.
- Прогон исполнителя 2026-09-18 09:05 (фикстура с 72-часовой грязью): блок с текстом «this session changed
  the tree, but STATUS.md was last touched ~72 h ago».
- Независимо у скептика: то же плюс событие БЕЗ поля `source` (дефолт `:51`) и второй НОВЫЙ `session_id`,
  получающий тот же текст.
- `grep` по `*.md` на `SessionStart:startup|source=startup|startup.*compacted` → 0 (записанного решения
  нет); `s14` подаёт только `compact` (`:83`) и `clear` (`:94-95`); фикстура стража (`s14:138-157`) создаёт
  грязь ВНУТРИ прогона с комментарием «работа сессии есть — дерево грязное» — оракул повторяет приближение
  реализации (`EXP-0133`).

## Root cause / Hypotheses

Первое вхождение — регрессия оплаченного класса `bugs/66` («охват перечислен фикс-списком вместо
вычисления») в домене ЗНАЧЕНИЙ, а не файлов: судья фазы O3 нашёл ровно этот класс («a marker stamped
"compaction" after a /clear would misreport why the refresh happened» — комментарий `:57-58`) и починил
его ДОБАВЛЕНИЕМ одного значения в тернарник вместо таблицы домена. Второе — вынужденное приближение
(метки старта сессии у хука действительно нет), которое не названо вслух ни в тексте причины, ни в шапке:
шапка обещает наблюдение («did this session do work»), а код наблюдает дерево. Оба — один класс: заявление
шире наблюдения, и рядом лежит канон, который этот класс называет поимённо и требует законной формы «я
сделал X; проверь, видишь ли Y».

## Fix plan (or the fix, if done)

1. **F7:** домен `source` — таблицей, и оба слова (предложение приказа и `trigger`) брать из неё:
   `compact → ('compacted','compaction')` · `clear → ('cleared','ritual:/clear')` ·
   `startup|resume|прочее → ('(re)started','session-start')`. Тишину НЕ вводить (доктрина `:68-69`).
   В `s14` — три ассерта (`startup`, `resume`, событие без поля).
2. **F8:** говорить только наблюдённое — «the worktree has uncommitted changes (and/or the last commit is
   ~N h old), while STATUS.md was last touched ~M h ago», без слов «this session»; полный вариант — метка
   старта сессии в OS-temp (тот же ключ, что у cooldown). В `s14` — ассерт на фикстуре «грязь старше
   сессии».
3. Каждый фикс доказывается адресной мутацией; ассерты `s14:88`, `:96-97` (ветки `compact`/`clear`) и
   `:159-160` (подстрока `STATUS.md` в причине) обязаны остаться зелёными.
4. НЕ трогать: мягкость блока и его контракт («or state explicitly why nothing changed»); тишину на
   не-git проекте и `exit 0` на любом сбое git; порог `STALE_HOURS = 3`; правило «впрыскивается ПРИКАЗ, не
   тела документов» и кап 10 000.

`TWINS: searched строки машинерии поставки, утверждающие агенту факт о СЕССИИ или о причине события —
found 4: session-start-refresh.mjs:61-62 («The context was just ${…} … what this session now remembers of
the canon is a retelling») и :59 (trigger) — это F7; stop-status-guard.mjs:66 — это F8;
prompt-refresh-timer.mjs:75 («no refresh witness found this session») — НЕ дефект по смыслу (отсутствие
маркера и есть отсутствие свидетельства), но ЛОЖНО ровно в случае bugs/119 F4 (cwd ниже корня), где
свидетельство есть и хук его не видит — там же и чинится; KAIF-CORE.mjs:3020 — комментарий о «promise
instead of an address», другой класс. За пределами поставки (обвязка истока) не искал — зона прогона
framework/hooks/.`

## Decisions made without the owner

Заполняется при закрытии. На момент заведения: `[ИИ]` два вхождения в один класс-документ; `[ИИ]` тяжесть
S2 за класс (само F8 — Track, F7 — Attend); `[ИИ]` формулировка фикса F8 выбрана «дешёвая» (говорить
наблюдённое) как достаточная — полный вариант с меткой сессии назван, но не требуется критерием.

## Links

`reports/KAIF_AUDIT/2026-09-18_hooks_order-asserts-the-unobserved.md` (карточки 8 полей) ·
`reports/KAIF_AUDIT/2026-09-18_hooks_SUMMARY.md` · `testcases/reports/2026-09-18_code-revision-rewrite.md` ·
`bugs/66` (оплаченный класс: фикс-список вместо вычисления) · `bugs/119` F4 и F6 (тот же ложный `trigger`
двумя другими путями) · `EXPERIENCE.md` EXP-0133 (оракул повторяет реализацию), EXP-0040 (ритуал портит
улику) · `plans/57` критерий 1, `researches/19:339` (спецификация предиката) · `plans/58_DONE:157` ·
`framework/skills/fable-judge/SKILL.md:61` (охота «Claim wider than the observation») · `plans/63` (CR5).

**Hygiene:** `s14` 68/68 на нетронутом `dist/`; пробы всех четырёх значений `source` и события без поля;
git-фикстура с датированным коммитом и 72-часовой грязью; сверка цитат скриптом 41/42.
**Functional run:** NONE — живого подключения безматчерного образца в Cursor/Copilot не было (систем на
машине нет); наблюдения — на развёрнутых копиях модуля. Отчёт прогона —
`testcases/reports/2026-09-18_code-revision-rewrite.md`.
