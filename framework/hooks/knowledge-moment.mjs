#!/usr/bin/env node
// knowledge-moment.mjs — the "a finding is written where it lives" hook (KAIF 2.10, epic MM, step MM2; origin tickets #160 · #159 · #186;
// optional refresh-hooks module, deployed to .kaif/hooks/). Claude Code events: UserPromptSubmit · PostToolUse · PostToolUseFailure.
//
// What it does: at the moments a brain writes memory — a prediction error, a recalled memory that may now be wrong, a salient word — it
// puts ONE line into the agent's context: write what you understood into the project's documents in this turn. It never blocks a tool,
// never stops a turn, never reads the documents into the context (the field owner: «not a Stop hook!» · «not on every git commit, NO!»).
// The moments (form B of step MM1, origin plans/138; recon — researches/39 §4):
//   STRONG — speak at once: the owner's own prompt · a failed tool call (PostToolUseFailure — the vendor names the failure there, never by
//            the words of an output) · a Read of a project knowledge document (maps, STATUS, EXPERIENCE, house rules, plans, researches) ·
//            the first touch in a session of a file whose component has notes (NOTES.md in its directory or above, below the root);
//   WEAK   — every other tool result adds weight 1; at THRESHOLD the hook speaks once and the weight resets (Generative Agents: reflection
//            on the SUM of importance, never on a timer — the field prototype's one 10-minute window swallowed 3 of 3 novelty moments).
// State — per session_id in .kaif/knowledge-moment.json (never in the project tree, never shared by sessions — class of origin bugs/119);
// the newest SESSIONS_KEPT sessions are kept.
// Contract (Claude Code hooks reference, code.claude.com/docs/en/hooks, checked in step MM1): stdin — JSON with `hook_event_name`,
// `session_id`, `cwd`, `tool_name`, `tool_input`, `prompt`; stdout on exit 0 — {"hookSpecificOutput": {"hookEventName", "additionalContext"}},
// a system reminder the model reads on its next request; at most 10 000 characters. Any internal error → exit 0 silently.
// The lines are English on purpose: the agent reads them, not the owner (AGENT_GUIDE.md → languages are routed by audience).
// GAP: the hook sees EVENTS, never the understanding itself — a finding born in the agent's reasoning has no event; the canon carries it
// (the KNOWLEDGE: line of the closing and loop rituals, the checklist line «Check the map & blast radius»). Observed live (origin session
// 97): a queued message — a subagent's hand-back — reaches UserPromptSubmit; whether an owner's mid-turn word does is not yet observed.
// [TESTED: 2026-11-06 · functional — the origin's own live Claude Code session 97 with this file wired: the weight line reached the
//  model's context after twelve plain results, the PostToolUseFailure line after a failed Grep, the recall line after a Read of
//  EXPERIENCE.md; a subagent's hand-back was read as the owner — fixed (the <agent-message> case), its live replay is silent; hygiene —
//  --selftest 11/11, mutant «agent-message not excluded» red on exactly its case, s14 (+4 checks). NOT YET: the map scenarios of
//  criteria 9 · 10 · 30 (probe of step MM3 of the origin's plans/138); the mutant — probe tools/sandbox/probes/mm3-knowledge-mutant.mjs;
//  report testcases/reports/2026-11-06_s97-polygon-scenario-lint.md row 28; the subagent guard — judge of session 97, after]
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, openSync, readSync, fstatSync, closeSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';

export const THRESHOLD = 12;          // weak tool results before one reminder (one reminder per ~a dozen calls of plain work)
const SESSIONS_KEPT = 20;             // state of older sessions is dropped
const STATE = join('.kaif', 'knowledge-moment.json');
const DEPLOYMENT = join('.kaif', 'kaif.json');
const NOTES = 'NOTES.md';
const KNOWLEDGE_DOC = /(?:^|[\\/])(?:STATUS|EXPERIENCE|HOUSE_RULES|MASTER_PLAN|PROJECT_[A-Z_]+_MAP)\.md$|(?:^|[\\/])(?:plans|researches)[\\/][^\\/]+\.md$/i;
const TOUCH_TOOLS = new Set(['Read', 'Edit', 'Write', 'MultiEdit', 'NotebookEdit']);
const NOT_THE_OWNER = /^\s*<(?:task-notification|system-reminder|agent-message)\b/;   // a background task, the harness, a subagent's hand-back — not the owner

const WRITE = 'Write it into the project document where it lives — a map, STATUS.md, EXPERIENCE.md, the house rules — in THIS turn, ' +
  'not only in the chat; nothing new — go on.';
export const LINES = {
  owner: `KAIF knowledge: the owner spoke. A new rule, decision, correction or fact in it? ${WRITE}`,
  failure: `KAIF knowledge: a tool call failed — you expected one thing and got another. What did the project's documents not know? ${WRITE}`,
  recall: (doc) => `KAIF knowledge: you re-read ${doc}. Does it say what you know now? It differs — fix it there, in this turn: add the new, ` +
    'correct or delete the stale.',
  notes: (file, notes) => `KAIF knowledge: ${file} belongs to a component with notes — read ${notes} before you change it, and append ` +
    'there what you find.',
  weight: `KAIF knowledge: a stretch of work since the last check. Learned how something works, or saw a document say otherwise? ${WRITE}`,
};

function projectRoot(cwd) {
  for (let d = resolve(cwd || '.'); ;) {
    if (existsSync(join(d, DEPLOYMENT))) return d;
    const up = dirname(d);
    if (up === d) return resolve(cwd || '.');
    d = up;
  }
}
// The notes file of a component: NOTES.md in the file's directory or a parent, below the project root (a root NOTES.md is not a component's).
export function notesOf(root, file, exists = existsSync) {
  const abs = resolve(root, file);
  if (!abs.startsWith(resolve(root) + sep)) return null;
  for (let d = dirname(abs); d.startsWith(resolve(root) + sep); d = dirname(d)) {
    const n = join(d, NOTES);
    if (exists(n)) return relative(root, n).split(sep).join('/');
  }
  return null;
}
const pathOf = (input) => String((input && (input.file_path || input.notebook_path)) || '');

// Judge of session 97 (finding 4, observed): Claude Code fires this hook on a SUBAGENT's tool calls too, under the parent's session id
// and transcript — a line meant for the main agent landed in a subagent's context. A subagent's calls live in its own transcript
// (`subagents/agent-*.jsonl`); the main thread's tool_use ids are in the session transcript. So a PostToolUse whose tool_use_id is not
// among the main thread's ids in the transcript tail is a subagent's call — silence (a lagging transcript costs one silent event, never a
// wrong line). An event without tool_use_id is judged as before.
export function mainThreadCall(text, toolUseId) {
  if (!toolUseId) return true;
  const needle = '"id":"' + toolUseId + '"';
  for (const line of String(text).split('\n')) {
    if (!line.includes(needle)) continue;
    try { const r = JSON.parse(line); if (r.type === 'assistant' && !r.isSidechain) return true; } catch { /* torn line */ }
  }
  return false;
}
const TAIL_BYTES = 4 * 1024 * 1024;
function tailOf(p) {
  const fd = openSync(p, 'r');
  try { const size = fstatSync(fd).size, n = Math.min(size, TAIL_BYTES), buf = Buffer.alloc(n); readSync(fd, buf, 0, n, size - n); return buf.toString('utf8'); }
  finally { closeSync(fd); }
}

// The decision — pure: (event, the session's state, root, exists) → { line | null, state }.
export function decide(ev, st, root, exists = existsSync) {
  const s = { weight: st.weight || 0, notes: Array.isArray(st.notes) ? st.notes.slice() : [] };
  const name = ev.hook_event_name;
  if (name === 'UserPromptSubmit') {
    if (NOT_THE_OWNER.test(String(ev.prompt || ''))) return { line: null, state: s };
    s.weight = 0; return { line: LINES.owner, state: s };
  }
  if (name === 'PostToolUseFailure') { s.weight = 0; return { line: LINES.failure, state: s }; }
  if (name !== 'PostToolUse') return { line: null, state: s };
  const tool = String(ev.tool_name || ''), file = pathOf(ev.tool_input);
  if (TOUCH_TOOLS.has(tool) && file) {
    const rel = relative(root, resolve(root, file)).split(sep).join('/');
    if (tool === 'Read' && KNOWLEDGE_DOC.test(rel)) { s.weight = 0; return { line: LINES.recall(rel), state: s }; }
    const notes = notesOf(root, file, exists);
    if (notes && rel !== notes && !s.notes.includes(notes)) {
      s.notes.push(notes); s.weight = 0; return { line: LINES.notes(rel, notes), state: s };
    }
  }
  s.weight += 1;
  if (s.weight >= THRESHOLD) { s.weight = 0; return { line: LINES.weight, state: s }; }
  return { line: null, state: s };
}

function readState(root) {
  try { const j = JSON.parse(readFileSync(join(root, STATE), 'utf8').replace(/^\uFEFF/, '')); return j && typeof j === 'object' ? j : {}; }
  catch { return {}; }
}
function writeState(root, all) {
  const ids = Object.keys(all).sort((a, b) => (all[b].at || '').localeCompare(all[a].at || ''));
  const kept = {}; for (const id of ids.slice(0, SESSIONS_KEPT)) kept[id] = all[id];
  const p = join(root, STATE), tmp = p + '.tmp';
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(tmp, JSON.stringify(kept)); renameSync(tmp, p);
}

if (process.argv[2] === '--selftest') {
  let bad = 0; const ok = (c, n) => { if (!c) { bad++; console.log('  x ' + n); } else console.log('  v ' + n); };
  const R = resolve('/proj'), has = (set) => (p) => set.has(resolve(p));
  const ex = has(new Set([join(R, 'src', 'contour', NOTES)]));
  const post = (tool, file) => ({ hook_event_name: 'PostToolUse', tool_name: tool, tool_input: { file_path: join(R, file) } });
  let r = decide({ hook_event_name: 'UserPromptSubmit', prompt: 'the build is make, not npm' }, {}, R, ex);
  ok(r.line === LINES.owner, 'owner prompt: one line at once');
  r = decide({ hook_event_name: 'UserPromptSubmit', prompt: '<task-notification><task-id>x</task-id>' }, {}, R, ex);
  ok(r.line === null, 'a background task notification is not the owner');
  r = decide({ hook_event_name: 'UserPromptSubmit', prompt: '<agent-message from="a1">\n[Subagent hand-back] report' }, {}, R, ex);
  ok(r.line === null, 'a subagent hand-back (a queued <agent-message>) is not the owner');
  r = decide({ hook_event_name: 'PostToolUseFailure', tool_name: 'Bash' }, { weight: 5 }, R, ex);
  ok(r.line === LINES.failure && r.state.weight === 0, 'failed tool: at once, weight reset');
  r = decide(post('Read', 'PROJECT_ARCHITECTURE_INTERNAL_MAP.md'), {}, R, ex);
  ok(r.line && r.line.includes('re-read PROJECT_ARCHITECTURE_INTERNAL_MAP.md'), 'recall: a Read of a map names the map');
  r = decide(post('Read', 'src/app.mjs'), {}, R, ex);
  ok(r.line === null && r.state.weight === 1, 'plain Read: silent, weight 1');
  let st = {}; let said = 0;
  for (let i = 0; i < THRESHOLD; i++) { r = decide(post('Read', 'src/app.mjs'), st, R, ex); st = r.state; if (r.line) said++; }
  ok(said === 1 && r.line === LINES.weight && st.weight === 0, `weight: ${THRESHOLD} plain results → exactly one line, then reset`);
  r = decide(post('Edit', 'src/contour/page.mjs'), {}, R, ex);
  ok(r.line && r.line.includes('read src/contour/NOTES.md before you change it'), 'component notes: first touch names the notes file');
  r = decide(post('Read', 'src/contour/page.mjs'), r.state, R, ex);
  ok(r.line === null, 'component notes: second touch in the session is silent');
  r = decide(post('Read', 'NOTES.md'), {}, R, has(new Set([join(R, NOTES)])));
  ok(r.line === null, 'a root NOTES.md is not a component\'s notes');
  r = decide({ hook_event_name: 'Stop' }, {}, R, ex);
  ok(r.line === null, 'Stop: never speaks, never blocks');
  const tr = JSON.stringify({ type: 'assistant', isSidechain: false, message: { content: [{ type: 'tool_use', id: 'toolu_MAIN' }] } });
  ok(mainThreadCall(tr, 'toolu_MAIN') && !mainThreadCall(tr, 'toolu_SUB'), 'a subagent\'s tool call is not the main agent\'s moment (judge of session 97)');
  console.log(bad ? `selftest: ${bad} FAIL` : 'selftest: all ok');
  process.exit(bad ? 1 : 0);
}

try {
  const ev = JSON.parse(readFileSync(0, 'utf8').replace(/^\uFEFF/, '') || '{}');
  // judge of session 97, finding 4: a subagent's tool call is not the main agent's moment — silence, the state untouched
  if (/^PostToolUse/.test(String(ev.hook_event_name || '')) && ev.transcript_path && existsSync(ev.transcript_path) && !mainThreadCall(tailOf(ev.transcript_path), ev.tool_use_id)) process.exit(0);
  const root = process.env.CLAUDE_PROJECT_DIR || projectRoot(ev.cwd);
  const id = String(ev.session_id || 'no-session');
  const all = readState(root);
  const { line, state } = decide(ev, all[id] || {}, root);
  all[id] = { ...state, at: new Date().toISOString() };
  writeState(root, all);
  if (line) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: ev.hook_event_name, additionalContext: line } }));
} catch { /* a hook never breaks the session */ }
process.exit(0);
