# Bug 160 — automatic canon refresh resumes after a completed chat closure

**Status:** 🔧 SOURCE FIX VERIFIED — build and affected suites green; full core has unrelated baseline failures; judge pending
**Version/build:** KAIF 2.10 · **When/context:** 2026-11-26, KIMI KRINIK field session and issue #207
**Severity:** S2 — a closed session spent tokens and the owner's attention on another full canon pass
**Delivered upstream:** https://github.com/MikalaiKryvusha/KAIF/issues/207
**Fixing:** this session, by origin decision №178

**Goal vector:** **Maintain + Avoid.** A completed soft, forced or window-initiated closure must remain terminal for automatic context refresh in that session without disabling later work, new-session refresh or an explicitly ordered `/resume`.

**Fix accepted when:** entering a closing skill alone does not suppress refresh; writing the farewell records the session; stale-marker and pending SessionStart/PostCompact refreshes stay silent for every closed session; StopFailure preserves them; a new session refreshes normally; explicit `/resume` remains independent; the real KIMI KRINIK turn-41/turn-47 replay passes.

## Symptom

KIMI KRINIK completed turn 47 and printed its farewell. The next message opened turn 48 with `KAIF context refresh (timer: last refresh 101 min ago, interval 60 min)`, so the agent read all nine core documents and repeated the full creed/prayer after the chat had closed.

## Root cause

`prompt-refresh-timer.mjs` checked only marker age, and `session-start-refresh.mjs` independently delivered pending refresh. Neither knew the terminal lifecycle state. `stop-farewell-capture.mjs` observed closure but retained no session identity usable by those hooks.

The real wire added two boundaries: the closing Skill occurred in turn 41 while its farewell was written in turn 47 after later owner messages, and current Kimi records final text as `context.append_loop_event` → `content.part`, not only `agent.message.appended`.

## Fix

1. `stop-farewell-capture.mjs` preserves `closedSessionIds` in its existing ignored memory and adds a session only after an actual farewell write, not after merely entering a closing skill. StopFailure preserves the list. Both `agent.message.appended` and current context-loop text records are read.
2. `prompt-refresh-timer.mjs` exits silently for a listed session before evaluating marker age.
3. `session-start-refresh.mjs` applies the same boundary to SessionStart, PostCompact and their pending prompt. The explicit-resume hook is deliberately unchanged.
4. Both canon layers and decision №178 record the owner's contract.

## Evidence

- Red before the fix: the new origin selftest failed six cases, including real context-loop text, closed-session persistence and both automatic refresh paths.
- Green after the fix: `node framework/hooks/stop-farewell-capture.mjs --selftest` passed all 20 checks, including both generic automatic refresh branches.
- Real-state replay: the owner's actual turn 41 did not close the contour; turn 47 farewell closed it; the real farewell survived; both refresh paths were silent for that session; a new session received the timer order.
- Framework build and dist guards pass; the complete affected `s14` suite passes on the final dist; `pt5-farewell` passes 16/16; KIMI KRINIK `pnpm lint` passes.
- Full `npm run test:core`: 25/28 suites pass. `s14` initially inherited the live session id and passed completely after it was removed. `s01` (negative fixture in unchanged code) and `s22` (native `3221226505`, `bugs/109`) are unrelated baseline failures and were not altered to force green. Hooks-mutants passes 33/34; only `W9` includes that same baseline fixture and its intended `SW2` assertion. Adversarial judge is pending.

## Decisions made without the owner

- The formal completion boundary is the farewell write rather than the closing Skill call, because the real session contained later owner turns between them.
- Existing farewell-capture memory carries the per-session list instead of a second state contour.
- Explicit `/resume` and `/refresh-context` remain direct owner orders; only automatic refresh is suppressed.

## Links

- Issue #207 · origin decision №178 · KIMI KRINIK `bugs/KAIF/06_refresh_after_chat_closure.md`
- `testcases/reports/2026-11-26_refresh_after_closure.md`
- `bugs/150` and EXP-0222 cover the distinct unfinished-closure latch; this bug starts only after a completed farewell.

kaif-fp: framework/hooks/prompt-refresh-timer.mjs#closure-state :: refresh-after-chat-closed :: v2.10
