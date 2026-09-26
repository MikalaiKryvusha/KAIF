# Bug 124 — Проба переписала личность git репозитория: 31 коммит ушёл в origin под «probe <probe@example.invalid>»

**Status:** ✅ DONE 2026-09-26 08:20 +03:00 — история переписана по слову владельца (интервью №039, Q1 = A) и отправлена 2026-09-26 08:10 +03:00 (08:10:26 по reflog); прежде: 🔧 фикс 2026-09-26 03:12 +03:00 — личность восстановлена, проба чинится, страж коммита стоит
**Severity:** S1 — задета достоверность авторства истории проекта (решение владельца №54: «по `git log` видно, кто что делал»);
31 коммит уже в origin.
**Version/build:** KAIF 2.8 (открыта), HEAD `9de0953`; агентская система — Claude Code (расширение VS Code), модель — Claude Opus 5.5.
**When/context:** сессия 74, ночной цикл; найдено повторным судом эпика UP (чистый экземпляр) ≈ 2026-09-26 02:55 +03:00 как находка ВНЕ
предмета суда.
**Fix accepted when (observable):**
- Ситуация. Проба или свод создаёт связанный worktree этого репозитория и коммитит в нём.
- Действие. Агент коммитит в самом репозитории через `node tools/commit.mjs`.
- Результат. Коммит подписан личностью владельца; тестовая личность до origin не доходит — коммит отказан до поднятия номера сборки.
- Проверка. `git var GIT_AUTHOR_IDENT` → «Mikalai Kryvusha <kotkrinik@yandex.ru>»; `node tools/sandbox/probes/commit-1d-leak-run.mjs` → ✅,
  а `git config --local --list | grep -c "^user\."` после неё → `0`; `node tools/commit.mjs --selftest` → ✅ (четыре случая преполёта 0).

## Symptom

`git log --format='%an' 7bc3266..HEAD` → `31 probe`: все коммиты с 2026-09-25 17:27 (ac17a04) по 9de0953 подписаны автором и
коммиттером «probe <probe@example.invalid>» и запушены (`git reflog show refs/remotes/origin/main`). Последний коммит владельца — 7bc3266
(2026-09-25 16:46). Шапка сессии это показывала с самого начала («Git user: probe») — и никто её не прочитал как дефект.

## Repro (deterministic)

`node tools/sandbox/probes/commit-1d-leak-run.mjs` (редакция до фикса): `git worktree add --detach` этого репозитория, затем
`git config user.email probe@example.invalid; git config user.name probe` в worktree — связанный worktree делит `.git/config` с
репозиторием, и запись уходит в ОБЩИЙ конфиг. После пробы `git config --local user.name` в репозитории → `probe`.

## Forensics

- `git config --local --get user.name` → `probe`; `--get user.email` → `probe@example.invalid`; глобально — `Mikalai Kryvusha
  <kotkrinik@yandex.ru>` (память проекта: коммитить именно так).
- Проба `tools/sandbox/probes/commit-1d-leak-run.mjs:31` (редакция VO4, прогон 2026-09-25 17:07 +03:00 — первый «probe»-коммит 17:27).
- `tools/commit.mjs` автора не проверял вовсе (греп по `user.name`, `author`, `GIT_AUTHOR` → 0).

## Root cause

Класс: **тестовая обвязка пишет состояние в РЕАЛЬНЫЙ репозиторий через разделяемый ресурс**. Связанный worktree — не отдельный
репозиторий: конфиг общий; `git config` без `--worktree` пишет в `.git/config` основного дерева. Проба считала worktree песочницей.

## Fix

1. Подмена снята: `git config --local --unset user.name` · `--unset user.email` (личность — глобальная, владельца).
2. Проба 1d несёт личность в ОКРУЖЕНИИ своих вызовов (`GIT_AUTHOR_*` / `GIT_COMMITTER_*`), `git config` в worktree не пишет.
3. **Страж класса — преполёт 0 `tools/commit.mjs`:** коммит, который уйдёт в origin (без `--no-push`), не подписывается личностью
   зарезервированного домена (RFC 2606/6761: `.invalid` · `.example` · `.test` · `.localhost` · `example.com/org/net`); отказ — до
   поднятия номера сборки, с источником подмены (`git config --show-origin`) и командой снятия.

```
@guard commit-identity
THREAT:         a sandbox writes a test identity into the shared git config (a linked worktree, a script) and every later commit goes
                to origin under it — 31 commits did, unnoticed for nine hours
PROVED-AGAINST: `--selftest` — «probe <probe@example.invalid>», «sbx <sbx@test>», «x <x@example.com>» are test identities; the owner's
                and near-miss real domains («examples.com», «testing.io») are not; live — a local `user.email=probe@example.invalid`
                refused the commit (exit 1, version.json unchanged, 2026-09-26 03:00:57)
GAP:            a test identity with a REAL-looking domain passes; an identity that is real but not the owner's passes — the guard
                judges the test-domain class, not «is it the owner»
ON-REAL-PATH:   NOT YET — the path is the next time a sandbox leaks an identity
```

`TWINS: searched "config', 'user." · "git config user." · "worktree add" in tools/ — found 5 other identity writers (doc-header-lint
selftest, revert-guard selftest, probe commit-1c, s14, s29 W1): all in their OWN `git init` repositories (own config) — safe; one other
worktree creator (probe dist-fresh-on-clean-exports) writes no config — safe.`

## Решение владельца — внесено

Вопрос — интервью №039 (три пути: переписать историю · файл сопоставления имён · оставить). **[OWNER]** Q1 = «A)» · 2026-09-26 07:52 +03:00
(страница контура) — переписать историю, коммиты снова подписаны владельцем; журнал решений `MASTER_PLAN.md` §7 №134.

`AUTH: интервью №039, Q1 = A — действие варианта: «Агент переписывает автора этих коммитов на ваше имя и принудительно отправляет историю на GitHub».`

Исполнение (сессия 75):
1. Резервная копия всей прежней истории — `git bundle create … --all` (проверен `git bundle verify`); прежние коммиты живут и в reflog
   этой машины (`git reflog show origin/main` → `0d694c6 … 06:43:47`).
2. Переписано в СВЕЖЕМ клоне (рабочее дерево владельца не трогалось): `git filter-repo --mailmap <probe → Mikalai Kryvusha
   <kotkrinik@yandex.ru>> --refs 7bc3266..main` — ровно 48 коммитов (31 «probe» → владелец; 17 владельца — только номер, их родители
   сменились); каждый из 48: дерево и обе даты побайтно равны прежним; метки версий v1.0.0–v2.7 не тронуты (`git show-ref --tags` —
   одна сумма до и после); в 18 сообщениях 22 ссылки на старые номера заменены новыми, иных изменений в сообщениях нет (скрипт сверки).
3. Отправлено `git push --force-with-lease=main:0d694c6 origin <переписанная>:main` — 2026-09-26 08:10 +03:00 (08:10:26 по reflog), `0d694c6 → f396998`;
   право на форму `--force-with-lease` выдал владелец рукой (`node tools/grant-permissions.mjs "Bash(git push --force-with-lease:*)"`,
   его слово в чате 08:07: «давай  тебе права добавим, чтобы ты мог такое делать сам»).
4. Рабочая копия переставлена `git reset --soft` на отправленную историю (деревья равны — файлы не менялись); ссылки на старые номера в
   55 отслеживаемых файлах заменены механически (92 замены, повторный прогон — 0).

**Первая попытка отвергнута до отправки:** `filter-repo` без `--refs` переписал 759 коммитов и все метки версий — он снимает подписи
GitHub с давних веб-коммитов, и номера меняются от первого такого коммита; ни одна строка варианта A этого не обещала (урок — `EXPERIENCE.md`).

## ✅ STATUS: DONE (2026-09-26 08:20 +03:00)

- Гигиена: `node tools/commit.mjs --selftest` ✅ (четыре случая преполёта 0 — тестовая личность отказана, владелец и похожие настоящие
  домены — нет); `git config --local --list | grep -c "^user\."` → `0`; `git var GIT_AUTHOR_IDENT` → «Mikalai Kryvusha <kotkrinik@yandex.ru>».
- Функциональный прогон: «Проверка» варианта A на переписанной истории — `git log --format='%an' 7bc3266..HEAD | sort | uniq -c` →
  `48 Mikalai Kryvusha`; GitHub API `repos/MikalaiKryvusha/KAIF/commits?per_page=60` — все 60 последних коммитов «Mikalai Kryvusha ·
  kotkrinik@yandex.ru · MikalaiKryvusha» (между отправками 08:10:26 и 08:12:54 +03:00 по `git reflog show origin/main`, прочитано); первый коммит после переписывания `d0e552e` — автор и коммиттер владелец.
- Страж `commit-identity` остаётся `ON-REAL-PATH: NOT YET` — путь стража наступит, когда песочница снова протечёт личностью.

## Карта номеров: старый → новый (48 коммитов, 2026-09-25 17:27 → 2026-09-26 06:43)

Ссылку на старый номер в тексте, написанном до 08:10 26 сентября вне этого репозитория (чат, тикеты), ищи здесь.

```
09-25 17:27  9c85106 → ac17a04  probe → владелец
09-25 17:36  3f12d82 → 242b3c6  probe → владелец
09-25 17:55  e4e1d51 → eaad761  probe → владелец
09-25 18:01  199a5dd → 24fd4c2  probe → владелец
09-25 18:04  d336312 → c4971f0  probe → владелец
09-25 18:14  e4e91aa → 54de97e  probe → владелец
09-25 18:17  1ce4275 → 8dd55db  probe → владелец
09-25 18:18  ae54c60 → e83e84d  probe → владелец
09-25 18:32  1d21f23 → db15c1f  probe → владелец
09-25 18:47  c7a964e → cbf75a5  probe → владелец
09-25 18:56  ef17e87 → 0457e4c  probe → владелец
09-25 19:26  6abbd8b → 1ad0408  probe → владелец
09-25 20:12  4412890 → 36aef4e  probe → владелец
09-25 20:38  263a6a2 → 3da457f  probe → владелец
09-25 21:03  fa0e9e0 → 3357c48  probe → владелец
09-25 21:09  5f60441 → f549b66  probe → владелец
09-25 21:55  d3c58da → 550f704  probe → владелец
09-25 22:32  de01658 → 85190ad  probe → владелец
09-25 22:36  433b89b → fd7d022  probe → владелец
09-25 22:40  c6a4ed7 → e90311e  probe → владелец
09-25 23:50  7a74fd8 → c5b342b  probe → владелец
09-26 00:10  093efc1 → 19a06c5  probe → владелец
09-26 00:17  f5335d8 → 154066c  probe → владелец
09-26 00:25  9f54e42 → 7d72041  probe → владелец
09-26 00:37  876caae → 5e43a32  probe → владелец
09-26 01:07  1d5d07b → c741298  probe → владелец
09-26 01:25  fb982cb → 4e67be5  probe → владелец
09-26 01:29  3a04e9b → 0d50f18  probe → владелец
09-26 02:01  902e321 → 721e791  probe → владелец
09-26 02:31  4cd6543 → c3eb388  probe → владелец
09-26 02:55  193bff1 → 9de0953  probe → владелец
09-26 03:13  d764157 → a6910bd  владелец (только номер)
09-26 03:14  d8db68a → 25d67fb  владелец (только номер)
09-26 03:46  b7f1422 → bf4a4b5  владелец (только номер)
09-26 03:47  e9f80fb → d0cec72  владелец (только номер)
09-26 04:13  19ca496 → 4b06b28  владелец (только номер)
09-26 04:36  b062484 → b52e625  владелец (только номер)
09-26 04:58  606df41 → a6c8732  владелец (только номер)
09-26 05:12  708fed0 → 6562895  владелец (только номер)
09-26 05:16  39ba2c7 → 7de09d0  владелец (только номер)
09-26 05:28  05a907d → fef29d5  владелец (только номер)
09-26 05:31  2dcb393 → 91e6593  владелец (только номер)
09-26 05:34  7847dbd → 9048160  владелец (только номер)
09-26 05:35  acc4738 → 5ec7995  владелец (только номер)
09-26 06:09  3bff990 → e3d7e95  владелец (только номер)
09-26 06:17  b0dad39 → dde6748  владелец (только номер)
09-26 06:25  3e5feac → 7007bc0  владелец (только номер)
09-26 06:43  0d694c6 → f396998  владелец (только номер)
```

## Decisions made without the owner

1. `[ИИ]` Снять локальную подмену, а не записать владельца локально: глобальная личность — его, локальная копия была бы второй парой.
2. `[ИИ]` Страж судит класс «тестовый домен», а не «личность = владелец»: второе потребовало бы зашить имя владельца в инструмент
   (личность — владельца, её не решает агент), и отказывало бы соавтору.
3. `[ИИ]` С `--no-push` страж молчит: так ходят пробы в песочнице; коммит в origin без `--no-push` — всегда под стражем.
4. `[ИИ]` Инструмент переписывания — `git filter-repo` (рекомендация самого git вместо `filter-branch`): он же переписывает ссылки на
   номера в сообщениях коммитов; установлен `pip install --user`, в проект не входит.
5. `[ИИ]` Диапазон — `7bc3266..main` (последний коммит владельца до «probe» — граница): переписывается только то, что вариант A назвал,
   плюс неизбежные потомки; первая попытка шире (759 коммитов, метки версий) не отправлялась.
6. `[ИИ]` Ссылки на старые номера в документах репозитория заменены новыми механически (владелец в варианте A принял, что они перестанут
   открываться; замена это снимает, смысла ссылок не меняет); карта выше — для ссылок вне репозитория.

## Links

`reports/KAIF_AUDIT/2026-09-26_up6b_fixes_judge_brief.md` (суд, нашедший дефект вне предмета) · `tools/commit.mjs` (преполёт 0) ·
`tools/sandbox/probes/commit-1d-leak-run.mjs` · память проекта «KAIF local public development».
