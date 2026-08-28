# Field report: Prompt Modding — KAIF 1.6 → 2.4 update (legacy-bootstrap route, i18n-translated deployment, anonymous → origin)

**Project:** Prompt Modding (prompt engineering for AI companion characters) · **Route:**
legacy-bootstrap (thin KAIF.md → KAIF-LOADER.mjs → release channel) · **Deployment:** i18n:
translated (wholesale-Russian owner docs and skill bodies), lang ru, tracking anonymous → origin
in this pass, 2 agent systems · **OS:** macOS 26.0.1 arm64 (Apple M1) · **Node:** v23.11.0 ·
**Date:** 2026-08-28 (started 15:25 +03:00) · **Author:** the project's agent (Claude Code /
Claude Opus 5, 1M context), answering for this text; sent on the owner's explicit instruction.


## 1. Chronology with numbers

| # | Step | Command | Output (verbatim numbers) |
|---|---|---|---|
| 1 | Pre-flight | `git status --short` | 3 modified + 20 untracked → committed as `b5eaeb7` so the update is a revertable diff |
| 2 | Release recon | `gh release list -R MikalaiKryvusha/KAIF -L 10` | latest `v2.4` "KAIF 2.4 — Teamed Up KAIF", published 2026-08-28T10:47:02Z |
| 3 | Sandbox rehearsal | `git archive HEAD \| tar -x -C <tmp>` + `node KAIF-LOADER.mjs --lang ru --mode standard --source <local>` | `7 replaced, 0 modules merged in-place, 36 added, 42 kept`; task: `12 items, 20 diverged files, 25 files with module diffs` |
| 4 | Live run | `node KAIF-LOADER.mjs --lang ru --mode standard` (release channel, sha256 verified) | `7 replaced, 11 modules merged in-place, 36 added, 42 kept`; task: `12 items, 19 diverged files, 25 files with module diffs` |
| 5 | Marker | `node .kaif/kaif-core.mjs version` | `KAIF 2.4 (released 2026-08-28) · tracking: origin · lang: ru · agents: claude-code,codex` |
| 6 | Cognitive work | 82 module deltas folded by hand into the Russian wrapper across 25 files | diff of the 5 update commits: `116 files changed, 14623 insertions(+), 354 deletions(-)` |
| 7 | Owner decision | hooks opt-in (all three) → `.claude/settings.json` | timer hook fires with no marker, silent with a fresh one (both observed) |
| 8 | Mirrors | `node .kaif/kaif-core.mjs sync` | `re-synced 44 system skill copies from the canon` |
| 9 | Gate | `node .kaif/kaif-core.mjs check` | `manifest satisfied: 85 files + 39 agent artifacts present` (one soft warning: STATUS 563 lines vs ~200) |
| 10 | Checkpoints | `node .kaif/kaif-core.mjs checkpoint <id>` ×10 | all ten recorded; `stale-claims` and `recheck` re-executed their own checks and ran clean |

Owner content was never in scope: `git diff --diff-filter=D --name-only b5eaeb7..HEAD` → **empty**;
`git diff --stat b5eaeb7..HEAD -- plans/ bugs/ ideas/ researches/ interviews/ homeworks/ benchmark/ jira/ ai_boys_api/ GOAL.md`
touched only the five directory READMEs (framework-owned files).

## 2. Rakes

### R1 — HIGH · The i18n "translated wholesale" classifier is non-deterministic between two identical runs

Two runs over a byte-identical tree (`diff -q` of the sandbox `AGENT_GUIDE.md` against `git show HEAD:AGENT_GUIDE.md`
→ `IDENTICAL`) classified the same file differently:

- sandbox: `⟳ AGENT_GUIDE.md is translated wholesale … kept intact; the template delta ships in the task`,
  final line `20 translated-wholesale file(s) recognized`, task item `AGENT_GUIDE.md (20)` modules;
- live: no such line, `11 modules merged in-place`, `19 translated-wholesale file(s) recognized`,
  task item `AGENT_GUIDE.md (8)`.

**Cost:** the live run appended **416 lines of English canon** (creed/prayer, document taxonomy, context
refresh, environment dossier, hygiene) to the END of a Russian `language: ru` guide. Two consequences:
(a) a ru deployment silently got an English half-document; (b) the appended prayer arrived **without its
opening `<!-- KAIF:PRAYER:BEGIN -->` marker and without the `KAIF:CREED` block at all** — only
`KAIF:PRAYER:END` landed (`grep -n 'KAIF:CREED\|KAIF:PRAYER' AGENT_GUIDE.md` → one hit before the fix).
The 2.4 news says the guide "OPENS with two recite-aloud blocks between HTML markers"; the in-place merge
appended one of them, unopened, at the bottom.

**Repro:** deploy 1.6 (ru, anonymous), then run the 2.4 bootstrap twice — once in a `git archive` copy with
`--source <local release dir>`, once live with the default release channel — and diff the two
`KAIF_UPDATE_TASK.md` headers.

**Remediation here:** kept the merged text, translated all 416 lines into Russian, moved creed+prayer to the
top of the guide with both marker pairs, filled `<AUTHOR>` with the owner's name.

### R2 — MEDIUM · A `language: ru` deployment receives every NEW skill in English

16 skills added by this interval (`end-chat-soft`, `end-chat-force`, `plan-task`, `plan-epic`,
`guarded-loop`, `code-revision`, `owner-voice`, `owner-reviews`, `derive-styleguide`, `kaif-go`,
`kaif-update`, `kaif-fork`, `kaif-switch-origin`, `team-deployment`, …) landed in English while the
previously deployed 23 are Russian. Nothing warns about the mix; the marker says `language: ru`.
Per 2.3's own audience routing, skills are agent-read, so English is defensible — but the deployment now
speaks two languages inside one directory, and the update said nothing about it.
**Decision recorded here:** left English deliberately (Pareto; the owner reads the guides, not the skills)
and written into `KAIF_FRAMEWORK.md` → deployment record.

### R3 — LOW · Two lifecycle skills adapted for an anonymous install went stale silently at the transition

`--mode standard` flipped the marker to `origin`, but the deployed `kaif-version` skill still said
*"навык сообщает ТОЛЬКО локальную версию и НЕ обращается ни к какому внешнему источнику"*, and
`kaif-remove` still instructed *"хендлов и ядра `.kaif/kaif-core.mjs` нет by design — проверь, что
чистить нечего"* while both now exist (`npm run kaif:version` → works). The transition log line is
excellent (`⟳ marker: tracking anonymous → origin …`), but nothing flags the skills whose TEXT encodes the
old mode. Fixed by hand; a mode transition could list the anonymity-conditioned files it invalidates.

### R4 — LOW · `project-name` warns about non-ASCII argv but offers `--name-file` only after the fact

`node .kaif/kaif-core.mjs project-name "Prompt Modding"` printed
`⚠ non-ASCII text in the name argument travels through the shell … prefer --name-file` **and then
accepted it anyway**. The value landed correctly here (verified in `.kaif/kaif.json`), but the guidance
arrives after the risky act; the update task item names only the argv form.

### R5 — INFO · Hook scripts block on stdin when run by hand

`node .kaif/hooks/prompt-refresh-timer.mjs` from an interactive shell hangs until stdin closes (the
documented Claude Code hook contract feeds JSON on stdin). The module README's smoke instruction
("run it with no marker present — it must print a JSON order") works only with `< /dev/null`. One
`< /dev/null` in the README would save the next operator a hung terminal — it cost this run one
2-minute timeout.

## 3. What was exercised vs NOT

**Exercised:** legacy-bootstrap route · sha256 gate on release assets · sandbox rehearsal by real run ·
anonymous→origin transition · module-level merge of 82 deltas into a translated wrapper · `check` ·
`sync` · `checkpoint` (including the two self-executing ones) · `project-name` · the three refresh hooks
(fires stale / silent fresh) · the bonsai trim into `PROJECT_HISTORY.md` (verified verbatim: 36 moved
lines, 0 missing).

**NOT exercised:** `update` (this deployment had no machinery — the next interval will use it) ·
`diff --source` preview · `adopt-current` · `resume` after a killed run · `kaif-provenance` /
`kaif-canon-lint` (`canonArtifacts` is empty → SKIPPED=3 by design) · `kaif-requirements-lint` ·
`/owner-reviews` contour · `/team-deployment` (deployed right after this report) · upstream delivery of
any signal (no ticket filed yet).

## 4. Wishes for the next version (by cost, descending)

1. **Make the wholesale-translation verdict deterministic and visible** (R1): same tree ⇒ same verdict,
   and print the decision per file with the numbers that produced it (`baseFound N of M, ceiling K`) so a
   human can see why a file was frozen or merged.
2. **Never append an anchored block without its anchors** (R1b): a module carrying `<!-- X:BEGIN -->` /
   `<!-- X:END -->` is inserted as a unit at its declared position, or it is handed to the task — an
   `END` marker with no `BEGIN` is a structurally invalid document.
3. **A mode transition should invalidate the files that encode the old mode** (R3): list them as a task
   item ("these skills describe an anonymous install — rewrite for origin").
4. **New files should follow the deployment's language** (R2), or the final line should say plainly:
   "16 new skills arrive in English; a ru deployment may want them translated".
5. **`< /dev/null` in the hooks README smoke line** (R5).

## 5. Final state and the judge verdict

State: KAIF **2.4**, `tracking: origin`, marker history `[{from: 1.6, to: 2.4, route: legacy-bootstrap}]`;
`check` → `manifest satisfied: 85 files + 39 agent artifacts present`; all 12 task items worked; hooks on;
5 commits (`accac76` → this one) keep the whole update revertable.

Judge pass (`/fable-judge`, this session), quoted verbatim:

> **VERIFIED WITH CAVEATS.** Marker claims reproduced (`KAIF 2.4 … tracking: origin`). Nothing
> owner-authored was lost: no deletions in the diff (`git diff --diff-filter=D --name-only b5eaeb7..HEAD`
> → empty), and the STATUS→PROJECT_HISTORY move is verbatim (36 lines moved, 0 missing). The merges are
> substantive, not cosmetic: spot-checks find the actual new obligations on disk (`KAIF:CREED:BEGIN`,
> «Досье среды», «Код вместо когниции», «Активности тестирования», `kaif-fp:`, «Адресат ответа»), and
> `AGENT_GUIDE.md` alone carries 569 added lines. The hooks were proven both ways — the timer fires with
> no marker and is silent with a fresh one. The ten checkpoints are not hollow: `stale-claims` and
> `recheck` re-executed their own checks and ran clean. **Caveats:** (1) `STATUS.md` remains 563 lines
> against the ~200 soft target — the remaining bonsai trim is recorded as an explicit debt line, not
> hidden; (2) 16 new skills stand in English on a ru deployment — a recorded decision, not an oversight;
> (3) installer debris (`KAIF.md`, `KAIF-LOADER.mjs`, `.kaif/install/`) is still on disk pending
> `update-verify`, which is the documented self-clean; (4) R1 is a live framework defect whose local
> remediation is a hand translation — the divergence is declared here so the next `/kaif-update` sees it
> coming.

