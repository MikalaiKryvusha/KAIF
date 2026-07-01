# Sphere: Programming / Software (reference sphere)

> The reference sphere — the domain KAIF was distilled from. It uses the base terminology directly.

## Thesis intro

A software project produces and evolves code. "Progress" is working, verified functionality shipped in
increments. The human sets product vision and architecture direction; the AI executor implements, tests,
debugs, and documents. Verification is concrete (builds compile, tests pass, the app behaves correctly).

## KAIF entity mapping

| KAIF base | In this sphere |
|-----------|----------------|
| `bugs/` | code defects, crashes, wrong behavior, regressions |
| release | a tagged, shippable version of the product (GitHub Release) |
| build | compiling/packaging the product (`<BUILD_COMMAND>`) |
| test / verify | unit/integration tests, running the app, objective checks via a harness |
| `plans/` | roadmap, phases, architecture map, feature ideas |
| interview | UI/UX, library/protocol/architecture forks, brand/scope decisions |

## Key terms (brief glossary)

- **bug** — a defect: code that does the wrong thing or fails.
- **release** — launching a logically complete version of the product into the world.
- **build** — turning source into a runnable/shippable artifact.
- **regression** — something that used to work and broke.
- **harness** — tooling that lets the agent run/observe/drive the software without a human.
- **refactor** — restructuring code without changing behavior.

## Adaptation notes

- Emphasize the **harness** principle (`BUG_FIXING_FRAMEWORK.md`): build instrumentation to reproduce and
  verify objectively; the 3-attempts rule before switching to research.
- All eighteen base skills apply directly; `/release` maps to GitHub Releases.
- This is the default sphere if a project is clearly software and no other sphere is specified.
