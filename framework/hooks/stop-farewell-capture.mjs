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
//   - ONE closure writes ONCE: its id (the Skill tool_use id, or the owner prompt's uuid) is kept in .kaif/farewell-capture.json, and a later
//     stop of the same closure — after another Stop hook blocked and the agent answered one line — leaves the file alone. `stop_hook_active`
//     is NOT the test: it is already true on the FIRST stop after the closure whenever a guard blocked earlier in the same turn;
//   - a turn without a closure (the owner's «thanks» after the farewell) never touches the file;
//   - the write goes through a temporary file and a rename: a torn write never hands the next chat half a farewell.
// The project root is the directory of .kaif/kaif.json above the event's `cwd` (twin of stop-status-guard.mjs); CLAUDE_PROJECT_DIR wins.
// The farewell file and the closure memory are session state: both are in the deployment's ignore-first set.
// Contract (Claude Code hooks reference, as for the other Stop hook of this module): stdin — JSON with `transcript_path`, `cwd`,
// `stop_hook_active`, `last_assistant_message` (when the harness gives it). Any internal error → exit 0 silently: a hook never stops the work.
// `--selftest` proves the turn reader on a transcript of the live record order. The field acceptance — tools/sandbox/probes/pt5-farewell.mjs
// of the origin.
// [NOT-TESTED: the field hook this one is distilled from was observed writing a live farewell (field report on #181); this file — selftest and
//  the acceptance probe only until the origin's live closing turn is read back]
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
// The owner's real prompt: a user record that is not a skill body (isMeta), not a tool result, not a local CLI command's wrapper.
function isOwnerPrompt(rec) {
  if (!rec || rec.type !== 'user' || rec.isMeta) return false;
  const bs = blocks(contentOf(rec));
  if (!bs.length || bs.some((b) => b.type === 'tool_result')) return false;
  const text = textOf(bs);
  return Boolean(text.trim()) && !text.startsWith('<local-command-caveat>');
}
// → { closed, closureId, text } of the transcript's last turn.
export function readTurn(lines) {
  const recs = [];
  for (const l of lines) { if (!l.trim()) continue; try { recs.push(JSON.parse(l)); } catch { /* a torn line */ } }
  let start = 0;
  for (let i = recs.length - 1; i >= 0; i--) if (isOwnerPrompt(recs[i])) { start = i; break; }
  let closed = false, closureId = '', tail = [];
  for (const rec of recs.slice(start)) {
    const bs = blocks(contentOf(rec));
    if (rec.type === 'user') {
      if (!rec.isMeta && CLOSURE_COMMAND.test(textOf(bs))) { closed = true; closureId = String(rec.uuid || 'command'); }
      if (bs.some((b) => b.type === 'tool_result')) tail = [];
      continue;
    }
    if (rec.type !== 'assistant') continue;
    for (const b of bs) {
      if (b.type === 'tool_use') {
        if (b.name === 'Skill' && b.input && CLOSURE_SKILL.test(String(b.input.skill || '').trim())) { closed = true; closureId = String(b.id || rec.uuid || 'skill'); }
        tail = [];
      } else if (b.type === 'text' && b.text && b.text.trim()) tail.push(b.text);
    }
  }
  return { closed, closureId, text: tail.join('\n\n').trim() };
}
// The decision, pure: what to write where, or null.
export function capture(event, readFile = (p) => readFileSync(p, 'utf8')) {
  if (!event || !event.transcript_path) return null;
  const turn = readTurn(readFile(event.transcript_path).split('\n'));
  if (!turn.closed) return null;
  const root = process.env.CLAUDE_PROJECT_DIR || projectRoot(String(event.cwd || process.cwd()));
  let seen = '';
  try { seen = JSON.parse(readFile(join(root, MEMORY)).replace(/^\uFEFF/, '')).closureId || ''; } catch { /* no memory yet */ }
  if (turn.closureId && seen === turn.closureId) return null;   // a later stop of the same closure
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
  const files = { 'T.jsonl': [owner, skill, result, bye].join('\n') };
  const read = (p) => { const k = Object.keys(files).find((f) => p.endsWith(f)); if (!k) throw new Error('no ' + p); return files[k]; };
  process.env.CLAUDE_PROJECT_DIR = 'ROOT';
  const c1 = capture({ transcript_path: 'T.jsonl', stop_hook_active: true }, read);
  files['farewell-capture.json'] = J({ closureId: 't1' });
  const c2 = capture({ transcript_path: 'T.jsonl', last_assistant_message: 'No new knowledge.' }, read);
  ok(c1 && c1.text === 'Bye.' && c1.root === 'ROOT' && c2 === null, 'the first stop writes even with stop_hook_active; a later stop of the same closure writes nothing');
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
