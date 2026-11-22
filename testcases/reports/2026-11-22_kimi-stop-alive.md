# Test run report — live Kimi Stop continuation and session-local `--alive`

**Created:** 2026-11-22 09:53 +03:00 · **Run by:** Kimi K3.1 Pro (VS Code session `session_6d66c1d4-2a8f-4f04-9eae-0d922a4428ea`) ·
**Version/build:** KAIF 2.10 WIP, `1c2001c` + the live probe and status update.

## 1. Work

Acceptance of `bugs/146` and `bugs/147` on the owner's real Kimi VS Code path: a new `.mjs` written and deliberately not run must create
test debt, `Stop` must open a continuation, and the continuation must run it. The same new session's `--alive` must return 0 against its own id.
Basis: `bugs/146` lines 12–13, `bugs/147` line 8 and `plans/143` KA9. This run does not judge the context-window stages of `bugs/149`.

## 2. Contour

REAL WORLD: accumulated — the owner's existing Kimi configuration, hook state, session store and an older Claude session of this project ·
data and machine — the actual VS Code session, its real `wire.jsonl`, `.kaif/test-debt.json` and `.kaif/context-window.json` · path — the same
Write, turn end, Stop continuation and hand commands used by KAIF. No synthetic replacement for the live continuation.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-22 09:35 +03:00 | `node framework/hooks/context-window.mjs --alive` | 0 · recorded `session_6d66c1d4-2a8f-4f04-9eae-0d922a4428ea` by the newest Kimi session of this project |
| 2 | 2026-11-22 09:39 +03:00 | Write `tools/sandbox/probes/bugs149-live-stop.mjs`; do not run it; finish the turn | `.kaif/test-debt.json` contains this file and `lastStop` for its signature |
| 3 | 2026-11-22 09:40 +03:00 | read the continuation in the real session wire | `KAIF STATUS guard` arrived with `origin: system_trigger / stop_hook`; the continuation ran in the same agent turn |
| 4 | 2026-11-22 09:51 +03:00 | `node tools/sandbox/probes/bugs149-live-stop.mjs` | 0 · `PASS: Kimi Stop opened a continuation; live debt recorded … at 2026-11-22T06:39:44.220Z` |
| 5 | 2026-11-22 09:52 +03:00 | `node framework/hooks/test-after-code.mjs --status` | 0 · `test debt: none` |
| 6 | 2026-11-22 09:52 +03:00 | `node tools/sandbox/probes/bugs146-kimi-path-red.mjs` | 0 · A–E all as named; pre-fix `8ef671e` red in B and D |
| 7 | 2026-11-22 09:52 +03:00 | `node tools/sandbox/probes/bugs147-kimi-alive-fallback.mjs` | 0 · both freshness orders, explicit Claude id and Kimi-only ambiguity pass |

## 4. Checks

Hygiene: the bugs/146 and bugs/147 probes are green with their named pre-fix controls; no product code changed in this run.
Functional run: the real Kimi VS Code Write → Stop → continuation → run path was walked and the actual wire, debt and command output were READ.

| Case | Status | Observation |
|---|---|---|
| smoke: new code creates debt | pass | the exact new probe path was present in `.kaif/test-debt.json` |
| Stop opens continuation | pass | the 09:40 `KAIF STATUS guard` message is explicitly `system_trigger / stop_hook` in the real wire |
| continuation runs the code | pass | the probe printed PASS; the subsequent debt status is `none` |
| current session alive | pass | `--alive` returned 0 and named this session's own id |
| cross-agent fallback | pass | both freshness orders fail closed; explicit Claude id retains its route |

## 5. Found

- none — the earlier chat statement that Stop had not continued was corrected by the real wire: the continuation was the `KAIF STATUS guard` message.

## 6. Traces

- `tools/sandbox/probes/bugs149-live-stop.mjs`
- `.kaif/test-debt.json` and `.kaif/context-window.json` (live local state)
- `C:/Users/krinik/.kimi-code/sessions/wd_kaif_75e6656bac87/session_6d66c1d4-2a8f-4f04-9eae-0d922a4428ea/agents/main/wire.jsonl`
- `testcases/reports/2026-11-21_bugs147-kimi-alive-fallback.md` (pre-fix and earlier live evidence)

## 7. Verdict

pass — `bugs/146` and `bugs/147` meet their live acceptance conditions; `bugs/149` remains open pending its separate 75/80/85 and pre-compaction soft-close acceptance.
