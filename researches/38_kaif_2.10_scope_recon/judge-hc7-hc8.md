> «число — из вывода скрипта, не глазами» — `STATUS.md`, п. 0, «Действует».

# Судья шагов HC7 и HC8 эпика HC (критерии 27 · 28 `plans/136`) — лёгкий проход

**Создан:** 2026-11-06 (сессия 98, субагент-судья Claude Opus 5.5, только чтение; бриф главного агента) · **Статус:** 🔍 вердикт до проверки главным · **Вовне:** —

## Итог — REFUTED (узко: результат критерия 28 шире кода; HC7 — VERIFIED)

| Критерий | Вердикт | Почему |
|---|---|---|
| 27 — строка прогона списком (HC7, `f94df01`) | VERIFIED | selftest 107 случаев зелёный, оба случая «as a list item counts» есть на en и ru; поведение v2.9 краснеет ровно ими (проба); настоящий отчёт: линтер v2.9 — exit 1, эта сборка — 0; `check` по 135 отчётам — 0. Жирные метки и вложенные формы не взяты, и это сказано (`bugs/135`, `[ИИ]`) |
| 28 — написал код, прогнал его (HC8, не закоммичено) | REFUTED узко | Все пункты «Проверки» наблюдаются (selftest, мутанты, живые потоки сверены). Но «Результат» говорит «долг гасит только прогон своего вида», а в виде по умолчанию `code` долг гасит ЛЮБАЯ команда шелла, где есть имя файла: `git add`, `git diff`, `cat`, `grep`, `Get-Content`, тело here-string PowerShell. Хук при этом говорит агенту «a run counted». Поставка (README, справочник, нота сборщика) говорит «only a run», и на эти команды нет ни случая, ни мутанта |

## Переисполнение (команды и вывод дословно, 2026-11-06 ≈ 16:35–16:50)

- `node framework/hooks/test-after-code.mjs --selftest` → 16 строк `v …`, `selftest: all ok`, EXIT=0.
- `node tools/sandbox/probes/hc8-test-hook-mutant.mjs` → `OK  control: exit 0, red 0` · `OK  debt not written: exit 1, red 11` · `OK  hygiene clears: exit 1, red 1` · `OK  heredoc body is a command: exit 1, red 1` · `OK  stop refused forever: exit 1, red 2` · `✅ each mutant red on exactly its named cases`.
- `node framework/tools/kaif-testrun-lint.mjs selftest` → `✅ testrun-lint selftest OK — 107 cases, …`; `… check` → `✅ testrun-lint OK — 135 report(s) …, 0 findings`.
- `node tools/sandbox/probes/hc7-list-line-red.mjs` → `OK  v2.9 behaviour (no list marker): exit 1, red 2 — addressees «as a list item counts» en · ru` · `✅ red exactly on the list-item cases, green otherwise`.
- `node tools/sandbox/probes/hc7-real-report.mjs` → `OK  v2.9 linter on the listed report: exit 1 · pass-without-functional-run` · `OK  this build's linter on the same report: exit 0 · 0 findings`.
- `check-framework` → `✅ check-framework OK — 59 embedded files … bundle 191 blocks`; `doc-header-lint` → `findings 0`; `counters-guard` → `✅ counters OK — 47 зеркал`.
- Живые потоки `D:\Temp\kaif-hc8-live-40KbRi\live-*.jsonl` (разобраны моим скриптом из скретчпада). edit-1/2/3: после Edit — `HOOK PostToolUse … you wrote code`, затем Bash `node src/app.mjs` (или `node -e "import('./src/app.mjs')…"`), долг `{}`. forbid-1/3: `HOOK Stop {"decision":"block"…}`, затем `--waive "User explicitly …"`. forbid-2: блок, `--waive` через PowerShell отклонён правами, долг остался, сессия `success`. Логи `hc8-live2.log` / `hc8-live-v29.log` совпадают с числами отчёта (3/3 · 3/3 и 0/3).
- Моя проба хука (временные каталоги в скретчпаде, `CLAUDE_PROJECT_DIR` — туда, хук у истока не тронут; события подавались в stdin, как в `s14`). После правки `src/app.mjs`:
  `git add src/app.mjs` → долга нет · `git diff src/app.mjs` → нет · `cat src/app.mjs` → нет · `grep -n double src/app.mjs` → нет ·
  PowerShell `Get-Content src/app.mjs` → нет · PowerShell `Set-Content testcases/x.md @'⏎run: node src/app.mjs⏎'@` → нет ·
  `node --test test/app.test.mjs` и `npm test` → долг стоит · `node src/app.mjs` → нет. Правка `src/build.mjs`, затем `node tools/build.mjs` → долга нет (сравнивается только basename).
  Остановки: `turn1 stop: BLOCK · turn1 repeat: pass · turn2 stop (no new write): BLOCK · turn2 repeat: pass`. Событие с `agent_id` → тишина, долг не тронут.

## Охоты

1. **Предикат шире своих слов (главная находка).** `cleared()`: если у вида нет шаблона `runs`, гашение — `cmd.includes(basename(key))`. Шапка хука честно пишет в GAP: «a file name in a command is a sign of a run, not proof». Но README (таблица и раздел), справочник, нота сборщика и «Результат» критерия 28 говорят «only a run of its own kind clears it». У истока это проявится сразу: `node tools/commit.mjs --only <файл>` называет файл, значит коммит гасит долг. Полевой образец Unliminium сравнивает полный относительный путь, у истока basename — это шире поля.
2. **Тело here-string PowerShell.** Поле научило хук, что тело heredoc — данные (#176), но близнец в PowerShell (`@'…'@`) гасит долг. Платформа истока — Windows.
3. **«Once per debt signature» — неправда о коде.** Пропуск идёт только при `stop_hook_active` и той же подписи. Остановка следующего хода с тем же долгом снова отказана, и так каждый ход, пока нет прогона или `--waive`. Шапка («the debt stays and meets the next stop») это допускает, README и справочник — нет. Граница с №143: ход-ответ на вопрос владельца упрётся в блок старого долга.
4. **№144 / №153.** Граница названа в `researches/43` §3: хук другого класса, долг проверки, а не слово владельца. Но в поставке не сказано, что прямой запрет владельца «не запускай» — законный повод для `--waive` (приказ называет только «no device»). В forbid-2 сессия кончилась просьбой разрешения у владельца («I'm blocked waiting for permission») — ровно тот анти-образец «спросить владельца», против которого хук написан. Причина — набор прав пробы, но поставка этот случай не называет.
5. **Что из полей не взято, и это не сказано.** Гашение через MCP-инструмент продукта (Unliminium, `mcp__…-game__`; `researches/43` §1 числит его в общем для обоих полей) — хук смотрит только Bash · PowerShell. Копия в папку продукта как раскатка (KUMM `COPY_VERB`). Правило «раскатку гасит только запуск ПОСЛЕ неё» без исключений, кроме горячей. §2 п. 5 (открытые кейсы `TC_*`) — «решить на HC8», решения нет. §2 п. 6 (общий корень нескольких репозиториев). Ни отметка HC8 в `plans/140`, ни README эти пункты не называют.
6. **Хук у истока.** Работу он не ломает: блок раз за ход, повтор проходит. Но в `.kaif/kaif.json` истока нет `testHook`, поэтому `npm run test:core` и прогон свода не гасят долг правленого `tools/**` и `framework/**`, а `git add` и коммит гасят. Шум и ложное «засчитано» с первого дня. В сессии 98 у истока уже есть `--waive` за правку одного комментария.
7. **Тест не ослаблен.** В `s14` 13 → 15: два новых события хука, PostToolUse и Stop. 3 → 4: группа `Stop` образца получила четвёртый хук. Оба числа обоснованы. Стоячий текст: метка случая `s14` осталась «(13 из 13)», хотя регулярка берёт `WANT.length`.
8. **Мутанты живые**, «долг не записан» краснеет на 11 названных адресатах. «Проверка» критерия 28 говорит «ровно своим случаем» — буква расходится с наблюдением (11). Мутанта на охрану по `agent_id` и на гашение по имени файла нет.
9. **Отметка «✅» шире отчёта.** `plans/140` и STATUS ставят HC8 ✅, а вердикт отчёта — «partial … полигон после всех правок HC8 — строкой ниже, когда пройдёт». `polygon4.log` в 16:32 ещё шёл (s21).

## Наименьшие правки

1. Вид `code` по умолчанию: прогоном считать имя файла как аргумент исполнителя (`node|python|py|bash|sh|pwsh|powershell|deno|bun|tsx|ruby|php|go run|…`) или в `-e`/`-c` с импортом. Вместо этого можно завести список «не прогон»: `git`, `cat`, `type`, `Get-Content`, `grep`, `rg`, `sed`, `head`, `tail`, `wc`, `ls`, `diff`, `tools/commit.mjs`. Сравнивать полный путь, а не basename. Добавить случаи selftest «git add / cat / grep / Get-Content с именем файла — не прогон» и мутант.
2. Тело `@'…'@` / `@"…"@` считать данными, как heredoc; случай и мутант.
3. README, справочник, шапку хука («once per debt signature», «refused ONCE») переписать под код: отказ раз за ход, следующий ход с долгом — снова. Или изменить код под текст; решение — главного агента или владельца.
4. Одна строка в README и в `plans/140` HC8: что из полей не взято (MCP, копия как раскатка, гашение раскатки только запуском, `TC_*`, несколько репозиториев) — и почему. В строку приказа и README добавить: прямой запрет владельца — повод для `--waive` с его словами.
5. Данные истока: `.kaif/kaif.json` → `testHook` с `runs` под полигон и своды.
6. Метку `s14` «(13 из 13)» привести к числу. Букву «ровно своим случаем» в критерии 28 привести к «ровно своими адресатами» (11).
7. HC8 ✅ держать до зелёного полигона, либо назвать «гигиена и живая проба; полигон — впереди».

## Не проверено мной

- Входное чтение канона целиком НЕ сделано: 13 документов — ≈ 1,4 МБ, только `EXPERIENCE.md` — 732 КБ, это больше окна. Прочитаны STATUS (шапка и п. 0), `plans/140`, критерии 26–31 `plans/136`, `researches/43`, отчёт HC8, `bugs/135` (греп), диффы.
- `s14` и полигон не запускал (запрещено брифом). О зелёном `s14` знаю только по `s14d.log` из скретчпада (7 строк HC8, итог зелёный).
- Контроль v2.9 — только по логу: его каталог не сохранён.
- Строку «сработал в живой сессии истока» сверил только по `.kaif/test-debt.json` (одна запись `--waive`); запись сессии не читал.
- `--waive` и живые сессии `claude` не запускал.
- Попутно, вне охоты: в диффе STATUS оценка RL сменилась (≈ 11–17 → 8–13 ч), основание в строке не названо.
