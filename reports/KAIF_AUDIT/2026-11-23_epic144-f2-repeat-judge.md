VERIFIED WITH CAVEATS — критерии 1–5 и живой хвост F2 воспроизведены; F2 можно сменить на F3. Это не DONE `bugs/150` и не готовность VSIX: F3/F4, packaging и changeset остаются открытыми.

**Создан:** 2026-11-23 11:52 +03:00 · **Предмет:** повторный независимый суд `plans/144` F2 после чтения `bash-p5tmlfdi` и retractions.

## Claims

| Заявление | Что наблюдал повторный суд |
|---|---|
| Engine `auto_compact=false` закрывает before/after/overflow, ручной `/compact` и default-on контроль сохранены | `pnpm exec vitest run … fullCompaction.test.ts -t <7 named cases>` — **7 passed, 114 skipped**, exit 0 |
| Типы и goal-фикстуры согласованы | `pnpm exec tsc -p packages/agent-core-v2/tsconfig.json --noEmit` — exit 0; goal + goal-tools — **146 passed**, exit 0 |
| Полный compaction не получил новых failure | Повтор — **134 passed + 2 failed**, ровно те же два Windows baseline case: MSYS cwd prefix и пустой PreCompact/PostCompact payload; новых failure нет |
| KAIF steps, soft→force и post-force contour работают | `context-window.mjs --selftest` — all ok; `kimi-window-mutants` — control 0, K1/K3/K4/K5/K6/K7 красные ровно на своих случаях; build + deployed `s14` — зелёные |
| Полный KAIF полигон завершён зелёным | `bash-p5tmlfdi` — task completed, exit 0; `output.log:1962` — `sandbox suite: all 28 suites green` |
| Живой путь дошёл до прощания без нового compaction | Структурный разбор wire после строки 2474: `Skill(end-chat-soft)` на 80 %, `Skill(end-chat-force)` на 90 %, прощание и `turn.ended`; `context.apply_compaction` — **0** |
| Ранняя ложь отозвана там, где стояла | Retraction прочитан обратно в `testcases/reports/2026-11-22_bugs150-closure-latch.md` и `reports/KAIF_AUDIT/2026-11-22_bugs150-closure-latch-judge.md`; исторический VERIFIED помечен REFUTED BY LATER LIVE EVIDENCE |

## Фроды

Не найдено. Тесты не ослаблялись: diff fork `b42e17e46` добавляет 129 строк регрессионных проверок и не удаляет старые; `ratchet` — ничего нового, `instructions` — 184 ссылки разрешены. Конфиги oxlint не менялись. Наружных действий суд не выполнял.

## Caveats

1. Полный `pnpm lint` **не зелёный**: comments, oxlint и import boundaries зелёные, затем `guards` останавливается на `jsPlugins changed`. Сравнение показало только перестановку двух одинаковых plugin paths; `.oxlintrc*` и baseline не изменены. `ratchet` и `instructions` отдельно зелёные. Snapshot не переписывался.
2. Два Windows fullCompaction failure воспроизводятся и до, и после нашего diff; причина не локализована этим судом и не названа нашим дефектом.
3. VSIX остаётся остановленным на bare runtime `uuid`; changeset ещё не создан. Это F3, а не закрытое доказательство F2.
4. `agent-snc1ic48` не содержит независимой вычитки витрины: субагент сообщил лишь об отсутствии правок и `--waive`. Как голосовой гейт это не засчитано.
5. Повторная сборка обнаружила и исправила drift двух generated файлов: комментарий `context-window` в `dist/KAIF-CORE-BUNDLE.md` и pins в `dist/kaif-manifest.json`. Эти generated изменения оставлены для намеренного коммита, чужие untracked не трогались.

## Рекомендация

Зафиксировать F2 как VERIFIED WITH CAVEATS и начать F3: разобрать VSIX `uuid`, создать changeset по правилам upstream, затем реализовать квоты, hardened automatic steer и sidebar background. `bugs/150` остаётся открытым до установленной VSIX и полной живой приёмки F4; `bugs/151` открыт до red repro и hardened steer.
