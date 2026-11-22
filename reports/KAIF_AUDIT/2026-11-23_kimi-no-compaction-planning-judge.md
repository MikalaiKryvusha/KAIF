# Суд разведки и планов Kimi no-auto-compaction — 2026-11-23

**VERIFIED WITH CAVEATS** — разведка, критерии и переоткрытие bugs/150 подтверждены; работающий код, VSIX и живое закрытие этим вердиктом не принимаются.

## Claims

| Заявление | Что повторно наблюдал судья |
|---|---|
| Живой рецидив требует отозвать DONE | Wire 1977–1982 доказывает только входной soft latch; 2165 — одноразовый 92 % pending; 2365 — force entry; 2375–2465 — рост measured до 890426; 2474 — `context.apply_compaction`, `tokensBefore=1258482` |
| Причина в текущем KAIF latch названа точно | `demand = required && !st.closing`: любой `st.closing` снимает demand; soft не отличается от force; после входа обычные вызовы не ограничены |
| Hook не может запретить PreCompact | Официальные hooks docs: блокируются только PreToolUse/Stop/UserPromptSubmit; PreCompact return values ignored |
| Конфиг 0.99 не является off | `LoopControlSchema` ограничивает ratio 0.5–0.99; reserved=0 закрывает лишь OR-ветку; before/after/overflow пути существуют в `fullCompactionService.ts` |
| Расширение использует общий engine | Official VS Code README: Node SDK in Extension Host; `agent-core-v2` — общий движок |
| Квоты существуют в gxgleo67 | `managed-usage.ts` содержит 5h/7d/month fields и reset; `UsageStatusBar.tsx` рисует кольца/countdown |
| Автоматический steer использует native path | Official 2.7.0 changelog и interaction docs; VS Code `SteerChat → runtime.steer → session.steer`; queue возникает в webview `sendMessage` |
| Follow-up race требует отдельного бага | `bugs/151` содержит наблюдение владельца, code-backed hypotheses и не выдает их за воспроизведенную причину; accepted/turn-ended/failed и media rollback включены в приёмку |
| Темный фон имеет конкретный источник | Official `.dark --background: oklch(0.141…)` и body `var(--background)`; цель владельца — VS Code sidebar, критерий 12 требует theme variable + RGB + human eyes |
| Пороги соответствуют исполнению hook | `ceil(891289 × pct / 100)` пересчитано: **623903 / 668467 / 713032 / 802161**; более ранние floor-числа исправлены в MASTER_PLAN и plans/144 |
| Статус не стоит в ложном DONE | `bugs/150` переименован без DONE; STATUS, plans/136 criterion 38, plans/141 RL1 и plans/143 KA9 переоткрыты; исторические срезы подписаны как отозванные |
| Решения владельца различимы от решений агента | MASTER_PLAN №167–172; attribution-lint new 0 после добавления дословной цитаты force и ссылок на решения |
| Публичный fork авторизован и существует | `https://github.com/MikalaiKryvusha/kimi-code`: `isPrivate=false`, `isFork=true`; AUTH — дословное разрешение владельца на public repo и Release |

## Повторенные проверки

- `node tools/doc-header-lint.mjs` — findings 0; requirements lint 0. Предупреждение walk о старом deleted path ожидаемо до staging rename.
- `node framework/tools/kaif-attribution-lint.mjs check` — new 0, существующий debt 45 не увеличен.
- `node tools/experience-lint.mjs` — 0 findings.
- `git diff --check` — 0.
- Арифметика границ — `623903,668467,713032,802161`.
- Node 24.15.0 и pnpm 10.33.0 совпадают с upstream requirements; официальный тег `@moonshot-ai/kimi-code@2.7.2` = SHA `56145f849caa305d42acd09b67fb65d11146f887`.

## Fraud review

- Ослабленных тестов нет: продуктовые тесты еще не менялись.
- Ложное «исправлено» снято; план открыто говорит, что F1–F4 впереди.
- Чужие untracked assets/voice/config backups не включены в объем.
- Секреты и содержимое учетной записи в разведку не копировались.
- Опыт вспомнен: EXP-0222 — ранняя приёмка входа не доказывает путь закрытия; EXP-0220 — конфиг и стенд не заменяют живое закрытие; EXP-0216 — provider usage, UI count и внутренний compaction counter различны.
- Refresh witness: `.kaif/refresh-marker.json` trigger `compaction` at 2026-11-23T00:34:27+03:00; в чате процитирована строка AGENT_GUIDE о перечитывании после compaction.

## Caveats

1. Это non-code planning gate: baseline build, красные engine tests, VSIX и live closure еще не выполнены и не заявлены.
2. bugs/151 — наблюдение владельца плюс code-backed hypotheses; красный controlled repro обязан появиться в F1 до исправления.
3. Двуязычный README и Release нашего форка авторизованы №172, но еще не написаны; стайлгайд репозиториев владельца должен быть выведен до этих текстов.
4. KAIF 2.10 этим вердиктом не разрешен к публикации.

**Рекомендация:** закоммитить только названные planning/bug/status документы и начать `plans/145` F1 на pinned SHA 56145f8.
