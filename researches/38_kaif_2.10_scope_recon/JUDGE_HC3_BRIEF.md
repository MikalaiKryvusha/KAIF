# БРИФ судьи — лёгкий судья шага HC3 и преполёта 1e (исток KAIF, сессия 88)

Ты — судья (`/fable-judge`, KAIF-блок). Суди ПОСЛЕДНИЙ коммит истока (`git -C /d/work/ai_sandbox/KAIF log --oneline -1`; он ещё не
отправлен — `--no-push`). Заявления — в его сообщении (`git show --stat HEAD` и `git log -1 --format=%B`), в `plans/140` (HC3 ✅, HC3б),
`testcases/reports/2026-10-18_hc3-moved-pointers.md`, `EXPERIENCE.md` → EXP-0170 («mechanized»), `HOUSE_RULES.md` §1 (строки
`tools/commit.mjs` и двух проб). Итог — дайджест на русском; вердикт при сомнении — REFUTED по пункту.

## Правила тишины (жёсткие — машина владельца)

Только чтение в истоке (никаких правок, коммитов, `git push`, `git config`, `git checkout`). Пробы истока запускать можно:
`node tools/sandbox/probes/hc3-moved-pointers-red.mjs` · `node tools/sandbox/probes/commit-1e-eol-run.mjs` · `node tools/commit.mjs --selftest`
(они работают на копиях во временном каталоге и убирают его). НЕ запускай `npm run test:core`, `tools/verify-contour.mjs`, `tools/review.mjs`
(кроме `--search`), ничего с окнами, звуком, `KAIF_DIST`. Никого не спрашивай, наружу не пиши.

## Охоты

1. **Заявление шире наблюдения:** HC3 ✅ и «EXP-0170 mechanized» — переисполни пробы; что именно доказано и чего НЕТ (функциональный прогон).
2. **Близнецы:** `grep -rn "AGENT_GUIDE.md" framework/ --include=*.md` — остались ли указатели за строками, перенесёнными в `HOUSE_RULES.md`
   (Tools · Test harness · Environment dossier · Push), которых не видят ни 5s, ни 5w? Назови поимённо.
3. **Преполёт 1e:** ложный красный возможен? (`.gitattributes` → `eol=lf`; файл, удалённый из дерева; бинарный файл в наборе; набор без
   `--only` — `git diff --name-only HEAD`). Стоит ли 1e ДО первого побочного эффекта (бамп `version.json`)?
4. **Нота 2.10 о HC3** — не шире поведения? Имя файла убрано из неё ради случая F2b свода `s08` — это обход слабой проверки; назван ли он
   (`plans/140` HC3б) и не прячет ли дефект?
5. **Поправки к сообщению прошлого коммита** (`2bc9465`) — верны ли (что из перечисленного правда уехало тем коммитом: `git show --stat 2bc9465`)?
6. **Стоячая ложь:** STATUS п. 0 сессии 88 и `plans/136` статус — совпадают ли числа («закрыто 2 из 20») с планом и мастер-планом?

## Итог

Дайджест — `C:\Users\krinik\AppData\Local\Temp\claude\d--work-ai-sandbox-KAIF\1e59e180-dce4-47e6-883f-6d567fbb0ddd\scratchpad\recon\judge-hc3.md`;
по охоте — VERIFIED / REFUTED / CAVEAT с уликой (команда и вывод дословно); общий вердикт. Последним сообщением — 8–12 строк и путь к файлу.
