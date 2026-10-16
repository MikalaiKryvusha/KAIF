// tools/sandbox/probes/ut4-red-on-prior.mjs — a PROBE (not a polygon suite): the cases of step UT4 (2.9, epic UT) against the build of
// a PRIOR revision. Suites s07 · s08 · s09 read `dist/` next to themselves and have no KAIF_DIST seam, so the text files of the working
// tree (tracked and new, binaries skipped) are copied into a temporary folder, its `dist/` is replaced by `git archive <rev> dist`, and the
// three suites run THERE. The failed asserts must be EXACTLY the addressees named here before the run (EXP-0169: a red elsewhere, a
// missing red or a suite that dies is BAD — EXP-0158); the s08 control (baseFound 2 — no second road) is green on both builds by
// construction and must stay green.
// usage: node tools/sandbox/probes/ut4-red-on-prior.mjs [<rev> = HEAD] [--keep]   ·   run it alone (≈ 1 min)
// [TESTED: 2026-10-16 14:26:29 → 14:27:00 +03:00 · rev c439b1f — s07 1 · s08 1 · s09 1 red, exactly the named addressees; the same
//  suites over the working-tree dist green; report testcases/reports/2026-10-16_ut5-check-lines-known.md]
import { cpSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const rev = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'HEAD';
const BINARY = /\.(png|jpe?g|gif|webp|pdf|mp4|ico|woff2?)$/i;
const SUITE_TIMEOUT_MS = 600000;   // method constant: one suite of the polygon takes up to a few minutes
const SUITES = [
  { file: 's07-translated.mjs', addressees: ['UT4 (GoD R3)'] },
  { file: 's08-l2-faces.mjs', addressees: ['UT4: kaif-remove'] },
  { file: 's09-l3-cli-safety.mjs', addressees: ['UT4: --source .kaif/install'] },
];
const ROOT = mkdtempSync(join(tmpdir(), 'kaif-ut4-prior-'));
const T = join(ROOT, 'tree');
const files = spawnSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: REPO, encoding: 'utf8' })
  .stdout.split('\0').filter((f) => f && !BINARY.test(f) && !f.startsWith('dist/'));
for (const f of files) { try { mkdirSync(dirname(join(T, f)), { recursive: true }); cpSync(join(REPO, f), join(T, f)); } catch { /* deleted in the working tree */ } }
const tar = join(T, 'dist.tar');
const a = spawnSync('git', ['archive', '-o', tar, rev, 'dist'], { cwd: REPO, encoding: 'utf8' });
if (a.status !== 0) { console.log(`BAD: git archive ${rev} dist failed — ${a.stderr}`); rmSync(ROOT, { recursive: true, force: true }); process.exit(1); }
// a RELATIVE name: GNU tar of Git Bash reads `C:\…` as a remote host (HOUSE_RULES §4, the `tar` row)
const x = spawnSync('tar', ['-xf', 'dist.tar'], { cwd: T, encoding: 'utf8' });
rmSync(tar, { force: true });
if (x.status !== 0) { console.log(`BAD: tar failed — ${x.stderr}`); rmSync(ROOT, { recursive: true, force: true }); process.exit(1); }
let bad = 0;
for (const s of SUITES) {
  const r = spawnSync(process.execPath, [join(T, 'tools', 'sandbox', s.file)], { cwd: T, encoding: 'utf8', timeout: SUITE_TIMEOUT_MS });
  const out = String(r.stdout || '') + String(r.stderr || '');
  if (r.error || !/ПРОВАЛОВ|все стражи зелёные/.test(out)) { bad++; console.log(`BAD ${s.file}: the suite DIED (${r.error ? r.error.message : 'no summary line'}) — a dead proof (EXP-0158)`); continue; }
  const failed = out.split(/\r?\n/).filter((l) => l.startsWith('❌') && !/ПРОВАЛОВ/.test(l));
  const ok = failed.length === s.addressees.length && s.addressees.every((ad) => failed.some((l) => l.includes(ad)));
  console.log(`${ok ? 'OK ' : 'BAD'} ${s.file} on dist of ${rev}: ${failed.length} red, expected ${s.addressees.length} (${s.addressees.join(' · ')})`);
  if (!ok) { bad++; for (const l of failed) console.log('    ' + l.slice(0, 200)); }
}
if (process.argv.includes('--keep') || bad) console.log(`tree kept: ${ROOT}`); else rmSync(ROOT, { recursive: true, force: true });
console.log(bad ? `${bad} BAD` : `the UT4 cases are red exactly on their addressees on the dist of ${rev}`);
process.exit(bad ? 1 : 0);
