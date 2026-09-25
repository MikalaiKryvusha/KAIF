// tools/sandbox/probes/ow1-midturn-scan.mjs — a PROBE (not a polygon suite): step OW1 of plans/119 (2.8, epic OW; bugs/123). Reads a
// Claude Code session transcript (JSONL) and lists every message that reached the agent MID-TURN — the harness stores it as an
// `attachment` record of type `queued_command` — by WHO sent it: `origin.kind` "human" (the owner) · "peer" (another session, a
// subagent hand-back) · `commandMode` "task-notification" (the system). For every HUMAN one it counts the agent's tool calls between
// the message and the agent's first text reply — the measure of bugs/123: session 67 answered the owner's «СТОП ЧАТА НЕМЕДЛЕННО» with
// two more tool calls, «без судьи закрывай чат» with eleven minutes of work.
// usage: node tools/sandbox/probes/ow1-midturn-scan.mjs <transcript.jsonl> [--quote]   (read-only; --quote prints the first 80 chars
//        of each message — the transcript is private data of this machine, quote only locally)
// Output: one line per mid-turn message, then a summary by sender and «human: max tool calls before the first reply».
// [TESTED: 2026-09-25 14:39–14:43 +03:00 · session 74: the transcript of session 67 — 28 mid-turn messages (human 13 · peer 3 ·
//  task-notification 12), the human rows cross-checked by one-off reads of the same records (#1770, #3388, #3419: rendered text and the
//  agent's next actions — 2 tool calls after «СТОП ЧАТА НЕМЕДЛЕННО», matching the probe); this session's transcript — 7 task-notification,
//  0 human (the empty branch); no argument — usage, exit 2. Findings in researches/34 §1; runs of it — testcases/reports/2026-09-25_ow2-owner-word-mid-turn.md
//  and the OW10 judge (the 19:32 recurrence: 18 calls, no answer)]
import { readFileSync, existsSync } from 'node:fs';

const [file, ...flags] = process.argv.slice(2);
if (!file || !existsSync(file)) { console.log('usage: node tools/sandbox/probes/ow1-midturn-scan.mjs <transcript.jsonl> [--quote]'); process.exit(2); }
const QUOTE = flags.includes('--quote');
const QUOTE_CHARS = 80;
const recs = readFileSync(file, 'utf8').split('\n').map((l) => { try { return JSON.parse(l); } catch { return null; } });
const flat = (v) => (typeof v === 'string' ? v : Array.isArray(v) ? v.map(flat).join('') : v && typeof v === 'object' ? flat(v.text ?? v.content ?? '') : '');
const senderOf = (a) => (a.origin && a.origin.kind) || a.commandMode || 'unknown';

// What the agent did after record i: tool calls until its first non-empty text block, and when that text came.
function afterMessage(i) {
  let tools = 0;
  for (let k = i + 1; k < recs.length; k++) {
    const x = recs[k];
    if (!x || x.type !== 'assistant' || !Array.isArray(x.message?.content)) continue;
    for (const c of x.message.content) {
      if (c.type === 'tool_use') tools++;
      if (c.type === 'text' && c.text.trim()) return { tools, replyAt: x.timestamp };
    }
  }
  return { tools, replyAt: null };
}

const bySender = {};
let humanMax = 0;
recs.forEach((r, i) => {
  if (!r || r.type !== 'attachment' || !r.attachment || r.attachment.type !== 'queued_command') return;
  const who = senderOf(r.attachment);
  bySender[who] = (bySender[who] || 0) + 1;
  const text = flat(r.attachment.prompt).replace(/\s+/g, ' ');
  let tail = '';
  if (who === 'human') {
    const a = afterMessage(i);
    humanMax = Math.max(humanMax, a.tools);
    const secs = a.replyAt ? Math.round((Date.parse(a.replyAt) - Date.parse(r.timestamp)) / 1000) : null;
    tail = ` · tool calls before the first TEXT: ${a.tools} · text after ${secs === null ? '—' : secs + ' s'} (read it: is it the answer?)`;
  }
  console.log(`#${i + 1} ${r.timestamp} ${who}${tail}${QUOTE ? ' :: ' + text.slice(0, QUOTE_CHARS) : ` (${text.length} chars)`}`);
});
const total = Object.values(bySender).reduce((s, n) => s + n, 0);
console.log(`mid-turn messages: ${total} — ${Object.entries(bySender).map(([k, n]) => `${k} ${n}`).join(' · ') || 'none'}`);
console.log(`human: max tool calls before the first text = ${humanMax} — a text is not an answer until the judge READS it (judge OW10 H9)`);
