# Brief — light judge of epics UT and PV (KAIF 2.9), repository D:\work\ai_sandbox\KAIF

You are an adversarial verifier (/fable-judge, light form — owner's decision #48). Treat every "done" below as a CLAIM to re-execute,
not to re-read. Default verdict when in doubt: REFUTED for that claim. Report in English, outcome-first, one line per claim:
`C<n> VERIFIED | VERIFIED WITH CAVEATS | REFUTED — <the observation you made: command + what it printed>`, then a short list of
caveats/findings with file:line.

## Rules of silence (binding)
- No windows, no sound, no browser. Never run `tools/review.mjs` without `--list`/`--check`, never `verify-contour.mjs` (browser).
- Do NOT run `npm run test:core` (the full polygon) — the session ran it; judge it from the claims below with targeted runs only.
- Never set `KAIF_DIST` to an old generator for contour code. Never `git config` anything; never commit, push, stash, checkout or reset.
- Do not edit any tracked file. Scratch files only under your own temp folder (`os.tmpdir()`).
- Field deployments on disk (the folders under D:\work that carry .kaif/kaif.json) are READ-ONLY; use the probes, which clone them.
- Run heavy commands one at a time.

## Claims to re-execute (HEAD = the PV commit after 6c052b3; UT commits 6c052b3, c439b1f, 8f20005, ef96643)
C1 (UT5) — `node tools/check-framework.mjs --selftest` prints «✅ гард 5u» and exits 0; `node tools/build-framework.mjs` ends «check-framework OK»
   with no «5u:» line. On the reference of c439b1f (`git show c439b1f:framework/KAIF_REFERENCE.md`) the guard names exactly 17 lines.
   Hint: copy the tree with `node tools/sandbox/probes/ut5-check-lines-mutants.mjs --list` to see the mutant set; re-run the probe:
   «3 mutants red exactly on their named addressees, control silent».
C2 (UT5 functional) — `node tools/sandbox/probes/ut5-field-check-lines.mjs <two live deployments: the folders under D:/work/ai_sandbox that carry .kaif/kaif.json at version 2.8>` → ALL OK.
   Then hunt: is there ANY line `check` can print (read `cmdCheck` in framework/installer/KAIF-CORE.mjs and the helpers it calls) that the
   scan of guard 5u (tools/check-framework.mjs, `checkLinesUnknownToReference`) cannot see? Name it with file:line.
C3 (UT4) — `node tools/sandbox/probes/ut4-red-on-prior.mjs c439b1f` → s07 1 · s08 1 · s09 1 red, «exactly on their addressees»; the
   three suites green on the working tree (`node tools/sandbox/s07-translated.mjs` etc.).
C4 (UT4 truth) — read the new text of the `merge-diverged` item (framework/installer/KAIF-CORE.mjs, `zeroBase`) and of the
   `.kaif/install` refusal (`fetchArtifact`): does the command they hand the field actually work? (e.g. run `diff --render` as the item
   says on a fixture install, or reason from cmdDiff with a quote.)
C5 (UT1–UT3, criteria 16–18) — the claims of plans/131 UT1–UT3 and the reports testcases/reports/2026-10-16_ut1-withdrawn-places.md,
   _ut2-pointers-updated.md, _ut3-long-jump-honest.md, _ut3-real-route.md: pick the two cheapest to re-execute (suite s04 S14d, s21 U2/U3)
   and run them; check that the plan checkboxes match the reports (no box ticked without its observation).
C7 (PV, criterion 19 of plans/126) — `node framework/tools/kaif-attribution-lint.mjs selftest` → 39 cases OK, five «PV:»;
   `node tools/sandbox/probes/pv-red-on-v28.mjs` → «v2.8: 4 red · this build: 0 red»; `node tools/sandbox/probes/pv-field-baselines.mjs
   <two live deployments: the folders under D:/work/ai_sandbox that carry .kaif/kaif.json at version 2.8>` → ALL OK. Hunt: can a 2.8 baseline (text values) LOSE recorded debt under the new
   reading or the first new write (freshFindings / nextBaseline / prunableEntries)? Can the path-limited write keep an entry of a file
   that no longer exists forever? Is the origin's own `.kaif/attribution-lint.baseline.json` free of text now (`git show HEAD:…`)?
C6 — standing lies: grep STATUS.md, MASTER_PLAN.md §8 and plans/126 for statements about UT that the tree contradicts (e.g. "дальше UT3").

Hunts to run (the KAIF block of /fable-judge): weakened tests in the diff c439b1f..6c052b3 (`git diff c439b1f 6c052b3 -- tools/sandbox`)
— any assert loosened without a justification in the commit message? · claim wider than observation · done without the real world.
