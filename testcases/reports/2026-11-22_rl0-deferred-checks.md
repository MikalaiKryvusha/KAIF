# Test run report — RL0 debt checks after the previous chat's 92 % closure

**Created:** 2026-11-22 14:57 +03:00 · **Run by:** Kimi K3.1 Pro · **Version/build:** KAIF 2.10, `29c94f7`, build 866.

## 1. Work

Re-ran the checks explicitly deferred by `FAREWELL_MESSAGE_FROM_THE_PREVIOUS_CHAT.md`: the full truth/mirror registry in `HOUSE_RULES.md` §2,
`verify-contour --etalon-only`, `budget-gate`, and attribution lint after the live 85 % stage. The basis is `plans/141` RL0/RL1 and the registry
commands themselves; no product behavior was changed.

## 2. Contour

Local source checkout on Windows 11, Git Bash, current `main` through `29c94f7`. The tracked tree was clean before and after the checks; pre-existing
untracked assets, local configuration backups, `.kaif` state and Python cache were left untouched. No deployed production artifact was changed.

## 3. Runs

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | 2026-11-22 14:54 +03:00 | `node tools/refresh-stamp.mjs --trigger ritual:/resume --docs STATUS.md AGENT_GUIDE.md PHILOSOPHY.md BUG_FIXING_FRAMEWORK.md TESTING_FRAMEWORK.md REQUIREMENTS_FRAMEWORK.md GOAL.md MASTER_PLAN.md PROJECT_STRUCTURE_EXTERNAL_MAP.md PROJECT_ARCHITECTURE_INTERNAL_MAP.md KAIF_FRAMEWORK.md HOUSE_RULES.md EXPERIENCE.md` | 0 · 13 documents witnessed |
| 2 | 2026-11-22 14:55 +03:00 | `node tools/build-framework.mjs` | 0 · 59 embedded files, 195 blocks, 846 modules; check-framework green |
| 3 | 2026-11-22 14:55 +03:00 | `git diff --stat && git status --short` | 0 · no tracked diff; only pre-existing untracked paths |
| 4 | 2026-11-22 14:56 +03:00 | `diff framework/skills/fable-method/SKILL.md .claude/skills/fable-method/SKILL.md && diff framework/skills/fable-judge/SKILL.md .claude/skills/fable-judge/SKILL.md` | 0 · vendored copies identical |
| 5 | 2026-11-22 14:56 +03:00 | `node tools/counters-guard.mjs` | 0 · 47 mirrors matched live counters |
| 6 | 2026-11-22 14:56 +03:00 | `node tools/doc-header-lint.mjs` | 0 · 269 scanned, 0 findings; requirements lint 346 files, 0 findings; known timestamp debt 55 unchanged |
| 7 | 2026-11-22 14:56 +03:00 | `node tools/stylometry-snapshot.mjs --version-check` | 0 · snapshot matches core `c4bbf85` |
| 8 | 2026-11-22 14:56 +03:00 | `node tools/verify-contour.mjs --etalon-only` | 0 · 104 green, 0 red |
| 9 | 2026-11-22 14:56 +03:00 | `node tools/lang-packs-guard.mjs` | 0 · 8 frozen packs and live ru/37 description pins green |
| 10 | 2026-11-22 14:56 +03:00 | Node one-liner checking one `KAIF:CREED:BEGIN` and one `KAIF:PRAYER:BEGIN` marker in each AGENT_GUIDE layer | 0 · `GREEN prayers` |
| 11 | 2026-11-22 14:56 +03:00 | Node one-liner comparing `version.json`, `.kaif/kaif.json`, and the KAIF_FRAMEWORK version row | 0 · `GREEN version mirror 2.10` |
| 12 | 2026-11-22 14:56 +03:00 | `for d in framework/skills/*/references; do n=$(basename "$(dirname "$d")"); diff <(ls "$d") <(ls ".claude/skills/$n/references") >/dev/null || { echo "RED: $n"; exit 1; }; done && echo GREEN` | 0 · reference rosters match |
| 13 | 2026-11-22 14:56 +03:00 | `node framework/tools/kaif-attribution-lint.mjs check` | 0 · 705 files, new 0, existing baseline debt 45 |
| 14 | 2026-11-22 14:56 +03:00 | `node tools/budget-gate.mjs` | 0 · all 9 re-read core documents within budget; closest MASTER_PLAN 295/300 |

## 4. Checks

Hygiene: build/check-framework green; all registry pairs green; contour etalon 104/104; attribution 0 new; budget 9/9 within limits.
Functional run: NONE — these are source, metadata and contour-structure checks; no owner-facing product path was exercised.

| Case | Status | Observation |
|---|---|---|
| Deferred full registry | pass | No truth/mirror divergence printed; rebuild produced no tracked diff |
| Deferred contour etalon | pass | 104 green, 0 red, live interview roster matched the frozen etalon |
| Deferred budget gate | pass | 9 core documents within budget |
| Deferred attribution lint | pass | 0 new findings; baseline debt remains 45 |

## 5. Found

- none in the executed checks.

## 6. Traces

- Tool output of runs 1–14 in the current Kimi session.
- `HOUSE_RULES.md` §2.
- `FAREWELL_MESSAGE_FROM_THE_PREVIOUS_CHAT.md`.

## 7. Verdict

partial — every deferred hygiene/registry check passed, while no functional owner-path run belonged to this verification slice.
