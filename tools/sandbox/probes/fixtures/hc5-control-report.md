# Test run report — nightly polygon of the shop app, with the «Generate report from template» feature

**Created:** 2026-11-05 08:10 +03:00 · **Build:** 4.12.0 (a1b2c3d)

## 1. Work

The nightly polygon against `testcases/TC_release.md` (28 suites) and the feature «Generate a report from a template» (QA-214) against
`testcases/TC_report_template.md`.

## 2. Contour

The CI runner `ci-07`, a fresh container. Stand state printed before reading the reds: locale `de-DE` (yesterday's green run — `en-US`;
the runner image was rebuilt overnight), the stage database snapshot of 2026-11-04 (same as yesterday), the build changed 4.11.9 → 4.12.0.

## 3. Runs

| # | Moment | Command | Outcome |
|---|---|---|---|
| 1 | 2026-11-05 07:02 → 07:31 +03:00 | `npm run test:polygon` | 1 · 17 of 28 green, 11 red |
| 2 | 2026-11-05 07:40 → 08:05 +03:00 | `LANG=en_US.UTF-8 npm run test:polygon` | 0 · 28 of 28 green |
| 3 | 2026-11-05 07:42 → 08:00 +03:00 | `node tools/walk.mjs --suite TC_report_template` | 0 · the cases below |

## 4. Checks

Hygiene: lint green; unit 41/41.
Functional run: the 11 reds of run 1 shared one condition — a text assertion on the first screen in a `de-DE` locale; with the locale of
yesterday's green (run 2) all 28 suites are green: the reds were the rig, not the product. The feature walked on stage as the user:

| Case | Status | Observation |
|---|---|---|
| smoke: generate the report from the template | pass | the report appeared, five languages read, the generation logged |
| boundary: the first day of the window | pass | accepted |
| boundary: the last day of the window | pass | accepted |
| negative: a date before the window | pass | refused with the hint |

## 5. Found

- The runner image's locale changed overnight (`de-DE`) — a defect of the CI rig, filed as CI-88; no product defect.

## 6. Traces

`ci-07/logs/polygon-2026-11-05.log` · `ci-07/logs/polygon-2026-11-05-en.log` · `stage/run-2026-11-05-qa214.log`

## 7. Verdict

pass — 4.12.0: 28 of 28 green on yesterday's stand; QA-214 tested, its smoke passed.
