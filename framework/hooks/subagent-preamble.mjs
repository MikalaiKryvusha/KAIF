#!/usr/bin/env node
// subagent-preamble.mjs — the "a subagent enters the project first" hook (KAIF 2.10, epic PT, step PT2; origin tickets #166 · #168;
// optional refresh-hooks module, deployed to .kaif/hooks/). Claude Code event: PreToolUse, matcher `Agent|Task` (the tool that launches a
// subagent; `Task` is its name before Claude Code 2.1.63).
//
// What it does: a subagent starts with an empty context and the brief the main agent wrote — and a brief that forgets the project's canon
// sends it to work blind (the field: subagents edited code against rules they never read). This hook PREPENDS a marked preamble to the
// subagent's task: read the project's canon in full — exactly the list of step 1 of `/resume`, READ from `.claude/skills/resume/SKILL.md`
// (one copy of the fact; the step is found by its number, so a skill in the owner's language works the same) and only files that exist —
// quote one canon line bearing on the task first in the report, and keep the bounds a brief may lack: no nested subagents, no commit, no
// push. A task that already carries the marker is left as it is. Each firing appends one JSON line to `.kaif/subagent-preamble.jsonl`
// (ignored — session state, the outside witness that the hook ran).
//
// Contract (Claude Code hooks reference — the origin's researches/41, PT0): stdin — JSON with `hook_event_name`, `cwd`, `tool_name`,
// `tool_input` (`prompt`, `description`, `subagent_type` …); stdout on exit 0 — {"hookSpecificOutput": {"hookEventName": "PreToolUse",
// "updatedInput": {…the whole input, the new prompt…}}} and NO `permissionDecision`: the launch keeps the permission it had (a field
// deployment observed the rewritten task reach 48 of 48 subagents without a decision — researches/41, PT0 (b) 1). The hook answers ONLY an
// input it changes; any internal error → exit 0 silently (decision #144 of the origin: no KAIF hook stops the agent).
// FORK: options <PreToolUse updatedInput.prompt | SubagentStart additionalContext> · price of error <the subagent never sees the canon
// order and works blind; with SubagentStart the order is "context", not the task — not observed in any deployment> · consulted
// <researches/41 (hooks#pretooluse-decision-control; sub-agents) · the field's 48 of 48 observation> → PreToolUse.
// The preamble is English on purpose: the subagent reads it, not the owner (AGENT_GUIDE.md → languages are routed by audience).
// [NOT-TESTED: acceptance tools/sandbox/probes/pt2-subagent-preamble.mjs written before this code]
import { readFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

export const MARKER = '[KAIF subagent preamble v1]';
const RESUME_SKILL = join('.claude', 'skills', 'resume', 'SKILL.md');
const LOG = join('.kaif', 'subagent-preamble.jsonl');
const SUBAGENT_TOOLS = new Set(['Agent', 'Task']);

// The reading list: the backticked `*.md` names of the bullets of step 1 of /resume — the section from the first level-2 heading whose
// number is 1 (`## Step 1.` or the same heading in the owner's language) to the next level-2 heading — that exist in the project. Blockquotes and prose
// of that section (the chronicle "intentionally not in this set") are not bullets and are not read.
export function readingList(root) {
  const skill = join(root, RESUME_SKILL);
  if (!existsSync(skill)) return [];
  const lines = readFileSync(skill, 'utf8').split(/\r?\n/);
  const from = lines.findIndex((l) => /^##\s+\S+\s+1\.\s/.test(l));
  if (from < 0) return [];
  let to = lines.findIndex((l, i) => i > from && /^##\s/.test(l));
  if (to < 0) to = lines.length;
  const names = [];
  for (const l of lines.slice(from + 1, to)) {
    const m = /^-\s+(?:\*\*[^*]+\*\*\s*)?`([^`\s]+\.md)`/.exec(l);
    if (m) names.push(m[1]);
  }
  return [...new Set(names)].filter((n) => existsSync(join(root, n)));
}

export function preamble(list) {
  return `${MARKER} Before the task below, enter this project the way its main agent does: read IN FULL, from the project root, `
    + `in this order: ${list.join(' · ')}. This is the ENTRY read of /resume, not a task inside a session: the context router's "read `
    + `only the slice you need" does not apply to it — read every document named here. `
    + `Open your report with one line quoted from that canon that bears on your task — the witness that `
    + `you read it. Bounds that hold even if the task does not repeat them: do not launch subagents of your own; do not commit and do not `
    + `push; the main agent verifies your result before it relays it. Then do the task.\n---\n`;
}

// The new tool input, or null when nothing changes (the hook then stays silent).
export function rewrite(toolName, input, root) {
  if (!SUBAGENT_TOOLS.has(toolName) || !input || typeof input !== 'object' || typeof input.prompt !== 'string') return null;
  if (!input.prompt.trim() || input.prompt.includes(MARKER)) return null;
  const list = readingList(root);
  if (list.length === 0) return null;
  return { ...input, prompt: preamble(list) + input.prompt };
}

if (process.argv[2] === '--selftest') {
  // the shape only; the acceptance over a real project tree is tools/sandbox/probes/pt2-subagent-preamble.mjs at the origin and suite s14
  let bad = 0;
  const ok = (good, line) => { if (!good) bad++; console.log((good ? 'ok   ' : 'FAIL ') + line); };
  const p = preamble(['STATUS.md', 'AGENT_GUIDE.md']);
  ok(p.startsWith(MARKER) && p.includes('STATUS.md · AGENT_GUIDE.md') && p.endsWith('\n---\n'), 'preamble: marker first, list in order, separator last');
  ok(rewrite('Bash', { prompt: 'x' }, '.') === null && rewrite('Agent', { description: 'x' }, '.') === null
    && rewrite('Agent', { prompt: MARKER + ' x' }, '.') === null, 'silence: not a launch · no task · already marked');
  console.log(bad ? `selftest: ${bad} FAIL` : 'selftest: all ok');
  process.exit(bad ? 1 : 0);
}

try {
  let input = null;
  try {
    // A leading U+FEFF is dropped before the parse — twin of prompt-resume-word.mjs (Windows PowerShell 5.1 pipes put it there).
    input = JSON.parse(readFileSync(0, 'utf8').replace(/^\uFEFF/, '') || '{}');
  } catch { /* unreadable stdin — nothing to answer */ }
  if (input && input.hook_event_name === 'PreToolUse') {
    const root = typeof input.cwd === 'string' && input.cwd ? input.cwd : process.cwd();
    const updated = rewrite(String(input.tool_name || ''), input.tool_input, root);
    if (updated) {
      try {
        mkdirSync(join(root, '.kaif'), { recursive: true });
        appendFileSync(join(root, LOG), JSON.stringify({ at: new Date().toISOString(), tool: input.tool_name,
          subagent: input.tool_input.subagent_type || 'general-purpose', description: String(input.tool_input.description || '') }) + '\n');
      } catch { /* the witness is best-effort; the preamble is what matters */ }
      process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', updatedInput: updated } }));
    }
  }
} catch { /* a hook must never take the session down with it */ }
process.exit(0);
