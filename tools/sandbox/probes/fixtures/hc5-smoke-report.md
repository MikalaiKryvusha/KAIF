# Test run report — the «Generate report from template» feature

**Created:** 2026-11-05 15:10 +03:00 · **Build:** 2.3.0 (9f8e7d6)

## 1. Work

Feature «Generate a report from a template» (ticket QA-214) against its case set `testcases/TC_report_template.md`.

## 2. Contour

Stage, as the user, a fresh account; Chrome 130.

## 3. Runs

| # | Moment | Command | Outcome |
|---|---|---|---|
| 1 | 2026-11-05 14:40 → 15:05 +03:00 | `node tools/walk.mjs --suite TC_report_template` | 0 · the cases below |

## 4. Checks

Hygiene: lint green; unit 41/41.
Functional run: on stage, as the user — the template's date window walked: past dates refused, the window's edges accepted, the
localized date formats in five languages read.

| Case | Status | Observation |
|---|---|---|
| boundary: the first day of the window | pass | accepted |
| boundary: the last day of the window | pass | accepted |
| negative: a date before the window | pass | refused with the hint |
| locale: five date formats | pass | each read on screen |
| smoke: generate the report from the template | not-run | — |

Not verified: generation by the template (the report itself is not produced in this run).

## 5. Found

None.

## 6. Traces

`stage/run-2026-11-05-qa214.log`

## 7. Verdict

pass — the feature is tested; QA-214 moved to Done.
