# Brief — reply drafts for the origin tickets after the release of KAIF 2.9

> Written for: subagents drafting replies; the session that sends them reads the drafts before sending.

You draft the reply comment to GitHub issues of `MikalaiKryvusha/KAIF` (the KAIF origin) after the release
**KAIF 2.9 — Distilled KAIF** (tag `v2.9`, page https://github.com/MikalaiKryvusha/KAIF/releases/tag/v2.9,
release date 2026-10-16). The release is about to be published; write as if it is out.

## Rules of silence (hard)

- No browsers, no windows, no sound. Never run `tools/review.mjs`, `npm run test:core`, `tools/verify-contour.mjs`,
  `tools/build-framework.mjs`, any `tools/sandbox/*` suite or probe. Never set `KAIF_DIST`.
- Never edit, stage, commit or push anything except writing your own draft files `reports/release_2.9/<number>.md`.
- Never post to GitHub. Reading an issue is allowed: `gh issue view <n> --repo MikalaiKryvusha/KAIF --comments`.

## Sources of truth (read, never guess)

- The release notes `reports/RELEASE_NOTES_2.9.md` (what shipped, in the owner-accepted words).
- The meta-plan `plans/126_EPIC_kaif_2.9.md` and the epic plans `plans/127`–`plans/135` (which ticket each criterion closes, with the
  proof: suites `tools/sandbox/s*.mjs`, probes, run reports `testcases/reports/*.md`).
- The recon `researches/35_kaif_2.9_scope_recon.md` (+ the folder of the same name) — the disposition of each ticket #108–#131.
- The next-version scope `ideas/32_kaif_2.10_scope.md` — what was deferred to 2.10 (including decision №146: #139 · #142 rule · #133 ·
  #141 in 2.9; #136 · #137 · #140 · #142 length warning in 2.10; #134 · #135 · #138 receipts; #135 R1 → `bugs/130`).
- The code itself (`framework/**`) when you state a behaviour: quote the function or line you rely on.
- The form: the 2.8 replies `reports/release_2.8/*.md` (e.g. `104.md`, `107.md`, `79.md`) — follow their shape.

## Shape of a reply (English, Markdown; one paragraph = ONE line — GitHub shows a single newline as a break)

1. First line: `Shipped in [KAIF 2.9 — Distilled KAIF](https://github.com/MikalaiKryvusha/KAIF/releases/tag/v2.9):` — or, for a
   deferred ticket, `Not in [KAIF 2.9 — Distilled KAIF](…v2.9) — it is in the list of the next version, 2.10:`; for a field report,
   `Thank you for the field report. What it brought into [KAIF 2.9 — Distilled KAIF](…v2.9):`.
2. Bullets: each item of the ticket → what shipped (file, command, rule — by name), or that it did not ship and where it went.
   Answer EVERY numbered item or R-number of the ticket; an item left unanswered is a defect of the reply.
3. `What your side does:` — the concrete step for the field agent after updating (if any).
4. `Proof:` — suite and case names, probe, run report path; red on which prior build, if the plan says so.
5. `Boundaries, said plainly:` — what is NOT covered. Never claim wider than the proof (KAIF's fifth obligation).
6. Last line (only for a ticket that stays OPEN): say so — `This ticket stays open until 2.10 ships it.`

## Disposition (write it as the FIRST line of the file, as an HTML comment, before the reply)

`<!-- disposition: close | keep-open — <one-line reason> -->` — close: shipped fully, or a field report (its receipt closes it),
or closed by a decision (e.g. #138 by №144 — the hook was withdrawn). keep-open: deferred to 2.10 wholly or the main part of it.

## Hard bans

- Name NO field project (no project names from titles such as the names of deployments; say "your deployment", "a field project").
- No owner quotes that are not already public in the ticket itself or in the release notes.
- No numbers you did not read in a source; no "fixed" without naming where.
- English only; no Cyrillic in the reply (quote a Russian phrase only if the ticket itself quotes it).
