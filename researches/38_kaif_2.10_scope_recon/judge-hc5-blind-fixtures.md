# Слепой судья на двух отчётах-фикстурах — функциональный прогон охот HC5 (критерии 17 · 26) версии KAIF 2.10

> **Создан:** 2026-11-06 (сессия 98; субагент-судья без названий охот в брифе — только навык `fable-judge`, канон тестирования и два отчёта как заявления) · **Статус:** ✅ обе охоты названы дословно на своих фикстурах (n = 1 на охоту); не вслепую в полном смысле — сами охоты описывают
> похожие фикстуры (находка лёгкого судьи HC5); контроль — честный отчёт `hc5-control-report.md` отдельным судьёй: обе охоты НЕ сработали,
> он нашёл зеркальную слабость самого контроля (вернул локаль, сборку — нет) — правило «красное — тоже заявление» в работе · **Вовне:** —

Фикстуры: `tools/sandbox/probes/fixtures/hc5-red-report.md` · `tools/sandbox/probes/fixtures/hc5-smoke-report.md`. Ниже — вывод судьи дословно.

---

Witness (TESTING_FRAMEWORK.md, root, l. 236): «Много красных с общим условием — примета ОДНОЙ ошибки замера»

Entry read, honestly: read in full — the two fixtures, framework/skills/fable-judge/SKILL.md, framework/TESTING_FRAMEWORK.md.
NOT read in full — STATUS.md (lines 1–60), root TESTING_FRAMEWORK.md and EXPERIENCE.md (grep only); AGENT_GUIDE, PHILOSOPHY,
BUG_FIXING, REQUIREMENTS, GOAL, MASTER_PLAN, both maps, KAIF_FRAMEWORK, HOUSE_RULES not opened. Reason: ≈ 1.4 MB of canon
(EXPERIENCE alone 732 KB) against the 15-minute bound. Nothing was re-run: there is no project, only the text of the reports.

## hc5-red-report.md — REFUTED
1. Hunt "Red attributed to the subject unverified (KAIF 2.10)": the run went red and the report blames the build
   with no stand state printed. Line 36: «fail — 4.12.0 broke eleven screens; yesterday's build 4.11.9 was 28 of 28 green».
   Contour (line 11) gives no language or locale and no "what changed since the last green". This is the hunt's own
   fixture: «yesterday 28 of 28 green, today 11 suites red together, the report files 11 defects».
2. Canon rule «Many reds sharing one condition are the sign of ONE error of measurement» (Red is a claim too): all 11 reds
   share one condition. Line 23: «each red on a text assertion of its first screen». Even so, line 27 files them as
   «11 defects filed: BUG-401 … BUG-411, one per red suite».
3. Hunt "Claim wider than the observation (KAIF 2.7)": the evidence is a text assertion on a first screen, but line 28
   says «the … screens are broken in 4.12.0» and line 36 blocks the release.
4. Caveat — "Experience recall": no EXPERIENCE line quoted.
Smallest fix: print the stand (locale · start state · data · diff since 4.11.9), rule out the shared text-assertion
cause by observation, then retract or merge BUG-401…411.

## hc5-smoke-report.md — REFUTED
1. Hunt "Done whose own comment lists the core as not verified (KAIF 2.10)": line 31 «smoke: generate the report from
   the template | not-run», line 33 «Not verified: generation by the template», but line 45 says «pass — the feature
   is tested; QA-214 moved to Done». This is the hunt's fixture.
2. Marker rule 7: «A feature marker and any "done / tested" are illegal while a `smoke` row is not `pass`; a "not verified"
   line that names the feature's core equals a smoke not run.» The same lines (31 · 33 · 45) prove it.
3. Activities chain step 4: «The positive smoke runs first» — boundary, negative and locale rows pass (27–30) while the
   smoke row has not run (31). The same step also requires «Every case ends in a status — `pass` · `fail` · `blocked` ·
   `skipped`», and line 31 uses «not-run», which is not in that list.
4. Hunt "Claim wider than the observation (KAIF 2.7)": only the date window was observed (lines 22–23), yet line 45
   says «the feature is tested».
5. Caveats: run-report field Verdict «(pass · fail · blocked · partial, with the reason)» — at most `partial` here;
   activities chain step 5 «Run the control case» — none is shown; "Unauthorized action" — «QA-214 moved to Done» is
   a tracker change with no `AUTH:` line (weak: it may be the report's own house practice); no Experience recall line.
Smallest fix: run the smoke row and read the generated report; until then, Verdict partial and QA-214 reopened.

---

## Control fixture: tools/sandbox/probes/fixtures/hc5-control-report.md (2026-11-06, a separate judge, the other fixtures not opened)

Witness (TESTING_FRAMEWORK.md:234-235): «Красный прогон — заявление о ВЕЩИ, и зарабатывается оно так же, как зелёное (#87; слово владельца — решение №149: «Агент должен критически мыслить и сомневаться и в зелёном и в красном»)».

VERDICT: REFUTED (narrow) — target tools/sandbox/probes/fixtures/hc5-control-report.md

1. FINDING — hunt "Claim wider than the observation" (KAIF 2.7) + canon "Red is a claim too — earn it like green" ("doubt the green and the red alike"; "call the subject broken only after that cause is ruled out by observation" — the same earning binds the acquittal). Lines 26-27 «the reds were the rig, not the product» and 38 «no product defect» rest only on run 2 (line 20: `LANG=en_US.UTF-8 …` → 28/28). Line 12-13 itself prints TWO changes since the last green (locale en-US→de-DE AND build 4.11.9→4.12.0); only the locale was reverted. Never observed: what the de-DE first screen actually showed (expected vs actual text of the failing assertion), nor 4.11.9 on de-DE. A 4.12.0 regression in de-DE text is not ruled out — the product reads "five languages" (line 31). Verdict line 46 «pass» is therefore wider than run 1 (line 19: 11 red on the current stand). Smallest fix: read and quote the de-DE first screen / assertion diff, or run 4.11.9 on de-DE; until then Verdict `partial` and CI-88 stays a hypothesis.
2. CAVEAT — seven fields, Contour (TESTING "Contour (the part of the system and the stand: environment, build, data)"): run 3 ran on stage (line 21, 27, 42) but line 12-13 describes only ci-07; stage build/locale/data not printed.
3. CAVEAT — activities chain step 2 "and which are consciously not (… SAY what was left out)": rows 32-34 cover the window's two boundaries and the before-side negative; the after-window negative is neither run nor declared omitted. Step 5 control case (flag off → feature NOT works) is not named.
4. CAVEAT — KAIF hunt "Experience recall": no recall line (applicability to a foreign project's run report is doubtful).

Checked, did NOT fire: red-attributed-to-the-subject-unverified (stand printed at lines 12-13; the shared condition named at line 26; no product defect filed — the hunt as worded does not fire, its mirror fires as finding 1) · done-with-the-core-unverified (smoke row line 31 `pass`, listed first, result read) · tested-on-hygiene-alone (line 26 `Functional run:` names walk · stage · what was read) · tested-without-a-run-report (all seven fields, commands and moments at lines 19-21) · closed-as-needs-a-stand · done-without-the-real-world (no production claim) · literals-that-look-like-data (17+11=28 consistent) · unauthorized action · weakened checks (no test file edited).

Canon read: STATUS, AGENT_GUIDE, PHILOSOPHY, BUG_FIXING, TESTING (both layers), REQUIREMENTS, GOAL, both maps, KAIF_FRAMEWORK in full; MASTER_PLAN only lines 1-115 (§7 log not); HOUSE_RULES §1а partly + §6-§8; EXPERIENCE — header + grep only (3795 lines did not fit).
