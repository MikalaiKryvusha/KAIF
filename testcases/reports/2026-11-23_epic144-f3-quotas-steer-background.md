# Прогон Epic 144 F3 — quotas, automatic steer, VS Code background and VSIX

**Создан:** 2026-11-23 12:46 +03:00 · **Исполнитель:** Kimi Code, Windows 11
**Version/build:** official engine 2.7.2 (`56145f849`) + fork changes; extension `mikalai-kryvusha.kimi-code-kaif` 0.9.1

## 1. Работа

Проверены критерии 6–8, 11–12 `plans/144`: managed 5h + 7d/monthly quotas, automatic steer с media rollback и exactly-once fallback, VS Code sidebar background, отдельная идентичность и самодостаточная VSIX. Операционный план — `plans/146`; красные проверки были написаны до изменений steer и темы.

## 2. Контур

- Fork `F:/Temp/kimi-code-kaif`, Node 24.15.0, pnpm 10.33.0, Git Bash. Reference `gxgleo67@4298cb7f` (Apache-2.0).
- VS Code 1.123.0, изолированные extensions/user-data/Kimi/OS homes. VSIX — `apps/vscode/artifacts/vsix/kimi-code-win32-x64.vsix`.
- РЕАЛЬНЫЙ МИР: накоплено — официальное расширение и профиль владельца пока не менялись; данные и техника — реальный VS Code и локальная сборка; путь — установка VSIX в изолированный Extension Host, открытие webview, чтение манифеста и журнала. Установка в живой профиль и приёмка фона глазами владельца остаются F4.

## 3. Прогоны

| # | Момент | Команда | Исход |
|---|---|---|---|
| 1 | 2026-11-23 12:15 +03:00 | `pnpm --filter kimi-code-kaif exec vitest run … test/managed-usage* test/webview/usage-status-bar.test.tsx` | 0 · 10/10 |
| 2 | 2026-11-23 12:17 +03:00 | `pnpm --filter kimi-code-kaif exec vitest run … test/webview/chat-store.test.ts` | 1 · RED 5/6 до steer: running Enter очередил, `steerChat` не вызывался |
| 3 | 2026-11-23 12:20 +03:00 | повтор `test/webview/chat-store.test.ts` | 0 · 6/6 |
| 4 | 2026-11-23 12:23 +03:00 | `pnpm --filter kimi-code-kaif exec vitest run … test/theme-background.test.ts` | 1 · RED 1/2 до theme |
| 5 | 2026-11-23 12:24 +03:00 | все пять новых/affected файлов + `pnpm --filter kimi-code-kaif typecheck` | 0 · 18/18, обе части typecheck |
| 6 | 2026-11-23 12:35 +03:00 | `pnpm --filter kimi-code-kaif exec vitest run … test/settings-store.test.ts` | 0 · 29/29 после обновления mock/ожидания automatic steer |
| 7 | 2026-11-23 12:38 +03:00 | `node apps/vscode/scripts/vsix-package.mjs win32-x64` | 0 · 27 files, 18 834 343 unpacked bytes, package/static checks passed |
| 8 | 2026-11-23 12:39 +03:00 | `node apps/vscode/scripts/extension-host-smoke.mjs --version 1.123.0 --vsix …` | 1 · runner `Cannot find module …/ws`, до активации |
| 9 | 2026-11-23 12:40 +03:00 | `env -u ELECTRON_RUN_AS_NODE node apps/vscode/scripts/extension-host-smoke.mjs --version 1.123.0 --vsix …` | 0 · `mikalai-kryvusha.kimi-code-kaif` 0.9.1, 10 commands, webview opened |
| 10 | 2026-11-23 12:41 +03:00 | `pnpm --filter kimi-code-kaif test` | 1 · **416 passed + 3 baseline failures + 1 skipped** |
| 11 | 2026-11-23 12:31 +03:00 | те же 3 файла на pristine worktree `56145f849` | 1 · те же 3 baseline failures: UNC stat, MCP path shape, replay path shape |
| 12 | 2026-11-23 12:43 +03:00 | `pnpm lint` | 1 · comments/oxlint/import boundaries green; guards остановлен на `jsPlugins changed` |
| 13 | 2026-11-23 12:43 +03:00 | effective config vs baseline | только перестановка двух одинаковых `jsPlugins`; конфиги не менялись, snapshot не переписывался |

## 4. Проверки

Гигиена: 18/18 новых/affected проверок · 29/29 settings-store · typecheck обеих частей · VSIX package/static verify · `ratchet`/`instructions` зелёные · comments/oxlint/import boundaries зелёные. Полный extension test — 416 passed + 3 исходных Windows failures. Полный `pnpm lint` остановлен на перестановке plugin paths, не на коде.

Функциональный прогон: реальная VSIX установлена в изолированный Extension Host; прочитаны идентичность, версия, 10 команд и открытие webview. Steer/quotas/theme проверены через реальный store/component path и прочитанные вызовы/состояние; computed RGB и снимок живого webview остаются F4.

| Case | Status | Observation |
|---|---|---|
| Quota mapping/UI | pass | 5h + weekly/monthly, percentages, countdown, loading/error, non-finite ≠ zero |
| Accepted steer | pass | running Enter → `SteerChat`, queue=0, order сохраняется |
| Turn-ended race | pass | resolved `ok:false` → один dedicated idle `streamChat`, без toast/рекурсии |
| Rejected steer | pass | `pendingInput.restore=true`, ready media restored, ошибка видна |
| Media lifecycle | pass | accepted очищает только подтверждённые ready IDs; uploading item остаётся |
| Theme | pass | body/root sidebar variable + editor fallback; card/popover/input не тронуты |
| VSIX identity | pass | `kimi-code-kaif` / `mikalai-kryvusha` / `Kimi Code (KAIF fork)` 0.9.1 |
| Isolated startup | pass | VS Code 1.123.0, 10 commands, webview opened |
| Live owner visual | blocked | computed RGB и приёмка снимка владельцем — F4 |
| Changesets | partial | четыре F3 текста подтверждены владельцем и записаны; F2 текст ещё ждёт подтверждения |

## 5. Найдено

- Official VSIX verifier оставлял bare `uuid`; исправлено через `alwaysBundle`, package verify зелёный.
- Прежний running Enter создавал queue; новые red→green тесты закрыли accepted/race/rejected/media/order.
- Первый Extension Host smoke упал из-за унаследованного `ELECTRON_RUN_AS_NODE=1`; снятие переменной дало настоящий запуск, код не менялся.
- Три Windows failure воспроизведены и на pristine `56145f849`; нашим дефектом не названы.
- Полный lint краснен только на порядке `jsPlugins`; baseline не переписывался.
- `bugs/151` получил исправление и regression coverage, но остаётся открытым до живого Extension Host пути и F4.

## 6. Следы

- `plans/146`, `apps/vscode/THIRD_PARTY_NOTICES.md`, `.changeset/kaif-*.md`, `apps/vscode/changelog.md`.
- VSIX `F:/Temp/kimi-code-kaif/apps/vscode/artifacts/vsix/kimi-code-win32-x64.vsix`.
- `testcases/reports/2026-11-23_epic144-f3-quotas-steer-background.md`.
- `bugs/151`, `plans/144`, `STATUS.md`.

## 7. Вердикт

**F3 — VERIFIED WITH CAVEATS; epic — partial.** Код, VSIX и изолированный запуск подтверждены. F2 changeset, live managed quotas, computed dark background, живой steer гонки и визуальная приёмка владельца остаются воротами F4; `bugs/150–151` не закрыты.
