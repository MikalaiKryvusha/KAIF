// tools/sandbox/probes/tk5-contour-mutants.mjs — a PROBE (not a polygon suite): step TK5 of version KAIF 2.10 (epic TK; origin tickets
// #147 · #142 · #109 · #136) proved RED, one mutant per change, on a COPY of framework/tools/contour (TESTING_FRAMEWORK gate 5; EXP-0169 —
// the addressees are named BEFORE the run, and a mutant whose edit did not apply is a failure of the proof, not a green).
//   control: the copy as is — the shipped selftest has no red line;
//   M1 «выше» judged the 2.9 way (a reference unless a comparison follows)   → exactly the case «TK5 #147»;
//   M2 no leading waiting mark in docStatus()                                 → exactly «TK5 #109»;
//   M3 lengthWarnings() never names a question                               → exactly «TK5 #142»;
//   M4 an html artifact rendered as markdown                                 → exactly «TK5 #136».
// The selftest runs in quietEnv() (no window, no sound — bugs/116). usage: node tools/sandbox/probes/tk5-contour-mutants.mjs (≈ 1 min; alone)
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { quietEnv } from '../../lib/sandbox-run.mjs';

const SRC = join(process.cwd(), 'framework', 'tools', 'contour');
const RUN_TIMEOUT_MS = 600000;
const OLD_REF_BACK = String.raw`refBack: '(?<!\\p{L})(?:выше(?!\\p{L})(?!\\s*,?\\s*(?:чем(?!\\p{L})|[\\d~≈<>]|на\\s+\\d|в\\s+\\d))|вон`;
const MUTANTS = [
  { name: 'M1 «выше» the 2.9 way', file: 'texts.mjs', find: /refBack: '\(\?<!\\\\p\{L\}\)\(\?:\(\?:\(\?:таблиц[^\n]*?\|вон/, to: () => OLD_REF_BACK, red: 'TK5 #147' },
  { name: 'M2 no leading waiting mark', file: 'core.mjs', find: /  if \(STATUS_WAITING_LEAD_RE\.test\(line\)\) return 'waiting';\n/, to: () => '', red: 'TK5 #109' },
  { name: 'M3 length never named', file: 'core.mjs', find: /if \(chars > budget\) out\.push/, to: () => 'if (false) out.push', red: 'TK5 #142' },
  { name: 'M4 html as markdown', file: 'review.mjs', find: /const html = \/\^html\$\/i\.test\(a\.format \|\| ''\);/, to: () => 'const html = false;', red: 'TK5 #136' },
];
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const redLines = (dir) => {
  const r = spawnSync(process.execPath, [join(dir, 'review.mjs'), '--selftest'], { cwd: process.cwd(), env: quietEnv({ KAIF_VOICE_TOOL: '' }),
    encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 26 });
  const out = (r.stdout || '') + (r.stderr || '');
  return { died: !/selftest (green|RED)/i.test(out), red: out.split(/\r?\n/).filter((l) => /^\s*x /.test(l)).map((l) => l.trim()) };
};
const copy = () => { const d = mkdtempSync(join(tmpdir(), 'kaif-tk5-')); cpSync(SRC, d, { recursive: true }); return d; };

{
  const d = copy(); const r = redLines(d);
  say(!r.died && r.red.length === 0, 'control copy: ' + (r.died ? 'DIED' : r.red.length + ' red line(s)'));
  for (const l of r.red) console.log('    ' + l.slice(0, 200));
  rmSync(d, { recursive: true, force: true });
}
for (const m of MUTANTS) {
  const d = copy(); const p = join(d, m.file); const before = readFileSync(p, 'utf8');
  const after = before.replace(m.find, m.to);
  if (after === before) { say(false, m.name + ': the edit did not apply'); rmSync(d, { recursive: true, force: true }); continue; }
  writeFileSync(p, after);
  const r = redLines(d);
  say(!r.died && r.red.length === 1 && r.red[0].includes(m.red), m.name + ': ' + (r.died ? 'DIED' : r.red.length + ' red line(s)') + ' (expected exactly «' + m.red + '»)');
  for (const l of r.red) console.log('    ' + l.slice(0, 200));
  rmSync(d, { recursive: true, force: true });
}
console.log(bad ? `✖ ${bad} BAD` : '✅ each TK5 change is red on its own selftest case only; the control copy is silent');
process.exit(bad ? 1 : 0);
