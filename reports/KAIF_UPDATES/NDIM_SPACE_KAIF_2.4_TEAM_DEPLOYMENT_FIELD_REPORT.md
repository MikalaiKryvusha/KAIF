# Field report: NDim Space — first field use of /team-deployment (KAIF 2.4) on the live team it was distilled from

**Project:** NDim Space · **KAIF:** 2.4, tracking origin, i18n translated · **Date:** 2026-08-28
· **Author:** the project's agent (Claude Code / Fable 5), answering for this text.
**Delivered to origin:** issue #26.
**Companion:** the update itself is reported separately
(`NDIM_SPACE_KAIF_2.4_UPDATE_REPORT.md`, origin issue #25); this report covers only the TEAM part: reconciling
our live six-role team (running since 2026-08-21) with the new skill's canon, the owner's
decisions, and the written retrospective (operation 5).

## 1. What the skill matched in our живая practice — almost everything, verbatim

The skill says it is "distilled from a live six-role field team". The field team is us, and the
reconciliation proved it mechanically:

- **All nine invariant constitution sections** already exist in our
  `NDIM_WORKTREE_DEV_TEAM_MANIFEST.md` — team map, communication regimen (9 rules, incl. the
  undelivered-message rule our QA paid for), owner escalation via manager only, board, git
  discipline, document numbering (`NEW_<slug>` + manager assigns at merge — our twice-paid
  evening), machine singletons with board locks, context-budget balancing (the owner's own
  2026-08-22 words), launch/stop with fresh-main-first (our two-symptom incident).
- **The board-tool contract: 6 of 6 held** by our pre-existing `tools/team-status.mjs`
  (git-common-dir resolution, role-from-cwd, foreign-row refusal + manager override, lock file
  with 30s abandonment + atomic rename, place≠slot with ports in the holder column — the very
  "paid-for field bug" the contract cites is ours — and `--selftest`).
- **Archetype:** our composition IS `web-product-medium` ("the live field configuration:
  manager + designer + qa + engineer ×3") — the library even names it as such.
- **Anti-pattern check** passed on all eight; no reconfiguration proposed.

Verdict on the distillation quality: high — nothing in the templates contradicts the live
practice they came from, and the parameters left as placeholders are exactly the ones that vary.

## 2. What had to be adapted, and the owner's recorded decisions (interview №051, review page, all answered А)

1. **Naming invariant.** Canon: `<project>-team-<role>`. Ours: `ndim_<role>` — the owner's own
   word of 2026-08-21, predating the canon. Presented as an explicit fork; the owner kept the
   local names (В3 = А). Note for origin: two "owner's words" for one parameter is a real state
   the skill text does not anticipate (ticket `bugs/KAIF/02`).
2. **Document names.** Canon: `TEAM_CONSTITUTION.md` / `TEAM_STATUS.md`. Ours:
   `NDIM_WORKTREE_DEV_TEAM_*` — kept (В5 = А), with a header line declaring the manifest to BE
   the constitution in the 2.4 sense.
3. **Three canon refinements adopted INTO our docs** (В4 = А): explicit
   decides-alone / needs-approval lines per role contract (pasted adapted from the roles
   library, owner's original prose untouched); the board-tool contract copied into the board
   document itself; the eight anti-patterns as a manifest section.
4. The two 2.4 **policy changes** (closure pair, named-time contract) were also ratified by the
   owner on the same page (В1 = В2 = А) — reported in the update report; named here because the
   single review page for policy + team delta worked well as an interaction pattern.

## 3. What hindered or was unclear

1. **No brownfield path** — the skill's operations assume no team exists yet; operation 3
   ("copy the template over") is a trap for a live deployment. The adoption procedure (inventory
   → three-bucket delta → owner decision → apply without overwriting) had to be invented on the
   spot. This is the one real gap; ticket **`bugs/KAIF/02`** (improvement, template B) with the
   smallest-change proposal.
2. Minor: the constitution template's role-contract form uses fields (Mission / Inputs /
   Outputs…) that our prose-form manifest holds implicitly; mapping them required judgment about
   which fields earn their place in an already-working document. We adopted only
   decides-alone / needs-approval / escalates-when — the fields that change behavior — and left
   Mission/Inputs/Outputs as prose. The template might say which fields are the load-bearing
   minimum for adoption vs the full form for greenfield.

## 4. What is missing (wishes for 2.5, by cost descending)

1. **The adopt operation** (see `bugs/KAIF/02`) — one paragraph plus a template-header warning.
2. **Stop-ritual lock hygiene in the constitution template §9:** "release your locks" for roles
   and a manager sweep of locks + waiting-columns at shift close. Paid for here: a stand lock
   and a stale "waiting for QA" row both survived FIVE DAYS past the last shift because the stop
   ritual names commits and reports but not locks. Our manifest now carries it; the template
   should too.
3. **Retrospective cadence hint:** operation 5 says "after a milestone"; a live team that went
   dormant (windows closed, solo sessions continue) is also a retrospective trigger — dormancy
   with unmerged role branches is exactly when organizational debt accrues silently.

## 5. Retrospective (operation 5) — run in writing

Full text (Russian, owner-facing): `reports/TEAM/2026-08-28_org_retrospective_kaif24.md`.
One-line verdict: correctly staffed (archetype match); the manager seat is the loaded one but
below bottleneck; verification gates caught nine real false-greens found independently by
different roles — the canon's independence argument held in the field; the standing debt is not
structure but the unjudged role branches from the shift-5 parking and shift-close hygiene
(locks, waiting columns) — the first fixed by the QA queue at next launch, the second now
written into the manifest.

## 6. Сигналы в исток (signals to origin)

1. `bugs/KAIF/02` — the brownfield-adoption gap (improvement request, with the smallest change
   and its check).
2. Better-than-canon local practice worth upstreaming into the templates: (a) push-locked
   delegation protocol — Tech Lead review by the manager with an explicit rule boundary (roles
   with working push push their OWN branches themselves; only `main` is manager-only) — the
   constitution template §5 carries a short version, ours resolves the boundary question a role
   actually asked; (b) stand capacity as N lock rows with place≠slot separation; (c) the
   re-send throttle in the communication regimen (no repeat message until the addressee has
   been free once).
3. Confirmation signal: the six board-tool contract points were reconstructed from our tool
   INDEPENDENTLY and matched 6/6 — the contract is neither over- nor under-specified for its
   reference implementation.
