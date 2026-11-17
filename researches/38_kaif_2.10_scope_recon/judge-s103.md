# Judge of session 103 — bugs/141 · bugs/142 · PT6б (№161) · bugs/143 · bugs/139 · EXP-0214 · the closing debt of session 102

> «**Гигиена — не тест.** Линтер, юнит-тесты, селфтесты, мутационные доказательства, стражи — обязательны … они доказывают, что проверка
> умеет падать, а не что вещь работает у человека.» — `TESTING_FRAMEWORK.md:39`

Judge: a subagent of session 103 (`/fable-judge`, brief `JUDGE_S103_BRIEF.md`), 2026-11-18 ≈ 02:00–02:20 +03:00, Windows 11, Git Bash.
Scope: commits `76801dd` · `6fa213d` · `57a245e` and their three run reports. Read-only; temp files only under `F:\Temp\judge-s103` (removed).
Two commits landed while judging (`f9bb5cb`, `f91305e` — STATUS, history, interview 050); they touch no file judged here.

## Verdict table

| # | Claim | Verdict | Evidence (command → output) |
|---|---|---|---|
| 1 | bugs/141: two same-named mock-ups get two records; the HEAD contour loses one | VERIFIED | `bugs141-two-mockups-live.mjs` → «a reads: A answer · b reads: B answer · decision files: compare--ccb7f3f2.decision.json, compare.decision.json» exit 0; `--rev 005ab17` → «a reads: B answer · b reads: B answer · decision files: compare.decision.json» exit 1 |
| 2 | bugs/141: mutants N1–N5 each red on exactly its cases | VERIFIED WITH CAVEATS | `bugs141-mutants.mjs` (02:02:26 → 02:04:37) → «OK N1: red 3 … OK N5: red 1 … ✅ every mutant is red on exactly its named case»; no control row (finding 6) |
| 3 | bugs/141 real world: 250 records of 14 projects read the same, folders untouched | VERIFIED WITH CAVEATS | `bugs141-real-records.mjs --rev 005ab17 <14 roots>` → 15+44+5+1+8+3+3+2+4+12+1+34+26+92 = 250 «same … differ 0 · folder untouched true», «✅ every accumulated record resolves and reads as before»; my own count: 250 records, `document` relative in 250, absolute 0, qualified names 0. Caveat — finding 8 |
| 4 | bugs/141 twin: the page lock by `pageKey`; the recovery key «read only, not run» | VERIFIED WITH CAVEATS | N4 red on exactly «--close of b/compare.webp» (row 2); the recovery key is named unrun by the report itself (`review.mjs:1422`); a waiter race from code reading — finding 5 |
| 5 | bugs/142: presence recorded from the first prompt; the HEAD hook reads «NOT running» | VERIFIED WITH CAVEATS | `bugs142-first-prompt-alive.mjs` → «--alive exit 0 · … --alive exit 0» exit 0; `--rev 005ab17` → «exit 1 · exit 1», exit 1; the probe never runs `--alive` — finding 4 |
| 6 | bugs/142: selftest case «alive from the first prompt», mutants G7 · G8 | VERIFIED | `context-window.mjs --selftest` → «selftest: all ok»; `gate-close-mutant.mjs` → «OK control: red 0 … OK G7 … red 1 (named 1) · OK G8 … red 1 (named 1)» |
| 7 | PT6б: four steps 75 · 80 · 85 · 92; one line of the highest; mutants; functional on a live transcript | VERIFIED | `pt6-context-window-mutant.mjs` → control 0 red, 7 × OK; `pt6-context-window.mjs <live transcript, 72 %> --close 80 · 76 · 72 · 65` → «A WARNING only» · «The step of 71 %: bring the work in hand to a logical cut» · «The step of 72 %: start the soft closure now — /end-chat-soft» · «The step of 72 %: if the soft closure is running — finish it quickly»; defaults → «(silence)»; no field `.kaif/kaif.json` (0 of 17) sets `contextWindow`, so no field project keeps the old 80/85 by config |
| 8 | PT6б: «README модуля … переписаны» (plan `plans/142` PT6б, commit `6fa213d`) | REFUTED | `git grep -n "then every 5 %" HEAD -- framework dist` → `framework/hooks/README.md:21` and `dist/KAIF-CORE-BUNDLE.md:21287` — finding 3 |
| 9 | bugs/143: exact characters in the prompt line; ASCII form named; markdown code span keeps the placeholder | VERIFIED WITH CAVEATS | `clock-now.mjs --selftest` → all ok; `pt1-clock-now.mjs` → 10 × OK; `pt1-clock-now.mjs <hook of 76801dd>` → «BAD (8) · BAD (9) · BAD (10) · ✖ 3 BAD»; LIVE in this judge's own Write of a `.md`: the hook's line «clock-now · this write keeps [NOW] as letters …» came with the result, the code span stayed literal, the bare TIME placeholder became «02:06»; spans across a line wrap — finding 2 |
| 10 | bugs/139: five slots rewrapped «без смены слов»; guard 5za red on `6fa213d` exactly 5, silent on a mention | VERIFIED WITH CAVEATS | `bugs139-slot-red.mjs` → «OK control: 0 · OK mutant A …: 5 line(s) (named 5) · OK mutant B: 0»; `bugs139-slot-form.mjs <every framework/**/*.md>` → only `framework/spheres/_template.md:46` (out of scope, named in the report); whitespace-flattened md5 equal for `/end-chat-soft` and `/release`; the team template lost the period after the slot (`…construction>\`.` → `…construction>\``); the guard probe checks a count, not names — finding 7 |
| 11 | bugs/139 real world + the UB5 probe criterion rewrite: «критерий их по-прежнему судит» (report §5) | REFUTED | the rewritten criterion lets 4 of the 7 false «not found» of session 102's red proof through — finding 1 |
| 12 | EXP-0214: `mutants-of.mjs <file>` runs every mutant probe of the file; red on the tree of `76801dd` | VERIFIED WITH CAVEATS | this tree → «OK gate-close-mutant · OK pt6-context-window-mutant · ✅ 2 mutant probe(s)»; `git archive 76801dd tools framework` + this runner → «BAD pt6-context-window-mutant.mjs — exit 1 … ✖ 1 of 2», exit 1; the runner is wired into no gate — finding 9 |
| 13 | Closing debt of session 102 + the polygons of session 103 green | UNVERIFIABLE (bounds: no `npm run test:core`) | logs read, not re-run: six `polygon-s103-*.log` in the session scratchpad end «✅ sandbox suite: all 28 suites green»; `verify-contour-141.log` ends «ИТОГ QA-прогона: 245 зелёных, 0 красных» |

Counts: VERIFIED 3 · VERIFIED WITH CAVEATS 7 · REFUTED 2 · UNVERIFIABLE 1.

## Findings

1. **The UB5 field probe was weakened by the criterion rewrite of `57a245e`, and the claim that it still judges the class is false.**
   The command: copy `dist/` to `F:\Temp\judge-s103\mut`, in its `KAIF-CORE.mjs` replace `if (!hit.length) return null;` with `return null;`
   (`placeholderPattern` off; this is the seam of session 102's proof «копия dist без образца заглушки в ядре», report
   `2026-11-17_ub5-no-sweeping-stage.md` row 16 → «ровно 7 BAD — поля #1–#7»), then `KAIF_DIST=F:/Temp/judge-s103/mut node
   tools/sandbox/probes/ub5-field-filled-slot.mjs` → «BAD deployment #2 … #3 … #4: … — 1 (this build)», with the `Co-Authored-By: …<YOUR AGENT/MODEL>`
   line, and «OK deployment #1 · #5 · #6 · #7: … — 0 (this build) · … · 1 line(s) new in the template since 3057175 — a merge, not this class»,
   «❌ 3 BAD». On the real build the same four deployments show 0 new lines, so the extra line there is exactly the placeholder-carrying line.
   Failure scenario: a core change that drops the placeholder pattern → the probe goes red on 3 deployments, and on #1, #5–#7 it calls the
   false «not found» «a merge». The report admits the red proof was not re-run (§5) and still says «критерий их по-прежнему судит».
   Fix: judge «held at PRE_REV» against the promised-line set of the OLD walk itself (or the PRE template with the deployment's fills applied),
   then re-run the KAIF_DIST mutant and expect 7 BAD.
2. **bugs/143 keeps a placeholder only in a code span that sits on one line.** `codeSplit` (`clock-now.mjs`) finds inline spans line by line, and
   a fence closes on any line of three backticks. I ran the real hook (PreToolUse Write event on stdin, `x.md`): content «the form \`<!-- created:
   U+27E6 NOW U+27E7 ⏎ -->\` stays a quote» → updatedInput «the form \`<!-- created: 2026-11-18 02:07 +03:00 ⏎ -->\`». A four-backtick fence
   with an inner three-backtick line → «still fenced 2026-11-18» filled, and the real TIME placeholder after the closing four backticks stayed as
   letters. Payload markdown has 202 lines with an odd backtick count in 35 of 166 files (spans broken by the hard wrap). Fix: carry an open
   span across lines up to the matching backtick run (a blank line ends it), and close a fence only on a run of the same character at least as long.
3. **Standing falsehood in the payload README (PT6б).** `framework/hooks/README.md:21`, the row for `context-window.mjs`, still says «reaches
   `contextWindow.warnPct` (80) or `closePct` (85, then every 5 %) … at 80 % a WARNING …, at 85 % «finish the current work to a logical cut,
   then /end-chat-soft»». It ships in `dist/KAIF-CORE-BUNDLE.md:21287`. Lines 182–188 of the same README and the hook give 75 · 80 · 85 · 92,
   with no 5 % repeat. The plan ticks «[x] README модуля … переписаны». The header comment `context-window.mjs:26` also names only
   `warnPct · closePct` as thresholds. Scenario: a field agent reads the module table → expects the warning at 80 % and a repeat every 5 % → is
   surprised by the 75 % line. Fix: rewrite row 21 to the four steps (and line 26), then rebuild.
4. **The bugs/142 probe prints «--alive exit» but never runs `--alive`.** `bugs142-first-prompt-alive.mjs:33-35` computes `st[id] ? 0 : 1` from
   the state. The real `--alive` path is not exercised on a first call: the PostToolUse wiring check, `transcriptOf` → session id, and «no
   transcript … exit 2». Scenario: `transcriptOf` picks another session's newest file on a first call → `--alive` says NOT running while the probe
   is green. Fix: spawn `node <hook> --alive` with HOME/USERPROFILE set to a temporary vendor store that holds the first-prompt transcript.
5. **A bugs/141 waiter can watch the wrong lock (from code reading, not run).** `review.mjs:1557` computes the lock with `pageKey` once, when the
   waiter starts, while `files()` is recomputed on every tick. Scenario: the page of `a/compare.webp` is live → `--wait b/compare.webp` watches
   `compare--<tag>.lock` → a's page closes → b's page takes the bare `compare.lock` → the waiter ends «No live contour … within N s», exit 2, while
   b's page is up (the owner's answer is only found later by `--queue --list`). Fix: recompute `lockPath(root, pageKey(...))` on each tick.
6. **`bugs141-mutants.mjs` has no control row.** Mutation addressivity asks for «intact code → 0 red» in the same run. The control lives only in
   report runs 2 and 5 (selftest 192/193). Fix: add an unmutated copy row that expects exit 0 and red 0.
7. **`bugs139-slot-red.mjs` mutant A asserts a count, not the named addressees.** It checks `got.length === 5`. Five wrong lines would pass.
   Fix: assert the five `file:line` pairs named in its header.
8. **The real-records probe is close to a tautology.** It passes each record's own `document` as the path, so the holder equals the reader by
   construction. It proves «no record moves». It does not prove that a document called by another path form reads the same, and it covers no
   lock files. This is not wrong: it is narrower than «реальный мир — проверено». Fix: also read each record through the path form the CLI
   gets (absolute, backslashes, other case), and list the `*.lock` files of the 14 projects.
9. **EXP-0214 «mechanized» is an opt-in command.** `git grep -ln "mutants-of" HEAD -- tools package.json framework .claude` → only the runner
   itself. The second recurrence of the EXP-0169 class was answered with a tool the agent must remember to run, plus a HOUSE_RULES line. That is
   the same «remember to run the probe» that failed. Fix: call the runner from the build or the polygon preflight on the files changed against HEAD.

Side observation (outside the session-103 claims): in auto mode, the first Write of a markdown file whose placeholder the clock hook fills was
refused by the harness classifier («a hook changed this call's input after auto mode reviewed it»). The same call sent again passed. Every
filled write costs a retry there.

## Not checked

- `npm run test:core`, `review.mjs --selftest` outside a probe, `verify-contour` — forbidden by the brief's bounds. The polygons are judged by
  their logs only (row 13).
- The first call of a NEW chat (the DONE condition of bugs/142), the live 75 % step (the session stood at 72 %), the browser recovery key with
  a dot in the name, a field update with a local fix of #199, the bugs/139 step-4 line on a field that deleted it — all named unrun by the reports.
  No stand for them here.
- Finding 5 is from code reading. No race was driven.
- The entry read of the preamble: the thirteen canon documents total ≈ 1.47 MB (`EXPERIENCE.md` alone 763 KB), more than this context holds.
  Read in full: the brief, `fable-judge/SKILL.md`, the three run reports. Read in part: `STATUS.md` (head and п. 0н), `TESTING_FRAMEWORK.md`
  «Что значит слово „тест“», `plans/136` criterion 35, `plans/142` PT6б, `MASTER_PLAN.md` №161, EXP-0169 · EXP-0214. Every other document named
  in the preamble was not read.
