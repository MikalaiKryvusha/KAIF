# План 153 — Эпик 147 K5: живая приёмка, суд и KIMI KRINIK 1.0.0

> **Создан:** 2026-11-23
> **Родитель:** `plans/147` K5 · `plans/144` F4
> **Статус:** 🟡 запланировано; старт после K4 и актуализации
> **Вовне:** GitHub Release VSIX только после авторизации; rename репозитория отдельно

**Вектор цели:** **Maintain + Avoid.** Доказать весь продукт на накопленном мире владельца и выпустить самодостаточную VSIX без ложных DONE.

**Якорь мета-плана:** «Second Side Bar, quotas/unavailable, steer race, soft→force, computed colors/WebP, isolated VSIX/rollback, changesets, суд и авторизованный GitHub Release».

## Критерии приёмки фазы

- Все критерии `plans/147` 1–13 наблюдены или релиз не выполняется.
- `bugs/150–151` закрываются только полными живыми путями; `bugs/152` не закрывается без реального рецидива/доказанной причины.
- VSIX 1.0.0 запускается вне checkout рядом с official/reference, rollback official сохраняет проекты/сессии.
- Полный lint/typecheck/affected+full tests и суд исполнены; baseline caveats названы, не спрятаны.

## Операционные шаги

- [ ] **K5.0 Нулёвка.** Актуализировать планы/баги/дdiff, получить зелёные предыдущие суды.
- [ ] **K5.1 Test design.** Записать TC matrix: smoke первым, states/races/boundaries/localization/sound; coverage gaps названы.
- [ ] **K5.2 Startup.** Проверить sidebar/editor и Second Side Bar; при Starting… рецидиве снять console/bridge/Extension Host и вернуться в `bugs/152`.
- [ ] **K5.3 Quotas.** 5h + 7d/monthly, проценты/countdown и unavailable при ошибке на живой учётке без секретов.
- [ ] **K5.4 AUTO STEER.** Accepted, three ordered follow-ups, running→idle exactly once, rejected text+media rollback; OFF queue.
- [ ] **K5.5 Auto Compact/closure.** ON vanilla/dormant KAIF; OFF before/after/overflow=0 и полный soft→force до farewell без apply_compaction; thresholds defaults.
- [ ] **K5.6 UI controls.** Header/status/Goal/Swarm/permission/secondary model/model+effort пройти реальными действиями.
- [ ] **K5.7 Language/theme/sound.** EN/ZH/RU live switch, hover/popup/computed RGB/WebP, sound preview и реальное событие с владельцем.
- [ ] **K5.8 Package.** Обновить подтверждённые changesets, version/changelog, build/typecheck/lint/tests, VSIX verify и isolated startup.
- [ ] **K5.9 Rollback.** Установка из VSIX и возврат official с контролем проектов/сессий.
- [ ] **K5.10 Суд.** Независимый `/skill:fable-judge` повторяет claims; исправить blockers и повторить.
- [ ] **K5.11 Release.** При зелёном суде процитировать AUTH владельца, собрать release notes и опубликовать VSIX; rename не выполнять без отдельного слова.

## Верификация

Гигиена и функциональный прогон раздельны; каждый прогон оставляет отчёт и следы. РЕАЛЬНЫЙ МИР: накопленные профиль/config/sessions, реальная учётка и Second Side Bar владельца.

## Риски

Ложное закрытие по входу в skill; повреждение shared config; перепутывание трёх extensions. Лечение — полный wire, backup/fail-safe и проверка extension ID/version в каждом следе.
