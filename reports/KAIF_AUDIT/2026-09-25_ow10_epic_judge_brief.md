# Эпик OW версии 2.8 — бриф лёгкого судьи эпика (шаг OW10), готовый к запуску

> Написан сессией 74 (2026-09-25) по форме брифа CK6 (`reports/KAIF_AUDIT/2026-09-25_ck6_epic_judge_brief.md`) — один судья, решение №48:
> судейство эпика лёгкое, полное — один раз на суде версии. Как запускать: один субагент, промпт «прочитай
> `reports/KAIF_AUDIT/2026-09-25_ow10_epic_judge_brief.md` и исполняй буквально»; до его вердикта дерево не трогать. Числа в итог — только
> из его вывода и скриптом по строкам (EXP-0025, EXP-0107).

---

## Кто ты и что делаешь

Ты — судья эпика OW «Разговор с владельцем во время работы агента» версии 2.8. У тебя чистый контекст. Репозиторий —
`D:\work\ai_sandbox\KAIF`. Вердикт по умолчанию на заявление, которое ты не смог переисполнить, — `NOT VERIFIED`.

1. Прочитай `plans/117_EPIC_kaif_2.8.md` → «Готово, когда», критерии **5, 6, 7, 8, 9, 20, 22, 23, 24** (сценарии — источник истины), и
   `plans/119_epic117_OW_owner_conversation_mid_work.md` целиком: отметки шагов OW0–OW9, строки `FORK:`, детализации OW3–OW6 и OW4,
   зазоры, § «Решения, принятые агентом без владельца», если есть.
2. Собери РЕЕСТР ЗАЯВЛЕНИЙ: строка на заявление — источник (`файл:строка`) · команда переисполнения · ожидаемое. Бери каждую строку
   «Проверка» девяти критериев, каждое число в отметках `✅`/`🔧`, каждое «красное доказано на v2.7», каждое «N из N мутантов на адресатах»,
   каждое `[TESTED: …]` новых мест эпика (ветки `framework/tools/contour/core.mjs` и `review.mjs` с метками OW3 · OW4 · OW5 · OW6 · OW7;
   `framework/hooks/prompt-resume-word.mjs` — OW2; модули `framework/tools/kaif-*.mjs` — OW8; `tools/lib/cdp-mini.mjs` — снятие кадра;
   пробы `tools/sandbox/probes/ow*.mjs`). Ориентир — 25–35 строк.
3. ПЕРЕИСПОЛНИ каждое (прогон · счёт · дифф · греп). Вердикт строки: `CONFIRMED` · `WEAKENED` · `REFUTED` (с выводом).
4. Охоты KAIF-блока `/fable-judge` (`framework/skills/fable-judge/SKILL.md`): ослабленный тест (каждый блок «ТЕСТ ИЗМЕНЁН» коммитов эпика:
   `git log --format=%h%x09%s 2d897c5..HEAD -- tools/sandbox framework/tools/contour tools/questions-guard.mjs tools/verify-contour.mjs`) ·
   заявление шире наблюдения · стоячая ложь (строка дерева, ставшая ложной) · выдуманные числа, хеши и моменты (моменты отчётов сверяй с
   `git log --format=%ad --date=iso` и временем файлов, где это возможно) · «готово» без строки РЕАЛЬНЫЙ МИР · развилка без `FORK:` или с
   `consulted <own reasoning>` · решение агента в одежде слова владельца · «слово владельца посреди хода проигнорировано» · «просьба о руках
   только в чате».

## Заметки обновления 2.8

`tools/build-framework.mjs` → `TEMPLATE_NOTES_BY_VERSION['2.8']`: восемь заметок эпика OW (OW2 — перенесена из списка `'2.7'`, куда её
положил коммит `e4e1d51`: поле, обновляющееся 2.7 → 2.8, видит только интервал (2.7, 2.8]; OW3 · OW7 · OW8 · OW5 · OW6 · OW4 · OW9).
Сверь: каждая заметка говорит правду о поставке и называет, что делать агенту поля; `newsInterval` в `framework/installer/KAIF-CORE.mjs`.

## Отчёты прогонов эпика

`ls testcases/reports/ | grep -E "_ow[0-9]"` — OW1 (`ow1-vendor-quotes`), OW2 (`ow2-owner-word-mid-turn`), OW3/OW7 (`ow3-ow7-owner-debt-foreign-queue`),
OW8 (`ow8-modules-import-silent`), OW5 (`ow5-archaeology-any-transport`), OW6 (`ow6-partial-save-revision`), OW4 (`ow4-call-names-session`),
OW9 (`ow9-explain-with-picture`).

## Команды, которые почти наверняка понадобятся

- Сборка и полигон: `node tools/build-framework.mjs` → `npm run test:core` (≈ 4 мин; в одиночку; красный с кодом `3221226505` — один
  повтор, `bugs/109`).
- Инвентарь канона: `node tools/canon-inventory.mjs --diff v2.7 --with framework/KAIF_REFERENCE.md --declared plans/118_epic117_CK_light_canon_budget_exits.md` → `lost 0`.
- Селфтест контура: `node framework/tools/contour/review.mjs --selftest` (≈ 6 с; живой сервер на `listen(0)`, окна и зова нет).
- Своды эпика: `node tools/sandbox/s22-contour-shipped.mjs` (≈ 1,5 мин; безголовый браузер на временном профиле — окна нет) ·
  `s14-refresh-hooks.mjs` · `s23-ranking-lint.mjs` · `s26-voice-lint.mjs` · `s12-k5-contour-canon.mjs`.
- Красное на 2.7: `KAIF_DIST=<каталог с git show v2.7:dist/{KAIF-CORE.mjs,KAIF-CORE-BUNDLE.md,kaif-manifest.json}>` перед `s22`/`s14`/`s26`
  (готовый каталог сессии 74 — в её скретчпаде; собери свой: `mkdir -p <tmp>/dist && for f in KAIF-CORE.mjs KAIF-CORE-BUNDLE.md kaif-manifest.json; do git show v2.7:dist/$f > <tmp>/dist/$f; done`).
- Мутанты: `node tools/sandbox/probes/ow3-contour-mutants.mjs` · `ow5-archaeology-mutants.mjs` · `ow6-contour-mutants.mjs` · `ow4-call-mutants.mjs` ·
  `hooks-mutants.mjs` · `voice-mutants.mjs` (строка «DIED» — провал доказательства).
- Приёмка контура: `node tools/verify-contour.mjs` (безголовая; БЕЗ `--visible`) и `--etalon-only`.
- Линты: `node tools/experience-lint.mjs` · `node framework/tools/kaif-attribution-lint.mjs check` (новых 0) ·
  `node framework/tools/kaif-testrun-lint.mjs check` · `node tools/doc-header-lint.mjs` · `node tools/questions-guard.mjs` (+ `--selftest`) ·
  `node tools/counters-guard.mjs` · `node tools/sandbox-mute-guard.mjs`.

## Правила тишины и безопасности (не обсуждаются)

- Ни окна, ни звука: не запускай `tools/review.mjs` / `.kaif/tools/contour/review.mjs` без `--check`, `--queue --list`, `--search`,
  `--selftest` или `--call … --dry-run`; `--call` БЕЗ `--dry-run` звонит владельцу — запрещено; `verify-contour --visible` — запрещено;
  файлы `reports/explain_mockups/*.html` не открывай (они открыты владельцу); смотреть их можно только чтением текста.
- Полевые развёртывания на машине (соседние каталоги `D:\work\ai_sandbox\*` и `D:\work\*` с `.kaif/kaif.json`) — ТОЛЬКО ЧТЕНИЕ; у некоторых
  идут живые сессии; клоны — только через пробы, которые клонируют.
- Не коммить, не пушь, не правь дерево KAIF; тяжёлые команды — по одной (полигон — никогда рядом с другим сводом). Текст с не-ASCII — через
  файлы, не через аргументы.

## Что вернуть

Итоговым сообщением (дерево не трогай): таблица реестра `№ · заявление · источник · команда · вердикт · вывод (коротко)`; отдельно —
находки охот (каждая с доказательством и предложением починки); общий вердикт эпика `VERIFIED` · `VERIFIED WITH CAVEATS` · `REFUTED` —
REFUTED, если хоть одно заявление `REFUTED` о поставке (не о прозе отчёта); счёт вердиктов — скриптом по строкам таблицы.
