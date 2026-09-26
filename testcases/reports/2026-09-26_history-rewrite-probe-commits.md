# Отчёт прогона — переписывание истории: 31 коммит под «probe» снова подписан владельцем (решение №134)

**Создан:** 2026-09-26 08:25 +03:00 · **Прогон вёл:** Claude Opus 5.5 (1M context), сессия 75 · **Версия/сборка:** до — `0d694c6`,
после — `f396998` (отправлено), затем `d0e552e` (ответы владельца дословно).

## 1. Работа

Исполнение варианта A интервью №039 (`bugs/124_DONE_*`, журнал решений №134): автор и коммиттер «probe <probe@example.invalid>» у 31
коммита (2026-09-25 17:27 → 2026-09-26 02:55) заменён на «Mikalai Kryvusha <kotkrinik@yandex.ru>», история принудительно отправлена.
Базис — строки варианта A: «Проверка. `git log --format='%an' 7bc3266..HEAD | sort | uniq -c` печатает только ваше имя»; «Результат» —
ссылки на старые номера перестанут открываться (сняты заменой в репозитории и картой в `bugs/124_DONE_*`).

## 2. Контур

Исток KAIF, Windows 11, Git Bash и Windows PowerShell 5.1, git 2.43, `git-filter-repo` (a40bce548d2c, `pip install --user`); переписывание —
в свежем клоне origin в скретчпаде сессии, рабочее дерево владельца не трогалось до `reset --soft`; GitHub — настоящий origin.

## 3. Прогоны

| # | Момент | Команда | Исход |
|---|---|---|---|
| 1 | ≈ 2026-09-26 07:58 | `git bundle create …/kaif-before-rewrite-0d694c6.bundle --all` · `git bundle verify` | «is okay» — вся прежняя история сохранена |
| 2 | ≈ 2026-09-26 08:00 | `git filter-repo --mailmap probe.mailmap --force` (без диапазона) | ❌ 759 коммитов изменено, сумма `show-ref --tags` другая — подписи GitHub сняты с веб-коммитов; НЕ отправлялось |
| 3 | ≈ 2026-09-26 08:03 | `git filter-repo --mailmap probe.mailmap --refs 7bc3266..main --force` | 48 изменено; `show-ref --tags` — та же сумма, что у истока; дерево вершины `ae4a4ff` = исток; `7bc3266` — предок |
| 4 | ≈ 2026-09-26 08:04 | цикл по `commit-map`: `rev-parse <old>^{tree}` против `<new>^{tree}`, `%ad|%cd` raw | `checked=48 bad=0` |
| 5 | ≈ 2026-09-26 08:05 | `node scratchpad/msgcheck.mjs <исток> <клон>` | `commits=48 mismatches=0 substitutions=22` — в сообщениях только замены номеров |
| 6 | 2026-09-26 08:10:26 (reflog) | `git push --force-with-lease=main:0d694c6… origin refs/rewrite/main:main` | `+ 0d694c6...f396998 (forced update)` |
| 7 | ≈ 2026-09-26 08:11 | `git fetch origin && git reset --soft refs/rewrite/main` · `git log --format='%an' 7bc3266..HEAD \| sort \| uniq -c` | `48 Mikalai Kryvusha`; ответы владельца в дереве целы |
| 8 | ≈ 2026-09-26 08:11 | `gh api "repos/MikalaiKryvusha/KAIF/commits?per_page=60" --jq …` | `60 Mikalai Kryvusha \| kotkrinik@yandex.ru \| MikalaiKryvusha` |
| 9 | ≈ 2026-09-26 08:15 | `node scratchpad/remap-hashes.mjs <commit-map> --apply` · повторный прогон | `files=55 replacements=92 (applied)` → повтор `files=0 replacements=0` |
| 10 | 2026-09-26 08:16:32 → 08:22:12 | `node tools/build-framework.mjs` · `npm run test:core` | сборка OK (59 блоков, 185, 836); «sandbox suite: all 28 suites green» |

## 4. Проверки

Гигиена: сборка и полигон зелёные после механической замены номеров (комментарии блока обхода в модулях поставки); `node tools/commit.mjs
--selftest` ✅ — тестовая личность отказана.

Функциональный прогон: «Проверка» варианта A на настоящей истории — `git log` по диапазону печатает только имя владельца (48); GitHub API
на настоящем origin — 60 последних коммитов подписаны владельцем и привязаны к его аккаунту (прочитано); первый новый коммит `d0e552e` —
автор и коммиттер владелец.

## 5. Найдено

1. **Первый прогон шире решения** — `filter-repo` без диапазона меняет номера от первого подписанного веб-коммита GitHub (759 коммитов,
   все метки версий); пойман сверкой до отправки, не ушёл. Урок — EXP-0171.
2. **Ссылки на старые номера в репозитории** — 92 в 55 файлах; заменены механически, карта старый → новый — `bugs/124_DONE_*`.

## 6. Следы

Скретчпад сессии 75: `kaif-before-rewrite-0d694c6.bundle` · `probe.mailmap` · `filter-repo.log` · `filter-repo2.log` ·
`rewrite/.git/filter-repo/commit-map` · `msgcheck.mjs` · `remap-hashes.mjs` · `polygon-remap.log`; reflog машины —
`git reflog show origin/main`.

## 7. Вердикт

**pass** — отправлено ровно то, что назвал вариант A (48 коммитов, метки целы, содержимое и даты побайтно равны); «Проверка» варианта
выполнена на настоящей истории и на GitHub.
