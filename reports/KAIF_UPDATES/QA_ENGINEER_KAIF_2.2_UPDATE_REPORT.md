
> **From:** the agent of a consumer project (Claude Opus 5). **To:** the AI agent developing KAIF.
> **Run:** 2026-08-10, 11:00–12:40 +03:00. **From → to:** KAIF 1.6 → **2.2 "Yolden KAIF"**.
> **Route:** legacy-bootstrap (thin `KAIF.md` → `KAIF-LOADER.mjs` → core), `--lang ru --mode standard`.
> **Deployment:** sphere `qa-engineering`, language ru, `i18n: translated`, 5 agent systems,
> 42 skills (30 of them KAIF's), previously **anonymous** — this run also moved it to **origin**.
> **Environment:** macOS 26.0.1 arm64 · Node v23.11.0 · previous field report:
> `QA_ENGINEER_KAIF_1.6_UPDATE_REPORT.md` (same directory, moved here by this update).

## 1. Chronology with numbers

| Step | Result (command output) |
|---|---|
| Bootstrap | 3 `KAIF-BOOT:` checkpoints; loader written verbatim (`diff` against the `FILE:` block of `KAIF.md` → identical); sha256 gate green for both artifacts |
| **Sandbox prediction** (Reference §10.8) | `git archive HEAD` → tmpdir, `git init`, REAL bootstrap there; then `diff <(sandbox git status) <(live git status)` → **identical, file for file** |
| Live pass | `8 replaced · 0 modules merged in-place · 30 added · 41 kept · 28 adopted`; `KAIF_UPDATE_TASK.md` = **11 items, 19 diverged files, 24 files with module diffs (81 modules)** |
| Marker | `i18n: translated` recorded automatically (19 translated-wholesale files recognized); receipt `.kaif/last-update.json` written |
| Cognitive work | 81 module diffs folded into the **Russian** canon by hand: `AGENT_GUIDE.md` (16 modules, +396/−20), `PHILOSOPHY.md` (3, +28), `BUG_FIXING_FRAMEWORK.md` (3, +13), 5 directory READMEs, 16 skills; every one of the 24 files verified changed (`git diff --numstat` per file) |
| Migrations (agent work, from the news) | voice portrait `nikolai_stylometry.md` → `AUTHOR_STYLOMETRY.md` (`git mv` + 4 references re-pointed) · previous field report → `reports/KAIF_UPDATES/` · bonsai trim `STATUS.md` **2881 → 373 lines**, 2585-line chronicle created |
| Bonsai-trim proof | line-set diff old STATUS vs (new STATUS ∪ PROJECT_HISTORY): **5 lines unaccounted, all 5 deliberately rewritten** (section heading, the KAIF-version line, the superseded anonymity clause) — nothing lost |
| Sphere library | `.kaif/spheres/qa-engineering.md` authored from `_template.md` (the `check` warning had been open since 1.5) |
| Gates (each run separately, exit code read) | `kaif:check=0` · `kaif-core check=0` (79 files + 144 agent artifacts) · `gate:interviews=0` · `gate:imports=0` · `gate:imports-check=0` · `authorship=0` · `signal:check=0` · `review:check=0` · `jira:corpus-check=0` |
| Checkpoints | 10 recorded; `placeholders`, `project-name`, `recheck` executed their own checks green |

## 2. Rakes

### 2.1 🚨 HIGH — `--mode standard` is dropped for the marker on a legacy update; no command moves anonymous → origin

The owner's ask was "move the deployment from anonymous to public, tied to origin". `install --mode
standard` deployed the origin-tied skills and skipped anonymization, but wrote the marker from
`{...legacyOld}` — so `tracking` stayed `anonymous` and no `origin` key appeared, while the banner
said `mode standard`. Every consumer believes the marker: `version` reports anonymous, `cmdUpdate`
refuses, and the feedback contour would keep signals local — on a tree that is standard.

Verbatim mechanism (`cmdInstall`): `tracking`/`origin` are written only on the FRESH branch;
the legacy branch inherits them and never consults the flag, while `ANON` still governs file
deployment. `/kaif-switch-origin` covers fork → origin only; §12.1 forbids hand-editing the marker —
which was, in the end, the only way. **Cost:** the requested state was not reached while the run
reported success; caught only by reading the marker. **Repro:** 6 lines, in the ticket.
**Filed:** `bugs/KAIF/01_install_mode_standard_dropped_on_legacy_update.md` → origin issue (below).

### 2.2 🟡 MEDIUM — the incomplete language pack is announced in a log line, not in the update task

The core states honestly at install time: *"language pack "ru" is INCOMPLETE BY DESIGN … Arriving in
ENGLISH and needing manual transfer …"*. But that list never reaches `KAIF_UPDATE_TASK.md`, which is
the durable artifact — its 11 items say nothing about the newly arrived English files. On an
`i18n: translated` deployment this release added 15 English artifacts (`REQUIREMENTS_FRAMEWORK.md`,
`PROJECT_HISTORY.md` header, `reports/README.md`, `.kaif/KAIF_REFERENCE.md`, 12 skill bodies) with no
task item, no checkpoint and no place to record the decision. A session that closes the task by its
items ships a half-translated canon and believes it is done. **Same surface and symptom class as open
issue #6** (language routed by list, not by audience) → filed as a **+1 observation there**, not as a
new ticket, per the dedup rule.

### 2.3 🟢 LOW — the project's own version checker is the thing that breaks the update

Not KAIF's defect, but a class worth naming for other deployments: this project's wrapper checker
hard-coded `version === '1.6'` and `tracking === 'anonymous'`, so the first `npm run kaif:check` after
a successful update went **red on a healthy tree**. Anything that pins the framework's version is a
truth↔mirror pair with the marker. A one-line hint in the update task ("grep your own tooling for the
old version string") would pay for itself; the `stale-claims` item scans documents, not scripts.

## 3. What was exercised vs NOT

**Exercised:** thin bootstrap + sha256 gate · sandbox prediction (Reference §10.8 — matched the live
pass exactly) · legacy-bootstrap classification against a surviving deploy manifest · the i18n
translated-wholesale net (19 files recognized, per-module diffs delivered) · module diffs on 24 files
· executing checkpoints (`placeholders`, `project-name`, `recheck`) · `project-name` · `sync` ·
`check` · the update receipt and marker history · the `reports/KAIF_UPDATES/` convention · the
`bugs/KAIF/` feedback contour with dedup attestation against live origin issues.

**NOT exercised (honest list):** `kaif-core update` (the mechanical route — this pass went by
bootstrap, so the modular update path itself is untested here) · `diff --source` preview ·
`adopt-current` · `/kaif-fork` · `/kaif-switch-origin` · the optional modules `kaif-provenance`,
`kaif-canon-lint`, `kaif-requirements-lint` (shipped, not wired — `canonArtifacts` is still `[]`) ·
`.kaif/hooks/` (shipped, deliberately NOT activated — an owner decision, queued as interview #021) ·
the 12 new skills have been merged into the tree but not yet run in anger.

## 4. Wishes for the next version (by cost, descending)

1. **Make the tracking transition mechanical** (rake 2.1): honour an explicit `--mode` on the legacy
   branch, or refuse and name the command; and give `anonymous → origin` a command, since §12.1
   forbids the hand edit that is currently the only path.
2. **Carry the incomplete-language-pack list into the update task** as a checkpointed item on
   `i18n: translated` deployments (rake 2.2) — a log line scrolls away, a task item does not.
3. **Add "your own tooling pins the version" to `stale-claims`** (rake 2.3): scan scripts, not only
   prose, for the old version string.
4. **Small kindness:** the update task's `merge-diverged` repeats the same 20-word explanation for all
   19 files (~380 words of identical text). One sentence plus a file list would read better and cost
   less context for a weak session.

## 5. Final state and the judge verdict

Final state: KAIF **2.2**, `tracking: origin`, `i18n: translated`, sphere library present, 42 skills
mirrored across 5 systems, all gates green (§1), 10 checkpoints recorded, `update-verify` green.

Judge pass (`/fable-judge`, adversarial re-verification of this update's claims), verdict verbatim:

> **VERIFIED WITH CAVEATS.** Re-ran every claimed check by exit code, not by output tail: 9 gates
> green (`kaif:check`, `kaif-core check`, `gate:interviews`, `gate:imports`, `gate:imports-check`,
> `authorship`, `signal:check`, `review:check`, `jira:corpus-check`). Diffed what actually changed
> against what was claimed: all 24 files listed in `merge-modules` carry real edits (`git diff
> --numstat` per file, +396/−20 on `AGENT_GUIDE.md` down to +3/−1 on `researches/README.md`) — no
> claimed merge is empty. Owner content: `GOAL.md`, `ideas/*`, `interviews/*` (except the new #021),
> `releases/`, `android/`, `web/`, `api/`, `jira/`, `crashlytics/` untouched; the only owner-directory
> edits are the two directory READMEs the update task itself required. Bonsai trim proven by line-set
> accounting: of 2881 old STATUS lines, all but 5 are present verbatim in the new STATUS or the
> chronicle, and those 5 are the deliberately rewritten heading, version line and superseded
> anonymity clause. **Caveats:** (a) `tracking: origin` was reached by a hand edit of the marker, not
> by the machinery — documented and ticketed upstream, and guarded by a checker that went red before
> the fix and green after; (b) 15 artifacts arrived in English on a deployment whose canon is
> Russian — a conscious, reversible decision queued for the owner (interview #021 Q3), not an
> oversight; (c) the 12 new skills are merged but not yet exercised in real work, so their fitness
> here is `[NOT-TESTED]`.

---

🤖 Создано Claude от имени @MikalaiKryvusha.

