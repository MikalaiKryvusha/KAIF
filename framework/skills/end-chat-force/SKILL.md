---
name: end-chat-force
description: URGENTLY CLOSE this chat RIGHT NOW, without the long ceremonies — capture only the essentials that must not be lost (status + the handover for the next chat), commit AND push, say goodbye in one line. Use when the human says "закрой чат срочно", "сворачиваемся прямо сейчас", "закрывай немедленно, без церемоний", "end the chat now", "force-close the chat", "end-chat-force". The skipped ceremonies (judge pass, bonsai trim, README refresh, showcase linters) become an explicit debt line in STATUS.md that the next /end-chat-soft pays. For an unhurried full closure use /end-chat-soft; for a light in-chat pause use /pause.
---

# /end-chat-force — the urgent closure: save what must not be lost, and go

The human needs this chat closed NOW. Speed wins over ceremony — but never over the handover: a
closure that loses the essentials is not fast, it is destructive. Three steps, minutes total.

**Who closes:** the owner's word (his words verbatim in the skill's args, `owner: «…»`) or a window MEASURED at or above the closing level
— `node .kaif/hooks/context-window.mjs --measure` exits 0 (1 — too early, keep working · 2 — nothing to measure: then only the owner's word
closes) — never «the window feels full»; with hooks running, the context-window gate measures at the skill's call too.

## Step 1. The handover — only what must not be lost

Update `STATUS.md`, tersely:

- **What was done in this chat** — the facts a stranger cannot recover from git alone.
- **Where we are** — what works, what is mid-flight and in what state.
- **What the next session does FIRST** — commands, paths, open questions with owners.
- **The ceremonies debt line** — in the owner's language (origin issue #97; the English form below):
  `⚠️ Force-closed <date+time>: ceremonies skipped (judge pass, bonsai trim, README, showcase
  linters) — the first /end-chat-soft pays this debt.`
- **The standing falsehood line** — one phrase, in the owner's language (the English form): `Standing falsehood: none`, or
  `Standing falsehood: <the statement> → still stands in <place>, <place>` (`AGENT_GUIDE.md` → "a
  falsehood is corrected where it stands"). Force mode may skip a ceremony; it never drops a lie left
  standing under the owner's name — a statement this session learned was false and corrected only in
  the chat is named here with every place, and the next session's first move is the five steps.
- **The knowledge line** — `KNOWLEDGE: <what this chat understood anew or found stale · the document it is written in now>` or
  `KNOWLEDGE: nothing new`; force mode writes the finding into the project's docs before it names it — a chat line is not a record.
- Convert relative dates to absolute.

Uncommitted work-in-progress that cannot land safely: name it in the handover (file, state, next
move) instead of finishing it — naming survives, rushing corrupts.

## Step 2. Commit and push

Commit through the project's staging gate and push:

`<Use your commit tool/flow. If you have one (e.g. tools/commit.mjs that bumps build, adds, commits,
pushes), run it. Otherwise: git add each path you mean to ship by name — new, changed, deleted, and both names of a move
(git status --short lists them; never -A) — check the staged set with git diff --cached --stat, then git commit -m "...", then git push —
each its own tool call, never chained
(AGENT_GUIDE.md → Git workflow).>`

If the build is known-broken, say so IN the commit message (`wip:` prefix) — an honest broken
state beats a silently lost one. If a push is rejected (non-fast-forward) — `git pull --rebase`,
retry once, and if it still fails, tell the human: the commit exists locally, nothing is lost.

## Step 3. The one-line farewell

One line to the human: the commit hash, the single most important thing for the next chat, and
the reminder that the ceremonies debt is recorded in `STATUS.md`. Goodbye.

Write that line into `FAREWELL_MESSAGE_FROM_THE_PREVIOUS_CHAT.md` at the project root yourself (replacing what is there) before you
print it: the Stop hook `stop-farewell-capture.mjs` only repeats the write, and in a session whose hooks do not run nothing else does.

## What this skill refuses to skip

- **The handover.** No closure without Step 1 — that is the one thing force mode exists to protect.
- **The staging gate.** A sweeping add that grabs the owner's stray files is not faster, it is a
  leak; the gate's refusal is obeyed even in force mode.
- **Honesty.** Skipped ceremonies are DECLARED (the debt line), never silently dropped — a force
  closure that pretends to be a full one is the fraud `/fable-judge` hunts.

## Notes

- The family in one line: **/pause — the chat continues later; /end-chat-soft — finish properly,
  then say goodbye; /end-chat-force — capture the essentials and say goodbye right now.**
- Force mode is the human's call, not the agent's shortcut: never pick it on your own initiative
  just because the session ran long.
