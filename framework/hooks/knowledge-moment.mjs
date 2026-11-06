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
//  --selftest, mutant probe tools/sandbox/probes/mm3-knowledge-mutant.mjs (two mutants, each red on exactly its case), s14;
//  2026-11-06 14:03 +03:00 · functional — tools/sandbox/probes/mm3-live-knowledge.mjs, 9 of 9 live headless sessions (claude -p --model haiku, KAIF
//  installed by this build, hooks wired): the map got a line about an unnamed source file (3/3), a stale map line was corrected (3/3), the
//  component notes were read before the first edit and appended (3/3); report testcases/reports/2026-11-06_s97-polygon-scenario-lint.md;
//  session 98 (judge of epics MM · TK10): the probe's predicates narrowed to their words — the map has a line on the component, the tax
//  line says 20 %, the notes Read precedes the first code edit in the session's own tool calls; the noise cases (a config is not code, a
//  generic name by its full path) — --selftest, six mutants (tools/sandbox/probes/mm3-knowledge-mutant.mjs); the live rerun on this file —
//  report testcases/reports/2026-11-06_s98-judge-debt-mm-tk10.md]
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
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
  notes: (file, notes) => `KAIF knowledge: ${file} belongs to a component with notes — read ${notes} before you change it; after the ` +
    'change, append ONE line there: what you changed or found (an order — live probe, session 97).',
  known: (file, doc, excerpt) => `KAIF knowledge: ${doc} says of ${file}: «${excerpt}». Does the code say the same? It differs — fix ${doc} ` +
    'in this turn: add the new, correct or delete the stale.',
  // an ORDER, not a question (live probe, session 97: the question form was read as advice — 0 of 3 sessions wrote; the field owner's own
  // word for this hook: «you MUST document it»)
  unknown: (file) => `KAIF knowledge: you have just read ${file}, and none of the project\'s maps names it. Before you answer, add ONE line ` +
    'about what it does to PROJECT_ARCHITECTURE_INTERNAL_MAP.md — the map is how the next session knows the project.',
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

// Judge of session 97 (finding 4): Claude Code fires this hook on a SUBAGENT's tool calls too, under the parent's session and transcript.
// Observed live (origin session 97, a temporary logging hook): a subagent's event carries `agent_id` and `agent_type`, the main thread's
// does not. (A first guard looked the call up in the transcript — the CLI writes the record AFTER PostToolUse, so it silenced the main
// thread of every headless session; the probe tools/sandbox/probes/mm3-live-knowledge.mjs caught it.)
export const fromSubagent = (ev) => Boolean(ev && ev.agent_id);

// MM3, live probe of session 97 (origin plans/138): in the «new» and «stale» scenarios the only line came at the prompt — BEFORE the
// agent learned anything; the moment of understanding was a Read of source code, which weighed 1. Recall by association closes it, the
// way a cue brings a memory back: the first Read in a session of a project source file → the docs that name it are looked up; named →
// the line quotes what they say («does the code say the same?»); named nowhere → «learned how it works? write a line into the map».
// Noise (judge of epics MM · TK10, session 97, finding 5): a config file (package.json, *.yaml, *.toml) is not the moment of understanding
// how the code works — its first Read ordered «add a line to the map» in a live session; and a generic file name (index.mjs, utils.js)
// matched by its base name quoted a map line about ANOTHER file of that name — generic names are matched by their full path only.
const CODE_EXT = /\.(?:m?[jt]sx?|cjs|py|go|rs|java|kt|cs|c|cc|cpp|h|hpp|rb|php|swift|sh|ps1|sql|vue|svelte|html|css)$/i;
const GENERIC_BASE = /^(?:index|main|mod|lib|app|utils?|helpers?|types|config|setup|init|constants|common)\.[^.]+$/i;
const NOT_PROJECT = /^(?:\.kaif|\.claude|\.git|node_modules|dist|build|vendor)\//;
const LOOKUP_DOCS = ['PROJECT_ARCHITECTURE_INTERNAL_MAP.md', 'PROJECT_STRUCTURE_EXTERNAL_MAP.md', 'STATUS.md', 'HOUSE_RULES.md'];
export function docsLookup(root, read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')) {
  return (rel) => {
    const base = rel.split('/').pop(), byBase = base.length >= 5 && !GENERIC_BASE.test(base);
    for (const doc of LOOKUP_DOCS) {
      const line = read(join(root, doc)).split('\n').find((l) => l.includes(rel) || (byBase && l.includes(base)));
      if (line) return { doc, excerpt: line.replace(/\s+/g, ' ').trim().slice(0, 200) };
    }
    return null;
  };
}

// The decision — pure: (event, the session's state, root, exists, lookup) → { line | null, state }.
export function decide(ev, st, root, exists = existsSync, lookup = docsLookup(root)) {
  const s = { weight: st.weight || 0, notes: Array.isArray(st.notes) ? st.notes.slice() : [], code: Array.isArray(st.code) ? st.code.slice() : [] };
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
    // a file of a component with notes is covered by its notes (the line above) — no second line for it
    if (tool === 'Read' && !notes && CODE_EXT.test(rel) && !NOT_PROJECT.test(rel) && !rel.startsWith('..') && !s.code.includes(rel)) {
      s.code.push(rel); s.weight = 0;
      const hit = lookup(rel);
      return { line: hit ? LINES.known(rel, hit.doc, hit.excerpt) : LINES.unknown(rel), state: s };
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
  r = decide(post('Read', 'docs/guide.txt'), {}, R, ex, () => null);
  ok(r.line === null && r.state.weight === 1, 'plain Read (not code, not a knowledge doc): silent, weight 1');
  let st = {}; let said = 0;
  for (let i = 0; i < THRESHOLD; i++) { r = decide(post('Read', 'docs/guide.txt'), st, R, ex, () => null); st = r.state; if (r.line) said++; }
  ok(said === 1 && r.line === LINES.weight && st.weight === 0, `weight: ${THRESHOLD} plain results → exactly one line, then reset`);
  r = decide(post('Edit', 'src/contour/page.mjs'), {}, R, ex);
  ok(r.line && r.line.includes('read src/contour/NOTES.md before you change it'), 'component notes: first touch names the notes file');
  r = decide(post('Read', 'src/contour/page.mjs'), r.state, R, ex);
  ok(r.line === null, 'component notes: second touch in the session is silent');
  r = decide(post('Read', 'NOTES.md'), {}, R, has(new Set([join(R, NOTES)])));
  ok(r.line === null, 'a root NOTES.md is not a component\'s notes');
  r = decide({ hook_event_name: 'Stop' }, {}, R, ex);
  ok(r.line === null, 'Stop: never speaks, never blocks');
  ok(fromSubagent({ hook_event_name: 'PostToolUse', agent_id: 'a1' }) && !fromSubagent({ hook_event_name: 'PostToolUse' }),
    'a subagent\'s tool call (the event carries agent_id) is not the main agent\'s moment (judge of session 97)');
  const look = docsLookup(R, (p) => (/INTERNAL_MAP/.test(p) ? '## Billing\n- `src/billing/invoice.mjs` — invoice total; tax rate 10 %.\n' : ''));
  r = decide(post('Read', 'src/billing/invoice.mjs'), {}, R, ex, look);
  ok(r.line && /PROJECT_ARCHITECTURE_INTERNAL_MAP\.md says of src\/billing\/invoice\.mjs: «- `src\/billing\/invoice\.mjs` — invoice total; tax rate 10 %\.»/.test(r.line),
    'recall by association: the first Read of a source file the map names quotes the map\'s line (MM3, stale)');
  const r2 = decide(post('Read', 'src/billing/invoice.mjs'), r.state, R, ex, look);
  ok(r2.line === null, 'the same source file again in the session — silent');
  r = decide(post('Read', 'src/shop/cart.mjs'), {}, R, ex, look);
  ok(r.line && /read src\/shop\/cart\.mjs, and none of the project's maps names it\. Before you answer, add ONE line/.test(r.line), 'a source file the maps never name — «before you answer, add one line to the map» (MM3, new)');
  ok(decide(post('Read', '.kaif/hooks/x.mjs'), {}, R, ex, look).line === null, 'a file of KAIF itself is not project code');
  // noise (judge of session 97, finding 5): a config file is not code; a generic name is matched by its full path only
  ok(['package.json', 'config/app.yaml', 'pyproject.toml'].every((f) => decide(post('Read', f), {}, R, ex, look).line === null),
    'a config file (package.json · *.yaml · *.toml) is not the moment of understanding code: silent');
  const lookIdx = docsLookup(R, (p) => (/INTERNAL_MAP/.test(p) ? '- `src/a/index.mjs` — the router of A.\n' : ''));
  r = decide(post('Read', 'src/b/index.mjs'), {}, R, ex, lookIdx);
  ok(r.line && /read src\/b\/index\.mjs, and none of the project's maps names it/.test(r.line) && !/says of/.test(r.line)
    && /says of src\/a\/index\.mjs/.test(decide(post('Read', 'src/a/index.mjs'), {}, R, ex, lookIdx).line || ''),
    'a generic name (index.mjs) is matched by its full path: another file of that name is not quoted');
  console.log(bad ? `selftest: ${bad} FAIL` : 'selftest: all ok');
  process.exit(bad ? 1 : 0);
}

try {
  const ev = JSON.parse(readFileSync(0, 'utf8').replace(/^\uFEFF/, '') || '{}');
  // judge of session 97, finding 4: a subagent's tool call is not the main agent's moment — silence, the state untouched
  if (fromSubagent(ev)) process.exit(0);
  const root = process.env.CLAUDE_PROJECT_DIR || projectRoot(ev.cwd);
  const id = String(ev.session_id || 'no-session');
  const all = readState(root);
  const { line, state } = decide(ev, all[id] || {}, root);
  all[id] = { ...state, at: new Date().toISOString() };
  writeState(root, all);
  if (line) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: ev.hook_event_name, additionalContext: line } }));
} catch { /* a hook never breaks the session */ }
process.exit(0);
