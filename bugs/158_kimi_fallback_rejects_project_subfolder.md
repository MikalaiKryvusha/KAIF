# Bug 158 — ручной Kimi fallback отбрасывает сессию, открытую в подпапке проекта

**Status:** 🔧 FIXING THIS SESSION — подтверждено extracted-function reproduction
**Version/build:** KAIF 2.10 RC · **When/context:** 2026-11-23 16:34 +03:00
**Severity:** S2 — `--alive`/`--measure` не видят рабочую сессию на заявленном subfolder path
**Fixing:** эта сессия

**Вектор цели:** **Maintain.** No-env fallback обязан сопоставлять session cwd с ближайшим KAIF root, сохраняя nested-project routing и cross-agent fail-closed.

**Fix accepted when:** session cwd `<project>/src/deep` выбирается из root/deep для alive/measure; вложенный маркер выбирает inner project; прежние freshness/cross-agent cases зелёные.

## Forensics

`latestKimiSession` требует `same(state.cwd, root)`. Extracted function с `cwd=<project>/tools` вернул null для lookup root и нашёл сессию только при lookup exact cwd. Dispatcher в это время правильно поднимается к nearest marker.

## Root cause

Ручной fallback сравнивает cwd текстом, вместо того чтобы применить тот же nearest-marker алгоритм, что live dispatcher.

## Fix plan

Для state.cwd вычислять nearest KAIF root и сравнивать с запрошенным; запретить простой prefix-match. Расширить bugs147 probe обоими направлениями и nested project. Явные session ids и accepted same-system multi-chat ambiguity не менять.

TWINS: `kimiFallbackId` и `kimiFallbackConflict` оба потребляют выбор; normal hook events с session_id не затронуты.

## Decisions made without the owner

Заполняется при закрытии.

## Links

`bugs/147` · EXP-0219/0213 · `plans/143` KA4/KA9.

kaif-fp: kimi-session-fallback :: exact-cwd-rejects-project-subfolder-session :: v2.10

## Evidence — 2026-11-23 17:53 +03:00

- RED до правки: `node tools/sandbox/probes/bugs147-kimi-alive-fallback.mjs` → exit 1. Для `state.cwd=<project>/src/deep` lookup root/deep ошибочно падал в Claude `claude_old` и печатал `10 of 1000000`; inner nested lookup дал exit 2.
- RED на неизменённом HEAD: `node tools/sandbox/probes/bugs147-kimi-alive-fallback.mjs --rev HEAD` → exit 1, `RED reproduced: exact-cwd subfolder rejection and nested routing failure`.
- GREEN после правки: `node tools/sandbox/probes/bugs147-kimi-alive-fallback.mjs` → exit 0, `PASS`. Root и deep выбирают Kimi `session_kimi_live`/`500000 of 891289`; outer не захватывает более свежую nested session; inner alive exit 0 и measure выбирает `session_kimi_nested`/`510000 of 891289`. Оба freshness порядка, explicit Claude ids и Kimi-only fail-closed остаются зелёными.
- Same-system simultaneous-chat ambiguity не менялась; живой VS Code subfolder не запускался, проверен реальный `--alive`/`--measure` CLI path на файловых fixtures.
