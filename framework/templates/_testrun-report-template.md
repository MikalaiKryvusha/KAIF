# Test run report — <WORK / FEATURE / SUITE>

> **How to use this file.** COPY it into the reports catalog of the project's test-doc home
> (default `testcases/reports/`, created on first use; a project may name another home in
> `.kaif/kaif.json` → `testdocs`) as `<YYYY-MM-DD>_<work-slug>.md` — the date-first name IS the
> index — then fill every `<PLACEHOLDER>`; never fill this template in place. The rule that
> produces this document is `TESTING_FRAMEWORK.md` → "An executed run produces its report"; the
> form is judged by `node .kaif/tools/kaif-testrun-lint.mjs check` (seven fields, none empty; Runs
> with a command and a moment per run; Found as a list or an explicit "none"; a named Verdict).

**Created:** <YYYY-MM-DD HH:MM ±HH:MM> · **Run by:** <the agent / the model, or the human> ·
**Version/build:** <...>

## 1. Work

<What was tested and against which basis: the feature or change, the case set
(`testcases/TC_<feature>_<slug>.md`), the plan or the ticket. One paragraph.>

## 2. Contour

<The part of the system under test and the stand it ran on: environment, build identity, data
state — and the `REAL WORLD:` difference line when production is involved.>

## 3. Runs

<How many runs, WHEN each ran — a timestamp per run — and the exact command of each, in a code
span, verbatim as typed, so the reader can re-run it.>

| # | Moment | Command | Exit / outcome |
|---|---|---|---|
| 1 | <YYYY-MM-DD HH:MM ±HH:MM> | `<command as run>` | <exit code · one-line outcome> |

## 4. Checks

<What was verified, case by case, with the status `pass` · `fail` · `blocked` · `skipped` and the
observation named (what was seen). Cite the case ids of the case set where one exists.>

| Case | Status | Observation |
|---|---|---|
| <C1 / the assert / the screen> | <pass / fail / blocked / skipped> | <what was seen> |

## 5. Found

<Defects found — one list item per defect with its bug-doc address (`bugs/NN`) — or the explicit
word `none`: zero is a finding, silence is not.>

- <bugs/NN — one line, or the word none>

## 6. Traces

<Where the evidence lives: log files, screenshots, artifacts, session transcripts — paths or
addresses the reader can open.>

- <path or address>

## 7. Verdict

<`pass` · `fail` · `blocked` · `partial` — one of the four, then the reason in one sentence. A
`[TESTED: …]` marker that cites this run names this file.>
