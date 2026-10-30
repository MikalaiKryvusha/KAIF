// tools/sandbox/probes/tk7-contour-mutants.mjs — a PROBE (not a polygon suite): step TK7 of version KAIF 2.10 (epic TK; origin tickets
// #169 · #163 · #165) proved RED, one mutant per change, on a COPY of framework/tools/contour (TESTING_FRAMEWORK gate 5; EXP-0169 — the
// addressees are named BEFORE the run, and a mutant whose edit did not apply is a failure of the proof, not a green).
//   control: the copy as is — the shipped selftest has no red line;
//   M1 a live page of another document no longer refuses              → exactly «TK7 #169: a live page» and, since TK7b, «TK7b #169: a lock
//      caught half-written», since TK7d «TK7d #169: a live page slow to answer» (those cases expect the refusal too);
//   M2 --timeout on the owner's window legal again                     → exactly «TK7 #169: --timeout»;
//   M3 a notice read on the queue page ends it (the 2.9 I8 exit)       → exactly «TK7 #163»;
//   M4 Latin words reach the Russian engine as written                 → exactly «TK7 #165: the Russian engine» and, since TK7b, «TK7b #165:
//      the Russian engine gets no letter», since TK7c «TK7c #165» (those cases also feed Latin words);
//   M5 no lead silence in the call file                                → exactly «TK7 #165: the call is ONE file» and «TK7 #165: a stereo voice»
//      (both cases measure the silence before the beeps).
// Step TK7b (the judge's findings on TK7, researches/38 judge-tk7.md), one mutant per fix:
//   M6 liveness by pid only (the address not asked; since TK7c the check lives in pageAnswers) → exactly «TK7b #169: a live pid that does not answer»;
//   M7 a half-written lock is not read again                           → exactly «TK7b #169: a lock caught half-written»;
//   M8 another page's unreadable lock deleted (the TK7 checkLock path) → exactly «TK7b #169: a live pid that does not answer» (it asserts the file stays);
//   M9 --timeout refused at every door again (TK7's three exceptions) → exactly «TK7b: --timeout is refused only where a page is shown»;
//   M10 the notice branch counts every pending document (pendingDocs)  → exactly «TK7b #163: the queue page counts what it SHOWS»;
//   M11 the last answer ignores an unread notice on the page           → exactly «TK7b #163, mirror»;
//   M12 a cut format chunk read anyway (RangeError)                    → exactly «TK7b #165: a WAV cut»;
//   M13 a data chunk without samples taken as a voice                  → exactly «TK7b #165: a WAV cut»;
//   M14 the word left raw (no decomposition, no fold, no residue drop) → exactly «TK7b #165: the Russian engine gets no letter» and, since
//      TK7c, «TK7c #165» (its «Łódź» carries ó · ź);
//   M15 the percent word does not agree (texts.mjs)                     → exactly «TK7b #165: the Russian engine gets no letter»;
//   M16 «1 000 000» read group by group                                 → exactly «TK7b #165: the Russian engine gets no letter»;
//   M17 the voice lock never holds                                      → exactly «TK7b: one voice at a time»;
//   after the judge of TK7b (judge-tk7b.md, hunts 4–5):
//   M18 `--list` alone is a no-window door again (a page on a timer)    → exactly «TK7 #169: --timeout»;
//   M19 a plain space joins ONE group of thousands («#165 100%»)        → exactly «TK7b #165: the Russian engine gets no letter».
// Step TK7c (the judge's caveats on TK7b, researches/38 judge-tk7b.md, hunts 2 · 5 · 7):
//   M20 the own lock judged by its pid only (the address not asked)   → exactly «TK7c #169: the own lock of a live pid»;
//   M21 the own half-written lock not read again                       → exactly «TK7c #169: the own lock caught half-written»;
//   M22 an unreadable voice lock read as free                          → exactly «TK7c: an unreadable voice lock»;
//   M23 «ø ł ß æ» not folded                                           → exactly «TK7c #165»;
//   M24 thousands grouped by commas or dots read group by group        → exactly «TK7c #165».
// Step TK7d (the judge's caveats on TK7c, researches/38 judge-tk7c.md, hunts 2 · 3 · 4 · 6):
//   M25 a live page must answer HTTP again (the TK7b /ping, 1.5 s)    → exactly «TK7d #169: a live page slow to answer»;
//   M26 every reader deletes a broken lock (the TK7c checkLock)        → exactly «TK7d #169: the window recovery»;
//   M27 a future-dated unreadable voice lock holds                    → exactly «TK7c: an unreadable voice lock»;
//   M28 the Latin residue after NFKD and the fold reaches the engine   → exactly «TK7c #165».
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
  { name: 'M1 another live page does not refuse', file: 'review.mjs', find: "const other = await otherLivePage(root, batch ? '_queue' : basename(docPath));", to: 'const other = null;', red: ['TK7 #169: a live page', 'TK7b #169: a lock caught half-written', 'TK7d #169: a live page slow to answer', 'TK7z #169: a REAL page'] },
  { name: 'M2 --timeout on the window legal', file: 'review.mjs', find: 'if (at < 0 ||', to: 'if (true ||', red: ['TK7 #169: --timeout'] },
  { name: 'M3 a notice read ends the queue page', file: 'review.mjs', find: 'if (batch && (restQ > 0 || restN > 0)) {', to: 'if (false) {', red: ['TK7 #163'] },
  { name: 'M4 Latin reaches the engine', file: 'review.mjs', find: 'if (sp.letters && sp.translit) {', to: 'if (false) {', red: ['TK7 #165: the Russian engine', 'TK7b #165: the Russian engine gets no letter', 'TK7c #165', 'TK7e #165'] }, // TK7e: the Roman numeral unfolds to Latin
  { name: 'M5 no lead silence', file: 'review.mjs', find: 'const CALL_LEAD_SILENCE_MS = 1000;', to: 'const CALL_LEAD_SILENCE_MS = 0;', red: ['TK7 #165: the call is ONE file', 'TK7 #165: a stereo voice'] },
  { name: 'M6 liveness by pid only', file: 'review.mjs', find: 'if (await pageListens(lock)) return lock;', to: 'return lock;', red: ['TK7b #169: a live pid that does not answer', 'TK7e #169'] }, // TK7e: the strangers' live pid
  { name: 'M7 a half-written lock not read again', file: 'review.mjs', find: 'if (!lock) { await new Promise((r) => setTimeout(r, LOCK_REREAD_MS)); lock = readLock(f); }', to: '', red: ['TK7b #169: a lock caught half-written'] },
  { name: 'M8 another page\'s unreadable lock deleted', file: 'review.mjs', find: 'if (!lock || !lock.url) continue;', to: 'if (!lock || !lock.url) { if (!lock) rmSync(join(dir, f), { force: true }); continue; }', red: ['TK7b #169: a live pid that does not answer'] },
  { name: 'M9 --timeout refused at every door', file: 'review.mjs', find: 'if (at < 0 || !(Number(args[at + 1]) > 0) || NO_WINDOW_FLAGS.some(', to: "if (at < 0 || ['--no-open', '--no-serve', '--check'].some(", red: ['TK7b: --timeout is refused only where a page is shown'] },
  { name: 'M10 the notice branch counts pendingDocs', file: 'review.mjs', find: 'const restQ = batch ? forOwner()', to: 'const restQ = batch ? pendingDocs(root)', red: ['TK7b #163: the queue page counts what it SHOWS'] },
  { name: 'M11 the last answer ignores an unread notice', file: 'review.mjs', find: 'if (rest > 0 || restN > 0) {', to: 'if (rest > 0) {', red: ['TK7b #163, mirror'] },
  { name: 'M12 a cut format chunk read anyway', file: 'review.mjs', find: 'if (size < 16 || p + 24 > buf.length) return null;', to: '', red: ['TK7b #165: a WAV cut'] },
  { name: 'M13 an empty data chunk is a voice', file: 'review.mjs', find: 'return rate && pcm.length >= 2 ? { pcm, rate } : null;', to: 'return rate ? { pcm, rate } : null;', red: ['TK7b #165: a WAV cut'] },
  { name: 'M14 diacritics reach the engine', file: 'review.mjs', find: "const w = w0.normalize('NFKD')", to: "const w = w0, unused = w0.normalize('NFKD')", red: ['TK7b #165: the Russian engine gets no letter', 'TK7c #165', 'TK7e #165'] }, // TK7e: raw Latin words of the numerals case
  { name: 'M15 the percent word does not agree', file: 'texts.mjs', find: "if (!written) return 'процентов';", to: "return 'процентов';", red: ['TK7b #165: the Russian engine gets no letter'] },
  { name: 'M16 spaced thousands read by groups', file: 'review.mjs', find: "if (typeof sp.number === 'function') s = s.replace(/(?<!", to: 'if (false) s = s.replace(/(?<!', red: ['TK7b #165: the Russian engine gets no letter'] },
  { name: 'M18 --list alone is a no-window door again', file: 'review.mjs', find: "const NO_WINDOW_FLAGS = ['--no-open', '--no-serve', '--check', '--call',", to: "const NO_WINDOW_FLAGS = ['--no-open', '--no-serve', '--check', '--list', '--call',", red: ['TK7 #169: --timeout'] },
  { name: 'M19 a plain space joins one group', file: 'review.mjs', find: '|(?: \\d{3}){2,})', to: '|(?: \\d{3})+)', red: ['TK7b #165: the Russian engine gets no letter'] },
  { name: 'M17 the voice lock never holds', file: 'review.mjs', find: 'return l; // a live call holds the voice', to: 'return null;', red: ['TK7b: one voice at a time', 'TK7e: a fresh voice lock'] }, // TK7e: the readable lock 1 s ahead holds
  { name: 'M20 the own lock by pid only', file: 'review.mjs', find: 'return lock && !lock.stale && !(await pageListens(lock)) ? { ...lock, stale: true } : lock;', to: 'return lock;', red: ['TK7c #169: the own lock of a live pid', 'TK7e #169'] }, // TK7e: the strangers on the own lock
  { name: 'M21 the own half-written lock not read again', file: 'review.mjs', find: 'if (existsSync(p) && readJsonOr(p, null) === null) await new Promise((r) => setTimeout(r, LOCK_REREAD_MS));', to: '', red: ['TK7c #169: the own lock caught half-written'] },
  { name: 'M22 an unreadable voice lock is free', file: 'review.mjs', find: 'return age > -VOICE_LOCK_FUTURE_SLACK_MS && age < VOICE_LOCK_STALE_MS ? { pid: null, unreadable: true } : null;', to: 'return null;', red: ['TK7c: an unreadable voice lock', 'TK7e: a fresh voice lock'] }, // TK7e: the fresh unreadable lock 30 ms ahead
  { name: 'M23 no folding of ø ł ß æ', file: 'review.mjs', find: ".replace(LATIN_FOLD_RE, (c) => LATIN_FOLD[c])", to: '', red: ['TK7c #165', 'TK7e #165'] }, // TK7e: «ẞ» is folded by LATIN_FOLD
  { name: 'M24 comma and dot thousands by groups', file: 'review.mjs', find: "if (typeof sp.number === 'function') s = s.replace(/(?<![\\d.,])", to: 'if (false) s = s.replace(/(?<![\\d.,])', red: ['TK7c #165'] },
  { name: 'M25 a live page must answer HTTP again (the TK7b /ping)', file: 'review.mjs', find: 'sock.setTimeout(LIVENESS_TIMEOUT_MS, () => end(silentIsLive));', to: 'sock.setTimeout(LIVENESS_TIMEOUT_MS, () => end(false));', red: ['TK7d #169: a live page slow to answer'] },
  // session 96: M25's search line moved again — session 95 (judge s95, mutant SL) made silence a page only for the door (`silentIsLive`)
  // TK7e (session 93, judge TK7d): M25's search line moved with the identity check (a silent connected port is still live — its timeout is
  // the line now); the five below are red on exactly the TK7e cases
  { name: 'M29 a connected port is a page again (no identity asked)', file: 'review.mjs', find: 'if (!lock.closeToken) { end(true); return; }', to: 'end(true); return;', red: ['TK7e #169', 'TK7z #169: --close against a stranger'] }, // session 96: --close asks the same identity (TK7z)
  { name: 'M30 a readable voice lock dated a day ahead holds', file: 'review.mjs', find: '!(lockAge > -VOICE_LOCK_FUTURE_SLACK_MS && lockAge < VOICE_LOCK_STALE_MS)', to: '!(lockAge < VOICE_LOCK_STALE_MS)', red: ['TK7e: a fresh voice lock'] },
  { name: 'M31 no slack for the file clock (the EXP-0193 bug)', file: 'review.mjs', find: 'const VOICE_LOCK_FUTURE_SLACK_MS = 5000;', to: 'const VOICE_LOCK_FUTURE_SLACK_MS = 0;', red: ['TK7e: a fresh voice lock'], maybe: ['TK7b: one voice at a time'] },
  // session 96: M31 is red on «TK7b: one voice» too when that case writes the lock and reads it within the same millisecond — with no slack
  // `age > -0` is false at age 0 (the EXP-0193 bug itself); a slower machine crosses the millisecond, so it is a MAYBE, never required
  // (judge of epic PT, hunt 4: a required timing-bound red makes the probe flaky)
  { name: 'M32 non-ASCII numerals reach the engine', file: 'review.mjs', find: "if (typeof sp.number === 'function') s = sayFractions(s, sp);", to: '', red: ['TK7e #165', 'TK7z #165'] }, // session 96: the numerals go through sayFractions
  { name: 'M33 the capital sharp s not folded to SS', file: 'review.mjs', find: "'SS' }; // TK7e", to: "'S' }; // TK7e", red: ['TK7e #165'] },
  { name: 'M26 every reader deletes a broken lock', file: 'review.mjs', find: 'if (removeBroken) rmSync(p, { force: true });', to: 'rmSync(p, { force: true });', red: ['TK7d #169: the window recovery'] },
  { name: 'M27 a future-dated voice lock holds', file: 'review.mjs', find: 'return age > -VOICE_LOCK_FUTURE_SLACK_MS && age < VOICE_LOCK_STALE_MS', to: 'return age < VOICE_LOCK_STALE_MS', red: ['TK7c: an unreadable voice lock'] },
  { name: 'M28 the Latin residue reaches the engine', file: 'review.mjs', find: ".replace(LATIN_LEFT_RE, '')", to: '', red: ['TK7c #165'] },
];
let bad = 0;
const say = (good, line) => { if (!good) bad++; console.log((good ? 'OK  ' : 'BAD ') + line); };
const redLines = (dir) => {
  const r = spawnSync(process.execPath, [join(dir, 'review.mjs'), '--selftest'], { cwd: process.cwd(), env: quietEnv({ KAIF_VOICE_TOOL: '' }),
    encoding: 'utf8', timeout: RUN_TIMEOUT_MS, maxBuffer: 1 << 26 });
  const out = (r.stdout || '') + (r.stderr || '');
  return { died: !/selftest (green|RED)/i.test(out), red: out.split(/\r?\n/).filter((l) => /^\s*x /.test(l)).map((l) => l.trim()),
    tail: out.split(/\r?\n/).filter((l) => l.trim()).slice(-8), status: r.status, signal: r.signal }; // session 93: a DIED run shows why
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
// session 96: `node … M3 M14` runs only the named mutants (a DIED one repeated once — bugs/109 — without the seven-minute round)
const ONLY = process.argv.slice(2);
for (const m of MUTANTS.filter((x) => !ONLY.length || ONLY.includes(x.name.split(' ')[0]))) {
  const d = copy(); const p = join(d, m.file); const before = readFileSync(p, 'utf8');
  if (!before.includes(m.find)) { say(false, m.name + ': the edit did not apply'); rmSync(d, { recursive: true, force: true }); continue; }
  writeFileSync(p, before.replace(m.find, () => m.to));
  const r = redLines(d);
  const allowed = [...m.red, ...(m.maybe || [])]; // session 96: a `maybe` red may come or not; any other red is BAD
  say(!r.died && m.red.every((c) => r.red.some((l) => l.includes(c))) && r.red.every((l) => allowed.some((c) => l.includes(c))), m.name + ': ' + (r.died ? 'DIED' : r.red.length + ' red line(s)') + ' (expected exactly «' + m.red.join('» · «') + '»)');
  for (const l of r.red) console.log('    ' + l.slice(0, 200));
  if (r.died) for (const l of [`status ${r.status} signal ${r.signal}`, ...r.tail]) console.log('    | ' + l.slice(0, 240));
  rmSync(d, { recursive: true, force: true });
}
console.log(bad ? `✖ ${bad} BAD` : '✅ each TK7, TK7b, TK7c, TK7d and TK7e change is red on its own selftest case only; the control copy is silent; the Russian call has no «вычитки»');
process.exit(bad ? 1 : 0);
