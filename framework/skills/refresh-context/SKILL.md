---
name: refresh-context
description: Refresh the project context — re-read the master plan and project map, the key guidance docs, walk bugs/ and plans/ (open, non-DONE) and rebuild the current backlog, then take something into work. Called by the human ("refresh context", "re-read the docs", "rebuild the backlog", "освежи контекст", "перечитай доки") AND by the agent itself periodically inside long autonomous loops (nightloop/dayloop) so it doesn't lose the big picture between iterations.
---

# /refresh-context — refresh context and rebuild the backlog

Long autonomous loops and context loss between sessions make the agent lose the big picture. This skill
restores it quickly and forms a current backlog.

## What to do

1. **Re-read strategy & map:**
   - `plans/master_plan.md` — the master plan and phases (where we're going).
   - `plans/project_map.md` — the map of modules/files and data flows (how it's built).

2. **Re-read the KEY guidance docs:**
   - `AGENT_GUIDE.md` — the rules (git workflow, style, tools, build).
   - `STATUS.md` — current state, what's in progress, "where to continue", "awaiting human review".
   - `BUG_FIXING_FRAMEWORK.md` — how to fix bugs.
   - `PHILOSOPHY.md` — the simplicity principle (KISS + Occam).

3. **Walk the backlog and rebuild it:**
   - `ls bugs/` — take everything NOT tagged `DONE` (open bugs).
   - `ls plans/ideas/` — take everything NOT tagged `DONE` (open ideas/features).
   - Glance at `plans/homework_*.md` and `interviews/` — what's waiting on the human (don't take into
     work, but know it).
   - Form the current open-task list (briefly, e.g. in a TodoWrite list).
   - 🧹 **If the backlog hasn't been revised in a while** (closed files without the `DONE` tag have piled
     up) — call `/check-backlog`: it tags genuinely-closed files DONE and returns a clean open list.

4. **Pick one task** from the rebuilt backlog (priority: finish what's started > bugs > new ideas) that
   doesn't need a human decision. If you're in a loop — continue the loop with it.

## Notes
- This is a FAST skill (read + list), a couple of minutes. Don't rewrite docs without need.
- If human-level questions surface — file them in `interviews/` and mark `STATUS.md` "❓ awaiting human review".
- In autoloops, call this once every few iterations, not every iteration.
