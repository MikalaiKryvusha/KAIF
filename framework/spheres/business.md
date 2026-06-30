# Sphere: Business / Project management / Finance

## Thesis intro

A business or PM project drives an outcome: a launch, a plan executed, a financial model, a campaign. The
human sets strategy and risk appetite; the AI executor researches, models, drafts, tracks, and keeps the
plan honest. Verification is against goals/metrics and sound assumptions, not code correctness.

## KAIF entity mapping

| KAIF base | In this sphere |
|-----------|----------------|
| `bugs/` | risks, blockers, broken assumptions, off-plan deviations, model errors |
| release | a delivered milestone: a launched campaign, a signed plan, a published model/report |
| build | producing the artifact: the deck, the model spreadsheet, the plan, the report |
| test / verify | sanity-checking numbers, assumptions, against goals/KPIs and constraints |
| `plans/` | the strategy, roadmap, OKRs/milestones, ideas backlog |
| interview | strategy, budget, scope, risk decisions — the owner's call |

## Key terms (brief glossary)

- **milestone** — a defined, dated deliverable.
- **assumption** — an input the plan/model depends on (track and verify these).
- **KPI/OKR** — the metric/objective progress is measured against.

## Adaptation notes

- `bugs/` becomes a risk/issue register with forensics (why an assumption broke).
- The "harness" = re-runnable models and checklists so numbers aren't trusted by eye.
- `interviews/` capture strategy/budget/scope calls; `/propose-idea` fits new initiatives awaiting approval.
