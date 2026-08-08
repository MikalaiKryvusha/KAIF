# Bug 58 — resyncCopies роняет оба финальных гейта сырым ENOENT на собственном навыке проекта

> **Создан:** 2026-08-08 16:26 +03:00 (аудит 01, `plans/33` шаг 5). **Родитель:**
> `reports/KAIF_AUDIT/2026-08-08_family-12_refusal-without-the-right-move.md`. **Статус:** 🔴 OPEN —
> подтверждена скептиком живым репро на реальном бандле; фикс не начат. **Вовне:** —.

**Status:** 🔴 OPEN · **Version/build:** 2.1 (build 190) · **When/context:** найдена 2026-08-08
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

- [ ] 1. `mkdirSync(dirname(to), { recursive: true })` перед записью зеркала (образец — строка 407),
      и то же для zoo-code-ветки (строка 1432, `.roo/commands`).
- [ ] 2. Обернуть тело цикла так, чтобы отказ на одном файле называл путь и команду восстановления,
      а не выбрасывал ENOENT из финального гейта — это лечение самого семейства, а не симптома.
- [ ] 3. Ассерт в своде на профиле многосистемного развёртывания + красный по мутации.
- [ ] 4. Не трогать: пропуск ORIGIN_TIED-навыков при анонимном ресинке (1417), отсутствие зеркал
      для систем вне `agents` маркера (1427), срезку строки `name:` для zoo-code (1432).

## Decisions made without the owner

Заполняется при закрытии.

## Links

`reports/KAIF_AUDIT/2026-08-08_family-12_refusal-without-the-right-move.md` (карточка F4) ·
`bugs/33` (небезопасные дефолты CLI) · `bugs/27`, `bugs/40` (семейство 12) · `EXP-0008` («ошибка
инструмента несёт готовое решение, никогда — обход») · `KAIF_REFERENCE` §7.3.
