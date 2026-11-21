# Test run report — Kimi hooks through one user-level dispatcher; why `kimi -p` drops the Stop continuation (plans/143 KA2 · KA9)

**Created:** 2026-11-21 18:47 +03:00 · **Run by:** Claude Opus 5.5 (session 105) · **Version/build:** KAIF 2.10 WIP on `181a2a3` + the working tree of
KA2; Kimi Code CLI 2.7.2.

## 1. Work

(a) The Stop path under Kimi: why a blocking `Stop` hook opened no continuation turn in `kimi -p` (KA9 run 3), read in the installed bundle
`dist/main.mjs` of Kimi Code 2.7.2. (b) KA2: one user-level dispatcher instead of 22 project-relative commands in the owner's
`~/.kimi-code/config.toml` — `framework/hooks/kimi-hook.mjs`, `wire-hooks --kimi` in the installer, the install/update task item
`wire-kimi-hooks` with an executing gate. Basis: `plans/143` rev. 2 acceptance criterion 3 («hooks are silent outside KAIF projects and
work from a subfolder») and the KA2 step; `researches/50` §6 · §14; the owner's word in chat 2026-11-21 18:41 +03:00 «остались тесты и
запись в ваш конфиг, примерно полчаса.» · «вот это доделыва» (a quote of the agent's estimate, then the order).

## 2. Contour

The payload `framework/hooks/` (dispatcher, fragment, `context-window.mjs` → `kimiWiring`), `framework/installer/KAIF-CORE.mjs`
(`wire-hooks --kimi`, task item, checkpoint gate), `framework/adapters/kimi-code.md`, the polygon runner; a fresh git project installed from
the built `dist` (`--agents kimi-code --lang ru`); a sandbox Kimi home holding a byte copy of the owner's real `config.toml`; then the
owner's real `~/.kimi-code/config.toml`. REAL WORLD: accumulated — the owner's config of 204 lines with 22 KAIF entries of a hand merge
(project-relative commands, a KAIF comment block above them) and five earlier backups · his data and machine — his own config, rewritten
with a backup after the same run on its byte copy · path — Kimi reads `config.toml` at session start; checked by `kimi doctor config` and by
running the wired commands through the shell as Kimi runs them (session folder, JSON on stdin) — not yet by a live Kimi session.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | ≈ 2026-11-21 18:20–18:24 +03:00 | node scripts printing `agentExternalHooksService` (`notifyTurnEnded` · `runStop`), `loopService` (`notify` · `sendNotification`), `loop-actor` (`notify` · `releaseIntake` · `schedule`), `src/cli/v2/run-v2-print.ts` (`runNativeTurn` · `cleanup` · `quiesceSessionAgents`) out of `%APPDATA%/npm/node_modules/@moonshot-ai/kimi-code/dist/main.mjs` | read: Stop is queued after `TurnEnded`; `notify` in an idle live loop schedules a turn; print mode awaits only `turn.result`, then cancels the loop |
| 2 | ≈ 2026-11-21 18:33 +03:00 | `node framework/hooks/kimi-hook.mjs --selftest` | 0 · 8/8 |
| 3 | ≈ 2026-11-21 18:34 +03:00 | `node tools/sandbox/probes/kimi-hook-mutants.mjs` | 0 · control 0 red; D1 2 · D2 1 · D3 1 · D4 1 · D5 3 — each on exactly its cases |
| 4 | ≈ 2026-11-21 18:38 +03:00 | `node framework/hooks/context-window.mjs --selftest` | 0 · all ok (new case «Kimi wiring (KA2)») |
| 5 | ≈ 2026-11-21 18:39 +03:00 | `node tools/build-framework.mjs` | 1 · guard 5o ×2 + invisible U+FEFF ×2 in `kimi-hook.mjs` (EXP-0195 class) → fixed by a script (`stripBom`), rebuilt 0 |
| 6 | ≈ 2026-11-21 18:42 +03:00 | fresh git project: `node KAIF-CORE.mjs install --bundle dist/KAIF-CORE-BUNDLE.md --agents kimi-code --lang ru`; `KIMI_CODE_HOME=<sandbox with the owner's config copy> node KAIF-CORE.mjs wire-hooks --kimi` ×2 | 0 · 22 entries of the hand merge replaced by 22 through the dispatcher, lines 1–86 byte-equal, `kimi doctor config` OK, one backup; the repeat «already wired — untouched» |
| 7 | ≈ 2026-11-21 18:44 +03:00 | `KIMI_CODE_HOME=<sandbox> node tools/sandbox/s14-refresh-hooks.mjs` | 0 · ten new «s14 KA2» cases green, the suite green |
| 8 | ≈ 2026-11-21 18:45 +03:00 | `git show 181a2a3:dist/KAIF-CORE.mjs` → `wire-hooks --kimi` on a copy of the old config | 1 · «unknown flag for wire-hooks: --kimi», the config untouched (22 old entries) — the red of the step |
| 9 | 2026-11-21 18:46 +03:00 | the same fresh project, the owner's real home: `node KAIF-CORE.mjs wire-hooks --kimi`; `kimi doctor config` | 0 · backup `config.toml.20261121-184618.bak`; 22 → 22 through `C:\Users\…\.kimi-code\kaif\kimi-hook.mjs`; lines 1–86 byte-equal; OK |
| 10 | ≈ 2026-11-21 18:47 +03:00 | the owner's REAL wired commands (`prompt-resume-word`, `clock-now`) run through the shell with a `UserPromptSubmit` input from the origin root, from `tools/sandbox`, from a folder without KAIF | 0 · root and subfolder answer (`/skill:resume`, the time); outside KAIF — 0 chars |
| 11 | ≈ 2026-11-21 18:45 → 18:57 +03:00 | `npm run test:core` (alone; the runner points `KIMI_CODE_HOME` at a missing folder) | 0 · «sandbox suite: all 28 suites green» — `s04` S13 full install → `verify-final` green with no Kimi item |
| 12 | ≈ 2026-11-21 18:55 +03:00 | two fresh default installs (all agent systems): `KIMI_CODE_HOME=<missing>` vs the real home | 0 · 0 vs 2 lines `wire-kimi-hooks` in the task — the item appears only where Kimi Code is set up |
| 13 | ≈ 2026-11-21 18:51 → 19:09 +03:00 | an independent judge subagent (`/fable-judge`, read-only, sandbox Kimi homes) over C1–C7 | C2 · C4 · C7 VERIFIED; C6 · bugs/138 with caveats; **REFUTED:** C1 (print-mode wording wider than the code), C3 «keeps the owner's lines» (A: an owner's commented-out entry above a KAIF one deleted, unseen by the proof; H: `[[hooks]] # …` not recognised — a duplicate left), bugs/142 DONE (its `--alive` was the 2nd tool call, not the 1st) |
| 14 | ≈ 2026-11-21 19:11 → 19:13 +03:00 | after the fixes: `node tools/build-framework.mjs`; `KIMI_CODE_HOME=<missing> node tools/sandbox/s14-refresh-hooks.mjs`; the fixed core on the owner's real config | 0 · `s14` green with two new cases «(судья, A)» · «(судья, H)» (red on the judge's runs against the 18:47 tree); the real config «already wired — untouched», sha and backup count unchanged |
| 15 | ≈ 2026-11-21 19:14 → 19:25 +03:00 | `npm run test:core` again (the installer changed after run 11) | 0 · «sandbox suite: all 28 suites green» |

## 4. Checks

Hygiene: dispatcher selftest 8/8 · five dispatcher mutants red on exactly their cases · window hook selftest all ok · build green after
the guard's catch · `s14` green with ten new KA2 cases · the previous core refuses `--kimi` (red of the step).
Functional run: the installer on a fresh project and on a byte copy of the owner's real config, then on the real config; the owner's real
wired commands executed the way Kimi executes them — READ: from the origin root and from a subfolder the project's hooks answer, outside
KAIF silence. Kimi itself firing the dispatcher in a live session — NOT observed (the owner hands the chat to Kimi for exactly that).

| Case | Status | Observation |
|---|---|---|
| smoke: the owner's wired command from a KAIF project subfolder runs the project's hook | pass | run 10: `tools/sandbox` → `/skill:resume`, the clock line |
| outside a KAIF project the wired commands are silent | pass | run 10 and `s14 KA2` — exit 0, no output |
| hand merge replaced, the owner's own lines in place and order | pass | runs 6 · 9: lines 1–86 byte-equal; `s14 KA2` — the owner's own `[[hooks]]` entry and a table after the KAIF block kept |
| a repeat run changes nothing, writes no backup | pass | run 6, `s14 KA2` |
| `"hooks": "off"` — the config untouched; no Kimi config — nothing created | pass | `s14 KA2` |
| invalid config never swapped in | pass in part | `kimi doctor config <candidate>` runs before the swap (OK on both real runs); a refusal path not exercised live |
| Stop continuation in a live Kimi session | not run | by the code it opens (run 1); live — the next Kimi session |
| Full polygon | pass | run 11: 28 of 28; after the judge's fixes run 15: 28 of 28 |
| an owner's commented-out entry above a KAIF one stays; `[[hooks]] # …` recognised | pass | run 14: `s14` «(судья, A)» · «(судья, H)»; red — the judge's runs against the 18:47 tree |
| The install task names the Kimi item only where Kimi is set up | pass | run 12 |

## 5. Found

- `kimi -p` drops a Stop continuation unless other work is pending (a turn, a goal, a cron fire, a background task —
  `applyPrintBackgroundPolicy`): then `cleanup` cancels the loop while the asynchronous Stop hook still runs; a turn ending with a queued
  request runs no Stop at all (`hasPendingRequests`) — recorded in `researches/50` §3 · §14 and the adapter (narrowed by the judge: the
  first wording said «awaits only its own turn»).
- My own write: `\uFEFF` typed into a Write parameter landed as two real U+FEFF characters in `kimi-hook.mjs`; the build's guards (5o and
  the invisible-character guard) caught it — known class EXP-0195, mechanized; fixed by a script with code points only.
- The judge (run 13): `wire-hooks --kimi` deleted ANY comment run above a KAIF entry and its proof skipped comments → now only a comment KAIF
  wrote (names KAIF or is a fragment line) goes, and the proof compares the owner's comments too; `[[hooks]] # …` is recognised; the dispatcher
  is copied only after `kimi doctor` passes; a line changed by hand inside a KAIF entry is not carried over (the log names the backup) and a
  mixed-line-ending config is written with one — named limits (`plans/143` decisions 4–7). My closure of `bugs/142` was false (the `--alive` of
  this chat was its 2nd tool call) — reopened, corrected in the bug, STATUS and the chronicle.
- The origin kept an untracked copy `.kaif/hooks/` for Kimi made by session 104; it was stale by three files after this session's edits —
  removed (the dispatcher runs the origin's `framework/hooks/` sources).

## 6. Traces

`framework/hooks/kimi-hook.mjs` (selftest) · `tools/sandbox/probes/kimi-hook-mutants.mjs` · `tools/sandbox/s14-refresh-hooks.mjs` «KA2» ·
the owner's backup `~/.kimi-code/config.toml.20261121-184618.bak` · the dispatcher `~/.kimi-code/kaif/kimi-hook.mjs` · the sandbox run in the
session scratchpad (`ka2/`, not kept).

## 7. Verdict

partial — every hygiene check green and the functional run on the owner's real config read; Kimi itself firing the dispatcher in a live
session is the next Kimi session's first check (`plans/143` KA9).
