#!/usr/bin/env node
// stop-farewell-capture.mjs — the "the closing chat's farewell reaches the next chat" hook (KAIF 2.10, epic PT, step PT5; origin ticket #181;
// optional refresh-hooks module, deployed to .kaif/hooks/). Claude Code event: Stop. It never blocks and never speaks.
//
// What it does: the closing rituals (/end-chat-soft, /end-chat-force) end with a farewell — the densest handover the framework produces,
// written after the closing commit — and it lived only in the chat: the owner copied it by hand into the next chat under `resume`. On the
// stop of a turn that ran a closing ritual, this hook writes that turn's last message WHOLE into FAREWELL_MESSAGE_FROM_THE_PREVIOUS_CHAT.md
// at the project root, replacing what was there; `/resume` reads it first on the chat's first entry. The file name is the field owner's.
//
// Rules, each paid by the field (origin #181 and its two comments):
//   - the turn = every record after the owner's last real prompt (not a skill body — isMeta —, not a tool result, not a CLI wrapper);
//   - a closure = a Skill tool call of `end-chat-soft|end-chat-force` (a plugin prefix allowed) or the owner's own slash command in the turn;
//   - the text = `last_assistant_message` of the event, else the transcript text after the turn's last tool call;
//   - EVERY stop of the closing turn writes, the last one wins — EXCEPT a stop that only answers another Stop hook's block («Stop hook
//     feedback») or a neighbour session's message with no tool call after it: that one line is not a farewell. A closing turn that waits
//     on background work stops first on an interim line («waiting for the polygon») and is woken by the task's notification — which is NOT
//     the owner's prompt, so the farewell after it belongs to the same turn and replaces the interim line (judge of epic PT, session 96: the
//     former «one closure writes once» froze the interim line). `stop_hook_active` is NOT the test: it is already true on the FIRST stop
//     after the closure whenever a guard blocked earlier in the same turn. .kaif/farewell-capture.json records which closure wrote last;
//   - a turn without a closure (the owner's «thanks» after the farewell) never touches the file;
//   - the write goes through a temporary file and a rename: a torn write never hands the next chat half a farewell.
// The project root is the directory of .kaif/kaif.json above the event's `cwd` (twin of stop-status-guard.mjs); CLAUDE_PROJECT_DIR wins.
// The farewell file and the closure memory are session state: both are in the deployment's ignore-first set.
// Contract (Claude Code hooks reference, as for the other Stop hook of this module): stdin — JSON with `transcript_path`, `cwd`,
// `stop_hook_active`, `last_assistant_message` (when the harness gives it). Any internal error → exit 0 silently: a hook never stops the work.
// `--selftest` proves the turn reader on a transcript of the live record order. The field acceptance — tools/sandbox/probes/pt5-farewell.mjs
// of the origin.
// [TESTED: 2026-10-30 · the origin's live closing turn of session 95 (the former rule) read back by step 0 of /resume of session 96 — the
//  file equal to that turn's farewell; the present rule replayed on the same real record — one write at the farewell, the two later stops
//  (answers to a neighbour) no write; acceptance 13/13, red on the former hook at (11)–(13), mutants «quiet ignored» and «a notification is
//  the owner» red on exactly their cases — testcases/reports/2026-10-30_s96-farewell-live-speech-scenarios.md. NOT YET live: a closing turn
//  woken by a background task's notification]
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

export const FAREWELL_FILE = 'FAREWELL_MESSAGE_FROM_THE_PREVIOUS_CHAT.md';
const MEMORY = join('.kaif', 'farewell-capture.json');
const DEPLOYMENT = join('.kaif', 'kaif.json');
const CLOSURE_SKILL = /^(?:[\w-]+:)?end-chat-(?:soft|force)$/;
const CLOSURE_COMMAND = /<command-name>\/?(?:[\w-]+:)?end-chat-(?:soft|force)<\/command-name>/;

function projectRoot(cwd) {
  for (let d = resolve(cwd); ;) {
    if (existsSync(join(d, DEPLOYMENT))) return d;
    const up = dirname(d);
    if (up === d) return cwd;
    d = up;
  }
}
const contentOf = (rec) => (rec && rec.message ? rec.message.content : undefined);
const blocks = (c) => (Array.isArray(c) ? c.filter(Boolean) : typeof c === 'string' ? [{ type: 'text', text: c }] : []);
const textOf = (bs) => bs.filter((b) => b.type === 'text').map((b) => b.text || '').join('\n');
// Session 96 (judge of epic PT, hunts 1–2): the live record of a Claude Code session (VS Code client, 2026-10-30) marks who woke the turn —
// the owner's prompt `origin.kind: "human"`, a background task's notification `"task-notification"` (isMeta false!), a neighbour session
// `"peer"`; a Stop hook's block reaches the model as an isMeta user record «Stop hook feedback: …». A record with no `origin` is read by the
// older rule (a CLI or an older version of the client).
const WAKE_KINDS = { 'task-notification': 'notification', peer: 'peer' };
function wakeOf(rec) {
  if (!rec || rec.type !== 'user') return null;
  const bs = blocks(contentOf(rec));
  if (!bs.length || bs.some((b) => b.type === 'tool_result')) return null;
  const text = textOf(bs);
  const kind = rec.origin && rec.origin.kind;
  if (kind) return kind === 'human' ? 'owner' : WAKE_KINDS[kind] || 'meta';
  if (/^Stop hook feedback:/.test(text)) return 'feedback';
  if (/^<task-notification>/.test(text.trim())) return 'notification';
  if (/^(?:Another Claude session sent a message|\[Cross-session)/.test(text.trim())) return 'peer';
  if (rec.isMeta) return 'meta';
  return text.trim() && !text.startsWith('<local-command-caveat>') ? 'owner' : null;
}
// The owner's real prompt opens a turn — never a skill body, a tool result, a CLI wrapper, a task's notification or a neighbour's message:
// work the closing turn waits on (a polygon in the background) belongs to the SAME turn.
const isOwnerPrompt = (rec) => wakeOf(rec) === 'owner';
// → { closed, closureId, text, quiet } of the transcript's last turn. `quiet` — the turn's last stop only ANSWERS a Stop hook's block or a
// neighbour's message (no tool call after it): that one line is not a farewell, the file keeps the one before it.
// [NOT-TESTED]
export function readTurn(lines) {
  const recs = [];
  for (const l of lines) { if (!l.trim()) continue; try { recs.push(JSON.parse(l)); } catch { /* a torn line */ } }
  let start = 0;
  for (let i = recs.length - 1; i >= 0; i--) if (isOwnerPrompt(recs[i])) { start = i; break; }
  let closed = false, closureId = '', tail = [], wake = 'owner', toolsSinceWake = 0;
  for (const rec of recs.slice(start)) {
    const bs = blocks(contentOf(rec));
    if (rec.type === 'user') {
      if (!rec.isMeta && CLOSURE_COMMAND.test(textOf(bs))) { closed = true; closureId = String(rec.uuid || 'command'); }
      if (bs.some((b) => b.type === 'tool_result')) tail = [];
      const w = wakeOf(rec);
      if (w && w !== 'meta') { wake = w; toolsSinceWake = 0; }
      continue;
    }
    if (rec.type !== 'assistant') continue;
    for (const b of bs) {
      if (b.type === 'tool_use') {
        if (b.name === 'Skill' && b.input && CLOSURE_SKILL.test(String(b.input.skill || '').trim())) { closed = true; closureId = String(b.id || rec.uuid || 'skill'); }
        tail = []; toolsSinceWake++;
      } else if (b.type === 'text' && b.text && b.text.trim()) tail.push(b.text);
    }
  }
  return { closed, closureId, text: tail.join('\n\n').trim(), quiet: (wake === 'feedback' || wake === 'peer') && toolsSinceWake === 0 };
}
// The decision, pure: what to write where, or null.
export function capture(event, readFile = (p) => readFileSync(p, 'utf8')) {
  if (!event || !event.transcript_path) return null;
  const turn = readTurn(readFile(event.transcript_path).split('\n'));
  if (!turn.closed || turn.quiet) return null;   // no closure, or the stop only answers a block or a neighbour
  const root = process.env.CLAUDE_PROJECT_DIR || projectRoot(String(event.cwd || process.cwd()));
  const text = typeof event.last_assistant_message === 'string' && event.last_assistant_message.trim() ? event.last_assistant_message.trim() : turn.text;
  return text ? { root, text, closureId: turn.closureId } : null;
}

if (process.argv[2] === '--selftest') {
  let bad = 0;
  const ok = (good, line) => { if (!good) bad++; console.log((good ? 'ok   ' : 'FAIL ') + line); };
  const J = (r) => JSON.stringify(r);
  const owner = J({ type: 'user', uuid: 'u1', message: { content: 'close the chat' } });
  const skill = J({ type: 'assistant', message: { content: [{ type: 'tool_use', id: 't1', name: 'Skill', input: { skill: 'end-chat-soft' } }] } });
  const result = J({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't1' }] } });
  const body = J({ type: 'user', isMeta: true, message: { content: [{ type: 'text', text: 'skill body' }] } });
  const work = J({ type: 'assistant', message: { content: [{ type: 'text', text: 'working' }, { type: 'tool_use', id: 't2', name: 'Bash' }] } });
  const bye = J({ type: 'assistant', message: { content: [{ type: 'text', text: 'Bye.' }] } });
  const summary = J({ type: 'system', subtype: 'stop_hook_summary' });
  const t = readTurn([owner, skill, result, body, work, result, bye, summary]);
  ok(t.closed && t.closureId === 't1' && t.text === 'Bye.', 'a closing turn: closure t1, the text after the last tool call');
  ok(!readTurn([owner, skill, result, bye, J({ type: 'user', message: { content: 'thanks' } }), J({ type: 'assistant', message: { content: [{ type: 'text', text: 'np' }] } })]).closed,
    'a turn after the closing one (the owner\'s thanks) is not a closure');
  ok(readTurn([J({ type: 'user', uuid: 'u7', message: { content: '<command-name>/end-chat-force</command-name>' } }), bye]).closureId === 'u7', 'the owner\'s slash command is a closure');
  // session 96: the live record forms of who woke the turn (VS Code client, 2026-10-30)
  const feedback = J({ type: 'user', isMeta: true, message: { content: [{ type: 'text', text: 'Stop hook feedback:\nKAIF STATUS guard ...' }] } });
  const oneLine = J({ type: 'assistant', message: { content: [{ type: 'text', text: 'No new knowledge.' }] } });
  const notice = J({ type: 'user', origin: { kind: 'task-notification' }, message: { content: '<task-notification>\n<task-id>b1</task-id>' } });
  const peer = J({ type: 'user', isMeta: true, origin: { kind: 'peer' }, message: { content: 'Another Claude session sent a message: ...' } });
  const waiting = J({ type: 'assistant', message: { content: [{ type: 'text', text: 'Waiting for the polygon.' }] } });
  const files = { 'T.jsonl': [owner, skill, result, bye].join('\n'), 'F.jsonl': [owner, skill, result, bye, summary, feedback, oneLine].join('\n'),
    'N.jsonl': [owner, skill, result, waiting, summary, notice, work, result, bye].join('\n'), 'P.jsonl': [owner, skill, result, bye, summary, peer, oneLine].join('\n') };
  const read = (p) => { const k = Object.keys(files).find((f) => p.endsWith(f)); if (!k) throw new Error('no ' + p); return files[k]; };
  process.env.CLAUDE_PROJECT_DIR = 'ROOT';
  const c1 = capture({ transcript_path: 'T.jsonl', stop_hook_active: true }, read);
  const c2 = capture({ transcript_path: 'F.jsonl', last_assistant_message: 'No new knowledge.', stop_hook_active: true }, read);
  ok(c1 && c1.text === 'Bye.' && c1.root === 'ROOT' && c2 === null, 'the first stop writes even with stop_hook_active; the one-line answer to a guard\'s block writes nothing');
  const c3 = capture({ transcript_path: 'N.jsonl' }, read);
  ok(c3 && c3.text === 'Bye.' && capture({ transcript_path: 'P.jsonl' }, read) === null,
    'a task\'s notification does not open a new turn — the farewell after it is written; a one-line answer to a neighbour is not');
  console.log(bad ? `selftest: ${bad} FAIL` : 'selftest: all ok');
  process.exit(bad ? 1 : 0);
}

try {
  let event = null;
  try { event = JSON.parse(readFileSync(0, 'utf8').replace(/^\uFEFF/, '') || '{}'); } catch { /* unreadable stdin — nothing to do */ }
  const c = capture(event);
  if (c) {
    const out = join(c.root, FAREWELL_FILE);
    writeFileSync(out + '.tmp', c.text + '\n', 'utf8');
    renameSync(out + '.tmp', out);
    mkdirSync(join(c.root, '.kaif'), { recursive: true });
    writeFileSync(join(c.root, MEMORY), JSON.stringify({ closureId: c.closureId, at: new Date().toISOString() }) + '\n');
  }
} catch { /* a hook must never take the session down with it */ }
process.exit(0);
