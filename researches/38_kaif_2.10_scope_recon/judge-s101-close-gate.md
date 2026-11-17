# Судья сессии 101 — ворота закрытия и папка без доверия

> **Создан:** 2026-11-17 · **Родитель:** bugs/137 · bugs/138 · **Статус:** 🔴 REFUTED — 2 (заявления 1 · 6), PARTIAL — 4 (2 · 3 · 4 · 5),
> VERIFIED — 0; находок — 13 · **Вовне:** —
>
> Судья: Claude Opus 5.5, субагент главной сессии 101, только чтение (кроме этого файла); прогоны 2026-11-17 15:30–15:42 +03:00.
> Рабочее дерево во время суда МЕНЯЛОСЬ (главный агент правил `STATUS.md` 15:32, `framework/skills/resume` 15:33, `HOUSE_RULES.md` 15:36,
> ещё семь файлов вне брифа) — вердикты относятся к состоянию на 15:42.

«`/fable-judge` охотится на заявление шире прогона, который его подпирает (охота «claim wider than the observation»)» — `AGENT_GUIDE.md`, строки 392–393.

## Заявление 1 — ворота `closeGate` — **REFUTED**

Подтверждено: самопроверка 18/18; ворота отклоняют `skill: "end-chat-soft"` на 53 % без слова и молчат со словом, на 85 %, при своём
пороге проекта, для субагента, другого навыка/инструмента/события и при «нечем мерить»; формат отказа — `hookSpecificOutput.permissionDecision: "deny"`.

Опровергнуто: тот же навык, названный так, как его везде называет канон (`/end-chat-soft`, 67 упоминаний в каноне и навыках; строка самого
хука на 85 % — «then start /end-chat-soft»), проходит ворота. Проба через процесс хука (событие как у Claude Code, журнал 531 383 токенов окна 1M,
временный проект `F:/Temp/judge-s101-gate`, убран):

```
$ node <скретчпад>/judge-gate-probe.mjs
exit=0  skill="end-chat-soft"            args=""                                     → DENY
exit=0  skill="/end-chat-soft"           args=""                                     → pass (no output)
exit=0  skill=" end-chat-soft"           args=""                                     → pass (no output)
exit=0  skill="end-chat-soft "           args=""                                     → pass (no output)
exit=0  skill="/end-chat-force"          args=""                                     → pass (no output)
exit=0  skill="apps/web:end-chat-soft"   args=""                                     → pass (no output)
exit=0  skill="end-chat-soft"            args="owner: «»"                            → DENY
exit=0  skill="end-chat-soft"            args="owner: «anything the agent writes»"   → pass (no output)
temp state files written: none
temp removed: true
```

Что агентская система такие вызовы исполняет как тот же навык — снято с кода CLI 2.1.326 (`resources/native-binary/claude.exe` расширения,
`grep -a`): `validateInput({skill:i},…){let h=i.trim(); … let w=h.startsWith("/");if(w)l("tengu_skill_tool_slash_prefix",{});let r=w?h.substring(1):h`
— CLI обрезает пробелы и снимает ведущую косую (и шлёт об этом телеметрию — значит, модели так зовут). Ворота же сверяют сырой `tool_input.skill`
регэкспом `^(?:[\w-]+:)?end-chat-(soft|force)$` (`framework/hooks/context-window.mjs`, строка 112). Имя с префиксом каталога (`a/b:имя` —
форма навыков подпапок, как её показывает листинг навыков агентской системы) тоже мимо: `[\w-]` без `/`.

Не проверено: ворота на живом вызове навыка (хуки истока не запускаются и в этой сессии — 0 записей хуков в её журнале); что событие
PreToolUse несёт `skill` сырым, с косой, — следует из кода (`validateInput` вход не переписывает), живьём не наблюдено.
По построению (не дефект заявления, но граница): `owner: «…»` агент может написать сам — ворота не отличают слова владельца от своих.

## Заявление 2 — `--measure` — **PARTIAL**

Подтверждено:

```
$ node framework/hooks/context-window.mjs --measure                      # 15:31:14, из корня
KAIF context: the window is 48 % full (489231 of 1000000 tokens); the closing level is 85 % — too early to close the chat by the window: keep working. (transcript: ~\.claude\projects\d--work-ai-sandbox-KAIF\fc8be07d-….jsonl)
exit=1
$ cd framework && node hooks/context-window.mjs --measure                 # из подпапки — тот же журнал (ключ D--…, NTFS без регистра)
exit=1
$ … --measure F:/nonexistent.jsonl → «nothing to measure …», exit=2 ;  … --measure F:/Temp (каталог) → exit=2
$ … --measure ~/.claude/projects/d--work-ai-sandbox-KAIF/fc8be07d-….jsonl
KAIF context: the window is 52 % full (520072 of 1000000 tokens) …        exit=1
```

Независимая сумма последнего ответа главной нити того же журнала (свой разбор JSON): `input 2 · cc 644 · cr 519426 · sum 520072` — сходится.
Сессия без хуков: в журнале `fc8be07d` 0 записей `hook_*`. Журнал субагента (`…/subagents/agent-*.jsonl`) — код 2, верно.

Опровергнуто «последний ответ главной нити»: запись `<synthetic>` (нулевой usage, её пишет агентская система, не модель) берётся за ответ.
Журнал сессии 100 кончается такой записью (08:48:36Z):

```
$ node framework/hooks/context-window.mjs --measure ~/.claude/projects/d--work-ai-sandbox-KAIF/1f9e86a3-….jsonl
KAIF context: the window is 0 % full (0 of 200000 tokens); the closing level is 85 % — too early to close the chat by the window: keep working.
exit=1
```

— а последний настоящий ответ там 586 042 токенов (58 % окна 1M); окно 200 000 — потому что модель записи `<synthetic>`. Тот же `lastUsage`
кормит ворота: при `<synthetic>` в хвосте `used = 0` → `!(used > 0)` → ворота молчат (следует из кода, строки 75 и 113; пишет ли CLI запись
текущего ответа до PreToolUse — не наблюдено).

Не проверено: выбор «новейшего журнала» при двух живых чатах одной папки (строка 212 сортирует по mtime, id сессии не знает — см. находку 4);
путь проекта длиннее 200 знаков (находка 5).

## Заявление 3 — шаг 0 навыков закрытия обоих слоёв — **PARTIAL**

Подтверждено (`git diff framework/skills/ .claude/skills/`): правило одно — «слово владельца в `owner: «…»` или ЗАМЕРЕННОЕ окно ≥ уровня»;
команда по слою верна — исток `node framework/hooks/context-window.mjs --measure`, поставка `node .kaif/hooks/context-window.mjs --measure`;
сборка несёт шаг: `grep -c "Step 0. Who closes"` → `dist/KAIF-CORE-BUNDLE.md:2 · dist/KAIF-FULL.md:1`, `.kaif/hooks/context-window.mjs --measure` → 3 · 2.

Опровергнуто частично: шаг 0 обоих слоёв говорит «с работающими хуками ворота окна меряют на вызове и отклоняют ранний» — для формы
`/end-chat-soft` неверно (заявление 1). `end-chat-force` обоих слоёв — абзац «Кто закрывает» без заголовка «Шаг 0» и только с кодом 0
(коды 1 · 2 не названы). Соседний шаг `/resume` обоих слоёв (правка 15:05 и 15:33) зовёт несуществующий режим `--alive` — находка 3.

## Заявление 4 — тесты не ослаблены — **PARTIAL**

```
$ node tools/sandbox/probes/gate-close-mutant.mjs                    # 15:38:17
OK  control: red 0 (named 0) · OK  G1 …: red 2 (named 2) · OK  G2 …: red 1 (named 1) · OK  G3 …: red 1 (named 1)
✅ every mutant red exactly on its named cases, control green            exit=0
$ node tools/sandbox/probes/pt6-context-window-mutant.mjs            # 15:38:18
OK  a subagent's call judged: exit 1, red 2 · … ✅ each mutant red on exactly its named cases   exit=0
$ KAIF_MUTANTS_ONLY=M1 node tools/sandbox/probes/hooks-mutants.mjs   # 15:38:31 → 15:38:42
OK  M1 …: red 6 (named before the run: 6) · green 164     ✅ 1 mutants red exactly …   exit=0
$ node tools/sandbox/s14-refresh-hooks.mjs                            # 15:38:59 → 15:39:11
exit=0 · green=171 red=0 · ✅ s14 PT1 · PT2 · ворота: PreToolUse фрагмента — … Skill с context-window, иного нет ·
✅ s14 ворота закрытия: … deny с замером; со словом … — тишина · ✅ s14 замер руками: `--measure` … код 1 · … (16 из 16)
```

Ассерт состава PreToolUse дополнен третьей группой и судится целиком; пар 16 — жёстко; тексты счёта — из эталона. «M1 красный и на HEAD
`ce03fd5`» — подтверждено ЧТЕНИЕМ, не прогоном: `git show ce03fd5:tools/sandbox/s14-refresh-hooks.mjs` — строка 711 `fragPairs.length === 15 && …`
(проверка состава с 52d6d58, 2026-10-23), в `expect` M1 на HEAD адресата нет.

Опровергнуто частично — фильтр открывает пустую зелень:

```
$ KAIF_MUTANTS_ONLY=M99 node tools/sandbox/probes/hooks-mutants.mjs
✅ 0 mutants red exactly on their named addressees, and only on them      exit=0
$ KAIF_MUTANTS_ONLY=m1 node tools/sandbox/probes/hooks-mutants.mjs
✅ 0 mutants red exactly on their named addressees, and only on them      exit=0
```

Пробелы охраны (не ослабление, но заявленное «держит» шире): ни случая, ни мутанта на имя навыка с косой/пробелом, на `<synthetic>` в хвосте,
на `--measure` без пути (только руками). Утечка: прогоны M1 и s14 судьи оставили в `F:\Temp` 11 каталогов (`kaif-sbx-hooks-*` и два набора
`kaif-status-guard-sbx-*` по пять) — убраны судьёй; это известный пункт (6) эстафеты.
Не проверено: полный свод мутантов и полигон (вне брифа).

## Заявление 5 — `bugs/138` и `researches/46` — **PARTIAL**

Подтверждено:
- Код расширения 2.1.326 (`extension.js`): `var UF=["user","project","local"],FF=["user"]` · `settingSources:t.kind==="trusted"?UF:FF` ·
  `settingSources:[...b.kind==="trusted"?UF:FF]` (в баге — пересказ с подставленными константами, по сути верно); окно «Trust this folder in
  Claude Code?» / «Trust folder» / «Don’t trust» — есть.
- Журнал: `grep -rh "setting sources" "$APPDATA/Code/logs"` → `2026-11-17 09:48:20.664 [info] Starting a process in d:\work\ai_sandbox\KAIF without
  the folder's setting sources: Claude Code has no trust record for it` (×2) · `09:48:22.847` (то же) · `09:48:23.160 [warning] The folder's setting
  sources stay unused in d:\work\ai_sandbox\KAIF: Claude Code was not given trust for it`.
- События хуков (`grep -c '"hookEvent"'`, восемь новейших журналов): `fc8be07d 0 · 1f9e86a3 0` (2.1.326) · `4f300551 328 · 9c41008a 302 · 49a46f9d 152`
  (2.1.318) · `98ef8b39 21 · b2ee31ce 33` (2.1.314) · `c0c10f82 1` (2.1.309) — ровно как в баге. Сильнее того (счёт по типам вложений):
  2.1.326 — `hook_*` 0, листинг навыков без навыков проекта (`end-chat-soft` 0, `dayloop` 0; в сессии 99 — 5 и 5), инструкции — только
  `MEMORY.md` [AutoMem] (в сессии 99 — ещё `d:\work\ai_sandbox\KAIF\CLAUDE.md` [Project]).
- Состояние: `.kaif/context-window.json` — три сессии, новейшая `4f300551` 2026-11-07T12:29:10Z; файл и прощание датированы 2026-11-07 15:29.
  Запись доверия: `"d:/work/ai_sandbox/KAIF" hasTrustDialogAccepted= false` · `"D:/work/ai_sandbox/KAIF" … true`.

Опровергнуто:
- «С 2.1.326» (`bugs/138` Root cause «расширение с 2.1.326 …», `STATUS.md` п. 0, строка досье `HOUSE_RULES.md`): ветка доверия старше.
  `grep -o 'settingSources:[^,}]*' anthropic.claude-code-2.1.325-win32-x64/extension.js` → `settingSources:t.kind==="trusted"?_F:yF`; журнал
  расширения 2.1.323 (каталог `20261113T085615`, `claude-code-2.1.323`) 2026-11-13 уже пишет «Starting a process in … without the folder's setting
  sources» для двух других проектов. У истока просто не было сессии между 2.1.318 (11-07) и 2.1.326 (11-17); `researches/46` §2 («между этими
  версиями») честен, баг и STATUS — шире.
- TWINS `bugs/138`: «строки журнала расширения есть только по истоку и по одному проекту калькулятора» — тот же grep даёт строки ещё по четырём
  проектам: KCCP и KUMM (2026-11-13 10:34 и 12:48), два проекта калькуляторов (2026-11-16 15:06 и 2026-11-17 09:50).
- Repro п. 3 `bugs/138` берёт строку `[info] Starting a process … no trust record` за симптом, а по коду она — ветка `mayAsk:false` (процесс без права
  спрашивать) и пишется и для папок, которым доверие потом дано (KUMM, KCCP — сейчас `true`); признак удержания настроек — только «stay unused».
- Forensics `bugs/138`: «Хуки пользователя у других проектов в тот же день работают — выключен именно слой папки» — вывод не из сессий KAIF
  (другие папки доверены) и спорит с цитатой вендора в `researches/46` §1 («holds back hooks from every settings file, including your own
  `~/.claude/settings.json`»). У пользователя есть свои хуки (Stop · PermissionRequest · PreToolUse · UserPromptSubmit · SubagentStop); запускались ли
  они в сессиях 100–101 — по журналу не видно (молчащий хук записи не оставляет).

Не проверено: страницы вендора (не запрашивались); журналы других проектов (вне брифа); показывалось ли окно доверия в 09:48:23 (ответ
пришёл через 313 мс после строки 09:48:22.847 — по коду `deps.ask` вернул `false`, человек ли это — не видно).

## Заявление 6 — стоячая ложь исправлена на месте — **REFUTED**

Подтверждено: `bugs/137` Repro и Fix п. 3 исправлены на месте с «стояло …»; Repro по журналу сессии 100 — Skill-вызовов 0, Read файла навыка
закрытия 1; отчёт `testcases/reports/2026-11-17_close-gate.md` — числа сходятся с журналом (372 447 — запись 11:55:35Z = 14:55:35 +03:00;
318 258 — 11:45:47Z), счёт событий хуков, самопроверка 18, счёт мутантов.

Опровергнуто:
- `EXPERIENCE.md` EXP-0209, «Механизация»: «шаг 0 навыков закрытия обоих слоёв (закрытие — вызовом навыка, не чтением файла)» — ровно та фраза,
  которую `bugs/137` Fix п. 3 исправил в 14:58 («в сессии 100 навык вызовом не нашёлся бы вовсе»). И «механизировано» — при обходе ворот формой `/end-chat-soft`.
- EXP-0209, «Repro»: `tail -c 3000000 <журнал>.jsonl | grep '"usage"' | grep -v isSidechain | tail -1` — каждая целая запись несёт ключ `"isSidechain"`
  (и `false`), `grep -v` выкидывает их все; остаётся только рваная первая строка хвоста:
  `журнал сессии 100: whole records with "usage" in tail: 329 · lines surviving grep -v isSidechain: 1 · torn line, len 1897`
  (журнал этой сессии — `torn/unparsable line, len 5006`). Суммы трёх полей последнего ответа команда не даёт никогда.
- `STATUS.md` п. 0: «с расширения 2.1.326 папка без доверия …» — см. заявление 5.
- `STATUS.md` п. 3: «третий крах ровно на границе случаев I48 → TK7c» — `bugs/109` сам считает тринадцатое «вероятным, без кода»; доказанных крахов на этой границе два.
- Отчёт §4: «ручной запуск ворот на её журнале — deny «31 %»» — ни одна строка §3 этот прогон не называет.
- Новая стоячая ложь в дереве (на 15:42): `.claude/skills/resume` (15:05) и `framework/skills/resume` (15:33) велят `context-window.mjs --alive`,
  `HOUSE_RULES.md` (15:36) описывает `--alive` и мутант G4 — режима в хуке нет (`grep -n alive framework/hooks/context-window.mjs` — пусто),
  G4 в пробе нет (`grep -c G4 tools/sandbox/probes/gate-close-mutant.mjs` → 0). Находка 3.

## Находки

1. `framework/hooks/context-window.mjs:112` (`closeGate`) · ворота сверяют сырое имя навыка, а CLI 2.1.326 обрезает пробелы и снимает ведущую
   `/` — `skill: "/end-chat-soft"` (форма канона), `" end-chat-soft"`, `"/end-chat-force"`, `"a/b:end-chat-soft"` закрывают чат на 53 % без
   отказа · проба выше (через процесс хука) и `grep -a 'tengu_skill_tool_slash_prefix' claude.exe`. Самопроверка, s14 и G1–G3 этого не видят.
2. `context-window.mjs:69–79` (`lastUsage`) · запись `<synthetic>` с нулевым usage считается ответом: `--measure` журнала сессии 100 →
   «0 % full (0 of 200000 tokens)» при настоящих 586 042 из 1M; ворота при таком хвосте молчат (`!(used > 0)`, строка 113) ·
   `node framework/hooks/context-window.mjs --measure ~/.claude/projects/d--work-ai-sandbox-KAIF/1f9e86a3-….jsonl`.
3. `.claude/skills/resume/SKILL.md:24` · `framework/skills/resume/SKILL.md:23` · `HOUSE_RULES.md:65` · велят `--alive` (код 1 — «хуки не запускаются»)
   и называют мутант G4, которых нет; `--alive < /dev/null` → выход 0 (читается как «хуки работают»), без перенаправления — ждёт stdin
   (`timeout 20 … --alive` → 124) · `grep -rn -- "--alive" framework/hooks/` — пусто.
4. `context-window.mjs:212` · `--measure` без пути берёт новейший по mtime журнал папки, не журнал своей сессии — при двух живых чатах одной папки
   (ровно перекрытие автоэстафеты №160) мерится чужой · чтение кода; не воспроизведено.
5. `context-window.mjs:126` (`slugOf`) · у вендора имя каталога журналов режется до 200 знаков с хешем (`O=200;… return \`${e.slice(0,O)}-${…}\``
   в `claude.exe`), у хука — нет: путь проекта с ключом длиннее 200 знаков → `--measure` без пути — код 2 (в безопасную сторону); случай
   самопроверки «every non-alphanumeric … becomes «-»» неполон · `grep -a 'replace(/\[^a-zA-Z0-9\]/g,"-")' claude.exe`.
6. `tools/sandbox/probes/hooks-mutants.mjs:203–204` · `KAIF_MUTANTS_ONLY` с именем без совпадения (опечатка, строчная буква) — «✅ 0 mutants red
   exactly …», выход 0 · `KAIF_MUTANTS_ONLY=M99 node tools/sandbox/probes/hooks-mutants.mjs`.
7. `bugs/138` Root cause · `STATUS.md` п. 0 · `HOUSE_RULES.md` строка досье «Доверие папки» · «с 2.1.326» — ветка доверия есть в 2.1.325, журнал 2.1.323
   (2026-11-13) уже удерживает настройки папок · `grep -o 'settingSources:[^,}]*' …2.1.325…/extension.js`; `grep -rh "setting sources" "$APPDATA/Code/logs"`.
8. `bugs/138` TWINS и Repro п. 3 · «строки журнала только по истоку и одному калькулятору» — их ещё четыре проекта; строка `[info] … no trust record`
   пишется и для папок, потом доверенных, — не признак удержания · тот же grep + код `postureFor` (`if(!t)return … logger.log(…no trust record…)`).
9. `bugs/138` Forensics, последняя строка · «выключен именно слой папки» не наблюдено в сессиях KAIF и противоречит цитате вендора в `researches/46` §1 · чтение обоих файлов.
10. `EXPERIENCE.md` EXP-0209 · «Механизация» несёт исправленную в `bugs/137` фразу «вызовом навыка, не чтением файла»; «Repro» никогда не даёт
    суммы — `grep -v isSidechain` выкидывает все целые записи · команда Repro на журнале сессии 100 → одна рваная строка.
11. `STATUS.md` п. 3 · «третий крах» на границе I48 → TK7c при тринадцатом «вероятном, без кода» в `bugs/109` · чтение `bugs/109`, строки 114–125.
12. `testcases/reports/2026-11-17_close-gate.md` §4 · наблюдение «deny «31 %»» без строки прогона в §3 · чтение отчёта.
13. `homeworks/08` · владельцу сказано «Вчера всё это работало» — последняя сессия истока с работающими хуками — 2026-11-07 (2.1.318), между
    11-07 и 11-17 журналов истока нет · `ls -lt ~/.claude/projects/d--work-ai-sandbox-KAIF/*.jsonl`.

Временное судьи: скретчпад-пробы `judge-gate-probe.mjs` · `judge-s14.log` · `judge-temp-before.txt` — удаляются судьёй; `F:/Temp/judge-s101-gate`
— убран пробой; 11 каталогов `kaif-*` от прогонов s14 и M1 — убраны.

## Повторный суд (≈ 16:00)

Дерево на 15:56–16:03 +03:00 (хук `framework/hooks/context-window.mjs` — 15:53:57, сборка `dist/KAIF-CORE-BUNDLE.md` — 15:54:08; сборка
несёт новый хук: `grep -c "replace(/^..+/, '').split"` → 1 и 1, `SLUG_MAX` → 5). Бриф и границы прежние. Итог: **закрыто 12 · открыто 1 (находка 7) · новых 3**.

Общие прогоны:

```
$ node framework/hooks/context-window.mjs --selftest        # 15:56:53 — 21 случай «v»
  v gate: «/end-chat-soft», a padded name, «/end-chat-force», a folder prefix — denied; the owner's word after the name — pass
  v measure: a `<synthetic>` zero-usage record at the tail is skipped — the last MODEL answer counts
  v alive: this session recorded — exit 0; not recorded — exit 1 naming the owner's action «Trust folder»
selftest: all ok                                                                             exit=0
$ node tools/sandbox/probes/gate-close-mutant.mjs          # 15:57:53
OK control: red 0 · OK G1: red 3 (named 3) · OK G2: red 2 (named 2) · OK G3: red 1 · OK G4 the raw skill name is matched: red 1 ·
OK G5 a <synthetic> record counts as the answer: red 1 · OK G6 the hooks always «run»: red 1 · ✅ every mutant red exactly on its named cases   exit=0
$ node tools/sandbox/probes/pt6-context-window-mutant.mjs  # 15:57:53 — четыре OK, ✅ each mutant red on exactly its named cases   exit=0
$ KAIF_MUTANTS_ONLY=M1 node tools/sandbox/probes/hooks-mutants.mjs   # 15:59:07 → 15:59:18
OK  M1 …: red 6 (named before the run: 6) · green 165 · ✅ 1 mutants red exactly on their named addressees      exit=0
$ node tools/sandbox/s14-refresh-hooks.mjs                 # 15:59:18 → 15:59:31
exit=0 · green=172 red=0 · ✅ s14 хуки живы?: `--alive` развёрнутого хука — запись своей сессии в состоянии — код 0; записи нет — код 1 и действие владельца
```

| № | Вердикт | Команда → вывод (сокращено) |
|---|---|---|
| 1 | CLOSED | проба через процесс хука (журнал 531 383 токенов, временный проект `F:/Temp/judge2-s101-gate`, убран): `"/end-chat-soft"` · `" end-chat-soft"` · `"end-chat-soft "` · `"/end-chat-force"` · `"apps/web:end-chat-soft"` · `"//end-chat-soft"` · `"/end-chat-soft please"` → `DENY 53 % full`. Мимо остались `"x:y:end-chat-soft"` и `"End-Chat-Soft"`, но это не обход: поиск навыка в CLI 2.1.326 точный и с учётом регистра (`function Rx(e,n){return e.name===n\|\|Ms(e)===n\|\|(e.aliases?.includes(n)??!1)}`; иначе — подсказка `kind:"suggestion",command:void 0`, без запуска), а навыка KAIF с двумя префиксами нет. G4 краснеет ровно своим случаем. |
| 2 | CLOSED | `--measure ~/.claude/projects/d--work-ai-sandbox-KAIF/1f9e86a3-….jsonl` → `the window is 58 % full (586042 of 1000000 tokens) … too early`, код 1; ворота при `<synthetic>` в хвосте журнала → `DENY 53 % full`; G5 — ровно свой случай. |
| 3 | CLOSED | `timeout 20 node framework/hooks/context-window.mjs --alive` и то же `< /dev/null` → оба сразу: `KAIF hooks: NOT running in this session (fc8be07d-…) — wired, yet the agent system ran none of them. … «Trust folder» … (session by session id)`, код 1 (stdin не читается). С id сессии 99 (`CLAUDE_CODE_SESSION_ID=4f300551-…`) → `running in this session … recorded it at 2026-11-07T12:29:10.79…`, код 0. Оба слоя `/resume` и `HOUSE_RULES.md:65` называют `--alive` и G1–G6; G6 и случай s14 «хуки живы?» есть. Живьём код 0 в сессии с работающими хуками не наблюдён (у истока хуки не запускаются). |
| 4 | CLOSED (остаток — новая N2) | в этой сессии `CLAUDE_CODE_SESSION_ID=fc8be07d-…` задан; `CLAUDE_CODE_SESSION_ID=1f9e86a3-… --measure` → журнал сессии 100 (586042), `--alive` → id сессии 100; `env -u CLAUDE_CODE_SESSION_ID … --alive` → `(session by the newest transcript of the project)`. Выбор своей сессии — работает. |
| 5 | CLOSED (остаток — новая N3) | фальшивый дом `F:/Temp/judge2-home` (убран), путь проекта с ключом 251 знак, хранилище `<200 знаков>-1x2y3z`: `same case sid=- exit=1 … 70 % full (700001 of 1000000 tokens)`, `sid=sess-long` — то же. |
| 6 | CLOSED | `KAIF_MUTANTS_ONLY=M99 …` → `BAD KAIF_MUTANTS_ONLY names no mutant: M99 — names are case-sensitive (M1, W9, …)`, код 2; `=m1` → то же, код 2; `=M1,M99` → то же, код 2; остатка `kaif-hooks-mutants-*` в `F:\Temp` нет (0). |
| 7 | **OPEN** | «С 2.1.326» убрано, но новую границу — «не позднее 2.1.322», «журнал 2.1.322 (2026-11-13)», «между 2.1.318 и 2.1.322» — журнал опровергает. Строки доверия 2026-11-13 10:34:02.419 пишет активация расширения 10:33:59, которая в 10:34:04.242 запускает `…\anthropic.claude-code-2.1.323-win32-x64\resources\native-binary\claude.exe` (`version: 2.1.323`); единственное «2.1.322» в этом журнале — `10:34:04.229 [info] Extension update check: 2.1.322 -> 2.1.323 (attempt 1): ok` (отчёт уже обновившегося расширения). Второй журнал того дня (`20261113T124838`) называет только 2.1.323. Доказанная граница — **не позднее 2.1.323**; код 2.1.322 на машине не сохранился. Места: `bugs/138` (Forensics, Root cause), `STATUS.md:46` и `:203`, `HOUSE_RULES.md:180`, `researches/46:32–33`, отчёт `:10` и `:63`, файл памяти `untrusted-folder-withholds-project-settings.md` (строки 3 и 11). Команда: `sed -n '28,39p' "$APPDATA/Code/logs/20261113T085615/window2/exthost/Anthropic.claude-code/Claude VSCode.log"`. |
| 8 | CLOSED | `bugs/138` Repro п. 3: признак — только `[warning] … stay unused`; строка `[info] … no trust record` «признаком НЕ является». В TWINS: одно предупреждение «stay unused» (у истока, 2026-11-17), строки `[info]` — у папок, потом доверенных. Совпадает с grep журналов (одна строка `[warning]`; KUMM, KCCP и два проекта калькуляторов — `true`). |
| 9 | CLOSED | `bugs/138` Forensics: «Хуки пользователя в сессиях этой папки — не наблюдались; вендор говорит, что без доверия держатся хуки ВСЕХ файлов настроек» — с отметкой «исправлено … стояло». |
| 10 | CLOSED | EXP-0209: Repro — `node framework/hooks/context-window.mjs --measure` (прогнан выше, работает); «Механизация» — «шаг 0 … замер руками» с отметкой «исправлено … стояло «закрытие — вызовом навыка, не чтением файла»», G1–G6. |
| 11 | CLOSED | `STATUS.md:91–92`: «второй крах с кодом и третий вместе с вероятным тринадцатым (без кода)» — совпадает с `bugs/109`. |
| 12 | CLOSED | строка `5а` отчёта: «≈ 14:45 … deny «the window is 31 % full (316513 of 1000000 tokens)»» — запись 316 513 в журнале сессии 101 стоит в 11:45:32Z = 14:45:32 +03:00. |
| 13 | CLOSED | `homeworks/08:11`: «Последний раз всё это работало 7 ноября, на прежней версии расширения» — сходится с журналами (2026-11-07, 2.1.318). |

Новые находки:

- **N1** · `framework/hooks/context-window.mjs:115–117` и случай самопроверки «the owner's word after the name — pass» · комментарий говорит:
  «words after the name are the skill's args too», то есть Claude Code будто бы читает слова после имени как аргументы. Код CLI 2.1.326 так не делает: он
  ищет всю строку целиком (`let r=w?h.substring(1):h … M=le(r,c,n)`, сравнение `y.name===e`), и `"/end-chat-soft owner: «close»"` до навыка
  не дойдёт — Claude Code ответит подсказкой, а не запуском. На деле это не обход (ворота пропускают вызов, который всё равно не исполнится), но комментарий и случай описывают поведение вендора, которого в его коде нет. Как увидеть:
  `grep -a -o 'let r=w?h.substring(1):h.\{120\}' claude.exe` расширения.
- **N2** · `context-window.mjs:134–135` (комментарий «said in the output») и строка 277 · `--measure` не говорит, как выбран журнал: по id
  сессии или «новейший» (это говорит только `--alive`). Как увидеть: `env -u CLAUDE_CODE_SESSION_ID node framework/hooks/context-window.mjs --measure` → строка кончается
  только `(transcript: …\fc8be07d-….jsonl)`, без «by the newest transcript». Без переменной (переменная есть на Windows; macOS не проверен) при двух живых чатах замер
  молча придётся на чужой.
- **N3** · `context-window.mjs:140` (`transcriptOf`, ветка длинного пути) · `startsWith` сравнивает с учётом регистра: если корень назван с
  заглавной буквой диска (так его отдаёт `cd` в Git Bash: в первом суде `--measure` из `framework/` дал ключ `D--…`), каталог хранилища не находится.
  Ошибка в безопасную сторону (код 2). Как увидеть: та же проба с фальшивым домом — `upper-case drive sid=- exit=2 KAIF context: nothing to measure (no transcript found for D:\work\very_long_…`
  (и с `sid=sess-long` — тоже код 2). Короткие пути не задеты: `existsSync` на NTFS регистр не различает.

Не проверено: код 0 у `--alive` в живой сессии с работающими хуками (пишет ли хук запись сессии уже на первом `PostToolUse` — зависит от того,
пишет ли CLI запись ответа до события; не наблюдено); ворота на живом вызове навыка; macOS; полный свод мутантов и полигон (вне брифа).
Утечка: прогон M1 (через s14) снова оставил `F:\Temp\kaif-sbx-hooks-GSxRad` — убран судьёй; одиночный s14 каталогов `kaif-status-guard-sbx-*`
больше не оставляет. Временное повторного суда (`judge2-*` в скретчпаде, `F:/Temp/judge2-s101-gate`, `F:/Temp/judge2-home`) — удалено.
