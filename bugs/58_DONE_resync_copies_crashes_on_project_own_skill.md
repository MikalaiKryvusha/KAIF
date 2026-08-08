# Bug 58 — resyncCopies роняет оба финальных гейта сырым ENOENT на собственном навыке проекта

> **Создан:** 2026-08-08 16:26 +03:00 (аудит 01, `plans/33` шаг 5). **Родитель:**
> `reports/KAIF_AUDIT/2026-08-08_family-12_refusal-without-the-right-move.md`. **Статус:** ✅ DONE
> 2026-08-08 19:55 +03:00 — зеркала пишутся одной формой `writeMirror` (mkdir + именованный
> отказ), свод `s03`/S12b доказан красным по ДВУМ мутациям. Вехи: подтверждена скептиком
> 2026-08-08 16:26 · закрыта 2026-08-08 19:55 +03:00. **Вовне:** —.

**Status:** ✅ DONE · **Version/build:** 2.1 (build 190) · **When/context:** найдена 2026-08-08
пробным аудитом задачи T3.

## Вектор цели (Avoid)

Не допустить, чтобы установку/обновление было НЕЧЕМ закрыть при полностью нормальном состоянии
дерева. Проект, заведший собственный навык, делает ровно то, что предписывает канон
(`KAIF_REFERENCE` §7.3: «The canonical skill set lives in `.claude/skills/`; mirrors derive from it
mechanically») — и получает сырой стектрейс Node вместо диагностики.

**Fix accepted when (observable):** после `install --agents claude-code,codex` и создания
`.claude/skills/my-project-skill/SKILL.md` — `node .kaif/kaif-core.mjs sync` завершается кодом 0,
печатает «↻ re-synced N system skill copies», и `test -f .agents/skills/my-project-skill/SKILL.md`
истинно; `node .kaif/kaif-core.mjs verify-final` доходит до строки `✖ verify-final FAILED: N issues`
вместо `code: 'ENOENT'` в выводе.

**Сегодняшнее измеренное состояние:** обе команды падают стектрейсом — критерий различает починку
от текущего поведения, дополнительных замеров не требует.

## Symptom

`framework/installer/KAIF-CORE.mjs:1428` (идентично в поставочном `dist/KAIF-CORE.mjs:1428`):

```js
    for (const f of canon) { writeFileSync(f.path.replace('.claude/skills', base), f.content); synced++; }
```

`writeFileSync` — сырой импорт `node:fs`, обёртки с `mkdir` нет. Наблюдённое исключение:
`errno: -4058, code: 'ENOENT', syscall: 'open', path: '…\.agents\skills\my-project-skill\SKILL.md'`.

## Repro (deterministic)

Три шага, полностью — в карточке F4 аудит-отчёта. Роняет `sync`, `checkpoint recheck`,
`checkpoint placeholders` и ОБА финальных гейта.

## Root cause

`deployAgentSystems` (строка 417) создаёт каталоги только для навыков ИЗ БАНДЛА через `writeIfNew`
(`mkdirSync` на строке 407); `resyncCopies` перебирает `readdirSync('.claude/skills')` ЦЕЛИКОМ.
Зеркальный каталог для навыка, которого не было в бандле, не создаёт никто. Семейство 12: отказ не
называет верного хода — его просто нет.

## Fix plan

- [x] 1. `mkdirSync(dirname(to), { recursive: true })` перед записью зеркала (образец — строка 407),
      и то же для zoo-code-ветки (строка 1432, `.roo/commands`).
- [x] 2. Обернуть тело цикла так, чтобы отказ на одном файле называл путь и команду восстановления,
      а не выбрасывал ENOENT из финального гейта — это лечение самого семейства, а не симптома.
- [x] 3. Ассерт в своде на профиле многосистемного развёртывания + красный по мутации.
- [x] 4. Не трогать: пропуск ORIGIN_TIED-навыков при анонимном ресинке (1417), отсутствие зеркал
      для систем вне `agents` маркера (1427), срезку строки `name:` для zoo-code (1432).

## Фикс (как сделано)

Починка **формой**, а не двумя точечными правками: у записи зеркала теперь ровно один способ —

```js
function writeMirror(to, content, failures) {
  try { mkdirSync(dirname(to) || '.', { recursive: true }); writeFileSync(to, content); return true; }
  catch (e) { failures.push(`${to} (${e.code || e.message})`); return false; }
}
```

Обе ветки `resyncCopies` (три системы через `base` + плоская zoo-code) зовут её, а остаток отказов
собирается в одну строку лога с путями и командой восстановления. Канонические навыки в
`.claude/skills/` при этом не в опасности ни при каком исходе — функция только раскатывает их
наружу.

## Decisions made without the owner

1. **Отказ логируется, а не роняет команду.** Альтернатива — `die` при первой неудачной записи —
   вернула бы ровно ту боль, ради которой заведён баг: финальный гейт снова стал бы непроходимым.
   Проваленное зеркало — состояние окружения (права, занятый путь), а не состояние KAIF; канон
   `.claude/skills/` цел, и строка лога называет и путь, и команду. Чтобы это не стало «зелёной
   ложью», отказ печатается отдельной `⚠`-строкой со ВСЕМИ путями, а не сводится к счётчику.
2. **Отказ на одном зеркале не отменяет остальные.** Цикл продолжается: три системы из четырёх
   получить зеркала лучше, чем ноль, а отставшие названы поимённо.
3. **Свод — отдельный профиль S12b, а не правка S12.** Добавление собственного навыка в живой
   профиль S12 сдвинуло бы его двадцать существующих ассертов (плейсхолдеры, чекпоинты,
   update-verify, самоочистка). Новый профиль стоит те же строки и ничего не расшатывает.
4. **Мутаций две, а не одна.** Фикс несёт ДВА независимых свойства (каталог создаётся · отказ
   назван), и каждое доказано своей мутацией — иначе следующая правка тихо снимет одно из них.

## TWINS

`TWINS: searched` — записи производного (зеркального) пути сырым `writeFileSync` без создания
каталога. Инвентарь: 34 вызова `writeFileSync` в `KAIF-CORE.mjs` + `framework/kaif-unpack.mjs`.
**Found 2 sites** — обе в `resyncCopies` (`:1428` три системы, `:1432` zoo-code), обе починены
формой. Опровергнуто 6 кандидатов, с причиной у каждого: `:419`/`:423` (`deployAgentSystems` —
идут через `writeIfNew`, у которого `mkdirSync` на `:407`) · `:502` (`backupTree` — свой
`mkdirSync(dirname(to))`) · `:788` (`buildSyntheticBaseline` — свой `mkdirSync('.kaif/install')`) ·
`:1167` (`cmdUpdate` — `mkdirSync` строкой выше) · `kaif-unpack.mjs:74` (свой
`mkdirSync('.roo/commands')`). `:1066`/`:1101` (классификация) пишут в путь, существование
которого доказано самой веткой (`fileShaNorm(f.path)`), новые файлы идут через `writeIfNew`.

## ✅ STATUS: DONE (2026-08-08 19:55 +03:00)

| Критерий приёмки (дословно из карточки) | ДО фикса (замер) | ПОСЛЕ фикса |
|---|---|---|
| `sync` завершается кодом 0 | код 1, сырой стектрейс `Node.js v24.15.0` | код 0 ✅ |
| печатает «↻ re-synced N system skill copies» | не доходит | `↻ re-synced 40 system skill copies from the canon` ✅ |
| `test -f .agents/skills/my-project-skill/SKILL.md` | false | true ✅ (плюс `.grok`, `.cline`, `.roo/commands`) |
| `verify-final` доходит до `✖ verify-final FAILED: N issues` | `code: 'ENOENT'` в выводе | `✖ verify-final FAILED: 30 issues` ✅ |
| `checkpoint recheck` переживает свой навык | падал (зовёт `resyncCopies` первым делом) | без ENOENT ✅ |

**Страж и его два красных.** Свод `tools/sandbox/s03-receipts-tools.mjs` → профиль **S12b**
(12 проверок).
Мутация 1 (убран `mkdirSync` из `writeMirror`) → `❌ ПРОВАЛОВ: 5`: три зеркала не заведены, ENOENT
в выводе, финальный гейт красный. Мутация 2 (убрана обёртка именованного отказа) → предметные
красные на пробе «зеркало занято каталогом»: команда роняется стектрейсом, отказ пути и команды не
называет. Ни одна мутация не покрасила ассерты «не трогать».

**Дерево.** `node tools/build-framework.mjs` EXIT=0 · `npm run test:core` — **all 14 suites green**.

## Links

`reports/KAIF_AUDIT/2026-08-08_family-12_refusal-without-the-right-move.md` (карточка F4) ·
`bugs/33` (небезопасные дефолты CLI) · `bugs/27`, `bugs/40` (семейство 12) · `EXP-0008` («ошибка
инструмента несёт готовое решение, никогда — обход») · `KAIF_REFERENCE` §7.3.
