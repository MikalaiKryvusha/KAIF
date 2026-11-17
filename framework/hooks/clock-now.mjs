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
//  placeholder stayed literal and a new one got the minute (TK7z, judge hunt 4; testcases/reports/2026-10-30_tk7z-tk9-contour-clock.md); hygiene — --selftest 10/10, probe pt1-clock-now 8/8, the
//  carried-word mutant red on exactly its three cases; 2026-10-30 18:57 · session 96: --selftest 11/11 (the escaped-carry case of the
//  judge of session 95), the carried-word mutant (keep ignored) red on exactly its four cases]
import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';

const L = '\u27E6', R = '\u27E7';   // white square brackets around a placeholder word
const PLACEHOLDER = new RegExp('(\\\\?)' + L + '(NOW-ISO|NOW|DATE|TIME)' + R, 'g');
const WRITE_FIELDS = { Write: ['content'], Edit: ['new_string'], MultiEdit: [] };   // MultiEdit: edits[].new_string, handled below

const pad = (n) => String(n).padStart(2, '0');
// getTimezoneOffset() is minutes BEHIND UTC (positive west): Minsk returns -180 and is written +03:00.
// 2.10 TK10 (c), origin #193: the owner's OWN prompt marks his presence — `.kaif/owner-presence.json` { "at": ISO } at the project root
// (the nearest folder above `cwd` holding `.kaif/kaif.json`; CLAUDE_PROJECT_DIR wins). The contour reads it and lifts its quiet hours
// while the mark is fresh: an owner typing in the chat is not asleep (the field owner: «but I asked» — a call he ordered at 07:57 was
// silenced by the window 00:00–08:00). A background task's notification, the harness's text and a subagent's hand-back are not his.
// Nothing is written outside a deployment; the mark is session state (ignored).
export const PRESENCE = join('.kaif', 'owner-presence.json');
const NOT_THE_OWNER = /^\s*<(?:task-notification|system-reminder|agent-message)\b/;
function deploymentRoot(cwd) {
  for (let d = resolve(cwd || '.'); ;) {
    if (existsSync(join(d, '.kaif', 'kaif.json'))) return d;
    const up = dirname(d);
    if (up === d) return null;
    d = up;
  }
}
export function markPresence(root, prompt, now = new Date()) {
  if (!root || NOT_THE_OWNER.test(String(prompt || ''))) return false;
  const p = join(root, PRESENCE);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify({ at: now.toISOString() }));
  return true;
}

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
// bugs/143 (2.10; origin #197 pp. 1 and 3 — and the source's own session 103, four files): a placeholder written with ASCII brackets stayed
// letters with no word from the hook, and a placeholder quoted in a code span — a text ABOUT it — got the clock's value. In a markdown
// file the clock fills only OUTSIDE code (an inline code span, a fenced block); a write that carries the ASCII form outside code gets one
// line to the agent alongside the tool result (PreToolUse `additionalContext` arrives with the result — researches/41 §5) — the text is
// never changed for it and the write never stops.
// [TESTED: 2026-11-18 01:29–01:34 · functional — the source's LIVE Claude Code session: the edit bringing ASCII forms got the line with the
//  tool result (a .mjs — a false hit, narrowed to markdown; the next .mjs edit silent), two AGENT_GUIDE.md edits kept the placeholder in a code span
//  literal; the prompt line came with the exact characters; probe pt1-clock-now.mjs —
//  10 of 10, the HEAD hook red on exactly (8)–(10); hygiene — three selftest cases «bugs/143»; report testcases/reports/2026-11-18_bugs143-clock-placeholder.md]
const ASCII_FORM = /\[(NOW-ISO|NOW)\]/g;
export const isMarkdown = (p) => /\.(md|markdown)$/i.test(String(p || ''));
// The text as [isCode, piece] pieces, joined back byte for byte: fenced blocks (``` or ~~~ lines) and inline code spans are code.
// Judge of session 103 (finding 2): the rules are CommonMark's — a fence closes only on a line of the SAME character at least as long as
// the opening one (a four-backtick fence holds a three-backtick line), and a code span is a run of N backticks up to the next run of exactly
// N, inside one paragraph — across a line end too (a span broken by the wrap of a long line). An unmatched run is literal backticks.
export function codeSplit(text) {
  const out = [];
  let fence = null, para = [];
  const flushPara = () => {
    if (!para.length) return;
    const t = para.join(''); para = [];
    const runs = /`+/g;
    let last = 0, m;
    while ((m = runs.exec(t))) {
      const close = new RegExp('(?<!`)' + m[0] + '(?!`)', 'g');
      close.lastIndex = m.index + m[0].length;
      const c = close.exec(t);
      if (!c) continue;                                    // no closing run of the same length: literal backticks
      if (m.index > last) out.push([false, t.slice(last, m.index)]);
      out.push([true, t.slice(m.index, c.index + m[0].length)]);
      last = c.index + m[0].length; runs.lastIndex = last;
    }
    if (last < t.length) out.push([false, t.slice(last)]);
  };
  for (const line of String(text).split(/(?<=\n)/)) {     // the line ends stay with their lines
    const f = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fence) {
      out.push([true, line]);
      if (f && f[1][0] === fence[0] && f[1].length >= fence.length && /^ {0,3}[`~]+\s*$/.test(line)) fence = null;
      continue;
    }
    if (f) { flushPara(); fence = f[1]; out.push([true, line]); continue; }
    if (!line.trim()) { flushPara(); out.push([false, line]); continue; }
    para.push(line);
  }
  flushPara();
  return out;
}
const outsideCode = (text, md, fn) => (md ? codeSplit(text).map(([code, piece]) => (code ? piece : fn(piece))).join('') : fn(text));
export function fill(text, v, keep = new Set(), md = false) {
  return typeof text === 'string'
    ? outsideCode(text, md, (t) => t.replace(PLACEHOLDER, (all, esc, word) => (keep.has(word) ? all : esc ? L + word + R : v[word]))) : text;
}
// The ASCII forms a write brings outside code that the text it replaces did not hold already; [] — nothing to say.
export function asciiForms(toolName, input, readOld = (p) => '') {
  // markdown only: documents are where an agent writes a moment; a source file naming the ASCII form is talking about it (observed live
  // at the source, session 103: this hook's own selftest edit got the line)
  if (!input || typeof input !== 'object' || !(toolName in WRITE_FIELDS) || !isMarkdown(input.file_path)) return [];
  const md = true;
  const pairs = toolName === 'Write' ? [[input.content, readOld(input.file_path)]] : toolName === 'Edit' ? [[input.new_string, input.old_string]]
    : (Array.isArray(input.edits) ? input.edits : []).map((e) => [e && e.new_string, e && e.old_string]);
  const found = new Set();
  for (const [nw, old] of pairs) {
    if (typeof nw !== 'string') continue;
    const had = new Set((typeof old === 'string' ? old.match(ASCII_FORM) : null) || []);
    outsideCode(nw, md, (t) => { for (const m of t.match(ASCII_FORM) || []) if (!had.has(m)) found.add(m); return t; });
  }
  return [...found].sort();
}
export const asciiLine = (forms) => `clock-now · this write keeps ${forms.join(' · ')} as letters — the clock fills only the word between the white ` +
  `square brackets ${L}NOW${R} (${L}NOW-ISO${R} · ${L}DATE${R} · ${L}TIME${R}), never ASCII [ ]: rewrite the moment with them; a text ABOUT the ` +
  'placeholder keeps it in a code span.';
const fileText = (p) => { try { return typeof p === 'string' ? readFileSync(p, 'utf8') : ''; } catch { return ''; } };
// The new tool input, or null when nothing changes (the hook then stays silent).
export function rewrite(toolName, input, v, readOld = fileText) {
  if (!input || typeof input !== 'object' || !(toolName in WRITE_FIELDS)) return null;
  const out = { ...input };
  let changed = false;
  const keep = carriedWords(toolName === 'Write' ? readOld(input.file_path) : input.old_string);
  const md = isMarkdown(input.file_path);
  for (const f of WRITE_FIELDS[toolName]) { const t = fill(out[f], v, keep, md); if (t !== out[f]) { out[f] = t; changed = true; } }
  if (toolName === 'MultiEdit' && Array.isArray(input.edits)) {
    out.edits = input.edits.map((e) => {
      if (!e || typeof e !== 'object') return e;
      const t = fill(e.new_string, v, carriedWords(e.old_string), md);
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
  { // bugs/143 (#197 pp. 1 and 3): a markdown code span and fenced block keep a placeholder; the ASCII form outside code is named
    const md = rewrite('Write', { file_path: 'r.md', content: 'quoted `' + P('NOW') + '` · real ' + P('TIME') + '\n```\n' + P('DATE') + '\n```\nafter ' + P('DATE') }, v);
    ok(md && md.content === 'quoted `' + P('NOW') + '` · real 07:05\n```\n' + P('DATE') + '\n```\nafter 2026-10-23',
      'bugs/143 #197: a markdown code span and a fenced block keep the placeholder; outside them it is filled');
    // judge of session 103 (finding 2): a span broken by a line end, and a four-backtick fence holding a three-backtick line
    const wrap = rewrite('Write', { file_path: 'w.md', content: 'see `the form\n' + P('NOW') + '` · real ' + P('TIME') }, v);
    const F4 = '````', F3 = '```';
    const f4 = rewrite('Write', { file_path: 'f.md', content: F4 + '\n' + F3 + '\n' + P('NOW') + '\n' + F4 + '\nafter ' + P('DATE') }, v);
    ok(wrap && wrap.content === 'see `the form\n' + P('NOW') + '` · real 07:05'
      && f4 && f4.content === F4 + '\n' + F3 + '\n' + P('NOW') + '\n' + F4 + '\nafter 2026-10-23',
      'bugs/143 (judge s103): a code span across a line end keeps it; a four-backtick fence holds a three-backtick line; after the fence — filled');
    const js = rewrite('Write', { file_path: 'r.mjs', content: 'const at = `' + P('NOW') + '`;' }, v);
    ok(js && js.content === 'const at = `2026-10-23 07:05 +03:00`;', 'bugs/143: outside markdown a backtick is the language\'s own — filled as before');
    const a1 = asciiForms('Write', { file_path: 'n.md', content: 'Created: [NOW] · `[NOW-ISO]` in code' }, () => '');
    const a2 = asciiForms('Edit', { file_path: 'n.md', old_string: 'was [NOW]', new_string: 'was [NOW] still' });
    const a3 = asciiForms('Write', { file_path: 'n.md', content: 'plain ' + P('NOW') }, () => '');
    const a4 = asciiForms('Edit', { file_path: 'x.mjs', old_string: 'a', new_string: "'[NOW]'" });
    ok(a1.join() === '[NOW]' && a2.length === 0 && a3.length === 0 && a4.length === 0 && /never ASCII \[ \]/.test(asciiLine(a1))
      && asciiLine(a1).includes(P('NOW')),
      'bugs/143 #197: the ASCII form outside code of a markdown file is named with the exact characters; in code, carried, a real placeholder, a source file — silence');
  }
  { // TK10 (c), #193: the owner's own prompt writes the presence mark; a notification, a harness text and a subagent's hand-back do not
    const t = mkdtempSync(join(tmpdir(), 'kaif-clock-presence-'));
    try {
      const at = new Date(2026, 10, 4, 7, 50, 0);
      const own = markPresence(t, 'login trouble — call me by voice', at);
      const mark = existsSync(join(t, PRESENCE)) ? JSON.parse(readFileSync(join(t, PRESENCE), 'utf8').replace(/^\uFEFF/, '')) : null;
      rmSync(join(t, PRESENCE), { force: true });
      const others = ['<task-notification><task-id>x</task-id>', '<system-reminder>y', '<agent-message from="a">z'].map((p) => markPresence(t, p, at));
      ok(own && mark && mark.at === at.toISOString() && others.every((x) => x === false) && !existsSync(join(t, PRESENCE)),
        'presence (#193): the owner\'s prompt writes .kaif/owner-presence.json; a notification, a harness text, a hand-back — nothing');
      ok(markPresence(null, 'hi', at) === false, 'presence: outside a deployment — nothing is written');
    } finally { rmSync(t, { recursive: true, force: true }); }
  }
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
    try { markPresence(process.env.CLAUDE_PROJECT_DIR || deploymentRoot(input.cwd), input.prompt); } catch { /* the mark never stops the line */ }
    // bugs/143: the exact characters, not their name — «white square brackets» was read as ASCII [ ] in the field and at the source
    const line = `clock-now · ${v.NOW} (ISO ${v['NOW-ISO']}) — the machine's clock; write a moment as ${L}NOW${R} — the word NOW between the ` +
      `white square brackets U+27E6 and U+27E7, never ASCII [NOW] (${L}NOW-ISO${R} · ${L}DATE${R} · ${L}TIME${R} likewise); this hook fills it on ` +
      'Write · Edit · MultiEdit, outside code spans and code blocks of a markdown file.';
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: line } }));
  } else if (event === 'PreToolUse') {
    const tool = String(input.tool_name || '');
    const updated = rewrite(tool, input.tool_input, v);
    const forms = asciiForms(tool, input.tool_input, fileText);
    const answer = { hookEventName: 'PreToolUse', ...(updated ? { updatedInput: updated } : {}), ...(forms.length ? { additionalContext: asciiLine(forms) } : {}) };
    if (updated || forms.length) process.stdout.write(JSON.stringify({ hookSpecificOutput: answer }));
  }
} catch { /* a hook must never take the session down with it */ }
process.exit(0);
