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
// Session 93 (step TK7e): a launch is read from the harness's structured fields (`toolUseResult.backgroundTaskId` of a background command,
// `status: async_launched` + `agentId` of a background subagent) — background subagents were invisible (judge TK7c, hunt 5: 26 turns), and
// text matching took quoted launch lines for launches.
// Session 94 (step TK7f, judge of epic TK hunt 1 — REFUTED the count of TK7e): a REPORT counts only if it stands BEFORE the turn's last
// assistant record — the harness writes the notification's `queue-operation/enqueue` into the OLD turn after its end, and the probe read it
// as a report (TK7e's "21 → 46" was half the truth: 92); a call is an EXECUTED `node …review.mjs … --call` without `--dry-run` — grep, sed
// and dry runs counted as calls. GAPS: a report is still read from text — a tool output quoting the id of a live task BEFORE the turn's last
// assistant record would read it reported (false green); a wait is judged only by a closing «?» (session 90, 08:40 — an affirmative wait
// the probe does not judge; its call was in the record); the probe does not know a named time — the reader judges each named turn.
// [TESTED: 2026-10-23 16:21 · --selftest 14/14 (T4L report after the turn end → named, T4m mid-turn `queued_command` report → silent,
//  T3d dry run and T3g grep → WAIT) · mutants tools/sandbox/probes/tk1-scan-mutants.mjs 8/8 · 25 live records: 92 turns with a live
//  background task (judge's independent count ≈ 93 — one turn of session 93 was open when he measured) · report
//  testcases/reports/2026-10-23_tk7g-scan-late-report.md]
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
  const launch = (rec, toolUseResult) => ({ ...rec, toolUseResult });   // the harness's structured launch fields (session 93 survey)
  writeFileSync(fx, [
    prompt('T1', 'check the mode'), say('T1a', 'Проверил настройки. Запускаем проверку режима на новой кривой?'),
    prompt('T2', 'go on'), say('T2a', 'The stand needs a password; the work stops without it. Will you give it?'),
    prompt('T3', 'go on'), tool('T3a', 'node tools/review.mjs --call "the stand password"'), say('T3b', 'Called you: the stand needs a password. Will you give it?'),
    prompt('T4', 'work for an hour'), tool('T4a', 'npm run test:core'), launch(result('T4b', 'Command running in background with ID: abc123.'), { backgroundTaskId: 'abc123' }),
    say('T4c', 'The test run is going.'),
    // TK7c (session 92): a task the agent STOPPED is no live task — the stop result is its report (session 91: a false red of this probe)
    prompt('T4s', 'work for an hour'), launch(result('T4sa', 'Command running in background with ID: def456.'), { backgroundTaskId: 'def456' }),
    result('T4sb', '{"message":"Successfully stopped task: def456 (npm run test:core)"}'), say('T4sc', 'Stopped the stale run; done.'),
    // TK7d (session 93): a background SUBAGENT is a background task too — its launch is the Agent tool's result, its end the same notification
    prompt('T4g', 'work for an hour'), launch(result('T4ga', 'Async agent launched successfully.\nagentId: a0123456789abcdef'), { status: 'async_launched', agentId: 'a0123456789abcdef' }),
    say('T4gb', 'The judge is running.'),
    prompt('T4h', 'work for an hour'), launch(result('T4ha', 'Async agent launched successfully.\nagentId: afedcba9876543210'), { status: 'async_launched', agentId: 'afedcba9876543210' }),
    result('T4hb', '<task-notification>\n<task-id>afedcba9876543210</task-id>\n<status>completed</status>'), say('T4hc', 'The judge reported.'),
    // TK7d: a tool output QUOTING launch lines (a grep over an old transcript) launches nothing — session 93 counted 5 such false launches
    prompt('T4q', 'look at the old record'), result('T4qa', 'Async agent launched successfully.\nagentId: a1111111111111111\nCommand running in background with ID: zzz999.'),
    say('T4qb', 'The old record has one judge.'),
    // TK7f (session 94, judge of epic TK hunt 1): the harness writes the notification's `enqueue` into the OLD turn AFTER its end (after the
    // last assistant record and the stop-hook summary) — the live form of session 89, 08:40; a report that late is no report
    prompt('T4L', 'work for an hour'), launch(result('T4La', 'Command running in background with ID: lat111.'), { backgroundTaskId: 'lat111' }),
    say('T4Lb', 'The test run is going.'), { type: 'system', subtype: 'stop_hook_summary', timestamp: 'T4Lc' },
    { type: 'queue-operation', operation: 'enqueue', timestamp: 'T4Ld', content: '<task-notification>\n<task-id>lat111</task-id>\n<status>completed</status>' },
    // ...and the mid-turn form (session 89, 09:31): `enqueue` + `queued_command` attachment, then the agent goes on in the same turn
    prompt('T4m', 'work for an hour'), launch(result('T4ma', 'Command running in background with ID: mid222.'), { backgroundTaskId: 'mid222' }),
    { type: 'attachment', timestamp: 'T4mb', attachment: { type: 'queued_command', prompt: '<task-notification>\n<task-id>mid222</task-id>\n<status>completed</status>' } },
    say('T4mc', 'The run reported green.'),
    // TK7f: a call is an EXECUTED `review.mjs --call` without `--dry-run` — a dry run plays nothing, grep and sed call no one (judge hunt 1)
    prompt('T3d', 'go on'), tool('T3da', 'node tools/review.mjs --call "the stand password" --dry-run'), say('T3db', 'The work stops without the password. Will you give it?'),
    prompt('T3g', 'go on'), tool('T3ga', 'grep -o "review.mjs --call[^\\"]*" session.jsonl; sed -n 1,5p x'), say('T3gb', 'The work stops without the password. Will you give it?'),
    prompt('T5', 'more'), say('T5a', 'Working.'),
  ].map((r) => JSON.stringify(r)).join('\n') + '\n');
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), fx], { encoding: 'utf8' });
  rmSync(dir, { recursive: true, force: true });
  const out = r.stdout || '';
  const want = [['T1  LEAVE-FOR-OWN-STEP', true], ['T2  WAIT-WITHOUT-CALL', true], ['T3  ', false], ['T4  ENDED-WITH-LIVE-BACKGROUND (1)', true],
    ['T4s  ', false], ['T4g  ENDED-WITH-LIVE-BACKGROUND (1)', true], ['T4h  ', false], ['T4q  ', false],
    ['T4L  ENDED-WITH-LIVE-BACKGROUND (1)', true], ['T4m  ', false], ['T3d  WAIT-WITHOUT-CALL', true], ['T3g  WAIT-WITHOUT-CALL', true],
    ['T5  ', false], ['turns judged: 12', true]];
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
// a call is an EXECUTED contour `--call` — a shell segment that RUNS `node …review.mjs … --call` without `--dry-run`; text that only names
// a call (grep, sed, a quote) and a dry run (plays nothing) are no call (judge of epic TK, hunt 1: five such counted in sessions 88–92)
const CALL_SEGMENT = /^\s*(?:[A-Za-z_]\w*=\S*\s+)*(?:&\s*)?node(?:\.exe)?\s+\S*review\.mjs\b.*--call\b/;
const isCall = (command) => String(command).split(/&&|\|\||[;|\n]/).some((seg) => CALL_SEGMENT.test(seg) && !/--dry-run\b/.test(seg));
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
  let lastText = '', called = false, lastAssistant = -1;
  const launched = new Set(), reported = new Map();   // id → index of the record that reported it
  for (let k = from + 1; k < to; k++) {
    const x = recs[k];
    if (!x) continue;
    if (x.type === 'assistant') lastAssistant = k;
    if (x.type === 'assistant' && Array.isArray(x.message?.content)) for (const c of x.message.content) {
      if (c.type === 'text' && c.text.trim()) lastText = c.text;
      if (c.type === 'tool_use' && isCall(c.input?.command ?? '')) called = true;
    }
    // a mid-turn notification may come as a `queued_command` attachment whose text is its `prompt` (session 89, 09:31)
    const body = flat(x.message?.content ?? x.attachment ?? x.content ?? '') + (typeof x.attachment?.prompt === 'string' ? x.attachment.prompt : '');
    // a LAUNCH is read from the harness's structured result fields, never from text: text missed 5 real launches and took 5 quotes for
    // launches (session 93 survey of 25 records); a background subagent (judge TK7c hunt 5) is a launch too — its end is the same notification
    const u = x.toolUseResult;
    if (u && typeof u === 'object' && typeof u.backgroundTaskId === 'string') launched.add(u.backgroundTaskId);
    if (u && typeof u === 'object' && u.status === 'async_launched' && typeof u.agentId === 'string') launched.add(u.agentId);
    for (const m of body.matchAll(/<task-id>(\w+)<\/task-id>/g)) if (!reported.has(m[1])) reported.set(m[1], k);
    for (const m of body.matchAll(/Successfully stopped task: (\w+)/g)) if (!reported.has(m[1])) reported.set(m[1], k); // stopped = no live one (session 92)
  }
  if (!lastText) continue;
  judged++;
  const tail = lastText.trim().slice(-TAIL_CHARS);
  const asks = /\?\s*$/.test(tail) || /\?\s*\S{0,3}\s*$/.test(tail);
  const isLeave = LEAVE.test(tail);
  // a report counts only if it came BEFORE the turn's last assistant record: the harness writes the notification's `enqueue` into the old
  // turn after its end (after the stop-hook summary), and that turn ended with the task live (judge of epic TK, hunt 1)
  const open = [...launched].filter((id) => !(reported.has(id) && reported.get(id) < lastAssistant));
  const at = recs[from].timestamp || `#${from}`;
  const say = (kind) => console.log(`${at}  ${kind}${QUOTE ? `  «${tail.slice(-QUOTE_CHARS).replace(/\s+/g, ' ')}»` : ''}`);
  if (isLeave) { leave++; say('LEAVE-FOR-OWN-STEP'); } else if (asks && !called) { waitNoCall++; say('WAIT-WITHOUT-CALL'); }
  if (open.length) { stood++; say(`ENDED-WITH-LIVE-BACKGROUND (${open.length})`); }
}
console.log(`turns judged: ${judged}`);
console.log(`turns ending in a wait without a call: ${waitNoCall}`);
console.log(`turns ending in a permission question for own work: ${leave}`);
console.log(`turns ended while a background task launched in them had not reported: ${stood}`);
