REFUTED

# Independent judge — Kimi session, 2026-11-21

Two load-bearing boundaries fail outside the supplied happy-path fixtures: the map checkpoint rejects genuinely filled maps, and the no-id alive fallback can still return another agent system's session as alive. The other targeted claims reproduced. Positive live Kimi hook acceptance remains deliberately pending and is not counted as passed.

## Claims and observations

| # | Claim | Actual observation |
|---|---|---|
| 1 | bugs/147 selects the newer Kimi session instead of an older Claude session | **Reproduced only for that ordering.** Current probe: exit 0; `--rev 3b78552`: expected exit 1 with the old false green. Real VS Code `--alive`: exit 1 naming `session_70b1e5d5-8d8d-444a-935a-f760d2e67130`. Real `--measure` read that session's Kimi wire and returned 0 at 98% (880799/891289). A newer-Claude edge still returns Claude's alive record: finding 2 below. Positive live verification remains pending. |
| 2 | KA5: 37 full folded `whenToUse` fields, install/sync, no-git boundary, live skill + reference | **Verified.** Direct inventory found 37 skills and zero description/`whenToUse` mismatches. Fresh install and sync cases passed in the independent full polygon. This judge live-called `Skill(fable-method, args="report")`, received resolved reference paths, and read `.kimi-code/skills/fable-method/references/failure-modes.md`. |
| 3 | KA8 / criterion 40: maps, voice, and sync fixed | **Refuted for maps; verified for voice and sync.** `ka8-install-findings.mjs` and all three `--broken` controls returned 0 as designed. However, the filled real origin maps are refused by the new gate: finding 1. Russian voice lint and the sync-remedy checks passed. |
| 4 | `_template.md` is a generic live-evidence contract, not a claim that all Kimi mechanisms are live | **Document claim verified; implementation does not yet satisfy it.** The template leaves unobserved mechanisms pending. Its session-identity rule at `framework/adapters/_template.md:88-92` is contradicted by finding 2. |
| 5 | bugs/148 routes origin `say` and `review --call` through `contour.voiceFileTool` | **Verified without sound in this judge.** Both fixture paths and the broken control passed; voice-soft selftest passed 13/13. The parent's real wire records the fixed `tools/say.mjs` call and its `soft voice: F:\Temp\soft-voice-7fhnkxvu\soft.wav` output. No audible playback was claimed or tested by this judge. |
| 6 | Full polygon, contour, and static guards green | **Polygon and static guards independently green.** `npm run test:core`: exit 0, all 28 suites. `node tools/check-framework.mjs`: OK, 195 bundles / 846 modules. All prescribed static guards named in the brief passed, including source-wrapper experience lint (0 findings) and testrun lint (158 reports, 0 findings). Supplied contour log ends 247 green / 0 red; it was not rerun because the brief forbids anything that could open a page. |
| 7 | STATUS handoff accurate; release unpublished; specified bugs open | **Not accurate while criterion 40 is marked closed.** `gh release view v2.10` returned `release not found`; bugs 142, 145, 146, 147, and 148 all remain open by filename. Pending live Stop/alive items are stated honestly. |

## Findings

### 1. Map checkpoint has confirmed false positives on filled maps

`framework/installer/KAIF-CORE.mjs:4599-4606` searches every line for broad angle-bracket patterns such as `<name>`, `<path>`, and `<file>`. These are also legitimate generic notation in completed architecture maps.

The probe cannot see this defect: `tools/sandbox/probes/ka8-install-findings.mjs:53-58` “fills” a map by replacing **every** angle-bracket token with `filled from the project`. It proves only that the regex and its replacement are complementary.

Independent functional check: fresh install from the current dist, then copy in the origin's real filled `PROJECT_STRUCTURE_EXTERNAL_MAP.md` and `PROJECT_ARCHITECTURE_INTERNAL_MAP.md`, then run `checkpoint maps`. Actual output:

```text
✖ checkpoint maps REFUSED: template slots remain at PROJECT_STRUCTURE_EXTERNAL_MAP.md:39 · PROJECT_STRUCTURE_EXTERNAL_MAP.md:40 · PROJECT_STRUCTURE_EXTERNAL_MAP.md:97 · PROJECT_STRUCTURE_EXTERNAL_MAP.md:166 · PROJECT_STRUCTURE_EXTERNAL_MAP.md:167 · PROJECT_ARCHITECTURE_INTERNAL_MAP.md:27 — fill both maps from the real project first
filled-origin-maps exit=1
```

Examples falsely rejected include `framework/skills/<name>/SKILL.md` and command notation such as `framework/<DOC>.md`. Therefore `plans/136_EPIC_kaif_2.10.md:326`, `plans/143_epic136_KI_kimi_code.md:94-97`, and the criterion-40 completion lines in `STATUS.md:45` are wider than the observation.

### 2. Newer-Claude ordering still produces a cross-agent false alive

`framework/hooks/context-window.mjs:177-184` returns a Kimi id only when its wire is at least as new as Claude's transcript. Otherwise `handKimiId` becomes empty and execution falls through to the Claude `--alive` branch at lines 518-531.

A synthetic same-project fixture with an older, unrecorded Kimi wire and a newer, recorded Claude transcript produced:

```text
KAIF hooks: running in this session (claude_new) — the context-window hook recorded it at 2026-11-21T17:00:00Z. (session by the newest transcript of the project)
newer-Claude edge exit=0
```

This contradicts the generic contract at `framework/adapters/_template.md:90` (“Never let a record from another agent system … count as the current session”) and the broad Avoid statement at `bugs/147_kimi_alive_reads_claude_session.md:12`. The supplied fixture covers only Kimi-newer ordering. The heuristic and simultaneous-chat ambiguity are documented, but documentation does not make this false positive satisfy the contract.

### 3. Minor standing stale status in bugs/148

`bugs/148_origin_voice_bypasses_glass.md:3` still says full contour acceptance is in progress, and line 40 still places full contour and the repeated polygon in the future. The supplied final logs and this judge's polygon run both completed green. Correct those lines when the parent applies the required fixes; this is documentation debt, not a voice-route failure.

## Verification trail

- `node tools/sandbox/probes/bugs147-kimi-alive-fallback.mjs` — PASS.
- `node tools/sandbox/probes/bugs147-kimi-alive-fallback.mjs --rev 3b78552` — expected exit 1; defect reproduced.
- `node tools/sandbox/probes/ka8-install-findings.mjs` and `--broken maps|voice|sync` — all harness controls passed.
- `node tools/sandbox/probes/bugs148-glass-route.mjs` and `--broken` — passed without sound.
- `node framework/hooks/context-window.mjs --selftest` — all ok.
- `node framework/tools/contour/voice-soft.mjs --selftest` — 13/13.
- `npm run test:core` — independent exit 0, all 28 suites green; judge log: `C:/Users/krinik/.kimi-code/sessions/wd_kaif_75e6656bac87/session_70b1e5d5-8d8d-444a-935a-f760d2e67130/agents/agent-0/tasks/bash-av9zrgoy/output.log`.
- Static guards rerun green: doc-header, questions, counters, lang-packs, showcase, attribution, private-names, budget, experience (via `node tools/experience-lint.mjs`), and testrun.
- Generated/mirror diffs are explained by source edits; `check-framework` confirms fresh generated pins and module map. No unauthorized outward write, commit, push, code edit, page, or sound was performed by this judge. Temporary fixtures were removed.

## Smallest recommended action

Do not close or commit this batch as judge-passed. The parent must first re-run both failing reproductions. Then:

1. Reopen criterion 40 / KA8 and correct the 16/40 counters and STATUS completion line. Add the real filled maps as a regression fixture and narrow the gate to actual shipped template-slot constructs rather than every generic angle-bracket token.
2. Add the newer-Claude fixture to bugs/147. Without a session id, do not issue alive=0 from the other agent system; report ambiguous identity / nothing to judge instead, or obtain a real system-specific identity.
3. Update the stale bugs/148 lines, rerun the targeted controls and full polygon after fixes, and keep positive live alive/Stop pending a new or reloaded Kimi session.
