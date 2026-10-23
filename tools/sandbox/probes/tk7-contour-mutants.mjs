// tools/sandbox/probes/tk7-contour-mutants.mjs — a PROBE (not a polygon suite): step TK7 of version KAIF 2.10 (epic TK; origin tickets
// #169 · #163 · #165) proved RED, one mutant per change, on a COPY of framework/tools/contour (TESTING_FRAMEWORK gate 5; EXP-0169 — the
// addressees are named BEFORE the run, and a mutant whose edit did not apply is a failure of the proof, not a green).
//   control: the copy as is — the shipped selftest has no red line;
//   M1 a live page of another document no longer refuses              → exactly «TK7 #169: a live page» and, since TK7b, «TK7b #169: a lock
//      caught half-written» (that case expects the refusal too);
//   M2 --timeout on the owner's window legal again                     → exactly «TK7 #169: --timeout»;
//   M3 a notice read on the queue page ends it (the 2.9 I8 exit)       → exactly «TK7 #163»;
//   M4 Latin words reach the Russian engine as written                 → exactly «TK7 #165: the Russian engine» and, since TK7b, «TK7b #165:
//      the Russian engine gets no letter» (that case also feeds Latin words);
//   M5 no lead silence in the call file                                → exactly «TK7 #165: the call is ONE file» and «TK7 #165: a stereo voice»
//      (both cases measure the silence before the beeps).
// Step TK7b (the judge's findings on TK7, researches/38 judge-tk7.md), one mutant per fix:
//   M6 liveness by pid only (the address not asked)                    → exactly «TK7b #169: a live pid that does not answer»;
//   M7 a half-written lock is not read again                           → exactly «TK7b #169: a lock caught half-written»;
//   M8 another page's unreadable lock deleted (the TK7 checkLock path) → exactly «TK7b #169: a live pid that does not answer» (it asserts the file stays);
//   M9 --timeout refused at every door again (TK7's three exceptions) → exactly «TK7b: --timeout is refused only where a page is shown»;
//   M10 the notice branch counts every pending document (pendingDocs)  → exactly «TK7b #163: the queue page counts what it SHOWS»;
//   M11 the last answer ignores an unread notice on the page           → exactly «TK7b #163, mirror»;
//   M12 a cut format chunk read anyway (RangeError)                    → exactly «TK7b #165: a WAV cut»;
//   M13 a data chunk without samples taken as a voice                  → exactly «TK7b #165: a WAV cut»;
//   M14 diacritics reach the engine                                     → exactly «TK7b #165: the Russian engine gets no letter»;
//   M15 the percent word does not agree (texts.mjs)                     → exactly «TK7b #165: the Russian engine gets no letter»;
//   M16 «1 000 000» read group by group                                 → exactly «TK7b #165: the Russian engine gets no letter»;
//   M17 the voice lock never holds                                      → exactly «TK7b: one voice at a time»;
//   after the judge of TK7b (judge-tk7b.md, hunts 4–5):
//   M18 `--list` alone is a no-window door again (a page on a timer)    → exactly «TK7 #169: --timeout»;
//   M19 a plain space joins ONE group of thousands («#165 100%»)        → exactly «TK7b #165: the Russian engine gets no letter».
// Plus the Russian phrase of the call, read straight from the pack (the generator stays ASCII — guard 5d): no «вычитки» (#165, comment 1).
// The selftest runs in quietEnv() (no window, no sound — bugs/116). usage: node tools/sandbox/probes/tk7-contour-mutants.mjs (≈ 6–7 min; alone)
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { quietEnv } from '../../lib/sandbox-run.mjs';

const SRC = join(process.cwd(), 'framework', 'tools', 'contour');
const RUN_TIMEOUT_MS = 600000;
const MUTANTS = [
  { name: 'M1 another live page does not refuse', file: 'review.mjs', find: "const other = await otherLivePage(root, batch ? '_queue' : basename(docPath));", to: 'const other = null;', red: ['TK7 #169: a live page', 'TK7b #169: a lock caught half-written'] },
  { name: 'M2 --timeout on the window legal', file: 'review.mjs', find: 'if (at < 0 ||', to: 'if (true ||', red: ['TK7 #169: --timeout'] },
  { name: 'M3 a notice read ends the queue page', file: 'review.mjs', find: 'if (batch && (restQ > 0 || restN > 0)) {', to: 'if (false) {', red: ['TK7 #163'] },
  { name: 'M4 Latin reaches the engine', file: 'review.mjs', find: 'if (sp.letters && sp.translit) {', to: 'if (false) {', red: ['TK7 #165: the Russian engine', 'TK7b #165: the Russian engine gets no letter'] },
  { name: 'M5 no lead silence', file: 'review.mjs', find: 'const CALL_LEAD_SILENCE_MS = 1000;', to: 'const CALL_LEAD_SILENCE_MS = 0;', red: ['TK7 #165: the call is ONE file', 'TK7 #165: a stereo voice'] },
  { name: 'M6 liveness by pid only', file: 'review.mjs', find: 'const answer = await postLocal(', to: 'const answer = { status: 200 } || postLocal(', red: ['TK7b #169: a live pid that does not answer'] },
  { name: 'M7 a half-written lock not read again', file: 'review.mjs', find: 'if (!lock) { await new Promise((r) => setTimeout(r, LOCK_REREAD_MS)); lock = readLock(f); }', to: '', red: ['TK7b #169: a lock caught half-written'] },
  { name: 'M8 another page\'s unreadable lock deleted', file: 'review.mjs', find: 'if (!lock || !lock.url) continue;', to: 'if (!lock || !lock.url) { if (!lock) rmSync(join(dir, f), { force: true }); continue; }', red: ['TK7b #169: a live pid that does not answer'] },
  { name: 'M9 --timeout refused at every door', file: 'review.mjs', find: 'if (at < 0 || !(Number(args[at + 1]) > 0) || NO_WINDOW_FLAGS.some(', to: "if (at < 0 || ['--no-open', '--no-serve', '--check'].some(", red: ['TK7b: --timeout is refused only where a page is shown'] },
  { name: 'M10 the notice branch counts pendingDocs', file: 'review.mjs', find: 'const restQ = batch ? forOwner()', to: 'const restQ = batch ? pendingDocs(root)', red: ['TK7b #163: the queue page counts what it SHOWS'] },
  { name: 'M11 the last answer ignores an unread notice', file: 'review.mjs', find: 'if (rest > 0 || restN > 0) {', to: 'if (rest > 0) {', red: ['TK7b #163, mirror'] },
  { name: 'M12 a cut format chunk read anyway', file: 'review.mjs', find: 'if (size < 16 || p + 24 > buf.length) return null;', to: '', red: ['TK7b #165: a WAV cut'] },
  { name: 'M13 an empty data chunk is a voice', file: 'review.mjs', find: 'return rate && pcm.length >= 2 ? { pcm, rate } : null;', to: 'return rate ? { pcm, rate } : null;', red: ['TK7b #165: a WAV cut'] },
  { name: 'M14 diacritics reach the engine', file: 'review.mjs', find: "const w = w0.normalize('NFD')", to: "const w = w0, unused = w0.normalize('NFD')", red: ['TK7b #165: the Russian engine gets no letter'] },
  { name: 'M15 the percent word does not agree', file: 'texts.mjs', find: "if (!written) return 'процентов';", to: "return 'процентов';", red: ['TK7b #165: the Russian engine gets no letter'] },
  { name: 'M16 spaced thousands read by groups', file: 'review.mjs', find: "if (typeof sp.number === 'function') s = s.replace(/(?<!", to: 'if (false) s = s.replace(/(?<!', red: ['TK7b #165: the Russian engine gets no letter'] },
  { name: 'M18 --list alone is a no-window door again', file: 'review.mjs', find: "const NO_WINDOW_FLAGS = ['--no-open', '--no-serve', '--check', '--call',", to: "const NO_WINDOW_FLAGS = ['--no-open', '--no-serve', '--check', '--list', '--call',", red: ['TK7 #169: --timeout'] },
  { name: 'M19 a plain space joins one group', file: 'review.mjs', find: '|(?: \\d{3}){2,})', to: '|(?: \\d{3})+)', red: ['TK7b #165: the Russian engine gets no letter'] },
  { name: 'M17 the voice lock never holds', file: 'review.mjs', find: 'return l; // a live call holds the voice', to: 'return null;', red: ['TK7b: one voice at a time'] },
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
console.log(bad ? `✖ ${bad} BAD` : '✅ each TK7 and TK7b change is red on its own selftest case only; the control copy is silent; the Russian call has no «вычитки»');
process.exit(bad ? 1 : 0);
