# Test run report — Kimi context-window hook in KAIF payload

**Created:** 2026-11-21 15:33 +03:00 · **Run by:** Kimi · **Version/build:** KAIF 2.10 WIP working tree, Kimi Code CLI 2.7.2

## 1. Work

Fix `bugs/144`: the Kimi adapter waited for Stop and missed auto-compaction during a long turn.
Expected basis: context steps 75/80/85/92, official Kimi `loop_control`/`token_counting` docs, and the
owner's explicit request to fix the separate KAIF project too.

## 2. Contour

Canonical payload `framework/hooks/`, generated `dist/`, the real s14 deployment sandbox, and the
field's accumulated live Kimi wire. REAL WORLD: accumulated · owner's machine and current session ·
`Silent-Storm-Krinik-Retribution` live wire, verified with real state.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-21 15:22 +03:00 | `node framework/hooks/context-window.mjs --selftest` | all ok |
| 2 | ≈ 2026-11-21 15:25 +03:00 | `node tools/build-framework.mjs` | initially SyntaxError on known Kimi's blocker |
| 3 | ≈ 2026-11-21 15:27 +03:00 | same build after one apostrophe escape | full core + dist + check-framework OK |
| 4 | ≈ 2026-11-21 15:28 +03:00 | `npm run test:core` | preflight stopped on four old unasserted runKimi calls |
| 5 | ≈ 2026-11-21 15:30 +03:00 | `node tools/sandbox/s14-refresh-hooks.mjs` | entire s14 green, including Kimi events/config |
| 6 | 2026-11-21 15:33 +03:00 | mutant copy without wire reading | exit 1 · exactly both new Kimi cases red |
| 7 | 2026-11-21 15:33 +03:00 | `node tools/experience-lint.mjs` | 0 findings |

## 4. Checks

Hygiene: selftest all ok; build/check-framework green; experience lint 0; mutation red on both
addressed cases.
Functional run: the real s14 deployment and hook contract were walked; READ every Kimi line, including
Stop fallback, 85 % closure, PostCompact rearm and config coverage. The field hook read the current
live 127927 tokens and correctly stayed silent below the threshold.

| Case | Status | Observation |
|---|---|---|
| 85 % during PostToolUse | pass | soft closure emitted once |
| Compaction + fresh 80 % | pass | old records ignored; cut rearmed |
| Kimi config wiring | pass | UserPromptSubmit + PostToolUse present |
| Поправка 2026-11-21 16:53 +03:00 | — | «present» ≠ «Kimi запускает»: `PostToolUse` с `matcher = "*"` Kimi не запускает никогда (`bugs/145`); строки выше — прямой вызов скрипта |
| Canonical payload regenerated | pass | 194 blocks, 59 embedded files, fresh hashes |
| Full core suite | blocked | preflight s14 lines 994/1006/1010/1018; no tests ran |

## 5. Found

- none in the hook fix

Known pre-existing debt: the build's unescaped `Kimi's` was fixed as a one-character blocker. The full
suite's preflight debt is not claimed green and was not weakened to pass.

## 6. Traces

- `bugs/144_DONE_kimi_context_window_late_stop.md`
- `researches/48_kimi_code_adapter_recon.md` §5
- build, selftest, s14 and preflight outputs in this session transcript

## 7. Verdict

pass for the hook and its s14 deployment path; the unrelated full-suite preflight remains openly
blocked and is handed over in STATUS.
