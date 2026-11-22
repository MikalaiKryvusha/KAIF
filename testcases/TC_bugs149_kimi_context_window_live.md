# Test cases — bugs/149: Kimi context-window stages and soft close before compaction

**Created:** 2026-11-22 13:06 +03:00 · **Under test:** KAIF context-window hook in a real Kimi VS Code session · **Version/build:** KAIF 2.10, `82e8127`, build 863.
**Test basis:** `bugs/149` line 7 (live acceptance); `plans/136` criterion 38; owner decision №161 (75/80/85/92) and №164 D1 (Kimi's own compaction trigger unchanged).

## 1. Goal vector

**Maintain:** a new Kimi session with the user-level dispatcher receives KAIF's 75/80/85 orders and starts `/skill:end-chat-soft`
before Kimi applies compaction. A fixture, a direct hook invocation or a written config is not acceptance.

## 2. Requirements under test — the basis, made testable

| # | Requirement (EARS sentence) | Fit criterion (Scale · Meter · Target) |
|---|---|---|
| R1 | WHEN the current Kimi session starts with the dispatcher, the system shall record that session's own presence | session id · `--alive` output and state · exit 0 with the same id |
| R2 | WHEN used reaches 75 % of Kimi's compaction point, the system shall deliver a warning without a closing order | tokens · live wire + state · at least 668467, `said` contains 75 and the message says `A WARNING only` |
| R3 | WHEN used reaches 80 %, the system shall order a logical cut but not a soft closure | tokens · live wire + state · at least 713032, `said` contains 80, `logical cut` and `soft closure comes at 85 %` |
| R4 | WHEN used reaches 85 %, the system shall order `/skill:end-chat-soft` | tokens · live wire + state · at least 757596, `said` contains 85 and the exact soft-close order is delivered |
| R5 | WHEN the 85 % order has been delivered, the agent shall start the soft-close skill before compaction | event order · live wire · 85 delivery < `Skill(end-chat-soft)` < `context.apply_compaction` |

## 3. Coverage matrix — dimensions and holes

| Dimension | Values covered | Explicitly NOT covered (risk named) |
|---|---|---|
| session state | old unwired failed session · new wired session | a second simultaneous chat of the same system; fallback names this ambiguity |
| delivery channel | live UserPromptSubmit / PreToolUse / Stop as selected by Kimi | direct synthetic hook input; excluded because it is not live acceptance |
| window boundaries | 75 · 80 · 85 · actual compaction | 92 % may be unreachable below Kimi's own compaction point; not required by bugs/149 |
| closure behavior | normal pace at 75 · logical cut at 80 · actual skill call at 85 | forced closure unless 92 is actually delivered |
| evidence durability | state + wire + run report + commit | state after PostCompact can be re-armed; the wire is the historical source |

## 4. Cases

| # | Case (steps → expected) | Technique | Status + evidence |
|---|---|---|---|
| C1 smoke | start new VS Code session → `--alive` records its own id | state / smoke | pass — `session_6d66c1d4-2a8f-4f04-9eae-0d922a4428ea`, exit 0, `testcases/reports/2026-11-22_kimi-stop-alive.md` |
| C2 | write new `.mjs`, end turn → debt and a Stop continuation | transition | pass — 09:40 `origin: system_trigger / stop_hook`, file ran, debt cleared |
| C3 | real work fills window to 75 % → warning only, normal work continues | boundary | pass — 2026-11-22 13:11 +03:00, live PreToolUse block at 670984/891289, `said:[75]`, `A WARNING only`; voice `voice/2026-11-22_13-11-08_okno-75-procentov.txt`; work continued |
| C4 | real work fills window to 80 % → logical-cut order, current item lands green | boundary / transition | pass — live PreToolUse block at 717456/891289, `logical cut`, `soft closure comes at 85 %`, `said:[75,80]`; current item committed green as `94edfae`; no new heavy task |
| C5 | real work fills window to 85 % → soft-close order delivered | boundary / transition | pass — live PreToolUse block at 757784/891289, exact `/skill:end-chat-soft` order, `said:[75,80,85]`; hand `--measure` then returned 0 |
| C6 | after C5 call `/skill:end-chat-soft` → actual skill invocation precedes compaction | sequence / user path | pass — Skill(end-chat-soft) invoked immediately after C5; exact compaction record absent before and at the invocation checkpoint |
| C7 | inspect fresh global hook log for this session → no continuing old `node .kaif/hooks/…` errors | error guessing | pass — current session id has no error lines in `kimi-code.log`; exact `"type":"context.apply_compaction"` absent from its wire at this checkpoint |

## 5. Control cases — MUST

| # | Control → expected: the behaviour is absent | Status + evidence |
|---|---|---|
| K1 | old VS Code session retains broken project-relative wiring → no session record and compaction before closure | pass — `session_70b1e5d5…`, wire 891644 then `context.apply_compaction`, old hook commands exit 1 |
| K2 | hand `--measure` below a stage → no stage injection and no closure permission | pass — 2026-11-22 67 % returned exit 1, `too early to close`, `said` unchanged |

## 6. Verdict

[TESTED: 2026-11-22 · all C1–C7 and K1–K2 passed on the real Kimi VS Code path; testcases/reports/2026-11-22_bugs149-context-window-live.md]. The live 85 % delivery and the actual `/skill:end-chat-soft` invocation precede the first compaction record.
