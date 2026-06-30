# Sphere: Science / Research (math, physics, biology, …)

## Thesis intro

A research project pursues understanding: questions → hypotheses → experiments/proofs → results. The
human sets the research vision and judges significance; the AI executor surveys literature, derives,
computes, runs analyses, and documents rigorously. Verification is reproducibility and peer-checkable
reasoning, not "it compiles".

## KAIF entity mapping

| KAIF base | In this sphere |
|-----------|----------------|
| `bugs/` | anomalies, failed reproductions, flawed derivations, contradicting data |
| release | a finished result: a proof, a paper/preprint, a dataset, a reproducible analysis |
| build | producing the artifact: compiling the paper, running the pipeline, generating figures |
| test / verify | reproduction, peer/self-review, statistical validity, derivation checks |
| `plans/` | research roadmap, open questions, hypotheses backlog |
| interview | research direction, methodology choices, what counts as a publishable result |

## Key terms (brief glossary)

- **hypothesis** — a testable proposed explanation.
- **reproducibility** — others (or a fresh run) get the same result from the same inputs.
- **preprint/paper** — the shipped, citable result.
- **derivation** — a step-by-step proof/calculation (the "code" of math).

## Adaptation notes

- `bugs/` becomes a log of anomalies/failed reproductions; `/bug-research` maps perfectly to literature
  search + root-cause of a discrepancy.
- The "harness" = a reproducible pipeline (seeded, scripted) so results aren't eyeballed.
- `interviews/` capture methodology/direction calls that are the researcher's to make.
