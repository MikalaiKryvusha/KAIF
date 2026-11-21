# Test run report — final polygon and static gates after the Kimi-session judge

**Created:** 2026-11-21 22:20 +03:00 · **Run by:** Kimi K3.1 Pro · **Version/build:** KAIF 2.10 WIP, `3b78552` + this session's complete working tree.

## 1. Work

Re-verify the two independent-judge refutations and the final boundary fixes: real filled maps must pass while all shipped template slots,
including multiline guidance, remain refused; no-id Kimi/Claude fallbacks must never borrow the other system's evidence, while an explicit
Claude session id remains valid. The final full polygon follows the correction of older map-fill fixtures that left multiline template text.

## 2. Contour

Built `dist`, fresh temporary installs, synthetic two-system session stores, the origin's real filled maps, and the complete core sandbox.
REAL WORLD: accumulated — the origin's actual maps and current Kimi session store · data and technique — real files and session ids · path —
the same hand commands and executing `checkpoint maps`. Positive live Kimi hooks and `bugs/149` remain outside this polygon's evidence.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | ≈ 2026-11-21 21:47–21:58 +03:00 | `npm run test:core` after the first two judge fixes | 0 · all 28 suites green |
| 2 | ≈ 2026-11-21 22:01–22:12 +03:00 | `npm run test:core` after adding multiline-map and explicit-id boundaries | 1 · 25/28 green; s01/s04/s07 exposed fixtures that left multiline template guidance |
| 3 | ≈ 2026-11-21 22:13–22:15 +03:00 | corrected fixtures; s01, s04 and s07 separately with an isolated Kimi home | 0 · all three green, without weakening the map gate |
| 4 | ≈ 2026-11-21 22:15–22:28 +03:00 | `npm run test:core` on the corrected map-fixture tree | 0 · all 28 suites green |
| 6 | ≈ 2026-11-21 22:34–22:46 +03:00 | final `npm run test:core` after explicit Claude id gained priority over every fallback | 0 · all 28 suites green; final log read to `sandbox suite: all 28 suites green` |
| 5 | ≈ 2026-11-21 22:32 +03:00 | focused re-judge; explicit older Claude added to the bugs/147 probe; current probe, `3b78552` control, selftest, mutants and build | original findings verified; one adjacent explicit-older-Claude case refuted and fixed. Final probe green; pre-fix control red as designed; hygiene green |

## 4. Checks

Hygiene: targeted bugs/147 and KA8 probes, their named pre-fix controls, context-window selftest and all three mutant groups are green.
Functional run: actual `checkpoint maps` executions accepted the origin's real maps and rejected untouched/partially filled maps; hand
`--alive`/`--measure` processes returned the asserted codes and named the selected records. Full functional Kimi hook acceptance is pending
a new/reloaded session and is not claimed here.

| Case | Status | Observation |
|---|---|---|
| complete polygons on the final code paths | pass | 28/28 suites after map-fixture correction, then 28/28 after the explicit-id priority fix |
| multiline guard regression hunt | pass | three incomplete fixtures found, corrected and separately green |
| independent re-judge | pass with live caveats | final focused verdict VERIFIED WITH CAVEATS; no remaining code finding, only prescribed new-session live acceptance |

## 5. Found

- The first judge's real-map and newer-Claude findings were fixed.
- Self-review added explicit-Claude, Kimi-only and multiline-template boundaries.
- The stricter multiline guard exposed three old fill fixtures; their content was corrected, and all three suites passed separately.
- The next judge caught the explicit-older-Claude route; the final probe and focused re-judge confirm explicit ids win in both freshness orders.
- `bugs/149` remains open: automatic compaction occurred before soft closure in the current old-wiring process.

## 6. Traces

- `tools/sandbox/probes/bugs147-kimi-alive-fallback.mjs`
- `tools/sandbox/probes/ka8-install-findings.mjs`
- `testcases/reports/2026-11-21_bugs147-kimi-alive-fallback.md`
- `testcases/reports/2026-11-21_ka5-ka8-kimi-skills-and-install.md`
- `reports/KAIF_AUDIT/2026-11-21_kimi_session_rejudge.md`
- the four background completion logs of this session's full `npm run test:core` processes; final log `agents/main/tasks/bash-36qr87ol/output.log`

## 7. Verdict

pass with live caveats — the final complete polygon and all static guards are green; the independent judge found no remaining code defect. New/reloaded-session alive, Stop and bugs/149 acceptance remain pending and are not claimed.
