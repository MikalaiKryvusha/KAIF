# Bug 97 — поставка и обновление: три предположения о том, что не доезжает до уже развёрнутого парка

**Status:** 🔬 ПРЕДПОЛОЖИТЕЛЬНЫЙ — не верифицирован, причина не установлена · скоуп **2.3**
**Version/build:** build 279 · **When/context:** круги ревью R1/R2 фазы R, 2026-08-09
**Fix accepted when (observable):** НЕ ОПРЕДЕЛЁН — критерий приёмки задаёт исполнитель после
установления причины (решение №70: разбор и лечение за Fable, не за автором документа)

Семейство собрано из трёх вхождений кругов ревью R1/R2 вокруг одного маршрута — штатного
обновления развёрнутого проекта 2.0/2.1 до 2.2. Общее у них: то, что версия 2.2 заявляет о себе
(обязательный полевой отчёт · объявление смен правил · предполётное предсказание прохода), в поле
доезжает у́же заявленного, а итог прогона при этом утвердительный. Ни одно вхождение не
верифицировано; причины не устанавливались.

## 1. Обязательный полевой отчёт не рождается на штатном маршруте обновления 2.0/2.1→2.2, и update-verify зеленеет без него

**Адрес:** `framework/KAIF_REFERENCE.md:247`
Прочие адреса того же вхождения: `framework/installer/KAIF-CORE.mjs:767` (пункт задания
`field-report`) · `framework/installer/KAIF-CORE.mjs:1550` (район финальных гейтов) ·
`framework/skills/kaif-update/SKILL.md:63-68` (шаг 5 ритуала) · `framework/readmes/reports.md:12`.

**Заявлено.** `KAIF_REFERENCE.md` §10.3: «`field-report` demands the mandatory field update report
on disk in `reports/KAIF_UPDATES/`, pinned to the delivered version — an update does not verify
green without its report». То же в `framework/readmes/reports.md:12` («Every framework **update**
and the initial **install** MUST finish with a short report here») и в
`framework/skills/kaif-update/SKILL.md:67-68` («Its checkpoint EXECUTES the file check — the update
does not verify green without the report»).

**Наблюдалось.** Пункт `field-report` существует только в ядре 2.2, а штатное обновление
исполняется СТАРЫМ, уже развёрнутым ядром. Список обязательных чекпоинтов `runFinalGates` выводил
регуляркой ИЗ ТЕКСТА задания: нет пункта — нет требования. На дереве 2.1, поднятом из ассетов
релиза, `update --source ../src22` выдал задание из «7 items» без `field-report`, а `update-verify`
ответил «✅ update-verify passed».

**Улика.**

```
KAIF-CORE.mjs:1550  task.matchAll(/kaif-core\.mjs checkpoint ([a-z-]+)/g)

$ node .kaif/kaif-core.mjs update --source ../src22
  … 7 items
$ node .kaif/kaif-core.mjs update-verify
  ✅ update-verify passed
```

**Кого касается.** Весь существующий парк 2.0/2.1: головная фича 2.2 (обратная связь поля) не
замыкается на нём, вход для 2.3 не появляется, а `/kaif-update` шаг 5 указывает агенту на пункт
задания, которого в его задании нет.

**Замечено.** Круг R2, 2026-08-09 (blocker).

**Состояние на 2026-08-09.** Адрес на месте, наблюдаемое ИЗМЕНИЛОСЬ. Коммит `f65107f` («полевой
отчёт требуется ПОСТАВЛЕННОЙ ВЕРСИЕЙ, а не текстом задания») ввёл `fieldReportOnDisk()`
(`framework/installer/KAIF-CORE.mjs:1545`) и отдельную ветвь в `runFinalGates`
(`framework/installer/KAIF-CORE.mjs:1571-1591`), срабатывающую именно когда задание пункта не
просило; `dist/KAIF-CORE.mjs:1571` несёт то же. При этом без изменений остались две части
наблюдения: список чекпоинтов по-прежнему выводится регуляркой из текста задания
(`framework/installer/KAIF-CORE.mjs:1569`), и пункт `field-report` по-прежнему рождается только
ядром 2.2 (`framework/installer/KAIF-CORE.mjs:767`). Живого прогона 2.1→2.2 при заведении
документа не выполнялось — новое поведение наблюдением не перепроверено.

## 2. Две смены ПРАВИЛ версии 2.2 уезжают в поле обычным диффом — их нет в policyChanges

**Адрес:** `tools/build-framework.mjs:258` (`POLICY_CHANGES_BY_VERSION`)
Прочие адреса того же вхождения: `framework/KAIF_REFERENCE.md:267` (§10.6) ·
`framework/AGENT_GUIDE.md:207` (раздел «Document header meta»).

**Заявлено.** Комментарий над конструкцией (`tools/build-framework.mjs:255-257`): «A rule change of
the previous version is declared here and the update task surfaces it in a separate „decisions for
the OWNER“ section — never merged silently». Тот же контракт в `KAIF_REFERENCE.md:267-269`.

**Наблюдалось.** `POLICY_CHANGES_BY_VERSION['2.2']` содержит 5 записей (CLI safety · guard exit
semantics · `REQUIREMENTS_FRAMEWORK.md` · CONTEXT REFRESH · ENVIRONMENT DOSSIER) и не содержит:
(1) полевой отчёт как обязательное условие ритуала обновления/установки; (2) новую обязательную
схему шапки для каждого рабочего канон-документа (`framework/AGENT_GUIDE.md:207` и далее —
`plans/`, `ideas/`, `researches/`, `homeworks/`). Обе приезжают механической заменой
`AGENT_GUIDE.md` и readme-шек. Прецедент противоположного поведения есть: 2.1 объявляла свою
миграцию явно (`tools/build-framework.mjs:230`).

**Улика.** Проверка НАСТОЯЩЕГО собранного бандла, `dist/KAIF-CORE-BUNDLE.md`, блок
`kaif-bundle-manifest.json` (прогон 2026-08-09):

```
bundle version=2.2 · policyChanges[2.2] entries=5
ABSENT — reports/
ABSENT — field report
ABSENT — field-report
ABSENT — doc-header
ABSENT — document header
ABSENT — KAIF_UPDATES
```

**Кого касается.** Проект с десятками документов знаний молча оказывается вне канона: правило
приехало, раздел «decisions for the OWNER» о нём не сказал. Это в точности оплаченный сценарий
поля («владелец узнаёт о смене правила на аудите»), ради которого §10.6 и заведена.

**Замечено.** Круг R2, 2026-08-09 (major).

**Состояние на 2026-08-09.** Адрес на месте, наблюдаемое воспроизводится: прогон выше сделан по
текущему дереву и текущему `dist/`.

## 3. `diff --source` показывает пересечение с уже развёрнутым набором, а не «что новая версия изменит здесь»

**Адрес:** `framework/installer/KAIF-CORE.mjs:2317` (комментарий «the preview must judge in DEPLOYED
space»); сам цикл предпросмотра — `framework/installer/KAIF-CORE.mjs:2345-2348`.

**Заявлено.** `framework/skills/kaif-update/SKILL.md:36-37` предписывает прогон как предполётное
предсказание: «`node .kaif/kaif-core.mjs diff --source <url|dir>` — a per-module preview of what the
new version would change *here*».

**Наблюдалось.** Цикл отбрасывает всё не-markdown (`if (!f.path.endsWith('.md')) continue;`,
строка 2346), а `if (!mine) continue; // not deployed here` (строка 2348) молча пропускает любой
путь, которого нет в `moduleShas` — то есть все НОВЫЕ файлы релиза
(`REQUIREMENTS_FRAMEWORK.md`, `reports/README.md`, навык `kaif-go`, `.kaif/hooks/`,
`kaif-requirements-lint.mjs`). Итог прогона при этом утвердительный.

**Улика.** Прогон круга на реальном дереве 2.1 ядром 2.2:

```
36 file(s) carry upstream static-module changes; 27 — nothing to do
```

— 63 файла против 79 в манифесте, тогда как фактический проход дал «38 replaced, 14 added,
27 kept». Статическая пересъёмка по текущему бандлу (2026-08-09):

```
bundle FILE blocks=161
md=140  non-md=21
non-md: kaif-bundle-manifest.json · .kaif/tools/kaif-canon-lint.mjs · .kaif/tools/kaif-provenance.mjs ·
        .kaif/tools/kaif-requirements-lint.mjs · .kaif/hooks/prompt-refresh-timer.mjs ·
        .kaif/hooks/sample-antigravity-hooks.json · .kaif/hooks/sample-codex-hooks.json ·
        .kaif/hooks/sample-copilot-hooks.json · .kaif/hooks/sample-cursor-hooks.json ·
        .kaif/hooks/session-start-refresh.mjs · .kaif/hooks/settings-fragment.json ·
        .kaif/hooks/stop-status-guard.mjs · templates/languages/{ar,de,es,fr,hi,ja,pt,ru,zh-Hans}/skill-triggers.json
```

**Кого касается.** Агента, исполняющего предписанный шаг «предскажи проход»: он получает картину,
скрывающую часть поставки (в замере круга — 18%), поданную как полную.

**Замечено.** Круг R2, 2026-08-09 (minor).

**Состояние на 2026-08-09.** Адрес на месте, наблюдаемое воспроизводится: обе строки `continue`
присутствуют по указанным номерам, дословно.

## Links

- Круги ревью R1/R2 фазы R — `plans/59_kaif_2.2_phase_R_release.md`.
- Родственные семейства того же прогона заведены отдельными баг-документами в `bugs/`.

## Триаж 2.3 (фаза S, 2026-08-14)

> Вердикты двухступенчатого триажа (механика на HEAD → скептик, дефолт REFUTED; сводная таблица — `reports/KAIF_AUDIT/2026-08-14_r2_triage_SUMMARY.md`).

| № | Вердикт | Тяжесть | Эпик | Улика триажа |
|---|---|---|---|---|
| 1 | STALE | hygiene | - | Снято коммитом f65107f (2026-08-09). Проверено чтением HEAD: framework/installer/KAIF-CORE.mjs:1545-1556 — fieldReportOnDisk() с пином поставленной версии; runFinalGates :1571-1590 — ветвь 'THE FIELD REPORT IS REQUIRED BY THE DELIVERED VERSION, NOT BY THE TASK'S PROSE': когда текст задания не содержит 'kaif-core.mjs checkpoint field-report' (:1581), гейт проверяет reports/KAIF_UPDATES/*_KAIF_<ver>_UPDATE_REPORT.md на диске и краснит без него (:1583-1586). Дефект 'update-verify зеленеет без отчёта на маршруте 2.0/2.1→2.2' механически закрыт; остаточные части (regex-вывод чекпоинтов из текста :1569, рождение пункта только ядром 2.2 :767) больше не воспроизводят наблюдение. |
| 2 | CONFIRMED | substantial | U | Попытка опровергнуть как намеренный дизайн провалена внутренним прецедентом. Контракт: KAIF_REFERENCE.md:267-269 (§10.6) + tools/build-framework.mjs:262-265 — смена правила объявляется в policyChanges и печатается секцией 'decisions for the OWNER', 'never merged silently'. Блок POLICY_CHANGES_BY_VERSION['2.2'] (build-framework.mjs:268-274) содержит ровно 5 записей и объявляет такие же НОВЫЕ канон-правила 2.2 (REQUIREMENTS_FRAMEWORK.md, CONTEXT REFRESH, ENVIRONMENT DOSSIER) — значит, класс 'новое обязательное правило' в канал входит. Обязательный полевой отчёт (меняет семантику зелёного update-verify — тот же класс, что объявленный Guard exit semantics) и мета-шапка документов есть только в TEMPLATE_NOTES_BY_VERSION['2.2'] (:245-246) — обычный новостной канал диффа, оплаченный сценарий field gap 04-§6. Смягчение (не blocker): после f65107f гейт сам сообщает о требовании отчёта при отказе (KAIF-CORE.mjs:1585); мета-шапка приезжает целиком молча. |
| 3 | CONFIRMED | substantial | U | Обе строки дословно на HEAD: framework/installer/KAIF-CORE.mjs:2346 'if (!f.path.endsWith('.md')) continue;' и :2348 'if (!mine) continue; // not deployed here' в цикле diff --source (:2345-2361). Защита 'намеренный дизайн DEPLOYED space' не проходит: комментарий :2317-2320 обосновывает только трансформы (language/placeholder) против фантомных дельт, а не пропуск новых и не-md файлов; итоговая строка :2362 подаёт две корзины (changed / nothing-to-do) как полный учёт без строки о добавляемых файлах. Заявление навыка framework/skills/kaif-update/SKILL.md:36-37 ('what the new version would change here') нарушено: файлы, новые для релиза (в замере R2 — 14 added, ~18% поставки, включая .kaif/hooks/ и kaif-requirements-lint.mjs), и 21 не-md блок бандла невидимы, а итог утвердителен. git log с 2026-08-09 по файлу — только f65107f и a49ec72, цикл не трогали. |
