# Test run report — KA9 live evidence for the five former silent Kimi hooks

**Created:** 2026-11-22 10:54 +03:00 · **Run by:** Kimi K3.1 Pro · **Version/build:** KAIF 2.10 WIP, `483612c` + current docs/probes.

## 1. Work

Close the live half of `bugs/145`: `PostToolUse` ×3, `PostToolUseFailure` and `PermissionRequest` must be fired by Kimi itself,
not by directly invoking hook scripts. Basis: `bugs/145` lines 13–16 and `plans/143` KA9. The Stop/alive evidence is in
`testcases/reports/2026-11-22_kimi-stop-alive.md`; `bugs/149` is outside this verdict.

## 2. Contour

REAL WORLD: accumulated — the owner's real global Kimi dispatcher and hook config, existing KAIF state and session store · data and machine —
the actual VS Code session plus fresh temporary projects installed from the built `dist` · path — real tool results, failed Reads and an ACP
`session/set_mode=plan` → `session/prompt` → `session/request_permission` chain with an automatic approval. No global config was edited.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-22 09:39–09:52 +03:00 | Write then run `tools/sandbox/probes/bugs149-live-stop.mjs`; read `.kaif/test-debt.json` and `.kaif/knowledge-moment.json` | test-after-code and context-window wrote live state; knowledge-moment emitted its lines; Stop continuation confirmed |
| 2 | 2026-11-22 09:49–10:15 +03:00 | failed `Read` and `Grep` calls; read `.kaif/knowledge-moment.json` and the prompt hook results | `PostToolUseFailure` produced `KAIF knowledge: a tool call failed` in the real prompt stream and pending state |
| 3 | 2026-11-22 10:50 +03:00 | `node tools/sandbox/probes/ka9-acp-permission.mjs` (wire predicate initially expected two names not used by this Kimi build) | failed after approval: measurement mismatch, not a product defect; the actual wire contains `interaction.request` + `permission.record_approval_result` |
| 4 | 2026-11-22 10:53 +03:00 | corrected predicate and reran `node tools/sandbox/probes/ka9-acp-permission.mjs` | 0 · PASS, `session_476e0bc5-1f26-4829-ab2a-3dc16c017938`, one approval, voice file `2026-11-22_10-53-41_permission-request.txt` |

## 4. Checks

Hygiene: the ACP probe reruns the real driver and checks the session wire plus the voice file; matcher guard evidence is `bugs145-matcher-red`.
Functional run: real Kimi tool events and an ACP approval were walked; the prompt injections, session wire and voice artifact were READ.

| Case | Status | Observation |
|---|---|---|
| PostToolUse: context-window | pass | current session id and fresh `seen` in `.kaif/context-window.json` |
| PostToolUse: knowledge-moment | pass | real knowledge reminders and pending lines in `.kaif/knowledge-moment.json` |
| PostToolUse: test-after-code | pass | live `.mjs` debt and later `test debt: none` |
| PostToolUseFailure: knowledge-moment | pass | exact failure reminders in the real prompt stream and pending state |
| PermissionRequest: voice hook | pass | ACP `interaction.request` + `permission.record_approval_result`, automatic selected approval, and the voice file |

## 5. Found

- none after the probe predicate was aligned with the actual Kimi 2.7.2 wire names (`interaction.request` and `permission.record_approval_result`).

## 6. Traces

- `tools/sandbox/probes/ka9-acp-permission.mjs`
- `C:/Users/krinik/.kimi-code/sessions/wd_kaif-sbx-ka9-acp-permission-7q4aq0_15d5c9e70c9d/session_476e0bc5-1f26-4829-ab2a-3dc16c017938/agents/main/wire.jsonl`
- `F:/Temp/kaif-sbx-ka9-acp-permission-V5FD28/voice/2026-11-22_10-51-21_permission-request.txt` (first approved run, measurement-only failure)
- `testcases/reports/2026-11-22_kimi-stop-alive.md`

## 7. Verdict

pass — all five hooks named by `bugs/145` have live evidence from Kimi itself; no claim is made about the separate context-window blocker `bugs/149`.
