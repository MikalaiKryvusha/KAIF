# Test run report — Kimi hooks fire and window steps before Kimi's compaction (plans/143 KA1 · KA3; bugs/145; №164)

**Created:** 2026-11-21 17:21 +03:00 · **Run by:** Claude Opus 5.5 (session 104) · **Version/build:** KAIF 2.10 WIP on `21584dc` + the working tree of KA1 · KA3 ·
D2 · D3 · D4; Kimi Code CLI 2.7.2.

## 1. Work

The fix of `bugs/145` (five Kimi hook entries with `matcher = "*"` that Kimi never ran) and the Kimi window steps of decision №164 D1 (the
KAIF steps count against Kimi's own compaction point; a step found on an observation-only event goes out on the next prompt or as a one-time
`PreToolUse` block). Basis: `plans/143` rev. 2 acceptance criteria 2 and 4; `researches/50` §6 · §9 (harness source).

## 2. Contour

The payload `framework/hooks/` (fragment and `context-window.mjs`), the build guard 5zb, the installer's Kimi `AGENTS.md`, the polygon
sandboxes; and the owner's machine: `~/.kimi-code/config.toml` and the new `~/.kimi-code/tui.toml`. REAL WORLD: accumulated — the owner's
config of 201 lines with 21 KAIF hooks written by the previous chat · his data and machine — his own config file, rewritten with a backup ·
path — Kimi reads `config.toml` at session start (checked by `kimi doctor`, not yet by a live session: the 5-hour quota was exhausted).

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | ≈ 2026-11-21 17:12 +03:00 | `node tools/sandbox/probes/bugs145-matcher-red.mjs` (fragment not yet fixed) | 1 · A OK (9263794: 5 «*») · B BAD as expected (tree still broken) · C 4 OK |
| 2 | ≈ 2026-11-21 17:13 +03:00 | `node tools/sandbox/probes/bugs145-matcher-red.mjs` (after the fix) | 0 · A · B · C all as named |
| 3 | ≈ 2026-11-21 17:14 +03:00 | `git worktree add --detach F:/Temp/kaif-5zb-red HEAD` + new `check-framework.mjs` and lib, `node tools/check-framework.mjs` | 1 · exactly 5 lines «5zb:» (:58 · :70 · :76 · :82 · :114); worktree removed |
| 4 | ≈ 2026-11-21 17:15 +03:00 | `node framework/hooks/context-window.mjs --selftest` | 0 · all ok, the four new Kimi cases included |
| 5 | ≈ 2026-11-21 17:15 +03:00 | `node tools/sandbox/probes/kimi-window-mutants.mjs` | 0 · control 0 red; K1 3 · K2 1 · K3 1 — on exactly their cases |
| 6 | ≈ 2026-11-21 17:17 +03:00 | `node tools/sandbox/probes/mutants-of.mjs framework/hooks/context-window.mjs` | 1 → after the addressees of pt6 were added (EXP-0169) 0 · 3 probes on their addressees |
| 7 | ≈ 2026-11-21 17:18 +03:00 | `node tools/sandbox/s14-refresh-hooks.mjs` | 0 · the six Kimi window/config cases green |
| 8 | 2026-11-21 17:16 +03:00 | `kimi doctor config ~/.kimi-code/config-new.toml` → backup `config.toml.20261121-171626.bak` → swap → `kimi doctor config` | 0 · OK; «*» matchers 5 → 0; `[[hooks]]` 21 → 21 |
| 9 | ≈ 2026-11-21 17:18 +03:00 | `kimi doctor tui` (new `~/.kimi-code/tui.toml`, `follow_up_behavior = "steer"`) | 0 · OK |

## 4. Checks

Hygiene: probe of the Kimi hook form 9/9 as named · build guard 5zb red on `9263794` exactly 5 · hook selftest all ok · window mutants K1–K3
red on target · all three mutant probes of the hook on their addressees · `s14` green · `kimi doctor` config and tui OK.
Functional run: NONE yet — Kimi itself firing each hook (a trace line per event in a live session) is `plans/143` KA9, blocked by the
owner's 5-hour Kimi quota (429 at 16:24); the stand step next: a `kimi -p` run in a fresh git project once the window resets.

| Case | Status | Observation |
|---|---|---|
| Fragment has no matcher Kimi cannot compile | pass | probe B: 0 findings; guard 5zb on the old fragment: 5 refusals |
| A matcher for one tool does not catch others | pass | `new RegExp('^Agent$').test('AgentSwarm')` → false; `^(Write|Edit)$` vs `MultiEdit` → false |
| 85 % of Kimi's point on PostToolUse → one PreToolUse block | pass | selftest: block text names «it compacts at 891289 of 1048576 tokens», second call silent |
| After compaction a fresh 80 % is said on the next prompt | pass | selftest and `s14` |
| Kimi fires the hooks live | blocked | quota; KA9 |
| Full polygon `npm run test:core` (≈ 17:22–17:28) | pass after one repeat | 27 of 28 green; `s12` died `3221226505` (`bugs/109`, 15th, contour selftest, untouched) — the repeat alone 26/26 |
| After the later edits (KA4 · KA6): rebuild, `s14`, `s01`, pt6 · kimi-window · gate-close mutants, farewell selftest | pass | all green, every mutant on its addressees |
| Fresh install in a new git project — kimi-code · kimi-code+codex · claude-code | pass | `AGENTS.md`: Kimi-only — `/skill:resume` + the Never Ask line; with codex — the generic pointer + the line; claude — no Kimi line; fragment without «*»; finding: with codex Kimi reads a bare `/resume` (→ KA5) |
| KA4: `--alive` / `--measure` with KIMI_CODE_SESSION_ID on REAL sessions | pass | recorded session exit 0; unrecorded exit 1 with Kimi's action (/reload); --measure 447 025 tokens of Kimi's point; **found:** the window read as 1 000 000, not Kimi's 1 048 576 — the session's model was unknown to the hook (the measured record carries none), so it took the generic floor (corrected 2026-11-21 17:33 +03:00: an earlier line here blamed `contextWindow.tokens` of the origin, which is not set) → fixed: the model falls back to Kimi's `default_model` |
| KA6: a chat dead of the quota leaves a farewell | pass | `stop-farewell-capture.mjs --kimi` fed `StopFailure` over the two REAL failed sessions of the owner's machine (print `session_50533609…`, TUI `session_d78dc62c…`) in a temp project: both files name `APIProviderQuotaExhaustedError` and Kimi's message; selftest all ok |

## 5. Found

- `s14` at first held a mute command (`s14-refresh-hooks.mjs:1028`, my own edit) — the polygon preflight stopped; fixed, the guard green (618 commands).
- The pt6 mutant probe had to name the new Kimi cases as addressees (EXP-0169) — done.

## 6. Traces

`tools/sandbox/probes/bugs145-matcher-red.mjs` · `tools/sandbox/probes/kimi-window-mutants.mjs` · the owner's backup
`~/.kimi-code/config.toml.20261121-171626.bak` · session logs in the scratchpad (not kept).

## 7. Verdict

partial — every hygiene check green and the owner's config written and validated; the functional run in a live Kimi session is blocked by the
quota (KA9).
