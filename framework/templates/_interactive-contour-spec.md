# INTERACTIVE CONTOUR — the one-page executable contract (KAIF 2.6, epic IC)

<!-- Ships as .kaif/INTERACTIVE_CONTOUR_SPEC.md (bundle-only). This page is the CONTRACT every owner-facing
page must satisfy — the shipped generator (.kaif/tools/contour/, 2.6) implements it; a project that still
runs its own contour checks it against these lines BEFORE opening a page to the owner. The long-form canon
(43 invariants, build contract C1–C13, traps T1–T11) stays in the /owner-reviews skill; this page is the
part a session can verify in one minute. Origin: field tickets #19 #38 #47 #51 — every one a contour rebuilt
per project and broken on its own edge case (a page opened WITHOUT radio buttons because the options were
typed as paragraphs). -->

## 1. Source document — what the page is built from

- **md is the source, HTML is derived. Always.** The page is rendered from the document; nothing is hand-edited.
- A question is a heading `### Q<n>. <text>`; its answer field is a line starting with `**Answer:**` (the
  Russian alias of the label is legal). An answer already written by the owner is NEVER overwritten — a new
  text lands as a dated follow-up field.
- **Options are recognised in exactly two forms** — anything else renders WITHOUT radio buttons:
  - a table row per option: `| **A** | what it means | price and risk |`
  - a list item per option: `- **A)** what it means` (a parenthesised note after the letter is legal)
- A question with NO options is legal only when it DECLARES a free field (a `D) your own answer` option, or the
  marker `<!-- questions-guard:no-scenario <reason> -->` for a naming/taste question). Paragraph headings like
  `**A. …**` are NOT options — this is the #51 defect.
- Every question and every option is a four-line scenario (Situation · Action · Result · Check) in the owner's
  language; the technical note stands UNDER the scenario, never instead of it.

## 2. Pre-flight — runs before any page opens (exit 3 = refuse to open)

```
for each question Q<n>:
  options(Q<n>) = table rows | **X** |  ∪  list items - **X)**
  if count(options) < 2 and no declared free field:
    print "Q<n>: 0 options in list form and no declared free field — the page would open without radio
           buttons; fix the form: - **A)** …"   →  exit 3
self-check after render: count(radio groups) == count(questions)  →  mismatch = exit 3, never a silent page
```

The generator runs this pre-flight itself; a project with its own contour runs it as `node
.kaif/tools/contour/review.mjs <doc> --no-open` and treats exit 3 as a red gate.

## 3. Records — three files, derived names, never overwritten

| Fact | Where | Shape |
|---|---|---|
| the answer | back into the source md, at `**Answer:**` | `X) <text> <!-- owner-review: by <owner> · <local time> -->` |
| the decision | `<decisionsDir>/<doc-basename>.decision.json` | `{ kind, document, by, at (ISO), atHuman (local words), comment, answers: { Q1: { choice, text, comment } } }` |
| the archive | `<decisionsDir>/archive/<doc-basename>--<ISO>.json` | a copy per save; never rewritten |
| the fact of SHOWING | `<decisionsDir>/shown.json` | `{ "<doc>": { "at": "<ISO>", "transport": "page \| batch \| chat" } }` — written when the window opens, or by hand for a pointed chat question (`--mark-shown <doc> --transport chat`) |
| the queue | `<decisionsDir>/queue.json` | a STATE file — live documents are never moved into a pending folder |

Approval binds to the SHA-256 of the NORMALISED body (BOM stripped, CRLF/CR → LF, trailing blanks cut, exactly
one final newline). Text changed after approval = approval void.

## 4. The page — what the owner must see

- A radio button per option under every question, a free-text field, one **Save** button, a visible "saved" signal.
- **The header scrolls with the page** (`header { position: static }`) — the owner's word; only the emergency
  banner ("server silent") may stay pinned.
- Refusing the owner's work is LOUD: every request that carries the owner's text sits in try/catch; a failed save
  returns the text onto the page with Copy and Retry; a draft lives in `localStorage` and is restored on load
  ("picked up N fields"). No path may leave the Save button disabled with no visible error.
- The page polls `/alive` every 15 s (envelope 10–60 s) and says out loud when the server goes silent.
- Time shown to a human is LOCAL words; ISO lives in the records.

## 5. Process — outcomes, patience, wake-up

- Exactly three outcomes, all in the process log: **decision recorded → exit 0** · **page closed without an
  answer → exit 2** · **interrupted → exit 130**. Pre-flight refusal is exit 3.
- Patience is infinite by default (`--timeout 0`); a finite timeout is an automation flag and means tolerated silence.
- Saving TERMINATES the process — that termination is how the waiting agent wakes up; start the contour as a
  tracked background task. The page dying is an event too: `sendBeacon('/closed')` on `pagehide` plus a silence
  watch (~3 min, two strikes).
- One document — one window (a lock with pid and address); a free port (`listen(0)`); a separate app window
  (`--app=`), never a tab. Auto-close after save is an ATTEMPT (~2 s); if the browser refuses, the page says so.

## 6. The call — sound first, voice by language

Beeps 880/160 → 660/160 → 990/260 ms through the sound card, then the banner, then the voice — after the page is up,
never before. The voice is chosen by the deployment language (`.kaif/kaif.json` → `language`) first, timbre second;
when no matching engine exists the call line says so ("system voice — engine not installed") and the contour drops
to beeps + banner rather than speaking noise. The rich engine is a MACHINE resource reached through the environment
(`KAIF_VOICE_TOOL`, `KAIF_VOICE`, `KAIF_SAPI_VOICE`) — never a path inside the project. Quiet hours override every
level; the window may cross midnight.

## 7. Faces and flags (the shipped generator)

| Face | Command | Record |
|---|---|---|
| interview (questions with options) | `node .kaif/tools/contour/review.mjs <doc.md>` | `kind: "interview"` |
| notice (something to TELL, no answer owed) | `… <doc.md> --notice` | `kind: "notice"`; "read" is the normal outcome, exit 0 |
| proofreading (a comment field per paragraph) | `… <doc.md> --proofread` | `kind: "proofread"`, `comments: { "p<N>": text }` |
| mockup review (an image + comments) | `… <image> --mockup` | `kind: "mockup"` |
| queue page "N accumulated" / queue without a browser | `… --queue` / `… --queue --list` (exit 2 while a waiting document was NEVER shown) | — |
| self-test (no browser) | `… --selftest` | red on the "options as paragraphs" fixture, green on the canonical forms |

Parameters are READ, never asked (owner rule #97, "a mechanic ships only complete"): `contour.projectName` (default: the project directory name),
`contour.ownerName` (default: the owner row of AGENT_GUIDE's identity table, else "owner"), `contour.callName` (how the
voice addresses the owner; default `ownerName`), `contour.decisionsDir` (default `interviews/decisions`),
`contour.quietFrom/quietTo` (default none), texts by `language` (RU/EN shipped, others fall back to EN and the page says so).

## 8. Acceptance in one minute

```
node .kaif/tools/contour/review.mjs --selftest                     # green; names the red fixture
node .kaif/tools/contour/review.mjs interviews/<doc>.md --no-open  # exit 0 and a printed URL, or exit 3 with the fix
ls <decisionsDir>/*.decision.json <decisionsDir>/shown.json        # records exist after the first save / show
```
