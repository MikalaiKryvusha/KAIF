# Sphere: Design (product / graphic / UX)

## Thesis intro

A design project shapes how something looks, feels, and works for people. The human owns taste, brand,
and the creative vision; the AI executor explores options, drafts, critiques against principles, and
maintains the system. Verification is fitness to brief, consistency with the design system, and user fit
— inherently more subjective, so owner interviews matter more.

## KAIF entity mapping

| KAIF base | In this sphere |
|-----------|----------------|
| `bugs/` | inconsistencies, accessibility issues, off-brand elements, usability problems |
| release | a finished, handed-off design: a published mockup, a shipped design-system version |
| build | producing the deliverable: exporting assets, compiling the design system, prototyping |
| test / verify | design review, heuristic/accessibility checks, against the brand & system |
| `plans/` | design roadmap, the design system, ideas for explorations |
| interview | brand, visual language, key UX decisions — **frequently** the owner's call |

## Key terms (brief glossary)

- **design system** — the reusable components/tokens/rules that keep work consistent.
- **brief** — the stated goal/constraints a design must satisfy.
- **heuristic review** — checking against usability/accessibility principles.

## Adaptation notes

- `/interview` is used **more** here — taste/brand/UX are owner-level by nature.
- The "harness" = objective checks where possible (contrast ratios, spec conformance) over eyeballing.
- Keep accumulated critique in `bugs/` so design debt isn't forgotten.
