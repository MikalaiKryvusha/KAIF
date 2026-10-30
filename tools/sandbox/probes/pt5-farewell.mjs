// tools/sandbox/probes/pt5-farewell.mjs — a PROBE (not a polygon suite): the executable acceptance of step PT5 of version KAIF 2.10 (epic PT,
// plans/142; origin #181, criterion 29), written BEFORE the code. It runs the farewell hook the way Claude Code runs a Stop hook — one event as
// JSON on stdin — against transcripts whose record ORDER is copied from a live closing turn of this repository (EXP-0197: a fixture of a
// transcript probe is taken from the live record): Skill tool_use end-chat-soft → its tool_result → the skill body (isMeta) → work → the
// farewell text → system stop_hook_summary → queue-operation enqueue.
//   (1) a closing turn (Skill) with last_assistant_message → FAREWELL_MESSAGE_FROM_THE_PREVIOUS_CHAT.md at the root holds exactly it;
//   (2) no last_assistant_message → the transcript text after the turn's last tool call;
//   (3) a closure by the owner's slash command (<command-name>/end-chat-force</command-name>) → written;
//   (4) a turn without a closure (the owner's «thanks» after the farewell) → the file is left alone;
//   (5) a second stop of the SAME closure (another Stop hook blocked, the agent answered one line) → the file keeps the farewell;
//   (6) the FIRST stop after a closure while stop_hook_active is already true (a guard blocked earlier in the turn) → written (field #181, 2nd comment);
//   (7) an event from a subfolder → the file lands at the project root (the directory of .kaif/kaif.json);
//   (8) a broken stdin → exit 0, nothing written;
//   (9) the hook never blocks and never speaks: stdout empty in every case;
//  (10) no temporary file left behind; the closure memory lives under .kaif/;
//  (11) the closing turn stops on an interim line and is woken by a background task's notification → the farewell after it replaces the line;
//  (12) a guard blocks an EARLY stop and the agent works on → the farewell is written; (13) a one-line answer to a neighbour → the farewell stays.
// Red by construction until PT5 ships framework/hooks/stop-farewell-capture.mjs — exit 2 «hook not found».
// usage: node tools/sandbox/probes/pt5-farewell.mjs [<hook.mjs>]  (≈ 2 s; no window, no sound, no network)
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';

const HOOK = resolve(process.argv[2] || join('framework', 'hooks', 'stop-farewell-capture.mjs'));
if (!existsSync(HOOK)) { console.log('✖ hook not found: ' + HOOK + ' — PT5 has not shipped it yet (this probe is its acceptance, written first)'); process.exit(2); }
const FILE = 'FAREWELL_MESSAGE_FROM_THE_PREVIOUS_CHAT.md';
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const root = mkdtempSync(join(tmpdir(), 'kaif-pt5-'));
mkdirSync(join(root, '.kaif'), { recursive: true });
writeFileSync(join(root, '.kaif', 'kaif.json'), '{"framework":"KAIF"}\n');
mkdirSync(join(root, 'src', 'deep'), { recursive: true });
const FAREWELL = 'Closed: three steps done.\n\nNext chat: start with the polygon.';
// one closing turn, record order of a live transcript of the origin (session of 2026-10, /end-chat-soft)
const closingTurn = (closure, { tail = FAREWELL, prefix = [] } = {}) => [
  ...prefix,
  { type: 'user', uuid: 'u-owner', message: { role: 'user', content: closure === 'command' ? '<command-name>/end-chat-force</command-name>' : 'close the chat' } },
  ...(closure === 'skill' ? [
    { type: 'assistant', uuid: 'a1', message: { role: 'assistant', content: [{ type: 'tool_use', id: 'toolu_close_1', name: 'Skill', input: { skill: 'end-chat-soft' } }] } },
    { type: 'user', uuid: 'r1', message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: 'toolu_close_1', content: 'Launching skill: end-chat-soft' }] } },
    { type: 'user', uuid: 'm1', isMeta: true, message: { role: 'user', content: [{ type: 'text', text: '# /end-chat-soft — the skill body' }] } },
  ] : []),
  { type: 'assistant', uuid: 'a2', message: { role: 'assistant', content: [{ type: 'text', text: 'Committing.' }, { type: 'tool_use', id: 'toolu_bash_1', name: 'Bash', input: { command: 'git status' } }] } },
  { type: 'user', uuid: 'r2', message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: 'toolu_bash_1', content: 'clean' }] } },
  { type: 'assistant', uuid: 'a3', message: { role: 'assistant', content: [{ type: 'text', text: tail }] } },
  { type: 'system', subtype: 'stop_hook_summary' },
  { type: 'queue-operation', operation: 'enqueue' },
];
let n = 0;
const transcript = (recs) => { const p = join(root, 't' + (++n) + '.jsonl'); writeFileSync(p, recs.map((r) => JSON.stringify(r)).join('\n') + '\n'); return p; };
const call = (event, cwd = root) => spawnSync(process.execPath, [HOOK], { input: typeof event === 'string' ? event : JSON.stringify(event), encoding: 'utf8', timeout: 15000, cwd, env: { ...process.env, CLAUDE_PROJECT_DIR: '' } });
const stop = (recs, extra = {}) => ({ hook_event_name: 'Stop', session_id: 's1', cwd: root, transcript_path: transcript(recs), stop_hook_active: false, ...extra });
const file = () => { try { return readFileSync(join(root, FILE), 'utf8'); } catch { return null; } };
const quiet = []; const run = (ev, cwd) => { const r = call(ev, cwd); quiet.push(r.status === 0 && !(r.stdout || '').trim()); return r; };

run(stop(closingTurn('skill'), { last_assistant_message: 'LAST: ' + FAREWELL }));
say(file() === 'LAST: ' + FAREWELL + '\n', '(1) a closing turn (Skill) → the file holds last_assistant_message: ' + JSON.stringify(String(file()).slice(0, 40)));

rmSync(join(root, FILE), { force: true }); rmSync(join(root, '.kaif', 'farewell-capture.json'), { force: true });
run(stop(closingTurn('skill')));
say(file() === FAREWELL + '\n', '(2) no last_assistant_message → the text after the last tool call: ' + JSON.stringify(String(file()).slice(0, 40)));

rmSync(join(root, FILE), { force: true }); rmSync(join(root, '.kaif', 'farewell-capture.json'), { force: true });
const cmdTurn = closingTurn('command');
run(stop(cmdTurn));
say(file() === FAREWELL + '\n', '(3) a closure by the owner\'s /end-chat-force command → written');

const thanks = [...cmdTurn, { type: 'user', uuid: 'u-thanks', message: { role: 'user', content: 'thanks!' } },
  { type: 'assistant', uuid: 'a9', message: { role: 'assistant', content: [{ type: 'text', text: 'You are welcome.' }] } }];
run(stop(thanks, { last_assistant_message: 'You are welcome.' }));
say(file() === FAREWELL + '\n', '(4) a turn without a closure (the owner\'s thanks) → the farewell stays');

rmSync(join(root, FILE), { force: true }); rmSync(join(root, '.kaif', 'farewell-capture.json'), { force: true });
const skillTurn = closingTurn('skill');
run(stop(skillTurn, { last_assistant_message: FAREWELL }));
// session 96: the live order of a block — the guard's reason reaches the model as an isMeta user record «Stop hook feedback: …» (record 344
// of the origin's session 95); the fixture before it had no such record, so it could not tell a reply to a block from new work
const FEEDBACK = { type: 'user', uuid: 'fb1', isMeta: true, message: { role: 'user', content: [{ type: 'text', text: 'Stop hook feedback:\nKAIF STATUS guard (fires once per session): …' }] } };
const again = [...skillTurn, FEEDBACK, { type: 'assistant', uuid: 'a10', message: { role: 'assistant', content: [{ type: 'text', text: 'No new knowledge.' }] } }];
run(stop(again, { last_assistant_message: 'No new knowledge.', stop_hook_active: true }));
say(file() === FAREWELL + '\n', '(5) a second stop of the same closure — the one-line answer to another hook\'s block → the file keeps the farewell, not «No new knowledge.»');

rmSync(join(root, FILE), { force: true }); rmSync(join(root, '.kaif', 'farewell-capture.json'), { force: true });
run(stop(closingTurn('skill'), { last_assistant_message: FAREWELL, stop_hook_active: true }));
say(file() === FAREWELL + '\n', '(6) the FIRST stop after a closure with stop_hook_active already true → written');

rmSync(join(root, FILE), { force: true }); rmSync(join(root, '.kaif', 'farewell-capture.json'), { force: true });
run(stop(closingTurn('skill'), { cwd: join(root, 'src', 'deep'), last_assistant_message: FAREWELL }), join(root, 'src', 'deep'));
say(file() === FAREWELL + '\n' && !existsSync(join(root, 'src', 'deep', FILE)), '(7) an event from a subfolder → the file at the project root');

// (11)–(13) session 96, judge of epic PT (hunts 1–2): a closing turn that stops more than once before its farewell. Record forms from the live
// transcript of the origin's session 96 (VS Code client): a task's notification is a user record with origin.kind "task-notification" and
// isMeta false; a neighbour's message — origin.kind "peer", isMeta true; the judge saw the notification as an isMeta record — both forms.
const WAIT = 'Waiting for the polygon.';
const workAgain = [
  { type: 'assistant', uuid: 'a20', message: { role: 'assistant', content: [{ type: 'tool_use', id: 'toolu_bash_2', name: 'Bash', input: { command: 'git push' } }] } },
  { type: 'user', uuid: 'r20', message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: 'toolu_bash_2', content: 'pushed' }] } },
  { type: 'assistant', uuid: 'a21', message: { role: 'assistant', content: [{ type: 'text', text: FAREWELL }] } }];
for (const [label, notice] of [['origin task-notification', { type: 'user', uuid: 'n1', origin: { kind: 'task-notification' }, message: { role: 'user', content: '<task-notification>\n<task-id>b1</task-id>\n<status>completed</status>' } }],
  ['isMeta, no origin', { type: 'user', uuid: 'n2', isMeta: true, message: { role: 'user', content: [{ type: 'text', text: '<task-notification>\n<task-id>b2</task-id>' }] } }]]) {
  rmSync(join(root, FILE), { force: true }); rmSync(join(root, '.kaif', 'farewell-capture.json'), { force: true });
  const first = closingTurn('skill', { tail: WAIT });
  run(stop(first, { last_assistant_message: WAIT }));
  run(stop([...first, notice, ...workAgain], { last_assistant_message: FAREWELL }));
  say(file() === FAREWELL + '\n', '(11) the closing turn waits on a background task (' + label + ') → the farewell after the notification replaces the interim line: ' + JSON.stringify(String(file()).slice(0, 30)));
}
rmSync(join(root, FILE), { force: true }); rmSync(join(root, '.kaif', 'farewell-capture.json'), { force: true });
const early = closingTurn('skill', { tail: WAIT });
run(stop(early, { last_assistant_message: WAIT }));
run(stop([...early, FEEDBACK, ...workAgain], { last_assistant_message: FAREWELL, stop_hook_active: true }));
say(file() === FAREWELL + '\n', '(12) a guard blocks an EARLY stop and the agent works on (a tool call) → the farewell is written, not the interim line');
const PEER = { type: 'user', uuid: 'p1', isMeta: true, origin: { kind: 'peer' }, message: { role: 'user', content: 'Another Claude session sent a message: …' } };
run(stop([...early, FEEDBACK, ...workAgain, PEER, { type: 'assistant', uuid: 'a30', message: { role: 'assistant', content: [{ type: 'text', text: 'Noted, nothing to do.' }] } }],
  { last_assistant_message: 'Noted, nothing to do.' }));
say(file() === FAREWELL + '\n', '(13) a neighbour session\'s message after the farewell, answered in one line → the farewell stays');

rmSync(join(root, FILE), { force: true });
const r8 = run('{ not json');
say(r8.status === 0 && file() === null, '(8) a broken stdin → exit 0, nothing written');

say(quiet.every(Boolean), '(9) every call: exit 0 and empty stdout — the hook never blocks and never speaks (' + quiet.filter(Boolean).length + ' of ' + quiet.length + ')');
const left = readdirSync(root).filter((f) => /\.tmp$/.test(f)).concat(readdirSync(join(root, '.kaif')).filter((f) => /\.tmp$/.test(f)));
say(left.length === 0 && existsSync(join(root, '.kaif', 'farewell-capture.json')), '(10) no temporary file left; the closure memory is .kaif/farewell-capture.json');

rmSync(root, { recursive: true, force: true });
console.log(bad ? `✖ ${bad} BAD` : '✅ the farewell hook answers by the PT5 contract: one closure — one farewell at the project root, nothing else touched');
process.exit(bad ? 1 : 0);
