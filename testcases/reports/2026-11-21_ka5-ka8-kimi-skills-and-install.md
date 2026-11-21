# Test run report — KA5 skill triggers, KA8 install findings, and the generic live-connection contract

**Created:** 2026-11-21 20:14 +03:00 · **Run by:** Kimi K3.1 Pro · **Version/build:** KAIF 2.10 WIP, `3b78552` + this session's working tree.

## 1. Work

KA5(a): carry the complete skill trigger text and localized aliases into Kimi's untruncated `whenToUse`. KA8 / `plans/136`
criterion 40: refuse untouched project maps, keep the shipped Russian KAIF document clean under the voice lint, and prove that the
mirror-drift warning names `sync`. The generic adapter contract in `framework/adapters/_template.md` now requires live evidence for
each mechanism instead of accepting a written config as readiness. Basis: `plans/143` KA5/KA8 and interview 050 Q1 = A.

## 2. Contour

Built `dist`, fresh temporary projects installed from it, and the origin's real Kimi VS Code session. REAL WORLD: accumulated — the
owner's real skill catalog and current session · data and technique — the actual `.kimi-code/skills/` mirrors re-synced from the
canon · path — Kimi re-read the changed catalog in the running session and exposed the full When-to-use text. Install cases ran on
clean temporary stands; the live hook contour is separately blocked on the old config held by this process (`bugs/147` report).

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | ≈ 2026-11-21 19:52 +03:00 | `KIMI_CODE_HOME=<missing> node tools/sandbox/s01-field-fixes.mjs` before KA5 | 1 · S15 KA5 red on all 37 skills: no whenToUse |
| 2 | ≈ 2026-11-21 19:54 +03:00 | `node tools/build-framework.mjs`; the same s01 after KA5 | 0 · all 37 carry description + identical full whenToUse; sync green |
| 3 | ≈ 2026-11-21 19:55 +03:00 | `node dist/KAIF-CORE.mjs sync` at the origin | 0 · 46 system copies re-synced; 37/37 Kimi skills carry whenToUse; Kimi's live catalog changed in this session |
| 4 | ≈ 2026-11-21 20:07 +03:00 | `KIMI_CODE_HOME=<missing> node tools/sandbox/s01-field-fixes.mjs` with the KA8 assertions | 1 · maps green; voice found the H1 as a third «здесь»; the drift assertion initially missed stderr — both measurement issues fixed without weakening the expectations |
| 5 | ≈ 2026-11-21 20:10 +03:00 | `node tools/build-framework.mjs`; the same s01 after the fixes | 0 · S1 and S15 KA8 cases green; the whole s01 green |
| 6 | ≈ 2026-11-21 20:12–20:14 +03:00 | `node tools/sandbox/probes/ka8-install-findings.mjs` | 0 · fresh Russian Kimi install; maps refuse then pass; voice clean; drift names sync |
| 7 | ≈ 2026-11-21 20:12–20:14 +03:00 | the same probe with `--broken maps`, then `--broken voice`, then `--broken sync` | 0 · each exact pre-fix construct is red only where addressed; the first sync mutation did not apply, was corrected, then passed |
| 8 | 2026-11-21 21:20 +03:00 | independent judge: install from dist, copy in the origin's real filled maps, `checkpoint maps` | 1 · REFUTED: generic `<name>`/`<dir>`/`<DOC>` notation in real paths was mistaken for unfilled slots |
| 9 | ≈ 2026-11-21 21:33–21:40 +03:00 | build; `node tools/sandbox/probes/ka8-install-findings.mjs` after narrowing the gate | 0 · template slots refused, filled maps pass, and the origin's actual filled maps pass unchanged |
| 10 | ≈ 2026-11-21 21:34 +03:00 | the same probe with `--broken maps`, `--broken voice`, `--broken sync` | 0 · every exact pre-fix construct remains red on its addressed case |
| 11 | ≈ 2026-11-21 22:00 +03:00 | final probe adds a map with only its multiline template guidance left; build and all three broken controls | 0 · partial map refused; fully filled maps and real origin maps pass; each pre-fix construct remains red |
| 12 | ≈ 2026-11-21 22:01–22:12 +03:00 | full `npm run test:core` after the multiline guard | 1 · 25/28 green; s01/s04/s07 red because their fill fixtures replaced only closed single-line slots and left real multiline template guidance |
| 13 | ≈ 2026-11-21 22:13–22:15 +03:00 | correct those fixtures to fill multiline guidance too; run s01, s04 and s07 separately | 0 · all three green; the guard was not weakened |

## 4. Checks

Hygiene: build/check-framework green · s01 green · three targeted reverse-mutation proofs green · the origin mirror count is 37/37.
Functional run: fresh projects were installed from the built dist and the three KA8 results were READ. On the owner's real running Kimi
session the skill catalog changed after sync and now exposes each complete When-to-use field; this was read in the session itself.

| Case | Status | Observation |
|---|---|---|
| smoke: all skills expose full trigger text | pass | 37/37 in the fresh install and at the origin; the live catalog now prints the complete field |
| KA5 sync carries canonical edits | pass | S15 sync case green |
| maps refuse template slots | pass | both files named before filling; a map retaining only multiline template guidance is also refused; checkpoint passes after complete filling |
| maps accept genuine generic notation | pass after refutation | the origin's real filled maps, including `<name>`, `<dir>` and `<DOC>` in paths, pass unchanged |
| shipped Russian KAIF document under the voice lint | pass | H1 plus both H2 headings fixed; zero findings with --genre document |
| mirror drift names its remedy | pass | the real check warning contains `node .kaif/kaif-core.mjs sync` |
| each KA8 guard can fail | pass | maps, voice and sync each red on its exact pre-fix construct in a temporary dist copy |
| generic connection contract | pass as a document | applied to Kimi; build green; its pending live items are not marked supported |
| KA5(b), no-git skill-root message | pass | s01 S9: both install and check name the nearest-.git rule and `git init` |
| KA5(c), live skill call with argument + resource | pass | this session ran Skill(fable-method, args="report") and read its resolved failure-modes.md reference |

## 5. Found

- The voice report's «two headings» had a third instance in H1; all three were fixed and declared as renames.
- The s01 runner returned only stdout on success, hiding the drift warning on stderr; both success runners now merge stderr, matching the
  project's standard runner.
- No new product defect remains open from KA5(a) or KA8.

## 6. Traces

- `tools/sandbox/probes/ka8-install-findings.mjs`
- `tools/sandbox/s01-field-fixes.mjs` S1 · S15
- `framework/adapters/_template.md`
- `framework/adapters/kimi-code.md`
- the current Kimi session's re-rendered skill catalog

## 7. Verdict

partial — KA5 (all three parts), KA8 and the generic contract are verified; only the new-session hook/Stop acceptance remains outside this report's pass.
