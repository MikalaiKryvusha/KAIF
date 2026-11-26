# Test run report — closed-session refresh boundary in the KAIF source

**Created:** 2026-11-26 18:13 +03:00 · **Run by:** the agent · **Version/build:** KAIF 2.10 source tree, generated dist after the fix

## 1. Work

`bugs/160` / issue #207 / origin decision №178: a completed closure must suppress subsequent automatic canon refresh in that session, without suppressing new sessions or explicit owner rituals. The case set covers entry versus completion, soft and forced closure, multiple sessions, StopFailure, current Kimi wire forms and the real KIMI KRINIK closing session.

## 2. Contour

Windows 11, Node 24.15.0, KAIF source `framework/hooks/` and generated `dist/`. Synthetic cases use isolated temporary projects; the functional replay uses the actual KIMI KRINIK closing wire through turn 41 and turn 47.

REAL WORLD: accumulated — real owner session records with closure and later messages; data and machine — the owner's Windows session wire; path — source Stop and UserPromptSubmit hooks against isolated state. Verified with real state taken from the real world; no live session or owner profile was changed.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-26 18:13 +03:00 | `node framework/hooks/stop-farewell-capture.mjs --selftest` | 0 · 20/20 pass; the unpatched source failed six cases |
| 2 | 2026-11-26 18:13 +03:00 | `node .tmp/kaif-closure-real-replay.mjs D:/work/ai_sandbox/KAIF/framework/hooks` from the KIMI KRINIK root | 0 · 6/6 real-wire observations pass |
| 3 | 2026-11-26 18:13 +03:00 | `node tools/build-framework.mjs` | 0 · template checks and dist freshness pass after the line-ceiling and BOM fixes |
| 4 | 2026-11-26 18:29 +03:00 (result read) | `npm run test:core` | 1 · 25/28 suites pass; `s01`, `s14`, `s22` fail |
| 5 | 2026-11-26 18:49 +03:00 | `env -u KIMI_CODE_SESSION_ID node tools/sandbox/s14-refresh-hooks.mjs` | 0 · entire affected suite passes on the final dist |
| 6 | 2026-11-26 18:49 +03:00 | `node tools/sandbox/probes/pt5-farewell.mjs` | 0 · 16/16 farewell contract observations pass |
| 7 | 2026-11-26 19:35 +03:00 (result read) | `env -u KIMI_CODE_SESSION_ID node tools/sandbox/probes/hooks-mutants.mjs` | 33/34 mutants pass; only `W9` fails and includes the unrelated baseline `s01` negative fixture plus its intended `SW2` assertion |
| 8 | 2026-11-26 18:49 +03:00 | `pnpm lint` in KIMI KRINIK | 0 · comments, oxlint, import boundaries, guards, ratchet, test doubles, quarantine and instruction checks pass |

## 4. Checks

Hygiene: 20/20 hook checks and the framework build guards pass. Six targeted checks were red on the named unpatched source before the fix.

Functional run: the real closing session was replayed through the source hooks and the emitted/suppressed lines were read.

| Case | Status | Observation |
|---|---|---|
| Entry without farewell | pass | No closed session is recorded |
| Completed soft and forced farewells | pass | Both session ids accumulate |
| Current `content.part` wire form | pass | Farewell text is read and preserved |
| Hourly and pending refresh after closure | pass | Both are silent |
| StopFailure after closure | pass | Closed ids are preserved |
| New session and explicit resume | pass | Their refresh orders remain active |
| Generic transcript closure | pass | Both generic refresh paths are silent; a fresh generic session still refreshes |
| Real turn-41/turn-47 replay | pass | Early entry is open; the real farewell closes the session |
| Framework build | pass | 14 docs, 7 READMEs, 37 skills, 196 bundle blocks and 846 modules verified by the build guards |
| Full core suite | blocked | 25/28 suites pass; `s14` initially inherited the live `KIMI_CODE_SESSION_ID` and passed completely after that variable was removed; `s01` and `s22` are unrelated baseline failures |
| Affected refresh-hooks suite | pass | Entire suite passes on the final dist with the inherited session id removed |

## 5. Found

- `bugs/160_refresh_after_chat_closure.md` — original defect and the two real-wire reader boundaries; focused fix is green, full core verification is pending.
- Initial self-authored integration defects: a six-line template-ceiling overflow and a missing BOM strip in the new test reader; both were corrected and the build was rerun green.
- Unrelated baseline: `s01` scans a negative `git status --short && git push` fixture inside unchanged `context-window.mjs`; `s22` hit native exit `3221226505` already tracked as `bugs/109`. Neither is caused by this diff and neither was modified to force a green claim.

## 6. Traces

- `bugs/160_refresh_after_chat_closure.md`
- KIMI KRINIK real wire: `C:/Users/krinik/.kimi-code/sessions/wd_kimi-krinik-vscode-extension_dec8324e1181/session_b0483cf3-72e6-4af6-8147-d4d83bee60af/agents/main/wire.jsonl`
- Replay harness: `D:/work/ai_sandbox/KIMI-KRINIK-VSCODE-EXTENSION/.tmp/kaif-closure-real-replay.mjs`

## 7. Verdict

partial — focused source, real-replay, full affected `s14` and 33/34 mutants pass; full core and the full mutant probe remain red only on the unrelated baseline `W9`/`s01`/`s22` failures. Adversarial judge is next.
