# Разведка 2.10: группа update-tools (#154 · #150 · #151 · #152 · #116 · #117 · #119)

> **Тикеты:** #154 · #150 · #151 · #152 · #116 · #117 · #119. Тела и все комментарии взяты из `scratchpad/issues/<N>.md`,
> прочитаны 2026-10-18 02:17 +0300. **Сверено с HEAD** `250cf7a`; `framework/` = `v2.9` (`git diff --stat v2.9 HEAD -- framework/` →
> пусто). `dist/KAIF-CORE.mjs` тега v2.9 побайтно равен `framework/installer/KAIF-CORE.mjs` (`cmp` → равны). Пробы шли
> 2026-10-18 02:17–02:30 +0300.
> **Пробы** шли только в `mktemp -d` = `/tmp/tmp.LxKHiTSHNL` (в конце удалён). Сборки брались из `git archive v2.7|v2.8|v2.9 dist`.
> Схема везде одна: ядро и бандл кладутся в `.kaif/` руками, `install`, коммит (`git -c user.name=probe …`), затем
> `update --source <копия dist 2.9>` (локальный источник, сеть не нужна). Загрузчик не запускался.
> - `P154` — установка 2.8, фрагмент хуков 2.8 целиком скопирован в `.claude/settings.json` (так выглядело 2.8 opt-in), затем update → 2.9.
>   `P154L` — то же, но запись лежит в `.claude/settings.local.json`.
> - `P150b` — установка 2.8, слоты `<BUILD_COMMAND>`/`<TEST_HARNESS>` заполнены руками во всех md, кроме `.kaif/KAIF_REFERENCE.md`, затем update → 2.9.
>   `P150a` — чистая установка 2.9 в npm-проект с `scripts.build`/`scripts.test`.
> - `P116a/b` — портрет «жанровая оболочка + слепок» под копией `kaif-voice-lint.mjs` 2.9.
> - `P117` — дерево с заявлениями о версии и ядро 2.9, `stale-claims`.
> - `Pru` — чистая установка 2.9 `--lang ru` (provenance). `P152` — установка 2.7 `--lang ru`, затем update → 2.9.
>
> **Важно о маршруте.** На пути `update` механический проход делает СТАРОЕ ядро, уже развёрнутое в проекте. В `P154` строка
> `update: 2.8 → 2.9` напечатана ядром 2.8, и только оно потом записало ядро 2.9. `handleDeprecations` в v2.8 и v2.9 побайтно
> одинаковы (`awk`-вырезка + `cmp`), `scanStaleClaims` тоже. Отсюда следствие: правка ядра 2.10 не сработает на маршруте `update`
> 2.9 → 2.10. На всех маршрутах работает только правка ДАННЫХ бандла: текста, файла поставки, записи DEPRECATIONS. Второй путь —
> акт свежего ядра (`checkpoint recheck`, `update-verify`; прецедент UT2).
>
> Исток не тронут: в `git status` есть `M MASTER_PLAN.md · STATUS.md · interviews/decisions/shown.json`. Это правки главной сессии,
> не мои: в репозитории я только читал (`git show` / `diff` / `archive`).

---

### #154 — обновление удаляет скрипт снятого хука раньше, чем уходит его запись в `.claude/settings.json`; при отказе `wire-hooks` каждый вызов инструмента запускает хук на несуществующем файле

- **Суть:** шаг отставки ядра безусловно удаляет `.kaif/hooks/pretool-owner-word.mjs`. Запись, которая его запускает, снимает
  `wire-hooks`, а эту запись харнесс может запретить (Claude Code auto mode: «[Self-Modification]»). Между обновлением и командой
  владельца каждый вызов инструмента запускает `node` на отсутствующем файле и получает exit 1.
- **Сверка с HEAD:**
  - «the core does the first unconditionally… and the first runs first»: **CONFIRMED.** `framework/installer/KAIF-CORE.mjs:1506`
    `unlinkSync(d.path);` стоит внутри `handleDeprecations`, и та не читает ни один файл настроек. Её зовут из механического прохода
    обоих маршрутов: `:2559` `const dep = handleDeprecations(meta, old, fills);` и `:3680`
    `const dep = cls ? handleDeprecations(meta, cls.baselineOld || {}, cls.fills) : { removed: 0, items: [] };`. Снятие записи — это
    пункт задания, т. е. акт агента ПОЗЖЕ (`:4995`, «if it REFUSES, do not work around it»).
  - Репро тикета: **CONFIRMED пробой** `P154`. Вывод дословно:
    `ls: cannot access '.kaif/hooks/pretool-owner-word.mjs': No such file or directory`, при этом
    `41:            "args": ["${CLAUDE_PROJECT_DIR}/.kaif/hooks/pretool-owner-word.mjs"],`. Лог обновления:
    ``- retired .kaif/hooks/pretool-owner-word.mjs (retired in 2.9 by the KAIF owner's word (origin ticket #144): … `node .kaif/kaif-core.mjs wire-hooks` removes its entry from .claude/settings.json``.
    Хук так, как его запустит Claude Code: `echo '{}' | node .kaif/hooks/pretool-owner-word.mjs` → `hook rc=1`,
    `node:internal/modules/cjs/loader:1479`. Отказ записи (`chmod -w` + `attrib +r`) → `wire rc=1`,
    `Error: EPERM: operation not permitted, open '…\.claude\settings.json'`. Отказ правами файла (вторая ветка репро тикета) — это
    фатальный стек `node:fs`, а не названный отказ. Отказ классификатора харнесса приходит раньше, до запуска команды, и здесь не
    воспроизводим (NOT-VERIFIABLE-HERE).
  - «a refusal is a foreseen, legal state»: **CONFIRMED.** `:4649` ``verdictLine = `${tag}: wire-hooks NOT wired (${why}): ${v}`;``.
    Отметка принимает слова отказа, и обновление закрывается законно, хотя хук висит.
  - Авторы ядра знали, что делает запись без скрипта: **CONFIRMED.** `:4912`
    `// script a wired hook only exits 1: Claude Code calls that a non-blocking error, but prints a hook-error notice in the transcript.`
  - «exit 1 (a non-blocking hook error in Claude Code)»: **NOT-VERIFIABLE-HERE** (живой Claude Code не запускался). Exit 1 наблюдён.
- **Класс:** два акта с разными хозяевами идут в опасном порядке. Цель удаляет ядро безусловно, а ссылку на неё снимает акт,
  который харнесс или владелец могут не дать. Сюда же: текст `successor` обещает снятие за `wire-hooks` и тогда, когда тот этого
  не сделает.
  `TWINS: searched handleDeprecations × состояния проводки (код :1496–1515, :4963–4993, :4998–5005) — found 2:`
  (1) **запись в `.claude/settings.local.json`** висит ВСЕГДА, без всякого отказа: ядро личный файл не правит. Проба `P154L`:
  скрипт удалён, `wire-hooks` → `= all 4 KAIF hooks already wired — .claude/settings.json untouched` и
  `⚠ .claude/settings.local.json (personal, never edited by KAIF) still runs a hook KAIF retired: PreToolUse → pretool-owner-word.mjs — remove that entry by hand`.
  Пункта `wire-hooks` в задании нет вовсе (`checkpoint wire-hooks` → `✖ unknown item id "wire-hooks" — it is not named in KAIF_UPDATE_TASK.md`).
  Остаётся только ⚠ в `check`. При этом лог отставки обещает: «`wire-hooks` removes its entry from .claude/settings.json».
  (2) **`"hooks": "off"` с записью, подключённой руками**: по коду `:5003`
  `if (st.retired.length) console.error(… remove that entry by hand (opted out: KAIF does not write the file)`. Удаление скрипта
  от этого состояния не зависит. Пробой не проверял.
  `TWINS: searched pretool-owner-word в sample-*-hooks.json v2.8 — found 0`: другие системы не задеты.
  Сосед из того же прогона: пункт `stale-claims` в `P154L` напечатал
  `walk: skipped 1 unreadable path(s) — a broken link, or a file git lists that the disk lacks: .kaif/hooks/pretool-owner-word.mjs (ENOENT)`.
  Это находка суда F-F4 (`ideas/32`, «Находки суда» п. 4), на HEAD она жива.
- **Кто платит сейчас:** полевые проекты на обновлении 2.8 → 2.9 или 2.10, где хук был подключён и харнесс отказал. Соседи на диске,
  только чтение: у KAST, KPOT и ndim (все 2.8) `grep -c pretool-owner-word .claude/settings.json` → 1 · 1 · 2, скрипт на месте. Три
  ближайших обновления встретят дефект. Плюс шум агента: ошибка хука на каждый вызов «учит не читать ошибки хуков». **S3.**
- **Форма починки:** порядок должен стать безопасным на всех маршрутах. Значит, нужны данные, которые старое ядро уже слушается: в
  2.10 по пути снятого хука поставить ЗАГЛУШКУ шаблоном (`process.exit(0)` и шапка «снят в 2.9, запись снимает `wire-hooks`»)
  вместо записи DEPRECATIONS. Нетронутый скрипт 2.8 старое ядро заменит обычным replace. Свежий `wire-hooks` удаляет заглушку после
  снятия записи; `check` называет заглушку-сироту. Отказ записи правами (`EPERM`) ловится и называется строкой «запись
  отказана — дай владельцу команду», а не уходит стеком. Текст `successor` разводится по трём состояниям (project · local · off).
  Проверка: свод `s14` получает случай «update 2.8 → 2.10 при `chmod -w` настроек → хук exit 0, тишина», случай local и случай off;
  мутант «заглушки нет» → красный. **≈ 0,5 чата.**
- **Пересечения:** `ideas/32` п. 12 (#145 §2.2, отказ от одного хука), «Находки суда» п. 4 (F-F4: снятый хук «нечитаемым путём»);
  открытые `bugs/` истока на эту форму нет; соседи — `bugs/129` (🔧, recheck печатает `check`).
- **Слова владельца:** нет. Комментарий 1 — действие владельца KAGO: «the owner ran `node .kaif/kaif-core.mjs wire-hooks` himself the same day».

### #150 — обновление подставляет значения проекта в объяснение слотов в `.kaif/KAIF_REFERENCE.md`

- **Суть:** подстановка `fills` при замене нетронутого файла бьёт по КАЖДОМУ вхождению строки слота. В том числе по прозе справочника,
  где `<BUILD_COMMAND>` и `<TEST_HARNESS>` упомянуты как ИМЕНА слотов. После обновления справочник объясняет механизм значениями
  одного проекта.
- **Сверка с HEAD:**
  - Источник несёт имена: **CONFIRMED.** `framework/KAIF_REFERENCE.md:308`
    ``adaptation task filled into slots the machinery could not fill (`<BUILD_COMMAND>`, `<TEST_HARNESS>`,`` (то же — v2.8:308).
  - Механизм «на каждое вхождение»: **CONFIRMED.** `framework/installer/KAIF-CORE.mjs:728` `if (v) out = out.split(ph).join(v);`;
    `:2293` `const withFills = (text) => (fillsN ? fillPlaceholders(text, fills, new Set()) : text);`; `:2332`
    `const want = f.path.endsWith('.mjs') ? content : withFills(content);`.
  - Репро тикета (маршрут обновления): **CONFIRMED пробой** `P150b`. До: ``308:adaptation task filled into slots the machinery could not fill (`<BUILD_COMMAND>`, `<TEST_HARNESS>`,``;
    лог: `⟳ hand-filled slots recognized (2): <BUILD_COMMAND>, <TEST_HARNESS> — …` и `↻ replaced .kaif/KAIF_REFERENCE.md (fills kept)`;
    после: ``308:adaptation task filled into slots the machinery could not fill (`node --check probe.mjs`, `node probe.mjs check --json`,``.
  - **Близнец сильнее тикета:** то же происходит на ЧИСТОЙ УСТАНОВКЕ. Слоты в справочник подставляет не только кэш `fills`, но и
    значения развёртывания (`:692` `'<BUILD_COMMAND>': pkg && pkg.scripts && pkg.scripts.build ? 'npm run build' : null,`).
    Проба `P150a` (npm-проект, 2.9 install) →
    ``308:adaptation task filled into slots the machinery could not fill (`npm run build`, `npm test`,``.
  - Поле, только чтение `.kaif/KAIF_REFERENCE.md` соседей: значения вместо имён — у KAGO (`` `npm run check`, `npm run gpu:info` ``),
    KAST, KUMM, ndim (`` `npm run build`, `npm test` ``); наполовину — у KPOT (`` `<BUILD_COMMAND>`, `npm test` ``). Пять из десяти.
    KAST и ndim стоят на 2.8, так что это не регресс 2.9: механизм живёт с 2.6 (UR2) и с установки.
- **Класс:** подстановка слота не различает слот и упоминание его имени. `TWINS: searched токены PLACEHOLDERS в прозе со словами
  slot/placeholder по framework/*.md — found 2:` `framework/KAIF_REFERENCE.md:308` (поставляется) и `framework/_intro.md:214`
  (уходит в транзитный `KAIF.md`, подстановкой не обрабатывается). Остальные вхождения (`AGENT_GUIDE.md:485–490`, навыки,
  `spheres/programming.md:17`) — настоящие слоты. Реальный близнец один, зато срабатывает на обоих путях.
- **Кто платит сейчас:** полевые проекты молча: справочник читает агент, объясняя механизм. Владелец не платит. **S3.**
- **Форма починки:** слоты на месте, поправить ДАННЫЕ. В `framework/KAIF_REFERENCE.md:308` назвать слоты без угловых скобок
  («the build-command and test-harness slots»). Добавить страж сборки: поставляемый md, который не держит слотов (справочник,
  спеки), не несёт ни одного токена `PLACEHOLDERS`. Полевые копии сами исправятся следующим обновлением: `unfill` вернёт значения в
  слоты, файл прочтётся нетронутым и заменится новой прозой. Проверка: свод `s21` (случай B, fills) и установка npm-проекта —
  справочник после обоих несёт имена. **≈ 0,25 чата.** Заметно дешевле, если брать вместе с `ideas/32` п. 13(б).
- **Пересечения:** `ideas/32` п. 13(б) (слоты `<BUILD_COMMAND>`/`<TEST_HARNESS>` дублируют машинный факт в 12 мест; лечение —
  указатель на `HOUSE_RULES.md` и снятие слотов: тогда и эта проза меняется); п. 14 (слот посреди строки); #73 (обратная сторона).
- **Слова владельца:** нет.

### #151 — проба хуков из README для слова `resume` даёт ложный «тихо», когда её запускает агент; нужна строка без обратной косой

- **Суть:** POSIX-строка README `printf '{"prompt":"resume\\nplan the day"}' | …` в инструменте Bash агента теряет один уровень
  экранирования. `printf` пишет сырой перевод строки внутрь JSON-строки, событие не парсится, хук молчит, и агент решает, что хук
  сломан. Тикет предлагает строку, где JSON собирает `node`.
- **Сверка с HEAD:**
  - Строка: **CONFIRMED.** `framework/hooks/README.md:73`
    `printf '{"prompt":"resume\\nplan the day"}' | node .kaif/hooks/prompt-resume-word.mjs`; подсказка `:89`
    `the second line stays silent, the event did not parse — check that the JSON reached the script`.
  - Строка из файла (байты целы) работает: **CONFIRMED.** Строка 73 развёрнутого README вырезана `sed -n 73p` в файл и запущена по
    пути → `{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"KAIF: the owner's message OPENS with the word \"resume\" …`, `rc=0`.
  - Та же строка, набранная в вызове инструмента Bash агента, молчит: **CONFIRMED наблюдением в этой сессии.** Ничего не напечатано,
    `rc=0 [inline README line]`. Слой: `printf '%s' 'a\\nb' | od -c` → `a   \   n   b`, а одиночная косая доезжает
    (`printf '%s' 'a\|b' | od -c` → `a   \   |   b`). То есть сворачивается именно `\\` → `\`, даже в одинарных кавычках. Свой след
    того же слоя: мой heredoc скрипта пробы потерял `\\` (`.replace(/\/g, '/')` → `SyntaxError`), это урок памяти истока EXP-0121.
  - Предложенная строка работает в агенте: **CONFIRMED.**
    `node -e "process.stdout.write(JSON.stringify({prompt:'resume'+String.fromCharCode(10)+'plan the day'}))" | node .kaif/hooks/prompt-resume-word.mjs`
    → `{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"KAIF: the owner's message OPENS with the …`.
  - PowerShell-строка (`:81`) в инструменте PowerShell агента работает: **CONFIRMED** (`len=1158`, вывод начинается с
    `{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit"`). Дефект только в POSIX-блоке.
- **Класс:** поставляемая командная строка несёт `\\`, рассчитанный на оболочку, а исполнитель (агент) идёт через слой, который
  сворачивает один уровень. Свод истока этого не видит, и это записано в нём самом: `tools/sandbox/s14-refresh-hooks.mjs:318`
  `// Строка кладётся в ФАЙЛ сценария и запускается по пути — не через argv оболочки (EXP-0121, EXP-0034).` Свод доказывает путь
  человека, но не путь агента. `TWINS: searched два подряд символа «\» (код 92) во всех framework/**/*.md|json, языковые пакеты
  включены — found 1: framework/hooks/README.md:73`.
- **Кто платит сейчас:** шум агента: минуты на ложное «хук сломан», риск «починки» исправного хука. Поле: KUMM. **S3.**
- **Форма починки:** заменить POSIX-строку 2 на строку без обратной косой (`node -e` + `String.fromCharCode(10)`; в ней нет `$`,
  обратных кавычек и `\`, так что она годится и для PowerShell). Страж сборки: в поставляемых md нет `\\` (одна строка поиска
  выше), и ожидание `SMOKE_EXPECT` у `s14` остаётся по позиции. **≈ 0,1 чата.**
- **Пересечения:** `bugs/121` (🔧, «проба не исполняется на оболочке владельца» — новое лицо того же бага: оболочка агента);
  `ideas/32` п. 7 (K5, «пятое лицо „текст через файлы“» в каноне экранирования, `framework/AGENT_GUIDE.md:704–716`).
- **Слова владельца:** нет.

### #152 — на языковом пакете перенос фактов проекта в `HOUSE_RULES.md` (2.8) — это ручной перевод, о котором задание обновления молчит

- **Суть:** скелет велит писать `HOUSE_RULES.md` на языке владельца, «headings included». Строки, которые надо перенести, лежат в
  АНГЛИЙСКОМ `AGENT_GUIDE.md` языкового пакета, так что перенос — это перевод (у KUMM 44 строки, ≈ 25 мин, судья нашёл в переводе
  инверсию логики стража). Задание этого не называет, а гид и навыки адресуют АНГЛИЙСКИЕ заголовки.
- **Сверка с HEAD:**
  - Скелет: **CONFIRMED.** `framework/templates/_house-rules-template.md:5–7`
    «The owner reads this file, so the / copy is written in the project's working language (`.kaif/kaif.json` → `language`), headings / included.»
  - Гид языкового пакета английский: **CONFIRMED.** `ls framework/templates/languages/ru/` →
    `GOAL.md KAIF_FRAMEWORK.md bugs homeworks ideas interviews plans researches skill-triggers.json`. Ни гида, ни скелета домашних правил
    в пакете нет.
  - Новость 2.8 о переводе на языковом пакете молчит: **CONFIRMED.** `tools/build-framework.mjs:319`
    «move your tables and recipe into `HOUSE_RULES.md` … A guide translated wholesale does the same by hand.» Сказано только о
    переводе ЦЕЛИКОМ.
  - «The `language-arrivals` item names only the skeleton file»: **CONFIRMED пробой** `P152` (2.7 `--lang ru` → 2.9). В задании:
    `- **language-arrivals** — This deployment's language is ru, and these NEW files of the release arrived in ENGLISH: .kaif/_house-rules-template.md. Skills are agent-read and ship English by policy — translate only what the OWNER reads …`.
    Новость `PROJECT FACTS MOVED…` там же (строка 41 задания). Про перевод переносимых строк ни слова.
  - Указатели на английские заголовки: **CONFIRMED.** `TWINS: searched HOUSE_RULES.md → "…" и имена разделов скелета по
    framework/ — found 6:` `framework/AGENT_GUIDE.md:223` («→ "Environment dossier"»), `:530–531` («→ / "Stands, environments and
    devices"»), `:764` («→ "Routes, recipes and conventions"»), `:771` («→ "Tools of this project"»),
    `framework/skills/refresh-context/SKILL.md:36`, `framework/skills/experience/SKILL.md:32`. Последний ДОБАВЛЕН в 2.9 фиксом #119:
    v2.8 → 0 таких строк, v2.9 → 1.
  - Поле, заголовки `## ` в `HOUSE_RULES.md` ru-соседей (только чтение): только по-русски — Game_Of_Dream, KARTUN, KAST, KPOT,
    KrinikTribit, ndim (у ndim даже `## 6. Приборы проекта`, так что русская форма не единая); только по-английски — KAGO
    (`## 6. Tools of this project`); гибрид с английским якорем в скобках — KUMM (`## 6. Инструменты проекта (Tools of this project)`)
    и KrinikCam (тот же приём, к нему пришли независимо). Указатель `→ "Tools of this project"` находит раздел грепом у 3 из 9.
  - Инверсия логики в переводе (F5 судьи KUMM): **NOT-VERIFIABLE-HERE** (это прогон поля; файл KUMM не сверял).
- **Класс:** язык файла и его адреса задают разные хозяева. Скелет переводит заголовки, поставка ссылается на английские. Это K5
  разведки 2.9 («поставка адресует раздел проектного документа по английскому заголовку шаблона»). Плюс перенос из английского
  источника в русский файл не назван как перевод с проверкой по источнику.
- **Кто платит сейчас:** полевые проекты на каждом обновлении языкового пакета через 2.8 (≈ 25 мин и судья); на каждом
  указателе — сессии ru-развёртываний (6 из 9 без английского якоря). Инверсия в домашних правилах — near-miss по доверию
  владельца. **S2** (перевод правил) / **S3** (указатели).
- **Форма починки:** (1) в скелете заголовки с английским якорем: `## 6. <заголовок на языке проекта> (Tools of this project)`,
  правилом в шапке «якорь не переводить». Все указатели поставки ищут якорь, и страж сборки проверяет, что каждое
  `HOUSE_RULES.md → "X"` совпадает с якорем скелета. (2) Одна фраза в пункте `language-arrivals` (или в новости 2.8 при
  `language ≠ en`): переносимые строки ПЕРЕВОДЯТСЯ, команды, пути и цитаты — дословно, перевод проверяется по английскому
  источнику. Проверка: свод `s07` (переведённое развёртывание) получает случай «ru, прыжок через 2.8 — пункт называет перевод» и
  страж якорей. **≈ 0,25–0,5 чата**, в составе L10N.
- **Пересечения:** `ideas/32` п. 3 L10N (8 указателей на английские заголовки; KAGO R9 — язык скелета по неверному читателю) —
  прямое; #119 (свежий указатель `experience:32`); #85 (бюджеты переведённого канона) — другой класс, как и пишет тикет.
- **Слова владельца:** нет. Цитаты владельца упомянуты в строках KUMM («paragraph-long hook descriptions with the owner's quotes»),
  но в тексте тикета их нет.

### #116 — после замены `owner-voice-core` линтер голоса читает §8 жанровой оболочки, а не слепка (SKIPPED, exit 3, или ложный зелёный)

- **Суть:** `parsePortrait` берёт ПЕРВЫЙ §8 портрета. Оболочка над слепком несёт свой §8. Если его таблица старой формы, выходит
  SKIPPED (exit 3), и 21 правило слепка не читается. Если оболочка правильной формы, выходит ложный зелёный по правилам одной оболочки.
- **Сверка с HEAD:**
  - Код: **CONFIRMED.** `framework/tools/kaif-voice-lint.mjs:247`
    `if (Object.values(KEYWORDS).some((k) => k.section.test(m[1])) || SECTION_NUMBER.test(m[1])) { start = i; break; }` и `:251`
    `for (let i = start + 1; i < lines.length; i++) if (ANY_H2.test(lines[i])) { end = i; break; }`. Модуль не знает о слепке:
    `grep -n "snapshot" framework/tools/kaif-voice-lint.mjs` → одна строка-комментарий (`:430`).
  - 2.9 против 2.8: **CONFIRMED, не тронуто.** `git diff v2.8 v2.9 -- framework/tools/kaif-voice-lint.mjs` → `34 ++++++++++++++++++++++++++--------`.
    Правки — только `load --out`, BOM в `readMarker`/`portraitPath` и часовой пояс селфтеста; `parsePortrait` вне дифа.
  - SKIPPED: **CONFIRMED пробой** `P116a` (оболочка `## 8. Machine heuristics for the linter (old shape)` с таблицей
    `Linter rule | Pattern (ripgrep) | Comment` над слепком `## 8. Machine heuristics` с `pattern | class | hint | exception`):
    `check README.md` → exit 3,
    `⚠ AUTHOR_STYLOMETRY.md: a table in §8 (line 9) lacks the pattern/hint columns — its header: Linter rule · Pattern (ripgrep) · Comment`,
    `⚠ voice-lint SKIPPED — §8 of AUTHOR_STYLOMETRY.md carries no pattern table …`.
  - Ложный зелёный (комментарий 2 ответа истока): **CONFIRMED пробой** `P116b` (у оболочки одно правило `foobar`; текст несёт оба
    стоп-паттерна слепка): exit 0,
    `✅ voice-lint OK — 0 findings in 1 file(s), 2 line(s) against AUTHOR_STYLOMETRY.md §8 (1 stop rule(s) · 0 positive(s)); …`.
  - П. 2 (сказать в пункте `owner-voice-core`): **CONFIRMED не отгружено.** `framework/installer/KAIF-CORE.mjs:1634`
    «(2) Keep ONLY your local part — the lines ABOVE the snapshot (a project preamble; a genre shell, re-derived over the new snapshot by /owner-voice)».
    Ни §8, ни линтера в тексте пункта нет.
  - `load` не задет: **CONFIRMED** (`P116a`: `load` называет оба раздела, `«8. Machine heuristics for the linter (old shape)»` и `«8. Machine heuristics»`).
- **Класс:** парсер секции по правилу «первая подходящая побеждает» на файле, который поставка САМА велит собрать из двух портретов
  с повторяющимися номерами. `TWINS: searched "start = i; break" и разборы §-секций в framework/tools/*.mjs, KAIF-CORE.mjs, hooks — found 0`
  кроме этого места.
- **Кто платит сейчас:** владелец лично: машинная половина проверки его голоса молчит или зеленеет ложно на портрете «оболочка +
  слепок». Поле: Unliminium держит локальную заплату. **S2** (ложный зелёный проверки голоса — доверие владельца).
- **Форма починки:** заплата поля, ≈ 10 строк: читать КАЖДЫЙ H2, подходящий под §8, и сливать правила. Таблица без колонок
  pattern/hint по-прежнему называется и пропускается, портрет с одним §8 ведёт себя как прежде. Плюс фраза в `ownerVoiceInstruction`:
  номера оболочки повторяются, линтер читает все §8. Модуль — файл поставки, `.kaif/tools/*` приходит заменой, так что маршрут
  не мешает. Проверка: селфтест-фикстура «оболочка со старым §8 над слепком → число правил слепка» и «оболочка с 1 правилом →
  находки слепка». **≈ 0,25 чата.**
- **Пересечения:** `ideas/32` п. 2 LB (прямое); #121 R4 (хеш слепка до конца файла — та же склейка оболочки и слепка).
- **Слова владельца:** нет.

### #117 — `stale-claims` молчит над «**KAIF** (версия 2.7)»: скобка после имени срезается как атрибуция

- **Суть:** проза судится со срезанными скобками. «(KAIF 1.6)» — это атрибуция, но «**KAIF** (версия 2.7)», «KAIF (version 2.7)»,
  «KAIF (v2.7)» — заявления о текущей версии, и их срезают так же. Комментарий 3 добавил английскую форму со ссылкой:
  `**[KAIF](…)** framework, version 2.8.`, при этом русский близнец назван.
- **Сверка с HEAD:**
  - Код: **CONFIRMED.** `framework/installer/KAIF-CORE.mjs:1469` ``let judged = isProse ? scan.replace(/(?<!\])\([^)]*\)/g, '') : scan;``.
    Окно пары — 16 символов: `:1383` `pairCache.set(v, { fwd: new RegExp(`^([^\\n]{0,16}?)${e}…`.
  - 2.9 против 2.8: **CONFIRMED, не тронуто.** Функция `scanStaleClaims` вырезана `awk` из обоих ядер, 156 = 156 строк, `cmp` → равны.
  - Репро: **CONFIRMED пробой** `P117` (`stale-claims --from 2.7 --to 2.8`). Названы только контрольные строки
    `AGENTS.md:11 — Control line A: This project runs KAIF 2.7.`, `AGENTS.md:13 — Control line B: работает на KAIF версии 2.7.` и
    русская ссылка `README.md:3 — Проект обёрнут фреймворком **[KAIF](https://github.com/MikalaiKryvusha/KAIF)** версии 2.7.`;
    итог `3 line(s)`. Молчат `AGENTS.md:3` «**KAIF** (версия 2.7)», `:5` «KAIF (version 2.7)», `:7` «KAIF (v2.7)» и английская ссылка
    `README.md:5` «… **[KAIF](https://github.com/MikalaiKryvusha/KAIF)** framework, version 2.7.». Атрибуция `:9` «(KAIF 2.6)»
    молчит правильно.
  - Причина английской ссылки (комментарий 3): **CONFIRMED по коду.** Пробел между `KAIF` и версией — `)** framework, version ` (23
    символа) — больше окна 16; у русского `)** версии ` 11 символов.
- **Класс:** эвристики-глушители сканера (скобка = история, длинный пробел = не пара) молча превращают заявление в тишину, а
  тишину сканера читают как «всё актуально». `TWINS: searched глушители scanStaleClaims (:1438, :1460, :1469, :1383) — found 3 живых
  на HEAD` (проба `P117`, `STATUS.md`, `--from 2.1 --to 2.8`): дата вне скобок
  («**The framework is KAIF 2.1 «Strong KAIF» … is live** since 2026-08-02.» — молчит; `:1460`); новая версия в строке
  («… (KAIF 2.8 update pending).» — молчит; `:1438` `if (line.includes(toVersion)) continue;`); версия ядра голоса за версию KAIF
  (`STATUS.md:3 — - Портрет голоса: слепок ядра 2.2 от KAIF заменил ядро 1.2. (asserts 1.2)`).
- **Кто платит сейчас:** полевые проекты на каждом обновлении. Устаревшая строка остаётся в `AGENTS.md` или `README.md`, у Unliminium
  два обновления подряд правили руками. **S3.**
- **Форма починки:** до среза скобок судить скобку, которая открывается словом версии сразу после имени
  (`version|версия|вер\.|v` + слова десяти языков поставки). Пробел пары считать после хвоста ссылки `](…)` + `**`/`_`. Глушители
  из LB взять тем же эпиком. Проверка: свод сканеров (`s29`) получает фикстуры P117 (4 заявления названы, атрибуция молчит). Важно:
  ядро меняется, а значит, на маршруте `update` 2.9 → 2.10 скан задания сделает СТАРОЕ ядро. Правка проявится через пункт
  `checkpoint stale-claims` свежего ядра или на следующем интервале, и это надо сказать в критерии. **≈ 0,25 чата** (LB целиком
  ≈ 1–1,5).
- **Пересечения:** `ideas/32` п. 2 LB (#121 пп. 8–9, KPOT R1, GoD R5); #75 (закрыт 2.8, другой механизм).
- **Слова владельца:** нет.

### #119 — второй случай: `BUG_FIXING_FRAMEWORK.md` велит «задокументируй в `AGENT_GUIDE.md`», а `/code-revision` ищет «таблицу инструментов `AGENT_GUIDE.md`»

- **Суть:** основной случай (`/experience`) отгружен в 2.9 вместе с гардом 5s. Гард видит только форму со стрелкой
  `AGENT_GUIDE.md → <раздел>`, поэтому указатели, сформулированные иначе, остались.
- **Сверка с HEAD:**
  - `/experience` исправлен: **CONFIRMED.** `framework/skills/experience/SKILL.md:32`
    «registry (`HOUSE_RULES.md` → "Tools of this project") — where sessions look when they RUN it»; `git diff v2.8 v2.9` — одна строка.
  - Второй случай стоит: **CONFIRMED.** `framework/BUG_FIXING_FRAMEWORK.md:130–131` «Then add it, and document it in / `AGENT_GUIDE.md`.
    The harness is a living tool — extend and document it.»; `framework/skills/code-revision/SKILL.md:54` «tools table of
    `AGENT_GUIDE.md`), the pairs registry». `git diff --stat v2.8 v2.9` по обоим файлам → пусто.
  - Гард не видит их: **CONFIRMED наблюдением.** Регулярки гарда `tools/check-framework.mjs:994–995` повторены скриптом в `$T` над
    framework/ HEAD → `guard 5s emulation: 0 refusal(s) over 92 md files`. Полевой скан (`tools/build-framework.mjs:429`, MOVES) той
    же формы со стрелкой.
- **Класс:** указатель на факты проекта, вынесенные из гида (эпик CK 2.8), страж ищет по одной форме фразы. `TWINS: searched
  AGENT_GUIDE рядом с tool|table|registry|harness|dossier|push|document без HOUSE_RULES по framework/*.md — found 4:`
  `BUG_FIXING_FRAMEWORK.md:130–131` — указатель на ЗАПИСЬ: агент пишет факты проекта обратно в гид, против переноса CK и бюджета;
  `skills/code-revision/SKILL.md:54` — на чтение; `skills/autoloop/SKILL.md:49`
  «Check the environment is ready (build toolchain, devices/services — see `AGENT_GUIDE.md`).» — на чтение, на шаг раньше нужного;
  `skills/resume/SKILL.md:101` «Verify the environment before relying on it (build toolchain, devices, services) — see `AGENT_GUIDE.md`.»
  — тоже. Не близнец: `TESTING_FRAMEWORK.md:264` (принцип остался в гиде).
- **Кто платит сейчас:** шум агента, только по сигналу из поля (KAGO). Указатель на запись медленно растит гид и бюджет. **S3.**
- **Форма починки:** четыре строки текста (запись → `HOUSE_RULES.md` → «Stands, environments and devices» / «Tools of this project»).
  Гард 5s расширить с формы стрелки до «`AGENT_GUIDE.md` в окне ±1 строки со словами вынесенных фактов (tools table, devices,
  services, document it), если рядом нет `HOUSE_RULES.md`». Проверка: красный на HEAD ровно по 4 названным строкам, зелёный после.
  **≈ 0,1–0,25 чата.** Взять вместе с якорями #152.
- **Пересечения:** `ideas/32`, «Остатки тикетов…» п. 2 (прямое); п. 3 L10N (те же указатели в `HOUSE_RULES.md`, английские заголовки); #152.
- **Слова владельца:** нет.

---

## Дополнительно: `ideas/32` «Из разведки 2.9» п. 2 (LB) и п. 3 (L10N) на v2.9

| Подпункт | На v2.9 | Улика |
|---|---|---|
| LB · #116 | **воспроизводится** | проба `P116a/b` выше: exit 3 и ложный exit 0 |
| LB · #117 + #121 п. 9 (версия ядра голоса за версию KAIF) | **воспроизводится** | проба `P117`: «(asserts 1.2)» на строке ядра голоса |
| LB · KPOT R1 (глушители: дата вне скобок · новая версия в строке) | **воспроизводится** | проба `P117`: обе формы молчат; `KAIF-CORE.mjs:1438`, `:1460` |
| LB · #121 п. 8 / GoD R5 (совет — только HTML-форма, и «строкой выше») | **воспроизводится** | вывод `stale-claims` на HEAD: «a correct line takes <!-- KAIF-VERSION-OK: reason --> on it or on the line above — in a table row, inside the row»; `KAIF-CORE.mjs:4856`, `:1707` |
| LB · KPOT R4 (`Math.round` → «100 % foreign», цитата владельца клеймится) | **стоит по коду** (пробой не мерил) | `KAIF-CORE.mjs:3949` ``if (share >= LANGUAGE_MIX_FOREIGN_SHARE) mixed.push(`${n} (${Math.round(share * 100)} % foreign)`);`` |
| LB · #121 R4 (хеш слепка до конца файла против инструмента штампа) | **стоит по коду** | `KAIF-CORE.mjs:1591` `return at < 0 ? null : lines.slice(at).join('\n');` |
| LB · #121 R5 (`curl -fsSL`) | **стоит** | `KAIF-CORE.mjs:1634` «(1) Fetch the release file: \`curl -fsSL ${ownerVoice.url} -o ${PORTRAIT_FILE}.release\`» |
| LB · `ideas/31` п. 3 (линтеры под форму языка) | не перепроверено поштучно | — |
| L10N · хуки на английских заголовках | **частично закрыто 2.9 отставкой, а не L10N**: было 5 сообщений в 4 хуках, стало 4 в 3 (ушёл `pretool-owner-word.mjs`, эпик WH) | `prompt-resume-word.mjs:127` («→ "The owner's word mid-turn"»), `:136` («→ "A leading skill word is an order"»), `prompt-refresh-timer.mjs:111`, `session-start-refresh.mjs:92` («→ "Context refresh"») |
| L10N · указатели канона на английские заголовки | **выросло**: на HEAD 11 строк `STATUS.md`/`HOUSE_RULES.md` → "…" (из них 6 — в `HOUSE_RULES.md`, см. #152). Разведка 2.9 насчитала 8, но `dayloop:49` и `AGENT_GUIDE:644` были и в v2.8 (недосчёт); `experience:32` добавлен в 2.9 | греп `(HOUSE_RULES\|STATUS)\.md\` → "` по framework/; v2.8 vs v2.9 по файлам: AGENT_GUIDE 4/4 · dayloop 1/1 · fable-judge 1/1 · experience 0/1 |
| L10N · частичный шаг 2.9 | полевой скан MOVES (UT1) знает русские заголовки гида | `tools/build-framework.mjs:429` «Инструменты\|Испытательный стенд\|Досье окружения» |
| L10N · `kaif-provenance` на ru | **воспроизводится** | проба `Pru` (2.9 `--lang ru`): `grep -c aiMarks .kaif/kaif.json` → `0`; незакрытая `[ИИ]` → `✅ provenance check OK — pairs intact in 246 file(s) …`, rc=0; подпись прозой `- [AI] выбран вариант Б — проще.` → `✖ plans/01_x.md:5 — [AI] never closed`, rc=1; `git diff --stat v2.8 v2.9 -- framework/tools/kaif-provenance.mjs` → пусто |
| L10N · KAGO R9 (язык скелета по неверному читателю) | **стоит** + поле разошлось тремя способами (см. #152: 6 по-русски · 1 по-английски · 2 с якорем) | `_house-rules-template.md:5–7` |

Итог по пп. 2–3: эпики 2.9 не закрыли ни одного подпункта LB. В L10N сдвинулись две вещи: одно сообщение хука ушло вместе со
снятым хуком, полевой скан выучил три русских заголовка. Класс указателей при этом вырос на 1 (фикс #119). #152 и #119 остаток
ложатся в L10N, #116 и #117 — в LB.

---

## Таблица

| Тикет | Вердикт сверки | Тяжесть | Цена | Кандидат-эпик (рабочее имя) |
|---|---|---|---|---|
| #154 | CONFIRMED пробой (оба файла настроек); близнецы: `settings.local.json` висит всегда, `"hooks": "off"`; отказ записи — стек `EPERM` | S3 | 0,5 | UH «Обновление: снятие без висячих ссылок» (данные бандла: заглушка вместо отставки) |
| #150 | CONFIRMED пробой; близнец сильнее тикета — чистая установка npm-проекта; в поле 5 из 10 | S3 | 0,25 | UH (или вместе с `ideas/32` п. 13(б) «слоты → указатель на HOUSE_RULES») |
| #151 | CONFIRMED наблюдением в инструменте агента; PowerShell-блок исправен; близнецов 0 | S3 | 0,1 | HR-README «Проба исполнима агентом» (с `bugs/121`) |
| #152 | CONFIRMED (скелет, пакет, задание пробой 2.7 ru → 2.9, 6 указателей); инверсия судьи — NOT-VERIFIABLE-HERE | S2 / S3 | 0,25–0,5 | L10N «Переведённое развёртывание: адреса и метки» (`ideas/32` п. 3) |
| #116 | CONFIRMED пробой: SKIPPED exit 3 и ложный зелёный exit 0; 2.9 не трогала `parsePortrait` | S2 | 0,25 | LB «Линтеры честные» (`ideas/32` п. 2) |
| #117 | CONFIRMED пробой (4 формы молчат, включая английскую ссылку комм. 3); сканер v2.8 ≡ v2.9 | S3 | 0,25 (LB целиком ≈ 1–1,5) | LB |
| #119 (второй случай) | CONFIRMED; гард 5s на HEAD — 0 отказов; близнецов 4 (один — указатель на запись) | S3 | 0,1–0,25 | L10N (адреса в `HOUSE_RULES.md`) или хвост UT |

Временный каталог `/tmp/tmp.LxKHiTSHNL` удалён по окончании (см. последнее сообщение разведчика).
