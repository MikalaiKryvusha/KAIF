# <PROJECT_NAME> — Current Status

> This file is read by the AI agent before every task. Update it on every significant change of state.
> It is the PRIMARY handoff between sessions: a new agent session starts with empty context and must be
> able to get productive from this file alone. Write accordingly — concrete, with file paths and commands.
> 🧠 Prime thinking principle — `PHILOSOPHY.md` (SIMPLICITY: KISS + Occam). Read your working framework
> in `AGENT_GUIDE.md`.

---

## What's done

`<Chronological-ish list of completed phases/features, concrete, tied to files/modules. Enough detail
that a fresh session understands what already exists and works. Example:>`

### Phase 0 — Foundation ✅
- `<...>`

### Phase 1 — <name> ✅
- `<...>`

---

## Where we are now

`<One short paragraph: what works, what's in progress, what's the current focus.>`

| Phase | Status | What's there |
|-------|--------|--------------|
| Phase 0 | ✅ done | `<...>` |
| Phase 1 | 🔧 in progress | `<...>` |
| Phase 2 | 🔲 todo | `<...>` |

---

## 🤖 Autonomous backlog pool (no human / no special hardware needed)

> Tasks the agent can do FULLY autonomously: write code → build → test on the harness → fix → commit,
> without the human and without resources only the human can provide. The loop skills
> (`/autoloop`, `/dayloop`, `/nightloop`) grind this pool.

- [ ] `<task — why it's autonomous>`
- [ ] `<task>`

---

## ❓ Awaiting human review (interviews / homework)

> Decisions the agent must not make alone (brand/UX/architecture), or actions only the human can do
> (test on real hardware, external accounts). Filed in `interviews/` and `plans/homework_*.md`.

- ❓ `<interview NNN — one line>` → `interviews/interview_NNN_*.md`
- 🧰 `<homework — one line>` → `plans/homework_*.md`

---

## Where to continue next session

> A concrete checklist so the next session (empty context) can start immediately: which files, which
> commands, what to verify first.

1. `<first thing to do, with the exact command/file>`
2. `<...>`

---

## Open bugs

`<Pull from bugs/ (non-DONE). One line each with status and a pointer. Example:>`
- 🔴 `bugs/NN_<name>.md` — `<symptom, one line>`
