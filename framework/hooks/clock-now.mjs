#!/usr/bin/env node
// clock-now.mjs — the "the machine's clock writes the moment" hook (KAIF 2.10, epic PT, step PT1; origin tickets #170 · #172; optional
// refresh-hooks module, deployed to .kaif/hooks/). Claude Code events: UserPromptSubmit and PreToolUse (Write · Edit · MultiEdit).
//
// What it does: mechanizes the canon rule "A stamp carries BOTH the date AND the time" (AGENT_GUIDE.md → "Document and text hygiene"). A
// model has no clock: it takes "now" from the amount of work done, and nine plausible stamps in a row once missed reality by two hours
// (origin bugs/78). Two halves:
//   (1) UserPromptSubmit → one context line with the machine's local moment, so the agent reads the time instead of guessing it;
//   (2) PreToolUse of a write → the agent writes a PLACEHOLDER where a moment goes, and this hook replaces it with the clock's value in the
//       tool input before the tool runs. The placeholders are the words NOW · NOW-ISO · DATE · TIME in white square brackets (U+27E6 /
//       U+27E7) — spelled in this file only as escapes: the wired hook would otherwise fill its own text. A backslash before a placeholder
//       keeps it literal (a text ABOUT the placeholders) and the backslash is dropped.
//       A placeholder the write only CARRIES is kept literal too (2.10 TK7z, judge hunt 4): a word that already stands in the Edit's
//       `old_string` (MultiEdit: that edit's `old_string`) or in the file a Write replaces — a text about the placeholders, rewritten next
//       to them, kept getting the clock's value in their place.
// The values, local time of the machine: NOW — the prose stamp `YYYY-MM-DD HH:MM ±HH:MM`; NOW-ISO — `YYYY-MM-DDTHH:MM:SS±HH:MM`; DATE —
// `YYYY-MM-DD`; TIME — `HH:MM`.
//
// Contract (Claude Code hooks reference, read for the recon of the origin's researches/41, PT0): stdin — JSON with `hook_event_name`,
// `cwd`, and for PreToolUse `tool_name` + `tool_input`; stdout on exit 0 — {"hookSpecificOutput": {"hookEventName": …, …}}.
// On PreToolUse the answer carries `updatedInput` — the WHOLE input, every other field byte for byte — and NO `permissionDecision`:
// "allow" would skip the owner's permission prompt (researches/41, decided against). `old_string` is never touched — it must match the
// file. The hook answers ONLY an input it changes; a write without a placeholder gets no output at all. A hook never stops the work and
// never breaks the session: any internal error → exit 0 silently (decision #144 of the origin: no KAIF hook stops the agent).
// The context line of (1) is English on purpose: the agent reads it, not the owner (AGENT_GUIDE.md → languages are routed by audience).
// `--selftest` proves the zone sign (both hemispheres), the four values, three write forms, the escape, silence on a plain write.
// [TESTED: 2026-10-23 16:58 · live Claude Code sessions of step PT3 — a file written with the placeholder read back with the clock's
//  date (testcases/reports/2026-10-23_pt3-live-hooks.md); 2026-10-30 16:30 · the origin's own live session with this file wired: a carried
//  placeholder stayed literal and a new one got the minute (TK7z, judge hunt 4); hygiene — --selftest 10/10, probe pt1-clock-now 8/8, the
//  carried-word mutant red on exactly its three cases]
import { readFileSync } from 'node:fs';

const L = '\u27E6', R = '\u27E7';   // white square brackets around a placeholder word
const PLACEHOLDER = new RegExp('(\\\\?)' + L + '(NOW-ISO|NOW|DATE|TIME)' + R, 'g');
const WRITE_FIELDS = { Write: ['content'], Edit: ['new_string'], MultiEdit: [] };   // MultiEdit: edits[].new_string, handled below

const pad = (n) => String(n).padStart(2, '0');
// getTimezoneOffset() is minutes BEHIND UTC (positive west): Minsk returns -180 and is written +03:00.
export function zoneOf(offsetMinutes) {
  const ahead = -offsetMinutes;
  const sign = ahead >= 0 ? '+' : '-';
  const a = Math.abs(ahead);
  return sign + pad(Math.floor(a / 60)) + ':' + pad(a % 60);
}
export function values(d = new Date(), offsetMinutes = d.getTimezoneOffset()) {
  const date = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const time = pad(d.getHours()) + ':' + pad(d.getMinutes());
  const zone = zoneOf(offsetMinutes);
  return { NOW: date + ' ' + time + ' ' + zone, 'NOW-ISO': date + 'T' + time + ':' + pad(d.getSeconds()) + zone, DATE: date, TIME: time };
}
// Words already standing literally in `carried` (the old text) are kept: the write only carries them.
export function carriedWords(carried) {
  const out = new Set();
  if (typeof carried === 'string') for (const m of carried.matchAll(PLACEHOLDER)) out.add(m[2]);   // escaped too (judge s95, hunt 3)
  return out;
}
export function fill(text, v, keep = new Set()) {
  return typeof text === 'string' ? text.replace(PLACEHOLDER, (all, esc, word) => (keep.has(word) ? all : esc ? L + word + R : v[word])) : text;
}
const fileText = (p) => { try { return typeof p === 'string' ? readFileSync(p, 'utf8') : ''; } catch { return ''; } };
// The new tool input, or null when nothing changes (the hook then stays silent).
export function rewrite(toolName, input, v, readOld = fileText) {
  if (!input || typeof input !== 'object' || !(toolName in WRITE_FIELDS)) return null;
  const out = { ...input };
  let changed = false;
  const keep = carriedWords(toolName === 'Write' ? readOld(input.file_path) : input.old_string);
  for (const f of WRITE_FIELDS[toolName]) { const t = fill(out[f], v, keep); if (t !== out[f]) { out[f] = t; changed = true; } }
  if (toolName === 'MultiEdit' && Array.isArray(input.edits)) {
    out.edits = input.edits.map((e) => {
      if (!e || typeof e !== 'object') return e;
      const t = fill(e.new_string, v, carriedWords(e.old_string));
      if (t === e.new_string) return e;
      changed = true;
      return { ...e, new_string: t };
    });
  }
  return changed ? out : null;
}

if (process.argv[2] === '--selftest') {
  let bad = 0;
  const ok = (good, line) => { if (!good) bad++; console.log((good ? 'ok   ' : 'FAIL ') + line); };
  const P = (w) => L + w + R;
  ok(zoneOf(-180) === '+03:00' && zoneOf(300) === '-05:00' && zoneOf(0) === '+00:00' && zoneOf(-330) === '+05:30', 'zone sign both hemispheres: ' +
    [-180, 300, 0, -330].map(zoneOf).join(' '));
  const d = new Date(2026, 9, 23, 7, 5, 9);
  const v = values(d, -180);
  ok(v.NOW === '2026-10-23 07:05 +03:00' && v['NOW-ISO'] === '2026-10-23T07:05:09+03:00' && v.DATE === '2026-10-23' && v.TIME === '07:05',
    'four values: ' + JSON.stringify(v));
  const w = rewrite('Write', { file_path: 'a.md', content: P('NOW') + ' | ' + P('NOW-ISO') }, v);
  ok(w && w.file_path === 'a.md' && w.content === '2026-10-23 07:05 +03:00 | 2026-10-23T07:05:09+03:00', 'Write: content filled, file_path kept');
  const e = rewrite('Edit', { file_path: 'b.md', old_string: 'x', new_string: P('DATE'), replace_all: true }, v);
  ok(e && e.old_string === 'x' && e.new_string === '2026-10-23' && e.replace_all === true, 'Edit: new_string filled, old_string untouched');
  // TK7z (judge hunt 4): a placeholder the edit only carries stays; a new word next to it is filled
  const c = rewrite('Edit', { file_path: 'b.md', old_string: 'write ' + P('NOW') + ' here', new_string: 'write ' + P('NOW') + ' here · at ' + P('TIME') }, v);
  ok(c && c.new_string === 'write ' + P('NOW') + ' here · at 07:05', 'carried: a word in old_string stays literal, a new word is filled');
  const cw = rewrite('Write', { file_path: 'f.md', content: 'about ' + P('NOW') + ', done ' + P('DATE') }, v, () => 'about ' + P('NOW'));
  ok(cw && cw.content === 'about ' + P('NOW') + ', done 2026-10-23', 'carried: a Write keeps a word the replaced file already holds');
  ok(rewrite('Edit', { file_path: 'g.md', old_string: P('NOW'), new_string: P('NOW') }, v) === null, 'carried only: silence');
  ok(rewrite('Edit', { file_path: 'h.md', old_string: 'x \\' + P('NOW'), new_string: 'x \\' + P('NOW') + ' y' }, v) === null,
    'carried ESCAPED: the backslash stays — the edit only carries it (judge of session 95)');
  const m = rewrite('MultiEdit', { file_path: 'c.md', edits: [{ old_string: 'x', new_string: P('TIME') }, { old_string: 'y', new_string: 'z' }] }, v);
  ok(m && m.edits[0].new_string === '07:05' && m.edits[1].new_string === 'z' && m.edits[0].old_string === 'x', 'MultiEdit: only the edit with a placeholder');
  const s = rewrite('Write', { file_path: 'd.md', content: 'about \\' + P('NOW') + ', real ' + P('TIME') }, v);
  ok(s && s.content === 'about ' + P('NOW') + ', real 07:05', 'a backslash keeps the placeholder literal');
  ok(rewrite('Write', { file_path: 'e.md', content: 'plain' }, v) === null && rewrite('Bash', { command: P('NOW') }, v) === null,
    'silence: a write without a placeholder, a tool that is not a write');
  console.log(bad ? `selftest: ${bad} FAIL` : 'selftest: all ok');
  process.exit(bad ? 1 : 0);
}

try {
  let input = null;
  try {
    // A leading U+FEFF is dropped before the parse — twin of prompt-resume-word.mjs (Windows PowerShell 5.1 pipes put it there).
    input = JSON.parse(readFileSync(0, 'utf8').replace(/^\uFEFF/, '') || '{}');
  } catch { /* unreadable stdin — nothing to answer */ }
  const event = input && input.hook_event_name;
  const v = values();
  if (event === 'UserPromptSubmit') {
    const line = `clock-now · ${v.NOW} (ISO ${v['NOW-ISO']}) — the machine's clock; write a moment as the NOW placeholder in white square ` +
      `brackets (NOW-ISO · DATE · TIME likewise) and this hook fills it on Write · Edit · MultiEdit.`;
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: line } }));
  } else if (event === 'PreToolUse') {
    const updated = rewrite(String(input.tool_name || ''), input.tool_input, v);
    if (updated) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', updatedInput: updated } }));
  }
} catch { /* a hook must never take the session down with it */ }
process.exit(0);
