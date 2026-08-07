# `homeworks/` — tasks from the agent to the human

Tasks the agent asks the **human** to do — things it cannot do itself because of its digital, bodyless
nature: test on real hardware, act in the physical world, use an account/credential only the human has,
make a purchase, observe something offline. Each doc describes the task with concrete steps for the human,
and collects the human's observations and results back. One `NN_<name>.md` each.

**For the human (owner):** when the agent files a homework, it needs a hand in the physical/offline world.
Follow the steps and write what you observed back into the document — the agent reads your notes and
continues.

**For the AI agent:** when you're blocked on something only a human-with-a-body can do, don't stall — write
a homework here with clear, minimal, numbered steps and a place for the human's results, then continue with
other work. Right after the H1 comes the lintable header meta — **Created:** · **Parent:** ·
**Status:** · **Outbound:** (`AGENT_GUIDE.md` → Document header meta). When the human reports back,
incorporate the results and `DONE`-tag the file
(`git mv NN_x.md NN_DONE_x.md`).

**Taste-class homework** (the acceptance criterion is a perception adjective — `AGENT_GUIDE.md` →
"The taste class"): the agent hands the human an ARTIFACT to perceive, never a link or a foreign
benchmark; all candidates on ONE same material, blind labels, the key beside them. Two standing
fields in every such doc: **"Ready to see/hear right now"** (paths to the artifacts) and
**"Verdicts already given"** (the owner's calls, recorded verbatim — a verdict is canon and is
never asked twice).
