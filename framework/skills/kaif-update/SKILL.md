---
name: kaif-update
description: Respectfully update & migrate the KAIF framework deployed in this project to a newer version from the origin repository, preserving local customizations and all content artifacts. Use when the human accepts an update offer, or says "update KAIF", "migrate to the new framework version", "respectful update", "обнови KAIF", "проведи миграцию фреймворка".
---

# /kaif-update — respectful migration update from origin

A newer KAIF version exists upstream (see `/kaif-version`). This skill brings the project's framework up
to it **respectfully**: it never breaks the user's project, preserves their local customizations, and
keeps every content artifact (`bugs/`, `interviews/`, `ideas/`, homework).

> ⚠️ This changes the framework wrapper. Confirm with the human before applying. Commit first so the
> update is a clean, revertable diff.

## Procedure

1. **Pre-flight.** Read `.kaif/kaif.json` (current version, `origin`, `tracking`). If `tracking` is
   `fork`, confirm the human really wants to pull from the official origin (usually they'd update from
   their fork instead). Ensure the working tree is clean (commit/stash first).

2. **Fetch the target version** from `origin`: the new `KAIF.md` (and/or the release asset). The
   self-extracting `KAIF.md` is the single source of truth for what the new version contains.

3. **Diff old → new.** Compare the new framework's guidance docs, skills, and conventions against what's
   deployed. Classify each change: (a) pure framework upgrade (safe to apply), (b) touches a file the
   user customized (needs a careful 3-way merge), (c) new capability (add).

4. **Migrate respectfully:**
   - Apply framework-owned upgrades (skills, guidance-doc templates) — re-derive the deployed wrapper
     from the new `KAIF.md`, in the project's working language and sphere (see `.kaif/kaif.json`).
   - **Preserve the user's customizations** — where they edited a guidance doc, merge rather than
     overwrite; surface conflicts to the human, don't guess.
   - **Never touch content artifacts** (`bugs/`, `interviews/`, `ideas/`, homework) or the user's
     own project files. Only the KAIF wrapper/core is migrated.
   - Refresh the npm `kaif:*` handles if the new version changed them.

5. **Stamp the new version** in `.kaif/kaif.json` (version, released date). Run `npm run kaif:check`
   (the validator) to confirm the result is well-formed.

6. **Report & commit.** Summarize what changed, what was merged, any conflicts left for the human.
   Commit `chore: update KAIF to vX.Y.Z (DATE)`.

## Notes
- The guiding word is **respectful**: the project must stay whole and working at every step.
- If the migration is large or risky, do it on a branch / behind a clean commit so it's easy to revert.
- A heavily diverged project may be better served by a fork (`/kaif-fork`) than by tracking origin.
