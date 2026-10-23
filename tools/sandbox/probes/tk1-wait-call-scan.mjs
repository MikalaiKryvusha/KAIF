// tools/sandbox/probes/tk1-wait-call-scan.mjs — a PROBE (not a polygon suite): step TK3 of plans/137 (version KAIF 2.10, epic TK). Reads a
// Claude Code session transcript (JSONL) and judges how every TURN ended — the measure of criteria 1, 2 and 20 of plans/136:
//   (1) a turn whose last text ends on a question to the owner and no call ran in that turn (origin ticket #157 — the KAIF owner, rendered
//       from Russian: "the agent stopped, waits for the owner and did not call by voice — and it had to!");
//   (2) a turn whose last text asks leave for the agent's own next step (origin ticket #140) — the dictionary of leave forms is data below;
//   (3) a turn that ended while a background task launched in it had not reported yet (bugs/131 — the KAIF owner: "the agent was told to
//       work autonomously — and it stands and does not work!"); the probe cannot know whether a named time was set — it counts, the reader judges.
// A turn opens at a user record with a prompt source or origin (the boundary of ow1-midturn-scan.mjs) and ends where the next one opens.
// usage: node tools/sandbox/probes/tk1-wait-call-scan.mjs <transcript.jsonl> [--quote]   (read-only; --quote prints the last 100 chars of
//        each flagged turn's text — the transcript is private data of this machine, quote only locally)
//        node tools/sandbox/probes/tk1-wait-call-scan.mjs --selftest   (a synthetic transcript in the OS temp: each branch red once, a turn
//        with a call silent, the open last turn not judged)
// [TESTED: 2026-10-18 02:51 · --selftest (synthetic: T1 the #157 phrase «Запускаем проверку режима на новой кривой?» → LEAVE; T2 a wait
//  without a call → WAIT; T3 the same wait with `review.mjs --call` → silent; T4 a background task not reported → ENDED-WITH-LIVE-BACKGROUND;
//  T5 open → not judged) · the live transcript of the origin's session 88: the turn opened 2026-10-17T23:26Z (02:26 local) — the bugs/131
//  incident, a polygon running — is named ENDED-WITH-LIVE-BACKGROUND; three of its turns ended on a chat question to the owner with no call;
//  report testcases/reports/2026-10-18_tk2-turn-end-decision.md]
import { readFileSync, existsSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

if (process.argv[2] === '--selftest') {
  const dir = mkdtempSync(join(tmpdir(), 'kaif-tk3-'));
  const fx = join(dir, 't.jsonl');
  const prompt = (ts, text) => ({ type: 'user', promptSource: 'chat', timestamp: ts, message: { content: text } });
  const say = (ts, text) => ({ type: 'assistant', timestamp: ts, message: { content: [{ type: 'text', text }] } });
  const tool = (ts, command) => ({ type: 'assistant', timestamp: ts, message: { content: [{ type: 'tool_use', name: 'Bash', input: { command } }] } });
  const result = (ts, text) => ({ type: 'user', timestamp: ts, message: { content: [{ type: 'tool_result', content: text }] } });
  writeFileSync(fx, [
    prompt('T1', 'check the mode'), say('T1a', 'Проверил настройки. Запускаем проверку режима на новой кривой?'),
    prompt('T2', 'go on'), say('T2a', 'The stand needs a password; the work stops without it. Will you give it?'),
    prompt('T3', 'go on'), tool('T3a', 'node tools/review.mjs --call "the stand password"'), say('T3b', 'Called you: the stand needs a password. Will you give it?'),
    prompt('T4', 'work for an hour'), tool('T4a', 'npm run test:core'), result('T4b', 'Command running in background with ID: abc123.'), say('T4c', 'The test run is going.'),
    // TK7c (session 92): a task the agent STOPPED is no live task — the stop result is its report (session 91: a false red of this probe)
    prompt('T4s', 'work for an hour'), result('T4sa', 'Command running in background with ID: def456.'),
    result('T4sb', '{"message":"Successfully stopped task: def456 (npm run test:core)"}'), say('T4sc', 'Stopped the stale run; done.'),
    prompt('T5', 'more'), say('T5a', 'Working.'),
  ].map((r) => JSON.stringify(r)).join('\n') + '\n');
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), fx], { encoding: 'utf8' });
  rmSync(dir, { recursive: true, force: true });
  const out = r.stdout || '';
  const want = [['T1  LEAVE-FOR-OWN-STEP', true], ['T2  WAIT-WITHOUT-CALL', true], ['T3  ', false], ['T4  ENDED-WITH-LIVE-BACKGROUND (1)', true],
    ['T4s  ', false], ['T5  ', false], ['turns judged: 5', true]];
  let bad = 0;
  for (const [line, present] of want) { const ok = out.includes(line) === present; if (!ok) bad++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${present ? 'has' : 'lacks'} «${line.trim()}»`); }
  console.log(bad ? `selftest: ${bad} FAIL` : 'selftest: all ok');
  process.exit(bad ? 1 : 0);
}

const [file, ...flags] = process.argv.slice(2);
if (!file || !existsSync(file)) { console.log('usage: node tools/sandbox/probes/tk1-wait-call-scan.mjs <transcript.jsonl> [--quote] [--include-last] | --selftest'); process.exit(2); }
const QUOTE = flags.includes('--quote');
const QUOTE_CHARS = 100;
const TAIL_CHARS = 400;   // the question must stand in the closing part of the last text, not anywhere in it
const recs = readFileSync(file, 'utf8').split('\n').map((l) => { try { return JSON.parse(l); } catch { return null; } });
const opensTurn = (r) => r && r.type === 'user' && !!(r.promptSource || r.origin)
  && (typeof r.message?.content === 'string' || (Array.isArray(r.message?.content) && r.message.content.some((b) => b && b.type === 'text')));
// a call is the contour's `--call` or any command of the project that names a call
const CALL = /review\.mjs[^\n]*--call\b|--call\s+"/;
// leave asked for the agent's own step — Russian and English forms seen in the field (#140, #157); a closing question mark is required
const LEAVE = /(?:сделать|делать|делаем|запускаем|запустить|продолжа(?:ю|ть|ем)|приступ(?:ить|аю)|начинать|начинаем|беру|брать|взяться)[^?\n]{0,120}\?|\b(?:shall|should) I\b[^?\n]{0,120}\?|\bdo I (?:continue|go on|proceed)\b[^?\n]{0,60}\?|\b(?:go ahead|proceed)\b[^?\n]{0,60}\?/i;
const flat = (v) => (typeof v === 'string' ? v : Array.isArray(v) ? v.map(flat).join('') : v && typeof v === 'object' ? flat(v.text ?? v.content ?? '') : '');

const turns = [];
for (let i = 0; i < recs.length; i++) if (opensTurn(recs[i])) turns.push(i);
turns.push(recs.length);

let waitNoCall = 0, leave = 0, stood = 0, judged = 0;
// the transcript's LAST turn may still be running (the probe read the live session) — judged only with --include-last
const LAST = flags.includes('--include-last') ? turns.length - 1 : turns.length - 2;
if (LAST < turns.length - 1) console.log(`(the last turn, opened ${recs[turns[turns.length - 2]]?.timestamp ?? '?'}, is not judged — it may be running; --include-last judges it)`);
for (let t = 0; t < LAST; t++) {
  const [from, to] = [turns[t], turns[t + 1]];
  let lastText = '', called = false;
  const launched = new Set(), reported = new Set();
  for (let k = from + 1; k < to; k++) {
    const x = recs[k];
    if (!x) continue;
    if (x.type === 'assistant' && Array.isArray(x.message?.content)) for (const c of x.message.content) {
      if (c.type === 'text' && c.text.trim()) lastText = c.text;
      if (c.type === 'tool_use' && CALL.test(String(c.input?.command ?? ''))) called = true;
    }
    const body = flat(x.message?.content ?? x.attachment ?? x.content ?? '');
    for (const m of body.matchAll(/running in background with ID: (\w+)/g)) launched.add(m[1]);
    for (const m of body.matchAll(/<task-id>(\w+)<\/task-id>/g)) reported.add(m[1]);
    for (const m of body.matchAll(/Successfully stopped task: (\w+)/g)) reported.add(m[1]); // a stopped task is no live one (session 92)
  }
  if (!lastText) continue;
  judged++;
  const tail = lastText.trim().slice(-TAIL_CHARS);
  const asks = /\?\s*$/.test(tail) || /\?\s*\S{0,3}\s*$/.test(tail);
  const isLeave = LEAVE.test(tail);
  const open = [...launched].filter((id) => !reported.has(id));
  const at = recs[from].timestamp || `#${from}`;
  const say = (kind) => console.log(`${at}  ${kind}${QUOTE ? `  «${tail.slice(-QUOTE_CHARS).replace(/\s+/g, ' ')}»` : ''}`);
  if (isLeave) { leave++; say('LEAVE-FOR-OWN-STEP'); } else if (asks && !called) { waitNoCall++; say('WAIT-WITHOUT-CALL'); }
  if (open.length) { stood++; say(`ENDED-WITH-LIVE-BACKGROUND (${open.length})`); }
}
console.log(`turns judged: ${judged}`);
console.log(`turns ending in a wait without a call: ${waitNoCall}`);
console.log(`turns ending in a permission question for own work: ${leave}`);
console.log(`turns ended while a background task launched in them had not reported: ${stood}`);
