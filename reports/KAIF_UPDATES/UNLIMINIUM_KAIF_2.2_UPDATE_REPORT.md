# Field report: KAIF 2.1 → 2.2 update in Unliminium (first fully mechanical pass, lang ru, Windows 11)

> **Created:** 2026-08-14 ≈19:00 +03:00 · **Parent:** `KAIF_UPDATE_TASK.md` (8 items) + `/kaif-update`
> · **Status:** update complete, verified by `/fable-judge` + `update-verify` · **Outward:** this
> report goes to the KAIF developer as a GitHub issue on `MikalaiKryvusha/KAIF` (owner's direct
> request in chat: "по итогу обновления — напиши полевой отчёт разработчику KAIF в GitHub")

**Autocapture:** KAIF 2.1 → 2.2 · project Unliminium (tabletop RPG, public repo) · sphere
game-design · language ru (all guiding docs and skills translated wholesale, deliberate divergence)
· tracking origin · agent system claude-code (Claude Fable 5) · OS Windows 11 Pro 26200 · Node
v24.15.0 · git 2.43.0.windows.1.

## Outcome first

The update **succeeded end to end and the machinery kept every promise it printed.** This was our
first update through `kaif-core update` (2.1 arrived via legacy bootstrap), on the most hostile
deployment shape KAIF supports: every non-vendored file translated wholesale into Russian, so the
machinery could mechanically replace almost nothing — and correctly didn't. Mechanical pass:
**6 replaced · 14 added · 57 kept · 0 modules merged in place**; owner content untouched. The
cognitive pass (one strong-model session + 4 parallel merge subagents) folded the 2.2 template news
into 4 framework docs, 5 directory READMEs and 27 Russian skills by the real `git diff v2.1 v2.2`
of origin templates, translated the new `/kaif-go` skill, wired the optional hooks module (owner's
explicit opt-in in chat), probed and filled the environment dossier, and executed the
`AUTHOR_STYLOMETRY.md` canonical-name migration. Both validators are green (project `kaif:check`:
64 checks; `kaif-core check`: 79-file manifest satisfied).

## What worked — with evidence

1. **Sandbox preview (skill step 2) = the live pass, byte for byte.** `git archive HEAD | tar -x`
   → `git init` → real `update` in the copy. The sandbox printed the same replace/keep/add plan the
   live run later executed, down to the same size-jump warning on `_owner-voice-template.md`
   (5911 → 9173 bytes). This step costs a minute and converts the update from an act of faith into
   a reviewed diff. Keep it a numbered step forever.
2. **Bug 33 fix (CLI safety) verified in the field.** On the OLD 2.1 core, our very first
   exploratory command — a bare-ish `kaif-core.mjs --help` — died with
   `✖ bundle not found: .kaif/install/KAIF-CORE-BUNDLE.md (pass --bundle <path>)`, i.e. the old
   default-to-install behavior the 2.2 policy change describes. On the new core, bare run prints
   the command list and touches nothing (exit 0). The fix landed exactly on the pain we hit.
3. **Wholesale-translation detection is reliable.** All 34 Russian files were recognized
   ("translated wholesale — kept intact; fold the template news in by hand"); not one was
   overwritten. The stale-claims item found 26 real version-claim lines across 8 files — every one
   of them was a genuine 2.1 assertion; zero false positives.
4. **The hooks module wired cleanly on claude-code.** Merged `settings-fragment.json` into
   `.claude/settings.json` after the owner's explicit "yes" in chat. All three scripts pass a
   smoke test with `{}` on stdin; `stop-status-guard` immediately proved itself useful:
   `"this session changed the tree, but STATUS.md was last touched ~266 h ago"` — true, and
   exactly the class of drift the module exists for.
5. **The environment dossier's "probe in EVERY shell separately" rule paid off in the first probe
   round.** Same machine, same PATH string, different worlds: in PowerShell `curl` is an ALIAS for
   `Invoke-WebRequest` and `find` is `C:\Windows\system32\find.exe` (not GNU); in Git Bash `curl`
   is real `/mingw64/bin/curl` and `find` is GNU `/usr/bin/find`. A dossier that probed only one
   shell would have shipped a confident lie.
6. **Russian upstream templates for the shared modules made those merges near-mechanical.**
   `framework/templates/languages/ru/` gave ready Russian diffs for the 5 directory READMEs,
   `KAIF_FRAMEWORK.md` and `skill-triggers.json` — we folded them with local-voice adjustments
   only.

## Friction and signals upstream

1. **`diff --source <bare repo URL>` → unhelpful 404 + libuv assertion abort — reproduced on our
   pass, +1 on issue #10.** `node .kaif/kaif-core.mjs diff --source
   https://github.com/MikalaiKryvusha/KAIF` dies with `✖ download failed (404) —
   …/KAIF/kaif-manifest.json` followed by `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING),
   file src\win\async.c, line 76` (Node v24.15.0, Windows). Reproduced verbatim on both the 2.1
   and the 2.2 core. Since `kaif.json` `origin` stores exactly the bare repo URL, this is the
   first URL every agent tries. Dedup attestation: searched `bugs/KAIF/` (directory did not exist
   yet) and open origin issues (`gh issue list --search "download failed"` → issue #10 already
   names both halves) → **a "+1 observation" comment goes to #10 instead of a new ticket** (posted
   together with this report's issue).
2. **For a wholesale-translated deployment, the update task ships diffs only for the
   placeholder-signature class (5 READMEs); the other 29 diverged files say "fold the news in by
   hand" with no diff attached.** The 2.1 report named this; 2.2 improved the READMEs via ru
   templates, but for skills and framework docs the working procedure is still "clone origin, run
   `git diff v2.1 v2.2 -- framework/skills/<name>/SKILL.md` per file". It works — our whole merge
   ran off that clone — but the task file could at least print the exact upstream path + diff
   command per diverged file, so a weaker session doesn't have to derive the mapping. Smallest
   change: one generated line per diverged file in `KAIF_UPDATE_TASK.md`.
3. **A NEW skill arrives in English into an all-Russian skill set with no task item about it.**
   `kaif-go/SKILL.md` was written mechanically in English; every sibling skill here is Russian.
   The machinery can't translate — fine — but it KNOWS `language: ru` from the marker and knows
   which files it just added. Proposed: when `language ≠ en`, the update task gains an item "these
   N added files arrived in the template language — translate if your deployment translates
   wholesale". We translated `/kaif-go` (its ru trigger aliases from `ru/skill-triggers.json`
   helped; note that file carries aliases only, not a full ru description).
4. **Field reports quote template placeholders — placeholder gates must expect that.** After
   adding `reports/` to our knowledge-dir list, our own project validator's placeholder scan went
   red on the relocated 2.1 report, which quotes `<COMMIT_COMMAND>` as bug evidence. Local
   remediation: `reports/` excluded from the placeholder scan (reports legitimately quote slots).
   Upstream may want the same carve-out wherever its own placeholder gate meets
   `reports/KAIF_UPDATES/`.
5. **`update-verify`'s "promised upstream line" check greps for VERBATIM ru-template lines and
   produced 66 false alarms on a deployment whose READMEs are custom translations.** All five
   directory READMEs here predate the ru language packs and keep their own local voice; the 2.2
   news was folded into them semantically (the judge verified presence by section anchors:
   `bugs/KAIF/`, `NN_EPIC_`, header-meta labels are all on disk). The verifier's own escape hatch
   ("merge them or state why in the judge verdict") worked and the gate passed — but 66 ⚠ lines
   for a healthy merge train a session to ignore that warning class. Proposal: for i18n-translated
   targets, degrade the check to per-module PRESENCE prompts (does a module answering this heading
   exist?) or fold it into the judge item explicitly, instead of verbatim line greps that cannot
   match a translation by design.
6. **The stylometry canonical-name migration composed well with the one-core-per-owner
   architecture — one registry gap found.** We renamed `nikolai_stylometry.md` →
   `AUTHOR_STYLOMETRY.md` via `git mv`, re-pointed every live reference (grep of the whole tree,
   linter comments included; historical documents left verbatim), and re-declared the file as the
   Unliminium GENRE SHELL over the owner's core `krinik-stylometry` v1.1: corpus registry and
   append-only journal added per the 2.2 skeleton, key core invariants folded in as rules (no
   personal-corpus quotes — decision #60 honored, this repo is public). Gap: the core's
   `version.json` `consumers` list names only KAIF; Unliminium now also consumes the core and
   should be registered there so a core change knows its blast radius.

## Numbers

| Quantity | Value |
|---|---|
| Files changed by the framework in the interval | 55 of 79 shipped |
| Mechanical pass | 6 replaced · 14 added · 57 kept · 0 in-place module merges |
| Hand-merged by the real template diff | 4 framework docs · 5 READMEs · 27 skills (22 merged + kaif-go translated + 4 touched by convention) · 3 owner-convention docs |
| Stale version claims found by the task / confirmed real | 26 / 26 |
| Update-task items | 8, all checkpointed |
| Merge workforce | 1 strong-model session + 4 parallel subagents (each fed the per-file upstream diff) |
| Validators at the end | project `kaif:check` 64 checks green · `kaif-core check` manifest 79 files green |

## Policy decisions recorded (the owner's, not the agent's)

- **Hooks module: ACTIVATED** — owner's explicit choice in chat ("Подключить"), fragment merged
  into `.claude/settings.json`.
- **REQUIREMENTS_FRAMEWORK.md adopted as the 14th key doc**; goal vector + acceptance criteria
  woven into the Russian READMEs, planning skills and CLAUDE.md.
- **Language stays Russian everywhere** (standing owner decision of 2026-07-26; the upstream
  "Languages" section did not change in 2.2, decision unchanged).
- **Upstream provenance/canon-lint modules remain NOT wired** — their role is already played by
  this project's own older guards (`rules-provenance.mjs`, 22-check rules linter); a second guard
  on the same border violates Occam.
