# Test run report — bugs/149 live 75/80/85 and soft close before Kimi compaction

**Created:** 2026-11-22 13:19 +03:00 · **Run by:** Kimi K3.1 Pro · **Version/build:** KAIF 2.10, current main through `94edfae`, build 865.

## 1. Work

Live acceptance of `bugs/149` against `testcases/TC_bugs149_kimi_context_window_live.md`: the new Kimi VS Code session must record its own
presence, receive the 75/80/85 orders from the actual hook stream, land the current item at 80 %, and invoke `/skill:end-chat-soft` before
`context.apply_compaction`. The hand `--measure` command and direct script calls are supporting evidence only.

## 2. Contour

REAL WORLD: accumulated — the owner's real Kimi configuration, session store, hook state and existing project history · data and machine — the
actual VS Code session `session_6d66c1d4-2a8f-4f04-9eae-0d922a4428ea`, `.kaif/context-window.json`, the real `wire.jsonl` and global hook log ·
path — normal KAIF work fills the window, Kimi itself fires PreToolUse/Stop, and the agent acts on the delivered order.

Kimi's full window is 1 048 576 tokens. KAIF's stages use the actual compaction point, 891 289 tokens. Therefore 670 984 tokens are 64.0 %
of the VS Code full-window scale and 75.3 % of KAIF's early scale; the owner observed 65 % in VS Code at the 75 % voice warning.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-22 09:35 +03:00 | `node framework/hooks/context-window.mjs --alive` | 0 · this session's own id recorded |
| 2 | 2026-11-22 09:39–09:52 +03:00 | live Write → Stop → continuation → `node tools/sandbox/probes/bugs149-live-stop.mjs` | PASS, debt cleared |
| 3 | 2026-11-22 10:43–10:57 +03:00 | `npm run test:core` | 0 · all 28 suites green |
| 4 | 2026-11-22 13:11 +03:00 | attempted `node framework/hooks/context-window.mjs --measure`; Kimi PreToolUse fired first | call not run · live 75 % warning at 670984/891289, `A WARNING only`; repeated after reading |
| 5 | 2026-11-22 13:11 +03:00 | `node tools/say.mjs --file voice/2026-11-22_13-11-08_okno-75-procentov.txt --play` | 0 · `soft voice:` rendered and played; work continued |
| 6 | 2026-11-22 13:16 +03:00 | attempted `git diff --check`; Kimi PreToolUse fired first | call not run · live 80 % order at 717456/891289, logical cut, soft closure at 85 |
| 7 | 2026-11-22 13:16–13:18 +03:00 | checks and `node tools/commit.mjs …` for the current slice | 0 · commit `94edfae`, build 865, pushed |
| 8 | 2026-11-22 13:19 +03:00 | inspect the current id in the global hook log and exact compaction type in its wire | no current-session old-path errors; no compaction yet |
| 9 | 2026-11-22 13:23 +03:00 | attempted attribution lint; Kimi PreToolUse fired first, then `Skill(end-chat-soft)` and `node framework/hooks/context-window.mjs --measure` | live 85 % at 757784/891289, `said:[75,80,85]`; skill invoked; measure 0 |
| 10 | 2026-11-22 13:25 +03:00 | `node tools/sandbox/probes/bugs149-live-order.mjs <this-session-wire>` | PASS · stages at wire lines 1690/1819/1989, close at 1997, `compactions:[]` |

## 4. Checks

Hygiene: `context-window --selftest` all ok; full polygon 28/28; `doc-header-lint` 0 findings; `git diff --check` clean before the green slice.
Functional run: the real VS Code session received all three live PreToolUse blocks; the state, voice artifact, commits, actual skill call and current wire/log were READ.

| Case | Status | Observation |
|---|---|---|
| C1 smoke: own session alive | pass | `--alive` 0 with the same session id |
| C2 Stop continuation | pass | `system_trigger / stop_hook`, file run, debt cleared |
| C3 75 % warning | pass | `said:[75]`, warning only, one voice call, normal work continued |
| C4 80 % logical cut | pass | `said:[75,80]`, current item committed green as `94edfae`, no new heavy task |
| C5 85 % order | pass | live PreToolUse block at 757784/891289, `said:[75,80,85]`, exact soft-close order; hand `--measure` returned 0 |
| C6 soft-close invocation before compaction | pass | `Skill(end-chat-soft)` invoked after C5; exact compaction record absent before and at the invocation checkpoint |
| C7 no continuing old-path errors | pass | no current-id error lines; exact compaction record absent at the checkpoint |

## 5. Found

- none in the fixed contour so far; the owner's VS Code 65 % versus KAIF 75 % observation is explained by the two denominators and recorded in `researches/50` §9.

## 6. Traces

- `testcases/TC_bugs149_kimi_context_window_live.md`
- `bugs/149_kimi_compacts_before_kaif_soft_close.md`
- `.kaif/context-window.json`
- `C:/Users/krinik/.kimi-code/sessions/wd_kaif_75e6656bac87/session_6d66c1d4-2a8f-4f04-9eae-0d922a4428ea/agents/main/wire.jsonl`
- `C:/Users/krinik/.kimi-code/logs/kimi-code.log`
- `voice/2026-11-22_13-11-08_okno-75-procentov.txt`

## 7. Verdict

pass — 75 %, 80 % and 85 % arrived from Kimi itself, the 80 % logical cut landed green, and `/skill:end-chat-soft` was actually invoked before the first `context.apply_compaction`; bugs/149 meets its live acceptance condition.
