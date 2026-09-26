// tools/sandbox/probes/sc3-guard-mutants.mjs — a PROBE (not a polygon suite): the adversarial proof of guard 5m (2.8, epic SC, plans/123
// SC3; criterion 18 of plans/117). The guard the build runs (tools/lib/templates-own-scan.mjs) is run here over COPIES of dist:
//   control  — the dist as built → the shipped templates are silent under their own scan (0 lines);
//   M1       — the core's wrapped-parenthesis rule removed (the form of K-R4: «(KAIF 2.6; origin issue #52; the» ⏎ «…) and») → the
//              guard names the REAL templates' wrapped attributions — the build would refuse;
//   M2       — a template line claiming an old version planted in the bundle copy → named by the guard.
// Addressees are named before the run; an anchor that does not match exactly once is a refusal, never a green.
// usage: node tools/sandbox/probes/sc3-guard-mutants.mjs      (fresh dist first; no window, no sound)
// [TESTED: 2026-09-26 03:02:57 +03:00 · control 0 · M1 3 · M2 1; the first run (03:02:32) was BAD by MY predicate — it looked for
//  «(KAIF» in the 100-character excerpt the scan prints; the count is judged now and the lines are read; report testcases/reports/2026-09-26_sc3-templates-silent-under-own-scan.md]
import { readFileSync, writeFileSync, cpSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { templatesOwnScan } from '../../lib/templates-own-scan.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const version = JSON.parse(readFileSync(join(REPO, 'dist', 'kaif-manifest.json'), 'utf8')).version;
const root = mkdtempSync(join(tmpdir(), 'kaif-sc3-guard-'));
let bad = 0;
const copy = (name) => { const d = join(root, name); cpSync(join(REPO, 'dist'), d, { recursive: true }); return d; };
const mutate = (d, file, from, to) => {
  const p = join(d, file); const s = readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  const n = s.split(from).length - 1;
  if (n !== 1) return `anchor matched ${n} time(s)`;
  writeFileSync(p, s.replace(from, () => to)); return '';
};
const judge = (name, d, want) => {
  const r = templatesOwnScan(d, version);
  const ok = !r.failed && want(r.lines);
  if (!ok) bad++;
  console.log(`${ok ? 'OK ' : 'BAD'} ${name} — named ${r.lines.length}${r.failed ? ` · ${r.failed}` : ''}`);
  for (const l of r.lines.slice(0, 6)) console.log('      ' + l.slice(0, 160));
};
try {
  judge('control: the dist as built — the templates are silent', copy('control'), (l) => l.length === 0);
  const m1 = copy('m1');
  const e1 = mutate(m1, 'KAIF-CORE.mjs', "      if (isProse) judged = judged.replace(/^[^(]*?\\)/, '').replace(/(?<!\\])\\([^)]*$/, '');\n", '');
  if (e1) { bad++; console.log('BAD M1 — ' + e1); } else judge('M1 the wrapped-parenthesis rule removed — the real templates\' wrapped attributions are named', m1, (l) => l.length > 0);   // red = lines named; the scan prints each line's first 100 characters, so the count is judged and the lines are read
  const m2 = copy('m2');
  const e2 = mutate(m2, 'KAIF-CORE-BUNDLE.md', '\n> **FILE: `STATUS.md`**', '\n> **FILE: `NOTES-planted.md`**\n\n``````md\n# Planted\n\nThis project runs on KAIF 1.0.\n``````\n\n> **FILE: `STATUS.md`**');
  if (e2) { bad++; console.log('BAD M2 — ' + e2); } else judge('M2 a template line claiming an old version — named', m2, (l) => l.length === 1 && l[0].startsWith('NOTES-planted.md:3'));
} finally { rmSync(root, { recursive: true, force: true }); }
console.log(bad ? `\n❌ guard 5m proof FAILED: ${bad}` : '\n✅ guard 5m: silent on the built templates, names the wrapped attributions when the rule is gone and a planted old-version line');
process.exit(bad ? 1 : 0);
