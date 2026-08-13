# NDim Space — KAIF 2.1 → 2.2 field update report

> **Created:** 2026-08-14 · **Parent:** KAIF_UPDATE_TASK.md (bootstrap update 2.1 → 2.2) ·
> **Status:** final, written at update close · **Outward:** GitHub issue to the origin
> (MikalaiKryvusha/KAIF), on the owner's word quoted in chat 2026-08-14: «по итогу обновления —
> напиши полевой отчёт разработчику KAIF в GitHub».

Deployment: `sphere programming · language ru · i18n translated (headings included) · tracking
origin · agents claude-code,codex,grok-build,cline,zoo-code · Windows 11 Pro 10.0.26200 · Node
v24.15.0 · PowerShell 5.1 + Git Bash`. Third consecutive update of this deployment
(1.6→2.0→2.1→2.2), all by the bootstrap route.

## 1. Chronology with numbers

Every number below is a command's output from this pass.

1. **Prediction before the pass** (the 2.1 canon, kept): own comparison base built from two release
   bundles — `KAIF-CORE-BUNDLE.md` v2.1 (sha256 `15DDAAF0…`) and v2.2 (sha256 `FB07B47F…`, matches
   the release digest). Template delta 2.1→2.2: `118 files changed, 2959 insertions(+), 240
   deletions(-)`; relevant to this deployment after dropping foreign language packs: **76 files**.
   `node .kaif/kaif-core.mjs diff --source <v2.2 dir>` (run by the OLD 2.1 core): «36 file(s) carry
   upstream static-module changes; 27 — nothing to do» — consistent with the independent base.
2. **Sandbox pass** (`git archive HEAD | tar -x` + `git init`, real bootstrap with local
   `--source`): exit 0, «existing KAIF 2.1 detected — running as an UPDATE to 2.2», task written
   with `11 items, 20 diverged files, 23 files with module diffs`. Mechanical diff: `41 files
   changed, 4081 insertions(+), 489 deletions(-)`. Cyrillic counter per changed md: **0 losses**;
   plans/README.md 582→1296, researches/README.md 656→709 (the ru language pack merged in
   mechanically — the 2.1 i18n hardening works). Duplicate-heading count in the three translated
   key docs: 0/0/0 — the 1.6→2.0 doubling class did not recur.
3. **Battle pass**: same route, same source. Exit 0. Tracked diff `20 files, +2262/−385` + 13
   untracked additions — matched the sandbox prediction file-for-file. Classification line:
   «15 replaced, 0 modules merged in-place, 14 added, 50 kept; 55 module(s) await your merge».
4. **Manual merge**: 55 modules folded, translated, into 23 files (AGENT_GUIDE.md 14 · PHILOSOPHY.md
   3 · BUG_FIXING_FRAMEWORK.md 3 · 3 directory READMEs · 17 skills). Each merge was checked against
   the independent template delta before folding (EXP-0103 discipline); this release the task's
   claims and the true upstream delta AGREED — zero noise items found.
5. **Hooks module wired** (owner's explicit chat opt-in): `.claude/settings.json` created, all three
   Claude Code hooks. Smoke per module README: no marker → JSON order; fresh marker → silence;
   SessionStart → order; all exits 0.
6. **Checkpoints**: all 11 recorded by the machinery (`policy-changes, merge-modules,
   merge-diverged, owner-conventions, local-inventories, project-name, review-news, stale-claims,
   recheck, judge, field-report`). `project-name` recorded «NDim Space» over the technical
   `ndim-space`; one mis-seeded heading fixed (`.kaif/_owner-voice-template.md`).
7. **Mirrors**: hand-merges left 51 + 36 system copies behind; `check` said «15 mirror copies lag
   the canon — normal until re-sync», and the `recheck` checkpoint auto-ran `sync`: «re-synced 152
   system skill copies from the canon» → «manifest satisfied: 79 files + 144 agent artifacts
   present», 0 drift.
8. **New optional tool exercised**: `kaif-requirements-lint selftest` → «6 classes match their ❌
   examples and stay silent on clean ✅ lines»; `check` → «194 file(s), 6 word classes, 0 findings».
9. **Stylometry actualized** (owner's mid-update order): `git mv OWNER_VOICE.md
   AUTHOR_STYLOMETRY.md` (KAIF 2.2 canon name), content replaced by a byte-exact copy of the KAIF
   public snapshot of the accepted core `krinik-stylometry 1.1` (verified: tail vs snapshot —
   byte-identical); consumer registered and pushed in the voice repo's `version.json`. All live
   references re-pointed; chronicles left untouched.
10. **Project health after the pass**: `npm test` 232/232 · `npm run kaif:check` green ·
    `tools/03-kaif-verify.mjs` 35/35 skills (incl. `kaif-go`).

## 2. Rakes

1. **`settings-fragment.json` diverges from the documented Claude Code hook schema.** Severity:
   medium (silent-failure class the module README itself warns about). The shipped fragment wires
   each hook as `"command": "node", "args": ["${CLAUDE_PROJECT_DIR}/…"]`; the documented schema for
   `hooks` takes a single command string (`"command": "node \"$CLAUDE_PROJECT_DIR/…\""`) and no
   `args` field. Verbatim from the fragment:
   `"command": "node",` / `"args": ["${CLAUDE_PROJECT_DIR}/.kaif/hooks/session-start-refresh.mjs"],`.
   Cost here: none — the divergence was caught before merging and the string form was wired (scripts
   themselves are correct and passed smoke). Cost for a weaker session: hooks that never fire while
   looking configured. Not verified live in args-form (would need a throwaway session); classified
   from the vendor schema, so treat as `PLAUSIBLE → verify & fix fragment`. Local remediation:
   string-form config in `.claude/settings.json` + a note in the file and in AGENT_GUIDE.
2. **`update-verify`'s auto-`sync` is the only place mirrors converge, and the deploy summary does
   not say so.** Severity: low. After hand-merging the diverged `.claude` skills, four agent
   systems' copies lag until `update-verify`; the final «✅ KAIF 2.2 deployed mechanically» message
   does not mention `sync`, so an agent that stops before `update-verify` ships drifted mirrors.
   Evidence: `⚠ 15 mirror copies lag the canon (12 more not listed) — normal until re-sync; run
   node .kaif/kaif-core.mjs sync (update-verify re-syncs automatically)`. The warning text is good;
   the wish is one line about it in the deploy-success message / kaif-update skill prose.
3. **`merge-diverged` task item repeats identical boilerplate 20×.** Severity: cosmetic. Twenty
   files each carry the same clause «(translated wholesale — its headings are in the owner's
   language, a by-signature merge is impossible; its template delta ships below)» — ~1.6 KB of the
   sentence repeated. A weak session pays context for it; one sentence + a bare list would carry the
   same information.

No honest-green violations, no owner-work damage, no rollback needed. Notable positives worth
keeping: the task's per-module diffs matched an independently built template base with **zero false
"NEW module" claims** (the 2.0-era noise class is gone); the ru language pack merged translated
modules into a translated deployment correctly; prediction (diff + sandbox) matched battle
file-for-file for the third update in a row.

## 3. Exercised vs NOT exercised

Exercised: bootstrap route on an i18n-translated deployment · `diff --source` preview by the old
core · sandbox dry-run · mechanical classification (replace/add/keep/merge) · all 11 checkpoints ·
`project-name` · hooks module wiring + smoke (Claude Code only) · `sync` / mirror convergence ·
`kaif-requirements-lint` selftest+check · AUTHOR_STYLOMETRY migration path (rename + re-point +
consumer registry) · judge verdict gate · field-report gate · `update-verify` self-clean.

NOT exercised (honest list): the `update` route via the old core · anonymous mode · `--baseline`
synthetic base · pre-update backup restore path · hooks on Codex/Cursor/Copilot/Antigravity (config
samples only) · `stop-status-guard` live firing (needs a real Stop event) · `kaif-provenance` /
`kaif-canon-lint` (unchanged since 2.1, not re-run) · reports/ migration of legacy researches
(15/16 stay as research docs by choice — advisory migration).

## 4. Wishes for the next version (by cost, descending)

1. **Compress `merge-diverged` boilerplate** (rake 3) — one clause, then a plain file list.
2. **Fix `settings-fragment.json` to the documented single-string command form** (rake 1), or ship
   both forms with the schema source quoted.
3. **Name `sync` in the deploy-success message** (rake 2) — one line: «hand-merged files? run
   `node .kaif/kaif-core.mjs sync` or finish with update-verify».
4. **Publish the open dictionary of `kaif-fp` symptom-class slugs** referenced by the /report-bug
   templates — today each deployment invents its own slugs, which weakens cross-project dedup.

## 5. Final state and the judge verdict

`.kaif/kaif.json`: `2.2 · released 2026-08-08 · tracking origin` · history
`1.6→2.0→2.1→2.2 (bootstrap, 2026-08-14T00:08:35+03:00)` · `npm test` 232/232 · `kaif:check` green ·
manifest «79 files + 144 agent artifacts present», 0 mirror drift · hooks wired (owner opt-in) ·
`AUTHOR_STYLOMETRY.md` = accepted core 1.1 snapshot, byte-verified.

Judge verdict, quoted verbatim from the recorded verdict file (decision #46):

> **VERDICT: VERIFIED** — every claim re-checked by observation, none refuted.
>
> Known caveats (named, not hidden):
> - STATUS.md is 659 lines vs the ~200 soft target — a bonsai trim is queued for the next
>   `/end-chat`, not part of this update.
> - The shipped hooks `settings-fragment.json` uses `command`+`args` fields; the documented Claude
>   Code hook schema takes a single command string — wired in the string form, divergence reported
>   upstream.
