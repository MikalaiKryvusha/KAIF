// tools/sandbox/probes/pt1-clock-now.mjs — a PROBE (not a polygon suite): the executable acceptance of step PT1 of version KAIF 2.10 (epic PT,
// plans/142; origin #170 · #172, criterion 24), written BEFORE the code (the precedent: ic3-contour-generator.mjs). It runs the clock hook the
// way Claude Code runs it — one event as JSON on stdin, the answer read from stdout — and judges the contract of plans/142 PT1 and of the
// recon researches/41 (PT0: `updatedInput` WITHOUT a permission decision — "allow" is never taken):
//   (1) UserPromptSubmit → one line of context that carries the machine's local minute (compared with this process's own clock, ±1 min);
//   (2) PreToolUse Write with the NOW placeholder in `content` → `updatedInput.content` carries the prose stamp, `file_path` byte for byte,
//       and NO `permissionDecision` in the answer;
//   (3) Edit: `new_string` filled, `old_string` untouched (it must match the file);
//   (4) MultiEdit: `edits[].new_string` filled, an edit without a placeholder untouched;
//   (5) a backslash before a placeholder keeps it literal (a text ABOUT the placeholders);
//   (6) a write without a placeholder → no output at all, exit 0 (the hook answers only an input it changes);
//   (7) a broken stdin → no output, exit 0 (a hook never stops the work).
// The placeholders are the field's (ideas/34): NOW · NOW-ISO · DATE · TIME in white square brackets (U+27E6 / U+27E7).
// Red by construction until PT1 ships framework/hooks/clock-now.mjs — exit 2 «hook not found».
// usage: node tools/sandbox/probes/pt1-clock-now.mjs [<hook.mjs>]  (≈ 2 s; no window, no sound, no network)
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, join } from 'node:path';

const HOOK = resolve(process.argv[2] || join('framework', 'hooks', 'clock-now.mjs'));
if (!existsSync(HOOK)) { console.log('✖ hook not found: ' + HOOK + ' — PT1 has not shipped it yet (this probe is its acceptance, written first)'); process.exit(2); }
const L = '⟦', R = '⟧';
const ph = (name) => L + name + R;
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const call = (event) => {
  const r = spawnSync(process.execPath, [HOOK], { input: typeof event === 'string' ? event : JSON.stringify(event), encoding: 'utf8', timeout: 15000 });
  let json = null; try { json = r.stdout.trim() ? JSON.parse(r.stdout) : null; } catch { /* judged below */ }
  return { code: r.status, out: r.stdout || '', json, hso: json && json.hookSpecificOutput };
};
const pad = (n) => String(n).padStart(2, '0');
const localMinute = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
const nearNow = (text) => [-60000, 0, 60000].some((dt) => String(text).includes(localMinute(new Date(Date.now() + dt))));
const pre = (tool_name, tool_input) => ({ hook_event_name: 'PreToolUse', tool_name, tool_input, cwd: process.cwd() });

const r1 = call({ hook_event_name: 'UserPromptSubmit', prompt: 'hello', cwd: process.cwd() });
say(r1.code === 0 && r1.hso && r1.hso.hookEventName === 'UserPromptSubmit' && nearNow(r1.hso.additionalContext),
  '(1) UserPromptSubmit → a context line with the machine minute: ' + String(r1.hso && r1.hso.additionalContext).slice(0, 90));

const w = { file_path: 'notes/a.md', content: 'at ' + ph('NOW') + ' · ' + ph('NOW-ISO') + ' · ' + ph('DATE') + ' ' + ph('TIME') };
const r2 = call(pre('Write', w));
const u2 = r2.hso && r2.hso.updatedInput;
say(r2.code === 0 && u2 && u2.file_path === w.file_path && nearNow(u2.content) && !u2.content.includes(L) && !('permissionDecision' in (r2.hso || {})),
  '(2) Write: content filled, file_path kept, no permission decision: ' + String(u2 && u2.content).slice(0, 90));

const e = { file_path: 'notes/b.md', old_string: ph('NOW') + ' old', new_string: 'new ' + ph('NOW'), replace_all: false };
const r3 = call(pre('Edit', e));
const u3 = r3.hso && r3.hso.updatedInput;
say(r3.code === 0 && u3 && u3.old_string === e.old_string && nearNow(u3.new_string) && u3.replace_all === false && u3.file_path === e.file_path,
  '(3) Edit: new_string filled, old_string and the other fields untouched');

const m = { file_path: 'notes/c.md', edits: [{ old_string: 'x', new_string: ph('TIME') }, { old_string: 'y', new_string: 'z' }] };
const r4 = call(pre('MultiEdit', m));
const u4 = r4.hso && r4.hso.updatedInput;
say(r4.code === 0 && u4 && Array.isArray(u4.edits) && /^\d{2}:\d{2}$/.test(u4.edits[0].new_string) && u4.edits[1].new_string === 'z' && u4.edits[0].old_string === 'x',
  '(4) MultiEdit: the edit with a placeholder filled, the other untouched');

const r5 = call(pre('Write', { file_path: 'notes/d.md', content: 'literal \\' + ph('NOW') + ', real ' + ph('DATE') }));
const u5 = r5.hso && r5.hso.updatedInput;
say(r5.code === 0 && u5 && u5.content.startsWith('literal ' + ph('NOW') + ', real ') && !u5.content.includes('\\' + L),
  '(5) a backslash keeps the placeholder literal: ' + String(u5 && u5.content).slice(0, 60));

const r6 = call(pre('Write', { file_path: 'notes/e.md', content: 'no stamp here' }));
say(r6.code === 0 && r6.out.trim() === '', '(6) a write without a placeholder → no output, exit ' + r6.code);

const r7 = call('{ not json');
say(r7.code === 0 && r7.out.trim() === '', '(7) a broken stdin → no output, exit ' + r7.code);

console.log(bad ? `✖ ${bad} BAD` : '✅ the clock hook answers by the PT1 contract: the minute in context, placeholders filled without a permission decision, silence otherwise');
process.exit(bad ? 1 : 0);
