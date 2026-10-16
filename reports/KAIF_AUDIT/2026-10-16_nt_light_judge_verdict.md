# Light judge of epic NT (KAIF 2.9, decision #146) — verdict

**Verdict: VERIFIED WITH CAVEATS.** Every claimed command printed what the claims say, and the 24 of 26 count is right. There are two
real defects to fix before RL. (1) The new multi-line answer can break the parse of the document it is written into. (2) The UT5 probe
used as evidence for C4 can no longer print BAD for most lines, because NT added a pair whose match fragment is an empty string.

HEAD 75a0b93. Brief: `reports/KAIF_AUDIT/2026-10-16_nt_light_judge_brief.md`. Rules of silence kept: no windows, no `test:core`, no git
writes, no edits of tracked files. The build ran only inside a `git archive 75a0b93` copy in the scratchpad. Field deployments were
touched only through the ut5 probe, which works on clones.

## Claims

- C1 VERIFIED WITH CAVEATS — `review.mjs --selftest` → "contour selftest green: 136 checks", line 91 "v NT1 #139: …"; `nt1-contour-mutants.mjs` →
  "M1: 1 red — exactly its addressee · M2 … · 2 mutants red exactly on their addressee". Caveat: F1.
- C2 VERIFIED WITH CAVEATS — `git grep -c` → 1 + 1. Build in the archive copy: exit 0, "check-framework OK" (5j is in that error list).
  KAIF.md, KAIF_REFERENCE.md, dist/KAIF.md and dist/KAIF-CORE.mjs are byte-identical to the committed files. The only bundle difference
  is `"prev": null` against `"v2.8"`, because the copy has no git. `canon-inventory --diff v2.7 …` → "kept 615 · moved 0 · changed 72 · declared 87 · moved-out 0 · lost 0 · new 56". Caveat: F4.
- C3 VERIFIED WITH CAVEATS — `s26-voice-lint.mjs` → "all 98 checks green"; with KAIF_DIST = the dist of 89a46ad → "2 of 98 failed", both "NT2, #133". Caveat: F3.
- C4 VERIFIED WITH CAVEATS — `s25-testrun-lint.mjs` → "all 80 checks green"; with the 89a46ad dist → "1 of 80 failed: s25 NT3 (#141): fresh deploy — check names the build-step slot in /end-chat-soft".
  `ut5-field-check-lines.mjs <two deployments>` → "ALL OK — 9 printed line(s) over 2 deployment(s)". **As evidence this sub-claim is REFUTED (F2)**: the probe
  could not have printed BAD for those lines. Also F5.
- C5 VERIFIED — `pv-mutants.mjs` → "1 mutant(s) red exactly on their addressees"; `ut4-red-on-prior.mjs c439b1f` → "s07 1 · s08 1 · s09 3 red … exactly on their addressees";
  `check-framework.mjs --selftest` → exit 0.
- C6 VERIFIED — counted myself in plans/126 at HEAD: criteria 1–28, 2 and 3 cancelled → 26. ✅ on 1, 4–19, 22–28 = 24; open: 20 and 21. The plans/126 header,
  STATUS.md:20 (HK 2 + OA 1 + CP 6 + SW 4 + UT 3 + PV 1 + NT 4 + 22/23/24 = 24) and MASTER_PLAN §8 ("24 из 26 (1, 4–19, 22–28)") all agree.
- Weakened-test hunt — `git diff 89a46ad 75a0b93 -- tools/sandbox framework/tools/contour`: 4 lines removed, all replaced by stronger
  ones (ut4 addressees 1 → 3; the text input → a textarea; two write lines → multi-line). No loosened assert there. The weakening is
  outside that path: F2.

## Findings (most severe first)

F1 (medium, shipped) — `framework/tools/contour/core.mjs:738` writes each line of a multi-line answer into the file as it is. Before NT1
the field was one line, so this could not happen. Now a line that starts with markdown structure is read back as structure. Probe
(scratchpad `c1probe.mjs`; an interview with Q1 and Q2, a two-line answer written into Q1; LF and CRLF files give the same result):
  - `first\n```\ncode` → the open fence swallows the rest of the file: **Q2 disappears from the parse**.
  - `my pick\n- **A)** actually this` → Q1 now has 3 options; the answer is read back as "my pick" only.
  - `first\n### Q2. fake` → a phantom duplicate Q2 appears; `---` and `| **A** | x |` cut the answer to "first"; `**Answer:** x` → two answers.
  - CRLF file and CRLF input: OK.
  Fix: neutralise continuation lines that match OPTION_START_RE / OPTION_ROW_RE / ANSWER_LABEL_RE / a heading / `---` / a fence (for
  example with an indent or an escape), and add a selftest case for each form.
F2 (medium, false-green oracle) — NT added `tools/check-line-words.json` pair 31 `"${DEPLOY_MANIFEST} is unreadable as JSON"`. Its fragment
  `line.split('${')[0]` is `""`. `tools/sandbox/probes/ut5-field-check-lines.mjs:27`, `:49` (`l.includes(x.frag)`) therefore matches EVERY line
  that pairs 0–30 did not catch. Pairs 32–38 can never match their own lines, and an unknown line is never "[no pair]". Observed: "ok [a deploy manifest unreadable as JSON] ✖ INCOMPLETE: 2 artifacts missing".
  Pair 37 (`${BUDGET_BASELINE} …`) has the same empty fragment. Guard 5u has its own matching and is not affected.
F3 (low-medium, from reading the code, not run) — `framework/installer/KAIF-CORE.mjs:1612-1617` (portraitSync). A root file is taken as a POINTER
  when `snapshotTail` finds no `pin.head`, and it does not try `pin.heads` (the earlier layout). `norm` handles only `\` and a leading `./`.
  So a consumer whose root file carries an earlier-layout snapshot, and whose `voicePortrait` names that same file as an absolute path or in another
  letter case, loses its replacement item silently (only a `·` log line). Before NT2 it got the item. `./` and backslash forms are fine.
F4 (low) — `framework/skills/interview/SKILL.md:85-88`: "the question carries only what the owner chooses BY … the recon … stay in the context section".
  The skill has no "the subject of the decision is QUOTED INTO the question" rule, which `framework/AGENT_GUIDE.md:944-948` has. An agent that reads
  only the skill could move the subject out of the question. AGENT_GUIDE itself does not contradict this.
F5 (low) — the RITUAL_SKILLS axis (`KAIF-CORE.mjs:3962-3972`, marked `[NOT-TESTED]` while the plan has ✅) does not see two slots of the `release` template:
  `framework/skills/release/SKILL.md:103` (the slot opens mid-line: "match in skeleton. `<If the project has a storefront linter…") and `:128`
  (`` `<COMMIT_COMMAND>` with … ``, a span closed on the line). It follows the `instructionSlotLines()` rule, so this is a gap in that rule.
  No false positives in the three templates; Russian slot text is caught (the test is only on "`<").
