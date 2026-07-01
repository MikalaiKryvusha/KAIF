---
name: kaif-fork
description: Snapshot this project's evolved KAIF into the user's own GitHub repository and switch version tracking to that fork — so the user develops and versions their own evolution of KAIF independently of the origin. Use when the human says "fork KAIF", "make my own KAIF", "snapshot the framework to my repo", "track my own KAIF", "сделай свой слепок KAIF", "форкни фреймворк под себя".
---

# /kaif-fork — snapshot KAIF into the user's own repo & track it

After living in a project, KAIF often evolves far from origin — locally improved, adapted, extended. At
some point the user wants to **own that evolution**: keep developing and versioning *their* KAIF in
*their* repo, no longer bound to the origin's release cadence. This skill does that in one move.

## Procedure

1. **Gather the current KAIF.** Identify everything that constitutes the deployed framework in this
   project (the core/wrapper: guidance docs, `.claude/skills/` or the agent's equivalent, the `kaif/`
   tools, `.kaif/kaif.json`) — **not** the user's project files and **not** the content artifacts
   (those stay in the project).

2. **Create the user's KAIF repo.** With the human's confirmation, create a new GitHub repo under their
   account (e.g. `gh repo create <user>/<their-kaif-name> --public`). Put the snapshot of the framework
   there as its own self-contained KAIF (carry over `KAIF.md`/`framework/`, tools, README, LICENSE,
   versioning). This becomes the user's origin.

3. **Switch tracking.** Update `.kaif/kaif.json` in the project: set `origin` to the user's new repo and
   `tracking: "fork"`. From now on `/kaif-version` and `/kaif-update` follow the user's fork.

4. **Seed the fork's versioning.** Start the fork's `version.json` from the current version (note it
   descends from origin vX.Y.Z) with today's release date. The fork evolves on its own semver line.

5. **Report & commit.** Tell the human the fork repo URL and that tracking now points to it. Commit the
   `.kaif/kaif.json` change in the project.

## Notes
- This is a branching of lineage: the user's KAIF may diverge from and even surpass the origin.
- To return to the official origin later, use `/kaif-switch-origin` (with a respectful migration).
- Respect attribution: a fork still carries the MIT license and credits KAIF's origin author; the user
  adds themselves as the fork's maintainer.
