// ki-live-hooks.mjs — read a LIVE Kimi Code run over a KAIF project: did Kimi itself fire the KAIF hooks? (plans/143 KA9; bugs/145)
//   node tools/sandbox/probes/ki-live-hooks.mjs <project> <stream-json log of `kimi -p … --output-format stream-json`>
// The run is made by hand (it spends the owner's Kimi quota): a fresh git project with KAIF installed for kimi-code, the hooks wired in
// ~/.kimi-code/config.toml, one `kimi -p` whose prompt makes the agent Read STATUS.md, Write src/app.mjs and call the Skill end-chat-soft.
// What each hook leaves when KIMI fires it (the evidence is the hook's own effect, never our call of the script):
//   UserPromptSubmit · context-window — the session in .kaif/context-window.json
//   PostToolUse      · test-after-code — src/app.mjs in .kaif/test-debt.json (or cleared later by a run of it)
//   PostToolUse      · knowledge-moment — .kaif/knowledge-moment.json exists
//   PreToolUse       · context-window (no matcher) — the closing gate refuses end-chat-soft below the closing level: the wire shows the refusal
//   Stop             · test-after-code — a continuation turn started by the stop hook (origin stop_hook), or the debt line in the wire
// Prints one line per piece of evidence (FOUND / ABSENT) and the wire's turns; exit 0 when every one is FOUND, 1 otherwise, 2 — bad input.
// Read-only.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const [project, log] = process.argv.slice(2);
if (!project || !log || !existsSync(log)) { console.log('usage: ki-live-hooks.mjs <project> <stream-json log>'); process.exit(2); }
const J = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };
const logText = readFileSync(log, 'utf8');
const km = J(join(project, '.kaif', 'knowledge-moment.json')) || {};
// the session id: the run's resume hint, else the newest key the hooks themselves wrote (a turn that failed prints no hint)
const newestKey = (o) => Object.keys(o).filter((k) => k.startsWith('session_')).sort((a, b) => String(o[b].at).localeCompare(String(o[a].at)))[0] || '';
const sid = (/"session_id"\s*:\s*"([^"]+)"/.exec(logText) || /(session_[0-9a-f-]{36})/.exec(logText) || [])[1] || newestKey(km);
const home = process.env.KIMI_CODE_HOME || join(homedir(), '.kimi-code');
let wire = '';
for (const wd of (() => { try { return readdirSync(join(home, 'sessions')); } catch { return []; } })()) {
  for (const s of [sid, `session_${sid}`]) { const p = join(home, 'sessions', wd, s, 'agents', 'main', 'wire.jsonl'); if (sid && existsSync(p)) wire = p; }
}
const wt = wire ? readFileSync(wire, 'utf8') : '';
console.log(`session ${sid || '(none in the log)'} · wire ${wire || '(not found)'}`);
const cw = J(join(project, '.kaif', 'context-window.json')) || {};
const debt = J(join(project, '.kaif', 'test-debt.json'));
const ev = [
  ['UserPromptSubmit · context-window: the session recorded', Object.keys(cw).some((k) => sid && k.includes(sid.replace(/^session_/, '')))],
  // only the hook's own trace counts — the debt in its file, or its debt text in the wire; the agent running the file by itself proves nothing
  ['PostToolUse · test-after-code: src/app.mjs became a debt', Boolean(debt && JSON.stringify(debt.debt || {}).includes('app.mjs')) || /KAIF testing:[^"]{0,400}src\/app\.mjs/.test(wt)],
  // UserPromptSubmit writes the state too — the PostToolUse trace is what only a tool event adds: weight, notes or a queued line
  ['PostToolUse · knowledge-moment: a tool event weighed or queued', (() => { const s = km[sid] || {}; return (Number(s.weight) > 0) || (s.notes || []).length > 0 || (s.pendingLines || []).length > 0; })()],
  ['PreToolUse · context-window: the closing gate refused end-chat-soft', /too early to close the chat by the window/.test(wt)],
  ['Stop · a hook opened a continuation turn', /stop_hook/.test(wt)],
];
let miss = 0;
for (const [what, found] of ev) { console.log(`${found ? 'FOUND ' : 'ABSENT'} ${what}`); if (!found) miss++; }
const turns = (wt.match(/"type":"(?:agent\.)?turn\.(?:started|ended)"[^\n]{0,160}/g) || []).map((s) => s.slice(0, 160));
console.log(`turns in the wire: ${turns.length}`); for (const t of turns.slice(0, 12)) console.log(`  ${t}`);
const hookTexts = [...new Set((wt.match(/KAIF [a-z-]+:[^"\\]{0,120}/g) || []))].slice(0, 12);
console.log(`KAIF hook texts seen by the model: ${hookTexts.length}`); for (const h of hookTexts) console.log(`  ${h}`);
process.exit(miss ? 1 : 0);
