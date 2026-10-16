# Brief — light judge of epic NT (KAIF 2.9, decision №146), repository D:\work\ai_sandbox\KAIF

You are an adversarial verifier (/fable-judge, light form — owner's decision #48; read `.claude/skills/fable-judge/SKILL.md` for the
verdict form). Treat every "done" below as a CLAIM to re-execute, not to re-read. Default verdict when in doubt: REFUTED for that claim.
Report in English, outcome-first, one line per claim `C<n> VERIFIED | VERIFIED WITH CAVEATS | REFUTED — <command + what it printed>`,
then findings with file:line, most severe first; under 800 words.

## Rules of silence (binding)
- No windows, no sound, no browser: never run `tools/review.mjs` without `--list`/`--check`; never run `tools/verify-contour.mjs` without
  `--etalon-only`; run the contour generator only through the probes (they use `quietEnv()`).
- Do NOT run `npm run test:core`. No git writes (no commit, push, stash, checkout, reset), no `git config`, no edits of tracked files.
- Field deployments (folders under D:\work carrying .kaif/kaif.json) are READ-ONLY — only through the probes, which clone them.
- Heavy commands one at a time.

## Claims (HEAD = 75a0b93; the epic's plan `plans/135_epic126_NT_four_field_tickets.md`; criteria 25–28 of `plans/126_EPIC_kaif_2.9.md`;
## report `testcases/reports/2026-10-16_nt-four-field-tickets.md`)
C1 (25, #139) — `node framework/tools/contour/review.mjs --selftest` → 136 checks green incl. «NT1 #139»; `node tools/sandbox/probes/nt1-contour-mutants.mjs`
   → «2 mutants red exactly on their addressee». Hunt: can an owner's multi-line answer be misread back (a line that looks like an option
   `- **A)**` or a label; CRLF files)? Read `recordDecision` in framework/tools/contour/core.mjs.
C2 (26, #142) — `git grep -c "One fork — one question" -- framework/AGENT_GUIDE.md framework/skills/interview/SKILL.md` → 1 each; build green
   (guard 5j); `node tools/canon-inventory.mjs --diff v2.7 --with framework/KAIF_REFERENCE.md --declared plans/118_epic117_CK_light_canon_budget_exits.md` → lost 0.
   Hunt: does the new sentence contradict the self-sufficiency rule right next to it (the subject must still be INSIDE the question)?
C3 (27, #133) — `node tools/sandbox/s26-voice-lint.mjs` green; with `KAIF_DIST=<dist of 89a46ad extracted by git archive>` exactly the two
   NT2 cases red. Hunt: `portraitSync` in framework/installer/KAIF-CORE.mjs — can a real snapshot consumer (root file = an older snapshot, a
   `voicePortrait` naming the root file in another spelling, `./AUTHOR_STYLOMETRY.md`, backslashes) be misread as a pointer and lose its update?
C4 (28, #141) — `node tools/sandbox/s25-testrun-lint.mjs` green; with the same KAIF_DIST the first NT3 case red; `node tools/sandbox/probes/ut5-field-check-lines.mjs`
   over two deployments → ALL OK. Hunt: false positives of the RITUAL_SKILLS axis (a slot-like line that is a legitimate code span), and a
   translated skill (Russian slot text).
C5 — the judge fixes of UT+PV (reports/KAIF_AUDIT/2026-10-16_ut_pv_light_judge_verdict.md): re-run `node tools/sandbox/probes/pv-mutants.mjs`,
   `node tools/sandbox/probes/ut4-red-on-prior.mjs c439b1f` (s07 1 · s08 1 · s09 3), `node tools/check-framework.mjs --selftest`.
C6 — standing lies: STATUS.md, MASTER_PLAN.md §8, plans/126 header — the counts («24 из 26») against the criteria lines (count them yourself).
Hunt weakened tests: `git diff 89a46ad 75a0b93 -- tools/sandbox framework/tools/contour` — any assert loosened without a reason in the commit message?
