// tools/sandbox/probes/ut5-check-lines-mutants.mjs — a PROBE (not a polygon suite): the mutants of guard 5u (2.9, epic UT, step UT5 —
// the reference knows every line `check` prints). The tracked text files of the WORKING TREE are copied into a temporary folder (binary
// assets skipped — guard 5u never reads them; new files not yet tracked are taken too), ONE break is made in the copy, `node tools/check-framework.mjs` runs there, and the lines
// «5u:» it prints must be EXACTLY the addressees named here before the run (EXP-0169: a red elsewhere, a missing red or a mutation that
// does not apply is BAD; other guards may complain in a copy without git — only «5u:» lines are judged).
//   C  — control: the copy as is → no «5u:» line.
//   M1 — a new warning in cmdCheck with no pair → one line naming it.
//   M2 — the word of an axis cut out of the `check` entry of the reference → one line naming the word.
//   M3 — a printed line reworded so its pair no longer matches → two lines: the line without a pair and the stale pair.
// Run it alone (≈ 10 s). usage: node tools/sandbox/probes/ut5-check-lines-mutants.mjs [--list] [--keep]
// [TESTED: 2026-10-16 14:15:01 → 14:15:22 +03:00, again on the scan with die() 14:30:14 → 14:30:35 · «3 mutants red exactly on their named addressees, control silent» — C 0 · M1 1 ·
//  M2 1 · M3 2; report testcases/reports/2026-10-16_ut5-check-lines-known.md]
import { cpSync, readFileSync, writeFileSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const CORE = 'framework/installer/KAIF-CORE.mjs';
const REF = 'framework/KAIF_REFERENCE.md';
const BINARY = /\.(png|jpe?g|gif|webp|pdf|mp4|ico|woff2?)$/i;
const RUN_TIMEOUT_MS = 300000;   // method constant: check-framework reads the whole payload; a hung run must not hang the probe
const MUTANTS = [
  { id: 'C', what: 'control — the copy as is', edits: [], expect: [] },
  { id: 'M1', what: 'a new ⚠ line in cmdCheck with no pair', expect: ['«⚠ a brand-new axis'],
    edits: [[CORE, '  warnSphereLibrary();\n  // NT3', '  warnSphereLibrary();\n  console.error(`⚠ a brand-new axis: ${KAIF_JSON}`);\n  // NT3']] }, // court RL 2.9, D-F1: the anchor moved with the NT3 block (75a0b93)
  { id: 'M2', what: 'the word «sphere with no library» cut out of the check entry', expect: ['«sphere with no library»'],
    edits: [[REF, 'a sphere with no library under', 'a sphere without its library under']] },
  { id: 'M3', what: 'the sphere warning reworded («has no library at» → «lacks a library at»)', expect: ['«⚠ sphere "', '«has no library at .kaif/spheres/»'],
    edits: [[CORE, '" has no library at .kaif/spheres/', '" lacks a library at .kaif/spheres/']] },
];
if (process.argv.includes('--list')) { for (const m of MUTANTS) console.log(`${m.id} — ${m.what} → ${m.expect.length} line(s)`); process.exit(0); }

const files = spawnSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: REPO, encoding: 'utf8' }).stdout.split('\0').filter((f) => f && !BINARY.test(f));
const ROOT = mkdtempSync(join(tmpdir(), 'kaif-ut5-mutants-'));
let bad = 0;
for (const m of MUTANTS) {
  const d = join(ROOT, m.id);
  for (const f of files) {
    try { mkdirSync(dirname(join(d, f)), { recursive: true }); cpSync(join(REPO, f), join(d, f)); } catch { /* deleted in the working tree */ }
  }
  let applied = true;
  for (const [f, from, to] of m.edits) {
    const p = join(d, f); const t = readFileSync(p, 'utf8');
    const n = t.split(from).length - 1;
    if (n !== 1) { applied = false; console.log(`BAD ${m.id}: the edit «${from.slice(0, 50)}» occurs ${n} time(s) in ${f}, expected 1`); break; }
    writeFileSync(p, t.replace(from, () => to));
  }
  if (!applied) { bad++; continue; }
  const r = spawnSync(process.execPath, [join(d, 'tools', 'check-framework.mjs')], { cwd: d, encoding: 'utf8', timeout: RUN_TIMEOUT_MS });
  const out = String(r.stdout || '') + String(r.stderr || '');
  const got = out.split(/\r?\n/).filter((l) => l.includes('5u:'));
  const ok = got.length === m.expect.length && m.expect.every((e) => got.some((l) => l.includes(e)));
  if (r.error) { bad++; console.log(`BAD ${m.id}: the run DIED (${r.error.message}) — a dead proof, not zero reds (EXP-0158)`); continue; }
  console.log(`${ok ? 'OK ' : 'BAD'} ${m.id} (${m.what}): ${got.length} line(s) «5u:», expected ${m.expect.length}`);
  if (!ok) { bad++; for (const l of got) console.log('    ' + l.trim().slice(0, 220)); }
}
if (process.argv.includes('--keep') || bad) console.log(`copies kept: ${ROOT}`); else rmSync(ROOT, { recursive: true, force: true });
console.log(bad ? `${bad} BAD` : `${MUTANTS.length - 1} mutants red exactly on their named addressees, control silent`);
process.exit(bad ? 1 : 0);
