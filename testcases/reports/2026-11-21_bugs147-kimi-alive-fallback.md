# Test run report — bugs/147: a hand `--alive` must not judge a Kimi session by Claude's transcript

**Created:** 2026-11-21 19:47 +03:00 · **Run by:** Kimi K3.1 Pro (Kimi Code VS Code session `session_70b1e5d5-8d8d-444a-935a-f760d2e67130`) ·
**Version/build:** KAIF 2.10 WIP, `3b78552` + the bugs/147 working-tree fix; build after the fix green.

## 1. Work

The live Stop acceptance failed: writing `tools/sandbox/kimi-stop-live-probe.mjs` without running it produced no test debt and no continuation.
The investigation found that this VS Code session still runs the old project-relative hook commands, each exiting 1, while the hand `--alive`
returned a false green from an older Claude session. The fix selects the newest session of the current project across the configured agent systems
when no session-id environment variable arrives. Basis: `bugs/147`, `plans/143` KA4/KA9 and `researches/50` §6 · §11 · §14.

## 2. Contour

`framework/hooks/context-window.mjs`, its selftest and all its mutant probes; a synthetic two-agent project in the OS temp folder; then the real
Kimi VS Code session on the owner's machine. REAL WORLD: accumulated — the owner's existing Kimi config and session store, plus an older Claude
session of this same project · data and machine — the actual VS Code session, actual global hook log and actual wire · path — the same hand command
used by `/skill:resume`; read before and after the fix. The current process still holds the old wiring until reload.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | ≈ 2026-11-21 19:32–19:37 +03:00 | write `tools/sandbox/kimi-stop-live-probe.mjs`; end the turn without running it | no continuation; `.kaif/test-debt.json` stayed empty |
| 2 | ≈ 2026-11-21 19:38–19:40 +03:00 | read the current Kimi `state.json`, `wire.jsonl` and the global `logs/kimi-code.log`; `kimi doctor config` | current id found; every old `.kaif/hooks/…` command exits 1; config itself valid |
| 3 | ≈ 2026-11-21 19:43 +03:00 | `node tools/sandbox/probes/bugs147-kimi-alive-fallback.mjs` before the fix | 1 · RED: older `claude_old` judged, `--alive` 0, `--measure` read 10 Claude tokens |
| 4 | ≈ 2026-11-21 19:45 +03:00 | `node tools/sandbox/probes/bugs147-kimi-alive-fallback.mjs` after the fix | 0 · no Kimi presence → 1; presence → 0; measure reads 500000 Kimi tokens |
| 5 | ≈ 2026-11-21 19:45 +03:00 | `node tools/sandbox/probes/bugs147-kimi-alive-fallback.mjs --rev 3b78552` | 1 · the same defect reproduced on the named pre-fix revision |
| 6 | ≈ 2026-11-21 19:45 +03:00 | `node framework/hooks/context-window.mjs --selftest` | 0 · all ok |
| 7 | ≈ 2026-11-21 19:46 +03:00 | `node framework/hooks/context-window.mjs --alive` in the real current session | 1 · correctly names `session_70b1e5d5-…`, no hook record, asks for reload/new session |
| 8 | ≈ 2026-11-21 19:46 +03:00 | `node framework/hooks/context-window.mjs --measure` in the real current session | 1 · correctly reads its Kimi wire: 363317 of the 891289-token compaction point |
| 9 | ≈ 2026-11-21 19:46 +03:00 | `node tools/sandbox/probes/mutants-of.mjs framework/hooks/context-window.mjs` | 0 · gate-close, Kimi-window and PT6 mutant probes all on their addressees |
| 10 | ≈ 2026-11-21 19:47 +03:00 | `node tools/build-framework.mjs` | 0 · check-framework OK; generated dist refreshed |
| 11 | ≈ 2026-11-21 19:47 +03:00 | `KIMI_CODE_HOME=<missing sandbox home> node tools/sandbox/s14-refresh-hooks.mjs` | 0 · the refresh-hooks suite green |
| 12 | ≈ 2026-11-21 21:39 +03:00 | `node tools/sandbox/probes/bugs147-kimi-alive-fallback.mjs` with the newer-Claude reverse case | 0 · both hand commands return 2 and name the ambiguous Kimi/Claude ids; neither reports the other system as current |
| 13 | ≈ 2026-11-21 21:39 +03:00 | `node tools/sandbox/probes/bugs147-kimi-alive-fallback.mjs --rev 3b78552` | expected 1 · the old code returns alive 0 for both `claude_old` and `claude_new`, and measures their 10/20 tokens |
| 14 | ≈ 2026-11-21 21:40 +03:00 | `node framework/hooks/context-window.mjs --selftest`; all three mutant groups; build | 0 · all ok; every mutant on its addressee; check-framework green |
| 15 | ≈ 2026-11-21 22:00 +03:00 | the bugs/147 probe extended with explicit Claude id and a Kimi-only marker, then `--rev 3b78552` | fixed 0 · explicit Claude alive 0 / measure 1 with its own 20 tokens; Kimi-only without id refuses 2/2. Pre-fix expected 1 · false green persists in Kimi-only, explicit Claude control stays valid |
| 16 | ≈ 2026-11-21 22:00 +03:00 | selftest, all three context-window mutant groups and build after the final fallback edit | 0 · all green |

## 4. Checks

Hygiene: context-window selftest green · three mutant-probe groups green · the bugs/147 probe red on `3b78552` and green after the fix · build and s14 green.
Functional run: the real VS Code session's hand `--alive` and `--measure` were executed and their output READ; the live Stop case was attempted and failed,
then traced to the old wiring in the actual global Kimi log. A positive live `--alive` and Stop continuation require a session started with the new config.

| Case | Status | Observation |
|---|---|---|
| smoke: no cross-agent false green | pass | the fixture and the real current session return 1 when the selected Kimi session has no hook record |
| recorded current Kimi session | pass in the fixture | the fixture returns 0 after writing that session's own record |
| Kimi measurement without session env | pass | fixture 500000 tokens; real current session 363317 tokens, both from the named Kimi wire |
| pre-fix control | pass | `3b78552` reproduces the false green and the Claude measurement in both freshness orders |
| newer Claude with an existing unrecorded Kimi session | pass | alive and measure both exit 2 with an explicit ambiguity, naming `session_kimi_live` and `claude_new`; no cross-agent green |
| Kimi-only marker with a newer Claude record | pass | both no-id commands exit 2; the pre-fix revision still produces the false green and Claude measurement |
| explicit system id resolves ambiguity | pass | `CLAUDE_CODE_SESSION_ID=claude_new` keeps Claude alive 0 and measure 1 with its own 20 tokens |
| existing context-window behavior | pass | selftest, all three mutant groups and s14 green |
| live hooks after the dispatcher rewrite | blocked on this process | it loaded the old commands at start; next stand step is a new/reloaded Kimi session, then repeat alive and Stop |
| Stop continuation after an unrun code write | fail in this process | no debt was written because the old PostToolUse command exited 1; not a verdict about the new dispatcher |

## 5. Found

- `bugs/147` — the hand `--alive`/`--measure` fallback could select another agent system's session and report a false green; fixed in the tree,
  positive live verification waits for a session running the new wiring.
- The live Stop failure has a separate observed cause here: Kimi VS Code started before the dispatcher rewrite and still executes the old commands.

## 6. Traces

- `tools/sandbox/probes/bugs147-kimi-alive-fallback.mjs`
- `bugs/147_kimi_alive_reads_claude_session.md`
- `C:/Users/krinik/.kimi-code/logs/kimi-code.log` (2026-11-21T16:29:15–16:37:34Z entries for the current session)
- `C:/Users/krinik/.kimi-code/sessions/wd_kaif_75e6656bac87/session_70b1e5d5-8d8d-444a-935a-f760d2e67130/`

## 7. Verdict

partial — the cross-agent fallback is fixed and observed on both fixture and real current-session paths; the live positive and Stop continuation are
not claimed before a new/reloaded Kimi session runs the dispatcher.
