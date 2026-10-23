// tools/sandbox/probes/tk7-contour-mutants.mjs — a PROBE (not a polygon suite): step TK7 of version KAIF 2.10 (epic TK; origin tickets
// #169 · #163 · #165) proved RED, one mutant per change, on a COPY of framework/tools/contour (TESTING_FRAMEWORK gate 5; EXP-0169 — the
// addressees are named BEFORE the run, and a mutant whose edit did not apply is a failure of the proof, not a green).
//   control: the copy as is — the shipped selftest has no red line;
//   M1 a live page of another document no longer refuses              → exactly «TK7 #169: a live page»;
//   M2 --timeout on the owner's window legal again                     → exactly «TK7 #169: --timeout»;
//   M3 a notice read on the queue page ends it (the 2.9 I8 exit)       → exactly «TK7 #163»;
//   M4 Latin words reach the Russian engine as written                 → exactly «TK7 #165: the Russian engine»;
//   M5 no lead silence in the call file                                → exactly «TK7 #165: the call is ONE file» and «TK7 #165: a stereo voice»
//      (both cases measure the silence before the beeps).
// Plus the Russian phrase of the call, read straight from the pack (the generator stays ASCII — guard 5d): no «вычитки» (#165, comment 1).
// The selftest runs in quietEnv() (no window, no sound — bugs/116). usage: node tools/sandbox/probes/tk7-contour-mutants.mjs (≈ 1–2 min; alone)
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { quietEnv } from '../../lib/sandbox-run.mjs';

const SRC = join(process.cwd(), 'framework', 'tools', 'contour');
const RUN_TIMEOUT_MS = 600000;
const MUTANTS = [
  { name: 'M1 another live page does not refuse', file: 'review.mjs', find: 'const other = otherLivePage(root, lockKey);', to: 'const other = null;', red: ['TK7 #169: a live page'] },
  { name: 'M2 --timeout on the window legal', file: 'review.mjs', find: "if (!args.includes('--timeout') || args.includes('--no-open')", to: "if (true || args.includes('--no-open')", red: ['TK7 #169: --timeout'] },
  { name: 'M3 a notice read ends the queue page', file: 'review.mjs', find: 'if (batch && (restQ > 0 || restN > 0)) {', to: 'if (false) {', red: ['TK7 #163'] },
  { name: 'M4 Latin reaches the engine', file: 'review.mjs', find: 'if (sp.letters && sp.translit) {', to: 'if (false) {', red: ['TK7 #165: the Russian engine'] },
  { name: 'M5 no lead silence', file: 'review.mjs', find: 'const CALL_LEAD_SILENCE_MS = 1000;', to: 'const CALL_LEAD_SILENCE_MS = 0;', red: ['TK7 #165: the call is ONE file', 'TK7 #165: a stereo voice'] },
];
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const redLines = (dir) => {
  const r = spawnSync(process.execPath, [join(dir, 'review.mjs'), '--selftest'], { cwd: process.cwd(), env: quietEnv({ KAIF_VOICE_TOOL: '' }),
    encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 26 });
  const out = (r.stdout || '') + (r.stderr || '');
  return { died: !/selftest (green|RED)/i.test(out), red: out.split(/\r?\n/).filter((l) => /^\s*x /.test(l)).map((l) => l.trim()) };
};
const copy = () => { const d = mkdtempSync(join(tmpdir(), 'kaif-tk7-')); cpSync(SRC, d, { recursive: true }); return d; };

{
  const { texts } = await import(pathToFileURL(join(SRC, 'texts.mjs')).href);
  const ru = texts('ru').call;
  const said = ru.interview('Николай', 'проекта', 'интервью', 'Скоуп', 2) + ' ' + ru.proofread('Николай', 'проект', 'Ноты');
  say(!/вычитк/u.test(said) && /ждёт ваших ответов/u.test(said), 'the Russian call says «ждёт ваших ответов», never «вычитки»: ' + said.slice(0, 160));
}
{
  const d = copy(); const r = redLines(d);
  say(!r.died && r.red.length === 0, 'control copy: ' + (r.died ? 'DIED' : r.red.length + ' red line(s)'));
  for (const l of r.red) console.log('    ' + l.slice(0, 200));
  rmSync(d, { recursive: true, force: true });
}
for (const m of MUTANTS) {
  const d = copy(); const p = join(d, m.file); const before = readFileSync(p, 'utf8');
  if (!before.includes(m.find)) { say(false, m.name + ': the edit did not apply'); rmSync(d, { recursive: true, force: true }); continue; }
  writeFileSync(p, before.replace(m.find, () => m.to));
  const r = redLines(d);
  say(!r.died && r.red.length === m.red.length && m.red.every((c) => r.red.some((l) => l.includes(c))), m.name + ': ' + (r.died ? 'DIED' : r.red.length + ' red line(s)') + ' (expected exactly «' + m.red.join('» · «') + '»)');
  for (const l of r.red) console.log('    ' + l.slice(0, 200));
  rmSync(d, { recursive: true, force: true });
}
console.log(bad ? `✖ ${bad} BAD` : '✅ each TK7 change is red on its own selftest case only; the control copy is silent; the Russian call has no «вычитки»');
process.exit(bad ? 1 : 0);
