// tools/sandbox/probes/ch1-report-mutants.mjs — a PROBE (not a polygon suite): the adversarial proof of the CH1 cases of suite s17
// (2.8, epic CH, criterion 10 of plans/117; origin issue #78 — the field report of an update is a KAIF signal, `check` names a 2.8+
// report that was not sent). Three mutants of the PREDICATES of the new check block are applied to a COPY of dist/ in the OS temp dir
// (never to the tree — EXP-0077); the suite runs against the copy through the KAIF_DIST seam, and its red asserts are compared with the
// addressees named here BEFORE the run (EXP-0059). A mutant whose anchor does not match EXACTLY ONCE is a refusal, never a green (bug 122);
// a suite that died in a setup step proves nothing and is BAD (budget-mutants, CK5.6).
// Run it after touching the field-report block of framework/installer/KAIF-CORE.mjs or s17:   node tools/sandbox/probes/ch1-report-mutants.mjs
// Needs a FRESH dist (rebuild first); runs s17 once per mutant — ALONE, not beside the polygon (origin bug 109). No window, no sound.
// [TESTED: 2026-09-25 23:52:09 +03:00 · three mutants red exactly on their named addressees (2 · 1 · 1), no death; report
//  testcases/reports/2026-09-25_ch1-field-report-delivered.md]
import { readFileSync, writeFileSync, cpSync, rmSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SUITE = join(REPO, 'tools', 'sandbox', 's17-report.mjs');
const MUTANTS = [
  { name: 'M1 the version gate dropped (a 2.7 report — local by the canon of its time — is named too)',
    from: '        if (!v || Number(v[1]) * 1000 + Number(v[2]) < FIELD_REPORT_SINCE[0] * 1000 + FIELD_REPORT_SINCE[1]) continue;',
    to: '        if (!v) continue;',
    expect: ['s17/CH1 (критерий 10)', 's17/CH1: после доставки check о полевом отчёте молчит'] },
  { name: 'M2 the tracking gate dropped (a detached deployment is told to send)',
    from: "    if (jm.tracking === 'origin' && existsSync(FIELD_REPORTS)) {",
    to: '    if (existsSync(FIELD_REPORTS)) {',
    expect: ['s17/SD: tracking: anonymous'] },
  { name: 'M3 the delivered branch dropped (a delivered report is still named)',
    from: "        else if (ds.state !== 'delivered')\n          console.error(`⚠ KAIF field report with no readable",
    to: "        else if (true)\n          console.error(`⚠ KAIF field report with no readable",
    expect: ['s17/CH1: после доставки check о полевом отчёте молчит'] },
];

const root = mkdtempSync(join(tmpdir(), 'kaif-ch1-mutants-'));
let bad = 0;
for (const m of MUTANTS) {
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  cpSync(join(REPO, 'dist'), dist, { recursive: true });
  const p = join(dist, 'KAIF-CORE.mjs');
  const src = readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  const hits = src.split(m.from).length - 1;
  if (hits !== 1) { bad++; console.log(`BAD ${m.name}\n    anchor matched ${hits} time(s) — the mutant did NOT apply`); continue; }
  writeFileSync(p, src.replace(m.from, m.to), 'utf8');
  let out = '';
  try { out = execFileSync(process.execPath, [SUITE], { cwd: REPO, env: { ...process.env, KAIF_DIST: dist }, stdio: 'pipe', maxBuffer: 1 << 26 }).toString(); }
  catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); }
  const red = out.split(/\r?\n/).filter((l) => l.startsWith('❌ s17/'));
  const died = out.includes('УСТАНОВОЧНЫЙ ШАГ УПАЛ') || !/=== 2\.8 CH1/.test(out);
  const verdict = !died && red.length === m.expect.length && m.expect.every((e) => red.some((r) => r.includes(e)));
  if (!verdict) bad++;
  console.log(`${verdict ? 'OK ' : 'BAD'} ${m.name}\n    red ${red.length} (named before the run: ${m.expect.length})${died ? ' — the suite DIED before the CH1 section: proves nothing' : ''}`);
  for (const r of red) console.log('      ' + r.slice(0, 170));
}
rmSync(root, { recursive: true, force: true });
console.log(bad ? `\n❌ mutant proof FAILED: ${bad} of ${MUTANTS.length}` : `\n✅ ${MUTANTS.length} mutants red exactly on their named addressees, and only on them`);
process.exit(bad ? 1 : 0);
