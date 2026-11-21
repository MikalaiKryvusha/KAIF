# Adapter: <AGENT SYSTEM>

> Template for a KAIF adapter. Copy to `framework/adapters/<system>.md`. Verify every convention against
> the system's CURRENT official docs and installed source — these conventions change often.
>
> The markdown rituals are the complete baseline. Native context, skills and hooks make them easier to
> invoke; they never become ready by configuration alone. Record each live check in a run report and name
> what was not observed. [TESTED: 2026-11-21 · applied to the Kimi adapter and its live evidence; remaining gaps stay named in
> plans/143 KA9 and bugs/147; build-framework + check-framework green]

## 1. Context file — the project enters each session

Find the project's auto-loaded instruction file, its lookup root, size limit, trust boundary and reload rule.

→ KAIF action: point it at `AGENT_GUIDE.md`, `STATUS.md` and `PHILOSOPHY.md`; name the other canon documents
from the entry ritual. Generate the cross-tool `AGENTS.md` fallback where the system reads it.

**Live proof:** start a new session after installation, then read a fact that exists only in those files. A file
written on disk, or a prompt that merely mentions KAIF, is not proof that the system loaded it.

## 2. Commands / skills — the model can discover and call every ritual

Answer from current docs/source:

- Which directories are searched, and from which root (a git ancestor, the session folder, the user home)?
- Which frontmatter fields are required, and which text does the model actually see — all of it or a truncated field?
- What is the manual invocation? What may the model invoke itself? Where do trigger aliases belong?
- How do arguments, references and bundled resource directories work? Are prompt and inline skills different?
- When do new or edited skills become visible: immediately, on reload, or only in a new session?

→ KAIF action: translate each `framework/skills/<name>/SKILL.md`, preserving its name and intent. Use the native
invocation and resource syntax; do not fork the translated copies — `sync` regenerates them from the canonical skills.
If the system has no skill mechanism, keep named documents and teach the human to invoke them by name.

**Live proof:** the session lists every installed skill; call `/skill:resume` (or the native equivalent), then another
skill with an argument and a bundled reference. Read the expanded instructions and the result of the argument/reference.
A successful installation and a model's claim that it can call a skill are not this proof.

## 3. Hook transport — write the contract before the wiring

Record in the adapter:

- config location and scope (project/user/plugin), event names and matcher syntax;
- the event JSON fields, especially session id, project/session cwd, tool name, tool input and transcript path;
- the command's actual cwd and shell; environment variables available to it and to the agent's own later commands;
- stdout/stderr and exit-code meanings; which events may inject text, rewrite input, deny a call or block a stop;
- event ordering, parallelism, duplicate suppression, timeout and failure behavior;
- whether subagent events reach the same hooks, and how they are marked;
- when the running client reads the config, and which client modes (interactive, editor, web, print) differ.

Keep one logic-free dispatcher where project-level hooks are forbidden or commands run outside the project root. It must
find the project from the event's cwd, run that project's own scripts and stay silent outside KAIF. Never carry hook
logic or a version in the dispatcher.

**Live proof:** the real client, not a direct script invocation, fires each wired event. Keep a trace with session id,
event, command, exit code and observable result. A matching config entry proves wiring only. Test at least one block and
read its reason in the agent's next action; also test a subfolder and a folder without KAIF.

## 4. KAIF mechanisms — each has its own observable result

| Mechanism | Required live observation on the target system |
|---|---|
| Entry and compaction refresh | a new/compacted session produces the re-read order; the agent then writes a fresh marker with a canon quote |
| Leading `resume` word | the owner's message invokes the entry ritual before any task work |
| Machine clock | a placeholder write produces the machine's local moment; the written file is read back |
| Subagent preamble | a real subagent receives the canon/brief preamble; its journal or result proves delivery |
| STATUS stop guard | a deliberately stale STATUS blocks once, then a fresh one passes |
| Farewell | a real closing turn writes the whole farewell; the next entry reads it |
| Context window | fresh usage crosses each configured step; the order arrives before the client's compaction and re-arms after it |
| Knowledge moment | a real understanding/staleness moment writes the named project document in the same turn |
| Test debt and Stop | write a product source file without running it; Stop opens one continuation asking for its run; a real run clears it |
| Voice before waiting | a permission request or owner-blocking question starts the voice before the wait; the voice log names the phrase |

Where the client cannot deliver a mechanism, write the exact boundary and use the markdown ritual. Do not simulate a live
result by feeding JSON directly to the script: that is hygiene of the script, not evidence of the client connection.

## 5. Owner conversation and permissions

Find how a message typed during a turn is delivered (steer/queue), how a structured question is shown, whether tool
permissions wait, and which mode the owner chose. KAIF answers the owner's word at once and continues unless asked to stop;
vision-level decisions still go to `interviews/`. Never let a permission mode silently transfer those decisions to the agent.

**Live proof:** answer one mid-turn owner message without abandoning the work; make one genuine owner-blocking call and
observe the voice before the wait. A mocked permission event does not prove the client's timing.

## 6. Session identity and diagnostics

The hand checks `--alive` and `--measure` must identify the current session by the system's own id. If the agent's command
tools do not receive that id, document a deliberate fallback to the newest session of this project and name it in the output.
Never let a record from another agent system, another project or a subagent count as the current session.

**Live proof:** with no hook record the current session reads NOT running; after the real hook fires it reads running. Read
both outputs. Check the actual session log when the answer and behavior disagree.

## 7. Deploy and acceptance checklist

- [ ] the adapter names current docs/source and every client/reload boundary found above;
- [ ] context, all skills and every supported hook are deployed; `.kaif/kaif.json` → `agents` records the system;
- [ ] `check` and `sync` are green; every new guard is red on the named pre-fix version;
- [ ] a real session after installation/reload proves context, skill discovery and a skill call with argument + reference;
- [ ] the real client produces a trace for each wired event and the mechanism observations that apply;
- [ ] the run report separates hygiene from the functional run and lists every unobserved case as pending, never as support;
- [ ] the full project test suite and the adversarial judge pass before release.

## Notes / gotchas

`<auth, trust, file-size limits, always-on vs. on-demand rules, client differences and known limits.>`
