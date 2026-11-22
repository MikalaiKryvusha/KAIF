# Прогон Epic 144 F1/F2 — auto-compaction off и удержание закрытия Kimi

**Created:** 2026-11-23 01:45 +03:00 · **Run by:** Kimi Code 2.7.2, VS Code, Windows 11
**Version/build:** KAIF main после build 868 · официальный Kimi SHA `56145f849caa305d42acd09b67fb65d11146f887` · fork branch commit `b42e17e46`

## 1. Работа

Проверены база официального Kimi Code 2.7.2, новый `[loop_control] auto_compact = false`, ручной `/compact`, Kimi-ступени 70/75/80/90 %, soft→force escalation и ограничение обычной работы после force. Базис — `researches/51`, `plans/144` критерии 1–5 и 9, `plans/145`, `bugs/150–151`.

## 2. Контур

- Официальный Kimi monorepo в `F:/Temp/kimi-code-kaif`, Node 24.15.0, pnpm 10.33.0, чистый checkout тега 2.7.2 до патча.
- KAIF origin `D:/work/ai_sandbox/KAIF`; deployed hook проверен через `s14` после пересборки `dist`.
- РЕАЛЬНЫЙ МИР: накоплено — длинная Kimi VS Code сессия после прежнего compaction, живой `wire.jsonl`, глобальная проводка KAIF; данные и техника — машина и VS Code владельца; путь — реальные UserPromptSubmit/PreToolUse/Stop и текущий `/skill:end-chat-soft`. Новая VSIX в реальный профиль ещё не установлена.

## 3. Прогоны

| # | Момент | Команда | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-23 01:03 +03:00 | `pnpm install --frozen-lockfile` | 0 · 1963 зависимости; desktop node-gyp fallback на win32-x64 prebuild назван в логе |
| 2 | 2026-11-23 01:08 +03:00 | `pnpm exec vitest run --reporter=agent packages/agent-core-v2/test/agent/fullCompaction` | 1 · baseline 130 passed, 2 failed: Windows path/environment и hook payload |
| 3 | 2026-11-23 01:10 +03:00 | `MSYS_NO_PATHCONV=1 cmd.exe /d /c "pnpm exec vitest run --reporter=agent packages/agent-core-v2/test/agent/fullCompaction"` | 1 · те же 2 failure, 130 passed; повтор без параллельного lint |
| 4 | 2026-11-23 01:12 +03:00 | `pnpm exec vitest run … fullCompaction.test.ts -t 'triggers auto compaction …|attributes background auto compaction|compacts and retries …'` | 0 · 3/3 default-on auto paths green |
| 5 | 2026-11-23 01:12 +03:00 | `pnpm --filter kimi-code typecheck && pnpm --filter kimi-code build && node apps/vscode/scripts/vsix-package.mjs win32-x64` | typecheck/build 0 · VSIX verifier 1: `Bare runtime dependency "uuid" remains` |
| 6 | 2026-11-23 01:13 +03:00 | `pnpm exec vitest run … -t 'does not auto compact before a step|refuses an after-step automatic begin|returns provider overflow without compaction'` | 1 · доказанный RED: 3/3 off tests fail на немодифицированном engine |
| 7 | 2026-11-23 01:16 +03:00 | `pnpm exec vitest run … -t 'autoCompact is false|…default-on controls…'` | 0 · 7/7: before/after/overflow off, manual compact и 3 default-on |
| 8 | 2026-11-23 01:19 +03:00 | `pnpm exec tsc -p packages/agent-core-v2/tsconfig.json --noEmit` | 0 после добавления `autoCompact: undefined` в два fixture |
| 9 | 2026-11-23 01:19 +03:00 | `pnpm exec vitest run … goal.test.ts … goal-tools.test.ts` | 0 · 146/146 |
| 10 | 2026-11-23 01:24 +03:00 | `pnpm exec vitest run --reporter=agent packages/agent-core-v2/test/agent/fullCompaction` | 1 · 134 passed + те же 2 baseline Windows failure; новых failure нет |
| 11 | 2026-11-23 01:25 +03:00 | `node framework/hooks/context-window.mjs --selftest` | 0 · точные Kimi steps/tokens, escalation и post-force contour green |
| 12 | 2026-11-23 01:28 +03:00 | `node tools/sandbox/probes/kimi-window-mutants.mjs` | 0 · control 0 red; K1/K3/K4/K5/K6/K7 красные ровно на адресованных случаях |
| 13 | 2026-11-23 01:35 +03:00 | `node tools/build-framework.mjs && node tools/sandbox/s14-refresh-hooks.mjs` | 0 · build green, deployed s14 green включая soft→force и post-force |
| 14 | 2026-11-23 01:44 +03:00 | повтор `7/7 off+manual+default` и `tsc` перед судом форка | 0 · суд engine VERIFIED WITH CAVEATS |
| 15 | 2026-11-23 01:45 +03:00 | `git commit -F … && git push -u origin kaif/no-auto-compaction` | 0 · fork `b42e17e46` запушен; pre-commit comments/oxlint green |
| 16 | 2026-11-23 01:46 +03:00 | `node tools/build-framework.mjs && npm run test:core` | выполняется на момент первой записи отчёта; итог будет внесён после чтения |

## 4. Проверки

Гигиена: engine off+controls **7/7** · goal **146/146** · typecheck green · полный compaction **134 passed + 2 исходных Windows failure** · KAIF selftest green · мутанты K1/K3–K7 адресованы · deployed `s14` green · KAIF build green. Полный KAIF полигон ждёт чтения итога строки 16.

Функциональный прогон: в настоящей VS Code Kimi-сессии прочитаны реальные ступени **70 % (632738/891289)**, **75 % (669574/891289)** и **80 % (720453/891289)**; на 80 % вызван `/skill:end-chat-soft`. Структурный поиск `context.apply_compaction` по живому wire нашёл только старое событие 2474, нового после текущего фикса на момент записи нет. Полный путь до прощания и установленная VSIX ещё не приняты.

| Case | Status | Observation |
|---|---|---|
| E1 — before-step auto off | pass | один ответ модели, 0 compaction, исходная история сохранена |
| E2 — after-step direct auto begin off | pass | `begin({source:'auto'}) = false`, 0 compaction |
| E3 — provider overflow auto off | pass | turn failed с исходной 413, 0 compaction |
| E4 — manual compact with auto off | pass | summary применён, 1 LLM call |
| E5 — default-on controls | pass | 3/3 прежних автоматических пути работают |
| K1 — точные ступени | pass | 70/75/80/90; минимальные токены 623903/668467/713032/802161, −1 токен остаётся ниже |
| K2 — soft→force | pass | soft и повторный soft не открывают работу на force; force entry проходит |
| K3 — post-force | pass | STATUS/git проходят; README/build получают код 2 |
| K4 — мутанты | pass | K6 возвращает старое «soft satisfies force», K7 снимает post-force guard; оба красные только на своих случаях |
| LIVE-70/75/80 | pass | реальные сообщения хука и вход в soft прочитаны в текущей сессии |
| LIVE-CLOSE | blocked | завершение текущего чата и отсутствие нового compaction нужно прочитать до самого прощания |
| VSIX | blocked | официальный baseline verifier остановлен на bare `uuid`; следующий шаг — разбор bundling в F3 |

## 5. Найдено

- `bugs/150` — прежняя приёмка остановилась на soft entry; полный путь позже дошёл до compaction. DONE отозван.
- `bugs/151` — владелец сообщил о потере follow-up на running→idle гонке; red controlled repro запланирован в F3.
- Baseline Kimi Windows: два fullCompaction failure воспроизводятся до и после нашего diff; причина в этом прогоне не локализована, новым дефектом нашего patch не названы.
- Baseline VSIX verifier: bare runtime `uuid` на немодифицированном официальном build; packaging blocker вынесен в F3.
- `tools/sandbox/s14` первый прогон после правок использовал старый `dist`; после обязательной пересборки зелёный. Старый untracked `.kaif/kaif-core.mjs` также удалял `whenToUse` при sync; зеркала восстановлены из HEAD, две нужные правки внесены вручную, untracked core в коммит не входит.

## 6. Следы

- `F:/Temp/kimi-code-kaif` · branch `kaif/no-auto-compaction` · commit `b42e17e46`.
- https://github.com/MikalaiKryvusha/kimi-code/tree/kaif/no-auto-compaction
- `framework/hooks/context-window.mjs` · `tools/sandbox/probes/kimi-window-mutants.mjs` · `tools/sandbox/s14-refresh-hooks.mjs`.
- Живой wire `C:/Users/krinik/.kimi-code/sessions/wd_kaif_75e6656bac87/session_4dfd62c8-c940-48cd-bf57-840364c96e7a/agents/main/wire.jsonl`.
- Task logs baseline и test runs — в журнале текущей Kimi-сессии; точные команды и итоги перечислены выше.

## 7. Вердикт

**partial** — исполняемые engine/hook контуры и текущие живые 70/75/80 подтверждены; полный KAIF полигон на момент первой записи выполняется, а VSIX, changeset и полное живое закрытие остаются открытыми воротами.
