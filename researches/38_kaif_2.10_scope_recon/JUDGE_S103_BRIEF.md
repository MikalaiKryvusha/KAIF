# Subagent brief — judge the claims of session 103 (bugs/141 · bugs/142 · step PT6б №161 · bugs/143) and the closing debt of session 102

## 1. Task context

The repository `d:\work\ai_sandbox\KAIF` is the source of the KAIF framework (read `CLAUDE.md`, then `AGENT_GUIDE.md` → "Task execution
discipline" and `TESTING_FRAMEWORK.md` → "What the word "test" means"). Session 103 claims four pieces of work, each with a run report:

- **bugs/141** (origin issue #199): the contour named a decision record and a page lock by the document's BARE file name, so two documents
  `a/compare.webp` · `b/compare.webp` shared one record. Fix: `framework/tools/contour/core.mjs` → `docKeyOf` · `pathTag` · `holderOf` ·
  `ownedStem` · `decisionPaths` · `recordDecision` (refusal) · `readDecision`; `framework/tools/contour/review.mjs` → `pageKey`, the recovery
  key. Report `testcases/reports/2026-11-18_bugs141-142-decision-name-and-alive.md`, bug doc `bugs/141_*.md`, commit `76801dd`.
- **bugs/142**: `node framework/hooks/context-window.mjs --alive` said «NOT running» in a session's first tool call. Fix: the hook records the
  session's presence from the first prompt. Same report, `bugs/142_*.md`, commit `76801dd`.
- **PT6б / decision №161**: the context-window hook now speaks four steps 75 · 80 · 85 · 92 (`levelsOf`, `decide`, `LINES`). The owner's
  words are in `MASTER_PLAN.md` §7 row 161 (Q1). Report `testcases/reports/2026-11-18_pt6b-window-steps-161.md`, plan `plans/142` step PT6б,
  criterion 35 of `plans/136`.
- **bugs/143** (origin #197 pp. 1 and 3): `framework/hooks/clock-now.mjs` — ASCII `[NOW]` named to the agent, code spans of markdown keep a
  placeholder, exact characters in the prompt line. Report `testcases/reports/2026-11-18_bugs143-clock-placeholder.md`, `bugs/143_*.md`.
- **bugs/139** (+ `ideas/32` p. 14): five instruction slots of the payload rewrapped into the core's form (a slot opens on a line starting
  with «`<» and closes on a line ENDING in «>`» — `instructionSlotLines()` of `framework/installer/KAIF-CORE.mjs`), guard 5za in
  `tools/check-framework.mjs`, the form in `tools/lib/slot-form.mjs`; probes `tools/sandbox/probes/bugs139-slot-red.mjs` ·
  `bugs139-slot-form.mjs`; the real world — `ub5-field-filled-slot.mjs` on field clones. Same report as bugs/143.
- **EXP-0214**: `tools/sandbox/probes/mutants-of.mjs <file>` — runs every mutant probe naming the file; red claimed on a worktree of `76801dd`.
- **Closing debt of session 102** (`STATUS.md` → п. 0, session 102): the polygon after `bugs/140` — claimed green in the session 103
  report above (run 1).
- Commits to diff: `76801dd` (bugs/141 · 142), `6fa213d` (PT6б), and the commit after it (bugs/143 · 139 · EXP-0214) — `git log -3`.

Probes worth running (all quiet — no window, no sound): `tools/sandbox/probes/bugs141-two-mockups-live.mjs` (± `--rev 005ab17`),
`bugs141-mutants.mjs`, `bugs141-real-records.mjs <roots>`, `bugs142-first-prompt-alive.mjs` (± `--rev 005ab17`), `gate-close-mutant.mjs`,
`pt6-context-window-mutant.mjs`, `pt6-context-window.mjs <transcript> --close N`, `pt1-clock-now.mjs` (± a hook from `git show 76801dd:…`),
and each hook's `--selftest`.

## 2. Bounds

Read-only on the repository: you may run the probes, selftests and `git` read commands; you may write ONLY your report file
`researches/38_kaif_2.10_scope_recon/judge-s103.md`. No commit, no push, no issue comment, no subagents of your own. No windows, no sound: never
run `node tools/review.mjs` without `--no-serve`/`--check`, never `--call`, never `tools/say.mjs`, never `npm run test:core` (the main agent
runs the polygon alone) and never `node tools/verify-contour.mjs --visible`. Probes that take a list of project roots: the sibling folders of
`d:\work\ai_sandbox\` that hold `interviews/decisions/` — read-only by construction; print no project names in your report (numbers only).
Run at most ≈ 40 minutes.

## 3. Role

Judge (`/fable-judge`): every «done» above is a set of claims; re-run the claimed verifications, diff what changed (`git show 76801dd`, the
working tree for PT6б and bugs/143), hunt weakened tests, false completion claims, claims wider than their observation, a fork decided
without recon, a missing real-world line, a guard not proved red on the named broken version. The default verdict on doubt is REFUTED. A
judge never fixes: name the finding with the command and its output, do not edit code.

## 4. Report

`researches/38_kaif_2.10_scope_recon/judge-s103.md`: first line — one canon line that bears on the task, quoted; then a table — claim ·
verdict (VERIFIED · VERIFIED WITH CAVEATS · REFUTED) · evidence (the command and its output verbatim, or the file:line it quotes); then
numbered findings, each with a failure scenario (concrete input → wrong output) and a proposed fix in one line; then «Not checked» — what
you could not run and why. ≤ 200 lines.

## 5. The main agent's duty after

- Subagents alive now — before this launch: 0; after it: 1; the project owner's budget: 2 (`HOUSE_RULES.md` §7 п. 1).
- The report is a FINDING until verified: the main agent re-runs each REFUTED claim before any fix, and never relays a verdict to the owner
  as its own observation.
