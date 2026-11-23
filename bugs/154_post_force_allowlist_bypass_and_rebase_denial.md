# Bug 154 — post-force Bash allowlist обходится и запрещает собственный recovery

**Status:** 🔧 FIXING THIS SESSION — оба края подтверждены чистым вызовом predicate
**Version/build:** KAIF 2.10 RC после `bb54080` · **When/context:** 2026-11-23 16:34 +03:00
**Severity:** S1 — финальный рубеж закрытия одновременно слишком широк и слишком узок
**Fixing:** эта сессия

**Вектор цели:** **Avoid + Maintain.** После force разрешаются только целые однострочные операции эстафеты; предусмотренный навыком non-fast-forward recovery обязан проходить.

**Fix accepted when:** `git status --short\nnode tools/build-framework.mjs`, prefix-suffix команды, `git pull`, `git merge` и build отклонены; single-line handover commands, точный `git pull --rebase` и последующий push проходят в source и deployed s14.

## Symptom / Forensics

1. `forceClosureTool` отвергает `[;&|]`, но не CR/LF и не anchor end. Чистый вызов дал `allowed:true` для `git status --short\nnode tools/build-framework.mjs` и `git status --short-extra`. Build не запускался.
2. Тот же predicate дал `allowed:false` для `git pull --rebase`, хотя `framework/skills/end-chat-force/SKILL.md:50–51` предписывает именно его после non-fast-forward.

## Root cause

Prefix regex судит начало строки, а shell исполняет всю строку; allowlist писался от списка команд и не сверился с recovery-шагом навыка.

## Fix plan

Требовать одну строку и полное совпадение разрешённой команды; добавить ровно `git pull --rebase`, не arbitrary pull. Source+deployed cases и адресные мутанты обоих краёв. Сохранить STATUS/FAREWELL access, explicit-path add/commit/push и отказ build/tests после force.

TWINS: searched `forceClosureTool`, `[;&|]`, `git pull --rebase` — source/generated bundle и четыре посистемные копии force skill; других post-force allowlists нет.

## Decisions made without the owner

Заполняется при закрытии.

## Links

`bugs/150` · `plans/144` критерий 5 · EXP-0222.

kaif-fp: Kimi post-force Bash allowlist :: multiline bypass and denied rebase recovery :: v2.10

## Evidence — 2026-11-23 17:53 +03:00

- RED на новых selftests до правки: `node framework/hooks/context-window.mjs --selftest` → exit 1, `selftest: 3 FAIL`; красными были allow и refusal случаи bugs/154.
- Дополнительный RED при вычитке: после первого варианта фикса trailing CR/LF обрезались через `trim`; добавленные leading/trailing control cases дали `selftest: 1 FAIL`. Проверка controls перенесена на raw command до `trim`.
- GREEN после правки: `node framework/hooks/context-window.mjs --selftest` → exit 0, `selftest: all ok`. Целые handover commands и точный `git pull --rebase` проходят; CR/LF/control, substitutions, prefix suffix, generic pull/merge/build отклонены. Integration path после force: STATUS/git/rebase exit 0; README/multiline/build exit 2.
- GREEN `node tools/sandbox/probes/kimi-window-mutants.mjs` → exit 0; K9 без rebase краснит allow+integration случаи, K10 со старым prefix predicate краснит allow+refusal+integration случаи, посторонних красных нет.
- `node tools/sandbox/probes/mutants-of.mjs framework/hooks/context-window.mjs` → exit 1: owned `kimi-window-mutants.mjs` и `kimi-stop-mutants.mjs` OK; вне скоупа `gate-close-mutant.mjs` BAD (G2 mutation does not apply) и `pt6-context-window-mutant.mjs` BAD (addressee count). Эти файлы не менялись.
- `s14` и `dist` этой сессией не запускались и не менялись; живой shell после force не выполнялся, проверен hook decision path.
