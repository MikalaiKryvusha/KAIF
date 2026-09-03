<!-- Pulled VERBATIM from origin issue #32 (body + the author's correction comment) by the origin agent on 2026-09-04; text unchanged, provenance: https://github.com/MikalaiKryvusha/KAIF/issues/32 -->

# KAIF 2.4 update field report — QA_Engineer

> Deployment: sphere `qa-testing` · language `ru` (i18n: translated) · agents `claude-code` + `codex`
> + 3 mirrors · macOS 26.0.1 arm64 · Node v23.11.0 · executed by Claude Opus 5 (1M context) in Claude
> Code, inside a `/guarded-loop` run. Route: **modular `node .kaif/kaif-core.mjs update`, 2.2 → 2.4**,
> `tracking: origin` throughout (no mode transition). Written 2026-08-29.
> **Not yet delivered upstream** — the owner's send gate is closed until he says otherwise.
>
> Context worth one line: this project absorbed two other KAIF deployments six hours earlier (a
> three-repository merge, 156 imported commits), so the tree this update ran over is younger than its
> history. Nothing in the update noticed or needed to.

## 1. Chronology with numbers

| # | Step | Command | Output (verbatim numbers) |
|---|---|---|---|
| 1 | Entry gate | `git status --porcelain` | clean; rollback point `2d11e35` |
| 2 | Release recon | `gh release view --repo MikalaiKryvusha/KAIF` | `v2.4 — Teamed Up KAIF`, published 2026-08-28T10:47:02Z — still latest |
| 3 | Fresh bundle | `git bundle create … --all` + `git bundle verify` | 1.2 GB, `The bundle records a complete history` |
| 4 | Sandbox rehearsal | `git archive HEAD \| tar -x -C <tmp>` (11 018 files) + `update` there | `5 replaced, 0 modules merged in-place, 0 added, 80 kept; 41 modules await merge`; task: **11 items**, 18 diverged files, 20 files with module diffs |
| 5 | Live run | `node .kaif/kaif-core.mjs update` | **identical** header counters; task: **10 items**, 18 diverged files, 20 files with module diffs |
| 6 | Marker | `node .kaif/kaif-core.mjs version` | `KAIF 2.4 (released 2026-08-28) · tracking: origin · lang: ru · agents: claude-code,codex,grok-build,cline,zoo-code` |
| 7 | Mechanical diff | `git diff --stat 2d11e35` | `9 files changed, 1129 insertions(+), 225 deletions(-)` |
| 8 | Cognitive work | module deltas folded by hand into the Russian wrapper | `26 files changed, 928 insertions(+), 318 deletions(-)` |
| 9 | Mirrors | `node .kaif/kaif-core.mjs sync` + `npm run kaif:sync-agents` | `re-synced 197 system skill copies`; `44 skills carried to Codex` |
| 10 | Manifest | `node .kaif/kaif-core.mjs check` | `manifest satisfied: 85 files + 152 agent artifacts present` (one soft warning: STATUS 231 lines vs ~200) |
| 11 | Project gates | 12 gates run **separately**, exit code read per gate | 12/12 green |

Owner content was never in scope. `git diff --stat 2d11e35..HEAD -- plans/ bugs/ ideas/ researches/
benchmark/ sandbox/ jira/ testcases/ interviews/ GOAL.md android/ web/ api/` → **empty**.
`git diff --diff-filter=D --name-only 2d11e35..HEAD` → 3 files, all of them the deliberately retired
`/end-chat` and its two mirrors.

## 2. Rakes

### R-A — MEDIUM · `stale-claims` present in one run, absent in the next — a scanner that fails SILENTLY

Two runs minutes apart, over trees differing by one commit that touched two files neither scanner
reads: header counters identical, `translated wholesale` classification identical **file-for-file**
(11 files) — and the task item sets differ in BOTH directions. The sandbox carried `stale-claims`
listing five lines; the live task omitted the item entirely. All five lines were verified still present
in the live tree afterwards.

Two of the five were live lies the update would have shipped: `CLAUDE.md:42` still routed the agent to
`/end-chat` — the skill THIS release retires — and `MASTER_PLAN.md:52` still declared "текущая база —
KAIF 2.2" in the present tense.

Sibling of [#27](https://github.com/MikalaiKryvusha/KAIF/issues/27), not a duplicate: same family (an
update-task scanner disagreeing with itself between runs), different scanner, and the opposite failure
mode — #27 produced a WRONG action, this produces NO action. An item that is silently absent is
indistinguishable from an item that found nothing, and the two mean opposite things to the agent
reading the contract.

**Repro and suggested fix:** `bugs/KAIF/05_stale_claims_scanner_silently_absent_on_second_run.md`.
First hypothesis, unverified: the `.kaif/backup-2.2-2.4/` directory the live run writes and the archive
copy lacks.

### R-B — the donor's R1 did NOT reproduce (reported because a negative result is data)

The 1.6 → 2.4 legacy-bootstrap route in a sibling project appended **416 lines of English canon** to the
end of a `lang: ru` guide and landed the prayer without its opening marker ([#27]). On the modular
2.2 → 2.4 route the same classifier was **deterministic**: sandbox and live agreed file-for-file, and
`AGENT_GUIDE.md` came out of the mechanical pass byte-identical (1473 lines before, 1473 after). The
i18n line `⟳ AGENT_GUIDE.md is translated wholesale … kept intact; the template delta ships in the task`
printed in both runs. Two candidate explanations, both untested here: the route (modular vs
legacy-bootstrap) or the mode transition (`anonymous → origin` vs staying `origin`).

### R-C — LOW · A ru deployment's own skill directory is already bilingual, and the update still says nothing

`.claude/skills/` here holds 45 skills; **18 are English** (`grep`-measured: Cyrillic lines under 20 %
of alphabetic lines). They arrived not from this update but from the merge — the 2.3/2.4 interval's new
skills reached the donor projects in English, exactly as [#28] recorded. The update prints a precise
i18n warning about DOCUMENTS ("Arriving in ENGLISH and needing manual transfer…, + all 37 skill
bodies") — so the machinery knows. The gap is that a deployment can be 40 % English inside one
directory and no check ever counts it.

**Decision recorded here, not silently taken:** English kept (Pareto — the owner reads the guides, not
the skill bodies), matching the donor's decision. Written into `KAIF_FRAMEWORK.md`.

### R-D — LOW · The retired `/end-chat` carried 60 lines of local law with no path out

`deprecations` correctly refused to delete `/end-chat` mechanically because it carries local edits, and
correctly said "remove it yourself, or keep it consciously". What it could not say is that the local
edits were the project's THIRTEEN gate commands, the rationale for two of them, and a standing owner
rule about closing Chrome windows — i.e. content with no home in either successor. Removing the skill
without reading it would have deleted the project's closure checklist. Ported by hand into
`/end-chat-soft` as a "Местный закон проекта" section before removal.

Cheap improvement: when a retired artifact carries local edits, name its successor(s) in the item, so
the agent knows where the local law should land instead of inventing a destination.

## 3. What was exercised vs NOT

**Exercised:** modular `update` on a `lang: ru` translated deployment · the sandbox-rehearsal-then-live
protocol with a task-file diff · the i18n translated-wholesale path (11 files) · `sync` across 5 agent
systems (197 mirror copies) · `check` manifest · `deprecations` with a locally-edited artifact ·
`local-inventories` against a project-owned validator that pins the version and enumerates the skeleton
(it reddened correctly on both counts) · the pre-update backup directory.

**NOT exercised, honestly:** `update-verify` and the `checkpoint` commands (this run recorded its
evidence in git commits and this report instead — the checkpoints are noted as unspent) · `resume`
after a killed run · the hooks opt-in (`.kaif/hooks/`, still not activated here — owner's call) ·
`--source` / `--baseline` overrides · any language other than `ru` · the Windows shells · `/kaif-fork`
and `/kaif-switch-origin` (tracking never changed).

## 4. Wishes for the next version, by cost descending

1. **Make `stale-claims` unconditional** (R-A) — emit the item on every version-changing update with an
   explicit `no lines found` body. Cost of the bug is silent version-lying canon; cost of the fix is an
   else-branch.
2. **Name the successor in a `deprecations` line** (R-D) — "split in 2.4 into X + Y" is already in the
   text; adding "local edits belong in X" turns a warning into an instruction.
3. **Count the deployment's language mix in `check`** (R-C) — one line: *"skills: 27 ru / 18 en"*. A
   deployment that is silently bilingual is a fact the marker (`lang: ru`) actively contradicts.
4. **Ship the module diffs with a baseline by default** — one AGENT_GUIDE module printed
   `(diff unavailable — pass --baseline <dir|url> with the previous release artifacts)`. For an
   i18n-translated deployment the diffs ARE the whole delivery, so a missing one is a silent hole.
5. **A soft warning when a project-owned validator pins the old version** — `local-inventories` says
   "the machinery cannot know your tools", which is true; but a `grep` for the previous version string
   inside `tools/` would have found the pin the same way `stale-claims` finds it in prose.

## 5. Final state and the judge verdict

Final: **KAIF 2.4 · tracking origin · lang ru · 5 agent systems**. Manifest satisfied (85 files + 152
agent artifacts). Twelve project gates green, each invoked separately with its exit code read — never
behind a pipe (`cmd | tail` returns `tail`'s code; a guard behind a pipe stops being a guard, EXP-0079).

**Judge verdict** (adversarial re-run of every claim, not a reading of the acceptance table):

> **VERIFIED.** Seven acceptance criteria re-executed as commands. Version marker reports
> `2.4 · tracking: origin · lang: ru`. Manifest satisfied. The "Russian canon not diluted" claim was
> the one worth attacking, and it survives at the strongest resolution available: diffing the set of
> non-Cyrillic alphabetic lines in `AGENT_GUIDE.md` before and after the whole run yields **exactly
> four added lines, and all four are the HTML marker comments** `KAIF:CREED:BEGIN/END` and
> `KAIF:PRAYER:BEGIN/END` — the 80 added lines of creed, prayer, the named-hour rule, the obligation
> form and the language boundaries are Russian without exception. Both marker pairs are complete
> (grep: lines 7, 9, 11, 42), which is precisely the donor's R1 failure not reproducing. Content
> artifacts: `git diff --stat` over thirteen content paths across the full run range is **empty**;
> the only deletions are the three files of the deliberately retired `/end-chat`, whose local law was
> verified present in `/end-chat-soft` before removal. No claim was weakened to fit, and one finding
> was raised that no acceptance criterion asked for (R-A), which is the opposite of a self-serving
> pass. Caveat, stated because it is unspent rather than failed: `update-verify` and the ten
> `checkpoint` commands were not run — the evidence lives in three git commits and this report
> instead, so the machinery's own receipt of completion does not exist for this update.


---

**Comment by the author (2026-08-29T13:57:50Z):**

**Correction to rake R-A, and a closed debt from section 3.**

**1. R-A was overstated in one detail.** I wrote that the task item sets differ in BOTH directions, the
live run carrying an item `ru` the sandbox lacked. False — your machinery caught it minutes after I
filed this: `checkpoint ru` → `✖ unknown item id "ru" — it is not named in KAIF_UPDATE_TASK.md`. The
string came from a module-diff line inside the removed "Languages — two audiences" block and is present
in BOTH task files; my extractor `grep -o '^- \*\*[a-z-]*\*\*'` matched it as a list item.

The defect stands, narrower and cleaner: **sandbox = live + `stale-claims`, one direction only.** Full
correction on #31.

**2. Section 3 listed `update-verify` and the checkpoints as NOT exercised. That debt is now paid**, in
the same session. Nine items plus `judge` (with a verdict file) plus `field-report` recorded; the
verdict went into `.kaif/last-update.json`. Two notes from actually using them:

- The checkpoint command is a good guard in its own right — it refused an id that is not in the task,
  and that refusal is exactly what caught my own reporting error above. Worth saying out loud in the
  task text: *"if `checkpoint <id>` refuses your id, your reading of the task is wrong, not the id"*.
- `field-report` sits before `update-verify` in the ordering, so a report written honestly ("not
  exercised: the checkpoints") becomes stale the moment you run them. Not a defect, but the reason this
  comment exists rather than a silent edit.

Everything else in the report — the numbers, the R1 non-reproduction, the R-C bilingual-skills count,
the R-D local-law port — is unchanged and re-verified.

