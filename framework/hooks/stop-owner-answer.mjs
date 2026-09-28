#!/usr/bin/env node
// stop-owner-answer.mjs — the END-OF-RESPONSE hook that makes an answer to the owner's mid-turn word VISIBLE and then lets the work go
// on (KAIF 2.9, epic OA; optional refresh-hooks module, deployed to .kaif/hooks/; origin bug 123 and its field recurrence on 2.8 — one
// project's first text about the owner's word came 108 tool calls later). Claude Code event: Stop.
//
// Why at the end of a response: a text written between tool calls is not a guaranteed delivery — the vendor writes the transcript
// asynchronously («may lag the in-memory conversation»), and in the field and in the origin the answer an agent believed it wrote
// before a tool call was recorded as reasoning, not as text (origin session 76, twice on one evening). A response that ends WITHOUT a
// tool call is what the owner sees, and the vendor hands its text to the Stop hook as `last_assistant_message` (researches/36).
//
// What it does, for the owner's messages typed while the agent worked in THIS turn (transcript records `type: "attachment"`,
// `attachment.type: "queued_command"`, `origin.kind: "human"`, after the prompt that opened the turn):
//   1. the response that ends does not open an answer to each with its first words (normalised whole words — a two-letter word is
//      not found inside a longer one) → BLOCK once: answer them now in a response of its own; `stop_hook_active` (a continuation
//      the vendor already runs) is silent here, so this never loops;
//   2. the response answers them and its last line opens with the continue mark `⏩` («⏩ next: the build») → BLOCK with «continue:
//      <that line>» — the owner has seen the answer, and the work goes on without his next word (the origin owner's word 2026-09-25
//      23:28 +03:00: answer and keep working). The mark is honoured only in a turn the owner wrote into; the vendor's
//      8-consecutive-continuation cap bounds it;
//   3. anything else → silent: the turn ends. Silent also on no `last_assistant_message` (an older client), a subagent, no transcript,
//      a peer's or a background message, any internal error. `KAIF_OWNER_WORD_GATE=off` switches it off with the call gate.
//
// Contract (live-fetched 2026-09-28 20:56 +03:00, https://code.claude.com/docs/en/hooks.md): «Stop hooks receive `stop_hook_active`,
// `last_assistant_message` …» · «The `last_assistant_message` field contains the text content of Claude's final response» ·
// «`"block"` prevents Claude from stopping» · «`reason` — Required when `decision` is `"block"`» · an 8-consecutive-continuation cap.
//
// @guard owner-answer-end-of-turn
// THREAT:         the owner writes while the agent works; the agent's answer stays in its reasoning or in a text that never reached the
//                 chat, and the turn ends — or the work stops — without the owner seeing an answer (bug 123; field recurrence 2026-09-26
//                 — 108 calls; origin session 76 — an answer written before a call recorded as reasoning, twice)
// PROVED-AGAINST: s14 — an owner's mid-turn message and a response without its first words → block «answer»; with them → silent; with
//                 them and a last line «⏩ …» → block «continue: …»; the mark without an owner's word → silent; stop_hook_active →
//                 no «answer» block, the mark still honoured; a peer's message → silent; a message of the PREVIOUS turn → silent;
//                 a two-letter word inside a longer one is not an answer; red on v2.8 (no such hook); hooks-mutants M14–M19
// GAP:            the check is FORM, not meaning — a response that repeats the owner's first words and says nothing is passed (the
//                 judge reads it); a continuation caused by another Stop hook sets `stop_hook_active` and the «answer» block is skipped
//                 for that stop; clients without `last_assistant_message` are not judged; agent systems without a Stop event
// ON-REAL-PATH:   NOT YET — replayed on the REAL transcript of origin session 76 (its first turn: three owner's mid-turn messages, a final
//                 response answering them by number, not by their words) → block naming all three; the live path waits for the
//                 owner's next mid-turn word in a session with the hook wired (origin `.claude/settings.json`, 2026-09-28)
// [NOT-TESTED] on the live path — s14 and hooks-mutants are hygiene; run report testcases/reports/2026-09-28_oa-owner-answer-end-of-turn.md
import { readFileSync, openSync, readSync, fstatSync, closeSync } from 'node:fs';

const TAIL_BYTES = 4 * 1024 * 1024; // the tail of the transcript that is read — the current turn is recent by construction
const KEY_WORDS = 3;                // how many of the owner's first words the response must repeat
const QUOTE_CHARS = 200;            // how much of each owner's message is quoted back in the reason
const CONTINUE_MARK = '⏩';     // ⏩ — the first character of the last line that asks to go on after the answer

function readTail(path) {
  const fd = openSync(path, 'r');
  try {
    const size = fstatSync(fd).size, n = Math.min(size, TAIL_BYTES), buf = Buffer.alloc(n);
    readSync(fd, buf, 0, n, size - n);
    return buf.toString('utf8');
  } finally { closeSync(fd); }
}
const flat = (v) => (typeof v === 'string' ? v : Array.isArray(v) ? v.map(flat).join('') : v && typeof v === 'object' ? flat(v.text ?? v.content ?? '') : '');
// words: lower case, diacritics dropped (NFD — a letter with a diaeresis compares as its base letter), letters and digits only — punctuation,
// quotes and markdown do not decide whether the words are there
const words = (s) => String(s).toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(' ').filter(Boolean);
// the prompt that opened the turn: a user record whose content is a string AND that names its source (the owner's prompt, a peer's
// hand-back, a notification carry `promptSource`/`origin`). A Stop hook's own feedback is a string user record WITHOUT a source — it
// continues the turn, it does not open one (origin session 76, 2026-09-28 18:24: the boundary moved onto another hook's feedback, the
// owner's words fell into «the previous turn» and the continue mark was ignored)
const opensTurn = (r) => !!r && r.type === 'user' && !!r.message && typeof r.message.content === 'string' && !!(r.promptSource || r.origin);
const block = (reason) => { process.stdout.write(JSON.stringify({ decision: 'block', reason }) + '\n'); process.exit(0); };

try {
  if (String(process.env.KAIF_OWNER_WORD_GATE || '').toLowerCase() === 'off') process.exit(0);
  let input = {};
  try { input = JSON.parse(readFileSync(0, 'utf8').replace(/^\uFEFF/, '') || '{}'); } catch { process.exit(0); } // BOM: origin bug 119
  if (input.agent_id) process.exit(0);
  if (typeof input.last_assistant_message !== 'string' || !input.transcript_path) process.exit(0);
  const recs = readTail(String(input.transcript_path)).split('\n').map((l) => { try { return JSON.parse(l); } catch { return null; } });
  let start = -1;
  for (let i = recs.length - 1; i >= 0; i--) if (opensTurn(recs[i])) { start = i; break; }
  const owner = [];
  for (let i = start + 1; i < recs.length; i++) {
    const r = recs[i];
    if (!r || r.type !== 'attachment' || !r.attachment || r.attachment.type !== 'queued_command') continue;
    const who = (r.attachment.origin && r.attachment.origin.kind) || r.attachment.commandMode || '';
    if (who !== 'human') continue;
    const text = flat(r.attachment.prompt).replace(/\s+/g, ' ').trim();
    if (text) owner.push(text);
  }
  if (!owner.length) process.exit(0);
  const said = ' ' + words(input.last_assistant_message).join(' ') + ' ';
  const missing = owner.filter((t) => { const k = words(t).slice(0, KEY_WORDS); return k.length && !said.includes(' ' + k.join(' ') + ' '); });
  if (missing.length && input.stop_hook_active !== true) {
    const quoted = missing.map((t) => '«' + t.slice(0, QUOTE_CHARS) + (t.length > QUOTE_CHARS ? '…' : '') + '»').join(' · ');
    block('KAIF: the owner wrote while you were working and this response does not answer it yet: ' + quoted + '. A text between tool calls'
      + ' may never reach the chat — a response that ends without a tool call does. Answer now in a response of its own: open the answer'
      + ' to each message with its first words in «…» (a question → the answer; «stop» → where you stopped; «switch to Y» → the PARKED:'
      + ' line and Y); if work remains, end that response with a last line «' + CONTINUE_MARK + ' <next step>» and this hook resumes the work.'
      + ' (AGENT_GUIDE → «The owner\'s word mid-turn»; origin bug 123.)');
  }
  const lastLine = String(input.last_assistant_message).trim().split('\n').pop().trim();
  if (!missing.length && lastLine.startsWith(CONTINUE_MARK))
    block('KAIF: the owner has your answer — continue the work: ' + lastLine.slice(CONTINUE_MARK.length).trim().slice(0, QUOTE_CHARS)
      + '. (Another owner\'s word mid-turn → answer it the same way: a response of its own, then a last line «' + CONTINUE_MARK + ' <next step>».)');
  process.exit(0);
} catch { process.exit(0); }
