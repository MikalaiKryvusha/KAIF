# БРИФ судьи — лёгкий судья шагов TK1–TK4 версии KAIF 2.10 (исток KAIF, сессия 88)

Ты — судья (`/fable-judge`, KAIF-блок). Главная сессия заявляет, что сделала шаги TK1, TK2, TK2б, TK3, TK4 эпика TK (`plans/137`) и закрыла
критерии 3 и 4 `plans/136`; критерии 1, 2, 20 — «внесены, ждут замера». Твоя работа — переисполнить заявленные проверки и найти, где заявление
шире наблюдения. Итог — дайджест на русском. Вердикт по умолчанию при сомнении — REFUTED по пункту.

## Где что

- Исток: `D:\work\ai_sandbox\KAIF` (Git Bash — `/d/work/ai_sandbox/KAIF`). Последний коммит работы — смотри `git log --oneline -3`;
  дифф работы — `git show --stat HEAD` и `git diff v2.9 -- framework/AGENT_GUIDE.md framework/skills/autoloop/SKILL.md
  framework/skills/fable-judge/SKILL.md framework/skills/team-deployment/references/team-constitution-template.md tools/build-framework.mjs
  tools/check-framework.mjs`.
- Заявления: `plans/137_epic136_TK_owner_conversation.md` (шаги с ✅/🔧), `plans/136_EPIC_kaif_2.10.md` (критерии 1–4, 20 и их «Проверка»),
  отчёты `testcases/reports/2026-10-18_tk1-no-prescribed-opening.md` и `_tk2-turn-end-decision.md`, сообщение коммита.
- Пробы: `tools/sandbox/probes/tk1-opening-red.mjs` · `tk1-wait-call-scan.mjs` (`--selftest`) · `tk4-manager-stop-red.mjs`.
- Тикеты (слова владельца поля): #156 · #157 · #140 · #137 — `gh issue view <N> --repo MikalaiKryvusha/KAIF --json body` (только чтение).

## Правила тишины (жёсткие — машина владельца)

1. Только чтение в истоке: никаких правок, коммитов, `git config`, `git checkout`, `git stash`. Пробы — можно запускать (они работают на
   копиях во временном каталоге и убирают его сами). НЕ запускай `npm run test:core`, `tools/verify-contour.mjs`, `tools/review.mjs` (кроме
   `--search`), ничего с окнами, звуком, `KAIF_DIST`.
2. Транскрипт сессии (`C:\Users\krinik\.claude\projects\d--work-ai-sandbox-KAIF\*.jsonl`) — приватные данные: проба по нему — без `--quote`,
   цитат из него в дайджест не переносить.
3. Не спрашивай никого, не пиши наружу.

## Что судить (охоты)

1. **Заявление шире наблюдения:** «критерий 3 ✅», «критерий 4 ✅» — переисполни их строки «Проверка» и сверь с выводом.
2. **Слово владельца:** в #156 владелец сказал «просто не упоминайте этой инструкции. И не говорите в инструкции "не начинай со слов
   владельца"» — нет ли в поставке (`framework/`, ноты сборщика) запрета или предписания начала ответа в ЛЮБОЙ форме (не только «first words»)?
   Справочник §17 и нота 2.10 сборщика упоминают снятие — нарушают ли они слово владельца или законны (история/миграция)? Вынеси суждение.
3. **Бюджет руководства:** `wc -l framework/AGENT_GUIDE.md` против `git show v2.9:framework/AGENT_GUIDE.md | wc -l` — прирост 0?
4. **Близнецы:** правило конца хода (#140/#157) — есть ли в поставке ещё места ожидания владельца без зова (дайджест разведки называл три:
   строка PENDING fable-method, п. 6 fable-loop, подтверждение в `/release`) — что с ними сделано или названо?
5. **Ослабленные проверки:** правка строки «Проверка» критерия 4 (было «свод», стало «пары таблицы близнецов») — обоснована? Не слабее ли?
6. **Пары реестра:** `diff framework/skills/fable-judge/SKILL.md .claude/skills/fable-judge/SKILL.md` — побайтно? Концы строк правленых файлов —
   LF (`file <путь>`)?
7. **Нота сборщика доезжает дословно:** нота «2.9» больше не обещает начало ответа; ноты «2.10» — не шире поведения?

## Итог

Дайджест — `C:\Users\krinik\AppData\Local\Temp\claude\d--work-ai-sandbox-KAIF\1e59e180-dce4-47e6-883f-6d567fbb0ddd\scratchpad\recon\judge-tk.md`:
по охоте — `VERIFIED` / `REFUTED` / `CAVEAT` с уликой (команда и вывод дословно); общий вердикт VERIFIED / VERIFIED WITH CAVEATS / REFUTED.
Последним сообщением — 8–12 строк итога и путь к файлу.
