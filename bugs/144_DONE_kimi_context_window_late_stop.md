# Bug 144 — Kimi context-window hook waited for Stop and missed auto-compaction

**Status:** ✅ DONE · **Severity:** S2 · **Version/build:** KAIF 2.10 WIP, Kimi Code CLI 2.7.2 ·
**When/context:** 2026-11-21, поле Krinik-Retribution · **Closed:** 2026-11-21 15:22 +03:00

## Goal vector / done when

**Type:** Achieve. На `PostToolUse` свежие 891655/1048576 должны один раз выдать 85 % и
`/skill:end-chat-soft`; после `PostCompact` старый счётчик молчит, а свежие 840000 снова дают 80 %.

## Symptom

Kimi автоматически сжал длинный ход при отображаемых 85 %, но адаптер KAIF ждал `Stop` и не успел
отдать приказ мягкого закрытия.

## Forensics / root cause

Живой `wire.jsonl`: последний `token_counting.measured` 891655, затем
`context.apply_compaction(tokensBefore=851835, tokensAfter=23531)`. Официальная документация Kimi
различает внешний `measured+estimated` счётчик и auto-compaction по `reserved_context_size`.
Адаптер ошибочно использовал только `Stop.usage`.

## Fix

Добавлены `lastKimiContext` и `kimiWireOf`; свежий `token_counting.measured` читается на
`UserPromptSubmit`/`PostToolUse`, `Stop.usage` остаётся fallback. Последний compaction отсекает старую
историю. Observation-only события не завершаются блокирующим exit 2. Проводка добавлена в
`framework/hooks/kimi-config-fragment.toml`; документация и `researches/48` §5 обновлены.

## Verification

[TESTED: 2026-11-21 15:22 +03:00 · настоящий hook executable на Kimi-событиях и живом wire поля ·
отчёт `testcases/reports/2026-11-21_kimi_context_window.md`]

- Hygiene: `node framework/hooks/context-window.mjs --selftest` — all ok;
  `node tools/build-framework.mjs` — поставка и 59 embedded files OK; mutant без чтения wire красный
  на обоих новых сценариях.
- Functional run: `node tools/sandbox/s14-refresh-hooks.mjs` — вся песочница зелёная, включая Kimi
  config/events; в поле хук прочитал текущие 127927 токенов и корректно промолчал ниже порога.
- REAL WORLD: accumulated · live session wire соседнего проекта · verified with real state.
- Полный `npm run test:core` не дошёл до тестов: существующий preflight отклонил четыре старых
  `runKimi` без assert в `s14-refresh-hooks.mjs:994,1006,1010,1018`. Это не скрыто и не отмечено green.

## Decisions made without the owner

[AI] Для ступеней KAIF выбран отображаемый счётчик Kimi, а не внутренний `tokensBefore`; точный
резерв auto-compaction не выдуман. Для разблокировки штатной пересборки исправлен один известный
неэкранированный апостроф в `tools/build-framework.mjs:309`.

## Links

- `researches/48_kimi_code_adapter_recon.md` §5
- https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/config-files.html
